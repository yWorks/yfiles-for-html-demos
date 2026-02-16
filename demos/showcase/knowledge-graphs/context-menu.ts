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
  type GraphEditorInputMode,
  IEdge,
  INode,
  type PopulateContextMenuEventArgs
} from '@yfiles/yfiles'
import { getEdgeTag, getNodeTag } from './types'
import { mergeDuplicates, removeElement } from './analysis/handle-problematic-data'

/**
 * Configures the context menu for graph items based on their problem status.
 *
 * @param graphComponent - The graph component to configure
 */
export function configureContentMenu(graphComponent: GraphComponent): void {
  const mode = graphComponent.inputMode as GraphEditorInputMode

  mode.addEventListener('populate-item-context-menu', (evt) => {
    const item = evt.item
    if (item instanceof INode) {
      handleNodeContextMenu(evt, item, graphComponent)
    } else if (item instanceof IEdge) {
      handleEdgeContextMenu(evt, item, graphComponent)
    }
  })
}

/**
 * Builds and sets context menu items for a node based on its problem type.
 *
 * @param evt - The context menu event
 * @param node - The node that was right-clicked
 * @param graphComponent - The graph component
 */
function handleNodeContextMenu(
  evt: PopulateContextMenuEventArgs,
  node: INode,
  graphComponent: GraphComponent
): void {
  const problem = getNodeTag(node).problem
  if (!problem) return

  const menuItems = []

  if (problem.type === 'duplicate') {
    menuItems.push({
      label: 'Remove Duplicates',
      action: () => mergeDuplicates(graphComponent, node)
    })
  } else if (problem.type === 'isolatedNode') {
    menuItems.push({
      label: 'Remove Isolated Node',
      action: () => removeElement(graphComponent, node)
    })
  }

  if (menuItems.length > 0) {
    evt.contextMenu = menuItems
  }
}

/**
 * Builds and sets context menu items for an edge based on its problem type.
 *
 * @param evt - The context menu event
 * @param edge - The edge that was right-clicked
 * @param graphComponent - The graph component
 */
function handleEdgeContextMenu(
  evt: PopulateContextMenuEventArgs,
  edge: IEdge,
  graphComponent: GraphComponent
): void {
  const menuItems = []

  if (getEdgeTag(edge).problem?.type === 'danglingEdge') {
    menuItems.push({
      label: 'Remove Dangling Edge',
      action: () => removeElement(graphComponent, edge)
    })
  }

  if (menuItems.length > 0) {
    evt.contextMenu = menuItems
  }
}
