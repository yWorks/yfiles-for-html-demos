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
  EdgePortCandidates,
  GeneralPath,
  IMapper,
  IOrientedRectangle,
  LayoutEdge,
  LayoutGraph,
  LayoutNode,
  LayoutStageBase,
  Mapper,
  Matrix,
  NodeDataKey,
  Point,
  PortCandidateType,
  PortSides,
  Size
} from '@yfiles/yfiles'

/**
 * Layout Stage which handles {@link RotatableNodeStyleDecorator rotated nodes}.
 * The during the {@link LayoutStageBase.coreLayout} the layout is calculated with the rotated node's
 * bounding box, i.e. a rectangular box which is large enough to fully include the rotated node. The edges are
 * connected with the actual rotated shape of the node according to the {@link edgeRoutingMode}.
 */
export class RotatedNodeLayoutStage extends LayoutStageBase {
  /** How to connect edges from the bounding box to the actual shape. */
  edgeRoutingMode = 'shortest-straight-path-to-border'

  /**
   * The {@link NodeDataKey} key to register a data provider that provides the
   * oriented layout to this stage.
   */
  static get ROTATED_NODE_LAYOUT_DATA_KEY() {
    return new NodeDataKey('RotatedNodeLayoutStage.RotatedNodeLayoutRectDataKey')
  }

  /**
   * Executes the layout algorithm.
   * Enlarges the node layout to fully encompass the rotated layout (the rotated layout's bounding box). If the
   * {@link edgeRoutingMode} is set to 'fixed-port', port candidates are created to keep the ports at their current
   * location. Existing port candidates are adjusted to the rotation.
   * Then, the {@link LayoutStageBase.coreLayout} is executed.
   * After the core layout the original node sizes are restored. If the {@link edgeRoutingMode} is set to
   * 'shortest-straight-path-to-border', the last edge segment is extended from the bounding box to the rotated
   * layout.
   */
  applyLayoutImpl(graph) {
    if (!this.coreLayout) {
      return
    }

    const rectProvider = graph.context.getItemData(
      RotatedNodeLayoutStage.ROTATED_NODE_LAYOUT_DATA_KEY
    )
    if (!rectProvider) {
      // no provider: this stage adds nothing to the core layout
      this.coreLayout.applyLayout(graph)
      return
    }
    const graphContext = graph.context
    let addedSourcePortCandidates = false
    let addedTargetPortCandidates = false
    let sourcePortCandidates = graphContext.getItemData(
      EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY
    )
    let targetPortCandidates = graphContext.getItemData(
      EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY
    )
    if (this.edgeRoutingMode === 'fixed-port') {
      // Fixed port: create port candidates to keep the ports at position
      // in this case: create data providers if there are none
      if (!sourcePortCandidates) {
        sourcePortCandidates = graph.createEdgeDataMap()
        graphContext.addItemData(
          EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY,
          sourcePortCandidates
        )
        addedSourcePortCandidates = true
      }
      if (!targetPortCandidates) {
        targetPortCandidates = graph.createEdgeDataMap()
        graphContext.addItemData(
          EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY,
          targetPortCandidates
        )
        addedTargetPortCandidates = true
      }
    }

    try {
      const originalDimensions = new Mapper()
      graph.nodes.forEach((node) => {
        const orientedLayout = rectProvider.get(node)

        // the oriented layout's corners
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

        // the outline based on the corners
        const outline = new GeneralPath()
        outline.moveTo(tl)
        outline.lineTo(tr)
        outline.lineTo(br)
        outline.lineTo(bl)
        outline.close()

        if (orientedLayout) {
          // if the current node is rotated: apply fixes
          // remember old layout and size
          const oldLayout = node.layout
          const newLayout = orientedLayout.bounds
          const offset = new Point(newLayout.x - oldLayout.x, newLayout.y - oldLayout.y)
          const originalSize = new Size(oldLayout.width, oldLayout.height)
          const oldDimensions = { offset, size: originalSize, outline, location: null }
          if (this.edgeRoutingMode === 'fixed-port') {
            // EdgeRoutingMode: FixedPort: keep the ports at their current location

            // for each out edge
            node.outEdges.forEach((edge) => {
              // create a strong port candidate for the side which is closest to the port location (without rotation)
              const constraint = sourcePortCandidates.get(edge)
              if (!constraint) {
                const point = edge.sourcePortLocation
                const side = this.findBestSide(point, bl, br, tl, tr)
                sourcePortCandidates.set(edge, new EdgePortCandidates().addFixedCandidate(side))
              }
            })
            node.inEdges.forEach((edge) => {
              // create a strong port candidate for the side which is closest to the port location (without rotation)
              const constraint = targetPortCandidates.get(edge)
              if (!constraint) {
                const point = edge.targetPortLocation
                const side = this.findBestSide(point, bl, br, tl, tr)
                targetPortCandidates.set(edge, new EdgePortCandidates().addFixedCandidate(side))
              }
            })
          }

          // For source and target port candidates: fix the PortSide according to the rotation
          const angle = Math.atan2(orientedLayout.upY, orientedLayout.upX)
          if (sourcePortCandidates) {
            node.outEdges.forEach((edge) => {
              this.fixPortCandidateSide(sourcePortCandidates, edge, angle)
            })
          }
          if (targetPortCandidates) {
            node.inEdges.forEach((edge) => {
              this.fixPortCandidateSide(targetPortCandidates, edge, angle)
            })
          }

          // enlarge the node layout
          const position = new Point(newLayout.x, newLayout.y)
          oldDimensions.location = position
          originalDimensions.set(node, oldDimensions)
          node.layout.x = position.x
          node.layout.y = position.y
          node.layout.width = newLayout.width
          node.layout.height = newLayout.height
        }
      })
      this.coreLayout.applyLayout(graph)

      graph.nodes
        .filter((node) => !graph.isGroupNode(node))
        .forEach((node) => {
          // for each node which has been corrected: undo the correction
          const oldDimensions = originalDimensions.get(node)
          const offset = oldDimensions.offset
          const originalSize = oldDimensions.size
          const newLayout = node.layout

          // create a general path representing the new rotated layout
          const path = oldDimensions.outline
          const transform = new Matrix()
          transform.translate(node.layout.topLeft.subtract(oldDimensions.location))
          path.transform(transform)

          // restore the original size
          node.layout.x = newLayout.x - offset.x
          node.layout.y = newLayout.y - offset.y
          node.layout.width = originalSize.width
          node.layout.height = originalSize.height

          // graph.setLocation(node, new Point(newLayout.x - offset.x, newLayout.y - offset.y))
          // graph.setSize(node, originalSize.toYDimension())

          if (this.edgeRoutingMode === 'no-routing') {
            // NoRouting still needs fix for self-loops
            node.edges.forEach((edge) => {
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
          node.inEdges.forEach((edge) => {
            this.fixPorts(graph, edge, path, false)
          })
          node.outEdges.forEach((edge) => {
            this.fixPorts(graph, edge, path, true)
          })
        })
    } finally {
      // if data provider for the port candidates have been added
      // remove and dispose them
      if (addedSourcePortCandidates) {
        graphContext.remove(EdgePortCandidates.SOURCE_PORT_CANDIDATES_DATA_KEY)
        graph.disposeEdgeDataMap(sourcePortCandidates)
      }
      if (addedTargetPortCandidates) {
        graphContext.remove(EdgePortCandidates.TARGET_PORT_CANDIDATES_DATA_KEY)
        graph.disposeEdgeDataMap(targetPortCandidates)
      }
    }
  }

  /**
   * Find the best {@link PortSides} according to the position of the port.
   * The orientation is not rotated, i.e. bottomLeft is always the anchor of the oriented rectangle.
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
        side = distToTop <= distToRight ? PortSides.TOP : PortSides.RIGHT
      } else {
        side = distToLeft < distToRight ? PortSides.LEFT : PortSides.RIGHT
      }
    } else if (distToBottom <= distToLeft) {
      side = distToBottom <= distToRight ? PortSides.BOTTOM : PortSides.RIGHT
    } else {
      side = distToLeft < distToRight ? PortSides.LEFT : PortSides.RIGHT
    }
    return side
  }

  /**
   * Fix the {@link PortSides} of the given edge's port candidates for the oriented rectangles
   * rotation.
   * If the oriented rectangle is rotated 180° the port sides will be flipped, e.g. the port candidates will be
   * replaced.
   */
  fixPortCandidateSide(portCandidates, edge, angle) {
    const candidate = portCandidates.get(edge)?.candidates?.at(0)
    if (candidate && !candidate.isOnAnySide()) {
      let direction = candidate.side
      if (angle < Math.PI / 4 && angle > -Math.PI / 4) {
        // top is rotated 90 deg left
        switch (direction) {
          default:
          case PortSides.LEFT:
            direction = PortSides.TOP
            break
          case PortSides.BOTTOM:
            direction = PortSides.LEFT
            break
          case PortSides.RIGHT:
            direction = PortSides.BOTTOM
            break
          case PortSides.TOP:
            direction = PortSides.RIGHT
            break
        }
      } else if (angle > Math.PI / 4 && angle < Math.PI * 0.75 && angle > 0) {
        // 180 deg
        switch (direction) {
          default:
          case PortSides.LEFT:
            direction = PortSides.RIGHT
            break
          case PortSides.BOTTOM:
            direction = PortSides.TOP
            break
          case PortSides.RIGHT:
            direction = PortSides.LEFT
            break
          case PortSides.TOP:
            direction = PortSides.BOTTOM
            break
        }
      } else if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) {
        // top is rotated 90 deg right
        switch (direction) {
          default:
          case PortSides.LEFT:
            direction = PortSides.BOTTOM
            break
          case PortSides.BOTTOM:
            direction = PortSides.RIGHT
            break
          case PortSides.RIGHT:
            direction = PortSides.TOP
            break
          case PortSides.TOP:
            direction = PortSides.LEFT
            break
        }
      } else {
        // no rotation
        return
      }
      // Side is not writable, so set new candidate
      portCandidates.set(
        edge,
        candidate.type === PortCandidateType.FREE
          ? new EdgePortCandidates().addFreeCandidate(direction)
          : new EdgePortCandidates().addFixedCandidate(direction)
      )
    }
  }

  /**
   * Fix the ports for 'shortest-straight-path-to-border' by enlarging the adjacent segment to the rotated layout.
   */
  fixPorts(graph, edge, path, atSource) {
    // find the opposite point of the port at the adjacent segment
    const firstBend = atSource
      ? edge.bends.size > 0
        ? edge.bends.first().location
        : edge.targetPortLocation
      : edge.bends.size > 0
        ? edge.bends.last().location
        : edge.sourcePortLocation
    // The port itself
    const port = atSource ? edge.sourcePortLocation : edge.targetPortLocation
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
      edge.sourcePortLocation = point
    } else {
      edge.targetPortLocation = point
    }
  }
}
