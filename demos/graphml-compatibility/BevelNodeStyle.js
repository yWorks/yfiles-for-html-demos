/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GradientStop,
  IBoundsProvider,
  IGroupPaddingProvider,
  IHitTestable,
  ILassoTestable,
  ILookup,
  IMarqueeTestable,
  INodeSizeConstraintProvider,
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
  Size,
  SvgVisualGroup
} from '@yfiles/yfiles'
import {
  createRoundRectanglePath,
  findLineIntersectionWithRoundRect,
  mixColors,
  roundRectContains,
  roundRectIsHit,
  toSvgColorString
} from './node-style-utils'

export class BevelNodeStyle extends DelegatingNodeStyle {
  impl = new BevelNodeStyleImpl()
  wrappedStyle

  constructor(options) {
    super()
    this.wrappedStyle = this.impl
    if (options) {
      this.color = options.color ?? Color.BLACK
      this.drawShadow = options.drawShadow ?? false
      this.inset = options.inset ?? 3
      this.radius = options.radius ?? 10
    }
  }

  get inset() {
    return this.impl.inset
  }

  set inset(value) {
    this.impl.inset = value
  }

  get radius() {
    return this.impl.radius
  }

  set radius(value) {
    this.impl.radius = value
  }

  get color() {
    return this.impl.color
  }

  set color(value) {
    this.impl.color = value
  }

  _drawShadow = false

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
    return new BevelNodeStyle({
      color: this.color,
      drawShadow: this.drawShadow,
      inset: this.inset,
      radius: this.radius
    })
  }
}

class BevelNodeStyleImpl extends BaseClass(INodeStyle) {
  _renderer = new BevelNodeStyleRenderer()

  constructor() {
    super()
  }

  _inset = 3

  // Getter and Setter for Inset
  get inset() {
    return this._inset
  }

  set inset(value) {
    this._inset = value
  }

  _radius = 10

  // Getter and Setter for Radius
  get radius() {
    return this._radius
  }

  set radius(value) {
    this._radius = value
  }

  _color = Color.BLACK

  // Getter and Setter for Color
  get color() {
    return this._color
  }

  set color(value) {
    this._color = value
  }

  // Getter for Renderer (readonly)
  get renderer() {
    return this._renderer
  }

  // Clone method
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

class BevelNodeStyleRenderer extends BaseClass(
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
  outline = null

  get layout() {
    return this.node.layout
  }

  _style

  get style() {
    return this._style
  }

  set style(value) {
    this._style = value
  }

  _node

  get node() {
    return this._node
  }

  set node(value) {
    this._node = value
  }

  get color() {
    return this.style.color
  }

  get inset() {
    return this.style.inset
  }

  get radius() {
    return this.style.radius
  }

  static createUpperRoundRectPath(roundRect, x, y, width, height, radius) {
    roundRect.clear()
    const arcX = Math.min(width * 0.5, radius)
    const arcY = Math.min(height, radius)
    roundRect.moveTo(x, y)
    roundRect.lineTo(x + width, y)
    roundRect.lineTo(x + width, y + height - arcY)
    roundRect.quadTo(x + width, y + height, x + width - arcX, y + height)
    roundRect.lineTo(x + arcX, y + height)
    roundRect.quadTo(x, y + height, x, y + height - arcY)
    roundRect.close()
    return roundRect
  }

  static createLowerRoundRectPath(roundRect, x, y, width, height, radius) {
    roundRect.clear()
    const arcX = Math.min(width * 0.5, radius)
    const arcY = Math.min(height, radius)
    roundRect.moveTo(x, y + arcY)
    roundRect.quadTo(x, y, x + arcX, y)
    roundRect.lineTo(x + width - arcX, y)
    roundRect.quadTo(x + width, y, x + width, y + arcY)
    roundRect.lineTo(x + width, y + height)
    roundRect.lineTo(x, y + height)
    roundRect.close()
    return roundRect
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

  isVisible(context, rectangle) {
    return rectangle.intersects(Rect.from(this.layout))
  }

  getBounds(context) {
    return Rect.from(this.layout)
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

  createVisual(context) {
    return new BevelNodeStyleVisual().render(
      this.color,
      this.inset,
      this.layout,
      this.radius,
      context
    )
  }

  updateVisual(context, oldVisual) {
    const visual = oldVisual
    if (visual) {
      return visual.update(this.color, this.inset, this.layout, this.radius, context)
    } else {
      return this.createVisual(context)
    }
  }

  getIntersection(inner, outer) {
    return findLineIntersectionWithRoundRect(inner, outer, this.layout, this.radius)
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
      return (this.outline = createRoundRectanglePath(
        layout.x,
        layout.y,
        layout.width,
        layout.height,
        this.radius
      ))
    }
  }

  lookup(type) {
    if (type === IGroupPaddingProvider) {
      return new MyGroupPaddingProvider(this.style)
    }
    if (type === INodeSizeConstraintProvider) {
      return new MySizeProvider(this.style)
    }
    return null
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

  isInPath(context, lassoPath) {
    const outline = this.getOutline()
    return lassoPath.areaIntersects(outline, context.hitTestRadius)
  }

  configure() {
    this.outline = null
  }
}

class BevelNodeStyleVisual extends SvgVisualGroup {
  color
  layout = new MutableRectangle()
  radius
  inset

  constructor() {
    super()
  }

  render(color, inset, rectangle, radius, context) {
    const container = this.svgElement
    this.color = color
    this.radius = radius
    this.inset = inset
    this.layout.setShape(rectangle)
    container.innerHTML = ''
    this.paint(rectangle, color, inset, radius, context)
    this.svgElement.setAttribute('transform', `translate(${rectangle.x}, ${rectangle.y})`)
    return this
  }

  update(color, inset, rectangle, radius, context) {
    const colorChanged = color !== this.color
    const radiusChanged = this.radius !== radius
    const insetChanged = this.inset !== inset
    const layoutChanged =
      this.layout.width !== rectangle.width || this.layout.height !== rectangle.height

    if (colorChanged || radiusChanged || insetChanged || layoutChanged) {
      this.color = color
      this.radius = radius
      this.inset = inset
      this.layout.setShape(rectangle)
      this.updateCore(
        rectangle,
        color,
        inset,
        radius,
        layoutChanged,
        colorChanged,
        insetChanged,
        radiusChanged,
        context
      )
    }

    this.svgElement.setAttribute('transform', `translate(${rectangle.x}, ${rectangle.y})`)
    return this
  }

  paint(layout, color, inset, radius, context) {
    const container = this.svgElement
    while (container.hasChildNodes()) {
      container.removeChild(container.firstChild)
    }

    const layoutWidth = layout.width
    const layoutHeight = layout.height

    const roundedRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    roundedRectangle.setAttribute('width', layoutWidth.toString())
    roundedRectangle.setAttribute('height', layoutHeight.toString())
    roundedRectangle.setAttribute('rx', radius.toString())
    roundedRectangle.setAttribute('ry', radius.toString())

    const brush = this.createFill(color)
    const gradient = brush.toSvgGradient()
    const gradientId = context.canvasComponent.svgDefsManager.generateUniqueDefsId()
    gradient.id = gradientId
    roundedRectangle.setAttribute('fill', `url(#${gradientId})`)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    defs.appendChild(gradient)

    const strokeColor = mixColors(color, Color.WHITE, 0.15)

    const strokedRectangle1 = this.createStrokedRectangle(
      layoutWidth,
      layoutHeight,
      inset,
      radius,
      toSvgColorString(strokeColor),
      2
    )
    const strokedRectangle2 = this.createStrokedRectangle(
      layoutWidth,
      layoutHeight,
      inset,
      radius,
      toSvgColorString(color),
      1
    )

    container.appendChild(roundedRectangle)
    container.appendChild(strokedRectangle1)
    container.appendChild(strokedRectangle2)
    container.appendChild(defs)
  }

  createFill(color) {
    const gradientStops = [
      new GradientStop(mixColors(Color.WHITE, color, 0.75), 0),
      new GradientStop(mixColors(Color.WHITE, color, 0.2), 0.5),
      new GradientStop(color, 0.5),
      new GradientStop(color, 1)
    ]

    const fill = new LinearGradient({
      gradientStops,
      startPoint: new Point(0, 0),
      endPoint: new Point(0, 1)
    })
    fill.freeze()

    return fill
  }

  updateCore(
    layout,
    color,
    inset,
    radius,
    layoutChanged,
    colorChanged,
    insetChanged,
    radiusChanged,
    context
  ) {
    const container = this.svgElement

    if (container.childNodes.length !== 4) {
      this.paint(layout, color, inset, radius, context)
      return
    }

    const layoutWidth = layout.width
    const layoutHeight = layout.height

    const roundedRectangle = container.childNodes[0]
    const strokedRectangle1 = container.childNodes[1]
    const strokedRectangle2 = container.childNodes[2]
    const defs = container.childNodes[3]

    if (colorChanged) {
      while (defs.hasChildNodes()) {
        defs.removeChild(defs.firstChild)
      }
      const fill = this.createFill(color)
      const gradient = fill.toSvgGradient()
      const gradientId = context.canvasComponent.svgDefsManager.generateUniqueDefsId()
      gradient.id = gradientId
      roundedRectangle.setAttribute('fill', `url(#${gradientId})`)
      defs.appendChild(gradient)
      const strokeFill = toSvgColorString(mixColors(color, Color.WHITE, 0.15))
      strokedRectangle1.setAttribute('stroke', strokeFill)
    }

    if (insetChanged) {
      strokedRectangle1.setAttribute('x', inset.toString())
      strokedRectangle1.setAttribute('y', inset.toString())
      strokedRectangle2.setAttribute('x', inset.toString())
      strokedRectangle2.setAttribute('y', inset.toString())
    }

    if (radiusChanged) {
      roundedRectangle.setAttribute('rx', radius.toString())
      roundedRectangle.setAttribute('ry', radius.toString())
    }

    if (layoutChanged) {
      roundedRectangle.setAttribute('width', layoutWidth.toString())
      roundedRectangle.setAttribute('height', layoutHeight.toString())
    }

    if (insetChanged || layoutChanged) {
      strokedRectangle1.setAttribute('width', Math.max(0, layoutWidth - inset - inset).toString())
      strokedRectangle1.setAttribute('height', Math.max(0, layoutHeight - inset - inset).toString())
      strokedRectangle2.setAttribute('width', Math.max(0, layoutWidth - inset - inset).toString())
      strokedRectangle2.setAttribute('height', Math.max(0, layoutHeight - inset - inset).toString())
    }

    if (insetChanged || radiusChanged) {
      const arcRadius = Math.max(0, radius - inset)
      strokedRectangle1.setAttribute('rx', arcRadius.toString())
      strokedRectangle1.setAttribute('ry', arcRadius.toString())
      strokedRectangle2.setAttribute('rx', arcRadius.toString())
      strokedRectangle2.setAttribute('ry', arcRadius.toString())
    }
  }

  createStrokedRectangle(layoutWidth, layoutHeight, inset, radius, strokeColor, strokeWidth) {
    const strokedRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    strokedRectangle.setAttribute('x', inset.toString())
    strokedRectangle.setAttribute('y', inset.toString())
    strokedRectangle.setAttribute('width', Math.max(0, layoutWidth - 2 * inset).toString())
    strokedRectangle.setAttribute('height', Math.max(0, layoutHeight - 2 * inset).toString())

    const arcRadius = Math.max(0, radius - inset)
    strokedRectangle.setAttribute('rx', arcRadius.toString())
    strokedRectangle.setAttribute('ry', arcRadius.toString())
    strokedRectangle.setAttribute('fill', 'none')
    strokedRectangle.setAttribute('stroke', strokeColor)
    strokedRectangle.setAttribute('stroke-width', strokeWidth.toString())
    return strokedRectangle
  }
}

class MySizeProvider extends BaseClass(INodeSizeConstraintProvider) {
  style

  constructor(style) {
    super()
    this.style = style
  }

  getMinimumSize() {
    const value = this.style.radius * 2 + 2
    return new Size(value, value)
  }

  getMaximumSize() {
    return Size.INFINITE
  }

  getMinimumEnclosedArea() {
    return Rect.EMPTY
  }
}

class MyGroupPaddingProvider extends BaseClass(IGroupPaddingProvider) {
  style

  constructor(style) {
    super()
    this.style = style
  }

  getPadding() {
    const value = this.style.radius + 1
    return new Insets(value)
  }
}
