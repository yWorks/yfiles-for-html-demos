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
  EdgeStyleIndicatorRenderer,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  ILabel,
  INode,
  LabelStyle,
  LabelStyleIndicatorRenderer,
  NodeStyleIndicatorRenderer,
  ShapeNodeStyle,
  Stroke
} from '@yfiles/yfiles'
import { NonRibbonEdgeStyle } from './NonRibbonEdgeStyle'
/**
 * Creates the highlight manager for this demo and determines which items have to be highlighted
 * @param graphComponent The given graphComponent
 */
export function configureHighlight(graphComponent) {
  const decorator = graphComponent.graph.decorator
  decorator.nodes.highlightRenderer.addFactory((node) => {
    const style = node.style
    return new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({
        shape: style.shape,
        fill: style.fill,
        stroke: style.stroke
      }),
      zoomPolicy: 'world-coordinates',
      margins: 2
    })
  })
  decorator.edges.highlightRenderer.addConstant(
    new EdgeStyleIndicatorRenderer({
      edgeStyle: new NonRibbonEdgeStyle(5),
      zoomPolicy: 'world-coordinates'
    })
  )
  decorator.labels.highlightRenderer.addFactory((label) => {
    const style = label.style
    return new LabelStyleIndicatorRenderer({
      labelStyle: new LabelStyle({
        shape: style.shape,
        backgroundStroke: new Stroke(label.owner.style.fill, 2),
        backgroundFill: style.backgroundFill,
        textFill: style.textFill,
        horizontalTextAlignment: 'center',
        verticalTextAlignment: 'center'
      }),
      margins: 2,
      zoomPolicy: 'world-coordinates'
    })
  })
  const inputMode = graphComponent.inputMode
  inputMode.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const highlights = graphComponent.highlights
    highlights.clear()
    let item = evt.item
    if (!item) {
      return
    }
    if (evt.item instanceof ILabel) {
      item = evt.item.owner
    }
    const nodesToHighlight = new Set()
    if (item instanceof INode) {
      // highlight the adjacent edges,
      // and collect the adjacent nodes in a set to avoid duplicated node highlights
      graphComponent.graph.edgesAt(item).forEach((edge) => {
        highlights.add(edge)
        nodesToHighlight.add(edge.sourceNode)
        nodesToHighlight.add(edge.targetNode)
      })
      // add also the hovered node
      nodesToHighlight.add(item)
    } else if (item instanceof IEdge) {
      // highlight the edge and collect the source/target nodes
      highlights.add(item)
      nodesToHighlight.add(item.sourceNode)
      nodesToHighlight.add(item.targetNode)
    }
    // highlight the necessary nodes and their labels on top
    for (const node of nodesToHighlight) {
      highlights.add(node)
      node.labels.forEach((label) => {
        highlights.add(label)
      })
    }
  })
}
