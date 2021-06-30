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
  Arrow,
  ArrowType,
  BaseClass,
  GeneralPath,
  IArrow,
  IEdgeStyle,
  List,
  PathBasedEdgeStyleRenderer,
  Point,
  SolidColorFill,
  Stroke,
  IEdge,
  Class,
  Fill,
  IEdgeStyleRenderer,
  Tangent
} from 'yfiles'

/**
 * An edge style that draws an edge in an orthogonal fashion.
 * All existing bends of the edge are ignored.
 */
export default class RoutingEdgeStyle extends BaseClass<IEdgeStyle>(IEdgeStyle) {
  private _inSegmentLength: number
  private _outSegmentLength: number
  private _middleSegmentOffset = 32
  private _smoothing = 10
  private _stroke: Stroke
  private _sourceArrow: IArrow
  private _targetArrow: IArrow

  /**
   * Creates a new instance of RoutingEdgeStyle.
   * @param outSegmentLength The length of the horizontal segment that connects to the source node.
   * @param inSegmentLength The length of the horizontal segment that connects to the target node.
   * @param fill The edge color.
   * @param thickness The line thickness.
   */
  constructor(
    outSegmentLength: number,
    inSegmentLength: number,
    fill: Fill | null = null,
    thickness = 1
  ) {
    super()
    this._inSegmentLength = inSegmentLength
    this._outSegmentLength = outSegmentLength
    const f = fill || new SolidColorFill(100, 100, 100)
    this._stroke = new Stroke(f, thickness || 2)
    this._sourceArrow = IArrow.NONE
    this._targetArrow = new Arrow({
      fill: f,
      type: ArrowType.TRIANGLE
    })
  }

  /**
   * Gets the length of the horizontal segment that connects to the source node.
   */
  get outSegmentLength(): number {
    return this._outSegmentLength
  }

  /**
   * Sets the length of the horizontal segment that connects to the source node.
   */
  set outSegmentLength(value: number) {
    this._outSegmentLength = value
  }

  /**
   * Gets the length of the horizontal segment that connects to the target node.
   */
  get inSegmentLength(): number {
    return this._inSegmentLength
  }

  /**
   * Sets the length of the horizontal segment that connects to the target node.
   */
  set inSegmentLength(value: number) {
    this._inSegmentLength = value
  }

  /**
   * Gets the distance on the y-axis between the source port and the horizontal middle segment.
   * This only has an effect when the source location is right of the target location.
   */
  get middleSegmentOffset(): number {
    return this._middleSegmentOffset
  }

  /**
   * Sets the distance on the y-axis between the source port and the horizontal middle segment.
   * This only has an effect when the source location is right of the target location.
   */
  set middleSegmentOffset(value: number) {
    this._middleSegmentOffset = value
  }

  /**
   * Gets the amount of corner rounding.
   */
  get smoothing(): number {
    return this._smoothing
  }

  /**
   * Sets the amount of corner rounding.
   */
  set smoothing(value: number) {
    this._smoothing = value
  }

  /**
   * Gets the source arrow.
   */
  get sourceArrow(): IArrow {
    return this._sourceArrow
  }

  /**
   * Sets the source arrow.
   */
  set sourceArrow(value: IArrow) {
    this._sourceArrow = value
  }

  /**
   * Gets the target arrow.
   */
  get targetArrow(): IArrow {
    return this._targetArrow
  }

  /**
   * Sets the target arrow.
   */
  set targetArrow(value: IArrow) {
    this._targetArrow = value
  }

  /**
   * Gets the stroke used to draw the edge.
   */
  get stroke(): Stroke {
    return this._stroke
  }

  /**
   * Sets the stroke used to draw the edge.
   */
  set stroke(value: Stroke) {
    this._stroke = value
  }

  get renderer(): IEdgeStyleRenderer {
    return new RoutingEdgeStyleRenderer()
  }

  clone(): this {
    return new RoutingEdgeStyle(
      this.outSegmentLength,
      this.inSegmentLength,
      this.stroke.fill,
      this.stroke.thickness
    ) as this
  }
}

/**
 * Renderer for {@link RoutingEdgeStyle}.
 */
class RoutingEdgeStyleRenderer extends PathBasedEdgeStyleRenderer<RoutingEdgeStyle> {
  constructor() {
    super(RoutingEdgeStyle.$class as Class<RoutingEdgeStyle>)
  }

  /**
   * Constructs the orthogonal edge path.
   * @see Overrides {@link PathBasedEdgeStyleRenderer#createPath}
   */
  createPath(): GeneralPath {
    // create a new GeneralPath with the edge points
    const generalPath = new GeneralPath()
    const points = this.getEdgePoints(this.edge)
    generalPath.moveTo(points.get(0))
    for (let i = 1; i < points.size; i++) {
      generalPath.lineTo(points.get(i))
    }
    return generalPath
  }

  /**
   * Calculates the points that define the edge path.
   * @return A list of points that define the edge path.
   */
  private getEdgePoints(edge: IEdge): List<Point> {
    const sourcePoint = edge.sourcePort!.location
    const targetPoint = edge.targetPort!.location
    const points = new List<Point>()
    points.add(sourcePoint)

    // the source location with the x-offset
    const sourceX = sourcePoint.x + this.style.outSegmentLength
    // the target location with the x-offset
    const targetX = targetPoint.x - this.style.inSegmentLength

    // check if source and target are not exactly in the same row - in this case we just draw a straight line
    if (sourceX > targetX) {
      // source is right of target
      // get the y-coordinate of the vertical middle segment
      const middleSegmentY =
        sourcePoint.y <= targetPoint.y
          ? sourcePoint.y + this.style.middleSegmentOffset
          : sourcePoint.y - this.style.middleSegmentOffset
      points.add(new Point(sourceX, sourcePoint.y))
      points.add(new Point(sourceX, middleSegmentY))
      points.add(new Point(targetX, middleSegmentY))
      points.add(new Point(targetX, targetPoint.y))
    } else {
      if (sourcePoint.y !== targetPoint.y) {
        // source is left of target
        points.add(new Point(sourceX, sourcePoint.y))
        points.add(new Point(sourceX, targetPoint.y))
      }
    }

    points.add(targetPoint)
    return points
  }

  /**
   * Gets the tangent on this path at the given ratio.
   */
  getTangent(ratio: number): Tangent | null {
    return this.getPath()!.getTangent(ratio)!
  }

  /**
   * Gets the tangent on this path instance at the segment and segment ratio.
   */
  getTangentForSegment(segmentIndex: number, ratio: number): Tangent | null {
    return this.getPath()!.getTangentForSegment(segmentIndex, ratio)!
  }

  /**
   * Gets the segment count which is the number of edge points -1.
   */
  getSegmentCount(): number {
    // the segment count is the number of edge points - 1
    const p = this.getEdgePoints(this.edge)
    return p.size - 1
  }

  /**
   * Gets the target arrow.
   */
  getTargetArrow(): IArrow {
    return this.style.targetArrow
  }

  /**
   * Gets the source arrow.
   */
  getSourceArrow(): IArrow {
    return this.style.sourceArrow
  }

  /**
   * Gets the pen used by style.
   */
  getStroke(): Stroke {
    return this.style.stroke
  }

  /**
   * Gets the smoothing length used by style.
   */
  getSmoothingLength(): number {
    return this.style.smoothing
  }

  /**
   * Returns an instance that implements the given type or null if no such instance is available.
   */
  lookup(type: Class): object | null {
    return super.lookup.call(this, type)
  }
}
