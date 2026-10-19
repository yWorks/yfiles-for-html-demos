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
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphModelManager,
  type IEnumerable,
  type IGraph,
  type IInputModeContext,
  type INode,
  InteriorNodeLabelModel,
  type IPortCandidate,
  LabelStyle,
  License,
  List,
  PolylineEdgeStyle,
  PortCandidate,
  PortCandidateProviderBase,
  type ShapeNodeShapeStringValues,
  ShapeNodeStyle,
  ShapePortStyle,
  Size,
  Stroke,
  WebGLGraphModelManager,
  WebGLLabelStyle,
  WebGLLabelStyleDecorator
} from '@yfiles/yfiles'

import {
  colorSets,
  type ColorSetName,
  createDemoEdgeLabelStyle
} from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/modern/finish-loading'
import { initializeSvgWebGlSwitchButton } from '@yfiles/demo-app/modern/svg-webgl-switch'
import { BrowserDetection } from '@yfiles/demo-utils/BrowserDetection'

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData
  const graphComponent = new GraphComponent('#graphComponent')
  graphComponent.graphModelManager = BrowserDetection.webGL2
    ? new WebGLGraphModelManager({ renderMode: 'svg' })
    : new GraphModelManager()

  graphComponent.contentMargins = [90, 10, 40, 10]
  initializeStyleDefaults(graphComponent.graph)

  // Create and configure ports using shape port style
  createSampleNodes(graphComponent.graph)

  configureInteraction(graphComponent)

  await graphComponent.fitGraphBounds()

  initializeSvgWebGlSwitchButton('#styleTypeChooser', graphComponent)
}

/**
 * Creates a new shape port style with the provided shape and color.
 */
function createShapePortStyle(
  portShape: ShapeNodeShapeStringValues,
  colorSet: ColorSetName
): ShapePortStyle {
  return new ShapePortStyle({
    shape: portShape,
    fill: colorSets[colorSet].fill,
    renderSize: new Size(20, 20),
    stroke: null
  })
}

/**
 * Initializes the style defaults for labels and edges.
 */
function initializeStyleDefaults(graph: IGraph): void {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: colorSets['demo-blue'].edgeLabelFill,
    stroke: null
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: new Stroke(colorSets['demo-blue'].edgeLabelFill, 3)
  })
}

/**
 * Creates several nodes for each {@link ShapeNodeShape} value.
 * @param graph The graph to add the nodes to.
 */
function createSampleNodes(graph: IGraph): void {
  // available port shapes
  const shapes: ShapeNodeShapeStringValues[] = [
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
    'ellipse',
    'squircle'
  ]

  const colorSetNames: ColorSetName[] = [
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
  let lastNode: INode | null = null
  let currNode: INode | null = null
  while (shapes.length > 0) {
    lastNode = currNode
    currNode = graph.createNode({ layout: [x, y, 145, 100] })
    const colorSet = colorSetNames[i % 6]

    // for each node, create two ports with the current port shape
    const portShape = shapes.pop()!
    if (i % 4 !== 1) {
      const targetPort = graph.addPort({
        owner: currNode,
        locationParameter: FreeNodePortLocationModel.LEFT,
        style: createShapePortStyle(portShape, colorSet)
      })
      graph.createEdge({ sourcePort: lastNode!.ports.last()!, targetPort: targetPort })
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

    if (
      portShape === 'star5' ||
      portShape === 'star6' ||
      portShape === 'star8' ||
      portShape === 'pentagon' ||
      portShape === 'octagon-standing'
    ) {
      graph.addLabel(
        currNode,
        'Not supported in WebGL',
        InteriorNodeLabelModel.BOTTOM,
        new WebGLLabelStyleDecorator(
          new LabelStyle({ textFill: 'transparent' }),
          new WebGLLabelStyle({ textColor: 'gray' })
        )
      )
    }

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
 * Configures the interactive behavior for this demo.
 */
function configureInteraction(graphComponent: GraphComponent): void {
  graphComponent.inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowAddLabel: false,
    allowEditLabel: false
  })

  // provide port candidates for all existing ports
  graphComponent.graph.decorator.nodes.portCandidateProvider.addFactory(
    (node) => new CustomPortCandidateProvider(node)
  )

  graphComponent.graph.decorator.ports.handleProvider.hide()
}

/**
 * This port candidate provider provides port candidates for the
 * ports of a node.
 */
class CustomPortCandidateProvider extends PortCandidateProviderBase {
  private readonly node: INode

  /**
   * Creates a new instance of {@link CustomPortCandidateProvider}.
   * @param node The given node.
   */
  constructor(node: INode) {
    super()
    this.node = node
  }

  /**
   * Returns a list that contains a port candidate for each of the node's
   * ports. Each candidate has the same location as the port.
   * @param context The context for which the candidates should be provided
   * @see Overrides {@link PortCandidateProviderBase.getPortCandidates}
   */
  getPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    const candidates = new List<IPortCandidate>()
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
