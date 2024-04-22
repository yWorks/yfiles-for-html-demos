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
import type { Class, ILabel, IOrientedRectangle } from 'yfiles'
import {
  BaseClass,
  ILabelModel,
  ILabelModelParameter,
  ILookup,
  INode,
  OrientedRectangle
} from 'yfiles'
import { ActivityNodeStyle } from './ActivityNodeStyle'
import { getMainActivityWidth, getMainActivityX } from '../gantt-utils'
import { getActivity } from '../resources/data-model'

/**
 * A label model that arranges the label centered in the "main" activity part, omitting the parts
 * for the lead time and follow-up time.
 */
export class ActivityNodeLabelModel extends BaseClass(ILabelModel) {
  /**
   * Calculates the oriented rectangle for the node label based on the node's layout
   * without considering the lead/follow-up time i.e., only the 'solid' part is considered.
   */
  getGeometry(label: ILabel, layoutParameter: ILabelModelParameter): IOrientedRectangle {
    const node = label.owner as INode
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
   */
  createDefaultParameter(): ILabelModelParameter {
    return new ActivityNodeStyleLabelModelParameter(this)
  }

  getContext(label: ILabel, layoutParameter: ILabelModelParameter): ILookup {
    return ILookup.EMPTY
  }

  lookup<T>(type: Class<T>): T | null {
    return null
  }
}

/**
 * A custom label model parameter used for placing the labels of the activity nodes.
 */
class ActivityNodeStyleLabelModelParameter extends BaseClass(ILabelModelParameter) {
  constructor(private readonly _model: ILabelModel) {
    super()
  }

  clone(): this {
    return this
  }

  /**
   * Returns the model used for placing the labels.
   */
  get model(): ILabelModel {
    return this._model
  }

  /**
   * Returns true if the owner of the label is an activity node, false otherwise.
   */
  supports(label: ILabel): boolean {
    return label.owner instanceof INode && label.owner.style instanceof ActivityNodeStyle
  }
}
