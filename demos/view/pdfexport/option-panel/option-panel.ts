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
import { toggleExportRectangle } from '../export-rectangle/export-rectangle'
import { PaperSize } from '../PaperSize'
import type { PdfExportOptions } from '../PdfExportOptions'

export function initializeOptionPanel(exportCallback: (options: PdfExportOptions) => void): void {
  const useRectInput = document.querySelector<HTMLInputElement>('#use-rect')!
  const scaleInput = document.querySelector<HTMLInputElement>('#scale')!
  const marginInput = document.querySelector<HTMLInputElement>('#margin')!
  const serverExportInput = document.querySelector<HTMLInputElement>('#server-export')!
  const exportButton = document.querySelector<HTMLButtonElement>('#export-button')!

  useRectInput.addEventListener('change', () => {
    toggleExportRectangle()
  })

  exportButton.addEventListener('click', async () => {
    exportButton.disabled = !serverExportInput.checked

    const options: PdfExportOptions = {
      useExportRectangle: useRectInput.checked,
      scale: parseFloat(scaleInput.value),
      margin: parseFloat(marginInput.value),
      paperSize: getPaperSize(),
      serverExport: serverExportInput.checked
    }

    if (isNaN(options.scale) || options.scale <= 0) {
      alert('Scale must be a positive number.')
      return
    }

    if (isNaN(options.margin) || options.margin < 0) {
      alert('Margin must be a non-negative number.')
      return
    }

    exportCallback(options)
  })
}

/**
 * Returns the chosen export paper size.
 */
function getPaperSize(): PaperSize {
  const inputPaperSize = document.getElementById('paperSize') as HTMLSelectElement
  return PaperSize[inputPaperSize.value as keyof typeof PaperSize]
}
