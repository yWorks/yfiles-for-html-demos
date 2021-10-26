/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { createApp, defineComponent, onMounted } from 'vue'
import {
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  IModelItem,
  INode,
  MouseHoverInputMode,
  Point,
  QueryItemToolTipEventArgs,
  TimeSpan,
  ToolTipQueryEventArgs
} from 'yfiles'
import Tooltip from '@/components/Tooltip.vue'

export function useTooltips(getGraphComponent: () => GraphComponent) {
  let graphComponent: GraphComponent
  onMounted(() => {
    graphComponent = getGraphComponent()
    register(graphComponent.inputMode as GraphViewerInputMode | GraphEditorInputMode)
  })

  /**
   * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
   * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
   * GraphEditorInputMode using the
   * {@link ToolTipQueryEventArgs} parameter.
   * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
   * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
   * whether the tooltip was already set by one of possibly several tooltip providers. The
   * QueryLocation property contains the mouse position for the query in world coordinates.
   * The tooltip is set by setting the ToolTip property.
   */
  function register(inputMode: GraphEditorInputMode | GraphViewerInputMode): void {
    // show tooltips only for nodes and edges
    inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener(
      (
        src: GraphEditorInputMode | GraphViewerInputMode,
        args: QueryItemToolTipEventArgs<IModelItem>
      ) => {
        if (args.handled) {
          // Tooltip content has already been assigned -> nothing to do.
          return
        }

        // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
        args.toolTip = createContent(args.item!)

        // Indicate that the tooltip content has been set.
        args.handled = true
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
      const label = item.labels.firstOrDefault()
      content = label ? `Label: "${label.text}"` : 'Label: Unlabeled'
    } else if (item instanceof IEdge) {
      // there should be only nodes and edges due to inputMode.tooltipItems
      const sourceLabel = item.sourceNode!.labels.firstOrDefault()
      const targetLabel = item.targetNode!.labels.firstOrDefault()
      content = `Connecting ${(sourceLabel && sourceLabel.text) || 'Unlabeled'} with ${
        (targetLabel && targetLabel.text) || 'Unlabeled'
      }`
    }

    const vueTooltip = (defineComponent as any)({
      extends: Tooltip,
      data() {
        return {
          title,
          content
        }
      }
    })

    const root = document.createElement('div')
    createApp(vueTooltip).mount(root)
    return root.firstElementChild as HTMLElement
  }

  return {
    register
  }
}
