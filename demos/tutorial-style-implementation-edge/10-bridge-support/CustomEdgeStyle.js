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
  BridgeManager,
  EdgeStyleBase,
  IArrow,
  IObstacleProvider,
  SvgVisual
} from 'yfiles'

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 * @typedef {Object} Cache
 * @property {GeneralPath} generalPath
 * @property {number} distance
 * @property {string} loadColor
 * @property {number} obstacleHash
 */

/**
 * @typedef {TaggedSvgVisual.<SVGGElement,Cache>} CustomEdgeStyleVisual
 */

export class CustomEdgeStyle extends EdgeStyleBase {
  /**
   * Creates a new instance of this style using the given distance.
   * @param distance The distance between the paths. The default value is 1.
   * @param {number} [distance=1]
   */
  constructor(distance = 1) {
    super()
    this.distance = distance
  }

  /**
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @returns {!CustomEdgeStyleVisual}
   */
  createVisual(context, edge) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const generalPath = super.getPath(edge)
    const distance = this.distance
    const loadColor = this.getLoadColor(edge)
    const croppedGeneralPath = super.cropPath(edge, IArrow.NONE, IArrow.NONE, generalPath)

    const pathWithBridges = this.createPathWithBridges(croppedGeneralPath, context)
    const obstacleHash = this.getObstacleHash(context)

    const widePath = pathWithBridges.createSvgPath()
    widePath.setAttribute('fill', 'none')
    widePath.setAttribute('stroke', 'black')
    widePath.setAttribute('stroke-width', String(distance + 2))
    group.append(widePath)

    const thinPath = pathWithBridges.createSvgPath()
    thinPath.setAttribute('fill', 'none')
    thinPath.setAttribute('stroke', loadColor)
    thinPath.setAttribute('stroke-width', String(distance))
    group.append(thinPath)

    return SvgVisual.from(group, {
      generalPath,
      distance,
      loadColor,
      obstacleHash
    })
  }

  /**
   * @param {!IRenderContext} context
   * @param {!CustomEdgeStyleVisual} oldVisual
   * @param {!IEdge} edge
   * @returns {!CustomEdgeStyleVisual}
   */
  updateVisual(context, oldVisual, edge) {
    const cache = oldVisual.tag

    const group = oldVisual.svgElement
    const widePath = group.children[0]
    const thinPath = group.children[1]

    const newGeneralPath = super.getPath(edge)
    const newObstacleHash = this.getObstacleHash(context)
    if (!newGeneralPath.hasSameValue(cache.generalPath) || newObstacleHash !== cache.obstacleHash) {
      const croppedGeneralPath = super.cropPath(edge, IArrow.NONE, IArrow.NONE, newGeneralPath)
      const pathWithBridges = this.createPathWithBridges(croppedGeneralPath, context)
      const pathData = pathWithBridges.createSvgPathData()

      widePath.setAttribute('d', pathData)
      thinPath.setAttribute('d', pathData)

      cache.generalPath = newGeneralPath
      cache.obstacleHash = newObstacleHash
    }

    if (this.distance !== cache.distance) {
      widePath.setAttribute('stroke-width', String(this.distance + 2))
      thinPath.setAttribute('stroke-width', String(this.distance))
      cache.distance = this.distance
    }

    const newLoadColor = this.getLoadColor(edge)
    if (newLoadColor !== cache.loadColor) {
      thinPath.setAttribute('stroke', newLoadColor)
      cache.loadColor = newLoadColor
    }

    return oldVisual
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} location
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isHit(context, location, edge) {
    const thickness = this.distance + 2
    const edgePath = super.getPath(edge)
    return edgePath.pathContains(location, context.hitTestRadius + thickness * 0.5)
  }

  /**
   * @param {!ICanvasContext} context
   * @param {!Rect} rectangle
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isVisible(context, rectangle, edge) {
    return rectangle.intersects(this.getBounds(context, edge))
  }

  /**
   * @param {!ICanvasContext} context
   * @param {!IEdge} edge
   * @returns {!Rect}
   */
  getBounds(context, edge) {
    const path = super.getPath(edge)
    const thickness = this.distance + 2

    return path.getBounds().getEnlarged(thickness * 0.5)
  }

  /**
   * @param {!IEdge} edge
   * @param {!Class} type
   * @returns {*}
   */
  lookup(edge, type) {
    if (type === IObstacleProvider.$class) {
      const getPath = this.getPath.bind(this)
      return new (class extends BaseClass(IObstacleProvider) {
        /**
         * @param {!IRenderContext} context
         * @returns {?GeneralPath}
         */
        getObstacles(context) {
          return getPath(edge)
        }
      })()
    }
    return super.lookup(edge, type)
  }

  /**
   * @param {!IRenderContext} context
   * @returns {number}
   */
  getObstacleHash(context) {
    const manager = context.lookup(BridgeManager.$class)
    return manager ? manager.getObstacleHash(context) : 42
  }

  /**
   * @param {!GeneralPath} path
   * @param {!IRenderContext} context
   * @returns {!GeneralPath}
   */
  createPathWithBridges(path, context) {
    const manager = context.lookup(BridgeManager.$class)
    return manager ? manager.addBridges(context, path) : path
  }

  /**
   * Returns the color of an edge based on the load property of its tag object.
   * @param {!IEdge} edge The edge to get a color for.
   * @returns {!string} The color string associated with the load value of the edge object. If the load value
   * of {@link IEdge.tag} is not specified, the function returns the default color 'white'.
   */
  getLoadColor(edge) {
    switch (edge.tag?.load) {
      case 'Free':
        return '#76b041'
      case 'Moderate':
        return '#ffc914'
      case 'Overloaded':
        return '#ff6c00'
      default:
        return 'white'
    }
  }
}
