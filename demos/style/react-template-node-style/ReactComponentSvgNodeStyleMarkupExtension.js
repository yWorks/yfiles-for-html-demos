/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
  Attribute,
  Class,
  GraphMLAttribute,
  GraphMLIOHandler,
  ILookup,
  MarkupExtension,
  TypeAttribute,
  XamlAttributeWritePolicy,
  YNumber,
  YString
} from 'yfiles'
import {
  createReactComponentSvgNodeStyleFromJSX,
  createReactComponentSvgLabelStyleFromJSX,
  isReactComponentSvgLabelStyleEx,
  isReactComponentSvgNodeStyleEx,
  isReactComponentHtmlNodeStyleEx,
  isReactComponentHtmlLabelStyleEx,
  createReactComponentHtmlLabelStyleFromJSX,
  createReactComponentHtmlNodeStyleFromJSX,
  isReactComponentStyleEx
} from './jsx-compiler.js'

/**
 * @typedef {(Attribute|Array.<Attribute>)} OneOrMoreAttributes
 */
/**
 * @typedef {*} MarkupExtensionMetaAttributes
 */

export class ReactComponentSvgNodeStyleMarkupExtension extends MarkupExtension {
  _jsx = ''

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
   * @type {!MarkupExtensionMetaAttributes.<ReactComponentSvgNodeStyleMarkupExtension>}
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
    return createReactComponentSvgNodeStyleFromJSX(this.jsx)
  }
}

export class ReactComponentHtmlNodeStyleMarkupExtension extends MarkupExtension {
  _jsx = ''

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
   * @type {!MarkupExtensionMetaAttributes.<ReactComponentHtmlNodeStyleMarkupExtension>}
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
    return createReactComponentHtmlNodeStyleFromJSX(this.jsx)
  }
}

export class ReactComponentSvgLabelStyleMarkupExtension extends MarkupExtension {
  _jsx = ''
  _width = 0
  _height = 0

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
   * @type {number}
   */
  get width() {
    return this._width
  }

  /**
   * @type {number}
   */
  set width(value) {
    this._width = value
  }

  /**
   * @type {number}
   */
  get height() {
    return this._height
  }

  /**
   * @type {number}
   */
  set height(value) {
    this._height = value
  }

  /**
   * @type {!MarkupExtensionMetaAttributes.<ReactComponentSvgLabelStyleMarkupExtension>}
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
      ],
      width: [
        GraphMLAttribute().init({
          defaultValue: 0,
          writeAsAttribute: XamlAttributeWritePolicy.NEVER
        }),
        TypeAttribute(YNumber.$class)
      ],
      height: [
        GraphMLAttribute().init({
          defaultValue: 0,
          writeAsAttribute: XamlAttributeWritePolicy.NEVER
        }),
        TypeAttribute(YNumber.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   */
  provideValue(serviceProvider) {
    return createReactComponentSvgLabelStyleFromJSX(this.jsx, [this.width, this.height])
  }
}

export class ReactComponentHtmlLabelStyleMarkupExtension extends MarkupExtension {
  _jsx = ''
  _width = 0
  _height = 0

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
   * @type {number}
   */
  get width() {
    return this._width
  }

  /**
   * @type {number}
   */
  set width(value) {
    this._width = value
  }

  /**
   * @type {number}
   */
  get height() {
    return this._height
  }

  /**
   * @type {number}
   */
  set height(value) {
    this._height = value
  }

  /**
   * @type {!MarkupExtensionMetaAttributes.<ReactComponentHtmlLabelStyleMarkupExtension>}
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
      ],
      width: [
        GraphMLAttribute().init({
          defaultValue: 0,
          writeAsAttribute: XamlAttributeWritePolicy.NEVER
        }),
        TypeAttribute(YNumber.$class)
      ],
      height: [
        GraphMLAttribute().init({
          defaultValue: 0,
          writeAsAttribute: XamlAttributeWritePolicy.NEVER
        }),
        TypeAttribute(YNumber.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   */
  provideValue(serviceProvider) {
    return createReactComponentHtmlLabelStyleFromJSX(this.jsx, [this.width, this.height])
  }
}

/**
 * @param {!GraphMLIOHandler} graphmlHandler
 */
export function registerReactComponentNodeStyleSerialization(graphmlHandler) {
  // We need to instantiate ReactComponentNodeStyleMarkupExtension once for GraphML IO to work properly
  // class ensure keeps minifiers from removing the instantiation
  Class.ensure(Object.getPrototypeOf(new ReactComponentSvgNodeStyleMarkupExtension()))
  Class.ensure(Object.getPrototypeOf(new ReactComponentSvgLabelStyleMarkupExtension()))
  Class.ensure(Object.getPrototypeOf(new ReactComponentHtmlNodeStyleMarkupExtension()))
  Class.ensure(Object.getPrototypeOf(new ReactComponentHtmlLabelStyleMarkupExtension()))

  // enable serialization of the React node style - without a namespace mapping, serialization will fail
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/demos/yfiles-react-jsx-node-style/1.0',
    {
      ReactComponentNodeStyle: ReactComponentSvgNodeStyleMarkupExtension,
      ReactComponentLabelStyle: ReactComponentSvgLabelStyleMarkupExtension
    }
  )
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/demos/yfiles-react-jsx-node-style/2.0',
    {
      ReactComponentSvgNodeStyle: ReactComponentSvgNodeStyleMarkupExtension,
      ReactComponentSvgLabelStyle: ReactComponentSvgLabelStyleMarkupExtension,
      ReactComponentHtmlNodeStyle: ReactComponentHtmlNodeStyleMarkupExtension,
      ReactComponentHtmlLabelStyle: ReactComponentHtmlLabelStyleMarkupExtension
    }
  )
  graphmlHandler.addNamespace(
    'http://www.yworks.com/demos/yfiles-react-jsx-node-style/1.0',
    'react-old'
  )
  graphmlHandler.addNamespace(
    'http://www.yworks.com/demos/yfiles-react-jsx-node-style/2.0',
    'react'
  )
  graphmlHandler.addHandleSerializationListener((_, evt) => {
    const item = evt.item
    if (isReactComponentStyleEx(item)) {
      const context = evt.context
      if (isReactComponentSvgNodeStyleEx(item)) {
        const reactExtension = new ReactComponentSvgNodeStyleMarkupExtension()
        reactExtension.jsx = item.jsx
        context.serializeReplacement(
          ReactComponentSvgNodeStyleMarkupExtension.$class,
          item,
          reactExtension
        )
        evt.handled = true
      } else if (isReactComponentSvgLabelStyleEx(item)) {
        const reactExtension = new ReactComponentSvgLabelStyleMarkupExtension()
        reactExtension.jsx = item.jsx
        reactExtension.width = item.size.width
        reactExtension.height = item.size.height
        context.serializeReplacement(
          ReactComponentSvgLabelStyleMarkupExtension.$class,
          item,
          reactExtension
        )
        evt.handled = true
      } else if (isReactComponentHtmlNodeStyleEx(item)) {
        const reactExtension = new ReactComponentHtmlNodeStyleMarkupExtension()
        reactExtension.jsx = item.jsx
        context.serializeReplacement(
          ReactComponentHtmlNodeStyleMarkupExtension.$class,
          item,
          reactExtension
        )
        evt.handled = true
      } else if (isReactComponentHtmlLabelStyleEx(item)) {
        const reactExtension = new ReactComponentHtmlLabelStyleMarkupExtension()
        reactExtension.jsx = item.jsx
        reactExtension.width = item.size.width
        reactExtension.height = item.size.height
        context.serializeReplacement(
          ReactComponentHtmlLabelStyleMarkupExtension.$class,
          item,
          reactExtension
        )
        evt.handled = true
      }
    }
  })
}
