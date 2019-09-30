/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Edge,
  GeneralPath,
  GroupingKeys,
  IDataMap,
  IDataProvider,
  ILayoutAlgorithm,
  LayoutGraph,
  LayoutStageBase,
  Maps,
  Matrix,
  MinimumNodeSizeStage,
  Point,
  PortConstraint,
  PortConstraintKeys,
  PortSide,
  Size,
  YPoint
} from 'yfiles'

/**
 * Layout Stage which handles {@link RotatableNodes.RotatableNodeStyleDecorator rotated nodes}.
 * The during the {@link LayoutStageBase#coreLayout} the layout is calculated with the rotated node's
 * bounding box, i.e. a rectangular box which is large enough to fully include the rotated node. The edges are
 * connected with the actual rotated shape of the node according to the {@link #edgeRoutingMode}.
 */
export default class RotatedNodeLayoutStage extends LayoutStageBase {
  /**
   * Creates a new instance with an optional core layout algorithm.
   * @param {ILayoutAlgorithm} coreLayout
   */
  constructor(coreLayout = null) {
    super(coreLayout)
    this.$edgeRoutingMode = 'shortest-straight-path-to-border'
  }

  /**
   * The {@link IDataProvider} key to register a data provider that provides the outline and
   * oriented layout to this stage.
   * @return {string}
   */
  static get ROTATED_NODE_LAYOUT_DP_KEY() {
    return 'RotatedNodeLayoutStage.RotatedNodeLayoutDpKey'
  }

  /**
   * Returns the mode to use to connect edges from the bounding box to the actual shape.
   * @return {'no-routing'|'shortest-straight-path-to-border'|'fixed-port'}
   */
  get edgeRoutingMode() {
    return this.$edgeRoutingMode
  }

  /**
   * Specifies the mode to use to connect edges from the bounding box to the actual shape.
   * @param {'no-routing'|'shortest-straight-path-to-border'|'fixed-port'} mode
   */
  set edgeRoutingMode(mode) {
    this.$edgeRoutingMode = mode
  }

  /**
   * Executes the layout algorithm.
   * Enlarges the node layout to fully encompass the rotated layout (the rotated layout's bounding box). If the
   * {@link #edgeRoutingMode} is set to 'fixed-port', port constraints are created to keep the ports at their current
   * location. Existing port constraints are adjusted to the rotation.
   * Then, the {@link LayoutStageBase#coreLayout} is executed.
   * After the core layout the original node sizes are restored. If the {@link #edgeRoutingMode} is set to
   * 'shortest-straight-path-to-border', the last edge segment is extended from the bounding box to the rotated
   * layout.
   * @param {LayoutGraph} graph
   */
  applyLayout(graph) {
    if (!this.coreLayout) {
      return
    }

    const boundsProvider = graph.getDataProvider(RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DP_KEY)
    if (!boundsProvider) {
      // no provider: this stage adds nothing to the core layout
      this.coreLayout.applyLayout(graph)
      return
    }

    let addedSourcePortConstraints = false
    let addedTargetPortConstraints = false
    let sourcePortConstraints = graph.getDataProvider(
      PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY
    )
    let targetPortConstraints = graph.getDataProvider(
      PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY
    )
    if (this.edgeRoutingMode === 'fixed-port') {
      // Fixed port: create port constraints to keep the ports at position
      // in this case: create data providers if there are none
      if (!sourcePortConstraints) {
        sourcePortConstraints = graph.createEdgeMap()
        graph.addDataProvider(
          PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
          sourcePortConstraints
        )
        addedSourcePortConstraints = true
      }
      if (!targetPortConstraints) {
        targetPortConstraints = graph.createEdgeMap()
        graph.addDataProvider(
          PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY,
          targetPortConstraints
        )
        addedTargetPortConstraints = true
      }
    }
    try {
      const originalDimensions = Maps.createHashedNodeMap()
      graph.nodes.forEach(node => {
        const { outline, orientedLayout } = boundsProvider.get(node)
        if (orientedLayout) {
          // if the current node is rotated: apply fixes
          // remember old layout and size
          const oldLayout = graph.getLayout(node)
          const newLayout = orientedLayout.bounds.toYRectangle()
          const offset = new Point(newLayout.x - oldLayout.x, newLayout.y - oldLayout.y)
          const originalSize = new Size(oldLayout.width, oldLayout.height)
          const oldDimensions = {
            offset,
            size: originalSize,
            outline
          }
          if (this.edgeRoutingMode === 'fixed-port') {
            // EdgeRoutingMode: FixedPort: keep the ports at their current location

            // The oriented layout's corners to find the best PortSide
            const tl = new Point(
              orientedLayout.anchorX + orientedLayout.upX * orientedLayout.height,
              orientedLayout.anchorY + orientedLayout.upY * orientedLayout.height
            )
            const tr = new Point(
              orientedLayout.anchorX +
                (orientedLayout.upX * orientedLayout.height -
                  orientedLayout.upY * orientedLayout.width),
              orientedLayout.anchorY +
                orientedLayout.upY * orientedLayout.height +
                orientedLayout.upX * orientedLayout.width
            )
            const bl = new Point(orientedLayout.anchorX, orientedLayout.anchorY)
            const br = new Point(
              orientedLayout.anchorX - orientedLayout.upY * orientedLayout.width,
              orientedLayout.anchorY + orientedLayout.upX * orientedLayout.width
            )

            // for each out edge
            node.outEdges.forEach(edge => {
              // create a strong port constraint for the side which is closest to the port location (without rotation)
              const constraint = sourcePortConstraints.get(edge)
              if (!constraint) {
                const point = graph.getSourcePointAbs(edge).toPoint()
                const side = this.findBestSide(point, bl, br, tl, tr)
                sourcePortConstraints.set(edge, PortConstraint.create(side, true))
              }
            })
            node.inEdges.forEach(edge => {
              // create a strong port constraint for the side which is closest to the port location (without rotation)
              const constraint = targetPortConstraints.get(edge)
              if (!constraint) {
                const point = graph.getTargetPointAbs(edge).toPoint()
                const side = this.findBestSide(point, bl, br, tl, tr)
                targetPortConstraints.set(edge, PortConstraint.create(side, true))
              }
            })
          }

          // For source and target port constraints: fix the PortSide according to the rotation
          const angle = Math.atan2(orientedLayout.upY, orientedLayout.upX)
          if (sourcePortConstraints) {
            node.outEdges.forEach(edge => {
              this.fixPortConstraintSide(sourcePortConstraints, edge, angle)
            })
          }
          if (targetPortConstraints) {
            node.inEdges.forEach(edge => {
              this.fixPortConstraintSide(targetPortConstraints, edge, angle)
            })
          }

          // enlarge the node layout
          const position = new YPoint(newLayout.x, newLayout.y)
          oldDimensions.location = position
          originalDimensions.set(node, oldDimensions)
          graph.setLocation(node, position)
          graph.setSize(node, newLayout)
        }
      })
      const layout = new MinimumNodeSizeStage(this.coreLayout)
      layout.applyLayout(graph)

      const groups = graph.getDataProvider(GroupingKeys.GROUP_DP_KEY)
      graph.nodes.forEach(node => {
        if (groups && groups.getBoolean(node)) {
          // groups don't need to be adjusted to their former size and location because their bounds are entirely
          // calculated by the layout algorithm and they are not rotated
          return
        }

        // for each node which has been corrected: undo the correction
        const oldDimensions = originalDimensions.get(node)
        const offset = oldDimensions.offset
        const originalSize = oldDimensions.size
        const newLayout = graph.getLayout(node)

        // create a general path representing the new rotated layout
        const path = oldDimensions.outline
        const transform = new Matrix()
        transform.translate(
          new Point(newLayout.x - oldDimensions.location.x, newLayout.y - oldDimensions.location.y)
        )
        path.transform(transform)

        // restore the original size
        graph.setLocation(node, new YPoint(newLayout.x - offset.x, newLayout.y - offset.y))
        graph.setSize(node, originalSize.toYDimension())

        if (this.edgeRoutingMode === 'no-routing') {
          // NoRouting still needs fix for self-loops
          node.edges.forEach(edge => {
            if (edge.selfLoop) {
              this.fixPorts(graph, edge, path, false)
              this.fixPorts(graph, edge, path, true)
            }
          })
          return
        }

        if (this.edgeRoutingMode !== 'shortest-straight-path-to-border') {
          return
        }

        // enlarge the adjacent segment to the oriented rectangle (represented by the path)
        // handling in and out edges separately will automatically cause self-loops to be handled correctly
        node.inEdges.forEach(edge => {
          this.fixPorts(graph, edge, path, false)
        })
        node.outEdges.forEach(edge => {
          this.fixPorts(graph, edge, path, true)
        })
      })
    } finally {
      // if data provider for the port constraints have been added
      // remove and dispose them
      if (addedSourcePortConstraints) {
        graph.removeDataProvider(PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY)
      }
      if (addedTargetPortConstraints) {
        graph.removeDataProvider(PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY)
      }
    }
  }

  /**
   * Find the best {@link PortSide} according to the position of the port.
   * The orientation is not rotated, i.e. bottomLeft is always the anchor of the oriented rectangle.
   * @param {Point} point
   * @param {Point} bottomLeft
   * @param {Point} bottomRight
   * @param {Point} topLeft
   * @param {Point} topRight
   * @return {PortSide}
   */
  findBestSide(point, bottomLeft, bottomRight, topLeft, topRight) {
    // determine the distances to the sides of the oriented rectangle
    // with a small penalty to the left and right side.
    const distToBottom = point.distanceToSegment(bottomLeft, bottomRight)
    const distToTop = point.distanceToSegment(topLeft, topRight)
    const distToLeft = point.distanceToSegment(topLeft, bottomLeft) * 1.05
    const distToRight = point.distanceToSegment(topRight, bottomRight) * 1.05
    let side
    if (distToTop <= distToBottom) {
      if (distToTop <= distToLeft) {
        side = distToTop <= distToRight ? PortSide.NORTH : PortSide.EAST
      } else {
        side = distToLeft < distToRight ? PortSide.WEST : PortSide.EAST
      }
    } else if (distToBottom <= distToLeft) {
      side = distToBottom <= distToRight ? PortSide.SOUTH : PortSide.EAST
    } else {
      side = distToLeft < distToRight ? PortSide.WEST : PortSide.EAST
    }
    return side
  }

  /**
   * Fix the {@link PortSide} of the given edge's port constraints for the oriented rectangles
   * rotation.
   * If the oriented rectangle is rotated 180° the port sides will be flipped, e.g. the port constraints will be
   * replaced.
   * @param {IDataMap} portConstraints
   * @param {Edge} edge
   * @param {number} angle
   */
  fixPortConstraintSide(portConstraints, edge, angle) {
    const constraint = portConstraints.get(edge)
    if (constraint && !constraint.atAnySide) {
      let side = constraint.side
      if (angle < Math.PI / 4 && angle > -Math.PI / 4) {
        // top is rotated 90 deg left
        switch (side) {
          default:
          case PortSide.WEST:
            side = PortSide.NORTH
            break
          case PortSide.SOUTH:
            side = PortSide.WEST
            break
          case PortSide.EAST:
            side = PortSide.SOUTH
            break
          case PortSide.NORTH:
            side = PortSide.EAST
            break
        }
      } else if (angle > Math.PI / 4 && angle < Math.PI * 0.75 && angle > 0) {
        // 180 deg
        switch (side) {
          default:
          case PortSide.WEST:
            side = PortSide.EAST
            break
          case PortSide.SOUTH:
            side = PortSide.NORTH
            break
          case PortSide.EAST:
            side = PortSide.WEST
            break
          case PortSide.NORTH:
            side = PortSide.SOUTH
            break
        }
      } else if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) {
        // top is rotated 90 deg right
        switch (side) {
          default:
          case PortSide.WEST:
            side = PortSide.SOUTH
            break
          case PortSide.SOUTH:
            side = PortSide.EAST
            break
          case PortSide.EAST:
            side = PortSide.NORTH
            break
          case PortSide.NORTH:
            side = PortSide.WEST
            break
        }
      } else {
        // no rotation
        return
      }
      // Side is not writable, so set new constraint
      portConstraints.set(edge, PortConstraint.create(side, constraint.strong))
    }
  }

  /**
   * Fix the ports for 'shortest-straight-path-to-border' by enlarging the adjacent segment to the rotated layout.
   * @param {LayoutGraph} graph
   * @param {Edge} edge
   * @param {GeneralPath} path
   * @param {boolean} atSource
   */
  fixPorts(graph, edge, path, atSource) {
    const el = graph.getLayout(edge)
    const pointCount = el.pointCount()
    // find the opposite point of the port at the adjacent segment
    const firstBend = atSource
      ? (pointCount > 0 ? el.getPoint(0) : graph.getTargetPointAbs(edge)).toPoint()
      : (pointCount > 0 ? el.getPoint(pointCount - 1) : graph.getSourcePointAbs(edge)).toPoint()
    // The port itself
    const port = (atSource
      ? graph.getSourcePointAbs(edge)
      : graph.getTargetPointAbs(edge)
    ).toPoint()
    // The adjacent segment as vector pointing from the opposite point to the port
    const direction = port.subtract(firstBend)
    // find the intersection (there is always one)
    const intersection = path.findRayIntersection(firstBend.toPoint(), direction)
    let point = port
    if (intersection < Number.POSITIVE_INFINITY) {
      // found an intersection: extend the adjacent segment
      point = firstBend.add(direction.multiply(intersection))
    } else {
      // no intersection: connect to the original port's nearest point
      const cursor = path.createCursor()
      let minDistance = Number.POSITIVE_INFINITY
      while (cursor.moveNext()) {
        const distance = port.distanceTo(cursor.currentEndPoint)
        if (distance < minDistance) {
          minDistance = distance
          point = cursor.currentEndPoint
        }
      }
    }
    // set the port position
    if (atSource) {
      graph.setSourcePointAbs(edge, point.toYPoint())
    } else {
      graph.setTargetPointAbs(edge, point.toYPoint())
    }
  }
}
