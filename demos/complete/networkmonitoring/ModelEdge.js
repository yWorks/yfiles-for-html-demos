/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component', 'ModelNode.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  ModelNode
) => {
  /**
   * Class representing an edge in the network model.
   * @implements {yfiles.lang.IPropertyObservable}
   */
  class ModelEdge extends yfiles.lang.Class(yfiles.lang.IPropertyObservable) {
    constructor() {
      super()
      this.$propertyChangedEvent = null
      this.$load = 0
      this.$source = null
      this.$target = null
      this.$failed = false
      this.$hasForwardPacket = false
      this.$hasBackwardPacket = false
      this.$enabled = false
    }

    /**
     * Sets the load of this edge.
     * Load is a value between 0 and 1 that indicates how utilized the edge is (with 0 being not at all and 1
     * being fully). Load also factors into the failure probability of edges in the
     * {@link NetworkSimulator}.
     * @type {number}
     */
    set load(value) {
      this.$load = value
      this.onPropertyChanged('Load')
    }

    /**
     * Gets the load of this edge.
     * Load is a value between 0 and 1 that indicates how utilized the edge is (with 0 being not at all and 1
     * being fully). Load also factors into the failure probability of edges in the
     * {@link NetworkSimulator}.
     * @type {number}
     */
    get load() {
      return this.$load
    }

    /**
     * Sets the source model node.
     * @type {ModelNode}
     */
    set source(value) {
      if (this.$source !== null) {
        this.$source.removePropertyChangedListener(this.nodePropertyChangedHandler.bind(this))
      }
      this.$source = value
      this.$source.addPropertyChangedListener(this.nodePropertyChangedHandler.bind(this))
    }

    /**
     * Gets the source model node.
     * @type {ModelNode}
     */
    get source() {
      return this.$source
    }

    /**
     * Sets the target model node.
     * @type {ModelNode}
     */
    set target(value) {
      if (this.$target !== null) {
        this.$target.removePropertyChangedListener(this.nodePropertyChangedHandler.bind(this))
      }
      this.$target = value
      this.$target.addPropertyChangedListener(this.nodePropertyChangedHandler.bind(this))
    }

    /**
     * Gets the source model node.
     * @type {ModelNode}
     */
    get target() {
      return this.$target
    }

    /**
     * Sets a value indicating whether this edge has failed.
     * @type {boolean}
     */
    set failed(value) {
      this.$failed = value
      this.onPropertyChanged('Failed')
    }

    /**
     * Gets a value indicating whether this edge has failed.
     * @type {boolean}
     */
    get failed() {
      return this.$failed
    }

    /**
     * Sets a value indicating whether this edge is delivering a packet in forward direction.
     * @type {boolean}
     */
    set hasForwardPacket(value) {
      this.$hasForwardPacket = value
      this.onPropertyChanged('HasForwardPacket')
    }

    /**
     * Gets a value indicating whether this edge is delivering a packet in forward direction.
     * @type {boolean}
     */
    get hasForwardPacket() {
      return this.$hasForwardPacket
    }

    /**
     * Sets a value indicating whether this edge is delivering a packet in backward direction.
     * @type {boolean}
     */
    set hasBackwardPacket(value) {
      this.$hasBackwardPacket = value
      this.onPropertyChanged('HasBackwardPacket')
    }

    /**
     * Gets a value indicating whether this edge is delivering a packet in backward direction.
     * @type {boolean}
     */
    get hasBackwardPacket() {
      return this.$hasBackwardPacket
    }

    /**
     * Gets a value indicating whether this edge is enabled.
     * An edge is enabled if and only if its attached nodes are enabled and have not failed.
     * @type {boolean}
     */
    get enabled() {
      return (
        this.source.enabled && this.target.enabled && !this.source.failed && !this.target.failed
      )
    }

    /**
     * Sets the property changed event.
     * @type {function(Object, yfiles.lang.PropertyChangedEventArgs)}
     */
    set propertyChangedEvent(value) {
      this.$propertyChangedEvent = value
    }

    /**
     * Gets the property changed event.
     */
    get propertyChangedEvent() {
      return this.$propertyChangedEvent
    }

    /**
     * Event handler for changes of edge properties.
     * @param {function(object, yfiles.lang.PropertyChangedEventArgs)} listener
     */
    addPropertyChangedListener(listener) {
      this.propertyChangedEvent = yfiles.lang.delegate.combine(this.propertyChangedEvent, listener)
    }

    /**
     * Event handler for changes of edge properties.
     * @param {function(object, yfiles.lang.PropertyChangedEventArgs)} listener
     */
    removePropertyChangedListener(listener) {
      this.propertyChangedEvent = yfiles.lang.delegate.remove(this.propertyChangedEvent, listener)
    }

    /**
     * Handles property change events from the attached nodes to update the {@link ModelEdge#enabled} property
     * accordingly, which depends on the end nodes being enabled and not broken.
     * @param {Object} sender
     * @param {yfiles.lang.PropertyChangedEventArgs} args
     */
    nodePropertyChangedHandler(sender, args) {
      const node = sender instanceof ModelNode ? sender : null
      if (node !== null && (args.propertyName === 'Enabled' || args.propertyName === 'Failed')) {
        this.onPropertyChanged('Enabled')
      }
    }

    /**
     * Called when a property of the edge changes.
     * @param {string} propertyName
     */
    onPropertyChanged(propertyName) {
      const handler = this.propertyChangedEvent
      if (handler !== null) {
        handler(this, new yfiles.lang.PropertyChangedEventArgs(propertyName))
      }
    }
  }

  return ModelEdge
})
