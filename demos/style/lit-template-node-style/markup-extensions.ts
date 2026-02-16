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
import { type GraphMLIOHandler, type ILookup, MarkupExtension, Size } from '@yfiles/yfiles'

import { createLitHtmlLabelStyleFromSource, LitHtmlLabelStyle } from './LitHtmlLabelStyle'
import { createLitHtmlNodeStyleFromSource, LitHtmlNodeStyle } from './LitHtmlNodeStyle'
import { createLitLabelStyleFromSource, LitLabelStyle } from './LitLabelStyle'
import { LitNodeStyleMarkupExtension } from './LitNodeStyleMarkupExtension'
import { LitNodeStyle } from './LitNodeStyle'

/**
 * A markup extension class used for (de-)serializing a Lit node style.
 */
export class LitHtmlNodeStyleMarkupExtension extends MarkupExtension {
  private _renderFunction = ''

  get renderFunction(): string {
    return this._renderFunction
  }

  set renderFunction(value: string) {
    this._renderFunction = value
  }

  provideValue(serviceProvider: ILookup) {
    return createLitHtmlNodeStyleFromSource(this._renderFunction)
  }

  static create(item: LitHtmlNodeStyle): LitHtmlNodeStyleMarkupExtension {
    const litHtmlNodeStyleMarkupExtension = new LitHtmlNodeStyleMarkupExtension()
    litHtmlNodeStyleMarkupExtension.renderFunction = item.renderFunction.toString()
    return litHtmlNodeStyleMarkupExtension
  }
}

/**
 * A markup extension class used for (de-)serializing a Lit label style.
 */
export class LitLabelStyleMarkupExtension extends MarkupExtension {
  private _renderFunction = ''
  private _size: Size = Size.EMPTY

  get renderFunction(): string {
    return this._renderFunction
  }

  set renderFunction(value: string) {
    this._renderFunction = value
  }

  get size(): Size {
    return this._size
  }

  set size(value: Size) {
    this._size = value
  }

  provideValue(serviceProvider: ILookup) {
    return createLitLabelStyleFromSource(this._renderFunction, this._size)
  }

  static create(item: LitLabelStyle): LitLabelStyleMarkupExtension {
    const litLabelStyleMarkupExtension = new LitLabelStyleMarkupExtension()
    litLabelStyleMarkupExtension.renderFunction = item.renderFunction.toString()
    litLabelStyleMarkupExtension.size = item.size
    return litLabelStyleMarkupExtension
  }
}

/**
 * A markup extension class used for (de-)serializing a Lit label style.
 */
export class LitHtmlLabelStyleMarkupExtension extends MarkupExtension {
  private _renderFunction = ''
  private _size: Size = Size.EMPTY

  get renderFunction(): string {
    return this._renderFunction
  }

  set renderFunction(value: string) {
    this._renderFunction = value
  }

  get size(): Size {
    return this._size
  }

  set size(value: Size) {
    this._size = value
  }

  provideValue(serviceProvider: ILookup) {
    return createLitHtmlLabelStyleFromSource(this._renderFunction, this._size)
  }

  static create(item: LitHtmlLabelStyle): LitHtmlLabelStyleMarkupExtension {
    const litHtmlLabelStyleMarkupExtension = new LitHtmlLabelStyleMarkupExtension()
    litHtmlLabelStyleMarkupExtension.renderFunction = item.renderFunction.toString()
    litHtmlLabelStyleMarkupExtension.size = item.size
    return litHtmlLabelStyleMarkupExtension
  }
}

/**
 * Enable serialization of the Lit styles - without a namespace mapping, serialization will fail
 */
export function registerLitStyleSerialization(graphmlHandler: GraphMLIOHandler) {
  graphmlHandler.addXamlNamespaceMapping('http://www.yworks.com/demos/yfiles-lit-node-style/1.0', {
    LitNodeStyle: LitNodeStyleMarkupExtension,
    LitHtmlNodeStyle: LitHtmlNodeStyleMarkupExtension,
    LitLabelStyle: LitLabelStyleMarkupExtension,
    LitHtmlLabelStyle: LitHtmlLabelStyleMarkupExtension
  })

  graphmlHandler.addNamespace('http://www.yworks.com/demos/yfiles-lit-node-style/1.0', 'lit')

  graphmlHandler.addTypeInformation(LitNodeStyleMarkupExtension, {
    properties: { renderFunction: { default: '', type: String } }
  })
  graphmlHandler.addTypeInformation(LitHtmlNodeStyleMarkupExtension, {
    properties: { renderFunction: { default: '', type: String } }
  })
  graphmlHandler.addTypeInformation(LitLabelStyleMarkupExtension, {
    properties: {
      renderFunction: { default: '', type: String },
      size: { default: Size.EMPTY, type: Size }
    }
  })
  graphmlHandler.addTypeInformation(LitHtmlLabelStyleMarkupExtension, {
    properties: {
      renderFunction: { default: '', type: String },
      size: { default: Size.EMPTY, type: Size }
    }
  })

  graphmlHandler.addEventListener('handle-serialization', (evt) => {
    const item = evt.item
    const context = evt.context
    if (item instanceof LitNodeStyle) {
      const litNodeStyleMarkupExtension = new LitNodeStyleMarkupExtension()
      litNodeStyleMarkupExtension.renderFunction = item.renderFunction.toString()
      context.serializeReplacement(LitNodeStyleMarkupExtension, item, litNodeStyleMarkupExtension)
      evt.handled = true
    } else if (item instanceof LitHtmlNodeStyle) {
      const litHtmlNodeStyleMarkupExtension = new LitHtmlNodeStyleMarkupExtension()
      litHtmlNodeStyleMarkupExtension.renderFunction = item.renderFunction.toString()
      context.serializeReplacement(
        LitHtmlNodeStyleMarkupExtension,
        item,
        litHtmlNodeStyleMarkupExtension
      )
      evt.handled = true
    } else if (item instanceof LitLabelStyle) {
      const litLabelStyleMarkupExtension = new LitLabelStyleMarkupExtension()
      litLabelStyleMarkupExtension.renderFunction = item.renderFunction.toString()
      litLabelStyleMarkupExtension.size = item.size
      context.serializeReplacement(LitLabelStyleMarkupExtension, item, litLabelStyleMarkupExtension)
      evt.handled = true
    } else if (item instanceof LitHtmlLabelStyle) {
      const litHtmlLabelStyleMarkupExtension = new LitHtmlLabelStyleMarkupExtension()
      litHtmlLabelStyleMarkupExtension.renderFunction = item.renderFunction.toString()
      litHtmlLabelStyleMarkupExtension.size = item.size
      context.serializeReplacement(
        LitHtmlLabelStyleMarkupExtension,
        item,
        litHtmlLabelStyleMarkupExtension
      )
      evt.handled = true
    }
  })
}
