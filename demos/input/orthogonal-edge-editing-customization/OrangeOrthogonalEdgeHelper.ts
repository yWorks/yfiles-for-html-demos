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
import { type IInputModeContext, IOrthogonalEdgeHelper, OrthogonalEdgeHelper } from '@yfiles/yfiles'

/**
 * An {@link OrthogonalEdgeHelper} that enables moving the
 * source/target of the edge to another port.
 */
export class OrangeOrthogonalEdgeHelper extends OrthogonalEdgeHelper {
  /**
   * Enables moving the source and target of the edge to other ports.
   * @param _inputModeContext The input mode context in which the segment is edited
   * @param _sourceEnd `true` if the source end of the edge is queried, `false` false
   * for the target end
   * @see Overrides {@link OrthogonalEdgeHelper.shouldMoveEndImplicitly}
   * @see Specified by {@link IOrthogonalEdgeHelper.shouldMoveEndImplicitly}.
   */
  shouldMoveEndImplicitly(_inputModeContext: IInputModeContext, _sourceEnd: boolean): boolean {
    return true
  }
}
