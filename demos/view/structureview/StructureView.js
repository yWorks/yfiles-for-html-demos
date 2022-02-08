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
  DefaultGraph,
  delegate,
  EventArgs,
  HashMap,
  IFoldingView,
  IGraph,
  ILabel,
  INode,
  ItemChangedEventArgs,
  ItemEventArgs,
  LabelEventArgs,
  NodeEventArgs
} from 'yfiles'

/**
 * Specifies the folding view features required for the structure view.
 * @typedef {Object} FoldingViewType
 * @property {function} getViewItem
 * @property {function} collapse
 * @property {function} expand
 * @property {function} addGroupCollapsedListener
 * @property {function} removeGroupCollapsedListener
 * @property {function} addGroupExpandedListener
 * @property {function} removeGroupExpandedListener
 */

/**
 * Dummy implementation of the above specified folding view type for flat graphs (or graphs without
 * folding). This dummy implementation ensures that the structure view is properly populated even
 * if the associated graph does not support folding.
 */
const DummyFoldingView = {
  getViewItem(node) {
    return node
  },

  collapse(node) {},
  expand(node) {},

  addGroupCollapsedListener(listener) {},
  removeGroupCollapsedListener(listener) {},
  addGroupExpandedListener(listener) {},
  removeGroupExpandedListener(listener) {}
}

/**
 * Displays a structured view of a given {@link IGraph}. The collapse/expand mechanism is based on
 * a checkbox state and CSS selectors. Therefore the corresponding CSS file is required.
 */
export default class StructureView {
  /**
   * Initializes the structure view in the DOM element given by the id and the given click callback.
   * @param {!string} selector The selector for the container in which the structure view should be created.
   */
  constructor(selector) {
    this._onElementClicked = node => {}
    this.foldingView = DummyFoldingView
    this._syncFoldingState = false
    this._graph = null
    this.masterGraph = new DefaultGraph()

    // Stores a mapping from structure view DOM elements to graph nodes.
    // Uses a native JS Map for least overhead and best performance.
    this.element2node = new Map()

    // Stores a mapping from graph nodes to structure view DOM elements.
    // Uses a yFiles HashMap, because keys are yFiles objects of type INode.
    this.node2element = new HashMap()

    this.groupElementCounter = 0

    // Stores listeners that handle graph changes.
    this.editListeners = new Map()

    // The text for nodes that do not have a label.
    this.labelPlaceholder = '< node >'

    const container = document.querySelector(selector)
    container.setAttribute('class', 'structure-view-container')
    const graphList = document.createElement('ol')
    graphList.setAttribute('class', 'structure-view-list')
    container.appendChild(graphList)

    // Create the 'Graph' root folder
    const li = document.createElement('li')
    li.setAttribute('class', 'structure-view-group')
    const label = document.createElement('label')
    label.setAttribute('class', 'structure-view-expanded')
    label.setAttribute('for', 'graph-root')
    label.textContent = 'Graph'
    const collapseBox = document.createElement('input')
    collapseBox.id = 'graph-root'
    collapseBox.type = 'checkbox'
    collapseBox.setAttribute('checked', 'true')
    collapseBox.addEventListener('change', e => {
      const element = e.target
      label.setAttribute(
        'class',
        element.checked ? 'structure-view-expanded' : 'structure-view-collapsed'
      )
    })

    li.appendChild(label)
    li.appendChild(collapseBox)

    this.rootListElement = document.createElement('ol')
    li.appendChild(this.rootListElement)

    // Append the 'Graph' root folder
    graphList.appendChild(li)

    this.createEditListeners()
  }

  /**
   * Gets whether the folding state should be synced between the structure view and the graph.
   * @type {boolean}
   */
  get syncFoldingState() {
    return this._syncFoldingState
  }

  /**
   * Sets whether the folding state should be synced between the structure view and the graph.
   * @type {boolean}
   */
  set syncFoldingState(value) {
    if (value === this._syncFoldingState || this.foldingView === null) {
      return
    }

    this._syncFoldingState = value

    if (value) {
      this.foldingView.addGroupCollapsedListener(delegate(this.toggleGroupElementState, this))
      this.foldingView.addGroupExpandedListener(delegate(this.toggleGroupElementState, this))
    } else {
      this.foldingView.removeGroupCollapsedListener(delegate(this.toggleGroupElementState, this))
      this.foldingView.removeGroupExpandedListener(delegate(this.toggleGroupElementState, this))
    }
  }

  /**
   * Gets the callback that is executed when an element in the structure view is clicked.
   * @type {!function}
   */
  get onElementClicked() {
    return this._onElementClicked
  }

  /**
   * Sets the callback that is executed when an element in the structure view is clicked.
   * @type {!function}
   */
  set onElementClicked(callback) {
    this._onElementClicked = callback
  }

  /**
   * Returns the graph that is currently displayed by this structure view.
   * @type {?IGraph}
   */
  get graph() {
    return this._graph
  }

  /**
   * Specifies the graph that is currently displayed by this structure view.
   * @type {?IGraph}
   */
  set graph(value) {
    if (this._graph === value) {
      return
    }

    const previousSyncFoldingState = this.syncFoldingState

    if (this._graph) {
      // reset the StructureView
      this.syncFoldingState = false
      this.uninstallEditListeners()
      this.clearStructure()
      this.foldingView = DummyFoldingView
      this.masterGraph = new DefaultGraph()
    }

    this._graph = value

    if (value) {
      // re-initialize the StructureView with the new graph
      const foldingView = value.foldingView
      if (foldingView === null) {
        this.foldingView = DummyFoldingView
        this.masterGraph = value
      } else {
        this.foldingView = foldingView
        this.masterGraph = foldingView.manager.masterGraph
      }
      this.installEditListeners()
      this.buildStructure()
    }

    this.syncFoldingState = previousSyncFoldingState
  }

  /**
   * Clears the current structure component and builds it anew from scratch.
   */
  buildStructure() {
    this.clearStructure()
    for (const node of this.masterGraph.getChildren(null)) {
      // traverse the top-level nodes and recursively build the structure view
      this.buildRecursiveTreeStructure(this.rootListElement, node)
    }
  }

  /**
   * A recursive helper function that actually builds the structure view. It
   * traverses all graph nodes and adds the respective DOM elements in the structure
   * view component.
   * @param {!HTMLElement} rootElement
   * @param {!INode} node
   */
  buildRecursiveTreeStructure(rootElement, node) {
    if (this.masterGraph.getChildren(node).size > 0) {
      // add a new group element with its children
      this.appendGroupElement(rootElement, node)
    } else {
      // add a leaf
      this.appendNodeElement(rootElement, node)
    }
  }

  /**
   * Appends the groupNode and (recursively) its children to the given parentElement.
   * @param {!HTMLElement} parentElement
   * @param {!INode} groupNode
   */
  appendGroupElement(parentElement, groupNode) {
    // create the group
    const li = document.createElement('li')
    li.setAttribute('class', 'structure-view-group')

    // create the label
    const label = document.createElement('label')
    label.setAttribute('data-groupelement', `group#${this.groupElementCounter}`)
    label.setAttribute('class', 'structure-view-expanded')
    label.textContent =
      groupNode.labels.size > 0 ? groupNode.labels.first().text : this.labelPlaceholder
    label.addEventListener('click', () => {
      this.onElementClicked(groupNode)
    })

    // the collapse/expand control is done via checkbox
    const collapseBox = document.createElement('input')
    collapseBox.id = `group#${this.groupElementCounter}`
    collapseBox.type = 'checkbox'
    collapseBox.setAttribute('checked', 'true')

    // change folder icon if collapsed/expanded
    collapseBox.addEventListener('change', e => {
      console.log('collapseBox.changed')
      const element = e.target
      label.setAttribute(
        'class',
        element.checked ? 'structure-view-expanded' : 'structure-view-collapsed'
      )
      if (!this.syncFoldingState) {
        return
      }
      const masterGroupNode = this.element2node.get(collapseBox.parentElement)
      if (!masterGroupNode) {
        return
      }
      const viewGroupNode = this.foldingView.getViewItem(masterGroupNode)
      if (!viewGroupNode) {
        return
      }
      if (!element.checked) {
        this.foldingView.collapse(viewGroupNode)
      } else {
        this.foldingView.expand(viewGroupNode)
      }
    })

    // append the actual DOM elements
    li.appendChild(label)
    li.appendChild(collapseBox)

    // append the group element to the root list
    const root = document.createElement('ol')
    li.appendChild(root)
    parentElement.appendChild(li)

    // keep track of the elements
    this.node2element.set(groupNode, li)
    this.element2node.set(li, groupNode)

    // increase unique IDs for the groups
    this.groupElementCounter++

    // recursively traverse the children
    for (const child of this.masterGraph.getChildren(groupNode)) {
      this.buildRecursiveTreeStructure(root, child)
    }
  }

  /**
   * Appends the given node to the parentElement.
   * @param {!HTMLElement} parentElement
   * @param {!INode} node
   */
  appendNodeElement(parentElement, node) {
    // create the element
    const nodeElement = document.createElement('li')
    nodeElement.setAttribute('class', 'structure-view-node')
    nodeElement.textContent =
      node.labels.size > 0 ? node.labels.first().text : this.labelPlaceholder
    // register the click callback
    nodeElement.addEventListener('click', () => {
      this.onElementClicked(node)
    })
    // append the element
    parentElement.appendChild(nodeElement)
    // keep track of the elements
    this.node2element.set(node, nodeElement)
    this.element2node.set(nodeElement, node)
  }

  /**
   * Creates listeners to update the structure view if the graph is edited.
   * The structure is updated on label editing, node creation/deletion and reparenting.
   */
  createEditListeners() {
    this.editListeners.set('labelAdded', (src, evt) => {
      const args = evt
      if (args.item.owner instanceof INode) {
        const node = args.item.owner
        const label = this.getLabelElement(this.getElement(node))
        label.textContent = args.item.text
      }
    })

    this.editListeners.set('labelTextChanged', (src, evt) => {
      const args = evt
      if (args.item.owner instanceof INode) {
        const node = args.item.owner
        const label = this.getLabelElement(this.getElement(node))
        label.textContent = args.item.text
      }
    })

    this.editListeners.set('labelRemoved', (src, evt) => {
      const args = evt
      if (args.owner instanceof INode) {
        const ownerNode = args.owner
        const label = this.getLabelElement(this.getElement(ownerNode))
        label.textContent =
          ownerNode.labels.size > 0 ? ownerNode.labels.last().text : this.labelPlaceholder
      }
    })

    this.editListeners.set('nodeCreated', (src, args) => this.onNodeCreated(args.item))
    this.editListeners.set('nodeRemoved', (src, args) => this.onNodeRemoved(args.item))

    this.editListeners.set('parentChanged', (src, args) => {
      const node = args.item
      // get the element of the new parent
      let newParentListElement = this.rootListElement
      const newParentNode = this.masterGraph.getParent(node)
      if (newParentNode) {
        newParentListElement = this.getListElement(this.getElement(newParentNode))
      }

      if (newParentListElement) {
        const element = this.getElement(node)
        newParentListElement.appendChild(element)
      }
    })
  }

  /**
   * Installs listeners to update the structure view if the graph is edited.
   * The structure is updated on label editing, node creation/deletion and reparenting.
   */
  installEditListeners() {
    const graph = this.masterGraph
    graph.addLabelAddedListener(this.getEditListener('labelAdded'))
    graph.addLabelTextChangedListener(this.getEditListener('labelTextChanged'))
    graph.addLabelRemovedListener(this.getEditListener('labelRemoved'))
    graph.addNodeCreatedListener(this.getEditListener('nodeCreated'))
    graph.addNodeRemovedListener(this.getEditListener('nodeRemoved'))
    graph.addParentChangedListener(this.getEditListener('parentChanged'))
  }

  /**
   * Uninstalls listeners added in {@link installEditListeners}.
   */
  uninstallEditListeners() {
    const graph = this.masterGraph
    graph.removeLabelAddedListener(this.getEditListener('labelAdded'))
    graph.removeLabelTextChangedListener(this.getEditListener('labelTextChanged'))
    graph.removeLabelRemovedListener(this.getEditListener('labelRemoved'))
    graph.removeNodeCreatedListener(this.getEditListener('nodeCreated'))
    graph.removeNodeRemovedListener(this.getEditListener('nodeRemoved'))
    graph.removeParentChangedListener(this.getEditListener('parentChanged'))
  }

  /**
   * Gets the parent ol element for the given label element.
   * @param {!HTMLElement} parentLabel
   * @returns {?HTMLElement}
   */
  getListElement(parentLabel) {
    const olList = parentLabel.getElementsByTagName('ol')
    return olList.length > 0 ? olList[0] : null
  }

  /**
   * Gets the label element for the given list element.
   * @param {!HTMLElement} li
   * @returns {!HTMLElement}
   */
  getLabelElement(li) {
    const labelList = li.getElementsByTagName('label')
    return labelList.length > 0 ? labelList[0] : li
  }

  /**
   * Removes the masterNode element from the structure.
   * @param {!INode} masterNode
   */
  removeNodeElement(masterNode) {
    const nodeElement = this.getElement(masterNode)
    // delete the node and remove the node from the map
    this.node2element.delete(masterNode)
    this.element2node.delete(nodeElement)
    StructureView.removeElement(nodeElement)
  }

  /**
   * Creates the DOM element for the given node and adds it to
   * the structure view.
   * @param {!INode} node
   */
  onNodeCreated(node) {
    // get the parent element
    let parentListElement = this.rootListElement
    const parentNode = this.masterGraph.getParent(node)
    if (parentNode) {
      const listElement = this.getListElement(this.getElement(parentNode))
      if (listElement) {
        parentListElement = listElement
      }
    }

    if (this.masterGraph.isGroupNode(node)) {
      this.appendGroupElement(parentListElement, node)
    } else {
      this.appendNodeElement(parentListElement, node)
    }
  }

  /**
   * Removes the masterNode element from the structure.
   * If the masterNode is a group, the children are preserved
   * and reparented to the parent node.
   * To remove the group node and its children, use {@link StructureView#removeNodeElement}
   * @param {!INode} masterNode
   */
  onNodeRemoved(masterNode) {
    const element = this.getElement(masterNode)

    const listElement = this.getListElement(element)
    if (listElement === null) {
      // delete the node
      StructureView.removeElement(element)
    } else {
      // move the children to the parent
      const newGroupList = element.parentNode
      while (listElement.firstChild) {
        newGroupList.appendChild(listElement.firstChild)
      }
      // remove the group element
      StructureView.removeElement(element)
    }
    // remove the node from the map
    this.node2element.delete(masterNode)
    this.element2node.delete(element)
  }

  /**
   * Sets the structured view group element state to the given collapsed state.
   * @param {!IFoldingView} src
   * @param {!ItemEventArgs.<INode>} args
   */
  toggleGroupElementState(src, args) {
    const groupNode = args.item
    const masterGroupNode = src.getMasterItem(groupNode)
    const groupLi = this.getElement(masterGroupNode ? masterGroupNode : groupNode)
    if (!groupLi) {
      return
    }
    const groupLabel = this.getLabelElement(groupLi)
    const checkboxId = groupLabel.getAttribute('data-groupelement')
    const checkboxElement = document.getElementById(checkboxId)
    checkboxElement.checked = src.isExpanded(groupNode)
    groupLabel.setAttribute(
      'class',
      !checkboxElement.checked ? 'structure-view-collapsed' : 'structure-view-expanded'
    )
  }

  /**
   * Helper method to clear the entire structure and its internal maps.
   */
  clearStructure() {
    while (this.rootListElement.lastChild) {
      this.rootListElement.removeChild(this.rootListElement.lastChild)
    }
    this.element2node.clear()
    this.node2element.clear()
    this.groupElementCounter = 0
  }

  /**
   * Returns the listener for the given event key.
   * @param {!string} key
   * @returns {!function}
   */
  getEditListener(key) {
    return this.editListeners.get(key)
  }

  /**
   * Returns the HTMLElement in the structure view that represents the given graph node.
   * @param {!INode} key
   * @returns {!HTMLElement}
   */
  getElement(key) {
    return this.node2element.get(key)
  }

  /**
   * Removes the given element from its parent node.
   * @param {!HTMLElement} element
   */
  static removeElement(element) {
    element.parentNode.removeChild(element)
  }
}
