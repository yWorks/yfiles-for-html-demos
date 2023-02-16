/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  IGraph,
  ILabelStyle,
  INode,
  INodeStyle,
  Insets,
  Rect
} from 'yfiles'
import MindmapLayout from './MindmapLayout'
import type { NodeData } from './MindmapUtil'
import {
  createChild,
  createSibling,
  getSubtree,
  isCollapsed,
  isCrossReference,
  isRoot,
  removeSubtree,
  TagChangeUndoUnit
} from './MindmapUtil'

/**
 * This class holds the commands and interactions supported by the Mindmap demo.
 */
export default class DemoCommands {
  graphComponent: GraphComponent

  constructor(graphComponent: GraphComponent) {
    this.graphComponent = graphComponent
  }

  /**
   * Executes the collapse node command.
   * @param node The given node.
   * @returns true if the command is executed, false otherwise
   */
  executeToggleCollapseState(node: INode | null): boolean {
    if (node === null || typeof node === 'undefined') {
      node = this.graphComponent.selection.selectedNodes.first()
    }
    if (INode.isInstance(node)) {
      this.collapseNode(node, !isCollapsed(node))
      return true
    }
    return false
  }

  /**
   * Gets the full graph from the graph in the graph component.
   */
  getFullGraph(): IGraph {
    return (this.graphComponent.graph as FilteredGraphWrapper).wrappedGraph!
  }

  /**
   * Determines whether command ToggleCollapseState can be executed.
   * @param node The given node.
   * @returns true if the command can be executed, false otherwise
   */
  canExecuteToggleCollapseState(node: INode): boolean {
    return INode.isInstance(node) && !MindmapLayout.instance.inLayout
  }

  /**
   * Collapses or expands a node and runs a layout.
   * When a node is expanded, the subtree nodes are moved to the center position
   * of the parent node such that a smooth transition between collapsed and expanded state
   * is possible during layout.
   * @param node The given node.
   * @param collapsed True if the node is collapsed, false otherwise.
   */
  async collapseNode(node: INode, collapsed: boolean) {
    const fullGraph = this.getFullGraph()
    const compoundEdit = this.graphComponent.graph.beginEdit(
      'Collapse/Expand',
      'Collapse/Expand',
      fullGraph.nodes
    )

    const nodeData = node.tag as NodeData
    if (nodeData.isCollapsed === collapsed) {
      return
    }

    if (!collapsed) {
      // when a subtree is expanded, update the collapsed state before the layout to have the
      // animation including the nodes that are inserted
      this.setCollapsedState(node, collapsed)
    }

    // collect subtree nodes to expand/collapse them with a nice animation
    let { nodes: subtreeNodes } = getSubtree(fullGraph, node)
    subtreeNodes = subtreeNodes.filter(subtreeNode => subtreeNode !== node)

    await MindmapLayout.instance.layout(this.graphComponent, subtreeNodes, collapsed)
    if (collapsed) {
      // when a subtree is collapsed, update the collapsed state after the layout to have the
      // animation before the nodes disappear
      this.setCollapsedState(node, collapsed)
    }
    this.limitViewport()
    compoundEdit.commit()
  }

  /**
   * Sets a ViewportLimiter that makes sure that the explorable region
   * doesn't exceed the graph size.
   */
  limitViewport(): void {
    this.graphComponent.updateContentRect(new Insets(100))
    const limiter = this.graphComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = Rect.add(this.graphComponent.contentRect, this.graphComponent.viewport)
  }

  /**
   * Sets the collapsed state of a node.
   * @param node The node to set the collapsed state for.
   * @param collapsed True if the node is collapsed, false otherwise.
   */
  setCollapsedState(node: INode, collapsed: boolean): void {
    const oldData = node.tag as NodeData
    const newData = Object.assign({}, oldData)
    newData.isCollapsed = collapsed
    node.tag = newData

    // create a custom undo unit
    const graph = this.graphComponent.graph as FilteredGraphWrapper
    graph.undoEngine!.addUnit(
      new TagChangeUndoUnit('Collapse/Expand', 'Collapse/Expand', oldData, newData, node, () =>
        graph.nodePredicateChanged()
      )
    )
    // tell the filtered graph to update the graph structure
    graph.nodePredicateChanged()
  }

  /**
   * Determines whether command CreateChild can be executed.
   * @returns True if the command can be executed, false otherwise.
   */
  canExecuteCreateChildren(): boolean {
    const parent = this.graphComponent.currentItem
    return parent !== null && !MindmapLayout.instance.inLayout
  }

  /**
   * Executes CreateChild Command.
   * @returns True if the command is executed, false otherwise.
   */
  async executeCreateChildren(
    nodeStyle: INodeStyle,
    edgeStyle: IEdgeStyle,
    labelStyle: ILabelStyle
  ): Promise<boolean> {
    const parent = this.graphComponent.currentItem as INode
    const compoundEdit = this.graphComponent.graph.beginEdit('CreateChild', 'CreateChild')
    if (parent !== null) {
      const nodeData = parent.tag as NodeData
      const node = createChild(this.getFullGraph(), parent, nodeStyle, edgeStyle, labelStyle)
      this.adjustNodeBounds()
      nodeData.isCollapsed = false
      ;(this.graphComponent.graph as FilteredGraphWrapper).nodePredicateChanged()
      await MindmapLayout.instance.layout(this.graphComponent)
      this.limitViewport()
      if (this.graphComponent.inputMode instanceof GraphEditorInputMode && node.labels.size > 0) {
        this.graphComponent.inputMode.editLabel(node.labels.get(0))
      }
      compoundEdit.commit()
      return true
    }
    compoundEdit.cancel()
    return false
  }

  /**
   * Adjusts all node sizes to fit their labels' preferred size.
   */
  adjustNodeBounds(): void {
    const fullGraph = this.getFullGraph()
    fullGraph.nodes.forEach(node => {
      if (node.labels.size > 0) {
        const label = node.labels.get(0)
        const preferredSize = label.style.renderer.getPreferredSize(label, label.style)
        fullGraph.setLabelPreferredSize(label, preferredSize)
        if (!isRoot(node)) {
          // enlarge bounds
          fullGraph.setNodeLayout(
            node,
            new Rect(
              node.layout.x,
              node.layout.y,
              preferredSize.width + 3,
              preferredSize.height + 3
            )
          )
        }
      }
    })
  }

  /**
   * Determines whether command DeleteItem can be executed.
   * @returns True if the command can be executed, false otherwise.
   */
  canExecuteDeleteItem(): boolean {
    const edge = this.graphComponent.selection.selectedEdges.at(0)
    const node = this.graphComponent.selection.selectedNodes.at(0)

    return (
      (edge != null && !MindmapLayout.instance.inLayout && isCrossReference(edge)) ||
      (node != null && !MindmapLayout.instance.inLayout && !isRoot(node))
    )
  }

  /**
   * Executes DeleteItem Command.
   * @returns True if the command is executed, false otherwise.
   */
  async executeDeleteItem(): Promise<boolean> {
    const edge = this.graphComponent.selection.selectedEdges.at(0)
    const compoundEdit = this.graphComponent.graph.beginEdit('DeleteItem', 'DeleteItem')
    if (edge) {
      this.graphComponent.graph.remove(edge)
      await MindmapLayout.instance.layout(this.graphComponent)
      this.limitViewport()
      compoundEdit.commit()
    }

    const node = this.graphComponent.selection.selectedNodes.at(0)
    if (node) {
      removeSubtree(this.getFullGraph(), node)
      await MindmapLayout.instance.layout(this.graphComponent)
      this.limitViewport()
      compoundEdit.commit()
    }
    return true
  }

  /**
   * Determines whether command ExpandNode can be executed.
   * @returns True if the command can be executed, false otherwise.
   */
  canExecuteExpandNode(): boolean {
    const node = this.graphComponent.selection.selectedNodes.at(0)
    return node != null && isCollapsed(node) && !MindmapLayout.instance.inLayout
  }

  /**
   * Executes ExpandNode Command.
   * @returns True if the command is executed, false otherwise.
   */
  executeExpandNode(): boolean {
    const node = this.graphComponent.selection.selectedNodes.at(0)
    if (node) {
      this.collapseNode(node, false)
      return true
    }
    return false
  }

  /**
   * Determines whether command CollapseNode can be executed.
   * @returns True if the command can be executed, false otherwise.
   */
  canExecuteCollapseNode(): boolean {
    const node = this.graphComponent.selection.selectedNodes.at(0)
    return node != null && !isCollapsed(node) && !MindmapLayout.instance.inLayout
  }

  /**
   * Executes CollapseNode Command.
   * @returns True if the command is executed, false otherwise.
   */
  executeCollapseNode(): boolean {
    const node = this.graphComponent.selection.selectedNodes.at(0)
    if (node) {
      this.collapseNode(node, true)
      return true
    }
    return false
  }

  /**
   * Determines whether command CreateSibling can be executed.
   * @returns True if the command can be executed, false otherwise.
   */
  canExecuteCreateSibling(): boolean {
    const node = this.graphComponent.selection.selectedNodes.at(0)
    return node != null && !isRoot(node) && !MindmapLayout.instance.inLayout
  }

  /**
   * Executes CreateSibling Command.
   * @param nodeStyle The desired node style
   * @param edgeStyle The desired edge style.
   * @param labelStyle The desired label style.
   * @returns True if the command is executed, false otherwise.
   */
  async executeCreateSibling(
    nodeStyle: INodeStyle,
    edgeStyle: IEdgeStyle,
    labelStyle: ILabelStyle
  ): Promise<boolean> {
    const node = this.graphComponent.selection.selectedNodes.first()
    const nodeData = node.tag as NodeData
    const sibling = createSibling(this.getFullGraph(), node, nodeStyle, edgeStyle, labelStyle)
    if (sibling !== null) {
      this.adjustNodeBounds()
      nodeData.isCollapsed = false
      ;(this.graphComponent.graph as FilteredGraphWrapper).nodePredicateChanged()
      await MindmapLayout.instance.layout(this.graphComponent)
      this.limitViewport()
      if (
        this.graphComponent.inputMode instanceof GraphEditorInputMode &&
        sibling.labels.size > 0
      ) {
        this.graphComponent.inputMode.editLabel(sibling.labels.get(0))
      }
      return true
    }
    return false
  }

  /**
   * The click handler for a click on a state label in the state label popup menu.
   * @param stateLabelIndex The index into the icon list {@link StateLabelDecorator.STATE_ICONS}.
   */
  async onStateLabelClicked(stateLabelIndex: number) {
    const node = this.graphComponent.currentItem as INode
    if (node !== null) {
      const compoundEdit = this.getFullGraph().beginEdit(
        'Set State Label',
        'Set State Label',
        this.getFullGraph().nodes
      )
      this.setStateLabel(node, stateLabelIndex)
      await MindmapLayout.instance.layout(this.graphComponent)
      compoundEdit.commit()
      this.limitViewport()
    }
  }

  /**
   * Sets the state label for a node.
   * @param node The node to set the state label for.
   * @param stateIconIndex The index into the icon list {@link StateLabelDecorator.STATE_ICONS}.
   */
  setStateLabel(node: INode, stateIconIndex: number) {
    const oldData = node.tag as NodeData
    const newData = Object.assign({}, oldData)
    newData.stateIcon = stateIconIndex
    node.tag = newData

    // create a custom undo unit
    this.graphComponent.graph.undoEngine!.addUnit(
      new TagChangeUndoUnit('Set State Label', 'Set State Label', oldData, newData, node, null)
    )
    this.adjustNodeBounds()
  }
}
