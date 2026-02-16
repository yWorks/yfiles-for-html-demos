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
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  License,
  SnappableItems
} from '@yfiles/yfiles'

import { createDemoShapeNodeStyle, initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { SnapCircleProvider } from './SnapCircleProvider'
import { CircleSnapResultProvider } from './CircleSnapResultProvider'

import graphData from './resources/circle-snapping.json'

/**
 * Runs the demo.
 */
async function run() {
  License.value = licenseData

  // initialize graph component
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowCreateEdge: false,
    showHandleItems: 'none'
  })

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // enable circular snapping for nodes
  initializeCircularSnapping(graphComponent)

  // build a sample graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  void graphComponent.fitGraphBounds()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList,
    id: (item) => item.id,
    layout: (item) => item.layout
  })

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Configures snapping in a way that is suited to circular/radial arrangements of child nodes
 * around parent nodes.
 */
function initializeCircularSnapping(graphComponent) {
  const inputMode = graphComponent.inputMode
  inputMode.snapContext = new GraphSnapContext({
    snapDistance: 20,
    snappableItems: SnappableItems.NODE,
    considerNodeLabelAllNodeLabelsDistanceSnapping: false,
    collectNodePairCenterSnapLines: false,
    collectNodePairSegmentSnapLines: false,
    considerNodeLabelOwnerDistanceSnapping: false,
    considerNodeLabelOwnerLabelsDistanceSnapping: false,
    collectNodePairSnapLines: false,
    considerEdgeLabelOwnerDistanceSnapping: false,
    considerEdgeLabelOwnerLabelsDistanceSnapping: false,
    collectNodeSizes: false,
    collectEdgeSnapReferences: false,
    collectPortSnapReferences: false,
    considerEdgeLabelOwnerPathSnapping: false,
    considerEdgeLabelAllEdgeLabelsDistanceSnapping: false,
    considerInitialLabelLocationSnapping: false,
    considerPortLabelOwnerLocationSnapping: false
  })

  const nodeDecorator = graphComponent.graph.decorator.nodes
  nodeDecorator.snapReferenceProvider.addFactory((node) => new SnapCircleProvider(node))
  nodeDecorator.snapResultProvider.addConstant(new CircleSnapResultProvider())
}

/**
 * Configures the graph item style defaults for this demo.
 * @param graph The graph.
 */
function initializeGraph(graph) {
  initDemoStyles(graph)
  graph.nodeDefaults.style = createDemoShapeNodeStyle('ellipse')
}

run().then(finishLoading)
