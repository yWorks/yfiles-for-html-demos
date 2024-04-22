/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  createVisual(renderContext: IRenderContext, node: INode): NodeCanvasVisual {
    return new NodeCanvasVisual(node.layout)
  }

  updateVisual(
    renderContext: IRenderContext,
    oldVisual: NodeCanvasVisual,
    node: INode
  ): NodeCanvasVisual {
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
   * @param layout A live view of the layout of a node.
   */
  constructor(public layout: IRectangle) {
    super()
  }

  /**
   * Draw a rectangle with a solid orange fill.
   * @see Overrides {@link HtmlCanvasVisual.paint}
   */
  paint(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
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
  createVisual(renderContext: IRenderContext, edge: IEdge): EdgeCanvasVisual {
    return new EdgeCanvasVisual(edge.bends, edge.sourcePort!.location, edge.targetPort!.location)
  }

  isHit(inputContext: IInputModeContext, location: Point, edge: IEdge): boolean {
    // we use a very simple hit logic here (the base implementation)
    if (!super.isHit(inputContext, location, edge)) {
      return false
    }
    // but we exclude hits on the source and target node
    const s = edge.sourceNode!
    const t = edge.targetNode!
    return (
      !s.style.renderer.getHitTestable(s, s.style).isHit(inputContext, location) &&
      !t.style.renderer.getHitTestable(t, t.style).isHit(inputContext, location)
    )
  }

  updateVisual(
    renderContext: IRenderContext,
    oldVisual: EdgeCanvasVisual,
    edge: IEdge
  ): EdgeCanvasVisual {
    oldVisual.bends = edge.bends
    oldVisual.sourcePortLocation = edge.sourcePort!.location
    oldVisual.targetPortLocation = edge.targetPort!.location
    return oldVisual
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class EdgeCanvasVisual extends HtmlCanvasVisual {
  /**
   * Initializes a new EdgeCanvasVisual instance with the given property values.
   * @param bends The bends in the edge's path.
   * @param sourcePortLocation The start point of the edge's path.
   * @param targetPortLocation The end point of the edge's path.
   */
  constructor(
    public bends: IListEnumerable<IBend>,
    public sourcePortLocation: Point,
    public targetPortLocation: Point
  ) {
    super()
  }

  paint(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
    // simply draw a black line from the source port location via all bends to the target port location
    ctx.strokeStyle = 'rgb(51,102,153)'

    ctx.beginPath()
    let location: IPoint = this.sourcePortLocation
    ctx.moveTo(location.x, location.y)
    if (this.bends.size > 0) {
      this.bends.forEach((bend) => {
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
  private _zoomThreshold = 0.7
  private _font: Font = new Font()

  get zoomThreshold(): number {
    return this._zoomThreshold
  }

  set zoomThreshold(value: number) {
    this._zoomThreshold = value
  }

  get font(): Font {
    return this._font
  }

  set font(value: Font) {
    this._font = value
  }

  createVisual(renderContext: IRenderContext, label: ILabel): LabelCanvasVisual {
    return new LabelCanvasVisual(label.text, label.layout, this.font, this.zoomThreshold)
  }

  updateVisual(
    renderContext: IRenderContext,
    oldVisual: LabelCanvasVisual,
    label: ILabel
  ): LabelCanvasVisual {
    oldVisual.text = label.text
    oldVisual.layout = label.layout
    oldVisual.font = this.font
    oldVisual.zoomThreshold = this.zoomThreshold
    return oldVisual
  }

  getPreferredSize(label: ILabel): Size {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    FastLabelStyle.setFont(ctx, this.font)
    const width = ctx.measureText(label.text).width
    return new Size(width, this.font.fontSize)
  }

  /**
   * Helper method to set a Font on the given context;
   */
  static setFont(ctx: CanvasRenderingContext2D, font: Font): void {
    ctx.font = `${FastLabelStyle.fontStyleToString(
      font.fontStyle
    )} ${FastLabelStyle.fontWeightToString(font.fontWeight)} ${font.fontSize}px ${font.fontFamily}`
  }

  static fontStyleToString(fontStyle: FontStyle): string {
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

  static fontWeightToString(fontWeight: FontWeight): string {
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
   * @param text The text to be rendered.
   * @param layout A live view of the layout of a label.
   * @param font The Font to render the label text with.
   * @param zoomThreshold Text is rendered only if the zoom property of the component in which
   * this visual is displayed is greater than the given value.
   */
  constructor(
    public text: string,
    public layout: IOrientedRectangle,
    public font: Font,
    public zoomThreshold: number
  ) {
    super()
  }

  paint(renderContext: IRenderContext, ctx: CanvasRenderingContext2D) {
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
