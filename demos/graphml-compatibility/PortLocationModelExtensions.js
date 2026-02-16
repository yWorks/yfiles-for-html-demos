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
import {
  CompositePortLocationModel,
  EdgeSegmentPortLocationModel,
  IList,
  IPortLocationModel,
  List,
  MarkupExtension,
  XmlName
} from '@yfiles/yfiles'
import { YfilesCommon_3_0_XamlNS, YfilesCommonXamlNS } from './GraphMLCompatibility'

export function configureRenamings(callback) {
  const nameMappings = new Map()
  nameMappings.set(
    'BendAnchoredParameterExtension',
    'BendAnchoredPortLocationModelParameterExtension'
  )
  nameMappings.set('PathRatioParameterExtension', 'EdgePathPortLocationModelParameterExtension')
  nameMappings.set('SegmentRatioPortLocationModel', 'EdgeSegmentPortLocationModel')
  nameMappings.forEach((value, key) =>
    callback(new XmlName(key, YfilesCommon_3_0_XamlNS), new XmlName(value, YfilesCommonXamlNS))
  )
}

export function configureExtensions(callback) {
  createMetadata(
    GenericPortLocationParameterExtension,
    { properties: { Model: { type: IPortLocationModel } } },
    callback
  )
  createMetadata(
    GenericPortLocationModelExtension,
    { properties: { LocationParameters: { type: IList } } },
    callback
  )
  createMetadata(
    SegmentRatioParameterExtension,
    {
      properties: {
        Index: { type: Number, default: 0 },
        Ratio: { type: Number, default: 0 },
        Model: { type: IPortLocationModel, default: null }
      }
    },
    callback
  )
}

function createMetadata(type, metadata, callback, ns = YfilesCommon_3_0_XamlNS) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  metadata.name = type.name
  metadata.xmlNamespace = ns
  callback(type, metadata)
}

// region Compatibility classes for GenericPortLocationModel

class GenericPortLocationParameterExtension extends MarkupExtension {
  _Index = 0

  get Index() {
    return this._Index
  }

  set Index(value) {
    this._Index = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    return this._Model.locationParameters.at(this._Index)
  }
}

class GenericPortLocationModelExtension extends MarkupExtension {
  _LocationParameters = new List()

  get LocationParameters() {
    return this._LocationParameters
  }

  provideValue() {
    const compositeLabelModel = new CompositePortLocationModel()

    this._LocationParameters.forEach((m) => {
      compositeLabelModel.addParameter(m)
    })
    return compositeLabelModel
  }
}

// endregion

// region Compatibility classes for SegmentRatioPortLocationModel

class SegmentRatioParameterExtension extends MarkupExtension {
  _Index = 0

  get Index() {
    return this._Index
  }

  set Index(value) {
    this._Index = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  _Ratio = 0

  get Ratio() {
    return this._Ratio
  }

  set Ratio(value) {
    this._Ratio = value
  }

  provideValue() {
    let portModel = this._Model
    if (portModel == null) {
      portModel = EdgeSegmentPortLocationModel.INSTANCE
    }
    //2.6. always stored the index and ratio from the source side
    return portModel.createParameterFromSource(this._Index, this._Ratio)
  }
}

// endregion
