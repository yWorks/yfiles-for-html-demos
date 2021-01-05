/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EventArgs,
  GraphClipboard,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GraphModelManager,
  GroupingNodePositionHandler,
  GroupingSupport,
  HashMap,
  ICanvasObject,
  ICanvasObjectDescriptor,
  ICanvasObjectGroup,
  ICommand,
  IComparer,
  IEnumerable,
  IFoldingView,
  IGraph,
  IInputModeContext,
  IMap,
  IModelItem,
  INode,
  InputHandlerBase,
  InputModeEventArgs,
  IOutputHandler,
  IParseContext,
  IPositionHandler,
  ItemCopiedEventArgs,
  ItemEventArgs,
  ItemModelManager,
  IUndoUnit,
  IWriteContext,
  KeyScope,
  KeyType,
  LabelLayerPolicy,
  List,
  MoveInputMode,
  NodeEventArgs,
  OutputHandlerBase,
  Point,
  QueryInputHandlersEventArgs,
  QueryOutputHandlersEventArgs,
  WritePrecedence,
  YNumber
} from 'yfiles'

/**
 * An utility class to add z-order consistency for nodes to a {@link GraphComponent}.
 */
export class ZOrderSupport extends BaseClass(IComparer) {
  /**
   * @type {!GraphComponent}
   */
  get graphComponent() {
    return this.$graphComponent
  }

  /**
   * Creates a new instance and installs it on the given {@link ZOrderSupport#graphComponent}.
   * @param {!GraphComponent} graphComponent
   */
  constructor(graphComponent) {
    super()
    this.zOrderChangedListeners = []

    // initialize maps
    this.zOrders = new HashMap()
    this.tempZOrders = new HashMap()
    this.tempParents = new HashMap()

    // A flag indicating if nodes added to the master group should get a z-order assigned.
    this.addZOrderForNewNodes = true

    this.initializeGraphComponent(graphComponent, true)
  }

  /**
   * @param {!GraphComponent} graphComponent
   * @param {boolean} addInputMode
   */
  initializeGraphComponent(graphComponent, addInputMode) {
    this.$graphComponent = graphComponent
    this.foldingView = graphComponent.graph.foldingView
    this.masterGraph = this.foldingView.manager.masterGraph
    this.masterGroupingSupport = this.masterGraph.groupingSupport

    // use this ZOrderSupport as node comparer for the visualization
    graphComponent.graphModelManager = new ZOrderGraphModelManager(graphComponent, this)
    // keep labels at their owners for this demo
    graphComponent.graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER

    graphComponent.graph.decorator.nodeDecorator.positionHandlerDecorator.setFactory(node => {
      return new ZOrderNodePositionHandler(node, this, null)
    })

    if (addInputMode) {
      // use a custom edit mode to keep z-order consistent during grouping/folding/reparenting gestures
      graphComponent.inputMode = this.createZOrderGraphEditorInputMode()
    }

    // use a custom clipboard that transfers the relative z-order of copied/cut nodes
    graphComponent.clipboard = new ZOrderGraphClipboard(this)

    // listen for new nodes to assign an initial z-order
    this.masterGraph.addNodeCreatedListener(this.onNodeCreated.bind(this))
  }

  /**
   * @returns {!ZOrderGraphEditorInputMode}
   */
  createZOrderGraphEditorInputMode() {
    return new ZOrderGraphEditorInputMode(this)
  }

  /**
   * @param {!GraphMLIOHandler} ioHandler
   */
  configureZOrderGraphMLIOHandler(ioHandler) {
    let zOrderKeyDefinitionFound = false

    ioHandler.addQueryOutputHandlersListener((o, evt) => {
      if (evt.scope === KeyScope.NODE) {
        evt.addOutputHandler(new ZOrderOutputHandler(this))
      }
    })

    ioHandler.addQueryInputHandlersListener((o, evt) => {
      if (
        !evt.handled &&
        GraphMLIOHandler.matchesScope(evt.keyDefinition, KeyScope.NODE) &&
        GraphMLIOHandler.matchesName(evt.keyDefinition, ZOrderOutputHandler.Z_ORDER_KEY_NAME)
      ) {
        zOrderKeyDefinitionFound = true
        evt.addInputHandler(new ZOrderInputHandler(this))
        evt.handled = true
      }
    })

    ioHandler.addParsingListener((sender, evt) => {
      // clear old z-orders of old graph
      this.clear()
      this.addZOrderForNewNodes = false
      zOrderKeyDefinitionFound = false
    })

    ioHandler.addParsedListener((sender, evt) => {
      // enable automatic z-order creation for new nodes again
      this.addZOrderForNewNodes = true
      if (!zOrderKeyDefinitionFound) {
        // no z-orders were stored in the GraphML so initialize the nodes in the view
        this.setTempNormalizedZOrders(null)
        this.applyTempZOrders()
      }
    })
  }

  /**
   * @param {!INode} x
   * @param {!INode} y
   * @returns {number}
   */
  compare(x, y) {
    const masterX = this.getMasterNode(x)
    const masterY = this.getMasterNode(y)

    // the stored z-order is a partial order between children of the same parent
    const parentX = this.getParent(masterX)
    const parentY = this.getParent(masterY)
    if (parentX === parentY) {
      // for a common parent we can just compare the z-order values
      return this.zOrderOf(masterX) - this.zOrderOf(masterY)
    }
    // there is no common parent so find the ancestors that have a common parent
    const nca = this.masterGroupingSupport.getNearestCommonAncestor(masterX, masterY)
    const pathToRootX = this.masterGroupingSupport.getPathToRoot(masterX)
    const pathToRootY = this.masterGroupingSupport.getPathToRoot(masterY)

    const ancestorX = !nca ? pathToRootX.last() : pathToRootX.get(pathToRootX.indexOf(nca) - 1)
    const ancestorY = !nca ? pathToRootY.last() : pathToRootY.get(pathToRootY.indexOf(nca) - 1)
    // for these ancestors we can now compare the z-order values
    return this.zOrderOf(ancestorX) - this.zOrderOf(ancestorY)
  }

  /**
   * Gets the z-order value stored for <code>node</code>.
   * @param {!INode} node
   * @returns {number}
   */
  getZOrder(node) {
    return this.zOrderOf(this.getMasterNode(node))
  }

  /**
   * Sets the new z-order value stored for <code>key</code>.
   * An {@link IUndoUnit} for the changed z-order is added as well if undo is enabled.
   * @param {!INode} key
   * @param {number} newZOrder
   */
  setZOrder(key, newZOrder) {
    const master = this.getMasterNode(key)
    const oldZOrder = this.zOrders.get(master)
    if (oldZOrder !== newZOrder) {
      if (this.masterGraph.undoEngineEnabled) {
        this.masterGraph.addUndoUnit(
          'Undo z-Order Change',
          'Redo z-Order Change',
          () => {
            this.zOrders.set(master, oldZOrder)
            this.update(master)
          },
          () => {
            this.zOrders.set(master, newZOrder)
            this.update(master)
          }
        )
      }
      this.zOrders.set(master, newZOrder)
      this.onZIndexChanged(key, newZOrder, oldZOrder)
    }
  }

  /**
   * @param {!IModelItem} item
   * @param {number} newValue
   * @param {?number} oldValue
   */
  onZIndexChanged(item, newValue, oldValue) {
    const eventArgs = new ZIndexChangedEventArgs(item, newValue, oldValue)
    this.zOrderChangedListeners.forEach(listener => {
      listener(this, eventArgs)
    })
  }

  /**
   * @param {!function} listener
   */
  addZIndexChangedLister(listener) {
    this.zOrderChangedListeners.push(listener)
  }

  /**
   * @param {!function} listener
   */
  removeZIndexChangedLister(listener) {
    const index = this.zOrderChangedListeners.indexOf(listener)
    if (index > 0) {
      this.zOrderChangedListeners.splice(index, 1)
    }
  }

  /**
   * Arranges the <code>node</code> according to its {@link ZOrderSupport#getZOrder z-order}.
   * @param {!INode} node
   */
  update(node) {
    // the update call triggers a new installation of the node visualization that considers the z-order
    this.graphComponent.graphModelManager.update(this.getViewNode(node))
  }

  /**
   * Sets new ascending z-orders for <code>viewNodes</code> starting from <code>zOrder</code> and sorts their
   * {@link GraphModelManager#getMainCanvasObject canvas objects} as well.
   * @param {!IEnumerable.<INode>} viewNodes
   * @param {number} zOrder
   */
  arrangeNodes(viewNodes, zOrder) {
    let prev = null
    for (const node of viewNodes) {
      this.setZOrder(this.getMasterNode(node), zOrder++)
      const canvasObject = this.graphComponent.graphModelManager.getMainCanvasObject(node)
      if (!prev) {
        canvasObject.toBack()
      } else {
        canvasObject.above(prev)
      }
      prev = canvasObject
    }
  }

  /**
   * Sets a temporary z-order for <code>node</code> for a temporary <code>tempParent</code>.
   * @param {!INode} node
   * @param {?INode} tempParent
   * @param {number} newZOrder
   */
  setTempZOrder(node, tempParent, newZOrder) {
    const master = this.getMasterNode(node)
    const oldZOrder = this.getZOrder(master)
    if (oldZOrder !== newZOrder) {
      this.tempZOrders.set(master, newZOrder)
    }
    const masterParent = tempParent ? this.getMasterNode(tempParent) : this.foldingView.localRoot
    this.tempParents.set(master, masterParent)
  }

  /**
   * Sets normalized z-orders for all children of <code>parent</code> and recurses into child group nodes.
   * @param {?INode} parent
   */
  setTempNormalizedZOrders(parent) {
    const children = this.graphComponent.graph.getChildren(parent).toList()
    children.sort(this)
    let zOrder = 0
    for (const child of children) {
      this.setTempZOrder(child, parent, zOrder++)
      if (this.graphComponent.graph.isGroupNode(child)) {
        this.setTempNormalizedZOrders(child)
      }
    }
  }

  /**
   * Removes a temporary z-order for <code>node</code> that has been set previously via {@link ZOrderSupport#setTempZOrder}.
   * @param {!INode} node
   */
  removeTempZOrder(node) {
    const master = this.getMasterNode(node)
    this.tempZOrders.delete(master)
    this.tempParents.delete(master)
  }

  /**
   * Transfers all temporary z-orders that have been set previously via {@link ZOrderSupport#setTempZOrder}.
   */
  applyTempZOrders() {
    this.tempZOrders.forEach(keyValuePair => {
      this.setZOrder(keyValuePair.key, keyValuePair.value)
    })
    this.clearTempZOrders()
  }

  /**
   * Removes all temporary z-orders that has been set previously via {@link ZOrderSupport#setTempZOrder}.
   */
  clearTempZOrders() {
    this.tempZOrders.clear()
    this.tempParents.clear()
  }

  /**
   * @param {!List.<INode>} nodes
   */
  raise(nodes) {
    nodes.sort(this)

    let prev = null
    for (let i = nodes.size - 1; i >= 0; i--) {
      const node = nodes.get(i)
      const co = this.graphComponent.graphModelManager.getMainCanvasObject(node)
      const nextCO = co.nextSibling
      if (nextCO) {
        let tmp
        const nextNode =
          (tmp = this.graphComponent.graphModelManager.getModelItem(nextCO)) instanceof INode
            ? tmp
            : null
        if (nextNode && nextNode !== prev) {
          this.swapZOrder(node, nextNode)
          this.graphComponent.graphModelManager.update(node)
        }
      }
      prev = node
    }
  }

  /**
   * @param {!List.<INode>} nodes
   */
  lower(nodes) {
    nodes.sort(this)

    let prev = null
    for (const node of nodes) {
      const co = this.graphComponent.graphModelManager.getMainCanvasObject(node)
      const prevCO = co.previousSibling
      if (prevCO) {
        let tmp
        const prevNode =
          (tmp = this.graphComponent.graphModelManager.getModelItem(prevCO)) instanceof INode
            ? tmp
            : null
        if (prevNode && prevNode !== prev) {
          this.swapZOrder(node, prevNode)
          this.graphComponent.graphModelManager.update(node)
        }
      }
      prev = node
    }
  }

  /**
   * @param {!List.<INode>} nodes
   */
  toFront(nodes) {
    for (const grouping of nodes.groupBy(
      node => this.graphComponent.graph.getParent(node),
      (type, elements) => ({
        groupNode: type,
        children: elements ? elements.toList() : new List()
      })
    )) {
      const groupNode = grouping.groupNode
      const toFrontChildren = grouping.children
      const allChildren = this.graphComponent.graph.getChildren(groupNode).toList()
      if (toFrontChildren.size < allChildren.size) {
        allChildren.sort(this)
        toFrontChildren.sort(this)
        allChildren.removeAll(node => {
          return toFrontChildren.includes(node)
        })
        const last = allChildren.last()
        let zOrder = this.getZOrder(last) + 1
        for (const node of toFrontChildren) {
          this.setZOrder(node, zOrder++)
          this.update(node)
        }
      }
    }
  }

  /**
   * @param {!List.<INode>} nodes
   */
  toBack(nodes) {
    for (const grouping of nodes.groupBy(
      node => this.graphComponent.graph.getParent(node),
      (type, elements) => ({
        groupNode: type,
        children: elements ? elements.toList() : new List()
      })
    )) {
      const groupNode = grouping.groupNode
      const toBackChildren = grouping.children
      const allChildren = this.graphComponent.graph.getChildren(groupNode).toList()
      if (toBackChildren.size < allChildren.size) {
        allChildren.sort(this)
        toBackChildren.sort(this)
        allChildren.removeAll(node => {
          return toBackChildren.includes(node)
        })
        const first = allChildren.get(0)
        let zOrder = this.getZOrder(first) - 1

        for (let i = toBackChildren.size - 1; i >= 0; i--) {
          const node = toBackChildren.get(i)
          this.setZOrder(node, zOrder--)
          this.update(node)
        }
      }
    }
  }

  /**
   * @param {!object} sender
   * @param {!ItemEventArgs.<INode>} evt
   */
  onNodeCreated(sender, evt) {
    const undoEngine = this.graphComponent.graph.undoEngine
    if (!this.addZOrderForNewNodes || undoEngine.performingUndo || undoEngine.performingRedo) {
      // don't assign z-orders during undo/redo automatically
      return
    }
    const newNode = evt.item
    const parent = this.getParent(newNode)
    const newZOrder = this.masterGraph
      .getChildren(parent)
      .map(this.getZOrder.bind(this))
      .reduce((acc, current) => Math.max(acc, current + 1), Number.MIN_VALUE)
    this.zOrders.set(newNode, newZOrder)
    this.update(newNode)
  }

  clear() {
    this.zOrders.clear()
    this.tempZOrders.clear()
    this.tempParents.clear()
  }

  /**
   * Returns the master item of <code>node</code> if folding is enabled and <code>node</code> itself otherwise.
   * @param {!INode} node
   * @returns {!INode}
   */
  getMasterNode(node) {
    const foldingView = this.graphComponent.graph.foldingView
    if (foldingView) {
      if (foldingView.manager.masterGraph.contains(node)) {
        // node already part of the master graph
        return node
      } else {
        // return master of node
        return foldingView.getMasterItem(node)
      }
    }
    // no folding enabled
    return node
  }

  /**
   * Returns the view item of <code>node</code> if folding is enabled and <code>node</code> itself otherwise.
   * @param {!INode} node
   * @returns {?INode}
   */
  getViewNode(node) {
    if (this.graphComponent.graph.contains(node)) {
      // node is already a view node
      return node
    }
    const foldingView = this.graphComponent.graph.foldingView
    if (foldingView && foldingView.manager.masterGraph.contains(node)) {
      // return the view node of node
      return foldingView.getViewItem(node)
    }
    return null
  }

  /**
   * @param {!INode} masterNode
   * @returns {?INode}
   */
  getParent(masterNode) {
    const parent = this.tempParents.get(masterNode)
    if (parent) {
      // temporary parent has precedence over structural parent
      return parent
    }
    return this.masterGraph.getParent(masterNode)
  }

  /**
   * @param {!INode} node
   * @returns {number}
   */
  zOrderOf(node) {
    let zOrder = this.tempZOrders.get(node)
    if (zOrder) {
      // temporary z-order has precedence over basic z-order
      return zOrder
    }
    zOrder = this.zOrders.get(node)
    if (zOrder) {
      return zOrder
    }
    return 0
  }

  /**
   * @param {!INode} node1
   * @param {!INode} node2
   */
  swapZOrder(node1, node2) {
    const zOrder1 = this.getZOrder(node1)
    const zOrder2 = this.getZOrder(node2)
    this.setZOrder(node1, zOrder2)
    this.setZOrder(node2, zOrder1)
  }
}

export class ZIndexChangedEventArgs extends EventArgs {
  /**
   * @param {!IModelItem} item
   * @param {number} newZIndex
   * @param {?number} oldZIndex
   */
  constructor(item, newZIndex, oldZIndex) {
    super()
    this.$item = item
    this.$newZIndex = newZIndex
    this.$oldZIndex = oldZIndex
  }

  /**
   * @type {!IModelItem}
   */
  get item() {
    return this.$item
  }

  /**
   * @type {number}
   */
  get newZIndex() {
    return this.$newZIndex
  }

  /**
   * @type {?number}
   */
  get oldZIndex() {
    return this.$oldZIndex
  }
}

/**
 * An {@link IPositionHandler} for nodes that tries to keep the z-order of its moved node relative to other moved nodes.
 * As the z-order doesn't change for normal move gestures, this class customizes only interactive reparent gestures.
 */
export class ZOrderNodePositionHandler extends GroupingNodePositionHandler {
  /**
   * @param {!INode} node
   * @param {!ZOrderSupport} zOrderSupport
   * @param {?IPositionHandler} [wrappedHandler=null]
   */
  constructor(node, zOrderSupport, wrappedHandler = null) {
    super(node, wrappedHandler)
    this.$node = node

    this.$ZOrderSupport = zOrderSupport
    this.$initialParent = null
    this.$currentParent = null
  }

  /**
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    const graph = context.graph

    // store initial parent of the node...
    this.$initialParent = graph.getParent(this.$node)
    this.$currentParent = this.$initialParent

    super.initializeDrag(context)
  }

  /**
   * Customizes the temporary new parent of <code>node</code> and its z-order in its new {@link ICanvasObjectGroup}
   * @param {!IInputModeContext} context
   * @param {!INode} node
   * @param {!INode} parent
   */
  setCurrentParent(context, node, parent) {
    if (parent !== this.$initialParent) {
      let tmp
      // node is temporarily at a new parent
      const moveInputMode =
        (tmp = context.parentInputMode) instanceof ZOrderMoveInputMode ? tmp : null
      if (moveInputMode) {
        // the ZOrderMoveInputMode knows all moved nodes and therefore can provide the new z-order for this node
        const tempZOrder = moveInputMode.getZOrderForNewParent(node, parent)
        // 'parent' is only a temporary new parent so the old z-order should be kept but a new temporary one is set
        this.$ZOrderSupport.setTempZOrder(node, parent, tempZOrder)
      }
      super.setCurrentParent(context, node, parent)
    } else if (parent !== this.$currentParent) {
      // node is reset to its initial parent: reset its temporary z-order so the original one is used again
      this.$ZOrderSupport.removeTempZOrder(node)

      super.setCurrentParent(context, node, parent)
    }
    this.$currentParent = parent
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    super.dragFinished(context, originalLocation, newLocation)
    this.cleanUp()
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    super.cancelDrag(context, originalLocation)
    this.cleanUp()
  }

  cleanUp() {
    this.$initialParent = null
    this.$currentParent = null
  }
}

/**
 * A {@link GraphModelManager} using {@link ZOrderGraphModelManager#zOrderSupport} as {@link ItemModelManager#comparer}
 * for nodes.
 */
export class ZOrderGraphModelManager extends GraphModelManager {
  /**
   * @param {!GraphComponent} graphComponent
   * @param {!ZOrderSupport} zOrderSupport
   */
  constructor(graphComponent, zOrderSupport) {
    super(graphComponent, graphComponent.contentGroup)
    this.zOrderSupport = zOrderSupport
    // The ItemModelManager.Comparer needs the user objects to be accessible from the main canvas objects
    this.provideUserObjectOnMainCanvasObject = true
  }

  /**
   * @param {!ICanvasObjectDescriptor} descriptor
   * @param {!function} callback
   * @returns {!ItemModelManager.<INode>}
   */
  createNodeModelManager(descriptor, callback) {
    const nodeModelManager = super.createNodeModelManager(descriptor, callback)
    nodeModelManager.comparer = this.zOrderSupport
    return nodeModelManager
  }
}

/**
 * An {@link IInputHandler} that reads the z-order of nodes, edges and ports.
 */
class ZOrderInputHandler extends InputHandlerBase {
  /**
   * @param {!ZOrderSupport} zOrderSupport
   */
  constructor(zOrderSupport) {
    super(INode.$class, YNumber.$class)
    this.zOrderSupport = zOrderSupport
  }

  /**
   * @param {!IParseContext} context
   * @param {!Node} node
   * @returns {number}
   */
  parseDataCore(context, node) {
    return Number.parseInt(node.textContent)
  }

  /**
   * @param {!IParseContext} context
   * @param {!INode} key
   * @param {number} data
   */
  setValue(context, key, data) {
    if (this.zOrderSupport) {
      this.zOrderSupport.setZOrder(key, data)
      this.zOrderSupport.update(key)
    }
  }
}

/**
 * An {@link IOutputHandler} that writes the z-order of nodes, edges and ports.
 */
class ZOrderOutputHandler extends OutputHandlerBase {
  /**
   * @type {!string}
   */
  static get Z_ORDER_KEY_NAME() {
    return 'zOrder'
  }

  /**
   * The namespace URI for z-order extensions to GraphML.
   * This field has the constant value <code>http://www.yworks.com/xml/yfiles-bpmn/1.0</code>
   * @type {!string}
   */
  static get Z_ORDER_N_S() {
    return 'http://www.yworks.com/xml/yfiles-z-order/1.0'
  }

  /**
   * @param {!ZOrderSupport} zOrderSupport
   */
  constructor(zOrderSupport) {
    super(
      INode.$class,
      YNumber.$class,
      KeyScope.NODE,
      ZOrderOutputHandler.Z_ORDER_KEY_NAME,
      KeyType.INT
    )
    this.zOrderSupport = zOrderSupport
    this.writeKeyDefault = false
    this.precedence = WritePrecedence.BEFORE_CHILDREN
    this.setKeyDefinitionUri(
      ZOrderOutputHandler.Z_ORDER_N_S + '/' + ZOrderOutputHandler.Z_ORDER_KEY_NAME
    )
  }

  /**
   * @param {!IWriteContext} context
   * @param {number} data
   */
  writeValueCore(context, data) {
    context.writer.writeString(data.toString())
  }

  /**
   * @param {!IWriteContext} context
   * @param {!INode} key
   * @returns {number}
   */
  getValue(context, key) {
    if (this.zOrderSupport) {
      return this.zOrderSupport.getZOrder(key)
    }
    return 0
  }
}

/**
 * A {@link GraphEditorInputMode} that tries to keep the relative z-order of nodes during grouping related gestures.
 */
export class ZOrderGraphEditorInputMode extends GraphEditorInputMode {
  /** @type {ICommand} */
  static get RAISE() {
    return ZOrderGraphEditorInputMode.$RAISE
  }

  /** @type {ICommand} */
  static set RAISE(RAISE) {
    ZOrderGraphEditorInputMode.$RAISE = RAISE
  }

  /** @type {ICommand} */
  static get LOWER() {
    return ZOrderGraphEditorInputMode.$LOWER
  }

  /** @type {ICommand} */
  static set LOWER(LOWER) {
    ZOrderGraphEditorInputMode.$LOWER = LOWER
  }

  /** @type {ICommand} */
  static get TO_FRONT() {
    return ZOrderGraphEditorInputMode.$TO_FRONT
  }

  /** @type {ICommand} */
  static set TO_FRONT(TO_FRONT) {
    ZOrderGraphEditorInputMode.$TO_FRONT = TO_FRONT
  }

  /** @type {ICommand} */
  static get TO_BACK() {
    return ZOrderGraphEditorInputMode.$TO_BACK
  }

  /** @type {ICommand} */
  static set TO_BACK(TO_BACK) {
    ZOrderGraphEditorInputMode.$TO_BACK = TO_BACK
  }

  /**
   * @param {!ZOrderSupport} zOrderSupport
   */
  constructor(zOrderSupport) {
    super()

    this.zOrderSupport = zOrderSupport
    this.newParents = null

    this.addCommandBinding(
      ZOrderGraphEditorInputMode.RAISE,
      zOrderSupport.raise.bind(zOrderSupport)
    )
    this.addCommandBinding(
      ZOrderGraphEditorInputMode.LOWER,
      zOrderSupport.lower.bind(zOrderSupport)
    )
    this.addCommandBinding(
      ZOrderGraphEditorInputMode.TO_FRONT,
      zOrderSupport.toFront.bind(zOrderSupport)
    )
    this.addCommandBinding(
      ZOrderGraphEditorInputMode.TO_BACK,
      zOrderSupport.toBack.bind(zOrderSupport)
    )
  }

  /**
   * @param {!ICommand} newCommand
   * @param {!function} method
   */
  addCommandBinding(newCommand, method) {
    this.keyboardInputMode.addCommandBinding(
      newCommand,
      (command, parameter, sender) => {
        const nodes = this.resolveParameter(parameter)
        if (nodes !== null) {
          method(nodes)
          return true
        }
        return false
      },
      (command, parameter, sender) => {
        const nodes = this.resolveParameter(parameter)
        return nodes !== null
      }
    )
  }

  /**
   * @param {!object} parameter
   * @returns {?List.<INode>}
   */
  resolveParameter(parameter) {
    if (!parameter) {
      if (this.graphComponent.selection.selectedNodes.size > 0) {
        return this.graphComponent.selection.selectedNodes.toList()
      }
    } else if (parameter instanceof IModelItem) {
      const nodes = new List()
      if (parameter instanceof INode) {
        nodes.add(parameter)
      }
      return nodes
    } else if (parameter instanceof IEnumerable) {
      const nodes = parameter.filter(para => para instanceof INode).toList()
      return nodes.size > 0 ? nodes : null
    }
    return null
  }

  ungroupSelection() {
    // store all selected nodes that have a parent group
    const nodes = this.graphSelection.selectedNodes
      .filter(node => {
        return this.graph.getParent(node) !== null
      })
      .toList()

    // sort selected nodes by their current z-order
    nodes.sort(this.zOrderSupport)

    // collect top level nodes
    const topLevelNodes = this.graph.getChildren(null).toList()
    topLevelNodes.sort(this.zOrderSupport)

    const newTopLevelNodes = new List()
    let topLevelIndex = 0

    let nextTopLevelNode = null
    const gs = this.graph.groupingSupport

    for (const node of nodes) {
      const topLevelAncestor = gs.getPathToRoot(node).last()
      while (topLevelAncestor !== nextTopLevelNode) {
        nextTopLevelNode = topLevelNodes.get(topLevelIndex++)
        newTopLevelNodes.add(nextTopLevelNode)
      }
      newTopLevelNodes.add(node)
    }

    for (let i = topLevelIndex; i < topLevelNodes.size; i++) {
      newTopLevelNodes.add(topLevelNodes.get(i))
    }

    for (let i = 0; i < newTopLevelNodes.size; i++) {
      this.zOrderSupport.setZOrder(newTopLevelNodes.get(i), i)
    }

    super.ungroupSelection()
  }

  /**
   * @returns {?INode}
   */
  groupSelection() {
    // get all selected nodes and sort by their current z-order
    const nodes = this.graphSelection.selectedNodes.toList()
    nodes.sort(this.zOrderSupport)

    // set increasing z-orders
    for (let i = 0; i < nodes.size; i++) {
      this.zOrderSupport.setZOrder(nodes.get(i), i)
    }
    return super.groupSelection()
  }

  /**
   * @returns {!MoveInputMode}
   */
  createMoveInputMode() {
    const zOrderMoveInputMode = new ZOrderMoveInputMode(this, this.zOrderSupport)
    zOrderMoveInputMode.priority = 40
    zOrderMoveInputMode.snapContext = this.snapContext
    return zOrderMoveInputMode
  }

  deleteSelection() {
    // collect absolute order of all view items
    const nodes = this.graph.nodes.toList()
    nodes.sort(this.zOrderSupport)
    const absOrder = new Map()
    for (let i = 0; i < nodes.size; i++) {
      absOrder.set(nodes.get(i), i)
    }
    // collect new parents in ParentChanged events
    this.newParents = new Set()
    // before the group node is removed, all its children get reparented so we listen for each ParentChanged event.
    const parentChangedListener = this.onParentChanged.bind(this)
    this.graph.addParentChangedListener(parentChangedListener)
    super.deleteSelection()
    this.graph.removeParentChangedListener(parentChangedListener)

    // for each new parent sort their children in previously stored absolute order
    for (const newParent of this.newParents) {
      if (newParent === null || this.graph.contains(newParent)) {
        // newParent hasn't been removed as well, so sort its children
        const children = this.graph.getChildren(newParent).toList()
        children.sort((node1, node2) => {
          return absOrder.get(node1) - absOrder.get(node2)
        })
        this.zOrderSupport.arrangeNodes(children, 0)
      }
    }
    this.newParents = null
  }

  /**
   * @param {!object} sender
   * @param {!NodeEventArgs} evt
   */
  onParentChanged(sender, evt) {
    const newParent = this.graph.getParent(evt.item)
    this.newParents.add(newParent)
  }

  /**
   * @param {!NodeEventArgs} evt
   */
  onNodeReparented(evt) {
    super.onNodeReparented(evt)
    const node = evt.item
    const zIndex = this.calculateNewZIndex(node, this.graph.getParent(node))
    this.zOrderSupport.setZOrder(node, zIndex)
    this.graphComponent.graphModelManager.update(node)
  }

  /**
   * @param {!INode} node
   * @param {?INode} parent
   * @returns {number}
   */
  calculateNewZIndex(node, parent) {
    const children = this.graph.getChildren(parent)
    if (children.size === 1) {
      // node is the only child
      return 0
    }
    // increment the maximum z-index of all children by 1 to add node last
    return (
      children.reduce(
        (acc, current) =>
          current !== node ? Math.max(acc, this.zOrderSupport.getZOrder(current)) : acc,
        Number.MIN_VALUE
      ) + 1
    )
  }
}

ZOrderGraphEditorInputMode.RAISE = ICommand.createCommand('Raise')
ZOrderGraphEditorInputMode.LOWER = ICommand.createCommand('Lower')
ZOrderGraphEditorInputMode.TO_FRONT = ICommand.createCommand('ToFront')
ZOrderGraphEditorInputMode.TO_BACK = ICommand.createCommand('ToBack')

/**
 * A {@link MoveInputMode} that customizes reparent gestures to keep the relative z-order of reparented nodes.
 */
export class ZOrderMoveInputMode extends MoveInputMode {
  /**
   * @param {!GraphEditorInputMode} geim
   * @param {!ZOrderSupport} zOrderSupport
   */
  constructor(geim, zOrderSupport) {
    super()
    // The parent input mode providing the GraphSelection used to determine the moved nodes
    this.geim = geim
    this.zOrderSupport = zOrderSupport
    // The graph and ZOrderSupport used for the active move gesture
    this.graph = null
    // Moved nodes that might get reparented.
    this.movedNodes = null
    // A mapping from moved nodes to their original parents
    this.oldParents = new Map()
    // the maximum z-order of the children of a group node
    this.maxOldZOrder = new Map()
    // the maximum z-order of top-level nodes
    this.maxRootZOrder = Number.MIN_VALUE
  }

  /**
   * Stores all moved nodes, their parents and the maximum z-order of children of their parents before the move gesture
   * starts.
   * @param {!InputModeEventArgs} evt
   */
  onDragStarting(evt) {
    super.onDragStarting(evt)

    this.graph = evt.context.graph

    // store all selected nodes which might get reparented
    this.movedNodes = this.geim.graphSelection.selectedNodes.toList()
    // sort this list by their relative z-order
    this.movedNodes.sort(this.zOrderSupport)

    // calculate max z-order for all group nodes containing any moved node
    this.movedNodes.forEach(node => {
      const parent = this.graph.getParent(node)
      this.oldParents.set(node, parent)
      this.getOrCalculateMaxZOrder(parent)
    })
    // calculate max z-order of top-level nodes
    this.getOrCalculateMaxZOrder(null)
  }

  /**
   * Returns the maximum z-order of the children of <code>parent</code>.
   * If the maximum z-order isn't stored, yet, it is calculated first.
   * @param {?INode} parent
   * @returns {number}
   */
  getOrCalculateMaxZOrder(parent) {
    if (!parent) {
      // top-level nodes
      if (this.maxRootZOrder === Number.MIN_VALUE) {
        this.maxRootZOrder = this.graph
          .getChildren(null)
          .map(node => {
            return this.zOrderSupport.getZOrder(node)
          })
          .reduce((acc, current) => Math.max(acc, current), Number.MIN_VALUE)
      }
      return this.maxRootZOrder
    }
    let maxZOrder = this.maxOldZOrder.get(parent)
    if (!maxZOrder) {
      const children = this.graph.getChildren(parent)
      maxZOrder =
        children.size > 0
          ? children.reduce(
              (acc, current) => Math.max(acc, this.zOrderSupport.getZOrder(current)),
              Number.MIN_VALUE
            )
          : 0
      this.maxOldZOrder.set(parent, maxZOrder)
    }
    return maxZOrder
  }

  /**
   * Returns a new z-order for <code>node</code> in its new <code>parent</code>.
   * As all MovedNodes will be reparented to the same parent, those nodes that had this parent initially will keep their
   * old z-order. Therefore the new z-order can be calculated by adding the old max z-order of parent's children to the
   * number of nodes in MovedNodes that were below node and would be reparented as well.
   * @param {!INode} node
   * @param {?INode} parent
   * @returns {number}
   */
  getZOrderForNewParent(node, parent) {
    // start the new z-order one after the old children's maximum
    let newZOrder = this.getOrCalculateMaxZOrder(parent) + 1
    for (const movedNode of this.movedNodes) {
      if (movedNode === node) {
        return newZOrder
      }
      if (this.oldParents.get(movedNode) !== parent) {
        // movedNode would be reparented and was below node, so increase the z-order
        return newZOrder++
      }
    }
    return 0
  }

  /**
   * @param {!InputModeEventArgs} evt
   */
  onDragFinished(evt) {
    super.onDragFinished(evt)

    // Apply the temporary z-orders for all reparented nodes
    this.zOrderSupport.applyTempZOrders()
    this.cleanup()
  }

  /**
   * @param {!InputModeEventArgs} evt
   */
  onDragCanceled(evt) {
    super.onDragCanceled(evt)

    // clear temporary z-orders and keep the original ones.
    this.zOrderSupport.clearTempZOrders()
    this.cleanup()
  }

  cleanup() {
    this.movedNodes = null
    this.oldParents.clear()
    this.maxOldZOrder.clear()
    this.maxRootZOrder = Number.MIN_VALUE
    this.graph = null
  }
}

/**
 * A {@link GraphClipboard} that keeps the relative z-order between cut/copied/duplicated nodes when pasting/inserting
 * them to the graph again.
 */
export class ZOrderGraphClipboard extends GraphClipboard {
  /**
   * @param {!ZOrderSupport} support
   */
  constructor(support) {
    super()
    this.support = support

    // initialize fields
    this.zOrders = new HashMap()
    this.newItems = new List()

    // copy z-order to item copied to clipboard
    this.toClipboardCopier.addNodeCopiedListener(this.onCopiedToClipboard.bind(this))

    // copy z-order to item copied to graph and collect those copied items
    this.fromClipboardCopier.addNodeCopiedListener(this.onCopiedFromClipboard.bind(this))
    this.duplicateCopier.addNodeCopiedListener(this.onCopiedFromClipboard.bind(this))
  }

  /**
   * @param {!object} sender
   * @param {!ItemCopiedEventArgs.<INode>} evt
   */
  onCopiedToClipboard(sender, evt) {
    // transfer relative z-order from original node to the copy in the clipboard graph
    this.zOrders.set(evt.copy, this.getZOrder(evt.original))
  }

  /**
   * @param {!object} sender
   * @param {!ItemCopiedEventArgs.<INode>} evt
   */
  onCopiedFromClipboard(sender, evt) {
    // store new node to use in ArrangeItems
    this.newItems.add(evt.copy)
    // transfer relative z-order from node in the clipboard graph to the new node
    this.zOrders.set(evt.copy, this.getZOrder(evt.original))
  }

  /**
   * Returns the z-order previously stored for the <code>node</code>.
   * The z-order stored in the {@link ZOrderSupport} is used as fallback for items currently not in the view.
   * @param {!INode} node
   * @returns {number}
   */
  getZOrder(node) {
    const zOrder = this.zOrders.get(node)
    return zOrder != null ? zOrder : this.support.getZOrder(node)
  }

  /**
   * @param {!IGraph} sourceGraph
   * @param {!function} filter
   */
  cut(sourceGraph, filter) {
    // store the relative z-order for cut items
    this.storeInitialZOrder(sourceGraph, filter)
    super.cut(sourceGraph, filter)
  }

  /**
   * @param {!IGraph} sourceGraph
   * @param {!function} filter
   */
  copy(sourceGraph, filter) {
    // store the relative z-order for copied items
    this.storeInitialZOrder(sourceGraph, filter)
    super.copy(sourceGraph, filter)
  }

  /**
   * @param {!(IGraph|object)} targetGraph
   * @param {?function} [filter]
   * @param {?function} [elementPasted]
   * @param {?function} [targetFilter]
   * @param {?IInputModeContext} [context]
   */
  paste(targetGraph, filter, elementPasted, targetFilter, context) {
    if (!(targetGraph instanceof IGraph)) {
      const object = targetGraph
      targetGraph = object.targetGraph
      filter = object.filter
      elementPasted = object.elementPasted
      targetFilter = object.targetFilter
      context = object.context
    }

    // collect new items in the onCopiedFromClipboard callbacks
    this.newItems.clear()
    super.paste(targetGraph, filter, elementPasted, targetFilter, context)

    // set final z-orders of newItems depending on their new parent group
    this.arrangeItems(this.newItems, targetGraph.foldingView)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!IGraph} sourceGraph
   * @param {!function} filter
   * @param {!function} elementDuplicated
   */
  duplicate(context, sourceGraph, filter, elementDuplicated) {
    // store the relative z-order for duplicated items
    this.storeInitialZOrder(sourceGraph, filter)
    // collect new items in the onCopiedFromClipboard callbacks
    this.newItems.clear()
    super.duplicate(context, sourceGraph, filter, elementDuplicated)

    // set final z-orders of newItems depending on their new parent group
    this.arrangeItems(this.newItems, sourceGraph.foldingView)
  }

  /**
   * @param {!IGraph} sourceGraph
   * @param {!function} filter
   */
  storeInitialZOrder(sourceGraph, filter) {
    // determine the view items involved in the clipboard operation and sort them by their visual z-order
    const items = sourceGraph.nodes.filter(node => filter(node)).toList()
    if (items.size > 1) {
      items.sort(this.support)
    }
    this.zOrders.clear()
    const foldingView = sourceGraph.foldingView
    for (let i = 0; i < items.size; i++) {
      // in case of folding store relative z-order for master item as it will be used by the GraphCopier
      const item = foldingView ? foldingView.getMasterItem(items.get(i)) : items.get(i)
      this.zOrders.set(item, i)
    }
  }

  /**
   * @param {!List.<INode>} newMasterItems
   * @param {!IFoldingView} foldingView
   */
  arrangeItems(newMasterItems, foldingView) {
    // sort new items by the relative z-order transferred in onCopiedFromClipboard
    newMasterItems.sort((node1, node2) => {
      return this.getZOrder(node1) - this.getZOrder(node2)
    })
    const gmm = this.support.graphComponent.graphModelManager

    // group new nodes by common parent canvas object groups of their main canvas objects
    const itemsNotInView = new List()
    const groupToItems = new HashMap()
    for (const masterItem of newMasterItems) {
      const viewItem = foldingView ? foldingView.getViewItem(masterItem) : masterItem
      if (!viewItem) {
        // new item is not in view (e.g. child of a collapsed folder node)
        itemsNotInView.add(masterItem)
      } else {
        const co = gmm.getMainCanvasObject(viewItem)
        if (!co) {
          itemsNotInView.add(masterItem)
        } else {
          const coGroup = co.group
          let newNodesInGroup = groupToItems.get(coGroup)
          if (!newNodesInGroup) {
            newNodesInGroup = new List()
            groupToItems.set(coGroup, newNodesInGroup)
          }
          newNodesInGroup.add(viewItem)
        }
      }
    }
    // set z-order items not in view just in ascending order
    for (let i = 0; i < itemsNotInView.size; i++) {
      this.support.setZOrder(itemsNotInView.get(i), i)
    }

    // for each common parent set ascending z-orders for new nodes
    for (const groupItemsPair of groupToItems) {
      const itemsInGroup = groupItemsPair.value

      // find the top-most node that wasn't just added and lookup its z-order
      let topNodeNotJustAdded = null
      let walker = groupItemsPair.key.lastChild
      while (walker) {
        let tmp
        const node = (tmp = gmm.getModelItem(walker)) instanceof INode ? tmp : null
        if (node && !itemsInGroup.includes(node)) {
          topNodeNotJustAdded = node
          break
        }
        walker = walker.previousSibling
      }
      let nextZOrder = topNodeNotJustAdded ? this.getZOrder(topNodeNotJustAdded) + 1 : 0

      // set new z-orders starting from nextZOrder
      for (const node of itemsInGroup) {
        this.support.setZOrder(node, nextZOrder++)
      }
      // update the view using the new z-orders
      for (const node of itemsInGroup) {
        this.support.update(node)
      }
    }
  }
}
