/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component', './MindmapUtil.js', './MindmapLayout.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  MindmapUtil,
  MindmapLayout
) => {
  /**
   * This class holds the commands and interactions supported by the Mindmap demo.
   */
  class DemoCommands {
    constructor(graphComponent) {
      this.graphComponent = graphComponent
    }

    /**
     * Executes the collapse node command.
     * @param {yfiles.graph.INode} node The given node.
     * @return {boolean} true if the command is executed, false otherwise
     */
    executeToggleCollapseState(node) {
      if (node === null || typeof node === 'undefined') {
        node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      }
      if (yfiles.graph.INode.isInstance(node)) {
        this.collapseNode(node, !MindmapUtil.Structure.isCollapsed(node))
        return true
      }
      return false
    }

    /**
     * Gets the full graph from the context.
     * @return {yfiles.graph.IGraph}
     */
    getFullGraph() {
      let /** @type {yfiles.graph.IGraph} */ graph = this.graphComponent.graph
      if (graph instanceof yfiles.graph.FilteredGraphWrapper) {
        graph = graph.wrappedGraph
      }
      return graph
    }

    /**
     * Determines whether command ToggleCollapseState can be executed.
     * @param {yfiles.graph.INode} node The given node.
     * @return {boolean} true if the command can be executed, false otherwise
     */
    canExecuteToggleCollapseState(node) {
      return yfiles.graph.INode.isInstance(node) && !MindmapLayout.instance.inLayout
    }

    /**
     * Collapses or expands a node and runs a layout.
     * When a node is expanded, the subtree nodes are moved to the center position
     * of the parent node such that a smooth transition between collapsed and expanded state
     * is possible during layout.
     * @param {yfiles.graph.INode} node The given node.
     * @param {boolean} collapsed True if the node is collapsed, false otherwise.
     */
    collapseNode(node, collapsed) {
      const fullGraph = this.getFullGraph()
      const compoundEdit = this.graphComponent.graph.beginEdit(
        'Collapse/Expand',
        'Collapse/Expand',
        fullGraph.nodes
      )

      const nodeData = node.tag
      if (nodeData.isCollapsed === collapsed) {
        return
      }

      if (!collapsed) {
        // when a subtree is expanded, update the collapsed state before the layout to have the
        // animation including the nodes that are inserted
        this.setCollapsedState(node, collapsed)
      }

      // collect subtree nodes to expand/collapse them with a nice animation
      let subtreeNodes = new yfiles.collections.List()
      const subTreeEdges = new yfiles.collections.List()
      MindmapUtil.Structure.getSubtree(fullGraph, node, subtreeNodes, subTreeEdges)
      subtreeNodes = subtreeNodes.filter(subtreeNode => subtreeNode !== node)

      MindmapLayout.instance.layout(this.graphComponent, subtreeNodes, collapsed).then(() => {
        if (collapsed) {
          // when a subtree is collapsed, update the collapsed state after the layout to have the
          // animation before the nodes disappear
          this.setCollapsedState(node, collapsed)
        }
        this.limitViewport()
        compoundEdit.commit()
      })
    }

    /**
     * Sets a ViewportLimiter that makes sure that the explorable region
     * doesn't exceed the graph size.
     */
    limitViewport() {
      this.graphComponent.updateContentRect(new yfiles.geometry.Insets(100))
      const limiter = this.graphComponent.viewportLimiter
      limiter.honorBothDimensions = false
      limiter.bounds = yfiles.geometry.Rect.add(
        this.graphComponent.contentRect,
        this.graphComponent.viewport
      )
    }

    /**
     * Sets the collapsed state of a node.
     * @param {yfiles.graph.INode} node The node to set the collapsed state for.
     * @param {boolean} collapsed True if the node is collapsed, false otherwise.
     */
    setCollapsedState(node, collapsed) {
      const oldData = node.tag
      const newData = {
        depth: oldData.depth,
        isLeft: oldData.isLeft,
        color: oldData.color,
        isCollapsed: oldData.isCollapsed,
        stateIcon: oldData.stateIcon
      }
      newData.isCollapsed = collapsed
      node.tag = newData

      // create a custom undo unit
      this.graphComponent.graph.undoEngine.addUnit(
        new MindmapUtil.TagChangeUndoUnit(
          'Collapse/Expand',
          'Collapse/Expand',
          oldData,
          newData,
          node,
          () => {
            this.graphComponent.graph.nodePredicateChanged()
          }
        )
      )
      // tell the filtered graph to update the graph structure
      this.graphComponent.graph.nodePredicateChanged()
    }

    /**
     * Determines whether command CreateChild can be executed.
     * @return {boolean} True if the command can be executed, false otherwise.
     */
    canExecuteCreateChildren() {
      const parent = this.graphComponent.currentItem
      return parent !== null && !MindmapLayout.instance.inLayout
    }

    /**
     * Executes CreateChild Command.
     * @return {boolean} True if the command is executed, false otherwise.
     */
    executeCreateChildren(nodeStyle, edgeStyle, labelStyle) {
      const parent = this.graphComponent.currentItem
      const compoundEdit = this.graphComponent.graph.beginEdit('CreateChild', 'CreateChild')
      if (parent !== null) {
        const nodeData = parent.tag
        const node = MindmapUtil.Structure.createChild(
          this.getFullGraph(),
          parent,
          nodeStyle,
          edgeStyle,
          labelStyle
        )
        this.adjustNodeBounds()
        nodeData.isCollapsed = false
        this.graphComponent.graph.nodePredicateChanged()
        MindmapLayout.instance.layout(this.graphComponent).then(() => {
          this.limitViewport()
          if (
            this.graphComponent.inputMode instanceof yfiles.input.GraphEditorInputMode &&
            node.labels.size > 0
          ) {
            this.graphComponent.inputMode.editLabel(node.labels.get(0))
          }
          compoundEdit.commit()
        })
        return true
      }
      compoundEdit.cancel()
      return false
    }

    /**
     * Adjusts all node sizes to fit their labels' preferred size.
     */
    adjustNodeBounds() {
      const fullGraph = this.getFullGraph()
      fullGraph.nodes.forEach(node => {
        if (node.labels.size > 0) {
          const label = node.labels.get(0)
          const preferredSize = label.style.renderer.getPreferredSize(label, label.style)
          fullGraph.setLabelPreferredSize(label, preferredSize)
          if (!MindmapUtil.Structure.isRoot(node)) {
            // enlarge bounds
            fullGraph.setNodeLayout(
              node,
              new yfiles.geometry.Rect(
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
     * @return {boolean} True if the command can be executed, false otherwise.
     */
    canExecuteDeleteItem() {
      const edge = this.graphComponent.selection.selectedEdges.firstOrDefault()
      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()

      return (
        (edge !== null &&
          !MindmapLayout.instance.inLayout &&
          MindmapUtil.Structure.isCrossReference(edge)) ||
        (node !== null && !MindmapLayout.instance.inLayout && !MindmapUtil.Structure.isRoot(node))
      )
    }

    /**
     * Executes DeleteItem Command.
     * @return {boolean} True if the command is executed, false otherwise.
     */
    executeDeleteItem() {
      const edge = this.graphComponent.selection.selectedEdges.firstOrDefault()
      const compoundEdit = this.graphComponent.graph.beginEdit('DeleteItem', 'DeleteItem')
      if (edge !== null) {
        this.graphComponent.graph.remove(edge)
        MindmapLayout.instance.layout(this.graphComponent).then(() => {
          this.limitViewport()
          compoundEdit.commit()
        })
      }

      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      if (node !== null) {
        MindmapUtil.Structure.removeSubtree(this.graphComponent.graph, node)
        MindmapLayout.instance.layout(this.graphComponent).then(() => {
          this.limitViewport()
          compoundEdit.commit()
        })
      }
      return true
    }

    /**
     * Determines whether command ExpandNode can be executed.
     * @return {boolean} True if the command can be executed, false otherwise.
     */
    canExecuteExpandNode() {
      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      return (
        node !== null && MindmapUtil.Structure.isCollapsed(node) && !MindmapLayout.instance.inLayout
      )
    }

    /**
     * Executes ExpandNode Command.
     * @return {boolean} True if the command is executed, false otherwise.
     */
    executeExpandNode() {
      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      if (node !== null) {
        this.collapseNode(node, false)
        return true
      }
      return false
    }

    /**
     * Determines whether command CollapseNode can be executed.
     * @return {boolean} True if the command can be executed, false otherwise.
     */
    canExecuteCollapseNode() {
      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      return (
        node !== null &&
        !MindmapUtil.Structure.isCollapsed(node) &&
        !MindmapLayout.instance.inLayout
      )
    }

    /**
     * Executes CollapseNode Command.
     * @return {boolean} True if the command is executed, false otherwise.
     */
    executeCollapseNode() {
      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      if (node !== null) {
        this.collapseNode(node, true)
        return true
      }
      return false
    }

    /**
     * Determines whether command CreateSibling can be executed.
     * @return {boolean} True if the command can be executed, false otherwise.
     */
    canExecuteCreateSibling() {
      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      return (
        node !== null && !MindmapUtil.Structure.isRoot(node) && !MindmapLayout.instance.inLayout
      )
    }

    /**
     * Executes CreateSibling Command.
     * @param {yfiles.styles.INodeStyle} nodeStyle The desired node style
     * @param {yfiles.styles.IEdgeStyle} edgeStyle The desired edge style.
     * @param {yfiles.styles.ILabelStyle} labelStyle The desired label style.
     * @return {boolean} True if the command is executed, false otherwise.
     */
    executeCreateSibling(nodeStyle, edgeStyle, labelStyle) {
      const node = this.graphComponent.selection.selectedNodes.firstOrDefault()
      const nodeData = node.tag
      const sibling = MindmapUtil.Structure.createSibling(
        this.getFullGraph(),
        node,
        nodeStyle,
        edgeStyle,
        labelStyle
      )
      if (sibling !== null) {
        this.adjustNodeBounds()
        nodeData.isCollapsed = false
        this.graphComponent.graph.nodePredicateChanged()
        MindmapLayout.instance.layout(this.graphComponent).then(() => {
          this.limitViewport()
          if (
            this.graphComponent.inputMode instanceof yfiles.input.GraphEditorInputMode &&
            sibling.labels.size > 0
          ) {
            this.graphComponent.inputMode.editLabel(sibling.labels.get(0))
          }
        })
        return true
      }
      return false
    }

    /**
     * The click handler for a click on a state label in the state label popup menu.
     * @param {number} stateLabelIndex The index into the icon list {@link StateLabelDecorator#STATE_ICONS}.
     */
    onStateLabelClicked(stateLabelIndex) {
      const node = this.graphComponent.currentItem
      if (node !== null) {
        const compoundEdit = this.getFullGraph().beginEdit(
          'Set State Label',
          'Set State Label',
          this.getFullGraph().nodes
        )
        this.setStateLabel(node, stateLabelIndex)
        MindmapLayout.instance.layout(this.graphComponent).then(() => {
          compoundEdit.commit()
          this.limitViewport()
        })
      }
    }

    /**
     * Sets the state label for a node.
     * @param {yfiles.graph.INode} node The node to set the state label for.
     * @param {number} stateIconIndex The index into the icon list {@link StateLabelDecorator#STATE_ICONS}.
     */
    setStateLabel(node, stateIconIndex) {
      const oldData = node.tag
      const newData = {
        depth: oldData.depth,
        isLeft: oldData.isLeft,
        color: oldData.color,
        isCollapsed: oldData.isCollapsed,
        stateIcon: oldData.stateIcon
      }
      newData.stateIcon = stateIconIndex
      node.tag = newData

      // create a custom undo unit
      this.graphComponent.graph.undoEngine.addUnit(
        new MindmapUtil.TagChangeUndoUnit(
          'Set State Label',
          'Set State Label',
          oldData,
          newData,
          node,
          null
        )
      )
      this.adjustNodeBounds()
    }
  }

  return DemoCommands
})
