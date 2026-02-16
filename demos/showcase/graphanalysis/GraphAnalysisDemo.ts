/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  INode,
  type InputModeEventArgs,
  LabelStyle,
  License,
  type MoveInputMode,
  NodeStyleIndicatorRenderer,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { initializeToolbar, switchSample, useUniformEdgeWeights } from './ui/ui-utils'
import { runLayout } from './layout/layout'
import { TagColoredPolylineEdgeStyle, TagColoredShapeNodeStyle } from './styles'
import { ComponentSwitchingInputMode } from './ui/ComponentSwitchingInputMode'
import { applyAlgorithm } from './algorithms/algorithms'
import { initializeGraphInformation } from './ui/graph-structure-information'
import { initializeContextMenu } from './ui/context-menu'

/**
 * Precompiled Regex matcher used to allow only weight labels with positive numbers as text.
 */
const validationPattern = new RegExp('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$')

/**
 * Main function for running the Graph Analysis demo.
 */
async function run(): Promise<void> {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')
  // configure the interaction for this demo
  graphComponent.inputMode = createEditorMode(graphComponent)

  // enable undo support
  graphComponent.graph.undoEngineEnabled = true

  // initialize the styles for nodes and edges and for the selection.
  initializeStyles(graphComponent)

  // create the toolbar's elements and binds them to the appropriate commands
  initializeToolbar(graphComponent)
  // register the listeners for notifying graph structural changes to update the
  // graph information displayed in the right panel
  initializeGraphInformation(graphComponent)

  setTimeout(async () => {
    await switchSample(graphComponent)
  }, 100)
}

/**
 * Initializes the graph instance and set default styles.
 */
function initializeStyles(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  // set the default style for the nodes
  graph.nodeDefaults.style = new TagColoredShapeNodeStyle()
  graph.nodeDefaults.labels.style = new LabelStyle({ font: '10px Tahoma', textFill: 'white' })

  // initialize the selection style for nodes
  graph.decorator.nodes.selectionRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({ shape: 'ellipse', stroke: '5px gray', fill: null }),
      margins: 5
    })
  )

  // disable focus decoration
  graphComponent.focusIndicatorManager.enabled = false

  // set the default style for the edges
  graph.edgeDefaults.style = new TagColoredPolylineEdgeStyle()

  // set the style and the label model for the edge labels
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createParameter()
  graph.edgeDefaults.labels.style = new LabelStyle({ font: '10px Tahoma', textFill: 'gray' })

  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER
}

/**
 * Configures the interaction for this demo.
 */
function createEditorMode(graphComponent: GraphComponent): GraphEditorInputMode {
  // configure interaction
  const inputMode = new GraphEditorInputMode({
    allowAddLabel: false,
    allowCreateBend: false,
    deletableItems: ['edge', 'node'],
    showHandleItems: 'none'
  })

  // add an input mode that allows to interactively switch the displayed component
  inputMode.add(new ComponentSwitchingInputMode())

  // deletion
  const graph = graphComponent.graph
  inputMode.addEventListener('deleting-selection', async () => {
    applyAlgorithm(graph)
    await runLayout(graphComponent, true, [])
  })

  inputMode.addEventListener('deleted-selection', async () => {
    applyAlgorithm(graph)
    await runLayout(graphComponent, true, [])
  })

  // edge creation
  inputMode.createEdgeInputMode.addEventListener('edge-created', async (evt) => {
    const edge = evt.item

    // ensure that each created node and edge have a tag
    if (!useUniformEdgeWeights()) {
      graph.addLabel({
        owner: edge,
        text: '1',
        layoutParameter: FreeEdgeLabelModel.INSTANCE.createParameter(0.5, 10),
        tag: 'weight'
      })
    }

    applyAlgorithm(graph)
    const incrementalNodes = [edge.sourceNode, edge.targetNode]
    await runLayout(graphComponent, true, incrementalNodes)
  })

  async function onDragFinished(
    _: InputModeEventArgs,
    inputModeMove: MoveInputMode
  ): Promise<void> {
    const affectedNodes = inputModeMove.affectedItems
      .filter((affectedItem) => affectedItem instanceof INode)
      .toArray() as INode[]
    if (affectedNodes.length < graph.nodes.size) {
      applyAlgorithm(graph)
      await runLayout(graphComponent, true, affectedNodes)
    }
  }

  inputMode.moveSelectedItemsInputMode.addEventListener('drag-finished', onDragFinished)
  inputMode.moveUnselectedItemsInputMode.addEventListener('drag-finished', onDragFinished)

  // run the algorithm on node creation, edge port changes or label text changes
  inputMode.addEventListener('edge-ports-changed', async () => {
    applyAlgorithm(graph)
  })

  inputMode.addEventListener('node-created', () => {
    applyAlgorithm(graph)
  })

  inputMode.editLabelInputMode.addEventListener('label-edited', () => applyAlgorithm(graph))

  inputMode.editLabelInputMode.addEventListener('validate-label-text', (evt) => {
    // labels must contain only positive numbers
    evt.validatedText = validationPattern.test(evt.newText) ? evt.newText : null
  })

  // ensure that each created node has a tag
  inputMode.nodeCreator = (_, g, location): INode =>
    g.createNodeAt({ location: location, tag: { components: [] } })

  inputMode.createEdgeInputMode.addEventListener(
    'edge-creation-started',
    (evt) => (evt.item.tag = { components: [] })
  )

  // add the context menu
  initializeContextMenu(inputMode, graphComponent)
  return inputMode
}

void run().then(finishLoading)
