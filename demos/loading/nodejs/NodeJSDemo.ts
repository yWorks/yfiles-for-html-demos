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
import {
  GraphComponent,
  GraphEditorInputMode,
  LayoutExecutorAsync,
  License,
  WaitInputMode
} from 'yfiles'

import { fetchLicense } from 'demo-resources/fetch-license.js'

import {
  createGroupedSampleGraph,
  initializeBasicDemoStyles,
  initializeFolding
} from 'demo-utils/sample-graph'
import { finishLoading } from 'demo-resources/demo-ui/finish-loading'

let graphComponent: GraphComponent

async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')

  // initialize styles as well as graph
  graphComponent.inputMode = new GraphEditorInputMode()
  initializeFolding(graphComponent)
  initializeBasicDemoStyles(graphComponent.graph)
  createGroupedSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  initializeUI()

  runNodeJSLayout(true)
}

/**
 * Runs the layout using the NodeJS server.
 * @param {boolean} clearUndo Specifies whether the undo queue should be cleared after the layout
 * calculation. This is set to `true` if this method is called directly after
 * loading a new sample graph.
 */
async function runNodeJSLayout(clearUndo: boolean) {
  showLoading()

  // handles the connection between the NodeJS server and the client application
  async function nodeJsMessageHandler(data: any) {
    // send the data blob to the NodeJS server
    const request = await fetch('http://localhost:3001/layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify(data)
    })
    // resolve with the layouted graph returned from the server
    return await request.json()
  }

  // The LayoutExecutorAsync allows to hook up with a LayoutExecutorAsyncWorker on a different
  // server and applies the response to the current diagram.
  const remoteExecutor = new LayoutExecutorAsync({
    messageHandler: nodeJsMessageHandler,
    graphComponent,
    duration: '1s',
    animateViewport: true,
    easedAnimation: true
  })

  try {
    await remoteExecutor.start()
  } catch (e) {
    if (e instanceof TypeError) {
      alert(
        `Layout request failed with message "${e.message}".

Is the layout server running? If not, start the layout server and reload the demo.
`
      )
    } else {
      throw e
    }
  } finally {
    if (clearUndo) {
      graphComponent.graph.undoEngine!.clear()
    }
    hideLoading()
  }
}

/**
 * Shows the wait cursor and disables editing during the layout calculation.
 */
function showLoading() {
  const statusElement = document.getElementById('graphComponentStatus')
  statusElement!.style.setProperty('visibility', 'visible', '')
  const waitMode = graphComponent.lookup(WaitInputMode.$class)
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
  const statusElement = document.getElementById('graphComponentStatus')
  if (statusElement !== null) {
    statusElement.style.setProperty('visibility', 'hidden', '')
  }
  const waitMode = graphComponent.lookup(WaitInputMode.$class)
  if (waitMode !== null) {
    waitMode.waiting = false
  }
}

/**
 * Registers the run layout button action.
 */
function initializeUI() {
  document.querySelector('#runNodeJSLayout')!.addEventListener('click', () => {
    runNodeJSLayout(false)
  })
}

run().then(finishLoading)
