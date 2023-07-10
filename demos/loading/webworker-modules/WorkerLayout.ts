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
import type { LayoutDescriptor } from 'yfiles'
import {
  HierarchicLayout,
  LayoutExecutorAsyncWorker,
  LayoutGraph,
  License,
  MinimumNodeSizeStage
} from 'yfiles'
import { fetchLicense } from 'demo-resources/fetch-license'

function applyLayout(graph: LayoutGraph, layoutDescriptor: LayoutDescriptor): void {
  if (layoutDescriptor.name === 'HierarchicLayout') {
    // create and apply a new hierarchic layout using the given layout properties
    // and wrap it in a MinimumNodeSizeStage
    const layout = new MinimumNodeSizeStage(new HierarchicLayout(layoutDescriptor.properties))
    layout.applyLayout(graph)
  }
}

async function run(): Promise<void> {
  License.value = await fetchLicense()
  // signal that the webworker thread is ready to execute
  ;(self as unknown as Worker).postMessage('ready')
}

// noinspection JSIgnoredPromiseFromCall
run()

self.addEventListener(
  'message',
  e => {
    // create a new remote layout executor
    const executor = new LayoutExecutorAsyncWorker(applyLayout)
    executor
      .process(e.data)
      .then(postMessage as Worker['postMessage'])
      .catch(postMessage as Worker['postMessage'])
  },
  false
)
