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
  BaseClass,
  ExteriorLabelModel,
  Font,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicNestingPolicy,
  ICanvasObjectDescriptor,
  IRenderContext,
  IVisualCreator,
  LabelLayerPolicy,
  License,
  NodeStylePortStyleAdapter,
  Point,
  PortLayerPolicy,
  ShapeNodeStyle,
  Size,
  SmartEdgeLabelModel,
  SvgVisual,
  Visual
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/** @type {GraphComponent} */
let graphComponent

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initDemoDefaults()

  // add a sample graph
  createGraph()

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Switches between pre-defined rendering order settings for common use cases.
 * Note: The settings may also be combined in different ways, too.
 * @param {!string} order
 */
function selectRenderingOrder(order) {
  const graphModelManager = graphComponent.graphModelManager

  // set to default first
  graphModelManager.labelLayerPolicy = LabelLayerPolicy.SEPARATE_LAYER
  graphModelManager.portLayerPolicy = PortLayerPolicy.SEPARATE_LAYER
  graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES_AND_EDGES
  graphModelManager.edgeGroup.below(graphModelManager.nodeGroup)

  switch (order) {
    case 'at-owner':
      graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER
      graphModelManager.portLayerPolicy = PortLayerPolicy.AT_OWNER
      break
    case 'edges-on-top':
      graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER
      graphModelManager.portLayerPolicy = PortLayerPolicy.AT_OWNER
      graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES
      graphModelManager.edgeGroup.above(graphModelManager.nodeGroup)
      break
    case 'group-nodes':
      graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.GROUP_NODES
      break
    case 'none':
      graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NONE
      break
  }
}

/**
 * Initializes the defaults for the styles in this demo.
 */
function initDemoDefaults() {
  const graph = graphComponent.graph
  initDemoStyles(graph)
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      fill: '#111D4A',
      shape: 'ellipse'
    })
  )
}

/**
 * Creates a the sample graph.
 */
function createGraph() {
  createOverlappingLabelSample(new Point(-290, 0))
  createOverlappingNodeSample(new Point(10, 0))
  createOverlappingEdgeSample(new Point(370, 0))
  createNestedGroupSample(new Point(800, 0))
  graphComponent.fitGraphBounds()
  graphComponent.graph.undoEngine.clear()
}

/**
 * Creates a sample graph with overlapping exterior node labels.
 * @param {!Point} origin
 */
function createOverlappingLabelSample(origin) {
  const graph = graphComponent.graph
  graph.createNode({
    layout: [origin.x, origin.y + 50, 50, 50],
    labels: [{ text: 'External Node Label 1', layoutParameter: ExteriorLabelModel.SOUTH }]
  })
  graph.createNode({
    layout: [origin.x + 60, origin.y + 80, 50, 50],
    labels: [{ text: 'External Node Label 2', layoutParameter: ExteriorLabelModel.SOUTH }]
  })

  graphComponent.backgroundGroup.addChild(
    new RectangleBorder(
      new Point(origin.x - 50, origin.y - 20),
      new Size(210, 250),
      new Point(origin.x + 5, origin.y - 30),
      "Try 'Default'"
    ),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates a sample graph with overlapping nodes that have interior node labels.
 * @param {!Point} origin
 */
function createOverlappingNodeSample(origin) {
  const graph = graphComponent.graph

  // overlapping nodes
  const back1 = graph.createNode({
    layout: [origin.x, origin.y + 20, 50, 50],
    labels: ['Back']
  })
  graph.createNode({
    layout: [origin.x + 20, origin.y + 35, 50, 50],
    labels: ['Middle']
  })
  const front1 = graph.createNode({
    layout: [origin.x + 40, origin.y + 50, 50, 50],
    labels: ['Front']
  })

  // overlapping nodes with ports
  const back2 = graph.createNode({
    layout: [origin.x + 120, origin.y + 20, 50, 50]
  })
  const middle2 = graph.createNode({
    layout: [origin.x + 140, origin.y + 35, 50, 50]
  })
  const front2 = graph.createNode({
    layout: [origin.x + 160, origin.y + 50, 50, 50]
  })
  const nodes = [back2, middle2, front2]
  nodes.forEach((node) => {
    graph.addPort(node, FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED)
    graph.addPort(node, FreeNodePortLocationModel.NODE_TOP_ANCHORED)
    graph.addPort(node, FreeNodePortLocationModel.NODE_LEFT_ANCHORED)
    graph.addPort(node, FreeNodePortLocationModel.NODE_RIGHT_ANCHORED)
  })

  const edge1 = graph.createEdge({
    source: back1,
    target: back2,
    bends: [new Point(origin.x + 25, origin.y + 185), new Point(origin.x + 145, origin.y + 185)]
  })
  graph.addLabel({
    owner: edge1,
    text: 'Edge Label',
    layoutParameter: new SmartEdgeLabelModel().createParameterFromSource(1)
  })
  graph.setRelativePortLocation(edge1.sourcePort, new Point(0, 25))
  const edge2 = graph.createEdge({
    source: front1,
    target: front2,
    bends: [new Point(origin.x + 65, origin.y + 190), new Point(origin.x + 185, origin.y + 190)]
  })
  graph.setRelativePortLocation(edge2.sourcePort, new Point(0, 25))

  graphComponent.backgroundGroup.addChild(
    new RectangleBorder(
      new Point(origin.x - 50, origin.y - 20),
      new Size(310, 250),
      new Point(origin.x - 15, origin.y - 30),
      "Try 'Labels/Ports At Owner'"
    ),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates a sample graph with an edge that crosses a group node.
 * @param {!Point} origin
 */
function createOverlappingEdgeSample(origin) {
  const graph = graphComponent.graph

  const srcNode = graph.createNode({
    layout: [origin.x, origin.y + 60, 50, 50]
  })
  const tgtNode1 = graph.createNode({
    layout: [origin.x + 250, origin.y + 60, 50, 50]
  })
  const tgtNode2 = graph.createNode({
    layout: [origin.x + 122.5, origin.y + 130, 50, 50]
  })
  const groupNode = graph.createGroupNode({
    layout: [origin.x + 85, origin.y, 125, 200]
  })
  graph.addLabel(groupNode, 'Group Node')
  graph.setParent(tgtNode2, groupNode)

  const edge = graph.createEdge({
    source: srcNode,
    target: tgtNode1
  })
  graph.addLabel({
    owner: edge,
    text: 'Edge Label'
  })
  graph.createEdge({
    source: srcNode,
    target: tgtNode2,
    bends: [new Point(origin.x + 25, origin.y + 155)]
  })

  graphComponent.backgroundGroup.addChild(
    new RectangleBorder(
      new Point(origin.x - 20, origin.y - 20),
      new Size(340, 250),
      new Point(origin.x - 5, origin.y - 30),
      "'Edges on top' or 'Group Nodes'"
    ),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates a sample graph with nested group nodes and edges.
 * @param {!Point} origin
 */
function createNestedGroupSample(origin) {
  const graph = graphComponent.graph

  const root = graph.createGroupNode({
    layout: [origin.x, origin.y, 230, 220],
    labels: ['Outer Group Node']
  })

  const outerChild1 = graph.createNode({
    parent: root,
    layout: [origin.x + 145, origin.y + 30, 50, 50],
    labels: ['Outer\nChild']
  })
  const outerChild2 = graph.createNode({
    parent: root,
    layout: [origin.x + 40, origin.y + 140, 50, 50],
    labels: ['Outer\nChild']
  })
  graph.createEdge({
    source: outerChild1,
    target: outerChild2,
    bends: [new Point(origin.x + 65, origin.y + 55)]
  })

  const childGroup = graph.createGroupNode({
    parent: root,
    layout: [origin.x + 20, origin.y + 50, 150, 150],
    labels: ['Inner Group Node']
  })
  const innerNode1 = graph.createNode({
    parent: childGroup,
    layout: [origin.x + 40, origin.y + 80, 50, 50],
    labels: ['Inner\nChild']
  })
  const innerNode2 = graph.createNode({
    parent: childGroup,
    layout: [origin.x + 100, origin.y + 140, 50, 50],
    labels: ['Inner\nChild']
  })
  graph.createEdge({
    source: innerNode1,
    target: innerNode2,
    bends: [new Point(origin.x + 125, origin.y + 105)]
  })

  graphComponent.backgroundGroup.addChild(
    new RectangleBorder(
      new Point(origin.x - 20, origin.y - 20),
      new Size(280, 250),
      new Point(origin.x + 20, origin.y - 30),
      'Try different settings'
    ),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Binds the actions to the buttons in the demo's toolbar.
 */
function initializeUI() {
  addNavigationButtons(document.querySelector('#select-rendering-order')).addEventListener(
    'change',
    (evt) => {
      const value = evt.target.value
      selectRenderingOrder(value)
    }
  )
}

/**
 * Creates a boundary rectangle with a title for a sample graph.
 */
class RectangleBorder extends BaseClass(IVisualCreator) {
  /**
   * @param {!Point} rectOrigin the position where to draw the rectangle
   * @param {!Size} size   the size of the rectangle
   * @param {!Point} titleOrigin the position where to draw the title
   * @param {!string} title  the content of the label above the rectangle
   */
  constructor(rectOrigin, size, titleOrigin, title) {
    super()
    this.title = title
    this.titleOrigin = titleOrigin
    this.size = size
    this.rectOrigin = rectOrigin
  }

  /**
   * @param {!IRenderContext} ctx
   * @returns {!SvgVisual}
   */
  createVisual(ctx) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.x.baseVal.value = this.rectOrigin.x
    rect.y.baseVal.value = this.rectOrigin.y
    rect.width.baseVal.value = this.size.width
    rect.height.baseVal.value = this.size.height
    rect.setAttribute('fill', 'none')
    rect.setAttribute('stroke', 'gray')
    rect.setAttribute('stroke-width', '4px')
    rect.setAttribute('stroke-dasharray', '5,5')
    container.appendChild(rect)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = this.title
    text.setAttribute('fill', 'gray')
    text.setAttribute('x', `${this.titleOrigin.x}`)
    text.setAttribute('y', `${this.titleOrigin.y}`)
    new Font({ fontSize: 18, fontWeight: 'bold' }).applyTo(text)
    container.appendChild(text)

    return new SvgVisual(container)
  }

  /**
   * @param {!IRenderContext} ctx
   * @param {!Visual} oldVisual
   * @returns {!Visual}
   */
  updateVisual(ctx, oldVisual) {
    return oldVisual
  }
}

run().then(finishLoading)
