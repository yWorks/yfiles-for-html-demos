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
const puppeteer = require('puppeteer')
const path = require('path')

async function exportPdf(svg, w, h, margin, paperSize) {
  w = parseInt(w)
  h = parseInt(h)
  margin = parseInt(margin)

  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.goto(path.join(__dirname, 'index.html'), { waitUntil: 'domcontentloaded' })

  try {
    await page.evaluate(
      (svg, w, h) => {
        return window.drawSvg(svg, w, h)
      },
      svg,
      w,
      h
    )
  } catch (e) {
    console.log(`Export failed: ${e.message}`)
    console.error(e)
  }

  const pdfConfig = {
    margin: { top: `${margin}px`, bottom: `${margin}px`, left: `${margin}px`, right: `${margin}px` }
  }

  if (paperSize) {
    pdfConfig.format = paperSize
  } else {
    pdfConfig.width = `${w + 2 * margin}px`
    pdfConfig.height = `${h + 2 * margin}px`
  }

  await page.emulateMediaType('screen')
  const pdf = await page.pdf(pdfConfig)
  await browser.close()
  return pdf
}

module.exports = exportPdf
