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
  BendAnchoredPortLocationModel,
  DefaultPortCandidate,
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridConstraintProvider,
  GridInfo,
  GridSnapTypes,
  ICommand,
  IEdge,
  IEdgePortHandleProvider,
  IEdgeReconnectionPortCandidateProvider,
  IHitTestable,
  IInputModeContext,
  IPortCandidateProvider,
  IPortLocationModel,
  KeyEventRecognizers,
  License,
  List,
  MouseEventRecognizers,
  NodeStylePortStyleAdapter,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  PortCandidateProviderBase,
  SegmentRatioPortLocationModel,
  ShapeNodeStyle,
  Stroke
} from 'yfiles'

import { initDemoStyles } from '../../resources/demo-styles.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * This application demonstrates the use of edge-to-edge connections. Edges can be created interactively
 * between nodes, nodes and edges and between two edges. Also, this application enables moving the source or
 * target of an edge to another owner.
 *
 * Connecting the source or target of an edge to itself is prohibited since this is conceptually forbidden.
 * Edge-to-edge connections have to be enabled explicitly using the property
 * {@link CreateEdgeInputMode#allowEdgeToEdgeConnections}.
 *
 * This demo also includes customized implementations of {@link IPortCandidateProvider},
 * {@link IEdgeReconnectionPortCandidateProvider}, {@link IHitTestable},
 * {@link IEdgePortHandleProvider} and {@link IPortLocationModel}
 * to enable custom behavior like reconnecting an existing edge to another edge, starting edge creation from an edge
 * etc.
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  initializeInputMode()

  initializeGraph()

  createSampleGraph()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the graph instance setting default styles and customizing behavior.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  graph.undoEngineEnabled = true

  initDemoStyles(graph)
  graph.edgeDefaults.style = new PolylineEdgeStyle()
  graph.edgeDefaults.shareStyleInstance = false

  // assign a port style for the ports at the edges
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'black',
    stroke: null
  })
  graph.edgeDefaults.ports.style = new NodeStylePortStyleAdapter({
    nodeStyle: shapeNodeStyle,
    renderSize: [3, 3]
  })

  // enable edge port candidates
  graph.decorator.edgeDecorator.portCandidateProviderDecorator.setFactory(
    edge => new EdgeSegmentPortCandidateProvider(edge)
  )
  // set IEdgeReconnectionPortCandidateProvider to allow re-connecting edges to other edges
  graph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
    IEdgeReconnectionPortCandidateProvider.ALL_NODE_AND_EDGE_CANDIDATES
  )
}

/**
 * Creates the {@link GraphSnapContext}.
 */
function createSnapContext() {
  const snapContext = new GraphSnapContext({
    enabled: false,
    // disable grid snapping
    gridSnapType: GridSnapTypes.NONE
  })
  // add constraint provider for nodes, bends, and ports
  const gridInfo = new GridInfo(50)
  snapContext.nodeGridConstraintProvider = new GridConstraintProvider(gridInfo)
  snapContext.bendGridConstraintProvider = new GridConstraintProvider(gridInfo)
  snapContext.portGridConstraintProvider = new GridConstraintProvider(gridInfo)
  return snapContext
}

/**
 * Initializes the input mode and enables edge-to-edge connections on the input mode.
 */
function initializeInputMode() {
  const mode = new GraphEditorInputMode({
    snapContext: createSnapContext(),
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({
      enabled: false
    })
  })

  mode.createEdgeInputMode.allowEdgeToEdgeConnections = true

  // create bends only when shift is pressed
  mode.createBendInputMode.pressedRecognizer = EventRecognizers.createAndRecognizer(
    MouseEventRecognizers.LEFT_DOWN,
    KeyEventRecognizers.SHIFT_IS_DOWN
  )

  mode.createEdgeInputMode.addEdgeCreationStartedListener((sender, args) =>
    setRandomEdgeColor(args.item)
  )
  graphComponent.inputMode = mode
}

/**
 * Creates a small sample graph containing edge to edge connections.
 */
function createSampleGraph() {
  const graph = graphComponent.graph

  const n1 = graph.createNodeAt(new Point(0, 0))
  const n2 = graph.createNodeAt(new Point(500, 0))
  const n3 = graph.createNodeAt(new Point(0, 300))
  const n4 = graph.createNodeAt(new Point(500, 300))

  const e1 = graph.createEdge(n1, n3)
  const e2 = graph.createEdge(n2, n4)
  const e3 = graph.createEdge(n3, n4)

  graph.addBends(e3, [
    new Point(100, 300),
    new Point(100, 400),
    new Point(400, 400),
    new Point(400, 300)
  ])

  const p1 = graph.addPortAt(e1, new Point(0, 150))
  const p2 = graph.addPortAt(e2, new Point(500, 150))
  const e4 = graph.createEdge(p1, p2)
  const p3 = graph.addPortAt(e4, new Point(250, 150))
  const p4 = graph.addPortAt(e3, new Point(400, 350))
  graph.createEdge(p3, p4)

  graphComponent.fitGraphBounds()

  graph.undoEngine.clear()
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })

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

  bindAction('#demo-snapping-button', () => {
    graphComponent.inputMode.snapContext.enabled = document.querySelector(
      '#demo-snapping-button'
    ).checked
  })
  bindAction('#demo-orthogonal-editing-button', () => {
    graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
      '#demo-orthogonal-editing-button'
    ).checked
  })
}

/**
 * Creates a random colored pen and uses that one for the style.
 * @param {IEdge} edge
 */
function setRandomEdgeColor(edge) {
  if (edge.style instanceof PolylineEdgeStyle) {
    edge.style.stroke = new Stroke(
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      255,
      2
    )
  }
}

loadJson().then(run)

/**
 * A port candidate provider that aggregates different {@link IPortLocationModel PortLocationModels}
 * to provide a number of port candidates along each segment of the edge.
 */
class EdgeSegmentPortCandidateProvider extends PortCandidateProviderBase {
  /**
   * Create a new instance of this type.
   * @param {IEdge} edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Creates an enumeration of possible port candidates.
   * @param {IInputModeContext} context
   * @return {IEnumerable<IPortCandidate>}
   */
  getPortCandidates(context) {
    const candidates = new List()
    const edge = this.edge
    // add a port candidate at each bend
    for (let i = edge.bends.size - 1; i >= 0; i--) {
      candidates.add(
        new DefaultPortCandidate(edge, BendAnchoredPortLocationModel.INSTANCE.createFromSource(i))
      )
    }
    // add port candidates along the path of each segment
    for (let i = edge.bends.size; i >= 0; i--) {
      candidates.add(
        new DefaultPortCandidate(
          edge,
          SegmentRatioPortLocationModel.INSTANCE.createFromSource(0.25, i)
        )
      )
      candidates.add(
        new DefaultPortCandidate(
          edge,
          SegmentRatioPortLocationModel.INSTANCE.createFromSource(0.5, i)
        )
      )
      candidates.add(
        new DefaultPortCandidate(
          edge,
          SegmentRatioPortLocationModel.INSTANCE.createFromSource(0.75, i)
        )
      )
      // add a dynamic candidate that can be used if shift is pressed to assign the exact location.
      candidates.add(new DefaultPortCandidate(edge, SegmentRatioPortLocationModel.INSTANCE))
    }
    return candidates
  }
}
