/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { BaseClass, IRenderContext, IVisualCreator, PartitionGrid, SvgVisual, Visual } from 'yfiles'

/**
 * Visualizes the partition grid that has been used in the layout.
 * Each grid cell is visualized as an svg rectangle.
 */
export default class SimplePartitionGridVisualCreator extends BaseClass(IVisualCreator) {
  /**
   * The partition grid to be visualized
   */
  private grid: PartitionGrid

  /**
   * Creates a new instance of PartitionGridVisualCreator.
   * @param grid The partition grid to be visualized
   */
  constructor(grid: PartitionGrid) {
    super()
    this.grid = grid
  }

  /**
   * Creates the visual for the given partition grid.
   * @param context The context that describes where the visual will be used
   * @return The visual for the given partition grid
   */
  createVisual(context: IRenderContext): SvgVisual {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    for (const row of this.grid.rows) {
      for (const column of this.grid.columns) {
        const x = column.computedPosition
        const y = row.computedPosition
        const h = row.computedHeight
        const w = column.computedWidth
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', `${x}`)
        rect.setAttribute('y', `${y}`)
        rect.setAttribute('width', `${w}`)
        rect.setAttribute('height', `${h}`)
        rect.setAttribute('stroke', 'white')
        rect.setAttribute('fill', 'lightsteelblue')
        container.appendChild(rect)
      }
    }

    return new SvgVisual(container)
  }

  /**
   * Updates the visual for the given partition grid. In particular, method {@link createVisual} is called.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The visual instance that had been returned the last time the createVisual
   *   method was called on this instance
   * @return The visual for the given partition grid
   */
  updateVisual(context: IRenderContext, oldVisual: Visual): SvgVisual {
    return this.createVisual(context)
  }
}
