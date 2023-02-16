/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  Chains,
  GraphComponent,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  Path,
  Paths,
  ResultItemMapping,
  ShortestPath,
  SingleSourceShortestPaths
} from 'yfiles'
import { AlgorithmConfiguration } from './AlgorithmConfiguration'
import { MultiColorNodeStyle } from './DemoStyles'
import type { ContextMenu } from '../../utils/ContextMenu'

/**
 * Configuration options for the path algorithms.
 */
export class PathsConfig extends AlgorithmConfiguration {
  private paths: Path[] = []
  private dist: ResultItemMapping<INode, number> | null = null
  private pred: ResultItemMapping<INode, IEdge> | null = null
  private markedSources: INode[] | null = null
  private markedTargets: INode[] | null = null

  /**
   * Creates an instance of PathsConfig with default settings.
   */
  constructor(private readonly algorithmType: number) {
    super()
  }

  /**
   * Finds edges that belong to a path/chain in the graph.
   * @param graph The graph on which a path algorithm is executed.
   */
  runAlgorithm(graph: IGraph): void {
    // reset the graph to remove all previous markings
    this.resetGraph(graph)
    this.paths = []
    this.dist = null
    this.pred = null

    if (graph.nodes.size > 0) {
      if (this.markedSources === null || !this.nodesInGraph(this.markedSources, graph)) {
        // choose a source for the path if there isn't one already
        this.markedSources = [graph.nodes.first()]
      }
      if (this.markedTargets === null || !this.nodesInGraph(this.markedTargets, graph)) {
        // choose a target for the path if there isn't one already
        this.markedTargets = [graph.nodes.last()]
      }

      // apply one of the path algorithms
      switch (this.algorithmType) {
        case PathsConfig.ALGORITHM_TYPE_SHORTEST_PATHS:
          this.calculateShortestPath(this.markedSources, this.markedTargets, graph)
          break
        case PathsConfig.ALGORITHM_TYPE_ALL_PATHS:
          this.calculateAllPaths(this.markedSources[0], this.markedTargets[0], graph)
          break
        case PathsConfig.ALGORITHM_TYPE_ALL_CHAINS:
          this.calculateAllChains(graph)
          break
        case PathsConfig.ALGORITHM_TYPE_SINGLE_SOURCE:
          this.calculateSingleSource(graph)
          break
        default:
          this.calculateShortestPath(this.markedSources, this.markedTargets, graph)
          break
      }

      // mark the resulting paths
      this.markPaths(graph)
    }
  }

  /**
   * Calculates the shortest paths from each source to each target.
   * @param sources An array of source nodes.
   * @param targets An array of target nodes.
   * @param graph The graph on which the shortest path algorithm is executed.
   */
  calculateShortestPath(sources: INode[], targets: INode[], graph: IGraph): void {
    if (sources !== null && targets !== null) {
      sources.forEach(source => {
        const result = new ShortestPath({
          directed: this.directed,
          costs: edge => this.getEdgeWeight(edge),
          source,
          sink: targets[0]
        }).run(graph)
        if (result.path) {
          this.paths = [result.path]
        }
      })
    } else {
      this.paths.length = 0
    }
  }

  /**
   * Calculates all paths between the source and target.
   * @param source The source for the paths.
   * @param target The target for the paths.
   * @param graph The graph on which the all paths algorithm is executed.
   */
  calculateAllPaths(source: INode, target: INode, graph: IGraph): void {
    // Check if graph contains source and target nodes
    if (source !== null && target !== null && graph.contains(source) && graph.contains(target)) {
      const result = new Paths({
        directed: this.directed,
        startNodes: source,
        endNodes: target
      }).run(graph)
      // add resulting edges to set
      result.paths.forEach(path => this.paths.push(path))
    } else {
      this.paths.length = 0
    }
  }

  /**
   * Calculates all chains in the graph.
   * @param graph The graph on which the all chains algorithm is executed.
   */
  calculateAllChains(graph: IGraph): void {
    // run algorithm
    const result = new Chains({ directed: this.directed }).run(graph)
    result.chains.forEach(chain => this.paths.push(chain))
  }

  /**
   * Calculates the paths from the source to all reachable nodes in the graph.
   * @param graph The graph on which the single source algorithm is executed.
   */
  calculateSingleSource(graph: IGraph): void {
    // run algorithm
    const result = new SingleSourceShortestPaths({
      source: this.markedSources![0],
      sinks: graph.nodes,
      directed: this.directed,
      costs: edge => this.getEdgeWeight(edge)
    }).run(graph)

    this.dist = result.distances
    this.pred = result.predecessors
  }

  /**
   * Adds different colors to independent paths.
   * If some nodes or edges are selected only paths that depend on them are marked.
   * @param graph The graph in which the paths are marked.
   */
  markPaths(graph: IGraph): void {
    const paths = this.paths
    if (this.algorithmType !== PathsConfig.ALGORITHM_TYPE_SINGLE_SOURCE) {
      const allPaths: IModelItem[][] = Array.from<IModelItem>({ length: paths.length }).map(_ => [])
      if (paths.length > 0) {
        // change the styles for the nodes and edges that belong to a path
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i].edges
          path.forEach((edge, index) => {
            const source = edge.sourceNode!
            const target = edge.targetNode!

            graph.setStyle(source, new MultiColorNodeStyle())
            graph.setStyle(target, new MultiColorNodeStyle())
            graph.setStyle(edge, this.getMarkedEdgeStyle(this.directed, i))

            if (
              path.size === 1 ||
              (index === 0 &&
                (target === path.at(index + 1)!.sourceNode ||
                  target === path.at(index + 1)!.targetNode)) ||
              (index > 0 &&
                (source === path.at(index - 1)!.sourceNode ||
                  source === path.at(index - 1)!.targetNode))
            ) {
              allPaths[i].push(source)
              allPaths[i].push(edge)
              allPaths[i].push(target)
            } else {
              allPaths[i].push(target)
              allPaths[i].push(edge)
              allPaths[i].push(source)
            }
          })
        }

        graph.nodes.forEach((node, index) => {
          const nodePaths = []
          for (let i = 0; i < allPaths.length; i++) {
            if (allPaths[i].indexOf(node) > -1) {
              nodePaths.push(i)
            }
          }
          node.tag = {
            id: index,
            color: null,
            components: allPaths,
            nodeComponents: nodePaths
          }
        })

        graph.edges.forEach((edge, index) => {
          let component = -1
          for (let i = 0; i < allPaths.length; i++) {
            if (allPaths[i].indexOf(edge) > -1) {
              component = i
            }
          }
          edge.tag = {
            id: index,
            color: null,
            components: allPaths,
            edgeComponent: component
          }
        })
      } else {
        graph.nodes.forEach((node, index) => {
          node.tag = {
            id: index
          }
        })
      }
    } else {
      // add a gradient to indicate the distance of the nodes to the source
      this.markedTargets!.length = 0
      if (this.dist !== null && this.pred !== null) {
        let maxDistance = 0
        const distances = this.dist
        const predecessors = this.pred
        graph.nodes.forEach(node => {
          const dist = distances.get(node)
          if (dist !== null && dist < Number.POSITIVE_INFINITY) {
            maxDistance = Math.max(maxDistance, dist)
          }
        })
        graph.nodes.forEach((node, index) => {
          const distToSource = distances.get(node)
          const predEdge = predecessors.get(node)

          node.tag = {
            singleSource: this.markedSources![0],
            id: index
          }
          if (node === this.markedSources![0]) {
            graph.setStyle(
              node,
              this.getMarkedNodeStyle(0, {
                lightToDark: false,
                size: maxDistance + 1
              })
            )
          } else if (
            distToSource !== null &&
            distToSource < Number.POSITIVE_INFINITY &&
            predEdge !== null
          ) {
            const markedNodeStyle = this.getMarkedNodeStyle(Math.round(distToSource), {
              lightToDark: false,
              size: maxDistance + 1
            })
            graph.setStyle(node, markedNodeStyle)
            graph.setStyle(
              predEdge,
              this.getMarkedEdgeStyle(this.directed, Math.round(distToSource), {
                lightToDark: false,
                size: maxDistance + 1
              })
            )
            predEdge.tag = {
              singleSource: this.markedSources![0],
              id: index
            }
          }
        })
      }
    }

    if (this.algorithmType !== PathsConfig.ALGORITHM_TYPE_ALL_CHAINS) {
      if (this.algorithmType === PathsConfig.ALGORITHM_TYPE_SHORTEST_PATHS) {
        // mark source and target of the paths
        this.markedSources!.forEach(source =>
          graph.setStyle(
            source,
            this.getSourceTargetNodeStyle(true, this.markedTargets!.indexOf(source) >= 0)
          )
        )
        this.markedTargets!.forEach(target =>
          graph.setStyle(
            target,
            this.getSourceTargetNodeStyle(this.markedSources!.indexOf(target) >= 0, true)
          )
        )
      } else {
        // mark the source
        if (this.markedSources![0] !== null) {
          graph.setStyle(
            this.markedSources![0],
            this.getSourceTargetNodeStyle(true, this.markedSources![0] === this.markedTargets![0])
          )
        }
        if (
          this.markedTargets![0] !== null &&
          this.algorithmType === PathsConfig.ALGORITHM_TYPE_ALL_PATHS
        ) {
          graph.setStyle(
            this.markedTargets![0],
            this.getSourceTargetNodeStyle(this.markedSources![0] === this.markedTargets![0], true)
          )
        }
      }
    }
  }

  /**
   * Adds entries to the context menu to mark source and target nodes.
   * @param contextMenu The context menu to extend
   * @param item The item which is affected by the context menu
   * @param graphComponent The current graph component.
   */
  populateContextMenu(
    contextMenu: ContextMenu,
    item: IModelItem,
    graphComponent: GraphComponent
  ): void {
    const graph = graphComponent.graph
    if (this.algorithmType === PathsConfig.ALGORITHM_TYPE_SHORTEST_PATHS) {
      if (INode.isInstance(item)) {
        this.updateSelection(item, graphComponent)
      }
      const selectedNodes = graphComponent.selection.selectedNodes
      if (selectedNodes.size > 0) {
        contextMenu.addMenuItem('Mark as Source', () => {
          this.markedSources = selectedNodes.toArray()
          this.runAlgorithm(graph)
        })
        contextMenu.addMenuItem('Mark as Target', () => {
          this.markedTargets = selectedNodes.toArray()
          this.runAlgorithm(graph)
        })
      }
    } else if (this.algorithmType !== PathsConfig.ALGORITHM_TYPE_ALL_CHAINS) {
      if (INode.isInstance(item)) {
        contextMenu.addMenuItem('Mark As Source', () => {
          this.markedSources = [item]
          this.runAlgorithm(graph)
        })
        if (this.algorithmType !== PathsConfig.ALGORITHM_TYPE_SINGLE_SOURCE) {
          contextMenu.addMenuItem('Mark As Target', () => {
            this.markedTargets = [item]
            this.runAlgorithm(graph)
          })
        }
      }
    }
  }

  /**
   * Updates the selection of the graph so the given node is the only selected node.
   * @param node The only node that should be selected.
   * @param graphComponent The graph component that contains the graph to which the node
   *   belongs.
   */
  updateSelection(node: INode, graphComponent: GraphComponent): void {
    if (node === null) {
      graphComponent.selection.clear()
    } else if (!graphComponent.selection.selectedNodes.isSelected(node)) {
      graphComponent.selection.clear()
      graphComponent.selection.selectedNodes.setSelected(node, true)
      graphComponent.currentItem = node
    }
  }

  /**
   * Returns the description text that explains the currently used path algorithm.
   * @returns The description text.
   */
  get descriptionText(): string {
    switch (this.algorithmType) {
      case PathsConfig.ALGORITHM_TYPE_ALL_PATHS:
        return (
          '<p>This part of the demo highlights <em>all paths</em> between two nodes that can be marked using the <em>Context Menu</em>.</p><p>The paths may share some parts and therefore can overlap. Which path is in focus can be specified at the nodes which belong to several path.</p>' +
          '<p>This algorithm can take the direction of edges into account.</p>'
        )
      case PathsConfig.ALGORITHM_TYPE_ALL_CHAINS:
        return (
          '<p>This part of the demo highlights <em>all chains</em> in the graph. Chains contain only nodes with degree 2 as well as their start and end node.</p><p>Which path is focused in case a node belongs to several chains can be specified at these nodes.</p>' +
          '<p>This algorithm can take the direction of edges into account.</p>'
        )
      case PathsConfig.ALGORITHM_TYPE_SINGLE_SOURCE:
        return (
          '<p>This part of the demo marks the shortest paths from a <em>single source</em> to all other reachable nodes in the graph.</p><p>The gradient of node and edge colors ' +
          'represents the distance from the source. The source can be marked using the <em>Context Menu</em>.</p>' +
          '<p>Costs can be specified using <em>edge labels</em>. The cost of edges without labels is their <em>edge length</em>. When the algorithm should ' +
          '<em>Uniform costs</em> all edges are treated the same. For the sake of simplicity, in this demo we allow only positive edge costs.</p>' +
          '<p>This algorithm can take the direction of edges into account.</p>'
        )
      case PathsConfig.ALGORITHM_TYPE_SHORTEST_PATHS:
      default:
        return (
          '<p>This part of the demo highlights the <em>shortest/cheapest path</em> between nodes that can be marked using the <em>Context Menu</em>. It is possible to mark multiple sources/targets. Which path should be focused can be specified at the nodes that belong to several paths.</p>' +
          '<p>Costs can be specified using <em>edge labels</em>. The cost of edges without labels is their <em>edge length</em>. When the algorithm should ' +
          'use <em>Uniform costs</em> all edges are treated the same. For the sake of simplicity, in this demo we allow only positive edge costs.</p>' +
          '<p>This algorithm can take the direction of edges into account.</p>'
        )
    }
  }

  /**
   * Returns whether or not all the given nodes belong to the graph.
   * @param nodes The nodes.
   * @param graph The graph.
   * @returns `true` if all nodes belong to the graph, `false` otherwise.
   */
  nodesInGraph(nodes: INode[], graph: IGraph): boolean {
    return nodes.every(node => graph.contains(node))
  }

  /**
   * Returns a type descriptor to select the shortest paths algorithm.
   */
  static get ALGORITHM_TYPE_SHORTEST_PATHS(): number {
    return 0
  }

  /**
   * Returns a type descriptor to select the all paths algorithm.
   */
  static get ALGORITHM_TYPE_ALL_PATHS(): number {
    return 1
  }

  /**
   * Returns a type descriptor to select the all chains algorithm.
   */
  static get ALGORITHM_TYPE_ALL_CHAINS(): number {
    return 2
  }

  /**
   * Returns a type descriptor to select the single source algorithm.
   */
  static get ALGORITHM_TYPE_SINGLE_SOURCE(): number {
    return 3
  }
}
