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

define(['yfiles/view-component', './DemoStyles.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  demoStyles
) => {
  /**
   * Input mode that highlights the shortest path to the single source when hovering over a marked node or edge.
   */
  class HighlightHoverInputMode extends yfiles.input.ItemHoverInputMode {
    /**
     * Changes the node/edge styles when the hovered item changes.
     * @param {yfiles.input.HoveredItemChangedEventArgs} hoveredItemChangedEventArgs The current event.
     */
    onHoveredItemChanged(hoveredItemChangedEventArgs) {
      const item = hoveredItemChangedEventArgs.item
      const oldItem = hoveredItemChangedEventArgs.oldItem
      const graph = this.inputModeContext.canvasComponent.graph

      // reset the changes on the style of the previously hovered item
      if (
        yfiles.graph.INode.isInstance(oldItem) &&
        graph.contains(oldItem) &&
        oldItem.style instanceof demoStyles.SingleColorNodeStyle
      ) {
        if (oldItem && oldItem.tag && oldItem.tag.singleSource) {
          this.changeStyles(oldItem, false)
        }
      } else if (
        yfiles.graph.IEdge.isInstance(oldItem) &&
        graph.contains(oldItem) &&
        oldItem.style instanceof demoStyles.SingleColorEdgeStyle
      ) {
        const oldNode = oldItem.targetNode
        if (oldNode && oldNode.tag && oldNode.tag.singleSource) {
          this.changeStyles(oldNode, false)

          const oldSourceElement = window.document.getElementById(
            `node${oldItem.sourceNode.tag.id}`
          )
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
        yfiles.graph.INode.isInstance(item) &&
        graph.contains(item) &&
        item.style instanceof demoStyles.SingleColorNodeStyle
      ) {
        if (item && item.tag && item.tag.singleSource) {
          this.changeStyles(item, true)
        }
      } else if (
        yfiles.graph.IEdge.isInstance(item) &&
        graph.contains(item) &&
        item.style instanceof demoStyles.SingleColorEdgeStyle
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
     * @param {yfiles.graph.IModelItem} item The changed item.
     * @param {boolean} hovered The hovered state of the item.
     */
    changeStyles(item, hovered) {
      const graph = this.inputModeContext.canvasComponent.graph

      // calculate the shortest path between the item and the single source
      const adapter = new yfiles.layout.YGraphAdapter(graph)
      const cost = this.getCosts(graph)
      const source = adapter.getCopiedNode(item.tag.singleSource)
      const sink = adapter.getCopiedNode(item)
      let pathEdges = yfiles.algorithms.ShortestPaths.singleSourceSingleSink(
        adapter.yGraph,
        source,
        sink,
        false,
        cost
      )
      pathEdges = adapter.createEdgeEnumerable(pathEdges)

      // change css-classes of all items in the path
      pathEdges.forEach(edge => {
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
            sourceElement.setAttribute(
              'class',
              hovered ? 'path-highlight-hovered' : 'path-highlight'
            )
          }
        }

        const targetNode = edge.targetNode
        if (targetNode.tag) {
          const targetElement = window.document.getElementById(`node${targetNode.tag.id}`)
          if (targetElement !== null) {
            targetElement.setAttribute(
              'class',
              hovered ? 'path-highlight-hovered' : 'path-highlight'
            )
          }
        }
      })
    }

    /**
     * Returns an array with costs for each edge. All marked edges have the same weight. Non-marked edges have
     * infinite costs because they must not be part of a highlighted path.
     * @param {yfiles.graph.IGraph} graph The graph that contains the edges.
     * @returns {Array} The array with the costs for each edge.
     */
    getCosts(graph) {
      const costs = []
      graph.edges.forEach((edge, index) => {
        if (edge.style instanceof demoStyles.SingleColorEdgeStyle) {
          costs[index] = 1
        } else {
          costs[index] = Number.POSITIVE_INFINITY
        }
      })
      return costs
    }
  }

  return HighlightHoverInputMode
})
