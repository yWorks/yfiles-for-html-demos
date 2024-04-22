/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Fill,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  HierarchicLayout,
  HierarchicLayoutData,
  IEdge,
  IGraph,
  IHitTestable,
  IInputModeContext,
  INode,
  IPortCandidate,
  LayoutExecutor,
  License,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  Rect,
  RoutingPolicy,
  Size,
  StorageLocation,
  VoidNodeStyle
} from 'yfiles'

import {
  createAggregationStyle,
  createGeneralizationStyle,
  createRealizationStyle,
  isInheritance
} from './UMLEdgeStyleFactory'
import * as umlModel from './UMLClassModel'
import UMLStyle, { UMLNodeStyle, UMLNodeStyleSerializationListener } from './UMLNodeStyle'
import { ButtonInputMode, ButtonTrigger } from '../../input/button-input-mode/ButtonInputMode'
import { createEdgeCreationButtons, createExtensibilityButtons } from './UMLContextButtonFactory'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { configureTwoPointerPanning } from 'demo-utils/configure-two-pointer-panning'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // configure the input mode
  graphComponent.inputMode = createInputMode()

  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)

  // configures default styles for newly created graph elements
  graphComponent.graph.nodeDefaults.style = new UMLNodeStyle(new umlModel.UMLClassModel())
  graphComponent.graph.nodeDefaults.shareStyleInstance = false
  graphComponent.graph.nodeDefaults.size = new Size(125, 100)

  // bootstrap the sample graph
  generateSampleGraph()
  await executeLayout()

  graphComponent.graph.undoEngineEnabled = true

  enableGraphML()

  // bind the demo buttons to their functionality
  initializeUI()
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
    edgeDirectedness: (edge: IEdge): 1 | 0 =>
      isInheritance(edge.style as PolylineEdgeStyle) ? 1 : 0,
    // combine all inheritance edges (generalization, realization) in edge groups according to
    // their line type
    // do not group the other edges
    sourceGroupIds: (edge: IEdge) => getGroupId(edge, `src-${edge.sourceNode}`),
    targetGroupIds: (edge: IEdge) => getGroupId(edge, `tgt-${edge.targetNode}`)
  })

  return graphComponent.morphLayout(layout, '500ms', layoutData)
}

/**
 * Returns an edge group id according to the edge style.
 */
function getGroupId(edge: IEdge, marker: string): string | null {
  if (edge.style instanceof PolylineEdgeStyle) {
    const edgeStyle = edge.style
    if (isInheritance(edgeStyle)) {
      const stroke = edgeStyle.stroke
      if (stroke) {
        return `${stroke.dashStyle}${marker}`
      }
    }
  }
  return null
}

/**
 * Configure interaction.
 */
function createInputMode(): GraphEditorInputMode {
  const mode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    // we want to adjust the size of new nodes before rendering them
    nodeCreator: (
      context: IInputModeContext,
      graph: IGraph,
      location: Point,
      parent: INode | null
    ) => {
      const layout = Rect.fromCenter(location, graph.nodeDefaults.size)
      const styleInstance = graph.nodeDefaults.getStyleInstance()
      const node = graph.createNode(parent, layout, styleInstance)
      ;(node.style as UMLNodeStyle).adjustSize(
        node,
        graphComponent.inputMode as GraphEditorInputMode
      )
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
  createEdgeInputMode.addTargetPortCandidateChangedListener((_, evt) => {
    const dummyEdgeGraph = createEdgeInputMode.dummyEdgeGraph
    if (evt.item && INode.isInstance(evt.item.owner)) {
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
    context: IInputModeContext,
    graph: IGraph,
    sourcePortCandidate: IPortCandidate,
    targetPortCandidate: IPortCandidate | null,
    templateEdge: IEdge
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
  // const umlContextButtonsInputMode = new UMLContextButtonsInputMode()
  // umlContextButtonsInputMode.priority = mode.clickInputMode.priority - 1
  // mode.add(umlContextButtonsInputMode)
  const bim = new ButtonInputMode()
  bim.buttonTrigger = ButtonTrigger.CURRENT_ITEM
  bim.addQueryButtonsListener((buttonInput, queryEvent) => {
    if (queryEvent.owner instanceof INode) {
      const node = queryEvent.owner
      const style = node.style
      if (style instanceof UMLNodeStyle) {
        createExtensibilityButtons(buttonInput, queryEvent, style)
        createEdgeCreationButtons(buttonInput, queryEvent)
      }
    }
  })
  mode.add(bim)

  // execute a layout after certain gestures
  mode.moveInputMode.addDragFinishedListener((_, evt) => routeEdges())
  mode.handleInputMode.addDragFinishedListener((_, evt) => routeEdges())
  createEdgeInputMode.addEdgeCreatedListener((_, evt) => routeEdges())

  // hide the edge creation buttons when the empty canvas was clicked
  mode.addCanvasClickedListener((_, evt) => {
    graphComponent.currentItem = null
  })

  // the UMLNodeStyle should handle clicks itself
  mode.addItemClickedListener((inputMode, evt) => {
    if (INode.isInstance(evt.item) && evt.item.style instanceof UMLNodeStyle) {
      evt.item.style.nodeClicked(inputMode, evt)
    }
  })

  return mode
}

/**
 * Routes edges which need to be re-routed. This is called after an input gesture.
 */
function routeEdges(): void {
  const edgeRouter = new EdgeRouter()
  // route all edge segments which need to be re-routed.
  edgeRouter.defaultEdgeLayoutDescriptor.routingPolicy = RoutingPolicy.SEGMENTS_AS_NEEDED

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: edgeRouter,
    duration: '0.5s',
    animateViewport: false,
    updateContentRect: false
  })
  layoutExecutor.start()
}

/**
 * Creates a sample graph.
 */
function generateSampleGraph(): void {
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

  graph.nodes.forEach((node) => {
    if (node.style instanceof UMLNodeStyle) {
      node.style.adjustSize(node, graphComponent.inputMode as GraphEditorInputMode)
    }
  })
}

/**
 * Enables loading and saving the demo's model graph from and to GraphML.
 */
function enableGraphML(): void {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  const namespaceUri = 'http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0'

  // enable serialization of the UML styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(namespaceUri, UMLStyle)
  gs.graphMLIOHandler.addXamlNamespaceMapping(namespaceUri, umlModel)
  gs.graphMLIOHandler.addNamespace(namespaceUri, 'uml')
  gs.graphMLIOHandler.addHandleSerializationListener(UMLNodeStyleSerializationListener)
  gs.graphMLIOHandler.addHandleSerializationListener(umlModel.UMLClassModelSerializationListener)
}

function initializeUI(): void {
  document.querySelector<HTMLButtonElement>('#layout')!.addEventListener('click', executeLayout)
}

run().then(finishLoading)
