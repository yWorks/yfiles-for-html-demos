/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridConstraintProvider,
  GridInfo,
  GridSnapTypes,
  GridStyle,
  GridVisualCreator,
  HashMap,
  ICommand,
  InteriorStretchLabelModel,
  LabelSnapContext,
  License,
  PanelNodeStyle,
  Point,
  Rect,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * The available {@link GridSnapTypes} for this demo.
 * @type {IMap.<string,GridSnapTypes>}
 */
let gridSnapTypes = null

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

/**
 * The grid snapping combobox.
 * @type {HTMLElement}
 */
const gridSnapTypeComboBox = document.getElementById('gridSnapTypeComboBox')

/**
 * Bootstraps the demo.
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
 * Initializes snapping for labels and other graph items. The default snapping behavior can easily be enabled by
 * setting the according snap context. Those snap contexts provide many options to fine tune their behavior, in
 * this case we use it to make the items snap only to the given grid but not to other graph items. Please see the
 * documentation of {@link GraphSnapContext} and {@link LabelSnapContext} for more
 * information.
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
  gridSnapTypes = new HashMap()

  // Adds the grid snap types to a dictionary
  gridSnapTypes.set('None', GridSnapTypes.NONE)
  gridSnapTypes.set('Horizontal Lines', GridSnapTypes.HORIZONTAL_LINES)
  gridSnapTypes.set('Vertical Lines', GridSnapTypes.VERTICAL_LINES)
  gridSnapTypes.set('Lines', GridSnapTypes.LINES)
  gridSnapTypes.set('Points', GridSnapTypes.GRID_POINTS)
  gridSnapTypes.set('All', GridSnapTypes.ALL)

  // Assigns the grid snap types to the combo box
  if (gridSnapTypeComboBox !== null) {
    ;['None', 'Horizontal Lines', 'Vertical Lines', 'Lines', 'Points', 'All'].forEach(sample => {
      const option = document.createElement('option')
      option.text = sample
      option.value = sample
      gridSnapTypeComboBox.add(option)
    })
  }

  // Initializes GridInfo which holds the basic information about the grid
  // Sets horizontal and vertical space between grid lines
  gridInfo = new GridInfo()
  gridInfo.horizontalSpacing = 50
  gridInfo.verticalSpacing = 50

  // Creates grid visualization and adds it to graphComponent
  grid = new GridVisualCreator(gridInfo)
  grid.gridStyle = GridStyle.LINES

  graphComponent.backgroundGroup.addChild(grid)
  // Sets constraint provider to make nodes and bends snap to grid
  const graphSnapContext = graphComponent.inputMode.snapContext
  graphSnapContext.nodeGridConstraintProvider = new GridConstraintProvider(gridInfo)
  graphSnapContext.bendGridConstraintProvider = new GridConstraintProvider(gridInfo)

  gridSnapTypeComboBox.selectedIndex = 3
  updateSnapType()
}

/**
 * Sets the chosen grid snap type on the grid.
 */
function updateSnapType() {
  const selectedIndex = gridSnapTypeComboBox.selectedIndex
  const item = gridSnapTypeComboBox[selectedIndex].value
  let gridSnapType = GridSnapTypes.LINES
  if (gridSnapTypes.has(item)) {
    gridSnapType = gridSnapTypes.get(item)
  }

  const graphSnapContext = graphComponent.inputMode.snapContext
  graphSnapContext.gridSnapType = gridSnapType

  if (gridSnapType === GridSnapTypes.GRID_POINTS) {
    grid.gridStyle = GridStyle.DOTS
  } else {
    grid.gridStyle = GridStyle.LINES
  }
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
    wrapping: 'word_ellipsis'
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

  const group = graph.groupNodes({ children: [node1, node2, node3], labels: 'Group 1' })
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
}

// start tutorial
loadJson().then(run)
