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
  type GraphComponent,
  type GraphEditorInputMode,
  type IEdge,
  type IEdgeStyle,
  type IGraph,
  type ILabelStyle,
  type INode,
  type INodeStyle,
  InteriorLabelModel,
  Rect,
  TreeAnalysis
} from 'yfiles'
import {
  getDepth,
  getNodeData,
  isCrossReference,
  isLeft,
  isRoot,
  type NodeData,
  setNodeData
} from './data-types'
import { getEdgeStyle, updateStyles } from './styles/styles-support'
import { TagChangeUndoUnit } from './interaction/TagChangeUndoUnit'
import { layoutTree } from './mind-map-layout'
import { SubtreePositionHandler } from './interaction/MindMapPositionHandlers'

/**
 * Initializes the movement of subtrees.
 * A node can be dragged and relocated with its whole subtree to another part of the tree.
 */
export function initializeSubtrees(graphComponent: GraphComponent): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  // register handlers for dragging and relocating subtrees
  inputMode.moveInputMode.addDragStartedListener((_) => prepareRelocateSubtree(graphComponent))
  inputMode.moveInputMode.addDraggedListener((_) => updateSubtreeStylesAndLayout(graphComponent))
  inputMode.moveInputMode.addDragCanceledListener((_) => resetSubtree(graphComponent))
  inputMode.moveInputMode.addDragFinishedListener((_) => relocateSubtree(graphComponent))

  // customize the position handler to move a whole subtree and update the styles and layout
  const filteredGraph = graphComponent.graph as FilteredGraphWrapper
  filteredGraph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
    (item, implementation) => {
      return !isRoot(item) ? new SubtreePositionHandler(implementation!) : null
    }
  )
}

/**
 * Holds the subtree's root node that is dragged.
 * When no node is currently dragged, it is reset to <code>undefined</code>.
 */
let movedNode: INode | undefined

/**
 * Holds the old node data.
 * This helps to restore any changes when reverting a drag operation with undo.
 */
let oldNodeData: NodeData

/**
 * Holds the style of the subtree root's in-edge to be able to restore it after the drag is canceled.
 */
let oldInEdgeStyle: IEdgeStyle | undefined

/**
 * Prepares to move the selected node and its subtree.
 * Information about the subtree is stored that helps undo or reset the relocation gesture.
 */
export function prepareRelocateSubtree(graphComponent: GraphComponent): void {
  movedNode = graphComponent.selection.selectedNodes.at(0)
  if (movedNode) {
    // store the current node data to be able to undo
    const oldData = getNodeData(movedNode)
    oldNodeData = { ...oldData }

    // store the style of the current in edge of the subtree root to be able to cancel the gesture
    const inEdge = graphComponent.graph.inEdgesAt(movedNode).at(0)
    if (inEdge) {
      oldInEdgeStyle = inEdge.style
    }
  }
}

/**
 * Updates the styles while a subtree is moved.
 * The styles of nodes and edges change with the position of the nodes within the tree and need to
 * be updated when these positions change during a drag.
 */
export function updateSubtreeStylesAndLayout(graphComponent: GraphComponent): void {
  const fullGraph = getFullGraph(graphComponent)
  const subtreeEdge = getInEdge(movedNode!, fullGraph)
  if (subtreeEdge) {
    // update the depths and styles according to the new potential parent of the subtree root
    const depth = getDepth(subtreeEdge.sourceNode!)
    setSubtreeDepths(fullGraph, movedNode!, depth + 1)
    updateStyles(movedNode!, fullGraph)
    fullGraph.setStyle(subtreeEdge, getEdgeStyle(depth))
  }
}

/**
 * Relocates the subtree when a new parent candidate was found, otherwise the subtree is deleted.
 */
export async function relocateSubtree(graphComponent: GraphComponent): Promise<void> {
  const filteredGraph = graphComponent.graph as FilteredGraphWrapper
  const fullGraph = getFullGraph(graphComponent)
  graphComponent.selection.clear()

  // begin a compound undo operation
  const compoundEdit = graphComponent.graph.beginEdit('Set State Label', 'Set State Label')

  const subtreeEdge = getInEdge(movedNode!, fullGraph)
  if (subtreeEdge) {
    // update the depths and styles according to the new parent of the subtree root
    setSubtreeDepths(fullGraph, movedNode!, getDepth(subtreeEdge.sourceNode!) + 1)
    updateStyles(movedNode!, fullGraph)
    adjustNodeBounds(movedNode!, fullGraph)
    collapseSubtree(subtreeEdge.sourceNode!, false, filteredGraph)

    // add an undo unit because the node data has changed
    const newNodeData = getNodeData(movedNode!)
    graphComponent.graph.undoEngine!.addUnit(
      new TagChangeUndoUnit(
        'Set State Label',
        'Set State Label',
        oldNodeData!,
        newNodeData,
        movedNode!,
        (node: INode) =>
          getSubtree(fullGraph, node).nodes.forEach((n) => {
            const nData = getNodeData(n)
            nData.left = isLeft(node)
          })
      )
    )
  } else {
    // there is no connection to the rest of the tree anymore

    // add an undo unit because the node data has changed during the drag
    const newTagData = getNodeData(movedNode!)
    graphComponent.graph.undoEngine!.addUnit(
      new TagChangeUndoUnit(
        'Set State Label',
        'Set State Label',
        oldNodeData!,
        newTagData,
        movedNode!,
        (node: INode) => filteredGraph.nodePredicateChanged(node)
      )
    )

    // delete the whole subtree
    removeSubtree(fullGraph, movedNode!)
  }

  // update the layout
  await layoutTree(graphComponent)

  compoundEdit.commit()

  movedNode = undefined
}

/**
 * Reverts the relocation of the subtree when the gesture is cancelled.
 * The depths and styles of the subtree nodes are restored,
 * and the subtree returns to its initial location.
 */
export function resetSubtree(graphComponent: GraphComponent): void {
  graphComponent.selection.clear()
  const filteredGraph = graphComponent.graph as FilteredGraphWrapper
  const fullGraph = getFullGraph(graphComponent)
  const subtreeEdge = getInEdge(movedNode!, fullGraph)
  if (subtreeEdge) {
    setSubtreeDepths(fullGraph, movedNode!, getDepth(subtreeEdge.sourceNode!) + 1)
    updateStyles(movedNode!, fullGraph)
    adjustNodeBounds(movedNode!, fullGraph)
    collapseSubtree(subtreeEdge.sourceNode!, false, filteredGraph)
    // reset the in-edge's old style
    fullGraph.setStyle(subtreeEdge, oldInEdgeStyle!)
  }
  movedNode = undefined
  oldInEdgeStyle = undefined
}

/**
 * Marks the given node as collapsed, which will result in hiding all of its children.
 */
export function collapseSubtree(
  node: INode,
  collapsed: boolean,
  filteredGraph: FilteredGraphWrapper
): void {
  const oldData = node.tag as NodeData
  const newData = { ...oldData, collapsed: collapsed }
  setNodeData(node, newData)

  // create a custom undo unit since the node data changed
  filteredGraph.undoEngine!.addUnit(
    new TagChangeUndoUnit('Collapse/Expand', 'Collapse/Expand', oldData, newData, node, (): void =>
      filteredGraph.nodePredicateChanged()
    )
  )

  // tell the filtered graph to update the graph structure
  filteredGraph.nodePredicateChanged()
}

/**
 * Returns the mind map root node.
 */
export function getRoot(graph: IGraph): INode {
  // find the first node with no incoming mind map edges
  return graph.nodes.find((node) => !getInEdge(node, graph))!
}

/**
 * Creates the arrays containing the nodes and edges of a given root's subtree.
 */
export function getSubtree(graph: IGraph, subtreeRoot: INode): { nodes: INode[]; edges: IEdge[] } {
  const treeAnalysis = new TreeAnalysis({
    subgraphEdges: (e) => !isCrossReference(e)
  })
  const analysisResult = treeAnalysis.run(graph)
  const subtree = analysisResult.getSubtree(subtreeRoot)
  return { nodes: [...subtree.nodes], edges: [...subtree.edges] }
}

/**
 * Gets the first incoming edge that's not a cross-reference or null.
 */
export function getInEdge(node: INode, graph: IGraph): IEdge | null {
  return graph.inEdgesAt(node).find((edge) => !isCrossReference(edge))
}

/**
 * Creates a sibling node for a given node.
 * @param graph The input graph.
 * @param node The node.
 * @param nodeStyle The style for the new sibling node.
 * @param edgeStyle The style for the new edge connecting sibling and parent node.
 * @param labelStyle The style for the sibling node's label.
 * @returns The newly created sibling.
 */
export function createSibling(
  graph: IGraph,
  node: INode,
  nodeStyle: INodeStyle,
  edgeStyle: IEdgeStyle,
  labelStyle: ILabelStyle
): INode | null {
  const nodeData = getNodeData(node)
  // siblings can't be created for the root node
  if (!isRoot(node)) {
    const inEdge = getInEdge(node, graph)
    if (inEdge) {
      const parent = inEdge.sourceNode!
      // create data for sibling
      const data: NodeData = { ...nodeData, collapsed: false, stateIcon: 0 }
      const sibling = graph.createNode(node.layout.toRect(), nodeStyle, data)
      graph.addLabel(sibling, ' ', InteriorLabelModel.CENTER, labelStyle)
      graph.createEdge(parent, sibling, edgeStyle)
      adjustNodeBounds(sibling, graph)
      return sibling
    }
  }
  return null
}

/**
 * Creates a child node for a given parent.
 * @param graph The input graph.
 * @param parent The given parent node.
 * @param nodeStyle The desired node style.
 * @param edgeStyle The desired edge style.
 * @param labelStyle The desired label style.
 * @returns The created child.
 */
export function createChild(
  graph: IGraph,
  parent: INode,
  nodeStyle: INodeStyle,
  edgeStyle: IEdgeStyle,
  labelStyle: ILabelStyle
): INode {
  const parentNodeData = getNodeData(parent) as NodeData
  let left = parentNodeData.left

  // if parent is root, find side to keep the tree balanced
  if (isRoot(parent)) {
    // get all edges starting at root and count left or right
    let balance = 0
    graph.outEdgesAt(parent).forEach((edge) => {
      if (!isCrossReference(edge)) {
        balance += isLeft(edge.targetNode!) ? -1 : 1
      }
    })
    left = balance > 0
  }
  const nodeData: NodeData = {
    depth: parentNodeData.depth + 1,
    left: left,
    color: '#4281a4',
    collapsed: false,
    stateIcon: 0
  }
  const node = graph.createNode(parent.layout.toRect(), nodeStyle, nodeData)
  graph.addLabel(node, '', InteriorLabelModel.CENTER, labelStyle)
  graph.createEdge(parent, node, edgeStyle)

  adjustNodeBounds(node, graph)
  return node
}

/**
 * Removes a node and its subtree.
 * @param graph The input graph.
 * @param subtreeRoot The root node of the subtree.
 */
export function removeSubtree(graph: IGraph, subtreeRoot: INode): void {
  const nodesToCheck = [subtreeRoot]

  while (nodesToCheck.length > 0) {
    const node = nodesToCheck.pop()!
    for (const outEdge of graph.outEdgesAt(node).filter((edge) => !isCrossReference(edge))) {
      nodesToCheck.push(outEdge.targetNode!)
    }
    graph.remove(node)
  }
}

/**
 * Sets the depth information of a given node and its subtree.
 * @param graph The input graph.
 * @param node The node to set the depth.
 * @param depth The given depth.
 */
export function setSubtreeDepths(graph: IGraph, node: INode, depth: number): void {
  graph.outEdgesAt(node).forEach((edge) => {
    if (!isCrossReference(edge)) {
      setSubtreeDepths(graph, edge.targetNode!, depth + 1)
    }
  })
  const nodeData = getNodeData(node)
  nodeData.depth = depth
}

/**
 * Returns whether a node has children.
 * @param node The given node.
 * @param graph The given graph.
 * @returns True if a node ahs children, false otherwise
 */
export function hasChildNodes(node: INode, graph: IGraph): boolean {
  return graph.outEdgesAt(node).filter((edge) => !isCrossReference(edge)).size > 0
}

/**
 * Gets the full graph from the graph in the graph component.
 */
export function getFullGraph(graphComponent: GraphComponent): IGraph {
  let graph = graphComponent.graph
  if (graph instanceof FilteredGraphWrapper) {
    graph = graph.wrappedGraph!
  }
  return graph
}

/**
 * Adjusts all node sizes to fit their labels' preferred size.
 */
export function adjustNodeBounds(node: INode, graph: IGraph): void {
  if (node.labels.size > 0) {
    const label = node.labels.at(0)!
    const preferredSize = label.style.renderer.getPreferredSize(label, label.style)
    graph.setLabelPreferredSize(label, preferredSize)
    const { x, y, center } = node.layout
    if (isRoot(node)) {
      graph.setNodeLayout(
        node,
        Rect.fromCenter(center, [Math.max(170, preferredSize.width + 20), 60])
      )
    } else {
      graph.setNodeLayout(node, new Rect(x, y, preferredSize.width + 10, preferredSize.height + 10))
    }
  }
}
