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
  Arrow,
  BaseClass,
  CollapsibleNodeStyleDecorator,
  Color,
  type Constructor,
  ExteriorNodeLabelModel,
  Fill,
  Font,
  GeneralPath,
  GeneralPathNodeStyle,
  GroupNodeStyle,
  GroupNodeStyleIconBackgroundShape,
  GroupNodeStyleIconPosition,
  GroupNodeStyleIconType,
  GroupNodeStyleTabPosition,
  GroupNodeStyleTabSizePolicy,
  HorizontalTextAlignment,
  IArrow,
  IBoundsProvider,
  IconLabelStyle,
  IEdgeStyleRenderer,
  IHitTestable,
  ILabelModelParameter,
  ILabelStyle,
  ILabelStyleRenderer,
  ILassoTestable,
  ILookup,
  ImageNodeStyle,
  IMarqueeTestable,
  INodeStyle,
  INodeStyleRenderer,
  Insets,
  InteriorNodeLabelModel,
  InteriorNodeLabelModelPosition,
  IPathGeometry,
  IPortStyleRenderer,
  IShapeGeometry,
  IStripeStyleRenderer,
  IVisibilityTestable,
  IVisualCreator,
  LabelShape,
  LabelStyle,
  MarkupExtension,
  MarkupLabelStyle,
  NodeStyleLabelStyleAdapter,
  Point,
  ShadowNodeStyleDecorator,
  ShapeNodeStyle,
  Size,
  Stroke,
  Tangent,
  type TypeMetadata,
  VerticalTextAlignment,
  XmlName,
  yfiles
} from '@yfiles/yfiles'
import { YfilesForHtml_2_0_XamlNS, YfilesForHtmlXamlNS } from './GraphMLCompatibility'
import { BevelNodeStyle } from './BevelNodeStyle'
import { ShinyPlateNodeStyle } from './ShinyPlateNodeStyle'
import { PanelNodeStyle } from './PanelNodeStyle'
import { ShapeNodeShape as LegacyShapeNodeShape, ShapeNodeStyles } from './ShapeNodeStyle'
import {
  StringTemplateLabelStyleExtension,
  StringTemplateNodeStyleExtension,
  StringTemplatePortStyleExtension
} from '@yfiles/demo-utils/template-styles/MarkupExtensions'
import {
  TemplateLabelStyle,
  TemplateNodeStyle,
  TemplatePortStyle
} from '@yfiles/demo-utils/template-styles/TemplateStyles'

/**
 * The usage of yfiles.lang.Enum here is only for GraphML compatibility, and shouldn't be needed
 * elsewhere. For enums in your own application, use either TypeScript enums or a simple keyed
 * object with constants.
 */
const Enum = (yfiles as any).lang.Enum

export function configureRenamings(callback: (oldName: XmlName, newName: XmlName) => void) {
  const nameMappings = new Map<string, string>()
  nameMappings.forEach((value, key) =>
    callback(new XmlName(key, YfilesForHtml_2_0_XamlNS), new XmlName(value, YfilesForHtmlXamlNS))
  )
}

export function configureExtensions(
  callback: <T>(type: Constructor<T>, metadata: TypeMetadata<T>) => void
) {
  createMetadata(VoidPortStyleRenderer, { singletonContainers: [VoidPortStyleRenderer] }, callback)
  createMetadata(VoidEdgeStyleRenderer, { singletonContainers: [VoidEdgeStyleRenderer] }, callback)
  createMetadata(
    VoidLabelStyleRenderer,
    { singletonContainers: [VoidLabelStyleRenderer] },
    callback
  )
  createMetadata(VoidNodeStyleRenderer, { singletonContainers: [VoidNodeStyleRenderer] }, callback)
  createMetadata(
    VoidStripeStyleRenderer,
    { singletonContainers: [VoidStripeStyleRenderer] },
    callback
  )
  createMetadata(VoidPathGeometry, { singletonContainers: [VoidPathGeometry] }, callback)
  createMetadata(VoidShapeGeometry, { singletonContainers: [VoidShapeGeometry] }, callback)
  createMetadata(
    ShadowNodeStyleDecoratorExtension,
    {
      contentProperty: 'Wrapped',
      properties: { Wrapped: { type: INodeStyle } }
    },
    callback
  )
  createMetadata(
    GroupNodeStyleExtension,
    {
      properties: {
        contentAreaFill: { type: Fill },
        contentAreaInsets: { type: Insets },
        cornerRadius: { type: Number },
        cssClass: { type: String },
        drawShadow: { type: Boolean },
        folderIcon: { type: GroupNodeStyleIconType },
        groupIcon: { type: GroupNodeStyleIconType },
        hitTransparentContentArea: { type: Boolean },
        iconBackgroundFill: { type: Fill },
        iconBackgroundShape: { type: GroupNodeStyleIconBackgroundShape },
        iconForegroundFill: { type: Fill },
        iconOffset: { type: Number },
        iconPosition: { type: GroupNodeStyleIconPosition },
        iconSize: { type: Number },
        minimumContentAreaSize: { type: Size },
        renderTransparentContentArea: { type: Boolean },
        showFolderContentArea: { type: Boolean },
        stroke: { type: Stroke },
        tabBackgroundFill: { type: Fill },
        tabHeight: { type: Number },
        tabInset: { type: Number },
        tabPosition: { type: GroupNodeStyleTabPosition },
        tabSizePolicy: { type: GroupNodeStyleTabSizePolicy },
        tabSlope: { type: Number },
        tabWidth: { type: Number },
        tabFill: { type: Fill }
      }
    },
    callback
  )
  createMetadata(
    CollapsibleNodeStyleDecoratorExtension,
    {
      contentProperty: 'wrapped',
      properties: {
        wrapped: { type: INodeStyle },
        buttonPlacement: { type: ILabelModelParameter },
        insets: { type: Insets }
      }
    },
    callback
  )
  createMetadata(
    ImageNodeStyleExtension,
    {
      contentProperty: 'image',
      properties: {
        aspectRatio: { type: Number },
        image: { type: String },
        fallbackImage: { type: String },
        cssClass: { type: String },
        normalizedOutline: { type: GeneralPath }
      }
    },
    callback
  )
  createMetadata(
    ShapeNodeStyleExtension,
    {
      properties: {
        fill: { type: Fill },
        keepIntrinsicAspectRatio: { type: Boolean },
        cssClass: { type: String },
        stroke: { type: Stroke },
        shape: { type: ShapeNodeShape }
      }
    },
    callback
  )
  createMetadata(
    BevelNodeStyle,
    {
      properties: {
        drawShadow: { default: false, type: Boolean },
        color: { default: Color.BLACK, type: Color },
        inset: { default: 3, type: Number },
        radius: { default: 10, type: Number }
      }
    },
    callback
  )
  createMetadata(
    ShinyPlateNodeStyle,
    {
      properties: {
        drawShadow: { default: true, type: Boolean },
        fill: { default: Color.BLACK, type: Fill },
        stroke: { default: null, type: Stroke },
        insets: { default: new Insets(5), type: Insets },
        radius: { default: 5, type: Number }
      }
    },
    callback
  )
  createMetadata(
    PanelNodeStyle,
    {
      properties: {
        color: { default: Color.BLACK, type: Color },
        labelInsetsColor: { default: Color.LIGHT_GRAY, type: Color },
        insets: { default: new Insets(5), type: Insets }
      }
    },
    callback
  )
  createMetadata(
    DefaultLabelStyleExtension,
    {
      properties: {
        autoFlip: { type: Boolean },
        backgroundFill: { type: Fill },
        backgroundStroke: { type: Stroke },
        clipText: { type: Boolean },
        cssClass: { type: String },
        font: { type: Font },
        horizontalTextAlignment: { type: HorizontalTextAlignment },
        insets: { type: Insets },
        maximumSize: { type: Size },
        minimumSize: { type: Size },
        shape: { type: LabelShape },
        textSize: { type: Number },
        textFill: { type: Fill },
        textWrappingPadding: { type: Number },
        textWrappingShape: { type: TextWrappingShape },
        verticalTextAlignment: { type: VerticalTextAlignment },
        wrapping: { type: TextWrapping }
      }
    },
    callback
  )
  createMetadata(
    MarkupLabelStyleExtension,
    {
      properties: {
        autoFlip: { type: Boolean },
        backgroundFill: { type: Fill },
        backgroundStroke: { type: Stroke },
        clipText: { type: Boolean },
        cssClass: { type: String },
        font: { type: Font },
        horizontalTextAlignment: { type: HorizontalTextAlignment },
        insets: { type: Insets },
        maximumSize: { type: Size },
        minimumSize: { type: Size },
        shape: { type: LabelShape },
        textSize: { type: Number },
        textFill: { type: Fill },
        textWrappingPadding: { type: Number },
        textWrappingShape: { type: TextWrappingShape },
        verticalTextAlignment: { type: VerticalTextAlignment },
        wrapping: { type: TextWrapping }
      }
    },
    callback
  )
  createMetadata(
    IconLabelStyleExtension,
    {
      contentProperty: 'wrapped',
      properties: {
        autoFlip: { type: Boolean },
        cssClass: { type: String },
        icon: { type: String },
        iconPlacement: { type: ILabelModelParameter },
        iconSize: { type: Size },
        wrapped: { type: ILabelStyle },
        wrappedInsets: { type: Insets }
      }
    },
    callback
  )
  createMetadata(
    NodeStyleLabelStyleAdapterExtension,
    {
      properties: {
        autoFlip: { type: Boolean },
        labelStyle: { type: ILabelStyle },
        labelStyleInsets: { type: Insets },
        nodeStyle: { type: INodeStyle }
      }
    },
    callback
  )
  createMetadata(
    ArrowExtension,
    {
      properties: {
        cropLength: { type: Number },
        fill: { type: Fill },
        isFrozen: { type: Boolean },
        scale: { type: Number },
        stroke: { type: Stroke },
        type: { type: ArrowType }
      }
    },
    callback
  )
  createMetadata(
    IArrow,
    {
      stringConversion: {
        fromString: (s, context) => {
          switch (s) {
            case 'DEFAULT':
              return ArrowExtension.DEFAULT
            case 'SIMPLE':
              return ArrowExtension.SIMPLE
            case 'SHORT':
              return ArrowExtension.SHORT
            case 'DIAMOND':
              return ArrowExtension.DIAMOND
            case 'NONE':
              return ArrowExtension.NONE
            case 'CIRCLE':
              return ArrowExtension.CIRCLE
            case 'CROSS':
              return ArrowExtension.CROSS
            case 'TRIANGLE':
              return ArrowExtension.TRIANGLE
            case 'None':
              return IArrow.NONE
          }
        },
        toString: (s, context) => {
          if (s === IArrow.NONE) {
            return 'None'
          }
        }
      }
    },
    callback
  )
  //Enable backwards reading compatibility for StringTemplateStyles:
  createMetadata(
    StringTemplateNodeStyleExtension,
    {
      contentProperty: 'svgContent',
      properties: {
        svgContent: { type: String, default: '' },
        cssClass: { type: String, default: '' },
        styleTag: { default: undefined },
        insets: { type: Insets, default: new Insets(5) },
        minimumSize: { type: Size, default: Size.EMPTY },
        normalizedOutline: { type: GeneralPath, default: undefined }
      }
    },
    callback
  )
  createMetadata(
    StringTemplateLabelStyleExtension,
    {
      contentProperty: 'svgContent',
      properties: {
        svgContent: { type: String, default: '' },
        cssClass: { type: String, default: '' },
        styleTag: { default: undefined },
        autoFlip: { type: Boolean, default: true },
        preferredSize: { type: Size, default: Size.EMPTY },
        normalizedOutline: { type: GeneralPath, default: undefined }
      }
    },
    callback
  )
  createMetadata(
    StringTemplatePortStyleExtension,
    {
      contentProperty: 'svgContent',
      properties: {
        svgContent: { type: String, default: '' },
        cssClass: { type: String, default: '' },
        styleTag: { default: undefined },
        offset: { type: Point, default: Point.ORIGIN },
        renderSize: { type: Size, default: new Size(5, 5) },
        normalizedOutline: { type: GeneralPath, default: undefined }
      }
    },
    callback
  )
  //Enable backwards reading compatibility for TemplateStyles:
  createMetadata(
    TemplateNodeStyleExtension,
    {
      properties: {
        styleResourceKey: { type: String, default: '' },
        cssClass: { type: String, default: '' },
        styleTag: { default: undefined },
        insets: { type: Insets, default: new Insets(5) },
        minimumSize: { type: Size, default: Size.EMPTY },
        normalizedOutline: { type: GeneralPath, default: undefined }
      }
    },
    callback
  )
  createMetadata(
    TemplateLabelStyleExtension,
    {
      properties: {
        styleResourceKey: { type: String, default: '' },
        cssClass: { type: String, default: '' },
        styleTag: { default: undefined },
        autoFlip: { type: Boolean, default: true },
        preferredSize: { type: Size, default: Size.EMPTY },
        normalizedOutline: { type: GeneralPath, default: undefined }
      }
    },
    callback
  )
  createMetadata(
    TemplatePortStyleExtension,
    {
      properties: {
        styleResourceKey: { type: String, default: '' },
        cssClass: { type: String, default: '' },
        styleTag: { default: undefined },
        offset: { type: Point, default: Point.ORIGIN },
        renderSize: { type: Size, default: new Size(5, 5) },
        normalizedOutline: { type: GeneralPath, default: undefined }
      }
    },
    callback
  )
}

function createMetadata<T>(
  type: Constructor<T>,
  metadata: TypeMetadata<T>,
  callback: <T>(type: Constructor<T>, metadata: TypeMetadata<T>) => void,
  ns: string = YfilesForHtml_2_0_XamlNS
): void {
  metadata.name = (type as Function).name
  metadata.xmlNamespace = ns
  callback(type, metadata)
}

// region Compatibility classes for void styles

class VoidPortStyleRenderer extends BaseClass(IPortStyleRenderer) implements IPortStyleRenderer {
  private static readonly _instance = new VoidPortStyleRenderer()

  static get Instance(): VoidPortStyleRenderer {
    return this._instance
  }

  getBoundsProvider(): IBoundsProvider {
    return IBoundsProvider.EMPTY
  }

  getContext(): ILookup {
    return ILookup.EMPTY
  }

  getHitTestable(): IHitTestable {
    return IHitTestable.NEVER
  }

  getLassoTestable(): ILassoTestable {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable(): IMarqueeTestable {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable(): IVisibilityTestable {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator(): IVisualCreator {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidEdgeStyleRenderer extends BaseClass(IEdgeStyleRenderer) implements IEdgeStyleRenderer {
  private static readonly _instance = new VoidEdgeStyleRenderer()

  static get Instance(): VoidEdgeStyleRenderer {
    return this._instance
  }

  getPathGeometry(): IPathGeometry {
    return VoidPathGeometry.Instance
  }

  getBoundsProvider(): IBoundsProvider {
    return IBoundsProvider.EMPTY
  }

  getContext(): ILookup {
    return ILookup.EMPTY
  }

  getHitTestable(): IHitTestable {
    return IHitTestable.NEVER
  }

  getLassoTestable(): ILassoTestable {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable(): IMarqueeTestable {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable(): IVisibilityTestable {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator(): IVisualCreator {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidLabelStyleRenderer extends BaseClass(ILabelStyleRenderer) implements ILabelStyleRenderer {
  private static readonly _instance = new VoidLabelStyleRenderer()

  static get Instance(): VoidLabelStyleRenderer {
    return this._instance
  }

  getPreferredSize(): Size {
    return Size.EMPTY
  }

  getBoundsProvider(): IBoundsProvider {
    return IBoundsProvider.EMPTY
  }

  getContext(): ILookup {
    return ILookup.EMPTY
  }

  getHitTestable(): IHitTestable {
    return IHitTestable.NEVER
  }

  getLassoTestable(): ILassoTestable {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable(): IMarqueeTestable {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable(): IVisibilityTestable {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator(): IVisualCreator {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidNodeStyleRenderer extends BaseClass(INodeStyleRenderer) implements INodeStyleRenderer {
  private static readonly _instance = new VoidNodeStyleRenderer()

  static get Instance(): VoidNodeStyleRenderer {
    return this._instance
  }

  getShapeGeometry(): IShapeGeometry {
    return IShapeGeometry.VOID_SHAPE_GEOMETRY
  }

  getBoundsProvider(): IBoundsProvider {
    return IBoundsProvider.EMPTY
  }

  getContext(): ILookup {
    return ILookup.EMPTY
  }

  getHitTestable(): IHitTestable {
    return IHitTestable.NEVER
  }

  getLassoTestable(): ILassoTestable {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable(): IMarqueeTestable {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable(): IVisibilityTestable {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator(): IVisualCreator {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidStripeStyleRenderer
  extends BaseClass(IStripeStyleRenderer)
  implements IStripeStyleRenderer
{
  private static readonly _instance = new VoidStripeStyleRenderer()

  static get Instance(): VoidStripeStyleRenderer {
    return this._instance
  }

  getContext(): ILookup {
    return ILookup.EMPTY
  }

  getVisualCreator(): IVisualCreator {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidShapeGeometry extends BaseClass() {
  private static readonly _instance = IShapeGeometry.VOID_SHAPE_GEOMETRY

  static get Instance(): IShapeGeometry {
    return this._instance
  }
}

class VoidPathGeometry extends BaseClass(IPathGeometry) implements IPathGeometry {
  private static readonly _instance = new VoidPathGeometry()

  static get Instance(): VoidPathGeometry {
    return this._instance
  }

  getPath(): GeneralPath | null {
    return null
  }

  getSegmentCount(): number {
    return 0
  }

  getTangent(): Tangent | null {
    return null
  }

  getTangentForSegment(): Tangent | null {
    return null
  }
}


// region Compatibility classes for ShadowNodeStyleDecorator

class ShadowNodeStyleDecoratorExtension extends MarkupExtension {
  private _Wrapped: INodeStyle = new ShapeNodeStyle()

  get Wrapped(): INodeStyle {
    return this._Wrapped
  }

  set Wrapped(value: INodeStyle) {
    this._Wrapped = value
  }

  provideValue() {
    return new ShadowNodeStyleDecorator(this._Wrapped)
  }
}


// region Compatibility classes for GroupNodeStyle

class GroupNodeStyleExtension extends MarkupExtension {
  private static readonly defaultTabFill = new Color(170, 170, 170, 255)

  private _contentAreaInsets = new Insets(4)

  get contentAreaInsets(): Insets {
    return this._contentAreaInsets
  }

  set contentAreaInsets(value: Insets) {
    this._contentAreaInsets = value
  }

  private _cornerRadius = 4

  get cornerRadius(): number {
    return this._cornerRadius
  }

  set cornerRadius(value: number) {
    this._cornerRadius = value
  }

  private _tabSlope = 0.5

  get tabSlope(): number {
    return this._tabSlope
  }

  set tabSlope(value: number) {
    this._tabSlope = value
  }

  private _tabWidth = 50

  get tabWidth(): number {
    return this._tabWidth
  }

  set tabWidth(value: number) {
    this._tabWidth = value
  }

  private _tabHeight = 18

  get tabHeight(): number {
    return this._tabHeight
  }

  set tabHeight(value: number) {
    this._tabHeight = value
  }

  private _tabInset = 4

  get tabInset(): number {
    return this._tabInset
  }

  set tabInset(value: number) {
    this._tabInset = value
  }

  private _tabPosition = GroupNodeStyleTabPosition.TOP

  get tabPosition(): GroupNodeStyleTabPosition {
    return this._tabPosition
  }

  set tabPosition(value: GroupNodeStyleTabPosition) {
    this._tabPosition = value
  }

  private _tabSizePolicy = GroupNodeStyleTabSizePolicy.FIXED

  get tabSizePolicy(): GroupNodeStyleTabSizePolicy {
    return this._tabSizePolicy
  }

  set tabSizePolicy(value: GroupNodeStyleTabSizePolicy) {
    this._tabSizePolicy = value
  }

  private _iconPosition = GroupNodeStyleIconPosition.TRAILING

  get iconPosition(): GroupNodeStyleIconPosition {
    return this._iconPosition
  }

  set iconPosition(value: GroupNodeStyleIconPosition) {
    this._iconPosition = value
  }

  private _groupIcon = GroupNodeStyleIconType.NONE

  get groupIcon(): GroupNodeStyleIconType {
    return this._groupIcon
  }

  set groupIcon(value: GroupNodeStyleIconType) {
    this._groupIcon = value
  }

  private _iconBackgroundShape = GroupNodeStyleIconBackgroundShape.ROUND_RECTANGLE_SOLID

  get iconBackgroundShape(): GroupNodeStyleIconBackgroundShape {
    return this._iconBackgroundShape
  }

  set iconBackgroundShape(value: GroupNodeStyleIconBackgroundShape) {
    this._iconBackgroundShape = value
  }

  private _folderIcon = GroupNodeStyleIconType.PLUS

  get folderIcon(): GroupNodeStyleIconType {
    return this._folderIcon
  }

  set folderIcon(value: GroupNodeStyleIconType) {
    this._folderIcon = value
  }

  private _iconBackgroundFill: Fill | null = Color.WHITE

  get iconBackgroundFill(): Fill | null {
    return this._iconBackgroundFill
  }

  set iconBackgroundFill(value: Fill | null) {
    this._iconBackgroundFill = value
  }

  private _iconForegroundFill: Fill | null = GroupNodeStyleExtension.defaultTabFill

  get iconForegroundFill(): Fill | null {
    return this._iconForegroundFill
  }

  set iconForegroundFill(value: Fill | null) {
    this._iconForegroundFill = value
  }

  private _iconSize = 14

  get iconSize(): number {
    return this._iconSize
  }

  set iconSize(value: number) {
    this._iconSize = value
  }

  private _iconOffset = 0

  get iconOffset(): number {
    return this._iconOffset
  }

  set iconOffset(value: number) {
    this._iconOffset = value
  }

  private _drawShadow = false

  get drawShadow(): boolean {
    return this._drawShadow
  }

  set drawShadow(value: boolean) {
    this._drawShadow = value
  }

  private _minimumContentAreaSize = new Size(0, 0)

  get minimumContentAreaSize(): Size {
    return this._minimumContentAreaSize
  }

  set minimumContentAreaSize(value: Size) {
    this._minimumContentAreaSize = value
  }

  private _hitTransparentContentArea = false

  get hitTransparentContentArea(): boolean {
    return this._hitTransparentContentArea
  }

  set hitTransparentContentArea(value: boolean) {
    this._hitTransparentContentArea = value
  }

  private _renderTransparentContentArea = false

  get renderTransparentContentArea(): boolean {
    return this._renderTransparentContentArea
  }

  set renderTransparentContentArea(value: boolean) {
    this._renderTransparentContentArea = value
  }

  private _showFolderContentArea = false

  get showFolderContentArea(): boolean {
    return this._showFolderContentArea
  }

  set showFolderContentArea(value: boolean) {
    this._showFolderContentArea = value
  }

  private _tabBackgroundFill: Fill | null = null

  get tabBackgroundFill(): Fill | null {
    return this._tabBackgroundFill
  }

  set tabBackgroundFill(value: Fill | null) {
    this._tabBackgroundFill = value
  }

  private _contentAreaFill: Fill | null = Color.WHITE

  get contentAreaFill(): Fill | null {
    return this._contentAreaFill
  }

  set contentAreaFill(value: Fill | null) {
    this._contentAreaFill = value
  }

  private _tabFill: Fill | null = GroupNodeStyleExtension.defaultTabFill

  get tabFill(): Fill | null {
    return this._tabFill
  }

  set tabFill(value: Fill | null) {
    this._tabFill = value
  }

  private _stroke: Stroke | null = null

  get stroke(): Stroke | null {
    return this._stroke
  }

  set stroke(value: Stroke | null) {
    this._stroke = value
  }

  private _cssClass = ''

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  provideValue() {
    return new GroupNodeStyle({
      contentAreaFill: this._contentAreaFill,
      contentAreaPadding: this._contentAreaInsets,
      cornerRadius: this._cornerRadius,
      cssClass: this._cssClass,
      drawShadow: this._drawShadow,
      folderIcon: this._folderIcon,
      groupIcon: this._groupIcon,
      hitTransparentContentArea: this._hitTransparentContentArea,
      iconBackgroundFill: this._iconBackgroundFill,
      iconBackgroundShape: this._iconBackgroundShape,
      iconForegroundFill: this._iconForegroundFill,
      iconOffset: this._iconOffset,
      iconPosition: this._iconPosition,
      iconSize: this._iconSize,
      minimumContentAreaSize: this._minimumContentAreaSize,
      renderTransparentContentArea: this._renderTransparentContentArea,
      showFolderContentArea: this._showFolderContentArea,
      stroke: this._stroke,
      tabBackgroundFill: this._tabBackgroundFill,
      tabHeight: this._tabHeight,
      tabPadding: this._tabInset,
      tabPosition: this._tabPosition,
      tabSizePolicy: this._tabSizePolicy,
      tabSlope: this._tabSlope,
      tabWidth: this._tabWidth,
      tabFill: this._tabFill
    })
  }
}


// region Compatibility classes for CollapsibleNodeStyleDecorator

class CollapsibleNodeStyleDecoratorExtension extends MarkupExtension {
  private _insets: Insets = new Insets(16, 5, 5, 5)

  get insets(): Insets {
    return this._insets
  }

  set insets(value: Insets) {
    this._insets = value
  }

  private _wrapped: INodeStyle | null = null

  get wrapped(): INodeStyle | null {
    return this._wrapped
  }

  set wrapped(value: INodeStyle | null) {
    this._wrapped = value
  }

  private _buttonPlacement: ILabelModelParameter = new InteriorNodeLabelModel({
    padding: new Insets(0)
  }).createParameter(InteriorNodeLabelModelPosition.TOP_LEFT)

  get buttonPlacement(): ILabelModelParameter {
    return this._buttonPlacement
  }

  set buttonPlacement(value: ILabelModelParameter) {
    this._buttonPlacement = value
  }

  provideValue() {
    return new CollapsibleNodeStyleDecorator({
      padding: this._insets,
      wrappedStyle: this._wrapped ?? new ShapeNodeStyle(),
      buttonPlacement: this._buttonPlacement
    })
  }
}


// region Compatibility classes for ImageNodeStyle

class ImageNodeStyleExtension extends MarkupExtension {
  private _aspectRatio = 0

  get aspectRatio(): number {
    return this._aspectRatio
  }

  set aspectRatio(value: number) {
    this._aspectRatio = value
  }

  private _image: string | null = null

  get image(): string | null {
    return this._image
  }

  set image(value: string | null) {
    this._image = value
  }

  private _fallbackImage: string | null = null

  get fallbackImage(): string | null {
    return this._fallbackImage
  }

  set fallbackImage(value: string | null) {
    this._fallbackImage = value
  }

  private _cssClass = ''

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  private _normalizedOutline: GeneralPath | null = null

  get normalizedOutline(): GeneralPath | null {
    return this._normalizedOutline
  }

  set normalizedOutline(value: GeneralPath | null) {
    this._normalizedOutline = value
  }

  provideValue() {
    return new ImageNodeStyle({
      aspectRatio: this._aspectRatio,
      href: this._image ?? '',
      cssClass: this._cssClass,
      normalizedOutline: this._normalizedOutline
    })
  }
}


// region Compatibility classes for ShapeNodeStyle

const ShapeNodeShape = (Enum as any)('ShapeNodeShape', {
  //@ts-ignore
  RECTANGLE: yfiles.styles.ShapeNodeShape.RECTANGLE,
  //@ts-ignore
  ROUND_RECTANGLE: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
  //@ts-ignore
  ELLIPSE: yfiles.styles.ShapeNodeShape.ELLIPSE,
  //@ts-ignore
  TRIANGLE: yfiles.styles.ShapeNodeShape.TRIANGLE,
  //@ts-ignore
  TRIANGLE2: yfiles.styles.ShapeNodeShape.TRIANGLE_POINTING_DOWN,
  SHEARED_RECTANGLE: LegacyShapeNodeShape.SHEARED_RECTANGLE,
  SHEARED_RECTANGLE2: LegacyShapeNodeShape.SHEARED_RECTANGLE2,
  TRAPEZ: LegacyShapeNodeShape.TRAPEZ,
  TRAPEZ2: LegacyShapeNodeShape.TRAPEZ2,
  STAR5: LegacyShapeNodeShape.STAR5,
  //@ts-ignore
  STAR6: yfiles.styles.ShapeNodeShape.STAR6,
  //@ts-ignore
  STAR8: yfiles.styles.ShapeNodeShape.STAR8,
  FAT_ARROW: LegacyShapeNodeShape.FAT_ARROW,
  FAT_ARROW2: LegacyShapeNodeShape.FAT_ARROW2,
  //@ts-ignore
  DIAMOND: yfiles.styles.ShapeNodeShape.DIAMOND,
  //@ts-ignore
  OCTAGON: yfiles.styles.ShapeNodeShape.OCTAGON,
  //@ts-ignore
  HEXAGON: yfiles.styles.ShapeNodeShape.HEXAGON,
  //@ts-ignore
  HEXAGON2: yfiles.styles.ShapeNodeShape.HEXAGON_STANDING,
  STAR5_UP: LegacyShapeNodeShape.STAR5_UP,
  //@ts-ignore
  PILL: yfiles.styles.ShapeNodeShape.PILL
})

class ShapeNodeStyleExtension extends MarkupExtension {
  private _fill: Fill | null = Color.WHITE

  get fill(): Fill | null {
    return this._fill
  }

  set fill(value: Fill | null) {
    this._fill = value
  }

  private _shape: number = ShapeNodeShape.RECTANGLE

  get shape(): number {
    return this._shape
  }

  set shape(value: number) {
    this._shape = value
  }

  private _keepIntrinsicAspectRatio = false

  get keepIntrinsicAspectRatio(): boolean {
    return this._keepIntrinsicAspectRatio
  }

  set keepIntrinsicAspectRatio(value: boolean) {
    this._keepIntrinsicAspectRatio = value
  }

  private _cssClass = ''

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  private _stroke: Stroke | null = Stroke.BLACK

  get stroke(): Stroke | null {
    return this._stroke
  }

  set stroke(value: Stroke | null) {
    this._stroke = value
  }

  provideValue() {
    switch (this._shape) {
      case ShapeNodeShape.SHEARED_RECTANGLE:
      case ShapeNodeShape.SHEARED_RECTANGLE2:
      case ShapeNodeShape.TRAPEZ:
      case ShapeNodeShape.TRAPEZ2:
      case ShapeNodeShape.STAR5:
      case ShapeNodeShape.FAT_ARROW:
      case ShapeNodeShape.FAT_ARROW2:
      case ShapeNodeShape.STAR5_UP:
        const path = ShapeNodeStyles.getPath(this._shape, this._keepIntrinsicAspectRatio)
        const ar = ShapeNodeStyles.getIntrinsicAspectRatio(this._shape)

        return new GeneralPathNodeStyle({
          fill: this._fill,
          aspectRatio: this._keepIntrinsicAspectRatio ? ar : 0,
          cssClass: this._cssClass,
          stroke: this._stroke,
          path: path
        })
      default:
        return new ShapeNodeStyle({
          fill: this._fill,
          keepIntrinsicAspectRatio: this._keepIntrinsicAspectRatio,
          cssClass: this._cssClass,
          stroke: this._stroke,
          shape: this._shape
        })
    }
  }
}


// region Compatibility classes for DefaultLabelStyle

const TextWrappingShape = (Enum as any)('TextWrappingShape', {
  //@ts-ignore
  RECTANGLE: yfiles.styles.TextWrappingShape.RECTANGLE,
  //@ts-ignore
  ROUND_RECTANGLE: yfiles.styles.TextWrappingShape.ROUND_RECTANGLE,
  //@ts-ignore
  ELLIPSE: yfiles.styles.TextWrappingShape.ELLIPSE,
  //@ts-ignore
  TRIANGLE: yfiles.styles.TextWrappingShape.TRIANGLE,
  //@ts-ignore
  TRIANGLE2: yfiles.styles.TextWrappingShape.TRIANGLE_POINTING_DOWN,
  //@ts-ignore
  SHEARED_RECTANGLE: yfiles.styles.TextWrappingShape.RECTANGLE,
  //@ts-ignore
  SHEARED_RECTANGLE2: yfiles.styles.TextWrappingShape.RECTANGLE,
  //@ts-ignore
  TRAPEZ: yfiles.styles.TextWrappingShape.RECTANGLE,
  //@ts-ignore
  TRAPEZ2: yfiles.styles.TextWrappingShape.RECTANGLE,
  //@ts-ignore
  DIAMOND: yfiles.styles.TextWrappingShape.DIAMOND,
  //@ts-ignore
  OCTAGON: yfiles.styles.TextWrappingShape.OCTAGON,
  //@ts-ignore
  HEXAGON: yfiles.styles.TextWrappingShape.HEXAGON,
  //@ts-ignore
  HEXAGON2: yfiles.styles.TextWrappingShape.HEXAGON_STANDING,
  //@ts-ignore
  PILL: yfiles.styles.TextWrappingShape.PILL,
  //@ts-ignore
  LABEL_SHAPE: yfiles.styles.TextWrappingShape.LABEL_SHAPE
})

// @ts-ignore
const TextWrapping = (Enum as any)('TextWrapping', {
  // @ts-ignore
  NONE: yfiles.view.TextWrapping.NONE,
  // @ts-ignore
  CHARACTER: yfiles.view.TextWrapping.WRAP_CHARACTER,
  // @ts-ignore
  CHARACTER_ELLIPSIS: yfiles.view.TextWrapping.WRAP_CHARACTER_ELLIPSIS,
  // @ts-ignore
  WORD: yfiles.view.TextWrapping.WRAP_WORD,
  // @ts-ignore
  WORD_ELLIPSIS: yfiles.view.TextWrapping.WRAP_WORD_ELLIPSIS
})

class DefaultLabelStyleExtension extends MarkupExtension {
  private _autoFlip: boolean = true

  get autoFlip(): boolean {
    return this._autoFlip
  }

  set autoFlip(value: boolean) {
    this._autoFlip = value
  }

  private _backgroundFill: Fill | null = null

  get backgroundFill(): Fill | null {
    return this._backgroundFill
  }

  set backgroundFill(value: Fill | null) {
    this._backgroundFill = value
  }

  private _backgroundStroke: Stroke | null = null

  get backgroundStroke(): Stroke | null {
    return this._backgroundStroke
  }

  set backgroundStroke(value: Stroke | null) {
    this._backgroundStroke = value
  }

  private _clipText = true

  get clipText(): boolean {
    return this._clipText
  }

  set clipText(value: boolean) {
    this._clipText = value
  }

  private _cssClass = ''

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  private _font = new Font('Arial', 12)

  get font(): Font {
    return this._font
  }

  set font(value: Font) {
    this._font = value
  }

  private _horizontalTextAlignment = HorizontalTextAlignment.LEFT

  get horizontalTextAlignment(): HorizontalTextAlignment {
    return this._horizontalTextAlignment
  }

  set horizontalTextAlignment(value: HorizontalTextAlignment) {
    this._horizontalTextAlignment = value
  }

  private _insets = Insets.EMPTY

  get insets(): Insets {
    return this._insets
  }

  set insets(value: Insets) {
    this._insets = value
  }

  private _maximumSize = Size.INFINITE

  get maximumSize(): Size {
    return this._maximumSize
  }

  set maximumSize(value: Size) {
    this._maximumSize = value
  }

  private _minimumSize = Size.ZERO

  get minimumSize(): Size {
    return this._minimumSize
  }

  set minimumSize(value: Size) {
    this._minimumSize = value
  }

  private _shape = LabelShape.RECTANGLE

  get shape(): LabelShape {
    return this._shape
  }

  set shape(value: LabelShape) {
    this._shape = value
  }

  private _textSize = 12

  get textSize(): number {
    return this._textSize
  }

  set textSize(value: number) {
    this._textSize = value
  }

  private _textFill: Fill = Color.BLACK

  get textFill(): Fill {
    return this._textFill
  }

  set textFill(value: Fill) {
    this._textFill = value
  }

  private _textWrappingPadding = 0

  get textWrappingPadding(): number {
    return this._textWrappingPadding
  }

  set textWrappingPadding(value: number) {
    this._textWrappingPadding = value
  }

  private _textWrappingShape: number = TextWrappingShape.RECTANGLE

  get textWrappingShape(): number {
    return this._textWrappingShape
  }

  set textWrappingShape(value: number) {
    this._textWrappingShape = value
  }

  private _verticalTextAlignment = VerticalTextAlignment.TOP

  get verticalTextAlignment(): VerticalTextAlignment {
    return this._verticalTextAlignment
  }

  set verticalTextAlignment(value: VerticalTextAlignment) {
    this._verticalTextAlignment = value
  }

  private _wrapping: number = TextWrapping.NONE

  get wrapping(): number {
    return this._wrapping
  }

  set wrapping(value: number) {
    this._wrapping = value
  }

  provideValue(): ILabelStyle {
    return new LabelStyle({
      autoFlip: this._autoFlip,
      backgroundFill: this._backgroundFill,
      backgroundStroke: this._backgroundStroke,
      cssClass: this._cssClass,
      font: this._font,
      horizontalTextAlignment: this._horizontalTextAlignment,
      maximumSize: this._maximumSize,
      minimumSize: this._minimumSize,
      padding: this._insets,
      shape: this._shape,
      textFill: this._textFill,
      textSize: this._textSize,
      textWrappingPadding: this._textWrappingPadding,
      textWrappingShape: this._textWrappingShape,
      verticalTextAlignment: this._verticalTextAlignment,
      wrapping:
        this.clipText && this._wrapping == TextWrapping.NONE
          ? // @ts-ignore
            yfiles.view.TextWrapping.CLIP
          : this._wrapping
    })
  }
}


// region Compatibility classes for MarkupLabelStyle

class MarkupLabelStyleExtension extends DefaultLabelStyleExtension {
  provideValue() {
    return new MarkupLabelStyle({
      autoFlip: this.autoFlip,
      backgroundFill: this.backgroundFill,
      backgroundStroke: this.backgroundStroke,
      cssClass: this.cssClass,
      font: this.font,
      horizontalTextAlignment: this.horizontalTextAlignment,
      maximumSize: this.maximumSize,
      minimumSize: this.minimumSize,
      padding: this.insets,
      shape: this.shape,
      textFill: this.textFill,
      textSize: this.textSize,
      textWrappingPadding: this.textWrappingPadding,
      textWrappingShape: this.textWrappingShape,
      verticalTextAlignment: this.verticalTextAlignment,
      wrapping:
        this.clipText && this.wrapping == TextWrapping.NONE
          ? // @ts-ignore
            yfiles.view.TextWrapping.CLIP
          : this.wrapping
    })
  }
}


// region Compatibility classes for IconLabelStyle

class IconLabelStyleExtension extends MarkupExtension {
  private _autoFlip: boolean = true

  get autoFlip(): boolean {
    return this._autoFlip
  }

  set autoFlip(value: boolean) {
    this._autoFlip = value
  }

  private _cssClass = ''

  get cssClass(): string {
    return this._cssClass
  }

  set cssClass(value: string) {
    this._cssClass = value
  }

  private _icon: string | null = null

  get icon(): string | null {
    return this._icon
  }

  set icon(value: string | null) {
    this._icon = value
  }

  private _iconPlacement: ILabelModelParameter = ExteriorNodeLabelModel.LEFT

  get iconPlacement(): ILabelModelParameter {
    return this._iconPlacement
  }

  set iconPlacement(value: ILabelModelParameter) {
    this._iconPlacement = value
  }

  private _iconSize = Size.EMPTY

  get iconSize(): Size {
    return this._iconSize
  }

  set iconSize(value: Size) {
    this._iconSize = value
  }

  private _wrapped: ILabelStyle = new LabelStyle()

  get wrapped(): ILabelStyle {
    return this._wrapped
  }

  set wrapped(value: ILabelStyle) {
    this._wrapped = value
  }

  private _wrappedInsets = new Insets(0)

  get wrappedInsets(): Insets {
    return this._wrappedInsets
  }

  set wrappedInsets(value: Insets) {
    this._wrappedInsets = value
  }

  provideValue() {
    return new IconLabelStyle({
      autoFlip: this._autoFlip,
      cssClass: this._cssClass,
      href: this._icon!,
      iconPlacement: this._iconPlacement,
      iconSize: this._iconSize,
      wrappedStyle: this._wrapped,
      wrappedStylePadding: this._wrappedInsets
    })
  }
}


// region Compatibility classes for NodeStyleLabelStyleAdapter

class NodeStyleLabelStyleAdapterExtension extends MarkupExtension {
  private _autoFlip: boolean = true

  get autoFlip(): boolean {
    return this._autoFlip
  }

  set autoFlip(value: boolean) {
    this._autoFlip = value
  }

  private _nodeStyle: INodeStyle | null = null

  get nodeStyle(): INodeStyle | null {
    return this._nodeStyle
  }

  set nodeStyle(value: INodeStyle | null) {
    this._nodeStyle = value
  }

  private _labelStyle: ILabelStyle | null = null

  get labelStyle(): ILabelStyle | null {
    return this._labelStyle
  }

  set labelStyle(value: ILabelStyle | null) {
    this._labelStyle = value
  }

  private _labelStyleInsets = new Insets(0)

  get labelStyleInsets(): Insets {
    return this._labelStyleInsets
  }

  set labelStyleInsets(value: Insets) {
    this._labelStyleInsets = value
  }

  provideValue() {
    return new NodeStyleLabelStyleAdapter({
      autoFlip: this._autoFlip,
      labelStyle: this._labelStyle!,
      labelStylePadding: this._labelStyleInsets,
      nodeStyle: this._nodeStyle!
    })
  }
}


// region Compatibility classes for Arrow

const ArrowType = (Enum as any)('ArrowType', {
  //@ts-ignore
  DEFAULT: yfiles.styles.ArrowType.STEALTH,
  //@ts-ignore
  SIMPLE: yfiles.styles.ArrowType.OPEN,
  //@ts-ignore
  SHORT: yfiles.styles.ArrowType.STEALTH + 100,
  //@ts-ignore
  DIAMOND: yfiles.styles.ArrowType.DIAMOND,
  //@ts-ignore
  NONE: yfiles.styles.ArrowType.NONE,
  //@ts-ignore
  CIRCLE: yfiles.styles.ArrowType.ELLIPSE,
  //@ts-ignore
  CROSS: yfiles.styles.ArrowType.CROSS,
  //@ts-ignore
  TRIANGLE: yfiles.styles.ArrowType.TRIANGLE
})

class ArrowExtension extends MarkupExtension {
  public static readonly DEFAULT: IArrow = ArrowExtension.createArrow(ArrowType.DEFAULT)
  public static readonly SIMPLE: IArrow = ArrowExtension.createArrow(ArrowType.SIMPLE)
  public static readonly SHORT: IArrow = ArrowExtension.createArrow(ArrowType.SHORT)
  public static readonly DIAMOND: IArrow = ArrowExtension.createArrow(ArrowType.DIAMOND)
  public static readonly NONE: IArrow = ArrowExtension.createArrow(ArrowType.DEFAULT)
  public static readonly CIRCLE: IArrow = ArrowExtension.createArrow(ArrowType.CIRCLE)
  public static readonly CROSS: IArrow = ArrowExtension.createArrow(ArrowType.CROSS)
  public static readonly TRIANGLE: IArrow = ArrowExtension.createArrow(ArrowType.TRIANGLE)

  private _cropLength = 0

  get cropLength(): number {
    return this._cropLength
  }

  set cropLength(value: number) {
    this._cropLength = value
  }

  private _fill: Fill | null = null

  get fill(): Fill | null {
    return this._fill
  }

  set fill(value: Fill | null) {
    this._fill = value
  }

  private _isFrozen = false

  get isFrozen(): boolean {
    return this._isFrozen
  }

  set isFrozen(value: boolean) {
    this._isFrozen = value
  }

  private _scale = 1

  get scale(): number {
    return this._scale
  }

  set scale(value: number) {
    this._scale = value
  }

  private _stroke: Stroke | null = null

  get stroke(): Stroke | null {
    return this._stroke
  }

  set stroke(value: Stroke | null) {
    this._stroke = value
  }

  private _type = ArrowType.DEFAULT

  get type(): number {
    return this._type
  }

  set type(value: number) {
    this._type = value
  }

  private static getWidthScale(type: number): number {
    switch (type) {
      case ArrowType.DEFAULT:
        return 1
      case ArrowType.SIMPLE:
        return 1.5
      case ArrowType.SHORT:
        return 1.5
      case ArrowType.DIAMOND:
        return 1
      case ArrowType.NONE:
        return 1
      case ArrowType.CIRCLE:
        return 1
      case ArrowType.CROSS:
        return 1
      case ArrowType.TRIANGLE:
        return 1.5
      default:
        return 1
    }
  }

  private static getLengthScale(type: number): number {
    switch (type) {
      case ArrowType.DEFAULT:
        return 1
      case ArrowType.SIMPLE:
        return 0.5
      case ArrowType.SHORT:
        return 0.5
      case ArrowType.DIAMOND:
        return 1
      case ArrowType.NONE:
        return 1
      case ArrowType.CIRCLE:
        return 1
      case ArrowType.CROSS:
        return 1
      case ArrowType.TRIANGLE:
        return 0.5
      default:
        return 1
    }
  }

  private static createArrow(
    type: number,
    stroke: Stroke | null = Stroke.BLACK,
    fill: Fill | null = Color.BLACK,
    scale: number = 1,
    cropLength: number = 0
  ) {
    return new Arrow({
      cropLength: cropLength,
      fill: fill,
      lengthScale: scale * ArrowExtension.getLengthScale(type),
      stroke: stroke,
      type: type == ArrowType.SHORT ? type - 100 : type,
      widthScale: scale * ArrowExtension.getWidthScale(type)
    })
  }

  provideValue() {
    let stroke = this._stroke
    if (this.scale !== 1 && stroke) {
      const newStroke = stroke.clone()
      newStroke.thickness = 2 * stroke.thickness
      stroke = newStroke
    }
    return ArrowExtension.createArrow(this._type, stroke, this._fill, this._scale, this._cropLength)
  }
}


// region Compatibility classes for Template Node Style

export class TemplateNodeStyleExtension extends MarkupExtension {
  private _normalizedOutline?: GeneralPath

  get normalizedOutline(): GeneralPath | undefined {
    return this._normalizedOutline
  }

  set normalizedOutline(value: GeneralPath | undefined) {
    this._normalizedOutline = value
  }

  private _minimumSize: Size = Size.EMPTY

  get minimumSize(): Size {
    return this._minimumSize
  }

  set minimumSize(value: Size) {
    this._minimumSize = value
  }

  private _insets: Insets = new Insets(5)

  get insets(): Insets {
    return this._insets
  }

  set insets(value: Insets) {
    this._insets = value
  }

  private _styleResourceKey: string = ''

  get styleResourceKey(): string {
    return this._styleResourceKey
  }

  set styleResourceKey(value: string) {
    this._styleResourceKey = value
  }

  private _cssClass: string | undefined = ''

  get cssClass(): string | undefined {
    return this._cssClass
  }

  set cssClass(value: string | undefined) {
    this._cssClass = value
  }

  private _styleTag: any

  get styleTag(): any {
    return this._styleTag
  }

  set styleTag(value: any) {
    this._styleTag = value
  }

  provideValue(serviceProvider: ILookup) {
    const style = new TemplateNodeStyle({
      renderTemplateId: this.styleResourceKey,
      cssClass: this._cssClass
    })
    style.tag = this._styleTag
    style.insets = this._insets
    style.minimumSize = this._minimumSize
    style.normalizedOutline = this._normalizedOutline
    return style
  }
}

//endregion

// region Compatibility classes for Template Label Style

export class TemplateLabelStyleExtension extends MarkupExtension {
  private _normalizedOutline?: GeneralPath

  get normalizedOutline(): GeneralPath | undefined {
    return this._normalizedOutline
  }

  set normalizedOutline(value: GeneralPath | undefined) {
    this._normalizedOutline = value
  }

  private _preferredSize: Size = Size.EMPTY

  get preferredSize(): Size {
    return this._preferredSize
  }

  set preferredSize(value: Size) {
    this._preferredSize = value
  }

  private _autoFlip = true

  get autoFlip(): boolean {
    return this._autoFlip
  }

  set autoFlip(value: boolean) {
    this._autoFlip = value
  }

  private _styleResourceKey: string = ''

  get styleResourceKey(): string {
    return this._styleResourceKey
  }

  set styleResourceKey(value: string) {
    this._styleResourceKey = value
  }

  private _cssClass: string | undefined = ''

  get cssClass(): string | undefined {
    return this._cssClass
  }

  set cssClass(value: string | undefined) {
    this._cssClass = value
  }

  private _styleTag: any

  get styleTag(): any {
    return this._styleTag
  }

  set styleTag(value: any) {
    this._styleTag = value
  }

  provideValue(serviceProvider: ILookup) {
    const style = new TemplateLabelStyle({
      renderTemplateId: this.styleResourceKey,
      cssClass: this._cssClass
    })
    style.tag = this._styleTag
    style.autoFlip = this._autoFlip
    style.preferredSize = this._preferredSize
    style.normalizedOutline = this._normalizedOutline
    return style
  }
}


// region Compatibility classes for Template Port Style

export class TemplatePortStyleExtension extends MarkupExtension {
  private _normalizedOutline?: GeneralPath

  get normalizedOutline(): GeneralPath | undefined {
    return this._normalizedOutline
  }

  set normalizedOutline(value: GeneralPath | undefined) {
    this._normalizedOutline = value
  }

  private _renderSize: Size = new Size(5, 5)

  get renderSize(): Size {
    return this._renderSize
  }

  set renderSize(value: Size) {
    this._renderSize = value
  }

  private _offset = Point.ORIGIN

  get offset(): Point {
    return this._offset
  }

  set offset(value: Point) {
    this._offset = value
  }

  private _styleResourceKey: string = ''

  get styleResourceKey(): string {
    return this._styleResourceKey
  }

  set styleResourceKey(value: string) {
    this._styleResourceKey = value
  }

  private _cssClass: string | undefined = ''

  get cssClass(): string | undefined {
    return this._cssClass
  }

  set cssClass(value: string | undefined) {
    this._cssClass = value
  }

  private _styleTag: any

  get styleTag(): any {
    return this._styleTag
  }

  set styleTag(value: any) {
    this._styleTag = value
  }

  provideValue(serviceProvider: ILookup) {
    const style = new TemplatePortStyle({
      renderTemplateId: this.styleResourceKey,
      cssClass: this._cssClass
    })
    style.tag = this._styleTag
    style.offset = this._offset
    style.renderSize = this._renderSize
    style.normalizedOutline = this._normalizedOutline
    return style
  }
}

//endregion
