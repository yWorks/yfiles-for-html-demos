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
import { Font, Size, TextRenderSupport, TextWrapping } from '@yfiles/yfiles'

export function convertTextToWrappedSVG(text, parameter) {
  // parse "parameter" according to this spec:
  // width height [;font[;trimming[;color]?]?]?
  //
  // where:
  // "width" is an integer
  // "height" is an integer
  // "font" is a css-like font shorthand
  // "trimming" is "none"|"word"|"character"|"character-ellipsis"|"word-ellipsis"
  // "color" is a css color shorthand

  // early exit for no text or no parameters
  if ((text?.length ?? 0) === 0 || !parameter) {
    return text
  }

  // Parse the "parameter" string into its components
  const [dimensions, font, trimming, color] = parameter.split(';').map((s) => s.trim())

  // Create an SVG text element to add the text to
  const svgNS = 'http://www.w3.org/2000/svg'
  const textElement = document.createElementNS(svgNS, 'text')

  // set the color
  if (color) {
    textElement.style.fill = color
  }

  // determine the size
  const [widthStr, heightStr] = dimensions?.split(' ') || []
  const width = parseInt(widthStr, 10)
  const height = parseInt(heightStr, 10)
  const maximumSize = new Size(
    width > 0 ? width : Number.POSITIVE_INFINITY,
    height > 0 ? height : Number.POSITIVE_INFINITY
  )

  // and translate the text wrapping constants using the yFiles for HTML 2.6 values for
  // backwards compatibility
  const wrapping =
    {
      none: TextWrapping.NONE,
      word: TextWrapping.WRAP_WORD,
      character: TextWrapping.WRAP_CHARACTER,
      'character-ellipsis': TextWrapping.WRAP_CHARACTER_ELLIPSIS,
      'word-ellipsis': TextWrapping.WRAP_WORD_ELLIPSIS
    }[trimming] ?? TextWrapping.TRIM_CHARACTER

  // use the yFiles convenience method to perform the heavy lifting of text wrapping
  TextRenderSupport.addText(textElement, text, Font.from(font), maximumSize, wrapping)
  return textElement
}
