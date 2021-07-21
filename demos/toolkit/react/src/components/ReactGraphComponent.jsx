/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {
  Arrow,
  DefaultLabelStyle,
  Font,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicLayout,
  ICommand,
  IEdge,
  INode,
  LayoutExecutorAsync,
  License,
  Point,
  PolylineEdgeStyle,
  Rect,
  Size,
  TimeSpan
} from 'yfiles'
import './ReactGraphComponent.css'
import DemoToolbar from './DemoToolbar.jsx'
import yFilesLicense from '../license.json'
import { ReactComponentNodeStyle } from './ReactComponentNodeStyle'
import NodeTemplate from './NodeTemplate'
import LayoutWorker from 'worker-loader!./LayoutWorker.js'
import { ContextMenu } from './ContextMenu'
import ReactGraphOverviewComponent from './GraphOverviewComponent'
import Tooltip from './Tooltip'
import GraphSearch from '../utils/GraphSearch'

const layoutWorker = new LayoutWorker()

export default class ReactGraphComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        items: []
      }
    }

    // Newly created elements are animated during which the graph data should not be modified
    this.updating = false
    this.isDirty = false
    this.scheduledUpdate = null
    this.nodesSource = null
    this.edgesSource = null
    this.$query = ''

    // include the yFiles License
    License.value = yFilesLicense

    // initialize the GraphComponent
    this.graphComponent = new GraphComponent()
    // register interaction
    this.graphComponent.inputMode = new GraphViewerInputMode()
    // register context menu on nodes and edges
    this.initializeContextMenu()
    // register tooltips
    this.initializeTooltips()
    // specify default styles for newly created nodes and edges
    this.initializeDefaultStyles()
  }

  async componentDidMount() {
    // Append the GraphComponent to the DOM
    this.div.appendChild(this.graphComponent.div)

    // Build the graph from the given data...
    this.updating = true
    this.graphBuilder = this.createGraphBuilder()
    this.graphComponent.graph = this.graphBuilder.buildGraph()
    // ... and make sure it is centered in the view (this is the initial state of the layout animation)
    this.graphComponent.fitGraphBounds()

    // Layout the graph with the hierarchic layout style
    await this.graphComponent.morphLayout(new HierarchicLayout(), '1s')
    this.updating = false

    this.initializeGraphSearch()
  }

  /**
   * Initializes the node search input.
   */
  initializeGraphSearch() {
    this.graphSearch = new NodeTagSearch(this.graphComponent)
    this.graphComponent.graph.addNodeCreatedListener(this.updateSearch.bind(this))
    this.graphComponent.graph.addNodeRemovedListener(this.updateSearch.bind(this))
    this.graphComponent.graph.addLabelAddedListener(this.updateSearch.bind(this))
    this.graphComponent.graph.addLabelRemovedListener(this.updateSearch.bind(this))
    this.graphComponent.graph.addLabelTextChangedListener(this.updateSearch.bind(this))
  }

  /**
   * Updates the search highlights.
   */
  updateSearch() {
    this.graphSearch.updateSearch(this.$query)
  }

  /**
   * Called when the search query has changed.
   */
  onSearchQueryChanged(query) {
    this.$query = query
    this.updateSearch()
  }

  /**
   * Sets default styles for the graph.
   */
  initializeDefaultStyles() {
    this.graphComponent.graph.nodeDefaults.size = new Size(60, 40)
    this.graphComponent.graph.nodeDefaults.style = new ReactComponentNodeStyle(NodeTemplate)
    this.graphComponent.graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      textFill: '#fff',
      font: new Font('Robot, sans-serif', 14)
    })
    this.graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
      smoothingLength: 25,
      stroke: '5px #242265',
      targetArrow: new Arrow({
        fill: '#242265',
        scale: 2,
        type: 'circle'
      })
    })
  }

  /**
   * Helper function to update the context menu state.
   */
  updateContextMenuState(key, value) {
    const contextMenuState = { ...this.state.contextMenu }
    contextMenuState[key] = value
    this.setState({ contextMenu: contextMenuState })
  }

  /**
   * Registers a context menu for nodes and edges on the input mode.
   */
  initializeContextMenu() {
    const inputMode = this.graphComponent.inputMode
    ContextMenu.addOpeningEventListeners(this.graphComponent, location => {
      const worldLocation = this.graphComponent.toWorldFromPage(location)
      const showMenu = inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)
      if (showMenu) {
        this.openMenu(location)
      }
    })

    inputMode.addPopulateItemContextMenuListener((sender, args) => {
      // select the item
      this.graphComponent.selection.clear()
      this.graphComponent.selection.setSelected(args.item, true)
      // populate the menu
      this.populateContextMenu(args)
    })
    inputMode.contextMenuInputMode.addCloseMenuListener(this.hideMenu.bind(this))
  }

  /**
   * Hides the context menu.
   */
  hideMenu() {
    this.updateContextMenuState('show', false)
  }

  /**
   * Shows the context menu at the given location
   * @param {Point} location
   */
  openMenu(location) {
    this.updateContextMenuState('x', location.x)
    this.updateContextMenuState('y', location.y)
    this.updateContextMenuState('show', true)
  }

  /**
   * Populates the context menu depending on the given context.
   * @param {PopulateItemContextMenuEventArgs} args
   */
  populateContextMenu(args) {
    const contextMenuItems = []
    const item = args.item
    if (item instanceof INode || item instanceof IEdge) {
      contextMenuItems.push({
        title: 'Zoom to item',
        action: () => {
          // center the item in the viewport
          const targetBounds =
            item instanceof INode
              ? item.layout.toRect()
              : Rect.add(item.sourceNode.layout.toRect(), item.targetNode.layout.toRect())
          ICommand.ZOOM.execute(
            targetBounds.getEnlarged(50 / this.graphComponent.zoom),
            this.graphComponent
          )
        }
      })
    }

    this.updateContextMenuState('items', contextMenuItems)
    if (contextMenuItems.length > 0) {
      args.showMenu = true
    }
  }

  /**
   * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
   * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
   * GraphEditorInputMode using the
   * {@link ToolTipQueryEventArgs} parameter.
   * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
   * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
   * whether the tooltip was already set by one of possibly several tooltip providers. The
   * QueryLocation property contains the mouse position for the query in world coordinates.
   * The tooltip is set by setting the ToolTip property.
   */
  initializeTooltips() {
    const inputMode = this.graphComponent.inputMode

    // show tooltips only for nodes and edges
    inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener((src, eventArgs) => {
      if (eventArgs.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      eventArgs.toolTip = this.createTooltipContent(eventArgs.item)

      // Indicate that the tooltip content has been set.
      eventArgs.handled = true
    })
  }

  /**
   * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
   * show the latter by using a dynamically compiled Vue component.
   * @param {IModelItem} item
   * @returns {HTMLElement}
   */
  createTooltipContent(item) {
    const title = item instanceof INode ? 'Node Data' : 'Edge Data'
    const content = JSON.stringify(item.tag)

    const props = {
      title,
      content
    }
    const tooltipContainer = document.createElement('div')
    const element = React.createElement(Tooltip, props)
    ReactDOM.render(element, tooltipContainer)

    return tooltipContainer
  }

  /**
   * Creates and configures the {@link GraphBuilder}.
   * @return {GraphBuilder}
   */
  createGraphBuilder() {
    const graphBuilder = new GraphBuilder(this.graphComponent.graph)
    this.nodesSource = graphBuilder.createNodesSource({
      // Stores the nodes of the graph
      data: this.props.graphData.nodesSource,
      // Identifies the id property of a node object
      id: 'id',
      // Use the 'name' property as node label
      tag: item => ({ name: item.name })
    })
    this.edgesSource = graphBuilder.createEdgesSource({
      // Stores the edges of the graph
      data: this.props.graphData.edgesSource,
      // Identifies the property of an edge object that contains the source node's id
      sourceId: 'fromNode',
      // Identifies the property of an edge object that contains the target node's id
      targetId: 'toNode'
    })
    return graphBuilder
  }

  /**
   * When the React lifecycle tells us that properties might have changed,
   * we compare the property states and set the corresponding properties
   * of the GraphComponent instance
   */
  async componentDidUpdate(prevProps) {
    if (
      this.props.graphData.nodesSource.length !== prevProps.graphData.nodesSource.length ||
      this.props.graphData.edgesSource.length !== prevProps.graphData.edgesSource.length
    ) {
      if (!this.updating) {
        this.updateGraph()
      } else {
        // the graph is currently still updating and running the layout animation, thus schedule an update
        if (this.scheduledUpdate !== null) {
          window.clearTimeout(this.scheduledUpdate)
        }
        this.scheduledUpdate = setTimeout(() => {
          this.updateGraph()
        }, 500)
      }
    }
  }

  /**
   * Updates the graph based on the current graphData and applies a layout afterwards.
   * @return {Promise}
   */
  async updateGraph() {
    this.isDirty = true
    if (this.updating) {
      return
    }
    while (this.isDirty) {
      this.updating = true
      // update the graph based on the given graph data
      this.graphBuilder.setData(this.nodesSource, this.props.graphData.nodesSource)
      this.graphBuilder.setData(this.edgesSource, this.props.graphData.edgesSource)
      this.graphBuilder.updateGraph()
      this.isDirty = false

      // apply a layout to re-arrange the new elements

      // create an asynchronous layout executor that calculates a layout on the worker
      const executor = new LayoutExecutorAsync({
        messageHandler: webWorkerMessageHandler,
        graphComponent: this.graphComponent,
        duration: '1s',
        animateViewport: true,
        easedAnimation: true
      })

      await executor.start()
      this.updating = false
    }

    // helper function that performs the actual message passing to the web worker
    function webWorkerMessageHandler(data) {
      return new Promise(resolve => {
        layoutWorker.onmessage = e => resolve(e.data)
        layoutWorker.postMessage(data)
      })
    }
  }

  render() {
    return (
      <div>
        <div className="toolbar">
          <DemoToolbar
            resetData={this.props.onResetData}
            zoomIn={() => ICommand.INCREASE_ZOOM.execute(null, this.graphComponent)}
            zoomOut={() => ICommand.DECREASE_ZOOM.execute(null, this.graphComponent)}
            resetZoom={() => ICommand.ZOOM.execute(1.0, this.graphComponent)}
            fitContent={() => ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent)}
            searchChange={evt => this.onSearchQueryChanged(evt.target.value)}
          />
        </div>
        <div
          className="graph-component-container"
          ref={node => {
            this.div = node
          }}
        />
        <ContextMenu
          x={this.state.contextMenu.x}
          y={this.state.contextMenu.y}
          show={this.state.contextMenu.show}
          items={this.state.contextMenu.items}
          hideMenu={() => this.hideMenu()}
        />
        <div style={{ position: 'absolute', left: '20px', top: '120px' }}>
          <ReactGraphOverviewComponent graphComponent={this.graphComponent} />
        </div>
      </div>
    )
  }
}

ReactGraphComponent.defaultProps = {
  graphData: {
    nodesSource: [],
    edgesSource: []
  }
}

ReactGraphComponent.propTypes = {
  graphData: PropTypes.object,
  onResetData: PropTypes.func
}

class NodeTagSearch extends GraphSearch {
  matches(node, text) {
    if (node.tag) {
      const data = node.tag
      return data.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
    }
    return false
  }
}
