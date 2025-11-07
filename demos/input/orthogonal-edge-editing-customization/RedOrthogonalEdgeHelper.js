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
import { BaseClass, IOrthogonalEdgeHelper, SegmentOrientation } from '@yfiles/yfiles'

/**
 * An {@link IOrthogonalEdgeHelper} for edges that don't have
 * orthogonal editing behavior.
 */
export class RedOrthogonalEdgeHelper extends BaseClass(IOrthogonalEdgeHelper) {
  constructor(edge) {
    super(edge)
  }

  /**
   * Returns the non-orthogonal segment orientation.
   * @param _inputModeContext The input mode context in which the segment is edited
   * @param _segmentIndex The index of the segment
   * @see Specified by {@link IOrthogonalEdgeHelper.getSegmentOrientation}.
   */
  getSegmentOrientation(_inputModeContext, _segmentIndex) {
    return SegmentOrientation.NON_ORTHOGONAL
  }

  /**
   * Returns `false`.
   * @param _inputModeContext The input mode context in which the segment is edited
   * @param _sourceEnd `true` if the source end of the edge is queried, `false` for
   * the target end
   * @see Specified by {@link IOrthogonalEdgeHelper.shouldMoveEndImplicitly}.
   */
  shouldMoveEndImplicitly(_inputModeContext, _sourceEnd) {
    return false
  }

  /**
   * Returns `false`.
   * @see Specified by {@link IOrthogonalEdgeHelper.shouldEditOrthogonally}.
   * @param _inputModeContext The input mode context in which the segment is edited
   */
  shouldEditOrthogonally(_inputModeContext) {
    return false
  }

  /**
   * Does nothing; no cleanup of bends performed.
   * @param _inputModeContext The input mode context which edited the edge
   * @param _graph The graph to use for modifying the edge instance
   * @see Specified by {@link IOrthogonalEdgeHelper.cleanUpEdge}.
   */
  cleanUpEdge(_inputModeContext, _graph) {}
}
