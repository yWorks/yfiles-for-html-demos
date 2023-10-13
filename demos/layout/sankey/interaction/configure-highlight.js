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
  BezierEdgeStyle,
  DefaultLabelStyle,
  EdgeStyleDecorationInstaller,
  GraphItemTypes,
  IEdge,
  ILabel,
  LabelStyleDecorationInstaller,
  Stroke,
  StyleDecorationZoomPolicy
} from 'yfiles'
import { getEdgeColor, getLabelColor } from '../styles-support.js'
import { getVoterShift } from '../data-types.js'

/**
 * Configures the edge and label highlighting for this demo.
 * @param {!GraphComponent} graphComponent
 */
export function initializeHighlight(graphComponent) {
  const graph = graphComponent.graph
  // set a BezierEdgeStyle for the edge highlighting with the color and thickness of the associated edge
  graph.decorator.edgeDecorator.highlightDecorator.setFactory(
    edge =>
      new EdgeStyleDecorationInstaller({
        edgeStyle: new BezierEdgeStyle({
          stroke: new Stroke(getEdgeColor(edge), getVoterShift(edge).thickness)
        }),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
  )
  // set a highlighting style for the labels
  graph.decorator.labelDecorator.highlightDecorator.setFactory(
    label =>
      new LabelStyleDecorationInstaller({
        labelStyle: new DefaultLabelStyle({
          shape: 'pill',
          backgroundStroke: new Stroke(getLabelColor(label), 2),
          textFill: 'black',
          backgroundFill: 'white',
          insets: 4,
          horizontalTextAlignment: 'center',
          verticalTextAlignment: 'center'
        }),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
  )

  // initialize the input mode so that the highlight occurs when an edge or an edge label is being hovered
  const mode = graphComponent.inputMode
  mode.itemHoverInputMode.enabled = true
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
  mode.itemHoverInputMode.discardInvalidItems = false
  mode.itemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    const highlightManager = graphComponent.highlightIndicatorManager
    // remove all previous highlighting
    highlightManager.clearHighlights()

    const item = evt.item
    if (item instanceof IEdge) {
      // when an edge is being hovered, highlight first the edge and then its associated labels,
      // so that the label highlighting stays above the edge highlighting
      highlightManager.addHighlight(item)
      item.labels.forEach(label => {
        highlightManager.addHighlight(label)
      })
    } else if (item instanceof ILabel) {
      // when a label is being hovered, highlight first its associated edge and then the label,
      // so that the label highlighting stays above the edge highlighting
      highlightManager.addHighlight(item.owner)
      highlightManager.addHighlight(item)
    }
  })

  // when a label text changes or a label is added to an edge, clear all previous highlighting for
  // cosmetic reasons
  mode.addLabelTextChangedListener(async () => {
    graphComponent.highlightIndicatorManager.clearHighlights()
  })

  mode.addLabelAddedListener(async () => {
    graphComponent.highlightIndicatorManager.clearHighlights()
  })
}
