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

type PrintingOptions = {
  usePrintRectangle: boolean
  scale: number
  margin: number
  useTilePrinting: boolean
  tileWidth: number
  tileHeight: number
}

export function initializeOptionPanel(exportCallback: (options: PrintingOptions) => void): void {
  const useRectInput = document.getElementById('useRect')! as HTMLInputElement
  const scale = document.getElementById('scale')! as HTMLInputElement
  const margin = document.getElementById('margin')! as HTMLInputElement
  const useTilePrinting = document.getElementById('useTilePrinting')! as HTMLInputElement
  const tileWidth = document.getElementById('tileWidth')! as HTMLInputElement
  const tileHeight = document.getElementById('tileHeight')! as HTMLInputElement
  const printButton = document.querySelector<HTMLButtonElement>('#print-button')!

  useRectInput.addEventListener('change', () => {
    toggleExportRectangle()
  })

  printButton.addEventListener('click', async () => {
    const options: PrintingOptions = {
      usePrintRectangle: useRectInput.checked,
      scale: parseFloat(scale.value),
      margin: parseInt(margin.value, 10),
      useTilePrinting: useTilePrinting.checked,
      tileWidth: parseInt(tileWidth.value, 10),
      tileHeight: parseInt(tileHeight.value, 10)
    }

    if (isNaN(options.scale) || options.scale <= 0) {
      alert('Scale must be a positive number.')
      return
    }

    if (isNaN(options.margin) || options.margin < 0) {
      alert('Scale must be a non-negative number.')
      return
    }

    if (useTilePrinting.checked) {
      if (isNaN(options.tileWidth) || options.tileWidth <= 0) {
        alert('Tile width must be a positive number.')
        return
      }
      if (isNaN(options.tileHeight) || options.tileHeight <= 0) {
        alert('Tile height must be a positive number.')
        return
      }
    }

    exportCallback(options)
  })
}
