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

define(['yfiles/view-editor'], yfiles => {
  /**
   * A visual template that renders labels with a given template string and size.
   * @class HandleTemplate
   */
  class HandleTemplate extends yfiles.lang.Class(yfiles.view.IVisualTemplate) {
    /**
     * Creates a new instance of <code>HandleTemplate</code>
     * @param {string} template - The template svg string used to render the handle.
     * @param {yfiles.geometry.Size|null} [size] - The handle size.
     */
    constructor(template, size) {
      super()
      this.templateStyle = new yfiles.styles.StringTemplateNodeStyle(template)
      this.size = size || new yfiles.geometry.Size(6, 6)
    }

    /**
     * @param {yfiles.view.IRenderContext} context - The context that describes where the visual will be used.
     * @param {yfiles.geometry.Rect} bounds - The initial bounds to use for the visual.
     * @param {Object} dataObject - The data object to visualize.
     * @returns {yfiles.view.SvgVisual}
     */
    createVisual(context, bounds, dataObject) {
      const handleElement = this.createHandleElement(context)
      return new yfiles.view.SvgVisual(handleElement)
    }

    /**
     * @param {yfiles.view.IRenderContext} context - The context that describes where the visual will be used in.
     * @param {yfiles.view.SvgVisual} oldVisual - The visual instance that had been returned the last time the
     *   {@link yfiles.view.IVisualTemplate#createVisual} method was called on this instance.
     * @param {yfiles.geometry.Rect} bounds - The initial bounds to use for the visual.
     * @param {Object} dataObject - The data object to visualize.
     * @returns {yfiles.view.SvgVisual}
     */
    updateVisual(context, oldVisual, bounds, dataObject) {
      return oldVisual
    }

    /**
     * @private
     * @param context
     * @returns {SVGElement}
     */
    createHandleElement(context) {
      const size = this.size
      const dummyNode = new yfiles.graph.SimpleNode()
      dummyNode.layout = new yfiles.geometry.Rect(
        -size.width * 0.5,
        -size.height * 0.5,
        size.width,
        size.height
      )
      dummyNode.style = this.templateStyle

      return dummyNode.style.renderer
        .getVisualCreator(dummyNode, dummyNode.style)
        .createVisual(context.canvasComponent.createRenderContext()).svgElement
    }
  }

  return HandleTemplate
})
