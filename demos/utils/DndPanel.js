/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component'], yfiles => {
  /**
   * A palette of sample nodes. Users can drag and drop the nodes from this palette to a graph control.
   */
  class DragAndDropPanel {
    /**
     * Create a new style panel in the given element.
     * @param {HTMLElement} div The element that will display the palette items.
     * @param {boolean} passiveSupported Whether or not the browser supports active and passive event listeners.
     */
    constructor(div, passiveSupported) {
      this.divField = div
      this.$maxItemWidth = 150
      this.passiveSupported = !!passiveSupported
      this.$copyNodeLabels = true
    }

    /**
     * The main element of this panel.
     */
    get div() {
      return this.divField
    }

    set div(div) {
      this.divField = div
    }

    /**
     * The desired maximum width of each item. This value is used to decide whether or not a
     * visualization must be scaled down.
     */
    get maxItemWidth() {
      return this.$maxItemWidth
    }

    set maxItemWidth(width) {
      this.$maxItemWidth = width
    }

    /**
     * A callback that is called then the user presses the mouse button on an item.
     * It should start the actual drag and drop operation.
     */
    get beginDragCallback() {
      return this.$beginDragCallback
    }

    set beginDragCallback(callback) {
      this.$beginDragCallback = callback
    }

    /**
     * Whether the labels of the DnD node visual should be transferred to the created node or discarded.
     * @returns {Boolean}
     */
    get copyNodeLabels() {
      return this.$copyNodeLabels
    }

    set copyNodeLabels(value) {
      this.$copyNodeLabels = value
    }

    /**
     * Adds the items provided by the given factory to this palette.
     * This method delegates the creation of the visualization of each node
     * to createNodeVisual.
     */
    populatePanel(itemFactory) {
      if (!itemFactory) {
        return
      }

      // Create the nodes that specify the visualizations for the panel.
      const items = itemFactory()

      // Convert the nodes into plain visualizations
      const graphComponent = new yfiles.view.GraphComponent()
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const node = yfiles.graph.INode.isInstance(item) ? item : item.element
        const visual = this.createNodeVisual(item, graphComponent)
        this.addPointerDownListener(node, visual, this.beginDragCallback)
        this.div.appendChild(visual)
      }
    }

    /**
     * Creates an element that contains the visualization of the given node.
     * This method is used by populatePanel to create the visualization
     * for each node provided by the factory.
     * @return {HTMLDivElement}
     */
    createNodeVisual(original, graphComponent) {
      const graph = graphComponent.graph
      graph.clear()

      const originalNode = yfiles.graph.INode.isInstance(original) ? original : original.element
      const node = graph.createNode(
        originalNode.layout.toRect(),
        originalNode.style,
        originalNode.tag
      )
      originalNode.labels.forEach(label => {
        graph.addLabel(
          node,
          label.text,
          label.layoutParameter,
          label.style,
          label.preferredSize,
          label.tag
        )
      })
      originalNode.ports.forEach(port => {
        graph.addPort(node, port.locationParameter, port.style, port.tag)
      })
      this.updateViewport(graphComponent)

      const exporter = new yfiles.view.SvgExport(graphComponent.contentRect)
      exporter.margins = new yfiles.geometry.Insets(5)

      exporter.scale = exporter.calculateScaleForWidth(
        Math.min(this.maxItemWidth, graphComponent.contentRect.width)
      )
      const element = exporter.exportSvg(graphComponent)

      // Firefox does not display the SVG correctly because of the clip - so we remove it.
      element.removeAttribute('clip-path')
      return this.wrapNodeVisual(element, original.tooltip)
    }

    updateViewport(graphComponent) {
      const graph = graphComponent.graph
      let viewport = yfiles.geometry.Rect.EMPTY
      graph.nodes.forEach(node => {
        viewport = yfiles.geometry.Rect.add(viewport, node.layout.toRect())
        node.labels.forEach(label => {
          viewport = yfiles.geometry.Rect.add(viewport, label.layout.bounds)
        })
      })
      graph.edges.forEach(edge => {
        viewport = viewport.add(edge.sourcePort.location)
        viewport = viewport.add(edge.targetPort.location)
        edge.bends.forEach(bend => {
          viewport = viewport.add(bend.location)
        })
      })
      viewport = viewport.getEnlarged(2)
      graphComponent.contentRect = viewport
      graphComponent.zoomTo(viewport)
    }

    /**
     * Wraps the original visualization in an HTML element.
     * @return {HTMLDivElement}
     */
    wrapNodeVisual(nodeVisual, tooltip) {
      const div = document.createElement('div')
      div.setAttribute('class', 'demo-dndPanelItem')
      div.appendChild(nodeVisual)
      div.style.setProperty('width', nodeVisual.getAttribute('width'), '')
      div.style.setProperty('height', nodeVisual.getAttribute('height'), '')
      div.style.setProperty('touch-action', 'none')
      div.style.setProperty('cursor', 'grab', '')
      if (tooltip) {
        div.title = tooltip
      }
      return div
    }

    /**
     * Adds a mousedown listener to the given element that starts the drag operation.
     */
    addPointerDownListener(node, element, callback) {
      if (!callback) {
        return
      }

      // the actual drag operation
      const doDragOperation = () => {
        if (
          typeof yfiles.graph.IStripe !== 'undefined' &&
          yfiles.graph.IStripe.isInstance(node.tag)
        ) {
          // If the dummy node has a stripe as its tag, we use the stripe directly
          // This allows StripeDropInputMode to take over
          callback(element, node.tag)
        } else if (
          yfiles.graph.ILabel.isInstance(node.tag) ||
          yfiles.graph.IPort.isInstance(node.tag)
        ) {
          callback(element, node.tag)
        } else {
          // Otherwise, we just use the node itself and let (hopefully) NodeDropInputMode take over
          const simpleNode = new yfiles.graph.SimpleNode()
          simpleNode.layout = node.layout
          simpleNode.style = node.style.clone()
          simpleNode.tag = node.tag
          simpleNode.labels = this.$copyNodeLabels
            ? node.labels
            : yfiles.collections.IListEnumerable.EMPTY
          if (node.ports.size > 0) {
            simpleNode.ports = new yfiles.collections.ListEnumerable(node.ports)
          }
          callback(element, simpleNode)
        }
      }

      element.addEventListener(
        'mousedown',
        evt => {
          if (evt.button !== 0) {
            return
          }
          doDragOperation()
          evt.preventDefault()
        },
        false
      )

      const touchStartListener = evt => {
        doDragOperation()
        evt.preventDefault()
      }

      if (window.PointerEvent !== undefined) {
        element.addEventListener(
          'pointerdown',
          evt => {
            if (evt.pointerType === 'touch' || evt.pointerType === 'pen') {
              touchStartListener(evt)
            }
          },
          true
        )
      } else if (window.MSPointerEvent !== undefined) {
        element.addEventListener(
          'MSPointerDown',
          evt => {
            if (
              evt.pointerType === evt.MSPOINTER_TYPE_TOUCH ||
              evt.pointerType === evt.MSPOINTER_TYPE_PEN
            ) {
              touchStartListener(evt)
            }
          },
          true
        )
      } else {
        element.addEventListener(
          'touchstart',
          touchStartListener,
          this.passiveSupported ? { passive: false } : false
        )
      }
    }
  }

  return { DragAndDropPanel }
})
