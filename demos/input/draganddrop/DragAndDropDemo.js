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
  'resources/demo-styles',
  'utils/DndPanel',
  './NativeDragAndDropPanel.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  DragAndDropPanel,
  NativeDragAndDropPanel
) => {
  /**
   * The panel containing the palette of elements to drop onto the graph component using yFiles drag and drop.
   * @type {NativeDragAndDropPanel}
   */
  let nativeDragAndDropPanel = null

  /**
   * The panel containing the palette of elements to drop onto the graph component using native drag and drop.
   * @type {DragAndDropPanel}
   */
  let dragAndDropPanel = null

  /**
   *  This demo shows how to enable drag and drop functionality for nodes using class
   *  {@link yfiles.input.NodeDropInputMode}.
   */
  function run() {
    // initialize the GraphComponent
    const graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph

    // configure the input mode
    configureInputModes(graphComponent)

    // initialize the drag and drop panel
    initializeDnDPanel(graphComponent)

    // enable the undo engine
    graph.undoEngineEnabled = true

    // init demo styles
    DemoStyles.initDemoStyles(graph)
    const portStyle = new yfiles.styles.NodeStylePortStyleAdapter(
      new yfiles.styles.ShapeNodeStyle({
        fill: 'darkblue',
        stroke: 'cornflowerblue',
        shape: 'ellipse'
      })
    )
    const labelStyle = new yfiles.styles.NodeStyleLabelStyleAdapter({
      labelStyle: new yfiles.styles.DefaultLabelStyle(),
      labelStyleInsets: [3, 5, 3, 5],
      nodeStyle: new yfiles.styles.ShapeNodeStyle({
        stroke: 'rgb(101, 152, 204)',
        fill: 'white'
      })
    })

    graph.nodeDefaults.size = new yfiles.geometry.Size(60, 40)
    graph.nodeDefaults.ports.style = portStyle
    graph.nodeDefaults.labels.style = labelStyle
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.FreeNodeLabelModel.INSTANCE.createDefaultParameter()
    graph.edgeDefaults.ports.style = portStyle
    graph.edgeDefaults.labels.style = labelStyle
    graph.edgeDefaults.labels.layoutParameter = yfiles.graph.FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

    // add initial graph
    createSampleGraph(graphComponent)

    // bind toolbar commands
    registerCommands(graphComponent)
    updateDisabledIndicator()

    app.show(graphComponent)
  }

  /**
   * Initializes the drag and drop panel.
   * @param {yfiles.view.GraphComponent} graphComponent
   */
  function initializeDnDPanel(graphComponent) {
    // initialize panel for native drag and drop
    nativeDragAndDropPanel = new NativeDragAndDropPanel(
      document.getElementById('nativeDndPanel'),
      graphComponent
    )
    nativeDragAndDropPanel.populatePanel(() => createDnDPanelNodes(true))

    // initialize panel for yFiles drag and drop
    dragAndDropPanel = new DragAndDropPanel.DragAndDropPanel(
      document.getElementById('dndPanel'),
      app.passiveSupported
    )
    // Set the callback that starts the actual drag and drop operation
    dragAndDropPanel.beginDragCallback = (element, data) => {
      const dragPreview = element.cloneNode(true)
      dragPreview.style.margin = '0'
      let dragSource
      if (yfiles.graph.ILabel.isInstance(data)) {
        dragSource = yfiles.input.LabelDropInputMode.startDrag(
          element,
          data,
          yfiles.view.DragDropEffects.ALL,
          true,
          dragPreview
        )
      } else if (yfiles.graph.IPort.isInstance(data)) {
        dragSource = yfiles.input.PortDropInputMode.startDrag(
          element,
          data,
          yfiles.view.DragDropEffects.ALL,
          true,
          dragPreview
        )
      } else {
        dragSource = yfiles.input.NodeDropInputMode.startDrag(
          element,
          data,
          yfiles.view.DragDropEffects.ALL,
          true,
          dragPreview
        )
      }

      // let the GraphComponent handle the preview rendering if possible
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          app.removeClass(dragPreview, 'hidden')
        } else {
          app.addClass(dragPreview, 'hidden')
        }
      })
    }

    dragAndDropPanel.maxItemWidth = 160
    dragAndDropPanel.populatePanel(createDnDPanelNodes)
  }

  /**
   * Creates the nodes that provide the visualizations for the style panel.
   * @param {boolean} native
   * @return {yfiles.graph.INode[]}
   */
  function createDnDPanelNodes(native) {
    const nodeContainer = []

    // Create some nodes
    const groupNodeStyle = new DemoStyles.DemoGroupStyle()

    // A label model with insets for the expand/collapse button
    const groupLabelModel = new yfiles.graph.InteriorStretchLabelModel({ insets: 4 })

    const groupLabelStyle = new yfiles.styles.DefaultLabelStyle({
      textFill: 'white'
    })

    const groupNode = new yfiles.graph.SimpleNode()
    groupNode.layout = new yfiles.geometry.Rect(0, 0, 80, 80)
    groupNode.style = groupNodeStyle
    const groupLabel = new yfiles.graph.SimpleLabel(
      groupNode,
      'Group Node',
      groupLabelModel.createParameter(yfiles.graph.InteriorStretchLabelModelPosition.NORTH)
    )
    groupLabel.style = groupLabelStyle
    groupNode.labels = new yfiles.collections.ListEnumerable([groupLabel])
    nodeContainer.push({ element: groupNode, tooltip: 'Group Node' })

    const demoStyleNode = new yfiles.graph.SimpleNode()
    demoStyleNode.layout = new yfiles.geometry.Rect(0, 0, 60, 40)
    demoStyleNode.style = new DemoStyles.DemoNodeStyle()
    nodeContainer.push({ element: demoStyleNode, tooltip: 'Demo Node' })

    const shapeStyleNode = new yfiles.graph.SimpleNode()
    shapeStyleNode.layout = new yfiles.geometry.Rect(0, 0, 60, 40)
    shapeStyleNode.style = new yfiles.styles.ShapeNodeStyle({
      shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
      stroke: 'rgb(255, 140, 0)',
      fill: 'rgb(255, 140, 0)'
    })
    nodeContainer.push({ element: shapeStyleNode, tooltip: 'Shape Node' })

    const shinyPlateNode = new yfiles.graph.SimpleNode()
    shinyPlateNode.layout = new yfiles.geometry.Rect(0, 0, 60, 40)
    shinyPlateNode.style = new yfiles.styles.ShinyPlateNodeStyle({
      fill: 'rgb(255, 140, 0)',
      drawShadow: false
    })
    nodeContainer.push({ element: shinyPlateNode, tooltip: 'Shiny Plate Node' })

    const imageStyleNode = new yfiles.graph.SimpleNode()
    imageStyleNode.layout = new yfiles.geometry.Rect(0, 0, 60, 60)
    imageStyleNode.style = new yfiles.styles.ImageNodeStyle('resources/y.svg')
    nodeContainer.push({ element: imageStyleNode, tooltip: 'Image Node' })

    const portNode = new yfiles.graph.SimpleNode()
    portNode.layout = new yfiles.geometry.Rect(0, 0, 5, 5)
    portNode.style = new yfiles.styles.VoidNodeStyle()
    const port = new yfiles.graph.SimplePort(
      portNode,
      yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    )
    port.style = new yfiles.styles.NodeStylePortStyleAdapter(
      new yfiles.styles.ShapeNodeStyle({
        fill: 'darkblue',
        stroke: 'cornflowerblue',
        shape: 'ellipse'
      })
    )
    portNode.tag = port
    portNode.ports = new yfiles.collections.ListEnumerable([port])
    nodeContainer.push({ element: portNode, tooltip: 'Port' })

    const labelNode = new yfiles.graph.SimpleNode()
    labelNode.layout = new yfiles.geometry.Rect(0, 0, 5, 5)
    labelNode.style = new yfiles.styles.VoidNodeStyle()
    const labelStyle = new yfiles.styles.NodeStyleLabelStyleAdapter({
      labelStyle: new yfiles.styles.DefaultLabelStyle(),
      labelStyleInsets: [3, 5, 3, 5],
      nodeStyle: new yfiles.styles.ShapeNodeStyle({
        stroke: 'rgb(101, 152, 204)',
        fill: 'white'
      })
    })
    const label = new yfiles.graph.SimpleLabel(
      labelNode,
      'label',
      yfiles.graph.FreeNodeLabelModel.INSTANCE.createDefaultParameter()
    )
    label.style = labelStyle
    label.preferredSize = labelStyle.renderer.getPreferredSize(label, labelStyle)
    labelNode.tag = label
    labelNode.labels = new yfiles.collections.ListEnumerable([label])
    nodeContainer.push({ element: labelNode, tooltip: 'Label' })

    return nodeContainer
  }

  /**
   * Configures the input mode for the given graphComponent.
   * @param {yfiles.view.GraphComponent} graphComponent
   */
  function configureInputModes(graphComponent) {
    // configure the snapping context
    const mode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true,
      snapContext: new yfiles.input.GraphSnapContext({
        nodeToNodeDistance: 30,
        nodeToEdgeDistance: 20,
        snapOrthogonalMovement: false,
        snapDistance: 10,
        snapSegmentsToSnapLines: true,
        snapBendsToSnapLines: true,
        gridSnapType: yfiles.input.GridSnapTypes.ALL
      })
    })

    // create a new NodeDropInputMode to configure the drag and drop operation
    const nodeDropInputMode = new yfiles.input.NodeDropInputMode()
    // enables the display of the dragged element during the drag
    nodeDropInputMode.showPreview = true
    // initially disables snapping fo the dragged element to existing elements
    nodeDropInputMode.snappingEnabled = false
    // by default the mode available in GraphEditorInputMode is disabled, so first enable it
    nodeDropInputMode.enabled = true
    // nodes that have a DemoGroupStyle assigned have to be created as group nodes
    nodeDropInputMode.isGroupNodePredicate = draggedNode =>
      draggedNode.style instanceof DemoStyles.DemoGroupStyle
    mode.nodeDropInputMode = nodeDropInputMode

    const labelDropInputMode = new yfiles.input.LabelDropInputMode()
    labelDropInputMode.showPreview = true
    labelDropInputMode.snappingEnabled = false
    labelDropInputMode.enabled = true
    labelDropInputMode.useBestMatchingParameter = true
    // allow for nodes and edges to be the new label owner
    labelDropInputMode.isValidLabelOwnerPredicate = (labelOwner, label) =>
      yfiles.graph.INode.isInstance(labelOwner) ||
      yfiles.graph.IEdge.isInstance(labelOwner) ||
      yfiles.graph.IPort.isInstance(labelOwner)
    mode.labelDropInputMode = labelDropInputMode

    const portDropInputMode = new yfiles.input.PortDropInputMode()
    portDropInputMode.showPreview = true
    portDropInputMode.snappingEnabled = false
    portDropInputMode.enabled = true
    portDropInputMode.useBestMatchingParameter = true
    // allow only for nodes to be the new port owner
    portDropInputMode.isValidPortOwnerPredicate = (portOwner, port) =>
      yfiles.graph.INode.isInstance(portOwner)
    mode.portDropInputMode = portDropInputMode

    graphComponent.inputMode = mode
  }

  /**
   * Creates an initial sample graph.
   * @param {yfiles.view.GraphComponent} graphComponent
   */
  function createSampleGraph(graphComponent) {
    const graph = graphComponent.graph

    const node1 = graph.createNodeAt([0, 0])
    const node2 = graph.createNodeAt([-50, 80])
    const node3 = graph.createNodeAt([50, 80])
    const node4 = graph.createNode({
      layout: [25, 150, 50, 50],
      style: new yfiles.styles.ImageNodeStyle('resources/y.svg')
    })
    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)
    graph.createEdge(node3, node4)
    graph.addLabel(node4, 'label', yfiles.graph.ExteriorLabelModel.SOUTH)

    graphComponent.fitGraphBounds()
  }

  /**
   * Wires up the UI.
   * @param {yfiles.view.GraphComponent} graphComponent
   */
  function registerCommands(graphComponent) {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindChangeListener("select[data-command='FeaturesChanged']", () =>
      onFeaturesChanged(graphComponent)
    )
  }

  /**
   * Configures the NodeDropInputMode based on the selected combobox index.
   * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
   */
  function onFeaturesChanged(graphComponent) {
    const disabledIndicator = document.getElementById('disabled-indicator')
    const nodeDropInputMode = graphComponent.inputMode.nodeDropInputMode
    switch (document.getElementById('featuresComboBox').selectedIndex) {
      case 1:
        nativeDragAndDropPanel.showPreview = true
        nodeDropInputMode.snappingEnabled = true
        nodeDropInputMode.showPreview = true
        disabledIndicator.style.display = 'block'
        break
      case 2:
        nativeDragAndDropPanel.showPreview = false
        nodeDropInputMode.snappingEnabled = false
        nodeDropInputMode.showPreview = false
        disabledIndicator.style.display = 'none'
        break
      case 0:
      default:
        nativeDragAndDropPanel.showPreview = true
        nodeDropInputMode.snappingEnabled = false
        nodeDropInputMode.showPreview = true
        disabledIndicator.style.display = 'none'
        break
    }

    if (!app.nativeDragAndDropSupported) {
      disabledIndicator.style.display = 'block'
    }
  }

  function updateDisabledIndicator() {
    if (!app.nativeDragAndDropSupported) {
      const disabledIndicator = document.getElementById('disabled-indicator')
      disabledIndicator.style.display = 'block'
      const disabledMessage = document.getElementById('disabled-message')
      disabledMessage.innerText = 'Native Drag and Drop is not supported in your Browser'
    }
  }

  // Runs the demo
  run()
})
