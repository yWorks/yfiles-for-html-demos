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
  Arrow,
  Class,
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphOverviewComponent,
  GraphSnapContext,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicLayout,
  HorizontalTextAlignment,
  IGraph,
  Insets,
  LabelShape,
  LabelSnapContext,
  LayoutExecutor,
  License,
  NinePositionsEdgeLabelModel,
  PolylineEdgeStyle,
  RectangleNodeStyle,
  ScrollBarVisibility,
  Size,
  Theme,
  VerticalTextAlignment
} from 'yfiles'

import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/** @type {GraphComponent} */
let graphComponent

/**
 * @typedef {('light'|'dark')} Mode
 */

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize a graph component with a custom theme
  initializeGraphComponentWithTheme()

  // initialize a GraphOverviewComponent
  new GraphOverviewComponent('overviewComponent', graphComponent)

  // configure input mode, snapping and undo-engine
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    snapContext: new GraphSnapContext(),
    labelSnapContext: new LabelSnapContext()
  })

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 50 })
  )
  graphComponent.fitGraphBounds()

  // initial selection of a single node to make the handles visible
  graphComponent.selection.setSelected(graphComponent.graph.nodes.at(2), true)

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  initializeUI()
}

/**
 * Creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createEdgesSource({
      data: graphData.edgeList,
      sourceId: (item) => item.source,
      targetId: (item) => item.target
    })
    .edgeCreator.createLabelBinding((item) => item.label)

  graphBuilder.buildGraph()
}

/**
 * Initializes a new graph component with a custom theme.
 */
function initializeGraphComponentWithTheme() {
  // Define the theme, consisting of a general variant, a scale and the colors
  // (see the documentation for more details).
  // This theme and its colors remain the same for the light and the dark mode of this demo,
  // which could in practice be the case if theme colors are, e.g., based on corporate design colors.
  const theme = new Theme({
    variant: 'simple-round',
    scale: 2,
    primaryColor: '#FCFDFE',
    secondaryColor: '#F69454',
    backgroundColor: '#EE693F'
  })
  graphComponent = new GraphComponent({ selector: '#graphComponent', theme })

  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED_DYNAMIC
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED_DYNAMIC
}

/**
 * Switches between the light and dark mode of this demo application.
 * @param {!Mode} mode
 */
function enableMode(mode) {
  const backgroundColor = mode === 'dark' ? '#3c4253' : '#fff'
  graphComponent.div.style.backgroundColor = backgroundColor

  // change the content area color of the group nodes
  const groupNodeStyle = graphComponent.graph.groupNodeDefaults.style
  groupNodeStyle.contentAreaFill = backgroundColor

  // change the stroke and target arrow color of the edges to a color which is
  // offers good visibility on the background
  const stroke = mode === 'dark' ? '#FCFDFE' : '#605003'
  const edgeStyle = graphComponent.graph.edgeDefaults.style
  edgeStyle.stroke = `1.5px ${stroke}`
  edgeStyle.targetArrow = new Arrow({
    color: stroke,
    stroke: stroke,
    type: 'triangle'
  })

  // indicate that the component needs to be updated
  graphComponent.invalidate()
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param {!IGraph} graph The graph.
 */
function initializeGraph(graph) {
  // define default styling for nodes, group nodes and edges
  const defaultStrokeColor = '#605003'
  const defaultNodeColor = '#f0c808'
  graph.nodeDefaults.style = new RectangleNodeStyle({
    fill: defaultNodeColor,
    stroke: `1.5px ${defaultStrokeColor}`,
    cornerStyle: 'round',
    cornerSize: 3.5
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: `1.5px ${defaultStrokeColor}`,
    targetArrow: `${defaultStrokeColor} triangle`
  })
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: defaultNodeColor,
    stroke: `2px solid ${defaultNodeColor}`,
    contentAreaInsets: 15
  })

  // define default label styles for node, group nodes and edges
  const nodeLabelStyle = new DefaultLabelStyle()
  nodeLabelStyle.shape = LabelShape.ROUND_RECTANGLE
  nodeLabelStyle.backgroundFill = '#f9e99c'
  nodeLabelStyle.textFill = '#605003'
  nodeLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  nodeLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  nodeLabelStyle.insets = new Insets(4, 2, 4, 1)
  graph.nodeDefaults.labels.style = nodeLabelStyle

  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    textFill: 'white'
  })

  const edgeLabelStyle = nodeLabelStyle.clone()
  edgeLabelStyle.backgroundFill = '#bfb99a'
  graph.edgeDefaults.labels.style = edgeLabelStyle

  // set sizes and label locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.TARGET_ABOVE
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()

  // initially, enable the light mode styling variant
  enableMode('light')
}

/**
 * Sets up event listeners for theme buttons.
 */
function initializeUI() {
  const lightBtn = document.querySelector('#light')
  const darkBtn = document.querySelector('#dark')
  lightBtn.addEventListener('click', () => switchMode('light'))
  darkBtn.addEventListener('click', () => switchMode('dark'))

  function switchMode(mode) {
    enableMode(mode)
    lightBtn.disabled = mode === 'light'
    darkBtn.disabled = mode === 'dark'
  }
}

run().then(finishLoading)
