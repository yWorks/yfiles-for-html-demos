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

import { RotatableNodeStyleDecorator } from './RotatableNodes'

/**
 * A {@link ILabelModel} decorator for node labels that wraps another label model and considers the
 * {@link RotatableNodeStyleDecorator.angle rotation angle} of the label owner when a
 * {@link RotatableNodeStyleDecorator} is used.
 * This will make the node labels rotate with the node's rotation.
 */
export class RotatableNodeLabelModelDecorator
  extends BaseClass<ILabelModel, IMarkupExtensionConverter>(ILabelModel, IMarkupExtensionConverter)
  implements ILabelModel, IMarkupExtensionConverter
{
  /**
   * Specifies whether or not the rotation of the label owner should be considered.
   */
  useNodeRotation: boolean

  /**
   * Specifies the wrapped label model.
   */
  wrapped: ILabelModel

  /**
   * Creates a new instance of {@link RotatableNodeLabelModelDecorator}.
   */
  constructor(wrapped: ILabelModel) {
    super()
    this.wrapped = wrapped || FreeNodeLabelModel.INSTANCE
    this.useNodeRotation = true
  }

  /**
   * Provides custom implementations of {@link ILabelModelParameterProvider} and
   * {@link ILabelModelParameterFinder} that consider the nodes rotation.
   * Wraps the default implementations in a special wrapper which supports rotation.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup<T>(type: Class<T>): T | null {
    if (type === ILabelModelParameterProvider.$class) {
      const provider = this.wrapped.lookup(ILabelModelParameterProvider.$class)
      if (provider) {
        return new RotatedNodeLabelModelParameterProvider(provider) as T
      }
    }
    if (type === ILabelModelParameterFinder.$class) {
      const finder = this.wrapped.lookup(ILabelModelParameterFinder.$class)
      if (finder) {
        return new RotatedNodeLabelModelParameterFinder(finder) as T
      }
    }
    return null
  }

  /**
   * Returns the current geometry of the given label.
   */
  getGeometry(label: ILabel, parameter: ILabelModelParameter): IOrientedRectangle {
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
   */
  createDefaultParameter(): RotatableNodeLabelModelDecoratorParameter {
    return new RotatableNodeLabelModelDecoratorParameter(
      this.wrapped.createDefaultParameter(),
      this
    )
  }

  /**
   * Creates a wrapped parameter containing the given parameter.
   */
  createWrappingParameter(
    wrapped: ILabelModelParameter
  ): RotatableNodeLabelModelDecoratorParameter {
    return new RotatableNodeLabelModelDecoratorParameter(wrapped, this)
  }

  /**
   * Provides a lookup context for the given combination of label and parameter.
   */
  getContext(label: ILabel, parameter: ILabelModelParameter): ILookup {
    const wrappedParameter = this.getWrappedParameter(parameter)
    return wrappedParameter.model.getContext(label, wrappedParameter)
  }

  /**
   * Returns the wrapped label model parameter
   */
  getWrappedParameter(parameter: ILabelModelParameter): ILabelModelParameter {
    return parameter instanceof RotatableNodeLabelModelDecoratorParameter
      ? parameter.wrapped
      : parameter
  }

  /**
   * Returns the wrapping style for nodes when {@link RotatableNodeStyleDecorator}
   * is used, null otherwise.
   */
  getNodeStyleWrapper(label: ILabel): RotatableNodeStyleDecorator | null {
    const node = label.owner
    if (node instanceof INode) {
      return node.style instanceof RotatableNodeStyleDecorator ? node.style : null
    }
    return null
  }

  /**
   * Returns that this label model can be converted.
   */
  canConvert(context: IWriteContext, value: any): boolean {
    return true
  }

  /**
   * Converts this label model using {@link RotatableNodeLabelModelDecoratorExtension}.
   */
  convert(context: IWriteContext, value: any): RotatableNodeLabelModelDecoratorExtension {
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
export class RotatableNodeLabelModelDecoratorParameter
  extends BaseClass<ILabelModelParameter, IMarkupExtensionConverter>(
    ILabelModelParameter,
    IMarkupExtensionConverter
  )
  implements ILabelModelParameter, IMarkupExtensionConverter
{
  private _model: ILabelModel
  /**
   * Creates a new instance wrapping the given parameter.
   */
  constructor(wrapped: ILabelModelParameter, model: ILabelModel) {
    super()
    this.wrapped = wrapped
    this._model = model
  }

  /**
   * Returns a copy of this label model parameter.
   */
  clone(): this {
    return new RotatableNodeLabelModelDecoratorParameter(this.wrapped, this.model) as this
  }

  /**
   * Returns the label model.
   */
  get model(): ILabelModel {
    return this._model
  }

  /**
   * Specifies the label model.
   */
  set model(model: ILabelModel) {
    this._model = model
  }

  /**
   * Specifies the wrapped label model parameter.
   */
  wrapped: ILabelModelParameter

  /**
   * Whether this parameter supports the given label.
   * Accepts node labels that are supported by the wrapped label model parameter.
   */
  supports(label: ILabel): boolean {
    return label.owner instanceof INode && this.wrapped.supports(label)
  }

  /**
   * Returns that this label model parameter can be converted.
   */
  canConvert(context: IWriteContext, value: any): boolean {
    return true
  }

  /**
   * Converts this label model parameter to a
   * {@link RotatableNodeLabelModelDecoratorParameterExtension}.
   */
  convert(context: IWriteContext, value: any): RotatableNodeLabelModelDecoratorParameterExtension {
    const extension = new RotatableNodeLabelModelDecoratorParameterExtension()
    extension.model = this._model
    extension.wrapped = this.wrapped
    return extension
  }
}

/**
 * Provides candidate parameters for rotated label models.
 */
class RotatedNodeLabelModelParameterProvider
  extends BaseClass<ILabelModelParameterProvider>(ILabelModelParameterProvider)
  implements ILabelModelParameterProvider
{
  wrappedProvider: ILabelModelParameterProvider

  /**
   * Returns a new instance using the given parameter provider.
   */
  constructor(wrapped: ILabelModelParameterProvider) {
    super()
    this.wrappedProvider = wrapped
  }

  /**
   * Returns a set of possible wrapped {@link ILabelModelParameter} instances.
   */
  getParameters(label: ILabel, model: ILabelModel): IEnumerable<ILabelModelParameter> {
    const wrapperModel = model as RotatableNodeLabelModelDecorator
    const parameters = this.wrappedProvider.getParameters(label, wrapperModel.wrapped)
    const result = new List<ILabelModelParameter>()
    parameters.forEach((parameter) => {
      result.add(wrapperModel.createWrappingParameter(parameter))
    })
    return result
  }
}

/**
 * Finds the best {@link ILabelModelParameter} to approximate a specific rotated layout.
 */
class RotatedNodeLabelModelParameterFinder
  extends BaseClass<ILabelModelParameterFinder>(ILabelModelParameterFinder)
  implements ILabelModelParameterFinder
{
  wrappedFinder: ILabelModelParameterFinder

  /**
   * Creates a new instance using the given parameter finder.
   */
  constructor(wrapped: ILabelModelParameterFinder) {
    super()
    this.wrappedFinder = wrapped
  }

  /**
   * Finds the label model parameter that describes the given label layout best. Sometimes the
   * layout cannot be met exactly, then the nearest location is used.
   */
  findBestParameter(
    label: ILabel,
    model: ILabelModel,
    labelLayout: IOrientedRectangle
  ): ILabelModelParameter {
    const wrapperModel = model as RotatableNodeLabelModelDecorator
    const styleWrapper = wrapperModel.getNodeStyleWrapper(label)
    if (!wrapperModel.useNodeRotation || styleWrapper === null || styleWrapper.angle === 0) {
      return wrapperModel.createWrappingParameter(
        this.wrappedFinder.findBestParameter(label, wrapperModel.wrapped, labelLayout)
      )
    }

    const node = label.owner as INode
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
  private _useNodeRotation = true
  private _wrapped: ILabelModel = null!

  get useNodeRotation(): boolean {
    return this._useNodeRotation
  }

  set useNodeRotation(value: boolean) {
    this._useNodeRotation = value
  }

  get wrapped(): ILabelModel {
    return this._wrapped
  }

  set wrapped(value: ILabelModel) {
    this._wrapped = value
  }

  /**
   * Meta attributes for GraphML serialization.
   */
  static get $meta(): { useNodeRotation: (GraphMLAttribute | TypeAttribute)[] } {
    return {
      useNodeRotation: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class)
      ]
    }
  }

  provideValue(serviceProvider: ILookup): any {
    const labelModel = new RotatableNodeLabelModelDecorator(this.wrapped)
    labelModel.useNodeRotation = this.useNodeRotation
    return labelModel
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatableNodeLabelModelDecoratorParameter).
 */
export class RotatableNodeLabelModelDecoratorParameterExtension extends MarkupExtension {
  private _model: ILabelModel = null!
  private _wrapped: ILabelModelParameter = null!

  get model(): ILabelModel {
    return this._model
  }

  set model(value: ILabelModel) {
    this._model = value
  }

  get wrapped(): ILabelModelParameter {
    return this._wrapped
  }

  set wrapped(value: ILabelModelParameter) {
    this._wrapped = value
  }

  provideValue(serviceProvider: ILookup): any {
    const rotatableModel = this.model
    if (rotatableModel instanceof RotatableNodeLabelModelDecorator) {
      return rotatableModel.createWrappingParameter(this.wrapped)
    }
    return this.wrapped
  }
}
