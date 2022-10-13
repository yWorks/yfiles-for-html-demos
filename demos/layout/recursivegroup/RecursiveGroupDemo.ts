/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import {
  DefaultFolderNodeConverter,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  ICommand,
  INode,
  License,
  NodeAlignmentPolicy,
  Size
} from 'yfiles'

import { createThreeTierLayout, createThreeTierLayoutData } from './ThreeTierLayout'
import {
  bindAction,
  bindCommand,
  readGraph,
  reportDemoError,
  showApp
} from '../../resources/demo-app'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * The GraphComponent.
 */
let graphComponent: GraphComponent

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeGraph()
  initializeInputModes()
  registerCommands()

  loadSample()

  showApp(graphComponent)
}

/**
 * Runs the 'three tier layout', i.e., {@link RecursiveGroupLayout} with {@link HierarchicLayout}
 * as core layout.
 */
async function runLayout(): Promise<void> {
  setUIDisabled(true)

  const fromSketch = (document.getElementById('from-sketch') as HTMLInputElement).checked

  const layout = createThreeTierLayout(fromSketch)
  const layoutData = createThreeTierLayoutData(graphComponent.graph, fromSketch)
  try {
    graphComponent.fitGraphBounds()
    await graphComponent.morphLayout(layout, '0.5s', layoutData)
  } catch (error) {
    reportDemoError(error)
  }
  setUIDisabled(false)
}

/**
 * Initializes folding and default styles for the current graph.
 */
function initializeGraph(): void {
  const manager = new FoldingManager()
  graphComponent.graph = manager.createFoldingView().graph
  const folderNodeConverter = manager.folderNodeConverter as DefaultFolderNodeConverter
  folderNodeConverter.copyFirstLabel = true
  folderNodeConverter.folderNodeSize = new Size(80, 60)

  graphComponent.navigationCommandsEnabled = true

  initDemoStyles(graphComponent.graph)
}

/**
 * Initializes the interactive behavior.
 */
function initializeInputModes(): void {
  const inputMode = new GraphEditorInputMode({
    showHandleItems: GraphItemTypes.NONE
  })
  inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_LEFT
  inputMode.navigationInputMode.addGroupCollapsedListener(runLayout)
  inputMode.navigationInputMode.addGroupExpandedListener(runLayout)
  graphComponent.inputMode = inputMode
}

/**
 * Wires up the GUI.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='Layout']", runLayout)
}

/**
 * Loads the three-tier example graph.
 */
async function loadSample(): Promise<void> {
  const path = `resources/three-tier.graphml`

  const ioHandler = new GraphMLIOHandler()
  await readGraph(ioHandler, graphComponent.graph, path)
  // adjust default size and style to match the first leaf in the loaded graph to have new nodes match the graph's style
  const graph = graphComponent.graph
  const firstLeaf = graph.groupingSupport
    .getDescendants(null)
    .find((node: INode): boolean => !graph.isGroupNode(node))
  if (firstLeaf) {
    graphComponent.graph.nodeDefaults.size = firstLeaf.layout.toSize()
    graphComponent.graph.nodeDefaults.style = firstLeaf.style
  }
  await runLayout()
}

/**
 * Enables/disables the buttons in the toolbar and the input mode. This is used for managing the toolbar during
 * layout calculation.
 */
function setUIDisabled(disabled: boolean): void {
  ;(document.getElementById('from-sketch') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('layout') as HTMLInputElement).disabled = disabled
}

// noinspection JSIgnoredPromiseFromCall
run()
