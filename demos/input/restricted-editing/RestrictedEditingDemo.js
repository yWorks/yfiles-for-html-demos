/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IEdge,
  IGraph,
  License
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import SampleData from './resources/SampleData'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { EdgePositionHandler } from './EdgePositionHandler'

/**
 * Bootstraps this demo.
 */
async function run() {
  License.value = await fetchLicense()

  // create the demo's graph component
  const graphComponent = new GraphComponent('#graphComponent')
  // initially disable interactive editing
  configureUserInteraction(graphComponent)

  // configure default styles for the demo's graph
  initDemoStyles(graphComponent.graph)

  // create the demo's sample graph
  createSampleGraph(graphComponent.graph)

  // center the demo's graph in the demo's visible area
  await graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true

  // bind the demo's UI controls to their respective actions
  initializeUI(graphComponent)
}

/**
 * Creates the sample graph for this demo.
 */
function createSampleGraph(graph) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    parentId: 'parent',
    layout: 'bounds'
  })
  builder.createGroupNodesSource({ data: SampleData.groups, id: 'id', layout: 'bounds' })
  builder.createEdgesSource({
    data: SampleData.edges,
    id: 'id',
    sourceId: 'src',
    targetId: 'tgt',
    bends: 'bends'
  })

  builder.buildGraph()
}

/**
 * Registers a {@link GraphEditorInputMode} instance that does not allow interactive editing of
 * the demo's graph initially.
 * @param graphComponent the demo's main graph view.
 */
function configureUserInteraction(graphComponent) {
  graphComponent.inputMode = new GraphEditorInputMode({
    allowAddLabel: false,
    allowAdjustGroupNodeSize: false,
    allowClipboardOperations: false,
    allowCreateBend: false,
    allowCreateEdge: false,
    allowCreateNode: false,
    allowDuplicate: false,
    allowEditLabel: false,
    allowEditLabelOnDoubleClick: false,
    allowGroupingOperations: false,
    allowGroupSelection: false,
    allowPaste: false,
    allowReparentNodes: false,
    allowReparentToNonGroupNodes: false,
    allowReverseEdge: false,
    allowUndoOperations: false,
    allowUngroupSelection: false,
    deletableItems: GraphItemTypes.NONE,
    // suppressing handles effectively turns off
    // - node resizing
    // - edge reconnection
    // - bend movement
    showHandleItems: GraphItemTypes.NONE,
    moveSelectedItemsInputMode: { enabled: false },
    moveUnselectedItemsInputMode: { enabled: false }
  })

  // register position handlers on edges so that they can be moved
  graphComponent.graph.decorator.edges.positionHandler.addFactory(
    (edge) => new EdgePositionHandler(edge)
  )
}

/**
 * Configures interactive editing according to the given operations value.
 * @param graphComponent the graph view for which interactive editing is configured.
 * @param operations Determines which interactive editing operations are enabled or disabled.
 *
 * - __none__: All interactive editing operations are disabled.
 * - __moving__: Interactive editing is disabled except for interactively moving items.
 * - __all__: All interactive editing operations are enabled.
 */
function configureEditing(graphComponent, operations) {
  if (operations === 'none') {
    allowEditing(graphComponent.inputMode, false)
  } else if (operations === 'moving') {
    const geim = graphComponent.inputMode
    allowEditing(geim, false)
    geim.showHandleItems = GraphItemTypes.BEND
    geim.moveSelectedItemsInputMode.enabled = true
    geim.moveUnselectedItemsInputMode.enabled = true
  } else {
    allowEditing(graphComponent.inputMode, true)
  }
}

/**
 * Turns interactive editing on or off
 * @param geim the input mode responsible for interactive editing.
 * @param enabled if true, interactive editing is enabled; otherwise it is disabled.
 */
function allowEditing(geim, enabled) {
  geim.allowAddLabel = enabled
  geim.allowAdjustGroupNodeSize = enabled
  geim.allowClipboardOperations = enabled
  geim.allowCreateBend = enabled
  geim.allowCreateEdge = enabled
  geim.allowCreateNode = enabled
  geim.allowDuplicate = enabled
  geim.allowEditLabel = enabled
  geim.allowEditLabelOnDoubleClick = enabled
  geim.allowGroupingOperations = enabled
  geim.allowGroupSelection = enabled
  geim.allowPaste = enabled
  geim.allowReparentNodes = enabled
  geim.allowReparentToNonGroupNodes = enabled
  geim.allowReverseEdge = enabled
  geim.allowUndoOperations = enabled
  geim.allowUngroupSelection = enabled

  geim.deletableItems = enabled ? GraphItemTypes.ALL : GraphItemTypes.NONE
  geim.showHandleItems = enabled ? GraphItemTypes.ALL : GraphItemTypes.NONE

  geim.moveSelectedItemsInputMode.enabled = enabled
  geim.moveUnselectedItemsInputMode.enabled = enabled
}

/**
 * Binds actions to the demo's UI controls.
 */
function initializeUI(graphComponent) {
  const allowEditing = document.querySelector('#allowed-editing-operations')
  allowEditing.addEventListener('change', () =>
    configureEditing(graphComponent, allowEditing.value)
  )
}

run().then(finishLoading)
