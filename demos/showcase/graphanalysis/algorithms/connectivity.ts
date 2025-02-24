/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BiconnectedComponents,
  ConnectedComponents,
  type IGraph,
  KCoreComponents,
  Reachability,
  StronglyConnectedComponents
} from '@yfiles/yfiles'
import { type AlgorithmConfig, markItem } from './algorithms'

/**
 * Description of the algorithm which finds connected components.
 */
export const connectedComponentsDescription = `
  <p>This part of the demo shows the <em>connected components</em> of the given graph.</p>
  <p>Nodes and edges that belong to the same component share the same color.</p>`

/**
 * Calculates the connected components of the given graph.
 */
export function calculateConnectedComponents(graph: IGraph): void {
  const result = new ConnectedComponents().run(graph)

  result.components.forEach((component, componentIndex) => {
    component.nodes.forEach((node) => markItem(node, componentIndex))
    component.inducedEdges.forEach((edge) => markItem(edge, componentIndex))
  })
}

/**
 * Description of the algorithm which finds biconnected components.
 */
export const biconnectedComponentsDescription = `
  <p>This part of the demo shows the <em>biconnected components</em> of the given graph.</p>
  <p>Nodes and edges that belong to the same component share the same color. <em>Articulation points</em>
  present all colors of the corresponding components. A component can be brought to focus by selecting the color at an articulation point.</p>`

/**
 * Calculates the biconnected components of the given graph.
 */
export function calculateBiconnectedComponents(graph: IGraph): void {
  const result = new BiconnectedComponents().run(graph)

  result.components.forEach((component, componentIndex) => {
    component.nodes.forEach((node) => {
      markItem(node, componentIndex)
    })
    component.edges.forEach((edge) => {
      markItem(edge, componentIndex)
    })
  })
}

/**
 * Description of the algorithm which finds strongly connected components.
 */
export const stronglyConnectedComponentsDescription = `
  <p>This part of the demo shows the <em>strongly connected components</em> of the given graph.</p>
  <p>Nodes and edges that belong to the same component share the same color.</p>`

/**
 * Calculates the strongly connected components of the given graph.
 */
export function calculateStronglyConnectedComponents(graph: IGraph): void {
  const result = new StronglyConnectedComponents().run(graph)

  result.components.forEach((component, componentIndex) => {
    component.nodes.forEach((node) => markItem(node, componentIndex))
    component.inducedEdges.forEach((edge) => markItem(edge, componentIndex))
  })
}

/**
 * Description of the algorithm which finds all reachable nodes from a marked node.
 */
export const reachabilityDescription = `
  <p>This part of the demo highlights the set of nodes that are <em>reachable</em> in the given
  graph when starting from the marked source. The source can be marked using the <em>Context Menu</em>.
  If no node is marked as the source, a random node will be selected.</p>
  <p>The algorithm can take the direction of edges into account.</p>`

/**
 * Calculates the nodes reachable from the marked node.
 */
export function calculateReachableNodes(graph: IGraph, config: AlgorithmConfig): void {
  if (graph.nodes.size <= 0) {
    return
  }

  const markedSource = config.startNodes?.[0] || graph.nodes.last()!

  const result = new Reachability({
    directed: config.directed,
    startNodes: markedSource
  }).run(graph)

  result.reachableNodes.forEach((node) => {
    markItem(node, 0)
  })

  graph.edges
    .filter((edge) => result.isReachable(edge.sourceNode) && result.isReachable(edge.targetNode))
    .forEach((edge) => {
      markItem(edge, 0)
    })
}

/**
 * Description of the algorithm which finds k-core components.
 */
export const kCoreComponentsDescription = `
  <p>This part of the demo shows the <em>k-core</em> of the given graph.</p>
  <p>The k-core of an undirected input graph consists of the subgraph components where each node has at least degree k.</p>
  <p>Nodes and edges can be members of multiple k-cores. Choose a nodes' color to highlight the k-core related to this color.</p>
  <p>The number in every node represents the <em>highest</em> k-Core the node belongs to.</p>
  <p>The k-Core for k=0 is not visualized in this demo, as <em>every</em> node is a member.</p>`

/**
 * Calculates the k-core components of the given graph.
 */
export function calculateKCoreComponents(graph: IGraph): void {
  if (graph.nodes.size === 0) {
    return
  }

  const result = new KCoreComponents().run(graph)

  const maximumK = result.maximumK
  if (maximumK === 0) {
    return
  }

  for (let k = maximumK; k > 0; k--) {
    const kCore = result.getKCore(k)

    kCore.forEach((node) => markItem(node, k))

    graph.edges
      .filter((edge) => kCore.contains(edge.sourceNode) && kCore.contains(edge.targetNode))
      .forEach((edge) => markItem(edge, k))
  }

  const kCores = result.kCores
  graph.nodes.forEach((node) => graph.addLabel({ owner: node, text: String(kCores.get(node)) }))
}
