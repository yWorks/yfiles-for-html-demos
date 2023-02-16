/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import type {
  CreateEdgeInputMode,
  EdgeEventArgs,
  GraphComponent,
  IEdge,
  IEdgeStyle,
  IGraph,
  IList,
  INode,
  INodeStyle,
  ItemEventArgs,
  WebGL2PolylineEdgeStyle,
  WebGL2ShapeNodeStyle
} from 'yfiles'
import {
  GraphEditorInputMode,
  GraphModelManager,
  IInputModeContext,
  List,
  Point,
  RenderModes,
  WebGL2GraphModelManager,
  WebGL2IconNodeStyle,
  WebGL2SelectionIndicatorManager
} from 'yfiles'

export type RenderingType = 'WebGL2' | 'SVG'
export type NodeStyleProvider = (node: INode, graph: IGraph) => INodeStyle
export type WebGL2NodeStyleProvider = (
  node: INode,
  graph: IGraph
) => WebGL2ShapeNodeStyle | WebGL2IconNodeStyle
export type EdgeStyleProvider = (edge: IEdge, graph: IGraph) => IEdgeStyle
export type WebGL2PolylineEdgeStyleProvider = (
  edge: IEdge,
  graph: IGraph
) => WebGL2PolylineEdgeStyle

export type NodeCreatorProvider = (
  context: IInputModeContext,
  graph: IGraph,
  location: Point,
  parent: INode | null
) => INode | null

export type RenderingTypeChangedListener = (newValue: RenderingType) => void

/**
 * The {@link RenderingTypesManager} takes care of switching between the two rendering types
 * WebGL2 and SVG.
 * The switching takes place, when a provided threshold is reached:
 * Zoom levels lower than the SVG threshold result in WebGL2 rendering, zoom levels
 * higher than the SVG threshold result in SVG rendering.
 *
 * It also provides listeners, that automatically set the styles for the SVG and
 * WebGL rendering types when new nodes or edges are created.
 */
export default class RenderingTypesManager {
  private readonly listeners: IList<RenderingTypeChangedListener>

  /**
   * Sets the node styles, if the style providers are available.
   */
  private readonly nodeCreatedListener: (
    inputMode: GraphEditorInputMode,
    evt: ItemEventArgs<INode>
  ) => void

  /**
   * Sets the edge styles, if the style providers are available.
   */
  private readonly edgeCreatedListener: (inputMode: CreateEdgeInputMode, evt: EdgeEventArgs) => void

  /**
   * Listener for zoom change events. Activates the appropriate
   * rendering method according to the svgThreshold configured,
   * and notifies the rendering changed listeners.
   */
  private readonly zoomChangedListener: () => void

  private svgThresholdValue: number

  /**
   * Instantiates the {@link RenderingTypesManager}
   * @param graphComponent the GraphComponent
   * @param svgThreshold the zoom threshold value at which switching between WebGL2 and SVG takes
   *   place
   * @param nodeStyleProvider the style provider for rendering nodes in SVG mode
   * @param webGL2NodeStyleProvider the style provider for rendering nodes in WebGL2 mode
   * @param edgeStyleProvider the style provider for rendering edges in SVG mode
   * @param webGL2EdgeStyleProvider the style provider for rendering edges in SVG mode
   * @param nodeCreator a NodeCreator. Useful if after node generation some more processing (like
   *   adding a tag) is necessary
   */
  constructor(
    public readonly graphComponent: GraphComponent,
    svgThreshold = 0.3,
    public nodeStyleProvider: NodeStyleProvider | null = null,
    public webGL2NodeStyleProvider: WebGL2NodeStyleProvider | null = null,
    public edgeStyleProvider: EdgeStyleProvider | null = null,
    public webGL2EdgeStyleProvider: WebGL2PolylineEdgeStyleProvider | null = null,
    public nodeCreator: NodeCreatorProvider | null = null
  ) {
    this.listeners = new List()

    this.svgThresholdValue = svgThreshold

    graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
    graphComponent.focusIndicatorManager.enabled = false

    this.nodeCreatedListener = (inputMode: GraphEditorInputMode, evt: ItemEventArgs<INode>) => {
      const node = evt.item

      if (this.nodeStyleProvider !== null) {
        this.graphComponent.graph.setStyle(
          node,
          this.nodeStyleProvider(node, this.graphComponent.graph)
        )
      }

      if (this.currentRenderingType != 'WebGL2' || this.webGL2NodeStyleProvider == null) {
        return
      }

      this.setWebGL2NodeStyle(
        node,
        inputMode.graph!,
        this.graphComponent.graphModelManager as WebGL2GraphModelManager
      )
    }

    this.edgeCreatedListener = (inputMode: CreateEdgeInputMode, evt: EdgeEventArgs) => {
      const edge = evt.item

      if (this.edgeStyleProvider) {
        this.graphComponent.graph.setStyle(
          edge,
          this.edgeStyleProvider(edge, this.graphComponent.graph)
        )
      }

      if (this.currentRenderingType != 'WebGL2' || this.webGL2EdgeStyleProvider == null) {
        return
      }
      this.setWebGL2PolylineEdgeStyle(
        edge,
        inputMode.graph,
        this.graphComponent.graphModelManager as WebGL2GraphModelManager
      )
    }

    this.zoomChangedListener = () => {
      const isWebGLRendering = this.currentRenderingType === 'WebGL2'
      const zoom = this.graphComponent.zoom
      // Make sure to switch only if the threshold is passed
      if (zoom >= this.svgThreshold && isWebGLRendering) {
        this.activateRenderingType('SVG')
        this.fireRenderingTypeChangedEvent()
      } else if (zoom < this.svgThreshold && !isWebGLRendering) {
        this.activateRenderingType('WebGL2')
        this.fireRenderingTypeChangedEvent()
      }
    }

    this.zoomChangedListener()
  }

  get currentRenderingType(): RenderingType {
    return this.graphComponent.graphModelManager instanceof WebGL2GraphModelManager
      ? 'WebGL2'
      : 'SVG'
  }

  /**
   * Sets a new value for the SVG threshold.
   * @param value The new SVG threshold.
   */
  set svgThreshold(value: number) {
    this.svgThresholdValue = value
    this.zoomChangedListener()
  }

  /**
   * Gets the value of the SVG threshold.
   * @returns The value of the SVG threshold.
   */
  get svgThreshold() {
    return this.svgThresholdValue
  }

  /**
   * Adds an event listener for zoom changes that switches back and forth between the rendering
   * types when the SVG threshold is passed.
   *
   * @see {@link svgThreshold}
   */
  registerZoomChangedListener(): void {
    this.graphComponent.addZoomChangedListener(this.zoomChangedListener)
    this.zoomChangedListener()
  }

  private unregisterZoomChangedListener(): void {
    this.graphComponent.removeZoomChangedListener(this.zoomChangedListener)
  }

  /**
   * Registers the item created listeners. Can _usually_ be called _after_ a large graph has been
   * loaded to avoid redundant calls to the configured node and edge creation listeners.
   */
  registerItemCreatedListeners(): void {
    const inputMode = this.graphComponent.inputMode
    if (!(inputMode instanceof GraphEditorInputMode)) {
      return
    }

    inputMode.handleInputMode.renderMode = RenderModes.WEB_GL
    inputMode.addNodeCreatedListener(this.nodeCreatedListener)
    inputMode.createEdgeInputMode.addEdgeCreatedListener(this.edgeCreatedListener)

    if (this.nodeCreator) {
      inputMode.nodeCreator = this.nodeCreator
    }
  }

  private unregisterItemCreatedListeners(): void {
    const inputMode = this.graphComponent.inputMode
    if (!(inputMode instanceof GraphEditorInputMode)) {
      return
    }

    inputMode.removeNodeCreatedListener(this.nodeCreatedListener)
    inputMode.createEdgeInputMode.removeEdgeCreatedListener(this.edgeCreatedListener)

    if (this.nodeCreator) {
      inputMode.nodeCreator = null
    }
  }

  /**
   * Must be called before instantiating a new {@link RenderingTypesManager},
   * so that the various listeners are unregistered from the {@link GraphComponent}
   */
  public dispose() {
    this.unregisterItemCreatedListeners()
    this.unregisterZoomChangedListener()
    this.listeners.clear()
  }

  /**
   * Activates the given rendering type for the graph component of this instance
   * by instantiating and switching to appropriate {@link GraphModelManager}
   * @param type The rendering type.
   */
  activateRenderingType(type: RenderingType): void {
    const graphComponent = this.graphComponent
    if (type === 'WebGL2') {
      graphComponent.graphModelManager = new WebGL2GraphModelManager()
      this.setWebGLStyles()
    } else {
      graphComponent.graphModelManager = new GraphModelManager(
        graphComponent,
        graphComponent.contentGroup
      )
    }
  }

  /**
   * Sets the node and edge styles for WebGL2 rendering.
   *
   * This should be called after switching to WebGL2 rendering:
   * As the switch is done by instantiating a new {@link WebGL2GraphModelManager},
   * the styles must be set after every switch.
   */
  setWebGLStyles(): void {
    if (this.currentRenderingType !== 'WebGL2') {
      return
    }
    const graph = this.graphComponent.graph
    const graphModelManager = this.graphComponent.graphModelManager as WebGL2GraphModelManager
    if (this.webGL2NodeStyleProvider != null) {
      for (const node of graph.nodes) {
        this.setWebGL2NodeStyle(node, graph, graphModelManager)
      }
    }
  }

  private setWebGL2NodeStyle(
    node: INode,
    graph: IGraph,
    graphModelManager: WebGL2GraphModelManager
  ) {
    const style = this.webGL2NodeStyleProvider!(node, graph)
    if (style != null) {
      graphModelManager.setStyle(node, style)
    }
  }

  private setWebGL2PolylineEdgeStyle(
    edge: IEdge,
    graph: IGraph,
    graphModelManager: WebGL2GraphModelManager
  ) {
    const style = this.webGL2EdgeStyleProvider!(edge, graph)
    if (style != null) {
      graphModelManager.setStyle(edge, style)
    }
  }

  /**
   * Registers a {@link RenderingTypeChangedListener}.
   * @param listener the listener
   */
  addRenderingTypeChangedListener(listener: RenderingTypeChangedListener): void {
    this.listeners.push(listener)
  }

  /**
   * Unregisters a {@link RenderingTypeChangedListener}.
   * @param listener the listener
   */
  removeRenderingTypeChangedListener(listener: RenderingTypeChangedListener): void {
    this.listeners.remove(listener)
  }

  private fireRenderingTypeChangedEvent(): void {
    for (const listener of this.listeners) {
      listener(this.currentRenderingType)
    }
  }
}
