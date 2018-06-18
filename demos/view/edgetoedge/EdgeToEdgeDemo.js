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
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'yfiles/view-graphml',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * This application demonstrates the use of edge-to-edge connections. Edges can be created interactively
   * between nodes, nodes and edges and between two edges. Also, this application enables moving the source or
   * target of an edge to another owner.
   *
   * Connecting the source or target of an edge to itself is prohibited since this is conceptually forbidden.
   * Edge-to-edge connections have to be enabled explicitly using the property
   * {@link yfiles.input.CreateEdgeInputMode#allowEdgeToEdgeConnections}.
   *
   * This demo also includes customized implementations of {@link yfiles.input.IPortCandidateProvider},
   * {@link yfiles.input.IEdgeReconnectionPortCandidateProvider}, {@link yfiles.input.IHitTestable},
   * {@link yfiles.input.IEdgePortHandleProvider} and {@link yfiles.graph.IPortLocationModel}
   * to enable custom behavior like reconnecting an existing edge to another edge, starting edge creation from an edge
   * etc.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeInputMode()

    initializeGraph()

    createSampleGraph()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the graph instance setting default styles and customizing behavior.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    graph.undoEngineEnabled = true

    DemoStyles.initDemoStyles(graph)
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle()
    graph.edgeDefaults.shareStyleInstance = false

    // assign a port style for the ports at the edges
    const shapeNodeStyle = new yfiles.styles.ShapeNodeStyle({
      shape: 'ellipse',
      fill: 'black',
      stroke: null
    })
    graph.edgeDefaults.ports.style = new yfiles.styles.NodeStylePortStyleAdapter({
      nodeStyle: shapeNodeStyle,
      renderSize: [3, 3]
    })

    // enable edge port candidates
    graph.decorator.edgeDecorator.portCandidateProviderDecorator.setFactory(
      edge => new EdgeSegmentPortCandidateProvider(edge)
    )
    // set IEdgeReconnectionPortCandidateProvider to allow re-connecting edges to other edges
    graph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
      yfiles.input.IEdgeReconnectionPortCandidateProvider.ALL_NODE_AND_EDGE_CANDIDATES
    )
  }

  /**
   * Creates the {@link yfiles.input.GraphSnapContext}.
   */
  function createSnapContext() {
    const snapContext = new yfiles.input.GraphSnapContext({
      enabled: false,
      // disable grid snapping
      gridSnapType: yfiles.input.GridSnapTypes.NONE
    })
    // add constraint provider for nodes, bends, and ports
    const gridInfo = new yfiles.view.GridInfo(50)
    snapContext.nodeGridConstraintProvider = new yfiles.input.GridConstraintProvider(gridInfo)
    snapContext.bendGridConstraintProvider = new yfiles.input.GridConstraintProvider(gridInfo)
    snapContext.portGridConstraintProvider = new yfiles.input.GridConstraintProvider(gridInfo)
    return snapContext
  }

  /**
   * Initializes the input mode and enables edge-to-edge connections on the input mode.
   */
  function initializeInputMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      snapContext: createSnapContext(),
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext()
    })
    mode.orthogonalEdgeEditingContext.enabled = false

    mode.createEdgeInputMode.allowEdgeToEdgeConnections = true

    // create bends only when shift is pressed
    mode.createBendInputMode.pressedRecognizer = yfiles.input.EventRecognizers.createAndRecognizer(
      yfiles.input.MouseEventRecognizers.LEFT_DOWN,
      yfiles.input.KeyEventRecognizers.SHIFT_IS_DOWN
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

    const n1 = graph.createNodeAt(new yfiles.geometry.Point(0, 0))
    const n2 = graph.createNodeAt(new yfiles.geometry.Point(500, 0))
    const n3 = graph.createNodeAt(new yfiles.geometry.Point(0, 300))
    const n4 = graph.createNodeAt(new yfiles.geometry.Point(500, 300))

    const e1 = graph.createEdge(n1, n3)
    const e2 = graph.createEdge(n2, n4)
    const e3 = graph.createEdge(n3, n4)

    graph.addBends(e3, [
      new yfiles.geometry.Point(100, 300),
      new yfiles.geometry.Point(100, 400),
      new yfiles.geometry.Point(400, 400),
      new yfiles.geometry.Point(400, 300)
    ])

    const p1 = graph.addPortAt(e1, new yfiles.geometry.Point(0, 150))
    const p2 = graph.addPortAt(e2, new yfiles.geometry.Point(500, 150))
    const e4 = graph.createEdge(p1, p2)
    const p3 = graph.addPortAt(e4, new yfiles.geometry.Point(250, 150))
    const p4 = graph.addPortAt(e3, new yfiles.geometry.Point(400, 350))
    graph.createEdge(p3, p4)

    graphComponent.fitGraphBounds()

    graph.undoEngine.clear()
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      graphComponent.fitGraphBounds()
    })

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

    app.bindAction('#demo-snapping-button', () => {
      graphComponent.inputMode.snapContext.enabled = document.querySelector(
        '#demo-snapping-button'
      ).checked
    })
    app.bindAction('#demo-orthogonal-editing-button', () => {
      graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
        '#demo-orthogonal-editing-button'
      ).checked
    })
  }

  /**
   * Creates a random colored pen and uses that one for the style.
   * @param {yfiles.graph.IEdge} edge
   */
  function setRandomEdgeColor(edge) {
    if (edge.style instanceof yfiles.styles.PolylineEdgeStyle) {
      edge.style.stroke = new yfiles.view.Stroke(
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        255,
        2
      )
    }
  }

  run()

  /**
   * A port candidate provider that aggregates different {@link yfiles.graph.IPortLocationModel PortLocationModels}
   * to provide a number of port candidates along each segment of the edge.
   */
  class EdgeSegmentPortCandidateProvider extends yfiles.input.PortCandidateProviderBase {
    /**
     * Create a new instance of this type.
     * @param {yfiles.graph.IEdge} edge
     */
    constructor(edge) {
      super()
      this.edge = edge
    }

    /**
     * Creates an enumeration of possible port candidates.
     * @param {yfiles.input.IInputModeContext} context
     * @return {yfiles.collections.IEnumerable<yfiles.graph.IPortCandidate>}
     */
    getPortCandidates(context) {
      const candidates = new yfiles.collections.List()
      const edge = this.edge
      // add a port candidate at each bend
      for (let i = edge.bends.size - 1; i >= 0; i--) {
        candidates.add(
          new yfiles.input.DefaultPortCandidate(
            edge,
            yfiles.graph.BendAnchoredPortLocationModel.INSTANCE.createFromSource(i)
          )
        )
      }
      // add port candidates along the path of each segment
      for (let i = edge.bends.size; i >= 0; i--) {
        candidates.add(
          new yfiles.input.DefaultPortCandidate(
            edge,
            yfiles.graph.SegmentRatioPortLocationModel.INSTANCE.createFromSource(0.25, i)
          )
        )
        candidates.add(
          new yfiles.input.DefaultPortCandidate(
            edge,
            yfiles.graph.SegmentRatioPortLocationModel.INSTANCE.createFromSource(0.5, i)
          )
        )
        candidates.add(
          new yfiles.input.DefaultPortCandidate(
            edge,
            yfiles.graph.SegmentRatioPortLocationModel.INSTANCE.createFromSource(0.75, i)
          )
        )
        // add a dynamic candidate that can be used if shift is pressed to assign the exact location.
        candidates.add(
          new yfiles.input.DefaultPortCandidate(
            edge,
            yfiles.graph.SegmentRatioPortLocationModel.INSTANCE
          )
        )
      }
      return candidates
    }
  }
})
