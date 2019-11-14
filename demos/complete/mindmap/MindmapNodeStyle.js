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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * The node style used for the non-root nodes of the mindmap.
   * @extends yfiles.styles.NodeStyleBase
   */
  class MindmapNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * Creates a new instance of this style using the given class name.
     * @param {string} className The css class attributed to the node.
     */
    constructor(className) {
      super()
      this.$className = className
    }

    /**
     * Gets the class name associated with this node style.
     * @return {string}
     */
    get className() {
      return this.$className
    }

    /**
     * Sets the class name to this node style.
     * @param {string} value The value to be set.
     */
    set className(value) {
      this.$className = value
    }

    /**
     * Creates the visual for this node style.
     * @param {yfiles.view.IRenderContext} renderContext The render context.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#createVisual}
     * @return {yfiles.view.SvgVisual}
     */
    createVisual(renderContext, node) {
      // create a container element
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      this.render(renderContext, node, g)
      // move the container to the node position
      yfiles.view.SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Updates the visual.
     * @param {yfiles.view.IRenderContext} renderContext The render context.
     * @param {yfiles.view.Visual} oldVisual The old visual.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#updateVisual}
     * @return {yfiles.view.SvgVisual}
     */
    updateVisual(renderContext, oldVisual, node) {
      const nodeSize = node.layout.toSize()
      const color = node.tag.color
      const container = oldVisual.svgElement

      // check if the data used to create the visualization has changed
      if (!nodeSize.equals(container['data-size']) || color !== container['data-color']) {
        // remove the old elements and re-render the node
        while (container.hasChildNodes()) {
          // remove all children
          container.removeChild(container.firstChild)
        }
        this.render(renderContext, node, container)
      }
      // move the container to the node position
      yfiles.view.SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
      return oldVisual
    }

    /**
     * Creates the Svg elements and adds them to the container.
     * @param {yfiles.view.IRenderContext} renderContext The render context.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @param {Element} container The svg element.
     */
    render(renderContext, node, container) {
      const nodeSize = node.layout.toSize()
      const w = nodeSize.width
      const h = nodeSize.height

      const line = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.x1.baseVal.value = 0
      line.x2.baseVal.value = w
      line.y1.baseVal.value = h
      line.y2.baseVal.value = h
      // set the CSS class for the line
      line.setAttribute('class', `nodeUnderline ${this.className}`)
      line.setAttribute('stroke', node.tag.color)

      const rect = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.x.baseVal.value = 0
      rect.y.baseVal.value = 0
      rect.width.baseVal.value = w
      rect.height.baseVal.value = h
      // set the CSS class for the rect
      rect.setAttribute('class', `nodeBackground ${this.className}`)

      container.appendChild(rect)
      container.appendChild(line)

      // store the data used to create the elements with the container
      container['data-size'] = nodeSize
      container['data-color'] = node.tag.color
    }
  }

  return MindmapNodeStyle
})
