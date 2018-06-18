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
  './DemoStyles.js',
  './LogicGatesHelper.js',
  'utils/DndPanel',
  'yfiles/layout-hierarchic',
  'yfiles/router-polyline',
  'yfiles/view-layout-bridge',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  LogicGatesHelper,
  DndPanel
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // initialize the drag and drop panel
    initializeDnDPanel()

    // initialize the default styles
    initializeGraph()

    // create the input mode for this demo
    createInputMode()

    // create the sample graph
    createSampleGraph()

    // wire up the UI
    registerCommands()

    // show the demo
    app.show(graphComponent)
  }

  /**
   * Initializes the drag and drop panel.
   */
  function initializeDnDPanel() {
    const dndPanel = new DndPanel.DragAndDropPanel(
      document.getElementById('dndPanel'),
      app.passiveSupported
    )
    // Set the callback that starts the actual drag and drop operation
    dndPanel.beginDragCallback = (element, data) => {
      const dragPreview = element.cloneNode(true)
      dragPreview.style.margin = '0'
      const dragSource = yfiles.input.NodeDropInputMode.startDrag(
        element,
        data,
        yfiles.view.DragDropEffects.ALL,
        true,
        app.pointerEventsSupported ? dragPreview : null
      )
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          app.removeClass(dragPreview, 'hidden')
        } else {
          app.addClass(dragPreview, 'hidden')
        }
      })
    }
    dndPanel.maxItemWidth = 160
    dndPanel.populatePanel(createDnDPanelNodes)
  }

  /**
   * Creates the nodes that provide the visualizations for the style panel.
   * @return {yfiles.graph.SimpleNode[]}
   */
  function createDnDPanelNodes() {
    const nodeContainer = []

    // Create some nodes with different styles
    const nodeStyles = [
      new DemoStyles.AndGateNodeStyle(),
      new DemoStyles.AndGateNodeStyle(true),
      new DemoStyles.NotNodeStyle(),
      new DemoStyles.OrNodeStyle(),
      new DemoStyles.OrNodeStyle(true),
      new DemoStyles.XOrNodeStyle(),
      new DemoStyles.XOrNodeStyle(true)
    ]

    nodeStyles.forEach(style => {
      const node = new yfiles.graph.SimpleNode()
      node.layout = new yfiles.geometry.Rect(0, 0, 100, 50)
      node.style = style
      nodeContainer.push(node)
    })

    // create the port descriptor for the nodes
    createPortDescriptors(nodeContainer)

    return nodeContainer
  }

  /**
   * Initialize the graph's default styles and more settings.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    graph.nodeDefaults.style = new DemoStyles.AndGateNodeStyle()
    graph.nodeDefaults.size = new yfiles.geometry.Size(100, 50)

    // don't delete ports a removed edge was connected to
    graph.nodeDefaults.ports.autoCleanUp = false

    // set the port candidate provider
    graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
      node => new LogicGatesHelper.DescriptorDependentPortCandidateProvider(node)
    )
    graph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
      yfiles.input.IEdgeReconnectionPortCandidateProvider.ALL_NODE_CANDIDATES
    )

    // enable the undo engine
    graph.undoEngineEnabled = true

    // add a listener to add the tags related to the highlighting to the new nodes
    graph.addNodeCreatedListener((sender, args) => {
      args.item.tag = {
        sourceHighlight: false,
        targetHighlight: false
      }
    })

    // disable edge cropping
    graph.decorator.portDecorator.edgePathCropperDecorator.hideImplementation()
  }

  /**
   * Creates the input mode.
   */
  function createInputMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      // Enable orthogonal edge editing
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      // enable snapping for easier orthogonal edge editing
      snapContext: new yfiles.input.GraphSnapContext({
        enabled: true
      }),
      // don't allow nodes to be created using a mouse click
      allowCreateNode: false,
      // disable node resizing
      showHandleItems: yfiles.graph.GraphItemTypes.ALL & ~yfiles.graph.GraphItemTypes.NODE
    })

    // we want to get reports of the mouse being hovered over nodes and edges
    // first enable queries
    mode.itemHoverInputMode.enabled = true

    // set the items to be reported
    mode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.NODE
    // if there are other items (most importantly labels) in front of edges or nodes
    // they should be discarded, rather than be reported as "null"
    mode.itemHoverInputMode.discardInvalidItems = false
    // whenever the currently hovered item changes call our method
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
      const item = args.item
      const oldItem = args.oldItem
      if (oldItem && yfiles.graph.INode.isInstance(oldItem)) {
        oldItem.tag.sourceHighlight = false
        oldItem.tag.targetHighlight = false
      }

      if (item && yfiles.graph.INode.isInstance(item)) {
        item.tag.sourceHighlight = true
        item.tag.targetHighlight = true
      }
      graphComponent.invalidate()
    })

    // create a new NodeDropInputMode to configure the drag and drop operation
    const nodeDropInputMode = new yfiles.input.NodeDropInputMode()
    // enables the display of the dragged element during the drag
    nodeDropInputMode.showPreview = true
    // by default the mode available in GraphEditorInputMode is disabled, so first enable it
    nodeDropInputMode.enabled = true
    mode.nodeDropInputMode = nodeDropInputMode

    const originalNodeCreator = mode.nodeDropInputMode.itemCreator
    mode.nodeDropInputMode.itemCreator = (context, graph, draggedNode, dropTarget, point) => {
      if (draggedNode) {
        const modelItem = new yfiles.graph.SimpleNode()
        modelItem.style = draggedNode.style
        modelItem.layout = draggedNode.layout

        const newNode = originalNodeCreator(context, graph, modelItem, dropTarget, point)
        // copy the ports
        draggedNode.ports.forEach(port => {
          graph.addPort(newNode, port.locationParameter, port.style, port.tag)
        })
        return newNode
      }
      // fallback
      return originalNodeCreator(context, graph, draggedNode, dropTarget, point)
    }

    graphComponent.inputMode = mode
  }

  /**
   * Applies the selected layout algorithm.
   * @param {boolean} clearUndo True if the undo engine should be cleared, false otherwise
   */
  function runLayout(clearUndo) {
    const selectedIndex = document.getElementById('algorithm-select-box').selectedIndex
    let layout
    let layoutData
    if (selectedIndex === 0) {
      layout = new yfiles.hierarchic.HierarchicLayout()
      layout.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
      layout.orthogonalRouting = true
      layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    } else {
      layout = new yfiles.router.EdgeRouter()
      layoutData = new yfiles.router.PolylineEdgeRouterData()
    }
    setUIDisabled(true)

    layoutData.sourcePortConstraints.delegate = edge =>
      yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.EAST, true)
    layoutData.targetPortConstraints.delegate = edge =>
      yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.WEST, true)

    graphComponent
      .morphLayout(layout, '1s', layoutData)
      .then(() => {
        graphComponent.fitGraphBounds()
        setUIDisabled(false)
        if (clearUndo) {
          graphComponent.graph.undoEngine.clear()
        }
      })
      .catch(error => {
        setUIDisabled(false)
        if (clearUndo) {
          graphComponent.graph.undoEngine.clear()
        }
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Disables the HTML elements of the UI and the input mode.
   *
   * @param disabled true if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('algorithm-select-box').disabled = disabled
    document.getElementById('layoutButton').disabled = disabled
    graphComponent.inputMode.waiting = disabled
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent)

    app.bindChangeListener("select[data-command='AlgorithmSelectionChanged']", runLayout)
    app.bindAction("button[data-command='Layout']", runLayout)
  }

  /**
   * Creates the sample graph for this demo.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph

    const node1 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle(true) })
    const node2 = graph.createNode({ style: new DemoStyles.NotNodeStyle() })
    const node3 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle(true) })
    const node4 = graph.createNode({ style: new DemoStyles.NotNodeStyle() })
    const node5 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle(true) })

    const node6 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle() })
    const node7 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle(true) })
    const node8 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle() })

    const node9 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle() })
    const node10 = graph.createNode({ style: new DemoStyles.NotNodeStyle() })

    const node11 = graph.createNode({ style: new DemoStyles.AndGateNodeStyle() })
    const node12 = graph.createNode({ style: new DemoStyles.NotNodeStyle() })

    // create the port descriptors for the graph nodes
    createPortDescriptors(graph.nodes, graph)

    // create the edges
    const node1Ports = node1.ports.toArray()
    const node2Ports = node2.ports.toArray()
    const node3Ports = node3.ports.toArray()
    const node4Ports = node4.ports.toArray()
    const node5Ports = node5.ports.toArray()
    const node6Ports = node6.ports.toArray()
    const node7Ports = node7.ports.toArray()
    const node8Ports = node8.ports.toArray()
    const node9Ports = node9.ports.toArray()
    const node10Ports = node10.ports.toArray()
    const node11Ports = node11.ports.toArray()
    const node12Ports = node12.ports.toArray()
    graph.createEdge(node1Ports[0], node6Ports[1])
    graph.createEdge(node2Ports[0], node6Ports[2])
    graph.createEdge(node2Ports[0], node7Ports[1])
    graph.createEdge(node3Ports[0], node7Ports[2])
    graph.createEdge(node4Ports[0], node8Ports[1])
    graph.createEdge(node5Ports[0], node8Ports[2])
    graph.createEdge(node6Ports[0], node9Ports[1])
    graph.createEdge(node7Ports[0], node9Ports[2])
    graph.createEdge(node8Ports[0], node10Ports[1])
    graph.createEdge(node9Ports[0], node11Ports[1])
    graph.createEdge(node10Ports[0], node11Ports[2])
    graph.createEdge(node10Ports[0], node12Ports[1])

    // run the layout
    runLayout(true)
  }

  /**
   * Creates the port descriptors for the given graph.
   * @param {Array} nodes The nodes of the drag and drop panel
   * @param {yfiles.graph.IGraph} graph The given graph
   */
  function createPortDescriptors(nodes, graph) {
    nodes.forEach(node => {
      const portDescriptors = LogicGatesHelper.PortDescriptor.createPortDescriptors(node)
      const model = new yfiles.graph.FreeNodePortLocationModel()
      const ports = []

      // iterate through all descriptors and add their ports, using the descriptor as the tag for the port
      portDescriptors.forEach(descriptor => {
        // use the descriptor's location as offset
        const portLocationModelParameter = model.createParameter(
          node,
          new yfiles.geometry.Point(descriptor.x, descriptor.y)
        )
        const port = graph
          ? graph.addPort(node, portLocationModelParameter)
          : new yfiles.graph.SimplePort(node, portLocationModelParameter)
        port.tag = descriptor
        if (!graph) {
          ports.push(port)
        }
      })

      if (!graph) {
        node.ports = new yfiles.collections.ListEnumerable(
          new yfiles.collections.List(yfiles.collections.List.fromArray(ports))
        )
      }
    })
  }

  // run the demo
  run()
})
