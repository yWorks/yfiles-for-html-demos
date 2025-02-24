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
  Font,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HorizontalTextAlignment,
  IGraph,
  LayoutExecutor,
  License,
  MarkupLabelStyle,
  OrthogonalLayout,
  PolylineEdgeStyle,
  Size,
  SmartEdgeLabelModel,
  StretchNodeLabelModel,
  TextWrapping
} from '@yfiles/yfiles'

import { MarkdownLabelStyle } from './MarkdownLabelStyle'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'

/**
 * Simple demo that shows how to use MarkupLabelStyle to render labels.
 * The label text shows how to create headings, strong and emphasis text and line breaks,
 * and also how to style those elements using inline CSS.
 * The stylesheet CSS shows how to style label elements using external CSS.
 * The label style uses interactive text wrapping, which means you can resize nodes interactively,
 * and the label text will be wrapped at word boundaries.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize graph component
  const graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()

  const graph = graphComponent.graph
  // set the defaults for nodes
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px solid #66a3e0',
    targetArrow: '#66a3e0 x-large triangle',
    smoothingLength: 30,
    orthogonalEditing: true
  })
  graph.nodeDefaults.size = new Size(385, 250)
  graph.nodeDefaults.labels.layoutParameter = StretchNodeLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
    autoRotation: false
  }).createParameterFromSource(0)

  // node labels get markup label support
  const font = new Font('Verdana,sans-serif', 12)
  graph.nodeDefaults.labels.style = new MarkdownLabelStyle(
    new MarkupLabelStyle({
      font: font,
      horizontalTextAlignment: HorizontalTextAlignment.LEFT,
      backgroundFill: '#fff',
      backgroundStroke: '3px #66a3e0',
      wrapping: TextWrapping.WRAP_WORD_ELLIPSIS,
      padding: [10]
    })
  )
  graph.edgeDefaults.labels.style = new MarkdownLabelStyle(
    new MarkupLabelStyle({
      font: font,
      backgroundFill: '#fff',
      backgroundStroke: '2px #66a3e0',
      padding: [5]
    })
  )

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new OrthogonalLayout())
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList,
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

run().then(finishLoading)
