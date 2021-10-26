/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  Color,
  GraphComponent,
  IArrow,
  IEdge,
  IEdgeStyle,
  IGraph,
  IModelItem,
  INode,
  Mapper,
  PolylineEdgeStyle,
  Rect,
  ResultItemMapping,
  SolidColorFill
} from 'yfiles'
import {
  MultiColorEdgeStyle,
  SingleColorEdgeStyle,
  SingleColorNodeStyle,
  SourceTargetNodeStyle
} from './DemoStyles.js'
import ContextMenu from '../../utils/ContextMenu.js'

/**
 * Abstract base class for the different algorithm configurations that can be displayed in the demo.
 */
export default class AlgorithmConfiguration {
  constructor() {
    // Whether or not the edges should be considered as directed.
    this.directed = false

    // Whether or not to use uniform weights for all edges.
    this.useUniformWeights = false

    // Marks the elements that are changed from user actions, like add/remove node, add/remove edge.
    this.incrementalElements = null

    // Whether one or several edge(s) have been removed.
    this.edgeRemoved = false

    // The k value for use in the k-Core algorithm.
    this.kValue = 0
  }

  /**
   * Calculates the layout and performs post-processing steps.
   * @param {!GraphComponent} graphComponent the given graph component
   */
  apply(graphComponent) {
    this.runAlgorithm(graphComponent.graph)
  }

  /**
   * May be overridden to add algorithm-specific entries and functionality to the context menu.
   * @param {!ContextMenu} contextMenu the context menu to which the entries are added
   * @param {!INode} item the item that is affected by this context menu
   * @param {!GraphComponent} graphComponent the given graph component
   */
  populateContextMenu(contextMenu, item, graphComponent) {}

  /**
   * Must be overridden to run the selected algorithm.
   * @param {!IGraph} graph the graph on which the algorithm is executed
   */
  runAlgorithm(graph) {}

  /**
   * Returns a node style for marked nodes.
   * @param {number} type the type of node which determines the color of the style
   * @param {!object} gradient whether or not the color is chosen as a gradient or different colors are applied
   * @returns {!SingleColorNodeStyle}
   */
  getMarkedNodeStyle(type, gradient) {
    const colors = this.generateColors(gradient)
    return new SingleColorNodeStyle(colors[type % colors.length])
  }

  /**
   * Returns a node style to mark source and target nodes of paths.
   * @param {boolean} source true if the node is a source node of a path.
   * @param {boolean} target true if the node is a target node of a path.
   * @returns {!SourceTargetNodeStyle} the marked nodes' style
   */
  getSourceTargetNodeStyle(source, target) {
    let type
    if (source && target) {
      type = SourceTargetNodeStyle.TYPE_SOURCE_AND_TARGET
    } else if (source) {
      type = SourceTargetNodeStyle.TYPE_SOURCE
    } else {
      type = SourceTargetNodeStyle.TYPE_TARGET
    }
    return new SourceTargetNodeStyle(type)
  }

  /**
   * Returns a node style for marked edges.
   * @param {boolean} isDirected whether or not the style draws an arrow
   * @param {number} type the type of node which determines the color of the style
   * @param  [gradient] whether or not the color is chosen as a gradient or different colors are applied
   * @param  [svgColor] the color for the edge
   * @returns {!IEdgeStyle} the marked edges' style
   * @param {?object} [gradient=null]
   * @param {?string} [svgColor=null]
   */
  getMarkedEdgeStyle(isDirected, type, gradient = null, svgColor = null) {
    if (!svgColor) {
      const colors = this.generateColors(gradient)
      svgColor = colors[type % colors.length]
    }

    const arrow = new Arrow({
      fill: new SolidColorFill(svgColor),
      type: ArrowType.DEFAULT
    })

    if (gradient != null) {
      return new SingleColorEdgeStyle(svgColor, isDirected ? arrow : IArrow.NONE)
    } else {
      return new MultiColorEdgeStyle(svgColor, isDirected ? arrow : IArrow.NONE, 5)
    }
  }

  /**
   * Generates random colors for nodes and edges.
   *
   * @param {?object} gradient whether or not the color is chosen as a gradient or different colors are applied
   * @returns {!Array.<string>} an array of strings representing colors in the form of rgb[x,x,x]
   */
  generateColors(gradient) {
    if (gradient != null) {
      const colors = []
      const stepCount = gradient.size - 1
      const c1 = Color.LIGHT_BLUE
      const c2 = Color.BLUE

      for (let i = 0; i < gradient.size; i++) {
        const r = (c1.r * (stepCount - i) + c2.r * i) / stepCount
        const g = (c1.g * (stepCount - i) + c2.g * i) / stepCount
        const b = (c1.b * (stepCount - i) + c2.b * i) / stepCount
        const a = (c1.a * (stepCount - i) + c2.a * i) / stepCount
        colors[i] = `rgba(${r | 0},${g | 0},${b | 0},${a / 255})`
      }

      if (!gradient.lightToDark) {
        colors.reverse()
      }

      return colors
    }
    return [
      'rgba(65,105,225,1)', // royalblue
      'rgba(255,215,0,1)', // gold
      'rgba(220,20,60,1)', // crimson
      'rgba(0,206,209,1)', // darkturquoise
      'rgba(100,149,237,1)', // cornflowerblue
      'rgba(72,61,139,1)', // darkslateblue
      'rgba(255,69,0,1)', // orangered
      'rgba(123,104,238,1)', // mediumslateblue
      'rgba(34,139,34,1)', // forestgreen
      'rgba(99,21,133,1)', // mediumvioletred
      'rgba(0,139,139,1)', // darkcyan
      'rgba(210,105,30,1)', // chocolate
      'rgba(255,165,0,1)', // orange
      'rgba(50,205,50,1)', // limegreen
      'rgba(186,85,211,1)' // mediumorchid
    ]
  }

  /**
   * Callback that gets the edge weight for a given edge.
   * This implementation retrieves the weights from the labels or alternatively from the edge length.
   * @param {!IEdge} edge the given edge.
   * @returns {number} weight of the edge
   */
  getEdgeWeight(edge) {
    if (this.useUniformWeights) {
      return 1
    }
    // if edge has at least one label...
    if (edge.labels.size > 0) {
      // ..try to return it's value
      const edgeWeight = parseFloat(edge.labels.elementAt(0).text)
      if (!isNaN(edgeWeight)) {
        return edgeWeight > 0 ? edgeWeight : 0
      }
    }

    // calculate geometric edge length
    const edgePoints = []
    // add source port
    edgePoints.push(edge.sourcePort.location.toPoint())
    // add bends
    for (let i = 0; i < edge.bends.size; i++) {
      edgePoints.push(edge.bends.get(i).location.toPoint())
    }
    // add target port
    edgePoints.push(edge.targetPort.location.toPoint())

    let totalEdgeLength = 0
    for (let i = 0; i < edgePoints.length - 1; i++) {
      totalEdgeLength += edgePoints[i].distanceTo(edgePoints[i + 1])
    }
    return totalEdgeLength
  }

  /**
   * Finds the edge components that are affected based on the elements marked as incremental.
   * @param {!ResultItemMapping.<IEdge,number>} components the existing components
   * @param {!IGraph} graph the given graph
   * @returns {!Set.<number>} the set of indices of the edge affected components
   */
  getAffectedEdgeComponents(components, graph) {
    const affectedComponents = new Set()

    if (this.incrementalElements && components) {
      this.incrementalElements.entries.forEach(pair => {
        if (graph.contains(pair.key)) {
          graph.edgesAt(pair.key, AdjacencyTypes.ALL).forEach(edge => {
            const componentIdx = components.get(edge)
            if (componentIdx !== null) {
              affectedComponents.add(componentIdx)
            }
          })
        }
      })
    }
    return affectedComponents
  }

  /**
   * Finds the node components that are affected based on the elements marked as incremental.
   * @param {!ResultItemMapping.<INode,number>} components the existing components
   * @param {!IGraph} graph the given graph
   * @returns {!Set.<number>} the set of indices of the node affected components
   */
  getAffectedNodeComponents(components, graph) {
    const affectedComponents = new Set()

    if (this.incrementalElements && components) {
      this.incrementalElements.entries.forEach(pair => {
        const node = pair.key
        if (node && graph.contains(node)) {
          const componentIdx = components.get(node)
          if (componentIdx !== null) {
            affectedComponents.add(componentIdx)
          }
        }
      })
    }
    return affectedComponents
  }

  /**
   * Determines the color of a node or an edge.
   * @param {!Array.<string>} colors the existing color array
   * @param {number} componentIdx the component index of the element
   * @param {!Set.<number>} affectedComponents the array of the affected components
   * @param {!Map.<number,string>} affectedComponent2Color the map for the color of each affected component
   * @param {number} largestComponentIdx the index of the largest component
   * @param {!Array.<Array.<IModelItem>>} allComponents an array of all components
   * @param {!IGraph} graph the given graph
   * @param {!IModelItem} element the given element (node/edge)
   * @returns {!string} a string representing the element color in rgb[x,x,x] format
   */
  determineElementColor(
    colors,
    componentIdx,
    affectedComponents,
    affectedComponent2Color,
    largestComponentIdx,
    allComponents,
    graph,
    element
  ) {
    // if from scratch, generate colors
    if (!this.incrementalElements) {
      return colors[componentIdx % colors.length]
    } else if (affectedComponents.has(componentIdx)) {
      // if the elements doesn't belong to an affected component
      if (!affectedComponent2Color.has(componentIdx)) {
        let uniqueColor
        // if the component is the larger one, find the color that most of the nodes have
        if (largestComponentIdx === componentIdx && allComponents[componentIdx].length !== 1) {
          const majorColor = this.generateMajorColor(allComponents[componentIdx])
          if (majorColor) {
            uniqueColor = majorColor
          } else {
            uniqueColor = colors[componentIdx % colors.length]
          }
        } else if (
          largestComponentIdx === componentIdx &&
          allComponents[componentIdx].length === 1
        ) {
          // this case if when only one component exists
          uniqueColor = AlgorithmConfiguration.hasValidColorTag(element)
            ? element.tag.color
            : this.generateUniqueColor(graph, colors)
        } else if (element instanceof IEdge) {
          if (
            this.incrementalElements.get(element.sourceNode) &&
            this.incrementalElements.get(element.targetNode)
          ) {
            uniqueColor = this.generateUniqueColor(graph, colors)
          } else {
            uniqueColor =
              !this.edgeRemoved && element.tag && element.tag.color
                ? element.tag.color
                : this.generateUniqueColor(graph, colors)
          }
        } else {
          uniqueColor =
            !this.edgeRemoved && element.tag && element.tag.color
              ? element.tag.color
              : this.generateUniqueColor(graph, colors)
        }
        if (uniqueColor) {
          affectedComponent2Color.set(componentIdx, uniqueColor)
        }
      }
      return affectedComponent2Color.get(componentIdx)
    }

    // for the nodes that are not affected, keep their color
    return element.tag.color
  }

  /**
   * @param {!INode} item
   */
  isIncremental(item) {
    return this.incrementalElements && this.incrementalElements.get(item)
  }

  /**
   * Finds the component with the larger number of elements.
   * @param {!Set.<number>} affectedComponents the set of the affected components
   * @param {!Array.<Array.<IModelItem>>} allComponents an array of all components
   * @returns {number} the index of the largest component
   */
  getLargestComponentIndex(affectedComponents, allComponents) {
    if (allComponents && affectedComponents !== null && affectedComponents.size > 0) {
      // find the bigger component
      let largestComponentIdx = 0
      affectedComponents.forEach(componentIndex => {
        if (
          componentIndex !== largestComponentIdx &&
          allComponents[componentIndex] &&
          allComponents[largestComponentIdx]
        ) {
          if (allComponents[componentIndex].length > allComponents[largestComponentIdx].length) {
            largestComponentIdx = componentIndex
          } else if (
            allComponents[componentIndex].length === allComponents[largestComponentIdx].length
          ) {
            const largestComponentIncrementalElements = this.countIncrementalElements(
              allComponents[largestComponentIdx]
            )
            const currentComponentIncrementalElements = this.countIncrementalElements(
              allComponents[componentIndex]
            )
            largestComponentIdx =
              largestComponentIncrementalElements >= currentComponentIncrementalElements
                ? componentIndex
                : largestComponentIdx
          }
        }
      })

      return largestComponentIdx
    }
    return -1
  }

  /**
   * @param {!Array.<IModelItem>} items
   */
  countIncrementalElements(items) {
    let incrementalElements = 0
    items.forEach(item => {
      if (item instanceof IEdge) {
        if (this.isIncremental(item.sourceNode) || this.isIncremental(item.targetNode)) {
          incrementalElements++
        }
      } else if (item instanceof INode && this.isIncremental(item)) {
        incrementalElements++
      }
    })
    return incrementalElements
  }

  /**
   * Finds the color that most of the elements of the component have.
   * @param {!Array.<IModelItem>} component the components' array
   * @returns {!string} a string representing the color that most of the elements of the components have in rgb[x,x,x] format
   */
  generateMajorColor(component) {
    const color2Frequency = new Map()

    // finds the colors of the nodes in the current component
    for (let i = 0; i < component.length; i++) {
      const element = component[i]

      if (element instanceof INode || element instanceof IEdge) {
        if (element.tag !== null && element.tag.color !== null && element.tag.color !== undefined) {
          const color = element.tag.color
          if (!color2Frequency.has(color)) {
            color2Frequency.set(color, 0)
          }
          let frequency = color2Frequency.get(color)
          frequency++
          color2Frequency.set(color, frequency)
        }
      }
    }

    // finds the color with the maximum frequency
    let maxFrequency = 0
    let colorWithMaxFrequency
    for (const [color, frequency] of color2Frequency) {
      if (maxFrequency < frequency) {
        maxFrequency = frequency
        colorWithMaxFrequency = color
      }
    }

    return colorWithMaxFrequency
  }

  /**
   * Generates a color that does not already exist in the graph, unless such a color does not exist.
   * @param {!IGraph} graph the given graph
   * @param {!Array.<string>} colors an array with the existing colors
   * @returns {?string} a string representing a unique color in rgb[x,x,x] format
   */
  generateUniqueColor(graph, colors) {
    const existingColors = new Set()

    graph.nodes.forEach(node => {
      if (AlgorithmConfiguration.hasValidColorTag(node)) {
        existingColors.add(node.tag.color)
      }
    })

    graph.edges.forEach(edge => {
      if (AlgorithmConfiguration.hasValidColorTag(edge)) {
        existingColors.add(edge.tag.color)
      }
    })

    if (existingColors.size === colors.length) {
      return colors[Math.floor(Math.random() * (colors.length - 1))]
    }

    for (let i = 0; i < colors.length; i++) {
      if (!existingColors.has(colors[i])) {
        return colors[i]
      }
    }
    return null
  }

  /**
   * Checks if a graph element has a valid color in the tag.
   * @param {!IModelItem} element the given graph element
   * @returns {boolean} true if a graph element has a valid color in the tag, false otherwise.
   */
  static hasValidColorTag(element) {
    return element.tag !== null && element.tag.color !== null && element.tag.color !== undefined
  }

  /**
   * Resets the default style to all nodes and edges of the graph.
   * @param {!IGraph} graph the graph to be reset.
   */
  resetGraph(graph) {
    graph.nodes.forEach(node => {
      if (graph.contains(node)) {
        // reset size
        const size = graph.nodeDefaults.size
        // reset style
        graph.setStyle(node, graph.nodeDefaults.style)
        graph.setNodeLayout(node, new Rect(node.layout.x, node.layout.y, size.width, size.height))

        // remove labels
        const labels = node.labels.toArray()
        for (let i = 0; i < labels.length; i++) {
          if (labels[i].tag === 'centrality' || labels[i].tag === 'k-core') {
            graph.remove(labels[i])
          }
        }
      }
    })

    const arrow = new Arrow({
      fill: 'darkgray',
      stroke: 'darkgray',
      type: 'default'
    })
    const defaultEdgeStyle = graph.edgeDefaults.style
    // special treatment for the strongly connected components that are always
    // considered directed from the algorithm
    defaultEdgeStyle.targetArrow =
      this.directed || document.getElementById('algorithm-select-box').selectedIndex === 3
        ? arrow
        : IArrow.NONE

    graph.edges.forEach(edge => {
      if (graph.contains(edge)) {
        graph.setStyle(edge, defaultEdgeStyle)

        // remove labels
        const labels = edge.labels.toArray()
        for (let i = 0; i < labels.length; i++) {
          if (labels[i].tag === 'centrality') {
            graph.remove(labels[i])
          }
        }
      }
    })
  }
}
