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
  FreeEdgeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  InteriorStretchLabelModel,
  License,
  Rect,
  Size
} from 'yfiles'

import HtmlLabelStyle from './HtmlLabelStyle.js'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles.js'
import { addClass, bindCommand, showApp } from '../../resources/demo-app.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * Simple demo that shows how to create a custom style that uses HTML for rendering the labels.
 * This is done using the foreignObject SVG element. Note that Internet Explorer does not currently (as of version
 * 11) support this feature.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // Check whether foreignObjects are supported...
  const foreignObject = window.document.createElementNS(
    'http://www.w3.org/2000/svg',
    'foreignObject'
  )
  if (foreignObject.transform === undefined) {
    alert('This browser does not support SVG foreignObjects. Demo functionality not available')
    addClass(document.getElementById('note'), 'unsupported')
    addClass(document.body, 'loaded')
    return
  }

  // initialize graph component
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode()

  // Make links work again, as the GraphComponent prevents the default action when clicking a link
  graphComponent.addMouseClickListener((sender, args) => {
    let target = args.originalEvent.target
    while (!target.hasAttribute('href') && target.parentElement) {
      target = target.parentElement
    }
    if (target.hasAttribute('href')) {
      window.open(target.getAttribute('href'), '_blank')
    }
  })

  const graph = graphComponent.graph
  // set the defaults for nodes
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(200, 100)
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  // node labels get the HTML label support
  const font = new Font('"Segoe UI", Arial', 11)
  graph.nodeDefaults.labels.style = new HtmlLabelStyle(font)
  graph.edgeDefaults.labels.style = new HtmlLabelStyle(font)

  // create a graph
  const node1 = graph.createNode(new Rect(800, 0, 300, 270))
  const node2 = graph.createNode(new Rect(100, 500, 300, 180))
  const node3 = graph.createNode(new Rect(450, 500, 300, 180))
  const node4 = graph.createNode(new Rect(800, 500, 300, 180))
  const node5 = graph.createNode(new Rect(1150, 500, 300, 240))
  const node6 = graph.createNode(new Rect(1500, 500, 300, 240))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
  graph.createEdge(node1, node4)
  graph.createEdge(node1, node5)
  graph.createEdge(node1, node6)

  // add HTML labels to the nodes - the style is obtained in html-label.css
  graph.addLabel(
    node1,
    '<div class="label executive">' +
      '<h1>Eric&nbsp;Joplin</h1>' +
      '<h2>Chief Executive Officer</h2>' +
      '<a href="mailto:ejoplin@yoyodyne.com">ejoplin@yoyodyne.com</a>' +
      '<p>Phone: 555-0100 Fax: 555-0101' +
      '<br>' +
      'Web: <a href="https://yoyodyne.com/ejoplin" target="_blank">yoyodyne.com/ejoplin</a>' +
      '</p>' +
      '<hr>' +
      '<div class="subordinates">' +
      '<b>Assistants:</b>' +
      '<ul>' +
      '<li>Gary Robers</li>' +
      '<li>Alexander Burns</li>' +
      '<li>Linda Newland</li>' +
      '</ul>' +
      '</div>' +
      '</div>'
  )
  graph.addLabel(
    node2,
    '<div class="label production">' +
      '<h1>Amy&nbsp;Kain</h1>' +
      '<h2>Vice President of Production</h2>' +
      '<a href="mailto:akain@yoyodyne.com">akain@yoyodyne.com</a>' +
      '<p>Phone: 555-0106 Fax: 555-0107' +
      '<br>' +
      'Web: <a href="https://yoyodyne.com/akain" target="_blank">yoyodyne.com/akain</a>' +
      '</p>' +
      '</div>'
  )
  graph.addLabel(
    node3,
    '<div class="label sales">' +
      '<h1>Richard&nbsp;Fuller</h1>' +
      '<h2>Vice President of Sales</h2>' +
      '<a href="mailto:rfuller@yoyodyne.com">rfuller@yoyodyne.com</a>' +
      '<p>Phone: 555-0134 Fax: 555-0135' +
      '<br>' +
      'Web: <a href="https://yoyodyne.com/rfuller" target="_blank">yoyodyne.com/rfuller</a>' +
      '</p>' +
      '</div>'
  )
  graph.addLabel(
    node4,
    '<div class="label engineering">' +
      '<h1>Mildred&nbsp;Shark</h1>' +
      '<h2>Vice President of Engineering</h2>' +
      '<a href="mailto:mshark@yoyodyne.com">mshark@yoyodyne.com</a>' +
      '<p>Phone: 555-0156 Fax: 555-0157' +
      '<br>' +
      'Web: <a href="https://yoyodyne.com/mshark" target="_blank">yoyodyne.com/mshark</a>' +
      '</p>' +
      '</div>'
  )
  graph.addLabel(
    node5,
    '<div class="label marketing">' +
      '<h1>Angela&nbsp;Haase</h1>' +
      '<h2>Marketing Manager</h2>' +
      '<a href="mailto:ahaase@yoyodyne.com">ahaase@yoyodyne.com</a>' +
      '<p>Phone: 555-0170 Fax: 555-0171' +
      '<br>' +
      'Web: <a href="https://yoyodyne.com/ahaase" target="_blank">yoyodyne.com/ahaase</a>' +
      '</p>' +
      '<hr>' +
      '<div class="subordinates">' +
      '<b>Assistants:</b>' +
      '<ul><li>Lorraine Deaton</li></ul>' +
      '</div>' +
      '</div>'
  )
  graph.addLabel(
    node6,
    '<div class="label accounting">' +
      '<h1>David&nbsp;Kerry</h1>' +
      '<h2>Chief Financial Officer</h2>' +
      '<a href="mailto:dkerry@yoyodyne.com">dkerry@yoyodyne.com</a>' +
      '<p>Phone: 555-0180 Fax: 555-0181' +
      '<br>' +
      'Web: <a href="https://yoyodyne.com/dkerry" target="_blank">yoyodyne.com/dkerry</a>' +
      '</p>' +
      '<hr>' +
      '<div class="subordinates">' +
      '<b>Assistants:</b>' +
      '<ul><li>Aaron Buckman</li></ul>' +
      '</div>' +
      '</div>'
  )

  graphComponent.fitGraphBounds()

  // bind UI elements to actions
  registerCommands()

  showApp(graphComponent)
}

/** @type {GraphComponent} */
let graphComponent

function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// noinspection JSIgnoredPromiseFromCall
run()
