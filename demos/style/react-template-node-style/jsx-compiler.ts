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
import { ReactComponentNodeStyle } from './ReactComponentNodeStyle'
const { createElement } = React

function compileRenderFunction(jsx: string): (props: any) => any {
  const transpiledCode: string = Babel.transform('const renderFunction = ' + jsx, {
    presets: ['react', 'env']
  }).code
  // eslint-disable-next-line
  const renderFn = new Function(transpiledCode + '\n return renderFunction')()
  return props => {
    try {
      return renderFn(props)
    } catch (e) {
      return createElement('text', {}, 'Invalid template')
    }
  }
}

export type ReactComponentNodeStyleEx<T> = ReactComponentNodeStyle<T> & { jsx: string }

export function isReactComponentNodeStyleEx(o: any): o is ReactComponentNodeStyleEx<unknown> {
  return o && typeof o.jsx === 'string' && o instanceof ReactComponentNodeStyle
}

export function createReactComponentNodeStyleFromJSX(
  jsx: string
): ReactComponentNodeStyle<unknown> {
  const style = new ReactComponentNodeStyle(
    compileRenderFunction(jsx)
  ) as ReactComponentNodeStyleEx<unknown>
  style.jsx = jsx
  return style
}
