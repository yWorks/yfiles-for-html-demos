/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  HandlePositions,
  IGraph,
  IReshapeHandler,
  License,
  NodeReshapeHandleProvider
} from 'yfiles'

import RenderingTypesManager from './RenderingTypesManager'

import type { DemoConfiguration } from './DemoConfiguration'
import {
  HierarchicDemoConfiguration,
  OrganicDemoConfiguration
} from './LargeGraphDemoConfiguration'
import OrgChartDemoConfiguration from './OrgChartDemoConfiguration'
import { fetchLicense } from 'demo-resources/fetch-license'
import {
  addNavigationButtons,
  addOptions,
  checkWebGL2Support,
  finishLoading
} from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

let renderingTypesManager: RenderingTypesManager = null!

async function run(): Promise<void> {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  configureInteraction(graphComponent)
  initToolbar(graphComponent)

  await loadGraph(graphComponent, new HierarchicDemoConfiguration())

  initGraphInformationUI(graphComponent)
  initRenderingInformationUI(graphComponent)
}

/**
 * Loads the graph using the specified {@link DemoConfiguration} and initializes
 * the {@link RenderingTypesManager}.
 */
async function loadGraph(graphComponent: GraphComponent, config: DemoConfiguration) {
  const graph = graphComponent.graph

  if (renderingTypesManager) {
    /**
     * A RenderingTypesManager was instantiated already, which means we are switching from
     * one demo graph to another.
     * The most important thing here is to dispose the old RenderingTypesManager, which basically
     * unregisters all listener from the GraphComponent.
     */
    renderingTypesManager.dispose()
    graph.clear()
  }

  await config.initializeStyleDefaults(graph)
  const svgThresholdSelect = document.querySelector<HTMLSelectElement>('#svgThreshold')!
  const newIndex = Array.from(svgThresholdSelect.options).findIndex(
    item => item.value === String(config.svgThreshold)
  )
  svgThresholdSelect.selectedIndex = newIndex !== -1 ? newIndex : 1
  renderingTypesManager = new RenderingTypesManager(
    graphComponent,
    config.svgThreshold,
    config.nodeStyleProvider,
    config.webGL2NodeStyleProvider,
    config.edgeStyleProvider,
    config.webGL2EdgeStyleProvider,
    config.nodeCreator
  )

  await config.loadGraph(graphComponent)

  renderingTypesManager.initializeWebGL2NodeStyles()

  graphComponent.fitGraphBounds()

  renderingTypesManager.registerZoomChangedListener()
  renderingTypesManager.registerItemCreatedListeners()

  graph.undoEngineEnabled = true
  if (graph.undoEngine) {
    graph.undoEngine.clear()
  }

  initRenderingInformationUI(graphComponent)
}

/**
 * Configures the interaction options with the graph
 */
function configureInteraction(graphComponent: GraphComponent) {
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    allowClipboardOperations: true
  })

  // Disable moving of individual edge segments
  graphComponent.graph.decorator.edgeDecorator.positionHandlerDecorator.hideImplementation()

  graphComponent.graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setFactory(node => {
    const keepAspectRatio = new NodeReshapeHandleProvider(
      node,
      node.lookup(IReshapeHandler.$class) as IReshapeHandler,
      HandlePositions.BORDER
    )
    keepAspectRatio.ratioReshapeRecognizer = EventRecognizers.ALWAYS
    return keepAspectRatio
  })
}

/**
 * Registers listeners to the graph component's input mode
 * that trigger the update of the graph information on the
 * left-hand side of the demo
 */
function initGraphInformationUI(graphComponent: GraphComponent) {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  const updateGraphInformationListener = () => {
    updateGraphInformation(graphComponent.graph)
  }

  inputMode.addNodeCreatedListener(updateGraphInformationListener)
  inputMode.createEdgeInputMode.addEdgeCreatedListener(updateGraphInformationListener)
  inputMode.addDeletedItemListener(updateGraphInformationListener)

  updateGraphInformation(graphComponent.graph)
}

function updateGraphInformation(graph: IGraph) {
  document.querySelector('#numberNodes')!.textContent = String(graph.nodes.size)
  document.querySelector('#numberEdges')!.textContent = String(graph.edges.size)
}

/**
 * Initializes the UI elements that display information about the current rendering type
 * and zoom level.
 */
function initRenderingInformationUI(graphComponent: GraphComponent) {
  graphComponent.addZoomChangedListener(graphComponent => {
    updateRenderingInformationUI(graphComponent)
  })
  updateRenderingInformationUI(graphComponent)

  // Show a popup when the rendering type changes
  renderingTypesManager.addRenderingTypeChangedListener(newMode => {
    const thresholdPercent = Math.floor(renderingTypesManager.svgThreshold * 100)
    const renderingInfoPopup = document.querySelector('#renderingInfoPopup')!
    renderingInfoPopup.textContent =
      newMode === 'SVG'
        ? `SVG rendering at zoom above ${thresholdPercent}%`
        : `WebGL2 rendering at zoom below ${thresholdPercent}%`
    renderingInfoPopup.className = 'visible'
    setTimeout(() => {
      renderingInfoPopup.className = ''
    }, 3000)
  })
}

/**
 * Updates the display of zoom and rendering type on the left-hand side of the demo
 */
function updateRenderingInformationUI(graphComponent: GraphComponent) {
  const zoomPercent = Math.floor(graphComponent.zoom * 100)
  document.querySelector('#zoomLevel')!.textContent = zoomPercent.toString()
  document.querySelector('#renderType')!.textContent = renderingTypesManager.currentRenderingType
}

function setUIDisabled(disabled: boolean) {
  const popup = document.querySelector('#loadingPopup')!
  popup.className = disabled ? 'visible' : ''

  document.querySelector<HTMLSelectElement>('#sampleSelection')!.disabled = disabled
  document.querySelector<HTMLSelectElement>('#svgThreshold')!.disabled = disabled
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Wires up the toolbar UI elements
 */
function initToolbar(graphComponent: GraphComponent): void {
  const sampleSelect = document.querySelector<HTMLSelectElement>('#sampleSelection')!
  addOptions(sampleSelect, 'Hierarchic', 'Organic', 'OrgChart')
  sampleSelect.addEventListener('change', async e => {
    await setUIDisabled(true)
    sampleSelect.disabled = true
    const hierarchicOrganicDescription =
      document.querySelector<HTMLDivElement>('#hierarchicOrganic')!
    const orgChartDescription = document.querySelector<HTMLDivElement>('#orgChart')!

    const select = e.target as HTMLSelectElement
    document.querySelector<HTMLDivElement>('#sampleName')!.innerText = select.value
    switch (select.value) {
      case 'Hierarchic': {
        hierarchicOrganicDescription.style.display = 'block'
        orgChartDescription.style.display = 'none'
        await loadGraph(graphComponent, new HierarchicDemoConfiguration())
        break
      }
      case 'Organic': {
        hierarchicOrganicDescription.style.display = 'block'
        orgChartDescription.style.display = 'none'
        await loadGraph(graphComponent, new OrganicDemoConfiguration())
        break
      }
      case 'OrgChart': {
        hierarchicOrganicDescription.style.display = 'none'
        orgChartDescription.style.display = 'block'
        await loadGraph(graphComponent, new OrgChartDemoConfiguration())
        break
      }
      default:
        graphComponent.graph.clear()
        break
    }
    sampleSelect.disabled = false
    updateGraphInformation(graphComponent.graph)
    await setUIDisabled(false)
  })
  addNavigationButtons(sampleSelect)

  const svgThresholdSelect = document.querySelector<HTMLSelectElement>('#svgThreshold')!
  addOptions(
    svgThresholdSelect,
    { text: '\u2265 25%', value: '0.25' },
    { text: '\u2265 50%', value: '0.5' },
    { text: '\u2265 100%', value: '1.0' },
    { text: 'WebGL only', value: '-1' }
  )
  svgThresholdSelect.addEventListener('change', e => {
    const selectElement = e.target as HTMLSelectElement
    const newThreshold = Number(selectElement.value)
    renderingTypesManager.svgThreshold = newThreshold < 0 ? Number.POSITIVE_INFINITY : newThreshold
    updateRenderingInformationUI(graphComponent)
  })
  addNavigationButtons(svgThresholdSelect, false)
}

run().then(finishLoading)
