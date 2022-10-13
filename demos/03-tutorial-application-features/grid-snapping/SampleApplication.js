/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  Fill,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridConstraintProvider,
  GridInfo,
  GridSnapTypes,
  GridStyle,
  GridVisualCreator,
  HashMap,
  ICanvasContext,
  ICommand,
  IGraph,
  LabelSnapContext,
  License,
  Point,
  Rect,
  RenderModes,
  Size,
  Stroke
} from 'yfiles'

import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { BrowserDetection } from '../../utils/BrowserDetection.js'

/** @type {GraphComponent} */
let graphComponent

/**
 * Visualizes the grid.
 * @type {GridVisualCreator}
 */
let grid = null

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // enable snapping and create the grid
  initializeSnapping()
  initializeGrid()

  // add a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Initializes snapping for labels and other graph items. The default snapping behavior can easily
 * be enabled by setting the according snap context. Those snap contexts provide many options to
 * fine tune their behavior, in this case we use it to make the items snap only to the given grid
 * but not to other graph items. Please see the documentation of {@link GraphSnapContext} and
 * {@link LabelSnapContext} for more information.
 */
function initializeSnapping() {
  const geim = graphComponent.inputMode
  const graphSnapContext = new GraphSnapContext({
    enabled: true,
    // disable some default snapping behavior such that the graph items only snap to the grid and nowhere else
    snapBendAdjacentSegments: false,
    snapBendsToSnapLines: false,
    snapNodesToSnapLines: false,
    snapOrthogonalMovement: false,
    snapPortAdjacentSegments: false,
    snapSegmentsToSnapLines: false
  })
  const labelSnapContext = new LabelSnapContext()
  geim.snapContext = graphSnapContext
  geim.labelSnapContext = labelSnapContext
}

/**
 * Initializes the grid snapping types combobox and the {@link GridInfo} which is the actual grid to
 * which items can snap.
 */
function initializeGrid() {
  const gridSnapTypes = new HashMap()

  // Adds the grid snap types to a dictionary
  gridSnapTypes.set('None', GridSnapTypes.NONE)
  gridSnapTypes.set('Horizontal Lines', GridSnapTypes.HORIZONTAL_LINES)
  gridSnapTypes.set('Vertical Lines', GridSnapTypes.VERTICAL_LINES)
  gridSnapTypes.set('Lines', GridSnapTypes.LINES)
  gridSnapTypes.set('Points', GridSnapTypes.GRID_POINTS)
  gridSnapTypes.set('All', GridSnapTypes.ALL)

  const gridStyles = new HashMap()
  gridStyles.set('Dots', GridStyle.DOTS)
  gridStyles.set('Lines', GridStyle.LINES)
  gridStyles.set('Horizontal Lines', GridStyle.HORIZONTAL_LINES)
  gridStyles.set('Vertical Lines', GridStyle.VERTICAL_LINES)
  gridStyles.set('Crosses', GridStyle.CROSSES)

  // Adds the grid colors to a dictionary
  const gridColors = [
    'Black',
    'Gray',
    'Light Gray',
    'Dark Orchid',
    'Navy',
    'Teal',
    'Forest Green',
    'Firebrick',
    'Sienna'
  ]

  // Adds the grid render modes to a dictionary
  const gridRenderModes = new HashMap()
  gridRenderModes.set('Canvas', RenderModes.CANVAS)
  gridRenderModes.set('Svg', RenderModes.SVG)
  // add WebGL only if the browser supports WebGL rendering
  if (BrowserDetection.webGL) {
    gridRenderModes.set('WebGL', RenderModes.WEB_GL)
  }

  // Creates a radio group for the snap types
  createRadioGroup(
    document.querySelector('#gridSnapTypeRadioGroup'),
    'gridSnapType',
    gridSnapTypes,
    'Points',
    updateSnapType
  )

  createRadioGroup(
    document.getElementById('gridStyleRadioGroup'),
    'gridStyle',
    gridStyles,
    'Dots',
    updateGridStyle
  )

  createColorPicker(gridColors)

  // Creates a radio group for the render mode
  createRadioGroup(
    document.getElementById('gridRenderModeRadioGroup'),
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
  grid = new GridVisualCreator(gridInfo)
  grid.gridStyle = GridStyle.LINES
  grid.stroke = new Stroke(Fill.GRAY, 1)
  graphComponent.backgroundGroup.addChild(grid)
  // Sets constraint provider to make nodes and bends snap to grid
  const graphSnapContext = graphComponent.inputMode.snapContext
  graphSnapContext.nodeGridConstraintProvider = new GridConstraintProvider(gridInfo)
  graphSnapContext.bendGridConstraintProvider = new GridConstraintProvider(gridInfo)

  updateSnapType(GridSnapTypes.GRID_POINTS)
  updateGridStyle(GridStyle.DOTS)
  updateRenderMode(RenderModes.CANVAS)
  updateGridColor(Fill.GRAY)
  updateGridThickness()
}

/**
 * Creates a radio group and populates it with values from the passed map.
 * @param {!Element} containerElement
 * @param {!string} groupName
 * @param {!HashMap.<string,*>} map
 * @param {!string} checkedKey
 * @param {!function} callback
 */
function createRadioGroup(containerElement, groupName, map, checkedKey, callback) {
  for (const key of map.keys) {
    const label = document.createElement('label')

    const input = document.createElement('input')
    input.setAttribute('type', 'radio')
    input.setAttribute('name', groupName)
    if (key === checkedKey) {
      input.setAttribute('checked', '')
    }
    input.addEventListener(
      'change',
      function (value) {
        callback(value)
      }.bind(null, map.get(key))
    )

    label.appendChild(input)
    label.appendChild(document.createTextNode(key))

    containerElement.appendChild(label)
    containerElement.appendChild(document.createElement('br'))
  }
}

/**
 * Populates the grid color picker with colors from the passed array/map.
 * @param {!Array.<string>} sortedGridColors
 */
function createColorPicker(sortedGridColors) {
  const gridColorPicker = document.getElementById('gridColorPicker')

  let xOffset = 0
  const size = 25
  for (const colorName of sortedGridColors) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', `${xOffset}px`)
    rect.setAttribute('width', `${size}px`)
    rect.setAttribute('height', `${size}px`)

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    title.textContent = colorName
    rect.appendChild(title)

    if (colorName === 'Gray') {
      addClass(rect, 'selectedColor')
    }

    Fill.from(colorName.replace(' ', '-')).applyTo(rect, ICanvasContext.DEFAULT)

    rect.addEventListener(
      'click',
      function (fill, rect) {
        // Remove styling from previous selection
        gridColorPicker
          .querySelectorAll('.selectedColor')
          .forEach(rect => removeClass(rect, 'selectedColor'))
        addClass(rect, 'selectedColor')
        updateGridColor(fill)
      }.bind(null, Fill.from(colorName.replace(' ', '-')), rect)
    )

    gridColorPicker.appendChild(rect)
    xOffset += size + 2
  }
}

/**
 * Sets the chosen grid snap type on the grid.
 * @param {!GridSnapTypes} gridSnapType
 */
function updateSnapType(gridSnapType) {
  const graphSnapContext = graphComponent.inputMode.snapContext
  graphSnapContext.gridSnapType = gridSnapType
}

/**
 * @param {!GridStyle} gridStyle
 */
function updateGridStyle(gridStyle) {
  grid.gridStyle = gridStyle
  updateGridThickness()
  graphComponent.invalidate()
}

/**
 * Sets the chosen render mode on the grid.
 * @param {!RenderModes} renderMode
 */
function updateRenderMode(renderMode) {
  grid.renderMode = renderMode
  graphComponent.invalidate()
}

/**
 * Updates the svg template.
 */
function updateSvgTemplate() {
  if (grid.renderMode === RenderModes.SVG) {
    grid.renderMode = RenderModes.CANVAS
    graphComponent.updateVisual()
    grid.renderMode = RenderModes.SVG
  }
}

/**
 * Sets the chosen color to the grid.
 * @param {!Fill} fill
 */
function updateGridColor(fill) {
  grid.stroke.fill = fill
  updateSvgTemplate()
  graphComponent.invalidate()
}

/**
 * Sets the chosen thickness to the grid.
 */
function updateGridThickness() {
  const thicknessSlider = document.querySelector('#thickness')
  if (thicknessSlider == null) {
    return
  }

  document.querySelector('#thicknessLabel').textContent = thicknessSlider.value
  // make sure the grid is at least 2 pixels thick when 'Dots' is selected
  const thickness = parseInt(thicknessSlider.value)
  grid.stroke.thickness = grid.gridStyle === GridStyle.DOTS ? Math.max(2, thickness) : thickness

  updateSvgTemplate()
  graphComponent.invalidate()
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param {!IGraph} graph The graph.
 */
function initTutorialDefaults(graph) {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Creates a simple sample graph.
 */
function createGraph() {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt([150, 50])
  const node2 = graph.createNodeAt([200, 150])
  const node3 = graph.createNodeAt([100, 150])
  const node4 = graph.createNodeAt([50, 300])
  const node5 = graph.createNodeAt([150, 300])

  const group = graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })
  graph.setNodeLayout(group, new Rect(50, 0, 200, 200))

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort, new Point(163.33, 70))
  graph.setPortLocation(edge1.targetPort, new Point(200, 130))
  graph.setPortLocation(edge2.sourcePort, new Point(136.67, 70))
  graph.setPortLocation(edge2.targetPort, new Point(100, 130))
  graph.setPortLocation(edge3.sourcePort, new Point(90, 170))
  graph.setPortLocation(edge3.targetPort, new Point(50, 280))
  graph.setPortLocation(edge4.sourcePort, new Point(110, 170))
  graph.setPortLocation(edge4.targetPort, new Point(140, 280))
  graph.setPortLocation(edge5.sourcePort, new Point(150, 70))
  graph.setPortLocation(edge5.targetPort, new Point(150, 280))
  graph.addBends(edge1, [new Point(163.33, 100), new Point(200, 100)])
  graph.addBends(edge2, [new Point(136.67, 100), new Point(100, 100)])
  graph.addBends(edge3, [new Point(90, 250), new Point(50, 250)])
  graph.addBends(edge4, [new Point(110, 250), new Point(140, 250)])

  graphComponent.fitGraphBounds()
  graph.undoEngine.clear()
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)

  bindAction('#grid-button', () => {
    grid.visible = document.querySelector('#grid-button').checked
    graphComponent.invalidate() // triggers repaint
  })
  bindChangeListener('#thickness', updateGridThickness)
}

// noinspection JSIgnoredPromiseFromCall
run()
