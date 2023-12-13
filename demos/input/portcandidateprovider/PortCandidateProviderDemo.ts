/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
import {
  DefaultEdgePathCropper,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicNestingPolicy,
  IGraph,
  INode,
  IPortCandidateProvider,
  License,
  NodeStylePortStyleAdapter,
  PortCandidateValidity,
  Rect,
  ShapeNodeStyle
} from 'yfiles'

import OrangePortCandidateProvider from './OrangePortCandidateProvider'
import GreenPortCandidateProvider from './GreenPortCandidateProvider'
import BluePortCandidateProvider from './BluePortCandidateProvider'
import RedPortCandidateProvider from './RedPortCandidateProvider'
import type { ColorSetName } from 'demo-resources/demo-styles'
import {
  applyDemoTheme,
  createDemoNodeLabelStyle,
  createDemoNodeStyle,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  const graph = graphComponent.graph

  // Disable automatic cleanup of unconnected ports since some nodes have a predefined set of ports
  graph.nodeDefaults.ports.autoCleanUp = false
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: 'ellipse'
    })
  )

  // Initialize basic demo styles
  initDemoStyles(graph)

  // Create a default editor input mode and configure it
  const graphEditorInputMode = new GraphEditorInputMode({
    // Just for user convenience: disable node creation and clipboard operations
    allowCreateNode: false,
    allowClipboardOperations: false
  })
  graphEditorInputMode.createEdgeInputMode.useHitItemsCandidatesOnly = true

  // and enable the undo feature.
  graph.undoEngineEnabled = true

  // Finally, set the input mode to the graph component.
  graphComponent.inputMode = graphEditorInputMode
  registerPortCandidateProvider(graph)

  // crop the edge path at the port and not at the node bounds
  graph.decorator.portDecorator.edgePathCropperDecorator.setImplementation(
    new DefaultEdgePathCropper({
      cropAtPort: true,
      extraCropLength: 3
    })
  )

  // draw edges in front of the nodes
  graphComponent.graphModelManager.edgeGroup.toFront()
  graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES

  // create the graph
  createSampleGraph(graphComponent)
  graphComponent.updateContentRect()
}

/**
 * Registers a callback function as decorator that provides a custom
 * {@link IPortCandidateProvider} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its {@link IPortCandidateProvider}. In this case, the 'node'
 * parameter will be assigned that node.
 * @param graph The given graph
 */
function registerPortCandidateProvider(graph: IGraph): void {
  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory((node) => {
    // Obtain the tag from the edge
    const nodeTag = node.tag

    // Check if it is a known tag and choose the respective implementation
    if (typeof nodeTag !== 'string') {
      return null
    } else if (nodeTag === 'red') {
      return new RedPortCandidateProvider(node)
    } else if (nodeTag === 'blue') {
      return new BluePortCandidateProvider(node)
    } else if (nodeTag === 'green') {
      return new GreenPortCandidateProvider(node)
    } else if (nodeTag === 'orange') {
      return new OrangePortCandidateProvider(node)
    }
    // otherwise revert to default behavior
    return null
  })
}

/**
 * Creates the sample graph for this demo.
 * @param graphComponent The given graphComponent
 */
function createSampleGraph(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  createNode(graph, 100, 100, 80, 30, 'demo-red', 'red', 'No Edge')
  createNode(graph, 350, 200, 80, 30, 'demo-red', 'red', 'No Edge')
  createNode(graph, 350, 100, 80, 30, 'demo-green', 'green', 'Green Only')
  createNode(graph, 100, 200, 80, 30, 'demo-green', 'green', 'Green Only')

  const blue1 = createNode(graph, 100, 300, 80, 30, 'demo-lightblue', 'blue', 'One   Port')
  graph.addPortAt(blue1, blue1.layout.center)

  const blue2 = createNode(graph, 350, 300, 100, 100, 'demo-lightblue', 'blue', 'Many Ports')
  const portCandidateProvider = IPortCandidateProvider.fromShapeGeometry(blue2, 0, 0.25, 0.5, 0.75)
  const candidates = portCandidateProvider.getAllSourcePortCandidates(
    graphComponent.inputModeContext
  )
  candidates
    .filter((portCandidate) => portCandidate.validity !== PortCandidateValidity.DYNAMIC)
    .forEach((portCandidate) => portCandidate.createPort(graphComponent.inputModeContext))

  // The orange node
  createNode(graph, 100, 400, 100, 100, 'demo-orange', 'orange', 'Dynamic Ports')

  // clear undo after initial graph loading
  graph.undoEngine!.clear()
}

/**
 * Creates a sample node for this demo.
 * @param graph The given graph
 * @param x The node's x-coordinate
 * @param y The node's y-coordinate
 * @param w The node's width
 * @param h The node's height
 * @param colorSet The color set name
 * @param tag The tag to identify the port candidate provider
 * @param labelText The nodes label's text
 */
function createNode(
  graph: IGraph,
  x: number,
  y: number,
  w: number,
  h: number,
  colorSet: ColorSetName,
  tag: string,
  labelText: string
): INode {
  const node = graph.createNode({
    layout: new Rect(x, y, w, h),
    style: createDemoNodeStyle(colorSet),
    tag: tag
  })
  graph.addLabel({
    owner: node,
    text: labelText,
    style: createDemoNodeLabelStyle(colorSet)
  })
  return node
}

run().then(finishLoading)
