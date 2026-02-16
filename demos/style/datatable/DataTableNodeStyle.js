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
import { HtmlVisual, NodeStyleBase } from '@yfiles/yfiles'
import { DataTableRenderSupport, RenderDataCache } from './DataTableRenderSupport'

/**
 * A node style to display data in a tabular fashion.
 * This style uses the {@link HtmlVisual}s to
 * render an HTML table as the node's visualization.
 */
export class DataTableNodeStyle extends NodeStyleBase {
  renderSupport = new DataTableRenderSupport()

  createVisual(context, node) {
    // Cache the necessary data for rendering of the node
    const cache = new RenderDataCache(node.tag)
    // build the container
    const container = document.createElement('div')
    // create the visual
    const visual = HtmlVisual.from(container, cache)
    // populate the contents
    this.createContent(context, visual)
    HtmlVisual.setLayout(visual.element, node.layout)
    return visual
  }

  updateVisual(context, oldVisual, node) {
    this.updateContent(context, node, oldVisual)
    HtmlVisual.setLayout(oldVisual.element, node.layout)
    return oldVisual
  }

  createContent(context, visual) {
    const div = visual.element
    const cache = visual.tag

    // show scroll bars when node is smaller than the HTML table
    div.style.overflow = 'auto'
    div.classList.add('thin-scrollbars')

    // Prevent event propagation for the mousewheel event, otherwise it will be captured by the graph
    // component, which calls preventDefault on it.
    const stopPropagationOptions = { capture: true, passive: true }
    for (const eventName of ['mousewheel', 'wheel']) {
      div.addEventListener(
        eventName,
        DataTableNodeStyle.createStopPropagationListenerForScrolling(div),
        stopPropagationOptions
      )
    }

    // Render the node
    this.renderSupport.render(div, cache, 'data-table-node')
  }

  updateContent(context, node, visual) {
    const container = visual.element

    // Get the data with which the oldvisual was created
    const oldCache = visual.tag
    // Get the data for the new visual
    const newCache = new RenderDataCache(node.tag)

    // The data changed, create a new visual
    if (!newCache.equals(oldCache)) {
      while (container.lastChild) {
        // remove all children
        container.removeChild(container.lastChild)
      }
      this.renderSupport.render(container, newCache, 'data-table-node')
    }

    visual.tag = newCache
  }

  /**
   * Detects whether the given element has the need for a scrollbar, i.e., it shows as scrollbar
   * in overflow: auto mode.
   */
  static needsScrollbar(element) {
    const isVerticalScrollbar = element.scrollHeight > element.clientHeight
    const isHorizontalScrollbar = element.scrollWidth > element.clientWidth
    return isHorizontalScrollbar || isVerticalScrollbar
  }

  /**
   * Returns an event listener that stops event propagation if the element can be scrolled itself.
   */
  static createStopPropagationListenerForScrolling(element) {
    return (evt) => {
      if (DataTableNodeStyle.needsScrollbar(element)) {
        evt.stopImmediatePropagation()
      }
    }
  }
}
