/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  LayoutData,
  LayoutOrientation,
  NodeHalo,
  OrthogonalLayout,
  OrthogonalLayoutData,
  OrthogonalLayoutStyle,
  SubstructureOrientation,
  TreeLayoutStyle
} from 'yfiles'

/**
 * Demonstrates basic configuration for the {@link OrthogonalLayout}.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} {{OrthogonalLayout, OrthogonalLayoutData}} the configured layout algorithm and the corresponding layout data
 */
export function createLayoutConfiguration(graph) {
  // create an organic layout algorithm
  const layout = new OrthogonalLayout()

  // there exist other styles that allow the layout to resize the nodes according to the number
  // and position of their neighbors to reduce the overall number of bends.
  // However, note that this may be incompatible with other settings such as node halos.
  layout.layoutStyle = OrthogonalLayoutStyle.NORMAL

  // nodes and edges are laid out on a virtual grid, so that nodes are placed on grid points and edges run along the grid lines.
  // Modifying the size of these grid cells contracts or expands the graph
  layout.gridSpacing = 5

  // if disabled (default), the algorithm does not insert additional bends in order to obtain a more
  // uniform port assignment of edges incident to the same node side.
  layout.uniformPortAssignment = false

  // enable consideration of node labels to avoid overlaps between labels and other elements
  layout.considerNodeLabels = true

  // enable the tree substructure style to arrange sub-trees using a different special placement
  // algorithm - in this case a tree arrangement with a left-to-right arrangement is chosen
  layout.treeStyle = TreeLayoutStyle.COMPACT
  layout.treeOrientation = SubstructureOrientation.LEFT_TO_RIGHT
  // trees starting with a size of 6 are detected as trees - smaller ones are ignored
  layout.treeSize = 6

  // while the above configuration modifies the layout in general, the corresponding layoutData
  // holds configuration about specific graph items.
  // E.g. to specify a halo around a certain node
  const layoutData = new OrthogonalLayoutData()

  // define some edges to be directed: they must flow in the direction of the main layout
  // orientation - in this example we select a top-to-bottom orientation
  layoutData.directedEdges.delegate = edge => isDirectedEdge(edge)
  layout.layoutOrientation = LayoutOrientation.TOP_TO_BOTTOM

  // increasing the bend cost for an edge causes the layout algorithm to prefer not creating bends
  // there (in favor of bending other edges instead) - in the example we want that the directed
  // edges are not bended if possible
  layoutData.edgeBendCosts.delegate = edge => (isDirectedEdge(edge) ? 4 : 1)

  // node halos are reserving additional space around nodes.
  layoutData.nodeHalos.delegate = node =>
    node.labels.get(0).text === 'Halo' ? NodeHalo.create(50) : NodeHalo.create(0)

  return { layoutAlgorithm: layout, layoutData: layoutData }
}

/**
 * @param {!IEdge} edge
 * @returns {boolean}
 */
function isDirectedEdge(edge) {
  return edge.tag.directed
}
