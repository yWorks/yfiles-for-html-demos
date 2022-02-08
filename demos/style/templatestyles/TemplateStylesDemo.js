/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  AdjacencyGraphBuilder,
  BalloonLayout,
  BfsAlgorithm,
  DashStyle,
  EdgeCreator,
  EdgePathLabelModel,
  EdgeSides,
  FreeNodePortLocationModel,
  GeneralPath,
  GraphComponent,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IEnumerable,
  IGraph,
  INode,
  Insets,
  IPort,
  LayoutGraphAdapter,
  License,
  LineCap,
  Point,
  PolylineEdgeStyle,
  Rect,
  Size,
  Stroke,
  TemplateLabelStyle,
  TemplateNodeStyle,
  TemplatePortStyle,
  YNodeList
} from 'yfiles'

import PropertiesView from './PropertiesView.js'
import OrgChartData from './resources/OrgChartData.js'
import { bindCommand, checkLicense, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * Specifies the properties of an employee, i.e. the business data associated to each node
 * in the demo's graph.
 * @typedef {Object} Employee
 * @property {string} position
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} fax
 * @property {string} businessUnit
 * @property {string} status
 * @property {string} icon
 * @property {IEnumerable.<Employee>} subordinates
 * @property {Employee} [parent]
 */

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  // setup the binding converters for the TemplateNodeStyle used to visualize the demo's nodes
  initConverters()

  const graphComponent = new GraphComponent('graphComponent')

  // initialize the default styles for nodes, edges, labels, and ports
  configureStyles(graphComponent.graph)

  initialize(graphComponent)

  showApp(graphComponent)
}

/**
 * Configures default styles for nodes, edges, labels, and ports.
 * Even though it is not possible to create new items in this demo, the default styles are
 * nevertheless used for the graph items created in method {@link #createGraph} below.
 * @param {!IGraph} graph
 */
function configureStyles(graph) {
  // use an elliptical shape for the node outline to match the template shape
  const outlinePath = new GeneralPath()
  // the path is interpreted as normalized - spanning from 0/0 to 1/1
  outlinePath.appendEllipse(new Rect(0, 0, 1, 1), true)

  // create the node style
  // use a minimum size so the nodes cannot be made smaller
  graph.nodeDefaults.style = new TemplateNodeStyle({
    renderTemplateId: 'orgchart-node-template',
    minimumSize: [100, 100],
    normalizedOutline: outlinePath
  })

  // create the edge label style
  graph.edgeDefaults.labels.style = new TemplateLabelStyle({
    renderTemplateId: 'orgchart-label-template',
    preferredSize: [100, 30]
  })

  // create the port style
  graph.nodeDefaults.ports.style = new TemplatePortStyle({
    renderTemplateId: 'orgchart-port-template',
    renderSize: [20, 20],
    normalizedOutline: outlinePath
  })

  // use a PolylineEdgeStyle instance with a dotted stroke for edges
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: new Stroke({
      fill: 'rgb(229,233,240)',
      dashStyle: new DashStyle([0.125, 2], 10),
      lineCap: LineCap.ROUND,
      thickness: 8
    }),
    sourceArrow: IArrow.NONE,
    targetArrow: IArrow.NONE
  })

  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    sideOfEdge: EdgeSides.ABOVE_EDGE,
    distance: 5
  }).createDefaultParameter()
}

/**
 * Initializes the converter functions used in the bindings.
 */
function initConverters() {
  // convert each business unit to its own color
  TemplateNodeStyle.CONVERTERS.backgroundColor = val => {
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
  TemplateNodeStyle.CONVERTERS.statusColor = val => {
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
  TemplateNodeStyle.CONVERTERS.icon = val => `./resources/${val}.svg`

  // convert a node size to a font size
  TemplateNodeStyle.CONVERTERS.fontSize = val => (val / 10) | 0

  // convert a boolean to a visibility value
  TemplateNodeStyle.CONVERTERS.visibility = val => (val ? 'visible' : 'hidden')

  // A converter that does simple calculations, consisting of numbers, +, -, / and * as well as parentheses.
  // The parameter must contain the calculation expression. $v is replaced by the bound value.
  // This converter is used in the node template to calculate positions and sizes of elements based on the node size.
  // Please be careful where you use this code, since it contains an eval() call.
  TemplateNodeStyle.CONVERTERS.calc = (val, parameter) => {
    const expression = parameter.replace('$v', val)
    // for safety, check if the expression contains only allowed characters
    if (expression.match(/^[\d+-/()*]+$/g) !== null) {
      // eslint-disable-next-line no-eval
      return eval(expression)
    }
    return -1
  }
}

/**
 * @param {!GraphComponent} graphComponent
 */
function initialize(graphComponent) {
  // initialize the graph
  initializeGraph(graphComponent.graph)

  // create the graph items
  createGraph(graphComponent.graph)

  // support interactive panning and zooming, but no structural modifications like
  // adding or deleting items
  graphComponent.inputMode = new GraphViewerInputMode()

  createPropertiesPanel(graphComponent)

  registerCommands(graphComponent)

  runLayout(graphComponent)
}

/**
 * Customizes the graph - in this case, the default node size is set and the default decoration for
 * selection and focus is removed.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  graph.nodeDefaults.size = new Size(100, 100)

  // remove the default selection and focus decoration
  graph.decorator.nodeDecorator.selectionDecorator.hideImplementation()
  graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
}

/**
 * Creates the initial sample graph.
 * @param {!IGraph} graph
 */
function createGraph(graph) {
  // make each data item observable to be able to update the template style bindings
  const dataSource = OrgChartData.map(data => TemplateNodeStyle.makeObservable(data))

  // use AdjacencyGraphBuilder to automatically create a graph from the data
  const adjacencyGraphBuilder = new AdjacencyGraphBuilder(graph)

  // stores the nodes of the graph
  const adjacencyNodesSource = adjacencyGraphBuilder.createNodesSource(dataSource, 'email')

  // configure the successor nodes
  const edgeCreator = new EdgeCreator({
    // use the same edge defaults as in the graph
    defaults: graph.edgeDefaults
  })
  // label edges that point to assistants
  edgeCreator.addEdgeCreatedListener((sender, args) => {
    const edge = args.item
    const targetData = edge.targetNode.tag
    if (targetData && targetData.assistant) {
      args.graph.addLabel(edge, 'Assistant')
    }
  })
  adjacencyNodesSource.addSuccessorIds(data => data.subordinates, edgeCreator)

  // create the graph from the given data
  adjacencyGraphBuilder.buildGraph()

  // adjust the node sizes to match their hierarchy level
  adjustNodeSizes(graph)
}

/**
 * Calculates the tree level of each node. Nodes higher up in the hierarchy are enlarged
 * accordingly.
 * @param {!IGraph} graph
 */
function adjustNodeSizes(graph) {
  // calculate the tree hierarchy levels using a BFS algorithm
  const graphAdapter = new LayoutGraphAdapter(graph)
  const layoutGraph = graphAdapter.createCopiedLayoutGraph()
  const rootNodes = new YNodeList(
    graph.nodes
      .filter(node => graph.inDegree(node) === 0)
      .map(node => layoutGraph.getCopiedNode(node))
      .toArray()
  )
  const layerMap = layoutGraph.createNodeMap()
  const layers = BfsAlgorithm.getLayers(layoutGraph, rootNodes, layerMap)

  // adjust the size of each node
  const baseSize = graph.nodeDefaults.size
  const growthFactor = 0.3
  graph.nodes.forEach(node => {
    const treeLevel = layers.length - layerMap.get(layoutGraph.getCopiedNode(node)) - 1
    const size = new Size(
      baseSize.width + baseSize.width * treeLevel * growthFactor,
      baseSize.height + baseSize.height * treeLevel * growthFactor
    )
    graph.setNodeLayout(node, new Rect(node.layout.topLeft, size))
  })
}

/**
 * Creates a panel that displays detailed information for the employee that is represented
 * by the given graph component's current item.
 * @param {!GraphComponent} graphComponent
 */
function createPropertiesPanel(graphComponent) {
  // Create the properties view that populates the "propertiesView" element with
  // the properties of the selected employee.
  const propertiesViewElement = document.getElementById('propertiesView')
  const propertiesView = new PropertiesView(propertiesViewElement)

  // add a listener for the properties view
  graphComponent.addCurrentItemChangedListener(() => {
    propertiesView.showProperties(graphComponent.currentItem)
  })
}

/**
 * Arranges the graph of the given graph component.
 * @param {!GraphComponent} graphComponent
 */
function runLayout(graphComponent) {
  const layout = new BalloonLayout()
  layout.minimumNodeDistance = 10
  layout.minimumEdgeLength = 100
  layout.allowOverlaps = true

  // calculate the initial layout
  graphComponent.graph.applyLayout(layout)
  // move the ports from the node center to outside the node
  adjustPorts(graphComponent.graph)
  graphComponent.currentItem = graphComponent.graph.nodes.first()
  limitViewport(graphComponent)
  graphComponent.fitGraphBounds()
}

/**
 * Moves the ports from the node center to outside the node.
 * @param {!IGraph} graph
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
    const v2 = new Point(-v.x, -v.y)
    adjustPort(graph, sourcePort, v)
    adjustPort(graph, targetPort, v2)
  })
}

/**
 * Moves a port on the given vector outside of its owner node.
 * @param {!IGraph} graph The graph displayed in this demo.
 * @param {!IPort} port The port to adjust.
 * @param {!Point} vector The vector on which the port should be moved.
 */
function adjustPort(graph, port, vector) {
  const node = port.owner
  const r = node.layout.width * 0.5
  const offset = 20

  graph.setPortLocationParameter(
    port,
    FreeNodePortLocationModel.INSTANCE.createParameterForRatios(
      new Point(0.5, 0.5),
      vector.multiply(r + offset)
    )
  )
}

/**
 * Configures a ViewportLimiter that ensures the explorable region does not exceed the graph size.
 * @param {!GraphComponent} graphComponent
 */
function limitViewport(graphComponent) {
  graphComponent.updateContentRect(new Insets(100))
  const limiter = graphComponent.viewportLimiter
  limiter.honorBothDimensions = false
  limiter.bounds = graphComponent.contentRect
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// start demo
loadJson().then(checkLicense).then(run)
