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
import {
  DefaultGraph,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  ICommand,
  IFoldingView,
  IGraph,
  License,
  Point,
  Size
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // enable folding for the graph
  const foldingView = enableFolding()

  // assign the folded graph to the graph component
  graphComponent.graph = foldingView.graph

  // create an initial sample graph
  createInitialGraph(foldingView.manager.masterGraph)

  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  foldingView.manager.masterGraph.undoEngineEnabled = true

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Enables folding.
 *
 * @returns The folding view that manages the folded graph.
 */
function enableFolding(): IFoldingView {
  const masterGraph = new DefaultGraph()

  // set default styles for newly created graph elements
  initializeTutorialDefaults(masterGraph)

  // Creates the folding manager
  const manager = new FoldingManager(masterGraph)

  // Creates a folding view that manages the folded graph
  return manager.createFoldingView()
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
function initializeTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initDemoStyles(graph, { foldingEnabled: true })

  graph.groupNodeDefaults.style = new GroupNodeStyle({
    groupIcon: 'chevron-down',
    folderIcon: 'chevron-up',
    iconSize: 14,
    iconBackgroundShape: 'circle',
    iconForegroundFill: '#fff',
    tabFill: '#242265',
    tabPosition: 'top-trailing',
    stroke: '2px solid #242265',
    cornerRadius: 8,
    tabWidth: 70,
    contentAreaInsets: 8,
    hitTransparentContentArea: true
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right',
    textFill: '#fff'
  })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createDefaultParameter()

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)

  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Creates an initial sample graph.
 *
 * @param graph The graph.
 */
function createInitialGraph(graph: IGraph): void {
  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNodeAt([30, 175])
  const node5 = graph.createNodeAt([100, 175])

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort!, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort!, new Point(145, 75))
  graph.setPortLocation(edge2.sourcePort!, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort!, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort!, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort!, new Point(30, 155))
  graph.setPortLocation(edge4.sourcePort!, new Point(85, 115))
  graph.setPortLocation(edge4.targetPort!, new Point(90, 155))
  graph.setPortLocation(edge5.sourcePort!, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort!, new Point(110, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(30, 130)])
  graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", (): void => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='EnterGroup']", ICommand.ENTER_GROUP, graphComponent)
  bindCommand("button[data-command='ExitGroup']", ICommand.EXIT_GROUP, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
