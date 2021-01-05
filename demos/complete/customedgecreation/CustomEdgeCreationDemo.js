/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CreateEdgeInputMode,
  DefaultPortCandidate,
  DefaultPortCandidateDescriptor,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  IHitTestable,
  INode,
  IPortCandidateProvider,
  IPortStyle,
  License,
  NodeStylePortStyleAdapter,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  VoidNodeStyle,
  VoidPortStyle
} from 'yfiles'

import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import { RoutingStrategy, RoutingCreateEdgeInputMode } from './RoutingCreateEdgeInputMode.js'
import PortCandidateTemplate from './PortCandidateTemplate.js'

const baseColor = '#F0EBE6'
const nodeColors = ['#D4B483', '#C1666B', '#48A9A6', '#4357AD']

/**
 * Bootstraps the demo.
 */
function run(licenseData) {
  License.value = licenseData
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initDemoStyles(graphComponent.graph)
  graphComponent.graph.nodeDefaults.size = new Size(40, 40)

  // configure the port candidate decorator and associated input mode behavior
  initializePortBehavior(graphComponent)
  initializeCustomPortCandidates(graphComponent)

  // edge creation should be able to finish on an empty canvas
  initializeInputMode(graphComponent, true)

  // set the initial edge routing strategy to CHANNEL_EDGE_ROUTER
  graphComponent.inputMode.createEdgeInputMode.routingStrategy =
    RoutingStrategy.PERFORMANCE_EDGE_ROUTER

  // create an initial sample graph
  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // bind the buttons to their commands
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Configures the given {@link CreateEdgeInputMode} to be able to finish the gesture on an empty
 * canvas with a newly created node.
 * @param {CreateEdgeInputMode} createEdgeInputMode
 */
function enableTargetNodeCreation(createEdgeInputMode) {
  createEdgeInputMode.dummyEdgeGraph.nodeDefaults.size = new Size(40, 40)

  // each edge creation should use another random target node color
  createEdgeInputMode.addGestureStartingListener(src => {
    const randomColor = getRandomColor()
    const randomNodeStyle = getNodeStyle(randomColor)
    src.dummyEdgeGraph.nodeDefaults.style = randomNodeStyle
    src.dummyEdgeGraph.setStyle(src.dummyTargetNode, randomNodeStyle)
    src.dummyTargetNode.tag = randomColor

    // add ports to the dummy node
    const showPorts = document.getElementById('togglePortVisualization').checked
    addDirectionalPorts(
      src.dummyEdgeGraph,
      src.dummyTargetNode,
      showPorts ? getPortStyle(randomColor) : VoidPortStyle.INSTANCE
    )
  })

  // If targeting another node during edge creation, the dummy target node should not be rendered
  // because we'd use that actual graph node as target if the gesture is finished on a node.
  createEdgeInputMode.addTargetPortCandidateChangedListener((src, args) => {
    const dummyEdgeGraph = createEdgeInputMode.dummyEdgeGraph
    if (args.item && INode.isInstance(args.item.owner)) {
      dummyEdgeGraph.setStyle(createEdgeInputMode.dummyTargetNode, VoidNodeStyle.INSTANCE)
      createEdgeInputMode.dummyEdgeGraph.ports.toArray().forEach(port => {
        createEdgeInputMode.dummyEdgeGraph.remove(port)
      })
    } else {
      dummyEdgeGraph.setStyle(
        createEdgeInputMode.dummyTargetNode,
        dummyEdgeGraph.nodeDefaults.style
      )
      // add ports to the dummy node
      const showPorts = document.getElementById('togglePortVisualization').checked
      addDirectionalPorts(
        src.dummyEdgeGraph,
        src.dummyTargetNode,
        showPorts ? getPortStyle(src.dummyTargetNode.tag) : VoidPortStyle.INSTANCE
      )
    }
  })

  // allow the create edge gesture to be finished anywhere, since we'll create a node if there is
  // no target node in the graph at the given location
  createEdgeInputMode.prematureEndHitTestable = IHitTestable.ALWAYS
  createEdgeInputMode.forceSnapToCandidate = false

  // create a new node if the gesture finishes on the empty canvas
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
    // we use the dummy target node to create a new node at the current location
    const dummyTargetNode = createEdgeInputMode.dummyTargetNode
    const node = createNode(graph, dummyTargetNode.layout.center, dummyTargetNode.tag)
    return edgeCreator(
      context,
      graph,
      sourcePortCandidate,
      new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_CENTER_ANCHORED),
      templateEdge
    )
  }
}

/**
 * Initialize the {@link GraphEditorInputMode} as main input mode.
 * In this demo, edges can only be created on distinct source port candidates.
 * @param {GraphComponent} graphComponent The GraphComponent
 * @param {boolean} enableTargetNode Whether a target node is created when the edge creation
 *   gesture ends on empty canvas.
 */
function initializeInputMode(graphComponent, enableTargetNode) {
  const geim = new GraphEditorInputMode({
    // enable orthogonal edge editing
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext()
  })
  geim.createEdgeInputMode = new RoutingCreateEdgeInputMode()

  // show source port candidates as well
  geim.createEdgeInputMode.showPortCandidates = 'ALL'

  // allow edge creation for selected nodes on the given source port(s) as well
  geim.createEdgeInputMode.startOverCandidateOnly = true
  geim.moveInputMode.priority = 46

  // newly created edges should use the same color as their source port color
  geim.createEdgeInputMode.addEdgeCreationStartedListener((src, args) => {
    const color = args.sourcePortOwner.tag
    src.dummyEdgeGraph.setStyle(src.dummyEdge, getEdgeStyle(color))
  })

  if (enableTargetNode) {
    enableTargetNodeCreation(geim.createEdgeInputMode)
  }

  // Use a random node color and add directional ports to each created node
  const graph = graphComponent.graph
  geim.addNodeCreatedListener((src, args) => {
    const node = args.item
    // assign a random color style
    const randomColor = getRandomColor()
    graph.setStyle(node, getNodeStyle(randomColor))
    node.tag = randomColor

    // add ports
    const showPorts = document.getElementById('togglePortVisualization').checked
    addDirectionalPorts(graph, node, showPorts ? getPortStyle(randomColor) : VoidPortStyle.INSTANCE)
  })

  // configure the current routing style
  onCreateEdgeModeChanged(geim.createEdgeInputMode)

  graphComponent.inputMode = geim
}

function initializePortBehavior(graphComponent) {
  const graph = graphComponent.graph
  // prevent cleanup of ports when edges are removed
  graph.nodeDefaults.ports.autoCleanUp = false
  // each node should provide its ports as port candidates
  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(node =>
    IPortCandidateProvider.fromExistingPorts(node)
  )
}

/**
 * Installs custom port candidate visualizations for interactive edge creation.
 */
function initializeCustomPortCandidates(graphComponent) {
  const validFocusedStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'rgb(106,106,106)',
    stroke: null
  })
  const validNonFocusedStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'rgb(147,147,147)',
    stroke: null
  })

  // use adapter class with the ShapeNodeStyle instances to style the port candidates
  graphComponent.resources.set(
    DefaultPortCandidateDescriptor.CANDIDATE_DRAWING_VALID_FOCUSED_KEY,
    new PortCandidateTemplate(validFocusedStyle)
  )
  graphComponent.resources.set(
    DefaultPortCandidateDescriptor.CANDIDATE_DRAWING_VALID_NON_FOCUSED_KEY,
    new PortCandidateTemplate(validNonFocusedStyle)
  )
}

/**
 * Returns a random color from the nodeColors field.
 * @return {string} A random color
 */
function getRandomColor() {
  return nodeColors[Math.floor(Math.random() * nodeColors.length)]
}

/**
 * Returns an edge style of the given color.
 * @param {string} color
 * @return {PolylineEdgeStyle}
 */
function getEdgeStyle(color) {
  return new PolylineEdgeStyle({
    stroke: `2px solid ${color}`,
    targetArrow: new Arrow({
      fill: color,
      cropLength: 1
    })
  })
}

/**
 * Returns a node style of the given color.
 * @param {string} color
 * @return {ShapeNodeStyle}
 */
function getNodeStyle(color) {
  return new ShapeNodeStyle({
    shape: 'round-rectangle',
    stroke: `4px solid ${color}`,
    fill: baseColor
  })
}

/**
 * Return a port style of the given color.
 * @param {string} color
 * @return {NodeStylePortStyleAdapter}
 */
function getPortStyle(color) {
  return new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: 'ellipse',
      fill: baseColor,
      stroke: color
    })
  )
}

/**
 * Helper function to add directional ports to the given node.
 * @param {IGraph} graph
 * @param {INode} node
 * @param {IPortStyle} portStyle
 */
function addDirectionalPorts(graph, node, portStyle) {
  graph.addPort(node, FreeNodePortLocationModel.NODE_CENTER_ANCHORED, portStyle)
  graph.addPort(node, FreeNodePortLocationModel.NODE_TOP_ANCHORED, portStyle)
  graph.addPort(node, FreeNodePortLocationModel.NODE_RIGHT_ANCHORED, portStyle)
  graph.addPort(node, FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED, portStyle)
  graph.addPort(node, FreeNodePortLocationModel.NODE_LEFT_ANCHORED, portStyle)
}

/**
 * Creates a node with directional ports and the color if provided.
 * @param {IGraph} graph The graph in which the node should be created
 * @param {Point} location The node's center location
 * @param {string?} color The node's color or a random color if not provided
 * @return {INode}
 */
function createNode(graph, location, color) {
  color = color || getRandomColor()
  const showPorts = document.getElementById('togglePortVisualization').checked
  const node = graph.createNodeAt({
    location,
    tag: color,
    style: getNodeStyle(color)
  })
  addDirectionalPorts(graph, node, showPorts ? getPortStyle(color) : VoidPortStyle.INSTANCE)
  return node
}

/**
 * Creates an initial sample graph.
 * @param {IGraph} graph The graph.
 */
function createGraph(graph) {
  graph.clear()
  createNode(graph, new Point(0, 0), nodeColors[0])

  createNode(graph, new Point(-80, -80), nodeColors[1])
  createNode(graph, new Point(0, -80), nodeColors[1])
  createNode(graph, new Point(80, -80), nodeColors[1])

  createNode(graph, new Point(-80, 0), nodeColors[1])
  createNode(graph, new Point(80, 0), nodeColors[1])

  createNode(graph, new Point(-80, 80), nodeColors[1])
  createNode(graph, new Point(0, 80), nodeColors[1])
  createNode(graph, new Point(80, 80), nodeColors[1])

  createNode(graph, new Point(-160, -160), nodeColors[2])
  createNode(graph, new Point(-80, -160), nodeColors[2])
  createNode(graph, new Point(0, -160), nodeColors[2])
  createNode(graph, new Point(80, -160), nodeColors[2])
  createNode(graph, new Point(160, -160), nodeColors[2])

  createNode(graph, new Point(-160, 160), nodeColors[2])
  createNode(graph, new Point(-80, 160), nodeColors[2])
  createNode(graph, new Point(0, 160), nodeColors[2])
  createNode(graph, new Point(80, 160), nodeColors[2])
  createNode(graph, new Point(160, 160), nodeColors[2])

  createNode(graph, new Point(-240, -240), nodeColors[3])
  createNode(graph, new Point(-160, -240), nodeColors[3])
  createNode(graph, new Point(-80, -240), nodeColors[3])
  createNode(graph, new Point(0, -240), nodeColors[3])
  createNode(graph, new Point(80, -240), nodeColors[3])
  createNode(graph, new Point(160, -240), nodeColors[3])
  createNode(graph, new Point(240, -240), nodeColors[3])

  createNode(graph, new Point(-240, 240), nodeColors[3])
  createNode(graph, new Point(-160, 240), nodeColors[3])
  createNode(graph, new Point(-80, 240), nodeColors[3])
  createNode(graph, new Point(0, 240), nodeColors[3])
  createNode(graph, new Point(80, 240), nodeColors[3])
  createNode(graph, new Point(160, 240), nodeColors[3])
  createNode(graph, new Point(240, 240), nodeColors[3])

  // clear undo engine after sample graph creation
  graph.undoEngine.clear()
}

/**
 * Switches the routing strategy for edge creation.
 */
function onCreateEdgeModeChanged(createEdgeInputMode) {
  const selectedIndex = document.getElementById('createEdgeMode').selectedIndex
  if (selectedIndex === 0) {
    createEdgeInputMode.routingStrategy = RoutingStrategy.NONE
  } else if (selectedIndex === 1) {
    createEdgeInputMode.routingStrategy = RoutingStrategy.EDGE_ROUTER
  } else if (selectedIndex === 2) {
    createEdgeInputMode.routingStrategy = RoutingStrategy.PERFORMANCE_EDGE_ROUTER
  } else if (selectedIndex === 3) {
    createEdgeInputMode.routingStrategy = RoutingStrategy.CHANNEL_EDGE_ROUTER
  }
}

/**
 * Toggles port visualization on the graph.
 */
function onTogglePortVisualization(graph, checked) {
  if (checked) {
    graph.ports.forEach(port => {
      const portStyle = new NodeStylePortStyleAdapter(
        new ShapeNodeStyle({
          shape: 'ellipse',
          fill: baseColor,
          stroke: port.owner.tag
        })
      )
      graph.setStyle(port, portStyle)
    })
  } else {
    graph.ports.forEach(port => {
      graph.setStyle(port, VoidPortStyle.INSTANCE)
    })
  }
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the toolbar.
 */
function registerCommands(graphComponent) {
  bindAction("button[data-command='Reset']", () => {
    createGraph(graphComponent.graph)
  })
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindChangeListener("select[data-command='createEdgeModeChanged']", () =>
    onCreateEdgeModeChanged(graphComponent.inputMode.createEdgeInputMode)
  )

  bindChangeListener("input[data-command='ToggleTargetNode']", checked =>
    initializeInputMode(graphComponent, checked)
  )

  bindChangeListener("input[data-command='TogglePortVisualization']", checked =>
    onTogglePortVisualization(graphComponent.graph, checked)
  )
}

// start demo
loadJson().then(run)
