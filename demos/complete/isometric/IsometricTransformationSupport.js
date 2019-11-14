/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * This class provides methods to handle a solid figure in both view and layout space.
   */
  class IsometricTransformationSupport {
    /**
     * Creates an instance with the given dimensions.
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     * @param {number} isHorizontal
     */
    constructor(width, depth, height, isHorizontal) {
      this.$width = width
      this.$depth = depth
      this.$height = height
      this.$horizontal = isHorizontal
    }

    // Matrix to transform points from the layout space into the view space.
    /** @type {number} */
    static get M_TO_VIEW_11() {
      return Math.sqrt(3) * 0.5
    }

    /** @type {number} */
    static get M_TO_VIEW_12() {
      return IsometricTransformationSupport.M_TO_VIEW_11
    }

    /** @type {number} */
    static get M_TO_VIEW_21() {
      return -0.5
    }

    /** @type {number} */
    static get M_TO_VIEW_22() {
      return 0.5
    }

    // Matrix to transform points from the view space into the layout space.
    /** @type {number} */
    static get M_TO_LAYOUT_11() {
      return 1 / Math.sqrt(3)
    }

    /** @type {number} */
    static get M_TO_LAYOUT_12() {
      return -1
    }

    /** @type {number} */
    static get M_TO_LAYOUT_21() {
      return IsometricTransformationSupport.M_TO_LAYOUT_11
    }

    /** @type {number} */
    static get M_TO_LAYOUT_22() {
      return -IsometricTransformationSupport.M_TO_LAYOUT_12
    }

    // Indices for the corners of the bounding box.
    // lower left
    /** @type {number} */
    static get C0_X() {
      return 0
    }

    /** @type {number} */
    static get C0_Y() {
      return 1
    }

    // lower front
    /** @type {number} */
    static get C1_X() {
      return 2
    }

    /** @type {number} */
    static get C1_Y() {
      return 3
    }

    // lower right
    /** @type {number} */
    static get C2_X() {
      return 4
    }

    /** @type {number} */
    static get C2_Y() {
      return 5
    }

    // lower back
    /** @type {number} */
    static get C3_X() {
      return 6
    }

    /** @type {number} */
    static get C3_Y() {
      return 7
    }

    // upper left
    /** @type {number} */
    static get C4_X() {
      return 8
    }

    /** @type {number} */
    static get C4_Y() {
      return 9
    }

    // upper front
    /** @type {number} */
    static get C5_X() {
      return 10
    }

    /** @type {number} */
    static get C5_Y() {
      return 11
    }

    // upper right
    /** @type {number} */
    static get C6_X() {
      return 12
    }

    /** @type {number} */
    static get C6_Y() {
      return 13
    }

    // upper back
    /** @type {number} */
    static get C7_X() {
      return 14
    }

    /** @type {number} */
    static get C7_Y() {
      return 15
    }

    /**
     * Returns the width of the solid figure.
     * @type {number}
     */
    get width() {
      return this.$width
    }

    /**
     * Sets the width of the solid figure.
     * @type {number}
     */
    set width(value) {
      this.$width = value
    }

    /**
     * Returns the depth of the solid figure.
     * @type {number}
     */
    get depth() {
      return this.$depth
    }

    /**
     * Sets the depth of the solid figure.
     * @type {number}
     */
    set depth(value) {
      this.$depth = value
    }

    /**
     * Returns the height of the solid figure.
     * @type {number}
     */
    get height() {
      return this.$height
    }

    /**
     * Sets the height of the solid figure.
     * @type {number}
     */
    set height(value) {
      this.$height = value
    }

    /**
     * Determines whether or no the base of the solid figure is horizontal in layout space.
     * This is important for labels that may be rotated during layout.
     * @type {boolean}
     */
    get horizontal() {
      return this.$horizontal
    }

    /**
     * Specifies whether or no the base of the solid figure is horizontal in layout space.
     * This is important for labels that may be rotated during layout.
     * @type {boolean}
     */
    set horizontal(value) {
      this.$horizontal = value
    }

    /**
     * Calculates the bounds of the solid figure in the view space.
     * @param {Object} geometry the data to construct the 3D-figure
     * @param {Array.<number>} corners the corners of the projection of the bounds of solid figure into the view space
     * @return {yfiles.geometry.Rect} bounds  the calculated bounds
     */
    static calculateViewBounds(geometry, corners) {
      corners = corners || IsometricTransformationSupport.calculateCorners(geometry)

      let minX = corners[IsometricTransformationSupport.C0_X]
      let minY = corners[IsometricTransformationSupport.C0_Y]
      let maxX = corners[IsometricTransformationSupport.C0_X]
      let maxY = corners[IsometricTransformationSupport.C0_Y]
      for (let i = 2; i < corners.length; i += 2) {
        minX = Math.min(minX, corners[i])
        minY = Math.min(minY, corners[i + 1])
        maxX = Math.max(maxX, corners[i])
        maxY = Math.max(maxY, corners[i + 1])
      }
      return new yfiles.geometry.Rect(minX, minY, maxX - minX, maxY - minY)
    }

    /**
     * Calculates the corners of the projection of the bounds of solid figure into the view space.
     * @return {Array.<number>} corners the calculated corners.
     */
    static calculateCorners(geometry) {
      const corners = new Array(16)
      corners[IsometricTransformationSupport.C0_X] = 0
      corners[IsometricTransformationSupport.C0_Y] = 0

      corners[IsometricTransformationSupport.C1_X] = IsometricTransformationSupport.toViewX(
        geometry.width,
        0
      )
      corners[IsometricTransformationSupport.C1_Y] = IsometricTransformationSupport.toViewY(
        geometry.width,
        0
      )

      corners[IsometricTransformationSupport.C2_X] = IsometricTransformationSupport.toViewX(
        geometry.width,
        geometry.depth
      )
      corners[IsometricTransformationSupport.C2_Y] = IsometricTransformationSupport.toViewY(
        geometry.width,
        geometry.depth
      )

      corners[IsometricTransformationSupport.C3_X] = IsometricTransformationSupport.toViewX(
        0,
        geometry.depth
      )
      corners[IsometricTransformationSupport.C3_Y] = IsometricTransformationSupport.toViewY(
        0,
        geometry.depth
      )

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
    static toViewX(layoutX, layoutY) {
      return (
        IsometricTransformationSupport.M_TO_VIEW_11 * layoutX +
        IsometricTransformationSupport.M_TO_VIEW_12 * layoutY
      )
    }

    /**
     * Transforms the given point from the layout space into the view space.
     * @param {number} layoutX x-coordinate in layout space
     * @param {number} layoutY y-coordinate in layout space
     * @return {number} y-coordinate in view space
     */
    static toViewY(layoutX, layoutY) {
      return (
        IsometricTransformationSupport.M_TO_VIEW_21 * layoutX +
        IsometricTransformationSupport.M_TO_VIEW_22 * layoutY
      )
    }

    /**
     * Transforms the given point from the view space into the layout space.
     * @param {number} viewX x-coordinate in view space
     * @param {number} viewY y-coordinate in view space
     * @return {number} x-coordinate in layout space
     */
    static toLayoutX(viewX, viewY) {
      return (
        IsometricTransformationSupport.M_TO_LAYOUT_11 * viewX +
        IsometricTransformationSupport.M_TO_LAYOUT_12 * viewY
      )
    }

    /**
     * Transforms the given point from the view space into the layout space.
     * @param {number} viewX x-coordinate in view space
     * @param {number} viewY y-coordinate in view space
     * @return {number} y-coordinate in layout space
     */
    static toLayoutY(viewX, viewY) {
      return (
        IsometricTransformationSupport.M_TO_LAYOUT_21 * viewX +
        IsometricTransformationSupport.M_TO_LAYOUT_22 * viewY
      )
    }

    /**
     * Translates the given corner to the given location, so that the upper left location of the bounds of the given
     * corners is on the given location.
     * @param {number} x x-coordinate of the location where the corners should be moved to
     * @param {number} y y-coordinate of the location where the corners should be moved to
     * @param {Array.<number>} corners corners to be moved
     */
    static moveTo(x, y, corners) {
      // Calculate the upper left location of the bounds of the given corners.
      let minX = corners[IsometricTransformationSupport.C0_X]
      let minY = corners[IsometricTransformationSupport.C0_Y]
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
  }

  return IsometricTransformationSupport
})
