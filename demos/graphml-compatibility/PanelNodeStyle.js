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
  GeneralPath,
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
  IPoint,
  IShapeGeometry,
  IVisibilityTestable,
  IVisualCreator,
  LinearGradient,
  Point,
  Rect,
  Stroke,
  SvgVisual,
  SvgVisualGroup
} from '@yfiles/yfiles'
import { mixColors, rectangleContains, toSvgColorString } from './node-style-utils'

/**
 * An implementation of INodeStyle that draws a
 * floating panel with a slight gradient and a thin border.
 * This style can be used to create the visual representation
 * for group nodes, for example.
 * This style uses the PanelNodeStyleRenderer to visualize a node.
 */
export class PanelNodeStyle extends BaseClass(INodeStyle) {
  _color = Color.BLACK
  _labelInsetsColor = Color.LIGHT_GRAY
  _insets = new Insets(5)
  _renderer = new PanelNodeStyleRenderer()

  /**
   * Creates a new instance using the provided options.
   * @param options Optional, including renderer, color, labelInsetsColor and insets
   */
  constructor(options) {
    super()
    if (options) {
      this._renderer = options.renderer ?? new PanelNodeStyleRenderer()
      this.color = options.color ?? Color.BLACK
      this.labelInsetsColor = options.labelInsetsColor ?? Color.LIGHT_GRAY
      this.insets = options.insets ?? new Insets(5)
    }
  }

  /**
   * Gets the base color to use.
   */
  get color() {
    return this._color
  }

  /**
   * Sets the base color to use. The default value is Color.BLACK.
   */
  set color(value) {
    this._color = value
  }

  /**
   * Gets the base color to use for drawing the label insets background.
   */
  get labelInsetsColor() {
    return this._labelInsetsColor
  }

  /**
   * Sets the base color to use for drawing the label insets background.
   * @param value Setting this to null effectively disables label insets background coloring.
   * The default value is Color.LIGHTGRAY.
   */
  set labelInsetsColor(value) {
    this._labelInsetsColor = value
  }

  /**
   * Gets the instance to use that provides the insets for this style.
   */
  get insets() {
    return this._insets
  }

  /**
   * Sets the instance to use that provides the insets for this style.
   * The PanelNodeStyleRenderer will use these insets and return them
   * via an INodeInsetsProvider if such an instance is queried through the
   * context lookup.
   */
  set insets(value) {
    this._insets = value
  }

  /** @inheritdoc */
  get renderer() {
    return this._renderer
  }

  /** @inheritdoc */
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

/**
 * A INodeStyleRenderer implementation that draws a floating panel with a
 * slight gradient, a thin border and a drop shadow.
 */
class PanelNodeStyleRenderer extends BaseClass(
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
  /**
   * The style that it currently assigned to this renderer instance.
   */
  _style
  /**
   * The node that it currently assigned to this renderer instance.
   */
  _node

  /**
   * Gets the currently configured style.
   */
  get style() {
    return this._style
  }

  /**
   * Sets the currently configured style.
   */
  set style(value) {
    this._style = value
  }

  /**
   * Gets the currently configured node.
   */
  get node() {
    return this._node
  }

  /**
   * Sets the currently configured node.
   */
  set node(value) {
    this._node = value
  }

  /**
   * Prepares this instance for subsequent calls after the
   * style and node have been initialized.
   * Upon invocation the style and node properties have
   * been populated by the getVisualCreator,
   * getBoundsProvider, getHitTestable, getLassoTestable, or
   * getMarqueeTestable methods.
   * This is an empty implementation. Subclasses might have to override this method.
   */
  configure() {}

  /**
   * Configures the style and node parameters,
   * calls configure and returns this.
   * @param node The node to retrieve the IVisualCreator for. The value will
   * be stored in the node property.
   * @param style The style to associate with the node. The value will
   * be stored in the style property.
   */
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

  /**
   * Configures the style and node parameters,
   * calls configure and returns this.
   * @param node The node to retrieve the bounds provider for. The value will
   * be stored in the node property.
   * @param style The style to associate with the node. The value will
   * be stored in the style property.
   */
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

  /**
   * Configures the style and node parameters,
   * calls configure and returns this.
   * @param node The node to query hit test with. The value will
   * be stored in the node property.
   * @param style The style to associate with the node. The value will
   * be stored in the style property.
   */
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

  /**
   * Configures the style and node parameters,
   * calls configure and returns this.
   * @param node The node to query marquee intersection tests. The value will
   * be stored in the node property.
   * @param style The style to associate with the node. The value will
   * be stored in the style property.
   */
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

  /**
   * Configures the style and node parameters,
   * calls configure and returns this.
   * Unlike most of the other methods this implementation does <b>not</b> call
   * configure. If the subclass implementation depends on this
   * instance to be configured, it needs to call configure in
   * isVisible.
   * @param node The node to query visibility tests. The value will
   * be stored in the node property.
   * @param style The style to associate with the node. The value will
   * be stored in the style property.
   */
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

  /**
   * Configures the style and node parameters,
   * calls configure and returns this.
   * @param node The node to query lasso test with. The value will
   * be stored in the node property.
   * @param style The style to associate with the node. The value will
   * be stored in the style property.
   */
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

  /**
   * Configures the style and node parameters,
   * calls configure and returns this.
   * As this method may be called often it will not automatically call configure,
   * instead subclasses should ensure that in the lookup method call they should
   * configure only if needed, i.e. if they decide to return this or
   * an instance that depends on a correctly configured this.
   * @param node The node to query the context for. The value will
   * be stored in the node property.
   * @param style The style to associate with the node. The value will
   * be stored in the style property.
   */
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

  /**
   * Lasso tests the node using the current style.
   * This implementation uses the outline to determine whether the node has been hit.
   * The check is delegated to GeneralPath.areaIntersects(GeneralPath,number)
   * using ICanvasContext.hitTestRadius as the last argument.
   * @param context the context the lasso test is performed in
   * @param lassoPath the lasso path
   */
  isInPath(context, lassoPath) {
    const outline = this.getOutline()
    return lassoPath.areaIntersects(outline, context.hitTestRadius)
  }

  /**
   * Hit tests the node using the current style.
   * This implementation uses the layout to determine whether the node has been hit.
   * The check is delegated to Rect.contains(Point,number)
   * using ICanvasContext.hitTestRadius as the last argument.
   * @param context the context the hit test is performed in
   * @param location the coordinates in world coordinate system
   */
  isHit(context, location) {
    return rectangleContains(
      this.layout.x,
      this.layout.y,
      this.layout.width,
      this.layout.height,
      location.x,
      location.y,
      context.hitTestRadius
    )
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

  getIntersection(inner, outer) {
    const l = this.layout.toRect()
    const innerPoint = IPoint.from(inner)
    const outerPoint = IPoint.from(outer)
    if (!l.contains(innerPoint)) {
      return inner
    }
    if (l.contains(outerPoint)) {
      return null
    }
    return l.findLineIntersection(innerPoint, outerPoint)
  }

  isInside(location) {
    return this.layout.toRect().contains(IPoint.from(location))
  }

  getOutline() {
    const path = new GeneralPath(4)
    path.appendRectangle(this.node.layout, false)
    return path
  }

  get layout() {
    return this.node.layout
  }

  get color() {
    return this.style.color
  }

  isVisible(context, rectangle) {
    return rectangle.intersects(Rect.from(this.layout))
  }

  createVisual(context) {
    if (this.layout.width <= 0 || this.layout.height <= 0) {
      return null
    }
    let insetsSum = Insets.EMPTY
    if (this.node.labels.size > 0 && this.style.labelInsetsColor !== Color.TRANSPARENT) {
      for (const label of this.node.labels) {
        const provider = label.layoutParameter.model.getContext(label).lookup(IGroupPaddingProvider)
        if (provider) {
          const insets = provider.getPadding()
          insetsSum = insetsSum.createUnion(insets)
        }
      }
    }
    return new PanelNodeStyleVisual().render(
      this.color,
      this.style.labelInsetsColor,
      this.layout,
      insetsSum,
      context
    )
  }

  updateVisual(context, oldVisual) {
    if (this.layout.width <= 0 || this.layout.height <= 0) {
      return null
    }
    const visual = oldVisual
    if (visual) {
      let insetsSum = Insets.EMPTY
      if (this.node.labels.size > 0 && this.style.labelInsetsColor !== Color.TRANSPARENT) {
        for (const label of this.node.labels) {
          const provider = label.layoutParameter.model
            .getContext(label)
            .lookup(IGroupPaddingProvider)
          if (provider) {
            const insets = provider.getPadding()
            insetsSum = insetsSum.createUnion(insets)
          }
        }
      }
      return visual.update(this.color, this.style.labelInsetsColor, this.layout, insetsSum, context)
    } else {
      return this.createVisual(context)
    }
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
}

class MyGroupPaddingProvider extends BaseClass(IGroupPaddingProvider) {
  _style

  constructor(style) {
    super()
    this._style = style
  }

  getPadding() {
    return this._style.insets
  }
}

class PanelNodeStyleVisual extends SvgVisualGroup {
  color
  layout
  insetsSum
  labelColor
  gradient
  stroke

  constructor() {
    super()
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  }

  render(color, labelColor, rectangle, labelInsetsSum, ctx) {
    if (labelColor.equals(Color.TRANSPARENT)) {
      labelInsetsSum = Insets.EMPTY
    }
    this.color = color
    this.labelColor = labelColor
    this.layout = rectangle.toRect()
    this.insetsSum = labelInsetsSum

    this.paint(rectangle, color, labelColor, labelInsetsSum, ctx)
    SvgVisual.setTranslate(this.svgElement, rectangle.x, rectangle.y)
    return this
  }

  update(color, labelColor, rectangle, labelInsetsSum, ctx) {
    if (labelColor.equals(Color.TRANSPARENT)) {
      labelInsetsSum = Insets.EMPTY
    }

    const insetsChanged = this.insetsSum !== labelInsetsSum
    const colorChanged = color !== this.color
    const labelColorChanged = labelColor !== this.labelColor
    if (!colorChanged && !labelColorChanged) {
      if (this.layout.width == rectangle.width && this.layout.height == rectangle.height) {
        if (!insetsChanged) {
          SvgVisual.setTranslate(this.svgElement, rectangle.x, rectangle.y)
          return this
        }
      }
    }

    this.color = color
    this.labelColor = labelColor
    this.layout = rectangle.toRect()
    this.insetsSum = labelInsetsSum

    this.updateCore(
      rectangle,
      color,
      labelColor,
      this.insetsSum,
      colorChanged,
      labelColorChanged,
      insetsChanged,
      ctx
    )
    SvgVisual.setTranslate(this.svgElement, rectangle.x, rectangle.y)
    return this
  }

  paint(layout, color, labelInsetsColor, insetsSum, ctx) {
    const container = this.svgElement

    while (container.hasChildNodes()) {
      container.removeChild(container.firstChild)
    }

    const layoutWidth = layout.width
    const layoutHeight = layout.height
    const gradientStops = [
      new GradientStop(mixColors(Color.fromRGBA(255, 255, 255, 255), color, 0.75), 0),
      new GradientStop(color, 1)
    ]
    this.gradient = new LinearGradient({
      gradientStops,
      startPoint: new Point(0, 0),
      endPoint: new Point(0, 1)
    })

    const lineColor = mixColors(color, Color.BLACK, 0.8)
    const lineGradient = new LinearGradient({
      gradientStops: [new GradientStop(lineColor, 0), new GradientStop(color, 1)],
      startPoint: new Point(0, 0),
      endPoint: new Point(1, 1)
    })

    this.stroke = new Stroke(lineGradient, 1)

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', layoutWidth.toString())
    rect.setAttribute('height', layoutHeight.toString())
    this.gradient.applyTo(rect, ctx)
    container.appendChild(rect)

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute(
      'd',
      `M0,0L${layoutWidth},0L${layoutWidth},${layoutHeight}L0,${layoutHeight}Z`
    )
    path.setAttribute('fill', 'none')
    this.stroke.applyTo(path, ctx)
    container.appendChild(path)

    if (!insetsSum.isEmpty && labelInsetsColor != Color.TRANSPARENT) {
      this.insertInsets(
        container,
        layoutWidth,
        layoutHeight,
        insetsSum,
        path,
        labelInsetsColor,
        lineColor
      )
    }
  }

  updateCore(
    layout,
    color,
    labelInsetsColor,
    insetsSum,
    colorChanged,
    labelInsetsColorChanged,
    insetsChanged,
    ctx
  ) {
    const container = this.svgElement

    const rectangle = container.childNodes.item(0)
    const path = container.lastChild

    const layoutWidth = layout.width
    const layoutHeight = layout.height

    // update the layout
    rectangle.setAttribute('width', layoutWidth.toString())
    rectangle.setAttribute('height', layoutHeight.toString())
    path.setAttribute(
      'd',
      `M0,0L${layoutWidth},0L${layoutWidth},${layoutHeight}L0,${layoutHeight}Z`
    )

    const lineColor = mixColors(color, Color.BLACK, 0.8)

    // update the gradients
    if (colorChanged) {
      this.gradient.gradientStops.get(0).color = mixColors(Color.WHITE, color, 0.75)
      this.gradient.gradientStops.get(1).color = color

      const lineGradient = this.stroke.fill
      lineGradient.gradientStops.get(0).color = lineColor
      lineGradient.gradientStops.get(1).color = color
    }

    if (!insetsSum.isEmpty && labelInsetsColor !== Color.TRANSPARENT) {
      // update the insets
      if (insetsChanged) {
        // remove old inset elements
        while (container.childNodes.length > 2) {
          container.removeChild(container.childNodes.item(1))
        }
        this.insertInsets(
          container,
          layoutWidth,
          layoutHeight,
          insetsSum,
          path,
          labelInsetsColor,
          lineColor
        )
      } else {
        // update inset elements
        this.updateInsets(
          container,
          layoutWidth,
          layoutHeight,
          insetsSum,
          labelInsetsColor,
          lineColor,
          colorChanged,
          labelInsetsColorChanged
        )
      }
    } else {
      // remove old inset elements
      while (container.childNodes.length > 2) {
        container.removeChild(container.childNodes.item(1))
      }
    }
  }

  insertInsets(
    container,
    layoutWidth,
    layoutHeight,
    insetsSum,
    beforeElement,
    labelInsetsColor,
    lineColor
  ) {
    const lineColorSvg = toSvgColorString(lineColor)

    let bottom = layoutHeight
    const insetsTop = insetsSum.top
    const insetsRight = insetsSum.right
    const insetsBottom = insetsSum.bottom
    const insetsLeft = insetsSum.left
    const backgroundColor = toSvgColorString(labelInsetsColor)

    if (insetsTop > 0) {
      const rectTop = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectTop.setAttribute('width', layoutWidth.toString())
      rectTop.setAttribute('height', insetsTop.toString())
      rectTop.setAttribute('fill', backgroundColor)
      container.insertBefore(rectTop, beforeElement)
    }

    if (insetsBottom > 0) {
      const rectBottom = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectBottom.setAttribute('width', layoutWidth.toString())
      rectBottom.setAttribute('height', insetsBottom.toString())
      rectBottom.setAttribute('fill', backgroundColor)
      bottom = layoutHeight - insetsBottom
      rectBottom.setAttribute('transform', `translate(0, ${bottom})`)
      container.insertBefore(rectBottom, beforeElement)
    }

    if (insetsLeft > 0 && bottom - insetsTop > 0) {
      const rectLeft = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectLeft.setAttribute('width', insetsLeft.toString())
      rectLeft.setAttribute('height', (bottom - insetsTop).toString())
      rectLeft.setAttribute('fill', backgroundColor)
      rectLeft.setAttribute('transform', `translate(0, ${insetsTop})`)
      container.insertBefore(rectLeft, beforeElement)
    }

    if (insetsRight > 0 && bottom - insetsTop > 0) {
      const rectRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rectRight.setAttribute('width', insetsRight.toString())
      rectRight.setAttribute('height', (bottom - insetsTop).toString())
      rectRight.setAttribute('fill', backgroundColor)
      rectRight.setAttribute('transform', `translate(${layoutWidth - insetsRight}, ${insetsTop})`)
      container.insertBefore(rectRight, beforeElement)
    }

    const createLine = (x1, y1, x2, y2) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', x1.toString())
      line.setAttribute('y1', y1.toString())
      line.setAttribute('x2', x2.toString())
      line.setAttribute('y2', y2.toString())
      line.setAttribute('stroke', lineColorSvg)
      line.setAttribute('stroke-width', '1')
      return line
    }

    if (insetsTop > 0) {
      const lineTop = createLine(0, insetsTop, layoutWidth, insetsTop)
      container.insertBefore(lineTop, beforeElement)
    }

    if (insetsBottom > 0) {
      const lineBottom = createLine(0, bottom, layoutWidth, bottom)
      container.insertBefore(lineBottom, beforeElement)
    }

    if (insetsLeft > 0) {
      const lineLeft = createLine(insetsLeft, insetsTop, insetsLeft, bottom)
      container.insertBefore(lineLeft, beforeElement)
    }

    if (insetsRight > 0) {
      const lineRight = createLine(
        layoutWidth - insetsRight,
        insetsTop,
        layoutWidth - insetsRight,
        bottom
      )
      container.insertBefore(lineRight, beforeElement)
    }
  }

  updateInsets(
    container,
    layoutWidth,
    layoutHeight,
    insetsSum,
    labelInsetsColor,
    lineColor,
    colorChanged,
    labelInsetsColorChanged
  ) {
    const lineColorSvg = toSvgColorString(lineColor)
    let i = 1
    let bottom = layoutHeight
    const backgroundColor = toSvgColorString(labelInsetsColor)

    if (insetsSum.top > 0) {
      const rectTop = container.childNodes.item(i++)
      rectTop.setAttribute('width', layoutWidth.toString())
      if (labelInsetsColorChanged) {
        rectTop.setAttribute('fill', backgroundColor)
      }
    }

    if (insetsSum.bottom > 0) {
      const rectBottom = container.childNodes.item(i++)
      rectBottom.setAttribute('width', layoutWidth.toString())
      bottom = layoutHeight - insetsSum.bottom
      rectBottom.setAttribute('transform', `translate(0, ${bottom})`)
      if (labelInsetsColorChanged) {
        rectBottom.setAttribute('fill', backgroundColor)
      }
    }

    if (insetsSum.left > 0 && bottom - insetsSum.top > 0) {
      const rectLeft = container.childNodes.item(i++)
      rectLeft.setAttribute('height', (bottom - insetsSum.top).toString())
      rectLeft.setAttribute('transform', `translate(0, ${insetsSum.top})`)
      if (labelInsetsColorChanged) {
        rectLeft.setAttribute('fill', backgroundColor)
      }
    }

    if (insetsSum.right > 0 && bottom - insetsSum.top > 0) {
      const rectRight = container.childNodes.item(i++)
      rectRight.setAttribute('height', (bottom - insetsSum.top).toString())
      rectRight.setAttribute(
        'transform',
        `translate(${layoutWidth - insetsSum.right}, ${insetsSum.top})`
      )
      if (labelInsetsColorChanged) {
        rectRight.setAttribute('fill', backgroundColor)
      }
    }

    const updateLine = (line, x1, y1, x2, y2) => {
      line.setAttribute('x1', x1.toString())
      line.setAttribute('y1', y1.toString())
      line.setAttribute('x2', x2.toString())
      line.setAttribute('y2', y2.toString())
      if (colorChanged) {
        line.setAttribute('stroke', lineColorSvg)
      }
    }

    if (insetsSum.top > 0) {
      const lineTop = container.childNodes.item(i++)
      updateLine(lineTop, 0, insetsSum.top, layoutWidth, insetsSum.top)
    }

    if (insetsSum.bottom > 0) {
      const lineBottom = container.childNodes.item(i++)
      updateLine(lineBottom, 0, bottom, layoutWidth, bottom)
    }

    if (insetsSum.left > 0) {
      const lineLeft = container.childNodes.item(i++)
      updateLine(lineLeft, insetsSum.left, insetsSum.top, insetsSum.left, bottom)
    }

    if (insetsSum.right > 0) {
      const lineRight = container.childNodes.item(i)
      updateLine(
        lineRight,
        layoutWidth - insetsSum.right,
        insetsSum.top,
        layoutWidth - insetsSum.right,
        bottom
      )
    }
  }
}
