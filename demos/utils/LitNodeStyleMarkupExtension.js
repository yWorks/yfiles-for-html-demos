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
import { GraphMLIOHandler, ILookup, MarkupExtension } from '@yfiles/yfiles'
import { createLitNodeStyleFromSource, LitNodeStyle } from './LitNodeStyle'
/**
 * A markup extension class used for (de-)serializing a Lit node style.
 */
export class LitNodeStyleMarkupExtension extends MarkupExtension {
  _renderFunction = ''
  get renderFunction() {
    return this._renderFunction
  }
  set renderFunction(value) {
    this._renderFunction = value
  }
  provideValue(serviceProvider) {
    return createLitNodeStyleFromSource(this._renderFunction)
  }
  static create(item) {
    const litNodeStyleMarkupExtension = new LitNodeStyleMarkupExtension()
    litNodeStyleMarkupExtension.renderFunction = item.renderFunction.toString()
    return litNodeStyleMarkupExtension
  }
}
/**
 * Enable serialization of the LitNodeStyle - without a namespace mapping, serialization will fail
 */
export function registerLitNodeStyleSerialization(graphmlHandler) {
  // enable serialization of the style - this is done with a markup extension
  graphmlHandler.addTypeInformation(LitNodeStyle, {
    extension: (item) => {
      return LitNodeStyleMarkupExtension.create(item)
    }
  })
  graphmlHandler.addTypeInformation(LitNodeStyleMarkupExtension, {
    name: 'LitNodeStyle',
    xmlNamespace: 'http://www.yworks.com/demos/yfiles-lit-node-style/1.0',
    properties: {
      renderFunction: { default: '', type: String }
    }
  })
  graphmlHandler.addNamespace('http://www.yworks.com/demos/yfiles-lit-node-style/1.0', 'lit')
  graphmlHandler.addEventListener('handle-serialization', (evt) => {
    const item = evt.item
    const context = evt.context
    if (item instanceof LitNodeStyle) {
      const litNodeStyleMarkupExtension = new LitNodeStyleMarkupExtension()
      litNodeStyleMarkupExtension.renderFunction = item.renderFunction.toString()
      context.serializeReplacement(LitNodeStyleMarkupExtension, item, litNodeStyleMarkupExtension)
      evt.handled = true
    }
  })
}
