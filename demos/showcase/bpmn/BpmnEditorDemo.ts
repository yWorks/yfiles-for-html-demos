/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CompositeLabelModel,
  type CompositeLabelModelParameter,
  EditLabelHelper,
  EventRecognizers,
  ExteriorNodeLabelModel,
  FolderNodeConverter,
  FoldingEdgeConverter,
  FoldingManager,
  FoldingSynchronizationOptions,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  Graph,
  GraphClipboard,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphOverviewComponent,
  GraphSnapContext,
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  IEditLabelHelper,
  type IInputModeContext,
  type ILabelModelParameter,
  type ILabelOwner,
  type IModelItem,
  INode,
  Insets,
  InteriorNodeLabelModel,
  IPort,
  IPortCandidateProvider,
  IRow,
  IStripeStyle,
  ITable,
  LayoutExecutor,
  License,
  NodeAlignmentPolicy,
  NodeDropInputMode,
  ParentNodeDetectionModes,
  Point,
  type PopulateItemContextMenuEventArgs,
  PortCandidate,
  PortCandidateValidity,
  Rect,
  ReparentNodeHandler,
  ReparentStripeHandler,
  Size,
  SmartEdgeLabelModel,
  SnappableItems,
  StripeSubregionTypes,
  StripeTypes,
  Table,
  TableEditorInputMode
} from '@yfiles/yfiles'

import { BpmnLayoutData } from './BpmnLayoutData'
import { BpmnLayout } from './BpmnLayout'
import { BpmnPopupSupport } from './BpmnPopupSupport'
import BpmnView, {
  ActivityNodeStyle,
  AnnotationLabelStyle,
  AnnotationNodeStyle,
  BpmnEdgeStyle,
  BpmnEdgeType,
  type BpmnNodeStyle,
  BpmnPortCandidateProvider,
  BpmnReshapeHandleProvider,
  ChoreographyLabelModel,
  ChoreographyNodeStyle,
  ConversationNodeStyle,
  ConversationType,
  DataObjectNodeStyle,
  DataStoreNodeStyle,
  EventNodeStyle,
  EventPortStyle,
  GatewayNodeStyle,
  GroupNodeStyle as BpmnGroupNodeStyle,
  LegacyBpmnExtensions,
  MessageLabelStyle,
  Participant,
  PoolHeaderLabelModel,
  PoolNodeStyle,
  registerBpmnTypeInformation,
  YFILES_BPMN_NS,
  YFILES_BPMN_PREFIX
} from './bpmn-view'
import { DragAndDropPanel } from '@yfiles/demo-utils/DragAndDropPanel'
import { BpmnDiParser } from './bpmn-di'
import licenseData from '../../../lib/license.json'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-app/demo-page'
import { saveGraphML } from '@yfiles/demo-utils/graphml-support'
import { openFile } from '@yfiles/demo-utils/file-support'

let graphComponent: GraphComponent

/**
 * The input mode that handles interactive table editing like adding rows and columns.
 */
let tableEditorInputMode: TableEditorInputMode

/**
 * A flag that indicates whether or not a layout is currently running to prevent re-entrant layout
 * calculations.
 */
let layoutIsRunning = false

/**
 * A helper class that facilitates using popups that show the properties of the BPMN nodes.
 */
let popupSupport: BpmnPopupSupport

/**
 * The combo box to choose the sample graphs from.
 */
const graphChooserBox = document.querySelector<HTMLSelectElement>('#sample-combobox')!
addNavigationButtons(graphChooserBox)

/**
 * Starts the BPMN editor.
 */
async function run(): Promise<void> {
  License.value = licenseData
  // initialize UI elements
  graphComponent = new GraphComponent('graphComponent')
  new GraphOverviewComponent('overviewComponent', graphComponent)

  // load the folding and style modules and initialize the GraphComponent
  initializeGraphComponent()
  // initialize the input mode
  initializeInputMode()

  // load the graphml module with folding support and initialize
  // the graph chooser box and the style property popups
  const stylePanel = new DragAndDropPanel(document.querySelector('.demo-dnd-panel')!)
  stylePanel.copyNodeLabels = false
  stylePanel.maxItemWidth = 140
  stylePanel.populatePanel(createStylePanelNodes())

  // initialize (de-)serialization for load/save commands
  const graphMLIOHandler = new GraphMLIOHandler()

  // register the current BPMN styles with the GraphMLIOHandler
  graphMLIOHandler.addXamlNamespaceMapping(YFILES_BPMN_NS, BpmnView)
  graphMLIOHandler.addNamespace(YFILES_BPMN_NS, YFILES_BPMN_PREFIX)
  registerBpmnTypeInformation(graphMLIOHandler)

  // load initial graph
  await createGraphMLIOHandler().readFromURL(graphComponent.graph, 'resources/business.graphml')
  await graphComponent.fitGraphBounds()
  graphComponent.graph.undoEngine!.clear()

  // initialize UI elements and interaction for the popups
  popupSupport = new BpmnPopupSupport(graphComponent)

  // bind input elements to their functionality
  initializeUI(graphMLIOHandler)
}

function initializeGraphComponent(): void {
  // we want to enable folding for loading and showing nested graphs
  enableFolding()

  // prevent re-parenting of tables into tables by copy & paste
  const graphClipboard = new GraphClipboard()
  graphClipboard.parentNodeDetection = ParentNodeDetectionModes.PREVIOUS_PARENT
  graphComponent.clipboard = graphClipboard

  const decorator = graphComponent.graph.decorator
  decorator.nodes.editLabelHelper.addFactory((node) => {
    const style = node.style as BpmnNodeStyle
    if (style.lookup && style.lookup(node, IEditLabelHelper)) {
      return style.lookup(node, IEditLabelHelper) as IEditLabelHelper
    }
    return new AdditionalEditLabelHelper()
  })
}

function initializeInputMode(): void {
  const graphSnapContext = new GraphSnapContext({
    snappableItems: SnappableItems.NODE | SnappableItems.EDGE | SnappableItems.LABEL,
    edgeDistance: 10,
    nodeToEdgeDistance: 15,
    nodeDistance: 20
  })

  const graphEditorInputMode = new GraphEditorInputMode({
    allowEditLabelOnDoubleClick: false,
    allowCreateNode: false,
    clickHitTestOrder: [
      GraphItemTypes.BEND,
      GraphItemTypes.EDGE_LABEL,
      GraphItemTypes.EDGE,
      GraphItemTypes.PORT,
      GraphItemTypes.NODE,
      GraphItemTypes.NODE_LABEL
    ],
    doubleClickHitTestOrder: [
      GraphItemTypes.BEND,
      GraphItemTypes.EDGE_LABEL,
      GraphItemTypes.EDGE,
      GraphItemTypes.PORT,
      GraphItemTypes.NODE,
      GraphItemTypes.NODE_LABEL
    ],
    snapContext: graphSnapContext
  })

  graphEditorInputMode.createEdgeInputMode.useHitItemsCandidatesOnly = true

  const nodeDropInputMode = new NoNestedTablesDropInputMode()
  nodeDropInputMode.showPreview = true
  nodeDropInputMode.enabled = true
  nodeDropInputMode.isGroupNodePredicate = (draggedNode: INode): boolean =>
    !!ITable.getTable(draggedNode) || draggedNode.tag === 'GroupNode'
  graphEditorInputMode.nodeDropInputMode = nodeDropInputMode

  const noTableReparentNodeHandler = new NoTableReparentNodeHandler()
  noTableReparentNodeHandler.reparentRecognizer = EventRecognizers.ALWAYS
  graphEditorInputMode.reparentNodeHandler = noTableReparentNodeHandler
  graphEditorInputMode.navigationInputMode.allowCollapseGroup = true
  graphEditorInputMode.navigationInputMode.allowExpandGroup = true

  // disable marquee selection so the MoveViewportInputMode can work without modifiers
  graphEditorInputMode.marqueeSelectionInputMode.enabled = false

  // show the popup for the double-clicked item that has been mapped to the item's style earlier
  graphEditorInputMode.addEventListener('item-double-clicked', (evt) => {
    popupSupport.showPropertyPopup(evt.item)
    evt.handled = true
  })

  // hide the popups on double clicks on the GraphComponent's background.
  graphEditorInputMode.clickInputMode.addEventListener('clicked', (evt) => {
    if (evt.clickCount == 2) {
      popupSupport.hidePropertyPopup()
    }
  })

  // Create a new TableEditorInputMode instance which also allows drag and drop
  const reparentStripeHandler = new ReparentStripeHandler()
  reparentStripeHandler.maxColumnLevel = 2
  reparentStripeHandler.maxRowLevel = 2
  const tableInputMode = new TableEditorInputMode({
    reparentStripeHandler,
    priority: graphEditorInputMode.handleInputMode.priority + 1
  })
  tableInputMode.stripeDropInputMode.enabled = true
  tableEditorInputMode = tableInputMode

  // Add to GraphEditorInputMode - we set the priority higher than for the handle input mode so that handles are
  // preferred if both gestures are possible
  graphEditorInputMode.add(tableEditorInputMode)

  // Fix the lowermost center of a group node when toggling collapse/expand
  graphEditorInputMode.navigationInputMode.autoGroupNodeAlignmentPolicy =
    NodeAlignmentPolicy.BOTTOM_CENTER

  // assign input mode to graph component
  graphComponent.inputMode = graphEditorInputMode

  // use two finger panning to allow easier editing with touch gesture
  configureTwoPointerPanning(graphComponent)

  // Configure the context menus
  initializeContextMenu()
}

/**
 * Enables folding - changes the GraphComponent's graph to a managed view
 * that provides the actual collapse/expand state.
 */
function enableFolding(): void {
  // create the manager
  const manager = new FoldingManager()
  const foldedGraph = manager.createFoldingView()
  // replace the displayed graph with a managed view
  graphComponent.graph = foldedGraph.graph

  // ports should not be removed when an attached edge is deleted
  manager.masterGraph.nodeDefaults.ports.autoCleanUp = false

  // avoid creating duplicate ports when collapsing/expanding group nodes
  manager.foldingEdgeConverter = new FoldingEdgeConverter({
    reuseMasterPorts: true,
    reuseFolderNodePorts: true
  })

  // keep port styles synced
  manager.folderNodeConverter = new FolderNodeConverter({
    folderNodeDefaults: {
      ports: {
        updateFoldingOptions:
          FoldingSynchronizationOptions.TAG | FoldingSynchronizationOptions.STYLE,
        updateMasterOptions: FoldingSynchronizationOptions.TAG | FoldingSynchronizationOptions.STYLE
      }
    }
  })

  // set default styles and label model parameter
  foldedGraph.graph.groupNodeDefaults.style = new BpmnGroupNodeStyle()
  const bpmnEdgeStyle = new BpmnEdgeStyle()
  bpmnEdgeStyle.type = BpmnEdgeType.SEQUENCE_FLOW
  graphComponent.graph.edgeDefaults.style = bpmnEdgeStyle
  graphComponent.graph.edgeDefaults.shareStyleInstance = false
  graphComponent.graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
    angle: 0,
    autoRotation: false
  }).createParameterFromSource(0)

  // for nodes, we use a CompositeLabelModel that combines label placements inside and outside of the node
  const compositeLabelModel = new CompositeLabelModel()
  compositeLabelModel.addModel(new ExteriorNodeLabelModel({ margins: 10 }))
  graphComponent.graph.nodeDefaults.labels.layoutParameter = compositeLabelModel.addModel(
    InteriorNodeLabelModel.CENTER
  ) as CompositeLabelModelParameter

  manager.masterGraph.decorator.nodes.portCandidateProvider.addFactory((node) => {
    if (ITable.getTable(node)) {
      // Pool only have a dynamic PortCandidate
      return IPortCandidateProvider.fromCandidates([
        new PortCandidate({
          owner: node,
          locationParameter: FreeNodePortLocationModel.CENTER,
          validity: PortCandidateValidity.DYNAMIC
        })
      ])
    }

    // use a specialized port candidate provider
    return new BpmnPortCandidateProvider(node)
  })

  // use handles that preserve the aspect ratio of the node while reshaping for nodes with
  // GatewayNodeStyle, EventNodeStyle and ConversationNodeStyle
  graphComponent.graph.decorator.nodes.reshapeHandleProvider.addWrapperFactory(
    (node, delegateProvider) => new BpmnReshapeHandleProvider(delegateProvider, node)
  )

  // allow reconnecting of edges
  manager.masterGraph.decorator.edges.reconnectionPortCandidateProvider.addFactory(
    IEdgeReconnectionPortCandidateProvider.fromAllNodeAndEdgeCandidates
  )

  // enable undo operations
  manager.masterGraph.undoEngineEnabled = true
  // Use the undo support from the graph also for all future table instances
  Table.installStaticUndoSupport(manager.masterGraph)
}

/**
 * Create a GraphMLIOHandler that supports reading the BPMN demo styles.
 */
function createGraphMLIOHandler() {
  const graphmlHandler = new GraphMLIOHandler()
  // register default namespace mappings for the BPMN module

  // support older BPMN style versions (mainly for demo usage)
  graphmlHandler.addXamlNamespaceMapping('http://www.yworks.com/xml/yfiles-bpmn/1.0', BpmnView)
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
    LegacyBpmnExtensions
  )
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
    BpmnView
  )
  graphmlHandler.addXamlNamespaceMapping(YFILES_BPMN_NS, BpmnView)
  graphmlHandler.addNamespace(YFILES_BPMN_NS, YFILES_BPMN_PREFIX)
  registerBpmnTypeInformation(graphmlHandler)
  return graphmlHandler
}

/**
 * Helper method that reads the currently selected GraphML from the combo box.
 */
async function onGraphChooserBoxSelectionChanged(): Promise<void> {
  // hide any property popup that might be visible
  popupSupport.hidePropertyPopup()
  setUIDisabled(true)

  // now derive the file name
  const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex]
  const graphName = selectedItem.value
  const isBpmnDi = selectedItem.getAttribute('data-type') === 'bpmn-di'
  if (isBpmnDi) {
    const content = await loadBpmnDiSample(graphName)
    if (content != null) {
      const bpmnDiParser = new BpmnDiParser()
      await bpmnDiParser.load(graphComponent.graph, content)
    }
  } else {
    const fileName = `resources/${graphName}.graphml`
    const graphmlHandler = createGraphMLIOHandler()

    // and then load the graph and when done - fit the bounds
    await graphmlHandler.readFromURL(graphComponent.graph, fileName)
  }

  graphComponent.fitGraphBounds()
  graphComponent.graph.undoEngine!.clear()
  setUIDisabled(false)
}

async function loadBpmnDiSample(graphName: string): Promise<string | null> {
  try {
    const response = await fetch(`resources/${graphName}.bpmn`)
    if (response.ok) {
      return response.text()
    }
    console.log('Could not load bpmn file')
  } catch (e) {
    console.log('Could not load bpmn file', e)
  }
  return Promise.resolve(null)
}

/**
 * Helper method that tries to layout the current graph using the BpmnLayout.
 */
async function onLayoutButtonClicked(): Promise<void> {
  if (layoutIsRunning) {
    // if there is already a layout running, do not start another one
    return
  }

  layoutIsRunning = true
  setUIDisabled(true)
  const bpmnLayout = new BpmnLayout()
  bpmnLayout.scope = 'ALL_ELEMENTS'
  bpmnLayout.layoutOrientation = 'LEFT_TO_RIGHT'

  const bpmnLayoutData = new BpmnLayoutData()
  bpmnLayoutData.compactMessageFlowLayering = false
  bpmnLayoutData.startNodesFirst = true

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: bpmnLayout,
    layoutData: bpmnLayoutData.create(
      graphComponent.graph,
      graphComponent.selection,
      bpmnLayout.scope
    ),
    animationDuration: '0.5s',
    animateViewport: true
  })
  layoutExecutor.tableLayoutConfigurator.horizontalLayout = true
  layoutExecutor.tableLayoutConfigurator.fromSketch = true
  try {
    await layoutExecutor.start()
  } finally {
    layoutIsRunning = false
    setUIDisabled(false)
  }
}

/**
 * Binds the toolbar elements to listeners to be able to react to interactive changes.
 */
function initializeUI(graphMLIOHandler: GraphMLIOHandler): void {
  document.getElementById('new-button')!.addEventListener('click', () => {
    popupSupport.hidePropertyPopup()
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })

  graphChooserBox.addEventListener('change', onGraphChooserBoxSelectionChanged)

  document.getElementById('layout-button')!.addEventListener('click', onLayoutButtonClicked)

  // initialize commands for the item popups that are used to change the item's style properties
  popupSupport.registerPopupCommands()

  document
    .querySelector<HTMLInputElement>('#open-file-button')!
    .addEventListener('click', async () => {
      try {
        const { content, filename } = await openFile('.bpmn,.graphml')
        await readFile(content, filename)
      } catch (err) {
        if (err !== 'canceled') {
          alert(err)
        }
      }
    })

  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'BpmnEditor.graphml', graphMLIOHandler)
  })
}

/**
 * reads BPMN or GraphML file content depending on type
 */
async function readFile(content: string, filename: string): Promise<void> {
  // check if the selected file is a BPMN or GraphML file
  const isBPMN = filename.toLowerCase().endsWith('.bpmn')
  const isGraphML = filename.toLowerCase().endsWith('.graphml')
  if (isBPMN || isGraphML) {
    if (isBPMN) {
      const bpmnDiParser = new BpmnDiParser()
      await bpmnDiParser.load(graphComponent.graph, content)
    } else {
      const graphmlHandler = createGraphMLIOHandler()
      await graphmlHandler.readFromGraphMLText(graphComponent.graph, content)
    }
    graphComponent.graph.undoEngine!.clear()
    setUIDisabled(false)
    void graphComponent.fitGraphBounds()
  } else {
    window.alert('Please select either a BPMN or a GraphML file!')
  }
}

/**
 * Registers the callback on the {@link GraphEditorInputMode}.
 */
function initializeContextMenu(): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  // Show context menus for ports, nodes and edges
  inputMode.contextMenuItems = GraphItemTypes.PORT | GraphItemTypes.NODE | GraphItemTypes.EDGE

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  inputMode.addEventListener('populate-item-context-menu', (evt) => {
    onPopulateItemContextMenu(evt)
  })
}

/**
 * Updates the elements of the UI's state and the input mode and checks whether the buttons should
 * be enabled or not.
 */
function setUIDisabled(disabled: boolean): void {
  graphChooserBox.disabled = disabled
  document.querySelector<HTMLButtonElement>('#layout-button')!.disabled = disabled
  document.querySelector<HTMLButtonElement>('#new-button')!.disabled = disabled
  ;(graphComponent.inputMode as GraphEditorInputMode).waitInputMode.waiting = disabled
}

/**
 * Adds options to the context menu according to the item for which it is displayed.
 * This is called when the context menu is about to show.
 * @param event The event data.
 */
function onPopulateItemContextMenu(event: PopulateItemContextMenuEventArgs<IModelItem>): void {
  if (event.handled) {
    return
  }

  if (event.item instanceof INode) {
    const node = event.item

    const menuItems: ({ label: string; action: () => void } | 'separator')[] = []

    // Add an annotation label to the node and start editing its text
    menuItems.push({
      label: 'Add Annotation Label',
      action: () => {
        const origin = Point.ORIGIN
        const modelParameter = FreeNodeLabelModel.INSTANCE.createParameter(
          origin,
          new Point(node.layout.width * 0.75, -50),
          origin,
          origin,
          0
        )
        const label = graphComponent.graph.addLabel(
          node,
          '',
          modelParameter,
          new AnnotationLabelStyle()
        )
        ;(graphComponent.inputMode as GraphEditorInputMode).editLabelInputMode.startLabelEditing(
          label
        )
      }
    })

    // If it is a Choreography node...
    if (node.style instanceof ChoreographyNodeStyle) {
      const choreographyNodeStyle = node.style
      menuItems.push('separator')
      // ... check if a participant was right-clicked
      const participant = choreographyNodeStyle.getParticipant(node, event.queryLocation)
      if (participant) {
        // and if so, offer to remove it
        menuItems.push({
          label: 'Remove Participant',
          action: () => {
            if (!choreographyNodeStyle.topParticipants.remove(participant)) {
              choreographyNodeStyle.bottomParticipants.remove(participant)
            }
            graphComponent.invalidate()
            graphComponent.focus()
          }
        })
        // or toggle its Multi-Instance flag
        menuItems.push({
          label: 'Toggle Participant Multi-Instance',
          action: () => {
            participant.multiInstance = !participant.multiInstance
            graphComponent.invalidate()
            graphComponent.focus()
          }
        })
      } else {
        // if no participant was clicked, a new one can be added to the top or bottom participants
        menuItems.push({
          label: 'Add Participant at Top',
          action: () => {
            choreographyNodeStyle.topParticipants.add(new Participant())
            graphComponent.invalidate()
            graphComponent.focus()
          }
        })
        menuItems.push({
          label: 'Add Participant at Bottom',
          action: () => {
            choreographyNodeStyle.bottomParticipants.add(new Participant())
            graphComponent.invalidate()
            graphComponent.focus()
          }
        })
      }
    }

    // If it is an Activity node...
    if (node.style instanceof ActivityNodeStyle) {
      menuItems.push('separator')
      // allow to add a Boundary Event as port that uses an EventPortStyle
      menuItems.push({
        label: 'Add Boundary Event',
        action: () => {
          graphComponent.graph.addPort(node, FreeNodePortLocationModel.BOTTOM, new EventPortStyle())
          graphComponent.focus()
        }
      })
    }

    // If a row of a pool node has been hit...
    const stripeDescriptor = tableEditorInputMode.findStripe(
      event.queryLocation,
      StripeTypes.ALL,
      StripeSubregionTypes.HEADER
    )
    if (stripeDescriptor && stripeDescriptor.stripe instanceof IRow) {
      // ... allow to increase or decrease the row header size
      const stripe = stripeDescriptor.stripe
      const table = stripe.table!
      const insets = stripe.totalPadding
      const defaultInsets = table.rowDefaults.padding

      if (insets.left > defaultInsets.left) {
        menuItems.push({
          label: 'Reduce header size',
          action: () => {
            // by reducing the header size of one of the rows, the size of the table insets might change
            const insetsBefore = table.accumulatedPadding
            table.setStripePadding(
              stripe,
              new Insets(insets.top, insets.right, insets.bottom, insets.left - defaultInsets.left)
            )
            const insetsAfter = table.accumulatedPadding
            // if the table insets have changed, the bounds of the pool node have to be adjusted as well
            const diff = insetsBefore.left - insetsAfter.left
            graphComponent.graph.setNodeLayout(
              node,
              new Rect(
                node.layout.x + diff,
                node.layout.y,
                node.layout.width - diff,
                node.layout.height
              )
            )
          }
        })
      }
      menuItems.push({
        label: 'Increase header size',
        action: () => {
          const insetsBefore = table.accumulatedPadding
          table.setStripePadding(
            stripe,
            new Insets(insets.top, insets.right, insets.bottom, insets.left + defaultInsets.left)
          )
          const insetsAfter = table.accumulatedPadding
          const diff = insetsBefore.left - insetsAfter.left
          graphComponent.graph.setNodeLayout(
            node,
            new Rect(
              node.layout.x + diff,
              node.layout.y,
              node.layout.width - diff,
              node.layout.height
            )
          )
        }
      })
    }

    // we add an entry to open the style property popup
    menuItems.push('separator')
    menuItems.push({
      label: 'Edit Node Style Properties',
      action: () => {
        popupSupport.showPropertyPopup(node)
      }
    })

    event.contextMenu = menuItems
  } else if (event.item instanceof IEdge) {
    // For edges a label with a Message Icon may be added
    const modelParameter = new SmartEdgeLabelModel().createParameterFromSource(0)
    event.contextMenu = [
      {
        label: 'Add Message Icon Label',
        action: () => {
          if (event.item instanceof IEdge) {
            graphComponent.graph.addLabel(
              event.item,
              '',
              modelParameter,
              new MessageLabelStyle(),
              new Size(20, 14)
            )
            graphComponent.focus()
          }
        }
      },
      'separator',

      // we add an entry to open the style property popup
      {
        label: 'Edit Edge Style Properties',
        action: () => {
          popupSupport.showPropertyPopup(event.item!)
        }
      }
    ]
  } else if (event.item instanceof IPort) {
    const port = event.item
    if (popupSupport.hasPropertyPopup(port.style.constructor)) {
      event.contextMenu = [
        {
          label: 'Edit Port Style Properties',
          action: () => {
            popupSupport.showPropertyPopup(port)
          }
        }
      ]
    }
  }
}

/**
 * Custom {@link NodeDropInputMode} that disallows to create a table node inside of a group node
 * (especially inside another table node).
 */
class NoNestedTablesDropInputMode extends NodeDropInputMode {
  getDropTarget(dragLocation: Point): IModelItem | null {
    // If this node has a table associated, disallow dragging it into a group node.
    return ITable.getTable(this.draggedItem!) ? null : super.getDropTarget(dragLocation)!
  }
}

/**
 * Custom {@link ReparentNodeHandler} that disallows reparenting a table node.
 */
class NoTableReparentNodeHandler extends ReparentNodeHandler {
  isValidParent(context: IInputModeContext, node: INode, newParent: INode): boolean {
    // table nodes shall not become child nodes
    return !ITable.getTable(node) && super.isValidParent(context, node, newParent)
  }
}

/**
 * Creates and configures nodes that will be displayed in the style panel to be dragged to the
 * graph component.
 */
function createStylePanelNodes(): INode[] {
  // Create a new Graph in which the palette nodes live
  const nodeContainer = new Graph()

  // Create the sample node for the pool
  const poolNodeStyle = new PoolNodeStyle(false)
  const poolNode = nodeContainer.createNodeAt(Point.ORIGIN, poolNodeStyle)
  const poolTable = poolNodeStyle.tableNodeStyle.table
  poolTable.columnDefaults.padding = Insets.EMPTY
  poolTable.createGrid(1, 1)
  // Use twice the default width for this sample column (looks nicer in the preview...)
  const column = poolTable.rootColumn.childColumns.first()!
  poolTable.setSize(column, column.actualSize * 2)
  nodeContainer.setNodeLayout(poolNode, poolTable.layout.toRect())
  nodeContainer.addLabel(poolNode, 'Pool', PoolHeaderLabelModel.WEST)

  const rowPoolNodeStyle = new PoolNodeStyle(false)
  const rowNode = nodeContainer.createNodeAt(Point.ORIGIN, rowPoolNodeStyle)
  const rowTable = ITable.getTable(rowNode)!
  const rowSampleRow = rowTable.createRow(100)
  const rowSampleColumn = rowTable.createColumn({
    width: 200,
    style: IStripeStyle.VOID_STRIPE_STYLE
  })
  rowTable.setStripePadding(rowSampleColumn, Insets.EMPTY)
  rowTable.padding = Insets.EMPTY
  rowTable.addLabel(rowSampleRow, 'Row')
  nodeContainer.setNodeLayout(rowNode, rowTable.layout.toRect())
  // Set the first row as tag so the NodeDragComponent knows that a row and not a complete pool node shall be
  // dragged
  rowNode.tag = rowTable.rootRow.childRows.at(0)

  // Add BPMN sample nodes
  nodeContainer.createNode(
    new Rect(Point.ORIGIN, new Size(80, 50)),
    new ActivityNodeStyle(),
    'GroupNode'
  )
  nodeContainer.createNode(new Rect(Point.ORIGIN, new Size(50, 50)), new GatewayNodeStyle())
  nodeContainer.createNode(new Rect(Point.ORIGIN, new Size(50, 50)), new EventNodeStyle())
  nodeContainer.createNode(new Rect(Point.ORIGIN, new Size(80, 20)), new AnnotationNodeStyle())
  nodeContainer.createNode(new Rect(Point.ORIGIN, new Size(40, 60)), new DataObjectNodeStyle())
  nodeContainer.createNode(new Rect(Point.ORIGIN, new Size(50, 50)), new DataStoreNodeStyle())
  nodeContainer.createNode(
    new Rect(Point.ORIGIN, new Size(80, 60)),
    new BpmnGroupNodeStyle(),
    'GroupNode'
  )

  // Add a Choreography node with 2 participants
  const choreographyNodeStyle = new ChoreographyNodeStyle()
  choreographyNodeStyle.topParticipants.add(new Participant())
  choreographyNodeStyle.bottomParticipants.add(new Participant())
  const choreographyNode = nodeContainer.createNode(
    new Rect(0, 0, 80, 90),
    choreographyNodeStyle,
    'GroupNode'
  )
  nodeContainer.addLabel(
    choreographyNode,
    'Participant 1',
    new ChoreographyLabelModel().createParticipantParameter(true, 0)
  )
  nodeContainer.addLabel(
    choreographyNode,
    'Participant 2',
    new ChoreographyLabelModel().createParticipantParameter(false, 0)
  )

  const conversationNodeStyle = new ConversationNodeStyle()
  conversationNodeStyle.type = ConversationType.CONVERSATION
  nodeContainer.createNode(new Rect(0, 0, 50, 43.30127018922193), conversationNodeStyle)

  return nodeContainer.nodes.toArray()
}

const parameters = [
  InteriorNodeLabelModel.CENTER,
  ExteriorNodeLabelModel.RIGHT,
  ExteriorNodeLabelModel.TOP,
  ExteriorNodeLabelModel.LEFT,
  ExteriorNodeLabelModel.BOTTOM,
  ExteriorNodeLabelModel.TOP_RIGHT,
  ExteriorNodeLabelModel.TOP_LEFT,
  ExteriorNodeLabelModel.BOTTOM_RIGHT,
  ExteriorNodeLabelModel.BOTTOM_LEFT
]

/**
 * This class customizes the label editing for nodes that consist of more than one labels. The
 * first label is placed in the center of the node, while the others according to the parameters
 * defined by the ExteriorNodeLabelModel.
 */
class AdditionalEditLabelHelper extends EditLabelHelper {
  getLabelParameter(context: IInputModeContext, owner: ILabelOwner): ILabelModelParameter {
    if ((owner as INode).style instanceof BpmnGroupNodeStyle) {
      return InteriorNodeLabelModel.TOP
    }

    const validParameters = parameters.filter((parameter) =>
      owner.labels.every((label) => {
        const bounds = label.layoutParameter.model.getGeometry(label, label.layoutParameter)
        return !parameter.model.getGeometry(label, parameter).bounds.intersects(bounds)
      })
    )
    return validParameters[0] || InteriorNodeLabelModel.CENTER
  }
}

run().then(finishLoading)
