/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import '../../../ide-support/yfiles-typeinfo'
import licenseData from '../../../lib/license.json'
import { Class, HierarchicLayout, LayoutExecutor, License, MinimumNodeSizeStage } from 'yfiles'
import { readJSON, writeJSON } from './WebWorkerJsonIO'

License.value = licenseData

self.addEventListener(
  'message',
  e => {
    const jsonData = e.data
    const jsonGraph = jsonData.graph

    runLayout(jsonGraph)
  },
  false
)

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * @param {JSONGraph} jsonGraph
 */
function runLayout(jsonGraph) {
  const graph = readJSON(jsonGraph)

  const layout = new HierarchicLayout()
  layout.minimumNodeDistance = 50
  layout.considerNodeLabels = true
  layout.integratedEdgeLabeling = true
  graph.applyLayout(new MinimumNodeSizeStage(layout))

  const reply = writeJSON(graph)

  self.postMessage(reply)
}
