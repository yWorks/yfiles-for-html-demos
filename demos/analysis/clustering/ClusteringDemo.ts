/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import {
  BiconnectedComponentClustering,
  BiconnectedComponentClusteringResult,
  DefaultLabelStyle,
  DistanceMetric,
  EdgeBetweennessClustering,
  EdgeBetweennessClusteringResult,
  EdgePathLabelModel,
  EdgeSides,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphHighlightIndicatorManager,
  GraphItemTypes,
  HierarchicalClustering,
  HierarchicalClusteringResult,
  ICanvasObject,
  ICanvasObjectDescriptor,
  IEdge,
  IGraph,
  IndicatorNodeStyleDecorator,
  INode,
  Insets,
  IRectangle,
  IVisualCreator,
  KMeansClustering,
  KMeansClusteringResult,
  LabelPropagationClustering,
  LabelPropagationClusteringResult,
  License,
  LinkageMethod,
  LouvainModularityClustering,
  LouvainModularityClusteringResult,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape
} from 'yfiles'

import * as ClusteringData from './resources/ClusteringData'
import { VoronoiDiagram } from './VoronoiDiagram'
import { PolygonVisual, VoronoiVisual } from './DemoVisuals'
import { DendrogramComponent } from './DendrogramSupport'
import {
  applyDemoTheme,
  createDemoEdgeStyle,
  createDemoShapeNodeStyle
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/**
 * The {@link GraphComponent} which contains the {@link IGraph}.
 */
let graphComponent: GraphComponent

/**
 * The {@link GraphComponent} for the visualization of the dendrogram in the hierarchical clustering.
 */
let dendrogramComponent: DendrogramComponent

/**
 * The canvas object for the cluster visual
 */
let clusterVisualObject: ICanvasObject | null

/**
 * The canvas object for the k-means centroids visual
 */
let kMeansCentroidObject: ICanvasObject | null

/**
 * The style for the directed edges
 */
let directedEdgeStyle: PolylineEdgeStyle

/**
 * The result of the clustering algorithm
 */
let result:
  | BiconnectedComponentClusteringResult
  | EdgeBetweennessClusteringResult
  | HierarchicalClusteringResult
  | KMeansClusteringResult
  | LouvainModularityClusteringResult
  | LabelPropagationClusteringResult

/**
 * Holds whether a clustering algorithm is running
 */
let busy = false

/**
 * The algorithm selected by the user
 */
let selectedAlgorithm: ClusteringAlgorithm

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the default styles
  configureGraph(graphComponent)

  // create the input mode
  configureUserInteraction(graphComponent)

  dendrogramComponent = new DendrogramComponent(graphComponent)

  // initialize the dendrogram component
  configureDendrogramComponent(dendrogramComponent)

  // load the graph and run the algorithm
  onAlgorithmChanged()

  // wire up the UI
  initializeUI()
}

/**
 * Initializes the default styles and the highlight style.
 */
function configureGraph(graphComponent: GraphComponent): void {
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
  const nodeHighlight = new IndicatorNodeStyleDecorator({
    wrapped: createDemoShapeNodeStyle(ShapeNodeShape.ELLIPSE, 'demo-palette-23'),
    zoomPolicy: 'mixed',
    padding: 3
  })
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: nodeHighlight
  })
}

/**
 * Configures user interaction for the given graph component.
 */
function configureUserInteraction(graphComponent: GraphComponent): void {
  const mode = new GraphEditorInputMode({
    allowEditLabel: false,
    showHandleItems: GraphItemTypes.NONE
  })

  // when an edge is created, run the algorithm again except for the k-means and hierarchical
  // because these two are independent of the edges of the graph
  mode.createEdgeInputMode.addEdgeCreatedListener((_, evt) => {
    if (
      selectedAlgorithm === ClusteringAlgorithm.EDGE_BETWEENNESS &&
      document.querySelector<HTMLInputElement>(`#directed`)!.checked
    ) {
      graphComponent.graph.setStyle(evt.item, directedEdgeStyle)
    }
    if (
      selectedAlgorithm != ClusteringAlgorithm.kMEANS &&
      selectedAlgorithm != ClusteringAlgorithm.HIERARCHICAL
    ) {
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
    if (
      selectedAlgorithm === ClusteringAlgorithm.HIERARCHICAL ||
      selectedAlgorithm === ClusteringAlgorithm.kMEANS
    ) {
      runAlgorithm()
    }
  })

  // add the hover listener
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  mode.itemHoverInputMode.discardInvalidItems = false
  mode.itemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    // if a node is hovered and the algorithm is HIERARCHICAL clustering, hover the corresponding dendrogram node
    if (selectedAlgorithm === ClusteringAlgorithm.HIERARCHICAL) {
      const node = evt.item
      graphComponent.highlightIndicatorManager.clearHighlights()
      if (node && result) {
        graphComponent.highlightIndicatorManager.addHighlight(node)
        dendrogramComponent.updateHighlight(
          (result as HierarchicalClusteringResult).getDendrogramNode(node as INode)!
        )
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
function configureDendrogramComponent(dendrogramComponent: DendrogramComponent): void {
  // add a dragging listener to run the hierarchical algorithm when the dragging of the cutoff line has finished
  dendrogramComponent.addDragFinishedListener(cutOffValue => {
    removeClusterVisuals()
    runHierarchicalClustering(cutOffValue)
  })
}

/**
 * Runs the clustering algorithm.
 */
function runAlgorithm(): void {
  if (!busy) {
    setUIDisabled(true)
    graphComponent.updateContentRect(new Insets(10))
    removeClusterVisuals()

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
        case ClusteringAlgorithm.LOUVAIN_MODULARITY:
          runLouvainModularityClustering()
          break
        case ClusteringAlgorithm.LABEL_PROPAGATION:
          runLabelPropagationClustering()
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
function runEdgeBetweennessClustering(): void {
  updateInformationPanel('edge-betweenness')

  const graph = graphComponent.graph

  // get the algorithm preferences from the right panel
  let minClusterCount = parseFloat(
    document.querySelector<HTMLInputElement>(`#ebMinClusterNumber`)!.value
  )
  const maxClusterCount = parseFloat(
    document.querySelector<HTMLInputElement>(`#ebMaxClusterNumber`)!.value
  )

  if (minClusterCount > maxClusterCount) {
    alert(
      'Desired minimum number of clusters cannot be larger than the desired maximum number of clusters.'
    )
    document.querySelector<HTMLInputElement>(`#ebMinClusterNumber`)!.value =
      maxClusterCount.toString()
    minClusterCount = maxClusterCount
  } else if (minClusterCount > graph.nodes.size) {
    alert(
      'Desired minimum number of clusters cannot be larger than the number of nodes in the graph.'
    )
    document.querySelector<HTMLInputElement>(`#ebMinClusterNumber`)!.value =
      graph.nodes.size.toString()
    minClusterCount = graph.nodes.size
  }

  // run the algorithm
  result = new EdgeBetweennessClustering({
    directed: document.querySelector<HTMLInputElement>(`#directed`)!.checked,
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
function runKMeansClustering(): void {
  updateInformationPanel('k-means')

  // get the algorithm preferences from the right panel
  let distanceMetric: DistanceMetric
  switch (document.querySelector<HTMLSelectElement>(`#distance-metrics`)!.selectedIndex) {
    default:
    case 0:
      distanceMetric = DistanceMetric.EUCLIDEAN
      break
    case 1:
      distanceMetric = DistanceMetric.MANHATTAN
      break
    case 2:
      distanceMetric = DistanceMetric.CHEBYCHEV
      break
  }

  // run the clustering algorithm
  result = new KMeansClustering({
    metric: distanceMetric,
    maximumIterations: parseFloat(document.querySelector<HTMLInputElement>(`#iterations`)!.value),
    k: parseFloat(document.querySelector<HTMLInputElement>(`#kMeansMaxClusterNumber`)!.value)
  }).run(graphComponent.graph)

  // visualize the result
  visualizeClusteringResult()
}

/**
 * Run the hierarchical clustering algorithm.
 * @param cutoff The given cut-off value to run the algorithm
 */
function runHierarchicalClustering(cutoff?: number): void {
  updateInformationPanel('hierarchical')

  const graph = graphComponent.graph
  // get the algorithm preferences from the right panel
  let linkage: LinkageMethod
  switch (document.querySelector<HTMLSelectElement>(`#linkage`)!.selectedIndex) {
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
    // if no cutoff is specified when runHierarchicalClustering is called, the clustering algorithm
    // should produce a single cluster with all nodes (i.e. not cut-off any nodes)
    // setting the algorithm's cutoff property to a negative value ensures a single cluster result
    cutoff: typeof cutoff === 'undefined' ? -1 : cutoff
  }).run(graph)

  // visualize the result
  visualizeClusteringResult()

  // draw the dendrogram from the algorithm's result
  dendrogramComponent.generateDendrogram(result, cutoff)
}

/**
 * Run the biconnected components clustering algorithm.
 */
function runBiconnectedComponentsClustering(): void {
  updateInformationPanel('biconnected-components')
  // run the algorithm
  result = new BiconnectedComponentClustering().run(graphComponent.graph)
  // visualize the result
  visualizeClusteringResult()
}

/**
 * Run the Louvain modularity clustering algorithm.
 */
function runLouvainModularityClustering(): void {
  updateInformationPanel('louvain-modularity')
  // run the algorithm
  result = new LouvainModularityClustering().run(graphComponent.graph)
  // visualize the result
  visualizeClusteringResult()
}

/**
 * Run the label propagation clustering algorithm.
 */
function runLabelPropagationClustering(): void {
  updateInformationPanel('label-propagation')
  // run the algorithm
  result = new LabelPropagationClustering().run(graphComponent.graph)
  // visualize the result
  visualizeClusteringResult()
}

/**
 * Visualizes the result of the clustering algorithm by adding the appropriate visuals.
 */
function visualizeClusteringResult(): void {
  const graph = graphComponent.graph

  // creates a map the holds for each cluster id, the list of nodes that belong to the particular cluster
  const clustering = new Map<number, IRectangle[]>()
  graph.nodes.forEach(node => {
    let clusterId: number = result.nodeClusterIds.get(node)!
    // biconnected components returns -1 as cluster id when only one node is present.
    // We change the clusterId manually here, as otherwise we'll get an exception in
    // DemoVisuals.PolygonVisual#createVisual
    if (clusterId === -1 && selectedAlgorithm === ClusteringAlgorithm.BICONNECTED_COMPONENTS) {
      clusterId = 0
    }
    let clusterNodesCoordinates: IRectangle[] | undefined = clustering.get(clusterId)
    if (!clusterNodesCoordinates) {
      clusterNodesCoordinates = []
      clustering.set(clusterId, clusterNodesCoordinates)
    }
    clusterNodesCoordinates.push(node.layout)
  })

  if (!clusterVisualObject) {
    let clusterVisual: IVisualCreator

    switch (selectedAlgorithm) {
      default:
      case ClusteringAlgorithm.EDGE_BETWEENNESS:
      case ClusteringAlgorithm.BICONNECTED_COMPONENTS: {
        // create a polygonal visual that encloses the nodes that belong to the same cluster
        const clusters = {
          number: clustering.size,
          clustering,
          centroids: []
        }
        clusterVisual = new PolygonVisual(false, clusters)
        break
      }
      case ClusteringAlgorithm.kMEANS: {
        const centroids = (result as KMeansClusteringResult).centroids
        if (clustering.size >= 3 && graphComponent.contentRect) {
          // create a voronoi diagram
          const clusters = {
            centroids: centroids
          }
          clusterVisual = new VoronoiVisual(
            new VoronoiDiagram(centroids, graphComponent.contentRect),
            clusters
          )
        } else {
          // if there exist only two clusters, create a polygonal visual with center marking
          const clusters = {
            number: clustering.size,
            clustering,
            centroids: centroids
          }
          clusterVisual = new PolygonVisual(true, clusters)
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
  }

  // invalidate the graphComponent
  graphComponent.invalidate()
}

/**
 * Called when the clustering algorithm changes
 */
function onAlgorithmChanged() {
  const algorithmsComboBox = document.querySelector<HTMLSelectElement>(`#algorithms`)!
  selectedAlgorithm = algorithmsComboBox.selectedIndex

  // determine the file name that will be used for loading the graph
  const fileName = algorithmsComboBox.value

  // Adjusts the window appearance. This method is needed since when the selected clustering algorithm is
  // HIERARCHICAL, the window has to be split to visualize the dendrogram.
  const showDendrogram = selectedAlgorithm === ClusteringAlgorithm.HIERARCHICAL
  dendrogramComponent.toggleVisibility(showDendrogram)
  graphComponent.fitGraphBounds(new Insets(10))

  // load the graph and run the algorithm
  loadGraph((ClusteringData as any)[fileName])
  runAlgorithm()
}

/**
 * Loads the sample graphs from a JSON file.
 * @param sampleData The data samples
 */
function loadGraph(sampleData: any): void {
  // remove all previous visuals
  removeClusterVisuals()

  const graph = graphComponent.graph
  graph.clear()

  const isEdgeBetweenness = selectedAlgorithm === ClusteringAlgorithm.EDGE_BETWEENNESS
  const styleFactory =
    isEdgeBetweenness && document.querySelector<HTMLInputElement>(`#directed`)!.checked
      ? () => directedEdgeStyle
      : () => undefined // tell GraphBuilder to use default styles

  const labelsFactory =
    isEdgeBetweenness && document.querySelector<HTMLInputElement>(`#edgeCosts`)!.checked
      ? () => Math.floor(Math.random() * 200 + 1).toString()
      : () => undefined // tell GraphBuilder not to create any labels

  // initialize a graph builder to parse the graph from the JSON file
  const builder = new GraphBuilder({
    graph: graph,
    nodes: [
      {
        data: sampleData.nodes,
        id: 'id',
        layout: (data: any): Rect => new Rect(data.x, data.y, data.w, data.h),
        labels: ['label']
      }
    ],
    edges: [
      {
        data: sampleData.edges,
        sourceId: 'source',
        targetId: 'target',
        style: styleFactory,
        labels: [labelsFactory]
      }
    ]
  })

  builder.buildGraph()

  graphComponent.fitGraphBounds(new Insets(10))
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  const graph = graphComponent.graph

  const samplesComboBox = document.querySelector<HTMLSelectElement>(`#algorithms`)!
  addNavigationButtons(samplesComboBox).addEventListener('change', onAlgorithmChanged)

  // edge-betweenness menu
  const minInput = document.querySelector<HTMLInputElement>(`#ebMinClusterNumber`)!
  minInput.addEventListener('change', _ => {
    const value = parseFloat(minInput.value)
    const maximumClusterNumber = parseFloat(
      document.querySelector<HTMLInputElement>(`#ebMaxClusterNumber`)!.value
    )
    if (isNaN(value) || value < 1) {
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
    runAlgorithm()
  })

  const maxInput = document.querySelector<HTMLInputElement>(`#ebMaxClusterNumber`)!
  maxInput.addEventListener('change', _ => {
    const value = parseFloat(maxInput.value)
    const minimumClusterNumber = parseFloat(
      document.querySelector<HTMLInputElement>(`#ebMinClusterNumber`)!.value
    )
    if (isNaN(value) || value < minimumClusterNumber || minimumClusterNumber < 1) {
      const message =
        value < minimumClusterNumber
          ? 'Desired maximum number of clusters cannot be smaller than the desired minimum number of clusters.'
          : 'Number of clusters should be non-negative.'
      alert(message)
      maxInput.value = minimumClusterNumber.toString()
      return
    }
    runAlgorithm()
  })

  const considerEdgeDirection = document.querySelector<HTMLInputElement>(`#directed`)!
  considerEdgeDirection.addEventListener('click', () => {
    const isChecked = considerEdgeDirection.checked
    graph.edges.forEach(edge => {
      graph.setStyle(edge, isChecked ? directedEdgeStyle : graph.edgeDefaults.style)
    })

    runAlgorithm()
  })

  const considerEdgeCosts = document.querySelector<HTMLInputElement>(`#edgeCosts`)!
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
  const distanceCombobox = document.querySelector<HTMLSelectElement>(`#distance-metrics`)!
  distanceCombobox.addEventListener('change', runAlgorithm)
  const kMeansInput = document.querySelector<HTMLInputElement>(`#kMeansMaxClusterNumber`)!
  kMeansInput.addEventListener('change', _ => {
    const value = parseFloat(kMeansInput.value)
    if (isNaN(value) || value < 1) {
      alert('Desired maximum number of clusters should be greater than zero.')
      kMeansInput.value = '1'
      return
    }
    runAlgorithm()
  })
  const iterationInput = document.querySelector<HTMLInputElement>(`#iterations`)!
  iterationInput.addEventListener('change', _ => {
    const value = parseFloat(iterationInput.value)
    if (isNaN(value) || value < 0) {
      alert('Desired maximum number of iterations should be non-negative.')
      iterationInput.value = '0'
      return
    }
    runAlgorithm()
  })

  // hierarchical
  document.querySelector('#linkage')?.addEventListener('change', runAlgorithm)
}

/**
 * Remove all present cluster visuals.
 */
function removeClusterVisuals(): void {
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
 * @param edge The given edge
 * @returns The edge weight
 */
function getEdgeWeight(edge: IEdge): number {
  if (!document.querySelector<HTMLInputElement>(`#edgeCosts`)!.checked) {
    return 1
  }

  // if edge has at least one label...
  if (edge.labels.size > 0) {
    // ...try to return its value
    const edgeWeight = parseFloat(edge.labels.first().text)
    if (!isNaN(edgeWeight)) {
      return edgeWeight > 0 ? edgeWeight : 1
    }
  }
  return 1
}

/**
 * Updates the elements of the UI's state and checks whether the buttons should be enabled or not.
 */
function setUIDisabled(disabled: boolean): void {
  const samplesComboBox = document.querySelector<HTMLSelectElement>(`#algorithms`)!
  samplesComboBox.disabled = disabled
  ;(graphComponent.inputMode as GraphEditorInputMode).waiting = disabled
  busy = disabled
}

/**
 * Updates the description and the settings panel.
 * @param panelId The id of the panel to be updated
 */
function updateInformationPanel(panelId: string): void {
  // set display none to all and then change only the desired one
  document.querySelector<HTMLDivElement>(`#edge-betweenness`)!.style.display = 'none'
  document.querySelector<HTMLDivElement>(`#k-means`)!.style.display = 'none'
  document.querySelector<HTMLDivElement>(`#hierarchical`)!.style.display = 'none'
  document.querySelector<HTMLDivElement>(`#biconnected-components`)!.style.display = 'none'
  document.querySelector<HTMLDivElement>(`#louvain-modularity`)!.style.display = 'none'
  document.querySelector<HTMLDivElement>(`#label-propagation`)!.style.display = 'none'
  document.querySelector<HTMLDivElement>(`#${panelId}`)!.style.display = 'inline-block'
}

enum ClusteringAlgorithm {
  EDGE_BETWEENNESS = 0,
  kMEANS = 1,
  HIERARCHICAL = 2,
  BICONNECTED_COMPONENTS = 3,
  LOUVAIN_MODULARITY = 4,
  LABEL_PROPAGATION = 5
}

run().then(finishLoading)
