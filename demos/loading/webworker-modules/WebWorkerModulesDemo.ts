/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LayoutDescriptor } from 'yfiles'
import {
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayoutData,
  IEdge,
  LayoutExecutorAsync,
  License,
  NodeHalo,
  WaitInputMode
} from 'yfiles'

import { BrowserDetection } from 'demo-utils/BrowserDetection'
import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import WorkerLayout from './WorkerLayout?worker'
import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from 'demo-utils/sample-graph'

let graphComponent: GraphComponent = null!

let executor: LayoutExecutorAsync | null = null
let worker: Worker

const layoutButton = document.querySelector<HTMLButtonElement>('#run-layout')!
const modulesWorkersSupported = BrowserDetection.modulesSupportedInWorker

if (modulesWorkersSupported) {
  // Create a new module web worker
  // (Usually one would instantiate a module worker as follows:
  //
  //   worker = new Worker(new URL('./WorkerLayout.ts', import.meta.url), {
  //     type: 'module'
  //   })
  //
  // as this is the most portable way and works in all browsers supporting
  // module workers. This method also works in a vite production build.
  //
  // As the yFiles demos run in a vite dev-server, this method does not work,
  // and we have to fall back to the import of the worker above.)
  worker = new WorkerLayout()
  worker.onmessage = (e) => {
    if (e.data === 'ready') {
      layoutButton.disabled = false
      // run the initial layout after the web worker is ready
      void runWebWorkerLayout(true)
    }
  }
} else {
  // module workers are not supported
  const notSupportedHint = document.getElementById('notSupportedHint')
  notSupportedHint!.style.display = 'block'
  const graphComponentDiv = document.getElementById('graphComponent')
  graphComponentDiv!.style.display = 'none'
}

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // initialize styles as well as graph
  graphComponent.inputMode = new GraphEditorInputMode()
  initializeFolding(graphComponent)
  initializeBasicDemoStyles(graphComponent.graph)
  createGroupedSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // bind the demo buttons to their functionality
  initializeUI()
}

/**
 * Applies a hierarchic layout in a web worker task.
 * @param clearUndo Specifies whether the undo queue should be cleared after the layout
 * calculation. This is set to `true` if this method is called directly after
 * loading a new sample graph.
 */
async function runWebWorkerLayout(clearUndo: boolean): Promise<void> {
  const layoutData = createLayoutData()
  const layoutDescriptor = createLayoutDescriptor()

  showLoading()

  // helper function that performs the actual message passing to the web worker
  function webWorkerMessageHandler(data: unknown): Promise<any> {
    return new Promise((resolve) => {
      worker.onmessage = (e: any) => resolve(e.data)
      worker.postMessage(data)
    })
  }

  // create an asynchronous layout executor that calculates a layout on the worker
  executor = new LayoutExecutorAsync({
    messageHandler: webWorkerMessageHandler,
    graphComponent,
    layoutDescriptor,
    layoutData,
    duration: '1s',
    animateViewport: true,
    easedAnimation: true
  })

  // run the Web Worker layout
  await executor.start()
  executor = null

  if (clearUndo) {
    graphComponent.graph.undoEngine!.clear()
  }

  hideLoading()
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
  return {
    name: 'HierarchicLayout',
    properties: {
      nodeToNodeDistance: 50,
      considerNodeLabels: true,
      integratedEdgeLabeling: true
    }
  }
}

/**
 * Creates the layout data that is used to execute the layout.
 */
function createLayoutData() {
  return new HierarchicLayoutData({
    nodeHalos: () => NodeHalo.create(10),
    targetGroupIds: (edge: IEdge) => edge.targetNode
  })
}

/**
 * Shows the wait cursor and disables editing during the layout calculation.
 */
function showLoading() {
  layoutButton.disabled = true
  const statusElement = document.getElementById('graphComponentStatus')
  if (statusElement) {
    statusElement.style.setProperty('visibility', 'visible', '')
  }
  const waitMode = graphComponent.lookup(WaitInputMode.$class) as WaitInputMode
  if (waitMode !== null && !waitMode.waiting) {
    if (waitMode.canStartWaiting()) {
      waitMode.waiting = true
    }
  }
}

/**
 * Removes the wait cursor and restores editing after the layout calculation.
 */
function hideLoading() {
  layoutButton.disabled = false
  const statusElement = document.getElementById('graphComponentStatus')
  if (statusElement !== null) {
    statusElement.style.setProperty('visibility', 'hidden', '')
  }
  const waitMode = graphComponent.lookup(WaitInputMode.$class) as WaitInputMode
  if (waitMode !== null) {
    waitMode.waiting = false
  }
}

/**
 * Helper method that binds actions to the buttons in the demo's toolbar.
 */
function initializeUI(): void {
  document
    .querySelector('#run-layout')!
    .addEventListener('click', async () => runWebWorkerLayout(false))

  document
    .querySelector('#cancel-layout')!
    .addEventListener('click', async () => cancelWebWorkerLayout())
}

run().then(finishLoading)
