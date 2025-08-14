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
  GraphComponent,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  Subtree,
  TreeAnalysis,
  TreeAnalysisResult
} from '@yfiles/yfiles'

let globalRoot

let treeAnalysisResult

// caches for each node the subtree it is the root of
const subtrees = new Map()

/**
 * Returns the global root of the tree, i.e., the node without predecessors.
 */
export function getGlobalRoot(graph) {
  if (!globalRoot) {
    globalRoot = graph.nodes.find((node) => graph.inDegree(node) === 0)
  }
  return globalRoot
}

/**
 * Returns the subtree rooted by the given node.
 */
export function getSubtree(subtreeRoot, graph) {
  const existingSubtree = subtrees.get(subtreeRoot)
  if (existingSubtree != null) {
    return existingSubtree
  }

  const treeAnalysis = getTreeAnalysis(graph)
  const subtree = treeAnalysis.getSubtree(subtreeRoot)
  subtrees.set(subtreeRoot, subtree)
  return subtree
}

/**
 * Returns the (cached) result of the tree analysis for the whole graph.
 */
function getTreeAnalysis(graph) {
  if (treeAnalysisResult != null) {
    return treeAnalysisResult
  }
  const treeAnalysis = new TreeAnalysis({ customRootNode: getGlobalRoot(graph) })
  treeAnalysisResult = treeAnalysis.run(graph)
  return treeAnalysisResult
}

/**
 * Highlights all items in the subtree with the given root or edge to the root.
 */
export function highlightSubtree(item, graphComponent) {
  const highlights = graphComponent.highlights
  highlights.clear()

  if (item == null) {
    return
  }

  const graph = graphComponent.graph
  const subtreeRoot = getNode(item)
  const subtree = getSubtree(subtreeRoot, graph.wrappedGraph)
  subtree.nodes.filter((node) => graph.contains(node)).forEach((node) => highlights.add(node))
  subtree.edges.filter((edge) => graph.contains(edge)).forEach((edge) => highlights.add(edge))
  highlights.add(subtreeRoot.labels.first())
}

/**
 * Returns the node that is represented by the given item.
 */
function getNode(item) {
  return item instanceof INode ? item : item instanceof IEdge ? item.sourceNode : item.owner
}
