/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, GraphEditorInputMode, ICommand, IGraph, License, Point } from 'yfiles'

import { bindChangeListener, bindCommand, checkLicense, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { LensInputMode } from './LensInputMode'
import { initDemoStyles } from '../../resources/demo-styles'

let graphComponent: GraphComponent = null!
let lensInputMode: LensInputMode = null!

function run(licenseData: object): void {
  License.value = licenseData

  graphComponent = new GraphComponent('#graphComponent')

  const graphEditorInputMode = new GraphEditorInputMode()
  graphComponent.inputMode = graphEditorInputMode
  // decrease the zoom of the graphComponent to make sure the magnifying glass is visible
  graphComponent.zoom = 0.5

  // Create the input mode that implements the magnifying glass and add it to the input mode
  // of the graph component
  lensInputMode = new LensInputMode()
  graphEditorInputMode.add(lensInputMode)

  initDemoStyles(graphComponent.graph)
  populateGraph(graphComponent.graph)

  initializeUI()

  showApp(graphComponent)
}

/**
 * Creates the sample graph.
 * @param graph The graph of the graphComponent
 */
function populateGraph(graph: IGraph): void {
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(150, 30))
  const node3 = graph.createNodeAt(new Point(260, 200))

  graph.createEdge(node1, node2)
  const edge = graph.createEdge(node2, node3)
  graph.addBend(edge, new Point(260, 30))

  graph.addLabel(node1, 'n1')
  graph.addLabel(node2, 'n2')
  graph.addLabel(node3, 'n3')
  graph.addLabel(edge, 'Edge')
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const zoomSelectElement = document.querySelector<HTMLSelectElement>(
    "select[data-command='lensZoom']"
  )!
  zoomSelectElement.addEventListener('change', evt => {
    lensInputMode.zoomFactor = parseInt(zoomSelectElement.value)
  })
  zoomSelectElement.selectedIndex = 2

  graphComponent.addZoomChangedListener(() => {
    const label = document.querySelector<HTMLElement>('#zoomLabel')!
    label.textContent = String(Math.round(graphComponent.zoom * 100) / 100)
  })
}

// Runs the demo
loadJson().then(checkLicense).then(run)
