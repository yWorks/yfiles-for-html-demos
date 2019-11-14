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

/**
 * Application Features - Label Text Wrapping
 *
 * This demo shows the different options of label text wrapping
 * built into {@link yfiles.styles.DefaultLabelStyle}.
 */
require(['yfiles/view-editor', 'resources/demo-app', 'resources/license'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * Bootstraps the demo.
   */
  function run() {
    // initialize graph component
    graphComponent = new yfiles.view.GraphComponent('#graphComponent')
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })
    graphComponent.graph.undoEngineEnabled = true

    // configures default styles for newly created graph elements
    initTutorialDefaults()

    // Configure default label model parameters for newly created graph elements
    setDefaultLabelLayoutParameters()

    // add a sample graph
    createGraph()

    // bind the buttons to their commands
    registerCommands()

    // initialize the application's CSS and JavaScript for the description
    app.show(graphComponent)
  }

  /**
   * Sets up default label model parameters for graph elements.
   * Label model parameters control the actual label placement as well as the available
   * placement candidates when moving the label interactively.
   */
  function setDefaultLabelLayoutParameters() {
    // Use a label model that stretches the label over the full node layout, with small insets. The label style
    // is responsible for drawing the label in the given space. Depending on its implementation, it can either
    // ignore the given space, clip the label at the width or wrapping the text.
    // See the createGraph function where labels are added with different style options.
    const centerLabelModel = new yfiles.graph.InteriorStretchLabelModel({ insets: 5 })
    graphComponent.graph.nodeDefaults.labels.layoutParameter = centerLabelModel.createParameter(
      yfiles.graph.InteriorStretchLabelModelPosition.CENTER
    )
  }

  /**
   * Initializes the defaults for the styles in this tutorial.
   */
  function initTutorialDefaults() {
    const graph = graphComponent.graph

    // configure defaults normal nodes and their labels
    graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
      fill: 'darkorange',
      stroke: 'white'
    })
    graph.nodeDefaults.size = new yfiles.geometry.Size(40, 40)
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      verticalTextAlignment: 'center',
      wrapping: 'word_ellipsis'
    })
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.ExteriorLabelModel.SOUTH

    // configure defaults group nodes and their labels
    graph.groupNodeDefaults.style = new yfiles.styles.PanelNodeStyle({
      color: 'rgb(214, 229, 248)',
      insets: [18, 5, 5, 5],
      labelInsetsColor: 'rgb(214, 229, 248)'
    })
    graph.groupNodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      horizontalTextAlignment: 'right'
    })
    graph.groupNodeDefaults.labels.layoutParameter = yfiles.graph.InteriorStretchLabelModel.NORTH
  }

  /**
   * Creates a simple sample graph.
   */
  function createGraph() {
    // label model and style for the description labels north of the node
    const northLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 10 })
    const northParameter = northLabelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.NORTH
    )
    const northLabelStyle = new yfiles.styles.DefaultLabelStyle({
      horizontalTextAlignment: 'center'
    })

    // create nodes
    const graph = graphComponent.graph
    const node1 = graph.createNode(new yfiles.geometry.Rect(0, 0, 100, 100))
    const node2 = graph.createNode(new yfiles.geometry.Rect(160, 0, 100, 100))
    const node3 = graph.createNode(new yfiles.geometry.Rect(320, 0, 100, 100))
    const node4 = graph.createNode(new yfiles.geometry.Rect(480, 0, 100, 100))
    const node5 = graph.createNode(new yfiles.geometry.Rect(640, 0, 100, 100))

    // use a label model that stretches the label over the full node layout, with small insets
    const centerLabelModel = new yfiles.graph.InteriorStretchLabelModel({ insets: 5 })
    const centerParameter = centerLabelModel.createParameter(
      yfiles.graph.InteriorStretchLabelModelPosition.CENTER
    )

    // the text that should be displayed
    const longText = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
    const font = new yfiles.view.Font({ fontSize: 16 })

    // A label that does not wrap at all. By default, it is clipped at the given bounds, though this can also be
    // disabled with the clipText property of the DefaultLabelStyle.
    const noWrappingStyle = new yfiles.styles.DefaultLabelStyle({
      font,
      wrapping: 'none',
      verticalTextAlignment: 'center'
    })
    graph.addLabel(node1, longText, centerParameter, noWrappingStyle)
    graph.addLabel(node1, 'No Wrapping', northParameter, northLabelStyle)

    // A label that is wrapped at word boundaries.
    const wordWrappingStyle = new yfiles.styles.DefaultLabelStyle({
      font,
      wrapping: 'word',
      verticalTextAlignment: 'center'
    })
    graph.addLabel(node2, longText, centerParameter, wordWrappingStyle)
    graph.addLabel(node2, 'Word Wrapping', northParameter, northLabelStyle)

    // A label that is wrapped at single characters.
    const characterWrappingStyle = new yfiles.styles.DefaultLabelStyle({
      font,
      wrapping: 'character',
      verticalTextAlignment: 'center'
    })
    graph.addLabel(node3, longText, centerParameter, characterWrappingStyle)
    graph.addLabel(node3, 'Character Wrapping', northParameter, northLabelStyle)

    // A label that is wrapped at word boundaries but also renders ellipsis if there is not enough space.
    const ellipsisWordWrappingStyle = new yfiles.styles.DefaultLabelStyle({
      font,
      wrapping: 'word_ellipsis',
      verticalTextAlignment: 'center'
    })
    graph.addLabel(node4, longText, centerParameter, ellipsisWordWrappingStyle)
    graph.addLabel(node4, 'Word Wrapping\nwith Ellipsis', northParameter, northLabelStyle)

    // A label that is wrapped at  single charactes but also renders ellipsis if there is not enough space.
    const ellipsisCharacterWrappingStyle = new yfiles.styles.DefaultLabelStyle({
      font,
      wrapping: 'character_ellipsis',
      verticalTextAlignment: 'center'
    })
    graph.addLabel(node5, longText, centerParameter, ellipsisCharacterWrappingStyle)
    graph.addLabel(node5, 'Character Wrapping\nwith Ellipsis', northParameter, northLabelStyle)

    graph.undoEngine.clear()
    graphComponent.fitGraphBounds()
  }

  /**
   * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
   */
  function registerCommands() {
    const ICommand = yfiles.input.ICommand
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    })
    app.bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
    app.bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
    app.bindCommand(
      "button[data-command='GroupSelection']",
      ICommand.GROUP_SELECTION,
      graphComponent
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      ICommand.UNGROUP_SELECTION,
      graphComponent
    )
  }

  // start tutorial
  run()
})
