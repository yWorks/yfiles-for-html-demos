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
import { GraphComponent, PortLayerPolicy } from '@yfiles/yfiles'
import { FlowNodePortCandidateProvider } from './FlowNodePortCandidateProvider'
import { FlowEdgeReconnectionPortCandidateProvider } from './FlowEdgeReconnectionPortCandidateProvider'

/**
 * Modifies port-related graph configuration.
 */
export function configureFlowNodePorts(gc) {
  gc.graphModelManager.portLayerPolicy = PortLayerPolicy.AT_OWNER
  gc.graph.nodeDefaults.ports.autoCleanUp = false
  gc.graph.decorator.nodes.portCandidateProvider.addFactory(
    (node) => new FlowNodePortCandidateProvider(node)
  )
  gc.graph.decorator.edges.reconnectionPortCandidateProvider.addFactory(
    (edge) => new FlowEdgeReconnectionPortCandidateProvider(edge)
  )
}

export function assertPortTag(tag) {
  if (validatePortTag(tag)) {
    return
  } else {
    throw new Error('Tag value does not satisfy type FlowNodePortProperties')
  }
}

export function validatePortTag(tag) {
  return (
    (typeof tag === 'object' && tag !== null && 'side' in tag && tag.side === 'left') ||
    tag.side === 'right'
  )
}
