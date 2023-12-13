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
import {
  GraphComponent,
  IEdge,
  IEdgeStyle,
  IGraph,
  IInputModeContext,
  INode,
  INodeStyle,
  Point,
  Rect,
  WebGL2IconNodeStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2ShapeNodeStyle
} from 'yfiles'

/**
 * Aggregates providers, configuration, graph generation etc. for one demo configuration
 */
export class DemoConfiguration {
  /**
   * The resource path for the graph to load
   */
  graphResourcePath

  /**
   * The zoom threshold to switch between WebGL2 and SVG rendering
   */
  svgThreshold

  /**
   * Provides an {@link INodeStyle} for SVG rendering
   */
  nodeStyleProvider

  /**
   * Provides an {@link IEdgeStyle} for SVG rendering
   */
  edgeStyleProvider

  /**
   * Provides a {@link WebGL2ShapeNodeStyle} or {@link WebGL2IconNodeStyle} for WebGL2 rendering
   */
  webGL2NodeStyleProvider

  /**
   * Provides a {@link WebGL2PolylineEdgeStyle} for WebGL2 rendering
   */
  webGL2EdgeStyleProvider

  /**
   * Creates a new node.
   */
  nodeCreator

  /**
   * Initializes the desired styles for the graph.
   * @param {!IGraph} graph
   * @returns {!Promise}
   */
  initializeStyleDefaults(graph) {
    throw new Error('abstract function call')
  }

  /**
   * Creates a new node for the specified data.
   * @param {!IGraph} graph
   * @param {*} id
   * @param {!Rect} layout
   * @param {*} nodeData
   * @returns {!INode}
   */
  createNode(graph, id, layout, nodeData) {
    throw new Error('abstract function call')
  }

  /**
   * Loads the sample graph from the resources folder
   * @param {!GraphComponent} graphComponent
   * @returns {!Promise}
   */
  async loadGraph(graphComponent) {
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
   * @param {!IGraph} graph the IGraph
   * @param {*} graphData the graph data in JSON format
   */
  createGraph(graph, graphData) {
    graph.clear()
    // create a map to store the nodes for edge creation
    const nodeMap = new Map()

    // create the nodes
    for (const nodeData of graphData.nodeList) {
      const id = nodeData.id
      const l = nodeData.l
      const layout = new Rect(l.x, l.y, l.w, l.h)
      const node = this.createNode(graph, id, layout, nodeData)

      nodeMap.set(id, node)
    }

    // create the edges
    for (const edgeData of graphData.edgeList) {
      // get the source and target node from the mapping
      const sourceNode = nodeMap.get(edgeData.s)
      const targetNode = nodeMap.get(edgeData.t)
      // create the source and target port
      const sourcePortLocation =
        edgeData.sp != null ? Point.from(edgeData.sp) : sourceNode.layout.center
      const targetPortLocation =
        edgeData.tp != null ? Point.from(edgeData.tp) : targetNode.layout.center
      const sourcePort = graph.addPortAt(sourceNode, sourcePortLocation)
      const targetPort = graph.addPortAt(targetNode, targetPortLocation)
      // create the edge
      const edge = graph.createEdge(sourcePort, targetPort)
      // add the bends
      if (edgeData.b != null) {
        const bendData = edgeData.b
        bendData.forEach((bend) => {
          graph.addBend(edge, bend)
        })
      }
    }
  }
}
