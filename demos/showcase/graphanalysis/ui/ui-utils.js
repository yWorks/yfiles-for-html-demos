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
import { algorithms, applyAlgorithm, resetTypes } from '../algorithms/algorithms.js'
import { AdjacencyGraphBuilder, EdgeCreator, FreeEdgeLabelModel, ShapeNodeStyle } from 'yfiles'
import { runLayout } from '../layout/layout.js'
import { updateDescriptionText } from './algorithm-description.js'
import { updateGraphInformation } from './graph-structure-information.js'
import { addNavigationButtons } from 'demo-resources/demo-page'
import { TagColoredShapeNodeStyleRenderer } from '../styles.js'

const sampleComboBox = document.querySelector('#samples')
const algorithmComboBox = document.querySelector('#algorithms')
const directionComboBox = document.querySelector('#directions')
const uniformEdgeWeightsComboBox = document.querySelector('#uniform-edge-weights')
const clearButton = document.querySelector('#clear-graph')
const layoutButton = document.querySelector('#layout-button')

/**
 * Returns the algorithm that is currently selected.
 * @returns {!Algorithm}
 */
export function getCurrentAlgorithm() {
  return algorithms[algorithmComboBox.value]
}

/**
 * Determines whether the current analysis algorithm should use uniform weight for all edges.
 * @returns {boolean}
 */
export function useUniformEdgeWeights() {
  return uniformEdgeWeightsComboBox.value === 'uniform'
}

/**
 * Determines whether the current analysis algorithm should take the direction of edges into account.
 * @returns {boolean}
 */
export function useDirectedEdges() {
  const currentAlgorithm = getCurrentAlgorithm()
  return currentAlgorithm.supportsDirectedness && directionComboBox.value === 'directed'
}

/**
 * Wires up the combo-boxes and buttons in the toolbar.
 * @yjs:keep = directed, uniform
 * @param {!GraphComponent} graphComponent
 */
export function initializeToolbar(graphComponent) {
  const graph = graphComponent.graph

  clearButton.addEventListener('click', () => {
    graph.clear()
    graph.undoEngine.clear()
    graphComponent.fitGraphBounds()
    updateGraphInformation(graphComponent)
  })

  fillComboBox(
    sampleComboBox,
    Object.entries(algorithms).map(([name, algorithm]) => ({
      key: name,
      name: `Sample: ${algorithm.name}`
    }))
  )
  addNavigationButtons(sampleComboBox).addEventListener('change', () =>
    switchSample(graphComponent)
  )

  fillComboBox(
    algorithmComboBox,
    Object.entries(algorithms).map(([name, algorithm]) => ({
      key: name,
      name: `Algorithm: ${algorithm.name}`
    }))
  )
  addNavigationButtons(algorithmComboBox).addEventListener('change', () =>
    switchAlgorithm(graphComponent)
  )

  fillComboBox(directionComboBox, [
    { key: 'undirected', name: 'Undirected' },
    { key: 'directed', name: 'Directed' }
  ])
  directionComboBox.disabled = true
  directionComboBox.addEventListener('change', () => applyAlgorithm(graph))

  fillComboBox(uniformEdgeWeightsComboBox, [
    { key: 'uniform', name: 'Uniform Edge Weights' },
    { key: 'non-uniform', name: 'Non-uniform Edge Weights' }
  ])
  uniformEdgeWeightsComboBox.disabled = true
  uniformEdgeWeightsComboBox.addEventListener('change', async () => {
    if (useUniformEdgeWeights()) {
      deleteWeightLabels(graph)
    } else {
      generateWeightLabels(graph)
    }
    applyAlgorithm(graph)
    await runLayout(graphComponent)
  })

  layoutButton.addEventListener('click', async () => {
    await runLayout(graphComponent, true)
  })
}

/**
 * Fills in a combo box with the values of the given array.
 * @param {!HTMLSelectElement} combobox
 * @param {!Array.<object>} content
 */
function fillComboBox(combobox, content) {
  for (let i = 0; i < content.length; i++) {
    const opt = content[i]
    const el = document.createElement('option')
    el.textContent = opt.name
    el.value = opt.key
    combobox.appendChild(el)
  }
}

/**
 * Handles a selection change in the sample combo box.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
export async function switchSample(graphComponent) {
  setUIDisabled(true, graphComponent)

  algorithmComboBox.selectedIndex = sampleComboBox.selectedIndex

  const graph = graphComponent.graph
  const currentAlgorithm = getCurrentAlgorithm()
  loadGraph(graph, currentAlgorithm.sample)

  updateDescriptionText()
  updateGraphInformation(graphComponent)

  resetTypes(graph)
  applyAlgorithm(graph)
  await runLayout(graphComponent)

  graph.undoEngine.clear()

  setUIDisabled(false, graphComponent)
}

/**
 * Loads a graph from sample data. This demo uses the {@link AdjacencyGraphBuilder} because the
 * samples are provided as adjacency lists.
 * @param {!IGraph} graph
 * @param {!SampleData} sample
 */
function loadGraph(graph, sample) {
  graph.clear()
  const graphBuilder = new AdjacencyGraphBuilder(graph)
  // create the nodes
  const nodesSource = graphBuilder.createNodesSource(sample, (item, index) => index)
  // set a default elliptical shape for the nodes
  nodesSource.nodeCreator.defaults.style = new ShapeNodeStyle({
    shape: 'ellipse',
    renderer: new TagColoredShapeNodeStyleRenderer()
  })
  // add an array to each node's tag to store the component to which it belongs
  nodesSource.nodeCreator.tagProvider = () => ({
    components: []
  })

  const edgeCreator = new EdgeCreator()
  edgeCreator.defaults.style = graph.edgeDefaults.style
  // add an array to each edge's tag to store the component to which it belongs
  edgeCreator.tagProvider = () => ({
    components: []
  })
  nodesSource.addSuccessorIds((item) => item, edgeCreator)
  graphBuilder.buildGraph()
}

/**
 * Handles a selection change in the algorithm combo box.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function switchAlgorithm(graphComponent) {
  const graph = graphComponent.graph

  if (useUniformEdgeWeights()) {
    deleteWeightLabels(graph)
  }

  updateDescriptionText()

  resetTypes(graph)
  applyAlgorithm(graph)
  await runLayout(graphComponent, true)
  graph.undoEngine.clear()
}

/**
 * Disables or enables the HTML elements of the UI.
 * When enabling the UI elements, the current algorithm is considered and only suitable elements are enabled.
 * @param {boolean} disabled
 * @param {!GraphComponent} graphComponent
 */
export function setUIDisabled(disabled, graphComponent) {
  document
    .querySelectorAll('.demo-page__toolbar select, .demo-page__toolbar button')
    .forEach((element) => {
      if (element instanceof HTMLSelectElement || element instanceof HTMLButtonElement) {
        element.disabled = disabled
      }
    })
  setTimeout(() => {
    // timeout to make sure the mutex can be acquired even if it was triggered by another input mode's event
    graphComponent.inputMode.waiting = disabled
  }, 0)

  if (!disabled) {
    const currentAlgorithm = getCurrentAlgorithm()
    uniformEdgeWeightsComboBox.disabled = !currentAlgorithm.supportsEdgeWeights
    directionComboBox.disabled = !currentAlgorithm.supportsDirectedness
  }
}

/**
 * Deletes all weight labels.
 * @param {!IGraph} graph
 */
function deleteWeightLabels(graph) {
  graph.edgeLabels
    .toArray()
    .filter((label) => label.tag === 'weight')
    .forEach((label) => {
      graph.remove(label)
    })
}

/**
 * Generates labels for each edge in the graph with a random weight.
 * @param {!IGraph} graph
 */
function generateWeightLabels(graph) {
  graph.edges.forEach((edge) => {
    graph.addLabel({
      owner: edge,
      // select a weight from 1 to 20
      text: String(Math.floor(Math.random() * 20 + 1)),
      layoutParameter: FreeEdgeLabelModel.INSTANCE.createDefaultParameter(),
      tag: 'weight'
    })
  })
}
