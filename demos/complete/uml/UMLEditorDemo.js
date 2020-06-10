/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultPortCandidate,
  EdgeRouter,
  EdgeRouterScope,
  Fill,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  HierarchicLayout,
  HierarchicLayoutData,
  ICommand,
  IEdge,
  IHitTestable,
  INode,
  LayoutExecutor,
  License,
  OrthogonalEdgeEditingContext,
  PolylineEdgeRouterData,
  PolylineEdgeStyle,
  Rect,
  Size,
  StorageLocation,
  VoidNodeStyle
} from 'yfiles'

import UMLContextButtonsInputMode from './UMLContextButtonsInputMode.js'
import {
  createAggregationStyle,
  createGeneralizationStyle,
  createRealizationStyle,
  isInheritance
} from './UMLEdgeStyleFactory.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import * as umlModel from './UMLClassModel.js'
import UMLStyle, { UMLNodeStyle, UMLNodeStyleSerializationListener } from './UMLNodeStyle.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

async function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.graph.undoEngineEnabled = true

  // configure the input mode
  graphComponent.inputMode = createInputMode()

  // configures default styles for newly created graph elements
  graphComponent.graph.nodeDefaults.style = new UMLNodeStyle(new umlModel.UMLClassModel())
  graphComponent.graph.nodeDefaults.shareStyleInstance = false
  graphComponent.graph.nodeDefaults.size = new Size(125, 100)

  // bootstrap the sample graph
  generateSampleGraph()
  await executeLayout()
  // the sample graph bootstrapping should not be undoable
  graphComponent.graph.undoEngine.clear()

  // bind the demo buttons to their commands
  registerCommands()

  // initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

function executeLayout() {
  // configures the hierarchic layout
  const layout = new HierarchicLayout({
    orthogonalRouting: true
  })
  layout.edgeLayoutDescriptor.minimumFirstSegmentLength = 25
  layout.edgeLayoutDescriptor.minimumLastSegmentLength = 25
  layout.edgeLayoutDescriptor.minimumDistance = 25

  const layoutData = new HierarchicLayoutData({
    // mark all inheritance edges (generalization, realization) as directed so their target nodes
    // will be placed above their source nodes
    // all other edges are treated as undirected
    edgeDirectedness: edge => (isInheritance(edge.style) ? 1 : 0),
    // combine all inheritance edges (generalization, realization) in edge groups according to
    // their line type
    // do not group the other edges
    sourceGroupIds: edge => getGroupId(edge, 'src'),
    targetGroupIds: edge => getGroupId(edge, 'tgt')
  })

  return graphComponent.morphLayout(layout, '500ms', layoutData)
}

/**
 * Returns an edge group id according to the edge style.
 * @param {IEdge} edge
 * @param {string} marker
 * @return {object|null}
 */
function getGroupId(edge, marker) {
  if (edge.style instanceof PolylineEdgeStyle) {
    const edgeStyle = edge.style
    return isInheritance(edgeStyle) ? edgeStyle.stroke.dashStyle + marker : null
  }
  return null
}

/**
 * Configure interaction.
 */
function createInputMode() {
  const mode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    // we want to adjust the size of new nodes before rendering them
    nodeCreator: (context, graph, location, parent) => {
      const layout = Rect.fromCenter(location, graph.nodeDefaults.size)
      const styleInstance = graph.nodeDefaults.getStyleInstance()
      const node = graph.createNode(parent, layout, styleInstance)
      node.style.adjustSize(node, graphComponent.inputMode)
      return node
    },
    allowAddLabel: false
  })

  // configure createEdgeInputMode to also create a node if edge creation ends on an empty canvas
  const createEdgeInputMode = mode.createEdgeInputMode
  createEdgeInputMode.dummyEdgeGraph.nodeDefaults.style = new UMLNodeStyle(
    new umlModel.UMLClassModel()
  )
  createEdgeInputMode.dummyEdgeGraph.nodeDefaults.size = new Size(125, 100)
  createEdgeInputMode.addTargetPortCandidateChangedListener((src, args) => {
    const dummyEdgeGraph = createEdgeInputMode.dummyEdgeGraph
    if (args.item && INode.isInstance(args.item.owner)) {
      dummyEdgeGraph.setStyle(createEdgeInputMode.dummyTargetNode, VoidNodeStyle.INSTANCE)
    } else {
      dummyEdgeGraph.setStyle(
        createEdgeInputMode.dummyTargetNode,
        dummyEdgeGraph.nodeDefaults.style
      )
    }
  })
  createEdgeInputMode.prematureEndHitTestable = IHitTestable.ALWAYS
  createEdgeInputMode.forceSnapToCandidate = false
  const edgeCreator = createEdgeInputMode.edgeCreator
  createEdgeInputMode.edgeCreator = (
    context,
    graph,
    sourcePortCandidate,
    targetPortCandidate,
    templateEdge
  ) => {
    if (targetPortCandidate) {
      // an actual graph node was hit
      return edgeCreator(context, graph, sourcePortCandidate, targetPortCandidate, templateEdge)
    }
    // we use the artificial target node to create a new node at the current location
    const dummyTargetNode = createEdgeInputMode.dummyTargetNode
    const node = graph.createNode(
      dummyTargetNode.layout.toRect(),
      dummyTargetNode.style.clone(),
      dummyTargetNode.tag
    )
    return edgeCreator(
      context,
      graph,
      sourcePortCandidate,
      new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_CENTER_ANCHORED),
      templateEdge
    )
  }

  // add input mode that handles the edge creations buttons
  const umlContextButtonsInputMode = new UMLContextButtonsInputMode()
  umlContextButtonsInputMode.priority = mode.clickInputMode.priority - 1
  mode.add(umlContextButtonsInputMode)

  // execute a layout after certain gestures
  mode.moveInputMode.addDragFinishedListener((src, args) => routeEdgesAtSelectedNodes())
  mode.handleInputMode.addDragFinishedListener((src, args) => routeEdgesAtSelectedNodes())
  createEdgeInputMode.addEdgeCreatedListener((src, args) => routeEdge(args.item))

  // hide the edge creation buttons when the empty canvas was clicked
  mode.addCanvasClickedListener((src, args) => {
    graphComponent.currentItem = null
  })

  // the UMLNodeStyle should handle clicks itself
  mode.addItemClickedListener((src, args) => {
    if (INode.isInstance(args.item) && args.item.style instanceof UMLNodeStyle) {
      args.item.style.nodeClicked(src, args)
    }
  })

  return mode
}

/**
 * Routes all edges that connect to selected nodes. This is used when a selection of nodes is moved or resized.
 */
function routeEdgesAtSelectedNodes() {
  const edgeRouter = new EdgeRouter()
  edgeRouter.scope = EdgeRouterScope.ROUTE_EDGES_AT_AFFECTED_NODES

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: edgeRouter,
    layoutData: new PolylineEdgeRouterData({
      affectedNodes: node => graphComponent.selection.selectedNodes.isSelected(node)
    }),
    duration: '0.5s',
    updateContentRect: false
  })
  layoutExecutor.start()
}

/**
 * Routes just the given edge without adjusting the view port. This is used for applying an initial layout to newly
 * created edges.
 * @param affectedEdge
 */
function routeEdge(affectedEdge) {
  const edgeRouter = new EdgeRouter()
  edgeRouter.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: edgeRouter,
    layoutData: new PolylineEdgeRouterData({
      affectedEdges: edge => edge === affectedEdge
    }),
    duration: '0.5s',
    animateViewport: false,
    updateContentRect: false
  })
  layoutExecutor.start()
}

/**
 * Creates a sample graph.
 */
function generateSampleGraph() {
  const graph = graphComponent.graph

  const iAddressable = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        stereotype: 'interface',
        className: 'IAddressable',
        attributes: ['name', 'address', 'email'],
        operations: []
      }),
      Fill.SEA_GREEN
    )
  })

  const user = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        className: 'User',
        attributes: ['name', 'address', 'email', 'userId', 'password', 'loginState'],
        operations: ['verifyLogin()']
      })
    )
  })

  const sessionManager = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        className: 'SessionManager',
        attributes: ['userId', 'departmentName'],
        operations: ['getUser()', 'getDepartment()']
      })
    )
  })

  const product = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        className: 'Product',
        attributes: ['productId', 'name', 'description', 'price', 'imageFileName'],
        operations: ['displayProduct()', 'getProductDetails()']
      })
    )
  })

  const category = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        className: 'Category',
        attributes: ['categoryId', 'departmentId', 'name', 'description'],
        operations: ['getProductInCategory()']
      })
    )
  })

  const department = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        className: 'Department',
        attributes: ['departmentId', 'name', 'description'],
        operations: ['getCategoryInDepartment()']
      })
    )
  })

  const customer = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        className: 'Customer',
        attributes: ['name', 'address', 'email', 'phone', 'creditcardInfo', 'shippingInfo'],
        operations: ['register()', 'login()', 'search()']
      })
    )
  })

  const administrator = graph.createNode({
    style: new UMLNodeStyle(
      new umlModel.UMLClassModel({
        className: 'Administrator',
        attributes: ['name', 'address', 'email', 'scope'],
        operations: ['updateCatalog()']
      })
    )
  })

  graph.createEdge(sessionManager, user, createAggregationStyle())
  graph.createEdge(department, sessionManager, createAggregationStyle())
  graph.createEdge(department, category, createAggregationStyle())
  graph.createEdge(category, product, createAggregationStyle())
  graph.createEdge(user, customer, createGeneralizationStyle())
  graph.createEdge(user, administrator, createGeneralizationStyle())
  graph.createEdge(iAddressable, user, createRealizationStyle())

  graph.nodes.forEach(node => {
    if (node.style instanceof UMLNodeStyle) {
      node.style.adjustSize(node, graphComponent.inputMode)
    }
  })
}

function registerCommands() {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0',
    UMLStyle
  )
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0',
    umlModel
  )
  gs.graphMLIOHandler.addNamespace('http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0', 'uml')
  gs.graphMLIOHandler.addHandleSerializationListener(UMLNodeStyleSerializationListener)
  gs.graphMLIOHandler.addHandleSerializationListener(umlModel.UMLClassModelSerializationListener)

  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

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

  bindAction("button[data-command='Layout']", executeLayout)
}

// start demo
loadJson().then(run)
