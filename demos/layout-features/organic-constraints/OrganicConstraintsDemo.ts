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
import { type INode, OrganicLayout, OrganicLayoutData } from '@yfiles/yfiles'
import graphData from './sample.json'

// Initialize organic layout
const organicLayout = new OrganicLayout({
  deterministic: true,
  defaultPreferredEdgeLength: 80,
  defaultMinimumNodeDistance: 30
})

/**
 * Demonstrates how to run an {@link OrganicLayout} with configured constraints.
 */
async function applyOrganicLayoutWithConstraints(): Promise<void> {
  // Initialize layout data to define constraints
  const organicLayoutData = new OrganicLayoutData()

  // Force nodes with "placeOnCircle" tags to lie on a circle
  organicLayoutData.constraints.addEllipse(false, 1.0).predicate = (node: INode) =>
    node.tag === 'placeOnCircle'

  await graphComponent.applyLayoutAnimated(organicLayout, 0, organicLayoutData)
}

// Build the graph from JSON data
demoApp.buildGraphFromJson(graphData)

// Run an initial layout with constraints
await applyOrganicLayoutWithConstraints()

// Add a button to toggle the constraints on and off
demoApp.toolbar.addToggleButton(
  'Use Constraints',
  async (pressed) => {
    if (pressed) {
      await applyOrganicLayoutWithConstraints()
    } else {
      await graphComponent.applyLayoutAnimated(organicLayout, 0)
    }
  },
  true
)
