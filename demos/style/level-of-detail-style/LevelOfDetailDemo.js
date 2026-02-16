/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphViewerInputMode,
  IArrow,
  License,
  Point,
  PolylineEdgeStyle,
  Size
} from '@yfiles/yfiles'

import { LevelOfDetailNodeStyle } from './LevelOfDetailNodeStyle'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import {
  detailNodeStyleTemplateSource,
  intermediateNodeStyleTemplateSource,
  overviewNodeStyleTemplateSource
} from './style-templates'
import { createLitNodeStyleFromSource } from '@yfiles/demo-utils/LitNodeStyle'

let graphComponent

/**
 * Support three styles for different zoom level.
 */
let levelOfDetailNodeStyle = null

/**
 * The Popup text that shows in which level we are now.
 */
const detailLevelPopup = document.querySelector('#detailLevelPopup')

async function run() {
  License.value = licenseData
  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('#graphComponent')
  // initialize input Mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // set default styles for the nodes and the edges
  initTutorialDefaults(graphComponent.graph)

  // check the zooming level and update the Popup text that shows in which level we are now
  updateDetailLevelIndicator()

  // build a sample graph
  createGraph()

  // center the graph
  graphComponent.fitGraphBounds()
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param graph The graph.
 */
function initTutorialDefaults(graph) {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set styles, sizes and locations specific for this tutorial
  levelOfDetailNodeStyle = new LevelOfDetailNodeStyle(
    createLitNodeStyleFromSource(detailNodeStyleTemplateSource),
    createLitNodeStyleFromSource(intermediateNodeStyleTemplateSource),
    createLitNodeStyleFromSource(overviewNodeStyleTemplateSource)
  )
  graph.nodeDefaults.style = levelOfDetailNodeStyle
  graph.nodeDefaults.size = new Size(285, 100)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * Updates the indicator for the level of details to the current graph.
 */
function updateDetailLevelIndicator() {
  let zoomLevelChangedTimer
  graphComponent.addEventListener('zoom-changed', () => {
    // update the zoom level display after 200ms
    if (zoomLevelChangedTimer >= 0) {
      return
    }
    zoomLevelChangedTimer = setTimeout(() => {
      updateIndicator()
      zoomLevelChangedTimer = -1
    }, 200)
  })
}

/**
 * Updates the levels indicator.
 */
function updateIndicator() {
  let zoomState
  if (graphComponent.zoom >= levelOfDetailNodeStyle.detailThreshold) {
    zoomState = 'Detail Level'
  } else if (graphComponent.zoom > levelOfDetailNodeStyle.intermediateThreshold) {
    zoomState = 'Intermediate Level'
  } else {
    zoomState = 'Overview Level'
  }
  const oldZoomState = detailLevelPopup.zoomState
  if (oldZoomState !== zoomState) {
    detailLevelPopup.textContent = detailLevelPopup.zoomState = zoomState
    detailLevelPopup.className = 'visible'
    setTimeout(() => {
      detailLevelPopup.className = ''
    }, 2000)
  }
}

/**
 * Create a sample graph.
 */
function createGraph() {
  const graph = graphComponent.graph
  const n1 = graph.createNodeAt({
    location: [0, 0],
    tag: {
      position: 'Chief Executive Officer',
      name: 'Eric Joplin',
      email: 'ejoplin@yoyodyne.com',
      phone: '555-0100',
      fax: '555-0101'
    }
  })
  const n2 = graph.createNodeAt({
    location: [0, 150],
    tag: {
      position: 'Chief Executive Assistant',
      name: 'Gary Roberts',
      email: 'groberts@yoyodyne.com',
      phone: '555-0100',
      fax: '555-0101'
    }
  })
  const n3 = graph.createNodeAt({
    location: [-175, 300],
    tag: {
      position: 'Senior Executive Assistant',
      name: 'Alex Burns',
      email: 'aburns@yoyodyne.com',
      phone: '555-0102',
      fax: '555-0103'
    }
  })
  const n4 = graph.createNodeAt({
    location: [175, 300],
    tag: {
      position: 'Junior Executive Assistant',
      name: 'Linda Newland',
      email: 'lnewland@yoyodyne.com',
      phone: '555-0112',
      fax: '555-0113'
    }
  })
  graph.createEdge(n1, n2)
  graph.createEdge({ source: n2, target: n3, bends: [new Point(0, 230), new Point(-175, 230)] })
  graph.createEdge({ source: n2, target: n4, bends: [new Point(0, 230), new Point(175, 230)] })
  graphComponent.fitGraphBounds()
}

run().then(finishLoading)
