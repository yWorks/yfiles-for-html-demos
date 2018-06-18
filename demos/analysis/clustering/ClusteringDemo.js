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

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  './DemoVisuals.js',
  './VoronoiDiagram.js',
  './DendrogramSupport.js',
  'resources/ClusteringData.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoVisuals,
  VoronoiDiagram,
  DendrogramSupport,
  ClusteringData
) => {
  /**
   * The {@link yfiles.view.GraphComponent} which contains the {@link yfiles.graph.IGraph}.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The {@link yfiles.view.GraphComponent} for the visualization of the dendrogram in the hierarchical clustering.
   * @type {DendrogramComponent}
   */
  let dendrogramComponent = null

  /**
   * The canvas object for the cluster visual
   * @type {yfiles.view.ICanvasObject}
   */
  let clusterVisualObject = null

  /**
   * The canvas object for the k-means centroids visual
   * @type {yfiles.view.ICanvasObject}
   */
  let kMeansCentroidObject = null

  /**
   * The graph adapter used for running the clustering algorithms
   * @type {yfiles.layout.YGraphAdapter}
   */
  let graphAdapter = null

  /**
   * The style for the directed edges
   * @type {yfiles.styles.PolylineEdgeStyle}
   */
  let directedEdgeStyle = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

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
    app.show(graphComponent)
  }

  /**
   * Initializes the default styles and the highlight style.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      shape: 'ellipse',
      fill: 'orange',
      stroke: null
    })

    // sets the edge style of the algorithms that support edge direction
    directedEdgeStyle = new yfiles.styles.PolylineEdgeStyle({
      targetArrow: yfiles.styles.IArrow.DEFAULT
    })

    // set the default style for node labels
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      font: 'bold Arial'
    })

    // set the default style for edge labels
    graph.edgeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      font: 'bold 10px Arial'
    })

    // For edge labels, the default is a label that is rotated to match the associated edge segment
    // We'll start by creating a model that is similar to the default:
    const edgeLabelModel = new yfiles.graph.EdgePathLabelModel({
      autoRotation: true,
      sideOfEdge: yfiles.graph.EdgeSides.ABOVE_EDGE,
      distance: 2
    })
    // Finally, we can set this label model as the default for edge labels
    graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()

    // highlight node style
    const nodeHighlight = new yfiles.view.NodeStyleDecorationInstaller({
      nodeStyle: new yfiles.styles.ShapeNodeStyle({
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
    const mode = new yfiles.input.GraphEditorInputMode({
      showHandleItems: yfiles.graph.GraphItemTypes.NONE
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
    mode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.NODE
    mode.itemHoverInputMode.discardInvalidItems = false
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, event) => {
      // if a node is hovered and the algorithm is HIERARCHICAL clustering, hover the corresponding dendrogram node
      if (
        document.getElementById('algorithmsComboBox').selectedIndex ===
        ClusteringAlgorithm.HIERARCHICAL
      ) {
        const node = event.item
        graphComponent.highlightIndicatorManager.clearHighlights()
        if (node) {
          graphComponent.highlightIndicatorManager.addHighlight(node)
        }
        dendrogramComponent.updateHighlight(node)
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
    dendrogramComponent = new DendrogramSupport.DendrogramComponent(graphComponent)
    // add a dragging listener to run the hierarchical algorithm's when the dragging of the cutoff line has finished
    dendrogramComponent.addDragFinishedListener(cutOffValue => {
      removeClusterVisuals()
      runHierarchicalClustering(false, cutOffValue)
    })

    // add a highlight listener
    dendrogramComponent.addHighlightChangedListener(nodesToHighlight => {
      const highlightManager = graphComponent.highlightIndicatorManager
      highlightManager.clearHighlights()
      if (nodesToHighlight.length > 0) {
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
    setUIDisabled(true)
    graphComponent.updateContentRect(new yfiles.geometry.Insets(10))
    removeClusterVisuals()

    const selectedAlgorithm = document.getElementById('algorithmsComboBox').selectedIndex
    if (graphComponent.graph.nodes.size > 0) {
      switch (selectedAlgorithm) {
        default:
        case ClusteringAlgorithm.EDGE_BETWEENNESS:
          runEdgeBetweennessClustering()
          setUIDisabled(false)
          break
        case ClusteringAlgorithm.kMEANS:
          runKMeansClustering()
          setUIDisabled(false)
          break
        case ClusteringAlgorithm.HIERARCHICAL:
          runHierarchicalClustering(true, 5000).then(() => setUIDisabled(false))
          break
        case ClusteringAlgorithm.BICONNECTED_COMPONENTS:
          runBiconnectedComponentsClustering()
          setUIDisabled(false)
          break
      }
    } else {
      if (selectedAlgorithm === ClusteringAlgorithm.HIERARCHICAL) {
        dendrogramComponent.generateDendrogram(new yfiles.algorithms.Dendrogram(), null)
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
    let minClusterNumber = parseFloat(document.getElementById('ebMinClusterNumber').value)
    const maxClusterNumber = parseFloat(document.getElementById('ebMaxClusterNumber').value)

    if (minClusterNumber > maxClusterNumber) {
      alert(
        'Desired minimum number of clusters cannot be larger than the desired maximum number of clusters.'
      )
      document.getElementById('ebMinClusterNumber').value = maxClusterNumber
      minClusterNumber = maxClusterNumber
    } else if (minClusterNumber > graph.nodes.size) {
      alert(
        'Desired minimum number of clusters cannot be larger than the number of nodes in the graph.'
      )
      document.getElementById('ebMinClusterNumber').value = graph.nodes.size
      minClusterNumber = graph.nodes.size
    }

    graphAdapter = new yfiles.layout.YGraphAdapter(graph)
    const yGraph = graphAdapter.yGraph
    const clusterIds = yGraph.createNodeMap()

    const directed = document.getElementById('directed').checked
    const edgeCostProvider = graphAdapter.createDataProvider(
      yfiles.graph.IEdge.$class,
      yfiles.lang.Number.$class,
      getEdgeWeight
    )

    // run the algorithm
    yfiles.algorithms.Groups.edgeBetweennessClustering(
      yGraph,
      clusterIds,
      directed,
      minClusterNumber,
      maxClusterNumber,
      edgeCostProvider
    )

    // visualize the result
    visualizeClusteringResult(clusterIds)

    // clean up
    yGraph.disposeNodeMap(clusterIds)
  }

  /**
   * Runs the k-means clustering algorithm.
   */
  function runKMeansClustering() {
    updateInformationPanel('k-means')

    const graph = graphComponent.graph
    graphAdapter = new yfiles.layout.YGraphAdapter(graph)
    const yGraph = graphAdapter.yGraph
    const clusterIds = yGraph.createNodeMap()
    const nodePositions = yGraph.createNodeMap()

    // calculate the node distances to create the distance matrix
    graph.nodes.forEach(node => {
      const copiedNode = graphAdapter.getCopiedNode(node)
      nodePositions.set(copiedNode, new yfiles.algorithms.YPoint(node.layout.x, node.layout.y))
    })

    // get the algorithm preferences from the right panel
    let distanceMetric
    switch (document.getElementById('distanceMetricComboBox').selectedIndex) {
      default:
      case 0:
        distanceMetric = yfiles.algorithms.DistanceMetric.EUCLIDEAN
        break
      case 1:
        distanceMetric = yfiles.algorithms.DistanceMetric.EUCLIDEAN_SQUARED
        break
      case 2:
        distanceMetric = yfiles.algorithms.DistanceMetric.MANHATTAN
        break
      case 3:
        distanceMetric = yfiles.algorithms.DistanceMetric.CHEBYCHEV
        break
    }
    const maxClusterNumber = parseFloat(document.getElementById('kMeansMaxClusterNumber').value)
    const iterations = parseFloat(document.getElementById('iterations').value)

    // run the clustering algorithm
    yfiles.algorithms.Groups.kMeansClustering(
      yGraph,
      clusterIds,
      nodePositions,
      distanceMetric,
      maxClusterNumber,
      iterations
    )

    // visualize the result
    visualizeClusteringResult(clusterIds)

    // clean up
    yGraph.disposeNodeMap(clusterIds)
    yGraph.disposeNodeMap(nodePositions)
  }

  /**
   * Run the hierarchical clustering algorithm.
   * @param {boolean} computeDendrogram True if the dendrogram should be computed, false otherwise
   * @param {number} cutOffValue The given cut-off value to run the algorithm
   * @return {Promise} a promise which resolves when the dendrogram is created/updated.
   */
  function runHierarchicalClustering(computeDendrogram, cutOffValue) {
    updateInformationPanel('hierarchical')

    const graph = graphComponent.graph
    if (computeDendrogram) {
      graphAdapter = new yfiles.layout.YGraphAdapter(graph)
    }
    const yGraph = graphAdapter.yGraph
    const clusterIds = yGraph.createNodeMap()

    const node2layout = new yfiles.collections.Mapper()
    graph.nodes.forEach(node => {
      node2layout.set(graphAdapter.getCopiedNode(node), node.layout.center)
    })
    // calculate the node distances to create the distance matrix
    const nodeDistanceProvider = new yfiles.algorithms.INodeDistanceProvider((n1, n2) => {
      const center1 = node2layout.get(n1)
      const center2 = node2layout.get(n2)
      return center1.distanceTo(center2)
    })

    // get the algorithm preferences from the right panel
    let linkage
    switch (document.getElementById('linkageComboBox').selectedIndex) {
      default:
      case 0:
        linkage = yfiles.algorithms.Linkage.SINGLE
        break
      case 1:
        linkage = yfiles.algorithms.Linkage.AVERAGE
        break
      case 2:
        linkage = yfiles.algorithms.Linkage.COMPLETE
        break
    }

    // run the algorithm that calculates only the node clusters
    const clusters = yfiles.algorithms.Groups.hierarchicalClustering(
      yGraph,
      clusterIds,
      nodeDistanceProvider,
      linkage,
      cutOffValue
    )

    // visualize the result
    visualizeClusteringResult(clusterIds)

    if (computeDendrogram) {
      // run the algorithm that computes the dendrogram
      const dendrogram = yfiles.algorithms.Groups.hierarchicalClustering(
        yGraph,
        nodeDistanceProvider,
        linkage
      )
      yGraph.nodes.forEach(node => {
        clusterIds.set(node, 0)
      })

      // create the dendrogram from the algorithm's result
      return dendrogramComponent.generateDendrogram(dendrogram, graphAdapter)
    }
    const colors = generateColors(
      yfiles.view.Color.DARK_BLUE,
      yfiles.view.Color.CORNFLOWER_BLUE,
      clusters + 1
    )
    dendrogramComponent.resetStyles()
    graph.nodes.forEach(node => {
      const clusterId = clusterIds.get(graphAdapter.getCopiedNode(node))
      dendrogramComponent.updateNodeState(node, colors[clusterId])
    })
    // clean up
    yGraph.disposeNodeMap(clusterIds)
    return Promise.resolve()
  }

  /**
   * Run the biconnected components clustering algorithm.
   */
  function runBiconnectedComponentsClustering() {
    updateInformationPanel('biconnected-components')

    const graph = graphComponent.graph
    graphAdapter = new yfiles.layout.YGraphAdapter(graph)
    const yGraph = graphAdapter.yGraph
    const clusterIds = yGraph.createNodeMap()

    // run the algorithm
    yfiles.algorithms.Groups.biconnectedComponentGrouping(yGraph, clusterIds)

    // visualize the result
    visualizeClusteringResult(clusterIds)

    // clean up
    yGraph.disposeNodeMap(clusterIds)
  }

  /**
   * Visualizes the result of the clustering algorithm by adding the appropriate visuals.
   * @param {yfiles.algorithms.INodeMap} clusterIds A node map that holds for each node, its cluster id
   */
  function visualizeClusteringResult(clusterIds) {
    const graph = graphComponent.graph
    const selectedIndex = document.getElementById('algorithmsComboBox').selectedIndex

    // creates a map the holds for each cluster id, the list of nodes that belong to the particular cluster
    const clustering = new Map()
    graph.nodes.forEach(node => {
      const copiedNode = graphAdapter.getCopiedNode(node)
      const clusterId = clusterIds.get(copiedNode) || 0
      let clusterNodesCoordinates = clustering.get(clusterId)
      if (!clusterNodesCoordinates) {
        clusterNodesCoordinates = []
        clustering.set(clusterId, clusterNodesCoordinates)
      }
      clusterNodesCoordinates.push(node.layout)
    })

    // calculate the center nodes of each cluster
    const centroids = []
    if (selectedIndex === ClusteringAlgorithm.kMEANS) {
      for (let i = 0; i < clustering.size; i++) {
        const nodeBounds = clustering.get(i)

        let sumX = 0
        let sumY = 0
        nodeBounds.forEach(layout => {
          sumX += layout.x
          sumY += layout.y
        })
        centroids.push(
          new yfiles.algorithms.YPoint(sumX / nodeBounds.length, sumY / nodeBounds.length)
        )
      }
    }

    if (!clusterVisualObject) {
      let clusterVisual

      switch (selectedIndex) {
        default:
        case ClusteringAlgorithm.EDGE_BETWEENNESS:
        case ClusteringAlgorithm.BICONNECTED_COMPONENTS: {
          // create a polygonal visual that encloses the nodes that belong to the same cluster
          clusterVisual = new DemoVisuals.PolygonVisual()
          break
        }
        case ClusteringAlgorithm.kMEANS: {
          if (clustering.size >= 3) {
            // create a voronoi diagram
            clusterVisual = new DemoVisuals.VoronoiVisual(
              new VoronoiDiagram(centroids, graphComponent.contentRect)
            )
          } else {
            // if there exist only two clusters, create a polygonal visual with center marking
            clusterVisual = new DemoVisuals.PolygonVisual(true)
          }
          break
        }
      }

      // add the visual to the graphComponent's background group
      clusterVisualObject = graphComponent.backgroundGroup.addChild(
        clusterVisual,
        yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
      )
      clusterVisualObject.toBack()

      // update the information for the visual object
      clusterVisualObject.userObject.clusters = {
        number: clustering.size,
        clustering,
        centroids,
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
    graphComponent.fitGraphBounds(new yfiles.geometry.Insets(10))

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
    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = sampleData.nodes
    builder.edgesSource = sampleData.edges
    builder.nodeIdBinding = 'id'
    builder.sourceNodeBinding = 'source'
    builder.targetNodeBinding = 'target'
    builder.locationXBinding = 'x'
    builder.locationYBinding = 'y'
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
    graphComponent.fitGraphBounds(new yfiles.geometry.Insets(10))
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const graph = graphComponent.graph
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)

    const samplesComboBox = document.getElementById('algorithmsComboBox')
    app.bindAction("button[data-command='PreviousFile']", () => {
      samplesComboBox.selectedIndex = Math.max(0, samplesComboBox.selectedIndex - 1)
      onAlgorithmChanged()
    })
    app.bindAction("button[data-command='NextFile']", () => {
      samplesComboBox.selectedIndex = Math.min(
        samplesComboBox.selectedIndex + 1,
        samplesComboBox.options.length - 1
      )
      onAlgorithmChanged()
    })

    app.bindChangeListener("select[data-command='AlgorithmSelectionChanged']", onAlgorithmChanged)
    app.bindAction("button[data-command='RunAlgorithm']", runAlgorithm)

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
    app.bindChangeListener("select[data-command='distanceMetricComboBox']", runAlgorithm)
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
    app.bindChangeListener("select[data-command='linkageComboBox']", runAlgorithm)
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
   * @param {yfiles.graph.IEdge} edge The given edge
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
   * Generates random colors for nodes and edges.
   * @param {yfiles.view.Color} startColor The start color
   * @param {yfiles.view.Color} endColor The end color
   * @param {number} gradientCount The number of gradient steps
   * @return {Array} An array or random gradient colors
   */
  function generateColors(startColor, endColor, gradientCount) {
    const colors = []
    const stepCount = gradientCount - 1

    for (let i = 0; i < gradientCount; i++) {
      const r = (startColor.r * (stepCount - i) + endColor.r * i) / stepCount
      const g = (startColor.g * (stepCount - i) + endColor.g * i) / stepCount
      const b = (startColor.b * (stepCount - i) + endColor.b * i) / stepCount
      const a = (startColor.a * (stepCount - i) + endColor.a * i) / stepCount
      colors[i] = new yfiles.view.Color(r | 0, g | 0, b | 0, a | 0)
    }
    return colors.reverse()
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

  const ClusteringAlgorithm = yfiles.lang.Enum('ClusteringAlgorithm', {
    EDGE_BETWEENNESS: 0,
    kMEANS: 1,
    HIERARCHICAL: 2,
    BICONNECTED_COMPONENTS: 3
  })

  // Run the demo
  run()
})
