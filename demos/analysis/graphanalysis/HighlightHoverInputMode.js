/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  HoveredItemChangedEventArgs,
  IEdge,
  INode,
  ItemHoverInputMode,
  ShortestPath
} from 'yfiles'
import { SingleColorEdgeStyle, SingleColorNodeStyle } from './DemoStyles.js'

/**
 * Input mode that highlights the shortest path to the single source when hovering over a marked node or edge.
 */
export class HighlightHoverInputMode extends ItemHoverInputMode {
  /**
   * Changes the node/edge styles when the hovered item changes.
   * @param {!HoveredItemChangedEventArgs} hoveredItemChangedEventArgs The current event.
   */
  onHoveredItemChanged(hoveredItemChangedEventArgs) {
    if (!this.inputModeContext) {
      return
    }

    const item = hoveredItemChangedEventArgs.item
    const oldItem = hoveredItemChangedEventArgs.oldItem
    const graph = this.inputModeContext.canvasComponent.graph

    // reset the changes on the style of the previously hovered item
    if (
      oldItem instanceof INode &&
      graph.contains(oldItem) &&
      oldItem.style instanceof SingleColorNodeStyle
    ) {
      if (oldItem && oldItem.tag && oldItem.tag.singleSource) {
        this.changeStyles(oldItem, false)
      }
    } else if (
      oldItem instanceof IEdge &&
      graph.contains(oldItem) &&
      oldItem.style instanceof SingleColorEdgeStyle
    ) {
      const oldNode = oldItem.targetNode
      if (oldNode && oldNode.tag && oldNode.tag.singleSource) {
        this.changeStyles(oldNode, false)

        const oldSourceElement = window.document.getElementById(`node${oldItem.sourceNode.tag.id}`)
        if (oldSourceElement !== null) {
          oldSourceElement.setAttribute('class', 'path-highlight')
        }
        const oldEdgeElement = window.document.getElementById(`edge${oldItem.tag.id}path`)
        if (oldEdgeElement !== null) {
          oldEdgeElement.setAttribute('class', 'single-colored-edge')
        }
      }
    }

    // change the style of the currently hovered item
    if (
      item instanceof INode &&
      graph.contains(item) &&
      item.style instanceof SingleColorNodeStyle
    ) {
      if (item && item.tag && item.tag.singleSource) {
        this.changeStyles(item, true)
      }
    } else if (
      item instanceof IEdge &&
      graph.contains(item) &&
      item.style instanceof SingleColorEdgeStyle
    ) {
      const node = item.targetNode
      if (node && node.tag && node.tag.singleSource) {
        this.changeStyles(node, true)

        const sourceElement = window.document.getElementById(`node${item.sourceNode.tag.id}`)
        if (sourceElement !== null) {
          sourceElement.setAttribute('class', 'path-highlight-hovered')
        }
        const edgeElement = window.document.getElementById(`edge${item.tag.id}path`)
        if (edgeElement !== null) {
          edgeElement.setAttribute('class', 'single-colored-edge-hovered')
        }
      }
    }
  }

  /**
   * Changes the css-style class for the hovered/non-hovered item.
   * @param {!INode} item The changed item.
   * @param {boolean} hovered The hovered state of the item.
   */
  changeStyles(item, hovered) {
    if (!this.inputModeContext) {
      return
    }
    const graph = this.inputModeContext.canvasComponent.graph

    // calculate the shortest path between the item and the single source
    const result = new ShortestPath({
      directed: false,
      costs: edge => (edge.style instanceof SingleColorEdgeStyle ? 1 : Number.POSITIVE_INFINITY),
      source: item.tag.singleSource,
      sink: item
    }).run(graph)

    // change css-classes of all items in the path
    result.edges.forEach(edge => {
      if (edge.tag) {
        const path = window.document.getElementById(`edge${edge.tag.id}path`)
        if (path !== null) {
          path.setAttribute(
            'class',
            hovered ? 'single-colored-edge-hovered' : 'single-colored-edge'
          )
        }
      }

      const sourceNode = edge.sourceNode
      if (sourceNode.tag) {
        const sourceElement = window.document.getElementById(`node${sourceNode.tag.id}`)
        if (sourceElement !== null) {
          sourceElement.setAttribute('class', hovered ? 'path-highlight-hovered' : 'path-highlight')
        }
      }

      const targetNode = edge.targetNode
      if (targetNode.tag) {
        const targetElement = window.document.getElementById(`node${targetNode.tag.id}`)
        if (targetElement !== null) {
          targetElement.setAttribute('class', hovered ? 'path-highlight-hovered' : 'path-highlight')
        }
      }
    })
  }
}
