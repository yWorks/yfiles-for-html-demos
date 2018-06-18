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
 * Getting Started - 05 Placing Labels
 * This demo shows how to control label placement with the help of label model parameters.
 * Label positions are not usually specified through explicit (absolute or relative)
 * coordinates. Instead, so called {@link yfiles.graph.ILabelModelParameter}s are used, which
 * encode a specific symbolic position in a specific {@link yfiles.graph.ILabelModel}.
 * For example, {@link yfiles.graph.InteriorLabelModel#NORTH_WEST} encodes a label position in the
 * upper left corner inside the <code>INode</code> that owns the label, without having to explicitly
 * determine the coordinates yourself.
 *
 * Label models are also used for interactive placement of labels (you can only drag to
 * valid positions in the given label model) as well as for the various automatic labeling algorithms.
 */
require(['yfiles/view-editor', 'resources/demo-app', 'resources/license'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.graph.IGraph} */
  let graph = null

  function run() {
    // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
    graphComponent = new yfiles.view.GraphComponent('#graphComponent')
    // conveniently store a reference to the graph that is displayed
    graph = graphComponent.graph

    // /////////////// New in this Sample /////////////////

    // Configures default label model parameters for newly created graph elements
    setDefaultLabelParameters()

    // ////////////////////////////////////////////////////

    // Configures default styles for newly created graph elements
    setDefaultStyles()

    // Populates the graph and overrides some styles and label models
    populateGraph()

    // Manages the viewport
    updateViewport()

    // bind the demo buttons to their commands
    registerCommands()

    // Initialize the demo application's CSS and Javascript for the description
    app.show(graphComponent)
  }

  /**
   * Set up default label model parameters for graph elements.
   * Label model parameters control the actual label placement as well as the available
   * placement candidates when moving the label interactively.
   */
  function setDefaultLabelParameters() {
    // For node labels, the default is a label position at the node center
    // Let's keep the default.  Here is how to set it manually
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.InteriorLabelModel.CENTER

    // Set the label model for edges
    graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.SmartEdgeLabelModel({
      autoRotation: true
    }).createParameterFromSource(0, 10.0, 0.5)
  }

  /**
   * Creates a sample graph and introduces all important graph elements present in
   * yFiles for HTML. Additionally, this method now overrides the label placement for some specific labels.
   */
  function populateGraph() {
    // ////////// Sample node creation ///////////////////

    // Creates two nodes with the default node size
    // The location is specified for the _center_
    const node1 = graph.createNodeAt(new yfiles.geometry.Point(30, 30))
    const node2 = graph.createNodeAt(new yfiles.geometry.Point(150, 30))
    // Creates a third node with a different size of 60x30
    // In this case, the location of (400,400) describes the _upper left_
    // corner of the node bounds
    const node3 = graph.createNode(new yfiles.geometry.Rect(230, 200, 60, 30))

    // ///////////////////////////////////////////////////

    // ////////// Sample edge creation ///////////////////

    // Creates some edges between the nodes
    graph.createEdge(node1, node2)
    const edge = graph.createEdge(node2, node3)

    // ///////////////////////////////////////////////////

    // ////////// Using Bends ////////////////////////////

    // Creates the first bend for edge at (260, 30)
    graph.addBend(edge, new yfiles.geometry.Point(260, 30))

    // ///////////////////////////////////////////////////

    // ////////// Using Ports ////////////////////////////

    // Actually, edges connect "ports", not nodes directly.
    // If necessary, you can manually create ports at nodes
    // and let the edges connect to these.
    // Creates a port in the center of the node layout
    const port1AtNode1 = graph.addPort(
      node1,
      yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    )

    // Creates a port at the middle of the left border
    // Note to use absolute locations when placing ports using PointD.
    const port1AtNode3 = graph.addPortAt(
      node3,
      new yfiles.geometry.Point(node3.layout.x, node3.layout.center.y)
    )

    // Creates an edge that connects these specific ports
    const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

    // ///////////////////////////////////////////////////

    // ////////// Sample label creation ///////////////////

    // Adds labels to several graph elements
    graph.addLabel(node1, 'n1')
    graph.addLabel(node2, 'n2')
    const n3Label = graph.addLabel(node3, 'n3')
    graph.addLabel(edgeAtPorts, 'Edge at Ports')

    // ///////////////////////////////////////////////////
    // Override default label placement

    // For our "special" label, we use a model that describes discrete positions
    // outside the node bounds
    const exteriorLabelModel = new yfiles.graph.ExteriorLabelModel()

    // We use some extra insets from the label to the node bounds
    exteriorLabelModel.insets = new yfiles.geometry.Insets(5)

    // We assign this label a specific symbolic position out of the eight possible
    // external locations valid for ExteriorLabelModel
    graph.setLabelLayoutParameter(
      n3Label,
      exteriorLabelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH)
    )
  }

  /**
   * Set up default styles for graph elements.
   * Default styles apply only to elements created after the default style has been set,
   * so typically, you'd set these as early as possible in your application.
   */
  function setDefaultStyles() {
    // Sets the default style for nodes
    // Creates a nice ShinyPlateNodeStyle instance, using an orange Fill.
    // Sets this style as the default for all nodes that don't have another
    // style assigned explicitly
    graph.nodeDefaults.style = new yfiles.styles.ShinyPlateNodeStyle({
      fill: 'rgb(255, 140, 0)'
    })

    // Set the default style for edges
    // Use a red Pen with thickness 2.
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: '2px red',
      targetArrow: new yfiles.styles.Arrow({
        type: 'default',
        stroke: '2px red',
        fill: 'red'
      })
    })

    // Sets the default style for labels
    // Creates a label style with the label text color set to dark red
    // Sets the defined style as the default for both edge and node labels:
    const defaultLabelStyle = new yfiles.styles.DefaultLabelStyle({
      font: '12px Tahoma',
      textFill: 'darkred'
    })
    graph.edgeDefaults.labels.style = defaultLabelStyle
    graph.nodeDefaults.labels.style = defaultLabelStyle

    // Sets the default size explicitly to 40x40
    graph.nodeDefaults.size = [40, 40]
  }

  /**
   * Updates the content rectangle to encompass all existing graph elements.
   * If you create your graph elements programmatically, the content rectangle
   * (i.e. the rectangle in <b>world coordinates</b>
   * that encloses the graph) is <b>not</b> updated automatically to enclose these elements.
   * Typically, this manifests in wrong/missing scrollbars, incorrect {@link yfiles.view.GraphOverviewComponent}
   * behavior and the like.
   *
   * This method demonstrates several ways to update the content rectangle, with or without adjusting the zoom level
   * to show the whole graph in the view.
   *
   * Note that updating the content rectangle only does not change the current Viewport (i.e. the world coordinate
   * rectangle that corresponds to the currently visible area in view coordinates)
   *
   * Uncomment various combinations of lines in this method and observe the different effects.
   *
   * The following demos in this tutorial will assume that you've called <code>GraphComponent.fitGraphBounds()</code>
   * in this method.
   */
  function updateViewport() {
    // Uncomment the following line to update the content rectangle
    // to include all graph elements
    // This should result in correct scrolling behaviour:

    // graphComponent.updateContentRect();

    // Additionally, we can also set the zoom level so that the
    // content rectangle fits exactly into the viewport area:
    // Uncomment this line in addition to UpdateContentRect:
    // Note that this changes the zoom level (i.e. the graph elements will look smaller)

    // graphComponent.fitContent();

    // The sequence above is equivalent to just calling:
    graphComponent.fitGraphBounds()
  }

  function registerCommands() {
    const ICommand = yfiles.input.ICommand

    app.bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  }

  // start tutorial
  run()
})
