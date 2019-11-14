/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
 * Application Features - Folding
 *
 *  This demo shows how to enable collapse/expand functionality for grouped graphs.
 *  This support is provided through class {@link yfiles.graph.FoldingManager}
 *  and its support classes.
 * {@link yfiles.input.GraphEditorInputMode} already provides the following
 *  default gestures for collapse/expand:
 *  <ul>
 *  <li>Press CTRL+Numpad + to open (expand) a closed group node.</li>
 *  <li>Press CTRL+Numpad - to close (collapse) an open group node.</li>
 *  <li>Press CTRL+Return to enter (navigate into) a group node.</li>
 *  <li>Press CTRL+Backspace to exit (navigate out of a group node.</li>
 *  </ul>
 *
 *  Conceptually, folding involves separating a "master graph" that contains the
 *  full, unfolded model from one or more "managed views" which may dynamically
 *  hide and show parts of the graph, create representatives for merged edges, etc.
 *  Usually, a managed view's graph can be used transparently in place of the master graph,
 *  however, some care must be taken when working with graph elements that don't exist
 *  explicitly in the master graph, such as representative edges for multiple edges that
 *  connect into a folded group node.
 */
require(['yfiles/view-editor', 'resources/demo-app', 'yfiles/view-folding', 'resources/license'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * Bootstraps the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('#graphComponent')

    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })

    // enable folding for the graph
    const foldingView = enableFolding()

    // assign the folded graph to the graph component
    graphComponent.graph = foldingView.graph

    // create an initial sample graph
    createInitialGraph(foldingView.manager.masterGraph)

    graphComponent.fitGraphBounds()

    // enable undo after the initial graph was populated since we don't want to allow undoing that
    foldingView.manager.masterGraph.undoEngineEnabled = true

    // bind the buttons to their commands
    registerCommands()

    // initialize the application's CSS and JavaScript for the description
    app.show(graphComponent)
  }

  /**
   * Enables folding.
   *
   * @return {yfiles.graph.IFoldingView} The folding view that manages the folded graph.
   */
  function enableFolding() {
    const masterGraph = new yfiles.graph.DefaultGraph()

    // set default styles for newly created graph elements
    initializeTutorialDefaults(masterGraph)

    // add a collapse/expand button to the group node style
    wrapGroupNodeStyle(masterGraph)

    // Creates the folding manager
    const manager = new yfiles.graph.FoldingManager(masterGraph)

    // Creates a folding view that manages the folded graph
    return manager.createFoldingView()
  }

  /**
   * Changes the default style for group nodes.
   * We use {@link yfiles.styles.CollapsibleNodeStyleDecorator} to wrap the
   * {@link yfiles.styles.PanelNodeStyle} from the last demo, since we want to have nice
   * +/- buttons for collapse/expand. Note that if you haven't defined
   * a custom group node style, you don't have to do anything at all, since
   * {@link yfiles.graph.FoldingManager} already
   * provides such a decorated group node style by default.
   * Although this demo does not use a custom group node style, we still wrap it for demonstration purpose.
   *
   * @param {yfiles.graph.IGraph} graph The graph.
   */
  function wrapGroupNodeStyle(graph) {
    graph.groupNodeDefaults.style = new yfiles.styles.CollapsibleNodeStyleDecorator(
      graph.groupNodeDefaults.style
    )
  }

  /**
   * Initializes the defaults for the styles in this tutorial.
   *
   * @param {yfiles.graph.IGraph} graph The graph.
   */
  function initializeTutorialDefaults(graph) {
    // configure defaults for normal nodes and their labels
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      fill: 'darkorange',
      stroke: 'white'
    })
    graph.nodeDefaults.size = new yfiles.geometry.Size(40, 40)
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'word_ellipsis'
    })
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.ExteriorLabelModel.SOUTH

    // configure defaults for group nodes and their labels
    graph.groupNodeDefaults.style = new yfiles.styles.PanelNodeStyle({
      color: 'rgb(214, 229, 248)',
      insets: [18, 5, 5, 5],
      labelInsetsColor: 'rgb(214, 229, 248)'
    })
    graph.groupNodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      horizontalTextAlignment: 'right'
    })
    graph.groupNodeDefaults.labels.layoutParameter = yfiles.graph.InteriorStretchLabelModel.NORTH
  }

  /**
   * Creates an initial sample graph.
   *
   * @param {yfiles.graph.IGraph} graph The graph.
   */
  function createInitialGraph(graph) {
    const node1 = graph.createNodeAt([110, 20])
    const node2 = graph.createNodeAt([145, 95])
    const node3 = graph.createNodeAt([75, 95])
    const node4 = graph.createNodeAt([30, 175])
    const node5 = graph.createNodeAt([100, 175])

    graph.groupNodes({
      children: [node1, node2, node3],
      labels: 'Group 1'
    })

    const edge1 = graph.createEdge(node1, node2)
    const edge2 = graph.createEdge(node1, node3)
    const edge3 = graph.createEdge(node3, node4)
    const edge4 = graph.createEdge(node3, node5)
    const edge5 = graph.createEdge(node1, node5)
    graph.setPortLocation(edge1.sourcePort, new yfiles.geometry.Point(123.33, 40))
    graph.setPortLocation(edge1.targetPort, new yfiles.geometry.Point(145, 75))
    graph.setPortLocation(edge2.sourcePort, new yfiles.geometry.Point(96.67, 40))
    graph.setPortLocation(edge2.targetPort, new yfiles.geometry.Point(75, 75))
    graph.setPortLocation(edge3.sourcePort, new yfiles.geometry.Point(65, 115))
    graph.setPortLocation(edge3.targetPort, new yfiles.geometry.Point(30, 155))
    graph.setPortLocation(edge4.sourcePort, new yfiles.geometry.Point(85, 115))
    graph.setPortLocation(edge4.targetPort, new yfiles.geometry.Point(90, 155))
    graph.setPortLocation(edge5.sourcePort, new yfiles.geometry.Point(110, 40))
    graph.setPortLocation(edge5.targetPort, new yfiles.geometry.Point(110, 155))
    graph.addBends(edge1, [
      new yfiles.geometry.Point(123.33, 55),
      new yfiles.geometry.Point(145, 55)
    ])
    graph.addBends(edge2, [new yfiles.geometry.Point(96.67, 55), new yfiles.geometry.Point(75, 55)])
    graph.addBends(edge3, [new yfiles.geometry.Point(65, 130), new yfiles.geometry.Point(30, 130)])
    graph.addBends(edge4, [new yfiles.geometry.Point(85, 130), new yfiles.geometry.Point(90, 130)])
  }

  /**
   * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
   */
  function registerCommands() {
    const ICommand = yfiles.input.ICommand
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    })
    app.bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
    app.bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
    app.bindCommand(
      "button[data-command='GroupSelection']",
      ICommand.GROUP_SELECTION,
      graphComponent
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      ICommand.UNGROUP_SELECTION,
      graphComponent
    )
    app.bindCommand("button[data-command='EnterGroup']", ICommand.ENTER_GROUP, graphComponent)
    app.bindCommand("button[data-command='ExitGroup']", ICommand.EXIT_GROUP, graphComponent)
  }

  // start tutorial
  run()
})
