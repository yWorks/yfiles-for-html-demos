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
'use strict'

/* eslint-env worker */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
;(() => {
  // noinspection EmptyCatchBlockJS
  try {
    // Try to enable development support
    importScripts('../../../ide-support/yfiles-typeinfo.js')
  } catch (ignored) {
    // Development support not available, probably because we're in a production environment.
    // Just proceed without it.
  }

  importScripts('../../resources/require.js')

  // @yjs:keep=onError
  require.onError = error => {
    throw error
  }
  require.config({
    paths: {
      yfiles: '../../../lib/umd/',
      utils: '../../utils/'
    }
  })

  // Require imports
  self.addEventListener(
    'message',
    e => {
      const jsonData = e.data
      const jsonGraph = jsonData.graph

      require([
        './WebWorkerJsonIO.js',
        'yfiles/layout-hierarchic',
        'yfiles/view-layout-bridge'
      ], async (WebWorkerJsonIO, /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles) => {
        yfiles.lang.License.value = await loadLicense()
        runLayout(jsonGraph, WebWorkerJsonIO, yfiles)
      })
    },
    false
  )

  /**
   * @param {JSONGraph} jsonGraph
   * @param {ServerJsonIO} WebWorkerJsonIO
   * @param {yfiles} yfiles
   */
  function runLayout(jsonGraph, WebWorkerJsonIO, yfiles) {
    const graph = WebWorkerJsonIO.read(jsonGraph)

    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.minimumNodeDistance = 50
    layout.considerNodeLabels = true
    layout.integratedEdgeLabeling = true
    graph.applyLayout(new yfiles.layout.MinimumNodeSizeStage(layout))

    const reply = WebWorkerJsonIO.write(graph)

    self.postMessage(reply)
  }

  async function loadLicense() {
    const response = await fetch('../../../lib/license.json')
    return response.json()
  }
})()
