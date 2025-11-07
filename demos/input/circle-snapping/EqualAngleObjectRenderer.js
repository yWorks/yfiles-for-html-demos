/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { INode, ObjectRendererBase, Point, Stroke, SvgVisual } from '@yfiles/yfiles'
import { EqualAngleSnapLine } from './SnapReferences'

/**
 * Renders the visualization for snap lines that are bisecting the angles of two consecutive sibling
 * nodes.
 */
export class EqualAngleObjectRenderer extends ObjectRendererBase {
  static INSTANCE = new EqualAngleObjectRenderer()

  createVisual(context, renderTag) {
    const snapReference = renderTag?.reference
    const item = renderTag?.item
    if (item instanceof INode && snapReference instanceof EqualAngleSnapLine) {
      return this.createVisualImpl(context, item, snapReference)
    } else {
      return null
    }
  }

  createVisualImpl(context, node, snapReference) {
    const stroke = Stroke.GRAY

    const p = context.worldToIntermediateCoordinates(snapReference.parent.layout.center)
    const s1 = context.worldToIntermediateCoordinates(snapReference.firstSibling.layout.center)
    const s2 = context.worldToIntermediateCoordinates(snapReference.secondSibling.layout.center)
    const c = context.worldToIntermediateCoordinates(snapReference.centeredPoint)
    const snappedLocation = context.worldToIntermediateCoordinates(node.layout.center)

    // add the three lines from the parent through the siblings and the moved node
    const line1 = this.createLine(p, s1)
    stroke.applyTo(line1, context)

    const line2 = this.createLine(p, s2)
    stroke.applyTo(line2, context)

    const line3 = this.createLine(p, c)
    stroke.applyTo(line3, context)

    // to indicate the same angle between the three lines, we add double arcs
    // the first arcs shall be placed at half the distance to the closest node (from the parent)
    let toStart = s1.subtract(p)
    let toEnd = s2.subtract(p)
    const toSnapped = snappedLocation.subtract(p)
    const shortestDistance = Math.min(
      Math.min(toStart.vectorLength, toEnd.vectorLength),
      toSnapped.vectorLength
    )
    const indicatorRadius = shortestDistance * 0.5
    // the second arc uses a radius increased by 5
    const equalAngleIndicatorRadius = indicatorRadius + 5

    // To use an arc we need to determine whether the arc is large (> Math.PI) and rendered clockwise.
    // We consider the line orthogonal to the line from p to snappedLocation:
    // If the snappedLocation and s1 are on different sides of this line, we need a large arc
    //
    // For SVG arcs see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    const normal = new Point(toSnapped.y, -toSnapped.x)
    const isLargeArc = this.isLeft(normal, toSnapped) != this.isLeft(normal, toStart)

    // if s1 is left of the snapped location, we sweep clockwise, otherwise counter-clockwise
    const clockwise = this.isLeft(toSnapped, toStart)

    toStart = toStart.normalized
    toEnd = toEnd.normalized

    const arc1 = this.createArc(p, indicatorRadius, toStart, toEnd, isLargeArc, clockwise)
    stroke.applyTo(arc1, context)

    const arc2 = this.createArc(p, equalAngleIndicatorRadius, toStart, toEnd, isLargeArc, clockwise)
    stroke.applyTo(arc2, context)

    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    container.setAttribute('transform', context.intermediateTransform.toSvgTransform())
    container.appendChild(line1)
    container.appendChild(line2)
    container.appendChild(line3)
    container.appendChild(arc1)
    container.appendChild(arc2)

    return new SvgVisual(container)
  }

  /**
   * Determines if the vector from (0,0) to p1 is to the left of the vector from (0,0) to p2.
   */
  isLeft(p1, p2) {
    return p1.x * -p2.y - -p1.y * p2.x > 0
  }

  /**
   * Creates an SVG arc.
   */
  createArc(center, radius, toStart, toEnd, isLargeArc, clockwise) {
    const start = center.add(toStart.multiply(radius))
    const end = center.add(toEnd.multiply(radius))
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute(
      'd',
      `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${isLargeArc ? 1 : 0} ${clockwise ? 1 : 0} ${end.x} ${end.y}`
    )
    path.setAttribute('fill', 'none')
    return path
  }

  /**
   * Creates an SVG line from p1 to p2.
   */
  createLine(p1, p2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.x1.baseVal.value = p1.x
    line.y1.baseVal.value = p1.y
    line.x2.baseVal.value = p2.x
    line.y2.baseVal.value = p2.y
    return line
  }
}
