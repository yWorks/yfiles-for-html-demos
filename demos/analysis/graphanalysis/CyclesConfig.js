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
import { ConnectedComponents, CycleEdges, IEdge, IGraph, IModelItem, INode, Mapper } from 'yfiles'
import { AlgorithmConfiguration } from './AlgorithmConfiguration.js'
import { MultiColorNodeStyle } from './DemoStyles.js'

/**
 * Configuration options for the cycles algorithm.
 */
export class CyclesConfig extends AlgorithmConfiguration {
  /**
   * Creates an instance of CyclesConfig with default settings.
   */
  constructor() {
    super()
    this.cycleEdges = null
    this.incrementalElements = null
    this.edgeRemoved = false
  }

  /**
   * Finds edges that belong to a cycle in the graph.
   * @param {!IGraph} graph The graph on which the cycle algorithm is executed.
   */
  runAlgorithm(graph) {
    // reset cycles to remove previous markings
    this.resetCycles(graph)

    // find all edges that belong to a cycle
    const result = new CycleEdges({ directed: this.directed }).run(graph)
    this.cycleEdges = result.edges.toArray()
    this.markCycles(graph)
  }

  /**
   * Adds different styles to independent cycles.
   * If some nodes or edges are selected only cycles that depend on them are marked.
   * @param {!IGraph} graph The graph whose cycles are marked.
   */
  markCycles(graph) {
    if (this.cycleEdges === null) {
      return
    }

    // finds the edges that belong to the same component (without non-cycle edges) and treats them as dependent
    const result = new ConnectedComponents({
      subgraphEdges: this.cycleEdges
    }).run(graph)

    // find the components that are affected by the use move, if any
    const affectedComponents = this.getAffectedNodeComponents(result.nodeComponentIds, graph)

    const allCycles = []
    for (let i = 0; i < result.components.size; i++) {
      allCycles[i] = []
    }

    // create the array with the components needed for the node/edge style
    this.cycleEdges.forEach(cycleEdge => {
      const source = cycleEdge.sourceNode
      const target = cycleEdge.targetNode

      const componentIndex = result.nodeComponentIds.get(source)

      allCycles[componentIndex].push(cycleEdge)
      allCycles[componentIndex].push(source)
      allCycles[componentIndex].push(target)
    })

    // this is the component with the larger number of elements
    const largestComponentIdx = this.getLargestComponentIndex(affectedComponents, allCycles)
    // holds the color of the affected components
    const affectedComponent2Color = new Map()
    // generate a color array
    const colors = this.generateColors(null)

    const cyclesNodeSet = new Set()

    graph.nodes.forEach((node, index) => {
      if (!node.tag) {
        node.tag = {}
      }
      node.tag.id = index
    })

    const cycleEdgeSet = new Set(this.cycleEdges)

    // change the styles for the nodes and edges that belong to a cycle
    graph.edges.forEach((edge, index) => {
      const source = edge.sourceNode
      const target = edge.targetNode

      const componentIndex = result.nodeComponentIds.get(source)
      let color
      if (cycleEdgeSet.has(edge)) {
        color = this.determineElementColor(
          colors,
          componentIndex,
          affectedComponents,
          affectedComponent2Color,
          largestComponentIdx,
          allCycles,
          graph,
          edge
        )
        graph.setStyle(edge, this.getMarkedEdgeStyle(this.directed, componentIndex))
        edge.tag = {
          id: index,
          color,
          components: allCycles,
          edgeComponent: componentIndex
        }

        if (!cyclesNodeSet.has(source)) {
          cyclesNodeSet.add(source)
          graph.setStyle(source, new MultiColorNodeStyle())
          source.tag = {
            id: source.tag.id,
            color,
            components: allCycles,
            nodeComponents: [componentIndex]
          }
        }
        if (!cyclesNodeSet.has(target)) {
          cyclesNodeSet.add(target)
          graph.setStyle(target, new MultiColorNodeStyle())
          target.tag = {
            id: target.tag.id,
            color,
            components: allCycles,
            nodeComponents: [componentIndex]
          }
        }
      } else {
        graph.setStyle(edge, graph.edgeDefaults.style)
        edge.tag = {
          id: index,
          color,
          components: allCycles,
          edgeComponent: 0
        }
      }
    })

    // for all edges that do not belong to the cycle, reset the style to default
    graph.nodes.forEach(node => {
      if (!cyclesNodeSet.has(node)) {
        graph.setStyle(node, graph.nodeDefaults.style)
      }
    })

    // clean up
    if (this.incrementalElements !== null) {
      this.incrementalElements.clear()
      this.incrementalElements = null
      this.edgeRemoved = false
    }
  }

  /**
   * Resets the style of all edges that belong to a cycle.
   * @param {!IGraph} graph
   */
  resetCycles(graph) {
    // reset style of previous cycle edges
    if (this.cycleEdges != null) {
      this.cycleEdges.forEach(cycleEdge => {
        if (graph.contains(cycleEdge)) {
          const defaultEdgeStyle = graph.edgeDefaults.style
          graph.setStyle(cycleEdge, defaultEdgeStyle)

          const defaultNodeStyle = graph.nodeDefaults.style
          graph.setStyle(cycleEdge.sourceNode, defaultNodeStyle)
          graph.setStyle(cycleEdge.targetNode, defaultNodeStyle)
        }
      })
    }
  }

  /**
   * Returns the description text that explains the cycle algorithm.
   * @returns The description text.
   * @type {!string}
   */
  get descriptionText() {
    return "<p style='margin-top:0'>Finding <em>cycles in a graph</em> is part of analysing graph structures. This part of the demo shows an algorithm that finds edges that belong to a cycle in a graph.</p><p>Independent cycles are presented with different colors. Cycles which share common nodes and edges get the same color. This algorithm is able to take the <em>direction of edges</em> into account.</p>"
  }
}
