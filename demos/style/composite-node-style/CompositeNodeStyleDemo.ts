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
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IGraph,
  ImageNodeStyle,
  INodeStyle,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import type { StyleDefinition } from './CompositeNodeStyle'
import { CompositeNodeStyle } from './CompositeNodeStyle'
import SampleData from './resources/SampleData'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * Stores the style definitions to be used with {@link CompositeNodeStyle}.
 */
type StyleDefinitions = {
  background: StyleDefinition
  border: StyleDefinition
  printer: StyleDefinition
  router: StyleDefinition
  scanner: StyleDefinition
  server: StyleDefinition
  switch: StyleDefinition
  workstation: StyleDefinition
}

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize graph component
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // configure user interaction
  configureUserInteraction(graphComponent)

  // create the style definitions from which to compose this demo's node visualizations
  const stylesDefinitions = createStyleDefinitions()

  // configures default styles for newly created graph elements
  configureGraph(graphComponent.graph, stylesDefinitions)

  // add a sample graph
  createGraph(graphComponent.graph, stylesDefinitions)

  // center the sample graph in the visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Enables interactive editing, but prevents interactive resizing of nodes.
 * @param graphComponent the graph view for which interactive editing is enabled.
 */
function configureUserInteraction(graphComponent: GraphComponent): void {
  graphComponent.inputMode = new GraphEditorInputMode({
    // removing nodes from showHandleItems effectively turns off resizing for nodes
    // resizing is turned off, because the node visualization used in this demo combine
    // circular background visualizations with rectangular foreground icons and due to
    // CompositeNodeStyle's approach of using absolute insets, increasing the size of a node
    // might lead to a rectangular icon no longer fitting inside its circular border
    showHandleItems:
      GraphItemTypes.BEND |
      GraphItemTypes.EDGE |
      GraphItemTypes.EDGE_LABEL |
      GraphItemTypes.NODE_LABEL |
      GraphItemTypes.PORT |
      GraphItemTypes.PORT_LABEL
  })
}

/**
 * Sets defaults styles for the given graph.
 */
function configureGraph(graph: IGraph, styleDefinitions: StyleDefinitions): void {
  // specify a default node size that works well with the insets used in the given style definitions
  graph.nodeDefaults.size = new Size(96, 96)

  graph.nodeDefaults.style = createCompositeStyle(styleDefinitions, 'workstation')

  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px #617984'
  })
}

/**
 * Creates a sample graph.
 */
function createGraph(graph: IGraph, stylesDefinitions: StyleDefinitions) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    labels: ['label'],
    layout: 'bounds',
    style: (data) => createCompositeStyle(stylesDefinitions, data.type as keyof StyleDefinitions)
  })
  builder.createEdgesSource({
    data: SampleData.edges,
    id: 'id',
    sourceId: 'src',
    targetId: 'tgt'
  })
  builder.buildGraph()
}

/**
 * Creates a new {@link CompositeNodeStyle} instance with the default background and border from
 * the given style definitions as well as the requested icon from the given style definitions.
 * @param styleDefinitions the style definitions used to compose a new node style.
 * @param icon the icon to show in the create composite node style instance.
 */
function createCompositeStyle(
  styleDefinitions: StyleDefinitions,
  icon: keyof StyleDefinitions
): INodeStyle {
  return new CompositeNodeStyle([
    styleDefinitions.background,
    styleDefinitions.border,
    styleDefinitions[icon]
  ])
}

/**
 * Creates several style definitions to use with {@link CompositeNodeStyle}.
 */
function createStyleDefinitions(): StyleDefinitions {
  return {
    // the main style for the nodes in this demo
    // aside from background visualization, this style is used for all style related operations
    // such as hit testing and visibility testing
    background: {
      style: new ShapeNodeStyle({ stroke: null, fill: '#eee', shape: 'ellipse' })
    },
    // the border visualization for the nodes in this demo
    // the insets used here ensure the the border is drawn completely inside the node bounds
    border: {
      style: new ShapeNodeStyle({ stroke: '3px #617984', fill: 'none', shape: 'ellipse' }),
      insets: 2 // half the stroke width to ensure the border is drawn completely inside the node bounds
    },
    // a printer icon for nodes
    printer: {
      style: new ImageNodeStyle('./resources/printer.svg'),
      // ensure the icon is completely inside the circular border visualization used for nodes
      // these values assume a node size of 96 x 96 pixels (at zoom 1)
      insets: [20, 16.5, 20, 16.5]
    },
    // a router icon for nodes, uses the same techniques as printer above
    router: {
      style: new ImageNodeStyle('./resources/router.svg'),
      insets: 17
    },
    // a scanner icon for nodes, uses the same techniques as printer above
    scanner: {
      style: new ImageNodeStyle('./resources/scanner.svg'),
      insets: [27, 12, 27, 12]
    },
    // a server icon for nodes, uses the same techniques as printer above
    server: {
      style: new ImageNodeStyle('./resources/server.svg'),
      insets: [16, 25, 16, 25]
    },
    // a switch icon for nodes, uses the same techniques as printer above
    switch: {
      style: new ImageNodeStyle('./resources/switch.svg'),
      insets: [30, 10, 30, 10]
    },
    // a workstation icon for nodes, uses the same techniques as printer above
    workstation: {
      style: new ImageNodeStyle('./resources/workstation.svg'),
      insets: [20, 17.5, 20, 17.5]
    }
  }
}

run().then(finishLoading)
