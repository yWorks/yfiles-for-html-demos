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
import LayoutWorker from './layout-worker?worker'

function getWebWorkerMessageHandler(
  licenseString: Record<string, unknown>
): Promise<typeof webWorkerMessageHandler> {
  // see https://vitejs.dev/guide/features.html#web-workers for details
  // on how to load workers with Vite

  // Create a new module web worker
  // (Usually one would instantiate a module worker as follows:
  //
  // const worker = new Worker(new URL('./layout-worker.ts', import.meta.url), {
  //    type: 'module'
  // })
  //
  // as this is the most portable way and works in all browsers supporting
  // module workers. This also works in a vite production build.
  //
  // It does *not* work in the vite dev-server, however. We have therefore
  // to fall back to the import of the worker above.)
  const worker = new LayoutWorker()

  // The Web Worker is running yFiles in a different context, therefore, we need to register the
  // yFiles license in the Web Worker as well.
  worker.postMessage(licenseString)

  // helper function that performs the actual message passing between the Web Worker and the
  // LayoutExecutorAsync on the client side
  function webWorkerMessageHandler(data: object): Promise<object> {
    return new Promise((resolve) => {
      worker.onmessage = (e: any) => resolve(e.data)
      worker.postMessage(data)
    })
  }

  return new Promise<typeof webWorkerMessageHandler>((resolve, reject) => {
    worker.onmessage = (ev: any) => {
      if (ev.data === 'started') {
        resolve(webWorkerMessageHandler)
      } else {
        reject()
      }
    }
  })
}

let promise: Promise<(data: object) => Promise<object>> | null = null

/**
 * Creates a message handler that performs the actual message passing between the
 * LayoutExecutorAsync and a Web Worker.
 * @param license The yFiles license string with which yFiles is registered on the worker
 */
export function getLayoutExecutorAsyncMessageHandler(
  license: Record<string, unknown>
): Promise<(data: object) => Promise<object>> {
  if (!promise) {
    promise = getWebWorkerMessageHandler(license)
  }
  return promise
}
