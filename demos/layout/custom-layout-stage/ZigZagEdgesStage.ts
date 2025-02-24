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
import { LayoutGraph, LayoutStageBase, Point } from '@yfiles/yfiles'

const ZIG_SIZE = 5

/**
 * A layout stage that post-processes edge paths produced by the core layout
 * and changes all edges into a zig-zag shape, while following the original path.
 */
export default class ZigZagEdgesStage extends LayoutStageBase {
  protected applyLayoutImpl(graph: LayoutGraph): void {
    if (!this.coreLayout) {
      return
    }

    // Apply the core layout ...
    this.coreLayout.applyLayout(graph)
    // ... after which we can then change the edge paths
    this.postProcessEdgePaths(graph)
  }

  /**
   * Changes the path of each edge into a zig-zag shape.
   */
  private postProcessEdgePaths(graph: LayoutGraph) {
    for (const edge of graph.edges) {
      const path: Point[] = []
      path.push(edge.sourcePortLocation)
      path.push(...edge.bends.map((bend) => bend.location))
      path.push(edge.targetPortLocation)

      edge.resetPath()

      const zigZagPath = getZigZagPointsForEdge(path)
      edge.sourcePortLocation = zigZagPath[0]
      for (let i = 1; i < zigZagPath.length - 1; i++) {
        graph.addBend(edge, zigZagPath[i].x, zigZagPath[i].y)
      }
      edge.targetPortLocation = zigZagPath[zigZagPath.length - 1]
    }
  }
}

/**
 * Calculates the necessary bend locations to change the edge's path into a zig-zag.
 * @param path The edge path.
 */
function getZigZagPointsForEdge(path: Point[]): Point[] {
  const list: Point[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const points = getZigZagPointsForSegment(path[i], path[i + 1])
    list.push(...points)
  }
  return list
}

/**
 * Calculates the necessary bend locations to change an edge segment into a zig-zag.
 */
function getZigZagPointsForSegment(p1: Point, p2: Point): Point[] {
  const length = p1.distanceTo(p2)
  // The number of whole v^ we can fit into the segment
  const zigzags = (length / (2 * ZIG_SIZE)) | 0
  // The length of each v^
  const zigLength = length / zigzags
  // Create a unit vector along the segment
  const v = new Point(p2.x - p1.x, p2.y - p1.y).normalized
  // Create the zig-sized vector perpendicular to the segment
  const zigV = new Point(v.y * ZIG_SIZE, -v.x * ZIG_SIZE)
  const result: Point[] = []
  let p = p1
  const vxLength = v.x * zigLength
  const vyLength = v.y * zigLength
  for (let i = 0; i < zigzags; i++, p = translatePoint(p, vxLength, vyLength)) {
    result.push(p)
    result.push(translatePoint(p, vxLength / 4 + zigV.x, vyLength / 4 + zigV.y))
    result.push(translatePoint(p, vxLength / 2, vyLength / 2))
    result.push(translatePoint(p, (vxLength * 3) / 4 + zigV.x, (vyLength * 3) / 4 + zigV.y))
  }
  return result
}

function translatePoint(p: Point, dx: number, dy: number) {
  return new Point(p.x + dx, p.y + dy)
}
