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
import {
  ClickInputMode,
  CreateEdgeInputMode,
  DelegatingNodeStyle,
  ICloneable,
  IColumn,
  type IInputModeContext,
  type INode,
  type INodeStyle,
  Insets,
  type IRenderContext,
  type IRow,
  IStripe,
  ITable,
  MoveInputMode,
  NodeStyleBase,
  type Point,
  SvgVisual,
  Table,
  TableNodeStyle,
  TableRenderingOrder,
  type TaggedSvgVisual
} from '@yfiles/yfiles'

type Cache = { x: number; y: number; w: number; h: number }
type TableStyleCache = Cache & { top: number; bottom: number; left: number; right: number }

type TableStyleVisual = TaggedSvgVisual<SVGGElement, TableStyleCache>

/**
 * Custom table node style which defines a clickable area on the table's headers and delegates
 * to {@link TableNodeStyle}.
 */
export class DemoTableStyle extends DelegatingNodeStyle {
  private readonly tableNodeStyle: TableNodeStyle

  constructor(table: ITable = new Table()) {
    super()
    this.tableNodeStyle = new TableNodeStyle({
      table,
      tableRenderingOrder: TableRenderingOrder.ROWS_FIRST,
      backgroundStyle: new TableBackgroundStyle()
    })
  }

  protected getStyle(node: INode): INodeStyle {
    return this.tableNodeStyle
  }

  public get tableRenderingOrder(): TableNodeStyle['tableRenderingOrder'] {
    return this.tableNodeStyle.tableRenderingOrder
  }

  public set tableRenderingOrder(value: TableNodeStyle['tableRenderingOrder']) {
    this.tableNodeStyle.tableRenderingOrder = value
  }

  public get backgroundStyle(): TableNodeStyle['backgroundStyle'] {
    return this.tableNodeStyle.backgroundStyle
  }

  public set backgroundStyle(value: TableNodeStyle['backgroundStyle']) {
    this.tableNodeStyle.backgroundStyle = value
  }

  public get table(): TableNodeStyle['table'] {
    return this.tableNodeStyle.table
  }

  public set table(value: TableNodeStyle['table']) {
    this.tableNodeStyle.table = value
  }

  protected isHit(context: IInputModeContext, location: Point, node: INode): boolean {
    if (!super.isHit(context, location, node)) {
      return false
    }

    const table = ITable.getTable(node)
    if (!table) {
      return true
    }

    if (context.inputMode instanceof CreateEdgeInputMode) {
      const accInsets = table.accumulatedPadding
      // during edge creation - the inside of the table is not considered a hit
      const nodeLayout = node.layout.toRect()
      const innerRect = nodeLayout.getEnlarged(
        new Insets(-accInsets.top, -accInsets.right, -accInsets.bottom, -accInsets.left)
      )
      return !innerRect.contains(location)
    }
    if (context.inputMode instanceof MoveInputMode && context.inputMode.isDragging) {
      // during movement of the node - the whole area is considered a hit
      return true
    }
    if (context.inputMode instanceof ClickInputMode) {
      const accInsets = table.accumulatedPadding
      // clicking will only work in the corners
      const nodeLayout = node.layout.toRect()
      const tableBody = nodeLayout.getEnlarged(
        new Insets(-accInsets.top, -accInsets.right, -accInsets.bottom, -accInsets.left)
      )
      if (tableBody.contains(location)) {
        return false
      }
    }
    return true
  }

  clone(): this {
    const clone = new DemoTableStyle()
    clone.tableRenderingOrder = this.tableRenderingOrder
    clone.backgroundStyle = this.backgroundStyle
    clone.table = this.copyTable(this.table)
    return clone as this
  }

  private copyTable(table: ITable): ITable {
    return table instanceof ICloneable ? table.clone() : table
  }
}

/**
 * Custom table background style that uses a flat style.
 */
class TableBackgroundStyle extends NodeStyleBase<TableStyleVisual> {
  createVisual(renderContext: IRenderContext, node: INode): TableStyleVisual | null {
    const table = ITable.getTable(node)
    if (table) {
      const accInsets = table.accumulatedPadding

      const layout = node.layout
      const cache: TableStyleCache = {
        x: layout.x,
        y: layout.y,
        w: layout.width,
        h: layout.height,
        top: accInsets.top,
        right: accInsets.right,
        bottom: accInsets.bottom,
        left: accInsets.left
      }

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rec.x.baseVal.value = 0
      rec.y.baseVal.value = 0
      rec.rx.baseVal.value = 1
      rec.ry.baseVal.value = 1
      rec.width.baseVal.value = cache.w
      rec.height.baseVal.value = cache.h
      rec.setAttribute('class', 'table-background')
      g.appendChild(rec)

      if (accInsets.top > 2 && accInsets.left > 2) {
        this.createInnerRect(g, 1, 1, cache.left - 2, cache.top - 2)
      }

      if (accInsets.top > 2 && accInsets.right > 2) {
        this.createInnerRect(g, cache.w - cache.right + 1, 1, cache.right - 2, cache.top - 2)
      }

      if (accInsets.bottom > 2 && accInsets.left > 2) {
        this.createInnerRect(g, 1, cache.h - cache.bottom + 1, cache.left - 2, cache.bottom - 2)
      }

      if (accInsets.bottom > 2 && accInsets.right > 2) {
        this.createInnerRect(
          g,
          cache.w - cache.right + 1,
          cache.h - cache.bottom + 1,
          cache.right - 2,
          cache.bottom - 2
        )
      }

      g.setAttribute('transform', `translate(${layout.x} ${layout.y})`)
      return SvgVisual.from(g, cache)
    }
    return null
  }

  /**
   * Helper function to create the inner rectangles for the headings.
   */
  createInnerRect(g: SVGElement, x: number, y: number, w: number, h: number): void {
    const innerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    innerRect.setAttribute('class', 'stripe-inset')
    g.appendChild(innerRect)
    innerRect.x.baseVal.value = x
    innerRect.y.baseVal.value = y
    innerRect.width.baseVal.value = w
    innerRect.height.baseVal.value = h
    ;(innerRect as any).cache = { x, y, w, h } as Cache
  }

  /**
   * Helper function to update the inner rectangles.
   */
  updateInnerRect(
    g: SVGElement,
    childIndex: number,
    x: number,
    y: number,
    w: number,
    h: number
  ): number {
    childIndex++
    if (g.childElementCount <= childIndex) {
      this.createInnerRect(g, x, y, w, h)
    } else {
      const rec = g.childNodes[childIndex] as SVGRectElement
      let rectangleCache = (rec as any).cache as Cache
      if (!rectangleCache) {
        rectangleCache = {} as any
      }
      if (
        rectangleCache.x !== x ||
        rectangleCache.y !== y ||
        rectangleCache.w !== w ||
        rectangleCache.h !== h
      ) {
        rec.x.baseVal.value = x
        rec.y.baseVal.value = y
        rec.width.baseVal.value = w
        rec.height.baseVal.value = h
        rectangleCache.x = x
        rectangleCache.y = y
        rectangleCache.w = w
        rectangleCache.h = h
      }
    }
    return childIndex
  }

  updateVisual(
    renderContext: IRenderContext,
    oldVisual: TableStyleVisual,
    node: INode
  ): TableStyleVisual | null {
    const g = oldVisual.svgElement
    if (g instanceof SVGElement && g.childElementCount > 0) {
      const cache = oldVisual.tag
      const table = ITable.getTable(node)
      if (table && cache) {
        const accInsets = table.accumulatedPadding

        const layout = node.layout

        let childIndex = 0

        if (accInsets.top > 2 && accInsets.left > 2) {
          childIndex = this.updateInnerRect(g, childIndex, 1, 1, cache.left - 2, cache.top - 2)
        }

        if (accInsets.top > 2 && accInsets.right > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            cache.w - cache.right + 1,
            1,
            cache.right - 2,
            cache.top - 2
          )
        }

        if (accInsets.bottom > 2 && accInsets.left > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            1,
            cache.h - cache.bottom + 1,
            cache.left - 2,
            cache.bottom - 2
          )
        }

        if (accInsets.bottom > 2 && accInsets.right > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            cache.w - cache.right + 1,
            cache.h - cache.bottom + 1,
            cache.right - 2,
            cache.bottom - 2
          )
        }

        if (cache.w !== layout.width || cache.h !== layout.height) {
          cache.w = layout.width
          cache.h = layout.height
          const rec = g.childNodes[0] as SVGRectElement
          rec.width.baseVal.value = cache.w
          rec.height.baseVal.value = cache.h
        }

        cache.left = accInsets.left
        cache.top = accInsets.top
        cache.right = accInsets.right
        cache.bottom = accInsets.bottom

        while (g.childElementCount > childIndex + 1) {
          g.removeChild(g.lastElementChild!)
        }

        if (cache.x !== layout.x || cache.y !== layout.y) {
          cache.x = layout.x
          cache.y = layout.y
          SvgVisual.setTranslate(g, cache.x, cache.y)
        }
        return oldVisual
      }
    }
    return this.createVisual(renderContext, node)
  }

  /**
   * Hit test which considers HitTestRadius specified in CanvasContext.
   * @returns True if p is inside node.
   */
  isHit(inputModeContext: IInputModeContext, p: Point, node: INode): boolean {
    if (!super.isHit.call(this, inputModeContext, p, node)) {
      return false
    }
    const table = ITable.getTable(node)
    if (!table) {
      return true
    }

    if (
      inputModeContext.inputMode instanceof CreateEdgeInputMode &&
      inputModeContext.inputMode.isCreationInProgress
    ) {
      // during edge creation - the inside of the table is not considered a hit
      const accInsets = table.accumulatedPadding
      const nodeLayout = node.layout.toRect()
      const innerRect = nodeLayout.getEnlarged(
        new Insets(-accInsets.top, -accInsets.right, -accInsets.bottom, -accInsets.left)
      )
      return !innerRect.contains(p)
    }
    if (
      inputModeContext.inputMode instanceof MoveInputMode &&
      inputModeContext.inputMode.isDragging
    ) {
      // during movement of the node - the whole area is considered a hit
      return true
    }
    if (inputModeContext.inputMode instanceof ClickInputMode) {
      // clicking will only work in the corners
      const nodeLayout = node.layout.toRect()
      const accInsets = table.accumulatedPadding
      const verticalRectangle = nodeLayout.getEnlarged(
        new Insets(0, -accInsets.right, 0, -accInsets.left)
      )
      if (verticalRectangle.contains(p)) {
        return false
      }
      const horizontalRectangle = nodeLayout.getEnlarged(
        new Insets(-accInsets.top, 0, -accInsets.bottom, 0)
      )
      if (horizontalRectangle.contains(p)) {
        return false
      }
    }

    return true
  }
}

/**
 * Custom style for the Stripes in a table.
 */
export class DemoStripeStyle extends NodeStyleBase<TableStyleVisual> {
  createVisual(renderContext: IRenderContext, node: INode): TableStyleVisual | null {
    const stripe = node.lookup(IStripe)
    if (stripe == null) {
      return null
    }

    const isColumn = stripe instanceof IColumn
    let stripePadding: Insets
    let isFirst: boolean
    if (stripe.childStripes.some()) {
      stripePadding = stripe.padding
      isFirst = false
    } else {
      const actualInsets = stripe.totalPadding
      if (isColumn) {
        stripePadding = new Insets(actualInsets.top, 0, actualInsets.bottom, 0)
        let walker: IColumn | null = stripe.table && stripe.table.rootColumn
        while (walker !== null && walker !== stripe) {
          const enumerator = walker.childColumns.getEnumerator()
          walker = enumerator.moveNext() ? enumerator.current : null
        }
        isFirst = walker === stripe
      } else {
        stripePadding = new Insets(0, actualInsets.right, 0, actualInsets.left)
        let walker: IRow | null = stripe.table && stripe.table.rootRow
        while (walker !== null && walker !== stripe) {
          const enumerator = walker.childRows.getEnumerator()
          walker = enumerator.moveNext() ? enumerator.current : null
        }
        isFirst = walker === stripe
      }
    }

    const layout = node.layout
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    let x = 1
    let y = 1
    let w = layout.width - 2
    let h = layout.height - 2

    if (stripePadding.top > 2) {
      this.createInnerRect(g, x, y, w, stripePadding.top - 2, 'stripe-inset')
    }
    y += stripePadding.top
    h -= stripePadding.top
    if (stripePadding.bottom > 2) {
      this.createInnerRect(
        g,
        x,
        layout.height - stripePadding.bottom + 1,
        w,
        stripePadding.bottom - 2,
        'stripe-inset'
      )
    }
    h -= stripePadding.bottom

    if (stripePadding.left > 2) {
      this.createInnerRect(g, x, y, stripePadding.left - 2, h, 'stripe-inset')
    }
    x += stripePadding.left
    w -= stripePadding.left

    if (stripePadding.right > 2) {
      this.createInnerRect(
        g,
        layout.width - stripePadding.right + 1,
        y,
        stripePadding.right - 2,
        h,
        'stripe-inset'
      )
    }
    w -= stripePadding.right

    if (isColumn && !isFirst && !stripe.childStripes.some()) {
      this.createInnerRect(g, -1, y, 2, h - 1, 'table-line')
    }

    if (!isColumn && !isFirst && !stripe.childStripes.some()) {
      this.createInnerRect(g, x, -1, w - 1, 2, 'table-line')
    }

    g.setAttribute('transform', `translate(${layout.x} ${layout.y})`)

    return SvgVisual.from(g, {
      x: layout.x,
      y: layout.y,
      w: layout.width,
      h: layout.height,
      top: stripePadding.top,
      left: stripePadding.left,
      right: stripePadding.right,
      bottom: stripePadding.bottom
    })
  }

  /**
   * Helper function to create the inner rectangles for the headings.
   */
  createInnerRect(g: Element, x: number, y: number, w: number, h: number, cssClass: string): void {
    const rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rec.setAttribute('class', cssClass)
    g.appendChild(rec)
    rec.x.baseVal.value = x
    rec.y.baseVal.value = y
    rec.width.baseVal.value = w
    rec.height.baseVal.value = h
    ;(rec as any).cache = { x, y, w, h, cl: cssClass } as Cache & { cl: string }
  }

  /**
   * Helper function to update the inner rectangles.
   */
  updateInnerRect(
    g: Element,
    childIndex: number,
    x: number,
    y: number,
    w: number,
    h: number,
    cssClass: string
  ): number {
    childIndex++
    if (g.childElementCount <= childIndex) {
      this.createInnerRect(g, x, y, w, h, cssClass)
    } else {
      const rec = g.childNodes[childIndex] as SVGRectElement
      let rectangleCache = (rec as any).cache as Cache & { cl: string }
      if (!rectangleCache) {
        rectangleCache = {} as any
      }
      if (rectangleCache.cl !== cssClass) {
        rec.setAttribute('class', cssClass)
        rectangleCache.cl = cssClass
      }
      if (
        rectangleCache.x !== x ||
        rectangleCache.y !== y ||
        rectangleCache.w !== w ||
        rectangleCache.h !== h
      ) {
        rec.x.baseVal.value = x
        rec.y.baseVal.value = y
        rec.width.baseVal.value = w
        rec.height.baseVal.value = h
        rectangleCache.x = x
        rectangleCache.y = y
        rectangleCache.w = w
        rectangleCache.h = h
      }
    }
    return childIndex
  }

  updateVisual(
    renderContext: IRenderContext,
    oldVisual: TableStyleVisual,
    node: INode
  ): TableStyleVisual | null {
    const stripe = node.lookup(IStripe)
    const layout = node.layout
    const g = oldVisual.svgElement
    const cache = oldVisual.tag

    if (!stripe || !(g instanceof SVGGElement) || !cache) {
      return this.createVisual(renderContext, node)
    }
    const isColumn = stripe instanceof IColumn

    let stripePadding: Insets
    let isFirst: boolean
    if (!stripe.childStripes.some()) {
      const actualInsets = stripe.totalPadding
      if (isColumn) {
        stripePadding = new Insets(actualInsets.top, 0, actualInsets.bottom, 0)
        let walker: IColumn | null = stripe.table && stripe.table.rootColumn
        while (walker !== null && walker !== stripe) {
          const enumerator = walker.childColumns.getEnumerator()
          walker = enumerator.moveNext() ? enumerator.current : null
        }
        isFirst = walker === stripe
      } else {
        stripePadding = new Insets(0, actualInsets.right, 0, actualInsets.left)
        let walker: IRow | null = stripe.table && stripe.table.rootRow
        while (walker !== null && walker !== stripe) {
          const enumerator = walker.childRows.getEnumerator()
          walker = enumerator.moveNext() ? enumerator.current : null
        }
        isFirst = walker === stripe
      }
    } else {
      stripePadding = stripe.padding
      isFirst = false
    }

    let x = 1
    let y = 1
    let w = layout.width - 2
    let h = layout.height - 2

    let childIndex = -1

    if (stripePadding.top > 2) {
      childIndex = this.updateInnerRect(
        g,
        childIndex,
        x,
        y,
        w,
        stripePadding.top - 2,
        'stripe-inset'
      )
    }
    y += stripePadding.top
    h -= stripePadding.top
    if (stripePadding.bottom > 2) {
      childIndex = this.updateInnerRect(
        g,
        childIndex,
        x,
        layout.height - stripePadding.bottom + 1,
        w,
        stripePadding.bottom - 2,
        'stripe-inset'
      )
    }
    h -= stripePadding.bottom

    if (stripePadding.left > 2) {
      childIndex = this.updateInnerRect(
        g,
        childIndex,
        x,
        y,
        stripePadding.left - 2,
        h,
        'stripe-inset'
      )
    }
    x += stripePadding.left
    w -= stripePadding.left

    if (stripePadding.right > 2) {
      childIndex = this.updateInnerRect(
        g,
        childIndex,
        layout.width - stripePadding.right + 1,
        y,
        stripePadding.right - 2,
        h,
        'stripe-inset'
      )
    }
    w -= stripePadding.right

    if (isColumn && !isFirst && !stripe.childStripes.some()) {
      childIndex = this.updateInnerRect(g, childIndex, -1, y, 2, h - 1, 'table-line')
    }

    if (!isColumn && !isFirst && !stripe.childStripes.some()) {
      childIndex = this.updateInnerRect(g, childIndex, x, -1, w - 1, 2, 'table-line')
    }

    while (g.childElementCount > childIndex + 1) {
      g.removeChild(g.lastElementChild!)
    }

    if (cache.x !== layout.x || cache.y !== layout.y) {
      cache.x = layout.x
      cache.y = layout.y
      SvgVisual.setTranslate(g, cache.x, cache.y)
    }
    return oldVisual
  }
}

// export a default object to be able to map a namespace to this module for serialization
export default { DemoTableStyle, TableBackgroundStyle, DemoStripeStyle }
