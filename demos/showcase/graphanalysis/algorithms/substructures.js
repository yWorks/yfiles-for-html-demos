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
  ChainSubstructures,
  CliqueSubstructures,
  CycleSubstructures,
  StarSubstructures,
  TreeSubstructures
} from '@yfiles/yfiles'
import { markItem } from './algorithms'

/**
 * Description of the algorithm which determines chain substructures in the graph.
 */
export const chainsSubstructuresDescription = `
  <p>This part of the demo shows <em>chain</em> substructures in the graph.</p>
  <p>A <em>chain</em> is a simple path consisting of nodes connected with edges.</p>
  <p>If the algorithm is configured to take edge directedness into account, <em>all</em>
  edges along the path must point into the <em>same</em> direction, i.e. if the edge
  directions alter along the path, the path is not recognized as a chain substructure.</p>`

/**
 * Calculates the chain substructures in the graph in the given graph.
 */
export function calculateChainSubstructures(graph, config) {
  const chainSubstructures = new ChainSubstructures({
    minimumSize: 2,
    edgeDirectedness: config.directed ? 1 : 0
  })
  const substructures = chainSubstructures.run(graph)

  substructures.chains.forEach((chain, chainIndex) => {
    chain.nodes.forEach((node) => {
      markItem(node, chainIndex)
    })
    chain.edges.forEach((edge) => {
      markItem(edge, chainIndex)
    })
  })
}

/**
 * Description of the algorithm which determines cycle substructures in the graph.
 */
export const cycleSubstructuresDescription = `
  <p>This part of the demo shows <em>cycles</em> substructures in the graph.</p>
  <p>A <em>cycle</em> is a simple path in which the first and last nodes are identical.
  The algorithm only considers cycles in which exactly one edge connects a cycle node
  with the rest of the graph, i.e. isolated cycles.</p>
  <p>If the algorithm is configured to take edge directedness into account <em>all</em>
  edges along the path must point into the <em>same</em> direction, i.e. if the edge
  directions alter along the path, the path is not recognized as a cycle substructure.</p>`

/**
 * Calculates the cycle substructures in the graph in the given graph.
 */
export function calculateCycleSubstructures(graph, config) {
  const cycleSubstructures = new CycleSubstructures({
    minimumSize: 2,
    edgeDirectedness: config.directed ? 1 : 0
  })
  const substructures = cycleSubstructures.run(graph)

  substructures.cycles.forEach((cycle, cycleIndex) => {
    cycle.nodes.forEach((node) => {
      markItem(node, cycleIndex)
    })
    cycle.edges.forEach((edge) => {
      markItem(edge, cycleIndex)
    })
  })
}

/**
 * Description of the algorithm which determines star substructures in the graph.
 */
export const starSubstructuresDescription = `
  <p>This part of the demo shows <em>star</em> substructures in the graph.</p>
  <p>A <em>star</em> consists of a root that is connected to multiple nodes with degree one.</p>
  <p>If edge directedness is taken into account, <em>all</em> edges must either point away from
  or towards the root node. If for a root node there are differing edge directions present
  the algorithm returns the largest star for the root node.</p>`

/**
 * Calculates the star substructures in the graph in the given graph.
 */
export function calculateStarSubstructures(graph, config) {
  const starSubstructures = new StarSubstructures({
    minimumSize: 3,
    edgeDirectedness: config.directed ? 1 : 0
  })
  const substructures = starSubstructures.run(graph)

  substructures.stars.forEach((star, starIndex) => {
    star.nodes.forEach((node) => {
      markItem(node, starIndex)
    })
    star.edges.forEach((edge) => {
      markItem(edge, starIndex)
    })
  })
}

/**
 * Description of the algorithm which determines tree substructures in the graph.
 */
export const treeSubstructuresDescription = `
  <p>This part of the demo shows <em>tree</em> substructures in the graph.</p>
  <p>The root of a tree is the only node which may have non-tree edges.</p>
  <p>If edge directedness is taken into account, all edges along the tree
  substructure must point into the same direction, i.e. from the root to the leafs.</p>`

/**
 * Calculates the tree substructures in the graph in the given graph.
 */
export function calculateTreeSubstructures(graph, config) {
  const treeSubstructures = new TreeSubstructures({
    minimumSize: 2,
    edgeDirectedness: config.directed ? 1 : 0
  })
  const substructures = treeSubstructures.run(graph)

  substructures.trees.forEach((tree, treeIndex) => {
    tree.nodes.forEach((node) => {
      markItem(node, treeIndex)
    })
    tree.edges.forEach((edge) => {
      markItem(edge, treeIndex)
    })
  })
}

/**
 * Description of the algorithm which determines clique substructures in the graph.
 */
export const cliquesSubstructuresDescription = `
  <p>This part of the demo shows <em>cliques</em> substructures in the graph.</p>
  <p>A <em>clique</em> is a subset of nodes that are all adjacent (i.e. connected) to each other.</p>
  <p>Note that finding a maximum clique is NP-hard. Hence, only a simple heuristic approach
  that does not guarantee to find all/the largest clique(s) is used.</p>
  <p>A node can only be contained in a single clique, i.e. the returned cliques are non-overlapping.</p>`

/**
 * Calculates the clique substructures in the graph in the given graph.
 */
export function calculateCliqueSubstructures(graph) {
  const cliqueSubstructures = new CliqueSubstructures({ minimumSize: 2 })
  const substructures = cliqueSubstructures.run(graph)

  substructures.cliques.forEach((clique, cliqueIndex) => {
    clique.nodes.forEach((node) => {
      markItem(node, cliqueIndex)
    })
    clique.edges.forEach((edge) => {
      markItem(edge, cliqueIndex)
    })
  })
}
