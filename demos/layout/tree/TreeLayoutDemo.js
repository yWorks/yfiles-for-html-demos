/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
  'resources/demo-styles',
  'CreateTreeEdgeInputMode.js',
  'NodePlacerPanel.js',
  'resources/TreeData.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-tree',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  CreateTreeEdgeInputMode,
  NodePlacerPanel,
  TreeData
) => {
  /**
   * The graph component which contains the tree graph.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The panel which provides access to the node placer settings.
   * @type {NodePlacerPanel}
   */
  let nodePlacerPanel = null

  /**
   * Flag to prevent re-entrant layout calculations.
   * @type {boolean}
   */
  let busy = false

  /**
   * Launches the TreeLayoutDemo.
   */
  function run() {
    // initialize the graph component
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // initialize the settings panel and registers a listener which updates the layout if settings were changed
    nodePlacerPanel = new NodePlacerPanel(graphComponent.graph)
    nodePlacerPanel.addChangeListener(runLayout)

    // initialize interactive behavior and toolbar buttons
    initializesInputModes()
    registerCommands()

    // load a sample graph
    loadInitialGraph()

    app.show(graphComponent)
  }

  /**
   * Runs a {@link yfiles.tree.TreeLayout} using the specified {@link yfiles.tree.INodePlacer}s.
   */
  function runLayout() {
    if (busy) {
      // there is already a layout calculating do not start another one
      return
    }

    setBusy(true)

    // create layout algorithm
    const layout = new yfiles.tree.TreeLayout()

    // configure layout data with node placers, assistant markers and edge order
    const layoutData = new yfiles.tree.TreeLayoutData()
    layoutData.nodePlacers.delegate = node => {
      if (graphComponent.graph.outDegree(node) > 0) {
        // return the node placer specified for the layer that contains this node
        return nodePlacerPanel.nodePlacers.get(node.tag.layer.toString())
      }

      // use LeafNodePlacer for all nodes without children to avoid weird node connectors
      return new yfiles.tree.LeafNodePlacer()
    }
    layoutData.assistantNodes.delegate = node => node.tag.assistant
    layoutData.outEdgeComparers.constant = (edge1, edge2) => {
      const value1 = getOrdinal(edge1)
      const value2 = getOrdinal(edge2)
      return value1 - value2
    }
    layoutData.compactNodePlacerStrategyMementos = new yfiles.collections.Mapper()

    // run the layout animated
    graphComponent
      .morphLayout(new yfiles.layout.MinimumNodeSizeStage(layout), '0.5s', layoutData)
      .then(() => {
        setBusy(false)
      })
  }

  /**
   * Returns the ordinal which describes where this edge fits in the edge order.
   * This implementation uses the label text if it is a number or 0.
   * @param {yfiles.graph.IEdge} edge
   * @return {number}
   */
  function getOrdinal(edge) {
    if (!edge) {
      return 0
    }

    const targetLabels = edge.targetNode.labels
    if (targetLabels.size > 0) {
      const number = Number.parseFloat(targetLabels.first().text)
      if (!isNaN(number)) {
        return number
      }
    }
    return 0
  }

  /**
   * Initializes interactive behavior
   */
  function initializesInputModes() {
    // create a new GraphEditorInputMode
    const inputMode = new yfiles.input.GraphEditorInputMode({
      // disable label editing on double click, so it won't interfere with toggeling the node's assistant marking
      allowEditLabelOnDoubleClick: false,
      // add a custom CreateEdgeInputMode that will also create the edge's target to keep the tree-structure intact
      createEdgeInputMode: new CreateTreeEdgeInputMode(),
      // disabled clipboard and undo operations
      allowClipboardOperations: false,
      allowUndoOperations: false,
      // forbid node creation and allow only node deletion to maintain the tree-structure
      allowCreateNode: false,
      selectableItems: yfiles.graph.GraphItemTypes.NODE,
      deletableItems: yfiles.graph.GraphItemTypes.NODE,
      focusableItems: yfiles.graph.GraphItemTypes.NONE
    })
    inputMode.createEdgeInputMode.priority = 45

    // always delete the whole subtree
    inputMode.addDeletingSelectionListener((sender, args) => {
      const selectedNodes = args.selection
      const nodesToDelete = []
      selectedNodes.forEach(selectedNode => {
        collectSubtreeNodes(selectedNode, nodesToDelete)
      })
      nodesToDelete.forEach(node => {
        if (graphComponent.graph.inDegree(node)) {
          args.selection.setSelected(node, true)
        } else {
          // do not delete the root node to be able to build a new tree
          args.selection.setSelected(node, false)
        }
      })
    })
    // update the layout and the settings panel when nodes are deleted
    inputMode.addDeletedSelectionListener(() => {
      runLayout()
      nodePlacerPanel.updateMaxLayer(graphComponent.graph)
      nodePlacerPanel.layer = Math.min(nodePlacerPanel.layer, nodePlacerPanel.maxLayer)
    })

    // run a layout everytime a node/bend is dragged or a node is resized
    inputMode.moveInputMode.addDragFinishedListener(runLayout)
    inputMode.handleInputMode.addDragFinishedListener(runLayout)

    // change the layer in the settings panel when a node is clicked to be able to edit the node placer for this layer
    inputMode.addItemClickedListener((sender, args) => {
      if (yfiles.graph.INode.isInstance(args.item)) {
        nodePlacerPanel.layer = args.item.tag.layer
      }
    })

    // toggle the assistant marking for the double-clicked node
    inputMode.addItemDoubleClickedListener((sender, args) => {
      if (yfiles.graph.INode.isInstance(args.item)) {
        const node = args.item
        node.tag.assistant = !node.tag.assistant
        const nodeStyle = node.style.clone()
        if (nodeStyle) {
          nodeStyle.stroke = !node.tag.assistant
            ? null
            : new yfiles.view.Stroke({
                fill: 'black',
                thickness: 2,
                dashStyle: yfiles.view.DashStyle.DASH
              })
          graphComponent.graph.setStyle(node, nodeStyle)
        }
        runLayout()
      }
    })

    // labels may influence the order of child nodes, if they are changed a new layout should be calculated
    inputMode.addLabelAddedListener((sender, args) => {
      if (!isNaN(args.item.text)) {
        runLayout()
      }
    })
    inputMode.addLabelTextChangedListener((sender, args) => {
      if (!isNaN(args.item.text)) {
        runLayout()
      }
    })

    // update layout and settings panel when an edge was created
    inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
      nodePlacerPanel.updateMaxLayer(graphComponent.graph)
      nodePlacerPanel.layer = args.item.targetNode.tag.layer
      runLayout()
    })

    // assign the input mode to the graph component
    graphComponent.inputMode = inputMode
  }

  /**
   * Finds all nodes in the subtree rooted by the selected node and collects them in the passed array.
   * @param {yfiles.graph.INode} selectedNode
   * @param {Array.<yfiles.graph.INode>} nodesToDelete
   */
  function collectSubtreeNodes(selectedNode, nodesToDelete) {
    nodesToDelete.push(selectedNode)

    graphComponent.graph.outEdgesAt(selectedNode).forEach(outEdge => {
      const target = outEdge.targetNode
      collectSubtreeNodes(target, nodesToDelete)
    })
  }

  /**
   * Reads an initial tree graph from file
   */
  function loadInitialGraph() {
    const graph = graphComponent.graph

    // initialize the node and edge default styles, they will be applied to the newly created graph
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
      stroke: 'white',
      fill: 'crimson'
    })
    graph.nodeDefaults.size = new yfiles.geometry.Size(60, 30)
    graph.nodeDefaults.shareStyleInstance = false

    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      targetArrow: yfiles.styles.IArrow.TRIANGLE
    })

    // configure the tree builder
    const builder = new yfiles.binding.TreeBuilder(graph)
    builder.nodesSource = TreeData.nodesSource
    builder.childBinding = 'children'

    // create the graph
    builder.buildGraph()

    // update the node fill colors according to their layers
    graph.nodes.forEach(node => {
      node.style.fill = NodePlacerPanel.layerFills[node.tag.layer]
      if (node.tag.assistant) {
        node.style.stroke = '2px dashed black'
      }
    })

    // update settings panel and layout
    nodePlacerPanel.updateMaxLayer(graph)
    runLayout()
  }

  /**
   * Enables/disables interaction.
   * @param {boolean} isBusy
   */
  function setBusy(isBusy) {
    busy = isBusy
    graphComponent.inputMode.enabled = !isBusy
  }

  /**
   * Wires up the GUI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
  }

  run()
})
