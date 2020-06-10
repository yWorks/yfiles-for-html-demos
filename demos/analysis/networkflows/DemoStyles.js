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
import {
  BaseClass,
  Color,
  EdgeStyleBase,
  GeneralPath,
  GradientSpreadMethod,
  GradientStop,
  IEdge,
  IInputModeContext,
  INode,
  IRectangle,
  IRenderContext,
  IVisualCreator,
  LinearGradient,
  Matrix,
  NodeStyleBase,
  Point,
  Rect,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * A NetworkFlowNodeStyle represents the flow that is regulated at the according node.
 * By setting a tag, the flow can be adjusted for this node.
 */
export class NetworkFlowNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance of NetworkFlowNodeStyle.
   * @param {Color?} color1
   * @param {Color?} color2
   */
  constructor(color1, color2) {
    super()
    this.flowColor1 = color1 || Color.DARK_BLUE
    this.flowColor2 = color2 || Color.CORNFLOWER_BLUE
  }

  /**
   * Creates a new visual.
   * @param {IRenderContext} context The render context
   * @param {INode} node The node to which this style instance is assigned.
   * @return {SvgVisual} The new visual
   */
  createVisual(context, node) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // Get the necessary data for rendering of the node
    const cache = NetworkFlowNodeStyle.createRenderDataCache(context, node)

    // Render the node
    this.render(context, node, g, cache)

    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Updates the given visual if necessary.
   * @param {IRenderContext} context The render context
   * @param {SvgVisual} oldVisual The old visual
   * @param {INode} node The node to which this style instance is assigned
   * @returns {SvgVisual} The updated visual
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement

    const oldCache = container['data-renderDataCache']
    const newCache = NetworkFlowNodeStyle.createRenderDataCache(context, node)

    // check if something changed except for the location of the node
    if (!newCache.equals(newCache, oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }
      this.render(context, node, container, newCache)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Renders the node.
   * @param {IRenderContext} context The render context
   * @param {INode} node The node to which this style instance is assigned
   * @param {Element} container The svg container
   * @param {Object} cache The render data cache
   */
  render(context, node, container, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    const graph = context.canvasComponent.graph
    const layout = node.layout
    const source = graph.inDegree(node) === 0 && graph.outDegree(node) !== 0
    const sink = graph.outDegree(node) === 0 && graph.inDegree(node) !== 0
    const adjustable = node.tag.adjustable
    const supply = node.tag.supply
    const flow = node.tag.flow

    const svgNS = 'http://www.w3.org/2000/svg'

    const pipeGroup = window.document.createElementNS(svgNS, 'g')
    const pipe = window.document.createElementNS(svgNS, 'path')
    pipe.setAttribute('d', NetworkFlowNodeStyle.createPipePath(context, node))
    pipe.setAttribute('fill', 'lightgrey')
    pipeGroup.appendChild(pipe)

    if (!source) {
      const leftPipeBorder = window.document.createElementNS(svgNS, 'rect')
      leftPipeBorder.setAttribute('x', '0')
      leftPipeBorder.setAttribute('y', '0')
      leftPipeBorder.setAttribute('width', '3')
      leftPipeBorder.setAttribute('height', layout.height)
      leftPipeBorder.setAttribute('fill', 'rgb(200,200,200)')
      pipeGroup.appendChild(leftPipeBorder)
    }
    if (!sink) {
      const rightPipeBorder = window.document.createElementNS(svgNS, 'rect')
      rightPipeBorder.setAttribute('x', layout.width - 3)
      rightPipeBorder.setAttribute('y', '0')
      rightPipeBorder.setAttribute('width', '3')
      rightPipeBorder.setAttribute('height', layout.height)
      rightPipeBorder.setAttribute('fill', 'rgb(200,200,200)')
      pipeGroup.appendChild(rightPipeBorder)
    }

    container.appendChild(pipeGroup)

    const flowGroup = window.document.createElementNS(svgNS, 'g')
    // create the gradient
    if (window.document.getElementById('flow-gradient') === null) {
      const defs = context.canvasComponent.svgDefsManager.defs
      const gradient = window.document.createElementNS(svgNS, 'linearGradient')
      gradient.setAttribute('id', 'flow-gradient')
      gradient.setAttribute('x1', '0')
      gradient.setAttribute('y1', '0')
      gradient.setAttribute('x2', '0')
      gradient.setAttribute('y2', '1')
      const stop1 = window.document.createElementNS(svgNS, 'stop')
      stop1.setAttribute(
        'stop-color',
        `rgba(${this.flowColor1.r},${this.flowColor1.g},${this.flowColor1.b},${this.flowColor1.a})`
      )
      stop1.setAttribute('offset', '0')
      gradient.appendChild(stop1)
      const stop2 = window.document.createElementNS(svgNS, 'stop')
      stop2.setAttribute(
        'stop-color',
        `rgba(${this.flowColor2.r},${this.flowColor2.g},${this.flowColor2.b},${this.flowColor2.a})`
      )
      stop2.setAttribute('offset', '1')
      gradient.appendChild(stop2)

      // puts the gradient in the container's defs section
      defs.appendChild(gradient)
    }

    // add background rectangle
    const rect = window.document.createElementNS(svgNS, 'rect')
    rect.setAttribute('x', '15')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', layout.width - 30)
    rect.setAttribute('height', layout.height)
    rect.setAttribute('style', 'fill:lightgrey')
    flowGroup.appendChild(rect)

    // add rectangle to visualize the incoming flow
    const flowRect = window.document.createElementNS(svgNS, 'rect')
    flowRect.setAttribute('x', '15')
    flowRect.setAttribute(
      'y',
      layout.height - flow - (adjustable ? Math.max(0, layout.height * supply) : 0)
    )
    flowRect.setAttribute('width', layout.width - 30)
    flowRect.setAttribute('height', flow)
    flowRect.setAttribute('fill', 'url(#flow-gradient)')
    flowGroup.appendChild(flowRect)

    // add rectangle to visualize supply/demand flow
    const demandSupplyRect = window.document.createElementNS(svgNS, 'rect')
    demandSupplyRect.setAttribute('x', '15')
    demandSupplyRect.setAttribute('width', layout.width - 30)
    if (supply > 0) {
      demandSupplyRect.setAttribute('y', layout.height - layout.height * supply)
      demandSupplyRect.setAttribute('height', layout.height * supply)
      demandSupplyRect.setAttribute(
        'fill',
        `rgba(${this.flowColor1.r},${this.flowColor1.g},${this.flowColor1.b},${this.flowColor1.a})`
      )
    } else if (supply < 0) {
      demandSupplyRect.setAttribute('y', layout.height - flow)
      demandSupplyRect.setAttribute('height', Math.min(flow, Math.abs(layout.height * supply)))
      demandSupplyRect.setAttribute(
        'fill',
        `rgba(${this.flowColor2.r},${this.flowColor2.g},${this.flowColor2.b},${this.flowColor2.a})`
      )
    }
    flowGroup.appendChild(demandSupplyRect)

    // add text element that shows the incoming flow in addition to supply/demand
    const text = window.document.createElementNS(svgNS, 'text')
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('x', layout.width * 0.5)
    text.textContent = Math.round(flow + (adjustable ? layout.height * supply : 0))
    text.setAttribute('fill', text.textContent > 7 ? 'white' : 'black')
    text.setAttribute('y', layout.height - 3)
    flowGroup.appendChild(text)

    const frame = window.document.createElementNS(svgNS, 'rect')
    frame.setAttribute('x', '15')
    frame.setAttribute('y', '0')
    frame.setAttribute('width', layout.width - 30)
    frame.setAttribute('height', layout.height)
    let strokeColor = 'rgb(200,200,200)'
    if (node.tag.source) {
      strokeColor = 'yellowgreen'
    } else if (node.tag.sink) {
      strokeColor = 'indianRed'
    }
    frame.setAttribute('style', `fill:none; stroke:${strokeColor}; stroke-width:3`)
    flowGroup.appendChild(frame)

    container.appendChild(flowGroup)
  }

  /**
   * Creates the path for the pipe.
   * @param {IRenderContext} context The render context
   * @param {INode} node The given node
   * @return {string} The path for the pipe
   */
  static createPipePath(context, node) {
    const layout = node.layout
    let path

    const graph = context.canvasComponent.graph
    // we have to distinguish the real source/sink from the isolated nodes
    const source = node.tag.source && graph.inDegree(node) === 0 && graph.outDegree(node) !== 0
    const sink = node.tag.sink && graph.outDegree(node) === 0 && graph.inDegree(node) !== 0

    if (!source && !sink) {
      path = `M0,0 A${layout.width * 0.5},${layout.height * 0.33} 0 0,0 ${layout.width},0 L${
        layout.width
      },${layout.height} A${layout.width * 0.5},${layout.height * 0.33} 0 0,0 0,${layout.height} z`
    } else if (source) {
      let startPoint = new Point(layout.width * 0.5, layout.height * 0.33)
      let endPoint = new Point(layout.width, 5)
      let controlPoint = new Point((startPoint.x + endPoint.x) * 0.5, startPoint.y)
      path = `M${startPoint.x},${startPoint.y} Q${controlPoint.x},${controlPoint.y} ${endPoint.x},${endPoint.y}`
      startPoint = new Point(layout.width, layout.height - 5)
      endPoint = new Point(layout.width * 0.5, layout.height * 0.666)
      controlPoint = new Point((startPoint.x + endPoint.x) * 0.5, endPoint.y)
      path += ` L${startPoint.x},${startPoint.y} Q${controlPoint.x},${controlPoint.y} ${endPoint.x},${endPoint.y} z`
    } else {
      let startPoint = new Point(layout.width * 0.5, layout.height * 0.33)
      let endPoint = new Point(0, 5)
      let controlPoint = new Point((startPoint.x + endPoint.x) * 0.5, startPoint.y)
      path = `M${startPoint.x},${startPoint.y} Q${controlPoint.x},${controlPoint.y} ${endPoint.x},${endPoint.y}`
      startPoint = new Point(0, layout.height - 5)
      endPoint = new Point(layout.width * 0.5, layout.height * 0.666)
      controlPoint = new Point((startPoint.x + endPoint.x) * 0.5, endPoint.y)
      path += ` L${startPoint.x},${startPoint.y} Q${controlPoint.x},${controlPoint.y} ${endPoint.x},${endPoint.y} z`
    }
    return path
  }

  /**
   * Creates an object containing all necessary data to create a visual for the node.
   * @param {IRenderContext} context The render context
   * @param {INode} node The given node
   * @return {Object} The render data cache object
   */
  static createRenderDataCache(context, node) {
    const tag = node.tag
    const graph = context.canvasComponent.graph
    const inDegree = graph.inDegree(node)
    const outDegree = graph.outDegree(node)
    return {
      supply: tag.supply,
      flow: tag.flow,
      adjustable: tag.adjustable ? tag.supply : 0,
      size: node.layout.toSize(),
      location: node.layout.center,
      isSource: inDegree === 0 || tag.source,
      isSink: outDegree === 0 || tag.sink,
      inDegree,
      outDegree,
      equalsState: (self, other) =>
        self.isSource === other.isSource &&
        self.isSink === other.isSink &&
        self.inDegree === other.inDegree &&
        self.outDegree === other.outDegree,
      equals: (self, other) =>
        other !== null &&
        self.size.equals(other.size) &&
        self.flow === other.flow &&
        self.supply === other.supply &&
        self.adjustable === other.adjustable &&
        self.location.equals(other.location) &&
        self.equalsState(self, other)
    }
  }
}

export class NetworkFlowEdgeStyle extends EdgeStyleBase {
  /**
   * Creates a new instance of NetworkFlowEdgeStyle.
   * @param {Color?} highlightColor
   */
  constructor(highlightColor) {
    super()
    this.highlightColor = highlightColor || null
  }

  /**
   * Creates the visual for an edge.
   * @param {IRenderContext} context The render context
   * @param {IEdge} edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase#createVisual}
   * @returns {Visual} The new visual
   */
  createVisual(context, edge) {
    // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const selection = context.canvasComponent !== null ? context.canvasComponent.selection : null
    const selected = selection !== null && selection.isSelected(edge)
    // Get the necessary data for rendering of the edge
    const cache = new RenderDataCache(edge.tag, this.getPath(edge), this.highlightColor, selected)
    // Render the edge
    this.render(context, edge, g, cache)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @param {IRenderContext} context The render context
   * @param {SvgVisual} oldVisual The old visual
   * @param {IEdge} edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase#updateVisual}
   * @return {Visual} The updated visual
   */
  updateVisual(context, oldVisual, edge) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']

    const selection = context.canvasComponent !== null ? context.canvasComponent.selection : null
    const selected = selection !== null && selection.isSelected(edge)

    // get the data for the new visual
    const newCache = new RenderDataCache(
      edge.tag,
      this.getPath(edge),
      this.highlightColor,
      selected
    )

    // check if something changed
    if (newCache.equals(oldCache)) {
      return oldVisual
    }

    // more than only the path changed - re-render the visual
    while (container.hasChildNodes()) {
      // remove all children
      container.removeChild(container.firstChild)
    }
    this.render(context, edge, container, newCache)
    return oldVisual
  }

  /**
   * Creates the visual appearance of an edge.
   * @param {IRenderContext} context The render context
   * @param {IEdge} edge The edge to be rendered
   * @param {Element} container The svg container
   * @param {Object} cache The render data cache
   */
  render(context, edge, container, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // edge background
    const backgroundPath = cache.path.createSvgPath()
    backgroundPath.setAttribute('fill', 'none')
    backgroundPath.setAttribute('stroke-width', Math.max(cache.capacity, 1))
    backgroundPath.setAttribute('stroke-linejoin', 'round')
    backgroundPath.setAttribute('stroke-linecap', 'butt')
    backgroundPath.setAttribute('stroke', 'rgb(220, 220, 220)')
    container.appendChild(backgroundPath)

    if (cache.selected) {
      const selectionPath = cache.path.createSvgPath()
      selectionPath.setAttribute('fill', 'none')
      selectionPath.setAttribute('stroke-width', Math.max(cache.capacity + 2, 2))
      selectionPath.setAttribute('stroke-linejoin', 'round')
      selectionPath.setAttribute('stroke-linecap', 'butt')
      selectionPath.setAttribute('stroke', 'indianred')
      container.appendChild(selectionPath)
    }

    let flowPercentage = Math.max(cache.capacity, 1)
    if (!this.highlightColor) {
      flowPercentage = cache.capacity !== 0 ? (cache.edgeFlow * cache.capacity) / cache.capacity : 0
    }

    const path = cache.path.createSvgPath()
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-width', flowPercentage)
    path.setAttribute('stroke-linejoin', 'round')
    path.setAttribute('stroke-linecap', 'butt')
    path.setAttribute('stroke', 'rgb(0,0,0)')

    if (edge.tag && edge.tag.color) {
      const linearGradient = new LinearGradient()
      const gradientStop1 = new GradientStop()
      gradientStop1.color = this.highlightColor || edge.tag.color
      gradientStop1.offset = 0
      linearGradient.gradientStops.add(gradientStop1)

      const gradientStop2 = new GradientStop()
      gradientStop2.color = this.generateLighterOrDarkerColor(gradientStop1.color, false, 90)
      gradientStop2.offset = 1
      linearGradient.gradientStops.add(gradientStop2)
      linearGradient.startPoint = new Point(0, 0)
      linearGradient.endPoint = new Point(30, 30)
      linearGradient.spreadMethod = GradientSpreadMethod.REFLECT

      const defs = context.canvasComponent.svgDefsManager.defs
      // convert the gradient to SvgElement
      const gradient = createAnimatedGradient(linearGradient)
      // assigns the id
      const isHighlighting = this.highlightColor ? 'highlight' : 'normal'
      gradient.id = isHighlighting + edge.tag.id
      // check if there exists already a gradient for this edge
      this.removeGradientFromDefs(defs, edge)
      // store the new id to cache
      cache.id = gradient.id

      // append the gradient to the defs
      defs.appendChild(gradient)
      // sets the fill reference in the ellipse
      path.setAttribute('stroke', `url(#${gradient.id})`)
    } else {
      path.setAttribute('stroke', 'rgb(220,220,220)')
    }
    container.appendChild(path)
  }

  /**
   * Removes any previous gradients related to the given edge from defs.
   * @param {SVGDefsElement} defs The defs element
   * @param {IEdge} edge The given edge
   */
  removeGradientFromDefs(defs, edge) {
    const gradientsToRemove = []
    for (let i = 0; i < defs.childNodes.length; i++) {
      const child = defs.childNodes[i]
      if (child.id === `normal${edge.tag.id}` || child.id === `highlight${edge.tag.id}`) {
        gradientsToRemove.push(child)
      }
    }
    gradientsToRemove.forEach(gradient => {
      defs.removeChild(gradient)
    })
  }

  /**
   * Generates a color that is lighter or darker from the given one.
   * @param {Color} color The start color
   * @param {boolean} isLighter True of the new color should be lighter, false otherwise
   * @param {number} percent A number indicating how much lighter or darker the new color should be
   * @returns {Color} A lighter or darker color from the given one.
   */
  generateLighterOrDarkerColor(color, isLighter, percent) {
    const colorArray = [color.r, color.g, color.b]

    function generateColor(i) {
      const index = Math.round(percent || 0.2 * 256) * (isLighter ? -1 : 1)
      return Math[isLighter ? 'max' : 'min'](colorArray[i] + index, isLighter ? 0 : 255)
    }

    return new Color(generateColor(0), generateColor(1), generateColor(2), 255)
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * @param {IInputModeContext} canvasContext The render context
   * @param {Point} p The coordinates of the query in the world coordinate system
   * @param {IEdge} edge The given edge
   * @see Overrides {@link EdgeStyleBase#isHit}
   * @return {boolean} True if the edge has been hit, false otherwise
   */
  isHit(canvasContext, p, edge) {
    let thickness = 0
    const sourcePortX = edge.sourcePort.location.x
    const targetPortX = edge.targetPort.location.x

    const sourcePortLeft = sourcePortX < targetPortX
    if (edge.tag && edge.tag.capacity) {
      if (
        (sourcePortLeft && p.x >= sourcePortX && p.x <= targetPortX) ||
        (!sourcePortLeft && p.x <= sourcePortX && p.x >= targetPortX)
      ) {
        thickness = edge.tag.capacity * 0.5
      }
    }
    return this.getPath(edge).pathContains(p, canvasContext.hitTestRadius + thickness)
  }

  /**
   * Creates a {@link GeneralPath} from the edge's bends.
   * @param {IEdge} edge The edge to create the path for.
   * @see Overrides {@link EdgeStyleBase#getPath}
   * @return {GeneralPath} A {@link GeneralPath} following the edge
   */
  getPath(edge) {
    // Create a general path from the locations of the ports and the bends of the edge.
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort.location)
    path.lineTo(edge.sourcePort.location.add(new Point(5, 0)))
    edge.bends.forEach(bend => {
      path.lineTo(bend.location)
    })
    path.lineTo(edge.targetPort.location.subtract(new Point(5, 0)))
    path.lineTo(edge.targetPort.location)
    return path
  }
}

/**
 * Helper class that holds the data fields used by visual caching of the edge style.
 * The equals method detects if the cache has changed.
 */
class RenderDataCache {
  /**
   * Creates a new RenderDataCache object.
   * @param {Object} tag The edge tag
   * @param {GeneralPath} path The edge's path
   * @param {Color} color The edge's color
   * @param {boolean} selected True if the edge is selected, false otherwise
   */
  constructor(tag, path, color, selected) {
    this.$capacity = tag !== null ? tag.capacity : 3
    this.$edgeFlow = tag !== null ? tag.flow : 0
    this.$color = color || (tag !== null ? tag.color : Color.DODGER_BLUE)
    this.$id = null
    this.$path = path
    this.$selected = selected
  }

  /**
   * Gets the capacity of the edge.
   * @return {number} The capacity of the edge
   */
  get capacity() {
    return this.$capacity
  }

  /**
   * Gets the flow of the edge.
   * @return {number} The edge flow of the edge
   */
  get edgeFlow() {
    return this.$edgeFlow
  }

  /**
   * Gets the color of the edge.
   * @return {Color} The color of the edge
   */
  get color() {
    return this.$color
  }

  /**
   * Gets the path of the edge.
   * @return {GeneralPath} The path of the edge
   */
  get path() {
    return this.$path
  }

  /**
   * Gets whether or not the edge is selected.
   * @return {boolean} True if the edge is selected, false otherwise
   */
  get selected() {
    return this.$selected
  }

  /**
   * Gets the id of the edge.
   * @return {string} The id of the edge
   */
  get id() {
    return this.$id
  }

  /**
   * Sets the id of the edge.
   * @param {string} id The id to be set
   */
  set id(id) {
    this.$id = id
  }

  /**
   * Check if the properties of the two RenderDataCache objects match.
   * @param {RenderDataCache} other The RenderDataCache to compare with.
   * @return {boolean} True of the properties of the two RenderDataCache objects match, false otherwise
   */
  stateEquals(other) {
    return (
      this.capacity === other.capacity &&
      this.edgeFlow === other.edgeFlow &&
      this.color === other.color &&
      this.selected === other.selected
    )
  }

  /**
   * Check if the two RenderDataCache objects match.
   * @param {RenderDataCache} other The RenderDataCache to compare with.
   * @return {boolean} True of the two RenderDataCache objects match, false otherwise
   */
  equals(other) {
    return (
      other !== null &&
      other instanceof RenderDataCache &&
      this.path.hasSameValue(other.path) &&
      this.stateEquals(other) &&
      this.id === other.id
    )
  }
}

/**
 * Creates a new animated SVG gradient that corresponds to the given linear gradient.
 *
 * @param {LinearGradient} linearGradient The base, non-animated gradient.
 * @return {SVGElement} The SVG animated gradient
 */
function createAnimatedGradient(linearGradient) {
  const svgGradient = linearGradient.toSvgGradient()
  svgGradient.setAttribute('gradientUnits', 'userSpaceOnUse')

  let offset = 0
  let animationFrameId = 0
  const ANIMATION_SPEED = 0.05
  // get current timestamp
  let t = new Date().getTime()
  // create the animation callback
  const frameRequestCallback = timestamp => {
    // calculate the milliseconds since the last animation frame
    const currentTime = new Date().getTime()
    const dt = currentTime - t
    t = currentTime
    // check if the gradient is still alive
    if (svgGradient.ownerDocument !== null && svgGradient.parentNode !== null) {
      // calculate the new offset
      offset = (offset + dt * ANIMATION_SPEED) % 60
      // ...and set the new transform
      svgGradient.setAttribute(
        'gradientTransform',
        new Matrix(1, 0, 0, 1, offset, offset).toSvgTransform()
      )
      // re-start the animation
      animationFrameId = requestAnimationFrame(frameRequestCallback)
    } else {
      // if the gradient is dead, cancel the animation
      cancelAnimationFrame(animationFrameId)
      animationFrameId = -1
    }
  }
  // start the animation
  animationFrameId = requestAnimationFrame(frameRequestCallback)
  return svgGradient
}

/**
 * Background visual that draws a line visualizing the minimum cut of the flow-network.
 */
export class MinCutLine extends BaseClass(IVisualCreator) {
  constructor() {
    super()
    this.$bounds = null
    this.$visible = false
  }

  /**
   * Gets whether or not the min-cut line is visible.
   * @return {boolean}
   */
  get visible() {
    return this.$visible
  }

  /**
   * Sets whether or not the min-cut line is visible.
   * @param {boolean} value True if the min-cut line is visible, false otherwise
   */
  set visible(value) {
    this.$visible = value
  }

  /**
   * Gets the bounds of the min-cut line.
   * @return {Rect}
   */
  get bounds() {
    return this.$bounds
  }

  /**
   * Sets the bounds of the min-cut line.
   * @param {Rect} value The bounds to be set
   */
  set bounds(value) {
    this.$bounds = value
  }

  /**
   * Creates a visual that displays the min cut line.
   * @param {IRenderContext} context The context that describes where the visual will be used.
   * @returns {Visual} The new visual
   */
  createVisual(context) {
    const container = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const cache = this.createRenderDataCache(this.bounds, this.visible)
    this.render(container, cache)
    return new SvgVisual(container)
  }

  /**
   * Updates the min cut line visual if necessary.
   * @param {IRenderContext} context The context that describes where the visual will be used in.
   * @param {Visual} oldVisual The old visual
   * @returns {Visual} The updated visual
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual.svgElement

    const oldCache = container['data-renderDataCache']
    const newCache = this.createRenderDataCache(this.bounds, this.visible)

    // if nothing has changed
    if (newCache.equals(newCache, oldCache)) {
      return oldVisual
    }
    // visual is invisible, remove all elements of the visual
    while (container.firstElementChild) {
      container.removeChild(container.firstElementChild)
    }
    this.render(container, newCache)

    // return new/updated visual
    return oldVisual
  }

  /**
   * Render the min-cut line.
   * @param {Element} container The svg container
   * @param {Object} cache The render data cache
   */
  render(container, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // visual needs an update
    if (this.visible && this.bounds) {
      // add/adjust the line element
      let line
      let text
      if (container.childElementCount === 0) {
        line = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        line.setAttribute('rx', '5')
        line.setAttribute('ry', '5')
        line.setAttribute('fill', 'gold')
        container.appendChild(line)

        text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.textContent = 'MIN CUT'
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('x', this.bounds.centerX)
        text.setAttribute('y', this.bounds.centerY)
        text.setAttribute('fill', 'darkorange')
        text.setAttribute('writing-mode', 'tb')
        container.appendChild(text)
      } else {
        line = container.firstElementChild
        text = container.lastElementChild
      }

      line.setAttribute('x', this.bounds.x)
      line.setAttribute('y', this.bounds.y)
      line.setAttribute('width', this.bounds.width)
      line.setAttribute('height', this.bounds.height)

      text.setAttribute('x', this.bounds.centerX)
      text.setAttribute('y', this.bounds.centerY)
    }
  }

  /**
   * Creates an object containing all necessary data to create a visual for the min cut line.
   * @param {IRectangle} bounds The line bounds
   * @param {boolean} visible true if the min-cut line is visible, false otherwise
   * @return {Object} The render data cache
   */
  createRenderDataCache(bounds, visible) {
    return {
      location: bounds ? bounds.topLeft : null,
      size: bounds ? bounds.toSize() : null,
      visible,
      equals: (self, other) =>
        self.bounds &&
        other.bounds &&
        self.location.equals(other.location) &&
        self.size.equals(other.size) &&
        self.visible === other.visible
    }
  }
}
