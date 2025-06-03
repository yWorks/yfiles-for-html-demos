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
  GraphComponent,
  GraphEditorInputMode,
  IGraph,
  INode,
  IReshapeHandler,
  LabelStyle,
  License,
  NodeReshapeHandleProvider,
  Point,
  RectangleCorners,
  RectangleCornerStyle,
  RectangleNodeStyle,
  Size
} from '@yfiles/yfiles'

import { CornerSizeHandleProvider } from './CornerSizeHandleProvider'
import { enableSingleSelection } from './SingleSelectionHelper'

import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import type { ColorSet } from '@yfiles/demo-resources/demo-colors'
import { colorSets } from '@yfiles/demo-resources/demo-colors'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

const [yellow, orange, green, blue, gray] = [
  colorSets['demo-palette-71'],
  colorSets['demo-palette-72'],
  colorSets['demo-palette-73'],
  colorSets['demo-palette-74'],
  colorSets['demo-palette-75']
]

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  initializeGraph(graphComponent.graph)

  initializeInteraction(graphComponent)

  graphComponent.fitGraphBounds()

  initializeUI(graphComponent)
}

/**
 * Initializes defaults for the given graph and
 * creates a small sample with different node style settings.
 */
function initializeGraph(graph: IGraph): void {
  // Set defaults for new nodes
  graph.nodeDefaults.style = new RectangleNodeStyle({ fill: gray.fill, stroke: gray.stroke })
  graph.nodeDefaults.size = new Size(300, 100)
  graph.nodeDefaults.shareStyleInstance = false

  // Create nodes with round corners with different resizing behaviors
  createNode(graph, new Point(0, 0), yellow, RectangleCornerStyle.ROUND, false, 10)
  createNode(graph, new Point(0, 200), orange, RectangleCornerStyle.ROUND, true, 0.2)
  createNode(graph, new Point(0, 400), green, RectangleCornerStyle.ROUND, true, 0.5)
  createNode(
    graph,
    new Point(0, 600),
    blue,
    RectangleCornerStyle.ROUND,
    true,
    0.8,
    RectangleCorners.BOTTOM
  )

  // Create nodes with cut-off corners with different resizing behaviors
  createNode(graph, new Point(400, 0), yellow, RectangleCornerStyle.CUT, false, 10)
  createNode(graph, new Point(400, 200), orange, RectangleCornerStyle.CUT, true, 0.2)
  createNode(graph, new Point(400, 400), green, RectangleCornerStyle.CUT, true, 0.5)
  createNode(
    graph,
    new Point(400, 600),
    blue,
    RectangleCornerStyle.CUT,
    true,
    0.8,
    RectangleCorners.BOTTOM
  )
}

/**
 * Creates a node with a label that describes the configuration of the RectangleNodeStyle.
 * @param graph The graph to which the node belongs.
 * @param location The location of the node.
 * @param color The color set of the node and label.
 * @param cornerStyle Whether corners should be round or a line.
 * @param scaleCornerSize Whether the corner size should be used as absolute value or be scaled with the node size.
 * @param cornerSize The corner size.
 * @param corners Which corners are drawn with the given corner style.
 */
function createNode(
  graph: IGraph,
  location: Point,
  color: ColorSet,
  cornerStyle: RectangleCornerStyle,
  scaleCornerSize: boolean,
  cornerSize: number,
  corners?: RectangleCorners
) {
  const style = new RectangleNodeStyle({
    fill: color.fill,
    stroke: color.stroke,
    cornerStyle,
    scaleCornerSize,
    cornerSize,
    corners
  })

  const node = graph.createNodeAt(location, style)

  addLabel(graph, node, color)
}

/**
 * Adds a label that describes the owner's style configuration.
 * @param graph The graph to which the label belongs.
 * @param node The owner of the label.
 * @param color The color set of the label.
 */
function addLabel(graph: IGraph, node: INode, color: ColorSet) {
  graph.addLabel({
    owner: node,
    text: styleToText(node.style as RectangleNodeStyle),
    style: new LabelStyle({
      textFill: color.text,
      backgroundFill: color.nodeLabelFill,
      textSize: 12,
      padding: 5
    })
  })
}

/**
 * Sets up an input mode for the GraphComponent, and adds a custom handle
 * that allows to change the corner size.
 */
function initializeInteraction(graphComponent: GraphComponent) {
  const inputMode = new GraphEditorInputMode()
  graphComponent.inputMode = inputMode

  enableSingleSelection(graphComponent)

  // add a label to newly created node that shows the current style settings
  inputMode.addEventListener('node-created', (evt) => {
    const node = evt.item
    addLabel(graphComponent.graph, node, gray)
  })

  const nodeDecorator = graphComponent.graph.decorator.nodes

  // add handle that enables the user to change the corner size of a node
  nodeDecorator.handleProvider.addWrapperFactory(
    (n) => n.style instanceof RectangleNodeStyle,
    (node, delegateProvider) => new CornerSizeHandleProvider(node!, delegateProvider)
  )

  // only provide reshape handles for the right, bottom and bottom-right sides, so they don't clash with the corner size handle
  nodeDecorator.reshapeHandleProvider.addFactory(
    (node) =>
      new NodeReshapeHandleProvider(node, node.lookup(IReshapeHandler)!, [
        'right',
        'bottom',
        'bottom-right'
      ])
  )

  graphComponent.graph.decorator.nodes.selectionRenderer.hide()
}

/**
 * Updates the style properties editor when a different node is selected.
 */
function onSelectionChanged(selectedNode: INode | null): void {
  if (selectedNode != null) {
    const style = selectedNode.style as RectangleNodeStyle

    const cornerStyle = style.cornerStyle === RectangleCornerStyle.ROUND ? 'rounded' : 'cut'
    const cornerSizeScaling = style.scaleCornerSize ? 'relative' : 'absolute'
    const topLeftCornerAffected = (style.corners & RectangleCorners.TOP_LEFT) !== 0
    const topRightCornerAffected = (style.corners & RectangleCorners.TOP_RIGHT) !== 0
    const bottomLeftCornerAffected = (style.corners & RectangleCorners.BOTTOM_LEFT) !== 0
    const bottomRightCornerAffected = (style.corners & RectangleCorners.BOTTOM_RIGHT) !== 0

    setComboBoxState('#corner-style', false, cornerStyle)
    setComboBoxState('#corner-size-scaling', false, cornerSizeScaling)
    setCheckboxState('#corner-top-left', false, topLeftCornerAffected)
    setCheckboxState('#corner-top-right', false, topRightCornerAffected)
    setCheckboxState('#corner-bottom-left', false, bottomLeftCornerAffected)
    setCheckboxState('#corner-bottom-right', false, bottomRightCornerAffected)
    setPropertiesViewState(false)
    return
  }

  setComboBoxState('#corner-style', true, '')
  setComboBoxState('#corner-size-scaling', true, '')
  setCheckboxState('#corner-top-left', true, false)
  setCheckboxState('#corner-top-right', true, false)
  setCheckboxState('#corner-bottom-left', true, false)
  setCheckboxState('#corner-bottom-right', true, false)
  setPropertiesViewState(true)
}

/**
 * Sets the style properties when they have been changed in the editor.
 */
function updateStyleProperties(graphComponent: GraphComponent): void {
  const node = graphComponent.selection.nodes.first()
  if (node == null) {
    return
  }

  const style = node.style as RectangleNodeStyle

  const cornerStyle = document.querySelector<HTMLSelectElement>('#corner-style')!.value
  style.cornerStyle =
    cornerStyle === 'rounded' ? RectangleCornerStyle.ROUND : RectangleCornerStyle.CUT

  const cornerSizeScaling = document.querySelector<HTMLSelectElement>('#corner-size-scaling')!.value
  style.scaleCornerSize = cornerSizeScaling === 'relative'

  let corners: RectangleCorners = RectangleCorners.NONE
  if (document.querySelector<HTMLInputElement>('#corner-top-left')!.checked) {
    corners |= RectangleCorners.TOP_LEFT
  }
  if (document.querySelector<HTMLInputElement>('#corner-top-right')!.checked) {
    corners |= RectangleCorners.TOP_RIGHT
  }
  if (document.querySelector<HTMLInputElement>('#corner-bottom-left')!.checked) {
    corners |= RectangleCorners.BOTTOM_LEFT
  }
  if (document.querySelector<HTMLInputElement>('#corner-bottom-right')!.checked) {
    corners |= RectangleCorners.BOTTOM_RIGHT
  }
  style.corners = corners

  if (node.labels.size === 0) {
    graphComponent.graph.addLabel(node, styleToText(style))
  } else {
    graphComponent.graph.setLabelText(node.labels.first()!, styleToText(style))
  }

  graphComponent.invalidate()
}

/**
 * Shows the properties of the selected node if a node is selected. Otherwise, it shows an information message to select a node.
 */
function setPropertiesViewState(disabled: boolean) {
  document.querySelector<HTMLDivElement>('.demo-form-block')!.style.display = disabled ? 'none' : ''
  document.querySelector<HTMLDivElement>('.info-message')!.style.display = disabled
    ? 'inline-block'
    : 'none'
}

/**
 * Returns a text description of the style configuration.
 */
function styleToText(style: RectangleNodeStyle): string {
  return (
    `Corner Style: ${style.cornerStyle === RectangleCornerStyle.ROUND ? 'rounded' : 'cut'}\n` +
    `Corner Size Scaling: ${style.scaleCornerSize ? 'relative' : 'absolute'}\n` +
    `Affected Corners: ${cornersToText(style.corners)}`
  )
}

/**
 * Returns a text description of the given corner configuration.
 */
function cornersToText(corners: RectangleCorners): string {
  const affected = [
    RectangleCorners.ALL,
    RectangleCorners.TOP,
    RectangleCorners.BOTTOM,
    RectangleCorners.RIGHT,
    RectangleCorners.LEFT,
    RectangleCorners.TOP_LEFT,
    RectangleCorners.TOP_RIGHT,
    RectangleCorners.BOTTOM_LEFT,
    RectangleCorners.BOTTOM_RIGHT
  ]
    .filter((corner) => {
      if ((corners & corner) === corner) {
        corners &= ~corner
        return true
      }
      return false
    })
    .map((corner) => cornerValueToText(corner))
  return affected.length > 0 ? affected.join(' & ') : 'none'
}

/**
 * Returns the display text for the given corner value.
 */
function cornerValueToText(corner: RectangleCorners): string {
  return RectangleCorners[corner].toLocaleLowerCase().replace('_', '-')
}

/**
 * Binds actions to the toolbar and style property input elements.
 */
function initializeUI(graphComponent: GraphComponent): void {
  for (const element of document.getElementsByClassName('option-element')) {
    element.addEventListener('change', () => updateStyleProperties(graphComponent))
  }

  // Update the values of the input elements when the selected element changes
  graphComponent.selection.addEventListener('item-added', (_, graphComponent) =>
    onSelectionChanged(graphComponent.nodes.first())
  )
}

/**
 * Sets the disabled and checked states of the `input` element with the given ID.
 */
function setCheckboxState(id: string, disabled: boolean, checked: boolean): void {
  const checkbox = document.querySelector<HTMLInputElement>(id)!
  checkbox.disabled = disabled
  checkbox.checked = checked
}

/**
 * Sets the disabled state and value of the `select` element with the given ID.
 */
function setComboBoxState(id: string, disabled: boolean, value: string): void {
  const comboBox = document.querySelector<HTMLSelectElement>(id)!
  comboBox.disabled = disabled
  comboBox.value = value
}

run().then(finishLoading)
