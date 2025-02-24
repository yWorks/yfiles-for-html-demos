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
import type { IEdge, IGraph, IInputModeContext } from '@yfiles/yfiles'
import { IShapeGeometry, OrthogonalEdgeHelper, Point } from '@yfiles/yfiles'

/**
 * Creates one new bend if the first or last segment of an edge is moved.
 * If the old first (last) segment was a horizontal segment, the new first (last) segment will be
 * a vertical segment and vice versa.
 * The new first (last) segment may lie completely inside the edge's source (target) node.
 */
export default class YellowOrthogonalEdgeHelper extends OrthogonalEdgeHelper {
  /**
   * Stores if a new bend has been added when moving a segment of an orthogonal edge.
   */
  private bendAddedState = BendAddedState.None

  constructor(edge: IEdge) {
    super(edge)
  }

  /**
   * Prevents edge ports from being moved.
   * As a side effect, this method adds a new bend at the source or target end of the edge.
   * @param inputModeContext The input mode context in which the segment is edited.
   * @param sourceEnd `true` if the source end of the edge is queried and `false` otherwise.
   */
  shouldMoveEndImplicitly(inputModeContext: IInputModeContext, sourceEnd: boolean): boolean {
    if (sourceEnd) {
      this.bendAddedState = BendAddedState.AtSource
      inputModeContext.graph!.addBend(
        this.edge,
        this.edge.sourcePort.location,
        BendAddedState.AtSource
      )
    } else {
      this.bendAddedState = BendAddedState.AtTarget
      inputModeContext.graph!.addBend(
        this.edge,
        this.edge.targetPort.location,
        BendAddedState.AtTarget
      )
    }

    return false
  }

  cleanUpEdge(inputModeContext: IInputModeContext, graph: IGraph): void {
    this.cleanUpEdgeImpl(graph)
    super.cleanUpEdge(inputModeContext, graph)
  }

  private cleanUpEdgeImpl(graph: IGraph): void {
    const bendAddedState = this.bendAddedState
    this.bendAddedState = BendAddedState.None

    if (bendAddedState == BendAddedState.None || this.edge.bends.size < 1) {
      return
    }

    cleanUpEdgeEnd(graph, this.edge, bendAddedState)
  }
}

/**
 * Removes unnecessary bends inside the source or target node of the given edge, if
 * {@link #shouldMoveEndImplicitly} added a new bend at that end of the edge in the first place.
 * @param graph The graph to use for modifying the edge instance.
 * @param edge The edge whose path needs to be cleaned up.
 * @param bendAddedState Specifies which end of the given edge has to be cleaned up.
 */
function cleanUpEdgeEnd(
  graph: IGraph,
  edge: IEdge,
  bendAddedState: BendAddedState.AtSource | BendAddedState.AtTarget
): void {
  const atSource = bendAddedState == BendAddedState.AtSource

  const port = atSource ? edge.sourcePort : edge.targetPort
  const geometry = port.owner.lookup(IShapeGeometry)!

  // remove all bend inside the respective node
  const bends = edge.bends
  while (bends.size > 0) {
    const bend = atSource ? bends.first() : bends.last()
    if (geometry.isInside(bend!.location.toPoint())) {
      graph.remove(bend!)
    } else {
      break
    }
  }

  const portLocation = port.location.toPoint()
  const portX = portLocation.x
  const portY = portLocation.y

  const otherLocation: Point =
    bends.size > 0
      ? (atSource ? bends.first() : bends.last())!.location.toPoint()
      : (atSource ? edge.targetPort : edge.sourcePort).location
  const otherX = otherLocation.x
  const otherY = otherLocation.y

  // ensure the first (last) two segments are orthogonal segments
  if (portX !== otherX && portY !== otherY) {
    const candidate = new Point(otherX, portY)
    if (geometry.isInside(candidate)) {
      graph.addBend(edge, candidate, bendAddedState)
    } else {
      graph.addBend(edge, new Point(portX, otherY), bendAddedState)
    }
  }
}

/**
 * Important: Do not change the numeric values of {@link #AtSource} and {@link #AtTarget}.
 * Changing the numeric values will break the `addBend` logic in
 * {@link YellowOrthogonalEdgeHelper#shouldMoveEndImplicitly} and {@link #cleanUpEdgeEnd}.
 */
enum BendAddedState {
  None = -2,
  AtTarget = -1,
  AtSource = 0
}
