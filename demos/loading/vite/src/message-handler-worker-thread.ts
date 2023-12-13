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
import { LayoutDescriptor, LayoutExecutorAsyncWorker, LayoutGraph, License } from 'yfiles'

export function createLayoutExecutorAsyncWorker(
  applyLayout: (graph: LayoutGraph, descriptor: LayoutDescriptor) => Promise<void> | void
): LayoutExecutorAsyncWorker {
  // Create a new remote layout executor that parses the serialized graph and layout configuration
  // sent from the client and calculates the configured layout.
  const executorWorker = new LayoutExecutorAsyncWorker(applyLayout)

  // keep track of the initialization state of the worker
  let initialized = false

  // when a message is received..
  addEventListener(
    'message',
    (e) => {
      if (!initialized) {
        // The Web Worker is running in a different context, so before calling any yFiles API
        // we need to set the license. In this case, we send the license string from the client as
        // initial message.
        License.value = e.data
        postMessage('started')
        initialized = true
      } else {
        // Let the LayoutExecutorAsyncWorker handle the serialized graph and layout configuration
        // and send its result back to the client.
        executorWorker
          .process(e.data)
          .then((data) => postMessage(data))
          .catch((errorObj) => postMessage(errorObj))
      }
    },
    false
  )
  return executorWorker
}
