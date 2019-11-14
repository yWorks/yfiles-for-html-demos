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
   * A class that provides png-image export. The image is exported to svg and the PDF can then be requested from the
   * server.
   */
  class ServerSidePdfExport {
    /**
     * Creates a new instance.
     */
    constructor() {
      this.$scale = 1
      this.$margins = new yfiles.geometry.Insets(5)
      initForm()
    }

    /**
     * Returns the scaling of the exported image.
     * @return {number}
     */
    get scale() {
      return this.$scale
    }

    /**
     * Specifies the scaling of the exported image.
     * @param {number} value
     */
    set scale(value) {
      this.$scale = value
    }

    /**
     * Returns the margins for the exported image.
     * @return {yfiles.geometry.Insets}
     */
    get margins() {
      return this.$margins
    }

    /**
     * Specifies the margins for the exported image.
     * @param {yfiles.geometry.Insets} value
     */
    set margins(value) {
      this.$margins = value
    }

    /**
     * Exports the graph to an svg element.
     * This function returns a Promise to allow showing the SVG in a popup with a save button, afterwards.
     * @param {yfiles.graph.IGraph} graph
     * @param {yfiles.geometry.Rect} exportRect
     * @return {Promise.<{element:SVGElement,size:yfiles.geometry.Size}|Error>}
     */
    exportSvg(graph, exportRect) {
      // Create a new graph component for exporting the original SVG content
      const exportComponent = new yfiles.view.GraphComponent()
      // ... and assign it the same graph.
      exportComponent.graph = graph
      exportComponent.updateContentRect()

      // Determine the bounds of the exported area
      const targetRect = exportRect || exportComponent.contentRect

      exportComponent.zoomTo(targetRect)

      // Create the exporter class
      const exporter = new yfiles.view.SvgExport(targetRect, this.scale)
      exporter.margins = this.margins

      if (window.btoa !== undefined) {
        // Don't use base 64 encoding if btoa is not available and don't inline images as-well.
        // Otherwise canvg will throw an exception.
        exporter.encodeImagesBase64 = true
        exporter.inlineSvgImages = true
      }

      return exporter.exportSvgAsync(exportComponent).then(svgElement => ({
        element: svgElement,
        size: new yfiles.geometry.Size(exporter.viewWidth, exporter.viewHeight)
      }))
    }

    /**
     * Send the request to the server which initiates a file download.
     * @param {string} url
     * @param {string} format
     * @param {string} svgString
     * @param {yfiles.geometry.Size} size
     */
    requestFile(url, format, svgString, size) {
      const svgStringInput = document.getElementById('postSvgString')
      svgStringInput.setAttribute('value', `${svgString}`)
      const formatInput = document.getElementById('postFormat')
      formatInput.setAttribute('value', `${format}`)
      const width = document.getElementById('postWidth')
      width.setAttribute('value', `${size.width}`)
      const height = document.getElementById('postHeight')
      height.setAttribute('value', `${size.height}`)
      const margin = document.getElementById('postMargin')
      margin.setAttribute('value', `${this.margins ? this.margins.left : 5}`)

      const form = document.getElementById('postForm')
      form.setAttribute('action', url)
      form.submit()
    }

    /**
     * Disposes this image export.
     */
    dispose() {
      disposeForm()
    }
  }

  /**
   * Adds a form to the document body that is used to request the png-image from the server.
   */
  function initForm() {
    const form = document.createElement('form')
    form.style.display = 'none'
    form.id = 'postForm'
    form.method = 'post'
    const svgString = document.createElement('input')
    svgString.id = 'postSvgString'
    svgString.name = 'svgString'
    svgString.type = 'hidden'
    form.appendChild(svgString)
    const format = document.createElement('input')
    format.id = 'postFormat'
    format.name = 'format'
    format.type = 'hidden'
    form.appendChild(format)
    const width = document.createElement('input')
    width.id = 'postWidth'
    width.name = 'width'
    width.type = 'hidden'
    form.appendChild(width)
    const height = document.createElement('input')
    height.id = 'postHeight'
    height.name = 'height'
    height.type = 'hidden'
    form.appendChild(height)
    const margin = document.createElement('input')
    margin.id = 'postMargin'
    margin.name = 'margin'
    margin.type = 'hidden'
    form.appendChild(margin)

    document.body.appendChild(form)
  }

  /**
   * Removes the form to keep the dom clean.
   */
  function disposeForm() {
    const form = document.getElementById('postForm')
    document.body.removeChild(form)
  }

  return ServerSidePdfExport
})
