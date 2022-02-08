/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  DefaultNodePlacer,
  DefaultTreeLayoutPortAssignment,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  LayoutData,
  LayoutOrientation,
  TreeLayout,
  TreeLayoutData,
  TreeLayoutPortAssignmentMode
} from 'yfiles'

/**
 * Demonstrates how to configure {@link TreeLayout}.
 * @param graph The graph to be laid out
 * @return {TreeLayout, TreeLayoutData} the configured layout algorithm and the
 * corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  // instantiate the tree layout algorithm
  const layout = new TreeLayout()

  // change the orientation to left-to-right (horizontal flow)
  layout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT

  // configure the default node placer
  layout.defaultNodePlacer = new DefaultNodePlacer({
    // increase the distances the elements must keep from each other vertically and horizontally
    verticalDistance: 30,
    horizontalDistance: 30,
    // ... also increase the minimum length of first and last edge segment
    minimumFirstSegmentLength: 30,
    minimumLastSegmentLength: 30,
    // change the alignment of nodes with the same parent such that they are right-aligned (because
    // we changed the global orientation to left-to-right this is basically horizontal alignment)
    // note that 0 would mean left alignment and 0.5 center alignment
    verticalAlignment: 1,
    // distribute the segments of edges to the child nodes (change to zero to get the default
    // grouped edge routing style)
    minimumChannelSegmentDistance: 6
  })

  // define a port assignment that distributes the ports (due to the global orientation change
  // to left-to-right, the DISTRIBUTED_SOUTH setting actually distributes right).
  // change this to NONE if ports should be centered and not distributed
  layout.defaultPortAssignment = new DefaultTreeLayoutPortAssignment({
    mode: TreeLayoutPortAssignmentMode.DISTRIBUTED_SOUTH
  })

  // make the layout consider node labels in order to avoid overlaps with them
  layout.considerNodeLabels = true

  // create layout data object to specify item-individual settings
  const layoutData = new TreeLayoutData()

  // define a comparison function for the out-edges at a tree node such that the respective
  // child nodes are order with respect to the label text (if they have a label)
  layoutData.outEdgeComparers.delegate = node => (edge1: IEdge, edge2: IEdge) => {
    const targetLabel1 = edge1.targetNode!.labels.firstOrDefault()
    const targetLabel2 = edge2.targetNode!.labels.firstOrDefault()
    if (targetLabel1 && targetLabel2) {
      //compare label text
      return targetLabel1.text.localeCompare(targetLabel2.text)
    }
    return 0
  }

  return { layout, layoutData }
}
