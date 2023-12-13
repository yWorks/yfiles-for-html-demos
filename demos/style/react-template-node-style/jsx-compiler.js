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
import { ReactComponentSvgNodeStyle } from './ReactComponentSvgNodeStyle.js'
import { ReactComponentSvgLabelStyle } from './ReactComponentSvgLabelStyle.js'
import { ReactComponentHtmlNodeStyle } from './ReactComponentHtmlNodeStyle.js'
import { ReactComponentHtmlLabelStyle } from './ReactComponentHtmlLabelStyle.js'
import { SvgText } from './SvgText.js'
import { transform } from '@babel/standalone'
import * as React from 'react'

// We need a global React at runtime
window.React = React

/**
 * The following is a simple "compile" function that is inherently unsafe in that
 * it executes the code in the string.
 * Make sure that the code comes from a trusted source.
 * @param {!string} jsx the trusted JSX string that will be compiled by this function
 * @returns {!function}
 */
function compileRenderFunction(jsx) {
  const transpiledCode = transform('const renderFunction = ' + jsx, {
    presets: ['react', 'env']
  }).code
  // eslint-disable-next-line
  const renderFn = new Function('SvgText', transpiledCode + '\n return renderFunction')(SvgText)
  return (props) => {
    try {
      return renderFn(props)
    } catch (e) {
      console.log(e)
      return React.createElement('text', {}, `Invalid template: ${e.message}`)
    }
  }
}

/**
 * @typedef {*} JSXCacheType
 */
/**
 * @typedef {JSXCacheType.<ReactComponentSvgNodeStyle.<T>>} ReactComponentSvgNodeStyleEx
 */
/**
 * @typedef {JSXCacheType.<ReactComponentHtmlNodeStyle.<T>>} ReactComponentHtmlNodeStyleEx
 */

/**
 * @typedef {JSXCacheType.<ReactComponentSvgLabelStyle.<T>>} ReactComponentSvgLabelStyleEx
 */
/**
 * @typedef {JSXCacheType.<ReactComponentHtmlLabelStyle.<T>>} ReactComponentHtmlLabelStyleEx
 */

/**
 * @param {*} o
 * @returns {!ReactComponentSvgNodeStyleEx.<unknown>}
 */
export function isReactComponentSvgNodeStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentSvgNodeStyle
}

/**
 * @param {*} o
 * @returns {!ReactComponentHtmlNodeStyleEx.<unknown>}
 */
export function isReactComponentHtmlNodeStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentHtmlNodeStyle
}

/**
 * @param {*} o
 * @returns {!ReactComponentSvgLabelStyleEx.<unknown>}
 */
export function isReactComponentSvgLabelStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentSvgLabelStyle
}

/**
 * @param {*} o
 * @returns {!ReactComponentHtmlLabelStyleEx.<unknown>}
 */
export function isReactComponentHtmlLabelStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentHtmlLabelStyle
}

/**
 * @param {*} o
 * @returns {!object}
 */
export function isReactComponentStyleEx(o) {
  return o && typeof o.jsx === 'string'
}

/**
 * @param {!string} jsx
 * @returns {!ReactComponentSvgNodeStyle.<unknown>}
 */
export function createReactComponentSvgNodeStyleFromJSX(jsx) {
  const style = new ReactComponentSvgNodeStyle(compileRenderFunction(jsx))
  style.jsx = jsx
  return style
}

/**
 * @param {!string} jsx
 * @returns {!ReactComponentHtmlNodeStyle.<unknown>}
 */
export function createReactComponentHtmlNodeStyleFromJSX(jsx) {
  const style = new ReactComponentHtmlNodeStyle(compileRenderFunction(jsx))
  style.jsx = jsx
  return style
}

/**
 * @param {!string} jsx
 * @param {!(Size|SizeConvertible)} size
 * @returns {!ReactComponentSvgLabelStyle.<unknown>}
 */
export function createReactComponentSvgLabelStyleFromJSX(jsx, size) {
  const style = new ReactComponentSvgLabelStyle(compileRenderFunction(jsx), size)
  style.jsx = jsx
  return style
}

/**
 * @param {!string} jsx
 * @param {!(Size|SizeConvertible)} size
 * @returns {!ReactComponentHtmlLabelStyle}
 */
export function createReactComponentHtmlLabelStyleFromJSX(jsx, size) {
  const style = new ReactComponentHtmlLabelStyle(compileRenderFunction(jsx), size)
  style.jsx = jsx
  return style
}
