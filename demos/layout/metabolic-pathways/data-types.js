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
 * Represents the type of nodes in the demo's pathway samples.
 */
export var NodeTypes
;(function (NodeTypes) {
  NodeTypes[(NodeTypes['ENZYME'] = 0)] = 'ENZYME'
  NodeTypes[(NodeTypes['REACTION'] = 1)] = 'REACTION'
  NodeTypes[(NodeTypes['REACTANT'] = 2)] = 'REACTANT'
  NodeTypes[(NodeTypes['CO_REACTANT'] = 3)] = 'CO_REACTANT'
  NodeTypes[(NodeTypes['PRODUCT'] = 4)] = 'PRODUCT'
  NodeTypes[(NodeTypes['OTHER'] = 5)] = 'OTHER'
})(NodeTypes || (NodeTypes = {}))

/**
 * Returns the type of the given node.
 */
export function getType(node) {
  return getMetabolicData(node).type
}

/**
 * Returns the data associated with the given node.
 */
export function getMetabolicData(node) {
  return node.tag
}

/**
 * Returns the alignment of the given node.
 */
export function getAlignment(node) {
  return getMetabolicData(node).vAlign
}

/**
 * Returns whether the node belongs to a circle.
 */
export function isOnCircle(node) {
  return getMetabolicData(node).circle ?? false
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
