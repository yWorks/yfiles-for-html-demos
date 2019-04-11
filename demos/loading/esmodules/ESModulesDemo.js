/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  ICommand,
  LayoutExecutor,
  License,
  MinimumNodeSizeStage,
  Rect
} from '../../node_modules/yfiles/yfiles.js'
import { showApp, bindCommand, bindAction } from '../../resources/demo-app.js'
import NodeStyle from './ESModuleNodeStyle.js'
import loadJson from '../../resources/load-json.js'

function run(licenseData) {
  License.value = licenseData

  // Create a GraphComponent and enable interactive editing
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph
  graphComponent.inputMode = new GraphEditorInputMode()

  // Set the default node style for new nodes
  graph.nodeDefaults.style = new NodeStyle()

  // Create small sample graph
  initializeGraph(graph)

  // Enable undo and center the graph in the view
  graph.undoEngineEnabled = true
  graphComponent.fitGraphBounds()

  // Wire up the UI
  registerCommands(graphComponent)

  showApp(graphComponent)
}

function initializeGraph(graph) {
  const node1 = graph.createNode(new Rect(50, 50, 30, 30))
  const node2 = graph.createNode(new Rect(0, 150, 30, 30))
  const node3 = graph.createNode(new Rect(100, 150, 30, 30))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
}

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'morphLayout'.
Class.ensure(LayoutExecutor)

function applyLayout(graphComponent) {
  graphComponent
    .morphLayout(new MinimumNodeSizeStage(new HierarchicLayout()), '1s')
    .catch(error => {
      // If present, show the common demo error reporting dialog
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    })
}

function registerCommands(graphComponent) {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindAction("button[data-command='Layout']", () => applyLayout(graphComponent))
}

loadJson().then(run)
