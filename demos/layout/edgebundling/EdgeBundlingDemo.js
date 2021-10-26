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
  BalloonLayout,
  CircularLayout,
  CircularLayoutData,
  CircularLayoutStyle,
  ConnectedComponents,
  Cursor,
  CurveFittingLayoutStage,
  DefaultNodePlacer,
  EdgeBundleDescriptor,
  EdgeBundlingStage,
  EdgeBundlingStageData,
  FreeNodeLabelModel,
  GenericLabeling,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  LayoutData,
  License,
  Mapper,
  OrganicEdgeRouter,
  Point,
  PopulateItemContextMenuEventArgs,
  RadialLayout,
  RadialLayoutData,
  Rect,
  ResultItemMapping,
  StraightLineEdgeRouter,
  TreeLayout,
  TreeLayoutEdgeRoutingStyle,
  TreeReductionStage,
  TreeReductionStageData
} from 'yfiles'

import { DemoEdgeStyle, DemoNodeStyle, HighlightManager } from './DemoStyles.js'
import ContextMenu from '../../utils/ContextMenu.js'
import {
  addClass,
  addNavigationButtons,
  bindChangeListener,
  bindCommand,
  checkLicense,
  removeClass,
  showApp,
  showLoadingIndicator
} from '../../resources/demo-app.js'
import BalloonSampleData from './resources/balloon.js'
import BccCircularSampleData from './resources/bccCircular.js'
import CircularSampleData from './resources/circular.js'
import RadialSampleData from './resources/radial.js'
import TreeSampleData from './resources/tree.js'
import RoutingSampleData from './resources/routing.js'
import loadJson from '../../resources/load-json.js'

/**
 * @typedef {Object} NodeData
 * @property {number} id
 * @property {object} layout
 */

/**
 * @typedef {Object} GraphData
 * @property {Array.<object>} nodes
 * @property {Array.<object>} edges
 */

/**
 * The GraphComponent
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * Holds the component index for each node.
 * It is necessary for determining in circular layouts the circle id in graphs with more than one
 * connected components.
 * @type {ResultItemMapping.<INode,number>}
 */
let componentsMap = new ResultItemMapping()

/**
 * Holds the edge bundle descriptors for each edge.
 */
const bundleDescriptorMap = new Mapper()

/**
 * Holds whether an edge has to be bundled or not.
 */
const bundlesMap = new Mapper()

// inits the UI's elements
const samplesComboBox = document.getElementById('sample-combo-box')
addNavigationButtons(samplesComboBox)
const bundlingStrengthSlider = document.getElementById('bundling-strength-slider')
const bundlingStrengthLabel = document.getElementById('bundling-strength-label')

/**
 * @param {!object} licenseData
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  // create the input mode
  createInputMode()

  // set the default styles
  initializeGraph()

  // load the sample graph and run the layout
  await onSampleChanged()

  // wire up the UI
  registerCommands()

  // initialize the demo
  showApp(graphComponent)
}

/**
 * Creates the input mode.
 */
function createInputMode() {
  const mode = new GraphEditorInputMode({
    focusableItems: GraphItemTypes.NONE,
    showHandleItems: GraphItemTypes.NONE,
    // disable node moving
    movableItems: GraphItemTypes.NONE,
    clickHitTestOrder: [GraphItemTypes.NODE, GraphItemTypes.EDGE]
  })

  // disallow interactive bend creation
  mode.allowCreateBend = false

  // when an item is deleted, calculate the new components and apply the layout
  mode.addDeletedSelectionListener(async () => {
    calculateConnectedComponents()
    await applyLayout()
  })

  // when an edge is created, calculate the new components and apply the layout
  mode.createEdgeInputMode.addEdgeCreatedListener(async () => {
    calculateConnectedComponents()
    await applyLayout()
  })

  // when a node is created, calculate the new components
  mode.addNodeCreatedListener(() => {
    calculateConnectedComponents()
  })

  // when a drag operation has finished, apply a layout
  mode.moveInputMode.addDragFinishedListener(async () => {
    await applyLayout()
  })

  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  mode.itemHoverInputMode.discardInvalidItems = false
  mode.itemHoverInputMode.hoverCursor = Cursor.POINTER
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    const item = args.item
    const highlightIndicatorManager = graphComponent.highlightIndicatorManager
    highlightIndicatorManager.clearHighlights()
    if (item) {
      highlightIndicatorManager.addHighlight(item)
      if (INode.isInstance(item)) {
        graphComponent.graph.edgesAt(item).forEach(edge => {
          highlightIndicatorManager.addHighlight(edge)
        })
      } else if (IEdge.isInstance(item)) {
        highlightIndicatorManager.addHighlight(item.sourceNode)
        highlightIndicatorManager.addHighlight(item.targetNode)
      }
    }
  })

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (mode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  mode.addPopulateItemContextMenuListener((sender, args) => populateContextMenu(contextMenu, args))

  // Add a listener that closes the menu when the input mode requests this
  mode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    mode.contextMenuInputMode.menuClosed()
  }

  graphComponent.inputMode = mode
}

/**
 * Populates the context menu based on the item the mouse hovers over
 * @param {!ContextMenu} contextMenu The context menu.
 * @param {!PopulateItemContextMenuEventArgs.<IModelItem>} args The event args.
 */
function populateContextMenu(contextMenu, args) {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in this cases.
  args.showMenu = true

  contextMenu.clearItems()

  // In this demo, we use the following custom hit testing to prefer nodes.
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

  // Check whether an edge or a node was hit
  const hit = hits.firstOrDefault()

  if (IEdge.isInstance(hit) || INode.isInstance(hit)) {
    let selectedEdges

    if (IEdge.isInstance(hit)) {
      // update the hit edge and all other possible selected edges
      selectedEdges = graphComponent.selection.selectedEdges.toArray()
      selectedEdges.push(hit)
    } else {
      // update the hit node and all other possible selected nodes and update their adjacent edges
      const selectedNodes = graphComponent.selection.selectedNodes.toArray()
      selectedNodes.push(hit)

      selectedEdges = []
      selectedNodes.forEach(node => {
        if (graphComponent.graph.degree(node) > 0) {
          selectedEdges = selectedEdges.concat(graphComponent.graph.edgesAt(node).toArray())
        }
      })
    }

    const result = countBundledEdges(selectedEdges)
    if (result.countUnbundled > 0) {
      const text = IEdge.isInstance(hit)
        ? 'Bundle Selected Edges'
        : 'Bundle Edges At Selected Nodes'
      contextMenu.addMenuItem(text, () => updateBundlingForSelectedEdges(selectedEdges, true))
    }
    if (result.countBundled > 0) {
      const text = IEdge.isInstance(hit)
        ? 'Un-bundle Selected Edges'
        : 'Un-bundle Edges At Selected Nodes'
      contextMenu.addMenuItem(text, () => updateBundlingForSelectedEdges(selectedEdges, false))
    }
  } else {
    args.showMenu = false
  }
}

/**
 * Counts the number of bundled and unbundled edges of a given selection.
 * @param {!Array.<IEdge>} edges The selected edges
 * @returns {!object} The number of bundled and unbundled edges as an object
 *
 */
function countBundledEdges(edges) {
  let countBundled = 0
  let countUnbundled = 0

  edges.forEach(edge => {
    if (bundlesMap.get(edge)) {
      countBundled++
    }

    if (!bundlesMap.get(edge)) {
      countUnbundled++
    }
  })
  return {
    countBundled,
    countUnbundled
  }
}

/**
 * Enables or disables the edge bundling for the given edge.
 * @param {!Array.<IEdge>} edges The edges to update
 * @param {boolean} isBundled True if the edges should be bundled, false otherwise
 * @returns {!Promise}
 */
async function updateBundlingForSelectedEdges(edges, isBundled) {
  edges.forEach(edge => {
    bundlesMap.set(edge, isBundled)
    if (!isBundled) {
      bundleDescriptorMap.set(
        edge,
        new EdgeBundleDescriptor({
          bundled: isBundled
        })
      )
    } else {
      // if null is set, the default descriptor will be used
      bundleDescriptorMap.set(edge, null)
    }
  })
  await applyLayout()
}

/**
 * Sets the default styles for the graph elements and initializes the highlight.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // set the node and edge default styles
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.edgeDefaults.style = new DemoEdgeStyle()
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()

  // hide the selection decorator
  graph.decorator.nodeDecorator.selectionDecorator.hideImplementation()
  graph.decorator.edgeDecorator.selectionDecorator.hideImplementation()

  // initialize the edge highlight manager
  graphComponent.highlightIndicatorManager = new HighlightManager(graphComponent)

  // when a node is selected, select also the adjacent edges
  graphComponent.selection.addItemSelectionChangedListener((sender, args) => {
    const item = args.item
    const selection = graphComponent.selection
    if (INode.isInstance(item) && args.itemSelected) {
      selection.setSelected(item, true)
      graph.edgesAt(item).forEach(edge => {
        selection.setSelected(edge, true)
      })
    }
  })
}

/**
 * Called when the selected item in the graph chooser combo box has changed.
 * @returns {!Promise}
 */
async function onSampleChanged() {
  let sampleData
  switch (samplesComboBox.selectedIndex) {
    default:
    case LayoutAlgorithm.SINGLE_CYCLE:
      sampleData = CircularSampleData
      break
    case LayoutAlgorithm.CIRCULAR:
      sampleData = BccCircularSampleData
      break
    case LayoutAlgorithm.RADIAL:
      sampleData = RadialSampleData
      break
    case LayoutAlgorithm.BALLOON:
      sampleData = BalloonSampleData
      break
    case LayoutAlgorithm.TREE:
      sampleData = TreeSampleData
      break
    case LayoutAlgorithm.ROUTER:
      sampleData = RoutingSampleData
  }
  // clear the current graph
  graphComponent.graph.clear()
  // set the UI busy
  await setBusy(true)

  // load the graph
  await loadGraph(graphComponent.graph, sampleData)
  await runLayout()
}

/**
 * Parses the JSON and creates the graph elements.
 * @param {!IGraph} graph The graph to populate with the items.
 * @param {!GraphData} graphData The JSON data
 * @returns {!Promise}
 */
async function loadGraph(graph, graphData) {
  await setBusy(true)

  graph.clear()

  const builder = new GraphBuilder({
    graph: graph,
    nodes: [
      {
        data: graphData.nodes,
        id: 'id',
        layout: data => {
          const layout = data.layout
          return new Rect(
            layout.x,
            layout.y,
            layout.w || graph.nodeDefaults.size.width,
            layout.h || graph.nodeDefaults.size.height
          )
        },
        labels: ['name']
      }
    ],
    edges: [
      {
        data: graphData.edges,
        sourceId: 'source',
        targetId: 'target'
      }
    ]
  })
  graph = builder.buildGraph()

  graph.edges.forEach(edge => {
    bundlesMap.set(edge, true)
  })

  // calculate the connected components of the new graph
  calculateConnectedComponents()
}

/**
 * Runs the layout.
 */
async function runLayout() {
  const selectedIndex = samplesComboBox.selectedIndex
  let layoutAlgorithm
  let layoutData
  switch (selectedIndex) {
    default:
    case 0:
    case 1: {
      layoutAlgorithm = createCircularLayout(selectedIndex === 0)
      layoutData = new CircularLayoutData({
        circleIds: new Mapper(),
        edgeBundleDescriptors: bundleDescriptorMap
      })
      break
    }
    case 2: {
      layoutAlgorithm = createRadialLayout()
      layoutData = new RadialLayoutData({
        edgeBundleDescriptors: bundleDescriptorMap
      })
      break
    }
    case 3:
    case 4: {
      layoutAlgorithm = selectedIndex === 3 ? createBalloonLayout() : createTreeLayout()
      layoutData = new TreeReductionStageData({
        edgeBundleDescriptors: bundleDescriptorMap
      })
      break
    }
    case 5: {
      layoutAlgorithm = createEdgeBundlingStage()
      layoutData = new EdgeBundlingStageData({
        edgeBundleDescriptors: bundleDescriptorMap
      })
    }
  }

  // to apply bezier fitting, append the CurveFittingLayoutStage to the layout algorithm
  // we could also enable the bezier fitting from the edge bundling descriptor but, we would like for this demo to
  // have small error
  layoutAlgorithm = new CurveFittingLayoutStage({ coreLayout: layoutAlgorithm, maximumError: 1 })

  // run the layout
  await graphComponent.morphLayout(layoutAlgorithm, '0.0s', layoutData)
  await setBusy(false)
  // if the selected algorithm is circular, change the node style to circular sectors
  if (
    selectedIndex === LayoutAlgorithm.SINGLE_CYCLE ||
    selectedIndex === LayoutAlgorithm.CIRCULAR
  ) {
    updateNodeInformation(layoutData)
  }
}

/**
 * Creates and configures the circular layout algorithm.
 * @param {boolean} singleCycle True if the layout should be single-cycle, false otherwise
 * @returns {!CircularLayout} The configured circular layout algorithm
 */
function createCircularLayout(singleCycle) {
  const circularLayout = new CircularLayout({
    labelingEnabled: true
  })
  if (singleCycle) {
    circularLayout.layoutStyle = CircularLayoutStyle.SINGLE_CYCLE
    circularLayout.singleCycleLayout.minimumNodeDistance = 0
  }
  configureEdgeBundling(circularLayout)
  return circularLayout
}

/**
 * Creates and configures the radial layout algorithm.
 * @returns {!RadialLayout} The configured radial layout algorithm
 */
function createRadialLayout() {
  const radialLayout = new RadialLayout({
    labelingEnabled: true
  })
  configureEdgeBundling(radialLayout)
  return radialLayout
}

/**
 * Creates and configures the balloon layout algorithm.
 * @returns {!BalloonLayout} The configured balloon layout algorithm
 */
function createBalloonLayout() {
  const balloonLayout = new BalloonLayout({
    integratedEdgeLabeling: true,
    integratedNodeLabeling: true
  })

  const treeReductionStage = createTreeReductionStage()
  configureEdgeBundling(treeReductionStage)
  balloonLayout.prependStage(treeReductionStage)
  return balloonLayout
}

/**
 * Creates and configures the tree layout algorithm.
 * @returns {!TreeLayout} The configured tree layout algorithm
 */
function createTreeLayout() {
  const treeLayout = new TreeLayout({
    considerNodeLabels: true,
    integratedEdgeLabeling: true
  })
  treeLayout.defaultNodePlacer.routingStyle = TreeLayoutEdgeRoutingStyle.STRAIGHT

  const treeReductionStage = createTreeReductionStage()
  configureEdgeBundling(treeReductionStage)
  treeLayout.prependStage(treeReductionStage)
  return treeLayout
}

/**
 * Creates and configures the tree reduction stage.
 * @returns {!TreeReductionStage}
 */
function createTreeReductionStage() {
  const labelingAlgorithm = new GenericLabeling({
    affectedLabelsDpKey: 'AFFECTED_LABELS'
  })
  return new TreeReductionStage({
    nonTreeEdgeRouter: new OrganicEdgeRouter(),
    nonTreeEdgeSelectionKey: OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY,
    nonTreeEdgeLabelingAlgorithm: labelingAlgorithm,
    nonTreeEdgeLabelSelectionKey: labelingAlgorithm.affectedLabelsDpKey
  })
}

/**
 * Creates and configures the edge bundling stage
 * @returns {!ILayoutAlgorithm}
 */
function createEdgeBundlingStage() {
  const edgeBundlingStage = new EdgeBundlingStage(new StraightLineEdgeRouter())
  configureEdgeBundling(edgeBundlingStage)
  return new GenericLabeling({ coreLayout: edgeBundlingStage })
}

/**
 * Configures the edge bundling descriptor.
 * @param {!(EdgeBundlingStage|CircularLayout|RadialLayout|TreeReductionStage)} layoutAlgorithm The layout algorithm to integrate the edge bundling
 */
function configureEdgeBundling(layoutAlgorithm) {
  // we could either enable here the bezier fitting or append the CurveFittingLayoutStage to our layout algorithm
  // if we would like to adjust the approximation error
  // bundlingDescriptor.bezierFitting = true;
  layoutAlgorithm.edgeBundling.bundlingStrength = parseFloat(bundlingStrengthSlider.value)
  layoutAlgorithm.edgeBundling.defaultBundleDescriptor = new EdgeBundleDescriptor({
    bundled: true
  })
}

/**
 * Updates the circle information for each node.
 * @param {!CircularLayoutData} layoutData The current layout data
 */
function updateNodeInformation(layoutData) {
  const graph = graphComponent.graph
  const circleNodes = new Mapper()
  const circleCenters = new Mapper()

  // store the nodes that belong to each circle
  graph.nodes.forEach(node => {
    const circleId = layoutData.circleIds.get(node)
    const componentId = componentsMap.get(node)
    const id = circleId !== null ? `${circleId} ${componentId}` : '-1'
    if (id !== '-1') {
      if (!circleNodes.get(id)) {
        circleNodes.set(id, [])
      }
      circleNodes.get(id).push(node)
    }
  })

  // calculate the center of each circle
  for (const entry of circleNodes.entries) {
    const circleId = entry.key
    const entryNodes = entry.value
    if (circleId !== '-1' && entryNodes.length > 2) {
      circleCenters.set(circleId, calculateCircleCenter(entryNodes))
    }
  }

  // store to the node's tag the circle id, the center of the circle and the nodes that belong to the node's circle
  // this information is needed for the creation of the circular sector node style
  graph.nodes.forEach(node => {
    const circleId = layoutData.circleIds.get(node)
    const componentId = componentsMap.get(node)
    // add to the tag an id consisted of the component to which this node belongs plus the circle id
    const id = circleId !== null ? `${circleId} ${componentId}` : '-1'
    node.tag = {
      circleId: id,
      center: circleCenters.get(id),
      circleNodeSize: circleNodes.get(id)?.length || 0
    }
  })
}

/**
 * Calculates the coordinates of the circle formed by the given points
 * @param {!Array.<INode>} circleNodes An array containing the 3 points that form the circle
 * @returns {!Point} The coordinates of the center of the circle
 */
function calculateCircleCenter(circleNodes) {
  const p1 = circleNodes[0].layout.center
  const p2 = circleNodes[1].layout.center
  const p3 = circleNodes[2].layout.center

  const idet =
    2 * (p1.x * p2.y - p2.x * p1.y - p1.x * p3.y + p3.x * p1.y + p2.x * p3.y - p3.x * p2.y)
  const a = p1.x * p1.x + p1.y * p1.y
  const b = p2.x * p2.x + p2.y * p2.y
  const c = p3.x * p3.x + p3.y * p3.y
  const centerX = (a * (p2.y - p3.y) + b * (p3.y - p1.y) + c * (p1.y - p2.y)) / idet
  const centerY = (a * (p3.x - p2.x) + b * (p1.x - p3.x) + c * (p2.x - p1.x)) / idet
  return new Point(centerX, centerY)
}

/**
 * Calculates the connected components of the current graph.
 */
function calculateConnectedComponents() {
  const graph = graphComponent.graph
  const selectedIndex = samplesComboBox.selectedIndex
  if (
    selectedIndex === LayoutAlgorithm.SINGLE_CYCLE ||
    selectedIndex === LayoutAlgorithm.CIRCULAR
  ) {
    const result = new ConnectedComponents().run(graph)
    componentsMap = result.nodeComponentIds
  }
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener("select[data-command='SampleSelectionChanged']", onSampleChanged)

  bundlingStrengthSlider.addEventListener(
    'change',
    async () => {
      bundlingStrengthLabel.textContent = bundlingStrengthSlider.value.toString()
      await applyLayout()
    },
    true
  )
}

/**
 * Configures the busy indicator and runs the layout.
 * @returns {!Promise}
 */
async function applyLayout() {
  await setBusy(true)
  // set some small time out to enable the busy indicator
  setTimeout(() => {
    runLayout()
  }, 5)
}

/**
 * Determines whether the UI is busy or not.
 * @param {boolean} isBusy True if the UI is busy, false otherwise
 * @returns {!Promise}
 */
async function setBusy(isBusy) {
  graphComponent.inputMode.enabled = !isBusy
  if (isBusy) {
    addClass(graphComponent.div, 'gc-busy')
  } else {
    removeClass(graphComponent.div, 'gc-busy')
  }
  setUIDisabled(isBusy)
  await showLoadingIndicator(isBusy)
}

/**
 * Enables/disables the UI's elements.
 * @param {boolean} disabled True if the UI's elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  samplesComboBox.disabled = disabled

  bundlingStrengthSlider.disabled = disabled
  bundlingStrengthLabel.disabled = disabled
}

/**
 * @readonly
 * @enum {number}
 */
const LayoutAlgorithm = {
  SINGLE_CYCLE: 0,
  CIRCULAR: 1,
  RADIAL: 2,
  BALLOON: 3,
  TREE: 4,
  ROUTER: 5
}

// runs the demo
loadJson().then(checkLicense).then(run)
