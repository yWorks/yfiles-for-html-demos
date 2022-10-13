/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
 * The types of the edges.
 */
export /**
 * @readonly
 * @enum {number}
 */
const EdgeTypeEnum = {
  Hierarchy: 'Hierarchy',
  Relation: 'Relation'
}

/**
 * The types of the nodes.
 */
export /**
 * @readonly
 * @enum {number}
 */
const NodeTypeEnum = {
  CORPORATION: 'Corporation',
  CTB: 'CTB',
  PARTNERSHIP: 'Partnership',
  RCTB: 'RCTB',
  BRANCH: 'Branch',
  DISREGARDED: 'Disregarded',
  DUAL_RESIDENT: 'Dual Resident',
  MULTIPLE: 'Multiple',
  TRUST: 'Trust',
  INDIVIDUAL: 'Individual',
  THIRD_PARTY: 'Third Party',
  PE_RISK: 'PE_Risk',
  TRAPEZOID: 'Trapezoid'
}
/**
 * The types of the elements of the graph.
 * @typedef {Object} GraphData
 * @property {Array.<CompanyNode>} nodes
 * @property {Array.<(OwnershipEdge|RelationshipEdge)>} edges
 */
/**
 * The edge attributes of this demo.
 * @typedef {Object} CompanyRelationshipEdge
 * @property {number} id
 * @property {number} sourceId
 * @property {number} targetId
 * @property {EdgeTypeEnum} type
 */
/**
 * Hierarchy edges that support also ownership.
 * @typedef {Object} OwnershipEdge
 * @property {undefined} type
 * @property {number} ownership
 */
/**
 * Relationship edges.
 * @typedef {Object} RelationshipEdge
 * @property {undefined} type
 */
/**
 * The node attributes of this demo.
 * @typedef {Object} CompanyNode
 * @property {number} id
 * @property {string} name
 * @property {NodeTypeEnum} nodeType
 * @property {number} [units]
 * @property {string} [jurisdiction]
 * @property {string} [taxStatus]
 * @property {string} [currency]
 */
