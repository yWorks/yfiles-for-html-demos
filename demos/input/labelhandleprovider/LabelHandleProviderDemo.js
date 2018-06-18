/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

/**
 * Shows how to achieve interactive resize behavior for labels by implementing a custom
 * {@link yfiles.input.IHandleProvider} and {@link yfiles.input.IHandle}.
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'LabelHandleProvider.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  LabelHandleProvider
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeGraph()

    initializeInputMode()

    registerCommands()

    app.show(graphComponent)
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
    yfiles.styles.TemplateLabelStyle.CONVERTERS.demoBindings = demoBindings
    demoBindings.halfConverter = value => value * 0.5
    demoBindings.flippedHandlePosition = height => height + 15
    demoBindings.showUpsideHandle = isUpsideDown => (isUpsideDown ? '0' : '3')
    demoBindings.showFlippedHandle = isUpsideDown => (isUpsideDown ? '3' : '0')
    const templateLabelStyle = new yfiles.styles.StringTemplateLabelStyle(templateString)

    const labelDecorationInstaller = new yfiles.view.LabelStyleDecorationInstaller({
      labelStyle: templateLabelStyle
    })

    graphComponent.graph.decorator.labelDecorator.selectionDecorator.setImplementation(
      label =>
        label.layoutParameter.model instanceof yfiles.graph.FreeNodeLabelModel ||
        label.layoutParameter.model instanceof yfiles.graph.FreeEdgeLabelModel ||
        label.layoutParameter.model instanceof yfiles.graph.FreeLabelModel,
      labelDecorationInstaller
    )

    DemoStyles.initDemoStyles(graph)
    graphComponent.graph.nodeDefaults.size = new yfiles.geometry.Size(100, 50)

    // create a label style that shows the labels bounds
    const labelStyle = new yfiles.styles.DefaultLabelStyle({
      backgroundFill: 'rgb(119, 204, 255)',
      backgroundStroke: 'lightgray',
      horizontalTextAlignment: 'center'
    })
    graph.nodeDefaults.labels.style = labelStyle
    // Our resize logic does not work together with all label models resp. label model parameters
    // for simplicity, we just use a centered label for nodes
    graph.nodeDefaults.labels.layoutParameter = new yfiles.graph.GenericLabelModel(
      yfiles.graph.InteriorLabelModel.CENTER
    ).createDefaultParameter()

    graph.edgeDefaults.labels.style = labelStyle

    const labelModel = new yfiles.graph.EdgeSegmentLabelModel({ distance: 10 })
    graph.edgeDefaults.labels.layoutParameter = labelModel.createParameterFromSource(
      0,
      0.5,
      yfiles.graph.EdgeSides.RIGHT_OF_EDGE
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
          layoutParameter: new yfiles.graph.FreeNodeLabelModel().createParameter(
            [0.5, 0.5],
            [0, 0],
            [0.5, 0.5],
            [0, 0],
            0
          ),
          style: new yfiles.styles.DefaultLabelStyle({
            backgroundFill: 'rgb(119, 204, 255)',
            backgroundStroke: 'lightgray',
            horizontalTextAlignment: 'center',
            autoFlip: false
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
   * @param {yfiles.graph.ILabel} label The given label
   * @return {LabelHandleProvider}
   */
  function getLabelHandleProvider(label) {
    return new LabelHandleProvider(label)
  }

  /**
   * Initializes the input mode.
   */
  function initializeInputMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      // customize hit test order to simplify click selecting labels
      clickHitTestOrder: [
        yfiles.graph.GraphItemTypes.EDGE_LABEL,
        yfiles.graph.GraphItemTypes.NODE_LABEL,
        yfiles.graph.GraphItemTypes.BEND,
        yfiles.graph.GraphItemTypes.EDGE,
        yfiles.graph.GraphItemTypes.NODE,
        yfiles.graph.GraphItemTypes.PORT,
        yfiles.graph.GraphItemTypes.ALL
      ]
    })

    // add a label to each created node
    mode.addNodeCreatedListener((sender, args) => {
      const graph = mode.graphComponent.graph
      graph.addLabel(args.item, `Node ${graph.nodes.size}`)
    })

    // the handles should be moved together with the ghost visualization of the label
    mode.moveLabelInputMode.visualization = yfiles.input.Visualization.LIVE

    graphComponent.inputMode = mode
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
  }

  // run the demo
  run()
})
