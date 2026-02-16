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
import type { IEdge, ILabel, INode } from '@yfiles/yfiles'

/**
 * Type of label displayed on graph items.
 *
 * - `icon`: Material Icons symbol
 * - `text`: Node or edge label text
 * - `error`: Error indicator icon
 */
export type LabelType = 'icon' | 'text' | 'error'

/**
 * Represents a data quality issue detected in the graph.
 */
export type Problem = { type: string; id?: number }

/**
 * Data associated with a node in the graph.
 *
 * Properties:
 * - `id`: Unique node identifier
 * - `label`: Display text
 * - `type`: Node category (e.g., person, location, project)
 * - `problem`: Data quality issue if any
 * - `virtual`: True if node is a placeholder for dangling edge endpoints
 * - `clusterId`: Cluster group assigned by modularity algorithm
 * - `visible`: Whether node is visible after filtering
 */
export type NodeData = {
  id: string
  label: string
  type?: string
  problem?: Problem
  virtual?: boolean
  clusterId?: number
  visible?: boolean
}

/**
 * Data associated with an edge in the graph.
 *
 * Properties:
 * - `id`: Unique edge identifier
 * - `label`: Edge relationship label
 * - `from`: Source node ID
 * - `to`: Target node ID
 * - `problem`: Data quality issue if any
 * - `visible`: Whether edge is visible after filtering
 */
export type EdgeData = {
  id: string
  label: string
  from: string
  to: string
  problem?: Problem
  visible?: boolean
}

/**
 * Data associated with a label on graph items.
 *
 * Properties:
 * - `type`: Label type (icon, text, or error)
 * - `visible`: Whether label is currently visible
 */
export type LabelData = { type: LabelType; visible: boolean }

/**
 * The data associated with this demo.
 */
export type GraphData = { nodes: NodeData[]; edges: EdgeData[] }

/**
 * Retrieves the node data tag.
 *
 * @param node - The node to retrieve data from
 */
export function getNodeTag(node: INode): NodeData {
  return node.tag as NodeData
}

/**
 * Retrieves the edge data tag.
 *
 * @param edge - The edge to retrieve data from
 */
export function getEdgeTag(edge: IEdge): EdgeData {
  return edge.tag as EdgeData
}

/**
 * Retrieves the label data tag.
 *
 * @param label - The label to retrieve data from
 */
export function getLabelTag(label: ILabel): LabelData {
  return label.tag as LabelData
}
