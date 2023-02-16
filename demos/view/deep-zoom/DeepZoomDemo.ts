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
  FoldingManager,
  FreeNodePortLocationModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IArrow,
  ICommand,
  License,
  Point,
  ScrollBarVisibility,
  ShapeNodeStyle,
  Size,
  SolidColorFill,
  Stroke,
  ViewportChanges
} from 'yfiles'
import type { INode } from 'yfiles'

import { bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import DeepZoomGroupNodeStyle from './DeepZoomGroupNodeStyle'
import { deepZoomViewportListener } from './DeepZoomViewportListener'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')

  // hide the scrollbars
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.NEVER
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.NEVER

  // enable smooth scrolling
  graphComponent.animatedViewportChanges = ViewportChanges.ALL

  // initialize the graph
  initializeGraph(graphComponent)
  await loadSampleGraph(graphComponent)

  // Enable a managed view on the graph, instead of displaying all elements
  enableFolding(graphComponent)

  // initialize the input mode
  graphComponent.inputMode = createEditorMode()

  // connects the toolbar buttons
  registerCommands(graphComponent)

  // attach a viewport listener that adjusts the viewport and visible graph depending on zoom level
  graphComponent.addViewportChangedListener(deepZoomViewportListener)

  graphComponent.fitGraphBounds()

  showApp(graphComponent)
}

/**
 * Sets a custom node style for the group nodes of the graph and initializes the styles for the normal nodes.
 * @param graphComponent The given graphComponent
 */
function initializeGraph(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  graph.groupNodeDefaults.style = new DeepZoomGroupNodeStyle(
    new SolidColorFill('#fff'),
    new Stroke('2.5px #996d4d')
  )
  graph.groupNodeDefaults.size = new Size(50, 50)

  graph.nodeDefaults.size = new Size(50, 50)
  graph.nodeDefaults.style = new ShapeNodeStyle({ shape: 'round-rectangle', fill: 'lightblue' })
}

/**
 * Creates the default input mode for the graphComponent.
 */
function createEditorMode(): GraphEditorInputMode {
  return new GraphEditorInputMode({
    allowEditLabel: true,
    hideLabelDuringEditing: false,
    allowGroupingOperations: true,
    allowCreateEdge: false
  })
}

/**
 * Loads the initial sample graph.
 * @param graphComponent The given graphComponent
 */
async function loadSampleGraph(graphComponent: GraphComponent): Promise<void> {
  const graph = graphComponent.graph

  const graphBuilder = new GraphBuilder(graph)

  // node creation
  graph.nodeDefaults.shareStyleInstance = false
  const response = await fetch('./resources/SampleGraph.json')
  const sampleData = await response.json()
  const nodesData = sampleData['nodes']
  const nodesSource = graphBuilder.createNodesSource({
    data: nodesData as Record<string, any>[],
    id: 'id',
    parentId: 'parentId'
  })
  nodesSource.nodeCreator.styleBindings.addBinding('fill', data => data.fill)
  nodesSource.nodeCreator.styleBindings.addBinding('stroke', data => `1.5px ${data.stroke}`)
  nodesSource.nodeCreator.layoutBindings.addBinding('x', data => data.x)
  nodesSource.nodeCreator.layoutBindings.addBinding('y', data => data.y)

  // group node creation
  graph.groupNodeDefaults.shareStyleInstance = false
  const groupSource = graphBuilder.createGroupNodesSource({
    data: sampleData['groupNodes'] as Record<string, any>[],
    id: 'id',
    parentId: 'parentId'
  })
  groupSource.nodeCreator.styleBindings.addBinding('fill', data => data.fill)
  groupSource.nodeCreator.styleBindings.addBinding('stroke', data => `2.5px ${data.stroke}`)
  groupSource.nodeCreator.layoutBindings.addBinding('x', data => data.x)
  groupSource.nodeCreator.layoutBindings.addBinding('y', data => data.y)

  // edge creation
  graph.edgeDefaults.shareStyleInstance = false
  const edgesSource = graphBuilder.createEdgesSource({
    data: sampleData['edges'] as Record<string, any>[],
    sourceId: 'from',
    targetId: 'to',
    bends: 'bends'
  })

  edgesSource.edgeCreator.styleBindings.addBinding('stroke', data => `1.5px ${data.color}`)
  edgesSource.edgeCreator.styleBindings.addBinding('targetArrow', data =>
    IArrow.from(`${data.color} medium triangle`)
  )

  // adjust source and target location of edges
  function createParameter(node: INode, location: number[]) {
    return FreeNodePortLocationModel.INSTANCE.createParameter(
      node,
      new Point(location[0], location[1])
    )
  }

  // adjust edge ports - if already included in the data used it, otherwise take the nodes' center
  edgesSource.edgeCreator.addEdgeCreatedListener((sender, evt) => {
    const sourceNode = evt.item.sourceNode!
    const targetNode = evt.item.targetNode!
    const sourceLocation = evt.dataItem.sourceLocation
      ? evt.dataItem.sourceLocation
      : [sourceNode.layout.center.x, sourceNode.layout.center.y]
    const targetLocation = evt.dataItem.targetLocation
      ? evt.dataItem.targetLocation
      : [targetNode.layout.center.x, targetNode.layout.center.y]
    graph.setPortLocationParameter(
      evt.item.sourcePort!,
      createParameter(sourceNode, sourceLocation)
    )
    graph.setPortLocationParameter(
      evt.item.targetPort!,
      createParameter(targetNode, targetLocation)
    )
  })

  // actually create the graph
  graphBuilder.buildGraph()
}

/**
 * Binds UI elements to actions.
 * @param graphComponent The given graphComponent
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)

  bindChangeListener("input[data-command='ToggleSmoothScrolling']", enabled => {
    graphComponent.animatedViewportChanges = enabled ? ViewportChanges.ALL : ViewportChanges.NONE
  })
}

/**
 * Enables folding - changes the graphComponent's graph to a managed view
 * that provides the actual collapse/expand state.
 * @param graphComponent The given graphComponent
 */
function enableFolding(graphComponent: GraphComponent): void {
  // Creates the folding manager
  const foldingManager = new FoldingManager(graphComponent.graph)
  // all group node are collapsed at startup
  graphComponent.graph = foldingManager.createFoldingView({ isExpanded: () => false }).graph
}

// noinspection JSIgnoredPromiseFromCall
run()
