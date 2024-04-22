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
  Font,
  FreeEdgeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  HierarchicLayoutEdgeLayoutDescriptor,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  HorizontalTextAlignment,
  IGraph,
  InteriorStretchLabelModel,
  LayoutExecutor,
  License,
  MarkupLabelStyle,
  OrthogonalEdgeEditingContext,
  PolylineEdgeStyle,
  Size,
  TextWrapping
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { RichTextEditorInputMode } from './RichTextEditorInputMode'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent

/**
 * Simple demo that shows how to use MarkupLabelStyle to render labels.
 * The label text shows how to create headings, strong and emphasis text and line breaks,
 * and also how to style those elements using inline CSS.
 * The stylesheet CSS shows how to style label elements using external CSS.
 * The label style uses interactive text wrapping, which means you can resize nodes interactively
 * and the label text will be wrapped at word boundaries.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    // provide a WYSIWYG editor for the MarkupLabelStyle
    textEditorInputMode: new RichTextEditorInputMode()
  })

  const graph = graphComponent.graph
  // set the defaults for nodes
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(400, 200)
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px solid #66a3e0',
    targetArrow: new Arrow({
      stroke: '2px solid #66a3e0',
      fill: '#eee',
      scale: 2,
      type: 'circle',
      cropLength: 2
    })
    // smoothingLength: 30
  })

  // node labels get markup label support
  const font = new Font('"Segoe UI", Arial', 12)
  graph.nodeDefaults.labels.style = new MarkupLabelStyle({
    font: font,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER,
    backgroundFill: '#fff',
    backgroundStroke: '3px #66a3e0',
    wrapping: TextWrapping.WORD_ELLIPSIS,
    insets: [10, 10]
  })
  graph.edgeDefaults.labels.style = new MarkupLabelStyle({ font: font })

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({
      automaticEdgeGrouping: true,
      minimumLayerDistance: 150,
      edgeLayoutDescriptor: new HierarchicLayoutEdgeLayoutDescriptor({
        minimumLastSegmentLength: 75,
        routingStyle: new HierarchicLayoutRoutingStyle(HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL)
      })
    })
  )
  graphComponent.fitGraphBounds()

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
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

run().then(finishLoading)
