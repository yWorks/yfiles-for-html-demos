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
 * Represents the type of nodes in the demo's pathway samples.
 */
export /**
 * @readonly
 * @enum {number}
 */
const NodeTypes = {
  ENZYME: 0,
  REACTION: 1,
  REACTANT: 2,
  CO_REACTANT: 3,
  PRODUCT: 4,
  OTHER: 5
}

/**
 * Represents the data-set for this demo for creating the nodes and the edges.
 * @typedef {Object} MetabolicPathwayData
 * @property {Array.<InputNodeData>} nodes
 * @property {Array.<object>} edges
 */

/**
 * Represents a node of a metabolic path in the input data-set.
 * @typedef {Object} InputNodeData
 * @property {number} id
 * @property {string} [label]
 * @property {object} tag
 */

/**
 * Represents the data associated with a node of a metabolic path after building the graph.
 * @typedef {Object} MetabolicNodeData
 * @property {NodeTypes} type
 * @property {(string|number)} [vAlign]
 * @property {boolean} [circle]
 */

/**
 * Returns the type of the given node.
 * @param {!INode} node
 * @returns {!NodeTypes}
 */
export function getType(node) {
  return getMetabolicData(node).type
}

/**
 * Returns the data associated with the given node.
 * @param {!INode} node
 * @returns {!MetabolicNodeData}
 */
export function getMetabolicData(node) {
  return node.tag
}

/**
 * A mapping between the string values of the node types in the data-set and the NodeTypes enum.
 */
export const nodeTypesMap = new Map([
  ['ENZYME', NodeTypes.ENZYME],
  ['REACTION', NodeTypes.REACTION],
  ['CO_REACTANT', NodeTypes.CO_REACTANT],
  ['PRODUCT', NodeTypes.PRODUCT],
  ['REACTANT', NodeTypes.REACTANT],
  ['OTHER', NodeTypes.OTHER]
])
