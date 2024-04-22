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
import type {
  GraphComponent,
  GraphInputMode,
  IEdge,
  IEdgeStyle,
  ILabelStyle,
  INode,
  INodeStyle
} from 'yfiles'

const cssSelected = 'selected'
const cssConnected = `connected`

/**
 * Adds or removes CSS classes on the given node and its connected items to highlight these elements.
 */
function highlightConnectedItems({ graph, selection }: GraphComponent): void {
  for (const node of graph.nodes) {
    if (supportsCssClass(node.style)) {
      const baseCssClass = getBaseCssClass(node.style.cssClass)

      if (selection.isSelected(node)) {
        // selected nodes
        node.style.cssClass = `${baseCssClass} ${cssSelected}`
      } else if (graph.neighbors(node).some((n) => selection.isSelected(n))) {
        // nodes adjacent to a selected node
        node.style.cssClass = `${baseCssClass} ${cssConnected}`
      } else {
        // anything else
        node.style.cssClass = baseCssClass
      }
    }
  }
  for (const edge of graph.edges) {
    if (supportsCssClass(edge.style)) {
      const baseCssClass = getBaseCssClass(edge.style.cssClass)

      const hasSelectedNode =
        selection.isSelected(edge.sourceNode!) || selection.isSelected(edge.targetNode!)

      edge.style.cssClass = hasSelectedNode ? `${baseCssClass} ${cssSelected}` : baseCssClass
    }
  }
  for (const label of graph.labels) {
    if (supportsCssClass(label.style)) {
      const owner = label.owner as INode | IEdge
      if (supportsCssClass(owner.style)) {
        graph.setLabelText(label, `.${owner.style.cssClass.replace(/ /g, '\n.')}`)
      }
    }
  }
  graph.invalidateDisplays()
}

/**
 * Adds a selection changed listener to add/remove CSS classes on the currently selected items.
 */
export function configureSelectionHighlight(
  graphComponent: GraphComponent,
  inputMode: GraphInputMode
): void {
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false
  // Schedule an update to the style's CSS classes, as those reflect the selection state
  inputMode.addMultiSelectionFinishedListener(() => {
    highlightConnectedItems(graphComponent)

    // propagate the selection state to the GraphComponent to easily fade out any non-selected items
    if (graphComponent.selection.size > 0) {
      graphComponent.div.classList.add('focus-selection')
    } else {
      graphComponent.div.classList.remove('focus-selection')
    }
  })
}

function supportsCssClass<T extends IEdgeStyle | INodeStyle | ILabelStyle>(
  style: T
): style is T & { cssClass: string } {
  return 'cssClass' in style && typeof style.cssClass === 'string'
}

function getBaseCssClass(cssClass: string): string {
  return cssClass.replace(` ${cssConnected}`, '').replace(` ${cssSelected}`, '')
}
