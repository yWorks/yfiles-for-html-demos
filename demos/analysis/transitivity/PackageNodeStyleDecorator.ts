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
import {
  GeneralPath,
  GraphComponent,
  ICanvasContext,
  IInputModeContext,
  IModelItem,
  INode,
  INodeStyle,
  IRenderContext,
  Matrix,
  NodeStyleBase,
  Point,
  Rect,
  ShapeNodeStyle,
  SolidColorFill,
  Stroke,
  SvgVisual,
  SvgVisualGroup,
  Visual
} from 'yfiles'

/**
 * Node style decorator that adds a package-icon to the visualization, handles the selection highlight
 * and adds buttons to the node when needed.
 */
export default class PackageNodeStyleDecorator extends NodeStyleBase {
  wrapped: INodeStyle
  selectionStyle: ShapeNodeStyle

  /**
   * Initializes a new instance of this class.
   * @param wrapped The optional wrapped style
   */
  constructor(wrapped: INodeStyle) {
    super()
    this.wrapped = wrapped || new ShapeNodeStyle()
    this.selectionStyle = wrapped instanceof ShapeNodeStyle ? wrapped.clone() : new ShapeNodeStyle()
    if (wrapped instanceof ShapeNodeStyle) {
      this.selectionStyle.shape = wrapped.shape
    }
    const selectionFill = new SolidColorFill('#FF6C00')
    this.selectionStyle.stroke = new Stroke(selectionFill)
    this.selectionStyle.fill = selectionFill
  }

  /**
   * Creates a visual that contains the visual of the wrapped style as well as the icon.
   * @param context The render context
   * @param node The node to which this style instance is assigned
   * @return The newly created visual
   */
  createVisual(context: IRenderContext, node: INode): SvgVisual {
    const svgNS = 'http://www.w3.org/2000/svg'

    // add both to a group
    const group = new SvgVisualGroup()

    const selected = getCurrentItem(context) === node

    // add the wrapped visual first
    let wrappedVisual
    if (selected) {
      wrappedVisual = this.selectionStyle.renderer
        .getVisualCreator(node, this.selectionStyle)
        .createVisual(context)
    } else {
      wrappedVisual = this.wrapped.renderer
        .getVisualCreator(node, this.wrapped)
        .createVisual(context)
    }
    group.add(wrappedVisual as SvgVisual)

    // add a package icon
    const height2 = node.layout.height * 0.5
    const width = node.layout.width
    const x = node.layout.x
    const y = node.layout.y
    const plusX = x - 9
    const plusY = y + height2 - 9

    const packageContainer = window.document.createElementNS(svgNS, 'g')
    const packageImage = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
    packageImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/package.svg')
    packageImage.setAttribute('width', '24')
    packageImage.setAttribute('height', '24')
    packageImage.setAttribute('transform', `translate(${x + 10} ${y + 3})`)
    packageContainer.appendChild(packageImage)
    group.add(new SvgVisual(packageContainer))

    // add a circle with a plus symbol the node has more dependencies
    if (node.tag && node.tag.pendingDependencies) {
      const plusImageContainer = window.document.createElementNS(svgNS, 'g')
      createPlusImage(plusX + width, plusY, plusImageContainer)
      group.add(new SvgVisual(plusImageContainer))
    }

    const pendingDependencies = node.tag && node.tag.pendingDependencies
    setRenderDataCache(
      group,
      PackageNodeStyleDecorator.createRenderDataCache(selected, pendingDependencies)
    )

    return group
  }

  /**
   * Updates the given visual.
   * @param node The node to which this style instance is assigned
   * @param context The render context
   * @param oldVisual The existing visual
   * @return The updated visual
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisualGroup, node: INode): SvgVisual {
    const selected = getCurrentItem(context) === node
    const pendingDependencies = node.tag && node.tag.pendingDependencies

    const newCache = PackageNodeStyleDecorator.createRenderDataCache(selected, pendingDependencies)
    const oldCache = getRenderDataCache(oldVisual)
    if (!newCache.equals(oldCache)) {
      return this.createVisual(context, node)
    }

    // update the wrapped visual and replace it with the updated version
    let wrappedVisual: Visual | null = oldVisual.children.get(0)
    if (newCache.selected) {
      wrappedVisual = this.selectionStyle.renderer
        .getVisualCreator(node, this.selectionStyle)
        .updateVisual(context, wrappedVisual)
    } else {
      wrappedVisual = this.wrapped.renderer
        .getVisualCreator(node, this.wrapped)
        .updateVisual(context, wrappedVisual)
    }
    if (wrappedVisual !== oldVisual.children.get(0)) {
      oldVisual.children.set(0, wrappedVisual as SvgVisual)
    }

    // the icon stays the same but its location needs to be updated
    const height2 = node.layout.height * 0.5
    const width = node.layout.width
    const x = node.layout.x
    const y = node.layout.y
    const plusX = x - 9
    const plusY = y + height2 - 9

    if (oldVisual.children.size > 1) {
      const g = oldVisual.children.get(1).svgElement
      // move the image to the correct location
      g.firstElementChild!.setAttribute('transform', `translate(${x + 10} ${y + 3})`)
    }

    const hasDependencies = oldCache && oldCache.pendingDependencies
    if (oldVisual.children.size > 2) {
      // add a circle with a plus symbol the node has more dependencies
      const g1 = oldVisual.children.get(2).svgElement
      if (!oldCache!.pendingDependencies && newCache.pendingDependencies) {
        createPlusImage(plusX + width, plusY, g1)
      } else if (oldCache!.pendingDependencies && !newCache.pendingDependencies) {
        while (g1.firstChild) {
          g1.removeChild(g1.firstChild)
        }
      } else if (oldVisual.children.size === 3) {
        // in this case we have only to move the image to the correct location but we have first to determine whether
        // in this container the plus symbol refers to dependencies
        const g = oldVisual.children.get(2).svgElement
        const xCoord = hasDependencies ? plusX + width : plusX
        g.firstElementChild!.setAttribute('transform', `translate(${xCoord} ${plusY})`)
      }
    }

    setRenderDataCache(oldVisual, newCache)
    return oldVisual
  }

  /**
   * Returns the enlarged area of the node if the node has the circles for more dependencies.
   * @param node The given node
   * @return The enlarged area
   */
  static getEnlargedOutline(node: INode): GeneralPath {
    const enlargedOutline = new GeneralPath()

    const layout = node.layout
    const upperLeftX = layout.x - 7
    const upperY = layout.y - 4
    const upperRightX = layout.x + layout.width
    const lowerY = layout.y + (layout.height - 2)
    const middleY = layout.y + (layout.height * 0.5 - 3)
    const xOffset = 7
    const yOffset = 8

    enlargedOutline.moveTo(upperLeftX, upperY)
    enlargedOutline.lineTo(upperRightX, upperY)

    if (node.tag && node.tag.pendingDependencies) {
      enlargedOutline.lineTo(upperRightX, middleY - yOffset)
      enlargedOutline.lineTo(upperRightX + xOffset, middleY - yOffset)
      enlargedOutline.lineTo(upperRightX + xOffset, middleY + yOffset)
      enlargedOutline.lineTo(upperRightX, middleY + yOffset)
    }
    enlargedOutline.lineTo(upperRightX, lowerY)
    enlargedOutline.lineTo(upperLeftX, lowerY)

    enlargedOutline.close()
    return enlargedOutline
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * @param canvasContext The canvas context
   * @param p The point to test
   * @param node The node to which this style instance is assigned
   * @return True if the node has been hit, false otherwise
   */
  isHit(canvasContext: IInputModeContext, p: Point, node: INode): boolean {
    if (node.tag && node.tag.pendingDependencies) {
      let boundingBox: Rect = PackageNodeStyleDecorator.getEnlargedOutline(node).getBounds()

      if (node.tag.highlight) {
        const transform = new Matrix()
        const itemCenterX = boundingBox.x + boundingBox.width * 0.5
        const itemCenterY = boundingBox.y + boundingBox.height * 0.5
        transform.translate(new Point(itemCenterX, itemCenterY))

        const zoom = canvasContext.canvasComponent!.zoom
        if (zoom < 1) {
          // if the zoom level is below 1, reverse the zoom for this node before enlarging it
          transform.scale(1 / zoom, 1 / zoom)
        }
        transform.scale(1.2, 1.2)
        transform.translate(new Point(-itemCenterX, -itemCenterY))
        boundingBox = boundingBox.getTransformed(transform)
      }
      return boundingBox.contains(p)
    }
    return this.wrapped.renderer.getHitTestable(node, this.wrapped).isHit(canvasContext, p)
  }

  /**
   * Gets the intersection of a line with the visual representation of the node.
   * @param node The node to which this style instance is assigned
   * @param inner The coordinates of a point lying inside the shape
   * @param outer The coordinates of a point lying outside the shape
   * @return The intersection point
   */
  getIntersection(node: INode, inner: Point, outer: Point): Point | null {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getShapeGeometry(node, this.wrapped).getIntersection(inner, outer)
  }

  /**
   * Determines whether the provided point is geometrically inside the visual bounds of the node.
   * @param node The node to which this style instance is assigned
   * @param point The point to test
   * @return True if the provided point is geometrically inside the visual bounds of the
   *   node, false otherwise
   */
  isInside(node: INode, point: Point): boolean {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getShapeGeometry(node, this.wrapped).isInside(point)
  }

  /**
   * Gets the outline of the visual style.
   * @param node The node to which this style instance is assigned
   * @return The outline of the visual style
   */
  getOutline(node: INode): GeneralPath | null {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getShapeGeometry(node, this.wrapped).getOutline()
  }

  /**
   * Gets the bounds of the visual for the node in the given context.
   * @param canvasContext The canvas context
   * @param node The node to which this style instance is assigned
   * @return The bounds of the visual
   */
  getBounds(canvasContext: ICanvasContext, node: INode): Rect {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getBoundsProvider(node, this.wrapped).getBounds(canvasContext)
  }

  /**
   * Determines whether the visualization for the specified node is visible in the context.
   * @param canvasContext The canvas context
   * @param clip The clipping rectangle
   * @param node The node to which this style instance is assigned
   * @return True if the visualization for this node is visible, false otherwise
   */
  isVisible(canvasContext: ICanvasContext, clip: Rect, node: INode): boolean {
    // first check if the wrapped style is visible
    if (
      this.wrapped.renderer.getVisibilityTestable(node, this.wrapped).isVisible(canvasContext, clip)
    ) {
      return true
    }
    // if not, check for labels connection lines
    clip = clip.getEnlarged(10)
    for (let i = 0; i < node.labels.size; i++) {
      const label = node.labels.get(i)
      if (clip.intersectsLine(node.layout.center, label.layout.orientedRectangleCenter)) {
        return true
      }
    }
    return false
  }

  /**
   * Determines whether the visualization for the specified node is included in the marquee
   * selection.
   * @param context The input mode context
   * @param box The marquee selection box
   * @param node The node to which this style instance is assigned
   * @return if True the visualization is included in the marquee selection, false
   *   otherwise
   */
  isInBox(context: IInputModeContext, box: Rect, node: INode): boolean {
    // delegate this to the wrapped style
    return this.wrapped.renderer.getMarqueeTestable(node, this.wrapped).isInBox(context, box)
  }

  /**
   * Creates the render data cache object.
   * @param selected True if the given node is selected, false otherwise
   * @param pendingDependencies The pending pendingDependencies of the given node
   * @return The render data cache object
   */
  static createRenderDataCache(
    selected: boolean,
    pendingDependencies: boolean
  ): NodeRenderDataCache {
    return new NodeRenderDataCache(selected, pendingDependencies)
  }
}

class NodeRenderDataCache {
  constructor(public selected: boolean, public pendingDependencies: boolean) {}

  equals(other?: NodeRenderDataCache): boolean {
    return (
      !!other &&
      this.selected === other.selected &&
      this.pendingDependencies === other.pendingDependencies
    )
  }
}

/**
 * Creates the circle for describing that there exist more dependencies.
 * @param x The start x-coordinate for the circle
 * @param y The start y-coordinate for the circle
 * @param container The svg container
 */
function createPlusImage(x: number, y: number, container: SVGElement): void {
  const plusImage = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
  plusImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/plus.svg')
  plusImage.setAttribute('width', '18')
  plusImage.setAttribute('height', '18')
  plusImage.setAttribute('transform', `translate(${x} ${y})`)
  container.appendChild(plusImage)
}

function getCurrentItem(context: IRenderContext): IModelItem | null {
  return (context.canvasComponent! as GraphComponent).currentItem
}

function getRenderDataCache(
  cacheOwner: SvgVisualGroup & {
    'data-renderDataCache'?: NodeRenderDataCache
  }
): NodeRenderDataCache | undefined {
  return cacheOwner['data-renderDataCache']
}

function setRenderDataCache(
  cacheOwner: SvgVisualGroup & {
    'data-renderDataCache'?: NodeRenderDataCache
  },
  cache: NodeRenderDataCache
): void {
  cacheOwner['data-renderDataCache'] = cache
}
