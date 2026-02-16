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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GroupNodeStyle,
  HierarchicalLayout,
  HorizontalTextAlignment,
  LabelStyle,
  LayoutExecutor,
  PolylineEdgeStyle,
  PortAdjustmentPolicy,
  ShapeNodeStyle
} from '@yfiles/yfiles'

/**
 * Retrieves sample ownership data.
 */
export async function getData() {
  return fetch('../ownership-data.json').then((response) => response.json())
}

/**
 * Configures colors for styling the nodes retrieved from the given data sources.
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
    nodesSource.nodeCreator.defaults.labels.style = new LabelStyle({
      shape: 'round-rectangle',
      textFill: labelTextColors[index % labelTextColors.length],
      backgroundFill: labelFills[index % labelFills.length],
      padding: 2
    })
  })
}

/**
 * Applies a preconfigured layout.
 */
export async function runLayout(graphComponent, animated = false) {
  graphComponent.limitFitContentZoom = false
  const hierarchicalLayout = new HierarchicalLayout()
  hierarchicalLayout.componentLayout.enabled = true

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: hierarchicalLayout,
    portAdjustmentPolicies: PortAdjustmentPolicy.ALWAYS,
    targetBoundsPadding: 250,
    animationDuration: animated ? '700ms' : 0,
    animateViewport: true
  })
  await layoutExecutor.start()
}

/**
 * Initializes the default styles for nodes, edges, and labels.
 */
export function initializeTutorialDefaults(graphComponent) {
  graphComponent.focusIndicatorManager.enabled = false
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  graph.nodeDefaults.labels.style = new LabelStyle({
    shape: 'round-rectangle',
    textFill: '#042d37',
    backgroundFill: '#9dc6d0',
    padding: 2,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #0b7189',
    targetArrow: '#0b7189 medium triangle'
  })

  graph.groupNodeDefaults.style = new GroupNodeStyle({ tabFill: '#111d4a', contentAreaPadding: 10 })
}

/**
 * Fits the graph into the graph component with a minimum zoom value.
 * The graph will be slightly zoomed in to avoid that small graphs are displayed too small.
 */
export function fitGraphBounds(graphComponent, minimumZoom = 3) {
  graphComponent.limitFitContentZoom = false
  void graphComponent.fitGraphBounds()
  graphComponent.zoom = Math.min(graphComponent.zoom, minimumZoom)
}
