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
  Arrow,
  DefaultEdgePathCropper,
  DefaultLabelStyle,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicNestingPolicy,
  IGraph,
  IPortCandidateProvider,
  License,
  NodeStylePortStyleAdapter,
  PolylineEdgeStyle,
  PortCandidateValidity,
  Rect,
  ShapeNodeStyle,
  INode
} from 'yfiles'

import OrangePortCandidateProvider from './OrangePortCandidateProvider'
import GreenPortCandidateProvider from './GreenPortCandidateProvider'
import BluePortCandidateProvider from './BluePortCandidateProvider'
import RedPortCandidateProvider from './RedPortCandidateProvider'
import { checkLicense, showApp } from '../../resources/demo-app'
import { DemoNodeStyle } from '../../resources/demo-styles'
import loadJson from '../../resources/load-json'

function run(licenseData: object): void {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // Disable automatic cleanup of unconnected ports since some nodes have a predefined set of ports
  graph.nodeDefaults.ports.autoCleanUp = false
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: 'ellipse'
    })
  )

  // Set the default style for edges
  // Use a black Pen with thickness 2.
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1px black',
    targetArrow: new Arrow({
      type: 'default',
      stroke: '1px black',
      fill: 'black'
    })
  })

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

  showApp(graphComponent)
}

/**
 * Registers a callback function as decorator that provides a custom
 * {@link IPortCandidateProvider} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its <code>IPortCandidateProvider</code>. In this case, the 'node'
 * parameter will be assigned that node.
 * @param graph The given graph
 */
function registerPortCandidateProvider(graph: IGraph): void {
  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(node => {
    // Obtain the tag from the edge
    const nodeTag = node.tag

    // Check if it is a known tag and choose the respective implementation
    if (typeof nodeTag !== 'string') {
      return null
    } else if (nodeTag === 'firebrick') {
      return new RedPortCandidateProvider(node)
    } else if (nodeTag === 'royalblue') {
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

  createNode(graph, 100, 100, 80, 30, 'firebrick', 'No Edge')
  createNode(graph, 350, 200, 80, 30, 'firebrick', 'No Edge')
  createNode(graph, 350, 100, 80, 30, 'green', 'Green Only')
  createNode(graph, 100, 200, 80, 30, 'green', 'Green Only')

  const blue1 = createNode(graph, 100, 300, 80, 30, 'royalblue', 'One   Port')
  graph.addPortAt(blue1, blue1.layout.center)

  const blue2 = createNode(graph, 350, 300, 100, 100, 'royalblue', 'Many Ports')
  const portCandidateProvider = IPortCandidateProvider.fromShapeGeometry(blue2, 0, 0.25, 0.5, 0.75)
  const candidates = portCandidateProvider.getAllSourcePortCandidates(
    graphComponent.inputModeContext
  )
  candidates
    .filter(portCandidate => portCandidate.validity !== PortCandidateValidity.DYNAMIC)
    .forEach(portCandidate => portCandidate.createPort(graphComponent.inputModeContext))

  // The orange node
  const nodeStyle = new DemoNodeStyle()
  nodeStyle.cssClass = 'orange'
  const orange = graph.createNode(new Rect(100, 400, 100, 100), nodeStyle, 'orange')
  graph.addLabel(orange, 'Dynamic Ports')

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
 * @param cssClass The given css class
 * @param labelText The nodes label's text
 */
function createNode(
  graph: IGraph,
  x: number,
  y: number,
  w: number,
  h: number,
  cssClass: string,
  labelText: string
): INode {
  const whiteTextLabelStyle = new DefaultLabelStyle({
    textFill: 'white'
  })

  const nodeStyle = new DemoNodeStyle()
  nodeStyle.cssClass = cssClass

  const node = graph.createNode(new Rect(x, y, w, h), nodeStyle, cssClass)
  graph.addLabel({
    owner: node,
    text: labelText,
    style: whiteTextLabelStyle
  })
  return node
}

// run the demo
loadJson().then(checkLicense).then(run)
