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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  EventRecognizers,
  GraphEditorInputMode,
  type IContextLookupChainLink,
  ILassoTestable,
  OrganicLayout,
  PointerEventArgs
} from '@yfiles/yfiles'
import graphData from './graph-data.json'

// Enable lasso selection by default
const inputMode = new GraphEditorInputMode()
const lassoSelectionInputMode = inputMode.lassoSelectionInputMode
lassoSelectionInputMode.finishRadius = 10
lassoSelectionInputMode.enabled = true
graphComponent.inputMode = inputMode

/**
 * Configures the selection style (free-hand, polyline, or marquee).
 */
function setSelectionStyle(
  style: 'free-hand-selection' | 'polyline-selection' | 'marquee-selection'
): void {
  const lassoSelectionInputMode = inputMode.lassoSelectionInputMode

  switch (style) {
    default:
    case 'free-hand-selection':
      // Configure free-hand lasso selection
      lassoSelectionInputMode.dragFreeHandRecognizer = EventRecognizers.MOUSE_DRAG
      lassoSelectionInputMode.startSegmentRecognizer = EventRecognizers.NEVER
      lassoSelectionInputMode.endSegmentRecognizer = EventRecognizers.MOUSE_DOWN
      lassoSelectionInputMode.dragSegmentRecognizer = EventRecognizers.MOUSE_MOVE
      lassoSelectionInputMode.finishRecognizer = EventRecognizers.MOUSE_UP

      // Touch equivalents
      lassoSelectionInputMode.dragFreeHandRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      lassoSelectionInputMode.startSegmentRecognizerTouch = EventRecognizers.NEVER
      lassoSelectionInputMode.endSegmentRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DOWN
      lassoSelectionInputMode.dragSegmentRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      lassoSelectionInputMode.finishRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_UP

      lassoSelectionInputMode.enabled = true
      break
    case 'polyline-selection':
      // Configure polyline lasso selection
      lassoSelectionInputMode.dragFreeHandRecognizer = EventRecognizers.MOUSE_DRAG
      lassoSelectionInputMode.startSegmentRecognizer = EventRecognizers.ALWAYS
      // End a segment with click
      lassoSelectionInputMode.endSegmentRecognizer = (evt, eventSource) =>
        EventRecognizers.MOUSE_DOWN(evt, eventSource) || EventRecognizers.MOUSE_UP(evt, eventSource)
      lassoSelectionInputMode.dragSegmentRecognizer = (evt, eventSource) =>
        EventRecognizers.MOUSE_DRAG(evt, eventSource) ||
        EventRecognizers.MOUSE_MOVE(evt, eventSource)
      // Finish anywhere with a double click
      lassoSelectionInputMode.finishRecognizer = (evt) => {
        return evt instanceof PointerEventArgs && evt.clickCount > 1
      }

      // Touch equivalents
      lassoSelectionInputMode.dragFreeHandRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      lassoSelectionInputMode.startSegmentRecognizerTouch = EventRecognizers.ALWAYS
      lassoSelectionInputMode.endSegmentRecognizerTouch = (evt, eventSource) =>
        EventRecognizers.TOUCH_PRIMARY_DOWN(evt, eventSource) ||
        EventRecognizers.TOUCH_PRIMARY_UP(evt, eventSource)
      lassoSelectionInputMode.dragSegmentRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      lassoSelectionInputMode.finishRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DOUBLE_TAP

      lassoSelectionInputMode.enabled = true
      break
    case 'marquee-selection':
      // Disable lasso selection to allow marquee selection on left drag gestures
      lassoSelectionInputMode.enabled = false
      break
  }
}

/**
 * Sets the radius around the starting point of the lasso within which it can be closed.
 * When dragging the lasso near its starting point, a circle with corresponding radius is highlighted.
 */
function setFinishRadius(radius: number): void {
  inputMode.lassoSelectionInputMode.finishRadius = radius
}

/**
 * Configures how nodes are considered selected by the lasso tool.
 */
let decoration: IContextLookupChainLink | null = null
function setLassoTestables(
  mode: 'nodes-fully-contained' | 'nodes-intersected' | 'nodes-center-contained'
): void {
  const nodeDecorator = graphComponent.graph.decorator.nodes
  const lassoTestableDecorator = nodeDecorator.lassoTestable
  if (decoration) {
    nodeDecorator.remove(decoration)
  }
  if (mode === 'nodes-fully-contained') {
    // Nodes are selected only if fully contained within the lasso path
    decoration = lassoTestableDecorator.addFactory((node) =>
      ILassoTestable.create(
        (_context, lassoPath) =>
          !lassoPath.pathIntersects(node.layout.toRect(), 0) &&
          lassoPath.areaContains(node.layout.center)
      )
    )
  } else if (mode === 'nodes-intersected') {
    // Nodes are selected if they intersect or are fully contained within the lasso path
    decoration = lassoTestableDecorator.addFactory((node) =>
      ILassoTestable.fromRectangle(node.layout)
    )
  } else if (mode === 'nodes-center-contained') {
    // Nodes are selected only if their center point is contained within the lasso path
    decoration = lassoTestableDecorator.addFactory((node) =>
      ILassoTestable.fromPoint(node.layout.center)
    )
  }
}

// Configure UI buttons
demoApp.toolbar.addSelect(
  'Selection Style:',
  [
    { value: 'free-hand-selection', label: 'Free-hand' },
    { value: 'polyline-selection', label: 'Polyline' },
    { value: 'marquee-selection', label: 'Marquee' }
  ],
  (value: 'free-hand-selection' | 'polyline-selection' | 'marquee-selection') => {
    setSelectionStyle(value)
  },
  'free-hand-selection'
)
demoApp.toolbar.addSelect(
  'Select Nodes:',
  [
    { value: 'nodes-fully-contained', label: 'Fully Contained' },
    { value: 'nodes-intersected', label: 'Intersected' },
    { value: 'nodes-center-contained', label: 'Center Contained' }
  ],
  (value: 'nodes-fully-contained' | 'nodes-intersected' | 'nodes-center-contained') => {
    setLassoTestables(value)
  },
  'nodes-intersected'
)
demoApp.toolbar.addSlider(
  'Finish Radius:',
  5,
  30,
  (value: number) => {
    setFinishRadius(value)
  },
  10,
  1
)

// Build and layout the graph
demoApp.buildGraphFromJson(graphData)
graphComponent.graph.applyLayout(
  new OrganicLayout({
    defaultMinimumNodeDistance: 50,
    automaticGroupNodeCompaction: true,
    layoutOrientation: 'top-to-bottom'
  })
)
void graphComponent.fitGraphBounds()
graphComponent.graph.undoEngineEnabled = true
