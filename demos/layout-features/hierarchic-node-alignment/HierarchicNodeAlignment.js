/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FeedbackEdgeSet,
  HierarchicLayout,
  HierarchicLayoutData,
  IEdge,
  IEnumerable,
  IGraph,
  LongestPath,
  ResultItemCollection
} from 'yfiles'

/**
 * Demonstrates how to create and configure {@link HierarchicLayout} so that the nodes that are
 * connected with edges that belong to the longest path are vertically aligned.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {{HierarchicLayout, HierarchicLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  // get the edges of the longest path
  const longestPathEdges = calculateLongestPath(graph)

  const layoutData = new HierarchicLayoutData()
  // define as 'critical' the edges on the longest path - here any other predicate can be used, of course
  layoutData.criticalEdgePriorities.delegate = (edge) => (longestPathEdges.contains(edge) ? 10 : 1)

  const layout = new HierarchicLayout()

  return { layout, layoutData }
}

/**
 * Calculates the longest path in the graph.
 * For this calculation, the graph must be acyclic.
 * @param {!IGraph} graph The input graph
 * @returns {!ResultItemCollection.<IEdge>}
 */
function calculateLongestPath(graph) {
  return new LongestPath({
    subgraphEdges: {
      excludes: getCycleEdges(graph)
    }
  }).run(graph).edges
}

/**
 * Returns the edges of the graph whose removal or reversal would make the graph acyclic.
 * @param {!IGraph} graph The input graph
 * @returns {!IEnumerable.<IEdge>}
 */
function getCycleEdges(graph) {
  // Feedback edges and self loops have to be excluded here
  const feedbackEdgeSetResult = new FeedbackEdgeSet().run(graph)
  return graph.edges.filter(
    (edge) => feedbackEdgeSetResult.feedbackEdgeSet.contains(edge) || edge.isSelfloop
  )
}
