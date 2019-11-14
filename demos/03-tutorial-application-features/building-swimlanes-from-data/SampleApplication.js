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
  'utils/FileSaveSupport',
  'yfiles/view-table',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, FileSaveSupport) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * Bootstraps the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('#graphComponent')

    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true,
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext()
    })
    graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = true

    configureTableEditing(graphComponent.inputMode)

    // configures default styles for newly created graph elements
    initTutorialDefaults(graphComponent.graph)

    // load the graph data from the given JSON file
    loadJSON('./GraphData.json')
      .then(graphData => {
        // then build the graph with the given data set
        buildGraph(graphComponent.graph, graphData)

        // Automatically layout the swimlanes. The HierarchicLayout respects the node to cell assignment based on the
        // node's center position.
        runLayout('0s').then(() => {
          // Finally, enable the undo engine. This prevents undoing of the graph creation
          graphComponent.graph.undoEngineEnabled = true
        })
      })
      .catch(e => {
        alert(e)
      })

    // bind the buttons to their commands
    registerCommands()

    // initialize the application's CSS and JavaScript for the description
    app.show(graphComponent)
  }

  function configureTableEditing(graphEditorInputMode) {
    const reparentStripeHandler = new yfiles.input.ReparentStripeHandler()
    reparentStripeHandler.maxColumnLevel = 1
    reparentStripeHandler.maxRowLevel = 1

    // Create a new TEIM instance which also allows drag and drop
    const tableInputMode = new yfiles.input.TableEditorInputMode({
      reparentStripeHandler,
      // we set the priority higher than for the handle input mode so that handles win if both gestures are possible
      priority: graphEditorInputMode.handleInputMode.priority + 1
    })
    tableInputMode.stripeDropInputMode.enabled = true

    // Add to GEIM
    graphEditorInputMode.add(tableInputMode)

    // prevent re-parenting of tables into tables by copy & paste
    const clipboard = new yfiles.graph.GraphClipboard()
    clipboard.parentNodeDetection = yfiles.graph.ParentNodeDetectionModes.PREVIOUS_PARENT
    graphComponent.clipboard = clipboard

    // prevent selection of the table node
    graphEditorInputMode.selectablePredicate = item => {
      return !(yfiles.graph.INode.isInstance(item) && item.lookup(yfiles.graph.ITable.$class))
    }
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
    // Store lanes and nodes references.
    // It will be easier to assign lanes or connect them with edges afterwards.
    const nodes = {}
    const lanes = {}

    // Swimlanes are a special application of Tables, either one row with several columns (i.e. vertical swimlanes), or
    // one column with several rows (i.e. horizontal swimlanes).
    // In this case we go with the vertical swimlanes. Therefore we create a Table with one row and multiple columns,
    // depending on the input data.
    const table = new yfiles.graph.Table()

    // Configure the row style, i.e. the container for the swimlanes. In this case, they should not be rendered at all,
    // since we are creating a vertical swimlane. However, in the general case of Tables, we could use a
    // semi-transparent style here, too create overlapping cell colors.
    table.rowDefaults.insets = new yfiles.geometry.Insets(0, 10, 0, 0)
    table.rowDefaults.style = new yfiles.styles.VoidStripeStyle()

    // Configure the column style, i.e. the actual swimlanes.
    table.columnDefaults.insets = new yfiles.geometry.Insets(10, 30, 10, 10)
    table.columnDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      backgroundFill: '#e0e0e0',
      backgroundStroke: 'black',
      verticalTextAlignment: 'center',
      horizontalTextAlignment: 'center',
      textSize: 16
    })
    table.columnDefaults.size = 200
    table.columnDefaults.style = new yfiles.styles.NodeStyleStripeStyleAdapter(
      new yfiles.styles.ShapeNodeStyle({
        fill: '#c4d7ed',
        stroke: 'black',
        shape: 'rectangle'
      })
    )

    // The second column style that is used for the even-odd styling of the columns.
    const alternateColumnStyle = new yfiles.styles.NodeStyleStripeStyleAdapter(
      new yfiles.styles.ShapeNodeStyle({
        fill: '#abc8e2',
        stroke: 'black',
        shape: 'rectangle'
      })
    )

    // Create the single container row.
    table.createRow()

    // Iterate the lanes data and create the according lanes.
    graphData.lanesSource.forEach((laneData, index) => {
      const column = table.createColumn({
        tag: laneData,
        style: index % 2 === 0 ? table.columnDefaults.style : alternateColumnStyle
      })
      table.addLabel(column, laneData.label || laneData.id)

      // We store the lane index to easily assign nodes to them later.
      lanes[laneData.id] = index
    })

    // Create a top-level group node and bind, via the TableNodeStyle, the table to it.
    const tableStyle = new yfiles.styles.TableNodeStyle(table)
    const tableGroupNode = graph.createGroupNode(null, table.layout.toRect(), tableStyle)

    // Iterate the node data and create the according nodes.
    graphData.nodesSource.forEach(nodeData => {
      const size = nodeData.size || [50, 50]
      const node = graph.createNode({
        labels: [nodeData.label || nodeData.id],
        layout: new yfiles.geometry.Rect(0, 0, size[0], size[1]),
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

      if (nodeData.lane) {
        // Nodes are assigned to lanes based on their center location. We could either place them manually by getting
        // the respective lane's bounds, or we can use a helper function to place nodes in specific cells. In case of
        // manually, placing the nodes, don't forget to also reparent the nodes to the table group, which is also done
        // by the helper function.
        yfiles.graph.ITable.placeNodeInCell(
          graph,
          node,
          tableGroupNode,
          table.columns.elementAt(lanes[nodeData.lane]),
          table.rows.elementAt(0)
        )
      }
    })

    // Iterate the edge data and create the according edges.
    graphData.edgesSource.forEach(edgeData => {
      // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
      // which node is the correct source/target.
      graph.createEdge({
        source: nodes[edgeData.from],
        target: nodes[edgeData.to],
        labels: [edgeData.label || ''],
        tag: edgeData
      })
    })
  }

  /**
   * Serializes the graph to JSON.
   * @param {yfiles.graph.IGraph} graph The graph
   * @return {{nodesSource: Array, edgesSource: Array, lanesSource: Array}}
   */
  function writeToJSON(graph) {
    const jsonOutput = {
      nodesSource: [],
      edgesSource: [],
      lanesSource: []
    }

    // find the table, we assume there is only one
    const tableNode = graph.nodes.find(node => !!node.lookup(yfiles.graph.ITable.$class))
    const table = tableNode.lookup(yfiles.graph.ITable.$class)

    // serialize the nodes with their swimlane information
    const node2id = new yfiles.collections.Map()
    graph.nodes.forEach((node, i) => {
      // skip the table node
      if (node === tableNode) {
        return
      }

      // save the id to easily create the edgesSource afterwards
      node2id.set(node, i)

      // serialize the node
      const jsonNode = {
        id: i,
        size: [node.layout.width, node.layout.height],
        fill: colorToHex(node.style.fill.color)
      }
      if (node.labels.size > 0) {
        jsonNode.label = node.labels.first().text
      }
      jsonOutput.nodesSource.push(jsonNode)

      // store the lane of the node
      const column = table.findColumn(tableNode, node.layout.center)
      if (column) {
        const columnId = `lane${table.findColumn(tableNode, node.layout.center).index}`
        jsonNode.lane = columnId
        // store new lanes in the json
        if (!jsonOutput.lanesSource.find(lane => lane.id === columnId)) {
          const jsonLane = { id: columnId }
          if (column.labels.size > 0) {
            jsonLane.label = column.labels.first().text
          }
          jsonOutput.lanesSource.push(jsonLane)
        }
      }
    })

    // serialize the edges
    graph.edges.forEach(edge => {
      const sourceId = node2id.get(edge.sourceNode)
      const targetId = node2id.get(edge.targetNode)
      jsonOutput.edgesSource.push({
        from: sourceId,
        to: targetId
      })
    })

    return jsonOutput
  }

  /**
   * Helper function that converts a {yfiles.view.Color} to a hex color string.
   * @param {yfiles.view.Color} color
   * @returns {string} hex color
   */
  function colorToHex(color) {
    // zero-padding
    let hexR = color.r.toString(16)
    if (hexR.length < 2) {
      hexR = `0${hexR}`
    }
    let hexG = color.g.toString(16)
    if (hexG.length < 2) {
      hexG = `0${hexG}`
    }
    let hexB = color.b.toString(16)
    if (hexB.length < 2) {
      hexB = `0${hexB}`
    }
    return `#${hexR}${hexG}${hexB}`
  }

  /**
   * Runs a {@link yfiles.hierarchic.HierarchicLayout} on the current graph. The
   * {@link yfiles.hierarchic.HierarchicLayout} respects the node to cell (or swimlane) assignment by considering the
   * nodes location in relation to the swimlane bounds.
   * @param {yfiles.lang.TimeSpan|string} duration The animation duration of the layout.
   * @return {Promise<>}
   */
  function runLayout(duration) {
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.componentLayoutEnabled = false
    layout.layoutOrientation = yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM
    layout.orthogonalRouting = true
    layout.recursiveGroupLayering = false
    layout.nodePlacer.barycenterMode = true

    // We use Layout executor convenience method that already sets up the whole layout pipeline correctly
    const layoutExecutor = new yfiles.layout.LayoutExecutor(
      graphComponent,
      new yfiles.layout.MinimumNodeSizeStage(layout)
    )
    // Table layout is enabled by default already...
    layoutExecutor.configureTableLayout = true
    layoutExecutor.duration = duration
    layoutExecutor.animateViewport = true

    // Apply an initial layout
    return layoutExecutor.start()
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
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.InteriorLabelModel.CENTER

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
    app.bindAction("button[data-command='Save']", () => {
      const json = writeToJSON(graphComponent.graph)
      FileSaveSupport.save(JSON.stringify(json), 'graph.json')
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
    app.bindAction("button[data-command='Layout']", () => runLayout('1s'))
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
