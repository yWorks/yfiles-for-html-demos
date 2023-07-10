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
import {
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  IContextLookupChainLink,
  IGraph,
  ILassoTestable,
  LassoTestables,
  License,
  MouseEventRecognizers,
  TouchEventRecognizers
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/** @type {GraphComponent} */
let graphComponent
/** @type {GraphEditorInputMode} */
let inputMode
/** @type {IContextLookupChainLink} */
let decoration

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initDemoStyles(graphComponent.graph)

  // create a sample graph for the demo
  createSampleGraph(graphComponent.graph)
  // center the sample graph in the demo's GraphComponent
  graphComponent.fitGraphBounds()

  // enable undo and redo for the demo
  graphComponent.graph.undoEngineEnabled = true

  configureLassoSelection()

  initializeUI()
}

/**
 * Initialize lasso selection.
 */
function configureLassoSelection() {
  inputMode = new GraphEditorInputMode()
  const lassoSelectionInputMode = inputMode.lassoSelectionInputMode
  lassoSelectionInputMode.finishRadius = 10
  lassoSelectionInputMode.enabled = true
  graphComponent.inputMode = inputMode
}

/**
 * Sets the selection style.
 * Supports free-hand or polyline lasso selection. Additionally, classic marquee selection
 * is supported for easy comparison of all selection styles.
 * @param {!('free-hand-selection'|'polyline-selection'|'marquee-selection')} style
 */
function setSelectionStyle(style) {
  const lassoSelectionInputMode = inputMode.lassoSelectionInputMode

  switch (style) {
    default:
    case 'free-hand-selection':
      lassoSelectionInputMode.dragFreeRecognizer = MouseEventRecognizers.LEFT_DRAG
      // never start a segment in free-hand lasso selection
      lassoSelectionInputMode.startSegmentRecognizer = EventRecognizers.NEVER
      lassoSelectionInputMode.endSegmentRecognizer = MouseEventRecognizers.LEFT_DOWN
      lassoSelectionInputMode.dragSegmentRecognizer = MouseEventRecognizers.MOVE
      lassoSelectionInputMode.finishRecognizer = MouseEventRecognizers.LEFT_UP

      lassoSelectionInputMode.dragFreeRecognizerTouch = TouchEventRecognizers.TOUCH_MOVE_PRIMARY
      // never start a segment in free-hand lasso selection
      lassoSelectionInputMode.startSegmentRecognizerTouch = EventRecognizers.NEVER
      lassoSelectionInputMode.endSegmentRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
      lassoSelectionInputMode.dragSegmentRecognizerTouch = TouchEventRecognizers.TOUCH_MOVE_PRIMARY
      lassoSelectionInputMode.finishRecognizerTouch = TouchEventRecognizers.TOUCH_UP_PRIMARY

      lassoSelectionInputMode.enabled = true
      break
    case 'polyline-selection':
      lassoSelectionInputMode.dragFreeRecognizer = MouseEventRecognizers.LEFT_DRAG
      // always start a segment for polyline lasso selection
      lassoSelectionInputMode.startSegmentRecognizer = EventRecognizers.ALWAYS
      lassoSelectionInputMode.endSegmentRecognizer = EventRecognizers.createOrRecognizer(
        MouseEventRecognizers.LEFT_DOWN,
        MouseEventRecognizers.LEFT_UP
      )
      lassoSelectionInputMode.dragSegmentRecognizer = MouseEventRecognizers.MOVE_OR_DRAG
      lassoSelectionInputMode.finishRecognizer = MouseEventRecognizers.LEFT_DOUBLE_CLICK

      lassoSelectionInputMode.dragFreeRecognizerTouch = TouchEventRecognizers.TOUCH_MOVE_PRIMARY
      // always start a segment for polyline lasso selection
      lassoSelectionInputMode.startSegmentRecognizerTouch = EventRecognizers.ALWAYS
      lassoSelectionInputMode.endSegmentRecognizerTouch = EventRecognizers.createOrRecognizer(
        TouchEventRecognizers.TOUCH_DOWN_PRIMARY,
        TouchEventRecognizers.TOUCH_UP_PRIMARY
      )
      lassoSelectionInputMode.dragSegmentRecognizerTouch = TouchEventRecognizers.TOUCH_MOVE_PRIMARY
      lassoSelectionInputMode.finishRecognizerTouch = TouchEventRecognizers.TOUCH_DOUBLE_TAP_PRIMARY

      lassoSelectionInputMode.enabled = true
      break
    case 'marquee-selection':
      // disable lasso selection to let marquee selection activate on left drag gestures
      // (while lasso selection is enabled, it is prioritized over marquee selection because
      // lassoSelectionInputMode.priority < marqueeSelectionInputMode.priority)
      lassoSelectionInputMode.enabled = false
      break
  }
}

/**
 * Specifies the radius around the lasso selection starting point in which the lasso can be closed.
 * When the lasso is dragged near its starting point, a circle with corresponding radius is
 * highlighted.
 * @param {number} radius
 */
function setFinishRadius(radius) {
  inputMode.lassoSelectionInputMode.finishRadius = radius
}

/**
 * Decorates the lasso testable lookup to provide different modes of when a node is selected.
 * @param {!('nodes-complete'|'nodes-intersected'|'nodes-center')} mode
 */
function setLassoTestables(mode) {
  const nodeDecorator = graphComponent.graph.decorator.nodeDecorator
  const lassoTestableDecorator = nodeDecorator.lassoTestableDecorator
  if (decoration) {
    nodeDecorator.remove(decoration)
  }
  if (mode === 'nodes-complete') {
    // the nodes must be completely contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.setFactory(node =>
      ILassoTestable.create(
        (context, lassoPath) =>
          !lassoPath.intersects(node.layout.toRect(), 0) &&
          lassoPath.areaContains(node.layout.center)
      )
    )
  } else if (mode === 'nodes-intersected') {
    // the nodes must be intersected by or completely contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.setFactory(node =>
      LassoTestables.fromRectangle(node.layout)
    )
  } else if (mode === 'nodes-center') {
    // the nodes' center must be contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.setFactory(node =>
      LassoTestables.fromPoint(node.layout.center)
    )
  }
}

/**
 * Creates the demo's sample graph.
 * @param {!IGraph} graph The graph to populate
 */
function createSampleGraph(graph) {
  const locations = [
    [317, 87],
    [291, 2],
    [220, 0],
    [246, 73],
    [221, 144],
    [150, 180],
    [142, 251],
    [213, 286],
    [232, 215],
    [71, 285],
    [0, 320]
  ]
  const nodes = locations.map(location => graph.createNodeAt(location))

  graph.createEdge(nodes[2], nodes[1])
  graph.createEdge(nodes[1], nodes[0])
  graph.createEdge(nodes[0], nodes[3])
  graph.createEdge(nodes[3], nodes[2])
  graph.createEdge(nodes[3], nodes[1])
  graph.createEdge(nodes[4], nodes[3])
  graph.createEdge(nodes[4], nodes[5])
  graph.createEdge(nodes[8], nodes[4])
  graph.createEdge(nodes[7], nodes[8])
  graph.createEdge(nodes[7], nodes[6])
  graph.createEdge(nodes[6], nodes[5])
  graph.createEdge(nodes[6], nodes[9])
  graph.createEdge(nodes[9], nodes[10])
}

/**
 * Binds actions to the toolbar elements.
 */
function initializeUI() {
  const selectionStyles = document.querySelector('#selection-styles')
  selectionStyles.addEventListener('change', evt => {
    setSelectionStyle(selectionStyles.value)
  })
  const selectFinishRadius = document.querySelector('#select-finish-radius')
  selectFinishRadius.addEventListener('change', evt => {
    setFinishRadius(Number.parseFloat(selectFinishRadius.value))
  })
  const lassoTestable = document.querySelector('#choose-lasso-testable')
  lassoTestable.addEventListener('change', evt => {
    setLassoTestables(lassoTestable.value)
  })
}

run().then(finishLoading)
