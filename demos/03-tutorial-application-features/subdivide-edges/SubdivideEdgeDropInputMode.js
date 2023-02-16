/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  GraphInputMode,
  GraphItemTypes,
  IEdge,
  IGraph,
  IInputModeContext,
  IModelItem,
  INode,
  ItemEventArgs,
  ListEnumerable,
  NodeDropInputMode,
  Point,
  Rect,
  SimpleBend,
  SimpleEdge
} from 'yfiles'

/**
 * @typedef {Object} SplitSegment
 * @property {number} index
 * @property {Point} projection
 */

/**
 * This {@link NodeDropInputMode} allows for dropping a node onto an edge. More precisely, when a node
 * is dropped onto an edge, a new node is created and the edge is split in two edges such that:
 *
 * - The source of the first edge is the original source of the split edge and the target is the newly created node.
 * - The source of second edge is the newly created node and the target is the original target of the split edge.
 *
 * Note that, only edges that are not in folding state are considered to be valid.
 */
export class SubdivideEdgeDropInputMode extends NodeDropInputMode {
  /**
   * Returns the drop target at the specified location.
   * @param {!Point} dragLocation The location to return the drop target for
   * @returns {?IModelItem}
   */
  getDropTarget(dragLocation) {
    // return the edge as hit item as well
    let hitItem

    const inputModeContext = this.inputModeContext
    const parentMode = inputModeContext.lookup(GraphInputMode.$class)
    if (parentMode) {
      const foldingView = inputModeContext.graph.foldingView
      // exclude edges that are in folding state
      const hitItems = parentMode.findItems(
        dragLocation,
        [GraphItemTypes.EDGE],
        e => !foldingView?.isInFoldingState(e)
      )
      hitItem = hitItems.at(0)
    }
    return hitItem ?? super.getDropTarget(dragLocation)
  }

  /**
   * Creates the node in the graph after it's been dropped.
   * @param {!IInputModeContext} context The context for which the node should be created
   * @param {!IGraph} graph The Graph in which to create the item
   * @param {!INode} node The node that was dragged and should therefore be created
   * @param {?IModelItem} dropTarget The IModelItem on which the node is dropped
   * @param {!Rect} layout The bounds of the new node
   * @returns {?INode}
   */
  createNode(context, graph, node, dropTarget, layout) {
    // The super implementation of createNode automatically reparents the created node correctly,
    // if the dropTarget is a group node. Therefore, if the node is dropped onto an edge that is
    // located on top of a group node, provide this group node as dropTarget.
    if (dropTarget instanceof IEdge) {
      const groupAtDropLocation = context
        .lookup(GraphInputMode.$class)
        ?.findItems(context, this.dropLocation, [GraphItemTypes.NODE], item =>
          graph.isGroupNode(item)
        )
        ?.at(0)

      if (groupAtDropLocation instanceof INode) {
        dropTarget = groupAtDropLocation
      }
    }

    return super.createNode(context, graph, node, dropTarget, layout)
  }

  /**
   * Splits the edge if the node is dropped on an edge.
   * @param {!ItemEventArgs.<INode>} evt
   */
  onItemCreated(evt) {
    const newNode = evt.item
    if (!(this.dropTarget instanceof IEdge)) {
      // trigger the default event if the dropped target is not an edge
      super.onItemCreated(evt)
      return
    }

    const edge = this.dropTarget
    const targetGraph = this.inputModeContext.graph
    const size = edge.bends.size
    const droppedNodeCenter = newNode.layout.center
    let splitEdge = edge
    if (edge.isSelfloop && (size === 0 || size === 1)) {
      // these self loops are drawn specifically
      splitEdge = this.getDummyEdgeFromPath(edge)
    }

    // get the closest segment to the node center and create the ports for the new edges
    const closestSegment = this.getClosestSegment(droppedNodeCenter, splitEdge)
    const newPort1 = targetGraph.addPortAt(newNode, closestSegment.projection)
    const newPort2 = targetGraph.addPortAt(newNode, closestSegment.projection)
    // for the new edges, we use the style of the original edge
    const newEdge1 = targetGraph.createEdge(edge.sourcePort, newPort1, edge.style.clone())
    const newEdge2 = targetGraph.createEdge(newPort2, edge.targetPort, edge.style.clone())
    splitEdge.bends.forEach((bend, idx) => {
      if (idx < closestSegment.index) {
        targetGraph.addBend(newEdge1, bend.location.toPoint())
      } else {
        targetGraph.addBend(newEdge2, bend.location.toPoint())
      }
    })

    // copy the labels of the original edge to the newly created edges
    edge.labels.forEach(label => {
      targetGraph.addLabel(
        newEdge1,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag ? { ...label.tag } : null
      )
      targetGraph.addLabel(
        newEdge2,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag ? { ...label.tag } : null
      )
    })

    // remove the original edge from the graph
    targetGraph.remove(edge)

    // trigger the default event
    super.onItemCreated(evt)
  }

  /**
   * Returns the closest segment of the edge from the center of the node.
   * @returns {!SplitSegment} closest segment index
   * @param {!Point} point
   * @param {!IEdge} edge
   */
  getClosestSegment(point, edge) {
    // if the edge has no bends, use the projection of the node center to the edge line
    const sourcePortLocation = edge.sourcePort.location
    const targetPortLocation = edge.targetPort.location
    if (edge.bends.size === 0) {
      return {
        index: 0,
        projection: point.getProjectionOnSegment(sourcePortLocation, targetPortLocation)
      }
    }

    let minDistance = Number.MAX_VALUE
    let closestSegmentIndex = -1
    let closestProjection = null

    let lastPoint = sourcePortLocation
    edge.bends.concat(new SimpleBend(null, targetPortLocation)).forEach((bend, i) => {
      const currentPoint = bend.location.toPoint()
      const projectionOnSegment = point.getProjectionOnSegment(lastPoint, currentPoint)
      const distance = point.distanceTo(projectionOnSegment)
      if (distance <= minDistance) {
        minDistance = distance
        closestSegmentIndex = i
        closestProjection = projectionOnSegment
      }

      lastPoint = currentPoint
    })

    return { index: closestSegmentIndex, projection: closestProjection }
  }

  /**
   * Creates a dummy edge for the given self-loop edge. The new edge will take the bends from the edge style renderer.
   * @param {!IEdge} edge
   * @returns {!SimpleEdge}
   */
  getDummyEdgeFromPath(edge) {
    const dummyEdge = new SimpleEdge(edge.sourcePort, edge.targetPort)

    const path = edge.style.renderer.getPathGeometry(edge, edge.style).getPath()
    const pathCursor = path.createCursor()
    const bends = []
    while (pathCursor.moveNext()) {
      bends.push(new SimpleBend(dummyEdge, pathCursor.currentEndPoint))
    }
    dummyEdge.bends = new ListEnumerable(bends)

    return dummyEdge
  }
}
