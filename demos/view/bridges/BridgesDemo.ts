/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HierarchicNestingPolicy,
  ICommand,
  Insets,
  License,
  Point,
  Rect
} from 'yfiles'

import { CustomCallback, GroupNodeObstacleProvider } from './BridgeHelper'
import {
  addNavigationButtons,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app'
import { initDemoStyles } from '../../resources/demo-styles'
import loadJson from '../../resources/load-json'

/**
 * Holds the graphComponent.
 */
let graphComponent: GraphComponent

/**
 * Holds the bridgeManager.
 */
let bridgeManager: BridgeManager

/**
 * Runs the demo.
 */
function run(licenseData: object): void {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // draw edges in front, so that group nodes don't hide the bridges
  graphComponent.graphModelManager.edgeGroup.toFront()
  graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES

  initDemoStyles(graph)

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  configureBridges()

  initializeToolBarElements()

  createSampleGraph()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Adds and configures the {@link BridgeManager}.
 */
function configureBridges(): void {
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
  graphComponent.graph.decorator.nodeDecorator.obstacleProviderDecorator.setFactory(
    node => graphComponent.graph.isGroupNode(node),
    node => new GroupNodeObstacleProvider(node)
  )
}

/**
 * Initializes the combo boxes and the text-boxes of the toolbar.
 */
function initializeToolBarElements(): void {
  const crossingStylesComboBox = document.getElementById(
    'crossingStyleComboBox'
  ) as HTMLSelectElement
  addNavigationButtons(crossingStylesComboBox)
  const crossingStylesElements = [
    {
      text: 'Arc',
      value: BridgeCrossingStyle.ARC
    },
    {
      text: 'Gap',
      value: BridgeCrossingStyle.GAP
    },
    {
      text: 'TwoSidesScaled',
      value: BridgeCrossingStyle.TWO_SIDES_SCALED
    },
    {
      text: 'TwoSides',
      value: BridgeCrossingStyle.TWO_SIDES
    },
    {
      text: 'Custom',
      value: BridgeCrossingStyle.CUSTOM
    },
    {
      text: 'Rectangle',
      value: BridgeCrossingStyle.RECTANGLE
    },
    {
      text: 'RectangleScaled',
      value: BridgeCrossingStyle.RECTANGLE_SCALED
    },
    {
      text: 'ArcScaled',
      value: BridgeCrossingStyle.ARC_SCALED
    }
  ]
  fillComboBox(crossingStylesComboBox, crossingStylesElements)

  const crossingPolicyComboBox = document.getElementById(
    'crossingPolicyComboBox'
  ) as HTMLSelectElement
  addNavigationButtons(crossingPolicyComboBox)
  const crossingDeterminationElements = [
    {
      text: 'HorizontalBridgesVertical',
      value: BridgeCrossingPolicy.HORIZONTAL_BRIDGES_VERTICAL
    },
    {
      text: 'VerticalBridgesHorizontal',
      value: BridgeCrossingPolicy.VERTICAL_BRIDGES_HORIZONTAL
    },
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

  const bridgeOrientationComboBox = document.getElementById(
    'bridgeOrientationComboBox'
  ) as HTMLSelectElement
  addNavigationButtons(bridgeOrientationComboBox)
  const bridgeOrientationElements = [
    {
      text: 'Up',
      value: BridgeOrientationStyle.UP
    },
    {
      text: 'Down',
      value: BridgeOrientationStyle.DOWN
    },
    {
      text: 'Left',
      value: BridgeOrientationStyle.LEFT
    },
    {
      text: 'Right',
      value: BridgeOrientationStyle.RIGHT
    },
    {
      text: 'FlowRight',
      value: BridgeOrientationStyle.FLOW_RIGHT
    },
    {
      text: 'Positive',
      value: BridgeOrientationStyle.POSITIVE
    },
    {
      text: 'Negative',
      value: BridgeOrientationStyle.NEGATIVE
    },
    {
      text: 'FlowLeft',
      value: BridgeOrientationStyle.FLOW_LEFT
    }
  ]
  fillComboBox(bridgeOrientationComboBox, bridgeOrientationElements)
}

/**
 * Fills the given combo box with the given values.
 * @param comboBox The combo box to be filled
 * @param content The values to be used
 */
function fillComboBox(
  comboBox: HTMLElement | null,
  content: { text: string; value: number }[]
): void {
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
 * Wires up the UI.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1)

  bindChangeListener("select[data-command='CrossingStyleChanged']", () => {
    bridgeManager.defaultBridgeCrossingStyle = getValueFromComboBox('crossingStyleComboBox')
    graphComponent.invalidate()
  })
  bindChangeListener("select[data-command='CrossingPolicyChanged']", () => {
    bridgeManager.bridgeCrossingPolicy = getValueFromComboBox('crossingPolicyComboBox')
    graphComponent.invalidate()
  })
  bindChangeListener("select[data-command='BridgeOrientationChanged']", () => {
    bridgeManager.defaultBridgeOrientationStyle = getValueFromComboBox('bridgeOrientationComboBox')
    graphComponent.invalidate()
  })
  bindChangeListener('#bridgeWidthSlider', (value: string) => {
    bridgeManager.defaultBridgeWidth = parseInt(value)
    graphComponent.invalidate()
    document.getElementById('bridgeWidthLabel')!.textContent = value
  })
  bindChangeListener('#bridgeHeightSlider', (value: string) => {
    bridgeManager.defaultBridgeHeight = parseInt(value)
    graphComponent.invalidate()
    document.getElementById('bridgeHeightLabel')!.textContent = value
  })
}

/**
 * Returns the integer value of the currently-selected element in the combo box
 * with the given ID.
 * @param id The ID of the combo box.
 */
function getValueFromComboBox(id: string): number {
  const comboBox = document.getElementById(id) as HTMLSelectElement
  return parseInt((comboBox[comboBox.selectedIndex] as HTMLOptionElement).value)
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(): void {
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
    children: [{ layout: new Rect(400, 150, 30, 30) }]
  })
  graph.adjustGroupNodeLayout(groupNode)
  graph.setNodeLayout(groupNode, groupNode.layout.toRect().getEnlarged(new Insets(15, 0, 15, 0)))

  graphComponent.fitGraphBounds()
}

// run the demo
loadJson().then(checkLicense).then(run)
