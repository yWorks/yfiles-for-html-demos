/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import { CreateEdgeInputMode, IEdge, INode } from 'yfiles'

/**
 * @typedef {function} PreCondition
 */

/**
 * Combines several {@link PreCondition} with a logic AND.
 * @param {!Array.<PreCondition>} conditions The conditions to combine.
 * @returns {!PreCondition}
 */
export function checkAnd(conditions) {
  return mode => conditions.every(condition => condition(mode))
}

/**
 * Combines several {@link PreCondition} with a logic OR.
 * @param {!Array.<PreCondition>} conditions The conditions to combine.
 * @returns {!PreCondition}
 */
export function checkOr(conditions) {
  return mode => conditions.some(condition => condition(mode))
}

/**
 * Negates a {@link PreCondition}.
 * @param {!PreCondition} condition The condition to negate.
 * @returns {!PreCondition}
 */
export function checkNot(condition) {
  return mode => !condition(mode)
}

/**
 * Checks if the {@link GraphWizardInputMode.currentItem currentItem} is an {@link INode}.
 * @param {!GraphWizardInputMode} mode The current {@link GraphWizardInputMode}.
 * @returns {boolean}
 */
export function checkForNode(mode) {
  return mode.currentItem instanceof INode
}

/**
 * Checks if the {@link GraphWizardInputMode.currentItem currentItem} is an {@link IEdge}.
 * @param {!GraphWizardInputMode} mode The current {@link GraphWizardInputMode}.
 * @returns {boolean}
 */
export function checkForEdge(mode) {
  return mode.currentItem instanceof IEdge
}

/**
 * Checks if the {@link GraphWizardInputMode.currentItem currentItem} is an {@link INode} and
 * has the specified {@link INode.style style}.
 * @param {*} styleClass The style class the current node is checked for.
 * @returns {!PreCondition}
 */
export function checkForNodeStyle(styleClass) {
  return mode => mode.currentItem instanceof INode && mode.currentItem.style instanceof styleClass
}

/**
 * Checks if the {@link GraphWizardInputMode.currentItem currentItem} is an {@link IEdge} and
 * has the specified {@link IEdge.style style}.
 * @param {*} styleClass The style class the current edge is checked for.
 * @returns {!PreCondition}
 */
export function checkForEdgeStyle(styleClass) {
  return mode => mode.currentItem instanceof IEdge && mode.currentItem.style instanceof styleClass
}

/**
 * Checks if no edge creation is currently {@link CreateEdgeInputMode.isCreationInProgress in progress}.
 * @param {!GraphWizardInputMode} mode The current {@link GraphWizardInputMode}.
 * @returns {boolean}
 */
export function checkNotCreatingEdge(mode) {
  return !mode.createEdgeMode.isCreationInProgress
}

/**
 * Checks if an edge creation is currently {@link CreateEdgeInputMode.isCreationInProgress in progress}.
 * @param {!GraphWizardInputMode} mode The current {@link GraphWizardInputMode}.
 * @returns {boolean}
 */
export function checkCreatingEdge(mode) {
  return mode.createEdgeMode.isCreationInProgress
}
