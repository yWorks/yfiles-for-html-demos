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
  GraphClipboard,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLSupport,
  HierarchicLayout,
  ICommand,
  IGraph,
  IInputModeContext,
  IMarqueeTestable,
  IModelItem,
  IPortCandidateProvider,
  ITable,
  LayoutExecutor,
  LayoutOrientation,
  License,
  MinimumNodeSizeStage,
  OrthogonalEdgeEditingContext,
  ParentNodeDetectionModes,
  PopulateItemContextMenuEventArgs,
  Rect,
  ReparentStripeHandler,
  StorageLocation,
  StripeSubregionTypes,
  StripeTypes,
  Table,
  TableEditorInputMode
} from 'yfiles'
import {
  configureDndInputMode,
  configureDndPanel,
  createGroupNodeStyle
} from './DragAndDropSupport.js'
import TableStyles from './TableStyles.js'
import MyReparentHandler from './MyReparentHandler.js'
import { ContextMenu } from 'demo-utils/ContextMenu'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { configureTwoPointerPanning } from 'demo-utils/configure-two-pointer-panning'
import { disableUIElements, enableUIElements, finishLoading } from 'demo-resources/demo-page'

/**
 * The component displaying the demo's graph.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * This demo's graph instance.
 * @type {IGraph}
 */
let graph

/**
 * The layout call is asynchronous. However, we only want one layout at a time.
 * @type {boolean}
 */
let isLayoutRunning = false

/**
 * Bootstraps this demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graph = graphComponent.graph

  // initialize the input mode
  graphComponent.inputMode = createEditorMode()

  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)

  // initialize default styles
  initDemoStyles(graph)
  graph.groupNodeDefaults.style = createGroupNodeStyle()

  // configures the drag and drop panel
  configureDndPanel()

  // Enable general undo support
  graph.undoEngineEnabled = true

  // configures the table editor input mode
  const tableEditorInputMode = configureTableEditing()

  // configures the context menu
  configureContextMenu(tableEditorInputMode)

  // reads the default graph from the given file
  createGraph()

  // bind toolbar actions
  initializeUI()
}

/**
 * Reads the default sample graph.
 */
async function createGraph() {
  // enable loading and saving, and load a sample graph
  const graphMLSupport = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the table and demo styles - without a namespace mapping, serialization will fail
  graphMLSupport.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoTableStyle/1.0',
    TableStyles
  )
  await graphMLSupport.graphMLIOHandler.readFromURL(
    graphComponent.graph,
    'resources/sample.graphml'
  )
  graphComponent.fitGraphBounds()
}

/**
 * Creates the editor input mode for this demo.
 * @returns {!GraphEditorInputMode}
 */
function createEditorMode() {
  const mode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    allowCreateNode: false,
    contextMenuItems: GraphItemTypes.NODE,
    nodeDropInputMode: configureDndInputMode(graph)
  })

  return mode
}

/**
 * Configures table editing specific parts.
 * @returns {!TableEditorInputMode} The table editor input mode
 */
function configureTableEditing() {
  const graphInputMode = graphComponent.inputMode

  // use the undo support from the graph also for all future table instances
  Table.installStaticUndoSupport(graph)

  // provide no candidates for edge creation at pool nodes - this effectively disables
  // edge creations for those nodes
  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setImplementation(
    (node) => node.lookup(ITable.$class) !== null,
    IPortCandidateProvider.NO_CANDIDATES
  )

  // customize marquee selection handling for pool nodes
  graph.decorator.nodeDecorator.marqueeTestableDecorator.setFactory(
    (node) => node.lookup(ITable.$class) !== null,
    // the marquee testable for pool nodes. The pool node should only be selected by marquee, if the entire bounds are
    // within the marquee.
    (node) =>
      IMarqueeTestable.create((context, box) => {
        const rectangle = node.layout
        return box.contains(rectangle.topLeft) && box.contains(rectangle.bottomRight)
      })
  )

  const reparentStripeHandler = new ReparentStripeHandler()
  reparentStripeHandler.maxColumnLevel = 2
  reparentStripeHandler.maxRowLevel = 2

  // create a new TEIM instance which also allows drag and drop
  const tableInputMode = new TableEditorInputMode({
    reparentStripeHandler,
    // we set the priority higher than for the handle input mode so that handles win if both gestures are possible
    priority: graphInputMode.handleInputMode.priority + 1
  })
  tableInputMode.stripeDropInputMode.enabled = true

  // add to GEIM
  graphInputMode.add(tableInputMode)

  // tooltip for tables. We show only tool tips for stripe headers in this demo.
  graphInputMode.mouseHoverInputMode.addQueryToolTipListener((_, evt) => {
    if (!evt.handled) {
      const stripe = tableInputMode.findStripe(
        evt.queryLocation,
        StripeTypes.ALL,
        StripeSubregionTypes.HEADER
      )
      if (stripe !== null) {
        evt.toolTip = stripe.stripe.toString()
        evt.handled = true
      }
    }
  })
  // register custom reparent handler that prevents reparenting of table nodes (i.e. they may only appear on root
  // level)
  graphInputMode.reparentNodeHandler = new MyReparentHandler(graphInputMode.reparentNodeHandler)

  // prevent re-parenting of tables into tables by copy & paste
  const clipboard = new GraphClipboard()
  clipboard.parentNodeDetection = ParentNodeDetectionModes.PREVIOUS_PARENT
  graphComponent.clipboard = clipboard

  return tableInputMode
}

/**
 * Initializes the context menu.
 * @param {!TableEditorInputMode} tableEditorInputMode The table editor input mode that is used to populate the context menu
 */
function configureContextMenu(tableEditorInputMode) {
  const graphInputMode = graphComponent.inputMode
  // create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, (location) => {
    if (
      graphInputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))
    ) {
      contextMenu.show(location)
    }
  })

  // add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // this PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  graphInputMode.addPopulateItemContextMenuListener((_, evt) =>
    populateContextMenu(contextMenu, evt, tableEditorInputMode)
  )

  // add a listener that closes the menu when the input mode requests this
  graphInputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // if the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    graphInputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Event handler for the context menu.
 *
 * @param {!ContextMenu} contextMenu The {@link ContextMenu} instance
 * @param {!PopulateItemContextMenuEventArgs.<IModelItem>} args The event arguments
 * @param {!TableEditorInputMode} tableEditorInputMode The table editor input mode which is necessary to add new stripes
 */
function populateContextMenu(contextMenu, args, tableEditorInputMode) {
  const graphInputMode = graphComponent.inputMode
  if (args.handled) {
    return
  }
  contextMenu.clearItems()
  const stripe = tableEditorInputMode.findStripe(
    args.queryLocation,
    StripeTypes.ALL,
    StripeSubregionTypes.HEADER
  )

  if (stripe !== null) {
    contextMenu.addMenuItem(`Delete ${stripe.stripe}`, () => {
      ICommand.DELETE.execute(stripe.stripe, graphComponent)
    })

    contextMenu.addMenuItem(`Insert new stripe before ${stripe.stripe}`, () => {
      const parent = stripe.stripe.parentStripe
      const index = stripe.stripe.index
      tableEditorInputMode.insertChild(parent, index)
    })
    contextMenu.addMenuItem(`Insert new stripe after ${stripe.stripe}`, () => {
      const parent = stripe.stripe.parentStripe
      const index = stripe.stripe.index
      tableEditorInputMode.insertChild(parent, index + 1)
    })
    args.showMenu = true
    return
  }
  const tableNode = graphInputMode.findItems(
    args.queryLocation,
    [GraphItemTypes.NODE],
    (item) => item.lookup(ITable.$class) !== null
  )
  if (tableNode !== null && tableNode.size > 0) {
    contextMenu.addMenuItem(`ContextMenu for ${tableNode.at(0)}`, null)
    args.showMenu = true
    return
  }
  args.showMenu = false
}

/**
 * Perform a hierarchic layout that also configures the tables.
 * Table support is automatically enabled in {@link LayoutExecutor}. The layout will:
 * - Arrange all leaf nodes in a hierarchic layout inside their respective table cells
 * - Resize all table cells to encompass their child nodes. Optionally,
 *   {@link TableLayoutConfigurator.compaction} allows to shrink table cells, otherwise, table cells
 *   can only grow.
 */
async function applyLayout() {
  const layout = new HierarchicLayout({
    componentLayoutEnabled: false,
    layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
    orthogonalRouting: true,
    recursiveGroupLayering: false
  })

  // we use Layout executor convenience method that already sets up the whole layout pipeline correctly
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: new MinimumNodeSizeStage(layout),
    // Table layout is enabled by default already...
    configureTableLayout: true,
    duration: '0.5s',
    animateViewport: true
  })
  // table cells may only grow by an automatic layout.
  layoutExecutor.tableLayoutConfigurator.compaction = false

  if (!isLayoutRunning) {
    // do not start another layout if it is running already.
    isLayoutRunning = true
    disableUIElements('#layout-button')
    try {
      await layoutExecutor.start()
    } finally {
      isLayoutRunning = false
      enableUIElements()
    }
  }
}

/**
 * Wire up the UI.
 */
function initializeUI() {
  document.querySelector('#layout-button').addEventListener('click', applyLayout)
}

run().then(finishLoading)
