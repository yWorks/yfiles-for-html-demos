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
  EdgeStyleBase,
  GeneralPath,
  IEdge,
  INode,
  IRenderContext,
  Point,
  ShapeNodeStyle,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * A custom edge style implementation for cubic Bézier curves. The curves are subdivided and each
 * edge is drawn with two colors (one from the source node and one from the target node).
 */
export class NonRibbonEdgeStyle extends EdgeStyleBase {
  /**
   * @param {number} [thickness]
   */
  constructor(thickness) {
    super()
    // meant to be used to create thicker edges
    this.thicknessOffset = thickness || 0
  }
  /**
   * Creates the visual for an edge.
   * @param {!IRenderContext} context The render context
   * @param {!IEdge} edge The edge to which this style instance is assigned
   * @yjs:keep = connections
   * @returns {?SvgVisual}
   */
  createVisual(context, edge) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // store the path of the edge, so that we can check whether something has changed if an update is needed
    g['data-renderDataCache'] = this.getPath(edge)

    // subdivide the Bézier curve in two curves so that we can apply the different colors
    const controlPoints = NonRibbonEdgeStyle.subdivideBezierCurve(edge)
    if (controlPoints.length === 0) {
      // this should not happen, since the configuration that we used for the circular layout must provide
      // two control points for each edge
      return null
    }

    const sourceColor = NonRibbonEdgeStyle.getColor(edge.sourceNode)
    const targetColor = NonRibbonEdgeStyle.getColor(edge.targetNode)
    // for the two parts of the curve, create a new path
    for (let i = 0; i < 2; i++) {
      const generalPath = new GeneralPath()
      generalPath.moveTo(controlPoints[i * 4])
      generalPath.cubicTo(
        controlPoints[4 * i + 1],
        controlPoints[4 * i + 2],
        controlPoints[4 * i + 3]
      )
      const path = generalPath.createSvgPath()
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', i === 0 ? sourceColor : targetColor)
      path.setAttribute('stroke-width', `${edge.tag.connections * 0.5 + this.thicknessOffset}`)
      g.appendChild(path)
    }

    return new SvgVisual(g)
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @param {!IEdge} edge The edge to which this style instance is assigned
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual, edge) {
    // get the data with which the oldvisual was created
    const oldCache = oldVisual.svgElement['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.getPath(edge)

    // check if something changed
    if (newCache.hasSameValue(oldCache)) {
      // nothing changed, return the old visual
      return oldVisual
    }
    return this.createVisual(context, edge)
  }

  /**
   * Returns the original edge path as cubic Bézier curve.
   * @param {!IEdge} edge The given edge
   * @returns {?GeneralPath}
   */
  getPath(edge) {
    if (edge.bends.size < 2) {
      // this should not happen, since the configuration that we used for the circular layout must provide
      // two control points for each edge
      return null
    }

    const path = new GeneralPath()
    path.moveTo(edge.sourcePort.location)
    path.cubicTo(edge.bends.get(0).location, edge.bends.get(1).location, edge.targetPort.location)
    return path
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * @param {!IInputModeContext} canvasContext The input mode context
   * @param {!Point} p The point to test
   * @param {!IEdge} edge The edge to which this style instance is assigned
   * @returns {boolean} True if the edge has been hit, false otherwise
   */
  isHit(canvasContext, p, edge) {
    const thickness = edge.tag.connections * 0.5 + this.thicknessOffset
    return this.getPath(edge).pathContains(p, canvasContext.hitTestRadius + thickness * 0.5)
  }

  /**
   * Subdivides the cubic curve in 2 sub-curves to apply the gradient.
   * @param {!IEdge} edge The edge to be subdivided
   * @returns {!Array.<Point>}
   */
  static subdivideBezierCurve(edge) {
    // should not happen, since the configuration that we used for the circular layout must provide
    // two control points for each edge
    if (edge.bends.size === 0 || edge.bends.size > 2) {
      return []
    }
    // the four original control points of th edge
    const p0 = edge.sourcePort.location.toPoint()
    const p1 = edge.bends.get(0).location.toPoint()
    const p2 = edge.bends.get(1).location.toPoint()
    const p3 = edge.targetPort.location.toPoint()

    // use the De Casteljau's algorithm
    const p4 = NonRibbonEdgeStyle.lerp(p0, p1)
    const p5 = NonRibbonEdgeStyle.lerp(p1, p2)
    const p6 = NonRibbonEdgeStyle.lerp(p2, p3)
    const p7 = NonRibbonEdgeStyle.lerp(p4, p5)
    const p8 = NonRibbonEdgeStyle.lerp(p5, p6)
    const p9 = NonRibbonEdgeStyle.lerp(p7, p8)

    return [p0, p4, p7, p9, p9, p8, p6, p3]
  }

  /**
   * Calculates the new bezier point that lies between the two original control points of the edge
   * @param {!Point} c1 The first original control point
   * @param {!Point} c2 The second original control point
   * @returns {!Point}
   */
  static lerp(c1, c2) {
    const t = 0.5
    return new Point(c1.x * (1 - t) + c2.x * t, c1.y * (1 - t) + c2.y * t)
  }

  /**
   * Returns the color of the given node.
   * In this demo, the node's style is ShapeNodeStyle.
   * @param {!INode} node
   */
  static getColor(node) {
    if (!(node.style instanceof ShapeNodeStyle)) {
      return 'black)'
    }
    const fill = node.style.fill.color
    return `rgba(${fill.r},${fill.g},${fill.b},${fill.a})`
  }
}
