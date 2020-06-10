/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IGraph,
  ILabelStyle,
  IModelItem,
  INode,
  INodeStyle,
  IPortCandidate,
  IRenderContext,
  InteriorLabelModel,
  List,
  PortCandidateProviderBase,
  UndoUnitBase,
  YObject
} from 'yfiles'

/**
 * This class contains utility methods that deal with the mindmap graph.
 */
export class Structure {
  /**
   * Returns a string for marking an edge as a cross reference edge.
   * @return {string}
   */
  static get CROSS_REFERENCE_MARKER() {
    return 'CrossReference'
  }

  /**
   * Gets the mindmap root.
   * @param {IGraph} graph The input graph.
   */
  static getRoot(graph) {
    // return the first node with no incoming mindmap edges
    return graph.nodes.first(node => Structure.getInEdge(node, graph) === null)
  }

  /**
   * Creates the arrays containing the nodes and edges of a subtree
   * of a given root.
   * @param {IGraph} graph The input graph.
   * @param {INode} subtreeRoot The root node of the subtree.
   * @param {List} nodes A list to be filled with the nodes of the subtree.
   * @param {List} edges A list to be filled with the edges of the subtree.
   */
  static getSubtree(graph, subtreeRoot, nodes, edges) {
    const outEdges = graph.outEdgesAt(subtreeRoot)
    outEdges.forEach(outEdge => {
      if (!Structure.isCrossReference(outEdge)) {
        Structure.getSubtree(graph, outEdge.targetNode, nodes, edges)
      }
    })
    graph.inEdgesAt(subtreeRoot).forEach(edge => {
      if (!Structure.isCrossReference(edge)) {
        edges.add(edge)
      }
    })
    nodes.add(subtreeRoot)
  }

  /**
   * Gets the first incoming edge that's not a cross reference or null.
   * @param {INode} node The given node.
   * @param {IGraph} graph The input graph.
   * @return {IEdge}
   */
  static getInEdge(node, graph) {
    return graph.inEdgesAt(node).find(edge => !Structure.isCrossReference(edge))
  }

  /**
   * Creates a sibling node for a given node.
   * @param {INode} node The given node.
   * @param {IGraph} graph The input graph.
   * @param {INodeStyle} nodeStyle The desired node style.
   * @param {IEdgeStyle} edgeStyle The desired edge style.
   * @param {ILabelStyle} labelStyle The desired label style.
   * @return {INode} The created sibling.
   */
  static createSibling(graph, node, nodeStyle, edgeStyle, labelStyle) {
    const nodeData = node.tag
    // siblings can't be created for the root node
    if (!Structure.isRoot(node)) {
      const inEdge = Structure.getInEdge(node, graph)
      if (inEdge !== null) {
        const parent = inEdge.sourceNode
        // create data for sibling
        const data = {
          depth: nodeData.depth,
          isLeft: nodeData.isLeft,
          color: nodeData.color,
          isCollapsed: false,
          stateIcon: 0
        }
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
   * @param {IGraph} graph The input graph.
   * @param {INode} parent The given parent node.
   * @param {INodeStyle} nodeStyle The desired node style.
   * @param {IEdgeStyle} edgeStyle The desired edge style.
   * @param {ILabelStyle} labelStyle The desired label style.
   * @return {INode} The created child.
   */
  static createChild(graph, parent, nodeStyle, edgeStyle, labelStyle) {
    const parentNodeData = parent.tag
    let isLeft = parentNodeData.isLeft

    // if parent is root, find side to keep tree balanced
    if (Structure.isRoot(parent)) {
      // get all edges starting at root and count left or right
      let balance = 0
      graph.outEdgesAt(parent).forEach(edge => {
        if (!Structure.isCrossReference(edge)) {
          balance += Structure.isLeft(edge.targetNode) ? -1 : 1
        }
      })
      isLeft = balance > 0
    }
    const data = {
      depth: parentNodeData.depth + 1,
      isLeft,
      color: '#4477FF',
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
   * @param {IRenderContext} context The given context.
   * @param {IGraph} graph The input graph.
   * @param {IPortCandidate} sourceCandidate The source port candidate.
   * @param {IPortCandidate} targetCandidate The target port candidate.
   * @param {IEdge} dummyEdge The dummy edge instance that serves as template for the actual edge
   *   creation.
   * @return {IEdge} The newly created cross reference edge.
   */
  static createCrossReferenceEdge(context, graph, sourceCandidate, targetCandidate, dummyEdge) {
    if (!sourceCandidate || !targetCandidate) {
      // cancel if either candidate is missing
      return null
    }
    // get the source and target ports from the candidates
    const sourcePort = sourceCandidate.port || sourceCandidate.createPort(context)
    const targetPort = targetCandidate.port || targetCandidate.createPort(context)
    // create the edge between the source and target port
    return graph.createEdge(
      sourcePort,
      targetPort,
      dummyEdge.style,
      Structure.CROSS_REFERENCE_MARKER
    )
  }

  /**
   * Removes a node and its subtree.
   * @param {IGraph} graph The input graph.
   * @param {INode} subtreeRoot The root node of the subtree.
   */
  static removeSubtree(graph, subtreeRoot) {
    const edges = []
    graph.edges.toList().copyTo(edges, 0)
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]
      // call this method recursively for all child nodes
      if (
        graph.contains(edge) &&
        edge.sourceNode === subtreeRoot &&
        !Structure.isCrossReference(edge)
      ) {
        Structure.removeSubtree(graph, edge.targetNode)
      }
    }
    graph.remove(subtreeRoot)
  }

  /**
   * Sets the depth information of a given node and its subtree.
   * @param {IGraph} graph The input graph.
   * @param {INode} node The node to set the depth.
   * @param {number} depth The given depth.
   */
  static setSubtreeDepths(graph, node, depth) {
    graph.outEdgesAt(node).forEach(edge => {
      if (!Structure.isCrossReference(edge)) {
        Structure.setSubtreeDepths(graph, edge.targetNode, depth + 1)
      }
    })
    node.tag.depth = depth
  }

  /**
   * Returns whether an edge is a cross reference edge.
   * @param {IEdge} edge The given edge.
   * @return {boolean} True if the edge is a cross reference edge, false otherwise
   */
  static isCrossReference(edge) {
    return YObject.equals(edge.tag, Structure.CROSS_REFERENCE_MARKER)
  }

  /**
   * Returns whether a node is collapsed.
   * @param {INode} node The given node.
   * @return {boolean} True if a node is collapsed, false otherwise
   */
  static isCollapsed(node) {
    return node.tag.isCollapsed
  }

  /**
   * Returns whether a node is on the left of the root.
   * @param {INode} node The given node.
   * @return {boolean} True if a node is on the left of the root, false otherwise
   */
  static isLeft(node) {
    return node.tag.isLeft
  }

  /**
   * Returns whether a node is the root node.
   * @param {INode} node The given node.
   * @return {boolean} True if a node is the root, false otherwise
   */
  static isRoot(node) {
    return node.tag.depth === 0
  }

  /**
   * Returns the depth of a node.
   * @param {INode} node The given node.
   * @return {number} The depth of a node
   */
  static getDepth(node) {
    return node.tag.depth
  }

  /**
   * Returns whether a node has children.
   * @param {INode} node The given node.
   * @param {IGraph} graph The given graph.
   * @return {boolean} True if a node ahs children, false otherwise
   */
  static hasChildNodes(node, graph) {
    return graph.outEdgesAt(node).find(edge => !Structure.isCrossReference(edge)) !== null
  }
}

/**
 * This class creates PortCandidates for the cross reference edges that lie on the center of the node.
 */
export class CenterPortCandidateProvider extends PortCandidateProviderBase {
  /**
   * @param {INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /** @return {IEnumerable.<IPortCandidate>} */
  getPortCandidates(context) {
    const candidates = new List()
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
   * @param {string} undoName Name of the undo operation.
   * @param {string} redoName Name of the redo operation
   * @param {Object} oldTag The data to restore the previous state.
   * @param {Object} newTag The data to restore the next state.
   * @param {IModelItem} item The owner of the tag.
   * @param {function(IModelItem)} callback Callback that is executed after undo and redo.
   */
  constructor(undoName, redoName, oldTag, newTag, item, callback) {
    super(undoName, redoName)
    this.oldTag = oldTag
    this.newTag = newTag
    this.item = item
    this.callback = callback
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo() {
    this.item.tag = this.oldTag
    if (this.callback !== null) {
      this.callback(this.item)
    }
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo() {
    this.item.tag = this.newTag
    if (this.callback !== null) {
      this.callback(this.item)
    }
  }
}

/**
 * Class required to make sure the edge selection style always
 * uses the same height value as the actual edge style.
 */
export class MyArcEdgeStyleRenderer extends ArcEdgeStyleRenderer {
  configure() {
    if (this.edge.style instanceof ArcEdgeStyle && this.style instanceof ArcEdgeStyle) {
      // Take the height of the edge's actual style and assign
      // it to the style instance used by this renderer
      this.style.height = this.edge.style.height
    }
    super.configure()
  }
}
