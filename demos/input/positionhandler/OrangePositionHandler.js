/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ConstrainedPositionHandler,
  IInputModeContext,
  INode,
  IPositionHandler,
  MutableRectangle,
  Point,
  Rect
} from 'yfiles'

/**
 * A {@link ConstrainedPositionHandler} that limits the movement of a
 * node to be within an rectangle and delegates for other aspects to
 * another (the original) handler.
 */
export default class OrangePositionHandler extends ConstrainedPositionHandler {
  /**
   * Creates a new instance of <code>OrangePositionHandler</code>
   * @param {MutableRectangle} boundaryRectangle The boundary rectangle
   * @param {INode} node The given node
   * @param {IPositionHandler} delegateHandler The default handler
   */
  constructor(boundaryRectangle, node, delegateHandler) {
    super(delegateHandler)
    this.boundaryPositionRectangle = null
    this.boundaryRectangle = boundaryRectangle
    this.node = node
  }

  /**
   * Prepares the rectangle that is actually used to limit the node
   * position, besides the base functionality. Since a position handler
   * works on points, the actual rectangle must be a limit for the upper
   * left corner of the node and not for the node's bounding box.
   * @param {IInputModeContext} inputModeContext The input mode context
   * @param {Point} originalLocation The original location
   * @see Overrides {@link ConstrainedDragHandler#onInitialized}
   */
  onInitialized(inputModeContext, originalLocation) {
    super.onInitialized.call(this, inputModeContext, originalLocation)
    // Shrink the rectangle by the node size to get the limits for the upper left node corner
    this.boundaryPositionRectangle = new Rect(
      this.boundaryRectangle.x,
      this.boundaryRectangle.y,
      this.boundaryRectangle.width - this.node.layout.width,
      this.boundaryRectangle.height - this.node.layout.height
    )
  }

  /**
   * Returns the position that is constrained by the rectangle.
   * @param {IInputModeContext} context The context in which the drag will be performed
   * @param {Point} originalLocation The value of the location property at the time of initializeDrag
   * @param {Point} newLocation The new location of the handler
   * @see Overrides {@link ConstrainedDragHandler#constrainNewLocation}
   * @return {Point}
   */
  constrainNewLocation(context, originalLocation, newLocation) {
    return newLocation.getConstrained(this.boundaryPositionRectangle)
  }
}
