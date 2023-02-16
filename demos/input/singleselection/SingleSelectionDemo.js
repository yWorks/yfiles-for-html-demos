/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import { GraphComponent, GraphEditorInputMode, IGraph, License, Point, Rect, Size } from 'yfiles'

import { bindChangeListener, showApp } from '../../resources/demo-app.js'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles.js'
import { disableSingleSelection, enableSingleSelection } from './SingleSelectionHelper.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * Changes the selection mode.
 * @param {!GraphComponent} graphComponent
 * @param {boolean} [singleSelectionEnabled=true]
 */
function toggleSingleSelection(graphComponent, singleSelectionEnabled = true) {
  if (singleSelectionEnabled) {
    enableSingleSelection(graphComponent)
  } else {
    disableSingleSelection(graphComponent)
  }
}

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  const graph = graphComponent.graph

  graphComponent.inputMode = new GraphEditorInputMode()

  // enable the undo feature
  graph.undoEngineEnabled = true
  // Initialize the default style of the nodes and edges
  initDemoStyles(graph)

  createSampleGraph(graph)
  graphComponent.fitGraphBounds()

  // wire up the UI
  bindChangeListener("input[data-command='ToggleSingleSelection']", checked =>
    toggleSingleSelection(graphComponent, checked)
  )

  toggleSingleSelection(graphComponent)

  showApp(graphComponent)
}

const sampleNodeLocations = [
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

/**
 * Creates the sample graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  graph.clear()
  const nodes = []
  for (const location of sampleNodeLocations) {
    nodes.push(graph.createNode(new Rect(Point.from(location), new Size(30, 30))))
  }

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

  // reset undo after initial graph loading
  graph.undoEngine.clear()
}

// noinspection JSIgnoredPromiseFromCall
run()
