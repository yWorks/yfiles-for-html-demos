/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { ConstrainedHandle, IHandle, IInputModeContext, INode, Point } from 'yfiles'

/**
 * A port location handle that is constrained to the layout rectangle of
 * the port's owner node.
 */
export default class NodeLayoutPortLocationHandle extends ConstrainedHandle {
  private node: INode

  /**
   * Creates a new instance of {@link NodeLayoutPortLocationHandle}.
   */
  constructor(node: INode, wrappedHandle: IHandle) {
    super(wrappedHandle)
    this.node = node
  }

  /**
   * Returns the constraints for the new location.
   * @param context The context in which the drag will be performed
   * @param originalLocation The value of the
   * {@link ConstrainedHandle.location} property at the time of
   * {@link ConstrainedHandle.initializeDrag}
   * @param newLocation The coordinates in the world coordinate system that the client wants
   * the handle to be at. Depending on the implementation the
   * {@link ConstrainedHandle.location} may or may not be modified to reflect the new
   *   value
   */
  constrainNewLocation(
    context: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): Point {
    return newLocation.getConstrained(this.node.layout.toRect())
  }
}
