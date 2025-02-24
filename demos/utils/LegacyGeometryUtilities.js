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
import {} from '@yfiles/yfiles'
/**
 * Returns the angle (measured in radians) from vector1 to vector2 in clockwise order
 * (in regard to screen coordinates).
 *
 * Screen coordinates mean positive x-direction is from left to right and positive y-direction is
 * from top to bottom.
 */
export function getAngle(vector1, vector2) {
  const cosA = vector1.scalarProduct(vector2) / (vector1.vectorLength * vector2.vectorLength)
  // due to rounding errors the above calculated value cosA might be out of
  // the range of theoretically possible (and for Math.acos(double) required)
  // value range [-1, 1]
  const a = cosA > 1 ? Math.acos(1) : cosA < -1 ? Math.acos(-1) : Math.acos(Math.min(1, cosA))
  return rightOf(vector1, vector2) ? a : 2 * Math.PI - a
}
function rightOf(v1, v2) {
  return v1.x * v2.y - v1.y * v2.x > 0
}
/**
 * Converts the given angle value from degree to radian.
 */
export function toRadians(degree) {
  return (degree / 180.0) * Math.PI
}
/**
 * Converts the given degree value from radian to angular
 */
export function toDegrees(radian) {
  return (radian * 180.0) / Math.PI
}
