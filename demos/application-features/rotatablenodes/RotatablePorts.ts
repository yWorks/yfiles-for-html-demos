/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FreeNodePortLocationModel,
  type ILookup,
  IMarkupExtensionConverter,
  INode,
  type IPort,
  IPortLocationModel,
  IPortLocationModelParameter,
  type IPortOwner,
  type IWriteContext,
  MarkupExtension,
  Matrix,
  type Point
} from '@yfiles/yfiles'

import { RotatableNodeStyleDecorator } from './RotatableNodes'

/**
 * Port location model decorator that automatically provides the location in the rotated coordinates of the owner.
 */
export class RotatablePortLocationModelDecorator extends BaseClass(
  IPortLocationModel,
  IMarkupExtensionConverter
) {
  /**
   * The wrapped location model.
   * It is only used when new parameters are created via {@link createParameter}.
   */
  public wrapped: IPortLocationModel = new FreeNodePortLocationModel()

  static INSTANCE: RotatablePortLocationModelDecorator = new RotatablePortLocationModelDecorator()

  /**
   * Recalculates the coordinates provided by parameter.
   * This has only an effect when parameter is created by this model and the owner of port has a
   * {@link RotatableNodeStyleDecorator}.
   */
  getLocation(port: IPort, parameter: IPortLocationModelParameter): Point {
    const param = (parameter as RotatablePortLocationModelDecoratorParameter).wrapped
    const coreLocation = this.wrapped.getLocation(port, param)
    const ownerNode = port.owner
    if (!(ownerNode instanceof INode)) {
      return coreLocation
    }

    const angle = getAngle(ownerNode)
    if (Math.abs(angle) < EPS) {
      return coreLocation
    }
    const matrix = new Matrix()
    matrix.rotate(toRadians(angle), ownerNode.layout.center)
    return matrix.transform(coreLocation)
  }

  /**
   * Creates a parameter that matches the given location.
   */
  createParameter(portOwner: IPortOwner, location: Point): IPortLocationModelParameter {
    const angle = portOwner instanceof INode ? getAngle(portOwner) : 0
    if (Math.abs(angle) >= EPS) {
      const ownerNode = portOwner as INode
      // Undo the rotation by the ownerNode so that we can create a core parameter for the un-rotated layout.
      const matrix = new Matrix()
      matrix.rotate(-toRadians(angle), ownerNode.layout.center)
      location = matrix.transform(location)
    }
    return new RotatablePortLocationModelDecoratorParameter(
      this.wrapped.createParameter(portOwner, location),
      this
    )
  }

  /**
   * Wraps a given parameter so it can be automatically rotated.
   * The core parameter is assumed to provide coordinates for an un-rotated owner.
   */
  createWrappingParameter(coreParameter: IPortLocationModelParameter): IPortLocationModelParameter {
    return new RotatablePortLocationModelDecoratorParameter(coreParameter, this)
  }

  /**
   * Returns the lookup of the wrapped location model.
   */
  getContext(port: IPort): ILookup {
    return this.wrapped.getContext(port)
  }

  /**
   * Returns that this port location model can be converted.
   */
  canConvert(context: IWriteContext, value: any): boolean {
    return true
  }

  /**
   * Converts this port location model using {@link RotatablePortLocationModelDecoratorExtension}.
   */
  convert(context: IWriteContext, value: any): MarkupExtension {
    const markupExtension = new RotatablePortLocationModelDecoratorExtension()
    markupExtension.wrapped = this.wrapped
    return markupExtension
  }
}

const EPS = 0.001

/**
 * A {@link IPortLocationModelParameter} decorator for ports using
 * {@link RotatablePortLocationModelDecorator} to adjust the port location to the node rotation.
 */
export class RotatablePortLocationModelDecoratorParameter extends BaseClass(
  IPortLocationModelParameter,
  IMarkupExtensionConverter
) {
  private readonly _wrapped: IPortLocationModelParameter
  private readonly _model: RotatablePortLocationModelDecorator

  /**
   * Creates a new instance wrapping the given location model parameter.
   */
  constructor(wrapped: IPortLocationModelParameter, model: RotatablePortLocationModelDecorator) {
    super()
    this._wrapped = wrapped
    this._model = model
  }

  /**
   * Creates a copy of this location model parameter.
   */
  clone(): this {
    return new RotatablePortLocationModelDecoratorParameter(
      this.wrapped.clone(),
      this.model as RotatablePortLocationModelDecorator
    ) as this
  }

  /**
   * Returns the model.
   */
  get model(): IPortLocationModel {
    return this._model
  }

  /**
   * Returns the wrapped parameter.
   */
  get wrapped(): IPortLocationModelParameter {
    return this._wrapped
  }

  /**
   * Returns that this port location model parameter can be converted.
   */
  canConvert(context: IWriteContext, value: any): boolean {
    return true
  }

  /**
   * Converts this port location model parameter using {@link RotatablePortLocationModelDecoratorParameterExtension}.
   */
  convert(context: IWriteContext, value: any): MarkupExtension {
    const markupExtension = new RotatablePortLocationModelDecoratorParameterExtension()
    markupExtension.model =
      this.model === RotatablePortLocationModelDecorator.INSTANCE
        ? null
        : (this.model as RotatablePortLocationModelDecorator)
    markupExtension.wrapped = this.wrapped
    return markupExtension
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatablePortLocationModelDecorator).
 */
export class RotatablePortLocationModelDecoratorExtension extends MarkupExtension {
  private _wrapped: IPortLocationModel = null!

  get wrapped(): IPortLocationModel {
    return this._wrapped
  }

  set wrapped(value: IPortLocationModel) {
    this._wrapped = value
  }

  provideValue(serviceProvider: ILookup): any {
    const model = new RotatablePortLocationModelDecorator()
    model.wrapped = this.wrapped
    return model
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatablePortLocationModelDecoratorParameter).
 */
export class RotatablePortLocationModelDecoratorParameterExtension extends MarkupExtension {
  private _model: RotatablePortLocationModelDecorator | null = null
  private _wrapped: IPortLocationModelParameter = null!

  get model(): RotatablePortLocationModelDecorator | null {
    return this._model
  }

  set model(value: RotatablePortLocationModelDecorator | null) {
    this._model = value
  }

  get wrapped(): IPortLocationModelParameter {
    return this._wrapped
  }

  set wrapped(value: IPortLocationModelParameter) {
    this._wrapped = value
  }

  provideValue(serviceProvider: ILookup): any {
    const model: RotatablePortLocationModelDecorator =
      this.model instanceof RotatablePortLocationModelDecorator
        ? this.model
        : RotatablePortLocationModelDecorator.INSTANCE
    return model.createWrappingParameter(this.wrapped)
  }
}

/**
 * Returns the current angle of the given rotated node.
 */
function getAngle(node: INode): number {
  return node.style instanceof RotatableNodeStyleDecorator ? node.style.angle : 0
}

/**
 * Returns the given angle in radians.
 */
function toRadians(degrees: number): number {
  return (degrees / 180) * Math.PI
}
