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
  IMutablePoint,
  type IPoint,
  IPositionHandler,
  type MutableRectangle,
  type Point
} from '@yfiles/yfiles'

/**
 * Simple implementation of an {@link IPositionHandler} that moves a {@link MutableRectangle}
 */
export class RectanglePositionHandler extends BaseClass(IPositionHandler) {
  private readonly rectangle: MutableRectangle
  private startPosition: Point | null = null

  /**
   * Creates a position handler updates the provided rectangles position
   * @param rectangle The rectangle that will be read and changed.
   */
  constructor(rectangle: MutableRectangle) {
    super()
    this.rectangle = rectangle
  }

  get location(): IPoint {
    return this.rectangle.dynamicLocation
  }

  /**
   * Stores the initial position of the {@link IMutablePoint}
   */
  public initializeDrag(context: IInputModeContext): void {
    this.startPosition = this.rectangle.topLeft
  }

  /**
   * Moves the {@link IMutablePoint} away from the start position by the difference
   * between newLocation and originalLocation
   * @param context The context
   * @param originalLocation the original location
   * @param newLocation the new location
   */
  public handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    if (this.startPosition) {
      const currentPosition = this.startPosition.add(newLocation.subtract(originalLocation))
      if (this.rectangle.x !== currentPosition.x || this.rectangle.y !== currentPosition.y) {
        this.rectangle.x = currentPosition.x
        this.rectangle.y = currentPosition.y
      }
    }
  }

  /**
   * Moves the {@link IMutablePoint} back to the start position.
   */
  public cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    if (this.startPosition) {
      if (this.rectangle.x !== this.startPosition.x || this.rectangle.y !== this.startPosition.y) {
        this.rectangle.x = this.startPosition.x
        this.rectangle.y = this.startPosition.y
      }
    }
  }

  public dragFinished(
    context: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): void {
    return
  }
}
