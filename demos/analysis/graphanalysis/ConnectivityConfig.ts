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
  AdjacencyTypes,
  BiconnectedComponents,
  ConnectedComponents,
  DefaultLabelStyle,
  GraphComponent,
  IArrow,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  KCoreComponents,
  Mapper,
  Reachability,
  ResultItemMapping,
  StronglyConnectedComponents
} from 'yfiles'
import AlgorithmConfiguration from './AlgorithmConfiguration'
import { getColorForComponent, MultiColorEdgeStyle, MultiColorNodeStyle } from './DemoStyles'
import ContextMenu from '../../utils/ContextMenu'

/**
 * Configuration options for the Connectivity Algorithms.
 */
export default class ConnectivityConfig extends AlgorithmConfiguration {
  /**
   * Specifies which connectivity algorithm is used.
   */
  readonly algorithmType: number

  /**
   * Specifies the marked node.
   */
  markedSource: INode | null = null

  incrementalElements: Mapper<INode, boolean> | null = null

  edgeRemoved = false

  /**
   * Creates an instance of ConnectivityConfig with default settings.
   */
  constructor(algorithmType: number) {
    super()
    this.algorithmType = algorithmType
  }

  /**
   * Runs the selected connectivity algorithm.
   * @param graph the graph on which the algorithm is executed
   */
  runAlgorithm(graph: IGraph): void {
    switch (this.algorithmType) {
      case ConnectivityConfig.BICONNECTED_COMPONENTS:
        this.calculateBiconnectedComponents(graph)
        break
      case ConnectivityConfig.REACHABILITY:
        this.calculateReachableNodes(graph)
        break
      case ConnectivityConfig.K_CORE_COMPONENTS:
        this.calculateKCoreNodes(graph)
        break
      case ConnectivityConfig.CONNECTED_COMPONENTS:
      case ConnectivityConfig.STRONGLY_CONNECTED_COMPONENTS:
      default:
        this.calculateConnectedComponents(graph)
        break
    }
  }

  /**
   * Calculates the connected components of the given graph.
   * @param graph The graph whose components are determined
   */
  calculateConnectedComponents(graph: IGraph): void {
    const stronglyConnectedComponents =
      this.algorithmType === ConnectivityConfig.STRONGLY_CONNECTED_COMPONENTS
    let compNum: number
    let components: ResultItemMapping<INode, number>
    if (stronglyConnectedComponents) {
      const stronglyConnectedComponentsResult = new StronglyConnectedComponents().run(graph)
      components = stronglyConnectedComponentsResult.nodeComponentIds
      compNum = stronglyConnectedComponentsResult.components.size
    } else {
      const connectedComponentsResult = new ConnectedComponents().run(graph)
      components = connectedComponentsResult.nodeComponentIds
      compNum = connectedComponentsResult.components.size
    }

    if (compNum > 0) {
      // find the components that are affected by the use move, if any
      const affectedComponents = this.getAffectedNodeComponents(components, graph)

      // create the array with the components needed for the node/edge style
      const allComponents: IModelItem[][] = []
      for (let i = 0; i < compNum; i++) {
        allComponents[i] = []
      }

      graph.nodes.forEach(node => {
        const componentIdx = components.get(node)
        allComponents[componentIdx!].push(node)
      })

      graph.edges.forEach(edge => {
        const sourceComponentIdx = components.get(edge.sourceNode)
        const targetComponentIdx = components.get(edge.targetNode)

        if (sourceComponentIdx === targetComponentIdx) {
          allComponents[sourceComponentIdx!].push(edge)
        }
      })

      // this is the component with the larger number of elements
      const largestComponentIdx = this.getLargestComponentIndex(affectedComponents, allComponents)
      // holds the color of the affected components
      const affectedComponent2Color = new Map<number, string>()
      // generate a color array
      const colors = this.generateColors(null)

      // sets the style/tag for the nodes
      graph.nodes.forEach((node, index) => {
        const componentIdx = components.get(node)!
        graph.setStyle(node, new MultiColorNodeStyle())
        const color = this.determineElementColor(
          colors,
          componentIdx,
          affectedComponents,
          affectedComponent2Color,
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
        const sourceComponentIdx = components.get(edge.sourceNode)!
        const targetComponentIdx = components.get(edge.targetNode)!
        if (sourceComponentIdx === targetComponentIdx) {
          edge.tag = {
            id: index,
            color: edge.sourceNode!.tag.color,
            components: allComponents,
            edgeComponent: sourceComponentIdx
          }
          graph.setStyle(
            edge,
            this.getMarkedEdgeStyle(
              stronglyConnectedComponents,
              sourceComponentIdx,
              null,
              edge.sourceNode!.tag.color
            )
          )
        }
      })
    }

    // clean up
    if (this.incrementalElements !== null) {
      this.incrementalElements.clear()
      this.incrementalElements = null
      this.edgeRemoved = false
    }
  }

  /**
   * Calculates the biconnected components of the given graph.
   * @param graph The graph whose biconnected components are determined.
   */
  calculateBiconnectedComponents(graph: IGraph): void {
    const result = new BiconnectedComponents().run(graph)
    const bicompNum = result.components.size
    if (bicompNum > 0) {
      const biconnectedComponents = result.edgeComponentIds
      // find the components that are affected by the use move, if any
      const affectedComponents = this.getAffectedEdgeComponents(biconnectedComponents, graph)

      // create the array with the components needed for the node/edge style
      const allComponents: IModelItem[][] = []
      for (let i = 0; i < bicompNum; i++) {
        allComponents[i] = []
      }

      graph.edges.forEach(edge => {
        const componentIdx = biconnectedComponents.get(edge)!
        if (componentIdx >= 0) {
          allComponents[componentIdx].push(edge)
          allComponents[componentIdx].push(edge.sourceNode!)
          allComponents[componentIdx].push(edge.targetNode!)
        }
      })

      // this is the component with the larger number of elements
      const largestComponentIdx = this.getLargestComponentIndex(affectedComponents, allComponents)
      // holds the color of the affected components
      const affectedComponent2Color = new Map<number, string>()
      // generate a color array
      const colors = this.generateColors(null)

      // sets the style/tag for the edges
      graph.edges.forEach((edge, index) => {
        const componentIdx = biconnectedComponents.get(edge)!
        let color: string | undefined
        if (componentIdx >= 0) {
          graph.setStyle(edge, this.getMarkedEdgeStyle(false, componentIdx))
          graph.setStyle(edge.sourceNode!, new MultiColorNodeStyle())
          graph.setStyle(edge.targetNode!, new MultiColorNodeStyle())

          color = this.determineElementColor(
            colors,
            componentIdx,
            affectedComponents,
            affectedComponent2Color,
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
      const articulationNodes = result.articulationNodes
      graph.nodes.forEach((node, index) => {
        let color: any
        let nodeComponents: any
        if (graph.edgesAt(node, AdjacencyTypes.ALL).size === 0) {
          graph.setStyle(node, graph.nodeDefaults.style)
        } else {
          // get the first edge with non-negative component index of the node
          const edge = this.findEdgeInBiconnectedComponent(graph, node, biconnectedComponents)
          // if an edge exists, use its color
          color = edge !== null ? edge.tag.color : null
          nodeComponents = edge !== null ? [biconnectedComponents.get(edge)] : []
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
        const visitedComponents = new Set<number>()
        graph.setStyle(node, new MultiColorNodeStyle())
        const components: number[] = []
        let color: any

        graph.edgesAt(node, AdjacencyTypes.ALL).forEach(edge => {
          const componentIdx = biconnectedComponents.get(edge)!
          if (!visitedComponents.has(componentIdx)) {
            visitedComponents.add(componentIdx)
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
    if (this.incrementalElements !== null) {
      this.incrementalElements.clear()
      this.incrementalElements = null
      this.edgeRemoved = false
    }
  }

  /**
   * Calculates the nodes reachable from the marked node.
   * @param graph The graph in which all reachable nodes are determined.
   */
  calculateReachableNodes(graph: IGraph): void {
    this.resetGraph(graph)

    if (graph.nodes.size > 0) {
      if (this.markedSource === null || !graph.contains(this.markedSource)) {
        this.markedSource = graph.nodes.last()
      }
      const result = new Reachability({
        directed: this.directed,
        startNodes: this.markedSource
      }).run(graph)

      const allReachable: IModelItem[][] = [[]]
      result.reachableNodes.forEach((node, index) => {
        graph.setStyle(node, new MultiColorNodeStyle())
        allReachable[0].push(node)
        node.tag = {
          id: index,
          color: null,
          components: allReachable,
          nodeComponents: [0]
        }
      })
      graph.edges.forEach((edge, index) => {
        if (result.isReachable(edge.sourceNode!) && result.isReachable(edge.targetNode!)) {
          graph.setStyle(edge, this.getMarkedEdgeStyle(this.directed, 0))
          allReachable[0].push(edge)
          edge.tag = {
            id: index,
            color: null,
            components: allReachable,
            edgeComponent: 0
          }
        }
      })

      graph.setStyle(this.markedSource, this.getSourceTargetNodeStyle(true, false))
    }
  }

  /**
   * Calculates the k-cores and visualizes them
   * @param graph The graph in which the k-cores are visualized
   */
  calculateKCoreNodes(graph: IGraph): void {
    this.resetGraph(graph)
    if (graph.nodes.size > 0) {
      const labelStyle = new DefaultLabelStyle({
        textFill: 'white'
      })

      const kCoreComponentsResult = new KCoreComponents().run(graph)

      const maximumK = kCoreComponentsResult.maximumK
      if (maximumK > 0) {
        const allCores: IModelItem[][] = []
        for (let coreCount = 1; coreCount <= maximumK; coreCount++) {
          allCores[coreCount] = []
        }

        // change the styles for the nodes and edges to the k cores
        for (let k = 1; k <= maximumK; k++) {
          const edges: IEdge[] = []

          // get all edges from this core
          const kCore = kCoreComponentsResult.getKCore(k)
          graph.edges.forEach(edge => {
            if (kCore.contains(edge.sourceNode!) && kCore.contains(edge.targetNode!)) {
              edges.push(edge)
            }
          })

          edges.forEach((edge, index) => {
            const source = edge.sourceNode!
            const target = edge.targetNode!

            const sourceStyle = new MultiColorNodeStyle()
            sourceStyle.useGradient = true
            graph.setStyle(source, sourceStyle)

            const targetStyle = new MultiColorNodeStyle()
            targetStyle.useGradient = true
            graph.setStyle(target, targetStyle)

            graph.setStyle(
              edge,
              new MultiColorEdgeStyle(getColorForComponent(k, true), IArrow.NONE, 5, true)
            )

            if (
              edges.length === 1 ||
              (index === 0 &&
                (target === edges[index + 1].sourceNode ||
                  target === edges[index + 1].targetNode)) ||
              (index > 0 &&
                (source === edges[index - 1].sourceNode || source === edges[index - 1].targetNode))
            ) {
              allCores[k].push(source)
              allCores[k].push(edge)
              allCores[k].push(target)
            } else {
              allCores[k].push(target)
              allCores[k].push(edge)
              allCores[k].push(source)
            }
          })
        }

        graph.nodes.forEach((node, index) => {
          const component = []
          let k: number
          for (k = 1; k <= maximumK; k++) {
            if (allCores[k].indexOf(node) >= 0) {
              component.push(k)
            } else {
              break
            }
          }

          graph.addLabel({
            owner: node,
            text: (k - 1).toString(),
            style: labelStyle,
            tag: 'k-core' // needed for cleanup in resetGraph
          })

          node.tag = {
            id: index,
            color: null,
            components: allCores,
            nodeComponents: component
          }
        })

        graph.edges.forEach((edge, index) => {
          let component = -1
          for (let i = 1; i <= maximumK; i++) {
            if (allCores[i].indexOf(edge) > 0) {
              component = i
            }
          }
          edge.tag = {
            id: index,
            color: null,
            components: allCores,
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
    }
  }

  /**
   * Returns the first edge with non-negative component index of the given node.
   * @param graph the given graph
   * @param node the given node
   * @param biconnectedComponents the mapping that holds the result of the biconnected components algorithm
   */
  findEdgeInBiconnectedComponent(
    graph: IGraph,
    node: INode,
    biconnectedComponents: ResultItemMapping<IEdge, number>
  ): IEdge | null {
    return graph
      .edgesAt(node, AdjacencyTypes.ALL)
      .find(
        incidentEdge =>
          biconnectedComponents.get(incidentEdge) !== null &&
          biconnectedComponents.get(incidentEdge)! >= 0
      )
  }

  /**
   * Adds a context menu to mark the source node for the reachability algorithm.
   * @param contextMenu the context menu to which the entries are added
   * @param item the item that is affected by this context menu
   * @param graphComponent the given graph component
   */
  populateContextMenu(
    contextMenu: ContextMenu,
    item: IModelItem,
    graphComponent: GraphComponent
  ): void {
    if (this.algorithmType === ConnectivityConfig.REACHABILITY) {
      const graph = graphComponent.graph
      if (item instanceof INode) {
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
   * @return the description text for the connectivity algorithms
   */
  get descriptionText(): string {
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
      case ConnectivityConfig.K_CORE_COMPONENTS:
        return (
          '<p>This part of the demo shows the <em>k-core</em> of the given graph.</p>' +
          '<p>The k-core of an undirected input graph consists of the subgraph components where each node has at least degree k.</p>' +
          "<p>Nodes and edges can be members of multiple k-cores. Choose a nodes' color to highlight the k-core related to this color.</p>" +
          '<p>The number in every node represents the <em>highest</em> k-Core the node belongs to.</p>' +
          '<p>The k-Core for k=0 is not visualized in this demo, as <em>every</em> node is a member.</p>'
        )
      case ConnectivityConfig.CONNECTED_COMPONENTS:
      default:
        return '<p>This part of the demo shows the <em>connected components</em> of the given graph.</p><p>Nodes and edges that belong to the same component share the same color.</p>'
    }
  }

  /**
   * Static field for CONNECTED_COMPONENTS
   */
  static get CONNECTED_COMPONENTS(): number {
    return 0
  }

  /**
   * Static field for BICONNECTED_COMPONENTS
   */
  static get BICONNECTED_COMPONENTS(): number {
    return 1
  }

  /**
   * Static field for STRONGLY_CONNECTED_COMPONENTS
   */
  static get STRONGLY_CONNECTED_COMPONENTS(): number {
    return 2
  }

  /**
   * Static field for REACHABILITY
   */
  static get REACHABILITY(): number {
    return 3
  }

  /**
   * Static field for K_CORE_COMPONENTS
   */
  static get K_CORE_COMPONENTS(): number {
    return 4
  }
}
