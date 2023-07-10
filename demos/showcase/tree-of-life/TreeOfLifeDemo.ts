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
import type { RadialLayoutNodeInfo } from 'yfiles'
import {
  Bfs,
  CenterNodesPolicy,
  Cursor,
  DefaultLabelStyle,
  FilteredGraphWrapper,
  FreeNodeLabelModel,
  GivenCoordinatesStage,
  GivenCoordinatesStageData,
  GraphBuilder,
  GraphComponent,
  GraphHighlightIndicatorManager,
  GraphItemTypes,
  GraphViewerInputMode,
  IArrow,
  ICanvasObjectDescriptor,
  IEdge,
  IEdgeStyle,
  IGraph,
  ILabel,
  ILabelStyle,
  IListEnumerable,
  IndicatorEdgeStyleDecorator,
  IndicatorLabelStyleDecorator,
  IndicatorNodeStyleDecorator,
  INode,
  INodeStyle,
  Insets,
  LabelShape,
  License,
  Mapper,
  NodeLabelingPolicy,
  Point,
  PolylineEdgeStyle,
  RadialLayout,
  RadialLayoutData,
  RadialLayoutEdgeRoutingStrategy,
  RadialLayoutLayeringStrategy,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  StyleDecorationZoomPolicy,
  WebGL2GraphModelManager
} from 'yfiles'

import SectorVisual from './SectorVisual'
import { getGlobalRoot, getSubtree, highlightSubtree } from './SubtreeSupport'
import { initializeGraphSearch, resetGraphSearch } from './TreeOfLifeSearch'
import { fetchLicense } from 'demo-resources/fetch-license'
import { BrowserDetection } from 'demo-utils/BrowserDetection'
import { addNavigationButtons, finishLoading, showLoadingIndicator } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

type Palette = {
  primary: string
  secondary: string
  extinct: string
  textBackground: string
  text: string
}

const palettes = [
  {
    primary: '#407271',
    secondary: '#17BEBB',
    extinct: '#407271',
    textBackground: '#A1E5E3',
    text: '#114D4C'
  },
  {
    primary: '#586a48',
    secondary: '#76B041',
    extinct: '#586a48',
    textBackground: '#C7DEB2',
    text: '#324820'
  },
  {
    primary: '#998953',
    secondary: '#FFC914',
    extinct: '#998953',
    textBackground: '#FFE8A0',
    text: '#665111'
  },
  {
    primary: '#996D4D',
    secondary: '#FF6C00',
    extinct: '#996D4D',
    textBackground: '#FFC398',
    text: '#662F01'
  }
]

const visibleNodes = new Set<INode>()

let showExtinctSpecies = true

const sectorVisual = new SectorVisual()

let layoutCalculationRunning = false
let subtreeUpdateRunning = false

let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  if (BrowserDetection.webGL2) {
    graphComponent.graphModelManager = new WebGL2GraphModelManager()
  }

  initializeStyleDefaults(graphComponent.graph)

  initializeInteraction()

  initializeSectorVisualization()

  initializeGraphSearch(graphComponent)

  initializeUI()

  void loadAndFilterGraph()

  // Make the breadcrumbs visible
  document.getElementById('breadcrumbs')!.style.display = 'block'
}

/**
 * Initializes default styles for the given graph.
 * @param graph The graph to set the defaults.
 */
function initializeStyleDefaults(graph: IGraph): void {
  // node defaults
  graph.nodeDefaults.size = new Size(5, 5)
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: '#2E282A',
    stroke: '2px #1C1A1A'
  })
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    shape: LabelShape.PILL,
    backgroundFill: '#AAA8A9',
    backgroundStroke: 'none',
    textFill: '#191718',
    insets: new Insets(5, 2, 5, 2),
    verticalTextAlignment: 'center'
  })
  graph.nodeDefaults.labels.shareStyleInstance = false

  // edge defaults
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px #2E282A',
    targetArrow: IArrow.NONE
  })
  graph.edgeDefaults.shareStyleInstance = false

  // configures the styles that are used for highlighting the graph items
  // install custom highlight
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      padding: 5,
      zoomPolicy: StyleDecorationZoomPolicy.MIXED
    }),
    edgeStyle: new IndicatorEdgeStyleDecorator({
      zoomPolicy: StyleDecorationZoomPolicy.MIXED
    }),
    labelStyle: new IndicatorLabelStyleDecorator({
      padding: 5,
      zoomPolicy: StyleDecorationZoomPolicy.NO_DOWNSCALING
    })
  })
}

/**
 * Sets up an input mode for the GraphComponent, and adds custom handles to change the angle and
 * shaft ratio of the arrows.
 */
function initializeInteraction(): void {
  graphComponent.maximumZoom = 2

  const inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NONE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.NODE_LABEL | GraphItemTypes.EDGE
  })

  // show subtree of the clicked node
  inputMode.addItemClickedListener(async (sender, evt) => {
    let clickedNode: INode
    if (evt.item instanceof INode) {
      clickedNode = evt.item
    } else if (evt.item instanceof ILabel) {
      clickedNode = evt.item.owner as INode
    } else {
      return
    }
    if (!subtreeUpdateRunning) {
      subtreeUpdateRunning = true
      let newSubtreeRoot: INode
      if (
        graphComponent.graph.inDegree(clickedNode) == 0 &&
        mainGraph().inDegree(clickedNode) > 0
      ) {
        // use hidden parent of the given node if there is one
        newSubtreeRoot = mainGraph().inEdgesAt(clickedNode).first().sourceNode!
      } else {
        newSubtreeRoot = clickedNode
      }
      await showSubtreeForSelectedRoot(newSubtreeRoot, true)
      subtreeUpdateRunning = false
    }
  })

  // navigate to the clicked edge
  inputMode.addItemLeftClickedListener(async (sender, args) => {
    if (args.item instanceof IEdge) {
      await navigateToEdge(args.item, args.location, args.context.canvasComponent as GraphComponent)
    }
  })

  // highlight subtree when hovered
  const itemHoverInputMode = inputMode.itemHoverInputMode
  itemHoverInputMode.hoverItems = GraphItemTypes.ALL
  itemHoverInputMode.hoverCursor = Cursor.POINTER

  itemHoverInputMode.addHoveredItemChangedListener((sender, evt) => {
    const highlightManager = graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()

    if (evt.item instanceof ILabel) {
      // when a label is hovered, only highlight this label
      highlightManager.addHighlight(evt.item)
      if (evt.oldItem) {
        highlightManager.removeHighlight(evt.oldItem)
      }
    } else if (evt.item instanceof INode || evt.item instanceof IEdge) {
      // when a node or edge is hovered, highlight the whole subtree
      highlightSubtree(evt.item, graphComponent)
    }
  })

  // highlight sector when hovered
  graphComponent.addMouseMoveListener((sender, evt) => {
    if (sectorVisual.updateHighlight(evt.location)) {
      graphComponent.invalidate()
    }
  })

  // if a sector is clicked show its subtree
  inputMode.addCanvasClickedListener(async (sender, evt) => {
    if (!subtreeUpdateRunning) {
      subtreeUpdateRunning = true
      const subtreeRoot = sectorVisual.getSubtreeRoot(evt.location)
      if (subtreeRoot) {
        await showSubtreeForSelectedRoot(subtreeRoot)
      }
      subtreeUpdateRunning = false
    }
  })

  graphComponent.inputMode = inputMode
}

/**
 * Visualizes the sectors in the background of the GraphComponent.
 */
function initializeSectorVisualization() {
  graphComponent.backgroundGroup.addChild(
    sectorVisual,
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Loads the initial graph, colorizes the subtrees and filters the data that will be visualized.
 */
async function loadAndFilterGraph() {
  await showLoadingIndicator(true, `Loading 'Tree Of Life' data...`)
  setUIDisabled(graphComponent, true)

  const graph = await loadGraph(graphComponent.graph)

  colorizeSubtrees(graph)

  graphComponent.graph = new FilteredGraphWrapper(graph, node => isVisible(node))

  // center the graph
  graphComponent.fitGraphBounds()

  // show and layout the first subtree
  subtreeUpdateRunning = true
  const root = graph.nodes.find(node => node.tag.name === 'Life on Earth')!
  await showSubtree(root)
  subtreeUpdateRunning = false

  setUIDisabled(graphComponent, false)
  await showLoadingIndicator(false)
}

/**
 * Returns the main graph that is filtered.
 */
function mainGraph(): IGraph {
  return (graphComponent.graph as FilteredGraphWrapper).wrappedGraph!
}

/**
 * Determines whether the given node is visible.
 */
function isVisible(node: INode): boolean {
  return visibleNodes.has(node) && (showExtinctSpecies || node.tag.EXTINCT === '0')
}

/**
 * Loads the graph from data and apply default styles.
 * @yjs:keep = nodes
 */
async function loadGraph(graph: IGraph): Promise<IGraph> {
  const builder = new GraphBuilder(graph)
  const response = await fetch('./resources/TreeOfLifeData.json')
  const data = await response.json()

  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    labels: ['tag.name'],
    tag: 'tag'
  })

  builder.createEdgesSource({
    data: data.links,
    sourceId: 'source',
    targetId: 'target'
  })

  return builder.buildGraph()
}

/**
 * Colorize the nodes and edges of each subtree with a different color.
 */
function colorizeSubtrees(graph: IGraph) {
  const root = getGlobalRoot(graph)
  graph.successors(root).forEach((subtreeRoot, i) => {
    const subtree = getSubtree(subtreeRoot, graph)
    const palette = palettes[i]

    subtree.nodes.forEach(node => {
      const extinct = node.tag.EXTINCT !== '0'
      graph.setStyle(node, getNodeStyle(extinct, palette))
      node.labels.forEach(label => {
        graph.setStyle(label, getLabelStyle(extinct, palette))
      })
      node.tag = { ...node.tag, color: palettes[i].secondary }
    })

    subtree.edges.forEach(edge => {
      const extinct = edge.targetNode!.tag.EXTINCT !== '0'
      graph.setStyle(edge, getEdgeStyle(extinct, palette))
    })
  })
}

/**
 * Returns a node style that uses the given palette.
 */
function getNodeStyle(extinct: boolean, palette: Palette): INodeStyle {
  return new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: extinct ? palette.extinct : palette.secondary,
    stroke: `2px ${palette.primary}`
  })
}

/**
 * Returns a label style that uses the given palette.
 */
function getLabelStyle(extinct: boolean, palette: Palette): ILabelStyle {
  return new DefaultLabelStyle({
    shape: LabelShape.PILL,
    backgroundStroke: extinct ? `2px ${palette.textBackground}` : 'none',
    backgroundFill: extinct ? '#FFFFFF' : palette.textBackground,
    textFill: palette.text,
    insets: new Insets(5, 2, 5, 2),
    verticalTextAlignment: 'center'
  })
}

/**
 * Returns an edge style that uses the given palette.
 */
function getEdgeStyle(extinct: boolean, palette: Palette): IEdgeStyle {
  return new PolylineEdgeStyle({
    stroke: `2px ${extinct ? 'dotted ' + palette.extinct : palette.secondary}`,
    targetArrow: IArrow.NONE
  })
}

/**
 * Updates the filtered graph to only show the subtree with the given subtree root.
 */
async function showSubtree(subtreeRoot: INode, prepareAnimation?: boolean) {
  visibleNodes.clear()

  const subtree = getSubtree(subtreeRoot, mainGraph())

  // get a list of subtree nodes ordered by their distance to the subtree root
  const bfs = new Bfs({
    coreNodes: [subtreeRoot]
  })
  const bfsResult = bfs.run(mainGraph())
  const subtreeNodes = subtree.nodes.orderBy(
    node => bfsResult.nodeLayerIds.get(node),
    (layer1, layer2) => layer1! - layer2!
  )

  // only show the layers up until the graph has 500 nodes + the remaining nodes of the last layer
  let currentLayer = 0
  subtreeNodes.forEach(node => {
    const layer = bfsResult.nodeLayerIds.get(node)!
    if (visibleNodes.size < 500 || layer === currentLayer) {
      visibleNodes.add(node)
      currentLayer = layer
    }
  })

  await applyNewLayout(graphComponent, prepareAnimation)

  resetGraphSearch()

  // highlight the label of the subtree root as a visual orientation
  graphComponent.highlightIndicatorManager.addHighlight(subtreeRoot.labels.first())

  // update sector highlight
  if (sectorVisual.updateHighlight(graphComponent.lastEventLocation)) {
    graphComponent.invalidate()
  }
}

/**
 * Calculate and apply a new layout.
 */
async function applyNewLayout(
  graphComponent: GraphComponent,
  prepareAnimation = true,
  highlightChanges = false
) {
  if (layoutCalculationRunning) {
    // ignore concurrent layout calls
    return
  }
  const graph = graphComponent.graph as FilteredGraphWrapper
  const oldSize = graph.nodes.size
  // update the filtering of the graph
  graph.nodePredicateChanged()

  // check whether there is a change in the graph
  const newSize = graph.nodes.size
  if (oldSize !== newSize) {
    await showLoadingIndicator(true, 'Calculating the layout...')
    layoutCalculationRunning = true
    setUIDisabled(graphComponent, true)

    // prepare the graph for the layout, move nodes at the center and reset the edge paths
    if (prepareAnimation) {
      prepareSmoothLayoutAnimation(graphComponent)
    }

    // apply a radial dendrogram layout
    await layoutGraph(graphComponent)
    setUIDisabled(graphComponent, false)

    // highlight the newly inserted extinct nodes
    if (newSize > oldSize && highlightChanges) {
      const highlightManager = graphComponent.highlightIndicatorManager
      highlightManager.clearHighlights()

      graph.nodes.forEach(node => {
        if (node.tag.EXTINCT !== '0') {
          highlightManager.addHighlight(node.labels.get(0))
        }
      })
    }
    layoutCalculationRunning = false
    await showLoadingIndicator(false)
  }
}

/**
 * Moves the nodes of the graph at the center of the graphComponent and resets the edge paths so
 * that the animation of the layout is smoother and nicer.
 */
function prepareSmoothLayoutAnimation(graphComponent: GraphComponent) {
  mainGraph().applyLayout(
    new GivenCoordinatesStage(),
    new GivenCoordinatesStageData({
      nodeLocations: graphComponent.center,
      edgePaths: IListEnumerable.EMPTY
    })
  )
  sectorVisual.updateSectors(graphComponent.graph)
}

/**
 * Layouts the current graph as a radial dendrogram.
 */
async function layoutGraph(graphComponent: GraphComponent) {
  const sectorMapper = new Mapper<INode, RadialLayoutNodeInfo>()
  await graphComponent.morphLayout(
    new RadialLayout({
      centerNodesPolicy: CenterNodesPolicy.DIRECTED,
      layeringStrategy: RadialLayoutLayeringStrategy.DENDROGRAM,
      edgeRoutingStrategy: RadialLayoutEdgeRoutingStrategy.RADIAL_POLYLINE,
      integratedNodeLabeling: true,
      nodeLabelingPolicy: NodeLabelingPolicy.RAY_LIKE,
      maximumChildSectorAngle: 360,
      layerSpacing: 1,
      minimumNodeToNodeDistance: 2,
      minimumEdgeToEdgeDistance: 5
    }),
    '200ms',
    new RadialLayoutData({ nodeInfos: sectorMapper })
  )

  sectorVisual.updateSectors(graphComponent.graph, sectorMapper)
}

/**
 * Focuses the viewport to the specified edge.
 * See {@link getFocusPosition} for details on determining this position.
 */
async function navigateToEdge(
  item: IEdge,
  clickLocation: Point,
  graphComponent: GraphComponent
): Promise<void> {
  const position = getFocusPosition(item, graphComponent)
  const offset = clickLocation.subtract(graphComponent.viewport.center)
  await graphComponent.zoomToAnimated(position.subtract(offset), graphComponent.zoom)
}

/**
 * Gets the center of the edge if source and target are visible. Otherwise, the location of source
 * or target, whichever is closer. This is then used to zoom to this location.
 */
function getFocusPosition(edge: IEdge, graphComponent: GraphComponent): Point {
  const viewport = graphComponent.viewport
  const targetNodeCenter = edge.targetNode!.layout.center
  const sourceNodeCenter = edge.sourceNode!.layout.center

  if (viewport.contains(targetNodeCenter) && viewport.contains(sourceNodeCenter)) {
    // if the source and the target node are in the view port, return to the middle point of the edge
    return new Point(
      (sourceNodeCenter.x + targetNodeCenter.x) / 2,
      (sourceNodeCenter.y + targetNodeCenter.y) / 2
    )
  } else {
    // otherwise, check which of the two nodes is closer to the viewport center
    return viewport.center.subtract(targetNodeCenter).vectorLength <
      viewport.center.subtract(sourceNodeCenter).vectorLength
      ? sourceNodeCenter
      : targetNodeCenter
  }
}

/**
 * Shows the subtree of the selected root node.
 * @param selectedRoot The selected root node
 * @param prepareAnimation True if the graph has to be prepared for the layout, i.e., move nodes at
 * the center and reset the edge paths, false otherwise
 */
async function showSubtreeForSelectedRoot(selectedRoot: INode, prepareAnimation?: boolean) {
  // update the navigation menu
  updateNavigationMenuAndCombobox(selectedRoot)
  // update the layout
  await showSubtree(selectedRoot, prepareAnimation)
}

/**
 * Returns the ancestors of the given node.
 * @param node The selected node
 */
function getAncestors(node: INode): INode[] {
  let ancestor = node
  const ancestors: INode[] = [ancestor]
  while (mainGraph().inDegree(ancestor) !== 0) {
    ancestor = mainGraph().inEdgesAt(ancestor).first().sourceNode!
    ancestors.push(ancestor)
  }
  return ancestors
}

/**
 * Creates the breadcrumb navigation menu.
 * @param selectedRoot The node that is selected to be the new root node
 */
function updateNavigationMenuAndCombobox(selectedRoot: INode) {
  // get the ancestors of the selected node including the node itself
  let ancestors = getAncestors(selectedRoot)

  // update sample in combo box based on the subtree in which the node belongs
  const selectSubtreeCombo = document.getElementById('sample-subtrees') as HTMLSelectElement
  const subtrees = Array.from(selectSubtreeCombo.options).map(o => o.text.toLowerCase())
  for (const node of ancestors) {
    if (subtrees.includes(node.tag.name.toLowerCase())) {
      selectSubtreeCombo.value = node.tag.name
      break
    }
  }

  // update the breadcrumb menu
  const itemsElement = document.querySelector<HTMLButtonElement>('#breadcrumbs .breadcrumbs-items')!
  // remove previous elements from the div
  while (itemsElement.lastChild) {
    itemsElement.removeChild(itemsElement.lastChild)
  }

  ancestors = ancestors.reverse()
  // hide some ancestors if they are more than 10
  const hasManyAncestors = ancestors.length > 10

  let copy = [...ancestors]
  if (hasManyAncestors) {
    copy = copy.slice(ancestors.length - 10, ancestors.length)
    copy.unshift(ancestors[0])
  }

  copy.forEach((ancestor, index) => {
    const ancestorDiv = document.createElement('button')
    const ancestorLabel = ancestor.tag.name
    ancestorDiv.innerHTML = ancestorLabel
    ancestorDiv.classList.add('breadcrumbs-item')
    if (ancestorLabel === selectedRoot.tag.name) {
      ancestorDiv.classList.add('selected')
    }
    ancestorDiv.addEventListener('click', async evt => {
      if (!subtreeUpdateRunning) {
        const subtreeRoot = mainGraph().nodes.find(
          node => node.tag.name === (evt.target as HTMLButtonElement).innerText
        )!
        await showSubtreeForSelectedRoot(subtreeRoot)
      }
      subtreeUpdateRunning = false
    })
    itemsElement.appendChild(ancestorDiv)

    if (index != copy.length - 1) {
      itemsElement.appendChild(createArrow())
    }

    if (index == 0 && hasManyAncestors) {
      const dots = document.createElement('span')
      dots.innerHTML = '...'
      itemsElement.appendChild(dots)
      itemsElement.appendChild(createArrow())
    }
  })
}

/**
 * Creates an arrow for the navigation menu.
 */
function createArrow() {
  const arrowElement = document.createElement('div')
  arrowElement.classList.add('breadcrumbs-arrow')
  arrowElement.innerHTML = '>'
  return arrowElement
}

/**
 * Initializes the toolbar UI elements.
 */
function initializeUI(): void {
  addNavigationButtons(
    document.querySelector<HTMLSelectElement>('#sample-subtrees')!
  ).addEventListener('change', async evt => {
    const value = (evt.target as HTMLSelectElement).value
    if (!subtreeUpdateRunning) {
      subtreeUpdateRunning = true
      setUIDisabled(graphComponent, true)
      const subtreeRoot = mainGraph().nodes.find(node => node.tag.name === value)!
      await showSubtreeForSelectedRoot(subtreeRoot, true)
      setUIDisabled(graphComponent, false)
      subtreeUpdateRunning = false
    }
  })

  document
    .querySelector<HTMLSelectElement>('#demo-toggle-extinct-button')!
    .addEventListener('click', async () => {
      showExtinctSpecies = !showExtinctSpecies
      await applyNewLayout(graphComponent, false, true)
    })
}

/**
 * Changes the disabled-state of all UI elements in the toolbar.
 */
function setUIDisabled(graphComponent: GraphComponent, disabled: boolean) {
  ;(graphComponent.inputMode as GraphViewerInputMode).waitInputMode.waiting = disabled
  document.querySelector<HTMLSelectElement>('#sample-subtrees')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#demo-toggle-extinct-button')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#searchBox')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#breadcrumbs .breadcrumbs-items')!.disabled = disabled
}

run().then(finishLoading)
