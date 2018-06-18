/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A very basic high-performance node style implementation that uses HTML5 Canvas rendering.
   * @extends yfiles.styles.NodeStyleBase
   */
  class FastNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.INode} node
     * @return {NodeCanvasVisual}
     */
    createVisual(renderContext, node) {
      return new NodeCanvasVisual(node.layout)
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.INode} node
     * @return {yfiles.view.Visual}
     */
    updateVisual(renderContext, oldVisual, node) {
      return oldVisual
    }
  }

  /**
   * For HTML5 Canvas based rendering we need to extend from {@link yfiles.view.HtmlCanvasVisual}.
   * @extends yfiles.view.HtmlCanvasVisual
   */
  class NodeCanvasVisual extends yfiles.view.HtmlCanvasVisual {
    /**
     * @param {yfiles.geometry.Rect} layout
     */
    constructor(layout) {
      super()
      this.$layout = layout
    }

    /**
     * Draw a rectangle with a solid orange fill.
     * @see Overrides {@link yfiles.view.HtmlCanvasVisual#paint}
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {CanvasRenderingContxt2D} ctx
     */
    paint(renderContext, ctx) {
      ctx.fillStyle = 'rgba(255,140,0,1)'
      const l = this.$layout
      ctx.fillRect(l.x, l.y, l.width, l.height)
    }
  }

  /**
   * A very basic high-performance edge style that uses HTML 5 canvas rendering.
   * Arrows are not supported by this implementation.
   * @extends yfiles.styles.EdgeStyleBase
   */
  class FastEdgeStyle extends yfiles.styles.EdgeStyleBase {
    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.IEdge} edge
     * @return {EdgeCanvasVisual}
     */
    createVisual(renderContext, edge) {
      return new EdgeCanvasVisual(edge.bends, edge.sourcePort.location, edge.targetPort.location)
    }

    /**
     * @param {yfiles.input.IInputModeContext} inputContext
     * @param {yfiles.geometry.Point} location
     * @param {yfiles.graph.IEdge} edge
     * @return {boolean}
     */
    isHit(inputContext, location, edge) {
      // we use a very simple hit logic here (the base implementation)
      if (!FastEdgeStyle.$super.isHit.call(this, inputContext, location, edge)) {
        return false
      }
      // but we exclude hits on the source and target node
      const s = edge.sourceNode
      const t = edge.targetNode
      return (
        !s.style.renderer.getHitTestable(s, s.style).isHit(inputContext, location) &&
        !t.style.renderer.getHitTestable(t, t.style).isHit(inputContext, location)
      )
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.IEdge} edge
     * @return {yfiles.view.Visual}
     */
    updateVisual(renderContext, oldVisual, edge) {
      return oldVisual
    }
  }

  /**
   * For HTML5 Canvas based rendering we need to extend from {@link yfiles.view.HtmlCanvasVisual}.
   * @extends yfiles.view.HtmlCanvasVisual
   */
  class EdgeCanvasVisual extends yfiles.view.HtmlCanvasVisual {
    /**
     * @param {yfiles.collections.IListEnumerable.<yfiles.graph.IBend>} bends
     * @param {yfiles.geometry.Point} sourcePortLocation
     * @param {yfiles.geometry.Point} targetPortLocation
     */
    constructor(bends, sourcePortLocation, targetPortLocation) {
      super()
      this.$bends = bends
      this.$sourcePortLocation = sourcePortLocation
      this.$targetPortLocation = targetPortLocation
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {CanvasRenderingContext2D} ctx
     */
    paint(renderContext, ctx) {
      // simply draw a black line from the source port location via all bends to the target port location
      ctx.strokeStyle = 'rgb(51,102,153)'

      ctx.beginPath()
      let location = this.$sourcePortLocation
      ctx.moveTo(location.x, location.y)
      if (this.$bends.size > 0) {
        this.$bends.forEach(bend => {
          location = bend.location
          ctx.lineTo(location.x, location.y)
        })
      }
      location = this.$targetPortLocation
      ctx.lineTo(location.x, location.y)
      ctx.stroke()
    }
  }

  /**
   * A very basic high-performance label style that uses HTML 5 canvas rendering and level-of-detail rendering.
   * This style does not support multiline text.
   * @extends yfiles.styles.LabelStyleBase
   */
  class FastLabelStyle extends yfiles.styles.LabelStyleBase {
    constructor() {
      super()
      this.$zoomThreshold = 0.7
      this.$font = new yfiles.view.Font()
    }

    /** @type {number} */
    get zoomThreshold() {
      return this.$zoomThreshold
    }

    /** @type {number} */
    set zoomThreshold(value) {
      this.$zoomThreshold = value
    }

    /** @type {yfiles.view.Font} */
    get font() {
      return this.$font
    }

    /** @type {yfiles.view.Font} */
    set font(value) {
      this.$font = value
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.graph.ILabel} label
     * @return {LabelCanvasVisual}
     */
    createVisual(renderContext, label) {
      return new LabelCanvasVisual(label.text, label.layout, this.font, this.zoomThreshold)
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {yfiles.view.Visual} oldVisual
     * @param {yfiles.graph.ILabel} label
     * @return {yfiles.view.Visual}
     */
    updateVisual(renderContext, oldVisual, label) {
      return oldVisual
    }

    /**
     * @param {yfiles.graph.ILabel} label
     * @return {yfiles.geometry.Size}
     */
    getPreferredSize(label) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      FastLabelStyle.setFont(ctx, this.font)
      const width = ctx.measureText(label.text).width
      return new yfiles.geometry.Size(width, this.font.fontSize)
    }

    /**
     * Helper method to set a Font on the given context;
     * @param {CanvasRenderingContext2D} ctx
     * @param {yfiles.view.Font} font
     */
    static setFont(ctx, font) {
      ctx.font = `${FastLabelStyle.fontStyleToString(
        font.fontStyle
      )} ${FastLabelStyle.fontWeightToString(font.fontWeight)} ${font.fontSize}px ${
        font.fontFamily
      }`
    }

    /**
     * @param {yfiles.view.FontStyle} fontStyle
     * @return {string}
     */
    static fontStyleToString(fontStyle) {
      switch (fontStyle) {
        default:
        case yfiles.view.FontStyle.NORMAL:
          return 'normal'
        case yfiles.view.FontStyle.ITALIC:
          return 'italic'
        case yfiles.view.FontStyle.OBLIQUE:
          return 'oblique'
        case yfiles.view.FontStyle.INHERIT:
          return 'inherit'
      }
    }

    /**
     * @param {yfiles.view.FontWeight} fontWeight
     * @return {string}
     */
    static fontWeightToString(fontWeight) {
      switch (fontWeight) {
        default:
        case yfiles.view.FontWeight.NORMAL:
          return 'normal'
        case yfiles.view.FontWeight.BOLD:
          return 'bold'
        case yfiles.view.FontWeight.BOLDER:
          return 'bolder'
        case yfiles.view.FontWeight.LIGHTER:
          return 'lighter'
        case yfiles.view.FontWeight.INHERIT:
          return 'inherit'
        case yfiles.view.FontWeight.ITEM100:
          return '100'
        case yfiles.view.FontWeight.ITEM200:
          return '200'
        case yfiles.view.FontWeight.ITEM300:
          return '300'
        case yfiles.view.FontWeight.ITEM400:
          return '400'
        case yfiles.view.FontWeight.ITEM500:
          return '500'
        case yfiles.view.FontWeight.ITEM600:
          return '600'
        case yfiles.view.FontWeight.ITEM700:
          return '700'
        case yfiles.view.FontWeight.ITEM800:
          return '800'
        case yfiles.view.FontWeight.ITEM900:
          return '900'
      }
    }
  }

  /**
   * The CanvasVisual for label rendering
   * @extends yfiles.view.HtmlCanvasVisual
   */
  class LabelCanvasVisual extends yfiles.view.HtmlCanvasVisual {
    /**
     * @param {string} text
     * @param {yfiles.geometry.OrientedRectangle} layout
     * @param {yfiles.view.Font} font
     * @param {number} zoomThreshold
     */
    constructor(text, layout, font, zoomThreshold) {
      super()
      this.$text = text
      this.$layout = layout
      this.$font = font
      this.$zoomThreshold = zoomThreshold
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext
     * @param {CanvasRenderingContext2D} ctx
     */
    paint(renderContext, ctx) {
      if (renderContext.zoom > this.$zoomThreshold) {
        FastLabelStyle.setFont(ctx, this.$font)
        const dx = this.$layout.anchorX
        const dy = this.$layout.anchorY
        ctx.save()
        ctx.fillStyle = 'rgba(50,50,50,1)'
        ctx.textBaseline = 'bottom'
        if (this.$layout.upY !== -1) {
          const elements = this.$layout.getTransform().elements
          ctx.transform(
            elements[0],
            elements[1],
            elements[2],
            elements[3],
            elements[4],
            elements[5]
          )
          ctx.fillText(this.$text, 0, this.$layout.height)
        } else {
          ctx.fillText(this.$text, dx, dy)
        }
        ctx.restore()
      }
    }
  }

  return {
    FastNodeStyle,
    FastEdgeStyle,
    FastLabelStyle
  }
})
