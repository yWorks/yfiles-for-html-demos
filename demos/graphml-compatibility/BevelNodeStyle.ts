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
  type GeneralPath,
  GradientStop,
  IBoundsProvider,
  type ICanvasContext,
  IGroupPaddingProvider,
  IHitTestable,
  type IInputModeContext,
  ILassoTestable,
  ILookup,
  IMarqueeTestable,
  type INode,
  INodeSizeConstraintProvider,
  INodeStyle,
  INodeStyleRenderer,
  Insets,
  type IRectangle,
  type IRenderContext,
  IShapeGeometry,
  IVisibilityTestable,
  IVisualCreator,
  LinearGradient,
  MutableRectangle,
  Point,
  Rect,
  ShadowNodeStyleDecorator,
  Size,
  SvgVisualGroup,
  type Visual
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
  private readonly impl = new BevelNodeStyleImpl()
  private wrappedStyle: INodeStyle

  constructor(options?: { color?: Color; drawShadow?: boolean; inset?: number; radius?: number }) {
    super()
    this.wrappedStyle = this.impl
    if (options) {
      this.color = options.color ?? Color.BLACK
      this.drawShadow = options.drawShadow ?? false
      this.inset = options.inset ?? 3
      this.radius = options.radius ?? 10
    }
  }

  public get inset(): number {
    return this.impl.inset
  }

  public set inset(value: number) {
    this.impl.inset = value
  }

  public get radius(): number {
    return this.impl.radius
  }

  public set radius(value: number) {
    this.impl.radius = value
  }

  public get color(): Color {
    return this.impl.color
  }

  public set color(value: Color) {
    this.impl.color = value
  }

  private _drawShadow = false

  get drawShadow(): boolean {
    return this._drawShadow
  }

  set drawShadow(value: boolean) {
    this._drawShadow = value

    if (value) {
      this.wrappedStyle = new ShadowNodeStyleDecorator(this.impl)
    } else {
      this.wrappedStyle = this.impl
    }
  }

  protected getStyle(node: INode): INodeStyle {
    return this.wrappedStyle
  }

  clone(): this {
    return new BevelNodeStyle({
      color: this.color,
      drawShadow: this.drawShadow,
      inset: this.inset,
      radius: this.radius
    }) as this
  }
}

class BevelNodeStyleImpl extends BaseClass(INodeStyle) {
  public readonly _renderer: BevelNodeStyleRenderer = new BevelNodeStyleRenderer()

  constructor() {
    super()
  }

  private _inset: number = 3

  // Getter and Setter for Inset
  public get inset(): number {
    return this._inset
  }

  public set inset(value: number) {
    this._inset = value
  }

  private _radius: number = 10

  // Getter and Setter for Radius
  public get radius(): number {
    return this._radius
  }

  public set radius(value: number) {
    this._radius = value
  }

  private _color: Color = Color.BLACK

  // Getter and Setter for Color
  public get color(): Color {
    return this._color
  }

  public set color(value: Color) {
    this._color = value
  }

  // Getter for Renderer (readonly)
  public get renderer(): INodeStyleRenderer {
    return this._renderer
  }

  // Clone method
  public clone(): this {
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
  private outline: GeneralPath | null = null

  public get layout(): IRectangle {
    return this.node.layout
  }

  private _style!: BevelNodeStyleImpl

  protected get style(): BevelNodeStyleImpl {
    return this._style
  }

  protected set style(value: BevelNodeStyleImpl) {
    this._style = value
  }

  private _node!: INode

  protected get node(): INode {
    return this._node
  }

  protected set node(value: INode) {
    this._node = value
  }

  protected get color(): Color {
    return this.style.color
  }

  protected get inset(): number {
    return this.style.inset
  }

  protected get radius(): number {
    return this.style.radius
  }

  static createUpperRoundRectPath(
    roundRect: GeneralPath,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): GeneralPath {
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

  static createLowerRoundRectPath(
    roundRect: GeneralPath,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): GeneralPath {
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

  public getVisualCreator(node: INode, style: INodeStyle): IVisualCreator {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IVisualCreator.VOID_VISUAL_CREATOR
    }
  }

  public getBoundsProvider(node: INode, style: INodeStyle): IBoundsProvider {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IBoundsProvider.EMPTY
    }
  }

  public getHitTestable(node: INode, style: INodeStyle): IHitTestable {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IHitTestable.NEVER
    }
  }

  public getMarqueeTestable(node: INode, style: INodeStyle): IMarqueeTestable {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IMarqueeTestable.NEVER
    }
  }

  public getVisibilityTestable(node: INode, style: INodeStyle): IVisibilityTestable {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      return this
    } else {
      return IVisibilityTestable.NEVER
    }
  }

  public getContext(node: INode, style: INodeStyle): ILookup {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      return this
    } else {
      return ILookup.EMPTY
    }
  }

  public isInBox(context: IInputModeContext, rectangle: Rect): boolean {
    const rect = this.layout
    return rectangle.intersects(Rect.from(rect))
  }

  public isVisible(context: ICanvasContext, rectangle: Rect): boolean {
    return rectangle.intersects(Rect.from(this.layout))
  }

  public getBounds(context: ICanvasContext): Rect {
    return Rect.from(this.layout)
  }

  public getShapeGeometry(node: INode, style: INodeStyle): IShapeGeometry {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return IShapeGeometry.VOID_SHAPE_GEOMETRY
    }
  }

  public createVisual(context: IRenderContext): Visual {
    return new BevelNodeStyleVisual().render(
      this.color,
      this.inset,
      this.layout,
      this.radius,
      context
    )
  }

  public updateVisual(context: IRenderContext, oldVisual: Visual): Visual {
    const visual = oldVisual as BevelNodeStyleVisual
    if (visual) {
      return visual.update(this.color, this.inset, this.layout, this.radius, context)
    } else {
      return this.createVisual(context)
    }
  }

  public getIntersection(inner: Point, outer: Point): Point | null {
    return findLineIntersectionWithRoundRect(inner, outer, this.layout, this.radius)
  }

  public isInside(location: Point): boolean {
    return roundRectContains(location, this.layout, this.radius)
  }

  public isHit(context: IInputModeContext, location: Point): boolean {
    return roundRectIsHit(location, this.layout, this.radius, context.hitTestRadius)
  }

  public getOutline(): GeneralPath {
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

  public lookup(type: any): any {
    if (type === IGroupPaddingProvider) {
      return new MyGroupPaddingProvider(this.style)
    }
    if (type === INodeSizeConstraintProvider) {
      return new MySizeProvider(this.style)
    }
    return null
  }

  getLassoTestable(node: INode, style: INodeStyle): ILassoTestable {
    const theStyle = style as BevelNodeStyleImpl
    if (theStyle) {
      this.style = theStyle
      this.node = node
      this.configure()
      return this
    } else {
      return ILassoTestable.NEVER
    }
  }

  isInPath(context: IInputModeContext, lassoPath: GeneralPath): boolean {
    const outline = this.getOutline()
    return lassoPath.areaIntersects(outline, context.hitTestRadius)
  }

  protected configure(): void {
    this.outline = null
  }
}

class BevelNodeStyleVisual extends SvgVisualGroup {
  private color!: Color
  private readonly layout = new MutableRectangle()
  private radius!: number
  private inset!: number

  constructor() {
    super()
  }

  render(
    color: Color,
    inset: number,
    rectangle: IRectangle,
    radius: number,
    context: IRenderContext
  ): BevelNodeStyleVisual {
    const container = this.svgElement as SVGGElement
    this.color = color
    this.radius = radius
    this.inset = inset
    this.layout.setShape(rectangle)
    container.innerHTML = ''
    this.paint(rectangle, color, inset, radius, context)
    this.svgElement.setAttribute('transform', `translate(${rectangle.x}, ${rectangle.y})`)
    return this
  }

  update(
    color: Color,
    inset: number,
    rectangle: IRectangle,
    radius: number,
    context: IRenderContext
  ): BevelNodeStyleVisual {
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

  private paint(
    layout: IRectangle,
    color: Color,
    inset: number,
    radius: number,
    context: IRenderContext
  ) {
    const container = this.svgElement as SVGGElement
    while (container.hasChildNodes()) {
      container.removeChild(container.firstChild!)
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
    const gradientId = context.canvasComponent!.svgDefsManager.generateUniqueDefsId()
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

  private createFill(color: Color): LinearGradient {
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

  private updateCore(
    layout: IRectangle,
    color: Color,
    inset: number,
    radius: number,
    layoutChanged: boolean,
    colorChanged: boolean,
    insetChanged: boolean,
    radiusChanged: boolean,
    context: IRenderContext
  ) {
    const container = this.svgElement

    if (container.childNodes.length !== 4) {
      this.paint(layout, color, inset, radius, context)
      return
    }

    const layoutWidth = layout.width
    const layoutHeight = layout.height

    const roundedRectangle = container.childNodes[0] as SVGRectElement
    const strokedRectangle1 = container.childNodes[1] as SVGRectElement
    const strokedRectangle2 = container.childNodes[2] as SVGRectElement
    const defs = container.childNodes[3] as SVGDefsElement

    if (colorChanged) {
      while (defs.hasChildNodes()) {
        defs.removeChild(defs.firstChild!)
      }
      const fill = this.createFill(color)
      const gradient = fill.toSvgGradient()
      const gradientId = context.canvasComponent!.svgDefsManager.generateUniqueDefsId()
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

  private createStrokedRectangle(
    layoutWidth: number,
    layoutHeight: number,
    inset: number,
    radius: number,
    strokeColor: string,
    strokeWidth: number
  ): SVGRectElement {
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
  private style: BevelNodeStyleImpl

  constructor(style: BevelNodeStyleImpl) {
    super()
    this.style = style
  }

  public getMinimumSize(): Size {
    const value = this.style.radius * 2 + 2
    return new Size(value, value)
  }

  public getMaximumSize(): Size {
    return Size.INFINITE
  }

  public getMinimumEnclosedArea(): Rect {
    return Rect.EMPTY
  }
}

class MyGroupPaddingProvider extends BaseClass(IGroupPaddingProvider) {
  private style: BevelNodeStyleImpl

  constructor(style: BevelNodeStyleImpl) {
    super()
    this.style = style
  }

  public getPadding(): Insets {
    const value = this.style.radius + 1
    return new Insets(value)
  }
}
