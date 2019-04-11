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
  Color,
  DefaultLabelStyle,
  EdgePathLabelModel,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IEdge,
  ILabel,
  INode,
  InteriorStretchLabelModel,
  License,
  PopulateItemContextMenuEventArgs,
  ShapeNodeStyle,
  Size,
  SolidColorFill
} from 'yfiles'

import GraphBuilderData from './resources/samples.js'
import { SankeyPopupSupport, TagUndoUnit } from './SankeyHelper.js'
import ContextMenu from '../../utils/ContextMenu.js'
import { DemoEdgeStyle, HighlightManager } from './DemoStyles.js'
import { SankeyLayout } from './SankeyLayout.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * Creates and configures the layout algorithm for the Sankey visualization.
 * @type {SankeyLayout}
 */
let sankeyLayout = null
/**
 * The GraphComponent
 * @type {GraphComponent}
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
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  initializeGraph()

  createInputMode()

  initializePopupMenus()

  createSampleGraph()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the default styles for nodes, edges and labels, the undo engine and the necessary listeners.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  // set the default style for the nodes and edges
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'rgb(102, 153, 204)',
    stroke: null
  })

  graph.edgeDefaults.style = new DemoEdgeStyle()

  // use a label model that stretches the label over the full node layout, with small insets
  const centerLabelModel = new InteriorStretchLabelModel({ insets: 3 })
  graph.nodeDefaults.labels.layoutParameter = centerLabelModel.createParameter('center')

  // set the default style for the node labels
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textFill: 'white',
    font: '12px bold Arial',
    wrapping: 'word',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center'
  })

  // set the default node size
  graph.nodeDefaults.size = new Size(80, 30)

  // add a node tag listener to change the node color when the tag changes
  graph.addNodeTagChangedListener((sender, args) => {
    const item = args.item
    if (item.tag && args.oldValue && item.tag.colorId !== args.oldValue.colorId) {
      item.style.fill = new SolidColorFill(getNodeColor(item))
      graphComponent.invalidate()
    }
  })

  // enable the undo engine
  graph.undoEngineEnabled = true

  // disable all edge handles
  graph.decorator.edgeDecorator.handleProviderDecorator.hideImplementation()
  graph.decorator.edgeDecorator.selectionDecorator.hideImplementation()

  graphComponent.highlightIndicatorManager = new HighlightManager(graphComponent)
}

/**
 * Creates and initializes the input mode for this demo.
 */
function createInputMode() {
  // initialize input mode
  const mode = new GraphEditorInputMode({
    // disable selection for labels
    selectableItems: GraphItemTypes.ALL & ~GraphItemTypes.LABEL
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
          : new Color(170, 207, 243)
    }
  })

  // edge creation finished
  mode.createEdgeInputMode.addEdgeCreatedListener(() => runLayout())

  // node creation
  mode.addNodeCreatedListener((sender, args) => {
    args.item.tag = { colorId: 0 }
  })

  // listener to react in edge label text changing
  mode.addLabelTextChangedListener((sender, args) => {
    if (IEdge.isInstance(args.item.owner)) {
      onLabelChanged(args.item)
    }
  })

  // listener to react in edge label addition
  mode.addLabelAddedListener((sender, args) => {
    if (args.item.owner && IEdge.isInstance(args.item.owner)) {
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
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
  mode.itemHoverInputMode.discardInvalidItems = false
  // add hover listener to implement edge and label highlighting
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    const highlightManager = graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    const item = args.item
    if (item) {
      highlightManager.addHighlight(item)
      if (IEdge.isInstance(item)) {
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
  mode.addPopulateItemContextMenuListener((sender, args) => populateContextMenu(contextMenu, args))

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
 * Populates the context menu based on the item that is right-clicked.
 * @param {object} contextMenu The context menu
 * @param {PopulateItemContextMenuEventArgs} args The event args
 */
function populateContextMenu(contextMenu, args) {
  args.showMenu = true

  contextMenu.clearItems()
  nodePopup.currentItem = null
  edgePopup.currentItem = null

  // In this demo, we use the following custom hit testing to prefer nodes.
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

  // Check whether a node was it. If it was, we prefer it over edges
  const hit = hits.find(item => INode.isInstance(item)) || hits.firstOrDefault()

  const graphSelection = graphComponent.selection
  if (INode.isInstance(hit)) {
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
  } else if (IEdge.isInstance(hit)) {
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
 * Initializes the popup menus responsible for changing the colors of nodes and edges.
 */
function initializePopupMenus() {
  // initialize the node label model used for placing the node popup menu
  const nodeLabelModel = new ExteriorLabelModel({ insets: 10 })
  const nodeLabelModelParameter = nodeLabelModel.createParameter(ExteriorLabelModelPosition.EAST)

  // initialize the node popup menu
  const nodePopupContent = window.document.getElementById('nodeColorPopupContent')
  nodePopup = new SankeyPopupSupport(graphComponent, nodePopupContent, nodeLabelModelParameter)

  // initialize the edge label model used for placing the edge popup menu
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: false
  })

  // initialize the edge popup menu
  const edgePopupContent = window.document.getElementById('edgeColorPopupContent')
  edgePopup = new SankeyPopupSupport(
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
 * Disables the HTML elements of the UI and the input mode.
 *
 * @param disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.getElementById('layoutButton').disabled = disabled
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindAction("button[data-command='Layout']", () => runLayout())
}

/**
 * Creates the sample graph.
 */
function createSampleGraph() {
  const builder = new GraphBuilder({
    graph: graphComponent.graph,
    nodesSource: GraphBuilderData.nodes,
    edgesSource: GraphBuilderData.edges,
    sourceNodeBinding: 'from',
    targetNodeBinding: 'to',
    nodeIdBinding: 'id',
    locationXBinding: 'x',
    locationYBinding: 'y',
    nodeLabelBinding: 'label',
    edgeLabelBinding: 'label'
  })

  const graph = builder.buildGraph()

  // assign node styles
  graph.nodes.forEach(node => {
    node.tag = { colorId: node.tag.colorId }
    const nodeStyle = new ShapeNodeStyle({
      fill: new SolidColorFill(getNodeColor(node)),
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
}

/**
 * Adds the given color to the popup menu.
 * @param {Color} color The color to be added
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
          const tagUndoUnit = new TagUndoUnit(
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
          const tagUndoUnit = new TagUndoUnit(
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
  if (!sankeyLayout) {
    sankeyLayout = new SankeyLayout(graphComponent)
  }
  inLayout = true
  setUIDisabled(true)

  // configure the layout algorithm
  const fromSketchMode = document.getElementById('UseDrawingAsSketch').checked
  const hierarchicLayout = sankeyLayout.configureHierarchicLayout(fromSketchMode)
  const hierarchicLayoutData = sankeyLayout.createHierarchicLayoutData()

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
      } else {
        throw error
      }
    })
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
    const tagUndoUnit = new TagUndoUnit(
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
 * Assigns a new style to the given label.
 * @param {ILabel} label The given label
 */
function setLabelStyle(label) {
  // set the default style for the node labels
  const labelStyle = new DefaultLabelStyle({
    textFill: new SolidColorFill(getNodeColor(label.owner.sourceNode)),
    font: '9px bold Arial'
  })
  graphComponent.graph.setStyle(label, labelStyle)
}

/**
 * Returns the color for the given node.
 * @param {INode} node The given node
 */
function getNodeColor(node) {
  return !node.tag ? new Color(102, 153, 204) : nodeColors[node.tag.colorId]
}

/**
 * Initializes the color arrays.
 */
function initializeColorArrays() {
  // available node colors
  nodeColors = [
    new Color(102, 153, 204),
    new Color(55, 55, 55),
    Color.FIREBRICK,
    Color.GOLDENROD,
    Color.FOREST_GREEN,
    new Color(153, 51, 102),
    new Color(51, 102, 255),
    new Color(102, 102, 153),
    new Color(255, 145, 255),
    new Color(128, 255, 128),
    new Color(255, 101, 2),
    new Color(87, 173, 87),
    new Color(44, 174, 212),
    new Color(139, 69, 19)
  ]

  // available edge colors
  edgeColors = [
    new Color(194, 221, 249),
    new Color(161, 161, 161),
    new Color(254, 128, 128),
    new Color(254, 229, 128),
    new Color(203, 229, 128),
    new Color(203, 153, 178),
    new Color(101, 136, 252),
    new Color(160, 160, 209),
    new Color(249, 207, 249),
    new Color(199, 250, 199),
    new Color(246, 200, 169),
    new Color(164, 240, 164),
    new Color(163, 221, 239),
    new Color(222, 178, 144)
  ]
}

/**
 * Updates the graph based on the given label's text change.
 * @param {ILabel} label The given label
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
 * Applies selected color to the edges adjacent to the given node.
 * @param {INode} node The given node
 * @param {Color} color The desired color
 */
function applySelectedColorToEdges(node, color) {
  const graph = graphComponent.graph
  const compoundEdit = graph.beginEdit('Edge Color changed', 'Edge Color changed')
  graph.edgesAt(node).forEach(edge => {
    // copy the old tag
    const oldTag = Object.assign({}, edge.tag)
    edge.tag.color = color
    // create an undo unit to be able to apply undo/redo operations
    const tagUndoUnit = new TagUndoUnit('Color changed', 'Color changed', oldTag, edge.tag, edge)
    graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
  })
  graphComponent.invalidate()
  compoundEdit.commit()
}

// runs the demo
loadJson().then(run)
