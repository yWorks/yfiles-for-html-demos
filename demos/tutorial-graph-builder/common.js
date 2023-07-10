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
  DefaultLabelStyle,
  GroupNodeStyle,
  HierarchicLayout,
  HorizontalTextAlignment,
  LayoutMode,
  PolylineEdgeStyle,
  PortAdjustmentPolicy,
  ShapeNodeStyle
} from 'yfiles'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * Retrieves sample ownership data.
 * @template TData
 * @returns {!Promise.<TData>}
 */
export async function getData() {
  return fetch('../ownership-data.json').then(response => response.json())
}

/**
 * Configures colors for styling the nodes retrieved from the given data sources.
 * @param {!Array.<NodesSource>} nodesSources
 */
export function configureStyles(nodesSources) {
  const nodeFills = ['#0b7189', '#111d4a', '#ff6c00', '#ab2346', '#621b00']
  const nodeStrokes = ['#042d37', '#070c1e', '#662b00', '#440e1c', '#270b00']
  const labelTextColors = ['#042d37', '#070c1e', '#662b00', '#440e1c', '#270b00']
  const labelFills = ['#9dc6d0', '#a0a5b7', '#ffc499', '#dda7b5', '#c0a499']
  nodesSources.forEach((nodesSource, index) => {
    nodesSource.nodeCreator.defaults.style = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: nodeFills[index % nodeFills.length],
      stroke: nodeStrokes[index % nodeStrokes.length]
    })
    nodesSource.nodeCreator.defaults.labels.style = new DefaultLabelStyle({
      shape: 'round-rectangle',
      textFill: labelTextColors[index % labelTextColors.length],
      backgroundFill: labelFills[index % labelFills.length],
      insets: 2
    })
  })
}

/**
 * Applies a preconfigured layout.
 * @param {!GraphComponent} graphComponent
 * @param {boolean} [animated=false]
 * @returns {!Promise}
 */
export async function runLayout(graphComponent, animated = false) {
  graphComponent.limitFitContentZoom = false
  await graphComponent.morphLayout({
    layout: new HierarchicLayout({
      considerNodeLabels: true,
      layoutMode: LayoutMode.FROM_SCRATCH,
      componentLayoutEnabled: true
    }),
    portAdjustmentPolicy: PortAdjustmentPolicy.ALWAYS,
    targetBoundsInsets: 250,
    morphDuration: animated ? '700ms' : 0
  })
}

/**
 * Initializes the default styles for nodes, edges, and labels.
 * @param {!GraphComponent} graphComponent
 */
export function initializeTutorialDefaults(graphComponent) {
  applyDemoTheme(graphComponent)
  graphComponent.focusIndicatorManager.enabled = false
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    shape: 'round-rectangle',
    textFill: '#042d37',
    backgroundFill: '#9dc6d0',
    insets: 2,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #0b7189',
    targetArrow: '#0b7189 medium triangle'
  })

  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#111d4a',
    contentAreaInsets: 10
  })
}

/**
 * Fits the graph into the graph component with a minimum zoom value.
 * The graph will be slightly zoomed in to avoid that small graphs are displayed too small.
 * @param {!GraphComponent} graphComponent
 * @param {number} [minimumZoom=3]
 */
export function fitGraphBounds(graphComponent, minimumZoom = 3) {
  graphComponent.limitFitContentZoom = false
  graphComponent.fitGraphBounds()
  graphComponent.zoom = Math.min(graphComponent.zoom, minimumZoom)
}
