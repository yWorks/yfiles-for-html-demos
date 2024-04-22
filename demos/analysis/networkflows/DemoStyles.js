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
  BaseClass,
  Color,
  EdgeStyleBase,
  GeneralPath,
  GradientSpreadMethod,
  GradientStop,
  GraphComponent,
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
 * Sets the value of the attribute with the given name for the given element.
 * @param {!Element} e The Element for which an attribute value is set.
 * @param {!string} name The name of the attribute to set.
 * @param {!(number|string)} value The value of the attribute to set.
 */
function setAttribute(e, name, value) {
  e.setAttribute(name, value.toString())
}

/**
 * A NetworkFlowNodeStyle represents the flow that is regulated at the according node.
 * By setting a tag, the flow can be adjusted for this node.
 */
export class NetworkFlowNodeStyle extends NodeStyleBase {
  flowColor1
  flowColor2

  /**
   * Creates a new instance of NetworkFlowNodeStyle.
   * @param {!Color} [color1]
   * @param {!Color} [color2]
   */
  constructor(color1, color2) {
    super()
    this.flowColor1 = color1 || Color.DARK_BLUE
    this.flowColor2 = color2 || Color.CORNFLOWER_BLUE
  }

  /**
   * Creates a new visual.
   * @param {!IRenderContext} context The render context
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!SvgVisual} The new visual
   */
  createVisual(context, node) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

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
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @param {!INode} node The node to which this style instance is assigned
   * @returns {!SvgVisual} The updated visual
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement

    const oldCache = container['data-renderDataCache']
    const newCache = NetworkFlowNodeStyle.createRenderDataCache(context, node)

    // check if something changed except for the location of the node
    if (!newCache.equals(oldCache)) {
      // something changed - re-render the visual
      while (container.lastChild != null) {
        container.removeChild(container.lastChild)
      }
      this.render(context, node, container, newCache)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Renders the node.
   * @param {!IRenderContext} context The render context
   * @param {!INode} node The node to which this style instance is assigned
   * @param {*} container The svg container
   * @param {!NodeRenderDataCache} cache The render data cache
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

    const pipeGroup = document.createElementNS(svgNS, 'g')
    const pipe = document.createElementNS(svgNS, 'path')
    setAttribute(pipe, 'd', NetworkFlowNodeStyle.createPipePath(context, node))
    setAttribute(pipe, 'fill', 'lightgrey')
    pipeGroup.appendChild(pipe)

    if (!source) {
      const leftPipeBorder = document.createElementNS(svgNS, 'rect')
      setAttribute(leftPipeBorder, 'x', '0')
      setAttribute(leftPipeBorder, 'y', '0')
      setAttribute(leftPipeBorder, 'width', '3')
      setAttribute(leftPipeBorder, 'height', layout.height.toString())
      setAttribute(leftPipeBorder, 'fill', 'rgb(200,200,200)')
      pipeGroup.appendChild(leftPipeBorder)
    }
    if (!sink) {
      const rightPipeBorder = document.createElementNS(svgNS, 'rect')
      setAttribute(rightPipeBorder, 'x', (layout.width - 3).toString())
      setAttribute(rightPipeBorder, 'y', '0')
      setAttribute(rightPipeBorder, 'width', '3')
      setAttribute(rightPipeBorder, 'height', layout.height.toString())
      setAttribute(rightPipeBorder, 'fill', 'rgb(200,200,200)')
      pipeGroup.appendChild(rightPipeBorder)
    }

    container.appendChild(pipeGroup)

    const flowGroup = document.createElementNS(svgNS, 'g')
    // create the gradient
    if (document.getElementById('flow-gradient') === null) {
      const defs = context.canvasComponent.svgDefsManager.defs
      const gradient = document.createElementNS(svgNS, 'linearGradient')
      setAttribute(gradient, 'id', 'flow-gradient')
      setAttribute(gradient, 'x1', '0')
      setAttribute(gradient, 'y1', '0')
      setAttribute(gradient, 'x2', '0')
      setAttribute(gradient, 'y2', '1')
      const stop1 = document.createElementNS(svgNS, 'stop')
      setAttribute(
        stop1,
        'stop-color',
        `rgba(${this.flowColor1.r},${this.flowColor1.g},${this.flowColor1.b},${this.flowColor1.a})`
      )
      setAttribute(stop1, 'offset', '0')
      gradient.appendChild(stop1)
      const stop2 = document.createElementNS(svgNS, 'stop')
      setAttribute(
        stop2,
        'stop-color',
        `rgba(${this.flowColor2.r},${this.flowColor2.g},${this.flowColor2.b},${this.flowColor2.a})`
      )
      setAttribute(stop2, 'offset', '1')
      gradient.appendChild(stop2)

      // puts the gradient in the container's defs section
      defs.appendChild(gradient)
    }

    // add background rectangle
    const rect = document.createElementNS(svgNS, 'rect')
    setAttribute(rect, 'x', '15')
    setAttribute(rect, 'y', '0')
    setAttribute(rect, 'width', layout.width - 30)
    setAttribute(rect, 'height', layout.height)
    setAttribute(rect, 'style', 'fill:lightgrey')
    flowGroup.appendChild(rect)

    // add rectangle to visualize the incoming flow
    const flowRect = document.createElementNS(svgNS, 'rect')
    setAttribute(flowRect, 'x', '15')
    setAttribute(
      flowRect,
      'y',
      layout.height - flow - (adjustable ? Math.max(0, layout.height * supply) : 0)
    )
    setAttribute(flowRect, 'width', layout.width - 30)
    setAttribute(flowRect, 'height', flow)
    setAttribute(flowRect, 'fill', 'url(#flow-gradient)')
    flowGroup.appendChild(flowRect)

    // add rectangle to visualize supply/demand flow
    const demandSupplyRect = document.createElementNS(svgNS, 'rect')
    setAttribute(demandSupplyRect, 'x', '15')
    setAttribute(demandSupplyRect, 'width', layout.width - 30)
    if (supply > 0) {
      setAttribute(demandSupplyRect, 'y', layout.height - layout.height * supply)
      setAttribute(demandSupplyRect, 'height', layout.height * supply)
      setAttribute(
        demandSupplyRect,
        'fill',
        `rgba(${this.flowColor1.r},${this.flowColor1.g},${this.flowColor1.b},${this.flowColor1.a})`
      )
    } else if (supply < 0) {
      setAttribute(demandSupplyRect, 'y', layout.height - flow)
      setAttribute(demandSupplyRect, 'height', Math.min(flow, Math.abs(layout.height * supply)))
      setAttribute(
        demandSupplyRect,
        'fill',
        `rgba(${this.flowColor2.r},${this.flowColor2.g},${this.flowColor2.b},${this.flowColor2.a})`
      )
    }
    flowGroup.appendChild(demandSupplyRect)

    // add text element that shows the incoming flow in addition to supply/demand
    const adjustedFlow = Math.round(flow + (adjustable ? layout.height * supply : 0))
    const text = document.createElementNS(svgNS, 'text')
    setAttribute(text, 'text-anchor', 'middle')
    setAttribute(text, 'x', layout.width * 0.5)
    text.textContent = adjustedFlow.toString()
    setAttribute(text, 'fill', adjustedFlow > 7 ? 'white' : 'black')
    setAttribute(text, 'y', layout.height - 3)
    flowGroup.appendChild(text)

    const frame = document.createElementNS(svgNS, 'rect')
    setAttribute(frame, 'x', '15')
    setAttribute(frame, 'y', '0')
    setAttribute(frame, 'width', layout.width - 30)
    setAttribute(frame, 'height', layout.height)
    let strokeColor = 'rgb(200,200,200)'
    if (node.tag.source) {
      strokeColor = 'yellowgreen'
    } else if (node.tag.sink) {
      strokeColor = 'indianRed'
    }
    setAttribute(frame, 'style', `fill:none; stroke:${strokeColor}; stroke-width:3`)
    flowGroup.appendChild(frame)

    container.appendChild(flowGroup)
  }

  /**
   * Creates the path for the pipe.
   * @param {!IRenderContext} context The render context
   * @param {!INode} node The given node
   * @returns {!string} The path for the pipe
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
   * @param {!IRenderContext} context The render context
   * @param {!INode} node The given node
   * @returns {!NodeRenderDataCache} The render data cache object
   */
  static createRenderDataCache(context, node) {
    const tag = node.tag
    const graph = context.canvasComponent.graph
    const inDegree = graph.inDegree(node)
    const outDegree = graph.outDegree(node)
    return new NodeRenderDataCache(
      tag.supply,
      tag.flow,
      tag.adjustable ? tag.supply : 0,
      node.layout.toRect(),
      inDegree === 0 || tag.source,
      outDegree === 0 || tag.sink,
      inDegree,
      outDegree
    )
  }
}

/**
 * Holds the data fields necessary for visual caching in the network flow node style.
 * The equals method detects if the cache has changed.
 */
class NodeRenderDataCache {
  /**
   * @param {number} supply
   * @param {number} flow
   * @param {number} adjustableSupply
   * @param {!Rect} bounds
   * @param {boolean} source
   * @param {boolean} sink
   * @param {number} inDegree
   * @param {number} outDegree
   */
  constructor(supply, flow, adjustableSupply, bounds, source, sink, inDegree, outDegree) {
    this.outDegree = outDegree
    this.inDegree = inDegree
    this.sink = sink
    this.source = source
    this.bounds = bounds
    this.adjustableSupply = adjustableSupply
    this.flow = flow
    this.supply = supply
  }

  /**
   * Checks if the data stored in the given cache is equal to data in this cache.
   * @param other The render data cache that is compared to this cache.
   * @returns {boolean} True if the values of the given cache equal the values of this cache, false otherwise.
   * @param {!NodeRenderDataCache} [other]
   */
  equals(other) {
    return (
      !!other &&
      this.bounds.equals(other.bounds) &&
      this.flow === other.flow &&
      this.supply === other.supply &&
      this.adjustableSupply === other.adjustableSupply &&
      this.source === other.source &&
      this.sink === other.sink &&
      this.inDegree === other.inDegree &&
      this.outDegree === other.outDegree
    )
  }
}

export class NetworkFlowEdgeStyle extends EdgeStyleBase {
  highlightColor

  /**
   * Creates a new instance of NetworkFlowEdgeStyle.
   * @param {!Color} [highlightColor]
   */
  constructor(highlightColor) {
    super()
    this.highlightColor = highlightColor || null
  }

  /**
   * Creates the visual for an edge.
   * @param {!IRenderContext} context The render context
   * @param {!IEdge} edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase.createVisual}
   * @returns {!Visual} The new visual
   */
  createVisual(context, edge) {
    // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const selection = context.canvasComponent ? context.canvasComponent.selection : null
    const selected = !!selection && selection.isSelected(edge)
    // Get the necessary data for rendering of the edge
    const cache = NetworkFlowEdgeStyle.createRenderDataCache(
      edge.tag,
      this.getPath(edge),
      this.highlightColor,
      selected
    )
    // Render the edge
    this.render(context, edge, g, cache)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @param {!IEdge} edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase.updateVisual}
   * @returns {!Visual} The updated visual
   */
  updateVisual(context, oldVisual, edge) {
    const container = oldVisual.svgElement

    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']

    const selection = context.canvasComponent ? context.canvasComponent.selection : null
    const selected = !!selection && selection.isSelected(edge)

    // get the data for the new visual
    const newCache = NetworkFlowEdgeStyle.createRenderDataCache(
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
    while (container.lastChild != null) {
      container.removeChild(container.lastChild)
    }
    this.render(context, edge, container, newCache)
    return oldVisual
  }

  /**
   * Creates the visual appearance of an edge.
   * @param {!IRenderContext} context The render context
   * @param {!IEdge} edge The edge to be rendered
   * @param {*} container The svg container
   * @param {!EdgeRenderDataCache} cache The render data cache
   */
  render(context, edge, container, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // edge background
    const backgroundPath = cache.path.createSvgPath()
    setAttribute(backgroundPath, 'fill', 'none')
    setAttribute(backgroundPath, 'stroke-width', Math.max(cache.capacity, 1))
    setAttribute(backgroundPath, 'stroke-linejoin', 'round')
    setAttribute(backgroundPath, 'stroke-linecap', 'butt')
    setAttribute(backgroundPath, 'stroke', 'rgb(220, 220, 220)')
    container.appendChild(backgroundPath)

    if (cache.selected) {
      const selectionPath = cache.path.createSvgPath()
      setAttribute(selectionPath, 'fill', 'none')
      setAttribute(selectionPath, 'stroke-width', Math.max(cache.capacity + 2, 2))
      setAttribute(selectionPath, 'stroke-linejoin', 'round')
      setAttribute(selectionPath, 'stroke-linecap', 'butt')
      setAttribute(selectionPath, 'stroke', 'indianred')
      container.appendChild(selectionPath)
    }

    let flowPercentage = Math.max(cache.capacity, 1)
    if (!this.highlightColor) {
      flowPercentage = cache.capacity !== 0 ? (cache.edgeFlow * cache.capacity) / cache.capacity : 0
    }

    const path = cache.path.createSvgPath()
    setAttribute(path, 'fill', 'none')
    setAttribute(path, 'stroke-width', flowPercentage)
    setAttribute(path, 'stroke-linejoin', 'round')
    setAttribute(path, 'stroke-linecap', 'butt')
    setAttribute(path, 'stroke', 'rgb(0,0,0)')

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
      setAttribute(path, 'stroke', `url(#${gradient.id})`)
    } else {
      setAttribute(path, 'stroke', 'rgb(220,220,220)')
    }
    container.appendChild(path)
  }

  /**
   * Removes any previous gradients related to the given edge from defs.
   * @param {!SVGDefsElement} defs The defs element
   * @param {!IEdge} edge The given edge
   */
  removeGradientFromDefs(defs, edge) {
    const gradientsToRemove = []
    for (let child = defs.firstElementChild; child; child = child.nextElementSibling) {
      if (child.id === `normal${edge.tag.id}` || child.id === `highlight${edge.tag.id}`) {
        gradientsToRemove.push(child)
      }
    }
    gradientsToRemove.forEach((gradient) => defs.removeChild(gradient))
  }

  /**
   * Generates a color that is lighter or darker from the given one.
   * @param {!Color} color The start color
   * @param {boolean} isLighter True of the new color should be lighter, false otherwise
   * @param {number} percent A number indicating how much lighter or darker the new color should be
   * @returns {!Color} A lighter or darker color from the given one.
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
   * @param {!IInputModeContext} canvasContext The render context
   * @param {!Point} p The coordinates of the query in the world coordinate system
   * @param {!IEdge} edge The given edge
   * @see Overrides {@link EdgeStyleBase.isHit}
   * @returns {boolean} True if the edge has been hit, false otherwise
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
   * @param {!IEdge} edge The edge to create the path for.
   * @see Overrides {@link EdgeStyleBase.getPath}
   * @returns {!GeneralPath} A {@link GeneralPath} following the edge
   */
  getPath(edge) {
    // Create a general path from the locations of the ports and the bends of the edge.
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort.location)
    path.lineTo(edge.sourcePort.location.add(new Point(5, 0)))
    edge.bends.forEach((bend) => path.lineTo(bend.location))
    path.lineTo(edge.targetPort.location.subtract(new Point(5, 0)))
    path.lineTo(edge.targetPort.location)
    return path
  }

  /**
   * Creates an object containing all necessary data to create a visual for the edge.
   * @param {*} tag The tag of the edge.
   * @param {!GeneralPath} path The path of the edge.
   * @param {?Color} color The highlight color used for the edge.
   * @param {boolean} selected The current selection state of the edge.
   * @returns {!EdgeRenderDataCache} The render data cache
   */
  static createRenderDataCache(tag, path, color, selected) {
    return new EdgeRenderDataCache(
      '',
      tag ? tag.capacity : 3,
      tag ? tag.flow : 0,
      path,
      color || (tag ? tag.color : Color.DODGER_BLUE),
      selected
    )
  }
}

/**
 * Holds the data fields necessary for visual caching in the network flow edge style.
 * The equals method detects if the cache has changed.
 */
class EdgeRenderDataCache {
  /**
   * Creates a new RenderDataCache object.
   * @param {!string} id The unique identifier of the gradient used for the edge
   * @param {number} capacity The capacity of the edge
   * @param {number} edgeFlow The current flow of the edge
   * @param {!GeneralPath} path The edge's path
   * @param {?Color} color The edge's color
   * @param {boolean} selected True if the edge is selected, false otherwise
   */
  constructor(id, capacity, edgeFlow, path, color, selected) {
    this.selected = selected
    this.color = color
    this.path = path
    this.edgeFlow = edgeFlow
    this.capacity = capacity
    this.id = id
  }

  /**
   * Checks if the data stored in the given cache is equal to data in this cache.
   * @param other The render data cache that is compared to this cache.
   * @returns {boolean} True if the values of the given cache equal the values of this cache, false otherwise.
   * @param {!EdgeRenderDataCache} [other]
   */
  equals(other) {
    return (
      !!other &&
      this.id === other.id &&
      this.capacity === other.capacity &&
      this.edgeFlow === other.edgeFlow &&
      this.color === other.color &&
      this.selected === other.selected &&
      this.path.hasSameValue(other.path)
    )
  }
}

/**
 * Creates a new animated SVG gradient that corresponds to the given linear gradient.
 * @param {!LinearGradient} linearGradient The base, non-animated gradient.
 * @returns {!SVGElement} The SVG animated gradient
 */
function createAnimatedGradient(linearGradient) {
  const svgGradient = linearGradient.toSvgGradient()
  setAttribute(svgGradient, 'gradientUnits', 'userSpaceOnUse')

  let offset = 0
  let animationFrameId = 0
  const ANIMATION_SPEED = 0.05

  let previousTime = null

  const frameRequestCallback = (timestamp) => {
    // calculate the time since the last animation frame
    if (previousTime == null) {
      previousTime = timestamp
    }
    const dt = timestamp - previousTime
    previousTime = timestamp
    // check if the gradient is still alive
    if (svgGradient.ownerDocument !== null && svgGradient.parentNode !== null) {
      // calculate the new offset
      offset = (offset + dt * ANIMATION_SPEED) % 60
      // ...and set the new transform
      setAttribute(
        svgGradient,
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
  $bounds
  $visible

  constructor() {
    super()
    this.$bounds = Rect.EMPTY
    this.$visible = false
  }

  /**
   * Gets whether or not the min-cut line is visible.
   * @type {boolean}
   */
  get visible() {
    return this.$visible
  }

  /**
   * Sets whether or not the min-cut line is visible.
   * @param value True if the min-cut line is visible, false otherwise
   * @type {boolean}
   */
  set visible(value) {
    this.$visible = value
  }

  /**
   * Gets the bounds of the min-cut line.
   * @type {!Rect}
   */
  get bounds() {
    return this.$bounds
  }

  /**
   * Sets the bounds of the min-cut line.
   * @param value The bounds to be set
   * @type {!Rect}
   */
  set bounds(value) {
    this.$bounds = value
  }

  /**
   * Creates a visual that displays the min cut line.
   * @param {!IRenderContext} context The context that describes where the visual will be used.
   * @returns {!Visual} The new visual
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const cache = MinCutLine.createRenderDataCache(this.bounds, this.visible)
    this.render(container, cache)
    return new SvgVisual(container)
  }

  /**
   * Updates the min cut line visual if necessary.
   * @param {!IRenderContext} context The context that describes where the visual will be used in.
   * @param {!Visual} oldVisual The old visual
   * @returns {!Visual} The updated visual
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual.svgElement

    const oldCache = container['data-renderDataCache']
    const newCache = MinCutLine.createRenderDataCache(this.bounds, this.visible)

    // if nothing has changed
    if (newCache.equals(oldCache)) {
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
   * @param {*} container The svg container
   * @param {!MclRenderDataCache} cache The render data cache
   */
  render(container, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // visual needs an update
    if (this.visible && !this.bounds.isEmpty) {
      // add/adjust the line element
      let line
      let text
      if (container.childElementCount === 0) {
        line = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        setAttribute(line, 'rx', '5')
        setAttribute(line, 'ry', '5')
        setAttribute(line, 'fill', 'gold')
        container.appendChild(line)

        text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.textContent = 'MIN CUT'
        setAttribute(text, 'text-anchor', 'middle')
        setAttribute(text, 'x', this.bounds.centerX)
        setAttribute(text, 'y', this.bounds.centerY)
        setAttribute(text, 'fill', 'darkorange')
        setAttribute(text, 'writing-mode', 'tb')
        container.appendChild(text)
      } else {
        line = container.firstElementChild
        text = container.lastElementChild
      }

      setAttribute(line, 'x', this.bounds.x)
      setAttribute(line, 'y', this.bounds.y)
      setAttribute(line, 'width', this.bounds.width)
      setAttribute(line, 'height', this.bounds.height)

      setAttribute(text, 'x', this.bounds.centerX)
      setAttribute(text, 'y', this.bounds.centerY)
    }
  }

  /**
   * Creates an object containing all necessary data to create a visual for the min cut line.
   * @param {!IRectangle} bounds The line bounds
   * @param {boolean} visible true if the min-cut line is visible, false otherwise
   * @returns {!MclRenderDataCache} The render data cache
   */
  static createRenderDataCache(bounds, visible) {
    return new MclRenderDataCache(bounds.toRect(), visible)
  }
}

/**
 * Holds the data fields necessary for visual caching in the network flow min cut line visualization.
 * The equals method detects if the cache has changed.
 */
class MclRenderDataCache {
  /**
   * @param {!Rect} bounds
   * @param {boolean} visible
   */
  constructor(bounds, visible) {
    this.visible = visible
    this.bounds = bounds
  }

  /**
   * Checks if the data stored in the given cache is equal to data in this cache.
   * @param other The render data cache that is compared to this cache.
   * @returns {boolean} True if the values of the given cache equal the values of this cache, false otherwise.
   * @param {!MclRenderDataCache} [other]
   */
  equals(other) {
    return !!other && this.bounds.equals(other.bounds) && this.visible === other.visible
  }
}
