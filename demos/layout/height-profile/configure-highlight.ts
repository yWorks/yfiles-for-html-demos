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
  GraphItemTypes,
  INode,
  NodeStyleDecorationInstaller,
  ShapeNodeStyle,
  StyleDecorationZoomPolicy
} from 'yfiles'
import { getWayPoint, NodeType } from './resources/TrekkingData'
import { addIconDescription, removeIconDescription } from './draw-icon-description'

/**
 * Configures the highlighting style for a hovered node and adds the associated description icon
 * if there is such an icon.
 */
export function configureHighlight(graphComponent: GraphComponent): void {
  // defines the highlight style for the nodes based on their type
  graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setFactory(
    node =>
      new NodeStyleDecorationInstaller({
        nodeStyle: new ShapeNodeStyle({
          fill: 'transparent',
          stroke: '1px solid #662b00',
          shape: getWayPoint(node)?.type === NodeType.LABEL ? 'round-rectangle' : 'ellipse'
        }),
        margins: 2,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED
      })
  )

  // configures hover input mode to highlight hovered nodes and to show the icon associated to
  // the hovered node
  const highlightManager = graphComponent.highlightIndicatorManager
  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  inputMode.itemHoverInputMode.enabled = true
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  inputMode.itemHoverInputMode.discardInvalidItems = false
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    const hoveredItem = evt.item
    // clear previous highlights and remove the description icon if there was one
    highlightManager.clearHighlights()
    removeIconDescription()

    if (hoveredItem instanceof INode) {
      // highlight the node and show its description icon if there is one
      highlightManager.addHighlight(hoveredItem)
      addIconDescription(graphComponent, hoveredItem)
    }
  })
}
