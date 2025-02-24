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
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  IEnumerable,
  IGraph,
  IInputModeContext,
  INode,
  InteriorNodeLabelModel,
  IPortCandidate,
  License,
  List,
  PolylineEdgeStyle,
  PortCandidate,
  PortCandidateProviderBase,
  ShapeNodeStyle,
  ShapePortStyle,
  Size,
  Stroke
} from '@yfiles/yfiles'
import { colorSets, createDemoEdgeLabelStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  // Create and configure ports using shape port style
  initializeGraph(graphComponent.graph)
  initializeInteraction(graphComponent)
  await graphComponent.fitGraphBounds()
}
/**
 * Creates a new shape port style with the provided shape and color.
 */
function createShapePortStyle(portShape, colorSet) {
  return new ShapePortStyle({
    shape: portShape,
    fill: colorSets[colorSet].fill,
    renderSize: new Size(20, 20),
    stroke: null
  })
}
/**
 * Creates nodes, ports, and edges to demonstrate all port shapes.
 * @param graph The graph in which to create nodes.
 */
function initializeGraph(graph) {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: colorSets['demo-blue'].edgeLabelFill,
    stroke: null
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: new Stroke(colorSets['demo-blue'].edgeLabelFill, 3)
  })
  // available port shapes
  const shapes = [
    'star5',
    'star6',
    'star8',
    'round-rectangle',
    'triangle-pointing-down',
    'triangle',
    'triangle-pointing-left',
    'triangle-pointing-right',
    'hexagon-standing',
    'hexagon',
    'diamond',
    'octagon',
    'octagon-standing',
    'rectangle',
    'pentagon',
    'ellipse'
  ]
  const colorSetNames = [
    'demo-blue',
    'demo-orange',
    'demo-red',
    'demo-green',
    'demo-purple',
    'demo-lightblue'
  ]
  /* iterate over all available port shapes and create ports */
  let x = 0
  let y = 0
  let i = 1
  let lastNode = null
  let currNode = null
  while (shapes.length > 0) {
    lastNode = currNode
    currNode = graph.createNode({ layout: [x, y, 145, 100] })
    const colorSet = colorSetNames[i % 6]
    // for each node, create two ports with the current port shape
    const portShape = shapes.pop()
    if (i % 4 !== 1) {
      const targetPort = graph.addPort({
        owner: currNode,
        locationParameter: FreeNodePortLocationModel.LEFT,
        style: createShapePortStyle(portShape, colorSet)
      })
      graph.createEdge({
        sourcePort: lastNode.ports.last(),
        targetPort: targetPort
      })
    }
    if (i % 4 !== 0) {
      graph.addPort({
        owner: currNode,
        locationParameter: FreeNodePortLocationModel.RIGHT,
        style: createShapePortStyle(portShape, colorSet)
      })
    }
    // add port shape as node label
    graph.addLabel(
      currNode,
      portShape,
      InteriorNodeLabelModel.CENTER,
      createDemoEdgeLabelStyle(colorSet)
    )
    // display 4 nodes in every row
    if (i % 4 === 0) {
      x = 0
      y += 200
    } else {
      x += 300
    }
    i++
  }
}
/**
 * Initializes the interactive behavior for this demo.
 */
function initializeInteraction(graphComponent) {
  graphComponent.inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowAddLabel: false,
    allowEditLabel: false
  })
  // provide port candidates for all existing ports
  graphComponent.graph.decorator.nodes.portCandidateProvider.addFactory(
    (node) => new CustomPortCandidateProvider(node)
  )
}
/**
 * This port candidate provider provides port candidates for the
 * ports of a node.
 */
class CustomPortCandidateProvider extends PortCandidateProviderBase {
  node
  /**
   * Creates a new instance of {@link CustomPortCandidateProvider}.
   * @param node The given node.
   */
  constructor(node) {
    super()
    this.node = node
  }
  /**
   * Returns a list that contains a port candidate for each of the node's
   * ports. Each candidate has the same location as the port.
   * @param context The context for which the candidates should be provided
   * @see Overrides {@link PortCandidateProviderBase.getPortCandidates}
   */
  getPortCandidates(context) {
    const candidates = new List()
    if (context.graph) {
      this.node.ports.forEach((port) => {
        const portCandidate = new PortCandidate(port)
        candidates.add(portCandidate)
      })
    }
    return candidates
  }
}
run().then(finishLoading)
