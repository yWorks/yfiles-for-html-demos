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

require([
  'yfiles/view-component',
  'resources/demo-app',
  'resources/demo-styles',
  'yfiles/layout-organic',
  'yfiles/view-layout-bridge',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** The Neo4j driver */
  let neo4jDriver = null

  // get hold of some UI elements
  const loadingIndicator = document.getElementById('loadingIndicator')
  const labelsContainer = document.getElementById('labels')
  const propertyTable = document.getElementById('propertyTable')
  const propertyTableHeader = propertyTable.firstElementChild
  const numNodesInput = document.getElementById('numNodes')
  const numLabelsInput = document.getElementById('numLabels')

  /**
   * Runs the demo.
   */
  function run() {
    if (!('WebSocket' in window)) {
      // early exit the application if WebSockets are not supported
      app.addClass(document.getElementById('login'), 'hidden')
      app.removeClass(document.getElementById('noWebSocketAPI'), 'hidden')
      app.show()
      return
    }

    // switch on encryption if served on https
    document.querySelector('#encryptionInput').checked = window.location.protocol === 'https:'

    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeGraph()

    initializeHighlighting()

    createInputMode()

    registerCommands()

    numNodesInput.addEventListener(
      'change',
      () => {
        document.getElementById('numNodesLabel').textContent = numNodesInput.value.toString()
      },
      true
    )

    numLabelsInput.addEventListener(
      'change',
      () => {
        document.getElementById('numLabelsLabel').textContent = numLabelsInput.value.toString()
      },
      true
    )

    app.show(graphComponent)
  }

  /**
   * Initializes the styles for the graph nodes, edges, labels.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    graph.nodeDefaults.style = new DemoStyles.DemoNodeStyle()
    graph.nodeDefaults.size = new yfiles.geometry.Size(30, 30)

    const newExteriorLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 5 })
    graph.nodeDefaults.labels.layoutParameter = newExteriorLabelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.SOUTH
    )

    graph.edgeDefaults.style = new DemoStyles.DemoEdgeStyle()
  }

  /**
   * Creates highlight styling. See the GraphViewer demo for more details.
   */
  function initializeHighlighting() {
    const orangeRed = yfiles.view.Color.ORANGE_RED
    const orangeStroke = new yfiles.view.Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3)
    orangeStroke.freeze()

    const decorator = graphComponent.graph.decorator

    const highlightShape = new yfiles.styles.ShapeNodeStyle({
      shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
      stroke: orangeStroke,
      fill: null
    })

    const nodeStyleHighlight = new yfiles.view.NodeStyleDecorationInstaller({
      nodeStyle: highlightShape,
      margins: 5,
      zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES
    })
    decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)

    const dummyCroppingArrow = new yfiles.styles.Arrow({
      type: yfiles.styles.ArrowType.NONE,
      cropLength: 5
    })
    const edgeStyle = new yfiles.styles.PolylineEdgeStyle({
      stroke: orangeStroke,
      targetArrow: dummyCroppingArrow,
      sourceArrow: dummyCroppingArrow
    })
    const edgeStyleHighlight = new yfiles.view.EdgeStyleDecorationInstaller({
      edgeStyle,
      zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES
    })
    decorator.edgeDecorator.highlightDecorator.setImplementation(edgeStyleHighlight)

    graphComponent.addCurrentItemChangedListener(onCurrentItemChanged)
  }

  /**
   * Initialize and configure the input mode. Only allow viewing of the data and moving nodes around.
   */
  function createInputMode() {
    const mode = new yfiles.input.GraphViewerInputMode({
      clickableItems: yfiles.graph.GraphItemTypes.NODE,
      focusableItems: yfiles.graph.GraphItemTypes.NODE,
      selectableItems: yfiles.graph.GraphItemTypes.NONE
    })
    mode.marqueeSelectionInputMode.enabled = false

    mode.itemHoverInputMode.enabled = true
    mode.itemHoverInputMode.hoverItems =
      yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.NODE
    mode.itemHoverInputMode.discardInvalidItems = false
    mode.itemHoverInputMode.addHoveredItemChangedListener(onHoveredItemChanged)

    graphComponent.inputMode = mode
  }

  /**
   * Establishes a connection to a Neo4j database.
   * @param {string} url The URL to connect to, usually through the bolt protocol (bolt://)
   * @param {string} user The username to use.
   * @param {string} pass The password to use.
   */
  function connectToDB(url, user, pass) {
    const encrypted = document.querySelector('#encryptionInput').checked

    /* eslint-disable global-require */
    require(['https://unpkg.com/neo4j-driver@1.7.1/lib/browser/neo4j-web.js'], neo4j => {
      // create a new Neo4j driver instance
      neo4jDriver = neo4j.v1.driver(url, neo4j.v1.auth.basic(user, pass), {
        encrypted: encrypted,
        trust: 'TRUST_CUSTOM_CA_SIGNED_CERTIFICATES'
      })

      const errorHandler = () => {
        if (window.location.protocol === 'https:') {
          document.querySelector('#openInHttp').style.visibility = 'visible'
          document
            .querySelector('#openInHttp>a')
            .setAttribute('href', window.location.href.replace('https:', 'http:'))
        }
      }

      try {
        runCypherQuery('MATCH (n) RETURN n LIMIT 1')
          .then(result => {
            // hide the login form and show the graph component
            document.querySelector('#loginPane').setAttribute('style', 'display: none;')
            document.querySelector('#graphPane').removeAttribute('style')
            loadGraph()
          })
          .catch(errorHandler)
      } catch (e) {
        // In some cases (connecting from https to http) an exception is thrown outside the promise
        errorHandler()
      }
    })
  }

  /**
   * If the currentItem property on GraphComponent's changes we adjust the details panel.
   */
  function onCurrentItemChanged(sender, propertyChangedEventArgs) {
    // clear the current display
    labelsContainer.innerHTML = ''
    while (propertyTable.hasChildNodes()) {
      propertyTable.removeChild(propertyTable.firstChild)
    }

    const currentItem = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(currentItem)) {
      const node = currentItem
      // show all labels of the current node
      labelsContainer.textContent = node.tag.labels.join(', ')
      const properties = node.tag.properties
      if (properties && Object.keys(properties).length > 0) {
        propertyTable.appendChild(propertyTableHeader)
        // add a table row for each property
        Object.keys(properties).forEach(propertyName => {
          const tr = document.createElement('tr')
          const nameTd = document.createElement('td')
          nameTd.textContent = propertyName
          const valueTd = document.createElement('td')
          valueTd.textContent = properties[propertyName].toString()
          tr.appendChild(nameTd)
          tr.appendChild(valueTd)
          propertyTable.appendChild(tr)
        })
      }
    }
  }

  /**
   * Loads the graph data from the Neo4j database and constructs a graph using a custom
   * {@link yfiles.binding.GraphBuilder}.
   * @yjs:keep=nodeIds,end
   */
  function loadGraph() {
    // show a loading indicator, as the queries can take a while to complete
    loadingIndicator.setAttribute('style', 'display: block;')
    setUIDisabled(true)

    // clear the graph
    graphComponent.graph.clear()
    // maximum number of nodes that should be fetched
    const numNodes = numNodesInput.value
    // minimum number of labels that should be present in the returned data
    const numLabels = numLabelsInput.value

    // letters that are used as names for nodes in the cypher query
    const letters = 'abcde'.split('').slice(0, numLabels)
    // we match a chain of nodes that is at least numLabels long
    const matchClause = letters.map(letter => `(${letter})`).join('--')
    const whereClauses = []
    for (let i = 1; i < numLabels; ++i) {
      for (let j = 0; j < i; ++j) {
        // each node in the chain should have at least one label that the previous nodes do not have
        whereClauses.push(
          `any(label IN labels(${letters[i]}) WHERE NOT label IN labels(${letters[j]}))`
        )
      }
    }
    // run the query to get the nodes
    runCypherQuery(
      `MATCH ${matchClause} 
        WHERE ${whereClauses.join(' AND ')} 
        WITH [${letters.join(',')}] AS nodes LIMIT ${numNodes * numLabels}
        UNWIND nodes AS node
        RETURN DISTINCT node`
    ).then(nodeResult => {
      // extract the nodes from the query result
      const nodes = nodeResult.records.map(record => record.get('node'))
      // obtain an array of all node ids
      const nodeIds = nodes.map(node => node.identity)
      // get all edges between all nodes that we have, omitting self loops and limiting the overall number of
      // results to a multiple of numNodes, as some graphs have nodes wth degrees in the thousands
      runCypherQuery(
        `MATCH (n)-[edge]-(m) 
              WHERE id(n) IN $nodeIds 
              AND id(m) IN $nodeIds
              AND startNode(edge) <> endNode(edge)
              RETURN DISTINCT edge LIMIT ${numNodes * 5}`,
        { nodeIds }
      ).then(edgeResult => {
        // extract the edges from the query result
        const edges = edgeResult.records.map(record => record.get('edge'))
        // custom GraphBuilder that assigns nodes different styles based on their labels
        const graphBuilder = new Neo4jGraphBuilder(
          graphComponent.graph,
          createNodeStyleMapping(nodes.map(node => node.labels))
        )
        graphBuilder.nodesSource = nodes
        graphBuilder.edgesSource = edges

        // helper method to convert the neo4j "long" ids, to a simple JavaScript object (string)
        function getId(identity) {
          return `${identity.low.toString()}:${identity.high.toString()}`
        }

        graphBuilder.nodeIdBinding = node => getId(node.identity)
        graphBuilder.sourceNodeBinding = edge => getId(edge.start)
        graphBuilder.targetNodeBinding = edge => getId(edge.end)
        graphBuilder.nodeLabelBinding = node => {
          if (node.properties) {
            const propertyNames = Object.keys(node.properties)
            for (let i = 0; i < propertyNames.length; ++i) {
              const propertyName = propertyNames[i]
              // try to find a suitable node label
              if (
                ['name', 'title', 'firstName', 'lastName', 'email', 'content'].indexOf(
                  propertyName
                ) > -1
              ) {
                // trim the label
                return node.properties[propertyName].substring(0, 30)
              }
            }
          }
          return node.labels && node.labels.length > 0 ? node.labels.join(' - ') : null
        }

        graphBuilder.buildGraph()

        // apply a layout to the new graph
        doLayout()
      })
    })
  }

  /**
   * A custom {@link yfiles.binding.GraphBuilder} that can assign different node styles based on their labels.
   */
  class Neo4jGraphBuilder extends yfiles.binding.GraphBuilder {
    /**
     * @param {yfiles.graph.IGraph} graph
     * @param {Array<{labelName, style}>} nodeStyleMapping
     */
    constructor(graph, nodeStyleMapping) {
      super(graph)
      this.nodeStyleMapping = nodeStyleMapping
    }

    /**
     * Override the default createNode method of GraphBuilder to assign styles to nodes based on their labels.
     * @see {@link yfiles.binding.GraphBuilder#createNode}
     */
    createNode(graph, parent, location, labelData, businessObject) {
      // get the default style to use as a fallback
      let style = graph.nodeDefaults.style

      // look for a mapping for any of the nodes labels and use the mapped style
      for (let i = 0; i < this.nodeStyleMapping.length; ++i) {
        if (businessObject.labels.indexOf(this.nodeStyleMapping[i].labelName) > -1) {
          style = this.nodeStyleMapping[i].style
          break
        }
      }
      // create the node and set its label
      const newNode = graph.createNodeAt(location, style, businessObject)
      graph.addLabel(newNode, labelData)
      return newNode
    }
  }

  /**
   * Creates a mapping between node labels and node styles.
   * @param {Array<Array<String>>} nodeLabels
   * @return {Array<Object<String, yfiles.styles.INodeStyle>>}
   */
  function createNodeStyleMapping(nodeLabels) {
    // flatten arrays
    const flatNodeLabels = nodeLabels.reduce((a, b) => a.concat(b), [])
    const labelCount = {}
    const labels = []
    // count labels
    flatNodeLabels.forEach(label => {
      if (!(label in labelCount)) {
        labelCount[label] = 0
        labels.push(label)
      }
      labelCount[label] += 1
    })
    // sort unique labels by their frequency
    labels.sort((a, b) => labelCount[a] - labelCount[b])
    // define some distinct looking styles
    const styles = [
      new yfiles.styles.ShapeNodeStyle({
        shape: 'triangle',
        fill: 'darkorange'
      }),
      new yfiles.styles.ShapeNodeStyle({
        shape: 'diamond',
        fill: 'limegreen'
      }),
      new yfiles.styles.ShapeNodeStyle({
        shape: 'rectangle',
        fill: 'blue'
      }),
      new yfiles.styles.ShapeNodeStyle({
        shape: 'hexagon',
        fill: 'darkviolet'
      }),
      new yfiles.styles.ShapeNodeStyle({
        shape: 'ellipse',
        fill: 'azure'
      })
    ]
    // map label names to styles
    return labels.map((label, i) => ({
      labelName: label,
      style: styles[i % styles.length]
    }))
  }

  /**
   * Runs a cypher query using the currently available Neo4j diver.
   * @param {string} query
   * @param {Object} params
   * @return {Promise}
   */
  function runCypherQuery(query, params) {
    const session = neo4jDriver.session('READ')
    return session
      .run(query, params || {})
      .then(result => {
        session.close()
        return result
      })
      .catch(error => {
        session.close()
        document.querySelector('#connectionError').innerHTML = `An error occurred: ${error}`
        throw error
      })
  }

  /**
   * Called when the mouse hovers over a different item.
   * This method will be called whenever the mouse moves over a different item. We show a highlight indicator
   * to make it easier for the user to understand the graph's structure.
   */
  function onHoveredItemChanged(sender, hoveredItemChangedEventArgs) {
    // we use the highlight manager of the GraphComponent to highlight related items
    const manager = graphComponent.highlightIndicatorManager

    // first remove previous highlights
    manager.clearHighlights()
    // then see where we are hovering over, now
    const newItem = hoveredItemChangedEventArgs.item
    if (newItem !== null) {
      // we highlight the item itself
      manager.addHighlight(newItem)
      if (yfiles.graph.INode.isInstance(newItem)) {
        // and if it's a node, we highlight all adjacent edges, too
        graphComponent.graph.edgesAt(newItem).forEach(edge => {
          manager.addHighlight(edge)
        })
      } else if (yfiles.graph.IEdge.isInstance(newItem)) {
        // if it's an edge - we highlight the adjacent nodes
        manager.addHighlight(newItem.sourceNode)
        manager.addHighlight(newItem.targetNode)
      }
    }
  }

  /**
   * Applies an organic layout to the current graph. Tries to highlight substructures in the process.
   */
  function doLayout() {
    const organicLayout = new yfiles.organic.OrganicLayout()
    organicLayout.chainSubstructureStyle = yfiles.organic.ChainSubstructureStyle.STRAIGHT_LINE
    organicLayout.cycleSubstructureStyle = yfiles.organic.CycleSubstructureStyle.CIRCULAR
    organicLayout.parallelSubstructureStyle = yfiles.organic.ParallelSubstructureStyle.STRAIGHT_LINE
    organicLayout.starSubstructureStyle = yfiles.organic.StarSubstructureStyle.SEPARATED_RADIAL
    organicLayout.minimumNodeDistance = 60
    organicLayout.considerNodeLabels = true
    organicLayout.considerNodeSizes = true
    organicLayout.deterministic = true
    organicLayout.parallelEdgeRouterEnabled = false
    graphComponent
      .morphLayout(organicLayout, '1s')
      .then(() => {
        setUIDisabled(false)
        graphComponent.fitGraphBounds()
        // hide the loading indicator
        loadingIndicator.setAttribute('style', 'display: none;')
      })
      .catch(error => {
        setUIDisabled(false)
        // hide the loading indicator
        loadingIndicator.setAttribute('style', 'display: none;')
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Disables the HTML elements of the UI.
   *
   * @param disabled true if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('reloadDataButton').disabled = disabled
    document.getElementById('numNodes').disabled = disabled
    document.getElementById('numLabels').disabled = disabled
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindAction("button[data-command='ReloadData']", loadGraph)

    app.bindAction('#connectButton', () => {
      let url = document.querySelector('#hostInput').value
      if (url.indexOf('bolt') < 0) {
        url = `bolt://${url}`
      }
      const user = document.querySelector('#userInput').value
      const pass = document.querySelector('#passwordInput').value
      connectToDB(url, user, pass)
    })
  }

  // start demo
  run()
})
