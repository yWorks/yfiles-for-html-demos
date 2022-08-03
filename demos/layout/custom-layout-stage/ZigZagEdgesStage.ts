/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Cursors,
  LayoutGraph,
  LayoutStageBase,
  LineSegment,
  YList,
  YPoint,
  YPointPath,
  YVector
} from 'yfiles'

const ZIG_SIZE = 5

/**
 * A layout stage that post-processes edge paths produced by the core layout
 * and changes all edges into a zig-zag shape, while following the original path.
 */
export default class ZigZagEdgesStage extends LayoutStageBase {
  applyLayout(graph: LayoutGraph): void {
    // Apply the core layout ...
    super.applyLayoutCore(graph)
    // ... after which we can then change the edge paths
    this.postProcessEdgePaths(graph)
  }

  /**
   * Changes the path of each edge into a zig-zag shape.
   */
  private postProcessEdgePaths(graph: LayoutGraph) {
    for (const edge of graph.edges) {
      graph.setPoints(edge, getZigZagPointsForEdge(graph.getPath(edge)))
    }
  }
}

/**
 * Calculates the necessary bend locations to change the edge's path into a zig-zag.
 * @param path The edge path.
 */
function getZigZagPointsForEdge(path: YPointPath): YList {
  const list = new YList()
  for (let i = 0; i < path.lineSegmentCount; i++) {
    list.addAll(Cursors.createCursor(getZigZagPointsForSegment(path.getLineSegment(i)!)))
  }
  return list
}

/**
 * Calculates the necessary bend locations to change an edge segment into a zig-zag.
 * @param segment
 */
function getZigZagPointsForSegment(segment: LineSegment): YPoint[] {
  const length = segment.length()
  // The number of whole v^ we can fit into the segment
  const zigzags = (length / (2 * ZIG_SIZE)) | 0
  // The length of each v^
  const zigLength = length / zigzags
  // Create a unit vector along the segment
  const v = segment.toYVector()
  v.norm()
  // Create the zig-sized vector perpendicular to the segment
  const zigV = new YVector(v.y * ZIG_SIZE, -v.x * ZIG_SIZE)
  const result: YPoint[] = []
  let p = segment.firstEndPoint
  for (let i = 0; i < zigzags; i++) {
    result.push(p)
    result.push(p.moveBy((v.x * zigLength) / 4 + zigV.x, (v.y * zigLength) / 4 + zigV.y))
    result.push(p.moveBy((v.x * zigLength) / 2, (v.y * zigLength) / 2))
    result.push(p.moveBy((v.x * zigLength * 3) / 4 + zigV.x, (v.y * zigLength * 3) / 4 + zigV.y))
    p = p.moveBy(v.x * zigLength, v.y * zigLength)
  }
  return result
}
