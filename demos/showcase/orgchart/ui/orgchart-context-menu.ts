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
  type GraphComponent,
  type GraphInputMode,
  type IModelItem,
  INode,
  type PopulateItemContextMenuEventArgs
} from '@yfiles/yfiles'
import type { CollapsibleTree } from '../CollapsibleTree'

/**
 * Initializes the context menu.
 */
export function configureContextMenu(
  graphComponent: GraphComponent,
  orgChartGraph: CollapsibleTree
): void {
  const inputMode = graphComponent.inputMode as GraphInputMode

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  inputMode.addEventListener('populate-item-context-menu', (evt) => {
    populateContextMenu(graphComponent, orgChartGraph, evt)
  })
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 */
function populateContextMenu(
  graphComponent: GraphComponent,
  orgChartGraph: CollapsibleTree,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  const node = args.item

  // if we clicked on a node
  if (node instanceof INode) {
    graphComponent.currentItem = node
    // Create the context menu items
    const menuItems: { label: string; action: () => void }[] = []
    if (orgChartGraph.canExecuteHideParent(node)) {
      menuItems.push({ label: 'Hide Parent', action: () => orgChartGraph.executeHideParent(node) })
    }
    if (orgChartGraph.canExecuteShowParent(node)) {
      menuItems.push({ label: 'Show Parent', action: () => orgChartGraph.executeShowParent(node) })
    }

    if (orgChartGraph.canExecuteHideChildren(node)) {
      menuItems.push({
        label: 'Hide Children',
        action: () => orgChartGraph.executeHideChildren(node)
      })
    }
    if (orgChartGraph.canExecuteShowChildren(node)) {
      menuItems.push({
        label: 'Show Children',
        action: () => orgChartGraph.executeShowChildren(node)
      })
    }

    if (orgChartGraph.canExecuteShowAll()) {
      menuItems.push({ label: 'Show all', action: () => orgChartGraph.executeShowAll() })
    }

    if (menuItems.length > 0) {
      args.contextMenu = menuItems
    }
  } else {
    // no node has been hit
    if (orgChartGraph.canExecuteShowAll())
      args.contextMenu = [{ label: 'Show all', action: () => orgChartGraph.executeShowAll() }]
  }
}
