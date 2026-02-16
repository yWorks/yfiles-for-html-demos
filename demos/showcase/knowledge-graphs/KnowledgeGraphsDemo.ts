/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeStyleIndicatorRenderer,
  ExteriorNodeLabelModel,
  ExteriorNodeLabelModelPosition,
  FilteredGraphWrapper,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IEdge,
  INode,
  IPortCandidateProvider,
  LabelStyleIndicatorRenderer,
  License,
  MutablePoint,
  MutableSize,
  NodeStyleIndicatorRenderer,
  OrientedRectangle,
  ShapeNodeShape,
  ShapeNodeStyle,
  StretchNodeLabelModel,
  Stroke,
  WebGLGraphModelManager
} from '@yfiles/yfiles'

import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-ui/finish-loading'
import data from './resources/data.json'
import { updateEdgePorts, updateGraphStructure } from './analysis/handle-problematic-data'
import { type EdgeData, getEdgeTag, getNodeTag, type NodeData } from './types'
import {
  errorNodeLabelStyle,
  getEdgeStyle,
  getErrorLabel,
  getIconLabelStyle,
  getNodeIcon,
  getNodeStyle,
  getTextLabelStyle
} from './styles/graph-styles'
import { applyClustering, applyPageRankAlgorithm } from './analysis/clustering'
import { runLayout } from './layout'
import { showLoadingIndicator } from '@yfiles/demo-app/demo-ui/element-utils'
import { configureHighlighting } from './highlighting'
import { configureContentMenu } from './context-menu'
import { initializeDescriptionPanel } from './description-panel'
import {
  initializeFilterPanel,
  setFilteringPanelDisabled,
  updateGraphInformation
} from './filter-panel'
import { BrowserDetection } from '@yfiles/demo-utils/BrowserDetection'
import {
  configureLevelOfDetailRendering,
  edgeLabelThreshold,
  toggleLabelVisibility
} from './label-level-of-detail-rendering'
import { GraphSearch } from '@yfiles/demo-utils/GraphSearch'
import {
  createNeighborhoodView,
  showNeighborhood,
  toggleNeighborhoodPanel
} from './neighborhood-panel'
import { resetBeaconAnimation } from './beacon-animation'

let graphComponent: GraphComponent
let neighborhoodComponent: GraphComponent
let graphSearch: GraphSearch
let layoutRunning = false

const worker = new Worker(new URL('./WorkerLayout', import.meta.url), { type: 'module' })

const searchBox = document.querySelector<HTMLInputElement>('#searchBox')!
const spotlightErrorsElement = document.querySelector<HTMLInputElement>('#error-beacon-animation')!
const teamsLayoutButton = document.querySelector<HTMLInputElement>('#teams-view')!

async function run(): Promise<void> {
  License.value = licenseData

  // Initialize graph component and enable webgl mode if supported by the browser
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.graphModelManager = new WebGLGraphModelManager({
    renderMode: BrowserDetection.webGL2 ? 'webgl' : 'svg'
  })

  setTimeout(async () => {
    await showLoadingIndicator(true)
    await initializeGraphData(graphComponent)
    initializeFilterPanel(graphComponent, () => filter(graphComponent))
    initializeDescriptionPanel(graphComponent, async () => {
      await applyLayout(graphComponent)
    })
    await showLoadingIndicator(false)
  }, 0)

  initializeGraph()
  configureLevelOfDetailRendering(graphComponent)
  configureHighlighting(graphComponent)

  configureContentMenu(graphComponent)
  initializeToolbar(graphComponent)

  neighborhoodComponent = createNeighborhoodView()
}

/**
 * Loads, analyzes, and styles graph data.
 *
 * @param graphComponent - The graph component to populate
 */
async function initializeGraphData(graphComponent: GraphComponent): Promise<void> {
  // Build graph from JSON data
  buildGraph()
  // Run the data analysis, detects data issues (dangling edges, isolated nodes, duplicates)
  // and update the graph with virtual elements if needed.
  updateGraphStructure(graphComponent.graph)

  // Wrap graph to support filtering by subject-predicate-object triplets
  graphComponent.graph = new FilteredGraphWrapper(
    graphComponent.graph,
    (node) => getNodeTag(node).visible ?? true,
    (edge) => getEdgeTag(edge).visible ?? true
  )

  // Show the number of nodes and edges in the UI
  updateGraphInformation(graphComponent.graph)

  // Calculate node importance using PageRank and scale node sizes accordingly
  applyPageRankAlgorithm(graphComponent)
  // Group nodes into clusters using Louvain modularity algorithm
  applyClustering(graphComponent)
  // Apply visual styling: colors by cluster, error styling for problematic items
  updateGraphStyles()
  // Calculate and apply automatic layout algorithm
  await applyLayout(graphComponent, 'organic', true)
}

/**
 * Configures graph input mode, decorators, and event listeners.
 */
function initializeGraph(): void {
  const inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowCreateEdge: false,
    allowCreateBend: false,
    allowAddLabel: false,
    allowEditLabel: false,
    allowEditLabelOnDoubleClick: false,
    allowClipboardOperations: false,
    allowGroupingOperations: false,
    allowReverseEdge: false,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    deletableItems: GraphItemTypes.NONE,
    showHandleItems: GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    contextMenuItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    movableSelectedItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    movableUnselectedItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })

  // Double-clicking on a node, opens the neighborhood view
  inputMode.addEventListener('item-double-clicked', async (evt) => {
    if (evt.item instanceof INode) {
      graphComponent.selection.clear()
      await showNeighborhood(graphComponent, neighborhoodComponent, evt.item as INode)
      await applyLayout(neighborhoodComponent, 'neighborhood')
    }
    evt.handled = true
  })

  graphComponent.inputMode = inputMode

  const graph = graphComponent.graph
  // Show port candidates only on actual nodes or nodes without problems
  graph.decorator.nodes.portCandidateProvider.addFactory((node) =>
    getNodeTag(node).virtual || getNodeTag(node).problem
      ? IPortCandidateProvider.NO_CANDIDATES
      : IPortCandidateProvider.fromNodeCenter(node)
  )

  // Configure the selection style for nodes and edges
  graph.decorator.nodes.selectionRenderer.addFactory((node) => {
    const hasProblem = getNodeTag(node).problem
    const stroke = hasProblem ? new Stroke('#ff4400', 4) : new Stroke('#ffffff', 4)
    const margins = hasProblem ? 10 : 0
    return new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({ shape: 'ellipse', fill: 'none', stroke }),
      margins
    })
  })

  graph.decorator.edges.selectionRenderer.addFactory((edge) => {
    return new EdgeStyleIndicatorRenderer({ edgeStyle: getEdgeStyle(edge), zoomPolicy: 'mixed' })
  })

  graph.decorator.labels.selectionRenderer.addFactory((label) => {
    return new LabelStyleIndicatorRenderer({
      labelStyle: label.style,
      zoomPolicy: 'world-coordinates'
    })
  })

  // Hide edge reconnection handles for edges without problems
  graph.decorator.edges.portHandleProvider.hide((edge) => !getEdgeTag(edge).problem)

  // Hide focus renderers for nodes and edges
  graph.decorator.nodes.focusRenderer.hide()
  graph.decorator.edges.focusRenderer.hide()

  graphComponent.selection.addEventListener('item-added', (evt) => {
    const item = evt.item
    const graph = graphComponent.graph
    if (item instanceof INode) {
      const tag = getNodeTag(item)
      const problem = tag.problem
      graph.edgesAt(item).forEach((edge) => {
        graphComponent.selection.add(edge)
        edge.labels.forEach((label) => {
          graphComponent.selection.add(label)
        })
      })
      if (problem) {
        const type = problem.type
        if (type === 'duplicate') {
          // Select also all duplicated nodes
          graph.nodes
            .filter((node) => getNodeTag(node).problem?.id === problem.id!)
            .forEach((node) => {
              graphComponent.selection.add(node)
            })
        }
        highlightDataProblem(tag.id)
      }
    } else if (item instanceof IEdge) {
      item.labels.forEach((label) => {
        graphComponent.selection.add(label)
      })

      const tag = getEdgeTag(item)
      const problem = tag.problem
      if (problem) {
        const type = problem.type
        if (type === 'danglingEdge') {
          highlightDataProblem(tag.id)
        }
      }
    }

    function highlightDataProblem(itemId: string): void {
      const selector = `div.data-problem-container#${itemId}`
      const dataProblemContainer = document.querySelector<HTMLDivElement>(selector)
      dataProblemContainer?.classList.add('selected')
      dataProblemContainer?.addEventListener('animationend', () => {
        dataProblemContainer.classList.remove('selected')
      })
      dataProblemContainer?.addEventListener('animationcancel', () => {
        dataProblemContainer.classList.remove('selected')
      })
    }
  })

  graphComponent.selection.addEventListener('item-removed', (evt) => {
    const item = evt.item
    // Remove the selection from adjacent edges and hide their labels if needed
    const graph = graphComponent.graph
    if (graph.contains(item)) {
      if (item instanceof INode) {
        graph.edgesAt(item).forEach((edge) => {
          graphComponent.selection.remove(edge)
          edge.labels.forEach((label) => {
            graphComponent.selection.remove(label)
          })
        })
      } else if (item instanceof IEdge) {
        item.labels.forEach((label) => {
          graphComponent.selection.remove(label)
        })
      }
    }
  })

  // Update edge ports when edges change so that edges with problems get corrected when connected to actual nodes
  graph.addEventListener('edge-ports-changed', (event) => {
    updateEdgePorts(graphComponent, event)
  })

  // Set some min/max zoom values for the graphComponent
  graphComponent.minimumZoom = 0.01
  graphComponent.maximumZoom = 4
}

/**
 * Builds graph structure from JSON data.
 */
function buildGraph(): void {
  const graph = graphComponent.graph
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    angle: 0,
    autoRotation: true
  }).createRatioParameter()

  const graphBuilder = new GraphBuilder(graph)
  const nodesSource = graphBuilder.createNodesSource<NodeData>({ data: data.nodes, id: 'id' })
  const nodeCreator = nodesSource.nodeCreator
  nodeCreator.tagProvider = (data: NodeData) => ({ ...data, visible: true })

  const edgesSource = graphBuilder.createEdgesSource({
    data: data.edges,
    sourceId: 'from',
    targetId: 'to'
  })
  edgesSource.edgeCreator.tagProvider = (data: EdgeData) => ({ ...data, visible: true })

  graphBuilder.buildGraph()
}

/**
 * Applies styles and labels to all graph items.
 *
 * For nodes: Adds text, icon, and optional error labels.
 * For edges: Adds text labels with adjusted positioning for problem edges.
 */
function updateGraphStyles(): void {
  const graph = graphComponent.graph

  graph.nodes.forEach((node) => {
    const tag = getNodeTag(node)
    graph.setStyle(node, getNodeStyle(node))

    // Skip labels for virtual nodes
    if (tag.virtual) {
      return
    }

    // Add text label
    graph.addLabel({
      owner: node,
      text: getNodeTag(node).label,
      layoutParameter: new ExteriorNodeLabelModel({ margins: 20 }).createParameter(
        ExteriorNodeLabelModelPosition.BOTTOM
      ),
      style: getTextLabelStyle(node),
      tag: { type: 'text', visible: true }
    })

    // Add icon label based on node type
    graph.addLabel({
      owner: node,
      text: getNodeIcon(tag.type),
      layoutParameter: StretchNodeLabelModel.CENTER,
      style: getIconLabelStyle(node),
      tag: { type: 'icon', visible: true }
    })

    // Add error label if the node has problems based on the problem type
    if (tag.problem) {
      const errorIcon = graph.addLabel({
        owner: node,
        text: getErrorLabel(tag.problem),
        style: errorNodeLabelStyle,
        tag: { type: 'error', visible: true }
      })

      const parameter = new FreeNodeLabelModel().findBestParameter(
        errorIcon,
        new OrientedRectangle(
          new MutablePoint(node.layout.x + node.layout.width - 15, node.layout.y + 15),
          new MutableSize(35, 35)
        )
      )
      graph.setLabelLayoutParameter(errorIcon, parameter)
    }
  })

  graph.edges.forEach((edge) => {
    const tag = getEdgeTag(edge)
    graph.setStyle(edge, getEdgeStyle(edge))

    // Add text label with adjusted positioning for problem edges
    graph.addLabel({
      owner: edge,
      text: tag.label,
      layoutParameter: !tag.problem
        ? new EdgePathLabelModel({ angle: 0, autoRotation: true }).createRatioParameter()
        : new EdgePathLabelModel({
            angle: 0,
            autoRotation: true,
            distance: 35,
            sideOfEdge: 'right-of-edge'
          }).createRatioParameter(),
      style: getTextLabelStyle(edge),
      tag: { type: 'text', visible: true }
    })
  })
}

/**
 * Applies layout algorithm to the graph.
 *
 * @param graphComponent - The graph component
 * @param layoutStyle - Layout type: 'organic', 'teams' or 'neighborhood' (default: 'organic')
 * @param firstLayout - Whether the layout runs for the first time.
 */
async function applyLayout(
  graphComponent: GraphComponent,
  layoutStyle = 'organic',
  firstLayout = false
): Promise<void> {
  if (layoutRunning) {
    return Promise.resolve()
  }
  setUIDisabled(true)
  if (firstLayout) {
    graphComponent.htmlElement.style.opacity = '0'
  }

  const graph = graphComponent.graph
  // Switch label visibility so that labels are present during the layout calculation
  const shouldShowLabels =
    graphComponent.zoom < edgeLabelThreshold || layoutStyle === 'neighborhood'
  if (shouldShowLabels) {
    toggleLabelVisibility(graph, graphComponent.graph.labels, true)
  }

  let style = 'organic'
  if (layoutStyle === 'organic') {
    style = teamsLayoutButton.checked ? 'teams' : 'organic'
  }
  await runLayout(worker, graphComponent, style)

  if (firstLayout) {
    graphComponent.htmlElement.style.opacity = '1'
  }
  setUIDisabled(false)
}

/**
 * Initializes UI controls and event handlers.
 *
 * @param graphComponent - The graph component
 */
function initializeToolbar(graphComponent: GraphComponent): void {
  teamsLayoutButton.addEventListener('click', async () => {
    resetUI()
    await showLoadingIndicator(true, 'Calculating the layout. This might take a while...')
    await applyLayout(graphComponent)
    await showLoadingIndicator(false)
  })
  graphSearch = new GraphSearch(graphComponent)
  graphSearch.highlightRenderer = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ELLIPSE,
      stroke: '3px solid #ff3399',
      fill: null
    }),
    margins: 3
  })
  GraphSearch.registerEventListener(searchBox, graphSearch)
}

/**
 * Enables or disables UI controls.
 *
 * @param disabled - Whether to disable UI controls
 */
function setUIDisabled(disabled: boolean): void {
  layoutRunning = disabled
  setFilteringPanelDisabled(disabled)
  spotlightErrorsElement.disabled = disabled
  ;(graphComponent.inputMode as GraphEditorInputMode).waitInputMode.enabled = !disabled
}

/**
 * Resets UI elements related to filtering, animations, and search to their default state.
 */
function resetUI(): void {
  toggleNeighborhoodPanel(false)
  searchBox.value = ''
  graphSearch.updateSearch('')
  void resetBeaconAnimation()
  spotlightErrorsElement.checked = false
}

/**
 * Applies the filter/layout flow for the given GraphComponent.
 *
 * @param graphComponent - The GraphComponent to which the layout should be applied.
 */
async function filter(graphComponent: GraphComponent): Promise<void> {
  resetUI()
  if (graphComponent.graph.nodes.size > 0) {
    await showLoadingIndicator(true, 'Calculating the layout. This might take a while...')
    await applyLayout(graphComponent)
    await showLoadingIndicator(false)
  }
}

void run().then(finishLoading)
