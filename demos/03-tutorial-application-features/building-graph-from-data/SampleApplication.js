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
 * Application Features - Build a Graph from Data
 *
 * This feature demo shows how to create nodes and edges using data stored in JSON-format.
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app) => {
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

    // configures default styles for newly created graph elements
    initTutorialDefaults(graphComponent.graph)

    // load the graph data from the given JSON file
    loadJSON('./GraphData.json')
      .then(graphData => {
        // then build the graph with the given data set
        buildGraph(graphComponent.graph, graphData)

        graphComponent.fitGraphBounds()

        // Often, the input data has no layout information at all. In this case you can apply any of the automatic layout
        // algorithms, to automatically layout your input data, e.g. with HierarchicLayout. Make sure to require the
        // relevant modules for example yfiles/view-layout-bridge and yfiles/layout-hierarchic
        // graphComponent.morphLayout(new yfiles.hierarchic.HierarchicLayout(), '500ms');

        // Finally, enable the undo engine. This prevents undoing of the graph creation
        graphComponent.graph.undoEngineEnabled = true
      })
      .catch(e => {
        alert(e)
      })

    // bind the buttons to their commands
    registerCommands()

    // initialize the application's CSS and JavaScript for the description
    app.show(graphComponent)
  }

  /**
   * Iterates through the given data set and creates nodes and edges according to the given data.
   * How to iterate through the data set and which information are applied to the graph, depends on the structure of
   * the input data. However, the general approach is always the same, i.e. iterating through the data set and
   * calling the graph item factory methods like
   * {@link yfiles.graph.IGraph.createNode()},
   * {@link yfiles.graph.IGraph.createGroupNode()},
   * {@link yfiles.graph.IGraph.createEdge()},
   * {@link yfiles.graph.IGraph.addLabel()}
   * and other {@link yfiles.graph.IGraph} functions to apply the given information to the graph model.
   *
   * @param {yfiles.graph.IGraph} graph The graph.
   * @param {object} graphData The graph data that was loaded from the JSON file.
   */
  function buildGraph(graph, graphData) {
    // Store groups and nodes to be accessible by their IDs.
    // It will be easier to assign them as parents or connect them with edges afterwards.
    const groups = {}
    const nodes = {}

    // Iterate the group data and create the according group nodes.
    graphData.groupsSource.forEach(groupData => {
      groups[groupData.id] = graph.createGroupNode({
        labels: [groupData.label || ''],
        layout: groupData.layout,
        tag: groupData
      })
    })

    // Iterate the node data and create the according nodes.
    graphData.nodesSource.forEach(nodeData => {
      const node = graph.createNode({
        labels: [nodeData.label || ''],
        layout: nodeData.layout,
        tag: nodeData
      })
      if (nodeData.fill) {
        // If the node data specifies an individual fill color, adjust the style.
        graph.setStyle(
          node,
          new yfiles.styles.ShapeNodeStyle({
            fill: nodeData.fill,
            stroke: 'white'
          })
        )
      }
      nodes[nodeData.id] = node
    })

    // Set the parent groups after all nodes/groups are created.
    graph.nodes.forEach(node => {
      if (node.tag.group) {
        graph.setParent(node, groups[node.tag.group])
      }
    })

    // Iterate the edge data and create the according edges.
    graphData.edgesSource.forEach(edgeData => {
      // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
      // which node is the correct source/target.
      graph.createEdge({
        source: nodes[edgeData.from] || groups[edgeData.from],
        target: nodes[edgeData.to] || groups[edgeData.to],
        labels: [edgeData.label || ''],
        tag: edgeData
      })
    })

    // If given, apply the edge layout information
    graph.edges.forEach(edge => {
      const edgeData = edge.tag
      if (edgeData.sourcePort) {
        graph.setPortLocation(
          edge.sourcePort,
          new yfiles.geometry.Point(edgeData.sourcePort.x, edgeData.sourcePort.y)
        )
      }
      if (edgeData.targetPort) {
        graph.setPortLocation(
          edge.targetPort,
          new yfiles.geometry.Point(edgeData.targetPort.x, edgeData.targetPort.y)
        )
      }
      if (edgeData.bends) {
        edgeData.bends.forEach(bendLocation => {
          graph.addBend(edge, bendLocation)
        })
      }
    })
  }

  /**
   * Initializes the defaults for the styles in this tutorial.
   *
   * @param {yfiles.graph.IGraph} graph The graph.
   */
  function initTutorialDefaults(graph) {
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
  }

  /**
   * Returns a promise that resolves when the JSON file is loaded.
   * In general, this can load other files, like plain text files or CSV files, too. However,
   * before usage you need to parse the file content which is done by JSON.parse in case of a JSON file as
   * demonstrated here.
   *
   * @param {string} url The URL to load.
   *
   * @returns {Promise<object>} A promise with the loaded data.
   */
  function loadJSON(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(xhr.statusText))
          }
        }
      }
      xhr.open('GET', url, true)
      xhr.send()
    })
  }

  // start tutorial
  run()
})
