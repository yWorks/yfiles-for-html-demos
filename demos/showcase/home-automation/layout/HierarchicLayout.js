/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutEdgeRoutingStyle,
  ILayoutAlgorithm,
  LayoutData,
  LayoutOrientation,
  PortConstraint,
  PortSide,
  SimplexNodePlacer
} from 'yfiles'

/**
 * @returns {!object}
 */
export function createHierarchicLayoutConfiguration() {
  const layout = new HierarchicLayout()
  const defaultEdgeDescriptor = layout.edgeLayoutDescriptor
  defaultEdgeDescriptor.minimumFirstSegmentLength = 5
  defaultEdgeDescriptor.minimumLastSegmentLength = 5
  defaultEdgeDescriptor.routingStyle.defaultEdgeRoutingStyle =
    HierarchicLayoutEdgeRoutingStyle.CURVED

  const defaultNodeDescriptor = layout.nodeLayoutDescriptor
  defaultNodeDescriptor.layerAlignment = 0.5

  layout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  // specify a preferred maximum duration to prevent very long runtimes for LARGE graphs
  layout.maximumDuration = 5000
  // the minimum vertical distance between nodes in subsequent layers
  layout.minimumLayerDistance = 30
  // the minimum horizontal distance between nodes and long edges that span multiple layers
  layout.nodeToEdgeDistance = 10
  // the minimum horizontal distance between two nodes in the same layer
  layout.nodeToNodeDistance = 30
  // try to reduce the number of bends in edges that connect nodes in subsequent layers
  // this produces more readable results in this demo scenario
  const placer = layout.nodePlacer
  placer.straightenEdges = true
  // disable the barycenter node placer mode for straightenEdges option to take effect
  placer.barycenterMode = false
  // reflects our standard spacing so that nodes end up aligned with the snap grid
  layout.gridSpacing = 15

  // create and configure layout data for the hierarchic layout algorithm
  // this makes sure that edges start and end in the correct ports
  const layoutData = new HierarchicLayoutData({
    sourcePortConstraints: PortConstraint.create(PortSide.EAST, true),
    targetPortConstraints: PortConstraint.create(PortSide.WEST, true)
  })

  return { layout, layoutData }
}
