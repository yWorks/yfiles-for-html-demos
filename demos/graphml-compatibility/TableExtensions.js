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
  GraphMLMemberVisibility,
  ILabelDefaults,
  IList,
  ILookup,
  Insets,
  IStripeDefaults,
  IStripeStyle,
  LabelDefaults,
  List,
  MarkupExtension,
  Point,
  StripeDefaults,
  XmlName,
  yfiles
} from '@yfiles/yfiles'
import { YfilesCommon_3_0_XamlNS, YfilesCommonXamlNS } from './GraphMLCompatibility'
export function configureRenamings(callback) {
  const nameMappings = new Map()
  nameMappings.set(
    'NodeLabelModelStripeLabelModelParameterExtension',
    'NodeLabelModelStripeLabelModelAdapterParameterExtension'
  )
  nameMappings.forEach((value, key) =>
    callback(new XmlName(key, YfilesCommon_3_0_XamlNS), new XmlName(value, YfilesCommonXamlNS))
  )
}
export function configureExtensions(callback) {
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
function createMetadata(type, metadata, callback, ns = YfilesCommon_3_0_XamlNS) {
  metadata.name = type.name
  metadata.xmlNamespace = ns
  callback(type, metadata)
}
// region Compatibility classes for Table
class TableExtension extends MarkupExtension {
  _ColumnDefaults = null
  get ColumnDefaults() {
    return this._ColumnDefaults
  }
  set ColumnDefaults(value) {
    this._ColumnDefaults = value
  }
  _RowDefaults = null
  get RowDefaults() {
    return this._RowDefaults
  }
  set RowDefaults(value) {
    this._RowDefaults = value
  }
  _RelativeLocation = Point.ORIGIN
  get RelativeLocation() {
    return this._RelativeLocation
  }
  set RelativeLocation(value) {
    this._RelativeLocation = value
  }
  _Insets = new Insets(0)
  get Insets() {
    return this._Insets
  }
  set Insets(value) {
    this._Insets = value
  }
  _Rows = new List()
  get Rows() {
    return this._Rows
  }
  _Columns = new List()
  get Columns() {
    return this._Columns
  }
  provideValue(serviceProvider) {
    //@ts-ignore
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
  _Tag = null
  get Tag() {
    return this._Tag
  }
  set Tag(value) {
    this._Tag = value
  }
  _Style = null
  get Style() {
    return this._Style
  }
  set Style(value) {
    this._Style = value
  }
  _Size = -1
  get Size() {
    return this._Size
  }
  set Size(value) {
    this._Size = value
  }
  _MinimumSize = -1
  get MinimumSize() {
    return this._MinimumSize
  }
  set MinimumSize(value) {
    this._MinimumSize = value
  }
  _Insets = new Insets(0)
  get Insets() {
    return this._Insets
  }
  set Insets(value) {
    this._Insets = value
  }
  _Rows = new List()
  get Rows() {
    return this._Rows
  }
  _Labels = new List()
  get Labels() {
    return this._Labels
  }
  provideValue(serviceProvider) {
    //@ts-ignore
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
  _Tag = null
  get Tag() {
    return this._Tag
  }
  set Tag(value) {
    this._Tag = value
  }
  _Style = null
  get Style() {
    return this._Style
  }
  set Style(value) {
    this._Style = value
  }
  _Size = -1
  get Size() {
    return this._Size
  }
  set Size(value) {
    this._Size = value
  }
  _MinimumSize = -1
  get MinimumSize() {
    return this._MinimumSize
  }
  set MinimumSize(value) {
    this._MinimumSize = value
  }
  _Insets = new Insets(0)
  get Insets() {
    return this._Insets
  }
  set Insets(value) {
    this._Insets = value
  }
  _Columns = new List()
  get Columns() {
    return this._Columns
  }
  _Labels = new List()
  get Labels() {
    return this._Labels
  }
  provideValue(serviceProvider) {
    //@ts-ignore
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
  _Insets = new Insets(0)
  _ShareStyleInstance = true
  _Size = 100
  _MinimumSize = 10
  _Labels = new LabelDefaults()
  _Style = IStripeStyle.VOID_STRIPE_STYLE
  get Insets() {
    return this._Insets
  }
  set Insets(value) {
    this._Insets = value
  }
  get ShareStyleInstance() {
    return this._ShareStyleInstance
  }
  set ShareStyleInstance(value) {
    this._ShareStyleInstance = value
  }
  get Size() {
    return this._Size
  }
  set Size(value) {
    this._Size = value
  }
  get MinimumSize() {
    return this._MinimumSize
  }
  set MinimumSize(value) {
    this._MinimumSize = value
  }
  get Labels() {
    return this._Labels
  }
  set Labels(value) {
    this._Labels = value
  }
  get Style() {
    return this._Style
  }
  set Style(value) {
    this._Style = value
  }
  provideValue(serviceProvider) {
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
