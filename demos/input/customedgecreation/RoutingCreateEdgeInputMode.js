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
  CreateEdgeInputMode,
  EdgePortCandidates,
  EdgeRouter,
  InputModeEventArgs,
  IRectangle,
  LayoutEdge,
  LayoutGraphAdapter,
  LayoutKeys,
  LayoutNode,
  OrthogonalEdgeEditingPolicy,
  Point,
  PortSides
} from '@yfiles/yfiles'

/**
 * The different edge routing strategies that the custom {@link RoutingCreateEdgeInputMode}
 * supports.
 */
export var RoutingStrategy
;(function (RoutingStrategy) {
  RoutingStrategy[(RoutingStrategy['NONE'] = 0)] = 'NONE'
  RoutingStrategy[(RoutingStrategy['EDGE_ROUTER'] = 1)] = 'EDGE_ROUTER'
  RoutingStrategy[(RoutingStrategy['PERFORMANCE_EDGE_ROUTER'] = 2)] = 'PERFORMANCE_EDGE_ROUTER'
})(RoutingStrategy || (RoutingStrategy = {}))

/**
 * A custom {@link CreateEdgeInputMode} that uses a
 * {@link RoutingCreateEdgeInputMode.routingStrategy} to determine how edges are routed during
 * edge creation gestures.
 */
export class RoutingCreateEdgeInputMode extends CreateEdgeInputMode {
  _routingStrategy
  edgeRouter = null

  // state holding fields from the start to the end of the edge creation gesture
  layoutGraphAdapter
  layoutSourceNode
  layoutTargetNode
  layoutEdge
  targetPortCandidates

  /**
   * Gets the edge routing algorithm that is used during the edge creation gesture.
   */
  get routingStrategy() {
    return this._routingStrategy
  }

  /**
   * Sets the edge routing algorithm that is used during the edge creation gesture.
   * @yjs:keep = AUTO
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
        this.edgeRouter = new EdgeRouter()
        // disable orthogonal edge creation, since the edge will be routed by the layout algorithm
        this.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.NEVER
        break
      case RoutingStrategy.PERFORMANCE_EDGE_ROUTER:
        this.edgeRouter = new EdgeRouter({
          stopDuration: 0 // maximize performance over quality
        })
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
   */
  onGestureStarted(evt) {
    if (this.routingStrategy === RoutingStrategy.NONE) {
      // just execute the default behavior
      super.onGestureStarted(evt)
      return
    }

    // initialize the graph that is considered during the layout
    this.layoutGraphAdapter = new LayoutGraphAdapter(this.graph)
    const layoutGraph = this.layoutGraphAdapter.layoutGraph

    // find the source node of the gesture in the layout graph
    this.layoutSourceNode = this.layoutGraphAdapter.getLayoutNode(this.previewEdge.sourceNode)

    // use a dummy target node during the gesture for the edge that is currently created
    this.layoutTargetNode = layoutGraph.createNode()
    this.layoutTargetNode.layout.size = [1, 1]

    // create the edge that should be routed
    this.layoutEdge = layoutGraph.createEdge(this.layoutSourceNode, this.layoutTargetNode)

    // set source point of the edge to the start point of the edge creation gesture's edge
    this.layoutEdge.sourcePortLocation = this.previewEdge.sourcePort.location.toPoint()

    // the target point of the edge may be relative to the dummy node it is attached
    this.layoutEdge.targetPortLocation = this.layoutEdge.target.layout.center.add(Point.ORIGIN)

    // mark the dummy edge as affected
    const affectedEdges = layoutGraph.createEdgeDataMap()
    affectedEdges.set(this.layoutEdge, true)
    layoutGraph.context.addItemData(LayoutKeys.ROUTE_EDGES_DATA_KEY, affectedEdges)

    // the source port should not be adjusted by the layout
    const sourcePortCandidates = layoutGraph.createEdgeDataMap()
    sourcePortCandidates.set(
      this.layoutEdge,
      new EdgePortCandidates().addFixedCandidate(
        RoutingCreateEdgeInputMode.getNodeSide(
          this.previewEdge.sourceNode.layout,
          this.previewEdge.sourcePort.location
        )
      )
    )
    this.targetPortCandidates = layoutGraph.createEdgeDataMap()
    layoutGraph.context.addItemData(
      EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY,
      sourcePortCandidates
    )

    super.onGestureStarted(evt)
  }

  /**
   * Called after each move during the edge creation gesture. If a {@link RoutingStrategy} is
   * specified, a new edge routing is calculated for the edge of this gesture.
   */
  onMoved(evt) {
    if (this.routingStrategy === RoutingStrategy.NONE) {
      // just execute the default behavior
      super.onMoved(evt)
      return
    }

    // clear any target port candidate
    const layoutGraph = this.layoutGraphAdapter.layoutGraph
    layoutGraph.context.remove(EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY)

    const targetPortCandidate = this.endPortCandidate
    const targetNode = this.previewEdge.targetNode
    const targetPort = this.previewEdge.targetPort

    if (targetPortCandidate !== null) {
      // use target port location if possible and candidate the target port depending on the ingoing node side
      this.targetPortCandidates.set(
        this.layoutEdge,
        new EdgePortCandidates().addFixedCandidate(
          RoutingCreateEdgeInputMode.getNodeSide(targetNode.layout, targetPort.location)
        )
      )
      layoutGraph.context.addItemData(
        EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY,
        this.targetPortCandidates
      )

      // adjust location and size of dummy target node to the actual hit target node
      this.layoutTargetNode.layout.bounds = targetNode.layout.toRect()
    } else {
      // no node hit, just use drag location
      this.layoutTargetNode.layout.size = [1, 1]
      this.layoutTargetNode.layout.topLeft = this.dragPoint.toPoint()
    }

    this.layoutEdge.targetPortLocation = targetPort.location

    // apply the layout
    this.edgeRouter.applyLayout(layoutGraph)

    // transfer the edge layout to the visible dummy edge of the gesture
    this.previewGraph.clearBends(this.previewEdge)
    for (const bend of this.layoutEdge.bends) {
      this.previewGraph.addBend(this.previewEdge, bend.location)
    }
    super.onMoved(evt)
  }

  /**
   * A helper function that determines the {@link PortSides} from the given point on the node.
   *
   * @param nodeLayout The node layout.
   * @param point The point for which the {@link PortSides} should be calculated.
   */
  static getNodeSide(nodeLayout, point) {
    const deltaX = Math.abs(nodeLayout.center.x - point.x) / nodeLayout.width
    const deltaY = Math.abs(nodeLayout.center.y - point.y) / nodeLayout.height

    if (deltaX === 0 && deltaY === 0) {
      return PortSides.ANY
    }

    if (deltaX > deltaY) {
      if (point.x < nodeLayout.center.x) {
        return PortSides.LEFT
      } else {
        return PortSides.RIGHT
      }
    } else {
      if (point.y < nodeLayout.center.y) {
        return PortSides.TOP
      } else {
        return PortSides.BOTTOM
      }
    }
  }
}
