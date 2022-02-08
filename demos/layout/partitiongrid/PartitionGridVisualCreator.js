/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  BaseClass,
  Color,
  IAnimation,
  IMutableRectangle,
  IRectangle,
  IRenderContext,
  IVisualCreator,
  MutableRectangle,
  PartitionGrid,
  Rect,
  SvgVisual,
  TimeSpan,
  Visual
} from 'yfiles'

/**
 * @typedef {Object} CellId
 * @property {number} rowIndex
 * @property {number} columnIndex
 */

/**
 * Visualizes the partition grid that has been used in the last layout.
 * Each grid cell is visualized as an SVG rectangle.
 * This class implements {@link IAnimation} and supports animating partition grid changes between
 * two layout calculations.
 */
export default class PartitionGridVisualCreator extends BaseClass(IVisualCreator, IAnimation) {
  /**
   * Creates a new instance of PartitionGridVisualCreator.
   * @param {number} rowCount The number of columns of the grid
   * @param {number} columnCount The number of columns of the grid
   */
  constructor(rowCount, columnCount) {
    super()
    this.columnCount = columnCount
    this.rowCount = rowCount
    this.rows = []
    this.rowStarts = []
    this.rowEnds = []
    this.columns = []
    this.columnColors = []
    this.columnStarts = []
    this.columnEnds = []

    // The partition grid to be visualized.
    this.grid = null

    // The selected cell indices.
    this.selectedCellId = null

    this.rowCount = rowCount
    this.columnCount = columnCount
    for (let i = 0; i < rowCount; i++) {
      this.rows.push(new MutableRectangle(0, 0, 10, 10))
    }
    for (let i = 0; i < columnCount; i++) {
      this.columns.push(new MutableRectangle(0, 0, 10, 10))
    }
  }

  /**
   * Creates the visual for the given partition grid.
   * @param {!IRenderContext} context The context that describes where the visual will be used
   * @returns {!SvgVisual} The visual for the given partition grid
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    this.columnColors = generateGradientColors(
      Color.LIGHT_SKY_BLUE,
      Color.ROYAL_BLUE,
      this.columnCount
    )

    for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
        const cellX1 = this.columns[columnIndex].x
        const cellX2 = this.columns[columnIndex].x + this.columns[columnIndex].width
        const cellY1 = this.rows[rowIndex].y
        const cellY2 = this.rows[rowIndex].y + this.rows[rowIndex].height

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', cellX1.toString())
        rect.setAttribute('y', cellY1.toString())
        rect.setAttribute('width', (cellX2 - cellX1).toString())
        rect.setAttribute('height', (cellY2 - cellY1).toString())
        rect.setAttribute('stroke', 'white')
        if (
          !this.selectedCellId ||
          (columnIndex !== this.selectedCellId.columnIndex &&
            rowIndex !== this.selectedCellId.rowIndex)
        ) {
          const columnColor = this.columnColors[columnIndex]
          rect.setAttribute(
            'fill',
            `rgba(${columnColor.r},${columnColor.g},${columnColor.b},${columnColor.a})`
          )
          rect.setAttribute('opacity', (rowIndex % 2 === 0 ? 0.7 : 0.4).toString())
        } else {
          rect.setAttribute('fill', 'lightsteelblue')
        }
        container.appendChild(rect)
      }
    }
    return new SvgVisual(container)
  }

  /**
   * Updates the visual for the given partition grid. In particular, method {@link createVisual} is called.
   * @param {!IRenderContext} context The context that describes where the visual will be used
   * @param {!Visual} oldVisual The visual instance that had been returned the last time the createVisual
   *   method was called on this instance
   * @returns {!SvgVisual} The visual for the given partition grid
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }

  /**
   * Gets the preferred duration of the animation.
   * @see Specified by {@link IAnimation#preferredDuration}.
   * @type {!TimeSpan}
   */
  get preferredDuration() {
    return TimeSpan.fromMilliseconds(400)
  }

  /**
   * Initializes the animation.
   */
  initialize() {
    // calculate min and max values of the partition grid bounds for the start and the end of the animation
    let minStartX = Number.POSITIVE_INFINITY
    let maxStartX = Number.NEGATIVE_INFINITY
    let minStartY = Number.POSITIVE_INFINITY
    let maxStartY = Number.NEGATIVE_INFINITY
    let minEndX = Number.POSITIVE_INFINITY
    let maxEndX = Number.NEGATIVE_INFINITY
    let minEndY = Number.POSITIVE_INFINITY
    let maxEndY = Number.NEGATIVE_INFINITY

    const grid = this.grid

    // looking at the y-coordinate and height of each row before and after the layout we can define the
    // minimum/maximum start/end y values for each row
    this.rowStarts = []
    this.rowEnds = []
    if (grid) {
      grid.rows.forEach((rowDescriptor, index) => {
        const rowRect = this.rows[index]
        const startY = rowRect.y
        const startHeight = rowRect.height
        minStartY = Math.min(minStartY, rowRect.y)
        maxStartY = Math.max(maxStartY, rowRect.maxY)

        const endY = rowDescriptor.computedPosition
        const endHeight = rowDescriptor.computedHeight
        minEndY = Math.min(minEndY, rowDescriptor.computedPosition)
        maxEndY = Math.max(maxEndY, rowDescriptor.computedPosition + rowDescriptor.computedHeight)

        // for each row we store its layout before and after the layout
        this.rowStarts.push(new Rect(minStartX, startY, maxStartX - minStartX, startHeight))
        this.rowEnds.push(new Rect(minEndX, endY, maxEndX - minEndX, endHeight))
      })
    }

    // looking at the x-coordinate and width of each column before and after the layout we can define the
    // minimum/maximum start/end x values for each column
    this.columnStarts = []
    this.columnEnds = []
    if (grid) {
      grid.columns.forEach((columnDescriptor, index) => {
        const columnRect = this.columns[index]
        const startX = columnRect.x
        const startWidth = columnRect.width
        minStartX = Math.min(minStartX, startX)
        maxStartX = Math.max(maxStartX, startX + startWidth)

        const endX = columnDescriptor.computedPosition
        const endWidth = columnDescriptor.computedWidth
        minEndX = Math.min(minEndX, endX)
        maxEndX = Math.max(maxEndX, endX + endWidth)

        // for each column we store its layout before and after the layout
        this.columnStarts.push(new Rect(startX, minStartY, startWidth, maxStartY - minStartY))
        this.columnEnds.push(new Rect(endX, minEndY, endWidth, maxEndY - minEndY))
      })
    }
  }

  /**
   * Runs the animation according to the relative animation time.
   * @param {number} time The animation time in [0,1]
   */
  animate(time) {
    // for each row and column we calculate and set an intermediate layout corresponding to the time ratio
    this.rows.forEach((row, index) => {
      const rowStart = this.rowStarts[index]
      const rowEnd = this.rowEnds[index]

      const newX = rowStart.x + time * (rowEnd.x - rowStart.x)
      const newY = rowStart.y + time * (rowEnd.y - rowStart.y)
      const newWidth = rowStart.width + time * (rowEnd.width - rowStart.width)
      const newHeight = rowStart.height + time * (rowEnd.height - rowStart.height)
      row.reshape(newX, newY, newWidth, newHeight)
    })

    this.columns.forEach((column, index) => {
      const columnStart = this.columnStarts[index]
      const columnEnd = this.columnEnds[index]

      const newX = columnStart.x + time * (columnEnd.x - columnStart.x)
      const newY = columnStart.y + time * (columnEnd.y - columnStart.y)
      const newWidth = columnStart.width + time * (columnEnd.width - columnStart.width)
      const newHeight = columnStart.height + time * (columnEnd.height - columnStart.height)
      column.reshape(newX, newY, newWidth, newHeight)
    })
  }

  /**
   * Cleans up after an animation has finished.
   */
  cleanUp() {
    this.grid = null
    this.rowStarts = []
    this.rowEnds = []
    this.columnStarts = []
    this.columnEnds = []
  }
}

/**
 * Generates an array of gradient colors between the start color and the end color.
 * @param {!Color} startColor The start color
 * @param {!Color} endColor The end color
 * @param {number} count The number of gradient colors to be generated
 * @returns {!Array.<Color>} An array of gradient colors between the start color and the end color
 */
export function generateGradientColors(startColor, endColor, count) {
  const colors = []
  for (let i = 0; i < count; i++) {
    const r = (startColor.r * (count - i) + endColor.r * i) / count
    const g = (startColor.g * (count - i) + endColor.g * i) / count
    const b = (startColor.b * (count - i) + endColor.b * i) / count
    const a = (startColor.a * (count - i) + endColor.a * i) / count
    colors.push(new Color(r | 0, g | 0, b | 0, a | 0))
  }
  return colors
}
