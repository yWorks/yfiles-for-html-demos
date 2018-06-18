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

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    prepareSampleGraph()

    configureLassoSelection()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initialize lasso selection.
   */
  function configureLassoSelection() {
    const inputMode = new yfiles.input.GraphEditorInputMode()
    const lassoSelectionInputMode = inputMode.lassoSelectionInputMode
    lassoSelectionInputMode.finishRadius = 10
    lassoSelectionInputMode.enabled = true
    graphComponent.inputMode = inputMode
  }

  /**
   * Sets the selection style. This can either be free-hand or polyline lasso selection or marquee selection as a
   * reference.
   * @param {'free-hand-selection'|'polyline-selection'|'marquee-selection'} style
   */
  function setSelectionStyle(style) {
    const lassoSelectionInputMode = graphComponent.inputMode.lassoSelectionInputMode

    switch (style) {
      default:
      case 'free-hand-selection':
        lassoSelectionInputMode.dragFreeRecognizer = yfiles.input.MouseEventRecognizers.LEFT_DRAG
        // never start a segment in free-hand lasso selection
        lassoSelectionInputMode.startSegmentRecognizer = yfiles.input.EventRecognizers.NEVER
        lassoSelectionInputMode.endSegmentRecognizer = yfiles.input.MouseEventRecognizers.LEFT_DOWN
        lassoSelectionInputMode.dragSegmentRecognizer = yfiles.input.MouseEventRecognizers.MOVE
        lassoSelectionInputMode.finishRecognizer = yfiles.input.MouseEventRecognizers.LEFT_UP

        lassoSelectionInputMode.dragFreeRecognizerTouch =
          yfiles.input.TouchEventRecognizers.TOUCH_MOVE_PRIMARY
        // never start a segment in free-hand lasso selection
        lassoSelectionInputMode.startSegmentRecognizerTouch = yfiles.input.EventRecognizers.NEVER
        lassoSelectionInputMode.endSegmentRecognizerTouch =
          yfiles.input.TouchEventRecognizers.TOUCH_DOWN_PRIMARY
        lassoSelectionInputMode.dragSegmentRecognizerTouch =
          yfiles.input.TouchEventRecognizers.TOUCH_MOVE_PRIMARY
        lassoSelectionInputMode.finishRecognizerTouch =
          yfiles.input.TouchEventRecognizers.TOUCH_UP_PRIMARY

        lassoSelectionInputMode.enabled = true
        break
      case 'polyline-selection':
        lassoSelectionInputMode.dragFreeRecognizer = yfiles.input.MouseEventRecognizers.LEFT_DRAG
        // always start a segment in free-hand lasso selection
        lassoSelectionInputMode.startSegmentRecognizer = yfiles.input.EventRecognizers.ALWAYS
        // end a segment with click
        lassoSelectionInputMode.endSegmentRecognizer = yfiles.input.EventRecognizers.createOrRecognizer(
          yfiles.input.MouseEventRecognizers.LEFT_DOWN,
          yfiles.input.MouseEventRecognizers.LEFT_UP
        )
        lassoSelectionInputMode.dragSegmentRecognizer =
          yfiles.input.MouseEventRecognizers.MOVE_OR_DRAG
        lassoSelectionInputMode.finishRecognizer =
          yfiles.input.MouseEventRecognizers.LEFT_DOUBLE_CLICK

        lassoSelectionInputMode.dragFreeRecognizerTouch =
          yfiles.input.TouchEventRecognizers.TOUCH_MOVE_PRIMARY
        // always start a segment in free-hand lasso selection
        lassoSelectionInputMode.startSegmentRecognizerTouch = yfiles.input.EventRecognizers.ALWAYS
        // end a segment with tap
        lassoSelectionInputMode.endSegmentRecognizerTouch = yfiles.input.EventRecognizers.createOrRecognizer(
          yfiles.input.TouchEventRecognizers.TOUCH_DOWN_PRIMARY,
          yfiles.input.TouchEventRecognizers.TOUCH_UP_PRIMARY
        )
        lassoSelectionInputMode.dragSegmentRecognizerTouch =
          yfiles.input.TouchEventRecognizers.TOUCH_MOVE_PRIMARY
        lassoSelectionInputMode.finishRecognizerTouch =
          yfiles.input.TouchEventRecognizers.TOUCH_DOUBLE_TAP_PRIMARY

        lassoSelectionInputMode.enabled = true
        break
      case 'marquee-selection':
        // disable lasso selection
        lassoSelectionInputMode.enabled = false
        break
    }
  }

  /**
   * Specifies the radius around the start point in which the lasso can be closed. When the lasso is dragged near this
   * point, this circle is highlighted.
   * @param {number} radius
   */
  function setFinishRadius(radius) {
    graphComponent.inputMode.lassoSelectionInputMode.finishRadius = radius
  }

  /**
   * Decorates the lasso testable lookup to provide different modes of when a node is selected.
   * @param {'nodes-complete'|'nodes-intersected'|'nodes-center'} mode
   */
  function setLassoTestables(mode) {
    const lassoTestableDecorator =
      graphComponent.graph.decorator.nodeDecorator.lassoTestableDecorator
    if (mode === 'nodes-complete') {
      // the nodes must be completely contained in the lasso to end up in the selection
      lassoTestableDecorator.setFactory(
        node =>
          new yfiles.input.ILassoTestable(
            (context, lassoPath) =>
              !lassoPath.intersects(node.layout.toRect(), 0) &&
              lassoPath.areaContains(node.layout.center)
          )
      )
    } else if (mode === 'nodes-intersected') {
      // the nodes must be intersected by the lasso to end up in the selection
      lassoTestableDecorator.setFactory(node =>
        yfiles.input.LassoTestables.fromRectangle(node.layout)
      )
    } else if (mode === 'nodes-center') {
      // the nodes' center must be contained in the lasso to end up in the selection
      lassoTestableDecorator.setFactory(node =>
        yfiles.input.LassoTestables.fromPoint(node.layout.center)
      )
    }
  }

  /**
   * Creates the sample graph and initializes undo-redo-functionality.
   */
  function prepareSampleGraph() {
    const graph = graphComponent.graph
    graph.undoEngineEnabled = true
    DemoStyles.initDemoStyles(graph)

    const locations = [
      [317, 87],
      [291, 2],
      [220, 0],
      [246, 73],
      [221, 144],
      [150, 180],
      [142, 251],
      [213, 286],
      [232, 215],
      [71, 285],
      [0, 320]
    ]
    const nodes = []
    locations.forEach(location => {
      nodes.push(graph.createNodeAt(location))
    })

    graph.createEdge(nodes[2], nodes[1])
    graph.createEdge(nodes[1], nodes[0])
    graph.createEdge(nodes[0], nodes[3])
    graph.createEdge(nodes[3], nodes[2])
    graph.createEdge(nodes[3], nodes[1])
    graph.createEdge(nodes[4], nodes[3])
    graph.createEdge(nodes[4], nodes[5])
    graph.createEdge(nodes[8], nodes[4])
    graph.createEdge(nodes[7], nodes[8])
    graph.createEdge(nodes[7], nodes[6])
    graph.createEdge(nodes[6], nodes[5])
    graph.createEdge(nodes[6], nodes[9])
    graph.createEdge(nodes[9], nodes[10])

    graphComponent.fitGraphBounds()
    graph.undoEngine.clear()
  }

  /**
   * Binds actions to the toolbar elements.
   */
  function registerCommands() {
    app.bindChangeListener("select[data-command='ChooseSelectionStyle']", value =>
      setSelectionStyle(value)
    )
    app.bindChangeListener("input[data-command='ChooseFinishRadius']", value =>
      setFinishRadius(Number.parseFloat(value))
    )
    app.bindChangeListener("select[data-command='ChooseLassoTestable']", value =>
      setLassoTestables(value)
    )
  }

  run()
})
