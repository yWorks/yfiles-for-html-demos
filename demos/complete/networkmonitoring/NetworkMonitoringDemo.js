/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Animator,
  DefaultLabelStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  Font,
  FreeNodeLabelModel,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  Insets,
  ItemClickedEventArgs,
  License,
  Point,
  QueryItemToolTipEventArgs,
  Rect,
  ViewportAnimation
} from 'yfiles'

import Simulator from './Simulator.js'
import Connection from './Connection.js'
import Device from './Device.js'
import ConnectionStyle from './ConnectionStyle.js'
import DeviceStyle from './DeviceStyle.js'
import { bindAction, bindCommand, checkLicense, showApp } from '../../resources/demo-app.js'
import D3BarChart from './D3BarChart.js'
import HTMLPopupSupport from './HTMLPopupSupport.js'
import loadJson from '../../resources/load-json.js'
import { passiveSupported } from '../../utils/Workarounds.js'
import Network from './Network.js'
import SampleData from './resources/sample.js'

// This demo creates a network monitoring tool for dynamic data.
// The mock-up model is created and updated by class Simulator.

/** @type {GraphComponent} */
let graphComponent

/**
 * The network model of the graph. It models traffic and load of the graph.
 * @type {Network}
 */
let network

/**
 * The actual simulator of the network.
 * @type {Simulator}
 */
let simulator

/**
 * Whether the simulator is paused.
 * @type {boolean}
 */
let simulatorPaused = false

/**
 * Maps the network model nodes to the graph control nodes.
 * @type {Map.<Device,INode>}
 */
let deviceToNode

/**
 * Maps the network model edges to the graph control edges.
 * @type {Map.<Connection,IEdge>}
 */
let connectionToEdge

/**
 * The node popup which contains additional information of the node.
 * @type {HTMLPopupSupport}
 */
let nodePopup

/**
 * The bar chart which is displayed in the node popup.
 * @type {*}
 */
let barChart = null

/**
 * Sometimes d3 is not loaded correctly. If this happens, don't show the chart at all.
 * @type {boolean}
 */
let d3Loaded = false

/**
 * Manages the animation of packets that travel along the edges.
 * @type {Animator}
 */
let edgeAnimator

/**
 * @param {!object} licenseData
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')

  initializeInputMode()

  setDefaultStyles()

  initializePopupSupport()

  initializeBarCharts()

  registerCommands()

  await loadNetwork()

  setupSimulator()
  graphComponent.fitGraphBounds(new Insets(50))
  // limit scrolling to the area containing the graph
  graphComponent.viewportLimiter.honorBothDimensions = false
  graphComponent.viewportLimiter.bounds = graphComponent.contentRect
  graphComponent.maximumZoom = 3
  startSimulator()

  showApp(graphComponent)
}

/**
 * Creates and configures a viewer input mode for the graphComponent of this demo.
 */
function initializeInputMode() {
  const mode = new GraphViewerInputMode({
    toolTipItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NONE,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE
  })

  mode.addQueryItemToolTipListener(onQueryItemToolTip)
  mode.addItemClickedListener(onItemClicked)
  mode.mouseHoverInputMode.toolTipLocationOffset = new Point(10, 10)
  mode.addCanvasClickedListener(onClick)

  graphComponent.inputMode = mode
}

/**
 * Configures default styles for newly created graph elements.
 */
function setDefaultStyles() {
  const graph = graphComponent.graph

  // set the default node style
  graph.nodeDefaults.style = new DeviceStyle(passiveSupported)
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1],
    [0, -15],
    [0.5, 0]
  )
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: 'rgba(255, 255, 255, 0.8)',
    horizontalTextAlignment: 'center',
    insets: [3, 5, 3, 5],
    font: new Font({ lineSpacing: 0.2 })
  })

  // set the default edge style
  // create an animator instance that can be used by the edge style
  edgeAnimator = new Animator(graphComponent)
  edgeAnimator.allowUserInteraction = true
  edgeAnimator.autoInvalidation = false

  graph.edgeDefaults.style = new ConnectionStyle(edgeAnimator, passiveSupported)
  graphComponent.graph = graph
}

function initializePopupSupport() {
  // create a label model parameter that is used to position the node pop-up
  const nodeLabelModel = new ExteriorLabelModel({ insets: 10 })
  const nodeLabelModelParameter = nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH)

  // create the pop-up content div for the node pop-up div
  const nodePopupContent = window.document.getElementById('nodePopupContent')
  nodePopup = new HTMLPopupSupport(graphComponent, nodePopupContent, nodeLabelModelParameter)
}

function initializeBarCharts() {
  try {
    barChart = new D3BarChart()
    d3Loaded = true
  } catch (ignored) {
    d3Loaded = false
    const chart = document.getElementsByClassName('chart')[0]
    chart.setAttribute('class', 'no-chart')
  }
}

/**
 * Shows/hides node labels.
 * @param {!Event} event
 */
function toggleLabels(event) {
  const graph = graphComponent.graph

  if (!event.target.checked) {
    graph.labels.toArray().forEach(label => graphComponent.graph.remove(label))
  } else {
    graph.nodes.forEach(node => {
      const deviceName = node.tag.name
      const deviceIp = node.tag.ip
      return graph.addLabel(node, `${deviceName}\n${deviceIp}`)
    })
  }
}

/**
 * Initializes the graph from the supplied JSON file and creates the model from it.
 * While this reads the graph asynchronously from a JSON file and constructs the model from an
 * already-finished graph, a real-world application would likely create the model from whichever
 * data source is available and then create the graph from it.
 * @returns {!Promise}
 */
function loadNetwork() {
  return new Promise(resolve =>
    setTimeout(() => {
      loadGraph(SampleData)
      populateModel(graphComponent.graph)
      resolve()
    }, 0)
  )
}

/**
 * Loads the graph from the given JSON data.
 * @param {!NetworkSample} data
 */
function loadGraph(data) {
  const graph = graphComponent.graph
  graph.clear()

  // create a map to store the nodes for edge creation
  const nodeMap = new Map()

  // create the nodes
  const nodes = data.nodeList
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    const l = n.layout
    const node = graph.createNode({
      layout: new Rect(l.x, l.y, l.w, l.h),
      tag: n.tag
    })
    nodeMap.set(n.tag.id, node)
  }

  const edges = data.edgeList
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i]
    // get the source and target node from the mapping
    const sourceNode = nodeMap.get(e.source)
    const targetNode = nodeMap.get(e.target)
    // create the source and target port
    const sp = e.sourcePort
    const tp = e.targetPort
    const sourcePort = graph.addPortAt(sourceNode, Point.from(sp))
    const targetPort = graph.addPortAt(targetNode, Point.from(tp))
    // create the edge
    graph.createEdge(sourcePort, targetPort)
  }
}

/**
 * Populates the model and initializes the mapping based on the nodes and edges of the original graph.
 * @param {!IGraph} graph
 */
function populateModel(graph) {
  // Create and attach for each graph node a device.
  deviceToNode = new Map()
  graph.nodes.forEach(node => {
    const device = new Device()
    const tag = node.tag
    device.name = tag.name
    device.ip = tag.ip
    device.enabled = true
    device.kind = tag.type
    device.load = tag.load

    // Mapping between edge and device
    node.tag = device
    deviceToNode.set(device, node)
  })

  // Create and attach for each graph edge a connection.
  connectionToEdge = new Map()
  graph.edges.forEach(edge => {
    const connection = new Connection()
    connection.sender = edge.sourceNode.tag
    connection.receiver = edge.targetNode.tag

    // Mapping between node and connection
    edge.tag = connection
    connectionToEdge.set(connection, edge)
  })

  // Create the network model.
  network = new Network([...deviceToNode.keys()], [...connectionToEdge.keys()])
}

/**
 * Prepares the simulator that moves packets through the network.
 */
function setupSimulator() {
  simulator = new Simulator(network)
  simulator.addFailedListener(onNetworkFailure)
  // initialize simulator state
  for (let i = 0; i < 30; i++) {
    simulator.tick()
  }
}

/**
 * Starts the simulator.
 * @param {number} [timeout]
 */
function startSimulator(timeout) {
  if (simulatorPaused) {
    return
  }
  const simulatorTimeout = timeout ? timeout : 1500
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
  }, simulatorTimeout)
}

/**
 * Event handler for clicks on the "Enable failures" button.
 */
function onToggleFailuresClicked() {
  if (simulator) {
    const toggleFailureButton = document.querySelector("input[data-command='ToggleFailures']")
    simulator.failuresEnabled = toggleFailureButton.checked
  }
}

/**
 * Event handler for clicks on edges or nodes.
 * @param {!GraphViewerInputMode} sender
 * @param {!ItemClickedEventArgs.<IModelItem>} args
 */
function onItemClicked(sender, args) {
  if (args.item instanceof INode) {
    const device = args.item.tag
    if (device.failed) {
      // repair node
      device.failed = false
      device.enabled = true
      graphComponent.invalidate()
    } else {
      // update data displayed in pop-up
      updateNodePopupContent(args.item)
      // open pop-up
      nodePopup.currentItem = args.item
    }
  }

  if (args.item instanceof IEdge) {
    const connection = args.item.tag
    if (connection.failed) {
      // repair edge
      connection.failed = false
      graphComponent.invalidate()
    }
  }
}

/**
 * Populate the node popup with the clicked node's information.
 * @param {!INode} node
 */
function updateNodePopupContent(node) {
  // get data from tag
  const data = node.tag

  // get all divs in the pop-up
  const divs = nodePopup.div.getElementsByTagName('div')
  for (const div of divs) {
    if (div.hasAttribute('data-id')) {
      // if div has a 'data-id' attribute, get content from the business data
      const id = div.getAttribute('data-id')
      div.textContent = data[id]
    }
  }

  // set the correct power button state
  const powerButtonPath = document.getElementById('powerButton-path')
  powerButtonPath.setAttribute('class', node.tag.enabled ? '' : 'powerButton-off')

  // update the d3.js bar chart
  if (d3Loaded) {
    barChart.barChart(node)
  }
}

/**
 * Event handler for failures in the network during the simulation.
 * The effect is a viewport animation to bring the failed object into view, if it is not visible
 * already.
 * @param {!Simulator} sender The object that raised the event.
 * @param {!(Device|Connection)} item The item the fails.
 * @returns {!Promise}
 */
async function onNetworkFailure(sender, item) {
  let rect = null

  if (item instanceof Device) {
    // For nodes just include the node itself in the viewport
    const graphNode = deviceToNode.get(item)
    rect = graphNode.layout.toRect()
  }

  if (item instanceof Connection) {
    const graphEdge = connectionToEdge.get(item)
    // For edges we need to get the bounding box of the end points
    // We don't need to consider bends in this demo as there are none.
    rect = new Rect(
      graphEdge.sourcePort.location.toPoint(),
      graphEdge.targetPort.location.toPoint()
    )
  }

  // Don't do anything if the failing element is visible already
  if (!rect || (graphComponent.viewport.contains(rect) && graphComponent.zoom > 0.8)) {
    return
  }

  // Enlarge the viewport so that we get an overview of the neighborhood as well
  rect = rect.getEnlarged(new Insets(350))

  // Animate the transition to the failed element
  const animator = new Animator(graphComponent)
  animator.allowUserInteraction = true
  const viewportAnimation = new ViewportAnimation(graphComponent, rect, '1s')
  await animator.animate(viewportAnimation.createEasedAnimation(0, 1))
}

/**
 * Assigns the tooltip content for the queried graph item.
 * @param {!GraphViewerInputMode} sender
 * @param {!QueryItemToolTipEventArgs.<IModelItem>} args
 */
function onQueryItemToolTip(sender, args) {
  const item = args.item

  // Display the load for nodes
  if (item instanceof INode) {
    const device = item.tag
    if (device.failed) {
      args.toolTip = `Repair ${device.name}`
    } else {
      args.toolTip = `Load: ${(device.load * 100).toFixed(1)}%`
    }
  }

  // Display the load for edges
  if (item instanceof IEdge) {
    const connection = item.tag
    if (connection.failed) {
      args.toolTip = 'Repair connection.'
    } else {
      args.toolTip = `Load: ${(connection.load * 100).toFixed(1)}%`
    }
  }

  args.handled = true
}

/**
 * Event handler that hides the pop-up on click on the background.
 */
function onClick() {
  nodePopup.currentItem = null
}

function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindAction("input[data-command='ToggleFailures']", onToggleFailuresClicked)
  bindAction("input[data-command='ToggleLabels']", toggleLabels)
  bindAction("input[data-command='PauseSimulation']", e => {
    const pauseButton = e.target
    const paused = pauseButton.checked
    simulatorPaused = paused
    edgeAnimator.paused = paused
    if (!paused) {
      startSimulator(0)
    }
  })
}

loadJson().then(checkLicense).then(run)
