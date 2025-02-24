/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import * as CodeMirror from 'codemirror'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/lint/lint.css'

import {
  GraphBuilder,
  GraphComponent,
  GraphMLIOHandler,
  GraphViewerInputMode,
  IArrow,
  License,
  PolylineEdgeStyle,
  Rect,
  Size
} from '@yfiles/yfiles'

import type { SampleDataType } from './resources/sample'
import SampleData from './resources/sample'
import {
  addVueTemplateNodeStyleInformation,
  VueTemplateNodeStyle
} from './style/VueTemplateNodeStyle'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'

let graphComponent: GraphComponent

let templateTextArea: CodeMirror.EditorFromTextArea

let tagTextArea: CodeMirror.EditorFromTextArea

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  graphComponent.inputMode = new GraphViewerInputMode()

  initializeTextAreas()
  initializeStyles()
  loadSampleGraph()
  initializeUI()
}

/**
 * Initializes text areas to use CodeMirror and to update when the selection in the graph has
 * changed.
 */
function initializeTextAreas(): void {
  templateTextArea = CodeMirror.fromTextArea(
    document.querySelector<HTMLTextAreaElement>('#template-text-area')!,
    {
      lineNumbers: true,
      mode: 'application/xml',
      gutters: ['CodeMirror-lint-markers'],
      lint: true
    } as CodeMirror.EditorConfiguration
  )
  tagTextArea = CodeMirror.fromTextArea(
    document.querySelector<HTMLTextAreaElement>('#tag-text-area')!,
    {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      lint: true
    } as CodeMirror.EditorConfiguration
  )

  // disable standard selection and focus visualization
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  graphComponent.selection.addEventListener('item-added', () => {
    const selectedNode = graphComponent.selection.nodes.at(0)!
    if (selectedNode.style instanceof VueTemplateNodeStyle) {
      templateTextArea.setOption('readOnly', false)
      templateTextArea.setValue(selectedNode.style.template)
    } else {
      templateTextArea.setOption('readOnly', true)
      templateTextArea.setValue('Style is not an instance of VueTemplateNodeStyle.')
    }
    tagTextArea.setOption('readOnly', false)
    tagTextArea.setValue(selectedNode.tag ? JSON.stringify(selectedNode.tag, null, 2) : '{}')
    document.querySelector<HTMLButtonElement>('#apply-template-button')!.disabled = false
    document.querySelector<HTMLButtonElement>('#apply-tag-button')!.disabled = false
  })

  graphComponent.selection.addEventListener('item-removed', () => {
    templateTextArea.setOption('readOnly', 'nocursor')
    tagTextArea.setOption('readOnly', 'nocursor')
    templateTextArea.setValue('Select a node to edit its template.')
    tagTextArea.setValue('Select a node to edit its tag.')
    document.querySelector<HTMLButtonElement>('#apply-template-button')!.disabled = true
    document.querySelector<HTMLButtonElement>('#apply-tag-button')!.disabled = true
  })
}

/**
 * Initializes the default styles for the graph. By default, org-chart nodes are used.
 */
function initializeStyles(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new VueTemplateNodeStyle(`<g>
<rect fill="#C0C0C0" :width="layout.width" :height="layout.height" x="2" y="2"></rect>
<rect :fill="localUrl('bottomGradient')" stroke="#C0C0C0" :width="layout.width" :height="layout.height"></rect>
<rect v-if="tag.status === 'present'" :width="layout.width" height="2" fill="#55B757"></rect>
<rect v-else-if="tag.status === 'busy'" :width="layout.width" height="2" fill="#E7527C"></rect>
<rect v-else-if="tag.status === 'travel'" :width="layout.width" height="2" fill="#9945E9"></rect>
<rect v-else-if="tag.status === 'unavailable' || tag.status == null" :width="layout.width" height="2" fill="#8D8F91"></rect>
<rect fill="transparent" :stroke="selected ? '#FF6C00' : 'transparent'" stroke-width="3" :width="layout.width-3" :height="layout.height-3" x="1.5" y="1.5"></rect>
<template v-if="zoom >= 0.7">
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="10" width="63.75" height="63.75"></image>
  <image :xlink:href="'./resources/' + tag.status + '_icon.svg'" x="25" y="80" height="15" width="60"></image>
  <g style="font-family: Roboto,sans-serif; fill: #444">
    <text transform="translate(90 25)" style="font-size: 16px; fill: #336699">{{tag.name}}</text>
    <text transform="translate(90 45)" style="font-size: 9px; text-transform: uppercase">{{tag.position}}</text>
    <text transform="translate(90 72)">{{tag.email}}</text>
    <text transform="translate(90 88)">{{tag.phone}}</text>
    <text transform="translate(170 88)">{{tag.fax}}</text>
  </g>
</template>
<template v-else>
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="20" width="56.25" height="56.25"></image>
  <g style="font-size: 15px; font-family: Roboto,sans-serif; fill: #444">
    <text transform="translate(85 40)" style="font-size: 26px; fill: #336699">{{tag.name}}</text>
    <svg-text :content="tag.position?.toUpperCase()" x="85" y="50" :width="layout.width - 100" :height="50" :wrapping="4" font-family="sans-serif" :font-size="14" :font-style="0" :font-weight="500" :text-decoration="0" fill="black" :opacity="1" :visible="true" :clipped="true" align="start" transform=""></svg-text>
  </g>
</template>
<defs>
  <linearGradient :id="localId('bottomGradient')" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" v-if="tag.status === 'present'" style="stop-color:#76b041;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'busy'" style="stop-color:#ab2346;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'travel'" style="stop-color:#a367dc;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'unavailable' || tag.status == null" style="stop-color:#c1c1c1;stop-opacity:1"/>
    <stop offset="5%" style="stop-color:white;stop-opacity:1" />
  </linearGradient>
</defs>


</g>`)
  graph.nodeDefaults.size = new Size(290, 100)
  graph.nodeDefaults.shareStyleInstance = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * Initializes GraphML writing and reading for files containing VueTemplateNodeStyle.
 */
function initializeIO(): GraphMLIOHandler {
  const graphmlHandler = new GraphMLIOHandler()

  addVueTemplateNodeStyleInformation(graphmlHandler)

  return graphmlHandler
}

/**
 * Loads the sample graph.
 */
function loadSampleGraph(): void {
  graphComponent.graph.clear()
  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  const graphBuilder = new GraphBuilder(graphComponent.graph)
  graphBuilder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    // This example uses hard coded locations. If no predefined layout data is given, an automatic layout could have
    // been applied to the graph after buildGraph, which is a common use case. For example, see the Organization Chart Demo
    layout: (data: SampleDataType): Rect =>
      new Rect(data.layout.x, data.layout.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  graphBuilder.createEdgesSource(SampleData.edges, 'src', 'tgt').edgeCreator.bendsProvider = (
    data
  ) => data.bends

  const graph = graphBuilder.buildGraph()
  graphComponent.fitGraphBounds(30)

  graphComponent.selection.add(graph.nodes.last()!)
}

/**
 * Wires up the UI. Buttons are linked with their according actions.
 */
function initializeUI(): void {
  const graphMLIOHandler = initializeIO()
  document
    .querySelector<HTMLInputElement>('#open-file-button')!
    .addEventListener('click', async () => {
      await openGraphML(graphComponent, graphMLIOHandler)
    })
  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'vueTemplateNodeStyle.graphml', graphMLIOHandler)
  })
  document.querySelector('#apply-template-button')!.addEventListener('click', () => {
    if (graphComponent.selection.nodes.size === 0) {
      return
    }
    const templateText = templateTextArea.getValue()
    const style = new VueTemplateNodeStyle(templateText)
    try {
      // check if style is valid
      style.renderer
        .getVisualCreator(graphComponent.selection.nodes.first()!, style)
        .createVisual(graphComponent.createRenderContext())

      graphComponent.selection.nodes.forEach((node) => {
        graphComponent.graph.setStyle(node, style)
      })

      document.getElementById('template-text-area-error')!.classList.remove('open-error')
    } catch (err) {
      const errorArea = document.getElementById('template-text-area-error')!
      const errorString = (err as Error).toString().replace(templateText, '...template...')
      errorArea.setAttribute('title', errorString)
      errorArea.classList.add('open-error')
    }
  })

  document.querySelector('#apply-tag-button')!.addEventListener('click', () => {
    const errorArea = document.getElementById('tag-text-area-error')!
    graphComponent.selection.nodes.forEach((node) => {
      try {
        node.tag = JSON.parse(tagTextArea.getValue())
        errorArea.classList.remove('open-error')
      } catch (err) {
        errorArea.classList.add('open-error')
        errorArea.setAttribute('title', (err as Error).toString())
      }
    })
    graphComponent.invalidate()
  })

  document.querySelector('#reload')!.addEventListener('click', loadSampleGraph)
}

run().then(finishLoading)
