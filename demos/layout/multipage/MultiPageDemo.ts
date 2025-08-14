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
  CircularLayout,
  CompactSubtreePlacer,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  HierarchicalLayout,
  HoveredItemChangedEventArgs,
  IGraph,
  ILabel,
  INode,
  LayoutGraphAdapter,
  License,
  MultiPageLayout,
  MultiPageLayoutData,
  MultiPageLayoutResult,
  OrganicLayout,
  OrthogonalLayout,
  Point,
  Size,
  TreeLayout
} from '@yfiles/yfiles'

import {
  createDemoEdgeStyle,
  createDemoNodeLabelStyle,
  createDemoNodeStyle,
  initDemoStyles
} from '@yfiles/demo-resources/demo-styles'
import { MultiPageIGraphBuilder } from './MultiPageIGraphBuilder'
import { PageBoundsVisualCreator } from './PageBoundsVisualCreator'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading, showLoadingIndicator } from '@yfiles/demo-resources/demo-page'

/**
 * This demo demonstrates how the result of a multi-page layout calculation
 * can be displayed in a graph component.
 * A multi-page layout splits a large graph into multiple pages with a fixed maximum width and height.
 * Each of these pages is displayed by a different graph.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize both graph components
  graphComponent = new GraphComponent('graphComponent')
  modelGraphComponent = new GraphComponent('modelGraphComponent')
  initDemoStyles(modelGraphComponent.graph, { theme: 'demo-palette-21' })

  initializeUI()
  initializeCoreLayouts()
  initializeInputModes()
  await loadModelGraph('Pop Artists')
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
  const pageWidthTextBox = document.querySelector<HTMLInputElement>('#pageWidthTextBox')!
  let pageWidth: number = parseFloat(pageWidthTextBox.value)
  if (Number.isNaN(pageWidth)) {
    pageWidth = 800
  }
  const pageHeightTextBox = document.querySelector<HTMLInputElement>('#pageHeightTextBox')!
  let pageHeight: number = parseFloat(pageHeightTextBox.value)
  if (Number.isNaN(pageHeight)) {
    pageHeight = 800
  }

  // get the core layout
  const coreLayoutComboBox = document.querySelector<HTMLSelectElement>('#coreLayoutComboBox')!
  const layoutIndex = coreLayoutComboBox.selectedIndex
  const coreLayout = (coreLayoutComboBox.options[layoutIndex > -1 ? layoutIndex : 0] as any).myValue
  if (coreLayoutComboBox.value === 'Tree') {
    // configure CompactSubtreePlacer to respect the aspect ratio of the page
    coreLayout.defaultSubtreePlacer.aspectRatio = pageWidth / pageHeight
  }

  const createProxyReferenceNodes = document.querySelector<HTMLInputElement>(
    '#createProxyReferenceNodes'
  )!
  const createProxyNodes = createProxyReferenceNodes.checked
  const placeMultipleComponentsOnSinglePage = document.querySelector<HTMLInputElement>(
    '#placeMultipleComponentsOnSinglePage'
  )!
  const placeComponentsOnSinglePage = placeMultipleComponentsOnSinglePage.checked

  const multiPageLayout = new MultiPageLayout({
    coreLayout,
    maximumPageSize: new Size(pageWidth, pageHeight),
    useProxyReferenceNodes: createProxyNodes,
    multipleComponentsOnSinglePage: placeComponentsOnSinglePage,
    additionalParentCount: Number.parseInt(
      document.querySelector<HTMLInputElement>('#additionalParentCount')!.value
    ),
    layoutCallback: async (result: MultiPageLayoutResult) => {
      await applyLayoutResult(result, pageWidth, pageHeight)
    }
  })

  const multiPageLayoutData = new MultiPageLayoutData()

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
async function applyLayoutResult(
  multiPageLayoutResult: MultiPageLayoutResult,
  pageWidth: number,
  pageHeight: number
): Promise<void> {
  // use the MultiPageGraphBuilder to create a list of IGraph instances that represent the single pages
  const builder = new MultiPageIGraphBuilder(multiPageLayoutResult)
  builder.normalNodeDefaults.style = createDemoNodeStyle('demo-palette-21')
  builder.normalNodeDefaults.labels.style = createDemoNodeLabelStyle('demo-palette-21')
  builder.connectorNodeDefaults.style = createDemoNodeStyle('demo-palette-23')
  builder.connectorNodeDefaults.labels.style = createDemoNodeLabelStyle('demo-palette-23')
  builder.proxyNodeDefaults.style = createDemoNodeStyle('demo-palette-25')
  builder.proxyNodeDefaults.labels.style = createDemoNodeLabelStyle('demo-palette-25')
  builder.proxyReferenceNodeDefaults.style = createDemoNodeStyle('demo-palette-14')
  builder.proxyReferenceNodeDefaults.labels.style = createDemoNodeLabelStyle('demo-palette-14')
  builder.normalEdgeDefaults.style = createDemoEdgeStyle({
    colorSetName: 'demo-palette-21',
    showTargetArrow: false
  })
  builder.connectorEdgeDefaults.style = createDemoEdgeStyle({
    colorSetName: 'demo-palette-23',
    showTargetArrow: false
  })
  builder.proxyEdgeDefaults.style = createDemoEdgeStyle({
    colorSetName: 'demo-palette-25',
    showTargetArrow: false
  })
  builder.proxyReferenceEdgeDefaults.style = createDemoEdgeStyle({
    colorSetName: 'demo-palette-14'
  })

  // create the graphs
  viewGraphs = builder.createViewGraphs()
  setPageNumber(0)

  if (pageBoundsVisualCreator != null) {
    pageBoundsVisualCreator.pageWidth = pageWidth
    pageBoundsVisualCreator.pageHeight = pageHeight
  }

  document.querySelector<HTMLButtonElement>('#previous-page')!.disabled = true
  document.querySelector<HTMLButtonElement>('#next-page')!.disabled = viewGraphs.length <= 1

  await showLoadingIndicator(false)
}

function setPageNumber(newPageNumber: number, targetNode: INode | null = null): void {
  graphComponent.highlights.clear()
  graphComponent.focusIndicatorManager.focusedItem = null

  if (viewGraphs.length <= 0) {
    document.querySelector<HTMLButtonElement>('#previous-page')!.disabled = true
    document.querySelector<HTMLButtonElement>('#next-page')!.disabled = true
    return
  }

  pageNumber =
    newPageNumber < 0
      ? 0
      : newPageNumber > viewGraphs.length - 1
        ? viewGraphs.length - 1
        : newPageNumber

  const pageNumberTextBox = document.querySelector<HTMLInputElement>('#page-number-text-box')!
  pageNumberTextBox.value = (pageNumber + 1).toString()
  pageNumberTextBox.setAttribute('min', '1')
  pageNumberTextBox.setAttribute('max', `${viewGraphs.length}`)

  graphComponent.graph = viewGraphs[pageNumber]
  graphComponent.updateContentBounds()

  if (pageBoundsVisualCreator == null) {
    pageBoundsVisualCreator = new PageBoundsVisualCreator()
    graphComponent.renderTree.createElement(
      graphComponent.renderTree.backgroundGroup,
      pageBoundsVisualCreator
    )
  }
  pageBoundsVisualCreator.center = graphComponent.contentBounds.center

  // place target node under mouse cursor
  if (targetNode !== null && graphComponent.graph.contains(targetNode)) {
    const targetCenter = targetNode.layout.center
    const mousePosition = graphComponent.lastInputEvent.location
    const controlCenter = graphComponent.viewToWorldCoordinates(
      new Point(graphComponent.size.width * 0.5, graphComponent.size.height * 0.5)
    )
    graphComponent.zoomTo(
      graphComponent.zoom,
      targetCenter.subtract(mousePosition.subtract(controlCenter))
    )
    graphComponent.highlights.add(targetNode)
  } else {
    void graphComponent.fitGraphBounds()
  }

  document.querySelector<HTMLButtonElement>('#previous-page')!.disabled = !checkPageNumber(
    pageNumber - 1
  )
  document.querySelector<HTMLButtonElement>('#next-page')!.disabled = !checkPageNumber(
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
  return !Number.isNaN(pageNo) && viewGraphs && pageNo >= 0 && pageNo < viewGraphs.length
}

/**
 * Registers the actions for the GUI elements, typically the
 * toolbar buttons, during the creation of this application.
 */
function initializeUI(): void {
  document.querySelector<HTMLButtonElement>('#previous-page')!.addEventListener('click', () => {
    if (checkPageNumber(pageNumber - 1)) {
      setPageNumber(pageNumber - 1)
    }
  })
  document.querySelector<HTMLButtonElement>('#next-page')!.addEventListener('click', () => {
    if (checkPageNumber(pageNumber + 1)) {
      setPageNumber(pageNumber + 1)
    }
  })
  document
    .querySelector<HTMLInputElement>('#page-number-text-box')!
    .addEventListener('change', (evt) => {
      const page = (evt.target as HTMLInputElement).value
      const pageNo = parseInt(page as string) - 1
      if (!Number.isNaN(pageNo) && checkPageNumber(pageNo)) {
        setPageNumber(pageNo)
      }
    })

  document.querySelector<HTMLSelectElement>('#samples')!.addEventListener('change', async (evt) => {
    const value = (evt.target as HTMLSelectElement).value
    if (value === 'yFiles Layout Namespaces') {
      document.querySelector<HTMLSelectElement>('#coreLayoutComboBox')!.value = 'Tree'
    }
    await loadModelGraph(value)
  })

  document
    .querySelector<HTMLButtonElement>('#apply-layout')!
    .addEventListener('click', async () => {
      await showLoadingIndicator(true)
      runMultiPageLayout()
    })
}

/**
 * Creates the core layout algorithms and populates the layouts box.
 */
function initializeCoreLayouts(): void {
  const hierarchicalLayout = new HierarchicalLayout()

  const organicLayout = new OrganicLayout({ defaultMinimumNodeDistance: 10, deterministic: true })

  const treeLayout = new TreeLayout({ defaultSubtreePlacer: new CompactSubtreePlacer() })

  const additionalParentCount = document.querySelector<HTMLInputElement>('#additionalParentCount')!
  const coreLayoutComboBox = document.querySelector<HTMLSelectElement>('#coreLayoutComboBox')!
  addOption(coreLayoutComboBox, 'Hierarchical', hierarchicalLayout)
  addOption(coreLayoutComboBox, 'Circular', new CircularLayout())
  addOption(coreLayoutComboBox, 'Organic', organicLayout)
  addOption(coreLayoutComboBox, 'Orthogonal', new OrthogonalLayout())
  addOption(coreLayoutComboBox, 'Tree', treeLayout)
  coreLayoutComboBox.selectedIndex = 0
  coreLayoutComboBox.addEventListener(
    'change',
    () => {
      additionalParentCount.disabled = coreLayoutComboBox.value !== 'Tree'
    },
    { passive: false }
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
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.LABEL
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', onHoveredItemChanged)

  // handle clicks on nodes
  inputMode.addEventListener('item-clicked', (evt) => {
    goToReferencingNode(evt.item as INode)
  })
  graphComponent.inputMode = inputMode

  // create the input mode for the model graph and disable selection and focus
  const modelInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NONE,
    selectableItems: GraphItemTypes.NONE,
    focusableItems: GraphItemTypes.NONE
  })
  // fit bounds on double-click
  modelInputMode.clickInputMode.addEventListener('clicked', (evt) => {
    if (evt.clickCount == 2) {
      void modelGraphComponent.fitGraphBounds()
    }
  })
  modelGraphComponent.inputMode = modelInputMode
}

/**
 * Add/Remove the hovered item to the highlight manager.
 */
function onHoveredItemChanged(evt: HoveredItemChangedEventArgs): void {
  // we use the highlight manager to highlight hovered items
  const highlights = graphComponent.highlights
  if (evt.oldItem instanceof INode) {
    highlights.remove(evt.oldItem)
  } else if (evt.oldItem instanceof ILabel) {
    highlights.remove(evt.oldItem.owner as INode)
  }

  if (evt.item instanceof INode) {
    highlights.add(evt.item)
  } else if (evt.item instanceof ILabel) {
    highlights.add(evt.item.owner as INode)
  }
}

/**
 * Loads the model graph and applies an initial multi-page layout.
 */
async function loadModelGraph(graphId: any) {
  // show a notification because the multi-page layout takes some time
  await showLoadingIndicator(true)

  const filename =
    graphId === 'Pop Artists'
      ? 'resources/pop-artists-small.graphml'
      : 'resources/yfiles-layout-namespaces.graphml'

  await new GraphMLIOHandler().readFromURL(modelGraphComponent.graph, filename)
  // fit model graph to the component
  void modelGraphComponent.fitGraphBounds()

  // fit the graph to the component
  void graphComponent.fitGraphBounds()

  // calculate the multi-page layout
  runMultiPageLayout()
}

run().then(finishLoading)
