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
import { ItemEventArgs, Rect } from '@yfiles/yfiles'
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
  graph
  messageHandler
  item2Id = new Map()
  id2Item = new Map()
  lastId = 0
  reentrantFlag = false
  nodeCreatedListener = (evt) => this.sendMessage(evt, this.createNodeCreatedMessage)
  nodeRemovedListener = (evt) => this.sendMessage(evt, this.createNodeRemovedMessage)
  nodeLayoutChangedListener = (evt) => this.sendMessage(evt, this.createNodeLayoutChangedMessage)
  edgeCreatedListener = (evt) => this.sendMessage(evt, this.createEdgeCreatedMessage)
  edgeRemovedListener = (evt) => this.sendMessage(evt, this.createEdgeRemovedMessage)
  /**
   * Creates a new instance of this class.
   * @param graph The graph to synchronize with another graph.
   * @param messageHandler A callback that is called when a change in this graph occurred. It is
   * a message that must be sent to the other {@link GraphSynchronizer} instance and passed to
   * {@link acceptMessage}.
   */
  constructor(graph, messageHandler) {
    this.graph = graph
    this.messageHandler = messageHandler
    this.registerGraphEvents()
  }
  /**
   * Accepts a message from another {@link GraphSynchronizer} instance
   * to reflect its changes on this graph.
   * @param message The message from the other instance's messageHandler.
   */
  acceptMessage(message) {
    this.reentrantFlag = true
    this.handleMessage(message)
    this.reentrantFlag = false
  }
  /**
   * Returns the id of an item. The id is used to identify an item across the graphs.
   */
  getId(item) {
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
  getItem(id) {
    const item = this.id2Item.get(id)
    if (!item) {
      throw new Error(`No item with id ${id}`)
    }
    return item
  }
  /**
   * Disposes this instance.
   */
  cleanUp() {
    this.graph.removeEventListener('node-created', this.nodeCreatedListener)
    this.graph.removeEventListener('node-removed', this.nodeRemovedListener)
    this.graph.removeEventListener('node-layout-changed', this.nodeLayoutChangedListener)
    this.graph.removeEventListener('edge-created', this.edgeCreatedListener)
    this.graph.removeEventListener('edge-removed', this.edgeRemovedListener)
    this.item2Id.clear()
    this.id2Item.clear()
  }
  registerGraphEvents() {
    this.graph.addEventListener('node-created', this.nodeCreatedListener)
    this.graph.addEventListener('node-removed', this.nodeRemovedListener)
    this.graph.addEventListener('node-layout-changed', this.nodeLayoutChangedListener)
    this.graph.addEventListener('edge-created', this.edgeCreatedListener)
    this.graph.addEventListener('edge-removed', this.edgeRemovedListener)
  }
  sendMessage(evt, createMessage) {
    if (!this.reentrantFlag) {
      this.messageHandler(createMessage(evt))
    }
  }
  createNodeCreatedMessage = (evt) => {
    const layout = evt.item.layout
    return {
      type: 'node-created',
      id: this.getId(evt.item),
      layout: [layout.x, layout.y, layout.width, layout.height]
    }
  }
  createNodeRemovedMessage = (evt) => {
    const id = this.getId(evt.item)
    this.item2Id.delete(evt.item)
    this.id2Item.delete(id)
    return {
      type: 'node-removed',
      id
    }
  }
  createNodeLayoutChangedMessage = (node) => {
    const layout = node.layout
    return {
      type: 'node-layout-changed',
      id: this.getId(node),
      newLayout: [layout.x, layout.y, layout.width, layout.height]
    }
  }
  createEdgeCreatedMessage = (evt) => {
    return {
      type: 'edge-created',
      id: this.getId(evt.item),
      sourceId: this.getId(evt.item.sourceNode),
      targetId: this.getId(evt.item.targetNode)
    }
  }
  createEdgeRemovedMessage = (evt) => {
    const id = this.getId(evt.item)
    this.item2Id.delete(evt.item)
    this.id2Item.delete(id)
    return {
      type: 'edge-removed',
      id
    }
  }
  handleMessage(message) {
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
  handleNodeCreated(message) {
    const newNode = this.graph.createNode(message.layout)
    this.item2Id.set(newNode, message.id)
    this.id2Item.set(message.id, newNode)
    this.lastId = message.id
  }
  handleNodeRemoved(message) {
    const item = this.getItem(message.id)
    this.graph.remove(item)
  }
  handleNodeLayoutChanged(message) {
    const node = this.getItem(message.id)
    this.graph.setNodeLayout(node, Rect.from(message.newLayout))
  }
  handleEdgeCreated(message) {
    const sourceNode = this.getItem(message.sourceId)
    const targetNode = this.getItem(message.targetId)
    const newEdge = this.graph.createEdge(sourceNode, targetNode)
    this.item2Id.set(newEdge, message.id)
    this.id2Item.set(message.id, newEdge)
    this.lastId = message.id
  }
  handleEdgeRemoved(message) {
    const item = this.getItem(message.id)
    this.graph.remove(item)
  }
}
