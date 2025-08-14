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
import { onMounted, reactive, toRef, watch } from 'vue'
import {
  Command,
  GraphComponent,
  GraphEditorInputMode,
  type GraphInputMode,
  GraphViewerInputMode,
  IEdge,
  IModelItem,
  INode,
  Point,
  PopulateItemContextMenuEventArgs,
  Rect
} from '@yfiles/yfiles'

export type MenuItem = { title: string; action: () => void }
export type Location = { x: number; y: number }

export function useContextMenu(getGraphComponent: () => GraphComponent) {
  // data needed in the context menu' component
  const data = reactive({ items: [] as MenuItem[], location: { x: 0, y: 0 }, display: false })

  let graphComponent: GraphComponent
  onMounted(() => {
    graphComponent = getGraphComponent()
    register(graphComponent.inputMode as GraphViewerInputMode | GraphEditorInputMode)
  })

  // close the context menu when display has been set to false
  watch(toRef(data, 'display'), (value) => {
    if (!value) {
      close()
    }
  })

  /**
   * Registers the context menu on the current input mode.
   */
  function register(inputMode: GraphInputMode): void {
    inputMode.addEventListener(
      'populate-item-context-menu',
      (evt: PopulateItemContextMenuEventArgs<IModelItem>) => {
        if (evt.item) {
          evt.showMenu = true
          open(
            graphComponent.viewToPageCoordinates(
              graphComponent.worldToViewCoordinates(evt.queryLocation)
            )
          )
          // select the item
          graphComponent.selection.clear()
          graphComponent.selection.add(evt.item)
        }
        populate(evt.item)
      }
    )

    inputMode.contextMenuInputMode.addEventListener('menu-closed', () => hide())
  }

  /**
   * Populates the context menu depending on the given graph item.
   */
  function populate(item: IModelItem | null): void {
    function getBounds(item: INode | IEdge) {
      return item instanceof INode
        ? item.layout.toRect()
        : Rect.add(item.sourceNode.layout.toRect(), item.targetNode.layout.toRect())
    }

    const contextMenuItems = []
    if (item instanceof INode || item instanceof IEdge) {
      contextMenuItems.push({
        title: 'Zoom to item',
        action: () => {
          // center the item in the viewport
          let targetBounds = getBounds(item)
          targetBounds = targetBounds.getEnlarged(50 / graphComponent.zoom)
          graphComponent.executeCommand(Command.ZOOM, targetBounds)
        }
      })
    }
    data.items = contextMenuItems
  }

  function hide(): void {
    data.display = false
  }

  function open(location: Point): void {
    data.display = true
    data.location = { x: location.x, y: location.y }
  }

  function close(): void {
    const inputMode = graphComponent.inputMode as GraphEditorInputMode | GraphViewerInputMode
    inputMode.contextMenuInputMode.closeMenu()
  }

  return { data, register, hide }
}
