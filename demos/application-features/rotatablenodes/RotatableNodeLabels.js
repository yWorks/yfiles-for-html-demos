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
  Class,
  FreeNodeLabelModel,
  GraphMLAttribute,
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
  OrientedRectangle,
  TypeAttribute,
  YBoolean
} from 'yfiles'

import { RotatableNodeStyleDecorator } from './RotatableNodes.js'

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
  /**
   * Specifies whether or not the rotation of the label owner should be considered.
   */
  useNodeRotation

  /**
   * Specifies the wrapped label model.
   */
  wrapped

  /**
   * Creates a new instance of {@link RotatableNodeLabelModelDecorator}.
   * @param {!ILabelModel} wrapped
   */
  constructor(wrapped) {
    super()
    this.wrapped = wrapped || FreeNodeLabelModel.INSTANCE
    this.useNodeRotation = true
  }

  /**
   * Provides custom implementations of {@link ILabelModelParameterProvider} and
   * {@link ILabelModelParameterFinder} that consider the nodes rotation.
   * Wraps the default implementations in a special wrapper which supports rotation.
   * @template T
   * @param {!Class.<T>} type
   * @returns {?T}
   */
  lookup(type) {
    if (type === ILabelModelParameterProvider.$class) {
      const provider = this.wrapped.lookup(ILabelModelParameterProvider.$class)
      if (provider) {
        return new RotatedNodeLabelModelParameterProvider(provider)
      }
    }
    if (type === ILabelModelParameterFinder.$class) {
      const finder = this.wrapped.lookup(ILabelModelParameterFinder.$class)
      if (finder) {
        return new RotatedNodeLabelModelParameterFinder(finder)
      }
    }
    return null
  }

  /**
   * Returns the current geometry of the given label.
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} parameter
   * @returns {!IOrientedRectangle}
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

    const rotatedCenter = styleWrapper.getRotatedPoint(
      orientedRectangle.orientedRectangleCenter,
      label.owner,
      true
    )
    const rotatedLayout = styleWrapper.getRotatedLayout(label.owner)

    const rectangle = new OrientedRectangle(orientedRectangle)
    rectangle.angle += rotatedLayout.getRadians()
    rectangle.setCenter(rotatedCenter)
    return rectangle
  }

  /**
   * Creates a wrapped instance of the wrapped label model's default parameter.
   * @returns {!RotatableNodeLabelModelDecoratorParameter}
   */
  createDefaultParameter() {
    return new RotatableNodeLabelModelDecoratorParameter(
      this.wrapped.createDefaultParameter(),
      this
    )
  }

  /**
   * Creates a wrapped parameter containing the given parameter.
   * @param {!ILabelModelParameter} wrapped
   * @returns {!RotatableNodeLabelModelDecoratorParameter}
   */
  createWrappingParameter(wrapped) {
    return new RotatableNodeLabelModelDecoratorParameter(wrapped, this)
  }

  /**
   * Provides a lookup context for the given combination of label and parameter.
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} parameter
   * @returns {!ILookup}
   */
  getContext(label, parameter) {
    const wrappedParameter = this.getWrappedParameter(parameter)
    return wrappedParameter.model.getContext(label, wrappedParameter)
  }

  /**
   * Returns the wrapped label model parameter
   * @param {!ILabelModelParameter} parameter
   * @returns {!ILabelModelParameter}
   */
  getWrappedParameter(parameter) {
    return parameter instanceof RotatableNodeLabelModelDecoratorParameter
      ? parameter.wrapped
      : parameter
  }

  /**
   * Returns the wrapping style for nodes when {@link RotatableNodeStyleDecorator}
   * is used, null otherwise.
   * @param {!ILabel} label
   * @returns {?RotatableNodeStyleDecorator}
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
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {boolean}
   */
  canConvert(context, value) {
    return true
  }

  /**
   * Converts this label model using {@link RotatableNodeLabelModelDecoratorExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!RotatableNodeLabelModelDecoratorExtension}
   */
  convert(context, value) {
    const extension = new RotatableNodeLabelModelDecoratorExtension()
    extension.wrapped = this.wrapped
    extension.useNodeRotation = this.useNodeRotation
    return extension
  }
}

/**
 * A {@link ILabelModelParameter} decorator for node labels using
 * {@link RotatableNodeLabelModelDecorator} to adjust the label rotation to the node rotation.
 */
export class RotatableNodeLabelModelDecoratorParameter extends BaseClass(
  ILabelModelParameter,
  IMarkupExtensionConverter
) {
  _model
  /**
   * Creates a new instance wrapping the given parameter.
   * @param {!ILabelModelParameter} wrapped
   * @param {!ILabelModel} model
   */
  constructor(wrapped, model) {
    super()
    this.wrapped = wrapped
    this._model = model
  }

  /**
   * Returns a copy of this label model parameter.
   * @returns {*}
   */
  clone() {
    return new RotatableNodeLabelModelDecoratorParameter(this.wrapped, this.model)
  }

  /**
   * Returns the label model.
   * @type {!ILabelModel}
   */
  get model() {
    return this._model
  }

  /**
   * Specifies the label model.
   * @type {!ILabelModel}
   */
  set model(model) {
    this._model = model
  }

  /**
   * Specifies the wrapped label model parameter.
   */
  wrapped

  /**
   * Whether this parameter supports the given label.
   * Accepts node labels that are supported by the wrapped label model parameter.
   * @param {!ILabel} label
   * @returns {boolean}
   */
  supports(label) {
    return label.owner instanceof INode && this.wrapped.supports(label)
  }

  /**
   * Returns that this label model parameter can be converted.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {boolean}
   */
  canConvert(context, value) {
    return true
  }

  /**
   * Converts this label model parameter to a
   * {@link RotatableNodeLabelModelDecoratorParameterExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!RotatableNodeLabelModelDecoratorParameterExtension}
   */
  convert(context, value) {
    const extension = new RotatableNodeLabelModelDecoratorParameterExtension()
    extension.model = this._model
    extension.wrapped = this.wrapped
    return extension
  }
}

/**
 * Provides candidate parameters for rotated label models.
 */
class RotatedNodeLabelModelParameterProvider extends BaseClass(ILabelModelParameterProvider) {
  wrappedProvider

  /**
   * Returns a new instance using the given parameter provider.
   * @param {!ILabelModelParameterProvider} wrapped
   */
  constructor(wrapped) {
    super()
    this.wrappedProvider = wrapped
  }

  /**
   * Returns a set of possible wrapped {@link ILabelModelParameter} instances.
   * @param {!ILabel} label
   * @param {!ILabelModel} model
   * @returns {!IEnumerable.<ILabelModelParameter>}
   */
  getParameters(label, model) {
    const wrapperModel = model
    const parameters = this.wrappedProvider.getParameters(label, wrapperModel.wrapped)
    const result = new List()
    parameters.forEach((parameter) => {
      result.add(wrapperModel.createWrappingParameter(parameter))
    })
    return result
  }
}

/**
 * Finds the best {@link ILabelModelParameter} to approximate a specific rotated layout.
 */
class RotatedNodeLabelModelParameterFinder extends BaseClass(ILabelModelParameterFinder) {
  wrappedFinder

  /**
   * Creates a new instance using the given parameter finder.
   * @param {!ILabelModelParameterFinder} wrapped
   */
  constructor(wrapped) {
    super()
    this.wrappedFinder = wrapped
  }

  /**
   * Finds the label model parameter that describes the given label layout best. Sometimes the
   * layout cannot be met exactly, then the nearest location is used.
   * @param {!ILabel} label
   * @param {!ILabelModel} model
   * @param {!IOrientedRectangle} labelLayout
   * @returns {!ILabelModelParameter}
   */
  findBestParameter(label, model, labelLayout) {
    const wrapperModel = model
    const styleWrapper = wrapperModel.getNodeStyleWrapper(label)
    if (!wrapperModel.useNodeRotation || styleWrapper === null || styleWrapper.angle === 0) {
      return wrapperModel.createWrappingParameter(
        this.wrappedFinder.findBestParameter(label, wrapperModel.wrapped, labelLayout)
      )
    }

    const node = label.owner
    const rotatedCenter = styleWrapper.getRotatedPoint(
      labelLayout.orientedRectangleCenter,
      node,
      false
    )
    const rotatedLayout = styleWrapper.getRotatedLayout(node)

    const rectangle = new OrientedRectangle(labelLayout)
    rectangle.angle -= rotatedLayout.getRadians()
    rectangle.setCenter(rotatedCenter)

    return wrapperModel.createWrappingParameter(
      this.wrappedFinder.findBestParameter(label, wrapperModel.wrapped, rectangle)
    )
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecorator).
 */
export class RotatableNodeLabelModelDecoratorExtension extends MarkupExtension {
  _useNodeRotation = true
  _wrapped = null

  /**
   * @type {boolean}
   */
  get useNodeRotation() {
    return this._useNodeRotation
  }

  /**
   * @type {boolean}
   */
  set useNodeRotation(value) {
    this._useNodeRotation = value
  }

  /**
   * @type {!ILabelModel}
   */
  get wrapped() {
    return this._wrapped
  }

  /**
   * @type {!ILabelModel}
   */
  set wrapped(value) {
    this._wrapped = value
  }

  /**
   * Meta attributes for GraphML serialization.
   * @type {!object}
   */
  static get $meta() {
    return {
      useNodeRotation: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const labelModel = new RotatableNodeLabelModelDecorator(this.wrapped)
    labelModel.useNodeRotation = this.useNodeRotation
    return labelModel
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecoratorParameter).
 */
export class RotatableNodeLabelModelDecoratorParameterExtension extends MarkupExtension {
  _model = null
  _wrapped = null

  /**
   * @type {!ILabelModel}
   */
  get model() {
    return this._model
  }

  /**
   * @type {!ILabelModel}
   */
  set model(value) {
    this._model = value
  }

  /**
   * @type {!ILabelModelParameter}
   */
  get wrapped() {
    return this._wrapped
  }

  /**
   * @type {!ILabelModelParameter}
   */
  set wrapped(value) {
    this._wrapped = value
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const rotatableModel = this.model
    if (rotatableModel instanceof RotatableNodeLabelModelDecorator) {
      return rotatableModel.createWrappingParameter(this.wrapped)
    }
    return this.wrapped
  }
}
