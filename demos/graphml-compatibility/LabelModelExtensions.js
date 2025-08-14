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
  BaseClass,
  CompositeLabelModel,
  CompositeLabelModelParameter,
  EdgePathLabelModel,
  EdgeSegmentLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  ExteriorNodeLabelModelParameter,
  ExteriorNodeLabelModelPosition,
  FreeLabelModel,
  GraphMLMemberVisibility,
  GroupNodeLabelModel,
  ILabelModel,
  ILabelModelParameter,
  IList,
  Insets,
  InteriorNodeLabelModel,
  InteriorNodeLabelModelPosition,
  List,
  MarkupExtension,
  NinePositionsEdgeLabelModel,
  SmartEdgeLabelModel,
  StretchNodeLabelModel,
  StretchNodeLabelModelPosition,
  StretchStripeLabelModel,
  StripeLabelModel,
  XmlName,
  yfiles
} from '@yfiles/yfiles'
import { YfilesCommon_3_0_XamlNS, YfilesCommonXamlNS } from './GraphMLCompatibility'

/**
 * The usage of yfiles.lang.Enum here is only for GraphML compatibility, and shouldn't be needed
 * elsewhere. For enums in your own application, use either TypeScript enums or a simple keyed
 * object with constants.
 */
const Enum = yfiles.lang.Enum

export function configureRenamings(callback) {
  const nameMappings = new Map()
  nameMappings.set(
    'AnchoredLabelModelParameterExtension',
    'FreeLabelModelAnchoredParameterExtension'
  )
  nameMappings.set('FixedLabelModelParameterExtension', 'FreeLabelModelAbsoluteParameterExtension')
  nameMappings.set(
    'RatioAnchoredLabelModelParameterExtension',
    'FreeNodeLabelModelParameterExtension'
  )
  nameMappings.set(
    'PortAnchoredLabelModelParameterExtension',
    'FreePortLabelModelParameterExtension'
  )
  nameMappings.set('SliderParameterLocation', 'SliderParameterLocations')
  nameMappings.forEach((value, key) =>
    callback(new XmlName(key, YfilesCommon_3_0_XamlNS), new XmlName(value, YfilesCommonXamlNS))
  )
}

export function configureExtensions(callback) {
  createMetadata(
    EdgePathLabelModelExtension,
    {
      properties: {
        Angle: { default: 0, type: Number },
        AutoRotationEnabled: { default: true, type: Boolean },
        Distance: { default: 0, type: Number },
        Offset: { default: 0, type: Number },
        SideOfEdge: {
          default: EdgeSides.ON_EDGE | EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE,
          type: EdgeSides
        }
      }
    },
    callback
  )
  createMetadata(
    EdgeSegmentLabelModelExtension,
    {
      properties: {
        Angle: { default: 0, type: Number },
        AutoRotationEnabled: { default: true, type: Boolean },
        Distance: { default: 0, type: Number },
        Offset: { default: 0, type: Number },
        SideOfEdge: {
          default: EdgeSides.ON_EDGE | EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE,
          type: EdgeSides
        }
      }
    },
    callback
  )
  createMetadata(
    SmartEdgeLabelModelExtension,
    {
      properties: {
        Angle: { default: 0, type: Number },
        AutoRotation: { default: true, type: Boolean }
      }
    },
    callback
  )
  createMetadata(
    NinePositionsEdgeLabelModelExtension,
    {
      properties: { Angle: { default: 0, type: Number }, Distance: { default: 10.0, type: Number } }
    },
    callback
  )
  createMetadata(
    ExteriorLabelModelExtension,
    { properties: { Insets: { type: Insets } } },
    callback
  )
  createMetadata(
    ExteriorLabelModelParameterExtension,
    {
      properties: { Model: { type: ILabelModel }, Position: { type: ExteriorLabelModelPosition } }
    },
    callback
  )
  createMetadata(
    InteriorLabelModelExtension,
    { properties: { Insets: { type: Insets } } },
    callback
  )
  createMetadata(
    InteriorLabelModelParameterExtension,
    {
      properties: { Model: { type: ILabelModel }, Position: { type: InteriorLabelModelPosition } }
    },
    callback
  )
  createMetadata(
    InteriorStretchLabelModelExtension,
    { properties: { Insets: { type: Insets } } },
    callback
  )
  createMetadata(
    InteriorStretchLabelModelParameterExtension,
    {
      properties: {
        Model: { type: ILabelModel },
        Position: { type: InteriorStretchLabelModelPosition }
      }
    },
    callback
  )
  createMetadata(
    StripeLabelModelExtension,
    { properties: { UseActualInsets: { type: Boolean }, Ratio: { type: Number } } },
    callback
  )
  createMetadata(
    StripeLabelModelParameterExtension,
    { properties: { Model: { type: ILabelModel }, Position: { type: StripeLabelModelPosition } } },
    callback
  )
  createMetadata(
    StretchStripeLabelModelExtension,
    { properties: { UseActualInsets: { type: Boolean }, Insets: { type: Insets } } },
    callback
  )
  createMetadata(
    StretchStripeLabelModelParameterExtension,
    {
      properties: {
        Model: { type: ILabelModel },
        Position: { type: StretchStripeLabelModelPosition }
      }
    },
    callback
  )
  createMetadata(
    CompositeLabelModelExtension,
    { properties: { LabelModels: { type: IList, visibility: GraphMLMemberVisibility.CONTENT } } },
    callback
  )
  createMetadata(
    CompositeLabelModelParameterExtension,
    { properties: { Model: { type: ILabelModel }, Parameter: { type: ILabelModelParameter } } },
    callback
  )
  createMetadata(
    GenericLabelModelExtension,
    {
      contentProperty: 'Parameters',
      properties: {
        Parameters: { type: IList, visibility: GraphMLMemberVisibility.CONTENT },
        Default: { type: Number }
      }
    },
    callback
  )
  createMetadata(
    GenericLabelModelParameterExtension,
    { properties: { Model: { type: ILabelModel }, Index: { type: Number } } },
    callback
  )
  createMetadata(
    GenericLabelModelParameterPair,
    {
      properties: {
        Parameter: { type: ILabelModelParameter },
        Descriptor: { type: LabelCandidateDescriptor }
      }
    },
    callback
  )
  createMetadata(
    LabelCandidateDescriptor,
    {
      properties: {
        Profit: { type: Number },
        EdgeOverlapPenalty: { type: Number },
        NodeOverlapPenalty: { type: Number },
        ExternalCandidate: { type: Boolean }
      }
    },
    callback
  )
  createMetadata(
    SandwichLabelModelExtension,
    { properties: { YOffset: { type: Number } } },
    callback
  )
  createMetadata(
    SandwichParameterExtension,
    {
      properties: { Model: { type: ILabelModel }, Position: { type: ExteriorLabelModelPosition } }
    },
    callback
  )
  createMetadata(
    DescriptorWrapperLabelModelExtension,
    {
      properties: {
        InnerModel: { type: ILabelModel },
        Descriptor: { type: LabelCandidateDescriptor }
      }
    },
    callback
  )
  createMetadata(
    DescriptorWrapperLabelModelParameterExtension,
    { properties: { Model: { type: ILabelModel }, Parameter: { type: ILabelModelParameter } } },
    callback
  )
  createMetadata(
    GroupNodeLabelModelExtension,
    { properties: { ConsiderTabInset: { type: Boolean } } },
    callback
  )
}

function createMetadata(type, metadata, callback, ns = YfilesCommon_3_0_XamlNS) {
  metadata.name = type.name
  metadata.xmlNamespace = ns
  callback(type, metadata)
}

// region Compatibility classes for ExteriorLabelModel

const ExteriorLabelModelPosition = Enum('ExteriorLabelModelPosition', {
  North: ExteriorNodeLabelModelPosition.TOP,
  East: ExteriorNodeLabelModelPosition.RIGHT,
  South: ExteriorNodeLabelModelPosition.BOTTOM,
  West: ExteriorNodeLabelModelPosition.LEFT,
  NorthEast: ExteriorNodeLabelModelPosition.TOP_RIGHT,
  SouthEast: ExteriorNodeLabelModelPosition.BOTTOM_RIGHT,
  NorthWest: ExteriorNodeLabelModelPosition.TOP_LEFT,
  SouthWest: ExteriorNodeLabelModelPosition.BOTTOM_LEFT
})

class ExteriorLabelModelParameterExtension extends MarkupExtension {
  _Position = ExteriorLabelModelPosition.North

  get Position() {
    return this._Position
  }

  set Position(value) {
    this._Position = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    let model = this._Model
    if (model === null) {
      model = ExteriorNodeLabelModel.TOP.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class ExteriorLabelModelExtension extends MarkupExtension {
  static _northWest
  static _north
  static _northEast
  static _west
  static _east
  static _southWest
  static _south
  static _southEast
  static {
    const umModel = new ExteriorNodeLabelModel({ margins: new Insets(0) })
    ExteriorLabelModelExtension._northWest = umModel.createParameter(
      ExteriorNodeLabelModelPosition.TOP_LEFT
    )
    ExteriorLabelModelExtension._north = umModel.createParameter(ExteriorNodeLabelModelPosition.TOP)
    ExteriorLabelModelExtension._northEast = umModel.createParameter(
      ExteriorNodeLabelModelPosition.TOP_RIGHT
    )
    ExteriorLabelModelExtension._west = umModel.createParameter(ExteriorNodeLabelModelPosition.LEFT)
    ExteriorLabelModelExtension._east = umModel.createParameter(
      ExteriorNodeLabelModelPosition.RIGHT
    )
    ExteriorLabelModelExtension._southWest = umModel.createParameter(
      ExteriorNodeLabelModelPosition.BOTTOM_LEFT
    )
    ExteriorLabelModelExtension._south = umModel.createParameter(
      ExteriorNodeLabelModelPosition.BOTTOM
    )
    ExteriorLabelModelExtension._southEast = umModel.createParameter(
      ExteriorNodeLabelModelPosition.BOTTOM_RIGHT
    )
  }

  static get North() {
    return ExteriorLabelModelExtension._north
  }

  static get West() {
    return ExteriorLabelModelExtension._west
  }

  static get East() {
    return ExteriorLabelModelExtension._east
  }

  static get South() {
    return ExteriorLabelModelExtension._south
  }

  static get NorthWest() {
    return ExteriorLabelModelExtension._northWest
  }

  static get NorthEast() {
    return ExteriorLabelModelExtension._northEast
  }

  static get SouthEast() {
    return ExteriorLabelModelExtension._southEast
  }

  static get SouthWest() {
    return ExteriorLabelModelExtension._southWest
  }

  _Insets = new Insets(0)

  get Insets() {
    return this._Insets
  }

  set Insets(value) {
    this._Insets = value
  }

  provideValue() {
    return new ExteriorNodeLabelModel({ margins: this.Insets })
  }
}


// region Compatibility classes for InteriorLabelModel

const InteriorLabelModelPosition = Enum('InteriorLabelModelPosition', {
  North: InteriorNodeLabelModelPosition.TOP,
  East: InteriorNodeLabelModelPosition.RIGHT,
  South: InteriorNodeLabelModelPosition.BOTTOM,
  West: InteriorNodeLabelModelPosition.LEFT,
  NorthEast: InteriorNodeLabelModelPosition.TOP_RIGHT,
  SouthEast: InteriorNodeLabelModelPosition.BOTTOM_RIGHT,
  NorthWest: InteriorNodeLabelModelPosition.TOP_LEFT,
  SouthWest: InteriorNodeLabelModelPosition.BOTTOM_LEFT,
  Center: InteriorNodeLabelModelPosition.CENTER
})

class InteriorLabelModelParameterExtension extends MarkupExtension {
  _Position = InteriorLabelModelPosition.North

  get Position() {
    return this._Position
  }

  set Position(value) {
    this._Position = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    let model = this._Model
    if (model === null) {
      model = InteriorNodeLabelModel.CENTER.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class InteriorLabelModelExtension extends MarkupExtension {
  static _northWest
  static _north
  static _northEast
  static _west
  static _center
  static _east
  static _southWest
  static _south
  static _southEast

  static {
    const umModel = new InteriorNodeLabelModel({ padding: new Insets(0) })
    InteriorLabelModelExtension._northWest = umModel.createParameter(
      InteriorNodeLabelModelPosition.TOP_LEFT
    )
    InteriorLabelModelExtension._north = umModel.createParameter(InteriorNodeLabelModelPosition.TOP)
    InteriorLabelModelExtension._northEast = umModel.createParameter(
      InteriorNodeLabelModelPosition.TOP_RIGHT
    )
    InteriorLabelModelExtension._west = umModel.createParameter(InteriorNodeLabelModelPosition.LEFT)
    InteriorLabelModelExtension._center = umModel.createParameter(
      InteriorNodeLabelModelPosition.CENTER
    )
    InteriorLabelModelExtension._east = umModel.createParameter(
      InteriorNodeLabelModelPosition.RIGHT
    )
    InteriorLabelModelExtension._southWest = umModel.createParameter(
      InteriorNodeLabelModelPosition.BOTTOM_LEFT
    )
    InteriorLabelModelExtension._south = umModel.createParameter(
      InteriorNodeLabelModelPosition.BOTTOM
    )
    InteriorLabelModelExtension._southEast = umModel.createParameter(
      InteriorNodeLabelModelPosition.BOTTOM_RIGHT
    )
  }

  static get North() {
    return InteriorLabelModelExtension._north
  }

  static get West() {
    return InteriorLabelModelExtension._west
  }

  static get East() {
    return InteriorLabelModelExtension._east
  }

  static get South() {
    return InteriorLabelModelExtension._south
  }

  static get NorthWest() {
    return InteriorLabelModelExtension._northWest
  }

  static get NorthEast() {
    return InteriorLabelModelExtension._northEast
  }

  static get SouthEast() {
    return InteriorLabelModelExtension._southEast
  }

  static get SouthWest() {
    return InteriorLabelModelExtension._southWest
  }

  static get Center() {
    return InteriorLabelModelExtension._center
  }

  _Insets = new Insets(0)

  get Insets() {
    return this._Insets
  }

  set Insets(value) {
    this._Insets = value
  }

  provideValue() {
    return new InteriorNodeLabelModel({ padding: this.Insets })
  }
}


// region Compatibility classes for InteriorStretchLabelModel

const InteriorStretchLabelModelPosition = Enum('InteriorStretchLabelModelPosition', {
  North: StretchNodeLabelModelPosition.TOP,
  East: StretchNodeLabelModelPosition.RIGHT,
  South: StretchNodeLabelModelPosition.BOTTOM,
  West: StretchNodeLabelModelPosition.LEFT,
  Center: StretchNodeLabelModelPosition.CENTER,
  CenterHorizontal: StretchNodeLabelModelPosition.CENTER_HORIZONTAL,
  CenterVertical: StretchNodeLabelModelPosition.CENTER_VERTICAL
})

class InteriorStretchLabelModelParameterExtension extends MarkupExtension {
  _Position = InteriorStretchLabelModelPosition.North

  get Position() {
    return this._Position
  }

  set Position(value) {
    this._Position = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    let model = this._Model
    if (model === null) {
      model = StretchNodeLabelModel.CENTER.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class InteriorStretchLabelModelExtension extends MarkupExtension {
  static _north
  static _south
  static _west
  static _east
  static _center
  static _centerHorizontal
  static _centerVertical

  static {
    const umModel = new StretchNodeLabelModel({ padding: new Insets(0) })
    InteriorStretchLabelModelExtension._north = umModel.createParameter(
      StretchNodeLabelModelPosition.TOP
    )
    InteriorStretchLabelModelExtension._south = umModel.createParameter(
      StretchNodeLabelModelPosition.BOTTOM
    )
    InteriorStretchLabelModelExtension._west = umModel.createParameter(
      StretchNodeLabelModelPosition.LEFT
    )
    InteriorStretchLabelModelExtension._east = umModel.createParameter(
      StretchNodeLabelModelPosition.RIGHT
    )
    InteriorStretchLabelModelExtension._center = umModel.createParameter(
      StretchNodeLabelModelPosition.CENTER
    )
    InteriorStretchLabelModelExtension._centerHorizontal = umModel.createParameter(
      StretchNodeLabelModelPosition.CENTER_HORIZONTAL
    )
    InteriorStretchLabelModelExtension._centerVertical = umModel.createParameter(
      StretchNodeLabelModelPosition.CENTER_VERTICAL
    )
  }

  static get North() {
    return InteriorStretchLabelModelExtension._north
  }

  static get West() {
    return InteriorStretchLabelModelExtension._west
  }

  static get East() {
    return InteriorStretchLabelModelExtension._east
  }

  static get South() {
    return InteriorStretchLabelModelExtension._south
  }

  static get CenterVertical() {
    return InteriorStretchLabelModelExtension._centerVertical
  }

  static get CenterHorizontal() {
    return InteriorStretchLabelModelExtension._centerHorizontal
  }

  static get Center() {
    return InteriorStretchLabelModelExtension._center
  }

  _Insets = new Insets(0)

  get Insets() {
    return this._Insets
  }

  set Insets(value) {
    this._Insets = value
  }

  provideValue() {
    return new StretchNodeLabelModel({ padding: this.Insets })
  }
}


// region Compatibility classes for StripeLabelModel

const StripeLabelModelPosition = Enum('StripeLabelModelPosition', {
  //@ts-ignore
  North: yfiles.graph.StripeLabelModelPosition.TOP,
  //@ts-ignore
  East: yfiles.graph.StripeLabelModelPosition.RIGHT,
  //@ts-ignore
  South: yfiles.graph.StripeLabelModelPosition.BOTTOM,
  //@ts-ignore
  West: yfiles.graph.StripeLabelModelPosition.LEFT
})

class StripeLabelModelParameterExtension extends MarkupExtension {
  _Position = StripeLabelModelPosition.North

  get Position() {
    return this._Position
  }

  set Position(value) {
    this._Position = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    let model = this._Model
    if (model === null) {
      model = StripeLabelModel.TOP.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class StripeLabelModelExtension extends MarkupExtension {
  static get North() {
    return StripeLabelModel.TOP
  }

  static get West() {
    return StripeLabelModel.LEFT
  }

  static get East() {
    return StripeLabelModel.RIGHT
  }

  static get South() {
    return StripeLabelModel.BOTTOM
  }

  _UseActualInsets = false

  get UseActualInsets() {
    return this._UseActualInsets
  }

  set UseActualInsets(value) {
    this._UseActualInsets = value
  }

  _Ratio = 0.5

  get Ratio() {
    return this._Ratio
  }

  set Ratio(value) {
    this._Ratio = value
  }

  provideValue() {
    return new StripeLabelModel({ useTotalPadding: this.UseActualInsets, ratio: this.Ratio })
  }
}


// region Compatibility classes for StretchStripeLabelModel

const StretchStripeLabelModelPosition = Enum('StretchStripeLabelModelPosition', {
  //@ts-ignore
  North: yfiles.graph.StretchStripeLabelModelPosition.TOP,
  //@ts-ignore
  East: yfiles.graph.StretchStripeLabelModelPosition.RIGHT,
  //@ts-ignore
  South: yfiles.graph.StretchStripeLabelModelPosition.BOTTOM,
  //@ts-ignore
  West: yfiles.graph.StretchStripeLabelModelPosition.LEFT
})

class StretchStripeLabelModelParameterExtension extends MarkupExtension {
  _Position = StretchStripeLabelModelPosition.North

  get Position() {
    return this._Position
  }

  set Position(value) {
    this._Position = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    let model = this._Model
    if (model === null) {
      model = StretchStripeLabelModel.TOP.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class StretchStripeLabelModelExtension extends MarkupExtension {
  static get North() {
    return StretchStripeLabelModel.TOP
  }

  static get West() {
    return StretchStripeLabelModel.LEFT
  }

  static get East() {
    return StretchStripeLabelModel.RIGHT
  }

  static get South() {
    return StretchStripeLabelModel.BOTTOM
  }

  _UseActualInsets = false

  get UseActualInsets() {
    return this._UseActualInsets
  }

  set UseActualInsets(value) {
    this._UseActualInsets = value
  }

  _Insets = new Insets(0)

  get Insets() {
    return this._Insets
  }

  set Insets(value) {
    this._Insets = value
  }

  provideValue() {
    return new StretchStripeLabelModel({
      useTotalPadding: this.UseActualInsets,
      padding: this.Insets
    })
  }
}


// region Compatibility classes for CompositeLabelModel

class CompositeLabelModelParameterExtension extends MarkupExtension {
  _Parameter = null

  get Parameter() {
    return this._Parameter
  }

  set Parameter(value) {
    this._Parameter = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue(serviceProvider) {
    //@ts-ignore
    const ext = new yfiles.graphml.CompositeLabelModelParameterExtension()
    ext.parameter = this._Parameter
    ext.model = this._Model
    return ext.provideValue(serviceProvider)
  }
}

class CompositeLabelModelExtension extends MarkupExtension {
  _LabelModels = new List()

  get LabelModels() {
    return this._LabelModels
  }

  provideValue() {
    const compositeLabelModel = new CompositeLabelModel()
    this._LabelModels.forEach((m) => compositeLabelModel.addModel(m))
    return compositeLabelModel
  }
}


// region Compatibility classes for GenericLabelModel

class GenericLabelModelParameterPair extends BaseClass() {
  _Parameter = null

  get Parameter() {
    return this._Parameter
  }

  set Parameter(value) {
    this._Parameter = value
  }

  _Descriptor = null

  get Descriptor() {
    return this._Descriptor
  }

  set Descriptor(value) {
    this._Descriptor = value
  }
}

class LabelCandidateDescriptor extends BaseClass() {
  static _externalDescriptor
  static _internalDescriptor

  static get ExternalDescriptor() {
    return LabelCandidateDescriptor._externalDescriptor
  }

  static get InternalDescriptor() {
    return LabelCandidateDescriptor._internalDescriptor
  }

  static {
    LabelCandidateDescriptor._externalDescriptor = new LabelCandidateDescriptor()
    LabelCandidateDescriptor._externalDescriptor.ExternalCandidate = true
    LabelCandidateDescriptor._internalDescriptor = new LabelCandidateDescriptor()
  }

  _ExternalCandidate = false

  get ExternalCandidate() {
    return this._ExternalCandidate
  }

  set ExternalCandidate(value) {
    this._ExternalCandidate = value
  }

  _EdgeOverlapPenalty = 1.0

  get EdgeOverlapPenalty() {
    return this._EdgeOverlapPenalty
  }

  set EdgeOverlapPenalty(value) {
    this._EdgeOverlapPenalty = value
  }

  _NodeOverlapPenalty = 1.0

  get NodeOverlapPenalty() {
    return this._NodeOverlapPenalty
  }

  set NodeOverlapPenalty(value) {
    this._NodeOverlapPenalty = value
  }

  _Profit = 1.0

  get Profit() {
    return this._Profit
  }

  set Profit(value) {
    this._Profit = value
  }
}

class GenericLabelModelParameterExtension extends MarkupExtension {
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
    if (!this._Model) {
      return GenericLabelModelExtension.absolute
    }
    return this._Model.parameters.at(this._Index)
  }
}

class GenericLabelModelExtension extends MarkupExtension {
  static absolute = FreeLabelModel.INSTANCE.createAbsolute([0, 0])

  _Parameters = new List()

  get Parameters() {
    return this._Parameters
  }

  _Default = 0

  get Default() {
    return this._Default
  }

  set Default(value) {
    this._Default = value
  }

  provideValue() {
    const compositeLabelModel = new CompositeLabelModel()
    const dParam =
      this._Default >= this._Parameters.size || this._Default < 0
        ? (this._Parameters.first() ?? GenericLabelModelExtension.absolute)
        : this._Parameters.at(this._Default)
    if (dParam instanceof GenericLabelModelParameterPair) {
      compositeLabelModel.addParameter(dParam.Parameter, dParam.Descriptor?.Profit ?? 1.0)
    } else {
      compositeLabelModel.addParameter(dParam)
    }

    this._Parameters.forEach((m) => {
      if (m !== dParam) {
        if (m instanceof GenericLabelModelParameterPair) {
          compositeLabelModel.addParameter(m.Parameter)
        } else {
          compositeLabelModel.addParameter(m)
        }
      }
    })
    return compositeLabelModel
  }
}


// region Compatibility classes for SandwichLabelModel

class SandwichParameterExtension extends MarkupExtension {
  _Position = ExteriorLabelModelPosition.North

  get Position() {
    return this._Position
  }

  set Position(value) {
    this._Position = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    let model = this._Model
    if (model === null) {
      model = SandwichLabelModelExtension.South.model
    }
    return model.parameters.find((p) => p.wrappedParameter.position == this.Position)
  }
}

class SandwichLabelModelExtension extends MarkupExtension {
  static _north
  static _south

  static {
    const noMarginsFactory = new ExteriorNodeLabelModel({ margins: new Insets(0) })
    const umModel = new CompositeLabelModel()
    SandwichLabelModelExtension._south = umModel.addParameter(
      noMarginsFactory.createParameter(ExteriorNodeLabelModelPosition.BOTTOM)
    )
    SandwichLabelModelExtension._north = umModel.addParameter(
      noMarginsFactory.createParameter(ExteriorNodeLabelModelPosition.TOP)
    )
  }

  static get North() {
    return SandwichLabelModelExtension._north
  }

  static get South() {
    return SandwichLabelModelExtension._south
  }

  _YOffset = 0

  get YOffset() {
    return this._YOffset
  }

  set YOffset(value) {
    this._YOffset = value
  }

  provideValue() {
    const wrappedModel = new ExteriorNodeLabelModel({ margins: this._YOffset })
    const model = new CompositeLabelModel()
    model.addParameter(wrappedModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM))
    model.addParameter(wrappedModel.createParameter(ExteriorNodeLabelModelPosition.TOP))
    return model
  }
}


// region Compatibility classes for DescriptorWrapperModel

class DescriptorWrapperLabelModelParameterExtension extends MarkupExtension {
  _Parameter = null

  get Parameter() {
    return this._Parameter
  }

  set Parameter(value) {
    this._Parameter = value
  }

  _Model = null

  get Model() {
    return this._Model
  }

  set Model(value) {
    this._Model = value
  }

  provideValue() {
    return this._Parameter
  }
}

class DescriptorWrapperLabelModelExtension extends MarkupExtension {
  _InnerModel = null

  get InnerModel() {
    return this._InnerModel
  }

  set InnerModel(value) {
    this._InnerModel = value
  }

  _Descriptor = null

  get Descriptor() {
    return this._Descriptor
  }

  set Descriptor(value) {
    this._Descriptor = value
  }

  provideValue() {
    return this._InnerModel
  }
}


// region Compatibility classes for GroupNodeLabelModel

class GroupNodeLabelModelExtension extends MarkupExtension {
  _ConsiderTabInset = true

  get ConsiderTabInset() {
    return this._ConsiderTabInset
  }

  set ConsiderTabInset(value) {
    this._ConsiderTabInset = value
  }

  provideValue() {
    return new GroupNodeLabelModel({ considerTabPadding: this._ConsiderTabInset })
  }
}


// region Compatibility class for rotating edge label models

class EdgePathBasedLabelModelExtension extends MarkupExtension {
  angle
  autoRotationEnabled
  distance
  offset
  sideOfEdge

  constructor() {
    super()
    this.angle = 0
    this.autoRotationEnabled = true
    this.distance = 0
    this.offset = 0
    this.sideOfEdge = EdgeSides.ON_EDGE | EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
  }

  get Angle() {
    return this.angle
  }

  set Angle(value) {
    this.angle = value
  }

  get AutoRotationEnabled() {
    return this.autoRotationEnabled
  }

  set AutoRotationEnabled(value) {
    this.autoRotationEnabled = value
  }

  get Distance() {
    return this.distance
  }

  set Distance(value) {
    this.distance = value
  }

  get Offset() {
    return this.offset
  }

  set Offset(value) {
    this.offset = value
  }

  get SideOfEdge() {
    return this.sideOfEdge
  }

  set SideOfEdge(value) {
    this.sideOfEdge = value
  }
}

class EdgePathLabelModelExtension extends EdgePathBasedLabelModelExtension {
  provideValue(serviceProvider) {
    const _autoRotationEnabled = this.AutoRotationEnabled
    return new EdgePathLabelModel({
      angle: _autoRotationEnabled ? this.Angle : -this.Angle,
      autoRotation: _autoRotationEnabled,
      distance: this.Distance,
      offset: this.Offset,
      sideOfEdge: this.SideOfEdge
    })
  }
}

class EdgeSegmentLabelModelExtension extends EdgePathBasedLabelModelExtension {
  provideValue(serviceProvider) {
    const _autoRotationEnabled = this.AutoRotationEnabled
    return new EdgeSegmentLabelModel({
      angle: _autoRotationEnabled ? this.Angle : -this.Angle,
      autoRotation: _autoRotationEnabled,
      distance: this.Distance,
      offset: this.Offset,
      sideOfEdge: this.SideOfEdge
    })
  }
}

class SmartEdgeLabelModelExtension extends MarkupExtension {
  angle
  autoRotation

  constructor() {
    super()
    this.angle = 0
    this.autoRotation = true
  }

  get Angle() {
    return this.angle
  }

  set Angle(value) {
    this.angle = value
  }

  get AutoRotation() {
    return this.autoRotation
  }

  set AutoRotation(value) {
    this.autoRotation = value
  }

  provideValue(serviceProvider) {
    const _autoRotation = this.AutoRotation
    return new SmartEdgeLabelModel({
      angle: _autoRotation ? this.Angle : -this.Angle,
      autoRotation: _autoRotation
    })
  }
}

class NinePositionsEdgeLabelModelExtension extends MarkupExtension {
  angle
  distance

  constructor() {
    super()
    this.angle = 0
    this.distance = 10.0
  }

  get Angle() {
    return this.angle
  }

  set Angle(value) {
    this.angle = value
  }

  get Distance() {
    return this.distance
  }

  set Distance(value) {
    this.distance = value
  }

  provideValue(serviceProvider) {
    return new NinePositionsEdgeLabelModel({ angle: -this.Angle, distance: this.Distance })
  }
}

