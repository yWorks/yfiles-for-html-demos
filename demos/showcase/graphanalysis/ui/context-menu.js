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
import { IEdge, INode } from '@yfiles/yfiles'
import { getCurrentAlgorithm } from './ui-utils'
import { copyAndReplaceTag, getTag } from '../demo-types'
import { applyAlgorithm } from '../algorithms/algorithms'

/**
 * Initializes the context menu.
 */
export function initializeContextMenu(inputMode, graphComponent) {
  inputMode.addEventListener('populate-item-context-menu', (evt) =>
    populateContextMenu(graphComponent, evt)
  )
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 */
function populateContextMenu(graphComponent, args) {
  updateSelection(graphComponent.selection, args.item)

  const currentAlgorithm = getCurrentAlgorithm()

  const needsStartNodes = currentAlgorithm.needsStartNodes ?? false
  const needsEndNodes = currentAlgorithm.needsEndNodes ?? false
  if (!needsStartNodes && !needsEndNodes) {
    return
  }

  // get the item which is located at the mouse position
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation).toArray()
  // use the first hit node
  const hitNode = hits.find((hit) => hit instanceof INode) ?? null
  const selection = graphComponent.selection
  if (hitNode) {
    selection.add(hitNode)
  }

  const selectedNodes = selection.nodes
  if (selectedNodes.size === 0) {
    return
  }

  const menuItems = []
  if (needsStartNodes) {
    menuItems.push({
      label: 'Mark as Start Node',
      action: () => {
        // clear previous start nodes
        graphComponent.graph.nodes.forEach((node) => {
          if (getTag(node)?.type === 'start') {
            const tag = copyAndReplaceTag(node)
            delete tag.type
          }
        })

        if (!needsEndNodes) {
          // just mark one node
          const tag = copyAndReplaceTag(hitNode || selectedNodes.first())
          tag.type = 'start'
        } else {
          selectedNodes.forEach((node) => {
            const tag = copyAndReplaceTag(node)
            tag.type = 'start'
          })
        }

        applyAlgorithm(graphComponent.graph)
        selectedNodes.clear()
      }
    })
  }
  if (needsEndNodes) {
    menuItems.push({
      label: 'Mark as End Node',
      action: () => {
        graphComponent.graph.nodes.forEach((node) => {
          // clear previous end nodes
          if (getTag(node)?.type === 'end') {
            const tag = copyAndReplaceTag(node)
            delete tag.type
          }
        })

        selectedNodes.forEach((node) => {
          const tag = copyAndReplaceTag(node)
          tag.type = 'end'
        })
        applyAlgorithm(graphComponent.graph)
      }
    })
  }

  // finally, if there is at least one menu item set them to the context menu
  if (menuItems.length > 0) {
    args.contextMenu = menuItems
  }
}

/**
 * Updates the selection when an item is right-clicked for a context menu.
 */
function updateSelection(selection, item) {
  if (!item) {
    selection.clear()
  } else if (!selection.includes(item)) {
    selection.clear()
    selection.add(item)
  } else {
    if (item instanceof IEdge) {
      selection.nodes.clear()
    } else {
      selection.edges.clear()
    }
    selection.add(item)
  }
}
