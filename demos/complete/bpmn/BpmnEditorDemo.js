/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

/* eslint-disable no-new */

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'utils/ContextMenu',
  'utils/DndPanel',
  './bpmn-view.js',
  './BpmnPopupSupport.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  ContextMenu,
  DndPanel,
  BpmnView,
  BpmnPopup
) => {
  /**
   * The graph component which contains the graph.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The combo box to choose the sample graphs from.
   * @type {HTMLElement}
   */
  let graphChooserBox = null

  /**
   * The input mode that handles interactive table editing like adding rows and columns.
   * @type {yfiles.input.TableEditorInputMode}
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
   * Starts the BPMN editor.
   */
  function run() {
    // initialize UI elements
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const overviewComponent = new yfiles.view.GraphOverviewComponent(
      'overviewComponent',
      graphComponent
    )
    graphChooserBox = document.getElementById('SampleComboBox')

    // load the folding and style modules and initialize the GraphComponent
    require(['yfiles/view-folding', 'yfiles/view-table'], () => {
      // initialize the graph component
      initializeGraphComponent()
      // initialize the input mode
      initializeInputMode()

      // load the graphml module with folding support and initialize
      // the graph chooser box and the style property popups
      require(['yfiles/view-graphml'], () => {
        const stylePanel = new DndPanel.DragAndDropPanel(
          document.getElementById('stylePanel'),
          app.passiveSupported
        )
        // Set the callback that starts the actual drag and drop operation
        stylePanel.beginDragCallback = (element, data) => {
          const dragPreview = element.cloneNode(true)
          dragPreview.style.margin = '0'
          let dragSource = null
          if (yfiles.graph.IStripe.isInstance(data)) {
            dragSource = yfiles.input.StripeDropInputMode.startDrag(
              element,
              data,
              yfiles.view.DragDropEffects.ALL,
              true,
              app.pointerEventsSupported ? dragPreview : null
            )
          } else {
            dragSource = yfiles.input.NodeDropInputMode.startDrag(
              element,
              data,
              yfiles.view.DragDropEffects.ALL,
              true,
              app.pointerEventsSupported ? dragPreview : null
            )
          }
          dragSource.addQueryContinueDragListener((src, args) => {
            if (args.dropTarget === null) {
              app.removeClass(dragPreview, 'hidden')
            } else {
              app.addClass(dragPreview, 'hidden')
            }
          })
        }
        stylePanel.maxItemWidth = 140
        stylePanel.populatePanel(createStylePanelNodes)

        // initialize (de-)serialization for load/save commands
        const graphmlSupport = new yfiles.graphml.GraphMLSupport({
          graphComponent,
          // configure to load and save to the file system
          storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
        })
        const graphmlHandler = new yfiles.graphml.GraphMLIOHandler()
        graphmlHandler.addXamlNamespaceMapping(
          'http://www.yworks.com/xml/yfiles-bpmn/1.0',
          BpmnView
        )
        graphmlHandler.addXamlNamespaceMapping(
          'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
          BpmnView
        )
        graphmlHandler.addNamespace('http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0', 'bpmn')
        graphmlHandler.addHandleSerializationListener(BpmnView.BpmnHandleSerializationListener)
        graphmlSupport.graphMLIOHandler = graphmlHandler

        // load initial graph
        app
          .readGraph(graphmlHandler, graphComponent.graph, 'resources/business.graphml')
          .then(() => {
            graphComponent.fitGraphBounds()
            graphComponent.graph.undoEngine.clear()
          })

        // bind commands to UI input elements
        registerCommands()
        // initialize UI elements that belong to the popups
        initializePopups()
      })
    })

    app.show(graphComponent, overviewComponent)
  }

  function initializeGraphComponent() {
    // we want to enable folding for loading and showing nested graphs
    enableFolding()

    // prevent re-parenting of tables into tables by copy & paste
    const graphClipboard = new yfiles.graph.GraphClipboard()
    graphClipboard.parentNodeDetection = yfiles.graph.ParentNodeDetectionModes.PREVIOUS_PARENT
    graphComponent.clipboard = graphClipboard

    const decorator = graphComponent.graph.decorator
    decorator.nodeDecorator.editLabelHelperDecorator.setFactory(
      owner =>
        (owner.style.lookup && owner.style.lookup(owner, yfiles.input.IEditLabelHelper.$class)) ||
        new AdditionalEditLabelHelper()
    )
  }

  function initializeInputMode() {
    const graphSnapContext = new yfiles.input.GraphSnapContext({
      snapSegmentsToSnapLines: true,
      edgeToEdgeDistance: 10,
      nodeToEdgeDistance: 15,
      nodeToNodeDistance: 20,
      snapPortAdjacentSegments: true,
      snapBendsToSnapLines: true,
      snapBendAdjacentSegments: true
    })

    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true,
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      orthogonalBendRemoval: yfiles.input.OrthogonalEdgeEditingPolicy.ALWAYS,
      allowEditLabelOnDoubleClick: false,
      allowCreateNode: false,
      clickHitTestOrder: [
        yfiles.graph.GraphItemTypes.BEND,
        yfiles.graph.GraphItemTypes.EDGE_LABEL,
        yfiles.graph.GraphItemTypes.EDGE,
        yfiles.graph.GraphItemTypes.PORT,
        yfiles.graph.GraphItemTypes.NODE,
        yfiles.graph.GraphItemTypes.NODE_LABEL
      ],
      doubleClickHitTestOrder: [
        yfiles.graph.GraphItemTypes.BEND,
        yfiles.graph.GraphItemTypes.EDGE_LABEL,
        yfiles.graph.GraphItemTypes.EDGE,
        yfiles.graph.GraphItemTypes.PORT,
        yfiles.graph.GraphItemTypes.NODE,
        yfiles.graph.GraphItemTypes.NODE_LABEL
      ],
      snapContext: graphSnapContext
    })

    graphEditorInputMode.createEdgeInputMode.orthogonalEdgeCreation =
      yfiles.input.OrthogonalEdgeEditingPolicy.ALWAYS
    graphEditorInputMode.createEdgeInputMode.useHitItemsCandidatesOnly = true

    const nodeDropInputMode = new NoNestedTablesDropInputMode()
    nodeDropInputMode.showPreview = true
    nodeDropInputMode.enabled = true
    nodeDropInputMode.isGroupNodePredicate = draggedNode =>
      !!draggedNode.lookup(yfiles.graph.ITable.$class) || draggedNode.tag === 'GroupNode'
    graphEditorInputMode.nodeDropInputMode = nodeDropInputMode

    const noTableReparentNodeHandler = new NoTableReparentNodeHandler()
    noTableReparentNodeHandler.reparentRecognizer = yfiles.input.EventRecognizers.ALWAYS
    graphEditorInputMode.reparentNodeHandler = noTableReparentNodeHandler
    graphEditorInputMode.navigationInputMode.allowCollapseGroup = true
    graphEditorInputMode.navigationInputMode.allowExpandGroup = true

    // disable marquee selection so the MoveViewportInputMode can work without modifiers
    graphEditorInputMode.marqueeSelectionInputMode.enabled = false

    // show the popup for the double-clicked item that has been mapped to the item's style earlier
    graphEditorInputMode.addItemDoubleClickedListener((sender, e) => {
      showPropertyPopup(e.item)
      e.handled = true
    })

    // hide the popups on double clicks on the GraphComponent's background.
    graphEditorInputMode.clickInputMode.addDoubleClickedListener(() => {
      hidePropertyPopup()
    })

    // Create a new TableEditorInputMode instance which also allows drag and drop
    const reparentStripeHandler = new yfiles.input.ReparentStripeHandler()
    reparentStripeHandler.maxColumnLevel = 2
    reparentStripeHandler.maxRowLevel = 2
    const tableInputMode = new yfiles.input.TableEditorInputMode({
      reparentStripeHandler,
      priority: graphEditorInputMode.handleInputMode.priority + 1
    })
    tableInputMode.stripeDropInputMode.enabled = true
    tableEditorInputMode = tableInputMode

    // Add to GraphEditorInputMode - we set the priority higher than for the handle input mode so that handles are
    // preferred if both gestures are possible
    graphEditorInputMode.add(tableEditorInputMode)

    // modify commands to ensure popup synchronization
    initializePopupSynchronization(graphEditorInputMode)

    // assign input mode to graph component
    graphComponent.inputMode = graphEditorInputMode

    // Configure the context menus
    initializeContextMenu()
  }

  /**
   * This methods configures delete, cut, undo and redo such that the popup stays
   * in sync with the respective item during these operations.
   * @param {yfiles.input.GraphEditorInputMode} graphEditorInputMode
   */
  function initializePopupSynchronization(graphEditorInputMode) {
    // If the popup for an IModelItem is displayed but the item is deleted, we hide the popup
    graphEditorInputMode.addDeletedItemListener(() => {
      updatePopupState()
      contextMenu.close()
    })

    // If the popup for an IModelItem is displayed but the item is cut, we hide the popup
    graphEditorInputMode.availableCommands.remove(yfiles.input.ICommand.CUT)
    graphEditorInputMode.keyboardInputMode.addCommandBinding(
      yfiles.input.ICommand.CUT,
      () => {
        graphEditorInputMode.cut()
        updatePopupState()
        contextMenu.close()
      },
      () =>
        yfiles.graph.GraphItemTypes.enumerableContainsTypes(
          graphEditorInputMode.pasteSelectableItems,
          graphEditorInputMode.graphSelection
        )
    )

    // If the popup for an IModelItem is displayed but the item is removed by undo, we hide the popup
    graphEditorInputMode.availableCommands.remove(yfiles.input.ICommand.UNDO)
    graphEditorInputMode.keyboardInputMode.addCommandBinding(
      yfiles.input.ICommand.UNDO,
      () => {
        graphEditorInputMode.undo()
        updatePopupState()
        contextMenu.close()
      },
      () => graphComponent.graph.undoEngine.canUndo()
    )

    // If the popup for an IModelItem is displayed but the item is removed by redo, we hide the popup
    graphEditorInputMode.availableCommands.remove(yfiles.input.ICommand.REDO)
    graphEditorInputMode.keyboardInputMode.addCommandBinding(
      yfiles.input.ICommand.REDO,
      () => {
        graphEditorInputMode.redo()
        updatePopupState()
        contextMenu.close()
      },
      () => graphComponent.graph.undoEngine.canRedo()
    )
  }

  /**
   * Enables folding - changes the GraphComponent's graph to a managed view
   * that provides the actual collapse/expand state.
   */
  function enableFolding() {
    // create the manager
    const manager = new yfiles.graph.FoldingManager()
    const foldedGraph = manager.createFoldingView()
    // replace the displayed graph with a managed view
    graphComponent.graph = foldedGraph.graph

    // ports should not be removed when an attached edge is deleted
    manager.masterGraph.nodeDefaults.ports.autoCleanUp = false

    // set default styles and label model parameter
    foldedGraph.graph.groupNodeDefaults.style = new BpmnView.GroupNodeStyle()
    const bpmnEdgeStyle = new BpmnView.BpmnEdgeStyle()
    bpmnEdgeStyle.type = BpmnView.EdgeType.SEQUENCE_FLOW
    graphComponent.graph.edgeDefaults.style = bpmnEdgeStyle
    graphComponent.graph.edgeDefaults.shareStyleInstance = false
    graphComponent.graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.SmartEdgeLabelModel(
      {
        angle: 0,
        autoRotation: false
      }
    ).createDefaultParameter()

    // for nodes we use a CompositeLabelModel that combines label placements inside and outside of the node
    const compositeLabelModel = new yfiles.graph.CompositeLabelModel()
    compositeLabelModel.labelModels.add(new yfiles.graph.InteriorLabelModel())
    compositeLabelModel.labelModels.add(new yfiles.graph.ExteriorLabelModel({ insets: 10 }))
    graphComponent.graph.nodeDefaults.labels.layoutParameter = compositeLabelModel.createDefaultParameter()

    manager.masterGraph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(node => {
      if (node.lookup(yfiles.graph.ITable.$class)) {
        // Pool only have a dynamic PortCandidate
        return yfiles.input.IPortCandidateProvider.fromCandidates([
          new yfiles.input.DefaultPortCandidate({
            owner: node,
            locationParameter: yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED,
            validity: yfiles.input.PortCandidateValidity.DYNAMIC
          })
        ])
      }

      // use a specialized port candidate provider
      return new BpmnView.BpmnPortCandidateProvider(node)
    })

    // use handles that preserve the aspect ratio of the node while reshaping for nodes with
    // GatewayNodeStyle, EventNodeStyle and ConversationNodeStyle
    graphComponent.graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setImplementationWrapper(
      (node, delegateProvider) => new BpmnView.BpmnReshapeHandleProvider(delegateProvider, node)
    )

    // allow reconnecting of edges
    manager.masterGraph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
      yfiles.input.IEdgeReconnectionPortCandidateProvider.ALL_NODE_AND_EDGE_CANDIDATES
    )

    // enable undo operations
    manager.masterGraph.undoEngineEnabled = true
    // Use the undo support from the graph also for all future table instances
    yfiles.graph.Table.installStaticUndoSupport(manager.masterGraph)
  }

  /**
   * Helper method that reads the currently selected GraphML from the combo box.
   */
  function onGraphChooserBoxSelectionChanged() {
    // hide any property popup that might be visible
    hidePropertyPopup()

    // now derive the file name
    const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
    const graphName = selectedItem.toLowerCase().replace(new RegExp(' ', 'g'), '_')
    const fileName = `resources/${graphName}.graphml`

    const graphmlHandler = new yfiles.graphml.GraphMLIOHandler()
    graphmlHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0',
      BpmnView
    )
    graphmlHandler.addNamespace('http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0', 'bpmn')

    // and then load the graph and when done - fit the bounds
    setUIDisabled(true)
    app.readGraph(graphmlHandler, graphComponent.graph, fileName).then(() => {
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
    require(['BpmnLayout.js', 'BpmnLayoutData.js', 'yfiles/view-layout-bridge'], (
      BpmnLayout,
      BpmnLayoutData
    ) => {
      // Create a new BpmnLayout using a left-to-right layout orientation
      const bpmnLayout = new BpmnLayout()
      bpmnLayout.scope = 'ALL_ELEMENTS'
      bpmnLayout.layoutOrientation = 'LEFT_TO_RIGHT'

      const bpmnLayoutData = new BpmnLayoutData()
      bpmnLayoutData.compactMessageFlowLayering = false
      bpmnLayoutData.startNodesFirst = true

      const layoutExecutor = new yfiles.layout.LayoutExecutor(
        graphComponent,
        new yfiles.layout.MinimumNodeSizeStage(bpmnLayout)
      )
      layoutExecutor.layoutData = bpmnLayoutData
      layoutExecutor.duration = '0.5s'
      layoutExecutor.animateViewport = true
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
          }
        })
    })
  }

  /**
   * Binds the toolbar elements to commands and listeners to be able to react to interactive changes.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      graphComponent.fitGraphBounds()
    })
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)
    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent)
    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    const samplesComboBox = document.getElementById('SampleComboBox')
    app.bindAction("button[data-command='PreviousSample']", () => {
      samplesComboBox.selectedIndex = Math.max(0, samplesComboBox.selectedIndex - 1)
      onGraphChooserBoxSelectionChanged()
    })
    app.bindAction("button[data-command='NextSample']", () => {
      samplesComboBox.selectedIndex = Math.min(
        samplesComboBox.selectedIndex + 1,
        samplesComboBox.options.length - 1
      )
      onGraphChooserBoxSelectionChanged()
    })
    app.bindChangeListener(
      "select[data-command='SampleSelectionChanged']",
      onGraphChooserBoxSelectionChanged
    )
    app.bindAction("button[data-command='Layout']", onLayoutButtonClicked)

    // initialize commands for the item popups that are used to change the item's style properties
    registerPopupCommands()
  }

  /**
   * Registers the callback on the {@link yfiles.input.GraphEditorInputMode}.
   */
  function initializeContextMenu() {
    const inputMode = graphComponent.inputMode
    typePopups = new yfiles.collections.Map()

    // Show context menus for ports, nodes and edges
    inputMode.contextMenuItems =
      yfiles.graph.GraphItemTypes.PORT |
      yfiles.graph.GraphItemTypes.NODE |
      yfiles.graph.GraphItemTypes.EDGE

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
   * @param {yfiles.input.PopulateItemContextMenuEventArgs} event The event data.
   */
  function onPopulateItemContextMenu(itemContextMenu, event) {
    // clear items from a previous context menu appearance
    itemContextMenu.clearItems()

    if (yfiles.graph.INode.isInstance(event.item)) {
      const node = event.item
      // Add an annotation label to the node and start editing its text
      itemContextMenu.addMenuItem('Add Annotation Label', () => {
        const origin = yfiles.geometry.Point.ORIGIN
        const modelParameter = yfiles.graph.FreeNodeLabelModel.INSTANCE.createParameter(
          origin,
          new yfiles.geometry.Point(node.layout.width * 0.75, -50),
          origin,
          origin,
          0
        )
        const label = graphComponent.graph.addLabel(
          node,
          '',
          modelParameter,
          new BpmnView.AnnotationLabelStyle()
        )
        graphComponent.inputMode.editLabel(label)
      })

      // If it is an Choreography node...
      if (node.style instanceof BpmnView.ChoreographyNodeStyle) {
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
            choreographyNodeStyle.topParticipants.add(new BpmnView.Participant())
            graphComponent.invalidate()
            graphComponent.focus()
          })
          itemContextMenu.addMenuItem('Add Participant at Bottom', () => {
            choreographyNodeStyle.bottomParticipants.add(new BpmnView.Participant())
            graphComponent.invalidate()
            graphComponent.focus()
          })
        }
      }

      // If it is an Activity node...
      if (node.style instanceof BpmnView.ActivityNodeStyle) {
        itemContextMenu.addSeparator()
        // allow to add a Boundary Event as port that uses an EventPortStyle
        itemContextMenu.addMenuItem('Add Boundary Event', () => {
          graphComponent.graph.addPort(
            node,
            yfiles.graph.FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
            new BpmnView.EventPortStyle()
          )
          graphComponent.focus()
        })
      }

      // If a row of a pool node has been hit...
      const stripeDescriptor = tableEditorInputMode.findStripe(
        event.queryLocation,
        yfiles.graph.StripeTypes.ALL,
        yfiles.input.StripeSubregionTypes.HEADER
      )
      if (stripeDescriptor && yfiles.graph.IRow.isInstance(stripeDescriptor.stripe)) {
        // ... allow to increase or decrease the row header size
        const stripe = stripeDescriptor.stripe
        const insets = stripe.insets
        const defaultInsets = stripe.table.rowDefaults.insets

        if (insets.left > defaultInsets.left) {
          itemContextMenu.addMenuItem('Reduce header size', () => {
            // by reducing the header size of one of the rows, the size of the table insets might change
            const insetsBefore = stripe.table.getAccumulatedInsets()
            stripe.table.setStripeInsets(
              stripe,
              new yfiles.geometry.Insets(
                insets.left - defaultInsets.left,
                insets.top,
                insets.right,
                insets.bottom
              )
            )
            const insetsAfter = stripe.table.getAccumulatedInsets()
            // if the table insets have changed, the bounds of the pool node have to be adjusted as well
            const diff = insetsBefore.left - insetsAfter.left
            graphComponent.graph.setNodeLayout(
              node,
              new yfiles.geometry.Rect(
                node.layout.x + diff,
                node.layout.y,
                node.layout.width - diff,
                node.layout.height
              )
            )
          })
        }
        itemContextMenu.addMenuItem('Increase header size', () => {
          const insetsBefore = stripe.table.getAccumulatedInsets()
          stripe.table.setStripeInsets(
            stripe,
            new yfiles.geometry.Insets(
              insets.left + defaultInsets.left,
              insets.top,
              insets.right,
              insets.bottom
            )
          )
          const insetsAfter = stripe.table.getAccumulatedInsets()
          const diff = insetsBefore.left - insetsAfter.left
          graphComponent.graph.setNodeLayout(
            node,
            new yfiles.geometry.Rect(
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
        showPropertyPopup(node)
      })

      // we don't want to be queried again if there are more items at this location
      event.showMenu = true
    } else if (yfiles.graph.IEdge.isInstance(event.item)) {
      // For edges a label with a Message Icon may be added
      const modelParameter = new yfiles.graph.SmartEdgeLabelModel().createDefaultParameter()
      itemContextMenu.addMenuItem('Add Message Icon Label', () => {
        if (yfiles.graph.IEdge.isInstance(event.item)) {
          graphComponent.graph.addLabel(
            event.item,
            '',
            modelParameter,
            new BpmnView.MessageLabelStyle(),
            new yfiles.geometry.Size(20, 14)
          )
          graphComponent.focus()
        }
      })

      // we add an entry to open the style property popup
      itemContextMenu.addSeparator()
      itemContextMenu.addMenuItem('Edit Edge Style Properties', () => {
        showPropertyPopup(event.item)
      })

      // we don't want to be queried again if there are more items at this location
      event.showMenu = true
    } else if (yfiles.graph.IPort.isInstance(event.item)) {
      const port = event.item
      if (typePopups.has(port.style.getClass())) {
        itemContextMenu.addMenuItem('Edit Port Style Properties', () => {
          showPropertyPopup(port)
        })
        event.showMenu = true
      }
    }
  }

  /**
   * A mapping of BPMN styles to popup-support to identify the right popup to show for an item.
   * @type {yfiles.collections.Map.<yfiles.lang.Class,BpmnPopup>}
   */
  let typePopups = null

  /**
   * The currently visible popup.
   * @type {BpmnPopup}
   */
  let activePopup = null

  // The combo and check boxes used in the popups - initialized in {@link #initializePopups}

  /** @type {HTMLElement} */
  let gatewayTypeBox = null

  /** @type {HTMLElement} */
  let eventTypeBox = null

  /** @type {HTMLElement} */
  let eventCharacteristicBox = null

  /** @type {HTMLElement} */
  let activityTypeBox = null

  /** @type {HTMLElement} */
  let activityAdHocCheckBox = null

  /** @type {HTMLElement} */
  let activityCompensationCheckBox = null

  /** @type {HTMLElement} */
  let activityLoopCharacteristicBox = null

  /** @type {HTMLElement} */
  let activitySubStateBox = null

  /** @type {HTMLElement} */
  let activityTaskTypeBox = null

  /** @type {HTMLElement} */
  let activityTriggerEventCharacteristicBox = null

  /** @type {HTMLElement} */
  let activityTriggerEventTypeBox = null

  /** @type {HTMLElement} */
  let conversationTypeBox = null

  /** @type {HTMLElement} */
  let choreographyTypeBox = null

  /** @type {HTMLElement} */
  let choreographyInitiatingAtTopCheckBox = null

  /** @type {HTMLElement} */
  let choreographyInitiatingMessageCheckBox = null

  /** @type {HTMLElement} */
  let choreographyResponseMessageCheckBox = null

  /** @type {HTMLElement} */
  let choreographyLoopCharacteristicBox = null

  /** @type {HTMLElement} */
  let choreographySubStateBox = null

  /** @type {HTMLElement} */
  let poolMultipleCheckBox = null

  /** @type {HTMLElement} */
  let dataObjectTypeBox = null

  /** @type {HTMLElement} */
  let dataObjectCollectionCheckBox = null

  /** @type {HTMLElement} */
  let edgeTypeBox = null

  /** @type {HTMLElement} */
  let portEventTypeBox = null

  /** @type {HTMLElement} */
  let portEventCharacteristicBox = null

  /**
   * Registers commands for each combo and check box that apply the new value to the according style property
   */
  function registerPopupCommands() {
    app.bindChangeListener("select[data-command='GatewayTypeChanged']", () => {
      setNodeComboBoxValue(BpmnView.GatewayType.$class, gatewayTypeBox, (node, value) => {
        node.style.type = value
      })
    })
    app.bindChangeListener("select[data-command='EventTypeChanged']", () => {
      setNodeComboBoxValue(BpmnView.EventType.$class, eventTypeBox, (node, value) => {
        node.style.type = value
      })
    })
    app.bindChangeListener("select[data-command='EventCharacteristicChanged']", () => {
      setNodeComboBoxValue(
        BpmnView.EventCharacteristic.$class,
        eventCharacteristicBox,
        (node, value) => {
          node.style.characteristic = value
        }
      )
    })
    app.bindChangeListener("select[data-command='ActivityTypeChanged']", () => {
      setNodeComboBoxValue(BpmnView.ActivityType.$class, activityTypeBox, (node, value) => {
        node.style.activityType = value
      })
    })
    app.bindChangeListener("input[data-command='ActivityAdHocChanged']", () => {
      setNodeCheckBoxValue(activityAdHocCheckBox, (node, value) => {
        node.style.adHoc = value
      })
    })
    app.bindChangeListener("input[data-command='ActivityCompensationChanged']", () => {
      setNodeCheckBoxValue(activityCompensationCheckBox, (node, value) => {
        node.style.compensation = value
      })
    })
    app.bindChangeListener("select[data-command='ActivityLoopCharacteristicChanged']", () => {
      setNodeComboBoxValue(
        BpmnView.LoopCharacteristic.$class,
        activityLoopCharacteristicBox,
        (node, value) => {
          node.style.loopCharacteristic = value
        }
      )
    })
    app.bindChangeListener("select[data-command='ActivitySubStateChanged']", () => {
      setNodeComboBoxValue(BpmnView.SubState.$class, activitySubStateBox, (node, value) => {
        node.style.subState = value
      })
    })
    app.bindChangeListener("select[data-command='ActivityTaskTypeChanged']", () => {
      setNodeComboBoxValue(BpmnView.TaskType.$class, activityTaskTypeBox, (node, value) => {
        node.style.taskType = value
        if (BpmnView.TaskType.EVENT_TRIGGERED === value) {
          activityTriggerEventCharacteristicBox.selectedIndex = getIndex(
            activityTriggerEventCharacteristicBox,
            yfiles.lang.Enum.getName(
              BpmnView.EventCharacteristic.$class,
              node.style.triggerEventCharacteristic
            )
          )
          activityTriggerEventCharacteristicBox.disabled = false
          activityTriggerEventTypeBox.selectedIndex = getIndex(
            activityTriggerEventTypeBox,
            yfiles.lang.Enum.getName(BpmnView.EventType.$class, node.style.triggerEventType)
          )
          activityTriggerEventTypeBox.disabled = false
        } else {
          activityTriggerEventCharacteristicBox.selectedIndex = -1
          activityTriggerEventCharacteristicBox.disabled = true
          activityTriggerEventTypeBox.selectedIndex = -1
          activityTriggerEventTypeBox.disabled = true
        }
      })
    })
    app.bindChangeListener(
      "select[data-command='ActivityTriggerEventCharacteristicChanged']",
      () => {
        setNodeComboBoxValue(
          BpmnView.EventCharacteristic.$class,
          activityTriggerEventCharacteristicBox,
          (node, value) => {
            node.style.triggerEventCharacteristic = value
          }
        )
      }
    )
    app.bindChangeListener("select[data-command='ActivityTriggerEventTypeChanged']", () => {
      setNodeComboBoxValue(
        BpmnView.EventType.$class,
        activityTriggerEventTypeBox,
        (node, value) => {
          node.style.triggerEventType = value
        }
      )
    })

    app.bindChangeListener("select[data-command='ConversationTypeChanged']", () => {
      setNodeComboBoxValue(BpmnView.ConversationType.$class, conversationTypeBox, (node, value) => {
        node.style.type = value
      })
    })

    app.bindChangeListener("select[data-command='ChoreographyTypeChanged']", () => {
      setNodeComboBoxValue(BpmnView.ChoreographyType.$class, choreographyTypeBox, (node, value) => {
        node.style.type = value
      })
    })
    app.bindChangeListener("input[data-command='ChoreographyInitiatingAtTopChanged']", () => {
      setNodeCheckBoxValue(choreographyInitiatingAtTopCheckBox, (node, value) => {
        node.style.initiatingAtTop = value
      })
    })
    app.bindChangeListener("input[data-command='ChoreographyInitiatingMessageChanged']", () => {
      setNodeCheckBoxValue(choreographyInitiatingMessageCheckBox, (node, value) => {
        node.style.initiatingMessage = value
      })
    })
    app.bindChangeListener("input[data-command='ChoreographyResponseMessageChanged']", () => {
      setNodeCheckBoxValue(choreographyResponseMessageCheckBox, (node, value) => {
        node.style.responseMessage = value
      })
    })
    app.bindChangeListener("select[data-command='ChoreographyLoopCharacteristicChanged']", () => {
      setNodeComboBoxValue(
        BpmnView.LoopCharacteristic.$class,
        choreographyLoopCharacteristicBox,
        (node, value) => {
          node.style.loopCharacteristic = value
        }
      )
    })
    app.bindChangeListener("select[data-command='ChoreographySubStateChanged']", () => {
      setNodeComboBoxValue(BpmnView.SubState.$class, choreographySubStateBox, (node, value) => {
        node.style.subState = value
      })
    })

    app.bindChangeListener("select[data-command='DataObjectTypeChanged']", () => {
      setNodeComboBoxValue(BpmnView.DataObjectType.$class, dataObjectTypeBox, (node, value) => {
        node.style.type = value
      })
    })
    app.bindChangeListener("input[data-command='DataObjectCollectionChanged']", () => {
      setNodeCheckBoxValue(dataObjectCollectionCheckBox, (node, value) => {
        node.style.collection = value
      })
    })

    app.bindAction("input[data-command='PoolMultipleChanged']", () => {
      setNodeCheckBoxValue(poolMultipleCheckBox, (node, value) => {
        node.style.multipleInstance = value
      })
    })

    app.bindChangeListener("select[data-command='EdgeTypeChanged']", setEdgeType)

    app.bindChangeListener("select[data-command='PortEventTypeChanged']", () => {
      setPortComboBoxValue(BpmnView.EventType.$class, portEventTypeBox, (port, value) => {
        port.style.type = value
      })
    })
    app.bindChangeListener("select[data-command='PortEventCharacteristicChanged']", () => {
      setPortComboBoxValue(
        BpmnView.EventCharacteristic.$class,
        portEventCharacteristicBox,
        (port, value) => {
          port.style.characteristic = value
        }
      )
    })

    app.bindActions("button[data-command='ClosePopup']", hidePropertyPopup)
  }

  /**
   * Adds options to the given combo box for the content of the enum type.
   * @param {HTMLElement} comboBox
   * @param {object} enumType
   */
  function populateComboBox(comboBox, enumType) {
    getEnumNames(enumType).forEach(name => {
      const option = document.createElement('option')
      option.innerHTML = name
      comboBox.options.add(option)
    })
  }

  /**
   * Initialize the item lists of all combo boxes with the available enum values
   */
  function initializePopups() {
    gatewayTypeBox = document.getElementById('gatewayTypeBox')
    populateComboBox(gatewayTypeBox, BpmnView.GatewayType.$class)

    eventTypeBox = document.getElementById('eventTypeBox')
    populateComboBox(eventTypeBox, BpmnView.EventType.$class)
    eventCharacteristicBox = document.getElementById('eventCharacteristicBox')
    populateComboBox(eventCharacteristicBox, BpmnView.EventCharacteristic.$class)

    activityAdHocCheckBox = document.getElementById('activityAdHocCheckBox')
    activityCompensationCheckBox = document.getElementById('activityCompensationCheckBox')
    activityTypeBox = document.getElementById('activityTypeBox')
    populateComboBox(activityTypeBox, BpmnView.ActivityType.$class)
    activityLoopCharacteristicBox = document.getElementById('activityLoopCharacteristicBox')
    populateComboBox(activityLoopCharacteristicBox, BpmnView.LoopCharacteristic.$class)
    activitySubStateBox = document.getElementById('activitySubStateBox')
    populateComboBox(activitySubStateBox, BpmnView.SubState.$class)
    activityTaskTypeBox = document.getElementById('activityTaskTypeBox')
    populateComboBox(activityTaskTypeBox, BpmnView.TaskType.$class)
    activityTriggerEventCharacteristicBox = document.getElementById(
      'activityTriggerEventCharacteristicBox'
    )
    populateComboBox(activityTriggerEventCharacteristicBox, BpmnView.EventCharacteristic.$class)
    activityTriggerEventTypeBox = document.getElementById('activityTriggerEventTypeBox')
    populateComboBox(activityTriggerEventTypeBox, BpmnView.EventType.$class)

    conversationTypeBox = document.getElementById('conversationTypeBox')
    populateComboBox(conversationTypeBox, BpmnView.ConversationType.$class)

    choreographyInitiatingAtTopCheckBox = document.getElementById(
      'choreographyInitiatingAtTopCheckBox'
    )
    choreographyInitiatingMessageCheckBox = document.getElementById(
      'choreographyInitiatingMessageCheckBox'
    )
    choreographyResponseMessageCheckBox = document.getElementById(
      'choreographyResponseMessageCheckBox'
    )
    choreographyTypeBox = document.getElementById('choreographyTypeBox')
    populateComboBox(choreographyTypeBox, BpmnView.ChoreographyType.$class)
    choreographyLoopCharacteristicBox = document.getElementById('choreographyLoopCharacteristicBox')
    populateComboBox(choreographyLoopCharacteristicBox, BpmnView.LoopCharacteristic.$class)
    choreographySubStateBox = document.getElementById('choreographySubStateBox')
    populateComboBox(choreographySubStateBox, BpmnView.SubState.$class)

    dataObjectCollectionCheckBox = document.getElementById('dataObjectCollectionCheckBox')
    dataObjectTypeBox = document.getElementById('dataObjectTypeBox')
    populateComboBox(dataObjectTypeBox, BpmnView.DataObjectType.$class)

    poolMultipleCheckBox = document.getElementById('poolMultipleCheckBox')

    edgeTypeBox = document.getElementById('edgeTypeBox')
    populateComboBox(edgeTypeBox, BpmnView.EdgeType.$class)

    portEventTypeBox = document.getElementById('portEventTypeBox')
    populateComboBox(portEventTypeBox, BpmnView.EventType.$class)
    portEventCharacteristicBox = document.getElementById('portEventCharacteristicBox')
    populateComboBox(portEventCharacteristicBox, BpmnView.EventCharacteristic.$class)

    // create a label model parameter that is used to position the node pop-up
    const nodeLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 10 })

    const nodeLabelModelParameter = nodeLabelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.NORTH
    )
    const edgeLabelModelParameter = yfiles.graph.NinePositionsEdgeLabelModel.CENTER_CENTERED

    // create the pop-ups
    new BpmnView.BpmnEdgeStyle() // the style needs to be initialized once to be able to use it as key for the
    // popup-mapping
    new BpmnView.EventPortStyle() // the style needs to be initialized once to be able to use it as key for the
    // popup-mapping
    createPopup('gatewayPopupContent', BpmnView.GatewayNodeStyle.$class, nodeLabelModelParameter)
    createPopup('eventPopupContent', BpmnView.EventNodeStyle.$class, nodeLabelModelParameter)
    createPopup('activityPopupContent', BpmnView.ActivityNodeStyle.$class, nodeLabelModelParameter)
    createPopup(
      'conversationPopupContent',
      BpmnView.ConversationNodeStyle.$class,
      nodeLabelModelParameter
    )
    createPopup(
      'choreographyPopupContent',
      BpmnView.ChoreographyNodeStyle.$class,
      nodeLabelModelParameter
    )
    createPopup(
      'dataObjectPopupContent',
      BpmnView.DataObjectNodeStyle.$class,
      nodeLabelModelParameter
    )
    createPopup('poolPopupContent', BpmnView.PoolNodeStyle.$class, nodeLabelModelParameter)
    createPopup('edgePopupContent', BpmnView.BpmnEdgeStyle.$class, edgeLabelModelParameter)
    createPopup('portPopupContent', BpmnView.EventPortStyle.$class, nodeLabelModelParameter)
  }

  /**
   * Creates a popup for the given style.
   * @param {string} popupContentName
   * @param {object} styleName
   * @param {yfiles.graph.ILabelModelParameter} popupPlacement
   */
  function createPopup(popupContentName, styleName, popupPlacement) {
    // get the popup template from the DOM
    const popupContent = window.document.getElementById(popupContentName)
    // create a popup support using the specified placement and content
    const popup = new BpmnPopup(graphComponent, popupContent, popupPlacement)
    // map the node/edge/port style to its popup support
    typePopups.set(styleName, popup)
  }

  /**
   * Shows an updated popup for the clicked item.
   * @param {yfiles.graph.IModelItem} clickedItem
   */
  function showPropertyPopup(clickedItem) {
    // hide any current popups
    hidePropertyPopup()

    // check if a popup support has been mapped to the style of the clicked item
    const popup = { value: null }
    const currentItem = yfiles.graph.ILabel.isInstance(clickedItem)
      ? clickedItem.owner
      : clickedItem
    if (
      yfiles.graph.INode.isInstance(currentItem) ||
      yfiles.graph.IEdge.isInstance(currentItem) ||
      yfiles.graph.IPort.isInstance(currentItem)
    ) {
      const typePopup = typePopups.get(currentItem.style.getClass())
      if (typePopup) {
        popup.value = typePopup
      }
    }

    if (popup.value) {
      // A popup was found for the double-clicked item so we update and show it
      activePopup = popup.value
      // update data displayed in the pop-up
      updatePopupContent(currentItem)
      // open pop-up
      activePopup.currentItem = currentItem
    }
  }

  /**
   * Updates the popup-content to be in sync with the selected options of the current item.
   * @param {yfiles.graph.IModelItem} item The item for which the popup is assembled.
   */
  function updatePopupContent(item) {
    // for all properties of the current item's style we set the value in the according combo or check box of the
    // active popup
    if (yfiles.graph.INode.isInstance(item)) {
      const nodeStyle = item.style
      if (nodeStyle instanceof BpmnView.GatewayNodeStyle) {
        gatewayTypeBox.selectedIndex = getIndex(
          gatewayTypeBox,
          yfiles.lang.Enum.getName(BpmnView.GatewayType.$class, nodeStyle.type)
        )
      }

      if (nodeStyle instanceof BpmnView.EventNodeStyle) {
        eventTypeBox.selectedIndex = getIndex(
          eventTypeBox,
          yfiles.lang.Enum.getName(BpmnView.EventType.$class, nodeStyle.type)
        )
        eventCharacteristicBox.selectedIndex = getIndex(
          eventCharacteristicBox,
          yfiles.lang.Enum.getName(BpmnView.EventCharacteristic.$class, nodeStyle.characteristic)
        )
      }

      if (nodeStyle instanceof BpmnView.ActivityNodeStyle) {
        activityTypeBox.selectedIndex = getIndex(
          activityTypeBox,
          yfiles.lang.Enum.getName(BpmnView.ActivityType.$class, nodeStyle.activityType)
        )
        activityAdHocCheckBox.checked = nodeStyle.adHoc
        activityCompensationCheckBox.checked = nodeStyle.compensation
        activityLoopCharacteristicBox.selectedIndex = getIndex(
          activityLoopCharacteristicBox,
          yfiles.lang.Enum.getName(BpmnView.LoopCharacteristic.$class, nodeStyle.loopCharacteristic)
        )
        activitySubStateBox.selectedIndex = getIndex(
          activitySubStateBox,
          yfiles.lang.Enum.getName(BpmnView.SubState.$class, nodeStyle.subState)
        )
        activityTaskTypeBox.selectedIndex = getIndex(
          activityTaskTypeBox,
          yfiles.lang.Enum.getName(BpmnView.TaskType.$class, nodeStyle.taskType)
        )
        if (BpmnView.TaskType.EVENT_TRIGGERED === nodeStyle.taskType) {
          activityTriggerEventCharacteristicBox.selectedIndex = getIndex(
            activityTriggerEventCharacteristicBox,
            yfiles.lang.Enum.getName(
              BpmnView.EventCharacteristic.$class,
              nodeStyle.triggerEventCharacteristic
            )
          )
          activityTriggerEventCharacteristicBox.disabled = false
          activityTriggerEventTypeBox.selectedIndex = getIndex(
            activityTriggerEventTypeBox,
            yfiles.lang.Enum.getName(BpmnView.EventType.$class, nodeStyle.triggerEventType)
          )
          activityTriggerEventTypeBox.disabled = false
        } else {
          activityTriggerEventCharacteristicBox.selectedIndex = -1
          activityTriggerEventCharacteristicBox.disabled = true
          activityTriggerEventTypeBox.selectedIndex = -1
          activityTriggerEventTypeBox.disabled = true
        }
      }

      if (nodeStyle instanceof BpmnView.ConversationNodeStyle) {
        conversationTypeBox.selectedIndex = getIndex(
          choreographyTypeBox,
          yfiles.lang.Enum.getName(BpmnView.ConversationType.$class, nodeStyle.type)
        )
      }

      if (nodeStyle instanceof BpmnView.ChoreographyNodeStyle) {
        choreographyTypeBox.selectedIndex = getIndex(
          choreographyTypeBox,
          yfiles.lang.Enum.getName(BpmnView.ChoreographyType.$class, nodeStyle.type)
        )
        choreographyInitiatingAtTopCheckBox.checked = nodeStyle.initiatingAtTop
        choreographyInitiatingMessageCheckBox.checked = nodeStyle.initiatingMessage
        choreographyResponseMessageCheckBox.checked = nodeStyle.responseMessage
        choreographyLoopCharacteristicBox.selectedIndex = getIndex(
          choreographyLoopCharacteristicBox,
          yfiles.lang.Enum.getName(BpmnView.LoopCharacteristic.$class, nodeStyle.loopCharacteristic)
        )
        choreographySubStateBox.selectedIndex = getIndex(
          choreographySubStateBox,
          yfiles.lang.Enum.getName(BpmnView.SubState.$class, nodeStyle.subState)
        )
      }

      if (nodeStyle instanceof BpmnView.DataObjectNodeStyle) {
        dataObjectTypeBox.selectedIndex = getIndex(
          dataObjectTypeBox,
          yfiles.lang.Enum.getName(BpmnView.DataObjectType.$class, nodeStyle.type)
        )
        dataObjectCollectionCheckBox.checked = nodeStyle.collection
      }

      if (nodeStyle instanceof BpmnView.PoolNodeStyle) {
        poolMultipleCheckBox.checked = nodeStyle.multipleInstance
      }
    } else if (yfiles.graph.IEdge.isInstance(item)) {
      const edgeStyle = item.style

      if (edgeStyle instanceof BpmnView.BpmnEdgeStyle) {
        edgeTypeBox.selectedIndex = getIndex(
          edgeTypeBox,
          yfiles.lang.Enum.getName(BpmnView.EdgeType.$class, edgeStyle.type)
        )
      }
    } else if (yfiles.graph.IPort.isInstance(item)) {
      const portStyle = item.style
      if (portStyle instanceof BpmnView.EventPortStyle) {
        portEventTypeBox.selectedIndex = getIndex(
          portEventTypeBox,
          yfiles.lang.Enum.getName(BpmnView.EventType.$class, portStyle.type)
        )
        portEventCharacteristicBox.selectedIndex = getIndex(
          portEventCharacteristicBox,
          yfiles.lang.Enum.getName(BpmnView.EventCharacteristic.$class, portStyle.characteristic)
        )
      }
    }
  }

  /**
   * Finds the index of the given text inside the combo box. If the text is not contained in the combo box, the result
   * is -1.
   * @param {HTMLElement} comboBox
   * @param {string] text
   * @return {number}
   */
  function getIndex(comboBox, text) {
    for (let i = 0; i < comboBox.options.length; i++) {
      if (comboBox.options[i].value === text) {
        return i
      }
    }
    return -1
  }

  /**
   * Hides the active popup by resetting its current item.
   */
  function hidePropertyPopup() {
    if (activePopup) {
      activePopup.currentItem = null
      activePopup = null
    }
  }

  /**
   * Updates an open popup or closes the popup if the respective item was removed.
   */
  function updatePopupState() {
    if (!activePopup) {
      return
    }
    const item = activePopup.currentItem
    if (graphComponent.graph.contains(item)) {
      showPropertyPopup(item)
    } else {
      hidePropertyPopup()
    }
  }

  /**
   * Set the value of the check box to the according node style property
   * @param {HTMLElement} checkBox
   * @param {function(yfiles.graph.INode, string)} setter
   */
  function setNodeCheckBoxValue(checkBox, setter) {
    if (!activePopup || !activePopup.currentItem) {
      return
    }
    const node = activePopup.currentItem
    graphComponent.graph.setStyle(node, node.style.clone())
    setter(node, checkBox.checked)
    graphComponent.invalidate()
  }

  /**
   * Sets the value of the combo box to the according node style property.
   * @param {object} enumType
   * @param {HTMLElement} comboBox
   * @param {function(yfiles.graph.INode, string)} setter
   */
  function setNodeComboBoxValue(enumType, comboBox, setter) {
    if (!activePopup || !activePopup.currentItem) {
      return
    }
    const node = activePopup.currentItem
    graphComponent.graph.setStyle(node, node.style.clone())
    const value = yfiles.lang.Enum.parse(enumType, comboBox.options[comboBox.selectedIndex].value)
    setter(node, value)
    graphComponent.invalidate()
  }

  /**
   * Sets the value of the combo box to the according port style property.
   * @param {object} enumType
   * @param {HTMLElement} comboBox
   * @param {function(yfiles.graph.INode, string)} setter
   */
  function setPortComboBoxValue(enumType, comboBox, setter) {
    if (!activePopup || !activePopup.currentItem) {
      return
    }
    const port = activePopup.currentItem
    graphComponent.graph.setStyle(port, port.style.clone())
    const value = yfiles.lang.Enum.parse(enumType, comboBox.options[comboBox.selectedIndex].value)
    setter(port, value)
    graphComponent.invalidate()
  }

  function setEdgeType() {
    // use the specified setter to set the value of the check box to the according node style property
    if (!activePopup || !activePopup.currentItem) {
      return
    }
    const edge = activePopup.currentItem
    graphComponent.graph.setStyle(edge, edge.style.clone())
    edge.style.type = yfiles.lang.Enum.parse(
      BpmnView.EdgeType.$class,
      edgeTypeBox.options[edgeTypeBox.selectedIndex].value
    )
    graphComponent.invalidate()
  }

  /**
   * Custom {@link yfiles.input.NodeDropInputMode} that disallows to create a table node inside of a group node
   * (especially inside of another table node).
   * @extends yfiles.input.NodeDropInputMode
   */
  class NoNestedTablesDropInputMode extends yfiles.input.NodeDropInputMode {
    /**
     * @param {yfiles.geometry.Point} dragLocation
     * @return {yfiles.graph.IModelItem}
     */
    getDropTarget(dragLocation) {
      // Ok, this node has a table associated -> disallow dragging it into a group node.
      if (this.draggedItem.lookup(yfiles.graph.ITable.$class)) {
        return null
      }
      return super.getDropTarget(dragLocation)
    }
  }

  /**
   * Custom {@link yfiles.input.ReparentNodeHandler} that disallows reparenting a table node.
   * @extends yfiles.input.ReparentNodeHandler
   */
  class NoTableReparentNodeHandler extends yfiles.input.ReparentNodeHandler {
    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.graph.INode} node
     * @param {yfiles.graph.INode} newParent
     * @return {boolean}
     */
    isValidParent(context, node, newParent) {
      // table nodes shall not become child nodes
      return (
        !node.lookup(yfiles.graph.ITable.$class) && super.isValidParent(context, node, newParent)
      )
    }
  }

  /**
   * Creates and configures nodes that will be displayed in the style panel to be dragged to the graph component.
   * @return {yfiles.graph.INode[]}
   */
  function createStylePanelNodes() {
    // Create a new Graph in which the palette nodes live
    const nodeContainer = new yfiles.graph.DefaultGraph()

    // Create the sample node for the pool
    const poolNodeStyle = new BpmnView.PoolNodeStyle(false)
    const poolNode = nodeContainer.createNodeAt(yfiles.geometry.Point.ORIGIN, poolNodeStyle)
    const poolTable = poolNodeStyle.tableNodeStyle.table
    poolTable.columnDefaults.insets = yfiles.geometry.Insets.EMPTY
    poolTable.createGrid(1, 1)
    // Use twice the default width for this sample column (looks nicer in the preview...)
    poolTable.setSize(
      poolTable.rootColumn.childColumns.first(),
      poolTable.rootColumn.childColumns.first().actualSize * 2
    )
    nodeContainer.setNodeLayout(poolNode, poolTable.layout.toRect())
    nodeContainer.addLabel(poolNode, 'Pool', BpmnView.PoolHeaderLabelModel.WEST)

    const rowPoolNodeStyle = new BpmnView.PoolNodeStyle(false)
    const rowNode = nodeContainer.createNodeAt(yfiles.geometry.Point.ORIGIN, rowPoolNodeStyle)
    const rowTable = rowNode.lookup(yfiles.graph.ITable.$class)
    const rowSampleRow = rowTable.createRow(100)
    const rowSampleColumn = rowTable.createColumn({
      width: 200,
      style: yfiles.styles.VoidStripeStyle.INSTANCE
    })
    rowTable.setStripeInsets(rowSampleColumn, yfiles.geometry.Insets.EMPTY)
    rowTable.insets = yfiles.geometry.Insets.EMPTY
    rowTable.addLabel(rowSampleRow, 'Row')
    nodeContainer.setNodeLayout(rowNode, rowTable.layout.toRect())
    // Set the first row as tag so the NodeDragComponent knows that a row and not a complete pool node shall be
    // dragged
    rowNode.tag = rowTable.rootRow.childRows.first()

    // Add BPMN sample nodes
    nodeContainer.createNode(
      new yfiles.geometry.Rect(yfiles.geometry.Point.ORIGIN, new yfiles.geometry.Size(80, 50)),
      new BpmnView.ActivityNodeStyle(),
      'GroupNode'
    )
    nodeContainer.createNode(
      new yfiles.geometry.Rect(yfiles.geometry.Point.ORIGIN, new yfiles.geometry.Size(50, 50)),
      new BpmnView.GatewayNodeStyle()
    )
    nodeContainer.createNode(
      new yfiles.geometry.Rect(yfiles.geometry.Point.ORIGIN, new yfiles.geometry.Size(50, 50)),
      new BpmnView.EventNodeStyle()
    )
    nodeContainer.createNode(
      new yfiles.geometry.Rect(yfiles.geometry.Point.ORIGIN, new yfiles.geometry.Size(80, 20)),
      new BpmnView.AnnotationNodeStyle()
    )
    nodeContainer.createNode(
      new yfiles.geometry.Rect(yfiles.geometry.Point.ORIGIN, new yfiles.geometry.Size(40, 60)),
      new BpmnView.DataObjectNodeStyle()
    )
    nodeContainer.createNode(
      new yfiles.geometry.Rect(yfiles.geometry.Point.ORIGIN, new yfiles.geometry.Size(50, 50)),
      new BpmnView.DataStoreNodeStyle()
    )
    nodeContainer.createNode(
      new yfiles.geometry.Rect(yfiles.geometry.Point.ORIGIN, new yfiles.geometry.Size(80, 60)),
      new BpmnView.GroupNodeStyle(),
      'GroupNode'
    )

    // Add a Choreography node with 2 participants
    const choreographyNodeStyle = new BpmnView.ChoreographyNodeStyle()
    choreographyNodeStyle.topParticipants.add(new BpmnView.Participant())
    choreographyNodeStyle.bottomParticipants.add(new BpmnView.Participant())
    const choreographyNode = nodeContainer.createNode(
      new yfiles.geometry.Rect(0, 0, 80, 90),
      choreographyNodeStyle,
      'GroupNode'
    )
    nodeContainer.addLabel(
      choreographyNode,
      'Participant 1',
      new BpmnView.ChoreographyLabelModel().createParticipantParameter(true, 0)
    )
    nodeContainer.addLabel(
      choreographyNode,
      'Participant 2',
      new BpmnView.ChoreographyLabelModel().createParticipantParameter(false, 0)
    )

    const conversationNodeStyle = new BpmnView.ConversationNodeStyle()
    conversationNodeStyle.type = BpmnView.ConversationType.CONVERSATION
    nodeContainer.createNode(
      new yfiles.geometry.Rect(0, 0, 50, 43.30127018922193),
      conversationNodeStyle
    )

    return nodeContainer.nodes.toArray()
  }

  /**
   * Returns a list containing all values of the given enum type.
   * @param {object} enumType
   * @return {yfiles.collections.IEnumerable.<string>}
   */
  function getEnumNames(enumType) {
    // get all numeric values of the enum type...
    const values = yfiles.lang.Enum.getValues(enumType)
    const nameList = new yfiles.collections.List()
    let i
    for (i = 0; i < values.length; i++) {
      const value = values[i]
      // ... convert the numeric value in the enum value name and add it to the list of enum value names
      nameList.insert(0, yfiles.lang.Enum.getName(enumType, value))
    }
    return nameList
  }

  const parameters = [
    yfiles.graph.InteriorLabelModel.CENTER,
    yfiles.graph.ExteriorLabelModel.EAST,
    yfiles.graph.ExteriorLabelModel.NORTH,
    yfiles.graph.ExteriorLabelModel.WEST,
    yfiles.graph.ExteriorLabelModel.SOUTH,
    yfiles.graph.ExteriorLabelModel.NORTH_EAST,
    yfiles.graph.ExteriorLabelModel.NORTH_WEST,
    yfiles.graph.ExteriorLabelModel.SOUTH_EAST,
    yfiles.graph.ExteriorLabelModel.SOUTH_WEST
  ]

  /**
   * This class customizes the label editing for nodes that consist of more than one labels. The first label is
   * placed in the center of the node, while the others according to the parameters defined by the
   * yfiles.graph.ExteriorLabelModel.
   */
  class AdditionalEditLabelHelper extends yfiles.input.EditLabelHelper {
    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.graph.ILabelOwner} owner
     * @return {*|yfiles.graph.ILabelModelParameter}
     */
    getLabelParameter(context, owner) {
      if (owner.style instanceof BpmnView.GroupNodeStyle) {
        return yfiles.graph.InteriorLabelModel.NORTH
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
      return validParameters[0] || yfiles.graph.InteriorLabelModel.CENTER
    }
  }

  // start the demo
  run()
})
