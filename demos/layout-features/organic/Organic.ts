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
  IGraph,
  ILayoutAlgorithm,
  OrganicLayout,
  OrganicLayoutClusteringPolicy,
  ShapeConstraint
} from '@yfiles/yfiles'

/**
 * Demonstrates basic configuration for the {@link OrganicLayout}.
 * @param graph The graph to be laid out
 * @returns OrganicLayout the configured layout algorithm
 */
export function createLayoutConfiguration(graph: IGraph): ILayoutAlgorithm {
  // create an organic layout algorithm
  const layout = new OrganicLayout()

  // if set, the layout will yield the same results unless the settings change
  layout.deterministic = true

  // prefer edges to be longer than usual
  layout.defaultPreferredEdgeLength = 100

  // Adjusts how close together the nodes will be placed. Set between [0,1]
  layout.compactnessFactor = 0.9

  // if set to other than NONE specifies how clusters of nodes are determined. By default, nodes are not clustered.
  layout.clusteringPolicy = OrganicLayoutClusteringPolicy.EDGE_BETWEENNESS

  // whether nodes are allowed to overlap, this is false per default
  layout.allowNodeOverlaps = false

  // the minimum distance between any two nodes. If nodes are allowed to overlap, this setting is ignored
  layout.defaultMinimumNodeDistance = 10

  // avoids overlaps between nodes and edges
  layout.avoidNodeEdgeOverlap = true

  // restrict the shape of the results wider than tall
  layout.shapeConstraint = ShapeConstraint.createAspectRatioConstraint(10)

  return layout
}
