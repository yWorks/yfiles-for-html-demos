/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  Exception,
  Fill,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  HashMap,
  IEdge,
  IGraph,
  ILabel,
  ILabelModelParameterFinder,
  ILabelOwner,
  INode,
  Insets,
  InteriorStretchLabelModel,
  NodeStyleStripeStyleAdapter,
  OrientedRectangle,
  Point,
  Rect,
  ShapeNodeStyle,
  Size,
  TableNodeStyle,
  yfiles
} from 'yfiles'

// Prevent obfuscation of the property names of the JSON data that represent the graph.
// @yjs:keep=nodeList,edgeList,graphBounds,edgeData,nodeData
/**
 * @typedef {object} JSONGraph
 * @property {JSONRectangle} graphBounds
 * @property {JSONNode[]} nodeList
 * @property {JSONEdge[]} edgeList
 */

/**
 * @typedef {object} JSONLabelOwner
 * @property {JSONLabel[]|null} labels
 */

/**
 * @typedef {JSONLabelOwner} JSONNode
 * @property {string|number} id
 * @property {string|number} parent
 * @property {boolean|null} isGroup
 * @property {JSONRectangle|null} layout
 * @property {object} tag
 */

/**
 * @typedef {JSONLabelOwner} JSONEdge
 * @property {string|number} source - the source node id
 * @property {string|number} target - the target node id
 * @property {JSONPoint|null} sourcePort
 * @property {JSONPoint|null} targetPort
 * @property {JSONPoint[]|null} bends
 * @property {object} tag
 */

/**
 * @typedef {object} JSONLabel
 * @property {string} text
 * @property {JSONOrientedRectangle|null} layout
 * @property {'default'|'interior-stretch-north'|'interior-stretch-south'|'interior-stretch-east'|'interior-stretch-west'|'interior-stretch-center'} layoutParameter
 */

/**
 * @typedef {object} JSONOrientedRectangle
 * @property {number} anchorX
 * @property {number} anchorY
 * @property {number} upX
 * @property {number} upY
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} JSONRectangle
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} JSONInsets
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */

/**
 * @typedef {object} JSONPoint
 * @property {number} x
 * @property {number} y
 */

let ITable = null
let Table = null

/**
 * Reads an IGraph from a JSON object.
 */
export class JSONReader {
  constructor() {
    Table = yfiles.graph.Table
    ITable = yfiles.graph.ITable
    /**
     * A required function that returns the ID of the given node data.
     * @type {function(JSONNode):(string|number)}
     */
    this.nodeIdProvider = d => d.id
    /**
     * An optional function that returns an array of label data of the given node data.
     * @type {function(JSONNode):(array|null)}
     */
    this.nodeLabelsProvider = d => d.labels
    /**
     * An optional function that returns the layout of the given node data.
     * @type {function(JSONNode):JSONRectangle}
     */
    this.nodeLayoutProvider = d => d.layout
    /**
     * An optional function that returns whether the given node data is for a group node.
     * @type {function(JSONNode):boolean}
     */
    this.nodeIsGroupProvider = d => !!d.isGroup
    /**
     * An optional function that returns the node ID of the parent of the given node data.
     * @type {function(JSONNode):(string|number)}
     */
    this.nodeParentProvider = d => d.parent
    /**
     * An optional function that returns the tag of the given node data.
     * @type {function(JSONNode):object}
     */
    this.nodeTagProvider = d => d.tag || d

    /**
     * An optional function that returns the ID of the given column data.
     * @type {function(JSONNode):(string|number|null)}
     */
    this.nodeColumnProvider = d => d.column

    /**
     * An optional function that returns the ID of the given row data.
     * @type {function(JSONNode):(string|number| null)}
     */
    this.nodeRowProvider = d => d.row

    /**
     * An optional function that returns the ID of the given stripe data.
     * @type {function(JSONNode):(string|number)}
     */
    this.stripeIdProvider = d => d.id
    /**
     * An optional function that returns an array of label data of the given node data.
     * @type {function(JSONNode):(array|null)}
     */
    this.stripeLabelProvider = d => d.labels
    /**
     * An optional function that returns the tag of the given node data.
     * @type {function(JSONNode):object}
     */
    this.stripeTagProvider = d => d.tag || d

    /**
     * A required function that returns the node ID of the source of the given edge data.
     * @type {function(JSONEdge):(string|number)}
     */
    this.edgeSourceProvider = d => d.source
    /**
     * A required function that returns the node ID of the target of the given edge data.
     * @type {function(JSONEdge):(string|number)}
     */
    this.edgeTargetProvider = d => d.target
    /**
     * An optional function that returns the location of the source port of the given node data.
     * @type {function(JSONEdge):JSONPoint}
     */
    this.edgeSourcePortLocationProvider = d => d.sourcePort
    /**
     * An optional function that returns the location of the target port of the given node data.
     * @type {function(JSONEdge):JSONPoint}
     */
    this.edgeTargetPortLocationProvider = d => d.targetPort
    /**
     * An optional function that returns an array of label data of the given edge data.
     * @type {function(JSONEdge):(array|null)}
     */
    this.edgeLabelsProvider = d => d.labels
    /**
     * An optional function that returns an array of bend locations of the given edge data.
     * @type {function(JSONEdge):[JSONPoint]}
     */
    this.edgeBendsProvider = d => d.bends
    /**
     * An optional function that returns the tag of the given edge data.
     * @type {function(JSONEdge):object}
     */
    this.edgeTagProvider = d => d.tag || d

    /**
     * This function is called after a node was created.
     * @param {INode} node The created node.
     * @param {JSONNode} nodeData The JSON data of the created node.
     * @param {IGraph} graph The graph.
     */
    this.nodeCreated = (node, nodeData, graph) => {}
    /**
     * This function is called after an edge was created.
     * @param {IEdge} edge The created node.
     * @param {JSONEdge} edgeData The JSON data of the created node.
     * @param {IGraph} graph The graph.
     */
    this.edgeCreated = (edge, edgeData, graph) => {}
    /**
     * This function is called after a label was created in a graph.
     * @param {ILabel} label The created label.
     * @param {JSONLabel} labelData The JSON data of the created node.
     * @param {IGraph} graph The graph.
     */
    this.labelCreated = (label, labelData, graph) => {}

    /**
     * This function is called after a label was created in a table.
     * @param {ILabel} label The created label.
     * @param {JSONLabel} labelData The JSON data of the created node.
     * @param {Table} table The table.
     */
    this.labelCreatedTable = (label, labelData, table) => {}
  }

  /**
   * Reads a graph from JSON data.
   *
   * @param {IGraph} graph The graph that gets the new graph items.
   * @param {JSONGraph} jsonGraph The JSON representation of the graph.
   */
  read(graph, jsonGraph) {
    graph.clear()

    graph.nodeDefaults.labels.layoutParameter = new FreeNodeLabelModel().createDefaultParameter()
    graph.edgeDefaults.labels.layoutParameter = new FreeEdgeLabelModel().createDefaultParameter()

    const nodeIdMap = new HashMap()
    const rowIdMap = new HashMap()
    const columnIdMap = new HashMap()
    let tableGroupNode = null
    let table = null

    if (jsonGraph.rowList || jsonGraph.columnList) {
      table = this.createTable()

      if (!Array.isArray(jsonGraph.rowList) || jsonGraph.rowList.length === 0) {
        // Create the single container row.
        table.createRow()
      }
      if (!Array.isArray(jsonGraph.columnList) || jsonGraph.columnList.length === 0) {
        // Create the single container column.
        table.createColumn()
      }

      for (const stripeData of jsonGraph.columnList) {
        const stripe = this.createStripe(table, stripeData, true)
        columnIdMap.set(this.stripeIdProvider(stripeData), stripe)
      }

      for (const stripeData of jsonGraph.rowList) {
        const stripe = this.createStripe(table, stripeData, false)
        rowIdMap.set(this.stripeIdProvider(stripeData), stripe)
      }

      // Create a top-level group node and bind, via the TableNodeStyle, the table to it.
      const tableStyle = new TableNodeStyle(table)
      tableGroupNode = graph.createGroupNode(null, table.layout.toRect(), tableStyle)
    }

    for (const nodeData of jsonGraph.nodeList) {
      const node = this.createNode(graph, nodeData, table, tableGroupNode, rowIdMap, columnIdMap)
      nodeIdMap.set(this.nodeIdProvider(nodeData), {
        node,
        nodeData
      })
    }

    if (typeof this.nodeParentProvider === 'function') {
      // Set the parents. This is done after all nodes have been created otherwise a parent node
      // might not exist when needed
      for (const value of nodeIdMap.values) {
        const node = value.node
        const nodeData = value.nodeData
        const parentId = this.nodeParentProvider(nodeData)
        if (parentId) {
          const parent = nodeIdMap.get(parentId)
          if (parent != null) {
            graph.setParent(node, parent.node)
          }
        }
        this.nodeCreated(node, nodeData, graph)
      }
    }

    for (const edgeData of jsonGraph.edgeList) {
      this.createEdge(graph, edgeData, nodeIdMap)
    }
  }

  /**
   * Creates and styles a table.
   * @returns {Table}
   *
   * @private
   */
  createTable() {
    const table = new Table()

    table.rowDefaults.insets = new Insets(0, 10, 0, 0)
    table.rowDefaults.labels.style = new DefaultLabelStyle({
      backgroundFill: '#e0e0e0',
      backgroundStroke: 'black',
      verticalTextAlignment: 'center',
      horizontalTextAlignment: 'center',
      textSize: 16,
      insets: [3, 5, 3, 5]
    })
    table.rowDefaults.style = new NodeStyleStripeStyleAdapter(
      new ShapeNodeStyle({
        fill: Fill.TRANSPARENT,
        stroke: 'black',
        shape: 'rectangle'
      })
    )
    table.columnDefaults.insets = new Insets(10, 30, 10, 0)
    table.columnDefaults.labels.style = new DefaultLabelStyle({
      backgroundFill: '#e0e0e0',
      backgroundStroke: 'black',
      verticalTextAlignment: 'center',
      horizontalTextAlignment: 'center',
      textSize: 16,
      insets: [3, 5, 3, 5]
    })
    table.columnDefaults.style = new NodeStyleStripeStyleAdapter(
      new ShapeNodeStyle({
        fill: '#c4d7ed',
        stroke: 'black',
        shape: 'rectangle'
      })
    )
    return table
  }

  /**
   * Creates an edge from the information of the JSON edge data.
   *
   * @param {IGraph} graph
   * @param {JSONEdge} edgeData
   * @param {Map} nodeIdMap
   * @returns {IEdge}
   *
   * @private
   */
  createEdge(graph, edgeData, nodeIdMap) {
    const source = nodeIdMap.get(this.edgeSourceProvider(edgeData))
    const target = nodeIdMap.get(this.edgeTargetProvider(edgeData))
    const edge = graph.createEdge(source.node, target.node)

    JSONReader.resolveProvider(this.edgeTagProvider, edgeData, tag => {
      edge.tag = tag
    })

    for (const bendData of JSONReader.resolveProvider(this.edgeBendsProvider, edgeData) || []) {
      graph.addBend(edge, Point.from(bendData))
    }

    JSONReader.resolveProvider(this.edgeSourcePortLocationProvider, edgeData, location => {
      graph.setPortLocation(edge.sourcePort, Point.from(location))
    })

    JSONReader.resolveProvider(this.edgeTargetPortLocationProvider, edgeData, location => {
      graph.setPortLocation(edge.targetPort, Point.from(location))
    })

    for (const data of JSONReader.resolveProvider(this.edgeLabelsProvider, edgeData) || []) {
      this.createLabel(graph, data, edge)
    }

    this.edgeCreated(edge, edgeData, graph)

    return edge
  }

  /**
   * Creates a node from the information of the JSON node data.
   *
   * @param {IGraph} graph
   * @param {JSONNode} nodeData
   * @returns {INode}
   *
   * @private
   */
  createNode(graph, nodeData, table, tableGroupNode, rowIdMap, columnIdMap) {
    const layout =
      JSONReader.resolveProvider(
        this.nodeLayoutProvider,
        nodeData,
        layout => new Rect(layout.x, layout.y, layout.width || layout.w, layout.height || layout.h)
      ) || new Rect(0, 0, graph.nodeDefaults.size.width, graph.nodeDefaults.size.height)

    const isGroup = !!JSONReader.resolveProvider(this.nodeIsGroupProvider, nodeData)

    // The parent is set later to make sure that it was already created
    const node = isGroup ? graph.createGroupNode(null, layout) : graph.createNode(layout)

    JSONReader.resolveProvider(this.nodeTagProvider, nodeData, tag => {
      node.tag = tag
    })

    const labels = JSONReader.resolveProvider(this.nodeLabelsProvider, nodeData) || []
    labels.forEach(data => {
      this.createLabel(graph, data, node)
    })

    if (tableGroupNode != null && table != null) {
      const rowId = this.nodeRowProvider(nodeData)
      const row = rowIdMap.get(rowId) || table.rows.elementAt(0)
      const columnId = this.nodeColumnProvider(nodeData)
      const column = columnIdMap.get(columnId) || table.columns.elementAt(0)
      if (row != null && column != null) {
        ITable.placeNodeInCell(graph, node, tableGroupNode, column, row)
      }
    }

    if (this.nodeParentProvider == null) {
      // Otherwise, we call nodeCreated later after we have set the parent
      this.nodeCreated(node, nodeData, graph)
    }

    return node
  }

  /**
   * Creates a stripe from the information of the JSON stripe data.
   *
   * @param {ITable} table
   * @param {JSONStripe} stripeData
   * @param {boolean} isColumn
   * @returns {IStripe}
   *
   * @private
   */
  createStripe(table, stripeData, isColumn) {
    const stripe = isColumn ? table.createColumn() : table.createRow()

    JSONReader.resolveProvider(this.stripeTagProvider, stripeData, tag => {
      stripe.tag = tag
    })

    const labels = JSONReader.resolveProvider(this.stripeLabelProvider, stripeData) || []
    labels.forEach(data => {
      this.createStripeLabel(table, data, stripe)
    })
    return stripe
  }

  /**
   * Creates a label for the given label owner based on the given data to the given graph.
   *
   * The label layout parameter is created from the label geometry with the ILabelModelParameterFinder of the label
   * model. For interior stretch label models, the layout
   * parameter is retrieved from the label data to ensure the layout algorithm handles them correctly.
   *
   * @param {IGraph} graph
   * @param {JSONLabel} labelData
   * @param {ILabelOwner} owner
   *
   * @private
   */
  createLabel(graph, labelData, owner) {
    const layout = labelData.layout
    const label = layout
      ? graph.addLabel({
          owner: owner,
          text: labelData.text,
          preferredSize: Size.from(layout)
        })
      : graph.addLabel(owner, labelData.text)

    if (layout) {
      switch (labelData.layoutParameter) {
        case 'interior-stretch-center':
          graph.setLabelLayoutParameter(label, InteriorStretchLabelModel.CENTER)
          break
        case 'interior-stretch-north':
          graph.setLabelLayoutParameter(label, InteriorStretchLabelModel.NORTH)
          break
        case 'interior-stretch-south':
          graph.setLabelLayoutParameter(label, InteriorStretchLabelModel.SOUTH)
          break
        case 'interior-stretch-east':
          graph.setLabelLayoutParameter(label, InteriorStretchLabelModel.EAST)
          break
        case 'interior-stretch-west':
          graph.setLabelLayoutParameter(label, InteriorStretchLabelModel.WEST)
          break
        default: {
          const model = label.layoutParameter.model
          const parameterFinder = model.lookup(ILabelModelParameterFinder.$class)
          if (parameterFinder !== null) {
            const parameter = parameterFinder.findBestParameter(
              label,
              model,
              new OrientedRectangle(layout)
            )
            graph.setLabelLayoutParameter(label, parameter)
          }
        }
      }
    }

    this.labelCreated(label, labelData, graph)
  }

  /**
   * Creates a label for the given label owner based on the given data to the given table.
   *
   * The label layout parameter is created from the label geometry with the ILabelModelParameterFinder of the label
   * model.
   *
   * @param {Table} table
   * @param {JSONLabel} labelData
   * @param {ILabelOwner} owner
   *
   * @private
   */
  createStripeLabel(table, labelData, owner) {
    const layout = labelData.layout
    const label = layout
      ? table.addLabel({
          owner: owner,
          text: labelData.text,
          preferredSize: Size.from(layout)
        })
      : table.addLabel(owner, labelData.text)

    if (layout) {
      const model = label.layoutParameter.model
      const parameterFinder = model.lookup(ILabelModelParameterFinder.$class)
      if (parameterFinder !== null) {
        const parameter = parameterFinder.findBestParameter(
          label,
          model,
          new OrientedRectangle(layout)
        )
        table.setLabelLayoutParameter(label, parameter)
      }
    }

    this.labelCreatedTable(label, labelData, table)
  }

  /**
   * Resolves the given provider with the given data, then calls the provided function if present.
   *
   * @param {function|null} provider
   * @param data
   * @param {function?} then
   * @return {object|null}
   *
   * @private
   */
  static resolveProvider(provider, data, then) {
    if (typeof provider !== 'function') {
      return null
    }
    const value = provider(data)
    if (value == null) {
      return null
    }
    return then != null ? then(value) : value
  }
}

/**
 * Creates a JSON object of an IGraph.
 */
export class JSONWriter {
  constructor() {
    /* @yjs:keep=id,sourcePort,targetPort,bends */

    Table = yfiles.graph.Table
    ITable = yfiles.graph.ITable

    /**
     * An optional function that returns the ID of the given node data.
     *
     * If no ID provider is specified, this class creates its own IDs.
     *
     * @type {function(INode):(string|number)}
     */
    this.nodeIdProvider = null

    /**
     * An optional function that adds the node layout information to the node data.
     * @type {function(JSONNode, INode, IGraph, Table, INode)}
     */
    this.nodeLayoutWriter = (data, node) => {
      const layout = node.layout
      data.layout = {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height
      }
    }

    /**
     * An optional function that adds the row information to the node data.
     * @type {function(JSONNode, INode, IGraph, Table, INode)}
     */
    this.nodeRowWriter = (data, node, graph, table, tableNode) => {
      // skip the table node
      if (tableNode === null || node === tableNode) {
        return
      }

      const row = table.findRow(tableNode, node.layout.center)
      if (row) {
        data.row = table.findRow(tableNode, node.layout.center).index
      }
    }

    /**
     * An optional function that adds the column information to the node data.
     * @type {function(JSONNode, INode, IGraph, Table, INode)}
     */
    this.nodeColumnWriter = (data, node, graph, table, tableNode) => {
      // skip the table node
      if (tableNode === null || node === tableNode) {
        return
      }

      const column = table.findColumn(tableNode, node.layout.center)
      if (column) {
        data.column = table.findColumn(tableNode, node.layout.center).index
      }
    }

    /**
     * An optional function that adds the node label information to the node data.
     * @type {function(JSONNode, INode, IGraph, Table, INode)}
     */
    this.nodeLabelWriter = (data, node, graph) => {
      this.createLabelData(data, node, graph)
    }

    /**
     * An optional function that adds the node tag information to the node data.
     * @type {function(JSONNode, INode, IGraph, Table, INode)}
     */
    this.nodeTagWriter = (data, node) => {
      data.tag = node.tag
    }

    /**
     * An optional function that adds the edge port locations to the edge data.
     * @type {function(JSONEdge, IEdge, IGraph)}
     */
    this.edgePortLocationWriter = (data, edge) => {
      const spLocation = edge.sourcePort.location
      data.sourcePort = {
        x: spLocation.x,
        y: spLocation.y
      }
      const tpLocation = edge.targetPort.location
      data.targetPort = {
        x: tpLocation.x,
        y: tpLocation.y
      }
    }

    /**
     * An optional function that adds the edge bend locations to the edge data.
     * @type {function(JSONEdge, IEdge, IGraph)}
     */
    this.edgeBendsWriter = (data, edge, graph) => {
      this.createBendData(data, edge, graph)
    }

    /**
     * An optional function that adds the edge label information to the edge data.
     * @type {function(JSONEdge, IEdge, IGraph)}
     */
    this.edgeLabelsWriter = (data, edge, graph) => {
      this.createLabelData(data, edge, graph)
    }

    /**
     * An optional function that adds the edge tag information to the edge data.
     * @type {function(JSONEdge, IEdge, IGraph)}
     */
    this.edgeTagWriter = (data, edge) => {
      data.tag = edge.tag
    }

    /**
     * This function is called after a node data was created.
     * @param {JSONNode} nodeData The JSON data of the created node.
     * @param {INode} node The created node.
     * @param {IGraph} graph The graph.
     */
    this.nodeDataCreated = (nodeData, node, graph) => {}
    /**
     * This function is called after an edge data was created.
     * @param {JSONEdge} edgeData The JSON data of the created node.
     * @param {IEdge} edge The created node.
     * @param {IGraph} graph The graph.
     */
    this.edgeDataCreated = (edgeData, edge, graph) => {}
  }

  /**
   * Returns a JSON object that describes the structure and layout information of the given graph.
   *
   * @param graph {IGraph} The graph.
   * @returns {JSONGraph} A JSON object that describes the structure and layout information of the given graph.
   */
  write(graph) {
    const oldNodeIdProvider = this.nodeIdProvider
    if (typeof this.nodeIdProvider !== 'function') {
      const nodeToIdMap = new Map()
      this.nodeIdProvider = node => {
        if (nodeToIdMap.has(node)) {
          return nodeToIdMap.get(node)
        }
        const id = nodeToIdMap.size
        nodeToIdMap.set(node, id)
        return id
      }
    }

    // Calculate the graph bounds
    const bounds = graph.nodes.reduce(
      (bounds, node) => Rect.add(bounds, node.layout.toRect()),
      Rect.EMPTY
    )

    // Create the data for an empty graph
    const graphData = {
      nodeList: [],
      edgeList: [],
      graphBounds: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      }
    }
    // find the table, we assume there is only one
    const tableNode = ITable ? graph.nodes.find(node => !!node.lookup(ITable.$class)) : null
    const table = tableNode ? tableNode.lookup(ITable.$class) : null
    if (table !== null) {
      // if the table contains nested columns/rows, throw an exception
      table.rows.forEach(row => {
        if (row.childStripes.size > 0) {
          throw new Exception(
            'Writing to JSON operation is not supported for tables with nested columns/rows'
          )
        }
      })
      table.columns.forEach(column => {
        if (column.childStripes.size > 0) {
          throw new Exception(
            'Writing to JSON operation is not supported for tables with nested columns/rows'
          )
        }
      })
    }

    // write the nodes
    graph.nodes.forEach(node => {
      if (!table || node.lookup(ITable.$class) == null) {
        const nodeData = this.createNodeData(node, graph, table, tableNode)
        graphData.nodeList.push(nodeData)
      }
    })
    // write the edges
    graph.edges.forEach(edge => {
      const edgeData = this.createEdgeData(edge, graph)
      graphData.edgeList.push(edgeData)
    })
    // write the table data, if any
    if (table !== null) {
      this.createTableData(table, graphData)
    }
    // Restore the old node ID provider
    this.nodeIdProvider = oldNodeIdProvider

    return graphData
  }

  /**
   * Serializes the data of the given node.
   * @param {INode} node
   * @param {IGraph} graph
   * @param {Table} table
   * @param {INode} tableNode
   * @return {JSONNode}
   *
   * @private
   */
  createNodeData(node, graph, table, tableNode) {
    /** @type {JSONNode} */
    const nodeData = {
      id: this.nodeIdProvider(node)
    }
    if (graph.isGroupNode(node)) {
      nodeData.isGroup = true
    }
    if (graph.getParent(node) !== null && graph.getParent(node) !== tableNode) {
      nodeData.parent = this.nodeIdProvider(graph.getParent(node))
    }

    ;[
      this.nodeLayoutWriter,
      this.nodeLabelWriter,
      this.nodeTagWriter,
      this.nodeRowWriter,
      this.nodeColumnWriter
    ].forEach(func => {
      if (typeof func === 'function') {
        func(nodeData, node, graph, table, tableNode)
      }
    })

    this.nodeDataCreated(nodeData, node, graph, table, tableNode)

    return nodeData
  }

  /**
   * Serializes the data of the given edge.
   * @param {IEdge} edge
   * @param {IGraph} graph
   * @return {JSONEdge}
   *
   * @private
   */
  createEdgeData(edge, graph) {
    /* @yjs:keep=source,target */
    /** @type {JSONEdge} */
    const edgeData = {
      source: this.nodeIdProvider(edge.sourceNode),
      target: this.nodeIdProvider(edge.targetNode)
    }
    ;[
      this.edgePortLocationWriter,
      this.edgeBendsWriter,
      this.edgeLabelsWriter,
      this.edgeTagWriter
    ].forEach(func => {
      if (typeof func === 'function') {
        func(edgeData, edge, graph)
      }
    })

    this.edgeDataCreated(edgeData, edge, graph)

    return edgeData
  }

  /**
   * Serializes the layout and text of the given owner's labels.
   *
   * @param {JSONLabelOwner} ownerData
   * @param {ILabelOwner} owner
   * @param {IGraph} graph
   *
   * @private
   */
  createLabelData(ownerData, owner, graph) {
    if (owner.labels.size === 0) {
      return
    }
    ownerData.labels = []
    owner.labels.forEach(label => {
      const layout = label.layout
      ownerData.labels.push({
        text: label.text,
        layout: {
          anchorX: layout.anchorX,
          anchorY: layout.anchorY,
          upX: layout.upX,
          upY: layout.upY,
          width: layout.width,
          height: layout.height
        },
        layoutParameter: this.createLayoutParameter(label)
      })
    })
  }

  /**
   * Returns a string that identifies the label's layout parameter.
   * @param {ILabel} label
   * @return {'default'|'interior-stretch-north'|'interior-stretch-south'|'interior-stretch-east'|'interior-stretch-west'|'interior-stretch-center'}
   */
  createLayoutParameter(label) {
    if (label.layoutParameter.model instanceof InteriorStretchLabelModel) {
      switch (label.layoutParameter) {
        case InteriorStretchLabelModel.NORTH:
          return 'interior-stretch-north'
        case InteriorStretchLabelModel.SOUTH:
          return 'interior-stretch-south'
        case InteriorStretchLabelModel.EAST:
          return 'interior-stretch-east'
        case InteriorStretchLabelModel.WEST:
          return 'interior-stretch-west'
        case InteriorStretchLabelModel.CENTER:
          return 'interior-stretch-center'
      }
    }
    return 'default'
  }

  /**
   * Serializes the location of edge bends.
   *
   * @param {JSONEdge} edgeData
   * @param {IEdge} edge
   * @param {IGraph} graph
   *
   * @private
   */
  createBendData(edgeData, edge, graph) {
    if (edge.bends.size === 0) {
      return
    }
    edgeData.bends = []
    edge.bends.forEach(bend => {
      edgeData.bends.push({
        x: bend.location.x,
        y: bend.location.y
      })
    })
  }

  /**
   * Serializes the rows, columns and their labels of the given table.
   * @param {Table} table
   * @param {Object} graphData
   *
   * @private
   */
  createTableData(table, graphData) {
    graphData.rowList = []
    graphData.columnList = []
    table.rows.forEach(row => {
      const jsonRow = {
        id: row.index,
        labels: []
      }
      if (row.labels.size > 0) {
        row.labels.forEach(label => {
          const { anchorX, anchorY, upX, upY, width, height } = label.layout
          const jsonLabel = {
            text: label.text,
            layout: {
              anchorX,
              anchorY,
              upX,
              upY,
              width,
              height
            }
          }
          jsonRow.labels.push(jsonLabel)
        })
      }
      graphData.rowList.push(jsonRow)
    })

    table.columns.forEach(column => {
      const jsonColumn = {
        id: column.index,
        labels: []
      }
      if (column.labels.size > 0) {
        column.labels.forEach(label => {
          const { anchorX, anchorY, upX, upY, width, height } = label.layout
          const jsonLabel = {
            text: label.text,
            layout: {
              anchorX,
              anchorY,
              upX,
              upY,
              width,
              height
            }
          }
          jsonColumn.labels.push(jsonLabel)
        })
      }
      graphData.columnList.push(jsonColumn)
    })
  }
}
