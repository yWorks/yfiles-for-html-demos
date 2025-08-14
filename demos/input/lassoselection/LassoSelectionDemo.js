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
  EventRecognizers,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IContextLookupChainLink,
  IGraph,
  ILassoTestable,
  LayoutExecutor,
  License,
  OrganicLayout,
  PointerEventArgs
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'

let graphComponent
let inputMode
let decoration

async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  initDemoStyles(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new OrganicLayout({
      defaultMinimumNodeDistance: 50,
      automaticGroupNodeCompaction: true,
      layoutOrientation: 'top-to-bottom'
    })
  )
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  configureLassoSelection()

  initializeUI()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({ data: graphData.nodeList, id: (item) => item.id })

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
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
 */
function setSelectionStyle(style) {
  const lassoSelectionInputMode = inputMode.lassoSelectionInputMode

  switch (style) {
    default:
    case 'free-hand-selection':
      lassoSelectionInputMode.dragFreeHandRecognizer = EventRecognizers.MOUSE_DRAG
      // never start a segment in free-hand lasso selection
      lassoSelectionInputMode.startSegmentRecognizer = EventRecognizers.NEVER
      lassoSelectionInputMode.endSegmentRecognizer = EventRecognizers.MOUSE_DOWN
      lassoSelectionInputMode.dragSegmentRecognizer = EventRecognizers.MOUSE_MOVE
      lassoSelectionInputMode.finishRecognizer = EventRecognizers.MOUSE_UP

      lassoSelectionInputMode.dragFreeHandRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      // never start a segment in free-hand lasso selection
      lassoSelectionInputMode.startSegmentRecognizerTouch = EventRecognizers.NEVER
      lassoSelectionInputMode.endSegmentRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DOWN
      lassoSelectionInputMode.dragSegmentRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      lassoSelectionInputMode.finishRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_UP

      lassoSelectionInputMode.enabled = true
      break
    case 'polyline-selection':
      lassoSelectionInputMode.dragFreeHandRecognizer = EventRecognizers.MOUSE_DRAG
      // always start a segment for polyline lasso selection
      lassoSelectionInputMode.startSegmentRecognizer = EventRecognizers.ALWAYS
      lassoSelectionInputMode.endSegmentRecognizer = (evt, eventSource) =>
        EventRecognizers.MOUSE_DOWN(evt, eventSource) || EventRecognizers.MOUSE_UP(evt, eventSource)
      lassoSelectionInputMode.dragSegmentRecognizer = (evt, eventSource) =>
        EventRecognizers.MOUSE_DRAG(evt, eventSource) ||
        EventRecognizers.MOUSE_MOVE(evt, eventSource)

      // finish anywhere with a double click
      lassoSelectionInputMode.finishRecognizer = (evt) => {
        return evt instanceof PointerEventArgs && evt.clickCount > 1
      }

      lassoSelectionInputMode.dragFreeHandRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      // always start a segment for polyline lasso selection
      lassoSelectionInputMode.startSegmentRecognizerTouch = EventRecognizers.ALWAYS
      lassoSelectionInputMode.endSegmentRecognizerTouch = (evt, eventSource) =>
        EventRecognizers.TOUCH_PRIMARY_DOWN(evt, eventSource) ||
        EventRecognizers.TOUCH_PRIMARY_UP(evt, eventSource)

      lassoSelectionInputMode.dragSegmentRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DRAG
      lassoSelectionInputMode.finishRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DOUBLE_TAP

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
 */
function setFinishRadius(radius) {
  inputMode.lassoSelectionInputMode.finishRadius = radius
}

/**
 * Decorates the lasso-testable lookup to provide different modes of when a node is selected.
 */
function setLassoTestables(mode) {
  const nodeDecorator = graphComponent.graph.decorator.nodes
  const lassoTestableDecorator = nodeDecorator.lassoTestable
  if (decoration) {
    nodeDecorator.remove(decoration)
  }
  if (mode === 'nodes-complete') {
    // the nodes must be completely contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.addFactory((node) =>
      ILassoTestable.create(
        (_context, lassoPath) =>
          !lassoPath.pathIntersects(node.layout.toRect(), 0) &&
          lassoPath.areaContains(node.layout.center)
      )
    )
  } else if (mode === 'nodes-intersected') {
    // the nodes must be intersected by or completely contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.addFactory((node) =>
      ILassoTestable.fromRectangle(node.layout)
    )
  } else if (mode === 'nodes-center') {
    // the nodes' center must be contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.addFactory((node) =>
      ILassoTestable.fromPoint(node.layout.center)
    )
  }
}

/**
 * Binds actions to the toolbar elements.
 */
function initializeUI() {
  const selectionStyles = document.querySelector('#selection-styles')
  selectionStyles.addEventListener('change', (_evt) => {
    setSelectionStyle(selectionStyles.value)
  })
  const selectFinishRadius = document.querySelector('#select-finish-radius')
  selectFinishRadius.addEventListener('change', (_evt) => {
    setFinishRadius(Number.parseFloat(selectFinishRadius.value))
  })
  const lassoTestable = document.querySelector('#choose-lasso-testable')
  lassoTestable.addEventListener('change', (_evt) => {
    setLassoTestables(lassoTestable.value)
  })
}

run().then(finishLoading)
