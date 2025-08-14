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

class StringTemplateStyleExtension extends MarkupExtension {
  _normalizedOutline

  get normalizedOutline() {
    return this._normalizedOutline
  }

  set normalizedOutline(value) {
    this._normalizedOutline = value
  }

  _svgContent = ''

  get svgContent() {
    return this._svgContent
  }

  set svgContent(value) {
    this._svgContent = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _styleTag

  get styleTag() {
    return this._styleTag
  }

  set styleTag(value) {
    this._styleTag = value
  }
}

/**
 * A markup extension class used for (de-)serializing a StringTemplateNodeStyle.
 */
export class StringTemplateNodeStyleExtension extends StringTemplateStyleExtension {
  _minimumSize = Size.EMPTY

  get minimumSize() {
    return this._minimumSize
  }

  set minimumSize(value) {
    this._minimumSize = value
  }

  _insets = new Insets(5)

  get insets() {
    return this._insets
  }

  set insets(value) {
    this._insets = value
  }

  static create(item) {
    const extension = new StringTemplateNodeStyleExtension()
    extension.svgContent = item.svgContent
    extension.cssClass = item.cssClass ? item.cssClass : ''
    extension.styleTag = item.tag ? item.tag : null
    extension.insets = item.insets
    extension.minimumSize = item.minimumSize
    extension.normalizedOutline = item.normalizedOutline ? item.normalizedOutline : null
    return extension
  }

  provideValue(_) {
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
  _preferredSize = Size.EMPTY

  get preferredSize() {
    return this._preferredSize
  }

  set preferredSize(value) {
    this._preferredSize = value
  }

  _autoFlip = true

  get autoFlip() {
    return this._autoFlip
  }

  set autoFlip(value) {
    this._autoFlip = value
  }

  static create(item) {
    const extension = new StringTemplateLabelStyleExtension()
    extension.svgContent = item.svgContent
    extension.cssClass = item.cssClass ? item.cssClass : ''
    extension.styleTag = item.tag ? item.tag : null
    extension.autoFlip = item.autoFlip
    extension.preferredSize = item.preferredSize
    extension.normalizedOutline = item.normalizedOutline ? item.normalizedOutline : null
    return extension
  }

  provideValue(_) {
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
  _renderSize = new Size(5, 5)

  get renderSize() {
    return this._renderSize
  }

  set renderSize(value) {
    this._renderSize = value
  }

  _offset = Point.ORIGIN

  get offset() {
    return this._offset
  }

  set offset(value) {
    this._offset = value
  }

  static create(item) {
    const extension = new StringTemplatePortStyleExtension()
    extension.svgContent = item.svgContent
    extension.cssClass = item.cssClass ? item.cssClass : ''
    extension.styleTag = item.tag ? item.tag : null
    extension.offset = item.offset
    extension.renderSize = item.renderSize
    extension.normalizedOutline = item.normalizedOutline ? item.normalizedOutline : null
    return extension
  }

  provideValue(_) {
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
export function registerTemplateStyleSerialization(graphmlHandler) {
  // reflection properties that are common to all extensions
  const commonProperties = {
    svgContent: { type: String, default: '' },
    cssClass: { type: String, default: '' },
    styleTag: { default: null },
    normalizedOutline: { type: GeneralPath, default: null }
  }
  // enable serialization of the StringTemplateNodeStyle - this is done with a markup extension
  graphmlHandler.addTypeInformation(StringTemplateNodeStyle, {
    extension: (item) => {
      return StringTemplateNodeStyleExtension.create(item)
    }
  })
  // enable serialization of a TemplateNodeStyle
  // On writing, we convert this style to a string template style
  graphmlHandler.addTypeInformation(TemplateNodeStyle, {
    extension: (item) => {
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
    extension: (item) => {
      return StringTemplateLabelStyleExtension.create(item)
    }
  })
  // enable serialization of a TemplateLabelStyle
  // On writing, we convert this style to a string template style
  graphmlHandler.addTypeInformation(TemplateLabelStyle, {
    extension: (item) => {
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
    extension: (item) => {
      return StringTemplatePortStyleExtension.create(item)
    }
  })
  // enable serialization of a TemplatePortStyle
  // On writing, we convert this style to a string template style
  graphmlHandler.addTypeInformation(TemplatePortStyle, {
    extension: (item) => {
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
