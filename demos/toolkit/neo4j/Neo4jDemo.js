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
  Arrow,
  ArrowType,
  ChainSubstructureStyle,
  Color,
  CycleSubstructureStyle,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeStyleDecorationInstaller,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IModelItem,
  INode,
  LayoutExecutor,
  License,
  NodeStyleDecorationInstaller,
  OrganicLayout,
  ParallelSubstructureStyle,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  StarSubstructureStyle,
  Stroke,
  StyleDecorationZoomPolicy,
  VoidLabelStyle
} from 'yfiles'

import { DemoEdgeStyle, DemoNodeStyle } from '../../resources/demo-styles.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { createGraphBuilder } from './Neo4jGraphBuilder.js'
import { connectToDB, Neo4jEdge, Neo4jNode } from './Neo4jUtil.js'

/** @type {GraphComponent} */
let graphComponent = null

/** @type {function} */
let runCypherQuery = null

/** @type {GraphBuilder} */
let graphBuilder = null

// get hold of some UI elements
const loadingIndicator = document.getElementById('loadingIndicator')
const labelsContainer = document.getElementById('labels')
const selectedNodeContainer = document.getElementById('selected-node-container')
const propertyTable = document.getElementById('propertyTable')
const propertyTableHeader = propertyTable.firstElementChild
const numNodesInput = document.getElementById('numNodes')
const numLabelsInput = document.getElementById('numLabels')
const showEdgeLabelsCheckbox = document.getElementById('showEdgeLabels')
const queryErrorContainer = document.getElementById('queryError')

/**
 * Runs the demo.
 */
function run(licenseData) {
  License.value = licenseData
  if (!('WebSocket' in window)) {
    // early exit the application if WebSockets are not supported
    document.getElementById('login').hidden = true
    document.getElementById('noWebSocketAPI').hidden = false
    showApp(graphComponent)
    return
  }

  graphComponent = new GraphComponent('graphComponent')

  initializeGraphDefaults()
  initializeHighlighting()
  createInputMode()
  registerCommands()
  showApp(graphComponent)
}

/**
 * Initializes the styles for the graph nodes, edges, labels.
 */
function initializeGraphDefaults() {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.nodeDefaults.size = new Size(30, 30)

  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: 'rgba(255,255,255,0.85)',
    textFill: '#336699'
  })

  const newExteriorLabelModel = new ExteriorLabelModel({ insets: 5 })
  graph.nodeDefaults.labels.layoutParameter = newExteriorLabelModel.createParameter(
    ExteriorLabelModelPosition.SOUTH
  )

  graph.edgeDefaults.style = new DemoEdgeStyle()
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel().createDefaultParameter()
}

/**
 * Creates highlight styling. See the GraphViewer demo for more details.
 */
function initializeHighlighting() {
  const orangeRed = Color.ORANGE_RED
  const orangeStroke = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3)
  orangeStroke.freeze()

  const decorator = graphComponent.graph.decorator

  const highlightShape = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: orangeStroke,
    fill: null
  })

  const nodeStyleHighlight = new NodeStyleDecorationInstaller({
    nodeStyle: highlightShape,
    margins: 5,
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })
  decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)

  const dummyCroppingArrow = new Arrow({
    type: ArrowType.NONE,
    cropLength: 5
  })
  const edgeStyle = new PolylineEdgeStyle({
    stroke: orangeStroke,
    targetArrow: dummyCroppingArrow,
    sourceArrow: dummyCroppingArrow
  })
  const edgeStyleHighlight = new EdgeStyleDecorationInstaller({
    edgeStyle,
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })
  decorator.edgeDecorator.highlightDecorator.setImplementation(edgeStyleHighlight)

  graphComponent.addCurrentItemChangedListener(() => onCurrentItemChanged())
}

/**
 * Initialize and configure the input mode. Only allow viewing of the data and moving nodes around.
 */
function createInputMode() {
  const mode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE
  })
  mode.marqueeSelectionInputMode.enabled = false

  mode.itemHoverInputMode.enabled = true
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.NODE
  mode.itemHoverInputMode.discardInvalidItems = false
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, evt) =>
    onHoveredItemChanged(evt.item)
  )

  // load more data on double click
  mode.addItemDoubleClickedListener(async (sender, { item }) => {
    const result = await runCypherQuery(
      `MATCH (n)-[e]-(m) 
       WHERE id(n) = $nodeId
       RETURN DISTINCT e, m LIMIT 50`,
      { nodeId: item.tag.identity }
    )
    let updated = false
    for (const record of result.records) {
      const node = record.get('m')
      const edge = record.get('e')
      if (graphBuilder.nodesSource.every(n => !n.identity.equals(node.identity))) {
        graphBuilder.nodesSource.push(node)
        updated = true
      }
      if (graphBuilder.edgesSource.every(e => !e.identity.equals(edge.identity))) {
        graphBuilder.edgesSource.push(edge)
        updated = true
      }
    }
    if (updated) {
      graphBuilder.updateGraph()
      await doLayout()
    }
  })

  graphComponent.inputMode = mode
}

/**
 * If the currentItem property on GraphComponent's changes we adjust the details panel.
 */
function onCurrentItemChanged() {
  // clear the current display
  labelsContainer.innerHTML = ''
  while (propertyTable.hasChildNodes()) {
    propertyTable.removeChild(propertyTable.firstChild)
  }

  const currentItem = graphComponent.currentItem
  const isNode = INode.isInstance(currentItem)
  selectedNodeContainer.hidden = !isNode
  if (isNode) {
    const node = currentItem
    // show all labels of the current node
    labelsContainer.textContent = node.tag.labels.join(', ')
    const properties = node.tag.properties
    if (properties && Object.keys(properties).length > 0) {
      propertyTable.appendChild(propertyTableHeader)
      // add a table row for each property
      for (const propertyName of Object.keys(properties)) {
        const tr = document.createElement('tr')
        const nameTd = document.createElement('td')
        nameTd.textContent = propertyName
        const valueTd = document.createElement('td')
        valueTd.textContent = properties[propertyName].toString()
        tr.appendChild(nameTd)
        tr.appendChild(valueTd)
        propertyTable.appendChild(tr)
      }
    }
  }
}

/**
 * Loads the graph data from the Neo4j database and constructs a graph using a custom
 * {@link GraphBuilder}.
 * @yjs:keep=nodeIds,end
 */
async function loadGraph() {
  // show a loading indicator, as the queries can take a while to complete
  loadingIndicator.hidden = false
  setUIDisabled(true)

  graphComponent.graph.clear()
  // maximum number of nodes that should be fetched
  const numNodes = numNodesInput.value
  // minimum number of labels that should be present in the returned data
  const numLabels = numLabelsInput.value

  // letters that are used as names for nodes in the cypher query
  const letters = ['a', 'b', 'c', 'd', 'e'].slice(0, numLabels)
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
  const nodeResult = await runCypherQuery(
    `MATCH ${matchClause} 
      WHERE ${whereClauses.join(' AND ')} 
      WITH [${letters.join(',')}] AS nodes LIMIT ${numNodes * numLabels}
      UNWIND nodes AS node
      RETURN DISTINCT node`
  )
  // extract the nodes from the query result
  const nodes = nodeResult.records.map(record => record.get('node'))
  // obtain an array of all node ids
  const nodeIds = nodes.map(node => node.identity)
  // get all edges between all nodes that we have, omitting self loops and limiting the overall number of
  // results to a multiple of numNodes, as some graphs have nodes wth degrees in the thousands
  const edgeResult = await runCypherQuery(
    `MATCH (n)-[edge]-(m) 
            WHERE id(n) IN $nodeIds 
            AND id(m) IN $nodeIds
            AND startNode(edge) <> endNode(edge)
            RETURN DISTINCT edge LIMIT ${numNodes * 5}`,
    { nodeIds }
  )
  // extract the edges from the query result
  const edges = edgeResult.records.map(record => record.get('edge'))
  // custom GraphBuilder that assigns nodes different styles based on their labels
  graphBuilder = createGraphBuilder(graphComponent, nodes, edges)

  graphBuilder.buildGraph()

  // apply a layout to the new graph
  await doLayout()

  loadingIndicator.hidden = true
  setUIDisabled(false)
}

/**
 * This method will be called whenever the mouse moves over a different item. We show a highlight
 * indicator to make it easier for the user to understand the graph's structure.
 * @param {IModelItem} hoveredItem The currently hovered item
 */
function onHoveredItemChanged(hoveredItem) {
  // we use the highlight manager of the GraphComponent to highlight related items
  const manager = graphComponent.highlightIndicatorManager

  // first remove previous highlights
  manager.clearHighlights()
  // then see where we are hovering over, now
  if (hoveredItem !== null) {
    // we highlight the item itself
    manager.addHighlight(hoveredItem)
    if (INode.isInstance(hoveredItem)) {
      // and if it's a node, we highlight all adjacent edges, too
      graphComponent.graph.edgesAt(hoveredItem).forEach(edge => {
        manager.addHighlight(edge)
      })
    } else if (IEdge.isInstance(hoveredItem)) {
      // if it's an edge - we highlight the adjacent nodes
      manager.addHighlight(hoveredItem.sourceNode)
      manager.addHighlight(hoveredItem.targetNode)
    }
  }
}

/**
 * Applies an organic layout to the current graph. Tries to highlight substructures in the process.
 */
async function doLayout() {
  setUIDisabled(true)
  const organicLayout = new OrganicLayout()
  organicLayout.chainSubstructureStyle = ChainSubstructureStyle.STRAIGHT_LINE
  organicLayout.cycleSubstructureStyle = CycleSubstructureStyle.CIRCULAR
  organicLayout.parallelSubstructureStyle = ParallelSubstructureStyle.STRAIGHT_LINE
  organicLayout.starSubstructureStyle = StarSubstructureStyle.CIRCULAR
  organicLayout.minimumNodeDistance = 60
  organicLayout.considerNodeLabels = true
  organicLayout.considerNodeSizes = true
  organicLayout.deterministic = true
  organicLayout.nodeEdgeOverlapAvoided = true
  organicLayout.qualityTimeRatio = 0.8
  organicLayout.parallelEdgeRouter.joinEnds = true
  organicLayout.parallelEdgeRouter.lineDistance = 15
  try {
    await new LayoutExecutor({
      graphComponent,
      layout: organicLayout,
      duration: '1s',
      animateViewport: true
    }).start()
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Disables the HTML elements of the UI.
 * @param {boolean} value Whether the elements should be disabled.
 */
function setUIDisabled(value) {
  document.getElementById('reloadDataButton').disabled = value
  document.getElementById('numNodes').disabled = value
  document.getElementById('numLabels').disabled = value
}

/**
 * Wires up the UI.
 * @yjs:keep=setValue,getValue
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindAction("button[data-command='ReloadData']", loadGraph)

  // toggle edge label display
  showEdgeLabelsCheckbox.addEventListener('input', () => {
    const graph = graphComponent.graph
    const style = showEdgeLabelsCheckbox.checked
      ? graph.edgeDefaults.labels.style
      : new VoidLabelStyle()
    for (const label of graph.edgeLabels) {
      graph.setStyle(label, style)
    }
  })

  const userEl = document.querySelector('#userInput')
  const hostEl = document.querySelector('#hostInput')
  const passwordEl = document.querySelector('#passwordInput')
  const encryptionEl = document.querySelector('#encryptionInput')

  // Encryption not supported for connections to localhost
  // => uncheck and disable the encryption checkbox for localhost urls.
  function setEncryptionInput(event) {
    const url = event.target.value
    const isLocalhost = /^(bolt:\/\/)?((localhost)|(127\.0\.0\.1($|\D)))/.test(url)
    encryptionEl.checked = encryptionEl.checked && !isLocalhost
    encryptionEl.disabled = isLocalhost
  }

  hostEl.addEventListener('change', setEncryptionInput)
  hostEl.addEventListener('keyup', setEncryptionInput)

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault()
    let url = hostEl.value
    if (url.indexOf('bolt') < 0) {
      url = `bolt://${url}`
    }
    const user = userEl.value
    const pass = passwordEl.value
    const encrypted = encryptionEl.checked
    try {
      runCypherQuery = await connectToDB(url, user, pass, encrypted)

      // hide the login form and show the graph component
      document.querySelector('#loginPane').setAttribute('style', 'display: none;')
      document.querySelector('#graphPane').removeAttribute('style')
      await loadGraph()
    } catch (e) {
      document.querySelector('#connectionError').innerHTML = `An error occurred: ${e}`
      // In some cases (connecting from https to http) an exception is thrown outside the promise
      if (window.location.protocol === 'https:') {
        document.querySelector('#openInHttp').hidden = false
        document
          .querySelector('#openInHttp>a')
          .setAttribute('href', window.location.href.replace('https:', 'http:'))
      }
    }
  })

  numNodesInput.addEventListener(
    'input',
    () => {
      document.getElementById('numNodesLabel').textContent = numNodesInput.value.toString()
    },
    true
  )

  numLabelsInput.addEventListener(
    'input',
    () => {
      document.getElementById('numLabelsLabel').textContent = numLabelsInput.value.toString()
    },
    true
  )

  // create cypher query editor
  const cypherInput = document.getElementById('cypher-input')
  const { editor } = window.CypherCodeMirror.createCypherEditor(cypherInput, {
    mode: 'cypher',
    theme: 'cypher',
    lineNumbers: true
  })
  // sample query
  editor.setValue('MATCH (n)-[e]-(m)\nRETURN * LIMIT 150')

  bindAction('#run-cypher-button', async () => {
    const query = editor.getValue()
    let result
    try {
      result = await runCypherQuery(query)
    } catch (e) {
      queryErrorContainer.textContent = `Query failed: ${e}`
      return
    }
    queryErrorContainer.textContent = ''
    const nodes = []
    const edges = []
    for (const record of result.records) {
      record.forEach(field => {
        if (field instanceof Neo4jNode) {
          nodes.push(field)
        } else if (field instanceof Neo4jEdge) {
          edges.push(field)
        }
      })
    }
    graphComponent.graph.clear()
    graphBuilder = createGraphBuilder(graphComponent, nodes, edges)
    graphBuilder.buildGraph()
    // apply a layout to the new graph
    await doLayout()
  })
}

// start demo
loadJson().then(run)
