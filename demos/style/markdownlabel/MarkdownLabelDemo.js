/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  Font,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HorizontalTextAlignment,
  IGraph,
  InteriorStretchLabelModel,
  LayoutExecutor,
  License,
  OrthogonalEdgeEditingContext,
  OrthogonalLayout,
  PolylineEdgeStyle,
  Size,
  SmartEdgeLabelModel,
  TextWrapping
} from 'yfiles'

import { MarkdownLabelStyle } from './MarkdownLabelStyle.js'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/**
 * Simple demo that shows how to use MarkupLabelStyle to render labels.
 * The label text shows how to create headings, strong and emphasis text and line breaks,
 * and also how to style those elements using inline CSS.
 * The stylesheet CSS shows how to style label elements using external CSS.
 * The label style uses interactive text wrapping, which means you can resize nodes interactively,
 * and the label text will be wrapped at word boundaries.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize graph component
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext()
  })

  const graph = graphComponent.graph
  // set the defaults for nodes
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px solid #66a3e0',
    targetArrow: '#66a3e0 x-large triangle',
    smoothingLength: 30
  })
  graph.nodeDefaults.size = new Size(385, 250)
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
    autoRotation: false
  }).createDefaultParameter()

  // node labels get markup label support
  const font = new Font('Verdana,sans-serif', 12)
  graph.nodeDefaults.labels.style = new MarkdownLabelStyle({
    font: font,
    horizontalTextAlignment: HorizontalTextAlignment.LEFT,
    backgroundFill: '#fff',
    backgroundStroke: '3px #66a3e0',
    wrapping: TextWrapping.WORD_ELLIPSIS,
    insets: [10]
  })
  graph.edgeDefaults.labels.style = new MarkdownLabelStyle({
    font: font,
    backgroundFill: '#fff',
    backgroundStroke: '2px #66a3e0',
    insets: [5]
  })

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(new OrthogonalLayout({ integratedEdgeLabeling: true }))
  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
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
      data: graphData.nodeList,
      id: item => item.id
    })
    .nodeCreator.createLabelBinding(item => item.label)

  graphBuilder
    .createEdgesSource({
      data: graphData.edgeList,
      sourceId: item => item.source,
      targetId: item => item.target
    })
    .edgeCreator.createLabelBinding(item => item.label)

  graphBuilder.buildGraph()
}

run().then(finishLoading)
