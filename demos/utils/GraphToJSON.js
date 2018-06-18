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
 * Converts an IGraph into a corresponding JSON object and vice versa.
 *
 * This file is loaded into the browser as well as into the NodeJS server.
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
  // Prevent obfuscation of the property names of the JSON object that represent the graph.
  // @yjs:keep=nodeList,edgeList,graphBounds,edgeObj,nodeObj,isGrouped
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
    /**
     * @typedef {object} JSONGraph
     * @property {boolean} isGrouped
     * @property {JSONLayout} graphBounds
     * @property {JSONNode[]} nodeList
     * @property {JSONEdge[]} edgeList
     */

    /**
     * @typedef {object} JSONLabelOwner
     * @property {Array.<JSONLabel>} labels
     */

    /**
     * @typedef {JSONLabelOwner} JSONNode
     * @property {boolean} isLeaf
     * @property {string} id
     * @property {JSONLayout} layout
     * @property {JSONInsets} insets
     */

    /**
     * @typedef {JSONLabelOwner} JSONEdge
     * @property {string} id
     * @property {string} source - the source node id
     * @property {string} target - the target node id
     * @property {JSONPoint} sourcePort
     * @property {JSONPoint} targetPort
     * @property {JSONPoint[]} bends
     */

    /**
     * @typedef {object} JSONLabel
     * @property {string} text
     * @property {number} anchorX
     * @property {number} anchorY
     * @property {number} upX
     * @property {number} upY
     * @property {number} width
     * @property {number} height
     */

    /**
     * @typedef {object} JSONLayout
     * @property {number} x
     * @property {number} y
     * @property {number} w
     * @property {number} h
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

    class MyInsetsProvider extends yfiles.lang.Class(yfiles.input.INodeInsetsProvider) {
      /**
       * Creates a new instance that uses the insets of the given mapper.
       * @param {yfiles.collections.IMapper} insetsMapper
       */
      constructor(insetsMapper) {
        super()
        this.insetsMapper = insetsMapper
      }

      /**
       * Returns the insets for the given item.
       * @param {T} item
       * @returns {yfiles.geometry.Insets}
       */
      getInsets(item) {
        return this.insetsMapper.get(item)
      }
    }

    class GraphToJSON {
      /**
       * Returns a JSON object that describes the structure and layout information of the given graph.
       *
       * @param graph {yfiles.graph.IGraph} The graph.
       * @returns {JSONGraph} a JSON object that describes the structure and layout information of the given graph.
       */
      static write(graph) {
        const exportGraph = createEmptyData()
        exportGraph.isGrouped = true

        if (exportGraph.isGrouped) {
          writeGroupedGraphNodes(exportGraph, graph)
        } else {
          writeNodes(exportGraph, graph)
        }

        writeEdges(exportGraph.edgeList, graph)

        // get graph bounds.
        let bounds = yfiles.geometry.Rect.EMPTY
        graph.nodes.forEach(node => {
          bounds = yfiles.geometry.Rect.add(bounds, node.layout.toRect())
        })

        exportGraph.graphBounds = {
          x: bounds.x,
          y: bounds.y,
          w: bounds.width,
          h: bounds.height
        }

        return exportGraph
      }

      /**
       * Creates a yfiles.graph.IGraph from JSON data.
       *
       * @param {JSONGraph} jsonGraph the JSON representation of the graph
       * @returns {yfiles.graph.IGraph}
       */
      static read(jsonGraph) {
        const graph = new yfiles.graph.DefaultGraph()

        graph.nodeDefaults.labels.layoutParameter = new yfiles.graph.FreeNodeLabelModel().createDefaultParameter()
        graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.FreeEdgeLabelModel().createDefaultParameter()

        const insetsMapper = new yfiles.collections.Mapper()
        insetsMapper.defaultValue = new yfiles.geometry.Insets(0)

        const insetsDecorator = graph.decorator.nodeDecorator.insetsProviderDecorator
        const insetsProvider = new MyInsetsProvider(insetsMapper)
        insetsDecorator.setImplementation(insetsProvider)

        if (jsonGraph.isGrouped) {
          jsonGraph.nodeList.forEach(nodeObj => {
            readNode(null, nodeObj, graph, insetsMapper)
          })
        } else {
          jsonGraph.nodeList.forEach(nodeObj => {
            createNode(graph, nodeObj, insetsMapper)
          })
        }

        jsonGraph.edgeList.forEach(edgeObj => {
          const source = findNode(graph, edgeObj.source)
          const target = findNode(graph, edgeObj.target)
          const bends = []
          edgeObj.bends.forEach(bendObj => {
            bends.push(new yfiles.geometry.Point(bendObj.x, bendObj.y))
          })
          const edge = graph.createEdge({
            source,
            target,
            bends
          })
          graph.setPortLocation(
            edge.sourcePort,
            new yfiles.geometry.Point(edgeObj.sourcePort.x, edgeObj.sourcePort.y)
          )
          graph.setPortLocation(
            edge.targetPort,
            new yfiles.geometry.Point(edgeObj.targetPort.x, edgeObj.targetPort.y)
          )
          readLabels(edgeObj, graph, edge)
          edge.tag = edgeObj.id
        })
        return graph
      }
    }

    /**
     * Write the nodes of a flat (non-grouped) graph
     * @param {JSONGraph} exportGraph
     * @param {yfiles.graph.IGraph} graph
     */
    function writeNodes(exportGraph, graph) {
      graph.nodes.forEach(node => {
        exportGraph.nodeList.push(createNodeObj(node))
      })
    }

    /**
     * Write the nodes of a grouped graph
     * @param {JSONGraph} exportGraph
     * @param {yfiles.graph.IGraph} graph
     */
    function writeGroupedGraphNodes(exportGraph, graph) {
      graph.getChildren(null).forEach(node => {
        writeNode(exportGraph.nodeList, graph, node)
      })
    }

    /**
     * Write a node of a grouped graph
     * @param {JSONNode[]} nodeObjs
     * @param {yfiles.graph.IGraph} graph
     * @param {yfiles.graph.INode} node
     */
    function writeNode(nodeObjs, graph, node) {
      const nodeObj = createNodeObj(node)
      if (!graph.isGroupNode(node)) {
        nodeObj.isLeaf = true
      } else {
        nodeObj.isLeaf = false
        nodeObj.children = []
        const children = graph.getChildren(node)
        children.forEach(child => {
          writeNode(nodeObj.children, graph, child)
        })
      }
      nodeObjs.push(nodeObj)
    }

    /**
     * Reads a node form the JSON-object and creates a node in the graph.
     * @param {yfiles.graph.INode} parent
     * @param {JSONNode} nodeObj
     * @param {yfiles.graph.IGraph} graph
     * @param {yfiles.collections.Mapper<yfiles.graph.INode, yfiles.geometry.Insets>} insetsMapper
     */
    function readNode(parent, nodeObj, graph, insetsMapper) {
      const node = createNode(graph, nodeObj, insetsMapper)
      if (parent !== null) {
        graph.setParent(node, parent)
      }
      if (!nodeObj.isLeaf) {
        nodeObj.children.forEach(childNodeObj => {
          readNode(node, childNodeObj, graph, insetsMapper)
        })
      }
    }

    /**
     * Creates a node from the information of the JSON-object.
     * @param {yfiles.graph.IGraph} graph
     * @param {JSONNode} nodeObj
     * @param {yfiles.collections.Mapper<yfiles.graph.INode, yfiles.geometry.Insets>} insetsMapper
     * @returns {yfiles.graph.INode}
     */
    function createNode(graph, nodeObj, insetsMapper) {
      const layout = nodeObj.layout
      const insets = nodeObj.insets
      const node = graph.createNode(
        new yfiles.geometry.Rect(layout.x, layout.y, layout.w, layout.h)
      )
      if (insets) {
        insetsMapper.set(
          node,
          new yfiles.geometry.Insets(insets.left, insets.top, insets.right, insets.bottom)
        )
      }
      readLabels(nodeObj, graph, node)
      node.tag = nodeObj.id
      return node
    }

    /**
     * Deserialize the owner's labels using an ILabelModelParameterFinder
     *
     * @param {JSONLabelOwner} ownerObj
     * @param {yfiles.graph.IGraph} graph
     * @param {yfiles.graph.ILabelOwner} owner
     */
    function readLabels(ownerObj, graph, owner) {
      ownerObj.labels.forEach(labelObj => {
        const label = graph.addLabel({
          owner,
          text: labelObj.text,
          preferredSize: new yfiles.geometry.Size(labelObj.width, labelObj.height)
        })
        const model = label.layoutParameter.model
        const parameterFinder = model.lookup(yfiles.graph.ILabelModelParameterFinder.$class)
        if (parameterFinder !== null) {
          const layout = new yfiles.geometry.OrientedRectangle(
            labelObj.anchorX,
            labelObj.anchorY,
            labelObj.width,
            labelObj.height,
            labelObj.upX,
            labelObj.upY
          )
          const parameter = parameterFinder.findBestParameter(label, model, layout)
          graph.setLabelLayoutParameter(label, parameter)
        } else {
          throw new Error("No ILabelModelParameterFinder found - can't deserialize labels.")
        }
      })
    }

    /**
     * Writes the edge-information of the graph to given JSONEdge-Array.
     * @param {JSONEdge[]} edgeObjs
     * @param {yfiles.graph.IGraph} graph
     */
    function writeEdges(edgeObjs, graph) {
      graph.edges.forEach(edge => {
        const sp = edge.sourcePort
        const tp = edge.targetPort

        /* @yjs:keep=id,source,target,sourcePort,targetPort,bends */
        const edgeObj = {
          id: edge.tag,
          source: sp.owner.tag,
          target: tp.owner.tag,
          sourcePort: {
            x: sp.location.x,
            y: sp.location.y
          },
          targetPort: {
            x: tp.location.x,
            y: tp.location.y
          },
          bends: [],
          labels: []
        }

        edge.bends.forEach(bend => {
          edgeObj.bends.push({
            x: bend.location.x,
            y: bend.location.y
          })
        })

        writeLabels(edge, edgeObj)
        edgeObjs.push(edgeObj)
      })
    }

    /**
     * Serialize the layout and text of the owner's labels
     *
     * @param {yfiles.graph.ILabelOwner} owner
     * @param {JSONLabelOwner} ownerObj
     */
    function writeLabels(owner, ownerObj) {
      owner.labels.forEach(label => {
        const layout = label.layout
        ownerObj.labels.push({
          text: label.text,
          anchorX: layout.anchorX,
          anchorY: layout.anchorY,
          upX: layout.upX,
          upY: layout.upY,
          width: layout.width,
          height: layout.height
        })
      })
    }

    /**
     * Returns the first node with the given ID if such a node exists.
     *
     * This implementation iterates the node list until a matching node is found. Therefore, its asymptotic running
     * time is linear in the number of nodes for each call.
     *
     * @param {yfiles.graph.IGraph} graph
     * @param {string} id
     */
    function findNode(graph, id) {
      return graph.nodes.first(node => node.tag === id)
    }

    /**
     * Creates a JSONNode from the information of the given node.
     * @param {yfiles.graph.INode} node
     * @return {JSONNode}
     */
    function createNodeObj(node) {
      const layout = node.layout

      /* @yjs:keep=id,layout */
      const nodeObj = {
        id: node.tag,
        labels: [],
        layout: {
          x: layout.x,
          y: layout.y,
          w: layout.width,
          h: layout.height
        }
      }

      const insetsProvider = node.lookup(yfiles.input.INodeInsetsProvider.$class)
      if (insetsProvider !== null) {
        const insets = insetsProvider.getInsets(node)
        nodeObj.insets = {
          top: insets.top,
          right: insets.right,
          bottom: insets.bottom,
          left: insets.left
        }
      }

      writeLabels(node, nodeObj)

      return nodeObj
    }

    /**
     * Creates an empty JSONGraph that can be filled with the graph information.
     * @returns {JSONGraph}
     */
    function createEmptyData() {
      return {
        nodeList: [],
        edgeList: [],
        graphBounds: null,
        isGrouped: false
      }
    }

    return GraphToJSON
  }
)
