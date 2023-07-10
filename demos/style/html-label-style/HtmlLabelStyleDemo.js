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
  Font,
  FreeEdgeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  InteriorStretchLabelModel,
  License,
  Point,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import HtmlLabelStyle from './HtmlLabelStyle.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * @typedef {Object} PersonData
 * @property {string} name
 * @property {string} position
 * @property {string} email
 * @property {string} phone
 * @property {string} fax
 * @property {'string'} web
 * @property {Array.<string>} assistants
 * @property {string} department
 */

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
    document.getElementById('note').classList.add('unsupported')
    document.body.classList.add('loaded')
    return
  }

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // Disable node creation since they wouldn't have an HTML label anyway
  graphComponent.inputMode = new GraphEditorInputMode({
    allowCreateNode: false
  })

  // Apply default styling
  const graph = graphComponent.graph
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(250, 200)
  graph.nodeDefaults.style = new ShapeNodeStyle({ stroke: null, fill: null })
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()
  graphComponent.focusIndicatorManager.enabled = false

  // Labels get the HTML label style
  const font = new Font('Montserrat,sans-serif', 14)
  graph.nodeDefaults.labels.style = new HtmlLabelStyle(font)
  graph.edgeDefaults.labels.style = new HtmlLabelStyle(font)

  // Create a graph
  const node1 = graph.createNodeAt({
    location: new Point(800, 0),
    tag: {
      name: 'Eric Joplin',
      position: 'Chief Executive Officer',
      email: 'ejoplin@yoyodyne.com',
      phone: '555-0100',
      fax: '555-0101',
      web: 'yoyodyne.com/ejoplin',
      assistants: ['Gary Robers', 'Alexander Burns', 'Linda Newland'],
      department: 'executive'
    }
  })
  const node2 = graph.createNodeAt({
    location: new Point(100, 500),
    tag: {
      name: 'Amy Kain',
      position: 'Vice President of Production',
      email: 'akain@yoyodyne.com',
      phone: '555-0106',
      fax: '555-0107',
      web: 'yoyodyne.com/akain',
      department: 'production'
    }
  })
  const node3 = graph.createNodeAt({
    location: new Point(450, 500),
    tag: {
      name: 'Richard Fuller',
      position: 'Vice President of Sales',
      email: 'rfuller@yoyodyne.com',
      phone: '555-0134',
      fax: '555-0135',
      web: 'yoyodyne.com/rfuller',
      department: 'sales'
    }
  })
  const node4 = graph.createNodeAt({
    location: new Point(800, 500),
    tag: {
      name: 'Mildred Shark',
      position: 'Vice President of Engineering',
      email: 'mshark@yoyodyne.com',
      phone: '555-0156',
      fax: '555-0157',
      web: 'yoyodyne.com/mshark',
      department: 'engineering'
    }
  })
  const node5 = graph.createNodeAt({
    location: new Point(1150, 500),
    tag: {
      name: 'Angela Haase',
      position: 'Marketing Manager',
      email: 'ahaase@yoyodyne.com',
      phone: '555-0170',
      fax: '555-0171',
      web: 'yoyodyne.com/ahaase',
      department: 'marketing',
      assistants: ['Lorraine Deaton']
    }
  })
  const node6 = graph.createNodeAt({
    location: new Point(1500, 500),
    tag: {
      name: 'David Kerry',
      position: 'Chief Financial Officer',
      email: 'dkerry@yoyodyne.com',
      phone: '555-0180',
      fax: '555-0181',
      web: 'yoyodyne.com/dkerry',
      department: 'accounting',
      assistants: ['Aaron Buckman']
    }
  })
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
  graph.createEdge(node1, node4)
  graph.createEdge(node1, node5)
  graph.createEdge(node1, node6)

  // Add HTML labels to the nodes
  for (const node of graph.nodes) {
    graph.addLabel(node, buildLabelText(node.tag))
  }

  graphComponent.fitGraphBounds()
}

/**
 * Builds the string of the HTML snippet that displays the given data.
 * @param {!PersonData} data
 * @returns {!string}
 */
function buildLabelText(data) {
  const assistants =
    !Array.isArray(data.assistants) || data.assistants.length === 0
      ? ''
      : `
<hr>
<div class="assistants">
  <b>Assistants:</b>
  <ul>
${data.assistants.map(name => `    <li>${name}</li>`).join('\n')}
  </ul>
</div>`

  return `<div class="label-content ${data.department}">
<h1>${data.name}</h1>
<div class="position">${data.position}</div>
<div class="details">
  <a href="mailto:${data.email}">${data.email}</a><br>
  Phone: ${data.phone} Fax: ${data.fax}<br>
  Web: <a href="https://${data.web}" target="_blank">${data.web}</a>
</div>${assistants}`
}

void run().then(finishLoading)
