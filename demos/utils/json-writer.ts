/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { JSONEdge, JSONGraph, JSONLabel, JSONNode, JSONPoint, NodeID } from './json-model'
import type { IEdge, IGraph, ILabel, INode } from 'yfiles'
import { ILabelModelParameter } from 'yfiles'

export type NodeDataWriter = (data: JSONNode, node: INode, graph: IGraph) => void
export type EdgeDataWriter = (data: JSONEdge, edge: IEdge, graph: IGraph) => void
type NodeIdProvider = (node: INode) => NodeID

/**
 * The type of the configuration options of the {@link toJSON} function.
 */
export type WriterOptions = {
  /**
   * An optional function that adds the node tag information to the node data.
   */
  nodeTag?: NodeDataWriter
  /**
   * An optional function that adds the node label information to the node data.
   */
  nodeLabels?: NodeDataWriter
  /**
   * An optional function that adds the node layout information to the node data.
   */
  nodeLayout?: NodeDataWriter

  /**
   * An optional function that adds the edge tag information to the edge data.
   */
  edgeTag?: EdgeDataWriter
  /**
   * An optional function that adds the edge label information to the edge data.
   */
  edgeLabels?: EdgeDataWriter
  /**
   * An optional function that adds the edge port locations to the edge data.
   */
  edgePortLocations?: EdgeDataWriter
  /**
   * An optional function that adds the edge bend locations to the edge data.
   */
  edgeBends?: EdgeDataWriter

  /**
   * An optional callback function that is called after node data was created.
   */
  nodeDataCreated?: NodeDataWriter
  /**
   * An optional callback function that is called after edge data was created.
   */
  edgeDataCreated?: EdgeDataWriter
}

/**
 * A configuration options object that writes layout information for nodes, edges, and labels.
 */
export function getDefaultWriterOptions(): WriterOptions {
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
      data.sourcePort = toPoint(edge.sourcePort!.location)
      data.targetPort = toPoint(edge.targetPort!.location)
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
 */
export function toJSON(graph: IGraph, options?: WriterOptions): JSONGraph {
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

function createNodeData(
  node: INode,
  graph: IGraph,
  nodeIdProvider: NodeIdProvider,
  options: WriterOptions
): JSONNode {
  const nodeData: JSONNode = {
    id: nodeIdProvider(node)
  }
  if (graph.isGroupNode(node)) {
    nodeData.isGroup = true
  }
  if (graph.getParent(node) !== null) {
    nodeData.parentId = nodeIdProvider(graph.getParent(node)!)
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

function createEdgeData(
  edge: IEdge,
  graph: IGraph,
  nodeIdProvider: NodeIdProvider,
  options: WriterOptions
) {
  /* @yjs:keep = source,target */
  const edgeData: JSONEdge = {
    source: nodeIdProvider(edge.sourceNode!),
    target: nodeIdProvider(edge.targetNode!)
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
 * @param label - The label to convert to data.
 * @param details - A value that specifies how to store the label's layout information.
 */
export function createLabelData(
  label: ILabel,
  details: 'none' | 'layout' | 'parameter' = 'none'
): JSONLabel {
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
 */
function toPoint(pointLike: { x: number; y: number }): JSONPoint {
  return [pointLike.x, pointLike.y]
}

/**
 * Creates an ID provider for nodes that simply enumerates the nodes.
 */
function createNodeIdProvider(): NodeIdProvider {
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
