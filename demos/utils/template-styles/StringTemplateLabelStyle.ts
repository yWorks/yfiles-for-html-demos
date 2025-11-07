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
  type GeneralPath,
  type ILabel,
  type IRenderContext,
  LabelStyleBase,
  Size,
  type SizeConvertible,
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

type TemplateLabelStyleCache = TemplateStyleCache<ILabel>

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
type TemplateLabelStyleVisual = TaggedSvgVisual<SVGGElement, TemplateLabelStyleCache>

class LabelTemplateContext extends TemplateContext<ILabel> {
  private readonly style: StringTemplateLabelStyle

  constructor(label: ILabel, style: StringTemplateLabelStyle) {
    super(label)
    this.style = style
  }

  get label() {
    return this.item
  }

  get width() {
    return this.label.layout.width
  }

  get height() {
    return this.label.layout.height
  }

  get labelText() {
    return this.label.text
  }

  get isUpsideDown() {
    return this.label.layout.upY > 0
  }

  get isFlipped() {
    return this.isUpsideDown && this.style.autoFlip
  }

  get styleTag() {
    return this.style.tag
  }
}

export type StringTemplateLabelStyleOptions = StringTemplateStyleOptions & {
  preferredSize: Size | SizeConvertible
} & Partial<{ autoFlip: boolean }>

export class StringTemplateLabelStyle extends LabelStyleBase<TemplateLabelStyleVisual> {
  static CONVERTERS: typeof converters = converters
  tag?: any
  cssClass?: string
  normalizedOutline?: GeneralPath
  preferredSize: Size
  svgContent: string
  autoFlip: boolean
  private readonly renderFunction: RenderFunction

  constructor(options: StringTemplateLabelStyleOptions)

  constructor(svgContent: string)

  constructor() {
    super()
    const arg = arguments[0]
    if (typeof arg === 'string') {
      this.renderFunction = parseTemplate((this.svgContent = arg), 'http://www.w3.org/2000/svg')
      this.preferredSize = Size.EMPTY
      this.autoFlip = true
    } else {
      const options = arg as StringTemplateLabelStyleOptions
      this.renderFunction = parseTemplate(
        (this.svgContent = options.svgContent!),
        'http://www.w3.org/2000/svg'
      )
      this.cssClass = options.cssClass
      this.normalizedOutline = options.normalizedOutline
      this.tag = options.styleTag
      this.autoFlip = options.autoFlip ? options.autoFlip : true
      this.preferredSize = options.preferredSize ? Size.from(options.preferredSize) : Size.EMPTY
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
   */
  static makeObservable<T>(
    obj: T
  ): T & IPropertyObservable & { firePropertyChanged: (propertyName: string) => void } {
    makeObservable(obj)
    return obj
  }

  protected createVisual(renderContext: IRenderContext, label: ILabel): TemplateLabelStyleVisual {
    return createSVG(
      label,
      new LabelTemplateContext(label, this),
      renderContext,
      this.renderFunction,
      this.cssClass,
      (element: SVGElement) => {
        const transform = LabelStyleBase.createLayoutTransform(
          renderContext,
          label.layout,
          this.autoFlip
        )
        transform.applyTo(element)
      }
    )
  }

  protected updateVisual(
    renderContext: IRenderContext,
    oldVisual: TemplateLabelStyleVisual,
    label: ILabel
  ): TemplateLabelStyleVisual | null {
    return updateSVG(oldVisual, label, renderContext, this.cssClass, (element: SVGElement) => {
      const transform = LabelStyleBase.createLayoutTransform(
        renderContext,
        label.layout,
        this.autoFlip
      )
      transform.applyTo(element)
    })
  }

  protected getPreferredSize(label: ILabel): Size {
    return this.preferredSize
  }
}
