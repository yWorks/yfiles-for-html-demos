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
import { AlignmentStageAlignmentPolicy, BaseClass, IVisualCreator, SvgVisual } from '@yfiles/yfiles'

const INSIDE_COLOR = 'lightgray'
const DEFAULT_COLOR = '#f0f0f0'

/**
 * Shows the areas in a graph component into which a node has to be dropped to trigger a
 * re-alignment of the nodes in the graph of said graph component.
 */
export class SnapDistanceVisualCreator extends BaseClass(IVisualCreator) {
  initialized = false

  snapColumns = []
  snapRows = []
  highlightColumn = { min: 0, max: 0 }
  highlightRow = { min: 0, max: 0 }

  /**
   * Creates a visualization of snap columns and snap rows during a Drag and Drop drag gesture.
   * If a node is dragged from the palette and subsequently dropped into the graph component,
   * the nodes in the graph will be re-aligned if and only if the center of the dropped node is
   * inside one of the snap columns and/or snap rows.
   */
  createVisual(context) {
    if (!this.initialized) {
      return null
    }

    // the viewport's y-coordinate and height are used as vertical bounds for the visualization of
    // snap columns
    // the viewport's x-coordinate and width are used as horizontal bounds for the visualization of
    // snap rows
    // the viewport is slightly enlarged to ensure that the snap columns and snap rows are drawn across
    // the whole visible area of the graph component
    const vp = context.canvasComponent.viewport.getEnlarged(4)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    for (const range of this.snapColumns) {
      g.appendChild(createRect(range.min, vp.y, range.max - range.min, vp.height, DEFAULT_COLOR))
    }

    for (const range of this.snapRows) {
      g.appendChild(createRect(vp.x, range.min, vp.width, range.max - range.min, DEFAULT_COLOR))
    }

    // placeholder rectangle for highlighting the snap column that contains the node center
    g.appendChild(createRect(0, vp.y, 0, vp.height, 'none'))
    // placeholder rectangle for highlighting the snap row that contains the node center
    g.appendChild(createRect(vp.x, 0, vp.width, 0, 'none'))

    updateHighlight(g, this.highlightColumn, true)
    updateHighlight(g, this.highlightRow, false)

    g['data-renderDataCache'] = {
      highlightColumn: this.highlightColumn,
      highlightRow: this.highlightRow
    }

    return new SvgVisual(g)
  }

  /**
   * Updates the visualization of snap columns and snap rows for a new node center.
   * This method only changes which of the snap columns and snap rows are highlighted because
   * the node center is inside the respective column and/or row.
   * This implementation relies on the fact that the viewport of the graph component cannot change
   * while the snap columns and snap rows are shown. This assumption holds because the snap columns
   * and snap rows are only shown during a Drag and Drop drag gesture that does not trigger
   * automatic scrolling/panning.
   */
  updateVisual(context, oldVisual) {
    if (!this.initialized) {
      return null
    }

    if (oldVisual) {
      const container = oldVisual.svgElement
      const cache = container['data-renderDataCache']
      if (cache) {
        const highlightColumn = this.highlightColumn
        if (!sameRange(cache.highlightColumn, highlightColumn)) {
          updateHighlight(container, highlightColumn, true)
          cache.highlightColumn = highlightColumn
        }
        const highlightRow = this.highlightRow
        if (!sameRange(cache.highlightRow, highlightRow)) {
          updateHighlight(container, highlightRow, false)
          cache.highlightRow = highlightRow
        }

        return oldVisual
      }
    }

    return this.createVisual(context)
  }

  /**
   * Clears the internal state of this creator.
   * <p>
   * After calling this method, {@link #createVisual} and {@link #updateVisual} will return
   * <code>null</code> until the creator is {@link #initialize initialized} again.
   * </p>
   */
  clear() {
    this.snapColumns = []
    this.snapRows = []
    this.highlightColumn = { min: 0, max: 0 }
    this.highlightRow = { min: 0, max: 0 }
    this.initialized = false
  }

  /**
   * Initializes the internal state of this creator.
   * <p>
   * {@link #createVisual} and {@link #updateVisual} will return <code>null</code> unless the
   * creator is {@link #initialize initialized}.
   * </p>
   * <p>
   * This method calculates the snap columns and the snap rows for the graph of the given graph
   * component.
   * </p>
   */
  initialize(graphComponent, nodeCenter, layoutSettings) {
    this.initialized = true

    const { snapColumns, snapRows } = collectSnapRanges(
      graphComponent.createRenderContext(),
      graphComponent.graph,
      layoutSettings.alignmentPolicy,
      layoutSettings.snapDistance
    )
    this.snapColumns = snapColumns
    this.snapRows = snapRows

    this.updateNodeCenter(nodeCenter)
  }

  /**
   * Updates the internal state of this creator for a new node center.
   * The node center determines which snap column and/or snap row will be highlighted because
   * the node center is inside the respective column and/or row.
   */
  updateNodeCenter(nodeCenter) {
    const oldHighlightColumn = this.highlightColumn
    this.highlightColumn = findHighlightRange(this.snapColumns, nodeCenter.x)
    const sameColumns = sameRange(oldHighlightColumn, this.highlightColumn)

    const oldHighlightRow = this.highlightRow
    this.highlightRow = findHighlightRange(this.snapRows, nodeCenter.y)
    const sameRows = sameRange(oldHighlightRow, this.highlightRow)

    return !sameColumns || !sameRows
  }
}

/**
 * Calculates snap columns and snap rows for the given graph.
 * For each node in the graph, the x-coordinate of the node's center defines a snap column
 * that extends the given snap distance to the left and the right.
 * For each node in the graph, the y-coordinate of the node's center defines a snap row
 * that extends the given snap distance to the top and the bottom.
 * Overlapping snap columns are merged into a single column that is the union of the overlapping
 * columns.
 * Overlapping snap rows are merged in the same manner.
 */
function collectSnapRanges(context, graph, alignmentPolicy, snapDistance) {
  const collectColumns =
    AlignmentStageAlignmentPolicy.SNAP_XY === alignmentPolicy ||
    AlignmentStageAlignmentPolicy.SNAP_X === alignmentPolicy
  const columns = []
  const knownCenterX = new Set()

  const collectRows =
    AlignmentStageAlignmentPolicy.SNAP_XY === alignmentPolicy ||
    AlignmentStageAlignmentPolicy.SNAP_Y === alignmentPolicy
  const rows = []
  const knownCenterY = new Set()

  for (const node of graph.nodes) {
    const nodeBounds = node.style.renderer.getBoundsProvider(node, node.style).getBounds(context)

    const nodeCenterX = nodeBounds.centerX
    if (collectColumns && !knownCenterX.has(nodeCenterX)) {
      knownCenterX.add(nodeCenterX)
      columns.push({ min: nodeCenterX - snapDistance, max: nodeCenterX + snapDistance })
    }

    const nodeCenterY = nodeBounds.centerY
    if (collectRows && !knownCenterY.has(nodeCenterY)) {
      knownCenterY.add(nodeCenterY)
      rows.push({ min: nodeCenterY - snapDistance, max: nodeCenterY + snapDistance })
    }
  }

  return { snapColumns: mergeSnapRanges(columns), snapRows: mergeSnapRanges(rows) }
}

/**
 * Merges overlapping snap columns or snap rows by replacing the overlapping columns/rows with
 * a single column/row that is the union of the overlapping columns/rows.
 */
function mergeSnapRanges(ranges) {
  if (ranges.length < 2) {
    return ranges
  }

  ranges.sort((r1, r2) => {
    const min1 = r1.min
    const min2 = r2.min

    if (min1 < min2) {
      return -1
    } else if (min1 > min2) {
      return 1
    }
    return 0
  })

  const min = ranges[0].min

  // the initial value for the last range is just a sentinel value that prevents a merge for the
  // first range item
  let last = { min: min - 4, max: min - 4 }

  const merged = []
  for (const range of ranges) {
    if (Math.abs(range.max - last.max) < 0.1) {
      last.min = Math.min(last.min, range.min)
      last.max = Math.max(last.max, range.max)
    } else {
      merged.push(range)
      last = range
    }
  }

  return merged
}

/**
 * Returns the range that contains the given value.
 * If several overlapping ranges contain the value, this method will return the union of those
 * ranges.
 */
function findHighlightRange(ranges, value) {
  const result = { min: 0, max: 0 }
  let first = true
  for (const range of ranges) {
    if (range.min <= value && value <= range.max) {
      if (first) {
        first = false
        result.min = range.min
        result.max = range.max
      } else {
        result.min = Math.min(result.min, range.min)
        result.max = Math.max(result.max, range.max)
      }
    }
  }
  return result
}

/**
 * Determines if the given ranges are equal.
 */
function sameRange(range1, range2) {
  return range1.min === range2.min && range1.max === range2.max
}

/**
 * Creates an SVG rect element with the given geometry and fill color.
 */
function createRect(x, y, width, height, fill) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('x', `${x}`)
  rect.setAttribute('y', `${y}`)
  rect.setAttribute('width', `${width}`)
  rect.setAttribute('height', `${height}`)
  rect.setAttribute('fill', fill)
  rect.setAttribute('stroke', 'none')
  return rect
}

/**
 * Updates the highlighted snap column or snap row in the given root container.
 */
function updateHighlight(container, highlightRange, columns) {
  const rect = container.children.item(container.childElementCount + (columns ? -2 : -1))
  const size = highlightRange.max - highlightRange.min
  if (size > 0) {
    updateHighlightImpl(rect, highlightRange.min, size, INSIDE_COLOR, columns)
  } else {
    updateHighlightImpl(rect, 0, 0, 'none', columns)
  }
}

/**
 * Updates the given SVG rect element's geometry and fill color.
 */
function updateHighlightImpl(rect, coordinate, size, fill, columns) {
  rect.setAttribute(columns ? 'x' : 'y', `${coordinate}`)
  rect.setAttribute(columns ? 'width' : 'height', `${size}`)
  rect.setAttribute('fill', fill)
}
