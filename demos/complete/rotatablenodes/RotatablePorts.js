/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component', 'RotatableNodes.js'], (yfiles, RotatableNodes) => {
  /**
   * Port location model decorator that automatically provides the location in the rotated coordinates of the owner.
   */
  class RotatablePortLocationModelDecorator extends yfiles.lang.Class(
    yfiles.graph.IPortLocationModel,
    yfiles.graphml.IMarkupExtensionConverter
  ) {
    static get INSTANCE() {
      // eslint-disable-next-line no-return-assign
      return (
        RotatablePortLocationModelDecorator.$instance ||
        (RotatablePortLocationModelDecorator.$instance = new RotatablePortLocationModelDecorator())
      )
    }

    /**
     * Creates a new instance wrapping a {@link yfiles.graph.FreeNodePortLocationModel}.
     */
    constructor() {
      super()
      this.$wrapped = new yfiles.graph.FreeNodePortLocationModel()
    }

    /**
     * Returns the wrapped location model.
     * @return {yfiles.graph.FreeNodePortLocationModel}
     */
    get wrapped() {
      return this.$wrapped
    }

    /**
     * Specifies the wrapped location model.
     * It is only used when new parameters are created via {@link #createParameter}.
     * @param {yfiles.graph.FreeNodePortLocationModel} wrapped
     */
    set wrapped(wrapped) {
      this.$wrapped = wrapped
    }

    /**
     * Delegates to the wrapped location model's lookup.
     * @param {yfiles.lang.Class} type
     */
    lookup(type) {
      return this.wrapped.lookup(type)
    }

    /**
     * Recalculates the coordinates provided by parameter.
     * This has only an effect when parameter is created by this model and the owner of port has a
     * {@link RotatableNodes.RotatableNodeStyleDecorator}.
     * @param {yfiles.graph.IPort} port
     * @param {yfiles.graph.IPortLocationModelParameter} parameter
     * @return {yfiles.geometry.Point}
     */
    getLocation(port, parameter) {
      const param = parameter.wrapped
      const coreLocation = this.wrapped.getLocation(port, param)
      const ownerNode = port.owner
      if (!yfiles.graph.INode.isInstance(ownerNode)) {
        return coreLocation
      }

      const angle = getAngle(ownerNode)
      if (Math.abs(angle) < EPS) {
        return coreLocation
      }
      const matrix = new yfiles.geometry.Matrix()
      matrix.rotate(-toRadians(angle), ownerNode.layout.center)
      return matrix.transform(coreLocation)
    }

    /**
     * Creates a parameter that matches the given location.
     * @param {yfiles.graph.IPortOwner} portOwner
     * @param {yfiles.geometry.Point} location
     * @return {yfiles.graph.IPortLocationModelParameter}
     */
    createParameter(portOwner, location) {
      const ownerNode = portOwner
      const angle = yfiles.graph.INode.isInstance(ownerNode) ? getAngle(ownerNode) : 0
      if (Math.abs(angle) >= EPS) {
        // Undo the rotation by the ownerNode so that we can create a core parameter for the unrotated layout.
        const matrix = new yfiles.geometry.Matrix()
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
     * @param {yfiles.graph.IPortLocationModelParameter} coreParameter
     * @return {yfiles.graph.IPortLocationModelParameter}
     */
    createWrappingParameter(coreParameter) {
      return new RotatablePortLocationModelDecoratorParameter(coreParameter, this)
    }

    /**
     * Returns the lookup of the wrapped location model.
     * @param {yfiles.graph.IPort} port
     * @param {yfiles.graph.IPortLocationModelParameter} parameter
     * @return {yfiles.graph.ILookup}
     */
    getContext(port, parameter) {
      return this.wrapped.getContext(port, parameter)
    }

    /**
     * Returns that this port location model can be converted.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {boolean}
     */
    canConvert(context, value) {
      return true
    }

    /**
     * Converts this port location model using {@link RotatablePortLocationModelDecoratorExtension}.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {yfiles.graphml.MarkupExtension}
     */
    convert(context, value) {
      const markupExtension = new RotatablePortLocationModelDecoratorExtension()
      markupExtension.wrapped = this.wrapped
      return markupExtension
    }
  }

  const EPS = 0.001

  /**
   * A {@link yfiles.graph.IPortLocationModelParameter} decorator for ports using
   * {@link RotatablePortLocationModelDecorator} to adjust the port location to the node rotation.
   */
  class RotatablePortLocationModelDecoratorParameter extends yfiles.lang.Class(
    yfiles.graph.IPortLocationModelParameter,
    yfiles.graphml.IMarkupExtensionConverter
  ) {
    /**
     * Creates a new instance wrapping the given location model parameter.
     * @param {yfiles.graph.IPortLocationModelParameter} wrapped
     * @param {RotatablePortLocationModelDecorator} model
     */
    constructor(wrapped, model) {
      super()
      this.$wrapped = wrapped
      this.$model = model
    }

    /**
     * Creates a copy of this location model parameter.
     * @return {RotatablePortLocationModelDecoratorParameter}
     */
    clone() {
      return new RotatablePortLocationModelDecoratorParameter(this.wrapped.clone(), this.model)
    }

    /**
     * Returns the model.
     * @return {RotatablePortLocationModelDecorator}
     */
    get model() {
      return this.$model
    }

    /**
     * Returns the wrapped parameter.
     * @return {RotatablePortLocationModelDecorator}
     */
    get wrapped() {
      return this.$wrapped
    }

    /**
     * Accepts all port owners that are supported by the wrapped parameter.
     * @param {yfiles.graph.IPortOwner} portOwner
     * @return {boolean}
     */
    supports(portOwner) {
      return this.wrapped.supports(portOwner)
    }

    /**
     * Returns that this port location model parameter can be converted.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {boolean}
     */
    canConvert(context, value) {
      return true
    }

    /**
     * Converts this port location model parameter using {@link RotatablePortLocationModelDecoratorParameterExtension}.
     * @param {yfiles.graphml.IWriteContext} context
     * @param {object} value
     * @return {yfiles.graphml.MarkupExtension}
     */
    convert(context, value) {
      const markupExtension = new RotatablePortLocationModelDecoratorParameterExtension()
      markupExtension.model = RotatablePortLocationModelDecoratorParameter.INSTANCE
        ? null
        : this.model
      markupExtension.wrapped = this.wrapped
      return markupExtension
    }
  }

  /**
   * Markup extension that helps (de-)serializing a {@link RotatablePortLocationModelDecorator).
   */
  const RotatablePortLocationModelDecoratorExtension = yfiles.lang.Class(
    'RotatablePortLocationModelDecoratorExtension',
    {
      $extends: yfiles.graphml.MarkupExtension,

      $wrapped: null,
      wrapped: {
        get() {
          return this.$wrapped
        },
        set(value) {
          this.$wrapped = value
        }
      },

      /**
       * @param {yfiles.graph.ILookup} serviceProvider
       * @return {object}
       */
      provideValue(serviceProvider) {
        const model = new RotatablePortLocationModelDecorator()
        model.wrapped = this.wrapped
        return model
      }
    }
  )

  /**
   * Markup extension that helps (de-)serializing a {@link RotatablePortLocationModelDecoratorParameter).
   */
  const RotatablePortLocationModelDecoratorParameterExtension = yfiles.lang.Class(
    'RotatablePortLocationModelDecoratorParameterExtension',
    {
      $extends: yfiles.graphml.MarkupExtension,

      $model: null,
      model: {
        get() {
          return this.$model
        },
        set(value) {
          this.$model = value
        }
      },

      $wrapped: null,
      wrapped: {
        get() {
          return this.$wrapped
        },
        set(value) {
          this.$wrapped = value
        }
      },

      /**
       * @param {yfiles.graph.ILookup} serviceProvider
       * @return {object}
       */
      provideValue(serviceProvider) {
        const model =
          this.model instanceof RotatablePortLocationModelDecorator
            ? this.model
            : RotatablePortLocationModelDecorator.INSTANCE
        return model.createWrappingParameter(this.wrapped)
      }
    }
  )

  /**
   * Returns the current angle of the given rotated node.
   * @param {yfiles.graph.INode} node
   * @return {number}
   */
  function getAngle(node) {
    return node.style instanceof RotatableNodes.RotatableNodeStyleDecorator ? node.style.angle : 0
  }

  /**
   * Returns the given angle in radians.
   * @param {number} degrees
   * @return {number}
   */
  function toRadians(degrees) {
    return degrees / 180 * Math.PI
  }

  return {
    RotatablePortLocationModelDecorator,
    RotatablePortLocationModelDecoratorParameter,
    RotatablePortLocationModelDecoratorExtension,
    RotatablePortLocationModelDecoratorParameterExtension
  }
})
