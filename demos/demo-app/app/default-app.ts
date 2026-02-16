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
  IEnumerable,
  type IEnumerableConvertible,
  IGraph,
  IModelItem,
  type INode,
  type TimeSpan,
  type TimeSpanConvertible
} from '@yfiles/yfiles'
import { buildGraph, type GraphData } from './build-graph'
import { readFromGraphML } from './graphml-support'
import { delay, highlightItems, show } from './presentation-support'
import { DefaultMenu, type Menu } from './default-menu'
import type { DemoApp } from './demo-app'

export * from './demo-app'

/**
 * The internal implementation of the Demo App.
 * @internal
 */
export class DefaultApp implements DemoApp {
  private readonly signal?: AbortSignal | undefined
  private readonly graphComponent: GraphComponent
  private messageRoot: HTMLDivElement | null
  readonly toolbar: Menu
  readonly sidebar: Menu

  constructor(
    toolbarFactory: () => HTMLDivElement,
    sidebarFactory: () => HTMLDivElement,
    messageRoot: HTMLDivElement | null,
    graphComponent: GraphComponent,
    signal?: AbortSignal | undefined
  ) {
    this.messageRoot = messageRoot
    this.graphComponent = graphComponent
    this.signal = signal
    this.toolbar = new DefaultMenu(toolbarFactory)
    this.sidebar = new DefaultMenu(sidebarFactory)
  }

  createRandomGraph(
    graph?:
      | IGraph
      | {
          graph?: IGraph
          nodeCount?: number
          edgeCount?: number
          groupCount?: number
          onNodeCreated?: (n: INode, i: number) => void
          onEdgeCreated?: (e: IEdge, i: number) => void
        },
    nodeCount?: number,
    edgeCount?: number,
    groupCount?: number,
    onNodeCreated?: (n: INode, i: number) => void,
    onEdgeCreated?: (e: IEdge, i: number) => void
  ): void {
    if (!graph) {
      graph = this.graphComponent.graph
    }

    if (!(graph instanceof IGraph)) {
      const options = graph
      graph = options.graph ?? this.graphComponent.graph
      nodeCount = options.nodeCount
      edgeCount = options.edgeCount
      onNodeCreated = options.onNodeCreated
      onEdgeCreated = options.onEdgeCreated
      groupCount = options.groupCount
    }

    if (!nodeCount) {
      nodeCount = 10
    }

    edgeCount = Math.max(0, Math.min(edgeCount ?? nodeCount - 1, nodeCount * (nodeCount - 1)))
    const rootNode = graph.createNode()

    // Create a random graph with a tree structure
    const nodes: INode[] = [rootNode]
    const edges: IEdge[] = []
    for (let i = 1; i < nodeCount; i++) {
      nodes.push(graph.createNode())

      if (edgeCount > 0) {
        edges.push(graph.createEdge(nodes[Math.floor(Math.random() * (i - 1))], nodes[i]))
      }
      edgeCount--
    }

    if (groupCount && groupCount > 0) {
      const availableNodes = [...nodes]
      for (let i = 0; i < groupCount; i++) {
        const group = graph.createGroupNode()
        const contentCount = Math.max(1, Math.floor(Math.random() * availableNodes.length * 0.3))
        for (let j = 0; j < contentCount; j++) {
          const nodeIndex = Math.floor(Math.random() * availableNodes.length)
          const node = availableNodes[nodeIndex]
          availableNodes.splice(nodeIndex, 1)
          graph.setParent(node, group)
        }
        availableNodes.push(group)
        nodes.push(group)
      }
    }

    for (let i = 0; i < edgeCount; i++) {
      let from = nodes[Math.floor(Math.random() * nodeCount)]
      let to = nodes[Math.floor(Math.random() * nodeCount)]
      while (from == to || graph.getEdge(from, to)) {
        from = nodes[Math.floor(Math.random() * nodeCount)]
        to = nodes[Math.floor(Math.random() * nodeCount)]
      }

      edges.push(graph.createEdge(from, to))
    }

    if (onNodeCreated != null) {
      for (const node of nodes) {
        onNodeCreated(node, nodes.indexOf(node))
      }
    }

    if (onEdgeCreated != null) {
      for (const edge of edges) {
        onEdgeCreated(edge, edges.indexOf(edge))
      }
    }
  }

  buildGraphFromJson(graphData: GraphData, graph?: IGraph): void {
    buildGraph(graph ?? this.graphComponent.graph, graphData)
  }

  async buildGraphFromGraphML(graphml: string, graph?: IGraph): Promise<void> {
    try {
      graph = graph ?? this.graphComponent.graph
      graph.clear()
      await readFromGraphML(graph, graphml)
    } catch (e) {
      throw new Error(`Error reading GraphML: ${(e as Error).message}`)
    }
  }

  highlight(
    items: IModelItem | IEnumerable<IModelItem> | IEnumerableConvertible<IModelItem>,
    duration: TimeSpan | TimeSpanConvertible = 1000,
    graphComponent?: GraphComponent
  ): Promise<void> {
    const allItems = items instanceof IModelItem ? [items] : items
    return highlightItems(
      graphComponent ?? this.graphComponent,
      IEnumerable.from(allItems),
      duration,
      this.signal
    )
  }

  delay(duration: TimeSpan | TimeSpanConvertible = 1000): Promise<void> {
    return delay(duration, this.signal)
  }

  show(
    content: string | HTMLElement,
    duration: TimeSpan | TimeSpanConvertible = 1000
  ): Promise<void> {
    // create a message container if none was given
    if (!this.messageRoot && this.graphComponent.htmlElement.parentElement) {
      this.messageRoot = document.createElement('div')
      this.messageRoot.className = 'yplay__message-host'
      this.graphComponent.htmlElement.parentElement.appendChild(this.messageRoot)
    }

    return show(content, duration, this.messageRoot, this.signal)
  }
}
