/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component', './AlgorithmConfiguration', './DemoStyles.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  AlgorithmConfiguration,
  demoStyles
) => {
  /**
   * Configuration options for the Connectivity Algorithms.
   */
  class ConnectivityConfig extends AlgorithmConfiguration {
    /**
     * Creates an instance of ConnectivityConfig with default settings.
     * @param {number} algorithmType
     */
    constructor(algorithmType) {
      super()
      this.$algorithmType = algorithmType
      this.$markedSource = null
    }

    /**
     * Specifies the marked node.
     * @param {yfiles.graph.INode} markedSource the marked node
     */
    set markedSource(markedSource) {
      this.$markedSource = markedSource
    }

    /**
     * Returns the marked node.
     * @return {yfiles.graph.INode} the marked node
     */
    get markedSource() {
      return this.$markedSource
    }

    /**
     * Returns which connectivity algorithm is used.
     * @return {number}
     */
    get algorithmType() {
      return this.$algorithmType
    }

    /**
     * Runs the selected connectivity algorithm.
     * @param {yfiles.view.GraphComponent} graphComponent the graph component on which a connectivity algorithm is
     *   executed
     */
    runAlgorithm(graphComponent) {
      switch (this.algorithmType) {
        case ConnectivityConfig.BICONNECTED_COMPONENTS:
          this.calculateBiconnectedComponents(graphComponent)
          break
        case ConnectivityConfig.STRONGLY_CONNECTED_COMPONENTS:
          this.calculateConnectedComponents(graphComponent, false)
          break
        case ConnectivityConfig.REACHABILITY:
          this.calculateReachableNodes(graphComponent)
          break
        case ConnectivityConfig.CONNECTED_COMPONENTS:
        default:
          this.calculateConnectedComponents(graphComponent, true)
          break
      }
    }

    /**
     * Calculates the connected components of the given graph.
     * @param {yfiles.graph.IGraph} graph The graph whose components are determined.
     * @param {number} algorithm The selected algorithm.
     */
    calculateConnectedComponents(graph, algorithm) {
      const graphAdapter = new yfiles.layout.YGraphAdapter(graph)
      const components = graphAdapter.yGraph.createNodeMap()
      let compNum

      if (algorithm) {
        compNum = yfiles.algorithms.GraphConnectivity.connectedComponents(
          graphAdapter.yGraph,
          components
        )
      } else {
        compNum = yfiles.algorithms.GraphConnectivity.stronglyConnectedComponents(
          graphAdapter.yGraph,
          components
        )
      }

      if (compNum > 0) {
        // find the components that are affected by the use move, if any
        const affectedComponents = this.getAffectedNodeComponents(components, graphAdapter)

        // create the array with the components needed for the node/edge style
        const allComponents = []
        for (let i = 0; i < compNum; i++) {
          allComponents[i] = []
        }

        graph.nodes.forEach(node => {
          const componentIdx = components.getInt(graphAdapter.getCopiedNode(node))
          allComponents[componentIdx].push(node)
        })

        graph.edges.forEach(edge => {
          const sourceComponentIdx = components.getInt(graphAdapter.getCopiedNode(edge.sourceNode))
          const targetComponentIdx = components.getInt(graphAdapter.getCopiedNode(edge.targetNode))

          if (sourceComponentIdx === targetComponentIdx) {
            allComponents[sourceComponentIdx].push(edge)
          }
        })

        // this is the component with the larger number of elements
        const largestComponentIdx = this.getLargestComponentIndex(affectedComponents, allComponents)
        // holds the color of the affected components
        const color2AffectedComponent = new Map()
        // generate a color array
        const colors = this.generateColors(null)

        // sets the style/tag for the nodes
        graph.nodes.forEach((node, index) => {
          const componentIdx = components.getInt(graphAdapter.getCopiedNode(node))
          graph.setStyle(node, new demoStyles.MultiColorNodeStyle())
          const color = this.determineElementColor(
            colors,
            componentIdx,
            affectedComponents,
            color2AffectedComponent,
            largestComponentIdx,
            allComponents,
            graph,
            node
          )
          node.tag = {
            id: index,
            color,
            components: allComponents,
            nodeComponents: [componentIdx]
          }
        })

        // sets the style/tag for the edges
        graph.edges.forEach((edge, index) => {
          const sourceComponentIdx = components.getInt(graphAdapter.getCopiedNode(edge.sourceNode))
          const targetComponentIdx = components.getInt(graphAdapter.getCopiedNode(edge.targetNode))
          if (sourceComponentIdx === targetComponentIdx) {
            graph.setStyle(edge, this.getMarkedEdgeStyle(false, sourceComponentIdx, null))
            edge.tag = {
              id: index,
              color: edge.sourceNode.tag.color,
              components: allComponents,
              edgeComponent: sourceComponentIdx
            }
          }
        })
      }

      // clean up
      graphAdapter.yGraph.disposeNodeMap(components)
      if (this.incrementalElements !== null) {
        this.incrementalElements.clear()
        this.incrementalElements = null
        this.edgeRemoved = false
      }
    }

    /**
     * Calculates the biconnected components of the given graph.
     * @param {yfiles.graph.IGraph} graph The graph whose biconnected components are determined.
     */
    calculateBiconnectedComponents(graph) {
      const graphAdapter = new yfiles.layout.YGraphAdapter(graph)
      const biconnectedComponents = graphAdapter.yGraph.createEdgeMap()
      const articulationPoints = graphAdapter.yGraph.createNodeMap()

      const bicompNum = yfiles.algorithms.GraphConnectivity.biconnectedComponents(
        graphAdapter.yGraph,
        biconnectedComponents,
        articulationPoints
      )

      if (bicompNum > 0) {
        // find the components that are affected by the use move, if any
        const affectedComponents = this.getAffectedEdgeComponents(
          biconnectedComponents,
          graph,
          graphAdapter
        )

        // create the array with the components needed for the node/edge style
        const allComponents = []
        for (let i = 0; i < bicompNum; i++) {
          allComponents[i] = []
        }

        graph.edges.forEach(edge => {
          const componentIdx = biconnectedComponents.getInt(graphAdapter.getCopiedEdge(edge))
          if (componentIdx >= 0) {
            allComponents[componentIdx].push(edge)
            allComponents[componentIdx].push(edge.sourceNode)
            allComponents[componentIdx].push(edge.targetNode)
          }
        })

        // this is the component with the larger number of elements
        const largestComponentIdx = this.getLargestComponentIndex(affectedComponents, allComponents)
        // holds the color of the affected components
        const color2AffectedComponent = new Map()
        // generate a color array
        const colors = this.generateColors(null)

        // sets the style/tag for the edges
        graph.edges.forEach((edge, index) => {
          const componentIdx = biconnectedComponents.getInt(graphAdapter.getCopiedEdge(edge))
          let color
          if (componentIdx >= 0) {
            graph.setStyle(edge, this.getMarkedEdgeStyle(false, componentIdx, null))
            graph.setStyle(edge.sourceNode, new demoStyles.MultiColorNodeStyle())
            graph.setStyle(edge.targetNode, new demoStyles.MultiColorNodeStyle())

            color = this.determineElementColor(
              colors,
              componentIdx,
              affectedComponents,
              color2AffectedComponent,
              largestComponentIdx,
              allComponents,
              graph,
              edge
            )
          }
          edge.tag = {
            id: index,
            color,
            components: allComponents,
            edgeComponent: componentIdx
          }
        })

        // sets the style/tag for the edges
        const articulationNodes = []
        graph.nodes.forEach((node, index) => {
          const isArticulationPoint = articulationPoints.getBoolean(
            graphAdapter.getCopiedNode(node)
          )

          let color
          let nodeComponents
          if (graph.edgesAt(node, yfiles.graph.AdjacencyTypes.ALL).size === 0) {
            graph.setStyle(node, graph.nodeDefaults.style)
          } else {
            if (isArticulationPoint) {
              articulationNodes.push(node)
            }
            // get the first edge with non-negative component index of the node
            const edge = this.findEdgeInBiconnectedComponent(
              graph,
              node,
              biconnectedComponents,
              graphAdapter
            )
            // if an edge exists, use its color
            color = edge !== null ? edge.tag.color : null
            nodeComponents =
              edge !== null ? [biconnectedComponents.getInt(graphAdapter.getCopiedEdge(edge))] : []
          }

          node.tag = {
            id: index,
            color,
            components: allComponents,
            nodeComponents
          }
        })

        // reset the style/tag for the articulation points
        articulationNodes.forEach(node => {
          const visitedComponents = {}
          graph.setStyle(node, new demoStyles.MultiColorNodeStyle())
          const components = []
          let color

          graph.edgesAt(node, yfiles.graph.AdjacencyTypes.ALL).forEach(edge => {
            const componentIdx = biconnectedComponents.getInt(graphAdapter.getCopiedEdge(edge))
            if (!visitedComponents[componentIdx]) {
              visitedComponents[componentIdx] = componentIdx
              components.push(componentIdx)
              color = edge.tag.color
            }
          })
          node.tag = {
            id: node.tag.id,
            color,
            components: allComponents,
            nodeComponents: components
          }
        })
      }

      // clean up
      graphAdapter.yGraph.disposeEdgeMap(biconnectedComponents)
      graphAdapter.yGraph.disposeNodeMap(articulationPoints)
      if (this.incrementalElements !== null) {
        this.incrementalElements.clear()
        this.incrementalElements = null
        this.edgeRemoved = false
      }
    }

    /**
     * Calculates the nodes reachable from the marked node.
     * @param {yfiles.graph.IGraph} graph The graph in which all reachable nodes are determined.
     */
    calculateReachableNodes(graph) {
      this.resetGraph(graph)

      const graphAdapter = new yfiles.layout.YGraphAdapter(graph)

      if (graph.nodes.size > 0) {
        const reached = new Array(graph.nodes.count)
        if (this.markedSource === null || !graph.contains(this.markedSource)) {
          this.markedSource = graph.nodes.first()
        }
        const sourceNode = graphAdapter.getCopiedNode(this.markedSource)

        yfiles.algorithms.GraphConnectivity.reachable(
          graphAdapter.yGraph,
          sourceNode,
          this.directed,
          reached
        )

        const allReachable = [[]]

        graph.nodes.forEach(node => {
          const index = graphAdapter.getCopiedNode(node).index
          if (reached[index]) {
            graph.setStyle(node, new demoStyles.MultiColorNodeStyle())
            allReachable[0].push(node)
            node.tag = {
              id: index,
              color: null,
              components: allReachable,
              nodeComponents: [0]
            }
          }
        })

        graph.edges.forEach((edge, index) => {
          const sourceIndex = graphAdapter.getCopiedNode(edge.sourceNode).index
          const targetIndex = graphAdapter.getCopiedNode(edge.targetNode).index
          if (reached[sourceIndex] && reached[targetIndex]) {
            graph.setStyle(edge, this.getMarkedEdgeStyle(this.directed, 0, null))
            allReachable[0].push(edge)
            edge.tag = {
              id: index,
              color: null,
              components: allReachable,
              edgeComponent: 0
            }
          }
        })

        graph.setStyle(
          graphAdapter.getOriginalNode(sourceNode),
          this.getSourceTargetNodeStyle(true, false)
        )
      }
    }

    /**
     * Returns the first edge with non-negative component index of the given node.
     * @param {yfiles.graph.IGraph} graph the given graph
     * @param {yfiles.graph.INode} node the given node
     * @param {yfiles.algorithms.IEdgeMap} biconnectedComponents the edge-map that holds the result of the biconnected
     *   components algorithm
     * @param {yfiles.layout.YGraphAdapter} graphAdapter the adapter to run the algorithm
     */
    findEdgeInBiconnectedComponent(graph, node, biconnectedComponents, graphAdapter) {
      let edge = null
      graph.edgesAt(node, yfiles.graph.AdjacencyTypes.ALL).forEach(incidentEdge => {
        if (biconnectedComponents.getInt(graphAdapter.getCopiedEdge(incidentEdge)) >= 0) {
          edge = incidentEdge
        }
      })
      return edge
    }

    /**
     * Adds a context menu to mark the source node for the reachability algorithm.
     * @param {object} contextMenu the context menu to which the entries are added
     * @param {yfiles.graph.IModelItem} item the item that is affected by this context menu
     * @param {yfiles.view.GraphComponent} graphComponent the given graph component
     */
    populateContextMenu(contextMenu, item, graphComponent) {
      if (this.algorithmType === ConnectivityConfig.REACHABILITY) {
        const graph = graphComponent.graph
        if (yfiles.graph.INode.isInstance(item)) {
          contextMenu.addMenuItem('Mark As Source', () => {
            this.markedSource = item
            this.resetGraph(graph)
            this.calculateReachableNodes(graph)
          })
        }
      }
    }

    /**
     * Returns the description text for the connectivity algorithms.
     * @returns {string} the description text for the connectivity algorithms
     */
    get descriptionText() {
      switch (this.algorithmType) {
        case ConnectivityConfig.BICONNECTED_COMPONENTS:
          return (
            '<p>This part of the demo shows the <em>biconnected components</em> of the given graph.</p><p>Nodes and edges that belong to the same component share the same color. <em>Articulation points</em> ' +
            'present all colors of the corresponding components. A component can be brought to focus by selecting the color at an articulation point.</p>'
          )
        case ConnectivityConfig.STRONGLY_CONNECTED_COMPONENTS:
          return '<p>This part of the demo shows the <em>strongly connected components</em> of the given graph.</p><p>Nodes and edges that belong to the same component share the same color.</p>'
        case ConnectivityConfig.REACHABILITY:
          return (
            '<p>This part of the demo highlights the set of nodes that are <em>reachable</em> in the given graph when starting from the marked source. The source can be marked using the <em>Context Menu</em>. If no node is marked as source, a random node will be selected.</p>' +
            '<p>The algorithm can take the direction of edges into account.</p>'
          )
        case ConnectivityConfig.CONNECTED_COMPONENTS:
        default:
          return '<p>This part of the demo shows the <em>connected components</em> of the given graph.</p><p>Nodes and edges that belong to the same component share the same color.</p>'
      }
    }

    /**
     * Static field for CONNECTED_COMPONENTS
     * @return {number}
     */
    static get CONNECTED_COMPONENTS() {
      return 0
    }

    /**
     * Static field for BICONNECTED_COMPONENTS
     * @return {number}
     */
    static get BICONNECTED_COMPONENTS() {
      return 1
    }

    /**
     * Static field for STRONGLY_CONNECTED_COMPONENTS
     * @return {number}
     */
    static get STRONGLY_CONNECTED_COMPONENTS() {
      return 2
    }

    /**
     * Static field for REACHABILITY
     * @return {number}
     */
    static get REACHABILITY() {
      return 3
    }
  }

  return ConnectivityConfig
})
