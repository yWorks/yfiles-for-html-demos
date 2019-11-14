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

/* eslint-disable no-new */

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
  'CustomNodePortLocationModel.js',
  'yfiles/view-graphml',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  CustomNodePortLocationModel
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * This demo shows how to create and use a custom label model.
   */
  function run() {
    // initialize graph component
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    // initialize the input mode
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()

    // initialize the graph
    initializeGraph()

    // for selected nodes show the handles
    graphComponent.graph.decorator.nodeDecorator.handleProviderDecorator.setFactory(
      node => new yfiles.input.PortsHandleProvider(node)
    )

    // for nodes add a custom port candidate provider implementation which uses our model
    graphComponent.graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
      getPortCandidateProvider
    )

    // enable the graphml support
    enableGraphML()

    // bind UI elements to actions
    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Callback used by the decorator in <see cref="CreateEditorMode"/>
   * @param {yfiles.graph.INode} forNode
   * @return {yfiles.input.IPortCandidateProvider}
   */
  function getPortCandidateProvider(forNode) {
    const model = new CustomNodePortLocationModel(10)
    return yfiles.input.IPortCandidateProvider.fromCandidates([
      new yfiles.input.DefaultPortCandidate(
        forNode,
        model.createCustomParameter(CustomNodePortLocationModel.PortLocation.CENTER)
      ),
      new yfiles.input.DefaultPortCandidate(
        forNode,
        model.createCustomParameter(CustomNodePortLocationModel.PortLocation.NORTH)
      ),
      new yfiles.input.DefaultPortCandidate(
        forNode,
        model.createCustomParameter(CustomNodePortLocationModel.PortLocation.EAST)
      ),
      new yfiles.input.DefaultPortCandidate(
        forNode,
        model.createCustomParameter(CustomNodePortLocationModel.PortLocation.SOUTH)
      ),
      new yfiles.input.DefaultPortCandidate(
        forNode,
        model.createCustomParameter(CustomNodePortLocationModel.PortLocation.WEST)
      )
    ])
  }

  /**
   * Enables loading and saving the graph to GraphML.
   */
  function enableGraphML() {
    const ioh = new yfiles.graphml.GraphMLIOHandler()
    ioh.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    ioh.addHandleSerializationListener(
      CustomNodePortLocationModel.CustomNodePortLocationModelParameter.serializationHandler
    )
    ioh.addHandleDeserializationListener(
      CustomNodePortLocationModel.CustomNodePortLocationModelParameter.deserializationHandler
    )

    // create a new GraphMLSupport instance that handles save and load operations
    new yfiles.graphml.GraphMLSupport({
      graphComponent,
      // configure to load and save to the file system
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM,
      graphMLIOHandler: ioh
    })
  }

  /**
   * Sets a custom node port model parameter instance for newly created node ports in the graph,
   * creates a example nodes with a ports using the our model and an edge to connect the ports.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    // set the defaults for nodes
    DemoStyles.initDemoStyles(graph)
    graph.nodeDefaults.ports.locationParameter = new CustomNodePortLocationModel().createCustomParameter(
      CustomNodePortLocationModel.PortLocation.CENTER
    )

    const shapeNodeStyle = new yfiles.styles.ShapeNodeStyle({
      shape: 'ellipse',
      fill: 'rgb(51, 102, 153)',
      stroke: null
    })
    graph.nodeDefaults.ports.style = new yfiles.styles.NodeStylePortStyleAdapter(shapeNodeStyle)
    graph.nodeDefaults.ports.style.renderSize = new yfiles.geometry.Size(5, 5)
    graph.nodeDefaults.size = new yfiles.geometry.Size(100, 100)

    const source = graph.createNode(new yfiles.geometry.Rect(90, 90, 100, 100))
    const target = graph.createNode(new yfiles.geometry.Rect(250, 90, 100, 100))

    // creates a port using the default declared above
    const sourcePort = graph.addPort(source)
    // creates a port using the custom model instance
    const targetPort = graph.addPort(
      target,
      new CustomNodePortLocationModel(10).createCustomParameter(
        CustomNodePortLocationModel.PortLocation.NORTH
      )
    )

    // create an edge
    graph.createEdge(sourcePort, targetPort)

    graphComponent.fitGraphBounds()
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
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
  }

  run()
})
