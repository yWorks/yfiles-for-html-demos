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
  EdgeStyleBase,
  Font,
  FontStyle,
  FontWeight,
  HtmlCanvasVisual,
  IBend,
  IEdge,
  IInputModeContext,
  ILabel,
  IListEnumerable,
  INode,
  IOrientedRectangle,
  IPoint,
  IRectangle,
  IRenderContext,
  LabelStyleBase,
  NodeStyleBase,
  Point,
  Size
} from 'yfiles'

export class FastNodeStyle extends NodeStyleBase {
  /**
   * @param {!IRenderContext} renderContext
   * @param {!INode} node
   * @returns {!NodeCanvasVisual}
   */
  createVisual(renderContext, node) {
    return new NodeCanvasVisual(node.layout)
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!NodeCanvasVisual} oldVisual
   * @param {!INode} node
   * @returns {!NodeCanvasVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    oldVisual.layout = node.layout
    return oldVisual
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class NodeCanvasVisual extends HtmlCanvasVisual {
  /**
   * Initializes a new NodeCanvasVisual instance with the given property value.
   * @param {!IRectangle} layout A live view of the layout of a node.
   */
  constructor(layout) {
    super()
    this.layout = layout
  }

  /**
   * Draw a rectangle with a solid orange fill.
   * @see Overrides {@link HtmlCanvasVisual#paint}
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   */
  paint(renderContext, ctx) {
    ctx.fillStyle = 'rgba(255,140,0,1)'
    const l = this.layout
    ctx.fillRect(l.x, l.y, l.width, l.height)
  }
}

/**
 * A very basic high-performance edge style that uses HTML 5 canvas rendering.
 * Arrows are not supported by this implementation.
 */
export class FastEdgeStyle extends EdgeStyleBase {
  /**
   * @param {!IRenderContext} renderContext
   * @param {!IEdge} edge
   * @returns {!EdgeCanvasVisual}
   */
  createVisual(renderContext, edge) {
    return new EdgeCanvasVisual(edge.bends, edge.sourcePort.location, edge.targetPort.location)
  }

  /**
   * @param {!IInputModeContext} inputContext
   * @param {!Point} location
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isHit(inputContext, location, edge) {
    // we use a very simple hit logic here (the base implementation)
    if (!super.isHit(inputContext, location, edge)) {
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
   * @param {!IRenderContext} renderContext
   * @param {!EdgeCanvasVisual} oldVisual
   * @param {!IEdge} edge
   * @returns {!EdgeCanvasVisual}
   */
  updateVisual(renderContext, oldVisual, edge) {
    oldVisual.bends = edge.bends
    oldVisual.sourcePortLocation = edge.sourcePort.location
    oldVisual.targetPortLocation = edge.targetPort.location
    return oldVisual
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class EdgeCanvasVisual extends HtmlCanvasVisual {
  /**
   * Initializes a new EdgeCanvasVisual instance with the given property values.
   * @param {!IListEnumerable.<IBend>} bends The bends in the edge's path.
   * @param {!Point} sourcePortLocation The start point of the edge's path.
   * @param {!Point} targetPortLocation The end point of the edge's path.
   */
  constructor(bends, sourcePortLocation, targetPortLocation) {
    super()
    this.targetPortLocation = targetPortLocation
    this.sourcePortLocation = sourcePortLocation
    this.bends = bends
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   */
  paint(renderContext, ctx) {
    // simply draw a black line from the source port location via all bends to the target port location
    ctx.strokeStyle = 'rgb(51,102,153)'

    ctx.beginPath()
    let location = this.sourcePortLocation
    ctx.moveTo(location.x, location.y)
    if (this.bends.size > 0) {
      this.bends.forEach(bend => {
        location = bend.location
        ctx.lineTo(location.x, location.y)
      })
    }
    location = this.targetPortLocation
    ctx.lineTo(location.x, location.y)
    ctx.stroke()
  }
}

/**
 * A very basic high-performance label style that uses HTML 5 canvas rendering and level-of-detail rendering.
 * This style does not support multiline text.
 */
export class FastLabelStyle extends LabelStyleBase {
  constructor() {
    super()
    this._zoomThreshold = 0.7
    this._font = new Font()
  }

  /**
   * @type {number}
   */
  get zoomThreshold() {
    return this._zoomThreshold
  }

  /**
   * @type {number}
   */
  set zoomThreshold(value) {
    this._zoomThreshold = value
  }

  /**
   * @type {!Font}
   */
  get font() {
    return this._font
  }

  /**
   * @type {!Font}
   */
  set font(value) {
    this._font = value
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!ILabel} label
   * @returns {!LabelCanvasVisual}
   */
  createVisual(renderContext, label) {
    return new LabelCanvasVisual(label.text, label.layout, this.font, this.zoomThreshold)
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!LabelCanvasVisual} oldVisual
   * @param {!ILabel} label
   * @returns {!LabelCanvasVisual}
   */
  updateVisual(renderContext, oldVisual, label) {
    oldVisual.text = label.text
    oldVisual.layout = label.layout
    oldVisual.font = this.font
    oldVisual.zoomThreshold = this.zoomThreshold
    return oldVisual
  }

  /**
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    FastLabelStyle.setFont(ctx, this.font)
    const width = ctx.measureText(label.text).width
    return new Size(width, this.font.fontSize)
  }

  /**
   * Helper method to set a Font on the given context;
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!Font} font
   */
  static setFont(ctx, font) {
    ctx.font = `${FastLabelStyle.fontStyleToString(
      font.fontStyle
    )} ${FastLabelStyle.fontWeightToString(font.fontWeight)} ${font.fontSize}px ${font.fontFamily}`
  }

  /**
   * @param {!FontStyle} fontStyle
   * @returns {!string}
   */
  static fontStyleToString(fontStyle) {
    switch (fontStyle) {
      default:
      case FontStyle.NORMAL:
        return 'normal'
      case FontStyle.ITALIC:
        return 'italic'
      case FontStyle.OBLIQUE:
        return 'oblique'
      case FontStyle.INHERIT:
        return 'inherit'
    }
  }

  /**
   * @param {!FontWeight} fontWeight
   * @returns {!string}
   */
  static fontWeightToString(fontWeight) {
    switch (fontWeight) {
      default:
      case FontWeight.NORMAL:
        return 'normal'
      case FontWeight.BOLD:
        return 'bold'
      case FontWeight.BOLDER:
        return 'bolder'
      case FontWeight.LIGHTER:
        return 'lighter'
      case FontWeight.INHERIT:
        return 'inherit'
      case FontWeight.ITEM100:
        return '100'
      case FontWeight.ITEM200:
        return '200'
      case FontWeight.ITEM300:
        return '300'
      case FontWeight.ITEM400:
        return '400'
      case FontWeight.ITEM500:
        return '500'
      case FontWeight.ITEM600:
        return '600'
      case FontWeight.ITEM700:
        return '700'
      case FontWeight.ITEM800:
        return '800'
      case FontWeight.ITEM900:
        return '900'
    }
  }
}

/**
 * The CanvasVisual for label rendering
 */
class LabelCanvasVisual extends HtmlCanvasVisual {
  /**
   * Initializes a new LabelCanvasVisual with the given property values.
   * @param {!string} text The text to be rendered.
   * @param {!IOrientedRectangle} layout A live view of the layout of a label.
   * @param {!Font} font The Font to render the label text with.
   * @param {number} zoomThreshold Text is rendered only if the zoom property of the component in which
   * this visual is displayed is greater than the given value.
   */
  constructor(text, layout, font, zoomThreshold) {
    super()
    this.zoomThreshold = zoomThreshold
    this.font = font
    this.layout = layout
    this.text = text
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   */
  paint(renderContext, ctx) {
    if (renderContext.zoom > this.zoomThreshold) {
      FastLabelStyle.setFont(ctx, this.font)
      const dx = this.layout.anchorX
      const dy = this.layout.anchorY
      ctx.save()
      ctx.fillStyle = 'rgba(50,50,50,1)'
      ctx.textBaseline = 'bottom'
      if (this.layout.upY !== -1) {
        const elements = this.layout.createTransform().elements
        ctx.transform(elements[0], elements[1], elements[2], elements[3], elements[4], elements[5])
        ctx.fillText(this.text, 0, this.layout.height)
      } else {
        ctx.fillText(this.text, dx, dy)
      }
      ctx.restore()
    }
  }
}

// export a default object to be able to map a namespace to this module for serialization
export default { FastEdgeStyle, FastLabelStyle, FastNodeStyle }
