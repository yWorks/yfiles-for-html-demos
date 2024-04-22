/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  delegate,
  FilteredGraphWrapper,
  FreeNodePortLocationModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  type IComparable,
  IEdge,
  type IEnumerable,
  type IGraph,
  ILabel,
  INode,
  LayoutExecutor,
  SpanningTree,
  ViewportLimitingPolicy
} from 'yfiles'
import {
  type Company,
  type CompanyRelationshipEdge,
  type GraphData,
  type OwnershipEdge,
  type RelationshipEdge,
  EdgeTypeEnum,
  getRelationship,
  getCompany
} from './data-types'
import { enableBridgeRendering } from './bridge-rendering'
import { enableTooltips } from './enable-tooltips'
import { enableHoverHighlights } from './configure-highlight'
import {
  getNodeLayout,
  getNodeStyle,
  labelSizeDefaults,
  nameLabelDefaults
} from './styles/CompanyOwnershipNodeStyles'
import { edgeLabelDefaults, getEdgeStyle } from './styles/CompanyOwnershipEdgeStyles'
import { configureLayoutNormalizationIds, createLayout, createLayoutData } from './configure-layout'
import TogglePortButtonSupport from './TogglePortButtonSupport'
import { addSmartClickNavigation } from './configure-click-navigation'
import { modifyGraph } from './prepare-smooth-animation'

/**
 * Returns whether the edge is a hierarchy edge.
 * @param edge The edge to be checked
 */
const isHierarchyEdge = (edge: IEdge): boolean =>
  getRelationship(edge).type === EdgeTypeEnum.Hierarchy

/**
 * Returns the ownership percentage for the given edge.
 * @param edge The edge to be checked
 */
const ownershipPercentage = (edge: IEdge): number => {
  const relationship = getRelationship(edge)
  if (relationship.type === EdgeTypeEnum.Hierarchy) {
    return relationship.ownership
  } else {
    return 0
  }
}

/**
 * Checks whether the given node should be visible.
 * @param node The node to be checked
 */
const isVisible = (node: INode): boolean => !getCompany(node).invisible
/**
 * Sets the visibility of the given node.
 * @param node The given node
 * @param visible True if the node should be visible, false otherwise
 */
const setVisible = (node: INode, visible: boolean): void => {
  getCompany(node).invisible = !visible
}
/**
 * Collapses/expands the neighbors of the given node (from the incoming edges)
 * @param node The given node
 * @param collapse True if the node should be collapsed, false otherwise
 */
const collapseInput = (node: INode, collapse: boolean): void => {
  getCompany(node).inputCollapsed = collapse
}

/**
 * Checks whether the node has collapsed neighbors (from the outgoing edges)
 */
const isOutputCollapsed = (node: INode): boolean => getCompany(node).outputCollapsed
/**
 * Collapses/expands the neighbors of the given node (from the outgoing edges)
 * @param node The given node
 * @param collapse True if the node should be collapsed, false otherwise
 */
const collapseOutput = (node: INode, collapse: boolean): void => {
  getCompany(node).outputCollapsed = collapse
}

/**
 * Sets whether the edge is a dominant edge.
 */
const setDominantHierarchyEdge = (edge: IEdge, dominant: boolean): void => {
  getRelationship(edge).isDominantHierarchyEdge = dominant
}

/**
 * Returns the node id needed for the `NormalizeGraphElementOrderStage`.
 */
const getNodeId = (node: INode): IComparable =>
  ('node-' + getCompany(node).id.toString()) as unknown as IComparable

/**
 * Returns the edge id needed for the `NormalizeGraphElementOrderStage`.
 */
const getEdgeId = (edge: IEdge): IComparable => getRelationship(edge).id as unknown as IComparable

/**
 * Central class of the application that manages the graph component and the handling of the data.
 */
export class CompanyStructureView {
  readonly graphComponent: GraphComponent
  private builder?: GraphBuilder
  private nodeClickListener: ((item: Company) => void) | null = null
  private edgeClickListener: ((item: OwnershipEdge | RelationshipEdge) => void) | null = null

  /**
   * Returns the edge types.
   */
  private currentEdgeTypes: Set<EdgeTypeEnum> = new Set<EdgeTypeEnum>([
    EdgeTypeEnum.Hierarchy,
    EdgeTypeEnum.Relation
  ])

  private toggleButtonSupport = new TogglePortButtonSupport()

  moveToTop = false
  private readonly completeGraph: IGraph
  useShapeNodeStyle = true

  private layoutRunning = false

  constructor(cssSelector: string) {
    const graphComponent = (this.graphComponent = new GraphComponent(cssSelector))
    enableBridgeRendering(graphComponent)
    graphComponent.graph = new FilteredGraphWrapper(
      (this.completeGraph = graphComponent.graph),
      (node) =>
        this.completeGraph.isGroupNode(node)
          ? !this.completeGraph.getChildren(node).every((child) => !isVisible(child))
          : isVisible(node)
    )
    configureLayoutNormalizationIds(graphComponent.graph, getNodeId, getEdgeId)
    this.configureInputMode()

    // enable the tooltips
    enableTooltips(graphComponent)
  }

  /**
   * Initializes tooltips, highlighting and user interaction.
   */
  private configureInputMode(): void {
    const graphComponent = this.graphComponent
    // create the view input mode
    const viewerInputMode = new GraphViewerInputMode()
    // enable the highlighting
    enableHoverHighlights(viewerInputMode, graphComponent)
    // create the limiter for the viewport movement
    this.limitViewportNavigation(graphComponent)
    // initialize the button support for toggling the ports
    this.toggleButtonSupport.initializeInputMode(viewerInputMode)
    // configure the item click listener
    this.enableItemClicking(viewerInputMode, graphComponent)
    // enable the smart click navigation to bring to focus the clicked edge
    addSmartClickNavigation(viewerInputMode)
    graphComponent.inputMode = viewerInputMode
  }

  /**
   * Configure the item click listener for the graph elements.
   * @param viewerInputMode The given input mode
   * @param graphComponent The given graphComponent
   */
  private enableItemClicking(
    viewerInputMode: GraphViewerInputMode,
    graphComponent: GraphComponent
  ): void {
    viewerInputMode.addItemClickedListener((_, evt) => {
      if (evt.item instanceof INode && !graphComponent.graph.isGroupNode(evt.item)) {
        this.nodeClickListener && this.nodeClickListener(getCompany(evt.item))
        evt.handled = true
      } else if (evt.item instanceof IEdge) {
        this.edgeClickListener && this.edgeClickListener(getRelationship(evt.item))
        evt.handled = true
      } else if (evt.item instanceof ILabel && evt.item.owner instanceof IEdge) {
        this.edgeClickListener && this.edgeClickListener(getRelationship(evt.item.owner))
        evt.handled = true
      }
    })
  }

  /**
   * Limits the interactive movement of the graphComponent's viewport.
   * @param graphComponent The given graphComponent
   */
  limitViewportNavigation(graphComponent: GraphComponent): void {
    const limiter = graphComponent.viewportLimiter
    limiter.limitingPolicy = ViewportLimitingPolicy.TOWARDS_LIMIT
    limiter.honorBothDimensions = false
    graphComponent.maximumZoom = 3
  }

  /**
   * Loads the graph from the JSON file.
   * @param src The JSON file
   */
  async loadGraph(src: string): Promise<void> {
    const graphData = await this.loadGraphData(src)
    this.buildGraphFromData(graphData)
  }

  /**
   * Builds the graph using the GraphBuilder, creates the FilteredGraphWrapper and the ports.
   * @param graphData The given graphData
   */
  buildGraphFromData(graphData: GraphData): void {
    this.completeGraph.clear()
    const builder = this.createGraphBuilder(
      this.completeGraph,
      graphData,
      this.nodeFilter.bind(this),
      this.edgeFilter.bind(this)
    )

    this.builder = builder

    builder.buildGraph()

    this.graphHasChanged()

    // add buttons on each outgoing port location that allow collapsing subtrees
    this.addToggleButtonPorts(
      this.completeGraph,
      this.completeGraph.nodes,
      this.expand.bind(this),
      this.collapse.bind(this)
    )
  }

  /**
   * Creates the port buttons for each node and binds the corresponding expand/collapse commands.
   * @param graph The given graph
   * @param nodes The nodes of the graph
   * @param expand The expand function
   * @param collapse The collapse function
   */
  private addToggleButtonPorts(
    graph: IGraph,
    nodes: IEnumerable<INode>,
    expand: (node: INode, incoming: boolean) => void,
    collapse: (node: INode, incoming: boolean) => void
  ): void {
    nodes.forEach((n) => {
      if (graph.outDegree(n) > 0) {
        this.toggleButtonSupport.addPort(
          graph,
          n,
          FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
          (collapsed) => (collapsed ? collapse(n, false) : expand(n, false))
        )
      }
    })
  }

  /**
   * Expands the given node either based on the incoming or based on the outgoing edges.
   * @param node The node to be expanded
   * @param input True if the incoming edges should be used, false otherwise
   */
  private async expand(node: INode, input: boolean): Promise<void> {
    input ? collapseInput(node, false) : collapseOutput(node, false)
    await this.adjustVisibility()
  }

  /**
   * Collapsed the given node either based on the incoming or based on the outgoing edges.
   * @param node The node to be expanded
   * @param input True if the incoming edges should be used, false otherwise
   */
  private async collapse(node: INode, input: boolean): Promise<void> {
    input ? collapseInput(node, true) : collapseOutput(node, true)
    await this.adjustVisibility()
  }

  /**
   * Adjusts the visibility of the nodes.
   */
  private async adjustVisibility(): Promise<void> {
    this.updateVisibility(this.completeGraph)
    modifyGraph(
      (graph) => (graph as FilteredGraphWrapper).nodePredicateChanged(),
      this.graphComponent.graph
    )
    await this.layout()
  }

  /**
   * Calculates the hierarchy tree only using the hierarchy edges.
   * @param graph The given graph
   */
  private calculateHierarchy(graph: IGraph): void {
    const treeResult = new SpanningTree({
      subgraphEdges: isHierarchyEdge,
      costs: (item) => 1 - ownershipPercentage(item)
    }).run(graph)
    graph.edges.forEach((e) => {
      setDominantHierarchyEdge(e, treeResult.edges.contains(e))
    })
  }

  /**
   * Calculates the visibility of the nodes of the given graph.
   * @param graph The given graph
   */
  private updateVisibility(graph: IGraph): void {
    if (graph.nodes.some(isOutputCollapsed)) {
      graph.nodes.forEach((n) => {
        setVisible(n, this.shouldBeShown(graph, n))
      })
    } else {
      graph.nodes.forEach((n) => {
        setVisible(n, true)
      })
    }
  }

  /**
   * Returns whether a node should be visible or not.
   * A node is visible if it has no parent or if at least one of its parents is visible.
   */
  private shouldBeShown(graph: IGraph, node: INode): boolean {
    return (
      graph.inDegree(node) === 0 ||
      graph
        .inEdgesAt(node)
        .map((e) => e.sourceNode!)
        .some((parent: INode) => !isOutputCollapsed(parent) && this.shouldBeShown(graph, parent))
    )
  }

  /**
   * Returns true if the edge type belongs to the current set of edge types, false otherwise.
   */
  private edgeTypeFilter(item: CompanyRelationshipEdge): boolean {
    return this.currentEdgeTypes.has(item.type)
  }

  /**
   * Determines whether an edge should be visible or not based on the current edge filter.
   */
  private edgeFilter(item: CompanyRelationshipEdge): boolean {
    return this.edgeTypeFilter(item)
  }

  /**
   * Returns true if the node should be filtered, false otherwise.
   * In this use case, it returns always true, but can be adjusted to support node filters.
   */
  private nodeFilter(item: Company): boolean {
    return true
  }

  /**
   * Creates the GraphBuilder that will build the graph.
   * @param graph The given graph
   * @param graphData The graph data
   * @param nodePredicate The node filter function
   * @param edgePredicate The edge filter function
   * @yjs:keep = nodes,edges
   */
  private createGraphBuilder(
    graph: IGraph,
    graphData: GraphData,
    nodePredicate: (item: Company) => boolean,
    edgePredicate: (item: CompanyRelationshipEdge) => boolean
  ): GraphBuilder {
    const builder = new GraphBuilder(graph)
    const filteredNodes = graphData.nodes.filter(nodePredicate)

    const nodeSource = builder.createNodesSource({
      data: filteredNodes,
      id: (dataItem) => dataItem.id,
      style: (dataItem) => getNodeStyle(dataItem, this.useShapeNodeStyle),
      layout: () => getNodeLayout(this.useShapeNodeStyle)
    })

    // whenever the node changes in the future, we want to update the tag, too
    nodeSource.nodeCreator.addNodeUpdatedListener((_, evt) => {
      nodeSource.nodeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
      nodeSource.nodeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
    })

    // adds the node labels if the shape node style is selected
    if (this.useShapeNodeStyle) {
      const nameLabel = nodeSource.nodeCreator.createLabelBinding({
        text: (dataItem) => dataItem.name,
        defaults: nameLabelDefaults,
        preferredSize: () => labelSizeDefaults
      })

      nameLabel.addLabelUpdatedListener((_, evt) => {
        nameLabel.updateText(evt.graph, evt.item, evt.dataItem)
      })
    }

    const filteredEdges = graphData.edges.filter(edgePredicate)
    const edgeSource = builder.createEdgesSource({
      data: filteredEdges,
      id: (data) => data.id,
      sourceId: (data) => data.sourceId,
      targetId: (data) => data.targetId,
      style: getEdgeStyle
    })

    const edgeLabel = edgeSource.edgeCreator.createLabelBinding({
      text: (dataItem) =>
        dataItem.type === EdgeTypeEnum.Hierarchy ? `${dataItem.ownership}` : null,
      defaults: edgeLabelDefaults
    })
    edgeSource.edgeCreator.addEdgeUpdatedListener((_, evt) => {
      edgeSource.edgeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
    })
    edgeLabel.addLabelUpdatedListener((_, evt) =>
      edgeLabel.updateText(evt.graph, evt.item, evt.dataItem)
    )

    return builder
  }

  /**
   * Loads the graph data from the JSON file.
   */
  async loadGraphData(data: string): Promise<GraphData> {
    const result = await fetch(data)
    return (await result.json()) as GraphData
  }

  /**
   * Applies the layout to the given graph.
   * @param animate True if the layout should be animated, false otherwise
   */
  async layout(animate = true): Promise<void> {
    if (this.layoutRunning) {
      return Promise.resolve()
    }
    this.layoutRunning = true

    const layout = createLayout()
    const layoutData = createLayoutData(
      this.graphComponent.graph,
      isHierarchyEdge,
      getNodeId,
      this.moveToTop
    )

    // make sure we don't have an influence on the layout, first
    this.graphComponent.viewportLimiter.bounds = null

    // run the layout
    await new LayoutExecutor({
      portAdjustmentPolicy: 'lengthen',
      layoutData: layoutData,
      layout,
      graphComponent: this.graphComponent,
      animateViewport: true,
      duration: animate ? '0.8s' : '0s',
      easedAnimation: true,
      allowUserInteraction: false
    }).start()

    // finally, set the new limits after the morphing
    this.graphComponent.viewportLimiter.bounds = this.graphComponent.viewport
    this.layoutRunning = false
  }

  /**
   * Updates the visibility of the graph if something has changed.
   */
  private graphHasChanged(): void {
    this.calculateHierarchy(this.completeGraph)
    this.updateVisibility(this.completeGraph)

    // after the graph was build, we might need to reevaluate the predicates, since the predicate for the group nodes
    // may be wrong at this time - better safe than sorry
    ;(this.graphComponent.graph as FilteredGraphWrapper).nodePredicateChanged()
  }

  /**
   * Updates the graph if something has changed.
   */
  async morphLayout(): Promise<void> {
    modifyGraph(() => {
      this.builder!.updateGraph()
      this.graphHasChanged()
    }, this.builder!.graph)

    await this.layout()
  }

  /**
   * Adds the click listener for the nodes.
   * @param listener The listener to be added
   */
  addNodeClickedListener(listener: (item: Company) => void): void {
    this.nodeClickListener = delegate.combine(listener, this.nodeClickListener)
  }

  /**
   * Adds the click listener for the edges.
   * @param listener The listener to be added
   */
  addEdgeClickedListener(listener: (item: OwnershipEdge | RelationshipEdge) => void): void {
    this.edgeClickListener = delegate.combine(listener, this.edgeClickListener)
  }
}
