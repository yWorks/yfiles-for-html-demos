/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
declare global {
  export const Babel: any
}

import type { EditorConfiguration, EditorFromTextArea } from 'codemirror'
import {
  GraphBuilder,
  GraphComponent,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  IEnumerable,
  License,
  Point,
  PolylineEdgeStyle,
  Rect,
  Size,
  StorageLocation
} from 'yfiles'

import SampleData from './resources/sample'
import { addClass, bindAction, bindCommand, removeClass, showApp } from '../../resources/demo-app'
import { fetchLicense } from '../../resources/fetch-license'
import { registerReactComponentNodeStyleSerialization } from './ReactComponentNodeStyleMarkupExtension'
import { createReactComponentNodeStyleFromJSX, isReactComponentNodeStyleEx } from './jsx-compiler'

let graphComponent: GraphComponent

let jsxRenderFunctionTextArea: EditorFromTextArea

let tagTextArea: EditorFromTextArea

let graphMLSupport: GraphMLSupport

const templateErrorArea = document.getElementById('template-text-area-error') as HTMLDivElement
const tagErrorArea = document.getElementById('tag-text-area-error') as HTMLDivElement
const applyTemplateButton = document.getElementById('apply-template-button') as HTMLButtonElement
const applyTagButton = document.getElementById('apply-tag-button') as HTMLButtonElement

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()

  // initialize demo
  initializeTextAreas()
  initializeStyles()
  initializeIO()
  loadSampleGraph()
  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes text areas to use CodeMirror and to update when the selection in the graph has
 * changed.
 */
function initializeTextAreas(): void {
  jsxRenderFunctionTextArea = CodeMirror.fromTextArea(
    document.getElementById('template-text-area') as HTMLTextAreaElement,
    {
      lineNumbers: true,
      mode: 'jsx',
      gutters: ['CodeMirror-lint-markers'],
      lint: true
    } as EditorConfiguration
  )
  tagTextArea = CodeMirror.fromTextArea(
    document.getElementById('tag-text-area') as HTMLTextAreaElement,
    {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      lint: true
    } as EditorConfiguration
  )

  // disable standard selection and focus visualization
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  graphComponent.selection.addItemSelectionChangedListener(() => {
    const selectedNode = graphComponent.selection.selectedNodes.at(0)
    removeClass(templateErrorArea, 'open-error')
    removeClass(tagErrorArea, 'open-error')
    if (selectedNode) {
      if (isReactComponentNodeStyleEx(selectedNode.style)) {
        jsxRenderFunctionTextArea.setOption('readOnly', false)
        jsxRenderFunctionTextArea.setValue(selectedNode.style.jsx)
      } else {
        jsxRenderFunctionTextArea.setOption('readOnly', true)
        jsxRenderFunctionTextArea.setValue(
          'Style is not an instance of ReactComponentNodeStyle with attached JSX sources.'
        )
      }
      tagTextArea.setOption('readOnly', false)
      tagTextArea.setValue(selectedNode.tag ? JSON.stringify(selectedNode.tag, null, 2) : '{}')
      applyTemplateButton.disabled = false
      applyTagButton.disabled = false
    } else {
      jsxRenderFunctionTextArea.setOption('readOnly', 'nocursor')
      tagTextArea.setOption('readOnly', 'nocursor')
      jsxRenderFunctionTextArea.setValue('Select a node to edit its template.')
      tagTextArea.setValue('Select a node to edit its tag.')
      applyTemplateButton.disabled = true
      applyTagButton.disabled = true
    }
  })
}

/**
 * Initializes the default styles for the graph. By default org-chart nodes are used.
 */
function initializeStyles(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = createReactComponentNodeStyleFromJSX(demoNodeStyleJSXSources)
  graph.nodeDefaults.size = new Size(290, 100)
  graph.nodeDefaults.shareStyleInstance = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

const demoNodeStyleJSXSources = `({width, height, selected, detail, tag}) =>
(
  <g>
    <rect fill="#C0C0C0" width={width} height={height} x="2" y="2"></rect>
    <rect fill="white" stroke="#C0C0C0" width={width} height={height}></rect>
    {
      {
        present: <rect width={width} height="2" fill="#55B757"></rect>,
        busy: <rect width={width} height="2" fill="#E7527C"></rect>,
        travel: <rect width={width} height="2" fill="#9945E9"></rect>,
        unavailable: <rect width={width} height="2" fill="#8D8F91"></rect>
      }[tag.status]
    }
    <rect
      fill="transparent"
      stroke={selected ? '#FF6C00' : 'transparent'}
      strokeWidth="3"
      width={width - 3}
      height={height - 3}
      x="1.5"
      y="1.5"
    ></rect>
    {
      {
        high: (
          <>
            <image
              href={'./resources/' + tag.icon + '.svg'}
              x="15"
              y="10"
              width="63.75"
              height="63.75"
            ></image>
            <image
              href={'./resources/' + tag.status + '_icon.svg'}
              x="25"
              y="80"
              height="15"
              width="60"
            ></image>
            <g style={{ fontFamily: 'Roboto,sans-serif', fill: '#444' }} width="185">
              <text transform="translate(90 25)" style={{ fontSize: '16px', fill: '#336699' }}>
                {tag.name}
              </text>
              <text
                transform="translate(90 45)"
                style={{ fontSize: '8px', textTransform: 'uppercase' }}
              >
                {tag.position}
              </text>
              <text transform="translate(90 72)">{tag.email}</text>
              <text transform="translate(90 88)">{tag.phone}</text>
              <text transform="translate(170 88)">{tag.fax}</text>
            </g>
          </>
        ),
        low: (
          <>
            <image
              href={'./resources/' + tag.icon + '.svg'}
              x="15"
              y="20"
              width="56.25"
              height="56.25"
            ></image>
            <g
              style={{ fontSize: '15px', fontFamily: 'Roboto,sans-serif', fill: '#444' }}
              width="185"
            >
              <text transform="translate(85 60)" style={{ fontSize: '26px', fill: '#336699' }}>
                {tag.name}
              </text>
            </g>
          </>
        )
      }[detail]
    }
  </g>
)`

/**
 * Initializes GraphML writing and reading for files containing ReactComponentNodeStyle.
 */
function initializeIO(): void {
  const graphmlHandler = new GraphMLIOHandler()

  registerReactComponentNodeStyleSerialization(graphmlHandler)

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
    tag: data => {
      // for this demo, we don't want the layout and id information as part of the tag
      const { layout, id, ...rest } = data
      return rest
    },
    // This example uses hard coded locations. If no predefined layout data is given, an automatic layout could have
    // been applied to the graph after buildGraph, which is a common use case. For example, see the OrgChart Demo
    // (/demos-js/complete/interactiveorgchart/)
    layout: (data: { layout: { x: number; y: number } }): Rect =>
      new Rect(data.layout.x, data.layout.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  graphBuilder.createEdgesSource(SampleData.edges, 'src', 'tgt').edgeCreator.bendsProvider = e =>
    IEnumerable.from(e.bends ?? []).map(b => new Point(b.x, b.y))

  const graph = graphBuilder.buildGraph()
  graphComponent.fitGraphBounds(30)

  graphComponent.selection.setSelected(graph.nodes.last(), true)
}

/**
 * Wires up the UI. Buttons are linked with their according actions.
 */
function registerCommands(): void {
  bindAction("button[data-command='Open']", async () => {
    try {
      await graphMLSupport.openFile(graphComponent.graph)
      graphComponent.fitGraphBounds()
    } catch (ignored) {
      alert(
        'The graph contains styles that are not supported by this demo. This demo works best when nodes have ReactComponentNodeStyles created by this demo.'
      )
      graphComponent.graph.clear()
    }
  })
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='ApplyTemplate']", () => {
    if (graphComponent.selection.selectedNodes.size === 0) {
      return
    }
    const jsxSource = jsxRenderFunctionTextArea.getValue()
    try {
      const style = createReactComponentNodeStyleFromJSX(jsxSource)
      // check if style is valid
      style.renderer
        .getVisualCreator(graphComponent.selection.selectedNodes.first(), style)
        .createVisual(graphComponent.createRenderContext())

      graphComponent.selection.selectedNodes.forEach(node => {
        graphComponent.graph.setStyle(node, style)
      })

      removeClass(templateErrorArea, 'open-error')
    } catch (err) {
      const errorString = (err as Error).toString().replace(jsxSource, '...template...')
      templateErrorArea.setAttribute('title', errorString)
      addClass(templateErrorArea, 'open-error')
    }
  })
  bindAction("button[data-command='ApplyTag']", () => {
    graphComponent.selection.selectedNodes.forEach(node => {
      try {
        node.tag = JSON.parse(tagTextArea.getValue())
        removeClass(tagErrorArea, 'open-error')
      } catch (err) {
        addClass(tagErrorArea, 'open-error')
        tagErrorArea.setAttribute('title', (err as Error).toString())
      }
    })
    graphComponent.invalidate()
  })

  bindAction("button[data-command='Reload']", () => {
    loadSampleGraph()
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
