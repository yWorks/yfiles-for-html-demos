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
  'yfiles/view-component',
  'resources/demo-app',
  'resources/demo-styles',
  'MultiPageIGraphBuilder.js',
  'PageBoundsVisualCreator.js',
  'yfiles/view-graphml',
  'yfiles/view-layout-bridge',
  'yfiles/layout-multipage',
  'yfiles/layout-hierarchic',
  'yfiles/layout-orthogonal',
  'yfiles/layout-orthogonal-compact',
  'yfiles/layout-tree',
  'yfiles/layout-organic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  MultiPageIGraphBuilder,
  PageBoundsVisualCreator
) => {
  /**
   * This demo demonstrates how the result of a multi-page layout calculation
   * can be displayed in a graph component.
   * A multi-page layout splits a large graph into multiple pages with a fixed maximum width and height.
   * Each of these pages is displayed by a different graph.
   */
  function run() {
    // initialize both graph components
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    modelGraphComponent = new yfiles.view.GraphComponent('modelGraphComponent')

    // add the page bounds visual
    pageBoundsVisualCreator = new PageBoundsVisualCreator()
    graphComponent.backgroundGroup.addChild(
      pageBoundsVisualCreator,
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )

    registerCommands()
    initConverters()
    initializeCoreLayouts()
    initializeInputModes()
    loadModelGraph('Pop Artists')

    app.show(graphComponent)
  }

  /**
   * Shows the current page of the multi-page layout.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Shows the complete model graph.
   * @type {yfiles.view.GraphComponent}
   */
  let modelGraphComponent = null

  /**
   * The calculated page graphs.
   * @type {yfiles.graph.IGraph[]}
   */
  let viewGraphs = null

  /**
   * The currently selected page.
   * @type {number}
   */
  let pageNumber = 0

  /**
   * The visual creator for rendering the page bounds.
   * @type {PageBoundsVisualCreator}
   */
  let pageBoundsVisualCreator = null

  /**
   * A flag that prevents re-entrant layout calls.
   * @type {boolean}
   */
  let layouting = false

  /**
   * Starts the multi page layout calculation.
   */
  function runMultiPageLayout() {
    if (layouting) {
      // return if a layout is already running
      return
    }
    layouting = true

    // parse the pageWidth and pageHeight parameters
    const pageWidthTextBox = document.getElementById('pageWidthTextBox')
    let pageWidth = parseFloat(pageWidthTextBox.value)
    if (isNaN(pageWidth)) {
      pageWidth = 800
    }
    const pageHeightTextBox = document.getElementById('pageHeightTextBox')
    let pageHeight = parseFloat(pageHeightTextBox.value)
    if (isNaN(pageHeight)) {
      pageHeight = 800
    }

    // get the core layout
    const coreLayoutComboBox = document.getElementById('coreLayoutComboBox')
    const layoutIndex = coreLayoutComboBox.selectedIndex
    const coreLayout =
      layoutIndex > -1
        ? coreLayoutComboBox.options[layoutIndex].myValue
        : coreLayoutComboBox.options[0].myValue
    if (coreLayoutComboBox.value === 'Tree') {
      // configure CompactNodePlacer to respect the aspect ratio of the page
      coreLayout.defaultNodePlacer.aspectRatio = pageWidth / pageHeight
    }

    const createProxyReferenceNodes = document.getElementById('createProxyReferenceNodes')
    const createProxyNodes = createProxyReferenceNodes.checked
    const placeMultipleComponentsOnSinglePage = document.getElementById(
      'placeMultipleComponentsOnSinglePage'
    )
    const placeComponentsOnSinglePage = placeMultipleComponentsOnSinglePage.checked

    const multiPageLayout = new yfiles.multipage.MultiPageLayout(coreLayout)
    multiPageLayout.maximumPageSize = new yfiles.algorithms.YDimension(pageWidth, pageHeight)
    multiPageLayout.createProxyReferenceNodes = createProxyNodes
    multiPageLayout.multipleComponentsOnSinglePage = placeComponentsOnSinglePage
    multiPageLayout.additionalParentCount = Number.parseInt(
      document.getElementById('additionalParentCount').value
    )

    // a data provider for the node, edge, and label IDs:
    // this data provider returns the node/edge/label instances themselves
    const registry = modelGraphComponent.graph.mapperRegistry
    // assign the data providers for the element IDs
    registry.createDelegateMapper(
      yfiles.lang.Object.$class,
      yfiles.lang.Object.$class,
      yfiles.multipage.MultiPageLayout.NODE_ID_DP_KEY,
      key => key
    )
    registry.createDelegateMapper(
      yfiles.lang.Object.$class,
      yfiles.lang.Object.$class,
      yfiles.multipage.MultiPageLayout.EDGE_ID_DP_KEY,
      key => key
    )
    registry.createDelegateMapper(
      yfiles.lang.Object.$class,
      yfiles.lang.Object.$class,
      yfiles.multipage.MultiPageLayout.NODE_LABEL_ID_DP_KEY,
      key => key
    )
    registry.createDelegateMapper(
      yfiles.lang.Object.$class,
      yfiles.lang.Object.$class,
      yfiles.multipage.MultiPageLayout.EDGE_LABEL_ID_DP_KEY,
      key => key
    )

    setTimeout(() => {
      const adapter = new yfiles.layout.LayoutGraphAdapter(modelGraphComponent.graph)
      // multiPageLayout gets a list with the single page graphs
      const layout = multiPageLayout.calculateLayout(adapter.createCopiedLayoutGraph())
      applyLayoutResult(layout, pageWidth, pageHeight)
      layouting = false
    }, 50)
  }

  /**
   * Applies the result of the multi-page layout using a {@link MultiPageIGraphBuilder}.
   * @param {yfiles.multipage.MultiPageLayout} multiPageLayout
   * @param {number} pageWidth
   * @param {number} pageHeight
   */
  function applyLayoutResult(multiPageLayout, pageWidth, pageHeight) {
    // use the MultiPageGraphBuilder to create a list of IGraph instances that represent the single pages
    const builder = new MultiPageIGraphBuilder(multiPageLayout)
    builder.normalNodeDefaults.style = new yfiles.styles.TemplateNodeStyle('NormalNodeTemplate')
    builder.normalNodeDefaults.labels.style = yfiles.styles.VoidLabelStyle.INSTANCE
    builder.connectorNodeDefaults.style = new yfiles.styles.TemplateNodeStyle(
      'ConnectorNodeTemplate'
    )
    builder.connectorNodeDefaults.labels.style = yfiles.styles.VoidLabelStyle.INSTANCE
    builder.proxyNodeDefaults.style = new yfiles.styles.TemplateNodeStyle('ProxyNodeTemplate')
    builder.proxyNodeDefaults.labels.style = yfiles.styles.VoidLabelStyle.INSTANCE
    builder.proxyReferenceNodeDefaults.style = new yfiles.styles.TemplateNodeStyle(
      'ProxyReferenceNodeTemplate'
    )
    builder.proxyReferenceNodeDefaults.labels.style = yfiles.styles.VoidLabelStyle.INSTANCE
    const normalEdgeStyle = new DemoStyles.DemoEdgeStyle()
    normalEdgeStyle.showTargetArrows = false
    builder.normalEdgeDefaults.style = normalEdgeStyle
    const connectorEdgeStyle = new DemoStyles.DemoEdgeStyle()
    connectorEdgeStyle.showTargetArrows = false
    builder.connectorEdgeDefaults.style = connectorEdgeStyle
    const proxyEdgeStyle = new DemoStyles.DemoEdgeStyle()
    proxyEdgeStyle.showTargetArrows = false
    builder.proxyEdgeDefaults.style = proxyEdgeStyle
    builder.proxyReferenceEdgeDefaults.style = new DemoStyles.DemoEdgeStyle()

    // remove all data providers used for the layout
    const registry = modelGraphComponent.graph.mapperRegistry
    registry.removeMapper(yfiles.multipage.MultiPageLayout.NODE_ID_DP_KEY)
    registry.removeMapper(yfiles.multipage.MultiPageLayout.EDGE_ID_DP_KEY)
    registry.removeMapper(yfiles.multipage.MultiPageLayout.NODE_LABEL_ID_DP_KEY)
    registry.removeMapper(yfiles.multipage.MultiPageLayout.EDGE_LABEL_ID_DP_KEY)

    // create the graphs
    viewGraphs = builder.createViewGraphs()
    setPageNumber(0, null)

    // set the new page bounds
    pageBoundsVisualCreator.pageWidth = pageWidth
    pageBoundsVisualCreator.pageHeight = pageHeight

    document.getElementById('previousPage').disabled = true
    document.getElementById('nextPage').disabled = viewGraphs.length <= 1

    showLoadingIndicator(false)
  }

  /**
   * @param {number} newPageNumber
   * @param {yfiles.graph.INode} targetNode
   */
  function setPageNumber(newPageNumber, targetNode) {
    graphComponent.highlightIndicatorManager.clearHighlights()
    graphComponent.focusIndicatorManager.focusedItem = null

    if (viewGraphs.length > 0) {
      if (newPageNumber < 0) {
        newPageNumber = 0
      } else if (newPageNumber > viewGraphs.length - 1) {
        newPageNumber = viewGraphs.length - 1
      }
      pageNumber = newPageNumber

      const pageNumberTextBox = document.getElementById('pageNumberTextBox')
      pageNumberTextBox.value = (pageNumber + 1).toString()
      pageNumberTextBox.setAttribute('min', '1')
      pageNumberTextBox.setAttribute('max', `${viewGraphs.length}`)

      graphComponent.graph = viewGraphs[pageNumber]
      // update the content bounds
      graphComponent.updateContentRect()
      // set the page center
      pageBoundsVisualCreator.center = graphComponent.contentRect.center

      // place target node under mouse cursor
      if (targetNode !== null && graphComponent.graph.contains(targetNode)) {
        const targetCenter = targetNode.layout.center
        const mousePosition = graphComponent.lastMouseEvent.location
        const controlCenter = graphComponent.toWorldCoordinates(
          new yfiles.geometry.Point(
            graphComponent.size.width * 0.5,
            graphComponent.size.height * 0.5
          )
        )
        graphComponent.zoomTo(
          targetCenter.subtract(mousePosition.subtract(controlCenter)),
          graphComponent.zoom
        )
        graphComponent.highlightIndicatorManager.addHighlight(targetNode)
      } else {
        graphComponent.fitGraphBounds()
      }
    }

    document.getElementById('previousPage').disabled = !checkPageNumber(newPageNumber - 1)
    document.getElementById('nextPage').disabled = !checkPageNumber(newPageNumber + 1)
  }

  /**
   * "Jump" to a referencing node of a clicked auxiliary multi-page node.
   * @param {yfiles.graph.INode} viewNode The multi page node that has been clicked
   */
  function goToReferencingNode(viewNode) {
    // get the ID of the referencing node
    if (viewNode.tag && viewNode.tag.isReferenceNode) {
      const referencedNode = viewNode.tag.referencedNode
      if (referencedNode) {
        const targetPage = referencedNode.tag ? referencedNode.tag.pageNumber : -1
        if (checkPageNumber(targetPage)) {
          // open the page and center on the referencing node
          setPageNumber(targetPage, referencedNode)
        }
      }
    }
  }

  /**
   * Checks if the given page number is valid.
   * A valid page number lies between 0 and the number of pages.
   * @return {boolean}
   */
  function checkPageNumber(pageNo) {
    return !isNaN(pageNo) && viewGraphs && pageNo >= 0 && pageNo < viewGraphs.length
  }

  /**
   * Displays or hides the loading indicator.
   * @param {boolean} visible
   */
  function showLoadingIndicator(visible) {
    const loadingIndicator = document.getElementById('loadingIndicator')
    loadingIndicator.style.setProperty('display', visible ? 'block' : 'none', null)
  }

  /**
   * Registers the JavaScript commands for the GUI elements, typically the
   * tool bar buttons, during the creation of this application.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindAction("button[data-command='PreviousPage']", () => {
      if (checkPageNumber(pageNumber - 1)) {
        setPageNumber(pageNumber - 1, null)
      }
    })
    app.bindAction("button[data-command='NextPage']", () => {
      if (checkPageNumber(pageNumber + 1)) {
        setPageNumber(pageNumber + 1, null)
      }
    })
    app.bindChangeListener("input[data-command='PageNumberTextBox']", page => {
      const pageNo = parseInt(page) - 1
      if (!isNaN(pageNo) && checkPageNumber(pageNo)) {
        setPageNumber(pageNo, null)
      }
    })

    app.bindChangeListener("select[data-command='SampleComboBox']", value => {
      if (value === 'yFiles Layout Namespaces') {
        document.getElementById('coreLayoutComboBox').value = 'Tree'
      }
      loadModelGraph(value)
    })

    app.bindAction("button[data-command='DoLayout']", () => {
      showLoadingIndicator(true)
      runMultiPageLayout()
    })
  }

  /**
   * Creates the core layout algorithms and populates the layouts box.
   */
  function initializeCoreLayouts() {
    const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.considerNodeLabels = true
    hierarchicLayout.integratedEdgeLabeling = true
    hierarchicLayout.orthogonalRouting = true

    const organicLayout = new yfiles.organic.OrganicLayout()
    organicLayout.minimumNodeDistance = 10
    organicLayout.deterministic = true

    const treeLayout = new yfiles.tree.TreeLayout()
    treeLayout.defaultNodePlacer = new yfiles.tree.CompactNodePlacer()
    treeLayout.prependStage(new yfiles.tree.TreeReductionStage())

    const additionalParentCount = document.getElementById('additionalParentCount')
    const coreLayoutComboBox = document.getElementById('coreLayoutComboBox')
    addOption(coreLayoutComboBox, 'Hierarchic', hierarchicLayout)
    addOption(coreLayoutComboBox, 'Circular', new yfiles.circular.CircularLayout())
    addOption(
      coreLayoutComboBox,
      'Compact Orthogonal',
      new yfiles.orthogonal.CompactOrthogonalLayout()
    )
    addOption(coreLayoutComboBox, 'Organic', organicLayout)
    addOption(coreLayoutComboBox, 'Orthogonal', new yfiles.orthogonal.OrthogonalLayout())
    addOption(coreLayoutComboBox, 'Tree', treeLayout)
    coreLayoutComboBox.selectedIndex = 0
    coreLayoutComboBox.addEventListener(
      'change',
      () => {
        additionalParentCount.disabled = coreLayoutComboBox.value !== 'Tree'
      },
      app.passiveSupported ? { passive: false } : false
    )
  }

  /**
   * Adds a new option to the given combo-box
   * @param {HTMLElement} comboBox The combo-box to extend.
   * @param {String} text The text that describes the option.
   * @param {Object} value The value object for this option.
   */
  function addOption(comboBox, text, value) {
    const option = document.createElement('option')
    option.text = text
    option.myValue = value // use myValue because value would be converted to a string
    comboBox.add(option)
  }

  /**
   * Initializes the input modes for both graph controls.
   */
  function initializeInputModes() {
    // create the input mode and disable selection and focus
    const inputMode = new yfiles.input.GraphViewerInputMode({
      clickableItems: yfiles.graph.GraphItemTypes.NODE,
      selectableItems: yfiles.graph.GraphItemTypes.NONE,
      focusableItems: yfiles.graph.GraphItemTypes.NONE
    })

    // highlight nodes on hover
    inputMode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.NODE
    inputMode.itemHoverInputMode.addHoveredItemChangedListener(onHoveredItemChanged)

    // handle clicks on nodes
    inputMode.addItemClickedListener((sender, event) => {
      goToReferencingNode(event.item)
    })
    graphComponent.inputMode = inputMode

    // create the input mode for the model graph and disable selection and focus
    const modelInputMode = new yfiles.input.GraphViewerInputMode({
      clickableItems: yfiles.graph.GraphItemTypes.NONE,
      selectableItems: yfiles.graph.GraphItemTypes.NONE,
      focusableItems: yfiles.graph.GraphItemTypes.NONE
    })
    // fit bounds on double-click
    modelInputMode.clickInputMode.addDoubleClickedListener((sender, event) => {
      modelGraphComponent.fitGraphBounds()
    })
    modelGraphComponent.inputMode = modelInputMode
  }

  /**
   * Add/Remove the hovered item to the highlight manager.
   * @param {object} sender
   * @param {yfiles.input.HoveredItemChangedEventArgs} args
   */
  function onHoveredItemChanged(sender, args) {
    // we use the highlight manager to highlight hovered items
    const manager = graphComponent.highlightIndicatorManager
    if (args.oldItem) {
      manager.removeHighlight(args.oldItem)
    }
    if (args.item) {
      manager.addHighlight(args.item)
    }
  }

  /**
   * Initializes the converters for the node style.
   */
  function initConverters() {
    // create the converters needed for the node templates
    const store = {}
    yfiles.styles.TemplateNodeStyle.CONVERTERS.multipage = store

    /**
     * Converts a node into the text of the first node label.
     */
    store.labelconverter = (value, parameter) => {
      const node = yfiles.graph.INode.isInstance(value) ? value : null
      return node && node.labels.size > 0 ? node.labels.first().text : ''
    }

    /**
     * Converts a width value into a 'translate' transformation to the node center.
     */
    // eslint-disable-next-line no-confusing-arrow
    store.transformconverter = (value, parameter) =>
      !isNaN(value) ? `translate(${(value * 0.5) | 0} 15)` : ''
  }

  /**
   * Loads the model graph and applies an initial multi-page layout.
   */
  function loadModelGraph(graphId) {
    // show a notification because the multi-page layout takes some time
    showLoadingIndicator(true)

    const filename =
      graphId === 'Pop Artists'
        ? 'resources/pop-artists-small.graphml'
        : 'resources/yfiles-layout-namespaces.graphml'

    const graphMLIOHandler = new yfiles.graphml.GraphMLIOHandler()
    graphMLIOHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    app.readGraph(graphMLIOHandler, modelGraphComponent.graph, filename).then(() => {
      // fit model graph to the component
      modelGraphComponent.fitGraphBounds()

      // fit the graph to the component
      graphComponent.fitGraphBounds()

      // calculate the multi-page layout
      runMultiPageLayout()
    })
  }

  run()
})
