/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
  'utils/DndPanel',
  'FlowchartLayout.js',
  'FlowchartLayoutData.js',
  'FlowchartStyle.js',
  'resources/FlowchartData.js',
  'yfiles/view-graphml',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DndPanel,
  FlowchartLayout,
  FlowchartLayoutData,
  Style,
  FlowchartData
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    configureInputModes()
    initializeDnDPanel()
    initializeGraph()

    registerCommands()
    app.show(graphComponent)
  }

  function runLayout() {
    setUIDisabled(true)

    const allowFlatwiseEdges = document.getElementById('allow-flatwise-edges').checked

    const flowchartLayout = new FlowchartLayout()
    flowchartLayout.allowFlatwiseEdges = allowFlatwiseEdges

    const flowchartLayoutData = new FlowchartLayoutData()
    flowchartLayoutData.preferredPositiveBranchDirection = getBranchDirection(true)
    flowchartLayoutData.preferredNegativeBranchDirection = getBranchDirection(false)
    flowchartLayoutData.inEdgeGrouping = getInEdgeGroupingStyle()
    graphComponent
      .morphLayout(
        new yfiles.layout.MinimumNodeSizeStage(flowchartLayout),
        '0.5s',
        flowchartLayoutData
      )
      .then(() => {
        setUIDisabled(false)
      })
      .catch(error => {
        setUIDisabled(false)
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * @param {boolean} positive
   */
  function getBranchDirection(positive) {
    const select = positive
      ? document.getElementById('select-positive-branch-direction')
      : document.getElementById('select-negative-branch-direction')
    switch (select.selectedIndex) {
      default:
        return FlowchartLayout.DIRECTION_UNDEFINED
      case 0:
        return FlowchartLayout.DIRECTION_WITH_THE_FLOW
      case 1:
        return FlowchartLayout.DIRECTION_FLATWISE
      case 2:
        return FlowchartLayout.DIRECTION_LEFT_IN_FLOW
      case 3:
        return FlowchartLayout.DIRECTION_RIGHT_IN_FLOW
    }
  }

  function getInEdgeGroupingStyle() {
    const select = document.getElementById('select-in-edge-grouping')
    switch (select.selectedIndex) {
      default:
      case 0:
        return 'none'
      case 1:
        return 'all'
      case 2:
        return 'optimized'
    }
  }

  /**
   * Configures the input mode for the given graphComponent.
   */
  function configureInputModes() {
    // configure snapping
    const snapContext = new yfiles.input.GraphSnapContext({
      nodeToNodeDistance: 30,
      nodeToEdgeDistance: 20,
      snapOrthogonalMovement: false,
      snapDistance: 10,
      snapSegmentsToSnapLines: true,
      snapBendsToSnapLines: true,
      gridSnapType: yfiles.input.GridSnapTypes.ALL
    })

    const mode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true,
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      orthogonalBendRemoval: yfiles.input.OrthogonalEdgeEditingPolicy.ALWAYS,
      snapContext
    })
    mode.createEdgeInputMode.orthogonalEdgeCreation =
      yfiles.input.OrthogonalEdgeEditingPolicy.ALWAYS

    // enable drag an drop for elements in the palette
    const nodeDropInputMode = new yfiles.input.NodeDropInputMode()
    nodeDropInputMode.showPreview = true
    nodeDropInputMode.enabled = true
    mode.nodeDropInputMode = nodeDropInputMode

    graphComponent.inputMode = mode
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

    // create a nodes with each style
    const nodeStyles = [
      'process',
      'decision',
      'start1',
      'start2',
      'terminator',
      'cloud',
      'data',
      'directData',
      'database',
      'document',
      'predefinedProcess',
      'storedData',
      'internalStorage',
      'sequentialData',
      'manualInput',
      'card',
      'paperType',
      'delay',
      'display',
      'manualOperation',
      'preparation',
      'loopLimit',
      'loopLimitEnd',
      'onPageReference',
      'offPageReference',
      'annotation',
      'userMessage',
      'networkMessage'
    ]

    nodeStyles.forEach(type => {
      const node = new yfiles.graph.SimpleNode()
      node.layout = new yfiles.geometry.Rect(0, 0, 80, 40)
      node.style = new Style.FlowchartNodeStyle(type)
      nodeContainer.push(node)
    })

    return nodeContainer
  }

  /**
   * Initializes defaults for the graph and loads an initial sample.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    graph.nodeDefaults.style = new Style.FlowchartNodeStyle('start1')
    graph.nodeDefaults.size = new yfiles.geometry.Size(80, 40)
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      horizontalTextAlignment: yfiles.view.HorizontalTextAlignment.CENTER
    })
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.FreeNodeLabelModel.INSTANCE.createDefaultParameter()

    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      targetArrow: yfiles.styles.IArrow.DEFAULT,
      smoothingLength: 20
    })
    graph.edgeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      horizontalTextAlignment: yfiles.view.HorizontalTextAlignment.CENTER
    })
    graph.edgeDefaults.labels.layoutParameter = yfiles.graph.FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

    graph.groupNodeDefaults.style = new yfiles.styles.PanelNodeStyle({
      color: 'rgb(214, 229, 248)',
      insets: [20, 15, 15, 15],
      labelInsetsColor: 'rgb(214, 229, 248)'
    })

    graph.groupNodeDefaults.labels.layoutParameter = yfiles.graph.InteriorStretchLabelModel.NORTH

    loadGraph('ProblemSolving')
  }

  /**
   * Loads a sample graph from data according to the given sample name.
   * @yjs:keep=nodeList,edgeList
   * @param {string} sampleName
   */
  function loadGraph(sampleName) {
    const sample =
      FlowchartData[sampleName.replace('Sample: ', '').replace(' ', '')] ||
      FlowchartData.ProblemSolving

    // initialize graph builder
    const builder = new yfiles.binding.GraphBuilder(graphComponent.graph)
    builder.nodesSource = sample.nodes
    builder.nodeIdBinding = 'id'
    builder.nodeLabelBinding = tag => tag.label || null
    builder.edgesSource = sample.edges
    builder.sourceNodeBinding = 'from'
    builder.targetNodeBinding = 'to'
    builder.edgeLabelBinding = tag => tag.label || null

    // create graph
    graphComponent.graph = builder.buildGraph()

    // update node styles and sizes according to node types.
    graphComponent.graph.nodes.forEach(node => {
      graphComponent.graph.setStyle(node, new Style.FlowchartNodeStyle(node.tag.type))
      if (node.tag.type === 'decision') {
        graphComponent.graph.setNodeLayout(
          node,
          yfiles.geometry.Rect.fromCenter(
            yfiles.geometry.Point.ORIGIN,
            new yfiles.geometry.Size(145, 100)
          )
        )
      } else {
        graphComponent.graph.setNodeLayout(
          node,
          yfiles.geometry.Rect.fromCenter(
            yfiles.geometry.Point.ORIGIN,
            new yfiles.geometry.Size(145, 60)
          )
        )
      }
    })

    // apply layout
    runLayout()
  }

  /**
   * Wires up UI-elements.
   */
  function registerCommands() {
    const graphmlHandler = new yfiles.graphml.GraphMLIOHandler()
    graphmlHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      Style
    )
    graphmlHandler.addNamespace(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      'demostyle'
    )
    graphmlHandler.addHandleSerializationListener(Style.FlowchartSerializationListener)

    new yfiles.graphml.GraphMLSupport({
      graphComponent,
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM,
      graphMLIOHandler: graphmlHandler
    })

    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    const select = document.getElementById('select-sample')
    app.bindChangeListener("select[data-command='SelectSample']", () => {
      updateGraph()
    })

    app.bindAction("button[data-command='PreviousSample']", () => {
      select.selectedIndex = Math.max(0, select.selectedIndex - 1)
      updateGraph()
    })
    app.bindAction("button[data-command='NextSample']", () => {
      select.selectedIndex = Math.min(select.selectedIndex + 1, select.options.length - 1)
      updateGraph()
    })

    app.bindAction("button[data-command='Layout']", runLayout)
  }

  /**
   * Loads the selected graph and applies a flowchart layout.
   */
  function updateGraph() {
    const select = document.getElementById('select-sample')
    const allowFlatwiseEdges = document.getElementById('allow-flatwise-edges')

    // initial settings for the selected sample
    switch (select.selectedIndex) {
      default:
      case 0:
        app.setComboboxValue('select-positive-branch-direction', 'Undefined')
        app.setComboboxValue('select-negative-branch-direction', 'Undefined')
        app.setComboboxValue('select-in-edge-grouping', 'Optimized')
        allowFlatwiseEdges.checked = true
        break
      case 1:
        app.setComboboxValue('select-positive-branch-direction', 'Same As Flow')
        app.setComboboxValue('select-negative-branch-direction', 'Left In Flow')
        app.setComboboxValue('select-in-edge-grouping', 'Optimized')
        allowFlatwiseEdges.checked = true
        break
      case 2:
        app.setComboboxValue('select-positive-branch-direction', 'Same As Flow')
        app.setComboboxValue('select-negative-branch-direction', 'Flatwise')
        app.setComboboxValue('select-in-edge-grouping', 'Optimized')
        allowFlatwiseEdges.checked = true
        break
      case 3:
        app.setComboboxValue('select-positive-branch-direction', 'Same As Flow')
        app.setComboboxValue('select-negative-branch-direction', 'Flatwise')
        app.setComboboxValue('select-in-edge-grouping', 'Optimized')
        allowFlatwiseEdges.checked = true
        break
      case 4:
        app.setComboboxValue('select-positive-branch-direction', 'Flatwise')
        app.setComboboxValue('select-negative-branch-direction', 'Flatwise')
        app.setComboboxValue('select-in-edge-grouping', 'None')
        allowFlatwiseEdges.checked = false
        break
    }

    loadGraph(select.value)
  }

  /**
   * Enables/disabled the toolbar elements and the input mode.
   * @param {boolean} disabled <code>true</code> if the ui should be disabled, <code>false</code> otherwise.
   */
  function setUIDisabled(disabled) {
    // keep the enabled state for the next/previous button when enabling the ui
    const selectSample = document.getElementById('select-sample')
    selectSample.disabled = disabled
    document.getElementById('previous-sample').disabled =
      disabled || selectSample.selectedIndex === 0
    document.getElementById('next-sample').disabled =
      disabled || selectSample.selectedIndex === selectSample.options.length - 1
    document.getElementById('select-positive-branch-direction').disabled = disabled
    document.getElementById('select-negative-branch-direction').disabled = disabled
    document.getElementById('select-in-edge-grouping').disabled = disabled
    document.getElementById('allow-flatwise-edges').disabled = disabled
    document.getElementById('layout').disabled = disabled
  }

  run()
})
