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
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  './BridgeHelper.js',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, BridgeHelper) => {
  /**
   * Holds the graphComponent.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Holds the bridgeManager.
   * @type {yfiles.view.BridgeManager}
   */
  let bridgeManager = null

  /**
   * Runs the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph

    // draw edges in front, so that group nodes don't hide the bridges..
    graphComponent.graphModelManager.edgeGroup.toFront()
    graphComponent.graphModelManager.hierarchicNestingPolicy =
      yfiles.view.HierarchicNestingPolicy.NODES

    // Assign the default demo styles
    DemoStyles.initDemoStyles(graph)

    // initialize the input mode
    const mode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })
    graphComponent.inputMode = mode

    configureBridges()

    createSampleGraph()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Adds and configures the {@link yfiles.view.BridgeManager}.
   */
  function configureBridges() {
    bridgeManager = new yfiles.view.BridgeManager()

    // We would like to change the custom bridge rendering default,
    // this can be done by decorating the existing default callback
    bridgeManager.defaultBridgeCreator = new BridgeHelper.CustomCallback(
      bridgeManager.defaultBridgeCreator
    )

    // Convenience class that just queries all model item
    const provider = new yfiles.view.GraphObstacleProvider()

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
      node => new BridgeHelper.GroupNodeObstacleProvider(node)
    )

    initializeToolBarElements()
  }

  /**
   * Initializes the combo boxes and the text-boxes of the toolbar.
   */
  function initializeToolBarElements() {
    const crossingStylesComboBox = document.getElementById('crossingStyleComboBox')
    const crossingStylesElements = [
      {
        text: 'Arc',
        value: yfiles.view.BridgeCrossingStyle.ARC
      },
      {
        text: 'Gap',
        value: yfiles.view.BridgeCrossingStyle.GAP
      },
      {
        text: 'TwoSidesScaled',
        value: yfiles.view.BridgeCrossingStyle.TWO_SIDES_SCALED
      },
      {
        text: 'TwoSides',
        value: yfiles.view.BridgeCrossingStyle.TWO_SIDES
      },
      {
        text: 'Custom',
        value: yfiles.view.BridgeCrossingStyle.CUSTOM
      },
      {
        text: 'Rectangle',
        value: yfiles.view.BridgeCrossingStyle.RECTANGLE
      },
      {
        text: 'RectangleScaled',
        value: yfiles.view.BridgeCrossingStyle.RECTANGLE_SCALED
      },
      {
        text: 'ArcScaled',
        value: yfiles.view.BridgeCrossingStyle.ARC_SCALED
      }
    ]
    fillComboBox(crossingStylesComboBox, crossingStylesElements)

    const crossingPolicyComboBox = document.getElementById('crossingPolicyComboBox')
    const crossingDeterminationElements = [
      {
        text: 'HorizontalBridgesVertical',
        value: yfiles.view.BridgeCrossingPolicy.HORIZONTAL_BRIDGES_VERTICAL
      },
      {
        text: 'VerticalBridgesHorizontal',
        value: yfiles.view.BridgeCrossingPolicy.VERTICAL_BRIDGES_HORIZONTAL
      },
      {
        text: 'MoreHorizontalBridgesLessHorizontal',
        value: yfiles.view.BridgeCrossingPolicy.MORE_HORIZONTAL_BRIDGES_LESS_HORIZONTAL
      },
      {
        text: 'MoreVerticalBridgesLessVertical',
        value: yfiles.view.BridgeCrossingPolicy.MORE_VERTICAL_BRIDGES_LESS_VERTICAL
      }
    ]
    fillComboBox(crossingPolicyComboBox, crossingDeterminationElements)

    const bridgeOrientationComboBox = document.getElementById('bridgeOrientationComboBox')
    const bridgeOrientationElements = [
      {
        text: 'Up',
        value: yfiles.view.BridgeOrientationStyle.UP
      },
      {
        text: 'Down',
        value: yfiles.view.BridgeOrientationStyle.DOWN
      },
      {
        text: 'Left',
        value: yfiles.view.BridgeOrientationStyle.LEFT
      },
      {
        text: 'Right',
        value: yfiles.view.BridgeOrientationStyle.RIGHT
      },
      {
        text: 'FlowRight',
        value: yfiles.view.BridgeOrientationStyle.FLOW_RIGHT
      },
      {
        text: 'Positive',
        value: yfiles.view.BridgeOrientationStyle.POSITIVE
      },
      {
        text: 'Negative',
        value: yfiles.view.BridgeOrientationStyle.NEGATIVE
      },
      {
        text: 'FlowLeft',
        value: yfiles.view.BridgeOrientationStyle.FLOW_LEFT
      }
    ]
    fillComboBox(bridgeOrientationComboBox, bridgeOrientationElements)
  }

  /**
   * Fills the given combo box with the given values.
   * @param {HTMLElement} comboBox The combo box to be filled
   * @param {Array} content The values to be used
   */
  function fillComboBox(comboBox, content) {
    for (let i = 0; i < content.length; i++) {
      const el = document.createElement('option')
      el.textContent = content[i].text
      el.value = content[i].value
      comboBox.appendChild(el)
    }
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindChangeListener("select[data-command='CrossingStyleChanged']", () => {
      const crossingStyleComboBox = document.getElementById('crossingStyleComboBox')
      bridgeManager.defaultBridgeCrossingStyle = parseInt(
        crossingStyleComboBox[crossingStyleComboBox.selectedIndex].value
      )
      graphComponent.invalidate()
    })
    app.bindChangeListener("select[data-command='CrossingPolicyChanged']", () => {
      const crossingPolicyComboBox = document.getElementById('crossingPolicyComboBox')
      bridgeManager.bridgeCrossingPolicy = parseInt(
        crossingPolicyComboBox[crossingPolicyComboBox.selectedIndex].value
      )
      graphComponent.invalidate()
    })
    app.bindChangeListener("select[data-command='BridgeOrientationChanged']", () => {
      const bridgeOrientationComboBox = document.getElementById('bridgeOrientationComboBox')
      bridgeManager.defaultBridgeOrientationStyle = parseInt(
        bridgeOrientationComboBox[bridgeOrientationComboBox.selectedIndex].value
      )
      graphComponent.invalidate()
    })

    const bridgeWidthSlider = document.getElementById('bridgeWidthSlider')
    bridgeWidthSlider.addEventListener(
      'change',
      evt => {
        bridgeManager.defaultBridgeWidth = parseInt(bridgeWidthSlider.value)
        graphComponent.invalidate()
        document.getElementById('bridgeWidthLabel').textContent = bridgeWidthSlider.value.toString()
      },
      true
    )

    const bridgeHeightSlider = document.getElementById('bridgeHeightSlider')
    bridgeHeightSlider.addEventListener(
      'change',
      evt => {
        bridgeManager.defaultBridgeHeight = parseInt(bridgeHeightSlider.value)
        graphComponent.invalidate()
        document.getElementById(
          'bridgeHeightLabel'
        ).textContent = bridgeHeightSlider.value.toString()
      },
      true
    )
  }

  /**
   * Creates the sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph
    const nodes = []
    for (let i = 1; i < 5; i++) {
      nodes.push(graph.createNodeAt(new yfiles.geometry.Point(50 + 40 * i, 260)))
      nodes.push(graph.createNodeAt(new yfiles.geometry.Point(50 + 40 * i, 40)))
      nodes.push(graph.createNodeAt(new yfiles.geometry.Point(40, 50 + 40 * i)))
      nodes.push(graph.createNodeAt(new yfiles.geometry.Point(260, 50 + 40 * i)))
    }

    for (let i = 0; i < nodes.length; i++) {
      graph.addLabel(nodes[i], `${i}`)
    }

    graph.createEdge(nodes[0], nodes[1])

    const p1 = graph.addPortAt(nodes[0], new yfiles.geometry.Point(0, 0))
    graph.setRelativePortLocation(p1, new yfiles.geometry.Point(5, 0))

    const p2 = graph.addPortAt(nodes[1], new yfiles.geometry.Point(0, 0))
    graph.setRelativePortLocation(p2, new yfiles.geometry.Point(5, 0))
    graph.createEdge(p1, p2)

    graph.createEdge(nodes[5], nodes[4])
    graph.createEdge(nodes[2], nodes[3])
    graph.createEdge(nodes[7], nodes[6])
    graph.createEdge(nodes[2 + 8], nodes[3 + 8])
    graph.createEdge(nodes[7 + 8], nodes[6 + 8])
    graph.createEdge(nodes[0 + 8], nodes[1 + 8])
    graph.createEdge(nodes[5 + 8], nodes[4 + 8])

    const n1 = graph.createNodeAt(new yfiles.geometry.Point(300, 150))
    const n2 = graph.createNodeAt(new yfiles.geometry.Point(500, 150))

    graph.createEdge(n1, n2)

    const groupNode = graph.createGroupNode({
      labels: 'Group Node',
      children: [{ layout: new yfiles.geometry.Rect(400, 150, 30, 30) }]
    })
    graph.adjustGroupNodeLayout(groupNode)
    graph.setNodeLayout(
      groupNode,
      groupNode.layout.toRect().getEnlarged(new yfiles.geometry.Insets(15, 0, 15, 0))
    )

    graphComponent.fitGraphBounds()
  }

  // run the demo
  run()
})
