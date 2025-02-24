/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
export var EdgeTypeEnum
;(function (EdgeTypeEnum) {
  EdgeTypeEnum['Hierarchy'] = 'Hierarchy'
  EdgeTypeEnum['Relation'] = 'Relation'
})(EdgeTypeEnum || (EdgeTypeEnum = {}))
/**
 * The types of the nodes.
 */
export var NodeTypeEnum
;(function (NodeTypeEnum) {
  NodeTypeEnum['CORPORATION'] = 'Corporation'
  NodeTypeEnum['CTB'] = 'CTB'
  NodeTypeEnum['PARTNERSHIP'] = 'Partnership'
  NodeTypeEnum['RCTB'] = 'RCTB'
  NodeTypeEnum['BRANCH'] = 'Branch'
  NodeTypeEnum['DISREGARDED'] = 'Disregarded'
  NodeTypeEnum['DUAL_RESIDENT'] = 'Dual Resident'
  NodeTypeEnum['MULTIPLE'] = 'Multiple'
  NodeTypeEnum['TRUST'] = 'Trust'
  NodeTypeEnum['INDIVIDUAL'] = 'Individual'
  NodeTypeEnum['THIRD_PARTY'] = 'Third Party'
  NodeTypeEnum['PE_RISK'] = 'PE_Risk'
  NodeTypeEnum['TRAPEZOID'] = 'Trapezoid'
})(NodeTypeEnum || (NodeTypeEnum = {}))
/**
 * Returns the data stored in the node's tag.
 */
export function getCompany(node) {
  return node.tag
}
/**
 * Returns the data stored in the edge's tag.
 */
export function getRelationship(edge) {
  return edge.tag
}
