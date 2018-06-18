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
   * A position handler that prevents node movements. This implementation is
   * very simple since most methods do nothing at all.
   * @implements {yfiles.input.IPositionHandler}
   */
  class RedPositionHandler extends yfiles.lang.Class(yfiles.input.IPositionHandler) {
    /**
     * Returns the location of the item.
     * @return {yfiles.geometry.IPoint}
     */
    get location() {
      return yfiles.geometry.Point.ORIGIN
    }

    /**
     * Stores the initial location of the movement for reference, and calls the base method.
     * @param {yfiles.input.IInputModeContext} inputModeContext The context to retrieve information about the drag from
     * @see Specified by {@link yfiles.input.IDragHandler#initializeDrag}.
     */
    initializeDrag(inputModeContext) {}

    /**
     * Prevents node movements.
     * @param {yfiles.input.IInputModeContext} context The context to retrieve information about the drag from
     * @param {yfiles.geometry.Point} originalLocation The value of the {@link yfiles.input.IDragHandler#location}
     * property at the time of {@link yfiles.input.IDragHandler#initializeDrag}
     * @param {yfiles.geometry.Point} newLocation The coordinates in the world coordinate system that the client wants
     * the handle to be at. Depending on the implementation the {@link yfiles.input.IDragHandler#location} may or may
     * not be modified to reflect the new value.
     * @see Specified by {@link yfiles.input.IDragHandler#handleMove}.
     * @return {boolean}
     */
    handleMove(context, originalLocation, newLocation) {}

    /**
     * Called when dragging has been canceled by the user.
     * @param {yfiles.input.IInputModeContext} inputModeContext The context to retrieve information about the drag from
     * @param {yfiles.geometry.Point} originalLocation The value of the coordinate of the
     * {@link yfiles.input.IDragHandler#location} property at the time of
     *   {@link yfiles.input.IDragHandler#initializeDrag}.
     */
    cancelDrag(inputModeContext, originalLocation) {}

    /**
     * Called when dragging has finished.
     * @param {yfiles.input.IInputModeContext} inputModeContext The context to retrieve information about the drag from
     * @param {yfiles.geometry.Point} originalLocation The value of the {@link yfiles.input.IDragHandler#location}
     * property at the time of {@link yfiles.input.IDragHandler#initializeDrag}
     * @param {yfiles.geometry.Point} newLocation The coordinates in the world coordinate system that the client wants
     * the handle to be at. Depending on the implementation the {@link yfiles.input.IDragHandler#location} may or may
     * not be modified to reflect the new value. This is the same value as delivered in the last invocation of
     * {@link yfiles.input.IDragHandler#handleMove}
     */
    dragFinished(inputModeContext, originalLocation, newLocation) {}
  }

  return RedPositionHandler
})
