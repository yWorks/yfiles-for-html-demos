/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, IGraph, Insets, Rect, Size, SvgExport } from 'yfiles'

/**
 * Helper class for printing the contents of a graph component.
 * Printing is done in multiple steps. First, the graph is exported to one or
 * more SVG elements, these elements are then added to a new document in a
 * new window, and finally, this window is printed using the browser's print
 * feature.
 */
export default class PrintingSupport {
  /**
   * Creates a new instance of this class.
   */
  constructor() {
    this.margin = 5
    this.scale = 1.0
    this.tiledPrinting = false
    this.tileWidth = 595
    this.tileHeight = 842
    this.targetUrl = './printdocument.html'
  }

  /**
   * Prints the detail of the given graph that is specified by the
   * <code>clippingRectangle</code>.
   * If no clipping rectangle is specified, the complete graph is printed.
   * @param {IGraph} graph
   * @param {Rect} clippingRectangle
   */
  printGraph(graph, clippingRectangle) {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new GraphComponent()
    // ... and assign it the same graph.
    exportComponent.graph = graph
    exportComponent.updateContentRect()
    this.print(exportComponent, clippingRectangle)
  }

  /**
   * Prints the detail of the given GraphComponent's graph that is specified by the
   * <code>clippingRectangle</code>.
   * If no clipping rectangle is specified, the complete graph is printed.
   * @param {GraphComponent} graphComponent
   * @param {Rect} clippingRectangle
   */
  async print(graphComponent, clippingRectangle) {
    const targetRect = clippingRectangle != null ? clippingRectangle : graphComponent.contentRect

    let /** @type {number} */ rows
    let /** @type {number} */ columns
    let /** @type {Rect[][]} */ tiles

    if (!this.tiledPrinting) {
      // no tiles - just one row and column
      rows = 1
      columns = 1
      tiles = [[targetRect]]
    } else {
      // get the size of the printed tiles
      const tileSize = new Size(this.tileWidth, this.tileHeight)
      const tileSizeScaled = new Size(tileSize.width / this.scale, tileSize.height / this.scale)

      // calculate number of rows and columns
      rows = Math.ceil((targetRect.height * this.scale) / tileSize.height)
      columns = Math.ceil((targetRect.width * this.scale) / tileSize.width)

      // calculate tile bounds
      tiles = []
      for (let i = 0; i < rows; i++) {
        const column = []
        for (let k = 0; k < columns; k++) {
          column.push(
            new Rect(
              targetRect.x + tileSizeScaled.width * k,
              targetRect.y + tileSizeScaled.height * i,
              tileSizeScaled.width,
              tileSizeScaled.height
            )
          )
        }
        tiles.push(column)
      }
      // calculate bounds of last row/column
      const lastX = targetRect.x + tileSizeScaled.width * (columns - 1)
      const lastY = targetRect.y + tileSizeScaled.height * (rows - 1)
      const lastWidth = targetRect.width - tileSizeScaled.width * (columns - 1)
      const lastHeight = targetRect.height - tileSizeScaled.height * (rows - 1)
      // set bounds of last row
      for (let k = 0; k < columns - 1; k++) {
        tiles[rows - 1][k] = new Rect(
          targetRect.x + tileSizeScaled.width * k,
          lastY,
          tileSizeScaled.width,
          lastHeight
        )
      }
      // set bounds of last column
      for (let i = 0; i < rows - 1; i++) {
        tiles[i][columns - 1] = new Rect(
          lastX,
          targetRect.y + tileSizeScaled.height * i,
          lastWidth,
          tileSizeScaled.height
        )
      }
      // set bounds of bottom right tile
      tiles[rows - 1][columns - 1] = new Rect(lastX, lastY, lastWidth, lastHeight)
    }

    let resultingHTML = ''
    // loop through all rows and columns
    for (let i = 0; i < rows; i++) {
      for (let k = 0; k < columns; k++) {
        const lastRow = i === rows - 1
        const lastColumn = k === columns - 1

        const exporter = new SvgExport(tiles[i][k], this.scale)
        exporter.copyDefsElements = true
        exporter.encodeImagesBase64 = true
        exporter.inlineSvgImages = true
        this.configureMargin(exporter, i === 0, lastRow, k === 0, lastColumn)

        if (!lastRow || !lastColumn) {
          resultingHTML += "<div class='pagebreak'>"
        } else {
          resultingHTML += '<div>'
        }
        // export the svg to an XML string
        const svgElement = await exporter.exportSvgAsync(graphComponent)
        resultingHTML += SvgExport.exportSvgString(svgElement)
        resultingHTML += '</div>'
      }
    }

    // This function has to be global, because it is called from the print preview window.
    window.addPrintDom = win => {
      win.document.body.innerHTML = resultingHTML
      win.document.close()
      // Wait for everything to be rendered before printing
      setTimeout(() => {
        win.print()
      }, 0)
    }

    // display exported svg in new window
    const printWindow = window.open(this.targetUrl)

    if (!printWindow) {
      alert('Could not open print preview window - maybe it was blocked?')
    }
  }

  /**
   * @param {SvgExport} exporter
   * @param {boolean} firstRow
   * @param {boolean} lastRow
   * @param {boolean} firstColumn
   * @param {boolean} lastColumn
   */
  configureMargin(exporter, firstRow, lastRow, firstColumn, lastColumn) {
    if (!this.tiledPrinting) {
      // set margin if we don't print tiles
      exporter.margins = new Insets(this.margin)
      return
    }

    // for tile printing, set margin only for border tiles
    const top = firstRow ? this.margin : 0
    const bottom = firstRow ? this.margin : 0
    const right = firstRow ? this.margin : 0
    const left = firstRow ? this.margin : 0

    const margin = new Insets(left, top, right, bottom)
    exporter.margins = margin
  }
}
