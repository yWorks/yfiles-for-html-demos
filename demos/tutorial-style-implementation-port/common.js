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
  BaseClass,
  CreateEdgeInputMode,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IPort,
  IPortCandidateProvider,
  IVisualCreator,
  LabelStyle,
  MouseWheelBehaviors,
  PointerType,
  PolylineEdgeStyle,
  ScrollBarVisibility,
  ShapeNodeStyle,
  SvgVisual
} from '@yfiles/yfiles'
import { CustomPortStyle } from './05-hit-testing/CustomPortStyle'
export function createSimpleGraph(graph) {
  const node1 = graph.createNode()
  const node2 = graph.createNode({
    layout: [100, 200, 30, 30]
  })
  graph.createEdge({ source: node1, target: node2 })
}
export function createSampleGraphColoring(graph) {
  const nodeCount = 20
  const r = 200
  for (let i = 0; i < nodeCount; i++) {
    const x = Math.cos((i / nodeCount) * Math.PI * 2) * r
    const y = Math.sin((i / nodeCount) * Math.PI * 2) * r
    const node = graph.createNodeAt([x, y])
    graph.addPort({
      owner: node,
      locationParameter: FreeNodePortLocationModel.CENTER
    })
  }
  for (let i = 1; i < nodeCount; i++) {
    const sourceNode = graph.nodes.get(i)
    for (let k = nodeCount * 0.5; i + k <= nodeCount; k++) {
      const targetNode = graph.nodes.get((i + k) % nodeCount)
      graph.createEdge(sourceNode.ports.get(0), targetNode.ports.get(0))
    }
  }
  const node1 = graph.createNodeAt([-200, -200])
  graph.addPort({
    owner: node1,
    locationParameter: FreeNodePortLocationModel.CENTER,
    tag: { color: '#9e7cb5' }
  })
  const node2 = graph.createNodeAt([200, -200])
  graph.addPort({
    owner: node2,
    locationParameter: FreeNodePortLocationModel.CENTER,
    tag: { color: '#9e7cb5' }
  })
  const node3 = graph.createNodeAt([-200, 200])
  graph.addPort({
    owner: node3,
    locationParameter: FreeNodePortLocationModel.CENTER,
    tag: { color: '#9e7cb5' }
  })
  const node4 = graph.createNodeAt([200, 200])
  graph.addPort({
    owner: node4,
    locationParameter: FreeNodePortLocationModel.CENTER,
    tag: { color: '#9e7cb5' }
  })
}
export function createSampleGraphIsHit(graph, oldCustomPortStyle) {
  const redNodeStyle = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#b91c3b',
    stroke: '#042d37'
  })
  const node3 = graph.createNode({
    layout: [0, 0, 40, 40],
    style: redNodeStyle
  })
  const node4 = graph.createNode({
    layout: [100, 150, 40, 40],
    style: redNodeStyle
  })
  const port3 = graph.addPort(node3, FreeNodePortLocationModel.CENTER, oldCustomPortStyle)
  const port4 = graph.addPort(node4, FreeNodePortLocationModel.CENTER, oldCustomPortStyle)
  graph.createEdge({ sourcePort: port3, targetPort: port4 })
  const node1 = graph.createNode([100, 0, 40, 40])
  const node2 = graph.createNode([200, 150, 40, 40])
  graph.createEdge({ source: node1, target: node2 })
}
export function createSampleGraphEdgeCropping(graph) {
  const node1 = graph.createNode([100, 0, 40, 40])
  const node2 = graph.createNode([100, 80, 40, 40])
  addPorts(graph, node1)
  addPorts(graph, node2)
  graph.createEdge({
    sourcePort: node1.ports.get(1),
    targetPort: node2.ports.get(0)
  })
}
function addPorts(graph, node) {
  graph.addPort({
    owner: node,
    locationParameter: FreeNodePortLocationModel.TOP,
    tag: { color: 'rgba(108,159,68,0.5)' }
  })
  graph.addPort({
    owner: node,
    locationParameter: FreeNodePortLocationModel.BOTTOM,
    tag: { color: 'rgba(108,159,68,0.5)' }
  })
  graph.addPort({
    owner: node,
    locationParameter: FreeNodePortLocationModel.RIGHT,
    tag: { color: 'rgba(108,159,68,0.5)' }
  })
  graph.addPort({
    owner: node,
    locationParameter: FreeNodePortLocationModel.LEFT,
    tag: { color: 'rgba(108,159,68,0.5)' }
  })
}
export function enableGraphEditing(graphComponent) {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowAddLabel: false,
    allowCreateNode: false,
    createEdgeInputMode: new CreateEdgeInputMode({
      startOverCandidateOnly: true
    })
  })
  graphComponent.inputMode = graphEditorInputMode
  graphComponent.graph.nodeDefaults.ports.autoCleanUp = false
  graphComponent.graph.decorator.nodes.portCandidateProvider.addFactory((node) =>
    IPortCandidateProvider.fromExistingPorts(node)
  )
  return graphEditorInputMode
}
export function addHoverEffect(graphComponent, inputMode) {
  const itemHoverInputMode = inputMode.itemHoverInputMode
  itemHoverInputMode.hoverItems = GraphItemTypes.PORT
  let hoveredItemHighlight = null
  function addHighlight(port) {
    hoveredItemHighlight = graphComponent.renderTree.createElement(
      graphComponent.renderTree.inputModeGroup,
      new (class extends BaseClass(IVisualCreator) {
        createVisual(context) {
          let el
          if (port.style instanceof CustomPortStyle) {
            const { x, y } = port.location
            const ellipseElement = (el = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'ellipse'
            ))
            ellipseElement.setAttribute('cx', String(x))
            ellipseElement.setAttribute('cy', String(y))
            const radius = port.style.size * 0.5
            ellipseElement.setAttribute('rx', String(radius))
            ellipseElement.setAttribute('ry', String(radius))
          } else {
            const { x, y, width, height } = port.style.renderer
              .getBoundsProvider(port, port.style)
              .getBounds(context)
            const rect = (el = document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
            rect.x.baseVal.value = x
            rect.y.baseVal.value = y
            rect.width.baseVal.value = width
            rect.height.baseVal.value = height
          }
          el.setAttribute('fill', '#ffd400')
          el.setAttribute('fill-opacity', '0.8')
          return new SvgVisual(el)
        }
        updateVisual(context, oldVisual) {
          return this.createVisual(context)
        }
      })()
    )
  }
  function removeHighlight() {
    if (hoveredItemHighlight) {
      graphComponent.renderTree.remove(hoveredItemHighlight)
      hoveredItemHighlight = null
    }
  }
  itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    removeHighlight()
    if (evt.item instanceof IPort) {
      addHighlight(evt.item)
    }
  })
  inputMode.addEventListener('item-clicked', (evt) => {
    if (evt.pointerType !== PointerType.TOUCH) {
      return
    }
    removeHighlight()
    if (evt.item instanceof IPort) {
      addHighlight(evt.item)
      setTimeout(() => removeHighlight(), 1000)
    }
  })
}
export function initializeInlineGraphComponent(selector) {
  const graphComponent = new GraphComponent(selector)
  graphComponent.horizontalScrollBarPolicy = graphComponent.verticalScrollBarPolicy =
    ScrollBarVisibility.HIDDEN
  graphComponent.autoScrollOnBounds = false
  graphComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE
  initializeTutorialDefaults(graphComponent)
  return graphComponent
}
/**
 * Initializes the default styles for nodes, edges, and labels.
 */
export function initializeTutorialDefaults(graphComponent) {
  graphComponent.focusIndicatorManager.enabled = false
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  graph.nodeDefaults.labels.style = new LabelStyle({
    shape: 'round-rectangle',
    textFill: '#042d37',
    backgroundFill: '#9dc6d0',
    padding: 2,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #0b7189',
    targetArrow: '#0b7189 medium triangle'
  })
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#111d4a',
    contentAreaPadding: 10
  })
}
/**
 * Fits the graph into the graph component with a minimum zoom value.
 * The graph will be slightly zoomed in to avoid that small graphs are displayed too small.
 */
export function fitGraphBounds(graphComponent, minimumZoom = 3) {
  graphComponent.limitFitContentZoom = false
  void graphComponent.fitGraphBounds()
  graphComponent.zoom = Math.min(graphComponent.zoom, minimumZoom)
}
