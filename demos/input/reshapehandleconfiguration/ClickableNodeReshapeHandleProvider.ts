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
  type ClickEventArgs,
  type Cursor,
  EventRecognizers,
  type GraphEditorInputMode,
  HandlePositions,
  HandleType,
  type IGraph,
  IHandle,
  type IInputModeContext,
  type INode,
  type IPoint,
  type IReshapeHandler,
  NodeReshapeHandleProvider,
  type NodeReshapeHandlerHandle,
  type Point
} from '@yfiles/yfiles'

/**
 * A NodeReshapeHandleProvider for cyan nodes that toggles aspect ratio resizing on and of when clicking on its handles.
 */
export class ClickableNodeReshapeHandleProvider extends NodeReshapeHandleProvider {
  private readonly state: ApplicationState

  constructor(node: INode, reshapeHandler: IReshapeHandler, state: ApplicationState) {
    super(node, reshapeHandler, HandlePositions.BORDER)
    this.state = state
  }

  getHandle(inputModeContext: IInputModeContext, position: HandlePositions): IHandle {
    const wrapped = super.getHandle(inputModeContext, position) as NodeReshapeHandlerHandle
    wrapped.ratioReshapeRecognizer = this.state.keepAspectRatio
      ? EventRecognizers.ALWAYS
      : EventRecognizers.NEVER
    return new ClickableNodeReshapeHandlerHandle(this.state, wrapped)
  }
}

class ClickableNodeReshapeHandlerHandle extends BaseClass(IHandle) {
  private readonly state: ApplicationState
  private readonly wrapped: NodeReshapeHandlerHandle

  constructor(state: ApplicationState, wrapped: NodeReshapeHandlerHandle) {
    super()
    this.state = state
    this.wrapped = wrapped
  }

  get cursor(): Cursor {
    return this.wrapped.cursor
  }

  get location(): IPoint {
    return this.wrapped.location
  }

  /**
   * Changes the wrapped round handles to quadratic ones to visualize the state.
   */
  get type(): HandleType {
    return this.state.keepAspectRatio ? HandleType.CUSTOM2 : this.wrapped.type
  }

  get tag(): any {
    return this.wrapped.tag
  }

  /**
   * Toggles the aspect ratio state of the application.
   */
  public handleClick(eventArgs: ClickEventArgs): void {
    this.state.toggleAspectRatio()
  }

  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.wrapped.handleMove(context, originalLocation, newLocation)
  }

  initializeDrag(context: IInputModeContext): void {
    this.wrapped.initializeDrag(context)
  }

  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.wrapped.dragFinished(context, originalLocation, newLocation)
  }

  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.wrapped.cancelDrag(context, originalLocation)
  }
}

export class ApplicationState {
  get keepAspectRatio(): boolean {
    return this._keepAspectRatio
  }

  private readonly graphEditorInputMode: GraphEditorInputMode
  private graph: IGraph

  private _keepAspectRatio = false

  constructor(graphEditorInputMode: GraphEditorInputMode, graph: IGraph, keepAspectRatio: boolean) {
    this.graphEditorInputMode = graphEditorInputMode
    this.graph = graph
    this._keepAspectRatio = keepAspectRatio
  }

  public toggleAspectRatio(): void {
    this._keepAspectRatio = !this._keepAspectRatio
    this.graphEditorInputMode.requeryHandles()
    this.updateLabel()
  }

  private updateLabel() {
    const goldNode = this.graph.nodes.find((n) => n.tag === 'gold')
    if (goldNode) {
      const label = goldNode.labels.first()
      if (label) {
        const stateString = this._keepAspectRatio ? 'keep' : "don't keep"
        this.graph.setLabelText(label, label.text.replace(/:\n.*/, `:\n ${stateString}`))
      }
    }
  }
}
