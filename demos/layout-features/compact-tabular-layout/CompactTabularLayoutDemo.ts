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
  EdgeRouter,
  LayoutGrid,
  TabularLayout,
  TabularLayoutData,
  TabularLayoutMode
} from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Configures and applies the {@link TabularLayout} algorithm to for compact graph drawings.
 */
async function applyCompactTabularLayout(tabularLayoutMode: TabularLayoutMode): Promise<void> {
  // Initialize tabular layout with specified mode
  const tabularLayout = new TabularLayout({
    considerEdges: true, // Minimize overall edge lengths
    layoutMode: tabularLayoutMode
  })

  // Post-process with EdgeRouter for orthogonal paths (tabular layout supports straight lines only)
  const layout = new EdgeRouter({ coreLayout: tabularLayout })

  // Calculate layout grid based on the mode for compact node arrangement
  const layoutGrid = calculateGrid(tabularLayoutMode)

  // Set up layout data for data-driven features like the layout grid
  const layoutData = new TabularLayoutData({
    layoutGridData: { layoutGridCellDescriptors: () => layoutGrid.createDynamicCellDescriptor() }
  })

  await graphComponent.applyLayoutAnimated(layout, '0.5s', layoutData)
}

/**
 * Computes the layout grid based on whether to preserve the aspect ratio of the graphComponent's width/height.
 */
function calculateGrid(tabularLayoutMode: TabularLayoutMode): LayoutGrid {
  let layoutGrid: LayoutGrid
  if (tabularLayoutMode === TabularLayoutMode.FIXED_SIZE) {
    // Get the aspect ratio of the graphComponent's width/height
    const aspectRatio = graphComponent.innerSize.width / graphComponent.innerSize.height
    // Preserve aspect ratio by calculating rows and columns needed for all nodes
    const nodeCount = graphComponent.graph.nodes.size
    const rowCount = Math.ceil(Math.sqrt(nodeCount / aspectRatio))
    const columnCount = Math.ceil(nodeCount / rowCount)
    layoutGrid = new LayoutGrid(rowCount, columnCount)
  } else {
    // Automatically assign table size without a specific grid
    layoutGrid = new LayoutGrid(1, 1)
  }

  // Determine max node dimensions for uniform grid sizing
  const maxWidth = Math.max(...Array.from(graphComponent.graph.nodes, (node) => node.layout.width))
  const maxHeight = Math.max(
    ...Array.from(graphComponent.graph.nodes, (node) => node.layout.height)
  )
  layoutGrid.rows.forEach((row) => (row.minimumHeight = maxHeight + 20))
  layoutGrid.columns.forEach((column) => (column.minimumWidth = maxWidth + 20))

  return layoutGrid
}

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial layout without aspect ratio preservation
await applyCompactTabularLayout(TabularLayoutMode.AUTO_SIZE)

// Add a toggle button to switch aspect ratio preservation on/off
demoApp.toolbar.addToggleButton(
  'Preserve Aspect Ratio',
  async (pressed) => {
    const tabularLayoutMode = pressed ? TabularLayoutMode.FIXED_SIZE : TabularLayoutMode.AUTO_SIZE
    await applyCompactTabularLayout(tabularLayoutMode)
  },
  false
)
