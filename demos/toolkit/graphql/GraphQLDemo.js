/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  Class,
  DefaultLabelStyle,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  ICommand,
  IModelItem,
  INode,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  LayoutExecutor,
  License,
  OrganicLayout,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  PolylineEdgeStyle,
  Size
} from 'yfiles'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { graphQLQuery } from './GraphQLQuery.js'
import { SocialNetworkGraphBuilder } from './SocialNetworkGraphBuilder.js'
import { SocialNetworkNodeStyle } from './SocialNetworkNodeStyle.js'
import PropertiesPanel from './PropertiesPanel.js'

Class.ensure(LayoutExecutor)

/** @type {GraphComponent} */
let graphComponent = null

/** @type {SocialNetworkGraphBuilder} */
let graphBuilder = null

/** @type {PropertiesPanel} */
let propertiesPanel = null

/**
 * Runs the demo.
 */
async function run(licenseData) {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')

  initializeGraph()

  graphBuilder = new SocialNetworkGraphBuilder(graphComponent.graph)

  createInputMode()
  createPropertiesPanel()
  registerCommands()

  showApp(graphComponent)

  await loadSinglePerson('1')
  const initialNode = graphComponent.graph.nodes.firstOrDefault()
  if (initialNode) {
    await loadFriends(initialNode)
  }
}

/**
 * Initializes the styles for the graph nodes, edges, labels.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  // nodes
  graph.nodeDefaults.style = new SocialNetworkNodeStyle()
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = new Size(75, 75)

  // labels
  const labelModel = new InteriorStretchLabelModel({ insets: [0, 0, 5, 0] })
  graph.nodeDefaults.labels.layoutParameter = labelModel.createParameter(
    InteriorStretchLabelModelPosition.SOUTH
  )
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'center',
    backgroundFill: 'rgba(255,255,255,0.66)'
  })

  // edges
  const circleArrow = new Arrow({
    scale: 2,
    type: 'circle',
    fill: 'lightgray'
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px lightgray',
    targetArrow: circleArrow,
    sourceArrow: circleArrow
  })
}

/**
 * Initialize and configure the input mode. Only allow viewing of the data and moving nodes around.
 */
function createInputMode() {
  const mode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE
  })
  mode.marqueeSelectionInputMode.enabled = false

  mode.addItemDoubleClickedListener(async (sender, evt) => {
    await loadFriends(evt.item)
    // update the properties panel, since new friends may be visible now
    propertiesPanel.showProperties(graphComponent.currentItem)
  })

  graphComponent.inputMode = mode
}

/**
 * Create the properties panel that displays the information about the current person.
 */
function createPropertiesPanel() {
  const propertiesPanelRoot = document.getElementById('propertiesView')
  propertiesPanel = new PropertiesPanel(propertiesPanelRoot)

  graphComponent.addCurrentItemChangedListener(() => {
    propertiesPanel.showProperties(graphComponent.currentItem)
  })
}

/**
 * Moves incremental nodes between their neighbors before expanding for a smooth animation.
 *
 * @param {List.<INode>} newNodes
 */
function prepareSmoothExpandLayoutAnimation(newNodes) {
  const graph = graphComponent.graph

  // mark the new nodes and place them between their neighbors
  const layoutData = new PlaceNodesAtBarycenterStageData({
    affectedNodes: newNodes
  })

  const layout = new PlaceNodesAtBarycenterStage()
  graph.applyLayout(layout, layoutData)
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindAction("button[data-command='Reset']", () => loadSinglePerson('1'))
  bindAction("button[data-command='LoadAll']", () => loadAll())
}

/**
 * Runs an organic layout.
 */
async function runLayout(newNodes) {
  if (newNodes) {
    prepareSmoothExpandLayoutAnimation(newNodes)
  }
  const layout = new OrganicLayout()
  layout.minimumNodeDistance = 100
  await graphComponent.morphLayout(layout, '1s')
}

/**
 * Clears the graph and fetches a single person.
 */
async function loadSinglePerson(id) {
  const data = await tryQuery(
    `
query loadSinglePerson ($id: ID!) {
  person(id: $id) {
    id
    name
    icon
    friendsCount
  }
}
`,
    { id }
  )

  if (!data) {
    return
  }

  graphBuilder.clear()
  const person = Object.assign({ friends: [] }, data.person)
  graphBuilder.addPersons([person])
  await runLayout()
  return person
}

/**
 * Loads all friends of the person.
 * @param {IModelItem} item The node for which the friends should be loaded
 * @return {Promise<void>} The layout animation promise
 */
async function loadFriends(item) {
  if (!INode.isInstance(item)) {
    return
  }

  const person = item.tag
  if (person.friendsCount === person.friends.length) {
    return
  }

  const data = await tryQuery(
    `
query loadFriends ($id: ID!) {
  person(id: $id) {
    friends {
      id
      name
      icon
      friendsCount
    }
  }
}
`,
    { id: person.id }
  )

  if (!data) {
    return Promise.resolve()
  }

  const friends = data.person.friends.map(friend => Object.assign({ friends: [person] }, friend))
  const dataCopy = Object.assign({}, person)
  const newNodes = graphBuilder.addPersons([Object.assign(dataCopy, { friends })].concat(friends))

  return runLayout(newNodes)
}

/**
 * Loads the complete social network.
 */
async function loadAll() {
  const data = await tryQuery(`
{
  persons {
    id
    name
    icon
    friendsCount
    friends {
      id
    }
  }
}
    `)

  if (!data) {
    return
  }

  graphBuilder.clear()
  graphBuilder.addPersons(data.persons)
  await runLayout()
}

/**
 * Executes a query and shows an error dialog if the server is not reachable.
 */
async function tryQuery(query, variables = {}) {
  try {
    const response = await graphQLQuery(query, variables)
    return response.data
  } catch (e) {
    document.getElementById('fetchError').style.setProperty('display', 'unset')
    return null
  }
}

loadJson().then(run)
