/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { type IGraph } from '@yfiles/yfiles'
import { NodeData, type SerializableNodeData } from './NodeData'
import { EdgeData, type SerializableEdgeData } from './EdgeData'

export type SerializableGraphData = {
  nodes: Array<SerializableNodeData>
  edges: Array<SerializableEdgeData>
}

type GraphDataOptions = { nodeDataItems: Array<NodeData>; edgeDataItems: Array<EdgeData> }

/**
 * A simple, minimal data structure that can be used for exporting Graph data
 * and re-creating the Graph.
 */
export class GraphData {
  private nodeDataItems: GraphDataOptions['nodeDataItems']
  private edgeDataItems: GraphDataOptions['edgeDataItems']

  /**
   * Creates GraphData from an actual node. We exclude the validator function,
   * if present as it cannot be serialized, and it will be automatically set
   * on node re-creation anyway.
   */
  static fromGraph(graph: IGraph): GraphData {
    const nodes = graph.nodes.toArray()

    const edges = graph.edges
      .toArray()
      .map(
        (edge) =>
          [
            edge,
            nodes.findIndex((node) => node === edge.sourceNode),
            nodes.findIndex((node) => node === edge.targetNode)
          ] as const
      )

    const nodeDataItems = nodes.map(NodeData.fromGraphItem)
    const edgeDataItems = edges.map((edge) => EdgeData.fromGraphItem(...edge))
    return new GraphData({ nodeDataItems, edgeDataItems })
  }

  /**
   * Converts an arbitrary piece of data to GraphData after validation.
   */
  static fromJSONData(data: unknown): GraphData {
    this.validate(data)

    const nodeDataItems = data.nodes.map(NodeData.fromJSONData)
    const edgeDataItems = data.edges.map(EdgeData.fromJSONData)
    return new GraphData({ nodeDataItems, edgeDataItems })
  }

  /**
   * Checks if an arbitrary piece of data (as it comes from a JSON source)
   * conforms to the format required by GraphData.
   */
  static validate(data: unknown): asserts data is SerializableGraphData {
    if (data) {
      return
    }
    throw new Error('Malformed graph data')
  }

  constructor({ nodeDataItems, edgeDataItems }: GraphDataOptions) {
    this.nodeDataItems = nodeDataItems
    this.edgeDataItems = edgeDataItems
  }

  /**
   * Applies data to the actual Graph after clearing it.
   */
  applyToGraph(graph: IGraph): void {
    graph.clear()
    const nodes = this.nodeDataItems.map((n) => n.createGraphItem(graph))
    this.edgeDataItems.forEach((e) => e.createGraphItem(graph, ...e.matchPorts(nodes)))
  }

  /**
   * Converts GraphData to a JSON string.
   */
  toJSON(): string {
    const data: SerializableGraphData = {
      nodes: this.nodeDataItems.map((n) => n.toJSONData()),
      edges: this.edgeDataItems.map((e) => e.toJSONData())
    }
    return JSON.stringify(data, null, 2)
  }
}
