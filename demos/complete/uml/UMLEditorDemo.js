/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

/**
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  './UMLNodeStyle.js',
  './UMLClassModel.js',
  './UMLEdgeStyleFactory.js',
  './UMLContextButtonsInputMode.js',
  'yfiles/view-graphml',
  'yfiles/router-polyline',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (yfiles, app, style, umlModel, UMLEdgeStyleFactory, UMLContextButtonsInputMode) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('#graphComponent')
    graphComponent.graph.undoEngineEnabled = true

    // configure the input mode
    graphComponent.inputMode = createInputMode()

    // configures default styles for newly created graph elements
    graphComponent.graph.nodeDefaults.style = new style.UMLNodeStyle(new umlModel.UMLClassModel())
    graphComponent.graph.nodeDefaults.shareStyleInstance = false
    graphComponent.graph.nodeDefaults.size = new yfiles.geometry.Size(125, 100)

    // bootstrap the sample graph
    generateSampleGraph()
    executeLayout().then(() => {
      // the sample graph bootstrapping should not be undoable
      graphComponent.graph.undoEngine.clear()
    })

    // bind the demo buttons to their commands
    registerCommands()

    // initialize the demo application's CSS and Javascript for the description
    app.show()
  }

  function executeLayout() {
    // create a directed orthogonal layout with reversed layout orientation to place the target nodes of the directed
    // edges above their source nodes
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.orthogonalRouting = true
    layout.edgeLayoutDescriptor.minimumFirstSegmentLength = 25
    layout.edgeLayoutDescriptor.minimumLastSegmentLength = 25
    layout.edgeLayoutDescriptor.minimumDistance = 25

    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    // mark all inheritance edges (generalization, realization) as directed so their target nodes
    // will be placed above their source nodes
    // all other edges are treated as undirected
    layoutData.edgeDirectedness.delegate = edge =>
      UMLEdgeStyleFactory.isInheritance(edge.style) ? 1 : 0
    // combine all inheritance edges (generalization, realization) in edge groups according to
    // their line type
    // do not group the other edges
    layoutData.sourceGroupIds.delegate = edge => getGroupId(edge, 'src')
    layoutData.targetGroupIds.delegate = edge => getGroupId(edge, 'tgt')

    return graphComponent.morphLayout(layout, '500ms', layoutData)
  }

  /**
   * Returns an edge group id according to the edge style.
   * @param {yfiles.graph.IEdge} edge
   * @param {string} marker
   * @return {object|null}
   */
  function getGroupId(edge, marker) {
    if (edge.style instanceof yfiles.styles.PolylineEdgeStyle) {
      const edgeStyle = edge.style
      return UMLEdgeStyleFactory.isInheritance(edgeStyle)
        ? edgeStyle.stroke.dashStyle + marker
        : null
    }
    return null
  }

  /**
   * Configure interaction.
   */
  function createInputMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      // we want to adjust the size of new nodes before rendering them
      nodeCreator: (context, graph, location, parent) => {
        const layout = yfiles.geometry.Rect.fromCenter(location, graph.nodeDefaults.size)
        const styleInstance = graph.nodeDefaults.getStyleInstance()
        const node = graph.createNode(parent, layout, styleInstance)
        node.style.adjustSize(node, graphComponent.inputMode)
        return node
      },
      allowAddLabel: false
    })
    mode.orthogonalEdgeEditingContext.enabled = true

    // configure createEdgeInputMode to also create a node if edge creation ends on an empty canvas
    const createEdgeInputMode = mode.createEdgeInputMode
    createEdgeInputMode.dummyEdgeGraph.nodeDefaults.style = new style.UMLNodeStyle(
      new umlModel.UMLClassModel()
    )
    createEdgeInputMode.dummyEdgeGraph.nodeDefaults.size = new yfiles.geometry.Size(125, 100)
    createEdgeInputMode.addTargetPortCandidateChangedListener((src, args) => {
      const dummyEdgeGraph = createEdgeInputMode.dummyEdgeGraph
      if (args.item && yfiles.graph.INode.isInstance(args.item.owner)) {
        dummyEdgeGraph.setStyle(
          createEdgeInputMode.dummyTargetNode,
          yfiles.styles.VoidNodeStyle.INSTANCE
        )
      } else {
        dummyEdgeGraph.setStyle(
          createEdgeInputMode.dummyTargetNode,
          dummyEdgeGraph.nodeDefaults.style
        )
      }
    })
    createEdgeInputMode.prematureEndHitTestable = yfiles.input.IHitTestable.ALWAYS
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
        new yfiles.input.DefaultPortCandidate(
          node,
          yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
        ),
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
      if (
        yfiles.graph.INode.isInstance(args.item) &&
        args.item.style instanceof style.UMLNodeStyle
      ) {
        args.item.style.nodeClicked(src, args)
      }
    })

    return mode
  }

  /**
   * Routes all edges that connect to selected nodes. This is used when a selection of nodes is moved or resized.
   */
  function routeEdgesAtSelectedNodes() {
    const edgeRouter = new yfiles.router.EdgeRouter()
    edgeRouter.scope = yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES

    const routerData = new yfiles.router.PolylineEdgeRouterData()
    routerData.affectedNodes.delegate = node =>
      graphComponent.selection.selectedNodes.isSelected(node)

    const layoutExecutor = new yfiles.layout.LayoutExecutor(graphComponent, edgeRouter)
    layoutExecutor.layoutData = routerData
    layoutExecutor.duration = yfiles.lang.TimeSpan.fromMilliseconds(500)
    layoutExecutor.animateViewport = false
    layoutExecutor.updateContentRect = false
    layoutExecutor.start()
  }

  /**
   * Routes just the given edge without adjusting the view port. This is used for applying an initial layout to newly
   * created edges.
   * @param affectedEdge
   */
  function routeEdge(affectedEdge) {
    const edgeRouter = new yfiles.router.EdgeRouter()
    edgeRouter.scope = yfiles.router.Scope.ROUTE_AFFECTED_EDGES

    const routerData = new yfiles.router.PolylineEdgeRouterData()
    routerData.affectedEdges.delegate = edge => edge === affectedEdge

    const layoutExecutor = new yfiles.layout.LayoutExecutor(graphComponent, edgeRouter)
    layoutExecutor.layoutData = routerData
    layoutExecutor.duration = yfiles.lang.TimeSpan.fromMilliseconds(500)
    layoutExecutor.animateViewport = false
    layoutExecutor.updateContentRect = false
    layoutExecutor.start()
  }

  /**
   * Creates a sample graph.
   */
  function generateSampleGraph() {
    const graph = graphComponent.graph

    const iAddressable = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          stereotype: 'interface',
          className: 'IAddressable',
          attributes: ['name', 'address', 'email'],
          operations: []
        }),
        yfiles.view.Fill.SEA_GREEN
      )
    })

    const user = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          className: 'User',
          attributes: ['name', 'address', 'email', 'userId', 'password', 'loginState'],
          operations: ['verifyLogin()']
        })
      )
    })

    const sessionManager = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          className: 'SessionManager',
          attributes: ['userId', 'departmentName'],
          operations: ['getUser()', 'getDepartment()']
        })
      )
    })

    const product = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          className: 'Product',
          attributes: ['productId', 'name', 'description', 'price', 'imageFileName'],
          operations: ['displayProduct()', 'getProductDetails()']
        })
      )
    })

    const category = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          className: 'Category',
          attributes: ['categoryId', 'departmentId', 'name', 'description'],
          operations: ['getProductInCategory()']
        })
      )
    })

    const department = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          className: 'Department',
          attributes: ['departmentId', 'name', 'description'],
          operations: ['getCategoryInDepartment()']
        })
      )
    })

    const customer = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          className: 'Customer',
          attributes: ['name', 'address', 'email', 'phone', 'creditcardInfo', 'shippingInfo'],
          operations: ['register()', 'login()', 'search()']
        })
      )
    })

    const administrator = graph.createNode({
      style: new style.UMLNodeStyle(
        new umlModel.UMLClassModel({
          className: 'Administrator',
          attributes: ['name', 'address', 'email', 'scope'],
          operations: ['updateCatalog()']
        })
      )
    })

    graph.createEdge(sessionManager, user, UMLEdgeStyleFactory.createAggregationStyle())
    graph.createEdge(department, sessionManager, UMLEdgeStyleFactory.createAggregationStyle())
    graph.createEdge(department, category, UMLEdgeStyleFactory.createAggregationStyle())
    graph.createEdge(category, product, UMLEdgeStyleFactory.createAggregationStyle())
    graph.createEdge(user, customer, UMLEdgeStyleFactory.createGeneralizationStyle())
    graph.createEdge(user, administrator, UMLEdgeStyleFactory.createGeneralizationStyle())
    graph.createEdge(iAddressable, user, UMLEdgeStyleFactory.createRealizationStyle())

    graph.nodes.forEach(node => {
      if (node.style instanceof style.UMLNodeStyle) {
        node.style.adjustSize(node, graphComponent.inputMode)
      }
    })
  }

  function registerCommands() {
    const gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
    })
    const graphmlHandler = new yfiles.graphml.GraphMLIOHandler()
    graphmlHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0',
      style
    )
    graphmlHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0',
      umlModel
    )
    graphmlHandler.addNamespace('http://www.yworks.com/yFilesHTML/demos/UMLDemoStyle/1.0', 'uml')
    graphmlHandler.addHandleSerializationListener(style.UMLNodeStyleSerializationListener)
    graphmlHandler.addHandleSerializationListener(umlModel.UMLClassModelSerializationListener)

    gs.graphMLIOHandler = graphmlHandler

    const iCommand = yfiles.input.ICommand
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    })
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent)

    app.bindAction("button[data-command='Layout']", executeLayout)
  }

  // start demo
  run()
})
