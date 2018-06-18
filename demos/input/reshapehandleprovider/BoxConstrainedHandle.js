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
'use strict'

define(['yfiles/view-editor'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A {@link yfiles.input.ConstrainedHandle} that is limited to the interior of a
   * given rectangle.
   * @extends yfiles.input.ConstrainedHandle
   */
  class BoxConstrainedHandle extends yfiles.input.ConstrainedHandle {
    /**
     * Creates a new instance of <code>BoxConstrainedHandle</code>.
     * @param {yfiles.input.IHandle} handle The delegate handler
     * @param {yfiles.geometry.Rect} boundaryRectangle The boundary rectangle
     */
    constructor(handle, boundaryRectangle) {
      super(handle)
      this.boundaryRectangle = boundaryRectangle
      this.constraintRect = null
    }

    /**
     * Returns for the given new location the constrained location that is
     * inside the boundary rectangle.
     * @param {yfiles.input.IInputModeContext} context The context in which the drag will be performed
     * @param {yfiles.geometry.Point} originalLocation The value of the
     * {@link yfiles.input.ConstrainedDragHandler<TWrapped>#location} property at the time of
     * {@link yfiles.input.ConstrainedDragHandler<TWrapped>#initializeDrag}
     * @param {yfiles.geometry.Point} newLocation The coordinates in the world coordinate system that the client wants
     * the handle to be at. Depending on the implementation the
     * {@link yfiles.input.ConstrainedDragHandler<TWrapped>#location} may or may not be modified to reflect the new
     *   value
     * @see Overrides {@link yfiles.input.ConstrainedDragHandler#constrainNewLocation}
     * @return {yfiles.geometry.Point}
     */
    constrainNewLocation(context, originalLocation, newLocation) {
      return newLocation.getConstrained(this.constraintRect)
    }

    /**
     * Makes sure that the constraintRect is set to the current boundary
     * rectangle and delegates to the base implementation.
     * position, besides the base functionality. Since a position handler
     * works on points, the actual rectangle must be a limit for the upper
     * left corner of the node and not for the node's bounding box.
     * @param {yfiles.input.IInputModeContext} inputModeContext The input mode context
     * @param {yfiles.geometry.Point} originalLocation The original location
     * @see Overrides {@link yfiles.input.ConstrainedDragHandler#onInitialized}
     */
    onInitialized(inputModeContext, originalLocation) {
      super.onInitialized(inputModeContext, originalLocation)
      this.constraintRect = this.boundaryRectangle.toRect()
    }
  }

  return BoxConstrainedHandle
})
