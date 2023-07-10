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
  CanvasComponent,
  Class,
  EdgeRouter,
  HierarchicLayout,
  PartitionGrid,
  PartitionGridData,
  TabularLayout,
  TabularLayoutData,
  TabularLayoutPolicy
} from 'yfiles'

// For the considerEdges feature of the tabular layout, the module containing the hierarchic layout
// is needed. This line prevents it from being removed by tree-shaking tools.
Class.ensure(HierarchicLayout)

/**
 * Demonstrates various settings of the {@link TabularLayout} algorithm.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  const policy = getPolicy()
  // initialize the tabular layout algorithm
  // edges are considered to minimize the overall edge length
  const tabularLayout = new TabularLayout({
    considerEdges: true,
    layoutPolicy: policy
  })

  // the tabular layout algorithm supports only straight-line edges
  // the edge router algorithm is used as a post-processing to get orthogonal edge paths instead
  const layout = new EdgeRouter({ coreLayout: tabularLayout })

  // calculate a partition grid for a compact arrangement of the graph's nodes
  const partitionGrid = calculateGrid(policy)

  // create the layout data for the tabular layout algorithm
  // the layout data is necessary to support data-driven features like the partition grid
  const layoutData = new TabularLayoutData({
    partitionGridData: new PartitionGridData({ grid: partitionGrid })
  })

  return { layout, layoutData }
}

/**
 * Calculates the size of the partition grid based on whether the aspect ratio of the
 * graphComponent's width/height should be preserved.
 * @param {!TabularLayoutPolicy} policy
 * @returns {!PartitionGrid}
 */
function calculateGrid(policy) {
  const graphComponent = CanvasComponent.getComponent(document.getElementById('graphComponent'))

  let partitionGrid
  if (policy === TabularLayoutPolicy.FIXED_SIZE) {
    // get the aspect ratio of the graphComponent's width/height and calculate how many rows/columns are
    // needed to accommodate all nodes of the graph so that this ratio is preserved
    const aspectRatio = graphComponent.innerSize.width / graphComponent.innerSize.height
    const nodeCount = graphComponent.graph.nodes.size
    const rowCount = Math.ceil(Math.sqrt(nodeCount / aspectRatio))
    const columnCount = Math.ceil(nodeCount / rowCount)
    partitionGrid = new PartitionGrid(rowCount, columnCount)
  } else {
    // if the table's size should be automatically assigned, no partition grid is required
    partitionGrid = new PartitionGrid(1, 1)
  }

  // calculate the maximum node width and maximum node height
  // these values are used as minimum width and minimum height for the grids columns and rows
  // to ensure a nice uniform grid
  let maxWidth = 0.0
  let maxHeight = 0.0
  for (const node of graphComponent.graph.nodes) {
    const nodeBounds = node.layout
    maxWidth = Math.max(maxWidth, nodeBounds.width)
    maxHeight = Math.max(maxHeight, nodeBounds.height)
  }

  partitionGrid.rows.forEach(row => (row.minimumHeight = maxHeight + 20))
  partitionGrid.columns.forEach(column => (column.minimumWidth = maxWidth + 20))

  return partitionGrid
}

/**
 * Returns the selected layout policy for the tabular layout algorithm.
 * @returns {!TabularLayoutPolicy}
 */
function getPolicy() {
  const aspectRatioButton = document.getElementById('use-aspect-ratio')
  return aspectRatioButton.checked ? TabularLayoutPolicy.FIXED_SIZE : TabularLayoutPolicy.AUTO_SIZE
}
