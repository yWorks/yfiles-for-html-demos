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
import {
  BaseClass,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILookup
} from '@yfiles/yfiles'

/**
 * Custom implementation of {@link ILabelModel} that provides label positions with an adjustable
 * offset relative to that of the wrapped label model.
 */
export class OffsetWrapperLabelModel extends BaseClass(ILabelModel) {
  // The distance the label will be offset from its original position.
  worldOffset

  /**
   * Constructs an OffsetWrapperLabelModel with an optional offset value.
   * @param worldOffset The offset distance to apply to the label position. Default is 0.
   */
  constructor(worldOffset) {
    super()
    this.worldOffset = worldOffset ?? 0
  }

  /**
   * Calculates the geometry of the label by applying an offset to the position
   * determined by the wrapped model parameter.
   */
  getGeometry(label, layoutParameter) {
    // Use the wrapped model to get the original label position.
    const innerModel = layoutParameter.wrappedModelParameter.model
    const innerParameterLayout = innerModel.getGeometry(
      label,
      layoutParameter.wrappedModelParameter
    )

    // Convert the resulting layout to a mutable rectangle for applying the offset.
    const mutableLayout = innerParameterLayout.toOrientedRectangle()

    // Adjust the label's position by moving it in the direction of its up vector by the offset value.
    mutableLayout.moveBy(mutableLayout.upVector.multiply(this.worldOffset))
    return mutableLayout
  }

  /**
   * Provides a lookup context for the given combination of label and parameter.
   */
  getContext(label) {
    // Provide a lookup that delegates parameter-related services to the wrapped model.
    const parameter = label.layoutParameter
    if (parameter instanceof OffsetWrapperLabelModelParameter) {
      const innerModel = parameter.wrappedModelParameter.model
      const innerLookup = innerModel.getContext(label)

      return ILookup.create((type) => {
        // Delegate provider: wrap all returned parameters so they work with this model.
        if (type === ILabelModelParameterProvider) {
          const innerProvider = innerLookup.lookup(ILabelModelParameterProvider)
          if (!innerProvider) {
            return null
          }
          return ILabelModelParameterProvider.create(() =>
            innerProvider.getParameters().map((p) => new OffsetWrapperLabelModelParameter(this, p))
          )
        }

        // Delegate finder: invert our offset before asking the inner finder and wrap the result.
        if (type === ILabelModelParameterFinder) {
          const innerFinder = innerLookup.lookup(ILabelModelParameterFinder)
          if (!innerFinder) {
            return null
          }
          return ILabelModelParameterFinder.create((layout) => {
            // Reverse the offset that this model applies in getGeometry
            const tmp = layout.toOrientedRectangle()
            tmp.moveBy(tmp.upVector.multiply(-this.worldOffset))
            const innerParameter = innerFinder.findBestParameter(tmp)
            return new OffsetWrapperLabelModelParameter(this, innerParameter)
          })
        }

        // Fallback: forward other lookups to the inner model.
        return innerLookup.lookup(type)
      })
    }

    // Fallback if we cannot detect our wrapper parameter.
    return ILookup.EMPTY
  }

  /**
   * Creates a parameter that wraps an existing label model parameter with offset capabilities.
   */
  createParameter(innerParameter) {
    return new OffsetWrapperLabelModelParameter(this, innerParameter)
  }
}

/**
 * Custom implementation of {@link ILabelModelParameter} that wraps around another
 * ILabelModelParameter and applies an offset to the calculated label position from that model.
 */
class OffsetWrapperLabelModelParameter extends BaseClass(ILabelModelParameter) {
  _model
  wrappedModelParameter

  /**
   * Constructs a new instance of {@link OffsetWrapperLabelModelParameter}.
   * @param model The model for this parameter.
   * @param wrappedModelParameter The parameter of the label model being augmented.
   */
  constructor(model, wrappedModelParameter) {
    super()
    this._model = model
    this.wrappedModelParameter = wrappedModelParameter
  }

  /**
   * Provides access to the model instance associated with this parameter.
   */
  get model() {
    return this._model
  }

  /**
   * Creates a clone of this {@link OffsetWrapperLabelModelParameter} object.
   */
  clone() {
    const inner = this.wrappedModelParameter.clone()
    return inner === this.wrappedModelParameter
      ? this
      : new OffsetWrapperLabelModelParameter(this.model, inner)
  }
}
