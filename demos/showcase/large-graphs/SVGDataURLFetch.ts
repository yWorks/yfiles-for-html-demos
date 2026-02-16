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
/**
 * Loads data from an URL and encodes it as an SVG Data URL
 * @param url the URL to load the data from
 */
export async function getSVGDataURL(url: string): Promise<string> {
  const svgXml = await (await fetch(url)).text()
  return encodeSvgDataUrl(svgXml)
}

/**
 * Encodes a string into an SVG Data URL
 * @param data the string to encode
 */
function encodeSvgDataUrl(data: string): string {
  data = escapeUnicodeSurrogatePair(data)
  data = escapeNonLatin1(data)

  const base64 = window.btoa(data)
  return 'data:image/svg+xml;base64,' + base64
}

/**
 * Escapes Unicode surrogate pairs
 * @param text the text to escape
 */
function escapeUnicodeSurrogatePair(text: string): string {
  return text.replace(new RegExp('[\uD800-\uDBFF][\uDC00-\uDFFF]', 'g'), (txt) => {
    const high = txt.charCodeAt(0)
    const low = txt.charCodeAt(1)
    const codepoint = (((high & 0x03ff) << 10) | (low & 0x03ff)) + 0x10000
    return `&#${codepoint};`
  })
}

/**
 * Escapes non-Latin-1-characters
 * @param text the text to escape
 */
function escapeNonLatin1(text: string): string {
  return text.replace(new RegExp('[^\x00-\x7F]', 'g'), (txt) => `&#${txt.charCodeAt(0)};`)
}
