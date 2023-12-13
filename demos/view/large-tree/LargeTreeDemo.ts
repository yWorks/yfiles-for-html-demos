/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  LayoutExecutor,
  License,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  Rect,
  SequentialLayout,
  SubgraphLayout,
  SubgraphLayoutData,
  WebGL2Animation,
  WebGL2GraphModelManager,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle
} from 'yfiles'

import { fetchLicense } from 'demo-resources/fetch-license'
import { checkWebGL2Support, finishLoading, showLoadingIndicator } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * The current number of tree layers. Also the starting value for the demo
 */
let currentLayers = 3

const nodeStyles: WebGL2ShapeNodeStyle[] = []
let webGL2EdgeStyle: WebGL2PolylineEdgeStyle

/**
 * Configures the maximum graph size reachable with layer additions
 */
const maxGraphSize = 250_000

async function run(): Promise<void> {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphViewerInputMode()

  initializeStyleDefaults()
  enableWebGLRendering(graphComponent)
  initializeInputElements(graphComponent)

  createGraph(graphComponent, currentLayers)
  initializeUI(graphComponent)
}

/**
 * Initializes the WebGL2 node and edge styles
 */
function initializeStyleDefaults(): void {
  ;['#242265', '#01baff', '#f26419', '#fdca40'].forEach((color) => {
    nodeStyles.push(new WebGL2ShapeNodeStyle('round-rectangle', color, '#0000'))
  })

  webGL2EdgeStyle = new WebGL2PolylineEdgeStyle({ targetArrow: 'triangle-small' })
}

/**
 * Enables WebGL as the rendering technique
 */
function enableWebGLRendering(graphComponent: GraphComponent): void {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
}

/**
 * Initializes the graph manipulation UI elements
 */
function initializeInputElements(graphComponent: GraphComponent): void {
  const childInputElement = document.querySelector<HTMLInputElement>('#childCountInput')!
  const childCountElement = document.querySelector<HTMLSpanElement>('#child-count')!
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
function updateLayersUI(graphComponent: GraphComponent): void {
  // update display of current layers
  const layerCountElement = document.querySelector<HTMLSpanElement>('#layerCount')!
  layerCountElement.textContent = String(currentLayers)

  // disable/enable add layer button
  const leaves = graphComponent.graph.nodes.filter(
    (node) => graphComponent.graph.outDegree(node) == 0
  ).size
  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)
  document.querySelector<HTMLButtonElement>('#add-layer')!.disabled =
    graphComponent.graph.nodes.size + leaves * childCount > maxGraphSize

  // disable removing the root node
  document.querySelector<HTMLButtonElement>('#remove-layer')!.disabled = currentLayers == 0
}

/**
 * Enables/disables the graph manipulation UI. Used during graph changes and extendLayout.
 */
function setUIDisabled(disabled: boolean): void {
  document.querySelector<HTMLButtonElement>('#add-layer')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#remove-layer')!.disabled = disabled
  document.querySelector<HTMLInputElement>('#childCountInput')!.disabled = disabled
}

/**
 * Updates the graph information on the sidebar.
 */
function updateGraphInformation(graph: IGraph): void {
  document.querySelector('#numberNodes')!.textContent = String(graph.nodes.size)
  document.querySelector('#numberEdges')!.textContent = String(graph.edges.size)
}

/**
 * Wires up the toolbar UI elements.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document.querySelector('#add-layer')!.addEventListener('click', () => addLayer(graphComponent))
  document
    .querySelector('#remove-layer')!
    .addEventListener('click', () => removeLayer(graphComponent))
}

/**
 * Creates the tree with a given number of layers
 * @param graphComponent the graphComponent
 * @param layers the depth of the tree
 */
async function createGraph(graphComponent: GraphComponent, layers: number): Promise<void> {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)

  setUIDisabled(true)
  const queue: INode[] = []
  const rootNode = createTreeNode(graph, 0, queue, Point.ORIGIN)
  graph.setNodeLayout(rootNode, Rect.fromCenter(graphComponent.viewport.center, rootNode.layout))
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
 */
async function addLayer(graphComponent: GraphComponent): Promise<void> {
  currentLayers++
  const graph = graphComponent.graph
  const graphInfo = graph.tag

  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)

  setUIDisabled(true)

  const queue: INode[] = []
  graph.nodes
    .filter((node) => node.tag.layer == graphInfo.maxLayer)
    .forEach((node) => {
      queue.push(node)
    })

  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
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
function extendTree(
  graphComponent: GraphComponent,
  maxLayer: number,
  childCount: number,
  queue: INode[],
  fadeInAnimation: WebGL2Animation
): void {
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

function createTreeNode(graph: IGraph, layer: number, queue: INode[], center: Point): INode {
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
  const coreLayout = new BalloonLayout()
  if (shouldReduceEdgeLength(graphComponent.graph)) {
    coreLayout.minimumEdgeLength = 0
  }

  const graph = graphComponent.graph

  const fixedNodeData = new FixNodeLayoutData({
    fixedNodes: graph.nodes.find((n) => graph.inDegree(n) == 0)!
  })
  const layout = new FixNodeLayoutStage(coreLayout)

  await applyLayout(graphComponent, layout, fixedNodeData, fadeInAnimation, fadeInAnimation)
}

/**
 * Removes a layer from the graph.
 */
async function removeLayer(graphComponent: GraphComponent): Promise<void> {
  currentLayers--
  const graph = graphComponent.graph

  const childCount = Number(document.querySelector<HTMLInputElement>('#childCountInput')!.value)

  setUIDisabled(true)
  const removeNodes: INode[] = []
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
 * using the {@link PlaceNodesAtBarycenterStage}
 *
 * @param graphComponent the graph component
 * @param removeNodes the nodes to remove
 */
async function reduceTree(graphComponent: GraphComponent, removeNodes: INode[]): Promise<void> {
  const graph = graphComponent.graph

  const barycenterData = new PlaceNodesAtBarycenterStageData({ affectedNodes: removeNodes })
  const subgraphData = new SubgraphLayoutData({
    subgraphNodes: (node) => !removeNodes.includes(node)
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

  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
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
    layout,
    barycenterData.combineWith(subgraphData),
    nodeFadeOutAnimation,
    edgeFadeOutAnimation
  )

  removeNodes.forEach((node) => {
    graph.remove(node)
  })
}

/**
 * Determines if {@link BalloonLayout} should route edges as short as possible to produce the most
 * compact arrangement possible.
 * @param graph the graph to be arranged.
 */
function shouldReduceEdgeLength(graph: IGraph): boolean {
  return graph.nodes.size > 1_000
}

/**
 * Cleans up all WebGL2 animations, as only a limited number of set animations are allowed
 */
function cleanupAnimations(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
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
  graphComponent: GraphComponent,
  layout: ILayoutAlgorithm,
  layoutData: LayoutData,
  nodeFadeOutAnimation: WebGL2Animation,
  edgeFadeOutAnimation: WebGL2Animation
): Promise<void> {
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

run().then(finishLoading)
