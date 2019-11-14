/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

/*
 eslint-disable object-shorthand
 */

define([
  'yfiles/view-component',
  'yfiles/view-table'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  const DemoTableStyle = yfiles.lang.Class('DemoTableStyle', {
    $extends: yfiles.styles.TableNodeStyle,

    /**
     * @param {yfiles.graph.ITable} table
     */
    constructor: function(table) {
      if (table) {
        yfiles.styles.TableNodeStyle.call(this, table, new DemoTableStyleRenderer())
        this.tableRenderingOrder = yfiles.styles.TableRenderingOrder.ROWS_FIRST
        this.backgroundStyle = new TableBackgroundStyle()
      } else {
        // we need a no-arg constructor for GraphML de-/serialization
        yfiles.styles.TableNodeStyle.call(
          this,
          new yfiles.graph.Table(),
          new DemoTableStyleRenderer()
        )
        this.tableRenderingOrder = yfiles.styles.TableRenderingOrder.ROWS_FIRST
        this.backgroundStyle = new TableBackgroundStyle()
      }
    }
  })

  /**
   * Custom TableNodeStyleRenderer which defines a clickable area on the table's headers.
   */
  const DemoTableStyleRenderer = yfiles.lang.Class('DemoTableStyleRenderer', {
    $extends: yfiles.styles.TableNodeStyleRenderer,

    constructor: function() {
      yfiles.styles.TableNodeStyleRenderer.call(this)
    },

    /**
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Rect} box
     * @return {boolean}
     */
    isInBox: function(inputModeContext, box) {
      return box.contains(this.node.layout.topLeft) && box.contains(this.node.layout.bottomRight)
    },

    /**
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} p
     * @return {boolean} True if p is inside node.
     */
    isHit: function(inputModeContext, p) {
      if (!DemoTableStyleRenderer.$super.isHit.call(this, inputModeContext, p)) {
        return false
      }

      const /** @type {yfiles.graph.ITable} */ table = this.node.lookup(yfiles.graph.ITable.$class)
      if (table == null) {
        return true
      }

      if (inputModeContext.parentInputMode instanceof yfiles.input.CreateEdgeInputMode) {
        const accInsets = table.getAccumulatedInsets()
        // during edge creation - the inside of the table is not considered a hit
        const nodeLayout = this.node.layout.toRect()
        const innerRect = nodeLayout.getEnlarged(
          new yfiles.geometry.Insets(
            -accInsets.left,
            -accInsets.top,
            -accInsets.right,
            -accInsets.bottom
          )
        )
        return !innerRect.contains(p)
      }
      if (
        inputModeContext.parentInputMode instanceof yfiles.input.MoveInputMode &&
        inputModeContext.parentInputMode.isDragging
      ) {
        // during movement of the node - the whole area is considered a hit
        return true
      }
      if (inputModeContext.parentInputMode instanceof yfiles.input.ClickInputMode) {
        const accInsets = table.getAccumulatedInsets()
        // clicking will only work in the corners
        const nodeLayout = this.node.layout.toRect()
        const tableBody = nodeLayout.getEnlarged(
          new yfiles.geometry.Insets(
            -accInsets.left,
            -accInsets.top,
            -accInsets.right,
            -accInsets.bottom
          )
        )
        if (tableBody.contains(p)) {
          return false
        }
      }
      return true
    }
  })

  /**
   * Custom table background style that uses a flat style.
   */
  const TableBackgroundStyle = yfiles.lang.Class('TableBackgroundStyle', {
    $extends: yfiles.styles.NodeStyleBase,

    constructor: function() {
      yfiles.styles.NodeStyleBase.call(this)
    },

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.Visual}
     */
    createVisual: function(renderContext, node) {
      const /** @type {yfiles.graph.ITable} */ table = node.lookup(yfiles.graph.ITable.$class)
      if (table != null) {
        const accInsets = table.getAccumulatedInsets()

        const layout = node.layout
        const cache = {
          x: layout.x,
          y: layout.y,
          w: layout.width,
          h: layout.height
        }

        const namespaceURI = renderContext.defsElement.namespaceURI
        const g = document.createElementNS(namespaceURI, 'g')

        const result = new yfiles.view.SvgVisual(g)

        const rec = document.createElementNS(namespaceURI, 'rect')
        rec.x.baseVal.value = 0
        rec.y.baseVal.value = 0
        rec.width.baseVal.value = cache.w
        rec.height.baseVal.value = cache.h
        rec.setAttribute('class', 'table-background')
        g.appendChild(rec)

        cache.accTop = accInsets.top
        cache.accRight = accInsets.right
        cache.accBottom = accInsets.bottom
        cache.accLeft = accInsets.left

        if (accInsets.top > 2 && accInsets.left > 2) {
          this.createInnerRect(g, 1, 1, cache.accLeft - 2, cache.accTop - 2)
        }

        if (accInsets.top > 2 && accInsets.right > 2) {
          this.createInnerRect(
            g,
            cache.w - cache.accRight + 1,
            1,
            cache.accRight - 2,
            cache.accTop - 2
          )
        }

        if (accInsets.bottom > 2 && accInsets.left > 2) {
          this.createInnerRect(
            g,
            1,
            cache.h - cache.accBottom + 1,
            cache.accLeft - 2,
            cache.accBottom - 2
          )
        }

        if (accInsets.bottom > 2 && accInsets.right > 2) {
          this.createInnerRect(
            g,
            cache.w - cache.accRight + 1,
            cache.h - cache.accBottom + 1,
            cache.accRight - 2,
            cache.accBottom - 2
          )
        }

        g.setAttribute('transform', `translate(${layout.x} ${layout.y})`)
        g.cache = cache
        return result
      }
      return null
    },

    /**
     * Helper function to create the inner rectangles for the headings.
     * @param {SVGElement} g
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    createInnerRect: function(g, x, y, w, h) {
      const innerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      innerRect.setAttribute('class', 'stripe-inset')
      g.appendChild(innerRect)
      innerRect.x.baseVal.value = x
      innerRect.y.baseVal.value = y
      innerRect.width.baseVal.value = w
      innerRect.height.baseVal.value = h
      innerRect.cache = {
        x,
        y,
        w,
        h
      }
    },

    /**
     * Helper function to update the inner rectangles.
     * @param {SVGElement} g
     * @param {number} childIndex
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    updateInnerRect: function(g, childIndex, x, y, w, h) {
      childIndex++
      if (g.childElementCount <= childIndex) {
        this.createInnerRect(g, x, y, w, h)
      } else {
        const rec = g.childNodes[childIndex]
        const rectangleCache = rec.cache
        if (
          !rectangleCache ||
          (rec.cache.x !== x || rec.cache.y !== y || rec.cache.w !== w || rec.cache.h !== h)
        ) {
          rec.x.baseVal.value = x
          rec.y.baseVal.value = y
          rec.width.baseVal.value = w
          rec.height.baseVal.value = h
          rec.cache.x = x
          rec.cache.y = y
          rec.cache.w = w
          rec.cache.h = h
        }
      }
      return childIndex
    },

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.Visual}
     */
    updateVisual: function(renderContext, oldVisual, node) {
      const g = oldVisual.svgElement
      if (g instanceof SVGElement && g.childElementCount > 0) {
        const cache = g.cache
        const /** @type {yfiles.graph.ITable} */ table = node.lookup(yfiles.graph.ITable.$class)
        if (table != null && cache) {
          const accInsets = table.getAccumulatedInsets()

          const layout = node.layout

          let childIndex = 0

          if (accInsets.top > 2 && accInsets.left > 2) {
            childIndex = this.updateInnerRect(
              g,
              childIndex,
              1,
              1,
              cache.accLeft - 2,
              cache.accTop - 2
            )
          }

          if (accInsets.top > 2 && accInsets.right > 2) {
            childIndex = this.updateInnerRect(
              g,
              childIndex,
              cache.w - cache.accRight + 1,
              1,
              cache.accRight - 2,
              cache.accTop - 2
            )
          }

          if (accInsets.bottom > 2 && accInsets.left > 2) {
            childIndex = this.updateInnerRect(
              g,
              childIndex,
              1,
              cache.h - cache.accBottom + 1,
              cache.accLeft - 2,
              cache.accBottom - 2
            )
          }

          if (accInsets.bottom > 2 && accInsets.right > 2) {
            childIndex = this.updateInnerRect(
              g,
              childIndex,
              cache.w - cache.accRight + 1,
              cache.h - cache.accBottom + 1,
              cache.accRight - 2,
              cache.accBottom - 2
            )
          }

          if (cache.w !== layout.width || cache.h !== layout.height) {
            cache.w = layout.width
            cache.h = layout.height
            const rec = g.childNodes[0]
            rec.width.baseVal.value = cache.w
            rec.height.baseVal.value = cache.h
          }

          cache.accLeft = accInsets.left
          cache.accTop = accInsets.top
          cache.accRigth = accInsets.right
          cache.accBottom = accInsets.bottom

          while (g.childElementCount > childIndex + 1) {
            g.removeChild(g.lastElementChild)
          }

          if (cache.x !== layout.x || cache.y !== layout.y) {
            cache.x = layout.x
            cache.y = layout.y
            yfiles.view.SvgVisual.setTranslate(g, cache.x, cache.y)
          }
          return oldVisual
        }
      }
      return this.createVisual(renderContext, node)
    },

    /**
     * Hit test which considers HitTestRadius specified in CanvasContext.
     * @param {yfiles.input.IInputModeContext} inputModeContext
     * @param {yfiles.geometry.Point} p
     * @param {yfiles.graph.INode} node
     * @return {boolean} True if p is inside node.
     */
    isHit: function(inputModeContext, p, node) {
      if (!TableBackgroundStyle.$super.isHit.call(this, inputModeContext, p, node)) {
        return false
      }
      const /** @type {yfiles.graph.ITable} */ table = node.lookup(yfiles.graph.ITable.$class)
      if (table == null) {
        return true
      }

      if (
        inputModeContext.parentInputMode instanceof yfiles.input.CreateEdgeInputMode &&
        inputModeContext.parentInputMode.isCreationInProgress
      ) {
        // during edge creation - the inside of the table is not considered a hit
        const accInsets = table.getAccumulatedInsets()
        const nodeLayout = node.layout.toRect()
        const innerRect = nodeLayout.getEnlarged(
          new yfiles.geometry.Insets(
            -accInsets.left,
            -accInsets.top,
            -accInsets.right,
            -accInsets.bottom
          )
        )
        return !innerRect.contains(p)
      }
      if (
        inputModeContext.parentInputMode instanceof yfiles.input.MoveInputMode &&
        inputModeContext.parentInputMode.isDragging
      ) {
        // during movement of the node - the whole area is considered a hit
        return true
      }
      if (inputModeContext.parentInputMode instanceof yfiles.input.ClickInputMode) {
        // clicking will only work in the corners
        const nodeLayout = node.layout.toRect()
        const accInsets = table.getAccumulatedInsets()
        const verticalRectangle = nodeLayout.getEnlarged(
          new yfiles.geometry.Insets(-accInsets.left, 0, -accInsets.right, 0)
        )
        if (verticalRectangle.contains(p)) {
          return false
        }
        const horizontalRectangle = nodeLayout.getEnlarged(
          new yfiles.geometry.Insets(0, -accInsets.top, 0, -accInsets.bottom)
        )
        if (horizontalRectangle.contains(p)) {
          return false
        }
      }

      return true
    }
  })

  /**
   * Custom style for the Stripes in a table.
   */
  const DemoStripeStyle = yfiles.lang.Class('DemoStripeStyle', {
    $extends: yfiles.styles.NodeStyleBase,

    constructor: function() {
      yfiles.styles.NodeStyleBase.call(this)
    },

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.Visual}
     */
    createVisual: function(renderContext, node) {
      const /** @type {yfiles.graph.IStripe} */ stripe = node.lookup(yfiles.graph.IStripe.$class)
      const layout = node.layout
      if (stripe !== null) {
        const isColumn = yfiles.graph.IColumn.isInstance(stripe)
        let hasNoChildren
        if (isColumn) {
          hasNoChildren = !stripe.childColumns.getEnumerator().moveNext()
        } else {
          hasNoChildren = !stripe.childRows.getEnumerator().moveNext()
        }

        let stripeInsets
        let isFirst
        if (hasNoChildren) {
          const actualInsets = stripe.actualInsets
          if (isColumn) {
            stripeInsets = new yfiles.geometry.Insets(0, actualInsets.top, 0, actualInsets.bottom)
            let walker = stripe.table.rootColumn
            while (walker !== null && walker !== stripe) {
              const enumerator = walker.childColumns.getEnumerator()
              walker = enumerator.moveNext() ? enumerator.current : null
            }
            isFirst = walker === stripe
          } else {
            stripeInsets = new yfiles.geometry.Insets(actualInsets.left, 0, actualInsets.right, 0)
            let walker = stripe.table.rootRow
            while (walker !== null && walker !== stripe) {
              const enumerator = walker.childRows.getEnumerator()
              walker = enumerator.moveNext() ? enumerator.current : null
            }
            isFirst = walker === stripe
          }
        } else {
          stripeInsets = stripe.insets
          isFirst = false
        }

        const namespaceURI = renderContext.defsElement.namespaceURI
        const g = document.createElementNS(namespaceURI, 'g')

        const result = new yfiles.view.SvgVisual(g)

        let x = 1.0
        let y = 1.0
        let w = layout.width - 2
        let h = layout.height - 2

        if (stripeInsets.top > 2) {
          this.createInnerRect(g, x, y, w, stripeInsets.top - 2, 'stripe-inset')
        }
        y += stripeInsets.top
        h -= stripeInsets.top
        if (stripeInsets.bottom > 2) {
          this.createInnerRect(
            g,
            x,
            layout.height - stripeInsets.bottom + 1,
            w,
            stripeInsets.bottom - 2,
            'stripe-inset'
          )
        }
        h -= stripeInsets.bottom

        if (stripeInsets.left > 2) {
          this.createInnerRect(g, x, y, stripeInsets.left - 2, h, 'stripe-inset')
        }
        x += stripeInsets.left
        w -= stripeInsets.left

        if (stripeInsets.right > 2) {
          this.createInnerRect(
            g,
            layout.width - stripeInsets.right + 1,
            y,
            stripeInsets.right - 2,
            h,
            'stripe-inset'
          )
        }
        w -= stripeInsets.right

        if (isColumn && !isFirst && hasNoChildren) {
          this.createInnerRect(g, -1, y, 2, h - 1, 'table-line')
        }

        if (!isColumn && !isFirst && hasNoChildren) {
          this.createInnerRect(g, x, -1, w - 1, 2, 'table-line')
        }

        g.setAttribute('transform', `translate(${layout.x} ${layout.y})`)

        result.cache = {
          x: layout.x,
          y: layout.y,
          w: layout.width,
          h: layout.height,
          top: stripeInsets.top,
          left: stripeInsets.left,
          right: stripeInsets.right,
          bottom: stripeInsets.bottom
        }

        return result
      }
      return null
    },

    /**
     * Helper function to create the inner rectangles for the headings.
     * @param {Element} g
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} cssClass
     */
    createInnerRect: function(g, x, y, w, h, cssClass) {
      const rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rec.setAttribute('class', cssClass)
      g.appendChild(rec)
      rec.x.baseVal.value = x
      rec.y.baseVal.value = y
      rec.width.baseVal.value = w
      rec.height.baseVal.value = h
      rec.cache = {
        x,
        y,
        w,
        h,
        cl: cssClass
      }
    },

    /**
     * Helper function to update the inner rectangles.
     * @param {Element} g
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} cssClass
     */
    updateInnerRect: function(g, childIndex, x, y, w, h, cssClass) {
      childIndex++
      if (g.childElementCount <= childIndex) {
        this.createInnerRect(g, x, y, w, h, cssClass)
      } else {
        const rec = g.childNodes[childIndex]
        const rectangleCache = rec.cache
        if (!rectangleCache || rec.cl !== cssClass) {
          rec.setAttribute('class', cssClass)
          rec.cl = cssClass
        }
        if (
          !rectangleCache ||
          (rec.cache.x !== x || rec.cache.y !== y || rec.cache.w !== w || rec.cache.h !== h)
        ) {
          rec.x.baseVal.value = x
          rec.y.baseVal.value = y
          rec.width.baseVal.value = w
          rec.height.baseVal.value = h
          rec.cache.x = x
          rec.cache.y = y
          rec.cache.w = w
          rec.cache.h = h
        }
      }
      return childIndex
    },

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.Visual}
     */
    updateVisual: function(renderContext, oldVisual, node) {
      const /** @type {yfiles.graph.IStripe} */ stripe = node.lookup(yfiles.graph.IStripe.$class)
      const layout = node.layout
      const g = oldVisual.svgElement
      const cache = oldVisual.cache
      if (stripe !== null && g instanceof SVGGElement && cache) {
        const isColumn = yfiles.graph.IColumn.isInstance(stripe)

        let hasNoChildren
        if (isColumn) {
          hasNoChildren = !stripe.childColumns.getEnumerator().moveNext()
        } else {
          hasNoChildren = !stripe.childRows.getEnumerator().moveNext()
        }

        let stripeInsets
        let isFirst
        if (hasNoChildren) {
          const actualInsets = stripe.actualInsets
          if (isColumn) {
            stripeInsets = new yfiles.geometry.Insets(0, actualInsets.top, 0, actualInsets.bottom)
            let walker = stripe.table.rootColumn
            while (walker !== null && walker !== stripe) {
              const enumerator = walker.childColumns.getEnumerator()
              walker = enumerator.moveNext() ? enumerator.current : null
            }
            isFirst = walker === stripe
          } else {
            stripeInsets = new yfiles.geometry.Insets(actualInsets.left, 0, actualInsets.right, 0)
            let walker = stripe.table.rootRow
            while (walker !== null && walker !== stripe) {
              const enumerator = walker.childRows.getEnumerator()
              walker = enumerator.moveNext() ? enumerator.current : null
            }
            isFirst = walker === stripe
          }
        } else {
          stripeInsets = stripe.insets
          isFirst = false
        }

        let x = 1.0
        let y = 1.0
        let w = layout.width - 2
        let h = layout.height - 2

        let childIndex = -1

        if (stripeInsets.top > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            x,
            y,
            w,
            stripeInsets.top - 2,
            'stripe-inset'
          )
        }
        y += stripeInsets.top
        h -= stripeInsets.top
        if (stripeInsets.bottom > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            x,
            layout.height - stripeInsets.bottom + 1,
            w,
            stripeInsets.bottom - 2,
            'stripe-inset'
          )
        }
        h -= stripeInsets.bottom

        if (stripeInsets.left > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            x,
            y,
            stripeInsets.left - 2,
            h,
            'stripe-inset'
          )
        }
        x += stripeInsets.left
        w -= stripeInsets.left

        if (stripeInsets.right > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            layout.width - stripeInsets.right + 1,
            y,
            stripeInsets.right - 2,
            h,
            'stripe-inset'
          )
        }
        w -= stripeInsets.right

        if (isColumn && !isFirst && hasNoChildren) {
          childIndex = this.updateInnerRect(g, childIndex, -1, y, 2, h - 1, 'table-line')
        }

        if (!isColumn && !isFirst && hasNoChildren) {
          childIndex = this.updateInnerRect(g, childIndex, x, -1, w - 1, 2, 'table-line')
        }

        while (g.childElementCount > childIndex + 1) {
          g.removeChild(g.lastElementChild)
        }

        if (cache.x !== layout.x || cache.y !== layout.y) {
          cache.x = layout.x
          cache.y = layout.y
          yfiles.view.SvgVisual.setTranslate(g, cache.x, cache.y)
        }
        return oldVisual
      }
      return this.createVisual(node, renderContext)
    }
  })

  return {
    DemoTableStyle,
    DemoStripeStyle,
    DemoTableStyleRenderer,
    TableBackgroundStyle
  }
})
