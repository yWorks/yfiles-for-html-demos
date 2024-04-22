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
  DefaultFolderNodeConverter,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  IGraph,
  INode,
  License,
  NodeAlignmentPolicy,
  Point,
  Rect,
  Size,
  StorageLocation
} from 'yfiles'
import { ZIndexChangedEventArgs, ZOrderSupport } from './ZOrderSupport'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { bindYFilesCommand, finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent = null!

let zOrderSupport: ZOrderSupport = null!

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the graph
  initializeGraph()

  // initialize consistent z-order support
  zOrderSupport = new ZOrderSupport(graphComponent)

  enableGroupingOperations()

  // use a custom GraphMLIOHandler that supports writing and parsing node z-orders to/from GraphML
  const ioHandler = new GraphMLIOHandler()
  zOrderSupport.configureGraphMLIOHandler(ioHandler)

  // eslint-disable-next-line no-new
  new GraphMLSupport({
    graphComponent: graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM,
    graphMLIOHandler: ioHandler
  })

  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  inputMode.focusableItems = GraphItemTypes.NONE
  // prevent interactive label changes since they display the z-index in this demo
  inputMode.selectableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  inputMode.allowEditLabel = false
  inputMode.allowAddLabel = false
  inputMode.allowEditLabelOnDoubleClick = false

  inputMode.addNodeCreatedListener((_, evt) => {
    const node = evt.item
    updateLabel(node, zOrderSupport.getZOrder(node))
  })

  // if graph structure is changed, update _all_ labels,
  // otherwise the copied labels erroneously show the z-order
  // of the source nodes. (this is for demo purposes only)
  inputMode.addElementsDuplicatedListener(updateLabels)
  inputMode.addElementsPastedListener(updateLabels)
  inputMode.navigationInputMode.addGroupExpandedListener(updateLabels)

  zOrderSupport.addZIndexChangedLister((_, evt) => {
    if (evt.item instanceof INode) {
      updateLabel(evt.item, evt.newZIndex)
    }
  })

  createGraph(graphComponent.graph)

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Initializes folding and sets default styles.
 */
function initializeGraph(): void {
  // Enable folding
  const view = new FoldingManager().createFoldingView()
  graphComponent.graph = view.graph

  // Get the master graph instance and enable undo-ability support.
  view.manager.masterGraph.undoEngineEnabled = true
  // add undo support for expand/collapse operations
  view.enqueueNavigationalUndoUnits = true

  // set default demo styles
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  graphComponent.graph.nodeDefaults.size = new Size(70, 40)

  const folderNodeConverter = graphComponent.graph.foldingView!.manager
    .folderNodeConverter as DefaultFolderNodeConverter
  folderNodeConverter.copyFirstLabel = true
}

function createGraph(graph: IGraph): void {
  const g1 = graph.createGroupNode(null, new Rect(350, 300, 250, 150))
  const n1 = graph.createNodeAt(new Point(400, 400))
  const n2 = graph.createNodeAt(new Point(460, 380))
  const n3 = graph.createNodeAt(new Point(520, 360))
  graph.setParent(n1, g1)
  graph.setParent(n2, g1)
  graph.setParent(n3, g1)

  const g2 = graph.createGroupNode(null, new Rect(500, 150, 250, 200))
  const n4 = graph.createNodeAt(new Point(560, 200))
  const n5 = graph.createNodeAt(new Point(590, 230))
  const n6 = graph.createNodeAt(new Point(620, 260))
  graph.setParent(n4, g2)
  graph.setParent(n5, g2)
  graph.setParent(n6, g2)

  const g3 = graph.createGroupNode(null, new Rect(650, 225, 350, 300))
  const n7 = graph.createNodeAt(new Point(700, 280))
  const n8 = graph.createNodeAt(new Point(760, 300))
  graph.setParent(n7, g3)
  graph.setParent(n8, g3)

  const g4 = graph.createGroupNode(g3, new Rect(775, 310, 170, 190))

  const n9 = graph.createNodeAt(new Point(830, 375))
  const n10 = graph.createNodeAt(new Point(880, 405))
  const n11 = graph.createNodeAt(new Point(840, 440))
  graph.setParent(n9, g4)
  graph.setParent(n10, g4)
  graph.setParent(n11, g4)

  // normalize all z orders starting from 0
  zOrderSupport.setTempNormalizedZOrders(null)
  zOrderSupport.applyTempZOrders()

  // clear undo queue to prevent the possibility of undoing the sample graph creation
  graph.foldingView?.manager!.masterGraph.undoEngine!.clear()

  graphComponent.fitGraphBounds()
}

/**
 * Updates the labels of all nodes. Called after duplicate or paste
 */
function updateLabels(): void {
  graphComponent.graph.nodes.forEach((node) => {
    updateLabel(node, zOrderSupport.getZOrder(node))
  })
}

/**
 * Updates the label text to show the current z-index of the node.
 * z-Order labels are for demo purposes only and not necessary for
 * the z-Order mechanism itself
 */
function updateLabel(node: INode, zIndex: number): void {
  const graph = graphComponent.graph.contains(node)
    ? graphComponent.graph
    : graphComponent.graph.foldingView!.manager.masterGraph

  if (node.labels.some((label) => label.tag && label.tag.showZIndex)) {
    graph.setLabelText(node.labels.find((label) => label.tag.showZIndex)!, `Level: ${zIndex}`)
  } else {
    graph.addLabel({
      owner: node,
      text: `Level: ${zIndex}`,
      tag: { showZIndex: true }
    })
  }
}

/**
 * Enables interactive grouping operations.
 */
function enableGroupingOperations(): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  if (inputMode) {
    inputMode.allowGroupingOperations = true
    inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_RIGHT
  }
}

/**
 * Binds actions to the buttons in the tutorial's toolbar.
 */
function initializeUI(): void {
  bindYFilesCommand(
    "button[data-command='Raise']",
    ZOrderSupport.RAISE,
    graphComponent,
    null,
    'Raise Selection'
  )
  bindYFilesCommand(
    "button[data-command='Lower']",
    ZOrderSupport.LOWER,
    graphComponent,
    null,
    'Lower Selection'
  )
  bindYFilesCommand(
    "button[data-command='ToFront']",
    ZOrderSupport.TO_FRONT,
    graphComponent,
    null,
    'Bring Selection to Front'
  )
  bindYFilesCommand(
    "button[data-command='ToBack']",
    ZOrderSupport.TO_BACK,
    graphComponent,
    null,
    'Bring Selection to Back'
  )
}

run().then(finishLoading)
