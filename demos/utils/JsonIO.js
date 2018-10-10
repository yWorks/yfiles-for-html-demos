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

/* eslint-disable global-require */

/**
 * Converts an IGraph into corresponding JSON data and vice versa.
 *
 * This file can be used in browsers as well as in NodeJS servers.
 * The following header detects these environments and uses either amd-define or CommonJS-style module.exports
 * depending on the environment.
 */
;(f => {
  if (typeof define === 'function' && define.amd) {
    define(['yfiles/view-component'], f)
  } else if (
    typeof exports === 'object' &&
    typeof module !== 'undefined' &&
    typeof module.exports === 'object'
  ) {
    module.exports = f(require('../../lib/umd/yfiles/view-component'))
  }
})(
  // Prevent obfuscation of the property names of the JSON data that represent the graph.
  // @yjs:keep=nodeList,edgeList,graphBounds,edgeData,nodeData
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
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

    /**
     * Reads an IGraph from a JSON object.
     */
    class JSONReader {
      constructor() {
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
         * @param {yfiles.graph.INode} node The created node.
         * @param {JSONNode} nodeData The JSON data of the created node.
         * @param {yfiles.graph.IGraph} graph The graph.
         */
        this.nodeCreated = (node, nodeData, graph) => {}
        /**
         * This function is called after an edge was created.
         * @param {yfiles.graph.IEdge} edge The created node.
         * @param {JSONEdge} edgeData The JSON data of the created node.
         * @param {yfiles.graph.IGraph} graph The graph.
         */
        this.edgeCreated = (edge, edgeData, graph) => {}
        /**
         * This function is called after a label was created.
         * @param {yfiles.graph.ILabel} label The created label.
         * @param {JSONLabel} labelData The JSON data of the created node.
         * @param {yfiles.graph.IGraph} graph The graph.
         */
        this.labelCreated = (label, labelData, graph) => {}
      }

      /**
       * Reads a graph from JSON data.
       *
       * @param {yfiles.graph.IGraph} graph The graph that gets the new graph items.
       * @param {JSONGraph} jsonGraph The JSON representation of the graph.
       */
      read(graph, jsonGraph) {
        graph.clear()

        graph.nodeDefaults.labels.layoutParameter = new yfiles.graph.FreeNodeLabelModel().createDefaultParameter()
        graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.FreeEdgeLabelModel().createDefaultParameter()

        const nodeIdMap = new Map()

        for (const nodeData of jsonGraph.nodeList) {
          const node = this.createNode(graph, nodeData)
          nodeIdMap.set(this.nodeIdProvider(nodeData), {
            node,
            nodeData
          })
        }

        if (typeof this.nodeParentProvider === 'function') {
          // Set the parents. This is a done after all nodes have been created otherwise a parent node
          // might not exist when needed
          for (const value of nodeIdMap.values()) {
            const node = value.node
            const nodeData = value.nodeData
            const parentId = this.nodeParentProvider(nodeData)
            const parent = nodeIdMap.get(parentId)
            if (parent != null) {
              graph.setParent(node, parent.node)
            }
            this.nodeCreated(node, nodeData, graph)
          }
        }

        for (const edgeData of jsonGraph.edgeList) {
          this.createEdge(graph, edgeData, nodeIdMap)
        }
      }

      /**
       * Creates an edge from the information of the JSON edge data.
       *
       * @param {yfiles.graph.IGraph} graph
       * @param {JSONEdge} edgeData
       * @param {Map} nodeIdMap
       * @returns {yfiles.graph.IEdge}
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
          graph.addBend(edge, new yfiles.geometry.Point(bendData.x, bendData.y))
        }

        JSONReader.resolveProvider(this.edgeSourcePortLocationProvider, edgeData, location => {
          graph.setPortLocation(edge.sourcePort, new yfiles.geometry.Point(location.x, location.y))
        })

        JSONReader.resolveProvider(this.edgeTargetPortLocationProvider, edgeData, location => {
          graph.setPortLocation(edge.targetPort, new yfiles.geometry.Point(location.x, location.y))
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
       * @param {yfiles.graph.IGraph} graph
       * @param {JSONNode} nodeData
       * @returns {yfiles.graph.INode}
       *
       * @private
       */
      createNode(graph, nodeData) {
        const layout =
          JSONReader.resolveProvider(
            this.nodeLayoutProvider,
            nodeData,
            layout =>
              new yfiles.geometry.Rect(
                layout.x,
                layout.y,
                layout.width || layout.w,
                layout.height || layout.h
              )
          ) ||
          new yfiles.geometry.Rect(
            0,
            0,
            graph.nodeDefaults.size.width,
            graph.nodeDefaults.size.height
          )

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

        if (this.nodeParentProvider == null) {
          // Otherwise, we call nodeCreated later after we have set the parent
          this.nodeCreated(node, nodeData, graph)
        }

        return node
      }

      /**
       * Creates a label for the given label owner based on the given data.
       *
       * The label layout parameter is created from the label geometry with the ILabelModelParameterFinder of the label
       * model.
       *
       * @param {yfiles.graph.IGraph} graph
       * @param {JSONLabel} labelData
       * @param {yfiles.graph.ILabelOwner} owner
       *
       * @private
       */
      createLabel(graph, labelData, owner) {
        const layout = labelData.layout
        const label = layout
          ? graph.addLabel({
              owner: owner,
              text: labelData.text,
              preferredSize: new yfiles.geometry.Size(layout.width, layout.height)
            })
          : graph.addLabel(owner, labelData.text)

        if (layout) {
          const model = label.layoutParameter.model
          const parameterFinder = model.lookup(yfiles.graph.ILabelModelParameterFinder.$class)
          if (parameterFinder !== null) {
            const parameter = parameterFinder.findBestParameter(
              label,
              model,
              new yfiles.geometry.OrientedRectangle(layout)
            )
            graph.setLabelLayoutParameter(label, parameter)
          }
        }

        this.labelCreated(label, labelData, graph)
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
    class JSONWriter {
      constructor() {
        /* @yjs:keep=id,sourcePort,targetPort,bends */

        /**
         * An optional function that returns the ID of the given node data.
         *
         * If no ID provider is specified, this class creates its own IDs.
         *
         * @type {function(yfiles.graph.INode):(string|number)}
         */
        this.nodeIdProvider = null

        /**
         * An optional function that adds the node layout information to the node data.
         * @type {function(JSONNode, yfiles.graph.INode, yfiles.graph.IGraph)}
         */
        this.nodeLayoutWriter = (data, node, graph) => {
          const layout = node.layout
          data.layout = {
            x: layout.x,
            y: layout.y,
            width: layout.width,
            height: layout.height
          }
        }

        /**
         * An optional function that adds the node label information to the node data.
         * @type {function(JSONNode, yfiles.graph.INode, yfiles.graph.IGraph)}
         */
        this.nodeLabelWriter = (data, node, graph) => {
          this.createLabelData(data, node, graph)
        }

        /**
         * An optional function that adds the node tag information to the node data.
         * @type {function(JSONNode, yfiles.graph.INode, yfiles.graph.IGraph)}
         */
        this.nodeTagWriter = (data, node, graph) => {
          data.tag = node.tag
        }

        /**
         * An optional function that adds the edge port locations to the edge data.
         * @type {function(JSONEdge, yfiles.graph.IEdge, yfiles.graph.IGraph)}
         */
        this.edgePortLocationWriter = (data, edge, graph) => {
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
         * @type {function(JSONEdge, yfiles.graph.IEdge, yfiles.graph.IGraph)}
         */
        this.edgeBendsWriter = (data, edge, graph) => {
          this.createBendData(data, edge, graph)
        }

        /**
         * An optional function that adds the edge label information to the edge data.
         * @type {function(JSONEdge, yfiles.graph.IEdge, yfiles.graph.IGraph)}
         */
        this.edgeLabelsWriter = (data, edge, graph) => {
          this.createLabelData(data, edge, graph)
        }

        /**
         * An optional function that adds the edge tag information to the edge data.
         * @type {function(JSONEdge, yfiles.graph.IEdge, yfiles.graph.IGraph)}
         */
        this.edgeTagWriter = (data, edge, graph) => {
          data.tag = edge.tag
        }

        /**
         * This function is called after a node data was created.
         * @param {JSONNode} nodeData The JSON data of the created node.
         * @param {yfiles.graph.INode} node The created node.
         * @param {yfiles.graph.IGraph} graph The graph.
         */
        this.nodeDataCreated = (nodeData, node, graph) => {}
        /**
         * This function is called after an edge data was created.
         * @param {JSONEdge} edgeData The JSON data of the created node.
         * @param {yfiles.graph.IEdge} edge The created node.
         * @param {yfiles.graph.IGraph} graph The graph.
         */
        this.edgeDataCreated = (edgeData, edge, graph) => {}
      }

      /**
       * Returns a JSON object that describes the structure and layout information of the given graph.
       *
       * @param graph {yfiles.graph.IGraph} The graph.
       * @returns {JSONGraph} A JSON object that describes the structure and layout information of the given graph.
       */
      write(graph) {
        const oldNodeIdProvider = this.nodeIdProvider
        if (typeof this.nodeIdProvider !== 'function') {
          const nodeToIdMap = new yfiles.collections.Map()
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
          (bounds, node) => yfiles.geometry.Rect.add(bounds, node.layout.toRect()),
          yfiles.geometry.Rect.EMPTY
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

        graph.nodes.forEach(node => {
          const nodeData = this.createNodeData(node, graph)
          graphData.nodeList.push(nodeData)
        })

        graph.edges.forEach(edge => {
          const edgeData = this.createEdgeData(edge, graph)
          graphData.edgeList.push(edgeData)
        })

        // Restore the old node ID provider
        this.nodeIdProvider = oldNodeIdProvider

        return graphData
      }

      /**
       *
       * @param {yfiles.graph.INode} node
       * @param {yfiles.graph.IGraph} graph
       * @return {JSONNode}
       *
       * @private
       */
      createNodeData(node, graph) {
        /** @type {JSONNode} */
        const nodeData = {
          id: this.nodeIdProvider(node)
        }
        if (graph.isGroupNode(node)) {
          nodeData.isGroup = true
        }
        if (graph.getParent(node) != null) {
          nodeData.parent = this.nodeIdProvider(graph.getParent(node))
        }

        ;[this.nodeLayoutWriter, this.nodeLabelWriter, this.nodeTagWriter].forEach(func => {
          if (typeof func === 'function') {
            func(nodeData, node, graph)
          }
        })

        this.nodeDataCreated(nodeData, node, graph)

        return nodeData
      }

      /**
       *
       * @param {yfiles.graph.IEdge} edge
       * @param {yfiles.graph.IGraph} graph
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
       * @param {yfiles.graph.ILabelOwner} owner
       * @param {yfiles.graph.IGraph} graph
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
            }
          })
        })
      }

      /**
       * Serializes the location of edge bends.
       *
       * @param {JSONEdge} edgeData
       * @param {yfiles.graph.IEdge} edge
       * @param {yfiles.graph.IGraph} graph
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
    }

    return {
      JSONReader,
      JSONWriter
    }
  }
)
