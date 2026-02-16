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
import {
  CircularLayout,
  EdgeRouter,
  HierarchicalLayout,
  type ILayoutAlgorithm,
  LayoutExecutorAsyncWorker,
  License,
  OrganicEdgeRouter,
  OrganicLayout,
  OrthogonalLayout,
  RadialLayout,
  RadialTreeLayout,
  TreeLayout
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { RotatedNodeLayoutStage } from './RotatedNodeLayoutStage'

// register the yFiles license in the worker as well
License.value = licenseData

// initialize the helper class that handles the messaging between the main thread and the worker
LayoutExecutorAsyncWorker.initializeWebWorker((graph, layoutDescriptor) => {
  let layout: ILayoutAlgorithm | null = null

  // The routing mode that suits the selected layout algorithm. Layout algorithms that place edge
  // ports in the center of the node don't need to add a routing step.
  let edgeRoutingMode: 'no-routing' | 'shortest-straight-path-to-border' | 'fixed-port' =
    'no-routing'

  const name = layoutDescriptor.name
  if (name === 'HierarchicalLayout') {
    // create and apply a new hierarchical layout using the given layout properties
    const hierarchicalLayout = new HierarchicalLayout(layoutDescriptor.properties ?? {})
    hierarchicalLayout.defaultEdgeDescriptor.routingStyleDescriptor.defaultRoutingStyle =
      'octilinear'
    layout = hierarchicalLayout
    edgeRoutingMode = 'shortest-straight-path-to-border'
  } else if (name === 'OrganicLayout') {
    layout = new OrganicLayout(layoutDescriptor.properties ?? {})
  } else if (name === 'OrthogonalLayout') {
    layout = new OrthogonalLayout(layoutDescriptor.properties ?? {})
    edgeRoutingMode = 'shortest-straight-path-to-border'
  } else if (name === 'CircularLayout') {
    layout = new CircularLayout(layoutDescriptor.properties ?? {})
  } else if (name === 'TreeLayout') {
    const treeLayout = new TreeLayout(layoutDescriptor.properties ?? {})
    treeLayout.treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
    layout = treeLayout
    edgeRoutingMode = 'shortest-straight-path-to-border'
  } else if (name === 'RadialTreeLayout') {
    const radialTreeLayout = new RadialTreeLayout(layoutDescriptor.properties ?? {})
    radialTreeLayout.treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
    layout = radialTreeLayout
  } else if (name === 'RadialLayout') {
    layout = new RadialLayout(layoutDescriptor.properties ?? {})
  } else if (name === 'EdgeRouter') {
    layout = new EdgeRouter(layoutDescriptor.properties ?? {})
    edgeRoutingMode = 'shortest-straight-path-to-border'
  } else if (name === 'OrganicEdgeRouter') {
    layout = new OrganicEdgeRouter(layoutDescriptor.properties ?? {})
  } else {
    throw new Error(`Unknown layoutDescriptor.name: ${name}`)
  }

  if (layout) {
    const rotatedNodeLayout = new RotatedNodeLayoutStage(layout)
    rotatedNodeLayout.edgeRoutingMode = edgeRoutingMode
    rotatedNodeLayout.applyLayout(graph)
  }
})
