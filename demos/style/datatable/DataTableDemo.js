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
  './DataTableNodeStyle.js',
  './DataTableLabelStyle.js',
  './UserDataFactory.js',
  'yfiles/view-graphml',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  DataTableNodeStyle,
  DataTableLabelStyle,
  UserDataFactory
) => {
  /** @type yfiles.view.GraphComponent */
  let graphComponent = null

  /** @type yfiles.graphml.GraphMLSupport */
  let gs = null

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // enable the undo engine
    graphComponent.graph.undoEngineEnabled = true

    // initialize default demo styles
    initializeStyles()

    // initialize the input mode
    initializeInputMode()

    // enable the graphml support for loading and saving
    enableGraphML()

    // create a sample graph
    createSampleGraph(4)

    // wire up the UI
    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the default styles for nodes and labels.
   */
  function initializeStyles() {
    const graph = graphComponent.graph

    // initialize node style
    graph.nodeDefaults.style = new DataTableNodeStyle()
    graph.nodeDefaults.size = new yfiles.geometry.Size(170, 120)

    // initialize default label
    graph.nodeDefaults.labels.style = new DataTableLabelStyle()

    const exteriorLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 15 })

    graph.nodeDefaults.labels.layoutParameter = exteriorLabelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.WEST
    )
  }

  /**
   * Initializes the input mode.
   */
  function initializeInputMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      // labels are added with the toolbar button and are not editable
      allowEditLabel: false,
      allowAddLabel: false
    })
    // add random user data to new nodes
    mode.addNodeCreatedListener((sender, e) => {
      e.item.tag = UserDataFactory.getNewRandomUserData()
      // check if the label should be displayed
      const exteriorLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 15 })
      onToggleNodeLabel(e.item, exteriorLabelModel)
      graphComponent.updateContentRect()
    })
    graphComponent.inputMode = mode
  }

  /**
   * Enables loading and saving the graph to GraphML.
   */
  function enableGraphML() {
    const ioh = new yfiles.graphml.GraphMLIOHandler()
    // add XamlNamespaceMapping for the custom styles of nodes and labels
    ioh.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/DataTableNodeStyle/1.0',
      'DataTableNodeStyle',
      DataTableNodeStyle.$class
    )
    ioh.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/DataTableLabelStyle/1.0',
      'DataTableLabelStyle',
      DataTableLabelStyle.$class
    )

    // create a new GraphMLSupport instance that handles save and load operations
    gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      // configure to load and save to the file system
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM,
      graphMLIOHandler: ioh
    })
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
    app.bindAction("button[data-command='Open']", openFile)
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

    app.bindAction("input[data-command='ToggleLabels']", onToggleLabels)
  }

  /**
   * Opens a new graphml file and checks whether the labels should be visible or not.
   */
  function openFile() {
    gs
      .openFile(graphComponent)
      .then(() => {
        onToggleLabels()
        graphComponent.fitGraphBounds()
      })
      .catch(error => {
        alert(`Error occurred during loading file: ${error}`)
      })
  }

  /**
   * Executed when Toggle Labels button is pressed.
   */
  function onToggleLabels() {
    const exteriorLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 15 })

    const graph = graphComponent.graph
    graph.nodes.forEach(node => onToggleNodeLabel(node, exteriorLabelModel))
    graphComponent.updateContentRect()
  }

  /**
   * Executed for each node when Toggle Labels button is pressed.
   * @param {yfiles.graph.INode} node
   * @param {yfiles.graph.ExteriorLabelModel} exteriorLabelModel
   */
  function onToggleNodeLabel(node, exteriorLabelModel) {
    if (document.getElementById('ToggleLabels').checked) {
      const parameter =
        node.layout.x < 100
          ? exteriorLabelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.EAST)
          : exteriorLabelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.WEST)
      graphComponent.graph.addLabel(node, '', parameter)
    } else {
      // if there exist labels, remove them
      const labels = new yfiles.collections.List(node.labels)
      labels.forEach(label => graphComponent.graph.remove(label))
    }
  }

  /**
   * Creates an initial graph.
   * @param {number} nodeCount
   */
  function createSampleGraph(nodeCount) {
    const graph = graphComponent.graph

    // Create nodes with random user data
    const nodes = []
    for (let i = 0; i < nodeCount; i++) {
      const x = i % 2 === 0 ? 0 : 350
      const node = graph.createNodeAt({
        location: new yfiles.geometry.Point(x, i * 150),
        tag: UserDataFactory.getNewRandomUserData()
      })
      nodes[i] = node
    }

    // Create some edges
    if (nodes.length > 1) {
      graph.createEdge(nodes[0], nodes[1])
    }
    for (let i = 2; i < nodes.length; i++) {
      graph.createEdge(nodes[i - 1], nodes[i])
      graph.createEdge(nodes[i - 2], nodes[i])
    }

    graphComponent.fitGraphBounds()
    graph.undoEngine.clear()
  }

  // Runs the demo
  run()
})
