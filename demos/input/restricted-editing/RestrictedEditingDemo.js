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
import {
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  License
} from 'yfiles'
import loadJson from '../../resources/load-json.js'
import { bindChangeListener, bindCommand, checkLicense, showApp } from '../../resources/demo-app.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import SampleData from './resources/SampleData.js'

/**
 * Bootstraps this demo.
 * @param {!object} licenseData The yFiles license information.
 */
function run(licenseData) {
  License.value = licenseData

  // create the demo's graph component
  const graphComponent = new GraphComponent('#graphComponent')

  // initially disable interactive editing
  configureUserInteraction(graphComponent)

  // configure default styles for the demo's graph
  initDemoStyles(graphComponent.graph)

  // create the demo's sample graph
  createSampleGraph(graphComponent.graph)

  // center the demo's graph in the demo's visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true

  // bind the demo's UI controls to their respective commands
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Creates the sample graph for this demo.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    parentId: 'parent',
    layout: 'bounds'
  })
  builder.createGroupNodesSource({
    data: SampleData.groups,
    id: 'id',
    layout: 'bounds'
  })
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
 * @param {!GraphComponent} graphComponent the demo's main graph view.
 */
function configureUserInteraction(graphComponent) {
  const geim = new GraphEditorInputMode({
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
    showHandleItems: GraphItemTypes.NONE
  })
  geim.moveInputMode.enabled = false
  geim.moveLabelInputMode.enabled = false

  graphComponent.inputMode = geim
}

/**
 * Configures interactive editing according to the given operations value.
 * @param {!GraphComponent} graphComponent the graph view for which interactive editing is configured.
 * @param {!('none'|'moving'|'all')} operations Determines which interactive editing operations are enabled or disabled.
 * <dl>
 *   <dt>none</dt><dd>All interactive editing operations are disabled.</dd>
 *   <dt>moving</dt><dd>Interactive editing is disabled except for interactively moving items.</dd>
 *   <dt>all</dt><dd>All interactive editing operations are enabled.</dd>
 * </dl>
 */
function configureEditing(graphComponent, operations) {
  if (operations === 'none') {
    allowEditing(graphComponent.inputMode, false)
  } else if (operations === 'moving') {
    const geim = graphComponent.inputMode
    allowEditing(geim, false)
    geim.showHandleItems = GraphItemTypes.BEND
    geim.moveInputMode.enabled = true
    geim.moveLabelInputMode.enabled = true
  } else {
    allowEditing(graphComponent.inputMode, true)
  }
}

/**
 * Turns interactive editing on or off
 * @param {!GraphEditorInputMode} geim the input mode responsible for interactive editing.
 * @param {boolean} enabled if true, interactive editing is enabled; otherwise it is disabled.
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

  geim.moveInputMode.enabled = enabled
  geim.moveLabelInputMode.enabled = enabled
}

/**
 * Binds actions and commands to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener('#allowedEditingOperations', value => configureEditing(graphComponent, value))
}

loadJson().then(checkLicense).then(run)
