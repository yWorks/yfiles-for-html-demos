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
 * Shows how to customize and restrict the movement behavior of nodes
 * by implementing a custom {@link yfiles.input.IPositionHandler}.
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'RedPositionHandler.js',
  'OrangePositionHandler.js',
  'GreenPositionHandler.js',
  'LimitedRectangleDescriptor.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  util,
  DemoStyles,
  RedPositionHandler,
  OrangePositionHandler,
  GreenPositionHandler,
  LimitingRectangleDescriptor
) => {
  /**
   * Registers a callback function as decorator that provides a custom
   * {@link yfiles.input.IPositionHandler} for each node.
   * This callback function is called whenever a node in the graph is queried
   * for its <code>IPositionHandler</code>. In this case, the 'node' parameter will be set
   * to that node and the 'delegateHandler' parameter will be set to the
   * position handler that would have been returned without setting this
   * function as decorator.
   * @param {yfiles.graph.IGraph} graph The given graph
   * @param {yfiles.geometry.MutableRectangle} boundaryRectangle The rectangle that limits the nodes position.
   * @return {yfiles.input.IPositionHandler}
   */
  function registerPositionHandler(graph, boundaryRectangle) {
    const nodeDecorator = graph.decorator.nodeDecorator
    nodeDecorator.positionHandlerDecorator.setImplementationWrapper((node, delegateHandler) => {
      // Obtain the tag from the node
      const nodeTag = node.tag

      // Check if it is a known tag and choose the respective implementation.
      // Fallback to the default behavior otherwise.
      if (typeof nodeTag !== 'string') {
        return delegateHandler
      } else if (nodeTag === 'orange') {
        // This implementation delegates certain behavior to the default implementation
        return new OrangePositionHandler(boundaryRectangle, node, delegateHandler)
      } else if (nodeTag === 'firebrick') {
        // A simple implementation that prohibits moving
        return new RedPositionHandler()
      } else if (nodeTag === 'royalblue') {
        // Implementation that uses two levels of delegation to create a combined behavior
        return new OrangePositionHandler(
          boundaryRectangle,
          node,
          new GreenPositionHandler(delegateHandler)
        )
      } else if (nodeTag === 'green') {
        // Another implementation that delegates certain behavior to the default implementation
        return new GreenPositionHandler(delegateHandler)
      }
      return delegateHandler
    })
  }

  function run() {
    // initialize the GraphComponent
    const graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph

    // Create a default editor input mode
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode()

    // Just for user convenience: disable node, edge creation and clipboard operations,
    graphEditorInputMode.allowCreateEdge = false
    graphEditorInputMode.allowCreateNode = false
    graphEditorInputMode.allowClipboardOperations = false
    // don't show resize handles,
    graphEditorInputMode.showHandleItems = yfiles.graph.GraphItemTypes.NONE
    // and enable the undo feature.
    graph.undoEngineEnabled = true

    // Finally, set the input mode to the graph component.
    graphComponent.inputMode = graphEditorInputMode

    // Create the rectangle that limits the movement of some nodes
    // and add it to the graphComponent.
    const boundaryRectangle = new yfiles.geometry.MutableRectangle(20, 20, 480, 400)
    graphComponent.backgroundGroup.addChild(boundaryRectangle, new LimitingRectangleDescriptor())

    registerPositionHandler(graph, boundaryRectangle)

    createSampleGraph(graph)

    util.show()
  }

  /**
   * Creates the sample graph of this demo.
   * @param {yfiles.graph.IGraph} graph The input graph
   */
  function createSampleGraph(graph) {
    createNode(graph, 100, 100, 100, 30, 'firebrick', 'whitesmoke', 'Unmovable')
    createNode(graph, 300, 100, 100, 30, 'green', 'whitesmoke', 'One Axis')
    createNode(graph, 80, 250, 140, 40, 'orange', 'black', 'Limited to Rectangle')
    createNode(
      graph,
      280,
      250,
      140,
      40,
      'royalblue',
      'whitesmoke',
      'Limited to Rectangle\nand One Axis'
    )

    // clear undo after initial graph loading
    graph.undoEngine.clear()
  }

  /**
   * Creates a sample node for this demo.
   * @param {yfiles.graph.IGraph} graph The given graph
   * @param {number} x The node's x-coordinate
   * @param {number} y The node's y-coordinate
   * @param {number} w The node's width
   * @param {number} h The node's height
   * @param {string} cssClass The given css class
   * @param {string} textColor The color of the text
   * @param {string} labelText The nodes label's text
   */
  function createNode(graph, x, y, w, h, cssClass, textColor, labelText) {
    const textLabelStyle = new yfiles.styles.DefaultLabelStyle({
      textFill: textColor
    })

    const nodeStyle = new DemoStyles.DemoNodeStyle()
    nodeStyle.cssClass = cssClass

    const node = graph.createNode(new yfiles.geometry.Rect(x, y, w, h), nodeStyle, cssClass)
    graph.addLabel({
      owner: node,
      text: labelText,
      style: textLabelStyle
    })
  }

  // run the demo
  run()
})
