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
  type IInputModeContext,
  IPositionHandler,
  MutablePoint,
  type MutableRectangle,
  Point
} from '@yfiles/yfiles'

/**
 * An {@link IPositionHandler} that manages the position of a given {@link MutableRectangle}.
 */
export class PositionHandler extends BaseClass(IPositionHandler) {
    private rectangle: MutableRectangle;
  /**
   * Stores the offset from the mouse event location to the handled rectangle's upper left corner.
   */
  private offset: MutablePoint = new MutablePoint()

  constructor(rectangle: MutableRectangle) {
    super()
      this.rectangle = rectangle;
  }

  /**
   * The rectangle's top-left coordinate.
   */
  get location(): Point {
    return this.rectangle.topLeft
  }

  /**
   * Initializes the mouse event offset before the actual move gesture starts.
   */
  initializeDrag(context: IInputModeContext): void {
    const x = this.rectangle.x - context.canvasComponent!.lastEventLocation.x
    const y = this.rectangle.y - context.canvasComponent!.lastEventLocation.y
    this.offset.setLocation(x, y)
  }

  /**
   * Updates the rectangle's position during each drag.
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    const newX = newLocation.x + this.offset.x
    const newY = newLocation.y + this.offset.y
    this.rectangle.setLocation(new Point(newX, newY))
  }

  /**
   * Resets the rectangle's position when the move gesture was cancelled.
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.rectangle.setLocation(originalLocation)
  }

  /**
   * Finalizes the rectangle's position when the move gesture ends.
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    const newX = newLocation.x + this.offset.x
    const newY = newLocation.y + this.offset.y
    this.rectangle.setLocation(new Point(newX, newY))
  }
}
