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
  BaseClass,
  DefaultPortCandidate,
  FreeNodePortLocationModel,
  IEdgeReconnectionPortCandidateProvider,
  IEnumerable,
  IInputModeContext,
  IPortCandidate,
  List
} from 'yfiles'

/**
 * An {@link IEdgeReconnectionPortCandidateProvider} that allows moving ports to
 * any other existing port on any node.
 */
export default class BlueEdgePortCandidateProvider
  extends BaseClass<IEdgeReconnectionPortCandidateProvider>(IEdgeReconnectionPortCandidateProvider)
  implements IEdgeReconnectionPortCandidateProvider
{
  /**
   * Returns candidates for the locations of all existing ports at all nodes.
   * @param context The context for which the candidates should be provided
   * @see Specified by {@link IEdgeReconnectionPortCandidateProvider#getSourcePortCandidates}.
   */
  getSourcePortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    const result = new List<IPortCandidate>()
    const graph = context.graph
    if (graph !== null) {
      graph.nodes.forEach(node => {
        node.ports.forEach(port => {
          // don't reuse the existing ports, but create new ones at the same location
          result.add(
            new DefaultPortCandidate(
              node,
              FreeNodePortLocationModel.INSTANCE.createParameter(node, port.location)
            )
          )
        })
      })
    }
    return result
  }

  /**
   * Returns candidates for the locations of all existing ports at all nodes.
   * @param context The context for which the candidates should be provided
   * @see Specified by {@link IEdgeReconnectionPortCandidateProvider#getTargetPortCandidates}.
   */
  getTargetPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    const result = new List<IPortCandidate>()
    const graph = context.graph
    if (graph !== null) {
      graph.nodes.forEach(node => {
        node.ports.forEach(port => {
          // reuse the existing port - the edge will be connected to the very same port after reconnection
          result.add(new DefaultPortCandidate(port))
        })
      })
    }
    return result
  }
}
