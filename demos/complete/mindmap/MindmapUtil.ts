/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  ArcEdgeStyle,
  ArcEdgeStyleRenderer,
  DefaultPortCandidate,
  FreeNodePortLocationModel,
  IEdge,
  IEdgeStyle,
  IEnumerable,
  IGraph,
  IInputModeContext,
  ILabelStyle,
  INode,
  INodeStyle,
  InteriorLabelModel,
  IPortCandidate,
  List,
  PortCandidateProviderBase,
  TreeAnalysis,
  UndoUnitBase
} from 'yfiles'

export declare type NodeData = {
  depth: number
  isLeft: boolean
  isCollapsed: boolean
  color: string
  stateIcon: number
}

const CROSS_REFERENCE_MARKER = 'CrossReference'

/**
 * Gets the mindmap root.
 * @param graph The input graph.
 */
export function getRoot(graph: IGraph) {
  // return the first node with no incoming mindmap edges
  return graph.nodes.first(node => getInEdge(node, graph) === null)
}

/**
 * Creates the arrays containing the nodes and edges of a subtree
 * of a given root.
 * @param graph The input graph.
 * @param subtreeRoot The root node of the subtree.
 * @param nodes A list to be filled with the nodes of the subtree.
 * @param edges A list to be filled with the edges of the subtree.
 */
export function getSubtree(graph: IGraph, subtreeRoot: INode): { nodes: INode[]; edges: IEdge[] } {
  const treeAnalysis = new TreeAnalysis({
    subgraphEdges: e => !isCrossReference(e)
  })
  const analysisResult = treeAnalysis.run(graph)
  const subtree = analysisResult.getSubtree(subtreeRoot)
  return { nodes: [...subtree.nodes], edges: [...subtree.edges] }
}

/**
 * Gets the first incoming edge that's not a cross reference or null.
 * @param node The given node.
 * @param graph The input graph.
 */
export function getInEdge(node: INode, graph: IGraph): IEdge | null {
  return graph.inEdgesAt(node).find(edge => !isCrossReference(edge))
}

/**
 * Creates a sibling node for a given node.
 * @param node The given node.
 * @param graph The input graph.
 * @param nodeStyle The desired node style.
 * @param edgeStyle The desired edge style.
 * @param labelStyle The desired label style.
 * @return The created sibling.
 */
export function createSibling(
  graph: IGraph,
  node: INode,
  nodeStyle: INodeStyle,
  edgeStyle: IEdgeStyle,
  labelStyle: ILabelStyle
): INode | null {
  const nodeData = node.tag as NodeData
  // siblings can't be created for the root node
  if (!isRoot(node)) {
    const inEdge = getInEdge(node, graph)
    if (inEdge !== null) {
      const parent = inEdge.sourceNode!
      // create data for sibling
      const data: NodeData = { ...nodeData, isCollapsed: false, stateIcon: 0 }
      const sibling = graph.createNode(node.layout.toRect(), nodeStyle, data)
      graph.addLabel(sibling, ' ', InteriorLabelModel.CENTER, labelStyle)
      graph.createEdge(parent, sibling, edgeStyle)
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
 * @return The created child.
 */
export function createChild(
  graph: IGraph,
  parent: INode,
  nodeStyle: INodeStyle,
  edgeStyle: IEdgeStyle,
  labelStyle: ILabelStyle
): INode {
  const parentNodeData = parent.tag as NodeData
  let left = parentNodeData.isLeft

  // if parent is root, find side to keep tree balanced
  if (isRoot(parent)) {
    // get all edges starting at root and count left or right
    let balance = 0
    graph.outEdgesAt(parent).forEach(edge => {
      if (!isCrossReference(edge)) {
        balance += isLeft(edge.targetNode!) ? -1 : 1
      }
    })
    left = balance > 0
  }
  const data: NodeData = {
    depth: parentNodeData.depth + 1,
    isLeft: left,
    color: '#4281a4',
    isCollapsed: false,
    stateIcon: 0
  }
  const node = graph.createNode(parent.layout.toRect(), nodeStyle, data)
  graph.addLabel(node, ' ', InteriorLabelModel.CENTER, labelStyle)
  graph.createEdge(parent, node, edgeStyle)
  return node
}

/**
 * Creates a cross reference edge.
 * @param context The given context.
 * @param graph The input graph.
 * @param sourceCandidate The source port candidate.
 * @param targetCandidate The target port candidate.
 * @param dummyEdge The dummy edge instance that serves as template for the actual edge
 *   creation.
 * @return The newly created cross reference edge.
 */
export function createCrossReferenceEdge(
  context: IInputModeContext,
  graph: IGraph,
  sourceCandidate: IPortCandidate,
  targetCandidate: IPortCandidate | null,
  dummyEdge: IEdge
): IEdge | null {
  if (!sourceCandidate || !targetCandidate) {
    // cancel if either candidate is missing
    return null
  }
  // get the source and target ports from the candidates
  const sourcePort = sourceCandidate.port || sourceCandidate.createPort(context)
  const targetPort = targetCandidate.port || targetCandidate.createPort(context)
  // create the edge between the source and target port
  return graph.createEdge(sourcePort, targetPort, dummyEdge.style, CROSS_REFERENCE_MARKER)
}

/**
 * Removes a node and its subtree.
 * @param graph The input graph.
 * @param subtreeRoot The root node of the subtree.
 */
export function removeSubtree(graph: IGraph, subtreeRoot: INode): void {
  const edges: IEdge[] = []
  graph.edges.toList().copyTo(edges, 0)
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i]
    // call this method recursively for all child nodes
    if (graph.contains(edge) && edge.sourceNode === subtreeRoot && !isCrossReference(edge)) {
      removeSubtree(graph, edge.targetNode!)
    }
  }
  graph.remove(subtreeRoot)
}

/**
 * Sets the depth information of a given node and its subtree.
 * @param graph The input graph.
 * @param node The node to set the depth.
 * @param depth The given depth.
 */
export function setSubtreeDepths(graph: IGraph, node: INode, depth: number): void {
  graph.outEdgesAt(node).forEach(edge => {
    if (!isCrossReference(edge)) {
      setSubtreeDepths(graph, edge.targetNode!, depth + 1)
    }
  })
  node.tag.depth = depth
}

/**
 * Returns whether an edge is a cross reference edge.
 * @param edge The given edge.
 * @return True if the edge is a cross reference edge, false otherwise
 */
export function isCrossReference(edge: IEdge | null): boolean {
  return edge!.tag === CROSS_REFERENCE_MARKER
}

/**
 * Returns whether a node is collapsed.
 * @param node The given node.
 * @return True if a node is collapsed, false otherwise
 */
export function isCollapsed(node: INode): boolean {
  return node.tag.isCollapsed
}

/**
 * Returns whether a node is on the left of the root.
 * @param node The given node.
 * @return True if a node is on the left of the root, false otherwise
 */
export function isLeft(node: INode): boolean {
  return node.tag.isLeft
}

/**
 * Returns whether a node is the root node.
 * @param node The given node.
 * @return True if a node is the root, false otherwise
 */
export function isRoot(node: INode): boolean {
  return node.tag.depth === 0
}

/**
 * Returns the depth of a node.
 * @param node The given node.
 * @return The depth of a node
 */
export function getDepth(node: INode): number {
  return node.tag.depth
}

/**
 * Returns whether a node has children.
 * @param node The given node.
 * @param graph The given graph.
 * @return True if a node ahs children, false otherwise
 */
export function hasChildNodes(node: INode, graph: IGraph): boolean {
  return graph.outEdgesAt(node).find(edge => !isCrossReference(edge)) !== null
}

/**
 * This class creates PortCandidates for the cross reference edges that lie on the center of the node.
 */
export class CenterPortCandidateProvider extends PortCandidateProviderBase {
  constructor(private readonly node: INode) {
    super()
  }

  getPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    const candidates = new List<IPortCandidate>()
    const defaultPortCandidate = new DefaultPortCandidate(
      this.node,
      FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    )
    candidates.add(defaultPortCandidate)
    return candidates
  }
}

/**
 * This class provides undo/redo for an operation changing tag data.
 */
export class TagChangeUndoUnit extends UndoUnitBase {
  /**
   * The constructor.
   * @param undoName Name of the undo operation.
   * @param redoName Name of the redo operation
   * @param oldTag The data to restore the previous state.
   * @param newTag The data to restore the next state.
   * @param item The owner of the tag.
   * @param callback Callback that is executed after undo and redo.
   */
  constructor(
    undoName: string,
    redoName: string,
    private readonly oldTag: NodeData,
    private readonly newTag: NodeData,
    private readonly item: INode,
    private readonly callback: ((node: INode) => void) | null
  ) {
    super(undoName, redoName)
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo(): void {
    this.item.tag = this.oldTag
    this.callback?.(this.item)
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo(): void {
    this.item.tag = this.newTag
    this.callback?.(this.item)
  }
}

/**
 * Class required to make sure the edge selection style always
 * uses the same height value as the actual edge style.
 */
export class MyArcEdgeStyleRenderer extends ArcEdgeStyleRenderer {
  configure(): void {
    if (this.edge.style instanceof ArcEdgeStyle) {
      // Take the height of the edge's actual style and assign
      // it to the style instance used by this renderer
      this.style.height = this.edge.style.height
    }
    super.configure()
  }
}
