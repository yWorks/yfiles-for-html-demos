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
  GraphComponent,
  type GraphInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  License,
  NodeStyleIndicatorRenderer,
  ShapeNodeStyle,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'

import { NeighborhoodView } from './NeighborhoodView'
import { type NeighborhoodType } from './NeighborhoodType'
import { getApplyLayoutCallback } from './apply-layout-callback'
import { getBuildGraphCallback } from './build-graph-callback'
import { enableFolding } from './enable-folding'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import {
  addNavigationButtons,
  disableUIElements,
  enableUIElements,
  finishLoading
} from '@yfiles/demo-app/demo-page'
import { StringTemplateNodeStyle } from '@yfiles/demo-utils/template-styles/StringTemplateNodeStyle'
import { registerTemplateStyleSerialization } from '@yfiles/demo-utils/template-styles/MarkupExtensions'

let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = licenseData

  // initialize a GraphComponent with folding and GraphML I/O support
  graphComponent = new GraphComponent('graphComponent')
  const viewerInputMode = createInputMode()
  enableFolding(graphComponent, viewerInputMode)
  graphComponent.inputMode = viewerInputMode

  // configure a vivid selection indicator and some default styling for graph items
  initializeSelectionIndicator()
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  // create and configure the NeighborhoodView component
  const neighborhoodView = createNeighborhoodView(graphComponent)
  // wire up the UI elements of this demo
  initializeUI(neighborhoodView)
  //bind converters of the template node styles.
  initializeConverters()

  // start the demo with an initial sample graph
  readSampleGraph()
}

function createNeighborhoodView(graphComponent: GraphComponent): NeighborhoodView {
  const neighborhoodView = new NeighborhoodView('#neighborhood-graph-component')
  neighborhoodView.graphComponent = graphComponent
  configureNeighborhoodView(neighborhoodView, 'neighborhood', 1)
  return neighborhoodView
}

/**
 * Configure a vivid, rectangular selection indicator.
 */
function initializeSelectionIndicator(): void {
  const highlightNodeStyle = new NodeStyleIndicatorRenderer({
    // the indicator should be slightly bigger than the node
    margins: 5,
    // but have a fixed size in the view coordinates
    zoomPolicy: StyleIndicatorZoomPolicy.VIEW_COORDINATES,
    // create a vivid selection style
    nodeStyle: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: '3px solid #ff4500',
      fill: 'transparent'
    })
  })

  // now indicate the nodes with custom highlight styles
  graphComponent.graph.decorator.nodes.selectionRenderer.addConstant(highlightNodeStyle)

  graphComponent.graph.decorator.nodes.focusRenderer.hide()
}

/**
 * Creates a read-only input mode for the {@link GraphComponent} that limits item selection to nodes.
 */
function createInputMode(): GraphInputMode {
  return new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NODE,
    marqueeSelectableItems: GraphItemTypes.NODE
  })
}

function initializeUI(neighborhoodView: NeighborhoodView): void {
  // initialize the sample graphs dropdown
  const sampleGraphSelect = document.querySelector<HTMLSelectElement>('#sample-graph-select')!
  sampleGraphSelect.addEventListener('change', readSampleGraph)
  addNavigationButtons(sampleGraphSelect)
  populateSelectElement(sampleGraphSelect, [
    'social-network',
    'computer-network',
    'orgchart',
    'nesting'
  ])

  // initialize the mode dropdown for the NeighborhoodView
  const neighborhoodModeSelect = document.querySelector<HTMLSelectElement>(
    '#neighborhood-mode-select'
  )!
  neighborhoodModeSelect.addEventListener('change', () =>
    changeNeighborhoodType(neighborhoodView, neighborhoodModeSelect.value as NeighborhoodType)
  )
  addNavigationButtons(neighborhoodModeSelect)
  populateSelectElement(neighborhoodModeSelect, [
    'Neighbors',
    'Predecessors',
    'Successors',
    'Both',
    'Folder-Contents'
  ])

  // initialize the depth slider for the NeighborhoodView
  const neighborhoodDistanceSlider = document.querySelector<HTMLInputElement>(
    '#neighborhood-distance-slider'
  )!
  neighborhoodDistanceSlider.min = '1'
  neighborhoodDistanceSlider.max = '5'
  neighborhoodDistanceSlider.value = '1'
  neighborhoodDistanceSlider.addEventListener('change', () => {
    changeNeighborhoodDistance(neighborhoodView, parseInt(neighborhoodDistanceSlider.value))
  })
}

function populateSelectElement(element: HTMLSelectElement, items: string[]): void {
  for (const item of items) {
    const option = document.createElement('option')
    option.text = item
    option.value = item.toLowerCase()
    element.add(option)
  }
}

/**
 * Updates the given neighborhood view's neighbor buildNeighborhoodGraph and applyNeighborhoodLayout
 * callbacks to create neighborhood graphs of the given type.
 */
function changeNeighborhoodType(neighborhoodView: NeighborhoodView, type: NeighborhoodType): void {
  const neighborhoodDistanceSlider = document.querySelector<HTMLInputElement>(
    '#neighborhood-distance-slider'
  )!

  configureNeighborhoodView(neighborhoodView, type, parseInt(neighborhoodDistanceSlider.value))

  // disable distance slider when the NeighborhoodView is in the FOLDER_CONTENTS mode
  neighborhoodDistanceSlider.disabled = type === 'folder-contents'

  neighborhoodView.update()
}

/**
 * Updates the given neighborhood view's buildNeighborhoodGraph callback to include neighbors
 * up to the given maximum distance in the create neighborhood graphs.
 */
function changeNeighborhoodDistance(neighborhoodView: NeighborhoodView, distance: number): void {
  document.getElementById('neighborhood-distance-label')!.textContent = `${distance}`

  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(
    document.querySelector<HTMLSelectElement>('#neighborhood-mode-select')!
      .value as NeighborhoodType,
    distance
  )

  neighborhoodView.update()
}

/**
 * Configures the given neighborhood view to display neighborhood graphs of the given type.
 */
function configureNeighborhoodView(
  neighborhoodView: NeighborhoodView,
  type: NeighborhoodType,
  distance: number
): void {
  neighborhoodView.applyNeighborhoodLayout = getApplyLayoutCallback(type)
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(type, distance)

  // mirror navigation in the NeighborhoodView to the demo's main GraphComponent
  neighborhoodView.clickCallback =
    'folder-contents' === type
      ? (node) => {
          const foldingView = graphComponent.graph.foldingView!
          if (foldingView.manager.masterGraph.contains(node)) {
            const viewNode = foldingView.getViewItem(node)
            if (viewNode) {
              graphComponent.selection.clear()
              graphComponent.selection.add(viewNode)
            }
          }
        }
      : (node) => {
          graphComponent.selection.clear()
          graphComponent.selection.add(node)
        }
}

/**
 * Helper method that reads the currently selected graphml from the combobox.
 */
async function readSampleGraph(): Promise<void> {
  // disable navigation buttons while graph is loaded
  disableUIElements('#sample-graph-select')

  // derive the file name from the dropdown menu
  const sampleGraphSelect = document.querySelector<HTMLSelectElement>('#sample-graph-select')!
  const selectedItem = sampleGraphSelect.options[sampleGraphSelect.selectedIndex].value
  const fileName = `resources/${selectedItem}.graphml`

  // load the file
  const ioHandler = new GraphMLIOHandler()
  registerTemplateStyleSerialization(ioHandler)
  await ioHandler.readFromURL(graphComponent.graph, fileName)
  graphComponent.fitGraphBounds()

  // pre-select a node to show its neighborhood
  graphComponent.selection.clear()
  const node = graphComponent.graph.nodes.at(0)
  if (node) {
    graphComponent.selection.add(node)
  }

  // re-enable navigation buttons
  enableUIElements()
}

/**
 * Initializes the converters for the bindings of the template node styles.
 */
function initializeConverters(): void {
  const colors = { present: '#76b041', busy: '#ab2346', travel: '#a367dc', unavailable: '#c1c1c1' }

  StringTemplateNodeStyle.CONVERTERS.demoConverters = {
    // converter function for the background color of nodes
    statusColorConverter: (value: keyof typeof colors) => colors[value] || 'white',

    // converter function for the border color nodes
    selectedStrokeConverter: (value: any) => {
      if (typeof value === 'boolean') {
        return value ? '#ff6c00' : 'rgba(0,0,0,0)'
      }
      return '#FFF'
    },

    // converter function that adds the numbers given as value and parameter
    addConverter: (value: string, parameter: any) => {
      if (typeof parameter === 'string') {
        return String(Number(value) + Number(parameter))
      }
      return value
    },

    // converter function that converts the given string to a valid path
    pathConverter: (value: any) => {
      if (typeof value === 'string') {
        return `./resources/${value}.svg`
      }
      return value
    }
  }
}

run().then(finishLoading)
