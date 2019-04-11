/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IEdge,
  IGraph,
  IInputModeContext,
  IOrthogonalEdgeHelper,
  SegmentOrientation
} from 'yfiles'

/**
 * An {@link IOrthogonalEdgeHelper} for edges that don't have
 * orthogonal editing behavior.
 */
export default class RedOrthogonalEdgeHelper extends BaseClass(IOrthogonalEdgeHelper) {
  /**
   * Returns the non-orthogonal segment orientation.
   * @param {IInputModeContext} inputModeContext The input mode context in which the segment is edited
   * @param {IEdge} edge The edge to inspect
   * @param {number} segmentIndex The index of the segment
   * @see Specified by {@link IOrthogonalEdgeHelper#getSegmentOrientation}.
   * @return {SegmentOrientation}
   */
  getSegmentOrientation(inputModeContext, edge, segmentIndex) {
    return SegmentOrientation.NON_ORTHOGONAL
  }

  /**
   * Returns <code>false</code>.
   * @param {IInputModeContext} inputModeContext The input mode context in which the segment is edited
   * @param {IEdge} edge The edge to inspect
   * @param {boolean} sourceEnd <code>True</code> if the source end of the edge is queried, <code>false</code> for
   * the target end
   * @see Specified by {@link IOrthogonalEdgeHelper#shouldMoveEndImplicitly}.
   * @return {boolean}
   */
  shouldMoveEndImplicitly(inputModeContext, edge, sourceEnd) {
    return false
  }

  /**
   * Returns <code>false</code>.
   * @param {IInputModeContext} inputModeContext The input mode context in which the segment is edited
   * @see Specified by {@link IOrthogonalEdgeHelper#shouldEditOrthogonally}.
   * @return {boolean}
   */
  shouldEditOrthogonally(inputModeContext) {
    return false
  }

  /**
   * Does nothing; no cleanup of bends performed.
   * @param {IInputModeContext} inputModeContext  The input mode context which edited the edge
   * @param {IGraph} graph The graph to use for modifying the edge instance
   * @param {IEdge} edge  The edge to clean up the path
   * @see Specified by {@link IOrthogonalEdgeHelper#cleanUpEdge}.
   */
  cleanUpEdge(inputModeContext, graph, edge) {}
}
