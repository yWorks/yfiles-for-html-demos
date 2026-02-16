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
import { toggleExportRectangle } from '../export-rectangle/export-rectangle'

export function initializeOptionPanel(exportCallback) {
  const useRectInput = document.querySelector('#useRect')
  const fitToTile = document.querySelector('#fitToTile')
  const scale = document.querySelector('#scale')
  const margin = document.querySelector('#margin')
  const useTilePrinting = document.querySelector('#useTilePrinting')
  const skipEmptyTiles = document.querySelector('#skipEmptyTiles')
  const paperSize = document.querySelector('#paperSize')
  const tileWidth = document.querySelector('#tileWidth')
  const tileHeight = document.querySelector('#tileHeight')
  const printButton = document.querySelector('#print-button')

  useRectInput.addEventListener('change', () => {
    toggleExportRectangle()
  })

  // disable scale input field if fit to page option is selected
  useTilePrinting.addEventListener('change', () => {
    paperSize.disabled = !useTilePrinting.checked
    fitToTile.disabled = !useTilePrinting.checked
    skipEmptyTiles.disabled = !useTilePrinting.checked
  })

  // change tile width and height based on paper size selection
  paperSize.addEventListener('change', () => {
    if (paperSize.value === 'letter') {
      tileWidth.value = '816'
      tileHeight.value = '1056'
    } else if (paperSize.value === 'a4') {
      tileWidth.value = '794'
      tileHeight.value = '1123'
    }
    tileWidth.disabled = !(paperSize.value === 'custom')
    tileHeight.disabled = !(paperSize.value === 'custom')
  })

  printButton.addEventListener('click', async () => {
    const options = {
      usePrintRectangle: useRectInput.checked,
      fitToTile: fitToTile.checked,
      scale: parseFloat(scale.value),
      margin: parseInt(margin.value, 10),
      useTilePrinting: useTilePrinting.checked,
      skipEmptyTiles: skipEmptyTiles.checked,
      tileWidth: parseInt(tileWidth.value, 10),
      tileHeight: parseInt(tileHeight.value, 10)
    }

    if (Number.isNaN(options.scale) || options.scale <= 0) {
      alert('Scale must be a positive number.')
      return
    }

    if (Number.isNaN(options.margin) || options.margin < 0) {
      alert('Scale must be a non-negative number.')
      return
    }

    if (useTilePrinting.checked) {
      if (Number.isNaN(options.tileWidth) || options.tileWidth <= 0) {
        alert('Tile width must be a positive number.')
        return
      }
      if (Number.isNaN(options.tileHeight) || options.tileHeight <= 0) {
        alert('Tile height must be a positive number.')
        return
      }
    }

    exportCallback(options)
  })
}
