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
  DefaultLabelStyle,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  GroupNodeStyle,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  License,
  RectangleNodeStyle
} from 'yfiles'
import {
  createDefaultHierarchicLayout,
  createTabularGroupsHierarchicLayout
} from './HierarchicLayoutTabularGroups'
import { applyDemoTheme, colorSets, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

const sortingToggle = document.querySelector<HTMLInputElement>('#sorting-toggle')!
const tabularGroupsToggle = document.querySelector<HTMLInputElement>('#tabular-groups-toggle')!
const distanceSlider = document.querySelector<HTMLInputElement>('#child-distance-slider')!
const sampleComboBox = document.querySelector<HTMLSelectElement>('#sample-combo-box')!
const distanceLabel = document.querySelector('#childDistanceLabel')!

/**
 * The graph component holding the graph and shown in this demo.
 */
let graphComponent: GraphComponent

/**
 * Runs this demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  //basic graph component configuration
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphViewerInputMode()

  // load the sample graph and run the layout
  await loadSampleGraph()
  await runHierarchicLayoutWithTabularGroups()

  // bind actions to the buttons in the toolbar
  initializeUI()
}

/**
 * Runs a {@link HierarchicLayout} configured with tabular groups on the graph.
 */
async function runHierarchicLayoutWithTabularGroups() {
  // create the configured hierarchic layout with the tabular groups feature
  const { layout, layoutData } = createTabularGroupsHierarchicLayout(
    graphComponent.graph,
    sortingToggle.checked,
    parseInt(distanceSlider.value)
  )

  // ... and apply it to the graph
  await graphComponent.morphLayout(layout, '0.5s', layoutData)
}

/**
 * Loads the sample currently selected in the combo box and populates the graph.
 * @yjs:keep = nodeList,edgeList
 */
async function loadSampleGraph(): Promise<void> {
  const graph = graphComponent.graph
  graph.clear()

  // get the currently selected sample data
  const sampleName = sampleComboBox.value

  // for the nested sample, add some more distance to the children nodes
  if (sampleName === 'uml') {
    distanceSlider.value = '5'
    distanceLabel.textContent = '5'
  }

  const data = await loadSampleData(`resources/${sampleName}.json`)
  const isSimple = sampleComboBox.value === 'simple'

  // initialize the style of the graph
  initializeGraph()

  // use the graph builder to create the graph items from the sample data
  const builder = new GraphBuilder(graph)

  // define source and creation options for nodes and group nodes
  const nodesSource = builder.createNodesSource({
    data: data.nodeList.filter((node: any) => !node.isGroup),
    id: 'id',
    layout: 'layout',
    parentId: 'parent'
  })
  const groupSource = builder.createGroupNodesSource({
    data: data.nodeList.filter((node: any) => node.isGroup),
    id: 'id',
    layout: 'layout',
    parentId: 'parent'
  })

  // create labels for the normal nodes
  const nodeCreator = nodesSource.nodeCreator
  const nodeLabelCreator = nodeCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  nodeLabelCreator.textProvider = (data: any) => data.text
  nodeLabelCreator.layoutParameterProvider = () =>
    isSimple ? InteriorLabelModel.CENTER : InteriorLabelModel.WEST

  const groupCreator = groupSource.nodeCreator
  groupCreator.styleProvider = (data: any) => {
    return data.parent === undefined
      ? graph.groupNodeDefaults.style
      : new GroupNodeStyle({
          tabFill: colorSets['demo-palette-56'].stroke,
          tabBackgroundFill: '#9EA02C',
          contentAreaFill: 'white',
          tabSlope: 0.5,
          drawShadow: false,
          contentAreaInsets: 8,
          tabPosition: 'top-leading',
          stroke: `1px ${colorSets['demo-palette-56']}`,
          tabHeight: 20,
          tabWidth: 80,
          tabInset: 2
        })
  }

  // create labels for the group nodes
  const groupLabelCreator = groupSource.nodeCreator.createLabelsSource(
    (data: any) => data.labels || []
  ).labelCreator
  groupLabelCreator.textProvider = (data: any) => data.text
  groupLabelCreator.layoutParameterProvider = () => InteriorStretchLabelModel.NORTH

  // define source for creation of edges
  builder.createEdgesSource({
    data: data.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends'
  })

  // build the graph
  builder.buildGraph()
}

/**
 * Loads sample data from the file identified by the given sample path.
 * @param samplePath the path to the sample data file.
 */
async function loadSampleData(samplePath: string): Promise<any> {
  const response = await fetch(samplePath)
  return await response.json()
}

/**
 * Initializes the style defaults for the graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  // initialize the basic style of the graph items
  initDemoStyles(graph, { theme: 'demo-palette-56' })

  graph.nodeDefaults.style = new RectangleNodeStyle({
    fill: '#D0D1B3',
    stroke: '1.5px  #717345',
    cornerStyle: 'round',
    cornerSize: 3.5
  })

  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: '#E7E8D9',
    shape: 'round-rectangle',
    insets: [2, 4, 2, 4]
  })

  // customize the group node style and its label for this demo to get nice tabular groups
  const groupTheme = 'demo-palette-56'
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: colorSets[groupTheme].stroke,
    tabBackgroundFill: colorSets[groupTheme].fill,
    contentAreaFill: 'white',
    tabSlope: 0.5,
    drawShadow: true,
    contentAreaInsets: 8,
    tabPosition: 'top-leading',
    stroke: `1px ${colorSets[groupTheme]}`,
    tabHeight: 20,
    tabWidth: 80,
    tabInset: 2
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'left',
    clipText: false,
    wrapping: 'character-ellipsis',
    textFill: 'white',
    insets: 4
  })

  // customize the node label background color based on the selected sample
  const isSimple = sampleComboBox.value === 'simple'
  const nodeLabelStyle = graph.nodeDefaults.labels.style as DefaultLabelStyle
  nodeLabelStyle.backgroundFill = isSimple ? nodeLabelStyle.backgroundFill : null
}

/**
 * Binds actions to the buttons in the toolbar.
 */
function initializeUI(): void {
  document
    .querySelector<HTMLInputElement>('#tabular-groups-toggle')!
    .addEventListener('click', async () => {
      if (tabularGroupsToggle.checked) {
        // run the hierarchic layout with the tabular groups feature
        sortingToggle.disabled = false
        distanceSlider.disabled = false
        await runHierarchicLayoutWithTabularGroups()
      } else {
        // run hierarchic layout without tabular groups
        await graphComponent.morphLayout(
          createDefaultHierarchicLayout(graphComponent.graph),
          '0.5s'
        )
        sortingToggle.disabled = true
        distanceSlider.disabled = true
      }
    })

  document
    .querySelector<HTMLInputElement>('#sorting-toggle')!
    .addEventListener('click', runHierarchicLayoutWithTabularGroups)

  addNavigationButtons(
    document.querySelector<HTMLSelectElement>('#sample-combo-box')!
  ).addEventListener('change', async () => {
    // reset and disable the toolbar ui elements
    sortingToggle.disabled = true
    tabularGroupsToggle.disabled = true
    distanceSlider.disabled = true
    sortingToggle.checked = false
    tabularGroupsToggle.checked = true
    distanceSlider.value = '0'
    distanceLabel.textContent = '0'

    // load new sample and arrange with tabular groups feature
    await loadSampleGraph()
    await runHierarchicLayoutWithTabularGroups()

    // enable toolbar ui elements
    sortingToggle.disabled = false
    tabularGroupsToggle.disabled = false
    distanceSlider.disabled = false
  })

  document
    .querySelector<HTMLInputElement>('#child-distance-slider')!
    .addEventListener('change', async (evt) => {
      distanceLabel.textContent = (evt.target as HTMLInputElement).value
      await runHierarchicLayoutWithTabularGroups()
    })
}

run().then(finishLoading)
