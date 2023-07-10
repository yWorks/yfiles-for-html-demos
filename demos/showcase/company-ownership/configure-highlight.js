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
  Arrow,
  DefaultLabelStyle,
  EdgeStyleDecorationInstaller,
  GraphItemTypes,
  IEdge,
  ILabel,
  INode,
  LabelStyleDecorationInstaller,
  NodeStyleDecorationInstaller,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  StyleDecorationZoomPolicy
} from 'yfiles'
import { CustomShapeNodeStyle } from './styles/CustomShapeNodeStyle.js'
import { getCompany, getRelationship } from './data-types.js'

/**
 * Enables the highlighting of the edges.
 * @param {!GraphViewerInputMode} viewerInputMode The given input mode
 * @param {!GraphComponent} graphComponent The given graphComponent
 */
export function enableHoverHighlights(viewerInputMode, graphComponent) {
  // render ports and labels above the highlight group
  graphComponent.graphModelManager.portGroup.above(graphComponent.highlightGroup)
  graphComponent.graphModelManager.edgeLabelGroup.above(graphComponent.highlightGroup)

  // configures the highlighting style for the edges
  const decorator = graphComponent.graph.decorator
  decorator.nodeDecorator.highlightDecorator.setFactory(node => {
    const shape =
      node.style instanceof CustomShapeNodeStyle
        ? highlightShapes.get(getCompany(node).nodeType)
        : ShapeNodeShape.RECTANGLE
    return new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        stroke: '2px #ab2346',
        fill: 'none',
        shape
      }),
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES,
      margins: 2
    })
  })
  decorator.edgeDecorator.highlightDecorator.setFactory(
    edge =>
      new EdgeStyleDecorationInstaller({
        edgeStyle: new PolylineEdgeStyle({
          stroke: '3px #ab2346',
          targetArrow: new Arrow({
            type: 'triangle',
            stroke: '3px #ab2346',
            fill: '#ab2346'
          }),
          smoothingLength: getRelationship(edge).type === 'Hierarchy' ? 5 : 100
        }),
        zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
      })
  )

  // configures the highlighting style for the labels
  decorator.labelDecorator.highlightDecorator.setImplementation(
    new LabelStyleDecorationInstaller({
      labelStyle: new DefaultLabelStyle({
        backgroundStroke: '3px #ab2346',
        shape: 'round-rectangle',
        backgroundFill: 'transparent',
        textFill: 'transparent'
      }),
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES,
      margins: 1
    })
  )

  // configures the hover input mode
  viewerInputMode.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
  viewerInputMode.itemHoverInputMode.enabled = true
  viewerInputMode.itemHoverInputMode.discardInvalidItems = false
  viewerInputMode.itemHoverInputMode.addHoveredItemChangedListener((sender, evt) => {
    const highlightIndicatorManager = graphComponent.highlightIndicatorManager
    highlightIndicatorManager.clearHighlights()
    if (evt.item) {
      highlightIndicatorManager.addHighlight(evt.item)
      if (evt.item instanceof INode) {
        graphComponent.graph.edgesAt(evt.item).forEach(edge => {
          highlightIndicatorManager.addHighlight(edge)
          edge.labels.forEach(label => {
            highlightIndicatorManager.addHighlight(label)
          })
        })
      } else if (evt.item instanceof IEdge) {
        evt.item.labels.forEach(label => {
          highlightIndicatorManager.addHighlight(label)
        })
      } else if (evt.item instanceof ILabel) {
        const owner = evt.item.owner
        if (owner instanceof IEdge) {
          highlightIndicatorManager.addHighlight(owner)
        }
      }
    }
  })
}

export const highlightShapes = new Map([
  ['Corporation', ShapeNodeShape.RECTANGLE],
  ['CTB', ShapeNodeShape.RECTANGLE],
  ['Partnership', ShapeNodeShape.TRIANGLE],
  ['RCTB', ShapeNodeShape.RECTANGLE],
  ['Branch', ShapeNodeShape.ELLIPSE],
  ['Disregarded', ShapeNodeShape.RECTANGLE],
  ['Dual Resident', ShapeNodeShape.RECTANGLE],
  ['Multiple', ShapeNodeShape.RECTANGLE],
  ['Trust', ShapeNodeShape.DIAMOND],
  ['Individual', ShapeNodeShape.ELLIPSE],
  ['Third Party', ShapeNodeShape.RECTANGLE],
  ['PE_Risk', ShapeNodeShape.ELLIPSE],
  ['Trapezoid', ShapeNodeShape.RECTANGLE]
])
