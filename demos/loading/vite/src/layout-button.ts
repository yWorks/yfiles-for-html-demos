/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import { getLayoutExecutorAsyncMessageHandler } from './message-handler-main-thread'
import licenseValue from '../../../../lib/license.json'
import type { LayoutDescriptor } from 'yfiles'
import { GraphComponent, HierarchicLayout, LayoutExecutor, LayoutExecutorAsync } from 'yfiles'
import { BrowserDetection } from '../../../utils/BrowserDetection'

let onLayoutClicked: () => void
let layoutButton: HTMLButtonElement

// Vite supports Web Worker out-of-the-box but relies on the browser's native Web Worker support when served in DEV mode.
// Thus, during development, fall back to client-sided layout calculation if module workers are not supported.
// In the production build, Web Workers are supported because the build creates cross-browser compatible workers.
const useWorkerLayout = BrowserDetection.modulesSupportedInWorker || import.meta.env.PROD

export function addLayoutButton(button: HTMLButtonElement, graphComponent: GraphComponent) {
  onLayoutClicked = runLayout
  layoutButton = button
  button.addEventListener('click', onLayoutClicked)

  if (useWorkerLayout) {
    // wait for the worker to be ready before enabling the button
    getLayoutExecutorAsyncMessageHandler(licenseValue).then(() =>
      button.removeAttribute('disabled')
    )
  } else {
    // client-sided layout calculation, activate the button immediately
    button.removeAttribute('disabled')
  }

  async function runLayout() {
    button.setAttribute('disabled', 'disabled')
    // configure layout algorithm options ...
    const layoutDescriptor: LayoutDescriptor = {
      name: 'HierarchicLayout',
      properties: { nodeToNodeDistance: 20, orthogonalRouting: true }
    }

    if (useWorkerLayout) {
      // create an asynchronous layout executor that calculates a layout on the worker
      await new LayoutExecutorAsync({
        messageHandler: await getLayoutExecutorAsyncMessageHandler(licenseValue),
        graphComponent: graphComponent,
        layoutDescriptor: layoutDescriptor,
        animateViewport: true,
        easedAnimation: true,
        duration: '1s'
      }).start()
    } else {
      // client-sided fallback
      await new LayoutExecutor({
        graphComponent,
        layout: new HierarchicLayout(layoutDescriptor.properties),
        duration: '1s',
        animateViewport: true,
        easedAnimation: true
      }).start()
    }

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
