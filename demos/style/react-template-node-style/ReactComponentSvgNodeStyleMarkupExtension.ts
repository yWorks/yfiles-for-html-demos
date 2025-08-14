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
import {
  createReactComponentHtmlLabelStyleFromJSX,
  createReactComponentHtmlNodeStyleFromJSX,
  createReactComponentSvgLabelStyleFromJSX,
  createReactComponentSvgNodeStyleFromJSX,
  isReactComponentHtmlLabelStyleEx,
  isReactComponentHtmlNodeStyleEx,
  isReactComponentStyleEx,
  isReactComponentSvgLabelStyleEx,
  isReactComponentSvgNodeStyleEx
} from './jsx-compiler'

export class ReactComponentSvgNodeStyleMarkupExtension extends MarkupExtension {
  private _jsx = ''

  get jsx(): string {
    return this._jsx
  }

  set jsx(value: string) {
    this._jsx = value
  }

  provideValue(serviceProvider: ILookup) {
    return createReactComponentSvgNodeStyleFromJSX(this.jsx)
  }
}

export class ReactComponentHtmlNodeStyleMarkupExtension extends MarkupExtension {
  private _jsx = ''

  get jsx(): string {
    return this._jsx
  }

  set jsx(value: string) {
    this._jsx = value
  }

  provideValue(serviceProvider: ILookup) {
    return createReactComponentHtmlNodeStyleFromJSX(this.jsx)
  }
}

export class ReactComponentSvgLabelStyleMarkupExtension extends MarkupExtension {
  private _jsx = ''
  private _width = 0
  private _height = 0

  get jsx(): string {
    return this._jsx
  }

  set jsx(value: string) {
    this._jsx = value
  }

  get width(): number {
    return this._width
  }

  set width(value: number) {
    this._width = value
  }

  get height(): number {
    return this._height
  }

  set height(value: number) {
    this._height = value
  }

  provideValue(serviceProvider: ILookup) {
    return createReactComponentSvgLabelStyleFromJSX(this.jsx, [this.width, this.height])
  }
}

export class ReactComponentHtmlLabelStyleMarkupExtension extends MarkupExtension {
  private _jsx = ''
  private _width = 0
  private _height = 0

  get jsx(): string {
    return this._jsx
  }

  set jsx(value: string) {
    this._jsx = value
  }

  get width(): number {
    return this._width
  }

  set width(value: number) {
    this._width = value
  }

  get height(): number {
    return this._height
  }

  set height(value: number) {
    this._height = value
  }

  provideValue(serviceProvider: ILookup) {
    return createReactComponentHtmlLabelStyleFromJSX(this.jsx, [this.width, this.height])
  }
}

export function registerReactComponentNodeStyleSerialization(graphmlHandler: GraphMLIOHandler) {
  initMarkupExtensions()

  // enable deserialization of old React node styles
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/demos/yfiles-react-jsx-node-style/1.0',
    {
      ReactComponentNodeStyle: ReactComponentSvgNodeStyleMarkupExtension,
      ReactComponentLabelStyle: ReactComponentSvgLabelStyleMarkupExtension
    }
  )
  // enable serialization and deserialization of new React node styles
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

  //Add property information for the extensions
  graphmlHandler.addTypeInformation(ReactComponentSvgNodeStyleMarkupExtension, {
    properties: { jsx: { default: null, type: String } }
  })
  graphmlHandler.addTypeInformation(ReactComponentSvgLabelStyleMarkupExtension, {
    properties: {
      jsx: { default: null, type: String },
      width: { default: 0, type: Number },
      height: { default: 0, type: Number }
    }
  })
  graphmlHandler.addTypeInformation(ReactComponentHtmlNodeStyleMarkupExtension, {
    properties: { jsx: { default: null, type: String } }
  })
  graphmlHandler.addTypeInformation(ReactComponentHtmlLabelStyleMarkupExtension, {
    properties: {
      jsx: { default: null, type: String },
      width: { default: 0, type: Number },
      height: { default: 0, type: Number }
    }
  })

  graphmlHandler.addEventListener('handle-serialization', (evt) => {
    const item = evt.item
    if (isReactComponentStyleEx(item)) {
      const context = evt.context
      if (isReactComponentSvgNodeStyleEx(item)) {
        const reactExtension = new ReactComponentSvgNodeStyleMarkupExtension()
        reactExtension.jsx = item.jsx
        context.serializeReplacement(
          ReactComponentSvgNodeStyleMarkupExtension,
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
          ReactComponentSvgLabelStyleMarkupExtension,
          item,
          reactExtension
        )
        evt.handled = true
      } else if (isReactComponentHtmlNodeStyleEx(item)) {
        const reactExtension = new ReactComponentHtmlNodeStyleMarkupExtension()
        reactExtension.jsx = item.jsx
        context.serializeReplacement(
          ReactComponentHtmlNodeStyleMarkupExtension,
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
          ReactComponentHtmlLabelStyleMarkupExtension,
          item,
          reactExtension
        )
        evt.handled = true
      }
    }
  })
}

function initMarkupExtensions() {
  // We need to instantiate ReactComponentNodeStyleMarkupExtension once for GraphML IO to work properly
  return [
    new ReactComponentSvgNodeStyleMarkupExtension(),
    new ReactComponentSvgLabelStyleMarkupExtension(),
    new ReactComponentHtmlNodeStyleMarkupExtension(),
    new ReactComponentHtmlLabelStyleMarkupExtension()
  ]
}
