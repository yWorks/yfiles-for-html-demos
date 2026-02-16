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
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphViewerInputMode,
  IArrow,
  type ILabel,
  type INode,
  License,
  PolylineEdgeStyle,
  Rect,
  Size,
  type SizeConvertible
} from '@yfiles/yfiles'

import type { SampleDataType } from './resources/sample'
import SampleData from './resources/sample'
import { createLitNodeStyleFromSource, LitNodeStyle } from './LitNodeStyle'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'
import {
  createCodemirrorEditor,
  EditorView,
  StateEffect,
  type StateEffectType,
  StateField
} from '@yfiles/demo-app/codemirror-editor'
import { createLitLabelStyleFromSource, LitLabelStyle } from './LitLabelStyle'
import { createLitHtmlNodeStyleFromSource, LitHtmlNodeStyle } from './LitHtmlNodeStyle'
import { createLitHtmlLabelStyleFromSource, LitHtmlLabelStyle } from './LitHtmlLabelStyle'
import {
  demoHtmlLabelStyleLitSources,
  demoHtmlNodeStyleLitSources,
  demoSvgLabelStyleLitSources,
  demoSvgNodeStyleLitSources
} from './lit-style-sources'
import { registerLitStyleSerialization } from './markup-extensions'

let graphComponent: GraphComponent

let renderFunctionSourceTextArea: EditorView
let tagTextArea: EditorView
let setRenderFunctionSourceTextAreaEditable: StateEffectType<boolean>
let setTagTextAreaEditable: StateEffectType<boolean>

const defaultLabelSize: Size | SizeConvertible = [150, 14]

const htmlTemplateToggle = document.querySelector<HTMLInputElement>('#html-template')!
const applyTemplateButton = document.querySelector<HTMLButtonElement>('#apply-template-button')!
const applyTagButton = document.querySelector<HTMLButtonElement>('#apply-tag-button')!

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.NODE_LABEL
  })

  // initialize demo
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
  setRenderFunctionSourceTextAreaEditable = StateEffect.define<boolean>()
  const renderFunctionSourceTextAreaEditable = StateField.define<boolean>({
    create: () => true,
    update: (value, transaction) => {
      for (const e of transaction.effects) {
        if (e.is(setRenderFunctionSourceTextAreaEditable)) {
          value = e.value
        }
      }
      return value
    }
  })

  renderFunctionSourceTextArea = createCodemirrorEditor(
    'js',
    document.querySelector<HTMLTextAreaElement>('#templateEditorContainer')!,
    [
      renderFunctionSourceTextAreaEditable,
      EditorView.editable.from(renderFunctionSourceTextAreaEditable)
    ]
  )
  setTagTextAreaEditable = StateEffect.define<boolean>()
  const tagTextAreaEditable = StateField.define<boolean>({
    create: () => true,
    update: (value, transaction) => {
      for (const e of transaction.effects) {
        if (e.is(setTagTextAreaEditable)) {
          value = e.value
        }
      }
      return value
    }
  })
  tagTextArea = createCodemirrorEditor(
    'json',
    document.querySelector<HTMLTextAreaElement>('#tagEditorContainer')!,
    [tagTextAreaEditable, EditorView.editable.from(tagTextAreaEditable)]
  )

  // disable standard selection and focus visualization
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  graphComponent.selection.addEventListener('item-added', onSelectionChanged)
  graphComponent.selection.addEventListener('item-removed', onSelectionChanged)
}

function onSelectionChanged() {
  const selectedItem = graphComponent.selection.nodes.at(0) ?? graphComponent.selection.labels.at(0)

  if (selectedItem) {
    if (isLitStyle(selectedItem)) {
      htmlTemplateToggle.disabled = false
      htmlTemplateToggle.checked = isHtmlLitStyle(selectedItem)
      renderFunctionSourceTextArea.dispatch({
        effects: setRenderFunctionSourceTextAreaEditable.of(true),
        changes: {
          from: 0,
          to: renderFunctionSourceTextArea.state.doc.length,
          insert: (
            selectedItem.style as
              | LitNodeStyle
              | LitHtmlNodeStyle
              | LitLabelStyle
              | LitHtmlLabelStyle
          ).renderFunction.toString()
        }
      })

      tagTextArea.dispatch({
        effects: setTagTextAreaEditable.of(true),
        changes: {
          from: 0,
          to: tagTextArea.state.doc.length,
          insert: selectedItem.tag ? JSON.stringify(selectedItem.tag, null, 2) : '{}'
        }
      })
      applyTemplateButton.disabled = false
      applyTagButton.disabled = false
    } else {
      htmlTemplateToggle.disabled = true
      renderFunctionSourceTextArea.dispatch({
        effects: setRenderFunctionSourceTextAreaEditable.of(false),
        changes: {
          from: 0,
          to: renderFunctionSourceTextArea.state.doc.length,
          insert: 'Style is not an instance of a lit style with attached sources.'
        }
      })
      applyTemplateButton.disabled = true
      applyTagButton.disabled = true
    }
  } else {
    htmlTemplateToggle.disabled = true
    renderFunctionSourceTextArea.dispatch({
      effects: setRenderFunctionSourceTextAreaEditable.of(false),
      changes: {
        from: 0,
        to: renderFunctionSourceTextArea.state.doc.length,
        insert: 'Select a node or label to edit its template.'
      }
    })
    tagTextArea.dispatch({
      effects: setTagTextAreaEditable.of(false),
      changes: {
        from: 0,
        to: tagTextArea.state.doc.length,
        insert: 'Select a node or label to edit its tag.'
      }
    })
    applyTemplateButton.disabled = true
    applyTagButton.disabled = true
  }

  graphComponent.invalidate()
}

/**
 * Determines if the given selected item uses an HTML-based lit style.
 */
function isHtmlLitStyle(selectedItem: INode | ILabel): boolean {
  return (
    selectedItem.style instanceof LitHtmlNodeStyle ||
    selectedItem.style instanceof LitHtmlLabelStyle
  )
}

/**
 * Determines if the given selected item uses any lit-based style.
 */
function isLitStyle(selectedItem: INode | ILabel): boolean {
  return (
    isHtmlLitStyle(selectedItem) ||
    selectedItem.style instanceof LitNodeStyle ||
    selectedItem.style instanceof LitLabelStyle
  )
}

function toggleHtmlSvgTemplate(event: Event) {
  const isHtml = (event.target as HTMLInputElement).checked
  if (
    graphComponent.selection.nodes.some(
      (label) => label.style instanceof LitNodeStyle || label.style instanceof LitHtmlNodeStyle
    )
  ) {
    renderFunctionSourceTextArea.dispatch({
      changes: {
        from: 0,
        to: renderFunctionSourceTextArea.state.doc.length,
        insert: isHtml ? demoHtmlNodeStyleLitSources : demoSvgNodeStyleLitSources
      }
    })
  } else if (
    graphComponent.selection.labels.some(
      (label) => label.style instanceof LitLabelStyle || label.style instanceof LitHtmlLabelStyle
    )
  ) {
    renderFunctionSourceTextArea.dispatch({
      changes: {
        from: 0,
        to: renderFunctionSourceTextArea.state.doc.length,
        insert: isHtml ? demoHtmlLabelStyleLitSources : demoSvgLabelStyleLitSources
      }
    })
  } else {
    renderFunctionSourceTextArea.dispatch({
      changes: {
        from: 0,
        to: renderFunctionSourceTextArea.state.doc.length,
        insert: 'Style is not an instance with attached JSX sources.'
      }
    })
  }
}

/**
 * Initializes the default styles for the graph. By default, org-chart nodes are used.
 */
function initializeStyles(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = createLitNodeStyleFromSource(demoSvgNodeStyleLitSources)

  graph.nodeDefaults.size = new Size(290, 100)
  graph.nodeDefaults.shareStyleInstance = false

  graph.nodeDefaults.labels.style = createLitLabelStyleFromSource(
    demoSvgLabelStyleLitSources,
    defaultLabelSize
  )

  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 2
  }).createParameter('top')

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * Initializes GraphML writing and reading for files containing LitNodeStyle.
 */
function initializeIO(): GraphMLIOHandler {
  const graphmlHandler = new GraphMLIOHandler()

  // we want to be able to write and store LitNodeStyles in GraphML
  registerLitStyleSerialization(graphmlHandler)
  return graphmlHandler
}

/**
 * Loads the sample graph.
 */
function loadSampleGraph(): void {
  graphComponent.graph.clear()
  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  const graphBuilder = new GraphBuilder(graphComponent.graph)
  const nodesSource = graphBuilder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    // This example uses hard-coded locations. If no predefined layout data is given, an automatic layout could have
    // been applied to the graph after buildGraph, which is a common use case. For example, see the Organization Chart Demo
    layout: (data: SampleDataType): Rect =>
      new Rect(data.layout.x, data.layout.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  nodesSource.nodeCreator.createLabelBinding((dataItem) => dataItem.name)

  graphBuilder.createEdgesSource(SampleData.edges, 'src', 'tgt').edgeCreator.bendsProvider = (e) =>
    e.bends

  const graph = graphBuilder.buildGraph()
  void graphComponent.fitGraphBounds(30)

  // select one node to initialize the text box with some sample data
  graphComponent.selection.add(graph.nodes.last()!)
}

function applyTemplateToSelectedNodes(source: string, svg: boolean) {
  const style = svg
    ? createLitNodeStyleFromSource(source)
    : createLitHtmlNodeStyleFromSource(source)
  // check if the style is valid
  style.renderer
    .getVisualCreator(graphComponent.selection.nodes.first()!, style)
    .createVisual(graphComponent.createRenderContext())

  graphComponent.selection.nodes.forEach((node) => {
    graphComponent.graph.setStyle(node, style)
  })
}

function applyTemplateToSelectedLabels(source: string, svg: boolean) {
  const style = svg
    ? createLitLabelStyleFromSource(source, defaultLabelSize)
    : createLitHtmlLabelStyleFromSource(source, defaultLabelSize)

  // check if the style is valid
  style.renderer
    .getVisualCreator(graphComponent.selection.labels.first()!, style)
    .createVisual(graphComponent.createRenderContext())

  graphComponent.selection.labels.forEach((label) => {
    graphComponent.graph.setStyle(label, style)
  })
}

/**
 * Wires up the UI. Buttons are linked with their respective actions.
 */
function initializeUI(): void {
  const graphMLIOHandler = initializeIO()
  document
    .querySelector<HTMLInputElement>('#open-file-button')!
    .addEventListener('click', async () => {
      try {
        await openGraphML(graphComponent, graphMLIOHandler)
        void graphComponent.fitGraphBounds()
      } catch (ignored) {
        alert(
          'The graph contains styles that are not supported by this demo. This demo works best when nodes have LitNodeStyle created by this demo or "Node Template Designer".'
        )
        graphComponent.graph.clear()
      }
    })
  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    void saveGraphML(graphComponent, 'litTemplateNodeStyle.graphml', graphMLIOHandler)
  })

  htmlTemplateToggle.addEventListener('change', toggleHtmlSvgTemplate)
  document.querySelector('#apply-template-button')!.addEventListener('click', () => {
    if (graphComponent.selection.nodes.size === 0 && graphComponent.selection.labels.size === 0) {
      return
    }
    const renderFunctionSource = renderFunctionSourceTextArea.state.doc.toString()
    try {
      const svg = !htmlTemplateToggle.checked
      const source = renderFunctionSourceTextArea.state.doc.toString()

      if (graphComponent.selection.nodes.size > 0) {
        applyTemplateToSelectedNodes(source, svg)
      } else if (graphComponent.selection.labels.size > 0) {
        applyTemplateToSelectedLabels(source, svg)
      }

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
    graphComponent.selection.nodes.forEach((node) => {
      try {
        node.tag = JSON.parse(tagTextArea.state.doc.toString())
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
