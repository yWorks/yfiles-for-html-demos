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
  BaseClass,
  EdgeStyleDecorationInstaller,
  GeneralPath,
  ICanvasContext,
  ICanvasObject,
  ICanvasObjectGroup,
  IEdge,
  ISelectionIndicatorInstaller,
  PolylineEdgeStyle,
  PolylineEdgeStyleRenderer,
  StyleDecorationZoomPolicy
} from 'yfiles'

/**
 * Custom renderer that renders a line segment for collinear control point triples
 */
class SelectionRenderer extends PolylineEdgeStyleRenderer {
  /**
   * @returns {!GeneralPath}
   */
  createPath() {
    const pathPoints = IEdge.getPathPoints(this.edge)
    const gp = new GeneralPath(pathPoints.size + 1)
    gp.moveTo(pathPoints.get(0))

    for (let i = 1; i < pathPoints.size; ++i) {
      if (i % 3 === 2) {
        // Skip to the next triple
        gp.moveTo(pathPoints.get(i))
      } else {
        // Draw a line to the next control pint in the triple
        gp.lineTo(pathPoints.get(i))
      }
    }
    return gp
  }

  /**
   * @param {!GeneralPath} path
   * @returns {!GeneralPath}
   */
  cropPath(path) {
    // Don't crop
    return path
  }
}

/**
 * Custom decoration decorator that adds a rendering of the curves control point segments
 * This implementation adds as a decorator for an existing decorator and just adds the control point rendering on top.
 */
export class BezierSelectionIndicatorInstaller extends BaseClass(ISelectionIndicatorInstaller) {
  /**
   * The style for the control point segments
   * We just use a polyline edge style with a custom renderer so that we can reuse most of the existing rendering implementations.
   * @type {!PolylineEdgeStyle}
   */
  static get selectionDecoratorStyle() {
    return new PolylineEdgeStyle({
      stroke: '1px dashed lightgrey',
      renderer: new SelectionRenderer()
    })
  }

  coreImpl
  decorator

  /**
   * Create a new instance that decorates the `coreImpl`
   * @param {?ISelectionIndicatorInstaller} coreImpl The core indicator that is again decorated by this instance
   */
  constructor(coreImpl) {
    super()
    this.coreImpl = coreImpl
    this.decorator = new EdgeStyleDecorationInstaller({
      edgeStyle: BezierSelectionIndicatorInstaller.selectionDecoratorStyle,
      zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
    })
  }

  /**
   * Combines the rendering by the wrapped core indicator with our own control segment rendering
   * @param {!ICanvasContext} context
   * @param {!ICanvasObjectGroup} group
   * @param {!object} item
   * @returns {!ICanvasObject}
   */
  addCanvasObject(context, group, item) {
    const newGroup = group.addGroup()
    // Add the visualization from the core selection decorator
    if (this.coreImpl) {
      this.coreImpl.addCanvasObject(context, newGroup, item)
    }
    // Add our own decoration on top
    this.decorator.addCanvasObject(context, newGroup, item)
    return newGroup
  }
}
