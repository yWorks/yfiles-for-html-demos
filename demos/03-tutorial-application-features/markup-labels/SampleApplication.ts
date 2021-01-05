/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
  DefaultLabelStyle,
  ExteriorLabelModel,
  Font,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  InteriorStretchLabelModel,
  License,
  MarkupLabelStyle,
  OrthogonalEdgeEditingContext,
  PanelNodeStyle,
  Point,
  ShapeNodeStyle,
  Size,
  TextWrapping
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

// @ts-ignore
let graphComponent: GraphComponent = null

/**
 * Bootstraps the demo.
 */
function run(licenseData: object): void {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext()
  })

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // configures the MarkupLabelStyle to be used as default label style in this demo
  configureMarkupLabelStyle(graphComponent.graph)

  // create an initial sample graph
  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Sets the {@link MarkupLabelStyle} as default label style for nodes and edges.
 * @param graph
 */
function configureMarkupLabelStyle(graph: IGraph): void {
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  const font = new Font('"Segoe UI", Arial', 11)
  graph.nodeDefaults.labels.style = new MarkupLabelStyle({
    font: font,
    wrapping: TextWrapping.WORD_ELLIPSIS,
    insets: [5, 10]
  })
  graph.edgeDefaults.labels.style = new MarkupLabelStyle({ font: font })
}

/**
 * Initializes the defaults for the styles in this tutorial.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph: IGraph): void {
  // configure defaults for normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  // configure defaults for group nodes and their labels
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right'
  })
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

/**
 * Creates an initial sample graph.
 *
 * @param graph The graph.
 */
function createGraph(graph: IGraph): void {
  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNode([-175, 155, 330, 280])
  const node5 = graph.createNode([200, 155, 380, 80])

  graph.addLabel(
    node4,
    '<h1 color="#eee">Supported Tags</h1>\n' +
      '<p><strong><code>&lt;span&gt;</code></strong>: A stylable element.</p>\n' +
      '<p><strong><code>&lt;br&gt;</code></strong>: Adds a line break</p>\n' +
      '<p><strong><code>&lt;em&gt;</code></strong>: <em>Italic text</em></p>\n' +
      '<p><strong><code>&lt;strong&gt;</code></strong>: <strong>Bold text</strong></p>\n' +
      '<p><strong><code>&lt;del&gt;</code></strong>: <del>Strikethrough text</del></p>\n' +
      '<p><strong><code>&lt;u&gt;</code></strong>: <u>Underline text</u></p>\n' +
      '<p><strong><code>&lt;h1&gt;-&lt;h6&gt;</code></strong>: Heading 1-6</p>\n' +
      '<p><strong><code>&lt;p&gt;</code></strong>: A paragraph element.</p>\n' +
      '<p><strong><code>&lt;pre&gt;</code></strong>: A preformatted element which preserves newlines.</p>\n' +
      '<p><strong><code>&lt;code&gt;</code></strong>: A code element.</p>\n' +
      '<p><strong><code>&lt;small&gt;</code></strong>: <small>Small font-size</small></p>\n' +
      '<p><strong><code>&lt;large&gt;</code></strong>: <large>Large font-size</large></p>\n' +
      '<p><strong><code>&lt;[html color name]&gt;</code></strong>: Colored text, e.g. <blue>&lt;blue&gt;</blue></p>'
  )

  graph.addLabel(
    node5,
    '<h2>CSS styling</h2>\n' +
      '<p>The styling of the markup elements can be easily modified with CSS rules.</p>\n' +
      '<p>In this case, we use <span style="font-variant: small-caps;">small-caps</span> and <span style="color: #404040;">color: #404040</span> for heading 2.</p>'
  )

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  graph.setPortLocation(edge1.sourcePort!, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort!, new Point(145, 75))
  graph.setPortLocation(edge2.sourcePort!, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort!, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort!, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort!, new Point(-25, 155))
  graph.setPortLocation(edge4.sourcePort!, new Point(145, 115))
  graph.setPortLocation(edge4.targetPort!, new Point(380, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(-25, 130)])
  graph.addBends(edge4, [new Point(145, 130), new Point(380, 130)])
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

// start tutorial
loadJson().then(run)
