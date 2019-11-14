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
   * Provides the special node resize handles at the east and west side of a node.
   * @class NodeReshapeHandleProvider
   * @implements {yfiles.input.IReshapeHandleProvider}
   */
  class NodeReshapeHandleProvider extends yfiles.lang.Class(yfiles.input.IReshapeHandleProvider) {
    /**
     * Creates a new instance.
     * @param {yfiles.graph.INode} node
     * @param {yfiles.input.IReshapeHandleProvider} wrapped
     */
    constructor(node, wrapped) {
      super()
      this.node = node
      this.wrapped = wrapped
    }

    /**
     * @param {yfiles.input.IInputModeContext} context - The context for which the handles are queried.
     * @returns {yfiles.input.HandlePositions}
     */
    getAvailableHandles(context) {
      return yfiles.input.HandlePositions.EAST | yfiles.input.HandlePositions.WEST
    }

    /**
     * @param {yfiles.input.IInputModeContext} context - The context for which the handles are queried.
     * @param {yfiles.input.HandlePositions} position - The single position a handle implementation should be returned
     *   for.
     * @returns {yfiles.input.IHandle}
     */
    getHandle(context, position) {
      return new NodeResizeHandle(this.node, this.wrapped.getHandle(context, position), position)
    }
  }

  /**
   * A special, invisible node resize handle that allows to change the width of a node.
   * @class NodeResizeHandle
   * @extends {yfiles.input.ConstrainedHandle}
   */
  class NodeResizeHandle extends yfiles.input.ConstrainedHandle {
    /**
     * @constructs
     * @param {yfiles.graph.INode} node The node that is resized.
     * @param {yfiles.input.IHandle} wrappedHandle The handle to wrap.
     * @param {yfiles.input.HandlePositions} position The handle position.
     */
    constructor(node, wrappedHandle, position) {
      super(wrappedHandle)
      this.$node = node
      this.$position = position
    }

    /**
     * Constrains the location to the original y coordinate
     * @param {yfiles.input.IInputModeContext} context - The context in which the drag will be performed.
     * @param {yfiles.geometry.Point} originalLocation - The value of the
     *   {@link yfiles.input.ConstrainedDragHandler<TWrapped>#location} property at the time of
     *   {@link yfiles.input.ConstrainedDragHandler<TWrapped>#initializeDrag}.
     * @param {yfiles.geometry.Point} newLocation - The coordinates in the world coordinate system that the client
     *   wants the handle to be at. Depending on the implementation the
     *   {@link yfiles.input.ConstrainedDragHandler<TWrapped>#location} may or may not be modified to reflect the new
     *   value.
     * @returns {yfiles.geometry.Point}
     */
    constrainNewLocation(context, originalLocation, newLocation) {
      return new yfiles.geometry.Point(newLocation.x, originalLocation.y)
    }

    /**
     * @returns {yfiles.view.Cursor}
     */
    get cursor() {
      return yfiles.view.Cursor.EW_RESIZE
    }

    /**
     * @returns {yfiles.input.HandlePositions}
     */
    get position() {
      return this.$position
    }

    /**
     * @returns {yfiles.input.HandleTypes}
     */
    get type() {
      return yfiles.input.HandleTypes.INVISIBLE
    }

    /**
     * @returns {yfiles.input.IModelItem}
     */
    get item() {
      return this.$node
    }
  }

  return {
    NodeReshapeHandleProvider,
    NodeResizeHandle
  }
})
