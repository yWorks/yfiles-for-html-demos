/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
require([
  'yfiles/view-editor',
  'resources/demo-app',
  './CityLabelStyle.js',
  'resources/sample.js',
  './MapVisualCreator.js',
  'yfiles/view-layout-bridge',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  CityLabelStyle,
  Sample,
  MapVisualCreator
) => {
  /**
   * The graph component.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Holds whether or not a layout is in progress.
   * @type {boolean}
   */
  let inLayout = false

  /**
   * Holds the available label models.
   * @type {Array}
   */
  let labelModels = []

  /**
   * Runs the demo.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // initialize the node label properties
    initializeOptions()

    // set the default styles for nodes and labels
    initializeGraph()

    // create the input mode
    initializeInputMode()

    // create the sample graph
    createSampleGraph()

    // wire up the UI
    registerCommands()

    // show the demo
    app.show(graphComponent)
  }

  /**
   * Initialize the node label options.
   */
  function initializeOptions() {
    const labelModelParameters = []
    let model = new yfiles.graph.ExteriorLabelModel({ insets: 5 })
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH))
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_EAST)
    )
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_WEST)
    )
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH))
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_EAST)
    )
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_WEST)
    )
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.EAST))
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.WEST))
    model = new yfiles.graph.ExteriorLabelModel({ insets: new yfiles.geometry.Insets(10) })
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH))
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_EAST)
    )
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_WEST)
    )
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH))
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_EAST)
    )
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_WEST)
    )
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.EAST))
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.WEST))
    model = new yfiles.graph.ExteriorLabelModel({ insets: new yfiles.geometry.Insets(15) })
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH))
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_EAST)
    )
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.NORTH_WEST)
    )
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH))
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_EAST)
    )
    labelModelParameters.push(
      model.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH_WEST)
    )
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.EAST))
    labelModelParameters.push(model.createParameter(yfiles.graph.ExteriorLabelModelPosition.WEST))

    const genericLabelModel = new yfiles.graph.GenericLabelModel(labelModelParameters[0])
    labelModelParameters.forEach(labelModelParameter => {
      const insets = labelModelParameter.model.insets.top
      let profit
      if (insets < 10) {
        profit = 1.0
      } else if (insets < 15) {
        profit = 0.9
      } else {
        profit = 0.8
      }
      const labelCandidateDescriptor = new yfiles.graph.LabelCandidateDescriptor()
      labelCandidateDescriptor.profit = profit
      genericLabelModel.addParameter(labelModelParameter, labelCandidateDescriptor)
    })

    labelModels = [
      new yfiles.graph.InteriorLabelModel(),
      new yfiles.graph.ExteriorLabelModel(),
      new yfiles.graph.FreeNodeLabelModel(),
      new yfiles.graph.SandwichLabelModel(),
      genericLabelModel
    ]
  }

  /**
   * Initializes node and label styles that are applied when the graph is created.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    // set the default style for nodes
    graph.nodeDefaults.style = new yfiles.styles.ShinyPlateNodeStyle({
      drawShadow: false,
      radius: 1,
      fill: 'orange'
    })

    // set the default size for nodes
    graph.nodeDefaults.size = new yfiles.geometry.Size(10, 10)

    // set the default style for labels
    const innerLabelStyle = new yfiles.styles.DefaultLabelStyle({
      textSize: 10,
      horizontalTextAlignment: yfiles.view.HorizontalTextAlignment.CENTER
    })
    graph.nodeDefaults.labels.style = new CityLabelStyle(innerLabelStyle)
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.ExteriorLabelModel.NORTH

    // add the background visual for the map
    graphComponent.backgroundGroup.addChild(
      new MapVisualCreator(),
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
  }

  /**
   * Creates the input mode.
   */
  function initializeInputMode() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      showHandleItems: yfiles.graph.GraphItemTypes.NONE,
      allowCreateEdge: false
    })
    // add a label for each newly created node
    inputMode.addNodeCreatedListener((sender, args) => {
      graphComponent.graph.addLabel(args.item, 'City')
    })
    graphComponent.inputMode = inputMode
  }

  /**
   * Configures the label models and runs the labeling algorithm.
   */
  function placeLabels() {
    if (inLayout) {
      return
    }
    const graph = graphComponent.graph
    setUIDisabled(true)

    const labelModelComboBox = document.getElementById('labelModelComboBox')
    const labelModel = labelModels[labelModelComboBox.selectedIndex]
    const sizeInput = document.getElementById('labelFontSizeField')

    // sets the label mode based on the selected value of the corresponding combo-box
    graph.labels.forEach(label => {
      if (yfiles.graph.INode.isInstance(label.owner)) {
        // if the default label model is not the selected, change it
        if (labelModel !== graph.nodeDefaults.labels.layoutParameter.model) {
          graph.setLabelLayoutParameter(label, labelModel.createDefaultParameter())
        }

        // sets the label size based on the selected value of the corresponding text-field
        const cityLabelStyle = label.style
        if (cityLabelStyle && cityLabelStyle.innerLabelStyle) {
          const updatedStyle = new yfiles.styles.DefaultLabelStyle({
            textSize: parseFloat(sizeInput.value),
            horizontalTextAlignment: yfiles.view.HorizontalTextAlignment.CENTER
          })
          graph.setStyle(label, new CityLabelStyle(updatedStyle))
        }
      }
    })
    // set as default label model parameter
    graph.nodeDefaults.labels.layoutParameter = labelModel.createDefaultParameter()
    const updatedStyle = new yfiles.styles.DefaultLabelStyle({
      textSize: parseFloat(sizeInput.value),
      horizontalTextAlignment: yfiles.view.HorizontalTextAlignment.CENTER
    })
    graph.nodeDefaults.labels.style = new CityLabelStyle(updatedStyle)
    graphComponent.invalidate()

    // apply the labeling algorithm
    const labelingAlgorithm = new yfiles.labeling.GenericLabeling()
    labelingAlgorithm.placeEdgeLabels = false
    labelingAlgorithm.removeEdgeOverlaps = true
    labelingAlgorithm.profitModel = new yfiles.layout.ExtendedLabelCandidateProfitModel()

    const layoutExecutor = new yfiles.layout.LayoutExecutor(
      graphComponent,
      graphComponent.graph,
      labelingAlgorithm
    )
    layoutExecutor.duration = '0.5s'
    layoutExecutor.easedAnimation = true
    layoutExecutor.animateViewport = false
    layoutExecutor.start().then(() => {
      setUIDisabled(false)
    })
  }

  /**
   * Changes the state of the UI's elements.
   * @param {boolean} disabled True if the UI elements should be enabled, false otherwise
   */
  function setUIDisabled(disabled) {
    inLayout = disabled
    document.getElementById('labelModelComboBox').disabled = disabled
    document.getElementById('labelFontSizeField').disabled = disabled
    document.getElementById('placeLabels').disabled = disabled
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
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent, 1.0)
    app.bindAction("button[data-command='PlaceLabels']", placeLabels)
    app.bindChangeListener("select[data-command='labelModelChanged']", placeLabels)
    document.getElementById('labelFontSizeField').addEventListener('change', placeLabels)
  }

  /**
   * Creates the sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph
    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = Sample.nodes
    builder.nodeIdBinding = 'id'
    builder.locationXBinding = 'x'
    builder.locationYBinding = 'y'
    builder.buildGraph()

    // adds the node labels
    graph.nodes.forEach(node => {
      graph.addLabel(node, `${node.tag.label}`)
    })

    // fit content
    graphComponent.fitGraphBounds()

    // places the node labels
    placeLabels()
  }

  // runs the demo
  run()
})
