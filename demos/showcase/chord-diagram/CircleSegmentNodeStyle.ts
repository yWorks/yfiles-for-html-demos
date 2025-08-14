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
  ICanvasContext,
  IInputModeContext,
  INode,
  IRenderContext,
  NodeStyleBase,
  Point,
  Rect,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'
import { ChordDiagramLayout } from './ChordDiagramLayout'

const SVG_NS = 'http://www.w3.org/2000/svg'
const FULL_CIRCLE = 2 * Math.PI
const SEMI_CIRCLE = Math.PI
const QUARTER_CIRCLE = Math.PI * 0.5
const STROKE_WIDTH = 2

type CircleSegmentNodeStyleVisual = TaggedSvgVisual<SVGGElement, NodeRenderDataCache>

/**
 * Visualizes nodes as arc segments for a fixed center point.
 * This implementation uses ...
 * ... the node's width as the angle (in radians) of the arc segment that visualizes the node and
 * ... the node's height as the thickness of said arc segment.
 */
export class CircleSegmentNodeStyle extends NodeStyleBase<CircleSegmentNodeStyleVisual> {
  /**
   * Determines whether or not additional information is shown.
   */
  set showStyleHints(value: boolean) {
    if (value != this._showStyleHints) {
      this._showStyleHints = value
    }
  }

  private _showStyleHints = false

  /**
   * Creates the actual SVG element inside the provided container
   */
  private render(node: INode, container: SVGGElement, cache: NodeRenderDataCache): void {
    const data = cache.nodeData

    // the node itself is displayed by an svg arc segment
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute(
      'd',
      describeArc(
        data.circleCenter,
        data.nodeDist + node.layout.height / 2 - STROKE_WIDTH,
        data.startAngle,
        data.endAngle
      )
    )
    path.setAttribute('stroke', node.tag.color)
    path.setAttribute('opacity', '0')
    path.setAttribute('stroke-width', `${node.layout.height}px`)
    path.setAttribute('fill', 'none')
    container.appendChild(path)

    // a second arc segment is used for drawing the outline
    const outline = document.createElementNS(SVG_NS, 'path')
    outline.setAttribute(
      'd',
      describeArc(
        data.circleCenter,
        data.nodeDist + node.layout.height - STROKE_WIDTH,
        data.startAngle,
        data.endAngle
      )
    )
    outline.setAttribute('stroke', 'black')
    outline.setAttribute('stroke-width', String(STROKE_WIDTH))
    outline.setAttribute('fill', 'none')

    container.appendChild(outline)

    // edge outline sides
    const line0Start = polarToCartesian(
      data.circleCenter,
      data.nodeDist - STROKE_WIDTH,
      data.startAngle
    )
    const line0End = polarToCartesian(
      data.circleCenter,
      data.nodeDist + node.layout.height - STROKE_WIDTH / 2,
      data.startAngle
    )
    const line0 = document.createElementNS(SVG_NS, 'line')
    line0.setAttribute('x1', String(line0Start.x))
    line0.setAttribute('y1', String(line0Start.y))
    line0.setAttribute('x2', String(line0End.x))
    line0.setAttribute('y2', String(line0End.y))
    line0.setAttribute('stroke', 'black')
    line0.setAttribute('stroke-width', String(STROKE_WIDTH))
    container.appendChild(line0)

    const line1Start = polarToCartesian(
      data.circleCenter,
      data.nodeDist - STROKE_WIDTH,
      data.endAngle
    )
    const line1End = polarToCartesian(
      data.circleCenter,
      data.nodeDist + node.layout.height - STROKE_WIDTH / 2,
      data.endAngle
    )
    const line1 = document.createElementNS(SVG_NS, 'line')
    line1.setAttribute('x1', String(line1Start.x))
    line1.setAttribute('y1', String(line1Start.y))
    line1.setAttribute('x2', String(line1End.x))
    line1.setAttribute('y2', String(line1End.y))
    line1.setAttribute('stroke', 'black')
    line1.setAttribute('stroke-width', String(STROKE_WIDTH))
    container.appendChild(line1)

    // displays information about what information the ChordDiagramLayout provided
    if (this._showStyleHints) {
      const er = ((data.endAngle - data.startAngle) * data.nodeDist) / 2
      const ellipse = document.createElementNS(SVG_NS, 'ellipse')
      ellipse.setAttribute('cx', `${data.nodeCenter.x}`)
      ellipse.setAttribute('cy', `${data.nodeCenter.y}`)
      ellipse.setAttribute('rx', `${er}`)
      ellipse.setAttribute('ry', `${er}`)
      ellipse.setAttribute('stroke', 'black')
      ellipse.setAttribute('fill', 'none')
      ellipse.setAttribute('stroke-width', '3px')
      container.appendChild(ellipse)
      path.setAttribute('opacity', '0.1')
      outline.setAttribute('opacity', '0.1')
      line0.setAttribute('opacity', '0.1')
      line1.setAttribute('opacity', '0.1')
    } else {
      path.setAttribute('opacity', '1')
      outline.setAttribute('opacity', '1')
      line0.setAttribute('opacity', '1')
      line1.setAttribute('opacity', '1')
    }
  }
  /**
   * Creates the visualization of a node in a chord diagram.
   */
  createVisual(context: IRenderContext, node: INode): CircleSegmentNodeStyleVisual {
    // creates a 'g' element and use it as a container for the rendering of the node.
    const g = document.createElementNS(SVG_NS, 'g')
    // Get the necessary data for rendering of the node
    const cache = new NodeRenderDataCache(circleData(node), this._showStyleHints)
    // Render the node
    this.render(node, g, cache)
    // store information with the visual on how we created it
    return SvgVisual.from(g, cache)
  }

  /**
   * Check wether the Visual has to be recreated, which isn't the case unless the defining
   * characteristics of the node have changed
   */
  protected updateVisual(
    context: IRenderContext,
    oldVisual: CircleSegmentNodeStyleVisual,
    node: INode
  ): CircleSegmentNodeStyleVisual {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldData = oldVisual.tag
    // get the data for the new visual
    const newData = new NodeRenderDataCache(circleData(node), this._showStyleHints)
    if (!newData.equals(oldData)) {
      return this.createVisual(context, node)
    } else {
      return oldVisual
    }
  }

  /**
   * Determines if the given location lies on the visualization of a node in a chord diagram.
   */
  isHit(context: IInputModeContext, location: Point, node: INode): boolean {
    if (!node.tag) {
      return false
    }

    const { nodeCenter, nodeRadiusY, circleCenter, startAngle, endAngle, nodeDist } =
      circleData(node)

    // check whether the given point lies inside the node's height
    const locationDist = location.distanceTo(circleCenter)
    const inRing = nodeDist <= locationDist && locationDist <= nodeDist + 2 * nodeRadiusY

    // check whether the given point lies inside the node's width
    const locationAngle = calculateAngle(location, circleCenter)
    const isSegmentHit =
      startAngle > endAngle
        ? startAngle <= locationAngle || locationAngle <= endAngle
        : startAngle <= locationAngle && locationAngle <= endAngle

    return inRing && isSegmentHit
  }

  /**
   * Calculates the bounding box of the visualization of the given node.
   * @param context the context for the bounds calculation.
   * @param node the node whose bounding box is calculated.
   */
  protected getBounds(context: ICanvasContext, node: INode): Rect {
    const { nodeCenter, nodeRadiusY, circleCenter, startAngle, endAngle, nodeDist } =
      circleData(node)

    // handle the start and end points of the upper and lower arc segments
    const corner1 = polarToCartesian(circleCenter, nodeDist + nodeRadiusY, endAngle)
    const corner2 = polarToCartesian(circleCenter, nodeDist - nodeRadiusY, endAngle)
    const corner3 = polarToCartesian(circleCenter, nodeDist + nodeRadiusY, startAngle)
    const corner4 = polarToCartesian(circleCenter, nodeDist - nodeRadiusY, startAngle)
    let minX = Math.min(corner1.x, corner2.x, corner3.x, corner4.x)
    let maxX = Math.max(corner1.x, corner2.x, corner3.x, corner4.x)
    let minY = Math.min(corner1.y, corner2.y, corner3.y, corner4.y)
    let maxY = Math.max(corner1.y, corner2.y, corner3.y, corner4.y)

    // handle the intersection points of the outer arc segment with the coordinate axis
    const lb = startAngle
    const ub = startAngle > endAngle ? endAngle + FULL_CIRCLE : endAngle
    for (let i = 1, n = startAngle > endAngle ? 9 : 5; i < n; ++i) {
      const angle = QUARTER_CIRCLE * i
      if (lb < angle && angle < ub) {
        const sign = i % 4 > 1 ? -1 : 1
        const dist = sign * (nodeDist + nodeRadiusY)
        const point = i % 2 == 0 ? new Point(dist, 0) : new Point(0, dist)
        minX = Math.min(minX, point.x)
        maxX = Math.max(maxX, point.x)
        minY = Math.min(minY, point.y)
        maxY = Math.max(maxY, point.y)
      }
    }

    return new Rect(minX, minY, maxX - minX, maxY - minY)
  }

  /**
   * Determines if the visualization of the given node is visible in the given viewport.
   * @param context the context for the visibility check.
   * @param rectangle the viewport to check
   * @param node the node to check
   */
  protected isVisible(context: ICanvasContext, rectangle: Rect, node: INode): boolean {
    return rectangle.intersects(this.getBounds(context, node))
  }
}

/**
 * Returns the angle in radians between the given point and the circle implicit start point.
 * @param pointOnCircle the point on the circle for which the angle is calculated
 * @param circleCenter the center of the circle
 */
function calculateAngle(pointOnCircle: Point, circleCenter: Point): number {
  const vx = pointOnCircle.x - circleCenter.x
  const vy = pointOnCircle.y - circleCenter.y
  return normalize(Math.atan2(vy, vx))
}

/**
 * Transforms polar coordinates to cartesian coordinates.
 */
function polarToCartesian(center: Point, radius: number, angle: number): Point {
  return new Point(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle))
}

/**
 * Creates an arc instruction for SVG path data.
 * @param center the center of the arc
 * @param radius the radius of the arc
 * @param startAngle the angle that determines the start point for the arc
 * @param endAngle the angle that determines the end point for the arc
 */
function describeArc(center: Point, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(center, radius, endAngle)
  const end = polarToCartesian(center, radius, startAngle)
  const flag = normalize(endAngle - startAngle) < SEMI_CIRCLE ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${flag} 0 ${end.x} ${end.y}`
}

/**
 * Collects the necessary data for calculating arc visualization of the given node.
 */
function circleData(node: INode): NodeData {
  const nodeCenter = node.layout.center
  // the width of the node is the angle in radians of the arc segment that visualizes the node
  const nodeRadiusX = node.layout.width * 0.5
  // the height of the node is the thickness of the arc segment that visualizes the node
  const nodeRadiusY = node.layout.height * 0.5

  const circleCenter = ChordDiagramLayout.CENTER

  // the angular coordinate for the node
  const nodeCenterAngle = calculateAngle(nodeCenter, circleCenter)
  const startAngle = normalize(nodeCenterAngle - nodeRadiusX)
  const endAngle = normalize(nodeCenterAngle + nodeRadiusX)

  // the radial coordinate for the node
  const nodeDist = nodeCenter.distanceTo(circleCenter)

  return { nodeCenter, nodeRadiusX, nodeRadiusY, circleCenter, startAngle, endAngle, nodeDist }
}

type NodeData = {
  nodeCenter: Point
  nodeRadiusX: number
  nodeRadiusY: number
  circleCenter: Point
  startAngle: number
  endAngle: number
  nodeDist: number
}

class NodeRenderDataCache {
  constructor(
    public readonly nodeData: NodeData,
    public readonly showStyleHints: boolean
  ) {}

  equals(other?: NodeRenderDataCache): boolean {
    if (!other) {
      return false
    } else {
      return equals(this.nodeData, other.nodeData) && other.showStyleHints == this.showStyleHints
    }
  }
}

/**
 * Helper function to check wether the defining characteristics of the node have changed
 */
function equals(a: NodeData, b: NodeData): boolean {
  return (
    a &&
    b &&
    a.nodeCenter.equals(b.nodeCenter) &&
    a.nodeRadiusX == b.nodeRadiusX &&
    a.nodeRadiusY == b.nodeRadiusY &&
    a.circleCenter.equals(b.circleCenter) &&
    a.startAngle == b.startAngle &&
    a.endAngle == b.endAngle
  )
}

/**
 * Normalizes angles to be non-negative.
 */
function normalize(angle: number): number {
  return angle < 0 ? FULL_CIRCLE + angle : angle
}
