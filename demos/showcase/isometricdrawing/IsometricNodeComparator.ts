/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { type CanvasComponent, type INode, Matrix, Point } from '@yfiles/yfiles'
import { IsometricNodeStyle } from './IsometricNodeStyle'

/**
 * Orders nodes such their z-order in a graph component works well for the component's current
 * projection.
 */
export class IsometricNodeComparator {
  private canvasComponent: CanvasComponent
  private projection = new Matrix()
  private leftFaceVisible = false
  private backFaceVisible = false

  constructor(canvasComponent: CanvasComponent) {
    this.canvasComponent = canvasComponent
    this.update()
  }

  /**
   * Updates which faces are visible and therefore which corners should be used for the z-order comparison.
   * This method has to be called when the {@link CanvasComponent}'s projection has changed.
   */
  update(): void {
    const projection = this.canvasComponent.projection
    if (!projection.hasSameValue(this.projection)) {
      this.projection = projection
      const upVector = IsometricNodeStyle.calculateHeightVector(this.projection)
      this.leftFaceVisible = upVector.x > 0
      this.backFaceVisible = upVector.y > 0
    }
  }

  compare(n1: INode | null, n2: INode | null): number {
    if (!n1 && !n2) {
      return 0
    }
    if (!n1) {
      return -1
    }
    if (!n2) {
      return 1
    }
    const leftFaceVisible = this.leftFaceVisible
    const backFaceVisible = this.backFaceVisible

    let xViewCenter = Point.ORIGIN
    let yViewCenter = Point.ORIGIN
    let xViewRight = Point.ORIGIN
    let yViewRight = Point.ORIGIN
    let xViewLeft = Point.ORIGIN
    let yViewLeft = Point.ORIGIN
    if (leftFaceVisible && backFaceVisible) {
      xViewCenter = n1.layout.topLeft
      yViewCenter = n2.layout.topLeft
      xViewRight = n1.layout.bottomLeft
      yViewRight = n2.layout.bottomLeft
      xViewLeft = n1.layout.topRight
      yViewLeft = n2.layout.topRight
    } else if (!leftFaceVisible && backFaceVisible) {
      xViewCenter = n1.layout.topRight
      yViewCenter = n2.layout.topRight
      xViewRight = n1.layout.topLeft
      yViewRight = n2.layout.topLeft
      xViewLeft = n1.layout.bottomRight
      yViewLeft = n2.layout.bottomRight
    } else if (!leftFaceVisible && !backFaceVisible) {
      xViewCenter = n1.layout.bottomRight
      yViewCenter = n2.layout.bottomRight
      xViewRight = n1.layout.topRight
      yViewRight = n2.layout.topRight
      xViewLeft = n1.layout.bottomLeft
      yViewLeft = n2.layout.bottomLeft
    } else if (leftFaceVisible && !backFaceVisible) {
      xViewCenter = n1.layout.bottomLeft
      yViewCenter = n2.layout.bottomLeft
      xViewRight = n1.layout.bottomRight
      yViewRight = n2.layout.bottomRight
      xViewLeft = n1.layout.topLeft
      yViewLeft = n2.layout.topLeft
    }

    const sgnX = leftFaceVisible ? -1 : 1
    const sgnY = backFaceVisible ? -1 : 1

    const projectionMatrix = this.projection
    const dViewCenter = projectionMatrix
      .transform(yViewCenter)
      .subtract(projectionMatrix.transform(xViewCenter))

    // determine order in two steps:
    // 1) compare view coordinates of ViewCenter values to determine which node corners to compare in step 2
    // 2) compare the world coordinates of the corners found in step 1 considering which faces are visible
    if (dViewCenter.x < 0 && dViewCenter.y < 0) {
      const vector = yViewRight.subtract(xViewLeft)
      return vector.x * sgnX > 0 && vector.y * sgnY > 0 ? -1 : 1
    } else if (dViewCenter.x > 0 && dViewCenter.y > 0) {
      const vector = yViewLeft.subtract(xViewRight)
      return vector.x * sgnX < 0 && vector.y * sgnY < 0 ? 1 : -1
    } else if (dViewCenter.x > 0) {
      const vector = yViewCenter.subtract(xViewRight)
      return vector.x * sgnX > 0 && vector.y * sgnY > 0 ? -1 : 1
    } else {
      const vector = yViewRight.subtract(xViewCenter)
      return vector.x * sgnX < 0 && vector.y * sgnY < 0 ? 1 : -1
    }
  }
}
