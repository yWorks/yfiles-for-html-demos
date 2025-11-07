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
import { toggleExportRectangle } from '../export-rectangle/export-rectangle'

export function initializeOptionPanel(exportCallback) {
  const useRectInput = document.querySelector('#use-rect')
  const scaleInput = document.querySelector('#scale')
  const marginInput = document.querySelector('#margin')
  const serverExportInput = document.querySelector('#server-export')
  const exportButton = document.querySelector('#export-button')

  useRectInput.addEventListener('change', () => {
    toggleExportRectangle()
  })

  exportButton.addEventListener('click', async () => {
    exportButton.disabled = !serverExportInput.checked

    const options = {
      useExportRectangle: useRectInput.checked,
      scale: parseFloat(scaleInput.value),
      margin: parseFloat(marginInput.value),
      paperSize: getPaperSize(),
      serverExport: serverExportInput.checked
    }

    if (Number.isNaN(options.scale) || options.scale <= 0) {
      alert('Scale must be a positive number.')
      return
    }

    if (Number.isNaN(options.margin) || options.margin < 0) {
      alert('Margin must be a non-negative number.')
      return
    }

    exportCallback(options)
  })
}

/**
 * Returns the chosen export paper size.
 */
function getPaperSize() {
  return document.querySelector('#paperSize').value
}
