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
import {
  BaseClass,
  ILabelModel,
  ILabelModelParameter,
  ILookup,
  INode,
  OrientedRectangle
} from 'yfiles'
import { ActivityNodeStyle } from './ActivityNodeStyle.js'
import { getMainActivityWidth, getMainActivityX } from '../gantt-utils.js'
import { getActivity } from '../resources/data-model.js'

/**
 * A label model that arranges the label centered in the "main" activity part, omitting the parts
 * for the lead time and follow-up time.
 */
export class ActivityNodeLabelModel extends BaseClass(ILabelModel) {
  /**
   * Calculates the oriented rectangle for the node label based on the node's layout
   * without considering the lead/follow-up time i.e., only the 'solid' part is considered.
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} layoutParameter
   * @returns {!IOrientedRectangle}
   */
  getGeometry(label, layoutParameter) {
    const node = label.owner
    const activity = getActivity(node)
    const { height, maxY } = node.layout
    const activityStartX = getMainActivityX(activity, node)
    const activityWidth = getMainActivityWidth(activity, node)
    return new OrientedRectangle({
      anchorX: activityStartX,
      anchorY: maxY,
      width: activityWidth,
      height
    })
  }

  /**
   * Returns a custom label model parameter used for determining the position of the label.
   * @returns {!ILabelModelParameter}
   */
  createDefaultParameter() {
    return new ActivityNodeStyleLabelModelParameter(this)
  }

  /**
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} layoutParameter
   * @returns {!ILookup}
   */
  getContext(label, layoutParameter) {
    return ILookup.EMPTY
  }

  /**
   * @template T
   * @param {!Class.<T>} type
   * @returns {?T}
   */
  lookup(type) {
    return null
  }
}

/**
 * A custom label model parameter used for placing the labels of the activity nodes.
 */
class ActivityNodeStyleLabelModelParameter extends BaseClass(ILabelModelParameter) {
  /**
   * @param {!ILabelModel} _model
   */
  constructor(_model) {
    super()
    this._model = _model
  }

  /**
   * @returns {*}
   */
  clone() {
    return this
  }

  /**
   * Returns the model used for placing the labels.
   * @type {!ILabelModel}
   */
  get model() {
    return this._model
  }

  /**
   * Returns true if the owner of the label is an activity node, false otherwise.
   * @param {!ILabel} label
   * @returns {boolean}
   */
  supports(label) {
    return label.owner instanceof INode && label.owner.style instanceof ActivityNodeStyle
  }
}
