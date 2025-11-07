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
  type EdgeSides,
  type ExteriorNodeLabelModelPosition,
  type InsetsConvertible,
  type InteriorNodeLabelModelPosition,
  type IPointConvertible,
  type NinePositionsEdgeLabelModelPosition,
  type PointConvertible,
  type StretchNodeLabelModelPosition
} from '@yfiles/yfiles'

export type SerializedLabelModelParameter =
  | {
      model: 'FreeEdgeLabelModel'
      modelProperties: SerializedFreeEdgeLabelModel
      angle: number
      ratio: number
      distance: number
    }
  | {
      model: 'BezierEdgePathLabelModel'
      modelProperties: SerializedBezierEdgePathLabelModel
      ratio: number
      distance: number
      absolute: boolean
    }
  | {
      model: 'BezierEdgeSegmentLabelModel'
      modelProperties: SerializedBezierEdgeSegmentLabelModel
      ratio: number
      distance: number
      atSource: boolean
      segmentIndex: number
    }
  | {
      model: 'EdgeSegmentLabelModel'
      modelProperties: SerializedEdgeSegmentLabelModel
      ratio: number
      sideOfEdge: EdgeSides
      placeAlongEdge: number
      segment: number
    }
  | {
      model: 'EdgePathLabelModel'
      modelProperties: SerializedEdgePathLabelModel
      ratio: number
      sideOfEdge: number
    }
  | {
      model: 'SmartEdgeLabelModel'
      modelProperties: SerializedSmartEdgeLabelModel
      ratio: number
      distance: number
      placeAlongEdge: number
      segment: number
    }
  | {
      model: 'NinePositionsEdgeLabelModel'
      modelProperties: SerializedNinePositionsEdgeLabelModel
      position: NinePositionsEdgeLabelModelPosition
    }
  | {
      model: 'ExteriorNodeLabelModel'
      position: ExteriorNodeLabelModelPosition
      modelProperties: { margins: InsetsConvertible }
    }
  | {
      model: 'FreeNodeLabelModel'
      angle: number
      layoutRatio: PointConvertible
      layoutOffset: PointConvertible
      labelRatio: PointConvertible
      labelOffset: PointConvertible
    }
  | {
      model: 'InteriorNodeLabelModel'
      position: InteriorNodeLabelModelPosition
      modelProperties: { padding: InsetsConvertible }
    }
  | {
      model: 'StretchNodeLabelModel'
      position: StretchNodeLabelModelPosition
      modelProperties: { padding: InsetsConvertible }
    }
  | {
      model: 'FreeLabelModel'
      parameterProps:
        | {
            parameterType: 'AbsoluteFreeLabelModelParameter'
            anchorLocation: PointConvertible
            angle: number
          }
        | {
            parameterType: 'AnchoredFreeLabelModelParameter'
            anchorLocation: IPointConvertible
            angle: number
          }
        | {
            parameterType: 'DynamicFreeLabelModelParameter'
            layout: {
              anchorX: number
              anchorY: number
              width: number
              height: number
              upX: number
              upY: number
            }
          }
    }
  | {
      model: 'FreePortLabelModel'
      angle: number
      locationOffset: PointConvertible
      labelRatio: PointConvertible
      labelOffset: PointConvertible
    }
  | {
      model: 'InsideOutsidePortLabelModel'
      outside: boolean
      modelProperties: { distance: number }
    }
export type SerializedBezierEdgePathLabelModel = {
  angle: number
  autoRotation: boolean
  autoSnapping: boolean
}
export type SerializedBezierEdgeSegmentLabelModel = {
  angle: number
  autoRotation: boolean
  autoSnapping: boolean
}
export type SerializedNinePositionsEdgeLabelModel = { angle: number; distance: number }
export type SerializedEdgePathLabelModel = {
  angle: number
  autoRotation: boolean
  distance: number
  offset: number
  sideOfEdge: EdgeSides
}
export type SerializedEdgeSegmentLabelModel = {
  angle: number
  autoRotation: boolean
  distance: number
  offset: number
  sideOfEdge: EdgeSides
}
export type SerializedSmartEdgeLabelModel = { angle: number; autoRotation: boolean }
export type SerializedFreeEdgeLabelModel = { edgeRelativeAngle: boolean }
