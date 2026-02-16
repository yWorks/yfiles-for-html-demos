/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Color,
  EdgeRouter,
  EdgeRouterData,
  EdgeRouterScope,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IHitTestable,
  INode,
  INodeStyle,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  PortCandidate,
  Rect,
  Size
} from '@yfiles/yfiles'

import {
  createAggregationStyle,
  createGeneralizationStyle,
  createRealizationStyle,
  isInheritance
} from './UMLEdgeStyleFactory'
import * as umlModel from './UMLClassModel'
import { UMLClassModelExtension } from './UMLClassModel'
import UMLStyle, { UMLNodeStyle, UMLNodeStyleSerializationListener } from './UMLNodeStyle'
import { ButtonInputMode } from '../../input/button-input-mode/ButtonInputMode'
import { createEdgeCreationButtons, createExtensibilityButtons } from './UMLContextButtonFactory'

import licenseData from '../../../lib/license.json'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'

let graphComponent

async function run() {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')
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

  // bind the demo buttons to their functionality
  initializeUI()
}

function executeLayout() {
  // configures the hierarchical layout
  const layout = new HierarchicalLayout()
  const eld = layout.defaultEdgeDescriptor
  eld.minimumFirstSegmentLength = 25
  eld.minimumLastSegmentLength = 25
  eld.minimumDistance = 25

  const layoutData = new HierarchicalLayoutData({
    // mark all inheritance edges (generalization, realization) as directed so their target nodes
    // will be placed above their source nodes
    // all other edges are treated as undirected
    edgeDirectedness: (edge) => (isInheritance(edge.style) ? 1 : 0),
    // combine all inheritance edges (generalization, realization) in edge groups according to
    // their line type
    // do not group the other edges
    sourceGroupIds: (edge) => getGroupId(edge, `src-${edge.sourceNode}`),
    targetGroupIds: (edge) => getGroupId(edge, `tgt-${edge.targetNode}`)
  })

  return graphComponent.applyLayoutAnimated(layout, '500ms', layoutData)
}

/**
 * Returns an edge group id according to the edge style.
 */
function getGroupId(edge, marker) {
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
function createInputMode() {
  const mode = new GraphEditorInputMode({
    // we want to adjust the size of new nodes before rendering them
    nodeCreator: (_context, graph, location, parent) => {
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
  createEdgeInputMode.previewGraph.nodeDefaults.style = new UMLNodeStyle(
    new umlModel.UMLClassModel()
  )
  createEdgeInputMode.previewGraph.nodeDefaults.size = new Size(125, 100)
  createEdgeInputMode.addEventListener('end-port-candidate-changed', (evt) => {
    const previewGraph = createEdgeInputMode.previewGraph
    if (evt.item && evt.item.owner instanceof INode) {
      previewGraph.setStyle(createEdgeInputMode.previewEndNode, INodeStyle.VOID_NODE_STYLE)
    } else {
      previewGraph.setStyle(createEdgeInputMode.previewEndNode, previewGraph.nodeDefaults.style)
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
    const dummyTargetNode = createEdgeInputMode.previewEndNode
    const node = graph.createNode(
      dummyTargetNode.layout.toRect(),
      dummyTargetNode.style.clone(),
      dummyTargetNode.tag
    )
    return edgeCreator(
      context,
      graph,
      sourcePortCandidate,
      new PortCandidate(node, FreeNodePortLocationModel.CENTER),
      templateEdge
    )
  }

  // add input mode that handles the edge creations buttons
  // const umlContextButtonsInputMode = new UMLContextButtonsInputMode()
  // umlContextButtonsInputMode.priority = mode.clickInputMode.priority - 1
  // mode.add(umlContextButtonsInputMode)
  const bim = new ButtonInputMode()
  bim.buttonTrigger = 'current-item'
  bim.setQueryButtonsListener((queryEvent, buttonInput) => {
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
  mode.moveSelectedItemsInputMode.addEventListener('drag-finished', () => routeEdges())
  mode.moveUnselectedItemsInputMode.addEventListener('drag-finished', () => routeEdges())
  mode.handleInputMode.addEventListener('drag-finished', () => routeEdges())
  createEdgeInputMode.addEventListener('edge-created', () => routeEdges())

  // hide the edge creation buttons when the empty canvas was clicked
  mode.addEventListener('canvas-clicked', () => {
    graphComponent.currentItem = null
  })

  // the UMLNodeStyle should handle clicks itself
  mode.addEventListener('item-clicked', (evt, inputMode) => {
    if (evt.item instanceof INode && evt.item.style instanceof UMLNodeStyle) {
      evt.item.style.nodeClicked(inputMode, evt)
    }
  })

  return mode
}

/**
 * Routes edges which need to be re-routed. This is called after an input gesture.
 */
async function routeEdges() {
  const edgeRouter = new EdgeRouter()
  const edgeRouterData = new EdgeRouterData()
  edgeRouterData.scope.edgeMapping = EdgeRouterScope.SEGMENTS_AS_NEEDED

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: edgeRouter,
    animationDuration: '0.5s',
    animateViewport: false,
    updateContentBounds: false
  })
  await layoutExecutor.start()
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
      Color.SEA_GREEN
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
      node.style.adjustSize(node, graphComponent.inputMode)
    }
  })
}

/**
 * Enables loading and saving the demo's model graph from and to GraphML.
 */
function enableGraphML() {
  const graphMLIOHandler = new GraphMLIOHandler()

  const namespaceUri = 'http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0'

  // enable serialization of the UML styles - without a namespace mapping, serialization will fail
  graphMLIOHandler.addXamlNamespaceMapping(namespaceUri, UMLStyle)
  graphMLIOHandler.addXamlNamespaceMapping(namespaceUri, umlModel)
  graphMLIOHandler.addNamespace(namespaceUri, 'uml')
  graphMLIOHandler.addEventListener('handle-serialization', UMLNodeStyleSerializationListener)
  graphMLIOHandler.addEventListener(
    'handle-serialization',
    umlModel.UMLClassModelSerializationListener
  )
  graphMLIOHandler.addTypeInformation(UMLClassModelExtension, {
    properties: {
      stereotype: { type: String },
      constraint: { type: String },
      className: { type: String },
      attributes: { type: Array },
      operations: { type: Array },
      attributesOpen: { type: Boolean },
      operationsOpen: { type: Boolean }
    }
  })
  return graphMLIOHandler
}

function initializeUI() {
  const graphMLIOHandler = enableGraphML()
  document.querySelector('#layout').addEventListener('click', executeLayout)
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openGraphML(graphComponent, graphMLIOHandler)
  })
  document.querySelector('#save-button').addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'umlEditor.graphml', graphMLIOHandler)
  })
}

run().then(finishLoading)
