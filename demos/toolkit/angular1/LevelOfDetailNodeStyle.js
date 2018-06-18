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
  class LevelOfDetailNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * @param {function} $compile
     * @param {string} detailTemplate
     * @param {string} intermediateTemplate
     * @param {string} overviewTemplate
     */
    constructor($compile, detailTemplate, intermediateTemplate, overviewTemplate) {
      super()
      this.$compile = $compile

      // Stores the templates used to render the node at different zoom levels
      this.templates = [detailTemplate, intermediateTemplate, overviewTemplate]

      // The zoom value thresholds for switching the templates
      this.detailThreshold = 0.7
      this.intermediateThreshold = 0.4
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.Visual}
     */
    createVisual(renderContext, node) {
      // get scope previously stored in node tag at node creation
      const scope = node.tag

      if (!scope) {
        return null
      }

      const zoom = renderContext.zoom
      // find out which template to use
      const templateMode = this.getTemplateMode(zoom)
      // wrap template in svg element, compile and digest scope
      const template = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${
        this.templates[templateMode]
      }</svg>`
      const templateElement = this.$compile(template)(scope)[0]
      scope.$digest()

      // create a container holding all elements
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      // transform it to node location
      g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
      g.appendChild(templateElement.firstChild)

      // remember template mode for updating
      g['data-templateMode'] = templateMode

      // return new visual with container
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.IGraph} node
     * @return {yfiles.view.Visual}
     */
    updateVisual(renderContext, oldVisual, node) {
      if (oldVisual && oldVisual.svgElement) {
        const g = oldVisual.svgElement
        const oldTemplateMode = g['data-templateMode']
        const zoom = renderContext.zoom
        const newTemplateMode = this.getTemplateMode(zoom)
        // if template mode did not change
        if (oldTemplateMode === newTemplateMode) {
          // update the element's location
          g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
          return oldVisual
        }
      }
      // otherwise, re-create the visual
      return this.createVisual(renderContext, node)
    }

    /**
     * @param {number} zoom
     * @return {number}
     */
    getTemplateMode(zoom) {
      if (zoom > this.detailThreshold) {
        return 0
      } else if (zoom > this.intermediateThreshold) {
        return 1
      }
      return 2
    }
  }

  return LevelOfDetailNodeStyle
})
