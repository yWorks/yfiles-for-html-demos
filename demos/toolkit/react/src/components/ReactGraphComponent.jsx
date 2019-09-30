import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  Arrow,
  DefaultLabelStyle,
  Font,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  ICommand,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import 'yfiles/yfiles.css'
import './ReactGraphComponent.css'
import ItemElement from './ItemElement.jsx'
import DemoToolbar from './DemoToolbar.jsx'
import yFilesLicense from '../license.json'

export default class ReactGraphComponent extends Component {
  constructor(props) {
    super(props)
    // Newly created elements are animated during which the graph data should not be modified
    this.updating = false
    this.scheduledUpdate = null

    // include the yFiles License
    License.value = yFilesLicense

    // Initialize the GraphComponent
    this.graphComponent = new GraphComponent()
    this.graphComponent.inputMode = new GraphViewerInputMode()
    this.initializeTooltips(this.graphComponent.inputMode)
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
  }

  /**
   * Sets default styles for the graph.
   */
  initializeDefaultStyles() {
    this.graphComponent.graph.nodeDefaults.size = new Size(60, 40)
    this.graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle({
      fill: '#00d7ff',
      stroke: '#00d7ff',
      shape: 'round-rectangle'
    })
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
   * Set ups the tooltips for nodes and edges.
   * @param {GraphViewerInputMode} inputMode
   */
  initializeTooltips(inputMode) {
    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = [15, 15]
    mouseHoverInputMode.delay = '500ms'
    mouseHoverInputMode.duration = '5s'

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener((src, args) => {
      if (args.handled) {
        // Tooltip content has already been assigned => nothing to do.
        return
      }

      // Re-use the React-Component to render the tooltip content
      const container = document.createElement('div')
      ReactDOM.render(<ItemElement item={args.item.tag} />, container)
      args.toolTip = container

      // Indicate that the tooltip content has been set.
      args.handled = true
    })
  }

  /**
   * Creates and configures the {@link GraphBuilder}.
   * @return {GraphBuilder}
   */
  createGraphBuilder() {
    const graphBuilder = new GraphBuilder(this.graphComponent.graph)
    // Stores the nodes of the graph
    graphBuilder.nodesSource = this.props.graphData.nodesSource
    // Stores the edges of the graph
    graphBuilder.edgesSource = this.props.graphData.edgesSource
    // Identifies the property of an edge object that contains the source node's id
    graphBuilder.sourceNodeBinding = 'fromNode'
    // Identifies the property of an edge object that contains the target node's id
    graphBuilder.targetNodeBinding = 'toNode'
    // Identifies the id property of a node object
    graphBuilder.nodeIdBinding = 'id'
    // Use the 'name' property as node label
    graphBuilder.nodeLabelBinding = data => data.name
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
    this.updating = true
    // update the graph based on the given graph data
    this.graphBuilder.nodesSource = this.props.graphData.nodesSource
    this.graphBuilder.edgesSource = this.props.graphData.edgesSource
    this.graphBuilder.updateGraph()

    // apply a layout to re-arrange the new elements
    const layoutExecutor = new LayoutExecutor(this.graphComponent, new HierarchicLayout())
    layoutExecutor.duration = '1s'
    layoutExecutor.easedAnimation = true
    layoutExecutor.animateViewport = true
    await layoutExecutor.start()
    this.updating = false
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
          />
        </div>
        <div
          className="graph-component-container"
          ref={node => {
            this.div = node
          }}
        />
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
