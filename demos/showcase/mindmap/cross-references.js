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
  ArcEdgeStyle,
  Arrow,
  ArrowType,
  BaseClass,
  DelegatingEdgeStyle,
  EdgePathLabelModel,
  EdgeSides,
  EdgeStyleIndicatorRenderer,
  FreeNodePortLocationModel,
  IHandleProvider,
  LabelStyle,
  List,
  PortCandidate,
  PortCandidateProviderBase
} from '@yfiles/yfiles'
import { getRoot } from './subtrees'
import { MindMapGraphModelManager } from './MindMapGraphModelManager'

/**
 * Runs all initialization required for the custom cross-reference edges.
 */
export function initializeCrossReferences(graphComponent) {
  // use a custom graph model manager that renders cross-reference edges above other nodes and edges
  graphComponent.graphModelManager = new MindMapGraphModelManager()

  const graph = graphComponent.graph
  const decorator = graph.decorator

  const inputMode = graphComponent.inputMode
  const createEdgeInputMode = inputMode.createEdgeInputMode
  createEdgeInputMode.enabled = false
  createEdgeInputMode.allowCreateBend = false
  // disable CreateEdgeInputMode after cross-reference edge has been created
  createEdgeInputMode.addEventListener('edge-created', async (evt) => {
    createEdgeInputMode.enabled = false
    graphComponent.currentItem = null
    void inputMode.editLabelInputMode.startLabelEditing(evt.item.labels.at(0))
  })
  createEdgeInputMode.addEventListener(
    'gesture-canceled',
    () => (createEdgeInputMode.enabled = false)
  )
  createEdgeInputMode.edgeCreator = createCrossReferenceEdge

  // disable all edge handles except for height handle
  decorator.edges.handleProvider.addFactory((edge) => new CrossReferenceEdgeHandleProvider(edge))

  const edgeDefaults = graph.edgeDefaults
  edgeDefaults.style = new ArcEdgeStyle({
    stroke: '8px #2e282a66',
    height: 50,
    targetArrow: new Arrow({ fill: '#2e282a', stroke: '6px #ABA9AA', type: ArrowType.TRIANGLE }),
    provideHeightHandle: true
  })
  // clone the style for each edge
  edgeDefaults.shareStyleInstance = false

  const labelModel = new EdgePathLabelModel({ offset: 20, sideOfEdge: EdgeSides.BELOW_EDGE })
  edgeDefaults.labels.layoutParameter = labelModel.createRatioParameter(0.5)

  edgeDefaults.labels.style = new LabelStyle({ font: '16px Arial', padding: [3, 5, 3, 5] })

  // initialize a custom selection style for edges
  graph.decorator.edges.selectionRenderer.addConstant(
    new EdgeStyleIndicatorRenderer({
      edgeStyle: new ArcEdgeSelectionStyle(
        new ArcEdgeStyle({
          stroke: '8px #f26419',
          height: 50,
          targetArrow: new Arrow({ fill: '#f26419', stroke: '6px #f26419', type: 'triangle' })
        })
      ),
      zoomPolicy: 'world-coordinates'
    })
  )

  // customize the port candidate provider
  // to ensure that cross-reference edges connect to the node center
  decorator.nodes.portCandidateProvider.addFactory(
    (node) =>
      new (class extends PortCandidateProviderBase {
        getPortCandidates(_context) {
          return List.fromArray([new PortCandidate(node, FreeNodePortLocationModel.CENTER)])
        }
      })()
  )
}

/**
 * Creates a cross-reference edge.
 * @param context The given context.
 * @param graph The input graph.
 * @param sourceCandidate The source port candidate.
 * @param targetCandidate The target port candidate.
 * @param previewEdge The temporary edge that serves as template for the actual
 * edge creation.
 * @returns The newly created cross-reference edge.
 */
export function createCrossReferenceEdge(
  context,
  graph,
  sourceCandidate,
  targetCandidate,
  previewEdge
) {
  if (!targetCandidate) {
    // cancel if the target candidate is missing
    return null
  }
  // get the source and target ports from the candidates
  const sourcePort = sourceCandidate.port || sourceCandidate.createPort(context)
  const targetPort = targetCandidate.port || targetCandidate.createPort(context)

  // adjust the direction of the arc when the source/target node is the root
  if (previewEdge.style instanceof ArcEdgeStyle) {
    const root = getRoot(graph)
    const sourcePortLocation = sourcePort.location
    const targetPortLocation = targetPort.location
    const edgeAtRoot =
      sourcePortLocation.equals(root.layout.center) || targetPortLocation.equals(root.layout.center)

    if (edgeAtRoot) {
      const otherPoint = sourcePortLocation.equals(root.layout.center)
        ? targetPortLocation
        : sourcePortLocation
      const height = previewEdge.style.height
      const isTopLeft = otherPoint.x > root.layout.x && otherPoint.y <= root.layout.center.y
      const isBottomRight = otherPoint.x < root.layout.x && otherPoint.y > root.layout.center.y
      const rootIsSource = otherPoint.equals(sourcePortLocation)
      if (isTopLeft || isBottomRight) {
        previewEdge.style.height = rootIsSource ? -height : height
      } else {
        previewEdge.style.height = rootIsSource ? height : -height
      }
    }
  }

  // create the edge between the source and target port
  return graph.createEdge({
    sourcePort,
    targetPort,
    style: previewEdge.style,
    tag: { type: 'cross-reference' },
    labels: ['']
  })
}

/**
 * This class provides style-handles for cross-reference-edges.
 * All other handle types (move, ...) are not provided and thus disabled.
 */
class CrossReferenceEdgeHandleProvider extends BaseClass(IHandleProvider) {
  edge
  constructor(edge) {
    super()
    this.edge = edge
  }

  getHandles(inputModeContext) {
    const renderer = this.edge.style.renderer
    const context = renderer.getContext(this.edge, this.edge.style)
    return context.lookup(IHandleProvider)?.getHandles(inputModeContext) ?? new List()
  }
}

/**
 * An arc edge style used for the edge selection.
 */
class ArcEdgeSelectionStyle extends DelegatingEdgeStyle {
  delegatingEdgeStyle
  constructor(delegatingEdgeStyle) {
    super()
    this.delegatingEdgeStyle = delegatingEdgeStyle
  }

  getStyle(edge) {
    const delegatingStyle = this.delegatingEdgeStyle
    if (delegatingStyle instanceof ArcEdgeStyle) {
      // Take the height of the edge's actual style and assign
      // it to the style instance used by this renderer
      delegatingStyle.height = edge.style.height
    }
    return delegatingStyle
  }
}
