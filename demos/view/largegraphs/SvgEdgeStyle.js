/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  Color,
  EdgeStyleBase,
  IArrow,
  ICanvasContext,
  IEdge,
  IPort,
  IRenderContext,
  Matrix,
  Point,
  PolylineEdgeStyle,
  Rect,
  SvgVisual,
  Visual,
  YObject
} from 'yfiles'

/**
 * A faster edge style. Compared to the default {@link PolylineEdgeStyle}, the edge is not cropped
 * at the node boundaries and doesn't support arrows.
 */
export default class SvgEdgeStyle extends EdgeStyleBase {
  /**
   * Creates a new instance of this class.
   * @param {Color} [color] The edge color.
   * @param {Number} [thickness] The edge thickness
   */
  constructor(color, thickness) {
    super()
    this.$color = color || Color.BLACK
    this.$thickness = thickness || 1
  }

  /**
   * Callback that creates the visual.
   * This method is called in response to a {@link IVisualCreator#createVisual}
   * call to the instance that has been queried from the {@link EdgeStyleBase#renderer}.
   * @param {IRenderContext} context The render context.
   * @param {IEdge} edge The edge to which this style instance is assigned.
   * @return {Visual} The visual as required by the {@link IVisualCreator#createVisual}
   *   interface.
   * @see {@link EdgeStyleBase#updateVisual}
   */
  createVisual(context, edge) {
    const source = getLocation(edge.sourcePort)
    const target = getLocation(edge.targetPort)

    const color = this.$color

    // create the path
    const pathVisual = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathVisual.setAttribute('d', createSvgPath(source, target, edge))
    pathVisual.setAttribute('fill', 'none')
    pathVisual.setAttribute('stroke', `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`)
    pathVisual.setAttribute('stroke-width', this.$thickness)

    // cache its values
    pathVisual['data-cache'] = createRenderDataCache(edge, source, target)

    return new SvgVisual(pathVisual)
  }

  /**
   * Callback that updates the visual previously created by {@link EdgeStyleBase#createVisual}.
   * This method is called in response to a {@link IVisualCreator#updateVisual}
   * call to the instance that has been queried from the {@link EdgeStyleBase#renderer}.
   * This implementation simply delegates to {@link EdgeStyleBase#createVisual} so subclasses
   * should override to improve rendering performance.
   * @param {IRenderContext} context The render context.
   * @param {Visual} oldVisual The visual that has been created in the call to
   *   {@link EdgeStyleBase#createVisual}.
   * @param {IEdge} edge The edge to which this style instance is assigned.
   * @return {Visual} The visual as required by the {@link IVisualCreator#createVisual}
   *   interface.
   * @see {@link EdgeStyleBase#createVisual}
   */
  updateVisual(context, oldVisual, edge) {
    const source = getLocation(edge.sourcePort)
    const target = getLocation(edge.targetPort)

    // get the old path
    const pathVisual = oldVisual.svgElement
    const cache = pathVisual['data-cache']
    const oldSource = cache.source
    const oldTarget = cache.target

    const bendLocations = getBendLocations(edge)

    // Did anything change at all? If not, we can just re-use the old visual
    if (
      oldSource.equals(source) &&
      oldTarget.equals(target) &&
      arrayEqual(bendLocations, cache.bendLocations)
    ) {
      return oldVisual
    }

    // Otherwise re-create the geometry and update the cache
    pathVisual.setAttribute('d', createSvgPath(source, target, edge))
    pathVisual['data-cache'] = createRenderDataCache(edge, source, target)
    return oldVisual
  }

  /**
   * Override visibility test to optimize performance.
   * @param {ICanvasContext} context
   * @param {Rect} rectangle
   * @param {IEdge} edge
   * @returns {boolean}
   */
  isVisible(context, rectangle, edge) {
    // delegate the visibility test to PolylineEdgeStyle, which has an efficient implementation
    return helperEdgeStyle.renderer
      .getVisibilityTestable(edge, helperEdgeStyle)
      .isVisible(context, rectangle)
  }
}

// an edge style instance for efficient visibility testing
const helperEdgeStyle = new PolylineEdgeStyle({
  sourceArrow: IArrow.NONE,
  targetArrow: IArrow.NONE
})

/**
 * Helper method to cache the edge's data.
 * @param {IEdge} edge
 * @param {Point} source
 * @param {Point} target
 * @return {Object}
 */
function createRenderDataCache(edge, source, target) {
  return {
    source,
    target,
    bendLocations: getBendLocations(edge)
  }
}

/**
 * Gets the location of a port.
 * {@link IPort#location} returns a live view of the port's location. This method avoids the associated
 *   overhead.
 * @param {IPort} port The port.
 * @return {Point} The port's location.
 */
function getLocation(port) {
  const param = port.locationParameter
  return param.model.getLocation(port, param)
}

/**
 * Creates the edge path's geometry.
 * @param {Point} source The source port location.
 * @param {Point} target The target port location.
 * @param {IEdge} edge The edge.
 * @return {string} The edge path's geometry.
 */
function createSvgPath(source, target, edge) {
  const path = edge.style.renderer.getPathGeometry(edge, edge.style).getPath()
  return path.createSvgPathData(new Matrix())
}

/**
 * Gets a list of bend locations from an edge.
 * @param {IEdge} edge The edge.
 * @return {Point[]} A list of the edge's bend locations, or an empty list if there are no bends.
 */
function getBendLocations(edge) {
  const count = edge.bends.size
  const points = new Array(count)
  for (let i = 0; i < count; i++) {
    points[i] = edge.bends.get(i).location.toPoint()
  }
  return points
}

/**
 * Compares two arrays for equality.
 * @param {T[]} a The first array.
 * @param {T[]} b The second array.
 * @return {boolean}
 *   <code>true</code> if both arrays have the same length and all elements of one array compare equal to the
 *   respective element in the other array, <code>false</code> otherwise.
 * @template T
 */
function arrayEqual(a, b) {
  if (YObject.referenceEquals(a, b)) {
    return true
  }

  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (!a[i].equals(b[i])) {
      return false
    }
  }
  return true
}
