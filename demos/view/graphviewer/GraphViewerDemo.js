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

/* eslint-disable no-new */

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-component',
  'FastCanvasStyles.js',
  'resources/demo-styles',
  'resources/demo-app',
  'utils/ContextMenu',
  'resources/license',
  'yfiles/view-graphml'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  FastCanvasStyles,
  DemoStyles,
  app,
  ContextMenu
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.view.GraphOverviewComponent} */
  let overviewComponent = null

  /** @type {yfiles.collections.Mapper} */
  let graphDescriptionMapper = null

  /** @type {yfiles.view.HighlightIndicatorManager} */
  let searchIndicatorManager = null

  /** @type {Array} */
  let matchingNodes = []

  // get hold of some UI elements
  const graphChooserBox = document.getElementById('graphChooserBox')
  const nextButton = document.getElementById('nextFileButton')
  const previousButton = document.getElementById('previousFileButton')
  const graphDescription = document.getElementById('graphInfoContent')
  const nodeInfo = document.getElementById('nodeInfoLabel')
  const nodeInfoDescription = document.getElementById('nodeInfoDescription')
  const nodeInfoUrl = document.getElementById('nodeInfoUrl')
  const searchBox = document.getElementById('searchBox')

  function run() {
    // initialize the GraphComponent and GraphOverviewComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    overviewComponent = new yfiles.view.GraphOverviewComponent('overviewComponent', graphComponent)

    // bind toolbar commands
    registerCommands()

    // initializes converters for org chart style
    initConverters()

    // initialize the graph component
    initializeGraphComponent()
    // enable GraphML support
    enableGraphML()
    // add the sample graphs
    ;[
      'computer-network',
      'orgchart',
      'movies',
      'family-tree',
      'hierarchy',
      'nesting',
      'social-network',
      'uml-diagram',
      'large-tree'
    ].forEach(graph => {
      const option = document.createElement('option')
      option.text = graph
      option.value = graph
      graphChooserBox.add(option)
    })
    readSampleGraph() // load the first graph
    onCurrentItemChanged() // reset the node info view

    // initialize the GraphViewerInputMode which is available in 'yfiles/view-component'
    // and does not require 'yfiles/view-editor' in contrast to GraphEditorInputMode
    initializeInputMode()

    // initialize the demo
    app.show(graphComponent, overviewComponent)
  }

  /**
   * Initializes the graph component
   */
  function initializeGraphComponent() {
    // we want to enable folding for loading and showing nested graphs
    enableFolding()

    initializeHighlightStyles()

    // set style for the overview control
    overviewComponent.graphVisualCreator = new DemoStyles.DemoStyleOverviewPaintable(
      graphComponent.graph
    )

    // we register and create mappers for nodes and the graph to hold information about
    // the tooltips, descriptions, and associated urls
    const masterRegistry = graphComponent.graph.foldingView.manager.masterGraph.mapperRegistry
    masterRegistry.createMapper(yfiles.graph.INode.$class, yfiles.lang.String.$class, 'ToolTip')
    masterRegistry.createMapper(yfiles.graph.INode.$class, yfiles.lang.String.$class, 'Description')
    masterRegistry.createMapper(yfiles.graph.INode.$class, yfiles.lang.String.$class, 'Url')
    masterRegistry.createMapper(
      yfiles.graph.IGraph.$class,
      yfiles.lang.String.$class,
      'GraphDescription'
    )
    graphDescriptionMapper = new yfiles.collections.Mapper()

    // whenever the currentItem property on the graph changes, we want to get notified...
    graphComponent.addCurrentItemChangedListener(onCurrentItemChanged)
  }

  /**
   * Initialize the styles that are used for highlighting items.
   */
  function initializeHighlightStyles() {
    // we want to create a non-default nice highlight styling
    // for the hover highlight, create semi transparent orange stroke first
    const orangeRed = yfiles.view.Color.ORANGE_RED
    const orangeStroke = new yfiles.view.Stroke(orangeRed.r, orangeRed.g, orangeRed.b, 220, 3)
    // freeze it for slightly improved performance
    orangeStroke.freeze()

    // now decorate the nodes and edges with custom hover highlight styles
    const decorator = graphComponent.graph.decorator

    // nodes should be given a rectangular orange rectangle highlight shape
    const highlightShape = new yfiles.styles.ShapeNodeStyle({
      shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
      stroke: orangeStroke,
      fill: null
    })

    const nodeStyleHighlight = new yfiles.view.NodeStyleDecorationInstaller({
      nodeStyle: highlightShape,
      // that should be slightly larger than the real node
      margins: 5,
      // but have a fixed size in the view coordinates
      zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES
    })

    // register it as the default implementation for all nodes
    decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)

    // a similar style for the edges, however cropped by the highlight's insets
    const dummyCroppingArrow = new yfiles.styles.Arrow({
      type: yfiles.styles.ArrowType.NONE,
      cropLength: 5
    })
    const edgeStyle = new yfiles.styles.PolylineEdgeStyle({
      stroke: orangeStroke,
      targetArrow: dummyCroppingArrow,
      sourceArrow: dummyCroppingArrow
    })
    const edgeStyleHighlight = new yfiles.view.EdgeStyleDecorationInstaller({
      edgeStyle,
      zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES
    })
    decorator.edgeDecorator.highlightDecorator.setImplementation(edgeStyleHighlight)

    // create a SearchHighlightIndicatorManager for highlighting search results
    searchIndicatorManager = new SearchHighlightIndicatorManager(graphComponent)
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
    const graphViewerInputMode = new yfiles.input.GraphViewerInputMode({
      toolTipItems: yfiles.graph.GraphItemTypes.LABEL_OWNER,
      clickableItems: yfiles.graph.GraphItemTypes.NODE,
      focusableItems: yfiles.graph.GraphItemTypes.NODE,
      selectableItems: yfiles.graph.GraphItemTypes.NONE,
      marqueeSelectableItems: yfiles.graph.GraphItemTypes.NONE
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
    graphViewerInputMode.itemHoverInputMode.hoverItems =
      yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.NODE
    // if there are other items (most importantly labels) in front of edges or nodes
    // they should be discarded, rather than be reported as "null"
    graphViewerInputMode.itemHoverInputMode.discardInvalidItems = false
    // whenever the currently hovered item changes call our method
    graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener(onHoveredItemChanged)

    // when the mouse hovers for a longer time over an item we may optionally display a
    // tooltip. Use this callback for querying the tooltip contents.
    graphViewerInputMode.addQueryItemToolTipListener(onQueryItemToolTip)
    // slightly offset the tooltip so that it does not interfere with the mouse
    graphViewerInputMode.mouseHoverInputMode.toolTipLocationOffset = new yfiles.geometry.Point(
      0,
      10
    )
    // we show the tooltip for a very long time...
    graphViewerInputMode.mouseHoverInputMode.duration = '10s'

    // if we click on an item we want to perform a custom action, so register a callback
    graphViewerInputMode.addItemClickedListener(onItemClicked)

    // also if someone clicked on an empty area we want to perform a custom group action
    graphViewerInputMode.clickInputMode.addClickedListener(onClickInputModeOnClicked)

    initializeContextMenu(graphViewerInputMode)

    graphComponent.inputMode = graphViewerInputMode
  }

  /**
   * Initialize the context menu.
   * @param {yfiles.input.GraphInputMode} inputMode
   */
  function initializeContextMenu(inputMode) {
    // we tell the input mode that we want to get context menus on nodes
    inputMode.contextMenuItems = yfiles.graph.GraphItemTypes.NODE

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

    // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
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
   * This method will be called whenever the mouse moves over a different item. We show a highlight indicator
   * to make it easier for the user to understand the graph's structure.
   * @param {object} sender
   * @param {yfiles.input.HoveredItemChangedEventArgs} hoveredItemChangedEventArgs
   */
  function onHoveredItemChanged(sender, hoveredItemChangedEventArgs) {
    // we use the highlight manager of the GraphComponent to highlight related items
    const manager = graphComponent.highlightIndicatorManager

    // first remove previous highlights
    manager.clearHighlights()
    // then see where we are hovering over, now
    const newItem = hoveredItemChangedEventArgs.item
    if (newItem !== null) {
      // we highlight the item itself
      manager.addHighlight(newItem)
      if (yfiles.graph.INode.isInstance(newItem)) {
        // and if it's a node, we highlight all adjacent edges, too
        graphComponent.graph.edgesAt(newItem).forEach(edge => {
          manager.addHighlight(edge)
        })
      } else if (yfiles.graph.IEdge.isInstance(newItem)) {
        // if it's an edge - we highlight the adjacent nodes
        manager.addHighlight(newItem.sourceNode)
        manager.addHighlight(newItem.targetNode)
      }
    }
  }

  /**
   * Helper function to populate the context menu.
   * @param {ContextMenu}contextMenu
   * @param {yfiles.input.PopulateItemContextMenuEventArgs} e
   */
  function populateContextMenu(contextMenu, e) {
    if (!yfiles.graph.INode.isInstance(e.item)) {
      return
    }
    const url = getUrlMapper().get(e.item)
    if (url !== null) {
      contextMenu.clearItems()
      // if the selected item is a node and has an URL mapped to it:
      // create a context menu item to open the link
      contextMenu.addMenuItem('Open External Link', evt => {
        window.open(url, '_blank')
      })
      // we don't want to be queried again if there are more items at this location
      e.showMenu = true
    }
  }

  /**
   * Called when the mouse has been clicked somewhere.
   * @param {object} sender
   * @param {yfiles.input.ClickEventArgs} args
   */
  function onClickInputModeOnClicked(sender, args) {
    // if the user pressed a modifier key during the click...
    if (
      !args.handled &&
      (args.modifiers & (yfiles.view.ModifierKeys.SHIFT | yfiles.view.ModifierKeys.CONTROL)) ===
        (yfiles.view.ModifierKeys.SHIFT | yfiles.view.ModifierKeys.CONTROL)
    ) {
      // we check if there was something at the provided location..
      if (
        graphComponent.graphModelManager.hitTester.enumerateHits(args.context, args.location)
          .size === 0
      ) {
        // an if there wasn't we try to exit the current group in case we are inside a folder node
        if (yfiles.input.ICommand.EXIT_GROUP.canExecute(null, graphComponent)) {
          yfiles.input.ICommand.EXIT_GROUP.execute(null, graphComponent)
          args.handled = true
        }
      }
    }
  }

  /**
   * Enable folding - change the GraphComponent's graph to a managed view
   * that provides the actual collapse/expand state.
   */
  function enableFolding() {
    // create the manager
    const foldingManager = new yfiles.graph.FoldingManager()
    // replace the displayed graph with a managed view
    graphComponent.graph = foldingManager.createFoldingView().graph
  }

  /**
   * If the currentItem property on GraphComponent's changes we adjust the details panel.
   * @param {object} sender
   * @param {yfiles.lang.PropertyChangedEventArgs} propertyChangedEventArgs
   */
  function onCurrentItemChanged(sender, propertyChangedEventArgs) {
    // clear the current display
    nodeInfo.innerHTML = 'Empty'
    nodeInfoDescription.innerHTML = 'Empty'
    nodeInfoUrl.innerHTML = 'None'

    const currentItem = graphComponent.currentItem
    if (yfiles.graph.INode.isInstance(currentItem)) {
      // for nodes display the label and the values of the mappers for description and URLs..
      const node = currentItem
      nodeInfo.innerHTML = node.labels.size > 0 ? node.labels.elementAt(0).text : 'Empty'
      const content = getDescriptionMapper().get(node)
      nodeInfoDescription.innerHTML = content !== null ? content : 'Empty'
      const url = getUrlMapper().get(node)
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
   * @param {object} sender
   * @param {yfiles.input.ItemClickedEventArgs.<yfiles.graph.IModelItem>} e
   */
  function onItemClicked(sender, e) {
    if (!e.handled && yfiles.graph.INode.isInstance(e.item)) {
      // we adjust the currentItem property
      graphComponent.currentItem = e.item
      // if the shift and control key had been pressed, we enter the group node if possible
      if (
        (graphComponent.lastMouseEvent.modifiers &
          (yfiles.view.ModifierKeys.SHIFT | yfiles.view.ModifierKeys.CONTROL)) ===
        (yfiles.view.ModifierKeys.SHIFT | yfiles.view.ModifierKeys.CONTROL)
      ) {
        if (yfiles.input.ICommand.ENTER_GROUP.canExecute(e.item, graphComponent)) {
          yfiles.input.ICommand.ENTER_GROUP.execute(e.item, graphComponent)
          e.handled = true
        }
      }
    }
  }

  /**
   * Callback that will determine the tooltip when the mouse hovers over a node.
   * @param {Object} sender
   * @param {yfiles.input.QueryItemToolTipEventArgs.<yfiles.model.IModelItem>} queryItemToolTipEventArgs
   */
  function onQueryItemToolTip(sender, queryItemToolTipEventArgs) {
    if (
      yfiles.graph.INode.isInstance(queryItemToolTipEventArgs.item) &&
      !queryItemToolTipEventArgs.handled
    ) {
      const node = queryItemToolTipEventArgs.item
      const descriptionMapper = getDescriptionMapper()
      const description = descriptionMapper !== null ? descriptionMapper.get(node) : null
      const toolTip =
        getToolTipMapper().get(node) !== null ? getToolTipMapper().get(node) : description
      if (toolTip !== null) {
        queryItemToolTipEventArgs.toolTip = toolTip
        queryItemToolTipEventArgs.handled = true
      }
    }
  }

  /**
   * Helper method that reads the currently selected graphml from the combobox.
   */
  function readSampleGraph() {
    // Disable navigation buttons while graph is loaded
    setUIDisabled(true)
    updateSearch('')

    // first derive the file name
    const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
    const fileName = `resources/${selectedItem}.graphml`
    // then load the graph
    app.readGraph(createGraphMLIOHandler(), graphComponent.graph, fileName).then(() => {
      // when done - fit the bounds
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
      // and update the graph description pane
      const desc = graphDescriptionMapper.get(graphComponent.graph.foldingView.manager.masterGraph)
      graphDescription.innerHTML = desc !== null ? desc : ''
      // re-enable navigation buttons
      setUIDisabled(false)
    })
  }

  /**
   * @return {yfiles.collections.IMapper.<yfiles.graph.INode,string>}
   */
  function getDescriptionMapper() {
    return graphComponent.graph.mapperRegistry.getMapper('Description')
  }

  /**
   * @return {yfiles.collections.IMapper.<yfiles.graph.INode,string>}
   */
  function getToolTipMapper() {
    return graphComponent.graph.mapperRegistry.getMapper('ToolTip')
  }

  /**
   * @return {yfiles.collections.IMapper.<yfiles.graph.INode,string>}
   */
  function getUrlMapper() {
    return graphComponent.graph.mapperRegistry.getMapper('Url')
  }

  /**
   * Helper method that creates and configures the GraphML parser.
   * @return {yfiles.graphml.GraphMLIOHandler}
   */
  function createGraphMLIOHandler() {
    const ioHandler = new yfiles.graphml.GraphMLIOHandler()
    // enable support for demo styles
    ioHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    // enable support for fast style implementations
    ioHandler.addXamlNamespaceMapping('http://www.yworks.com/yfilesHTML/demos/', FastCanvasStyles)
    // es6 classes need to be initialized once before de-/serialization
    new FastCanvasStyles.FastNodeStyle()
    new FastCanvasStyles.FastEdgeStyle()
    new FastCanvasStyles.FastLabelStyle()
    // we also want to populate the mappers for "Description", "ToolTip", and "Url"
    ioHandler.addRegistryInputMapper(
      yfiles.graph.INode.$class,
      yfiles.lang.String.$class,
      'Description'
    )
    ioHandler.addRegistryInputMapper(
      yfiles.graph.INode.$class,
      yfiles.lang.String.$class,
      'ToolTip'
    )
    ioHandler.addRegistryInputMapper(yfiles.graph.INode.$class, yfiles.lang.String.$class, 'Url')
    graphDescriptionMapper.clear()
    // as well as the description of the graph
    ioHandler.addInputMapper(
      yfiles.graph.IGraph.$class,
      yfiles.lang.String.$class,
      'GraphDescription',
      graphDescriptionMapper
    )
    return ioHandler
  }

  /**
   * Registers the commands to the toolbar elements.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    // called by the demo framework initially so that the button commands can be bound to actual commands and actions
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent, null)

    app.bindAction("button[data-command='PreviousFile']", onPreviousButtonClicked)
    app.bindAction("button[data-command='NextFile']", onNextButtonClicked)
    app.bindChangeListener("select[data-command='SelectedFileChanged']", readSampleGraph)
    searchBox.addEventListener('input', e => {
      updateSearch(e.target.value)
    })

    searchBox.addEventListener('keypress', e => {
      const key = e.which || e.keyCode
      if (key === 13) {
        if (matchingNodes.length > 0) {
          // determine the rectangle which contains the matching nodes
          let minX = Number.POSITIVE_INFINITY
          let maxX = Number.NEGATIVE_INFINITY
          let minY = Number.POSITIVE_INFINITY
          let maxY = Number.NEGATIVE_INFINITY

          matchingNodes.forEach(node => {
            const nodeLayout = node.layout
            minX = Math.min(minX, nodeLayout.x)
            maxX = Math.max(maxX, nodeLayout.x + nodeLayout.width)
            minY = Math.min(minY, nodeLayout.y)
            maxY = Math.max(maxY, nodeLayout.y + nodeLayout.height)
          })
          if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
            let rect = new yfiles.geometry.Rect(minX, minY, maxX - minX, maxY - minY)
            // enlarge it with some insets
            rect = rect.getEnlarged(new yfiles.geometry.Insets(20))
            // calculate the maximum possible zoom
            const componentWidth = graphComponent.size.width
            const componentHeight = graphComponent.size.height
            const maxPossibleZoom = Math.min(
              componentWidth / rect.width,
              componentHeight / rect.height
            )
            // zoom to this rectangle with maximum zoom 1.5
            const zoom = Math.min(maxPossibleZoom, 1.5)
            graphComponent.zoomToAnimated(
              new yfiles.geometry.Point(rect.centerX, rect.centerY),
              zoom
            )
          }
        } else {
          graphComponent.fitGraphBounds()
        }
      }
    })
  }

  /**
   * Updates the search results by using the given string.
   * @param {string} searchText
   */
  function updateSearch(searchText) {
    searchBox.value = searchText

    // we use the search highlight manager to highlight matching items
    const manager = searchIndicatorManager

    // first remove previous highlights
    manager.clearHighlights()
    matchingNodes = []
    if (searchText.trim() !== '') {
      graphComponent.graph.nodes.forEach(node => {
        if (matches(node, searchText)) {
          manager.addHighlight(node)
          matchingNodes.push(node)
        }
      })
    }
  }

  /**
   * Returns whether the given node is a match when searching for the given text.
   * @param {yfiles.graph.INode} node
   * @param {string} text
   * @return {boolean}
   */
  function matches(node, text) {
    const lowercaseText = text.toLowerCase()
    // in orgchart the icon property does not have to be matched
    const selectedSample = document.getElementById('graphChooserBox').selectedIndex
    if (
      node.tag &&
      Object.getOwnPropertyNames(node.tag).some(
        prop =>
          selectedSample === 'orgchart' &&
          prop !== 'icon' &&
          node.tag[prop] &&
          node.tag[prop]
            .toString()
            .toLowerCase()
            .indexOf(lowercaseText) !== -1
      )
    ) {
      return true
    }
    if (node.labels.some(label => label.text.toLowerCase().indexOf(lowercaseText) !== -1)) {
      return true
    }
    return false
  }

  /**
   * Enables loading the graph to GraphML.
   */
  function enableGraphML() {
    // create a new GraphMLSupport instance that handles save and load operations
    const gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      // configure to load and save to the file system
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
    })
    gs.graphMLIOHandler = createGraphMLIOHandler()
  }

  /**
   * Updates the elements of the UI's state and the input mode and checks whether the buttons should be enabled or not.
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
    // Linewrapping converter for orgchart
    const store = {}
    yfiles.styles.TemplateNodeStyle.CONVERTERS.orgchartconverters = store
    store.linebreakconverter = (value, firstline) => {
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

  /**
   * A {@link yfiles.view.HighlightIndicatorManager} implementation that uses a simple green outline for highlights.
   * @extends yfiles.view.HighlightIndicatorManager
   */
  class SearchHighlightIndicatorManager extends yfiles.view.HighlightIndicatorManager {
    /**
     * @param {yfiles.view.CanvasComponent} canvasComponent
     */
    constructor(canvasComponent) {
      super(canvasComponent)

      this.$nodeStyleHighlight = new yfiles.view.NodeStyleDecorationInstaller({
        nodeStyle: new yfiles.styles.ShapeNodeStyle({
          shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
          stroke: '3px limegreen',
          fill: null
        }),
        margins: 5,
        zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES
      })
    }

    /**
     * Callback used by install to retrieve the installer for a given item.
     * @return {yfiles.view.ICanvasObjectInstaller}
     */
    getInstaller() {
      return this.$nodeStyleHighlight
    }
  }

  // run the demo
  run()
})
