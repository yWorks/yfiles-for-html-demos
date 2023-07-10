/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FilteredGraphWrapper,
  GraphComponent,
  GraphEditorInputMode,
  IEdgeStyle,
  ILabelStyle,
  INode,
  INodeStyle,
  Key
} from 'yfiles'
import { isInLayout, layoutTree } from '../mind-map-layout.js'
import {
  getDepth,
  getNodeData,
  isCollapsed,
  isCrossReference,
  isRoot,
  setNodeData
} from '../data-types.js'
import { TagChangeUndoUnit } from './TagChangeUndoUnit.js'
import { getEdgeStyle, getLabelStyle, getNodeStyle } from '../styles/styles-support.js'
import { hidePopup } from '../node-popup-toolbar.js'
import {
  adjustNodeBounds,
  collapseSubtree,
  createChild,
  createSibling,
  getFullGraph,
  getSubtree,
  removeSubtree
} from '../subtrees.js'

/**
 * Adds key bindings for creating new nodes and collapsing/expanding child nodes.
 * @param {!GraphComponent} graphComponent
 */
export function initializeCommands(graphComponent) {
  const inputMode = graphComponent.inputMode
  const keyboardInputMode = inputMode.keyboardInputMode

  // create a child node when INSERT is pressed
  keyboardInputMode.addKeyBinding({
    key: Key.INSERT,
    execute: _ => {
      const currentItem = graphComponent.currentItem
      if (currentItem) {
        const depth = getDepth(currentItem)
        void executeCreateChild(
          getNodeStyle(depth + 1),
          getEdgeStyle(depth),
          getLabelStyle(depth + 1),
          graphComponent
        )
      }
      return true
    },
    canExecute: _ => canExecuteCreateChild(graphComponent)
  })

  // remove a child node when DELETE is pressed
  keyboardInputMode.addKeyBinding({
    key: Key.DELETE,
    execute: _ => {
      hidePopup(graphComponent)
      void executeDeleteItem(graphComponent)
      return true
    },
    canExecute: _ => canExecuteDeleteItem(graphComponent)
  })

  // expand the subtree when ADD is pressed
  keyboardInputMode.addKeyBinding({
    key: Key.ADD,
    execute: _ => executeExpandNode(graphComponent),
    canExecute: _ => canExecuteExpandNode(graphComponent)
  })

  // collapse the subtree when SUBTRACT is pressed
  keyboardInputMode.addKeyBinding({
    key: Key.SUBTRACT,
    execute: _ => executeCollapseNode(graphComponent),
    canExecute: _ => canExecuteCollapseNode(graphComponent)
  })

  // create a sibling node when ENTER is pressed
  keyboardInputMode.addKeyBinding({
    key: Key.ENTER,
    execute: _ => {
      const currentItem = graphComponent.currentItem
      if (currentItem) {
        const depth = getDepth(currentItem)
        void executeCreateSibling(
          getNodeStyle(depth),
          getEdgeStyle(depth - 1),
          getLabelStyle(depth),
          graphComponent
        )
      }
      return true
    },
    canExecute: _ => canExecuteCreateSibling(graphComponent)
  })
}

/**
 * Determines whether the collapse/expand node command can be executed.
 * @returns {boolean} true if there is a node to collapse/expand and no layout is currently running.
 * @see executeToggleCollapseState
 * @param {!GraphComponent} graphComponent
 * @param {!INode} [node]
 */
export function canExecuteToggleCollapseState(graphComponent, node) {
  return !isInLayout() && (!!node || graphComponent.selection.selectedNodes.size > 0)
}

/**
 * Executes the collapse/expand node command.
 * When the node - or alternatively the selected node - was expanded,
 * it is collapsed and all its descendants are hidden.
 * In case it was collapsed, its descendants become visible.
 * @see canExecuteToggleCollapseState
 * @param {!GraphComponent} graphComponent
 * @param {!INode} [node]
 * @returns {boolean}
 */
export function executeToggleCollapseState(graphComponent, node) {
  if (!node) {
    node = graphComponent.selection.selectedNodes.at(0)
  }
  void collapseNode(node, !isCollapsed(node), graphComponent)
  return true
}

/**
 * Collapses/expands a node and updates the layout.
 * When a node is expanded, the subtree nodes appear at the center position
 * of the parent node and move to their positions in the updated layout afterwards.
 * When it is collapsed, the subtree moves to the parent node. That way, a smooth transition between
 * collapsed and expanded state is possible.
 * @see executeToggleCollapseState
 * @param {!INode} node
 * @param {boolean} collapsed
 * @param {!GraphComponent} graphComponent
 */
async function collapseNode(node, collapsed, graphComponent) {
  const fullGraph = getFullGraph(graphComponent)

  const compoundEdit = graphComponent.graph.beginEdit(
    'Collapse/Expand',
    'Collapse/Expand',
    fullGraph.nodes
  )

  if (isCollapsed(node) === collapsed) {
    // there was no state change
    return
  }

  if (!collapsed) {
    // when a subtree is expanded, update the collapsed state before the layout to include the
    // inserted nodes in the animation
    collapseSubtree(node, collapsed, graphComponent.graph)
  }

  // collect subtree nodes to expand/collapse them with a nice animation
  let { nodes: subtreeNodes } = getSubtree(fullGraph, node)
  subtreeNodes = subtreeNodes.filter(subtreeNode => subtreeNode !== node)

  // update the layout
  await layoutTree(graphComponent, subtreeNodes, collapsed)

  if (collapsed) {
    // when a subtree is collapsed, update the collapsed state after the layout to have the
    // animation before the nodes disappear
    collapseSubtree(node, collapsed, graphComponent.graph)
  }
  compoundEdit.commit()
}

/**
 * Determines whether the create child command can be executed.
 * @returns {boolean} True if there is a parent node and no layout is currently running.
 * @see executeCreateChild
 * @param {!GraphComponent} graphComponent
 */
function canExecuteCreateChild(graphComponent) {
  const parent = graphComponent.currentItem
  return !!parent && !isInLayout()
}

/**
 * Executes the create child command.
 * A new child node is created, connected to the current node, and the label editor is opened.
 * @see canExecuteCreateChild
 * @param {!INodeStyle} nodeStyle
 * @param {!IEdgeStyle} edgeStyle
 * @param {!ILabelStyle} labelStyle
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise.<boolean>}
 */
export async function executeCreateChild(nodeStyle, edgeStyle, labelStyle, graphComponent) {
  const fullGraph = getFullGraph(graphComponent)
  const parent = graphComponent.currentItem

  const compoundEdit = graphComponent.graph.beginEdit('CreateChild', 'CreateChild')

  if (parent) {
    const parentData = getNodeData(parent)
    parentData.collapsed = false
    graphComponent.graph.nodePredicateChanged(parent)

    const node = createChild(fullGraph, parent, nodeStyle, edgeStyle, labelStyle)

    // update layout
    await layoutTree(graphComponent)

    // open label editor after the child node is created
    const inputMode = graphComponent.inputMode
    if (inputMode && node.labels.size > 0) {
      void inputMode.editLabel(node.labels.get(0))
    }

    compoundEdit.commit()
    return true
  }
  compoundEdit.cancel()
  return false
}

/**
 * Determines whether the delete item command can be executed.
 * @returns {boolean} True if there are selected elements and no layout is currently running.
 * @see executeDeleteItem
 * @param {!GraphComponent} graphComponent
 */
function canExecuteDeleteItem(graphComponent) {
  const selection = graphComponent.selection
  const edge = selection.selectedEdges.at(0)
  const node = selection.selectedNodes.at(0)

  return !isInLayout() && ((!!edge && isCrossReference(edge)) || (!!node && !isRoot(node)))
}

/**
 * Executes the delete item command.
 * The selected node/edge is removed and the layout is updated.
 * @see canExecuteDeleteItem
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise.<boolean>}
 */
export async function executeDeleteItem(graphComponent) {
  const edge = graphComponent.selection.selectedEdges.at(0)

  const compoundEdit = graphComponent.graph.beginEdit('DeleteItem', 'DeleteItem')

  if (edge) {
    graphComponent.graph.remove(edge)
    await layoutTree(graphComponent)
    compoundEdit.commit()
  }

  const node = graphComponent.selection.selectedNodes.at(0)
  if (node) {
    removeSubtree(getFullGraph(graphComponent), node)
    await layoutTree(graphComponent)
    compoundEdit.commit()
  }
  return true
}

/**
 * Determines whether the expand node command can be executed.
 * @returns {boolean} True if there is a collapsed node that is selected and no layout is currently running.
 * @see executeExpandNode
 * @param {!GraphComponent} graphComponent
 */
function canExecuteExpandNode(graphComponent) {
  const node = graphComponent.selection.selectedNodes.at(0)
  return !!node && isCollapsed(node) && !isInLayout()
}

/**
 * Executes the expand node command.
 * The descendants of the selected node become visible.
 * @see canExecuteExpandNode
 * @param {!GraphComponent} graphComponent
 * @returns {boolean}
 */
function executeExpandNode(graphComponent) {
  const node = graphComponent.selection.selectedNodes.at(0)
  if (node) {
    void collapseNode(node, false, graphComponent)
    return true
  }
  return false
}

/**
 * Determines whether the collapse node command can be executed.
 * @returns {boolean} True if there is an expanded node that is selected and no layout is currently running.
 * @see executeCollapseNode
 * @param {!GraphComponent} graphComponent
 */
function canExecuteCollapseNode(graphComponent) {
  const node = graphComponent.selection.selectedNodes.at(0)
  return !!node && !isCollapsed(node) && !isInLayout()
}

/**
 * Executes the collapse node command.
 * The descendants of the selected node are hidden.
 * @see canExecuteCollapseNode
 * @param {!GraphComponent} graphComponent
 * @returns {boolean}
 */
function executeCollapseNode(graphComponent) {
  const node = graphComponent.selection.selectedNodes.at(0)
  if (node) {
    void collapseNode(node, true, graphComponent)
    return true
  }
  return false
}

/**
 * Determines whether the create sibling command can be executed.
 * @returns {boolean} True if there is a selected node that is not the root node
 * and no layout is currently running
 * @see executeCreateSibling
 * @param {!GraphComponent} graphComponent
 */
function canExecuteCreateSibling(graphComponent) {
  const node = graphComponent.selection.selectedNodes.at(0)
  return !!node && !isRoot(node) && !isInLayout()
}

/**
 * Executes the create sibling command.
 * A new node is created and connected to the parent of the selected node.
 * @see canExecuteCreateSibling
 * @param {!INodeStyle} nodeStyle
 * @param {!IEdgeStyle} edgeStyle
 * @param {!ILabelStyle} labelStyle
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise.<boolean>}
 */
async function executeCreateSibling(nodeStyle, edgeStyle, labelStyle, graphComponent) {
  const node = graphComponent.selection.selectedNodes.first()
  const nodeData = getNodeData(node)
  const fullGraph = getFullGraph(graphComponent)

  const compoundEdit = graphComponent.graph.beginEdit('CreateSibling', 'CreateSibling')

  const sibling = createSibling(fullGraph, node, nodeStyle, edgeStyle, labelStyle)
  if (sibling) {
    nodeData.collapsed = false
    graphComponent.graph.nodePredicateChanged()

    // update layout
    await layoutTree(graphComponent)

    // open label editor after the sibling is created
    if (graphComponent.inputMode instanceof GraphEditorInputMode && sibling.labels.size > 0) {
      void graphComponent.inputMode.editLabel(sibling.labels.get(0))
    }

    compoundEdit.commit()
    return true
  }
  compoundEdit.cancel()
  return false
}

/**
 * Changes the state label and updates the layout.
 * @param {number} stateLabelIndex
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
export async function changeStateLabel(stateLabelIndex, graphComponent) {
  const node = graphComponent.currentItem
  if (node) {
    const compoundEdit = getFullGraph(graphComponent).beginEdit(
      'Set State Label',
      'Set State Label',
      getFullGraph(graphComponent).nodes
    )
    setStateLabel(node, stateLabelIndex, graphComponent)
    await layoutTree(graphComponent)
    compoundEdit.commit()
  }
}

/**
 * Sets the state label described by the state icon index for a node.
 * @param {!INode} node
 * @param {number} stateIconIndex
 * @param {!GraphComponent} graphComponent
 */
function setStateLabel(node, stateIconIndex, graphComponent) {
  const oldData = getNodeData(node)
  const newData = { ...oldData, stateIcon: stateIconIndex }
  setNodeData(node, newData)

  // create a custom undo unit
  const filteredGraph = graphComponent.graph
  filteredGraph.undoEngine.addUnit(
    new TagChangeUndoUnit('Set State Label', 'Set State Label', oldData, newData, node)
  )

  const fullGraph = getFullGraph(graphComponent)
  adjustNodeBounds(node, fullGraph)
}
