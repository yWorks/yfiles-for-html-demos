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
import { Color, GeneralPath, Point } from '@yfiles/yfiles'
export function createRoundRectanglePath(x, y, width, height, radius) {
  const BEZIER_ARC_APPROXIMATION = 0.552284749830794 // (Math.Sqrt(2) - 1) * 4 / 3
  const roundRect = new GeneralPath(16)
  const arcX = Math.min(width * 0.5, radius)
  const arcY = Math.min(height * 0.5, radius)
  const cx = (1 - BEZIER_ARC_APPROXIMATION) * arcX
  const cy = (1 - BEZIER_ARC_APPROXIMATION) * arcY
  roundRect.moveTo(x, y + arcY)
  roundRect.cubicTo(x, y + cy, x + cx, y, x + arcX, y)
  roundRect.lineTo(x + width - arcX, y)
  roundRect.cubicTo(x + width - cx, y, x + width, y + cy, x + width, y + arcY)
  roundRect.lineTo(x + width, y + height - arcY)
  roundRect.cubicTo(
    x + width,
    y + height - cy,
    x + width - cx,
    y + height,
    x + width - arcX,
    y + height
  )
  roundRect.lineTo(x + arcX, y + height)
  roundRect.cubicTo(x + cx, y + height, x, y + height - cy, x, y + height - arcY)
  roundRect.close()
  return roundRect
}
export function roundRectContains(i, rectangle, rectArcRadius) {
  const layoutX = rectangle.x
  const layoutY = rectangle.y
  const layoutW = rectangle.width
  const layoutH = rectangle.height
  if (i.x < layoutX || i.y < layoutY || i.x > layoutX + layoutW || i.y > layoutY + layoutH) {
    // definitely no
    return false
  }
  // see if x fits
  if (i.x >= layoutX + rectArcRadius && i.x <= layoutX + layoutW - rectArcRadius) {
    return true
  }
  // see if y fits
  if (i.y >= layoutY + rectArcRadius && i.y <= layoutY + layoutH - rectArcRadius) {
    return true
  }
  // see if we have perfect circles in the corners
  if (layoutW >= rectArcRadius * 2 && layoutH >= rectArcRadius * 2) {
    // no trivial case but perfect circles - find out quadrant
    // determine center of circle
    const dx =
      i.x -
      (i.x < layoutX + layoutW * 0.5 ? layoutX + rectArcRadius : layoutX + layoutW - rectArcRadius)
    const dy =
      i.y -
      (i.y < layoutY + layoutH * 0.5 ? layoutY + rectArcRadius : layoutY + layoutH - rectArcRadius)
    return dx * dx + dy * dy <= rectArcRadius * rectArcRadius
  }
  // fallback code:
  return createRoundRectanglePath(layoutX, layoutY, layoutW, layoutH, rectArcRadius).areaContains(i)
}
export function roundRectIsHit(i, rectangle, rectArcRadius, eps) {
  const layoutX = rectangle.x
  const layoutY = rectangle.y
  const layoutW = rectangle.width
  const layoutH = rectangle.height
  if (
    i.x < layoutX - eps ||
    i.y < layoutY - eps ||
    i.x > layoutX + layoutW + eps ||
    i.y > layoutY + layoutH + eps
  ) {
    // definitely no
    return false
  }
  // see if x fits
  if (i.x >= layoutX + rectArcRadius && i.x <= layoutX + layoutW - rectArcRadius) {
    return true
  }
  // see if y fits
  if (i.y >= layoutY + rectArcRadius && i.y <= layoutY + layoutH - rectArcRadius) {
    return true
  }
  // see if we have perfect circles in the corners
  if (layoutW >= rectArcRadius * 2 && layoutH >= rectArcRadius * 2) {
    // no trivial case but perfect circles - find out quadrant
    // determine center of circle
    const dx =
      i.x -
      (i.x < layoutX + layoutW * 0.5 ? layoutX + rectArcRadius : layoutX + layoutW - rectArcRadius)
    const dy =
      i.y -
      (i.y < layoutY + layoutH * 0.5 ? layoutY + rectArcRadius : layoutY + layoutH - rectArcRadius)
    return dx * dx + dy * dy <= (rectArcRadius + eps) * (rectArcRadius + eps)
  }
  // fallback code:
  return createRoundRectanglePath(layoutX, layoutY, layoutW, layoutH, rectArcRadius).areaContains(
    i,
    eps
  )
}
export function findLineIntersectionWithRoundRect(inner, outer, rect, rectArcRadius) {
  const layout = rect.toRect()
  const intersection = layout.findLineIntersection(inner, outer)
  // no intersection with the rectangle - we should have an intersection unless outer is inside the rectangle but outside the round rect.
  if (intersection != null) {
    const i = intersection
    if (
      (i.x >= layout.x + rectArcRadius && i.x <= layout.x + layout.width - rectArcRadius) ||
      (i.y >= layout.y + rectArcRadius && i.y <= layout.y + layout.height - rectArcRadius)
    ) {
      // trivial case - line intersects rectangular part
      return i
    }
    // see if we have perfect circles in the corners
    if (layout.width >= rectArcRadius * 2 && layout.height >= rectArcRadius * 2) {
      // no trivial case but perfect circles - find out quadrant
      const left = i.x < layout.x + layout.width * 0.5
      const top = i.y < layout.y + layout.height * 0.5
      // determine center of circle
      const cx = left ? layout.x + rectArcRadius : layout.x + layout.width - rectArcRadius
      const cy = top ? layout.y + rectArcRadius : layout.y + layout.height - rectArcRadius
      const dx = outer.x - inner.x
      const dy = outer.y - inner.y
      const innerX = inner.x - cx
      const innerY = inner.y - cy
      const outerX = innerX + dx
      const outerY = innerY + dy
      const r = rectArcRadius
      const dr2 = dx * dx + dy * dy
      const d = innerX * outerY - outerX * innerY
      const disc = r * r * dr2 - d * d
      // calculate intersections
      if (disc >= 0) {
        const sqrtDisc = Math.sqrt(disc)
        return new Point(cx + (d * dy + dx * sqrtDisc) / dr2, cy + (-d * dx + dy * sqrtDisc) / dr2)
      } // else fall through to old code for edge cases
    }
  }
  // fall back to complex path code
  const t = createRoundRectanglePath(
    layout.x,
    layout.y,
    layout.width,
    layout.height,
    rectArcRadius
  ).findLineIntersection(inner, outer)
  if (t < Number.POSITIVE_INFINITY) {
    return new Point(inner.x + (outer.x - inner.x) * t, inner.y + (outer.y - inner.y) * t)
  } else {
    return null
  }
}
export function rectangleContains(x, y, w, h, px, py, epsilon) {
  // If width or height is negative, the rectangle is invalid, return false.
  if (w < 0 || h < 0) {
    return false
  }
  // If width or height is infinite, treat as infinitely large and return true.
  if (!isFinite(w) || !isFinite(h)) {
    return true
  }
  // Adjust the rectangle bounds by epsilon and check if point (px, py) is inside.
  return rectangleContainsHelper(x - epsilon, y - epsilon, w + 2 * epsilon, h + 2 * epsilon, px, py)
}
function rectangleContainsHelper(x, y, w, h, px, py) {
  // If width or height is negative, the rectangle is invalid, return false.
  if (w < 0 || h < 0) {
    return false
  }
  // If width or height is infinite, treat as infinitely large and return true.
  if (!isFinite(w) || !isFinite(h)) {
    return true
  }
  return px >= x && py >= y && px <= x + w && py <= y + h
}
/**
 * Mixes two colors using the provided ratio.
 * @param color0 - The first color.
 * @param color1 - The second color.
 * @param ratio - The mixing ratio (0 = all color1, 1 = all color0).
 * @returns A svg color string representing the mixed color.
 */
export function mixColors(color0, color1, ratio) {
  const iratio = 1 - ratio
  const r = Math.round(color0.r * ratio + color1.r * iratio)
  const g = Math.round(color0.g * ratio + color1.g * iratio)
  const b = Math.round(color0.b * ratio + color1.b * iratio)
  const a = Math.round(color0.a * ratio + color1.a * iratio)
  return new Color({ r, g, b, a })
}
export function toSvgColorString(color) {
  return `rgb(${color.r},${color.g},${color.b})`
}
