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
import {
  BaseClass,
  FreeEdgeLabelModel,
  FreeLabelModel,
  FreeNodeLabelModel,
  IEnumerable,
  IHandle,
  IHandleProvider,
  IInputModeContext,
  ILabel,
  InteriorStretchLabelModel,
  List
} from 'yfiles'

import LabelRotateHandle from './LabelRotateHandle'
import LabelResizeHandle from './LabelResizeHandle'

/**
 * A custom {@link IHandleProvider} implementation that returns a {@link LabelResizeHandle} for each
 * label which can be resized and a {@link LabelRotateHandle} for each label which can be rotated.
 */
export default class LabelHandleProvider
  extends BaseClass(IHandleProvider)
  implements IHandleProvider
{
  /**
   * Creates a new instance of {@link LabelHandleProvider}.
   * @param label The given label
   */
  constructor(private readonly label: ILabel) {
    super()
  }

  /**
   * Implementation of {@link IHandleProvider.getHandles}.
   *
   * Returns a list of available handles for the label this instance has been created for.
   */
  getHandles(context: IInputModeContext): IEnumerable<IHandle> {
    // return a list of the available handles
    const handles = new List<IHandle>()
    const labelModel = this.label.layoutParameter.model
    if (labelModel instanceof InteriorStretchLabelModel) {
      // Some label models are not resizable at all - don't provide any handles
    } else if (
      labelModel instanceof FreeEdgeLabelModel ||
      labelModel instanceof FreeNodeLabelModel ||
      labelModel instanceof FreeLabelModel
    ) {
      // These models support resizing in one direction
      handles.add(new LabelResizeHandle(this.label, false))
      // They also support rotation
      handles.add(new LabelRotateHandle(this.label, context))
    } else {
      // For all other models, we assume the *center* needs to stay the same
      // This requires that the label must be resized symmetrically in both directions
      handles.add(new LabelResizeHandle(this.label, true))
    }
    return handles
  }
}
