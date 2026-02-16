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
import { ConstraintOrientation, OrganicLayout, OrganicLayoutData } from '@yfiles/yfiles'
import { getWayPoint } from './resources/TrekkingData'
import { SCALED_MAX_Y } from './scale-data'

/**
 * Creates and configures the {@link OrganicLayout} to produce a height profile visualization.
 * In this demo, the layout will arrange only the label nodes while the positions of the
 * waypoints (the points on the curve) will remain fixed.
 * To get the desired visualization, we will put some constraints on the {@link OrganicLayout}.
 */
export function configureLayout(graph) {
  // creates the organic layout with the desired distance between nodes
  // and sets the scope to subset so that only the label nodes are placed by the
  // layout algorithm
  const organicLayout = new OrganicLayout({
    deterministic: true,
    defaultMinimumNodeDistance: 15,
    defaultPreferredEdgeLength: 20
  })

  // mark the label nodes as affected so that they are arranged by the layout algorithm
  const organicLayoutData = new OrganicLayoutData({
    scope: { nodes: graph.nodes.filter((node) => getWayPoint(node)?.type === 'label') }
  })

  // create a constraint for each waypoint-label node pair that forces the algorithm to
  // place the label nodes above their associated waypoints
  const constraints = organicLayoutData.constraints
  for (const edge of graph.edges) {
    const waypoint = edge.sourceNode
    const labelNode = edge.targetNode

    // create a constraint that will place each label node above its associated waypoint
    const { firstSet, secondSet } = constraints.addSeparationConstraint(
      ConstraintOrientation.VERTICAL,
      0
    )
    firstSet.items = [labelNode]
    secondSet.items = [waypoint]

    // create a constraint that will vertically align each waypoint with the associated label node
    constraints.addAlignmentConstraint(ConstraintOrientation.VERTICAL).items = [labelNode, waypoint]

    // create a constraint that will place the label of the first waypoint (if this coincides with
    // the y-Axis) above the y-Axis
    if (waypoint.layout.center.x === 0) {
      constraints.addMinimumDistance(
        labelNode,
        waypoint,
        SCALED_MAX_Y + waypoint.layout.center.y + 100
      )
    }
  }

  return { layout: organicLayout, layoutData: organicLayoutData }
}
