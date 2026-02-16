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
  BaseClass,
  ConstraintIncrementalLayerAssigner,
  EdgeDataKey,
  EdgeLabelDataKey,
  EdgeLabelPlacement,
  FromSketchLayerAssigner,
  GenericLabeling,
  HierarchicalLayout,
  type HierarchicalLayoutContext,
  type IEnumerable,
  ILayoutAlgorithm,
  type IMapper,
  type IPortCandidateSelector,
  type LabelCandidate,
  type LayoutEdge,
  type LayoutGraph,
  LayoutGraphHider,
  LayoutGrid,
  type LayoutNode,
  type LayoutNodeLabel,
  LayoutPortCandidate,
  LineSegment,
  List,
  Mapper,
  NodeDataKey,
  NodeLabelDataKey,
  NodeLabelPlacement,
  Point,
  PortCandidateSelector,
  type PortCandidateSelectorSameLayerData,
  PortSides,
  TopologicalLayerAssigner,
  YList
} from '@yfiles/yfiles'

class PortLocationAdjuster extends BaseClass(ILayoutAlgorithm) {
  /**
   * Main layout routine that assigns new layout information to the given graph.
   * @param graph the input graph.
   * @see Specified by {@link ILayoutAlgorithm.applyLayout}.
   */
  applyLayout(graph: LayoutGraph): void {
    const affectedNodesDP = graph.context.getItemData(PortLocationAdjuster.AFFECTED_NODES_DATA_KEY)

    for (const edge of graph.edges) {
      // adjust source point
      if (affectedNodesDP == null || affectedNodesDP.get(edge.source)) {
        adjustPortLocation(edge, true)
      }
      if (affectedNodesDP == null || affectedNodesDP.get(edge.target)) {
        adjustPortLocation(edge, false)
      }
    }
  }

  /**
   * Data provider key used to store if the ports on a node should be adjusted.
   */
  static get AFFECTED_NODES_DATA_KEY(): NodeDataKey<boolean> {
    return new NodeDataKey<boolean>(
      'com.yworks.yfiles.bpmn.layout.PortLocationAdjuster.AffectedNodesDataKey'
    )
  }
}

/**
 * Adjusts the edge end points so they don't end outside the shape of the node they are attached to.
 */
function adjustPortLocation(e: LayoutEdge, atSource: boolean): void {
  const node = atSource ? e.source : e.target
  const pointRel = atSource ? e.sourcePortOffset : e.targetPortOffset
  // get offset from the node center to the end of the shape at the node side the edge connects to
  const points = e.pathPoints.toArray()
  const p1 = atSource ? points[0].location : points[points.length - 2].location
  const p2 = atSource ? points[1].location : points[points.length - 1].location
  const segment = new LineSegment(p1, p2)
  const offset = Math.min(node.layout.width, node.layout.height) / 2
  const offsetX = segment.deltaX > 0 !== atSource ? -offset : offset
  const offsetY = segment.deltaY > 0 !== atSource ? -offset : offset
  // if the edge end point is at the center of this side, we use the calculated offset to put the end point on
  // the node bounds, otherwise we prolong the last segment to the center line of the node so it doesn't end
  // outside the node's shape
  const newPortLocation = segment.isHorizontal(1e-8)
    ? new Point(pointRel.y !== 0 ? 0 : offsetX, pointRel.y)
    : new Point(pointRel.x, pointRel.x !== 0 ? 0 : offsetY)
  if (atSource) {
    e.sourcePortOffset = newPortLocation
  } else {
    e.targetPortOffset = newPortLocation
  }
}

/**
 * An automatic layout algorithm for BPMN diagrams.
 *
 * Some elements have to be marked with the DataProvider keys
 * {@link BpmnLayout.SEQUENCE_FLOW_EDGES_DATA_KEY} and {@link BpmnLayout.BOUNDARY_INTERRUPTING_EDGES_DATA_KEY}.
 */
export class BpmnLayout extends BaseClass(ILayoutAlgorithm) {
  /**
   * The scope of graph elements that are laid out.
   * Possible values are 'ALL_ELEMENTS'
   * and 'SELECTED_ELEMENTS'.
   *
   * Defaults to 'ALL_ELEMENTS'.
   *
   * Note, if the scope is set to 'SELECTED_ELEMENTS',
   * non-selected elements may also be moved. However, the layout algorithm uses the initial position of
   * such elements as sketch.
   */
  scope = 'ALL_ELEMENTS'

  /**
   * The insets used for swim-lanes.
   * These insets define the distance between a graph element and the border of its enclosing swim-lane.
   *
   * Defaults to `10.0`.
   */
  laneInsets = 10

  /**
   * The layout orientation.
   * Defaults to {@link 'LEFT_TO_RIGHT'}.
   */
  layoutOrientation = 'LEFT_TO_RIGHT'

  /**
   * The minimum distance between two node elements.
   * Defaults to `40.0`
   */
  minimumNodeDistance = 40

  /**
   * Applies the layout to the specified graph.
   */
  applyLayout(graph: LayoutGraph): void {
    if (graph.isEmpty) {
      return
    }
    // set the laneInsets to all layout grid columns and rows
    this.configureLayoutGrid(graph)

    // run core layout
    this.applyHierarchicalLayout(graph)

    // apply generic labeling
    this.applyLabeling(graph)

    // adjust endpoints of edges
    new PortLocationAdjuster().applyLayout(graph)

    // remove data provider for CriticalEdgePriorityDataKey that was added by BalancingPortSelection
    graph.context.remove(HierarchicalLayout.CRITICAL_EDGE_PRIORITY_DATA_KEY)
  }

  configureLayoutGrid(graph: LayoutGraph): void {
    const cellDescriptors = graph.context.getItemData(
      LayoutGrid.LAYOUT_GRID_CELL_DESCRIPTOR_DATA_KEY
    )
    if (cellDescriptors == null) {
      return
    }
    const nodeWithCell = graph.nodes.find((node) => cellDescriptors.get(node) !== null)
    if (nodeWithCell) {
      const grid = cellDescriptors.get(nodeWithCell)?.layoutGrid
      if (grid) {
        grid.columns.forEach((columnObject) => {
          const column = columnObject
          column.leftPadding += this.laneInsets
          column.rightPadding += this.laneInsets
        })
        grid.rows.forEach((rowObject) => {
          const row = rowObject
          row.topPadding += this.laneInsets
          row.bottomPadding += this.laneInsets
        })
      }
    }
  }

  applyHierarchicalLayout(graph: LayoutGraph): void {
    const hl = new HierarchicalLayout({
      groupLayeringPolicy: 'ignore-groups',
      layoutOrientation:
        this.layoutOrientation === 'LEFT_TO_RIGHT' ? 'left-to-right' : 'top-to-bottom',
      minimumLayerDistance: this.minimumNodeDistance,
      nodeDistance: this.minimumNodeDistance,
      core: {
        fromScratchLayerAssigner: new BackLoopLayerer(),
        portCandidateSelector: new BalancingPortSelection(new PortCandidateSelector())
      },
      componentLayout: { enabled: false },
      coordinateAssigner: { straightenEdges: true },
      edgeLabelPlacement: EdgeLabelPlacement.IGNORE,
      nodeLabelPlacement: NodeLabelPlacement.IGNORE
    })
    if (this.scope === 'SELECTED_ELEMENTS') {
      hl.core.fixedElementsLayerAssigner = new FromSketchLayerAssigner({ maximumNodeSize: 5 })
      hl.fromSketchMode = true
    }
    hl.applyLayout(graph)
  }

  applyLabeling(graph: LayoutGraph): void {
    const labeling = new GenericLabeling({
      scope: 'all',
      defaultNodeLabelingCosts: { ambiguousPlacementCost: 1.0 },
      defaultEdgeLabelingCosts: { ambiguousPlacementCost: 1.0 }
    })

    labeling.applyLayout(graph)
  }

  /**
   * Data provider key used to store if an edge represents a sequence flow, default flow or
   * conditional flow.
   */
  static get SEQUENCE_FLOW_EDGES_DATA_KEY(): EdgeDataKey<boolean> {
    return new EdgeDataKey<boolean>(
      'com.yworks.yfiles.bpmn.layout.BpmnLayout.SequenceFlowEdgesDataKey'
    )
  }

  /**
   * Data provider key used to store if an edge starts at a boundary interrupting event.
   */
  static get BOUNDARY_INTERRUPTING_EDGES_DATA_KEY(): EdgeDataKey<boolean> {
    return new EdgeDataKey<boolean>(
      'com.yworks.yfiles.bpmn.layout.BpmnLayout.BoundaryInterruptingEdgesDataKey'
    )
  }

  /**
   * Data provider key used to store which labels shall be positioned by the labeling
   * algorithm.
   */
  static get AFFECTED_NODE_LABELS_DATA_KEY(): NodeLabelDataKey<boolean> {
    return new NodeLabelDataKey<boolean>(
      'com.yworks.yfiles.bpmn.layout.BpmnLayout.AffectedNodeLabelsDataKey'
    )
  }

  /**
   * Data provider key used to store which labels shall be positioned by the labeling
   * algorithm.
   */
  static get AFFECTED_EDGE_LABELS_DATA_KEY(): EdgeLabelDataKey<boolean> {
    return new EdgeLabelDataKey<boolean>(
      'com.yworks.yfiles.bpmn.layout.BpmnLayout.AffectedEdgeLabelsDataKey'
    )
  }

  /**
   * Data provider key used to identify nodes for which the port locations should be
   * adjusted.
   */
  static get ADJUST_PORT_LOCATION_NODES_DATA_KEY(): NodeDataKey<boolean> {
    return PortLocationAdjuster.AFFECTED_NODES_DATA_KEY
  }

  /**
   * Returns if the edge represents a sequence flow, default flow or conditional flow.
   * @see {@link BpmnLayout.SEQUENCE_FLOW_EDGES_DATA_KEY}
   */
  static isSequenceFlow(edge: LayoutEdge, graph: LayoutGraph): boolean {
    const flowDP = graph.context.getItemData(BpmnLayout.SEQUENCE_FLOW_EDGES_DATA_KEY)
    return flowDP != null && flowDP.get(edge)!
  }

  /**
   * Returns if the edge is attached to a boundary interrupting event.
   * @see {@link BpmnLayout.BOUNDARY_INTERRUPTING_EDGES_DATA_KEY}
   */
  static isBoundaryInterrupting(edge: LayoutEdge, graph: LayoutGraph): boolean {
    const isInterruptingDP = graph.context.getItemData(
      BpmnLayout.BOUNDARY_INTERRUPTING_EDGES_DATA_KEY
    )
    return isInterruptingDP != null && isInterruptingDP.get(edge)!
  }
}

/**
 * A layerer stage that pulls back loop components to earlier layers to reduce the spanned layers of back edges.
 * A back loop component is a set of connected nodes satisfying the following rules:
 *
 * - the set contains no sink node, i.e., no node with out-degree 0
 * - all outgoing edges to nodes outside of this set are back edges
 */
class BackLoopLayerer extends ConstraintIncrementalLayerAssigner {
  private nodeStates: NodeState[] | null = null
  private currentLayers: number[] | null = null

  /**
   * Creates a new instance with the specified core layerer.
   */
  constructor() {
    super(new TopologicalLayerAssigner())
    this.allowSameLayerEdges = true
  }

  /**
   * Assigns all nodes of the graph to layers and adds them to the {@link Layers} instance.
   *
   * @param graph the input graph
   * @param layoutContext the context that provides access to information for the graph elements
   * and to the {@link ILayers layers} instance on which the nodes are assigned
   */
  assignLayers(graph: LayoutGraph, layoutContext: HierarchicalLayoutContext): void {
    // get core layer assignment
    super.assignLayers(graph, layoutContext)

    // Hide all edges that are no sequence flows
    const graphHider = new LayoutGraphHider(graph)
    for (const edge of graph.edges.toArray()) {
      if (!BpmnLayout.isSequenceFlow(edge, graph)) {
        graphHider.hide(edge)
      }
    }

    const layers = layoutContext.layers
    // determine current layer of all nodes
    this.currentLayers = new Array(graph.nodes.size)
    for (let i = 0; i < layers.size; i++) {
      for (const node of layers.get(i).nodes) {
        this.currentLayers[node.index] = i
      }
    }

    // mark nodes on a back-loop and candidates that may be on a back loop if other back-loop nodes are reassigned
    this.nodeStates = new Array(graph.nodes.size)
    let candidates = new YList<LayoutNode>()
    const backLoopNodes = new YList<LayoutNode>()
    for (let i = layers.size - 1; i >= 0; i--) {
      // check from last to first layer to detect candidates as well
      const nodes = layers.get(i)!.nodes
      this.updateNodeStates(nodes, backLoopNodes, candidates)
    }

    // swap layer for back-loop nodes
    while (backLoopNodes.size > 0) {
      for (const node of backLoopNodes) {
        const currentLayer = this.currentLayers[node.index]
        // the target layer is the next layer after the highest fixed target node layer
        let targetLayer = 0
        for (const edge of node.outEdges) {
          const targetNodeIndex = edge.target.index
          if (this.nodeStates[targetNodeIndex] === 'fixed') {
            targetLayer = Math.max(targetLayer, this.currentLayers[targetNodeIndex] + 1)
          }
        }
        if (targetLayer === 0) {
          // no fixed target found, so all targets must be candidates
          // -> we skip the node as we don't know where the candidates will be placed at the end
          continue
        }
        if (targetLayer < currentLayer) {
          layers.get(currentLayer)!.remove(node)
          layers.get(targetLayer)!.add(node)
          this.currentLayers[node.index] = targetLayer
          this.nodeStates[node.index] = 'fixed'
        }
      }
      backLoopNodes.clear()

      // update states of the candidates
      candidates = this.updateNodeStates(candidates, backLoopNodes, new YList<LayoutNode>())
    }

    // remove empty layers
    for (let i: number = layers.size - 1; i >= 0; i--) {
      if (layers.get(i)!.nodes!.size === 0) {
        layoutContext.removeLayer(i)
      }
    }

    // cleanup
    graphHider.unhideAll()
    this.nodeStates = null
    this.currentLayers = null
  }

  updateNodeStates(
    nodes: YList<LayoutNode>,
    backLoopNodes: YList<LayoutNode>,
    candidates: YList<LayoutNode>
  ): YList<LayoutNode> {
    for (const node of nodes) {
      const nodeState = this.getNodeState(node)
      switch (nodeState) {
        case 'back-looping':
          backLoopNodes.addFirst(node)
          break
        case 'back-looping-candidate':
          candidates.addFirst(node)
          break
        default:
      }
      this.nodeStates![node.index] = nodeState
    }
    return candidates
  }

  getNodeState(node: LayoutNode): NodeState {
    const nodeLayer = this.currentLayers![node.index]
    if (nodeLayer === 0) {
      // nodes in the first layer can't have any back edges
      return 'fixed'
    }
    let nodeState: NodeState = 'fixed'
    for (const edge of node.outEdges) {
      const targetIndex = edge.target.index
      if (this.currentLayers![targetIndex] >= nodeLayer) {
        // no back-looping edge...
        if (
          this.nodeStates![targetIndex] === 'back-looping' ||
          this.nodeStates![targetIndex] === 'back-looping-candidate'
        ) {
          // ...but target is back-looping, so this one might be as well
          nodeState = 'back-looping-candidate'
        } else {
          // ... and target is fixed -> this node is fixed as well.
          nodeState = 'fixed'
          break
        }
      } else if (nodeState === 'fixed') {
        // no back looping candidate -> back-looping
        nodeState = 'back-looping'
      }
    }
    return nodeState
  }
}

type NodeState = 'fixed' | 'back-looping' | 'back-looping-candidate'

/**
 * This port selection tries to balance the edges on each node, and distribute them to the four node sides.
 * To balance the edge distribution, it calculates edges that should be on a
 * {@link HierarchicalLayout.CRITICAL_EDGE_DATA_KEY critical path} and define the flow of the diagram.
 * Furthermore, it uses {@link ItemFactory.setSelectedPortCandidate selected port candidates}
 * on the non-flow sides of the nodes.
 */
class BalancingPortSelection extends PortCandidateSelector {
  private coreSelection: IPortCandidateSelector
  private static _portCandidateLeft = LayoutPortCandidate.createFree(PortSides.LEFT)
  private static _portCandidateRight = LayoutPortCandidate.createFree(PortSides.RIGHT)

  private sameLayerData: PortCandidateSelectorSameLayerData | null = null
  private edge2LaneCrossing: IMapper<LayoutEdge, LaneCrossing> | null = null
  private node2LaneAlignment: IMapper<LayoutNode, LaneAlignment> | null = null

  constructor(coreSelection: IPortCandidateSelector) {
    super()
    this.coreSelection = coreSelection
  }

  selectAfterLayering(graph: LayoutGraph, layoutContext: HierarchicalLayoutContext): void {
    if (this.coreSelection != null) {
      this.coreSelection.selectAfterLayering(graph, layoutContext)
    }
  }

  selectAfterSequencing(graph: LayoutGraph, layoutContext: HierarchicalLayoutContext): void {
    if (this.coreSelection != null) {
      this.coreSelection.selectAfterSequencing(graph, layoutContext)
    }
    super.selectAfterSequencing(graph, layoutContext)
  }

  selectAfterSequencingAtNode(
    _node: LayoutNode,
    _inEdgeOrder: ((x: LayoutEdge, y: LayoutEdge) => number) | null,
    _outEdgeOrder: ((x: LayoutEdge, y: LayoutEdge) => number) | null,
    _graph: LayoutGraph,
    _layoutContext: HierarchicalLayoutContext
  ): void {}

  insertSameLayerStructures(
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext
  ): PortCandidateSelectorSameLayerData {
    // store the SameLayerData for later use
    this.sameLayerData = super.insertSameLayerStructures(graph, layoutContext)
    return this.sameLayerData
  }

  selectAfterSequencingWithOrders(
    inEdgeOrder: (x: LayoutEdge, y: LayoutEdge) => number,
    outEdgeOrder: (x: LayoutEdge, y: LayoutEdge) => number,
    graph: LayoutGraph,
    layoutContext: HierarchicalLayoutContext
  ) {
    this.edge2LaneCrossing = new Mapper<LayoutEdge, LaneCrossing>()
    this.node2LaneAlignment = new Mapper<LayoutNode, LaneAlignment>()

    const criticalEdges = new Mapper<LayoutEdge, number>(0)

    // determine whether an edge crosses a swim-lane border and if so in which direction
    graph.edges.forEach((edge) => {
      const originalEdge = this.getOriginalEdge(edge, layoutContext)

      // now we have a 'real' edge with valid source and target nodes
      const originalSourceId = getLaneId(originalEdge.source, layoutContext)
      const originalTargetId = getLaneId(originalEdge.target, layoutContext)
      let crossing: LaneCrossing = 'none'
      if (originalSourceId !== originalTargetId) {
        // check if we need to flip the sides because edge and original edge have different directions
        const flipSides = edge.source !== originalEdge.source
        const sourceId = flipSides ? originalTargetId : originalSourceId
        const targetId = flipSides ? originalSourceId : originalTargetId

        crossing = sourceId > targetId ? 'to-left' : 'to-right'
      }
      this.edge2LaneCrossing!.set(edge, crossing)
    })

    // determine basic node alignment
    graph.nodes.forEach((n) => {
      const alignment = this.calculateLaneAlignment(n)
      this.node2LaneAlignment!.set(n, alignment)
    })

    graph.nodes.forEach((n) => {
      // sort the edges with the provided comparer
      n.sortInEdges(inEdgeOrder)
      n.sortOutEdges(outEdgeOrder)

      // calculate 'critical' in and out-edges whose nodes should be aligned in flow
      const inEdges = n.inEdges
      const bestInEdge = n.inDegree > 0 ? this.getBestFlowEdge(inEdges, layoutContext, graph) : null
      const outEdges = n.outEdges
      const bestOutEdge =
        n.outDegree > 0 ? this.getBestFlowEdge(outEdges, layoutContext, graph) : null
      if (bestInEdge != null) {
        criticalEdges.set(bestInEdge, criticalEdges.get(bestInEdge)! + 0.5)
      }
      if (bestOutEdge != null) {
        criticalEdges.set(bestOutEdge, criticalEdges.get(bestOutEdge)! + 0.5)
      }
      if (n.degree <= 4) {
        // should usually be the case, and we can distribute each edge to its own side
        // remember which node side is already taken by an in- or out-edge
        let leftTakenByInEdge = false
        let rightTakenByInEdge = false
        let leftTakenByOutEdge = false
        let rightTakenByOutEdge = false

        if (n.inDegree > 0 && n.outDegree < 3) {
          // if there are at least three out-edges, we distribute those first, otherwise we start with the in-edges
          const firstInEdge = inEdges.first()!
          const lastInEdge = inEdges.last()!
          if (
            this.getLaneCrossing(firstInEdge) === 'to-right' &&
            (n.inDegree > 1 || this.isSameLayerEdge(firstInEdge, layoutContext))
          ) {
            // the first in-edge comes from the left and is either a same layer edge or there are other in-edges
            selectLeftSideCandidate(firstInEdge, false, layoutContext)
            leftTakenByInEdge = true
          }
          if (!leftTakenByInEdge || n.outDegree < 2) {
            // don't use left and right side for in-edges if there are at least 2 out-edges
            if (
              this.getLaneCrossing(lastInEdge) === 'to-left' &&
              (n.inDegree > 1 || this.isSameLayerEdge(lastInEdge, layoutContext))
            ) {
              // the last in-edge comes from right and is either
              // a same-layer edge or there are other in-edges
              selectRightSideCandidate(lastInEdge, false, layoutContext)
              rightTakenByInEdge = true
            }
          }
        }

        if (n.outDegree > 0) {
          const firstOutEdge = outEdges.first()!
          const lastOutEdge = outEdges.last()!

          if (!leftTakenByInEdge) {
            // the left side is still free
            if (
              BpmnLayout.isBoundaryInterrupting(firstOutEdge, graph) ||
              (this.getLaneCrossing(firstOutEdge) === 'to-left' &&
                (n.outDegree > 1 || this.isSameLayerEdge(firstOutEdge, layoutContext)))
            ) {
              // the first out-edge is either boundary interrupting or goes to left and
              // is either a same layer edge or there are other out-edges
              selectLeftSideCandidate(firstOutEdge, true, layoutContext)
              leftTakenByOutEdge = true
            } else if (
              rightTakenByInEdge &&
              n.outDegree >= 2 &&
              !this.isSameLayerEdge(outEdges.at(0)!, layoutContext)
            ) {
              // the right side is already taken, but we have more than one out edge.
              // if the second out edge is a same layer edge, constraining the firstOutEdge could lead to
              // no in-flow edge
              selectLeftSideCandidate(firstOutEdge, true, layoutContext)
              leftTakenByOutEdge = true
            }
          }
          if (!rightTakenByInEdge) {
            // the right side is still free
            if (
              this.getLaneCrossing(lastOutEdge) === 'to-right' &&
              (n.outDegree > 1 || this.isSameLayerEdge(lastOutEdge, layoutContext))
            ) {
              // the last out-edge goes to the right and
              // is either a same layer edge or there are other out-edges
              selectRightSideCandidate(lastOutEdge, true, layoutContext)
              rightTakenByOutEdge = true
            } else if (
              leftTakenByInEdge &&
              n.outDegree >= 2 &&
              !this.isSameLayerEdge(outEdges.at(outEdges.size - 2)!, layoutContext)
            ) {
              // the left side is already taken, but we have more than one out edge.
              // if the second last out edge is a same layer edge, constraining the lastOutEdge could lead to
              // no in-flow edge
              selectRightSideCandidate(lastOutEdge, true, layoutContext)
              rightTakenByOutEdge = true
            }
          }
        }

        // distribute remaining in-edges
        if (n.inDegree === 2 && !(rightTakenByInEdge || leftTakenByInEdge)) {
          // two in-edges but none distributed, yet
          if (bestInEdge === inEdges.first() && !rightTakenByOutEdge) {
            // first in-edge is in-flow edge and right side is still free
            selectRightSideCandidate(inEdges.last()!, false, layoutContext)
            rightTakenByInEdge = true
          } else if (bestInEdge === inEdges.last() && !leftTakenByOutEdge) {
            // last in-edge is in-flow edge and left side is still free
            selectLeftSideCandidate(inEdges.first()!, false, layoutContext)
            leftTakenByInEdge = true
          }
        } else if (
          n.inDegree === 3 &&
          !(rightTakenByInEdge && leftTakenByInEdge) &&
          !this.isSameLayerEdge(inEdges.at(1)!, layoutContext)
        ) {
          // three in-edges but not both sides taken, yet and the middle edge is no same layer edge
          if (!rightTakenByOutEdge) {
            // if not already taken, constraint the last in-edge to right
            selectRightSideCandidate(inEdges.last()!, false, layoutContext)
            rightTakenByInEdge = true
          }
          if (!leftTakenByOutEdge) {
            // if not already taken, constraint the first in-edge to left
            selectLeftSideCandidate(inEdges.first()!, false, layoutContext)
            leftTakenByInEdge = true
          }
        }

        // distribute remaining out-edges
        if (n.outDegree === 2 && !(rightTakenByOutEdge || leftTakenByOutEdge)) {
          // two out-edges but none distributed, yet
          if (bestOutEdge === outEdges.first() && !rightTakenByInEdge) {
            // first out-edge is in-flow edge and right side is still free
            selectRightSideCandidate(outEdges.last()!, true, layoutContext)
          } else if (bestOutEdge === outEdges.last() && !leftTakenByInEdge) {
            // last out-edge is in-flow edge and left side is still free
            selectLeftSideCandidate(outEdges.first()!, true, layoutContext)
          }
        } else if (
          n.outDegree === 3 &&
          !(rightTakenByOutEdge && leftTakenByOutEdge) &&
          !this.isSameLayerEdge(outEdges.at(1)!, layoutContext)
        ) {
          // three out-edges but not both sides taken, yet and the middle edge is no same layer edge
          if (!rightTakenByInEdge) {
            // if not already taken, constraint the last out-edge to right
            selectRightSideCandidate(outEdges.last()!, true, layoutContext)
          }
          if (!leftTakenByInEdge) {
            // if not already taken, constraint the first out-edge to left
            selectLeftSideCandidate(outEdges.first()!, true, layoutContext)
          }
        }
      }
    })

    // register the data provider for critical edge paths. It is deregistered again by BpmnLayout itself
    graph.context.addItemData(HierarchicalLayout.CRITICAL_EDGE_PRIORITY_DATA_KEY, criticalEdges)

    this.sameLayerData = null
    this.edge2LaneCrossing = null
    this.node2LaneAlignment = null
  }

  getLaneCrossing(edge: LayoutEdge): LaneCrossing | null {
    return this.edge2LaneCrossing && this.edge2LaneCrossing.get(edge)
  }

  getLaneAlignment(source: LayoutNode): LaneAlignment | null {
    return this.node2LaneAlignment && this.node2LaneAlignment.get(source)
  }

  /**
   * Get the {@link LayoutEdge} representing the original edge on the graph.
   * As the core layout algorithm creates selected edges, for example, for same-layer edges and edges spanning
   * multiple layers, we need to lookup the original edge of the graph, for example, as key in data providers.
   */
  getOriginalEdge(edge: LayoutEdge, layoutContext: HierarchicalLayoutContext): LayoutEdge {
    const originalEdge =
      this.sameLayerData!.getOriginalEdge(edge.source) ||
      this.sameLayerData!.getOriginalEdge(edge.target) ||
      edge
    const edgeData = layoutContext.getEdgeContext(originalEdge)
    return edgeData!.associatedEdge || originalEdge
  }

  /**
   * Returns the best suited edge in `edges` for use as in-flow edge or `null`
   * if no such edge could be found.
   */
  getBestFlowEdge(
    edges: IEnumerable<LayoutEdge>,
    layoutContext: HierarchicalLayoutContext,
    graph: LayoutGraph
  ): LayoutEdge | null {
    const weakCandidates = new List<LayoutEdge>()
    const candidates = new List<LayoutEdge>()

    const edgeArray = edges.toArray()
    for (let i = 0; i < edgeArray.length; i++) {
      const edge = edgeArray[i]
      {
        const originalEdge = this.getOriginalEdge(edge, layoutContext)
        if (
          this.edge2LaneCrossing!.get(edge) !== 'none' ||
          BpmnLayout.isBoundaryInterrupting(originalEdge, graph) ||
          this.isSameLayerEdge(originalEdge, layoutContext) ||
          edge.selfLoop
        ) {
          // an edge should not be aligned if:
          // - it crosses stripe borders
          // - it is boundary interrupting
          // - it is a same-layer edge
          // - it is a self-loop
          continue
        }
        if (
          layoutContext.getEdgeContext(edge)!.reversed ||
          !BpmnLayout.isSequenceFlow(originalEdge, graph)
        ) {
          // it is only a weak candidate if:
          // - it is reversed
          // - it is no sequence flow
          weakCandidates.add(edge)
        } else {
          candidates.add(edge)
        }
      }
    }
    if (candidates.size > 0) {
      // if there are several candidates, choose the one that would keep the LaneAlignment
      // of its source and target node consistent
      candidates.sort((edge1, edge2) => {
        const ac1 = this.getAlignmentConsistency(edge1)
        const ac2 = this.getAlignmentConsistency(edge2)
        return ac2 - ac1
      })
      return candidates.get(0)
    }
    if (weakCandidates.size > 0) {
      return weakCandidates.get(Math.floor(weakCandidates.size / 2.0) | 0)
    }
    return null
  }

  /**
   * Returns how much the {@link LaneAlignment} of the source and target node is consistent.
   * The consistency is `2`, if both nodes have the same alignment.
   * It is `1` if exactly one of the alignments is
   * {@link LaneAlignment.NONE} and `0` otherwise.
   */
  getAlignmentConsistency(edge: LayoutEdge): number {
    const sourceLA = this.getLaneAlignment(edge.source)
    const targetLA = this.getLaneAlignment(edge.target)
    if (sourceLA === targetLA) {
      return 2
    }
    return sourceLA === 'none' || targetLA === 'none' ? 1 : 0
  }

  /**
   * Returns if the source and target node of the {@link BalancingPortSelection.getOriginalEdge original edge} of
   * `edge` are on the same layer.
   */
  isSameLayerEdge(edge: LayoutEdge, layoutContext: HierarchicalLayoutContext): boolean {
    const originalEdge = this.getOriginalEdge(edge, layoutContext)
    const sourceNodeData = layoutContext.getNodeContext(originalEdge.source)
    const targetNodeData = layoutContext.getNodeContext(originalEdge.target)
    return (
      sourceNodeData != null &&
      targetNodeData != null &&
      sourceNodeData.layer === targetNodeData.layer
    )
  }

  /**
   * Determine the alignment of a node in its swim-lane depending on the {@link LaneCrossing}s
   * of its attached edges.
   */
  calculateLaneAlignment(n: LayoutNode): LaneAlignment {
    let toRightCount = 0
    let toLeftCount = 0
    n.edges.forEach((edge) => {
      const crossing = this.edge2LaneCrossing!.get(edge)
      if (n === edge.source) {
        if (crossing === 'to-right') {
          toRightCount++
        } else if (crossing === 'to-left') {
          toLeftCount++
        }
      } else if (crossing === 'to-right') {
        toLeftCount++
      } else if (crossing === 'to-left') {
        toRightCount++
      }
    })
    if (toLeftCount > toRightCount) {
      return 'left'
    } else if (toLeftCount < toRightCount) {
      return 'right'
    }
    return 'none'
  }

  /**
   * Free port candidates that are assigned as selected port candidates on the right side.
   */
  static get PORT_CANDIDATE_RIGHT(): LayoutPortCandidate {
    return (
      BalancingPortSelection._portCandidateRight ||
      (BalancingPortSelection._portCandidateRight = LayoutPortCandidate.createFree(PortSides.RIGHT))
    )
  }

  /**
   * Free port candidates that are assigned as selected port candidates on the left side.
   */
  static get PORT_CANDIDATE_LEFT(): LayoutPortCandidate {
    return (
      BalancingPortSelection._portCandidateLeft ||
      (BalancingPortSelection._portCandidateLeft = LayoutPortCandidate.createFree(PortSides.LEFT))
    )
  }
}

type LaneAlignment = 'none' | 'left' | 'right'

type LaneCrossing = 'none' | 'to-right' | 'to-left'

/**
 * Sets a {@link ItemFactory.setSelectedPortCandidate right port candidate}
 * on `source` or target side of `edge`.
 */
function selectRightSideCandidate(
  edge: LayoutEdge,
  source: boolean,
  layoutContext: HierarchicalLayoutContext
): void {
  const edgeContext = layoutContext.getEdgeContext(edge)!
  if (source) {
    edgeContext.selectedSourcePortCandidate = BalancingPortSelection.PORT_CANDIDATE_RIGHT
  } else {
    edgeContext.selectedTargetPortCandidate = BalancingPortSelection.PORT_CANDIDATE_RIGHT
  }
}

/**
 * Sets a {@link ItemFactory.setSelectedPortCandidate right port candidate}
 * on `source` or target side of `edge`.
 */
function selectLeftSideCandidate(
  edge: LayoutEdge,
  source: boolean,
  layoutContext: HierarchicalLayoutContext
): void {
  const edgeContext = layoutContext.getEdgeContext(edge)!
  if (source) {
    edgeContext.selectedSourcePortCandidate = BalancingPortSelection.PORT_CANDIDATE_LEFT
  } else {
    edgeContext.selectedTargetPortCandidate = BalancingPortSelection.PORT_CANDIDATE_LEFT
  }
}

/**
 * Returns the {@link LayoutGridColumn.index} for `node`.
 */
function getLaneId(node: LayoutNode, layoutContext: HierarchicalLayoutContext): number {
  const nodeData = layoutContext.getNodeContext(node)
  const laneDesc = nodeData != null ? nodeData.column : null
  return laneDesc != null ? laneDesc.index : -1
}

/**
 * A profit model for exterior node labels that prefers node sides that are far away
 * from incoming or outgoing edges.
 */
export class BpmnLabelProfitModel {
  static customProfitRatio = 0.15

  static nodeLabelProfitDelegate(candidates: IEnumerable<LabelCandidate>, label: LayoutNodeLabel) {
    for (const candidate of candidates) {
      const profit = candidate.weight
      const customProfit = BpmnLabelProfitModel.getProfit(label, candidate)
      candidate.weight =
        (1 - BpmnLabelProfitModel.customProfitRatio) * profit +
        BpmnLabelProfitModel.customProfitRatio * customProfit
    }
  }

  /**
   * Returns the profit for placing a label using the given {@link LabelCandidate}.
   *
   * Higher profit means better candidates. Hence, there is a higher probability that the candidate is chosen by a
   * labeling algorithm.
   *
   * Profits need to have a value between `0` and `1`.
   *
   * @param label the owner label of the candidate
   * @param candidate the candidate
   * @returns the profit of the candidate
   */
  static getProfit(label: LayoutNodeLabel, candidate: LabelCandidate): number {
    let profit = 0
    const node = label.owner as LayoutNode
    const nodeLayout = node.layout
    const candidateLayout = candidate.layout.bounds
    const isLeft = candidateLayout.x + candidateLayout.width / 2 < nodeLayout.x
    const isRight = candidateLayout.x + candidateLayout.width / 2 > nodeLayout.x + nodeLayout.width
    const isTop = candidateLayout.y + candidateLayout.height / 2 < nodeLayout.y
    const isBottom =
      candidateLayout.y + candidateLayout.height / 2 > nodeLayout.y + nodeLayout.height

    const horizontalCenter = !isLeft && !isRight
    const verticalCenter = !isTop && !isBottom
    if (horizontalCenter && verticalCenter) {
      // candidate is in center -> don't use
      return 0
    } else if (horizontalCenter || verticalCenter) {
      profit = 0.95
    } else {
      // diagonal candidates get a bit less profit
      profit = 0.9
    }
    node.edges.forEach((edge) => {
      const portLocation = edge.source === node ? edge.sourcePortOffset : edge.targetPortOffset
      if (Math.abs(portLocation.x) > Math.abs(portLocation.y)) {
        // edge at left or right
        if ((portLocation.x < 0 && isLeft) || (portLocation.x > 0 && isRight)) {
          if (isTop || isBottom) {
            profit -= 0.03
          } else {
            // edge at same side as candidate
            profit -= 0.2
          }
        } else if (horizontalCenter) {
          // candidate is close to the edge but not on the same side
          profit -= 0.01
        }
      } else {
        // edge at top or bottom
        if ((portLocation.y < 0 && isTop) || (portLocation.y > 0 && isBottom)) {
          if (isLeft || isRight) {
            profit -= 0.03
          } else {
            profit -= 0.2
          }
        } else if (verticalCenter) {
          // candidate is close to the edge but not on the same side
          profit -= 0.01
        }
      }
    })

    return Math.max(0, profit)
  }
}
