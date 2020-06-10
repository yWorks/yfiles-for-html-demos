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
  DefaultLabelStyle,
  EdgeSegmentLabelModel,
  EdgeSides,
  FreeEdgeLabelModel,
  FreeLabelModel,
  FreeNodeLabelModel,
  GenericLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  ILabel,
  InteriorLabelModel,
  LabelStyleDecorationInstaller,
  License,
  Size,
  StringTemplateLabelStyle,
  TemplateLabelStyle,
  Visualization
} from 'yfiles'

import LabelHandleProvider from './LabelHandleProvider.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import { showApp, bindCommand } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
/** @type {GraphComponent} */
let graphComponent = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  initializeGraph()

  initializeInputMode()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Sets the default styles and creates the graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  // add a custom handle provider for labels
  graph.decorator.labelDecorator.handleProviderDecorator.setFactory(getLabelHandleProvider)
  // for rotatable labels: modify the selection visualization to indicate that this label can be rotated
  const templateString = `<g>
           <rect fill="none" stroke-width="3" stroke="lightgray" width="{TemplateBinding width}" height="{TemplateBinding height}"></rect>
           <line x1="{TemplateBinding width, Converter=demoBindings.halfConverter}" y1="0" x2="{TemplateBinding width, Converter=demoBindings.halfConverter}" y2="-15" stroke-width="{TemplateBinding isUpsideDown, Converter=demoBindings.showUpsideHandle}" stroke="lightgray"></line>
           <line x1="{TemplateBinding width, Converter=demoBindings.halfConverter}" y1="{TemplateBinding height}" x2="{TemplateBinding width, Converter=demoBindings.halfConverter}" y2="{TemplateBinding height, Converter=demoBindings.flippedHandlePosition}" stroke-width="{TemplateBinding isUpsideDown, Converter=demoBindings.showFlippedHandle}" stroke="lightgray"></line>
           <circle r="4" stroke="black" stroke-width="1" fill="none" cx="{TemplateBinding width, Converter=demoBindings.halfConverter}" cy="{TemplateBinding height, Converter=demoBindings.halfConverter}"></circle>
         </g>`

  const demoBindings = {}
  TemplateLabelStyle.CONVERTERS.demoBindings = demoBindings
  demoBindings.halfConverter = value => value * 0.5
  demoBindings.flippedHandlePosition = height => height + 15
  demoBindings.showUpsideHandle = isUpsideDown => (isUpsideDown ? '0' : '3')
  demoBindings.showFlippedHandle = isUpsideDown => (isUpsideDown ? '3' : '0')
  const templateLabelStyle = new StringTemplateLabelStyle(templateString)

  const labelDecorationInstaller = new LabelStyleDecorationInstaller({
    labelStyle: templateLabelStyle
  })

  graphComponent.graph.decorator.labelDecorator.selectionDecorator.setImplementation(
    label =>
      label.layoutParameter.model instanceof FreeNodeLabelModel ||
      label.layoutParameter.model instanceof FreeEdgeLabelModel ||
      label.layoutParameter.model instanceof FreeLabelModel,
    labelDecorationInstaller
  )

  initDemoStyles(graph)
  graphComponent.graph.nodeDefaults.size = new Size(100, 50)

  // create a label style that shows the labels bounds
  const labelStyle = new DefaultLabelStyle({
    backgroundFill: 'rgb(119, 204, 255)',
    backgroundStroke: 'lightgray',
    horizontalTextAlignment: 'center',
    insets: [3, 5, 3, 5]
  })
  graph.nodeDefaults.labels.style = labelStyle
  // Our resize logic does not work together with all label models resp. label model parameters
  // for simplicity, we just use a centered label for nodes
  graph.nodeDefaults.labels.layoutParameter = new GenericLabelModel(
    InteriorLabelModel.CENTER
  ).createDefaultParameter()

  graph.edgeDefaults.labels.style = labelStyle

  const labelModel = new EdgeSegmentLabelModel({ distance: 10 })
  graph.edgeDefaults.labels.layoutParameter = labelModel.createParameterFromSource(
    0,
    0.5,
    EdgeSides.RIGHT_OF_EDGE
  )

  // create sample graph
  const n1 = graph.createNodeAt({
    location: [100, 100],
    labels: ['Centered Node Label. Resizes symmetrically.']
  })
  const n2 = graph.createNodeAt({
    location: [500, 0],
    labels: [
      {
        text: 'Free Node Label.\nSupports rotation and asymmetric resizing',
        layoutParameter: new FreeNodeLabelModel().createParameter(
          [0.5, 0.5],
          [0, 0],
          [0.5, 0.5],
          [0, 0],
          0
        ),
        style: new DefaultLabelStyle({
          backgroundFill: 'rgb(119, 204, 255)',
          backgroundStroke: 'lightgray',
          horizontalTextAlignment: 'center',
          autoFlip: false,
          insets: [3, 5, 3, 5]
        })
      }
    ]
  })
  graph.createEdge({
    source: n2,
    target: n1,
    labels: ['Rotated Edge Label']
  })

  graphComponent.fitGraphBounds()
}

/**
 * Returns the LabelHandleProvider for the given label.
 * @param {ILabel} label The given label
 * @return {LabelHandleProvider}
 */
function getLabelHandleProvider(label) {
  return new LabelHandleProvider(label)
}

/**
 * Initializes the input mode.
 */
function initializeInputMode() {
  const mode = new GraphEditorInputMode({
    // customize hit test order to simplify click selecting labels
    clickHitTestOrder: [
      GraphItemTypes.EDGE_LABEL,
      GraphItemTypes.NODE_LABEL,
      GraphItemTypes.BEND,
      GraphItemTypes.EDGE,
      GraphItemTypes.NODE,
      GraphItemTypes.PORT,
      GraphItemTypes.ALL
    ]
  })

  // add a label to each created node
  mode.addNodeCreatedListener((sender, args) => {
    const graph = mode.graphComponent.graph
    graph.addLabel(args.item, `Node ${graph.nodes.size}`)
  })

  // the handles should be moved together with the ghost visualization of the label
  mode.moveLabelInputMode.visualization = Visualization.LIVE

  graphComponent.inputMode = mode
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// run the demo
loadJson().then(run)
