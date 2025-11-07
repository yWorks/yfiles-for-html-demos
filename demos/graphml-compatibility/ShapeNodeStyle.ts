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
import { GeneralPath, GeneralPathNodeStyle, yfiles } from '@yfiles/yfiles'

/**
 * The usage of yfiles.lang.Enum here is only for GraphML compatibility, and shouldn't be needed
 * elsewhere. For enums in your own application, use either TypeScript enums or a simple keyed
 * object with constants.
 */
const Enum = (yfiles as any).lang.Enum

export const ShapeNodeShape = (Enum as any)('ShapeNodeShape', {
  SHEARED_RECTANGLE: 100,
  SHEARED_RECTANGLE2: 101,
  TRAPEZ: 102,
  TRAPEZ2: 103,
  STAR5: 104,
  FAT_ARROW: 105,
  FAT_ARROW2: 106,
  STAR5_UP: 107
})

export class ShapeNodeStyles {
  // region predefined shapes
  private static readonly Star5IntrinsicAspectRatio = 1.0514622
  private static readonly Trapez = ShapeNodeStyles.createShearedShape(0.2, false, false, true, true)
  private static readonly Trapez2 = ShapeNodeStyles.createShearedShape(
    0.2,
    true,
    true,
    false,
    false
  )
  private static readonly FatArrow = ShapeNodeStyles.createFatArrow()
  private static readonly FatArrow2 = ShapeNodeStyles.createFatArrow2()
  private static readonly ShearedRectangle = ShapeNodeStyles.createShearedShape(
    0.2,
    true,
    false,
    true,
    false
  )
  private static readonly ShearedRectangle2 = ShapeNodeStyles.createShearedShape(
    0.2,
    false,
    true,
    false,
    true
  )
  private static readonly Star5: GeneralPath = ShapeNodeStyles.createStarPath(5, Math.PI, false)
  private static readonly IntrinsicStar5 = ShapeNodeStyles.createStarPath(5, Math.PI, true)
  private static readonly Star5Up: GeneralPath = ShapeNodeStyles.createStarPath(5, 0, false)
  private static readonly IntrinsicStar5Up = ShapeNodeStyles.createStarPath(5, 0, true)
  private static readonly Thing = ShapeNodeStyles.createThing()

  public static getPath(shape: number, keepIntrinsicAspectRatio: boolean): GeneralPath {
    switch (shape) {
      case ShapeNodeShape.TRAPEZ:
        return ShapeNodeStyles.Trapez
      case ShapeNodeShape.TRAPEZ2:
        return ShapeNodeStyles.Trapez2
      case ShapeNodeShape.FAT_ARROW:
        return ShapeNodeStyles.FatArrow
      case ShapeNodeShape.FAT_ARROW2:
        return ShapeNodeStyles.FatArrow2
      case ShapeNodeShape.SHEARED_RECTANGLE:
        return ShapeNodeStyles.ShearedRectangle
      case ShapeNodeShape.SHEARED_RECTANGLE2:
        return ShapeNodeStyles.ShearedRectangle2
      case ShapeNodeShape.STAR5:
        return keepIntrinsicAspectRatio ? ShapeNodeStyles.IntrinsicStar5 : ShapeNodeStyles.Star5
      case ShapeNodeShape.STAR5_UP:
        return keepIntrinsicAspectRatio ? ShapeNodeStyles.IntrinsicStar5Up : ShapeNodeStyles.Star5Up
      default:
        return ShapeNodeStyles.Thing
    }
  }

  public static getIntrinsicAspectRatio(shape: number): number {
    switch (shape) {
      case ShapeNodeShape.TRAPEZ:
      case ShapeNodeShape.TRAPEZ2:
      case ShapeNodeShape.FAT_ARROW:
      case ShapeNodeShape.FAT_ARROW2:
      case ShapeNodeShape.SHEARED_RECTANGLE:
      case ShapeNodeShape.SHEARED_RECTANGLE2:
        return 2
      case ShapeNodeShape.STAR5:
      case ShapeNodeShape.STAR5_UP:
        return ShapeNodeStyles.Star5IntrinsicAspectRatio
      default:
        return 1
    }
  }

  private static createThing() {
    {
      const path = new GeneralPath(6)
      path.moveTo(0, 0.2)
      path.quadTo(0.5, -0.2, 1, 0.2)
      path.lineTo(1, 0.8)
      path.quadTo(0.5, 1.2, 0, 0.8)
      path.close()

      return path
    }
  }

  private static createShearedShape(
    xRatio: number,
    useXRatioTopLeft: boolean,
    useXRatioTopRight: boolean,
    useXRatioBottomRight: boolean,
    useXRatioBottomLeft: boolean
  ): GeneralPath {
    const x = 0
    const y = 0
    const width = 1
    const height = 1
    const maxX = x + width
    const maxY = y + height
    const xLeftRatio = x + xRatio * width
    const xRightRatio = maxX - xRatio * width
    const slope = height / (width * xRatio)

    const topLeftX = useXRatioTopLeft ? xLeftRatio : x
    const topRightX = useXRatioTopRight ? xRightRatio : maxX
    const bottomRightX = useXRatioBottomRight ? xRightRatio : maxX
    const bottomLeftX = useXRatioBottomLeft ? xLeftRatio : x

    const noHorizontalLineTop = topLeftX >= topRightX
    const noHorizontalLineBottom = bottomLeftX >= bottomRightX

    const path = new GeneralPath(4)
    if (noHorizontalLineTop && noHorizontalLineBottom) {
      // use some empty path as returning null would switch unexpectedly to non-shape wrapping code
      path.moveTo((topLeftX + topRightX) * 0.5, y)
      path.lineTo((bottomLeftX + bottomRightX) * 0.5, maxY)
    } else if (noHorizontalLineTop) {
      // triangle with valid bottom line
      const dx = (bottomRightX - bottomLeftX) * 0.5
      const dy = dx * slope
      path.moveTo(bottomLeftX + dx, maxY - dy)
      path.lineTo(bottomRightX, maxY)
      path.lineTo(bottomLeftX, maxY)
    } else if (noHorizontalLineBottom) {
      // triangle with valid top line
      const dx = (topRightX - topLeftX) * 0.5
      const dy = dx * slope
      path.moveTo(topLeftX, y)
      path.lineTo(topRightX, y)
      path.lineTo(topLeftX + dx, y + dy)
    } else {
      path.moveTo(topLeftX, y)
      path.lineTo(topRightX, y)
      path.lineTo(bottomRightX, maxY)
      path.lineTo(bottomLeftX, maxY)
    }

    path.close()
    return path
  }

  private static createFatArrow2() {
    {
      const path = new GeneralPath(6)
      path.moveTo(0.1, 0)
      path.lineTo(1, 0)
      path.lineTo(0.9, 0.5)
      path.lineTo(1, 1)
      path.lineTo(0.1, 1)
      path.lineTo(0, 0.5)
      path.close()

      return path
    }
  }

  private static createFatArrow() {
    {
      const path = new GeneralPath(6)
      path.moveTo(0, 0)
      path.lineTo(0.9, 0)
      path.lineTo(1, 0.5)
      path.lineTo(0.9, 1)
      path.lineTo(0, 1)
      path.lineTo(0.1, 0.5)
      path.close()

      return path
    }
  }

  private static createStarPath(
    pointCount: number,
    initialAngle: number,
    keepIntrinsicAspectRatio: boolean
  ): GeneralPath {
    const path = GeneralPathNodeStyle.createStarPath(pointCount, 0.6, initialAngle)
    return keepIntrinsicAspectRatio
      ? GeneralPathNodeStyle.createAspectRatioInstance(path).path!
      : path
  }
  // endregion
}
