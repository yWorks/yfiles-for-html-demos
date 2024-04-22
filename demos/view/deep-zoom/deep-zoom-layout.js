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
import { CircularLayout, HierarchicLayout, OrganicLayout } from 'yfiles'

/**
 * Applies different layouts to each of the group layers.
 *
 * Each layer is considered its own graph and consequently, all layers are arranged
 * on top of each other in the master graph. However, with the deep zoom feature,
 * only a single layer is visible at a time.
 *
 * @param {!IFoldingView} foldingView The top level folding view
 */
export function applyDeepZoomLayout(foldingView) {
  const foldingManager = foldingView.manager
  const masterGraph = foldingManager.masterGraph

  const queue = [[foldingView.localRoot, 0]]
  while (queue.length > 0) {
    const [root, layer] = queue.shift()
    applyLayout(foldingManager, root, layer)

    const childGroups = masterGraph
      .getChildren(root)
      .filter((child) => masterGraph.isGroupNode(child))
    for (const childGroup of childGroups) {
      queue.push([childGroup, layer + 1])
    }
  }
}

/**
 * @param {!FoldingManager} foldingManager
 * @param {?INode} root
 * @param {number} layer
 */
function applyLayout(foldingManager, root, layer) {
  // create a temporary view of the graph inside the given root with all child groups collapsed
  const localFoldingView = foldingManager.createFoldingView({ root, isExpanded: () => false })
  localFoldingView.graph.applyLayout(getLayoutForLayer(layer))
  localFoldingView.dispose()
}

/**
 * @param {number} layer
 * @returns {!ILayoutAlgorithm}
 */
function getLayoutForLayer(layer) {
  return layouts[layer] ?? hierarchicLayout
}

const hierarchicLayout = new HierarchicLayout({ orthogonalRouting: true })
const organicLayout = new OrganicLayout({ minimumNodeDistance: 80 })
const circularLayout = new CircularLayout()
const layouts = [
  hierarchicLayout,
  hierarchicLayout,
  organicLayout,
  hierarchicLayout,
  circularLayout,
  organicLayout,
  circularLayout,
  organicLayout,
  hierarchicLayout
]
