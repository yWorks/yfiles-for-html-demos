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
  GraphComponent,
  GraphMLIOHandler,
  GraphOverviewComponent,
  GraphOverviewSvgVisualCreator,
  GraphOverviewWebGLVisualCreator,
  GraphViewerInputMode,
  ICommand,
  License,
  OverviewInputMode,
  PolylineEdgeStyle,
  RenderModes,
  ShowFocusPolicy,
  TemplateNodeStyle
} from 'yfiles'
import OverviewCanvasVisualCreator from './OverviewCanvasVisualCreator.js'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  readGraph,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { isWebGlSupported } from '../../utils/Workarounds.js'

/**
 * The GraphComponent
 * @type {GraphComponent}
 */
let graphComponent

/**
 * The overview graph component that use the Canvas and Svg visual creator.
 ** @type {GraphOverviewComponent}
 */
let overviewComponent

/**
 * The graph component that use the overview inputMode to let the overview graph use the same
 * styles as the graphComponent.
 ** @type {GraphComponent}
 */
let overviewGraphComponent

const overViewStyleBox = document.getElementById('graphChooserBox')

/**
 * Runs the demo.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  graphComponent.focusIndicatorManager.showFocusPolicy = ShowFocusPolicy.ALWAYS
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  graphComponent.inputMode = new GraphViewerInputMode()

  overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // initialize the overview graph with the graph overview svg visual creator
  overviewComponent.graphVisualCreator = getOverviewSvgVisualCreator()

  // initialize the overview graph that use the same GraphComponent styles.
  // If you want the overview to use the same styles as the GraphComponent, you can use a GraphComponent to display the overview.
  overviewGraphComponent = new GraphComponent('overviewGraphComponent')
  overviewGraphComponent.inputMode = new OverviewInputMode({
    canvasComponent: graphComponent
  })

  initializeConverters()

  // load the graph
  readGraph(new GraphMLIOHandler(), graphComponent.graph, 'resources/graph.graphml').then(() => {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })

  registerCommands()

  if (!isWebGlSupported()) {
    // remove WebGL option if not supported by client
    document.getElementById('no-webgl-support').style.display = 'block'
    const webGLOption = overViewStyleBox.querySelector(
      "option[value='GraphOverviewWebGLVisualCreator']"
    )
    overViewStyleBox.removeChild(webGLOption)
  }

  const initialStyle = overViewStyleBox.value
  overviewStyling(initialStyle)

  showApp(graphComponent, overviewComponent)
}

/**
 * Styles the overview graph.
 * @param {!string} styleType The type of the styling selected with the combobox.
 */
function overviewStyling(styleType) {
  switch (styleType) {
    case 'GraphOverviewSvgVisualCreator':
      overviewComponent.renderMode = RenderModes.SVG
      // creates the style to the overview using the svg visual creator
      overviewComponent.graphVisualCreator = getOverviewSvgVisualCreator()

      // updates the overview component then show the overview graph
      overviewComponent.updateVisualAsync().then(() => {
        // hide the overview graph that use the GraphComponent styles and show the overview graph that use the canvas, SVG or WebGL creator
        overviewGraphComponent.div.style.display = 'none'
        overviewComponent.div.style.display = 'block'
      })
      break
    case 'GraphOverviewCanvasVisualCreator':
      overviewComponent.renderMode = RenderModes.CANVAS
      // creates the style to the overview using the canvas visual creator
      overviewComponent.graphVisualCreator = new OverviewCanvasVisualCreator(graphComponent.graph)

      // updates the overview component then show the overview graph
      overviewComponent.updateVisualAsync().then(() => {
        // hides the overview graph that use the GraphComponent styles and show the overview graph that use the canvas, SVG or WebGL creator
        overviewGraphComponent.div.style.display = 'none'
        overviewComponent.div.style.display = 'block'
      })
      break
    case 'OverviewInputMode':
      // sets the overview graph and fit the overview graph bounds
      overviewGraphComponent.graph = graphComponent.graph

      // updates the overview component then show the overview graph
      overviewGraphComponent.updateVisualAsync().then(() => {
        // hides the overview graph that use the canvas or Svg visual creator and show the overview graph that use the GraphComponent styles
        overviewGraphComponent.div.style.display = 'block'
        overviewComponent.div.style.display = 'none'
        overviewGraphComponent.fitGraphBounds()
      })
      break
    case 'GraphOverviewWebGLVisualCreator':
      overviewComponent.renderMode = RenderModes.WEB_GL
      // creates the style to the overview using the svg visual creator
      overviewComponent.graphVisualCreator = getOverviewWebGLVisualCreator()

      // updates the overview component then show the overview graph
      overviewComponent.updateVisualAsync().then(() => {
        // hide the overview graph that use the GraphComponent styles and show the overview graph that use the canvas, SVG or WebGL visual creator
        overviewGraphComponent.div.style.display = 'none'
        overviewComponent.div.style.display = 'block'
      })
      break
  }
}

/**
 * Creates the visual creator that uses SVG rendering.
 * @returns {!GraphOverviewSvgVisualCreator} The visual creator that uses SVG rendering.
 */
function getOverviewSvgVisualCreator() {
  const overviewSvgVisualCreator = new GraphOverviewSvgVisualCreator(graphComponent.graph)
  overviewSvgVisualCreator.nodeStyle = new TemplateNodeStyle('overViewNodeStyle')
  overviewSvgVisualCreator.edgeStyle = new PolylineEdgeStyle({ stroke: '#336699' })
  return overviewSvgVisualCreator
}
/**
 * Creates the visual creator that uses WebGL rendering.
 * @returns {!GraphOverviewWebGLVisualCreator} The visual creator that uses SVG rendering.
 */
function getOverviewWebGLVisualCreator() {
  return new GraphOverviewWebGLVisualCreator(graphComponent.graph)
}
/**
 * Registers the JavaScript commands for the GUI elements, typically the
 * tool bar buttons, during the creation of this application.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindAction("button[data-command='ZoomOriginal']", () => {
    ICommand.ZOOM.execute(1, graphComponent)
  })

  bindChangeListener("select[data-command='SelectedStyle']", selectedValue => {
    overviewStyling(selectedValue)
  })
  addNavigationButtons(overViewStyleBox)
}

/**
 * Initializes the converters for the bindings of the template node styles.
 */
function initializeConverters() {
  TemplateNodeStyle.CONVERTERS.orgChartConverters = {
    overviewConverter: value => {
      if (typeof value === 'string' && value.length > 0) {
        return value.replace(/^(.)(\S*)(.*)/, '$1.$3')
      }
      return ''
    },
    // converter function that may convert a name to an abbreviated name
    lineBreakConverter: (value, firstLine) => {
      if (typeof value === 'string') {
        let copy = value
        while (copy.length > 20 && copy.indexOf(' ') > -1) {
          copy = copy.substring(0, copy.lastIndexOf(' '))
        }
        if (firstLine === 'true') {
          return copy
        }
        return value.substring(copy.length)
      }
      return ''
    },
    // converter function that adds a hash to a given string and - if present - appends the parameter to it
    addHashConverter: (value, parameter) => {
      if (typeof value === 'string') {
        if (typeof parameter === 'string') {
          return `#${value}${parameter}`
        }
        return `#${value}`
      }
      return value
    },
    // converter function that return a color according to the employee's status
    colorConverter: value =>
      ({
        busy: '#AB2346',
        present: '#76B041',
        travel: '#A367DC',
        unavailable: '#C1C1C1'
      }[value] || '#C1C1C1')
  }
}

loadJson().then(checkLicense).then(run)
