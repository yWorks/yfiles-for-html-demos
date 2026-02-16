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
import { svg } from 'lit-html'
import { ref } from 'lit-html/directives/ref.js'
import { styleMap } from 'lit-html/directives/style-map.js'
import { Font, Size, TextRenderSupport, TextWrapping } from '@yfiles/yfiles'

/**
 * SvgText - a function that returns a SVG TemplateResult representing a multi-line text.
 * Call it from inside a Lit component's render() or any other lit-template context.
 */
export function LitSvgText({
  x = 0,
  y = 0,
  text = '',
  textAnchor = 'start',
  font = 'normal 12px sans-serif',
  maxWidth = Number.MAX_VALUE,
  maxHeight = Number.MAX_VALUE,
  fill = '#000',
  className = '',
  style = {}
}) {
  return svg`
    <text
      transform="translate(${x}, ${y})"
      text-anchor="${textAnchor}"
      class="${className}"
      fill="${fill}"
      style=${styleMap(style)}
      ${ref((el) => {
        // ref callback runs on attach/update; el is null when element is removed
        if (!el) return

        // Clear existing children
        while (el.firstChild) {
          el.firstChild.remove()
        }

        // Imperative external library call
        TextRenderSupport.addText(
          el,
          text,
          Font.from(font),
          new Size(maxWidth, maxHeight),
          TextWrapping.WRAP_WORD_ELLIPSIS
        )
      })}
    ></text>
  `
}
