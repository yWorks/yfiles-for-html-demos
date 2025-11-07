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
  HierarchicalLayout,
  HierarchicalLayoutData,
  type ILayoutAlgorithm,
  type LayoutData,
  PortSides
} from '@yfiles/yfiles'

export function createHierarchicalLayoutConfiguration(): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const layout = new HierarchicalLayout()
  const defaultEdgeDescriptor = layout.defaultEdgeDescriptor
  defaultEdgeDescriptor.minimumFirstSegmentLength = 5
  defaultEdgeDescriptor.minimumLastSegmentLength = 5
  defaultEdgeDescriptor.routingStyleDescriptor.defaultRoutingStyle = 'curved'

  layout.defaultNodeDescriptor.layerAlignment = 0.5

  layout.layoutOrientation = 'left-to-right'
  // specify a preferred maximum duration to prevent very long runtimes for LARGE graphs
  layout.stopDuration = '5s'
  // the minimum vertical distance between nodes in subsequent layers
  layout.minimumLayerDistance = 30
  // the minimum horizontal distance between nodes and long edges that span multiple layers
  layout.nodeToEdgeDistance = 10
  // the minimum horizontal distance between two nodes in the same layer
  layout.nodeDistance = 30
  // try to reduce the number of bends in edges that connect nodes in subsequent layers
  // this produces more readable results in this demo scenario
  layout.coordinateAssigner.straightenEdges = true
  // disable the barycenter node placer mode for straightenEdges option to take effect
  layout.coordinateAssigner.symmetryOptimizationStrategy = 'none'
  // reflects our standard spacing so that nodes end up aligned with the snap grid
  layout.gridSpacing = 15

  // create and configure layout data for the hierarchical layout algorithm
  // this makes sure that edges start and end in the correct ports
  const layoutData = new HierarchicalLayoutData()
  layoutData.ports.sourcePortCandidates = new EdgePortCandidates().addFixedCandidate(
    PortSides.RIGHT
  )
  layoutData.ports.targetPortCandidates = new EdgePortCandidates().addFixedCandidate(PortSides.LEFT)

  return { layout, layoutData }
}
