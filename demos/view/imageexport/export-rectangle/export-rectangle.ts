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
  GeneralPath,
  type GraphComponent,
  type GraphInputMode,
  HandleInputMode,
  HandlePositions,
  HandlesRenderer,
  type IHandle,
  IHitTestable,
  type IRenderTreeElement,
  MoveInputMode,
  MutableRectangle,
  ObservableCollection,
  RectangleHandle,
  RenderMode
} from '@yfiles/yfiles'
import { PositionHandler } from './PositionHandler'
import { RectangleRenderer } from '../../../utils/RectangleRenderer'

let renderTreeElement: IRenderTreeElement
let exportHandleInputMode: HandleInputMode

/**
 * Initializes user interaction.
 * Aside from basic editing, this demo provides a visual marker (the 'export rectangle') that
 * determines the area that will be exported. Users may move and resize the marker with their mouse.
 */
export function initializeExportRectangle(graphComponent: GraphComponent): MutableRectangle {
  // create the model for the export rectangle, ...
  const exportRect = new MutableRectangle(-20, 0, 300, 160)

  // ... visualize it in the canvas, ...
  renderTreeElement = graphComponent.renderTree.createElement(
    graphComponent.renderTree.highlightGroup,
    exportRect,
    new RectangleRenderer()
  )

  // add an input mode that allows the user resizing the rectangle
  makeRectResizable(graphComponent.inputMode as GraphInputMode, exportRect)

  // add an input mode that allows the user moving the rectangle
  makeRectMovable(graphComponent.inputMode as GraphInputMode, exportRect)

  // initially disable the rectangle
  renderTreeElement.visible = false
  exportHandleInputMode.enabled = false

  return exportRect
}

function makeRectResizable(inputMode: GraphInputMode, exportRect: MutableRectangle): void {
  // create a mode that deals with resizing the export rectangle and ...
  exportHandleInputMode = new HandleInputMode({
    // ensure that this mode takes precedence over most other modes,
    // i.e. resizing the export rectangle takes precedence over another interactive editing
    priority: 1,
    handlesRenderer: new HandlesRenderer(RenderMode.SVG),
    // specify handles for resizing the export rectangle
    handles: new ObservableCollection<IHandle>([
      new RectangleHandle(HandlePositions.TOP_RIGHT, exportRect),
      new RectangleHandle(HandlePositions.TOP_LEFT, exportRect),
      new RectangleHandle(HandlePositions.BOTTOM_RIGHT, exportRect),
      new RectangleHandle(HandlePositions.BOTTOM_LEFT, exportRect)
    ])
  })
  // ... add it to the demo's main input mode
  inputMode.add(exportHandleInputMode)
}

function makeRectMovable(inputMode: GraphInputMode, exportRect: MutableRectangle): void {
  // create a mode that deals with moving the export rectangle and ...
  const moveInputMode = new MoveInputMode({
    // create a custom position handler that moves the export rectangle on mouse events
    positionHandler: new PositionHandler(exportRect),
    // create a hit-testable that determines if a mouse event occurs 'on' the export rectangle
    // and thus should be handled by this mode
    hitTestable: IHitTestable.create((context, location) => {
      const path = new GeneralPath(5)
      path.appendRectangle(exportRect, false)
      return path.pathContains(location, context.hitTestRadius + 3 / context.zoom)
    }),
    // ensure that this mode takes precedence over the move input mode used for regular graph
    // elements
    priority: 41
  })

  // ... add it to the demo's main input mode
  inputMode.add(moveInputMode)
}

/**
 * Toggles the visibility of the export rectangle.
 */
export function toggleExportRectangle(): void {
  const visible = !renderTreeElement.visible
  renderTreeElement.visible = visible
  exportHandleInputMode.enabled = visible
}
