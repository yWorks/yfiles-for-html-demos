/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  Arrow,
  DefaultLabelStyle,
  EdgesSource,
  Font,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  ICommand,
  IModelItem,
  LayoutExecutor,
  License,
  MouseHoverInputMode,
  NodesSource,
  Point,
  PolylineEdgeStyle,
  QueryItemToolTipEventArgs,
  Size,
  TimeSpan
} from 'yfiles'
import 'yfiles/yfiles.css'
import './ReactGraphComponent.css'
import ItemElement from './ItemElement'
import DemoToolbar from './DemoToolbar'
import yFilesLicense from '../license.json'
import { EdgeData, GraphData, NodeData } from '../App'
import { ReactComponentNodeStyle } from './ReactComponentNodeStyle'
import NodeTemplate from './NodeTemplate'

interface ReactGraphComponentProps {
  graphData: GraphData
  onResetData(): void
}

export default class ReactGraphComponent extends Component<ReactGraphComponentProps> {
  private readonly div: React.RefObject<HTMLDivElement>
  private updating: boolean
  private isDirty: boolean
  private scheduledUpdate: null | number
  private readonly graphComponent: GraphComponent
  private graphBuilder?: GraphBuilder

  static defaultProps = {
    graphData: {
      nodesSource: [],
      edgesSource: []
    }
  }

  private nodesSource: NodesSource<NodeData> | null
  private edgesSource: EdgesSource<EdgeData> | null

  constructor(props: ReactGraphComponentProps) {
    super(props)
    this.div = React.createRef<HTMLDivElement>()

    // Newly created elements are animated during which the graph data should not be modified
    this.updating = false
    this.isDirty = false
    this.scheduledUpdate = null
    this.nodesSource = null
    this.edgesSource = null

    // include the yFiles License
    License.value = yFilesLicense

    // Initialize the GraphComponent
    this.graphComponent = new GraphComponent()
    this.graphComponent.inputMode = new GraphViewerInputMode()
    this.initializeTooltips(this.graphComponent.inputMode as GraphViewerInputMode)
    this.initializeDefaultStyles()
  }

  async componentDidMount(): Promise<void> {
    // Append the GraphComponent to the DOM
    this.div.current!.appendChild(this.graphComponent.div)

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
  initializeDefaultStyles(): void {
    this.graphComponent.graph.nodeDefaults.size = new Size(60, 40)
    this.graphComponent.graph.nodeDefaults.style = new ReactComponentNodeStyle<{ name?: string }>(
      NodeTemplate
    )
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
  initializeTooltips(inputMode: GraphViewerInputMode): void {
    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromSeconds(0.5)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener(
      (src: MouseHoverInputMode, args: QueryItemToolTipEventArgs<IModelItem>) => {
        if (args.handled) {
          // Tooltip content has already been assigned => nothing to do.
          return
        }

        // Re-use the React-Component to render the tooltip content
        const container = document.createElement('div')
        ReactDOM.render(<ItemElement item={args.item!.tag} />, container)
        args.toolTip = container

        // Indicate that the tooltip content has been set.
        args.handled = true
      }
    )
  }

  /**
   * Creates and configures the {@link GraphBuilder}.
   * @return {GraphBuilder}
   */
  createGraphBuilder(): GraphBuilder {
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
  componentDidUpdate(prevProps: ReactGraphComponentProps): void {
    if (
      this.props.graphData.nodesSource.length !== prevProps.graphData.nodesSource.length ||
      this.props.graphData.edgesSource.length !== prevProps.graphData.edgesSource.length
    ) {
      this.updateGraph().catch(e => alert(e))
    }
  }

  /**
   * Updates the graph based on the current graphData and applies a layout afterwards.
   * @return {Promise}
   */
  async updateGraph(): Promise<void> {
    this.isDirty = true
    if (this.updating) {
      return
    }
    while (this.isDirty) {
      this.updating = true
      // update the graph based on the given graph data
      this.graphBuilder!.setData(this.nodesSource!, this.props.graphData.nodesSource)
      this.graphBuilder!.setData(this.edgesSource!, this.props.graphData.edgesSource)
      this.graphBuilder!.updateGraph()
      this.isDirty = false

      // apply a layout to re-arrange the new elements
      const layoutExecutor = new LayoutExecutor(this.graphComponent, new HierarchicLayout())
      layoutExecutor.duration = TimeSpan.fromSeconds(1)
      layoutExecutor.easedAnimation = true
      layoutExecutor.animateViewport = true
      await layoutExecutor.start()
      this.updating = false
    }
  }

  render(): JSX.Element {
    return (
      <div>
        <div className="toolbar">
          <DemoToolbar
            resetData={this.props.onResetData}
            zoomIn={(): void => ICommand.INCREASE_ZOOM.execute(null, this.graphComponent)}
            zoomOut={(): void => ICommand.DECREASE_ZOOM.execute(null, this.graphComponent)}
            resetZoom={(): void => ICommand.ZOOM.execute(1.0, this.graphComponent)}
            fitContent={(): void => ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent)}
          />
        </div>
        <div className="graph-component-container" ref={this.div} />
      </div>
    )
  }
}
