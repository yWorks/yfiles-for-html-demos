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
  type GraphComponent,
  type GraphEditorInputMode,
  GraphHighlightIndicatorManager,
  GraphItemTypes,
  GraphSelectionIndicatorManager,
  type IModelItem,
  IndicatorNodeStyleDecorator,
  INode,
  ShapeNodeStyle
} from 'yfiles'

export function initializeHighlights(graphComponent: GraphComponent): void {
  // highlight node style
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      wrapped: new ShapeNodeStyle({
        fill: 'transparent',
        stroke: '3px slateblue',
        shape: 'ellipse'
      }),
      zoomPolicy: 'mixed',
      padding: 2
    })
  })

  // selection node style
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      wrapped: new ShapeNodeStyle({
        fill: 'transparent',
        stroke: '3px darkblue',
        shape: 'ellipse'
      }),
      padding: 2,
      zoomPolicy: 'mixed'
    })
  })

  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  // configure the input mode to highlight nodes on hover
  const graphItemHoverInputMode = inputMode.itemHoverInputMode
  graphItemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  graphItemHoverInputMode.discardInvalidItems = false
  graphItemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    updateHighlights(graphComponent, evt.item, evt.oldItem)
  })

  const graph = graphComponent.graph
  graph.addNodeRemovedListener((_, evt) => {
    // if the node is removed, remove the highlights
    graphComponent.highlightIndicatorManager.removeHighlight(evt.item)
  })

  graph.addEdgeRemovedListener((_, evt) => {
    // if the edge is removed, remove the highlights
    graphComponent.highlightIndicatorManager.removeHighlight(evt.item)
  })
}

/**
 * Clears the previously highlighted element, if any, and highlights the new one.
 */
function updateHighlights(
  graphComponent: GraphComponent,
  item: IModelItem | null,
  oldItem: IModelItem | null
): void {
  const highlightManager = graphComponent.highlightIndicatorManager
  if (oldItem) {
    highlightManager.removeHighlight(oldItem)
  }
  if (item instanceof INode) {
    highlightManager.addHighlight(item)
  }
}
