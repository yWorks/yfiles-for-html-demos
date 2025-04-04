/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GeneralPath,
  GroupPaddingProvider,
  IGroupPaddingProvider,
  INode,
  INodeSizeConstraintProvider,
  Insets,
  IRenderContext,
  NodeSizeConstraintProvider,
  NodeStyleBase,
  Size,
  SvgVisual
} from '@yfiles/yfiles'
import {
  converters,
  makeObservable,
  parseTemplate,
  registerConverter
} from './template-engine/template-engine'
import { createSVG, TemplateContext, updateSVG } from './StringTemplateSupport'
class NodeTemplateContext extends TemplateContext {
  style
  constructor(node, style) {
    super(node)
    this.style = style
  }
  get node() {
    return this.item
  }
  get width() {
    return this.node.layout.width
  }
  get height() {
    return this.node.layout.height
  }
  // noinspection JSUnusedGlobalSymbols
  get styleTag() {
    return this.style.tag
  }
}
export class StringTemplateNodeStyle extends NodeStyleBase {
  static CONVERTERS = converters
  tag
  cssClass
  normalizedOutline
  insets
  svgContent
  minimumSize
  renderFunction
  constructor() {
    super()
    const arg = arguments[0]
    if (typeof arg === 'string') {
      this.renderFunction = parseTemplate((this.svgContent = arg), 'http://www.w3.org/2000/svg')
      this.insets = Insets.EMPTY
      this.minimumSize = Size.EMPTY
    } else {
      const options = arg
      this.renderFunction = parseTemplate(
        (this.svgContent = options.svgContent),
        'http://www.w3.org/2000/svg'
      )
      this.cssClass = options.cssClass
      this.normalizedOutline = options.normalizedOutline
      this.tag = options.styleTag
      this.insets = options.insets ? Insets.from(options.insets) : Insets.EMPTY
      this.minimumSize = options.minimumSize ? Size.from(options.minimumSize) : Size.EMPTY
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
   * @param obj
   */
  static makeObservable(obj) {
    makeObservable(obj)
    return obj
  }
  createVisual(renderContext, node) {
    return createSVG(
      node,
      new NodeTemplateContext(node, this),
      renderContext,
      this.renderFunction,
      this.cssClass,
      (element) => {
        SvgVisual.setTranslate(element, node.layout.x, node.layout.y)
      }
    )
  }
  updateVisual(renderContext, oldVisual, node) {
    return updateSVG(oldVisual, node, renderContext, this.cssClass, (element) => {
      SvgVisual.setTranslate(element, node.layout.x, node.layout.y)
    })
  }
  lookup(node, type) {
    if (type === INodeSizeConstraintProvider && !this.minimumSize.isEmpty) {
      return new NodeSizeConstraintProvider(this.minimumSize, Size.INFINITE)
    } else if (type === IGroupPaddingProvider) {
      return new GroupPaddingProvider(this.insets)
    }
    return super.lookup(node, type)
  }
}
