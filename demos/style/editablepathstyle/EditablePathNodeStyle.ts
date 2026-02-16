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
  type ClickEventArgs,
  Cursor,
  type Fill,
  type FillConvertible,
  GeneralPath,
  GeneralPathNodeStyle,
  type HandleInputMode,
  HandleType,
  type ICanvasContext,
  type ICompoundEdit,
  IEnumerable,
  type IGraph,
  IHandle,
  type IInputModeContext,
  IMementoSupport,
  INode,
  type INodeStyle,
  type InputModeEventArgs,
  IPoint,
  type IRenderContext,
  Matrix,
  NodeStyleBase,
  PathType,
  Point,
  type Rect,
  type Stroke,
  type StrokeConvertible,
  type Visual
} from '@yfiles/yfiles'

/**
 * Creates a {@link GeneralPath} that describes a octagonal shape.
 */
function createDefaultPath(): GeneralPath {
  const generalPath = new GeneralPath()
  generalPath.moveTo(0.3, 0)
  generalPath.lineTo(0.7, 0)
  generalPath.lineTo(1, 0.3)
  generalPath.lineTo(1, 0.7)
  generalPath.lineTo(0.7, 1)
  generalPath.lineTo(0.3, 1)
  generalPath.lineTo(0, 0.7)
  generalPath.lineTo(0, 0.3)
  generalPath.close()
  return generalPath
}

class EditablePathNodeStyleMementoSupport extends BaseClass(IMementoSupport) {
  applyState(subject: any, state: any): void {
    const style = subject as EditablePathNodeStyle
    style.path.clear()
    style.path.append(state.path, false)
    style.fill = state.fill
    style.stroke = state.stroke
  }

  getState(subject: any): any {
    const style = subject as EditablePathNodeStyle
    return { path: style.path.clone(), fill: style.fill, stroke: style.stroke }
  }

  stateEquals(state1: any, state2: any): boolean {
    return (
      state1.path.hasSameValue(state2.path) &&
      state1.fill === state2.fill &&
      state1.stroke === state2.stroke
    )
  }
}

export const EDITABLE_PATH_MEMENTO_SUPPORT: IMementoSupport =
  new EditablePathNodeStyleMementoSupport()

/**
 * A custom implementation of an {@link INodeStyle} that wraps a {@link GeneralPathNodeStyle} and
 * adds the option to change the {@link GeneralPath}.
 */
export class EditablePathNodeStyle extends NodeStyleBase {
  $path: GeneralPath
  private $pathStyle: GeneralPathNodeStyle

  constructor(options?: {
    path?: GeneralPath
    fill?: Fill | FillConvertible | null
    stroke?: Stroke | StrokeConvertible | null
  }) {
    super()
    if (options) {
      this.$path = options.path || createDefaultPath()
      this.$pathStyle = new GeneralPathNodeStyle({
        path: this.$path,
        fill: options.fill ?? null,
        stroke: options.stroke ?? null
      })
    } else {
      this.$path = createDefaultPath()
      this.$pathStyle = new GeneralPathNodeStyle({ path: this.$path })
    }
  }

  get fill(): Fill | null {
    return this.$pathStyle.fill
  }

  set fill(value: Fill | null) {
    this.$pathStyle.fill = value
  }

  get stroke(): Stroke | null {
    return this.$pathStyle.stroke
  }

  set stroke(value: Stroke | null) {
    this.$pathStyle.stroke = value
  }

  /**
   * Returns the path that describes the outline rendered in this {@link INodeStyle}.
   */
  get path(): GeneralPath {
    return this.$path
  }

  /**
   * Specifies the path that describes the outline rendered in this {@link INodeStyle}.
   */
  set path(value: GeneralPath) {
    this.$path = value
  }

  createVisual(renderContext: IRenderContext, node: INode): Visual | null {
    if (!this.$path.hasSameValue(this.$pathStyle.path)) {
      // the current path differs from the path in the wrapped style
      // -> configure a copy with the new path
      this.$pathStyle = this.$pathStyle.clone()
      this.$pathStyle.path = this.$path.clone()
    }
    return this.$pathStyle.renderer
      .getVisualCreator(node, this.$pathStyle)
      .createVisual(renderContext)
  }

  updateVisual(renderContext: IRenderContext, oldVisual: Visual, node: INode): Visual | null {
    if (this.$path.hasSameValue(this.$pathStyle.path)) {
      // the path didn't change -> update the old visual
      return this.$pathStyle.renderer
        .getVisualCreator(node, this.$pathStyle)
        .updateVisual(renderContext, oldVisual)
    } else {
      // create a new visual that renders the new path
      return this.createVisual(renderContext, node)
    }
  }

  /**
   * Gets the outline of the node that is the current path provided by the wrapped {@link GeneralPathNodeStyle}.
   * This allows for correct edge path intersection calculation, among others.
   */
  getOutline(node: INode): GeneralPath | null {
    return this.$pathStyle.renderer.getShapeGeometry(node, this.$pathStyle).getOutline()
  }

  /**
   * Get the bounding box of the node which is the smallest box that contains the complete current path.
   */
  getBounds(canvasContext: ICanvasContext, node: INode): Rect {
    return this.$pathStyle.renderer
      .getBoundsProvider(node, this.$pathStyle)
      .getBounds(canvasContext)
  }

  /**
   * Returns whether or not the rendered node is currently visible. Nodes outside of the viewport
   * do not need to be rendered.
   */
  isVisible(canvasContext: ICanvasContext, clip: Rect, node: INode): boolean {
    return this.$pathStyle.renderer
      .getVisibilityTestable(node, this.$pathStyle)
      .isVisible(canvasContext, clip)
  }

  /**
   * Returns whether or not the given point is inside of the current path considering the
   * {@link ICanvasContext.hitTestRadius}.
   */
  isHit(canvasContext: IInputModeContext, point: Point, node: INode): boolean {
    return this.$pathStyle.renderer
      .getHitTestable(node, this.$pathStyle)
      .isHit(canvasContext, point)
  }

  /**
   * Checks if a node is inside a certain box. Considers HitTestRadius.
   */
  isInBox(canvasContext: IInputModeContext, box: Rect, node: INode): boolean {
    return this.$pathStyle.renderer
      .getMarqueeTestable(node, this.$pathStyle)
      .isInBox(canvasContext, box)
  }

  /**
   * Returns whether or not the given point lies inside the node. This is important for
   * intersection calculation, among others.
   */
  isInside(node: INode, point: Point): boolean {
    return this.$pathStyle.renderer.getShapeGeometry(node, this.$pathStyle).isInside(point)
  }

  /**
   * Returns the intersection point of the line from inner to outer point with the nodes shape or
   * `null` if there is no intersection.
   */
  getIntersection(node: INode, inner: Point, outer: Point): Point | null {
    return this.$pathStyle.renderer
      .getShapeGeometry(node, this.$pathStyle)
      .getIntersection(inner, outer)
  }

  /**
   * Splits the outline path at the given point and inserts a segment and bend point.
   */
  splitPath(node: INode, point: Point): boolean {
    const { x, y } = normalize(point, node)
    const splitPoint = new Point(x, y)

    const stylePath = this.$path
    const newPath = new GeneralPath(stylePath.size + 2)
    const cursor = stylePath.createCursor()

    // checks if the split point lies on a path segment and then splits this segment
    function check(from: Point, to: Point): boolean {
      const intersection = splitPoint.getProjectionOnSegment(from, to)
      if (intersection.distanceTo(splitPoint) < 0.1) {
        newPath.append(stylePath, 0, cursor.index, false)
        newPath.lineTo(splitPoint)
        newPath.append(stylePath, cursor.index, stylePath.size, true)
        stylePath.clear()
        stylePath.append(newPath, false)
        return true
      } else {
        return false
      }
    }

    if (stylePath.pathContains(splitPoint, 0.1)) {
      const coords = [0, 0, 0, 0, 0, 0]
      let lastMove: Point = Point.ORIGIN
      let lastLocation: Point = Point.ORIGIN
      while (cursor.moveNext()) {
        const type = cursor.getCurrent(coords)

        switch (type) {
          case PathType.CLOSE:
            if (check(lastLocation, lastMove)) {
              return true
            }
            lastLocation = lastMove
            break
          case PathType.LINE_TO:
            if (check(lastLocation, (lastLocation = cursor.currentEndPoint))) {
              return true
            }
            break
          case PathType.CUBIC_TO:
            if (check(lastLocation, (lastLocation = cursor.currentEndPoint))) {
              return true
            }
            break
          case PathType.QUAD_TO:
            if (check(lastLocation, (lastLocation = cursor.currentEndPoint))) {
              return true
            }
            break
          case PathType.MOVE_TO:
            lastLocation = lastMove = cursor.currentEndPoint
            break
        }
      }
    }
    return false
  }

  clone(): this {
    const style = super.clone()
    style.$path = this.$path.clone()
    style.$pathStyle = this.$pathStyle.clone()
    return style
  }

  /**
   * Returns a set of handles consisting of a handle for each control point in the {@link GeneralPath}.
   */
  getHandles(node: INode): IEnumerable<IHandle> {
    const cursor = this.$path.createCursor()
    const handles: Array<IHandle> = []
    const coords = [0, 0, 0, 0, 0, 0]
    let index = 0
    while (cursor.moveNext()) {
      const type = cursor.getCurrent(coords)
      const handleType = HandleType.MOVE
      const innerHandleType = HandleType.MOVE2
      switch (type) {
        case PathType.CLOSE:
          break
        case PathType.LINE_TO:
          handles.push(new PathHandle(this, node, index++, coords[0], coords[1], handleType))
          break
        case PathType.CUBIC_TO:
          handles.push(new PathHandle(this, node, index++, coords[0], coords[1], innerHandleType))
          handles.push(new PathHandle(this, node, index++, coords[2], coords[3], innerHandleType))
          handles.push(new PathHandle(this, node, index++, coords[4], coords[5], handleType))
          break
        case PathType.QUAD_TO:
          handles.push(new PathHandle(this, node, index++, coords[0], coords[1], innerHandleType))
          handles.push(new PathHandle(this, node, index++, coords[2], coords[3], handleType))
          break
        case PathType.MOVE_TO:
          handles.push(new PathHandle(this, node, index++, coords[0], coords[1], handleType))
      }
    }
    return IEnumerable.from<IHandle>(handles)
  }

  /**
   * Normalizes the path and adjusts the size of the given node so that when the resulting path
   * extends beyond the node's layout it will be fully contained, again without changing the path
   * visibly.
   * @param node the node to adjust its size
   * @param graph the graph to use for setting the layout of the node
   */
  normalizePath(node: INode, graph: IGraph): void {
    const nodeBounds = this.renderer
      .getShapeGeometry(node, this)
      .getOutline()!
      .flatten(0.1)
      .getBounds()
    const pathBounds = this.path.flatten(0.01).getBounds()
    if (
      !pathBounds.isEmpty &&
      (Math.abs(pathBounds.width - 1) > 0.01 || Math.abs(pathBounds.height - 1) > 0.01)
    ) {
      this.path.transform(
        new Matrix(
          1 / pathBounds.width,
          0,
          0,
          1 / pathBounds.height,
          -pathBounds.x / pathBounds.width,
          -pathBounds.y / pathBounds.height
        )
      )
      graph.setNodeLayout(node, nodeBounds)
    }
  }
}

/**
 * A {@link IHandle} that allows for changing the path of a {@link EditablePathNodeStyle}.
 */
export class PathHandle extends BaseClass(IHandle, IPoint) {
  private readonly $type: HandleType
  private readonly $node: INode
  private readonly $index: number
  private $x: number
  private $y: number
  private $style: EditablePathNodeStyle
  private $origX = 0
  private $origY = 0
  private $copy: GeneralPath | null = null
  private edit: ICompoundEdit | null = null

  constructor(
    style: EditablePathNodeStyle,
    node: INode,
    index: number,
    x: number,
    y: number,
    type: HandleType
  ) {
    super()
    this.$x = x
    this.$y = y
    this.$type = type
    this.$node = node
    this.$style = style
    this.$index = index
  }

  /**
   * Removes the control point associated with this handle from the {@link EditablePathNodeStyle}s path.
   */
  removeSegment(): void {
    const path = this.$style.$path
    const copy = path.clone()
    path.clear()
    const cursor = copy.createCursor()

    const coords = [0, 0, 0, 0, 0, 0]
    let index = 0
    let hadMoveTo = false
    while (cursor.moveNext()) {
      const type = cursor.getCurrent(coords)
      switch (type) {
        case PathType.CLOSE:
          path.close()
          break
        case PathType.LINE_TO:
          if (index++ !== this.$index) {
            if (hadMoveTo) {
              path.lineTo(coords[0], coords[1])
            } else {
              path.moveTo(coords[0], coords[1])
            }
            hadMoveTo = true
          }
          break
        case PathType.CUBIC_TO:
          if (index++ === this.$index) {
            if (hadMoveTo) {
              path.quadTo(coords[2], coords[3], coords[4], coords[5])
            } else {
              path.moveTo(coords[2], coords[3])
              path.lineTo(coords[4], coords[5])
              hadMoveTo = true
            }
          } else if (index++ === this.$index) {
            if (hadMoveTo) {
              path.quadTo(coords[0], coords[1], coords[4], coords[5])
            } else {
              path.moveTo(coords[0], coords[1])
              path.lineTo(coords[4], coords[5])
              hadMoveTo = true
            }
          } else if (index++ === this.$index) {
            path.quadTo(coords[0], coords[1], coords[4], coords[5])
          } else {
            path.cubicTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5])
          }
          break
        case PathType.QUAD_TO:
          if (index++ === this.$index) {
            if (hadMoveTo) {
              path.lineTo(coords[2], coords[3])
            } else {
              path.moveTo(coords[2], coords[3])
              hadMoveTo = true
            }
          } else if (index++ === this.$index) {
            path.lineTo(coords[2], coords[3])
          } else {
            path.quadTo(coords[0], coords[1], coords[2], coords[3])
          }
          break
        case PathType.MOVE_TO:
          if (index++ !== this.$index) {
            path.moveTo(coords[0], coords[1])
            hadMoveTo = true
          }
      }
    }
  }

  /**
   * Updates the coordinates of the control point in the {@link EditablePathNodeStyle}s path associated
   * with this handle.
   */
  updateXY(): void {
    const path = this.$style.path
    const cursor = path.createCursor()
    const coords = [0, 0, 0, 0, 0, 0]
    let index = 0
    while (cursor.moveNext()) {
      const type = cursor.getCurrent(coords)
      switch (type) {
        case PathType.CLOSE:
          path.close()
          break
        case PathType.LINE_TO:
          if (index++ === this.$index) {
            this.$x = coords[0]
            this.$y = coords[1]
            return
          }
          break
        case PathType.CUBIC_TO:
          if (index++ === this.$index) {
            this.$x = coords[0]
            this.$y = coords[1]
            return
          } else if (index++ === this.$index) {
            this.$x = coords[2]
            this.$y = coords[3]
            return
          } else if (index++ === this.$index) {
            this.$x = coords[4]
            this.$y = coords[5]
            return
          }
          break
        case PathType.QUAD_TO:
          if (index++ === this.$index) {
            this.$x = coords[0]
            this.$y = coords[1]
            return
          } else if (index++ === this.$index) {
            this.$x = coords[2]
            this.$y = coords[3]
            return
          }
          break
        case PathType.MOVE_TO:
          if (index++ === this.$index) {
            this.$x = coords[0]
            this.$y = coords[1]
            return
          }
      }
    }
  }

  get x(): number {
    const { x, width } = this.$node.layout
    return this.$x * width + x
  }

  get y(): number {
    const { y, height } = this.$node.layout
    return this.$y * height + y
  }

  get type(): HandleType {
    return this.$type
  }

  get cursor(): Cursor {
    return Cursor.GRAB
  }

  get location(): IPoint {
    return this
  }

  get tag(): any {
    return null
  }

  initializeDrag(context: IInputModeContext): void {
    this.$copy = this.$style.$path.clone()
    this.$origX = this.$x
    this.$origY = this.$y

    // this might resize the node and change the paths so make sure that this gets recorded by the undo engine
    this.edit = context.graph!.beginEdit(
      'Change Path',
      'Change Path',
      [this.$node.style, this.$node],
      (item: INode | INodeStyle) =>
        item instanceof INode ? item.lookup(IMementoSupport) : EDITABLE_PATH_MEMENTO_SUPPORT
    )
  }

  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    const { x: newX, y: newY } = normalize(newLocation, this.$node)

    // create a copy of the path to be able to reset the path when the drag is canceled
    const path = this.$style.$path
    const copy = path.clone()
    path.clear()
    const cursor = copy.createCursor()

    // update the handle position and adjust the path
    const coords = [0, 0, 0, 0, 0, 0]
    let index = 0
    while (cursor.moveNext()) {
      const type = cursor.getCurrent(coords)
      switch (type) {
        case PathType.CLOSE:
          path.close()
          break
        case PathType.LINE_TO:
          if (index++ === this.$index) {
            path.lineTo((this.$x = newX), (this.$y = newY))
          } else {
            path.lineTo(coords[0], coords[1])
          }
          break
        case PathType.CUBIC_TO:
          if (index++ === this.$index) {
            path.cubicTo(
              (this.$x = newX),
              (this.$y = newY),
              coords[2],
              coords[3],
              coords[4],
              coords[5]
            )
          } else if (index++ === this.$index) {
            path.cubicTo(
              coords[0],
              coords[1],
              (this.$x = newX),
              (this.$y = newY),
              coords[4],
              coords[5]
            )
          } else if (index++ === this.$index) {
            path.cubicTo(
              coords[0],
              coords[1],
              coords[2],
              coords[3],
              (this.$x = newX),
              (this.$y = newY)
            )
          } else {
            path.cubicTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5])
          }
          break
        case PathType.QUAD_TO:
          if (index++ === this.$index) {
            path.quadTo((this.$x = newX), (this.$y = newY), coords[2], coords[3])
          } else if (index++ === this.$index) {
            path.quadTo(coords[0], coords[1], (this.$x = newX), (this.$y = newY))
          } else {
            path.quadTo(coords[0], coords[1], coords[2], coords[3])
          }
          break
        case PathType.MOVE_TO:
          if (index++ === this.$index) {
            path.moveTo((this.$x = newX), (this.$y = newY))
          } else {
            path.moveTo(coords[0], coords[1])
          }
      }
    }
  }

  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.$style.$path.clear()
    this.$x = this.$origX
    this.$y = this.$origY
    this.$style.$path.append(this.$copy!, false)

    this.edit!.cancel()
    this.edit = null
  }

  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.handleMove(context, originalLocation, newLocation)
    const finishHandler = (_evt: InputModeEventArgs, inputMode: HandleInputMode): void => {
      inputMode.removeEventListener('drag-finished', finishHandler)

      // adjust node layout and update the path with the final handle coordinates
      this.$style.normalizePath(this.$node, context.graph!)
      this.updateXY()
      updateHandles(this.$node, inputMode as HandleInputMode)

      this.edit!.commit()
      this.edit = null
    }
    ;(context.inputMode as HandleInputMode).addEventListener('drag-finished', finishHandler)
  }

  /**
   * This implementation does nothing special when clicked.
   */
  handleClick(evt: ClickEventArgs): void {}
}

/**
 * Normalizes the location to the node layout.
 */
function normalize(location: Point, node: INode): { x: number; y: number } {
  const { x, y, width, height } = node.layout
  const newX = (location.x - x) / width
  const newY = (location.y - y) / height
  return { x: newX, y: newY }
}

/**
 * Updates the handle positions to the current path.
 */
export function updateHandles(node: INode | null, handleInputMode: HandleInputMode): void {
  handleInputMode.handles.clear()
  if (node) {
    ;(node.style as EditablePathNodeStyle)
      .getHandles(node)
      .forEach((handle) => handleInputMode.handles.add(handle))
  }
}
