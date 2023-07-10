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
import { CanvasComponent, Rect, ViewportLimiter } from 'yfiles'

/**
 * A viewport limiter implementation that limits panning to the client area if the whole
 * graph content rectangle fits and limits the panning to the content rectangle if any of it's
 * dimensions is larger than the suggested viewport
 */
export class ContentRectViewportLimiter extends ViewportLimiter {
  /**
   * Limits the viewport to the area which contains nodes.
   * @param canvas - The canvas control on which the viewport should be applied.
   * @param suggestedViewport - The suggested viewport.
   * @returns The actual limited viewport to use
   */
  limitViewport(canvas: CanvasComponent, suggestedViewport: Rect): Rect {
    const leftX = canvas.contentRect.x
    const rightX = canvas.contentRect.bottomRight.x
    const contentWidth = rightX - leftX
    const suggestedX = suggestedViewport.x

    let newX
    if (contentWidth > suggestedViewport.width) {
      newX = Math.max(leftX, Math.min(rightX - suggestedViewport.width, suggestedX))
    } else {
      if (suggestedX > leftX) {
        newX = leftX
      } else if (suggestedViewport.width + suggestedX > rightX) {
        newX = suggestedX
      } else {
        newX = -suggestedViewport.width + rightX
      }
    }

    const topY = canvas.contentRect.y
    const bottomY = canvas.contentRect.bottomLeft.y
    const contentHeight = bottomY - topY
    const suggestedY = suggestedViewport.y

    let newY
    if (contentHeight > suggestedViewport.height) {
      newY = Math.max(topY, Math.min(bottomY - suggestedViewport.height, suggestedY))
    } else {
      if (suggestedY > topY) {
        newY = topY
      } else if (suggestedViewport.height + suggestedY > bottomY) {
        newY = suggestedY
      } else {
        newY = -suggestedViewport.height + bottomY
      }
    }

    return new Rect(newX, newY, suggestedViewport.width, suggestedViewport.height)
  }
}
