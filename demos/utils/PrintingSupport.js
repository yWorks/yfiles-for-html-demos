/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  GraphComponent,
  IEnumerable,
  IGraph,
  Insets,
  Matrix,
  Point,
  Rect,
  Size,
  SvgExport
} from 'yfiles'

/**
 * Helper class for printing the contents of a graph component.
 * Printing is done in multiple steps. First, the graph is exported to one or
 * more SVG elements, these elements are then added to a new document in a
 * new window, and finally, this window is printed using the browser's print
 * feature.
 */
export default class PrintingSupport {
  constructor() {
    // The margins around the whole printed content in page coordinates.
    this.margin = 5

    // The scale factor to apply to the printed content.
    this.scale = 1.0

    // Whether to print multiple pages if the content does not fit on a single page.
    this.tiledPrinting = false

    // The width of a single tile (page) in pt (1/72 inch).
    this.tileWidth = 595

    // The height of a single tile (page) in pt (1/72 inch).
    this.tileHeight = 842

    // The URL of the print document that's created and then opened.
    this.targetUrl = './printdocument.html'

    // The projection for the print content. When exporting a GraphComponent with a projection
    // this should be set to the same value.
    this.projection = Matrix.IDENTITY
  }

  /**
   * Prints the detail of the given graph that is specified by either a
   * rectangle in world coordinates or a collection of world coordinate points which
   * define a bounding box in view coordinates.
   * If no `region` is specified, the complete graph is printed.
   * @param {!IGraph} graph
   * @param {!(Rect|Array.<Point>)} [region]
   */
  printGraph(graph, region) {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new GraphComponent()
    // ... and assign it the same graph.
    exportComponent.graph = graph
    this.print(exportComponent, region)
  }

  /**
   * Prints the detail of the given GraphComponent's graph that is specified by either a
   * rectangle in world coordinates or a collection of world coordinate points which
   * define a bounding box in view coordinates.
   * If no `region` is specified, the complete graph is printed.
   * @param {!GraphComponent} graphComponent
   * @param {!(Rect|Array.<Point>)} [region]
   * @returns {!Promise}
   */
  async print(graphComponent, region) {
    let targetRect
    if (Array.isArray(region)) {
      targetRect = this.getBoundsFromPoints(region)
    } else if (region instanceof Rect) {
      const { topLeft, topRight, bottomLeft, bottomRight } = region
      targetRect = this.getBoundsFromPoints([topLeft, topRight, bottomLeft, bottomRight])
    } else {
      targetRect = this.getBoundsFromPoints(
        graphComponent
          .getCanvasObjects(graphComponent.rootGroup)
          .map(co =>
            co.descriptor.getBoundsProvider(co.userObject).getBounds(graphComponent.canvasContext)
          )
          .filter(bounds => bounds.isFinite)
          .flatMap(bounds =>
            IEnumerable.from([
              bounds.topLeft,
              bounds.topRight,
              bounds.bottomLeft,
              bounds.bottomRight
            ])
          )
      )
    }

    let rows
    let columns
    let tiles
    const invertedProjection = this.projection.clone()
    invertedProjection.invert()

    if (!this.tiledPrinting) {
      // no tiles - just one row and column
      rows = 1
      columns = 1
      tiles = [[this.getPointsForTile(targetRect, invertedProjection)]]
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
            this.getPointsForTile(
              new Rect(
                targetRect.x + tileSizeScaled.width * k,
                targetRect.y + tileSizeScaled.height * i,
                tileSizeScaled.width,
                tileSizeScaled.height
              ),
              invertedProjection
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
        tiles[rows - 1][k] = this.getPointsForTile(
          new Rect(
            targetRect.x + tileSizeScaled.width * k,
            lastY,
            tileSizeScaled.width,
            lastHeight
          ),
          invertedProjection
        )
      }
      // set bounds of last column
      for (let i = 0; i < rows - 1; i++) {
        tiles[i][columns - 1] = this.getPointsForTile(
          new Rect(
            lastX,
            targetRect.y + tileSizeScaled.height * i,
            lastWidth,
            tileSizeScaled.height
          ),
          invertedProjection
        )
      }
      // set bounds of bottom right tile
      tiles[rows - 1][columns - 1] = this.getPointsForTile(
        new Rect(lastX, lastY, lastWidth, lastHeight),
        invertedProjection
      )
    }

    let resultingHTML = ''
    // loop through all rows and columns
    for (let i = 0; i < rows; i++) {
      for (let k = 0; k < columns; k++) {
        const lastRow = i === rows - 1
        const lastColumn = k === columns - 1

        const exporter = new SvgExport({
          worldBounds: Rect.EMPTY, // dummy rectangle that's overwritten by worldPoints below
          worldPoints: tiles[i][k],
          scale: this.scale,
          copyDefsElements: true,
          encodeImagesBase64: true,
          inlineSvgImages: true,
          projection: this.projection
        })
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

  // Returns the corners of the tile, projected back to world coordinates
  /**
   * @param {!Rect} bounds
   * @param {!Matrix} invertedProjection
   * @returns {!Array.<Point>}
   */
  getPointsForTile(bounds, invertedProjection) {
    return [
      invertedProjection.transform(bounds.topLeft),
      invertedProjection.transform(bounds.topRight),
      invertedProjection.transform(bounds.bottomRight),
      invertedProjection.transform(bounds.bottomLeft)
    ]
  }

  // Returns the projected bounding box for the given points
  /**
   * @param {!Iterable.<Point>} points
   */
  getBoundsFromPoints(points) {
    let bounds = Rect.EMPTY
    for (const p of points) {
      bounds = bounds.add(this.projection.transform(p))
    }
    return bounds
  }

  /**
   * @param {!SvgExport} exporter
   * @param {boolean} firstRow
   * @param {boolean} lastRow
   * @param {boolean} firstColumn
   * @param {boolean} lastColumn
   */
  configureMargin(exporter, firstRow, lastRow, firstColumn, lastColumn) {
    if (!this.tiledPrinting) {
      // set margin if we don't print tiles
      exporter.margins = new Insets(this.margin)
    } else {
      // for tile printing, set margin only for border tiles
      const top = firstRow ? this.margin : 0
      const bottom = lastRow ? this.margin : 0
      const right = lastColumn ? this.margin : 0
      const left = firstColumn ? this.margin : 0

      exporter.margins = new Insets(left, top, right, bottom)
    }
  }
}
