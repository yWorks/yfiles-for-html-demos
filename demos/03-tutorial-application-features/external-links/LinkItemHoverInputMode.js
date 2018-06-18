/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * This {@link yfiles.input.ItemHoverInputMode} will show a pointer cursor for external links and underline the link's
   * text to indicate a clickable link. It is configured to only do the highlighting when the CTRL modifier is pressed
   * and when there is an external link.
   * @class LinkItemHoverInputMode
   */
  class LinkItemHoverInputMode extends yfiles.input.ItemHoverInputMode {
    constructor() {
      super()
      this.priority = 54
      this.hoverCursor = 'pointer'
    }

    /**
     * It is only a valid hover when the CTRL modifier is active and there is actually a link that can be clicked.
     * @param {yfiles.graph.IModelItem} item - The item to check.
     * @returns {boolean}
     */
    isValidHoverItem(item) {
      if (
        this.inputModeContext.canvasComponent.lastMouseEvent.modifiers !==
        yfiles.view.ModifierKeys.CONTROL
      ) {
        return false
      }
      return !!this.getLabelLink(item)
    }

    /**
     * Toggles the underline text decoration for valid links.
     * @param {yfiles.input.HoveredItemChangedEventArgs} evt - The {@link yfiles.input.HoveredItemChangedEventArgs}
     *   instance containing the event data.
     */
    onHoveredItemChanged(evt) {
      const oldLabelLink = this.getLabelLink(evt.oldItem)
      const labelLink = this.getLabelLink(evt.item)

      // the toggle of underlined text should not be added to the undo queue
      const edit = this.inputModeContext.graph.beginEdit('LinkDecoration', 'LinkDecoration')

      if (oldLabelLink) {
        // re-apply the original style
        this.inputModeContext.graph.setStyle(
          oldLabelLink,
          this.inputModeContext.graph.nodeDefaults.labels.getStyleInstance(oldLabelLink.owner)
        )
      }

      if (labelLink) {
        // underline the text of the link
        const clone = labelLink.style.clone()
        clone.font = clone.font.createCopy({
          textDecoration: 'UNDERLINE'
        })
        this.inputModeContext.graph.setStyle(labelLink, clone)
      }

      // we cancel the edit to not add it to the undo queue
      edit.cancel()
    }

    /**
     * Returns the {@linke yfiles.graph.ILabel} that represents a link, otherwise null. Nodes and edges are checked for
     * any label that represents a link, too.
     * @param {yfiles.graph.IModelItem} item The item that should be checked for an external link.
     * @returns {yfiles.graph.ILabel} The label that represents a link or null.
     */
    getLabelLink(item) {
      let labelLink = null
      if (
        yfiles.graph.ILabel.isInstance(item) &&
        (item.text.startsWith('www.') || item.text.startsWith('http'))
      ) {
        labelLink = item
      } else if (yfiles.graph.INode.isInstance(item) || yfiles.graph.IEdge.isInstance(item)) {
        item.labels.forEach(label => {
          const text = label.text
          if (text.startsWith('www.') || text.startsWith('http')) {
            labelLink = label
          }
        })
      }
      return labelLink
    }
  }

  return LinkItemHoverInputMode
})
