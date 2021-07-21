/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeStyleDecorationInstaller,
  FoldingManager,
  GraphComponent,
  GraphInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphOverviewComponent,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IGraph,
  IInputModeContext,
  IMapper,
  IModelItem,
  INode,
  License,
  Mapper,
  ModifierKeys,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  ShapeNodeShape,
  ShapeNodeStyle,
  StorageLocation,
  Stroke,
  StyleDecorationZoomPolicy,
  TemplateNodeStyle,
  TimeSpan,
  YString
} from 'yfiles'

import GraphSearch from '../../utils/GraphSearch.js'
import FastCanvasStyles from './FastCanvasStyles.js'
import ContextMenu from '../../utils/ContextMenu.js'
import DemoStyles, {
  DemoSerializationListener,
  DemoStyleOverviewPaintable
} from '../../resources/demo-styles.js'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  readGraph,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent

/** @type {GraphOverviewComponent} */
let overviewComponent

/** @type {Mapper.<IGraph,string>} */
let graphDescriptionMapper

/**
 * Holds the graph search object functionality.
 * @type {CustomGraphSearch}
 */
let graphSearch

// get hold of some UI elements
const graphChooserBox = document.getElementById('graphChooserBox')
const nextButton = document.getElementById('nextFileButton')
const previousButton = document.getElementById('previousFileButton')
const graphDescription = document.getElementById('graphInfoContent')
const nodeInfo = document.getElementById('nodeInfoLabel')
const nodeInfoDescription = document.getElementById('nodeInfoDescription')
const nodeInfoUrl = document.getElementById('nodeInfoUrl')
const searchBox = document.getElementById('searchBox')

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // bind toolbar commands
  registerCommands()

  // initializes converters for org chart style
  initConverters()

  // initialize the graph component
  initializeGraphComponent()
  // enable GraphML support
  enableGraphML()

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

  // load the first graph
  readSampleGraph()
  // reset the node info view
  onCurrentItemChanged()

  // initialize the GraphViewerInputMode which is available in 'yfiles/view-component'
  // and does not require 'yfiles/view-editor' in contrast to GraphEditorInputMode
  initializeInputMode()

  // initialize the demo
  showApp(graphComponent, overviewComponent)
}

/**
 * Initializes the graph component
 */
function initializeGraphComponent() {
  // we want to enable folding for loading and showing nested graphs
  enableFolding()

  initializeHighlightStyles()

  // set style for the overview control
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graphComponent.graph)

  // we register and create mappers for nodes and the graph to hold information about
  // the tooltips, descriptions, and associated urls
  const masterRegistry = graphComponent.graph.foldingView.manager.masterGraph.mapperRegistry
  masterRegistry.createMapper(INode.$class, YString.$class, 'ToolTip')
  masterRegistry.createMapper(INode.$class, YString.$class, 'Description')
  masterRegistry.createMapper(INode.$class, YString.$class, 'Url')
  masterRegistry.createMapper(IGraph.$class, YString.$class, 'GraphDescription')
  graphDescriptionMapper = new Mapper()

  // whenever the currentItem property on the graph changes, we want to get notified...
  graphComponent.addCurrentItemChangedListener(onCurrentItemChanged)
}

/**
 * Initialize the styles that are used for highlighting items.
 */
function initializeHighlightStyles() {
  // we want to create a non-default nice highlight styling
  // for the hover highlight, create semi transparent orange stroke first
  const orangeRed = Color.ORANGE_RED
  const orangeStroke = new Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3)
  // freeze it for slightly improved performance
  orangeStroke.freeze()

  // now decorate the nodes and edges with custom hover highlight styles
  const decorator = graphComponent.graph.decorator

  // nodes should be given a rectangular orange rectangle highlight shape
  const highlightShape = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: orangeStroke,
    fill: null
  })

  const nodeStyleHighlight = new NodeStyleDecorationInstaller({
    nodeStyle: highlightShape,
    // that should be slightly larger than the real node
    margins: 5,
    // but have a fixed size in the view coordinates
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })

  // register it as the default implementation for all nodes
  decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)

  // a similar style for the edges, however cropped by the highlight's insets
  const dummyCroppingArrow = new Arrow({
    type: ArrowType.NONE,
    cropLength: 5
  })

  const edgeStyle = new PolylineEdgeStyle({
    stroke: orangeStroke,
    targetArrow: dummyCroppingArrow,
    sourceArrow: dummyCroppingArrow
  })
  const edgeStyleHighlight = new EdgeStyleDecorationInstaller({
    edgeStyle,
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })

  const bezierEdgeStyle = new BezierEdgeStyle({
    stroke: orangeStroke,
    targetArrow: dummyCroppingArrow,
    sourceArrow: dummyCroppingArrow
  })
  const bezierEdgeStyleHighlight = new EdgeStyleDecorationInstaller({
    edgeStyle: bezierEdgeStyle,
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })

  decorator.edgeDecorator.highlightDecorator.setFactory(edge =>
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
  // if there are other items (most importantly labels) in front of edges or nodes
  // they should be discarded, rather than be reported as "null"
  graphViewerInputMode.itemHoverInputMode.discardInvalidItems = false
  // whenever the currently hovered item changes call our method
  graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener((sender, evt) =>
    onHoveredItemChanged(evt.item)
  )

  // when the mouse hovers for a longer time over an item we may optionally display a
  // tooltip. Use this callback for querying the tooltip contents.
  graphViewerInputMode.addQueryItemToolTipListener((sender, evt) => {
    if (evt.item) {
      evt.toolTip = onQueryItemToolTip(evt.item)
    }
  })
  // slightly offset the tooltip so that it does not interfere with the mouse
  graphViewerInputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(0, 10)
  // we show the tooltip for a very long time...
  graphViewerInputMode.mouseHoverInputMode.duration = TimeSpan.from('10s')

  // if we click on an item we want to perform a custom action, so register a callback
  graphViewerInputMode.addItemClickedListener((sender, evt) => onItemClicked(evt.item))

  // also if someone clicked on an empty area we want to perform a custom group action
  graphViewerInputMode.clickInputMode.addClickedListener((sender, args) => {
    // if the user pressed a modifier key during the click...
    if (
      (args.modifiers & (ModifierKeys.SHIFT | ModifierKeys.CONTROL)) ===
      (ModifierKeys.SHIFT | ModifierKeys.CONTROL)
    ) {
      onClickInputModeOnClicked(args.context, args.location)
    }
  })

  initializeContextMenu(graphViewerInputMode)

  graphComponent.inputMode = graphViewerInputMode
}

/**
 * Initialize the context menu.
 * @param {!GraphInputMode} inputMode
 */
function initializeContextMenu(inputMode) {
  // we tell the input mode that we want to get context menus on nodes
  inputMode.contextMenuItems = GraphItemTypes.NODE

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) =>
    populateContextMenu(contextMenu, args)
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Called when the mouse hovers over a different item.
 * This method will be called whenever the mouse moves over a different item. We show a highlight
 * indicator to make it easier for the user to understand the graph's structure.
 * @param {!IModelItem} item
 */
function onHoveredItemChanged(item) {
  // we use the highlight manager of the GraphComponent to highlight related items
  const manager = graphComponent.highlightIndicatorManager

  // first remove previous highlights
  manager.clearHighlights()
  // then see where we are hovering over, now
  const newItem = item
  if (newItem !== null) {
    // we highlight the item itself
    manager.addHighlight(newItem)
    if (newItem instanceof INode) {
      // and if it's a node, we highlight all adjacent edges, too
      for (const edge of graphComponent.graph.edgesAt(newItem)) {
        manager.addHighlight(edge)
      }
    } else if (newItem instanceof IEdge) {
      // if it's an edge - we highlight the adjacent nodes
      manager.addHighlight(newItem.sourceNode)
      manager.addHighlight(newItem.targetNode)
    }
  }
}

/**
 * Helper function to populate the context menu.
 * @param {!ContextMenu} contextMenu
 * @param {!PopulateItemContextMenuEventArgs.<IModelItem>} e
 */
function populateContextMenu(contextMenu, e) {
  if (!(e.item instanceof INode)) {
    return
  }

  const url = getUrl(e.item)
  if (!url) {
    return
  }

  contextMenu.clearItems()
  // if the selected item is a node and has an URL mapped to it:
  // create a context menu item to open the link
  contextMenu.addMenuItem('Open External Link', () => {
    window.open(url, '_blank')
  })
  // we don't want to be queried again if there are more items at this location
  e.showMenu = true
}

/**
 * Called when the mouse has been clicked somewhere.
 * @param {!IInputModeContext} context The context for the current event
 * @param {!Point} location The location of the click
 */
function onClickInputModeOnClicked(context, location) {
  // we check if there was something at the provided location..
  if (graphComponent.graphModelManager.hitTester.enumerateHits(context, location).size === 0) {
    // and if there wasn't we try to exit the current group in case we are inside a folder node
    if (ICommand.EXIT_GROUP.canExecute(null, graphComponent)) {
      ICommand.EXIT_GROUP.execute(null, graphComponent)
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
    nodeInfo.innerHTML = node.labels.size > 0 ? node.labels.elementAt(0).text : 'Empty'
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
 * @param {!IModelItem} item The item that it has been clicked
 */
function onItemClicked(item) {
  if (item instanceof INode) {
    // we adjust the currentItem property
    graphComponent.currentItem = item
    // if the shift and control key had been pressed, we enter the group node if possible
    if (
      (graphComponent.lastMouseEvent.modifiers & (ModifierKeys.SHIFT | ModifierKeys.CONTROL)) ===
      (ModifierKeys.SHIFT | ModifierKeys.CONTROL)
    ) {
      if (ICommand.ENTER_GROUP.canExecute(item, graphComponent)) {
        ICommand.ENTER_GROUP.execute(item, graphComponent)
      }
    }
  }
}

/**
 * Callback that will determine the tooltip content when the mouse hovers over a node.
 * @param {!IModelItem} item The item for which the tooltip is queried
 * @returns {?HTMLElement} The tooltip element or null if no tooltip is available
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
 * @returns {!HTMLElement} The tooltip element
 * @param {!string} toolTipText
 */
function createTooltipContent(toolTipText) {
  const text = document.createElement('p')
  text.innerHTML = toolTipText
  const tooltip = document.createElement('div')
  addClass(tooltip, 'tooltip')
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
  await readGraph(createGraphMLIOHandler(), graphComponent.graph, fileName)
  // when done - fit the bounds
  graphComponent.fitGraphBounds()
  // and update the graph description pane
  const desc = graphDescriptionMapper.get(graphComponent.graph.foldingView.manager.masterGraph)
  graphDescription.innerHTML = desc !== null ? desc : ''
  // re-enable navigation buttons
  setUIDisabled(false)
}

/**
 * Gets the value associated to the given node for the given key.
 * @param {!INode} node
 * @param {!string} key
 * @returns {?string}
 */
function getMappedValue(node, key) {
  const mapper = graphComponent.graph.mapperRegistry.getMapper(key)
  return mapper ? mapper.get(node) : null
}

/**
 * Gets the description for the given node.
 * @param {!INode} node
 * @returns {?string}
 */
function getDescription(node) {
  return getMappedValue(node, 'Description')
}

/**
 * Gets the tool tip text for the given node.
 * @param {!INode} node
 * @returns {?string}
 */
function getToolTip(node) {
  return getMappedValue(node, 'ToolTip')
}

/**
 * Gets the external resource location for the given node.
 * @param {!INode} node
 * @returns {?string}
 */
function getUrl(node) {
  return getMappedValue(node, 'Url')
}

/**
 * Helper method that creates and configures the GraphML parser.
 * @returns {!GraphMLIOHandler}
 */
function createGraphMLIOHandler() {
  const ioHandler = new GraphMLIOHandler()
  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  ioHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  ioHandler.addHandleSerializationListener(DemoSerializationListener)
  // enable support for fast style implementations
  ioHandler.addXamlNamespaceMapping('http://www.yworks.com/yfilesHTML/demos/', FastCanvasStyles)
  // we also want to populate the mappers for "Description", "ToolTip", and "Url"
  ioHandler.addRegistryInputMapper(INode.$class, YString.$class, 'Description')
  ioHandler.addRegistryInputMapper(INode.$class, YString.$class, 'ToolTip')
  ioHandler.addRegistryInputMapper(INode.$class, YString.$class, 'Url')
  graphDescriptionMapper.clear()
  // as well as the description of the graph
  ioHandler.addInputMapper(
    IGraph.$class,
    YString.$class,
    'GraphDescription',
    graphDescriptionMapper
  )
  return ioHandler
}

/**
 * Initializes the graph search object.
 */
function initializeGraphSearch() {
  graphSearch = new CustomGraphSearch(graphComponent)
  graphSearch.highlightDecoration = new NodeStyleDecorationInstaller({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      stroke: '3px limegreen',
      fill: null
    }),
    margins: 5,
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })
  GraphSearch.registerEventListener(searchBox, graphSearch)
}

/**
 * Registers the commands to the toolbar elements.
 */
function registerCommands() {
  // called by the demo framework initially so that the button commands can be bound to actual commands and actions
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent, null)

  bindAction("button[data-command='PreviousFile']", onPreviousButtonClicked)
  bindAction("button[data-command='NextFile']", onNextButtonClicked)
  bindChangeListener("select[data-command='SelectedFileChanged']", readSampleGraph)
}

/**
 * Enables loading the graph to GraphML.
 */
function enableGraphML() {
  // create a new GraphMLSupport instance that handles save and load operations
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  gs.graphMLIOHandler = createGraphMLIOHandler()
}

/**
 * Updates the elements of the UI's state and the input mode and checks whether the buttons should
 * be enabled or not.
 * @param {boolean} disabled
 */
function setUIDisabled(disabled) {
  graphChooserBox.disabled = disabled
  previousButton.disabled = disabled || graphChooserBox.selectedIndex === 0
  nextButton.disabled =
    disabled || graphChooserBox.selectedIndex === graphChooserBox.childElementCount - 1
  searchBox.disabled = disabled
}

/**
 * Switches to the previous graph.
 */
function onPreviousButtonClicked() {
  graphChooserBox.selectedIndex = Math.max(0, graphChooserBox.selectedIndex - 1)
  readSampleGraph()
}

/**
 * Switches to the next graph.
 */
function onNextButtonClicked() {
  graphChooserBox.selectedIndex = Math.min(
    graphChooserBox.selectedIndex + 1,
    graphChooserBox.options.length - 1
  )
  readSampleGraph()
}

/**
 * Initializes the converters for org chart styles.
 */
function initConverters() {
  TemplateNodeStyle.CONVERTERS.orgchartconverters = {
    linebreakconverter: (value, firstline) => {
      if (typeof value === 'string') {
        let copy = value
        while (copy.length > 20 && copy.indexOf(' ') > -1) {
          copy = copy.substring(0, copy.lastIndexOf(' '))
        }
        if (firstline === 'true') {
          return copy
        }
        return value.substring(copy.length)
      }
      return ''
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
   * @param {!INode} node The node to be examined
   * @param {!string} text The text to be queried
   * @returns {boolean} True if the node matches the text, false otherwise
   */
  matches(node, text) {
    const lowercaseText = text.toLowerCase()
    // the icon property does not have to be matched
    if (
      node.tag &&
      Object.getOwnPropertyNames(node.tag).some(
        prop =>
          prop !== 'icon' &&
          node.tag[prop] &&
          node.tag[prop].toString().toLowerCase().indexOf(lowercaseText) !== -1
      )
    ) {
      return true
    }
    return node.labels.some(label => label.text.toLowerCase().indexOf(lowercaseText) !== -1)
  }
}

// run the demo
loadJson().then(checkLicense).then(run)
