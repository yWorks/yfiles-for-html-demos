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
import {
  type GraphComponent,
  type GraphEditorInputMode,
  IEdge,
  INode,
  type MoveInputMode,
  Reachability
} from '@yfiles/yfiles'
import { GraphSynchronizer } from './GraphSynchronizer'

export type StartLayoutMessage = { type: 'start-layout' }
export type DragStartedMessage = { type: 'drag-started'; nodeId: number; componentIds: number[] }
export type DraggedMessage = { type: 'dragged'; nodeId: number; componentIds: number[] }
export type DragCanceledMessage = { type: 'drag-canceled'; nodeId: number; componentIds: number[] }
export type DragFinishedMessage = { type: 'drag-finished'; nodeId: number; componentIds: number[] }
export type NodeChangedMessage = { type: 'node-changed'; nodeId: number; neighborsIds: number[] }
export type EdgeChangedMessage = {
  type: 'edge-changed'
  edgeId: number
  sourceId: number
  targetId: number
  neighborsIds: number[]
}
export type InteractionMessage =
  | StartLayoutMessage
  | DragStartedMessage
  | DraggedMessage
  | DragCanceledMessage
  | DragFinishedMessage
  | NodeChangedMessage
  | EdgeChangedMessage

/**
 * Initializes the web worker for the interactive layout and configures it for the input gestures.
 */
export async function initializeWorkerLayout(
  graphComponent: GraphComponent,
  graphEditorInputMode: GraphEditorInputMode
): Promise<{ startLayout: () => void }> {
  // load worker immediately on startup
  const worker = new Worker(new URL('./WorkerLayout', import.meta.url), { type: 'module' })

  await new Promise<void>((resolve) => {
    const readyListener = (evt: MessageEvent) => {
      if (typeof evt.data === 'object' && evt.data.type === 'worker-ready') {
        worker.removeEventListener('message', readyListener)
        resolve()
      }
    }
    worker.addEventListener('message', readyListener)
  })

  // use the GraphSynchronizer class to synchronize the UI graph with the graph in the web worker
  const graphSynchronizer = new GraphSynchronizer(graphComponent.graph, (message) =>
    worker.postMessage(message)
  )
  worker.addEventListener('message', (evt) => {
    graphSynchronizer.acceptMessage(evt.data)
  })

  return { startLayout }

  /**
   * Sends the message to the worker to start the layout and registers the necessary listeners for
   * handling drag operations.
   */
  function startLayout() {
    sendMessage({ type: 'start-layout' })

    prepareInteraction(graphEditorInputMode, graphSynchronizer)
  }

  /**
   * Registers the necessary drag listeners to the input mode to configure the interactive layout
   * to respect the drag position.
   */
  function prepareInteraction(
    graphEditorInputMode: GraphEditorInputMode,
    graphSynchronizer: GraphSynchronizer
  ): void {
    let draggedNodeId: number | undefined
    let draggedComponentIds: number[] | undefined

    const moveInputMode = graphEditorInputMode.moveSelectedItemsInputMode
    function getDraggedNode(moveInputMode: MoveInputMode): INode {
      return moveInputMode.affectedItems.at(0) as INode
    }

    moveInputMode.addEventListener('drag-started', (_, moveInputMode) => {
      const draggedNode = getDraggedNode(moveInputMode)
      draggedNodeId = graphSynchronizer.getId(draggedNode)
      // find the nodes that belong to the same component as the dragged node
      const reachability = new Reachability({ directed: false, startNodes: [draggedNode] }).run(
        graphComponent.graph
      )
      draggedComponentIds = reachability.reachableNodes
        .map((node) => graphSynchronizer.getId(node))
        .toArray()
      sendMessage({
        type: 'drag-started',
        nodeId: draggedNodeId,
        componentIds: draggedComponentIds
      })
    })

    moveInputMode.addEventListener('dragged', () => {
      sendMessage({ type: 'dragged', nodeId: draggedNodeId!, componentIds: draggedComponentIds! })
    })

    moveInputMode.addEventListener('drag-canceled', () => {
      sendMessage({
        type: 'drag-canceled',
        nodeId: draggedNodeId!,
        componentIds: draggedComponentIds!
      })
      draggedNodeId = undefined
      draggedComponentIds = undefined
    })

    moveInputMode.addEventListener('drag-finished', () => {
      sendMessage({
        type: 'drag-finished',
        nodeId: draggedNodeId!,
        componentIds: draggedComponentIds!
      })
      draggedNodeId = undefined
      draggedComponentIds = undefined
    })

    graphEditorInputMode.addEventListener('node-created', (evt) => {
      createNodeChangedMessage(evt.item)
    })

    graphEditorInputMode.createEdgeInputMode.addEventListener('edge-created', (evt) => {
      createEdgeChangedMessage(evt.item)
    })

    graphEditorInputMode.addEventListener('deleting-selection', (evt) => {
      evt.selection.forEach((item) => {
        if (item instanceof INode) {
          createNodeChangedMessage(item)
        } else if (item instanceof IEdge) {
          createEdgeChangedMessage(item)
        }
      })
    })
  }

  /**
   * Sends a message to the worker when a node has been created/deleted.
   */
  function createNodeChangedMessage(node: INode) {
    const neighborsIds = getClosestNodesIds(node)
    sendMessage({
      type: 'node-changed',
      nodeId: graphSynchronizer.getId(node),
      neighborsIds: neighborsIds
    })
  }

  /**
   * Sends a message to the worker when an edge has been created/deleted.
   */
  function createEdgeChangedMessage(edge: IEdge) {
    const source = edge.sourceNode
    const target = edge.targetNode
    if (source && target) {
      sendMessage({
        type: 'edge-changed',
        edgeId: graphSynchronizer.getId(edge),
        sourceId: graphSynchronizer.getId(source),
        targetId: graphSynchronizer.getId(target),
        neighborsIds: getClosestNodesIds(source).concat(getClosestNodesIds(target))
      })
    }
  }

  /**
   * Returns the IDs of nodes whose centers lie within the specified distance of the given node.
   */
  function getClosestNodesIds(node: INode, distance = 150) {
    const closestNodes = graphComponent.graph.nodes
      .filter((n) => n !== node && n.layout.center.distanceTo(node.layout.center) < distance)
      .toArray()
    return closestNodes.map((neighbor) => graphSynchronizer.getId(neighbor))
  }

  function sendMessage(message: InteractionMessage) {
    worker.postMessage(message)
  }
}
