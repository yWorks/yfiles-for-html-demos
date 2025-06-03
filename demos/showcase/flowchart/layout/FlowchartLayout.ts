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
/* eslint-disable @typescript-eslint/no-unnecessary-condition,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any */

import {
  BaseClass,
  DiscreteEdgeLabelPositions,
  DiscreteNodeLabelPositions,
  EdgeDataKey,
  EdgeLabelCandidates,
  EdgeLabelPlacement,
  EdgePortCandidates,
  GenericLabeling,
  GenericLabelingData,
  HierarchicalLayout,
  type HierarchicalLayoutContext,
  type HierarchicalLayoutEdgeContext,
  HierarchicalLayoutEdgeDescriptor,
  HierarchicalLayoutEdgeType,
  HierarchicalLayoutNodeType,
  type ICollection,
  type IEnumerable,
  ILayerAssigner,
  ILayoutAlgorithm,
  ILayoutStage,
  type ILinkedItemEnumerable,
  type IMapper,
  type LayoutEdge,
  LayoutExecutor,
  LayoutGraph,
  LayoutGraphAlgorithms,
  LayoutGraphHider,
  LayoutGrid,
  LayoutKeys,
  type LayoutNode,
  LayoutOrientation,
  LayoutPortCandidate,
  LayoutStageBase,
  List,
  Mapper,
  NodeDataKey,
  NodeLabelCandidates,
  NodePortCandidates,
  Point,
  PortCandidateSelector,
  PortCandidateType,
  PortSides,
  RemoveCollinearBendsStage,
  RoutingStyleDescriptor,
  TraversalDirection,
  YList
} from '@yfiles/yfiles'

import {
  getEdgeType,
  isActivity,
  isAnnotation,
  isEvent,
  isGroup,
  isMessageFlow,
  isRegularEdge,
  isStartEvent,
  isUndefined,
  MultiPageEdgeType,
  NODE_TYPE_DATA_KEY
} from './flowchart-elements'

export enum BranchDirection {
  /**
   * An undefined direction for edges.
   */
  Undefined = 0,

  /**
   * A direction in flow for edges.
   */
  WithTheFlow = 1,

  /**
   * A direction against the flow for edges.
   */
  AgainstTheFlow = 2,

  /**
   * A direction left in flow for edges.
   */
  LeftInFlow = 4,

  /**
   * A direction right in flow for edges.
   */
  RightInFlow = 8,

  /**
   * A straight direction for edges.
   */
  Straight = 3, // WithTheFlow | AgainstTheFlow

  /**
   * A direction left or right in flow for edges.
   */
  Flatwise = 12 // LeftInFlow | RightInFlow
}

/**
 * An automatic layout algorithm for flowchart diagrams. The different type of elements has to be marked with the
 * data mapper keys {@link EDGE_TYPE_DATA_KEY} and {@link NODE_TYPE_DATA_KEY}.
 */
export class FlowchartLayout extends BaseClass(ILayoutAlgorithm) {
  /**
   * Specifies whether flatwise edges are allowed.
   * Flatwise edges are same layer edges, if they aren't allowed, they will still leave their
   * source at the sides, but their target is in another layer.
   */
  allowFlatwiseEdges = true
  /**
   * Specifies the padding defining the distance between graph elements and the border of their
   * enclosing swimlanes. Defaults to 10.0
   */
  lanePadding = 10.0
  /**
   * Specifies the minimum distance between two node elements. Defaults to 15.0.
   */
  minimumEdgeDistance = 15.0
  /**
   * Specifies the minimum length of edges. Defaults to 30.0.
   */
  minimumEdgeLength = 30.0
  /**
   * Specifies the minimum distance of nodes to edge labels. Defaults to 20.0.
   */
  minimumLabelDistance = 20.0
  /**
   * Specifies the minimum distance between two node elements. Defaults to 30.0.
   */
  minimumNodeDistance = 30.0

  private $layoutOrientation: LayoutOrientation

  constructor() {
    super()
    this.$layoutOrientation = LayoutOrientation.TOP_TO_BOTTOM
  }

  /**
   * Gets the layout orientation.
   * Defaults to {@link LayoutOrientation.TOP_TO_BOTTOM}.
   * @throws {Error} if the specified orientation is not {@link LayoutOrientation.TOP_TO_BOTTOM} or
   * {@link LayoutOrientation.LEFT_TO_RIGHT}.
   */
  get layoutOrientation(): LayoutOrientation {
    return this.$layoutOrientation
  }

  /**
   * Sets the layout orientation.
   * Defaults to {@link LayoutOrientation.TOP_TO_BOTTOM}.
   * @throws {Error} if the specified orientation is not {@link LayoutOrientation.TOP_TO_BOTTOM} or
   * {@link LayoutOrientation.LEFT_TO_RIGHT}.
   */
  set layoutOrientation(value: LayoutOrientation) {
    switch (value) {
      case LayoutOrientation.TOP_TO_BOTTOM:
      case LayoutOrientation.LEFT_TO_RIGHT: {
        this.$layoutOrientation = value
        break
      }
      default: {
        throw new Error(`Invalid layout orientation: ${value}`)
      }
    }
  }

  /**
   * The main layout routine.
   * @param graph The graph to apply the layout to.
   */
  applyLayout(graph: LayoutGraph): void {
    if (graph.isEmpty) {
      return
    }

    const grid = LayoutGrid.getLayoutGrid(graph)
    if (grid) {
      // adjust padding
      grid.columns.forEach((column) => {
        column.leftPadding = this.lanePadding
        column.rightPadding = this.lanePadding
      })

      grid.rows.forEach((row) => {
        row.topPadding = this.lanePadding
        row.bottomPadding = this.lanePadding
      })
    }

    // Ensure that the LayoutExecutor class is not removed by build optimizers
    // It is needed for the 'applyLayoutAnimated' method in this demo.
    LayoutExecutor.ensure()

    try {
      const hierarchicalLayout = this.createHierarchicalLayout()
      const transformerStage = new FlowchartTransformerStage()
      transformerStage.coreLayout = hierarchicalLayout
      const layerIds = new Mapper<LayoutNode, number>()
      try {
        graph.context.addItemData(HierarchicalLayout.LAYER_INDEX_RESULT_DATA_KEY, layerIds)
        transformerStage.applyLayout(graph)
      } finally {
        graph.context.remove(HierarchicalLayout.LAYER_INDEX_RESULT_DATA_KEY)
      }
      const edge2LayoutDescriptor = new Mapper<LayoutEdge, HierarchicalLayoutEdgeDescriptor>()
      graph.edges.forEach((edge) => {
        edge2LayoutDescriptor.set(
          edge,
          this.createEdgeLayoutDescriptor(
            edge,
            graph,
            hierarchicalLayout.defaultEdgeDescriptor,
            this.isHorizontalOrientation()
          )
        )
      })
      // apply core layout
      try {
        graph.context.addItemData(FlowchartTransformerStage.LAYER_ID_DATA_KEY, layerIds)
        graph.context.addItemData(
          HierarchicalLayout.EDGE_DESCRIPTOR_DATA_KEY,
          edge2LayoutDescriptor
        )
        transformerStage.applyLayout(graph)
      } finally {
        graph.context.remove(FlowchartTransformerStage.LAYER_ID_DATA_KEY)
        graph.context.remove(HierarchicalLayout.EDGE_DESCRIPTOR_DATA_KEY)
      }
    } finally {
      // remove key set by the FlowchartPortCandidateSelector
      graph.context.remove(FlowchartPortCandidateSelector.NODE_TO_ALIGN_DATA_KEY)
    }
    applyLabelPlacement(graph)
  }

  /**
   * Returns a HierarchicalLayout instance that is configured to fit this layout's needs.
   */
  createHierarchicalLayout(): HierarchicalLayout {
    const layerer = new FlowchartLayerer()
    layerer.allowFlatwiseDefaultFlow = this.allowFlatwiseEdges
    return new HierarchicalLayout({
      groupLayeringPolicy: 'ignore-groups',
      minimumLayerDistance: this.minimumNodeDistance,
      nodeDistance: this.minimumNodeDistance,
      edgeDistance: this.minimumEdgeDistance,
      layoutOrientation: this.isHorizontalOrientation() ? 'left-to-right' : 'top-to-bottom',
      edgeLabelPlacement: EdgeLabelPlacement.IGNORE,
      componentLayout: { enabled: false },
      defaultEdgeDescriptor: new HierarchicalLayoutEdgeDescriptor({
        minimumDistance: this.minimumEdgeDistance,
        minimumLength: 15.0,
        minimumFirstSegmentLength: 20.0,
        minimumLastSegmentLength: 20.0,
        routingStyleDescriptor: new RoutingStyleDescriptor('orthogonal'),
        backLoopRouting: false
      }),
      core: {
        portCandidateSelector: new FlowchartPortCandidateSelector(),
        fromScratchLayerAssigner: layerer
      },
      coordinateAssigner: {
        straightenEdges: true
      }
    })
  }

  /**
   * Creates a descriptor that has a minimum-edge length that is long enough for a proper placement
   * of all the edge's labels.
   */
  createEdgeLayoutDescriptor(
    edge: LayoutEdge,
    graph: LayoutGraph,
    defaultDescriptor: HierarchicalLayoutEdgeDescriptor,
    horizontal: boolean
  ): HierarchicalLayoutEdgeDescriptor {
    let minLength = 0.0
    edge.labels.forEach((label) => {
      const labelSize = label.layout.toSize()
      if (isRegularEdge(graph, edge)) {
        minLength += horizontal ? labelSize.width : labelSize.height
      } else {
        minLength += horizontal ? labelSize.height : labelSize.width
      }
    })
    // add distance between labels and to the end-nodes
    if (edge.labels.size > 0) {
      minLength += this.minimumNodeDistance + (edge.labels.size - 1) * this.minimumLabelDistance
    }
    return new HierarchicalLayoutEdgeDescriptor({
      minimumDistance: defaultDescriptor.minimumDistance,
      minimumLength: Math.max(minLength, defaultDescriptor.minimumLength),
      minimumFirstSegmentLength: defaultDescriptor.minimumFirstSegmentLength,
      minimumLastSegmentLength: defaultDescriptor.minimumLastSegmentLength,
      routingStyleDescriptor: defaultDescriptor.routingStyleDescriptor
    })
  }

  /**
   * Returns whether the current layout orientation is horizontal.
   */
  isHorizontalOrientation(): boolean {
    return this.layoutOrientation === LayoutOrientation.LEFT_TO_RIGHT
  }

  /**
   * {@link IMapper} key used to specify the preferred source port direction of an edge.
   * Valid are direction type constants specified in this class.
   */
  static readonly PREFERRED_DIRECTION_DATA_KEY = new EdgeDataKey<BranchDirection>(
    'FlowchartLayout.DIRECTION_DATA_KEY'
  )

  /**
   * Returns whether the data holder represents a flatwise branch.
   */
  static isFlatwiseBranch(
    branchTypes: IMapper<LayoutEdge, BranchDirection>,
    dataHolder: LayoutEdge
  ): boolean {
    return FlowchartLayout.isFlatwiseBranchType(branchTypes.get(dataHolder)!)
  }

  /**
   * Returns whether the data holder represents a flatwise branch.
   * @param mapper Either a graph which holds a data mapper for the preferred direction or the mapper itself
   * @param dataHolder The edge to get the information for
   */
  static isStraightBranch(
    mapper: IMapper<LayoutEdge, BranchDirection> | LayoutGraph,
    dataHolder: LayoutEdge
  ): boolean {
    if (mapper instanceof LayoutGraph) {
      return FlowchartLayout.isStraightBranch(
        mapper.context.getItemData(FlowchartLayout.PREFERRED_DIRECTION_DATA_KEY)!,
        dataHolder
      )
    }
    return mapper && FlowchartLayout.isStraightBranchType(mapper.get(dataHolder)!)
  }

  /**
   * Returns whether the type represents a flatwise branch.
   */
  static isFlatwiseBranchType(type: BranchDirection): boolean {
    return type !== null && (type & BranchDirection.Flatwise) !== 0
  }

  /**
   * Returns whether the type represents a straight branch.
   */
  static isStraightBranchType(type: BranchDirection): boolean {
    return type !== null && (type & BranchDirection.Straight) !== 0
  }

  /**
   * Restores the data mapper for the given key.
   */
  static restoreDataMapper(graph: LayoutGraph, mapper: IMapper<unknown, unknown>, key: any): void {
    graph.context.remove(key)
    if (mapper) {
      graph.context.addItemData(key, mapper)
    }
  }
}

/**
 * Places the labels.
 */
function applyLabelPlacement(graph: LayoutGraph): void {
  const labeling = new GenericLabeling()
  labeling.scope = 'all'
  labeling.deterministic = true

  const labelingData = new GenericLabelingData()
  labelingData.nodeLabelCandidates = new NodeLabelCandidates().addDiscreteCandidates(
    DiscreteNodeLabelPositions.CENTER
  )

  labelingData.edgeLabelCandidates = new EdgeLabelCandidates().addDiscreteCandidates({
    labelPositions: DiscreteEdgeLabelPositions.SOURCE_HEAD | DiscreteEdgeLabelPositions.SOURCE_TAIL,
    autoRotation: false
  })

  graph.applyLayout(labeling, labelingData)
}

const DUMMY_NODE_SIZE = 2.0

enum NodeLayerType {
  Preceding = 1,
  Succeeding = 2
}

/**
 * Transforms the graph for the flowchart layout algorithm and creates related port candidates and edge groupings.
 * This class expects to find a HierarchicalLayout in its core layouts. It does its transformation,
 * invokes the core layout and finally restores the original graph.
 */
class FlowchartTransformerStage extends LayoutStageBase {
  layoutOrientation: LayoutOrientation = LayoutOrientation.TOP_TO_BOTTOM
  sourceGroupIds: IMapper<LayoutEdge, unknown> = null!
  targetGroupIds: IMapper<LayoutEdge, unknown> = null!
  sourceCandidates: IMapper<LayoutEdge, EdgePortCandidates> = null!
  targetCandidates: IMapper<LayoutEdge, EdgePortCandidates> = null!
  groupingDummiesMap: IMapper<LayoutNode, number> = null!
  dummyLayerIds: IMapper<LayoutNode, number> = null!

  protected applyLayoutImpl(graph: LayoutGraph): void {
    const hierarchicalLayout = getHierarchicalCoreLayout(this)
    if (!hierarchicalLayout) {
      return
    }
    this.layoutOrientation = hierarchicalLayout.layoutOrientation

    // Backup all data mappers this class may overwrite
    const context = graph.context
    const backupNodePcDP = context.getItemData(NodePortCandidates.NODE_PORT_CANDIDATES_DATA_KEY)!
    const backupSourceGroupDP = context.getItemData(LayoutKeys.SOURCE_EDGE_GROUP_ID_DATA_KEY)!
    const backupTargetGroupDP = context.getItemData(LayoutKeys.TARGET_EDGE_GROUP_ID_DATA_KEY)!
    const backupSourcePortCandidatesDP = context.getItemData(
      EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY
    )!
    const backupTargetPortCandidatesDP = context.getItemData(
      EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY
    )!
    context.remove(EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY)
    context.remove(EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY)

    try {
      // Don't register the new data mappers before the configuration is done
      // since the old data might be needed
      this.sourceCandidates = new Mapper<LayoutEdge, EdgePortCandidates>()
      this.targetCandidates = new Mapper<LayoutEdge, EdgePortCandidates>()
      this.configurePreferredEdgeDirections(graph)
      if (context.getItemData(LayoutKeys.TARGET_EDGE_GROUP_ID_DATA_KEY)) {
        this.dummyLayerIds = new Mapper<LayoutNode, number>()
        this.groupingDummiesMap = new Mapper<LayoutNode, number>()
        this.sourceGroupIds = new Mapper<LayoutEdge, any>()
        this.targetGroupIds = new Mapper<LayoutEdge, any>()
        this.configureInEdgeGrouping(graph)
        context.addItemData(
          FlowchartTransformerStage.GROUPING_NODES_DATA_KEY,
          this.groupingDummiesMap
        )
        context.addItemData(LayoutKeys.SOURCE_EDGE_GROUP_ID_DATA_KEY, this.sourceGroupIds)
        context.addItemData(LayoutKeys.TARGET_EDGE_GROUP_ID_DATA_KEY, this.targetGroupIds)
      }
      context.remove(NodePortCandidates.NODE_PORT_CANDIDATES_DATA_KEY)
      context.addItemData(EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY, this.sourceCandidates)
      context.addItemData(EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY, this.targetCandidates)
      // after all preparations are done
      // apply the core layout
      hierarchicalLayout.applyLayout(graph)
    } finally {
      // after the core layout:
      // clean up
      this.dummyLayerIds = null!
      this.groupingDummiesMap = null!
      this.sourceCandidates = null!
      this.targetCandidates = null!
      this.sourceGroupIds = null!
      this.targetGroupIds = null!

      // restore the original data mappers
      FlowchartLayout.restoreDataMapper(
        graph,
        backupSourcePortCandidatesDP,
        EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY
      )
      FlowchartLayout.restoreDataMapper(
        graph,
        backupTargetPortCandidatesDP,
        EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY
      )
      FlowchartLayout.restoreDataMapper(
        graph,
        backupNodePcDP,
        NodePortCandidates.NODE_PORT_CANDIDATES_DATA_KEY
      )
      FlowchartLayout.restoreDataMapper(
        graph,
        backupSourceGroupDP,
        LayoutKeys.SOURCE_EDGE_GROUP_ID_DATA_KEY
      )
      FlowchartLayout.restoreDataMapper(
        graph,
        backupTargetGroupDP,
        LayoutKeys.TARGET_EDGE_GROUP_ID_DATA_KEY
      )
      restoreOriginalGraph(graph)
      removeCollinearBends(graph)
    }
  }

  /**
   * Configures the in-edge grouping.
   * @see {@link InEdgeGroupingConfigurator}
   */
  configureInEdgeGrouping(graph: LayoutGraph): void {
    const hasLayerIds = !!graph.context.getItemData(FlowchartTransformerStage.LAYER_ID_DATA_KEY)
    const precedingGroupingConfigurator = new InEdgeGroupingConfigurator(this)
    const succeedingGroupingConfigurator = new SucceedingLayersInEdgeGroupingConfigurator(this)
    const edgesToReverse = new YList<LayoutEdge>()
    const groupingLists = getGroupingLists(graph)
    groupingLists.forEach((groupingList) => {
      if (groupingList === null || groupingList.size === 0) {
        return
      }
      if (hasLayerIds) {
        const layers = this.getInEdgesByLayer(graph, groupingList)
        precedingGroupingConfigurator.applyGrouping(layers[0], graph)
        succeedingGroupingConfigurator.applyGroupingWithReversedEdges(
          layers[1],
          graph,
          edgesToReverse
        )
      } else {
        const target = groupingList.get(0)!.target
        groupingList.forEach((edge) => {
          this.targetGroupIds.set(edge, target)
        })
      }
    })

    edgesToReverse.forEach((edge: LayoutEdge) => {
      graph.reverseEdge(edge)
      // Reverse the port candidate data if an original edge was reversed
      if (this.getGroupingType(edge.source) === 0 || this.getGroupingType(edge.target) === 0) {
        const spc = this.sourceCandidates.get(edge)
        this.sourceCandidates.set(edge, this.targetCandidates.get(edge))
        this.targetCandidates.set(edge, spc)
      }
    })
  }

  /**
   * Creates the configuration for the preferred edge directions.
   * This method creates source port candidates according
   * to the directions defined by the data mapper for the key {@link FlowchartLayout.PREFERRED_DIRECTION_DATA_KEY}.
   */
  configurePreferredEdgeDirections(graph: LayoutGraph): void {
    const directions = graph.context.getItemData(FlowchartLayout.PREFERRED_DIRECTION_DATA_KEY)
    if (!directions) {
      return
    }
    graph.nodes.forEach((node) => {
      let leftCount = 0
      let rightCount = 0

      node.outEdges.forEach((edge) => {
        const dir = directions.get(edge) ?? BranchDirection.Undefined
        if (dir === BranchDirection.LeftInFlow) {
          leftCount++
        } else if (dir === BranchDirection.RightInFlow) {
          rightCount++
        }
        this.sourceCandidates.set(edge, this.getPortCandidateCollection(dir!))
      })
      if (leftCount <= 1 && rightCount <= 1) {
        return
      }

      // If there is more than one edge to the left or right side,
      // set less restrictive candidates to allow nicer images.
      node.outEdges.forEach((edge) => {
        const dir = directions.get(edge)
        if (dir === BranchDirection.LeftInFlow || dir === BranchDirection.RightInFlow) {
          this.sourceCandidates.set(edge, this.getPortCandidateCollection(BranchDirection.Flatwise))
        }
      })
    })
  }

  /**
   * Returns the in-edges of the given node grouped by layer.
   * @returns the in-edges of the given node grouped by layer. the first array
   *   contains edges from preceding layers, the second array edges from succeeding layers.
   */
  getInEdgesByLayer(graph: LayoutGraph, groupedInEdges: YList<LayoutEdge>): YList<LayoutEdge>[][] {
    const hasLayerIds = !!graph.context.getItemData(FlowchartTransformerStage.LAYER_ID_DATA_KEY)
    const layerIndexComparer = new LayerIndexComparator(this, hasLayerIds)
    groupedInEdges.sort(layerIndexComparer.compare.bind(layerIndexComparer))
    const referenceLayer = this.getLayerId(groupedInEdges.get(0)!.target)
    const precedingLayers: YList<LayoutEdge>[] = []
    const succeedingLayers: YList<LayoutEdge>[] = []
    let previousLayer = -1
    groupedInEdges.forEach((edge: LayoutEdge) => {
      const layer = this.getLayerId(edge.source)
      const layers = layer <= referenceLayer ? precedingLayers : succeedingLayers
      if (layer !== previousLayer) {
        layers.push(new YList<LayoutEdge>())
        previousLayer = layer
      }
      layers[layers.length - 1].push(edge)
    })
    succeedingLayers.reverse()
    return [precedingLayers, succeedingLayers]
  }

  /**
   * Returns the layer id for the given node, either from the registered data mapper or from the internal dummy node
   * layer id map.
   */
  getLayerId(node: LayoutNode): number {
    return this.getGroupingType(node) !== 0
      ? this.dummyLayerIds.get(node)!
      : node.graph!.context.getItemData(FlowchartTransformerStage.LAYER_ID_DATA_KEY)!.get(node)!
  }

  /**
   * Returns the grouping type for the given node.
   */
  getGroupingType(node: LayoutNode): number {
    return this.groupingDummiesMap.get(node) ?? 0
  }

  /**
   * Returns the port candidates for the given direction.
   * One of the directions constants in {@link FlowchartLayout}.
   * @returns a collection of port candidates for the given direction.
   */
  getPortCandidateCollection(direction: BranchDirection): EdgePortCandidates {
    const edgePortCandidates = new EdgePortCandidates()
    if ((direction & BranchDirection.WithTheFlow) !== 0) {
      this.addPortCandidate(edgePortCandidates, PortSides.START_IN_FLOW)
    }
    if ((direction & BranchDirection.AgainstTheFlow) !== 0) {
      this.addPortCandidate(edgePortCandidates, PortSides.END_IN_FLOW)
    }
    if ((direction & BranchDirection.LeftInFlow) !== 0) {
      this.addPortCandidate(edgePortCandidates, PortSides.LEFT_IN_FLOW)
    }
    if ((direction & BranchDirection.RightInFlow) !== 0) {
      this.addPortCandidate(edgePortCandidates, PortSides.RIGHT_IN_FLOW)
    }
    return edgePortCandidates
  }

  /**
   * Adds the port candidate for the given direction to the list of port candidates.
   */
  addPortCandidate(edgePortCandidates: EdgePortCandidates, portSide: PortSides): void {
    switch (
      FlowchartTransformerStage.getDirectionForLayoutOrientation(this.layoutOrientation, portSide)
    ) {
      case PortSides.TOP:
        edgePortCandidates.addFreeCandidate(PortSides.TOP)
        break
      case PortSides.BOTTOM:
        edgePortCandidates.addFreeCandidate(PortSides.BOTTOM)
        break
      case PortSides.RIGHT:
        edgePortCandidates.addFreeCandidate(PortSides.RIGHT)
        break
      case PortSides.LEFT:
        edgePortCandidates.addFreeCandidate(PortSides.LEFT)
        break
      default:
    }
  }

  /**
   * DataMapper key to register layer indices for each node.
   */
  static readonly LAYER_ID_DATA_KEY = new NodeDataKey<number>(
    'FlowchartTransformerStage.LAYER_ID_DATA_KEY'
  )

  /**
   * DataMapper key to mark nodes as grouping dummies.
   */
  static readonly GROUPING_NODES_DATA_KEY = new NodeDataKey<number>(
    'FlowchartTransformerStage.GROUPING_NODES_DATA_KEY'
  )

  /**
   * Returns whether the given node is a grouping dummy created by this class.
   */
  static isGroupingDummy(graph: LayoutGraph, node: LayoutNode): boolean {
    const mapper = graph.context.getItemData(FlowchartTransformerStage.GROUPING_NODES_DATA_KEY)
    return mapper !== null && mapper.get(node)! > 0
  }

  /**
   * Returns the absolute port candidate direction for the given direction with respect to the layout orientation of
   * this layout stage.
   */
  static getDirectionForLayoutOrientation(layoutOrientation: number, direction: number): number {
    if (layoutOrientation === LayoutOrientation.TOP_TO_BOTTOM) {
      switch (direction) {
        case PortSides.END_IN_FLOW:
          return PortSides.TOP
        case PortSides.START_IN_FLOW:
          return PortSides.BOTTOM
        case PortSides.LEFT_IN_FLOW:
          return PortSides.RIGHT
        case PortSides.RIGHT_IN_FLOW:
          return PortSides.LEFT
        default:
          return -1
      }
    } else {
      switch (direction) {
        case PortSides.END_IN_FLOW:
          return PortSides.LEFT
        case PortSides.START_IN_FLOW:
          return PortSides.RIGHT
        case PortSides.LEFT_IN_FLOW:
          return PortSides.TOP
        case PortSides.RIGHT_IN_FLOW:
          return PortSides.BOTTOM
        default:
          return -1
      }
    }
  }

  /**
   * Returns a new list that contains the elements of c1.addAll(c2).
   */
  static createCombinedList<T>(c1: ICollection<T>, c2: ICollection<T>): YList<T> {
    const yList = new YList<T>(c1)
    yList.addAll(c2)
    return yList
  }
}

/**
 * Comparator, which uses the index of the edges' target nodes as an order.
 */
function edgeIndexComparator(o1: LayoutEdge, o2: LayoutEdge): 0 | 1 | -1 {
  const index1 = o1.target.index
  const index2 = o2.target.index
  if (index1 === index2) {
    return 0
  }
  return index1 < index2 ? -1 : 1
}

/**
 * Comparator, which uses the layer index of the edges' source nodes as an order.
 */
class LayerIndexComparator {
  constructor(
    private enclosing: FlowchartTransformerStage,
    private hasLayerIds: boolean
  ) {}

  compare(o1: LayoutEdge, o2: LayoutEdge): 0 | 1 | -1 {
    const n1 = o1.source
    const n2 = o2.source
    if (this.hasLayerIds && this.enclosing.getLayerId(n1) !== this.enclosing.getLayerId(n2)) {
      return this.enclosing.getLayerId(n1) < this.enclosing.getLayerId(n2) ? -1 : 1
    }
    return 0
  }
}

/**
 * Creates the grouping dummy structure.
 */
class InEdgeGroupingConfigurator {
  constructor(public enclosing: FlowchartTransformerStage) {}

  /**
   * Creates the complete grouping dummy structure.
   * @see {@link InEdgeGroupingConfigurator.createBus}
   * @see {@link InEdgeGroupingConfigurator.createGrouping}
   */
  applyGrouping(layers: YList<LayoutEdge>[], graph: LayoutGraph): void {
    if (layers.length > 0) {
      const neighborLayerNode = layers[layers.length - 1].get(0)!.source
      const nonBusEdges = this.createBus(graph, layers)
      if (nonBusEdges.size === 1) {
        this.handleSingleEdgeGrouping(nonBusEdges.get(0)!)
      } else if (nonBusEdges.size > 1) {
        this.createGrouping(nonBusEdges, neighborLayerNode, graph)
      }
    }
  }

  /**
   * Returns the grouping type of this class.
   * {@link NodeLayerType.Preceding}.
   */
  getGroupingType(): NodeLayerType {
    return NodeLayerType.Preceding
  }

  /**
   * Changes the given edge to the given nodes, and allows subclasses to reverse its direction if required.
   */
  changeEdge(graph: LayoutGraph, edge: LayoutEdge, source: LayoutNode, target: LayoutNode): void {
    graph.changeEdge(edge, source, target)
  }

  /**
   * Sets the grouping id of the given edge to the appropriate grouping id data acceptor.
   * By default, these are target group ids.
   */
  setGroupId(edge: LayoutEdge, id: any): void {
    this.enclosing.targetGroupIds.set(edge, id)
  }

  /**
   * Creates a port candidates for an edge connecting two bus dummy nodes.
   */
  createBusPortCandidate(edge: LayoutEdge): void {
    this.enclosing.sourceCandidates.set(
      edge,
      this.createStrongPortCandidate(edge, true, PortSides.START_IN_FLOW)
    )
  }

  /**
   * Creates a bus structure to group incoming edges of a single node t.
   * These edges have to come from
   * different layers which are all either in preceding layers or succeeding layers.
   * The bus is created iteratively from the most distant to the nearest layer as long as there is at most one
   * neighbor in the layer. For edges from preceding layers, in each layer except the most distant one, the bus
   * consists of a new dummy node d, the original edge which is changed from (v, t) to
   * (v, d), one incoming edge from the previous more distant layer and a new dummy edge to the next
   * less
   * layer or t. For succeeding layers, the direction of the dummy edges is reversed, that is, the edge
   * direction is always from lower layer index to higher layer index.
   * @param graph the graph.
   * @param layers all relevant edges grouped by source layer and sorted from distant
   *   layer to near.
   */
  createBus(graph: LayoutGraph, layers: YList<LayoutEdge>[]): YList<LayoutEdge> {
    const target = layers[0].get(0)!.target
    const nonSingletonLayerEdges = new YList<LayoutEdge>()
    const unfinishedEdges = new YList<LayoutEdge>()
    layers.forEach((layer) => {
      // maybe we should also check if a singleton node is connected to too many such buses
      if (nonSingletonLayerEdges.size === 0 && layer.size === 1) {
        const edge = layer.get(0)!
        if (unfinishedEdges.size === 0) {
          unfinishedEdges.addLast(edge)
        } else {
          const layerDummy = this.createDummyNode(
            graph,
            this.getGroupingType(),
            this.enclosing.getLayerId(edge.source)
          )
          // Change unfinished edges to the dummy node
          unfinishedEdges.forEach((e: LayoutEdge) => {
            this.changeEdge(graph, e, e.source, layerDummy)
            if (unfinishedEdges.size > 1) {
              this.setGroupId(e, layerDummy)
            }
          })
          unfinishedEdges.clear()

          // Create a new edge from the dummy to the target
          const e = graph.createEdge(layerDummy, target)
          unfinishedEdges.addLast(e)
          this.createBusPortCandidate(e)
          // Handle this layer's edge
          if (FlowchartLayout.isStraightBranch(graph, edge)) {
            unfinishedEdges.addLast(edge)
          } else {
            this.changeEdge(graph, edge, edge.source, layerDummy)
          }
        }
      } else {
        nonSingletonLayerEdges.addAll(layer)
      }
    })
    if (!(unfinishedEdges.size === 0)) {
      nonSingletonLayerEdges.addAll(unfinishedEdges)
    }
    return nonSingletonLayerEdges
  }

  /**
   * Handles the grouping of only one edge.
   */
  handleSingleEdgeGrouping(edge: LayoutEdge): void {
    this.enclosing.targetCandidates.set(
      edge,
      this.createStrongPortCandidate(edge, false, PortSides.END_IN_FLOW)
    )
  }

  /**
   * Creates an edge grouping for the given nonBusEdges.
   * Since grouping works best if the sources of all
   * nonBusEdges are in the neighboring layer, this method splits edges from more distant layers by adding dummy nodes
   * in the neighboring layer.
   */
  createGrouping(
    nonBusEdges: YList<LayoutEdge>,
    neighborLayerNode: LayoutNode,
    graph: LayoutGraph
  ): void {
    const groupId = nonBusEdges.get(0)!.target
    nonBusEdges.forEach((edge: LayoutEdge) => {
      this.setGroupId(edge, groupId)
      this.enclosing.targetCandidates.set(
        edge,
        this.createStrongPortCandidate(edge, false, PortSides.END_IN_FLOW)
      )
    })
  }

  /**
   * Creates a dummy node, sets its layer Id and registers it in the dummy marker map.
   */
  createDummyNode(graph: LayoutGraph, groupingType: number, layerId: number): LayoutNode {
    const dummyNode = graph.createNode()
    this.enclosing.groupingDummiesMap.set(dummyNode, groupingType)
    this.enclosing.dummyLayerIds.set(dummyNode, layerId)
    dummyNode.layout.width = DUMMY_NODE_SIZE
    dummyNode.layout.height = DUMMY_NODE_SIZE
    return dummyNode
  }

  /**
   * Creates a singleton collection containing one port candidate for the specified end node of the given edge.
   */
  createStrongPortCandidate(edge: LayoutEdge, source: boolean, dir: number): EdgePortCandidates {
    const nl = source ? edge.source.layout : edge.target.layout
    const direction = FlowchartTransformerStage.getDirectionForLayoutOrientation(
      this.enclosing.layoutOrientation,
      dir
    )
    let point: Point
    switch (direction) {
      case PortSides.TOP:
      default:
        point = new Point(0.0, -0.5 * nl.height)
        break
      case PortSides.BOTTOM:
        point = new Point(0.0, 0.5 * nl.height)
        break
      case PortSides.RIGHT:
        point = new Point(0.5 * nl.width, 0.0)
        break
      case PortSides.LEFT:
        point = new Point(-0.5 * nl.width, 0.0)
        break
    }
    return new EdgePortCandidates().addFixedCandidate(direction, new Point(point.x, point.y))
  }
}

/**
 * An {@link InEdgeGroupingConfigurator} for edges to succeeding layers.
 * Its main difference is the creation of a same layer dummy node.
 * Apart from that, this class has to set other port candidate directions and reverse some edges.
 */
class SucceedingLayersInEdgeGroupingConfigurator extends InEdgeGroupingConfigurator {
  private edgesToReverse: YList<LayoutEdge> | null = null

  /**
   * Creates the complete grouping dummy structure.
   * This class stores all edges that must be reversed after the
   * creation of all dummy structures in the given list.
   * Use this method instead of {@link SucceedingLayersInEdgeGroupingConfigurator.applyGrouping}.
   * @see {@link InEdgeGroupingConfigurator.createBus}
   * @see {@link SucceedingLayersInEdgeGroupingConfigurator.createGrouping}
   */
  applyGroupingWithReversedEdges(
    layers: YList<LayoutEdge>[],
    graph: LayoutGraph,
    edgesToReverse: YList<LayoutEdge>
  ): void {
    try {
      this.edgesToReverse = edgesToReverse
      super.applyGrouping(layers, graph)
    } finally {
      this.edgesToReverse = null
    }
  }

  /**
   * This method mustn't be called directly since it omits the required list for edges to reverse.
   * @see Overrides {@link InEdgeGroupingConfigurator.applyGrouping}
   */
  applyGrouping(layers: YList<LayoutEdge>[], graph: LayoutGraph): void {
    if (!this.edgesToReverse) {
      throw new Error('Collection of edges to reverse is not set.')
    }
    super.applyGrouping(layers, graph)
  }

  /**
   * Returns the grouping type of this class.
   * {@link NodeLayerType.Succeeding}.
   * @see Overrides {@link InEdgeGroupingConfigurator.getGroupingType}
   */
  getGroupingType(): NodeLayerType {
    return NodeLayerType.Succeeding
  }

  /**
   * Changes the given edge to the given nodes and reverses its direction.
   * @see Overrides {@link InEdgeGroupingConfigurator.changeEdge}
   */
  changeEdge(graph: LayoutGraph, edge: LayoutEdge, source: LayoutNode, target: LayoutNode): void {
    super.changeEdge(graph, edge, source, target)
    this.edgesToReverse!.addLast(edge)
  }

  /**
   * Sets the grouping id of the given edge to the appropriate grouping id data acceptor.
   * These are source group ids.
   * @see Overrides {@link InEdgeGroupingConfigurator.setGroupId}
   */
  setGroupId(edge: LayoutEdge, id: any): void {
    this.enclosing.sourceGroupIds.set(edge, id)
  }

  /**
   * Creates a port candidate for an edge connecting two bus dummy nodes.
   * @see Overrides {@link InEdgeGroupingConfigurator.createBusPortCandidate}
   */
  createBusPortCandidate(edge: LayoutEdge): void {
    this.enclosing.targetCandidates.set(
      edge,
      this.createStrongPortCandidate(edge, true, PortSides.END_IN_FLOW)
    )
  }

  /**
   * Creates a strong top candidate and reverses the edge if it comes from a dummy.
   * @see Overrides {@link InEdgeGroupingConfigurator.handleSingleEdgeGrouping}
   */
  handleSingleEdgeGrouping(edge: LayoutEdge): void {
    if (this.enclosing.groupingDummiesMap.get(edge.source)! > 0) {
      this.edgesToReverse!.addLast(edge)
    }
    this.enclosing.targetCandidates.set(
      edge,
      this.createStrongPortCandidate(edge, false, PortSides.END_IN_FLOW)
    )
  }

  /**
   * Creates an edge grouping for the given nonBusEdges.
   * Since grouping works best if the sources of all
   * nonBusEdges are in the neighboring layer, this method splits edges from more distant layers by adding dummy nodes
   * in the neighboring layer.
   * @see Overrides {@link InEdgeGroupingConfigurator.createGrouping}
   */
  createGrouping(
    nonBusEdges: YList<LayoutEdge>,
    neighborLayerNode: LayoutNode,
    graph: LayoutGraph
  ): void {
    this.prepareForGrouping(nonBusEdges, graph)
    const target = nonBusEdges.get(0)!.target
    const groupId = target
    const neighborLayerIndex = this.enclosing.getLayerId(neighborLayerNode)
    nonBusEdges.forEach((edge: LayoutEdge) => {
      let groupingEdge: LayoutEdge
      if (neighborLayerIndex === this.enclosing.getLayerId(edge.source)) {
        groupingEdge = edge
      } else {
        const layerDummy = this.createDummyNode(graph, this.getGroupingType(), neighborLayerIndex)
        this.changeEdge(graph, edge, edge.source, layerDummy)
        groupingEdge = graph.createEdge(layerDummy, target)
      }
      this.edgesToReverse!.addLast(groupingEdge)
      this.setGroupId(groupingEdge, groupId)
      this.enclosing.sourceCandidates.set(
        groupingEdge,
        this.createStrongPortCandidate(groupingEdge, false, PortSides.START_IN_FLOW)
      )
    })
  }

  /**
   * Creates a same layer dummy node for nicer grouping.
   */
  prepareForGrouping(nonBusEdges: YList<LayoutEdge>, graph: LayoutGraph): void {
    const originalTarget = nonBusEdges.get(0)!.target
    const target = this.createDummyNode(
      graph,
      this.getGroupingType(),
      this.enclosing.getLayerId(originalTarget)
    )
    const sameLayerEdge = graph.createEdge(originalTarget, target)
    this.enclosing.sourceCandidates.set(
      sameLayerEdge,
      this.createStrongPortCandidate(sameLayerEdge, true, PortSides.END_IN_FLOW)
    )
    nonBusEdges.forEach((edge: LayoutEdge) => {
      graph.changeEdge(edge, edge.source, target)
    })
  }
}

/**
 * Returns an array of edge lists,
 * each of which contains all edges with the same group id and the same target node.
 */
function getGroupingLists(graph: LayoutGraph): YList<LayoutEdge>[] {
  const groupIdDP = graph.context.getItemData(LayoutKeys.TARGET_EDGE_GROUP_ID_DATA_KEY)!
  // Partition edges according to group id
  const idToListsMap = new Map<LayoutEdge, YList<LayoutEdge>>()
  graph.edges.forEach((edge: LayoutEdge) => {
    const id = groupIdDP.get(edge) as LayoutEdge | null
    if (id) {
      if (idToListsMap.get(id)) {
        idToListsMap.get(id)!.addLast(edge)
      } else {
        const list = new YList<LayoutEdge>([edge])
        idToListsMap.set(id, list)
      }
    }
  })
  // Divide the group id partitions according to edge target nodes
  const targetGroupLists: YList<LayoutEdge>[] = []
  for (const groupList of idToListsMap.values()) {
    // Sort the edges according to target nodes such that edges with the same target have consecutive indices
    groupList.sort(edgeIndexComparator)
    // Add edges to lists and start a new list whenever a new target is found
    let targetGroupList: YList<LayoutEdge>
    groupList.forEach((edge: LayoutEdge) => {
      if (!targetGroupList || edge.target !== targetGroupList.get(0)!.target) {
        targetGroupList = new YList<LayoutEdge>()
        targetGroupLists.push(targetGroupList)
      }
      targetGroupList.addLast(edge)
    })
  }
  return targetGroupLists
}

function setEdgePath(edge: LayoutEdge, pathPoints: IEnumerable<Point>, graph: LayoutGraph): void {
  edge.resetPath()
  edge.sourcePortLocation = pathPoints.first()!
  edge.targetPortLocation = pathPoints.last()!

  pathPoints.forEach((pathPoint) => {
    graph.addBend(edge, pathPoint.x, pathPoint.y)
  })
}

function getPointListForEdge(edge: LayoutEdge): YList<Point> {
  return new YList<Point>(
    edge.pathPoints.toArray().map((pathPoint) => new Point(pathPoint.x, pathPoint.y))
  )
}

/**
 * Restores the original graph by changing all edges to their original nodes and removing all dummy nodes.
 */
function restoreOriginalGraph(graph: LayoutGraph): void {
  const groupingDummiesDP = graph.context.getItemData(
    FlowchartTransformerStage.GROUPING_NODES_DATA_KEY
  )
  if (groupingDummiesDP === null) {
    return
  }
  graph.context.remove(FlowchartTransformerStage.GROUPING_NODES_DATA_KEY)
  graph.nodes.toArray().forEach((node: LayoutNode) => {
    let outPath: YList<Point>
    const groupingDummyId = groupingDummiesDP.get(node)
    if (groupingDummyId === NodeLayerType.Preceding) {
      const outEdge = node.outEdges.get(0)!
      outPath = getPointListForEdge(outEdge)
      outPath.unshift(new Point(node.layout.center.x, node.layout.center.y))
      node.inEdges.toArray().forEach((edge: LayoutEdge) => {
        const inPath = getPointListForEdge(edge)
        inPath.pop()
        graph.changeEdge(edge, edge.source, outEdge.target)
        setEdgePath(edge, FlowchartTransformerStage.createCombinedList(inPath, outPath), graph)
      })
      graph.remove(node)
    } else if (groupingDummyId === NodeLayerType.Succeeding) {
      const inEdge = node.inEdges.get(0)
      const sourceGroupingType = groupingDummiesDP.get(inEdge.source)
      const inEdgeFromOriginal = sourceGroupingType === null || sourceGroupingType === 0
      const inPath = getPointListForEdge(inEdge)
      inPath.push(new Point(node.layout.center.x, node.layout.center.y))
      node.outEdges.toArray().forEach((edge: LayoutEdge) => {
        const targetGroupingType = groupingDummiesDP.get(edge.target)
        const outEdgeFromOriginal = targetGroupingType === null || targetGroupingType === 0
        outPath = getPointListForEdge(edge)
        outPath.shift()
        graph.changeEdge(edge, inEdge.source, edge.target)
        const combinedPath = FlowchartTransformerStage.createCombinedList(inPath, outPath)
        if (inEdgeFromOriginal && outEdgeFromOriginal) {
          // change the edge to its original targets -> reverse the edge direction
          graph.reverseEdge(edge)
          combinedPath.reverse()
        }
        makeOrthogonal(combinedPath)
        setEdgePath(edge, combinedPath, graph)
      })
      graph.remove(node)
    }
  })
}

/**
 * Fixes the orthogonality first and last segment of the edge path.
 */
function makeOrthogonal(combinedPath: YList<Point>): void {
  if (combinedPath.size < 2) {
    return
  }
  const firstCell = combinedPath.firstCell!
  const p1 = firstCell.info!
  const p2 = firstCell.next!.info!
  if (!isOrthogonal(p1, p2)) {
    const p3 = makeOrthogonalSegment(p2, p1)
    combinedPath.insertAfter(p3, firstCell)
  }
  const lastCell = combinedPath.lastCell!
  const q1 = lastCell.previous!.info!
  const q2 = lastCell.info!
  if (!isOrthogonal(q1, q2)) {
    const q3 = makeOrthogonalSegment(q1, q2)
    combinedPath.insertBefore(q3, lastCell)
  }
}

/**
 * Fixes the orthogonality the segment between the given points.
 */
function makeOrthogonalSegment(p1: Point, p2: Point): Point {
  return Math.abs(p1.x - p2.x) < Math.abs(p1.y - p2.y)
    ? new Point(p2.x, p1.y)
    : new Point(p1.x, p2.y)
}

/**
 * Checks whether the segment between the given points is orthogonal.
 */
function isOrthogonal(p1: Point, p2: Point): boolean {
  return Math.abs(p1.x - p2.x) < 0.01 || Math.abs(p1.y - p2.y) < 0.01
}

/**
 * Removes all collinear bends.
 */
function removeCollinearBends(graph: LayoutGraph): void {
  // do not remove bends of self-loops
  const selfLoopHider = new LayoutGraphHider(graph)
  selfLoopHider.hideEdges(graph.edges.filter((edge) => edge.source === edge.target))
  const collinearBendsStage = new RemoveCollinearBendsStage()
  collinearBendsStage.removeStraightOnly = false
  collinearBendsStage.applyLayout(graph)
  selfLoopHider.unhideAll()
}

/**
 * Returns the hierarchical layout algorithm that is set as core layout of the given layout stage or null
 * if none is set.
 */
function getHierarchicalCoreLayout(stage: ILayoutStage): HierarchicalLayout | null {
  const coreLayout = stage.coreLayout
  if (coreLayout instanceof HierarchicalLayout) {
    return coreLayout
  } else if (coreLayout instanceof ILayoutStage) {
    return getHierarchicalCoreLayout(coreLayout)
  }
  return null
}

enum LaneAlignment {
  Left = 0,
  Right = 1
}

enum Priority {
  Low = 1,
  Basic = 3,
  High = 5000
}

/**
 * ImplicitNumericConversion, ObjectEquality
 */
class FlowchartPortCandidateSelector extends PortCandidateSelector {
  private alignmentCalculator: FlowchartAlignmentCalculator = new FlowchartAlignmentCalculator()
  private PortCandidateSelector: PortCandidateSelector = new PortCandidateSelector()

  /**
   * Assigns new temporary port candidates after the layering information has been determined.
   * @param graph the input graph
   * @param layoutContext the context that provides access to information for the graph elements, as well
   * as the layers to which the nodes are assigned
   */
  selectAfterLayering(graph: LayoutGraph, layoutContext: HierarchicalLayoutContext): void {
    this.PortCandidateSelector.selectAfterLayering(graph, layoutContext)
  }

  /**
   * Assigns new temporary port candidates after the sequence of the nodes has been determined.
   * @param graph the input graph
   * @param layoutContext the context that provides access to information for the graph elements, as well
   * as the layers to which the nodes are assigned
   */
  selectAfterSequencing(graph: LayoutGraph, layoutContext: HierarchicalLayoutContext): void {
    super.selectAfterSequencing(graph, layoutContext)
    const edgePriority = new Mapper<LayoutEdge, number>()
    const nodeAlignment = new Mapper<LayoutNode, LayoutNode>()
    this.alignmentCalculator.determineAlignment(graph, layoutContext, nodeAlignment, edgePriority)
    this.selectPortCandidatesForAlignment(graph, layoutContext, nodeAlignment, edgePriority)
    selectCandidatesForMessageNodes(graph, layoutContext)
  }

  /**
   * Assigns new temporary port candidates to a given node of the graph after the order of the nodes in each layer
   * has been determined.
   *
   * More precisely, it is called after the sequence of the nodes has been determined.
   *
   * Incoming and outgoing edges are sorted using comparator functions which
   * define the preferred ordering of the incoming and outgoing edges from left to right.
   *
   * __Note:__ In this phase, it is not allowed to create back-loops, i.e., incoming edges mustn't connect to the
   * bottom
   * (i.e., bottom) side and outgoing edges mustn't connect to the top side of a node.
   * @param node the original node to set temporary port candidates
   * @param inEdgeOrder Induces the order for incoming edges
   * @param outEdgeOrder Induces the order for outgoing edges
   * @param graph the input graph
   * @param layoutContext Provides layout related metadata for nodes and edges
   */
  selectAfterSequencingAtNode(
    node: LayoutNode,
    inEdgeOrder: (x: LayoutEdge, y: LayoutEdge) => number,
    outEdgeOrder: (x: LayoutEdge, y: LayoutEdge) => number,
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext
  ): void {
    // set left or right temporary port candidates for the same layer edges
    node.edges.forEach((edge) => {
      if (FlowchartPortCandidateSelector.isTemporarySameLayerEdge(edge, layoutContext)) {
        const preferredSide =
          FlowchartPortCandidateSelector.getPreferredSideForTemporarySameLayerEdge(
            edge,
            layoutContext
          )
        const portCandidate = LayoutPortCandidate.createFree(preferredSide)
        const edgeContext = layoutContext.getEdgeContext(edge)!
        if (node === edge.source) {
          edgeContext.selectedSourcePortCandidate = portCandidate
        } else {
          edgeContext.selectedTargetPortCandidate = portCandidate
        }
      }
    })
    // choose final temporary port candidates for all non-assigned flatwise edges
    this.selectPortCandidatesForFlatwiseEdges(node, true, outEdgeOrder!, layoutContext)
    this.selectPortCandidatesForFlatwiseEdges(node, false, inEdgeOrder!, layoutContext)
  }

  /**
   * Chooses the final port candidates for all non-assigned flatwise edges.
   */
  selectPortCandidatesForFlatwiseEdges(
    node: LayoutNode,
    source: boolean,
    edgeOrder: (x: LayoutEdge, y: LayoutEdge) => number,
    layoutContext: HierarchicalLayoutContext
  ): void {
    const flatwiseEdges = new Set<LayoutEdge>()
    const centralEdges: LayoutEdge[] = []
    const edges = source ? node.outEdges : node.inEdges
    edges.forEach((edge) => {
      const edgeData = layoutContext.getEdgeContext(edge)!
      const portCandidate = source
        ? edgeData.selectedSourcePortCandidate
        : edgeData.selectedTargetPortCandidate
      const candidates = source ? edgeData.sourcePortCandidates : edgeData.targetPortCandidates
      if (
        portCandidate &&
        (portCandidate.isOnSide(PortSides.RIGHT) || portCandidate.isOnSide(PortSides.LEFT))
      ) {
        return
      }
      if (FlowchartPortCandidateSelector.isFlatwiseCandidateCollection(candidates!)) {
        flatwiseEdges.add(edge)
      } else {
        centralEdges.push(edge)
      }
    })
    if (flatwiseEdges.size === 0) {
      return
    }

    const flatwiseEdgesArray = Array.from(flatwiseEdges)
    centralEdges.push(...flatwiseEdgesArray)
    centralEdges.sort(edgeOrder)
    centralEdges.forEach((edge: LayoutEdge, i) => {
      if (flatwiseEdgesArray.some((flatwiseEdge) => flatwiseEdge === edge)) {
        const side = i < ((centralEdges.length / 2) | 0) ? PortSides.LEFT : PortSides.RIGHT
        const portCandidate = LayoutPortCandidate.createFree(side)
        const edgeContext = layoutContext.getEdgeContext(edge)!
        if (source) {
          edgeContext.selectedSourcePortCandidate = portCandidate
        } else {
          edgeContext.selectedTargetPortCandidate = portCandidate
        }
      }
    })
  }

  /**
   * Selects port candidates considering nodes that are aligned.
   */
  selectPortCandidatesForAlignment(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext,
    node2AlignWith: IMapper<LayoutNode, LayoutNode>,
    edge2Length: IMapper<LayoutEdge, number>
  ): void {
    graph.nodes.forEach((node) => {
      if (!this.alignmentCalculator.isSpecialNode(graph, node, layoutContext) || node.degree < 2) {
        return
      }
      const outEdgesPositionEdgeComparer = new PositionEdgeComparator(false, layoutContext)
      node.sortOutEdges(outEdgesPositionEdgeComparer.compare.bind(outEdgesPositionEdgeComparer))
      const inEdgesPositionEdgeComparer = new PositionEdgeComparator(true, layoutContext)
      node.sortInEdges(inEdgesPositionEdgeComparer.compare.bind(inEdgesPositionEdgeComparer))
      const criticalInEdge = getCriticalInEdge(node, node2AlignWith, edge2Length)
      const criticalOutEdge = getCriticalOutEdge(node, node2AlignWith, edge2Length)
      if (criticalInEdge !== null || criticalOutEdge !== null) {
        selectPortCandidatesForNodesWithCriticalEdges(
          node,
          layoutContext,
          criticalInEdge,
          criticalOutEdge
        )
      } else if (node.degree > 2) {
        selectPortCandidatesWithoutCriticalEdges(node, layoutContext)
      }
      // Parallel edges of the critical edges which have a port candidates at the left or right side must have a
      // port candidates for the same side at the opposite end, too. Otherwise, such an edge gets many bends and
      // may even destroy the alignment.
      if (criticalInEdge !== null) {
        node.inEdges.forEach((edge) => {
          if (criticalInEdge !== edge && criticalInEdge.source === edge.source) {
            const pc = layoutContext.getEdgeContext(edge)!.selectedTargetPortCandidate
            if (pc && FlowchartPortCandidateSelector.isFlatwisePortCandidate(pc)) {
              const edgeContext = layoutContext.getEdgeContext(edge)!
              edgeContext.selectedSourcePortCandidate = LayoutPortCandidate.createFree(pc.side)
            }
          }
        })
      }
      if (criticalOutEdge !== null) {
        node.outEdges.forEach((edge) => {
          if (criticalOutEdge !== edge && criticalOutEdge.target === edge.target) {
            const pc = layoutContext.getEdgeContext(edge)!.selectedSourcePortCandidate
            if (pc && FlowchartPortCandidateSelector.isFlatwisePortCandidate(pc)) {
              const edgeContext = layoutContext.getEdgeContext(edge)!
              edgeContext.selectedSourcePortCandidate = LayoutPortCandidate.createFree(pc.side)
            }
          }
        })
      }
    })
  }

  /**
   * DataMapper key to provide a node alignment.
   */
  static readonly NODE_TO_ALIGN_DATA_KEY: NodeDataKey<LayoutNode> = new NodeDataKey(
    'yWorks.Layout.Hierarchical.CoordinateAssigner.NodeToAlignWithDataKey'
  )

  /**
   * Checks whether the given edge is a temporarily inserted same layer edge.
   */
  static isTemporarySameLayerEdge(
    edge: LayoutEdge,
    layoutContext: HierarchicalLayoutContext
  ): boolean {
    return FlowchartPortCandidateSelector.isTemporarySameLayerNode(edge.target, layoutContext)
  }

  /**
   * Checks whether the given node is a dummy node connected to temporary same layer edges.
   */
  static isTemporarySameLayerNode(
    node: LayoutNode,
    layoutContext: HierarchicalLayoutContext
  ): boolean {
    return (
      node.inDegree === 2 && node.outDegree === 0 && layoutContext.getNodeContext(node) === null
    )
  }

  /**
   * Returns the preferred side where the given same layer edge should connect to it source/target node.
   */
  static getPreferredSideForTemporarySameLayerEdge(
    edge: LayoutEdge,
    layoutContext: HierarchicalLayoutContext
  ): number {
    const originalEdge = layoutContext.getEdgeContext(edge)!.associatedEdge!
    const source = originalEdge.source === edge.source
    const sData = layoutContext.getNodeContext(originalEdge.source)!
    const tData = layoutContext.getNodeContext(originalEdge.target)!
    if (sData.position < tData.position) {
      return source ? PortSides.RIGHT : PortSides.LEFT
    }
    return !source ? PortSides.RIGHT : PortSides.LEFT
  }

  /**
   * Returns all same layer edges in the graph.
   */
  static getAllSameLayerEdges(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext
  ): LayoutEdge[] {
    const sameLayerEdges: LayoutEdge[] = []
    const edge2Seen = new Mapper<LayoutEdge, boolean>()
    graph.nodes.forEach((node) => {
      const nData = layoutContext.getNodeContext(node)!
      for (let cell = nData.firstSameLayerEdgeCell; cell !== null; cell = cell.next) {
        const sameLayerEdge = cell.info!
        const opposite = sameLayerEdge.opposite(node)
        if (!edge2Seen.get(sameLayerEdge) && graph.contains(opposite)) {
          sameLayerEdges.push(sameLayerEdge)
          edge2Seen.set(sameLayerEdge, true)
        }
      }
    })
    return sameLayerEdges
  }

  /**
   * Returns all same layer edges connected to the given node.
   */
  static getSameLayerEdges(
    node: LayoutNode,
    left: boolean,
    layoutContext: HierarchicalLayoutContext
  ): LayoutEdge[] {
    const nData = layoutContext.getNodeContext(node)!
    const nPos = nData.position
    const result: LayoutEdge[] = []
    for (let cell = nData.firstSameLayerEdgeCell; cell !== null; cell = cell.next) {
      const sameLayerEdge = cell.info!
      const other = sameLayerEdge.opposite(node)
      const otherPos = layoutContext.getNodeContext(other)!.position
      if ((left && otherPos < nPos) || (!left && otherPos > nPos)) {
        result.push(sameLayerEdge)
      }
    }
    return result
  }

  /**
   * Checks whether the given node connects to at least one same layer edge.
   */
  static hasSameLayerEdge(
    n: LayoutNode,
    left: boolean,
    layoutContext: HierarchicalLayoutContext
  ): boolean {
    return !(FlowchartPortCandidateSelector.getSameLayerEdges(n, left, layoutContext).length === 0)
  }

  /**
   * Checks whether the given port candidate is flatwise (right or left).
   */
  static isFlatwisePortCandidate(portCandidate: LayoutPortCandidate | null): boolean {
    return (
      portCandidate !== null &&
      (portCandidate.isOnSide(PortSides.LEFT) || portCandidate.isOnSide(PortSides.RIGHT))
    )
  }

  /**
   * Checks whether the given candidates contain candidates to the right and left.
   */
  static isFlatwiseCandidateCollection(portCandidates: EdgePortCandidates | null): boolean {
    if (!portCandidates) {
      return false
    }
    let containsEast = false
    let containsWest = false
    portCandidates.candidates?.forEach((pc) => {
      if (!containsEast && pc.isOnSide(PortSides.RIGHT)) {
        containsEast = true
      }
      if (!containsWest && pc.isOnSide(PortSides.LEFT)) {
        containsWest = true
      }
    })
    return containsEast && containsWest
  }

  /**
   * Checks whether the given edge is goes from a higher layer back to a lower layer.
   */
  static isBackEdge(edge: LayoutEdge, layoutContext: HierarchicalLayoutContext): boolean {
    return layoutContext.getEdgeContext(edge)!.reversed
  }

  /**
   * Returns the original edge to the given (dummy) edge. If the edge is already an original edge, it is returned
   * itself.
   */
  static getOriginalEdge(edge: LayoutEdge, layoutContext: HierarchicalLayoutContext): LayoutEdge {
    const sData = layoutContext.getNodeContext(edge.source)!
    if (sData.type === HierarchicalLayoutNodeType.BEND && sData.associatedEdge !== null) {
      return sData.associatedEdge
    }
    const tData = layoutContext.getNodeContext(edge.target)!
    if (tData.type === HierarchicalLayoutNodeType.BEND && tData.associatedEdge !== null) {
      return tData.associatedEdge
    }
    return edge
  }

  /**
   * Returns the id of the swimlane to which the given node belongs.
   * If the node is not assigned to any swimlane, -1 is returned.
   */
  static getLaneId(node: LayoutNode, layoutContext: HierarchicalLayoutContext): number {
    const laneDesc = layoutContext.getNodeContext(node)!.column
    return laneDesc === null ? -1 : laneDesc.index
  }

  /**
   * Checks whether the source node is assigned to a swimlane right of the target node's swimlane.
   */
  static isToLeftPartition(
    source: LayoutNode,
    target: LayoutNode,
    layoutData: HierarchicalLayoutContext
  ): boolean {
    const sourceDesc = layoutData.getNodeContext(source)!.column
    const targetDesc = layoutData.getNodeContext(target)!.column
    return (
      sourceDesc !== targetDesc &&
      sourceDesc !== null &&
      targetDesc !== null &&
      sourceDesc.index > targetDesc.index
    )
  }

  /**
   * Checks whether the source node is assigned to a swimlane left of the target node's swimlane.
   */
  static isToRightPartition(
    source: LayoutNode,
    target: LayoutNode,
    layoutData: HierarchicalLayoutContext
  ): boolean {
    const sourceDesc = layoutData.getNodeContext(source)!.column
    const targetDesc = layoutData.getNodeContext(target)!.column
    return (
      sourceDesc !== targetDesc &&
      sourceDesc !== null &&
      targetDesc !== null &&
      sourceDesc.index < targetDesc.index
    )
  }
}

/**
 * Compare the edges of the same layers based on the end nodes' position of the specified end.
 * Ties are broken by the direction of the port candidates at the specified end, then at the opposite end, where LEFT is first
 * and RIGHT is last. It Can be used, for example, to sort in- or out-edges of a specific node in the typical best way.
 */
class PositionEdgeComparator {
  private sameLayerNodePositionComparer: SameLayerNodePositionComparer

  constructor(
    private source: boolean,
    private layoutContext: HierarchicalLayoutContext
  ) {
    this.sameLayerNodePositionComparer = new SameLayerNodePositionComparer(layoutContext)
  }

  compare(e1: LayoutEdge, e2: LayoutEdge): 0 | 1 | -1 {
    // compare positions at a specified end
    const comparePos = this.sameLayerNodePositionComparer.compare(
      this.source ? e1.source : e1.target,
      this.source ? e2.source : e2.target
    )
    if (comparePos !== 0) {
      return comparePos
    }
    // compare candidates at a specified end
    const comparePortCandidates = singleSidePortCandidateComparator(
      this.source
        ? this.layoutContext.getEdgeContext(e1)!.selectedSourcePortCandidate!
        : this.layoutContext.getEdgeContext(e1)!.selectedTargetPortCandidate!,
      this.source
        ? this.layoutContext.getEdgeContext(e2)!.selectedSourcePortCandidate!
        : this.layoutContext.getEdgeContext(e2)!.selectedTargetPortCandidate!
    )
    if (comparePortCandidates !== 0) {
      return comparePortCandidates
    }
    // compare port candidates at opposite end
    return singleSidePortCandidateComparator(
      this.source
        ? this.layoutContext.getEdgeContext(e1)!.selectedTargetPortCandidate!
        : this.layoutContext.getEdgeContext(e1)!.selectedSourcePortCandidate!,
      this.source
        ? this.layoutContext.getEdgeContext(e2)!.selectedTargetPortCandidate!
        : this.layoutContext.getEdgeContext(e2)!.selectedSourcePortCandidate!
    )
  }
}

/**
 * Compares port candidates with respect to the upper or lower side of a node, that is 'left' is first, 'right' is last,
 * and 'top' and 'bottom' are neutral elements in the middle.
 */
function singleSidePortCandidateComparator(
  pc1: LayoutPortCandidate,
  pc2: LayoutPortCandidate
): 0 | 1 | -1 {
  // we use top as a neutral element since we care only about right and left
  const b1 = pc1 ? pc1.side : PortSides.TOP
  const b2 = pc2 ? pc2.side : PortSides.TOP
  if (b1 === b2) {
    return 0
  }
  return b1 === PortSides.LEFT || b2 === PortSides.RIGHT ? -1 : 1
}

/**
 * Compares nodes in the same layer according to their positions.
 */
class SameLayerNodePositionComparer {
  constructor(private layoutContext: HierarchicalLayoutContext) {
    this.layoutContext = layoutContext
  }

  compare(o1: LayoutNode, o2: LayoutNode): 0 | 1 | -1 {
    const position1 = this.layoutContext.getNodeContext(o1)!.position
    const position2 = this.layoutContext.getNodeContext(o2)!.position
    if (position1 === position2) {
      return 0
    }
    return position1 < position2 ? -1 : 1
  }
}

/**
 * Checks whether the given edge either connects to a strong or a flatwise port.
 */
function isAtPreferredPort(
  edge: LayoutEdge,
  source: boolean,
  layoutContext: HierarchicalLayoutContext
): boolean {
  const e = FlowchartPortCandidateSelector.getOriginalEdge(edge, layoutContext)
  const edgeData = layoutContext.getEdgeContext(e)!
  const pc = source ? edgeData.selectedSourcePortCandidate : edgeData.selectedTargetPortCandidate
  return (
    pc !== null &&
    (pc.type !== PortCandidateType.FREE ||
      pc.isOnSide(PortSides.LEFT) ||
      pc.isOnSide(PortSides.RIGHT))
  )
}

/**
 * Selects port candidates without considering node alignments (critical edges).
 */
function selectPortCandidatesWithoutCriticalEdges(
  node: LayoutNode,
  layoutContext: HierarchicalLayoutContext
): void {
  if (node.outDegree > node.inDegree) {
    const firstOut = node.outEdges.get(0)!
    const lastOut = node.outEdges.get(node.outEdges.size - 1)!
    if (
      !FlowchartPortCandidateSelector.hasSameLayerEdge(node, true, layoutContext) &&
      !isAtPreferredPort(firstOut, true, layoutContext) &&
      (node.outDegree !== 2 ||
        !FlowchartPortCandidateSelector.isToRightPartition(
          firstOut.source,
          firstOut.target,
          layoutContext
        ) ||
        FlowchartPortCandidateSelector.hasSameLayerEdge(node, false, layoutContext))
    ) {
      const edgeContext = layoutContext.getEdgeContext(firstOut)!
      edgeContext.selectedSourcePortCandidate = LayoutPortCandidate.createFree(PortSides.LEFT)
    } else if (
      !FlowchartPortCandidateSelector.hasSameLayerEdge(node, false, layoutContext) &&
      !isAtPreferredPort(lastOut, true, layoutContext) &&
      (node.outDegree !== 2 ||
        !FlowchartPortCandidateSelector.isToLeftPartition(
          lastOut.source,
          lastOut.target,
          layoutContext
        ))
    ) {
      const edgeContext = layoutContext.getEdgeContext(lastOut)!
      edgeContext.selectedSourcePortCandidate = LayoutPortCandidate.createFree(PortSides.RIGHT)
    }
  } else {
    const firstIn = node.inEdges.get(0)!
    const lastIn = node.inEdges.get(node.inEdges.size - 1)!
    if (
      !FlowchartPortCandidateSelector.hasSameLayerEdge(node, true, layoutContext) &&
      !isAtPreferredPort(firstIn, false, layoutContext) &&
      (node.degree !== 3 ||
        !FlowchartPortCandidateSelector.isToRightPartition(
          firstIn.target,
          firstIn.source,
          layoutContext
        ) ||
        FlowchartPortCandidateSelector.hasSameLayerEdge(node, false, layoutContext))
    ) {
      const edgeContext = layoutContext.getEdgeContext(firstIn)!
      edgeContext.selectedTargetPortCandidate = LayoutPortCandidate.createFree(PortSides.LEFT)
    } else if (
      !FlowchartPortCandidateSelector.hasSameLayerEdge(node, false, layoutContext) &&
      !isAtPreferredPort(lastIn, false, layoutContext) &&
      (node.degree !== 3 ||
        !FlowchartPortCandidateSelector.isToLeftPartition(
          lastIn.target,
          lastIn.source,
          layoutContext
        ))
    ) {
      const edgeContext = layoutContext.getEdgeContext(lastIn)!
      edgeContext.selectedTargetPortCandidate = LayoutPortCandidate.createFree(PortSides.RIGHT)
    }
  }
}

/**
 * Selects port candidates considering node alignments (critical edges).
 */
function selectPortCandidatesForNodesWithCriticalEdges(
  node: LayoutNode,
  layoutContext: HierarchicalLayoutContext,
  criticalInEdge: LayoutEdge | null,
  criticalOutEdge: LayoutEdge | null
): void {
  const firstIn = node.inEdges.get(0)!
  const firstOut = node.outEdges.get(0)!
  const lastIn = node.inEdges.get(node.inEdges.size - 1)!
  const lastOut = node.outEdges.get(node.outEdges.size - 1)!
  if (node.degree === 3 && node.outDegree === 2 && criticalOutEdge === null) {
    // Special case: the only in-edge is critical and there are two free out-edges
    if (
      (!FlowchartPortCandidateSelector.isToRightPartition(
        firstOut.source,
        firstOut.target,
        layoutContext
      ) &&
        FlowchartPortCandidateSelector.isBackEdge(firstOut, layoutContext)) ||
      FlowchartPortCandidateSelector.isToLeftPartition(
        firstOut.source,
        firstOut.target,
        layoutContext
      )
    ) {
      selectPortCandidate(firstOut, true, PortSides.LEFT, layoutContext)
      if (
        (!FlowchartPortCandidateSelector.isToLeftPartition(
          lastOut.source,
          lastOut.target,
          layoutContext
        ) &&
          FlowchartPortCandidateSelector.isBackEdge(lastOut, layoutContext)) ||
        FlowchartPortCandidateSelector.isToRightPartition(
          lastOut.source,
          lastOut.target,
          layoutContext
        )
      ) {
        selectPortCandidate(lastOut, true, PortSides.RIGHT, layoutContext)
      }
    } else {
      selectPortCandidate(lastOut, true, PortSides.RIGHT, layoutContext)
    }
  } else if (node.degree === 3 && node.inDegree === 2 && criticalInEdge === null) {
    // Special case: the only out-edge is critical and there are two free in-edges
    if (
      (!FlowchartPortCandidateSelector.isToRightPartition(
        firstIn.target,
        firstIn.source,
        layoutContext
      ) &&
        FlowchartPortCandidateSelector.isBackEdge(firstIn, layoutContext)) ||
      FlowchartPortCandidateSelector.isToLeftPartition(
        firstIn.target,
        firstIn.source,
        layoutContext
      )
    ) {
      selectPortCandidate(firstIn, false, PortSides.LEFT, layoutContext)
      if (
        (!FlowchartPortCandidateSelector.isToRightPartition(
          lastIn.target,
          lastIn.source,
          layoutContext
        ) &&
          FlowchartPortCandidateSelector.isBackEdge(lastIn, layoutContext)) ||
        FlowchartPortCandidateSelector.isToLeftPartition(
          lastIn.target,
          lastIn.source,
          layoutContext
        )
      ) {
        selectPortCandidate(lastIn, false, PortSides.RIGHT, layoutContext)
      }
    } else {
      selectPortCandidate(lastIn, false, PortSides.RIGHT, layoutContext)
    }
  } else if (
    criticalInEdge === null ||
    (node.outDegree > node.inDegree && criticalOutEdge !== null)
  ) {
    if (!FlowchartPortCandidateSelector.hasSameLayerEdge(node, true, layoutContext)) {
      if (firstOut !== criticalOutEdge) {
        selectPortCandidate(firstOut, true, PortSides.LEFT, layoutContext)
      } else if (firstIn !== null && firstIn !== criticalInEdge && node.inDegree > 1) {
        selectPortCandidate(firstIn, false, PortSides.LEFT, layoutContext)
      }
    }
    if (!FlowchartPortCandidateSelector.hasSameLayerEdge(node, false, layoutContext)) {
      if (lastOut !== criticalOutEdge) {
        selectPortCandidate(lastOut, true, PortSides.RIGHT, layoutContext)
      } else if (lastIn !== null && lastIn !== criticalInEdge && node.inDegree > 1) {
        selectPortCandidate(lastIn, false, PortSides.RIGHT, layoutContext)
      }
    }
  } else {
    if (!FlowchartPortCandidateSelector.hasSameLayerEdge(node, true, layoutContext)) {
      if (firstIn !== criticalInEdge) {
        selectPortCandidate(firstIn, false, PortSides.LEFT, layoutContext)
      } else if (firstOut !== null && firstOut !== criticalOutEdge && node.outDegree > 1) {
        selectPortCandidate(firstOut, true, PortSides.LEFT, layoutContext)
      }
    }
    if (!FlowchartPortCandidateSelector.hasSameLayerEdge(node, false, layoutContext)) {
      if (lastIn !== criticalInEdge) {
        selectPortCandidate(lastIn, false, PortSides.RIGHT, layoutContext)
      } else if (lastOut !== null && lastOut !== criticalOutEdge && node.outDegree > 1) {
        selectPortCandidate(lastOut, true, PortSides.RIGHT, layoutContext)
      }
    }
  }
}

/**
 * Sets a temporary port candidate when the given edge doesn't yet connect to a preferred port.
 */
function selectPortCandidate(
  edge: LayoutEdge,
  source: boolean,
  direction: number,
  layoutContext: HierarchicalLayoutContext
): void {
  if (!isAtPreferredPort(edge, source, layoutContext)) {
    const edgeContext = layoutContext.getEdgeContext(edge)!
    if (source) {
      edgeContext.selectedSourcePortCandidate = LayoutPortCandidate.createFree(direction)
    } else {
      edgeContext.selectedTargetPortCandidate = LayoutPortCandidate.createFree(direction)
    }
  }
}

/**
 * Special handling for messages (always attach them to the side of nodes).
 */
function selectCandidatesForMessageNodes(
  graph: LayoutGraph,
  layoutContext: HierarchicalLayoutContext
): void {
  const edges = graph.edges.toArray()
  edges.push(...FlowchartPortCandidateSelector.getAllSameLayerEdges(graph, layoutContext))
  edges.forEach((e: LayoutEdge) => {
    const original = FlowchartPortCandidateSelector.getOriginalEdge(e, layoutContext)
    const sourceLaneId = FlowchartPortCandidateSelector.getLaneId(original.source, layoutContext)
    const targetLaneId = FlowchartPortCandidateSelector.getLaneId(original.target, layoutContext)
    if (isMessageFlow(graph, e) && sourceLaneId !== targetLaneId) {
      if (
        layoutContext.getNodeContext(e.source)!.type === HierarchicalLayoutNodeType.REGULAR &&
        isActivity(graph, e.source)
      ) {
        const edgeContext = layoutContext.getEdgeContext(e)!
        edgeContext.selectedSourcePortCandidate = LayoutPortCandidate.createFree(
          sourceLaneId < targetLaneId ? PortSides.RIGHT : PortSides.LEFT
        )
      }
      if (
        layoutContext.getNodeContext(e.target)!.type === HierarchicalLayoutNodeType.REGULAR &&
        isActivity(graph, e.target)
      ) {
        const edgeContext = layoutContext.getEdgeContext(e)!
        edgeContext.selectedTargetPortCandidate = LayoutPortCandidate.createFree(
          sourceLaneId < targetLaneId ? PortSides.LEFT : PortSides.RIGHT
        )
      }
    }
  })
}

/**
 * Returns an in-edge for the given node which comes from the node it is aligned with.
 * If several such edges exist,
 * the edge with the highest length is returned.
 */
function getCriticalInEdge(
  node: LayoutNode,
  node2AlignWith: IMapper<LayoutNode, LayoutNode>,
  edge2Length: IMapper<LayoutEdge, number>
): LayoutEdge | null {
  let bestEdge: LayoutEdge | null = null
  node.inEdges.forEach((edge) => {
    if (
      node2AlignWith.get(node) === edge.source &&
      (bestEdge === null || edge2Length.get(bestEdge)! < edge2Length.get(edge)!)
    ) {
      bestEdge = edge
    }
  })
  return bestEdge
}

/**
 * Returns an out-edge for the given node which goes to the node it is aligned with.
 * If several such edges exist, the
 * edge with the highest length is returned.
 */
function getCriticalOutEdge(
  node: LayoutNode,
  node2AlignWith: IMapper<LayoutNode, LayoutNode>,
  edge2Length: IMapper<LayoutEdge, number>
): LayoutEdge | null {
  let bestEdge: LayoutEdge | null = null
  node.outEdges.forEach((edge) => {
    if (
      node2AlignWith.get(edge.target) === node &&
      (bestEdge === null || edge2Length.get(bestEdge)! < edge2Length.get(edge)!)
    ) {
      bestEdge = edge
    }
  })
  return bestEdge
}

const WEIGHT_DEFAULT_EDGE = 3
const WEIGHT_DEFAULT_EDGE_IN_SUBPROCESS = 5
const WEIGHT_MESSAGE_FLOW = 3
const WEIGHT_ASSOCIATION = 2
const MIN_LENGTH_DEFAULT_EDGE = 1
const MIN_LENGTH_FLATWISE_BRANCH = 0
const MIN_LENGTH_MESSAGE_FLOW = 0
const MIN_LENGTH_ASSOCIATION = 0
const CYCLE_WEIGHT_BACK_EDGE = 1.0
const CYCLE_WEIGHT_NON_BACK_EDGE = 5.0

/**
 * Customized layering for flowcharts.
 */
class FlowchartLayerer extends BaseClass(ILayerAssigner) {
  private $assignStartNodesToLeftOrTop = false
  private $allowFlatwiseDefaultFlow = false

  /**
   * Returns whether start nodes are assigned at the top or to the left of the layout.
   */
  get assignStartNodesToLeftOrTop(): boolean {
    return this.$assignStartNodesToLeftOrTop
  }

  /**
   * Sets whether start nodes are assigned at the top or to the left of the layout.
   */
  set assignStartNodesToLeftOrTop(value: boolean) {
    this.$assignStartNodesToLeftOrTop = value
  }

  /**
   * Returns whether a flatwise default flow is allowed.
   */
  get allowFlatwiseDefaultFlow(): boolean {
    return this.$allowFlatwiseDefaultFlow
  }

  /**
   * Sets whether a flatwise default flow is allowed.
   */
  set allowFlatwiseDefaultFlow(value: boolean) {
    this.$allowFlatwiseDefaultFlow = value
  }

  assignLayers(graph: LayoutGraph, layoutContext: HierarchicalLayoutContext): void {
    const reversedEdges = reverseCycles(graph)
    // assign weights/min length to edges
    const hider = new LayoutGraphHider(graph)
    const minLength = graph.createEdgeDataMap<number>()
    const node2Layer = graph.createNodeDataMap<number>()
    const weight = graph.createEdgeDataMap<number>()
    try {
      // transform graph
      const dummies = this.insertDummyEdges(graph, hider, weight, minLength)
      dummies.addLast(this.insertSuperRoot(graph, weight, minLength))
      // assign layers
      LayoutGraphAlgorithms.simplexRankAssignment(graph, node2Layer, weight, minLength)
      // undo graph transformation
      dummies.forEach((dummy: LayoutNode) => {
        graph.remove(dummy)
      })
      hider.unhideAll()
      reversedEdges.forEach((edge: LayoutEdge) => {
        graph.reverseEdge(edge)
      })

      // special handling for some single degree nodes (draw the incident edge as the same layer edge)
      graph.nodes.forEach((node) => {
        if (isDegreeOneNode(node, layoutContext)) {
          handleDegreeOneNode(node, graph, node2Layer, layoutContext)
        }
      })
      // build result data structure
      const layers = layoutContext.layers
      const layerCount = normalize(graph, node2Layer)
      for (let i = 0; i < layerCount; i++) {
        layoutContext.insertLayer('regular', i)
      }
      graph.nodes.forEach((node) => {
        const layer = node2Layer.get(node)!
        layers.get(layer)!.add(node)
      })
    } finally {
      // dispose
      graph.disposeEdgeDataMap(weight)
      graph.disposeEdgeDataMap(minLength)
      graph.disposeNodeDataMap(node2Layer)
    }
  }

  /**
   * Inserts dummy edges to support the flowchart layering.
   */
  insertDummyEdges(
    graph: LayoutGraph,
    hider: LayoutGraphHider,
    weight: IMapper<LayoutEdge, number>,
    minLength: IMapper<LayoutEdge, number>
  ): YList<LayoutNode> {
    const nodeTypeSet = graph.context.getItemData(NODE_TYPE_DATA_KEY) !== null

    const preferredDirectionDP = graph.context.getItemData(
      FlowchartLayout.PREFERRED_DIRECTION_DATA_KEY
    )!
    const groupingNodesDP = graph.context.getItemData(
      FlowchartTransformerStage.GROUPING_NODES_DATA_KEY
    )!
    const targetGroupIdDP = graph.context.getItemData(LayoutKeys.TARGET_EDGE_GROUP_ID_DATA_KEY)!
    const outEdgeBranchTypes = graph.createNodeDataMap<number>()
    graph.nodes.forEach((node) => {
      let type = 0
      node.outEdges.forEach((edge) => {
        type |= preferredDirectionDP.get(edge)!
      })
      outEdgeBranchTypes.set(node, type)
    })
    const dummies = new YList<LayoutNode>()
    graph.edges.forEach((edge) => {
      let dummyEdge2: LayoutEdge
      let dummyEdge1: LayoutEdge
      let dummyNode: LayoutNode
      switch (getType(graph, edge)) {
        case MultiPageEdgeType.MessageFlow: {
          dummyNode = graph.createNode()
          dummies.addLast(dummyNode)
          dummyEdge1 = graph.createEdge(edge.source, dummyNode)
          weight.set(dummyEdge1, WEIGHT_MESSAGE_FLOW)
          minLength.set(dummyEdge1, MIN_LENGTH_MESSAGE_FLOW)
          dummyEdge2 = graph.createEdge(edge.target, dummyNode)
          weight.set(dummyEdge2, WEIGHT_MESSAGE_FLOW)
          minLength.set(dummyEdge2, MIN_LENGTH_MESSAGE_FLOW)
          hider.hide(edge)
          break
        }
        case MultiPageEdgeType.Association: {
          dummyNode = graph.createNode()
          dummies.addLast(dummyNode)
          dummyEdge1 = graph.createEdge(edge.source, dummyNode)
          weight.set(dummyEdge1, WEIGHT_ASSOCIATION)
          minLength.set(dummyEdge1, MIN_LENGTH_ASSOCIATION)
          dummyEdge2 = graph.createEdge(edge.target, dummyNode)
          weight.set(dummyEdge2, WEIGHT_ASSOCIATION)
          minLength.set(dummyEdge2, MIN_LENGTH_ASSOCIATION)
          hider.hide(edge)
          break
        }
        default: {
          weight.set(
            edge,
            isContainedInSubProcess(edge, graph, nodeTypeSet)
              ? WEIGHT_DEFAULT_EDGE_IN_SUBPROCESS
              : WEIGHT_DEFAULT_EDGE
          )
          if (
            isFlatwiseConnectorGroupingEdge(groupingNodesDP, edge) &&
            !FlowchartLayout.isStraightBranch(preferredDirectionDP, edge)
          ) {
            minLength.set(edge, MIN_LENGTH_FLATWISE_BRANCH)
          } else if (isFirstGroupingEdgeToSucceedingLayers(groupingNodesDP, edge)) {
            minLength.set(edge, MIN_LENGTH_FLATWISE_BRANCH)
          } else if (
            !this.$allowFlatwiseDefaultFlow ||
            !FlowchartLayout.isFlatwiseBranch(preferredDirectionDP, edge) ||
            containsOnlyFlatwise(outEdgeBranchTypes.get(edge.target)!) ||
            isValueSet(targetGroupIdDP, edge)
          ) {
            minLength.set(edge, MIN_LENGTH_DEFAULT_EDGE)
          } else {
            minLength.set(edge, MIN_LENGTH_FLATWISE_BRANCH)
          }
          break
        }
      }
    })
    return dummies
  }

  /**
   * Inserts a super root to guarantee that the graph is connected.
   */
  insertSuperRoot(
    graph: LayoutGraph,
    weight: IMapper<LayoutEdge, number>,
    minLength: IMapper<LayoutEdge, number>
  ): LayoutNode {
    const superRoot = graph.createNode()
    graph.nodes.forEach((node) => {
      if (node !== superRoot && node.inDegree === 0) {
        const previewEdge = graph.createEdge(superRoot, node)
        weight.set(
          previewEdge,
          this.$assignStartNodesToLeftOrTop && isStartEvent(graph, node) ? 100 : 0
        )
        minLength.set(previewEdge, 0)
      }
    })
    return superRoot
  }
}

/**
 * Reverses the edges in a circle.
 */
function reverseCycles(graph: LayoutGraph): LayoutEdge[] {
  // we only consider edges of type sequence flow
  const hider = new LayoutGraphHider(graph)
  graph.edges.forEach((e) => {
    if (getType(graph, e) !== MultiPageEdgeType.SequenceFlow) {
      hider.hide(e)
    }
  })
  const edge2Weight = graph.createEdgeDataMap<number>()
  const cyclingEdges = graph.createEdgeDataMap<boolean>()
  let reversedEdges: LayoutEdge[]
  try {
    // try to identify back-edges and assign lower weights to them
    const coreNodes = new YList<LayoutNode>()
    graph.nodes.forEach((node) => {
      if (node.inDegree === 0) {
        coreNodes.addLast(node)
      }
    })
    const node2Depth = graph.createNodeDataMap<number>()
    try {
      LayoutGraphAlgorithms.bfs(graph, coreNodes, node2Depth, TraversalDirection.BOTH)
      graph.edges.forEach((edge) => {
        if (node2Depth.get(edge.source)! > node2Depth.get(edge.target)!) {
          // likely to be a back-edge
          edge2Weight.set(edge, CYCLE_WEIGHT_BACK_EDGE)
        } else {
          edge2Weight.set(edge, CYCLE_WEIGHT_NON_BACK_EDGE)
        }
      })
    } finally {
      graph.disposeNodeDataMap(node2Depth)
    }
    // find and remove cycles
    reversedEdges = []
    LayoutGraphAlgorithms.findCycleEdges(graph, cyclingEdges, edge2Weight)

    graph.edges.forEach((e) => {
      if (cyclingEdges.get(e)) {
        graph.reverseEdge(e)
        reversedEdges.push(e)
      }
    })
  } finally {
    graph.disposeEdgeDataMap(cyclingEdges)
    graph.disposeEdgeDataMap(edge2Weight)
    hider.unhideAll()
  }
  return reversedEdges
}

/**
 * Returns the type of the given edge.
 */
function getType(graph: LayoutGraph, edge: LayoutEdge): number {
  if (!isUndefined(graph, edge)) {
    return getEdgeType(graph, edge)
  }

  // special handling if constraint incremental layerer calls this layerer
  const originalEdgeDataKey = new EdgeDataKey<LayoutEdge>(
    'y.layout.hierarchical.incremental.ConstraintIncrementalLayerer.ORIG_EDGES'
  )
  const edge2OrigEdge = graph.context.getItemData(originalEdgeDataKey)
  if (edge2OrigEdge && edge2OrigEdge.get(edge)) {
    const realEdge = edge2OrigEdge.get(edge)!
    if (!isUndefined(realEdge.graph!, realEdge)) {
      return getType(realEdge.graph!, realEdge)
    }
  }
  return isAnnotation(graph, edge.source) || isAnnotation(graph, edge.target)
    ? MultiPageEdgeType.Association
    : MultiPageEdgeType.SequenceFlow
}

/**
 * Checks whether the edge's source and target node are contained in the same group node.
 */
function isContainedInSubProcess(
  edge: LayoutEdge,
  graph: LayoutGraph,
  considerNodeType: boolean
): boolean {
  const sourceParent = graph.getParent(edge.source) as LayoutNode | null
  const targetParent = graph.getParent(edge.target) as LayoutNode | null
  return (
    sourceParent !== null &&
    sourceParent === targetParent &&
    (!considerNodeType || isGroup(graph, sourceParent))
  )
}

/**
 * Returns whether the given node has a real degree of 1. This doesn't count dummy edges.
 */
function isDegreeOneNode(n: LayoutNode, layoutContext: HierarchicalLayoutContext): boolean {
  let realDegree = 0
  for (const edge of n.edges) {
    if (isNormalEdge(layoutContext.getEdgeContext(edge))) {
      realDegree++
      if (realDegree > 1) {
        return false
      }
    }
  }
  return realDegree === 1
}

function getLayerDiff(node2Layer: IMapper<LayoutNode, number>, edge: LayoutEdge): number {
  return (node2Layer.get(edge.source) ?? 0) - (node2Layer.get(edge.target) ?? 0)
}

/**
 * Assigns 1-degree nodes to layers.
 */
function handleDegreeOneNode(
  node: LayoutNode,
  graph: LayoutGraph,
  node2Layer: IMapper<LayoutNode, number>,
  layoutContext: HierarchicalLayoutContext
): void {
  if (!isEvent(graph, node) || isStartEvent(graph, node)) {
    return
  }
  const realEdge = findIncidentRealEdge(layoutContext, node)
  if (realEdge === null) {
    return
  }
  const opposite = realEdge.opposite(node)
  let sameLayerEdgeCount = 0
  let oppositeOutDegree = 0
  let oppositeInDegree = 0
  opposite.outEdges.forEach((edge) => {
    if (edge !== realEdge && isNormalEdge(layoutContext.getEdgeContext(edge))) {
      const layerDiff = getLayerDiff(node2Layer, edge)
      if (layerDiff > 0) {
        oppositeInDegree++
      } else if (layerDiff === 0) {
        sameLayerEdgeCount++
      } else {
        oppositeOutDegree++
      }
    }
  })

  opposite.inEdges.forEach((edge) => {
    if (edge !== realEdge && isNormalEdge(layoutContext.getEdgeContext(edge))) {
      const layerDiff = getLayerDiff(node2Layer, edge)
      if (layerDiff > 0) {
        oppositeOutDegree++
      } else if (layerDiff === 0) {
        sameLayerEdgeCount++
      } else {
        oppositeInDegree++
      }
    }
  })

  if (
    (realEdge.target === node &&
      sameLayerEdgeCount < 2 &&
      oppositeOutDegree >= 1 &&
      oppositeInDegree <= 2) ||
    (realEdge.source === node &&
      sameLayerEdgeCount < 2 &&
      oppositeInDegree >= 1 &&
      oppositeOutDegree <= 2)
  ) {
    node2Layer.set(node, node2Layer.get(opposite)!)
  }
}

/**
 * Checks whether the given edge is a normal edge and no dummy edge.
 */
function isNormalEdge(eData: HierarchicalLayoutEdgeContext | null): boolean {
  return eData !== null && eData.type === HierarchicalLayoutEdgeType.REGULAR
}

/**
 * Returns the first original edge connected to the given node.
 */
function findIncidentRealEdge(
  layoutContext: HierarchicalLayoutContext,
  node: LayoutNode
): LayoutEdge | null {
  for (const edge of node.edges) {
    if (isNormalEdge(layoutContext.getEdgeContext(edge))) {
      return edge
    }
  }
  return null
}

/**
 * Checks whether the given branch type describes only flatwise directions.
 */
function containsOnlyFlatwise(branchType: BranchDirection): boolean {
  return (branchType ?? 0) !== 0 && (branchType & BranchDirection.Straight) === 0
}

/**
 * Checks whether the given edge is a flatwise grouping edge.
 */
function isFlatwiseConnectorGroupingEdge(
  groupingDummies: IMapper<LayoutNode, number>,
  edge: LayoutEdge
): boolean {
  return (
    groupingDummies !== null &&
    ((edge.target.inDegree > 1 &&
      (groupingDummies.get(edge.source) ?? 0) === 0 &&
      groupingDummies.get(edge.target) === NodeLayerType.Preceding) ||
      (edge.source.outDegree > 1 &&
        (groupingDummies.get(edge.target) ?? 0) === 0 &&
        groupingDummies.get(edge.source) === NodeLayerType.Succeeding))
  )
}

/**
 * Checks whether the given edge is the first grouping edge to a succeeding layer.
 */
function isFirstGroupingEdgeToSucceedingLayers(
  groupingDummies: IMapper<LayoutNode, number>,
  edge: LayoutEdge
): boolean {
  return (
    groupingDummies !== null &&
    (groupingDummies.get(edge.source) ?? 0) === 0 &&
    groupingDummies.get(edge.target) === NodeLayerType.Succeeding
  )
}

/**
 * Checks whether the given IMapper contains a value for the given edge.
 */
function isValueSet(mapper: IMapper<LayoutEdge, any>, edge: LayoutEdge): boolean {
  return mapper !== null && mapper.get(edge) !== null
}

/**
 * Removes empty layers and ensures that the smallest layer has value 0.
 */
function normalize(graph: LayoutGraph, layer: IMapper<LayoutNode, number>): number {
  if (graph.nodes.size === 0) {
    return 0
  }
  const nodes = graph.nodes.toArray()
  nodes.sort((node1, node2) => {
    const layer1 = layer.get(node1)!
    const layer2 = layer.get(node2)!
    if (layer1 === layer2) {
      return 0
    }
    return layer1 < layer2 ? -1 : 1
  })
  let lastLayer = layer.get(nodes[0])
  let realLayer = 0
  for (let i = 0; i < nodes.length; i++) {
    const currentLayer = layer.get(nodes[i])
    if (currentLayer !== lastLayer) {
      realLayer++
      lastLayer = currentLayer
    }
    layer.set(nodes[i], realLayer)
  }
  return realLayer + 1
}

/**
 * A calculator for aligning the longest paths in the flowchart diagram.
 */
class FlowchartAlignmentCalculator {
  layoutOrientation: LayoutOrientation = LayoutOrientation.TOP_TO_BOTTOM

  determineAlignment(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext,
    nodeAlignment: IMapper<LayoutNode, LayoutNode>,
    edgeLength: IMapper<LayoutEdge, number>
  ): void {
    const sourcePositionEdgeComparer = new PositionEdgeComparator(true, layoutContext)
    const targetPositionEdgeComparer = new PositionEdgeComparator(false, layoutContext)
    graph.sortEdges(
      sourcePositionEdgeComparer.compare.bind(sourcePositionEdgeComparer),
      targetPositionEdgeComparer.compare.bind(targetPositionEdgeComparer)
    )

    const edgeIsAlignable = this.determineAlignableEdges(graph, layoutContext)
    this.determineEdgeLengths(graph, layoutContext, edgeIsAlignable, edgeLength)
    const edgePriority = determineEdgePriorities(graph, edgeIsAlignable, edgeLength)
    const nodeAlignmentCalculator = new NodeAlignmentCalculator(this.layoutOrientation)
    nodeAlignmentCalculator.calculateAlignment(
      graph,
      layoutContext,
      edgeIsAlignable,
      edgePriority,
      nodeAlignment
    )
    graph.context.addItemData(FlowchartPortCandidateSelector.NODE_TO_ALIGN_DATA_KEY, nodeAlignment)
  }

  /**
   * Checks whether the given node is not an annotation or grouping dummy.
   */
  isSpecialNode(
    graph: LayoutGraph,
    node: LayoutNode,
    layoutContext: HierarchicalLayoutContext
  ): boolean {
    return (
      layoutContext.getNodeContext(node)!.type === HierarchicalLayoutNodeType.REGULAR &&
      !isAnnotation(node.graph!, node) &&
      !FlowchartTransformerStage.isGroupingDummy(graph, node)
    )
  }

  /**
   * Checks whether the given edge is relevant for the layout direction. Only non-message-flow edges are
   * relevant.
   */
  isRelevant(graph: LayoutGraph, e: LayoutEdge, layoutContext: HierarchicalLayoutContext): boolean {
    return !isMessageFlow(graph, FlowchartPortCandidateSelector.getOriginalEdge(e, layoutContext))
  }

  /**
   * Returns true if the given edge can be aligned, that is its port candidates aren't flatwise, and its end nodes
   * aren't in different swimlanes and don't belong to different groups.
   */
  isAlignable(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext,
    edge: LayoutEdge
  ): boolean {
    const edgeData = layoutContext.getEdgeContext(edge)!
    if (hasFlatwisePortCandidate(edgeData) || hasFlatwiseCandidateCollection(edgeData)) {
      return false
    }
    const source = edge.source
    const target = edge.target
    const laneId1 = FlowchartPortCandidateSelector.getLaneId(source, layoutContext)
    const laneId2 = FlowchartPortCandidateSelector.getLaneId(target, layoutContext)
    if (laneId1 !== -1 && laneId1 !== laneId2) {
      return false
    }

    const sourceParent = graph.getParent(source)
    const targetParent = graph.getParent(target)

    return sourceParent === null || sourceParent === targetParent
  }

  /**
   * Collects all edges that are relevant and alignable.
   */
  determineAlignableEdges(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext
  ): Map<LayoutEdge, boolean> {
    const edgeIsAlignable = new Map<LayoutEdge, boolean>()
    graph.edges.forEach((edge) => {
      edgeIsAlignable.set(
        edge,
        this.isAlignable(graph, layoutContext, edge) && this.isRelevant(graph, edge, layoutContext)
      )
    })
    return edgeIsAlignable
  }

  /**
   * Determines edge lengths such that, in the longest paths, edges are preferred that guarantee
   * a suitable port assignment.
   */
  determineEdgeLengths(
    graph: LayoutGraph,
    layoutData: HierarchicalLayoutContext,
    edgeIsAlignable: Map<LayoutEdge, boolean>,
    edgeLength: IMapper<LayoutEdge, number>
  ): void {
    const ZeroLength = 0
    const BasicDummyEdgeLength = 1
    const BasicEdgeLength = 5
    const PenaltyLength = BasicEdgeLength + graph.nodes.size
    const HighPenaltyLength = PenaltyLength * 8
    graph.edges.forEach((e) => {
      if (hasFlatwisePortCandidate(layoutData.getEdgeContext(e)!)) {
        edgeLength.set(e, ZeroLength)
      } else if (isRealEdge(e, layoutData)) {
        edgeLength.set(e, BasicEdgeLength)
      } else {
        edgeLength.set(e, BasicDummyEdgeLength)
      }
    })
    graph.nodes.forEach((node) => {
      let i: number
      let edges: LayoutEdge[]
      const nodeData = layoutData.getNodeContext(node)!
      const type = nodeData.type

      //ensure that edges at the node are sorted based on the sequence position of the opposite node
      const comparator = (e1: LayoutEdge, e2: LayoutEdge): number => {
        const opp1 = layoutData.getNodeContext(e1.opposite(node))!
        const opp2 = layoutData.getNodeContext(e2.opposite(node))!
        return Math.sign(opp1.position - opp2.position)
      }
      node.sortOutEdges(comparator)

      node.sortInEdges(comparator)

      if (
        type === HierarchicalLayoutNodeType.SOURCE_GROUP_NODE ||
        type === HierarchicalLayoutNodeType.TARGET_GROUP_NODE
      ) {
        // assign higher length to inner edges
        edges =
          type === HierarchicalLayoutNodeType.SOURCE_GROUP_NODE
            ? node.outEdges.toArray()
            : node.inEdges.toArray()
        for (i = 1; i < edges.length - 1; i++) {
          edgeLength.set(edges[i], edgeLength.get(edges[i])! + BasicEdgeLength)
        }
      }
      if (!this.isSpecialNode(graph, node, layoutData) || node.degree < 3) {
        return
      }
      if (node.outDegree === 2 && node.inDegree === 2) {
        const firstIn = node.inEdges.get(0)
        const firstOut = node.outEdges.get(0)

        const lastIn = node.inEdges.get(node.inEdges.size - 1)
        const lastOut = node.outEdges.get(node.outEdges.size - 1)
        const preventFirstIn = !edgeIsAlignable.get(firstIn) || !edgeIsAlignable.get(lastOut)
        const preventFirstOut = !edgeIsAlignable.get(firstOut) || !edgeIsAlignable.get(lastIn)
        if (!preventFirstOut || !preventFirstIn) {
          if (preventFirstIn) {
            edgeLength.set(firstIn, ZeroLength)
            edgeLength.set(lastOut, ZeroLength)
          }
          if (preventFirstOut) {
            edgeLength.set(firstOut, ZeroLength)
            edgeLength.set(lastIn, ZeroLength)
          }
          if (
            edgeLength.get(firstIn)! + edgeLength.get(lastOut)! >
            edgeLength.get(lastIn)! + edgeLength.get(firstOut)!
          ) {
            edgeLength.set(firstIn, edgeLength.get(firstIn)! + HighPenaltyLength)
            edgeLength.set(lastOut, edgeLength.get(lastOut)! + HighPenaltyLength)
          } else {
            edgeLength.set(lastIn, edgeLength.get(lastIn)! + HighPenaltyLength)
            edgeLength.set(firstOut, edgeLength.get(firstOut)! + HighPenaltyLength)
          }
          return
        }
      }
      let hasStraightBranch = false
      node.edges.forEach((edge) => {
        if (isStraightBranch(graph, edge, layoutData)) {
          hasStraightBranch = true
          edgeLength.set(edge, edgeLength.get(edge)! + PenaltyLength)
        }
      })
      if (!hasStraightBranch) {
        edges = node.outDegree >= node.inDegree ? node.outEdges.toArray() : node.inEdges.toArray()
        // assign high length to inner edges (the two non-inner edges should be attached to the side ports)
        for (i = 1; i < edges.length - 1; i++) {
          edgeLength.set(edges[i], edgeLength.get(edges[i])! + PenaltyLength)
        }
      }
    })
  }
}

/**
 * Calculator for node alignments.
 */
class NodeAlignmentCalculator {
  constructor(private layoutOrientation: LayoutOrientation) {}

  /**
   * Checks whether the current layout orientation is horizontal (i.e. left-to-right)
   */
  isHorizontalOrientation(): boolean {
    return this.layoutOrientation === LayoutOrientation.LEFT_TO_RIGHT
  }

  calculateAlignment(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext,
    edgeAlignable: Map<LayoutEdge, boolean>,
    edgePriority: Map<LayoutEdge, number>,
    nodeAlignment: IMapper<LayoutNode, LayoutNode>
  ): void {
    const grid = LayoutGrid.getLayoutGrid(graph)
    if (grid === null) {
      this.calculateAlignmentImpl(graph, layoutContext, edgeAlignable, edgePriority, nodeAlignment)
    } else {
      const graphHider = new LayoutGraphHider(graph)
      // create graph partitions
      const partitions: List<LayoutNode>[] = []
      graph.nodes.forEach((node) => {
        const layoutGridId = this.getLaneId(node, layoutContext)
        if (!partitions[layoutGridId]) {
          partitions[layoutGridId] = new List()
        }
        partitions[layoutGridId].push(node)
      })
      try {
        graphHider.hideAll()
        for (let i = 0; i < grid.columns.size; i++) {
          graphHider.showOnly(partitions[i])
          if (graph.nodes.size > 1) {
            this.calculateAlignmentImpl(
              graph,
              layoutContext,
              edgeAlignable,
              edgePriority,
              nodeAlignment
            )
          }
        }
      } finally {
        graphHider.unhideAll()
      }
    }
  }

  getLaneId(dataHolder: LayoutNode, layoutContext: HierarchicalLayoutContext): number {
    const swimlaneID = FlowchartPortCandidateSelector.getLaneId(dataHolder, layoutContext)
    return swimlaneID < 0 ? -1 : swimlaneID
  }

  calculateAlignmentImpl(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext,
    edgeAlignable: Map<LayoutEdge, boolean>,
    edgePriority: Map<LayoutEdge, number>,
    node2AlignWith: IMapper<LayoutNode, LayoutNode>
  ): void {
    let nRep: LayoutNode
    let sRep: LayoutNode
    let tRep: LayoutNode
    const node2LaneAlignment = this.createLaneAlignmentMap(graph, layoutContext)
    const edgeMinLength = new Mapper<LayoutEdge, number>()
    const edgeWeight = new Mapper<LayoutEdge, number>()
    const node2NetworkRep = new Map<LayoutNode, LayoutNode>()
    const groupNode2BeginRep = new Map<LayoutNode, LayoutNode>()
    const groupNode2EndRep = new Map<LayoutNode, LayoutNode>()
    const network = new LayoutGraph()
    // create network nodes
    graph.nodes.forEach((node) => {
      const data = layoutContext.getNodeContext(node)
      if (data !== null && data.type === HierarchicalLayoutNodeType.GROUP_BEGIN) {
        // all groups begin dummies of the same group node are mapped to the same network node
        nRep = groupNode2BeginRep.get(data.groupNode!)!
        if (nRep === null) {
          nRep = network.createNode()
          groupNode2BeginRep.set(data.groupNode!, nRep)
        }
      } else if (data !== null && data.type === HierarchicalLayoutNodeType.GROUP_END) {
        // all group end dummies of the same group node are mapped to the same network node
        nRep = groupNode2EndRep.get(data.groupNode!)!
        if (nRep === null) {
          nRep = network.createNode()
          groupNode2EndRep.set(data.groupNode!, nRep)
        }
      } else {
        nRep = network.createNode()
      }
      node2NetworkRep.set(node, nRep)
    })
    // consider edges
    const nonAlignableEdges: LayoutEdge[] = []
    graph.edges.forEach((e) => {
      if (
        e.selfLoop ||
        (isGroupNodeBorder(e.source, layoutContext) && isGroupNodeBorder(e.target, layoutContext))
      ) {
        return
      }
      if (!edgeAlignable.get(e)) {
        nonAlignableEdges.push(e)
        return
      }
      const absNode = network.createNode()
      const priority = edgePriority.get(e)!
      sRep = node2NetworkRep.get(e.source)!
      tRep = node2NetworkRep.get(e.target)!
      const sConnector = network.createEdge(sRep, absNode)
      edgeMinLength.set(sConnector, 0)
      edgeWeight.set(sConnector, priority)
      const tConnector = network.createEdge(tRep, absNode)
      edgeMinLength.set(tConnector, 0)
      edgeWeight.set(tConnector, priority)
    })

    // also consider same layer edges
    FlowchartPortCandidateSelector.getAllSameLayerEdges(graph, layoutContext).forEach((e) => {
      if (
        !e.selfLoop &&
        (!isGroupNodeBorder(e.source, layoutContext) || !isGroupNodeBorder(e.target, layoutContext))
      ) {
        sRep = node2NetworkRep.get(e.source)!
        tRep = node2NetworkRep.get(e.target)!
        const connector =
          layoutContext.getNodeContext(e.source)!.position <
          layoutContext.getNodeContext(e.target)!.position
            ? network.createEdge(sRep, tRep)
            : network.createEdge(tRep, sRep)
        edgeMinLength.set(connector, 1)
        edgeWeight.set(connector, Priority.Basic)
      }
    })

    const nodes = graph.nodes.toArray()
    nodes.sort((node1, node2) => {
      const nd1 = layoutContext.getNodeContext(node1)!
      const nd2 = layoutContext.getNodeContext(node2)!
      const l1 = nd1.layer
      const l2 = nd2.layer
      if (l1 < l2) {
        return -1
      } else if (l1 > l2) {
        return 1
      }
      const position1 = nd1.position
      const position2 = nd2.position
      if (position1 === position2) {
        return 0
      }
      return position1 < position2 ? -1 : 1
    })

    let last: LayoutNode | null = null
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (last !== null && areInSameLayer(last, n, layoutContext)) {
        nRep = node2NetworkRep.get(n)!
        const lastRep = node2NetworkRep.get(last)!
        if (network.getEdgesBetween(lastRep, nRep).size === 0) {
          const connector = network.createEdge(lastRep, nRep)
          // guarantees that last is placed to the left of n
          const minLength = calcMinLength(last, n, graph, layoutContext)
          edgeMinLength.set(connector, minLength)
          edgeWeight.set(connector, 0)
        }
      }
      last = n
    }
    // For each non-alignable edge, we create a connector with min length 1,
    // but only it has no other alignable in-edge.
    const nonAlignableConnectorMap = new Map<LayoutEdge, boolean>()
    nonAlignableEdges.forEach((e: LayoutEdge) => {
      const hasAlignableInEdge = checkPredicate(e.target.inEdges, edgeAlignable)
      if (hasAlignableInEdge) {
        return
      }
      sRep = node2NetworkRep.get(e.source)!
      tRep = node2NetworkRep.get(e.target)!
      const edgeData = layoutContext.getEdgeContext(e)!
      let connector: LayoutEdge
      if (hasLeftPortCandidate(edgeData, true) || hasRightPortCandidate(edgeData, false)) {
        connector = network.createEdge(tRep, sRep)
      } else if (hasRightPortCandidate(edgeData, true) || hasLeftPortCandidate(edgeData, false)) {
        connector = network.createEdge(sRep, tRep)
      } else {
        return
      }
      nonAlignableConnectorMap.set(connector, true)
      edgeMinLength.set(connector, 1)
      edgeWeight.set(connector, Priority.Basic)
    })
    // Afterward, we ensure that the network is still acyclic.
    for (
      let cycle = LayoutGraphAlgorithms.findCycle(network, true);
      cycle.size !== 0;
      cycle = LayoutGraphAlgorithms.findCycle(network, true)
    ) {
      let removed = false
      const cycleEdges = cycle.toArray()
      for (let index = 0; index < cycleEdges.length && !removed; index++) {
        const cycleEdge = cycleEdges[index]
        if (nonAlignableConnectorMap.get(cycleEdge)!) {
          network.remove(cycleEdge)
          removed = true
        }
      }

      if (!removed) {
        network.remove(cycleEdges[0]!)
      }
    }
    // connect nodes to global source/sink
    const globalSource = network.createNode()
    const globalSink = network.createNode()
    graph.nodes.forEach((n) => {
      nRep = node2NetworkRep.get(n)!
      const nLaneAlignment = node2LaneAlignment.get(n)
      if (network.getEdgesBetween(nRep, globalSink).size === 0) {
        const globalSinkConnector = network.createEdge(nRep, globalSink)
        edgeWeight.set(
          globalSinkConnector,
          nLaneAlignment === LaneAlignment.Right ? Priority.Low : 0
        )
        edgeMinLength.set(globalSinkConnector, 0)
      }
      if (network.getEdgesBetween(globalSource, nRep).size === 0) {
        const globalSourceConnector = network.createEdge(globalSource, nRep)
        edgeWeight.set(
          globalSourceConnector,
          nLaneAlignment === LaneAlignment.Left ? Priority.Low : 0
        )
        edgeMinLength.set(globalSourceConnector, 0)
      }
    })
    // apply simplex to each connected component of the network
    const networkNode2AlignmentLayer = new Mapper<LayoutNode, number>()
    LayoutGraphAlgorithms.simplexRankAssignment(
      network,
      networkNode2AlignmentLayer,
      edgeWeight,
      edgeMinLength
    )
    // transfer results to original nodes
    const node2AlignmentLayer = new Map<LayoutNode, number>()

    graph.nodes.forEach((n) => {
      nRep = node2NetworkRep.get(n)!
      node2AlignmentLayer.set(n, networkNode2AlignmentLayer.get(nRep)!)
    })
    // we do not want to align bend nodes with common nodes except if the (chain of) dummy nodes can be aligned with
    // the corresponding common node
    const seenBendMap = new Map<LayoutNode, boolean>()
    graph.nodes.forEach((n) => {
      if (isBendNode(n, layoutContext) && !seenBendMap.get(n)!) {
        adjustAlignmentLayer(n, node2AlignmentLayer, seenBendMap, layoutContext)
      }
    })
    // add alignment constraints
    nodes.sort((node1, node2) => {
      const al1 = node2AlignmentLayer.get(node1)!
      const al2 = node2AlignmentLayer.get(node2)!
      if (al1 < al2) {
        return -1
      } else if (al1 > al2) {
        return 1
      }
      const layer1 = layoutContext.getNodeContext(node1)!.layer
      const layer2 = layoutContext.getNodeContext(node2)!.layer
      if (layer1 === layer2) {
        return 0
      }
      return layer1 < layer2 ? -1 : 1
    })
    last = null
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (!isGroupNodeBorder(n, layoutContext) && !isGroupNodeProxy(n, layoutContext)) {
        if (last !== null && node2AlignmentLayer.get(last) === node2AlignmentLayer.get(n)) {
          // node n should be aligned with last
          node2AlignWith.set(n, last)
        }
        last = n
      }
    }
  }

  /**
   * Creates a node map containing the alignment in swimlanes.
   */
  createLaneAlignmentMap(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext
  ): Map<LayoutNode, number> {
    const node2LaneAlignment = new Map<LayoutNode, number>()
    graph.nodes.forEach((node) => {
      node2LaneAlignment.set(node, this.getLaneAlignment(node, layoutContext))
    })
    return node2LaneAlignment
  }

  /**
   * Returns the alignment of the given node inside a swimlane.
   */
  getLaneAlignment(node: LayoutNode, layoutContext: HierarchicalLayoutContext): number {
    let toLeftCount = 0
    let toRightCount = 0
    const nEdges = node.edges.toArray()
    nEdges.push(...FlowchartPortCandidateSelector.getSameLayerEdges(node, true, layoutContext))
    nEdges.push(...FlowchartPortCandidateSelector.getSameLayerEdges(node, false, layoutContext))
    nEdges.forEach((edge: LayoutEdge) => {
      if (
        FlowchartPortCandidateSelector.isToLeftPartition(node, edge.opposite(node), layoutContext)
      ) {
        toLeftCount++
      } else if (
        FlowchartPortCandidateSelector.isToRightPartition(node, edge.opposite(node), layoutContext)
      ) {
        toRightCount++
      }
    })
    if (toLeftCount > toRightCount) {
      return LaneAlignment.Left
    } else if (toLeftCount < toRightCount) {
      return LaneAlignment.Right
    } else if (this.isHorizontalOrientation()) {
      return LaneAlignment.Right
    }
    return LaneAlignment.Left
  }
}

/**
 * Checks whether the given edge data contains a left port candidate.
 */
function hasLeftPortCandidate(edgeData: HierarchicalLayoutEdgeContext, source: boolean): boolean {
  const pc = source ? edgeData.selectedSourcePortCandidate : edgeData.selectedTargetPortCandidate
  return pc !== null && pc.isOnSide(PortSides.LEFT)
}

/**
 * Checks whether the given edge data contains a right port candidate.
 */
function hasRightPortCandidate(edgeData: HierarchicalLayoutEdgeContext, source: boolean): boolean {
  const pc = source ? edgeData.selectedSourcePortCandidate : edgeData.selectedTargetPortCandidate
  return pc !== null && pc.isOnSide(PortSides.RIGHT)
}

/**
 * Calculates the minimum length between the two nodes.
 */
function calcMinLength(
  node1: LayoutNode,
  node2: LayoutNode,
  graph: LayoutGraph,
  layoutContext: HierarchicalLayoutContext
): number {
  let n1GroupNode: LayoutNode | null
  let n2GroupNode: LayoutNode | null
  if (isGroupNodeBorder(node1, layoutContext) && isGroupNodeBorder(node2, layoutContext)) {
    n1GroupNode = layoutContext.getNodeContext(node1)!.groupNode
    n2GroupNode = layoutContext.getNodeContext(node2)!.groupNode
    if (
      n1GroupNode !== n2GroupNode &&
      graph.getParent(node1) !== n2GroupNode &&
      graph.getParent(node2) !== n1GroupNode
    ) {
      return 1
    }
    return 0
  } else if (isGroupNodeBorder(node1, layoutContext)) {
    n1GroupNode = layoutContext.getNodeContext(node1)!.groupNode
    n2GroupNode = isGroupNodeProxy(node2, layoutContext)
      ? (layoutContext.getNodeContext(node2)!.groupNode as LayoutNode | null)
      : (graph.getParent(node2) as LayoutNode | null)
    if (n2GroupNode === n1GroupNode) {
      return 0
    }
    return 1
  } else if (isGroupNodeBorder(node2, layoutContext)) {
    n1GroupNode = isGroupNodeProxy(node1, layoutContext)
      ? (layoutContext.getNodeContext(node1)!.groupNode as LayoutNode | null)
      : (graph.getParent(node1) as LayoutNode | null)
    n2GroupNode = layoutContext.getNodeContext(node2)!.groupNode
    if (n1GroupNode === n2GroupNode) {
      return 0
    }
    return 1
  }
  return 1
}

/**
 * Adjusts dummy layers that contain dummies for alignment.
 */
function adjustAlignmentLayer(
  dummy: LayoutNode,
  node2AlignmentLayer: Map<LayoutNode, number>,
  seenBendMap: Map<LayoutNode, boolean>,
  layoutContext: HierarchicalLayoutContext
): void {
  const dummyAlignmentLayer = node2AlignmentLayer.get(dummy)!
  const seenDummyNodes: LayoutNode[] = [dummy]
  let alignsWithCommonNode = false
  let inEdge = dummy.inEdges.get(0)
  while (
    inEdge !== null &&
    isBendNode(inEdge.source, layoutContext) &&
    dummyAlignmentLayer === node2AlignmentLayer.get(inEdge.source)!
  ) {
    seenDummyNodes.push(inEdge.source)
    inEdge = inEdge.source.inEdges.get(0)
  }
  if (inEdge !== null && !isBendNode(inEdge.source, layoutContext)) {
    alignsWithCommonNode = dummyAlignmentLayer === node2AlignmentLayer.get(inEdge.source)
  }
  let outEdge = dummy.outEdges.get(0)
  while (
    outEdge !== null &&
    isBendNode(outEdge.target, layoutContext) &&
    dummyAlignmentLayer === node2AlignmentLayer.get(outEdge.target)
  ) {
    seenDummyNodes.push(outEdge.target)
    outEdge = outEdge.target.outEdges.get(0)
  }
  if (!alignsWithCommonNode && outEdge !== null && !isBendNode(outEdge.target, layoutContext)) {
    alignsWithCommonNode = dummyAlignmentLayer === node2AlignmentLayer.get(outEdge.target)
  }
  seenDummyNodes.forEach((dummyNode) => {
    seenBendMap.set(dummyNode, true)
    if (!alignsWithCommonNode) {
      // assign dummy nodes to a separate layer
      node2AlignmentLayer.set(dummyNode, dummyAlignmentLayer - 0.5)
    }
  })
}

/**
 * Checks whether the predicate evaluates to 'true' for at least one of the elements in the list.
 */
function checkPredicate<T>(list: ILinkedItemEnumerable<T>, predicate: Map<T, boolean>): boolean {
  return list.some((entry) => predicate.get(entry) === true)
}

/**
 * Checks whether the given nodes belong to the same layer.
 */
function areInSameLayer(
  node1: LayoutNode,
  node2: LayoutNode,
  layoutContext: HierarchicalLayoutContext
): boolean {
  return layoutContext.getNodeContext(node1)!.layer === layoutContext.getNodeContext(node2)!.layer
}

/**
 * Checks whether the given node represents a bend.
 */
function isBendNode(node: LayoutNode, layoutContext: HierarchicalLayoutContext): boolean {
  const data = layoutContext.getNodeContext(node)
  return data !== null && data.type === HierarchicalLayoutNodeType.BEND
}

/**
 * Checks whether the given node represents the border of a group node.
 */
function isGroupNodeBorder(node: LayoutNode, layoutContext: HierarchicalLayoutContext): boolean {
  const data = layoutContext.getNodeContext(node)
  return (
    data !== null &&
    (data.type === HierarchicalLayoutNodeType.GROUP_BEGIN ||
      data.type === HierarchicalLayoutNodeType.GROUP_END)
  )
}

/**
 * Checks whether the given node is a proxy for edges at group nodes.
 */
function isGroupNodeProxy(node: LayoutNode, layoutContext: HierarchicalLayoutContext): boolean {
  const data = layoutContext.getNodeContext(node)
  return data !== null && data.type === HierarchicalLayoutNodeType.PROXY_FOR_EDGE_AT_GROUP
}

/**
 * Checks whether the given edge is between normal nodes.
 */
function isRealEdge(edge: LayoutEdge, layoutData: HierarchicalLayoutContext): boolean {
  return (
    layoutData.getNodeContext(edge.source)!.type === HierarchicalLayoutNodeType.REGULAR &&
    layoutData.getNodeContext(edge.target)!.type === HierarchicalLayoutNodeType.REGULAR
  )
}

/**
 * Checks whether the given edge's direction is straight.
 */
function isStraightBranch(
  graph: LayoutGraph,
  edge: LayoutEdge,
  layoutContext: HierarchicalLayoutContext
): boolean {
  return FlowchartLayout.isStraightBranch(
    graph,
    FlowchartPortCandidateSelector.getOriginalEdge(edge, layoutContext)
  )
}

/**
 * Determines the priorities of the edges. Edges in longer paths get a higher priority.
 */
function determineEdgePriorities(
  graph: LayoutGraph,
  edgeIsAlignable: Map<LayoutEdge, boolean>,
  edgeLength: IMapper<LayoutEdge, number>
): Map<LayoutEdge, number> {
  const edgePriority = new Map<LayoutEdge, number>()
  const hider = new LayoutGraphHider(graph)
  try {
    // hide irrelevant edges
    graph.edges.forEach((edge) => {
      edgePriority.set(edge, Priority.Basic)
      if (!edgeIsAlignable.get(edge)) {
        hider.hide(edge)
      }
    })
    // for each connected component, we iteratively find the longest path that is used as a critical path
    const node2CompId = new Mapper<LayoutNode, number>()
    LayoutGraphAlgorithms.connectedComponents(graph, node2CompId)
    const components = LayoutGraphAlgorithms.connectedComponents(graph, node2CompId)
    const graphHider = new LayoutGraphHider(graph)
    try {
      graphHider.hideAll()
      // biome-ignore lint/correctness/noUnreachable: Seems to be an incorrect warning
      for (let i = 0; i < components.length; i++) {
        graphHider.showOnly(components[i], true)
        const localHider = new LayoutGraphHider(graph)
        try {
          let path = LayoutGraphAlgorithms.longestPath(graph, edgeLength)
          while (path.size !== 0) {
            path.forEach((edge) => {
              edgePriority.set(edge, Priority.High)
              if (graph.contains(edge.source)) {
                localHider.hide(edge.source)
              }
              localHider.hide(edge.target)
            })
            path = LayoutGraphAlgorithms.longestPath(graph, edgeLength)
          }
        } finally {
          localHider.unhideAll()
        }
      }
    } finally {
      graphHider.unhideAll()
    }
  } finally {
    hider.unhideAll()
  }
  return edgePriority
}

/**
 * Checks whether the given edge data contains a flatwise port candidate at a source and/or target.
 */
function hasFlatwisePortCandidate(edgeData: HierarchicalLayoutEdgeContext): boolean {
  return (
    FlowchartPortCandidateSelector.isFlatwisePortCandidate(edgeData.selectedSourcePortCandidate) ||
    FlowchartPortCandidateSelector.isFlatwisePortCandidate(edgeData.selectedTargetPortCandidate)
  )
}

/**
 * Checks whether the given edge data contains flatwise port candidates at a source and/or target.
 */
function hasFlatwiseCandidateCollection(edgeData: HierarchicalLayoutEdgeContext): boolean {
  return (
    FlowchartPortCandidateSelector.isFlatwiseCandidateCollection(edgeData.sourcePortCandidates) ||
    FlowchartPortCandidateSelector.isFlatwiseCandidateCollection(edgeData.targetPortCandidates)
  )
}
