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
  type Constructor,
  GraphMLMemberVisibility,
  type IColumn,
  type ILabel,
  ILabelDefaults,
  IList,
  type ILookup,
  Insets,
  type IRow,
  IStripeDefaults,
  IStripeStyle,
  LabelDefaults,
  List,
  MarkupExtension,
  Point,
  StripeDefaults,
  type TypeMetadata,
  XmlName,
  yfiles as yfilesUnknown
} from '@yfiles/yfiles'
import { YfilesCommon_3_0_XamlNS, YfilesCommonXamlNS } from './GraphMLCompatibility'

/**
 * The usage of yfiles here is only for GraphML compatibility and shouldn't be needed elsewhere.
 */
const yfiles = yfilesUnknown as any

export function configureRenamings(callback: (oldName: XmlName, newName: XmlName) => void) {
  const nameMappings = new Map<string, string>()
  nameMappings.set(
    'NodeLabelModelStripeLabelModelParameterExtension',
    'NodeLabelModelStripeLabelModelAdapterParameterExtension'
  )
  nameMappings.forEach((value, key) =>
    callback(new XmlName(key, YfilesCommon_3_0_XamlNS), new XmlName(value, YfilesCommonXamlNS))
  )
}

export function configureExtensions(
  callback: <T>(type: Constructor<T>, metadata: TypeMetadata<T>) => void
) {
  createMetadata(
    TableExtension,
    {
      properties: {
        RelativeLocation: { type: Point },
        Insets: { type: Insets },
        Rows: { type: IList, visibility: GraphMLMemberVisibility.CONTENT },
        Columns: { type: IList, visibility: GraphMLMemberVisibility.CONTENT },
        ColumnDefaults: { type: IStripeDefaults },
        RowDefaults: { type: IStripeDefaults }
      }
    },
    callback
  )
  createMetadata(
    RowExtension,
    {
      contentProperty: 'Rows',
      properties: {
        Size: { type: Number },
        MinimumSize: { type: Number },
        Insets: { type: Insets },
        Rows: { type: IList, visibility: GraphMLMemberVisibility.CONTENT },
        Labels: { type: IList, visibility: GraphMLMemberVisibility.CONTENT },
        Style: { type: Object },
        Tag: { type: Object }
      }
    },
    callback
  )
  createMetadata(
    ColumnExtension,
    {
      contentProperty: 'Columns',
      properties: {
        Size: { type: Number },
        MinimumSize: { type: Number },
        Insets: { type: Insets },
        Columns: { type: IList, visibility: GraphMLMemberVisibility.CONTENT },
        Labels: { type: IList, visibility: GraphMLMemberVisibility.CONTENT },
        Style: { type: Object },
        Tag: { type: Object }
      }
    },
    callback
  )
  createMetadata(
    StripeDefaultsExtension,
    {
      properties: {
        Size: { type: Number },
        MinimumSize: { type: Number },
        Insets: { type: Insets },
        Style: { type: IStripeStyle },
        Labels: { type: ILabelDefaults },
        ShareStyleInstance: { type: Boolean }
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

// region Compatibility classes for Table

class TableExtension extends MarkupExtension {
  private _ColumnDefaults: IStripeDefaults | null = null

  get ColumnDefaults(): IStripeDefaults | null {
    return this._ColumnDefaults
  }

  set ColumnDefaults(value: IStripeDefaults | null) {
    this._ColumnDefaults = value
  }

  private _RowDefaults: IStripeDefaults | null = null

  get RowDefaults(): IStripeDefaults | null {
    return this._RowDefaults
  }

  set RowDefaults(value: IStripeDefaults | null) {
    this._RowDefaults = value
  }

  private _RelativeLocation: Point = Point.ORIGIN

  get RelativeLocation(): Point {
    return this._RelativeLocation
  }

  set RelativeLocation(value: Point) {
    this._RelativeLocation = value
  }

  private _Insets: Insets = new Insets(0)

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  private _Rows: IList<IRow> = new List<IRow>()

  get Rows(): IList<IRow> {
    return this._Rows
  }

  private _Columns: IList<IColumn> = new List<IColumn>()

  get Columns(): IList<IColumn> {
    return this._Columns
  }

  provideValue(serviceProvider: ILookup | null) {
    const tableExtension = new yfiles.graphml.TableExtension()
    tableExtension.padding = this._Insets
    tableExtension.relativeLocation = this._RelativeLocation
    tableExtension.columnDefaults = this._ColumnDefaults
    tableExtension.rowDefaults = this._RowDefaults
    this._Columns.forEach((c) => tableExtension.columns.add(c))
    this._Rows.forEach((c) => tableExtension.rows.add(c))
    return tableExtension.provideValue(serviceProvider)
  }
}

class RowExtension extends MarkupExtension {
  private _Tag: object | null = null

  get Tag(): object | null {
    return this._Tag
  }

  set Tag(value: object | null) {
    this._Tag = value
  }

  private _Style: object | null = null

  get Style(): object | null {
    return this._Style
  }

  set Style(value: object | null) {
    this._Style = value
  }

  private _Size = -1

  get Size(): number {
    return this._Size
  }

  set Size(value: number) {
    this._Size = value
  }

  private _MinimumSize = -1

  get MinimumSize(): number {
    return this._MinimumSize
  }

  set MinimumSize(value: number) {
    this._MinimumSize = value
  }

  private _Insets: Insets = new Insets(0)

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  private _Rows: IList<IRow> = new List<IRow>()

  get Rows(): IList<IRow> {
    return this._Rows
  }

  private _Labels: IList<ILabel> = new List<ILabel>()

  get Labels(): IList<ILabel> {
    return this._Labels
  }

  provideValue(serviceProvider: ILookup | null) {
    const rowExtension = new yfiles.graphml.RowExtension()
    rowExtension.padding = this._Insets
    rowExtension.size = this._Size
    rowExtension.minimumSize = this._MinimumSize
    rowExtension.tag = this._Tag
    rowExtension.style = this._Style
    this._Labels.forEach((c) => rowExtension.labels.add(c))
    this._Rows.forEach((c) => rowExtension.rows.add(c))
    return rowExtension.provideValue(serviceProvider)
  }
}

class ColumnExtension extends MarkupExtension {
  private _Tag: object | null = null

  get Tag(): object | null {
    return this._Tag
  }

  set Tag(value: object | null) {
    this._Tag = value
  }

  private _Style: object | null = null

  get Style(): object | null {
    return this._Style
  }

  set Style(value: object | null) {
    this._Style = value
  }

  private _Size = -1

  get Size(): number {
    return this._Size
  }

  set Size(value: number) {
    this._Size = value
  }

  private _MinimumSize = -1

  get MinimumSize(): number {
    return this._MinimumSize
  }

  set MinimumSize(value: number) {
    this._MinimumSize = value
  }

  private _Insets: Insets = new Insets(0)

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  private _Columns: IList<IColumn> = new List<IColumn>()

  get Columns(): IList<IColumn> {
    return this._Columns
  }

  private _Labels: IList<ILabel> = new List<ILabel>()

  get Labels(): IList<ILabel> {
    return this._Labels
  }

  provideValue(serviceProvider: ILookup | null) {
    const columnExtension = new yfiles.graphml.ColumnExtension()
    columnExtension.padding = this._Insets
    columnExtension.size = this._Size
    columnExtension.minimumSize = this._MinimumSize
    columnExtension.tag = this._Tag
    columnExtension.style = this._Style
    this._Labels.forEach((c) => columnExtension.labels.add(c))
    this._Columns.forEach((c) => columnExtension.columns.add(c))
    return columnExtension.provideValue(serviceProvider)
  }
}

class StripeDefaultsExtension extends MarkupExtension {
  private _Insets: Insets = new Insets(0)
  private _ShareStyleInstance = true
  private _Size = 100
  private _MinimumSize = 10
  private _Labels: ILabelDefaults = new LabelDefaults()
  private _Style = IStripeStyle.VOID_STRIPE_STYLE

  get Insets(): Insets {
    return this._Insets
  }

  set Insets(value: Insets) {
    this._Insets = value
  }

  get ShareStyleInstance(): boolean {
    return this._ShareStyleInstance
  }

  set ShareStyleInstance(value: boolean) {
    this._ShareStyleInstance = value
  }

  get Size(): number {
    return this._Size
  }

  set Size(value: number) {
    this._Size = value
  }

  get MinimumSize(): number {
    return this._MinimumSize
  }

  set MinimumSize(value: number) {
    this._MinimumSize = value
  }

  get Labels(): ILabelDefaults {
    return this._Labels
  }

  set Labels(value: ILabelDefaults) {
    this._Labels = value
  }

  get Style(): IStripeStyle {
    return this._Style
  }

  set Style(value: IStripeStyle) {
    this._Style = value
  }

  provideValue(serviceProvider: ILookup | null) {
    const stripeDefaults = new StripeDefaults()
    stripeDefaults.padding = this._Insets
    stripeDefaults.shareStyleInstance = this._ShareStyleInstance
    stripeDefaults.size = this._Size
    stripeDefaults.minimumSize = this._MinimumSize
    stripeDefaults.labels = this._Labels
    stripeDefaults.style = this._Style
    return stripeDefaults
  }
}

// endregion
