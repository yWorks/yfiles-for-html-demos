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
import {
  BaseClass,
  ClickEventArgs,
  Cursor,
  HandleType,
  IHandle,
  IInputModeContext,
  INode,
  Point
} from '@yfiles/yfiles'

/**
 * An {@link IHandle} implementation that changes the height in a node's tag.
 */
export class HeightHandle extends BaseClass(IHandle) {
  dragging
  originalHeight = 0
  node
  inputModeContext
  minimumHeight

  constructor(node, inputModeContext, minimumHeight) {
    super()
    this.node = node
    this.inputModeContext = inputModeContext
    this.minimumHeight = minimumHeight
    this.dragging = false
  }

  get type() {
    return HandleType.RESIZE
  }

  get tag() {
    return null
  }

  get cursor() {
    return this.dragging ? Cursor.GRABBING : Cursor.GRAB
  }

  get location() {
    const height = this.node.tag.height
    const cc = this.inputModeContext.canvasComponent
    const vp = cc.worldToViewCoordinates(this.node.layout.center)
    const up = vp.add(new Point(0, -height * this.inputModeContext.zoom))
    return cc.viewToWorldCoordinates(up)
  }

  /**
   * Initializes the drag.
   */
  initializeDrag(inputModeContext) {
    this.originalHeight = this.node.tag.height
    this.dragging = true
  }

  /**
   * Updates the node according to the moving handle.
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    this.adjustNodeHeight(inputModeContext, originalLocation, newLocation)
  }

  /**
   * Cancels the drag and cleans up.
   */
  cancelDrag(context) {
    this.node.tag.height = this.originalHeight
    this.dragging = false
  }

  /**
   * Finishes the drag an applies changes.
   */
  dragFinished(context, originalLocation, newLocation) {
    this.adjustNodeHeight(context, originalLocation, newLocation)
    this.dragging = false
  }

  /**
   * Adjusts the node height according to how much the handle was moved.
   */
  adjustNodeHeight(context, oldLocation, newLocation) {
    const newY = context.canvasComponent.worldToViewCoordinates(newLocation).y
    const oldY = context.canvasComponent.worldToViewCoordinates(oldLocation).y
    const delta = (newY - oldY) / context.zoom
    const newHeight = this.originalHeight - delta
    this.node.tag.height = Math.max(this.minimumHeight, newHeight)
  }

  /**
   * This implementation does nothing special when clicked.
   */
  handleClick(evt) {}
}
