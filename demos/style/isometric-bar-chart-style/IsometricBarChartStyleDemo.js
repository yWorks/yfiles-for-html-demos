/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Color,
  GraphComponent,
  GraphMLIOHandler,
  GraphModelManager,
  GraphViewerInputMode,
  INode,
  License,
  Matrix,
  Rect,
  ShapeNodeStyle,
  Size,
  SolidColorFill
} from 'yfiles'

import AugmentationNodeDescriptor from './AugmentationNodeDescriptor.js'
import NodeGraphModelManager from './NodeGraphModelManager.js'
import IsometricWebGLNodeStyle from '../../showcase/isometricdrawing/IsometricWebGLNodeStyle.js'
import { IsometricBarLabelNodeStyle } from './IsometricBarLabelNodeStyle.js'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, checkWebGL2Support, finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/** @type {GraphComponent} */
let graphComponent

/** @type {HTMLSelectElement} */
let barDataComboBox

/** @type {GraphModelManager} */
let barManager
/** @type {GraphModelManager} */
let barLabelManager

/**
 * Demo that shows how to augment a graph with additional information by displaying
 * isometric bars. The sample graph, which is loaded from a GRAPHML file consists of
 * multiple, already styled nodes which are associated with precomputed centrality values.
 * These values are then used in two additional NodeStyles to display a bar and a label each
 * and added as additional visualization via a custom @link{GraphModelManager}.
 * @returns {!Promise}
 */
async function run() {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = await fetchLicense()
  barDataComboBox = document.querySelector('#bar-data')
  addNavigationButtons(barDataComboBox)

  // initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // use an isometric projection and allow fitContent to use a zoom > 1
  graphComponent.projection = Matrix.ISOMETRIC
  graphComponent.limitFitContentZoom = false

  // setup the additional GraphModelManagers to add the isometric bar augmentation to the GraphComponent
  initializeAugmentations()

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
 * Enable the isometric bar augmentations and their labels.
 */
function initializeAugmentations() {
  // bars should have a floor space of 10x10 at the node center
  const layoutProvider = (node) => Rect.fromCenter(node.layout.center, new Size(10, 10))

  // bars should be visualized on top of the normal content group
  const barGroup = graphComponent.rootGroup.addGroup()
  barGroup.above(graphComponent.contentGroup)

  // use the layoutProvider and getTagData method to provide render information to the IsometricWebGLNodeStyle
  // which uses WebGL rendering
  const barDescriptor = new AugmentationNodeDescriptor(
    new IsometricWebGLNodeStyle(),
    layoutProvider,
    getTagData
  )
  // the additional GraphModelManager adds the visualization provided by the AugmentationNodeDescriptor
  // to the GraphComponent
  barManager = new NodeGraphModelManager(graphComponent, barGroup, barDescriptor)

  // place the additional labels on top of the bars
  const labelGroup = graphComponent.rootGroup.addGroup()
  labelGroup.above(barGroup)
  // the IsometricBarLabelNodeStyle also uses the layoutProvider and getTagData method to place
  // the label close to the top of the bars
  const barLabelDescriptor = new AugmentationNodeDescriptor(
    new IsometricBarLabelNodeStyle(),
    layoutProvider,
    getTagData
  )
  // add another GraphModelManager for the bar labels that use SVG rendering
  // Note that we could have used just one additional GraphModelManager if both would use the
  // same rendering technique
  barLabelManager = new NodeGraphModelManager(graphComponent, labelGroup, barLabelDescriptor)
}

/**
 * Handles a selection change in the bar data combo box.
 */
function onBarDataChanged() {
  // check if augmentations should be disabled
  const disableBars = barDataComboBox.options[barDataComboBox.selectedIndex].value === 'None'
  // check if augmentations are currently active
  const barManagersActive = barManager.graph != null
  if (disableBars && barManagersActive) {
    // disable the augmentations by uninstalling the additional GraphModelManagers
    barManager.uninstall(graphComponent)
    barLabelManager.uninstall(graphComponent)
  } else if (!disableBars && !barManagersActive) {
    // enable the augmentations by installing the additional GraphModelManagers
    barManager.install(graphComponent, graphComponent.graph)
    barLabelManager.install(graphComponent, graphComponent.graph)
  }
  // update the augmentations
  graphComponent.invalidate()
}

/**
 * Provides the data to be visualized by the bar chart.
 * @yjs:keep = degreeCentrality,graphCentrality,pageRank
 * @param {!INode} node The node to provide the bar chart data for.
 * @returns {*}
 */
function getTagData(node) {
  // extract the color used by the style of the node so it can be used as base color for the bar
  const fill = node.style.fill
  const color = getColorValues(fill.color)

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
 * Shows or hides the labels
 * @param {boolean} enabled
 */
function toggleLabels(enabled) {
  if (barManager.graph != null) {
    if (enabled) {
      barLabelManager.install(graphComponent, graphComponent.graph)
    } else {
      barLabelManager.uninstall(graphComponent)
    }
    graphComponent.invalidate()
  }
}

/**
 * Extracts the color components to the format used by the IsometricWebGLNodeStyle.
 * @param {!Color} color The color to get the components for.
 */
function getColorValues(color) {
  return { r: color.r / 255.0, g: color.g / 255.0, b: color.b / 255.0, a: color.a / 255.0 }
}

/**
 * Round the given number to two digits.
 * @param {number} number The number to round.
 * @returns {number}
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
  document.querySelector('#bar-data').addEventListener('change', onBarDataChanged)

  document.querySelector('#toggle-labels').addEventListener('change', (e) => {
    toggleLabels(e.target.checked)
  })
}

run().then(finishLoading)
