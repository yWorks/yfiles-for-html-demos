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
  Class,
  FoldingManager,
  GraphComponent,
  GraphViewerInputMode,
  LayoutExecutor,
  License,
  ScrollBarVisibility,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { DeepZoomGroupNodeStyle } from './DeepZoomGroupNodeStyle'
import { fitContent, initializeDeepZoom, zoomToOriginal } from './deep-zoom-update'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { loadSampleGraph } from './model/load-sample-graph'
import { applyDeepZoomLayout } from './deep-zoom-layout'
import { createDemoShapeNodeStyle } from 'demo-resources/demo-styles'

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')

  // hide the scrollbars
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.NEVER
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.NEVER

  initializeGraphStyles(graphComponent)
  await loadSampleGraph(graphComponent)

  // Enable a managed folding view on the graph, instead of displaying all elements
  enableFolding(graphComponent)

  // apply different layouts to the individual layers
  applyDeepZoomLayout(graphComponent.graph.foldingView!)

  // initialize the input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  initializeUI(graphComponent)

  // attach a viewport listener that adjusts the viewport and visible graph depending on zoom level
  initializeDeepZoom(graphComponent)

  graphComponent.fitGraphBounds()
}

/**
 * Sets a custom node style for the group nodes of the graph and
 * initializes the styles for the normal nodes.
 */
function initializeGraphStyles(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  graph.groupNodeDefaults.style = new DeepZoomGroupNodeStyle(
    new ShapeNodeStyle({ fill: '#fff', stroke: '2.5px #996d4d', shape: 'round-rectangle' })
  )
  graph.groupNodeDefaults.size = new Size(50, 50)

  graph.nodeDefaults.size = new Size(50, 50)
  graph.nodeDefaults.style = createDemoShapeNodeStyle('round-rectangle')
}

/**
 * Enables folding - changes the graphComponent's graph to a managed view
 * that provides the actual collapse/expand state.
 */
function enableFolding(graphComponent: GraphComponent): void {
  // Creates the folding manager
  const foldingManager = new FoldingManager(graphComponent.graph)
  // all group node are collapsed at startup
  graphComponent.graph = foldingManager.createFoldingView({ isExpanded: () => false }).graph
}

/**
 * Registers special click listeners to the "zoom to original" and "fit content" buttons.
 */
function initializeUI(graphComponent: GraphComponent): void {
  // Since setting the zoom to 1 or calling fitContent doesn't suffice in this scenario,
  // register custom event listeners to the "zoom to original" and "fit content" buttons.
  document
    .querySelector('.demo-icon-yIconZoomOriginal')!
    .addEventListener('click', () => zoomToOriginal(graphComponent))
  document
    .querySelector('#description-button-zoom-original')!
    .addEventListener('click', () => zoomToOriginal(graphComponent))
  document
    .querySelector('.demo-icon-yIconZoomFit')!
    .addEventListener('click', () => fitContent(graphComponent))
  document
    .querySelector('#description-button-fit-content')!
    .addEventListener('click', () => fitContent(graphComponent))
}

void run().then(finishLoading)
