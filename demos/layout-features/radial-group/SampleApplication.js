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
  BezierEdgeStyle,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  IGraph,
  LayoutExecutor,
  License,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import { colorSets, createDemoNodeLabelStyle } from '@yfiles/demo-resources/demo-styles'
import { createFeatureLayoutConfiguration } from './RadialGroup'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

const groupTheme = 'demo-palette-44'
const nonOverlapTheme = 'demo-palette-47'
const overlapTheme = 'demo-palette-48'

async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()

  // initialize the styles of the graph items to look good for the cactus layout
  initializeStyleDefaults(graphComponent.graph)

  // load the sample graph
  await loadSampleGraph(graphComponent.graph)

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  // configure and apply the cactus layout to the graph
  const { layout, layoutData } = createFeatureLayoutConfiguration(graphComponent.graph)
  await graphComponent.applyLayoutAnimated(layout, '0s', layoutData)
}

/**
 * Initializes the style defaults for the graph so that it uses group nodes
 * and bezier edges which are appropriate for the cactus group layout.
 */
function initializeStyleDefaults(graph) {
  // define a round style for group nodes, but use a different color
  graph.groupNodeDefaults.style = new ShapeNodeStyle({
    fill: colorSets[groupTheme].fill,
    stroke: `1.5px ${colorSets[groupTheme].stroke}`,
    shape: 'ellipse'
  })

  // use BezierEdgeStyle for edges since the cactus layout can yield bezier control points (optional)
  graph.edgeDefaults.style = new BezierEdgeStyle({
    stroke: `1.5px ${colorSets[overlapTheme].stroke}`,
    targetArrow: `${colorSets[overlapTheme].stroke} small triangle`
  })
}

/**
 * Loads the sample graph from the json file.
 * @yjs:keep = nodeList, edgeList
 */
async function loadSampleGraph(graph) {
  // get the currently selected sample data
  const response = await fetch('sample.json')
  const data = await response.json()

  // use the graph builder to create the graph items from the sample data
  const builder = new GraphBuilder(graph)

  // define source and creation options for nodes and group nodes
  const nodesSource = builder.createNodesSource({
    data: data.nodeList.filter((node) => !node.isGroup),
    id: 'id',
    tag: 'tag',
    layout: 'layout',
    parentId: 'parent'
  })
  builder.createGroupNodesSource({
    data: data.nodeList.filter((node) => node.isGroup),
    id: 'id',
    tag: 'tag',
    layout: 'layout',
    parentId: 'parent'
  })

  nodesSource.nodeCreator.styleProvider = (item) => {
    const theme = item.tag && item.tag.avoidParentOverlap ? nonOverlapTheme : overlapTheme
    // use round nodes which are typical for cactus layouts
    return new ShapeNodeStyle({
      fill: colorSets[theme].fill,
      stroke: `1.5px ${colorSets[theme].stroke}`,
      shape: 'ellipse'
    })
  }

  const labelCreator = nodesSource.nodeCreator.createLabelsSource((item) => [
    !!(item.tag && item.tag.avoidParentOverlap)
  ]).labelCreator
  labelCreator.textProvider = () => 'Leaf'
  labelCreator.layoutParameterProvider = () => FreeNodeLabelModel.CENTER
  labelCreator.styleProvider = (avoidOverlap) => {
    const labelStyle = createDemoNodeLabelStyle(avoidOverlap ? nonOverlapTheme : overlapTheme)
    labelStyle.textSize = 20
    labelStyle.padding = [2, 6, 1, 5]
    return labelStyle
  }

  // define a source for creation of edges
  builder.createEdgesSource({
    data: data.edgeList,
    id: 'id',
    tag: 'tag',
    sourceId: 'source',
    targetId: 'target'
  })

  // build the graph
  builder.buildGraph()
}

run().then(finishLoading)
