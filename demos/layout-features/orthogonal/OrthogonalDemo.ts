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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  type IEdge,
  Insets,
  LayoutOrientation,
  OrthogonalLayout,
  OrthogonalLayoutData,
  OrthogonalLayoutMode,
  OrthogonalLayoutTreeSubstructureStyle,
  SubstructureOrientation
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Initialize the orthogonal layout algorithm
const orthogonalLayout = new OrthogonalLayout({
  // Use strict mode to always produce orthogonal edge routes and maintain node sizes
  layoutMode: OrthogonalLayoutMode.STRICT,
  // Nodes and edges are laid out on a virtual grid so that nodes are placed on grid points and edges run along grid lines
  // Decrease grid spacing for a more compact graph
  gridSpacing: 5,
  // Disable uniform port assignment to not insert additional bends for more uniform port assignment
  uniformPortAssignment: false,
  // Enable tree substructure placement with a compact style and left-to-right orientation
  treeSubstructureStyle: OrthogonalLayoutTreeSubstructureStyle.COMPACT,
  treeSubstructureOrientation: SubstructureOrientation.LEFT_TO_RIGHT,
  // Set the minimal size for tree detection, smaller ones are ignored
  treeSubstructureSize: 6,
  // Set layout orientation to top-to-bottom for directed edges
  layoutOrientation: LayoutOrientation.TOP_TO_BOTTOM
})

// Create layout data for item-specific settings
const orthogonalLayoutData = new OrthogonalLayoutData({
  // Define edges tagged 'directed' directed edges: they must flow in the main layout orientation
  edgeDirectedness: (edge: IEdge) => (edge.tag === 'directed' ? 1 : 0),
  // Increase bend cost for directed edges to prefer straight paths (in favor of bending other edges instead)
  edgeBendCosts: (edge: IEdge) => (edge.tag === 'directed' ? 4 : 1),
  // Add margins around the node with the "Insets" label
  nodeMargins: (node) => new Insets(node.labels.at(0)?.text === 'Insets' ? 50 : 0)
})

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured orthogonal layout
void graphComponent.applyLayoutAnimated(orthogonalLayout, 0, orthogonalLayoutData)
