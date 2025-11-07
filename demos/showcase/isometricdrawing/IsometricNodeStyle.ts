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
  Color,
  type INode,
  type IRectangle,
  type IRenderContext,
  type Matrix,
  NodeStyleBase,
  Point,
  type Rect,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'

// Indices for the corners of the bounding box.
const LOW_TOP_LEFT_X = 0
const LOW_TOP_LEFT_Y = 1
const LOW_TOP_RIGHT_X = 2
const LOW_TOP_RIGHT_Y = 3
const LOW_BOTTOM_RIGHT_X = 4
const LOW_BOTTOM_RIGHT_Y = 5
const LOW_BOTTOM_LEFT_X = 6
const LOW_BOTTOM_LEFT_Y = 7
const UP_TOP_LEFT_X = 8
const UP_TOP_LEFT_Y = 9
const UP_TOP_RIGHT_X = 10
const UP_TOP_RIGHT_Y = 11
const UP_BOTTOM_RIGHT_X = 12
const UP_BOTTOM_RIGHT_Y = 13
const UP_BOTTOM_LEFT_X = 14
const UP_BOTTOM_LEFT_Y = 15

type MyColor = { r: number; g: number; b: number; a: number }
type MyVisual = TaggedSvgVisual<SVGGElement, RenderDataCache>

/**
 * A node style that visualizes the node as block in an isometric fashion.
 */
export class IsometricNodeStyle extends NodeStyleBase<MyVisual> {
  /**
   * Creates the visual representation for the given node.
   */
  protected createVisual(context: IRenderContext, node: INode): MyVisual {
    const color = node.tag.color as MyColor
    const cache = new RenderDataCache(
      node.layout.toRect(),
      node.tag.height || 0,
      IsometricNodeStyle.calculateHeightVector(context.projection),
      color
    )

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    updateVisualization(g, cache)
    setColors(context, g, color)
    return SvgVisual.from(g, cache)
  }

  /**
   * Updates the visual representation for the given node.
   */
  protected updateVisual(
    context: IRenderContext,
    oldVisual: MyVisual,
    node: INode
  ): MyVisual | null {
    const oldCache = oldVisual.tag

    const color = node.tag.color as MyColor
    const newCache = new RenderDataCache(
      node.layout.toRect(),
      node.tag.height || 0,
      IsometricNodeStyle.calculateHeightVector(context.projection),
      color
    )

    const g = oldVisual.svgElement
    const oldChildCount = g.childNodes.length
    if (!oldCache.equalGeometries(newCache)) {
      updateVisualization(g, newCache)
    }
    if (oldChildCount != g.childNodes.length || !oldCache.equalColors(newCache)) {
      setColors(context, g, color)
    }

    oldVisual.tag = newCache
    return oldVisual
  }

  /**
   * Calculates a vector in world coordinates whose transformation by the projection results
   * in the vector (0, -1).
   * @param projection The projection to consider.
   * @returns The vector in world coordinates that gets transformed to the vector (0, -1).
   */
  static calculateHeightVector(projection: Matrix): Point {
    const matrix = projection.clone()
    matrix.invert()
    return matrix.transform(new Point(0, -1))
  }
}

/**
 * Stores the geometry data necessary to update the visual representation of a node.
 */
class RenderDataCache {
    readonly color: MyColor;
    readonly upVector: Point;
    readonly height: number;
    readonly layout: Rect;

  constructor(
    layout: Rect,
    height: number,
    upVector: Point,
    color: MyColor
  ) {
      this.layout = layout;
      this.height = height;
      this.upVector = upVector;
      this.color = color;}

  equalGeometries(other: RenderDataCache): boolean {
    const height = this.height
    return (
      equalRectangles(this.layout, other.layout) &&
      height == other.height &&
      (height == 0 || equalPoints(this.upVector, other.upVector))
    )
  }

  equalColors(other: RenderDataCache): boolean {
    const c1 = this.color
    const c2 = other.color
    return c1.r == c2.r && c1.g == c2.g && c1.b == c2.b && c1.a == c2.a
  }
}

function equalRectangles(r1: IRectangle, r2: IRectangle): boolean {
  return r1.x == r2.x && r1.y == r2.y && r1.width == r2.width && r1.height == r2.height
}

function equalPoints(p1: Point, p2: Point): boolean {
  return p1.x == p2.x && p1.y == p2.y
}

function updateVisualization(container: SVGGElement, cache: RenderDataCache): void {
  const height = cache.height
  if (height > 0) {
    ensurePathChildren(container, 3)

    const up = cache.upVector
    const corners = calculateCorners(up, cache.layout, height)
    const leftFacePath = up.x > 0 ? newLeftFacePath(corners) : newRightFacePath(corners)
    const rightFacePath = up.y > 0 ? newBackFacePath(corners) : newFrontFacePath(corners)

    setPathDefinition(container.childNodes.item(0), leftFacePath)
    setPathDefinition(container.childNodes.item(1), rightFacePath)
    setPathDefinition(container.childNodes.item(2), newTopFacePath(corners))
  } else {
    ensurePathChildren(container, 1)

    setPathDefinition(container.childNodes.item(0), newRectanglePath(cache.layout))
  }
}

function ensurePathChildren(container: SVGGElement, n: number): void {
  while (container.childNodes.length > n) {
    container.removeChild(container.lastChild!)
  }
  for (let i = container.childNodes.length; i < n; ++i) {
    container.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
  }
}

function setPathDefinition(path: Node, definition: string): void {
  ;(path as Element).setAttribute('d', definition)
}

function calculateCorners(upVector: Point, layout: Rect, height: number): number[] {
  const heightVector = new Point(height * upVector.x, height * upVector.y)

  const x = layout.x
  const y = layout.y
  const width = layout.width
  const depth = layout.height

  const corners: number[] = []
  corners[LOW_TOP_LEFT_X] = x
  corners[LOW_TOP_LEFT_Y] = y

  corners[LOW_TOP_RIGHT_X] = x + width
  corners[LOW_TOP_RIGHT_Y] = y

  corners[LOW_BOTTOM_RIGHT_X] = x + width
  corners[LOW_BOTTOM_RIGHT_Y] = y + depth

  corners[LOW_BOTTOM_LEFT_X] = x
  corners[LOW_BOTTOM_LEFT_Y] = y + depth

  for (let i = 0; i < 8; i += 2) {
    corners[i + 8] = corners[i] + heightVector.x
    corners[i + 9] = corners[i + 1] + heightVector.y
  }
  return corners
}

/**
 * Creates a path definition that describes the face on the top of the block.
 * @param corners The coordinates of the corners of the block.
 */
function newTopFacePath(corners: number[]): string {
  return (
    `M${corners[UP_TOP_LEFT_X]} ${corners[UP_TOP_LEFT_Y]} ` +
    `L${corners[UP_TOP_RIGHT_X]} ${corners[UP_TOP_RIGHT_Y]} ` +
    `L${corners[UP_BOTTOM_RIGHT_X]} ${corners[UP_BOTTOM_RIGHT_Y]} ` +
    `L${corners[UP_BOTTOM_LEFT_X]} ${corners[UP_BOTTOM_LEFT_Y]} ` +
    'Z'
  )
}

/**
 * Creates a path definition that describes the face on the left side of the block.
 * @param corners The coordinates of the corners of the block.
 */
function newLeftFacePath(corners: number[]): string {
  return (
    `M${corners[LOW_TOP_LEFT_X]} ${corners[LOW_TOP_LEFT_Y]} ` +
    `L${corners[UP_TOP_LEFT_X]} ${corners[UP_TOP_LEFT_Y]} ` +
    `L${corners[UP_BOTTOM_LEFT_X]} ${corners[UP_BOTTOM_LEFT_Y]} ` +
    `L${corners[LOW_BOTTOM_LEFT_X]} ${corners[LOW_BOTTOM_LEFT_Y]} ` +
    'Z'
  )
}

/**
 * Creates a path definition that describes the face on the right side of the block.
 * @param corners The coordinates of the corners of the block.
 */
function newRightFacePath(corners: number[]): string {
  return (
    `M${corners[LOW_TOP_RIGHT_X]} ${corners[LOW_TOP_RIGHT_Y]} ` +
    `L${corners[UP_TOP_RIGHT_X]} ${corners[UP_TOP_RIGHT_Y]} ` +
    `L${corners[UP_BOTTOM_RIGHT_X]} ${corners[UP_BOTTOM_RIGHT_Y]} ` +
    `L${corners[LOW_BOTTOM_RIGHT_X]} ${corners[LOW_BOTTOM_RIGHT_Y]} ` +
    'Z'
  )
}

/**
 * Creates a path definition that describes the face on the front side of the block.
 * @param corners The coordinates of the corners of the block.
 */
function newFrontFacePath(corners: number[]): string {
  return (
    `M${corners[LOW_BOTTOM_LEFT_X]} ${corners[LOW_BOTTOM_LEFT_Y]} ` +
    `L${corners[UP_BOTTOM_LEFT_X]} ${corners[UP_BOTTOM_LEFT_Y]} ` +
    `L${corners[UP_BOTTOM_RIGHT_X]} ${corners[UP_BOTTOM_RIGHT_Y]} ` +
    `L${corners[LOW_BOTTOM_RIGHT_X]} ${corners[LOW_BOTTOM_RIGHT_Y]} ` +
    'Z'
  )
}

/**
 * Creates a path definition that describes the face on the back side of the block.
 * @param corners The coordinates of the corners of the block.
 */
function newBackFacePath(corners: number[]): string {
  return (
    `M${corners[LOW_TOP_LEFT_X]} ${corners[LOW_TOP_LEFT_Y]} ` +
    `L${corners[UP_TOP_LEFT_X]} ${corners[UP_TOP_LEFT_Y]} ` +
    `L${corners[UP_TOP_RIGHT_X]} ${corners[UP_TOP_RIGHT_Y]} ` +
    `L${corners[LOW_TOP_RIGHT_X]} ${corners[LOW_TOP_RIGHT_Y]} ` +
    'Z'
  )
}

/**
 * Creates a path definition that describes the given rectangle.
 */
function newRectanglePath(layout: Rect): string {
  return (
    `M${layout.x} ${layout.y} ` +
    `L${layout.x + layout.width} ${layout.y} ` +
    `L${layout.x + layout.width} ${layout.y + layout.height} ` +
    `L${layout.x} ${layout.y + layout.height} ` +
    `Z`
  )
}

function setColors(context: IRenderContext, g: SVGGElement, baseColor: MyColor): void {
  if (g.childNodes.length > 1) {
    const leftColor = darker(baseColor)
    const rightColor = darker(leftColor)

    setColor(context, g.childNodes.item(0), leftColor)
    setColor(context, g.childNodes.item(1), rightColor)
    setColor(context, g.childNodes.item(2), baseColor)
  } else {
    setColor(context, g.childNodes.item(0), baseColor)
  }
}

function darker(color: MyColor): MyColor {
  return { r: (color.r * 0.8) | 0, g: (color.g * 0.8) | 0, b: (color.b * 0.8) | 0, a: color.a }
}

function setColor(context: IRenderContext, node: Node, color: MyColor): void {
  getNewColor(color).applyTo(node as SVGElement, context)
}

function getNewColor(color: MyColor): Color {
  return new Color(color.r, color.g, color.b, color.a)
}
