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

define([
  'yfiles/view-component',
  'jquery',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery-sparklines/2.1.2/jquery.sparkline.min.js'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A node style that triggers the sparkline rendering and includes the result in
   * the node visualization.
   */
  class SparklineNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * Creates a visual showing a box with sparklines.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#createVisual}
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.SvgVisual}
     */
    createVisual(renderContext, node) {
      // create a g element and use it as a container for the sparkline visualization
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      // render the node
      this.render(renderContext, node, g)
      // set the location
      g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Updates a visual showing a box with sparklines.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#updateVisual}
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.Visual}
     */
    updateVisual(renderContext, oldVisual, node) {
      const g = oldVisual.svgElement

      // check if we need to re-render the jQuery sparkline image
      if (SparklineNodeStyle.needsSizeUpdate(node, g)) {
        // node size has changed, we have to re-render the complete node
        this.render(renderContext, node, g)
      } else if (SparklineNodeStyle.needsImageUpdate(node, g, renderContext)) {
        // render data has changed, we have to update the image
        this.update(renderContext, node, g)
      }
      // make sure that the location is up to date
      g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
      return oldVisual
    }

    /**
     * Renders the node.
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.graph.INode} node
     * @param {Element} container
     */
    render(context, node, container) {
      // clear children
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      const nodeSize = node.layout.toSize()
      // get data for sparkline calculation from node tag
      const sparklineData = node.tag

      // create rectangle
      const shape = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      shape.width.baseVal.value = nodeSize.width
      shape.height.baseVal.value = nodeSize.height
      shape.setAttribute('fill', 'aliceblue')
      shape.setAttribute('stroke', 'black')
      shape.setAttribute('stroke-width', 1)
      container.appendChild(shape)

      // create an image element
      const image = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
      // render the sparklines
      SparklineNodeStyle.renderSparklineImage(image, nodeSize, sparklineData, context)
      // add the image to the container
      container.appendChild(image)

      // save sparkline and render data in container for later use in updateVisual
      container.sparklineData = sparklineData
      container.zoom = context.zoom
      container.width = node.layout.width
      container.height = node.layout.height
    }

    /**
     * Updates the node visualization.
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.graph.INode} node
     * @param {Element} container
     */
    update(context, node, container) {
      // re-use the old image element
      const image = container.childNodes.item(1)
      const sparklineData = node.tag
      SparklineNodeStyle.renderSparklineImage(image, node.layout.toSize(), sparklineData, context)
      // store the new data with the container element
      container.sparklineData = sparklineData
      container.zoom = context.zoom
    }

    /**
     * Renders the sparlines.
     * @param {Element} image
     * @param {yfiles.geometry.Size} nodeSize
     * @param {object} sparklineData
     * @param {yfiles.view.IRenderContext} context
     */
    static renderSparklineImage(image, nodeSize, sparklineData, context) {
      const renderingDummy = window.document.getElementById('rendering_dummy')
      if (renderingDummy !== null) {
        // get inner span to render sparkline in
        const sparklineSpan = renderingDummy.firstChild
        const zoom = context.zoom
        // set 5% padding around the image
        const padding = 0.05
        // calculate image size with padding
        const width = nodeSize.width * (1 - padding - padding)
        const height = nodeSize.height * (1 - padding - padding)
        // remove old span children
        while (sparklineSpan.firstChild) {
          sparklineSpan.removeChild(sparklineSpan.firstChild)
        }

        // calculate sparkline
        /* global $ */
        $(sparklineSpan).sparkline(sparklineData, {
          type: 'bar',
          barWidth: (width * zoom / sparklineData.length) | 0,
          height: (height * zoom) | 0
        })

        // see if canvas has been created)
        if (sparklineSpan.firstChild && sparklineSpan.firstChild instanceof HTMLCanvasElement) {
          // get canvas created by jQuery sparkline
          const canvas = sparklineSpan.firstChild

          image.setAttribute('width', `${width}`)
          image.setAttribute('height', `${height}`)
          image.setAttribute('x', `${padding * nodeSize.width}`)
          image.setAttribute('y', `${padding * nodeSize.height}`)
          // ...and embed the canvas contents as a data url
          image.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            canvas.toDataURL('image/png')
          )
        }
      }
    }

    /**
     * Checks if the node size has changed.
     * @param {yfiles.graph.INode} node
     * @param {SVGElement} g
     * @return {boolean}
     */
    static needsSizeUpdate(node, g) {
      return g.width !== node.layout.width || g.height !== node.layout.height
    }

    /**
     * Checks if the data used to render the sparkline image has changed.
     * @param {yfiles.graph.INode} node
     * @param {SVGElement} g
     * @return {boolean}
     */
    static needsImageUpdate(node, g, context) {
      if (g.sparklineData !== node.tag) {
        // sparkline data has changed
        return true
      }
      // check if zoom has changed beyond a certain threshold.
      // in this case, re-render with the zoomed size to get a high-fidelity image
      const threshold = 2.0
      const oldZoom = g.zoom
      const newZoom = context.zoom
      const factor = newZoom / oldZoom
      return factor > threshold || factor < 1 / threshold
    }
  }

  return SparklineNodeStyle
})
