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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  Arrow,
  EdgeStyleIndicatorRenderer,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout,
  NodeStyleIndicatorRenderer,
  PolylineEdgeStyle,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import graphData from './graph-data.json'

// Enable hover effects on nodes and edges
const inputMode = new GraphEditorInputMode()
inputMode.itemHoverInputMode.enabled = true
inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

// Specify hover effect: the hovered item is added to the graph's highlight collection
inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
  graphComponent.highlights.clear()
  if (evt.item) {
    graphComponent.highlights.add(evt.item)
  }
})
graphComponent.inputMode = inputMode

// Define the visual styles for node and edge highlights
graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
  new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: 'rectangle',
      stroke: '3px #64a8be',
      fill: 'transparent'
    }),
    margins: 4 // Padding between the actual node and its highlight visualization
  })
)
graphComponent.graph.decorator.edges.highlightRenderer.addConstant(
  new EdgeStyleIndicatorRenderer({
    edgeStyle: new PolylineEdgeStyle({
      smoothingLength: 50,
      targetArrow: new Arrow({ type: 'triangle', stroke: '2px #64a8be', fill: '#64a8be' }),
      stroke: '3px #64a8be'
    })
  })
)

// Populate the graph with data from the JSON dataset and apply layout
demoApp.buildGraphFromJson(graphData)
await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0)
