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
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalLayoutLayeringStrategy
} from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Demonstrates how to run a {@link HierarchicalLayout} with given layering.
 */
async function applyHierarchicalLayoutWithLayering(graphComponent) {
  const layoutData = new HierarchicalLayoutData({
    // Specify a layer index (stored in node tags) for each node
    givenLayersIndices: (node) => node.tag
  })

  const layout = new HierarchicalLayout({
    // Apply the user-defined layering strategy
    fromScratchLayeringStrategy: HierarchicalLayoutLayeringStrategy.USER_DEFINED
  })

  await graphComponent.applyLayoutAnimated(layout, 0, layoutData)
}

// Build the graph from the JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial layout with custom layering
await applyHierarchicalLayoutWithLayering(graphComponent)

// Add a button to toggle the custom layering on and off
demoApp.toolbar.addToggleButton(
  'Custom Layering',
  async (pressed) => {
    if (pressed) {
      await applyHierarchicalLayoutWithLayering(graphComponent)
    } else {
      await graphComponent.applyLayoutAnimated(new HierarchicalLayout(), 0)
    }
  },
  true
)
