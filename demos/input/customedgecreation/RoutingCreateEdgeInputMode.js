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
  ChannelEdgeRouter,
  CopiedLayoutGraph,
  CreateEdgeInputMode,
  Edge,
  EdgeRouter,
  EdgeRouterScope,
  IEdgeMap,
  InputModeEventArgs,
  IRectangle,
  LayoutGraphAdapter,
  OrthogonalEdgeEditingPolicy,
  Point,
  PortConstraint,
  PortConstraintKeys,
  PortSide,
  YNode,
  YPoint
} from 'yfiles'

/**
 * The different edge routing strategies that the custom {@link RoutingCreateEdgeInputMode}
 * supports.
 */
export /**
 * @readonly
 * @enum {number}
 */
const RoutingStrategy = {
  NONE: 0,
  EDGE_ROUTER: 1,
  PERFORMANCE_EDGE_ROUTER: 2,
  CHANNEL_EDGE_ROUTER: 3
}

/**
 * A custom {@link CreateEdgeInputMode} that uses a
 * {@link RoutingCreateEdgeInputMode.routingStrategy} to determine how edges are routed during
 * edge creation gestures.
 */
export class RoutingCreateEdgeInputMode extends CreateEdgeInputMode {
  _routingStrategy
  edgeRouter = null

  // state holding fields from the start to the end of the edge creation gesture
  layoutGraph
  layoutSourceNode
  layoutTargetNode
  layoutEdge
  targetPortConstraints

  /**
   * Gets the edge routing algorithm that is used during the edge creation gesture.
   * @type {!RoutingStrategy}
   */
  get routingStrategy() {
    return this._routingStrategy
  }

  /**
   * Sets the edge routing algorithm that is used during the edge creation gesture.
   * @yjs:keep = AUTO
   * @type {!RoutingStrategy}
   */
  set routingStrategy(strategy) {
    this._routingStrategy = strategy
    switch (strategy) {
      case RoutingStrategy.NONE:
        this.edgeRouter = null
        // use orthogonal edge editing base on the parent mode's setting
        this.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.AUTO
        break
      case RoutingStrategy.EDGE_ROUTER:
        this.edgeRouter = new EdgeRouter({
          scope: EdgeRouterScope.ROUTE_AFFECTED_EDGES
        })
        // disable orthogonal edge creation, since the edge will be routed by the layout algorithm
        this.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.NEVER
        break
      case RoutingStrategy.PERFORMANCE_EDGE_ROUTER:
        this.edgeRouter = new EdgeRouter({
          scope: EdgeRouterScope.ROUTE_AFFECTED_EDGES,
          maximumDuration: 0 // maximize performance over quality
        })
        // disable orthogonal edge creation, since the edge will be routed by the layout algorithm
        this.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.NEVER
        break
      case RoutingStrategy.CHANNEL_EDGE_ROUTER:
        this.edgeRouter = new ChannelEdgeRouter()
        // disable orthogonal edge creation, since the edge will be routed by the layout algorithm
        this.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.NEVER
        break
    }
  }

  /**
   * Creates a new instance of this custom {@link CreateEdgeInputMode}. By default, no routing
   * algorithm is set.
   */
  constructor() {
    super()
    this._routingStrategy = RoutingStrategy.NONE
  }

  /**
   * Called when the edge creation gesture has started. Initializes the state, depending on the
   * specified {@link RoutingStrategy}.
   * @param {!InputModeEventArgs} evt
   */
  onGestureStarted(evt) {
    if (this.routingStrategy === RoutingStrategy.NONE) {
      // just execute the default behavior
      super.onGestureStarted(evt)
      return
    }

    // initialize the graph that is considered during the layout
    const layoutGraphAdapter = new LayoutGraphAdapter(this.graph)
    this.layoutGraph = layoutGraphAdapter.createCopiedLayoutGraph()

    // find the source node of the gesture in the layout graph
    this.layoutSourceNode = this.layoutGraph.getCopiedNode(this.dummyEdge.sourceNode)

    // use a dummy target node during the gesture for the edge that is currently created
    this.layoutTargetNode = this.layoutGraph.createNode()
    this.layoutGraph.setSize(this.layoutTargetNode, 1, 1)

    // create the edge that should be routed
    this.layoutEdge = this.layoutGraph.createEdge(this.layoutSourceNode, this.layoutTargetNode)

    // set source point of the edge to the start point of the edge creation gesture's edge
    const dummyEdgeSrcPortLocation = this.dummyEdge.sourcePort.location.toYPoint()
    this.layoutGraph.setSourcePointAbs(this.layoutEdge, dummyEdgeSrcPortLocation)

    // the target point of the edge may be relative to the dummy node it is attached
    this.layoutGraph.setTargetPointRel(this.layoutEdge, YPoint.ORIGIN)

    // mark the dummy edge as affected
    const affectedEdges = this.layoutGraph.createEdgeMap()
    affectedEdges.setBoolean(this.layoutEdge, true)
    this.layoutGraph.addDataProvider(
      this.edgeRouter instanceof EdgeRouter
        ? this.edgeRouter.affectedEdgesDpKey
        : ChannelEdgeRouter.AFFECTED_EDGES_DP_KEY,
      affectedEdges
    )

    // the source port should not be adjusted by the layout
    const sourcePortConstraints = this.layoutGraph.createEdgeMap()
    sourcePortConstraints.set(
      this.layoutEdge,
      PortConstraint.create(
        RoutingCreateEdgeInputMode.getNodeSide(
          this.dummyEdge.sourceNode.layout,
          this.dummyEdge.sourcePort.location
        ),
        true
      )
    )
    this.targetPortConstraints = this.layoutGraph.createEdgeMap()
    this.layoutGraph.addDataProvider(
      PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
      sourcePortConstraints
    )

    super.onGestureStarted(evt)
  }

  /**
   * Called after each move during the edge creation gesture. If a {@link RoutingStrategy} is
   * specified, a new edge routing is calculated for the edge of this gesture.
   * @param {!InputModeEventArgs} evt
   */
  onMoved(evt) {
    if (this.routingStrategy === RoutingStrategy.NONE) {
      // just execute the default behavior
      super.onMoved(evt)
      return
    }

    // clear any target port constraint
    this.layoutGraph.removeDataProvider(PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY)

    const targetPortCandidate = this.targetPortCandidate
    const targetNode = this.dummyEdge.targetNode
    const targetPort = this.dummyEdge.targetPort

    if (targetPortCandidate !== null) {
      // use target port location if possible and constraint the target port depending on the ingoing node side
      this.targetPortConstraints.set(
        this.layoutEdge,
        PortConstraint.create(
          RoutingCreateEdgeInputMode.getNodeSide(targetNode.layout, targetPort.location),
          true
        )
      )
      this.layoutGraph.addDataProvider(
        PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY,
        this.targetPortConstraints
      )

      // adjust location and size of dummy target node to the actual hit target node
      const targetNodeLayout = targetNode.layout
      this.layoutGraph.setSize(
        this.layoutTargetNode,
        targetNodeLayout.width,
        targetNodeLayout.height
      )
      this.layoutGraph.setLocation(this.layoutTargetNode, targetNodeLayout.x, targetNodeLayout.y)
    } else {
      // no node hit, just use drag location
      const dragLocation = this.dragPoint
      this.layoutGraph.setSize(this.layoutTargetNode, 1, 1)
      this.layoutGraph.setLocation(this.layoutTargetNode, dragLocation.x, dragLocation.y)
    }

    this.layoutGraph.setTargetPointAbs(this.layoutEdge, targetPort.location.toYPoint())

    // apply the layout
    this.edgeRouter.applyLayout(this.layoutGraph)

    // transfer the edge layout to the visible dummy edge of the gesture
    const edgeLayout = this.layoutGraph.getLayout(this.layoutEdge)
    this.dummyEdgeGraph.clearBends(this.dummyEdge)
    for (let i = 0; i < edgeLayout.pointCount(); i++) {
      const bendPoint = edgeLayout.getPoint(i)
      this.dummyEdgeGraph.addBend(this.dummyEdge, new Point(bendPoint.x, bendPoint.y))
    }

    super.onMoved(evt)
  }

  /**
   * A helper function that determines the {@link PortSide} from the given point on the node.
   *
   * @param {!IRectangle} nodeLayout The node layout.
   * @param {!Point} point The point for which the {@link PortSide} should be calculated.
   * @returns {!PortSide}
   */
  static getNodeSide(nodeLayout, point) {
    const deltaX = Math.abs(nodeLayout.center.x - point.x) / nodeLayout.width
    const deltaY = Math.abs(nodeLayout.center.y - point.y) / nodeLayout.height

    if (deltaX === 0 && deltaY === 0) {
      return PortSide.ANY
    }

    if (deltaX > deltaY) {
      if (point.x < nodeLayout.center.x) {
        return PortSide.WEST
      } else {
        return PortSide.EAST
      }
    } else {
      if (point.y < nodeLayout.center.y) {
        return PortSide.NORTH
      } else {
        return PortSide.SOUTH
      }
    }
  }
}
