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
  type Constructor,
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
  type ILookup,
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
  type TypeMetadata,
  XmlName,
  yfiles
} from '@yfiles/yfiles'
import { YfilesCommon_3_0_XamlNS, YfilesCommonXamlNS } from './GraphMLCompatibility'

/**
 * The usage of yfiles.lang.Enum here is only for GraphML compatibility, and shouldn't be needed
 * elsewhere. For enums in your own application, use either TypeScript enums or a simple keyed
 * object with constants.
 */
const Enum = (yfiles as any).lang.Enum

export function configureRenamings(callback: (oldName: XmlName, newName: XmlName) => void) {
  const nameMappings = new Map<string, string>()
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

export function configureExtensions(
  callback: <T>(type: Constructor<T>, metadata: TypeMetadata<T>) => void
) {
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
    {
      properties: {
        LabelModels: { type: IList<ILabelModel>, visibility: GraphMLMemberVisibility.CONTENT }
      }
    },
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
        Parameters: { type: IList<any>, visibility: GraphMLMemberVisibility.CONTENT },
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

function createMetadata<T>(
  type: Constructor<T>,
  metadata: TypeMetadata<T>,
  callback: <T>(type: Constructor<T>, metadata: TypeMetadata<T>) => void,
  ns: string = YfilesCommon_3_0_XamlNS
): void {
  metadata.name = (type as Function).name
  metadata.xmlNamespace = ns
  callback(type, metadata)
}

// region Compatibility classes for ExteriorLabelModel

const ExteriorLabelModelPosition = (Enum as any)('ExteriorLabelModelPosition', {
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
  private _Position: number = ExteriorLabelModelPosition.North

  get Position(): number {
    return this._Position
  }

  set Position(value: number) {
    this._Position = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    let model = <ExteriorNodeLabelModel>this._Model
    if (model === null) {
      model = ExteriorNodeLabelModel.TOP.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class ExteriorLabelModelExtension extends MarkupExtension {
  private static _northWest: ILabelModelParameter
  private static _north: ILabelModelParameter
  private static _northEast: ILabelModelParameter
  private static _west: ILabelModelParameter
  private static _east: ILabelModelParameter
  private static _southWest: ILabelModelParameter
  private static _south: ILabelModelParameter
  private static _southEast: ILabelModelParameter
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

  static get North(): ILabelModelParameter {
    return ExteriorLabelModelExtension._north
  }

  static get West(): ILabelModelParameter {
    return ExteriorLabelModelExtension._west
  }

  static get East(): ILabelModelParameter {
    return ExteriorLabelModelExtension._east
  }

  static get South(): ILabelModelParameter {
    return ExteriorLabelModelExtension._south
  }

  static get NorthWest(): ILabelModelParameter {
    return ExteriorLabelModelExtension._northWest
  }

  static get NorthEast(): ILabelModelParameter {
    return ExteriorLabelModelExtension._northEast
  }

  static get SouthEast(): ILabelModelParameter {
    return ExteriorLabelModelExtension._southEast
  }

  static get SouthWest(): ILabelModelParameter {
    return ExteriorLabelModelExtension._southWest
  }

  private _Insets: Insets = new Insets(0)

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  provideValue(): any {
    return new ExteriorNodeLabelModel({ margins: this.Insets })
  }
}


// region Compatibility classes for InteriorLabelModel

const InteriorLabelModelPosition = (Enum as any)('InteriorLabelModelPosition', {
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
  private _Position: number = InteriorLabelModelPosition.North

  get Position(): number {
    return this._Position
  }

  set Position(value: number) {
    this._Position = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    let model = <InteriorNodeLabelModel>this._Model
    if (model === null) {
      model = InteriorNodeLabelModel.CENTER.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class InteriorLabelModelExtension extends MarkupExtension {
  private static _northWest: ILabelModelParameter
  private static _north: ILabelModelParameter
  private static _northEast: ILabelModelParameter
  private static _west: ILabelModelParameter
  private static _center: ILabelModelParameter
  private static _east: ILabelModelParameter
  private static _southWest: ILabelModelParameter
  private static _south: ILabelModelParameter
  private static _southEast: ILabelModelParameter

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

  static get North(): ILabelModelParameter {
    return InteriorLabelModelExtension._north
  }

  static get West(): ILabelModelParameter {
    return InteriorLabelModelExtension._west
  }

  static get East(): ILabelModelParameter {
    return InteriorLabelModelExtension._east
  }

  static get South(): ILabelModelParameter {
    return InteriorLabelModelExtension._south
  }

  static get NorthWest(): ILabelModelParameter {
    return InteriorLabelModelExtension._northWest
  }

  static get NorthEast(): ILabelModelParameter {
    return InteriorLabelModelExtension._northEast
  }

  static get SouthEast(): ILabelModelParameter {
    return InteriorLabelModelExtension._southEast
  }

  static get SouthWest(): ILabelModelParameter {
    return InteriorLabelModelExtension._southWest
  }

  static get Center(): ILabelModelParameter {
    return InteriorLabelModelExtension._center
  }

  private _Insets: Insets = new Insets(0)

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  provideValue(): any {
    return new InteriorNodeLabelModel({ padding: this.Insets })
  }
}


// region Compatibility classes for InteriorStretchLabelModel

const InteriorStretchLabelModelPosition = (Enum as any)('InteriorStretchLabelModelPosition', {
  North: StretchNodeLabelModelPosition.TOP,
  East: StretchNodeLabelModelPosition.RIGHT,
  South: StretchNodeLabelModelPosition.BOTTOM,
  West: StretchNodeLabelModelPosition.LEFT,
  Center: StretchNodeLabelModelPosition.CENTER,
  CenterHorizontal: StretchNodeLabelModelPosition.CENTER_HORIZONTAL,
  CenterVertical: StretchNodeLabelModelPosition.CENTER_VERTICAL
})

class InteriorStretchLabelModelParameterExtension extends MarkupExtension {
  private _Position: number = InteriorStretchLabelModelPosition.North

  get Position(): number {
    return this._Position
  }

  set Position(value: number) {
    this._Position = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    let model = <StretchNodeLabelModel>this._Model
    if (model === null) {
      model = StretchNodeLabelModel.CENTER.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class InteriorStretchLabelModelExtension extends MarkupExtension {
  private static _north: ILabelModelParameter
  private static _south: ILabelModelParameter
  private static _west: ILabelModelParameter
  private static _east: ILabelModelParameter
  private static _center: ILabelModelParameter
  private static _centerHorizontal: ILabelModelParameter
  private static _centerVertical: ILabelModelParameter

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

  static get North(): ILabelModelParameter {
    return InteriorStretchLabelModelExtension._north
  }

  static get West(): ILabelModelParameter {
    return InteriorStretchLabelModelExtension._west
  }

  static get East(): ILabelModelParameter {
    return InteriorStretchLabelModelExtension._east
  }

  static get South(): ILabelModelParameter {
    return InteriorStretchLabelModelExtension._south
  }

  static get CenterVertical(): ILabelModelParameter {
    return InteriorStretchLabelModelExtension._centerVertical
  }

  static get CenterHorizontal(): ILabelModelParameter {
    return InteriorStretchLabelModelExtension._centerHorizontal
  }

  static get Center(): ILabelModelParameter {
    return InteriorStretchLabelModelExtension._center
  }

  private _Insets: Insets = new Insets(0)

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  provideValue(): any {
    return new StretchNodeLabelModel({ padding: this.Insets })
  }
}


// region Compatibility classes for StripeLabelModel

const StripeLabelModelPosition = (Enum as any)('StripeLabelModelPosition', {
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
  private _Position: number = StripeLabelModelPosition.North

  get Position(): number {
    return this._Position
  }

  set Position(value: number) {
    this._Position = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    let model = <StripeLabelModel>this._Model
    if (model === null) {
      model = StripeLabelModel.TOP.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class StripeLabelModelExtension extends MarkupExtension {
  static get North(): ILabelModelParameter {
    return StripeLabelModel.TOP
  }

  static get West(): ILabelModelParameter {
    return StripeLabelModel.LEFT
  }

  static get East(): ILabelModelParameter {
    return StripeLabelModel.RIGHT
  }

  static get South(): ILabelModelParameter {
    return StripeLabelModel.BOTTOM
  }

  private _UseActualInsets: boolean = false

  get UseActualInsets(): boolean {
    return this._UseActualInsets
  }

  set UseActualInsets(value: boolean) {
    this._UseActualInsets = value
  }

  private _Ratio: number = 0.5

  get Ratio(): number {
    return this._Ratio
  }

  set Ratio(value: number) {
    this._Ratio = value
  }

  provideValue(): any {
    return new StripeLabelModel({ useTotalPadding: this.UseActualInsets, ratio: this.Ratio })
  }
}


// region Compatibility classes for StretchStripeLabelModel

const StretchStripeLabelModelPosition = (Enum as any)('StretchStripeLabelModelPosition', {
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
  private _Position: number = StretchStripeLabelModelPosition.North

  get Position(): number {
    return this._Position
  }

  set Position(value: number) {
    this._Position = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    let model = <StretchStripeLabelModel>this._Model
    if (model === null) {
      model = StretchStripeLabelModel.TOP.model
    }
    return model.createParameter(this._Position.valueOf())
  }
}

class StretchStripeLabelModelExtension extends MarkupExtension {
  static get North(): ILabelModelParameter {
    return StretchStripeLabelModel.TOP
  }

  static get West(): ILabelModelParameter {
    return StretchStripeLabelModel.LEFT
  }

  static get East(): ILabelModelParameter {
    return StretchStripeLabelModel.RIGHT
  }

  static get South(): ILabelModelParameter {
    return StretchStripeLabelModel.BOTTOM
  }

  private _UseActualInsets: boolean = false

  get UseActualInsets(): boolean {
    return this._UseActualInsets
  }

  set UseActualInsets(value: boolean) {
    this._UseActualInsets = value
  }

  private _Insets: Insets = new Insets(0)

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  provideValue(): any {
    return new StretchStripeLabelModel({
      useTotalPadding: this.UseActualInsets,
      padding: this.Insets
    })
  }
}


// region Compatibility classes for CompositeLabelModel

class CompositeLabelModelParameterExtension extends MarkupExtension {
  private _Parameter: ILabelModelParameter | null = null

  get Parameter(): ILabelModelParameter | null {
    return this._Parameter
  }

  set Parameter(value: ILabelModelParameter | null) {
    this._Parameter = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(serviceProvider: ILookup | null): any {
    //@ts-ignore
    const ext = new yfiles.graphml.CompositeLabelModelParameterExtension()
    ext.parameter = this._Parameter
    ext.model = this._Model
    return ext.provideValue(serviceProvider)
  }
}

class CompositeLabelModelExtension extends MarkupExtension {
  private _LabelModels: IList<ILabelModel> = new List<ILabelModel>()

  get LabelModels(): IList<ILabelModel> {
    return this._LabelModels
  }

  provideValue(): any {
    const compositeLabelModel = new CompositeLabelModel()
    this._LabelModels.forEach((m) => compositeLabelModel.addModel(m))
    return compositeLabelModel
  }
}


// region Compatibility classes for GenericLabelModel

class GenericLabelModelParameterPair extends BaseClass() {
  private _Parameter: ILabelModelParameter | null = null

  get Parameter(): ILabelModelParameter | null {
    return this._Parameter
  }

  set Parameter(value: ILabelModelParameter | null) {
    this._Parameter = value
  }

  private _Descriptor: LabelCandidateDescriptor | null = null

  get Descriptor(): LabelCandidateDescriptor | null {
    return this._Descriptor
  }

  set Descriptor(value: LabelCandidateDescriptor | null) {
    this._Descriptor = value
  }
}

class LabelCandidateDescriptor extends BaseClass() {
  private static _externalDescriptor: LabelCandidateDescriptor
  private static _internalDescriptor: LabelCandidateDescriptor

  static get ExternalDescriptor(): LabelCandidateDescriptor {
    return LabelCandidateDescriptor._externalDescriptor
  }

  static get InternalDescriptor(): LabelCandidateDescriptor {
    return LabelCandidateDescriptor._internalDescriptor
  }

  static {
    LabelCandidateDescriptor._externalDescriptor = new LabelCandidateDescriptor()
    LabelCandidateDescriptor._externalDescriptor.ExternalCandidate = true
    LabelCandidateDescriptor._internalDescriptor = new LabelCandidateDescriptor()
  }

  private _ExternalCandidate: boolean = false

  get ExternalCandidate(): boolean {
    return this._ExternalCandidate
  }

  set ExternalCandidate(value: boolean) {
    this._ExternalCandidate = value
  }

  private _EdgeOverlapPenalty: number = 1.0

  get EdgeOverlapPenalty(): number {
    return this._EdgeOverlapPenalty
  }

  set EdgeOverlapPenalty(value: number) {
    this._EdgeOverlapPenalty = value
  }

  private _NodeOverlapPenalty: number = 1.0

  get NodeOverlapPenalty(): number {
    return this._NodeOverlapPenalty
  }

  set NodeOverlapPenalty(value: number) {
    this._NodeOverlapPenalty = value
  }

  private _Profit: number = 1.0

  get Profit(): number {
    return this._Profit
  }

  set Profit(value: number) {
    this._Profit = value
  }
}

class GenericLabelModelParameterExtension extends MarkupExtension {
  private _Index: number = 0

  get Index(): number {
    return this._Index
  }

  set Index(value: number) {
    this._Index = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    if (!this._Model) {
      return GenericLabelModelExtension.absolute
    }
    return (<CompositeLabelModel>this._Model).parameters.at(this._Index)
  }
}

class GenericLabelModelExtension extends MarkupExtension {
  static readonly absolute = FreeLabelModel.INSTANCE.createAbsolute([0, 0])

  private _Parameters: IList<ILabelModelParameter | GenericLabelModelParameterPair> = new List<
    ILabelModelParameter | GenericLabelModelParameterPair
  >()

  get Parameters(): IList<ILabelModelParameter | GenericLabelModelParameterPair> {
    return this._Parameters
  }

  private _Default: number = 0

  get Default(): number {
    return this._Default
  }

  set Default(value: number) {
    this._Default = value
  }

  provideValue(): any {
    const compositeLabelModel = new CompositeLabelModel()
    const dParam: ILabelModelParameter | GenericLabelModelParameterPair =
      this._Default >= this._Parameters.size || this._Default < 0
        ? (this._Parameters.first() ?? GenericLabelModelExtension.absolute)
        : this._Parameters.at(this._Default)!
    if (dParam instanceof GenericLabelModelParameterPair) {
      compositeLabelModel.addParameter(dParam.Parameter!, dParam.Descriptor?.Profit ?? 1.0)
    } else {
      compositeLabelModel.addParameter(dParam)
    }

    this._Parameters.forEach((m) => {
      if (m !== dParam) {
        if (m instanceof GenericLabelModelParameterPair) {
          compositeLabelModel.addParameter(m.Parameter!)
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
  private _Position: number = ExteriorLabelModelPosition.North

  get Position(): number {
    return this._Position
  }

  set Position(value: number) {
    this._Position = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    let model = <CompositeLabelModel>this._Model
    if (model === null) {
      model = SandwichLabelModelExtension.South.model as CompositeLabelModel
    }
    return model.parameters.find(
      (p) => (<ExteriorNodeLabelModelParameter>p.wrappedParameter).position == this.Position
    )
  }
}

class SandwichLabelModelExtension extends MarkupExtension {
  private static _north: CompositeLabelModelParameter
  private static _south: CompositeLabelModelParameter

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

  static get North(): ILabelModelParameter {
    return SandwichLabelModelExtension._north
  }

  static get South(): ILabelModelParameter {
    return SandwichLabelModelExtension._south
  }

  private _YOffset: number = 0

  get YOffset(): number {
    return this._YOffset
  }

  set YOffset(value: number) {
    this._YOffset = value
  }

  provideValue(): any {
    const wrappedModel = new ExteriorNodeLabelModel({ margins: this._YOffset })
    const model = new CompositeLabelModel()
    model.addParameter(wrappedModel.createParameter(ExteriorNodeLabelModelPosition.BOTTOM))
    model.addParameter(wrappedModel.createParameter(ExteriorNodeLabelModelPosition.TOP))
    return model
  }
}


// region Compatibility classes for DescriptorWrapperModel

class DescriptorWrapperLabelModelParameterExtension extends MarkupExtension {
  private _Parameter: ILabelModelParameter | null = null

  get Parameter(): ILabelModelParameter | null {
    return this._Parameter
  }

  set Parameter(value: ILabelModelParameter | null) {
    this._Parameter = value
  }

  private _Model: ILabelModel | null = null

  get Model(): ILabelModel | null {
    return this._Model
  }

  set Model(value: ILabelModel | null) {
    this._Model = value
  }

  provideValue(): any {
    return this._Parameter
  }
}

class DescriptorWrapperLabelModelExtension extends MarkupExtension {
  private _InnerModel: ILabelModel | null = null

  get InnerModel(): ILabelModel | null {
    return this._InnerModel
  }

  set InnerModel(value: ILabelModel | null) {
    this._InnerModel = value
  }

  private _Descriptor: LabelCandidateDescriptor | null = null

  get Descriptor(): LabelCandidateDescriptor | null {
    return this._Descriptor
  }

  set Descriptor(value: LabelCandidateDescriptor | null) {
    this._Descriptor = value
  }

  provideValue(): any {
    return this._InnerModel
  }
}


// region Compatibility classes for GroupNodeLabelModel

class GroupNodeLabelModelExtension extends MarkupExtension {
  private _ConsiderTabInset: boolean = true

  get ConsiderTabInset(): boolean {
    return this._ConsiderTabInset
  }

  set ConsiderTabInset(value: boolean) {
    this._ConsiderTabInset = value
  }

  provideValue(): any {
    return new GroupNodeLabelModel({ considerTabPadding: this._ConsiderTabInset })
  }
}


// region Compatibility class for rotating edge label models

abstract class EdgePathBasedLabelModelExtension extends MarkupExtension {
  private angle: number
  private autoRotationEnabled: boolean
  private distance: number
  private offset: number
  private sideOfEdge: EdgeSides

  constructor() {
    super()
    this.angle = 0
    this.autoRotationEnabled = true
    this.distance = 0
    this.offset = 0
    this.sideOfEdge = EdgeSides.ON_EDGE | EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
  }

  get Angle(): number {
    return this.angle
  }

  set Angle(value: number) {
    this.angle = value
  }

  get AutoRotationEnabled(): boolean {
    return this.autoRotationEnabled
  }

  set AutoRotationEnabled(value: boolean) {
    this.autoRotationEnabled = value
  }

  get Distance(): number {
    return this.distance
  }

  set Distance(value: number) {
    this.distance = value
  }

  get Offset(): number {
    return this.offset
  }

  set Offset(value: number) {
    this.offset = value
  }

  get SideOfEdge(): EdgeSides {
    return this.sideOfEdge
  }

  set SideOfEdge(value: EdgeSides) {
    this.sideOfEdge = value
  }
}

class EdgePathLabelModelExtension extends EdgePathBasedLabelModelExtension {
  provideValue(serviceProvider: ILookup | null): any {
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
  provideValue(serviceProvider: ILookup | null): any {
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
  private angle: number
  private autoRotation: boolean

  constructor() {
    super()
    this.angle = 0
    this.autoRotation = true
  }

  get Angle(): number {
    return this.angle
  }

  set Angle(value: number) {
    this.angle = value
  }

  get AutoRotation(): boolean {
    return this.autoRotation
  }

  set AutoRotation(value: boolean) {
    this.autoRotation = value
  }

  provideValue(serviceProvider: ILookup | null): any {
    const _autoRotation = this.AutoRotation
    return new SmartEdgeLabelModel({
      angle: _autoRotation ? this.Angle : -this.Angle,
      autoRotation: _autoRotation
    })
  }
}

class NinePositionsEdgeLabelModelExtension extends MarkupExtension {
  private angle: number
  private distance: number

  constructor() {
    super()
    this.angle = 0
    this.distance = 10.0
  }

  get Angle(): number {
    return this.angle
  }

  set Angle(value: number) {
    this.angle = value
  }

  get Distance(): number {
    return this.distance
  }

  set Distance(value: number) {
    this.distance = value
  }

  provideValue(serviceProvider: ILookup | null): any {
    return new NinePositionsEdgeLabelModel({ angle: -this.Angle, distance: this.Distance })
  }
}

