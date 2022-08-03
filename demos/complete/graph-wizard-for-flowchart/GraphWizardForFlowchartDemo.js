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
  DefaultGraph,
  GraphComponent,
  GraphMLSupport,
  ICommand,
  LayoutOrientation,
  License,
  StorageLocation
} from 'yfiles'

import { bindAction, bindCommand, showApp, toggleClass } from '../../resources/demo-app.js'
import FlowchartConfiguration from './FlowchartConfiguration.js'
import FlowchartStyle, { FlowchartSerializationListener } from '../flowchart/FlowchartStyle.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

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
  legendDiv = document.getElementById('legend')
  configuration = new FlowchartConfiguration(layoutOrientation)

  // enable save/load options
  enableGraphML()

  // register commands for the toolbar
  registerCommands()

  // setup a new flowchart diagram
  setUpNewDiagram()

  showApp(graphComponent)
  const overviewContainer = document.getElementById('overviewComponent').parentElement
  const overviewHeader = overviewContainer.querySelector('.demo-overview-header')
  overviewHeader.addEventListener('click', () => {
    toggleClass(overviewContainer, 'collapsed')
  })

  graphComponent.focus()
}

function setUpNewDiagram() {
  graphComponent.graph = new DefaultGraph()

  // initialize the default styling, highlighting etc. for graph items
  configuration.initializeGraphDefaults(graphComponent.graph)

  // initialize the input mode including adding the flowchart actions to the GraphWizardInputMode
  graphComponent.inputMode = configuration.createInputMode(legendDiv)

  // setup the initial diagram
  configuration.initializeDiagram(graphComponent)

  graphComponent.focus()
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML() {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the flowchart styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    FlowchartStyle
  )
  gs.graphMLIOHandler.addNamespace(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    'demostyle'
  )
  gs.graphMLIOHandler.addHandleSerializationListener(FlowchartSerializationListener)
}

function registerCommands() {
  bindAction("button[data-command='New']", setUpNewDiagram)
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent, null)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent, null)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindCommand("button[data-command='NewLayout']", configuration.LayoutCommand, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
