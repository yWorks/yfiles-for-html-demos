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
  CompactDiskLayout,
  CompactDiskLayoutData,
  EdgePathCropper,
  IGroupPaddingProvider,
  type INode,
  Insets,
  OrganicLayout,
  RecursiveGroupLayout,
  RecursiveGroupLayoutData,
  ShapeNodeShape,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import graphData from './sample.json'
import './style.css'

// Initialize compact disk layout for grouping node contents
const compactDiskLayout = new CompactDiskLayout({
  minimumNodeDistance: 4 // Slightly increase node spacing
})

// Configure layout data to use node tags as types
const compactDiskLayoutData = new CompactDiskLayoutData({
  nodeTypes: (node: INode) => node.tag ?? null
})

// Setup recursive layout to apply compact disk layout separately in each group
const recursiveGroupLayout = new RecursiveGroupLayout({
  coreLayout: new OrganicLayout({ deterministic: true, defaultMinimumNodeDistance: 20 })
})

// Make recursive layout use compact disk layout for group nodes
const recursiveGroupLayoutData = new RecursiveGroupLayoutData({
  groupNodeLayouts: compactDiskLayout
})

// Set circular style for standard nodes
;(graphComponent.graph.nodeDefaults.style as ShapeNodeStyle).shape = ShapeNodeShape.ELLIPSE

// Configure circular style and appearance for group nodes
graphComponent.graph.groupNodeDefaults.style = new ShapeNodeStyle({
  fill: 'white',
  stroke: '5px #093237',
  shape: 'ellipse'
})

// Add padding to group nodes to keep contents inside bounds
graphComponent.graph.decorator.nodes.groupPaddingProvider.addConstant(
  (node) => graphComponent.graph.isGroupNode(node),
  IGroupPaddingProvider.create(() => new Insets(20))
)

// Improve edge cropping at nodes
graphComponent.graph.decorator.ports.edgePathCropper.addConstant(
  new EdgePathCropper({ cropAtPort: false, extraCropLength: 2 })
)

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured layout to the graph
await graphComponent.applyLayoutAnimated(
  recursiveGroupLayout,
  0,
  compactDiskLayoutData.combineWith(recursiveGroupLayoutData)
)
