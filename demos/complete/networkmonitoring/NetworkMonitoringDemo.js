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
  './ModelNode.js',
  './ModelEdge.js',
  './HTMLPopupSupport.js',
  './D3BarChart.js',
  './NetworkSimulator.js',
  './NetworkModel.js',
  './NetworkMonitoringEdgeStyle.js',
  './NetworkMonitoringNodeStyle.js',
  'resources/network.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  ModelNode,
  ModelEdge,
  HTMLPopupSupport,
  D3BarChart,
  NetworkSimulator,
  NetworkModel,
  NetworkMonitoringEdgeStyle,
  NetworkMonitoringNodeStyle,
  Network
) => {
  /**
   * This demo creates a network monitoring tool for dynamic data.
   * The mockup model is created and updated by class {@link NetworkSimulator}.
   */

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * The network model of the graph. It models traffic and load of the graph.
   * @type {NetworkModel}
   */
  let model = null

  /**
   * The actual simulator of the network.
   * @type {NetworkSimulator}
   */
  let simulator = null

  /**
   * Maps the network model edges to the graph control edges.
   * @type {yfiles.collections.Mapper.<ModelEdge,yfiles.graph.IEdge>}
   */
  let modelEdgeToIEdge = null

  /**
   * Maps the network model nodes to the graph control nodes.
   * @type {yfiles.collections.Mapper.<ModelNode,yfiles.graph.INode>}
   */
  let modelNodeToINode = null

  /**
   * The node popup which contains additional information of the node.
   * @type {HTMLPopupSupport}
   */
  let nodePopup = null

  /**
   * The bar chart which is displayed in the node popup.
   * @type {D3BarChart}
   */
  let barChart = null

  /**
   * Sometimes d3 is not loaded correctly. If this happens, don't show the chart at all.
   * @type {boolean}
   */
  let d3Loaded = false

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeInputMode()

    initGraphAndModel(() => {
      setupSimulator()
      graphComponent.fitGraphBounds(new yfiles.geometry.Insets(50))
      // limit scrolling to the area containing the graph
      graphComponent.viewportLimiter.honorBothDimensions = false
      graphComponent.viewportLimiter.bounds = graphComponent.contentRect
      graphComponent.maximumZoom = 3
      startSimulator()
    })

    // create a label model parameter that is used to position the node pop-up
    const nodeLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 10 })
    const nodeLabelModelParameter = nodeLabelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.NORTH
    )

    // create the pop-up content div for the node pop-up div
    const nodePopupContent = window.document.getElementById('nodePopupContent')
    nodePopup = new HTMLPopupSupport(graphComponent, nodePopupContent, nodeLabelModelParameter)

    // initialize the d3.js bar chart
    try {
      barChart = new D3BarChart()
      d3Loaded = true
    } catch (ignored) {
      d3Loaded = false
      const chart = document.getElementsByClassName('chart')[0]
      chart.setAttribute('class', 'no-chart')
    }

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Creates and configures a viewer input mode for the graphComponent of this demo.
   */
  function initializeInputMode() {
    const mode = new yfiles.input.GraphViewerInputMode({
      toolTipItems: yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.EDGE,
      clickableItems: yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.EDGE,
      focusableItems: yfiles.graph.GraphItemTypes.NONE,
      selectableItems: yfiles.graph.GraphItemTypes.NONE,
      marqueeSelectableItems: yfiles.graph.GraphItemTypes.NONE
    })

    mode.addQueryItemToolTipListener(onQueryItemToolTip)
    mode.addItemClickedListener(onItemClicked)
    mode.mouseHoverInputMode.toolTipLocationOffset = new yfiles.geometry.Point(10, 10)
    mode.addCanvasClickedListener(onClick)

    graphComponent.inputMode = mode
  }

  /**
   * Initializes the graph from the supplied GraphML file and creates the model from it.
   * While this reads the graph from a GraphML file and constructs the model from an already-finished graph, a
   * real-world application would likely create the model from whichever data source is available and then create
   * the graph from it.
   * @param {function} loadedCallback
   */
  function initGraphAndModel(loadedCallback) {
    // create an animator instance that can be used by the edge style
    const edgeAnimator = new yfiles.view.Animator(graphComponent)
    edgeAnimator.allowUserInteraction = true
    edgeAnimator.autoInvalidation = false

    // set the default node and edge styles
    const graph = new yfiles.graph.DefaultGraph()
    graph.nodeDefaults.style = new NetworkMonitoringNodeStyle(app.passiveSupported)
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.FreeNodeLabelModel.INSTANCE.createParameter(
      [0.5, 1],
      [0, -15],
      [0.5, 0]
    )
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      backgroundFill: 'rgba(255, 255, 255, 0.8)',
      horizontalTextAlignment: 'center',
      font: new yfiles.view.Font({
        lineSpacing: 0.2
      })
    })
    graph.edgeDefaults.style = new NetworkMonitoringEdgeStyle(edgeAnimator, app.passiveSupported)
    graphComponent.graph = graph

    if (Network && Network[0]) {
      loadGraph(Network[0], loadedCallback)
    }
  }

  /**
   * Shows/hides node labels.
   */
  function toggleLabels(e) {
    const graph = graphComponent.graph
    if (!e.target.checked) {
      graph.labels.toArray().forEach(label => {
        graphComponent.graph.remove(label)
      })
    } else {
      graph.nodes.forEach(node => {
        const tag = node.tag
        graph.addLabel(node, `${tag.name}\n${tag.ip}`)
      })
    }
  }

  /**
   * @param {object} data
   */
  function loadGraphCore(data) {
    const graph = graphComponent.graph
    graph.clear()

    // get the list of nodes and edges
    const nodes = data.nodeList
    const edges = data.edgeList
    // create a map to store the nodes for edge creation
    const nodeMap = new yfiles.collections.Mapper()
    // create the nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const l = n.layout
      const node = graph.createNode({
        layout: new yfiles.geometry.Rect(l.x, l.y, l.w, l.h),
        tag: n.tag
      })
      nodeMap.set(n.tag.id, node)
    }

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i]
      // get the source and target node from the mapping
      const sourceNode = nodeMap.get(e.source)
      const targetNode = nodeMap.get(e.target)
      // create the source and target port
      const sp = e.sourcePort
      const tp = e.targetPort
      const sourcePort = graph.addPortAt(sourceNode, new yfiles.geometry.Point(sp.x, sp.y))
      const targetPort = graph.addPortAt(targetNode, new yfiles.geometry.Point(tp.x, tp.y))
      // create the edge
      const edge = graph.createEdge(sourcePort, targetPort)
      // add the bends
      const bends = e.bends
      bends.forEach(bend => graph.addBend(edge, new yfiles.geometry.Point(bend.x, bend.y)))
    }
  }

  /**
   * @param {object} sampleData
   * @param {function} loadedCallBack
   */
  function loadGraph(sampleData, loadedCallBack) {
    loadGraphCore(sampleData)
    populateModel(graphComponent.graph)
    loadedCallBack()
  }

  /**
   * Populates the model and initializes the mapping based on the nodes and edges of the original IGraph.
   * @param {yfiles.graph.IGraph} graph
   */
  function populateModel(graph) {
    graph.nodes.forEach(node => {
      // Create and attach the model node to the graph node.
      const modelNode = new ModelNode()
      const tag = node.tag
      modelNode.name = tag.name
      modelNode.ip = tag.ip
      modelNode.enabled = true
      modelNode.type = tag.type
      modelNode.load = tag.load

      node.tag = modelNode
    })

    graph.edges.forEach(edge => {
      // Create and attach the model edge to the graph edge
      const modelEdge = new ModelEdge()
      modelEdge.source = edge.sourceNode.tag
      modelEdge.target = edge.targetNode.tag

      edge.tag = modelEdge
    })

    // Create the mappings from model items to graph elements.
    modelNodeToINode = new yfiles.collections.Mapper()
    graph.nodes.forEach(node => {
      modelNodeToINode.set(node.tag, node)
    })
    modelEdgeToIEdge = new yfiles.collections.Mapper()
    graph.edges.forEach(edge => {
      modelEdgeToIEdge.set(edge.tag, edge)
    })

    // Create the network model.
    model = new NetworkModel(modelNodeToINode.entries.keys, modelEdgeToIEdge.entries.keys)
  }

  /**
   * Prepares the simulator that moves packets through the network.
   */
  function setupSimulator() {
    simulator = new NetworkSimulator(model)
    simulator.addSomethingFailedListener(onNetworkFailure)
    // initialize simulator state
    for (let i = 0; i < 30; i++) {
      simulator.tick()
    }
  }

  /**
   * Starts the simulator.
   */
  function startSimulator() {
    window.setTimeout(() => {
      simulator.tick()
      // update the bar chart
      if (d3Loaded) {
        barChart.updateCurrentChart()
      }
      // redraw the graph
      graphComponent.invalidate()
      // continuously run the simulation
      startSimulator()
    }, 1500)
  }

  /**
   * Event handler for clicks on the "Enable failures" button.
   */
  function onToggleFailuresClicked() {
    if (simulator !== null) {
      simulator.failuresEnabled = document.querySelector(
        "input[data-command='ToggleFailures']"
      ).checked
    }
  }

  /**
   * Event handler for clicks on edges or nodes.
   * @param {object} sender
   * @param {yfiles.input.ItemClickedEventArgs.<IModelItem>} args
   */
  function onItemClicked(sender, args) {
    if (yfiles.graph.IEdge.isInstance(args.item)) {
      const modelEdge = args.item.tag
      if (modelEdge.failed) {
        // repair edge
        modelEdge.failed = false
        graphComponent.invalidate()
      }
    }
    if (yfiles.graph.INode.isInstance(args.item)) {
      const modelNode = args.item.tag
      if (modelNode.failed) {
        // repair node
        modelNode.failed = false
        modelNode.enabled = true
        graphComponent.invalidate()
      } else {
        // update data displayed in pop-up
        updateNodePopupContent(args.item)
        // open pop-up
        nodePopup.currentItem = args.item
      }
    }
  }

  /**
   * Populate the node popup with the clicked node's information.
   * @param {yfiles.graph.INode} node
   */
  function updateNodePopupContent(node) {
    // get data from tag
    const data = node.tag

    // get all divs in the pop-up
    const divs = nodePopup.div.getElementsByTagName('div')
    for (let i = 0; i < divs.length; i++) {
      const div = divs.item(i)
      if (div.hasAttribute('data-id')) {
        // if div has a 'data-id' attribute, get content from the business data
        const id = div.getAttribute('data-id')
        div.textContent = data[id]
      }
    }

    // set the correct powerbutton state
    const powerButtonPath = document.getElementById('powerButton-path')
    powerButtonPath.setAttribute('class', node.tag.enabled ? '' : 'powerButton-off')

    // update the d3.js bar chart
    if (d3Loaded) {
      barChart.barChart(node)
    }
  }

  /**
   * Event handler for failures in the network during the simulation.
   * The effect is a viewport animation to bring the failed object into view, if it is not visible already.
   * @param {Object} sender The object that raised the event.
   * @param {yfiles.lang.EventArgs} args Event arguments.
   */
  function onNetworkFailure(sender, args) {
    let /** @type {yfiles.geometry.Rect} */ rect = null

    if (sender instanceof ModelNode) {
      // For nodes just include the node itself in the viewport
      const graphNode = modelNodeToINode.get(sender instanceof ModelNode ? sender : null)
      rect = graphNode.layout.toRect()
    } else if (sender instanceof ModelEdge) {
      const modelEdge = sender instanceof ModelEdge ? sender : null
      const graphEdge = modelEdgeToIEdge.get(modelEdge)
      // For edges we need to get the bounding box of the end points
      // We don't need to consider bends in this demo as there are none.
      rect = new yfiles.geometry.Rect(
        graphEdge.sourcePort.location.toPoint(),
        graphEdge.targetPort.location.toPoint()
      )
    }

    // Don't do anything if the failing element is visible already
    if (graphComponent.viewport.contains(rect) && graphComponent.zoom > 0.8) {
      return
    }

    // Enlarge the viewport so that we get an overview of the neighborhood as well
    rect = rect.getEnlarged(new yfiles.geometry.Insets(350))

    // Animate the transition to the failed element
    const animator = new yfiles.view.Animator(graphComponent)
    animator.allowUserInteraction = true
    const viewportAnimation = new yfiles.view.ViewportAnimation(graphComponent, rect, '1s')
    animator.animate(viewportAnimation.createEasedAnimation(0, 1))
  }

  /**
   * Assigns the tooltip for the queried graph item.
   * @param {object} sender
   * @param {yfiles.input.ToolTipQueryEventArgs} args
   */
  function onQueryItemToolTip(sender, args) {
    const tag = args.item.tag
    // display the load for nodes and edges
    if (tag instanceof ModelNode) {
      const modelNode = tag
      if (modelNode.failed) {
        args.toolTip = `Repair ${modelNode.name}`
      } else {
        args.toolTip = `Load: ${(modelNode.load * 100).toFixed(1)}%`
      }
    } else if (tag instanceof ModelEdge) {
      const modelEdge = tag
      if (modelEdge.failed) {
        args.toolTip = 'Repair connection.'
      } else {
        args.toolTip = `Load: ${(modelEdge.load * 100).toFixed(1)}%`
      }
    }
    args.handled = true
  }

  /**
   * Event handler that hides the pop-up on click on the background.
   * @param {object} sender
   * @param {yfiles.input.ClickEventArgs} args
   */
  function onClick(sender, args) {
    nodePopup.currentItem = null
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindAction("input[data-command='ToggleFailures']", onToggleFailuresClicked)
    app.bindAction("input[data-command='ToggleLabels']", toggleLabels)
  }

  // 'export' just the run function
  run()
})
