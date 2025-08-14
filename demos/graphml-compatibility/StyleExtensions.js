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
  ExteriorNodeLabelModel,
  ExteriorNodeLabelModelPosition,
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
const Enum = yfiles.lang.Enum

export function configureRenamings(callback) {
  const nameMappings = new Map()
  nameMappings.forEach((value, key) =>
    callback(new XmlName(key, YfilesForHtml_2_0_XamlNS), new XmlName(value, YfilesForHtmlXamlNS))
  )
}

export function configureExtensions(callback) {
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
    { contentProperty: 'Wrapped', properties: { Wrapped: { type: INodeStyle } } },
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

function createMetadata(type, metadata, callback, ns = YfilesForHtml_2_0_XamlNS) {
  metadata.name = type.name
  metadata.xmlNamespace = ns
  callback(type, metadata)
}

// region Compatibility classes for void styles

class VoidPortStyleRenderer extends BaseClass(IPortStyleRenderer) {
  static _instance = new VoidPortStyleRenderer()

  static get Instance() {
    return this._instance
  }

  getBoundsProvider() {
    return IBoundsProvider.EMPTY
  }

  getContext() {
    return ILookup.EMPTY
  }

  getHitTestable() {
    return IHitTestable.NEVER
  }

  getLassoTestable() {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable() {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable() {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator() {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidEdgeStyleRenderer extends BaseClass(IEdgeStyleRenderer) {
  static _instance = new VoidEdgeStyleRenderer()

  static get Instance() {
    return this._instance
  }

  getPathGeometry() {
    return VoidPathGeometry.Instance
  }

  getBoundsProvider() {
    return IBoundsProvider.EMPTY
  }

  getContext() {
    return ILookup.EMPTY
  }

  getHitTestable() {
    return IHitTestable.NEVER
  }

  getLassoTestable() {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable() {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable() {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator() {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidLabelStyleRenderer extends BaseClass(ILabelStyleRenderer) {
  static _instance = new VoidLabelStyleRenderer()

  static get Instance() {
    return this._instance
  }

  getPreferredSize() {
    return Size.EMPTY
  }

  getBoundsProvider() {
    return IBoundsProvider.EMPTY
  }

  getContext() {
    return ILookup.EMPTY
  }

  getHitTestable() {
    return IHitTestable.NEVER
  }

  getLassoTestable() {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable() {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable() {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator() {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidNodeStyleRenderer extends BaseClass(INodeStyleRenderer) {
  static _instance = new VoidNodeStyleRenderer()

  static get Instance() {
    return this._instance
  }

  getShapeGeometry() {
    return IShapeGeometry.VOID_SHAPE_GEOMETRY
  }

  getBoundsProvider() {
    return IBoundsProvider.EMPTY
  }

  getContext() {
    return ILookup.EMPTY
  }

  getHitTestable() {
    return IHitTestable.NEVER
  }

  getLassoTestable() {
    return ILassoTestable.NEVER
  }

  getMarqueeTestable() {
    return IMarqueeTestable.NEVER
  }

  getVisibilityTestable() {
    return IVisibilityTestable.NEVER
  }

  getVisualCreator() {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidStripeStyleRenderer extends BaseClass(IStripeStyleRenderer) {
  static _instance = new VoidStripeStyleRenderer()

  static get Instance() {
    return this._instance
  }

  getContext() {
    return ILookup.EMPTY
  }

  getVisualCreator() {
    return IVisualCreator.VOID_VISUAL_CREATOR
  }
}

class VoidShapeGeometry extends BaseClass() {
  static _instance = IShapeGeometry.VOID_SHAPE_GEOMETRY

  static get Instance() {
    return this._instance
  }
}

class VoidPathGeometry extends BaseClass(IPathGeometry) {
  static _instance = new VoidPathGeometry()

  static get Instance() {
    return this._instance
  }

  getPath() {
    return null
  }

  getSegmentCount() {
    return 0
  }

  getTangent() {
    return null
  }

  getTangentForSegment() {
    return null
  }
}


// region Compatibility classes for ShadowNodeStyleDecorator

class ShadowNodeStyleDecoratorExtension extends MarkupExtension {
  _Wrapped = new ShapeNodeStyle()

  get Wrapped() {
    return this._Wrapped
  }

  set Wrapped(value) {
    this._Wrapped = value
  }

  provideValue() {
    return new ShadowNodeStyleDecorator(this._Wrapped)
  }
}


// region Compatibility classes for GroupNodeStyle

class GroupNodeStyleExtension extends MarkupExtension {
  static defaultTabFill = new Color(170, 170, 170, 255)

  _contentAreaInsets = new Insets(4)

  get contentAreaInsets() {
    return this._contentAreaInsets
  }

  set contentAreaInsets(value) {
    this._contentAreaInsets = value
  }

  _cornerRadius = 4

  get cornerRadius() {
    return this._cornerRadius
  }

  set cornerRadius(value) {
    this._cornerRadius = value
  }

  _tabSlope = 0.5

  get tabSlope() {
    return this._tabSlope
  }

  set tabSlope(value) {
    this._tabSlope = value
  }

  _tabWidth = 50

  get tabWidth() {
    return this._tabWidth
  }

  set tabWidth(value) {
    this._tabWidth = value
  }

  _tabHeight = 18

  get tabHeight() {
    return this._tabHeight
  }

  set tabHeight(value) {
    this._tabHeight = value
  }

  _tabInset = 4

  get tabInset() {
    return this._tabInset
  }

  set tabInset(value) {
    this._tabInset = value
  }

  _tabPosition = GroupNodeStyleTabPosition.TOP

  get tabPosition() {
    return this._tabPosition
  }

  set tabPosition(value) {
    this._tabPosition = value
  }

  _tabSizePolicy = GroupNodeStyleTabSizePolicy.FIXED

  get tabSizePolicy() {
    return this._tabSizePolicy
  }

  set tabSizePolicy(value) {
    this._tabSizePolicy = value
  }

  _iconPosition = GroupNodeStyleIconPosition.TRAILING

  get iconPosition() {
    return this._iconPosition
  }

  set iconPosition(value) {
    this._iconPosition = value
  }

  _groupIcon = GroupNodeStyleIconType.NONE

  get groupIcon() {
    return this._groupIcon
  }

  set groupIcon(value) {
    this._groupIcon = value
  }

  _iconBackgroundShape = GroupNodeStyleIconBackgroundShape.ROUND_RECTANGLE_SOLID

  get iconBackgroundShape() {
    return this._iconBackgroundShape
  }

  set iconBackgroundShape(value) {
    this._iconBackgroundShape = value
  }

  _folderIcon = GroupNodeStyleIconType.PLUS

  get folderIcon() {
    return this._folderIcon
  }

  set folderIcon(value) {
    this._folderIcon = value
  }

  _iconBackgroundFill = Color.WHITE

  get iconBackgroundFill() {
    return this._iconBackgroundFill
  }

  set iconBackgroundFill(value) {
    this._iconBackgroundFill = value
  }

  _iconForegroundFill = GroupNodeStyleExtension.defaultTabFill

  get iconForegroundFill() {
    return this._iconForegroundFill
  }

  set iconForegroundFill(value) {
    this._iconForegroundFill = value
  }

  _iconSize = 14

  get iconSize() {
    return this._iconSize
  }

  set iconSize(value) {
    this._iconSize = value
  }

  _iconOffset = 0

  get iconOffset() {
    return this._iconOffset
  }

  set iconOffset(value) {
    this._iconOffset = value
  }

  _drawShadow = false

  get drawShadow() {
    return this._drawShadow
  }

  set drawShadow(value) {
    this._drawShadow = value
  }

  _minimumContentAreaSize = new Size(0, 0)

  get minimumContentAreaSize() {
    return this._minimumContentAreaSize
  }

  set minimumContentAreaSize(value) {
    this._minimumContentAreaSize = value
  }

  _hitTransparentContentArea = false

  get hitTransparentContentArea() {
    return this._hitTransparentContentArea
  }

  set hitTransparentContentArea(value) {
    this._hitTransparentContentArea = value
  }

  _renderTransparentContentArea = false

  get renderTransparentContentArea() {
    return this._renderTransparentContentArea
  }

  set renderTransparentContentArea(value) {
    this._renderTransparentContentArea = value
  }

  _showFolderContentArea = false

  get showFolderContentArea() {
    return this._showFolderContentArea
  }

  set showFolderContentArea(value) {
    this._showFolderContentArea = value
  }

  _tabBackgroundFill = null

  get tabBackgroundFill() {
    return this._tabBackgroundFill
  }

  set tabBackgroundFill(value) {
    this._tabBackgroundFill = value
  }

  _contentAreaFill = Color.WHITE

  get contentAreaFill() {
    return this._contentAreaFill
  }

  set contentAreaFill(value) {
    this._contentAreaFill = value
  }

  _tabFill = GroupNodeStyleExtension.defaultTabFill

  get tabFill() {
    return this._tabFill
  }

  set tabFill(value) {
    this._tabFill = value
  }

  _stroke = null

  get stroke() {
    return this._stroke
  }

  set stroke(value) {
    this._stroke = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
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
  _insets = new Insets(16, 5, 5, 5)

  get insets() {
    return this._insets
  }

  set insets(value) {
    this._insets = value
  }

  _wrapped = null

  get wrapped() {
    return this._wrapped
  }

  set wrapped(value) {
    this._wrapped = value
  }

  _buttonPlacement = new InteriorNodeLabelModel({ padding: new Insets(0) }).createParameter(
    InteriorNodeLabelModelPosition.TOP_LEFT
  )

  get buttonPlacement() {
    return this._buttonPlacement
  }

  set buttonPlacement(value) {
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
  _aspectRatio = 0

  get aspectRatio() {
    return this._aspectRatio
  }

  set aspectRatio(value) {
    this._aspectRatio = value
  }

  _image = null

  get image() {
    return this._image
  }

  set image(value) {
    this._image = value
  }

  _fallbackImage = null

  get fallbackImage() {
    return this._fallbackImage
  }

  set fallbackImage(value) {
    this._fallbackImage = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _normalizedOutline = null

  get normalizedOutline() {
    return this._normalizedOutline
  }

  set normalizedOutline(value) {
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

const ShapeNodeShape = Enum('ShapeNodeShape', {
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
  _fill = Color.WHITE

  get fill() {
    return this._fill
  }

  set fill(value) {
    this._fill = value
  }

  _shape = ShapeNodeShape.RECTANGLE

  get shape() {
    return this._shape
  }

  set shape(value) {
    this._shape = value
  }

  _keepIntrinsicAspectRatio = false

  get keepIntrinsicAspectRatio() {
    return this._keepIntrinsicAspectRatio
  }

  set keepIntrinsicAspectRatio(value) {
    this._keepIntrinsicAspectRatio = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _stroke = Stroke.BLACK

  get stroke() {
    return this._stroke
  }

  set stroke(value) {
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

const TextWrappingShape = Enum('TextWrappingShape', {
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
const TextWrapping = Enum('TextWrapping', {
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
  _autoFlip = true

  get autoFlip() {
    return this._autoFlip
  }

  set autoFlip(value) {
    this._autoFlip = value
  }

  _backgroundFill = null

  get backgroundFill() {
    return this._backgroundFill
  }

  set backgroundFill(value) {
    this._backgroundFill = value
  }

  _backgroundStroke = null

  get backgroundStroke() {
    return this._backgroundStroke
  }

  set backgroundStroke(value) {
    this._backgroundStroke = value
  }

  _clipText = true

  get clipText() {
    return this._clipText
  }

  set clipText(value) {
    this._clipText = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _font = new Font('Arial', 12)

  get font() {
    return this._font
  }

  set font(value) {
    this._font = value
  }

  _horizontalTextAlignment = HorizontalTextAlignment.LEFT

  get horizontalTextAlignment() {
    return this._horizontalTextAlignment
  }

  set horizontalTextAlignment(value) {
    this._horizontalTextAlignment = value
  }

  _insets = Insets.EMPTY

  get insets() {
    return this._insets
  }

  set insets(value) {
    this._insets = value
  }

  _maximumSize = Size.INFINITE

  get maximumSize() {
    return this._maximumSize
  }

  set maximumSize(value) {
    this._maximumSize = value
  }

  _minimumSize = Size.ZERO

  get minimumSize() {
    return this._minimumSize
  }

  set minimumSize(value) {
    this._minimumSize = value
  }

  _shape = LabelShape.RECTANGLE

  get shape() {
    return this._shape
  }

  set shape(value) {
    this._shape = value
  }

  _textSize = 12

  get textSize() {
    return this._textSize
  }

  set textSize(value) {
    this._textSize = value
  }

  _textFill = Color.BLACK

  get textFill() {
    return this._textFill
  }

  set textFill(value) {
    this._textFill = value
  }

  _textWrappingPadding = 0

  get textWrappingPadding() {
    return this._textWrappingPadding
  }

  set textWrappingPadding(value) {
    this._textWrappingPadding = value
  }

  _textWrappingShape = TextWrappingShape.RECTANGLE

  get textWrappingShape() {
    return this._textWrappingShape
  }

  set textWrappingShape(value) {
    this._textWrappingShape = value
  }

  _verticalTextAlignment = VerticalTextAlignment.TOP

  get verticalTextAlignment() {
    return this._verticalTextAlignment
  }

  set verticalTextAlignment(value) {
    this._verticalTextAlignment = value
  }

  _wrapping = TextWrapping.NONE

  get wrapping() {
    return this._wrapping
  }

  set wrapping(value) {
    this._wrapping = value
  }

  provideValue() {
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
  _autoFlip = true

  get autoFlip() {
    return this._autoFlip
  }

  set autoFlip(value) {
    this._autoFlip = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _icon = null

  get icon() {
    return this._icon
  }

  set icon(value) {
    this._icon = value
  }

  _iconPlacement = new ExteriorNodeLabelModel({ margins: new Insets(0) }).createParameter(
    ExteriorNodeLabelModelPosition.LEFT
  )

  get iconPlacement() {
    return this._iconPlacement
  }

  set iconPlacement(value) {
    this._iconPlacement = value
  }

  _iconSize = Size.EMPTY

  get iconSize() {
    return this._iconSize
  }

  set iconSize(value) {
    this._iconSize = value
  }

  _wrapped = new LabelStyle()

  get wrapped() {
    return this._wrapped
  }

  set wrapped(value) {
    this._wrapped = value
  }

  _wrappedInsets = new Insets(0)

  get wrappedInsets() {
    return this._wrappedInsets
  }

  set wrappedInsets(value) {
    this._wrappedInsets = value
  }

  provideValue() {
    return new IconLabelStyle({
      autoFlip: this._autoFlip,
      cssClass: this._cssClass,
      href: this._icon,
      iconPlacement: this._iconPlacement,
      iconSize: this._iconSize,
      wrappedStyle: this._wrapped,
      wrappedStylePadding: this._wrappedInsets
    })
  }
}


// region Compatibility classes for NodeStyleLabelStyleAdapter

class NodeStyleLabelStyleAdapterExtension extends MarkupExtension {
  _autoFlip = true

  get autoFlip() {
    return this._autoFlip
  }

  set autoFlip(value) {
    this._autoFlip = value
  }

  _nodeStyle = null

  get nodeStyle() {
    return this._nodeStyle
  }

  set nodeStyle(value) {
    this._nodeStyle = value
  }

  _labelStyle = null

  get labelStyle() {
    return this._labelStyle
  }

  set labelStyle(value) {
    this._labelStyle = value
  }

  _labelStyleInsets = new Insets(0)

  get labelStyleInsets() {
    return this._labelStyleInsets
  }

  set labelStyleInsets(value) {
    this._labelStyleInsets = value
  }

  provideValue() {
    return new NodeStyleLabelStyleAdapter({
      autoFlip: this._autoFlip,
      labelStyle: this._labelStyle,
      labelStylePadding: this._labelStyleInsets,
      nodeStyle: this._nodeStyle
    })
  }
}


// region Compatibility classes for Arrow

const ArrowType = Enum('ArrowType', {
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
  static DEFAULT = ArrowExtension.createArrow(ArrowType.DEFAULT)
  static SIMPLE = ArrowExtension.createArrow(ArrowType.SIMPLE)
  static SHORT = ArrowExtension.createArrow(ArrowType.SHORT)
  static DIAMOND = ArrowExtension.createArrow(ArrowType.DIAMOND)
  static NONE = ArrowExtension.createArrow(ArrowType.DEFAULT)
  static CIRCLE = ArrowExtension.createArrow(ArrowType.CIRCLE)
  static CROSS = ArrowExtension.createArrow(ArrowType.CROSS)
  static TRIANGLE = ArrowExtension.createArrow(ArrowType.TRIANGLE)

  _cropLength = 0

  get cropLength() {
    return this._cropLength
  }

  set cropLength(value) {
    this._cropLength = value
  }

  _fill = null

  get fill() {
    return this._fill
  }

  set fill(value) {
    this._fill = value
  }

  _isFrozen = false

  get isFrozen() {
    return this._isFrozen
  }

  set isFrozen(value) {
    this._isFrozen = value
  }

  _scale = 1

  get scale() {
    return this._scale
  }

  set scale(value) {
    this._scale = value
  }

  _stroke = null

  get stroke() {
    return this._stroke
  }

  set stroke(value) {
    this._stroke = value
  }

  _type = ArrowType.DEFAULT

  get type() {
    return this._type
  }

  set type(value) {
    this._type = value
  }

  static getWidthScale(type) {
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

  static getLengthScale(type) {
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

  static createArrow(type, stroke = Stroke.BLACK, fill = Color.BLACK, scale = 1, cropLength = 0) {
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
  _normalizedOutline

  get normalizedOutline() {
    return this._normalizedOutline
  }

  set normalizedOutline(value) {
    this._normalizedOutline = value
  }

  _minimumSize = Size.EMPTY

  get minimumSize() {
    return this._minimumSize
  }

  set minimumSize(value) {
    this._minimumSize = value
  }

  _insets = new Insets(5)

  get insets() {
    return this._insets
  }

  set insets(value) {
    this._insets = value
  }

  _styleResourceKey = ''

  get styleResourceKey() {
    return this._styleResourceKey
  }

  set styleResourceKey(value) {
    this._styleResourceKey = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _styleTag

  get styleTag() {
    return this._styleTag
  }

  set styleTag(value) {
    this._styleTag = value
  }

  provideValue(serviceProvider) {
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
  _normalizedOutline

  get normalizedOutline() {
    return this._normalizedOutline
  }

  set normalizedOutline(value) {
    this._normalizedOutline = value
  }

  _preferredSize = Size.EMPTY

  get preferredSize() {
    return this._preferredSize
  }

  set preferredSize(value) {
    this._preferredSize = value
  }

  _autoFlip = true

  get autoFlip() {
    return this._autoFlip
  }

  set autoFlip(value) {
    this._autoFlip = value
  }

  _styleResourceKey = ''

  get styleResourceKey() {
    return this._styleResourceKey
  }

  set styleResourceKey(value) {
    this._styleResourceKey = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _styleTag

  get styleTag() {
    return this._styleTag
  }

  set styleTag(value) {
    this._styleTag = value
  }

  provideValue(serviceProvider) {
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
  _normalizedOutline

  get normalizedOutline() {
    return this._normalizedOutline
  }

  set normalizedOutline(value) {
    this._normalizedOutline = value
  }

  _renderSize = new Size(5, 5)

  get renderSize() {
    return this._renderSize
  }

  set renderSize(value) {
    this._renderSize = value
  }

  _offset = Point.ORIGIN

  get offset() {
    return this._offset
  }

  set offset(value) {
    this._offset = value
  }

  _styleResourceKey = ''

  get styleResourceKey() {
    return this._styleResourceKey
  }

  set styleResourceKey(value) {
    this._styleResourceKey = value
  }

  _cssClass = ''

  get cssClass() {
    return this._cssClass
  }

  set cssClass(value) {
    this._cssClass = value
  }

  _styleTag

  get styleTag() {
    return this._styleTag
  }

  set styleTag(value) {
    this._styleTag = value
  }

  provideValue(serviceProvider) {
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
