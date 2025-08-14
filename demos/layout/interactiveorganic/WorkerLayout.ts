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
  Graph,
  IEdgeStyle,
  type IGraph,
  ILabelStyle,
  type INode,
  INodeStyle,
  InteractiveOrganicLayout,
  License
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { GraphSynchronizer } from './GraphSynchronizer'
import { InteractiveOrganicLayoutInputHelper } from './InteractiveOrganicLayoutInputHelper'
import type {
  DragCanceledMessage,
  DragFinishedMessage,
  DraggedMessage,
  DragStartedMessage,
  InteractionMessage
} from './initializeWorkerLayout'

// register the yFiles license in the worker as well
License.value = licenseData

// create a graph that is synchronized with the UI graph using the GraphSynchronizer class
const graph = createWorkerGraph()
const graphSynchronizer = new GraphSynchronizer(graph, (message) => postMessage(message))

// initialize the interactive organic layout
const layoutHelper = new InteractiveOrganicLayoutInputHelper(graph, {
  layout: () => new InteractiveOrganicLayout({ stopDuration: '2s' })
})

// Handle messages from the UI thread. Some messages are to configure the layout for the
// current input gesture. The other messages are for the GraphSynchronizer.
self.addEventListener('message', (event: MessageEvent) => {
  if (typeof event.data !== 'object') {
    return
  }

  const message = event.data as InteractionMessage

  switch (message.type) {
    case 'start-layout':
      handleStartLayout()
      break
    case 'drag-started':
      handleDragStarted(message)
      break
    case 'dragged':
      handleDragged(message)
      break
    case 'drag-canceled':
      handleDragCanceled(message)
      break
    case 'drag-finished':
      handleDragFinished(message)
      break
    default:
      graphSynchronizer.acceptMessage(message)
      break
  }
})

// signal the UI thread the worker is all set-up
postMessage({ type: 'worker-ready' })

function handleStartLayout() {
  layoutHelper.startInterval()
}

function handleDragStarted(message: DragStartedMessage) {
  const draggedNode = graphSynchronizer.getItem(message.nodeId) as INode
  const draggedComponent = getNodesForIds(message.componentIds)
  layoutHelper.startDrag(draggedNode, draggedComponent)
}

function handleDragged(message: DraggedMessage) {
  const draggedNode = graphSynchronizer.getItem(message.nodeId) as INode
  const draggedComponent = getNodesForIds(message.componentIds)
  layoutHelper.drag(draggedNode, draggedComponent, 0.01)
}

function handleDragCanceled(message: DragCanceledMessage) {
  const draggedNode = graphSynchronizer.getItem(message.nodeId) as INode
  const draggedComponent = getNodesForIds(message.componentIds)
  layoutHelper.finishDrag(draggedNode, draggedComponent)
}

function handleDragFinished(message: DragFinishedMessage) {
  const draggedNode = graphSynchronizer.getItem(message.nodeId) as INode
  const draggedComponent = getNodesForIds(message.componentIds)
  layoutHelper.finishDrag(draggedNode, draggedComponent)
}

function getNodesForIds(ids: number[]): INode[] {
  return ids.map((id) => graphSynchronizer.getItem(id) as INode)
}

/**
 * Creates a new {@link IGraph} instance and uses void styles, since we cannot
 * use any DOM APIs in a web worker.
 */
function createWorkerGraph(): IGraph {
  const graph = new Graph()
  graph.nodeDefaults.style = INodeStyle.VOID_NODE_STYLE
  graph.nodeDefaults.labels.style = ILabelStyle.VOID_LABEL_STYLE
  graph.edgeDefaults.style = IEdgeStyle.VOID_EDGE_STYLE
  graph.edgeDefaults.labels.style = ILabelStyle.VOID_LABEL_STYLE
  return graph
}
