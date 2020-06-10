/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BezierEdgeStyle,
  Color,
  DefaultLabelStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HoveredItemChangedEventArgs,
  ICommand,
  IEdge,
  ILabel,
  IModelItem,
  INode,
  InteriorStretchLabelModel,
  IPositionHandler,
  ItemChangedEventArgs,
  LabelEventArgs,
  License,
  MouseEventRecognizers,
  Point,
  PopulateItemContextMenuEventArgs,
  Rect,
  ShapeNodeStyle,
  Size,
  SolidColorFill,
  Stroke
} from 'yfiles'

import GraphBuilderData from './resources/samples.js'
import {
  ConstrainedPositionHandler,
  HighlightManager,
  SankeyPopupSupport,
  TagUndoUnit
} from './SankeyHelper.js'
import ContextMenu from '../../utils/ContextMenu.js'
import { SankeyLayout } from './SankeyLayout.js'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

const colors = [
  { dark: new Color(102, 153, 204), light: new Color(194, 221, 249, 200) },
  { dark: new Color(55, 55, 55), light: new Color(161, 161, 161, 200) },
  { dark: Color.FIREBRICK, light: new Color(254, 128, 128, 200) },
  { dark: Color.GOLDENROD, light: new Color(254, 229, 128, 200) },
  { dark: Color.FOREST_GREEN, light: new Color(203, 229, 128, 200) },
  { dark: new Color(153, 51, 102), light: new Color(203, 153, 178, 200) },
  { dark: new Color(51, 102, 255), light: new Color(101, 136, 252, 200) },
  { dark: new Color(102, 102, 153), light: new Color(160, 160, 209, 200) },
  { dark: new Color(255, 145, 255), light: new Color(249, 207, 249, 200) },
  { dark: new Color(128, 255, 128), light: new Color(199, 250, 199, 200) },
  { dark: new Color(255, 101, 2), light: new Color(246, 200, 169, 200) },
  { dark: new Color(87, 173, 87), light: new Color(164, 240, 164, 200) },
  { dark: new Color(44, 174, 212), light: new Color(163, 221, 239, 200) },
  { dark: new Color(139, 69, 19), light: new Color(222, 178, 144, 200) }
]

const colorDirectionBox = document.getElementById('colorDirection')

/**
 * Creates and configures the layout algorithm for the Sankey visualization.
 * @type {?SankeyLayout}
 */
let sankeyLayout
/**
 * The GraphComponent
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The node popup that will provide the available node colors.
 * @type {SankeyPopupSupport}
 */
let nodePopup = null

/**
 * Holds whether or not a layout is running.
 * @type {boolean}
 */
let inLayout = false

/**
 * Runs the demo.
 * @param {object} licenseData
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
 * Initializes the default styles for nodes, edges and labels, the undo engine and the necessary
 * listeners.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  graph.nodeDefaults.shareStyleInstance = false
  // set the default style for the nodes and edges
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'rgb(102, 153, 204)',
    stroke: null
  })

  // use a label model that stretches the label over the full node layout, with small insets
  const centerLabelModel = new InteriorStretchLabelModel({ insets: 3 })
  graph.nodeDefaults.labels.layoutParameter = centerLabelModel.createParameter('center')

  // set the default style for the node labels
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textFill: 'white',
    font: '16px Arial',
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
      if (item.style instanceof ShapeNodeStyle) {
        const style = item.style
        style.fill = new SolidColorFill(getNodeColor(item))
        graphComponent.invalidate()
      }
    }
  })

  // enable the undo engine
  graph.undoEngineEnabled = true

  // nodes should only be moved along the y axis
  graph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
    (node, handler) => {
      return new ConstrainedPositionHandler(handler)
    }
  )

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
    selectableItems: GraphItemTypes.NONE,
    deletableItems: GraphItemTypes.NONE,
    allowCreateEdge: false,
    allowCreateNode: false,
    movableItems: GraphItemTypes.NODE
  })

  mode.moveUnselectedInputMode.enabled = true
  mode.moveInputMode.enabled = false
  mode.moveUnselectedInputMode.addDragFinishedListener(() => runLayout())

  mode.marqueeSelectionInputMode.enabled = false
  mode.moveViewportInputMode.pressedRecognizer = MouseEventRecognizers.LEFT_DOWN
  mode.moveUnselectedInputMode.priority = mode.moveViewportInputMode.priority - 1

  // listener to react in edge label text changing
  mode.addLabelTextChangedListener((sender, args) => {
    if (IEdge.isInstance(args.item.owner)) {
      onEdgeLabelChanged(args.item)
    }
  })

  // listener to react in edge label addition
  mode.addLabelAddedListener((sender, evt) => {
    if (evt.item.owner && IEdge.isInstance(evt.item.owner)) {
      onEdgeLabelChanged(evt.item)
    }
  })

  mode.itemHoverInputMode.enabled = true
  mode.itemHoverInputMode.hoverItems =
    GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL | GraphItemTypes.NODE
  mode.itemHoverInputMode.discardInvalidItems = false
  // add hover listener to implement edge and label highlighting
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    const highlightManager = graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    const item = args.item
    if (item) {
      if (INode.isInstance(item)) {
        return
      }
      highlightManager.addHighlight(item)
      if (IEdge.isInstance(item)) {
        item.labels.forEach(label => {
          highlightManager.addHighlight(label)
        })
      } else if (ILabel.isInstance(item)) {
        const label = item
        if (label.owner) {
          highlightManager.addHighlight(label.owner)
        }
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
  mode.addPopulateItemContextMenuListener((sender, evt) => populateContextMenu(contextMenu, evt))

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
  })

  mode.addItemClickedListener(() => {
    nodePopup.currentItem = null
  })

  graphComponent.inputMode = mode
}

/**
 * Populates the context menu based on the item that is right-clicked.
 * @param {ContextMenu} contextMenu The context menu
 * @param {PopulateItemContextMenuEventArgs.<IModelItem>} args The event args
 */
function populateContextMenu(contextMenu, args) {
  args.showMenu = true

  contextMenu.clearItems()
  nodePopup.currentItem = null

  // In this demo, we use the following custom hit testing to prefer nodes.
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

  // Check whether a node was it. If it was, we prefer it over edges
  const hit = hits.find(item => INode.isInstance(item)) || hits.firstOrDefault()

  const graphSelection = graphComponent.selection
  if (INode.isInstance(hit)) {
    contextMenu.addMenuItem('Change Node Color', () => {
      nodePopup.currentItem = hit
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

  const nodeColorContainer = nodePopup.div
  nodeColorContainer.addEventListener(
    'click',
    () => {
      nodePopup.currentItem = null
    },
    false
  )

  for (const color of colors.map(c => c.dark)) {
    createColorPopupMenu(color)
  }
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

  colorDirectionBox.addEventListener('change', () => {
    assignEdgeColors()
  })
}

/**
 * Creates the sample graph.
 * @returns {Promise}
 */
async function createSampleGraph() {
  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  const builder = new GraphBuilder(graphComponent.graph)
  builder.createNodesSource({
    data: GraphBuilderData.nodes,
    id: 'id',
    layout: data => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height),
    labels: ['label']
  })
  builder.createEdgesSource({
    data: GraphBuilderData.edges,
    sourceId: 'from',
    targetId: 'to',
    labels: ['label']
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
      edge.tag = { color: colors[node.tag.colorId].light }
    })
  })

  // assign label styles
  graph.edges.forEach(edge => {
    edge.labels.forEach(label => {
      const labelStyle = new DefaultLabelStyle({
        font: '14px Arial'
      })
      graphComponent.graph.setStyle(label, labelStyle)
      setEdgeLabelColor(label)
    })
  })

  // normalize the edges' thickness and run a new layout
  normalizeThickness()

  // set edges styles with newly calculated thickness and appropriate colors
  graph.edges.forEach(edge => {
    setEdgeStyle(edge)
  })

  await runLayout()
  graphComponent.graph.undoEngine.clear()
}

/**
 * Adds the given color to the popup menu.
 * @param {Color} color The color to be added
 */
function createColorPopupMenu(color) {
  const div = window.document.createElement('div')
  div.setAttribute('style', `background-color:rgb(${color.r},${color.g},${color.b})`)
  div.setAttribute('class', 'colorButton')

  nodePopup.div.appendChild(div)

  // add the event listener that will change the node/edge color when the particular color button is pressed
  div.addEventListener(
    'click',
    () => {
      const selectedNode = graphComponent.selection.selectedNodes.firstOrDefault()
      if (!selectedNode) {
        return
      }
      const oldColorId = selectedNode.tag.colorId
      graphComponent.graph.nodes
        .filter(node => node.tag.colorId === oldColorId)
        .forEach(node => {
          const oldTag = Object.assign({}, node.tag)
          node.tag = {
            colorId: colors.map(c => c.dark).indexOf(color)
          }
          graphComponent.invalidate()
          const tagUndoUnit = new TagUndoUnit(
            'Color changed',
            'Color changed',
            oldTag,
            node.tag,
            node,
            () => assignEdgeColorsAtNode(node)
          )
          graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
        })
      assignEdgeColors()
    },
    false
  )
}

/**
 * Applies the layout algorithm to the given graphComponent.
 * @returns {Promise}
 */
async function runLayout() {
  const graph = graphComponent.graph
  if (graph.nodes.size === 0 || inLayout) {
    return
  }
  if (!sankeyLayout) {
    sankeyLayout = new SankeyLayout(graphComponent)
  }
  inLayout = true

  // configure the layout algorithm
  const hierarchicLayout = sankeyLayout.configureHierarchicLayout(true)
  const hierarchicLayoutData = sankeyLayout.createHierarchicLayoutData()
  try {
    // run the layout and animate the result
    await graphComponent.morphLayout(hierarchicLayout, '1s', hierarchicLayoutData)
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    inLayout = false
  }
}

/**
 * Normalizes the thickness of the edges of the graph based on the current label texts. The largest
 * thickness is
 * 400, while the smallest 1. If the label text is not a number, edge thickness 1 will be assigned.
 */
function normalizeThickness() {
  let min = Number.MAX_VALUE
  let max = -Number.MAX_VALUE

  // find the minimum and maximum flow value from the graph's edge labels
  graphComponent.graph.edges.forEach(edge => {
    const labels = edge.labels

    if (labels.size > 0) {
      let value = parseFloat(labels.get(0).text)
      if (Number.isNaN(value)) {
        value = 1
      }
      value = Math.max(0, value)
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
      edge.tag.thickness = Math.floor(smallestThickness + (value - min) * thicknessScale)
    }

    const tagUndoUnit = new TagUndoUnit(
      'Thickness changed',
      'Thickness changed',
      oldTag,
      edge.tag,
      edge,
      null
    )

    graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
  })
}

/**
 * Assigns a new style to the given label.
 * @param {ILabel} label The given label
 */
function setEdgeLabelColor(label) {
  if (label.owner) {
    const color = colors[getColorId(label.owner.tag.color)].dark
    if (label.style) {
      const style = label.style
      style.textFill = new SolidColorFill(color)
    }
  }
}

/**
 * Updates the edge stroke to the appropriate color and thickness
 * @param {IEdge} edge The edge to update the stroke
 */
function updateEdgeStroke(edge) {
  const stroke = edge.style.stroke
  if (stroke) {
    stroke.thickness = edge.tag.thickness
    stroke.fill = new SolidColorFill(edge.tag.color)
  }
}

/**
 * Sets the style of an edge to {@link BezierEdgeStyle} with the appropriate
 * color and thickness
 * @param {IEdge} edge The edge to set the new style on
 */
function setEdgeStyle(edge) {
  graphComponent.graph.setStyle(
    edge,
    new BezierEdgeStyle({
      stroke: new Stroke(new SolidColorFill(edge.tag.color), edge.tag.thickness)
    })
  )
}

/**
 * Returns the color for the given node.
 * @param {INode} node The given node
 * @returns {Color}
 */
function getNodeColor(node) {
  return !node.tag ? colors[0].dark : colors[node.tag.colorId].dark
}

/**
 * @param {Color} color
 * @returns {number}
 */
function getColorId(color) {
  return colors.findIndex(({ dark, light }) => dark === color || light === color)
}

/**
 * Updates the graph based on the given label's text change.
 * @param {ILabel} label The given label
 * @returns {Promise}
 */
async function onEdgeLabelChanged(label) {
  // for cosmetic reasons only
  graphComponent.highlightIndicatorManager.clearHighlights()

  // start a compound edit to merge thickness changes and layout
  const compoundEdit = graphComponent.graph.beginEdit(
    'Edge Label Text Changed',
    'Edge Label Text Changed'
  )
  setEdgeLabelColor(label)
  normalizeThickness()

  // update edges styles
  graphComponent.graph.edges.forEach(edge => {
    updateEdgeStroke(edge)
  })

  await runLayout()
  if (compoundEdit) {
    compoundEdit.commit()
  }
}

function assignEdgeColors() {
  // for cosmetic reasons only
  graphComponent.highlightIndicatorManager.clearHighlights()

  for (const node of graphComponent.graph.nodes) {
    assignEdgeColorsAtNode(node)
  }
  graphComponent.invalidate()
}

/**
 * @param {INode} node
 */
function assignEdgeColorsAtNode(node) {
  const outgoing = colorDirectionBox.value === 'outgoing'
  const graph = graphComponent.graph
  const edges = outgoing ? graph.outEdgesAt(node) : graph.inEdgesAt(node)
  for (const edge of edges) {
    edge.tag.color = colors[node.tag.colorId].light
    edge.labels.forEach(label => {
      setEdgeLabelColor(label)
    })
    updateEdgeStroke(edge)
  }
}

// runs the demo
loadJson().then(run)
