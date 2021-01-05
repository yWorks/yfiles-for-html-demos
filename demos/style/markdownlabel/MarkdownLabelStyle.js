/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Font, MarkupLabelStyle, MarkupLabelStyleRenderer, Size, TextWrapping } from 'yfiles'

/**
 * A label style that renders markdown label text by converting it to HTML markup
 * and delegating the rendering to {@link MarkupLabelStyle}.
 */
export class MarkdownLabelStyle extends MarkupLabelStyle {
  /**
   * Creates a new instance using the provided optional options object.
   * @param options The options available in {@link MarkupLabelStyle}
   * @param {*} [options]
   */
  constructor(options) {
    if (!options) {
      super(new MarkdownLabelStyleRenderer())
    } else {
      options.renderer = options.renderer || new MarkdownLabelStyleRenderer()
      super(options)
    }
  }
}

class MarkdownLabelStyleRenderer extends MarkupLabelStyleRenderer {
  /**
   * Converts the given markdown text into HTML markup.
   * @param {!string} markdownText The label markdown text
   * @yjs:keep=render
   * @returns {*}
   */
  static getMarkupText(markdownText) {
    // create markdown parser
    const md = window.markdownit()
    // return the markdown text
    return md.render(markdownText)
  }

  /**
   * @param {!SVGTextElement} textElement
   * @param {!Font} font
   * @param {!string} text
   * @param {!Size} maxSize
   * @param {!(TextWrapping|'none'|'character'|'character-ellipsis'|'word'|'word-ellipsis')} wrapping
   * @param {boolean} rightToLeft
   * @returns {!string}
   */
  addTextElements(textElement, font, text, maxSize, wrapping, rightToLeft) {
    // call the super implementation with the converted markdown text
    super.addTextElements(
      textElement,
      font,
      MarkdownLabelStyleRenderer.getMarkupText(text),
      maxSize,
      wrapping,
      rightToLeft
    )
    return text
  }

  /**
   * @param {!string} text
   * @param {!Font} font
   * @param {!Size} maximumSize
   * @returns {!Size}
   */
  measureText(text, font, maximumSize) {
    // call the super implementation with the converted markdown text
    return super.measureText(MarkdownLabelStyleRenderer.getMarkupText(text), font, maximumSize)
  }
}
