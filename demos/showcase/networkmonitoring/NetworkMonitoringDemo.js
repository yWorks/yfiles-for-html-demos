/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  CycleSubstructureStyle,
  DefaultLabelStyle,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  INode,
  Insets,
  LayoutExecutor,
  License,
  OrganicLayout,
  OrganicLayoutStarSubstructureStyle,
  Rect,
  Size
} from 'yfiles'

import { Simulator } from './model/Simulator.js'
import { DeviceKind } from './model/Device.js'
import { ConnectionEdgeStyle } from './ConnectionEdgeStyle.js'
import { DeviceNodeStyle } from './DeviceNodeStyle.js'
import { networkData } from './model/network-sample.js'
import { Network } from './model/Network.js'
import { initializeDeviceDetailsPopup, updateBarChart } from './device-popup.js'
import { initializeToolTips } from './tooltips.js'

import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

import {
  addFailureHighlight,
  installFailureHighlight,
  removeFailureHighlight
} from './failure-highlight.js'

Class.ensure(LayoutExecutor)

// This demo creates a network monitoring tool for dynamic data.
// The mock-up model is created and updated by class Simulator.

/**
 * Manages the animation of packets that travel along the edges.
 * @type {Animator}
 */
let edgeAnimator

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // we don't want to show the labels for the nodes, initially,
  // so we hide the whole group
  graphComponent.graphModelManager.nodeLabelGroup.visible = false

  const graphInputMode = createInputMode()

  initializeToolTips(graphInputMode, (item) =>
    item instanceof INode
      ? getDeviceTooltip(getDevice(item))
      : getConnectionTooltip(getConnection(item))
  )

  initializeDeviceDetailsPopup(graphComponent, graphInputMode, getDevice)

  enableRepairOnItemClick(graphInputMode)

  graphComponent.inputMode = graphInputMode
  installFailureHighlight(graphComponent)

  const network = Network.loadFromJSON(networkData)

  // Build the graph and calculate a nice initial layout
  const graphBuilder = createGraphBuilder(network, graphComponent)
  graphComponent.graph = graphBuilder.buildGraph()
  graphComponent.graph.applyLayout(
    new OrganicLayout({
      preferredEdgeLength: 20,
      deterministic: true,
      starSubstructureStyle: OrganicLayoutStarSubstructureStyle.RADIAL,
      cycleSubstructureStyle: CycleSubstructureStyle.CIRCULAR,
      nodeEdgeOverlapAvoided: true,
      considerNodeSizes: true,
      compactnessFactor: 0.9
    })
  )

  network.onDeviceFailure = async (device) => {
    const node = graphBuilder.getNodeById(device.id)
    addFailureHighlight(node)
    await zoomToBounds(graphComponent, node.layout.toRect())
  }

  network.onConnectionFailure = async (connection) => {
    const sourceNode = graphBuilder.getNodeById(connection.sender.id)
    const targetNode = graphBuilder.getNodeById(connection.receiver.id)
    // We don't need to consider bends in this demo as there are none.
    await zoomToBounds(
      graphComponent,
      Rect.add(sourceNode.layout.toRect(), targetNode.layout.toRect())
    )
  }

  network.onDataUpdated = () => {
    updateBarChart()
    graphComponent.invalidate()
  }

  const simulator = new Simulator(network)

  enableViewportLimiter(graphComponent)
  initializeUI(graphComponent, simulator)
}

/**
 * Creates and configures a viewer input mode for the graphComponent of this demo.
 * @returns {!GraphInputMode}
 */
function createInputMode() {
  return new GraphViewerInputMode({
    focusableItems: GraphItemTypes.NONE,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE
  })
}

/**
 * @param {!GraphInputMode} graphInputMode
 */
function enableRepairOnItemClick(graphInputMode) {
  graphInputMode.clickableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  graphInputMode.addItemClickedListener((_, evt) => {
    if (evt.item instanceof INode) {
      const device = getDevice(evt.item)
      if (device.failed) {
        device.repair()
        removeFailureHighlight(evt.item)
        evt.handled = true
      }
      return
    }

    if (evt.item instanceof IEdge) {
      const connection = getConnection(evt.item)
      if (connection.failed) {
        connection.repair()
        evt.context.canvasComponent.invalidate()
        evt.handled = true
      }
      // eslint-disable-next-line no-useless-return
      return
    }
  })
}

/**
 * @param {!GraphComponent} graphComponent
 */
function enableViewportLimiter(graphComponent) {
  graphComponent.contentMargins = new Insets(50)
  graphComponent.fitGraphBounds()

  // limit scrolling to the area containing the graph
  graphComponent.viewportLimiter.honorBothDimensions = false
  graphComponent.viewportLimiter.bounds = graphComponent.contentRect
  graphComponent.maximumZoom = 3
}

/**
 * @param {!Network} data
 * @param {!GraphComponent} graphComponent
 * @returns {!GraphBuilder}
 */
function createGraphBuilder(data, graphComponent) {
  const graphBuilder = new GraphBuilder()

  const nodeCreator = graphBuilder.createNodesSource({
    data: data.devices,
    id: (item) => item.id
  }).nodeCreator
  nodeCreator.defaults.style = new DeviceNodeStyle(getDevice, getImage)
  nodeCreator.defaults.size = new Size(64, 64)

  const nodeLabelCreator = nodeCreator.createLabelBinding(
    (device) => `${device.name}\n${device.ip}`
  )
  nodeLabelCreator.defaults.style = new DefaultLabelStyle({
    backgroundStroke: null,
    backgroundFill: 'rgba(255,255,255,0.5)'
  })
  nodeLabelCreator.defaults.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1],
    [0, -15],
    [0.5, 0]
  )

  const edgeCreator = graphBuilder.createEdgesSource({
    data: data.connections,
    sourceId: (item) => item.sender.id,
    targetId: (item) => item.receiver.id
  }).edgeCreator

  // create an animator instance that can be used by the edge style
  edgeAnimator = new Animator(graphComponent)
  edgeAnimator.allowUserInteraction = true
  edgeAnimator.autoInvalidation = false

  edgeCreator.defaults.style = new ConnectionEdgeStyle(edgeAnimator)

  return graphBuilder
}

/**
 * @param {!GraphComponent} graphComponent
 * @param {!Rect} bounds
 * @returns {!Promise}
 */
async function zoomToBounds(graphComponent, bounds) {
  // Don't do anything if the failing element is visible already
  if (graphComponent.viewport.contains(bounds) && graphComponent.zoom > 0.8) {
    return
  }

  // Zoom to enlarged bounds, so we get an overview of the neighborhood as well
  await graphComponent.zoomToAnimated(bounds.getEnlarged(new Insets(350)))
}

/**
 * @param {!GraphComponent} graphComponent
 * @param {!Simulator} simulator
 */
function initializeUI(graphComponent, simulator) {
  document.querySelector('#toggleLabels').addEventListener('click', (event) => {
    const button = event.target
    graphComponent.graphModelManager.nodeLabelGroup.visible = button.checked
  })

  document.querySelector('#toggleFailures').addEventListener('click', (evt) => {
    const button = evt.target
    simulator.failuresEnabled = button.checked
  })

  document.querySelector('#pauseSimulation').addEventListener('click', (evt) => {
    const button = evt.target
    edgeAnimator.paused = button.checked
    simulator.paused = button.checked
  })
}

/**
 * @param {!INode} node
 * @returns {!Device}
 */
function getDevice(node) {
  return node.tag
}

/**
 * @param {!IEdge} edge
 * @returns {!Connection}
 */
function getConnection(edge) {
  return edge.tag
}

/**
 * @param {!Device} device
 * @returns {?(HTMLElement|string)}
 */
function getDeviceTooltip(device) {
  return device.failed ? `Repair ${device.name}` : `Load: ${(device.load * 100).toFixed(1)}%`
}

/**
 * @param {!Connection} connection
 * @returns {?(HTMLElement|string)}
 */
function getConnectionTooltip(connection) {
  return connection.failed ? 'Repair connection.' : `Load: ${(connection.load * 100).toFixed(1)}%`
}

/**
 * @param {!Device} device
 * @returns {!string}
 */
function getImage(device) {
  switch (device.kind) {
    case DeviceKind.WORKSTATION:
      return './resources/workstation.svg'
    case DeviceKind.LAPTOP:
      return './resources/laptop.svg'
    case DeviceKind.SMARTPHONE:
      return './resources/smartphone.svg'
    case DeviceKind.SWITCH:
      return './resources/switch.svg'
    case DeviceKind.WLAN:
      return './resources/wlan.svg'
    case DeviceKind.SERVER:
      return './resources/server.svg'
    case DeviceKind.DATABASE:
      return './resources/database.svg'
    default:
      return './resources/workstation.svg'
  }
}

void run().then(finishLoading)
