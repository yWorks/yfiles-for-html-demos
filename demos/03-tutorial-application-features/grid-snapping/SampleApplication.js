/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
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
  InteriorStretchLabelModel,
  LabelSnapContext,
  License,
  PanelNodeStyle,
  Point,
  Rect,
  RenderModes,
  ShapeNodeStyle,
  Size,
  Stroke
} from 'yfiles'

import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { webGlSupported } from '../../utils/Workarounds.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Holds information about the grid spacing.
 * @type {GridInfo}
 */
let gridInfo = null

/**
 * Visualizes the grid.
 * @type {GridVisualCreator}
 */
let grid = null

const gridSnapTypeRadioGroup = document.getElementById('gridSnapTypeRadioGroup')
const gridStyleRadioGroup = document.getElementById('gridStyleRadioGroup')
const gridRenderModeRadioGroup = document.getElementById('gridRenderModeRadioGroup')
const gridColorPicker = document.getElementById('gridColorPicker')
const thicknessSlider = document.getElementById('thickness')
/**
 * Bootstraps the demo.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults()

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
    // disable some of the default snapping behavior such that the graph items only snap to the grid and nowhere else
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

  const gridColors = new HashMap()

  // Adds the grid colors to a dictionary
  const sortedGridColors = [
    'Black',
    'Gray',
    'Light Gray',
    'Pink',
    'Orange',
    'Yellow',
    'Green',
    'Blue',
    'Violet'
  ]
  gridColors.set('Black', Fill.BLACK)
  gridColors.set('Gray', Fill.GRAY)
  gridColors.set('Light Gray', Fill.LIGHT_GRAY)
  gridColors.set('Pink', Fill.PINK)
  gridColors.set('Orange', Fill.ORANGE)
  gridColors.set('Yellow', Fill.YELLOW)
  gridColors.set('Green', Fill.LIGHT_GREEN)
  gridColors.set('Blue', Fill.LIGHT_BLUE)
  gridColors.set('Violet', Fill.VIOLET)

  const gridRenderModes = new HashMap()

  // Adds the grid render modes to a dictionary
  gridRenderModes.set('Canvas', RenderModes.CANVAS)
  gridRenderModes.set('Svg', RenderModes.SVG)
  // add WebGL only if the browser supports WebGL rendering
  if (webGlSupported) {
    gridRenderModes.set('Web GL', RenderModes.WEB_GL)
  }

  // creates a radio group for the snap types
  if (gridSnapTypeRadioGroup !== null) {
    createRadioGroup(
      gridSnapTypeRadioGroup,
      'gridSnapType',
      gridSnapTypes,
      'Points',
      updateSnapType
    )
  }

  if (gridStyleRadioGroup !== null) {
    createRadioGroup(gridStyleRadioGroup, 'gridStyle', gridStyles, 'Dots', updateGridStyle)
  }

  // populates the color picker
  if (gridColorPicker !== null) {
    createColorPicker(sortedGridColors, gridColors)
  }

  // creates a radio group for the render mode
  if (gridRenderModeRadioGroup !== null) {
    createRadioGroup(
      gridRenderModeRadioGroup,
      'gridRenderMode',
      gridRenderModes,
      'Canvas',
      updateRenderMode
    )
  }

  // Initializes GridInfo which holds the basic information about the grid
  // Sets horizontal and vertical space between grid lines
  gridInfo = new GridInfo()
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
 * @param {!HashMap.<string,Fill>} gridColors
 */
function createColorPicker(sortedGridColors, gridColors) {
  let xOffset = 0
  const size = 25
  for (const color of sortedGridColors) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', `${xOffset}px`)
    rect.setAttribute('width', `${size}px`)
    rect.setAttribute('height', `${size}px`)

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    title.textContent = color
    rect.appendChild(title)

    if (color === 'Gray') {
      addClass(rect, 'selectedColor')
    }

    gridColors.get(color).applyTo(rect, ICanvasContext.DEFAULT)

    rect.addEventListener(
      'click',
      function (fill, rect) {
        const selectedColors = Array.from(gridColorPicker.querySelectorAll('.selectedColor'))
        selectedColors.forEach(rect => removeClass(rect, 'selectedColor'))
        addClass(rect, 'selectedColor')
        updateGridColor(fill)
      }.bind(null, gridColors.get(color), rect)
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
  let thickness = parseInt(thicknessSlider.value)

  if (grid.gridStyle === GridStyle.DOTS) {
    // make sure the grid is at least 2 pixels thick when 'Dots' is selected
    thickness = Math.max(2, thickness)
  }

  document.getElementById('thickness-label').textContent = thicknessSlider.value
  grid.stroke.thickness = thickness
  updateSvgTemplate()
  graphComponent.invalidate()
}

/**
 * Initializes the defaults for the styles in this tutorial.
 */
function initTutorialDefaults() {
  const graph = graphComponent.graph

  // configure defaults normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  // configure defaults group nodes and their labels
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right'
  })
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
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
  bindChangeListener("select[data-command='GridSnapTypeChanged']", updateSnapType)
  bindChangeListener("select[data-command='GridRenderModeChanged']", updateRenderMode)
  bindChangeListener("select[data-command='GridColorChanged']", updateGridColor)
  bindChangeListener('#thickness', updateGridThickness)
}

// start tutorial
loadJson().then(checkLicense).then(run)
