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
import { GraphComponent, GraphEditorInputMode, License } from 'yfiles'
import licenseData from 'license'
import { addLayoutButton } from './layout-button'
import { initializeGraph } from './initialize-graph'

License.value = licenseData

// Create a GraphComponent and enable interactive editing
const graphComponent = new GraphComponent('graphComponent')
const graph = graphComponent.graph
graphComponent.inputMode = new GraphEditorInputMode()

// Create small sample graph
initializeGraph(graph)

// Enable undo and center the graph in the view
graph.undoEngineEnabled = true
graphComponent.fitGraphBounds()

// Initialize layout button
const element = document.querySelector<HTMLButtonElement>("button[data-command='Layout']")!
addLayoutButton(element, graphComponent)

// Make sure that when "hot-reloading" reloads the file,
// the old graphComponent instance gets cleaned up, properly
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.dispose(function () {
    graphComponent.cleanUp()
  })
}
