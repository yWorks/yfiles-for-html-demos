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
import { HashMap, IGraph, INode, delegate } from 'yfiles'

/**
 * Displays a structured view of a given {@link IGraph}. The collapse/expand mechanism is based on
 * a checkbox state and CSS selectors. Therefore the corresponding CSS file is required.
 */
export default class StructureView {
  /**
   * Sets the string that is assigned to nodes that don't have a label.
   * @returns {string}
   */
  get labelPlaceholder() {
    return this.$labelPlaceholder
  }

  /**
   * Gets the string that is assigned to nodes that don't have a label.
   * @param {string} value
   */
  set labelPlaceholder(value) {
    this.$labelPlaceholder = value
  }

  /**
   * Gets whether the folding state should be synced between the structure view and the graph.
   * @returns {boolean}
   */
  get syncFoldingState() {
    return !!this.$syncFoldingState
  }

  /**
   * Sets whether the folding state should be synced between the structure view and the graph.
   * @param {boolean} value
   */
  set syncFoldingState(value) {
    if (value === this.$syncFoldingState || this.foldingView === null) {
      return
    }
    this.$syncFoldingState = value

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
   * @returns {(function(INode))|undefined}
   */
  get onElementClicked() {
    return this.$onElementClicked
  }

  /**
   * Sets the callback that is executed when an element in the structure view is clicked.
   * @param {function(INode)} callback
   */
  set onElementClicked(callback) {
    this.$onElementClicked = callback
  }

  /**
   * Returns the graph that is currently displayed by this structure view.
   * @type {IGraph}
   */
  get graph() {
    return this.$graph
  }

  /**
   * Specifies the graph that is currently displayed by this structure view.
   * @type {IGraph}
   */
  set graph(value) {
    if (this.$graph === value) {
      return
    }

    const previousSyncFoldingState = this.syncFoldingState
    if (this.$graph) {
      // reset the StructureView
      this.syncFoldingState = false
      this.uninstallEditListeners()
      this.clearStructure()
      this.foldingView = null
      this.masterGraph = null
    }

    this.$graph = value
    if (this.$graph) {
      // re-initialize the StructureView with the new graph
      this.foldingView = value.foldingView
      if (this.foldingView === null) {
        this.masterGraph = value
      } else {
        this.masterGraph = this.foldingView.manager.masterGraph
      }
      this.installEditListeners()
      this.buildStructure()
    }

    this.syncFoldingState = previousSyncFoldingState
  }

  /**
   * Initializes the structure view in the DOM element given by the id and the given click callback.
   * @param {string} selector The selector for the container in which the structure view should be created.
   */
  constructor(selector) {
    // Some private maps to store the DOM element to INode relation and vice versa. If the key will be a yFiles
    // object, make sure to use a yFiles map. Otherwise use the native JS objects for less overhead and better
    // performance.
    this.element2node = new Map()
    this.node2element = new HashMap()

    this.groupElementCounter = 0
    this.labelPlaceholder = '< no value >'

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
      label.setAttribute(
        'class',
        e.target.checked ? 'structure-view-expanded' : 'structure-view-collapsed'
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
   * Clears the current structure component and builds it anew from scratch.
   * @private
   */
  buildStructure() {
    this.clearStructure()
    this.masterGraph.getChildren(null).forEach(node => {
      // traverse the top-level nodes and recursively build the structure view
      this.buildRecursiveTreeStructure(this.rootListElement, node)
    })
  }

  /**
   * A recursive helper function that actually builds the structure view. It
   * traverses all graph nodes and adds the respective DOM elements in the structure
   * view component.
   * @private
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
   * @private
   */
  appendGroupElement(parentElement, groupNode) {
    // create the group
    const li = document.createElement('li')
    li.setAttribute('class', 'structure-view-group')

    // create the label
    const label = document.createElement('label')
    label.setAttribute('data-groupelement', 'group#' + this.groupElementCounter)
    label.setAttribute('class', 'structure-view-expanded')
    label.textContent =
      groupNode.labels.size > 0 ? groupNode.labels.first().text : this.labelPlaceholder
    label.addEventListener('click', () => {
      if (typeof this.$onElementClicked === 'function') {
        this.$onElementClicked(groupNode)
      }
    })

    // the collapse/expand control is done via checkbox
    const collapseBox = document.createElement('input')
    collapseBox.id = 'group#' + this.groupElementCounter
    collapseBox.type = 'checkbox'
    collapseBox.setAttribute('checked', 'true')

    // change folder icon if collapsed/expanded
    collapseBox.addEventListener('change', e => {
      label.setAttribute(
        'class',
        e.target.checked ? 'structure-view-expanded' : 'structure-view-collapsed'
      )
      if (this.syncFoldingState) {
        const masterGroupNode = this.element2node.get(collapseBox.parentNode)
        const viewGroupNode = this.foldingView.getViewItem(masterGroupNode)
        if (viewGroupNode === null) {
          return
        }
        if (!e.target.checked) {
          this.foldingView.collapse(viewGroupNode)
        } else {
          this.foldingView.expand(viewGroupNode)
        }
      } else {
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
    const children = this.masterGraph.getChildren(groupNode)
    children.forEach(child => this.buildRecursiveTreeStructure(root, child))
  }

  /**
   * Appends the given node to the parentElement.
   * @private
   */
  appendNodeElement(parentElement, node) {
    // create the element
    const nodeElement = document.createElement('li')
    nodeElement.setAttribute('class', 'structure-view-node')
    nodeElement.textContent =
      node.labels.size > 0 ? node.labels.first().text : this.labelPlaceholder
    // register the click callback
    nodeElement.addEventListener('click', () => {
      if (typeof this.$onElementClicked === 'function') {
        this.$onElementClicked(node)
      }
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
   * @private
   */
  createEditListeners() {
    this.editListeners = new Map()
    this.editListeners.set('labelAdded', (src, args) => {
      if (INode.isInstance(args.item.owner)) {
        const node = args.item.owner
        const label = this.getLabelElement(this.node2element.get(node))
        label.textContent = args.item.text
      }
    })

    this.editListeners.set('labelTextChanged', (src, args) => {
      if (INode.isInstance(args.item.owner)) {
        const node = args.item.owner
        const label = this.getLabelElement(this.node2element.get(node))
        label.textContent = args.item.text
      }
    })

    this.editListeners.set('labelRemoved', (src, args) => {
      if (INode.isInstance(args.owner)) {
        const ownerNode = args.owner
        const label = this.getLabelElement(this.node2element.get(ownerNode))
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
      if (newParentNode !== null) {
        newParentListElement = this.getListElement(this.node2element.get(newParentNode))
      }

      const element = this.node2element.get(node)
      newParentListElement.appendChild(element)
    })
  }

  /**
   * Installs listeners to update the structure view if the graph is edited.
   * The structure is updated on label editing, node creation/deletion and reparenting.
   * @private
   */
  installEditListeners() {
    this.masterGraph.addLabelAddedListener(this.editListeners.get('labelAdded'))
    this.masterGraph.addLabelTextChangedListener(this.editListeners.get('labelTextChanged'))
    this.masterGraph.addLabelRemovedListener(this.editListeners.get('labelRemoved'))
    this.masterGraph.addNodeCreatedListener(this.editListeners.get('nodeCreated'))
    this.masterGraph.addNodeRemovedListener(this.editListeners.get('nodeRemoved'))
    this.masterGraph.addParentChangedListener(this.editListeners.get('parentChanged'))
  }

  /**
   * Uninstalls listeners added in {@link installEditListeners}.
   * @private
   */
  uninstallEditListeners() {
    this.masterGraph.removeLabelAddedListener(this.editListeners.get('labelAdded'))
    this.masterGraph.removeLabelTextChangedListener(this.editListeners.get('labelTextChanged'))
    this.masterGraph.removeLabelRemovedListener(this.editListeners.get('labelRemoved'))
    this.masterGraph.removeNodeCreatedListener(this.editListeners.get('nodeCreated'))
    this.masterGraph.removeNodeRemovedListener(this.editListeners.get('nodeRemoved'))
    this.masterGraph.removeParentChangedListener(this.editListeners.get('parentChanged'))
  }

  /**
   * Gets the parent ol element for the given label element.
   * @return {HTMLOListElement}
   * @private
   */
  getListElement(parentLabel) {
    const olList = parentLabel.getElementsByTagName('ol')
    return olList.length > 0 ? olList[0] : null
  }

  /**
   * Gets the label element for the given list element.
   * @return {HTMLElement}
   * @private
   */
  getLabelElement(li) {
    const labelList = li.getElementsByTagName('label')
    return labelList.length > 0 ? labelList[0] : li
  }

  /**
   * Removes the masterNode element from the structure.
   * @private
   */
  removeNodeElement(masterNode) {
    const nodeElement = this.node2element.get(masterNode)
    // delete the node and remove the node from the map
    this.node2element.delete(masterNode)
    this.element2node.delete(nodeElement)
    nodeElement.parentNode.removeChild(nodeElement)
  }

  /**
   * Creates the DOM element for the given node and adds it to
   * the structure view.
   * @private
   */
  onNodeCreated(node) {
    // get the parent element
    let parentListElement = this.rootListElement
    const parentNode = this.masterGraph.getParent(node)
    if (parentNode !== null) {
      parentListElement = this.getListElement(this.node2element.get(parentNode))
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
   * @private
   */
  onNodeRemoved(masterNode) {
    const element = this.node2element.get(masterNode)

    const listElement = this.getListElement(element)
    if (listElement === null) {
      // delete the node
      element.parentNode.removeChild(element)
    } else {
      // move the children to the parent
      const newGroupList = element.parentNode
      while (listElement.children.length > 0) {
        newGroupList.appendChild(listElement.firstChild)
      }
      // remove the group element
      element.parentNode.removeChild(element)
    }
    // remove the node from the map
    this.node2element.delete(masterNode)
    this.element2node.delete(element)
  }

  /**
   * Sets the structured view group element state to the given collapsed state.
   * @private
   */
  toggleGroupElementState(src, args) {
    const groupNode = args.item
    const masterGroupNode = this.getMasterNode(groupNode)
    const groupLi = this.node2element.get(masterGroupNode)
    if (!groupLi) {
      return
    }
    const groupLabel = this.getLabelElement(groupLi)
    const checkboxId = groupLabel.getAttribute('data-groupelement')
    const checkboxElement = document.getElementById(checkboxId)
    checkboxElement.checked = this.foldingView.isExpanded(groupNode)
    groupLabel.setAttribute(
      'class',
      !checkboxElement.checked ? 'structure-view-collapsed' : 'structure-view-expanded'
    )
  }

  /**
   * Helper method to clear the entire structure and its internal maps.
   * @private
   */
  clearStructure() {
    while (this.rootListElement.hasChildNodes()) {
      this.rootListElement.removeChild(this.rootListElement.firstChild)
    }
    this.element2node.clear()
    this.node2element.clear()
    this.groupElementCounter = 0
  }

  /**
   * Helper method to retrieve the master node if folding is enabled.
   * @return {INode}
   * @private
   */
  getMasterNode(node) {
    return this.foldingView !== null ? this.foldingView.getMasterItem(node) : node
  }
}
