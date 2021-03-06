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
  WebGL2FadeAnimationType,
  WebGL2GraphModelManager,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { webGl2Supported } from '../../utils/Workarounds'

/**
 * The current number of tree layers. Also the starting value for the demo
 */
let currentLayers = 3

const nodeStyles: WebGL2ShapeNodeStyle[] = []
let webGL2EdgeStyle: WebGL2PolylineEdgeStyle

/**
 * Configures the maximum graph size reachable with layer additions
 */
const maxGraphSize = 120_000

function run(licenseData: object) {
  if (!webGl2Supported) {
    // show message if the browsers does not support WebGL2
    document.getElementById('no-webgl-support')!.removeAttribute('style')
    showApp(null)
    return
  }

  License.value = licenseData
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
  ;['#242265', '#C0FC1A', '#FF6C00', '#00D8FF', '#BA85FF', '#6E0E0A'].forEach(color => {
    nodeStyles.push(new WebGL2ShapeNodeStyle('round-rectangle', color, '#0000'))
  })

  webGL2EdgeStyle = new WebGL2PolylineEdgeStyle({ targetArrow: 'triangle' })
}

/**
 * Enables WebGL as the rendering technique
 */
function enableWebGLRendering(graphComponent: GraphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager(graphComponent)
}

/**
 * Initializes the graph manipulation UI elements
 */
function initializeInputElements(graphComponent: GraphComponent) {
  const childInputElement = document.querySelector<HTMLInputElement>('#childCountInput')!
  const childCountElement = document.querySelector<HTMLSpanElement>('#childCount')!
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
function updateLayersUI(graphComponent: GraphComponent) {
  // update display of current layers
  const layerCountElement = document.querySelector<HTMLSpanElement>('#layerCount')!
  layerCountElement.textContent = String(currentLayers)

  // disable/enable add layer button
  const leaves = graphComponent.graph.nodes.filter(
    node => graphComponent.graph.outDegree(node) == 0
  ).size
  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)
  document.querySelector<HTMLButtonElement>('#addLayer')!.disabled =
    graphComponent.graph.nodes.size + leaves * childCount > maxGraphSize

  // disable removing the root node
  document.querySelector<HTMLButtonElement>('#removeLayer')!.disabled = currentLayers == 0
}

/**
 * Enables/disables the graph manipulation UI. Used during graph changes and extendLayout.
 */
function setUIDisabled(disabled: boolean) {
  document.querySelector<HTMLButtonElement>('#addLayer')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#removeLayer')!.disabled = disabled
  document.querySelector<HTMLInputElement>('#childCountInput')!.disabled = disabled
}

/**
 * Updates the graph information on the sidebar.
 */
function updateGraphInformation(graph: IGraph) {
  document.querySelector('#numberNodes')!.textContent = String(graph.nodes.size)
  document.querySelector('#numberEdges')!.textContent = String(graph.edges.size)
}

/**
 * Wires up the toolbar UI elements.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='AddLayer']", () => addLayer(graphComponent))
  bindAction("button[data-command='RemoveLayer']", () => removeLayer(graphComponent))
}

/**
 * Creates the tree with a given number of layers
 * @param graphComponent the graphComponent
 * @param layers the depth of the tree
 */
async function createGraph(graphComponent: GraphComponent, layers: number) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)

  setUIDisabled(true)
  const queue: INode[] = []
  const rootNode = createTreeNode(graph, 0, queue, Point.ORIGIN)
  gmm.setStyle(rootNode, nodeStyles[0])

  const fadeInAnimation = gmm.createFadeAnimation(WebGL2FadeAnimationType.FADE_IN, '1s')

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
async function addLayer(graphComponent: GraphComponent) {
  currentLayers++
  const graph = graphComponent.graph
  const graphInfo = graph.tag

  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)

  setUIDisabled(true)

  const queue: INode[] = []
  graph.nodes
    .filter(node => node.tag.layer == graphInfo.maxLayer)
    .forEach(node => {
      queue.push(node)
    })

  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  const fadeInAnimation = gmm.createFadeAnimation(WebGL2FadeAnimationType.FADE_IN, '1s')

  extendTree(graphComponent, currentLayers, childCount, queue, fadeInAnimation)
  graph.tag = { maxLayer: currentLayers, childCount: childCount }

  await runExtendLayout(graphComponent, fadeInAnimation)
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
function extendTree(
  graphComponent: GraphComponent,
  maxLayer: number,
  childCount: number,
  queue: INode[],
  fadeInAnimation: WebGL2Animation
) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  while (queue[0].tag.layer < maxLayer) {
    const source = queue.shift()!
    const newLayer = (source.tag.layer as number) + 1
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

function createTreeNode(graph: IGraph, layer: number, queue: INode[], center: Point) {
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
async function runExtendLayout(
  graphComponent: GraphComponent,
  fadeInAnimation: WebGL2Animation
): Promise<void> {
  const coreLayout = new BalloonLayout({ compactnessFactor: 0.05 })
  const graph = graphComponent.graph

  const fixedNodeData = new FixNodeLayoutData({
    fixedNodes: graph.nodes.first(n => graph.inDegree(n) == 0)
  })
  const layout = new FixNodeLayoutStage(coreLayout)

  await applyLayout(graphComponent, layout, fixedNodeData, fadeInAnimation, fadeInAnimation)
}

/**
 * Removes a layer from the graph.
 */
async function removeLayer(graphComponent: GraphComponent) {
  currentLayers--
  const graph = graphComponent.graph

  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)

  setUIDisabled(true)
  const removeNodes: INode[] = []
  graph.nodes.forEach(node => {
    if (node.tag == null || node.tag.layer > currentLayers) {
      removeNodes.push(node)
    }
  })
  await reduceTree(graphComponent, removeNodes)
  graph.tag = { maxLayer: currentLayers, childCount: childCount }
  setUIDisabled(false)

  updateGraphInformation(graphComponent.graph)
  updateLayersUI(graphComponent)
}

/**
 * Removes nodes from the tree, animating them onto their parent nodes before removal
 * using the {@link PlaceNodesAtBarycenterStage}
 *
 * @param graphComponent the graph component
 * @param removeNodes the nodes to remove
 */
async function reduceTree(graphComponent: GraphComponent, removeNodes: INode[]) {
  const graph = graphComponent.graph

  const barycenterData = new PlaceNodesAtBarycenterStageData({ affectedNodes: removeNodes })
  const subgraphData = new SubgraphLayoutData({
    subgraphNodes: node => !removeNodes.includes(node)
  })

  const barycenterStage = new PlaceNodesAtBarycenterStage()
  const subgraphLayout = new SubgraphLayout({ affectedNodesDpKey: '__SUBGRAPH_LAYOUT_KEY' })
  const balloonLayout = new BalloonLayout({ subgraphLayoutEnabled: true, subgraphLayout })
  const layout = new SequentialLayout({ layouts: [balloonLayout, barycenterStage] })

  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  const nodeFadeOutAnimation = gmm.createFadeAnimation(WebGL2FadeAnimationType.FADE_OUT, '1s')
  // Fading out edges faster looks better
  const edgeFadeOutAnimation = gmm.createFadeAnimation(WebGL2FadeAnimationType.FADE_OUT, '500ms')

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
 * Cleans up all WebGL2 animations, as only a limited number of set animations are allowed
 */
function cleanupAnimations(graphComponent: GraphComponent) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  graph.nodes.forEach(node => {
    gmm.setAnimations(node, [])
  })
  graph.edges.forEach(edge => {
    gmm.setAnimations(edge, [])
  })
}

/**
 * Helper function to create and start the layout executor
 * @param graphComponent
 * @param layout
 * @param layoutData
 * @param nodeFadeOutAnimation
 * @param edgeFadeOutAnimation
 */
async function applyLayout(
  graphComponent: GraphComponent,
  layout: ILayoutAlgorithm,
  layoutData: LayoutData,
  nodeFadeOutAnimation: WebGL2Animation,
  edgeFadeOutAnimation: WebGL2Animation
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
  public edgeAnimation!: WebGL2Animation
  public nodeAnimation!: WebGL2Animation

  protected createAnimation(): IAnimation {
    let finalAnimation: IAnimation
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

// start demo
loadJson().then(run)
