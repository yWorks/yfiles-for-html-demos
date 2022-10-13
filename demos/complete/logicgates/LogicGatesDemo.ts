/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  DragDropEffects,
  EdgeDirectionPolicy,
  EdgeRouter,
  EdgeRouterData,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  HierarchicLayout,
  HierarchicLayoutData,
  ICommand,
  IEdgeReconnectionPortCandidateProvider,
  IGraph,
  ILayoutAlgorithm,
  INode,
  IPort,
  LayoutData,
  LayoutOrientation,
  License,
  ListEnumerable,
  NodeDropInputMode,
  OrthogonalEdgeEditingContext,
  Point,
  PortConstraint,
  PortSide,
  Rect,
  SimpleNode,
  SimplePort,
  Size
} from 'yfiles'

import { DescriptorDependentPortCandidateProvider, PortDescriptor } from './LogicGatesHelper'
import { AndGateNodeStyle, NotNodeStyle, OrNodeStyle, XOrNodeStyle } from './DemoStyles'
import { DragAndDropPanel } from '../../utils/DndPanel'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  configureTwoPointerPanning,
  removeClass,
  reportDemoError,
  showApp
} from '../../resources/demo-app'

import { applyDemoTheme } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'
import { BrowserDetection } from '../../utils/BrowserDetection'

let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the drag and drop panel
  initializeDnDPanel()

  // initialize the default styles
  initializeGraph()

  // create the input mode for this demo
  createInputMode()

  // create the sample graph
  await createSampleGraph()

  // wire up the UI
  registerCommands()

  // show the demo
  showApp(graphComponent)
}

/**
 * Initializes the drag and drop panel.
 */
function initializeDnDPanel(): void {
  const dndPanel = new DragAndDropPanel(document.getElementById('dndPanel')!)
  // Set the callback that starts the actual drag and drop operation
  dndPanel.beginDragCallback = (element, data) => {
    const dragPreview = element.cloneNode(true) as HTMLElement
    dragPreview.style.margin = '0'
    const dragSource = NodeDropInputMode.startDrag(
      element,
      data,
      DragDropEffects.ALL,
      true,
    BrowserDetection.pointerEvents ? dragPreview : null
    )
    dragSource.addQueryContinueDragListener((src, args) => {
      if (args.dropTarget) {
        addClass(dragPreview, 'hidden')
      } else {
        removeClass(dragPreview, 'hidden')
      }
    })
  }
  dndPanel.maxItemWidth = 160
  dndPanel.populatePanel(createDnDPanelNodes)
}

/**
 * Creates the nodes that provide the visualizations for the style panel.
 */
function createDnDPanelNodes(): SimpleNode[] {
  // Create some nodes with different styles
  const nodeStyles = [
    new AndGateNodeStyle(false),
    new AndGateNodeStyle(true),
    new NotNodeStyle(),
    new OrNodeStyle(false),
    new OrNodeStyle(true),
    new XOrNodeStyle(false),
    new XOrNodeStyle(true)
  ]

  const nodeContainer = nodeStyles.map(style => {
    return new SimpleNode({ layout: new Rect(0, 0, 100, 50), style: style })
  })

  // create the port descriptor for the nodes
  createPortDescriptors(nodeContainer)

  return nodeContainer
}

/**
 * Initialize the graph's default styles and more settings.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new AndGateNodeStyle(false)
  graph.nodeDefaults.size = new Size(100, 50)

  // don't delete ports a removed edge was connected to
  graph.nodeDefaults.ports.autoCleanUp = false

  // set the port candidate provider
  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    node => new DescriptorDependentPortCandidateProvider(node)
  )
  graph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
    IEdgeReconnectionPortCandidateProvider.ALL_NODE_CANDIDATES
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
function createInputMode(): void {
  const mode = new GraphEditorInputMode({
    // Enable orthogonal edge editing
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    // enable snapping for easier orthogonal edge editing
    snapContext: new GraphSnapContext({
      enabled: true
    }),
    // don't allow nodes to be created using a mouse click
    allowCreateNode: false,
    // disable node resizing
    showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.NODE
  })

  // allow reversed edge creation depending on what kind of port the drag starts
  mode.createEdgeInputMode.edgeDirectionPolicy = EdgeDirectionPolicy.DETERMINE_FROM_PORT_CANDIDATES

  // we want to get reports of the mouse being hovered over nodes and edges
  // first enable queries
  mode.itemHoverInputMode.enabled = true

  // set the items to be reported
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  // if there are other items (most importantly labels) in front of edges or nodes
  // they should be discarded, rather than be reported as "null"
  mode.itemHoverInputMode.discardInvalidItems = false
  // whenever the currently hovered item changes call our method
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    const item = args.item
    const oldItem = args.oldItem

    if (oldItem && oldItem.tag && oldItem instanceof INode) {
      oldItem.tag.sourceHighlight = false
      oldItem.tag.targetHighlight = false
    }

    if (item && item.tag && item instanceof INode) {
      item.tag.sourceHighlight = true
      item.tag.targetHighlight = true
    }
    graphComponent.invalidate()
  })

  // create a new NodeDropInputMode to configure the drag and drop operation
  mode.nodeDropInputMode = new NodeDropInputMode({
    // enables the display of the dragged element during the drag
    showPreview: true,
    // by default the mode available in GraphEditorInputMode is disabled, so first enable it
    enabled: true
  })

  const originalNodeCreator = mode.nodeDropInputMode.itemCreator!
  mode.nodeDropInputMode.itemCreator = (context, graph, draggedNode, dropTarget, point) => {
    if (draggedNode instanceof INode) {
      const modelItem = new SimpleNode({ style: draggedNode.style, layout: draggedNode.layout })

      const newNode = originalNodeCreator(context, graph, modelItem, dropTarget, point)!
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

  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
}

/**
 * Applies the selected layout algorithm.
 * @param clearUndo True if the undo engine should be cleared, false otherwise
 */
async function runLayout(clearUndo: boolean): Promise<void> {
  const algorithmSelect = document.getElementById('algorithm-select-box') as HTMLSelectElement
  const selectedIndex = algorithmSelect.selectedIndex

  let layout: ILayoutAlgorithm
  let layoutData: LayoutData

  if (selectedIndex === 0) {
    layout = new HierarchicLayout({
      layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
      orthogonalRouting: true
    })
    layoutData = new HierarchicLayoutData({
      sourcePortConstraints: _ => PortConstraint.create(PortSide.EAST, true),
      targetPortConstraints: _ => PortConstraint.create(PortSide.WEST, true)
    })
  } else {
    layout = new EdgeRouter()
    layoutData = new EdgeRouterData({
      sourcePortConstraints: _ => PortConstraint.create(PortSide.EAST, true),
      targetPortConstraints: _ => PortConstraint.create(PortSide.WEST, true)
    })
  }

  setUIDisabled(true)

  try {
    await graphComponent.morphLayout(layout, '1s', layoutData)
    graphComponent.fitGraphBounds()
  } catch (error) {
    reportDemoError(error)
  } finally {
    setUIDisabled(false)
    if (clearUndo) {
      graphComponent.graph.undoEngine!.clear()
    }
  }
}

/**
 * Disables the HTML elements of the UI and the input mode.
 *
 * @param disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  const algorithmSelect = document.getElementById('algorithm-select-box') as HTMLSelectElement
  const layoutButton = document.getElementById('layoutButton') as HTMLButtonElement

  algorithmSelect.disabled = disabled
  layoutButton.disabled = disabled
}

/**
 * Wires up the UI.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)

  bindChangeListener("select[data-command='AlgorithmSelectionChanged']", checked =>
    runLayout(checked as boolean)
  )
  bindAction("button[data-command='Layout']", _ => runLayout(false))
}

/**
 * Creates the sample graph for this demo.
 */
async function createSampleGraph(): Promise<void> {
  const graph = graphComponent.graph

  const node1 = graph.createNode({ style: new AndGateNodeStyle(true) })
  const node2 = graph.createNode({ style: new NotNodeStyle() })
  const node3 = graph.createNode({ style: new AndGateNodeStyle(true) })
  const node4 = graph.createNode({ style: new NotNodeStyle() })
  const node5 = graph.createNode({ style: new AndGateNodeStyle(true) })

  const node6 = graph.createNode({ style: new AndGateNodeStyle(false) })
  const node7 = graph.createNode({ style: new AndGateNodeStyle(true) })
  const node8 = graph.createNode({ style: new AndGateNodeStyle(false) })

  const node9 = graph.createNode({ style: new AndGateNodeStyle(false) })
  const node10 = graph.createNode({ style: new NotNodeStyle() })

  const node11 = graph.createNode({ style: new AndGateNodeStyle(false) })
  const node12 = graph.createNode({ style: new NotNodeStyle() })

  // create the port descriptors for the graph nodes
  createPortDescriptors([...graph.nodes], graph)

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
  await runLayout(true)
}

/**
 * Creates the port descriptors for the given graph.
 * @param nodes The nodes of the drag and drop panel
 * @param graph The given graph
 */
function createPortDescriptors(nodes: INode[], graph?: IGraph): void {
  nodes.forEach(node => {
    const portDescriptors = PortDescriptor.createPortDescriptors(node)
    const model = new FreeNodePortLocationModel()
    const ports: IPort[] = []

    // iterate through all descriptors and add their ports, using the descriptor as the tag for the port
    portDescriptors.forEach(descriptor => {
      // use the descriptor's location as offset
      const portLocationModelParameter = model.createParameter(
        node,
        new Point(descriptor.x, descriptor.y)
      )
      const port = graph
        ? graph.addPort(node, portLocationModelParameter)
        : new SimplePort(node, portLocationModelParameter)
      port.tag = descriptor
      if (!graph) {
        ports.push(port)
      }
    })

    if (!graph) {
      ;(node as SimpleNode).ports = new ListEnumerable(ports)
    }
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
