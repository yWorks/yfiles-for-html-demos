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
  BiconnectedComponentClustering,
  EdgeBetweennessClustering,
  EdgePathLabelModel,
  EdgeSides,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalClustering,
  HierarchicalClusteringLinkage,
  HierarchicalClusteringResult,
  KMeansClustering,
  KMeansDistanceMetric,
  LabelPropagationClustering,
  LabelStyle,
  License,
  LouvainModularityClustering,
  NodeStyleIndicatorRenderer,
  Rect,
  ShapeNodeShape
} from '@yfiles/yfiles'

import { VoronoiDiagram } from './VoronoiDiagram'
import { PolygonVisual, VoronoiVisual } from './DemoVisuals'
import { DendrogramComponent } from './DendrogramSupport'
import { createDemoEdgeStyle, createDemoShapeNodeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-app/demo-page'
import { edgeBetweennessData } from './data/edge-betweenness-data'
import { biconnectedComponentsData } from './data/biconnected-components-data'
import { kMeansData } from './data/k-means-data'
import { hierarchicalData } from './data/hierarchical-data'

let graphComponent

/**
 * The {@link GraphComponent} for the visualization of the dendrogram in the hierarchical clustering.
 */
let dendrogramComponent

/**
 * The render tree element for the cluster visual
 */
let clusterVisualElement

/**
 * The render tree element for the k-means centroids visual
 */
let kMeansCentroidElement

/**
 * The style for the directed edges
 */
let directedEdgeStyle

/**
 * The result of the clustering algorithm
 */
let result

/**
 * Holds whether a clustering algorithm is running
 */
let busy = false

/**
 * The algorithm selected by the user
 */
let selectedAlgorithm

async function run() {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')
  // initialize the default styles
  configureGraph(graphComponent)

  // create the input mode
  configureUserInteraction(graphComponent)

  dendrogramComponent = new DendrogramComponent(graphComponent)

  // initialize the dendrogram component
  configureDendrogramComponent(dendrogramComponent)

  // load the graph and run the algorithm
  await onAlgorithmChanged()

  // wire up the UI
  initializeUI()
}

/**
 * Initializes the default styles and the highlight style.
 */
function configureGraph(graphComponent) {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = createDemoShapeNodeStyle(ShapeNodeShape.ELLIPSE, 'demo-palette-401')

  // sets the default edge style as 'undirected'
  graph.edgeDefaults.style = createDemoEdgeStyle({
    colorSetName: 'demo-palette-401',
    showTargetArrow: false
  })

  // sets the edge style of the algorithms that support edge direction
  directedEdgeStyle = createDemoEdgeStyle({ colorSetName: 'demo-palette-401' })

  // set the default style for node labels
  graph.nodeDefaults.labels.style = new LabelStyle({ font: 'bold Arial' })

  // set the default style for edge labels
  graph.edgeDefaults.labels.style = new LabelStyle({ font: 'bold 10px Arial' })

  // For edge labels, the default is a label that is rotated to match the associated edge segment
  // We'll start by creating a model that is similar to the default:
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: true,
    sideOfEdge: EdgeSides.ABOVE_EDGE,
    distance: 2
  })
  // Finally, we can set this label model as the default for edge labels
  graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createRatioParameter()

  // highlight node style
  const nodeHighlight = new NodeStyleIndicatorRenderer({
    nodeStyle: createDemoShapeNodeStyle(ShapeNodeShape.ELLIPSE, 'demo-palette-23'),
    zoomPolicy: 'mixed',
    margins: 3
  })
  graph.decorator.nodes.highlightRenderer.addConstant(nodeHighlight)
}

/**
 * Configures user interaction for the given graph component.
 */
function configureUserInteraction(graphComponent) {
  const mode = new GraphEditorInputMode({
    allowEditLabel: false,
    showHandleItems: GraphItemTypes.NONE
  })

  // when an edge is created, run the algorithm again except for the k-means and hierarchical
  // because these two are independent of the edges of the graph
  mode.createEdgeInputMode.addEventListener('edge-created', async (evt) => {
    if (selectedAlgorithm === 'edge-betweenness' && document.querySelector(`#directed`).checked) {
      graphComponent.graph.setStyle(evt.item, directedEdgeStyle)
    }
    if (selectedAlgorithm != 'k-means' && selectedAlgorithm != 'hierarchical') {
      await runAlgorithm()
    }
  })

  // when a node/edge is created/deleted, run the algorithm
  mode.addEventListener('deleted-selection', async () => {
    await runAlgorithm()
  })
  mode.addEventListener('node-created', async () => {
    await runAlgorithm()
  })

  // when a node is dragged, run the algorithm if this is HIERARCHICAL clustering or kMEANS
  const onDragFinished = async () => {
    if (selectedAlgorithm === 'hierarchical' || selectedAlgorithm === 'k-means') {
      await runAlgorithm()
    }
  }
  mode.moveSelectedItemsInputMode.addEventListener('drag-finished', onDragFinished)
  mode.moveUnselectedItemsInputMode.addEventListener('drag-finished', onDragFinished)

  // add the hover listener
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    // if a node is hovered and the algorithm is HIERARCHICAL clustering, hover the corresponding dendrogram node
    if (selectedAlgorithm === 'hierarchical') {
      const node = evt.item
      const highlights = graphComponent.highlights
      highlights.clear()
      if (node && result instanceof HierarchicalClusteringResult) {
        highlights.add(node)
        dendrogramComponent.updateHighlight(result.getDendrogramNode(node))
      } else {
        dendrogramComponent.updateHighlight()
      }
    }
  })
  graphComponent.inputMode = mode

  // add listeners for clipboard operations that might change the graph structure like cut and paste
  graphComponent.clipboard.addEventListener('items-pasted', async () => {
    await runAlgorithm()
  })

  graphComponent.clipboard.addEventListener('items-cut', async () => {
    await runAlgorithm()
  })
}

/**
 * Initializes the dendrogram component.
 */
function configureDendrogramComponent(dendrogramComponent) {
  // add a dragging listener to run the hierarchical algorithm when the dragging of the cutoff line has finished
  dendrogramComponent.setDragFinishedListener(async (cutOffValue) => {
    removeClusterVisuals()
    await runHierarchicalClustering(cutOffValue)
  })
}

/**
 * Runs the clustering algorithm.
 */
async function runAlgorithm() {
  if (!busy) {
    setUIDisabled(true)
    graphComponent.updateContentBounds(10)
    removeClusterVisuals()

    if (graphComponent.graph.nodes.size > 0) {
      switch (selectedAlgorithm) {
        default:
        case 'edge-betweenness':
          runEdgeBetweennessClustering()
          break
        case 'k-means':
          runKMeansClustering()
          break
        case 'hierarchical':
          await runHierarchicalClustering()
          break
        case 'biconnected-components':
          runBiconnectedComponentsClustering()
          break
        case 'louvain-modularity':
          runLouvainModularityClustering()
          break
        case 'label-propagation':
          runLabelPropagationClustering()
          break
      }
    } else {
      if (selectedAlgorithm === 'hierarchical') {
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
  let minClusterCount = parseFloat(document.querySelector(`#ebMinClusterNumber`).value)
  const maxClusterCount = parseFloat(document.querySelector(`#ebMaxClusterNumber`).value)

  if (minClusterCount > maxClusterCount) {
    alert(
      'Desired minimum number of clusters cannot be larger than the desired maximum number of clusters.'
    )
    document.querySelector(`#ebMinClusterNumber`).value = maxClusterCount.toString()
    minClusterCount = maxClusterCount
  } else if (minClusterCount > graph.nodes.size) {
    alert(
      'Desired minimum number of clusters cannot be larger than the number of nodes in the graph.'
    )
    document.querySelector(`#ebMinClusterNumber`).value = graph.nodes.size.toString()
    minClusterCount = graph.nodes.size
  }

  // run the algorithm
  result = new EdgeBetweennessClustering({
    directed: document.querySelector(`#directed`).checked,
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
  switch (document.querySelector(`#distance-metrics`).selectedIndex) {
    default:
    case 0:
      distanceMetric = KMeansDistanceMetric.EUCLIDEAN
      break
    case 1:
      distanceMetric = KMeansDistanceMetric.MANHATTAN
      break
    case 2:
      distanceMetric = KMeansDistanceMetric.CHEBYCHEV
      break
  }

  // run the clustering algorithm
  result = new KMeansClustering({
    metric: distanceMetric,
    maximumIterations: parseFloat(document.querySelector(`#iterations`).value),
    k: parseFloat(document.querySelector(`#kMeansMaxClusterNumber`).value)
  }).run(graphComponent.graph)

  // visualize the result
  visualizeClusteringResult()
}

/**
 * Run the hierarchical clustering algorithm.
 * @param cutoff The given cut-off value to run the algorithm
 */
async function runHierarchicalClustering(cutoff) {
  updateInformationPanel('hierarchical')

  const graph = graphComponent.graph
  // get the algorithm preferences from the right panel
  let linkage
  switch (document.querySelector(`#linkage`).selectedIndex) {
    default:
    case 0:
      linkage = HierarchicalClusteringLinkage.SINGLE
      break
    case 1:
      linkage = HierarchicalClusteringLinkage.AVERAGE
      break
    case 2:
      linkage = HierarchicalClusteringLinkage.COMPLETE
      break
  }

  // run the algorithm that calculates only the node clusters
  result = new HierarchicalClustering({
    metric: HierarchicalClustering.EUCLIDEAN,
    linkage,
    // if no cutoff is specified when runHierarchicalClustering is called, the clustering algorithm
    // should produce a single cluster with all nodes (i.e., not cut-off any nodes)
    // setting the algorithm's cutoff property to a negative value ensures a single cluster result
    cutoff: typeof cutoff === 'undefined' ? -1 : cutoff
  }).run(graph)

  // visualize the result
  visualizeClusteringResult()

  // draw the dendrogram from the algorithm's result
  await dendrogramComponent.generateDendrogram(result, cutoff)
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
 * Run the Louvain modularity clustering algorithm.
 */
function runLouvainModularityClustering() {
  updateInformationPanel('louvain-modularity')
  // run the algorithm
  result = new LouvainModularityClustering().run(graphComponent.graph)
  // visualize the result
  visualizeClusteringResult()
}

/**
 * Run the label propagation clustering algorithm.
 */
function runLabelPropagationClustering() {
  updateInformationPanel('label-propagation')
  // run the algorithm
  result = new LabelPropagationClustering().run(graphComponent.graph)
  // visualize the result
  visualizeClusteringResult()
}

/**
 * Visualizes the result of the clustering algorithm by adding the appropriate visuals.
 */
function visualizeClusteringResult() {
  const graph = graphComponent.graph

  // creates a map the holds for each cluster id, the list of nodes that belong to the particular cluster
  const clustering = new Map()
  graph.nodes.forEach((node) => {
    let clusterId = result.nodeClusterIds.get(node)
    // biconnected components returns -1 as cluster id when only one node is present.
    // We change the clusterId manually here, as otherwise we'll get an exception in
    // DemoVisuals.PolygonVisual#createVisual
    if (clusterId === -1 && selectedAlgorithm === 'biconnected-components') {
      clusterId = 0
    }
    let clusterNodesCoordinates = clustering.get(clusterId)
    if (!clusterNodesCoordinates) {
      clusterNodesCoordinates = []
      clustering.set(clusterId, clusterNodesCoordinates)
    }
    clusterNodesCoordinates.push(node.layout)
  })

  if (!clusterVisualElement) {
    let clusterVisual

    switch (selectedAlgorithm) {
      default:
      case 'edge-betweenness':
      case 'biconnected-components': {
        // create a polygonal visual that encloses the nodes that belong to the same cluster
        const clusters = { number: clustering.size, clustering, centroids: [] }
        clusterVisual = new PolygonVisual(false, clusters)
        break
      }
      case 'k-means': {
        const centroids = result.centroids
        if (clustering.size >= 3 && graphComponent.contentBounds) {
          // create a voronoi diagram
          const clusters = { centroids: centroids }
          clusterVisual = new VoronoiVisual(
            new VoronoiDiagram(centroids, graphComponent.contentBounds),
            clusters
          )
        } else {
          // if there exist only two clusters, create a polygonal visual with center marking
          const clusters = { number: clustering.size, clustering, centroids: centroids }
          clusterVisual = new PolygonVisual(true, clusters)
        }
        break
      }
    }

    // add the visual to the graphComponent's background group
    clusterVisualElement = graphComponent.renderTree.createElement(
      graphComponent.renderTree.backgroundGroup,
      clusterVisual
    )
    clusterVisualElement.toBack()
  }

  // invalidate the graphComponent
  graphComponent.invalidate()
}

/**
 * Called when the clustering algorithm changes
 */
async function onAlgorithmChanged() {
  const algorithmsComboBox = document.querySelector(`#algorithms`)
  selectedAlgorithm = algorithmsComboBox.value

  // Adjusts the window appearance. This method is required since when the selected clustering algorithm is
  // HIERARCHICAL, the window has to be split to visualize the dendrogram.
  const showDendrogram = selectedAlgorithm === 'hierarchical'
  dendrogramComponent.toggleVisibility(showDendrogram)
  await graphComponent.fitGraphBounds(10)

  // load the graph and run the algorithm
  await loadGraph(selectedAlgorithm)
  await runAlgorithm()
}

function getData(name) {
  switch (name) {
    case 'biconnected-components':
    case 'label-propagation':
    case 'louvain-modularity':
      return biconnectedComponentsData
    case 'edge-betweenness':
      return edgeBetweennessData
    case 'hierarchical':
      return hierarchicalData
    case 'k-means':
      return kMeansData
  }
}

/**
 * Loads the sample graphs from a JSON file.
 */
async function loadGraph(name) {
  // remove all previous visuals
  removeClusterVisuals()

  const graph = graphComponent.graph
  graph.clear()

  const isEdgeBetweenness = selectedAlgorithm === 'edge-betweenness'
  const styleFactory =
    isEdgeBetweenness && document.querySelector(`#directed`).checked
      ? () => directedEdgeStyle
      : () => undefined // tell GraphBuilder to use default styles

  const labelsFactory =
    isEdgeBetweenness && document.querySelector(`#edgeCosts`).checked
      ? () => Math.floor(Math.random() * 200 + 1).toString()
      : () => undefined // tell GraphBuilder not to create any labels

  // initialize a graph builder to parse the graph from the JSON file
  const data = getData(name)
  const builder = new GraphBuilder({
    graph: graph,
    nodes: [
      {
        data: data.nodes,
        id: 'id',
        layout: (data) => new Rect(data.x, data.y, data.w, data.h),
        labels: ['label']
      }
    ],
    edges: [
      {
        data: data.edges,
        sourceId: 'source',
        targetId: 'target',
        style: styleFactory,
        labels: [labelsFactory]
      }
    ]
  })

  builder.buildGraph()

  await graphComponent.fitGraphBounds(10)
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  const graph = graphComponent.graph

  const samplesComboBox = document.querySelector(`#algorithms`)
  addNavigationButtons(samplesComboBox).addEventListener('change', onAlgorithmChanged)

  // edge-betweenness menu
  const minInput = document.querySelector(`#ebMinClusterNumber`)
  minInput.addEventListener('change', async (_) => {
    const value = parseFloat(minInput.value)
    const maximumClusterNumber = parseFloat(document.querySelector(`#ebMaxClusterNumber`).value)
    if (Number.isNaN(value) || value < 1) {
      alert('Number of clusters should be non-negative.')
      minInput.value = '1'
      return
    } else if (value > maximumClusterNumber) {
      alert(
        'Desired minimum number of clusters cannot be larger than the desired maximum number of clusters.'
      )
      minInput.value = maximumClusterNumber.toString()
      return
    } else if (value > graph.nodes.size) {
      alert(
        'Desired minimum number of clusters cannot be larger than the number of nodes in the graph.'
      )
      minInput.value = graph.nodes.size.toString()
      return
    }
    await runAlgorithm()
  })

  const maxInput = document.querySelector(`#ebMaxClusterNumber`)
  maxInput.addEventListener('change', async (_) => {
    const value = parseFloat(maxInput.value)
    const minimumClusterNumber = parseFloat(document.querySelector(`#ebMinClusterNumber`).value)
    if (Number.isNaN(value) || value < minimumClusterNumber || minimumClusterNumber < 1) {
      const message =
        value < minimumClusterNumber
          ? 'Desired maximum number of clusters cannot be smaller than the desired minimum number of clusters.'
          : 'Number of clusters should be non-negative.'
      alert(message)
      maxInput.value = minimumClusterNumber.toString()
      return
    }
    await runAlgorithm()
  })

  const considerEdgeDirection = document.querySelector(`#directed`)
  considerEdgeDirection.addEventListener('click', async () => {
    const isChecked = considerEdgeDirection.checked
    graph.edges.forEach((edge) => {
      graph.setStyle(edge, isChecked ? directedEdgeStyle : graph.edgeDefaults.style)
    })

    await runAlgorithm()
  })

  const considerEdgeCosts = document.querySelector(`#edgeCosts`)
  considerEdgeCosts.addEventListener('click', async () => {
    graph.edges.forEach((edge) => {
      if (considerEdgeCosts.checked) {
        const edgeCost = Math.floor(Math.random() * 200 + 1)
        if (edge.labels.size > 0) {
          graph.setLabelText(edge.labels.get(0), `${edgeCost}`)
        } else {
          graph.addLabel(edge, `${edgeCost}`)
        }
      } else {
        edge.labels.toArray().forEach((label) => {
          graph.remove(label)
        })
      }
    })
    await runAlgorithm()
  })

  // k-Means
  const distanceCombobox = document.querySelector(`#distance-metrics`)
  distanceCombobox.addEventListener('change', runAlgorithm)
  const kMeansInput = document.querySelector(`#kMeansMaxClusterNumber`)
  kMeansInput.addEventListener('change', async (_) => {
    const value = parseFloat(kMeansInput.value)
    if (Number.isNaN(value) || value < 1) {
      alert('Desired maximum number of clusters should be greater than zero.')
      kMeansInput.value = '1'
      return
    }
    await runAlgorithm()
  })
  const iterationInput = document.querySelector(`#iterations`)
  iterationInput.addEventListener('change', async (_) => {
    const value = parseFloat(iterationInput.value)
    if (Number.isNaN(value) || value < 0) {
      alert('Desired maximum number of iterations should be non-negative.')
      iterationInput.value = '0'
      return
    }
    await runAlgorithm()
  })

  // hierarchical
  document.querySelector('#linkage')?.addEventListener('change', runAlgorithm)
}

/**
 * Remove all present cluster visuals.
 */
function removeClusterVisuals() {
  if (clusterVisualElement) {
    graphComponent.renderTree.remove(clusterVisualElement)
    clusterVisualElement = null
  }

  if (kMeansCentroidElement) {
    graphComponent.renderTree.remove(kMeansCentroidElement)
    kMeansCentroidElement = null
  }
}

/**
 * Returns the edge weight for the given edge.
 * @param edge The given edge
 * @returns The edge weight
 */
function getEdgeWeight(edge) {
  if (!document.querySelector(`#edgeCosts`).checked) {
    return 1
  }

  // if edge has at least one label...
  if (edge.labels.size > 0) {
    // ...try to return its value
    const edgeWeight = parseFloat(edge.labels.first().text)
    if (!Number.isNaN(edgeWeight)) {
      return edgeWeight > 0 ? edgeWeight : 1
    }
  }
  return 1
}

/**
 * Updates the elements of the UI's state and checks whether the buttons should be enabled or not.
 */
function setUIDisabled(disabled) {
  const samplesComboBox = document.querySelector(`#algorithms`)
  samplesComboBox.disabled = disabled
  graphComponent.inputMode.waiting = disabled
  busy = disabled
}

/**
 * Updates the description and the settings panel.
 * @param panelId The id of the panel to be updated
 */
function updateInformationPanel(panelId) {
  // set display none to all and then change only the desired one
  document.querySelector(`#edge-betweenness`).style.display = 'none'
  document.querySelector(`#k-means`).style.display = 'none'
  document.querySelector(`#hierarchical`).style.display = 'none'
  document.querySelector(`#biconnected-components`).style.display = 'none'
  document.querySelector(`#louvain-modularity`).style.display = 'none'
  document.querySelector(`#label-propagation`).style.display = 'none'
  document.querySelector(`#${panelId}`).style.display = 'inline-block'
}

run().then(finishLoading)
