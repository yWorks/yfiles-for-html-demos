/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { ILabelModelParameter } from 'yfiles'

/**
 * @typedef {function} NodeDataWriter
 */
/**
 * @typedef {function} EdgeDataWriter
 */
/**
 * @typedef {function} NodeIdProvider
 */

/**
 * The type of the configuration options of the {@link toJSON} function.
 * @typedef {Object} WriterOptions
 * @property {NodeDataWriter} [nodeTag]
 * @property {NodeDataWriter} [nodeLabels]
 * @property {NodeDataWriter} [nodeLayout]
 * @property {EdgeDataWriter} [edgeTag]
 * @property {EdgeDataWriter} [edgeLabels]
 * @property {EdgeDataWriter} [edgePortLocations]
 * @property {EdgeDataWriter} [edgeBends]
 * @property {NodeDataWriter} [nodeDataCreated]
 * @property {EdgeDataWriter} [edgeDataCreated]
 */

/**
 * A configuration options object that writes layout information for nodes, edges, and labels.
 * @returns {!WriterOptions}
 */
export function getDefaultWriterOptions() {
  return {
    nodeLayout: (data, node) => {
      const { x, y, width, height } = node.layout
      data.layout = { x, y, width, height }
    },
    nodeLabels: (data, node) => {
      data.labels = node.labels.toArray().map((label) => createLabelData(label, 'parameter'))
    },

    edgeBends: (data, edge) => {
      data.bends = edge.bends.toArray().map((bend) => toPoint(bend.location))
    },
    edgePortLocations: (data, edge) => {
      data.sourcePort = toPoint(edge.sourcePort.location)
      data.targetPort = toPoint(edge.targetPort.location)
    },
    edgeLabels: (data, edge) => {
      data.labels = edge.labels.toArray().map((label) => createLabelData(label, 'parameter'))
    }
  }
}

/**
 * Stores the {@link graph} as JSON object with the provided {@link options configuration object}.
 * This implementation always writes the structure of the graph, i.e., its nodes, groups, and edges.
 * @yjs:keep=nodeList,edgeList
 * @param {!IGraph} graph
 * @param {!WriterOptions} [options]
 * @returns {!JSONGraph}
 */
export function toJSON(graph, options) {
  const nodeIdProvider = createNodeIdProvider()
  const actualOptions = options ?? getDefaultWriterOptions()
  return {
    nodeList: graph.nodes
      .toArray()
      .map((node) => createNodeData(node, graph, nodeIdProvider, actualOptions)),
    edgeList: graph.edges
      .toArray()
      .map((edge) => createEdgeData(edge, graph, nodeIdProvider, actualOptions))
  }
}

/**
 * @param {!INode} node
 * @param {!IGraph} graph
 * @param {!NodeIdProvider} nodeIdProvider
 * @param {!WriterOptions} options
 * @returns {!JSONNode}
 */
function createNodeData(node, graph, nodeIdProvider, options) {
  const nodeData = {
    id: nodeIdProvider(node)
  }
  if (graph.isGroupNode(node)) {
    nodeData.isGroup = true
  }
  if (graph.getParent(node) !== null) {
    nodeData.parentId = nodeIdProvider(graph.getParent(node))
  }

  if (options.nodeLayout) {
    options.nodeLayout(nodeData, node, graph)
  }
  if (options.nodeLabels && node.labels.size > 0) {
    options.nodeLabels(nodeData, node, graph)
  }
  if (options.nodeTag && node.tag != null) {
    options.nodeTag(nodeData, node, graph)
  }

  options.nodeDataCreated?.(nodeData, node, graph)

  return nodeData
}

/**
 * @param {!IEdge} edge
 * @param {!IGraph} graph
 * @param {!NodeIdProvider} nodeIdProvider
 * @param {!WriterOptions} options
 */
function createEdgeData(edge, graph, nodeIdProvider, options) {
  /* @yjs:keep = source,target */
  const edgeData = {
    source: nodeIdProvider(edge.sourceNode),
    target: nodeIdProvider(edge.targetNode)
  }

  if (options.edgePortLocations) {
    options.edgePortLocations(edgeData, edge, graph)
  }
  if (options.edgeBends && edge.bends.size > 0) {
    options.edgeBends(edgeData, edge, graph)
  }
  if (options.edgeLabels && edge.labels.size > 0) {
    options.edgeLabels(edgeData, edge, graph)
  }
  if (options.edgeTag && edge.tag != null) {
    options.edgeTag(edgeData, edge, graph)
  }

  options.edgeDataCreated?.(edgeData, edge, graph)

  return edgeData
}

/**
 * Creates the JSON label data for the given {@link label}.
 * @param {!ILabel} label - The label to convert to data.
 * @param details - A value that specifies how to store the label's layout information.
 * @param {!('none'|'layout'|'parameter')} [details=none]
 * @returns {!JSONLabel}
 */
export function createLabelData(label, details = 'none') {
  const { text, layout, layoutParameter } = label
  return details === 'none'
    ? { text }
    : details === 'parameter'
      ? {
          text,
          layoutParameter: ILabelModelParameter.serializeParameter(layoutParameter)
        }
      : {
          text,
          layout: {
            anchorX: layout.anchorX,
            anchorY: layout.anchorY,
            upX: layout.upX,
            upY: layout.upY,
            width: layout.width,
            height: layout.height
          }
        }
}

/**
 * Converts the given {@link pointLike} to {@link JSONPoint}.
 * @param {!object} pointLike
 * @returns {!JSONPoint}
 */
function toPoint(pointLike) {
  return [pointLike.x, pointLike.y]
}

/**
 * Creates an ID provider for nodes that simply enumerates the nodes.
 * @returns {!NodeIdProvider}
 */
function createNodeIdProvider() {
  const nodeToIdMap = new Map()
  return (node) => {
    if (nodeToIdMap.has(node)) {
      return nodeToIdMap.get(node)
    }
    const id = nodeToIdMap.size
    nodeToIdMap.set(node, id)
    return id
  }
}
