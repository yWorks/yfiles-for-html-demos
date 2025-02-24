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
import './ContextMenuComponent.css'
import React, { ReactElement, useCallback, useLayoutEffect, useState } from 'react'
import {
  Command,
  GraphComponent,
  GraphViewerInputMode,
  IEdge,
  IModelItem,
  INode,
  PopulateItemContextMenuEventArgs,
  Rect
} from '@yfiles/yfiles'

interface ContextMenuItem {
  title: string
  action: () => void
}

interface ContextMenuProps {
  graphComponent: GraphComponent
}

export function ContextMenuComponent({ graphComponent }: ContextMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuLocation, setMenuLocation] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([])

  const populateContextMenu = useCallback(
    (args: PopulateItemContextMenuEventArgs<IModelItem>) => {
      const contextMenuItems: ContextMenuItem[] = []
      const item = args.item
      if (item instanceof INode || item instanceof IEdge) {
        contextMenuItems.push({
          title: 'Zoom to item',
          action: () => {
            // center the item in the viewport
            const targetBounds =
              item instanceof INode
                ? item.layout.toRect()
                : Rect.add(item.sourceNode.layout.toRect(), item.targetNode.layout.toRect())
            graphComponent.executeCommand(
              Command.ZOOM,
              targetBounds.getEnlarged(50 / graphComponent.zoom)
            )
          }
        })
      }

      setMenuItems(contextMenuItems)
      if (contextMenuItems.length > 0) {
        args.showMenu = true
      }
    },
    [graphComponent]
  )

  const runAction = useCallback((action: () => void) => {
    // run the given action of the clicked item
    action()
    // close the contextmenu afterward
    setMenuVisible(false)
  }, [])

  /**
   * Registers the context menu listeners.
   */
  useLayoutEffect(() => {
    // register the close listener
    const closeMenuListener = () => {
      setMenuVisible(false)
    }
    const inputMode = graphComponent.inputMode as GraphViewerInputMode
    inputMode.contextMenuInputMode.addEventListener('menu-closed', closeMenuListener)

    // register populate items listener
    const populateContextMenuListener = (evt: PopulateItemContextMenuEventArgs<IModelItem>) => {
      // select the item
      if (evt.item) {
        evt.showMenu = true
        setMenuLocation(
          graphComponent.viewToPageCoordinates(
            graphComponent.worldToViewCoordinates(evt.queryLocation)
          )
        )
        setMenuVisible(true)
        graphComponent.selection.clear()
        graphComponent.selection.add(evt.item)
      }
      // populate the menu
      populateContextMenu(evt)
    }
    inputMode.addEventListener('populate-item-context-menu', populateContextMenuListener)

    return () => {
      // cleanup
      inputMode.contextMenuInputMode.removeEventListener('menu-closed', closeMenuListener)
      inputMode.removeEventListener('populate-item-context-menu', populateContextMenuListener)
    }
  }, [graphComponent, populateContextMenu])

  let contextMenuItems: ReactElement[] = []
  if (menuVisible) {
    contextMenuItems = menuItems.map((item, i) => {
      return (
        <button onClick={() => runAction(item.action)} key={i}>
          {item.title}
        </button>
      )
    })
  }

  return (
    <div
      className="context-menu"
      style={{
        display: menuVisible && menuItems.length > 0 ? 'block' : 'none',
        left: menuLocation.x,
        top: menuLocation.y
      }}
    >
      {contextMenuItems}
    </div>
  )
}
