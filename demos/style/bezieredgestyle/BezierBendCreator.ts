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
  GeneralPath,
  type IBend,
  IBendCreator,
  IEdge,
  type IGraph,
  type IInputModeContext,
  type IListEnumerable,
  type IPoint,
  IUndoUnit,
  type Point
} from '@yfiles/yfiles'

/**
 * Custom bend creator for bezier edges
 * This implementation always creates collinear triples of bends since the bezier edge model expects this.
 * In addition, the new bends and the neighboring bends are positioned so that the curve shape stays constant.
 */
export class BezierBendCreator extends BaseClass(IBendCreator) {
  private readonly originalBendCreator: IBendCreator
  private readonly edge: IEdge

  constructor(edge: IEdge, originalBendCreator: IBendCreator) {
    super()
    this.edge = edge
    this.originalBendCreator = originalBendCreator
  }

  /**
   * If the existing number of bends is 2 mod 3 (i.e. the bends are consistent with
   * what the bezier style expects),
   * this implementation creates a triple of collinear bends and adjust the neighboring bends
   * in a way that the shape of the curve is not changed initially and returns the middle bend.
   * If there are no bends at all, it creates a triple plus two initial and final control bends, all of them collinear.
   * Otherwise, the fallback bend creator is used to create a bend with its default strategy.
   * @param context the input mode context
   * @param graph the graph
   * @param location the bend location
   * @returns The index of middle bend of a control point triple if such a triple was created,
   * or the index of the newly created single bend.
   */
  public createBend(context: IInputModeContext, graph: IGraph, location: Point): number {
    switch (this.edge.bends.size) {
      case 0: {
        const spl = this.edge.sourcePort.location
        const tpl = this.edge.targetPort.location

        // a single linear segment... we just insert 5 collinear bends adjusted to the angle of the linear segment,
        // approximately evenly spaced
        graph.addBend(
          this.edge,
          location
            .subtract(spl)
            .multiply(1 / 4)
            .add(spl),
          0
        )
        graph.addBend(this.edge, location.subtract(location.subtract(spl).multiply(1 / 4)), 1)
        graph.addBend(this.edge, location, 2)
        graph.addBend(
          this.edge,
          location
            .subtract(spl)
            .multiply(1 / 4)
            .add(location),
          3
        )
        graph.addBend(
          this.edge,
          location.add(
            tpl
              .subtract(location)
              .multiply(3)
              .multiply(1 / 4)
          ),
          4
        )
        return 2
      }
      case 1:
        // Use the default strategy to insert a single bend at the correct index
        return this.originalBendCreator.createBend(context, graph, location)
      default: {
        const pathPoints = IEdge.getPathPoints(this.edge)
        if (pathPoints.size % 3 === 1) {
          // Consistent number of existing points
          // Try to insert a smooth bend
          // I.e. a triple of three collinear bends and adjust the neighbor bends

          // Various quality measures and counters
          let segmentIndex = 0
          let pathCounter = 0
          let bestDistanceSqr = Number.POSITIVE_INFINITY
          let bestRatio = Number.NaN

          // The index of the segment where we want to create the bend in the end
          let bestIndex = -1

          // Find the best segment
          while (pathCounter + 3 < pathPoints.size) {
            // Get the control points defining the current segment
            const cp0 = pathPoints.get(pathCounter++)
            const cp1 = pathPoints.get(pathCounter++)
            const cp2 = pathPoints.get(pathCounter++)
            // Consecutive segments share the last/first control point! So we may not advance the counter here
            const cp3 = pathPoints.get(pathCounter)
            // Shift a cubic segment
            // Here we assume that the path is actually composed of cubic segments, only.
            // Alternatively, we could inspect the actual path created by the edge renderer - this would also
            // allow to deal with intermediate non cubic segments, but we'd have to associate those
            // path segments somehow with the correct bends again, so again this would be tied to the actual
            // renderer implementation.
            const fragment = new GeneralPath(2)
            fragment.moveTo(cp0)
            fragment.cubicTo(cp1, cp2, cp3)

            // Try to find the projection onto the fragment
            const ratio = fragment.getProjection(location, 0)
            if (ratio) {
              // Actually found a projection ratio
              // Determine the point on the curve - the tangent provides this
              const tangent = fragment.getTangentForSegment(0, ratio)
              if (tangent) {
                // There actually is a tangent
                const d = location.subtract(tangent.point).squaredVectorLength
                // Is this the best distance?
                if (d < bestDistanceSqr) {
                  bestDistanceSqr = d
                  // Remember ratio (needed to split the curve)
                  bestRatio = ratio
                  // and the index, of course
                  bestIndex = segmentIndex
                }
              }
            }
            ++segmentIndex
          }
          if (bestIndex !== -1) {
            // Actually found a segment
            // For the drag, we want to move the middle bend
            return this.createBends(graph, bestIndex, bestRatio, pathPoints).index
          }
          // No best segment found (for whatever reason) - we don't want to create a bend so that we don't mess up anything
          return -1
        } else {
          // No consistent number of bends - just insert a single bend
          // We could also see whether we actually would have a cubic segment on the path, and treat that differently
          // However, why bother - just create the edge with a correct number of points instead
          return this.originalBendCreator.createBend(context, graph, location)
        }
      }
    }
  }

  /**
   * Create a triple of control bends and adjust the neighboring bends
   * @param graph The graph where the bends are created
   * @param segmentIndex The segment index
   * @param ratio The ratio on the segment
   * @param pathPoints The existing control points
   * @returns The middle bend of a control point triple
   */
  private createBends(
    graph: IGraph,
    segmentIndex: number,
    ratio: number,
    pathPoints: IListEnumerable<IPoint>
  ): IBend {
    // Create 3 bends and adjust the neighbors
    // The first bend we need to touch is at startIndex
    const startIndex = segmentIndex * 3

    // This holds the new coordinates left and right of the split point
    // We don't actually need all of them, but this keeps the algorithm more straightforward.
    const left: Point[] = new Array(4)
    const right: Point[] = new Array(4)

    // Determine the new control points to cleanly split the curve
    BezierBendCreator.getCubicSplitPoints(
      ratio,
      [
        pathPoints.get(startIndex).toPoint(),
        pathPoints.get(startIndex + 1).toPoint(),
        pathPoints.get(startIndex + 2).toPoint(),
        pathPoints.get(startIndex + 3).toPoint()
      ],
      left,
      right
    )

    // Previous control point - does always exist as a bend, given our precondition
    const previousBend = this.edge.bends.get(startIndex)
    // Next control point - also always exists given the precondition for bend counts (i.e. there have to be at least two)
    const nextBend = this.edge.bends.get(startIndex + 1)

    // We create the three new bends between previous bend and next bend and adjust these two.
    // We don't have to adjust more bends, since we just have a cubic curve.
    let bendToMove: IBend
    const engine = graph.undoEngine

    // Wrap everything into a single compound edit, so that everything can be undone in a single unit
    const edit = graph.beginEdit('Create Bezier Bend', 'Create Bezier Bend')
    try {
      // Adjust the previous bend - given the split algorithm, its coordinate is in left[1]
      // (left[0] is actually kept unchanged from the initial value)
      let oldLocation = previousBend.location.toPoint()
      graph.setBendLocation(previousBend, left[1])
      if (engine) {
        // Add unit to engine
        engine.addUnit(new BendLocationUndoUnit(graph, previousBend, oldLocation))
      }

      // Insert the new triple, using the values from left and right in order
      graph.addBend(this.edge, left[2], startIndex + 1)
      bendToMove = graph.addBend(this.edge, left[3], startIndex + 2)
      // right[0] == left[3], so right[1] is the next new control point
      graph.addBend(this.edge, right[1], startIndex + 3)

      // Adjust the next bend
      oldLocation = nextBend.location.toPoint()
      graph.setBendLocation(nextBend, right[2])
      if (engine) {
        // Add unit to engine
        engine.addUnit(new BendLocationUndoUnit(graph, nextBend, oldLocation))
      }
      edit.commit()
    } catch (e) {
      // Cancel the edit in case everything goes wrong.
      edit.cancel()
      throw new Error('Bend creation failed21')
    }

    return bendToMove
  }

  /**
   * For an array of `controlPoints` defining a cubic segment
   * and a given `ratio` on the segment, populate the `left`
   * and `right` arrays with new control points so that the cubic can be
   * split smoothly at the `ratio`.
   */
  private static getCubicSplitPoints(
    ratio: number,
    controlPoints: Point[],
    left: Point[],
    right: Point[]
  ): void {
    // Determine the new control points
    // Based on de Casteljau's algorithm, but iterations unrolled, since we have a fixed curve order
    const c11 = controlPoints[1].multiply(1 - ratio).add(controlPoints[2].multiply(ratio))

    left[0] = controlPoints[0]
    right[3] = controlPoints[3]
    left[1] = left[0].multiply(1 - ratio).add(controlPoints[1].multiply(ratio))
    right[2] = controlPoints[2].multiply(1 - ratio).add(right[3].multiply(ratio))

    left[2] = left[1].multiply(1 - ratio).add(c11.multiply(ratio))
    right[1] = c11.multiply(1 - ratio).add(right[2].multiply(ratio))

    right[0] = left[3] = left[2].multiply(1 - ratio).add(right[1].multiply(ratio))
  }
}

/**
 * Custom undo unit for bend location changes
 */
class BendLocationUndoUnit extends BaseClass(IUndoUnit) {
  private readonly oldValue: Point
  private readonly graph: IGraph
  private readonly bend: IBend
  private readonly newValue: Point

  constructor(graph: IGraph, bend: IBend, oldValue: Point) {
    super()
    this.graph = graph
    this.bend = bend
    this.oldValue = oldValue
    this.newValue = bend.location.toPoint()
  }

  get undoName(): string {
    return 'Set bend location'
  }

  get redoName(): string {
    return 'Set bend location'
  }

  public undo(): void {
    this.graph.setBendLocation(this.bend, this.oldValue)
  }

  public redo(): void {
    this.graph.setBendLocation(this.bend, this.newValue)
  }

  tryMergeUnit(unit: IUndoUnit): boolean {
    return false
  }

  tryReplaceUnit(unit: IUndoUnit): boolean {
    return false
  }

  dispose(): void {}
}
