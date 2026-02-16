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
import licenseValue from './license.json'
import { type GraphComponent, type LayoutDescriptor, LayoutExecutorAsync } from '@yfiles/yfiles'

let onLayoutClicked: () => void
let layoutButton: HTMLButtonElement

export function addLayoutButton(button: HTMLButtonElement, graphComponent: GraphComponent) {
  onLayoutClicked = runLayout
  layoutButton = button
  button.addEventListener('click', onLayoutClicked)

  // Create a new module web worker. See https://vitejs.dev/guide/features.html#web-workers for details
  // on how to load workers with Vite
  const worker = new Worker(new URL('./layout-worker.ts', import.meta.url), { type: 'module' })
  // The Web Worker is running yFiles in a different context, therefore, we need to register the
  // yFiles license in the Web Worker as well.
  worker.postMessage({ license: licenseValue })
  // wait for the worker to be ready before enabling the button
  worker.addEventListener('message', (e) => {
    if (e.data === 'ready') {
      button.removeAttribute('disabled')
    }
  })

  async function runLayout() {
    button.setAttribute('disabled', 'disabled')
    // configure layout algorithm options ...
    const layoutDescriptor: LayoutDescriptor = {
      name: 'HierarchicalLayout',
      properties: { nodeDistance: 20 }
    }

    // create an asynchronous layout executor that calculates a layout on the worker
    await new LayoutExecutorAsync({
      messageHandler: LayoutExecutorAsync.createWebWorkerMessageHandler(worker),
      graphComponent: graphComponent,
      layoutDescriptor: layoutDescriptor,
      animateViewport: true,
      easedAnimation: true,
      animationDuration: '1s'
    }).start()

    button.removeAttribute('disabled')
  }
}

export function removeLayoutButton() {
  if (onLayoutClicked) {
    layoutButton.removeEventListener('click', onLayoutClicked)
    onLayoutClicked = null!
    layoutButton = null!
  }
}
