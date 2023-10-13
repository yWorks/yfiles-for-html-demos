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
import { DefaultGraph, GraphComponent, LayoutOrientation, License } from 'yfiles'

import FlowchartConfiguration from './FlowchartConfiguration.js'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { bindYFilesCommand, finishLoading } from 'demo-resources/demo-page'
import { enableGraphmlSupport } from '../flowchart/style/enable-graphml-support.js'

/** @type {GraphComponent} */
let graphComponent

/**
 * The HTML element used to show the action legend.
 * @type {HTMLDivElement}
 */
let legendDiv

/** @type {FlowchartConfiguration} */
let configuration

const layoutOrientation = LayoutOrientation.TOP_TO_BOTTOM

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  legendDiv = document.querySelector('#legend')
  configuration = new FlowchartConfiguration(layoutOrientation)

  // enable save/load options
  enableGraphmlSupport(graphComponent)

  // register actions for the toolbar
  initializeUI()

  // setup a new flowchart diagram
  setUpNewDiagram()

  graphComponent.focus()
}

function setUpNewDiagram() {
  graphComponent.graph = new DefaultGraph()

  // initialize the default styling, highlightin,g etc. for graph items
  configuration.initializeGraphDefaults(graphComponent)

  // initialize the input mode including adding the flowchart actions to the GraphWizardInputMode
  graphComponent.inputMode = configuration.createInputMode(legendDiv)

  // setup the initial diagram
  configuration.initializeDiagram(graphComponent)

  graphComponent.focus()
}

function initializeUI() {
  document.querySelector('#new').addEventListener('click', setUpNewDiagram)
  bindYFilesCommand(
    "button[data-command='NewLayout']",
    configuration.LayoutCommand,
    graphComponent,
    null,
    'Calculate full layout'
  )
}

run().then(finishLoading)
