/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Point } from '@yfiles/yfiles'

/**
 * The maximum coordinate of the horizontal axis
 */
export const SCALED_MAX_X = Math.max(Math.max(window.screen.width, window.screen.height) * 0.9, 300)

/**
 * The maximum coordinate of the vertical axis
 */
export const SCALED_MAX_Y = Math.max(Math.min(window.screen.width, window.screen.height) * 0.4, 100)

/**
 * Scales the given dataset.
 */
export function scaleData(trail) {
  const { maxX, maxY } = getMax(trail)

  return trail
    .map((point) => {
      const xScaled = scalePoint(point.x, maxX, SCALED_MAX_X)
      const yScaled = -scalePoint(point.y, maxY, SCALED_MAX_Y)
      return new Point(xScaled, yScaled)
    })
    .sort((p1, p2) => p1.x - p2.x)
}

/**
 * Returns the maximum values of the x- and y-coordinates of the trail's points.
 */
export function getMax(trail) {
  const xCoords = trail.map((point) => point.x)
  const yCoords = trail.map((point) => point.y)
  const maxX = Math.max(...xCoords)
  const maxY = Math.max(...yCoords)
  return { maxX, maxY }
}

/**
 * Scales the given point.
 * @param location The location of the point
 * @param max The max coordinate of the axis
 * @param scaledMax The maximum scaled coordinate
 */
export function scalePoint(location, max, scaledMax) {
  const scale = scaledMax / max
  return Math.floor(location * scale)
}
