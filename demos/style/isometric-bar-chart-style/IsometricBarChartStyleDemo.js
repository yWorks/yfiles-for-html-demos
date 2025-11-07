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
  GraphMLIOHandler,
  GraphViewerInputMode,
  License,
  Matrix
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, checkWebGL2Support, finishLoading } from '@yfiles/demo-app/demo-page'
import { hideBars, initializeAugmentations, showBars, toggleLabelVisibility } from './bar-rendering'

let graphComponent

let barDataComboBox

/**
 * Demo that shows how to augment a graph with additional information by displaying
 * isometric bars. The sample graph, which is loaded from a GraphML file consists of
 * multiple, already styled nodes which are associated with precomputed centrality values.
 * These values are then used in two additional NodeStyles to display a bar and a label each
 * and added as additional visualization via a custom @link{GraphModelManager}.
 */
async function run() {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = licenseData
  barDataComboBox = document.querySelector('#bar-data')
  addNavigationButtons(barDataComboBox)

  // initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')
  // use an isometric projection and allow fitContent to use a zoom > 1
  graphComponent.projection = Matrix.ISOMETRIC
  graphComponent.limitFitContentZoom = false

  // setup the additional GraphModelManagers to add the isometric bar augmentation to the GraphComponent
  initializeAugmentations(graphComponent, getTagData)

  // configure interaction
  graphComponent.inputMode = new GraphViewerInputMode()

  // bind the demo buttons to their actions
  initializeUI()

  // Read a sample graph from an embedded resource file
  loadSampleGraph().then(() => {
    // Manages the viewport
    graphComponent.fitGraphBounds()
  })
}

/**
 * Provides the data to be visualized by the bar chart.
 * @yjs:keep = degreeCentrality,graphCentrality,pageRank
 * @param node The node to provide the bar chart data for.
 */
function getTagData(node) {
  // extract the color used by the style of the node so it can be used as base color for the bar
  const fill = node.style.fill
  const color = getColorValues(fill)

  // take the selected node info from the node's tag
  // height will be the height of the bar while value is used for the label of the bar
  const key = barDataComboBox.options[barDataComboBox.selectedIndex].value
  switch (key) {
    case 'Degree Centrality':
      return {
        color: color,
        height: round(node.tag.normalizedDegreeCentrality) * 100,
        value: round(node.tag.degreeCentrality)
      }
    case 'Graph Centrality':
      return {
        color: color,
        height: round(node.tag.normalizedGraphCentrality) * 100,
        value: round(node.tag.graphCentrality)
      }
    case 'PageRank':
      return {
        color: color,
        height: round(node.tag.normalizedPageRank) * 100,
        value: round(node.tag.pageRank)
      }
    case 'None':
    default:
      return { color: color, value: 0, height: 0 }
  }
}

/**
 * Extracts the color components to the format used by the IsometricWebGLNodeStyle.
 * @param color The color to get the components for.
 */
function getColorValues(color) {
  return { r: color.r / 255.0, g: color.g / 255.0, b: color.b / 255.0, a: color.a / 255.0 }
}

/**
 * Round the given number to two digits.
 * @param number The number to round.
 */
function round(number) {
  return Math.round(number * 100) / 100
}

/**
 * Reads the sample graph.
 */
async function loadSampleGraph() {
  const graphMLIOHandler = new GraphMLIOHandler()
  await graphMLIOHandler.readFromURL(graphComponent.graph, 'resources/sample.graphml')
}

/**
 * Helper method that binds actions to the buttons in the demo's toolbar.
 */
function initializeUI() {
  document.querySelector('#bar-data').addEventListener('change', () => {
    if (barDataComboBox.options[barDataComboBox.selectedIndex].value === 'None') {
      hideBars(graphComponent)
    } else {
      showBars(graphComponent)
      toggleLabelVisibility(document.querySelector('#toggle-labels').checked, graphComponent)
    }
  })

  document.querySelector('#toggle-labels').addEventListener('change', (e) => {
    toggleLabelVisibility(e.target.checked, graphComponent)
  })
}

run().then(finishLoading)
