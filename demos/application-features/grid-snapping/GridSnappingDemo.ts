/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  Color,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  Fill,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridConstraintProvider,
  GridInfo,
  GridRenderer,
  GridSnappableItems,
  GridSnapTypes,
  GridStyle,
  HierarchicalLayout,
  type IGraph,
  LayoutExecutor,
  License,
  RenderMode,
  Size,
  SnappableItems,
  Stroke
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { BrowserDetection, finishLoading } from '@yfiles/demo-app/demo-page'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent

/**
 * Visualizes the grid.
 */
let grid: GridRenderer = null!

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData

  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // then build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new HierarchicalLayout({ minimumLayerDistance: 70, nodeDistance: 70 })
  )
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  // enable snapping and create the grid
  initializeSnapping()
  initializeGrid()

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Initializes snapping for labels and other graph items. The default snapping behavior can easily
 * be enabled by setting the according snap context. Those snap contexts provide many options to
 * fine-tune their behavior; in this case, we use it to make the items snap only to the given grid
 * but not to other graph items. Please see the documentation of {@link GraphSnapContext} for more information.
 */
function initializeSnapping(): void {
  const geim = graphComponent.inputMode as GraphEditorInputMode
  geim.snapContext = new GraphSnapContext({
    // disable some default snapping behavior such that the graph items only snap to the grid and nowhere else
    snappableItems: SnappableItems.NONE,
    gridSnappableItems: GridSnappableItems.ALL
  })
}

/**
 * Initializes the grid snapping types combobox and the {@link GridInfo} which is the actual grid to
 * which items can snap.
 */
function initializeGrid(): void {
  // The snap types available in the UI
  const gridSnapTypes = {
    None: GridSnapTypes.NONE,
    'Horizontal Lines': GridSnapTypes.HORIZONTAL_LINES,
    'Vertical Lines': GridSnapTypes.VERTICAL_LINES,
    Lines: GridSnapTypes.LINES,
    Points: GridSnapTypes.GRID_POINTS,
    All: GridSnapTypes.ALL
  }

  // The grid appearances available in the UI
  const gridStyles = {
    Dots: GridStyle.DOTS,
    Lines: GridStyle.LINES,
    'Horizontal Lines': GridStyle.HORIZONTAL_LINES,
    'Vertical Lines': GridStyle.VERTICAL_LINES,
    Crosses: GridStyle.CROSSES
  }

  // The grid color available in the UI
  const gridColors = [
    'black',
    'gray',
    'lightgray',
    'darkorchid',
    'navy',
    'teal',
    'firebrick',
    'sienna'
  ]

  // Adds the grid render modes to a dictionary
  const gridRenderModes: Record<string, RenderMode> = {
    Canvas: RenderMode.CANVAS,
    Svg: RenderMode.SVG
  }
  if (BrowserDetection.webGL2) {
    gridRenderModes['WebGL2'] = RenderMode.WEBGL
  }

  // Creates a radio group for the snap types
  createRadioGroup(
    document.querySelector<HTMLInputElement>('#grid-snap-type-radio-group')!,
    'gridSnapType',
    gridSnapTypes,
    'Points',
    updateSnapType
  )

  createRadioGroup(
    document.querySelector<HTMLInputElement>('#grid-style-radio-group')!,
    'gridStyle',
    gridStyles,
    'Dots',
    updateGridStyle
  )

  createColorPicker(gridColors)

  // Creates a radio group for the render mode
  createRadioGroup(
    document.querySelector<HTMLInputElement>('#gridRenderModeRadioGroup')!,
    'gridRenderMode',
    gridRenderModes,
    'Canvas',
    updateRenderMode
  )

  // Initializes GridInfo which holds the basic information about the grid
  // Sets horizontal and vertical space between grid lines
  const gridInfo = new GridInfo()
  gridInfo.horizontalSpacing = 50
  gridInfo.verticalSpacing = 50

  // Creates grid visualization and adds it to graphComponent
  grid = new GridRenderer({ gridStyle: GridStyle.LINES, stroke: new Stroke(Color.GRAY, 1) })
  graphComponent.renderTree.createElement(graphComponent.renderTree.backgroundGroup, gridInfo, grid)
  // Sets constraint provider to make nodes and bends snap to grid
  const graphSnapContext = (graphComponent.inputMode as GraphEditorInputMode)
    .snapContext as GraphSnapContext
  graphSnapContext.nodeGridConstraintProvider = new GridConstraintProvider(gridInfo)
  graphSnapContext.bendGridConstraintProvider = new GridConstraintProvider(gridInfo)

  updateSnapType(GridSnapTypes.GRID_POINTS)
  updateGridStyle(GridStyle.DOTS)
  updateRenderMode(RenderMode.CANVAS)
  updateGridColor(Color.GRAY)
  updateGridThickness()
}

/**
 * Creates a radio group and populates it with values from the passed map.
 */
function createRadioGroup(
  containerElement: Element,
  groupName: string,
  items: Record<string, any>,
  checkedKey: string,
  callback: (arg0: any) => any
): void {
  const keys = Object.keys(items)
  for (const key of keys) {
    const label = document.createElement('label')

    const input = document.createElement('input')
    input.setAttribute('type', 'radio')
    input.setAttribute('name', groupName)
    if (key === checkedKey) {
      input.setAttribute('checked', '')
    }
    input.addEventListener(
      'change',
      function (value: any): void {
        callback(value)
      }.bind(null, items[key])
    )

    label.appendChild(input)
    label.appendChild(document.createTextNode(key))

    containerElement.appendChild(label)
    containerElement.appendChild(document.createElement('br'))
  }
}

/**
 * Populates the grid color picker with colors from the passed array/map.
 */
function createColorPicker(sortedGridColors: Array<string>): void {
  const gridColorPicker = document.querySelector('#grid-color-picker')!

  let xOffset = 0
  const size = 25
  for (const colorName of sortedGridColors) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', `${xOffset}px`)
    rect.setAttribute('width', `${size}px`)
    rect.setAttribute('height', `${size}px`)
    rect.setAttribute('fill', colorName)

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    title.textContent = colorName
    rect.appendChild(title)

    if (colorName === 'gray') {
      rect.classList.add('selected-color')
    }

    rect.addEventListener('click', (): void => {
      // Remove styling from previous selection
      gridColorPicker!
        .querySelectorAll('.selected-color')
        .forEach((rect: Element) => rect.classList.remove('selected-color'))
      rect.classList.add('selected-color')
      updateGridColor(Fill.from(colorName))
    })

    gridColorPicker!.appendChild(rect)
    xOffset += size + 2
  }
}

/**
 * Sets the chosen grid snap type on the grid.
 */
function updateSnapType(gridSnapType: GridSnapTypes): void {
  const graphSnapContext = (graphComponent.inputMode as GraphEditorInputMode)
    .snapContext as GraphSnapContext
  graphSnapContext.gridSnapType = gridSnapType
}

function updateGridStyle(gridStyle: GridStyle): void {
  grid.gridStyle = gridStyle
  updateGridThickness()
  graphComponent.invalidate()
}

/**
 * Sets the chosen render mode on the grid.
 */
function updateRenderMode(renderMode: RenderMode): void {
  grid.renderMode = renderMode
  graphComponent.invalidate()
}

/**
 * Updates the svg template.
 */
function updateSvgTemplate(): void {
  if (grid.renderMode === RenderMode.SVG) {
    grid.renderMode = RenderMode.CANVAS
    graphComponent.updateVisual()
    grid.renderMode = RenderMode.SVG
  }
}

/**
 * Sets the chosen color to the grid.
 */
function updateGridColor(fill: Fill): void {
  grid.stroke.fill = fill
  updateSvgTemplate()
  graphComponent.invalidate()
}

/**
 * Sets the chosen thickness to the grid.
 */
function updateGridThickness(): void {
  const thicknessSlider = document.querySelector<HTMLInputElement>('#thickness')
  if (thicknessSlider == null) {
    return
  }

  document.querySelector<HTMLInputElement>('#thickness-label')!.textContent = thicknessSlider.value
  // make sure the grid is at least 2 pixels thick when 'Dots' is selected
  const thickness: number = parseInt(thicknessSlider.value)
  grid.stroke.thickness = grid.gridStyle === GridStyle.DOTS ? Math.max(2, thickness) : thickness

  updateSvgTemplate()
  graphComponent.invalidate()
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph: IGraph): void {
  // set styles for this demo
  initDemoStyles(graph)

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI(): void {
  const gridButton = document.querySelector<HTMLInputElement>('#grid-button')!
  gridButton.addEventListener('click', () => {
    grid.visible = gridButton.checked
    graphComponent.invalidate() // triggers repaint
  })
  document
    .querySelector<HTMLInputElement>('#thickness')!
    .addEventListener('input', updateGridThickness)
}

run().then(finishLoading)
