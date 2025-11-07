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
import '@yfiles/demo-app/loading-demo.css'

import {
  Command,
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

import licenseData from './license.json'
import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from '@yfiles/demo-utils/sample-graph'

License.value = licenseData

let graphComponent: GraphComponent
let executor: LayoutExecutorAsync | null
const worker = new Worker(new URL('./WorkerLayout.ts', import.meta.url))

const layoutButton = document.querySelector<HTMLButtonElement>('#layoutBtn')!

function run() {
  graphComponent = new GraphComponent('graphComponent')

  // initialize styles as well as graph
  graphComponent.inputMode = new GraphEditorInputMode()
  initializeFolding(graphComponent)
  initializeBasicDemoStyles(graphComponent.graph)
  createGroupedSampleGraph(graphComponent.graph)
  void graphComponent.fitGraphBounds()

  // bind the demo buttons to their actions
  initializeUI()

  runWebWorkerLayout().then(() => {
    graphComponent.graph.undoEngine!.clear()
  })
}

/**
 * Runs the web worker layout task.
 */
async function runWebWorkerLayout(): Promise<void> {
  const layoutData = createLayoutData()
  const layoutDescriptor = createLayoutDescriptor()

  showLoading()

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

  hideLoading()
}

/**
 * Cancels the Web Worker and the layout executor. The layout is stopped and the graph stays the same.
 */
async function cancelWebWorkerLayout() {
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
  const waitMode = graphComponent.lookup(WaitInputMode) as WaitInputMode
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
  const waitMode = graphComponent.lookup(WaitInputMode) as WaitInputMode
  if (waitMode !== null) {
    waitMode.waiting = false
  }
}

/**
 * Helper function to register Commands at HTML elements.
 */
function bindCommand(
  selector: string,
  command: any,
  targetCanvas: GraphComponent,
  parameter?: any
): void {
  const element = document.querySelector(selector)
  if (arguments.length < 4) {
    parameter = null
  }
  if (!element) {
    return
  }
  targetCanvas.addEventListener('can-execute-changed', () => {
    if (targetCanvas.canExecuteCommand(command, parameter)) {
      element.removeAttribute('disabled')
    } else {
      element.setAttribute('disabled', 'disabled')
    }
  })
  element.addEventListener('click', () => {
    if (targetCanvas.canExecuteCommand(command, parameter)) {
      targetCanvas.executeCommand(command, parameter)
    }
  })
}

/**
 * Registers the JavaScript commands for the GUI elements, typically the
 * toolbar buttons, during the creation of this application.
 */
function initializeUI() {
  bindCommand("button[data-command='ZoomIn']", Command.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", Command.DECREASE_ZOOM, graphComponent)
  document
    .querySelector("button[data-command='FitContent']")!
    .addEventListener('click', async () => {
      await graphComponent.fitGraphBounds()
    })
  bindCommand("button[data-command='ZoomOriginal']", Command.ZOOM, graphComponent, 1.0)
  const undoEngine = graphComponent.graph.undoEngine
  // todo enable/disable undo/redo
  document.querySelector("button[data-command='Undo']")!.addEventListener('click', () => {
    if (undoEngine?.canUndo()) {
      undoEngine?.undo()
    }
  })

  document.querySelector("button[data-command='Redo']")!.addEventListener('click', () => {
    if (undoEngine?.canRedo()) {
      undoEngine?.redo()
    }
  })

  document
    .querySelector("button[data-command='WebWorkerLayout']")!
    .addEventListener('click', async () => {
      await runWebWorkerLayout()
    })

  document
    .querySelector('#cancel-layout')!
    .addEventListener('click', async (): Promise<void> => cancelWebWorkerLayout())
}

run()
