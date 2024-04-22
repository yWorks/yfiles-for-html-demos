/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  LayoutExecutor,
  License,
  NodeSizeConstraintProvider,
  PolylineEdgeStyle,
  Size,
  SvgExport
} from 'yfiles'
import { finishLoading } from 'demo-resources/demo-page'
import { fetchLicense } from 'demo-resources/fetch-license'
import { HtmlEditableNodeStyle } from './HtmlEditableNodeStyle.js'
import { updateTagView } from './util.js'
import { defaultData, people } from './data.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'
import { downloadFile } from 'demo-utils/file-support'

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  const graph = graphComponent.graph

  // We use the custom HTML node style for all nodes
  graph.nodeDefaults.style = new HtmlEditableNodeStyle()
  graph.nodeDefaults.size = [280, 380]

  initGraphDefaults(graph)

  createGraphFromData(graph)

  initTagView(graphComponent)
  initLayout(graphComponent)
  await initExport(graphComponent)
  graphComponent.inputMode = createInputMode()
}

/**
 * Create the yFiles graph from the JSON data
 * @param {!IGraph} graph
 */
function createGraphFromData(graph) {
  const id2node = new Map()
  for (const employee of people) {
    id2node.set(
      employee.id,
      graph.createNode({
        tag: employee
      })
    )
  }
  for (const employee of people) {
    if (typeof employee.superior !== 'undefined') {
      const n1 = id2node.get(employee.id)
      const n2 = id2node.get(employee.superior)
      if (n1 && n2) {
        graph.createEdge(n2, n1)
      }
    }
  }
}

/**
 * @param {!IGraph} graph
 */
function initGraphDefaults(graph) {
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    smoothingLength: 50,
    targetArrow: '#aaa triangle',
    stroke: '1.5px solid #aaa'
  })
  graph.decorator.nodeDecorator.sizeConstraintProviderDecorator.setImplementation(
    new NodeSizeConstraintProvider([50, 50], Size.INFINITE)
  )
}

/**
 * When a node is selected or deselected, update the node data JSON in the left panel.
 * @param {!GraphComponent} graphComponent
 */
function initTagView(graphComponent) {
  graphComponent.selection.addItemSelectionChangedListener((graphComponent) => {
    const firstSelectedNode = graphComponent.selectedNodes.at(0)
    if (firstSelectedNode) {
      updateTagView(firstSelectedNode)
    } else {
      updateTagView(null)
    }
  })
}

/**
 * @returns {!GraphEditorInputMode}
 */
function createInputMode() {
  const inputMode = new GraphEditorInputMode({
    allowAddLabel: false
  })

  // When a node is created, we add default dummy data as the user tag.
  inputMode.addNodeCreatedListener((inputMode, evt) => {
    const graph = inputMode.graphComponent.graph
    evt.item.tag = {
      ...defaultData,
      since: new Date().toISOString().substring(0, 10),
      id: graph.nodes.size
    }
  })
  return inputMode
}

/**
 * Run a plain hierarchic layout
 * @param {!GraphComponent} graphComponent
 */
function initLayout(graphComponent) {
  const layout = new HierarchicLayout()
  graphComponent.graph.applyLayout(layout)
  graphComponent.fitGraphBounds(20)
  document.querySelector('#layout-btn').addEventListener('click', async () => {
    await graphComponent.morphLayout(layout)
  })
}

/**
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function initExport(graphComponent) {
  // Copy the CSS rules for our HTML node style to the generated SVG
  const styles = await fetch('./style.css', {
    headers: { Accept: 'text/css' }
  }).then((r) => r.text())

  const exportBtn = document.querySelector('#export-btn')

  exportBtn.addEventListener('click', async () => {
    const exporter = new SvgExport({
      cssStyleSheet: styles,
      inlineSvgImages: true,
      strictMode: true,
      worldBounds: graphComponent.contentRect
    })
    const exportComponent = new GraphComponent()
    exportComponent.graph = graphComponent.graph
    const element = await exporter.exportSvgAsync(exportComponent)
    const exportString = SvgExport.exportSvgString(element)
    downloadFile(exportString, 'export.svg')
  })
}

void run().then(finishLoading)
