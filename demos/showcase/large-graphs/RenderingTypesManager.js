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
  GraphEditorInputMode,
  GraphModelManager,
  IInputModeContext,
  InputModeItemEventArgs,
  List,
  Point,
  SelectionIndicatorManager,
  WebGLGraphModelManager,
  WebGLGraphModelManagerRenderMode,
  WebGLSelectionIndicatorManager
} from '@yfiles/yfiles'
/**
 * The {@link RenderingTypesManager} takes care of switching between the two rendering types
 * WebGL and SVG.
 *
 * The switching takes place when a provided threshold is reached:
 * Zoom levels lower than the SVG threshold result in WebGL rendering,
 * zoom levels higher than the SVG threshold result in SVG rendering.
 *
 * It also registers listeners that automatically set the styles for
 * newly created nodes and edges using the style providers passed as
 * constructor arguments.
 */
export default class RenderingTypesManager {
  graphComponent
  nodeStyleProvider
  edgeStyleProvider
  nodeCreator
  listeners
  /**
   * Sets the style for newly created nodes using the tyle provider.
   */
  nodeCreatedListener
  /**
   * Sets the style for newly created edges using the tyle provider.
   */
  edgeCreatedListener
  /**
   * Listener for zoom change events. Activates the appropriate
   * rendering method according to the svgThreshold configured,
   * and notifies the rendering changed listeners.
   */
  zoomChangedListener
  svgThresholdValue
  /**
   * Instantiates the {@link RenderingTypesManager}
   * @param graphComponent the GraphComponent
   * @param svgThreshold the zoom threshold value at which switching between WebGL and SVG takes
   *   place
   * @param nodeStyleProvider the style provider newly created nodes.
   * @param edgeStyleProvider the style provider newly created edges.
   * @param nodeCreator a NodeCreator. Useful if after node generation, some more processing (like
   *   adding a tag) is necessary
   */
  constructor(
    graphComponent,
    svgThreshold = 0.3,
    nodeStyleProvider,
    edgeStyleProvider,
    nodeCreator = null
  ) {
    this.graphComponent = graphComponent
    this.nodeStyleProvider = nodeStyleProvider
    this.edgeStyleProvider = edgeStyleProvider
    this.nodeCreator = nodeCreator
    this.listeners = new List()
    this.svgThresholdValue = svgThreshold
    graphComponent.graphModelManager = new WebGLGraphModelManager({ renderMode: 'webgl' })
    graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
    graphComponent.focusIndicatorManager.enabled = false
    this.nodeCreatedListener = (evt) => {
      const node = evt.item
      const graph = this.graphComponent.graph
      graph.setStyle(node, this.nodeStyleProvider(node, graph))
    }
    this.edgeCreatedListener = (evt) => {
      const edge = evt.item
      const graph = this.graphComponent.graph
      graph.setStyle(edge, this.edgeStyleProvider(edge, graph))
    }
    this.zoomChangedListener = () => {
      const isWebGLRendering = this.currentRenderingType === 'WebGL'
      const zoom = this.graphComponent.zoom
      if (zoom >= this.svgThreshold && isWebGLRendering) {
        this.activateRenderingType('SVG')
        this.fireRenderingTypeChangedEvent()
      } else if (zoom < this.svgThreshold && !isWebGLRendering) {
        this.activateRenderingType('WebGL')
        this.fireRenderingTypeChangedEvent()
      }
    }
    this.zoomChangedListener()
  }
  get currentRenderingType() {
    const graphModelManager = this.graphComponent.graphModelManager
    return graphModelManager.renderMode == WebGLGraphModelManagerRenderMode.WEBGL ? 'WebGL' : 'SVG'
  }
  /**
   * Sets a new value for the SVG threshold.
   * @param value The new SVG threshold.
   */
  set svgThreshold(value) {
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
   * Adds an event listener for zoom changes that switches back and forth between
   * the rendering types when the SVG threshold is passed.
   *
   * @see {@link svgThreshold}
   */
  registerZoomChangedListener() {
    this.graphComponent.addEventListener('zoom-changed', this.zoomChangedListener)
    this.zoomChangedListener()
  }
  unregisterZoomChangedListener() {
    this.graphComponent.removeEventListener('zoom-changed', this.zoomChangedListener)
  }
  /**
   * Registers the item created listeners. Can _usually_ be called _after_ a large graph has been
   * loaded to avoid redundant calls to the configured node and edge creation listeners.
   */
  registerItemCreatedListeners() {
    const inputMode = this.graphComponent.inputMode
    if (!(inputMode instanceof GraphEditorInputMode)) {
      return
    }
    inputMode.addEventListener('node-created', this.nodeCreatedListener)
    inputMode.createEdgeInputMode.addEventListener('edge-created', this.edgeCreatedListener)
    if (this.nodeCreator) {
      inputMode.nodeCreator = this.nodeCreator
    }
  }
  unregisterItemCreatedListeners() {
    const inputMode = this.graphComponent.inputMode
    if (!(inputMode instanceof GraphEditorInputMode)) {
      return
    }
    inputMode.removeEventListener('node-created', this.nodeCreatedListener)
    inputMode.createEdgeInputMode.removeEventListener('edge-created', this.edgeCreatedListener)
    if (this.nodeCreator) {
      inputMode.nodeCreator = null
    }
  }
  /**
   * Must be called before instantiating a new {@link RenderingTypesManager},
   * so that the various listeners are unregistered from the {@link GraphComponent}
   */
  dispose() {
    this.unregisterItemCreatedListeners()
    this.unregisterZoomChangedListener()
    this.listeners.clear()
  }
  /**
   * Activates the given rendering type for the graph component of this instance
   * by instantiating and switching to appropriate {@link GraphModelManager}
   * @param type The rendering type.
   */
  activateRenderingType(type) {
    const gmm = this.graphComponent.graphModelManager
    if (type === 'WebGL') {
      this.graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
      gmm.renderMode = 'webgl'
    } else {
      this.graphComponent.selectionIndicatorManager = new SelectionIndicatorManager()
      gmm.renderMode = 'svg'
    }
  }
  /**
   * Registers a {@link RenderingTypeChangedListener}.
   * @param listener the listener
   */
  setRenderingTypeChangedListener(listener) {
    this.listeners.push(listener)
  }
  /**
   * Unregisters a {@link RenderingTypeChangedListener}.
   * @param listener the listener
   */
  removeRenderingTypeChangedListener(listener) {
    this.listeners.remove(listener)
  }
  fireRenderingTypeChangedEvent() {
    for (const listener of this.listeners) {
      listener(this.currentRenderingType)
    }
  }
}
