/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  IGraph,
  ILabel,
  INode,
  License,
  Point,
  Size,
  WebGL2FocusIndicatorManager,
  WebGL2GraphModelManager,
  WebGL2HighlightIndicatorManager,
  WebGL2SelectionIndicatorManager
} from 'yfiles'

import { fetchLicense } from 'demo-resources/fetch-license'
import { checkWebGL2Support, finishLoading } from 'demo-resources/demo-page'
import { preloadWebGL2Styles } from './preload-webgl2-styles'
import {
  edgeFocusStyle,
  edgeHighlightStyle,
  edgeSelectionStyle,
  labelFocusStyle,
  labelHighlightStyle,
  labelSelectionStyle,
  nodeFocusStyle,
  nodeHighlightStyle,
  nodeSelectionStyle,
  webGL2EdgeStyles,
  webGL2LabelStyles,
  webGL2NodeStyles
} from './webgl2-styles'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import type { WebGL2EdgeStyle, WebGL2LabelStyle, WebGL2NodeStyle } from './webgl2-styles-util'

const webGLLoadingOverlay = document.querySelector('.webgl-loading')!

/**
 * A WebGL2GraphModelManager that uses callbacks for graph items to determine their WebGL2 styles.
 */
export class MyWebGL2GraphModelManager extends WebGL2GraphModelManager {
  constructor(
    private nodeStyle: (node: INode) => WebGL2NodeStyle,
    private edgeStyle: (edge: IEdge) => WebGL2EdgeStyle,
    private labelStyle: (label: ILabel) => WebGL2LabelStyle
  ) {
    super()
  }
  protected getWebGL2NodeStyle(node: INode) {
    return this.nodeStyle(node)
  }

  protected getWebGL2EdgeStyle(edge: IEdge) {
    return this.edgeStyle(edge)
  }

  protected getWebGL2LabelStyle(label: ILabel) {
    return this.labelStyle(label)
  }
}

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = await fetchLicense()

  const graphComponentWithoutPreload = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponentWithoutPreload)
  const graphComponentWithPreload = new GraphComponent('#graphComponentWithPreload')
  applyDemoTheme(graphComponentWithPreload)

  const demoNodeSize = new Size(40, 40)

  for (const graphComponent of [graphComponentWithoutPreload, graphComponentWithPreload]) {
    graphComponent.graph.nodeDefaults.size = demoNodeSize
    initDemoStyles(graphComponent.graph)

    initializeInteraction(graphComponent)

    createGraph(graphComponent.graph)
    graphComponent.fitGraphBounds()
  }

  document.getElementById('webgl-button')!.addEventListener('click', async () => {
    // show loading screen
    webGLLoadingOverlay.classList.add('loading')
    // wait for a frame to give the browser a chance to actually render the loading screen
    await new Promise(resolve => setTimeout(resolve, 0))
    // set rendering mode to WebGL2 on the component without preload to show the difference
    enableWebGLRendering(graphComponentWithoutPreload)
    // preload all the WebGL2 styles that we want to use
    await preloadWebGL2Styles(
      ...webGL2NodeStyles,
      ...webGL2EdgeStyles,
      ...webGL2LabelStyles,
      nodeSelectionStyle,
      nodeFocusStyle,
      nodeHighlightStyle,
      edgeSelectionStyle,
      edgeFocusStyle,
      edgeHighlightStyle,
      labelSelectionStyle,
      labelFocusStyle,
      labelHighlightStyle
    )
    // set rendering mode to WebGL2 only after the preload is finished
    // also hide loading screen when remaining shaders are compiled
    enableWebGLRendering(graphComponentWithPreload, () =>
      webGLLoadingOverlay.classList.remove('loading')
    )
  })
}

/**
 * Enables WebGL2 as the rendering technique.
 */
function enableWebGLRendering(graphComponent: GraphComponent, afterCompileAction?: () => void) {
  const myWebGL2GraphModelManager = new MyWebGL2GraphModelManager(
    node => webGL2NodeStyles[(node.tag || 0) % webGL2NodeStyles.length],
    edge => webGL2EdgeStyles[(edge.tag || 0) % webGL2EdgeStyles.length],
    label => webGL2LabelStyles[(label.tag || 0) % webGL2LabelStyles.length]
  )

  if (afterCompileAction) {
    myWebGL2GraphModelManager.addShadersCompiledListener(() => {
      afterCompileAction()
      myWebGL2GraphModelManager.removeShadersCompiledListener(afterCompileAction)
    })
  }

  graphComponent.graphModelManager = myWebGL2GraphModelManager

  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager({
    nodeStyle: nodeSelectionStyle,
    edgeStyle: edgeSelectionStyle,
    nodeLabelStyle: labelSelectionStyle
  })
  graphComponent.focusIndicatorManager = new WebGL2FocusIndicatorManager({
    nodeStyle: nodeFocusStyle,
    edgeStyle: edgeFocusStyle,
    nodeLabelStyle: labelFocusStyle
  })
  graphComponent.highlightIndicatorManager = new WebGL2HighlightIndicatorManager({
    nodeStyle: nodeHighlightStyle,
    edgeStyle: edgeHighlightStyle,
    nodeLabelStyle: labelHighlightStyle
  })
}

/**
 * Sets up an InputMode for the GraphComponent
 */
function initializeInteraction(graphComponent: GraphComponent): void {
  const inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.ALL,
    focusableItems: GraphItemTypes.NONE
  })
  // toggle highlight state on right click
  inputMode.addItemRightClickedListener((sender, { item }) => {
    const him = graphComponent.highlightIndicatorManager
    if (him) {
      const isHighlighted = him.selectionModel?.includes(item)
      if (isHighlighted) {
        him.removeHighlight(item)
      } else {
        him.addHighlight(item)
      }
    }
  })
  graphComponent.inputMode = inputMode
}

/**
 * Creates a sample graph arranged in a grid
 */
function createGraph(graph: IGraph, width = 10, height = 10) {
  const SIZE = 50
  const nodes: INode[][] = []
  for (let x = 0; x < width; ++x) {
    nodes[x] = []
    for (let y = 0; y < height; ++y) {
      const index = x * width + y
      nodes[x][y] = graph.createNodeAt({
        location: new Point(SIZE * 1.5 * x, SIZE * 1.5 * y),
        tag: index,
        labels: [index.toString()]
      })
    }
  }

  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      const index = x * width + y
      if (x < width - 1) {
        graph.createEdge({
          source: nodes[x][y],
          target: nodes[x + 1][y],
          tag: 2 * index,
          bends: [new Point(SIZE * 1.5 * x + SIZE * 0.75, SIZE * 1.5 * y - SIZE * 0.5)]
        })
      }
      if (y < height - 1) {
        graph.createEdge({
          source: nodes[x][y],
          target: nodes[x][y + 1],
          tag: 2 * index + 1,
          bends: [new Point(SIZE * 1.5 * x + SIZE * 0.5, SIZE * 1.5 * y + SIZE * 0.75)]
        })
      }
    }
  }
}

run().then(finishLoading)
