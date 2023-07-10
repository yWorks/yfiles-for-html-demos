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
  ArcEdgeStyle,
  ArcEdgeStyleRenderer,
  Arrow,
  ArrowType,
  BaseClass,
  DefaultLabelStyle,
  DefaultPortCandidate,
  EdgePathLabelModel,
  EdgeSides,
  FreeNodePortLocationModel,
  GraphSelectionIndicatorManager,
  IHandleProvider,
  List,
  PortCandidateProviderBase
} from 'yfiles'
import { MindMapGraphModelManager } from './MindMapGraphModelManager.js'
import { getRoot } from './subtrees.js'

/**
 * Runs all initialization required for the custom cross-reference edges.
 * @param {!GraphComponent} graphComponent
 */
export function initializeCrossReferences(graphComponent) {
  // use a custom graph model manager that renders cross-reference edges above other nodes and edges
  graphComponent.graphModelManager = new MindMapGraphModelManager(graphComponent)

  const graph = graphComponent.graph
  const decorator = graph.decorator

  const inputMode = graphComponent.inputMode
  const createEdgeInputMode = inputMode.createEdgeInputMode
  createEdgeInputMode.enabled = false
  createEdgeInputMode.allowCreateBend = false
  // disable CreateEdgeInputMode after cross-reference edge has been created
  createEdgeInputMode.addEdgeCreatedListener(async (sender, evt) => {
    createEdgeInputMode.enabled = false
    graphComponent.currentItem = null
    void inputMode.editLabel(evt.item.labels.at(0))
  })
  createEdgeInputMode.addGestureCanceledListener(() => (createEdgeInputMode.enabled = false))
  createEdgeInputMode.edgeCreator = createCrossReferenceEdge

  // disable all edge handles except for height handle
  decorator.edgeDecorator.handleProviderDecorator.setFactory(
    edge => new CrossReferenceEdgeHandleProvider(edge)
  )

  const edgeDefaults = graph.edgeDefaults
  edgeDefaults.style = new ArcEdgeStyle({
    stroke: '8px #662e282a',
    height: 50,
    targetArrow: new Arrow({
      fill: '#2e282a',
      stroke: '6px #ABA9AA',
      type: ArrowType.TRIANGLE
    }),
    provideHeightHandle: true
  })
  // clone the style for each edge
  edgeDefaults.shareStyleInstance = false

  const labelModel = new EdgePathLabelModel({ offset: 20, sideOfEdge: EdgeSides.BELOW_EDGE })
  edgeDefaults.labels.layoutParameter = labelModel.createRatioParameter(0.5)

  edgeDefaults.labels.style = new DefaultLabelStyle({
    font: '16px Arial',
    insets: [3, 5, 3, 5]
  })

  // initialize a custom selection style for edges
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    edgeStyle: new ArcEdgeStyle({
      renderer: new (class ArcEdgeHighlightStyle extends ArcEdgeStyleRenderer {
        configure() {
          if (this.edge.style instanceof ArcEdgeStyle) {
            // Take the height of the edge's actual style and assign
            // it to the style instance used by this renderer
            this.style.height = this.edge.style.height
          }
          super.configure()
        }
      })(),
      stroke: '8px #f26419',
      height: 50,
      targetArrow: new Arrow({
        fill: '#f26419',
        stroke: '6px #f26419',
        type: 'triangle'
      })
    })
  })

  // customize the port candidate provider
  // to ensure that cross-reference edges connect to the node center
  decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    node =>
      new (class extends PortCandidateProviderBase {
        /**
         * @param {!IInputModeContext} context
         * @returns {!IEnumerable.<IPortCandidate>}
         */
        getPortCandidates(context) {
          return List.fromArray([
            new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
          ])
        }
      })()
  )
}

/**
 * Creates a cross-reference edge.
 * @param {!IInputModeContext} context The given context.
 * @param {!IGraph} graph The input graph.
 * @param {!IPortCandidate} sourceCandidate The source port candidate.
 * @param {?IPortCandidate} targetCandidate The target port candidate.
 * @param {!IEdge} dummyEdge The temporary edge that serves as template for the actual
 * edge creation.
 * @returns {?IEdge} The newly created cross-reference edge.
 */
export function createCrossReferenceEdge(
  context,
  graph,
  sourceCandidate,
  targetCandidate,
  dummyEdge
) {
  if (!targetCandidate) {
    // cancel if the target candidate is missing
    return null
  }
  // get the source and target ports from the candidates
  const sourcePort = sourceCandidate.port || sourceCandidate.createPort(context)
  const targetPort = targetCandidate.port || targetCandidate.createPort(context)

  // adjust the direction of the arc when the source/target node is the root
  if (dummyEdge.style instanceof ArcEdgeStyle) {
    const root = getRoot(graph)
    const sourcePortLocation = sourcePort.location
    const targetPortLocation = targetPort.location
    const edgeAtRoot =
      sourcePortLocation.equals(root.layout.center) || targetPortLocation.equals(root.layout.center)

    if (edgeAtRoot) {
      const otherPoint = sourcePortLocation.equals(root.layout.center)
        ? targetPortLocation
        : sourcePortLocation
      const height = dummyEdge.style.height
      const isTopLeft = otherPoint.x > root.layout.x && otherPoint.y <= root.layout.center.y
      const isBottomRight = otherPoint.x < root.layout.x && otherPoint.y > root.layout.center.y
      const rootIsSource = otherPoint.equals(sourcePortLocation)
      if (isTopLeft || isBottomRight) {
        dummyEdge.style.height = rootIsSource ? -height : height
      } else {
        dummyEdge.style.height = rootIsSource ? height : -height
      }
    }
  }

  // create the edge between the source and target port
  return graph.createEdge({
    sourcePort,
    targetPort,
    style: dummyEdge.style,
    tag: { type: 'cross-reference' },
    labels: ['']
  })
}

/**
 * This class provides style-handles for cross-reference-edges.
 * All other handle types (move, ...) are not provided and thus disabled.
 */
class CrossReferenceEdgeHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * @param {!IEdge} edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * @param {!IInputModeContext} inputModeContext
   * @returns {!IEnumerable.<IHandle>}
   */
  getHandles(inputModeContext) {
    const renderer = this.edge.style.renderer
    const styleHandleProvider = renderer.lookup(IHandleProvider.$class)
    if (styleHandleProvider) {
      return styleHandleProvider.getHandles(inputModeContext)
    }
    return new List()
  }
}
