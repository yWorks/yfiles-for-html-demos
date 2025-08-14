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
  BridgeCrossingPolicy,
  BridgeCrossingStyle,
  BridgeManager,
  BridgeOrientationStyle,
  GraphComponent,
  GraphEditorInputMode,
  GraphObstacleProvider,
  HierarchicalNestingPolicy,
  Insets,
  License,
  Point,
  Rect
} from '@yfiles/yfiles'

import { CustomCallback, GroupNodeObstacleProvider } from './BridgeHelper'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * Holds the graphComponent.
 */
let graphComponent

/**
 * Holds the bridgeManager.
 */
let bridgeManager

/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // draw edges in front, so that group nodes don't hide the bridges
  graphComponent.graphModelManager.edgeGroup.toFront()
  graphComponent.graphModelManager.hierarchicalNestingPolicy = HierarchicalNestingPolicy.NODES

  initDemoStyles(graph)

  graphComponent.inputMode = new GraphEditorInputMode()

  configureBridges()

  initializeToolBarElements()

  createSampleGraph()
}

/**
 * Adds and configures the {@link BridgeManager}.
 */
function configureBridges() {
  bridgeManager = new BridgeManager()

  // We would like to change the custom bridge rendering default,
  // this can be done by decorating the existing default callback
  bridgeManager.defaultBridgeCreator = new CustomCallback(bridgeManager.defaultBridgeCreator)

  // Convenience class that just queries all model item
  const provider = new GraphObstacleProvider()

  // We also want to query nodes for potential obstacles (disabled by default)
  provider.queryNodes = true

  // Register an IObstacleProvider, bridgeManager will query all registered obstacle providers
  // to determine if a bridge must be created
  bridgeManager.addObstacleProvider(provider)
  // Bind the bridge manager to the GraphComponent...
  bridgeManager.canvasComponent = graphComponent

  // We register a custom obstacle provider in the node's lookup of group nodes
  // that can be used by bridgeManager (through provider...)
  graphComponent.graph.decorator.nodes.obstacleProvider.addFactory(
    (node) => graphComponent.graph.isGroupNode(node),
    (node) => new GroupNodeObstacleProvider(node)
  )
}

/**
 * Initializes the combo boxes and the text-boxes of the toolbar.
 */
function initializeToolBarElements() {
  const crossingStylesComboBox = document.querySelector('#crossing-styles')
  addNavigationButtons(crossingStylesComboBox).addEventListener('change', () => {
    bridgeManager.defaultBridgeCrossingStyle = getValueFromComboBox('#crossing-styles')
    graphComponent.invalidate()
  })
  const crossingStylesElements = [
    { text: 'Arc', value: BridgeCrossingStyle.ARC },
    { text: 'Gap', value: BridgeCrossingStyle.GAP },
    { text: 'TwoSidesScaled', value: BridgeCrossingStyle.TWO_SIDES_SCALED },
    { text: 'TwoSides', value: BridgeCrossingStyle.TWO_SIDES },
    { text: 'Custom', value: BridgeCrossingStyle.CUSTOM },
    { text: 'Rectangle', value: BridgeCrossingStyle.RECTANGLE },
    { text: 'RectangleScaled', value: BridgeCrossingStyle.RECTANGLE_SCALED },
    { text: 'ArcScaled', value: BridgeCrossingStyle.ARC_SCALED }
  ]
  fillComboBox(crossingStylesComboBox, crossingStylesElements)

  const crossingPolicyComboBox = document.querySelector('#crossing-policies')
  addNavigationButtons(crossingPolicyComboBox).addEventListener('change', () => {
    bridgeManager.bridgeCrossingPolicy = getValueFromComboBox('#crossing-policies')
    graphComponent.invalidate()
  })
  const crossingDeterminationElements = [
    { text: 'HorizontalBridgesVertical', value: BridgeCrossingPolicy.HORIZONTAL_BRIDGES_VERTICAL },
    { text: 'VerticalBridgesHorizontal', value: BridgeCrossingPolicy.VERTICAL_BRIDGES_HORIZONTAL },
    {
      text: 'MoreHorizontalBridgesLessHorizontal',
      value: BridgeCrossingPolicy.MORE_HORIZONTAL_BRIDGES_LESS_HORIZONTAL
    },
    {
      text: 'MoreVerticalBridgesLessVertical',
      value: BridgeCrossingPolicy.MORE_VERTICAL_BRIDGES_LESS_VERTICAL
    }
  ]
  fillComboBox(crossingPolicyComboBox, crossingDeterminationElements)

  const bridgeOrientationComboBox = document.querySelector('#bridge-orientations')
  addNavigationButtons(bridgeOrientationComboBox).addEventListener('change', () => {
    bridgeManager.defaultBridgeOrientationStyle = getValueFromComboBox('#bridge-orientations')
    graphComponent.invalidate()
  })
  const bridgeOrientationElements = [
    { text: 'Up', value: BridgeOrientationStyle.UP },
    { text: 'Down', value: BridgeOrientationStyle.DOWN },
    { text: 'Left', value: BridgeOrientationStyle.LEFT },
    { text: 'Right', value: BridgeOrientationStyle.RIGHT },
    { text: 'FlowRight', value: BridgeOrientationStyle.FLOW_RIGHT },
    { text: 'Positive', value: BridgeOrientationStyle.POSITIVE },
    { text: 'Negative', value: BridgeOrientationStyle.NEGATIVE },
    { text: 'FlowLeft', value: BridgeOrientationStyle.FLOW_LEFT }
  ]
  fillComboBox(bridgeOrientationComboBox, bridgeOrientationElements)

  document.querySelector('#bridge-width-slider').addEventListener('change', (evt) => {
    const value = evt.target.value
    bridgeManager.defaultBridgeWidth = parseInt(value)
    graphComponent.invalidate()
    document.getElementById('bridge-width-label').textContent = value
  })
  document.querySelector('#bridge-height-slider').addEventListener('change', (evt) => {
    const value = evt.target.value
    bridgeManager.defaultBridgeHeight = parseInt(value)
    graphComponent.invalidate()
    document.getElementById('bridge-height-label').textContent = value
  })
}

/**
 * Fills the given combo box with the given values.
 * @param comboBox The combo box to be filled
 * @param content The values to be used
 */
function fillComboBox(comboBox, content) {
  if (!comboBox) {
    return
  }
  for (let i = 0; i < content.length; i++) {
    const el = document.createElement('option')
    el.textContent = content[i].text
    el.value = content[i].value.toString()
    comboBox.appendChild(el)
  }
}

/**
 * Returns the integer value of the currently-selected element in the combo box
 * with the given ID.
 * @param selector The ID of the combo box.
 */
function getValueFromComboBox(selector) {
  const comboBox = document.querySelector(selector)
  return parseInt(comboBox[comboBox.selectedIndex].value)
}

/**
 * Creates the sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph
  const nodes = []
  for (let i = 1; i < 5; i++) {
    nodes.push(graph.createNodeAt(new Point(50 + 40 * i, 260)))
    nodes.push(graph.createNodeAt(new Point(50 + 40 * i, 40)))
    nodes.push(graph.createNodeAt(new Point(40, 50 + 40 * i)))
    nodes.push(graph.createNodeAt(new Point(260, 50 + 40 * i)))
  }

  for (let i = 0; i < nodes.length; i++) {
    graph.addLabel(nodes[i], `${i}`)
  }

  graph.createEdge(nodes[0], nodes[1])

  const p1 = graph.addPortAt(nodes[0], new Point(0, 0))
  graph.setRelativePortLocation(p1, new Point(5, 0))

  const p2 = graph.addPortAt(nodes[1], new Point(0, 0))
  graph.setRelativePortLocation(p2, new Point(5, 0))
  graph.createEdge(p1, p2)

  graph.createEdge(nodes[5], nodes[4])
  graph.createEdge(nodes[2], nodes[3])
  graph.createEdge(nodes[7], nodes[6])
  graph.createEdge(nodes[2 + 8], nodes[3 + 8])
  graph.createEdge(nodes[7 + 8], nodes[6 + 8])
  graph.createEdge(nodes[0 + 8], nodes[1 + 8])
  graph.createEdge(nodes[5 + 8], nodes[4 + 8])

  const n1 = graph.createNodeAt(new Point(300, 150))
  const n2 = graph.createNodeAt(new Point(500, 150))

  graph.createEdge(n1, n2)

  const groupNode = graph.createGroupNode({
    labels: ['Group Node'],
    children: [{ layout: new Rect(400, 140, 30, 30) }]
  })
  graph.adjustGroupNodeLayout(groupNode)
  graph.setNodeLayout(groupNode, groupNode.layout.toRect().getEnlarged(new Insets(0, 15, 0, 15)))

  graphComponent.fitGraphBounds()
}

run().then(finishLoading)
