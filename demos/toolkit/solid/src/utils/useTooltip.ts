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
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  IModelItem,
  INode,
  QueryItemToolTipEventArgs,
  Point,
  TimeSpan
} from '@yfiles/yfiles'
import { render } from 'solid-js/web'
import { Tooltip } from '../components/Tooltip'

export function useTooltips(graphComponent: GraphComponent) {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode

  // show tooltips for nodes and edges
  inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

  // customize the tooltip's behaviour to our liking.
  const tooltipInputMode = inputMode.toolTipInputMode
  tooltipInputMode.toolTipLocationOffset = new Point(15, 15)
  tooltipInputMode.delay = TimeSpan.fromMilliseconds(500)
  tooltipInputMode.duration = TimeSpan.fromSeconds(5)

  // Register a listener for when a tooltip should be shown.
  inputMode.addEventListener(
    'query-item-tool-tip',
    (
      evt: QueryItemToolTipEventArgs<IModelItem>,
      src: GraphEditorInputMode | GraphViewerInputMode
    ) => {
      if (evt.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      evt.toolTip = createContent(evt.item!)

      // Indicate that the tooltip content has been set.
      evt.handled = true
    }
  )
}

/**
 * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter by using a dynamically compiled Vue component.
 */
function createContent(item: IModelItem): HTMLElement | null {
  const title = item instanceof INode ? 'Node Tooltip' : 'Edge Tooltip'
  let content = ''

  if (item instanceof INode) {
    const label = item.labels.at(0)
    content = label ? `Label: "${label.text}"` : 'Label: Unlabeled'
  } else if (item instanceof IEdge) {
    // there should be only nodes and edges due to inputMode.tooltipItems
    const sourceLabel = item.sourceNode.labels.at(0)
    const targetLabel = item.targetNode.labels.at(0)
    content = `Connecting ${(sourceLabel && sourceLabel.text) || 'Unlabeled'} with ${
      (targetLabel && targetLabel.text) || 'Unlabeled'
    }`
  }

  const root = document.createElement('div')
  render(() => Tooltip({ title: title, content: content }), root)
  return root
}
