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
  type IEnumerable,
  type IEnumerableConvertible,
  type IGraph,
  type IModelItem,
  type INode,
  type TimeSpan,
  type TimeSpanConvertible
} from '@yfiles/yfiles'
import type { GraphData } from './build-graph'
import type { Menu } from './menu'

/**
 * This type provides helper and convenience functions for the yFiles Playground.
 */
export interface DemoApp {
  toolbar: Menu
  sidebar: Menu

  /**
   * Creates a random graph.
   * @param graph The graph object which will be modified.
   *              This defaults to the graph attached to this playground.
   * @param nodeCount The number of nodes in the graph.
   *                  This defaults to 10.
   * @param edgeCount The number of edges in the graph.
   *                  This defaults to nodeCount - 1 (tree structure) and is clamped to 0 (not connected) and nodeCount * (nodeCount - 1) (strongly connected).
   * @param groupCount The number of group nodes in the graph. This defaults to 0.
   * @param onNodeCreated A function which is called for each created node. The function receives the created node and its index.
   * @param onEdgeCreated A function which is called for each created edge. The function receives the created edge and its index.
   */
  createRandomGraph(
    graph?: IGraph,
    nodeCount?: number,
    edgeCount?: number,
    groupCount?: number,
    onNodeCreated?: (n: INode, i: number) => void,
    onEdgeCreated?: (e: IEdge, i: number) => void
  ): void

  /**
   * Creates a random graph with the given number of nodes.
   * @param options The options to configure the random graph.
   * @param options.graph The graph object which will be modified.
   *  This defaults to the graph attached to this playground.
   * @param options.nodeCount The number of nodes in the graph.
   *  This defaults to 10.
   * @param options.edgeCount The number of edges in the graph.
   *  This defaults to nodeCount - 1 (tree structure) and is clamped to 0 (not connected) and nodeCount * (nodeCount - 1) (strongly connected).
   * @param options.groupCount The number of group nodes in the graph. This defaults to 0.
   * @param options.onNodeCreated A function which is called for each created node. The function receives the created node and its index.
   * @param options.onEdgeCreated A function which is called for each created edge. The function receives the created edge and its index.
   */
  createRandomGraph(options: {
    graph?: IGraph
    nodeCount?: number
    edgeCount?: number
    groupCount?: number
    onNodeCreated?: (n: INode, i: number) => void
    onEdgeCreated?: (e: IEdge, i: number) => void
  }): void

  /**
   * Constructs and populates a graph using the provided JSON data.
   * @param graphData The JSON data used to build the graph structure.
   * @param graph The graph instance to be populated.
   */
  buildGraphFromJson(graphData: GraphData, graph?: IGraph): void

  /**
   * Loads a graph from a GraphML string contained in the specified tab.
   * @param graphml The GraphML string to load the graph from.
   * @param graph The graph instance to populate with the data from the GraphML string.
   */
  buildGraphFromGraphML(graphml: string, graph?: IGraph): Promise<void>

  /**
   * Animates a highlight effect on the specified items within the graph component over a given duration.
   * @param items A single item or an array of items to be highlighted.
   * @param duration The duration of the highlight animation.
   * @param graphComponent The graph component where the highlight animation will be displayed.
   * @returns A promise that resolves when the highlight animation is completed.
   */
  highlight(
    items: IModelItem | IEnumerable<IModelItem> | IEnumerableConvertible<IModelItem>,
    duration?: TimeSpan | TimeSpanConvertible,
    graphComponent?: GraphComponent
  ): Promise<void>

  /**
   * Delays the execution for a specified duration.
   * @param duration The duration of the delay.
   * @returns A promise that resolves after the specified delay duration.
   */
  delay(duration?: TimeSpan | TimeSpanConvertible): Promise<void>

  /**
   * Shows a transient message for the given duration. The message is attached to the playground root element.
   * @param content The content to display.
   * @param duration How long the message should be visible.
   */
  show(content: string | HTMLElement, duration?: TimeSpan | TimeSpanConvertible): Promise<void>
}
