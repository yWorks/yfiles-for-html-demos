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
  Graph,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILookup,
  INode,
  IOrientedRectangle,
  List,
  OrientedRectangle,
  Point
} from '@yfiles/yfiles'

/**
 * Custom implementation of {@link ILabelModel} that provides either continuous or discrete label
 * positions directly around the node border.
 *
 * In addition to the label model itself, two important support interfaces
 * {@link ILabelModelParameterFinder} and {@link ILabelModelParameterProvider} are also
 * implemented.
 */
export class BorderAlignedLabelModel extends BaseClass(ILabelModel) {
  /**
   * The number of discrete label positions around the border.
   * A value of 0 signifies that continuous label positions are used.
   */
  candidateCount = 8

  /**
   * The offset of the label location, i.e., the distance to the node layout borders.
   */
  offset = 0

  /**
   * Calculates for the given parameter the actual geometry of the specified label in absolute world coordinates.
   *
   * The actual position is calculated from the {@link BorderAlignedLabelModelParameter.ratio} specified in the
   * parameter as the counterclockwise angle on the label owner's circumference. Note that we also rotate the label
   * layout itself accordingly.
   */
  getGeometry(label, layoutParameter) {
    const ownerNode = label.owner
    if (ownerNode instanceof INode && layoutParameter instanceof BorderAlignedLabelModelParameter) {
      // If we have a matching parameter and a node as owner, calculate the angle for the label position
      // and the matching rotation of the label layout box itself.
      const center = ownerNode.layout.center
      const radius = Math.max(ownerNode.layout.width, ownerNode.layout.height) * 0.5
      const angle = layoutParameter.ratio * Math.PI * 2
      const x = Math.sin(angle)
      const y = Math.cos(angle)
      const up = new Point(-y, x)
      const result = new OrientedRectangle()
      result.setUpVector(up)
      result.dynamicSize = label.preferredSize
      result.setCenter(
        center.add(up.multiply(this.offset + radius + label.preferredSize.height * 0.5))
      )
      return result
    }
    return IOrientedRectangle.EMPTY
  }

  /**
   * Factory method that creates a parameter for a given rotation angle.
   */
  createParameter(ratio) {
    return new BorderAlignedLabelModelParameter(this, ratio)
  }

  /**
   * Provides a lookup context for the given combination of label and parameter.
   */
  getContext(label) {
    return new BorderAlignedLabelModelLookup(label, this)
  }
}

/**
 * Custom implementation of {@link ILabelModelParameter} that is tailored to match
 * {@link BorderAlignedLabelModel} instances.
 */
export class BorderAlignedLabelModelParameter extends BaseClass(ILabelModelParameter) {
  ratio
  _model

  /**
   * Creates a new instance of {@link BorderAlignedLabelModelParameter}.
   * @param _model The model for this parameter
   * @param ratio The ratio for the given label model parameter
   */
  constructor(_model, ratio) {
    super()
    this._model = _model
    this.ratio = ratio
  }

  /**
   * Creates a clone of this {@link BorderAlignedLabelModelParameter} object.
   */
  clone() {
    // we have no mutable state, so return this.
    return this
  }

  /**
   * Returns the model instance to which this parameter belongs.
   *
   * This is usually a reference to the model instance that has created this parameter.
   */
  get model() {
    return this._model
  }
}

class BorderAlignedLabelModelLookup extends BaseClass(
  ILookup,
  ILabelModelParameterProvider,
  ILabelModelParameterFinder
) {
  model
  label

  constructor(label, model) {
    super()
    this.label = label
    this.model = model
    if (!Graph.hasOwner(label)) {
      throw new Error('The label has no valid owner.')
    }
    if (!(label.owner instanceof INode)) {
      throw new Error('This model supports only node labels.')
    }
  }

  /**
   * Returns instances of the support interfaces (which are actually the model instance itself)
   */
  lookup(type) {
    if (type === ILabelModelParameterProvider && this.model.candidateCount > 0) {
      // If we request a ILabelModelParameterProvider AND we use discrete label candidates, we return the label model
      // itself, otherwise, null is returned, which means that continuous label positions are supported.
      return this
    } else if (type === ILabelModelParameterFinder) {
      // If we request a ILabelModelParameterProvider, we return the label model itself, so we can always retrieve a
      // matching parameter for a given actual position.
      return this
    }
    return null
  }

  /**
   * Returns an enumerator over a set of possible {@link ILabelModelParameter}
   * instances that can be used for the given label and model.
   *
   * Since in {@link lookup}, we return an instance of this class only for positive {@link candidateCount}s,
   * this method is only called for __discrete__ candidates.
   */
  getParameters() {
    const parameters = new List()
    for (let i = 0; i < this.model.candidateCount; ++i) {
      parameters.add(this.model.createParameter(i / this.model.candidateCount))
    }
    return parameters
  }

  /**
   * Tries to find a parameter that best matches the given layout for the provided label instance.
   *
   * By default, this method is only called when __no discrete__ candidates are specified (i.e., here for
   * {@link candidateCount} = 0). This implementation just calculates the rotation angle for the center of layout and
   * creates a parameter for exactly this angle which {@link createParameter}.
   */
  findBestParameter(layout) {
    const direction = layout.center.subtract(this.label.owner.layout.center).normalized
    const ratio = Math.atan2(direction.y, -direction.x) / (Math.PI * 2)
    return this.model.createParameter(ratio)
  }

  clone() {
    // we have no mutable state, so return this.
    return this
  }
}
