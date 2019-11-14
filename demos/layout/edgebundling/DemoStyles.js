/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * This class draws the edges with cubic bezier curves. Also, the edges are drawn with gradient colors from red that
   * starts from the source node of the edge to blue that ends to the target node of the edge.
   */
  class DemoEdgeStyle extends yfiles.styles.EdgeStyleBase {
    /**
     * Initializes a new instance of the {@link DemoEdgeStyle} class.
     * @param {number} pathThickness The thickness of the edge
     * @param {yfiles.view.Color} startColor The starting color of the gradient
     * @param {yfiles.view.Color} endColor The end color of the gradient
     */
    constructor(pathThickness, startColor, endColor) {
      super()
      this.pathThickness = pathThickness || 2
      this.startColor = startColor || yfiles.view.Color.DARK_BLUE
      this.endColor = endColor || yfiles.view.Color.SKY_BLUE
    }

    /**
     * Creates the visual for an edge.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned
     * @return {yfiles.view.SvgVisual}
     */
    createVisual(context, edge) {
      // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      // Get the necessary data for rendering of the edge
      const cache = this.createRenderDataCache(context, edge)

      // Render the edge
      this.render(g, cache, edge)

      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Re-renders the edge using the old visual for performance reasons.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.view.SvgVisual} oldVisual The old visual
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned
     * @return {yfiles.view.Visual}
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
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.graph.IEdge} edge The given edge
     * @return {Object} The render data cache
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
     * @param {Element} container The svg element
     * @param {Object} cache The render data cache object
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned
     */
    render(container, cache, edge) {
      // store information with the visual on how we created it
      container['data-renderDataCache'] = cache

      const gradientColors = DemoEdgeStyle.generateColors(this.startColor, this.endColor)
      const selectionColors = DemoEdgeStyle.generateColors(
        yfiles.view.Color.RED,
        yfiles.view.Color.GOLD
      )
      if (edge.bends.size > 1) {
        const controlPoints = calculateControlPoints(edge)
        // for each pairwise bezier curve create a general path that will have a different gradient fill color
        let lastPoint = edge.sourcePort.location
        for (let i = 0; i < controlPoints.length - 3; i += 3) {
          const generalPath = new yfiles.geometry.GeneralPath()
          generalPath.moveTo(lastPoint)
          generalPath.cubicTo(controlPoints[i + 1], controlPoints[i + 2], controlPoints[i + 3])
          const path = generalPath.createSvgPath()
          path.setAttribute('fill', 'none')
          const colorIndex = Math.floor(
            i * (gradientColors.length - 1) / (controlPoints.length - 1)
          )
          path.setAttribute(
            'stroke',
            !cache.selected ? gradientColors[colorIndex] : selectionColors[colorIndex]
          )
          path.setAttribute('stroke-width', !cache.selected ? cache.pathThickness : '5')
          container.appendChild(path)
          lastPoint = controlPoints[i + 3]
        }
      } else {
        // we want to have gradient colors such that red starts from the source node and blue ends at the target node
        // split the path in lines and assign each line a different gradient fill color
        const points = getPathPoints(cache.path)
        // if the edge is straight-line, split in two parts such that one is blue and one is red
        const midPoint = new yfiles.geometry.Point(
          (points[0].x + points[1].x) / 2,
          (points[0].y + points[1].y) / 2
        )
        points.splice(1, 0, midPoint)
        for (let i = 1; i < points.length; i++) {
          const line = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
          line.setAttribute('x1', points[i - 1].x)
          line.setAttribute('y1', points[i - 1].y)
          line.setAttribute('x2', points[i].x)
          line.setAttribute('y2', points[i].y)
          line.setAttribute('fill', 'none')
          const colorIndex = Math.floor(i * (gradientColors.length - 1) / (points.length - 1))
          line.setAttribute(
            'stroke',
            !cache.selected ? gradientColors[colorIndex] : selectionColors[colorIndex]
          )
          line.setAttribute('stroke-width', !cache.selected ? cache.pathThickness : '5')
          container.appendChild(line)
        }
      }
    }

    /**
     * Creates a {@link yfiles.geometry.GeneralPath} from the edge's bends.
     * @param {yfiles.graph.IEdge} edge The edge to create the path for
     * @return {yfiles.geometry.GeneralPath} A {@link yfiles.geometry.GeneralPath} following the edge
     */
    getPath(edge) {
      // Create a general path from the locations of the ports and the bends of the edge.
      const path = new yfiles.geometry.GeneralPath()
      if (edge.bends.size > 1) {
        const controlPoints = calculateControlPoints(edge)
        path.moveTo(edge.sourcePort.location)
        for (let i = 0; i < controlPoints.length - 3; i += 3) {
          path.cubicTo(controlPoints[i + 1], controlPoints[i + 2], controlPoints[i + 3])
        }
      } else {
        path.moveTo(edge.sourcePort.location)
        edge.bends.forEach(bend => {
          path.lineTo(bend.location)
        })
        path.lineTo(edge.targetPort.location)
      }
      return path
    }

    /**
     * Determines whether the visual representation of the edge has been hit at the given location.
     * @param {yfiles.input.IInputModeContext} canvasContext The input mode context
     * @param {yfiles.geometry.Point} p The point to test
     * @param {yfiles.graph.IEdge} edge The edge to which this style instance is assigned
     * @return {boolean} True if the edge has been hit, false otherwise
     */
    isHit(canvasContext, p, edge) {
      return this.getPath(edge).pathContains(
        p,
        canvasContext.hitTestRadius + this.pathThickness * 0.5
      )
    }

    /**
     * Generates gradient colors between the two given colors.
     * @param {yfiles.view.Color} startColor The start color
     * @param {yfiles.view.Color} endColor The end color
     * @return {Array} The gradient color array
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
  class DemoNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * Initializes a new DemoNodeStyle.
     * @param {yfiles.view.Color} color The given color
     */
    constructor(color) {
      super()
      this.color = color || yfiles.view.Color.DARK_ORANGE
    }

    /**
     * Creates the visual for a node.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.graph.INode} node The given node
     * @return {yfiles.view.SvgVisual}
     */
    createVisual(context, node) {
      // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const cache = DemoNodeStyle.createRenderDataCache(context, node)
      this.render(g, node, cache)
      return new yfiles.view.SvgVisual(g)
    }

    /**
     * Updates the visual for a node.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.view.SvgVisual} oldVisual The old visual
     * @param {yfiles.graph.INode} node The given node
     * @return {yfiles.view.SvgVisual}
     */
    updateVisual(context, oldVisual, node) {
      const container = oldVisual.svgElement
      // get the data with which the oldvisual was created
      const oldCache = container['data-renderDataCache']
      // get the data for the new visual
      const newCache = DemoNodeStyle.createRenderDataCache(context, node)
      // check if something changed
      if (newCache.equals(newCache, oldCache)) {
        // nothing changed, return the old visual
        return oldVisual
      }
      return this.createVisual(context, node)
    }

    /**
     * Creates an object containing all necessary data to create a node visual.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.graph.INode} node The given node
     * @return {Object} The render data cache
     */
    static createRenderDataCache(context, node) {
      const selection = context.canvasComponent.selection
      const selected = selection !== null && selection.isSelected(node)
      const circleId = node.tag && node.tag.circleId ? node.tag.circleId : -1
      const path = getVisualShape(node)
      return {
        size: node.layout.toSize(),
        circleId,
        selected,
        path,
        equals: (self, other) =>
          self.size.equals(other.size) &&
          self.selected === other.selected &&
          self.circleId === other.circleId &&
          self.path.hasSameValue(other.path)
      }
    }

    /**
     * Renders the given node.
     * @param {Element} g The svg container
     * @param {yfiles.graph.INode} node The given node
     * @param {Object} cache The render data cache object
     */
    render(g, node, cache) {
      // store information with the visual on how we created it
      g['data-renderDataCache'] = cache

      // check if the layout is circular
      const path = getVisualShape(node).createSvgPath()
      const color = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a})`
      path.setAttribute('stroke', '#fff')
      path.setAttribute('fill', color)
      g.appendChild(path)

      if (cache.selected) {
        path.setAttribute('fill', 'red')
      }
    }

    /**
     * Determines whether the visual representation of the node has been hit at the given location.
     * @param {yfiles.input.IInputModeContext} context The canvas context
     * @param {yfiles.geometry.Point} location The point to test
     * @param {yfiles.graph.INode} node The given node
     * @return {boolean} True if the node has been hit, false otherwise
     */
    isHit(context, location, node) {
      const path = getVisualShape(node)
      return (
        path.areaContains(location, context.hitTestRadius) ||
        path.pathContains(location, context.hitTestRadius)
      )
    }
  }

  /**
   * Install a visual representation of a highlight decoration for the edges such that the edge highlight is drawn
   * below the node group.
   */
  class HighlightManager extends yfiles.view.HighlightIndicatorManager {
    /**
     * Initializes the HighlightManager.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
     */
    constructor(graphComponent) {
      super(graphComponent)
      // create a new group for the edge highlight that lies below the node group
      const graphModelManager = graphComponent.graphModelManager
      graphModelManager.hierarchicNestingPolicy = yfiles.view.HierarchicNestingPolicy.NONE
      this.edgeHighlightGroup = graphModelManager.contentGroup.addGroup()
      this.edgeHighlightGroup.below(graphModelManager.nodeGroup)
    }

    /**
     * Retrieves the Canvas Object group to use for the given item.
     * @param {T} item The given item
     * @return {yfiles.view.ICanvasObjectGroup}
     */
    getCanvasObjectGroup(item) {
      if (yfiles.graph.IEdge.isInstance(item)) {
        return this.edgeHighlightGroup
      }
      return super.getCanvasObjectGroup(item)
    }

    /**
     * Callback used by install to retrieve the installer for a given item.
     * @param {T} item The item to find an installer for
     * @returns {yfiles.view.ICanvasObjectInstaller}
     */
    getInstaller(item) {
      if (yfiles.graph.IEdge.isInstance(item)) {
        return new yfiles.view.EdgeStyleDecorationInstaller({
          edgeStyle: new DemoEdgeStyle(6, yfiles.view.Color.RED, yfiles.view.Color.GOLD),
          zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES
        })
      } else if (yfiles.graph.INode.isInstance(item)) {
        return new yfiles.view.NodeStyleDecorationInstaller({
          nodeStyle: new DemoNodeStyle(yfiles.view.Color.RED),
          margins: 0,
          zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.WORLD_COORDINATES
        })
      }
      return super.getInstaller(item)
    }
  }

  /**
   * Returns the points of the given path.
   * @param {yfiles.geometry.GeneralPath} path The given path
   * @return {Array} The array of points of the given path
   */
  function getPathPoints(path) {
    if (path === null) {
      return []
    }
    const points = new yfiles.collections.List()
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
        case yfiles.geometry.PathType.MOVE_TO:
          moveX = coordinates[0]
          moveY = coordinates[1]
          lastX = moveX
          lastY = moveY
          break
        case yfiles.geometry.PathType.LINE_TO:
          lastX = coordinates[0]
          lastY = coordinates[1]
          break
        case yfiles.geometry.PathType.QUAD_TO:
          lastX = coordinates[2]
          lastY = coordinates[3]
          break
        case yfiles.geometry.PathType.CUBIC_TO:
          lastX = coordinates[4]
          lastY = coordinates[5]
          break
        case yfiles.geometry.PathType.CLOSE:
          lastX = moveX
          lastY = moveY
          break
      }
      points.add(new yfiles.geometry.Point(lastX, lastY))
    }
    return points.toArray()
  }

  /**
   * Calculates the control points for the given edge.
   * @param {yfiles.graph.IEdge} edge The given edge
   * @return {Array} The control points of the edge
   */
  function calculateControlPoints(edge) {
    const controlPoints = []
    // add the source port
    controlPoints.push(edge.sourcePort.location)
    // add all edge bends
    edge.bends.forEach(bend => {
      controlPoints.push(bend.location)
    })
    // add the target port
    controlPoints.push(edge.targetPort.location)

    // check if the control points can create piecewise bezier curves, if not duplicate the target port
    if (controlPoints.length % 3 === 0) {
      controlPoints.push(edge.targetPort.location)
    } else if (controlPoints.length % 3 === 2) {
      controlPoints.push(edge.targetPort.location)
      controlPoints.push(edge.targetPort.location)
    }
    return controlPoints
  }

  /**
   * Calculates the visual for the node as a general path.
   * @param {yfiles.graph.INode} node The given node
   * @return {yfiles.geometry.GeneralPath} The visual path for the given node
   */
  function getVisualShape(node) {
    const path = new yfiles.geometry.GeneralPath()
    // const circleNodes = DemoNodeStyle.getCircleNodes(context.canvasComponent.graph, node);
    if (node.tag && node.tag.circleId !== -1 && node.tag.center) {
      const x = node.layout.center.x
      const y = node.layout.center.y

      // calculate the circle's center
      const center = node.tag.center
      // calculate the circle's radius
      const radius = Math.sqrt((center.x - x) * (center.x - x) + (center.y - y) * (center.y - y))

      // calculate the node's angle
      let angle = Math.atan2(y - center.y, x - center.x) * 180 / Math.PI
      if (angle < 0) {
        angle += 360
      }
      // calculate how much space there exists for each node
      let offset = (360 - node.tag.circleNodes.length) / node.tag.circleNodes.length
      const startAngleInDegrees = angle - offset * 0.5
      const endAngleInDegrees = startAngleInDegrees + offset
      const startAngle = Math.PI * startAngleInDegrees / 180
      const endAngle = Math.PI * endAngleInDegrees / 180

      const innerRadius = radius
      const outerRadius = innerRadius + 25
      const p1 = calculatePointOnCircle(center, outerRadius, startAngle)
      const p2 = calculatePointOnCircle(center, innerRadius, startAngle)
      const p3 = calculatePointOnCircle(center, innerRadius, endAngle)
      const p4 = calculatePointOnCircle(center, outerRadius, endAngle)

      //  start   c1     c2      end
      // p1 \------|------|------/ p4
      //     \    c4     c3     /
      // p2   \----|------|----/ p3
      path.moveTo(p1.x, p1.y)
      offset = Math.PI * offset / 180 * 0.25
      const c1 = calculatePointOnCircle(center, outerRadius + 1, startAngle + offset)
      const c2 = calculatePointOnCircle(center, outerRadius + 1, endAngle - offset)
      path.cubicTo(c1.x, c1.y, c2.x, c2.y, p4.x, p4.y)
      path.lineTo(p3.x, p3.y)

      const c3 = calculatePointOnCircle(center, innerRadius + 1, endAngle - offset)
      const c4 = calculatePointOnCircle(center, innerRadius + 1, startAngle + offset)
      path.cubicTo(c3.x, c3.y, c4.x, c4.y, p2.x, p2.y)
      path.lineTo(p1.x, p1.y)
      path.close()
    } else {
      path.appendEllipse(node.layout, false)
    }
    return path
  }

  /**
   * Calculates the coordinates of the point on the circle at the given angle.
   * @param {yfiles.geometry.Point} center The center of the circle
   * @param {number} radius The radius of the circle
   * @param {number} angle The angle in radians
   * @return {yfiles.geometry.Point} The coordinates of the point on the circle at the given angle
   */
  function calculatePointOnCircle(center, radius, angle) {
    return new yfiles.geometry.Point(
      center.x + radius * Math.cos(angle),
      center.y + radius * Math.sin(angle)
    )
  }

  return {
    DemoEdgeStyle,
    DemoNodeStyle,
    HighlightManager
  }
})
