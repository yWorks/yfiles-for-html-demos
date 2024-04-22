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
import type { IInputModeContext, INode, IPortCandidate } from 'yfiles'
import {
  BaseClass,
  DefaultPortCandidate,
  FreeNodePortLocationModel,
  IEnumerable,
  IPortCandidateProvider
} from 'yfiles'

/**
 * A port candidate provider for defining two ports on the left and right side of the activity nodes.
 */
export class ActivityNodePortCandidateProvider extends BaseClass<IPortCandidateProvider>(
  IPortCandidateProvider
) {
  constructor(private node: INode) {
    super()
  }

  /**
   * Returns a port candidate on the right side of the node where an edge can start.
   */
  getAllSourcePortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    const candidate = new DefaultPortCandidate(
      this.node,
      FreeNodePortLocationModel.NODE_RIGHT_ANCHORED
    )
    return IEnumerable.from([candidate])
  }

  /**
   * Returns a port candidate on the left side of the node where an edge can end.
   */
  getAllTargetPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    const candidate = new DefaultPortCandidate(
      this.node,
      FreeNodePortLocationModel.NODE_LEFT_ANCHORED
    )
    return IEnumerable.from([candidate])
  }

  /**
   * Returns all port candidates that apply for the provided opposite target port candidate.
   */
  getSourcePortCandidates(
    context: IInputModeContext,
    target: IPortCandidate
  ): IEnumerable<IPortCandidate> {
    return this.getAllSourcePortCandidates(context)
  }

  /**
   * Returns all port candidates that apply for the provided opposite source port candidate.
   */
  getTargetPortCandidates(
    context: IInputModeContext,
    source: IPortCandidate
  ): IEnumerable<IPortCandidate> {
    return this.getAllTargetPortCandidates(context)
  }
}
