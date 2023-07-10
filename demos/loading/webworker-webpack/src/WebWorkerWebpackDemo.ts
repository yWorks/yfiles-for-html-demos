/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import 'demo-resources/style/loading-demo.css'

import {
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayoutData,
  ICommand,
  IEdge,
  LayoutDescriptor,
  LayoutExecutorAsync,
  License,
  NodeHalo,
  WaitInputMode
} from 'yfiles'

import licenseData from './license.json'
import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from 'utils/sample-graph'

License.value = licenseData

let graphComponent: GraphComponent
let executor: LayoutExecutorAsync | null
let worker: Worker

const layoutButton = document.getElementById('layoutBtn') as HTMLButtonElement

function run() {
  // @ts-ignore
  worker = new Worker(new URL('./WorkerLayout.ts', import.meta.url))
  worker.onmessage = (e: any) => {
    if (e.data === 'ready') {
      runWebWorkerLayout(true)
    }
  }

  graphComponent = new GraphComponent('graphComponent')

  // initialize styles as well as graph
  graphComponent.inputMode = new GraphEditorInputMode()
  initializeFolding(graphComponent)
  initializeBasicDemoStyles(graphComponent.graph)
  createGroupedSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // bind the demo buttons to their actions
  initializeUI()

  showLoading()
}

/**
 * Runs the web worker layout task.
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
    return new Promise(resolve => {
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
 * Helper function to register ICommands at HTML elements.
 */
function bindCommand(selector: string, command: any, target: any, parameter?: any): void {
  const element = document.querySelector(selector)
  if (arguments.length < 4) {
    parameter = null
    if (arguments.length < 3) {
      target = null
    }
  }
  if (!element) {
    return
  }
  command.addCanExecuteChangedListener(() => {
    if (command.canExecute(parameter, target)) {
      element.removeAttribute('disabled')
    } else {
      element.setAttribute('disabled', 'disabled')
    }
  })
  element.addEventListener('click', () => {
    if (command.canExecute(parameter, target)) {
      command.execute(parameter, target)
    }
  })
}

/**
 * Registers the JavaScript commands for the GUI elements, typically the
 * toolbar buttons, during the creation of this application.
 */
function initializeUI() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  document
    .querySelector("button[data-command='WebWorkerLayout']")!
    .addEventListener('click', () => {
      runWebWorkerLayout(false)
    })

  const element = document.querySelector("div[data-command='cancelLayout']")!
  element.addEventListener('click', async (): Promise<void> => cancelWebWorkerLayout())
}

// noinspection JSIgnoredPromiseFromCall
run()
