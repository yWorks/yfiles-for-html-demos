/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultFoldingEdgeConverter,
  EdgeRouter,
  EdgeRouterData,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLSupport,
  ICommand,
  IEdge,
  License,
  RoutingPolicy,
  Size,
  StorageLocation
} from 'yfiles'

import { bindAction, bindCommand, checkLicense, readGraph, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import DemoStyles, {
  DemoNodeStyle,
  DemoSerializationListener,
  initDemoStyles
} from '../../resources/demo-styles'

let graphComponent: GraphComponent

let routingPolicy: HTMLSelectElement

async function run(licenseData: any): Promise<void> {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  // enable undo and folding
  graphComponent.graph.undoEngineEnabled = true
  const manager = new FoldingManager(graphComponent.graph)
  ;(manager.foldingEdgeConverter as DefaultFoldingEdgeConverter).reuseMasterPorts = true
  graphComponent.graph = manager.createFoldingView().graph

  // configure interaction
  graphComponent.inputMode = createInputMode()

  // configures default styles for newly created graph elements
  initDemoStyles(graphComponent.graph)
  graphComponent.graph.nodeDefaults.style = new DemoNodeStyle()
  graphComponent.graph.nodeDefaults.shareStyleInstance = false
  graphComponent.graph.nodeDefaults.size = new Size(125, 100)

  // load the sample graph
  await loadSampleGraph()

  // bind the demo buttons to their commands
  registerCommands()

  // initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Loads the sample graph.
 */
async function loadSampleGraph(): Promise<void> {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/2.0',
    DemoStyles
  )
  gs.graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)
  await readGraph(gs.graphMLIOHandler, graphComponent.graph, 'resources/sample.graphml')
  // when done - fit the bounds
  graphComponent.fitGraphBounds()
  // the sample graph bootstrapping should not be undoable
  graphComponent.graph.undoEngine!.clear()
}

/**
 * Configure interaction.
 */
function createInputMode() {
  const mode = new GraphEditorInputMode()
  mode.allowGroupingOperations = true
  // disable bend handling: the edge path will be routed
  mode.createEdgeInputMode.allowCreateBend = false
  mode.createBendInputMode.enabled = false
  mode.showHandleItems = GraphItemTypes.NODE
  mode.selectableItems = GraphItemTypes.NODE
  mode.marqueeSelectableItems = GraphItemTypes.NODE

  // register listener which trigger a re-routing after each
  mode.moveInputMode.addDragFinishedListener((sender, evt) => reRouteEdges())
  mode.handleInputMode.addDragFinishedListener((sender, evt) => reRouteEdges())
  mode.createEdgeInputMode.addEdgeCreatedListener((sender, evt) => reRouteEdges())
  mode.addNodeCreatedListener((sender, evt) => reRouteEdges())
  mode.addDeletedSelectionListener((sender, evt) => reRouteEdges())
  mode.navigationInputMode.addGroupCollapsedListener((sender, evt) => reRouteEdges())
  mode.navigationInputMode.addGroupExpandedListener((sender, evt) => reRouteEdges())
  mode.addElementsPastedListener((sender, evt) => reRouteEdges())
  return mode
}

/**
 * Re-Route the edges.
 *
 * The EdgeRouter will be used with its routingPolicy set to either PATH_AS_NEEDED or SEGMENTS_AS_NEEDED.
 * That way, the EdgeRouter itself will determine which edges need to be re-routed.
 * The different policies are selected with  the RoutingPolicy ComboBox in the tool bar:
 *    RoutingPolicy.PATH_AS_NEEDED: re-routes the entire path of a "dirty" edge.
 *    RoutingPolicy.SEGMENTS_AS_NEEDED: re-routes a dirty edge in a way that the
 *                                      existing path is kept as much as possible.
 */
async function reRouteEdges(): Promise<void> {
  const router = new EdgeRouter()
  router.defaultEdgeLayoutDescriptor.routingPolicy =
    routingPolicy.options[routingPolicy.selectedIndex].value === 'path'
      ? RoutingPolicy.PATH_AS_NEEDED
      : RoutingPolicy.SEGMENTS_AS_NEEDED

  // keep existing edge groups
  const data = new EdgeRouterData({
    sourceGroupIds: (e: IEdge) => `s: ${e.sourceNode!.layout.center} - ${e.sourcePort!.location}`,
    targetGroupIds: (e: IEdge) => `t: ${e.targetNode!.layout.center} - ${e.targetPort!.location}`
  })

  await graphComponent.morphLayout({
    layout: router,
    layoutData: data,
    morphDuration: '0.5s',
    animateViewport: false,
    allowUserInteraction: false
  })
}

function registerCommands(): void {
  bindAction("button[data-command='Reload']", () => {
    loadSampleGraph()
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)

  routingPolicy = document.getElementById('selectRoutingPolicy') as HTMLSelectElement
}

// start demo
loadJson().then(checkLicense).then(run)
