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
  EdgeLabelPreferredPlacement,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayoutData,
  type IEdge,
  Insets,
  type LayoutDescriptor,
  LayoutExecutorAsync,
  License,
  WaitInputMode
} from '@yfiles/yfiles'

import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from '@yfiles/demo-utils/sample-graph'

const layoutButton = document.querySelector<HTMLButtonElement>('#run-layout')!

let graphComponent: GraphComponent = null!

let executor: LayoutExecutorAsync | null = null
const worker = new Worker(new URL('./WorkerLayout', import.meta.url), { type: 'module' })

async function run(): Promise<void> {
  License.value = licenseData

  graphComponent = new GraphComponent('#graphComponent')
  // initialize styles as well as graph
  graphComponent.inputMode = new GraphEditorInputMode()
  initializeFolding(graphComponent)
  initializeBasicDemoStyles(graphComponent.graph)
  createGroupedSampleGraph(graphComponent.graph)
  // run initial layout
  runWebWorkerLayout().then(() => {
    graphComponent.graph.undoEngine?.clear()
    layoutButton.disabled = false
  })

  await graphComponent.fitGraphBounds()

  // bind the demo buttons to their functionality
  initializeUI()
}

/**
 * Applies a hierarchical layout in a web worker task.
 */
async function runWebWorkerLayout(): Promise<void> {
  const layoutData = createLayoutData()
  const layoutDescriptor = createLayoutDescriptor()

  setLoading(true)

  // create an asynchronous layout executor that calculates a layout on the worker
  executor = new LayoutExecutorAsync({
    messageHandler: LayoutExecutorAsync.createWebWorkerMessageHandler(worker),
    graphComponent,
    layoutDescriptor,
    layoutData,
    animationDuration: '1s',
    animateViewport: true,
    easedAnimation: true
  })

  // run the Web Worker layout
  await executor.start()
  executor = null

  setLoading(false)
}

/**
 * Cancels the Web Worker and the layout executor. The layout is stopped and the graph stays the same.
 */
async function cancelWebWorkerLayout(): Promise<void> {
  if (executor) {
    await executor.cancel()
    executor = null
  }
  return
}

/**
 * Creates the object that describes the layout to the Web Worker layout executor.
 * @returns The LayoutDescriptor for this layout
 */
function createLayoutDescriptor(): LayoutDescriptor {
  return { name: 'HierarchicalLayout', properties: { nodeDistance: 50 } }
}

/**
 * Creates the layout data that is used to execute the layout.
 */
function createLayoutData() {
  return new HierarchicalLayoutData({
    nodeMargins: () => new Insets(10),
    targetGroupIds: (edge: IEdge) => edge.targetNode,
    edgeLabelPreferredPlacements: () =>
      new EdgeLabelPreferredPlacement({
        sideReference: 'relative-to-edge-flow',
        edgeSide: 'left-of-edge'
      })
  })
}

/**
 * Sets whether the wait cursor should be shown and editing should be disabled during layout calculation.
 */
function setLoading(value: boolean) {
  layoutButton.disabled = value
  const statusElement = document.getElementById('graphComponentStatus')
  statusElement?.style.setProperty('visibility', value ? 'visible' : 'hidden', '')
  const waitMode = graphComponent.lookup(WaitInputMode) as WaitInputMode
  if (waitMode) {
    if (value && waitMode.canStartWaiting()) {
      waitMode.waiting = true
    } else if (!value) {
      waitMode.waiting = false
    }
  }
}

/**
 * Helper method that binds actions to the buttons in the demo's toolbar.
 */
function initializeUI(): void {
  document.querySelector('#run-layout')!.addEventListener('click', () => runWebWorkerLayout())
  document.querySelector('#cancel-layout')!.addEventListener('click', () => cancelWebWorkerLayout())
}

run().then(finishLoading)
