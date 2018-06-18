/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
   * A custom {@link yfiles.input.IHandle} implementation that implements the functionality needed for rotating a label.
   */
  class LabelRotateHandle extends yfiles.lang.Class(yfiles.input.IHandle) {
    /**
     * Creates a rotate handler for the given label.
     * @param {yfiles.graph.ILabel} label The given label
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     */
    constructor(label, context) {
      super()
      this.$label = label
      this.$inputModeContext = context
    }

    /**
     * Gets the type of the handler.
     * @return {number}
     */
    get type() {
      return yfiles.input.HandleTypes.ROTATE
    }

    /**
     * Returns the cursor object.
     * @return {yfiles.view.Cursor}
     */
    get cursor() {
      return yfiles.view.Cursor.CROSSHAIR
    }

    /**
     * Returns the handler's location.
     * @return {LabelResizeHandleLivePoint}
     */
    get location() {
      if (this.$location === undefined) {
        this.$location = new LabelRotateHandleLivePoint(this)
      }
      return this.$location
    }

    /**
     * Invoked when dragging is about to start.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information
     */
    initializeDrag(context) {
      this.$inputModeContext = context
      // start using the calculated dummy bounds
      this.$emulate = true
      const labelLayout = this.$label.layout
      this.$dummyLocation = labelLayout.anchorLocation
      this.$up = labelLayout.upVector

      this.$rotationCenter = labelLayout.orientedRectangleCenter
      const canvasComponent = context.canvasComponent
      if (canvasComponent !== null) {
        // install the visual rectangle indicator in the SelectionGroup of the canvas
        const installer = new LabelRotateIndicatorInstaller(this)
        this.$sizeIndicator = installer.addCanvasObject(
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
      // calculate the up vector
      this.$up = newLocation.subtract(this.$rotationCenter).normalized

      // and the anchor point
      const preferredSize = this.$label.preferredSize

      const p2X = -preferredSize.width * 0.5
      const p2Y = preferredSize.height * 0.5

      const anchorX = this.$rotationCenter.x - p2X * this.$up.y - p2Y * this.$up.x
      const anchorY = this.$rotationCenter.y - (p2Y * this.$up.y - p2X * this.$up.x)

      // calculate the new location
      this.$dummyLocation = new yfiles.geometry.Point(anchorX, anchorY)
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
      const graph = context.graph
      if (graph !== null) {
        const model = this.$label.layoutParameter.model
        const finder = model.lookup(yfiles.graph.ILabelModelParameterFinder.$class)
        if (finder !== null) {
          const param = finder.findBestParameter(this.$label, model, this.getCurrentLabelLayout())
          graph.setLabelLayoutParameter(this.$label, param)
        }
      }
      this.cancelDrag(context, originalLocation)
    }

    /**
     * Returns the current label layout.
     * @return {yfiles.geometry.OrientedRectangle}
     */
    getCurrentLabelLayout() {
      const preferredSize = this.$label.preferredSize
      const labelLayout = this.$label.layout
      return new yfiles.geometry.OrientedRectangle(
        this.$emulate ? this.$dummyLocation.x : labelLayout.anchorX,
        this.$emulate ? this.$dummyLocation.y : labelLayout.anchorY,
        preferredSize.width,
        preferredSize.height,
        this.$up.x,
        this.$up.y
      )
    }
  }

  /**
   * Represents the new resize point for the given handler.
   */
  class LabelRotateHandleLivePoint extends yfiles.lang.Class(yfiles.geometry.IPoint) {
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
      const preferredSize = this.$outerThis.$label.preferredSize
      const labelLayout = this.$outerThis.$label.layout
      const anchor = this.$outerThis.$emulate
        ? this.$outerThis.$dummyLocation
        : labelLayout.anchorLocation
      const up = this.$outerThis.$emulate ? this.$outerThis.$up : labelLayout.upVector
      // calculate the location of the handle from the anchor, the size and the orientation
      const offset =
        this.$outerThis.$inputModeContext !== null
          ? 20 / this.$outerThis.$inputModeContext.canvasComponent.zoom
          : 20
      return anchor.x + up.x * (preferredSize.height + offset) + -up.y * (preferredSize.width * 0.5)
    }

    /**
     * Returns the y-coordinate of the location of the handle from the anchor, the size and the orientation.
     * @return {number}
     */
    get y() {
      const preferredSize = this.$outerThis.$label.preferredSize
      const labelLayout = this.$outerThis.$label.layout
      const anchor = this.$outerThis.$emulate
        ? this.$outerThis.$dummyLocation
        : labelLayout.anchorLocation
      const up = this.$outerThis.$emulate ? this.$outerThis.$up : labelLayout.upVector
      // calculate the location of the handle from the anchor, the size and the orientation
      const offset =
        this.$outerThis.$inputModeContext !== null
          ? 20 / this.$outerThis.$inputModeContext.canvasComponent.zoom
          : 20
      return anchor.y + up.y * (preferredSize.height + offset) + up.x * (preferredSize.width * 0.5)
    }
  }

  /**
   * Represents the oriented rectangle used for a given handler.
   */
  class LabelRotateIndicatorInstaller extends yfiles.view.OrientedRectangleIndicatorInstaller {
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

  return LabelRotateHandle
})
