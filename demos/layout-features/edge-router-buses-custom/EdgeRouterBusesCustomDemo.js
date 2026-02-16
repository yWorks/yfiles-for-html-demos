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
  EdgeRouterBusDescriptor,
  EdgeRouterData,
  Point,
  Rect,
  YList
} from '@yfiles/yfiles'
import graphData from './sample.json'

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Initialize layout data for the edge router algorithm
const edgeRouterData = new EdgeRouterData()

// Prepare the bus for custom backbone points
const customBusDescriptor = new EdgeRouterBusDescriptor()

// Add the bus to layout data, assign all edges to it
edgeRouterData.buses.add(customBusDescriptor).items = graphComponent.graph.edges

// Create a custom backbone path for the bus
const backbonePoints = createBackbonePath()

// Assign backbone points to the bus descriptor
customBusDescriptor.busPoints = backbonePoints.toArray()

// Apply the configured edge router layout
await graphComponent.applyLayoutAnimated(new EdgeRouter(), 0, edgeRouterData)

/**
 * Creates a custom backbone path for the bus.
 */
function createBackbonePath() {
  // Calculate bounding box of all graph nodes
  const bounds = getBoundingBox(graphComponent.graph.nodes)

  // Constants for the backbone layout
  const inset = 100
  const rowHeight = 50
  const nodeRowDistance = 70
  const backboneLeftX = bounds.topLeft.x - inset

  const backbone = new YList()

  // Start left, go down to where the first "backbone row" should start
  backbone.add(new Point(backboneLeftX, bounds.topLeft.y - inset))
  const backboneFirstRowY = bounds.topLeft.y + rowHeight + nodeRowDistance * 0.5
  backbone.add(new Point(backboneLeftX, backboneFirstRowY))

  // Go right and back again, creating the first row
  backbone.add(new Point(bounds.topRight.x + inset, backboneFirstRowY))
  backbone.add(new Point(backboneLeftX, backboneFirstRowY))

  // Go down to the second row
  const backboneSecondRowY = backboneFirstRowY + nodeRowDistance + rowHeight
  backbone.add(new Point(backboneLeftX, backboneSecondRowY))

  // Go right and back again, creating the second backbone row
  backbone.add(new Point(bounds.topRight.x + inset, backboneSecondRowY))
  backbone.add(new Point(backboneLeftX, backboneSecondRowY))

  // Go down, prolonging the left vertical backbone a bit
  backbone.add(new Point(backboneLeftX, bounds.bottomLeft.y + inset))

  return backbone
}

/**
 * Returns the bounding box of the given nodes.
 */
function getBoundingBox(nodes) {
  let nodeBounds = Rect.EMPTY
  for (const node of nodes) {
    nodeBounds = Rect.add(nodeBounds, node.layout.toRect())
  }
  return nodeBounds
}
