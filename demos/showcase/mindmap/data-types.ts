/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { IEdge, INode } from '@yfiles/yfiles'

/**
 * Data format that is used to build a mind map in this demo.
 * It contains information about nodes and edges.
 */
export type MindMapData = { concepts: Concept[]; connections: Connection[] }

/**
 * Type that describes the format of the input node data in this mind map demo.
 * It is used for building the graph structure and adding labels to the nodes.
 */
export type Concept = { id: number; text: string }

/**
 * Type that describes the format of the input edge data in this mind map demo.
 * It is used for building the graph structure, creating the edges and associating them with a type.
 */
export type Connection = { from: number; to: number; type: 'association' | 'cross-reference' }

/**
 * Type of data associated with a node.
 * It contains information that is used for the node visualization and interaction with the graph.
 */
export type NodeData = {
  depth: number
  left: boolean
  collapsed: boolean
  color: string
  stateIcon: number
}

/**
 * Type of data associated with an edge.
 * It contains information that is used for the edge visualization and layout.
 */
export type EdgeData = { type: 'association' | 'cross-reference' }

/**
 * Returns the data stored in the node's tag.
 */
export function getNodeData(node: INode): NodeData {
  return node.tag as NodeData
}

/**
 * Sets the data to store in the node's tag.
 */
export function setNodeData(node: INode, nodeData: NodeData): void {
  node.tag = nodeData
}

/**
 * Returns the data stored in the edge's tag.
 */
export function getEdgeData(edge: IEdge): EdgeData | null {
  return edge.tag as EdgeData
}

/**
 * Returns whether an edge is a cross-reference edge.
 */
export function isCrossReference(edge: IEdge): boolean {
  const edgeData = getEdgeData(edge)
  return edgeData?.type === 'cross-reference'
}

/**
 * Returns whether a node is collapsed.
 */
export function isCollapsed(node: INode): boolean {
  const nodeData = getNodeData(node)
  return nodeData.collapsed
}

/**
 * Returns whether a node is on the left of the root.
 */
export function isLeft(node: INode): boolean {
  const nodeData = getNodeData(node)
  return nodeData.left
}

/**
 * Returns whether a node is the root node.
 */
export function isRoot(node: INode): boolean {
  return getDepth(node) === 0
}

/**
 * Returns the subtree-depth of a node.
 */
export function getDepth(node: INode): number {
  const nodeData = getNodeData(node)
  return nodeData.depth
}
