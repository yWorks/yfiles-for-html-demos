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
  EdgePathPortLocationModel,
  type IEdge,
  IEnumerable,
  type IInputModeContext,
  type IPortCandidate,
  PortCandidate,
  PortCandidateProviderBase
} from '@yfiles/yfiles'

/**
 * A port candidate provider that aggregates different {@link IPortLocationModel PortLocationModels}
 * to provide a number of port candidates along the path of the edge.
 */
export class EdgePathPortCandidateProvider extends PortCandidateProviderBase {
    private readonly edge: IEdge;

  /**
   * Create a new instance of this type.
   */
  constructor(edge: IEdge) {
    super()
      this.edge = edge;
  }

  /**
   * Creates an enumeration of possible port candidates.
   */
  getPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    const candidates: IPortCandidate[] = []
    const edge = this.edge

    // add equally distributed port candidates along the edge
    for (let i = 1; i < 10; ++i) {
      candidates.push(
        new PortCandidate(edge, EdgePathPortLocationModel.INSTANCE.createRatioParameter(0.1 * i))
      )
    }

    // add a dynamic candidate that can be used if shift is pressed to assign the exact location.
    candidates.push(new PortCandidate(edge, EdgePathPortLocationModel.INSTANCE))

    return IEnumerable.from(candidates)
  }
}
