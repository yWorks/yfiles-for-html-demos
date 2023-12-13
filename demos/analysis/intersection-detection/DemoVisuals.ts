/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
  Color,
  Comparers,
  IEdge,
  INode,
  Intersection,
  Intersections,
  IRenderContext,
  IVisualCreator,
  Point,
  SvgVisual,
  Visual
} from 'yfiles'
import { colorSets } from 'demo-resources/demo-styles'

const EDGE_EDGE_INTERSECTION_COLOR = Color.from(colorSets['demo-palette-13'].fill)
const NODE_EDGE_INTERSECTION_COLOR = Color.from(colorSets['demo-red'].fill)
const NODE_NODE_INTERSECTION_FILL = Color.from(colorSets['demo-palette-22'].fill)
const NODE_NODE_INTERSECTION_STROKE = Color.from(colorSets['demo-palette-22'].stroke)
const LABEL_INTERSECTION_COLOR_FILL = Color.from(colorSets['demo-green'].fill)
const LABEL_INTERSECTION_COLOR_STROKE = Color.from(colorSets['demo-green'].stroke)

/**
 * Visualizes intersections calculated by the {@link Intersections} algorithm.
 */
export class IntersectionVisualCreator
  extends BaseClass<IVisualCreator>(IVisualCreator)
  implements IVisualCreator
{
  public intersections: Intersection[] = []

  /**
   * Creates the visual showing the intersections found by the intersection algorithm.
   * @param context The context that describes where the visual will be used
   * @returns The intersection visual
   */
  createVisual(context: IRenderContext): Visual {
    //sort the intersections so that area intersections (contain more points) are drawn first
    this.intersections.sort(
      (a, b) => -Comparers.compare(a.intersectionPoints.size, b.intersectionPoints.size)
    )

    //draw each intersection
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    for (const intersection of this.intersections) {
      const { mainColor, stroke } = getIntersectionColors(intersection)
      const points = intersection.intersectionPoints.toArray()
      if (points.length > 2) {
        // a polygon/area defines the intersection
        element.appendChild(createPolygonElement(points, mainColor, stroke))
      } else if (points.length == 2) {
        // a line that describes the intersection
        element.appendChild(createLineElement(points[0], points[1], mainColor))
        element.appendChild(createPointElement(points[0], mainColor))
        element.appendChild(createPointElement(points[1], mainColor))
      } else {
        // a single point intersection
        element.appendChild(createPointElement(points[0], mainColor))
      }
    }

    return new SvgVisual(element)
  }

  /**
   * Updates the intersection visual.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   * @returns The updated intersection visual
   */
  updateVisual(context: IRenderContext, oldVisual: Visual): Visual {
    return this.createVisual(context)
  }
}

/**
 * Creates an SVG polygon path from the given control points.
 */
function createPolygonElement(points: Point[], fill: Color, stroke: Color): SVGElement {
  let path = ''
  path += `M${points[0].x} ${points[0].y}`
  for (let j = 1; j < points.length; j++) {
    path += ` L${points[j].x} ${points[j].y}`
  }
  path += 'Z'

  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  polygon.setAttribute('d', path)
  polygon.setAttribute('fill', `rgb(${fill.r},${fill.g},${fill.b})`)
  polygon.setAttribute('fill-opacity', '0.4')
  polygon.setAttribute('stroke', `rgb(${stroke.r},${stroke.g},${stroke.b})`)
  polygon.setAttribute('stroke-opacity', '1')
  return polygon
}

/**
 * Creates an SVG line from the given start point to the given end point.
 */
function createLineElement(p1: Point, p2: Point, color: Color): SVGElement {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line.setAttribute('x1', p1.x.toString())
  line.setAttribute('y1', p1.y.toString())
  line.setAttribute('x2', p2.x.toString())
  line.setAttribute('y2', p2.y.toString())
  line.setAttribute('stroke', `rgb(${color.r},${color.g},${color.b})`)
  line.setAttribute('stroke-width', '1.5px')
  return line
}

/**
 * Creates an SVG circle centered on the given point.
 */
function createPointElement(point: Point, color: Color): SVGElement {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', point.x.toString())
  circle.setAttribute('cy', point.y.toString())
  circle.setAttribute('r', '3')
  circle.setAttribute('fill', `rgb(${color.r},${color.g},${color.b})`)
  circle.setAttribute('stroke', `rgb(${color.r},${color.g},${color.b})`)
  return circle
}

/**
 * Returns the color scheme for the given type of intersection.
 */
function getIntersectionColors(intersection: Intersection): { mainColor: Color; stroke: Color } {
  const item1 = intersection.item1
  const item2 = intersection.item2
  if (item1 instanceof INode && item2 instanceof INode) {
    //node-node
    return { mainColor: NODE_NODE_INTERSECTION_FILL, stroke: NODE_NODE_INTERSECTION_STROKE }
  } else if (item1 instanceof IEdge && item2 instanceof IEdge) {
    //edge-edge
    return { mainColor: EDGE_EDGE_INTERSECTION_COLOR, stroke: EDGE_EDGE_INTERSECTION_COLOR }
  } else if (
    (item1 instanceof IEdge && item2 instanceof INode) ||
    (item1 instanceof INode && item2 instanceof IEdge)
  ) {
    //node-edge
    return { mainColor: NODE_EDGE_INTERSECTION_COLOR, stroke: NODE_EDGE_INTERSECTION_COLOR }
  }

  //labels
  return { mainColor: LABEL_INTERSECTION_COLOR_FILL, stroke: LABEL_INTERSECTION_COLOR_STROKE }
}
