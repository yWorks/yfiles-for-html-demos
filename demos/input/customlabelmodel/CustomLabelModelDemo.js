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
  'CustomNodeLabelModel.js',
  'yfiles/view-graphml',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  CustomNodeLabelModel
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * This demo shows how to create and use a custom label model.
   */
  function run() {
    // initialize graph component
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()

    initializeGraph()

    enableGraphML()

    // bind UI elements to actions
    registerCommands()

    app.show(graphComponent)
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
      CustomNodeLabelModel.CustomNodeLabelModelParameter.serializationHandler
    )
    ioh.addHandleDeserializationListener(
      CustomNodeLabelModel.CustomNodeLabelModelParameter.deserializationHandler
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
   * Sets a custom node label model parameter instance for newly created
   * node labels in the graph, creates an example node with a label using
   * the default parameter and another node with a label without restrictions
   * on the number of possible placements.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    // set the defaults for nodes
    DemoStyles.initDemoStyles(graph)
    graph.nodeDefaults.labels.layoutParameter = new CustomNodeLabelModel().createDefaultParameter()

    // create graph
    const node1 = graph.createNode(new yfiles.geometry.Rect(90, 90, 100, 100))
    const node2 = graph.createNode(new yfiles.geometry.Rect(250, 90, 100, 100))

    const /** @type {CustomNodeLabelModel} */ customNodeLabelModel = new CustomNodeLabelModel()
    customNodeLabelModel.candidateCount = 0
    customNodeLabelModel.offset = 20
    graph.addLabel(node1, 'Click and Drag', customNodeLabelModel.createDefaultParameter())
    graph.addLabel(node2, 'Click and Drag To Snap')

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
