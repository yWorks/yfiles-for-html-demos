/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  IRenderContext,
  IVisualCreator,
  IVisualTemplate,
  Rect,
  SimpleNode,
  Size,
  StringTemplateNodeStyle,
  SvgVisual
} from 'yfiles'

/**
 * A visual template that renders labels with a given template string and size.
 */
export default class HandleTemplate extends BaseClass(IVisualTemplate) {
  dummyNode

  /**
   * Creates a new instance of {@link HandleTemplate}
   * @param {!string} template - The template svg string used to render the handle.
   * @param {?Size} size - The handle size.
   */
  constructor(template, size) {
    super()
    this.dummyNode = newDummyNode(template, size || new Size(6, 6))
  }

  /**
   * @param {!IRenderContext} context The context that describes where the visual will be used.
   * @param {!Rect} bounds The initial bounds to use for the visual.
   * @param {!object} dataObject The data object to visualize.
   * @returns {!SvgVisual}
   */
  createVisual(context, bounds, dataObject) {
    const handleElement = this.createHandleVisual(context).svgElement
    return new SvgVisual(handleElement)
  }

  /**
   * @param {!IRenderContext} context The context that describes where the visual will be used in.
   * @param {!SvgVisual} oldVisual The visual instance that had been returned the last time the
   * {@link IVisualTemplate.createVisual} method was called on this instance.
   * @param {!Rect} bounds The initial bounds to use for the visual.
   * @param {!object} dataObject The data object to visualize.
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, bounds, dataObject) {
    return oldVisual
  }

  /**
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createHandleVisual(context) {
    return this.getVisualCreator().createVisual(context)
  }

  /**
   * @returns {!IVisualCreator}
   */
  getVisualCreator() {
    const style = this.dummyNode.style
    return style.renderer.getVisualCreator(this.dummyNode, style)
  }
}

/**
 * @param {!string} template
 * @param {!Size} size
 * @returns {!SimpleNode}
 */
function newDummyNode(template, size) {
  const node = new SimpleNode()
  node.layout = new Rect(-size.width * 0.5, -size.height * 0.5, size.width, size.height)
  node.style = new StringTemplateNodeStyle(template)
  return node
}
