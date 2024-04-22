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
  type GraphComponent,
  type GraphInputMode,
  GraphItemTypes,
  IEdge,
  type IEdgeStyle,
  type ILabelStyle,
  type IModelItem,
  INode,
  type INodeStyle
} from 'yfiles'

const cssHovering = 'hovering'
const cssLabelHidden = 'invisible'

/**
 * Adds or removes a CSS class to highlight the given item.
 */
async function highlightItem(
  graphComponent: GraphComponent,
  item: IModelItem | null,
  highlight: boolean
): Promise<void> {
  const graph = graphComponent.graph
  if (
    (item instanceof INode && supportsCssClass(item.style)) ||
    (item instanceof IEdge && supportsCssClass(item.style))
  ) {
    item.style.cssClass = highlight
      ? `${item.style.cssClass} ${cssHovering}`
      : item.style.cssClass.replace(` ${cssHovering}`, '')

    const label = item.labels.at(0)
    if (label && supportsCssClass(label.style)) {
      // update the label text with the current CSS rules of the owner
      graph.setLabelText(label, `.${item.style.cssClass.replaceAll(' ', '\n.')}`)

      // to animate the CSS class changes, we need to wait for the text to be updated
      // because this will rebuild the DOM of the label and thus break any CSS based animations here
      await graphComponent.updateVisualAsync()

      // the 'pure' cssClass property change (due to the awaited updateVisual) will only update the
      // CSS class on the label's DOM structure
      label.style.cssClass = highlight
        ? label.style.cssClass.replace(` ${cssLabelHidden}`, '')
        : `${label.style.cssClass} ${cssLabelHidden}`
    }
    graphComponent.invalidate()
  }
}

/**
 * Configures the {@link ItemHoverInputMode} of the {@link GraphInputMode} to add/remove CSS classes
 * on the currently hovered graph item.
 */
export function configureHoverHighlight(
  graphComponent: GraphComponent,
  mode: GraphInputMode
): void {
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  mode.itemHoverInputMode.discardInvalidItems = false
  mode.itemHoverInputMode.addHoveredItemChangedListener((_, { item, oldItem }) => {
    // the promise for both highlightItem calls can be ignored because it is merely a visual update
    void highlightItem(graphComponent, oldItem, false)
    void highlightItem(graphComponent, item, true)
    graphComponent.invalidate()
  })
}

function supportsCssClass<T extends IEdgeStyle | INodeStyle | ILabelStyle>(
  style: T
): style is T & { cssClass: string } {
  return 'cssClass' in style && typeof style.cssClass === 'string'
}
