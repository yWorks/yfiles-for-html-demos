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

require([
  'yfiles/view-component',
  'resources/demo-app',
  'Employee.js',
  'PropertiesView.js',
  'resources/OrgChartData.js',
  'yfiles/view-editor',
  'yfiles/view-layout-bridge',
  'yfiles/layout-organic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  Employee,
  PropertiesView,
  orgChartData
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * The properties view displayed in the side-bar.
   * @type {PropertiesView}
   */
  let propertiesView = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // setup the binding converters
    initConverters()

    // initialize the graph item styles
    configureStyles()

    initialize()

    app.show(graphComponent)
  }

  /**
   * Configures the default style for group nodes.
   */
  function configureStyles() {
    const graph = graphComponent.graph

    // use an elliptical shape for the node outline to match the template shape
    const outlinePath = new yfiles.geometry.GeneralPath()
    // the path is interpreted as normalized - spanning from 0/0 to 1/1
    outlinePath.appendEllipse(new yfiles.geometry.Rect(0, 0, 1, 1), true)

    // create the node style
    // use a minimum size so the nodes cannot be made smaller
    graph.nodeDefaults.style = new yfiles.styles.TemplateNodeStyle({
      renderTemplateId: 'orgchart-node-template',
      minimumSize: [100, 100],
      normalizedOutline: outlinePath
    })

    // create the edge label style
    graph.edgeDefaults.labels.style = new yfiles.styles.TemplateLabelStyle({
      renderTemplateId: 'orgchart-label-template',
      preferredSize: [100, 30]
    })

    // create the port style
    graph.nodeDefaults.ports.style = new yfiles.styles.TemplatePortStyle({
      renderTemplateId: 'orgchart-port-template',
      renderSize: [20, 20],
      normalizedOutline: outlinePath
    })

    // use a PolylineEdgeStyle instance with a dotted stroke for the edge
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: new yfiles.view.Stroke({
        fill: 'rgb(229,233,240)',
        dashStyle: new yfiles.view.DashStyle([0.125, 2], 10),
        lineCap: 'ROUND',
        thickness: 8
      }),
      sourceArrow: yfiles.styles.IArrow.NONE,
      targetArrow: yfiles.styles.IArrow.NONE
    })

    graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.EdgePathLabelModel({
      sideOfEdge: yfiles.graph.EdgeSides.ABOVE_EDGE,
      distance: 5
    }).createDefaultParameter()
  }

  /**
   * Initializes the converter functions used in the bindings.
   */
  function initConverters() {
    // convert each business unit to its own color
    yfiles.styles.TemplateNodeStyle.CONVERTERS.backgroundColor = val => {
      switch (val) {
        case 'Executive Unit':
          return 'rgb(185,96,105)'
        case 'Accounting':
          return 'rgb(165,190,138)'
        case 'Marketing':
          return 'rgb(232,203,135)'
        case 'Engineering':
          return 'rgb(133,161,194)'
        case 'Sales':
          return 'rgb(177,142,174)'
        case 'Production':
          return 'rgb(143,192,209)'
        default:
          return 'rgb(229,233,240)'
      }
    }

    // convert a status to a color
    yfiles.styles.TemplateNodeStyle.CONVERTERS.statusColor = val => {
      switch (val) {
        case 'present':
          return 'rgb(110,165,106)'
        case 'busy':
          return 'rgb(161,96,164)'
        case 'unavailable':
        default:
          return 'rgb(231,93,82)'
      }
    }

    // convert the icon identifier to the image path
    yfiles.styles.TemplateNodeStyle.CONVERTERS.icon = val => `./resources/${val}.svg`

    // convert a node size to a font size
    yfiles.styles.TemplateNodeStyle.CONVERTERS.fontSize = val => (val / 10) | 0

    // convert a boolean to a visibility value
    yfiles.styles.TemplateNodeStyle.CONVERTERS.visibility = val => (val ? 'visible' : 'hidden')

    // A converter that does simple calculations, consisting of numbers, +, -, / and * as well as parentheses.
    // The parameter must contain the calculation expression. $v is replaced by the bound value.
    // This converter is used in the node template to calculate positions and sizes of elements based on the node size.
    // Please be careful where you use this code, since it contains an eval() call.
    yfiles.styles.TemplateNodeStyle.CONVERTERS.calc = (val, parameter) => {
      const expression = parameter.replace('$v', val)
      // for safety, check if the expression contains only allowed characters
      if (expression.match(/^[\d+-/()*]+$/g) !== null) {
        // eslint-disable-next-line no-eval
        return eval(expression)
      }
      return -1
    }
  }

  function initialize() {
    // initialize the graph
    initializeGraph()

    // create the graph items
    createSampleGraph()

    // initialize the input mode
    graphComponent.inputMode = new yfiles.input.GraphViewerInputMode()

    createPropertiesPanel()

    registerCommands()

    runLayout()
  }

  /**
   * Customizes the graph - in this case, the default node size is set and the default decoration for selection and
   * focus is removed.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    graph.nodeDefaults.size = new yfiles.geometry.Size(100, 100)

    // remove the default selection and focus decoration
    graph.decorator.nodeDecorator.selectionDecorator.hideImplementation()
    graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
  }

  /**
   * Creates the initial sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph

    // use TreeBuilder to automatically create a graph from the data
    const treeBuilder = new yfiles.binding.TreeBuilder(graph)
    treeBuilder.nodesSource = orgChartData.map(data => new Employee(data))
    treeBuilder.childBinding = 'subordinates'
    // create edge labels for assistant nodes only
    treeBuilder.edgeLabelBinding = val => (val.assistant ? 'Assistant' : null)
    treeBuilder.idBinding = 'email'
    treeBuilder.buildGraph()

    // adjust the node sizes to match their hierarchy level
    adjustNodeSizes(graph)
  }

  /**
   * Calculates the tree level of each node. Nodes higher up in the hierarchy are enlarged accordingly.
   * @param graph The graph
   */
  function adjustNodeSizes(graph) {
    // calculate the tree hierarchy levels using a BFS algorithm
    const graphAdapter = new yfiles.layout.LayoutGraphAdapter(graph)
    const layoutGraph = graphAdapter.createCopiedLayoutGraph()
    const rootNodes = new yfiles.algorithms.NodeList(
      graph.nodes
        .filter(node => graph.inDegree(node) === 0)
        .map(node => layoutGraph.getCopiedNode(node))
        .toArray()
    )
    const layerMap = layoutGraph.createNodeMap()
    const layers = yfiles.algorithms.Bfs.getLayers(layoutGraph, rootNodes, layerMap)

    // adjust the size of each node
    const baseSize = graph.nodeDefaults.size
    const growthFactor = 0.3
    graph.nodes.forEach(node => {
      const treeLevel = layers.length - layerMap.get(layoutGraph.getCopiedNode(node)) - 1
      const size = new yfiles.geometry.Size(
        baseSize.width + baseSize.width * treeLevel * growthFactor,
        baseSize.height + baseSize.height * treeLevel * growthFactor
      )
      graph.setNodeLayout(node, new yfiles.geometry.Rect(node.layout.topLeft, size))
    })
  }

  function createPropertiesPanel() {
    // Create the properties view that populates the "propertiesView" element with
    // the properties of the selected employee.
    const propertiesViewElement = document.getElementById('propertiesView')
    propertiesView = new PropertiesView(propertiesViewElement)

    // add a listener for the properties view
    graphComponent.addCurrentItemChangedListener((sender, args) => {
      propertiesView.showProperties(graphComponent.currentItem)
    })
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
  }

  function runLayout() {
    const layout = new yfiles.tree.BalloonLayout()
    layout.minimumNodeDistance = 10
    layout.minimumEdgeLength = 100
    layout.allowOverlaps = true

    // calculate the initial layout
    graphComponent.graph.applyLayout(layout)
    // move the ports from the node center to outside the node
    adjustPorts(graphComponent.graph)
    graphComponent.currentItem = graphComponent.graph.nodes.first()
    limitViewport()
    graphComponent.fitGraphBounds()
  }

  /**
   * Moves the ports from the node center to outside the node.
   */
  function adjustPorts(graph) {
    graph.edges.forEach(edge => {
      const sourcePort = edge.sourcePort
      const targetPort = edge.targetPort
      const sourcePortLocation = sourcePort.locationParameter.model.getLocation(
        sourcePort,
        sourcePort.locationParameter
      )
      const targetPortLocation = targetPort.locationParameter.model.getLocation(
        targetPort,
        targetPort.locationParameter
      )

      const v = targetPortLocation.subtract(sourcePortLocation).normalized
      const v2 = new yfiles.geometry.Point(-v.x, -v.y)
      adjustPort(sourcePort, v, graph)
      adjustPort(targetPort, v2, graph)
    })
  }

  /**
   * Moves a port on the given vector outside of its owner node.
   * @param port The port to adjust.
   * @param vector The vector on which the port should be moved.
   * @param graph The graph.
   */
  function adjustPort(port, vector, graph) {
    const node = port.owner
    const r = node.layout.width * 0.5
    const offset = 20

    graph.setPortLocationParameter(
      port,
      yfiles.graph.FreeNodePortLocationModel.INSTANCE.createParameterForRatios(
        new yfiles.geometry.Point(0.5, 0.5),
        vector.multiply(r + offset)
      )
    )
  }

  /**
   * Setup a ViewportLimiter that makes sure that the explorable region
   * doesn't exceed the graph size.
   */
  function limitViewport() {
    graphComponent.updateContentRect(new yfiles.geometry.Insets(100))
    const limiter = graphComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = graphComponent.contentRect
  }

  // start demo
  run()
})
