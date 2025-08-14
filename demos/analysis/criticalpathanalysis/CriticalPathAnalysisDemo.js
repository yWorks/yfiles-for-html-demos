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
  EdgePathLabelModel,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  InteriorNodeLabelModel,
  License,
  PolylineEdgeStyle
} from '@yfiles/yfiles'
import GraphData from './resources/GraphData'
import { calculateCriticalPathEdges, runLayout } from './CriticalPathHelper'
import { createDemoNodeStyle, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * Runs this demo.
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()

  initializeGraph(graphComponent)
  loadSampleGraph(graphComponent)

  // calculates the critical path and shows the results
  await calculateCriticalPathAndShowResult(graphComponent)
}

/**
 * Calculates the critical paths and shows the result.
 * @param graphComponent The given graphComponent
 */
async function calculateCriticalPathAndShowResult(graphComponent) {
  // runs the algorithms and marks the important nodes and edges using their tags
  calculateCriticalPathEdges(graphComponent)

  // changes the styles of the critical path edges and critical nodes
  showResult(graphComponent)

  // run the layout algorithm
  await runLayout(graphComponent)
}

/**
 * Changes the styles of the critical path edges and critical nodes based on the result of the rank
 * assignment algorithm.
 * @param graphComponent The given graphComponent
 */
function showResult(graphComponent) {
  const graph = graphComponent.graph
  // define some styles for marking the edges and the critical nodes
  const criticalStyle = new PolylineEdgeStyle({
    stroke: '2px #F26419',
    targetArrow: '#F26419 small triangle'
  })
  const tightStyle = new PolylineEdgeStyle({
    stroke: '2px #4281A4',
    targetArrow: '#4281A4 small triangle'
  })
  const slackStyle = new PolylineEdgeStyle({
    stroke: '2px #6C4F77',
    targetArrow: '#6C4F77 small triangle'
  })
  const criticalNodeStyle = createDemoNodeStyle()
  criticalNodeStyle.fill = '#C1C1C1'
  criticalNodeStyle.stroke = '2px #F26419'
  const startNodeStyle = createDemoNodeStyle('demo-palette-402')
  const finishNodeStyle = createDemoNodeStyle('demo-palette-403')

  graph.edges.forEach((edge) => {
    const sourceNode = edge.sourceNode
    const targetNode = edge.targetNode

    if (edge.tag.critical) {
      // change the style of the critical edge
      graph.setStyle(edge, criticalStyle)
      // change the style of its source/target nodes
      graph.setStyle(sourceNode, criticalNodeStyle)
      graph.setStyle(targetNode, criticalNodeStyle)
    } else {
      if (edge.tag.slack == 0) {
        graph.setStyle(edge, tightStyle)
      } else {
        graph.setStyle(edge, slackStyle)
      }
    }

    // change the style of the lowest/highest nodes and add the label to the last node with the total
    // time needed to complete the project
    if (sourceNode.tag.lowestNode) {
      graph.setStyle(sourceNode, startNodeStyle)
    } else if (targetNode.tag.highestNode) {
      graph.setStyle(targetNode, finishNodeStyle)
      graph.addLabel(
        targetNode,
        `Total: ${targetNode.tag.layerId}d`,
        new ExteriorNodeLabelModel({ margins: 5 }).createParameter('top')
      )
    }
  })
}

/**
 * Initializes the styles for the graph elements.
 * @param graphComponent The given graphComponent
 */
function initializeGraph(graphComponent) {
  const graph = graphComponent.graph

  // configure node/edge style defaults
  initDemoStyles(graph, { theme: 'demo-palette-58' })
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 3
  }).createRatioParameter()
}

/**
 * Loads the sample graph.
 * @param graphComponent The given graphComponent
 */
function loadSampleGraph(graphComponent) {
  const graph = graphComponent.graph
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: GraphData.nodes,
    id: 'id',
    tag: 'tag',
    layout: 'layout',
    labels: ['label']
  })

  builder.createEdgesSource({
    data: GraphData.edges,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    tag: 'tag',
    labels: ['label']
  })

  builder.buildGraph()

  // we add a label that shows the duration of each task
  graph.nodes.forEach((node) => {
    if (node.labels.get(0).text !== 'START' && node.labels.get(0).text !== 'FINISH') {
      graph.addLabel(node, `${node.tag.duration} d`, InteriorNodeLabelModel.CENTER)
    }
  })
}

run().then(finishLoading)
