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
/**
 * Load custom fonts used in some labels of the sample graph.
 *
 * This is ONLY required if you want to export Cyrillic or Hiragana characters. jsPDF supports the
 * most common fonts out of the box. However, to register other custom fonts, please see
 * https://github.com/MrRio/jsPDF#use-of-unicode-characters--utf-8
 * @returns {!Promise.<Array.<Awaited.<CustomFontDescriptor>>>}
 */
export async function loadExternalFonts() {
  const externalFonts = [
    {
      filename: 'Kosugi-Regular.ttf',
      id: 'Kosugi',
      style: 'normal',
      source: 'https://cdn.jsdelivr.net/fontsource/fonts/kosugi@latest/japanese-400-normal.ttf'
    },
    {
      filename: 'Prata-Regular.ttf',
      id: 'Prata',
      style: 'normal',
      source: 'https://cdn.jsdelivr.net/fontsource/fonts/prata@latest/cyrillic-400-normal.ttf'
    }
  ]
  return Promise.all(
    externalFonts.map(async (font) => {
      const response = await fetch(font.source)
      const buffer = await response.arrayBuffer()
      const dataUrl = await bytesToBase64DataUrl(buffer)
      const data = dataUrl.replace(/.*?base64,(.*)/, '$1')
      return { data, ...font }
    })
  )
}

/**
 * @param {!ArrayBuffer} bytes
 * @param {!'application/octet-stream'} [type=application/octet-stream]
 * @returns {!Promise.<string>}
 */
async function bytesToBase64DataUrl(bytes, type = 'application/octet-stream') {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => void resolve(reader.result))
    reader.addEventListener('error', () => void reject(reader.error))
    reader.readAsDataURL(new File([bytes], '', { type }))
  })
}
