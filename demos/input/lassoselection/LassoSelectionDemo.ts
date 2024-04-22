/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  EventRecognizers,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IContextLookupChainLink,
  IGraph,
  ILassoTestable,
  LassoTestables,
  LayoutExecutor,
  LayoutOrientation,
  License,
  MouseEventRecognizers,
  OrganicLayout,
  TouchEventRecognizers
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent
let inputMode: GraphEditorInputMode
let decoration: IContextLookupChainLink | null

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initDemoStyles(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new OrganicLayout({
      minimumNodeDistance: 50,
      automaticGroupNodeCompaction: true,
      layoutOrientation: LayoutOrientation.TOP_TO_BOTTOM
    })
  )
  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  configureLassoSelection()

  initializeUI()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })

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
function configureLassoSelection(): void {
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
function setSelectionStyle(
  style: 'free-hand-selection' | 'polyline-selection' | 'marquee-selection'
): void {
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
 */
function setFinishRadius(radius: number): void {
  inputMode.lassoSelectionInputMode.finishRadius = radius
}

/**
 * Decorates the lasso-testable lookup to provide different modes of when a node is selected.
 */
function setLassoTestables(mode: 'nodes-complete' | 'nodes-intersected' | 'nodes-center'): void {
  const nodeDecorator = graphComponent.graph.decorator.nodeDecorator
  const lassoTestableDecorator = nodeDecorator.lassoTestableDecorator
  if (decoration) {
    nodeDecorator.remove(decoration)
  }
  if (mode === 'nodes-complete') {
    // the nodes must be completely contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.setFactory((node) =>
      ILassoTestable.create(
        (_context, lassoPath) =>
          !lassoPath.intersects(node.layout.toRect(), 0) &&
          lassoPath.areaContains(node.layout.center)
      )
    )
  } else if (mode === 'nodes-intersected') {
    // the nodes must be intersected by or completely contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.setFactory((node) =>
      LassoTestables.fromRectangle(node.layout)
    )
  } else if (mode === 'nodes-center') {
    // the nodes' center must be contained in the lasso to end up in the selection
    decoration = lassoTestableDecorator.setFactory((node) =>
      LassoTestables.fromPoint(node.layout.center)
    )
  }
}

/**
 * Binds actions to the toolbar elements.
 */
function initializeUI(): void {
  const selectionStyles = document.querySelector<HTMLSelectElement>('#selection-styles')!
  selectionStyles.addEventListener('change', (_evt) => {
    setSelectionStyle(
      selectionStyles.value as 'free-hand-selection' | 'polyline-selection' | 'marquee-selection'
    )
  })
  const selectFinishRadius = document.querySelector<HTMLInputElement>('#select-finish-radius')!
  selectFinishRadius.addEventListener('change', (_evt) => {
    setFinishRadius(Number.parseFloat(selectFinishRadius.value))
  })
  const lassoTestable = document.querySelector<HTMLInputElement>('#choose-lasso-testable')!
  lassoTestable.addEventListener('change', (_evt) => {
    setLassoTestables(
      lassoTestable.value as 'nodes-complete' | 'nodes-intersected' | 'nodes-center'
    )
  })
}

run().then(finishLoading)
