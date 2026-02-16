/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Point, PortStyleBase, Rect, Size, SvgVisual } from '@yfiles/yfiles'
import {
  converters,
  makeObservable,
  parseTemplate,
  registerConverter
} from './template-engine/template-engine'
import { createSVG, TemplateContext, updateSVG } from './StringTemplateSupport'

class PortTemplateContext extends TemplateContext {
  style

  constructor(port, style) {
    super(port)
    this.style = style
  }

  get port() {
    return this.item
  }

  get width() {
    return this.style.renderSize.width
  }

  get height() {
    return this.style.renderSize.height
  }

  get styleTag() {
    return this.style.tag
  }
}

export class StringTemplatePortStyle extends PortStyleBase {
  static CONVERTERS = converters
  tag
  cssClass
  normalizedOutline
  offset
  svgContent
  renderSize
  renderFunction

  constructor() {
    super()
    const arg = arguments[0]
    if (typeof arg === 'string') {
      this.renderFunction = parseTemplate((this.svgContent = arg), 'http://www.w3.org/2000/svg')
      this.offset = Point.ORIGIN
      this.renderSize = new Size(5, 5)
    } else {
      const options = arg
      this.renderFunction = parseTemplate(
        (this.svgContent = options.svgContent),
        'http://www.w3.org/2000/svg'
      )
      this.cssClass = options.cssClass
      this.normalizedOutline = options.normalizedOutline
      this.tag = options.styleTag
      this.offset = options.offset ? Point.from(options.offset) : Point.ORIGIN
      this.renderSize = options.renderSize ? Size.from(options.renderSize) : new Size(5, 5)
    }
  }

  /**
   * This mimics the old yFiles 2.x API
   * Registers a global converter.
   * @param name - The name of the converter.
   * @param converter - The converter function.
   */
  static registerConverter(name, converter) {
    registerConverter(name, converter)
  }

  /**
   * This mimics the old yFiles 2.x API
   */
  static makeObservable(obj) {
    makeObservable(obj)
    return obj
  }

  createVisual(renderContext, port) {
    return createSVG(
      port,
      new PortTemplateContext(port, this),
      renderContext,
      this.renderFunction,
      this.cssClass,
      (element) => {
        SvgVisual.setTranslate(element, port.location.x, port.location.y)
      }
    )
  }

  updateVisual(renderContext, oldVisual, port) {
    return updateSVG(oldVisual, port, renderContext, this.cssClass, (element) => {
      SvgVisual.setTranslate(element, port.location.x, port.location.y)
    })
  }

  getBounds(_, port) {
    const center = port.location
    return new Rect(
      center.x - this.renderSize.width * 0.5 + this.offset.x,
      center.y - this.renderSize.height * 0.5 + this.offset.y,
      this.renderSize.width,
      this.renderSize.height
    )
  }
}
