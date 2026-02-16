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
  BaseClass,
  Color,
  DelegatingNodeStyle,
  GeneralPath,
  GradientSpreadMethod,
  GradientStop,
  IBoundsProvider,
  IGroupPaddingProvider,
  IHitTestable,
  ILassoTestable,
  ILookup,
  IMarqueeTestable,
  INodeStyle,
  INodeStyleRenderer,
  Insets,
  IShapeGeometry,
  IVisibilityTestable,
  IVisualCreator,
  LinearGradient,
  MutableRectangle,
  Point,
  Rect,
  ShadowNodeStyleDecorator,
  SvgVisualGroup
} from '@yfiles/yfiles'

import {
  createRoundRectanglePath,
  findLineIntersectionWithRoundRect,
  roundRectContains,
  roundRectIsHit
} from './node-style-utils'

export class ShinyPlateNodeStyle extends DelegatingNodeStyle {
  impl = new ShinyPlateNodeStyleImpl()
  wrappedStyle

  constructor(options) {
    super()
    this.wrappedStyle = new ShadowNodeStyleDecorator(this.impl)
    if (options) {
      this.drawShadow = options.drawShadow ?? true
      this.fill = options.fill ?? Color.BLACK
      this.insets = options.insets ?? new Insets(5)
      this.radius = options.radius ?? 5
      this.stroke = options.stroke ?? null
    }
  }

  get fill() {
    return this.impl.fill
  }

  set fill(value) {
    this.impl.fill = value
  }

  get stroke() {
    return this.impl.stroke
  }

  set stroke(value) {
    this.impl.stroke = value
  }

  get radius() {
    return this.impl.radius
  }

  set radius(value) {
    this.impl.radius = value
  }

  get insets() {
    return this.impl.insets
  }

  set insets(value) {
    this.impl.insets = value
  }

  _drawShadow = true

  get drawShadow() {
    return this._drawShadow
  }

  set drawShadow(value) {
    this._drawShadow = value

    if (value) {
      this.wrappedStyle = new ShadowNodeStyleDecorator(this.impl)
    } else {
      this.wrappedStyle = this.impl
    }
  }

  getStyle(node) {
    return this.wrappedStyle
  }

  clone() {
    return new ShinyPlateNodeStyle({
      drawShadow: this.drawShadow,
      fill: this.fill,
      insets: this.insets,
      radius: this.radius,
      stroke: this.stroke
    })
  }
}

class ShinyPlateNodeStyleImpl extends BaseClass(INodeStyle) {
  _renderer = new ShinyPlateNodeStyleRenderer()

  _fill = Color.BLACK
  _stroke = null
  _radius = 5
  _insets = new Insets(5)

  constructor() {
    super()
  }

  get fill() {
    return this._fill
  }

  set fill(value) {
    this._fill = value
  }

  get stroke() {
    return this._stroke
  }

  set stroke(value) {
    this._stroke = value
  }

  get radius() {
    return this._radius
  }

  set radius(value) {
    this._radius = value
  }

  get insets() {
    return this._insets
  }

  set insets(value) {
    this._insets = value
  }

  /** @inheritdoc */
  get renderer() {
    return this._renderer
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

class ShinyPlateNodeStyleRenderer extends BaseClass(
  INodeStyleRenderer,
  IShapeGeometry,
  IBoundsProvider,
  IVisibilityTestable,
  IMarqueeTestable,
  IHitTestable,
  ILookup,
  IVisualCreator,
  ILassoTestable
) {
  _style
  _node
  _outline = null

  get style() {
    return this._style
  }

  set style(value) {
    this._style = value
  }

  get node() {
    return this._node
  }

  set node(value) {
    this._node = value
  }

  get fill() {
    return this.style.fill
  }

  get stroke() {
    return this.style.stroke ?? null
  }

  get radius() {
    return this.style.radius
  }

  get layout() {
    return this.node.layout
  }

  get outline() {
    return this._outline
  }

  set outline(value) {
    this._outline = value
  }

  constructor() {
    super()
  }

  createVisual(context) {
    return new ShinyPlateNodeStyleVisual().render(
      this.fill,
      this.stroke,
      this.layout,
      this.radius,
      context
    )
  }

  updateVisual(context, oldVisual) {
    if (oldVisual) {
      return oldVisual.update(this.fill, this.stroke, this.layout, this.radius, context)
    } else {
      return this.createVisual(context)
    }
  }

  getIntersection(inner, outer) {
    return findLineIntersectionWithRoundRect(inner, outer, this.layout.toRect(), this.radius)
  }

  isInside(location) {
    return roundRectContains(location, this.layout, this.radius)
  }

  isHit(context, location) {
    return roundRectIsHit(location, this.layout, this.radius, context.hitTestRadius)
  }

  getOutline() {
    if (this.outline) {
      return this.outline
    } else {
      const layout = this.layout
      this.outline = createRoundRectanglePath(
        layout.x,
        layout.y,
        layout.width,
        layout.height,
        this.radius
      )
      return this.outline
    }
  }

  configure() {
    this.outline = null
  }

  isVisible(context, rectangle) {
    return rectangle.intersects(Rect.from(this.layout))
  }

  lookup(type) {
    if (type === IGroupPaddingProvider) {
      return new MyGroupPaddingProvider(this.style)
    }
    return null
  }

  getBounds(context) {
    return Rect.from(this.layout)
  }

  isInPath(context, lassoPath) {
    const outline = this.getOutline()
    return lassoPath.areaIntersects(outline, context.hitTestRadius)
  }

  getVisualCreator(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IVisualCreator.VOID_VISUAL_CREATOR
    }
  }

  getBoundsProvider(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IBoundsProvider.EMPTY
    }
  }

  getHitTestable(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IHitTestable.NEVER
    }
  }

  getMarqueeTestable(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IMarqueeTestable.NEVER
    }
  }

  getVisibilityTestable(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      return this
    } else {
      return IVisibilityTestable.NEVER
    }
  }

  getLassoTestable(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return ILassoTestable.NEVER
    }
  }

  getContext(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      return this
    } else {
      return ILookup.EMPTY
    }
  }

  isInBox(context, rectangle) {
    const rect = this.layout
    return rectangle.intersects(Rect.from(rect))
  }

  getShapeGeometry(node, style) {
    const theStyle = style
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IShapeGeometry.VOID_SHAPE_GEOMETRY
    }
  }
}

class ShinyPlateNodeStyleVisual extends SvgVisualGroup {
  fill = null
  stroke = null
  layout = new MutableRectangle()
  radius = 0

  constructor() {
    super()
  }

  render(fill, stroke, rectangle, radius, ctx) {
    const dx = rectangle.x
    const dy = rectangle.y
    this.fill = fill
    this.stroke = stroke
    this.radius = radius
    this.layout.setShape(rectangle)
    this.paint(rectangle, fill, stroke, radius, ctx)
    this.svgElement.setAttribute('transform', `translate(${dx}, ${dy})`)
    return this
  }

  update(fill, stroke, rectangle, radius, ctx) {
    const dx = rectangle.x
    const dy = rectangle.y
    const fillChanged = fill !== this.fill
    const strokeChanged = this.stroke !== stroke
    const radiusChanged = this.radius !== radius
    const layoutChanged =
      this.layout.width !== rectangle.width || this.layout.height !== rectangle.height

    if (fillChanged || strokeChanged || radiusChanged || layoutChanged) {
      this.stroke = stroke
      this.fill = fill
      this.radius = radius
      this.layout.setShape(rectangle)
      this.updateCore(
        rectangle,
        fill,
        stroke,
        radius,
        fillChanged,
        strokeChanged,
        radiusChanged,
        layoutChanged,
        ctx
      )
    }

    this.svgElement.setAttribute('transform', `translate(${dx}, ${dy})`)
    return this
  }

  paint(layout, fill, stroke, radius, ctx) {
    const container = this.svgElement

    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    let layoutWidth = layout.width
    let layoutHeight = layout.height

    const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rectangle.setAttribute('width', layoutWidth.toString())
    rectangle.setAttribute('height', layoutHeight.toString())
    rectangle.setAttribute('rx', radius.toString())
    rectangle.setAttribute('ry', radius.toString())
    fill?.applyTo(rectangle, ctx)
    stroke?.applyTo(rectangle, ctx)

    layoutWidth = Math.min(layoutWidth, Math.max(0.65 * layoutWidth, radius * 2))
    layoutHeight = Math.min(layoutHeight, Math.max(0.8 * layoutHeight, radius * 2))

    radius = Math.min(radius, Math.min(layoutWidth * 0.5, layoutHeight * 0.5))
    const r2 = Math.min(radius * 0.75, Math.min(layoutWidth * 0.4, layoutHeight * 0.4))

    const gp = new GeneralPath(12)

    gp.moveTo(radius - r2, radius)
    gp.quadTo(radius - r2, radius - r2, radius, radius - r2)
    gp.lineTo(layoutWidth - radius, radius - r2)
    gp.quadTo(layoutWidth - radius + r2, radius - r2, layoutWidth - radius + r2, radius)
    gp.quadTo(
      layoutWidth - radius + r2,
      radius + r2,
      layoutWidth * 0.5 + r2,
      layoutHeight * 0.5 + r2
    )
    gp.quadTo(radius + r2, layoutHeight - radius + r2, radius, layoutHeight - radius + r2)
    gp.quadTo(radius - r2, layoutHeight - radius + r2, radius - r2, layoutHeight - radius)

    const w = layoutWidth - r2 - r2
    const h = layoutHeight - r2 - r2

    // create gradient
    const gradientStops = [
      new GradientStop(Color.fromRGBA(255, 255, 255, 0.86), 0),
      new GradientStop(Color.fromRGBA(255, 255, 255, 0.08), 0.8)
    ]
    const gradientFill = new LinearGradient({
      spreadMethod: GradientSpreadMethod.PAD,
      gradientStops: gradientStops,
      startPoint: Point.ORIGIN,
      endPoint: this.calculateGradientVector(w, h)
    })
    gradientFill.freeze()

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const gradient = gradientFill.toSvgGradient()
    const gradientId = ctx.canvasComponent.svgDefsManager.generateUniqueDefsId()
    gradient.id = gradientId
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    defs.appendChild(gradient)
    path.setAttribute('fill', `url(#${gradientId})`)
    path.setAttribute('d', gp.createSvgPathData())

    container.appendChild(rectangle)
    container.appendChild(path)
    container.appendChild(defs)
  }

  updateCore(
    layout,
    fill,
    stroke,
    radius,
    fillChanged,
    strokeChanged,
    radiusChanged,
    layoutChanged,
    ctx
  ) {
    const container = this.svgElement

    if (container.childNodes.length !== 3) {
      this.paint(layout, fill, stroke, radius, ctx)
      return
    }

    const rectangle = container.childNodes[0]
    const path = container.childNodes[1]
    const defs = container.childNodes[2]

    let layoutWidth = layout.width
    let layoutHeight = layout.height

    if (radiusChanged) {
      rectangle.setAttribute('rx', radius.toString())
      rectangle.setAttribute('ry', radius.toString())
    }

    if (fillChanged) {
      fill?.applyTo(rectangle, ctx)
    }

    if (strokeChanged) {
      stroke?.applyTo(rectangle, ctx)
    }

    if (layoutChanged) {
      rectangle.setAttribute('width', layoutWidth.toString())
      rectangle.setAttribute('height', layoutHeight.toString())

      layoutWidth = Math.min(layoutWidth, Math.max(0.65 * layoutWidth, radius * 2))
      layoutHeight = Math.min(layoutHeight, Math.max(0.8 * layoutHeight, radius * 2))

      radius = Math.min(radius, Math.min(layoutWidth * 0.5, layoutHeight * 0.5))
      const r2 = Math.min(radius * 0.75, Math.min(layoutWidth * 0.4, layoutHeight * 0.4))

      const gp = new GeneralPath()

      gp.moveTo(radius - r2, radius)
      gp.quadTo(radius - r2, radius - r2, radius, radius - r2)
      gp.lineTo(layoutWidth - radius, radius - r2)
      gp.quadTo(layoutWidth - radius + r2, radius - r2, layoutWidth - radius + r2, radius)
      gp.quadTo(
        layoutWidth - radius + r2,
        radius + r2,
        layoutWidth * 0.5 + r2,
        layoutHeight * 0.5 + r2
      )
      gp.quadTo(radius + r2, layoutHeight - radius + r2, radius, layoutHeight - radius + r2)
      gp.quadTo(radius - r2, layoutHeight - radius + r2, radius - r2, layoutHeight - radius)

      const w = layoutWidth - r2 - r2
      const h = layoutHeight - r2 - r2

      // Assuming defs.firstChild is of a type with `x2` and `y2` properties, and `CalculateGradientVector` is a helper function
      const gradient = defs.firstChild

      // Calculate gradient vector based on `w` and `h`
      const vector = this.calculateGradientVector(w, h)
      gradient.setAttribute('x2', String(vector.x))
      gradient.setAttribute('y2', String(vector.y))

      // Set the path data (assuming `path` is defined and `CreateGeometry` is a method on `gp`)
      path.setAttribute('d', gp.createSvgPathData())
    }
  }

  calculateGradientVector(width, height) {
    if (width === 0) return new Point(0, 1)
    if (height === 0) return new Point(1, 0)

    const pqRatio = (width * width) / (height * height)

    let p, q
    if (pqRatio >= 1) {
      p = pqRatio
      q = 1
    } else {
      p = 1
      q = 1 / pqRatio
    }

    const x = width * (q / (p + q))
    const y = height * (p / (p + q))
    const factor = 1.0 / Math.max(x, y)
    return new Point(x * factor, y * factor)
  }
}

class MyGroupPaddingProvider extends BaseClass(IGroupPaddingProvider) {
  style

  constructor(style) {
    super()
    this.style = style
  }

  getPadding() {
    return this.style.insets
  }
}
