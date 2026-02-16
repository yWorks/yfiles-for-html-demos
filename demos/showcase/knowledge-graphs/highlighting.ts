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
  Color,
  Cursor,
  EdgeStyleIndicatorRenderer,
  type GraphComponent,
  type GraphEditorInputMode,
  GraphItemTypes,
  type IEdge,
  type ILabel,
  INode,
  type LabelStyle,
  LabelStyleIndicatorRenderer,
  NodeStyleIndicatorRenderer,
  Stroke,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import { getEdgeTag, getLabelTag, getNodeTag } from './types'
import { getEdgeStyle, isVirtual } from './styles/graph-styles'
import {
  edgeLabelThreshold,
  nodeLabelThreshold,
  toggleLabelVisibility
} from './label-level-of-detail-rendering'

/**
 * Configures visual highlighting and hover behavior for graph items.
 *
 * @param graphComponent - The graph component to configure
 */
export function configureHighlighting(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  // Configures custom highlight renderers for graph items.
  graph.decorator.nodes.highlightRenderer.addFactory((node) => {
    if (getNodeTag(node).virtual) {
      return null
    }
    const strokeColor = Color.from((node.style as WebGLShapeNodeStyle).stroke.color)
    return new NodeStyleIndicatorRenderer({
      nodeStyle: new WebGLShapeNodeStyle({
        stroke: new Stroke(strokeColor, 4),
        fill: 'transparent',
        shape: 'ellipse',
        effect: 'ambient-stroke-color'
      }),
      zoomPolicy: 'mixed',
      margins: 5
    })
  })

  graph.decorator.edges.highlightRenderer.addFactory(
    (edge) => new EdgeStyleIndicatorRenderer({ edgeStyle: getEdgeStyle(edge), zoomPolicy: 'mixed' })
  )

  graph.decorator.labels.highlightRenderer.addFactory((label) => {
    if (isTextualLabel(label)) {
      const style = label.style as LabelStyle
      return new LabelStyleIndicatorRenderer({ labelStyle: style, zoomPolicy: 'world-coordinates' })
    }
    return null
  })

  // Configures hover behavior including cursor, item detection, and label visibility.
  const mode = graphComponent.inputMode as GraphEditorInputMode
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  mode.itemHoverInputMode.hoverCursor = Cursor.POINTER
  mode.itemHoverInputMode.ignoreInvalidItems = true

  mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    if (evt.item && isVirtual(evt.item)) {
      return
    }

    const graph = graphComponent.graph
    const highlights = graphComponent.highlights
    // Clear any previous highlights
    highlights.clear()

    if (evt.item) {
      const item = evt.item as INode | IEdge
      if (isItemVisible(item)) {
        // Highlight adjacent edges and their labels
        if (item instanceof INode) {
          graph.edgesAt(item).forEach((edge) => {
            if (isItemVisible(edge)) {
              highlights.add(edge)
              edge.labels.forEach((label) => {
                highlights.add(label)
              })
            }
          })
        }
        // Highlight the item and its labels
        highlights.add(item)
        item.labels.forEach((label) => {
          highlights.add(label)
        })
      }
    }
  })
}

/**
 * Toggles the visibility of the labels of the edges that are adjacent to the given node.
 * @param graphComponent - The graphComponent
 * @param node - The reference node
 * @param visible - True if the labels should be visible, false otherwise
 */
export function toggleAdjacentEdgeLabels(
  graphComponent: GraphComponent,
  node: INode,
  visible: boolean
): void {
  if (!isItemVisible(node)) {
    return
  }
  const zoom = graphComponent.zoom
  const graph = graphComponent.graph
  if (zoom < edgeLabelThreshold) {
    graph.edgesAt(node).forEach((edge) => {
      toggleLabelVisibility(graph, edge.labels.filter(isTextualLabel), visible)
    })
  }
}

/**
 * Toggles the visibility of the labels of the given node or edge.
 * @param graphComponent - The graphComponent
 * @param item - The reference item
 * @param visible - True if the labels should be visible, false otherwise
 */
export function toggleItemLabels(
  graphComponent: GraphComponent,
  item: INode | IEdge,
  visible: boolean
): void {
  if (!isItemVisible(item)) {
    return
  }
  const zoom = graphComponent.zoom
  const graph = graphComponent.graph
  const threshold = item instanceof INode ? nodeLabelThreshold : edgeLabelThreshold
  if (zoom < threshold) {
    toggleLabelVisibility(graph, item.labels.filter(isTextualLabel), visible)
  }
}

/**
 * Checks whether the label is a text label.
 * @param label - The given label
 */
export function isTextualLabel(label: ILabel): boolean {
  return getLabelTag(label).type === 'text'
}

/**
 * Checks whether an item is visible, i.e., not faded-out.
 * @param item - The item to check
 */
function isItemVisible(item: INode | IEdge): boolean {
  const tag = item instanceof INode ? getNodeTag(item) : getEdgeTag(item)
  return tag.visible ? tag.visible : true
}
