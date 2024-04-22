/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  License,
  Rect,
  StorageLocation
} from 'yfiles'

import CustomNodeLabelModel, { CustomNodeLabelModelParameter } from './CustomNodeLabelModel'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent = null!

/**
 * This demo shows how to create and use a custom label model.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode()

  initializeGraph()

  enableGraphML()
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML(): void {
  // create a new GraphMLSupport instance that handles save and load operations
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  gs.graphMLIOHandler.addHandleSerializationListener(
    CustomNodeLabelModelParameter.serializationHandler
  )
  gs.graphMLIOHandler.addHandleDeserializationListener(
    CustomNodeLabelModelParameter.deserializationHandler
  )
}

/**
 * Sets a custom node label model parameter instance for newly created
 * node labels in the graph, creates an example node with a label using
 * the default parameter and another node with a label without restrictions
 * on the number of possible placements.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph
  // set the defaults for nodes
  initDemoStyles(graph)
  graph.nodeDefaults.labels.layoutParameter = new CustomNodeLabelModel().createDefaultParameter()

  // create graph
  const node1 = graph.createNode(new Rect(90, 90, 100, 100))
  const node2 = graph.createNode(new Rect(250, 90, 100, 100))

  const customNodeLabelModel = new CustomNodeLabelModel()
  customNodeLabelModel.candidateCount = 0
  customNodeLabelModel.offset = 20
  graph.addLabel(node1, 'Click and Drag', customNodeLabelModel.createDefaultParameter())
  graph.addLabel(node2, 'Click and Drag To Snap')

  graphComponent.fitGraphBounds()
}

run().then(finishLoading)
