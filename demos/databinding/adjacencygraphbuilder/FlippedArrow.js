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
import { BaseClass, IArrow, Point } from '@yfiles/yfiles'

/**
 * A simple wrapper around an {@link IArrow} that rotates the arrow by 180 degrees.
 */
export class FlippedArrow extends BaseClass(IArrow) {
  wrappedArrow
  offset

  /**
   * Creates a new instance.
   * @param wrappedArrow The arrow to wrap.
   * @param offset A location offset that is applied in flipped direction of the arrow.
   */
  constructor(wrappedArrow, offset) {
    super()
    this.wrappedArrow = wrappedArrow
    this.offset = offset
  }

  get cropLength() {
    return this.wrappedArrow.cropLength
  }

  get length() {
    return this.wrappedArrow.length
  }

  getBoundsProvider(edge, atSource, anchor, direction) {
    return this.wrappedArrow.getBoundsProvider(
      edge,
      atSource,
      this.getFlippedAnchor(anchor, direction),
      FlippedArrow.getFlippedDirection(direction)
    )
  }

  getVisualCreator(edge, atSource, anchor, direction) {
    return this.wrappedArrow.getVisualCreator(
      edge,
      atSource,
      this.getFlippedAnchor(anchor, direction),
      FlippedArrow.getFlippedDirection(direction)
    )
  }

  /**
   * Rotates the direction vector by 180 degrees.
   * @param direction The original direction vector
   */
  static getFlippedDirection(direction) {
    return direction.multiply(-1)
  }

  /**
   * Returns the new anchor for the flipped arrow.
   * @param anchor The original anchor
   * @param direction The original direction vector
   */
  getFlippedAnchor(anchor, direction) {
    return anchor.subtract(
      new Point(
        (this.length + this.offset) * direction.x,
        (this.length + this.offset) * direction.y
      )
    )
  }

  get cropAtPort() {
    return false
  }
}
