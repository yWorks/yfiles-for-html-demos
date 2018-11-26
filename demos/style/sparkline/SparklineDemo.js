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
    resources: '../../resources/',
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'SparklineNodeStyle.js',
  'yfiles/view-graphml',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, SparklineNodeStyle) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // initialize the graph
    initializeGraph()

    // open the sample graph
    const graphMLIOHandler = new yfiles.graphml.GraphMLIOHandler()
    graphMLIOHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yfilesHTML/demos/',
      'SparklineNodeStyle',
      SparklineNodeStyle.$class
    )
    app.readGraph(graphMLIOHandler, graphComponent.graph, 'resources/sample.graphml').then(() => {
      graphComponent.fitGraphBounds()
    })

    // set an interval to randomly change the sparkline data of some nodes
    setTimeout(modifyData.bind(this), 500)

    // prevent very large bitmaps
    graphComponent.maximumZoom = 10

    // initialize the input mode
    graphComponent.inputMode = createInputMode()

    // bind UI elements to actions
    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Continuously modifies the node data used as the input for the
   * sparkline visualization to simulate updating data from a server.
   */
  function modifyData() {
    graphComponent.graph.nodes.forEach(node => {
      if (Math.floor(Math.random() * 10) === 1) {
        node.tag = createRandomSparklineData()
      }
    })
    // make the graphComponent repaint it's content
    graphComponent.invalidate()
    // continuously modify the data
    setTimeout(modifyData.bind(this), 500)
  }

  function initializeGraph() {
    const graph = graphComponent.graph

    // use the sparkline style as default node style
    graph.nodeDefaults.style = new SparklineNodeStyle()
    graph.nodeDefaults.size = new yfiles.geometry.Size(100, 50)

    // set default label model parameter
    const exteriorLabelModel = new yfiles.graph.ExteriorLabelModel({ insets: 3 })
    graph.nodeDefaults.labels.layoutParameter = exteriorLabelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.NORTH
    )

    // set default label style
    graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      backgroundFill: 'rgba(255, 255, 255, 150)'
    })

    // set default edge style
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle()
  }

  /**
   * Creates an array with random data.
   * @return {Object}
   */
  function createRandomSparklineData() {
    const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < 10; i++) {
      data[i] = Math.floor(Math.random() * 10 + 1)
    }
    return data
  }

  /**
   * @return {yfiles.input.IInputMode}
   */
  function createInputMode() {
    const mode = new yfiles.input.GraphEditorInputMode()

    // put random data in tag of created node
    mode.addNodeCreatedListener((sender, args) => {
      args.item.tag = createRandomSparklineData()
    })
    return mode
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
  }

  run()
})
