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
  GraphComponent,
  GraphViewerInputMode,
  IAnimation,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutAnchoringPolicy,
  LayoutAnchoringStage,
  LayoutAnchoringStageData,
  LayoutData,
  LayoutExecutor,
  License,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  RadialTreeLayout,
  Rect,
  SequentialLayout,
  SubgraphLayoutStage,
  SubgraphLayoutStageData,
  WebGLAnimation,
  WebGLGraphModelManager,
  WebGLPolylineEdgeStyle,
  WebGLSelectionIndicatorManager,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import {
  checkWebGL2Support,
  finishLoading,
  showLoadingIndicator
} from '@yfiles/demo-resources/demo-page'
/**
 * The current number of tree layers. Also, the starting value for the demo.
 */
let currentLayers = 3
const nodeStyles = []
let webGLEdgeStyle
/**
 * Configures the maximum graph size reachable with layer additions.
 */
const maxGraphSize = 250_000
async function run() {
  if (!checkWebGL2Support()) {
    return
  }
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()
  initializeStyleDefaults()
  enableWebGLRendering(graphComponent)
  initializeInputElements(graphComponent)
  await createGraph(graphComponent, currentLayers)
  initializeUI(graphComponent)
}
/**
 * Initializes the WebGL node and edge styles
 */
function initializeStyleDefaults() {
  ;['#242265', '#01baff', '#f26419', '#fdca40'].forEach((color) => {
    nodeStyles.push(new WebGLShapeNodeStyle('round-rectangle', color, '#0000'))
  })
  webGLEdgeStyle = new WebGLPolylineEdgeStyle({ targetArrow: 'triangle-small' })
}
/**
 * Enables WebGL as the rendering technique
 */
function enableWebGLRendering(graphComponent) {
  graphComponent.graphModelManager = new WebGLGraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
}
/**
 * Initializes the graph manipulation UI elements
 */
function initializeInputElements(graphComponent) {
  const childInputElement = document.querySelector('#childCountInput')
  const childCountElement = document.querySelector('#child-count')
  childCountElement.textContent = childInputElement.value
  childInputElement.addEventListener('change', () => {
    childCountElement.textContent = childInputElement.value
    updateLayersUI(graphComponent)
  })
}
/**
 * Updates the graph manipulation UI
 * Enables and disables the add/remove layer buttons depending on graph size and child count
 */
function updateLayersUI(graphComponent) {
  // update display of current layers
  const layerCountElement = document.querySelector('#layerCount')
  layerCountElement.textContent = String(currentLayers)
  // disable/enable add layer button
  const leaves = graphComponent.graph.nodes.filter(
    (node) => graphComponent.graph.outDegree(node) == 0
  ).size
  const childCount = Number(document.querySelector('#childCountInput').value)
  document.querySelector('#add-layer').disabled =
    graphComponent.graph.nodes.size + leaves * childCount > maxGraphSize
  // disable removing the root node
  document.querySelector('#remove-layer').disabled = currentLayers == 0
}
/**
 * Enables/disables the graph manipulation UI. Used during graph changes and extendLayout.
 */
function setUIDisabled(disabled) {
  document.querySelector('#add-layer').disabled = disabled
  document.querySelector('#remove-layer').disabled = disabled
  document.querySelector('#childCountInput').disabled = disabled
}
/**
 * Updates the graph information on the sidebar.
 */
function updateGraphInformation(graph) {
  document.querySelector('#numberNodes').textContent = String(graph.nodes.size)
  document.querySelector('#numberEdges').textContent = String(graph.edges.size)
}
/**
 * Wires up the toolbar UI elements.
 */
function initializeUI(graphComponent) {
  document.querySelector('#add-layer').addEventListener('click', () => addLayer(graphComponent))
  document
    .querySelector('#remove-layer')
    .addEventListener('click', () => removeLayer(graphComponent))
}
/**
 * Creates the tree with a given number of layers
 * @param graphComponent the graphComponent
 * @param layers the depth of the tree
 */
async function createGraph(graphComponent, layers) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager
  const childCount = Number(document.querySelector('#childCountInput').value)
  setUIDisabled(true)
  const queue = []
  const rootNode = createTreeNode(graph, 0, queue, Point.ORIGIN)
  graph.setNodeLayout(rootNode, Rect.fromCenter(graphComponent.viewport.center, rootNode.layout))
  graph.setStyle(rootNode, nodeStyles[0])
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
 */
async function addLayer(graphComponent) {
  currentLayers++
  const graph = graphComponent.graph
  const graphInfo = graph.tag
  const childCount = Number(document.querySelector('#childCountInput').value)
  setUIDisabled(true)
  const queue = []
  graph.nodes
    .filter((node) => node.tag.layer == graphInfo.maxLayer)
    .forEach((node) => {
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
 * @param graphComponent the graph component
 * @param maxLayer the maximum layer to reach when extending
 * @param childCount the number of children to add to each parent node
 * @param queue the parent nodes to add children to
 * @param fadeInAnimation fade in animation for newly created elements
 */
function extendTree(graphComponent, maxLayer, childCount, queue, fadeInAnimation) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager
  while (queue[0].tag.layer < maxLayer) {
    const source = queue.shift()
    const newLayer = source.tag.layer + 1
    for (let i = 0; i < childCount; i++) {
      const newNode = createTreeNode(graph, newLayer, queue, source.layout.center)
      graph.setStyle(newNode, nodeStyles[newLayer % nodeStyles.length])
      gmm.setAnimations(newNode, [fadeInAnimation])
      const edge = graph.createEdge(source, newNode)
      graph.setStyle(edge, webGLEdgeStyle)
      gmm.setAnimations(edge, [fadeInAnimation])
    }
  }
}
function createTreeNode(graph, layer, queue, center) {
  const node = graph.createNodeAt(center)
  node.tag = { layer }
  queue.push(node)
  return node
}
/**
 * Runs the layout on the graph in the cases of graph creation and extension
 *
 * @param graphComponent the graph component
 * @param fadeInAnimation fade in animation for newly created elements
 */
async function runExtendLayout(graphComponent, fadeInAnimation) {
  const coreLayout = new RadialTreeLayout()
  if (shouldReduceEdgeLength(graphComponent.graph)) {
    coreLayout.minimumEdgeLength = 0
  }
  const fixedNodeData = new LayoutAnchoringStageData({
    nodeAnchoringPolicies: (node) =>
      graphComponent.graph.inDegree(node) == 0
        ? LayoutAnchoringPolicy.CENTER
        : LayoutAnchoringPolicy.NONE
  })
  const layout = new LayoutAnchoringStage(coreLayout)
  await applyLayout(graphComponent, layout, fixedNodeData, fadeInAnimation, fadeInAnimation)
}
/**
 * Removes a layer from the graph.
 */
async function removeLayer(graphComponent) {
  currentLayers--
  const graph = graphComponent.graph
  const childCount = Number(document.querySelector('#childCountInput').value)
  setUIDisabled(true)
  const removeNodes = []
  graph.nodes.forEach((node) => {
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
 * using the {@link PlaceNodesAtBarycenterStage}.
 *
 * @param graphComponent the graph component
 * @param removeNodes the nodes to remove
 */
async function reduceTree(graphComponent, removeNodes) {
  const graph = graphComponent.graph
  const barycenterData = new PlaceNodesAtBarycenterStageData({ affectedNodes: removeNodes })
  const subgraphData = new SubgraphLayoutStageData({
    subgraphNodes: (node) => !removeNodes.includes(node)
  })
  const barycenterStage = new PlaceNodesAtBarycenterStage()
  const radialTreeLayout = new RadialTreeLayout()
  const subgraphLayout = radialTreeLayout.layoutStages.get(SubgraphLayoutStage)
  subgraphLayout.enabled = true
  if (shouldReduceEdgeLength(graphComponent.graph)) {
    radialTreeLayout.minimumEdgeLength = 0
  }
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
  removeNodes.forEach((node) => {
    gmm.setAnimations(node, [nodeFadeOutAnimation])
    gmm.setAnimations(graph.edgesAt(node).get(0), [edgeFadeOutAnimation])
  })
  await applyLayout(
    graphComponent,
    new SequentialLayout(radialTreeLayout, barycenterStage),
    barycenterData.combineWith(subgraphData),
    nodeFadeOutAnimation,
    edgeFadeOutAnimation
  )
  removeNodes.forEach((node) => {
    graph.remove(node)
  })
}
/**
 * Determines if {@link RadialTreeLayout} should route edges as short as possible to produce the most
 * compact arrangement possible.
 * @param graph the graph to be arranged.
 */
function shouldReduceEdgeLength(graph) {
  return graph.nodes.size > 1_000
}
/**
 * Cleans up all WebGL animations, as only a limited number of set animations are allowed
 */
function cleanupAnimations(graphComponent) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager
  graph.nodes.forEach((node) => {
    gmm.setAnimations(node, [])
  })
  graph.edges.forEach((edge) => {
    gmm.setAnimations(edge, [])
  })
}
/**
 * Helper function to create and start the layout executor
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
    animationDuration: '1s',
    allowUserInteraction: false,
    animateViewport: true,
    targetBoundsPadding: 100
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
  edgeAnimation
  nodeAnimation
  createAnimation() {
    let finalAnimation
    const animations = [this.createLayoutAnimation(), this.nodeAnimation, this.edgeAnimation]
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
run().then(finishLoading)
