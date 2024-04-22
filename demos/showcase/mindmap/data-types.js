/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * Data format that is used to build a mind map in this demo.
 * It contains information about nodes and edges.
 * @typedef {Object} MindMapData
 * @property {Array.<Concept>} concepts
 * @property {Array.<Connection>} connections
 */

/**
 * Type that describes the format of the input node data in this mind map demo.
 * It is used for building the graph structure and adding labels to the nodes.
 * @typedef {Object} Concept
 * @property {number} id
 * @property {string} text
 */

/**
 * Type that describes the format of the input edge data in this mind map demo.
 * It is used for building the graph structure, creating the edges and associating them with a type.
 * @typedef {Object} Connection
 * @property {number} from
 * @property {number} to
 * @property {('association'|'cross-reference')} type
 */

/**
 * Type of data associated with a node.
 * It contains information that is used for the node visualization and interaction with the graph.
 * @typedef {Object} NodeData
 * @property {number} depth
 * @property {boolean} left
 * @property {boolean} collapsed
 * @property {string} color
 * @property {number} stateIcon
 */

/**
 * Type of data associated with an edge.
 * It contains information that is used for the edge visualization and layout.
 * @typedef {Object} EdgeData
 * @property {('association'|'cross-reference')} type
 */

/**
 * Returns the data stored in the node's tag.
 * @param {!INode} node
 * @returns {!NodeData}
 */
export function getNodeData(node) {
  return node.tag
}

/**
 * Sets the data to store in the node's tag.
 * @param {!INode} node
 * @param {!NodeData} nodeData
 */
export function setNodeData(node, nodeData) {
  node.tag = nodeData
}

/**
 * Returns the data stored in the edge's tag.
 * @param {!IEdge} edge
 * @returns {?EdgeData}
 */
export function getEdgeData(edge) {
  return edge.tag
}

/**
 * Returns whether an edge is a cross-reference edge.
 * @param {!IEdge} edge
 * @returns {boolean}
 */
export function isCrossReference(edge) {
  const edgeData = getEdgeData(edge)
  return edgeData?.type === 'cross-reference'
}

/**
 * Returns whether a node is collapsed.
 * @param {!INode} node
 * @returns {boolean}
 */
export function isCollapsed(node) {
  const nodeData = getNodeData(node)
  return nodeData.collapsed
}

/**
 * Returns whether a node is on the left of the root.
 * @param {!INode} node
 * @returns {boolean}
 */
export function isLeft(node) {
  const nodeData = getNodeData(node)
  return nodeData.left
}

/**
 * Returns whether a node is the root node.
 * @param {!INode} node
 * @returns {boolean}
 */
export function isRoot(node) {
  return getDepth(node) === 0
}

/**
 * Returns the subtree-depth of a node.
 * @param {!INode} node
 * @returns {number}
 */
export function getDepth(node) {
  const nodeData = getNodeData(node)
  return nodeData.depth
}
