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
  Arrow,
  EdgeStyleIndicatorRenderer,
  GraphItemTypes,
  IEdge,
  ILabel,
  INode,
  LabelStyleIndicatorRenderer,
  NodeStyleIndicatorRenderer,
  PolylineEdgeStyle,
  PortStyleIndicatorRenderer,
  ShapeNodeShape,
  ShapeNodeStyle,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'
import { CustomShapeNodeStyle } from './styles/CustomShapeNodeStyle'
import { getCompany, getRelationship } from './data-types'
import { CollapseExpandPortStyle } from '../orgchart/graph-style/CollapseExpandPortStyle'
/**
 * Enables the highlighting of the edges.
 * @param viewerInputMode The given input mode
 * @param graphComponent The given graphComponent
 */
export function enableHoverHighlights(viewerInputMode, graphComponent) {
  const decorator = graphComponent.graph.decorator
  // configures the highlighting style for the nodes
  decorator.nodes.highlightRenderer.addFactory((node) => {
    const shape =
      node.style instanceof CustomShapeNodeStyle
        ? highlightShapes.get(getCompany(node).nodeType)
        : ShapeNodeShape.RECTANGLE
    return new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({
        stroke: '2px #ab2346',
        fill: 'none',
        shape
      }),
      zoomPolicy: StyleIndicatorZoomPolicy.WORLD_COORDINATES,
      margins: 2
    })
  })
  // configures the highlighting style for the edges
  decorator.edges.highlightRenderer.addFactory(
    (edge) =>
      new EdgeStyleIndicatorRenderer({
        edgeStyle: new PolylineEdgeStyle({
          stroke: '3px #ab2346',
          targetArrow: new Arrow({
            type: 'triangle',
            stroke: '3px #ab2346',
            fill: '#ab2346'
          }),
          smoothingLength: getRelationship(edge).type === 'Hierarchy' ? 5 : 100
        }),
        zoomPolicy: StyleIndicatorZoomPolicy.WORLD_COORDINATES
      })
  )
  // configures the highlighting style for the ports
  decorator.ports.highlightRenderer.addFactory(
    (port) =>
      new PortStyleIndicatorRenderer({
        portStyle: port.style,
        zoomPolicy: StyleIndicatorZoomPolicy.WORLD_COORDINATES
      })
  )
  // configures the highlighting style for the labels
  decorator.labels.highlightRenderer.addFactory((label) => {
    const style = label.style.clone()
    style.backgroundStroke = '3px #ab2346'
    return new LabelStyleIndicatorRenderer({
      labelStyle: style,
      zoomPolicy: StyleIndicatorZoomPolicy.WORLD_COORDINATES,
      margins: 0
    })
  })
  // configures the hover input mode
  viewerInputMode.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL | GraphItemTypes.PORT
  viewerInputMode.itemHoverInputMode.enabled = true
  viewerInputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const highlights = graphComponent.highlights
    highlights.clear()
    if (evt.item) {
      if (evt.item instanceof INode) {
        const node = evt.item
        // highlight first the edges and their ports that are not adjacent to the 'hovered' node,
        // which will be highlighted afterwards, to make sure that its highlight lies
        // above the edge highlight
        graphComponent.graph.edgesAt(node).forEach((edge) => {
          highlightEdge(edge, highlights, false)
          highlightPorts(node === edge.sourceNode ? edge.targetNode : edge.sourceNode, highlights)
        })
        // highlight the hovered node and its ports
        highlights.add(node)
        highlightPorts(node, highlights)
      } else if (evt.item instanceof IEdge) {
        highlightEdge(evt.item, highlights)
      } else if (evt.item instanceof ILabel) {
        if (evt.item.owner instanceof IEdge) {
          highlightEdge(evt.item.owner, highlights)
        }
        highlights.add(evt.item)
      }
    }
  })
}
/**
 * Highlights the edge, the edge labels and the ports incident to the given edge.
 */
function highlightEdge(edge, highlights, highlightIncidentPorts = true) {
  // highlight the edge
  highlights.add(edge)
  // highlight the edge labels
  edge.labels.forEach((label) => {
    highlights.add(label)
  })
  if (highlightIncidentPorts) {
    // highlight the ports incident to the given edge
    highlightPorts(edge.sourceNode, highlights)
    highlightPorts(edge.targetNode, highlights)
  }
}
/**
 * Highlights the ports incident to the given node rendered by {@link CollapseExpandPortStyle}.
 */
function highlightPorts(node, highlights) {
  node.ports
    .filter((port) => port.style instanceof CollapseExpandPortStyle)
    .forEach((port) => {
      highlights.add(port)
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
