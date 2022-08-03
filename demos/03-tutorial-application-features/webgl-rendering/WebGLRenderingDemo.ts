/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  INode,
  InteriorLabelModel,
  License,
  Point,
  Rect,
  Size,
  WebGL2FocusIndicatorManager,
  WebGL2GraphModelManager,
  WebGL2SelectionIndicatorManager
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import { isWebGl2Supported } from '../../utils/Workarounds'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  if (!isWebGl2Supported()) {
    // show message if the browsers does not support WebGL2
    document.getElementById('no-webgl-support')!.removeAttribute('style')
    showApp()
    return
  }

  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  enableWebGLRendering(graphComponent)
  initInteraction(graphComponent)

  // create an initial sample graph
  await createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // _After_ creating the graph, enable the undo engine
  // This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Enables WebGL2 as the rendering technique.
 *
 * @param graphComponent
 */
function enableWebGLRendering(graphComponent: GraphComponent) {
  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  graphComponent.focusIndicatorManager = new WebGL2FocusIndicatorManager()
}

/**
 * Configures the interaction so that it works nicer with WebGL2.
 *
 * @param graphComponent
 */
function initInteraction(graphComponent: GraphComponent) {
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    marqueeSelectableItems: GraphItemTypes.NODE | GraphItemTypes.BEND,
    //Completely disable handles for ports and edges
    showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.PORT & ~GraphItemTypes.EDGE
  })
  //Disable moving of individual edge segments
  graphComponent.graph.decorator.edgeDecorator.positionHandlerDecorator.hideImplementation()
}

/**
 * Initializes the defaults for the graph items in this tutorial.
 *
 * WebGL2 rendering converts the normal yFiles style of each graph item into a corresponding
 * WebGL visualization. It's also possible to explicitly specify the WebGL visualization with the
 * {@link WebGL2GraphModelManager}.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph: IGraph): void {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(120, 120)
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'center'
  })
  graph.groupNodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('north')
}

/**
 * Creates an initial sample graph.
 *
 * @yjs:keep=edgeList
 * @param graph The graph.
 */
async function createGraph(graph: IGraph) {
  // get the lists of data items for the nodes and edges
  const response = await fetch('./resources/hierarchic_2000_2100.json')
  const graphData = await response.json()

  const getRandomInt = (upper: number) => Math.floor(Math.random() * upper)

  graph.clear()
  // create a map to store the nodes for edge creation
  const nodeMap = new Map<any, INode>()

  // create the nodes
  for (const nodeData of graphData.nodeList) {
    const id = nodeData.id
    const l = nodeData.l
    const node = graph.createNode({
      layout: new Rect(l.x, l.y, l.w, l.h),
      tag: { id, type: getRandomInt(9) }
    })
    nodeMap.set(id, node)

    graph.addLabel(node, `Item \u2116 ${graph.nodes.size}\nType: ${node.tag.type}`)
  }

  for (const edgeData of graphData.edgeList) {
    // get the source and target node from the mapping
    const sourceNode = nodeMap.get(edgeData.s)!
    const targetNode = nodeMap.get(edgeData.t)!
    // create the source and target port
    const sourcePortLocation =
      edgeData.sp != null ? Point.from(edgeData.sp) : sourceNode.layout.center
    const targetPortLocation =
      edgeData.tp != null ? Point.from(edgeData.tp) : targetNode.layout.center
    const sourcePort = graph.addPortAt(sourceNode, sourcePortLocation)
    const targetPort = graph.addPortAt(targetNode, targetPortLocation)
    // create the edge
    const edge = graph.createEdge(sourcePort, targetPort)
    // add the bends
    if (edgeData.b != null) {
      const bendData = edgeData.b as { x: number; y: number }[]
      bendData.forEach(bend => {
        graph.addBend(edge, Point.from(bend))
      })
    }
  }
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindAction("button[data-command='Reset']", async () => {
    await createGraph(graphComponent.graph)
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
