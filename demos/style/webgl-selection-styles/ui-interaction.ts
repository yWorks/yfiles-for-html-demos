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
import { createGraph } from './load-sample-graph'
import {
  type GraphComponent,
  type StyleDecorationZoomPolicyStringValues,
  TimeSpan,
  WebGL2AnimationDirection,
  type WebGL2AnimationEasingStringValues,
  WebGL2AnimationTiming,
  type WebGL2IndicatorTypeStringValues,
  WebGL2Transition
} from 'yfiles'
import { type SelectionStyle, updateSelectionStyles } from './graph-styles'

/**
 * Binds the various interaction elements (buttons, sliders) to functions and commands.
 */
export function wireUpUI(style: SelectionStyle, graphComponent: GraphComponent): void {
  document.getElementById('reset-button')?.addEventListener('click', () => {
    graphComponent.graph.clear()
    createGraph(graphComponent)
    selectNodes(graphComponent)
  })

  document.getElementById('select-nodes-button')?.addEventListener('click', () => {
    selectNodes(graphComponent)
  })

  document.getElementById('select-edges-button')?.addEventListener('click', () => {
    selectEdges(graphComponent)
  })

  document.getElementById('select-labels-button')?.addEventListener('click', () => {
    selectLabels(graphComponent)
  })

  document.getElementById('clear-selection-button')?.addEventListener('click', () => {
    graphComponent.selection.clear()
  })

  document.getElementById('change-style-pattern')?.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement
    style.stylePattern = target.value as WebGL2IndicatorTypeStringValues
    const selectedIndex = target.selectedIndex

    const dashAnimated = document.querySelector<HTMLInputElement>('#change--dash-animated')!
    dashAnimated.disabled = selectedIndex < 9 || selectedIndex > 14

    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-primary-color')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.primaryColor = target.value as string
    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-primary-transparency')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.primaryTransparency = parseFloat(target.value as string) / 100
    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-secondary-color')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.secondaryColor = target.value as string
    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-secondary-transparency')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.secondaryTransparency = parseFloat(target.value as string) / 100
    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-thickness')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.thickness = parseFloat(target.value as string)
    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-margins')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.margins = parseFloat(target.value as string)
    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-transitioned')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.transition = target.checked ? createTransition(style.easing) : null
    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change--dash-animated')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.animationTiming = target.checked
      ? new WebGL2AnimationTiming(
          TimeSpan.fromSeconds(1),
          style.easing,
          255,
          WebGL2AnimationDirection.NORMAL
        )
      : null

    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-easing')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.easing = target.value as WebGL2AnimationEasingStringValues

    // also update transition and dash animation, if activated
    style.transition = style.transition ? createTransition(style.easing) : null

    style.animationTiming = style.animationTiming
      ? new WebGL2AnimationTiming(
          TimeSpan.fromSeconds(1),
          style.easing,
          255,
          WebGL2AnimationDirection.NORMAL
        )
      : null

    updateSelectionStyles(style, graphComponent)
  })

  document.getElementById('change-zoom-policy')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    style.zoomPolicy = target.value as StyleDecorationZoomPolicyStringValues
    updateSelectionStyles(style, graphComponent)
  })
}

export function selectNodes(graphComponent: GraphComponent): void {
  graphComponent.graph.nodes.forEach((item) => graphComponent.selection.setSelected(item, true))
}

function selectEdges(graphComponent: GraphComponent): void {
  graphComponent.graph.edges.forEach((item) => graphComponent.selection.setSelected(item, true))
}

function selectLabels(graphComponent: GraphComponent): void {
  graphComponent.graph.labels.forEach((item) => graphComponent.selection.setSelected(item, true))
}

/**
 * Creates a WebGL2Transition with the given easing and default values.
 */
export function createTransition(easing: WebGL2AnimationEasingStringValues): WebGL2Transition {
  return new WebGL2Transition({
    properties: 'opacity',
    easing,
    duration: '0.5s'
  })
}
