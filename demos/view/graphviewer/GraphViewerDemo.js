/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  BezierEdgeStyle,
  Color,
  EdgeStyleIndicatorRenderer,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphOverviewComponent,
  GraphViewerInputMode,
  IEdge,
  IGraph,
  IInputModeContext,
  IModelItem,
  INode,
  ItemClickedEventArgs,
  License,
  Mapper,
  NodeStyleIndicatorRenderer,
  Point,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Stroke,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'

import { GraphSearch } from '@yfiles/demo-utils/GraphSearch'
import FastCanvasStyles from './FastCanvasStyles'
import { DemoStyleOverviewRenderer } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import { openGraphML } from '@yfiles/demo-utils/graphml-support'
import { registerTemplateStyleSerialization } from '@yfiles/demo-utils/template-styles/MarkupExtensions'
import { StringTemplateNodeStyle } from '@yfiles/demo-utils/template-styles/StringTemplateNodeStyle'

let graphComponent

let overviewComponent

let graphDescriptionMapper
let descriptionMapper
let tooltipMapper
let urlMapper

/**
 * Holds the graph search object functionality.
 */
let graphSearch

// get hold of some UI elements
const graphChooserBox = document.querySelector('#graph-chooser')
const graphDescription = document.querySelector('#graph-info-content')
const nodeInfo = document.querySelector('#node-info-label')
const nodeInfoDescription = document.querySelector('#node-info-description')
const nodeInfoUrl = document.querySelector('#node-info-url')
const searchBox = document.querySelector('#search-box')

async function run() {
  License.value = await fetchLicense()

  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // initialize the graph component
  initializeGraphComponent()

  // add the graph functionality
  initializeGraphSearch()

  for (const sample of [
    'computer-network',
    'orgchart',
    'movies',
    'family-tree',
    'hierarchy',
    'nesting',
    'social-network',
    'uml-diagram',
    'large-tree',
    'bezier-style'
  ]) {
    const option = document.createElement('option')
    option.text = sample
    option.value = sample
    graphChooserBox.add(option)
  }
  // bind toolbar functionality
  initializeUI()
  //bind converters of the template node styles.
  initializeConverters()
  // load the first graph
  void readSampleGraph()
  // reset the node info view
  onCurrentItemChanged()

  initializeInputMode()
}

/**
 * Initializes the graph component
 */
function initializeGraphComponent() {
  // we want to enable folding for loading and showing nested graphs
  enableFolding()

  initializeHighlightStyles()

  // set style for the overview control
  overviewComponent.graphOverviewRenderer = new DemoStyleOverviewRenderer()

  graphDescriptionMapper = new Mapper()
  descriptionMapper = new Mapper()
  tooltipMapper = new Mapper()
  urlMapper = new Mapper()

  // whenever the currentItem property on the graph changes, we want to get notified...
  graphComponent.addEventListener('current-item-changed', onCurrentItemChanged)
}

/**
 * Initialize the styles that are used for highlighting items.
 */
function initializeHighlightStyles() {
  // we want to create a non-default nice highlight styling
  // for the hover highlight, create semi transparent orange stroke first
  const orangeRed = Color.ORANGE_RED
  const orangeStroke = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3).freeze()

  // nodes should be given a rectangular orange rectangle highlight shape
  const highlightShape = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: orangeStroke,
    fill: null
  })

  const nodeStyleHighlight = new NodeStyleIndicatorRenderer({
    nodeStyle: highlightShape,
    // that should be slightly larger than the real node
    margins: 5,
    // but have a fixed size in the view coordinates
    zoomPolicy: StyleIndicatorZoomPolicy.VIEW_COORDINATES
  })

  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(nodeStyleHighlight)

  // a similar style for the edges, however, cropped by the highlight's insets
  const dummyCroppingArrow = new Arrow({ type: ArrowType.NONE, cropLength: 5 })

  const edgeStyle = new PolylineEdgeStyle({
    stroke: orangeStroke,
    targetArrow: dummyCroppingArrow,
    sourceArrow: dummyCroppingArrow
  })
  const edgeStyleHighlight = new EdgeStyleIndicatorRenderer({
    edgeStyle,
    zoomPolicy: StyleIndicatorZoomPolicy.VIEW_COORDINATES
  })

  const bezierEdgeStyle = new BezierEdgeStyle({
    stroke: orangeStroke,
    targetArrow: dummyCroppingArrow,
    sourceArrow: dummyCroppingArrow
  })
  const bezierEdgeStyleHighlight = new EdgeStyleIndicatorRenderer({
    edgeStyle: bezierEdgeStyle,
    zoomPolicy: StyleIndicatorZoomPolicy.VIEW_COORDINATES
  })

  graphComponent.graph.decorator.edges.highlightRenderer.addFactory((edge) =>
    edge.style instanceof BezierEdgeStyle ? bezierEdgeStyleHighlight : edgeStyleHighlight
  )
}

/**
 * Initialize and configure the input mode.
 */
function initializeInputMode() {
  // we have a viewer application, so we can use the GraphViewerInputMode
  // -enable support for: tooltips on nodes and edges
  // -clicking on nodes
  // -focusing (via keyboard navigation) of nodes
  // -no selection
  // -no marquee
  const graphViewerInputMode = new GraphViewerInputMode({
    toolTipItems: GraphItemTypes.LABEL_OWNER,
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE,
    marqueeSelectableItems: GraphItemTypes.NONE
  })

  // As the selection is deactivated, the focused item is highlighted instead
  graphComponent.focusIndicatorManager.showFocusPolicy = 'always'

  // we want to enable the user to collapse and expand groups interactively, even though we
  // are just a "viewer" application
  graphViewerInputMode.navigationInputMode.allowCollapseGroup = true
  graphViewerInputMode.navigationInputMode.allowExpandGroup = true
  // after expand/collaps/enter/exit operations - perform a fitContent operation to adjust
  // reachable area.
  graphViewerInputMode.navigationInputMode.fitContentAfterGroupActions = false
  // we don't have selection enabled and thus the commands should use the "currentItem"
  // property instead - this property is changed when clicking on items or navigating via
  // the keyboard.
  graphViewerInputMode.navigationInputMode.useCurrentItemForCommands = true

  // we want to get reports of the mouse being hovered over nodes and edges
  // first enable queries
  graphViewerInputMode.itemHoverInputMode.enabled = true
  // set the items to be reported
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.NODE
  // whenever the currently hovered item changes call our method
  graphViewerInputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) =>
    onHoveredItemChanged(evt.item)
  )

  // when the mouse hovers for a longer time over an item we may optionally display a
  // tooltip. Use this callback for querying the tooltip contents.
  graphViewerInputMode.addEventListener('query-item-tool-tip', (evt) => {
    if (evt.item) {
      evt.toolTip = onQueryItemToolTip(evt.item)
    }
  })
  // slightly offset the tooltip so that it does not interfere with the mouse
  graphViewerInputMode.toolTipInputMode.toolTipLocationOffset = new Point(0, 10)
  // we show the tooltip for a very long time...
  graphViewerInputMode.toolTipInputMode.duration = '10s'

  // if we click on an item we want to perform a custom action, so register a callback
  graphViewerInputMode.addEventListener('item-clicked', (evt) => onItemClicked(evt))

  // also if someone clicked on an empty area we want to perform a custom group action
  graphViewerInputMode.clickInputMode.addEventListener('clicked', (args) => {
    // if the user pressed a modifier key during the click...
    if (args.shiftKey || args.ctrlKey) {
      onClickInputModeOnClicked(args.context, args.location)
    }
  })

  graphComponent.inputMode = graphViewerInputMode
}

/**
 * Called when the mouse hovers over a different item.
 * This method will be called whenever the mouse moves over a different item. We show a highlight
 * indicator to make it easier for the user to understand the graph's structure.
 */
function onHoveredItemChanged(item) {
  // we use the highlight manager of the GraphComponent to highlight related items
  const highlights = graphComponent.highlights

  // first remove previous highlights
  highlights.clear()
  // then see where we are hovering over, now
  if (item == null) {
    return
  }
  highlights.add(item)
  if (item instanceof INode) {
    // and if it's a node, we highlight all adjacent edges, too
    for (const edge of graphComponent.graph.edgesAt(item).toArray()) {
      highlights.add(edge)
    }
  } else if (item instanceof IEdge) {
    // if it's an edge - we highlight the adjacent nodes
    highlights.add(item.sourceNode)
    highlights.add(item.targetNode)
  }
}

/**
 * Called when the mouse has been clicked somewhere.
 * @param context The context for the current event
 * @param location The location of the click
 */
function onClickInputModeOnClicked(context, location) {
  // we check if there was something at the provided location..
  if (graphComponent.graphModelManager.hitTester.enumerateHits(context, location).size === 0) {
    // and if there wasn't we try to exit the current group in case we are inside a folder node
    const navigationInputMode = graphComponent.inputMode.navigationInputMode
    if (graphComponent.graph.foldingView && navigationInputMode.allowExitGroup) {
      navigationInputMode.exitGroup()
    }
  }
}

/**
 * Enable folding - change the GraphComponent's graph to a managed view
 * that provides the actual collapse/expand state.
 */
function enableFolding() {
  // create the manager
  const foldingManager = new FoldingManager()
  // replace the displayed graph with a managed view
  graphComponent.graph = foldingManager.createFoldingView().graph
}

/**
 * If the currentItem property on GraphComponent's changes we adjust the details panel.
 */
function onCurrentItemChanged() {
  // clear the current display
  nodeInfo.innerHTML = 'Empty'
  nodeInfoDescription.innerHTML = 'Empty'
  nodeInfoUrl.innerHTML = 'None'

  const currentItem = graphComponent.currentItem
  if (currentItem instanceof INode) {
    // for nodes display the label and the values of the mappers for description and URLs..
    const node = currentItem
    nodeInfo.innerHTML = node.labels.size > 0 ? node.labels.first().text : 'Empty'
    const content = getDescription(node)
    nodeInfoDescription.innerHTML = content ? content : 'Empty'
    const url = getUrl(node)
    if (url !== null) {
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('target', '_blank')
      a.innerHTML = 'External'
      nodeInfoUrl.innerHTML = ''
      nodeInfoUrl.appendChild(a)
    }
  }
}

/**
 * If an item has been clicked, we can execute a custom command.
 * @param event The item clicked event
 */
function onItemClicked({ item, shiftKey, ctrlKey }) {
  if (item instanceof INode) {
    // we adjust the currentItem property
    graphComponent.currentItem = item
    // if the shift and control key had been pressed, we enter the group node if possible
    if (shiftKey && ctrlKey) {
      const navigationInputMode = graphComponent.inputMode.navigationInputMode
      if (graphComponent.graph.foldingView && navigationInputMode.allowEnterGroup) {
        navigationInputMode.enterGroup(item)
      }
    }
  }
}

/**
 * Callback that will determine the tooltip content when the mouse hovers over a node.
 * @param item The item for which the tooltip is queried
 * @returns The tooltip element or null if no tooltip is available
 */
function onQueryItemToolTip(item) {
  if (item instanceof INode) {
    const description = getDescription(item)
    const toolTip = getToolTip(item)
    const text = toolTip ? toolTip : description
    return text ? createTooltipContent(text) : null
  }
  return null
}

/**
 * Create the toolTip as a rich HTML element.
 * @returns The tooltip element
 */
function createTooltipContent(toolTipText) {
  const text = document.createElement('p')
  text.innerHTML = toolTipText
  const tooltip = document.createElement('div')
  tooltip.classList.add('tooltip')
  tooltip.appendChild(text)
  return tooltip
}

/**
 * Helper method that reads the currently selected graphml from the combobox.
 */
async function readSampleGraph() {
  // Disable navigation buttons while graph is loaded
  setUIDisabled(true)
  searchBox.value = ''
  graphSearch.updateSearch('')

  // first derive the file name
  const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
  const fileName = `resources/${selectedItem}.graphml`
  // then load the graph
  await createGraphMLIOHandler().readFromURL(graphComponent.graph, fileName)
  // when done - fit the bounds
  await graphComponent.fitGraphBounds()
  // and update the graph description pane
  const desc = graphDescriptionMapper.get(graphComponent.graph.foldingView.manager.masterGraph)
  graphDescription.innerHTML = desc !== null ? desc : ''
  // re-enable navigation buttons
  setUIDisabled(false)
}

/**
 * Gets the description for the given node.
 */
function getDescription(node) {
  const masterNode = graphComponent.graph.foldingView.getMasterItem(node)
  return descriptionMapper.get(masterNode)
}

/**
 * Gets the tool tip text for the given node.
 */
function getToolTip(node) {
  const masterNode = graphComponent.graph.foldingView.getMasterItem(node)
  return tooltipMapper.get(masterNode)
}

/**
 * Gets the external resource location for the given node.
 */
function getUrl(node) {
  const masterNode = graphComponent.graph.foldingView.getMasterItem(node)
  return urlMapper.get(masterNode)
}

/**
 * Helper method that creates and configures the GraphML parser.
 */
function createGraphMLIOHandler() {
  const ioHandler = new GraphMLIOHandler()
  registerTemplateStyleSerialization(ioHandler)
  // enable support for fast style implementations
  ioHandler.addXamlNamespaceMapping('http://www.yworks.com/yfilesHTML/demos/', FastCanvasStyles)
  // we also want to populate the mappers for "Description", "ToolTip", and "Url"
  ioHandler.addInputMapper(INode, String, 'Description', descriptionMapper)
  ioHandler.addInputMapper(INode, String, 'ToolTip', tooltipMapper)
  ioHandler.addInputMapper(INode, String, 'Url', urlMapper)
  graphDescriptionMapper.clear()
  // as well as the description of the graph
  ioHandler.addInputMapper(IGraph, String, 'GraphDescription', graphDescriptionMapper)
  return ioHandler
}

/**
 * Initializes the graph search object.
 */
function initializeGraphSearch() {
  graphSearch = new CustomGraphSearch(graphComponent)
  graphSearch.highlightRenderer = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      stroke: '3px limegreen',
      fill: null
    }),
    margins: 10
  })
  GraphSearch.registerEventListener(searchBox, graphSearch)
}

/**
 * Registers actions to the toolbar elements.
 */
function initializeUI() {
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openGraphML(graphComponent)
  })
  addNavigationButtons(graphChooserBox).addEventListener('change', readSampleGraph)
}

/**
 * Updates the elements of the UI's state and the input mode and checks whether the buttons should
 * be enabled or not.
 */
function setUIDisabled(disabled) {
  graphChooserBox.disabled = disabled
  searchBox.disabled = disabled
}

/**
 * Initializes the converters for the bindings of the template node styles.
 */
function initializeConverters() {
  const colors = { present: '#76b041', busy: '#ab2346', travel: '#a367dc', unavailable: '#c1c1c1' }

  StringTemplateNodeStyle.CONVERTERS.demoConverters = {
    // converter function for the background color of nodes
    statusColorConverter: (value) => colors[value] || 'white',

    // converter function for the border color nodes
    selectedStrokeConverter: (value) => {
      if (typeof value === 'boolean') {
        return value ? '#ff6c00' : 'rgba(0,0,0,0)'
      }
      return '#FFF'
    },

    // converter function that adds the numbers given as value and parameter
    addConverter: (value, parameter) => {
      if (typeof parameter === 'string') {
        return String(Number(value) + Number(parameter))
      }
      return value
    },

    // converter function that converts the given string to a valid path
    pathConverter: (value) => {
      if (typeof value === 'string') {
        return `./resources/${value}.svg`
      }
      return value
    }
  }
}

/**
 * A class that implements a custom graph search. The matching string is queried on the labels and
 * the tags of the nodes.
 */
class CustomGraphSearch extends GraphSearch {
  /**
   * Returns whether the given node is a match when searching for the given text.
   * This method searches the matching string to the labels and the tags of the nodes.
   * @param node The node to be examined
   * @param text The text to be queried
   * @returns True if the node matches the text, false otherwise
   */
  matches(node, text) {
    const lowercaseText = text.toLowerCase()
    // the icon property does not have to be matched
    if (
      node.tag &&
      Object.getOwnPropertyNames(node.tag).some(
        (prop) =>
          prop !== 'icon' &&
          node.tag[prop] &&
          node.tag[prop].toString().toLowerCase().indexOf(lowercaseText) !== -1
      )
    ) {
      return true
    }
    return node.labels.some((label) => label.text.toLowerCase().indexOf(lowercaseText) !== -1)
  }
}

run().then(finishLoading)
