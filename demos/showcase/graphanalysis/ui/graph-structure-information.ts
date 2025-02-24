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
  type GraphComponent,
  type GraphEditorInputMode,
  GraphStructureAnalyzer,
  type IGraph
} from '@yfiles/yfiles'
import './graph-structure-information.css'

/**
 * Registers listener to graph changes to update the graph information.
 */
export function initializeGraphInformation(graphComponent: GraphComponent): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  inputMode.addEventListener('deleting-selection', async () => {
    updateGraphInformation(graphComponent)
  })

  inputMode.addEventListener('deleted-selection', async () => {
    updateGraphInformation(graphComponent)
  })

  // edge creation
  inputMode.createEdgeInputMode.addEventListener('edge-created', async () => {
    updateGraphInformation(graphComponent)
  })

  inputMode.addEventListener('edge-ports-changed', async () => {
    updateGraphInformation(graphComponent)
  })

  inputMode.addEventListener('node-created', () => {
    updateGraphInformation(graphComponent)
  })

  const engine = graphComponent.graph.undoEngine
  if (engine) {
    engine.addEventListener('unit-redone', () => updateGraphInformation(graphComponent))
    engine.addEventListener('unit-undone', () => updateGraphInformation(graphComponent))
  }
}

/**
 * Updates the table that holds information about the graph.
 */
export function updateGraphInformation(graphComponent: GraphComponent): void {
  // clear table
  const table = document.getElementById('graph-structure-information')!

  // fill table with updated information
  const graph = graphComponent.graph

  updateNumberOfElements(graph, table.querySelector('#graph-elements')!)
  updateStructureAnalysis(graph, table.querySelector('#structure-analysis')!)
}

/**
 * Returns the number of nodes in the given graph.
 */
function getNodeCount(graph: IGraph): number {
  return graph.nodes.size
}

/**
 * Returns the number of edges in the given graph.
 */
function getEdgeCount(graph: IGraph): number {
  return graph.edges.size
}

/**
 * Checks whether the given graph is acyclic.
 */
function isAcyclic(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.isAcyclic(false)
}

/**
 * Checks whether the given graph is bipartite.
 */
function isBipartite(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.isBipartite()
}

/**
 * Checks whether the given graph is connected.
 */
function isConnected(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.isConnected()
}

/**
 * Checks whether the given graph is biconnected.
 */
function isBiconnected(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.isBiconnected()
}

/**
 * Checks whether the given graph is strongly connected.
 */
function isStronglyConnected(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.isStronglyConnected()
}

/**
 * Checks whether the given graph is planar.
 */
function isPlanar(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.isPlanar()
}

/**
 * Checks whether the given graph is a tree.
 */
function isTree(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.isTree(false)
}

/**
 * Checks whether the given graph contains self-loop edges.
 */
function hasSelfLoops(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.hasSelfLoops()
}

/**
 * Checks whether the given graph has multiple edges between any two nodes.
 */
function hasMultipleEdges(graph: IGraph): boolean {
  const structureAnalyzer = new GraphStructureAnalyzer(graph)
  return structureAnalyzer.hasMultiEdges()
}

/**
 * Updates the number of graph elements the panel.
 */
function updateNumberOfElements(graph: IGraph, container: HTMLDivElement): void {
  while (container.childElementCount > 0) {
    container.lastElementChild?.remove()
  }

  ;['Nodes', 'Edges'].forEach((element) => {
    const row = document.createElement('div')
    row.classList.add('row', 'bold')
    container.appendChild(row)

    const name = document.createElement('div')
    name.className = 'name'
    const elementCount = element === 'Nodes' ? getNodeCount(graph) : getEdgeCount(graph)
    name.appendChild(document.createTextNode(`Number of ${element}`))

    const result = document.createElement('div')
    result.className = 'value'
    result.appendChild(document.createTextNode(elementCount.toString()))

    row.appendChild(name)
    row.appendChild(result)
  })
}

/**
 * Updates the results of structure analysis in the panel.
 */
function updateStructureAnalysis(graph: IGraph, container: Element): void {
  while (container.childElementCount > 0) {
    container.lastElementChild?.remove()
  }

  structureAnalysis.forEach((algorithm) => {
    const row = document.createElement('div')
    row.className = 'row'
    container.appendChild(row)

    const name = document.createElement('div')
    name.className = 'name'
    const result = algorithm.apply(graph)
    name.appendChild(document.createTextNode(algorithm.name))
    name.classList.add(result ? 'applicable' : 'inapplicable')

    const infoButton = document.createElement('div')
    infoButton.className = 'value'
    const a = document.createElement('a')
    const image = document.createElement('div')
    image.className = 'info-link'
    image.title = `Definition of ${algorithm.name}`
    a.appendChild(image)
    a.href = algorithm.url ?? ''
    a.target = '_blank'
    infoButton.appendChild(a)

    row.appendChild(name)
    row.appendChild(infoButton)
  })
}

/**
 * List of all structural analysis algorithms whose results are displayed in the panel.
 */
const structureAnalysis: { name: string; apply: (graph: IGraph) => boolean; url?: string }[] = [
  {
    name: 'Acyclic',
    apply: isAcyclic,
    url: 'https://en.wikipedia.org/wiki/Cycle_(graph_theory)'
  },
  {
    name: 'Bipartite',
    apply: isBipartite,
    url: 'https://en.wikipedia.org/wiki/Bipartite_graph'
  },
  {
    name: 'Connected',
    apply: isConnected,
    url: 'https://en.wikipedia.org/wiki/Connectivity_(graph_theory)'
  },
  {
    name: 'Biconnected',
    apply: isBiconnected,
    url: 'https://en.wikipedia.org/wiki/Biconnected_graph'
  },
  {
    name: 'Strongly Connected',
    apply: isStronglyConnected,
    url: 'https://en.wikipedia.org/wiki/Strongly_connected_component'
  },
  { name: 'Planar', apply: isPlanar, url: 'https://en.wikipedia.org/wiki/Planar_graph' },
  { name: 'Tree', apply: isTree, url: 'https://en.wikipedia.org/wiki/Tree_(graph_theory)' },
  {
    name: 'Self-Loops',
    apply: hasSelfLoops,
    url: 'https://en.wikipedia.org/wiki/Loop_(graph_theory)'
  },
  {
    name: 'Multiple Edges',
    apply: hasMultipleEdges,
    url: 'https://en.wikipedia.org/wiki/Multiple_edges'
  }
]
