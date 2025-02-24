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
  type ICanvasContext,
  type IPort,
  IRenderContext,
  Point,
  type PointConvertible,
  PortStyleBase,
  Rect,
  Size,
  type SizeConvertible,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'
import {
  converters,
  makeObservable,
  parseTemplate,
  registerConverter
} from './template-engine/template-engine'
import type {
  ConverterFunction,
  IPropertyObservable,
  RenderFunction
} from './template-engine/interfaces'
import {
  createSVG,
  type StringTemplateStyleOptions,
  TemplateContext,
  type TemplateStyleCache,
  updateSVG
} from './StringTemplateSupport'

type TemplatePortStyleCache = TemplateStyleCache<IPort>

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
type TemplatePortStyleVisual = TaggedSvgVisual<SVGGElement, TemplatePortStyleCache>

class PortTemplateContext extends TemplateContext<IPort> {
  private readonly style: StringTemplatePortStyle

  constructor(port: IPort, style: StringTemplatePortStyle) {
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

  // noinspection JSUnusedGlobalSymbols
  get styleTag() {
    return this.style.tag
  }
}

export type StringTemplatePortStyleOptions = StringTemplateStyleOptions &
  Partial<{
    renderSize: Size | SizeConvertible
    offset: Point | PointConvertible
  }>

export class StringTemplatePortStyle extends PortStyleBase<TemplatePortStyleVisual> {
  static CONVERTERS: typeof converters = converters
  tag?: any
  cssClass?: string
  normalizedOutline?: GeneralPath
  offset: Point
  svgContent: string
  renderSize: Size
  private readonly renderFunction: RenderFunction

  constructor(options: StringTemplatePortStyleOptions)

  constructor(svgContent: string)

  constructor() {
    super()
    const arg = arguments[0]
    if (typeof arg === 'string') {
      this.renderFunction = parseTemplate((this.svgContent = arg), 'http://www.w3.org/2000/svg')
      this.offset = Point.ORIGIN
      this.renderSize = new Size(5, 5)
    } else {
      const options = arg as StringTemplatePortStyleOptions
      this.renderFunction = parseTemplate(
        (this.svgContent = options.svgContent!),
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
  static registerConverter(name: string, converter: ConverterFunction): void {
    registerConverter(name, converter)
  }

  /**
   * This mimics the old yFiles 2.x API
   * @param obj
   */
  static makeObservable<T>(obj: T): T &
    IPropertyObservable & {
      firePropertyChanged: (propertyName: string) => void
    } {
    makeObservable(obj)
    return obj
  }

  protected createVisual(renderContext: IRenderContext, port: IPort): TemplatePortStyleVisual {
    return createSVG(
      port,
      new PortTemplateContext(port, this),
      renderContext,
      this.renderFunction,
      this.cssClass,
      (element: SVGElement) => {
        SvgVisual.setTranslate(element, port.location.x, port.location.y)
      }
    )
  }

  protected updateVisual(
    renderContext: IRenderContext,
    oldVisual: TemplatePortStyleVisual,
    port: IPort
  ): TemplatePortStyleVisual | null {
    return updateSVG(oldVisual, port, renderContext, (element: SVGElement) => {
      SvgVisual.setTranslate(element, port.location.x, port.location.y)
    })
  }

  protected getBounds(_: ICanvasContext, port: IPort): Rect {
    const center = port.location
    return new Rect(
      center.x - this.renderSize.width * 0.5 + this.offset.x,
      center.y - this.renderSize.height * 0.5 + this.offset.y,
      this.renderSize.width,
      this.renderSize.height
    )
  }
}
