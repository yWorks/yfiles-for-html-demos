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
import { GroupLayeringPolicy, HierarchicalLayout } from '@yfiles/yfiles'
import graphData from './sample.json'

/**
 * Demonstrates how to configure a left-to-right {@link HierarchicalLayout} with compact group nodes.
 */
async function applyHierarchicalLayoutWithGroupCompaction() {
  const hierarchicalLayout = new HierarchicalLayout({
    // Arrange group nodes recursively for minimal width in left-to-right layout
    groupLayeringPolicy: GroupLayeringPolicy.RECURSIVE_COMPACT,
    // Decrease horizontal spacing between nodes within the same layer
    nodeDistance: 10,
    layoutOrientation: 'left-to-right',
    coordinateAssigner: {
      // Compact groups vertically (reduces group height)
      groupCompaction: true,
      // Prioritize compactness over reducing edge bends
      bendReduction: false
    }
  })

  await graphComponent.applyLayoutAnimated(hierarchicalLayout, 0)
}

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial compact hierarchical layout
await applyHierarchicalLayoutWithGroupCompaction()

// Add a button to toggle the group compaction on and off
demoApp.toolbar.addToggleButton(
  'Compact Groups',
  async (pressed) => {
    if (pressed) {
      await applyHierarchicalLayoutWithGroupCompaction()
    } else {
      await graphComponent.applyLayoutAnimated(
        new HierarchicalLayout({ layoutOrientation: 'left-to-right' }),
        0
      )
    }
  },
  true
)
