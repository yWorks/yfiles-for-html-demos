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
import {
  Font,
  GraphComponent,
  GraphEditorInputMode,
  HorizontalTextAlignment,
  ICommand,
  InteriorStretchLabelModel,
  License,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  Size,
  SmartEdgeLabelModel,
  TextWrapping
} from 'yfiles'

import { MarkdownLabelStyle } from './MarkdownLabelStyle.js'
import { bindCommand, showApp } from '../../resources/demo-app.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * Simple demo that shows how to use MarkupLabelStyle to render labels.
 * The label text shows how to create headings, strong and emphasis text and line breaks,
 * and also how to style those elements using inline CSS.
 * The stylesheet CSS shows how to style label elements using external CSS.
 * The label style uses interactive text wrapping, which means you can resize nodes interactively
 * and the label text will be wrapped at word boundaries.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize graph component
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext()
  })

  const graph = graphComponent.graph
  // set the defaults for nodes
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px solid #66a3e0',
    targetArrow: '#66a3e0 x-large triangle',
    smoothingLength: 30
  })
  graph.nodeDefaults.size = new Size(385, 250)
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
    autoRotation: false
  }).createDefaultParameter()

  // node labels get markup label support
  const font = new Font('Verdana,sans-serif', 12)
  graph.nodeDefaults.labels.style = new MarkdownLabelStyle({
    font: font,
    horizontalTextAlignment: HorizontalTextAlignment.LEFT,
    backgroundFill: '#fff',
    backgroundStroke: '3px #66a3e0',
    wrapping: TextWrapping.WORD_ELLIPSIS,
    insets: [10]
  })
  graph.edgeDefaults.labels.style = new MarkdownLabelStyle({
    font: font,
    backgroundFill: '#fff',
    backgroundStroke: '2px #66a3e0',
    insets: [5]
  })

  // create a graph
  const graphNode = graph.createNodeAt([175, 125])
  const nodeNode = graph.createNodeAt([175, 500])
  const edgeNode = graph.createNodeAt([1175, 500])
  const labelNode = graph.createNodeAt([675, 875])
  const portNode = graph.createNodeAt([675, 500])
  const bendNode = graph.createNodeAt([1725, 500])
  graph.createEdge({ source: graphNode, target: nodeNode, labels: ['#### nodes'] })
  graph.createEdge({
    source: graphNode,
    target: edgeNode,
    labels: ['#### edges'],
    bends: [new Point(1175, 125)]
  })
  graph.createEdge({ source: nodeNode, target: portNode, labels: ['#### ports'] })
  graph.createEdge({
    source: nodeNode,
    target: labelNode,
    labels: ['#### labels'],
    bends: [new Point(175, 875)]
  })
  graph.createEdge({ source: edgeNode, target: portNode, labels: ['#### ports'] })
  graph.createEdge({
    source: edgeNode,
    target: labelNode,
    labels: ['#### labels'],
    bends: [new Point(1175, 875)]
  })
  graph.createEdge({ source: edgeNode, target: bendNode, labels: ['#### bends'] })
  graph.createEdge({ source: portNode, target: labelNode, labels: ['#### labels'] })

  // add markdown labels to the nodes
  graph.addLabel(
    graphNode,
    `## IGraph
*interface*\\
Central interface that models a graph which can be displayed in a **canvas** or **GraphComponent**.
### Code example:
\`\`\`
const graph = graphComponent.graph
\`\`\``
  )
  graph.addLabel(
    nodeNode,
    `## INode
*interface*\\
The interface for node entities in an **IGraph**.
### Code example:
\`\`\`
const node = graph.createNode(
  new Rect(0, 0, 60, 40)
)
\`\`\``
  )
  graph.addLabel(
    edgeNode,
    `## IEdge
*interface*\\
The interface used to model edges in an **IGraph** implementation.
### Code example:
\`\`\`
const edge = graph.createEdge({
  source: node1,
  target: node2,
  labels: ['Edge Label']
})
\`\`\``
  )
  graph.addLabel(
    labelNode,
    `## ILabel
*interface*\\
The interface used in an **IGraph** implementation for labels.
### Code example:
\`\`\`
const nodeLabel = graph.addLabel(node, 'Node Label', ExteriorLabelModel.SOUTH)
const edgeLabel = graph.addLabel(edge, 'Edge Label', FreeEdgeLabelModel.INSTANCE.createDefaultParameter())
\`\`\``
  )
  graph.addLabel(
    portNode,
    `## IPort
*interface*\\
The interface used in an **IGraph** implementation for **IEdges** to connect to.
### Code example:
\`\`\`
const port = graph.addPort(node, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
\`\`\``
  )
  graph.addLabel(
    bendNode,
    `## IBend
*interface*\\
The interface used in an **IGraph** implementation to control the layout of **edges**.
### Code example:
\`\`\`
const bend = graph.addBend(edge, new Point(50, 20))
\`\`\``
  )

  graphComponent.fitGraphBounds()

  // bind UI elements to actions
  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// noinspection JSIgnoredPromiseFromCall
run()
