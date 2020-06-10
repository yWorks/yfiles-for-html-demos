/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorLabelModel,
  Font,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicNestingPolicy,
  ICanvasObjectDescriptor,
  ICommand,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  IVisualCreator,
  LabelLayerPolicy,
  License,
  NodeStylePortStyleAdapter,
  PanelNodeStyle,
  PanelNodeStyleRenderer,
  Point,
  PortLayerPolicy,
  ShapeNodeStyle,
  Size,
  SmartEdgeLabelModel,
  SvgVisual
} from 'yfiles'

import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Bootstraps the demo.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initDemoDefaults()

  // add a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Switches between pre-defined rendering order settings for common use cases.
 * Note: The settings may also be combined in different ways, too.
 */
function selectRenderingOrder(order) {
  const graphModelManager = graphComponent.graphModelManager

  // set to default first
  graphComponent.graphModelManager.labelLayerPolicy = LabelLayerPolicy.SEPARATE_LAYER
  graphComponent.graphModelManager.portLayerPolicy = PortLayerPolicy.SEPARATE_LAYER
  graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES_AND_EDGES
  graphModelManager.edgeGroup.below(graphModelManager.nodeGroup)

  if (order === 'at-owner') {
    graphComponent.graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER
    graphComponent.graphModelManager.portLayerPolicy = PortLayerPolicy.AT_OWNER
  } else if (order === 'edges-on-top') {
    graphComponent.graphModelManager.labelLayerPolicy = LabelLayerPolicy.AT_OWNER
    graphComponent.graphModelManager.portLayerPolicy = PortLayerPolicy.AT_OWNER
    graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES
    graphModelManager.edgeGroup.above(graphModelManager.nodeGroup)
  } else if (order === 'group-nodes') {
    graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.GROUP_NODES
  } else if (order === 'none') {
    graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NONE
  }
}

/**
 * Initializes the defaults for the styles in this demo.
 */
function initDemoDefaults() {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: '#eeff8c00',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word_ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      fill: 'darkblue',
      stroke: 'darkblue',
      shape: 'ellipse'
    })
  )
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgba(214, 229, 248, 0.9)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)',
    renderer: new GroupPanelNodeStyleRenderer()
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'center'
  })
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    5,
    0
  )
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: 'white',
    backgroundStroke: 'lightgrey',
    insets: [3, 5, 3, 5]
  })
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
 * Creates a sample graph with overlaping exterior node labels.
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
    new IVisualCreator({
      createVisual(ctx) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.x.baseVal.value = origin.x - 50
        rect.y.baseVal.value = origin.y - 20
        rect.width.baseVal.value = 210
        rect.height.baseVal.value = 250
        rect.setAttribute('fill', 'none')
        rect.setAttribute('stroke', 'gray')
        rect.setAttribute('stroke-width', '4px')
        rect.setAttribute('stroke-dasharray', '5,5')
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.textContent = "Try 'Default'"
        text.setAttribute('fill', 'gray')
        text.setAttribute('x', `${origin.x + 5}`)
        text.setAttribute('y', `${origin.y - 30}`)
        new Font({
          fontSize: 18,
          fontWeight: 'bold'
        }).applyTo(text)
        g.appendChild(rect)
        g.appendChild(text)
        return new SvgVisual(g)
      },
      updateVisual(ctx, oldVisual) {
        return oldVisual
      }
    }),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates a sample graph with overlapping nodes that have interior node labels.
 * @param origin
 * @returns {Visual}
 */
function createOverlappingNodeSample(origin) {
  const graph = graphComponent.graph

  // overlapping nodes
  const back1 = graph.createNode({
    layout: [origin.x, origin.y + 20, 50, 50],
    labels: 'Back'
  })
  graph.createNode({
    layout: [origin.x + 20, origin.y + 35, 50, 50],
    labels: 'Middle'
  })
  const front1 = graph.createNode({
    layout: [origin.x + 40, origin.y + 50, 50, 50],
    labels: 'Front'
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
  nodes.forEach(node => {
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
    new IVisualCreator({
      createVisual(ctx) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.x.baseVal.value = origin.x - 50
        rect.y.baseVal.value = origin.y - 20
        rect.width.baseVal.value = 310
        rect.height.baseVal.value = 250
        rect.setAttribute('fill', 'none')
        rect.setAttribute('stroke', 'gray')
        rect.setAttribute('stroke-width', '4px')
        rect.setAttribute('stroke-dasharray', '5,5')
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.textContent = "Try 'Labels/Ports At Owner'"
        text.setAttribute('fill', 'gray')
        text.setAttribute('x', `${origin.x - 15}`)
        text.setAttribute('y', `${origin.y - 30}`)
        new Font({
          fontSize: 18,
          fontWeight: 'bold'
        }).applyTo(text)
        g.appendChild(rect)
        g.appendChild(text)
        return new SvgVisual(g)
      },
      updateVisual(ctx, oldVisual) {
        return oldVisual
      }
    }),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates a sample graph with an edge that crosses a group node.
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
    new IVisualCreator({
      createVisual(ctx) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.x.baseVal.value = origin.x - 20
        rect.y.baseVal.value = origin.y - 20
        rect.width.baseVal.value = 340
        rect.height.baseVal.value = 250
        rect.setAttribute('fill', 'none')
        rect.setAttribute('stroke', 'gray')
        rect.setAttribute('stroke-width', '4px')
        rect.setAttribute('stroke-dasharray', '5,5')
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.textContent = "Try 'Edges on top' or 'Group Nodes'"
        text.setAttribute('fill', 'gray')
        text.setAttribute('x', `${origin.x - 5}`)
        text.setAttribute('y', `${origin.y - 30}`)
        new Font({
          fontSize: 18,
          fontWeight: 'bold'
        }).applyTo(text)
        g.appendChild(rect)
        g.appendChild(text)
        return new SvgVisual(g)
      },
      updateVisual(ctx, oldVisual) {
        return oldVisual
      }
    }),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates a sample graph with nested group nodes and edges.
 */
function createNestedGroupSample(origin) {
  const graph = graphComponent.graph

  const root = graph.createGroupNode({
    layout: [origin.x, origin.y, 230, 220],
    labels: 'Outer Group Node'
  })

  const outerChild1 = graph.createNode({
    parent: root,
    layout: [origin.x + 145, origin.y + 30, 50, 50],
    labels: 'Outer\nChild'
  })
  const outerChild2 = graph.createNode({
    parent: root,
    layout: [origin.x + 40, origin.y + 140, 50, 50],
    labels: 'Outer\nChild'
  })
  graph.createEdge({
    source: outerChild1,
    target: outerChild2,
    bends: [new Point(origin.x + 65, origin.y + 55)]
  })

  const childGroup = graph.createGroupNode({
    parent: root,
    layout: [origin.x + 20, origin.y + 50, 150, 150],
    labels: 'Inner Group Node'
  })
  const innerNode1 = graph.createNode({
    parent: childGroup,
    layout: [origin.x + 40, origin.y + 80, 50, 50],
    labels: 'Inner\nChild'
  })
  const innerNode2 = graph.createNode({
    parent: childGroup,
    layout: [origin.x + 100, origin.y + 140, 50, 50],
    labels: 'Inner\nChild'
  })
  graph.createEdge({
    source: innerNode1,
    target: innerNode2,
    bends: [new Point(origin.x + 125, origin.y + 105)]
  })

  graphComponent.backgroundGroup.addChild(
    new IVisualCreator({
      createVisual(ctx) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.x.baseVal.value = origin.x - 20
        rect.y.baseVal.value = origin.y - 20
        rect.width.baseVal.value = 280
        rect.height.baseVal.value = 250
        rect.setAttribute('fill', 'none')
        rect.setAttribute('stroke', 'gray')
        rect.setAttribute('stroke-width', '4px')
        rect.setAttribute('stroke-dasharray', '5,5')
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.textContent = 'Try different settings'
        text.setAttribute('fill', 'gray')
        text.setAttribute('x', `${origin.x + 20}`)
        text.setAttribute('y', `${origin.y - 30}`)
        new Font({
          fontSize: 18,
          fontWeight: 'bold'
        }).applyTo(text)
        g.appendChild(rect)
        g.appendChild(text)
        return new SvgVisual(g)
      },
      updateVisual(ctx, oldVisual) {
        return oldVisual
      }
    }),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the demo's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='ResetGraph']", () => {
    graphComponent.graph.clear()
    createGraph()
  })
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
  bindChangeListener("select[data-command='SelectRenderingOrder']", selectRenderingOrder)
}

/**
 * Create customized PanelNodeStyleRenderer which doesn't draw a drop shadow.
 */
class GroupPanelNodeStyleRenderer extends PanelNodeStyleRenderer {
  /**
   * @returns {boolean}
   */
  drawShadow() {
    return false
  }
}

loadJson().then(run)
