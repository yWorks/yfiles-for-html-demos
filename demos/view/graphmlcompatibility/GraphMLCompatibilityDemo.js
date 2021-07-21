/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  FoldingManager,
  GraphComponent,
  GraphMLSupport,
  GraphViewerInputMode,
  ICommand,
  License,
  StorageLocation
} from 'yfiles'

import { configureIOHandler } from './graphml-compat.js'
import {
  bindAction,
  bindChangeListener,
  bindCommand,
  readGraph,
  showApp,
  checkLicense
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * This demo shows how to enable backwards READ compatibility for GraphML.
 *
 * The graphml-compat.js that is bundled in this demo provides a configurator class that can be used to
 * configure a given GraphMLIOHandler instance so that it can read GraphML files written in versions prior to 2.x.
 * You can enable backwards compatibility with this single line:
 *
 * configureIOHandler(ioh);
 *
 * The compat file is human readable and can be adjusted easily.
 *
 * The resources directory contains a number of sample files from previous distributions
 */

let graphComponent = null
let graphMLSupport = null

const graphChooserBox = document.getElementById('graphChooserBox')
const nextButton = document.getElementById('nextFileButton')
const previousButton = document.getElementById('previousFileButton')

function run(licenseData) {
  License.value = licenseData
  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // We also enable folding in this demo.
  const fm = new FoldingManager()
  graphComponent.graph = fm.createFoldingView().graph

  // Enable GraphML IO and compatibility
  enableGraphML()

  // bind the demo buttons to their commands
  registerCommands()
  ;[
    'computer-network',
    'orgchart',
    'movies',
    'family-tree',
    'hierarchy',
    'nesting',
    'social-network',
    'uml-diagram'
  ].forEach(graph => {
    const option = document.createElement('option')
    option.text = graph
    option.value = graph
    graphChooserBox.add(option)
  })

  // enable input mode
  const mode = new GraphViewerInputMode()
  mode.navigationInputMode.allowCollapseGroup = true
  mode.navigationInputMode.allowExpandGroup = true
  graphComponent.inputMode = mode

  // We load a sample graph
  readSampleGraph()

  showApp(graphComponent)
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML() {
  // create a new GraphMLSupport instance that handles save and load operations
  graphMLSupport = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  // Configure backwards compatibility
  configureIOHandler(graphMLSupport.graphMLIOHandler)
}

/**
 * Helper method that reads the currently selected graphml from the combobox.
 */
async function readSampleGraph() {
  // Disable navigation buttons while graph is loaded
  nextButton.disabled = true
  previousButton.disabled = true

  // first derive the file name
  const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
  const fileName = `resources/${selectedItem}.graphml`
  // then load the graph
  await readGraph(graphMLSupport.graphMLIOHandler, graphComponent.graph, fileName)
  // when done - fit the bounds
  ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  // re-enable navigation buttons
  setTimeout(updateButtons, 10)
}

function registerCommands() {
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='PreviousFile']", onPreviousButtonClicked)
  bindAction("button[data-command='NextFile']", onNextButtonClicked)
  bindChangeListener("select[data-command='SelectedFileChanged']", readSampleGraph)
}

/**
 * Updates the previous/next button states.
 */
function updateButtons() {
  nextButton.disabled = graphChooserBox.selectedIndex >= graphChooserBox.length - 1
  previousButton.disabled = graphChooserBox.selectedIndex <= 0
}

/**
 * Switches to the previous graph.
 */
function onPreviousButtonClicked() {
  graphChooserBox.selectedIndex--
  readSampleGraph()
}

/**
 * Switches to the next graph.
 */
function onNextButtonClicked() {
  graphChooserBox.selectedIndex++
  readSampleGraph()
}

// run the demo
loadJson().then(checkLicense).then(run)
