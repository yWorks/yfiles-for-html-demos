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
import {
  type Algorithm,
  algorithms,
  applyAlgorithm,
  resetTypes,
  type SampleData
} from '../algorithms/algorithms'
import {
  AdjacencyGraphBuilder,
  EdgeCreator,
  FreeEdgeLabelModel,
  type GraphComponent,
  type GraphEditorInputMode,
  type IGraph
} from '@yfiles/yfiles'
import { runLayout } from '../layout/layout'
import type { Tag } from '../demo-types'
import { updateDescriptionText } from './algorithm-description'
import { updateGraphInformation } from './graph-structure-information'
import { addNavigationButtons } from '@yfiles/demo-app/demo-page'
import { TagColoredShapeNodeStyle } from '../styles'

const sampleComboBox = document.querySelector<HTMLSelectElement>('#samples')!
const algorithmComboBox = document.querySelector<HTMLSelectElement>('#algorithms')!
const directionComboBox = document.querySelector<HTMLSelectElement>('#directions')!
const uniformEdgeWeightsComboBox =
  document.querySelector<HTMLSelectElement>('#uniform-edge-weights')!
const clearButton = document.querySelector<HTMLInputElement>('#clear-graph')!
const layoutButton = document.querySelector<HTMLButtonElement>('#layout-button')!

/**
 * Returns the algorithm that is currently selected.
 */
export function getCurrentAlgorithm(): Algorithm {
  return algorithms[algorithmComboBox.value]
}

/**
 * Determines whether the current analysis algorithm should use uniform weight for all edges.
 */
export function useUniformEdgeWeights(): boolean {
  return uniformEdgeWeightsComboBox.value === 'uniform'
}

/**
 * Determines whether the current analysis algorithm should take the direction of edges into account.
 */
export function useDirectedEdges(): boolean {
  const currentAlgorithm = getCurrentAlgorithm()
  if (currentAlgorithm.directedOnly) {
    return true
  } else {
    return currentAlgorithm.supportsDirectedness && directionComboBox.value === 'directed'
  }
}

/**
 * Wires up the combo-boxes and buttons in the toolbar.
 * @yjs:keep = directed, uniform
 */
export function initializeToolbar(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph

  clearButton.addEventListener('click', async () => {
    graph.clear()
    graph.undoEngine!.clear()
    await graphComponent.fitGraphBounds()
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
  directionComboBox.addEventListener('change', async () => {
    applyAlgorithm(graph)
    await runLayout(graphComponent, true)
  })

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
    await runLayout(graphComponent, true)
  })

  layoutButton.addEventListener('click', async () => {
    await runLayout(graphComponent, true)
  })
}

/**
 * Fills in a combo box with the values of the given array.
 */
function fillComboBox(combobox: HTMLSelectElement, content: { key: string; name: string }[]): void {
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
 */
export async function switchSample(graphComponent: GraphComponent): Promise<void> {
  setUIDisabled(true, graphComponent)

  algorithmComboBox.selectedIndex = sampleComboBox.selectedIndex

  const graph = graphComponent.graph
  const currentAlgorithm = getCurrentAlgorithm()
  uniformEdgeWeightsComboBox.selectedIndex = !currentAlgorithm.defaultSettings.supportsEdgeWeights
    ? 0
    : 1
  directionComboBox.selectedIndex = !currentAlgorithm.defaultSettings.directed ? 0 : 1

  loadGraph(graph, currentAlgorithm.sample)

  updateDescriptionText()
  updateGraphInformation(graphComponent)

  resetTypes(graph)
  applyAlgorithm(graph)
  await runLayout(graphComponent)

  graph.undoEngine!.clear()

  setUIDisabled(false, graphComponent)
}

/**
 * Loads a graph from sample data. This demo uses the {@link AdjacencyGraphBuilder} because the
 * samples are provided as adjacency lists.
 */
function loadGraph(graph: IGraph, sample: SampleData): void {
  graph.clear()
  const graphBuilder = new AdjacencyGraphBuilder(graph)
  // create the nodes
  const nodesSource = graphBuilder.createNodesSource(sample, (_, index: number) => index)
  // set a default elliptical shape for the nodes
  nodesSource.nodeCreator.defaults.style = new TagColoredShapeNodeStyle()
  // add an array to each node's tag to store the component to which it belongs
  nodesSource.nodeCreator.tagProvider = (): Tag => ({ components: [] })

  const edgeCreator = new EdgeCreator<number[]>()
  edgeCreator.defaults.style = graph.edgeDefaults.style
  // add an array to each edge's tag to store the component to which it belongs
  edgeCreator.tagProvider = (): Tag => ({ components: [] })
  nodesSource.addSuccessorIds((item) => item, edgeCreator)
  graphBuilder.buildGraph()
}

/**
 * Handles a selection change in the algorithm combo box.
 */
async function switchAlgorithm(graphComponent: GraphComponent): Promise<void> {
  const graph = graphComponent.graph

  if (useUniformEdgeWeights()) {
    deleteWeightLabels(graph)
  }

  updateDescriptionText()

  resetTypes(graph)
  applyAlgorithm(graph)
  await runLayout(graphComponent, true)
  graph.undoEngine!.clear()
}

/**
 * Disables or enables the HTML elements of the UI.
 * When enabling the UI elements, the current algorithm is considered and only suitable elements are enabled.
 */
export function setUIDisabled(disabled: boolean, graphComponent: GraphComponent): void {
  document
    .querySelectorAll('.demo-page__toolbar select, .demo-page__toolbar button')
    .forEach((element) => {
      if (element instanceof HTMLSelectElement || element instanceof HTMLButtonElement) {
        element.disabled = disabled
      }
    })
  setTimeout(() => {
    // timeout to make sure the mutex can be acquired even if it was triggered by another input mode's event
    ;(graphComponent.inputMode as GraphEditorInputMode).waiting = disabled
  }, 0)

  if (!disabled) {
    const currentAlgorithm = getCurrentAlgorithm()
    uniformEdgeWeightsComboBox.disabled = !currentAlgorithm.supportsEdgeWeights
    if (currentAlgorithm.directedOnly) {
      directionComboBox.value = 'directed'
      directionComboBox.disabled = true
    } else {
      directionComboBox.disabled = !currentAlgorithm.supportsDirectedness
    }
  }
}

/**
 * Deletes all weight labels.
 */
function deleteWeightLabels(graph: IGraph): void {
  graph.edgeLabels
    .toArray()
    .filter((label) => label.tag === 'weight')
    .forEach((label) => {
      graph.remove(label)
    })
}

/**
 * Generates labels for each edge in the graph with a random weight.
 */
function generateWeightLabels(graph: IGraph): void {
  graph.edges.forEach((edge) => {
    graph.addLabel({
      owner: edge,
      // select a weight from 1 to 20
      text: String(Math.floor(Math.random() * 20 + 1)),
      layoutParameter: FreeEdgeLabelModel.INSTANCE.createParameter(),
      tag: 'weight'
    })
  })
}
