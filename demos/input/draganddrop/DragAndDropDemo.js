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
  Arrow,
  ArrowNodeStyle,
  Class,
  DefaultLabelStyle,
  DefaultPortCandidate,
  DragDropEffects,
  DragDropItem,
  DragSource,
  ExteriorLabelModel,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridSnapTypes,
  GroupNodeLabelModel,
  GroupNodeStyle,
  ICommand,
  IEdge,
  IEdgeStyle,
  ILabel,
  ImageNodeStyle,
  INode,
  IPort,
  LabelDropInputMode,
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

import { DragAndDropPanel } from '../../utils/DndPanel.js'
import { DragAndDropPanelItem, NativeDragAndDropPanel } from './NativeDragAndDropPanel.js'
import {
  addClass,
  bindChangeListener,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import { nativeDragAndDropSupported } from '../../utils/Workarounds.js'
import EdgeDropInputMode from './EdgeDropInputMode.js'
import {
  applyDemoTheme,
  createDemoGroupStyle,
  createDemoNodeStyle,
  initDemoStyles
} from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

Class.ensure(Arrow)

/**
 * The panel containing the palette of elements to drop onto the graph component using native drag and drop.
 * @type {NativeDragAndDropPanel}
 */
let nativeDragAndDropPanel = null

/**
 * The panel containing the palette of elements to drop onto the graph component using yFiles drag and drop.
 * @type {DragAndDropPanel}
 */
let dragAndDropPanel = null

/**
 *  This demo shows how to enable drag and drop functionality for nodes using class
 *  {@link NodeDropInputMode}.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  const graph = graphComponent.graph

  // configure the input mode
  configureInputModes(graphComponent)

  // initialize the drag and drop panel
  initializeDnDPanel(graphComponent)

  // enable the undo engine
  graph.undoEngineEnabled = true

  // init demo styles
  initDemoStyles(graph)
  const portStyle = new NodeStylePortStyleAdapter(
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

  graph.nodeDefaults.size = new Size(60, 40)
  graph.nodeDefaults.ports.style = portStyle
  graph.nodeDefaults.labels.style = defaultLabelStyle
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()
  graph.edgeDefaults.ports.style = portStyle
  graph.edgeDefaults.labels.style = defaultLabelStyle
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  // add initial graph
  createSampleGraph(graphComponent)

  // bind toolbar commands
  registerCommands(graphComponent)
  updateDisabledIndicator()

  showApp(graphComponent)
}

/**
 * Initializes the drag and drop panel.
 * @param {!GraphComponent} graphComponent
 */
function initializeDnDPanel(graphComponent) {
  // initialize panel for native drag and drop
  nativeDragAndDropPanel = new NativeDragAndDropPanel(
    document.getElementById('nativeDndPanel'),
    graphComponent
  )
  nativeDragAndDropPanel.populatePanel(createDnDPanelItems)

  // initialize panel for yFiles drag and drop
  dragAndDropPanel = new DragAndDropPanel(document.getElementById('dndPanel'))
  // Set the callback that starts the actual drag and drop operation
  dragAndDropPanel.beginDragCallback = (element, data) => {
    const dragPreview = element.cloneNode(true)
    dragPreview.style.margin = '0'

    let dragSource = null
    if (data instanceof ILabel) {
      dragSource = LabelDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    } else if (data instanceof IPort) {
      dragSource = PortDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    } else if (data instanceof IEdge) {
      new DragSource(element).startDrag(
        new DragDropItem(IEdge.$class.name, data),
        DragDropEffects.ALL
      )
    } else {
      dragSource = NodeDropInputMode.startDrag(
        element,
        data,
        DragDropEffects.ALL,
        true,
        dragPreview
      )
    }

    // let the GraphComponent handle the preview rendering if possible
    if (dragSource) {
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          removeClass(dragPreview, 'hidden')
        } else {
          addClass(dragPreview, 'hidden')
        }
      })
    }
  }

  dragAndDropPanel.maxItemWidth = 160
  dragAndDropPanel.populatePanel(createDnDPanelItems)
}

/**
 * Creates the items that provide the visualizations for the style panel.
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

  const groupNode = new SimpleNode()
  groupNode.layout = new Rect(0, 0, 80, 80)
  groupNode.style = groupNodeStyle
  const groupLabel = new SimpleLabel(
    groupNode,
    'Group Node',
    new GroupNodeLabelModel().createTabBackgroundParameter()
  )
  groupLabel.style = groupLabelStyle
  groupNode.labels = new ListEnumerable([groupLabel])
  itemContainer.push(new DragAndDropPanelItem(groupNode, 'Group Node'))

  const demoStyleNode = new SimpleNode()
  demoStyleNode.layout = new Rect(0, 0, 60, 40)
  demoStyleNode.style = createDemoNodeStyle()
  itemContainer.push(new DragAndDropPanelItem(demoStyleNode, 'Demo Node'))

  const shapeStyleNode = new SimpleNode()
  shapeStyleNode.layout = new Rect(0, 0, 60, 40)
  shapeStyleNode.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: 'rgb(255, 140, 0)',
    fill: 'rgb(255, 140, 0)'
  })
  itemContainer.push(new DragAndDropPanelItem(shapeStyleNode, 'Shape Node'))

  const arrowNode = new SimpleNode()
  arrowNode.layout = new Rect(0, 0, 60, 40)
  arrowNode.style = new ArrowNodeStyle({
    fill: 'rgb(255, 140, 0)'
  })
  itemContainer.push(new DragAndDropPanelItem(arrowNode, 'Arrow Node'))

  const imageStyleNode = new SimpleNode()
  imageStyleNode.layout = new Rect(0, 0, 60, 60)
  imageStyleNode.style = new ImageNodeStyle('resources/y.svg')
  itemContainer.push(new DragAndDropPanelItem(imageStyleNode, 'Image Node'))

  const portNode = new SimpleNode()
  portNode.layout = new Rect(0, 0, 5, 5)
  portNode.style = new VoidNodeStyle()
  const port = new SimplePort(portNode, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
  port.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      fill: 'darkblue',
      stroke: 'cornflowerblue',
      shape: 'ellipse'
    })
  )
  portNode.tag = port
  portNode.ports = new ListEnumerable([port])
  itemContainer.push(new DragAndDropPanelItem(portNode, 'Port'))

  const labelNode = new SimpleNode()
  labelNode.layout = new Rect(0, 0, 5, 5)
  labelNode.style = new VoidNodeStyle()

  const labelStyle = new DefaultLabelStyle({
    backgroundStroke: 'rgb(101, 152, 204)',
    backgroundFill: 'white',
    insets: [3, 5, 3, 5]
  })

  const label = new SimpleLabel(
    labelNode,
    'label',
    FreeNodeLabelModel.INSTANCE.createDefaultParameter()
  )
  label.style = labelStyle
  label.preferredSize = labelStyle.renderer.getPreferredSize(label, labelStyle)
  labelNode.tag = label
  labelNode.labels = new ListEnumerable([label])
  itemContainer.push(new DragAndDropPanelItem(labelNode, 'Label'))

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

  itemContainer.push(new DragAndDropPanelItem(edge1, 'Default'))
  itemContainer.push(new DragAndDropPanelItem(edge2, 'Bidirectional'))
  itemContainer.push(new DragAndDropPanelItem(edge3, 'Dashed'))

  return itemContainer
}

/**
 * Enables support for dropping edges on the given {@link GraphEditorInputMode}.
 * @param {!GraphEditorInputMode} mode
 */
function configureEdgeDropInputMode(mode) {
  const edgeDropInputMode = new EdgeDropInputMode()
  let originalEdgeDefaultStyle

  // This method is called when an edge style is dropped onto the canvas. The edge
  // may be dropped onto a node, another edge or onto the empty canvas.
  edgeDropInputMode.itemCreator = (ctx, graph, draggedItem, dropTarget, dropLocation) => {
    if (!(draggedItem instanceof IEdge)) {
      return null
    }
    // Use the dropped edge style for changed/created edges.
    const style = draggedItem.style

    if (dropTarget instanceof IEdge) {
      // Set the style of the edge at the drop location to the dropped style.
      graph.setStyle(dropTarget, style)
    } else {
      // Look for a node at the drop location.
      const node = dropTarget instanceof INode ? dropTarget : graph.createNodeAt(dropLocation)
      // Start the creation of an edge from the node at a suitable port candidate
      // for the drop location with the dropped edge style.
      const candidateLocation = graph.nodeDefaults.ports.getLocationParameterInstance(node)
      const candidate = new DefaultPortCandidate(node, candidateLocation)

      const geim = ctx.canvasComponent.inputMode
      const createEdgeInputMode = geim.createEdgeInputMode

      // store the previous edge style
      originalEdgeDefaultStyle = createEdgeInputMode.edgeDefaults.style
      // change the edge style only for the one dropped onto the canvas
      createEdgeInputMode.edgeDefaults.style = style
      // change the edge style only for the one dropped onto the canvas
      createEdgeInputMode.dummyEdgeGraph.setStyle(createEdgeInputMode.dummyEdge, style)

      createEdgeInputMode.doStartEdgeCreation(candidate)
    }
    ctx.canvasComponent.focus()
    return null
  }

  // register the EdgeDropInputMode on the GraphEditorInputMode
  mode.add(edgeDropInputMode)

  const createEdgeInputMode = mode.createEdgeInputMode
  createEdgeInputMode.addEdgeCreatedListener(() => {
    if (originalEdgeDefaultStyle) {
      createEdgeInputMode.edgeDefaults.style = originalEdgeDefaultStyle
      originalEdgeDefaultStyle = null
    }
  })
}

/**
 * Configures the input mode for the given graphComponent.
 * @param {!GraphComponent} graphComponent
 */
function configureInputModes(graphComponent) {
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
    // initially disables snapping fo the dragged element to existing elements
    snappingEnabled: false,
    // by default the mode available in GraphEditorInputMode is disabled, so first enable it
    enabled: true,
    // nodes that have a GroupNodeStyle assigned have to be created as group nodes
    isGroupNodePredicate: draggedNode => draggedNode.style instanceof GroupNodeStyle
  })

  mode.labelDropInputMode = new LabelDropInputMode({
    showPreview: true,
    snappingEnabled: false,
    enabled: true,
    useBestMatchingParameter: true,
    // allow for nodes and edges to be the new label owner
    isValidLabelOwnerPredicate: labelOwner =>
      labelOwner instanceof INode || labelOwner instanceof IEdge || labelOwner instanceof IPort
  })

  mode.portDropInputMode = new PortDropInputMode({
    showPreview: true,
    snappingEnabled: false,
    enabled: true,
    useBestMatchingParameter: true,
    // allow only for nodes to be the new port owner
    isValidPortOwnerPredicate: portOwner => portOwner instanceof INode
  })

  // configure the edge drop input mode
  configureEdgeDropInputMode(mode)

  graphComponent.inputMode = mode
}

/**
 * Creates an initial sample graph.
 * @param {!GraphComponent} graphComponent
 */
function createSampleGraph(graphComponent) {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt([0, 0])
  const node2 = graph.createNodeAt([-50, 80])
  const node3 = graph.createNodeAt([50, 80])
  const node4 = graph.createNode({
    layout: [25, 150, 50, 50],
    style: new ImageNodeStyle('resources/y.svg')
  })
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
  graph.createEdge(node3, node4)
  graph.addLabel(node4, 'label', ExteriorLabelModel.SOUTH)

  graphComponent.fitGraphBounds()
}

/**
 * Wires up the UI.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindChangeListener("select[data-command='FeaturesChanged']", () =>
    onFeaturesChanged(graphComponent)
  )
}

/**
 * Configures the NodeDropInputMode based on the selected combobox index.
 * @param {!GraphComponent} graphComponent The given graphComponent
 */
function onFeaturesChanged(graphComponent) {
  const disabledIndicator = document.getElementById('disabled-indicator')
  const geim = graphComponent.inputMode
  const nodeDropInputMode = geim.nodeDropInputMode
  const featureComboBox = document.getElementById('featuresComboBox')

  switch (featureComboBox.selectedIndex) {
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

  if (!nativeDragAndDropSupported) {
    disabledIndicator.style.display = 'block'
  }
}

function updateDisabledIndicator() {
  if (!nativeDragAndDropSupported) {
    const disabledIndicator = document.getElementById('disabled-indicator')
    disabledIndicator.style.display = 'block'
    const disabledMessage = document.getElementById('disabled-message')
    disabledMessage.innerText = 'Native Drag and Drop is not supported in your Browser'
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
