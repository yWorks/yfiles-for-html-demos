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
  CircularLayout,
  CompactNodePlacer,
  CompactOrthogonalLayout,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  HierarchicLayout,
  HoveredItemChangedEventArgs,
  ICanvasObjectDescriptor,
  ICommand,
  IEdge,
  IGraph,
  ILabel,
  ILayoutCallback,
  INode,
  LayoutGraphAdapter,
  License,
  MultiPageLayout,
  MultiPageLayoutData,
  MultiPageLayoutResult,
  OrganicLayout,
  OrthogonalLayout,
  Point,
  TemplateNodeStyle,
  TreeLayout,
  TreeReductionStage,
  VoidLabelStyle,
  YDimension
} from 'yfiles'

import DemoStyles, { DemoEdgeStyle, DemoSerializationListener } from '../../resources/demo-styles'
import {
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  readGraph,
  showApp
} from '../../resources/demo-app'
import { passiveSupported } from '../../utils/Workarounds'
import loadJson from '../../resources/load-json'
import MultiPageIGraphBuilder from './MultiPageIGraphBuilder'
import PageBoundsVisualCreator from './PageBoundsVisualCreator'

/**
 * This demo demonstrates how the result of a multi-page layout calculation
 * can be displayed in a graph component.
 * A multi-page layout splits a large graph into multiple pages with a fixed maximum width and height.
 * Each of these pages is displayed by a different graph.
 */
function run(licenseData: any): void {
  License.value = licenseData
  // initialize both graph components
  graphComponent = new GraphComponent('graphComponent')
  modelGraphComponent = new GraphComponent('modelGraphComponent')

  registerCommands()
  initConverters()
  initializeCoreLayouts()
  initializeInputModes()
  loadModelGraph('Pop Artists')

  showApp(graphComponent)
}

/**
 * Shows the current page of the multi-page layout.
 */
let graphComponent: GraphComponent

/**
 * Shows the complete model graph.
 */
let modelGraphComponent: GraphComponent

/**
 * The calculated page graphs.
 */
let viewGraphs: IGraph[]

/**
 * The currently selected page.
 */
let pageNumber = 0

/**
 * The visual creator for rendering the page bounds.
 */
let pageBoundsVisualCreator: PageBoundsVisualCreator | null

/**
 * A flag that prevents re-entrant layout calls.
 */
let layouting = false

/**
 * Starts the multi page layout calculation.
 */
function runMultiPageLayout(): void {
  if (layouting) {
    // return if a layout is already running
    return
  }
  layouting = true

  // parse the pageWidth and pageHeight parameters
  const pageWidthTextBox = document.getElementById('pageWidthTextBox') as HTMLInputElement
  let pageWidth: number = parseFloat(pageWidthTextBox.value)
  if (isNaN(pageWidth)) {
    pageWidth = 800
  }
  const pageHeightTextBox = document.getElementById('pageHeightTextBox') as HTMLInputElement
  let pageHeight: number = parseFloat(pageHeightTextBox.value)
  if (isNaN(pageHeight)) {
    pageHeight = 800
  }

  // get the core layout
  const coreLayoutComboBox = document.getElementById('coreLayoutComboBox') as HTMLSelectElement
  const layoutIndex = coreLayoutComboBox.selectedIndex
  const coreLayout = (coreLayoutComboBox.options[layoutIndex > -1 ? layoutIndex : 0] as any).myValue
  if (coreLayoutComboBox.value === 'Tree') {
    // configure CompactNodePlacer to respect the aspect ratio of the page
    coreLayout.defaultNodePlacer.aspectRatio = pageWidth / pageHeight
  }

  const createProxyReferenceNodes = document.getElementById(
    'createProxyReferenceNodes'
  ) as HTMLInputElement
  const createProxyNodes = createProxyReferenceNodes.checked
  const placeMultipleComponentsOnSinglePage = document.getElementById(
    'placeMultipleComponentsOnSinglePage'
  ) as HTMLInputElement
  const placeComponentsOnSinglePage = placeMultipleComponentsOnSinglePage.checked

  const multiPageLayout = new MultiPageLayout({
    coreLayout,
    maximumPageSize: new YDimension(pageWidth, pageHeight),
    createProxyReferenceNodes: createProxyNodes,
    multipleComponentsOnSinglePage: placeComponentsOnSinglePage,
    additionalParentCount: Number.parseInt(
      (document.getElementById('additionalParentCount') as HTMLInputElement).value
    ),
    layoutCallback: ILayoutCallback.create((result: MultiPageLayoutResult) => {
      applyLayoutResult(result, pageWidth, pageHeight)
    })
  })

  const multiPageLayoutData = new MultiPageLayoutData({
    nodeIds: (key: INode) => key,
    edgeIds: (key: IEdge) => key,
    nodeLabelIds: (key: ILabel) => key,
    edgeLabelIds: (key: ILabel) => key
  })

  setTimeout(() => {
    const adapter = new LayoutGraphAdapter(modelGraphComponent.graph)
    // Note that unlike other layouts, MultiPageLayout does not alter the input graph.
    // Instead, the result is available via the function set to the 'layoutCallback' property.
    adapter.applyLayout(multiPageLayout, multiPageLayoutData)
    layouting = false
  }, 0)
}

/**
 * Applies the result of the multi-page layout using a {@link MultiPageIGraphBuilder}.
 */
function applyLayoutResult(
  multiPageLayoutResult: MultiPageLayoutResult,
  pageWidth: number,
  pageHeight: number
): void {
  // use the MultiPageGraphBuilder to create a list of IGraph instances that represent the single pages
  const builder = new MultiPageIGraphBuilder(multiPageLayoutResult)
  builder.normalNodeDefaults.style = new TemplateNodeStyle('NormalNodeTemplate')
  builder.normalNodeDefaults.labels.style = VoidLabelStyle.INSTANCE
  builder.connectorNodeDefaults.style = new TemplateNodeStyle('ConnectorNodeTemplate')
  builder.connectorNodeDefaults.labels.style = VoidLabelStyle.INSTANCE
  builder.proxyNodeDefaults.style = new TemplateNodeStyle('ProxyNodeTemplate')
  builder.proxyNodeDefaults.labels.style = VoidLabelStyle.INSTANCE
  builder.proxyReferenceNodeDefaults.style = new TemplateNodeStyle('ProxyReferenceNodeTemplate')
  builder.proxyReferenceNodeDefaults.labels.style = VoidLabelStyle.INSTANCE
  const normalEdgeStyle = new DemoEdgeStyle()
  normalEdgeStyle.showTargetArrows = false
  builder.normalEdgeDefaults.style = normalEdgeStyle
  const connectorEdgeStyle = new DemoEdgeStyle()
  connectorEdgeStyle.showTargetArrows = false
  builder.connectorEdgeDefaults.style = connectorEdgeStyle
  const proxyEdgeStyle = new DemoEdgeStyle()
  proxyEdgeStyle.showTargetArrows = false
  builder.proxyEdgeDefaults.style = proxyEdgeStyle
  builder.proxyReferenceEdgeDefaults.style = new DemoEdgeStyle()

  // create the graphs
  viewGraphs = builder.createViewGraphs()
  setPageNumber(0)

  if (pageBoundsVisualCreator != null) {
    pageBoundsVisualCreator.pageWidth = pageWidth
    pageBoundsVisualCreator.pageHeight = pageHeight
  }

  ;(document.getElementById('previousPage') as HTMLInputElement).disabled = true
  ;(document.getElementById('nextPage') as HTMLInputElement).disabled = viewGraphs.length <= 1

  showLoadingIndicator(false)
}

function setPageNumber(newPageNumber: number, targetNode: INode | null = null): void {
  graphComponent.highlightIndicatorManager.clearHighlights()
  graphComponent.focusIndicatorManager.focusedItem = null

  if (viewGraphs.length <= 0) {
    ;(document.getElementById('previousPage') as HTMLInputElement).disabled = true
    ;(document.getElementById('nextPage') as HTMLInputElement).disabled = true
    return
  }

  pageNumber =
    newPageNumber < 0
      ? 0
      : newPageNumber > viewGraphs.length - 1
      ? viewGraphs.length - 1
      : newPageNumber

  const pageNumberTextBox = document.getElementById('pageNumberTextBox') as HTMLInputElement
  pageNumberTextBox.value = (pageNumber + 1).toString()
  pageNumberTextBox.setAttribute('min', '1')
  pageNumberTextBox.setAttribute('max', `${viewGraphs.length}`)

  graphComponent.graph = viewGraphs[pageNumber]
  graphComponent.updateContentRect()

  if (pageBoundsVisualCreator == null) {
    pageBoundsVisualCreator = new PageBoundsVisualCreator()
    graphComponent.backgroundGroup.addChild(
      pageBoundsVisualCreator,
      ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
  }
  pageBoundsVisualCreator.center = graphComponent.contentRect.center

  // place target node under mouse cursor
  if (targetNode !== null && graphComponent.graph.contains(targetNode)) {
    const targetCenter = targetNode.layout.center
    const mousePosition = graphComponent.lastMouseEvent.location
    const controlCenter = graphComponent.toWorldCoordinates(
      new Point(graphComponent.size.width * 0.5, graphComponent.size.height * 0.5)
    )
    graphComponent.zoomTo(
      targetCenter.subtract(mousePosition.subtract(controlCenter)),
      graphComponent.zoom
    )
    graphComponent.highlightIndicatorManager.addHighlight(targetNode)
  } else {
    graphComponent.fitGraphBounds()
  }

  ;(document.getElementById('previousPage') as HTMLInputElement).disabled = !checkPageNumber(
    pageNumber - 1
  )
  ;(document.getElementById('nextPage') as HTMLInputElement).disabled = !checkPageNumber(
    pageNumber + 1
  )
}

/**
 * "Jump" to a referencing node of a clicked auxiliary multi-page node.
 * @param viewNode The multi page node that has been clicked
 */
function goToReferencingNode(viewNode: INode) {
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
 */
function checkPageNumber(pageNo: any): boolean {
  return !isNaN(pageNo) && viewGraphs && pageNo >= 0 && pageNo < viewGraphs.length
}

/**
 * Displays or hides the loading indicator.
 */
function showLoadingIndicator(visible: boolean): void {
  const loadingIndicator = document.getElementById('loadingIndicator') as HTMLDivElement
  loadingIndicator.style.setProperty('display', visible ? 'block' : 'none', undefined)
}

/**
 * Registers the JavaScript commands for the GUI elements, typically the
 * tool bar buttons, during the creation of this application.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='PreviousPage']", () => {
    if (checkPageNumber(pageNumber - 1)) {
      setPageNumber(pageNumber - 1)
    }
  })
  bindAction("button[data-command='NextPage']", () => {
    if (checkPageNumber(pageNumber + 1)) {
      setPageNumber(pageNumber + 1)
    }
  })
  bindChangeListener("input[data-command='PageNumberTextBox']", page => {
    const pageNo = parseInt(page) - 1
    if (!isNaN(pageNo) && checkPageNumber(pageNo)) {
      setPageNumber(pageNo)
    }
  })

  bindChangeListener("select[data-command='SampleComboBox']", value => {
    if (value === 'yFiles Layout Namespaces') {
      ;(document.getElementById('coreLayoutComboBox') as HTMLSelectElement).value = 'Tree'
    }
    loadModelGraph(value)
  })

  bindAction("button[data-command='DoLayout']", () => {
    showLoadingIndicator(true)
    runMultiPageLayout()
  })
}

/**
 * Creates the core layout algorithms and populates the layouts box.
 */
function initializeCoreLayouts(): void {
  const hierarchicLayout = new HierarchicLayout({
    considerNodeLabels: true,
    integratedEdgeLabeling: true,
    orthogonalRouting: true
  })

  const organicLayout = new OrganicLayout({
    minimumNodeDistance: 10,
    deterministic: true
  })

  const treeLayout = new TreeLayout({
    defaultNodePlacer: new CompactNodePlacer()
  })
  treeLayout.prependStage(new TreeReductionStage())

  const additionalParentCount = document.getElementById('additionalParentCount') as HTMLInputElement
  const coreLayoutComboBox = document.getElementById('coreLayoutComboBox') as HTMLSelectElement
  addOption(coreLayoutComboBox, 'Hierarchic', hierarchicLayout)
  addOption(coreLayoutComboBox, 'Circular', new CircularLayout())
  addOption(coreLayoutComboBox, 'Compact Orthogonal', new CompactOrthogonalLayout())
  addOption(coreLayoutComboBox, 'Organic', organicLayout)
  addOption(coreLayoutComboBox, 'Orthogonal', new OrthogonalLayout())
  addOption(coreLayoutComboBox, 'Tree', treeLayout)
  coreLayoutComboBox.selectedIndex = 0
  coreLayoutComboBox.addEventListener(
    'change',
    () => {
      additionalParentCount.disabled = coreLayoutComboBox.value !== 'Tree'
    },
    passiveSupported ? { passive: false } : false
  )
}

/**
 * Adds a new option to the given combo-box
 * @param comboBox The combo-box to extend.
 * @param text The text that describes the option.
 * @param value The value object for this option.
 */
function addOption(comboBox: HTMLSelectElement, text: string, value: any): void {
  const option = document.createElement('option')
  option.text = text
  ;(option as any).myValue = value // use myValue because value would be converted to a string
  comboBox.add(option)
}

/**
 * Initializes the input modes for both graph controls.
 */
function initializeInputModes(): void {
  // create the input mode and disable selection and focus
  const inputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE,
    focusableItems: GraphItemTypes.NONE
  })

  // highlight nodes on hover
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  inputMode.itemHoverInputMode.addHoveredItemChangedListener(onHoveredItemChanged)

  // handle clicks on nodes
  inputMode.addItemClickedListener((sender, event) => {
    goToReferencingNode(event.item as INode)
  })
  graphComponent.inputMode = inputMode

  // create the input mode for the model graph and disable selection and focus
  const modelInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NONE,
    selectableItems: GraphItemTypes.NONE,
    focusableItems: GraphItemTypes.NONE
  })
  // fit bounds on double-click
  modelInputMode.clickInputMode.addDoubleClickedListener((sender, args) => {
    modelGraphComponent.fitGraphBounds()
  })
  modelGraphComponent.inputMode = modelInputMode
}

/**
 * Add/Remove the hovered item to the highlight manager.
 */
function onHoveredItemChanged(sender: object, args: HoveredItemChangedEventArgs): void {
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
function initConverters(): void {
  // create the converters needed for the node templates
  const store: any = {}
  TemplateNodeStyle.CONVERTERS.multipage = store

  /**
   * Converts a node into the text of the first node label.
   */
  store.labelConverter = (value: any, parameter: any): string => {
    const node = value instanceof INode ? value : null
    return node && node.labels.size > 0 ? node.labels.first().text : ''
  }

  /**
   * Converts a width value into a 'translate' transformation to the node center.
   */
  // eslint-disable-next-line no-confusing-arrow
  store.transformConverter = (value: any, parameter: any): string =>
    !isNaN(value) ? `translate(${(value * 0.5) | 0} 15)` : ''
}

/**
 * Loads the model graph and applies an initial multi-page layout.
 */
async function loadModelGraph(graphId: any) {
  // show a notification because the multi-page layout takes some time
  showLoadingIndicator(true)

  const filename =
    graphId === 'Pop Artists'
      ? 'resources/pop-artists-small.graphml'
      : 'resources/yfiles-layout-namespaces.graphml'

  const graphMLIOHandler = new GraphMLIOHandler()

  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)
  await readGraph(graphMLIOHandler, modelGraphComponent.graph, filename)
  // fit model graph to the component
  modelGraphComponent.fitGraphBounds()

  // fit the graph to the component
  graphComponent.fitGraphBounds()

  // calculate the multi-page layout
  runMultiPageLayout()
}

loadJson().then(checkLicense).then(run)
