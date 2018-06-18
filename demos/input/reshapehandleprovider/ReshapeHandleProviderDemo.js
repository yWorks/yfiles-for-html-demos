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
 * Shows how to customize the resize behavior of nodes by implementing a
 * custom {@link yfiles.input.IReshapeHandleProvider}.
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'RedReshapeHandleProvider.js',
  'GreenReshapeHandleProvider.js',
  'OrangeReshapeHandleProvider.js',
  'LimitingRectangleDescriptor.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  RedReshapeHandleProvider,
  GreenReshapeHandleProvider,
  OrangeReshapeHandleProvider,
  LimitingRectangleDescriptor
) => {
  /**
   * Registers a callback function as a decorator that provides a custom
   * {@link yfiles.input.IReshapeHandleProvider} for each node.
   * This callback function is called whenever a node in the graph is queried
   * for its <code>IReshapeHandleProvider</code>. In this case, the 'node'
   * parameter will be set to that node and the 'delegateHandler' parameter
   * will be set to the reshape handle provider that would have been returned
   * without setting this function as a decorator.
   * @param {yfiles.graph.IGraph} graph The given graph
   * @param {yfiles.geometry.MutableRectangle} boundaryRectangle The rectangle that limits the node's size.
   */
  function registerReshapeHandleProvider(graph, boundaryRectangle) {
    const nodeDecorator = graph.decorator.nodeDecorator
    nodeDecorator.reshapeHandleProviderDecorator.setImplementationWrapper(
      (node, delegateProvider) => {
        // Obtain the tag from the node
        const nodeTag = node.tag

        // Check if it is a known tag and choose the respective implementation.
        // Fallback to the default behavior otherwise.
        if (typeof nodeTag !== 'string') {
          return delegateProvider
        } else if (nodeTag === 'orange') {
          // An implementation that delegates certain behavior to the default implementation
          return new OrangeReshapeHandleProvider(boundaryRectangle, delegateProvider)
        } else if (nodeTag === 'firebrick') {
          // A simple implementation that prohibits resizing
          return new RedReshapeHandleProvider()
        } else if (nodeTag === 'royalblue') {
          // An implementationOne that uses two levels of delegation to create a combined behavior
          return new OrangeReshapeHandleProvider(
            boundaryRectangle,
            new GreenReshapeHandleProvider(delegateProvider, node)
          )
        } else if (nodeTag === 'green') {
          // Another implementation that delegates certain behavior to the default implementation
          return new GreenReshapeHandleProvider(delegateProvider, node)
        }
        return delegateProvider
      }
    )
  }

  function run() {
    // initialize the GraphComponent
    const graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph

    // Create a default editor input mode
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode({
      // Just for user convenience: disable node, edge creation and clipboard operations,
      allowCreateEdge: false,
      allowCreateNode: false,
      allowClipboardOperations: false, // don't allow moving nodes,
      movableItems: yfiles.graph.GraphItemTypes.NONE
    })
    // and enable the undo feature.
    graph.undoEngineEnabled = true

    // Finally, set the input mode to the graph component.
    graphComponent.inputMode = graphEditorInputMode

    // Create the rectangle that limits the movement of some nodes
    // and add it to the graphComponent.
    const boundaryRectangle = new yfiles.geometry.MutableRectangle(20, 20, 480, 400)
    graphComponent.backgroundGroup.addChild(boundaryRectangle, new LimitingRectangleDescriptor())

    registerReshapeHandleProvider(graph, boundaryRectangle)

    createSampleGraph(graph)

    app.show(graphComponent)
  }

  /**
   * Creates the sample graph of this demo.
   * @param {yfiles.graph.IGraph} graph The input graph
   */
  function createSampleGraph(graph) {
    createNode(graph, 80, 100, 140, 30, 'firebrick', 'whitesmoke', 'Fixed Size')
    createNode(graph, 300, 100, 140, 30, 'green', 'whitesmoke', 'Keep Aspect Ratio')
    createNode(graph, 80, 260, 140, 30, 'orange', 'black', 'Limited to Rectangle')
    createNode(
      graph,
      300,
      250,
      140,
      50,
      'royalblue',
      'whitesmoke',
      'Limited to Rectangle\nand Keep Aspect Ratio'
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

  run()
})
