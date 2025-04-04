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
  FreeNodeLabelModel,
  Graph,
  IEnumerable,
  ILabel,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILookup,
  IMarkupExtensionConverter,
  INode,
  IOrientedRectangle,
  IWriteContext,
  List,
  MarkupExtension,
  OrientedRectangle
} from '@yfiles/yfiles'
import { RotatableNodeStyleDecorator } from './RotatableNodes'
/**
 * A {@link ILabelModel} decorator for node labels that wraps another label model and considers the
 * {@link RotatableNodeStyleDecorator.angle rotation angle} of the label owner when a
 * {@link RotatableNodeStyleDecorator} is used.
 * This will make the node labels rotate with the node's rotation.
 */
export class RotatableNodeLabelModelDecorator extends BaseClass(
  ILabelModel,
  IMarkupExtensionConverter
) {
  wrapped
  useNodeRotation
  /**
   * Creates a new instance of {@link RotatableNodeLabelModelDecorator}.
   */
  constructor(wrapped, useNodeRotation = true) {
    super()
    this.wrapped = wrapped
    this.useNodeRotation = useNodeRotation
    this.wrapped = wrapped || FreeNodeLabelModel.INSTANCE
    this.useNodeRotation = useNodeRotation
  }
  /**
   * Returns the current geometry of the given label.
   */
  getGeometry(label, parameter) {
    const styleWrapper = this.getNodeStyleWrapper(label)
    const wrappedParameter = this.getWrappedParameter(parameter)
    const orientedRectangle = wrappedParameter.model.getGeometry(label, wrappedParameter)
    if (
      !this.useNodeRotation ||
      !(label.owner instanceof INode) ||
      styleWrapper === null ||
      styleWrapper.angle === 0
    ) {
      return orientedRectangle
    }
    const rotatedCenter = styleWrapper.getRotatedPoint(orientedRectangle.center, label.owner, true)
    const rotatedLayout = styleWrapper.getRotatedLayout(label.owner)
    const rectangle = new OrientedRectangle(orientedRectangle)
    rectangle.angle += rotatedLayout.getRadians()
    rectangle.setCenter(rotatedCenter)
    return rectangle
  }
  /**
   * Creates a wrapped parameter containing the given parameter.
   */
  createWrappingParameter(wrapped) {
    return new RotatableNodeLabelModelDecoratorParameter(wrapped, this)
  }
  /**
   * Provides a lookup context for the given combination of label and parameter.
   */
  getContext(label) {
    return new RotatableNodeLabelModelLookup(label, this)
  }
  /**
   * Returns the wrapped label model parameter
   */
  getWrappedParameter(parameter) {
    return parameter instanceof RotatableNodeLabelModelDecoratorParameter
      ? parameter.wrapped
      : parameter
  }
  /**
   * Returns the wrapping style for nodes when {@link RotatableNodeStyleDecorator}
   * is used, null otherwise.
   */
  getNodeStyleWrapper(label) {
    const node = label.owner
    if (node instanceof INode) {
      return node.style instanceof RotatableNodeStyleDecorator ? node.style : null
    }
    return null
  }
  /**
   * Returns that this label model can be converted.
   */
  canConvert(_context, _value) {
    return true
  }
  /**
   * Converts this label model using the {@link RotatableNodeLabelModelDecoratorExtension}.
   */
  convert(_context, _value) {
    const rotatableNodeLabelModelDecoratorExtension =
      new RotatableNodeLabelModelDecoratorExtension()
    rotatableNodeLabelModelDecoratorExtension.wrapped = this.wrapped
    rotatableNodeLabelModelDecoratorExtension.useNodeRotation = this.useNodeRotation
    return rotatableNodeLabelModelDecoratorExtension
  }
}
class RotatableNodeLabelModelLookup extends BaseClass(ILookup) {
  label
  model
  constructor(label, model) {
    super()
    this.label = label
    this.model = model
  }
  /**
   * Provides custom implementations of {@link ILabelModelParameterProvider} and
   * {@link ILabelModelParameterFinder} that consider the nodes' rotation.
   * Wraps the default implementations in a special wrapper which supports rotation.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup(type) {
    if (type === ILabelModelParameterProvider) {
      const provider = this.model.wrapped
        .getContext(this.label)
        .lookup(ILabelModelParameterProvider)
      if (provider) {
        return new RotatedNodeLabelModelParameterProvider(this.model, provider)
      }
    }
    if (type === ILabelModelParameterFinder) {
      const finder = this.model.wrapped.getContext(this.label).lookup(ILabelModelParameterFinder)
      if (finder) {
        return new RotatedNodeLabelModelParameterFinder(this.label, finder, this.model)
      }
    }
    return null
  }
}
/**
 * A {@link ILabelModelParameter} decorator for node labels using
 * {@link RotatableNodeLabelModelDecorator} to adjust the label rotation to the node rotation.
 */
export class RotatableNodeLabelModelDecoratorParameter extends BaseClass(ILabelModelParameter) {
  _model
  _wrapped
  /**
   * Creates a new instance wrapping the given parameter.
   */
  constructor(wrapped, model) {
    super()
    this._wrapped = wrapped
    this._model = model
  }
  get wrapped() {
    return this._wrapped
  }
  set wrapped(value) {
    this._wrapped = value
  }
  get model() {
    return this._model
  }
  set model(value) {
    this._model = value
  }
  /**
   * Returns a copy of this label model parameter.
   */
  clone() {
    return new RotatableNodeLabelModelDecoratorParameter(this._wrapped, this._model)
  }
  /**
   * Returns that this label model parameter can be converted.
   */
  canConvert(_context, _value) {
    return true
  }
  /**
   * Converts this label model parameter using the {@link RotatableNodeLabelModelDecoratorParameterExtension}.
   */
  convert(_context, _value) {
    const rotatableNodeLabelModelDecoratorParameterExtension =
      new RotatableNodeLabelModelDecoratorParameterExtension()
    rotatableNodeLabelModelDecoratorParameterExtension.model = this.model
    rotatableNodeLabelModelDecoratorParameterExtension.wrapped = this.wrapped
    return rotatableNodeLabelModelDecoratorParameterExtension
  }
}
/**
 * Provides candidate parameters for rotated label models.
 */
class RotatedNodeLabelModelParameterProvider extends BaseClass(ILabelModelParameterProvider) {
  decorator
  wrappedProvider
  /**
   * Creates a new instance using the given parameter provider.
   */
  constructor(decorator, wrappedProvider) {
    super()
    this.decorator = decorator
    this.wrappedProvider = wrappedProvider
    this.decorator = decorator
    this.wrappedProvider = wrappedProvider
  }
  /**
   * Returns a set of possible wrapped {@link ILabelModelParameter} instances.
   */
  getParameters() {
    const parameters = this.wrappedProvider.getParameters()
    const result = new List()
    parameters.forEach((parameter) => {
      result.add(this.decorator.createWrappingParameter(parameter))
    })
    return result
  }
}
/**
 * Finds the best {@link ILabelModelParameter} to approximate a specific rotated layout.
 */
class RotatedNodeLabelModelParameterFinder extends BaseClass(ILabelModelParameterFinder) {
  label
  wrappedFinder
  decorator
  /**
   * Creates a new instance using the given parameter finder.
   */
  constructor(label, wrappedFinder, decorator) {
    super()
    this.label = label
    this.wrappedFinder = wrappedFinder
    this.decorator = decorator
    if (!Graph.hasOwner(label)) {
      throw new Error(`The label has no valid owner: ${label.text}`)
    }
    if (!(label.owner instanceof INode)) {
      throw new Error(`This model only supports node labels: ${label.text}`)
    }
  }
  /**
   * Finds the label model parameter that describes the given label layout best. Sometimes the
   * layout cannot be met exactly, then the nearest location is used.
   */
  findBestParameter(labelLayout) {
    const styleWrapper = this.decorator.getNodeStyleWrapper(this.label)
    if (!this.decorator.useNodeRotation || styleWrapper == null || styleWrapper.angle == 0) {
      return this.decorator.createWrappingParameter(
        this.wrappedFinder.findBestParameter(labelLayout)
      )
    }
    const node = this.label.owner
    const rotatedCenter = styleWrapper.getRotatedPoint(labelLayout.center, node, false)
    const rotatedLayout = styleWrapper.getRotatedLayout(node)
    const rectangle = new OrientedRectangle(labelLayout)
    rectangle.angle -= rotatedLayout.getRadians()
    rectangle.setCenter(rotatedCenter)
    return this.decorator.createWrappingParameter(this.wrappedFinder.findBestParameter(rectangle))
  }
}
/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecorator).
 */
export class RotatableNodeLabelModelDecoratorExtension extends MarkupExtension {
  _useNodeRotation = true
  _wrapped = null
  get useNodeRotation() {
    return this._useNodeRotation
  }
  set useNodeRotation(value) {
    this._useNodeRotation = value
  }
  get wrapped() {
    return this._wrapped
  }
  set wrapped(value) {
    this._wrapped = value
  }
  provideValue(_serviceProvider) {
    const labelModel = new RotatableNodeLabelModelDecorator(this._wrapped)
    labelModel.useNodeRotation = this.useNodeRotation
    return labelModel
  }
  static create(item) {
    const extension = new RotatableNodeLabelModelDecoratorExtension()
    extension.wrapped = item.wrapped
    extension.useNodeRotation = item.useNodeRotation
    return extension
  }
}
/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecoratorParameter}.
 */
export class RotatableNodeLabelModelDecoratorParameterExtension extends MarkupExtension {
  _model = null
  _wrapped = null
  get model() {
    return this._model
  }
  set model(value) {
    this._model = value
  }
  get wrapped() {
    return this._wrapped
  }
  set wrapped(value) {
    this._wrapped = value
  }
  provideValue(serviceProvider) {
    const rotatableModel = this.model
    if (rotatableModel instanceof RotatableNodeLabelModelDecorator) {
      return rotatableModel.createWrappingParameter(this.wrapped)
    }
    return this.wrapped
  }
  static create(item) {
    const extension = new RotatableNodeLabelModelDecoratorParameterExtension()
    extension.model = item.model
    extension.wrapped = item.wrapped
    return extension
  }
}
