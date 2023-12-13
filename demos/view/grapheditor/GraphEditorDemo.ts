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
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  GraphOverviewComponent,
  GraphSnapContext,
  HierarchicLayout,
  ICommand,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  LabelSnapContext,
  LayoutExecutor,
  License,
  NodeAlignmentPolicy,
  OrthogonalEdgeEditingContext,
  PopulateItemContextMenuEventArgs,
  RenderModes,
  SmartEdgeLabelModel,
  StorageLocation,
  WebGL2GraphModelManager
} from 'yfiles'

import { ContextMenu } from 'demo-utils/ContextMenu'
import {
  applyDemoTheme,
  DemoStyleOverviewPaintable,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { BrowserDetection } from 'demo-utils/BrowserDetection'
import { configureTwoPointerPanning } from 'demo-utils/configure-two-pointer-panning'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent

let overviewComponent: GraphOverviewComponent

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // Initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent, { scale: 1 })

  overviewComponent = new GraphOverviewComponent('overviewComponent')
  overviewComponent.graphComponent = graphComponent

  // Configure and enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  foldingView.enqueueNavigationalUndoUnits = true
  const graph = foldingView.graph
  graphComponent.graph = graph

  // Styling for the overviewComponent
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graph)

  // Set up the default styles for the graph
  setDefaultStyles(graph)

  // Enable GraphML support
  enableGraphML(graphComponent)

  // Specify a configured input mode that enables graph editing
  graphComponent.inputMode = createEditorMode()

  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(new HierarchicLayout())
  graphComponent.fitGraphBounds()

  // Enable the undo engine on the master graph
  foldingManager.masterGraph.undoEngineEnabled = true

  // Register functionality for the buttons in this demo
  initializeUI(graphComponent)
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Creates the editor input mode for this demo.
 */
function createEditorMode(): GraphEditorInputMode {
  const mode = new GraphEditorInputMode({
    snapContext: createGraphSnapContext(),
    labelSnapContext: createLabelSnapContext(),
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({
      enabled: false
    }),
    allowGroupingOperations: true
  })

  // Fix the top left location of a group node when toggling collapse/expand
  mode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT

  // Make bend creation more important than moving of selected edges.
  // As a result, dragging a selected edge (not its bends) will create a new bend instead of moving all bends.
  // This is especially nicer in conjunction with orthogonal edge editing because this would create additional bends
  // every time the edge is moved otherwise
  mode.createBendInputMode.priority = mode.moveInputMode.priority - 1

  // use WebGL rendering for handles if possible, otherwise the handles are rendered using SVG
  if (BrowserDetection.webGL2) {
    Class.ensure(WebGL2GraphModelManager)
    mode.handleInputMode.renderMode = RenderModes.WEB_GL2
  }

  // Create a context menu. In this demo, we use our sample context menu implementation, but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function, which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, (location) => {
    if (mode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  mode.addPopulateItemContextMenuListener((_, evt) => populateContextMenu(contextMenu, evt))

  // Add a listener that closes the menu when the input mode requests this
  mode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example, because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => {
    mode.contextMenuInputMode.menuClosed()
  }

  return mode
}

/**
 * Creates a configured {@link GraphSnapContext} for this demo.
 */
function createGraphSnapContext(): GraphSnapContext {
  return new GraphSnapContext({
    enabled: false
  })
}

/**
 * Creates a configured {@link LabelSnapContext} for this demo.
 */
function createLabelSnapContext(): LabelSnapContext {
  return new LabelSnapContext({
    enabled: false,
    snapDistance: 15,
    snapLineExtension: 100
  })
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML(graphComponent: GraphComponent): void {
  new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
}

/**
 * Sets default styles to the graph.
 * @param graph The graph
 */
function setDefaultStyles(graph: IGraph): void {
  // Assign the default demo styles
  initDemoStyles(graph, { foldingEnabled: true })

  // Set the default node label position to centered below the node with the FreeNodeLabelModel that supports label
  // snapping
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1.0],
    [0, 10],
    [0.5, 0.0],
    [0, 0],
    0
  )

  // Set the default edge label position with the SmartEdgeLabelModel that supports label snapping
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    0,
    0.5
  )
}

/**
 * Binds various actions to buttons in the demo's toolbar.
 */
function initializeUI(graphComponent: GraphComponent): void {
  const geim = graphComponent.inputMode as GraphEditorInputMode

  const snappingButton = document.querySelector<HTMLInputElement>('#demo-snapping-button')!
  snappingButton.addEventListener('click', () => {
    geim.snapContext!.enabled = snappingButton.checked
    geim.labelSnapContext!.enabled = snappingButton.checked
  })

  const orthogonalEditingButton = document.querySelector<HTMLInputElement>(
    '#demo-orthogonal-editing-button'
  )!
  orthogonalEditingButton.addEventListener('click', () => {
    geim.orthogonalEdgeEditingContext!.enabled = orthogonalEditingButton.checked
  })
}

function selectAllEdges(): void {
  graphComponent.selection.clear()
  graphComponent.graph.edges.forEach((edge) => graphComponent.selection.setSelected(edge, true))
}

function selectAllNodes(): void {
  graphComponent.selection.clear()
  graphComponent.graph.nodes.forEach((node) => graphComponent.selection.setSelected(node, true))
}

/**
 * Populates the context menu based on the item the mouse hovers over
 * @param contextMenu The context menu.
 * @param args The event args.
 */
function populateContextMenu(
  contextMenu: ContextMenu,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
  // for this item (or more generally, the location provided by the event args).
  // If you don't want to show a context menu for some locations, set 'false' in these cases.
  args.showMenu = true

  contextMenu.clearItems()

  // In this demo, we use the following custom hit testing to prefer nodes.
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

  // Check whether a node was it. If it was, we prefer it over edges
  const hit = hits.find((item) => INode.isInstance(item)) || hits.at(0)

  const graphSelection = graphComponent.selection
  if (INode.isInstance(hit)) {
    // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
    // and select the hit item
    contextMenu.addMenuItem('Select All Nodes', selectAllNodes)
    if (!graphSelection.isSelected(hit)) {
      graphSelection.clear()
    }
    graphSelection.setSelected(hit, true)
  } else if (IEdge.isInstance(hit)) {
    contextMenu.addMenuItem('Select All Edges', selectAllEdges)
    if (!graphSelection.isSelected(hit)) {
      graphSelection.clear()
    }
    graphSelection.setSelected(hit, true)
  } else {
    // if another type of item or the empty canvas is hit: provide 'Select All'
    contextMenu.addMenuItem('Select All', () => {
      ICommand.SELECT_ALL.execute(null, graphComponent)
    })
  }

  // if one or more nodes are selected: add options to cut and copy
  if (graphSelection.selectedNodes.size > 0) {
    contextMenu.addMenuItem('Cut', () => {
      ICommand.CUT.execute(null, graphComponent)
    })
    contextMenu.addMenuItem('Copy', () => {
      ICommand.COPY.execute(null, graphComponent)
    })
  }
  if (!graphComponent.clipboard.empty) {
    // clipboard is not empty: add option to paste
    contextMenu.addMenuItem('Paste', () => {
      ICommand.PASTE.execute(args.queryLocation, graphComponent)
    })
  }
}

run().then(finishLoading)
