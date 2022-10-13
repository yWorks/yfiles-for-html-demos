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
import { GraphComponent, GraphEditorInputMode, IGraph, INode, License, Rect } from 'yfiles'
import { showApp } from '../../resources/demo-app'
import DemoReparentNodeHandler from './DemoReparentNodeHandler'
import type { ColorSetName } from '../../resources/demo-styles'
import {
  applyDemoTheme,
  createDemoGroupLabelStyle,
  createDemoGroupStyle,
  createDemoNodeStyle,
  initDemoStyles
} from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  const graph = graphComponent.graph

  // create a default editor input mode and configure it
  const graphEditorInputMode = new GraphEditorInputMode({
    // assign the custom reparent handler of this demo
    reparentNodeHandler: new DemoReparentNodeHandler(),
    allowGroupingOperations: true,
    // Just for user convenience: disable edge creation, ...
    allowCreateEdge: false,
    // ... node creation, and ...
    allowCreateNode: false,
    // ... group node creation as well as ...
    allowGroupSelection: false,
    // ... clipboard operations
    allowClipboardOperations: false
  })

  // enable the undo feature.
  graph.undoEngineEnabled = true

  // initialize the default style of the nodes and edges
  initDemoStyles(graph)

  // Finally, assign the configured input mode to the graph component.
  graphComponent.inputMode = graphEditorInputMode

  createSampleGraph(graph)

  showApp(graphComponent)
}

/**
 * Creates the demo's sample graph.
 * @param graph The graph to populate
 */
function createSampleGraph(graph: IGraph): void {
  // create some group nodes ...
  const group1 = createGroupNode(graph, 100, 100, 'demo-lightblue', 'blue', 'Only Blue Children')
  const group2 = createGroupNode(graph, 160, 130, 'demo-lightblue', 'blue', 'Only Blue Children')
  const greenGroup = createGroupNode(graph, 100, 350, 'demo-green', 'green', 'Only Green Children')
  createGroupNode(graph, 400, 350, 'demo-green', 'green', 'Only Green Children')

  // ... and some regular nodes
  const blueNodeStyle = createDemoNodeStyle('demo-lightblue')
  const greenNodeStyle = createDemoNodeStyle('demo-green')
  const redNodeStyle = createDemoNodeStyle('demo-red')

  const blueNode = graph.createNode(new Rect(110, 130, 30, 30), blueNodeStyle, 'blue')
  const greenNode = graph.createNode(new Rect(130, 380, 30, 30), greenNodeStyle, 'green')
  graph.createNode(new Rect(400, 100, 30, 30), redNodeStyle, 'red')
  graph.createNode(new Rect(500, 100, 30, 30), greenNodeStyle, 'green')
  graph.createNode(new Rect(400, 200, 30, 30), blueNodeStyle, 'blue')
  graph.createNode(new Rect(500, 200, 30, 30), redNodeStyle, 'red')

  graph.groupNodes(group1, [blueNode, group2])
  graph.groupNodes(greenGroup, [greenNode])

  // ensure that the outer blue group completely contains its inner group
  graph.setNodeLayout(group1, new Rect(100, 100, 200, 150))
  // uncomment the following line to adjust the bounds of the outer blue group automatically
  // graph.adjustGroupNodeLayout(group1);

  // clear undo after initial graph creation
  graph.undoEngine!.clear()
}

/**
 * Creates a group node for the sample graph with a specific styling.
 * @param graph The given graph
 * @param x The node's x-coordinate
 * @param y The node's y-coordinate
 * @param colorSet The color set that defines the node's styling
 * @param tag The tag to identify the reparent handler
 * @param labelText The node's label text
 */
function createGroupNode(
  graph: IGraph,
  x: number,
  y: number,
  colorSet: ColorSetName,
  tag: string,
  labelText: string
): INode {
  const groupNode = graph.createGroupNode({
    layout: new Rect(x, y, 130, 100),
    style: createDemoGroupStyle({ colorSetName: colorSet }),
    tag: tag
  })
  graph.addLabel({ owner: groupNode, text: labelText, style: createDemoGroupLabelStyle(colorSet) })

  return groupNode
}

// noinspection JSIgnoredPromiseFromCall
run()
