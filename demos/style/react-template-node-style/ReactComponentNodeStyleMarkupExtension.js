/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphMLAttribute,
  GraphMLIOHandler,
  ILookup,
  MarkupExtension,
  TypeAttribute,
  XamlAttributeWritePolicy,
  YString
} from 'yfiles'
import {
  createReactComponentNodeStyleFromJSX,
  isReactComponentNodeStyleEx
} from './jsx-compiler.js'

export class ReactComponentNodeStyleMarkupExtension extends MarkupExtension {
  constructor() {
    super()
    this._jsx = ''
  }

  /**
   * @type {!string}
   */
  get jsx() {
    return this._jsx
  }

  /**
   * @type {!string}
   */
  set jsx(value) {
    this._jsx = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      $self: [GraphMLAttribute().init({ contentProperty: 'jsx' })],
      jsx: [
        GraphMLAttribute().init({
          defaultValue: '',
          writeAsAttribute: XamlAttributeWritePolicy.NEVER
        }),
        TypeAttribute(YString.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   */
  provideValue(serviceProvider) {
    return createReactComponentNodeStyleFromJSX(this.jsx)
  }
}

/**
 * @param {!GraphMLIOHandler} graphmlHandler
 */
export function registerReactComponentNodeStyleSerialization(graphmlHandler) {
  const ignore = new ReactComponentNodeStyleMarkupExtension()

  // enable serialization of the React node style - without a namespace mapping, serialization will fail
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/demos/yfiles-react-jsx-node-style/1.0',
    { ReactComponentNodeStyle: ReactComponentNodeStyleMarkupExtension }
  )
  graphmlHandler.addNamespace(
    'http://www.yworks.com/demos/yfiles-react-jsx-node-style/1.0',
    'react'
  )
  graphmlHandler.addHandleSerializationListener((sender, args) => {
    const item = args.item
    const context = args.context
    if (isReactComponentNodeStyleEx(item)) {
      const reactExtension = new ReactComponentNodeStyleMarkupExtension()
      reactExtension.jsx = item.jsx
      context.serializeReplacement(
        ReactComponentNodeStyleMarkupExtension.$class,
        item,
        reactExtension
      )
      args.handled = true
    }
  })
}
