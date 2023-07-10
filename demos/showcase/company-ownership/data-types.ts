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
import type { IEdge, INode } from 'yfiles'

/**
 * The types of the edges.
 */
export enum EdgeTypeEnum {
  Hierarchy = 'Hierarchy',
  Relation = 'Relation'
}

/**
 * The types of the nodes.
 */
export enum NodeTypeEnum {
  CORPORATION = 'Corporation',
  CTB = 'CTB',
  PARTNERSHIP = 'Partnership',
  RCTB = 'RCTB',
  BRANCH = 'Branch',
  DISREGARDED = 'Disregarded',
  DUAL_RESIDENT = 'Dual Resident',
  MULTIPLE = 'Multiple',
  TRUST = 'Trust',
  INDIVIDUAL = 'Individual',
  THIRD_PARTY = 'Third Party',
  PE_RISK = 'PE_Risk',
  TRAPEZOID = 'Trapezoid'
}

/**
 * Data format that is used to build the company ownership chart.
 * It contains information about nodes and edges.
 */
export type GraphData = {
  nodes: Company[]
  edges: (OwnershipEdge | RelationshipEdge)[]
}

/**
 * Type that describes the format of the input node data in this company ownership demo.
 */
export type Company = {
  id: number
  name: string
  nodeType: NodeTypeEnum
  units?: number
  jurisdiction?: string
  taxStatus?: string
  currency?: string
}

/**
 * Type that describes the format of the input edge data in this company ownership demo.
 */
export type CompanyRelationshipEdge = {
  id: number
  sourceId: number
  targetId: number
  type: EdgeTypeEnum
}

/**
 * Type that describes the hierarchy edges in this company ownership demo.
 */
export type OwnershipEdge = CompanyRelationshipEdge & {
  type: typeof EdgeTypeEnum.Hierarchy
  ownership: number
}

/**
 * Type that describes the relationship edges in this company ownership demo.
 */
export type RelationshipEdge = CompanyRelationshipEdge & {
  type: typeof EdgeTypeEnum.Relation
}

/**
 * Type of data associated with a node.
 * It contains information that is used for the node visualization and interaction with the graph.
 */
export type CompanyNodeData = Company & {
  invisible: boolean
  inputCollapsed: boolean
  outputCollapsed: boolean
}

/**
 * Type of data associated with an edge.
 * It contains information that is used for the edge visualization and layout.
 */
export type CompanyRelationshipData = (OwnershipEdge | RelationshipEdge) & {
  ownership: number
  isDominantHierarchyEdge: boolean
}

/**
 * Returns the data stored in the node's tag.
 */
export function getCompany(node: INode): CompanyNodeData {
  return node.tag as CompanyNodeData
}

/**
 * Returns the data stored in the edge's tag.
 */
export function getRelationship(edge: IEdge): CompanyRelationshipData {
  return edge.tag as CompanyRelationshipData
}
