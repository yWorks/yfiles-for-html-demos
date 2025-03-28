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
  BaseClass,
  Command,
  EventArgs,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GroupingNodePositionHandler,
  GroupingSupport,
  HashMap,
  IEnumerable,
  IFoldingView,
  IGraph,
  IGraphSelection,
  IInputModeContext,
  IMap,
  IModelItem,
  INode,
  InputHandlerBase,
  InputModeEventArgs,
  IOutputHandler,
  IParseContext,
  IPositionHandler,
  IRenderTreeElement,
  IRenderTreeGroup,
  IReparentNodeHandler,
  ItemEventArgs,
  ItemsEventArgs,
  IUndoUnit,
  IWriteContext,
  KeyScope,
  KeyType,
  LabelLayerPolicy,
  List,
  NodeEventArgs,
  OutputHandlerBase,
  Point,
  SelectionEventArgs,
  WritePrecedence
} from '@yfiles/yfiles'
import { ZOrderGraphClipboard } from './ZOrderGraphClipboard'

type Comparator<T> = (x: T | null, y: T | null) => number

/**
 * An utility class to add z-order consistency for nodes to a {@link GraphComponent}.
 */
export class ZOrderSupport {
  get masterGraph(): IGraph {
    return this.$masterGraph
  }

  private readonly tempZOrders: IMap<INode, number>
  private readonly zOrderChangedListeners: Array<
    (sender: object, eventArgs: ZIndexChangedEventArgs) => void
  >
  public readonly nodeComparison: Comparator<INode>

  private $graphComponent: GraphComponent = null!
  private $masterGraph: IGraph = null!
  private foldingView: IFoldingView | null = null
  private masterGroupingSupport: GroupingSupport = null!
  private zOrders: IMap<INode, number>
  private tempParents: IMap<INode, INode>

  /**
   * A flag indicating if nodes added to the master group should get a z-order assigned.
   */
  public addZOrderForNewNodes = false

  public get graphComponent(): GraphComponent {
    return this.$graphComponent
  }

  /**
   * Creates a new instance and installs it on the given {@link ZOrderSupport.graphComponent}.
   */
  constructor(graphComponent: GraphComponent) {
    this.zOrderChangedListeners = []
    this.nodeComparison = (x, y) => this.compare(x!, y!)

    // initialize maps
    this.zOrders = new HashMap<INode, number>()
    this.tempZOrders = new HashMap<INode, number>()
    this.tempParents = new HashMap<INode, INode>()

    this.addZOrderForNewNodes = true

    this.initializeGraphComponent(graphComponent, true)
  }

  public initializeGraphComponent(graphComponent: GraphComponent, addInputMode: boolean): void {
    this.$graphComponent = graphComponent
    this.foldingView = graphComponent.graph.foldingView
    this.$masterGraph =
      this.foldingView != null ? this.foldingView.manager.masterGraph : graphComponent.graph
    this.masterGroupingSupport = this.masterGraph.groupingSupport

    // use this ZOrderSupport as node comparer for the visualization
    this.$graphComponent.graphModelManager.nodeManager.comparator = this.nodeComparison
    // The ItemModelManager.Comparer needs the user objects to be accessible from the main render tree elements
    this.$graphComponent.graphModelManager.provideRenderTagOnMainRenderTreeElement = true
    // keep labels at their owners for this demo
    graphComponent.graphModelManager.nodeLabelLayerPolicy = LabelLayerPolicy.AT_OWNER

    graphComponent.graph.decorator.nodes.positionHandler.addFactory((node: INode) => {
      return new ZOrderNodePositionHandler(node, this)
    })

    if (addInputMode) {
      // configure the edit mode to keep z-order consistent during grouping/folding/reparenting gestures
      const geim = new GraphEditorInputMode()
      this.configureInputMode(geim)
      graphComponent.inputMode = geim
    }

    // configure the clipboard that transfers the relative z-order of copied/cut nodes
    this.configureGraphClipboard()

    // listen for new nodes to assign an initial z-order
    this.masterGraph.addEventListener('node-created', this.onNodeCreated.bind(this))
  }

  public configureGraphMLIOHandler(ioHandler: GraphMLIOHandler): void {
    let zOrderKeyDefinitionFound = false
    let maxExistingZOrder = Number.MIN_VALUE

    ioHandler.addEventListener('query-output-handlers', (evt) => {
      if (evt.scope === KeyScope.NODE) {
        evt.addOutputHandler(new ZOrderOutputHandler(this))
      }
    })

    ioHandler.addEventListener('query-input-handlers', (evt) => {
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

    ioHandler.addEventListener('parsing', () => {
      // clear old z-orders of old graph
      if (ioHandler.clearGraphBeforeRead) {
        this.clear()
      } else {
        maxExistingZOrder = this.getOrCalculateMaxZOrder(null)
        this.clearTempZOrders()
      }
      this.addZOrderForNewNodes = false
      zOrderKeyDefinitionFound = false
    })

    ioHandler.addEventListener('parsed', () => {
      // enable automatic z-order creation for new nodes again
      this.addZOrderForNewNodes = true
      if (!zOrderKeyDefinitionFound) {
        // no z-orders were stored in the GraphML so initialize the nodes in the view
        this.setTempNormalizedZOrders(null)
      } else if (!ioHandler.clearGraphBeforeRead) {
        this.appendTempZOrdersToExisting(maxExistingZOrder)
      }
      this.applyTempZOrders()
    })
  }

  private appendTempZOrdersToExisting(maxExistingZOrder: number): void {
    if (maxExistingZOrder == Number.MIN_VALUE) {
      // no nodes in the graph, yet
      return
    }
    const minNewZOrder = Math.min(...this.tempZOrders.values)
    const delta = maxExistingZOrder - minNewZOrder + 1
    this.tempZOrders.keys
      .filter((n) => this.masterGraph.getParent(n) == null)
      .toList()
      .forEach((key) => {
        const value = this.tempZOrders.get(key)
        this.tempZOrders.set(key, value! + delta)
      })
  }

  public compare(x: INode, y: INode): number {
    const masterX = this.getMasterNode(x)
    const masterY = this.getMasterNode(y)

    // the stored z-order is a partial order between children of the same parent
    const parentX = this.getParent(masterX)
    const parentY = this.getParent(masterY)
    if (parentX === parentY) {
      // for a common parent we can just compare the z-order values
      return this.zOrderOf(masterX) - this.zOrderOf(masterY)
    }
    if (this.masterGroupingSupport.isDescendant(masterX, masterY)) {
      return 1
    }
    if (this.masterGroupingSupport.isDescendant(masterY, masterX)) {
      return -1
    }
    // there is no common parent so find the ancestors that have a common parent
    const nca = this.masterGroupingSupport.getNearestCommonAncestor(masterX, masterY)
    const pathToRootX = this.masterGroupingSupport.getAncestors(masterX)
    const pathToRootY = this.masterGroupingSupport.getAncestors(masterY)

    const ancestorX = !nca ? pathToRootX.at(-1)! : pathToRootX.at(pathToRootX.indexOf(nca) - 1)!
    const ancestorY = !nca ? pathToRootY.at(-1)! : pathToRootY.at(pathToRootY.indexOf(nca) - 1)!
    // for these ancestors we can now compare the z-order values
    return this.zOrderOf(ancestorX) - this.zOrderOf(ancestorY)
  }

  /**
   * Gets the z-order value stored for `node`.
   */
  public getZOrder(node: INode): number {
    return this.zOrderOf(this.getMasterNode(node))
  }

  /**
   * Sets the new z-order value stored for `key`.
   * An {@link IUndoUnit} for the changed z-order is added as well if undo is enabled.
   */
  public setZOrder(key: INode, newZOrder: number): void {
    const master = this.getMasterNode(key)
    const oldZOrder = this.zOrders.get(master) ?? 0
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

  onZIndexChanged(item: IModelItem, newValue: number, oldValue: number | null): void {
    const eventArgs = new ZIndexChangedEventArgs(item, newValue, oldValue)
    this.zOrderChangedListeners.forEach((listener) => {
      listener(this, eventArgs)
    })
  }

  addZIndexChangedLister(
    listener: (sender: object, eventArgs: ZIndexChangedEventArgs) => void
  ): void {
    this.zOrderChangedListeners.push(listener)
  }

  removeZIndexChangedLister(
    listener: (sender: object, eventArgs: ZIndexChangedEventArgs) => void
  ): void {
    const index = this.zOrderChangedListeners.indexOf(listener)
    if (index > 0) {
      this.zOrderChangedListeners.splice(index, 1)
    }
  }

  /**
   * Arranges the `node` according to its {@link ZOrderSupport.getZOrder z-order}.
   */
  public update(node: INode): void {
    // the update call triggers a new installation of the node visualization that considers the z-order
    this.graphComponent.graphModelManager.update(this.getViewNode(node))
  }

  /**
   * Sets new ascending z-orders for `viewNodes` starting from `zOrder` and sorts their
   * {@link GraphModelManager.getMainRenderTreeElement canvas objects} as well.
   */
  public arrangeNodes(viewNodes: IEnumerable<INode>, zOrder: number): void {
    let prev: IRenderTreeElement | null = null
    for (const node of viewNodes) {
      this.setZOrder(this.getMasterNode(node), zOrder++)
      const renderTreeElement =
        this.graphComponent.graphModelManager.getMainRenderTreeElement(node)!
      if (!prev) {
        renderTreeElement.toBack()
      } else {
        renderTreeElement.above(prev)
      }
      prev = renderTreeElement
    }
  }

  /**
   * Sets a temporary z-order for `node` for a temporary `tempParent`.
   */
  public setTempZOrder(
    node: INode,
    tempParent: INode | null,
    newZOrder: number,
    force = false
  ): void {
    const master = this.getMasterNode(node)
    if (force || this.getZOrder(master) != newZOrder) {
      this.tempZOrders.set(master, newZOrder)
    }
    const masterParent = tempParent
      ? this.getMasterNode(tempParent)
      : this.foldingView
        ? this.foldingView.localRoot
        : null
    this.tempParents.set(master, masterParent)
  }

  /**
   * Sets normalized z-orders for all children of `parent` and recurses into child group nodes.
   */
  public setTempNormalizedZOrders(parent: INode | null): void {
    const children = this.graphComponent.graph.getChildren(parent).toList()
    children.sort(this.nodeComparison)
    let zOrder = 0
    for (const child of children) {
      this.setTempZOrder(child, parent, zOrder++)
      if (this.graphComponent.graph.isGroupNode(child)) {
        this.setTempNormalizedZOrders(child)
      }
    }
  }

  /**
   * Removes a temporary z-order for `node` that has been set previously via {@link ZOrderSupport.setTempZOrder}.
   */
  public removeTempZOrder(node: INode): void {
    const master = this.getMasterNode(node)
    this.tempZOrders.delete(master)
    this.tempParents.delete(master)
  }

  /**
   * Transfers all temporary z-orders that have been set previously via {@link ZOrderSupport.setTempZOrder}.
   */
  public applyTempZOrders(update = false): void {
    this.tempZOrders.forEach((keyValuePair) => {
      this.setZOrder(keyValuePair.key, keyValuePair.value)
      if (update) {
        this.update(keyValuePair.key)
      }
    })
    this.clearTempZOrders()
  }

  /**
   * Removes all temporary z-orders that has been set previously via {@link ZOrderSupport.setTempZOrder}.
   */
  public clearTempZOrders(): void {
    this.tempZOrders.clear()
    this.tempParents.clear()
  }

  public raise(nodes: List<INode>): void {
    nodes.sort(this.nodeComparison)

    let prev: INode | null = null
    for (let i = nodes.size - 1; i >= 0; i--) {
      const node = nodes.get(i)
      const co = this.graphComponent.graphModelManager.getMainRenderTreeElement(node)!
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

  public lower(nodes: List<INode>): void {
    nodes.sort(this.nodeComparison)

    let prev: INode | null = null
    for (const node of nodes) {
      const rte = this.graphComponent.graphModelManager.getMainRenderTreeElement(node)!
      const prevRte = rte.previousSibling
      if (prevRte) {
        const prevNode = this.graphComponent.graphModelManager.getModelItem(prevRte) as INode
        if (prevNode && prevNode !== prev) {
          this.swapZOrder(node, prevNode)
          this.graphComponent.graphModelManager.update(node)
        }
      }
      prev = node
    }
  }

  public toFront(nodes: List<INode>): void {
    for (const grouping of nodes.groupBy(
      (node) => this.graphComponent.graph.getParent(node),
      (type: INode | null, elements: IEnumerable<INode> | null) => ({
        groupNode: type,
        children: elements ? elements.toList() : new List<INode>()
      })
    )) {
      const groupNode = grouping.groupNode
      const toFrontChildren = grouping.children
      const allChildren = this.graphComponent.graph.getChildren(groupNode).toList()
      if (toFrontChildren.size < allChildren.size) {
        allChildren.sort(this.nodeComparison)
        toFrontChildren.sort(this.nodeComparison)
        allChildren.removeAll((node: INode) => {
          return toFrontChildren.includes(node)
        })
        const last = allChildren.last()!
        let zOrder = this.getZOrder(last) + 1
        for (const node of toFrontChildren) {
          this.setZOrder(node, zOrder++)
          this.update(node)
        }
      }
    }
  }

  public toBack(nodes: List<INode>): void {
    for (const grouping of nodes.groupBy(
      (node) => this.graphComponent.graph.getParent(node),
      (type: INode | null, elements: IEnumerable<INode> | null) => ({
        groupNode: type,
        children: elements ? elements.toList() : new List<INode>()
      })
    )) {
      const groupNode = grouping.groupNode
      const toBackChildren = grouping.children
      const allChildren = this.graphComponent.graph.getChildren(groupNode).toList()
      if (toBackChildren.size < allChildren.size) {
        allChildren.sort(this.nodeComparison)
        toBackChildren.sort(this.nodeComparison)
        allChildren.removeAll((node: INode) => {
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

  private onNodeCreated(evt: ItemEventArgs<INode>): void {
    const undoEngine = this.graphComponent.graph.undoEngine!
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

  public clear(): void {
    this.zOrders.clear()
    this.tempZOrders.clear()
    this.tempParents.clear()
  }

  /**
   * Returns the master item of `node` if folding is enabled and `node` itself otherwise.
   */
  public getMasterNode(node: INode): INode {
    const foldingView = this.graphComponent.graph.foldingView
    if (foldingView) {
      if (foldingView.manager.masterGraph.contains(node)) {
        // node already part of the master graph
        return node
      } else {
        // return master of node
        return foldingView.getMasterItem(node)!
      }
    }
    // no folding enabled
    return node
  }

  /**
   * Returns the view item of `node` if folding is enabled and `node` itself otherwise.
   */
  public getViewNode(node: INode): INode | null {
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

  private getParent(masterNode: INode): INode | null {
    const parent = this.tempParents.get(masterNode)
    if (parent) {
      // temporary parent has precedence over structural parent
      return parent
    }
    return this.masterGraph.getParent(masterNode)
  }

  private zOrderOf(node: INode): number {
    let zOrder = this.tempZOrders.get(node)
    if (zOrder) {
      // temporary z-order has precedence over basic z-order
      return zOrder
    }
    zOrder = this.zOrders.get(node)
    return zOrder ?? 0
  }

  private swapZOrder(node1: INode, node2: INode): void {
    const zOrder1 = this.getZOrder(node1)
    const zOrder2 = this.getZOrder(node2)
    this.setZOrder(node1, zOrder2)
    this.setZOrder(node2, zOrder1)
  }

  ////////////////////////////////////////// Clipboard //////////////////////////////

  configureGraphClipboard() {
    this.graphComponent.clipboard = new ZOrderGraphClipboard(this)
  }

  ////////////////////////////////////////// Input mode configuration //////////////////////////////

  private $inputMode: GraphEditorInputMode | null = null

  public configureInputMode(inputMode: GraphEditorInputMode): void {
    this.$inputMode = inputMode
    this.addCommandBinding(Command.RAISE, this.raise.bind(this))
    this.addCommandBinding(Command.LOWER, this.lower.bind(this))
    this.addCommandBinding(Command.TO_FRONT, this.toFront.bind(this))
    this.addCommandBinding(Command.TO_BACK, this.toBack.bind(this))
    inputMode.addEventListener('deleting-selection', this.beforeDeleteSelection.bind(this))
    inputMode.addEventListener('deleted-selection', this.afterDeleteSelection.bind(this))
    inputMode.addEventListener('grouping-selection', this.beforeGrouping.bind(this))
    inputMode.addEventListener('ungrouping-selection', this.beforeUngrouping.bind(this))
    inputMode.reparentNodeHandler = new ZOrderReparentHandler(inputMode.reparentNodeHandler, this)
    this.configureMoveInputMode(inputMode)
  }

  private addCommandBinding(newCommand: Command, method: (obj: List<INode>) => void): void {
    this.$inputMode!.keyboardInputMode.addCommandBinding(
      newCommand,
      (evt) => {
        const nodes = this.resolveParameter(evt.parameter)
        if (nodes !== null) {
          method(nodes)
          evt.handled = true
        }
      },
      (evt) => {
        const nodes = this.resolveParameter(evt.parameter)
        evt.canExecute = nodes !== null
        evt.handled = true
      }
    )
  }

  private resolveParameter(parameter: object): List<INode> | null {
    if (!parameter) {
      if (this.graphComponent.selection.nodes.size > 0) {
        return this.graphComponent.selection.nodes.toList()
      }
    } else if (parameter instanceof IModelItem) {
      const nodes = new List<INode>()
      if (parameter instanceof INode) {
        nodes.add(parameter)
      }
      return nodes
    } else if (parameter instanceof IEnumerable) {
      const nodes = parameter.filter((para) => para instanceof INode).toList()
      return nodes.size > 0 ? nodes : null
    }
    return null
  }

  ////////////////////////////////////////// Grouping operations ///////////////////////////////////

  private beforeGrouping(e: SelectionEventArgs<IModelItem>): void {
    // get all selected nodes and sort by their current z-order
    const nodes = (<IGraphSelection>e.selection).nodes.toList()
    nodes.sort(this.nodeComparison)

    // set increasing z-orders
    for (let i = 0; i < nodes.size; i++) {
      this.setZOrder(nodes.get(i), i)
    }
  }

  private beforeUngrouping(e: SelectionEventArgs<IModelItem>): void {
    const graph = this.$graphComponent.graph
    // store all selected nodes that have a parent group
    const nodes = (<IGraphSelection>e.selection).nodes
      .filter((node: INode) => {
        return graph.getParent(node) !== null
      })
      .toList()

    // sort selected nodes by their current z-order
    nodes.sort(this.nodeComparison)

    // collect top level nodes
    const topLevelNodes = graph.getChildren(null).toList()
    topLevelNodes.sort(this.nodeComparison)

    const newTopLevelNodes = new List<INode>()
    let topLevelIndex = 0

    let nextTopLevelNode: INode | null = null
    const gs = graph.groupingSupport

    for (const node of nodes) {
      const topLevelAncestor = gs.getAncestors(node).at(-1)
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
      this.setZOrder(newTopLevelNodes.get(i), i)
    }
  }

  ////////////////////////////////////////// Delete selection //////////////////////////////////////

  private $deleteSelectionNewParents: Set<INode | null> | null = null
  private $absOrder: Map<INode, number> | null = null
  private $parentChangedListener: ((evt: NodeEventArgs) => void) | null = null

  private beforeDeleteSelection(_e: SelectionEventArgs<IModelItem>): void {
    const graph = this.$graphComponent.graph
    // collect absolute order of all view items
    const nodes = graph.nodes.toList()
    nodes.sort(this.nodeComparison)
    this.$absOrder = new Map<INode, number>()
    for (let i = 0; i < nodes.size; i++) {
      this.$absOrder.set(nodes.get(i), i)
    }
    // collect new parents in ParentChanged events
    this.$deleteSelectionNewParents = new Set<INode>()
    // before the group node is removed, all its children get reparented so we listen for each ParentChanged event.
    this.$parentChangedListener = this.onParentChanged.bind(this)
    graph.addEventListener('parent-changed', this.$parentChangedListener)
  }

  private afterDeleteSelection(_e: ItemsEventArgs): void {
    const graph = this.$graphComponent.graph
    graph.removeEventListener('parent-changed', this.$parentChangedListener!)

    // for each new parent sort their children in previously stored absolute order
    for (const newParent of this.$deleteSelectionNewParents!) {
      if (newParent === null || graph.contains(newParent)) {
        // newParent hasn't been removed as well, so sort its children
        const children = graph.getChildren(newParent).toList()
        children.sort(
          (node1: INode, node2: INode) => this.$absOrder!.get(node1)! - this.$absOrder!.get(node2)!
        )
        this.arrangeNodes(children, 0)
      }
    }
    this.$deleteSelectionNewParents = null
  }

  private onParentChanged(evt: NodeEventArgs): void {
    const newParent = this.$graphComponent.graph.getParent(evt.item)
    this.$deleteSelectionNewParents!.add(newParent)
  }

  ////////////////////////////////////////// MoveInputMode /////////////////////////////////////////

  // Moved nodes that might get reparented.
  private $movedNodes: List<INode> = new List<INode>()

  // A mapping from moved nodes to their original parents
  private $oldParents: Map<INode, INode | null> = new Map<INode, INode>()

  // the maximum z-order of the children of a group node
  private $maxOldZOrder: Map<INode, number> = new Map<INode, number>()

  // the maximum z-order of top-level nodes
  private $maxRootZOrder: number = Number.MIN_VALUE

  public configureMoveInputMode(geim: GraphEditorInputMode): void {
    geim.moveUnselectedItemsInputMode.addEventListener(
      'drag-starting',
      this.moveStarting.bind(this)
    )
    geim.moveUnselectedItemsInputMode.addEventListener(
      'drag-finished',
      this.moveFinished.bind(this)
    )
    geim.moveUnselectedItemsInputMode.addEventListener(
      'drag-canceled',
      this.moveCanceled.bind(this)
    )
  }

  ////////////////////////////////////////// Initialize fields on MoveStarting /////////////////////

  /**
   * Stores all moved nodes, their parents and the maximum z-order of children of their parents before the move gesture
   * starts.
   */
  private moveStarting(_e: InputModeEventArgs) {
    const graph = this.$graphComponent.graph

    // store all selected nodes which might get reparented
    this.$movedNodes =
      this.$inputMode!.moveUnselectedItemsInputMode.affectedItems.ofType(INode).toList()
    // sort this list by their relative z-order
    this.$movedNodes.sort(this.nodeComparison)

    // calculate max z-order for all group nodes containing any moved node
    this.$movedNodes.forEach((node: INode) => {
      const parent = graph.getParent(node)
      this.$oldParents.set(node, parent)
      this.getOrCalculateMaxZOrder(parent)
    })
    // calculate max z-order of top-level nodes
    this.getOrCalculateMaxZOrder(null)
  }

  /**
   * Returns the maximum z-order of the children of `parent`.
   * If the maximum z-order isn't stored, yet, it is calculated first.
   */
  private getOrCalculateMaxZOrder(parent: INode | null): number {
    const graph = this.$graphComponent.graph
    if (!parent) {
      // top-level nodes
      if (this.$maxRootZOrder === Number.MIN_VALUE) {
        this.$maxRootZOrder = graph
          .getChildren(null)
          .map((node: INode) => {
            return this.getZOrder(node)
          })
          .reduce((acc: number, current: number) => Math.max(acc, current), Number.MIN_VALUE)
      }
      return this.$maxRootZOrder
    }
    let maxZOrder = this.$maxOldZOrder.get(parent)
    if (!maxZOrder) {
      const children = graph.getChildren(parent)
      maxZOrder =
        children.size > 0
          ? children.reduce(
              (acc: number, current: INode) => Math.max(acc, this.getZOrder(current)),
              Number.MIN_VALUE
            )
          : 0
      this.$maxOldZOrder.set(parent, maxZOrder)
    }
    return maxZOrder
  }

  /**
   * Returns a new z-order for `node` in its new `parent`.
   * As all MovedNodes will be reparented to the same parent, those nodes that had this parent initially will keep their
   * old z-order. Therefore the new z-order can be calculated by adding the old max z-order of parent's children to the
   * number of nodes in MovedNodes that were below node and would be reparented as well.
   */
  public getZOrderForNewParent(node: INode, parent: INode | null): number {
    // start the new z-order one after the old children's maximum
    let newZOrder = this.getOrCalculateMaxZOrder(parent) + 1
    for (const movedNode of this.$movedNodes) {
      if (movedNode === node) {
        return newZOrder
      }
      if (this.$oldParents.get(movedNode) !== parent) {
        // movedNode would be reparented and was below node, so increase the z-order
        return newZOrder++
      }
    }
    return 0
  }

  private moveFinished(_e: InputModeEventArgs): void {
    // Apply the temporary z-orders for all reparented nodes
    this.applyTempZOrders()
    this.cleanup()
  }

  private moveCanceled(_e: InputModeEventArgs): void {
    // clear temporary z-orders and keep the original ones.
    this.clearTempZOrders()
    this.cleanup()
  }

  private cleanup(): void {
    this.$movedNodes.clear()
    this.$oldParents.clear()
    this.$maxOldZOrder.clear()
    this.$maxRootZOrder = Number.MIN_VALUE
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
}

export class ZIndexChangedEventArgs extends EventArgs {
  private readonly $item: IModelItem
  private readonly $newZIndex: number
  private readonly $oldZIndex: number | null

  constructor(item: IModelItem, newZIndex: number, oldZIndex: number | null) {
    super()
    this.$item = item
    this.$newZIndex = newZIndex
    this.$oldZIndex = oldZIndex
  }

  get item(): IModelItem {
    return this.$item
  }

  get newZIndex(): number {
    return this.$newZIndex
  }

  get oldZIndex(): number | null {
    return this.$oldZIndex
  }
}

/**
 * An {@link IPositionHandler} for nodes that tries to keep the z-order of its moved node relative to other moved nodes.
 * As the z-order doesn't change for normal move gestures, this class customizes only interactive reparent gestures.
 */
export class ZOrderNodePositionHandler extends GroupingNodePositionHandler {
  private readonly $node: INode
  private $initialParent: INode | null
  private $currentParent: INode | null
  private $zOrderSupport: ZOrderSupport

  constructor(
    node: INode,
    zOrderSupport: ZOrderSupport,
    wrappedHandler?: IPositionHandler | undefined
  ) {
    if (wrappedHandler) {
      super(node, wrappedHandler)
    } else {
      super(node)
    }
    this.$node = node

    this.$zOrderSupport = zOrderSupport
    this.$initialParent = null
    this.$currentParent = null
  }

  public initializeDrag(context: IInputModeContext): void {
    const graph = context.graph!

    // store initial parent of the node...
    this.$initialParent = graph.getParent(this.$node)
    this.$currentParent = this.$initialParent

    super.initializeDrag(context)
  }

  /**
   * Customizes the temporary new parent of `node` and its z-order in its new {@link IRenderTreeGroup}
   */
  public setCurrentParent(context: IInputModeContext, node: INode, parent: INode): void {
    if (parent !== this.$initialParent) {
      // node is temporarily at a new parent
      // the ZOrderMoveInputMode knows all moved nodes and therefore can provide the new z-order for this node
      const tempZOrder = this.$zOrderSupport.getZOrderForNewParent(node, parent)
      // 'parent' is only a temporary new parent so the old z-order should be kept but a new temporary one is set
      this.$zOrderSupport.setTempZOrder(node, parent, tempZOrder)
      super.setCurrentParent(context, node, parent)
    } else if (parent !== this.$currentParent) {
      // node is reset to its initial parent: reset its temporary z-order so the original one is used again
      this.$zOrderSupport.removeTempZOrder(node)

      super.setCurrentParent(context, node, parent)
    }
    this.$currentParent = parent
  }

  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    super.dragFinished(context, originalLocation, newLocation)
    this.cleanUp()
  }

  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    super.cancelDrag(context, originalLocation)
    this.cleanUp()
  }

  private cleanUp(): void {
    this.$initialParent = null
    this.$currentParent = null
  }
}

/**
 * An {@link InputHandlerBase input handler} that reads the z-order of nodes, edges and ports.
 */
class ZOrderInputHandler extends InputHandlerBase<INode, Number> {
  private readonly zOrderSupport: ZOrderSupport

  constructor(zOrderSupport: ZOrderSupport) {
    super(INode, Number)
    this.zOrderSupport = zOrderSupport
  }

  public parseDataCore(context: IParseContext, node: Node): number {
    return Number.parseInt(node.textContent!)
  }

  public setValue(context: IParseContext, key: INode | null, data: number | null): void {
    if (this.zOrderSupport && key && data !== null) {
      this.zOrderSupport.setZOrder(key, data)
      this.zOrderSupport.update(key)
    }
  }

  public applyDefault(context: IParseContext): void {
    const key = context.getCurrent(INode)!
    this.setValue(context, key, 0)
  }
}

/**
 * An {@link IOutputHandler} that writes the z-order of nodes, edges and ports.
 */
class ZOrderOutputHandler extends OutputHandlerBase<INode, Number> {
  private readonly zOrderSupport: ZOrderSupport

  public static get Z_ORDER_KEY_NAME(): string {
    return 'zOrder'
  }

  /**
   * The namespace URI for z-order extensions to GraphML.
   * This field has the constant value `http://www.yworks.com/xml/yfiles-bpmn/1.0`
   */
  public static get Z_ORDER_N_S(): string {
    return 'http://www.yworks.com/xml/yfiles-z-order/1.0'
  }

  constructor(zOrderSupport: ZOrderSupport) {
    super(INode, Number, KeyScope.NODE, ZOrderOutputHandler.Z_ORDER_KEY_NAME, KeyType.INT)
    this.zOrderSupport = zOrderSupport
    this.writeKeyDefault = false
    this.precedence = WritePrecedence.BEFORE_CHILDREN
    this.setKeyDefinitionUri(
      ZOrderOutputHandler.Z_ORDER_N_S + '/' + ZOrderOutputHandler.Z_ORDER_KEY_NAME
    )
  }

  public writeValueCore(context: IWriteContext, data: number): void {
    context.writer.writeString(data.toString())
  }

  public getValue(context: IWriteContext, key: INode): number {
    if (this.zOrderSupport) {
      return this.zOrderSupport.getZOrder(key)
    }
    return 0
  }
}

/**
 * Delegates reparenting to an external callback function. The callback function is intended to
 * provide pre- and post-processing only. The actual reparenting operation should be performed by
 * the reparent handler that is passed to the callback function.
 */
class ZOrderReparentHandler extends BaseClass(IReparentNodeHandler) {
  constructor(
    private readonly handler: IReparentNodeHandler,
    private readonly zOrderSupport: ZOrderSupport
  ) {
    super()
  }

  isReparentGesture(context: IInputModeContext, node: INode): boolean {
    return this.handler.isReparentGesture(context, node)
  }

  isValidParent(context: IInputModeContext, node: INode, newParent: INode | null): boolean {
    return this.handler.isValidParent(context, node, newParent)
  }

  reparent(context: IInputModeContext, node: INode, newParent: INode | null): void {
    // Determine the node's and the parent's representatives in the master graph.
    // This has to be done prior to the reparenting operation, because if the new parent is a
    // folder node (i.e. a closed group node), the given node will be removed from the current
    // view graph as part of the reparenting operation. In this case, the corresponding master nodes
    // cannot be determined anymore after reparenting is done.
    // Being able to determine the master nodes right before reparenting is the whole reason
    // for decorating the default reparent handler here.
    const masterNode = this.zOrderSupport.getMasterNode(node)
    const masterParent = newParent ? this.zOrderSupport.getMasterNode(newParent) : null

    // reparent the node
    this.handler.reparent(context, node, newParent)

    // update the node's z-order index
    const zIndex = this.calculateNewZIndex(this.zOrderSupport.masterGraph, masterNode, masterParent)
    this.zOrderSupport.setZOrder(masterNode, zIndex)

    const viewNode = this.zOrderSupport.getViewNode(masterNode)
    if (viewNode) {
      this.zOrderSupport.graphComponent.graphModelManager.update(viewNode)
    }
  }

  shouldReparent(context: IInputModeContext, node: INode): boolean {
    return this.handler.shouldReparent(context, node)
  }

  /**
   * Calculates an appropriate z-order index for the given node in the given graph.
   */
  private calculateNewZIndex(
    masterGraph: IGraph,
    masterNode: INode,
    masterParent: INode | null
  ): number {
    const children = masterGraph.getChildren(masterParent)
    if (children.size === 1) {
      // node is the only child
      return 0
    }
    // increment the maximum z-index of all children by 1 to add node last
    return (
      Math.max(
        ...children
          .filter((current) => current != masterNode)
          .map((n) => this.zOrderSupport.getZOrder(n))
      ) + 1
    )
  }
}
