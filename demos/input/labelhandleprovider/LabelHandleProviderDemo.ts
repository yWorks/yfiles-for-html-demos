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
import {
  EdgeSegmentLabelModel,
  FreeEdgeLabelModel,
  FreeLabelModel,
  FreeNodeLabelModel,
  GenericLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ILabel,
  InteriorLabelModel,
  LabelStyleDecorationInstaller,
  License,
  Size,
  StringTemplateLabelStyle,
  TemplateLabelStyle,
  Visualization
} from 'yfiles'

import LabelHandleProvider from './LabelHandleProvider'
import {
  applyDemoTheme,
  createDemoNodeLabelStyle,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeGraph()

  initializeInputMode()
}

/**
 * Sets the default styles and creates the graph.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  // add a custom handle provider for labels
  graph.decorator.labelDecorator.handleProviderDecorator.setFactory(getLabelHandleProvider)
  // for rotatable labels: modify the selection visualization to indicate that this label can be rotated
  const templateString = `<g>
           <rect fill="none" stroke-width="3" stroke="lightgray" width="{TemplateBinding width}" height="{TemplateBinding height}"></rect>
           <line x1="{TemplateBinding width, Converter=demoBindings.halfConverter}" y1="0" x2="{TemplateBinding width, Converter=demoBindings.halfConverter}" y2="-15" stroke-width="{TemplateBinding isUpsideDown, Converter=demoBindings.showUpsideHandle}" stroke="lightgray"></line>
           <line x1="{TemplateBinding width, Converter=demoBindings.halfConverter}" y1="{TemplateBinding height}" x2="{TemplateBinding width, Converter=demoBindings.halfConverter}" y2="{TemplateBinding height, Converter=demoBindings.flippedHandlePosition}" stroke-width="{TemplateBinding isUpsideDown, Converter=demoBindings.showFlippedHandle}" stroke="lightgray"></line>
           <circle r="4" stroke="black" stroke-width="1" fill="none" cx="{TemplateBinding width, Converter=demoBindings.halfConverter}" cy="{TemplateBinding height, Converter=demoBindings.halfConverter}"></circle>
         </g>`

  TemplateLabelStyle.CONVERTERS.demoBindings = {
    halfConverter: (value: number): number => value * 0.5,
    flippedHandlePosition: (height: number): number => height + 15,
    showUpsideHandle: (isUpsideDown: boolean): '0' | '3' => (isUpsideDown ? '0' : '3'),
    showFlippedHandle: (isUpsideDown: boolean): '0' | '3' => (isUpsideDown ? '3' : '0')
  }
  const templateLabelStyle = new StringTemplateLabelStyle(templateString)

  const labelDecorationInstaller = new LabelStyleDecorationInstaller({
    labelStyle: templateLabelStyle
  })

  graphComponent.graph.decorator.labelDecorator.selectionDecorator.setImplementation(
    label =>
      label.layoutParameter.model instanceof FreeNodeLabelModel ||
      label.layoutParameter.model instanceof FreeEdgeLabelModel ||
      label.layoutParameter.model instanceof FreeLabelModel,
    labelDecorationInstaller
  )

  initDemoStyles(graph)
  graphComponent.graph.nodeDefaults.size = new Size(100, 50)

  // Our resize logic does not work together with all label models resp. label model parameters
  // for simplicity, we just use a centered label for nodes
  graph.nodeDefaults.labels.layoutParameter = new GenericLabelModel(
    InteriorLabelModel.CENTER
  ).createDefaultParameter()

  const labelModel = new EdgeSegmentLabelModel({ distance: 10 })
  graph.edgeDefaults.labels.layoutParameter = labelModel.createParameterFromSource(
    0,
    0.5,
    'right-of-edge'
  )

  // create sample graph
  const n1 = graph.createNodeAt({
    location: [100, 100],
    labels: ['Centered Node Label. Resizes symmetrically.']
  })
  const rotatingLabelStyle = createDemoNodeLabelStyle('demo-palette-13')
  rotatingLabelStyle.autoFlip = false
  const n2 = graph.createNodeAt({
    location: [500, 0],
    labels: [
      {
        text: 'Free Node Label.\nSupports rotation and asymmetric resizing',
        layoutParameter: new FreeNodeLabelModel().createParameter([0.5, 0.5], [0, 0], [0.5, 0.5]),
        style: rotatingLabelStyle
      }
    ]
  })
  graph.createEdge({
    source: n2,
    target: n1,
    labels: ['Rotated Edge Label']
  })

  graphComponent.fitGraphBounds()
}

/**
 * Returns the LabelHandleProvider for the given label.
 * @param label The given label
 */
function getLabelHandleProvider(label: ILabel) {
  return new LabelHandleProvider(label)
}

/**
 * Initializes the input mode.
 */
function initializeInputMode(): void {
  const mode = new GraphEditorInputMode({
    // customize hit test order to simplify click selecting labels
    clickHitTestOrder: [
      GraphItemTypes.EDGE_LABEL,
      GraphItemTypes.NODE_LABEL,
      GraphItemTypes.BEND,
      GraphItemTypes.EDGE,
      GraphItemTypes.NODE,
      GraphItemTypes.PORT,
      GraphItemTypes.ALL
    ]
  })

  // add a label to each created node
  mode.addNodeCreatedListener((_, evt) => {
    const graph = graphComponent.graph
    graph.addLabel(evt.item, `Node ${graph.nodes.size}`)
  })

  // the handles should be moved together with the ghost visualization of the label
  mode.moveLabelInputMode.visualization = Visualization.LIVE

  graphComponent.inputMode = mode
}

run().then(finishLoading)
