/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Rect } from 'yfiles'

/**
 * A collection of methods to handle a solid figure in both view and layout space.
 */

// Matrix to transform points from the layout space into the view space.
/** @type {number} */
export const M_TO_VIEW_11 = Math.sqrt(3) * 0.5

/** @type {number} */
export const M_TO_VIEW_12 = M_TO_VIEW_11

/** @type {number} */
export const M_TO_VIEW_21 = -0.5

/** @type {number} */
export const M_TO_VIEW_22 = 0.5

// Matrix to transform points from the view space into the layout space.
/** @type {number} */
export const M_TO_LAYOUT_11 = 1 / Math.sqrt(3)

/** @type {number} */
export const M_TO_LAYOUT_12 = -1

/** @type {number} */
export const M_TO_LAYOUT_21 = M_TO_LAYOUT_11

/** @type {number} */
export const M_TO_LAYOUT_22 = -M_TO_LAYOUT_12

// Indices for the corners of the bounding box.
// lower left
/** @type {number} */
export const C0_X = 0

/** @type {number} */
export const C0_Y = 1

// lower front
/** @type {number} */
export const C1_X = 2

/** @type {number} */
export const C1_Y = 3

// lower right
/** @type {number} */
export const C2_X = 4

/** @type {number} */
export const C2_Y = 5

// lower back
/** @type {number} */
export const C3_X = 6

/** @type {number} */
export const C3_Y = 7

// upper left
/** @type {number} */
export const C4_X = 8

/** @type {number} */
export const C4_Y = 9

// upper front
/** @type {number} */
export const C5_X = 10

/** @type {number} */
export const C5_Y = 11

// upper right
/** @type {number} */
export const C6_X = 12

/** @type {number} */
export const C6_Y = 13

// upper back
/** @type {number} */
export const C7_X = 14

/** @type {number} */
export const C7_Y = 15

/**
 * Calculates the bounds of the solid figure in the view space.
 * @param {Object} geometry the data to construct the 3D-figure
 * @param {Array.<number>} corners the corners of the projection of the bounds of solid figure into the view space
 * @return {Rect} bounds  the calculated bounds
 */
export function calculateViewBounds(geometry, corners) {
  corners = corners || calculateCorners(geometry)

  let minX = corners[C0_X]
  let minY = corners[C0_Y]
  let maxX = corners[C0_X]
  let maxY = corners[C0_Y]
  for (let i = 2; i < corners.length; i += 2) {
    minX = Math.min(minX, corners[i])
    minY = Math.min(minY, corners[i + 1])
    maxX = Math.max(maxX, corners[i])
    maxY = Math.max(maxY, corners[i + 1])
  }
  return new Rect(minX, minY, maxX - minX, maxY - minY)
}

/**
 * Calculates the corners of the projection of the bounds of solid figure into the view space.
 * @return {Array.<number>} corners the calculated corners.
 */
export function calculateCorners(geometry) {
  const corners = new Array(16)
  corners[C0_X] = 0
  corners[C0_Y] = 0

  corners[C1_X] = toViewX(geometry.width, 0)
  corners[C1_Y] = toViewY(geometry.width, 0)

  corners[C2_X] = toViewX(geometry.width, geometry.depth)
  corners[C2_Y] = toViewY(geometry.width, geometry.depth)

  corners[C3_X] = toViewX(0, geometry.depth)
  corners[C3_Y] = toViewY(0, geometry.depth)

  for (let i = 0; i < 8; i += 2) {
    corners[i + 8] = corners[i]
    corners[i + 9] = corners[i + 1] - geometry.height
  }
  return corners
}

/**
 * Transforms the given point from the layout space into the view space.
 * @param {number} layoutX x-coordinate in layout space
 * @param {number} layoutY y-coordinate in layout space
 * @return {number} x-coordinate in view space
 */
export function toViewX(layoutX, layoutY) {
  return M_TO_VIEW_11 * layoutX + M_TO_VIEW_12 * layoutY
}

/**
 * Transforms the given point from the layout space into the view space.
 * @param {number} layoutX x-coordinate in layout space
 * @param {number} layoutY y-coordinate in layout space
 * @return {number} y-coordinate in view space
 */
export function toViewY(layoutX, layoutY) {
  return M_TO_VIEW_21 * layoutX + M_TO_VIEW_22 * layoutY
}

/**
 * Transforms the given point from the view space into the layout space.
 * @param {number} viewX x-coordinate in view space
 * @param {number} viewY y-coordinate in view space
 * @return {number} x-coordinate in layout space
 */
export function toLayoutX(viewX, viewY) {
  return M_TO_LAYOUT_11 * viewX + M_TO_LAYOUT_12 * viewY
}

/**
 * Transforms the given point from the view space into the layout space.
 * @param {number} viewX x-coordinate in view space
 * @param {number} viewY y-coordinate in view space
 * @return {number} y-coordinate in layout space
 */
export function toLayoutY(viewX, viewY) {
  return M_TO_LAYOUT_21 * viewX + M_TO_LAYOUT_22 * viewY
}

/**
 * Translates the given corner to the given location, so that the upper left location of the bounds of the given
 * corners is on the given location.
 * @param {number} x x-coordinate of the location where the corners should be moved to
 * @param {number} y y-coordinate of the location where the corners should be moved to
 * @param {Array.<number>} corners corners to be moved
 */
export function moveTo(x, y, corners) {
  // Calculate the upper left location of the bounds of the given corners.
  let minX = corners[C0_X]
  let minY = corners[C0_Y]
  for (let i = 2; i < corners.length; i += 2) {
    minX = Math.min(minX, corners[i])
    minY = Math.min(minY, corners[i + 1])
  }

  // Move the corners to the given location.
  const dx = x - minX
  const dy = y - minY
  for (let i = 0; i < corners.length; i += 2) {
    corners[i] += dx
    corners[i + 1] += dy
  }
}
