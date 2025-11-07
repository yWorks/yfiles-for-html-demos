/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Color,
  EdgeLabelPreferredPlacement,
  EdgePathLabelModel,
  EdgeStyleIndicatorRenderer,
  ExteriorNodeLabelModel,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  ILabelStyle,
  INode,
  Insets,
  LabelStyle,
  LayoutExecutor,
  License,
  NodeStyleIndicatorRenderer,
  OrganicLayout,
  OrganicLayoutData,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  Stroke
} from '@yfiles/yfiles'

import { createDemoEdgeStyle, createDemoNodeStyle } from '@yfiles/demo-app/demo-styles'
import { createGraphBuilder } from './Neo4jGraphBuilder'
import { connectToDB, Neo4jEdge, Neo4jNode } from './Neo4jUtil'
import licenseData from '../../../lib/license.json'
import { finishLoading, showLoadingIndicator } from '@yfiles/demo-app/demo-page'
import { createCodemirrorEditor } from '@yfiles/demo-app/codemirror-editor'

let editor

let graphComponent

let runCypherQuery

let graphBuilder

let nodes = []

let edges = []

// get hold of some UI elements
const labelsContainer = document.querySelector('#labels')
const selectedNodeContainer = document.querySelector('#selected-node-container')
const propertyTable = document.querySelector('.property-table')
const propertyTableHeader = propertyTable.firstElementChild
const numNodesInput = document.querySelector('#numNodes')
const numLabelsInput = document.querySelector('#numLabels')
const showEdgeLabelsCheckbox = document.querySelector('#showEdgeLabels')
const queryErrorContainer = document.querySelector('#queryError')

/**
 * Runs the demo.
 */
async function run() {
  License.value = licenseData
  if (!('WebSocket' in window)) {
    // early exit the application if WebSockets are not supported
    document.querySelector('#login').hidden = true
    document.querySelector('#noWebSocketAPI').hidden = false
    return
  }

  graphComponent = new GraphComponent('graphComponent')
  initializeGraphDefaults()
  initializeHighlighting()
  createInputMode()
  initializeUI()
}

/**
 * Initializes the styles for the graph nodes, edges, labels.
 */
function initializeGraphDefaults() {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = createDemoNodeStyle()
  graph.nodeDefaults.size = new Size(30, 30)

  graph.edgeDefaults.labels.style = new LabelStyle({
    backgroundFill: 'rgba(255,255,255,0.85)',
    textFill: '#336699'
  })

  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')

  graph.edgeDefaults.style = createDemoEdgeStyle()
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel().createRatioParameter()
}

/**
 * Creates highlight styling. See the GraphViewer demo for more details.
 */
function initializeHighlighting() {
  const orangeRed = Color.ORANGE_RED
  const orangeStroke = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3).freeze()

  const nodeStyleHighlight = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      stroke: orangeStroke,
      fill: null
    }),
    margins: 5
  })

  const dummyCroppingArrow = new Arrow({ type: ArrowType.NONE, cropLength: 5 })
  const edgeStyleHighlight = new EdgeStyleIndicatorRenderer({
    edgeStyle: new PolylineEdgeStyle({
      stroke: orangeStroke,
      targetArrow: dummyCroppingArrow,
      sourceArrow: dummyCroppingArrow
    })
  })
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(nodeStyleHighlight)
  graphComponent.graph.decorator.edges.highlightRenderer.addConstant(edgeStyleHighlight)

  graphComponent.addEventListener('current-item-changed', () => onCurrentItemChanged())
}

/**
 * Initialize and configure the input mode. Only allow viewing of the data and moving nodes around.
 */
function createInputMode() {
  const mode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE
  })

  // As the selection is deactivated, the focused item is highlighted instead
  graphComponent.focusIndicatorManager.showFocusPolicy = 'when-focused'

  mode.itemHoverInputMode.enabled = true
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.NODE
  mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) =>
    onHoveredItemChanged(evt.item)
  )

  // load more data on double click
  mode.addEventListener('item-double-clicked', async ({ item }) => {
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
      if (nodes.every((n) => !n.identity.equals(node.identity))) {
        nodes.push(node)
        updated = true
      }
      if (edges.every((e) => !e.identity.equals(edge.identity))) {
        edges.push(edge)
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
  while (propertyTable.lastChild != null) {
    propertyTable.removeChild(propertyTable.lastChild)
  }

  const currentItem = graphComponent.currentItem
  const isNode = currentItem instanceof INode
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
        const clippedNameDiv = document.createElement('div')
        clippedNameDiv.classList.add('clipped')
        clippedNameDiv.textContent = propertyName
        nameTd.appendChild(clippedNameDiv)
        const valueTd = document.createElement('td')
        const clippedValueDiv = document.createElement('div')
        clippedValueDiv.classList.add('clipped')
        clippedValueDiv.textContent = properties[propertyName].toString()
        valueTd.appendChild(clippedValueDiv)
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
 * @yjs:keep = nodeIds,end
 */
async function loadGraph() {
  // show a loading indicator, as the queries can take a while to complete
  await showLoadingIndicator(true)
  setUIDisabled(true)

  graphComponent.graph.clear()
  // maximum number of nodes that should be fetched
  const numNodes = parseInt(numNodesInput.value)
  // minimum number of labels that should be present in the returned data
  const numLabels = parseInt(numLabelsInput.value)

  // letters that are used as names for nodes in the cypher query
  const letters = ['a', 'b', 'c', 'd', 'e'].slice(0, numLabels)
  // we match a chain of nodes that is at least numLabels long
  const matchClause = letters.map((letter) => `(${letter})`).join('--')
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
  const nodeResult = await runCypherQuery(`MATCH ${matchClause}
      WHERE ${whereClauses.join(' AND ')}
      WITH [${letters.join(',')}] AS nodes LIMIT ${numNodes * numLabels}
      UNWIND nodes AS node
      RETURN DISTINCT node`)
  // extract the nodes from the query result
  nodes = nodeResult.records.map((record) => record.get('node'))
  // obtain an array of all node ids
  const nodeIds = nodes.map((node) => node.identity)
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
  edges = edgeResult.records.map((record) => record.get('edge'))
  // custom GraphBuilder that assigns nodes different styles based on their labels
  graphBuilder = createGraphBuilder(graphComponent, nodes, edges)

  graphBuilder.buildGraph()

  // apply a layout to the new graph
  await doLayout()

  await showLoadingIndicator(false)
  setUIDisabled(false)
}

/**
 * This method will be called whenever the mouse moves over a different item. We show a highlight
 * indicator to make it easier for the user to understand the graph's structure.
 * @param hoveredItem The currently hovered item
 */
function onHoveredItemChanged(hoveredItem) {
  // we use the highlight manager of the GraphComponent to highlight related items
  const highlights = graphComponent.highlights

  // first remove previous highlights
  highlights.clear()
  // then see where we are hovering over, now
  if (!hoveredItem) {
    return
  }
  highlights.add(hoveredItem)
  if (hoveredItem instanceof INode) {
    // and if it's a node, we highlight all adjacent edges, too
    graphComponent.graph.edgesAt(hoveredItem).forEach((edge) => {
      highlights.add(edge)
    })
  } else if (hoveredItem instanceof IEdge) {
    // if it's an edge - we highlight the adjacent nodes
    highlights.add(hoveredItem.sourceNode)
    highlights.add(hoveredItem.targetNode)
  }
}

/**
 * Applies an organic layout to the current graph. Tries to highlight substructures in the process.
 */
async function doLayout() {
  setUIDisabled(true)
  const organicLayout = new OrganicLayout({
    chainSubstructureStyle: 'straight-line',
    chainSubstructureSize: 3,
    cycleSubstructureStyle: 'circular',
    starSubstructureStyle: 'radial',
    starSubstructureSize: 4,
    edgeLabelPlacement: 'generic',
    nodeLabelPlacement: 'consider'
  })

  const organicLayoutData = new OrganicLayoutData({
    edgeLabelPreferredPlacements: new EdgeLabelPreferredPlacement({
      angleReference: 'relative-to-edge-flow'
    }),
    preferredEdgeLengths: (edge) =>
      edge.labels.reduce((width, label) => {
        return Math.max(label.layout.width + 50, width)
      }, 150),
    nodeMargins: () => new Insets(30)
  })

  try {
    await new LayoutExecutor({
      graphComponent,
      layout: organicLayout,
      layoutData: organicLayoutData,
      animationDuration: '1s',
      animateViewport: true
    }).start()
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Disables the HTML elements of the UI.
 * @param value Whether the elements should be disabled.
 */
function setUIDisabled(value) {
  document.querySelector('#reloadDataButton').disabled = value
  numNodesInput.disabled = value
  numLabelsInput.disabled = value
}

/**
 * Wires up the UI.
 * @yjs:keep = setValue,getValue
 */
function initializeUI() {
  document.querySelector('#reloadDataButton').addEventListener('click', () => loadGraph())

  // toggle edge label display
  showEdgeLabelsCheckbox.addEventListener('input', () => {
    const graph = graphComponent.graph
    const style = showEdgeLabelsCheckbox.checked
      ? graph.edgeDefaults.labels.style
      : ILabelStyle.VOID_LABEL_STYLE
    for (const label of graph.edgeLabels) {
      graph.setStyle(label, style)
    }
  })

  const userEl = document.querySelector('#userInput')
  const hostEl = document.querySelector('#hostInput')
  const passwordEl = document.querySelector('#passwordInput')
  const databaseEl = document.querySelector('#databaseNameInput')

  document.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    let url = hostEl.value
    if (url.indexOf('://') < 0) {
      url = `neo4j://${url}`
    }
    const user = userEl.value
    const pass = passwordEl.value
    const database = databaseEl.value
    try {
      runCypherQuery = await connectToDB(url, database, user, pass)

      // hide the login form and show the graph component
      document.querySelector('#login-pane').hidden = true
      document.querySelector('#graph-pane').hidden = false
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
      document.querySelector('#numNodesLabel').textContent = numNodesInput.value.toString()
    },
    true
  )

  numLabelsInput.addEventListener(
    'input',
    () => {
      document.querySelector('#numLabelsLabel').textContent = numLabelsInput.value.toString()
    },
    true
  )

  // create cypher query editor

  editor = createCodemirrorEditor('cypher', document.querySelector('#queryEditorContainer'))
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: 'MATCH (n)-[e]-(m)\nRETURN * LIMIT 150'
    }
  })
  document.querySelector('#run-cypher-button').addEventListener('click', async () => {
    const query = editor.state.doc.toString()
    let result
    try {
      result = await runCypherQuery(query)
    } catch (e) {
      queryErrorContainer.textContent = `Query failed: ${e}`
      return
    }
    queryErrorContainer.textContent = ''
    // use maps to make sure that each id gets included only once
    const nodeMap = new Map()
    const relationshipMap = new Map()
    for (const record of result.records) {
      record.forEach((field) => {
        if (field instanceof Neo4jNode) {
          nodeMap.set(String(field.identity), field)
        } else if (field instanceof Neo4jEdge) {
          relationshipMap.set(String(field.identity), field)
        }
      })
    }
    nodes = Array.from(nodeMap.values())
    edges = Array.from(relationshipMap.values())

    graphComponent.graph.clear()
    graphBuilder = createGraphBuilder(graphComponent, nodes, edges)
    graphBuilder.buildGraph()
    // apply a layout to the new graph
    await doLayout()
  })
}

run().then(finishLoading)
