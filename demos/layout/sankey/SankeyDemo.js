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

/* eslint-disable global-require */

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
  'utils/ContextMenu',
  './DemoStyles.js',
  './SankeyHelper.js',
  'yfiles/layout-hierarchic',
  'yfiles/view-layout-bridge',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  ContextMenu,
  DemoStyles,
  SankeyHelper
) => {
  /**
   * The GraphComponent
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Holds the colors for the nodes.
   * @type {Array}
   */
  let nodeColors = null

  /**
   * Holds the colors for the nodes.
   * @type {Array}
   */
  let edgeColors = null

  /**
   * The node popup that will provide the available node colors.
   * @type {SankeyPopupSupport}
   */
  let nodePopup = null

  /**
   * The edge popup that will provide the available edge colors.
   * @type {SankeyPopupSupport}
   */
  let edgePopup = null

  /**
   * Holds whether or not a layout is running.
   * @type {boolean}
   */
  let inLayout = false

  /**
   * Runs the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeGraph()

    createInputMode()

    initializePopupMenus()

    createSampleGraph()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the default styles for nodes, edges and labels, the undo engine and the necessary listeners.
   */
  function initializeGraph() {
    const graph = graphComponent.graph

    // set the default style for the nodes and edges
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      fill: 'rgb(102, 153, 204)',
      stroke: null
    })

    graph.edgeDefaults.style = new DemoStyles.DemoEdgeStyle()

    // use a label model that stretches the label over the full node layout, with small insets
    const centerLabelModel = new yfiles.graph.InteriorStretchLabelModel({ insets: 3 })
    graph.nodeDefaults.labels.layoutParameter = centerLabelModel.createParameter('center')

    // set the default style for the node labels
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      textFill: 'white',
      font: '12px bold Arial',
      wrapping: 'word',
      verticalTextAlignment: 'center',
      horizontalTextAlignment: 'center'
    })

    // set the default node size
    graph.nodeDefaults.size = new yfiles.geometry.Size(80, 30)

    // add a node tag listener to change the node color when the tag changes
    graph.addNodeTagChangedListener((sender, args) => {
      const item = args.item
      if (item.tag && args.oldValue && item.tag.colorId !== args.oldValue.colorId) {
        item.style.fill = new yfiles.view.SolidColorFill(getNodeColor(item))
        graphComponent.invalidate()
      }
    })

    // enable the undo engine
    graph.undoEngineEnabled = true

    graphComponent.highlightIndicatorManager = new DemoStyles.HighlightManager(graphComponent)
  }

  /**
   * Creates and initializes the input mode for this demo.
   */
  function createInputMode() {
    // initialize input mode
    const mode = new yfiles.input.GraphEditorInputMode({
      // disable selection for labels
      selectableItems: yfiles.graph.GraphItemTypes.ALL & ~yfiles.graph.GraphItemTypes.LABEL
    })

    // edge creation started
    mode.createEdgeInputMode.addEdgeCreationStartedListener((sender, args) => {
      const edge = args.item
      const sourceNode = edge.sourceNode
      edge.tag = {
        thickness: 1,
        color:
          sourceNode.tag && sourceNode.tag.colorId
            ? edgeColors[sourceNode.tag.colorId]
            : new yfiles.view.Color(170, 207, 243)
      }
    })

    // edge creation finished
    mode.createEdgeInputMode.addEdgeCreatedListener(() => {
      runLayout()
    })

    // node creation
    mode.addNodeCreatedListener((sender, args) => {
      args.item.tag = { colorId: 0 }
    })

    // listener to react in edge label text changing
    mode.addLabelTextChangedListener((sender, args) => {
      if (yfiles.graph.IEdge.isInstance(args.item.owner)) {
        onLabelChanged(args.item)
      }
    })

    // listener to react in edge label addition
    mode.addLabelAddedListener((sender, args) => {
      if (yfiles.graph.IEdge.isInstance(args.item.owner)) {
        onLabelChanged(args.item)
      }
    })

    // listener to react to item deletion
    mode.addDeletedSelectionListener(() => {
      // start a compound edit to merge thickness changes and layout
      const compoundEdit = graphComponent.graph.beginEdit('Deletion', 'Deletion')
      normalizeThickness()
      runLayout(() => {
        if (compoundEdit) {
          compoundEdit.commit()
        }
      })
    })

    mode.itemHoverInputMode.enabled = true
    mode.itemHoverInputMode.hoverItems =
      yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.EDGE_LABEL
    mode.itemHoverInputMode.discardInvalidItems = false
    // add hover listener to implement edge and label highlighting
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
      const highlightManager = graphComponent.highlightIndicatorManager
      highlightManager.clearHighlights()
      const item = args.item
      if (item) {
        highlightManager.addHighlight(item)
        if (yfiles.graph.IEdge.isInstance(item)) {
          item.labels.forEach(label => {
            highlightManager.addHighlight(label)
          })
        } else {
          highlightManager.addHighlight(item.owner)
        }
      }
    })

    // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
    // context menu widget as well. See the Context Menu demo for more details about working with context menus.
    const contextMenu = new ContextMenu(graphComponent)

    // Add event listeners to the various events that open the context menu. These listeners then
    // call the provided callback function which in turn asks the current ContextMenuInputMode if a
    // context menu should be shown at the current location.
    contextMenu.addOpeningEventListeners(graphComponent, location => {
      if (mode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
        contextMenu.show(location)
      }
    })

    // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
    // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
    mode.addPopulateItemContextMenuListener((sender, args) =>
      populateContextMenu(contextMenu, args)
    )

    // Add a listener that closes the menu when the input mode requests this
    mode.contextMenuInputMode.addCloseMenuListener(() => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = () => {
      mode.contextMenuInputMode.menuClosed()
    }

    mode.addCanvasClickedListener(() => {
      nodePopup.currentItem = null
      edgePopup.currentItem = null
    })

    mode.addItemClickedListener(() => {
      nodePopup.currentItem = null
      edgePopup.currentItem = null
    })

    graphComponent.inputMode = mode
  }

  /**
   * Updates the graph based on the given label's text change.
   * @param {yfiles.graph.ILabel} label The given label
   */
  function onLabelChanged(label) {
    // start a compound edit to merge thickness changes and layout
    const compoundEdit = graphComponent.graph.beginEdit(
      'Edge Label Text Changed',
      'Edge Label Text Changed'
    )
    setLabelStyle(label)
    normalizeThickness()
    runLayout(() => {
      if (compoundEdit) {
        compoundEdit.commit()
      }
    })
  }

  /**
   * Populates the context menu based on the item that is right-clicked.
   * @param {object} contextMenu The context menu
   * @param {yfiles.input.PopulateItemContextMenuEventArgs} args The event args
   */
  function populateContextMenu(contextMenu, args) {
    args.showMenu = true

    contextMenu.clearItems()
    nodePopup.currentItem = null
    edgePopup.currentItem = null

    // In this demo, we use the following custom hit testing to prefer nodes.
    const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

    // Check whether a node was it. If it was, we prefer it over edges
    const hit = hits.find(item => yfiles.graph.INode.isInstance(item)) || hits.firstOrDefault()

    const graphSelection = graphComponent.selection
    if (yfiles.graph.INode.isInstance(hit)) {
      contextMenu.addMenuItem('Change Node Color', () => {
        nodePopup.currentItem = hit
      })
      contextMenu.addMenuItem('Apply Node Color to Outgoing Edges', () => {
        graphSelection.selectedNodes.forEach(node => {
          applySelectedColorToEdges(node, getNodeColor(node))
        })
      })
      contextMenu.addMenuItem('Apply Best Matching Color to Outgoing Edges', () => {
        graphSelection.selectedNodes.forEach(node => {
          applySelectedColorToEdges(node, edgeColors[node.tag.colorId])
        })
      })
      // if the item is not selected, select it
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    } else if (yfiles.graph.IEdge.isInstance(hit)) {
      contextMenu.addMenuItem('Change Edge Color', () => {
        edgePopup.currentItem = hit
      })
      // if the item is not selected, select it
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    } else {
      args.showMenu = false
    }
  }

  /**
   * Apply selected color to the edges adjacent to the given node.
   * @param {yfiles.graph.INode} node The given node
   * @param {yfiles.view.Color} color The desired color
   */
  function applySelectedColorToEdges(node, color) {
    const graph = graphComponent.graph
    const compoundEdit = graph.beginEdit('Edge Color changed', 'Edge Color changed')
    graph.edgesAt(node).forEach(edge => {
      // copy the old tag
      const oldTag = Object.assign({}, edge.tag)
      edge.tag.color = color
      // create an undo unit to be able to apply undo/redo operations
      const tagUndoUnit = new SankeyHelper.TagUndoUnit(
        'Color changed',
        'Color changed',
        oldTag,
        edge.tag,
        edge
      )
      graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
    })
    graphComponent.invalidate()
    compoundEdit.commit()
  }

  /**
   * Initializes the popup menus responsible for changing the colors of nodes and edges.
   */
  function initializePopupMenus() {
    // initialize the node label model used for placing the node popup menu
    const nodeLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 10 })
    const nodeLabelModelParameter = nodeLabelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.EAST
    )

    // initialize the node popup menu
    const nodePopupContent = window.document.getElementById('nodeColorPopupContent')
    nodePopup = new SankeyHelper.SankeyPopupSupport(
      graphComponent,
      nodePopupContent,
      nodeLabelModelParameter
    )

    // initialize the edge label model used for placing the edge popup menu
    const edgeLabelModel = new yfiles.graph.EdgePathLabelModel({
      autoRotation: false
    })

    // initialize the node popup menu
    const edgePopupContent = window.document.getElementById('edgeColorPopupContent')
    edgePopup = new SankeyHelper.SankeyPopupSupport(
      graphComponent,
      edgePopupContent,
      edgeLabelModel.createDefaultParameter()
    )

    // initializes the color arrays
    initializeColorArrays()

    const nodeColorContainer = nodePopup.div
    nodeColorContainer.addEventListener(
      'click',
      () => {
        nodePopup.currentItem = null
      },
      false
    )

    nodeColors.forEach(color => {
      createColorPopupMenu(color, true)
    })

    const edgeColorContainer = edgePopup.div
    edgeColorContainer.addEventListener(
      'click',
      () => {
        edgePopup.currentItem = null
      },
      false
    )

    edgeColors.forEach(color => {
      createColorPopupMenu(color, false)
    })
  }

  /**
   * Adds the given color to the popup menu.
   * @param {yfiles.view.Color} color The color to be added
   * @param {boolean} forNode True if the color should be added to the node popup menu, false otherwise
   */
  function createColorPopupMenu(color, forNode) {
    const div = window.document.createElement('div')
    div.setAttribute('style', `background-color:rgb(${color.r},${color.g},${color.b})`)
    div.setAttribute('class', 'colorButton')

    if (forNode) {
      nodePopup.div.appendChild(div)
    } else {
      edgePopup.div.appendChild(div)
    }

    // add the event listener that will change the node/edge color when the particular color button is pressed
    div.addEventListener(
      'click',
      () => {
        if (forNode) {
          graphComponent.selection.selectedNodes.forEach(node => {
            const oldTag = Object.assign({}, node.tag)
            node.tag = { colorId: nodeColors.indexOf(color) }
            graphComponent.invalidate()
            const tagUndoUnit = new SankeyHelper.TagUndoUnit(
              'Color changed',
              'Color changed',
              oldTag,
              node.tag,
              node
            )
            graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
          })
        } else {
          graphComponent.selection.selectedEdges.forEach(edge => {
            const oldTag = Object.assign({}, edge.tag)
            edge.tag.color = color
            graphComponent.invalidate()
            const tagUndoUnit = new SankeyHelper.TagUndoUnit(
              'Color changed',
              'Color changed',
              oldTag,
              edge.tag,
              edge
            )
            graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
          })
        }
      },
      false
    )
  }

  /**
   * Applies the layout algorithm to the given graphComponent.
   * @param {function} callBack A function to be called when the layout has finished
   */
  function runLayout(callBack) {
    const graph = graphComponent.graph
    if (graph.nodes.size === 0 || inLayout) {
      return
    }
    inLayout = true
    setUIDisabled(true)

    // configure the layout algorithm
    const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
    const fromSketchMode = document.getElementById('UseDrawingAsSketch').checked
    hierarchicLayout.layoutMode = fromSketchMode
      ? yfiles.hierarchic.LayoutMode.INCREMENTAL
      : yfiles.hierarchic.LayoutMode.FROM_SCRATCH
    hierarchicLayout.nodeToNodeDistance = 30
    hierarchicLayout.edgeLayoutDescriptor.minimumFirstSegmentLength = 80
    hierarchicLayout.edgeLayoutDescriptor.minimumLastSegmentLength = 80
    hierarchicLayout.backLoopRouting = true

    // create the layout data
    const hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()
    // maps each edge with its thickness so that the layout algorithm takes the edge thickness under consideration
    hierarchicLayoutData.edgeThickness.delegate = edge => edge.tag.thickness
    // since orientation is LEFT_TO_RIGHT, we add port constraints so that the edges leave the source node at its
    // right side and enter the target node at its left side
    hierarchicLayoutData.sourcePortConstraints.delegate = edge =>
      yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.EAST, false)
    hierarchicLayoutData.targetPortConstraints.delegate = edge =>
      yfiles.layout.PortConstraint.create(yfiles.layout.PortSide.WEST, false)

    // a port border gap ratio of zero means that ports can be placed directly on the corners of the nodes
    const portBorderRatio = 1
    hierarchicLayout.nodeLayoutDescriptor.portBorderGapRatios = portBorderRatio

    // configures the generic labeling algorithm which produces more compact results, here
    const genericLabeling = hierarchicLayout.labeling
    genericLabeling.reduceAmbiguity = false
    genericLabeling.placeNodeLabels = false
    genericLabeling.placeEdgeLabels = true
    hierarchicLayout.labelingEnabled = true

    // for Sankey diagrams, the nodes should be adjusted to the incoming/outgoing flow (enlarged if necessary)
    // -> use NodeResizingStage for that purpose
    const nodeResizingStage = new SankeyHelper.NodeResizingStage(hierarchicLayout)
    nodeResizingStage.layoutOrientation = hierarchicLayout.layoutOrientation
    nodeResizingStage.portBorderGapRatio = portBorderRatio
    hierarchicLayout.prependStage(nodeResizingStage)

    // edge labels should be placed close to the edges' source
    const preferredPlacementDescriptor = new yfiles.layout.PreferredPlacementDescriptor({
      placeAlongEdge: yfiles.layout.LabelPlacements.AT_SOURCE
    })
    graph.mapperRegistry.createConstantMapper(
      yfiles.graph.ILabel.$class,
      yfiles.layout.PreferredPlacementDescriptor.$class,
      yfiles.layout.LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
      preferredPlacementDescriptor
    )

    // run the layout and animate the result
    graphComponent
      .morphLayout(hierarchicLayout, '1s', hierarchicLayoutData)
      .then(() => {
        setUIDisabled(false)
        inLayout = false
        if (callBack) {
          callBack()
        }
      })
      .catch(error => {
        setUIDisabled(false)
        inLayout = false
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Disables the HTML elements of the UI and the input mode.
   *
   * @param disabled true if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('layoutButton').disabled = disabled
  }

  /**
   * Normalizes the thickness of the edges of the graph based on the current label texts. The largest thickness is
   * 400, while the smallest 1. If the label text is not a number, edge thickness 1 will be assigned.
   */
  function normalizeThickness() {
    let min = Number.MAX_VALUE
    let max = -Number.MAX_VALUE

    // find the minimum and maximum flow value from the graph's edge labels
    graphComponent.graph.edges.forEach(edge => {
      const labels = edge.labels

      if (labels.size > 0) {
        const labelText = !isNaN(labels.get(0).text) ? labels.get(0).text : 1
        const value = Math.max(0, parseFloat(labelText))
        min = Math.min(min, value)
        max = Math.max(max, Math.abs(value))
      }
    })

    const diff = max - min
    const largestThickness = 200
    const smallestThickness = 2

    // normalize the thickness of the graph's edges
    graphComponent.graph.edges.forEach(edge => {
      const labels = edge.labels
      const oldTag = Object.assign({}, edge.tag)
      if (labels.size === 0 || isNaN(diff) || isNaN(parseFloat(edge.labels.get(0).text))) {
        edge.tag.thickness = 2
      } else {
        const value = Math.max(0, parseFloat(edge.labels.get(0).text))
        const thicknessScale = (largestThickness - smallestThickness) / diff
        edge.tag.thickness = Math.floor(
          parseFloat(smallestThickness + (value - min) * thicknessScale)
        )
      }
      const tagUndoUnit = new SankeyHelper.TagUndoUnit(
        'Thickness changed',
        'Thickness changed',
        oldTag,
        edge.tag,
        edge
      )
      graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
    })
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)

    app.bindAction("button[data-command='Layout']", () => {
      runLayout()
    })
  }

  /**
   * Creates the sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph

    require(['resources/samples.js'], Sample => {
      const builder = new yfiles.binding.GraphBuilder(graphComponent.graph)
      builder.nodesSource = Sample.nodes
      builder.edgesSource = Sample.edges
      builder.sourceNodeBinding = 'from'
      builder.targetNodeBinding = 'to'
      builder.nodeIdBinding = 'id'
      builder.locationXBinding = 'x'
      builder.locationYBinding = 'y'
      builder.nodeLabelBinding = 'label'
      builder.edgeLabelBinding = 'label'

      graphComponent.graph = builder.buildGraph()

      // assign node styles
      graph.nodes.forEach(node => {
        node.tag = { colorId: node.tag.colorId }
        const nodeStyle = new yfiles.styles.ShapeNodeStyle({
          fill: new yfiles.view.SolidColorFill(getNodeColor(node)),
          stroke: null
        })
        graph.setStyle(node, nodeStyle)

        graph.outEdgesAt(node).forEach(edge => {
          edge.tag = { color: edgeColors[node.tag.colorId] }
        })
      })

      // assign label styles
      graph.edges.forEach(edge => {
        edge.labels.forEach(label => {
          setLabelStyle(label)
        })
      })

      // normalize the edges' thickness and run a new layout
      normalizeThickness()
      runLayout(() => {
        graphComponent.graph.undoEngine.clear()
      })
    })
  }

  /**
   * Assigns a new style to the given label.
   * @param {yfiles.graph.ILabel} label The given label
   */
  function setLabelStyle(label) {
    // set the default style for the node labels
    const labelStyle = new yfiles.styles.DefaultLabelStyle({
      textFill: new yfiles.view.SolidColorFill(getNodeColor(label.owner.sourceNode)),
      font: '9px bold Arial'
    })
    graphComponent.graph.setStyle(label, labelStyle)
  }

  /**
   * Returns the color for the given node.
   * @param {yfiles.graph.INode} node The given node
   */
  function getNodeColor(node) {
    return !node.tag ? new yfiles.view.Color(102, 153, 204) : nodeColors[node.tag.colorId]
  }

  /**
   * Initializes the color arrays.
   */
  function initializeColorArrays() {
    // available node colors
    nodeColors = [
      new yfiles.view.Color(102, 153, 204),
      new yfiles.view.Color(55, 55, 55),
      yfiles.view.Color.FIREBRICK,
      yfiles.view.Color.GOLDENROD,
      yfiles.view.Color.FOREST_GREEN,
      new yfiles.view.Color(153, 51, 102),
      new yfiles.view.Color(51, 102, 255),
      new yfiles.view.Color(102, 102, 153),
      new yfiles.view.Color(255, 145, 255),
      new yfiles.view.Color(128, 255, 128),
      new yfiles.view.Color(255, 101, 2),
      new yfiles.view.Color(87, 173, 87),
      new yfiles.view.Color(44, 174, 212),
      new yfiles.view.Color(139, 69, 19)
    ]

    // available edge colors
    edgeColors = [
      new yfiles.view.Color(194, 221, 249),
      new yfiles.view.Color(161, 161, 161),
      new yfiles.view.Color(254, 128, 128),
      new yfiles.view.Color(254, 229, 128),
      new yfiles.view.Color(203, 229, 128),
      new yfiles.view.Color(203, 153, 178),
      new yfiles.view.Color(101, 136, 252),
      new yfiles.view.Color(160, 160, 209),
      new yfiles.view.Color(249, 207, 249),
      new yfiles.view.Color(199, 250, 199),
      new yfiles.view.Color(246, 200, 169),
      new yfiles.view.Color(164, 240, 164),
      new yfiles.view.Color(163, 221, 239),
      new yfiles.view.Color(222, 178, 144)
    ]
  }

  // runs the demo
  run()
})
