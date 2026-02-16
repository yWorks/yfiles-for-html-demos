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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  FeedbackEdgeSet,
  HierarchicalLayout,
  HierarchicalLayoutData,
  LongestPath
} from '@yfiles/yfiles'
import graphData from './sample.json'
import './style.css'

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Find edges forming the longest path (requires an acyclic graph)
const longestPathEdges = new LongestPath({
  subgraphEdges: { excludes: getCycleEdges(graphComponent.graph) }
}).run(graphComponent.graph).edges

// Prioritize edges on the longest path for layout
const layoutData = new HierarchicalLayoutData({
  criticalEdgePriorities: (edge) => (longestPathEdges.contains(edge) ? 10 : 1)
})

// Apply hierarchical layout with prioritized edges
await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0, layoutData)

/**
 * Returns edges that create cycles in the graph.
 */
function getCycleEdges(graph) {
  // Find feedback edges and self-loops
  const feedbackEdgeSetResult = new FeedbackEdgeSet().run(graph)
  return graph.edges.filter(
    (edge) => feedbackEdgeSetResult.feedbackEdgeSet.contains(edge) || edge.isSelfLoop
  )
}
