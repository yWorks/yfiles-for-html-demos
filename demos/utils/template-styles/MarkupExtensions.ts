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
  GraphMLIOHandler,
  ILookup,
  Insets,
  MarkupExtension,
  Point,
  Size
} from '@yfiles/yfiles'

import { StringTemplateNodeStyle } from './StringTemplateNodeStyle'
import { StringTemplateLabelStyle } from './StringTemplateLabelStyle'
import { StringTemplatePortStyle } from './StringTemplatePortStyle'
import { TemplateLabelStyle, TemplateNodeStyle, TemplatePortStyle } from './TemplateStyles'

const XMLNS = 'http://www.yworks.com/demos/template-node-style/3.0'

abstract class StringTemplateStyleExtension extends MarkupExtension {
  private _normalizedOutline?: GeneralPath | undefined | null

  get normalizedOutline(): GeneralPath | undefined | null {
    return this._normalizedOutline
  }

  set normalizedOutline(value: GeneralPath | undefined | null) {
    this._normalizedOutline = value
  }

  private _svgContent = ''

  get svgContent(): string {
    return this._svgContent
  }

  set svgContent(value: string) {
    this._svgContent = value
  }

  private _cssClass: string = ''

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  private _styleTag: any

  get styleTag(): any {
    return this._styleTag
  }

  set styleTag(value: any) {
    this._styleTag = value
  }
}

/**
 * A markup extension class used for (de-)serializing a StringTemplateNodeStyle.
 */
export class StringTemplateNodeStyleExtension extends StringTemplateStyleExtension {
  private _minimumSize: Size = Size.EMPTY

  get minimumSize(): Size {
    return this._minimumSize
  }

  set minimumSize(value: Size) {
    this._minimumSize = value
  }

  private _insets: Insets = new Insets(5)

  get insets(): Insets {
    return this._insets
  }

  set insets(value: Insets) {
    this._insets = value
  }

  static create(item: StringTemplateNodeStyle): StringTemplateNodeStyleExtension {
    const extension = new StringTemplateNodeStyleExtension()
    extension.svgContent = item.svgContent
    extension.cssClass = item.cssClass ? item.cssClass : ''
    extension.styleTag = item.tag ? item.tag : null
    extension.insets = item.insets
    extension.minimumSize = item.minimumSize
    extension.normalizedOutline = item.normalizedOutline ? item.normalizedOutline : null
    return extension
  }

  provideValue(_: ILookup) {
    return new StringTemplateNodeStyle({
      svgContent: this.svgContent,
      cssClass: this.cssClass,
      styleTag: this.styleTag,
      insets: this._insets,
      minimumSize: this._minimumSize,
      normalizedOutline: this.normalizedOutline ? this.normalizedOutline : undefined
    })
  }
}

/**
 * A markup extension class used for (de-)serializing a StringTemplateLabelStyle.
 */
export class StringTemplateLabelStyleExtension extends StringTemplateStyleExtension {
  private _preferredSize: Size = Size.EMPTY

  get preferredSize(): Size {
    return this._preferredSize
  }

  set preferredSize(value: Size) {
    this._preferredSize = value
  }

  private _autoFlip = true

  get autoFlip(): boolean {
    return this._autoFlip
  }

  set autoFlip(value: boolean) {
    this._autoFlip = value
  }

  static create(item: StringTemplateLabelStyle): StringTemplateLabelStyleExtension {
    const extension = new StringTemplateLabelStyleExtension()
    extension.svgContent = item.svgContent
    extension.cssClass = item.cssClass ? item.cssClass : ''
    extension.styleTag = item.tag ? item.tag : null
    extension.autoFlip = item.autoFlip
    extension.preferredSize = item.preferredSize
    extension.normalizedOutline = item.normalizedOutline ? item.normalizedOutline : null
    return extension
  }

  provideValue(_: ILookup) {
    return new StringTemplateLabelStyle({
      svgContent: this.svgContent,
      cssClass: this.cssClass,
      styleTag: this.styleTag,
      autoFlip: this.autoFlip,
      preferredSize: this.preferredSize,
      normalizedOutline: this.normalizedOutline ? this.normalizedOutline : undefined
    })
  }
}

/**
 * A markup extension class used for (de-)serializing a StringTemplatePortStyle.
 */
export class StringTemplatePortStyleExtension extends StringTemplateStyleExtension {
  private _renderSize: Size = new Size(5, 5)

  get renderSize(): Size {
    return this._renderSize
  }

  set renderSize(value: Size) {
    this._renderSize = value
  }

  private _offset = Point.ORIGIN

  get offset(): Point {
    return this._offset
  }

  set offset(value: Point) {
    this._offset = value
  }

  static create(item: StringTemplatePortStyle): StringTemplatePortStyleExtension {
    const extension = new StringTemplatePortStyleExtension()
    extension.svgContent = item.svgContent
    extension.cssClass = item.cssClass ? item.cssClass : ''
    extension.styleTag = item.tag ? item.tag : null
    extension.offset = item.offset
    extension.renderSize = item.renderSize
    extension.normalizedOutline = item.normalizedOutline ? item.normalizedOutline : null
    return extension
  }

  provideValue(_: ILookup) {
    return new StringTemplatePortStyle({
      svgContent: this.svgContent,
      cssClass: this.cssClass,
      styleTag: this.styleTag,
      offset: this.offset,
      renderSize: this.renderSize,
      normalizedOutline: this.normalizedOutline ? this.normalizedOutline : undefined
    })
  }
}

/**
 * Enable serialization of the various template styles - without a namespace mapping, serialization will fail
 */
export function registerTemplateStyleSerialization(graphmlHandler: GraphMLIOHandler) {
  // reflection properties that are common to all extensions
  const commonProperties = {
    svgContent: { type: String, default: '' },
    cssClass: { type: String, default: '' },
    styleTag: { default: null },
    normalizedOutline: { type: GeneralPath, default: null }
  }
  // enable serialization of the StringTemplateNodeStyle - this is done with a markup extension
  graphmlHandler.addTypeInformation(StringTemplateNodeStyle, {
    extension: (item: StringTemplateNodeStyle) => {
      return StringTemplateNodeStyleExtension.create(item)
    }
  })
  // enable serialization of a TemplateNodeStyle
  // On writing, we convert this style to a string template style
  graphmlHandler.addTypeInformation(TemplateNodeStyle, {
    extension: (item: TemplateNodeStyle) => {
      return StringTemplateNodeStyleExtension.create(item)
    }
  })
  graphmlHandler.addTypeInformation(StringTemplateNodeStyleExtension, {
    contentProperty: 'svgContent',
    name: 'StringTemplateNodeStyle',
    xmlNamespace: XMLNS,
    properties: {
      ...commonProperties,
      insets: { type: Insets, default: new Insets(5) },
      minimumSize: { type: Size, default: Size.EMPTY }
    }
  })
  // enable serialization of the StringTemplateLabelStyle - this is done with a markup extension
  graphmlHandler.addTypeInformation(StringTemplateLabelStyle, {
    extension: (item: StringTemplateLabelStyle) => {
      return StringTemplateLabelStyleExtension.create(item)
    }
  })
  // enable serialization of a TemplateLabelStyle
  // On writing, we convert this style to a string template style
  graphmlHandler.addTypeInformation(TemplateLabelStyle, {
    extension: (item: TemplateLabelStyle) => {
      return StringTemplateLabelStyleExtension.create(item)
    }
  })
  graphmlHandler.addTypeInformation(StringTemplateLabelStyleExtension, {
    contentProperty: 'svgContent',
    name: 'StringTemplateLabelStyle',
    xmlNamespace: XMLNS,
    properties: {
      ...commonProperties,
      autoFlip: { type: Boolean, default: true },
      preferredSize: { type: Size, default: Size.EMPTY }
    }
  })
  // enable serialization of the StringTemplatePortStyle - this is done with a markup extension
  graphmlHandler.addTypeInformation(StringTemplatePortStyle, {
    extension: (item: StringTemplatePortStyle) => {
      return StringTemplatePortStyleExtension.create(item)
    }
  })
  // enable serialization of a TemplatePortStyle
  // On writing, we convert this style to a string template style
  graphmlHandler.addTypeInformation(TemplatePortStyle, {
    extension: (item: TemplatePortStyle) => {
      return StringTemplatePortStyleExtension.create(item)
    }
  })
  graphmlHandler.addTypeInformation(StringTemplatePortStyleExtension, {
    contentProperty: 'svgContent',
    name: 'StringTemplatePortStyle',
    xmlNamespace: XMLNS,
    properties: {
      ...commonProperties,
      offset: { type: Point, default: Point.ORIGIN },
      renderSize: { type: Size, default: Size.EMPTY }
    }
  })
  graphmlHandler.addNamespace(XMLNS, 'template-styles')
}
