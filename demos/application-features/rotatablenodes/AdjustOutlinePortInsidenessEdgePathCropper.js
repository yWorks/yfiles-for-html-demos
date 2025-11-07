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
import { EdgePathCropper, GeneralPath, Matrix, Point } from '@yfiles/yfiles'

/**
 * Crops adjacent edges at the nodes rotated bounds for internal ports.
 */
export class AdjustOutlinePortInsidenessEdgePathCropper extends EdgePathCropper {
  /**
   * Checks whether or not the given location is inside the nodes rotated shape.
   */
  isInside(location, node, nodeShapeGeometry, edge) {
    if (nodeShapeGeometry) {
      return getScaledOutline(node, nodeShapeGeometry).areaContains(location)
    }
    return super.isInside(location, node, nodeShapeGeometry, edge)
  }

  /**
   * Returns the intersection point of the segment between the outer and inner point and the node's rotated shape.
   * If there is no intersection point, the result is null.
   */
  getIntersection(node, nodeShapeGeometry, edge, inner, outer) {
    if (nodeShapeGeometry) {
      const a = getScaledOutline(node, nodeShapeGeometry).findLineIntersection(inner, outer)
      if (a < Number.POSITIVE_INFINITY) {
        return inner.add(outer.subtract(inner).multiply(a))
      }
      return null
    }
    return super.getIntersection(node, nodeShapeGeometry, edge, inner, outer)
  }
}

/**
 * Returns a slightly enlarged outline of the shape to ensure that ports ports that lie exactly on the shape's outline
 * are always considered inside.
 */
function getScaledOutline(node, nodeShapeGeometry) {
  let outline = nodeShapeGeometry.getOutline()
  if (!outline) {
    // use the node layout as outline
    outline = new GeneralPath()
    outline.appendRectangle(node.layout, false)
  }
  const factor = 1.001
  const center = node.layout.center
  const matrix = new Matrix()
  matrix.translate(new Point(-center.x * (factor - 1), -center.y * (factor - 1)))
  matrix.scale(factor, factor)
  outline.transform(matrix)
  return outline
}
