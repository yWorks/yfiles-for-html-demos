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
  BezierEdgeStyle,
  FreeNodeLabelModel,
  GroupSizePolicy,
  RadialGroupLayout,
  RadialGroupLayoutData,
  RadialNodeLabelPlacement,
  ShapeNodeShape,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Configure radial group layout
const radialGroupLayout = new RadialGroupLayout({
  // Use default group sizing for compact drawings
  groupSizePolicy: GroupSizePolicy.ADAPTIVE,
  // Place labels at leaf nodes ray-like
  nodeLabelPlacement: RadialNodeLabelPlacement.RAY_LIKE_LEAVES,
  // Increase child distribution angle
  preferredRootSectorAngle: 200,
  edgeBundling: {
    defaultBundleDescriptor: {
      // Enable bundled edges
      bundled: true,
      // Enable smoother curves in conjunction with BezierEdgeStyle
      bezierFitting: true
    }
  }
})

// Configure radial group layout data
const radialGroupLayoutData = new RadialGroupLayoutData({
  // Allow more overlap with parent nodes (except those tagged "avoidParentOverlap") for compact drawings
  parentOverlapRatios: (node) => (node.tag === 'avoidParentOverlap' ? 0 : 0.5)
})

// Use round nodes that are typical for radial layout
;(graphComponent.graph.nodeDefaults.style as ShapeNodeStyle).shape = ShapeNodeShape.ELLIPSE
graphComponent.graph.groupNodeDefaults.style = new ShapeNodeStyle({
  shape: ShapeNodeShape.ELLIPSE,
  fill: '#ced6d7'
})

// Use BezierEdgeStyle for edges for smoother curves
graphComponent.graph.edgeDefaults.style = new BezierEdgeStyle({ stroke: `1.5px #093237` })

// Use FreeNodeLabelModel for maximum layout flexibility
graphComponent.graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Apply the configured radial layout to the graph
await graphComponent.applyLayoutAnimated(radialGroupLayout, 0, radialGroupLayoutData)
