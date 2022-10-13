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
  BalloonLayout,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  GraphComponent,
  GraphViewerInputMode,
  IAnimation,
  ICommand,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  LayoutExecutor,
  License,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  SequentialLayout,
  SubgraphLayout,
  SubgraphLayoutData,
  WebGL2Animation,
  WebGL2GraphModelManager,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle
} from 'yfiles'

import {
  bindAction,
  bindCommand,
  checkWebGL2Support,
  showApp,
  showLoadingIndicator
} from '../../resources/demo-app.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * The current number of tree layers. Also the starting value for the demo
 * @type {number}
 */
let currentLayers = 3

const nodeStyles = []
/** @type {WebGL2PolylineEdgeStyle} */
let webGL2EdgeStyle

/**
 * Configures the maximum graph size reachable with layer additions
 */
const maxGraphSize = 250_000

/**
 * @returns {!Promise}
 */
async function run() {
  if (!checkWebGL2Support()) {
    showApp()
    return
  }

  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()

  initializeStyleDefaults()
  enableWebGLRendering(graphComponent)
  initializeInputElements(graphComponent)

  createGraph(graphComponent, currentLayers)
  registerCommands(graphComponent)
  showApp(graphComponent)
}

/**
 * Initializes the WebGL2 node and edge styles
 */
function initializeStyleDefaults() {
  ;['#242265', '#01baff', '#f26419', '#fdca40'].forEach(color => {
    nodeStyles.push(new WebGL2ShapeNodeStyle('round-rectangle', color, '#0000'))
  })

  webGL2EdgeStyle = new WebGL2PolylineEdgeStyle({ targetArrow: 'triangle-small' })
}

/**
 * Enables WebGL as the rendering technique
 * @param {!GraphComponent} graphComponent
 */
function enableWebGLRendering(graphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
}

/**
 * Initializes the graph manipulation UI elements
 * @param {!GraphComponent} graphComponent
 */
function initializeInputElements(graphComponent) {
  const childInputElement = document.querySelector('#childCountInput')
  const childCountElement = document.querySelector('#childCount')
  childCountElement.textContent = childInputElement.value
  childInputElement.addEventListener('change', () => {
    childCountElement.textContent = childInputElement.value
    updateLayersUI(graphComponent)
  })
}

/**
 * Updates the graph manipulation UI
 * Enables and disables the add/remove layer buttons depending on graph size and child count
 * @param {!GraphComponent} graphComponent
 */
function updateLayersUI(graphComponent) {
  // update display of current layers
  const layerCountElement = document.querySelector('#layerCount')
  layerCountElement.textContent = String(currentLayers)

  // disable/enable add layer button
  const leaves = graphComponent.graph.nodes.filter(
    node => graphComponent.graph.outDegree(node) == 0
  ).size
  const childCount = Number(document.querySelector('#childCountInput').value)
  document.querySelector('#addLayer').disabled =
    graphComponent.graph.nodes.size + leaves * childCount > maxGraphSize

  // disable removing the root node
  document.querySelector('#removeLayer').disabled = currentLayers == 0
}

/**
 * Enables/disables the graph manipulation UI. Used during graph changes and extendLayout.
 * @param {boolean} disabled
 */
function setUIDisabled(disabled) {
  document.querySelector('#addLayer').disabled = disabled
  document.querySelector('#removeLayer').disabled = disabled
  document.querySelector('#childCountInput').disabled = disabled
}

/**
 * Updates the graph information on the sidebar.
 * @param {!IGraph} graph
 */
function updateGraphInformation(graph) {
  document.querySelector('#numberNodes').textContent = String(graph.nodes.size)
  document.querySelector('#numberEdges').textContent = String(graph.edges.size)
}

/**
 * Wires up the toolbar UI elements.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='AddLayer']", () => addLayer(graphComponent))
  bindAction("button[data-command='RemoveLayer']", () => removeLayer(graphComponent))
}

/**
 * Creates the tree with a given number of layers
 * @param {!GraphComponent} graphComponent the graphComponent
 * @param {number} layers the depth of the tree
 * @returns {!Promise}
 */
async function createGraph(graphComponent, layers) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager
  const childCount = Number(document.querySelector('#childCountInput').value)

  setUIDisabled(true)
  const queue = []
  const rootNode = createTreeNode(graph, 0, queue, Point.ORIGIN)
  gmm.setStyle(rootNode, nodeStyles[0])

  const fadeInAnimation = gmm.createFadeAnimation({
    type: 'fade-out',
    timing: '1s ease reverse'
  })

  extendTree(graphComponent, layers, childCount, queue, fadeInAnimation)
  graph.tag = { maxLayer: layers, childCount: childCount }

  await runExtendLayout(graphComponent, fadeInAnimation)

  updateGraphInformation(graphComponent.graph)
  updateLayersUI(graphComponent)
  setUIDisabled(false)
}

/**
 * Adds a layer to the graph.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function addLayer(graphComponent) {
  currentLayers++
  const graph = graphComponent.graph
  const graphInfo = graph.tag

  const childCount = Number(document.querySelector('#childCountInput').value)

  setUIDisabled(true)

  const queue = []
  graph.nodes
    .filter(node => node.tag.layer == graphInfo.maxLayer)
    .forEach(node => {
      queue.push(node)
    })

  const gmm = graphComponent.graphModelManager
  const fadeInAnimation = gmm.createFadeAnimation({
    type: 'fade-out',
    timing: '1s ease reverse'
  })

  const numberChildren = queue.length * childCount

  if (numberChildren > 20_000) {
    await showLoadingIndicator(true, 'Creating child nodes...')
  }
  extendTree(graphComponent, currentLayers, childCount, queue, fadeInAnimation)

  graph.tag = { maxLayer: currentLayers, childCount: childCount }

  await runExtendLayout(graphComponent, fadeInAnimation)
  await showLoadingIndicator(false)
  setUIDisabled(false)

  updateGraphInformation(graphComponent.graph)
  updateLayersUI(graphComponent)
}

/**
 * Extends the tree with new layers.
 *
 * @param {!GraphComponent} graphComponent the graph component
 * @param {number} maxLayer the maximum layer to reach when extending
 * @param {number} childCount the number of children to add to each parent node
 * @param {!Array.<INode>} queue the parent nodes to add children to
 * @param {!WebGL2Animation} fadeInAnimation fade in animation for newly created elements
 */
function extendTree(graphComponent, maxLayer, childCount, queue, fadeInAnimation) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager

  while (queue[0].tag.layer < maxLayer) {
    const source = queue.shift()
    const newLayer = source.tag.layer + 1
    for (let i = 0; i < childCount; i++) {
      const newNode = createTreeNode(graph, newLayer, queue, source.layout.center)
      gmm.setStyle(newNode, nodeStyles[newLayer % nodeStyles.length])
      gmm.setAnimations(newNode, [fadeInAnimation])
      const edge = graph.createEdge(source, newNode)
      gmm.setStyle(edge, webGL2EdgeStyle)
      gmm.setAnimations(edge, [fadeInAnimation])
    }
  }
}

/**
 * @param {!IGraph} graph
 * @param {number} layer
 * @param {!Array.<INode>} queue
 * @param {!Point} center
 * @returns {!INode}
 */
function createTreeNode(graph, layer, queue, center) {
  const node = graph.createNodeAt(center)
  node.tag = { layer }
  queue.push(node)
  return node
}

/**
 * Runs the layout on the graph in the cases of graph creation and extension
 *
 * @param {!GraphComponent} graphComponent the graph component
 * @param {!WebGL2Animation} fadeInAnimation fade in animation for newly created elements
 * @returns {!Promise}
 */
async function runExtendLayout(graphComponent, fadeInAnimation) {
  const coreLayout = new BalloonLayout()
  if (shouldReduceEdgeLength(graphComponent.graph)) {
    coreLayout.minimumEdgeLength = 0
  }

  const graph = graphComponent.graph

  const fixedNodeData = new FixNodeLayoutData({
    fixedNodes: graph.nodes.find(n => graph.inDegree(n) == 0)
  })
  const layout = new FixNodeLayoutStage(coreLayout)

  await applyLayout(graphComponent, layout, fixedNodeData, fadeInAnimation, fadeInAnimation)
}

/**
 * Removes a layer from the graph.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function removeLayer(graphComponent) {
  currentLayers--
  const graph = graphComponent.graph

  const childCount = Number(document.querySelector('#childCountInput').value)

  setUIDisabled(true)
  const removeNodes = []
  graph.nodes.forEach(node => {
    if (node.tag == null || node.tag.layer > currentLayers) {
      removeNodes.push(node)
    }
  })

  if (removeNodes.length > 20_000) {
    await showLoadingIndicator(true, 'Removing child nodes...')
  }
  await reduceTree(graphComponent, removeNodes)
  graph.tag = { maxLayer: currentLayers, childCount: childCount }

  await showLoadingIndicator(false)
  setUIDisabled(false)

  updateGraphInformation(graphComponent.graph)
  updateLayersUI(graphComponent)
}

/**
 * Removes nodes from the tree, animating them onto their parent nodes before removal
 * using the {@link PlaceNodesAtBarycenterStage}
 *
 * @param {!GraphComponent} graphComponent the graph component
 * @param {!Array.<INode>} removeNodes the nodes to remove
 * @returns {!Promise}
 */
async function reduceTree(graphComponent, removeNodes) {
  const graph = graphComponent.graph

  const barycenterData = new PlaceNodesAtBarycenterStageData({ affectedNodes: removeNodes })
  const subgraphData = new SubgraphLayoutData({
    subgraphNodes: node => !removeNodes.includes(node)
  })

  const barycenterStage = new PlaceNodesAtBarycenterStage()
  const subgraphLayout = new SubgraphLayout({ affectedNodesDpKey: '__SUBGRAPH_LAYOUT_KEY' })

  const balloonLayout = new BalloonLayout({
    subgraphLayoutEnabled: true,
    subgraphLayout
  })
  if (shouldReduceEdgeLength(graphComponent.graph)) {
    balloonLayout.minimumEdgeLength = 0
  }

  const layout = new SequentialLayout({ layouts: [balloonLayout, barycenterStage] })

  const gmm = graphComponent.graphModelManager
  const nodeFadeOutAnimation = gmm.createFadeAnimation({
    type: 'fade-out',
    timing: '1s ease'
  })
  // Fading out edges faster looks better
  const edgeFadeOutAnimation = gmm.createFadeAnimation({
    type: 'fade-out',
    timing: '500ms ease'
  })

  removeNodes.forEach(node => {
    gmm.setAnimations(node, [nodeFadeOutAnimation])
    gmm.setAnimations(graph.edgesAt(node).get(0), [edgeFadeOutAnimation])
  })

  await applyLayout(
    graphComponent,
    layout,
    barycenterData.combineWith(subgraphData),
    nodeFadeOutAnimation,
    edgeFadeOutAnimation
  )

  removeNodes.forEach(node => {
    graph.remove(node)
  })
}

/**
 * Determines if {@link BalloonLayout} should route edges as short as possible to produce the most
 * compact arrangement possible.
 * @param {!IGraph} graph the graph to be arranged.
 * @returns {boolean}
 */
function shouldReduceEdgeLength(graph) {
  return graph.nodes.size > 1_000
}

/**
 * Cleans up all WebGL2 animations, as only a limited number of set animations are allowed
 * @param {!GraphComponent} graphComponent
 */
function cleanupAnimations(graphComponent) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager
  graph.nodes.forEach(node => {
    gmm.setAnimations(node, [])
  })
  graph.edges.forEach(edge => {
    gmm.setAnimations(edge, [])
  })
}

/**
 * Helper function to create and start the layout executor
 * @param {!GraphComponent} graphComponent
 * @param {!ILayoutAlgorithm} layout
 * @param {!LayoutData} layoutData
 * @param {!WebGL2Animation} nodeFadeOutAnimation
 * @param {!WebGL2Animation} edgeFadeOutAnimation
 * @returns {!Promise}
 */
async function applyLayout(
  graphComponent,
  layout,
  layoutData,
  nodeFadeOutAnimation,
  edgeFadeOutAnimation
) {
  const executor = new AnimatedLayoutExecutor({
    graphComponent,
    layout: layout,
    layoutData: layoutData,
    duration: '1s',
    allowUserInteraction: false,
    animateViewport: true,
    targetBoundsInsets: 100
  })

  executor.nodeAnimation = nodeFadeOutAnimation
  executor.edgeAnimation = edgeFadeOutAnimation

  await executor.start()

  cleanupAnimations(graphComponent)
}

/**
 * Customized layout executor that adds webgl animations for nodes and edges
 */
class AnimatedLayoutExecutor extends LayoutExecutor {
  /**
   * @returns {!IAnimation}
   */
  createAnimation() {
    let finalAnimation
    const animations = [this.createMorphAnimation(), this.nodeAnimation, this.edgeAnimation]
    if (this.animateViewport) {
      animations.push(this.createViewportAnimation(this.getTargetBounds()))
    }
    finalAnimation = IAnimation.createParallelAnimation(animations)
    if (this.easedAnimation) {
      finalAnimation = finalAnimation.createEasedAnimation()
    }
    return finalAnimation
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
