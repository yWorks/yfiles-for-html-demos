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
  Arrow,
  ArrowNodeStyle,
  Class,
  DefaultLabelStyle,
  ExteriorLabelModel,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridSnapTypes,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicLayout,
  IEdge,
  ImageNodeStyle,
  INode,
  IPort,
  LabelDropInputMode,
  LayoutExecutor,
  License,
  ListEnumerable,
  NodeDropInputMode,
  NodeStylePortStyleAdapter,
  PolylineEdgeStyle,
  PortDropInputMode,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  SimpleEdge,
  SimpleLabel,
  SimpleNode,
  SimplePort,
  Size,
  VoidNodeStyle
} from 'yfiles'

import { DragAndDropPanel } from 'demo-utils/DragAndDropPanel'
import { NativeDragAndDropPanel } from './NativeDragAndDropPanel.js'
import { EdgeDropInputMode } from './EdgeDropInputMode.js'
import {
  applyDemoTheme,
  createDemoGroupStyle,
  createDemoNodeStyle,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './resources/graph-data.json'

Class.ensure(Arrow)

/**
 * The panel containing the palette of elements for yFiles drag and drop.
 * @type {DragAndDropPanel}
 */
let dragAndDropPanel = null
/**
 * The panel containing the palette of elements for native drag and drop.
 * @type {NativeDragAndDropPanel}
 */
let nativeDragAndDropPanel = null

/**
 *  This demo shows how to enable drag and drop functionality for nodes,
 *  edges, labels, and ports.
 *
 *  It uses the yFiles library classes {@link NodeDropInputMode}, {@link LabelDropInputMode},
 *  {@link PortDropInputMode}, and the custom class {@link EdgeDropInputMode}.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeInteraction(graphComponent)
  initializeDnDPanel(graphComponent)

  // init graph default styles and visual decorators
  const graph = graphComponent.graph
  initializeGraph(graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 })
  )
  graphComponent.fitGraphBounds()
  graphComponent.zoom = 2

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  initializeUI(graphComponent)
}

/**
 * Creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  const nodesSource = graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id
  })
  nodesSource.nodeCreator.styleProvider = (item) =>
    item.tag === 'icon' ? new ImageNodeStyle('resources/y.svg') : undefined
  nodesSource.nodeCreator.layoutProvider = (item) =>
    item.tag === 'icon' ? new Rect(0, 0, 50, 50) : undefined
  nodesSource.nodeCreator.createLabelBinding({
    text: (data) => data.label,
    layoutParameter: (_) => ExteriorLabelModel.SOUTH
  })

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Initializes the drag and drop panel.
 * @param {!GraphComponent} graphComponent
 */
function initializeDnDPanel(graphComponent) {
  initializeYFilesDnDPanel()
  initializeNativeDnDPanel(graphComponent)
}

/**
 * Creates the yFiles drag and drop panel and populates the visualization of the items that have to be displayed.
 */
function initializeYFilesDnDPanel() {
  dragAndDropPanel = new DragAndDropPanel(document.getElementById('dnd-panel'))
  dragAndDropPanel.maxItemWidth = 160
  dragAndDropPanel.populatePanel(createDnDPanelItems())
}

/**
 * Creates the native drag and drop panel and populates the visualization of the items that have to be displayed.
 * @param {!GraphComponent} graphComponent
 */
function initializeNativeDnDPanel(graphComponent) {
  nativeDragAndDropPanel = new NativeDragAndDropPanel(document.getElementById('native-dnd-panel'))
  nativeDragAndDropPanel.initialize(createDnDPanelItems(), graphComponent.inputMode)
}

/**
 * Creates the items that provide the visualizations for the drag and drop panels.
 * @returns {!Array.<DragAndDropPanelItem.<(INode|IEdge)>>}
 */
function createDnDPanelItems() {
  const itemContainer = []

  // Create some nodes
  const groupNodeStyle = createDemoGroupStyle({})

  // A label model with insets for the expand/collapse button
  const groupLabelStyle = new DefaultLabelStyle({
    textFill: 'white'
  })

  const groupNode = new SimpleNode({
    layout: new Rect(0, 0, 80, 80),
    style: groupNodeStyle
  })

  const groupLabel = new SimpleLabel({
    owner: groupNode,
    text: 'Group Node',
    layoutParameter: new GroupNodeLabelModel().createTabBackgroundParameter(),
    style: groupLabelStyle
  })
  groupNode.labels = new ListEnumerable([groupLabel])
  itemContainer.push({ modelItem: groupNode, tooltip: 'Group Node' })

  const demoStyleNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 40),
    style: createDemoNodeStyle()
  })
  itemContainer.push({ modelItem: demoStyleNode, tooltip: 'Demo Node' })

  const shapeStyleNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 40),
    style: new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      stroke: 'rgb(255, 140, 0)',
      fill: 'rgb(255, 140, 0)'
    })
  })
  itemContainer.push({ modelItem: shapeStyleNode, tooltip: 'Shape Node' })

  const arrowNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 40),
    style: new ArrowNodeStyle({
      fill: 'rgb(255, 140, 0)'
    })
  })
  itemContainer.push({ modelItem: arrowNode, tooltip: 'Arrow Node' })

  const imageStyleNode = new SimpleNode({
    layout: new Rect(0, 0, 60, 60),
    style: new ImageNodeStyle('resources/y.svg')
  })

  itemContainer.push({ modelItem: imageStyleNode, tooltip: 'Image Node' })

  const portNode = new SimpleNode({
    layout: new Rect(0, 0, 5, 5),
    style: new VoidNodeStyle()
  })

  const port = new SimplePort({
    owner: portNode,
    locationParameter: FreeNodePortLocationModel.NODE_CENTER_ANCHORED,
    style: new NodeStylePortStyleAdapter(
      new ShapeNodeStyle({
        fill: 'darkblue',
        stroke: 'cornflowerblue',
        shape: 'ellipse'
      })
    )
  })
  portNode.tag = port
  portNode.ports = new ListEnumerable([port])
  itemContainer.push({ modelItem: portNode, tooltip: 'Port' })

  const labelNode = new SimpleNode({
    layout: new Rect(0, 0, 5, 5),
    style: new VoidNodeStyle()
  })

  const labelStyle = new DefaultLabelStyle({
    backgroundStroke: 'rgb(101, 152, 204)',
    backgroundFill: 'white',
    insets: [3, 5, 3, 5]
  })

  const label = new SimpleLabel({
    owner: labelNode,
    text: 'label',
    layoutParameter: FreeNodeLabelModel.INSTANCE.createDefaultParameter(),
    style: labelStyle
  })
  label.preferredSize = labelStyle.renderer.getPreferredSize(label, labelStyle)
  labelNode.tag = label
  labelNode.labels = new ListEnumerable([label])
  itemContainer.push({ modelItem: labelNode, tooltip: 'Label' })

  const edge1 = new SimpleEdge({
    style: new PolylineEdgeStyle({
      smoothingLength: 100,
      targetArrow: 'triangle'
    })
  })
  const edge2 = new SimpleEdge({
    style: new PolylineEdgeStyle({
      sourceArrow: 'triangle',
      targetArrow: 'triangle'
    })
  })
  const edge3 = new SimpleEdge({
    style: new PolylineEdgeStyle({
      stroke: '2px dashed gray'
    })
  })

  itemContainer.push({ modelItem: edge1, tooltip: 'Default' })
  itemContainer.push({ modelItem: edge2, tooltip: 'Bidirectional' })
  itemContainer.push({ modelItem: edge3, tooltip: 'Dashed' })

  return itemContainer
}

/**
 * Initializes the graph.
 * Sets up styles and visual decorations of graph elements.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  initDemoStyles(graph)

  graph.nodeDefaults.size = new Size(60, 40)
  // draw a port with an elliptical shape
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      fill: 'darkblue',
      stroke: 'cornflowerblue',
      shape: 'ellipse'
    })
  )
  const defaultLabelStyle = new DefaultLabelStyle({
    backgroundStroke: 'rgb(101, 152, 204)',
    backgroundFill: 'white',
    insets: [3, 5, 3, 5]
  })
  graph.nodeDefaults.labels.style = defaultLabelStyle
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()
  graph.edgeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      fill: 'darkblue',
      stroke: 'cornflowerblue',
      shape: 'ellipse'
    })
  )
  graph.edgeDefaults.labels.style = defaultLabelStyle
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()
}

/**
 * Creates and activates a {@link GraphEditorInputMode} and configures it to enable drag and drop.
 * @param {!GraphComponent} graphComponent
 */
function initializeInteraction(graphComponent) {
  // configure the snapping context
  const mode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    snapContext: new GraphSnapContext({
      nodeToNodeDistance: 30,
      nodeToEdgeDistance: 20,
      snapOrthogonalMovement: false,
      snapDistance: 10,
      snapSegmentsToSnapLines: true,
      snapBendsToSnapLines: true,
      gridSnapType: GridSnapTypes.ALL
    })
  })

  // create a new NodeDropInputMode to configure the drag and drop operation
  mode.nodeDropInputMode = new NodeDropInputMode({
    // enables the display of the dragged element during the drag
    showPreview: true,
    // initially disables snapping for the dragged element to existing elements
    snappingEnabled: false,
    // by default the mode available in GraphEditorInputMode is disabled, so first enable it
    enabled: true,
    // nodes that have a GroupNodeStyle assigned have to be created as group nodes
    isGroupNodePredicate: (draggedNode) => draggedNode.style instanceof GroupNodeStyle
  })

  // create a new LabelDropInputMode to configure the drag and drop operation
  mode.labelDropInputMode = new LabelDropInputMode({
    showPreview: true,
    snappingEnabled: false,
    enabled: true,
    useBestMatchingParameter: true,
    // allow for nodes and edges to be the new label owner
    isValidLabelOwnerPredicate: (labelOwner) =>
      labelOwner instanceof INode || labelOwner instanceof IEdge || labelOwner instanceof IPort
  })

  // create a new PortDropInputMode to configure the drag and drop operation
  mode.portDropInputMode = new PortDropInputMode({
    showPreview: true,
    snappingEnabled: false,
    enabled: true,
    useBestMatchingParameter: true,
    // allow only for nodes to be the new port owner
    isValidPortOwnerPredicate: (portOwner) => portOwner instanceof INode
  })

  // add the edge drop input mode
  mode.add(new EdgeDropInputMode())

  graphComponent.inputMode = mode
}

/**
 * Registers event listeners for the snapping checkbox.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document
    .getElementById('preview-snapping-checkbox')
    .addEventListener('change', (e) => updatePreviewSnapping(e.currentTarget, graphComponent))
}

/**
 * Enables or disables preview snapping depending on the checkbox value.
 * @param {!HTMLInputElement} checkbox
 * @param {!GraphComponent} graphComponent
 */
function updatePreviewSnapping(checkbox, graphComponent) {
  const disabledIndicator = document.querySelector('#disabled-indicator')
  const nodeDropInputMode = graphComponent.inputMode.nodeDropInputMode

  if (checkbox.checked) {
    nodeDropInputMode.snappingEnabled = true
    disabledIndicator.style.display = 'block'
  } else {
    nodeDropInputMode.snappingEnabled = false
    disabledIndicator.style.display = 'none'
  }
}

void run().then(finishLoading)
