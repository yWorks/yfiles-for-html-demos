/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HandlePositions,
  type IHandle,
  type IInputModeContext,
  type IPort,
  IReshapeHandleProvider,
  type ShapePortStyle,
  type Size
} from '@yfiles/yfiles'
import { PortReshapeHandle } from './PortReshapeHandle'

/**
 * An {@link IReshapeHandleProvider} implementation for {@link IPort}s using {@link ShapePortStyle}.
 * The provided {@link PortReshapeHandle} modifies the {@link ShapePortStyle.renderSize render size}.
 */
export class PortReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  private readonly minimumSize: Size
  private readonly portStyle: ShapePortStyle
  private readonly port: IPort

  /**
   * Creates a new instance for port and its adapter.
   * @param port The port whose visualization shall be resized.
   * @param portStyle The adapter whose render size shall be changed.
   * @param minimumSize The minimum size the {@link ShapePortStyle.renderSize} may have.
   */
  constructor(port: IPort, portStyle: ShapePortStyle, minimumSize: Size) {
    super()
    this.port = port
    this.portStyle = portStyle
    this.minimumSize = minimumSize
  }

  /**
   * Returns {@link HandlePositions.CORNERS} or {@link HandlePositions.BORDER} as available handle
   * positions depending on the modifier state of `Shift`.
   * @param context The context the handles are created in.
   * @returns Either {@link HandlePositions.CORNERS} or {@link HandlePositions.BORDER}
   */
  getAvailableHandles(context: IInputModeContext): HandlePositions {
    const canvasComponent = context.canvasComponent!
    return canvasComponent.focused && canvasComponent.lastInputEvent.shiftKey
      ? HandlePositions.BORDER
      : HandlePositions.CORNERS
  }

  /**
   * Returns a {@link PortReshapeHandle} for the port at the given position and
   * sets its {@link PortReshapeHandle.minimumSize} to {@link minimumSize}.
   * @param context The context the handles are created in.
   * @param position The position the handle shall be created for.
   * @returns A {@link PortReshapeHandle} for the port at the given position.
   */
  getHandle(context: IInputModeContext, position: HandlePositions): IHandle {
    return new PortReshapeHandle(context, this.port, this.portStyle, position, this.minimumSize)
  }
}
