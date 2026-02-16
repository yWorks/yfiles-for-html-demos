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
  type Constructor,
  EdgeSegmentPortLocationModel,
  IList,
  IPortLocationModel,
  type IPortLocationModelParameter,
  List,
  MarkupExtension,
  type TypeMetadata,
  XmlName
} from '@yfiles/yfiles'
import { YfilesCommon_3_0_XamlNS, YfilesCommonXamlNS } from './GraphMLCompatibility'

export function configureRenamings(callback: (oldName: XmlName, newName: XmlName) => void) {
  const nameMappings = new Map<string, string>()
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

export function configureExtensions(
  callback: <T>(type: Constructor<T>, metadata: TypeMetadata<T>) => void
) {
  createMetadata(
    GenericPortLocationParameterExtension,
    { properties: { Model: { type: IPortLocationModel } } },
    callback
  )
  createMetadata(
    GenericPortLocationModelExtension,
    { properties: { LocationParameters: { type: IList<IPortLocationModelParameter> } } },
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

function createMetadata<T>(
  type: Constructor<T>,
  metadata: TypeMetadata<T>,
  callback: <T>(type: Constructor<T>, metadata: TypeMetadata<T>) => void,
  ns: string = YfilesCommon_3_0_XamlNS
): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  metadata.name = (type as Function).name
  metadata.xmlNamespace = ns
  callback(type, metadata)
}

// region Compatibility classes for GenericPortLocationModel

class GenericPortLocationParameterExtension extends MarkupExtension {
  private _Index: number = 0

  get Index(): number {
    return this._Index
  }

  set Index(value: number) {
    this._Index = value
  }

  private _Model: IPortLocationModel | null = null

  get Model(): IPortLocationModel | null {
    return this._Model
  }

  set Model(value: IPortLocationModel | null) {
    this._Model = value
  }

  provideValue(): any {
    return (this._Model as CompositePortLocationModel).locationParameters.at(this._Index)
  }
}

class GenericPortLocationModelExtension extends MarkupExtension {
  private _LocationParameters: IList<IPortLocationModelParameter> =
    new List<IPortLocationModelParameter>()

  get LocationParameters(): IList<IPortLocationModelParameter> {
    return this._LocationParameters
  }

  provideValue(): any {
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
  private _Index: number = 0

  get Index(): number {
    return this._Index
  }

  set Index(value: number) {
    this._Index = value
  }

  private _Model: IPortLocationModel | null = null

  get Model(): IPortLocationModel | null {
    return this._Model
  }

  set Model(value: IPortLocationModel | null) {
    this._Model = value
  }

  private _Ratio: number = 0

  get Ratio(): number {
    return this._Ratio
  }

  set Ratio(value: number) {
    this._Ratio = value
  }

  provideValue(): any {
    let portModel = this._Model as EdgeSegmentPortLocationModel
    if (portModel == null) {
      portModel = EdgeSegmentPortLocationModel.INSTANCE
    }
    //2.6. always stored the index and ratio from the source side
    return portModel.createParameterFromSource(this._Index, this._Ratio)
  }
}

// endregion
