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
 * Application Features - Tooltips
 *
 * This demo show how to add tooltips to graph items.
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

    // enable tooltips
    initializeTooltips()

    // add a sample graph
    createGraph()

    // bind the buttons to their commands
    registerCommands()

    // initialize the application's CSS and JavaScript for the description
    app.show(graphComponent)
  }

  /**
   * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
   * the {@link yfiles.input.MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
   * GraphEditorInputMode using the
   * {@link yfiles.input.ToolTipQueryEventArgs} parameter.
   * The {@link yfiles.input.ToolTipQueryEventArgs} parameter provides three relevant properties:
   * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
   * whether the tooltip was already set by one of possibly several tooltip providers. The
   * QueryLocation property contains the mouse position for the query in world coordinates.
   * The tooltip is set by setting the ToolTip property.
   */
  function initializeTooltips() {
    const inputMode = graphComponent.inputMode

    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = [15, 15]
    mouseHoverInputMode.delay = '500ms'
    mouseHoverInputMode.duration = '5s'

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener((src, eventArgs) => {
      if (eventArgs.handled) {
        // A tooltip has already been assigned => nothing to do.
        return
      }

      // We create a rich HTML element as tooltip. Alternatively, it may be a plain string, too.
      eventArgs.toolTip = createTooltip(eventArgs.item)

      // Indicate that the tooltip has been set.
      eventArgs.handled = true
    })
  }

  /**
   * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we show the latter.
   * We just extract the first label text from the given item and show it as tooltip.
   * @param {yfiles.graph.IModelItem} item
   */
  function createTooltip(item) {
    const title = document.createElement('h4')

    // depending on the item, show a different title
    if (yfiles.graph.INode.isInstance(item)) {
      title.innerHTML = 'Node Tooltip'
    } else if (yfiles.graph.IEdge.isInstance(item)) {
      title.innerHTML = 'Edge Tooltip'
    } else if (yfiles.graph.IPort.isInstance(item)) {
      title.innerHTML = 'Port Tooltip'
    } else if (yfiles.graph.ILabel.isInstance(item)) {
      title.innerHTML = 'Label Tooltip'
    }

    // extract the first label from the item
    let label = ''
    if (
      yfiles.graph.INode.isInstance(item) ||
      yfiles.graph.IEdge.isInstance(item) ||
      yfiles.graph.IPort.isInstance(item)
    ) {
      if (item.labels.size > 0) {
        label = item.labels.first().text
      }
    } else if (yfiles.graph.ILabel.isInstance(item)) {
      label = item.text
    }
    const text = document.createElement('p')
    text.innerHTML = `Label: ${label}`

    // build the tooltip container
    const tooltip = document.createElement('div')
    app.addClass(tooltip, 'tooltip')
    tooltip.appendChild(title)
    tooltip.appendChild(text)
    return tooltip
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
    const graph = graphComponent.graph

    const node1 = graph.createNodeAt({ location: [127.07, 20], labels: 'Node 1' })
    const node2 = graph.createNodeAt({ location: [181.09, 138], labels: 'Node 2' })
    const node3 = graph.createNodeAt({ location: [73.05, 138], labels: 'Node 3' })
    const node4 = graph.createNodeAt({ location: [30, 281], labels: 'Node 4' })
    const node5 = graph.createNodeAt({ location: [100, 281], labels: 'Node 5' })

    const group = graph.groupNodes({ children: [node1, node2, node3], labels: 'Group 1' })
    graph.setNodeLayout(group, new yfiles.geometry.Rect(47.05, -18, 160.05, 195))

    const edge1 = graph.createEdge({ source: node1, target: node2, labels: 'Edge 1' })
    const edge2 = graph.createEdge({ source: node1, target: node3, labels: 'Edge 2' })
    const edge3 = graph.createEdge({ source: node3, target: node4, labels: 'Edge 3' })
    const edge4 = graph.createEdge({ source: node3, target: node5, labels: 'Edge 4' })
    const edge5 = graph.createEdge({ source: node1, target: node5, labels: 'Edge 5' })

    graph.setPortLocation(edge1.sourcePort, new yfiles.geometry.Point(140.1, 40))
    graph.setPortLocation(edge1.targetPort, new yfiles.geometry.Point(181.09, 118))
    graph.setPortLocation(edge2.sourcePort, new yfiles.geometry.Point(113.74, 40))
    graph.setPortLocation(edge2.targetPort, new yfiles.geometry.Point(73.05, 118))
    graph.setPortLocation(edge3.sourcePort, new yfiles.geometry.Point(63.05, 158))
    graph.setPortLocation(edge3.targetPort, new yfiles.geometry.Point(30, 261))
    graph.setPortLocation(edge4.sourcePort, new yfiles.geometry.Point(83.05, 158))
    graph.setPortLocation(edge4.targetPort, new yfiles.geometry.Point(90, 261))
    graph.setPortLocation(edge5.sourcePort, new yfiles.geometry.Point(127.07, 40))
    graph.setPortLocation(edge5.targetPort, new yfiles.geometry.Point(110, 261))
    graph.addBends(edge1, [
      new yfiles.geometry.Point(140.4, 54),
      new yfiles.geometry.Point(181.09, 74)
    ])
    graph.addBends(edge2, [
      new yfiles.geometry.Point(113.74, 54),
      new yfiles.geometry.Point(73.05, 74)
    ])
    graph.addBends(edge3, [
      new yfiles.geometry.Point(63.05, 182),
      new yfiles.geometry.Point(30, 202)
    ])
    graph.addBends(edge4, [
      new yfiles.geometry.Point(83.05, 182),
      new yfiles.geometry.Point(88.05, 202),
      new yfiles.geometry.Point(88.05, 226),
      new yfiles.geometry.Point(90, 246)
    ])
    graph.addBends(edge5, [
      new yfiles.geometry.Point(127.07, 226),
      new yfiles.geometry.Point(110, 246)
    ])

    graph.edgeLabels.forEach(label => {
      const labelModel = new yfiles.graph.EdgeSegmentLabelModel({ autoRotation: false })
      graph.setLabelLayoutParameter(
        label,
        labelModel.createParameterFromSource(label.text !== 'Edge 5' ? 2 : 0, 0.5)
      )
    })

    graphComponent.fitGraphBounds()
    graph.undoEngine.clear()

    graphComponent.fitGraphBounds()
    graph.undoEngine.clear()
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
