/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import loadLicenseJSON from '../resources/load-json.js'
import {
  BalloonLayout,
  CircularLayout,
  EdgeRouter,
  FamilyTreeLayout,
  HierarchicLayout,
  ILayoutAlgorithm,
  LayoutData,
  LayoutExecutorAsyncWorker,
  LayoutGraph,
  License,
  OrganicLayout,
  OrthogonalLayout,
  RadialLayout,
  SeriesParallelLayout,
  SingleCycleLayout,
  TreeLayout
} from 'yfiles'

/**
 * This 'generic' web worker layout task supports *some* of the layouts defined in the
 * LayoutDescriptor.
 *
 * In production, it is recommended to only load the necessary layouts and strip any layout import
 * that is not needed in the application to reduce bundle size and loading time.
 *
 * Since this web worker task uses ES Module imports, it only works in web workers of type 'module',
 * see also https://html.spec.whatwg.org/#module-worker-example
 *
 * To achieve a better cross browser compatibility you'd need to use 'importScripts()' instead and
 * import the UMD library version from /lib/umd/. Or use a modern application bundler, e.g.,
 * webpack.
 */

// the layouts that are currently registered in this web worker task
const layouts = {
  HierarchicLayout,
  OrganicLayout,
  BalloonLayout,
  FamilyTreeLayout,
  CircularLayout,
  SingleCycleLayout,
  OrthogonalLayout,
  EdgeRouter,
  RadialLayout,
  SeriesParallelLayout,
  TreeLayout
}

/**
 * The callback that actually applies the layout, given by the {@link LayoutDescriptor}, to the
 * parsed {@link LayoutGraph}. Any configured {@link LayoutData} is already registered at the graph
 * by the {@link LayoutExecutorAsyncWorker}.
 * @param {!LayoutGraph} graph
 * @param {!LayoutDescriptor} layoutDescriptor
 */
function applyLayout(graph, layoutDescriptor) {
  if (layoutDescriptor.name === 'UserDefined') {
    // the 'UserDefined' layout descriptor is reserved for custom layout application
    alert('No layoutDescriptor given')
  } else {
    // apply the layout of the given layout descriptor
    const layout = new layouts[layoutDescriptor.name](layoutDescriptor.properties || {})
    layout.applyLayout(graph)
  }
}

// loads and applies the yFiles license in the web worker thread
loadLicenseJSON().then(licenseData => {
  License.value = licenseData
  self.postMessage('ready')
})

// listens for the data blob sent from the main thread by the LayoutExecutorAsync
self.addEventListener(
  'message',
  async e => {
    // create a new remote layout executor
    const executor = new LayoutExecutorAsyncWorker(applyLayout)
    const result = await executor.process(e.data)
    self.postMessage(result)
  },
  false
)
