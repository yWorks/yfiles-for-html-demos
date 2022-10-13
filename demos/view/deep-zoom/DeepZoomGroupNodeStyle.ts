/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  private backGroundStyle: ShapeNodeStyle
  private _fill: Fill | undefined
  private _stroke: Stroke | undefined

  /**
   * Sets the fill for this group node.
   * @param fill The new fill value
   */
  set fill(fill: Fill) {
    this.updateBackgroundColors(fill, this._stroke!)
  }

  /**
   * Sets the stroke for this group node.
   * @param stroke The new stroke value
   */
  set stroke(stroke: Stroke) {
    this.updateBackgroundColors(this._fill!, stroke)
  }

  /**
   * Creates a new group node style with the given fill and stroke.
   * @param fill The fill value
   * @param stroke The stroke value
   */
  constructor(fill: Fill, stroke: Stroke) {
    super()
    this.backGroundStyle = new ShapeNodeStyle()
    this.updateBackgroundColors(fill, stroke)
  }

  /**
   * Updates the style of the group node based on the given fill and stroke.
   * The backGroundStyle is used for rendering the background shape of the
   * group node.
   * @param fill The fill value
   * @param stroke The stroke value
   * @private
   */
  private updateBackgroundColors(fill: Fill, stroke: Stroke) {
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
   * @param renderContext The renderContext to be used
   * @param node The node to be rendered
   * @return {SvgVisual} The SvgVisual for this group node
   */
  createVisual(renderContext: IRenderContext, node: INode): SvgVisual {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const innerGroup = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const nodeContentsRenderingGroup = window.document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    )

    g.appendChild(innerGroup)
    innerGroup.appendChild(nodeContentsRenderingGroup)
    SvgVisual.setTranslate(innerGroup, node.layout.x, node.layout.y)
    ;(nodeContentsRenderingGroup as any)['data-zoom'] = renderContext.zoom

    // if the group node appears large enough, render its contents as svg image
    if (renderContext.zoom * Math.max(node.layout.width, node.layout.height) > MIN_NODE_SIZE) {
      const graph = (renderContext.canvasComponent as GraphComponent).graph

      // create a copy of the direct children of this node by using a non-expanded folding view.
      const tempView = graph.foldingView!.manager.createFoldingView(
        graph.foldingView!.getMasterItem(node),
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
      const svg = svgExport.exportSvg(tempGraphComponent) as SVGElement

      // clean up
      tempGraphComponent.cleanUp()
      tempView.dispose()

      // scale and translate the visual group to fit the displaying node
      const transform = computeTransform(node, allBounds)
      transform.applyTo(nodeContentsRenderingGroup)
      // cache the bounds
      ;(nodeContentsRenderingGroup as any)['data-allbounds'] = allBounds

      nodeContentsRenderingGroup.appendChild(svg)
    }

    // create a background visualisation for this group node, i.e. a border around the contents
    const backgroundVisual = this.backGroundStyle.renderer
      .getVisualCreator(node, this.backGroundStyle)
      .createVisual(renderContext) as SvgVisual

    const backgroundGroup = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    backgroundGroup.setAttribute('opacity', String(4 / renderContext.zoom - 0.02))
    ;(backgroundGroup as any).childVisual = backgroundVisual
    backgroundGroup.appendChild(backgroundVisual.svgElement)
    // prepend the background so that it is always drawn behind the group node contents
    g.prepend(backgroundGroup)

    return new SvgVisual(g)
  }

  /**
   * Updates the current visual instead of creating a new one.
   * @param renderContext The renderContext to be used
   * @param oldVisual The visual instance to be updated
   * @param node The node to be rendered
   * @return {SvgVisual} The SvgVisual for this group node
   */
  updateVisual(renderContext: IRenderContext, oldVisual: Visual, node: INode): SvgVisual {
    const container = (oldVisual as SvgVisual).svgElement

    const backgroundGroup = container.firstChild! as SVGElement
    const innerGroup = container.lastElementChild!
    const contentGroup = innerGroup.firstElementChild as SVGGElement

    const renderedZoom: number = (contentGroup as any)['data-zoom']

    if (
      renderedZoom > MAX_ZOOM_CHANGE_THRESHOLD * renderContext.zoom ||
      renderedZoom < renderContext.zoom / MAX_ZOOM_CHANGE_THRESHOLD
    ) {
      return this.createVisual(renderContext, node)
    }
    this.backGroundStyle.renderer
      .getVisualCreator(node, this.backGroundStyle)
      .updateVisual(renderContext, (backgroundGroup as any).childVisual)

    if (contentGroup) {
      const allBounds: Rect = (contentGroup as any)['data-allbounds']
      if (allBounds) {
        const transform = computeTransform(node, allBounds)
        transform.applyTo(contentGroup)
      }
    }

    SvgVisual.setTranslate(innerGroup, node.layout.x, node.layout.y)

    return oldVisual as SvgVisual
  }

  /**
   * Delegates intersection calculation onto the backgroundStyle that is used for actual drawing.
   * @param node The node that has to be tested for intersections
   * @param inner The first point of the line that is inside the shape
   * @param outer The second point of the line that is outside the shape
   * @return {Point} The coordinates of the intersection point, if an intersection was found
   * @protected
   */
  protected getIntersection(node: INode, inner: Point, outer: Point): Point {
    return <Point>(
      this.backGroundStyle.renderer
        .getShapeGeometry(node, this.backGroundStyle)
        .getIntersection(inner, outer)
    )
  }

  /**
   * Delegates outline calculation onto the backgroundStyle that is used for actual drawing.
   * @return {GeneralPath | null} The outline or null if no outline can be provided.
   */
  protected getOutline(node: INode): GeneralPath | null {
    return this.backGroundStyle.renderer.getShapeGeometry(node, this.backGroundStyle).getOutline()
  }
}

/**
 * Computes the transform for the rendering of the subgraph to fit the node that displays it.
 * @param subGraphDisplayNode The group node whom contents have to be scaled
 * @param actualSubGraphBounds The actual bounds of the group node
 * @return {Matrix} The transformation matrix
 */
function computeTransform(subGraphDisplayNode: INode, actualSubGraphBounds: Rect): Matrix {
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
