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
  CollectSnapReferencesEventArgs,
  GraphComponent,
  GraphItemTypes,
  GraphSnapContext,
  INode,
  List,
  NodeSnapReferenceProvider,
  Point,
  SnapReferenceVisualizationType
} from '@yfiles/yfiles'
import { EqualAngleSnapLine, NodeSnapCircle, NodeSnapLine } from './SnapReferences'

/**
 * Provides {@link SnapReference} for {@link #addCircleSnapReferences circles} around the node
 * with radii to its children, for {@link #addAngleSnapReferences lines with fixed angles}, for
 * {@link #addOppositeSiblingSnapReferences lines through siblings} to snap to their opposite side,
 * and for {@link #addEqualAngleSnapReferences lines with equal angles} to neighbor nodes.
 */
export class SnapCircleProvider extends NodeSnapReferenceProvider {
  constructor(node) {
    super(node)
  }

  anglePoints = new List([
    new Point(0, -1), // 0°
    new Point(1, 0), // 90°
    new Point(0, 1), // 180°
    new Point(-1, 0) // 360°
  ])

  addSnapReferences(context, evt) {
    const graphComponent = evt.context.canvasComponent
    if (!(graphComponent instanceof GraphComponent)) {
      return
    }

    const centerNode = this.node
    const graph = graphComponent.graph

    const center = centerNode.layout.center
    const outEdges = graph.outEdgesAt(centerNode)

    const radii = Array.from(
      new Set(
        outEdges.map((outEdge) => {
          const targetNode = outEdge.targetNode
          return Point.distance(center, targetNode.layout.center)
        })
      )
    )
    const siblings = outEdges.map((outEdge) => outEdge.targetNode).toArray()
    const fullViewportSize = Math.max(graphComponent.viewport.width, graphComponent.viewport.height)

    this.addCircleSnapReferences(evt, radii, centerNode, center)
    this.addAngleSnapReferences(evt, centerNode, center, fullViewportSize)
    this.addOppositeSiblingSnapReferences(evt, siblings, center, fullViewportSize, centerNode)
    this.addEqualAngleSnapReferences(context, evt, siblings, center, fullViewportSize, centerNode)
  }

  /**
   * Adds circular snap references around the given node at the given radii.
   */
  addCircleSnapReferences(evt, radii, centerNode, center) {
    for (const radius of radii) {
      evt.addSnapReference(
        new NodeSnapCircle(centerNode, center, radius, 0, 0, 10, `SnapCircle ${radius}`)
      )
    }
  }

  /**
   * Adds snap lines radiating out from the given node at pre-determined {@link #anglePoints angles}.
   */
  addAngleSnapReferences(evt, centerNode, center, maxRadius) {
    for (const anglePoint of this.anglePoints) {
      evt.addSnapReference(
        new NodeSnapLine(
          centerNode,
          SnapReferenceVisualizationType.BLANK_VARIABLE_LINE,
          center,
          center.add(anglePoint.multiply(10)),
          center.add(anglePoint.multiply(maxRadius)),
          1
        )
      )
    }
  }

  /**
   * Adds snap lines radiating out from the given center node opposite each given sibling node.
   */
  addOppositeSiblingSnapReferences(evt, siblings, center, maxRadius, centerNode) {
    for (const sibling of siblings) {
      const siblingCenter = sibling.layout.center
      const opposite = center.add(center.subtract(siblingCenter).normalized.multiply(maxRadius))

      evt.addSnapReference(
        new NodeSnapLine(
          centerNode,
          SnapReferenceVisualizationType.EXTENDED_VARIABLE_LINE,
          siblingCenter,
          siblingCenter,
          opposite,
          10
        )
      )
    }
  }

  /**
   * Adds snap lines radiating out from the given center node bisecting the angles between any two
   * consecutive nodes of the given sibling nodes.
   */
  addEqualAngleSnapReferences(context, evt, siblings, center, maxRadius, centerNode) {
    const angles = new Map()
    const movedNodes = context.affectedItems.ofType(INode).toArray()

    // calculate the angle for each sibling and sort the siblings according to their angles
    const fixedSiblings = siblings
      .filter((sibling) => !movedNodes.includes(sibling))
      .map((fixedSibling) => {
        const fixedSiblingVec = fixedSibling.layout.center.subtract(center)
        const angle = Math.atan2(fixedSiblingVec.y + 1, fixedSiblingVec.x) + 2 * Math.PI
        angles.set(fixedSibling, angle)
        return fixedSibling
      })
      .sort((a, b) => angles.get(a) - angles.get(b))

    for (let i = 0, n = fixedSiblings.length; i < n; ++i) {
      const sibling1 = fixedSiblings[i == 0 ? n - 1 : i - 1]
      const sibling2 = fixedSiblings[i]

      // calculate the angle for the bisecting line between the two siblings
      const angleOffset = i == 0 ? 2 * Math.PI : 0
      const centeredAngle = (angles.get(sibling1) - angleOffset + angles.get(sibling2)) * 0.5
      const centeredPoint = new Point(Math.cos(centeredAngle), Math.sin(centeredAngle))
        .multiply(maxRadius)
        .add(center)

      evt.addSnapReference(
        new EqualAngleSnapLine(
          centerNode,
          sibling1,
          sibling2,
          centeredPoint,
          SnapReferenceVisualizationType.BLANK_VARIABLE_LINE,
          centerNode.layout.center,
          centerNode.layout.center,
          centeredPoint,
          10,
          GraphItemTypes.NODE,
          'NodeDistanceSnapLine'
        )
      )
    }
  }
}
