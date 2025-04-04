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
import { GeneralPath, GeometryUtilities, NodeStyleBase, SvgVisual } from '@yfiles/yfiles'
import { getEntityData, isFraud } from '../entity-data'
import { nodeStyleMapping } from './graph-styles'
/**
 * A simple node style that visualizes a circular node with an icon.
 */
export class EntityNodeStyle extends NodeStyleBase {
  /**
   * Creates the visual for a circular node with an icon.
   */
  createVisual(_context, node) {
    const { x, y, width, height } = node.layout
    const halfWidth = width * 0.5
    const halfHeight = height * 0.5
    const entity = getEntityData(node)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // create circular base
    const ellipse = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    ellipse.setAttribute('cx', String(halfWidth))
    ellipse.setAttribute('cy', String(halfHeight))
    ellipse.setAttribute('rx', String(halfWidth))
    ellipse.setAttribute('ry', String(halfHeight))
    ellipse.setAttribute('stroke-width', isFraud(node) ? '3' : '2')
    this.updateStrokeAndFill(ellipse, entity)
    g.appendChild(ellipse)
    // add image
    const iconWidth = width * 0.6
    const iconHeight = height * 0.6
    const image = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
    image.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      nodeStyleMapping[entity.type].image
    )
    image.setAttribute('width', String(iconWidth))
    image.setAttribute('height', String(iconHeight))
    image.setAttribute('x', String(halfWidth - iconWidth * 0.5))
    image.setAttribute('y', String(halfHeight - iconHeight * 0.5))
    g.appendChild(image)
    // set the location
    SvgVisual.setTranslate(g, x, y)
    // store information with the visual on how we created it
    return SvgVisual.from(g, { fraud: entity.fraud ?? false })
  }
  /**
   * Re-renders the node using the old visual for performance reasons.
   */
  updateVisual(_context, oldVisual, node) {
    // get relevant data that might have changed
    const oldCache = oldVisual.tag
    const g = oldVisual.svgElement
    const entity = getEntityData(node)
    // update node color depending on the fraud state
    if (entity.fraud !== oldCache.fraud) {
      this.updateStrokeAndFill(g.firstElementChild, entity)
    }
    // update location
    const { x, y } = node.layout
    SvgVisual.setTranslate(g, x, y)
    oldVisual.tag = { fraud: entity.fraud ?? false }
    return oldVisual
  }
  /**
   * Gets the outline of the node, an ellipse in this case.
   * This allows the correct intersection calculation for edge paths, among others.
   */
  getOutline(node) {
    const outline = new GeneralPath()
    outline.appendEllipse(node.layout.toRect(), false)
    return outline
  }
  /**
   * Checks if a point hits the node's bounds. Considers HitTestRadius.
   */
  isHit(canvasContext, point, node) {
    return GeometryUtilities.ellipseContains(
      node.layout.toRect(),
      point,
      canvasContext.hitTestRadius
    )
  }
  /**
   * Checks if a node is inside a certain box. Considers HitTestRadius.
   */
  isInBox(context, box, node) {
    // early exit if not even the bounds are contained in the box
    if (!super.isInBox(context, box, node)) {
      return false
    }
    const eps = context.hitTestRadius
    const outline = this.getOutline(node)
    if (
      outline.pathIntersects(box, eps) ||
      (outline.pathContains(box.topLeft, eps) && outline.pathContains(box.bottomRight, eps))
    ) {
      return true
    }
    return (
      box.contains(node.layout.toRect().topLeft) && box.contains(node.layout.toRect().bottomRight)
    )
  }
  /**
   * Exact geometric check whether a point lies inside the circular node.
   */
  isInside(node, point) {
    return GeometryUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }
  /**
   * Updates the stroke and fill of the given element based on the type the associated node.
   */
  updateStrokeAndFill(ellipse, entity) {
    const type = entity.type
    const style = nodeStyleMapping[type]
    ellipse.setAttribute('fill', entity.fraud ?? false ? '#ff6c00' : style.fill)
    ellipse.setAttribute('stroke', entity.fraud ?? false ? 'slateblue' : style.stroke)
  }
}
