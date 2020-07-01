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
  Font,
  FreeEdgeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  HorizontalTextAlignment,
  ICommand,
  InteriorStretchLabelModel,
  License,
  MarkupLabelStyle,
  OrthogonalEdgeEditingContext,
  Point,
  Rect,
  Size,
  TextWrapping,
  PolylineEdgeStyle,
  Arrow
} from 'yfiles'

import { initDemoStyles } from '../../resources/demo-styles.js'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { RichTextEditorInputMode } from './RichTextEditorInputMode.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Simple demo that shows how to use MarkupLabelStyle to render labels.
 * The label text shows how to create headings, strong and emphasis text and line breaks,
 * and also how to style those elements using inline CSS.
 * The stylesheet CSS shows how to style label elements using external CSS.
 * The label style uses interactive text wrapping, which means you can resize nodes interactively
 * and the label text will be wrapped at word boundaries.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    // provide a WYSIWYG editor for the MarkupLabelStyle
    textEditorInputMode: new RichTextEditorInputMode()
  })

  const graph = graphComponent.graph
  // set the defaults for nodes
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(200, 100)
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px solid #66a3e0',
    targetArrow: new Arrow({
      stroke: '2px solid #66a3e0',
      fill: '#eee',
      scale: 2,
      type: 'circle',
      cropLength: 2
    }),
    smoothingLength: 30
  })

  // node labels get markup label support
  const font = new Font('"Segoe UI", Arial', 12)
  graph.nodeDefaults.labels.style = new MarkupLabelStyle({
    font: font,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER,
    backgroundFill: '#fff',
    backgroundStroke: '3px #66a3e0',
    wrapping: TextWrapping.WORD_ELLIPSIS,
    insets: [10, 10]
  })
  graph.edgeDefaults.labels.style = new MarkupLabelStyle({ font: font })

  // create a graph
  const node1 = graph.createNode(new Rect(800, 90, 385, 210))
  const node2 = graph.createNode(new Rect(350, 500, 385, 210))
  const node3 = graph.createNode(new Rect(800, 500, 385, 210))
  const node4 = graph.createNode(new Rect(1250, 500, 385, 210))
  graph.createEdge({
    source: node1,
    target: node2,
    bends: [new Point(992.5, 392), new Point(542.5, 392)]
  })
  graph.createEdge({ source: node1, target: node3 })
  graph.createEdge({
    source: node1,
    target: node4,
    bends: [new Point(992.5, 392), new Point(1442.5, 392)]
  })

  // add markup labels to the nodes - the CSS style is obtained in markup-label.css
  graph.addLabel(
    node1,
    '<h1><u style="color: #66a3e0;">Eric&#160;Joplin</u></h1>' +
      '<h2>Chief Executive Officer</h2>' +
      '<p><span style="color: rgb(102, 163, 224);"><b>ejoplin</b>@yoyodyne.com</span></p>' +
      '<p><em>Phone:</em> 555-0100<em> Fax:</em> 555-0101</p>' +
      '<p><small>&nbsp;</small></p>' +
      '<p><strong>Vita: </strong>' +
      'Lorem ipsum dolor <em>sit amet</em>, consectetur adipiscing elit, sed do eiusmod tempor <span style="color: #e60000">incididunt</span> ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis <strong>nostrud exercitation</strong> ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
  )
  graph.addLabel(
    node2,
    '<h1><u style="color: #66a3e0;">Richard&#160;Fuller</u></h1>' +
      '<h2>Vice President of Sales</h2>' +
      '<p><span style="color: rgb(102, 163, 224);"><b>rfuller</b>@yoyodyne.com</span></p>' +
      '<p><em>Phone:</em> 555-0134<em> Fax:</em> 555-0135</p>' +
      '<p><small>&nbsp;</small></p>' +
      '<p><strong>Vita: </strong>' +
      'Ut tristique et <em>egestas</em> quis ipsum suspendisse ultrices gravida. Mauris in <span style="color: #008a00">aliquam sem fringilla</span>. Adipiscing diam donec adipiscing tristique risus nec feugiat. Elit duis tristique sollicitudin nibh sit amet commodo. Gravida arcu ac tortor dignissim convallis aenean et tortor at. Aliquet eget sit amet tellus cras. Dignissim convallis aenean et tortor. Pharetra massa massa ultricies mi quis. Adipiscing elit pellentesque habitant morbi tristique senectus et netus et. Integer vitae justo eget magna fermentum iaculis eu non. Nibh mauris cursus mattis molestie a. Sit amet venenatis urna cursus eget nunc. Luctus venenatis lectus magna fringilla urna. Erat imperdiet sed euismod nisi porta lorem. Amet massa vitae tortor condimentum lacinia quis vel eros donec. Dignissim cras tincidunt lobortis feugiat vivamus at.</p>'
  )
  graph.addLabel(
    node3,
    '<h1><u style="color: #66a3e0;">Mildred&#160;Shark</u></h1>' +
      '<h2>Vice President of Engineering</h2>' +
      '<p><span style="color: rgb(102, 163, 224);"><b>mshark</b>@yoyodyne.com</span></p>' +
      '<p><em>Phone:</em> 555-0156<em> Fax:</em> 555-0157</p>' +
      '<p><small>&nbsp;</small></p>' +
      '<p><strong>Vita: </strong>' +
      'Pharetra convallis posuere <em>morbi leo</em>. Tortor posuere ac ut consequat <span style="color: #e60000">semper viverra</span>. Faucibus purus in massa tempor nec feugiat nisl pretium. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet. Morbi quis commodo odio aenean sed adipiscing. Volutpat blandit aliquam etiam erat. Vitae congue eu consequat ac felis donec et odio. Posuere morbi leo urna molestie at elementum. Adipiscing diam donec adipiscing tristique. Nisl pretium fusce id velit ut. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique. Enim sed faucibus turpis in eu mi bibendum neque. Quisque egestas diam in arcu cursus euismod. Cras ornare arcu dui vivamus arcu felis. Amet cursus sit amet dictum sit amet justo. Duis at consectetur lorem donec. Eget mi proin sed libero enim. Tempor orci dapibus ultrices in iaculis.</p>'
  )
  graph.addLabel(
    node4,
    '<h1><u style="color: #66a3e0;">Angela&#160;Haase</u></h1>' +
      '<h2>Marketing Manager</h2>' +
      '<p><span style="color: rgb(102, 163, 224);"><b>ahaase</b>@yoyodyne.com</span></p>' +
      '<p><em>Phone:</em> 555-0170<em> Fax:</em> 555-0171</p>' +
      '<p><small>&nbsp;</small></p>' +
      '<p><strong>Vita: </strong>' +
      'Et ligula <strong>ullamcorper</strong> malesuada proin libero nunc consequat interdum varius. <span style="color: #888; text-decoration: line-through;">Lectus magna fringilla urna porttitor rhoncus dolor purus.</span> Ut tortor pretium viverra suspendisse potenti nullam. Ornare aenean euismod elementum nisi quis eleifend. Purus viverra accumsan in nisl nisi scelerisque eu ultrices. Tristique magna sit amet purus gravida quis blandit turpis cursus. Curabitur gravida arcu ac tortor dignissim convallis aenean. Dapibus ultrices in iaculis nunc sed augue. Vehicula ipsum a arcu cursus vitae. Sed adipiscing diam donec adipiscing tristique risus. Tellus id interdum velit laoreet id donec ultrices tincidunt arcu. Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Neque volutpat ac tincidunt vitae semper quis. Cras semper auctor neque vitae tempus. Viverra ipsum nunc aliquet bibendum enim. Aliquam eleifend mi in nulla posuere. Dui accumsan sit amet nulla facilisi. Eget felis eget nunc lobortis mattis. Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Velit ut tortor pretium viverra suspendisse potenti nullam ac.</p>'
  )

  graphComponent.fitGraphBounds()

  // bind UI elements to actions
  registerCommands()

  showApp(graphComponent)
}

function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

loadJson().then(run)
