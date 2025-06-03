/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphMLIOHandler,
  HierarchicalLayout,
  IGraph,
  IInputModeContext,
  IMarqueeTestable,
  IModelItem,
  INodeStyle,
  IPortCandidateProvider,
  ITable,
  LayoutExecutor,
  License,
  ParentNodeDetectionModes,
  PopulateItemContextMenuEventArgs,
  Rect,
  ReparentStripeHandler,
  StripeSubregionTypes,
  StripeTypes,
  Table,
  TableEditorInputMode,
  TableRenderingOrder
} from '@yfiles/yfiles'
import {
  configureDndInputMode,
  configureDndPanel,
  createGroupNodeStyle
} from './DragAndDropSupport'
import TableStyles, { DemoTableStyle } from './TableStyles'
import { MyReparentHandler } from './MyReparentHandler'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import {
  disableUIElements,
  enableUIElements,
  finishLoading
} from '@yfiles/demo-resources/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'
/**
 * The component displaying the demo's graph.
 */
let graphComponent
/**
 * This demo's graph instance.
 */
let graph
/**
 * The layout call is asynchronous. However, we only want one layout at a time.
 */
let isLayoutRunning = false
/**
 * Bootstraps this demo.
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  graph = graphComponent.graph
  // initialize the input mode
  graphComponent.inputMode = createEditorMode()
  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
  // initialize default styles
  initDemoStyles(graph, { orthogonalEditing: true })
  graph.groupNodeDefaults.style = createGroupNodeStyle()
  // configures the drag and drop panel
  configureDndPanel()
  // Enable general undo support
  graph.undoEngineEnabled = true
  // configures the table editor input mode
  const tableEditorInputMode = configureTableEditing()
  // configures the context menu
  configureContextMenu(tableEditorInputMode)
  // enable loading and saving, and load a sample graph
  const graphMLIOHandler = new GraphMLIOHandler()
  // reads the default graph from the given file
  void createGraph(graphMLIOHandler)
  // bind toolbar actions
  initializeUI(graphMLIOHandler)
}
/**
 * Reads the default sample graph.
 */
async function createGraph(graphMLIOHandler) {
  // enable serialization of the table and demo styles - without a namespace mapping, serialization will fail
  graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoTableStyle/1.0',
    TableStyles
  )
  graphMLIOHandler.addTypeInformation(DemoTableStyle, {
    properties: {
      tableRenderingOrder: { default: TableRenderingOrder.ROWS_FIRST, type: TableRenderingOrder },
      table: { type: ITable },
      backgroundStyle: { type: INodeStyle }
    }
  })
  await graphMLIOHandler.readFromURL(graphComponent.graph, 'resources/sample.graphml')
  void graphComponent.fitGraphBounds()
}
/**
 * Creates the editor input mode for this demo.
 */
function createEditorMode() {
  return new GraphEditorInputMode({
    allowCreateNode: false,
    contextMenuItems: GraphItemTypes.NODE,
    nodeDropInputMode: configureDndInputMode(graph)
  })
}
/**
 * Configures table editing specific parts.
 * @returns The table editor input mode
 */
function configureTableEditing() {
  const graphInputMode = graphComponent.inputMode
  // use the undo support from the graph also for all future table instances
  Table.installStaticUndoSupport(graph)
  // provide no candidates for edge creation at pool nodes - this effectively disables
  // edge creations for those nodes
  graph.decorator.nodes.portCandidateProvider.addConstant(
    (node) => !!ITable.getTable(node),
    IPortCandidateProvider.NO_CANDIDATES
  )
  // customize marquee selection handling for pool nodes
  graph.decorator.nodes.marqueeTestable.addFactory(
    (node) => !!ITable.getTable(node),
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
  graphInputMode.toolTipInputMode.addEventListener('query-tool-tip', (evt) => {
    if (!evt.handled) {
      const stripe = tableInputMode.findStripe(
        evt.queryLocation,
        StripeTypes.ALL,
        StripeSubregionTypes.HEADER
      )
      if (stripe) {
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
  graphInputMode.addEventListener('deleted-item', ({ item }) => {
    console.log('GEIM: deleted item', item)
  })
  tableInputMode.addEventListener('deleted-item', ({ item }) => {
    console.log('TEIM: deleted item', item)
  })
  tableInputMode.addEventListener('deleted-selection', (args) => {
    console.log('TEIM: deleted selection')
  })
  graphInputMode.editLabelInputMode.addEventListener('label-edited', ({ item }) => {
    console.log('GEIM.ELIM: label-edited', item)
  })
  return tableInputMode
}
/**
 * Initializes the context menu.
 * @param tableEditorInputMode The table editor input mode that is used to populate the context menu
 */
function configureContextMenu(tableEditorInputMode) {
  const graphInputMode = graphComponent.inputMode
  // add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  graphInputMode.addEventListener('populate-item-context-menu', (evt) =>
    populateContextMenu(evt, tableEditorInputMode)
  )
}
/**
 * Event handler for the context menu.
 * @param args The event arguments
 * @param tableEditorInputMode The table editor input mode which is necessary to add new stripes
 */
function populateContextMenu(args, tableEditorInputMode) {
  if (args.handled) {
    return
  }
  const graphInputMode = graphComponent.inputMode
  const stripe = tableEditorInputMode.findStripe(
    args.queryLocation,
    StripeTypes.ALL,
    StripeSubregionTypes.HEADER
  )
  if (stripe) {
    args.contextMenu = [
      {
        label: `Delete ${stripe.stripe}`,
        action: () => {
          tableEditorInputMode.deleteStripe(stripe.stripe)
        }
      },
      {
        label: `Insert new stripe before ${stripe.stripe}`,
        action: () => {
          const parent = stripe.stripe.parentStripe
          const index = stripe.stripe.index
          tableEditorInputMode.insertChild(parent, index)
        }
      },
      {
        label: `Insert new stripe after ${stripe.stripe}`,
        action: () => {
          const parent = stripe.stripe.parentStripe
          const index = stripe.stripe.index
          tableEditorInputMode.insertChild(parent, index + 1)
        }
      }
    ]
  } else {
    const tableNode = graphInputMode.findItems(
      args.queryLocation,
      [GraphItemTypes.NODE],
      (item) => !!ITable.getTable(item)
    )
    if (tableNode && tableNode.size > 0) {
      args.contextMenu = [
        {
          label: `ContextMenu for ${tableNode.at(0)}`,
          action: () => {}
        }
      ]
    }
  }
}
/**
 * Perform a hierarchical layout that also configures the tables.
 * Table support is automatically enabled in {@link LayoutExecutor}. The layout will:
 * - Arrange all leaf nodes in a hierarchical layout inside their respective table cells
 * - Resize all table cells to encompass their child nodes. Optionally,
 *   {@link TableLayoutConfigurator.compaction} allows to shrink table cells, otherwise, table cells
 *   can only grow.
 */
async function applyLayout() {
  const layout = new HierarchicalLayout({
    layoutOrientation: 'left-to-right',
    groupLayeringPolicy: 'ignore-groups'
  })
  layout.componentLayout.enabled = false
  // we use Layout executor convenience method that already sets up the whole layout pipeline correctly
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout,
    // Table layout is enabled by default already...
    configureTableLayout: true,
    animationDuration: '0.5s',
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
function initializeUI(graphMLIOHandler) {
  document.querySelector('#layout-button').addEventListener('click', applyLayout)
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openGraphML(graphComponent, graphMLIOHandler)
  })
  document.querySelector('#save-button').addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'tableEditor.graphml', graphMLIOHandler)
  })
}
run().then(finishLoading)
