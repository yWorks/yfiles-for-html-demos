/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IEdge,
  IInputModeContext,
  IOrthogonalEdgeHelper,
  OrthogonalEdgeHelper,
  SegmentOrientation
} from 'yfiles'

/**
 * The {@link OrthogonalEdgeHelper} for blue edges. Orthogonal edge
 * editing is enabled for the inner segments of this edges but not for the
 * first and last one.
 */
export default class BlueOrthogonalEdgeHelper extends OrthogonalEdgeHelper {
  /**
   * Returns the NonOrthogonal segment orientation for the first and last
   * segment, and the default for all other segments.
   * @param inputModeContext The input mode context in which the orientation is
   *   needed
   * @param edge The edge to inspect.
   * @param segmentIndex The index of the segment
   * @see Overrides {@link OrthogonalEdgeHelper#getSegmentOrientation}
   * @see Specified by {@link IOrthogonalEdgeHelper#getSegmentOrientation}.
   */
  getSegmentOrientation(
    inputModeContext: IInputModeContext,
    edge: IEdge,
    segmentIndex: number
  ): SegmentOrientation {
    const isFirstOrLastSegment = segmentIndex === 0 || segmentIndex === edge.bends.size
    return isFirstOrLastSegment
      ? SegmentOrientation.NON_ORTHOGONAL
      : super.getSegmentOrientation(inputModeContext, edge, segmentIndex)
  }
}
