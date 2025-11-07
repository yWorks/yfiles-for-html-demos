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
  BaseClass,
  Color,
  Font,
  GeneralPath,
  GeometryUtilities,
  IVisualCreator,
  Point,
  SvgVisual,
  TextRenderSupport,
  YList
} from '@yfiles/yfiles'
import { colorSets } from '@yfiles/demo-app/demo-styles'

const GRADIENT_START = Color.from(colorSets['demo-palette-42'].fill)
const GRADIENT_END = Color.from(colorSets['demo-palette-44'].fill)

/**
 * Sets the value of the attribute with the given name for the given element.
 * @param e The Element for which an attribute value is set.
 * @param name The name of the attribute to set.
 * @param value The value of the attribute to set.
 */
function setAttribute(e, name, value) {
  e.setAttribute(name, value.toString())
}

/**
 * This visual draws a Voronoi diagram.
 */
export class VoronoiVisual extends BaseClass(IVisualCreator) {
  clusters
  voronoiDiagram

  /**
   * Creates a new VoronoiVisual that draws the faces of the given voronoi diagram.
   */
  constructor(voronoiDiagram, clusters) {
    super()
    this.voronoiDiagram = voronoiDiagram
    this.clusters = clusters
  }

  /**
   * Creates the Voronoi visual.
   * @param context The context that describes where the visual will be used
   * @returns The visual for the Voronoi diagram
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const colors = generateColors(
      GRADIENT_START,
      GRADIENT_END,
      this.voronoiDiagram.voronoiFaces.length + 1
    )

    this.voronoiDiagram.voronoiFaces.forEach((face, index) => {
      const svgPath = face.createSvgPath()
      const color = colors[index]
      setAttribute(svgPath, 'fill', `rgb(${color.r},${color.g},${color.b})`)
      setAttribute(svgPath, 'stroke', 'none')
      setAttribute(svgPath, 'stroke-width', '20')
      container.appendChild(svgPath)
    })

    this.clusters.centroids.forEach((point) => {
      VoronoiVisual.drawClusterCenter(point, container)
    })

    return new SvgVisual(container)
  }

  /**
   * Updates the Voronoi visual
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   * @returns The visual for the Voronoi diagram
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }

  /**
   * Draws an X on the given coordinate.
   * @param point The given coordinates
   * @param container The svg container
   */
  static drawClusterCenter(point, container) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const offset = 15
    const d = `M${point.x - offset},${point.y - offset} L${point.x + offset},${point.y + offset} M${point.x + offset},${point.y - offset} L${point.x - offset},${point.y + offset}`
    setAttribute(path, 'd', d)
    setAttribute(path, 'stroke', '#363020')
    setAttribute(path, 'stroke-width', '4')
    container.appendChild(path)
  }
}

/**
 * This visual creates a polygon around the nodes that belong to the same cluster.
 */
export class PolygonVisual extends BaseClass(IVisualCreator) {
  clusters
  drawCenter
  startColor
  endColor

  /**
   * Creates a new instance.
   * @param drawCenter Whether to draw an X at the center.
   * @param clusters The clusters to draw.
   * @param clusters.number The number of clusters.
   * @param clusters.clustering The layout of the nodes contained in the clusters.
   * @param clusters.centroids The center of the clusters.
   */
  constructor(drawCenter, clusters) {
    super()
    this.drawCenter = drawCenter
    this.clusters = clusters
    this.startColor = GRADIENT_START
    this.endColor = GRADIENT_END
  }

  /**
   * Creates the polygonal visual containing the nodes that belong to the same cluster.
   * @param context The context that describes where the visual will be used
   * @returns The polygonal visual
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
        clusterNodeBounds.forEach((layout) => {
          const offset = 0
          const x = layout.x
          const y = layout.y
          const height = layout.height
          const width = layout.width
          points.add(new Point(x - offset, y - offset))
          points.add(new Point(x - offset, y + height + offset))
          points.add(new Point(x + width + offset, y - offset))
          points.add(new Point(x + width + offset, y + height + offset))
        })

        const convexHull = GeometryUtilities.getConvexHull(points)
        const firstPoint = convexHull.at(0)
        generalPath.moveTo(firstPoint.x, firstPoint.y)
        for (let j = 1; j < convexHull.size; j++) {
          const nextPoint = convexHull.at(j)
          generalPath.lineTo(nextPoint.x, nextPoint.y)
        }
        generalPath.close()
        generalPath = generalPath.createSmoothedPath(50)

        const cluster = generalPath.createSvgPath()
        setAttribute(cluster, 'fill', `rgb(${color.r},${color.g},${color.b})`)
        setAttribute(cluster, 'stroke', `rgb(${color.r},${color.g},${color.b})`)
        setAttribute(cluster, 'stroke-linejoin', 'round')
        setAttribute(cluster, 'stroke-width', '30')

        element.appendChild(cluster)
      } else {
        const cluster = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
        const layout = clusterNodeBounds[0]
        setAttribute(cluster, 'cx', layout.center.x)
        setAttribute(cluster, 'cy', layout.center.y)
        setAttribute(cluster, 'rx', (layout.width + 10) * 0.5)
        setAttribute(cluster, 'ry', (layout.height + 10) * 0.5)
        setAttribute(cluster, 'fill', `rgb(${color.r},${color.g},${color.b})`)
        setAttribute(cluster, 'stroke', `rgb(${color.r},${color.g},${color.b})`)
        element.appendChild(cluster)
      }
    }

    if (this.drawCenter) {
      for (const point of this.clusters.centroids) {
        VoronoiVisual.drawClusterCenter(point, element)
      }
    }

    return new SvgVisual(element)
  }

  /**
   * Updates the polygonal containing the nodes that belong to the same cluster.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   * @returns The polygonal diagram
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}

/**
 * Creates the coordinate axis of the dendrogram.
 * This is only used for Hierarchical Clustering.
 */
export class AxisVisual extends BaseClass(IVisualCreator) {
  rect

  constructor(rect) {
    super()
    this.rect = rect
  }

  /**
   * Creates the polygonal visual containing the nodes that belong to the same cluster.
   * @param context The context that describes where the visual will be used
   * @returns The polygonal visual
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    const offset = 20
    const verticalOffset = 4
    const color = 'rgb(51,102,153)'
    setAttribute(rect, 'x', this.rect.x - offset)
    setAttribute(rect, 'y', this.rect.y - offset)
    setAttribute(rect, 'width', this.rect.width + 2 * offset)
    setAttribute(rect, 'height', this.rect.height + offset - verticalOffset)
    setAttribute(rect, 'stroke', color)
    setAttribute(rect, 'stroke-width', '3')
    setAttribute(rect, 'fill', 'none')
    container.appendChild(rect)

    const division = 20

    let j = 0
    for (let i = this.rect.maxY - verticalOffset; i >= this.rect.y - division; i -= division) {
      const marks = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
      setAttribute(marks, 'x1', this.rect.x - offset - 5)
      setAttribute(marks, 'y1', i)
      setAttribute(marks, 'x2', this.rect.x - offset + 5)
      setAttribute(marks, 'y2', i)
      setAttribute(marks, 'stroke', color)
      setAttribute(marks, 'stroke-width', '2')
      container.appendChild(marks)

      const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.textContent = j.toString()

      const textSize = TextRenderSupport.measureText(
        text.textContent,
        new Font({ fontFamily: 'Arial', fontSize: 8, fontWeight: 'bold' })
      )
      setAttribute(text, 'transform', 'translate(4 14)')
      setAttribute(text, 'font-size', '14px')
      setAttribute(text, 'font-family', 'Arial')
      setAttribute(text, 'fill', color)
      setAttribute(text, 'x', this.rect.x - offset - 10 - 2 * textSize.width)
      setAttribute(text, 'y', i - textSize.height)
      container.appendChild(text)
      j += division
    }

    return new SvgVisual(container)
  }

  /**
   * Updates the polygonal containing the nodes that belong to the same cluster.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   * @returns The polygonal diagram
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}

/**
 * Creates the visualization for the cut-off.
 * A red line with a label for the cut-off value.
 * This is only used for Hierarchical Clustering.
 */
export class CutoffVisual extends BaseClass(IVisualCreator) {
  maxY
  rectangle
  cutOffValue

  constructor(rectangle, maxY) {
    super()
    this.rectangle = rectangle
    this.maxY = maxY
    this.rectangle = rectangle
    this.maxY = maxY
    this.cutOffValue = Math.ceil(this.maxY - this.rectangle.center.y + 1)
  }

  /**
   * Creates the time frame rectangle.
   * @param context The context that describes where the visual will be used
   */
  createVisual(context) {
    const svgNamespace = 'http://www.w3.org/2000/svg'
    const container = document.createElementNS(svgNamespace, 'g')
    const cutOffLine = document.createElementNS(svgNamespace, 'rect')
    setAttribute(cutOffLine, 'x', '0')
    setAttribute(cutOffLine, 'y', '0')
    setAttribute(cutOffLine, 'width', this.rectangle.width.toString())
    setAttribute(cutOffLine, 'height', '2')
    setAttribute(cutOffLine, 'stroke', 'firebrick')
    setAttribute(cutOffLine, 'stroke-width', '1')
    setAttribute(cutOffLine, 'fill', 'firebrick')
    container.appendChild(cutOffLine)

    const font = new Font({ fontSize: 14, fontWeight: 'bold' })

    const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = `Cut-off:  ${this.cutOffValue}`
    setAttribute(text, 'fill', 'firebrick')
    font.applyTo(text)
    const textSize = TextRenderSupport.measureText(text.textContent, font)
    setAttribute(text, 'x', this.rectangle.width + 5)
    setAttribute(text, 'y', textSize.height * 0.5 - 2)
    container.appendChild(text)

    setAttribute(container, 'transform', `translate(${this.rectangle.x} ${this.rectangle.y})`)
    return new SvgVisual(container)
  }

  /**
   * Updates the time frame rectangle to improve performance.
   * @param context The context that describes where the visual will be used
   * @param oldVisual The old visual
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}

/**
 * Generates random colors for nodes and edges.
 * @param startColor The start color
 * @param endColor The end color
 * @param gradientCount The number of gradient steps
 * @returns An array or random gradient colors
 */
export function generateColors(startColor, endColor, gradientCount) {
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
