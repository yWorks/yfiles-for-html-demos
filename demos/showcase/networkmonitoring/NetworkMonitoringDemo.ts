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
  type GraphInputMode,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  type IModelItem,
  INode,
  Insets,
  type ItemClickedEventArgs,
  LayoutExecutor,
  License,
  OrganicLayout,
  OrganicLayoutStarSubstructureStyle,
  Rect,
  Size
} from 'yfiles'

import { Simulator } from './model/Simulator'
import type { Connection } from './model/Connection'
import { type Device, DeviceKind } from './model/Device'
import { ConnectionEdgeStyle } from './ConnectionEdgeStyle'
import { DeviceNodeStyle } from './DeviceNodeStyle'
import { networkData } from './model/network-sample'
import { Network } from './model/Network'
import { initializeDeviceDetailsPopup, updateBarChart } from './device-popup'
import { initializeToolTips } from './tooltips'

import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

import {
  addFailureHighlight,
  installFailureHighlight,
  removeFailureHighlight
} from './failure-highlight'

Class.ensure(LayoutExecutor)

// This demo creates a network monitoring tool for dynamic data.
// The mock-up model is created and updated by class Simulator.

/**
 * Manages the animation of packets that travel along the edges.
 */
let edgeAnimator: Animator

async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // we don't want to show the labels for the nodes, initially,
  // so we hide the whole group
  graphComponent.graphModelManager.nodeLabelGroup.visible = false

  const graphInputMode = createInputMode()

  initializeToolTips(graphInputMode, item =>
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

  network.onDeviceFailure = async (device: Device): Promise<void> => {
    const node = graphBuilder.getNodeById(device.id)!
    addFailureHighlight(node)
    await zoomToBounds(graphComponent, node.layout.toRect())
  }

  network.onConnectionFailure = async (connection: Connection): Promise<void> => {
    const sourceNode = graphBuilder.getNodeById(connection.sender.id)!
    const targetNode = graphBuilder.getNodeById(connection.receiver.id)!
    // We don't need to consider bends in this demo as there are none.
    await zoomToBounds(
      graphComponent,
      Rect.add(sourceNode.layout.toRect(), targetNode.layout.toRect())
    )
  }

  network.onDataUpdated = (): void => {
    updateBarChart()
    graphComponent.invalidate()
  }

  const simulator = new Simulator(network)

  enableViewportLimiter(graphComponent)
  initializeUI(graphComponent, simulator)
}

/**
 * Creates and configures a viewer input mode for the graphComponent of this demo.
 */
function createInputMode(): GraphInputMode {
  return new GraphViewerInputMode({
    focusableItems: GraphItemTypes.NONE,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE
  })
}

function enableRepairOnItemClick(graphInputMode: GraphInputMode): void {
  graphInputMode.clickableItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  graphInputMode.addItemClickedListener((_, evt): void => {
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
        evt.context.canvasComponent!.invalidate()
        evt.handled = true
      }
      // eslint-disable-next-line no-useless-return
      return
    }
  })
}

function enableViewportLimiter(graphComponent: GraphComponent): void {
  graphComponent.contentMargins = new Insets(50)
  graphComponent.fitGraphBounds()

  // limit scrolling to the area containing the graph
  graphComponent.viewportLimiter.honorBothDimensions = false
  graphComponent.viewportLimiter.bounds = graphComponent.contentRect
  graphComponent.maximumZoom = 3
}

function createGraphBuilder(data: Network, graphComponent: GraphComponent): GraphBuilder {
  const graphBuilder = new GraphBuilder()

  const nodeCreator = graphBuilder.createNodesSource({
    data: data.devices,
    id: item => item.id
  }).nodeCreator
  nodeCreator.defaults.style = new DeviceNodeStyle(getDevice, getImage)
  nodeCreator.defaults.size = new Size(64, 64)

  const nodeLabelCreator = nodeCreator.createLabelBinding(device => `${device.name}\n${device.ip}`)
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
    sourceId: item => item.sender.id,
    targetId: item => item.receiver.id
  }).edgeCreator

  // create an animator instance that can be used by the edge style
  edgeAnimator = new Animator(graphComponent)
  edgeAnimator.allowUserInteraction = true
  edgeAnimator.autoInvalidation = false

  edgeCreator.defaults.style = new ConnectionEdgeStyle(edgeAnimator)

  return graphBuilder
}

async function zoomToBounds(graphComponent: GraphComponent, bounds: Rect): Promise<void> {
  // Don't do anything if the failing element is visible already
  if (graphComponent.viewport.contains(bounds) && graphComponent.zoom > 0.8) {
    return
  }

  // Zoom to enlarged bounds, so we get an overview of the neighborhood as well
  await graphComponent.zoomToAnimated(bounds.getEnlarged(new Insets(350)))
}

function initializeUI(graphComponent: GraphComponent, simulator: Simulator): void {
  document.querySelector('#toggleLabels')!.addEventListener('click', (event: Event): void => {
    const button = event.target as HTMLInputElement
    graphComponent.graphModelManager.nodeLabelGroup.visible = button.checked
  })

  document.querySelector('#toggleFailures')!.addEventListener('click', evt => {
    const button = evt.target as HTMLInputElement
    simulator.failuresEnabled = button.checked
  })

  document.querySelector('#pauseSimulation')!.addEventListener('click', evt => {
    const button = evt.target as HTMLInputElement
    edgeAnimator.paused = button.checked
    simulator.paused = button.checked
  })
}

function getDevice(node: INode): Device {
  return node.tag as Device
}

function getConnection(edge: IEdge): Connection {
  return edge.tag as Connection
}

function getDeviceTooltip(device: Device): HTMLElement | string | null {
  return device.failed ? `Repair ${device.name}` : `Load: ${(device.load * 100).toFixed(1)}%`
}

function getConnectionTooltip(connection: Connection): HTMLElement | string | null {
  return connection.failed ? 'Repair connection.' : `Load: ${(connection.load * 100).toFixed(1)}%`
}

function getImage(device: Device): string {
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
