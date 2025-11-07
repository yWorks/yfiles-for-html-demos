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
import { OrganicLayout, OrganicLayoutClusteringPolicy, ShapeConstraint } from '@yfiles/yfiles'
import graphData from './sample.json'

// Initialize an organic layout algorithm
const layout = new OrganicLayout({
  // Produce the same result on each run (default: true)
  deterministic: true,
  // Increase the preferred lengths of edges (default: 40)
  defaultPreferredEdgeLength: 100,
  // Control node spacing (range: 0 - 1)
  compactnessFactor: 0.9,
  // Determine how node clusters are formed (default: NONE)
  clusteringPolicy: OrganicLayoutClusteringPolicy.EDGE_BETWEENNESS,
  // Disallow nodes from overlapping (default: false)
  allowNodeOverlaps: false,
  // Set the minimum distance between nodes (only applies if allowNodeOverlaps is false)
  defaultMinimumNodeDistance: 10,
  // Prevent nodes and edges from overlapping
  avoidNodeEdgeOverlap: true,
  // Constrain the result to be wider than tall (aspect ratio 10:1)
  shapeConstraint: ShapeConstraint.createAspectRatioConstraint(10)
})

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the organic layout to the graph
await graphComponent.applyLayoutAnimated(layout, '0s')
