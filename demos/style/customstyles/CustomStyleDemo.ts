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
  type Class,
  CollapsibleNodeStyleDecorator,
  DefaultLabelStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  type GraphMLIOHandler,
  GraphMLSupport,
  type HandleSerializationEventArgs,
  ICommand,
  type IGraph,
  Insets,
  InteriorLabelModel,
  InteriorLabelModelPosition,
  License,
  NodeInsetsProvider,
  Point,
  Rect,
  Size,
  VoidPortStyle
} from 'yfiles'

import Sample1CollapsibleNodeStyleDecoratorRenderer from './Sample1CollapsibleNodeStyleDecoratorRenderer'
import Sample1GroupNodeStyle from './Sample1GroupNodeStyle'
import Sample1LabelStyle from './Sample1LabelStyle'
import Sample1EdgeStyle from './Sample1EdgeStyle'
import Sample1NodeStyle from './Sample1NodeStyle'
import Sample1PortStyle from './Sample1PortStyle'
import { Sample2GroupNodeStyle, Sample2GroupNodeStyleExtension } from './Sample2GroupNodeStyle'
import { Sample2EdgeStyle, Sample2EdgeStyleExtension } from './Sample2EdgeStyle'
import { Sample2NodeStyle, Sample2NodeStyleExtension } from './Sample2NodeStyle'
import { Sample2Arrow, Sample2ArrowExtension } from './Sample2Arrow'
import { applyDefaultStyles } from './style-utils'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, addOptions, finishLoading } from 'demo-resources/demo-page'

async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // Enable folding such that the group styles show an expand/collapse button
  const foldingManager = new FoldingManager(graphComponent.graph)
  graphComponent.graph = foldingManager.createFoldingView().graph

  // Create some graph elements
  createSampleGraph(graphComponent.graph)

  // Initially, set the styles of sample #1
  applySample1(graphComponent.graph)
  applyDefaultStyles(graphComponent.graph)

  // Initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // Enable support to save the second sample to graphml
  enableGraphML(graphComponent)

  graphComponent.fitGraphBounds()

  initializeUI(graphComponent)
}

/**
 * Sets the styles of sample #1 to the graph defaults.
 */
function applySample1(graph: IGraph): void {
  // Wrap the group style with CollapsibleNodeStyleDecorator
  // Use a custom renderer to change the collapse button visualization
  const nodeStyleDecorator = new CollapsibleNodeStyleDecorator(
    new Sample1GroupNodeStyle(),
    new Sample1CollapsibleNodeStyleDecoratorRenderer(new Size(14, 14))
  )
  // Use a specific label model for the placement of the group button
  nodeStyleDecorator.buttonPlacement = new InteriorLabelModel({ insets: 2 }).createParameter(
    InteriorLabelModelPosition.SOUTH_EAST
  )

  graph.groupNodeDefaults.style = nodeStyleDecorator

  graph.nodeDefaults.style = new Sample1NodeStyle()
  graph.nodeDefaults.labels.style = new Sample1LabelStyle()
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.NORTH
  graph.nodeDefaults.ports.style = new Sample1PortStyle()

  graph.edgeDefaults.style = new Sample1EdgeStyle()
  graph.edgeDefaults.labels.style = new Sample1LabelStyle()

  // add some insets to the group nodes
  graph.decorator.nodeDecorator.insetsProviderDecorator.setFactory(
    () => new NodeInsetsProvider(new Insets(10, 30, 10, 25))
  )
}

/**
 * Sets the styles of sample #2 to the graph defaults.
 */
function applySample2(graph: IGraph): void {
  // define the demo node style using the 'node-color' css rule
  graph.nodeDefaults.style = new Sample2NodeStyle('node-color')

  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: '#c8dfb3',
    shape: 'pill',
    insets: 5
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.NORTH
  graph.nodeDefaults.ports.style = VoidPortStyle.INSTANCE

  const groupNodeStyle = new Sample2GroupNodeStyle()
  groupNodeStyle.isCollapsible = true
  graph.groupNodeDefaults.style = groupNodeStyle

  // define the demo edge style using the 'edge-color' css rule
  graph.edgeDefaults.style = new Sample2EdgeStyle('edge-color')
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: '#acb5a3',
    shape: 'pill',
    insets: 5
  })

  // add some insets to the group nodes
  graph.decorator.nodeDecorator.insetsProviderDecorator.setFactory(
    () => new NodeInsetsProvider(new Insets(10, 30, 10, 25))
  )
}

/**
 * Enables saving and loading of the demo's custom styles {@link Sample2NodeStyle}, {@link Sample2EdgeStyle},
 * {@link Sample2Arrow} and {@link Sample2GroupNodeStyle} from and to GraphML.
 *
 * Only supported for the styles shown in sample 2.
 */
function enableGraphML(graphComponent: GraphComponent): void {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: 'file-system'
  })

  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/2.0',
    {
      Sample2NodeStyle,
      Sample2NodeStyleExtension,
      Sample2EdgeStyle,
      Sample2EdgeStyleExtension,
      Sample2Arrow,
      Sample2ArrowExtension,
      Sample2GroupNodeStyle,
      Sample2GroupNodeStyleExtension
    }
  )
  gs.graphMLIOHandler.addHandleSerializationListener(demoSerializationListener)
}

/**
 * Serialization listener which enables to write and load the custom style implementations
 * {@link Sample2NodeStyle}, {@link Sample2EdgeStyle}, {@link Sample2Arrow} and {@link Sample2GroupNodeStyle} to
 * and from graphml.
 *
 * It uses the respective markup extension classes {@link Sample2NodeStyleExtension},
 * {@link Sample2EdgeStyleExtension}, {@link Sample2ArrowExtension} and {@link Sample2GroupNodeStyleExtension}.
 *
 * @param source the graphml handler
 * @param args the event arguments
 */
function demoSerializationListener(
  source: GraphMLIOHandler,
  args: HandleSerializationEventArgs
): void {
  const item = args.item as
    | Sample2NodeStyle
    | Sample2GroupNodeStyle
    | Sample2EdgeStyle
    | Sample2Arrow
    | null

  let markupExtension:
    | Sample2NodeStyleExtension
    | Sample2GroupNodeStyleExtension
    | Sample2EdgeStyleExtension
    | Sample2ArrowExtension
    | null = null
  let markupExtensionClass: Class | null = null
  if (item instanceof Sample2NodeStyle) {
    markupExtension = new Sample2NodeStyleExtension()
    markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
    markupExtensionClass = Sample2NodeStyleExtension.$class
  } else if (item instanceof Sample2GroupNodeStyle) {
    markupExtension = new Sample2GroupNodeStyleExtension()
    markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
    markupExtension.isCollapsible = item.isCollapsible
    markupExtension.solidHitTest = item.solidHitTest
    markupExtensionClass = Sample2GroupNodeStyleExtension.$class
  } else if (item instanceof Sample2EdgeStyle) {
    markupExtension = new Sample2EdgeStyleExtension()
    markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
    markupExtension.showTargetArrows = item.showTargetArrows
    markupExtension.useMarkerArrows = item.useMarkerArrows
    markupExtensionClass = Sample2EdgeStyleExtension.$class
  } else if (item instanceof Sample2Arrow) {
    markupExtension = new Sample2ArrowExtension()
    markupExtension.cssClass = item.cssClass != null ? item.cssClass : ''
    markupExtensionClass = Sample2ArrowExtension.$class
  }

  if (markupExtension && markupExtensionClass) {
    const context = args.context
    context.serializeReplacement(markupExtensionClass, item, markupExtension)
    args.handled = true
  }
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  graph.nodeDefaults.size = new Size(50, 50)
  const n0 = graph.createNodeAt({
    location: new Point(291, 433),
    tag: 'rgb(108, 0, 255)'
  })
  const n1 = graph.createNodeAt({
    location: new Point(396, 398),
    tag: 'rgb(210, 255, 0)'
  })
  const n2 = graph.createNodeAt({
    location: new Point(462, 308),
    tag: 'rgb(0, 72, 255)'
  })
  const n3 = graph.createNodeAt({
    location: new Point(462, 197),
    tag: 'rgb(255, 0, 84)'
  })
  const n4 = graph.createNodeAt({
    location: new Point(396, 107),
    tag: 'rgb(255, 30, 0)'
  })
  const n5 = graph.createNodeAt({
    location: new Point(291, 73),
    tag: 'rgb(0, 42, 255)'
  })
  const n6 = graph.createNodeAt({
    location: new Point(185, 107),
    tag: 'rgb(114, 255, 0)'
  })
  const n7 = graph.createNodeAt({
    location: new Point(119, 197),
    tag: 'rgb(216, 0, 255)'
  })
  const n8 = graph.createNodeAt({
    location: new Point(119, 308),
    tag: 'rgb(36, 255, 0)'
  })
  const n9 = graph.createNodeAt({
    location: new Point(185, 398),
    tag: 'rgb(216, 0, 255)'
  })

  const labelModel = new ExteriorLabelModel({ insets: 15 })

  graph.addLabel(n0, 'Node 0', labelModel.createParameter(ExteriorLabelModelPosition.SOUTH))
  graph.addLabel(n1, 'Node 1', labelModel.createParameter(ExteriorLabelModelPosition.SOUTH_EAST))
  graph.addLabel(n2, 'Node 2', labelModel.createParameter(ExteriorLabelModelPosition.EAST))
  graph.addLabel(n3, 'Node 3', labelModel.createParameter(ExteriorLabelModelPosition.EAST))
  graph.addLabel(n4, 'Node 4', labelModel.createParameter(ExteriorLabelModelPosition.NORTH_EAST))
  graph.addLabel(n5, 'Node 5', labelModel.createParameter(ExteriorLabelModelPosition.NORTH))
  graph.addLabel(n6, 'Node 6', labelModel.createParameter(ExteriorLabelModelPosition.NORTH_WEST))
  graph.addLabel(n7, 'Node 7', labelModel.createParameter(ExteriorLabelModelPosition.WEST))
  graph.addLabel(n8, 'Node 8', labelModel.createParameter(ExteriorLabelModelPosition.WEST))
  graph.addLabel(n9, 'Node 9', labelModel.createParameter(ExteriorLabelModelPosition.SOUTH_WEST))

  graph.createEdge(n0, n4)
  graph.createEdge(n6, n0)
  graph.createEdge(n6, n5)
  graph.createEdge(n5, n2)
  graph.createEdge(n3, n7)
  graph.createEdge(n9, n4)

  // Add all nodes to a group
  const group1 = graph.groupNodes({ children: graph.nodes })
  group1.tag = 'gold'
  graph.setNodeLayout(group1, new Rect(0, -50, 600, 600))
}

function initializeUI(graphComponent: GraphComponent): void {
  const modifyColors = document.querySelector<HTMLButtonElement>('#modify-colors-button')!
  modifyColors.addEventListener('click', () => {
    // Set the tag of all non-group nodes to a new color
    graphComponent.graph.nodes
      .filter(node => !graphComponent.graph.isGroupNode(node))
      .forEach(node => {
        node.tag = `hsl(${Math.random() * 360},100%,50%)`
      })
    // Finally, the view is invalidated because the graph cannot know that we have changed values
    // on which the styles depend
    graphComponent.graph.invalidateDisplays()
  })

  // Wire the save button, but initially disable it - will be enabled on selecting sample 2
  const saveButton = getElementById<HTMLButtonElement>('save-button')
  saveButton.addEventListener('click', () => ICommand.SAVE.execute(null, graphComponent))
  saveButton.disabled = true

  const sampleSelectElements = ['#sample-select--sidebar', '#sample-select--toolbar'].map(
    selector => document.querySelector<HTMLSelectElement>(selector)!
  )
  for (const selectElement of sampleSelectElements) {
    addOptions(selectElement, 'Sample 1', 'Sample 2')
    addNavigationButtons(selectElement, true, false)

    selectElement.addEventListener('change', () => {
      const sampleName = selectElement.value
      switch (sampleName) {
        case 'Sample 1':
        default:
          // Set up the styles of the first sample
          applySample1(graphComponent.graph)

          // Update UI accordingly
          updateDescriptionText('sample-1-description', 'sample-2-description')
          modifyColors.disabled = false
          saveButton.disabled = true
          break
        case 'Sample 2':
          // Set up the styles of the second sample
          applySample2(graphComponent.graph)

          // Update UI accordingly
          updateDescriptionText('sample-2-description', 'sample-1-description')
          modifyColors.disabled = true
          saveButton.disabled = false
          break
      }

      // Apply the new default styles
      applyDefaultStyles(graphComponent.graph)

      // Updates all other select elements
      for (const selectElement of sampleSelectElements) {
        selectElement.value = sampleName
      }
    })
  }
}

/**
 * Updates the description text in the demo's left sidebar.
 * @param visibleId the div element which becomes visible
 * @param hiddenId the div element which gets hidden
 */
function updateDescriptionText(visibleId: string, hiddenId: string): void {
  getElementById<HTMLDivElement>(hiddenId).classList.add('hidden')
  getElementById<HTMLDivElement>(visibleId).classList.remove('hidden')
  const descriptionContainer = getElementById<HTMLDivElement>('sample-description-container')
  descriptionContainer.classList.remove('highlight-description')
  setTimeout(() => descriptionContainer.classList.add('highlight-description'), 0)
}

/**
 * Returns a reference to the first element with the specified ID in the current document.
 * @returns A reference to the first element with the specified ID in the current document.
 */
function getElementById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

void run().then(finishLoading)
