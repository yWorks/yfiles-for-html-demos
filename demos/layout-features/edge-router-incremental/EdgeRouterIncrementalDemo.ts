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
import { EdgeRouter, EdgeRouterData, type IEdge } from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Demonstrates how to configure {@link EdgeRouter} to route a predefined set of edges only.
 */
async function applyIncrementalEdgeRouting() {
  const edgeRouterData = new EdgeRouterData({
    scope: {
      // Configure edge router to only route edges with the 'incremental' tag
      edges: (edge: IEdge) => edge.tag === 'incremental'
    }
  })

  // Apply edge router with incremental routing
  await graphComponent.applyLayoutAnimated(new EdgeRouter(), '250ms', edgeRouterData)
}

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)
await graphComponent.fitGraphBounds()

// Add a button to run the incremental edge routing
demoApp.toolbar.addButton('Route Edges', async () => {
  await applyIncrementalEdgeRouting()
})
