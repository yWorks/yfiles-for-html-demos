/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IReshapeHandleProvider,
  NodeStylePortStyleAdapter,
  IPort,
  BaseClass,
  Size,
  IInputModeContext,
  HandlePositions,
  KeyEventRecognizers,
  IHandle
} from 'yfiles'
import { PortReshapeHandle } from './PortReshapeHandle.js'

/**
 * An {@link IReshapeHandleProvider} implementation for {@link IPort}s using a {@link NodeStylePortStyleAdapter}.
 * The provided {@link PortReshapeHandle} modify the {@link NodeStylePortStyleAdapter.renderSize} of the
 * port style.
 */
export class PortReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  /**
   * Creates a new instance for port and its adapter.
   * @param {!IPort} port The port whose visualization shall be resized.
   * @param {!NodeStylePortStyleAdapter} adapter The adapter whose render size shall be changed.
   */
  constructor(port, adapter) {
    super()

    // The minimum size the {@link NodeStylePortStyleAdapter.renderSize} may have.
    this.minimumSize = Size.EMPTY

    this.port = port
    this.adapter = adapter
  }

  /**
   * Returns {@link HandlePositions.CORNERS} or {@link HandlePositions.BORDER} as available handle
   * positions depending on the modifier state of <c>Ctrl</c>.
   * @param {!IInputModeContext} context The context the handles are created in.
   * @returns {!HandlePositions} {@link HandlePositions.CORNERS} or {@link HandlePositions.BORDER}
   */
  getAvailableHandles(context) {
    const ctrlPressed = KeyEventRecognizers.CTRL_IS_DOWN(
      this,
      context.canvasComponent.lastInputEvent
    )
    // when Ctrl is pressed, all border positions are returned, otherwise only the corner positions
    return context.canvasComponent.focused && ctrlPressed
      ? HandlePositions.BORDER
      : HandlePositions.CORNERS
  }

  /**
   * Returns a {@link PortReshapeHandle} for the port at the given position and
   * sets its {@link PortReshapeHandle.minimumSize} to {@link minimumSize}.
   * @param {!IInputModeContext} context The context the handles are created in.
   * @param {!HandlePositions} position The position the handle shall be created for.
   * @returns {!IHandle} A {@link PortReshapeHandle} for the port at the given position.
   */
  getHandle(context, position) {
    const portReshapeHandle = new PortReshapeHandle(context, this.port, this.adapter, position)
    portReshapeHandle.minimumSize = this.minimumSize
    return portReshapeHandle
  }
}
