/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-editor'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Creates a bend creator that ensures that inner segments of an edge are always
   * orthogonal, even if the new bend was created on the non-orthogonal first
   * or last segment.
   */
  class BlueBendCreator extends yfiles.lang.Class(yfiles.input.IBendCreator) {
    /**
     * Creates a new bend at the given location. If this bend is on the first or last segment,
     * a second bend is created and placed at a location that ensures that the newly create
     * inner segment is orthogonal.
     * @param {yfiles.input.IInputModeContext} context The context for which the bend should be created
     * @param {yfiles.graph.IGraph} graph The graph, the edge belongs to
     * @param {yfiles.graph.IEdge} edge The edge
     * @param {yfiles.geometry.Point} location The preferred coordinates of the bend
     * @see Specified by {@link yfiles.input.IBendCreator#createBend}.
     * @return {number}
     */
    createBend(context, graph, edge, location) {
      const edgePoints = getEdgePoints(edge)
      const closestSegment = determineBendSegmentIndex(edgePoints, location)

      const firstSegment = 0
      const lastSegment = edge.bends.size

      // if bend wasn't created in first or last segment, call default action
      if (closestSegment !== firstSegment && closestSegment !== lastSegment) {
        return new yfiles.input.DefaultBendCreator(edge).createBend(context, graph, edge, location)
      }

      // add created bend and another one to make the edge stay orthogonal
      if (
        closestSegment === -1 ||
        context === null ||
        !(context.parentInputMode instanceof yfiles.input.CreateBendInputMode)
      ) {
        return -1
      }
      const editingContext = context.lookup(yfiles.input.OrthogonalEdgeEditingContext.$class)
      if (editingContext === null) {
        return -1
      }
      if (closestSegment === firstSegment) {
        const nextPoint = edgePoints.get(1)
        // get orientation of next edge segment to determine second bend location
        const orientation = editingContext.getSegmentOrientation(edge, 1)
        graph.addBend(edge, location, 0)
        if (orientation === yfiles.input.SegmentOrientation.HORIZONTAL) {
          graph.addBend(edge, new yfiles.geometry.Point(nextPoint.x, location.y), 1)
        } else if (orientation === yfiles.input.SegmentOrientation.VERTICAL) {
          graph.addBend(edge, new yfiles.geometry.Point(location.x, nextPoint.y), 1)
        }
        return 0
      }
      if (closestSegment === lastSegment) {
        const prevPoint = edgePoints.get(edge.bends.size)
        // get orientation of next edge segment to determine second bend location
        const orientation = editingContext.getSegmentOrientation(edge, edge.bends.size - 1)
        graph.addBend(edge, location, edge.bends.size)
        if (orientation === yfiles.input.SegmentOrientation.HORIZONTAL) {
          graph.addBend(
            edge,
            new yfiles.geometry.Point(prevPoint.x, location.y),
            edge.bends.size - 1
          )
        } else if (orientation === yfiles.input.SegmentOrientation.VERTICAL) {
          graph.addBend(
            edge,
            new yfiles.geometry.Point(location.x, prevPoint.y),
            edge.bends.size - 1
          )
        }
        return edge.bends.size - 1
      }
      return -1
    }
  }

  /**
   * Determines the index of the segment in which the bend was created.
   * @param {yfiles.collections.List} points The points of an edge
   * @param {yfiles.geometry.Point} location The given location
   * @return {number}
   */
  function determineBendSegmentIndex(points, location) {
    let closestIndex = -1
    let minDist = Number.MAX_VALUE
    for (let i = 0; i < points.size - 1; i++) {
      const dist = location.distanceToSegment(points.get(i), points.get(i + 1))
      if (dist < minDist) {
        closestIndex = i
        minDist = dist
      }
    }
    return closestIndex
  }

  /**
   * Returns a list containing the source port location, the bend locations,
   * and the target port location of the given edge.
   * @param {yfiles.graph.IEdge} edge The given edge
   * @return {yfiles.collections.List.<yfiles.geometry.Point>}
   */
  function getEdgePoints(edge) {
    const points = new yfiles.collections.List()
    points.add(edge.sourcePort.location.toPoint())
    edge.bends.forEach(bend => {
      points.add(bend.location.toPoint())
    })
    points.add(edge.targetPort.location.toPoint())
    return points
  }

  return BlueBendCreator
})
