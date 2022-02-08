/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ChainSubstructures,
  CliqueSubstructures,
  CycleSubstructures,
  IGraph,
  IModelItem,
  ResultItemCollection,
  StarSubstructures,
  SubstructureItems,
  TreeSubstructures
} from 'yfiles'
import AlgorithmConfiguration from './AlgorithmConfiguration'
import { MultiColorNodeStyle } from './DemoStyles'

/**
 * Configuration options for the substructures algorithms.
 */
export default class SubstructuresConfig extends AlgorithmConfiguration {
  /**
   * Creates an instance of Substructures with default settings.
   */
  constructor(private readonly algorithmType: number) {
    super()
  }

  /**
   * Runs the chosen substructure algorithm.
   * @param graph The graph on which a path algorithm is executed.
   */
  runAlgorithm(graph: IGraph): void {
    // reset the graph to remove all previous markings
    this.resetGraph(graph)

    if (graph.nodes.size > 0) {
      // apply one of the path algorithms
      switch (this.algorithmType) {
        case SubstructuresConfig.CHAINS_SUBSTRUCTURES:
          this.findChains(graph)
          break
        case SubstructuresConfig.CLIQUES_SUBSTRUCTURES:
          this.findCliques(graph)
          break
        case SubstructuresConfig.CYCLES_SUBSTRUCTURES:
          this.findCycles(graph)
          break
        case SubstructuresConfig.STARS_SUBSTRUCTURES:
          this.findStars(graph)
          break
        case SubstructuresConfig.TREES_SUBSTRUCTURES:
        default:
          this.findTrees(graph)
          break
      }
    }
  }

  /**
   * Finds chain sub structures and marks the resulting substructures
   * @param graph the graph to run the algorithm on
   */
  findChains(graph: IGraph): void {
    const chainSubstructures = new ChainSubstructures({
      minimumSize: 2,
      edgeDirectedness: this.directed ? 1 : 0
    })
    const substructures = chainSubstructures.run(graph)
    this.markSubstructures(graph, substructures.chains)
  }

  /**
   * Finds clique sub structures and marks the resulting substructures
   * @param graph the graph to run the algorithm on
   */
  findCliques(graph: IGraph): void {
    const cliqueSubstructures = new CliqueSubstructures({
      minimumSize: 2
    })
    const substructures = cliqueSubstructures.run(graph)
    this.markSubstructures(graph, substructures.cliques)
  }

  /**
   * Finds cycle sub structures and marks the resulting substructures
   * @param graph the graph to run the algorithm on
   */
  findCycles(graph: IGraph): void {
    const cycleSubstructures = new CycleSubstructures({
      minimumSize: 2,
      edgeDirectedness: this.directed ? 1 : 0
    })
    const substructures = cycleSubstructures.run(graph)
    this.markSubstructures(graph, substructures.cycles)
  }

  /**
   * Finds star sub structures and marks the resulting substructures
   * @param graph the graph to run the algorithm on
   */
  findStars(graph: IGraph): void {
    const starSubstructures = new StarSubstructures({
      minimumSize: 3,
      edgeDirectedness: this.directed ? 1 : 0
    })
    const substructures = starSubstructures.run(graph)
    this.markSubstructures(graph, substructures.stars)
  }

  /**
   * Finds tree sub structures and marks the resulting substructures
   * @param graph the graph to run the algorithm on
   */
  findTrees(graph: IGraph): void {
    const treeSubstructures = new TreeSubstructures({
      minimumSize: 2,
      edgeDirectedness: this.directed ? 1 : 0
    })
    const substructures = treeSubstructures.run(graph)
    this.markSubstructures(graph, substructures.trees)
  }

  /**
   * Colorizes substructures found in graph
   * @param graph the graph to run the algorithm on
   * @param substructures found in graph
   */
  markSubstructures(graph: IGraph, substructures: ResultItemCollection<SubstructureItems>): void {
    this.resetGraphStyles(graph)

    // generate a color array
    const colors = this.generateColors(null)
    const numColors = colors.length

    substructures.forEach((substructure, index) => {
      const substructureMembers: IModelItem[] = []
      substructure.edges.forEach(edge => {
        if (graph.contains(edge)) {
          graph.setStyle(edge, this.getMarkedEdgeStyle(this.directed, index))
          const source = edge.sourceNode!
          const target = edge.targetNode!

          graph.setStyle(source, new MultiColorNodeStyle())
          graph.setStyle(target, new MultiColorNodeStyle())

          substructureMembers.push(edge)
          substructureMembers.push(source)
          substructureMembers.push(target)

          const substructureColor = colors[index % numColors]

          edge.tag = {
            id: edge.tag.id,
            color: substructureColor,
            components: [substructureMembers],
            edgeComponent: 0
          }
          source.tag = {
            id: source.tag.id,
            color: substructureColor,
            components: [substructureMembers],
            nodeComponents: [0]
          }
          target.tag = {
            id: target.tag.id,
            color: substructureColor,
            components: [substructureMembers],
            nodeComponents: [0]
          }
        }
      })
    })
  }

  /**
   * Resets the edge and node styles
   * @param graph the graph to reset the styles in
   */
  resetGraphStyles(graph: IGraph): void {
    graph.edges.forEach((edge, index) => {
      graph.setStyle(edge, graph.edgeDefaults.style)
      if (!edge.tag) {
        edge.tag = {}
      }
      edge.tag.id = index
    })

    graph.nodes.forEach((node, index) => {
      if (!node.tag) {
        node.tag = {}
      }
      node.tag.id = index
    })
  }

  /**
   * Returns the description text that explains the currently used substructure algorithm.
   * @return The description text.
   */
  get descriptionText(): string {
    switch (this.algorithmType) {
      case SubstructuresConfig.CHAINS_SUBSTRUCTURES:
        return (
          '<p>This part of the demo shows <em>chain</em> substructures in the graph.</p>' +
          '<p>A <em>chain</em> is a simple path consisting of nodes connected with edges.</p>' +
          '<p>If the algorithm is configured to take edge directedness into account, <em>all</em> ' +
          'edges along the path must point into the <em>same</em> direction, i.e. if the edge ' +
          'directions alter along the path, the path is not recognized as a chain substructure.</p> '
        )
      case SubstructuresConfig.CLIQUES_SUBSTRUCTURES:
        return (
          '<p>This part of the demo shows <em>cliques</em> substructures in the graph.</p>' +
          '<p>A <em>clique</em> is a subset of nodes that are all adjacent (i.e. connected) to each other.</p>' +
          '<p>Note that finding a maximum clique is NP-hard. Hence, only a simple heuristic approach ' +
          'that does not guarantee to find all/the largest clique(s) is used.</p>' +
          '<p>A node can only be contained in a single clique, i.e. the returned cliques are non-overlapping.</p>'
        )
      case SubstructuresConfig.CYCLES_SUBSTRUCTURES:
        return (
          '<p>This part of the demo shows <em>cycles</em> substructures in the graph.</p>' +
          '<p>A <em>cycle</em> is a simple path in which the first and last nodes are identical. ' +
          'The algorithm only considers cycles in which exactly one edge connects a cycle node ' +
          'with the rest of the graph, i.e. isolated cycles.</p>' +
          '<p>If the algorithm is configured to take edge directedness into account <em>all</em> ' +
          'edges along the path must point into the <em>same</em> direction, i.e. if the edge ' +
          'directions alter along the path, the path is not recognized as a cycle substructure.</p>'
        )
      case SubstructuresConfig.STARS_SUBSTRUCTURES:
        return (
          '<p>This part of the demo shows <em>star</em> substructures in the graph.</p>' +
          '<p>A <em>star</em> consists of a root that is connected to multiple nodes with degree one.</p>' +
          '<p>If edge directedness is taken into account, <em>all</em> edges must either point away from ' +
          'or towards the root node. If for a root node there are differing edge directions present ' +
          'the algorithm returns the largest star for the root node.</p>'
        )
      case SubstructuresConfig.TREES_SUBSTRUCTURES:
      default:
        return (
          '<p>This part of the demo shows <em>tree</em> substructures in the graph.</p>' +
          '<p>The root of a tree is the only node which may have non-tree edges.</p>' +
          '<p>If edge directedness is taken into account, all edges along the tree ' +
          'substructure must point into the same direction, i.e. from the root to the leafs.</p>'
        )
    }
  }

  /**
   * Returns a type descriptor to select the chains substructures algorithm
   */
  static get CHAINS_SUBSTRUCTURES(): number {
    return 0
  }

  /**
   * Returns a type descriptor to select the cliques substructures algorithm
   */
  static get CLIQUES_SUBSTRUCTURES(): number {
    return 1
  }

  /**
   * Returns a type descriptor to select the cycles substructures algorithm
   */
  static get CYCLES_SUBSTRUCTURES(): number {
    return 2
  }

  /**
   * Returns a type descriptor to select the stars substructures algorithm
   */
  static get STARS_SUBSTRUCTURES(): number {
    return 3
  }

  /**
   * Returns a type descriptor to select the trees substructures algorithm
   */
  static get TREES_SUBSTRUCTURES(): number {
    return 4
  }
}
