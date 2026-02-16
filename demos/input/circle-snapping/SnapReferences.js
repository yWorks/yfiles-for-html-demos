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
import { GraphItemTypes, SnapCircle, SnapLine } from '@yfiles/yfiles'

/**
 * A circular snap reference around a given node with a given radius.
 */
export class NodeSnapCircle extends SnapCircle {
  node

  constructor(node, center, radius, startAngle, endAngle, weight, tag) {
    super(center, radius, startAngle, endAngle, weight, GraphItemTypes.NODE, tag)
    this.node = node
  }
}

/**
 * A snap line that radiates out from a given node.
 */
export class NodeSnapLine extends SnapLine {
  node

  constructor(node, visualizationType, coordinates, from, to, weight, snappableItems, tag) {
    super(
      visualizationType,
      coordinates,
      from,
      to,
      weight,
      snappableItems ?? GraphItemTypes.ALL,
      tag ?? null
    )
    this.node = node
  }
}

/**
 * A snap line that radiates out from a parent node between two neighboring child nodes bisecting
 * the angle between those child nodes.
 */
export class EqualAngleSnapLine extends SnapLine {
  parent
  firstSibling
  secondSibling
  centeredPoint

  constructor(
    parent,
    firstSibling,
    secondSibling,
    centeredPoint,
    visualizationType,
    coordinates,
    from,
    to,
    weight,
    snappableItems,
    tag
  ) {
    super(visualizationType, coordinates, from, to, weight, snappableItems, tag)

    this.parent = parent
    this.firstSibling = firstSibling
    this.secondSibling = secondSibling
    this.centeredPoint = centeredPoint
  }
}
