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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * An enumeration for right or left port position.
   */
  const PortPosition = yfiles.lang.Enum('PortPosition', {
    LEFT: 1,
    RIGHT: 2
  })

  /**
   * A simple PortLocationModel that allows ports to be placed in the center left or center right
   * location of the node. This implementation also considers the lead and followUp time.
   * @class ActivityNodePortLocationModel
   * @implements {yfiles.graph.IPortLocationModel}
   */
  class ActivityNodePortLocationModel extends yfiles.lang.Class(yfiles.graph.IPortLocationModel) {
    /**
     * Calculates the port location for a parameter. Places the port at the right or left side of a node.
     * @param {yfiles.graph.IPort} port - The port to determine the location for.
     * @param {yfiles.graph.IPortLocationModelParameter} locationParameter - The parameter to use. The parameter can be
     *   expected to be created by this instance having the {@link yfiles.graph.IPortLocationModelParameter#model}
     *   property set to this instance..
     * @returns {yfiles.geometry.Point}
     */
    getLocation(port, locationParameter) {
      const node = port.owner
      const layout = node.layout
      if (locationParameter instanceof ActivityNodePortLocationModelParameter) {
        const tag = node.tag
        switch (locationParameter.position) {
          case PortPosition.RIGHT: {
            // get followUp time
            const followUpTime = tag.followUpTimeWidth ? tag.followUpTimeWidth : 0
            return new yfiles.geometry.Point(
              layout.x + layout.width + followUpTime,
              layout.y + layout.height * 0.5
            )
          }
          case PortPosition.LEFT:
          default: {
            // get lead time
            const leadTime = tag.leadTimeWidth ? tag.leadTimeWidth : 0
            return new yfiles.geometry.Point(layout.x - leadTime, layout.y + layout.height * 0.5)
          }
        }
      }
      // if we reach this point, parameter was not of type TaskNodePortLocationModelParameter
      return layout.center // use the node center as fallback.
    }

    /** Creates a suitable parameter for a location.
     * @param {yfiles.graph.IPortOwner} owner - The port owner that will own the port for which the parameter shall be
     *   created.
     * @param {yfiles.geometry.Point} location - The location in the world coordinate system that should be matched as
     *   best as possible.
     * @returns {yfiles.graph.IPortLocationModelParameter}
     */
    createParameter(owner, location) {
      // see if we are in the right or the left half of the node
      if (owner.layout && location.x > owner.layout.center.x) {
        return ActivityNodePortLocationModel.RIGHT
      }
      return ActivityNodePortLocationModel.LEFT
    }

    /**
     * @param {yfiles.graph.IPort} port - The port to use in the context.
     * @param {yfiles.graph.IPortLocationModelParameter} locationParameter - The parameter to use for the port in the
     *   context.
     * @returns {yfiles.graph.ILookup}
     */
    getContext(port, locationParameter) {
      // no special types to lookup
      return yfiles.graph.ILookup.EMPTY
    }

    /**
     * @param {yfiles.lang.Class} type - the type for which an instance shall be returned
     * @returns {*}
     */
    lookup(type) {
      return null
    }

    static get INSTANCE() {
      return instance
    }

    static get LEFT() {
      return left
    }

    static get RIGHT() {
      return right
    }
  }

  /**
   * The parameter used by this location model.
   * @extends yfiles.graph.IPortLocationModelParameter
   */
  class ActivityNodePortLocationModelParameter extends yfiles.lang.Class(
    yfiles.graph.IPortLocationModelParameter
  ) {
    /**
     * @param {PortPosition} position
     * @param {ActivityNodePortLocationModel} model
     */
    constructor(position, model) {
      super()
      this.$position = position
      this.$model = model
    }

    /**
     * @returns {PortPosition}
     */
    get position() {
      return this.$position
    }

    /**
     * @returns {yfiles.graph.IPortLocationModel}
     */
    get model() {
      return this.$model
    }

    /**
     * @param {yfiles.graph.IPortOwner} owner - The port owner to test.
     * @returns {boolean}
     */
    supports(owner) {
      // this implementation supports only nodes
      return yfiles.graph.INode.isInstance(owner)
    }

    /**
     * @returns {ActivityNodePortLocationModelParameter}
     */
    clone() {
      return new ActivityNodePortLocationModelParameter(this.$position, this.$model)
    }
  }

  const instance = new ActivityNodePortLocationModel()

  const left = new ActivityNodePortLocationModelParameter(PortPosition.LEFT, instance)
  const right = new ActivityNodePortLocationModelParameter(PortPosition.RIGHT, instance)

  return ActivityNodePortLocationModel
})
