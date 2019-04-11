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
  CompositeLabelModel,
  DefaultGraph,
  DefaultPortCandidate,
  DragDropEffects,
  EditLabelHelper,
  EventRecognizers,
  ExteriorLabelModel,
  FoldingManager,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  GraphClipboard,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphOverviewComponent,
  GraphSnapContext,
  ICommand,
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  IEditLabelHelper,
  IInputModeContext,
  ILabelOwner,
  INode,
  IPort,
  IPortCandidateProvider,
  IRow,
  IStripe,
  ITable,
  Insets,
  InteriorLabelModel,
  LayoutExecutor,
  License,
  MinimumNodeSizeStage,
  NodeDropInputMode,
  OrthogonalEdgeEditingContext,
  OrthogonalEdgeEditingPolicy,
  ParentNodeDetectionModes,
  Point,
  PopulateItemContextMenuEventArgs,
  PortCandidateValidity,
  Rect,
  ReparentNodeHandler,
  ReparentStripeHandler,
  Size,
  SmartEdgeLabelModel,
  StorageLocation,
  StripeDropInputMode,
  StripeSubregionTypes,
  StripeTypes,
  Table,
  TableEditorInputMode,
  VoidStripeStyle
} from 'yfiles'

import ContextMenu from '../../utils/ContextMenu.js'
import BpmnLayoutData from './BpmnLayoutData.js'
import BpmnLayout from './BpmnLayout.js'
import PopupSupport from './BpmnPopupSupport.js'
import BpmnView, {
  ActivityNodeStyle,
  AnnotationLabelStyle,
  AnnotationNodeStyle,
  BpmnEdgeStyle,
  BpmnHandleSerializationListener,
  BpmnPortCandidateProvider,
  BpmnReshapeHandleProvider,
  ChoreographyLabelModel,
  ChoreographyNodeStyle,
  ConversationNodeStyle,
  ConversationType,
  DataObjectNodeStyle,
  DataStoreNodeStyle,
  EdgeType,
  EventNodeStyle,
  EventPortStyle,
  GatewayNodeStyle,
  GroupNodeStyle as BpmnGroupNodeStyle,
  MessageLabelStyle,
  Participant,
  PoolHeaderLabelModel,
  PoolNodeStyle
} from './bpmn-view.js'
import * as DemoApp from '../../resources/demo-app.js'
import { DragAndDropPanel } from '../../utils/DndPanel.js'
import loadJson from '../../resources/load-json.js'

let graphComponent = null

/**
 * The combo box to choose the sample graphs from.
 * @type {HTMLElement}
 */
let graphChooserBox = null

/**
 * The input mode that handles interactive table editing like adding rows and columns.
 * @type {TableEditorInputMode}
 */
let tableEditorInputMode = null

/**
 * A flag that indicates whether or not a layout is currently running to prevent re-entrant layout calculations.
 * @type {boolean}
 */
let layoutIsRunning = false

/**
 * The context menu that provides all options for the different BPMN styles.
 * @type {ContextMenu}
 */
let contextMenu = null

/**
 * A helper class that facilitates using popups that show the properties of the BPMN nodes.
 * @type {BpmnPopupSupport}
 */
let popupSupport = null

/**
 * Starts the BPMN editor.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize UI elements
  graphComponent = new GraphComponent('graphComponent')
  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)
  graphChooserBox = document.getElementById('SampleComboBox')

  // load the folding and style modules and initialize the GraphComponent
  initializeGraphComponent()
  // initialize the input mode
  initializeInputMode()

  // load the graphml module with folding support and initialize
  // the graph chooser box and the style property popups
  const stylePanel = new DragAndDropPanel(
    document.getElementById('stylePanel'),
    DemoApp.passiveSupported
  )
  stylePanel.copyNodeLabels = false
  // Set the callback that starts the actual drag and drop operation
  stylePanel.beginDragCallback = (element, data) => {
    const dragPreview = element.cloneNode(true)
    dragPreview.style.margin = '0'
    let dragSource = null
    if (IStripe.isInstance(data)) {
      dragSource = StripeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        DemoApp.pointerEventsSupported ? dragPreview : null
      )
    } else {
      dragSource = NodeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        DemoApp.pointerEventsSupported ? dragPreview : null
      )
    }
    dragSource.addQueryContinueDragListener((src, args) => {
      if (args.dropTarget === null) {
        DemoApp.removeClass(dragPreview, 'hidden')
      } else {
        DemoApp.addClass(dragPreview, 'hidden')
      }
    })
  }
  stylePanel.maxItemWidth = 140
  stylePanel.populatePanel(createStylePanelNodes)

  // initialize (de-)serialization for load/save commands
  const graphmlSupport = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  graphmlSupport.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-bpmn/1.0',
    BpmnView
  )
  graphmlSupport.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
    BpmnView
  )
  graphmlSupport.graphMLIOHandler.addNamespace(
    'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
    'bpmn'
  )
  graphmlSupport.graphMLIOHandler.addHandleSerializationListener(BpmnHandleSerializationListener)

  // load initial graph
  DemoApp.readGraph(
    graphmlSupport.graphMLIOHandler,
    graphComponent.graph,
    'resources/business.graphml'
  ).then(() => {
    graphComponent.fitGraphBounds()
    graphComponent.graph.undoEngine.clear()
  })

  // initialize UI elements and interaction for the popups
  popupSupport = new PopupSupport(graphComponent, contextMenu)

  // bind commands to UI input elements
  registerCommands()

  DemoApp.showApp(graphComponent, overviewComponent)
}

function initializeGraphComponent() {
  // we want to enable folding for loading and showing nested graphs
  enableFolding()

  // prevent re-parenting of tables into tables by copy & paste
  const graphClipboard = new GraphClipboard()
  graphClipboard.parentNodeDetection = ParentNodeDetectionModes.PREVIOUS_PARENT
  graphComponent.clipboard = graphClipboard

  const decorator = graphComponent.graph.decorator
  decorator.nodeDecorator.editLabelHelperDecorator.setFactory(
    owner =>
      (owner.style.lookup && owner.style.lookup(owner, IEditLabelHelper.$class)) ||
      new AdditionalEditLabelHelper()
  )
}

function initializeInputMode() {
  const graphSnapContext = new GraphSnapContext({
    snapSegmentsToSnapLines: true,
    edgeToEdgeDistance: 10,
    nodeToEdgeDistance: 15,
    nodeToNodeDistance: 20,
    snapPortAdjacentSegments: true,
    snapBendsToSnapLines: true,
    snapBendAdjacentSegments: true
  })

  const graphEditorInputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    orthogonalBendRemoval: OrthogonalEdgeEditingPolicy.ALWAYS,
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

  graphEditorInputMode.createEdgeInputMode.orthogonalEdgeCreation =
    OrthogonalEdgeEditingPolicy.ALWAYS
  graphEditorInputMode.createEdgeInputMode.useHitItemsCandidatesOnly = true

  const nodeDropInputMode = new NoNestedTablesDropInputMode()
  nodeDropInputMode.showPreview = true
  nodeDropInputMode.enabled = true
  nodeDropInputMode.isGroupNodePredicate = draggedNode =>
    !!draggedNode.lookup(ITable.$class) || draggedNode.tag === 'GroupNode'
  graphEditorInputMode.nodeDropInputMode = nodeDropInputMode

  const noTableReparentNodeHandler = new NoTableReparentNodeHandler()
  noTableReparentNodeHandler.reparentRecognizer = EventRecognizers.ALWAYS
  graphEditorInputMode.reparentNodeHandler = noTableReparentNodeHandler
  graphEditorInputMode.navigationInputMode.allowCollapseGroup = true
  graphEditorInputMode.navigationInputMode.allowExpandGroup = true

  // disable marquee selection so the MoveViewportInputMode can work without modifiers
  graphEditorInputMode.marqueeSelectionInputMode.enabled = false

  // show the popup for the double-clicked item that has been mapped to the item's style earlier
  graphEditorInputMode.addItemDoubleClickedListener((sender, e) => {
    popupSupport.showPropertyPopup(e.item)
    e.handled = true
  })

  // hide the popups on double clicks on the GraphComponent's background.
  graphEditorInputMode.clickInputMode.addDoubleClickedListener(() => {
    popupSupport.hidePropertyPopup()
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

  // assign input mode to graph component
  graphComponent.inputMode = graphEditorInputMode

  // Configure the context menus
  initializeContextMenu()
}

/**
 * Enables folding - changes the GraphComponent's graph to a managed view
 * that provides the actual collapse/expand state.
 */
function enableFolding() {
  // create the manager
  const manager = new FoldingManager()
  const foldedGraph = manager.createFoldingView()
  // replace the displayed graph with a managed view
  graphComponent.graph = foldedGraph.graph

  // ports should not be removed when an attached edge is deleted
  manager.masterGraph.nodeDefaults.ports.autoCleanUp = false

  // set default styles and label model parameter
  foldedGraph.graph.groupNodeDefaults.style = new BpmnGroupNodeStyle()
  const bpmnEdgeStyle = new BpmnEdgeStyle()
  bpmnEdgeStyle.type = EdgeType.SEQUENCE_FLOW
  graphComponent.graph.edgeDefaults.style = bpmnEdgeStyle
  graphComponent.graph.edgeDefaults.shareStyleInstance = false
  graphComponent.graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
    angle: 0,
    autoRotation: false
  }).createDefaultParameter()

  // for nodes we use a CompositeLabelModel that combines label placements inside and outside of the node
  const compositeLabelModel = new CompositeLabelModel()
  compositeLabelModel.labelModels.add(new InteriorLabelModel())
  compositeLabelModel.labelModels.add(new ExteriorLabelModel({ insets: 10 }))
  graphComponent.graph.nodeDefaults.labels.layoutParameter = compositeLabelModel.createDefaultParameter()

  manager.masterGraph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(node => {
    if (node.lookup(ITable.$class)) {
      // Pool only have a dynamic PortCandidate
      return IPortCandidateProvider.fromCandidates([
        new DefaultPortCandidate({
          owner: node,
          locationParameter: FreeNodePortLocationModel.NODE_CENTER_ANCHORED,
          validity: PortCandidateValidity.DYNAMIC
        })
      ])
    }

    // use a specialized port candidate provider
    return new BpmnPortCandidateProvider(node)
  })

  // use handles that preserve the aspect ratio of the node while reshaping for nodes with
  // GatewayNodeStyle, EventNodeStyle and ConversationNodeStyle
  graphComponent.graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setImplementationWrapper(
    (node, delegateProvider) => new BpmnReshapeHandleProvider(delegateProvider, node)
  )

  // allow reconnecting of edges
  manager.masterGraph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
    IEdgeReconnectionPortCandidateProvider.ALL_NODE_AND_EDGE_CANDIDATES
  )

  // enable undo operations
  manager.masterGraph.undoEngineEnabled = true
  // Use the undo support from the graph also for all future table instances
  Table.installStaticUndoSupport(manager.masterGraph)
}

/**
 * Helper method that reads the currently selected GraphML from the combo box.
 */
function onGraphChooserBoxSelectionChanged() {
  // hide any property popup that might be visible
  popupSupport.hidePropertyPopup()

  // now derive the file name
  const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
  const graphName = selectedItem.toLowerCase().replace(new RegExp(' ', 'g'), '_')
  const fileName = `resources/${graphName}.graphml`

  const graphmlHandler = new GraphMLIOHandler()
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
    BpmnView
  )
  graphmlHandler.addNamespace('http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0', 'bpmn')

  // and then load the graph and when done - fit the bounds
  setUIDisabled(true)
  DemoApp.readGraph(graphmlHandler, graphComponent.graph, fileName).then(() => {
    graphComponent.fitGraphBounds()
    graphComponent.graph.undoEngine.clear()
    setUIDisabled(false)
  })
}

/**
 * Helper method that tries to layout the current graph using the BpmnLayout.
 */
function onLayoutButtonClicked() {
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
    layout: new MinimumNodeSizeStage(bpmnLayout),
    layoutData: bpmnLayoutData,
    duration: '0.5s',
    animateViewport: true
  })
  layoutExecutor.tableLayoutConfigurator.horizontalLayout = true
  layoutExecutor.tableLayoutConfigurator.fromSketch = true
  layoutExecutor
    .start()
    .then(() => {
      layoutIsRunning = false
      setUIDisabled(false)
    })
    .catch(error => {
      setUIDisabled(false)
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    })
}

/**
 * Binds the toolbar elements to commands and listeners to be able to react to interactive changes.
 */
function registerCommands() {
  DemoApp.bindAction("button[data-command='New']", () => {
    popupSupport.hidePropertyPopup()
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })
  DemoApp.bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  DemoApp.bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  DemoApp.bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  DemoApp.bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  DemoApp.bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  DemoApp.bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)
  DemoApp.bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  DemoApp.bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  DemoApp.bindCommand(
    "button[data-command='FitContent']",
    ICommand.FIT_GRAPH_BOUNDS,
    graphComponent
  )
  DemoApp.bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  DemoApp.bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  DemoApp.bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const samplesComboBox = document.getElementById('SampleComboBox')
  DemoApp.bindAction("button[data-command='PreviousSample']", () => {
    samplesComboBox.selectedIndex = Math.max(0, samplesComboBox.selectedIndex - 1)
    onGraphChooserBoxSelectionChanged()
  })
  DemoApp.bindAction("button[data-command='NextSample']", () => {
    samplesComboBox.selectedIndex = Math.min(
      samplesComboBox.selectedIndex + 1,
      samplesComboBox.options.length - 1
    )
    onGraphChooserBoxSelectionChanged()
  })
  DemoApp.bindChangeListener(
    "select[data-command='SampleSelectionChanged']",
    onGraphChooserBoxSelectionChanged
  )
  DemoApp.bindAction("button[data-command='Layout']", onLayoutButtonClicked)

  // initialize commands for the item popups that are used to change the item's style properties
  popupSupport.registerPopupCommands()
}

/**
 * Registers the callback on the {@link GraphEditorInputMode}.
 */
function initializeContextMenu() {
  const inputMode = graphComponent.inputMode

  // Show context menus for ports, nodes and edges
  inputMode.contextMenuItems = GraphItemTypes.PORT | GraphItemTypes.NODE | GraphItemTypes.EDGE

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) => {
    onPopulateItemContextMenu(contextMenu, args)
  })

  // Add a listener that closes the menu when the input mode request this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Updates the elements of the UI's state and the input mode and checks whether the buttons should be enabled or
 * not.
 * @param {boolean} disabled
 */
function setUIDisabled(disabled) {
  const samplesComboBox = document.getElementById('SampleComboBox')
  samplesComboBox.disabled = disabled
  document.getElementById('previousButton').disabled =
    disabled || samplesComboBox.selectedIndex === 0
  document.getElementById('nextButton').disabled =
    disabled || samplesComboBox.selectedIndex === samplesComboBox.childElementCount - 1
  document.getElementById('layoutButton').disabled = disabled
  document.getElementById('newButton').disabled = disabled
  graphComponent.inputMode.waitInputMode.waiting = disabled
}

/**
 * Adds options to the context menu according to the item for which it is displayed.
 * This is called when the context menu is about to show.
 * @param {ContextMenu} itemContextMenu the context menu to which the options are added.
 * @param {PopulateItemContextMenuEventArgs} event The event data.
 */
function onPopulateItemContextMenu(itemContextMenu, event) {
  // clear items from a previous context menu appearance
  itemContextMenu.clearItems()

  if (INode.isInstance(event.item)) {
    const node = event.item
    // Add an annotation label to the node and start editing its text
    itemContextMenu.addMenuItem('Add Annotation Label', () => {
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
      graphComponent.inputMode.editLabel(label)
    })

    // If it is an Choreography node...
    if (node.style instanceof ChoreographyNodeStyle) {
      const choreographyNodeStyle = node.style
      itemContextMenu.addSeparator()
      // ... check if a participant was right-clicked
      const participant = choreographyNodeStyle.getParticipant(node, event.queryLocation)
      if (participant) {
        // and if so, offer to remove it
        itemContextMenu.addMenuItem('Remove Participant', () => {
          if (!choreographyNodeStyle.topParticipants.remove(participant)) {
            choreographyNodeStyle.bottomParticipants.remove(participant)
          }
          graphComponent.invalidate()
          graphComponent.focus()
        })
        // or toggle its Multi-Instance flag
        itemContextMenu.addMenuItem('Toggle Participant Multi-Instance', () => {
          participant.multiInstance = !participant.multiInstance
          graphComponent.invalidate()
          graphComponent.focus()
        })
      } else {
        // if no participant was clicked, a new one can be added to the top or bottom participants
        itemContextMenu.addMenuItem('Add Participant at Top', () => {
          choreographyNodeStyle.topParticipants.add(new Participant())
          graphComponent.invalidate()
          graphComponent.focus()
        })
        itemContextMenu.addMenuItem('Add Participant at Bottom', () => {
          choreographyNodeStyle.bottomParticipants.add(new Participant())
          graphComponent.invalidate()
          graphComponent.focus()
        })
      }
    }

    // If it is an Activity node...
    if (node.style instanceof ActivityNodeStyle) {
      itemContextMenu.addSeparator()
      // allow to add a Boundary Event as port that uses an EventPortStyle
      itemContextMenu.addMenuItem('Add Boundary Event', () => {
        graphComponent.graph.addPort(
          node,
          FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
          new EventPortStyle()
        )
        graphComponent.focus()
      })
    }

    // If a row of a pool node has been hit...
    const stripeDescriptor = tableEditorInputMode.findStripe(
      event.queryLocation,
      StripeTypes.ALL,
      StripeSubregionTypes.HEADER
    )
    if (stripeDescriptor && IRow.isInstance(stripeDescriptor.stripe)) {
      // ... allow to increase or decrease the row header size
      const stripe = stripeDescriptor.stripe
      const insets = stripe.insets
      const defaultInsets = stripe.table.rowDefaults.insets

      if (insets.left > defaultInsets.left) {
        itemContextMenu.addMenuItem('Reduce header size', () => {
          // by reducing the header size of one of the rows, the size of the table insets might change
          const insetsBefore = stripe.table.accumulatedInsets
          stripe.table.setStripeInsets(
            stripe,
            new Insets(insets.left - defaultInsets.left, insets.top, insets.right, insets.bottom)
          )
          const insetsAfter = stripe.table.accumulatedInsets
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
        })
      }
      itemContextMenu.addMenuItem('Increase header size', () => {
        const insetsBefore = stripe.table.accumulatedInsets
        stripe.table.setStripeInsets(
          stripe,
          new Insets(insets.left + defaultInsets.left, insets.top, insets.right, insets.bottom)
        )
        const insetsAfter = stripe.table.accumulatedInsets
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
      })
    }

    // we add an entry to open the style property popup
    itemContextMenu.addSeparator()
    itemContextMenu.addMenuItem('Edit Node Style Properties', () => {
      popupSupport.showPropertyPopup(node)
    })

    // we don't want to be queried again if there are more items at this location
    event.showMenu = true
  } else if (IEdge.isInstance(event.item)) {
    // For edges a label with a Message Icon may be added
    const modelParameter = new SmartEdgeLabelModel().createDefaultParameter()
    itemContextMenu.addMenuItem('Add Message Icon Label', () => {
      if (IEdge.isInstance(event.item)) {
        graphComponent.graph.addLabel(
          event.item,
          '',
          modelParameter,
          new MessageLabelStyle(),
          new Size(20, 14)
        )
        graphComponent.focus()
      }
    })

    // we add an entry to open the style property popup
    itemContextMenu.addSeparator()
    itemContextMenu.addMenuItem('Edit Edge Style Properties', () => {
      popupSupport.showPropertyPopup(event.item)
    })

    // we don't want to be queried again if there are more items at this location
    event.showMenu = true
  } else if (IPort.isInstance(event.item)) {
    const port = event.item
    if (popupSupport.hasPropertyPopup(port.style.getClass())) {
      itemContextMenu.addMenuItem('Edit Port Style Properties', () => {
        popupSupport.showPropertyPopup(port)
      })
      event.showMenu = true
    }
  }
}

/**
 * Custom {@link NodeDropInputMode} that disallows to create a table node inside of a group node
 * (especially inside of another table node).
 */
class NoNestedTablesDropInputMode extends NodeDropInputMode {
  /**
   * @param {Point} dragLocation
   * @return {IModelItem}
   */
  getDropTarget(dragLocation) {
    // Ok, this node has a table associated -> disallow dragging it into a group node.
    if (this.draggedItem.lookup(ITable.$class)) {
      return null
    }
    return super.getDropTarget(dragLocation)
  }
}

/**
 * Custom {@link ReparentNodeHandler} that disallows reparenting a table node.
 */
class NoTableReparentNodeHandler extends ReparentNodeHandler {
  /**
   * @param {IInputModeContext} context
   * @param {INode} node
   * @param {INode} newParent
   * @return {boolean}
   */
  isValidParent(context, node, newParent) {
    // table nodes shall not become child nodes
    return !node.lookup(ITable.$class) && super.isValidParent(context, node, newParent)
  }
}

/**
 * Creates and configures nodes that will be displayed in the style panel to be dragged to the graph component.
 * @return {INode[]}
 */
function createStylePanelNodes() {
  // Create a new Graph in which the palette nodes live
  const nodeContainer = new DefaultGraph()

  // Create the sample node for the pool
  const poolNodeStyle = new PoolNodeStyle(false)
  const poolNode = nodeContainer.createNodeAt(Point.ORIGIN, poolNodeStyle)
  const poolTable = poolNodeStyle.tableNodeStyle.table
  poolTable.columnDefaults.insets = Insets.EMPTY
  poolTable.createGrid(1, 1)
  // Use twice the default width for this sample column (looks nicer in the preview...)
  poolTable.setSize(
    poolTable.rootColumn.childColumns.first(),
    poolTable.rootColumn.childColumns.first().actualSize * 2
  )
  nodeContainer.setNodeLayout(poolNode, poolTable.layout.toRect())
  nodeContainer.addLabel(poolNode, 'Pool', PoolHeaderLabelModel.WEST)

  const rowPoolNodeStyle = new PoolNodeStyle(false)
  const rowNode = nodeContainer.createNodeAt(Point.ORIGIN, rowPoolNodeStyle)
  const rowTable = rowNode.lookup(ITable.$class)
  const rowSampleRow = rowTable.createRow(100)
  const rowSampleColumn = rowTable.createColumn({
    width: 200,
    style: VoidStripeStyle.INSTANCE
  })
  rowTable.setStripeInsets(rowSampleColumn, Insets.EMPTY)
  rowTable.insets = Insets.EMPTY
  rowTable.addLabel(rowSampleRow, 'Row')
  nodeContainer.setNodeLayout(rowNode, rowTable.layout.toRect())
  // Set the first row as tag so the NodeDragComponent knows that a row and not a complete pool node shall be
  // dragged
  rowNode.tag = rowTable.rootRow.childRows.first()

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
  InteriorLabelModel.CENTER,
  ExteriorLabelModel.EAST,
  ExteriorLabelModel.NORTH,
  ExteriorLabelModel.WEST,
  ExteriorLabelModel.SOUTH,
  ExteriorLabelModel.NORTH_EAST,
  ExteriorLabelModel.NORTH_WEST,
  ExteriorLabelModel.SOUTH_EAST,
  ExteriorLabelModel.SOUTH_WEST
]

/**
 * This class customizes the label editing for nodes that consist of more than one labels. The first label is
 * placed in the center of the node, while the others according to the parameters defined by the
 * ExteriorLabelModel.
 */
class AdditionalEditLabelHelper extends EditLabelHelper {
  /**
   * @param {IInputModeContext} context
   * @param {ILabelOwner} owner
   * @return {*|ILabelModelParameter}
   */
  getLabelParameter(context, owner) {
    if (owner.style instanceof BpmnGroupNodeStyle) {
      return InteriorLabelModel.NORTH
    }
    // eslint-disable-next-line arrow-body-style
    const validParameters = parameters.filter(parameter => {
      // find the valid parameter by checking for each label, if its bounds intersect with the bounds of the label
      // model parameter
      return owner.labels.every(label => {
        const bounds = label.layoutParameter.model.getGeometry(label, label.layoutParameter)
        return !parameter.model.getGeometry(label, parameter).bounds.intersects(bounds)
      })
    })
    return validParameters[0] || InteriorLabelModel.CENTER
  }
}

// start the demo
loadJson().then(run)
