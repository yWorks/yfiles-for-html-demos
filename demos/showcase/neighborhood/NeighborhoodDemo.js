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
  GraphComponent,
  GraphFocusIndicatorManager,
  GraphInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphSelectionIndicatorManager,
  GraphViewerInputMode,
  IndicatorNodeStyleDecorator,
  License,
  ShapeNodeStyle,
  StyleDecorationZoomPolicy,
  TemplateNodeStyle,
  VoidNodeStyle
} from 'yfiles'

import { NeighborhoodView } from './NeighborhoodView.js'
import { NeighborhoodType } from './NeighborhoodType.js'
import { getApplyLayoutCallback } from './apply-layout-callback.js'
import { getBuildGraphCallback } from './build-graph-callback.js'
import { enableFolding } from './enable-folding.js'
import { enableGraphML } from './enable-graphml.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import {
  addNavigationButtons,
  disableUIElements,
  enableUIElements,
  finishLoading
} from 'demo-resources/demo-page'

/** @type {GraphComponent} */
let graphComponent

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize a GraphComponent with folding and GraphML I/O support
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  enableGraphML(graphComponent)
  const viewerInputMode = createInputMode()
  enableFolding(graphComponent, viewerInputMode)
  graphComponent.inputMode = viewerInputMode

  // configure a vivid selection indicator and some default styling for graph items
  initializeSelectionIndicator()
  initializeTemplateStyleConverters()
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  // create and configure the NeighborhoodView component
  const neighborhoodView = createNeighborhoodView(graphComponent)
  applyDemoTheme(neighborhoodView.neighborhoodComponent)

  // wire up the UI elements of this demo
  initializeUI(neighborhoodView)

  // start the demo with an initial sample graph
  readSampleGraph()
}

/**
 * @param {!GraphComponent} graphComponent
 * @returns {!NeighborhoodView}
 */
function createNeighborhoodView(graphComponent) {
  const neighborhoodView = new NeighborhoodView('#neighborhood-graph-component')
  neighborhoodView.graphComponent = graphComponent
  configureNeighborhoodView(neighborhoodView, NeighborhoodType.NEIGHBORHOOD, 1)
  return neighborhoodView
}

/**
 * Configure a vivid, rectangular selection indicator.
 */
function initializeSelectionIndicator() {
  const highlightNodeStyle = new IndicatorNodeStyleDecorator({
    // the indicator should be slightly bigger than the node
    padding: 5,
    // but have a fixed size in the view coordinates
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES,
    // create a vivid selection style
    wrapped: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: '3px solid #ff4500',
      fill: 'transparent'
    })
  })

  // now indicate the nodes with custom highlight styles
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: highlightNodeStyle
  })
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })
}

/**
 * Creates a read-only input mode for the {@link GraphComponent} that limits item selection to nodes.
 * @returns {!GraphInputMode}
 */
function createInputMode() {
  return new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NODE,
    marqueeSelectableItems: GraphItemTypes.NODE
  })
}

/**
 * @param {!NeighborhoodView} neighborhoodView
 */
function initializeUI(neighborhoodView) {
  // initialize the sample graphs dropdown
  const sampleGraphSelect = document.querySelector('#sample-graph-select')
  sampleGraphSelect.addEventListener('change', readSampleGraph)
  addNavigationButtons(sampleGraphSelect)
  populateSelectElement(sampleGraphSelect, [
    'social-network',
    'computer-network',
    'orgchart',
    'nesting'
  ])

  // initialize the mode dropdown for the NeighborhoodView
  const neighborhoodModeSelect = document.querySelector('#neighborhood-mode-select')
  neighborhoodModeSelect.addEventListener('change', () =>
    changeNeighborhoodType(neighborhoodView, neighborhoodModeSelect.selectedIndex)
  )
  addNavigationButtons(neighborhoodModeSelect)
  populateSelectElement(neighborhoodModeSelect, [
    'Neighbors',
    'Predecessors',
    'Successors',
    'Both',
    'FolderContents'
  ])

  // initialize the depth slider for the NeighborhoodView
  const neighborhoodDistanceSlider = document.querySelector('#neighborhood-distance-slider')
  neighborhoodDistanceSlider.min = '1'
  neighborhoodDistanceSlider.max = '5'
  neighborhoodDistanceSlider.value = '1'
  neighborhoodDistanceSlider.addEventListener('change', () => {
    changeNeighborhoodDistance(neighborhoodView, parseInt(neighborhoodDistanceSlider.value))
  })
}

/**
 * @param {!HTMLSelectElement} element
 * @param {!Array.<string>} items
 */
function populateSelectElement(element, items) {
  for (const item of items) {
    const option = document.createElement('option')
    option.text = item
    option.value = item
    element.add(option)
  }
}

/**
 * Updates the given neighborhood view's neighbor buildNeighborhoodGraph and applyNeighborhoodLayout
 * callbacks to create neighborhood graphs of the given type.
 * @param {!NeighborhoodView} neighborhoodView
 * @param {!NeighborhoodType} type
 */
function changeNeighborhoodType(neighborhoodView, type) {
  const neighborhoodDistanceSlider = document.querySelector('#neighborhood-distance-slider')

  configureNeighborhoodView(neighborhoodView, type, parseInt(neighborhoodDistanceSlider.value))

  // disable distance slider when the NeighborhoodView is in the FOLDER_CONTENTS mode
  neighborhoodDistanceSlider.disabled = type === NeighborhoodType.FOLDER_CONTENTS

  neighborhoodView.update()
}

/**
 * Updates the given neighborhood view's buildNeighborhoodGraph callback to include neighbors
 * up to the given maximum distance in the create neighborhood graphs.
 * @param {!NeighborhoodView} neighborhoodView
 * @param {number} distance
 */
function changeNeighborhoodDistance(neighborhoodView, distance) {
  document.getElementById('neighborhood-distance-label').textContent = `${distance}`

  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(
    document.querySelector('#neighborhood-mode-select').selectedIndex,
    distance
  )

  neighborhoodView.update()
}

/**
 * Configures the given neighborhood view to display neighborhood graphs of the given type.
 * @param {!NeighborhoodView} neighborhoodView
 * @param {!NeighborhoodType} type
 * @param {number} distance
 */
function configureNeighborhoodView(neighborhoodView, type, distance) {
  neighborhoodView.applyNeighborhoodLayout = getApplyLayoutCallback(type)
  neighborhoodView.buildNeighborhoodGraph = getBuildGraphCallback(type, distance)

  // mirror navigation in the NeighborhoodView to the demo's main GraphComponent
  neighborhoodView.clickCallback =
    NeighborhoodType.FOLDER_CONTENTS === type
      ? (node) => {
          const foldingView = graphComponent.graph.foldingView
          if (foldingView.manager.masterGraph.contains(node)) {
            const viewNode = foldingView.getViewItem(node)
            if (viewNode) {
              graphComponent.selection.clear()
              graphComponent.selection.setSelected(viewNode, true)
            }
          }
        }
      : (node) => {
          graphComponent.selection.clear()
          graphComponent.selection.setSelected(node, true)
        }
}

/**
 * Helper method that reads the currently selected graphml from the combobox.
 * @returns {!Promise}
 */
async function readSampleGraph() {
  // disable navigation buttons while graph is loaded
  disableUIElements('#sample-graph-select')

  // derive the file name from the dropdown menu
  const sampleGraphSelect = document.querySelector('#sample-graph-select')
  const selectedItem = sampleGraphSelect.options[sampleGraphSelect.selectedIndex].value
  const fileName = `resources/${selectedItem}.graphml`

  // load the file
  await new GraphMLIOHandler().readFromURL(graphComponent.graph, fileName)
  graphComponent.fitGraphBounds()

  // pre-select a node to show its neighborhood
  graphComponent.selection.clear()
  const node = graphComponent.graph.nodes.at(0)
  if (node) {
    graphComponent.selection.setSelected(node, true)
  }

  // re-enable navigation buttons
  enableUIElements()
}

/**
 * Initializes the converters for the org chart styles.
 */
function initializeTemplateStyleConverters() {
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

run().then(finishLoading)
