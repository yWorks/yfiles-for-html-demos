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
import {
  Fill,
  GeneralPath,
  GraphComponent,
  INode,
  IRenderContext,
  Matrix,
  NodeStyleBase,
  Point,
  Rect,
  ShapeNodeStyle,
  Stroke,
  SvgExport,
  SvgVisual,
  Visual
} from 'yfiles'

const CONTENT_RECT_MARGINS = 50
const MIN_NODE_SIZE = 5
const MAX_ZOOM_CHANGE_THRESHOLD = 3

/**
 * This group node style creates a visualization of its children if used in the context of folding.
 * The contents are scaled and rendered within the bounds of the node.
 */
export default class DeepZoomGroupNodeStyle extends NodeStyleBase {
  /**
   * Sets the fill for this group node.
   * @param fill The new fill value
   * @type {!Fill}
   */
  set fill(fill) {
    this.updateBackgroundColors(fill, this._stroke)
  }

  /**
   * Sets the stroke for this group node.
   * @param stroke The new stroke value
   * @type {!Stroke}
   */
  set stroke(stroke) {
    this.updateBackgroundColors(this._fill, stroke)
  }

  /**
   * Creates a new group node style with the given fill and stroke.
   * @param {!Fill} fill The fill value
   * @param {!Stroke} stroke The stroke value
   */
  constructor(fill, stroke) {
    super()
    this.backGroundStyle = new ShapeNodeStyle()
    this.updateBackgroundColors(fill, stroke)
  }

  /**
   * Updates the style of the group node based on the given fill and stroke.
   * The backGroundStyle is used for rendering the background shape of the
   * group node.
   * @param {!Fill} fill The fill value
   * @param {!Stroke} stroke The stroke value
   */
  updateBackgroundColors(fill, stroke) {
    this._fill = fill
    this._stroke = stroke
    this.backGroundStyle = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: fill,
      stroke: stroke
    })
  }

  /**
   * Creates a visual of the given node. The visual consists of the background of the node and, if
   * the node has been zoomed out, an image that shows the content of the node.
   * @param {!IRenderContext} renderContext The renderContext to be used
   * @param {!INode} node The node to be rendered
   * @returns {!SvgVisual} {SvgVisual} The SvgVisual for this group node
   */
  createVisual(renderContext, node) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const innerGroup = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const nodeContentsRenderingGroup = window.document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    )

    g.appendChild(innerGroup)
    innerGroup.appendChild(nodeContentsRenderingGroup)
    SvgVisual.setTranslate(innerGroup, node.layout.x, node.layout.y)
    nodeContentsRenderingGroup['data-zoom'] = renderContext.zoom

    // if the group node appears large enough, render its contents as svg image
    if (renderContext.zoom * Math.max(node.layout.width, node.layout.height) > MIN_NODE_SIZE) {
      const graph = renderContext.canvasComponent.graph

      // create a copy of the direct children of this node by using a non-expanded folding view.
      const tempView = graph.foldingView.manager.createFoldingView(
        graph.foldingView.getMasterItem(node),
        () => false
      )

      const tempGraphComponent = new GraphComponent()
      tempGraphComponent.graph = tempView.graph
      tempGraphComponent.updateContentRect({ margins: CONTENT_RECT_MARGINS })

      const allBounds = new Rect(
        0,
        0,
        tempGraphComponent.contentRect.width,
        tempGraphComponent.contentRect.height
      )

      // configure a rendering of the groups contents
      const svgExport = new SvgExport(tempGraphComponent.contentRect)

      // By default, the rendering has a zoom of one and the contained nodes are their 'true' sizes in world coordinates.
      // Thus, the image needs to be scaled down to the apparent size of the group node
      svgExport.zoom =
        renderContext.zoom *
        Math.max(
          0.00001,
          Math.min(node.layout.width / allBounds.width, node.layout.height / allBounds.height)
        )

      // actually create the svg element
      const svg = svgExport.exportSvg(tempGraphComponent)

      // clean up
      tempGraphComponent.cleanUp()
      tempView.dispose()

      // scale and translate the visual group to fit the displaying node
      const transform = computeTransform(node, allBounds)
      transform.applyTo(nodeContentsRenderingGroup)
      // cache the bounds
      nodeContentsRenderingGroup['data-allbounds'] = allBounds

      nodeContentsRenderingGroup.appendChild(svg)
    }

    // create a background visualisation for this group node, i.e. a border around the contents
    const backgroundVisual = this.backGroundStyle.renderer
      .getVisualCreator(node, this.backGroundStyle)
      .createVisual(renderContext)

    const backgroundGroup = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    backgroundGroup.setAttribute('opacity', String(4 / renderContext.zoom - 0.02))
    backgroundGroup.childVisual = backgroundVisual
    backgroundGroup.appendChild(backgroundVisual.svgElement)
    // prepend the background so that it is always drawn behind the group node contents
    g.prepend(backgroundGroup)

    return new SvgVisual(g)
  }

  /**
   * Updates the current visual instead of creating a new one.
   * @param {!IRenderContext} renderContext The renderContext to be used
   * @param {!Visual} oldVisual The visual instance to be updated
   * @param {!INode} node The node to be rendered
   * @returns {!SvgVisual} {SvgVisual} The SvgVisual for this group node
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual.svgElement

    const backgroundGroup = container.firstChild
    const innerGroup = container.lastElementChild
    const contentGroup = innerGroup.firstElementChild

    const renderedZoom = contentGroup['data-zoom']

    if (
      renderedZoom > MAX_ZOOM_CHANGE_THRESHOLD * renderContext.zoom ||
      renderedZoom < renderContext.zoom / MAX_ZOOM_CHANGE_THRESHOLD
    ) {
      return this.createVisual(renderContext, node)
    }
    this.backGroundStyle.renderer
      .getVisualCreator(node, this.backGroundStyle)
      .updateVisual(renderContext, backgroundGroup.childVisual)

    if (contentGroup) {
      const allBounds = contentGroup['data-allbounds']
      if (allBounds) {
        const transform = computeTransform(node, allBounds)
        transform.applyTo(contentGroup)
      }
    }

    SvgVisual.setTranslate(innerGroup, node.layout.x, node.layout.y)

    return oldVisual
  }

  /**
   * Delegates intersection calculation onto the backgroundStyle that is used for actual drawing.
   * @param {!INode} node The node that has to be tested for intersections
   * @param {!Point} inner The first point of the line that is inside the shape
   * @param {!Point} outer The second point of the line that is outside the shape
   * @returns {!Point} {Point} The coordinates of the intersection point, if an intersection was found
   */
  getIntersection(node, inner, outer) {
    return this.backGroundStyle.renderer
      .getShapeGeometry(node, this.backGroundStyle)
      .getIntersection(inner, outer)
  }

  /**
   * Delegates outline calculation onto the backgroundStyle that is used for actual drawing.
   * @returns {?GeneralPath} {GeneralPath | null} The outline or null if no outline can be provided.
   * @param {!INode} node
   */
  getOutline(node) {
    return this.backGroundStyle.renderer.getShapeGeometry(node, this.backGroundStyle).getOutline()
  }
}

/**
 * Computes the transform for the rendering of the subgraph to fit the node that displays it.
 * @param {!INode} subGraphDisplayNode The group node whom contents have to be scaled
 * @param {!Rect} actualSubGraphBounds The actual bounds of the group node
 * @returns {!Matrix} {Matrix} The transformation matrix
 */
function computeTransform(subGraphDisplayNode, actualSubGraphBounds) {
  const layout = subGraphDisplayNode.layout
  const width = layout.width
  const height = layout.height
  const scale = Math.min(width / actualSubGraphBounds.width, height / actualSubGraphBounds.height)
  return new Matrix(
    scale,
    0,
    0,
    scale,
    (width - actualSubGraphBounds.width * scale) * 0.5 - actualSubGraphBounds.x * scale,
    (height - actualSubGraphBounds.height * scale) * 0.5 - actualSubGraphBounds.y * scale
  )
}
