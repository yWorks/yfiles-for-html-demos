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
  type IEdge,
  type IGraph,
  type IModelItem,
  type INode,
  type ItemEventArgs,
  Rect
} from '@yfiles/yfiles'

type NodeCreatedMessage = {
  type: 'node-created'
  id: number
  layout: [number, number, number, number]
}
type NodeRemovedMessage = { type: 'node-removed'; id: number }
type NodeLayoutChangedMessage = {
  type: 'node-layout-changed'
  id: number
  newLayout: [number, number, number, number]
}
type EdgeCreatedMessage = { type: 'edge-created'; id: number; sourceId: number; targetId: number }
type EdgeRemovedMessage = { type: 'edge-removed'; id: number }
type SynchronizeMessage =
  | NodeCreatedMessage
  | NodeRemovedMessage
  | NodeLayoutChangedMessage
  | EdgeCreatedMessage
  | EdgeRemovedMessage

/**
 * Two instances of this class synchronize two graphs across threads.
 *
 * The graphs are synchronized both ways: changes in either graph are reflected
 * on the other graph. Both graphs must be empty when initializing the {@link GraphSynchronizer}s.
 *
 * This class only synchronizes structural changes. It does not synchronize labels, bends, ports
 * or styles.
 */
export class GraphSynchronizer {
  private readonly messageHandler: (message: unknown) => void
  readonly graph: IGraph
  private readonly item2Id = new Map<IModelItem, number>()
  private readonly id2Item = new Map<number, IModelItem>()
  private lastId = 0
  private reentrantFlag = false

  private readonly nodeCreatedListener = (evt: ItemEventArgs<INode>) =>
    this.sendMessage(evt, this.createNodeCreatedMessage)

  private readonly nodeRemovedListener = (evt: ItemEventArgs<INode>) =>
    this.sendMessage(evt, this.createNodeRemovedMessage)

  private readonly nodeLayoutChangedListener = (evt: INode) =>
    this.sendMessage(evt, this.createNodeLayoutChangedMessage)

  private readonly edgeCreatedListener = (evt: ItemEventArgs<IEdge>) =>
    this.sendMessage(evt, this.createEdgeCreatedMessage)

  private readonly edgeRemovedListener = (evt: ItemEventArgs<IEdge>) =>
    this.sendMessage(evt, this.createEdgeRemovedMessage)

  /**
   * Creates a new instance of this class.
   * @param graph The graph to synchronize with another graph.
   * @param messageHandler A callback that is called when a change in this graph occurred. It is
   * a message that must be sent to the other {@link GraphSynchronizer} instance and passed to
   * {@link acceptMessage}.
   */
  constructor(graph: IGraph, messageHandler: (message: unknown) => void) {
    this.graph = graph
    this.messageHandler = messageHandler
    this.registerGraphEvents()
  }

  /**
   * Accepts a message from another {@link GraphSynchronizer} instance
   * to reflect its changes on this graph.
   * @param message The message from the other instance's messageHandler.
   */
  public acceptMessage(message: unknown): void {
    this.reentrantFlag = true
    this.handleMessage(message as SynchronizeMessage)
    this.reentrantFlag = false
  }

  /**
   * Returns the id of an item. The id is used to identify an item across the graphs.
   */
  public getId(item: IModelItem): number {
    let id = this.item2Id.get(item)
    if (id == null) {
      id = ++this.lastId
      this.item2Id.set(item, id)
      this.id2Item.set(id, item)
    }
    return id
  }

  /**
   * Returns the item with the given id. If this graph does not contain an item with this id,
   * it will throw an Error.
   */
  public getItem(id: number): IModelItem | undefined {
    return this.id2Item.get(id)
  }

  /**
   * Disposes this instance.
   */
  public cleanUp(): void {
    this.graph.removeEventListener('node-created', this.nodeCreatedListener)
    this.graph.removeEventListener('node-removed', this.nodeRemovedListener)
    this.graph.removeEventListener('node-layout-changed', this.nodeLayoutChangedListener)
    this.graph.removeEventListener('edge-created', this.edgeCreatedListener)
    this.graph.removeEventListener('edge-removed', this.edgeRemovedListener)

    this.item2Id.clear()
    this.id2Item.clear()
  }

  private registerGraphEvents(): void {
    this.graph.addEventListener('node-created', this.nodeCreatedListener)
    this.graph.addEventListener('node-removed', this.nodeRemovedListener)
    this.graph.addEventListener('node-layout-changed', this.nodeLayoutChangedListener)
    this.graph.addEventListener('edge-created', this.edgeCreatedListener)
    this.graph.addEventListener('edge-removed', this.edgeRemovedListener)
  }

  private sendMessage<TEvent>(
    evt: TEvent,
    createMessage: (evt: TEvent) => SynchronizeMessage
  ): void {
    if (!this.reentrantFlag) {
      this.messageHandler(createMessage(evt))
    }
  }

  private createNodeCreatedMessage = (evt: ItemEventArgs<INode>): NodeCreatedMessage => {
    const layout = evt.item.layout
    return {
      type: 'node-created',
      id: this.getId(evt.item),
      layout: [layout.x, layout.y, layout.width, layout.height]
    }
  }

  private createNodeRemovedMessage = (evt: ItemEventArgs<INode>): NodeRemovedMessage => {
    const id = this.getId(evt.item)
    this.item2Id.delete(evt.item)
    this.id2Item.delete(id)
    return { type: 'node-removed', id }
  }

  private createNodeLayoutChangedMessage = (node: INode): NodeLayoutChangedMessage => {
    const layout = node.layout
    return {
      type: 'node-layout-changed',
      id: this.getId(node),
      newLayout: [layout.x, layout.y, layout.width, layout.height]
    }
  }

  private createEdgeCreatedMessage = (evt: ItemEventArgs<IEdge>): EdgeCreatedMessage => {
    return {
      type: 'edge-created',
      id: this.getId(evt.item),
      sourceId: this.getId(evt.item.sourceNode),
      targetId: this.getId(evt.item.targetNode)
    }
  }

  private createEdgeRemovedMessage = (evt: ItemEventArgs<IEdge>): EdgeRemovedMessage => {
    const id = this.getId(evt.item)
    this.item2Id.delete(evt.item)
    this.id2Item.delete(id)
    return { type: 'edge-removed', id }
  }

  private handleMessage(message: SynchronizeMessage): void {
    switch (message.type) {
      case 'node-created':
        this.handleNodeCreated(message)
        break
      case 'node-removed':
        this.handleNodeRemoved(message)
        break
      case 'node-layout-changed':
        this.handleNodeLayoutChanged(message)
        break
      case 'edge-created':
        this.handleEdgeCreated(message)
        break
      case 'edge-removed':
        this.handleEdgeRemoved(message)
        break
    }
  }

  private handleNodeCreated(message: NodeCreatedMessage): void {
    const newNode = this.graph.createNode(message.layout)
    this.item2Id.set(newNode, message.id)
    this.id2Item.set(message.id, newNode)
    this.lastId = message.id
  }

  private handleNodeRemoved(message: NodeRemovedMessage): void {
    const item = this.getItem(message.id) as INode
    this.graph.remove(item)
  }

  private handleNodeLayoutChanged(message: NodeLayoutChangedMessage): void {
    const node = this.getItem(message.id) as INode
    if (node) {
      this.graph.setNodeLayout(node, Rect.from(message.newLayout))
    }
  }

  private handleEdgeCreated(message: EdgeCreatedMessage): void {
    const sourceNode = this.getItem(message.sourceId) as INode
    const targetNode = this.getItem(message.targetId) as INode
    const newEdge = this.graph.createEdge(sourceNode, targetNode)
    this.item2Id.set(newEdge, message.id)
    this.id2Item.set(message.id, newEdge)
    this.lastId = message.id
  }

  private handleEdgeRemoved(message: EdgeRemovedMessage): void {
    const item = this.getItem(message.id) as IEdge
    this.graph.remove(item)
  }
}
