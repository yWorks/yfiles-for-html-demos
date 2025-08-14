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
  EdgeStyleIndicatorRenderer,
  GraphItemTypes,
  IEdge,
  ILabel,
  LabelStyle,
  LabelStyleIndicatorRenderer,
  Stroke,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'
import { getEdgeColor, getLabelColor } from '../styles-support'
import { getVoterShift } from '../data-types'

/**
 * Configures the edge and label highlighting for this demo.
 */
export function initializeHighlight(graphComponent) {
  const graph = graphComponent.graph
  // set a BezierEdgeStyle for the edge highlighting with the color and thickness of the associated edge
  graph.decorator.edges.highlightRenderer.addFactory(
    (edge) =>
      new EdgeStyleIndicatorRenderer({
        edgeStyle: new BezierEdgeStyle({
          stroke: new Stroke(getEdgeColor(edge), getVoterShift(edge).thickness)
        }),
        zoomPolicy: StyleIndicatorZoomPolicy.WORLD_COORDINATES
      })
  )
  // set a highlighting style for the labels
  graph.decorator.labels.highlightRenderer.addFactory(
    (label) =>
      new LabelStyleIndicatorRenderer({
        labelStyle: new LabelStyle({
          shape: 'pill',
          backgroundStroke: new Stroke(getLabelColor(label), 2),
          textFill: 'black',
          backgroundFill: 'white',
          padding: 4,
          horizontalTextAlignment: 'center',
          verticalTextAlignment: 'center'
        }),
        zoomPolicy: StyleIndicatorZoomPolicy.WORLD_COORDINATES
      })
  )

  // initialize the input mode so that the highlight occurs when an edge or an edge label is being hovered
  const mode = graphComponent.inputMode
  mode.itemHoverInputMode.enabled = true
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
  mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    // remove all previous highlighting
    const highlights = graphComponent.highlights
    highlights.clear()

    const item = evt.item
    if (item instanceof IEdge) {
      // when an edge is being hovered, highlight first the edge and then its associated labels,
      // so that the label highlighting stays above the edge highlighting
      highlights.add(item)
      item.labels.forEach((label) => {
        highlights.add(label)
      })
    } else if (item instanceof ILabel) {
      // when a label is being hovered, highlight first its associated edge and then the label,
      // so that the label highlighting stays above the edge highlighting
      highlights.add(item.owner)
      highlights.add(item)
    }
  })

  // when a label text changes or a label is added to an edge, clear all previous highlighting for
  // cosmetic reasons
  mode.editLabelInputMode.addEventListener('label-edited', async () => {
    graphComponent.highlights.clear()
  })

  mode.addEventListener('label-added', async () => {
    graphComponent.highlights.clear()
  })
}
