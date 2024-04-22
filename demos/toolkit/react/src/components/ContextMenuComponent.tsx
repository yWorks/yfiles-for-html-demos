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
import './ContextMenuComponent.css'
import { ReactElement, useCallback, useLayoutEffect, useState } from 'react'
import {
  GraphComponent,
  GraphViewerInputMode,
  ICommand,
  IEdge,
  IModelItem,
  INode,
  PopulateItemContextMenuEventArgs,
  Rect
} from 'yfiles'
import { BrowserDetection } from 'demo-utils/BrowserDetection.ts'

interface ContextMenuItem {
  title: string
  action: () => void
}

interface ContextMenuProps {
  graphComponent: GraphComponent
}

/**
 * Helper function to determine the page's center location.
 */
function getCenterInPage(element: HTMLElement): { x: number; y: number } {
  let left = element.clientWidth / 2.0
  let top = element.clientHeight / 2.0
  while (element.offsetParent) {
    left += element.offsetLeft
    top += element.offsetTop
    element = element.offsetParent as HTMLElement
  }
  return { x: left, y: top }
}

export function ContextMenuComponent({ graphComponent }: ContextMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuLocation, setMenuLocation] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([])

  const openContextMenu = useCallback(
    (location: { x: number; y: number }) => {
      const worldLocation = graphComponent.toWorldFromPage(location)
      const showMenu = (
        graphComponent.inputMode as GraphViewerInputMode
      ).contextMenuInputMode.shouldOpenMenu(worldLocation)
      if (showMenu) {
        setMenuLocation(location)
        setMenuVisible(true)
      }
    },
    [graphComponent]
  )

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
                : Rect.add(item.sourceNode!.layout.toRect(), item.targetNode!.layout.toRect())
            ICommand.ZOOM.execute(
              targetBounds.getEnlarged(50 / graphComponent.zoom),
              graphComponent
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
    const componentDiv = graphComponent.div
    const contextMenuListener = (evt: MouseEvent) => {
      evt.preventDefault()
      openContextMenu({ x: evt.pageX, y: evt.pageY })
    }

    // Listen for the contextmenu event
    // Note: On Linux based systems (e.g. Ubuntu), the contextmenu event is fired on mouse down
    // which triggers the ContextMenuInputMode before the ClickInputMode. Therefore handling the
    // event, will prevent the ItemRightClicked event from firing.
    // For more information, see https://docs.yworks.com/yfileshtml/#/kb/article/780/
    componentDiv.addEventListener('contextmenu', contextMenuListener, false)

    if (BrowserDetection.safariVersion > 0 || BrowserDetection.iOSVersion > 0) {
      // Additionally add a long press listener especially for iOS, since it does not fire the contextmenu event.
      let contextMenuTimer: ReturnType<typeof setTimeout> | undefined
      graphComponent.addTouchDownListener((_, evt) => {
        contextMenuTimer = setTimeout(() => {
          openContextMenu(
            graphComponent.toPageFromView(graphComponent.toViewCoordinates(evt.location))
          )
        }, 500)
      })
      graphComponent.addTouchUpListener(() => {
        clearTimeout(contextMenuTimer!)
      })
    }

    // Listen to the context menu key to make it work in Chrome
    const contextMenuKeyListener = (evt: KeyboardEvent) => {
      if (evt.key === 'ContextMenu') {
        evt.preventDefault()
        openContextMenu(getCenterInPage(componentDiv))
      }
    }
    componentDiv.addEventListener('keyup', contextMenuKeyListener)

    // register the close listener
    const closeMenuListener = () => {
      setMenuVisible(false)
    }
    const inputMode = graphComponent.inputMode as GraphViewerInputMode
    inputMode.contextMenuInputMode.addCloseMenuListener(closeMenuListener)

    // register populate items listener
    const populateContextMenuListener = (
      _: GraphViewerInputMode,
      args: PopulateItemContextMenuEventArgs<IModelItem>
    ) => {
      // select the item
      if (args.item) {
        graphComponent.selection.clear()
        graphComponent.selection.setSelected(args.item, true)
      }
      // populate the menu
      populateContextMenu(args)
    }
    inputMode.addPopulateItemContextMenuListener(populateContextMenuListener)

    return () => {
      // cleanup
      componentDiv.removeEventListener('contextmenu', contextMenuListener)
      componentDiv.removeEventListener('keyup', contextMenuKeyListener)
      inputMode.contextMenuInputMode.removeCloseMenuListener(closeMenuListener)
      inputMode.removePopulateItemContextMenuListener(populateContextMenuListener)
    }
  }, [graphComponent, openContextMenu, populateContextMenu])

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
