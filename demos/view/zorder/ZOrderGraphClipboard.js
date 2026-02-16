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
import { GraphClipboard, HashMap, INode, List } from '@yfiles/yfiles'

/**
 *  A {@link GraphClipboard} that tries to store the z-order of cut, copied or duplicated nodes and to apply
 *  them for the corresponding duplicated or pasted nodes.
 */
export class ZOrderGraphClipboard extends GraphClipboard {
  zOrderSupport
  clipboardZOrders = new Map()
  newClipboardItems = new List()
  graphComponent

  constructor(zOrderSupport) {
    super()
    this.zOrderSupport = zOrderSupport
    this.graphComponent = zOrderSupport.graphComponent
    this.toClipboardCopier.addEventListener('node-copied', this.onCopiedToClipboard.bind(this))
    this.fromClipboardCopier.addEventListener('node-copied', this.onCopiedFromClipboard.bind(this))
    this.duplicateCopier.addEventListener('node-copied', this.onCopiedFromClipboard.bind(this))

    this.addEventListener('items-pasting', this.beforePaste.bind(this))
    this.addEventListener('items-pasted', this.afterPaste.bind(this))
    this.addEventListener('items-duplicated', this.afterDuplicate.bind(this))
  }

  onCopiedToClipboard(evt) {
    // transfer relative z-order from original node to the copy in the clipboard graph
    this.clipboardZOrders.set(evt.copy, this.getClipboardZOrder(evt.original))
  }

  onCopiedFromClipboard(evt) {
    // store new node to use in ArrangeItems
    this.newClipboardItems.add(evt.copy)
    // transfer relative z-order from node in the clipboard graph to the new node
    this.clipboardZOrders.set(evt.copy, this.getClipboardZOrder(evt.original))
  }

  /**
   * Returns the z-order previously stored for the `node`.
   * The z-order stored in the {@link ZOrderSupport} is used as fallback for items currently not in the view.
   */
  getClipboardZOrder(node) {
    const zOrder = this.clipboardZOrders.get(node)
    return zOrder != null ? zOrder : this.zOrderSupport.getZOrder(node)
  }

  onCopy(copyContext, targetRootNode, itemCopiedCallback) {
    // store the relative z-order for cut or copied items
    this.storeInitialZOrder(copyContext)
    super.onCopy(copyContext, targetRootNode, itemCopiedCallback)
  }

  onDuplicate(duplicateContext, itemDuplicatedCallback) {
    // collect new items in the OnItemCopiedFromClipboard callbacks
    this.newClipboardItems.clear()
    // store the relative z-order for duplicated items
    this.storeInitialZOrder(duplicateContext)
    super.onDuplicate(duplicateContext, itemDuplicatedCallback)
  }

  beforePaste(_evt) {
    // collect new items in the OnCopiedFromClipboard callbacks
    this.newClipboardItems.clear()
  }

  afterPaste(_evt) {
    const targetGraph = this.graphComponent.graph
    // set final z-orders of newItems depending on their new parent group
    this.arrangeItems(this.newClipboardItems, targetGraph.foldingView)
  }

  afterDuplicate(_evt) {
    const sourceGraph = this.graphComponent.graph
    // set final z-orders of newItems depending on their new parent group
    this.arrangeItems(this.newClipboardItems, sourceGraph.foldingView)
  }

  storeInitialZOrder(copyContext) {
    // determine the view items involved in the clipboard operation and sort them by their visual z-order
    const items = copyContext.allViewItems.ofType(INode).toList()
    if (items.size > 1) {
      items.sort(this.zOrderSupport.nodeComparison)
    }
    this.clipboardZOrders.clear()
    const foldingView = copyContext.sourceFoldingView
    for (let i = 0; i < items.size; i++) {
      // in case of folding store relative z-order for master item as it will be used by the GraphCopier
      const item = foldingView ? foldingView.getMasterItem(items.get(i)) : items.get(i)
      this.clipboardZOrders.set(item, i)
    }
  }

  arrangeItems(newMasterItems, foldingView) {
    // sort new items by the relative z-order transferred in onCopiedFromClipboard
    newMasterItems.sort(
      (node1, node2) => this.getClipboardZOrder(node1) - this.getClipboardZOrder(node2)
    )
    const gmm = this.graphComponent.graphModelManager

    // group new nodes by common parent render tree groups of their main render tree element
    const itemsNotInView = new List()
    const groupToItems = new HashMap()
    for (const masterItem of newMasterItems) {
      const viewItem = foldingView ? foldingView.getViewItem(masterItem) : masterItem
      if (!viewItem) {
        // new item is not in view (e.g. child of a collapsed folder node)
        itemsNotInView.add(masterItem)
      } else {
        const rte = gmm.getMainRenderTreeElement(viewItem)
        if (!rte) {
          itemsNotInView.add(masterItem)
        } else {
          const rteGroup = rte.parent
          let newNodesInGroup = groupToItems.get(rteGroup)
          if (!newNodesInGroup) {
            newNodesInGroup = new List()
            groupToItems.set(rteGroup, newNodesInGroup)
          }
          newNodesInGroup.add(viewItem)
        }
      }
    }
    // set z-order items not in view just in ascending order
    for (let i = 0; i < itemsNotInView.size; i++) {
      this.zOrderSupport.setZOrder(itemsNotInView.get(i), i)
    }

    // for each common parent set ascending z-orders for new nodes
    for (const groupItemsPair of groupToItems) {
      const itemsInGroup = groupItemsPair.value

      // find the top-most node that wasn't just added and lookup its z-order
      let topNodeNotJustAdded = null
      let walker = groupItemsPair.key.lastChild
      while (walker) {
        const node = gmm.getModelItem(walker)
        if (node && !itemsInGroup.includes(node)) {
          topNodeNotJustAdded = node
          break
        }
        walker = walker.previousSibling
      }
      let nextZOrder = topNodeNotJustAdded ? this.getClipboardZOrder(topNodeNotJustAdded) + 1 : 0

      // set new z-orders starting from nextZOrder
      for (const node of itemsInGroup) {
        this.zOrderSupport.setZOrder(node, nextZOrder++)
      }
      // update the view using the new z-orders
      for (const node of itemsInGroup) {
        this.zOrderSupport.update(node)
      }
    }
  }
}
