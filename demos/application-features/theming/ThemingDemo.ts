/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphOverviewComponent,
  GraphSnapContext,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicalLayout,
  HorizontalTextAlignment,
  type IGraph,
  LabelShape,
  LabelStyle,
  LayoutExecutor,
  License,
  NinePositionsEdgeLabelModel,
  PolylineEdgeStyle,
  RectangleNodeStyle,
  Size,
  VerticalTextAlignment
} from '@yfiles/yfiles'

import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent
let graphOverviewComponent: GraphOverviewComponent

type Mode = 'light' | 'dark'

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData

  // initialize a graph component with a custom theme
  graphComponent = new GraphComponent('#graphComponent')

  // initialize a GraphOverviewComponent
  graphOverviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // configure input mode, snapping and undo-engine
  graphComponent.inputMode = new GraphEditorInputMode({ snapContext: new GraphSnapContext() })

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 50 }))
  await graphComponent.fitGraphBounds()

  // initial selection of a single node to make the handles visible
  graphComponent.selection.add(graphComponent.graph.nodes.at(2)!)

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  initializeUI()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
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
 * Switches between the light and dark mode of this demo application.
 */
function enableMode(mode: Mode) {
  const isDarkMode = mode === 'dark'
  const backgroundColor = isDarkMode ? '#3c4253' : '#fff'
  graphComponent.htmlElement.style.backgroundColor = backgroundColor

  // change the content area color of the group nodes
  const groupNodeStyle = graphComponent.graph.groupNodeDefaults.style as GroupNodeStyle
  groupNodeStyle.contentAreaFill = backgroundColor

  // change the stroke and target arrow color of the edges to a color which is
  // offers good visibility on the background
  const color = isDarkMode ? '#FCFDFE' : '#605003'
  const edgeStyle = graphComponent.graph.edgeDefaults.style as PolylineEdgeStyle
  edgeStyle.stroke = `1.5px ${color}`
  edgeStyle.targetArrow = new Arrow({ fill: color, stroke: color, type: 'triangle' })

  // update CSS variables
  if (isDarkMode) {
    graphComponent.htmlElement.classList.add('dark')
    graphOverviewComponent.htmlElement.classList.add('dark')
  } else {
    graphComponent.htmlElement.classList.remove('dark')
    graphOverviewComponent.htmlElement.classList.remove('dark')
  }

  // indicate that the component needs to be updated
  graphComponent.invalidate()
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph: IGraph): void {
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
    contentAreaPadding: 15
  })

  // define default label styles for node, group nodes and edges
  const nodeLabelStyle = new LabelStyle()
  nodeLabelStyle.shape = LabelShape.ROUND_RECTANGLE
  nodeLabelStyle.backgroundFill = '#f9e99c'
  nodeLabelStyle.textFill = '#605003'
  nodeLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  nodeLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  nodeLabelStyle.padding = [2, 4, 1, 4]
  graph.nodeDefaults.labels.style = nodeLabelStyle

  graph.groupNodeDefaults.labels.style = new LabelStyle({
    verticalTextAlignment: 'center',
    textFill: 'white'
  })

  const edgeLabelStyle = nodeLabelStyle.clone()
  edgeLabelStyle.backgroundFill = '#bfb99a'
  graph.edgeDefaults.labels.style = edgeLabelStyle

  // set sizes and label locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new NinePositionsEdgeLabelModel().createParameter(
    'target-above'
  )
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()

  // initially, enable the light mode styling variant
  enableMode('light')
}

/**
 * Sets up event listeners for theme buttons.
 */
function initializeUI(): void {
  const lightBtn = document.querySelector<HTMLButtonElement>('#light')!
  const darkBtn = document.querySelector<HTMLButtonElement>('#dark')!
  lightBtn.addEventListener('click', () => switchMode('light'))
  darkBtn.addEventListener('click', () => switchMode('dark'))

  function switchMode(mode: Mode) {
    enableMode(mode)
    lightBtn.disabled = mode === 'light'
    darkBtn.disabled = mode === 'dark'
  }
}

run().then(finishLoading)
