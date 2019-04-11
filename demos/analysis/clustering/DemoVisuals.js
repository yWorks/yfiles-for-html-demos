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
  BaseClass,
  Color,
  Font,
  FontWeight,
  GeneralPath,
  Geom,
  IRenderContext,
  IVisualCreator,
  SvgVisual,
  TextRenderSupport,
  Visual,
  YList,
  YPoint
} from 'yfiles'

/**
 * This visual draws a Voronoi diagram.
 */
export class VoronoiVisual extends BaseClass(IVisualCreator) {
  /**
   * Creates a new VoronoiVisual that draws the faces of the given voronoi diagram.
   * @param voronoiDiagram
   */
  constructor(voronoiDiagram) {
    super()
    this.$voronoiDiagram = voronoiDiagram
  }

  /**
   * Gets the clusters' object from which the visual will be created.
   * @return {Object}
   */
  get clusters() {
    return this.$clusters
  }

  /**
   * Sets the clusters' object from which the visual will be created.
   * @param {Object} clusters The clusters' object
   */
  set clusters(clusters) {
    this.$clusters = clusters
  }

  /**
   * Creates the Voronoi visual.
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @return {Visual} The visual for the Voronoi diagram
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const colors = generateColors(
      Color.ROYAL_BLUE,
      Color.LIGHT_CYAN,
      this.$voronoiDiagram.voronoiFaces.length + 1
    )

    this.$voronoiDiagram.voronoiFaces.forEach((face, index) => {
      const svgPath = face.createSvgPath()
      const color = colors[index]
      svgPath.setAttribute('fill', `rgb(${color.r},${color.g},${color.b})`)
      svgPath.setAttribute('stroke', 'none')
      svgPath.setAttribute('stroke-width', '20')
      container.appendChild(svgPath)
    })

    this.clusters.centroids.forEach(point => {
      VoronoiVisual.drawClusterCenter(point, container)
    })

    return new SvgVisual(container)
  }

  /**
   * Updates the Voronoi visual
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @param {Visual} oldVisual The old visual
   * @return {Visual}  The visual for the Voronoi diagram
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }

  /**
   * Draws an X on the given coordinate.
   * @param {YPoint} point The given coordinates
   * @param {Element} container The svg container
   */
  static drawClusterCenter(point, container) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const offset = 15
    const d = `M${point.x - offset},${point.y - offset} L${point.x + offset},${point.y +
      offset} M${point.x + offset},${point.y - offset} L${point.x - offset},${point.y + offset}`
    path.setAttribute('d', d)
    path.setAttribute('stroke', '#666666')
    path.setAttribute('stroke-width', '4')
    container.appendChild(path)
  }
}

/**
 * This visual creates a polygon around the nodes that belong to the same cluster.
 */
export class PolygonVisual extends BaseClass(IVisualCreator) {
  constructor(drawCenter) {
    super()
    this.startColor = Color.ROYAL_BLUE
    this.endColor = Color.LAVENDER
    this.$drawCenter = drawCenter
  }

  /**
   * Gets the clusters' object from which the visual will be created.
   * @return {Object}
   */
  get clusters() {
    return this.$clusters
  }

  /**
   * Sets the clusters' object from which the visual will be created.
   * @param {Object} clusters The clusters' object
   */
  set clusters(clusters) {
    this.$clusters = clusters
  }

  /**
   * Creates the polygonal visual containing the nodes that belong to the same cluster.
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @return {Visual} The polygonal visual
   */
  createVisual(context) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const colors = generateColors(this.startColor, this.endColor, this.clusters.number + 1)
    for (let i = 0; i < this.clusters.number; i++) {
      const clusterNodeBounds = this.clusters.clustering.get(i)

      const color = colors[i]
      let generalPath = new GeneralPath()
      if (clusterNodeBounds.length > 1) {
        const points = new YList()
        clusterNodeBounds.forEach(layout => {
          const offset = 0
          const x = layout.x
          const y = layout.y
          const height = layout.height
          const width = layout.width
          points.add(new YPoint(x - offset, y - offset))
          points.add(new YPoint(x - offset, y + height + offset))
          points.add(new YPoint(x + width + offset, y - offset))
          points.add(new YPoint(x + width + offset, y + height + offset))
        })

        const convexHull = Geom.calcConvexHull(points)
        generalPath.moveTo(convexHull.get(0).x, convexHull.get(0).y)
        for (let j = 1; j < convexHull.size; j++) {
          const nextPoint = convexHull.get(j)
          generalPath.lineTo(nextPoint.x, nextPoint.y)
        }
        generalPath.close()
        generalPath = generalPath.createSmoothedPath(50)

        const cluster = generalPath.createSvgPath()
        cluster.setAttribute('fill', `rgb(${color.r},${color.g},${color.b})`)
        cluster.setAttribute('stroke', `rgb(${color.r},${color.g},${color.b})`)
        cluster.setAttribute('stroke-linejoin', 'round')
        cluster.setAttribute('stroke-width', '30')

        element.appendChild(cluster)
      } else {
        const cluster = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
        const layout = clusterNodeBounds[0]
        cluster.setAttribute('cx', layout.center.x)
        cluster.setAttribute('cy', layout.center.y)
        cluster.setAttribute('rx', (layout.width + 10) * 0.5)
        cluster.setAttribute('ry', (layout.height + 10) * 0.5)
        cluster.setAttribute('fill', `rgb(${color.r},${color.g},${color.b})`)
        cluster.setAttribute('stroke', `rgb(${color.r},${color.g},${color.b})`)
        element.appendChild(cluster)
      }
    }

    if (this.$drawCenter) {
      this.clusters.centroids.forEach(point => {
        VoronoiVisual.drawClusterCenter(point, element)
      })
    }

    return new SvgVisual(element)
  }

  /**
   * Updates the polygonal containing the nodes that belong to the same cluster.
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @param {Visual} oldVisual The old visual
   * @return {Visual} The polygonal diagram
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}

/**
 * This visual creates a polygon around the nodes that belong to the same cluster.
 */
export class AxisVisual extends BaseClass(IVisualCreator) {
  constructor(maxY, rect) {
    super()
    this.maxY = maxY
    this.rect = rect
  }

  /**
   * Creates the polygonal visual containing the nodes that belong to the same cluster.
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @return {Visual} The polygonal visual
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const offset = 20
    const verticalOffset = 4
    const color = 'rgb(51,102,153)'
    rect.setAttribute('x', this.rect.x - offset)
    rect.setAttribute('y', this.rect.y - offset)
    rect.setAttribute('width', this.rect.width + 2 * offset)
    rect.setAttribute('height', this.rect.height + offset - verticalOffset)
    rect.setAttribute('stroke', color)
    rect.setAttribute('stroke-width', '3')
    rect.setAttribute('fill', 'none')
    container.appendChild(rect)

    const division = 20

    let j = 0
    for (let i = this.rect.maxY - verticalOffset; i >= this.rect.y - division; i -= division) {
      const marks = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
      marks.setAttribute('x1', this.rect.x - offset - 5)
      marks.setAttribute('y1', i)
      marks.setAttribute('x2', this.rect.x - offset + 5)
      marks.setAttribute('y2', i)
      marks.setAttribute('stroke', color)
      marks.setAttribute('stroke-width', '2')
      container.appendChild(marks)

      const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.textContent = j

      const textSize = TextRenderSupport.measureText(
        text.textContent,
        new Font({
          fontFamily: 'Arial',
          fontSize: 8,
          fontWeight: FontWeight.BOLD
        })
      )
      text.setAttribute('transform', 'translate(4 14)')
      text.setAttribute('font-size', '14px')
      text.setAttribute('font-family', 'Arial')
      text.setAttribute('fill', color)
      text.setAttribute('x', this.rect.x - offset - 10 - 2 * textSize.width)
      text.setAttribute('y', i - textSize.height)
      container.appendChild(text)
      j += division
    }

    return new SvgVisual(container)
  }

  /**
   * Updates the polygonal containing the nodes that belong to the same cluster.
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @param {Visual} oldVisual The old visual
   * @return {Visual} The polygonal diagram
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}

/**
 * Creates the visual rectangle that determines the current time window that will be examined.
 */
export class CutoffVisual extends BaseClass(IVisualCreator) {
  constructor(rectangle, maxY) {
    super()
    this.rectangle = rectangle
    this.maxY = maxY
    this.$cutOffValue = Math.ceil(this.maxY - this.rectangle.center.y + 1)
  }

  /**
   * Gets the value of the cut in the dendrogram component.
   * @type {number}
   */
  get cutOffValue() {
    return this.$cutOffValue
  }

  /**
   * Sets the value of the cut in the dendrogram component.
   * @type {number}
   */
  set cutOffValue(value) {
    this.$cutOffValue = value
  }

  /**
   * Creates the time frame rectangle.
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @return {SvgVisual}
   */
  createVisual(context) {
    const svgNamespace = 'http://www.w3.org/2000/svg'
    const container = document.createElementNS(svgNamespace, 'g')
    const cutOffLine = document.createElementNS(svgNamespace, 'rect')
    cutOffLine.setAttribute('x', '0')
    cutOffLine.setAttribute('y', '0')
    cutOffLine.setAttribute('width', this.rectangle.width.toString())
    cutOffLine.setAttribute('height', '2')
    cutOffLine.setAttribute('stroke', 'firebrick')
    cutOffLine.setAttribute('stroke-width', '1')
    cutOffLine.setAttribute('fill', 'firebrick')
    container.appendChild(cutOffLine)

    const font = new Font({
      fontSize: 14,
      fontWeight: FontWeight.BOLD
    })

    const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = `Cut-off:  ${this.cutOffValue}`
    text.setAttribute('fill', 'firebrick')
    font.applyTo(text)
    const textSize = TextRenderSupport.measureText(text.textContent, font)
    text.setAttribute('x', this.rectangle.width + 5)
    text.setAttribute('y', textSize.height * 0.5 - 2)
    container.appendChild(text)

    container.setAttribute('transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)
    return new SvgVisual(container)
  }

  /**
   * Updates the time frame rectangle to improve performance.
   * @param {IRenderContext} context The context that describes where the visual will be used
   * @param {Visual} oldVisual The old visual
   * @return {SvgVisual}
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}

/**
 * Generates random colors for nodes and edges.
 * @param {Color} startColor The start color
 * @param {Color} endColor The end color
 * @param {number} gradientCount The number of gradient steps
 * @return {Array} An array or random gradient colors
 */
function generateColors(startColor, endColor, gradientCount) {
  const colors = []
  const stepCount = gradientCount - 1

  for (let i = 0; i < gradientCount; i++) {
    const r = (startColor.r * (stepCount - i) + endColor.r * i) / stepCount
    const g = (startColor.g * (stepCount - i) + endColor.g * i) / stepCount
    const b = (startColor.b * (stepCount - i) + endColor.b * i) / stepCount
    const a = (startColor.a * (stepCount - i) + endColor.a * i) / stepCount
    colors[i] = new Color(r | 0, g | 0, b | 0, a | 0)
  }
  return colors.reverse()
}
