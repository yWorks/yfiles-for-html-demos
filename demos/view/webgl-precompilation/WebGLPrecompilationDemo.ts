/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  type IEdge,
  type IGraph,
  type ILabel,
  type INode,
  License,
  Point,
  Size,
  WebGLFocusIndicatorManager,
  WebGLGraphModelManager,
  WebGLHighlightIndicatorManager,
  WebGLSelectionIndicatorManager
} from '@yfiles/yfiles'

import licenseData from '../../../lib/license.json'
import { checkWebGL2Support, finishLoading } from '@yfiles/demo-app/demo-page'
import { preloadWebglStyles } from './preload-webgl-styles'
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
  webGLEdgeStyles,
  webGLLabelStyles,
  webGLNodeStyles
} from './webgl-styles'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import type { WebGLEdgeStyle, WebGLNodeStyle, WebGLTextStyle } from './webgl-styles-util'

const webGLLoadingOverlay = document.querySelector('.webgl-loading')!

/**
 * A WebGLGraphModelManager that uses callbacks for graph items to determine their WebGL styles.
 */
export class MyWebGLGraphModelManager extends WebGLGraphModelManager {
  private labelStyle: (label: ILabel) => WebGLTextStyle
  private edgeStyle: (edge: IEdge) => WebGLEdgeStyle
  private nodeStyle: (node: INode) => WebGLNodeStyle

  constructor(
    nodeStyle: (node: INode) => WebGLNodeStyle,
    edgeStyle: (edge: IEdge) => WebGLEdgeStyle,
    labelStyle: (label: ILabel) => WebGLTextStyle
  ) {
    super()
    this.nodeStyle = nodeStyle
    this.edgeStyle = edgeStyle
    this.labelStyle = labelStyle
  }
  protected getWebGLNodeStyle(node: INode) {
    return this.nodeStyle(node)
  }

  protected getWebGLEdgeStyle(edge: IEdge) {
    return this.edgeStyle(edge)
  }

  protected getWebGLLabelStyle(label: ILabel) {
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

  License.value = licenseData

  const graphComponentWithoutPreload = new GraphComponent('#graphComponent')
  const graphComponentWithPreload = new GraphComponent('#graphComponentWithPreload')
  const demoNodeSize = new Size(40, 40)

  for (const graphComponent of [graphComponentWithoutPreload, graphComponentWithPreload]) {
    graphComponent.graph.nodeDefaults.size = demoNodeSize
    initDemoStyles(graphComponent.graph)

    initializeInteraction(graphComponent)

    createGraph(graphComponent.graph)
    void graphComponent.fitGraphBounds()
  }

  document.getElementById('webgl-button')!.addEventListener('click', async () => {
    // show loading screen
    webGLLoadingOverlay.classList.add('loading')
    // wait for a frame to give the browser a chance to actually render the loading screen
    await new Promise((resolve) => setTimeout(resolve, 0))
    // set rendering mode to WebGL on the component without preload to show the difference
    enableWebGLRendering(graphComponentWithoutPreload)
    // preload all the WebGL styles that we want to use
    await preloadWebglStyles(
      ...webGLNodeStyles,
      ...webGLEdgeStyles,
      ...webGLLabelStyles,
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
    // set rendering mode to WebGL only after the preload is finished
    // also hide loading screen when remaining shaders are compiled
    enableWebGLRendering(graphComponentWithPreload, () =>
      webGLLoadingOverlay.classList.remove('loading')
    )
  })
}

/**
 * Enables WebGL as the rendering technique.
 */
function enableWebGLRendering(graphComponent: GraphComponent, afterCompileAction?: () => void) {
  const myWebGLGraphModelManager = new MyWebGLGraphModelManager(
    (node) => webGLNodeStyles[(node.tag || 0) % webGLNodeStyles.length],
    (edge) => webGLEdgeStyles[(edge.tag || 0) % webGLEdgeStyles.length],
    (label) => webGLLabelStyles[(label.tag || 0) % webGLLabelStyles.length]
  )

  if (afterCompileAction) {
    myWebGLGraphModelManager.addEventListener('shaders-compiled', () => {
      afterCompileAction()
      myWebGLGraphModelManager.removeEventListener('shaders-compiled', afterCompileAction)
    })
  }

  graphComponent.graphModelManager = myWebGLGraphModelManager

  graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager({
    nodeStyle: nodeSelectionStyle,
    edgeStyle: edgeSelectionStyle,
    nodeLabelStyle: labelSelectionStyle
  })
  graphComponent.focusIndicatorManager = new WebGLFocusIndicatorManager({
    nodeStyle: nodeFocusStyle,
    edgeStyle: edgeFocusStyle,
    nodeLabelStyle: labelFocusStyle
  })
  graphComponent.highlightIndicatorManager = new WebGLHighlightIndicatorManager({
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
  inputMode.addEventListener('item-right-clicked', ({ item }) => {
    const highlights = graphComponent.highlights
    if (highlights) {
      const isHighlighted = highlights.includes(item)
      if (isHighlighted) {
        highlights.remove(item)
      } else {
        highlights.add(item)
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
