/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BiconnectedComponentClustering,
  DefaultLabelStyle,
  EdgeBetweennessClustering,
  EdgePathLabelModel,
  EdgeSides,
  Enum,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalClustering,
  IArrow,
  ICanvasObject,
  ICanvasObjectDescriptor,
  ICommand,
  IEdge,
  Insets,
  KMeansClustering,
  KMeansClusteringDistanceMetric,
  License,
  LinkageMethod,
  NodeStyleDecorationInstaller,
  PolylineEdgeStyle,
  ShapeNodeStyle
} from 'yfiles'

import * as ClusteringData from './resources/ClusteringData.js'
import VoronoiDiagram from './VoronoiDiagram.js'
import { PolygonVisual, VoronoiVisual } from './DemoVisuals.js'
import { DendrogramComponent } from './DendrogramSupport.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * The {@link GraphComponent} which contains the {@link IGraph}.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The {@link GraphComponent} for the visualization of the dendrogram in the hierarchical clustering.
 * @type {DendrogramComponent}
 */
let dendrogramComponent = null

/**
 * The canvas object for the cluster visual
 * @type {ICanvasObject}
 */
let clusterVisualObject = null

/**
 * The canvas object for the k-means centroids visual
 * @type {ICanvasObject}
 */
let kMeansCentroidObject = null

/**
 * The style for the directed edges
 * @type {PolylineEdgeStyle}
 */
let directedEdgeStyle = null

/**
 * The result of the clustering algorithm
 * @type {Object}
 */
let result = null

/**
 * Holds whether a clustering algorithm is running
 * @type {boolean}
 */
let busy = false

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  // initialize the default styles
  initializeGraph()

  // create the input mode
  createInputMode()

  // initialize the dendrogram component
  initializeDendrogramComponent()

  // load the graph and run the algorithm
  onAlgorithmChanged()

  // wire up the UI
  registerCommands()

  // show the demo
  showApp(graphComponent)
}

/**
 * Initializes the default styles and the highlight style.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'orange',
    stroke: null
  })

  // sets the edge style of the algorithms that support edge direction
  directedEdgeStyle = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT
  })

  // set the default style for node labels
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    font: 'bold Arial'
  })

  // set the default style for edge labels
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    font: 'bold 10px Arial'
  })

  // For edge labels, the default is a label that is rotated to match the associated edge segment
  // We'll start by creating a model that is similar to the default:
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: true,
    sideOfEdge: EdgeSides.ABOVE_EDGE,
    distance: 2
  })
  // Finally, we can set this label model as the default for edge labels
  graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()

  // highlight node style
  const nodeHighlight = new NodeStyleDecorationInstaller({
    nodeStyle: new ShapeNodeStyle({
      shape: 'ellipse',
      fill: 'rgb(51, 102, 153)',
      stroke: null
    }),
    zoomPolicy: 'MIXED',
    margins: 3
  })
  graph.decorator.nodeDecorator.highlightDecorator.setImplementation(nodeHighlight)
}

/**
 * Creates the input mode.
 */
function createInputMode() {
  const mode = new GraphEditorInputMode({
    allowEditLabel: false,
    showHandleItems: GraphItemTypes.NONE
  })

  // when an edge is created, run the algorithm if this is EDGE_BETWEENNESS or BICONNECTED_COMPONENTS, since the
  // other are independent of the edges of the graph
  mode.createEdgeInputMode.addEdgeCreatedListener((source, edgeEventArgs) => {
    const selectedIndex = document.getElementById('algorithmsComboBox').selectedIndex
    if (
      selectedIndex === ClusteringAlgorithm.EDGE_BETWEENNESS ||
      selectedIndex === ClusteringAlgorithm.BICONNECTED_COMPONENTS
    ) {
      if (
        selectedIndex === ClusteringAlgorithm.EDGE_BETWEENNESS &&
        document.getElementById('directed').checked
      ) {
        graphComponent.graph.setStyle(edgeEventArgs.item, directedEdgeStyle)
      }
      runAlgorithm()
    }
  })

  // when a node/edge is created/deleted, run the algorithm
  mode.addDeletedSelectionListener(() => {
    runAlgorithm()
  })
  mode.addNodeCreatedListener(() => {
    runAlgorithm()
  })

  // when a node is dragged, run the algorithm if this is HIERARCHICAL clustering or kMEANS
  mode.moveInputMode.addDragFinishedListener(() => {
    const selectedIndex = document.getElementById('algorithmsComboBox').selectedIndex
    if (
      selectedIndex === ClusteringAlgorithm.HIERARCHICAL ||
      selectedIndex === ClusteringAlgorithm.kMEANS
    ) {
      runAlgorithm()
    }
  })

  // add the hover listener
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  mode.itemHoverInputMode.discardInvalidItems = false
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, event) => {
    // if a node is hovered and the algorithm is HIERARCHICAL clustering, hover the corresponding dendrogram node
    if (
      document.getElementById('algorithmsComboBox').selectedIndex ===
      ClusteringAlgorithm.HIERARCHICAL
    ) {
      const node = event.item
      graphComponent.highlightIndicatorManager.clearHighlights()
      if (node && result) {
        graphComponent.highlightIndicatorManager.addHighlight(node)
        dendrogramComponent.updateHighlight(result.getDendrogramNode(node))
      }
    }
  })
  graphComponent.inputMode = mode

  // add listeners for clipboard operations that might change the graph structure like cut and paste
  graphComponent.clipboard.addElementsPastedListener(() => {
    runAlgorithm()
  })

  graphComponent.clipboard.addElementsCutListener(() => {
    runAlgorithm()
  })
}

/**
 * Initializes the dendrogram component.
 */
function initializeDendrogramComponent() {
  dendrogramComponent = new DendrogramComponent(graphComponent)
  // add a dragging listener to run the hierarchical algorithm's when the dragging of the cutoff line has finished
  dendrogramComponent.addDragFinishedListener(cutOffValue => {
    removeClusterVisuals()
    runHierarchicalClustering(cutOffValue)
  })

  // add a highlight listener
  dendrogramComponent.addHighlightChangedListener(nodesToHighlight => {
    const highlightManager = graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    if (nodesToHighlight) {
      nodesToHighlight.forEach(node => {
        highlightManager.addHighlight(node)
      })
    }
  })
}

/**
 * Runs the clustering algorithm.
 */
function runAlgorithm() {
  if (!busy) {
    setUIDisabled(true)
    graphComponent.updateContentRect(new Insets(10))
    removeClusterVisuals()

    const selectedAlgorithm = document.getElementById('algorithmsComboBox').selectedIndex
    if (graphComponent.graph.nodes.size > 0) {
      switch (selectedAlgorithm) {
        default:
        case ClusteringAlgorithm.EDGE_BETWEENNESS:
          runEdgeBetweennessClustering()
          break
        case ClusteringAlgorithm.kMEANS:
          runKMeansClustering()
          break
        case ClusteringAlgorithm.HIERARCHICAL:
          runHierarchicalClustering()
          break
        case ClusteringAlgorithm.BICONNECTED_COMPONENTS:
          runBiconnectedComponentsClustering()
          break
      }
    } else {
      if (selectedAlgorithm === ClusteringAlgorithm.HIERARCHICAL) {
        dendrogramComponent.clearDendrogram()
      }
    }
    setUIDisabled(false)
  }
}

/**
 * Runs the edge betweenness clustering algorithm.
 */
function runEdgeBetweennessClustering() {
  updateInformationPanel('edge-betweenness')

  const graph = graphComponent.graph

  // get the algorithm preferences from the right panel
  let minClusterCount = parseFloat(document.getElementById('ebMinClusterNumber').value)
  const maxClusterCount = parseFloat(document.getElementById('ebMaxClusterNumber').value)

  if (minClusterCount > maxClusterCount) {
    alert(
      'Desired minimum number of clusters cannot be larger than the desired maximum number of clusters.'
    )
    document.getElementById('ebMinClusterNumber').value = maxClusterCount
    minClusterCount = maxClusterCount
  } else if (minClusterCount > graph.nodes.size) {
    alert(
      'Desired minimum number of clusters cannot be larger than the number of nodes in the graph.'
    )
    document.getElementById('ebMinClusterNumber').value = graph.nodes.size
    minClusterCount = graph.nodes.size
  }

  // run the algorithm
  result = new EdgeBetweennessClustering({
    directed: document.getElementById('directed').checked,
    minimumClusterCount: minClusterCount,
    maximumClusterCount: maxClusterCount,
    weights: getEdgeWeight
  }).run(graph)

  // visualize the result
  visualizeClusteringResult()
}

/**
 * Runs the k-means clustering algorithm.
 */
function runKMeansClustering() {
  updateInformationPanel('k-means')

  // get the algorithm preferences from the right panel
  let distanceMetric
  switch (document.getElementById('distanceMetricComboBox').selectedIndex) {
    default:
    case 0:
      distanceMetric = KMeansClusteringDistanceMetric.EUCLIDEAN
      break
    case 1:
      distanceMetric = KMeansClusteringDistanceMetric.MANHATTAN
      break
    case 2:
      distanceMetric = KMeansClusteringDistanceMetric.CHEBYCHEV
      break
  }

  // run the clustering algorithm
  result = new KMeansClustering({
    metric: distanceMetric,
    maximumIterations: parseFloat(document.getElementById('iterations').value),
    k: parseFloat(document.getElementById('kMeansMaxClusterNumber').value)
  }).run(graphComponent.graph)

  // visualize the result
  visualizeClusteringResult()
}

/**
 * Run the hierarchical clustering algorithm.
 * @param {number} cutoff The given cut-off value to run the algorithm
 */
function runHierarchicalClustering(cutoff) {
  updateInformationPanel('hierarchical')

  const graph = graphComponent.graph
  // get the algorithm preferences from the right panel
  let linkage
  switch (document.getElementById('linkageComboBox').selectedIndex) {
    default:
    case 0:
      linkage = LinkageMethod.SINGLE
      break
    case 1:
      linkage = LinkageMethod.AVERAGE
      break
    case 2:
      linkage = LinkageMethod.COMPLETE
      break
  }

  // run the algorithm that calculates only the node clusters
  result = new HierarchicalClustering({
    metric: HierarchicalClustering.EUCLIDEAN,
    linkage,
    cutoff
  }).run(graph)

  // visualize the result
  visualizeClusteringResult()

  // draw the dendrogram from the algorithm's result
  dendrogramComponent.generateDendrogram(result, cutoff)
}

/**
 * Run the biconnected components clustering algorithm.
 */
function runBiconnectedComponentsClustering() {
  updateInformationPanel('biconnected-components')
  // run the algorithm
  result = new BiconnectedComponentClustering().run(graphComponent.graph)
  // visualize the result
  visualizeClusteringResult()
}

/**
 * Visualizes the result of the clustering algorithm by adding the appropriate visuals.
 */
function visualizeClusteringResult() {
  const graph = graphComponent.graph
  const selectedIndex = document.getElementById('algorithmsComboBox').selectedIndex

  // creates a map the holds for each cluster id, the list of nodes that belong to the particular cluster
  const clustering = new Map()
  graph.nodes.forEach(node => {
    const clusterId = result.nodeClusterIds.get(node)
    let clusterNodesCoordinates = clustering.get(clusterId)
    if (!clusterNodesCoordinates) {
      clusterNodesCoordinates = []
      clustering.set(clusterId, clusterNodesCoordinates)
    }
    clusterNodesCoordinates.push(node.layout)
  })

  if (!clusterVisualObject) {
    let clusterVisual

    switch (selectedIndex) {
      default:
      case ClusteringAlgorithm.EDGE_BETWEENNESS:
      case ClusteringAlgorithm.BICONNECTED_COMPONENTS: {
        // create a polygonal visual that encloses the nodes that belong to the same cluster
        clusterVisual = new PolygonVisual()
        break
      }
      case ClusteringAlgorithm.kMEANS: {
        if (clustering.size >= 3 && graphComponent.contentRect) {
          // create a voronoi diagram
          clusterVisual = new VoronoiVisual(
            new VoronoiDiagram(result.centroids, graphComponent.contentRect)
          )
        } else {
          // if there exist only two clusters, create a polygonal visual with center marking
          clusterVisual = new PolygonVisual(true)
        }
        break
      }
    }

    // add the visual to the graphComponent's background group
    clusterVisualObject = graphComponent.backgroundGroup.addChild(
      clusterVisual,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
    clusterVisualObject.toBack()

    // update the information for the visual object
    clusterVisualObject.userObject.clusters = {
      number: clustering.size,
      clustering,
      centroids: result.centroids,
      drawCenters: selectedIndex === ClusteringAlgorithm.kMEANS
    }
  }

  // invalidate the graphComponent
  graphComponent.invalidate()
}

/**
 * Called when the clustering algorithm changes
 */
function onAlgorithmChanged() {
  const algorithmsComboBox = document.getElementById('algorithmsComboBox')
  const selectedIndex = algorithmsComboBox.selectedIndex

  // determine the file name that will be used for loading the graph
  const key = algorithmsComboBox[selectedIndex].value
  const fileName = key.replace(' ', '').replace('-', '')

  // Adjusts the window appearance. This method is needed since when the selected clustering algorithm is
  // HIERARCHICAL, the window has to be split to visualize the dendrogram.
  const showDendrogram = selectedIndex === ClusteringAlgorithm.HIERARCHICAL
  graphComponent.div.style.height = showDendrogram ? '44%' : 'calc(100% - 100px)'
  dendrogramComponent.toggleVisibility(showDendrogram)
  graphComponent.fitGraphBounds(new Insets(10))

  // load the graph and run the algorithm
  loadGraph(ClusteringData[fileName])
  runAlgorithm()
}

/**
 * Loads the sample graphs from a JSON file.
 * @param {Object} sampleData The data samples
 */
function loadGraph(sampleData) {
  let graph = graphComponent.graph
  graph.clear()
  // remove all previous visuals
  removeClusterVisuals()

  // initialize a graph builder to parse the graph from the JSON file
  const builder = new GraphBuilder({
    graph,
    nodesSource: sampleData.nodes,
    edgesSource: sampleData.edges,
    nodeIdBinding: 'id',
    sourceNodeBinding: 'source',
    targetNodeBinding: 'target',
    locationXBinding: 'x',
    locationYBinding: 'y'
  })
  graph = builder.buildGraph()

  if (
    document.getElementById('algorithmsComboBox').selectedIndex ===
    ClusteringAlgorithm.EDGE_BETWEENNESS
  ) {
    graph.edges.forEach(edge => {
      if (document.getElementById('directed').checked) {
        graph.setStyle(edge, directedEdgeStyle)
      }
      if (document.getElementById('edgeCosts').checked) {
        const edgeCost = Math.floor(Math.random() * 200 + 1)
        graph.addLabel(edge, `${edgeCost}`)
      }
    })
  }
  graphComponent.fitGraphBounds(new Insets(10))
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  const graph = graphComponent.graph
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  const samplesComboBox = document.getElementById('algorithmsComboBox')
  bindAction("button[data-command='PreviousFile']", () => {
    samplesComboBox.selectedIndex = Math.max(0, samplesComboBox.selectedIndex - 1)
    onAlgorithmChanged()
  })
  bindAction("button[data-command='NextFile']", () => {
    samplesComboBox.selectedIndex = Math.min(
      samplesComboBox.selectedIndex + 1,
      samplesComboBox.options.length - 1
    )
    onAlgorithmChanged()
  })

  bindChangeListener("select[data-command='AlgorithmSelectionChanged']", onAlgorithmChanged)
  bindAction("button[data-command='RunAlgorithm']", runAlgorithm)

  // edge-betweenness menu
  document.getElementById('ebMinClusterNumber').addEventListener('change', input => {
    const value = parseFloat(input.target.value)
    const maximumClusterNumber = parseFloat(document.getElementById('ebMaxClusterNumber').value)
    if (isNaN(value) || value < 1) {
      alert('Number of clusters should be non-negative.')
      input.target.value = 1
      return
    } else if (value > maximumClusterNumber) {
      alert(
        'Desired minimum number of clusters cannot be larger than the desired maximum number of clusters.'
      )
      input.target.value = maximumClusterNumber
      return
    } else if (value > graph.nodes.size) {
      alert(
        'Desired minimum number of clusters cannot be larger than the number of nodes in the graph.'
      )
      input.target.value = graph.nodes.size
      return
    }
    runAlgorithm()
  })

  document.getElementById('ebMaxClusterNumber').addEventListener('change', input => {
    const value = parseFloat(input.target.value)
    const minimumClusterNumber = parseFloat(document.getElementById('ebMinClusterNumber').value)
    if (isNaN(value) || value < minimumClusterNumber || minimumClusterNumber < 1) {
      const message =
        value < minimumClusterNumber
          ? 'Desired maximum number of clusters cannot be smaller than the desired minimum number of clusters.'
          : 'Number of clusters should be non-negative.'
      alert(message)
      input.target.value = minimumClusterNumber
      return
    }
    runAlgorithm()
  })

  const considerEdgeDirection = document.getElementById('directed')
  considerEdgeDirection.addEventListener('click', () => {
    const isChecked = considerEdgeDirection.checked
    graph.edges.forEach(edge => {
      graph.setStyle(edge, isChecked ? directedEdgeStyle : graph.edgeDefaults.style)
    })

    runAlgorithm()
  })

  const considerEdgeCosts = document.getElementById('edgeCosts')
  considerEdgeCosts.addEventListener('click', () => {
    graph.edges.forEach(edge => {
      if (considerEdgeCosts.checked) {
        const edgeCost = Math.floor(Math.random() * 200 + 1)
        if (edge.labels.size > 0) {
          graph.setLabelText(edge.labels.get(0), `${edgeCost}`)
        } else {
          graph.addLabel(edge, `${edgeCost}`)
        }
      } else {
        edge.labels.toArray().forEach(label => {
          graph.remove(label)
        })
      }
    })
    runAlgorithm()
  })

  // k-Means
  bindChangeListener("select[data-command='distanceMetricComboBox']", runAlgorithm)
  document.getElementById('kMeansMaxClusterNumber').addEventListener('change', input => {
    const value = parseFloat(input.target.value)
    if (isNaN(value) || value < 1) {
      alert('Desired maximum number of clusters should be greater than zero.')
      input.target.value = 1
      return
    }
    runAlgorithm()
  })
  document.getElementById('iterations').addEventListener('change', input => {
    const value = parseFloat(input.target.value)
    if (isNaN(value) || value < 0) {
      alert('Desired maximum number of iterations should be non-negative.')
      input.target.value = 0
      return
    }
    runAlgorithm()
  })

  // hierarchical
  bindChangeListener("select[data-command='linkageComboBox']", runAlgorithm)
}

/**
 * Remove all present cluster visuals.
 */
function removeClusterVisuals() {
  if (clusterVisualObject) {
    clusterVisualObject.remove()
    clusterVisualObject = null
  }

  if (kMeansCentroidObject) {
    kMeansCentroidObject.remove()
    kMeansCentroidObject = null
  }
}

/**
 * Returns the edge weight for the given edge.
 * @param {IEdge} edge The given edge
 * @return {number} The edge weight
 */
function getEdgeWeight(edge) {
  if (!document.getElementById('edgeCosts').checked) {
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
  return 0
}

/**
 * Updates the elements of the UI's state and checks whether the buttons should be enabled or not.
 * @param {boolean} disabled
 */
function setUIDisabled(disabled) {
  const samplesComboBox = document.getElementById('algorithmsComboBox')
  samplesComboBox.disabled = disabled
  document.getElementById('previousButton').disabled =
    disabled || samplesComboBox.selectedIndex === 0
  document.getElementById('nextButton').disabled =
    disabled || samplesComboBox.selectedIndex === samplesComboBox.childElementCount - 1
  graphComponent.inputMode.waiting = disabled
  busy = disabled
}

/**
 * Updates the description and the settings panel.
 * @param {string} panelId The id of the panel to be updated
 */
function updateInformationPanel(panelId) {
  // set display none to all and then change only the desired one
  document.getElementById('edge-betweenness').style.display = 'none'
  document.getElementById('k-means').style.display = 'none'
  document.getElementById('hierarchical').style.display = 'none'
  document.getElementById('biconnected-components').style.display = 'none'
  document.getElementById(panelId).style.display = 'inline-block'
}

const ClusteringAlgorithm = Enum('ClusteringAlgorithm', {
  EDGE_BETWEENNESS: 0,
  kMEANS: 1,
  HIERARCHICAL: 2,
  BICONNECTED_COMPONENTS: 3
})

// Run the demo
loadJson().then(run)
