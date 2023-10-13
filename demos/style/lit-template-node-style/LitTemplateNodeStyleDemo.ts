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
  GraphMLSupport,
  GraphViewerInputMode,
  IArrow,
  License,
  PolylineEdgeStyle,
  Rect,
  Size,
  StorageLocation
} from 'yfiles'

import type { SampleDataType } from './resources/sample'
import SampleData from './resources/sample'
import { createLitNodeStyleFromSource, LitNodeStyle } from './LitNodeStyle'
import { registerLitNodeStyleSerialization } from './LitNodeStyleMarkupExtension'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

let graphComponent: GraphComponent

let renderFunctionSourceTextArea: CodeMirror.EditorFromTextArea

let tagTextArea: CodeMirror.EditorFromTextArea

let graphMLSupport: GraphMLSupport

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphViewerInputMode()

  // initialize demo
  initializeTextAreas()
  initializeStyles()
  initializeIO()
  loadSampleGraph()
  initializeUI()
}

/**
 * Initializes text areas to use CodeMirror and to update when the selection in the graph has
 * changed.
 */
function initializeTextAreas(): void {
  renderFunctionSourceTextArea = CodeMirror.fromTextArea(
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

  graphComponent.selection.addItemSelectionChangedListener(() => {
    const selectedNode = graphComponent.selection.selectedNodes.at(0)
    if (selectedNode) {
      if (selectedNode.style instanceof LitNodeStyle) {
        renderFunctionSourceTextArea.setOption('readOnly', false)
        renderFunctionSourceTextArea.setValue(selectedNode.style.renderFunction.toString())
      } else {
        renderFunctionSourceTextArea.setOption('readOnly', true)
        renderFunctionSourceTextArea.setValue(
          'Style is not an instance of LitNodeStyle with attached sources.'
        )
      }
      tagTextArea.setOption('readOnly', false)
      tagTextArea.setValue(selectedNode.tag ? JSON.stringify(selectedNode.tag, null, 2) : '{}')
      document.querySelector<HTMLButtonElement>('#apply-template-button')!.disabled = false
      document.querySelector<HTMLButtonElement>('#apply-tag-button')!.disabled = false
    } else {
      renderFunctionSourceTextArea.setOption('readOnly', 'nocursor')
      tagTextArea.setOption('readOnly', 'nocursor')
      renderFunctionSourceTextArea.setValue('Select a node to edit its template.')
      tagTextArea.setValue('Select a node to edit its tag.')
      document.querySelector<HTMLButtonElement>('#apply-template-button')!.disabled = true
      document.querySelector<HTMLButtonElement>('#apply-tag-button')!.disabled = true
    }
  })
}

/**
 * Initializes the default styles for the graph. By default, org-chart nodes are used.
 */
function initializeStyles(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = createLitNodeStyleFromSource(
    '({layout, tag, selected, detail}) => svg`\n' +
      '<g>\n' +
      '<rect fill="#c0c0c0" width=${layout.width} height=${layout.height} x="2" y="2"></rect>\n' +
      '<rect fill="white" stroke="#C0C0C0" width=${layout.width} height=${layout.height}></rect>\n' +
      "<rect width=${layout.width} height=\"2\" fill=${{present:'#55B757', busy:'#E7527C',travel:'#9945E9', unavailable:'#8D8F91'}[tag.status]}></rect>\n" +
      '<rect fill="transparent" stroke=${selected ? \'#FF6C00\' : \'transparent\'} stroke-width="3" width=${layout.width-3} height=${layout.height-3} x="1.5" y="1.5"></rect>\n' +
      "${detail == 'high' ? svg`\n" +
      '  <image href=${\'./resources/\' + tag.icon + \'.svg\'} x="15" y="10" width="63.75" height="63.75"></image>\n' +
      '  <image href=${\'./resources/\' + tag.status + \'_icon.svg\'} x="25" y="80" height="15" width="60"></image>\n' +
      '  <g style="font-family: Roboto,sans-serif; fill: #444" width="185">\n' +
      '    <text transform="translate(90 25)" style="font-size: 16px; fill: #336699">${tag.name}</text>\n' +
      '    <text transform="translate(90 45)" style="font-size: 9px; text-transform: uppercase">${tag.position}</text>\n' +
      '    <text transform="translate(90 72)">${tag.email}</text>\n' +
      '    <text transform="translate(90 88)">${tag.phone}</text>\n' +
      '    <text transform="translate(170 88)">${tag.fax}</text>\n' +
      '  </g>\n' +
      '  `: svg`\n' +
      '  <image href=${\'./resources/\' + tag.icon + \'.svg\'} x="15" y="20" width="56.25" height="56.25"></image>\n' +
      '  <g style="font-size: 15px; font-family: Roboto,sans-serif; fill: #444" width="185">\n' +
      '    <text transform="translate(85 60)" style="font-size: 26px; fill: #336699">${tag.name}</text>\n' +
      '  </g>\n' +
      '  `}\n' +
      '</g>\n' +
      '`'
  )

  graph.nodeDefaults.size = new Size(290, 100)
  graph.nodeDefaults.shareStyleInstance = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * Initializes GraphML writing and reading for files containing LitNodeStyle.
 */
function initializeIO(): void {
  const graphmlHandler = new GraphMLIOHandler()

  // we want to be able to write and store LitNodeStyles in GraphML
  registerLitNodeStyleSerialization(graphmlHandler)

  graphMLSupport = new GraphMLSupport({
    graphComponent,
    graphMLIOHandler: graphmlHandler,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
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
  graphBuilder.createEdgesSource(SampleData.edges, 'src', 'tgt').edgeCreator.bendsProvider = e =>
    e.bends

  const graph = graphBuilder.buildGraph()
  graphComponent.fitGraphBounds(30)

  // select one node to initialize the text box with some sample data
  graphComponent.selection.setSelected(graph.nodes.last(), true)
}

/**
 * Wires up the UI. Buttons are linked with their respective actions.
 */
function initializeUI(): void {
  const openButton = document.querySelector("button[data-command='OPEN']")!
  openButton.setAttribute('data-command-registered', 'true')
  openButton.setAttribute('title', 'Open a GraphML file')
  openButton.addEventListener('click', async () => {
    try {
      await graphMLSupport.openFile(graphComponent.graph)
      graphComponent.fitGraphBounds()
    } catch (ignored) {
      alert(
        'The graph contains styles that are not supported by this demo. This demo works best when nodes have LitNodeStyle created by this demo or "Node Template Designer".'
      )
      graphComponent.graph.clear()
    }
  })

  document.querySelector('#apply-template-button')!.addEventListener('click', () => {
    if (graphComponent.selection.selectedNodes.size === 0) {
      return
    }
    const renderFunctionSource = renderFunctionSourceTextArea.getValue()
    try {
      // check if style is valid
      const style = createLitNodeStyleFromSource(renderFunctionSource)
      style.renderer
        .getVisualCreator(graphComponent.selection.selectedNodes.first(), style)
        .createVisual(graphComponent.createRenderContext())

      graphComponent.selection.selectedNodes.forEach(node => {
        graphComponent.graph.setStyle(node, style)
      })

      document.getElementById('template-text-area-error')!.classList.remove('open-error')
    } catch (err) {
      const errorArea = document.getElementById('template-text-area-error')!
      const errorString = (err as Error).toString().replace(renderFunctionSource, '...template...')
      errorArea.setAttribute('title', errorString)
      errorArea.classList.add('open-error')
    }
  })

  document.querySelector('#apply-tag-button')!.addEventListener('click', () => {
    const errorArea = document.getElementById('tag-text-area-error')!
    graphComponent.selection.selectedNodes.forEach(node => {
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
