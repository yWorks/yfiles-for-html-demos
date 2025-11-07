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
  AbsoluteFreeLabelModelParameter,
  AnchoredFreeLabelModelParameter,
  BezierEdgePathLabelModel,
  BezierEdgePathLabelModelParameter,
  BezierEdgeSegmentLabelModel,
  BezierEdgeSegmentLabelModelParameter,
  DynamicFreeLabelModelParameter,
  EdgePathLabelModel,
  EdgePathLabelModelParameter,
  EdgeSegmentLabelModel,
  EdgeSegmentLabelModelParameter,
  ExteriorNodeLabelModel,
  ExteriorNodeLabelModelParameter,
  FreeEdgeLabelModel,
  FreeEdgeLabelModelParameter,
  FreeLabelModel,
  FreeNodeLabelModel,
  FreeNodeLabelModelParameter,
  FreePortLabelModel,
  FreePortLabelModelParameter,
  type ILabelModelParameter,
  InsideOutsidePortLabelModel,
  InsideOutsidePortLabelModelParameter,
  InteriorNodeLabelModel,
  InteriorNodeLabelModelParameter,
  NinePositionsEdgeLabelModel,
  NinePositionsEdgeLabelModelParameter,
  OrientedRectangle,
  PlaceAlongEdge,
  SmartEdgeLabelModel,
  SmartEdgeLabelModelParameter,
  StretchNodeLabelModel,
  StretchNodeLabelModelParameter
} from '@yfiles/yfiles'
import type { SerializedLabelModelParameter } from './label-model-serialization-types'

export function serializeLabelModelParameter(
  parameter: ILabelModelParameter
): SerializedLabelModelParameter | undefined {
  if (parameter instanceof FreeEdgeLabelModelParameter) {
    return {
      model: 'FreeEdgeLabelModel',
      angle: parameter.angle,
      ratio: parameter.ratio,
      distance: parameter.distance,
      modelProperties: { edgeRelativeAngle: parameter.model.edgeRelativeAngle }
    }
  } else if (parameter instanceof EdgePathLabelModelParameter) {
    return {
      model: 'EdgePathLabelModel',
      ratio: parameter.ratio,
      sideOfEdge: parameter.sideOfEdge,
      modelProperties: {
        angle: parameter.model.angle,
        autoRotation: parameter.model.autoRotation,
        distance: parameter.model.distance,
        offset: parameter.model.offset,
        sideOfEdge: parameter.model.sideOfEdge
      }
    }
  } else if (parameter instanceof EdgeSegmentLabelModelParameter) {
    return {
      model: 'EdgeSegmentLabelModel',
      ratio: parameter.ratio,
      sideOfEdge: parameter.sideOfEdge,
      placeAlongEdge: parameter.placeAlongEdge,
      segment: parameter.segment,
      modelProperties: {
        angle: parameter.model.angle,
        autoRotation: parameter.model.autoRotation,
        distance: parameter.model.distance,
        offset: parameter.model.offset,
        sideOfEdge: parameter.model.sideOfEdge
      }
    }
  } else if (parameter instanceof BezierEdgePathLabelModelParameter) {
    return {
      model: 'BezierEdgePathLabelModel',
      ratio: parameter.ratio,
      distance: parameter.distance,
      absolute: parameter.absolute,
      modelProperties: {
        angle: parameter.model.angle,
        autoRotation: parameter.model.autoRotation,
        autoSnapping: parameter.model.autoSnapping
      }
    }
  } else if (parameter instanceof BezierEdgeSegmentLabelModelParameter) {
    return {
      model: 'BezierEdgeSegmentLabelModel',
      ratio: parameter.ratio,
      distance: parameter.distance,
      atSource: parameter.atSource,
      segmentIndex: parameter.segmentIndex,
      modelProperties: {
        angle: parameter.model.angle,
        autoRotation: parameter.model.autoRotation,
        autoSnapping: parameter.model.autoSnapping
      }
    }
  } else if (parameter instanceof NinePositionsEdgeLabelModelParameter) {
    return {
      model: 'NinePositionsEdgeLabelModel',
      position: parameter.position,
      modelProperties: { angle: parameter.model.angle, distance: parameter.model.distance }
    }
  } else if (parameter instanceof SmartEdgeLabelModelParameter) {
    return {
      model: 'SmartEdgeLabelModel',
      ratio: parameter.ratio,
      distance: parameter.distance,
      placeAlongEdge: parameter.placeAlongEdge,
      segment: parameter.segment,
      modelProperties: { angle: parameter.model.angle, autoRotation: parameter.model.autoRotation }
    }
  } else if (parameter instanceof FreeNodeLabelModelParameter) {
    return {
      model: 'FreeNodeLabelModel',
      angle: parameter.angle,
      layoutRatio: [parameter.layoutRatio.x, parameter.layoutRatio.y],
      layoutOffset: [parameter.layoutOffset.x, parameter.layoutOffset.y],
      labelRatio: [parameter.labelRatio.x, parameter.labelRatio.y],
      labelOffset: [parameter.labelOffset.x, parameter.labelOffset.y]
    }
  } else if (parameter instanceof ExteriorNodeLabelModelParameter) {
    return {
      model: 'ExteriorNodeLabelModel',
      position: parameter.position,
      modelProperties: {
        margins: [
          parameter.model.margins.top,
          parameter.model.margins.right,
          parameter.model.margins.bottom,
          parameter.model.margins.left
        ]
      }
    }
  } else if (parameter instanceof InteriorNodeLabelModelParameter) {
    return {
      model: 'InteriorNodeLabelModel',
      position: parameter.position,
      modelProperties: {
        padding: [
          parameter.model.padding.top,
          parameter.model.padding.right,
          parameter.model.padding.bottom,
          parameter.model.padding.left
        ]
      }
    }
  } else if (parameter instanceof StretchNodeLabelModelParameter) {
    return {
      model: 'StretchNodeLabelModel',
      position: parameter.position,
      modelProperties: {
        padding: [
          parameter.model.padding.top,
          parameter.model.padding.right,
          parameter.model.padding.bottom,
          parameter.model.padding.left
        ]
      }
    }
  } else if (parameter instanceof AbsoluteFreeLabelModelParameter) {
    return {
      model: 'FreeLabelModel',
      parameterProps: {
        parameterType: 'AbsoluteFreeLabelModelParameter',
        anchorLocation: [parameter.anchorLocation.x, parameter.anchorLocation.y],
        angle: parameter.angle
      }
    }
  } else if (parameter instanceof AnchoredFreeLabelModelParameter) {
    return {
      model: 'FreeLabelModel',
      parameterProps: {
        parameterType: 'AnchoredFreeLabelModelParameter',
        anchorLocation: [parameter.anchorLocation.x, parameter.anchorLocation.y],
        angle: parameter.angle
      }
    }
  } else if (parameter instanceof DynamicFreeLabelModelParameter) {
    return {
      model: 'FreeLabelModel',
      parameterProps: {
        parameterType: 'DynamicFreeLabelModelParameter',
        layout: {
          anchorX: parameter.rectangle.anchorX,
          anchorY: parameter.rectangle.anchorY,
          width: parameter.rectangle.width,
          height: parameter.rectangle.height,
          upX: parameter.rectangle.upX,
          upY: parameter.rectangle.upY
        }
      }
    }
  } else if (parameter instanceof FreePortLabelModelParameter) {
    return {
      model: 'FreePortLabelModel',
      angle: parameter.angle,
      locationOffset: [parameter.locationOffset.x, parameter.locationOffset.y],
      labelRatio: [parameter.labelRatio.x, parameter.labelRatio.y],
      labelOffset: [parameter.labelOffset.x, parameter.labelOffset.y]
    }
  } else if (parameter instanceof InsideOutsidePortLabelModelParameter) {
    return {
      model: 'InsideOutsidePortLabelModel',
      outside: parameter.outside,
      modelProperties: { distance: parameter.model.distance }
    }
  } else {
    console.warn(`Serialization not supported for ${JSON.stringify(typeof parameter)}`)
  }
}

export function deserializeLabelModelParameter(serializedParameter: SerializedLabelModelParameter) {
  switch (serializedParameter.model) {
    case 'FreeEdgeLabelModel': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { model, modelProperties, ...options } = serializedParameter
      return new FreeEdgeLabelModel(modelProperties).createParameter(options)
    }
    case 'BezierEdgePathLabelModel': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { model, modelProperties, ...options } = serializedParameter
      return new BezierEdgePathLabelModel().createParameter(options)
    }
    case 'BezierEdgeSegmentLabelModel': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { model, modelProperties, atSource, ...options } = serializedParameter
      if (atSource) {
        return new BezierEdgeSegmentLabelModel(modelProperties).createParameterFromSource(options)
      } else {
        return new BezierEdgeSegmentLabelModel(modelProperties).createParameterFromTarget(options)
      }
    }
    case 'EdgeSegmentLabelModel': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { model, modelProperties, placeAlongEdge, ...options } = serializedParameter
      if (placeAlongEdge === PlaceAlongEdge.AT_TARGET) {
        return new EdgeSegmentLabelModel(modelProperties).createParameterFromTarget({
          segmentRatio: options.ratio,
          sideOfEdge: options.sideOfEdge,
          segmentIndex: options.segment
        })
      } else if (placeAlongEdge === PlaceAlongEdge.AT_SOURCE) {
        return new EdgeSegmentLabelModel(modelProperties).createParameterFromSource({
          segmentRatio: options.ratio,
          sideOfEdge: options.sideOfEdge,
          segmentIndex: options.segment
        })
      } else if (placeAlongEdge === PlaceAlongEdge.AT_CENTER) {
        return new EdgeSegmentLabelModel(modelProperties).createParameterFromCenter({
          segmentRatio: options.ratio
        })
      }
      break
    }
    case 'EdgePathLabelModel': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { model, modelProperties, ...options } = serializedParameter
      return new EdgePathLabelModel().createRatioParameter(options)
    }
    case 'SmartEdgeLabelModel': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { model, modelProperties, placeAlongEdge, ...options } = serializedParameter
      if (placeAlongEdge === PlaceAlongEdge.AT_TARGET) {
        return new SmartEdgeLabelModel(modelProperties).createParameterFromTarget({
          segmentRatio: options.ratio,
          distance: options.distance,
          segmentIndex: options.segment
        })
      } else if (placeAlongEdge === PlaceAlongEdge.AT_SOURCE) {
        return new SmartEdgeLabelModel(modelProperties).createParameterFromSource({
          segmentRatio: options.ratio,
          distance: options.distance,
          segmentIndex: options.segment
        })
      } else if (placeAlongEdge === PlaceAlongEdge.AT_CENTER) {
        return new SmartEdgeLabelModel(modelProperties).createParameterFromCenter({
          segmentRatio: options.ratio,
          distance: options.distance
        })
      }
      break
    }
    case 'NinePositionsEdgeLabelModel': {
      const { modelProperties, position } = serializedParameter
      return new NinePositionsEdgeLabelModel(modelProperties).createParameter(position)
    }
    case 'FreeNodeLabelModel': {
      const { ...options } = serializedParameter
      return FreeNodeLabelModel.INSTANCE.createParameter(options)
    }
    case 'ExteriorNodeLabelModel': {
      const { modelProperties, position } = serializedParameter
      return new ExteriorNodeLabelModel(modelProperties).createParameter(position)
    }
    case 'InteriorNodeLabelModel': {
      const { modelProperties, position } = serializedParameter
      return new InteriorNodeLabelModel(modelProperties).createParameter(position)
    }
    case 'StretchNodeLabelModel': {
      const { modelProperties, position } = serializedParameter
      return new StretchNodeLabelModel(modelProperties).createParameter(position)
    }
    case 'FreeLabelModel': {
      const parameterProps = serializedParameter.parameterProps
      switch (parameterProps.parameterType) {
        case 'AbsoluteFreeLabelModelParameter': {
          return FreeLabelModel.INSTANCE.createAbsolute(
            parameterProps.anchorLocation,
            parameterProps.angle
          )
        }
        case 'AnchoredFreeLabelModelParameter': {
          return FreeLabelModel.INSTANCE.createAnchored(
            parameterProps.anchorLocation,
            parameterProps.angle
          )
        }
        case 'DynamicFreeLabelModelParameter': {
          return FreeLabelModel.INSTANCE.createDynamic(new OrientedRectangle(parameterProps.layout))
        }
        default:
          return
      }
    }
    case 'FreePortLabelModel': {
      return FreePortLabelModel.INSTANCE.createParameter({
        locationOffset: serializedParameter.locationOffset,
        labelRatio: serializedParameter.labelRatio,
        labelOffset: serializedParameter.labelOffset,
        angle: serializedParameter.angle
      })
    }
    case 'InsideOutsidePortLabelModel':
      const { modelProperties, outside } = serializedParameter
      if (outside) {
        return new InsideOutsidePortLabelModel(modelProperties).createOutsideParameter()
      } else {
        return new InsideOutsidePortLabelModel(modelProperties).createInsideParameter()
      }
    default:
      return
  }
}
