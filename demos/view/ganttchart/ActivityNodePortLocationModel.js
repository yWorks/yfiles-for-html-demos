/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  ILookup,
  INode,
  IPort,
  IPortLocationModel,
  IPortLocationModelParameter,
  IPortOwner,
  Point
} from 'yfiles'

/**
 * @readonly
 * @enum {number}
 */
const PortPosition = {
  LEFT: 1,
  RIGHT: 2
}

/**
 * A simple PortLocationModel that allows ports to be placed in the center left or center right
 * location of the node. This implementation also considers lead and followUp time.
 */
export default class ActivityNodePortLocationModel extends BaseClass(IPortLocationModel) {
  /**
   * Calculates the port location for a parameter. Places the port at the right or left side of a node.
   * @param {!IPort} port The port to determine the location for.
   * @param {!IPortLocationModelParameter} locationParameter The parameter to use. The parameter can be expected to be created by
   * this instance having the {@link IPortLocationModelParameter.model} property set to this
   * instance.
   * @returns {!Point}
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
          return new Point(layout.x + layout.width + followUpTime, layout.y + layout.height * 0.5)
        }
        case PortPosition.LEFT:
        default: {
          // get lead time
          const leadTime = tag.leadTimeWidth ? tag.leadTimeWidth : 0
          return new Point(layout.x - leadTime, layout.y + layout.height * 0.5)
        }
      }
    }
    // if we reach this point, parameter was not of type TaskNodePortLocationModelParameter
    return layout.center // use the node center as fallback.
  }

  /**
   * Creates a suitable parameter for a location.
   * @param {!IPortOwner} owner The port owner that will own the port for which the parameter shall be created.
   * @param {!Point} location The location in the world coordinate system that should be matched as best as
   * possible.
   * @returns {!IPortLocationModelParameter}
   */
  createParameter(owner, location) {
    const node = owner
    // see if we are in the right or the left half of the node
    if (node.layout && location.x > node.layout.center.x) {
      return ActivityNodePortLocationModel.RIGHT
    }
    return ActivityNodePortLocationModel.LEFT
  }

  /**
   * Returns the empty lookup.
   * @param {!IPort} port The port to use in the context.
   * @param {!IPortLocationModelParameter} locationParameter  The parameter to use for the port in the context.
   * @returns {!ILookup}
   */
  getContext(port, locationParameter) {
    // no special types to lookup
    return ILookup.EMPTY
  }

  /**
   * Returns always null.
   * @param {!Class} type the type for which an instance shall be returned
   * @returns {*}
   */
  lookup(type) {
    return null
  }

  /**
   * @type {!ActivityNodePortLocationModel}
   */
  static get INSTANCE() {
    return instance
  }

  /**
   * @type {!ActivityNodePortLocationModelParameter}
   */
  static get LEFT() {
    return left
  }

  /**
   * @type {!ActivityNodePortLocationModelParameter}
   */
  static get RIGHT() {
    return right
  }
}

/**
 * The parameter used by this location model.
 */
class ActivityNodePortLocationModelParameter extends BaseClass(IPortLocationModelParameter) {
  /**
   * @param {!PortPosition} position
   * @param {!ActivityNodePortLocationModel} model
   */
  constructor(position, model) {
    super()
    this.position = position
    this._model = model
  }

  /**
   * @type {!ActivityNodePortLocationModel}
   */
  get model() {
    return this._model
  }

  /**
   * Returns true if the given owner is a node.
   * @param {!IPortOwner} owner The port owner to test.
   * @returns {boolean}
   */
  supports(owner) {
    return owner instanceof INode
  }

  /**
   * @returns {*}
   */
  clone() {
    return new ActivityNodePortLocationModelParameter(this.position, this.model)
  }
}

const instance = new ActivityNodePortLocationModel()

const left = new ActivityNodePortLocationModelParameter(PortPosition.LEFT, instance)
const right = new ActivityNodePortLocationModelParameter(PortPosition.RIGHT, instance)
