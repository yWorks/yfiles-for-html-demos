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
import {
  type GraphComponent,
  type IEdge,
  type IEdgeStyle,
  type IGraph,
  type IInputModeContext,
  type INode,
  type INodeStyle,
  Point,
  Rect
} from '@yfiles/yfiles'

/**
 * Aggregates providers, configuration, graph generation etc. for one demo configuration
 */
export abstract class DemoConfiguration {
  /**
   * The resource path for the graph to load
   */
  abstract graphResourcePath: string

  /**
   * The zoom threshold to switch between WebGL and SVG rendering
   */
  abstract svgThreshold: number

  /**
   * Provides an {@link INodeStyle} for SVG rendering
   */
  abstract nodeStyleProvider: (node: INode, graph: IGraph) => INodeStyle

  /**
   * Provides an {@link IEdgeStyle} for SVG rendering
   */
  abstract edgeStyleProvider: (edge: IEdge, graph: IGraph) => IEdgeStyle

  /**
   * Creates a new node.
   */
  abstract nodeCreator:
    | ((
        context: IInputModeContext,
        graph: IGraph,
        location: Point,
        parent: INode | null
      ) => INode | null)
    | null

  /**
   * Initializes the desired styles for the graph.
   */
  abstract initializeStyleDefaults(graph: IGraph): Promise<void>

  /**
   * Creates a new node for the specified data.
   */
  protected abstract createNode(graph: IGraph, id: any, layout: Rect, nodeData: any): INode

  /**
   * Loads the sample graph from the resources folder
   */
  async loadGraph(graphComponent: GraphComponent): Promise<void> {
    const graph = graphComponent.graph
    graph.undoEngineEnabled = false

    const response = await fetch(this.graphResourcePath)
    const graphData = await response.json()
    this.createGraph(graph, graphData)

    graph.undoEngineEnabled = true
  }

  /**
   * Parses the json graph data and builds a graph accordingly
   * @yjs:keep = edgeList
   * @param graph the IGraph
   * @param graphData the graph data in JSON format
   */
  createGraph(graph: IGraph, graphData: any) {
    graph.clear()
    // create a map to store the nodes for edge creation
    const nodeMap = new Map<any, INode>()

    // create the nodes
    for (const nodeData of graphData.nodeList) {
      const id = nodeData.id
      const l = nodeData.l
      const layout = new Rect(l.x, l.y, l.w, l.h)
      const node = this.createNode(graph, id, layout, nodeData)
      graph.setStyle(node, this.nodeStyleProvider(node, graph))

      nodeMap.set(id, node)
    }

    // create the edges
    for (const edgeData of graphData.edgeList) {
      // get the source and target node from the mapping
      const sourceNode = nodeMap.get(edgeData.s)!
      const targetNode = nodeMap.get(edgeData.t)!
      // create the source and target port
      const sourcePortLocation =
        edgeData.sp != null ? Point.from(edgeData.sp) : sourceNode.layout.center
      const targetPortLocation =
        edgeData.tp != null ? Point.from(edgeData.tp) : targetNode.layout.center
      const sourcePort = graph.addPortAt(sourceNode, sourcePortLocation)
      const targetPort = graph.addPortAt(targetNode, targetPortLocation)

      // create the edge
      const edge = graph.createEdge(sourcePort, targetPort)
      graph.setStyle(edge, this.edgeStyleProvider(edge, graph))

      // add the bends
      if (edgeData.b != null) {
        const bendData = edgeData.b as { x: number; y: number }[]
        bendData.forEach((bend) => {
          graph.addBend(edge, bend)
        })
      }
    }
  }
}
