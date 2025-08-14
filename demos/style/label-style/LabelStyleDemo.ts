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
  Font,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  HorizontalTextAlignment,
  IGraph,
  ILabelModelParameter,
  Insets,
  LabelShape,
  LabelStyle,
  License,
  SmartEdgeLabelModel,
  TextWrapping,
  VerticalTextAlignment
} from '@yfiles/yfiles'

import { configureToolTips } from './ToolTipHelper'
import type { ColorSetName } from '@yfiles/demo-resources/demo-styles'
import {
  colorSets,
  createDemoEdgeStyle,
  createDemoNodeStyle,
  initDemoStyles
} from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  const graph = graphComponent.graph
  initDemoStyles(graph)

  // Create node and edge labels using different label style settings
  createSampleNodeLabels(graph)
  createSampleEdgeLabels(graph)

  // Configure the interaction features and tool tips
  configureInteraction(graphComponent)

  // Initialize the UI and show the demo
  void graphComponent.fitGraphBounds()
}

/**
 * Creates some sample node labels with different background styles.
 * @param graph The graph to add node labels to.
 */
function createSampleNodeLabels(graph: IGraph) {
  const n1 = graph.createNode({ layout: [-25, -100, 50, 200], tag: { editableLabels: true } })
  // Add sample node labels to the first node, distributed evenly on the side and with different
  // background shapes
  graph.addLabel({
    owner: n1,
    text: 'Rectangle Node Label',
    layoutParameter: createNodeLabelParameter([1, 0.2], [100, 0]),
    style: createNodeLabelStyle({ shape: LabelShape.RECTANGLE })
  })
  graph.addLabel({
    owner: n1,
    text: 'Rounded Node Label',
    layoutParameter: createNodeLabelParameter([1, 0.4], [100, 0]),
    style: createNodeLabelStyle({ shape: LabelShape.ROUND_RECTANGLE, padding: new Insets(2) })
  })
  graph.addLabel({
    owner: n1,
    text: 'Hexagon Node Label',
    layoutParameter: createNodeLabelParameter([1, 0.6], [100, 0]),
    //The hexagon background needs slightly larger insets at the sides
    style: createNodeLabelStyle({ shape: LabelShape.HEXAGON })
  })
  graph.addLabel({
    owner: n1,
    text: 'Pill Node Label',
    layoutParameter: createNodeLabelParameter([1, 0.8], [100, 0]),
    style: createNodeLabelStyle({ shape: LabelShape.PILL })
  })

  // Create two more nodes, the bottom one and the right one
  const n2 = graph.createNode({ layout: [275, 600, 50, 50] })
  graph.setStyle(n2, createDemoNodeStyle('demo-palette-14'))
  const n3 = graph.createNode({ layout: [525, -100, 50, 200] })
  graph.setStyle(n3, createDemoNodeStyle('demo-palette-12'))

  // Add three node labels to the right node showing different text clipping and text wrapping options
  graph.addLabel({
    owner: n3,
    text: `Wrapped and clipped label text`,
    layoutParameter: createNodeLabelParameter([1, 0.2], [120, 0]),
    style: createNodeLabelStyle({
      theme: 'demo-palette-12',
      shape: LabelShape.PILL,
      wrapping: TextWrapping.WRAP_WORD_ELLIPSIS
    }),
    preferredSize: [140, 25]
  })

  graph.addLabel({
    owner: n3,
    text: `Un-wrapped but clipped label text`,
    layoutParameter: createNodeLabelParameter([1, 0.5], [120, 0]),
    style: createNodeLabelStyle({
      theme: 'demo-palette-12',
      shape: LabelShape.PILL,
      wrapping: TextWrapping.CLIP
    }),
    preferredSize: [140, 25]
  })

  // For the last label, disable text clipping
  graph.addLabel({
    owner: n3,
    text: 'Un-wrapped and un-clipped label text',
    layoutParameter: createNodeLabelParameter([1, 0.8], [120, 0]),
    style: createNodeLabelStyle({
      theme: 'demo-palette-12',
      shape: LabelShape.PILL,
      wrapping: TextWrapping.NONE
    }),
    preferredSize: [140, 25]
  })
}

/**
 * Creates some sample edge labels with different background styles.
 * @param graph The graph to add edge labels to.
 */
function createSampleEdgeLabels(graph: IGraph) {
  const edgeLabelModel = new SmartEdgeLabelModel({ angle: Math.PI / 2 })

  graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createParameterFromSource(0)

  const edge1 = graph.createEdge(graph.nodes.get(0), graph.nodes.get(1))
  graph.addBend(edge1, [0, 400])

  //Add sample edge labels on the first edge segment, distributed evenly on the path and with different
  //background shapes
  graph.addLabel({
    owner: edge1,
    text: 'Rectangle Edge Label\n' + 'A second line of sample text.',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, 0, 0.2),
    style: createEdgeLabelStyle({ shape: LabelShape.RECTANGLE })
  })
  graph.addLabel({
    owner: edge1,
    text: 'Rounded Edge Label\n' + 'A second line of sample text.',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, 0, 0.4),
    // For the round rectangle, we can manually increase the padding around the text
    // using the insets property. By default, this would be just as tight as for
    // LabelShape.RECTANGLE, but in order to make sure that text is less likely to touch
    // the stroke of the round rectangle, we add 2 extra pixels.
    style: createEdgeLabelStyle({ shape: LabelShape.ROUND_RECTANGLE, padding: new Insets(2) })
  })
  graph.addLabel({
    owner: edge1,
    text: 'Hexagon Edge Label\n' + 'A second line of sample text.',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, 0, 0.6),
    style: createEdgeLabelStyle({ shape: LabelShape.HEXAGON })
  })
  graph.addLabel({
    owner: edge1,
    text: 'Pill Edge Label\n' + 'A second line of sample text.',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, 0, 0.8),
    style: createEdgeLabelStyle({ shape: LabelShape.PILL })
  })

  //Add rotated edge labels on the second edge segment, distributed evenly and with different
  //background shapes
  graph.addLabel({
    owner: edge1,
    text: 'Rotated Rectangle',
    layoutParameter: edgeLabelModel.createParameterFromSource(1, 0, 0.2),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-15',
      shape: LabelShape.RECTANGLE,
      font: new Font('Monospace', 16)
    })
  })
  graph.addLabel({
    owner: edge1,
    text: 'Rotated Rounded Rectangle',
    layoutParameter: edgeLabelModel.createParameterFromSource(1, 0, 0.4),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-15',
      shape: LabelShape.ROUND_RECTANGLE,
      // For the round rectangle, we can manually increase the padding around the text
      // using the insets property. By default, this would be just as tight as for
      // LabelShape.RECTANGLE, but in order to make sure that text is less likely to touch
      // the stroke of the round rectangle, we add 2 extra pixels.
      padding: new Insets(2),
      font: new Font('Monospace', 16)
    })
  })
  graph.addLabel({
    owner: edge1,
    text: 'Rotated Hexagon',
    layoutParameter: edgeLabelModel.createParameterFromSource(1, 0, 0.6),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-15',
      shape: LabelShape.HEXAGON,
      font: new Font('Monospace', 16)
    })
  })
  graph.addLabel({
    owner: edge1,
    text: 'Rotated Pill',
    layoutParameter: edgeLabelModel.createParameterFromSource(1, 0, 0.8),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-15',
      shape: LabelShape.PILL,
      font: new Font('Monospace', 16)
    })
  })

  const edge2 = graph.createEdge(graph.nodes.get(2), graph.nodes.get(1))
  graph.addBend(edge2, [550, 625])
  graph.setStyle(edge2, createDemoEdgeStyle({ colorSetName: 'demo-palette-12' }))

  // Add larger edge labels with different vertical and horizontal text alignment settings to the second edge
  graph.addLabel({
    owner: edge2,
    text: 'Edge Label\nwith vertical text\nalignment at bottom',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, -20, 0.4),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-12',
      shape: LabelShape.ROUND_RECTANGLE,
      padding: new Insets(2),
      font: new Font('sans-serif', 14, 'normal', 'bold'),
      verticalTextAlignment: VerticalTextAlignment.BOTTOM
    }),
    // Explicitly specify a preferred size for the label that is much larger than needed for the label's text
    preferredSize: [150, 120]
  })
  graph.addLabel({
    owner: edge2,
    text: 'Edge Label\nwith vertical text\nalignment at top',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, 20, 0.4),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-12',
      shape: LabelShape.ROUND_RECTANGLE,
      padding: new Insets(2),
      font: new Font('sans-serif', 14, 'normal', 'bold'),
      verticalTextAlignment: VerticalTextAlignment.TOP
    }),
    // Explicitly specify a preferred size for the label that is much larger than needed for the label's text
    preferredSize: [150, 120]
  })
  graph.addLabel({
    owner: edge2,
    text: 'Edge Label\nwith vertical center\nand horizontal left\ntext alignment',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, 20, 0.7),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-12',
      shape: LabelShape.ROUND_RECTANGLE,
      padding: new Insets(2),
      font: new Font('sans-serif', 14, 'normal', 'bold'),
      verticalTextAlignment: VerticalTextAlignment.CENTER,
      horizontalTextAlignment: HorizontalTextAlignment.LEFT
    }),
    // Explicitly specify a preferred size for the label that is much larger than needed for the label's text
    preferredSize: [150, 120]
  })
  graph.addLabel({
    owner: edge2,
    text: 'Edge Label\nwith vertical bottom\nand horizontal right\ntext alignment',
    layoutParameter: edgeLabelModel.createParameterFromSource(0, -20, 0.7),
    style: createEdgeLabelStyle({
      theme: 'demo-palette-12',
      shape: LabelShape.ROUND_RECTANGLE,
      padding: new Insets(2),
      font: new Font('sans-serif', 14, 'normal', 'bold'),
      verticalTextAlignment: VerticalTextAlignment.BOTTOM,
      horizontalTextAlignment: HorizontalTextAlignment.RIGHT
    }),
    // Explicitly specify a preferred size for the label that is much larger than needed for the label's text
    preferredSize: [150, 120]
  })
}

/**
 * Creates and configures a node label style.
 * @param theme The name of the color set to use for the style's fills and stroke.
 * @param shape The label shape for the background.
 * @param font The font for the label text.
 * @param padding Optional padding to account for special background shapes.
 * @param wrapping The optional text wrapping defining how text of the label is trimmed.
 * @param verticalTextAlignment The vertical text alignment.
 * @param horizontalTextAlignment The horizontal text alignment.
 */
function createNodeLabelStyle({
  theme = 'demo-palette-13',
  shape = LabelShape.RECTANGLE,
  font = new Font('Arial', 14),
  padding = new Insets(0),
  wrapping = TextWrapping.CLIP,
  verticalTextAlignment = VerticalTextAlignment.CENTER,
  horizontalTextAlignment = HorizontalTextAlignment.CENTER
}: {
  theme?: ColorSetName
  shape?: LabelShape
  font?: Font
  padding?: Insets
  wrapping?: TextWrapping
  verticalTextAlignment?: VerticalTextAlignment
  horizontalTextAlignment?: HorizontalTextAlignment
} = {}): LabelStyle {
  return new LabelStyle({
    shape,
    backgroundFill: colorSets[theme].nodeLabelFill,
    backgroundStroke: 'none',
    font,
    textFill: colorSets[theme].text,
    padding,
    wrapping,
    verticalTextAlignment,
    horizontalTextAlignment
  })
}

/**
 * Creates and configures an edge label style.
 * @param theme The name of the color set to use for the style's fills and stroke.
 * @param shape The label shape for the background.
 * @param font The font for the label text.
 * @param padding Optional padding to account for special background shapes.
 * @param wrapping The optional text wrapping defining how text of the label is trimmed.
 * @param verticalTextAlignment The vertical text alignment.
 * @param horizontalTextAlignment The horizontal text alignment.
 */
function createEdgeLabelStyle({
  theme = 'demo-palette-13',
  shape = LabelShape.RECTANGLE,
  font = new Font('Arial', 14),
  padding = new Insets(0),
  wrapping = TextWrapping.NONE,
  verticalTextAlignment = VerticalTextAlignment.CENTER,
  horizontalTextAlignment = HorizontalTextAlignment.CENTER
}: {
  theme?: ColorSetName
  shape?: LabelShape
  font?: Font
  padding?: Insets
  wrapping?: TextWrapping
  verticalTextAlignment?: VerticalTextAlignment
  horizontalTextAlignment?: HorizontalTextAlignment
} = {}): LabelStyle {
  return new LabelStyle({
    shape,
    backgroundFill: colorSets[theme].edgeLabelFill,
    backgroundStroke: 'none',
    font,
    textFill: colorSets[theme].text,
    padding,
    wrapping,
    verticalTextAlignment,
    horizontalTextAlignment
  })
}

/**
 * Creates a node label at the specified vertical ratio.
 * @param layoutRatio The ratio that describes the point on the node's layout relative to its upper-left corner.
 * @param layoutOffset The absolute offset to apply to the point on the node after the ratio has been determined.
 */
function createNodeLabelParameter(
  layoutRatio: [number, number],
  layoutOffset: [number, number]
): ILabelModelParameter {
  return FreeNodeLabelModel.INSTANCE.createParameter({
    layoutRatio,
    layoutOffset,
    labelRatio: [0.5, 0.5]
  })
}

/**
 * Configures the interaction behavior and the tooltips.
 *
 * Since this demo is about the styles of the labels, not their placement, only interaction with
 * them is allowed.
 */
function configureInteraction(graphComponent: GraphComponent): void {
  const inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowCreateEdge: false,
    allowCreateBend: false,
    showHandleItems: 'none',
    selectableItems: 'label',
    movableSelectedItems: 'label',
    deletableItems: 'none'
  })
  inputMode.editLabelInputMode.addEventListener('query-label-editing', (evt) => {
    // only the labels of the orange node are editable
    if (!evt.owner?.tag?.editableLabels) {
      evt.cancel = true
    }
  })
  configureToolTips(inputMode)

  graphComponent.inputMode = inputMode
}

run().then(finishLoading)
