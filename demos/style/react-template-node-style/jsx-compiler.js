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
import { ReactComponentSvgNodeStyle } from './ReactComponentSvgNodeStyle'
import { ReactComponentSvgLabelStyle } from './ReactComponentSvgLabelStyle'
import { ReactComponentHtmlNodeStyle } from './ReactComponentHtmlNodeStyle'
import { ReactComponentHtmlLabelStyle } from './ReactComponentHtmlLabelStyle'
import { SvgText } from './SvgText'
import { transform } from '@babel/standalone'
import * as React from 'react'
// We need a global React at runtime
window.React = React
/**
 * The following is a simple "compile" function that is inherently unsafe in that
 * it executes the code in the string.
 * Make sure that the code comes from a trusted source.
 * @param jsx the trusted JSX string that will be compiled by this function
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
export function isReactComponentSvgNodeStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentSvgNodeStyle
}
export function isReactComponentHtmlNodeStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentHtmlNodeStyle
}
export function isReactComponentSvgLabelStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentSvgLabelStyle
}
export function isReactComponentHtmlLabelStyleEx(o) {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentHtmlLabelStyle
}
export function isReactComponentStyleEx(o) {
  return o && typeof o.jsx === 'string'
}
export function createReactComponentSvgNodeStyleFromJSX(jsx) {
  const style = new ReactComponentSvgNodeStyle(compileRenderFunction(jsx))
  style.jsx = jsx
  return style
}
export function createReactComponentHtmlNodeStyleFromJSX(jsx) {
  const style = new ReactComponentHtmlNodeStyle(compileRenderFunction(jsx))
  style.jsx = jsx
  return style
}
export function createReactComponentSvgLabelStyleFromJSX(jsx, size) {
  const style = new ReactComponentSvgLabelStyle(compileRenderFunction(jsx), size)
  style.jsx = jsx
  return style
}
export function createReactComponentHtmlLabelStyleFromJSX(jsx, size) {
  const style = new ReactComponentHtmlLabelStyle(compileRenderFunction(jsx), size)
  style.jsx = jsx
  return style
}
