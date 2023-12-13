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
  CanvasComponent,
  Color,
  EdgeStyleBase,
  GeneralPath,
  GeomUtilities,
  GraphComponent,
  GraphHighlightIndicatorManager,
  HierarchicNestingPolicy,
  ICanvasObjectGroup,
  IEdge,
  IInputModeContext,
  IModelItem,
  IndicatorEdgeStyleDecorator,
  INode,
  IRectangle,
  IRenderContext,
  List,
  NodeStyleBase,
  PathType,
  Point,
  SvgVisual,
  Visual,
  YObject
} from 'yfiles'

/**
 * @typedef {Object} EdgeStyleCache
 * @property {Color} startColor
 * @property {Color} endColor
 * @property {number} pathThickness
 * @property {GeneralPath} path
 * @property {boolean} selected
 * @property {function} equals
 */

/**
 * @typedef {Object} NodeStyleCache
 * @property {Point} nodeCenter
 * @property {Point} circleCenter
 * @property {number} [thickness]
 * @property {Color} color
 * @property {number} circleNodeSize
 * @property {boolean} selected
 * @property {*} nodeLayout
 * @property {function} equals
 */

/**
 * This class draws the edges with cubic bezier curves. Also, the edges are drawn with gradient colors from red that
 * starts from the source node of the edge to blue that ends to the target node of the edge.
 */
export class DemoEdgeStyle extends EdgeStyleBase {
  pathThickness
  startColor
  endColor

  /**
   * Initializes a new instance of the {@link DemoEdgeStyle} class.
   * @param pathThickness The thickness of the edge
   * @param startColor The starting color of the gradient
   * @param endColor The end color of the gradient
   * @param {number} [pathThickness]
   * @param {!Color} [startColor]
   * @param {!Color} [endColor]
   */
  constructor(pathThickness, startColor, endColor) {
    super()
    this.pathThickness = pathThickness || 2
    this.startColor = startColor || Color.DARK_BLUE
    this.endColor = endColor || Color.SKY_BLUE
  }

  /**
   * Creates the visual for an edge.
   * @param {!IRenderContext} context The render context
   * @param {!IEdge} edge The edge to which this style instance is assigned
   * @returns {!SvgVisual}
   */
  createVisual(context, edge) {
    // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Get the necessary data for rendering of the edge
    const cache = this.createRenderDataCache(context, edge)

    // Render the edge
    this.render(g, cache, edge)

    return new SvgVisual(g)
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @param {!IEdge} edge The edge to which this style instance is assigned
   * @returns {!Visual}
   */
  updateVisual(context, oldVisual, edge) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(context, edge)

    // check if something changed
    if (newCache.equals(newCache, oldCache)) {
      // nothing changed, return the old visual
      return oldVisual
    }
    return this.createVisual(context, edge)
  }

  /**
   * Creates an object containing all necessary data to create an edge visual.
   * @param {!IRenderContext} context The render context
   * @param {!IEdge} edge The given edge
   * @returns {!EdgeStyleCache} The render data cache
   */
  createRenderDataCache(context, edge) {
    const selection = context.canvasComponent.selection
    const selected = selection !== null && selection.isSelected(edge)
    return {
      startColor: this.startColor,
      endColor: this.endColor,
      pathThickness: this.pathThickness,
      path: this.getPath(edge),
      selected,
      equals: (self, other) =>
        self.startColor === other.startColor &&
        self.endColor === other.endColor &&
        self.pathThickness === other.pathThickness &&
        self.path.hasSameValue(other.path) &&
        self.selected === other.selected
    }
  }

  /**
   * Creates the visual appearance of an edge.
   * @param {!Element} container The svg element
   * @param {!EdgeStyleCache} cache The render data cache object
   * @param {!IEdge} edge The edge to which this style instance is assigned
   */
  render(container, cache, edge) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    const gradientColors = DemoEdgeStyle.generateColors(this.startColor, this.endColor)
    const selectionColors = DemoEdgeStyle.generateColors(Color.RED, Color.GOLD)
    if (edge.bends.size > 1) {
      const controlPoints = calculateControlPoints(edge)
      // for each pairwise bezier curve create a general path that will have a different gradient fill color
      let lastPoint = edge.sourcePort.location
      for (let i = 0; i < controlPoints.length - 3; i += 3) {
        const generalPath = new GeneralPath()
        generalPath.moveTo(lastPoint)
        generalPath.cubicTo(controlPoints[i + 1], controlPoints[i + 2], controlPoints[i + 3])
        const path = generalPath.createSvgPath()
        path.setAttribute('fill', 'none')
        const colorIndex = Math.floor(
          (i * (gradientColors.length - 1)) / (controlPoints.length - 1)
        )
        path.setAttribute(
          'stroke',
          !cache.selected ? gradientColors[colorIndex] : selectionColors[colorIndex]
        )
        path.setAttribute('stroke-width', `${!cache.selected ? cache.pathThickness : 5}`)
        container.appendChild(path)
        lastPoint = controlPoints[i + 3]
      }
    } else {
      // we want to have gradient colors such that red starts from the source node and blue ends at the target node
      // split the path in lines and assign each line a different gradient fill color
      const points = getPathPoints(cache.path)
      // if the edge is straight-line, split in two parts such that one is blue and one is red
      const midPoint = new Point((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2)
      points.splice(1, 0, midPoint)
      for (let i = 1; i < points.length; i++) {
        const line = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', `${points[i - 1].x}`)
        line.setAttribute('y1', `${points[i - 1].y}`)
        line.setAttribute('x2', `${points[i].x}`)
        line.setAttribute('y2', `${points[i].y}`)
        line.setAttribute('fill', 'none')
        const colorIndex = Math.floor((i * (gradientColors.length - 1)) / (points.length - 1))
        line.setAttribute(
          'stroke',
          !cache.selected ? gradientColors[colorIndex] : selectionColors[colorIndex]
        )
        line.setAttribute('stroke-width', `${!cache.selected ? cache.pathThickness : 5}`)
        container.appendChild(line)
      }
    }
  }

  /**
   * Creates a {@link GeneralPath} from the edge's bends.
   * @param {!IEdge} edge The edge to create the path for
   * @returns {!GeneralPath} A {@link GeneralPath} following the edge
   */
  getPath(edge) {
    // Create a general path from the locations of the ports and the bends of the edge.
    const path = new GeneralPath()
    if (edge.bends.size > 1) {
      const controlPoints = calculateControlPoints(edge)
      path.moveTo(edge.sourcePort.location)
      for (let i = 0; i < controlPoints.length - 3; i += 3) {
        path.cubicTo(controlPoints[i + 1], controlPoints[i + 2], controlPoints[i + 3])
      }
    } else {
      path.moveTo(edge.sourcePort.location)
      edge.bends.forEach((bend) => {
        path.lineTo(bend.location)
      })
      path.lineTo(edge.targetPort.location)
    }
    return path
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * @param {!IInputModeContext} canvasContext The input mode context
   * @param {!Point} p The point to test
   * @param {!IEdge} edge The edge to which this style instance is assigned
   * @returns {boolean} True if the edge has been hit, false otherwise
   */
  isHit(canvasContext, p, edge) {
    return this.getPath(edge).pathContains(
      p,
      canvasContext.hitTestRadius + this.pathThickness * 0.5
    )
  }

  /**
   * Generates gradient colors between the two given colors.
   * @param {!Color} startColor The start color
   * @param {!Color} endColor The end color
   * @returns {!Array.<string>} The gradient color array
   */
  static generateColors(startColor, endColor) {
    const gradient = 25
    const colors = []
    const stepCount = gradient - 1

    for (let i = 0; i < gradient; i++) {
      const r = (startColor.r * (stepCount - i) + endColor.r * i) / stepCount
      const g = (startColor.g * (stepCount - i) + endColor.g * i) / stepCount
      const b = (startColor.b * (stepCount - i) + endColor.b * i) / stepCount
      const a = (startColor.a * (stepCount - i) + endColor.a * i) / stepCount
      colors[i] = `rgba(${r | 0},${g | 0},${b | 0},${a | 0})`
    }
    colors.reverse()
    return colors
  }
}

/**
 * This class draws the nodes in a circular-sector style.
 */
export class DemoNodeStyle extends NodeStyleBase {
  color
  thickness

  /**
   * Initializes a new DemoNodeStyle.
   * @param color ? The given color
   * @param thickness ? The thickness of the segment
   * @param {!Color} [color]
   * @param {number} [thickness]
   */
  constructor(color, thickness) {
    super()
    this.color = color || Color.DARK_ORANGE
    this.thickness = thickness || 20
  }

  /**
   * Creates the visual for a node.
   * @param {!IRenderContext} context The render context
   * @param {!INode} node The given node
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    // This implementation creates a CanvasContainer and uses it for the rendering of the node.
    const path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')

    const cache = this.createRenderDataCache(context, node)
    this.render(path, node, cache)
    return new SvgVisual(path)
  }

  /**
   * Updates the visual for a node.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @param {!INode} node The given node
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(context, node)
    // check if something changed
    if (newCache.equals(newCache, oldCache)) {
      // nothing changed, return the old visual
      return oldVisual
    }
    return this.createVisual(context, node)
  }

  /**
   * Creates an object containing all necessary data to create a node visual.
   * @param {!IRenderContext} context The render context
   * @param {!INode} node The given node
   * @returns {!NodeStyleCache} The render data cache
   */
  createRenderDataCache(context, node) {
    const selection = context.canvasComponent.selection
    const selected = selection !== null && selection.isSelected(node)
    return {
      nodeCenter: node.layout.center,
      circleCenter: (node.tag && node.tag.center) || Point.ORIGIN,
      thickness: this.thickness,
      color: this.color,
      circleNodeSize: node.tag && node.tag.circleNodeSize,
      selected,
      nodeLayout: node.layout.toRect(),
      equals: (self, other) =>
        self.nodeCenter.equals(other.nodeCenter) &&
        self.circleCenter.equals(other.circleCenter) &&
        self.thickness === other.thickness &&
        self.color === other.color &&
        self.circleNodeSize === other.circleNodeSize &&
        self.selected === other.selected &&
        self.nodeLayout.equals(other.nodeLayout)
    }
  }

  /**
   * Renders the given node.
   * @param {!Element} container The svg container
   * @param {!INode} node The given node
   * @param {!NodeStyleCache} cache The render data cache object
   */
  render(container, node, cache) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    let pathData
    const nodeCenter = node.layout.center
    if (node.tag && node.tag.circleNodeSize > 2 && node.tag.center) {
      const circleCenter = node.tag.center
      const delta = nodeCenter.subtract(circleCenter)
      const currentAngle = Math.atan2(delta.y, delta.x)
      const radius = delta.vectorLength
      const height = this.thickness
      const smallRadius = radius - height * 0.5
      const largeRadius = radius + height * 0.5
      const angle2 = Math.PI / node.tag.circleNodeSize
      pathData = `M${Math.cos(currentAngle - angle2) * smallRadius + circleCenter.x}
          ${Math.sin(currentAngle - angle2) * smallRadius + circleCenter.y}
          A${smallRadius} ${smallRadius} 0 ${angle2 * 2 > Math.PI ? '1 ' : '0 '}1
          ${Math.cos(currentAngle + angle2) * smallRadius + circleCenter.x}
          ${Math.sin(currentAngle + angle2) * smallRadius + circleCenter.y}
          L${Math.cos(currentAngle + angle2) * largeRadius + circleCenter.x}
          ${Math.sin(currentAngle + angle2) * largeRadius + circleCenter.y}
          A${largeRadius} ${largeRadius} 0 ${angle2 * 2 > Math.PI ? '1 ' : '0 '}0
          ${Math.cos(currentAngle - angle2) * largeRadius + circleCenter.x}
          ${Math.sin(currentAngle - angle2) * largeRadius + circleCenter.y} Z`
    } else {
      const nodeWidth = node.layout.width
      pathData = `M ${nodeCenter.x} ${nodeCenter.y} m -${nodeWidth / 2}, 0 a ${nodeWidth / 2},${
        nodeWidth / 2
      } 0 1,0 ${nodeWidth},0 a ${nodeWidth / 2},${nodeWidth / 2} 0 1,0 -${nodeWidth},0`
    }

    const color = cache.selected
      ? 'red'
      : `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a / 255})`
    container.setAttribute('fill', color)
    container.setAttribute('stroke', 'white')
    container.setAttribute('d', pathData)
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * @param {!IInputModeContext} context The canvas context
   * @param {!Point} location The point to test
   * @param {!INode} node The given node
   * @returns {boolean} True if the node has been hit, false otherwise
   */
  isHit(context, location, node) {
    if (node.tag && node.tag.center) {
      const circleCenter = node.tag.center

      const delta = node.layout.center.subtract(circleCenter)
      const radius = delta.vectorLength
      const angle = Math.PI / node.tag.circleNodeSize

      const height = this.thickness

      const smallRadius = radius - height * 0.5
      const largeRadius = radius + height * 0.5

      const hitDelta = location.subtract(circleCenter)
      const hitRadius = hitDelta.vectorLength

      if (
        hitRadius > largeRadius + context.hitTestRadius ||
        hitRadius < smallRadius - context.hitTestRadius
      ) {
        return false
      }

      return Math.acos(delta.normalized.scalarProduct(hitDelta.normalized)) < angle
    } else {
      return GeomUtilities.ellipseContains(node.layout.toRect(), location, 0)
    }
  }
}

/**
 * Install a visual representation of a highlight decoration for the edges such that the edge highlight is drawn
 * below the node group.
 */
export class HighlightManager extends GraphHighlightIndicatorManager {
  edgeHighlightGroup = null

  /**
   * Creates a new instance and configures the node and edge styles used for highlighting.
   */
  constructor() {
    super()
    this.nodeStyle = new DemoNodeStyle(Color.RED)
    this.edgeStyle = new IndicatorEdgeStyleDecorator({
      wrapped: new DemoEdgeStyle(6, Color.RED, Color.GOLD)
    })
  }

  /**
   * Installs the manager on the canvas.
   * Adds the highlight group
   * @param {!CanvasComponent} canvas
   */
  install(canvas) {
    if (canvas instanceof GraphComponent) {
      // create a new group for the edge highlight that lies below the node group
      const graphModelManager = canvas.graphModelManager
      graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NONE
      this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.nodeGroup)
    }
    super.install(canvas)
  }

  /**
   * Uninstalls the manager from the canvas
   * removes the highlight groups
   * @param {!CanvasComponent} canvas
   */
  uninstall(canvas) {
    super.uninstall(canvas)
    if (this.edgeHighlightGroup) {
      this.edgeHighlightGroup.remove()
      this.edgeHighlightGroup = null
    }
  }

  /**
   * Retrieves the Canvas Object group to use for the given item.
   * @param {!IModelItem} item The given item
   * @returns {?ICanvasObjectGroup}
   */
  getCanvasObjectGroup(item) {
    if (IEdge.isInstance(item)) {
      return this.edgeHighlightGroup
    }
    return super.getCanvasObjectGroup(item)
  }
}

/**
 * Returns the points of the given path.
 * @param {!GeneralPath} path The given path
 * @returns {!Array.<Point>} The array of points of the given path
 */
function getPathPoints(path) {
  if (path === null) {
    return []
  }
  const points = new List()
  const pathCursor = path.createCursor()
  const coordinates = [0, 0, 0, 0, 0, 0]
  let moveX = 0
  let moveY = 0
  while (pathCursor.moveNext()) {
    const current = pathCursor.getCurrent(coordinates)
    let lastX
    let lastY
    switch (current) {
      default:
      case PathType.MOVE_TO:
        moveX = coordinates[0]
        moveY = coordinates[1]
        lastX = moveX
        lastY = moveY
        break
      case PathType.LINE_TO:
        lastX = coordinates[0]
        lastY = coordinates[1]
        break
      case PathType.QUAD_TO:
        lastX = coordinates[2]
        lastY = coordinates[3]
        break
      case PathType.CUBIC_TO:
        lastX = coordinates[4]
        lastY = coordinates[5]
        break
      case PathType.CLOSE:
        lastX = moveX
        lastY = moveY
        break
    }
    points.add(new Point(lastX, lastY))
  }
  return points.toArray()
}

/**
 * Calculates the control points for the given edge.
 * @param {!IEdge} edge The given edge
 * @returns {!Array.<Point>} The control points of the edge
 */
function calculateControlPoints(edge) {
  const controlPoints = []
  // add the source port
  controlPoints.push(edge.sourcePort.location)
  // add all edge bends
  edge.bends.forEach((bend) => {
    controlPoints.push(new Point(bend.location.x, bend.location.y))
  })
  // add the target port
  const targetLocation = edge.targetPort.location
  controlPoints.push(targetLocation)

  // check if the control points can create piecewise bezier curves, if not duplicate the target port
  if (controlPoints.length % 3 === 0) {
    controlPoints.push(targetLocation)
  } else if (controlPoints.length % 3 === 2) {
    controlPoints.push(targetLocation)
    controlPoints.push(targetLocation)
  }
  return controlPoints
}
