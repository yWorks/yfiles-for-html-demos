/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FreeNodePortLocationModel,
  ILookup,
  IMarkupExtensionConverter,
  INode,
  IPort,
  IPortLocationModel,
  IPortLocationModelParameter,
  IPortOwner,
  IWriteContext,
  MarkupExtension,
  Matrix,
  Point
} from 'yfiles'

import { RotatableNodeStyleDecorator } from './RotatableNodes.js'

/**
 * Port location model decorator that automatically provides the location in the rotated coordinates of the owner.
 */
export class RotatablePortLocationModelDecorator extends BaseClass(
  IPortLocationModel,
  IMarkupExtensionConverter
) {
  /** @type {RotatablePortLocationModelDecorator} */
  static get INSTANCE() {
    if (typeof RotatablePortLocationModelDecorator.$INSTANCE === 'undefined') {
      RotatablePortLocationModelDecorator.$INSTANCE = new RotatablePortLocationModelDecorator()
    }

    return RotatablePortLocationModelDecorator.$INSTANCE
  }

  /** @type {RotatablePortLocationModelDecorator} */
  static set INSTANCE(INSTANCE) {
    RotatablePortLocationModelDecorator.$INSTANCE = INSTANCE
  }

  /**
   * Creates a new instance wrapping a {@link FreeNodePortLocationModel}.
   */
  constructor() {
    super()

    // The wrapped location model.
    // It is only used when new parameters are created via {@link #createParameter}.
    this.wrapped = new FreeNodePortLocationModel()
  }

  /**
   * Delegates to the wrapped location model's lookup.
   * @param {!Class} type
   */
  lookup(type) {
    return this.wrapped.lookup(type)
  }

  /**
   * Recalculates the coordinates provided by parameter.
   * This has only an effect when parameter is created by this model and the owner of port has a
   * {@link RotatableNodeStyleDecorator}.
   * @param {!IPort} port
   * @param {!IPortLocationModelParameter} parameter
   * @returns {!Point}
   */
  getLocation(port, parameter) {
    const param = parameter.wrapped
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
    matrix.rotate(-toRadians(angle), ownerNode.layout.center)
    return matrix.transform(coreLocation)
  }

  /**
   * Creates a parameter that matches the given location.
   * @param {!IPortOwner} portOwner
   * @param {!Point} location
   * @returns {!IPortLocationModelParameter}
   */
  createParameter(portOwner, location) {
    const angle = portOwner instanceof INode ? getAngle(portOwner) : 0
    if (Math.abs(angle) >= EPS) {
      const ownerNode = portOwner
      // Undo the rotation by the ownerNode so that we can create a core parameter for the un-rotated layout.
      const matrix = new Matrix()
      matrix.rotate(toRadians(angle), ownerNode.layout.center)
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
   * @param {!IPortLocationModelParameter} coreParameter
   * @returns {!IPortLocationModelParameter}
   */
  createWrappingParameter(coreParameter) {
    return new RotatablePortLocationModelDecoratorParameter(coreParameter, this)
  }

  /**
   * Returns the lookup of the wrapped location model.
   * @param {!IPort} port
   * @param {!IPortLocationModelParameter} parameter
   * @returns {!ILookup}
   */
  getContext(port, parameter) {
    return this.wrapped.getContext(port, parameter)
  }

  /**
   * Returns that this port location model can be converted.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {boolean}
   */
  canConvert(context, value) {
    return true
  }

  /**
   * Converts this port location model using {@link RotatablePortLocationModelDecoratorExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!MarkupExtension}
   */
  convert(context, value) {
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
  /**
   * Creates a new instance wrapping the given location model parameter.
   * @param {!IPortLocationModelParameter} wrapped
   * @param {!RotatablePortLocationModelDecorator} model
   */
  constructor(wrapped, model) {
    super()
    this._wrapped = wrapped
    this._model = model
  }

  /**
   * Creates a copy of this location model parameter.
   * @returns {*}
   */
  clone() {
    return new RotatablePortLocationModelDecoratorParameter(this.wrapped.clone(), this.model)
  }

  /**
   * Returns the model.
   * @type {!IPortLocationModel}
   */
  get model() {
    return this._model
  }

  /**
   * Returns the wrapped parameter.
   * @type {!IPortLocationModelParameter}
   */
  get wrapped() {
    return this._wrapped
  }

  /**
   * Accepts all port owners that are supported by the wrapped parameter.
   * @param {!IPortOwner} portOwner
   * @returns {boolean}
   */
  supports(portOwner) {
    return this.wrapped.supports(portOwner)
  }

  /**
   * Returns that this port location model parameter can be converted.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {boolean}
   */
  canConvert(context, value) {
    return true
  }

  /**
   * Converts this port location model parameter using {@link RotatablePortLocationModelDecoratorParameterExtension}.
   * @param {!IWriteContext} context
   * @param {*} value
   * @returns {!MarkupExtension}
   */
  convert(context, value) {
    const markupExtension = new RotatablePortLocationModelDecoratorParameterExtension()
    markupExtension.model =
      this.model === RotatablePortLocationModelDecorator.INSTANCE ? null : this.model
    markupExtension.wrapped = this.wrapped
    return markupExtension
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatablePortLocationModelDecorator).
 */
export class RotatablePortLocationModelDecoratorExtension extends MarkupExtension {
  constructor() {
    super()
    this._wrapped = null
  }

  /**
   * @type {!IPortLocationModel}
   */
  get wrapped() {
    return this._wrapped
  }

  /**
   * @type {!IPortLocationModel}
   */
  set wrapped(value) {
    this._wrapped = value
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const model = new RotatablePortLocationModelDecorator()
    model.wrapped = this.wrapped
    return model
  }
}

/**
 * Markup extension that helps (de-)serializing a {@link RotatablePortLocationModelDecoratorParameter).
 */
export class RotatablePortLocationModelDecoratorParameterExtension extends MarkupExtension {
  constructor() {
    super()
    this._model = null
    this._wrapped = null
  }

  /**
   * @type {?RotatablePortLocationModelDecorator}
   */
  get model() {
    return this._model
  }

  /**
   * @type {?RotatablePortLocationModelDecorator}
   */
  set model(value) {
    this._model = value
  }

  /**
   * @type {!IPortLocationModelParameter}
   */
  get wrapped() {
    return this._wrapped
  }

  /**
   * @type {!IPortLocationModelParameter}
   */
  set wrapped(value) {
    this._wrapped = value
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {*}
   */
  provideValue(serviceProvider) {
    const model =
      this.model instanceof RotatablePortLocationModelDecorator
        ? this.model
        : RotatablePortLocationModelDecorator.INSTANCE
    return model.createWrappingParameter(this.wrapped)
  }
}

/**
 * Returns the current angle of the given rotated node.
 * @param {!INode} node
 * @returns {number}
 */
function getAngle(node) {
  return node.style instanceof RotatableNodeStyleDecorator ? node.style.angle : 0
}

/**
 * Returns the given angle in radians.
 * @param {number} degrees
 * @returns {number}
 */
function toRadians(degrees) {
  return (degrees / 180) * Math.PI
}
