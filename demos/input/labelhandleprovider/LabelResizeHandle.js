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
﻿'use strict'

define(['yfiles/view-editor'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A custom {@link yfiles.input.IHandle} implementation that implements the functionality needed for resizing a label.
   */
  class LabelResizeHandle extends yfiles.lang.Class(yfiles.input.IHandle) {
    /**
     * Creates a new instance of <code>LabelResizeHandle</code>.
     * @param {yfiles.input.ILabel} label
     * @param {boolean} symmetricResize
     */
    constructor(label, symmetricResize) {
      super()
      this.$label = label
      this.$symmetricResize = symmetricResize
    }

    /**
     * Gets whether the resizing should be symmetric.
     * @return {boolean} True if the resize should be symmetric, false otherwise
     */
    get symmetricResize() {
      return this.$symmetricResize
    }

    /**
     * Gets the type of the handler.
     * @return {number}
     */
    get type() {
      return yfiles.input.HandleTypes.RESIZE
    }

    /**
     * Returns the cursor object.
     * @return {yfiles.view.Cursor}
     */
    get cursor() {
      return yfiles.view.Cursor.EW_RESIZE
    }

    /**
     * Returns the handler's location.
     * @return {LabelResizeHandleLivePoint}
     */
    get location() {
      if (this.$location === undefined) {
        this.$location = new LabelResizeHandleLivePoint(this)
      }
      return this.$location
    }

    /**
     * Invoked when dragging is about to start.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     */
    initializeDrag(context) {
      // start using the calculated dummy bounds
      this.$emulate = true
      this.$dummyPreferredSize = this.$label.preferredSize
      this.$dummyLocation = this.$label.layout.anchorLocation
      const canvasComponent = context.canvasComponent
      if (canvasComponent !== null) {
        // install the visual size indicator in the SelectionGroup of the canvas
        this.$sizeIndicator = new LabelResizeIndicatorInstaller(this).addCanvasObject(
          canvasComponent.canvasContext,
          canvasComponent.selectionGroup,
          this
        )
      }
    }

    /**
     * Invoked when an element has been dragged and its position should be updated.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     * @param {yfiles.geometry.Point} originalLocation The value of the location property at the time of initializeDrag
     * @param {yfiles.geometry.Point} newLocation The new location in the world coordinate system
     */
    handleMove(context, originalLocation, newLocation) {
      const layout = this.$label.layout
      // the normal (orthogonal) vector of the 'up' vector
      const upNormal = new yfiles.geometry.Point(-layout.upY, layout.upX)

      // calculate the total distance the handle has been moved in this drag gesture
      let delta = upNormal.scalarProduct(newLocation.subtract(originalLocation))

      // max with minus half the label size - because the label width can't shrink below zero
      delta = Math.max(delta, -layout.width * (this.symmetricResize ? 0.5 : 1))

      // add one or two times delta to the width to expand the label right and left
      const newWidth = layout.width + delta * (this.symmetricResize ? 2 : 1)
      this.$dummyPreferredSize = new yfiles.geometry.Size(newWidth, this.$dummyPreferredSize.height)
      // calculate the new location
      this.$dummyLocation = layout.anchorLocation.subtract(
        this.symmetricResize
          ? new yfiles.geometry.Point(upNormal.x * delta, upNormal.y * delta)
          : new yfiles.geometry.Point(0, 0)
      )
    }

    /**
     * Invoked when dragging has canceled.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     * @param {yfiles.geometry.Point} originalLocation The value of the location property at the time of initializeDrag
     */
    cancelDrag(context, originalLocation) {
      // use the normal label bounds if the drag gesture is over
      this.$emulate = false
      // remove the visual size indicator
      if (this.$sizeIndicator !== null) {
        this.$sizeIndicator.remove()
        this.$sizeIndicator = null
      }
    }

    /**
     * Invoked when dragging has finished.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     * @param {yfiles.geometry.Point} originalLocation The value of the location property at the time of initializeDrag
     * @param {yfiles.geometry.Point} newLocation The new location in the world coordinate system
     */
    dragFinished(context, originalLocation, newLocation) {
      this.cancelDrag(context, originalLocation)
      const graph = context.graph
      if (graph !== null) {
        // assign the new size
        graph.setLabelPreferredSize(this.$label, this.$dummyPreferredSize)
      }
    }

    /**
     * Returns the current label layout.
     * @return {yfiles.geometry.OrientedRectangle}
     */
    getCurrentLabelLayout() {
      const labelLayout = this.$label.layout
      if (this.$emulate) {
        return new yfiles.geometry.OrientedRectangle(
          this.$dummyLocation.x,
          this.$dummyLocation.y,
          this.$dummyPreferredSize.width,
          this.$dummyPreferredSize.height,
          labelLayout.upX,
          labelLayout.upY
        )
      }
      return new yfiles.geometry.OrientedRectangle(
        labelLayout.anchorX,
        labelLayout.anchorY,
        this.$label.preferredSize.width,
        this.$label.preferredSize.height,
        labelLayout.upX,
        labelLayout.upY
      )
    }
  }

  /**
   * Represents the new resize point for the given handler.
   */
  class LabelResizeHandleLivePoint extends yfiles.lang.Class(yfiles.geometry.IPoint) {
    /**
     * Creates a new point for the given handler.
     * @param {yfiles.input.IHandle} outerThis The given handler
     */
    constructor(outerThis) {
      super()
      this.$outerThis = outerThis
    }

    /**
     * Returns the x-coordinate of the location of the handle from the anchor, the size and the orientation.
     * @return {number}
     */
    get x() {
      const layout = this.$outerThis.$label.layout
      const up = layout.upVector
      const preferredSize = this.$outerThis.$emulate
        ? this.$outerThis.$dummyPreferredSize
        : this.$outerThis.$label.preferredSize
      const anchor = this.$outerThis.$emulate
        ? this.$outerThis.$dummyLocation
        : layout.anchorLocation
      // calculate the location of the handle from the anchor, the size and the orientation
      return anchor.x + (up.x * preferredSize.height * 0.5 + -up.y * preferredSize.width)
    }

    /**
     * Returns the y-coordinate of the location of the handle from the anchor, the size and the orientation.
     * @return {number}
     */
    get y() {
      const layout = this.$outerThis.$label.layout
      const up = layout.upVector
      const preferredSize = this.$outerThis.$emulate
        ? this.$outerThis.$dummyPreferredSize
        : this.$outerThis.$label.preferredSize
      const anchor = this.$outerThis.$emulate
        ? this.$outerThis.$dummyLocation
        : layout.anchorLocation
      // calculate the location of the handle from the anchor, the size and the orientation
      return anchor.y + (up.y * preferredSize.height * 0.5 + up.x * preferredSize.width)
    }
  }

  /**
   * Represents the oriented rectangle used for a given handler.
   */
  class LabelResizeIndicatorInstaller extends yfiles.view.OrientedRectangleIndicatorInstaller {
    /**
     * Creates a new oriented rectangle for the given handler.
     * @param {LabelResizeHandle} outerThis The given handler
     */
    constructor(outerThis) {
      super()
      this.$outerThis = outerThis
    }

    /**
     * Returns an IOrientedRectangle for a given user object.
     * @param {object} item The given user object
     * @return {yfiles.geometry.OrientedRectangle}
     */
    getRectangle(item) {
      return this.$outerThis.getCurrentLabelLayout()
    }
  }

  return LabelResizeHandle
})
