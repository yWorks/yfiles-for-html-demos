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
  './DemoStyles.js',
  './HTMLPopupSupport.js',
  './NetworkFlowsHelper.js',
  'yfiles/layout-hierarchic',
  'yfiles/view-layout-bridge',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  HTMLPopupSupport,
  NetworkFlowsHelper
) => {
  /**
   * The GraphComponent
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The minCutLine visual object
   * @type {MinCutLine}
   */
  let minCutLine = null

  /**
   * The HTML Popup for this demo.
   * @type {HTMLPopupSupport}
   */
  let edgePopup = null

  /**
   * Determines if a layout is currently running.
   * @type {boolean}
   */
  let inLayout = false

  /**
   * Holds the latest flow values for each edge.
   * @type {yfiles.collections.Mapper}
   */
  const lastFlowMap = new yfiles.collections.Mapper()

  /**
   * Constant for MAX-FLOW algorithm.
   * @type {number}
   */
  const MAX_FLOW = 0

  /**
   * Constant for MIN-COST algorithm.
   * @type {number}
   */
  const MIN_COST_FLOW = 1

  /**
   * Constant for MAX-FLOW-MIN-COST algorithm.
   * @type {number}
   */
  const MAX_FLOW_MIN_CUT = 2

  /**
   * Holds the graph nodes that have to change if one of their adjacent edges is deleted.
   * @type {Array}
   */
  let nodesToChange = []

  /**
   * Holds the compoundEdit that is created when a dragging event starts.
   * @type {yfiles.graph.ICompoundEdit}
   */
  let compoundEdit = null

  /**
   * Runs the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeGraph()
    initializeGraphComponent()
    createEditorInputMode()
    graphComponent.fitGraphBounds()
    createSampleGraph()
    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the graph.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    // initialize default node/edge styles
    graph.nodeDefaults.style = new DemoStyles.NetworkFlowNodeStyle()
    graph.nodeDefaults.size = new yfiles.geometry.Size(60, 30)
    graph.edgeDefaults.style = new DemoStyles.NetworkFlowEdgeStyle()

    // enable the undo engine
    graph.undoEngineEnabled = true

    // add preferred placement for labels
    graph.mapperRegistry.createDelegateMapper(
      yfiles.graph.ILabel.$class,
      yfiles.layout.PreferredPlacementDescriptor.$class,
      yfiles.layout.LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
      key => {
        const preferredPlacementDescriptor = new yfiles.layout.PreferredPlacementDescriptor()
        if (key.tag === 'cost') {
          preferredPlacementDescriptor.sideOfEdge = yfiles.layout.LabelPlacements.LEFT_OF_EDGE
          preferredPlacementDescriptor.distanceToEdge = 5
        } else {
          preferredPlacementDescriptor.sideOfEdge = yfiles.layout.LabelPlacements.ON_EDGE
        }

        preferredPlacementDescriptor.freeze()
        return preferredPlacementDescriptor
      }
    )

    graph.edgeDefaults.labels.layoutParameter = yfiles.graph.FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

    graph.edgeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      font: '11px Arial',
      backgroundStroke: 'skyblue',
      backgroundFill: 'aliceblue'
    })

    const decorator = graph.decorator
    decorator.nodeDecorator.reshapeHandleProviderDecorator.setImplementation(
      new NetworkFlowsHelper.EmptyReshapeHandleProvider()
    )

    const edgeStyleHighlight = new yfiles.view.EdgeStyleDecorationInstaller({
      edgeStyle: new DemoStyles.NetworkFlowEdgeStyle(yfiles.view.Color.DARK_ORANGE),
      zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES
    })
    decorator.edgeDecorator.highlightDecorator.setImplementation(edgeStyleHighlight)
    decorator.edgeDecorator.selectionDecorator.hideImplementation()

    decorator.labelDecorator.selectionDecorator.hideImplementation()
    decorator.labelDecorator.focusIndicatorDecorator.hideImplementation()
  }

  /**
   * Initializes the GraphComponent.
   */
  function initializeGraphComponent() {
    minCutLine = new DemoStyles.MinCutLine()
    graphComponent.highlightGroup.addChild(
      minCutLine,
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )

    const edgePopupContent = window.document.getElementById('edgePopupContent')
    // We use the EdgePathLabelModel for the edge pop-up
    const edgeLabelModel = new yfiles.graph.EdgePathLabelModel({
      autoRotation: false,
      sideOfEdge: yfiles.graph.EdgeSides.LEFT_OF_EDGE,
      distance: 25
    })

    // Creates the pop-up for the edge pop-up template
    edgePopup = new HTMLPopupSupport(
      graphComponent,
      edgePopupContent,
      edgeLabelModel.createDefaultParameter()
    )

    graphComponent.addZoomChangedListener(() => {
      graphComponent.invalidate()
    })
  }

  /**
   * Creates and configures the input mode.
   * @return {yfiles.input.GraphEditorInputMode}
   */
  function createEditorInputMode() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      allowAddLabel: false,
      allowEditLabel: false,
      allowClipboardOperations: true,
      allowCreateBend: false,
      deletableItems: yfiles.graph.GraphItemTypes.ALL & ~yfiles.graph.GraphItemTypes.LABEL
    })

    const networkFlowsInputMode = new NetworkFlowsHelper.NetworkFlowInputMode()
    networkFlowsInputMode.priority = 1
    networkFlowsInputMode.addDragFinished((item, oldTag) => {
      if (yfiles.graph.INode.isInstance(item)) {
        const tagUndoUnit = new NetworkFlowsHelper.TagUndoUnit(
          'Supply/demand changed',
          'Supply/demand changed',
          oldTag,
          item.tag,
          item
        )
        graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
        runFlowAlgorithm()
        if (compoundEdit) {
          compoundEdit.commit()
        }
      } else {
        const tagUndoUnit = new NetworkFlowsHelper.TagUndoUnit(
          'Capacity changed',
          'Capacity changed',
          oldTag,
          item.tag,
          item
        )
        graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
        calculateNodeSize(item.sourceNode)
        calculateNodeSize(item.targetNode)
        runFlowAlgorithm()
        runLayout(true, () => {
          if (compoundEdit) {
            compoundEdit.commit()
          }
        })
      }
    })
    networkFlowsInputMode.addDragStartedListener(() => {
      compoundEdit = graphComponent.graph.beginEdit('Dragging', 'Dragging')
    })

    inputMode.add(networkFlowsInputMode)

    // deletion
    inputMode.addDeletedSelectionListener(() => {
      const deletedCompoundEdit = graphComponent.graph.beginEdit(
        'Element deleted',
        'Element deleted'
      )
      // if an edge was removed, calculate the new node size of its endpoints
      if (nodesToChange.length > 0) {
        nodesToChange.forEach(node => {
          if (graphComponent.graph.contains(node)) {
            calculateNodeSize(node)
          }
        })
        nodesToChange = []
      }
      runFlowAlgorithm()
      runLayout(true, () => {
        deletedCompoundEdit.commit()
      })
    })

    inputMode.addDeletingSelectionListener((sender, args) => {
      edgePopup.currentItem = null
      // collect all nodes that are endpoints of removed edges
      args.selection.forEach(item => {
        if (yfiles.graph.IEdge.isInstance(item)) {
          nodesToChange.push(item.sourceNode)
          nodesToChange.push(item.targetNode)
        }
      })
    })

    // do not allow self-loops
    inputMode.createEdgeInputMode.allowSelfloops = false

    // edge creation
    inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
      const edgeCreatedCompoundEdit = graphComponent.graph.beginEdit('EdgeCreation', 'EdgeCreation')
      const edge = args.item
      edge.tag = {
        capacity: 10,
        cost: 1,
        color: yfiles.view.Color.CORNFLOWER_BLUE,
        id: graphComponent.graph.edgeCount++
      }

      updateEdgeThickness(edge)

      // update the size of the source and target nodes
      calculateNodeSize(edge.sourceNode)
      calculateNodeSize(edge.targetNode)
      runFlowAlgorithm()
      runLayout(
        true,
        () => {
          edgeCreatedCompoundEdit.commit()
        },
        [edge.sourceNode, edge.targetNode]
      )
    })

    inputMode.addNodeCreatedListener((sender, event) => {
      event.item.tag = {
        supply: 0,
        flow: 0,
        adjustable: document.getElementById('algorithmComboBox').selectedIndex === MIN_COST_FLOW
      }
    })

    inputMode.addCanvasClickedListener(() => {
      edgePopup.currentItem = null
    })

    inputMode.addItemClickedListener(onClicked.bind(this))
    graphComponent.inputMode = inputMode
  }

  /**
   * Presents a popup that provides buttons for increasing/decreasing the edge capacity.
   * @param {Object} sender The sender of the event
   * @param {yfiles.input.ItemClickedEventArgs} args The event data
   */
  function onClicked(sender, args) {
    const item = args.item
    if (yfiles.graph.ILabel.isInstance(item) && item.tag === 'cost') {
      document.getElementById('cost-form').value = parseInt(item.text)
      edgePopup.currentItem = item.owner
      return
    }

    edgePopup.currentItem = null
  }

  /**
   * Calculates the node size based on the thickness of incoming and outgoing edges.
   * @param {yfiles.graph.INode} node The given node
   */
  function calculateNodeSize(node) {
    const graph = graphComponent.graph

    let incomingCapacity = 0
    graph.inEdgesAt(node).forEach(inEdge => {
      incomingCapacity += inEdge.tag.capacity
    })

    let outgoingCapacity = 0
    graph.outEdgesAt(node).forEach(outEdge => {
      outgoingCapacity += outEdge.tag.capacity
    })

    const height = Math.max(incomingCapacity, outgoingCapacity)
    const newBounds = new yfiles.geometry.Rect(
      node.layout.x,
      node.layout.y,
      node.layout.width,
      Math.max(height, 30)
    )
    graph.setNodeLayout(node, newBounds)
  }

  /**
   * Updates the thickness of the given edge. The thickness is the percentage of flow that passes through an edge in
   * comparison to the overall thickness.
   * @param {yfiles.graph.IEdge} edge The given edge
   */
  function updateEdgeThickness(edge) {
    if (edge.labels.size === 0) {
      // add label for capacity
      graphComponent.graph.addLabel({
        owner: edge,
        text: `0 / ${edge.tag.capacity}`,
        layoutParameter: new yfiles.graph.FreeEdgeLabelModel().createDefaultParameter(),
        style: new yfiles.styles.DefaultLabelStyle({ textFill: 'black' })
      })

      // add label for cost
      const algorithmComboBox = document.getElementById('algorithmComboBox')
      if (algorithmComboBox.selectedIndex === MIN_COST_FLOW) {
        graphComponent.graph.addLabel({
          owner: edge,
          text: `${edge.tag.cost} \u20AC `,
          tag: 'cost',
          style: graphComponent.graph.edgeDefaults.labels.style
        })
      }
    }
  }

  /**
   * Runs the flow algorithm.
   */
  function runFlowAlgorithm() {
    const graph = graphComponent.graph

    if (inLayout || graph.nodes.size === 0) {
      return
    }

    // remove tags for the nodes that belong to the cut
    // needed only for max-flow min-cut
    graphComponent.graph.nodes.forEach(node => {
      node.tag.cut = false
    })

    // determine the algorithm to run
    const algorithmComboBox = document.getElementById('algorithmComboBox')
    let flowValue
    switch (algorithmComboBox.selectedIndex) {
      case MAX_FLOW_MIN_CUT:
        flowValue = calculateMaxFlowMinCut(true)
        break
      case MIN_COST_FLOW:
        flowValue = calculateMinCostFlow()
        break
      default:
      case MAX_FLOW:
        flowValue = calculateMaxFlowMinCut(false)
        break
    }

    // update flow information
    const flowLabel = document.getElementById('flowInformationLabel')
    flowLabel.innerHTML = `${algorithmComboBox[algorithmComboBox.selectedIndex].text}`
    flowLabel.style.display = 'inline-block'
    const flowInput = document.getElementById('flowValue')
    flowInput.style.display = 'inline-block'
    flowInput.value = flowValue
  }

  /**
   * Runs the maximum flow minimum cost algorithm.
   * @param {boolean} minCut True if the min cut should be also calculated, false otherwise
   */
  function calculateMaxFlowMinCut(minCut) {
    const graph = graphComponent.graph

    graph.edges.forEach(edge => {
      const labels = edge.labels
      if (labels.size > 1) {
        graph.remove(labels.get(1))
      }
    })

    const sourceNodes = getSourceNodes()
    const sinkNodes = getSinkNodes()

    // as we want to use a single-source-single-sink-max-flow algorithm we add a dummy 'super source' and 'super sink'
    const superSource = graph.createNode()
    const superSink = graph.createNode()

    // connect the superSource with each source and all sinks with the superSink
    sourceNodes.forEach(node => {
      graph.createEdge({
        source: superSource,
        target: node,
        tag: {
          capacity: 0x7fffffff
        }
      })
    })

    sinkNodes.forEach(node => {
      graph.createEdge({
        source: node,
        target: superSink,
        tag: {
          capacity: 0x7fffffff
        }
      })
    })

    // calculate the maximum flow using the edge capacities stored in the edge tags
    const adapter = new yfiles.layout.YGraphAdapter(graph)
    const flowMap = adapter.yGraph.createEdgeMap()
    const sourceCutNM = adapter.yGraph.createNodeMap()
    const edgeCapacity = adapter.createEdgeMap(edge => edge.tag.capacity)

    const maxFlowMinCut = yfiles.algorithms.NetworkFlows.calcMaxFlowMinCut(
      adapter.yGraph,
      adapter.getCopiedNode(superSource),
      adapter.getCopiedNode(superSink),
      edgeCapacity,
      flowMap,
      sourceCutNM
    )

    // finally remove the dummy superSource and superSink
    graph.remove(superSource)
    graph.remove(superSink)

    graph.nodes.forEach(node => {
      let flow = 0
      if (graph.inDegree(node) > 0) {
        graph.inEdgesAt(node).forEach(edge => {
          flow += flowMap.get(adapter.getCopiedEdge(edge))
        })
      } else {
        graph.outEdgesAt(node).forEach(edge => {
          flow += flowMap.get(adapter.getCopiedEdge(edge))
        })
      }
      node.tag = {
        flow,
        supply: 0,
        adjustable: false
      }
    })

    sourceNodes.forEach(sourceNode => {
      sourceNode.tag.source = true
    })
    sinkNodes.forEach(sinkNode => {
      sinkNode.tag.sink = true
    })

    // add the flow values as tags to edges
    graph.edges.forEach(edge => {
      edge.tag.flow = flowMap.get(adapter.getCopiedEdge(edge))
    })

    if (minCut) {
      // add tags for the nodes that belong to the cut
      graph.nodes.forEach(node => {
        node.tag.cut = sourceCutNM.getBoolean(adapter.getCopiedNode(node))
      })
    }

    // show the result
    visualizeResult()
    return maxFlowMinCut
  }

  /**
   * Runs the minimum cost flow algorithm.
   */
  function calculateMinCostFlow() {
    const graph = graphComponent.graph
    const supplySum = getSupplySum(graph)

    const superSource = createSuperSource(graph, supplySum < 0 ? -supplySum : 0)
    const superSink = createSuperSink(graph, supplySum > 0 ? -supplySum : 0)

    const adapter = new yfiles.layout.YGraphAdapter(graph)
    const maxFlowMap = adapter.yGraph.createEdgeMap()
    const flowMap = adapter.yGraph.createEdgeMap()
    const dualsMap = adapter.yGraph.createNodeMap()

    // the capacity of an edge is stored in its tag
    const edgeCapacity = adapter.createEdgeMap(edge => edge.tag.capacity)
    const copiedSuperSource = adapter.getCopiedNode(superSource)
    const copiedSuperSink = adapter.getCopiedNode(superSink)

    // first calculated max flow between super source and super sink to find the supply/demand of the nodes connected
    // to super source and super sink
    yfiles.algorithms.NetworkFlows.calcMaxFlow(
      adapter.yGraph,
      copiedSuperSource,
      copiedSuperSink,
      edgeCapacity,
      maxFlowMap
    )

    graph.outEdgesAt(superSource).forEach(edge => {
      edge.targetNode.tag.supplyDemand = maxFlowMap.getInt(adapter.getCopiedEdge(edge))
    })

    graph.inEdgesAt(superSink).forEach(edge => {
      edge.sourceNode.tag.supplyDemand = -maxFlowMap.getInt(adapter.getCopiedEdge(edge))
    })

    // as edge costs we use the geometric edge length
    const edgeCosts = adapter.createEdgeMap(edge => (edge.tag && edge.tag.cost ? edge.tag.cost : 0))

    // the supply or demand of a node was calculated in calculateMaxFlow and set as node tag
    const supplyOrDemand = adapter.createNodeMap(
      node => (node.tag.supplyDemand ? node.tag.supplyDemand : 0)
    )

    // this value will be returned only if for some reason no feasible solution is found
    let minCostFlow = -1

    try {
      minCostFlow = yfiles.algorithms.NetworkFlows.minCostFlow(
        adapter.yGraph,
        edgeCapacity,
        edgeCosts,
        supplyOrDemand,
        flowMap,
        dualsMap
      )
    } catch (err) {
      alert(err)
    } finally {
      const originalFlowMap = adapter.createMapper(flowMap)
      graph.remove(superSource)
      graph.remove(superSink)

      // store the flow for each edge in its tag
      graph.edges.forEach(edge => {
        edge.tag.flow = originalFlowMap.get(edge) || 0

        if (edge.labels.size > 1) {
          // add label for cost
          graph.setLabelText(edge.labels.get(1), `${edge.tag.cost} \u20AC `)
        } else {
          // add label for cost
          graph.addLabel({
            owner: edge,
            text: `${edge.tag.cost} \u20AC `,
            tag: 'cost',
            style: graph.edgeDefaults.labels.style
          })
        }
      })

      // show the result
      visualizeResult()

      graph.nodes.forEach(node => {
        let flow = 0
        if (graph.inDegree(node) > 0) {
          graph.inEdgesAt(node).forEach(edge => {
            flow += edge.tag.flow
          })
        }
        node.tag = {
          flow,
          supply: node.tag.supply,
          adjustable: true
        }
      })

      getSupplyNodes(graph).forEach(supplyNode => {
        supplyNode.tag.source = true
      })
      getDemandNodes(graph).forEach(demandNode => {
        demandNode.tag.sink = true
      })
    }
    return minCostFlow
  }

  /**
   * Creates a temporary source node that is connected to all supply-nodes.
   * @param {yfiles.graph.IGraph} graph The input graph
   * @param {number} supply The new node supply
   * @returns {yfiles.graph.INode} The newly created super source node
   */
  function createSuperSource(graph, supply) {
    const superSource = graph.createNode({
      tag: { supply: supply / graph.nodeDefaults.size.height }
    })
    const supplyNodes = getSupplyNodes(graph)
    supplyNodes.forEach(node => {
      graph.createEdge({
        source: superSource,
        target: node,
        tag: { capacity: Math.round(node.tag.supply * node.layout.height) }
      })
    })
    return superSource
  }

  /**
   * Creates a temporary sink node that is connected to all demand-nodes.
   * @param {yfiles.graph.IGraph} graph The input graph
   * @param {number} demand The new node demand
   * @returns {yfiles.graph.INode} The newly created super sink node
   */
  function createSuperSink(graph, demand) {
    const superSink = graph.createNode({ tag: { supply: demand / graph.nodeDefaults.size.height } })
    const demandNodes = getDemandNodes(graph)
    demandNodes.forEach(node => {
      graph.createEdge({
        source: node,
        target: superSink,
        tag: { capacity: Math.round(-node.tag.supply * node.layout.height) }
      })
    })
    return superSink
  }

  /**
   * Returns an array of all supply-nodes.
   * @param {yfiles.graph.IGraph} graph The input graph
   * @returns {Array} An array of all supply-nodes.
   */
  function getSupplyNodes(graph) {
    const supplyNodes = []
    graph.nodes.forEach(node => {
      if (node.tag.supply > 0) {
        supplyNodes.push(node)
      }
    })
    return supplyNodes
  }

  /**
   * Returns an array of all demand-nodes.
   * @param {yfiles.graph.IGraph} graph The input graph
   * @returns {Array} An array of all demand-nodes.
   */
  function getDemandNodes(graph) {
    const demandNodes = []
    graph.nodes.forEach(node => {
      if (node.tag.supply < 0) {
        demandNodes.push(node)
      }
    })
    return demandNodes
  }

  /**
   * Returns the sum of all supply/demand values of the nodes in the given graph.
   * @param {yfiles.graph.IGraph} graph The input graph
   * @returns {number} The sum of all supply/demand values of the nodes in the given graph
   */
  function getSupplySum(graph) {
    let supplySum = 0
    graph.nodes.forEach(node => {
      supplySum += Math.round(node.tag.supply * node.layout.height)
    })
    return supplySum
  }

  /**
   * Run a hierarchic layout.
   * @param {boolean} incremental True if the algorithm should run in incremental mode, false otherwise
   * @param {Array} additionalIncrementalNodes An array of the incremental nodes
   * @param {function} finishHandler The handler that will be executed when the layout has finished.
   */
  function runLayout(incremental, finishHandler, additionalIncrementalNodes) {
    const graph = graphComponent.graph
    const algorithmComboBox = document.getElementById('algorithmComboBox')

    if (inLayout || graph.nodes.size === 0) {
      return
    }

    inLayout = true
    setUIDisabled(true)

    const layoutAlgorithm = new yfiles.hierarchic.HierarchicLayout()
    layoutAlgorithm.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
    layoutAlgorithm.integratedEdgeLabeling = true
    layoutAlgorithm.backLoopRouting = true

    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    layoutData.edgeThickness.delegate = edge => edge.tag.capacity

    if (incremental && algorithmComboBox.selectedIndex !== MAX_FLOW_MIN_CUT) {
      layoutAlgorithm.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL

      // mark all sources and sinks as well as passed additional nodes as incremental
      const hintsFactory = layoutAlgorithm.createIncrementalHintsFactory()
      const incrementalNodesMapper = new yfiles.collections.Mapper()
      getSourceNodes().forEach(node => {
        incrementalNodesMapper.set(node, hintsFactory.createLayerIncrementallyHint(node))
      })
      getSinkNodes().forEach(node => {
        incrementalNodesMapper.set(node, hintsFactory.createLayerIncrementallyHint(node))
      })
      if (additionalIncrementalNodes) {
        additionalIncrementalNodes.forEach(node => {
          incrementalNodesMapper.set(node, hintsFactory.createLayerIncrementallyHint(node))
        })
      }
      layoutData.incrementalHints.mapper = incrementalNodesMapper
    } else {
      layoutAlgorithm.layoutMode = yfiles.hierarchic.LayoutMode.FROM_SCRATCH
    }

    // sources will be in the first layer, sinks in the last layer
    const layerConstraints = layoutData.layerConstraints
    getSourceNodes().forEach(node => {
      layerConstraints.placeAtTop(node)
    })

    getSinkNodes().forEach(node => {
      layerConstraints.placeAtBottom(node)
    })

    if (algorithmComboBox.selectedIndex === MAX_FLOW_MIN_CUT) {
      const partitionGridData = new yfiles.layout.PartitionGridData()
      const partitionGrid = new yfiles.layout.PartitionGrid(1, 2, 0, 150, 0, 0)
      partitionGridData.grid = partitionGrid
      partitionGridData.cellIds.delegate = node =>
        node.tag.cut ? partitionGrid.createCellId(0, 0) : partitionGrid.createCellId(0, 1)
      layoutData.partitionGridData = partitionGridData
    }

    graphComponent.morphLayout(layoutAlgorithm, '1s', layoutData).then(() => {
      graph.edges.forEach(edge => {
        if (lastFlowMap.get(edge) !== edge.tag.flow) {
          graphComponent.highlightIndicatorManager.addHighlight(edge)
          lastFlowMap.set(edge, edge.tag.flow)
        }
      })

      setTimeout(() => {
        graphComponent.highlightIndicatorManager.clearHighlights()
      }, 1000)

      inLayout = false
      setUIDisabled(false)

      if (algorithmComboBox.selectedIndex === MAX_FLOW_MIN_CUT) {
        updateMinCutLine()
      }

      if (finishHandler) {
        finishHandler()
      }
    })
  }

  /**
   * Returns the source nodes of the graph, i.e., the ones with in-degree 0.
   * @returns {Array} An array of the source nodes of the graph, i.e., the ones with in-degree 0
   */
  function getSourceNodes() {
    const sourceNodes = []
    const graph = graphComponent.graph
    graph.nodes.forEach(node => {
      if (graph.inDegree(node) === 0) {
        sourceNodes.push(node)
      }
    })
    // Special case: No node with in-degree 0 was found, take the first node of the graph
    if (sourceNodes.length === 0) {
      sourceNodes.push(graph.nodes.first())
    }
    return sourceNodes
  }

  /**
   * Returns the sink nodes of the graph, i.e., the ones with out-degree 0.
   * @returns {Array} An array of the sink nodes of the graph, i.e., the ones with out-degree 0
   */
  function getSinkNodes() {
    const sinkNodes = []
    const graph = graphComponent.graph
    graph.nodes.forEach(node => {
      if (graph.outDegree(node) === 0) {
        sinkNodes.push(node)
      }
    })
    // Special case: No node with out-degree 0 was found, take the last node of the graph
    if (sinkNodes.length === 0) {
      sinkNodes.push(graph.nodes.last())
    }
    return sinkNodes
  }

  /**
   * Updates the min cut line.
   */
  function updateMinCutLine() {
    const graph = graphComponent.graph
    const graphBounds = graphComponent.contentRect

    // hold the old bounds to store in the undo unit
    const oldBounds = minCutLine.bounds ? new yfiles.geometry.Rect(minCutLine.bounds) : null
    if (graph.edges.size > 0) {
      // find the center between the last "source-cut"-layer and the first "target-cut"-layer
      minCutLine.visible = true
      let minX = Number.NEGATIVE_INFINITY
      let maxX = Number.POSITIVE_INFINITY
      graph.nodes.forEach(node => {
        if (node.tag.cut) {
          minX = Math.max(minX, node.layout.maxX)
        } else {
          maxX = Math.min(maxX, node.layout.x)
        }
      })

      if (isFinite(minX) && isFinite(maxX)) {
        minCutLine.bounds = new yfiles.geometry.Rect(
          (minX + maxX) * 0.5 - 5,
          graphBounds.y - 30,
          10,
          graphBounds.height + 60
        )
      } else {
        minCutLine.bounds = null
      }

      // create the undo unit
      const tagUndoUnit = new NetworkFlowsHelper.MinCutUndoUnit(
        'Min cut changed',
        'Min cut changed',
        oldBounds,
        minCutLine.bounds,
        minCutLine
      )
      graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
    } else {
      minCutLine.visible = false
    }
  }

  /**
   * Decorates the nodes and the edges of the graph based on the result of the algorithm.
   */
  function visualizeResult() {
    const graph = graphComponent.graph

    const gradientCount = 50
    const colors = generateColors(
      yfiles.view.Color.DARK_BLUE,
      yfiles.view.Color.CORNFLOWER_BLUE,
      gradientCount
    )
    const extrema = calculateExtrema(graph, false)
    const diff = extrema.max - extrema.min

    graph.edges.forEach(edge => {
      let colorIndex
      if (edge.tag.capacity !== 0) {
        if (diff === 0) {
          colorIndex = gradientCount - 1
        } else {
          const flowPercentage = edge.tag.flow * 100 / edge.tag.capacity
          const colorScale = (gradientCount - 1) / diff
          colorIndex = parseInt((flowPercentage - extrema.min) * colorScale) % gradientCount
        }
        edge.tag.color = colors[colorIndex]
      }
      const textLabelStyle = new yfiles.styles.DefaultLabelStyle({
        font: '11px bold Arial',
        textFill: edge.tag.capacity === 0 || colorIndex < colors.size * 0.4 ? 'black' : 'cyan'
      })

      const label = edge.labels.get(0)
      graph.setStyle(label, textLabelStyle)
      graph.setLabelText(label, `${edge.tag.flow} / ${edge.tag.capacity}`)
    })

    graphComponent.invalidate()
  }

  /**
   * Calculates the extrema of the capacities or flows of the edges.
   * @param {yfiles.graph.IGraph} graph The given graph
   * @param {boolean} useCapacity True if capacity should be used, false otherwise
   * @returns {{min: Number, max: number}}
   */
  function calculateExtrema(graph, useCapacity) {
    let min = Number.MAX_VALUE
    let max = -Number.MAX_VALUE

    graph.edges.forEach(edge => {
      let value = 0
      if (edge.tag && edge.tag.capacity !== 0) {
        value = useCapacity ? edge.tag.capacity : edge.tag.flow * 100 / edge.tag.capacity
      }

      min = Math.min(min, value)
      max = Math.max(max, value)
    })

    return {
      min,
      max
    }
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
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      graphComponent.graph.undoEngine.clear()
    })
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)
    app.bindChangeListener(
      "select[data-command='AlgorithmSelectionChanged']",
      onAlgorithmChanged.bind(this)
    )
    app.bindAction("button[data-command='Reload']", () => {
      if (edgePopup) {
        edgePopup.currentItem = null
      }
      createSampleGraph()
    })
    app.bindAction("button[data-command='Layout']", () => {
      if (edgePopup) {
        edgePopup.currentItem = null
      }
      runLayout(false)
    })

    document.getElementById('costPlus').addEventListener(
      'click',
      () => {
        updateCostForm(1)
      },
      true
    )

    document.getElementById('costMinus').addEventListener(
      'click',
      () => {
        updateCostForm(-1)
      },
      true
    )

    document.getElementById('apply').addEventListener(
      'click',
      () => {
        runFlowAlgorithm()
        runLayout(true)
      },
      true
    )
  }

  /**
   * Handles a selection change in the algorithm combo box.
   */
  function onAlgorithmChanged() {
    updateDescriptionText()

    graphComponent.selection.clear()

    if (edgePopup) {
      edgePopup.currentItem = null
    }

    const graph = graphComponent.graph
    if (graph.nodes.size > 0) {
      const algorithmComboBox = document.getElementById('algorithmComboBox')
      minCutLine.visible = algorithmComboBox.selectedIndex === MAX_FLOW_MIN_CUT

      // make sure that there is flow in case the algorithm changed to "Minimum Cost Problem"
      graph.nodes.forEach(node => {
        if (graph.inDegree(node) === 0) {
          node.tag.supply = 0.5
        } else if (graph.outDegree(node) === 0) {
          node.tag.supply = -0.5
        } else {
          node.tag.supply = 0
        }
      })

      runFlowAlgorithm(true)
      runLayout(false, () => {
        graphComponent.graph.undoEngine.clear()
      })
    }
  }

  /**
   * Updates the description text based on the selected algorithm.
   */
  function updateDescriptionText() {
    const descriptionText = window.document.getElementById('description')
    for (let i = 0; i < descriptionText.childElementCount; i++) {
      const child = descriptionText.children[i]
      child.style.display =
        i === document.getElementById('algorithmComboBox').selectedIndex ? 'block' : 'none'
    }
  }

  /**
   * Updates the value of the form and the edge tag.
   * @param {number} newValue The new value to be set
   */
  function updateCostForm(newValue) {
    const form = document.getElementById('cost-form')
    form.value = Math.max(parseInt(form.value) + newValue, 0)

    if (edgePopup.currentItem) {
      const currentItem = edgePopup.currentItem

      currentItem.tag = {
        flow: currentItem.tag.flow,
        color: currentItem.tag.color,
        capacity: currentItem.tag.capacity,
        cost: parseInt(form.value)
      }

      const label = edgePopup.currentItem.labels.get(1)
      if (label) {
        graphComponent.graph.setLabelText(label, `${currentItem.tag.cost} \u20AC`)
      }
    }
  }

  /**
   * Changes the state of the UI's elements and the input's mode.
   * @param {boolean} disabled True if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('newButton').disabled = disabled
    document.getElementById('algorithmComboBox').disabled = disabled
    document.getElementById('reloadButton').disabled = disabled
    document.getElementById('layoutButton').disabled = disabled
  }

  /**
   * Loads and prepares the input graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph
    graph.clear()

    if (minCutLine) {
      minCutLine.bounds = null
    }

    const node1 = graph.createNode()
    const node2 = graph.createNode()
    const node3 = graph.createNode()
    const node4 = graph.createNode()
    const node5 = graph.createNode()
    const node6 = graph.createNode()
    const node7 = graph.createNode()
    const node8 = graph.createNode()

    const color = yfiles.view.Color.CORNFLOWER_BLUE
    graph.createEdge({
      source: node1,
      target: node2,
      tag: {
        capacity: 19,
        cost: 14,
        color,
        id: 1
      }
    })
    graph.createEdge({
      source: node2,
      target: node3,
      tag: {
        capacity: 15,
        cost: 16,
        color,
        id: 2
      }
    })
    graph.createEdge({
      source: node1,
      target: node3,
      tag: {
        capacity: 16,
        cost: 15,
        color,
        id: 3
      }
    })
    graph.createEdge({
      source: node1,
      target: node4,
      tag: {
        capacity: 25,
        cost: 13,
        color,
        id: 4
      }
    })
    graph.createEdge({
      source: node2,
      target: node6,
      tag: {
        capacity: 10,
        cost: 11,
        color,
        id: 5
      }
    })
    graph.createEdge({
      source: node4,
      target: node3,
      tag: {
        capacity: 15,
        cost: 13,
        color,
        id: 6
      }
    })
    graph.createEdge({
      source: node3,
      target: node5,
      tag: {
        capacity: 23,
        cost: 10,
        color,
        id: 7
      }
    })
    graph.createEdge({
      source: node4,
      target: node7,
      tag: {
        capacity: 16,
        cost: 10,
        color,
        id: 8
      }
    })
    graph.createEdge({
      source: node5,
      target: node6,
      tag: {
        capacity: 10,
        cost: 15,
        color,
        id: 9
      }
    })
    graph.createEdge({
      source: node5,
      target: node7,
      tag: {
        capacity: 10,
        cost: 16,
        color,
        id: 10
      }
    })
    graph.createEdge({
      source: node5,
      target: node8,
      tag: {
        capacity: 16,
        cost: 15,
        color,
        id: 11
      }
    })
    graph.createEdge({
      source: node6,
      target: node8,
      tag: {
        capacity: 13,
        cost: 15,
        color,
        id: 12
      }
    })
    graph.createEdge({
      source: node7,
      target: node8,
      tag: {
        capacity: 15,
        cost: 16,
        color,
        id: 13
      }
    })

    graph.edges.forEach(edge => {
      updateEdgeThickness(edge)
    })

    graph.nodes.forEach(node => {
      let supply = 0
      if (graph.inDegree(node) === 0) {
        supply = 0.5
      } else if (graph.outDegree(node) === 0) {
        supply = -0.5
      }
      node.tag = {
        supply,
        flow: 0.5 * node.layout.height,
        adjustable: document.getElementById('algorithmComboBox').selectedIndex === MIN_COST_FLOW
      }

      calculateNodeSize(node)
    })

    onAlgorithmChanged()
  }

  // run the demo
  run()
})
