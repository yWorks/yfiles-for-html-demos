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
  './CustomSimpleNodeStyle.js',
  './CustomSimpleEdgeStyle.js',
  './CustomSimpleLabelStyle.js',
  './CustomGroupNodeStyle.js',
  './CustomSimplePortStyle.js',
  './CustomCollapsibleNodeStyleDecoratorRenderer.js',
  'yfiles/view-folding',
  'yfiles/view-editor',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  CustomSimpleNodeStyle,
  CustomSimpleEdgeStyle,
  CustomSimpleLabelStyle,
  CustomGroupNodeStyle,
  CustomSimplePortStyle,
  CustomCollapsibleNodeStyleDecoratorRenderer
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    configureGroupNodeStyles()

    // From now on, everything can be done on the actual managed view instance
    enableFolding()

    // initialize the graph
    initializeGraph()

    // initialize the input mode
    graphComponent.inputMode = createEditorMode()

    graphComponent.fitGraphBounds()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Sets a custom NodeStyle instance as a template for newly created
   * nodes in the graph.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    // Create a new style and use it as default port style
    graph.nodeDefaults.ports.style = new CustomSimplePortStyle()

    // Create a new style and use it as default node style
    graph.nodeDefaults.style = new CustomSimpleNodeStyle()
    // Create a new style and use it as default edge style
    graph.edgeDefaults.style = new CustomSimpleEdgeStyle()
    // Create a new style and use it as default label style
    graph.nodeDefaults.labels.style = new CustomSimpleLabelStyle()
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.ExteriorLabelModel.NORTH
    graph.edgeDefaults.labels.style = new CustomSimpleLabelStyle()

    graph.nodeDefaults.size = new yfiles.geometry.Size(50, 50)

    // Create some graph elements with the above defined styles.
    createSampleGraph()
  }

  /**
   * Creates the default input mode for the graphComponent,
   * a {@link yfiles.input.GraphEditorInputMode}.
   * @return {yfiles.input.IInputMode} a new GraphEditorInputMode instance
   */
  function createEditorMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      allowEditLabel: true,
      hideLabelDuringEditing: false,
      allowGroupingOperations: true
    })
    return mode
  }

  /**
   * Creates the initial sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph
    const n0 = graph.createNodeAt({
      location: new yfiles.geometry.Point(291, 433),
      tag: 'rgb(108, 0, 255)'
    })
    const n1 = graph.createNodeAt({
      location: new yfiles.geometry.Point(396, 398),
      tag: 'rgb(210, 255, 0)'
    })
    const n2 = graph.createNodeAt({
      location: new yfiles.geometry.Point(462, 308),
      tag: 'rgb(0, 72, 255)'
    })
    const n3 = graph.createNodeAt({
      location: new yfiles.geometry.Point(462, 197),
      tag: 'rgb(255, 0, 84)'
    })
    const n4 = graph.createNodeAt({
      location: new yfiles.geometry.Point(396, 107),
      tag: 'rgb(255, 30, 0)'
    })
    const n5 = graph.createNodeAt({
      location: new yfiles.geometry.Point(291, 73),
      tag: 'rgb(0, 42, 255)'
    })
    const n6 = graph.createNodeAt({
      location: new yfiles.geometry.Point(185, 107),
      tag: 'rgb(114, 255, 0)'
    })
    const n7 = graph.createNodeAt({
      location: new yfiles.geometry.Point(119, 197),
      tag: 'rgb(216, 0, 255)'
    })
    const n8 = graph.createNodeAt({
      location: new yfiles.geometry.Point(119, 308),
      tag: 'rgb(36, 255, 0)'
    })
    const n9 = graph.createNodeAt({
      location: new yfiles.geometry.Point(185, 398),
      tag: 'rgb(216, 0, 255)'
    })

    const labelModel = new yfiles.graph.ExteriorLabelModel({ insets: 15 })

    graph.addLabel(
      n0,
      'Node 0',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH)
    )
    graph.addLabel(
      n1,
      'Node 1',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_EAST)
    )
    graph.addLabel(
      n2,
      'Node 2',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.EAST)
    )
    graph.addLabel(
      n3,
      'Node 3',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.EAST)
    )
    graph.addLabel(
      n4,
      'Node 4',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_EAST)
    )
    graph.addLabel(
      n5,
      'Node 5',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH)
    )
    graph.addLabel(
      n6,
      'Node 6',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_WEST)
    )
    graph.addLabel(
      n7,
      'Node 7',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.WEST)
    )
    graph.addLabel(
      n8,
      'Node 8',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.WEST)
    )
    graph.addLabel(
      n9,
      'Node 9',
      labelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_WEST)
    )

    graph.createEdge(n0, n4)
    graph.createEdge(n6, n0)
    graph.createEdge(n6, n5)
    graph.createEdge(n5, n2)
    graph.createEdge(n3, n7)
    graph.createEdge(n9, n4)

    // put all nodes into a group
    const group1 = graph.groupNodes(graph.nodes)
    group1.tag = 'gold'
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

    app.bindAction("button[data-command='ModifyColors']", () => modifyColors())
  }

  /**
   * Configures the default style for group nodes.
   */
  function configureGroupNodeStyles() {
    graphComponent.graph.groupNodeDefaults.style = new CustomGroupNodeStyle()
  }

  /**
   * @type {yfiles.graph.FoldingManager}
   */
  let foldingManager = null

  /**
   * Enables folding - changes the graphComponent's graph to a managed view
   * that provides the actual collapse/expand state.
   */
  function enableFolding() {
    // Creates the folding manager and sets its master graph to
    // the single graph that has served for all purposes up to this point
    foldingManager = new yfiles.graph.FoldingManager(graphComponent.graph)
    // Creates a managed view from the master graph and
    // replaces the existing graph view with a managed view
    graphComponent.graph = foldingManager.createFoldingView().graph
    wrapGroupNodeStyles()
  }

  /**
   * Changes the default style for group nodes.
   * We use {@link yfiles.styles.CollapsibleNodeStyleDecorator} to wrap the
   * group style, since we want to have nice +/- buttons for collapse/expand.
   * The {@link yfiles.styles.CollapsibleNodeStyleDecoratorRenderer renderer} is
   * customized in order to change the collapse button visualization.
   */
  function wrapGroupNodeStyles() {
    // Wrap the style with CollapsibleNodeStyleDecorator
    // Use a custom renderer to change the collapse button visualization
    const nodeStyleDecorator = new yfiles.styles.CollapsibleNodeStyleDecorator(
      graphComponent.graph.groupNodeDefaults.style,
      new CustomCollapsibleNodeStyleDecoratorRenderer(new yfiles.geometry.Size(14, 14))
    )
    // Use a different label model for button placement
    const newInteriorLabelModel = new yfiles.graph.InteriorLabelModel({ insets: 2 })
    nodeStyleDecorator.buttonPlacement = newInteriorLabelModel.createParameter(
      yfiles.graph.InteriorLabelModelPosition.SOUTH_EAST
    )
    graphComponent.graph.groupNodeDefaults.style = nodeStyleDecorator
  }

  /**
   * Modifies the tag of each leaf node.
   */
  function modifyColors() {
    const graph = graphComponent.graph
    // set the tag of all non-group (leaf) nodes to a new color
    const leafNodes = graph.nodes.filter(node => !graph.isGroupNode(node))
    leafNodes.forEach(node => {
      node.tag = `hsl(${Math.random() * 360},100%,50%)`
    })
    // and invalidate the view as the graph cannot know that we changed the styles
    graphComponent.invalidate()
  }

  // start demo
  run()
})
