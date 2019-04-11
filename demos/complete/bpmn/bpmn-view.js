/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  ConstantLabelCandidateDescriptorProvider,
  CreateEdgeInputMode,
  DashStyle,
  DefaultEdgePathCropper,
  DefaultLabelModelParameterFinder,
  DefaultLabelStyle,
  DefaultPortCandidate,
  EdgeStyleBase,
  EditLabelHelper,
  Enum,
  Exception,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  Fill,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  GeneralPath,
  GeomUtilities,
  GraphMLAttribute,
  GraphMLMemberVisibility,
  HandlePositions,
  HandleTypes,
  HashMap,
  IArrow,
  IBoundsProvider,
  ICanvasContext,
  ICloneable,
  IColumn,
  ICommand,
  IEdge,
  IEdgePathCropper,
  IEdgeStyle,
  IEditLabelHelper,
  IGraph,
  IHandle,
  IInputModeContext,
  ILabel,
  ILabelCandidateDescriptorProvider,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILabelStyle,
  ILabelStyleRenderer,
  IList,
  ILookup,
  IModelItem,
  INode,
  INodeInsetsProvider,
  INodeSizeConstraintProvider,
  INodeStyle,
  INodeStyleRenderer,
  IOrientedRectangle,
  IPoint,
  IPort,
  IPortLocationModelParameter,
  IPortStyle,
  IPortStyleRenderer,
  IRectangle,
  IRenderContext,
  IReshapeHandleProvider,
  IShapeGeometry,
  IStripe,
  ITable,
  IVisualCreator,
  IVisualTemplate,
  Insets,
  InteriorLabelModel,
  InteriorLabelModelPosition,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  KeyEventRecognizers,
  LabelStyleBase,
  LineCap,
  LineJoin,
  List,
  MarkupExtension,
  Matrix,
  MutableRectangle,
  NodeSizeConstraintProvider,
  NodeStyleBase,
  NodeStyleLabelStyleAdapter,
  NodeStylePortStyleAdapter,
  OrientedRectangle,
  Point,
  PortCandidateProviderBase,
  Rect,
  SandwichLabelModel,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShapeNodeStyleRenderer,
  SimpleEdge,
  SimpleLabel,
  SimpleNode,
  SimplePort,
  Size,
  SolidColorFill,
  StretchStripeLabelModel,
  StripeStyleBase,
  Stroke,
  SvgVisual,
  SvgVisualGroup,
  Table,
  TableNodeStyle,
  TableRenderingOrder,
  TypeAttribute,
  Visual,
  VoidLabelStyle,
  YBoolean,
  YNumber,
  YObject
} from 'yfiles'

let passiveSupported
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: () => {
      passiveSupported = true
    }
  })
  window.addEventListener('test', null, opts)
} catch (e) {
  passiveSupported = false
}

/**
 * Specifies if an Activity is an expanded or collapsed Sub-Process according to BPMN.
 * @see {@link ActivityNodeStyle}
 */
export const SubState = Enum('SubState', {
  /**
   * Specifies that an Activity is either no Sub-Process according to BPMN or should use no Sub-Process marker.
   * @see {@link ActivityNodeStyle}
   */
  NONE: 0,
  /**
   * Specifies that an Activity is an expanded Sub-Process according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  EXPANDED: 1,
  /**
   * Specifies that an Activity is a collapsed Sub-Process according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  COLLAPSED: 2,
  /**
   * Specifies that the folding state of an {@link INode} determines if
   * an Activity is an expanded or collapsed Sub-Process according to BPMN.
   * @see {@link ActivityNodeStyle}
   * @see {@link IFoldingView#isExpanded}
   */
  DYNAMIC: 3
})

/**
 * Specifies the type of a Gateway according to BPMN.
 * @see {@link GatewayNodeStyle}
 */
export const GatewayType = Enum('GatewayType', {
  /**
   * Specifies that a Gateway has the type Exclusive according to BPMN but should not use a marker.
   * @see {@link GatewayNodeStyle}
   */
  EXCLUSIVE_WITHOUT_MARKER: 0,
  /**
   * Specifies that a Gateway has the type Exclusive according to BPMN and should use a marker.
   * @see {@link GatewayNodeStyle}
   */
  EXCLUSIVE_WITH_MARKER: 1,
  /**
   * Specifies that a Gateway has the type Inclusive according to BPMN.
   * @see {@link GatewayNodeStyle}
   */
  INCLUSIVE: 2,
  /**
   * Specifies that a Gateway has the type Parallel according to BPMN.
   * @see {@link GatewayNodeStyle}
   */
  PARALLEL: 3,
  /**
   * Specifies that a Gateway has the type Complex according to BPMN.
   * @see {@link GatewayNodeStyle}
   */
  COMPLEX: 4,
  /**
   * Specifies that a Gateway has the type Event-Based according to BPMN.
   * @see {@link GatewayNodeStyle}
   */
  EVENT_BASED: 5,
  /**
   * Specifies that a Gateway has the type Exclusive Event-Based according to BPMN.
   * @see {@link GatewayNodeStyle}
   */
  EXCLUSIVE_EVENT_BASED: 6,
  /**
   * Specifies that a Gateway has the type Parallel Event-Based according to BPMN.
   * @see {@link GatewayNodeStyle}
   */
  PARALLEL_EVENT_BASED: 7
})

/**
 * Specifies the type of an Event according to BPMN.
 * @see {@link EventNodeStyle}
 */
export const EventType = Enum('EventType', {
  /**
   * Specifies that an Event is a Plain Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  PLAIN: 0,
  /**
   * Specifies that an Event is a Message Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  MESSAGE: 1,
  /**
   * Specifies that an Event is a Timer Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  TIMER: 2,
  /**
   * Specifies that an Event is an Escalation Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  ESCALATION: 3,
  /**
   * Specifies that an Event is a Conditional Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  CONDITIONAL: 4,
  /**
   * Specifies that an Event is a Link Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  LINK: 5,
  /**
   * Specifies that an Event is an Error Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  ERROR: 6,
  /**
   * Specifies that an Event is a Cancel Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  CANCEL: 7,
  /**
   * Specifies that an Event is a Compensation Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  COMPENSATION: 8,
  /**
   * Specifies that an Event is a Signal Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  SIGNAL: 9,
  /**
   * Specifies that an Event is a Multiple Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  MULTIPLE: 10,
  /**
   * Specifies that an Event is a Parallel Multiple Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  PARALLEL_MULTIPLE: 11,
  /**
   * Specifies that an Event is a Terminate Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  TERMINATE: 12
})

/**
 * Specifies the type of an activity according to BPMN.
 * @see {@link ActivityNodeStyle}
 */
export const ActivityType = Enum('ActivityType', {
  /**
   * Specifies the type of an activity to be a Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  TASK: 0,
  /**
   * Specifies the type of an activity to be a Sub-Process according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  SUB_PROCESS: 1,
  /**
   * Specifies the type of an activity to be a Transaction Sub-Process according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  TRANSACTION: 2,
  /**
   * Specifies the type of an activity to be an Event Sub-Process according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  EVENT_SUB_PROCESS: 3,
  /**
   * Specifies the type of an activity to be a Call Activity according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  CALL_ACTIVITY: 4
})

// General constants
const BPMN_CONSTANTS_DOUBLE_LINE_OFFSET = 2
const BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS = 6
const BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS = 6
const BPMN_CONSTANTS_GROUP_NODE_CORNER_RADIUS = 3

// Stroke constants
const BPMN_CONSTANTS_STROKES_TASK = Stroke.DARK_BLUE
const BPMN_CONSTANTS_STROKES_CALL_ACTIVITY = new Stroke(Fill.DARK_BLUE, 3)
const BPMN_CONSTANTS_STROKES_ACTIVITY_EVENT_SUB_PROCESS = new Stroke({
  fill: Fill.DARK_BLUE,
  dashStyle: new DashStyle([1, 1], 0),
  lineCap: LineCap.FLAT
})
const BPMN_CONSTANTS_STROKES_ACTIVITY_TASK_ROUND = new Stroke({
  fill: Fill.BLACK,
  lineCap: LineCap.ROUND,
  lineJoin: LineJoin.ROUND
})
const BPMN_CONSTANTS_STROKES_TASK_TYPE_SERVICE = new Stroke({
  fill: Fill.BLACK
})
const BPMN_CONSTANTS_STROKES_ANNOTATION = Stroke.BLACK
const BPMN_CONSTANTS_STROKES_CHOREOGRAPHY_TASK = Stroke.DARK_GREEN
const BPMN_CONSTANTS_STROKES_CHOREOGRAPHY_CALL = new Stroke({
  fill: Fill.DARK_GREEN,
  thickness: 3
})
const BPMN_CONSTANTS_STROKES_CHOREOGRAPHY_MESSAGE_LINK = new Stroke({
  fill: Fill.BLACK,
  dashStyle: new DashStyle([1, 1], 0),
  lineCap: LineCap.FLAT
})
const BPMN_CONSTANTS_STROKES_CONVERSATION = Stroke.DARK_GREEN
const BPMN_CONSTANTS_STROKES_CALLING_CONVERSATION = new Stroke({
  fill: Fill.DARK_GREEN,
  thickness: 3
})
const BPMN_CONSTANTS_STROKES_DATA_OBJECT = Stroke.BLACK
const BPMN_CONSTANTS_STROKES_DATA_STORE = Stroke.BLACK
const BPMN_CONSTANTS_STROKES_EVENT_START = Stroke.GREEN
const BPMN_CONSTANTS_STROKES_EVENT_SUB_PROCESS_NON_INTERRUPTING = new Stroke({
  fill: Fill.GREEN,
  dashStyle: DashStyle.DASH
})
const BPMN_CONSTANTS_STROKES_EVENT_INTERMEDIATE = Stroke.GOLDENROD
const BPMN_CONSTANTS_STROKES_EVENT_BOUNDARY_NON_INTERRUPTING = new Stroke({
  fill: Fill.GOLDENROD,
  dashStyle: DashStyle.DASH
})
const BPMN_CONSTANTS_STROKES_EVENT_END = new Stroke({
  fill: Fill.RED,
  thickness: 3
})
const BPMN_CONSTANTS_STROKES_EVENT_TYPE = new Stroke(Fill.BLACK)
const BPMN_CONSTANTS_STROKES_EVENT_TYPE_DETAIL = new Stroke({
  fill: Fill.BLACK,
  lineCap: LineCap.ROUND
})
const BPMN_CONSTANTS_STROKES_EVENT_TYPE_DETAIL_INVERTED = new Stroke({
  fill: Fill.WHITE,
  lineCap: LineCap.ROUND
})
const BPMN_CONSTANTS_STROKES_GATEWAY = Stroke.DARK_ORANGE
const BPMN_CONSTANTS_STROKES_GATEWAY_TYPE_INCLUSIVE = new Stroke({
  fill: Fill.BLACK,
  thickness: 3
})
const BPMN_CONSTANTS_STROKES_GROUP_NODE = new Stroke({
  dashStyle: DashStyle.DASH_DOT,
  lineCap: LineCap.ROUND,
  fill: Fill.BLACK
})
const BPMN_CONSTANTS_STROKES_MESSAGE = Stroke.BLACK
const BPMN_CONSTANTS_STROKES_MESSAGE_INVERTED = Stroke.WHITE
const BPMN_CONSTANTS_STROKES_ARROW = new Stroke({
  fill: Fill.BLACK,
  lineCap: LineCap.ROUND,
  lineJoin: LineJoin.ROUND
})
const BPMN_CONSTANTS_STROKES_ASSOCIATION_EDGE_STYLE = new Stroke({
  fill: Fill.BLACK,
  dashStyle: new DashStyle([1, 1], 0),
  lineCap: LineCap.FLAT
})
const BPMN_CONSTANTS_STROKES_B_P_M_N_EDGE_STYLE = Stroke.BLACK
const BPMN_CONSTANTS_STROKES_CONVERSATION_DOUBLE_LINE = new Stroke({
  fill: Fill.BLACK,
  lineJoin: LineJoin.ROUND,
  thickness: 3
})
const BPMN_CONSTANTS_STROKES_CONVERSATION_CENTER_LINE = new Stroke({
  fill: Fill.WHITE,
  lineJoin: LineJoin.ROUND
})
const BPMN_CONSTANTS_STROKES_MESSAGE_EDGE_STYLE = new Stroke({
  fill: Fill.BLACK,
  dashStyle: DashStyle.DASH
})

class ScalingLabelModel extends BaseClass(ILabelModel) {
  constructor(insets) {
    super()
    this.$insets = insets || Insets.EMPTY
  }

  /**
   * Gets the insets to use within the node's {@link INode#layout}.
   * @type {Insets}
   */
  get insets() {
    return this.$insets
  }

  /**
   * Sets the insets to use within the node's {@link INode#layout}.
   * @type {Insets}
   */
  set insets(value) {
    this.$insets = value
  }

  /**
   * Returns an instance that implements the given type or <code>null</code>.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-<code>null</code> implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {Class} type the type for which an instance shall be returned
   * @return {Object} an instance that is assignable to type or <code>null</code>
   * @see Specified by {@link ILookup#lookup}.
   */
  lookup(type) {
    return ScalingLabelModel.STRETCH_MODEL.lookup(type)
  }

  /**
   * Provides a {@link ILookup lookup context} for the given combination of label
   * and parameter.
   * @param {ILabel} label The label to use in the context.
   * @param {ILabelModelParameter} parameter The parameter to use for the label in the context.
   * @return {ILookup} An implementation of the {@link ILookup} interface that can be used
   *   to query additional aspects of the label/parameter combination.
   * @see {@link ILookup#EMPTY}
   * @see Specified by {@link ILabelModel#getContext}.
   */
  getContext(label, parameter) {
    return ScalingLabelModel.STRETCH_MODEL.getContext(label, parameter)
  }

  /**
   * Calculates the geometry in form of an {@link IOrientedRectangle}
   * for a given label using the given model parameter.
   * @param {ILabelModelParameter} parameter A parameter that has been created by this model.
   * This is typically the parameter that yielded this instance through its
   * {@link ILabelModelParameter#model} property.
   * @param {ILabel} label the label to calculate the geometry for
   * @return {IOrientedRectangle} An instance that describes the geometry. This is typically
   * an instance designed as a flyweight, so clients should not cache the
   * instance but store the values if they need a snapshot for later use
   * @see Specified by {@link ILabelModel#getGeometry}.
   */
  getGeometry(label, parameter) {
    const scalingParameter = parameter
    const owner = INode.isInstance(label.owner) ? label.owner : null
    const availableRect = owner.layout
    const horizontalInsets = this.insets.left + this.insets.right
    const verticalInsets = this.insets.top + this.insets.bottom

    // consider fix insets
    let x = availableRect.minX + (availableRect.width > horizontalInsets ? this.insets.left : 0)
    let y = availableRect.minY + (availableRect.height > verticalInsets ? this.insets.top : 0)
    let width =
      availableRect.width - (availableRect.width > horizontalInsets ? horizontalInsets : 0)
    let height = availableRect.height - (availableRect.height > verticalInsets ? verticalInsets : 0)

    // consider scaling insets
    x += scalingParameter.scalingInsets.left * width
    y += scalingParameter.scalingInsets.top * height
    width *= 1 - scalingParameter.scalingInsets.left - scalingParameter.scalingInsets.right
    height *= 1 - scalingParameter.scalingInsets.top - scalingParameter.scalingInsets.bottom

    if (scalingParameter.keepRatio) {
      const fixRatio = scalingParameter.ratio
      const availableRatio = height > 0 && width > 0 ? width / height : 1

      if (fixRatio > availableRatio) {
        // keep width
        const cy = y + height * 0.5
        height *= availableRatio / fixRatio
        y = cy - height * 0.5
      } else {
        const cx = x + width * 0.5
        width *= fixRatio / availableRatio
        x = cx - width * 0.5
      }
    }

    ScalingLabelModel.DUMMY_NODE.layout = new Rect(x, y, width, height)
    ScalingLabelModel.DUMMY_LABEL.preferredSize = label.preferredSize
    return ScalingLabelModel.STRETCH_MODEL.getGeometry(
      ScalingLabelModel.DUMMY_LABEL,
      ScalingLabelModel.STRETCH_PARAMETER
    )
  }

  /**
   * Creates a default parameter that can be used for this model.
   * @return {ILabelModelParameter} a parameter for this model instance
   * @see Specified by {@link ILabelModel#createDefaultParameter}.
   */
  createDefaultParameter() {
    const scalingParameter = new ScalingLabelModelParameter()
    scalingParameter.model = this
    scalingParameter.scalingInsets = Insets.EMPTY
    return scalingParameter
  }

  /** @return {ILabelModelParameter} */
  createScaledParameter(scale) {
    if (scale <= 0 || scale > 1) {
      throw new Exception(`Argument '${scale}' not allowed. Valid values are in ]0; 1].`)
    }
    const scalingParameter = new ScalingLabelModelParameter()
    scalingParameter.model = this
    scalingParameter.scalingInsets = new Insets((1 - scale) / 2)
    return scalingParameter
  }

  /** @return {ILabelModelParameter} */
  createScaledParameterWithRatio(scale, ratio) {
    if (scale <= 0 || scale > 1) {
      throw new Exception(`Argument '${scale}' not allowed. Valid values are in ]0; 1].`)
    }
    if (ratio <= 0) {
      throw new Exception(`Argument '${ratio}' not allowed. Ratio must be positive.`)
    }
    const scalingParameter = new ScalingLabelModelParameter()
    scalingParameter.model = this
    scalingParameter.scalingInsets = new Insets((1 - scale) / 2)
    scalingParameter.keepRatio = true
    scalingParameter.ratio = ratio
    return scalingParameter
  }

  /** @return {InteriorStretchLabelModel} */
  static get STRETCH_MODEL() {
    return (
      ScalingLabelModel.$stretchModel ||
      (ScalingLabelModel.$stretchModel = new InteriorStretchLabelModel())
    )
  }

  /** @return {ILabelModelParameter} */
  static get STRETCH_PARAMETER() {
    return (
      ScalingLabelModel.$stretchParameter ||
      (ScalingLabelModel.$stretchParameter = ScalingLabelModel.STRETCH_MODEL.createParameter(
        InteriorStretchLabelModelPosition.CENTER
      ))
    )
  }

  /** @return {SimpleNode} */
  static get DUMMY_NODE() {
    return ScalingLabelModel.$dummyNode || (ScalingLabelModel.$dummyNode = new SimpleNode())
  }

  /** @return {SimpleLabel} */
  static get DUMMY_LABEL() {
    return (
      ScalingLabelModel.$dummyLabel ||
      (ScalingLabelModel.$dummyLabel = new SimpleLabel(
        ScalingLabelModel.DUMMY_NODE,
        '',
        ScalingLabelModel.STRETCH_PARAMETER
      ))
    )
  }
}

class ScalingLabelModelParameter extends BaseClass(ILabelModelParameter) {
  constructor() {
    super()
    this.$model = null
    this.scalingInsets = null
    this.keepRatio = false
    this.ratio = 0
  }

  /** @type {ILabelModel} */
  get model() {
    return this.$model
  }

  /** @type {ILabelModel} */
  set model(value) {
    this.$model = value
  }

  /** @return {Object} */
  clone() {
    const scalingParameter = new ScalingLabelModelParameter()
    scalingParameter.model = this.model
    scalingParameter.scalingInsets = this.scalingInsets
    scalingParameter.keepRatio = this.keepRatio
    return scalingParameter
  }

  /** @return {boolean} */
  supports(label) {
    return INode.isInstance(label.owner)
  }
}

// Helper constants
const ILM2 = new InteriorLabelModel({ insets: new Insets(2) })
const ILM6 = new InteriorLabelModel({ insets: new Insets(6) })
const ISLM_INSIDE_DOUBLE_LINE = new InteriorStretchLabelModel({
  insets: new Insets(2 * BPMN_CONSTANTS_DOUBLE_LINE_OFFSET + 1)
})
const ELM15 = new ExteriorLabelModel({ insets: new Insets(15) })
const SLM = new ScalingLabelModel()
const SLM3 = new ScalingLabelModel(new Insets(3))

// Constant placements
const BPMN_CONSTANTS_PLACEMENTS_POOL_NODE_MARKER = ILM2.createParameter(
  InteriorLabelModelPosition.SOUTH
)
const BPMN_CONSTANTS_PLACEMENTS_TASK_TYPE = ILM6.createParameter(
  InteriorLabelModelPosition.NORTH_WEST
)
const BPMN_CONSTANTS_PLACEMENTS_TASK_MARKER = ISLM_INSIDE_DOUBLE_LINE.createParameter(
  InteriorStretchLabelModelPosition.SOUTH
)
const BPMN_CONSTANTS_PLACEMENTS_CHOROGRAPHY_MARKER = ILM2.createParameter(
  InteriorLabelModelPosition.SOUTH
)
const BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_TOP_MESSAGE = ELM15.createParameter(
  ExteriorLabelModelPosition.NORTH
)
const BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_BOTTOM_MESSAGE = ELM15.createParameter(
  ExteriorLabelModelPosition.SOUTH
)
const RATIO_WIDTH_HEIGHT = 1 / Math.sin(Math.PI / 3.0)
const BPMN_CONSTANTS_PLACEMENTS_CONVERSATION = SLM.createScaledParameterWithRatio(
  1,
  RATIO_WIDTH_HEIGHT
)
const BPMN_CONSTANTS_PLACEMENTS_CONVERSATION_MARKER = ILM2.createParameter(
  InteriorLabelModelPosition.SOUTH
)
const BPMN_CONSTANTS_PLACEMENTS_DATA_OBJECT_TYPE = ILM2.createParameter(
  InteriorLabelModelPosition.NORTH_WEST
)
const BPMN_CONSTANTS_PLACEMENTS_DATA_OBJECT_MARKER = ILM2.createParameter(
  InteriorLabelModelPosition.SOUTH
)
const BPMN_CONSTANTS_PLACEMENTS_EVENT = SLM.createScaledParameterWithRatio(1, 1)
const BPMN_CONSTANTS_PLACEMENTS_EVENT_TYPE = SLM3.createScaledParameterWithRatio(0.9, 1)
const BPMN_CONSTANTS_PLACEMENTS_GATEWAY = SLM.createScaledParameterWithRatio(1, 1)
const BPMN_CONSTANTS_PLACEMENTS_GATEWAY_TYPE = SLM.createScaledParameterWithRatio(0.6, 1)
const BPMN_CONSTANTS_PLACEMENTS_EVENT_TYPE_MESSAGE = SLM.createScaledParameterWithRatio(0.8, 1.4)
const BPMN_CONSTANTS_PLACEMENTS_ACTIVITY_TASK_TYPE_MESSAGE = SLM.createScaledParameterWithRatio(
  1,
  1.4
)
const BPMN_CONSTANTS_PLACEMENTS_DOUBLE_LINE = new InteriorStretchLabelModel({
  insets: new Insets(BPMN_CONSTANTS_DOUBLE_LINE_OFFSET)
}).createParameter(InteriorStretchLabelModelPosition.CENTER)
const BPMN_CONSTANTS_PLACEMENTS_THICK_LINE = new InteriorStretchLabelModel({
  insets: new Insets(BPMN_CONSTANTS_DOUBLE_LINE_OFFSET * 0.5)
}).createParameter(InteriorStretchLabelModelPosition.CENTER)
const BPMN_CONSTANTS_PLACEMENTS_INSIDE_DOUBLE_LINE = ISLM_INSIDE_DOUBLE_LINE.createParameter(
  InteriorStretchLabelModelPosition.CENTER
)

// Size constants
const BPMN_CONSTANTS_SIZES_MARKER = new Size(10, 10)
const BPMN_CONSTANTS_SIZES_TASK_TYPE = new Size(15, 15)
const BPMN_CONSTANTS_SIZES_MESSAGE = new Size(20, 14)
const BPMN_CONSTANTS_SIZES_CONVERSATION_WIDTH_HEIGHT_RATIO = Math.sin(Math.PI / 3.0)
const BPMN_CONSTANTS_SIZES_CONVERSATION = new Size(
  20,
  20 * BPMN_CONSTANTS_SIZES_CONVERSATION_WIDTH_HEIGHT_RATIO
)
const BPMN_CONSTANTS_SIZES_DATA_OBJECT_TYPE = new Size(10, 8)
const BPMN_CONSTANTS_SIZES_EVENT_PORT = new Size(20, 20)

// Fill constants
const BPMN_CONSTANTS_FILLS_ACTIVITY = new SolidColorFill(250, 250, 250)
const BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_LIGHT = Fill.LIGHT_GRAY
const BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_DARK = Fill.GRAY
const BPMN_CONSTANTS_FILLS_ANNOTATION = new SolidColorFill(250, 250, 250)
const BPMN_CONSTANTS_FILLS_CONVERSATION = new SolidColorFill(250, 250, 250)
const BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_TASK_BAND = new SolidColorFill(250, 250, 250)
const BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_INITIALIZING_PARTICIPANT = Fill.LIGHT_GRAY
const BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_RECEIVING_PARTICIPANT = Fill.GRAY
const BPMN_CONSTANTS_FILLS_DATA_OBJECT = Fill.WHITE
const BPMN_CONSTANTS_FILLS_DATA_STORE = Fill.WHITE
const BPMN_CONSTANTS_FILLS_EVENT = new SolidColorFill(250, 250, 250)
const BPMN_CONSTANTS_FILLS_EVENT_TYPE_CATCHING = Fill.TRANSPARENT
const BPMN_CONSTANTS_FILLS_EVENT_TYPE_THROWING = Fill.BLACK
const BPMN_CONSTANTS_FILLS_GATEWAY = new SolidColorFill(250, 250, 250)
const BPMN_CONSTANTS_FILLS_GROUP_NODE = Fill.TRANSPARENT
const BPMN_CONSTANTS_FILLS_MESSAGE = Fill.WHITE
const BPMN_CONSTANTS_FILLS_MESSAGE_INVERTED = Fill.BLACK
const BPMN_CONSTANTS_FILLS_POOL_NODE_BACKGROUND = new SolidColorFill(224, 224, 224)
const BPMN_CONSTANTS_FILLS_POOL_NODE_EVEN_LEAF_BACKGROUND = new SolidColorFill(196, 215, 237)
const BPMN_CONSTANTS_FILLS_POOL_NODE_EVEN_LEAF_INSET = new SolidColorFill(224, 224, 224)
const BPMN_CONSTANTS_FILLS_POOL_NODE_ODD_LEAF_BACKGROUND = new SolidColorFill(171, 200, 226)
const BPMN_CONSTANTS_FILLS_POOL_NODE_ODD_LEAF_INSET = new SolidColorFill(224, 224, 224)
const BPMN_CONSTANTS_FILLS_POOL_NODE_PARENT_BACKGROUND = new SolidColorFill(113, 146, 178)
const BPMN_CONSTANTS_FILLS_POOL_NODE_PARENT_INSET = new SolidColorFill(224, 224, 224)
const BPMN_CONSTANTS_FILLS_SUB_STATE_BACKGROUND = new SolidColorFill(224, 224, 224, 20)

/**
 * Provides some existing ports as well as ports on the north, south, east and west center of the visual bounds of a
 * BPMN node. An existing port is provided if it either uses an {@link EventPortStyle} and have no edges attached.
 */
export class BpmnPortCandidateProvider extends PortCandidateProviderBase {
  constructor(owner) {
    super()
    this.owner = owner
  }

  /** @return {IEnumerable.<IPortCandidate>} */
  getPortCandidates(context) {
    const node = this.owner
    const portCandidates = new List()

    // provide existing ports as candidates only if they use EventPortStyle and have no edges attached to them.
    node.ports.forEach(port => {
      if (port.style instanceof EventPortStyle && context.graph.edgesAt(port).size === 0) {
        portCandidates.add(new DefaultPortCandidate(port))
      }
    })

    portCandidates.add(new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_TOP_ANCHORED))
    portCandidates.add(
      new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED)
    )
    portCandidates.add(new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_LEFT_ANCHORED))
    portCandidates.add(
      new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_RIGHT_ANCHORED)
    )

    if (
      !(context.parentInputMode instanceof CreateEdgeInputMode) ||
      KeyEventRecognizers.SHIFT_IS_DOWN(
        context.canvasComponent,
        context.canvasComponent.lastMouseEvent
      )
    ) {
      // add a dynamic candidate
      portCandidates.add(new DefaultPortCandidate(node, new FreeNodePortLocationModel()))
    }
    return portCandidates
  }
}

/**
 * An {@link IReshapeHandleProvider} that restricts the available
 * handles provided by the wrapped handler to the ones in the four corners for nodes with {@link GatewayNodeStyle},
 * {@link EventNodeStyle} or {@link ConversationNodeStyle}. The handles have maintain the current aspect ratio of the
 * node for these node styles because those styles keep the aspect ratio for their icons.
 */
export class BpmnReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  constructor(wrappedHandler, node) {
    super()
    this.wrappedHandler = wrappedHandler
    this.node = node
  }

  /**
   * Returns the available handles provided by the wrapped handler
   * restricted to the ones in the four corners and sides for nodes with {@link GatewayNodeStyle},
   * {@link EventNodeStyle} or {@link ConversationNodeStyle}.
   * @see Specified by {@link IReshapeHandleProvider#getAvailableHandles}.
   * @return {HandlePositions}
   */
  getAvailableHandles(inputModeContext) {
    const style = this.node.style
    if (
      style instanceof GatewayNodeStyle ||
      style instanceof EventNodeStyle ||
      style instanceof ConversationNodeStyle
    ) {
      // return only corner handles
      return (
        this.wrappedHandler.getAvailableHandles(inputModeContext) &
        (HandlePositions.NORTH_WEST |
          HandlePositions.NORTH_EAST |
          HandlePositions.SOUTH_WEST |
          HandlePositions.SOUTH_EAST)
      )
    }
    return this.wrappedHandler.getAvailableHandles(inputModeContext)
  }

  /**
   * Returns a custom handle that maintains the aspect ratio of the node with {@link GatewayNodeStyle},
   * {@link EventNodeStyle} or {@link ConversationNodeStyle}.
   * @see Specified by {@link IReshapeHandleProvider#getHandle}.
   * @return {IHandle}
   */
  getHandle(inputModeContext, position) {
    const style = this.node.style
    if (
      style instanceof GatewayNodeStyle ||
      style instanceof EventNodeStyle ||
      style instanceof ConversationNodeStyle
    ) {
      return new AspectRatioHandle(
        this.wrappedHandler.getHandle(inputModeContext, position),
        position,
        this.node.layout
      )
    }
    return this.wrappedHandler.getHandle(inputModeContext, position)
  }
}

/**
 * An implementation of {@link IHandle} that keeps the aspect ratio of a node intact when resizing.
 */
class AspectRatioHandle extends BaseClass(IHandle) {
  constructor(handle, position, layout) {
    super()
    this.handle = handle
    this.position = position
    this.layout = layout
    this.lastLocation = new Point(0, 0)
    this.ratio = 0
    this.originalSize = new Size(0, 0)
  }

  /** @type {IPoint} */
  get location() {
    return this.handle.location
  }

  /**
   * Stores the initial location and aspect ratio for reference, and calls the base method.
   * @see Specified by {@link IDragHandler#initializeDrag}.
   */
  initializeDrag(inputModeContext) {
    this.handle.initializeDrag(inputModeContext)
    this.lastLocation = this.handle.location.toPoint()
    this.originalSize = this.layout.toSize()
    if (this.layout.height === 0) {
      this.ratio = Number.POSITIVE_INFINITY
      return
    }
    switch (this.position) {
      case HandlePositions.NORTH_WEST:
      case HandlePositions.SOUTH_EAST:
        this.ratio = this.layout.width / this.layout.height
        break
      case HandlePositions.NORTH_EAST:
      case HandlePositions.SOUTH_WEST:
        this.ratio = -this.layout.width / this.layout.height
        break
      default:
        this.ratio = 0
    }
  }

  /**
   * Constrains the movement to maintain the aspect ratio. This is done
   * by calculating the constrained location for the given new location,
   * and invoking the original handler with the constrained location.
   * @see Specified by {@link IDragHandler#handleMove}.
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    // For the given new location, the larger node side specifies the actual size change.
    const minSize = 5
    let deltaDragX = newLocation.x - originalLocation.x
    let deltaDragY = newLocation.y - originalLocation.y
    if (this.ratio === 0) {
      deltaDragX = 0
    } else if (!isFinite(this.ratio)) {
      deltaDragY = 0
    } else if (Math.abs(this.ratio) > 1) {
      const sign =
        this.position === HandlePositions.SOUTH_EAST || this.position === HandlePositions.SOUTH_WEST
          ? 1
          : -1
      if (this.originalSize.height + sign * (deltaDragX / this.ratio) > minSize) {
        deltaDragY = deltaDragX / this.ratio
      } else {
        deltaDragY = Math.sign(deltaDragX / this.ratio) * (this.originalSize.height - minSize)
        deltaDragX = deltaDragY * this.ratio
      }
    } else {
      const sign =
        this.position === HandlePositions.NORTH_WEST || this.position === HandlePositions.SOUTH_WEST
          ? -1
          : 1
      if (this.originalSize.width + sign * (deltaDragY * this.ratio) > minSize) {
        deltaDragX = deltaDragY * this.ratio
      } else {
        deltaDragX = Math.sign(deltaDragY * this.ratio) * (this.originalSize.width - minSize)
        deltaDragY = deltaDragX / this.ratio
      }
    }

    newLocation = new Point(originalLocation.x + deltaDragX, originalLocation.y + deltaDragY)
    if (newLocation.equals(this.lastLocation)) {
      return
    }
    this.handle.handleMove(inputModeContext, originalLocation, newLocation)
    this.lastLocation = newLocation
  }

  cancelDrag(inputModeContext, originalLocation) {
    this.handle.cancelDrag(inputModeContext, originalLocation)
  }

  dragFinished(inputModeContext, originalLocation, newLocation) {
    this.handle.dragFinished(inputModeContext, originalLocation, this.lastLocation)
  }

  /** @type {HandleTypes} */
  get type() {
    return this.handle.type
  }

  /** @type {.Cursor} */
  get cursor() {
    return this.handle.cursor
  }
}

/**
 * Specifies the Loop Characteristic of an Activity or Choreography according to BPMN.
 * @see {@link ActivityNodeStyle}
 * @see {@link ChoreographyNodeStyle}
 */
export const LoopCharacteristic = Enum('LoopCharacteristic', {
  /**
   * Specifies that an Activity or Choreography in not looping according to BPMN.
   * @see {@link ActivityNodeStyle}
   * @see {@link ChoreographyNodeStyle}
   */
  NONE: 0,
  /**
   * Specifies that an Activity or Choreography has a Standard Loop Characteristic according to BPMN.
   * @see {@link ActivityNodeStyle}
   * @see {@link ChoreographyNodeStyle}
   */
  LOOP: 1,
  /**
   * Specifies that an Activity or Choreography has a parallel Multi-Instance Loop Characteristic according to BPMN.
   * @see {@link ActivityNodeStyle}
   * @see {@link ChoreographyNodeStyle}
   */
  PARALLEL: 2,
  /**
   * Specifies that an Activity or Choreography has a sequential Multi-Instance Loop Characteristic according to BPMN.
   * @see {@link ActivityNodeStyle}
   * @see {@link ChoreographyNodeStyle}
   */
  SEQUENTIAL: 3
})

/**
 * Specifies the type of a task according to BPMN.
 * @see {@link ActivityNodeStyle}
 */
export const TaskType = Enum('TaskType', {
  /**
   * Specifies the type of a task to be an Abstract Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  ABSTRACT: 0,
  /**
   * Specifies the type of a task to be a Send Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  SEND: 1,
  /**
   * Specifies the type of a task to be a Receive Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  RECEIVE: 2,
  /**
   * Specifies the type of a task to be a User Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  USER: 3,
  /**
   * Specifies the type of a task to be a Manual Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  MANUAL: 4,
  /**
   * Specifies the type of a task to be a Business Rule Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  BUSINESS_RULE: 5,
  /**
   * Specifies the type of a task to be a Service Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  SERVICE: 6,
  /**
   * Specifies the type of a task to be a Script Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  SCRIPT: 7,
  /**
   * Specifies the type of a task to be an Event-Triggered Sub-Task according to BPMN.
   * @see {@link ActivityNodeStyle}
   */
  EVENT_TRIGGERED: 8
})

/**
 * Base-class for {@link ILabelModelParameter}s that are used for label placement at nodes with
 * {@link ChoreographyNodeStyle}.
 */
const ChoreographyParameter = Class('ChoreographyParameter', {
  $with: [ILabelModelParameter],

  $meta() {
    // use GraphMLAttribute to be able to use the static getters of ChoreographyLabelModel during (de-)serialization
    return [GraphMLAttribute().init({ singletonContainers: [ChoreographyLabelModel.$class] })]
  },

  constructor: function() {
    // eslint-disable-line
  },

  /** @type {ILabelModel} */
  model: {
    get() {
      return ChoreographyLabelModel.INSTANCE
    }
  },

  /** @return {IOrientedRectangle} */
  getGeometry(label, parameter) {},

  clone() {},

  /** @return {boolean} */
  supports(label) {
    return INode.isInstance(label.owner)
  }
})

/**
 * {@link ILabelModelParameter} to place participant labels at the participant bands of
 * {@link ChoreographyNodeStyle}.
 */
const ParticipantParameter = Class('ChoreographyParameter', {
  $extends: ChoreographyParameter,

  $meta() {
    // use GraphMLAttribute to be able to use the static getters of ChoreographyLabelModel during (de-)serialization
    return [GraphMLAttribute().init({ singletonContainers: [ChoreographyLabelModel.$class] })]
  },

  /**
   * Creates a new instance of {@link ParticipantParameter}.
   * @param {boolean} top whether or not the label belongs to a top participant.
   * @param {number} index the position of the participant in its group (top or bottom participants).
   */
  constructor: function(top, index) {
    ChoreographyParameter.call(this)
    this.top = top
    this.index = index
  },

  /**
   * Creates a positioned rectangle that is placed on the according participant band.
   * @return {IOrientedRectangle}
   */
  getGeometry: function(label, parameter) {
    if (INode.isInstance(label.owner)) {
      const owner = label.owner
      if (owner.style instanceof ChoreographyNodeStyle) {
        const style = owner.style
        ChoreographyLabelModel.DUMMY_NODE.layout = style.getParticipantBandBounds(
          owner,
          this.index,
          this.top
        )
        ChoreographyLabelModel.DUMMY_LABEL.preferredSize = label.preferredSize
        return ParticipantParameter.INTERIOR_LABEL_MODEL.getGeometry(
          ChoreographyLabelModel.DUMMY_LABEL,
          ParticipantParameter.PLACEMENT
        )
      }
    }
    return IOrientedRectangle.EMPTY
  },

  /** @return {ParticipantParameter} */
  clone: function() {
    return new ParticipantParameter(this.top, this.index)
  },

  $static: {
    INTERIOR_LABEL_MODEL: {
      // '$meta': function() {
      //   return [TypeAttribute(.DashStyle.$class)];},
      get: function() {
        return (
          ParticipantParameter.$interiorLabelModel ||
          (ParticipantParameter.$interiorLabelModel = new InteriorLabelModel({
            insets: new Insets(3)
          }))
        )
      }
    },

    PLACEMENT: {
      // '$meta': function() {
      //   return [TypeAttribute(.DashStyle.$class)];},
      get: function() {
        return (
          ParticipantParameter.$placement ||
          (ParticipantParameter.$placement = ParticipantParameter.INTERIOR_LABEL_MODEL.createParameter(
            InteriorLabelModelPosition.NORTH
          ))
        )
      }
    }
  }
})

/**
 * A label model for nodes using a {@link ChoreographyNodeStyle} that position labels on the participant or task name
 * bands.
 */
export const ChoreographyLabelModel = Class('ChoreographyLabelModel', {
  $with: [ILabelModel, ILabelModelParameterProvider],

  /**
   * Calculates the geometry in form of an {@link IOrientedRectangle}
   * for a given label using the given model parameter.
   * @param {ILabelModelParameter} parameter A parameter that has been created by this model.
   * This is typically the parameter that yielded this instance through its
   * {@link ILabelModelParameter#model} property.
   * @param {ILabel} label the label to calculate the geometry for
   * @return {IOrientedRectangle} An instance that describes the geometry. This is typically
   * an instance designed as a flyweight, so clients should not cache the
   * instance but store the values if they need a snapshot for later use
   * @see Specified by {@link ILabelModel#getGeometry}.
   */
  getGeometry: function(label, parameter) {
    if (
      INode.isInstance(label.owner) &&
      label.owner.style instanceof ChoreographyNodeStyle &&
      parameter instanceof ChoreographyParameter
    ) {
      return parameter.getGeometry(label)
    } else if (INode.isInstance(label.owner)) {
      const layout = label.owner.layout
      return new OrientedRectangle(layout.x, layout.y + layout.height, layout.width, layout.height)
    }
    return IOrientedRectangle.EMPTY
  },

  /**
   * Returns {@link ChoreographyLabelModel#TASK_NAME_BAND} as default parameter.
   * @return {ILabelModelParameter}
   * @see Specified by {@link ILabelModel#createDefaultParameter}.
   */
  createDefaultParameter: function() {
    return ChoreographyLabelModel.TASK_NAME_BAND
  },

  /**
   * Creates the parameter for the participant at the given position.
   * @param {boolean} top Whether the index refers to {@link ChoreographyNodeStyle#topParticipants} or
   *   {@link ChoreographyNodeStyle#bottomParticipants}.
   * @param {number} index The index of the participant band the label shall be placed in.
   * @return {ILabelModelParameter}
   */
  createParticipantParameter: function(top, index) {
    return new ParticipantParameter(top, index)
  },

  /**
   * Provides a {@link ILookup lookup context} for the given combination of label
   * and parameter.
   * @param {ILabel} label The label to use in the context.
   * @param {ILabelModelParameter} parameter The parameter to use for the label in the context.
   * @return {ILookup} An implementation of the {@link ILookup} interface that can be used
   *   to query additional aspects of the label/parameter combination.
   * @see {@link ILookup#EMPTY}
   * @see Specified by {@link ILabelModel#getContext}.
   */
  getContext: function(label, parameter) {
    return InteriorLabelModel.CENTER.model.getContext(label, parameter)
  },

  /**
   * Returns an instance that implements the given type or <code>null</code>.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-<code>null</code> implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {Class} type the type for which an instance shall be returned
   * @return {Object} an instance that is assignable to type or <code>null</code>
   * @see Specified by {@link ILookup#lookup}.
   */
  lookup: function(type) {
    if (type === ILabelModelParameterProvider.$class) {
      return this
    }
    if (type === ILabelModelParameterFinder.$class) {
      return DefaultLabelModelParameterFinder.INSTANCE
    }
    if (type === ILabelCandidateDescriptorProvider.$class) {
      return ConstantLabelCandidateDescriptorProvider.INTERNAL_DESCRIPTOR_PROVIDER
    }
    return null
  },

  /**
   * Returns an enumerator over a set of possible {@link ILabelModelParameter}
   * instances that can be used for the given label and model.
   * @param {ILabel} label The label instance to use.
   * @param {ILabelModel} model The model to provide parameters for.
   * @return {IEnumerable.<ILabelModelParameter>} A possibly empty enumerator over a
   *   set of label model parameters.
   * @see Specified by {@link ILabelModelParameterProvider#getParameters}.
   */
  getParameters: function(label, model) {
    const parameters = new List()
    if (INode.isInstance(label.owner) && label.owner.style instanceof ChoreographyNodeStyle) {
      const node = label.owner
      const nodeStyle = node.style
      for (let i = 0; i < nodeStyle.topParticipants.size; i++) {
        parameters.add(this.createParticipantParameter(true, i))
      }
      parameters.add(ChoreographyLabelModel.TASK_NAME_BAND)
      for (let i = 0; i < nodeStyle.bottomParticipants.size; i++) {
        parameters.add(this.createParticipantParameter(false, i))
      }
      parameters.add(ChoreographyLabelModel.NORTH_MESSAGE)
      parameters.add(ChoreographyLabelModel.SOUTH_MESSAGE)
    }

    return parameters
  },

  /**
   * Finds the parameter for the next free location at a node with {@link ChoreographyNodeStyle}.
   * This function will traverse all valid positions in the following order until it finds a free location:
   * <ul>
   *   <li>Task band</li>
   *   <li>Participant bands</li>
   *   <li>Top message</li>
   *   <li>Bottom message</li>
   * <ul>
   * @return {ILabelModelParameter}
   */
  findNextParameter: function(node) {
    if (node.style instanceof ChoreographyNodeStyle) {
      const nodeStyle = node.style
      const taskNameBandCount = 1
      const topParticipantCount = nodeStyle.topParticipants.size
      const bottomParticipantCount = nodeStyle.bottomParticipants.size
      const messageCount = 2

      const parameterTaken = new Array(
        taskNameBandCount + topParticipantCount + bottomParticipantCount + messageCount
      )

      // check which label positions are already taken
      node.labels.forEach(label => {
        if (label.layoutParameter instanceof ChoreographyParameter) {
          let index = 0
          const parameter = label.layoutParameter
          if (!(parameter instanceof TaskNameBandParameter)) {
            index++

            if (parameter instanceof ParticipantParameter) {
              const pp = parameter instanceof ParticipantParameter ? parameter : null
              if (!pp.top) {
                index += topParticipantCount
              }
              index += pp.index
            } else {
              index += topParticipantCount + bottomParticipantCount
              if (!parameter.north) {
                index++
              }
            }
          }
          parameterTaken[index] = true
        }
      })

      // get first label position that isn't taken already
      for (let i = 0; i < parameterTaken.length; i++) {
        if (!parameterTaken[i]) {
          if (i < taskNameBandCount) {
            return ChoreographyLabelModel.TASK_NAME_BAND
          }
          i -= taskNameBandCount
          if (i < topParticipantCount) {
            return this.createParticipantParameter(true, i)
          }
          i -= topParticipantCount
          if (i < bottomParticipantCount) {
            return this.createParticipantParameter(false, i)
          }
          i -= bottomParticipantCount
          return i === 0
            ? ChoreographyLabelModel.NORTH_MESSAGE
            : ChoreographyLabelModel.SOUTH_MESSAGE
        }
      }
    }
    return null
  },

  $static: {
    /**
     * The {@link ChoreographyLabelModel} singleton.
     * @return {ChoreographyLabelModel}
     */
    INSTANCE: {
      get: function() {
        return (
          ChoreographyLabelModel.$instance ||
          (ChoreographyLabelModel.$instance = new ChoreographyLabelModel())
        )
      }
    },

    INTERIOR_LABEL_MODEL: {
      get: function() {
        return (
          ChoreographyLabelModel.$interiorLabel ||
          (ChoreographyLabelModel.$interiorLabel = new InteriorLabelModel())
        )
      }
    },

    DUMMY_NODE: {
      get: function() {
        return (
          ChoreographyLabelModel.$dummyNode ||
          (ChoreographyLabelModel.$dummyNode = new SimpleNode())
        )
      }
    },

    DUMMY_LABEL: {
      get: function() {
        return (
          ChoreographyLabelModel.$dummyLabel ||
          (ChoreographyLabelModel.$dummyLabel = new SimpleLabel(
            ChoreographyLabelModel.DUMMY_NODE,
            '',
            InteriorLabelModel.CENTER
          ))
        )
      }
    },

    TASK_NAME_BAND: {
      get: function() {
        return (
          ChoreographyLabelModel.$taskNameBand ||
          (ChoreographyLabelModel.$taskNameBand = new TaskNameBandParameter())
        )
      }
    },

    /**
     * Returns a layout parameter that describes a position north of the node.
     * @return {MessageParameter}
     */
    NORTH_MESSAGE: {
      get: function() {
        if (!ChoreographyLabelModel.$northMessage) {
          const messageParameter = new MessageParameter()
          messageParameter.north = true
          ChoreographyLabelModel.$northMessage = messageParameter
        }
        return ChoreographyLabelModel.$northMessage
      }
    },

    /**
     * Returns a layout parameter that describes a position south of the node.
     * @return {MessageParameter}
     */
    SOUTH_MESSAGE: {
      get: function() {
        if (!ChoreographyLabelModel.$southMessage) {
          const messageParameter = new MessageParameter()
          messageParameter.north = false
          ChoreographyLabelModel.$southMessage = messageParameter
        }
        return ChoreographyLabelModel.$southMessage
      }
    }
  }
})

/**
 * {@link ILabelModelParameter} that places the label on the task name band in the center of the node.
 */
const TaskNameBandParameter = Class('TaskNameBandParameter', {
  $extends: ChoreographyParameter,

  $meta: function() {
    // use GraphMLAttribute to be able to use the static getters of ChoreographyLabelModel during (de-)serialization
    return [GraphMLAttribute().init({ singletonContainers: [ChoreographyLabelModel.$class] })]
  },

  getGeometry: function(label) {
    const owner = label.owner
    const nodeStyle = owner.style
    const bandBounds = nodeStyle.getTaskNameBandBounds(owner)
    ChoreographyLabelModel.DUMMY_NODE.layout = bandBounds
    ChoreographyLabelModel.DUMMY_LABEL.preferredSize = label.preferredSize
    return ChoreographyLabelModel.INTERIOR_LABEL_MODEL.getGeometry(
      ChoreographyLabelModel.DUMMY_LABEL,
      InteriorLabelModel.CENTER
    )
  },

  clone: function() {
    return new TaskNameBandParameter()
  }
})

/**
 * {@link ILabelModelParameter} that places the label above or below the node.
 */
class MessageParameter extends ChoreographyParameter {
  constructor() {
    super()
    this.north = false
  }

  get model() {
    return super.model
  }

  /** @return {IOrientedRectangle} */
  getGeometry(label) {
    const parameter = this.north
      ? MessageParameter.NORTH_PARAMETER
      : MessageParameter.SOUTH_PARAMETER
    return parameter.model.getGeometry(label, parameter)
  }

  supports(label) {
    return super.supports(label)
  }

  /** @return {Object} */
  clone() {
    const messageParameter = new MessageParameter()
    messageParameter.north = this.north
    return messageParameter
  }

  /**
   * Returns a preconfigured parameter instance that places the label above the node.
   * @return {ILabelModelParameter}
   */
  static get NORTH_PARAMETER() {
    if (!MessageParameter.$northParameter) {
      const model = new SandwichLabelModel()
      model.yOffset = 15
      MessageParameter.$northParameter = model.createNorthParameter()
    }
    return MessageParameter.$northParameter
  }

  /**
   * Returns a preconfigured parameter instance that places the label below the node.
   * @return {ILabelModelParameter}
   */
  static get SOUTH_PARAMETER() {
    if (!MessageParameter.$southParamter) {
      const model = new SandwichLabelModel()
      model.yOffset = 15
      MessageParameter.$southParamter = model.createSouthParameter()
    }
    return MessageParameter.$southParamter
  }
}

/**
 * An {@link NodeStyleBase} implementation used as base class for nodes styles representing BPMN
 * elements.
 */
class BpmnNodeStyle extends NodeStyleBase {
  constructor() {
    super()
    this.$minimumSize = Size.EMPTY

    // the icon that determines the look and shape of the node.
    // @type {Icon}
    this.icon = null
    // the counter of modifications
    // {number}
    this.modCount = 0
  }

  /**
   * Gets the minimum node size for nodes using this style.
   * @type {Size}
   */
  get minimumSize() {
    return this.$minimumSize
  }

  /**
   * Sets the minimum node size for nodes using this style.
   * @type {Size}
   */
  set minimumSize(value) {
    this.$minimumSize = value
  }

  /**
   * Callback that creates the visual.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {.IRenderContext} renderContext The render context.
   * @return {.Visual} The visual as required by the {@link .IVisualCreator#createVisual}
   *   interface.
   * @see {@link NodeStyleBase#updateVisual}
   */
  createVisual(renderContext, node) {
    this.updateIcon()
    if (this.icon === null) {
      return null
    }

    const bounds = node.layout
    this.icon.setBounds(new Rect(Point.ORIGIN, bounds.toSize()))
    const visual = this.icon.createVisual(renderContext)

    const container = new SvgVisualGroup()
    if (visual !== null) {
      container.add(visual)
    }
    const transform = new Matrix()
    transform.translate(node.layout.topLeft)
    container.transform = transform
    container['render-data-cache'] = {
      modCount: this.modCount,
      bounds: bounds.toRect()
    }

    return container
  }

  /**
   * Callback that updates the visual previously created by {@link NodeStyleBase#createVisual}.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {.IRenderContext} renderContext The render context.
   * @param {.Visual} oldVisual The visual that has been created in the call to
   *   {@link NodeStyleBase#createVisual}.
   * @return {.Visual} The visual as required by the {@link .IVisualCreator#createVisual}
   *   interface.
   * @see {@link NodeStyleBase#createVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    if (this.icon === null) {
      return null
    }

    const container = oldVisual instanceof SvgVisual ? oldVisual : null
    const cache = container !== null ? container['render-data-cache'] : null

    if (cache === null || cache.modCount !== this.modCount) {
      return this.createVisual(renderContext, node)
    }

    const newBounds = node.layout

    if (cache.bounds.equals(newBounds)) {
      // node bounds didn't change
      return oldVisual
    }

    if (!cache.bounds.size.equals(newBounds.toRect().size)) {
      const iconBounds = new Rect(0, 0, newBounds.width, newBounds.height)
      this.icon.setBounds(iconBounds)

      /** @type {.Visual} */
      let oldIconVisual = null
      /** @type {.Visual} */
      let newIconVisual = null
      if (container.children.size === 0) {
        newIconVisual = this.icon.createVisual(renderContext)
      } else {
        oldIconVisual = container.children.elementAt(0)
        newIconVisual = this.icon.updateVisual(renderContext, oldIconVisual)
      }

      // update visual
      if (oldIconVisual !== newIconVisual) {
        if (oldIconVisual !== null) {
          container.remove(oldIconVisual)
        }
        if (newIconVisual !== null) {
          container.add(newIconVisual)
        }
      }
    }

    const transform = new Matrix()
    transform.translate(node.layout.topLeft)
    container.transform = transform

    cache.bounds = newBounds.toRect()

    return container
  }

  /**
   * Updates the {@link BpmnNodeStyle#icon}.
   * This method is called by {@link BpmnNodeStyle#createVisual}.
   */
  updateIcon() {}

  /**
   * Performs the {@link ILookup#lookup} operation for the
   * {@link INodeStyleRenderer#getContext} that has been queried from the
   * {@link NodeStyleBase#renderer}.
   * @param {INode} node The node to use for the context lookup.
   * @param {Class} type The type to query.
   * @return {Object} An implementation of the <code>type</code> or <code>null</code>.
   */
  lookup(node, type) {
    const lookup = super.lookup(node, type)
    if (lookup === null && type === INodeSizeConstraintProvider.$class) {
      if (!this.minimumSize.equals(Size.EMPTY)) {
        const maximumSize = new Size(Number.MAX_VALUE, Number.MAX_VALUE)
        return new NodeSizeConstraintProvider(this.minimumSize, maximumSize)
      }
    }
    return lookup
  }
}

/**
 * A participant of a Choreography that can be added to a {@link ChoreographyNodeStyle}.
 */
export class Participant extends BaseClass(ICloneable) {
  constructor() {
    super()
    this.$modCount = 0
    this.$multiInstance = false
  }

  /**
   * @type {number}
   */
  get modCount() {
    return this.$modCount
  }

  /**
   * Gets if the participant contains multiple instances.
   * @type {boolean}
   */
  get multiInstance() {
    return this.$multiInstance
  }

  /**
   * Sets if the participant contains multiple instances.
   * @type {boolean}
   */
  set multiInstance(value) {
    if (this.$multiInstance !== value) {
      this.$modCount++
      this.$multiInstance = value
    }
  }

  /**
   * @return {number}
   */
  getSize() {
    return this.multiInstance ? 32 : 20
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    const newParticipant = new Participant()
    newParticipant.multiInstance = this.multiInstance
    return newParticipant
  }
}

/**
 * An {@link .IVisualCreator} that allows to set bounds for the visualization.
 * To use this class for the flyweight pattern, {@link Icon#setBounds} should be called before creating or updating
 * the visuals.
 */
class Icon extends BaseClass(IVisualCreator) {
  constructor() {
    super()
    this.bounds = new MutableRectangle(0, 0, 0, 0)
  }

  /**
   * Sets the bounds the visual shall consider.
   * @param {IRectangle} bounds
   * @see Specified by {@link Icon#setBounds}.
   */
  setBounds(bounds) {
    this.bounds = bounds
  }
}

/**
 * An {@link Icon} that combines multiple icons in an horizontal line.
 */
class LineUpIcon extends Icon {
  constructor(icons, innerIconSize, gap) {
    super()
    this.icons = icons
    this.innerIconSize = innerIconSize
    this.gap = gap

    const combinedWidth = icons.size * innerIconSize.width + (icons.size - 1) * gap
    this.combinedSize = new Size(combinedWidth, innerIconSize.height)
  }

  /** @return {.Visual} */
  createVisual(context) {
    if (this.bounds === null) {
      return null
    }

    const container = new SvgVisualGroup()

    let offset = 0
    this.icons.forEach(pathIcon => {
      pathIcon.setBounds(new Rect(offset, 0, this.innerIconSize.width, this.innerIconSize.height))
      container.add(pathIcon.createVisual(context))
      offset += this.innerIconSize.width + this.gap
    })
    const bound = this.bounds.toRect()

    const transform = new Matrix()
    transform.translate(new Point(bound.centerX - this.combinedSize.width * 0.5, bound.y))
    container.transform = transform

    container['render-data-cache'] = {
      location: bound.topLeft,
      size: bound.size
    }

    return container
  }

  /** @return {.Visual} */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container === null || container.children.size !== this.icons.size) {
      return this.createVisual(context)
    }

    const cache = container['render-data-cache']
    if (!cache.location.equals(this.bounds.topLeft)) {
      const bound = this.bounds.toRect()

      const transform = new Matrix()
      transform.translate(new Point(bound.centerX - this.combinedSize.width * 0.5, bound.y))
      container.transform = transform

      container['render-data-cache'] = {
        location: bound.topLeft,
        size: bound.size
      }
    }
    return container
  }

  setBounds(bounds) {
    super.setBounds(Rect.fromCenter(bounds.center, this.combinedSize))
  }
}

/**
 * An {@link Icon} whose position is specified by an {@link ILabelModelParameter}.
 */
class PlacedIcon extends Icon {
  constructor(innerIcon, placementParameter, minimumSize) {
    super()
    this.innerIcon = innerIcon
    this.placementParameter = placementParameter
    this.dummyNode = new SimpleNode()
    const dummyLabel = new SimpleLabel(this.dummyNode, '', placementParameter)
    dummyLabel.preferredSize = minimumSize
    this.dummyLabel = dummyLabel
  }

  /** @return {.Visual} */
  createVisual(context) {
    return this.innerIcon.createVisual(context)
  }

  /** @return {.Visual} */
  updateVisual(context, oldVisual) {
    return this.innerIcon.updateVisual(context, oldVisual)
  }

  setBounds(bounds) {
    this.dummyNode.layout = bounds
    this.innerIcon.setBounds(
      this.placementParameter.model.getGeometry(this.dummyLabel, this.placementParameter).bounds
    )
  }
}

/**
 * A {@link Icon} which displays a rectangle.
 */
class RectIcon extends Icon {
  constructor() {
    super()
    this.cornerRadius = 0
    this.fill = null
    this.stroke = null
  }

  /** @return {.Visual} */
  createVisual(context) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', this.bounds.x)
    rect.setAttribute('y', this.bounds.y)
    rect.setAttribute('width', this.bounds.width)
    rect.setAttribute('height', this.bounds.height)
    rect.setAttribute('rx', this.cornerRadius)
    rect.setAttribute('ry', this.cornerRadius)
    Stroke.setStroke(this.stroke, rect, context)
    Fill.setFill(this.fill, rect, context)

    rect['render-data-cache'] = new PathIconState(
      this.bounds.width,
      this.bounds.height,
      this.stroke,
      this.fill
    )
    return new SvgVisual(rect)
  }

  /** @return {.Visual} */
  updateVisual(context, oldVisual) {
    const rect = oldVisual.svgElement
    const oldCache = rect['render-data-cache']

    if (!oldCache.equals(this.bounds.width, this.bounds.height, this.stroke, this.fill)) {
      rect.setAttribute('width', this.bounds.width)
      rect.setAttribute('height', this.bounds.height)
      Stroke.setStroke(this.stroke, rect, context)
      Fill.setFill(this.fill, rect, context)
      rect['render-data-cache'] = new PathIconState(
        this.bounds.width,
        this.bounds.height,
        this.stroke,
        this.fill
      )
    }

    return oldVisual
  }

  setBounds(bounds) {
    super.setBounds(bounds)
  }
}

/**
 * An {@link Icon} that combines multiple icons. This can be useful when creating complex images like a timer.
 */
class CombinedIcon extends Icon {
  constructor(icons) {
    super()
    this.icons = icons
  }

  /** @return {.Visual} */
  createVisual(context) {
    if (this.bounds === null) {
      return null
    }
    const container = new SvgVisualGroup()

    const iconBounds = new Rect(Point.ORIGIN, this.bounds.toSize())
    this.icons.forEach(icon => {
      icon.setBounds(iconBounds)
      container.add(icon.createVisual(context))
    })

    const bound = this.bounds.toRect()

    const transform = new Matrix()
    transform.translate(bound.topLeft)
    container.transform = transform

    container['render-data-cache'] = {
      location: bound.topLeft,
      size: bound.size
    }

    return container
  }

  /** @return {.Visual} */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container === null || container.children.size !== this.icons.size) {
      return this.createVisual(context)
    }

    const cache = container['render-data-cache']

    if (!cache.size.equals(this.bounds.size)) {
      // size changed -> we have to update the icons
      const iconBounds = new Rect(Point.ORIGIN, this.bounds.size)
      this.icons.forEach((pathIcon, index) => {
        pathIcon.setBounds(iconBounds)
        const oldPathVisual = container.children.elementAt(index)
        const newPathVisual = pathIcon.updateVisual(context, oldPathVisual)
        if (!oldPathVisual.equals(newPathVisual)) {
          container.children.remove(oldPathVisual)
          container.children.insert(index, newPathVisual)
        }
      })
    } else if (cache.location.equals(this.bounds.topLeft)) {
      // bounds didn't change at all
      return container
    }
    const bound = this.bounds.toRect()
    const transform = new Matrix()
    transform.translate(bound.topLeft)
    container.transform = transform

    container['render-data-cache'] = {
      location: bound.topLeft,
      size: bound.size
    }

    return container
  }
}

/**
 * An {@link Icon} that displays an SVG path.
 */
class PathIcon extends Icon {
  constructor() {
    super()

    this.fill = null
    this.stroke = null
    this.path = null
  }

  /** @return {.Visual} */
  createVisual(context) {
    const matrix2D = new Matrix()
    matrix2D.scale(Math.max(0, this.bounds.width), Math.max(0, this.bounds.height))

    const path = this.path.createSvgPath(matrix2D)
    Stroke.setStroke(this.stroke, path, context)
    Fill.setFill(this.fill, path, context)

    path['render-data-cache'] = new PathIconState(
      this.bounds.width,
      this.bounds.height,
      this.stroke,
      this.fill
    )

    SvgVisual.setTranslate(path, this.bounds.x, this.bounds.y)

    return new SvgVisual(path)
  }

  /** @return {.Visual} */
  updateVisual(context, oldVisual) {
    const path = oldVisual.svgElement
    if (path === null) {
      return this.createVisual(context)
    }

    const oldCache = path['render-data-cache']

    if (!oldCache.stroke.equals(this.stroke)) {
      Stroke.setStroke(this.stroke, path, context)
      oldCache.stroke = this.stroke
    }
    if (oldCache.fill !== null && oldCache.fill !== this.fill) {
      Fill.setFill(this.fill, path, context)
      oldCache.fill = this.fill
    }

    if (oldCache.width !== this.bounds.width || oldCache.height !== this.bounds.width) {
      const matrix2D = new Matrix()
      matrix2D.scale(Math.max(0, this.bounds.width), Math.max(0, this.bounds.height))
      path.setAttribute('d', this.path.createSvgPathData(matrix2D))
      oldCache.width = this.bounds.width
      oldCache.height = this.bounds.height
    }

    SvgVisual.setTranslate(path, this.bounds.x, this.bounds.y)
    return oldVisual
  }
}

/**
 * An {@link Icon} whose corner radius can be chosen for each corner individually.
 * This is useful for the outline of participants in {@link ChoreographyNodeStyle}.
 */
class VariableRectIcon extends Icon {
  constructor() {
    super()

    this.topLeftRadius = 0
    this.topRightRadius = 0
    this.bottomLeftRadius = 0
    this.bottomRightRadius = 0
    this.fill = null
    this.stroke = null
  }

  /** @return {.Visual} */
  createVisual(context) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute(
      'd',
      `M 0 ${this.topLeftRadius} Q 0 0 ${this.topLeftRadius} ${0} L ${this.bounds.width -
        this.topRightRadius} ${0} Q ${this.bounds.width} 0 ${this.bounds.width} ${
        this.topRightRadius
      } L ${this.bounds.width} ${this.bounds.height - this.bottomRightRadius} Q ${
        this.bounds.width
      } ${this.bounds.height} ${this.bounds.width - this.bottomRightRadius} ${
        this.bounds.height
      } L ${this.bottomLeftRadius} ${this.bounds.height} Q 0 ${this.bounds.height} 0 ${this.bounds
        .height - this.bottomRightRadius} Z`
    )
    Stroke.setStroke(this.stroke, path, context)
    Fill.setFill(this.fill, path, context)

    path['render-data-cache'] = new PathIconState(
      this.bounds.width,
      this.bounds.height,
      this.stroke,
      this.fill
    )
    SvgVisual.setTranslate(path, this.bounds.x, this.bounds.y)
    return new SvgVisual(path)
  }

  /** @return {.Visual} */
  updateVisual(context, oldVisual) {
    const path = oldVisual.svgElement
    if (!path) {
      return this.createVisual(context)
    }

    const oldCache = path['render-data-cache']
    const newCache = new PathIconState(
      this.bounds.width,
      this.bounds.height,
      this.stroke,
      this.fill
    )

    if (!oldCache.equals(newCache)) {
      path.setAttribute(
        'd',
        `M 0 ${this.topLeftRadius} Q 0 0 ${this.topLeftRadius} ${0} L ${this.bounds.width -
          this.topRightRadius} ${0} Q ${this.bounds.width} 0 ${this.bounds.width} ${
          this.topRightRadius
        } L ${this.bounds.width} ${this.bounds.height - this.bottomRightRadius} Q ${
          this.bounds.width
        } ${this.bounds.height} ${this.bounds.width - this.bottomRightRadius} ${
          this.bounds.height
        } L ${this.bottomLeftRadius} ${this.bounds.height} Q 0 ${this.bounds.height} 0 ${this.bounds
          .height - this.bottomRightRadius} Z`
      )
      Stroke.setStroke(this.stroke, path, context)
      Fill.setFill(this.fill, path, context)

      SvgVisual.setTranslate(path, this.bounds.x, this.bounds.y)

      path['render-data-cache'] = newCache
    }

    return oldVisual
  }
}

/**
 * Builder class to create {@link Icon}s.
 */
class IconBuilder {
  constructor() {
    this.$path = null
    this.stroke = null
    this.fill = null
    this.clear()
  }

  /** @type {GeneralPath} */
  get path() {
    return this.$path || (this.$path = new GeneralPath())
  }

  /** @type {GeneralPath} */
  set path(value) {
    this.$path = value
  }

  moveTo(x, y) {
    this.path.moveTo(x, y)
  }

  lineTo(x, y) {
    this.path.lineTo(x, y)
  }

  quadTo(cx, cy, x, y) {
    this.path.quadTo(cx, cy, x, y)
  }

  cubicTo(c1x, c1y, c2x, c2y, x, y) {
    this.path.cubicTo(c1x, c1y, c2x, c2y, x, y)
  }

  arcTo(r, cx, cy, fromAngle, toAngle) {
    const a = (toAngle - fromAngle) / 2.0
    const sgn = a < 0 ? -1 : 1
    if (Math.abs(a) > Math.PI / 4) {
      // bigger then a quarter circle -> split into multiple arcs
      let start = fromAngle
      let end = fromAngle + sgn * (Math.PI / 2)
      while (sgn * end < sgn * toAngle) {
        this.arcTo(r, cx, cy, start, end)
        start = end
        end += sgn * (Math.PI / 2)
      }
      this.arcTo(r, cx, cy, start, toAngle)
      return
    }

    // calculate unrotated control points
    const x1 = r * Math.cos(a)
    const y1 = -r * Math.sin(a)

    const m = (Math.sqrt(2) - 1) * 4 / 3
    const mTanA = m * Math.tan(a)

    const x2 = x1 - mTanA * y1
    const y2 = y1 + mTanA * x1
    const x3 = x2
    const y3 = -y2

    // rotate the control points by (fromAngle + a)
    const rot = fromAngle + a
    const sinRot = Math.sin(rot)
    const cosRot = Math.cos(rot)

    this.path.cubicTo(
      cx + x2 * cosRot - y2 * sinRot,
      cy + x2 * sinRot + y2 * cosRot,
      cx + x3 * cosRot - y3 * sinRot,
      cy + x3 * sinRot + y3 * cosRot,
      cx + r * Math.cos(toAngle),
      cy + r * Math.sin(toAngle)
    )
  }

  /** @return {Icon} */
  createEllipseIcon() {
    this.path.appendEllipse(new Rect(0, 0, 1, 1), false)
    return this.getPathIcon()
  }

  close() {
    this.path.close()
  }

  /** @return {Icon} */
  combineIcons(icons) {
    const icon = new CombinedIcon(icons)
    this.clear()
    return icon
  }

  /** @return {Icon} */
  createLineUpIcon(icons, innerIconSize, gap) {
    const icon = new LineUpIcon(icons, innerIconSize, gap)
    this.clear()
    return icon
  }

  /** @return {Icon} */
  getPathIcon() {
    const icon = new PathIcon()
    icon.path = this.path
    icon.stroke = this.stroke
    icon.fill = this.fill

    this.clear()
    return icon
  }

  /** @return {Icon} */
  createRectIcon(cornerRadius) {
    const rectIcon = new RectIcon()
    rectIcon.stroke = this.stroke
    rectIcon.fill = this.fill
    rectIcon.cornerRadius = cornerRadius

    this.clear()
    return rectIcon
  }

  /** @return {Icon} */
  createVariableRectIcon(topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
    const rectIcon = new VariableRectIcon()
    rectIcon.stroke = this.stroke
    rectIcon.fill = this.fill
    rectIcon.topLeftRadius = topLeftRadius
    rectIcon.topRightRadius = topRightRadius
    rectIcon.bottomLeftRadius = bottomLeftRadius
    rectIcon.bottomRightRadius = bottomRightRadius

    this.clear()
    return rectIcon
  }

  clear() {
    this.stroke = Stroke.BLACK
    this.fill = Fill.TRANSPARENT
    this.path = null
  }
}

/**
 * A class that combines an event type with a fill to be used as a key in a map.
 */
class EventTypeWithFill {
  constructor(type, filled) {
    this.type = type
    this.filled = filled
  }

  /** @return {boolean} */
  equals(obj) {
    if (!(obj instanceof EventTypeWithFill)) {
      return false
    }
    return obj.type === this.type && obj.filled === this.filled
  }

  /** @return {number} */
  hashCode() {
    return (this.type * 397) ^ (this.filled ? 1 : 0)
  }
}

/**
 * Specifies the type of a Conversation according to BPMN.
 * @see {@link ConversationNodeStyle}
 */
export const ConversationType = Enum('ConversationType', {
  /**
   * Specifies that a Conversation is a plain Conversation according to BPMN.
   * @see {@link ConversationNodeStyle}
   */
  CONVERSATION: 0,
  /**
   * Specifies that a Conversation is a Sub-Conversation according to BPMN.
   * @see {@link ConversationNodeStyle}
   */
  SUB_CONVERSATION: 1,
  /**
   * Specifies that a Conversation is a Call Conversation according to BPMN where a Global Conversation is called.
   * @see {@link ConversationNodeStyle}
   */
  CALLING_GLOBAL_CONVERSATION: 2,
  /**
   * Specifies that a Conversation is a Call Conversation according to BPMN where a Collaboration is called.
   * @see {@link ConversationNodeStyle}
   */
  CALLING_COLLABORATION: 3
})

/**
 * A class that combines a stroke with a fill to be used as a key in a map.
 */
class StrokeAndFill {
  constructor(stroke, fill) {
    this.stroke = stroke
    this.fill = fill
  }

  equals(obj) {
    if (!(obj instanceof StrokeAndFill)) {
      return false
    }
    return obj.stroke === this.stroke && obj.fill === this.fill
  }

  /** @return {number} */
  hashCode() {
    return (this.stroke.hashCode() * 397) ^ this.fill.hashCode()
  }
}

/**
 * A class that stores the important information about a participant to be used as a key in a map.
 */
class ParticipantBandType {
  constructor(sending, topRadius, bottomRadius) {
    this.sending = sending
    this.topRadius = topRadius
    this.bottomRadius = bottomRadius
  }

  /** @return {boolean} */
  equals(obj) {
    if (!(obj instanceof ParticipantBandType)) {
      return false
    }
    return (
      obj.sending === this.sending &&
      obj.topRadius === this.topRadius &&
      obj.bottomRadius === this.bottomRadius
    )
  }

  /** @return {number} */
  hashCode() {
    return ((this.sending ? 1 : 0) * 397) ^ (this.topRadius * 397) ^ this.bottomRadius
  }
}

/**
 * A class that stores all important information for a plus icon to be used as key in a map.
 */
class PlusData {
  constructor(size, stroke, fill) {
    this.size = size
    this.stroke = stroke
    this.fill = fill
  }

  /** @return {boolean} */
  equals(obj) {
    if (!(obj instanceof PlusData)) {
      return false
    }
    return obj.size === this.size && obj.stroke === this.stroke && obj.fill === this.fill
  }

  /** @return {number} */
  hashCode() {
    const fillHC = this.fill !== null ? this.fill.hashCode() : 1
    return (((this.size * 397) ^ this.stroke.hashCode()) * 397) ^ fillHC
  }
}

/**
 * Factory class providing icons according to the BPMN.
 */
class IconFactory {
  /** @return {Icon} */
  static createPlacedIcon(icon, placement, innerSize) {
    return new PlacedIcon(icon, placement, innerSize)
  }

  /** @return {Icon} */
  static createCombinedIcon(icons) {
    return IconFactory.BUILDER.combineIcons(icons)
  }

  /** @return {Icon} */
  static createLineUpIcon(icons, innerIconSize, gap) {
    return IconFactory.BUILDER.createLineUpIcon(icons, innerIconSize, gap)
  }

  /** @return {Icon} */
  static createActivity(type) {
    let result = IconFactory.ACTIVITY_ICONS.get(type)
    if (!result) {
      const BUILDER = IconFactory.BUILDER
      BUILDER.fill = BPMN_CONSTANTS_FILLS_ACTIVITY

      switch (type) {
        case ActivityType.CALL_ACTIVITY: {
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_CALL_ACTIVITY
          result = BUILDER.createRectIcon(BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS)
          break
        }
        case ActivityType.TRANSACTION: {
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_TASK
          const icons = new List()
          icons.add(this.BUILDER.createRectIcon(BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS))

          BUILDER.stroke = BPMN_CONSTANTS_STROKES_TASK
          BUILDER.fill = BPMN_CONSTANTS_FILLS_ACTIVITY
          const rectIcon = BUILDER.createRectIcon(
            BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS - BPMN_CONSTANTS_DOUBLE_LINE_OFFSET
          )
          icons.add(
            IconFactory.createPlacedIcon(
              rectIcon,
              BPMN_CONSTANTS_PLACEMENTS_DOUBLE_LINE,
              Size.EMPTY
            )
          )
          result = BUILDER.combineIcons(icons)
          break
        }
        case ActivityType.EVENT_SUB_PROCESS: {
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_ACTIVITY_EVENT_SUB_PROCESS
          result = BUILDER.createRectIcon(BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS)
          break
        }
        default: {
          // Task, SubProcess
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_TASK
          result = BUILDER.createRectIcon(BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS)
          break
        }
      }
      IconFactory.ACTIVITY_ICONS.set(type, result)
    }
    return result
  }

  /** @return {Icon} */
  static createActivityTaskType(type) {
    const BUILDER = IconFactory.BUILDER
    let result = IconFactory.TASK_ICONS.get(type)
    if (!result) {
      /** @type {List.<Icon>} */
      let icons = null
      switch (type) {
        case TaskType.SEND: {
          result = IconFactory.createPlacedIcon(
            IconFactory.createMessage(
              BPMN_CONSTANTS_STROKES_MESSAGE_INVERTED,
              BPMN_CONSTANTS_FILLS_MESSAGE_INVERTED
            ),
            BPMN_CONSTANTS_PLACEMENTS_ACTIVITY_TASK_TYPE_MESSAGE,
            Size.EMPTY
          )
          break
        }
        case TaskType.RECEIVE: {
          result = IconFactory.createPlacedIcon(
            IconFactory.createMessage(BPMN_CONSTANTS_STROKES_MESSAGE, BPMN_CONSTANTS_FILLS_MESSAGE),
            BPMN_CONSTANTS_PLACEMENTS_ACTIVITY_TASK_TYPE_MESSAGE,
            Size.EMPTY
          )
          break
        }
        case TaskType.USER: {
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_ACTIVITY_TASK_ROUND
          BUILDER.fill = BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_LIGHT

          // body + head
          icons = new List()
          BUILDER.moveTo(1, 1)
          BUILDER.lineTo(0, 1)
          BUILDER.lineTo(0, 0.701)
          BUILDER.quadTo(0.13, 0.5, 0.316, 0.443)
          BUILDER.lineTo(
            0.5 + 0.224 * Math.cos(3.0 / 4.0 * Math.PI),
            0.224 + 0.224 * Math.sin(3.0 / 4.0 * Math.PI)
          )
          BUILDER.arcTo(0.224, 0.5, 0.224, 3.0 / 4.0 * Math.PI, 9.0 / 4.0 * Math.PI)
          BUILDER.lineTo(0.684, 0.443)
          BUILDER.quadTo(0.87, 0.5, 1, 0.701)
          BUILDER.close()
          icons.add(BUILDER.getPathIcon())

          // hair
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_ACTIVITY_TASK_ROUND
          BUILDER.fill = Fill.BLACK
          BUILDER.moveTo(0.287, 0.229)
          BUILDER.cubicTo(0.48, 0.053, 0.52, 0.253, 0.713, 0.137)
          BUILDER.arcTo(0.224, 0.5, 0.224, 31.0 / 16.0 * Math.PI, Math.PI)
          BUILDER.close()
          icons.add(BUILDER.getPathIcon())

          BUILDER.stroke = BPMN_CONSTANTS_STROKES_ACTIVITY_TASK_ROUND

          // arms
          BUILDER.moveTo(0.19, 1)
          BUILDER.lineTo(0.19, 0.816)
          BUILDER.moveTo(0.81, 1)
          BUILDER.lineTo(0.81, 0.816)

          // collar
          BUILDER.moveTo(0.316, 0.443)
          BUILDER.cubicTo(0.3, 0.672, 0.7, 0.672, 0.684, 0.443)
          icons.add(BUILDER.getPathIcon())

          result = BUILDER.combineIcons(icons)
          break
        }
        case TaskType.MANUAL: {
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_ACTIVITY_TASK_ROUND
          BUILDER.moveTo(0, 0.286)
          BUILDER.quadTo(0.037, 0.175, 0.147, 0.143)

          // thumb
          BUILDER.lineTo(0.584, 0.143)
          BUILDER.quadTo(0.602, 0.225, 0.451, 0.286)
          BUILDER.lineTo(0.265, 0.286)

          // index finger
          BUILDER.lineTo(0.95, 0.286)
          BUILDER.quadTo(1, 0.358, 0.95, 0.429)
          BUILDER.lineTo(0.472, 0.429)

          // middle finger
          BUILDER.lineTo(0.915, 0.429)
          BUILDER.quadTo(0.965, 0.5, 0.915, 0.571)
          BUILDER.lineTo(0.531, 0.571)

          // ring finger
          BUILDER.lineTo(0.879, 0.571)
          BUILDER.quadTo(0.929, 0.642, 0.879, 0.714)
          BUILDER.lineTo(0.502, 0.714)

          // pinkie
          BUILDER.lineTo(0.796, 0.714)
          BUILDER.quadTo(0.847, 0.786, 0.796, 0.857)
          BUILDER.lineTo(0.088, 0.857)

          BUILDER.quadTo(0.022, 0.833, 0, 0.759)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        case TaskType.BUSINESS_RULE: {
          const headHeight = 0.192
          const rowHeight = 0.304
          const column1Width = 0.264

          icons = new List()
          BUILDER.fill = BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_DARK

          // outline
          BUILDER.moveTo(0, 0.1)
          BUILDER.lineTo(1, 0.1)
          BUILDER.lineTo(1, 0.9)
          BUILDER.lineTo(0, 0.9)
          BUILDER.close()
          icons.add(BUILDER.getPathIcon())

          // rows outline
          BUILDER.fill = BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_LIGHT
          BUILDER.moveTo(0, 0.1 + headHeight)
          BUILDER.lineTo(1, 0.1 + headHeight)
          BUILDER.lineTo(1, 0.9)
          BUILDER.lineTo(0, 0.9)
          BUILDER.close()
          icons.add(BUILDER.getPathIcon())

          // line between second and third row
          BUILDER.moveTo(0, 0.1 + headHeight + rowHeight)
          BUILDER.lineTo(1, 0.1 + headHeight + rowHeight)

          // line between first and second column
          BUILDER.moveTo(column1Width, 0.1 + headHeight)
          BUILDER.lineTo(column1Width, 0.9)
          icons.add(BUILDER.getPathIcon())

          result = BUILDER.combineIcons(icons)
          break
        }
        case TaskType.SERVICE: {
          icons = new List()
          // top gear
          icons.add(
            createGear(
              0.4,
              0.4,
              0.4,
              BPMN_CONSTANTS_STROKES_TASK_TYPE_SERVICE,
              BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_DARK
            )
          )
          icons.add(
            createGear(
              0.16,
              0.4,
              0.4,
              BPMN_CONSTANTS_STROKES_TASK_TYPE_SERVICE,
              BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_LIGHT
            )
          )

          // bottom gear
          icons.add(
            createGear(
              0.4,
              0.6,
              0.6,
              BPMN_CONSTANTS_STROKES_TASK_TYPE_SERVICE,
              BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_DARK
            )
          )
          icons.add(
            createGear(
              0.16,
              0.6,
              0.6,
              BPMN_CONSTANTS_STROKES_TASK_TYPE_SERVICE,
              BPMN_CONSTANTS_FILLS_ACTIVITY_TASK_LIGHT
            )
          )

          result = BUILDER.combineIcons(icons)
          break
        }
        case TaskType.SCRIPT: {
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_ACTIVITY_TASK_ROUND

          // outline
          const size = 0.5
          const curveEndX = 0.235
          const curveEndY = size
          const curveCenterX = curveEndX + (size - curveEndX) * 0.5
          const curveDeltaX = 0.5
          const curveDeltaY = size * 0.5

          BUILDER.moveTo(0.5 + size, 0.5 - size)
          BUILDER.cubicTo(
            0.5 + curveCenterX - curveDeltaX,
            0.5 - curveDeltaY,
            0.5 + curveCenterX + curveDeltaX,
            0.5 + curveDeltaY,
            0.5 + curveEndX,
            0.5 + curveEndY
          )
          BUILDER.lineTo(0.5 - size, 0.5 + size)
          BUILDER.cubicTo(
            0.5 - curveCenterX + curveDeltaX,
            0.5 + curveDeltaY,
            0.5 - curveCenterX - curveDeltaX,
            0.5 - curveDeltaY,
            0.5 - curveEndX,
            0.5 - curveEndY
          )
          BUILDER.close()

          // inner lines
          const deltaY2 = size * 0.2
          const deltaX1 = 0.045
          const deltaX2 = 0.085
          const length = 0.3 * (size + curveEndX)

          BUILDER.moveTo(0.5 - length - deltaX2, 0.5 - 3 * deltaY2)
          BUILDER.lineTo(0.5 + length - deltaX2, 0.5 - 3 * deltaY2)
          BUILDER.moveTo(0.5 - length - deltaX1, 0.5 - deltaY2)
          BUILDER.lineTo(0.5 + length - deltaX1, 0.5 - deltaY2)
          BUILDER.moveTo(0.5 - length + deltaX1, 0.5 + deltaY2)
          BUILDER.lineTo(0.5 + length + deltaX1, 0.5 + deltaY2)
          BUILDER.moveTo(0.5 - length + deltaX2, 0.5 + 3 * deltaY2)
          BUILDER.lineTo(0.5 + length + deltaX2, 0.5 + 3 * deltaY2)
          result = BUILDER.getPathIcon()
          break
        }
        case TaskType.EVENT_TRIGGERED:
        default:
          break
      }
      IconFactory.TASK_ICONS.set(type, result)
    }
    return result
  }

  /** @return {Icon} */
  static createLoopCharacteristic(loopCharacteristic) {
    const BUILDER = IconFactory.BUILDER
    let result = IconFactory.LOOP_TYPES.get(loopCharacteristic)
    if (!result) {
      switch (loopCharacteristic) {
        case LoopCharacteristic.LOOP: {
          const fromAngle = 0.65 * Math.PI
          const toAngle = 2.4 * Math.PI

          const x = 0.5 + 0.5 * Math.cos(fromAngle)
          const y = 0.5 + 0.5 * Math.sin(fromAngle)
          BUILDER.moveTo(x, y)
          BUILDER.arcTo(0.5, 0.5, 0.5, fromAngle, toAngle)
          BUILDER.moveTo(x - 0.25, y + 0.05)
          BUILDER.lineTo(x, y)
          BUILDER.lineTo(x, y - 0.3)

          result = BUILDER.getPathIcon()
          break
        }
        case LoopCharacteristic.PARALLEL: {
          BUILDER.fill = Fill.BLACK

          for (let xOffset = 0; xOffset < 1; xOffset += 0.4) {
            BUILDER.moveTo(xOffset, 0)
            BUILDER.lineTo(xOffset + 0.2, 0)
            BUILDER.lineTo(xOffset + 0.2, 1)
            BUILDER.lineTo(xOffset, 1)
            BUILDER.close()
          }
          result = BUILDER.getPathIcon()
          break
        }
        case LoopCharacteristic.SEQUENTIAL: {
          BUILDER.fill = Fill.BLACK

          for (let yOffset = 0; yOffset < 1; yOffset += 0.4) {
            BUILDER.moveTo(0, yOffset)
            BUILDER.lineTo(0, yOffset + 0.2)
            BUILDER.lineTo(1, yOffset + 0.2)
            BUILDER.lineTo(1, yOffset)
            BUILDER.close()
          }
          result = BUILDER.getPathIcon()
          break
        }
        case LoopCharacteristic.NONE:
        default:
          break
      }
      IconFactory.LOOP_TYPES.set(loopCharacteristic, result)
    }
    return result
  }

  /** @return {Icon} */
  static createAdHoc() {
    if (!IconFactory.$adHoc) {
      const BUILDER = IconFactory.BUILDER
      BUILDER.fill = Fill.BLACK

      const fromAngle1 = 5.0 / 4.0 * Math.PI
      const toAngle1 = 7.0 / 4.0 * Math.PI
      const fromAngle2 = 1.0 / 4.0 * Math.PI
      const toAngle2 = 3.0 / 4.0 * Math.PI

      const smallR = 0.25 / (1 - Math.sqrt(1.5 - Math.sqrt(2)))
      const co = smallR * IconFactory.RADIUS_TO_CORNER_OFFSET
      const dy = 0.1

      const c1x = smallR - co
      const c1y = 0.35 + smallR
      const x1 = c1x + smallR * Math.cos(fromAngle1)
      const y1 = c1y + smallR * Math.sin(fromAngle1)

      const c2x = c1x + (2 * smallR - 2 * co)
      const c2y = c1y - 2 * smallR + 2 * co

      const x2 = c2x + smallR * Math.cos(fromAngle2)
      const y2 = c2y + smallR * Math.sin(fromAngle2)
      BUILDER.moveTo(x1, y1 + dy)
      BUILDER.lineTo(x1, y1)
      BUILDER.arcTo(smallR, c1x, c1y, fromAngle1, toAngle1)
      BUILDER.arcTo(smallR, c2x, c2y, toAngle2, fromAngle2)
      BUILDER.lineTo(x2, y2 + dy)
      BUILDER.arcTo(smallR, c2x, c2y + dy, fromAngle2, toAngle2)
      BUILDER.arcTo(smallR, c1x, c1y + dy, toAngle1, fromAngle1)
      BUILDER.close()
      IconFactory.$adHoc = BUILDER.getPathIcon()
    }
    return IconFactory.$adHoc
  }

  /** @return {Icon} */
  static createCompensation(filled) {
    if ((!filled && !IconFactory.$comparison) || (filled && !IconFactory.$filledComparison)) {
      const BUILDER = IconFactory.BUILDER
      BUILDER.fill = filled
        ? BPMN_CONSTANTS_FILLS_EVENT_TYPE_THROWING
        : BPMN_CONSTANTS_FILLS_EVENT_TYPE_CATCHING
      const sqrt3inv = 1 / Math.sqrt(3)
      const halfSqurt3 = sqrt3inv / 2
      const xOff = 0.5 / (2 * sqrt3inv)
      BUILDER.moveTo(0, 0.5)
      BUILDER.lineTo(xOff, 0.5 - halfSqurt3)
      BUILDER.lineTo(xOff, 0.5)
      BUILDER.lineTo(2 * xOff, 0.5 - halfSqurt3)
      BUILDER.lineTo(2 * xOff, 0.5 + halfSqurt3)
      BUILDER.lineTo(xOff, 0.5)
      BUILDER.lineTo(xOff, 0.5 + halfSqurt3)
      BUILDER.close()
      if (filled) {
        IconFactory.$filledComparison = BUILDER.getPathIcon()
      } else {
        IconFactory.$comparison = BUILDER.getPathIcon()
      }
    }
    return filled ? IconFactory.$filledComparison : IconFactory.$comparison
  }

  /** @return {Icon} */
  static createStaticSubState(subState) {
    const BUILDER = IconFactory.BUILDER
    let result = IconFactory.SUB_STATES.get(subState)
    if (!result) {
      switch (subState) {
        case SubState.EXPANDED: {
          const icons = new List()
          BUILDER.fill = BPMN_CONSTANTS_FILLS_SUB_STATE_BACKGROUND
          icons.add(BUILDER.createRectIcon(0))
          BUILDER.moveTo(0.2, 0.5)
          BUILDER.lineTo(0.8, 0.5)
          icons.add(BUILDER.getPathIcon())
          result = BUILDER.combineIcons(icons)
          break
        }
        case SubState.COLLAPSED: {
          const icons2 = new List()
          BUILDER.fill = BPMN_CONSTANTS_FILLS_SUB_STATE_BACKGROUND
          icons2.add(BUILDER.createRectIcon(0))
          BUILDER.moveTo(0.2, 0.5)
          BUILDER.lineTo(0.8, 0.5)
          BUILDER.moveTo(0.5, 0.2)
          BUILDER.lineTo(0.5, 0.8)
          icons2.add(BUILDER.getPathIcon())
          result = BUILDER.combineIcons(icons2)
          break
        }
        case SubState.NONE:
        default:
          break
      }
      IconFactory.SUB_STATES.set(subState, result)
    }
    return result
  }

  /** @return {Icon} */
  static createDynamicSubState(node) {
    return new CollapseButtonIcon(node)
  }

  /** @return {Icon} */
  static createGateway() {
    if (!IconFactory.$gateway) {
      const BUILDER = IconFactory.BUILDER
      BUILDER.stroke = BPMN_CONSTANTS_STROKES_GATEWAY
      BUILDER.fill = BPMN_CONSTANTS_FILLS_GATEWAY
      BUILDER.moveTo(0.5, 0)
      BUILDER.lineTo(1, 0.5)
      BUILDER.lineTo(0.5, 1)
      BUILDER.lineTo(0, 0.5)
      BUILDER.close()
      IconFactory.$gateway = BUILDER.getPathIcon()
    }
    return IconFactory.$gateway
  }

  /** @return {Icon} */
  static createGatewayType(type) {
    let result = IconFactory.GATEWAY_TYPES.get(type)
    if (!result) {
      const BUILDER = IconFactory.BUILDER
      /** @type {List.<Icon>} */
      switch (type) {
        case GatewayType.EXCLUSIVE_WITHOUT_MARKER: {
          result = null
          break
        }
        case GatewayType.EXCLUSIVE_WITH_MARKER: {
          IconFactory.BUILDER.fill = Fill.BLACK
          const cornerOffY = 0.5 - 0.5 * Math.sin(Math.PI / 4)
          const cornerOffX = cornerOffY + 0.1
          const xOff = 0.06

          const x1 = cornerOffX
          const x2 = cornerOffX + 2 * xOff

          const y1 = cornerOffY
          const y2 = 0.5 - (0.5 * xOff - cornerOffY * xOff) / (0.5 - cornerOffX - xOff)

          BUILDER.moveTo(x1, y1)
          BUILDER.lineTo(x2, y1)
          BUILDER.lineTo(0.5, y2)
          BUILDER.lineTo(1 - x2, y1)
          BUILDER.lineTo(1 - x1, y1)
          BUILDER.lineTo(0.5 + xOff, 0.5)
          BUILDER.lineTo(1 - x1, 1 - y1)
          BUILDER.lineTo(1 - x2, 1 - y1)
          BUILDER.lineTo(0.5, 1 - y2)
          BUILDER.lineTo(x2, 1 - y1)
          BUILDER.lineTo(x1, 1 - y1)
          BUILDER.lineTo(0.5 - xOff, 0.5)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        case GatewayType.INCLUSIVE: {
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_GATEWAY_TYPE_INCLUSIVE
          result = IconFactory.createPlacedIcon(
            BUILDER.createEllipseIcon(),
            BPMN_CONSTANTS_PLACEMENTS_THICK_LINE,
            Size.EMPTY
          )
          break
        }
        case GatewayType.EVENT_BASED:
        case GatewayType.EXCLUSIVE_EVENT_BASED: {
          const icons = new List()
          icons.add(BUILDER.createEllipseIcon())

          if (type === GatewayType.EVENT_BASED) {
            const innerCircleIcon = BUILDER.createEllipseIcon()
            icons.add(
              IconFactory.createPlacedIcon(
                innerCircleIcon,
                BPMN_CONSTANTS_PLACEMENTS_DOUBLE_LINE,
                Size.EMPTY
              )
            )
          }

          const polygon = List.fromArray(IconFactory.createPolygon(5, 0.5, 0))
          BUILDER.moveTo(polygon.get(0).x, polygon.get(0).y)
          for (let i = 1; i < 5; i++) {
            BUILDER.lineTo(polygon.get(i).x, polygon.get(i).y)
          }
          BUILDER.close()
          const innerIcon = BUILDER.getPathIcon()
          icons.add(
            IconFactory.createPlacedIcon(
              innerIcon,
              BPMN_CONSTANTS_PLACEMENTS_INSIDE_DOUBLE_LINE,
              Size.EMPTY
            )
          )
          result = BUILDER.combineIcons(icons)
          break
        }
        case GatewayType.PARALLEL: {
          result = createPlusIcon(0.8, Stroke.BLACK, Fill.BLACK)
          break
        }
        case GatewayType.PARALLEL_EVENT_BASED: {
          const icons = new List()
          icons.add(BUILDER.createEllipseIcon())
          icons.add(createPlusIcon(0.6, Stroke.BLACK, Fill.TRANSPARENT))
          result = BUILDER.combineIcons(icons)
          break
        }
        case GatewayType.COMPLEX: {
          BUILDER.fill = Fill.BLACK
          const outer = IconFactory.createPolygon(24, 0.5, Math.PI / 24)
          const width = Math.sqrt(0.5 - 0.5 * Math.cos(Math.PI / 12))
          const rInner = width * Math.sqrt(1 + Math.sqrt(2) / 2)
          const inner = IconFactory.createPolygon(8, rInner, Math.PI / 8)

          BUILDER.moveTo(outer[0].x, outer[0].y)
          for (let i = 0; i < 8; i++) {
            BUILDER.lineTo(outer[3 * i].x, outer[3 * i].y)
            BUILDER.lineTo(inner[i].x, inner[i].y)
            BUILDER.lineTo(outer[3 * i + 2].x, outer[3 * i + 2].y)
          }
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        default:
          break
      }
      IconFactory.GATEWAY_TYPES.set(type, result)
    }
    return result
  }

  /** @return {Icon} */
  static createEvent(characteristic) {
    const BUILDER = IconFactory.BUILDER
    let result = IconFactory.EVENT_CHARACTERISTICS.get(characteristic)
    if (!result) {
      /** @type {.Stroke} */
      let stroke
      switch (characteristic) {
        case EventCharacteristic.START:
        case EventCharacteristic.SUB_PROCESS_INTERRUPTING:
          stroke = BPMN_CONSTANTS_STROKES_EVENT_START
          break
        case EventCharacteristic.SUB_PROCESS_NON_INTERRUPTING:
          stroke = BPMN_CONSTANTS_STROKES_EVENT_SUB_PROCESS_NON_INTERRUPTING
          break
        case EventCharacteristic.CATCHING:
        case EventCharacteristic.BOUNDARY_INTERRUPTING:
        case EventCharacteristic.THROWING:
          stroke = BPMN_CONSTANTS_STROKES_EVENT_INTERMEDIATE
          break
        case EventCharacteristic.BOUNDARY_NON_INTERRUPTING:
          stroke = BPMN_CONSTANTS_STROKES_EVENT_BOUNDARY_NON_INTERRUPTING
          break
        case EventCharacteristic.END:
          stroke = BPMN_CONSTANTS_STROKES_EVENT_END
          break
        default:
          break
      }

      BUILDER.stroke = stroke
      BUILDER.fill = BPMN_CONSTANTS_FILLS_EVENT
      const ellipseIcon = BUILDER.createEllipseIcon()

      switch (characteristic) {
        case EventCharacteristic.CATCHING:
        case EventCharacteristic.BOUNDARY_INTERRUPTING:
        case EventCharacteristic.BOUNDARY_NON_INTERRUPTING:
        case EventCharacteristic.THROWING: {
          const icons = new List()
          icons.add(ellipseIcon)

          BUILDER.stroke = stroke
          BUILDER.fill = BPMN_CONSTANTS_FILLS_EVENT
          const innerEllipseIcon = BUILDER.createEllipseIcon()
          icons.add(
            IconFactory.createPlacedIcon(
              innerEllipseIcon,
              BPMN_CONSTANTS_PLACEMENTS_DOUBLE_LINE,
              Size.EMPTY
            )
          )
          result = IconFactory.createCombinedIcon(icons)
          break
        }
        default:
          result = ellipseIcon
          break
      }
      IconFactory.EVENT_CHARACTERISTICS.set(characteristic, result)
    }
    return result
  }

  /** @return {Icon} */
  static createEventType(type, filled) {
    const BUILDER = IconFactory.BUILDER
    const eventTypeWithFill = new EventTypeWithFill(type, filled)
    let result = IconFactory.EVENT_TYPES.get(eventTypeWithFill)
    if (!result) {
      BUILDER.stroke = BPMN_CONSTANTS_STROKES_EVENT_TYPE
      BUILDER.fill = filled
        ? BPMN_CONSTANTS_FILLS_EVENT_TYPE_THROWING
        : BPMN_CONSTANTS_FILLS_EVENT_TYPE_CATCHING

      /** @type {List.<Icon>} */
      let icons
      switch (type) {
        case EventType.PLAIN:
          result = null
          break
        case EventType.MESSAGE: {
          const messagePen = filled
            ? BPMN_CONSTANTS_STROKES_MESSAGE_INVERTED
            : BPMN_CONSTANTS_STROKES_MESSAGE
          const messageFill = filled
            ? BPMN_CONSTANTS_FILLS_MESSAGE_INVERTED
            : BPMN_CONSTANTS_FILLS_MESSAGE
          const combinedIcons = IconFactory.createMessage(messagePen, messageFill)
          result = IconFactory.createPlacedIcon(
            combinedIcons,
            BPMN_CONSTANTS_PLACEMENTS_EVENT_TYPE_MESSAGE,
            Size.EMPTY
          )
          break
        }
        case EventType.TIMER: {
          icons = new List()
          icons.add(BUILDER.createEllipseIcon())
          BUILDER.stroke = filled
            ? BPMN_CONSTANTS_STROKES_EVENT_TYPE_DETAIL_INVERTED
            : BPMN_CONSTANTS_STROKES_EVENT_TYPE_DETAIL
          const outerPoints = IconFactory.createPolygon(12, 0.5, 0)
          const innerPoints = IconFactory.createPolygon(12, 0.4, 0)
          for (let i = 0; i < 12; i++) {
            BUILDER.moveTo(outerPoints[i].x, outerPoints[i].y)
            BUILDER.lineTo(innerPoints[i].x, innerPoints[i].y)
          }
          BUILDER.moveTo(0.5, 0.5)
          BUILDER.lineTo(0.8, 0.5)
          BUILDER.moveTo(0.5, 0.5)
          BUILDER.lineTo(0.6, 0.1)
          icons.add(BUILDER.getPathIcon())
          result = IconFactory.createCombinedIcon(icons)
          break
        }
        case EventType.ESCALATION: {
          const cornerOnCircle = 0.5 - 0.5 * IconFactory.RADIUS_TO_CORNER_OFFSET
          BUILDER.moveTo(0.5, 0)
          BUILDER.lineTo(0.5 + cornerOnCircle, 0.5 + cornerOnCircle)
          BUILDER.lineTo(0.5, 0.5)
          BUILDER.lineTo(0.5 - cornerOnCircle, 0.5 + cornerOnCircle)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        case EventType.CONDITIONAL:
          icons = new List()
          BUILDER.moveTo(0.217, 0.147)
          BUILDER.lineTo(0.783, 0.147)
          BUILDER.lineTo(0.783, 0.853)
          BUILDER.lineTo(0.217, 0.853)
          BUILDER.close()
          icons.add(BUILDER.getPathIcon())

          BUILDER.stroke = filled
            ? BPMN_CONSTANTS_STROKES_EVENT_TYPE_DETAIL_INVERTED
            : BPMN_CONSTANTS_STROKES_EVENT_TYPE_DETAIL
          for (let i = 0; i < 4; i++) {
            const y = 0.235 + i * 0.177
            BUILDER.moveTo(0.274, y)
            BUILDER.lineTo(0.726, y)
          }
          icons.add(BUILDER.getPathIcon())
          result = BUILDER.combineIcons(icons)
          break
        case EventType.LINK:
          BUILDER.moveTo(0.1, 0.38)
          BUILDER.lineTo(0.5, 0.38)
          BUILDER.lineTo(0.5, 0.1)
          BUILDER.lineTo(0.9, 0.5)
          BUILDER.lineTo(0.5, 0.9)
          BUILDER.lineTo(0.5, 0.62)
          BUILDER.lineTo(0.1, 0.62)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        case EventType.ERROR: {
          const x1 = 0.354
          const x2 = 0.084
          const x3 = 0.115
          const y1 = 0.354
          const y2 = 0.049
          const y3 = 0.26

          BUILDER.moveTo(0.5 + x1, 0.5 - y1)
          BUILDER.lineTo(0.5 + x2, 0.5 + y2)
          BUILDER.lineTo(0.5 - x3, 0.5 - y3)
          BUILDER.lineTo(0.5 - x1, 0.5 + y1)
          BUILDER.lineTo(0.5 - x2, 0.5 - y2)
          BUILDER.lineTo(0.5 + x3, 0.5 + y3)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        case EventType.CANCEL: {
          const bigD = 0.5 - 0.5 * IconFactory.RADIUS_TO_CORNER_OFFSET
          const smallD = 0.05
          BUILDER.moveTo(0.5 - bigD - smallD, 0.5 - bigD + smallD)
          BUILDER.lineTo(0.5 - bigD + smallD, 0.5 - bigD - smallD)
          BUILDER.lineTo(0.5, 0.5 - 2 * smallD)
          BUILDER.lineTo(0.5 + (bigD - smallD), 0.5 - bigD - smallD)
          BUILDER.lineTo(0.5 + bigD + smallD, 0.5 - bigD + smallD)
          BUILDER.lineTo(0.5 + 2 * smallD, 0.5)
          BUILDER.lineTo(0.5 + bigD + smallD, 0.5 + bigD - smallD)
          BUILDER.lineTo(0.5 + bigD - smallD, 0.5 + bigD + smallD)
          BUILDER.lineTo(0.5, 0.5 + 2 * smallD)
          BUILDER.lineTo(0.5 - bigD + smallD, 0.5 + bigD + smallD)
          BUILDER.lineTo(0.5 - bigD - smallD, 0.5 + bigD - smallD)
          BUILDER.lineTo(0.5 - 2 * smallD, 0.5)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        case EventType.COMPENSATION:
          result = IconFactory.createCompensation(filled)
          break
        case EventType.SIGNAL: {
          const triangle = IconFactory.createPolygon(3, 0.5, 0)
          BUILDER.moveTo(triangle[0].x, triangle[0].y)
          BUILDER.lineTo(triangle[1].x, triangle[1].y)
          BUILDER.lineTo(triangle[2].x, triangle[2].y)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        case EventType.MULTIPLE: {
          const pentagram = IconFactory.createPolygon(5, 0.5, 0)
          BUILDER.moveTo(pentagram[0].x, pentagram[0].y)
          BUILDER.lineTo(pentagram[1].x, pentagram[1].y)
          BUILDER.lineTo(pentagram[2].x, pentagram[2].y)
          BUILDER.lineTo(pentagram[3].x, pentagram[3].y)
          BUILDER.lineTo(pentagram[4].x, pentagram[4].y)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        }
        case EventType.PARALLEL_MULTIPLE: {
          const fill = filled
            ? BPMN_CONSTANTS_FILLS_EVENT_TYPE_THROWING
            : BPMN_CONSTANTS_FILLS_EVENT_TYPE_CATCHING
          result = createPlusIcon(1.0, BPMN_CONSTANTS_STROKES_EVENT_TYPE, fill)
          break
        }
        case EventType.TERMINATE:
          result = BUILDER.createEllipseIcon()
          break
        default:
          break
      }
      IconFactory.EVENT_TYPES.set(eventTypeWithFill, result)
    }
    return result
  }

  /** @return {Icon} */
  static createMessage(stroke, fill) {
    const BUILDER = IconFactory.BUILDER
    const strokeAndFill = new StrokeAndFill(stroke, fill)
    let result = IconFactory.MESSAGES.get(strokeAndFill)
    if (!result) {
      const icons = new List()

      BUILDER.stroke = stroke
      BUILDER.fill = fill
      BUILDER.moveTo(0, 0)
      BUILDER.lineTo(1, 0)
      BUILDER.lineTo(1, 1)
      BUILDER.lineTo(0, 1)
      BUILDER.close()
      icons.add(BUILDER.getPathIcon())

      BUILDER.stroke = stroke
      BUILDER.moveTo(0, 0)
      BUILDER.lineTo(0.5, 0.5)
      BUILDER.lineTo(1, 0)
      icons.add(BUILDER.getPathIcon())
      result = BUILDER.combineIcons(icons)
      IconFactory.MESSAGES.set(strokeAndFill, result)
    }
    return result
  }

  /** @return {Icon} */
  static createChoreography(type) {
    const BUILDER = IconFactory.BUILDER
    if (type === ChoreographyType.TASK) {
      if (!IconFactory.$choreographyTask) {
        BUILDER.stroke = BPMN_CONSTANTS_STROKES_CHOREOGRAPHY_TASK
        IconFactory.$choreographyTask = BUILDER.createRectIcon(
          BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS
        )
      }
      return IconFactory.$choreographyTask
    }
    if (!IconFactory.$choreographyCall) {
      BUILDER.stroke = BPMN_CONSTANTS_STROKES_CHOREOGRAPHY_CALL
      IconFactory.$choreographyCall = BUILDER.createRectIcon(
        BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS
      )
    }
    return IconFactory.$choreographyCall
  }

  /** @return {Icon} */
  static createChoreographyParticipant(sending, topRadius, bottomRadius) {
    const BUILDER = IconFactory.BUILDER
    const participantBandType = new ParticipantBandType(sending, topRadius, bottomRadius)
    let result = IconFactory.PARTICIPANT_BANDS.get(participantBandType)
    if (!result) {
      BUILDER.stroke = BPMN_CONSTANTS_STROKES_CHOREOGRAPHY_TASK
      BUILDER.fill = sending
        ? BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_INITIALIZING_PARTICIPANT
        : BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_RECEIVING_PARTICIPANT
      result = BUILDER.createVariableRectIcon(topRadius, topRadius, bottomRadius, bottomRadius)
      IconFactory.PARTICIPANT_BANDS.set(participantBandType, result)
    }
    return result
  }

  /** @return {Icon} */
  static createChoreographyTaskBand() {
    const BUILDER = IconFactory.BUILDER
    if (!IconFactory.$taskBand) {
      BUILDER.stroke = Stroke.TRANSPARENT
      BUILDER.fill = BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_TASK_BAND
      IconFactory.$taskBand = BUILDER.createRectIcon(0)
    }
    return IconFactory.$taskBand
  }

  /** @return {Icon} */
  static createConversation(type) {
    const BUILDER = IconFactory.BUILDER
    let result = IconFactory.CONVERSATIONS.get(type)
    if (!result) {
      switch (type) {
        default:
        case ConversationType.CONVERSATION:
        case ConversationType.SUB_CONVERSATION:
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_CONVERSATION
          break
        case ConversationType.CALLING_GLOBAL_CONVERSATION:
        case ConversationType.CALLING_COLLABORATION:
          BUILDER.stroke = BPMN_CONSTANTS_STROKES_CALLING_CONVERSATION
          break
      }
      BUILDER.fill = BPMN_CONSTANTS_FILLS_CONVERSATION

      BUILDER.moveTo(0, 0.5)
      BUILDER.lineTo(0.25, 0)
      BUILDER.lineTo(0.75, 0)
      BUILDER.lineTo(1, 0.5)
      BUILDER.lineTo(0.75, 1)
      BUILDER.lineTo(0.25, 1)
      BUILDER.close()
      result = BUILDER.getPathIcon()
      IconFactory.CONVERSATIONS.set(type, result)
    }
    return result
  }

  /** @return {Icon} */
  static createConversationMarker(type) {
    switch (type) {
      case ConversationType.SUB_CONVERSATION:
      case ConversationType.CALLING_COLLABORATION:
        return (
          IconFactory.$conversationSubState ||
          (IconFactory.$conversationSubState = IconFactory.createStaticSubState(SubState.COLLAPSED))
        )
      default:
        return null
    }
  }

  /** @return {Icon} */
  static createDataObject() {
    const dataObjectIcon = new DataObjectIcon()
    dataObjectIcon.stroke = BPMN_CONSTANTS_STROKES_DATA_OBJECT
    dataObjectIcon.fill = BPMN_CONSTANTS_FILLS_DATA_OBJECT
    return IconFactory.$dataObject || (IconFactory.$dataObject = dataObjectIcon)
  }

  /** @return {Icon} */
  static createDataObjectType(type) {
    switch (type) {
      case DataObjectType.INPUT:
        return (
          IconFactory.$dataObjectInputType ||
          (IconFactory.$dataObjectInputType = IconFactory.createEventType(EventType.LINK, false))
        )
      case DataObjectType.OUTPUT:
        return (
          IconFactory.$dataObjectOutputType ||
          (IconFactory.$dataObjectOutputType = IconFactory.createEventType(EventType.LINK, true))
        )
      case DataObjectType.NONE:
      default:
        return null
    }
  }

  /** @return {Icon} */
  static createAnnotation(left) {
    const BUILDER = IconFactory.BUILDER
    if (left) {
      if (!IconFactory.$leftAnnotation) {
        const icons = new List()
        BUILDER.stroke = Stroke.TRANSPARENT
        BUILDER.fill = BPMN_CONSTANTS_FILLS_ANNOTATION
        icons.add(BUILDER.createRectIcon(0))
        BUILDER.stroke = BPMN_CONSTANTS_STROKES_ANNOTATION
        BUILDER.moveTo(0.1, 0)
        BUILDER.lineTo(0, 0)
        BUILDER.lineTo(0, 1)
        BUILDER.lineTo(0.1, 1)
        icons.add(BUILDER.getPathIcon())
        IconFactory.$leftAnnotation = BUILDER.combineIcons(icons)
      }
      return IconFactory.$leftAnnotation
    }
    if (!IconFactory.$rightAnnotation) {
      const icons = new List()
      BUILDER.stroke = Stroke.TRANSPARENT
      BUILDER.fill = BPMN_CONSTANTS_FILLS_ANNOTATION
      icons.add(BUILDER.createRectIcon(0))
      BUILDER.stroke = BPMN_CONSTANTS_STROKES_ANNOTATION
      BUILDER.moveTo(0.9, 0)
      BUILDER.lineTo(1, 0)
      BUILDER.lineTo(1, 1)
      BUILDER.lineTo(0.9, 1)
      icons.add(BUILDER.getPathIcon())
      IconFactory.$rightAnnotation = BUILDER.combineIcons(icons)
    }
    return IconFactory.$rightAnnotation
  }

  /** @return {Icon} */
  static createDataStore() {
    const BUILDER = IconFactory.BUILDER
    if (!IconFactory.$dataStore) {
      const halfEllipseHeight = 0.125
      const ringOffset = 0.07

      const icons = new List()
      BUILDER.stroke = BPMN_CONSTANTS_STROKES_DATA_STORE
      BUILDER.fill = BPMN_CONSTANTS_FILLS_DATA_STORE

      BUILDER.moveTo(0, halfEllipseHeight)
      BUILDER.lineTo(0, 1 - halfEllipseHeight)
      BUILDER.cubicTo(0, 1, 1, 1, 1, 1 - halfEllipseHeight)
      BUILDER.lineTo(1, halfEllipseHeight)
      BUILDER.cubicTo(1, 0, 0, 0, 0, halfEllipseHeight)
      BUILDER.close()
      icons.add(BUILDER.getPathIcon())

      BUILDER.stroke = BPMN_CONSTANTS_STROKES_DATA_STORE
      let ellipseCenterY = halfEllipseHeight
      for (let i = 0; i < 3; i++) {
        BUILDER.moveTo(0, ellipseCenterY)
        BUILDER.cubicTo(
          0,
          ellipseCenterY + halfEllipseHeight,
          1,
          ellipseCenterY + halfEllipseHeight,
          1,
          ellipseCenterY
        )
        ellipseCenterY += ringOffset
      }
      icons.add(BUILDER.getPathIcon())
      IconFactory.$dataStore = BUILDER.combineIcons(icons)
    }
    return IconFactory.$dataStore
  }

  /** @return {Icon} */
  static createArrowIcon(type) {
    const BUILDER = IconFactory.BUILDER
    let result = IconFactory.ARROWS.get(type)
    if (!result) {
      BUILDER.stroke = BPMN_CONSTANTS_STROKES_ARROW
      switch (type) {
        case ArrowType.DEFAULT_SOURCE:
          BUILDER.moveTo(0.1, 0.1)
          BUILDER.lineTo(0.9, 0.9)
          result = BUILDER.getPathIcon()
          break
        case ArrowType.ASSOCIATION:
          BUILDER.moveTo(0.5, 0)
          BUILDER.lineTo(1, 0.5)
          BUILDER.lineTo(0.5, 1)
          result = BUILDER.getPathIcon()
          break
        case ArrowType.CONDITIONAL_SOURCE:
          BUILDER.moveTo(0, 0.5)
          BUILDER.lineTo(0.5, 0)
          BUILDER.lineTo(1, 0.5)
          BUILDER.lineTo(0.5, 1)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        case ArrowType.MESSAGE_SOURCE:
          result = BUILDER.createEllipseIcon()
          break
        case ArrowType.MESSAGE_TARGET:
          BUILDER.moveTo(0, 0)
          BUILDER.lineTo(1, 0.5)
          BUILDER.lineTo(0, 1)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
        default:
        case ArrowType.SEQUENCE_TARGET:
        case ArrowType.DEFAULT_TARGET:
        case ArrowType.CONDITIONAL_TARGET:
          BUILDER.fill = Fill.BLACK
          BUILDER.moveTo(0, 0)
          BUILDER.lineTo(1, 0.5)
          BUILDER.lineTo(0, 1)
          BUILDER.close()
          result = BUILDER.getPathIcon()
          break
      }
      IconFactory.ARROWS.set(type, result)
    }
    return result
  }

  /** @return {Icon} */
  static createLine(stroke, x1, y1, x2, y2) {
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = stroke
    BUILDER.moveTo(x1, y1)
    BUILDER.lineTo(x2, y2)
    return BUILDER.getPathIcon()
  }

  /** @return {Point[]} */
  static createPolygon(sideCount, radius, rotation) {
    const result = new Array(sideCount)
    const delta = Math.PI * 2.0 / sideCount

    for (let i = 0; i < sideCount; i++) {
      const angle = delta * i + rotation
      result[i] = new Point(radius * Math.sin(angle) + 0.5, -radius * Math.cos(angle) + 0.5)
    }
    return result
  }

  static get RADIUS_TO_CORNER_OFFSET() {
    return (
      IconFactory.$radiusToCorderOffset ||
      (IconFactory.$radiusToCorderOffset = Math.sqrt(1.5 - Math.sqrt(2)))
    )
  }

  static get TASK_ICONS() {
    return IconFactory.$taskIcons || (IconFactory.$taskIcons = new HashMap())
  }

  static get LOOP_TYPES() {
    return IconFactory.$loopTypes || (IconFactory.$loopTypes = new HashMap())
  }

  static get SUB_STATES() {
    return IconFactory.$subStates || (IconFactory.$subStates = new HashMap())
  }

  static get GATEWAY_TYPES() {
    return IconFactory.$gatewayTypes || (IconFactory.$gatewayTypes = new HashMap())
  }

  static get EVENT_CHARACTERISTICS() {
    return IconFactory.$eventCharacteristics || (IconFactory.$eventCharacteristics = new HashMap())
  }

  static get EVENT_TYPES() {
    return IconFactory.$eventTypes || (IconFactory.$eventTypes = new HashMap())
  }

  static get MESSAGES() {
    return IconFactory.$messages || (IconFactory.$messages = new HashMap())
  }

  static get PLUS_ICONS() {
    return IconFactory.$plusIcons || (IconFactory.$plusIcons = new HashMap())
  }

  static get PARTICIPANT_BANDS() {
    return IconFactory.$participantBands || (IconFactory.$participantBands = new HashMap())
  }

  static get CONVERSATIONS() {
    return IconFactory.$conversations || (IconFactory.$conversations = new HashMap())
  }

  static get ARROWS() {
    return IconFactory.$arrows || (IconFactory.$arrows = new HashMap())
  }

  static get ACTIVITY_ICONS() {
    return IconFactory.$activityIcons || (IconFactory.$activityIcons = new HashMap())
  }

  static get BUILDER() {
    return IconFactory.$builder || (IconFactory.$builder = new IconBuilder())
  }
}

/** @return {Icon} */
function createGear(radius, centerX, centerY, stroke, fill) {
  const BUILDER = IconFactory.BUILDER
  BUILDER.stroke = stroke
  BUILDER.fill = fill
  const smallR = 0.7 * radius

  let angle = -2 * Math.PI / 48
  BUILDER.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
  for (let i = 0; i < 8; i++) {
    BUILDER.arcTo(radius, centerX, centerY, angle, angle + 4 * Math.PI / 48)
    BUILDER.lineTo(
      centerX + smallR * Math.cos(angle + 5 * Math.PI / 48),
      centerY + smallR * Math.sin(angle + 5 * Math.PI / 48)
    )
    BUILDER.arcTo(smallR, centerX, centerY, angle + 5 * Math.PI / 48, angle + 11 * Math.PI / 48)
    BUILDER.lineTo(
      centerX + radius * Math.cos(angle + 12 * Math.PI / 48),
      centerY + radius * Math.sin(angle + 12 * Math.PI / 48)
    )
    angle += Math.PI / 4
  }

  BUILDER.close()
  return BUILDER.getPathIcon()
}

/** @return {Icon} */
function createPlusIcon(size, stroke, fill) {
  const BUILDER = IconFactory.BUILDER
  const plusData = new PlusData(size, stroke, fill)
  let result = IconFactory.PLUS_ICONS.get(plusData)
  if (!result) {
    BUILDER.stroke = stroke
    BUILDER.fill = fill
    const d = 0.1 * size
    const dOff = Math.sqrt(0.25 * size * size - d * d)
    BUILDER.moveTo(0.5 - dOff, 0.5 - d)
    BUILDER.lineTo(0.5 - d, 0.5 - d)
    BUILDER.lineTo(0.5 - d, 0.5 - dOff)
    BUILDER.lineTo(0.5 + d, 0.5 - dOff)
    BUILDER.lineTo(0.5 + d, 0.5 - d)
    BUILDER.lineTo(0.5 + dOff, 0.5 - d)
    BUILDER.lineTo(0.5 + dOff, 0.5 + d)
    BUILDER.lineTo(0.5 + d, 0.5 + d)
    BUILDER.lineTo(0.5 + d, 0.5 + dOff)
    BUILDER.lineTo(0.5 - d, 0.5 + dOff)
    BUILDER.lineTo(0.5 - d, 0.5 + d)
    BUILDER.lineTo(0.5 - dOff, 0.5 + d)
    BUILDER.close()
    result = BUILDER.getPathIcon()
    IconFactory.PLUS_ICONS.set(plusData, result)
  }
  return result
}

/**
 * An augmented {@link IList} which keeps a modification counter and provides the height of
 * the participants that are stored within.
 */
class ParticipantList extends BaseClass(IList) {
  constructor() {
    super()
    this.innerList = new List()
    this.$modCount = 0
  }

  /** @type {number} */
  get modCount() {
    return this.$modCount + this.getParticipantModCount()
  }

  /** @return {number} */
  getHeight() {
    let height = 0
    this.innerList.forEach(participant => {
      height += participant.getSize()
    })
    return height
  }

  /**
   * @return {number}
   */
  getParticipantModCount() {
    let participantCount = 0
    this.innerList.forEach(participant => {
      participantCount += participant.modCount
    })
    return participantCount
  }

  /** @return {IEnumerator.<Participant>} */
  getEnumerator() {
    return this.innerList.getEnumerator()
  }

  add(item) {
    this.$modCount++
    this.innerList.add(item)
  }

  clear() {
    this.$modCount += this.getParticipantModCount() + 1
    this.innerList.clear()
  }

  /** @return {boolean} */
  includes(item) {
    return this.innerList.includes(item)
  }

  copyTo(array, arrayIndex) {
    this.innerList.copyTo(array, arrayIndex)
  }

  /** @return {boolean} */
  remove(item) {
    this.$modCount += item.modCount + 1
    return this.innerList.remove(item)
  }

  /** @type {number} */
  get size() {
    return this.innerList.size
  }

  /** @type {boolean} */
  get isReadOnly() {
    return this.innerList.isReadOnly
  }

  /** @return {number} */
  indexOf(item) {
    return this.innerList.indexOf(item)
  }

  insert(index, item) {
    this.$modCount++
    this.innerList.insert(index, item)
  }

  removeAt(index) {
    this.$modCount += this.innerList.getElementAt(index).modCount + 1
    this.innerList.removeAt(index)
  }

  /** @return {Participant} */
  get(index) {
    return this.innerList.get(index)
  }

  set(index, value) {
    this.innerList.set(index, value)
  }
}

/**
 * An {@link INodeStyle} implementation representing an Choreography according to the BPMN.
 */
export class ChoreographyNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this.$loopCharacteristic = LoopCharacteristic.NONE
    this.$subState = SubState.NONE
    this.$topParticipants = new ParticipantList()
    this.$bottomParticipants = new ParticipantList()
    this.$initiatingMessage = false
    this.$responseMessage = false
    this.$initiatingAtTop = true
    this.$insets = new Insets(5)

    this.outlineIcon = null
    this.loopIcon = null

    this.type = ChoreographyType.TASK
    this.minimumSize = new Size(30, 30)
  }

  /**
   * Gets the choreography type of this style.
   * @type {ChoreographyType}
   */
  get type() {
    return this.$type
  }

  /**
   * Sets the choreography type of this style.
   * @type {ChoreographyType}
   */
  set type(value) {
    if (this.$type !== value || this.outlineIcon === null) {
      this.modCount++
      this.$type = value
      this.outlineIcon = IconFactory.createChoreography(this.$type)
      if (this.$type === ChoreographyType.CALL) {
        this.outlineIcon = new PlacedIcon(
          this.outlineIcon,
          BPMN_CONSTANTS_PLACEMENTS_THICK_LINE,
          Size.EMPTY
        )
      }
    }
  }

  /**
   * Gets the loop characteristic of this style.
   * @type {LoopCharacteristic}
   */
  get loopCharacteristic() {
    return this.$loopCharacteristic
  }

  /**
   * Sets the loop characteristic of this style.
   * @type {LoopCharacteristic}
   */
  set loopCharacteristic(value) {
    if (this.$loopCharacteristic !== value) {
      this.modCount++
      this.$loopCharacteristic = value
      this.loopIcon = IconFactory.createLoopCharacteristic(value)
    }
  }

  /**
   * Gets the sub state of this style.
   * @type {SubState}
   */
  get subState() {
    return this.$subState
  }

  /**
   * Sets the sub state of this style.
   * @type {SubState}
   */
  set subState(value) {
    if (this.$subState !== value) {
      this.modCount++
      this.$subState = value
    }
  }

  /**
   * Gets whether the initiating message icon is displayed.
   * @type {boolean}
   */
  get initiatingMessage() {
    return this.$initiatingMessage
  }

  /**
   * Sets whether the initiating message icon is displayed.
   * @type {boolean}
   */
  set initiatingMessage(value) {
    if (this.$initiatingMessage !== value) {
      this.modCount++
      this.$initiatingMessage = value
    }
  }

  /**
   * Gets whether the response message icon is displayed.
   * @type {boolean}
   */
  get responseMessage() {
    return this.$responseMessage
  }

  /**
   * Sets whether the response message icon is displayed.
   * @type {boolean}
   */
  set responseMessage(value) {
    if (this.$responseMessage !== value) {
      this.modCount++
      this.$responseMessage = value
    }
  }

  /**
   * Gets whether the initiating message icon or the response message icon is displayed on top of the node while the
   * other one is at the bottom side. Whether the initiating and response message icons are displayed at all depends
   * on {@link ChoreographyNodeStyle#initiatingMessage} and {@link ChoreographyNodeStyle#responseMessage}. This
   * property only determines which one is displayed on which side of the node.
   * @type {boolean}
   */
  get initiatingAtTop() {
    return this.$initiatingAtTop
  }

  /**
   * Sets whether the initiating message icon or the response message icon is displayed on top of the node while the
   * other one is at the bottom side. Whether the initiating and response message icons are displayed at all depends
   * on {@link ChoreographyNodeStyle#initiatingMessage} and {@link ChoreographyNodeStyle#responseMessage}. This
   * property only determines which one is displayed on which side of the node.
   * @type {boolean}
   */
  set initiatingAtTop(value) {
    if (this.$initiatingAtTop !== value) {
      this.$initiatingAtTop = value
      if (this.initiatingMessage || this.responseMessage) {
        this.modCount++
      }
    }
  }

  /**
   * Gets the list of {@link Participant}s at the top of the node, ordered from top to bottom.
   * @type {IList.<Participant>}
   */
  get topParticipants() {
    return this.$topParticipants
  }

  /**
   * Gets the list of {@link Participant}s at the bottom of the node, ordered from bottom to top.
   * @type {IList.<Participant>}
   */
  get bottomParticipants() {
    return this.$bottomParticipants
  }

  /**
   * Gets the insets for the task name band of the given item.
   * These insets are extended by the sizes of the participant bands on top and bottom side
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link INodeStyleRenderer#getContext context lookup}.
   * @return An insets object that describes the insets of the task name band.
   * @see {@link INodeInsetsProvider}
   * @type {Insets}
   */
  get insets() {
    return this.$insets
  }

  /**
   * Sets the insets for the task name band of the given item.
   * These insets are extended by the sizes of the participant bands on top and bottom side
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link INodeStyleRenderer#getContext context lookup}.
   * @see {@link INodeInsetsProvider}
   * @type {Insets}
   */
  set insets(value) {
    this.$insets = value
  }

  /**
   * @type {boolean}
   */
  get showTopMessage() {
    return (
      (this.initiatingMessage && this.initiatingAtTop) ||
      (this.responseMessage && !this.initiatingAtTop)
    )
  }

  /**
   * @type {boolean}
   */
  get showBottomMessage() {
    return (
      (this.initiatingMessage && !this.initiatingAtTop) ||
      (this.responseMessage && this.initiatingAtTop)
    )
  }

  /**
   * Callback that creates the visual.
   * @param {.IRenderContext} renderContext The render context.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {.Visual} The visual.
   * @see {@link NodeStyleBase#updateVisual}
   */
  createVisual(renderContext, node) {
    const bounds = node.layout.toRect()
    const container = new SvgVisualGroup()

    // task band
    const taskBandContainer = new SvgVisualGroup()
    const bandIcon = this.createTaskBandIcon(node)
    bandIcon.setBounds(this.getRelativeTaskNameBandBounds(node))
    taskBandContainer.add(bandIcon.createVisual(renderContext))
    taskBandContainer['render-data-cache'] = bandIcon
    container.children.add(taskBandContainer)

    const tpi = new List()
    // top participants
    let topOffset = 0
    let first = true
    this.$topParticipants.forEach(participant => {
      const participantIcon = this.createParticipantIcon(participant, true, first)
      tpi.add(participantIcon)
      const height = participant.getSize()
      participantIcon.setBounds(new Rect(0, topOffset, bounds.width, height))
      container.add(participantIcon.createVisual(renderContext))
      topOffset += height
      first = false
    })

    const bpi = new List()
    // bottom participants
    let bottomOffset = bounds.height
    first = true
    this.$bottomParticipants.forEach(participant => {
      const participantIcon = this.createParticipantIcon(participant, false, first)
      bpi.add(participantIcon)
      const height = participant.getSize()
      bottomOffset -= height
      participantIcon.setBounds(new Rect(0, bottomOffset, bounds.width, height))
      container.add(participantIcon.createVisual(renderContext))
      first = false
    })

    // outline
    this.outlineIcon.setBounds(new Rect(Point.ORIGIN, bounds.size))
    container.add(this.outlineIcon.createVisual(renderContext))

    // messages
    if (this.initiatingMessage) {
      const initiatingMessageIcon = this.initiatingAtTop
        ? ChoreographyNodeStyle.TOP_INITIATING_MESSAGE_ICON
        : ChoreographyNodeStyle.BOTTOM_INITIATING_MESSAGE_ICON
      initiatingMessageIcon.setBounds(new Rect(0, 0, bounds.width, bounds.height))
      container.add(initiatingMessageIcon.createVisual(renderContext))
    }
    if (this.responseMessage) {
      const responseMessageIcon = this.initiatingAtTop
        ? ChoreographyNodeStyle.BOTTOM_RESPONSE_MESSAGE_ICON
        : ChoreographyNodeStyle.TOP_RESPONSE_MESSAGE_ICON
      responseMessageIcon.setBounds(new Rect(0, 0, bounds.width, bounds.height))
      container.add(responseMessageIcon.createVisual(renderContext))
    }

    const transform = new Matrix()
    transform.translate(node.layout.topLeft)
    container.transform = transform

    container['render-data-cache'] = {
      bounds: bounds,
      modCount: this.modCount + this.$topParticipants.modCount + this.$bottomParticipants.modCount,
      topParticipantIcons: tpi,
      bottomParticipantIcons: bpi
    }
    return container
  }

  /**
   * Callback that updates the visual previously created by {@link NodeStyleBase#createVisual}.
   * @param {.IRenderContext} renderContext The render context.
   * @param {.Visual} oldVisual The visual that should be updated.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {.Visual} The visual.
   * @see {@link NodeStyleBase#createVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    const cache = container !== null ? container['render-data-cache'] : null
    const currentModCount =
      this.modCount + this.$topParticipants.modCount + this.$bottomParticipants.modCount
    if (cache === null || cache.modCount !== currentModCount) {
      return this.createVisual(renderContext, node)
    }
    const newBounds = node.layout.toRect()

    if (cache.bounds.width !== newBounds.width || cache.bounds.height !== newBounds.height) {
      // update icon bounds
      let childIndex = 0

      // task band
      const taskBandContainer = container.children.elementAt(childIndex++)
      if (taskBandContainer instanceof SvgVisualGroup) {
        const taskBandIcon = taskBandContainer['render-data-cache']
        const taskBandBounds = this.getRelativeTaskNameBandBounds(node)

        if (taskBandIcon && taskBandContainer.children.size === 1) {
          taskBandIcon.setBounds(taskBandBounds)
          updateChildVisual(taskBandContainer, 0, taskBandIcon, renderContext)
        }
      }

      // top participants
      let topOffset = 0
      for (let i = 0; i < this.$topParticipants.size; i++) {
        const participant = this.$topParticipants.elementAt(i)
        const participantIcon = cache.topParticipantIcons.elementAt(i)
        const height = participant.getSize()
        participantIcon.setBounds(new Rect(0, topOffset, newBounds.width, height))
        updateChildVisual(container, childIndex++, participantIcon, renderContext)
        topOffset += height
      }

      // bottom participants
      let bottomOffset = newBounds.height
      for (let i = 0; i < this.$bottomParticipants.size; i++) {
        const participant = this.$bottomParticipants.elementAt(i)
        const participantIcon = cache.bottomParticipantIcons.elementAt(i)
        const height = participant.getSize()
        bottomOffset -= height
        participantIcon.setBounds(new Rect(0, bottomOffset, newBounds.width, height))
        updateChildVisual(container, childIndex++, participantIcon, renderContext)
      }

      // outline
      this.outlineIcon.setBounds(new Rect(Point.ORIGIN, newBounds.size))
      updateChildVisual(container, childIndex++, this.outlineIcon, renderContext)

      // messages
      if (this.initiatingMessage) {
        const initiatingMessageIcon = this.initiatingAtTop
          ? ChoreographyNodeStyle.TOP_INITIATING_MESSAGE_ICON
          : ChoreographyNodeStyle.BOTTOM_INITIATING_MESSAGE_ICON
        initiatingMessageIcon.setBounds(new Rect(0, 0, newBounds.width, newBounds.height))
        updateChildVisual(container, childIndex++, initiatingMessageIcon, renderContext)
      }
      if (this.responseMessage) {
        const responseMessageIcon = this.initiatingAtTop
          ? ChoreographyNodeStyle.BOTTOM_RESPONSE_MESSAGE_ICON
          : ChoreographyNodeStyle.TOP_RESPONSE_MESSAGE_ICON
        responseMessageIcon.setBounds(new Rect(0, 0, newBounds.width, newBounds.height))
        updateChildVisual(container, childIndex++, responseMessageIcon, renderContext)
      }
    }

    const transform = new Matrix()
    transform.translate(node.layout.topLeft)
    container.transform = transform

    container['render-data-cache'] = {
      bounds: newBounds,
      modCount: currentModCount,
      topParticipantIcons: cache.topParticipantIcons,
      bottomParticipantIcons: cache.bottomParticipantIcons
    }
    return container
  }

  /**
   * Creates the {@link Icon} which visualizes the task band at the center of a {@link ChoreographyNodeStyle}
   * @return {Icon}
   */
  createTaskBandIcon(node) {
    /** @type {Icon} */
    let collapseIcon = null
    if (this.subState !== SubState.NONE) {
      collapseIcon =
        this.subState === SubState.DYNAMIC
          ? IconFactory.createDynamicSubState(node)
          : IconFactory.createStaticSubState(this.subState)
    }

    /** @type {Icon} */
    let markerIcon = null
    if (this.loopIcon !== null && collapseIcon !== null) {
      markerIcon = IconFactory.createLineUpIcon(
        List.fromArray([this.loopIcon, collapseIcon]),
        BPMN_CONSTANTS_SIZES_MARKER,
        5
      )
    } else if (this.loopIcon !== null) {
      markerIcon = this.loopIcon
    } else if (collapseIcon !== null) {
      markerIcon = collapseIcon
    }
    if (markerIcon !== null) {
      const placedMarkers = IconFactory.createPlacedIcon(
        markerIcon,
        BPMN_CONSTANTS_PLACEMENTS_CHOROGRAPHY_MARKER,
        BPMN_CONSTANTS_SIZES_MARKER
      )
      return IconFactory.createCombinedIcon(
        new List(List.fromArray([ChoreographyNodeStyle.TASK_BAND_BACKGROUND_ICON, placedMarkers]))
      )
    }
    return ChoreographyNodeStyle.TASK_BAND_BACKGROUND_ICON
  }

  /**
   * Creates the {@link Icon} which visualizes a participant band at the top or bottom of a
   * {@link ChoreographyNodeStyle}
   * @return {Icon}
   */
  createParticipantIcon(participant, top, isFirst) {
    const isInitializing = isFirst && top ^ !this.initiatingAtTop

    let icon = IconFactory.createChoreographyParticipant(
      isInitializing,
      top && isFirst ? BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS : 0,
      !top && isFirst ? BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS : 0
    )
    if (participant.multiInstance) {
      icon = IconFactory.createCombinedIcon(
        List.fromArray([icon, ChoreographyNodeStyle.MULTI_INSTANCE_ICON])
      )
    }
    return icon
  }

  /**
   * Returns the participant at the specified location.
   * @param {INode} node The node whose bounds shall be used.
   * @param {Point} location The location of the participant.
   * @return {Participant}
   */
  getParticipant(node, location) {
    if (!node.layout.contains(location)) {
      return null
    }

    let relativeY = location.subtract(node.layout.topLeft).y
    if (relativeY < this.topParticipants.getHeight()) {
      for (let i = 0; i < this.topParticipants.size; i++) {
        const participant = this.topParticipants.get(i)
        const size = participant.getSize()
        if (relativeY < size) {
          return participant
        }
        relativeY -= size
      }
    } else if (node.layout.height - this.bottomParticipants.getHeight() < relativeY) {
      let yFromBottom = node.layout.height - relativeY
      for (let i = 0; i < this.bottomParticipants.size; i++) {
        const participant = this.bottomParticipants.get(i)
        const size = participant.getSize()
        if (yFromBottom < size) {
          return participant
        }
        yFromBottom -= size
      }
    }

    return null
  }

  /**
   * Returns the bounds of the specified participant band.
   * @param {INode} owner The node whose bounds shall be used.
   * @param {number} index The index of the participant in its list.
   * @param {boolean} top Whether the top of bottom list of participants shall be used.
   * @return {Rect}
   */
  getParticipantBandBounds(owner, index, top) {
    const width = owner.layout.width
    if (top && index <= this.$topParticipants.size) {
      let yOffset = 0
      for (let i = 0; i < this.$topParticipants.size; i++) {
        const topParticipant = this.$topParticipants.get(i)
        if (index === i) {
          return new Rect(owner.layout.x, owner.layout.y + yOffset, width, topParticipant.getSize())
        }
        yOffset += topParticipant.getSize()
      }
    } else if (!top && index < this.$bottomParticipants.size) {
      let yOffset = owner.layout.height
      for (let i = 0; i < this.$bottomParticipants.size; i++) {
        const bottomParticipant = this.$bottomParticipants.get(i)
        yOffset -= bottomParticipant.getSize()
        if (index === i) {
          return new Rect(
            owner.layout.x,
            owner.layout.y + yOffset,
            width,
            bottomParticipant.getSize()
          )
        }
      }
    }
    return this.getTaskNameBandBounds(owner)
  }

  /**
   * Returns the bounds of the task name band.
   * @param {INode} owner The node whose bounds shall be used.
   * @return {Rect}
   */
  getTaskNameBandBounds(owner) {
    return this.getRelativeTaskNameBandBounds(owner).getTranslated(owner.layout.topLeft)
  }

  /**
   * Returns the bounds of the task name band for a node at the origin location (0,0).
   * @return {Rect}
   */
  getRelativeTaskNameBandBounds(owner) {
    const topHeight = this.$topParticipants.getHeight()
    return new Rect(
      0,
      topHeight,
      owner.layout.width,
      Math.max(0, owner.layout.height - topHeight - this.$bottomParticipants.getHeight())
    )
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields <code>null</code> to indicate that
   * the {@link INode#layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase#isInside}
   * and {@link NodeStyleBase#getIntersection} since the default implementations delegate to it.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {GeneralPath} The outline of the visual representation or <code>null</code>.
   */
  getOutline(node) {
    ChoreographyNodeStyle.SHAPE_NODE_STYLE.renderer.getShapeGeometry(
      node,
      ChoreographyNodeStyle.SHAPE_NODE_STYLE
    )
    const path = ChoreographyNodeStyle.SHAPE_NODE_STYLE.renderer.getOutline()

    if (this.showTopMessage) {
      const topBoxSize = BPMN_CONSTANTS_SIZES_MESSAGE
      const cx = node.layout.center.x
      const topBoxMaxY = node.layout.y - ChoreographyNodeStyle.MESSAGE_DISTANCE
      path.moveTo(cx - topBoxSize.width * 0.5, node.layout.y)
      path.lineTo(cx - topBoxSize.width * 0.5, topBoxMaxY)
      path.lineTo(cx - topBoxSize.width * 0.5, topBoxMaxY - topBoxSize.height)
      path.lineTo(cx + topBoxSize.width * 0.5, topBoxMaxY - topBoxSize.height)
      path.lineTo(cx + topBoxSize.width * 0.5, topBoxMaxY)
      path.lineTo(cx - topBoxSize.width * 0.5, topBoxMaxY)
      path.close()
    }

    if (this.showBottomMessage) {
      const bottomBoxSize = BPMN_CONSTANTS_SIZES_MESSAGE
      const cx = node.layout.center.x
      const bottomBoxY = node.layout.maxY + ChoreographyNodeStyle.MESSAGE_DISTANCE
      path.moveTo(cx - bottomBoxSize.width * 0.5, node.layout.maxY)
      path.lineTo(cx - bottomBoxSize.width * 0.5, bottomBoxY)
      path.lineTo(cx - bottomBoxSize.width * 0.5, bottomBoxY + bottomBoxSize.height)
      path.lineTo(cx + bottomBoxSize.width * 0.5, bottomBoxY + bottomBoxSize.height)
      path.lineTo(cx + bottomBoxSize.width * 0.5, bottomBoxY)
      path.lineTo(cx - bottomBoxSize.width * 0.5, bottomBoxY)
      path.close()
    }

    return path
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * This method is called in response to a {@link IHitTestable#isHit}
   * call to the instance that has been queried from the {@link NodeStyleBase#renderer}.
   * This implementation uses the {@link NodeStyleBase#getOutline outline} to determine
   * whether the node has been hit.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {Point} p The point to test.
   * @param {.ICanvasContext} canvasContext The canvas context.
   * @return {boolean} whether or not the specified node representation is hit.
   */
  isHit(canvasContext, p, node) {
    if (
      ChoreographyNodeStyle.SHAPE_NODE_STYLE.renderer
        .getHitTestable(node, ChoreographyNodeStyle.SHAPE_NODE_STYLE)
        .isHit(canvasContext, p)
    ) {
      return true
    }
    if (this.showTopMessage) {
      const cx = node.layout.center.x
      const topBoxSize = BPMN_CONSTANTS_SIZES_MESSAGE
      const messageRect = new Rect(
        new Point(
          cx - topBoxSize.width * 0.5,
          node.layout.y - ChoreographyNodeStyle.MESSAGE_DISTANCE - topBoxSize.height
        ),
        topBoxSize
      )
      if (messageRect.containsWithEps(p, canvasContext.hitTestRadius)) {
        return true
      }
      if (
        Math.abs(p.x - cx) < canvasContext.hitTestRadius &&
        node.layout.y - ChoreographyNodeStyle.MESSAGE_DISTANCE - canvasContext.hitTestRadius <
          p.y &&
        p.y < node.layout.y + canvasContext.hitTestRadius
      ) {
        return true
      }
    }

    if (this.showBottomMessage) {
      const bottomBoxSize = BPMN_CONSTANTS_SIZES_MESSAGE
      const cx = node.layout.center.x
      const messageRect = new Rect(
        new Point(
          cx - bottomBoxSize.width * 0.5,
          node.layout.maxY + ChoreographyNodeStyle.MESSAGE_DISTANCE
        ),
        bottomBoxSize
      )
      if (messageRect.containsWithEps(p, canvasContext.hitTestRadius)) {
        return true
      }
      if (
        Math.abs(p.x - cx) < canvasContext.hitTestRadius &&
        node.layout.maxY - canvasContext.hitTestRadius < p.y &&
        p.y <
          node.layout.maxY + ChoreographyNodeStyle.MESSAGE_DISTANCE + canvasContext.hitTestRadius
      ) {
        return true
      }
    }
    return false
  }

  /**
   * Gets the bounds of the visual for the node in the given context.
   * This method is called in response to a {@link .IBoundsProvider#getBounds}
   * call to the instance that has been queried from the {@link NodeStyleBase#renderer}.
   * This implementation simply yields the {@link INode#layout}.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {.ICanvasContext} canvasContext The canvas context.
   * @return {Rect} The visual bounds of the visual representation.
   */
  getBounds(canvasContext, node) {
    let bounds = node.layout.toRect()
    if (this.showTopMessage) {
      bounds = bounds.getEnlarged(
        new Insets(
          0,
          ChoreographyNodeStyle.MESSAGE_DISTANCE + BPMN_CONSTANTS_SIZES_MESSAGE.height,
          0,
          0
        )
      )
    }
    if (this.showBottomMessage) {
      bounds = bounds.getEnlarged(
        new Insets(
          0,
          0,
          0,
          ChoreographyNodeStyle.MESSAGE_DISTANCE + BPMN_CONSTANTS_SIZES_MESSAGE.height
        )
      )
    }

    return bounds
  }

  /**
   * Performs the {@link ILookup#lookup} operation for
   * the {@link INodeStyleRenderer#getContext}
   * that has been queried from the {@link NodeStyleBase#renderer}.
   * @param {INode} node The node to use for the context lookup.
   * @param {Class} type The type to query.
   * @return {Object} An implementation of the <code>type</code> or <code>null</code>.
   */
  lookup(node, type) {
    if (type === INodeSizeConstraintProvider.$class) {
      const minWidth = Math.max(0, this.minimumSize.width)
      const minHeight =
        Math.max(0, this.minimumSize.height) +
        this.$topParticipants.getHeight() +
        this.$bottomParticipants.getHeight()
      const maxSize = new Size(Number.MAX_VALUE, Number.MAX_VALUE)
      return new NodeSizeConstraintProvider(new Size(minWidth, minHeight), maxSize)
    } else if (type === INodeInsetsProvider.$class) {
      return new ChoreographyInsetsProvider(this)
    } else if (type === IEditLabelHelper.$class) {
      return new ChoreographyEditLabelHelper(node)
    }
    return super.lookup(node, type)
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    const clone = new ChoreographyNodeStyle()
    clone.initiatingAtTop = this.initiatingAtTop
    clone.initiatingMessage = this.initiatingMessage
    clone.insets = this.insets
    clone.loopCharacteristic = this.loopCharacteristic
    clone.minimumSize = this.minimumSize
    clone.responseMessage = this.responseMessage
    clone.subState = this.subState
    clone.type = this.type

    this.topParticipants.forEach(participant => {
      clone.topParticipants.add(participant.clone())
    })
    this.bottomParticipants.forEach(participant => {
      clone.bottomParticipants.add(participant.clone())
    })
    return clone
  }

  static get lineIcon() {
    return (
      ChoreographyNodeStyle.$lineIcon ||
      (ChoreographyNodeStyle.$lineIcon = IconFactory.createLine(
        BPMN_CONSTANTS_STROKES_CHOREOGRAPHY_MESSAGE_LINK,
        0.5,
        0,
        0.5,
        1
      ))
    )
  }

  static get initiatingMessageIcon() {
    return (
      ChoreographyNodeStyle.$initiatingMessageIcon ||
      (ChoreographyNodeStyle.$initiatingMessageIcon = IconFactory.createMessage(
        BPMN_CONSTANTS_STROKES_MESSAGE,
        BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_INITIALIZING_PARTICIPANT
      ))
    )
  }

  static get responseMessageIcon() {
    return (
      ChoreographyNodeStyle.$responseMessageIcon ||
      (ChoreographyNodeStyle.$responseMessageIcon = IconFactory.createMessage(
        BPMN_CONSTANTS_STROKES_MESSAGE,
        BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_RECEIVING_PARTICIPANT
      ))
    )
  }

  static get SHAPE_NODE_STYLE() {
    if (!ChoreographyNodeStyle.$shapeNodeStyle) {
      const shapeNodeStyleRenderer = new ShapeNodeStyleRenderer()
      shapeNodeStyleRenderer.roundRectArcRadius = BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS
      ChoreographyNodeStyle.$shapeNodeStyle = new ShapeNodeStyle({
        renderer: shapeNodeStyleRenderer,
        shape: ShapeNodeShape.ROUND_RECTANGLE,
        stroke: Stroke.BLACK,
        fill: null
      })
    }
    return ChoreographyNodeStyle.$shapeNodeStyle
  }

  static get TOP_INITIATING_MESSAGE_ICON() {
    if (!ChoreographyNodeStyle.$topInitiatingMessageIcon) {
      const topInitiatingMessageIcons = new List()
      topInitiatingMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.lineIcon,
          ExteriorLabelModel.NORTH,
          new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
        )
      )
      topInitiatingMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.initiatingMessageIcon,
          BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_TOP_MESSAGE,
          BPMN_CONSTANTS_SIZES_MESSAGE
        )
      )
      ChoreographyNodeStyle.$topInitiatingMessageIcon = IconFactory.createCombinedIcon(
        topInitiatingMessageIcons
      )
    }
    return ChoreographyNodeStyle.$topInitiatingMessageIcon
  }

  static get BOTTOM_RESPONSE_MESSAGE_ICON() {
    if (!ChoreographyNodeStyle.$bottomResponseMessageIcon) {
      const bottomResponseMessageIcons = new List()
      bottomResponseMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.lineIcon,
          ExteriorLabelModel.SOUTH,
          new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
        )
      )
      bottomResponseMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.responseMessageIcon,
          BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_BOTTOM_MESSAGE,
          BPMN_CONSTANTS_SIZES_MESSAGE
        )
      )
      ChoreographyNodeStyle.$bottomResponseMessageIcon = IconFactory.createCombinedIcon(
        bottomResponseMessageIcons
      )
    }
    return ChoreographyNodeStyle.$bottomResponseMessageIcon
  }

  static get BOTTOM_INITIATING_MESSAGE_ICON() {
    if (!ChoreographyNodeStyle.$bottomInitiatingMessageIcon) {
      const bottomInitiatingMessageIcons = new List()
      bottomInitiatingMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.lineIcon,
          ExteriorLabelModel.SOUTH,
          new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
        )
      )
      bottomInitiatingMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.initiatingMessageIcon,
          BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_BOTTOM_MESSAGE,
          BPMN_CONSTANTS_SIZES_MESSAGE
        )
      )
      ChoreographyNodeStyle.$bottomInitiatingMessageIcon = IconFactory.createCombinedIcon(
        bottomInitiatingMessageIcons
      )
    }
    return ChoreographyNodeStyle.$bottomInitiatingMessageIcon
  }

  static get TOP_RESPONSE_MESSAGE_ICON() {
    if (!ChoreographyNodeStyle.$topResponseMessageIcon) {
      const topResponseMessageIcons = new List()
      topResponseMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.lineIcon,
          ExteriorLabelModel.NORTH,
          new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
        )
      )
      topResponseMessageIcons.add(
        IconFactory.createPlacedIcon(
          ChoreographyNodeStyle.responseMessageIcon,
          BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_TOP_MESSAGE,
          BPMN_CONSTANTS_SIZES_MESSAGE
        )
      )
      ChoreographyNodeStyle.$topResponseMessageIcon = IconFactory.createCombinedIcon(
        topResponseMessageIcons
      )
    }
    return ChoreographyNodeStyle.$topResponseMessageIcon
  }

  static get TASK_BAND_BACKGROUND_ICON() {
    return (
      ChoreographyNodeStyle.$taskBandBackgroundIcon ||
      (ChoreographyNodeStyle.$taskBandBackgroundIcon = IconFactory.createChoreographyTaskBand())
    )
  }

  static get MULTI_INSTANCE_ICON() {
    return (
      ChoreographyNodeStyle.$multiInstanceIcon ||
      (ChoreographyNodeStyle.$multiInstanceIcon = IconFactory.createPlacedIcon(
        IconFactory.createLoopCharacteristic(LoopCharacteristic.PARALLEL),
        BPMN_CONSTANTS_PLACEMENTS_CHOROGRAPHY_MARKER,
        BPMN_CONSTANTS_SIZES_MARKER
      ))
    )
  }

  static get MESSAGE_DISTANCE() {
    return 15
  }
}

/**
 * Uses the style insets extended by the size of the participant bands.
 */
class ChoreographyInsetsProvider extends BaseClass(INodeInsetsProvider) {
  constructor(style) {
    super()
    this.style = style
  }

  /** @return {Insets} */
  getInsets(item) {
    const topInsets = this.style.topParticipants.getHeight()
    let bottomInsets = this.style.bottomParticipants.getHeight()

    bottomInsets +=
      this.style.loopCharacteristic !== LoopCharacteristic.NONE ||
      this.style.subState !== SubState.NONE
        ? BPMN_CONSTANTS_SIZES_MARKER.height +
          BPMN_CONSTANTS_PLACEMENTS_CHOROGRAPHY_MARKER.model.insets.bottom
        : 0

    return new Insets(
      this.style.insets.left,
      this.style.insets.top + topInsets,
      this.style.insets.right,
      this.style.insets.bottom + bottomInsets
    )
  }
}

/**
 * A label helper which provides the next free location and the according style for a label added to a node with
 * {@link ChoreographyNodeStyle}. Message labels will be visualized using {@link ChoreographyMessageLabelStyle}.
 */
class ChoreographyEditLabelHelper extends EditLabelHelper {
  constructor(node) {
    super()
    this.node = node
  }

  getLabelParameter(inputModeContext) {
    const parameter = ChoreographyLabelModel.INSTANCE.findNextParameter(this.node)
    return parameter || ExteriorLabelModel.WEST
  }

  getLabelStyle(inputModeContext, owner) {
    const parameter = ChoreographyLabelModel.INSTANCE.findNextParameter(this.node)
    if (
      parameter === ChoreographyLabelModel.NORTH_MESSAGE ||
      parameter === ChoreographyLabelModel.SOUTH_MESSAGE
    ) {
      return new ChoreographyMessageLabelStyle()
    }
    return inputModeContext.canvasComponent.graph.nodeDefaults.labels.style
  }

  onLabelEditing(event) {
    // override default behavior
    // super.onLabelEditing would choose the first label if present but we want to edit the selected label
  }
}

function updateChildVisual(container, index, icon, context) {
  const oldPathVisual = container.children.elementAt(index)
  let newPathVisual = icon.updateVisual(context, oldPathVisual)
  if (!oldPathVisual.equals(newPathVisual)) {
    newPathVisual = newPathVisual !== null ? newPathVisual : new SvgVisualGroup()
    container.children.remove(oldPathVisual)
    container.children.insert(index, newPathVisual)
  }
}

/**
 * A label style for message labels of nodes using a {@link ChoreographyNodeStyle}.
 * To place labels with this style, {@link ChoreographyLabelModel#NORTH_MESSAGE}
 * or {@link ChoreographyLabelModel#SOUTH_MESSAGE} are recommended.
 */
class ChoreographyMessageLabelStyle extends BaseClass(ILabelStyle) {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    const connectedIconLabelStyle = new ConnectedIconLabelStyle()
    connectedIconLabelStyle.iconSize = BPMN_CONSTANTS_SIZES_MESSAGE
    connectedIconLabelStyle.iconStyle = ChoreographyMessageLabelStyle.INITIATING_MESSAGE_STYLE
    connectedIconLabelStyle.textStyle = ChoreographyMessageLabelStyle.TEXT_STYLE
    connectedIconLabelStyle.connectorStyle = ChoreographyMessageLabelStyle.CONNECTOR_STYLE
    connectedIconLabelStyle.labelConnectorLocation = FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
    connectedIconLabelStyle.nodeConnectorLocation = FreeNodePortLocationModel.NODE_TOP_ANCHORED
    this.$delegateStyle = connectedIconLabelStyle

    this.textPlacement = ChoreographyMessageLabelStyle.DEFAULT_TEXT_PLACEMENT
  }

  /**
   * Gets where the text is placed relative to the message icon.
   * The label model parameter has to support {@link INode}s.
   * @type {ILabelModelParameter}
   */
  get textPlacement() {
    return this.delegateStyle !== null ? this.delegateStyle.textPlacement : null
  }

  /**
   * Sets where the text is placed relative to the message icon.
   * The label model parameter has to support {@link INode}s.
   * @type {ILabelModelParameter}
   */
  set textPlacement(value) {
    if (this.delegateStyle !== null) {
      this.delegateStyle.textPlacement = value
    }
  }

  /**
   * @type {ConnectedIconLabelStyle}
   */
  get delegateStyle() {
    return this.$delegateStyle
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    return new ChoreographyMessageLabelStyle()
  }

  /**
   * Gets the renderer implementation that can be queried for implementations
   * that provide details about the visual appearance and visual behavior
   * for a given label and this style instance.
   * The idiom for retrieving, e.g. an {@link .IVisualCreator} implementation
   * for a given style is:
   * <pre><code>
   * var creator = style.renderer.getVisualCreator(label, style);
   * var visual = creator.createVisual(renderContext);
   * </code></pre>
   * @see Specified by {@link ILabelStyle#renderer}.
   * @type {ILabelStyleRenderer}
   */
  get renderer() {
    return ChoreographyMessageLabelStyle.RENDERER
  }

  static get RENDERER() {
    return (
      ChoreographyMessageLabelStyle.$renderer ||
      (ChoreographyMessageLabelStyle.$renderer = new ChoreographyMessageLabelStyleRenderer())
    )
  }

  static get DEFAULT_TEXT_PLACEMENT() {
    if (!ChoreographyMessageLabelStyle.$defaultTextPlacement) {
      const model = new ExteriorLabelModel()
      model.insets = new Insets(5)
      ChoreographyMessageLabelStyle.$defaultTextPlacement = model.createParameter(
        ExteriorLabelModelPosition.WEST
      )
    }
    return ChoreographyMessageLabelStyle.$defaultTextPlacement
  }

  static get INITIATING_MESSAGE_STYLE() {
    if (!ChoreographyMessageLabelStyle.$initiatingMessageStyle) {
      const style = new BpmnNodeStyle()
      style.icon = IconFactory.createMessage(
        BPMN_CONSTANTS_STROKES_MESSAGE,
        BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_INITIALIZING_PARTICIPANT
      )
      style.minimumSize = BPMN_CONSTANTS_SIZES_MESSAGE
      ChoreographyMessageLabelStyle.$initiatingMessageStyle = style
    }
    return ChoreographyMessageLabelStyle.$initiatingMessageStyle
  }

  static get RESPONSE_MESSAGE_STYLE() {
    if (!ChoreographyMessageLabelStyle.$responseMessageStyle) {
      const style = new BpmnNodeStyle()
      style.icon = IconFactory.createMessage(
        BPMN_CONSTANTS_STROKES_MESSAGE,
        BPMN_CONSTANTS_FILLS_CHOREOGRAPHY_RECEIVING_PARTICIPANT
      )
      style.minimumSize = BPMN_CONSTANTS_SIZES_MESSAGE
      ChoreographyMessageLabelStyle.$responseMessageStyle = style
    }
    return ChoreographyMessageLabelStyle.$responseMessageStyle
  }

  static get CONNECTOR_STYLE() {
    if (!ChoreographyMessageLabelStyle.$connectorStyle) {
      const style = new BpmnEdgeStyle()
      style.type = EdgeType.ASSOCIATION
      ChoreographyMessageLabelStyle.$connectorStyle = style
    }
    return ChoreographyMessageLabelStyle.$connectorStyle
  }

  static get TEXT_STYLE() {
    return (
      ChoreographyMessageLabelStyle.$textStyle ||
      (ChoreographyMessageLabelStyle.$textStyle = new DefaultLabelStyle())
    )
  }
}

/**
 * An {@link ILabelStyleRenderer} implementation used by {@link ChoreographyMessageLabelStyle}.
 */
class ChoreographyMessageLabelStyleRenderer extends BaseClass(ILabelStyleRenderer, IVisualCreator) {
  constructor() {
    super()
    this.item = null
    this.style = null
    this.north = false
    this.responseMessage = false
  }

  /**
   * @return {ILabelStyle}
   */
  getCurrentStyle(item, style) {
    if (!(style instanceof ChoreographyMessageLabelStyle)) {
      return VoidLabelStyle.INSTANCE
    }
    const labelStyle = style

    this.north = true
    this.responseMessage = false
    if (INode.isInstance(item.owner)) {
      const node = item.owner
      this.north = item.layout.orientedRectangleCenter.y < node.layout.center.y

      if (node.style instanceof ChoreographyNodeStyle) {
        this.responseMessage = node.style.initiatingAtTop ^ this.north
      }
    }
    const delegateStyle = labelStyle.delegateStyle
    delegateStyle.iconStyle = this.responseMessage
      ? ChoreographyMessageLabelStyle.RESPONSE_MESSAGE_STYLE
      : ChoreographyMessageLabelStyle.INITIATING_MESSAGE_STYLE
    delegateStyle.labelConnectorLocation = this.north
      ? FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
      : FreeNodePortLocationModel.NODE_TOP_ANCHORED
    delegateStyle.nodeConnectorLocation = this.north
      ? FreeNodePortLocationModel.NODE_TOP_ANCHORED
      : FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
    return delegateStyle
  }

  /**
   * Gets an implementation of the {@link .IVisualCreator} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation, but never <code>null</code>.
   * @param {INode} item The item to provide an instance for
   * @param {INodeStyle} style The style to use for the creation of the visual
   * @return {.IVisualCreator} An implementation that may be used to subsequently create or update the
   *   visual for the item. Clients should not cache this instance and must always call this method immediately
   *   before using the value returned. This enables the use of the flyweight design pattern for implementations.
   *   This method may not return <code>null</code> but should yield a {@link .VoidVisualCreator#INSTANCE
   *   void} implementation instead.
   * @see {@link .VoidVisualCreator#INSTANCE}
   * @see Specified by {@link INodeStyleRenderer#getVisualCreator}.
   */
  getVisualCreator(item, style) {
    this.item = item
    this.style = style
    return this
  }

  /**
   * Gets an implementation of the {@link .IBoundsProvider} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} item The item to provide an instance for
   * @param {INodeStyle} style The style to use for the calculating the painting bounds
   * @return {.IBoundsProvider} An implementation that may be used to subsequently query
   * the item's painting bounds. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer#getBoundsProvider}.
   */
  getBoundsProvider(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getBoundsProvider(item, delegateStyle)
  }

  /**
   * Gets an implementation of the {@link .IVisibilityTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} item The item to provide an instance for
   * @param {INodeStyle} style The style to use for the testing the visibility
   * @return {.IVisibilityTestable} An implementation that may be used to subsequently query
   * the item's visibility. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer#getVisibilityTestable}.
   */
  getVisibilityTestable(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getVisibilityTestable(item, delegateStyle)
  }

  /**
   * Gets an implementation of the {@link IHitTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} item The item to provide an instance for
   * @param {INodeStyle} style The style to use for the querying hit tests
   * @return {IHitTestable} An implementation that may be used to subsequently perform
   * hit tests. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations. This method may return <code>null</code>
   * to indicate that the item cannot be hit tested.
   * @see Specified by {@link INodeStyleRenderer#getHitTestable}.
   */
  getHitTestable(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getHitTestable(item, delegateStyle)
  }

  /**
   * Gets an implementation of the {@link IMarqueeTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} item The item to provide an instance for
   * @param {INodeStyle} style The style to use for the querying marquee intersection test.
   * @return {IMarqueeTestable} An implementation that may be used to subsequently query
   * the marquee intersections. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer#getMarqueeTestable}.
   */
  getMarqueeTestable(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getMarqueeTestable(item, delegateStyle)
  }

  /**
   * Gets a temporary context instance that can be used to query additional information
   * for the item's style.
   * Implementations may return {@link ILookup#EMPTY} if they don't support this, but may not return
   * <code>null</code>.
   * @param {INode} item The item to provide a context instance for.
   * @param {INodeStyle} style The style to use for the context.
   * @return {ILookup} An non-<code>null</code> lookup implementation.
   * @see {@link ILookup#EMPTY}
   * @see {@link ILookup}
   * @see Specified by {@link INodeStyleRenderer#getContext}.
   */
  getContext(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getContext(item, delegateStyle)
  }

  /**
   * Calculates the {@link ILabel#preferredSize preferred size}
   * of a given label using the associated style.
   * @param {ILabel} label The label to determine the preferred size for
   * @param {ILabelStyle} style The style instance that uses this instance as its
   * {@link ILabelStyle#renderer}
   * @return {Size} A size that can be used as the {@link ILabel#preferredSize}
   * if this renderer paints the label using the associated style.
   * @see Specified by {@link ILabelStyleRenderer#getPreferredSize}.
   */
  getPreferredSize(label, style) {
    const delegateStyle = this.getCurrentStyle(label, style)
    return delegateStyle.renderer.getPreferredSize(label, delegateStyle)
  }

  /**
   * This method is called by the framework to create a {@link .Visual}
   * that will be included into the {@link .IRenderContext}.
   * {@link .CanvasComponent} uses this interface through the {@link .ICanvasObjectDescriptor}
   * to populate the visual canvas object tree.
   * @param {.IRenderContext} context The context that describes where the visual will be used.
   * @return {.Visual} The visual to include in the canvas object visual tree. This may be
   *   <code>null</code>.
   * @see {@link .IVisualCreator#updateVisual}
   * @see Specified by {@link .IVisualCreator#createVisual}.
   */
  createVisual(context) {
    const container = new SvgVisualGroup()
    const delegateStyle = this.getCurrentStyle(this.item, this.style)
    container.add(
      delegateStyle.renderer.getVisualCreator(this.item, delegateStyle).createVisual(context)
    )
    container['render-data-cache'] = this.createRenderData()
    return container
  }

  /**
   * This method updates or replaces a previously created {@link .Visual} for inclusion
   * in the {@link .IRenderContext}.
   * The {@link .CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link .IVisualCreator#createVisual}. Implementation may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {.IRenderContext} context The context that describes where the visual will be used in.
   * @param {.Visual} oldVisual The visual instance that had been returned the last time the
   *   {@link .IVisualCreator#createVisual} method was called on this instance.
   * @return {.Visual} <code>oldVisual</code>, if this instance modified the visual, or a new visual that
   *   should replace the existing one in the canvas object visual tree.
   * @see {@link .IVisualCreator#createVisual}
   * @see {@link .ICanvasObjectDescriptor}
   * @see {@link .CanvasComponent}
   * @see Specified by {@link .IVisualCreator#updateVisual}.
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    const cache = container !== null ? oldVisual['render-data-cache'] : null
    const delegateStyle = this.getCurrentStyle(this.item, this.style)
    const newCache = this.createRenderData()
    if (cache === null || !cache.equals(newCache) || container.children.size !== 1) {
      return this.createVisual(context)
    }
    const oldDelegateVisual = container.children.get(0)
    const newDelegateVisual = delegateStyle.renderer
      .getVisualCreator(this.item, delegateStyle)
      .updateVisual(context, oldDelegateVisual)
    if (oldDelegateVisual !== newDelegateVisual) {
      container.children.set(0, newDelegateVisual)
    }
    return container
  }

  /**
   * Returns an object that contains all information necessary to determine whether a visual needs to be updated.
   * @return {RenderData}
   */
  createRenderData() {
    const renderData = new RenderData()
    renderData.north = this.north
    renderData.responseMessage = this.responseMessage
    renderData.textPlacement = this.style.textPlacement
    return renderData
  }
}

class RenderData {
  constructor() {
    this.textPlacement = null
    this.north = false
    this.responseMessage = false
  }

  /** @return {boolean} */
  equals(obj) {
    if (!(obj instanceof RenderData)) {
      return false
    }
    return (
      this.textPlacement === obj.textPlacement &&
      this.north === obj.north &&
      this.responseMessage === obj.responseMessage
    )
  }

  /** @return {number} */
  hashCode() {
    let result = this.textPlacement !== null ? this.textPlacement.hashCode() : 0
    result = (result * 397) ^ (this.north ? 1 : 0)
    result = (result * 397) ^ (this.responseMessage ? 1 : 0)
    return result
  }
}

/**
 * An {@link PolylineEdgeStyle} implementation representing a connection according to the BPMN.
 */
export class BpmnEdgeStyle extends EdgeStyleBase {
  /**
   * Creates a new instance using {@link EdgeType#SEQUENCE_FLOW}.
   */
  constructor() {
    super()
    this.$type = EdgeType.SEQUENCE_FLOW
    this.$smoothing = 20
    this.$sourceArrow = null
    this.$targetArrow = null
    this.$stroke = null
  }

  /**
   * Gets the edge type of this style.
   * @type {EdgeType}
   */
  get type() {
    return this.$type
  }

  /**
   * Sets the edge type of this style.
   * @type {EdgeType}
   */
  set type(value) {
    this.$type = value
    switch (value) {
      case EdgeType.CONDITIONAL_FLOW:
        this.$stroke = BPMN_CONSTANTS_STROKES_B_P_M_N_EDGE_STYLE
        this.$sourceArrow = BpmnEdgeStyle.CONDITIONAL_SOURCE_ARROW
        this.$targetArrow = BpmnEdgeStyle.DEFAULT_TARGET_ARROW
        break
      case EdgeType.ASSOCIATION:
        this.$stroke = BPMN_CONSTANTS_STROKES_ASSOCIATION_EDGE_STYLE
        this.$sourceArrow = IArrow.NONE
        this.$targetArrow = IArrow.NONE
        break
      case EdgeType.DIRECTED_ASSOCIATION:
        this.$stroke = BPMN_CONSTANTS_STROKES_ASSOCIATION_EDGE_STYLE
        this.$sourceArrow = IArrow.NONE
        this.$targetArrow = BpmnEdgeStyle.ASSOCIATION_ARROW
        break
      case EdgeType.BIDIRECTED_ASSOCIATION:
        this.$stroke = BPMN_CONSTANTS_STROKES_ASSOCIATION_EDGE_STYLE
        this.$sourceArrow = BpmnEdgeStyle.ASSOCIATION_ARROW
        this.$targetArrow = BpmnEdgeStyle.ASSOCIATION_ARROW
        break
      case EdgeType.MESSAGE_FLOW:
        this.$stroke = BPMN_CONSTANTS_STROKES_MESSAGE_EDGE_STYLE
        this.$sourceArrow = BpmnEdgeStyle.MESSAGE_SOURCE_ARROW
        this.$targetArrow = BpmnEdgeStyle.MESSAGE_TARGET_ARROW
        break
      case EdgeType.DEFAULT_FLOW:
        this.$stroke = BPMN_CONSTANTS_STROKES_B_P_M_N_EDGE_STYLE
        this.$sourceArrow = BpmnEdgeStyle.DEFAULT_SOURCE_ARROW
        this.$targetArrow = BpmnEdgeStyle.DEFAULT_TARGET_ARROW
        break
      case EdgeType.CONVERSATION:
        this.$stroke = BPMN_CONSTANTS_STROKES_CONVERSATION_DOUBLE_LINE
        this.$sourceArrow = IArrow.NONE
        this.$targetArrow = IArrow.NONE
        break
      case EdgeType.SEQUENCE_FLOW:
      default:
        this.$stroke = BPMN_CONSTANTS_STROKES_B_P_M_N_EDGE_STYLE
        this.$sourceArrow = IArrow.NONE
        this.$targetArrow = BpmnEdgeStyle.DEFAULT_TARGET_ARROW
        break
    }
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    const bpmnEdgeStyle = new BpmnEdgeStyle()
    bpmnEdgeStyle.type = this.type
    return bpmnEdgeStyle
  }

  /**
   * Gets the visual arrow at the source end of edges that use this style.
   * Arrow instances may be shared between multiple style instances.
   * @type {IArrow}
   */
  get sourceArrow() {
    return this.$sourceArrow
  }

  /**
   * Gets the visual arrow at the target end of edges that use this style.
   * Arrow instances may be shared between multiple style instances.
   * @type {IArrow}
   */
  get targetArrow() {
    return this.$targetArrow
  }

  /**
   * Gets the  for the line.
   * @see Specified by {@link PolylineEdgeStyle#stroke}.
   * @type {.Stroke}
   */
  get stroke() {
    return this.$stroke
  }

  /**
   * Gets the smoothing length used for creating smooth bends.
   * A value of <code>0.0d</code> will disable smoothing.
   * @see Specified by {@link PolylineEdgeStyle#smoothing}.
   * @type {number}
   */
  get smoothing() {
    return this.$smoothing
  }

  /**
   * Sets the smoothing length used for creating smooth bends.
   * A value of <code>0.0d</code> will disable smoothing.
   * @see Specified by {@link PolylineEdgeStyle#smoothing}.
   * @type {number}
   */
  set smoothing(value) {
    this.$smoothing = value
  }

  /**
   * This method is called by the framework to create a {@link .Visual}
   * that will be included into the {@link .IRenderContext}.
   * {@link .CanvasComponent} uses this interface through the {@link .ICanvasObjectDescriptor}
   * to populate the visual canvas object tree.
   * @param {.IRenderContext} context The context that describes where the visual will be used.
   * @param {IEdge} edge The edge for which the visual is created.
   * @return {.Visual} The visual to include in the canvas object visual tree. This may be
   *   <code>null</code>.
   * @see {@link .IVisualCreator#updateVisual}
   */
  createVisual(context, edge) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const smoothedPath = this.getPath(edge)
    const path = smoothedPath.createSvgPath()
    Stroke.setStroke(this.stroke, path, context)
    path.setAttribute('fill', 'none')
    container.appendChild(path)

    if (this.type === EdgeType.CONVERSATION) {
      const doubleLineCenterPath = smoothedPath.createSvgPath()
      BPMN_CONSTANTS_STROKES_CONVERSATION_CENTER_LINE.applyTo(doubleLineCenterPath, context)
      doubleLineCenterPath.setAttribute('fill', 'none')
      container.appendChild(doubleLineCenterPath)
    }

    super.addArrows(context, container, edge, smoothedPath, this.sourceArrow, this.targetArrow)

    container['render-data-cache'] = {
      type: this.type,
      path: smoothedPath
    }

    return new SvgVisual(container)
  }

  getPath(edge) {
    const path = super.getPath(edge)
    return super
      .cropPath(edge, this.sourceArrow, this.targetArrow, path)
      .createSmoothedPath(this.smoothing)
  }

  /**
   * This method updates or replaces a previously created {@link .Visual} for inclusion
   * in the {@link .IRenderContext}.
   * The {@link .CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link .IVisualCreator#createVisual}. Implementation may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {.IRenderContext} context The context that describes where the visual will be used in.
   * @param {.Visual} oldVisual The visual instance that had been returned the last time the
   *   {@link .IVisualCreator#createVisual} method was called on this instance.
   * @param {IEdge} edge The edge for which the visual is updated.
   * @return {.Visual} <code>oldVisual</code>, if this instance modified the visual, or a new visual that
   *   should replace the existing one in the canvas object visual tree.
   * @see {@link .IVisualCreator#createVisual}
   * @see {@link .ICanvasObjectDescriptor}
   * @see {@link .CanvasComponent}
   * @see Specified by {@link .IVisualCreator#updateVisual}.
   */
  updateVisual(context, oldVisual, edge) {
    const container = oldVisual.svgElement
    const cache = container['render-data-cache']

    const oldPath = cache.path
    const newPath = this.getPath(edge)

    if (!oldPath.equals(newPath)) {
      container.firstElementChild.setAttribute('d', newPath.createSvgPathData())
      if (container.childElementCount === 2) {
        container.lastElementChild.setAttribute('d', newPath.createSvgPathData())
      }
      cache.path = newPath
    }

    const oldType = cache.type
    const newType = this.type

    if (!oldType === newType) {
      const path = container.firstElementChild
      Stroke.setStroke(this.stroke, path, context)

      if (newType === EdgeType.CONVERSATION) {
        const doubleLineCenterPath = newPath.createSvgPath()
        BPMN_CONSTANTS_STROKES_CONVERSATION_CENTER_LINE.applyTo(doubleLineCenterPath, context)
        container.appendChild(doubleLineCenterPath)
      } else {
        container.removeChild(container.lastElementChild)
      }

      cache.type = newType
    }

    super.updateArrows(context, container, edge, newPath, this.sourceArrow, this.targetArrow)

    return new SvgVisual(container)
  }

  static get DEFAULT_TARGET_ARROW() {
    if (!BpmnEdgeStyle.$defaultTargetArrow) {
      const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.DEFAULT_TARGET))
      iconArrow.bounds = new Size(8, 6)
      iconArrow.cropLength = 1
      iconArrow.length = 8
      BpmnEdgeStyle.$defaultTargetArrow = iconArrow
    }
    return BpmnEdgeStyle.$defaultTargetArrow
  }

  static get DEFAULT_SOURCE_ARROW() {
    if (!BpmnEdgeStyle.$defaultSourceArrow) {
      const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.DEFAULT_SOURCE))
      iconArrow.bounds = new Size(8, 6)
      iconArrow.cropLength = 0
      iconArrow.length = 0
      BpmnEdgeStyle.$defaultSourceArrow = iconArrow
    }
    return BpmnEdgeStyle.$defaultSourceArrow
  }

  static get ASSOCIATION_ARROW() {
    if (!BpmnEdgeStyle.$associationArrow) {
      const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.ASSOCIATION))
      iconArrow.bounds = new Size(8, 6)
      iconArrow.cropLength = 1
      iconArrow.length = 0
      BpmnEdgeStyle.$associationArrow = iconArrow
    }
    return BpmnEdgeStyle.$associationArrow
  }

  static get CONDITIONAL_SOURCE_ARROW() {
    if (!BpmnEdgeStyle.$conditionalSourceArrow) {
      const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.CONDITIONAL_SOURCE))
      iconArrow.bounds = new Size(16, 8)
      iconArrow.cropLength = 1
      iconArrow.length = 16
      BpmnEdgeStyle.$conditionalSourceArrow = iconArrow
    }
    return BpmnEdgeStyle.$conditionalSourceArrow
  }

  static get MESSAGE_TARGET_ARROW() {
    if (!BpmnEdgeStyle.$messageTargetArrow) {
      const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.MESSAGE_TARGET))
      iconArrow.bounds = new Size(8, 6)
      iconArrow.cropLength = 1
      iconArrow.length = 8
      BpmnEdgeStyle.$messageTargetArrow = iconArrow
    }
    return BpmnEdgeStyle.$messageTargetArrow
  }

  static get MESSAGE_SOURCE_ARROW() {
    if (!BpmnEdgeStyle.$messageSourceArrow) {
      const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.MESSAGE_SOURCE))
      iconArrow.bounds = new Size(6, 6)
      iconArrow.cropLength = 1
      iconArrow.length = 6
      BpmnEdgeStyle.$messageSourceArrow = iconArrow
    }
    return BpmnEdgeStyle.$messageSourceArrow
  }
}

/**
 * Uses the style insets extended by the size of the participant bands.
 */
class ActivityInsetsProvider extends BaseClass(INodeInsetsProvider) {
  constructor(style) {
    super()
    this.style = style
  }

  /** @return {Insets} */
  getInsets(item) {
    const left =
      this.style.taskType !== TaskType.ABSTRACT
        ? BPMN_CONSTANTS_SIZES_TASK_TYPE.width +
          BPMN_CONSTANTS_PLACEMENTS_TASK_TYPE.model.insets.left
        : 0
    const bottom =
      this.style.adHoc ||
      this.style.compensation ||
      this.style.loopCharacteristic !== LoopCharacteristic.NONE ||
      this.style.subState !== SubState.NONE
        ? BPMN_CONSTANTS_SIZES_MARKER.height +
          BPMN_CONSTANTS_PLACEMENTS_TASK_MARKER.model.insets.bottom
        : 0
    return new Insets(
      left + this.style.insets.left,
      this.style.insets.top,
      this.style.insets.right,
      bottom + this.style.insets.bottom
    )
  }
}

/**
 * An {@link INodeStyle} implementation representing an Activity according to the BPMN.
 */
export class ActivityNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance using the default values.
   */
  constructor() {
    super()
    this.$taskType = TaskType.ABSTRACT
    this.$triggerEventType = EventType.MESSAGE
    this.$triggerEventCharacteristic = EventCharacteristic.SUB_PROCESS_INTERRUPTING
    this.$loopCharacteristic = LoopCharacteristic.NONE
    this.$subState = SubState.NONE
    this.$insets = new Insets(15)
    this.minimumSize = new Size(40, 30)
    this.activityIcon = null
    this.taskIcon = null
    this.loopIcon = null
    this.$adHoc = false
    this.$compensation = false
    this.activityType = ActivityType.TASK
  }

  /**
   * Gets the activity type for this style.
   * @type {ActivityType}
   */
  get activityType() {
    return this.$activityType
  }

  /**
   * Sets the activity type for this style.
   * @type {ActivityType}
   */
  set activityType(value) {
    if (this.$activityType !== value || this.activityIcon === null) {
      this.modCount++
      this.$activityType = value
      this.activityIcon = IconFactory.createActivity(this.$activityType)
    }
  }

  /**
   * Gets the task type for this style.
   * @type {TaskType}
   */
  get taskType() {
    return this.$taskType
  }

  /**
   * Sets the task type for this style.
   * @type {TaskType}
   */
  set taskType(value) {
    if (this.$taskType !== value) {
      this.modCount++
      this.$taskType = value
      this.updateTaskIcon()
    }
  }

  /**
   * Gets the event type that is used for the task type {@link TaskType#EVENT_TRIGGERED}.
   * @type {EventType}
   */
  get triggerEventType() {
    return this.$triggerEventType
  }

  /**
   * Sets the event type that is used for the task type {@link TaskType#EVENT_TRIGGERED}.
   * @type {EventType}
   */
  set triggerEventType(value) {
    if (this.$triggerEventType !== value) {
      this.$triggerEventType = value
      if (this.taskType === TaskType.EVENT_TRIGGERED) {
        this.modCount++
        this.updateTaskIcon()
      }
    }
  }

  /**
   * Gets the event characteristic that is used for the task type {@link TaskType#EVENT_TRIGGERED}.
   * @type {EventCharacteristic}
   */
  get triggerEventCharacteristic() {
    return this.$triggerEventCharacteristic
  }

  /**
   * Sets the event characteristic that is used for the task type {@link TaskType#EVENT_TRIGGERED}.
   * @type {EventCharacteristic}
   */
  set triggerEventCharacteristic(value) {
    if (this.$triggerEventCharacteristic !== value) {
      this.$triggerEventCharacteristic = value
      if (this.taskType === TaskType.EVENT_TRIGGERED) {
        this.modCount++
        this.updateTaskIcon()
      }
    }
  }

  /**
   * Gets the loop characteristic of this style.
   * @type {LoopCharacteristic}
   */
  get loopCharacteristic() {
    return this.$loopCharacteristic
  }

  /**
   * Sets the loop characteristic of this style.
   * @type {LoopCharacteristic}
   */
  set loopCharacteristic(value) {
    if (this.$loopCharacteristic !== value) {
      this.modCount++
      this.$loopCharacteristic = value
      this.loopIcon = IconFactory.createLoopCharacteristic(value)
    }
  }

  /**
   * Gets the sub state of this style.
   * @type {SubState}
   */
  get subState() {
    return this.$subState
  }

  /**
   * Sets the sub state of this style.
   * @type {SubState}
   */
  set subState(value) {
    if (this.$subState !== value) {
      this.modCount++
      this.$subState = value
    }
  }

  /**
   * Gets whether this style represents an Ad Hoc Activity.
   * @type {boolean}
   */
  get adHoc() {
    return this.$adHoc
  }

  /**
   * Sets whether this style represents an Ad Hoc Activity.
   * @type {boolean}
   */
  set adHoc(value) {
    if (this.$adHoc !== value) {
      this.modCount++
      this.$adHoc = value
    }
  }

  /**
   * Gets whether this style represents a Compensation Activity.
   * @type {boolean}
   */
  get compensation() {
    return this.$compensation
  }

  /**
   * Sets whether this style represents a Compensation Activity.
   * @type {boolean}
   */
  set compensation(value) {
    if (this.$compensation !== value) {
      this.modCount++
      this.$compensation = value
    }
  }

  /**
   * Gets the insets for the node.
   * These insets are extended at the left and bottom side if markers are active
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link NodeStyleBase#lookup lookup}.
   * @see {@link INodeInsetsProvider}
   * @return {Insets} An insets object that describes the insets of node.
   */
  get insets() {
    return this.$insets
  }

  /**
   * Sets the insets for the node.
   * These insets are extended at the left and bottom side if markers are active
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link NodeStyleBase#lookup lookup}.
   * @see {@link INodeInsetsProvider}
   * @param {Insets} insets An insets object that describes the insets of node.
   */
  set insets(insets) {
    this.$insets = insets
  }

  updateTaskIcon() {
    if (this.taskType === TaskType.EVENT_TRIGGERED) {
      const eventNodeStyle = new EventNodeStyle()
      eventNodeStyle.characteristic = this.triggerEventCharacteristic
      eventNodeStyle.type = this.triggerEventType

      eventNodeStyle.updateIcon()
      this.taskIcon = eventNodeStyle.icon
    } else {
      this.taskIcon = IconFactory.createActivityTaskType(this.$taskType)
    }
    if (this.taskIcon !== null) {
      this.taskIcon = IconFactory.createPlacedIcon(
        this.taskIcon,
        BPMN_CONSTANTS_PLACEMENTS_TASK_TYPE,
        BPMN_CONSTANTS_SIZES_TASK_TYPE
      )
    }
  }

  /**
   * Callback that creates the visual.
   * @param {.IRenderContext} renderContext The render context.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {.Visual} The visual as required by the {@link .IVisualCreator#createVisual}
   *   interface.
   * @see {@link NodeStyleBase#updateVisual}
   */
  createVisual(renderContext, node) {
    this.icon = this.createIcon(node)
    const outerContainer = new SvgVisualGroup()
    outerContainer['render-data-cache'] = this.icon
    const visual = super.createVisual(renderContext, node)
    if (visual !== null) {
      outerContainer.add(visual)
    }
    return outerContainer
  }

  /**
   * Callback that updates the visual previously created by {@link NodeStyleBase#createVisual}.
   * @param {IRenderContext} renderContext The render context.
   * @param {Visual} oldVisual The visual that has been created in the call to
   *   {@link NodeStyleBase#createVisual}.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {Visual} The visual as required by the {@link IVisualCreator#createVisual}
   *   interface.
   * @see {@link NodeStyleBase#createVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container === null) {
      return this.createVisual(renderContext, node)
    }
    const icon = container['render-data-cache']
    if (icon === null) {
      return this.createVisual(renderContext, node)
    }
    this.icon = icon

    const oldInnerVisual = container.children.size === 1 ? container.children.elementAt(0) : null
    const newInnerVisual = super.updateVisual(renderContext, oldInnerVisual, node)
    if (newInnerVisual === null) {
      if (oldInnerVisual !== null) {
        container.children.remove(oldInnerVisual)
      }
    } else if (!newInnerVisual.equals(oldInnerVisual)) {
      if (oldInnerVisual !== null) {
        container.children.remove(oldInnerVisual)
      }
      container.add(newInnerVisual)
    }
    return container
  }

  /** @return {Icon} */
  createIcon(node) {
    let minimumWidth = 10.0

    const icons = new List()
    if (this.activityIcon) {
      icons.add(this.activityIcon)
    }
    if (this.taskIcon) {
      icons.add(this.taskIcon)
    }

    const lineUpIcons = new List()
    if (this.loopIcon) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      lineUpIcons.add(this.loopIcon)
    }
    if (this.adHoc) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      lineUpIcons.add(ActivityNodeStyle.AD_HOC_ICON)
    }
    if (this.compensation) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      lineUpIcons.add(ActivityNodeStyle.COMPENSATION_ICON)
    }
    if (this.subState !== SubState.NONE) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      if (this.subState === SubState.DYNAMIC) {
        lineUpIcons.add(IconFactory.createDynamicSubState(node))
      } else {
        lineUpIcons.add(IconFactory.createStaticSubState(this.subState))
      }
    }
    if (lineUpIcons.size > 0) {
      const lineUpIcon = IconFactory.createLineUpIcon(lineUpIcons, BPMN_CONSTANTS_SIZES_MARKER, 5)
      icons.add(
        IconFactory.createPlacedIcon(
          lineUpIcon,
          BPMN_CONSTANTS_PLACEMENTS_TASK_MARKER,
          BPMN_CONSTANTS_SIZES_MARKER
        )
      )
    }

    this.minimumSize = new Size(Math.max(minimumWidth, 40), 40)
    if (icons.size > 1) {
      return IconFactory.createCombinedIcon(icons)
    } else if (icons.size === 1) {
      return icons.get(0)
    }
    return null
  }

  /**
   * Gets the outline of the visual style.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {GeneralPath} The outline of the visual representation or <code>null</code>.
   */
  getOutline(node) {
    return ActivityNodeStyle.createRoundRectPath(
      node.layout.x,
      node.layout.y,
      node.layout.width,
      node.layout.height,
      5
    )
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * @param {ICanvasContext} canvasContext The canvas context.
   * @param {Point} p The point to test.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {boolean} <code>true</code> if the specified node representation is hit; otherwise, <code>false</code>.
   */
  isHit(canvasContext, p, node) {
    return ActivityNodeStyle.SHAPE_NODE_STYLE.renderer
      .getHitTestable(node, ActivityNodeStyle.SHAPE_NODE_STYLE)
      .isHit(canvasContext, p)
  }

  /**
   * Performs the {@link ILookup#lookup} operation.
   * @param {INode} node The node to use for the context lookup.
   * @param {Class} type The type to query.
   * @return {Object} An implementation of the <code>type</code> or <code>null</code>.
   */
  lookup(node, type) {
    if (type === INodeInsetsProvider.$class) {
      return new ActivityInsetsProvider(this)
    }
    return super.lookup(node, type)
  }

  /** @return {GeneralPath} */
  static createRoundRectPath(x, y, width, height, radius) {
    const roundRect = new GeneralPath(10)
    roundRect.clear()
    const arcX = Math.min(width * 0.5, radius)
    const arcY = Math.min(height * 0.5, radius)
    roundRect.moveTo(x, y + arcY)
    roundRect.quadTo(x, y, x + arcX, y)
    roundRect.lineTo(x + width - arcX, y)
    roundRect.quadTo(x + width, y, x + width, y + arcY)
    roundRect.lineTo(x + width, y + height - arcY)
    roundRect.quadTo(x + width, y + height, x + width - arcX, y + height)
    roundRect.lineTo(x + arcX, y + height)
    roundRect.quadTo(x, y + height, x, y + height - arcY)
    roundRect.close()
    return roundRect
  }

  static get SHAPE_NODE_STYLE() {
    if (!ActivityNodeStyle.$shapeNodeStyle) {
      const shapeNodeStyleRenderer = new ShapeNodeStyleRenderer()
      shapeNodeStyleRenderer.roundRectArcRadius = BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS
      ActivityNodeStyle.$shapeNodeStyle = new ShapeNodeStyle({
        renderer: shapeNodeStyleRenderer,
        shape: ShapeNodeShape.ROUND_RECTANGLE,
        stroke: Stroke.BLACK,
        fill: null
      })
    }
    return ActivityNodeStyle.$shapeNodeStyle
  }

  static get AD_HOC_ICON() {
    return (
      ActivityNodeStyle.$adHocIcon || (ActivityNodeStyle.$adHocIcon = IconFactory.createAdHoc())
    )
  }

  static get COMPENSATION_ICON() {
    return (
      ActivityNodeStyle.$compensationIcon ||
      (ActivityNodeStyle.$compensationIcon = IconFactory.createCompensation(false))
    )
  }
}

/**
 * Specifies the arrow types of an edge can have according to BPMN.
 */
const ArrowType = Enum('ArrowType', {
  SEQUENCE_TARGET: 0,
  DEFAULT_SOURCE: 1,
  DEFAULT_TARGET: 2,
  CONDITIONAL_SOURCE: 3,
  CONDITIONAL_TARGET: 4,
  MESSAGE_SOURCE: 5,
  MESSAGE_TARGET: 6,
  ASSOCIATION: 7
})

/**
 * Specifies the type of an edge according to BPMN.
 * @see {@link BpmnEdgeStyle}
 */
export const EdgeType = Enum('EdgeType', {
  /**
   * Specifies an edge to be a Sequence Flow according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  SEQUENCE_FLOW: 0,
  /**
   * Specifies an edge to be a Default Flow according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  DEFAULT_FLOW: 1,
  /**
   * Specifies an edge to be a Conditional Flow according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  CONDITIONAL_FLOW: 2,
  /**
   * Specifies an edge to be a Message Flow according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  MESSAGE_FLOW: 3,
  /**
   * Specifies an edge to be an undirected Association according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  ASSOCIATION: 4,
  /**
   * Specifies an edge to be a directed Association according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  DIRECTED_ASSOCIATION: 5,
  /**
   * Specifies an edge to be a bidirected Association according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  BIDIRECTED_ASSOCIATION: 6,
  /**
   * Specifies an edge to be a Conversation according to BPMN.
   * @see {@link BpmnEdgeStyle}
   */
  CONVERSATION: 7
})

/**
 * Custom stripe style that alternates the visualizations for the leaf nodes and uses a different style for all
 * parent stripes.
 */
export class AlternatingLeafStripeStyle extends StripeStyleBase {
  constructor() {
    super()

    this.$evenLeafDescriptor = null
    this.$parentDescriptor = null
    this.$oddLeafDescriptor = null
  }

  /**
   * Visualization for all leaf stripes that have an even index.
   * @type {StripeDescriptor}
   */
  get evenLeafDescriptor() {
    return this.$evenLeafDescriptor
  }

  /**
   * Visualization for all leaf stripes that have an even index.
   * @type {StripeDescriptor}
   */
  set evenLeafDescriptor(value) {
    this.$evenLeafDescriptor = value
  }

  /**
   * Visualization for all stripes that are not leafs.
   * @type {StripeDescriptor}
   */
  get parentDescriptor() {
    return this.$parentDescriptor
  }

  /**
   * Visualization for all stripes that are not leafs.
   * @type {StripeDescriptor}
   */
  set parentDescriptor(value) {
    this.$parentDescriptor = value
  }

  /**
   * Visualization for all leaf stripes that have an odd index.
   * @type {StripeDescriptor}
   */
  get oddLeafDescriptor() {
    return this.$oddLeafDescriptor
  }

  /**
   * Visualization for all leaf stripes that have an odd index.
   * @type {StripeDescriptor}
   */
  set oddLeafDescriptor(value) {
    this.$oddLeafDescriptor = value
  }

  /**
   * Callback that creates the visual.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {IRenderContext} renderContext The render context.
   * @return {Visual} The visual.
   * @see {@link NodeStyleBase#updateVisual}
   */
  createVisual(renderContext, node) {
    const stripe = node.lookup(IStripe.$class)
    const layout = node.layout
    if (stripe !== null) {
      const container = new SvgVisualGroup()
      let stripeInsets
      let descriptor

      // Depending on the stripe type, we need to consider horizontal or vertical insets
      if (IColumn.isInstance(stripe)) {
        const column = stripe
        stripeInsets = new Insets(0, column.actualInsets.top, 0, column.actualInsets.bottom)
      } else {
        const row = stripe
        stripeInsets = new Insets(row.actualInsets.left, 0, row.actualInsets.right, 0)
      }

      let actualBorderThickness

      if (stripe.childStripes.size > 0) {
        // Parent stripe - use the parent descriptor
        descriptor = this.parentDescriptor
        actualBorderThickness = descriptor.borderThickness
      } else {
        let index
        if (IColumn.isInstance(stripe)) {
          const col = stripe
          // Get all leaf columns
          const leafs = col.table.rootColumn.leaves.toList()
          // Determine the index
          index = leafs.findIndex(curr => col === curr)
          // Use the correct descriptor
          descriptor = index % 2 === 0 ? this.evenLeafDescriptor : this.oddLeafDescriptor
          actualBorderThickness = descriptor.borderThickness
        } else {
          const row = stripe
          const leafs = row.table.rootRow.leaves.toList()
          index = leafs.findIndex(curr => row === curr)
          descriptor = index % 2 === 0 ? this.evenLeafDescriptor : this.oddLeafDescriptor
          actualBorderThickness = descriptor.borderThickness
        }
      }

      const border = new BorderVisual()
      border.insets = stripeInsets
      border.backgroundFill = descriptor.backgroundFill
      border.insetFill = descriptor.insetFill
      border.stroke = new Stroke(descriptor.borderFill, actualBorderThickness.top)
      container.add(
        border.createVisual(renderContext, new Rect(0, 0, layout.width, layout.height), node)
      )

      const transform = new Matrix()
      transform.translate(node.layout.topLeft)
      container.transform = transform

      container['render-data-cache'] = this.createRenderDataCache(descriptor, stripe, stripeInsets)
      return container
    }
    return null
  }

  /**
   * Callback that updates the visual previously created by {@link NodeStyleBase#createVisual}.
   * This method is called in response to a {@link IVisualCreator#updateVisual}
   * call to the instance that has been queried from the {@link NodeStyleBase#renderer}.
   * This implementation simply delegates to {@link NodeStyleBase#createVisual} so subclasses
   * should override to improve rendering performance.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {IRenderContext} renderContext The render context.
   * @param {Visual} oldVisual The visual that should be updated.
   * @return {Visual} The visual.
   * @see {@link NodeStyleBase#createVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const stripe = node.lookup(IStripe.$class)
    const layout = node.layout
    if (stripe !== null) {
      /** @type {Insets} */
      let stripeInsets
      // Check if values have changed - then update everything
      /** @type {StripeDescriptor} */
      let descriptor
      if (IColumn.isInstance(stripe)) {
        const col = stripe
        stripeInsets = new Insets(0, col.actualInsets.top, 0, col.actualInsets.bottom)
      } else {
        const row = stripe
        stripeInsets = new Insets(row.actualInsets.left, 0, row.actualInsets.right, 0)
      }

      /** @type {Insets} */
      let actualBorderThickness

      if (stripe.childStripes.size > 0) {
        descriptor = this.parentDescriptor
        actualBorderThickness = descriptor.borderThickness
      } else {
        /** @type {number} */
        let index
        if (IColumn.isInstance(stripe)) {
          const col = stripe
          const leafs = col.table.rootColumn.leaves.toList()
          index = leafs.findIndex(curr => col === curr)
          descriptor = index % 2 === 0 ? this.evenLeafDescriptor : this.oddLeafDescriptor
          actualBorderThickness = descriptor.borderThickness
        } else {
          const row = stripe
          const leafs = row.table.rootRow.leaves.toList()
          index = leafs.findIndex(curr => row === curr)
          descriptor = index % 2 === 0 ? this.evenLeafDescriptor : this.oddLeafDescriptor
          actualBorderThickness = descriptor.borderThickness
        }
      }

      // get the data with wich the oldvisual was created
      const oldCache = oldVisual['render-data-cache']
      // get the data for the new visual
      const newCache = this.createRenderDataCache(descriptor, stripe, stripeInsets)

      // check if something changed except for the location of the node
      if (!newCache.equals(newCache, oldCache)) {
        // something changed - just re-render the visual
        return this.createVisual(renderContext, node)
      }

      const border = new BorderVisual()
      border.insets = newCache.insets
      border.backgroundFill = newCache.descriptor.backgroundFill
      border.insetFill = newCache.descriptor.insetFill
      border.stroke = new Stroke(newCache.descriptor.borderFill, actualBorderThickness.top)
      const child = oldVisual.children.get(0)
      oldVisual.children.set(
        0,
        border.updateVisual(renderContext, child, new Rect(0, 0, layout.width, layout.height), node)
      )

      const transform = new Matrix()
      transform.translate(node.layout.topLeft)
      oldVisual.transform = transform

      return oldVisual
    }
    return null
  }

  /** @return {Object} */
  createRenderDataCache(descriptor, stripe, insets) {
    return {
      descriptor,
      stripe,
      insets,
      equals(self, other) {
        return (
          self.descriptor.equals(other.descriptor) &&
          self.insets.equals(other.insets) &&
          self.stripe === other.stripe
        )
      }
    }
  }
}

/**
 * A visual representing a border with a variable thickness
 * that can be different for each side.
 * A border visual consists of four rectangles for each side
 * and a background rectangle that are grouped inside a g element.
 */
class BorderVisual extends BaseClass(IVisualTemplate) {
  constructor(layout) {
    super()
    this.$backgroundFill = null
    this.$insetFill = null
    this.$stroke = null
    this.$insets = Insets.EMPTY
  }

  createVisual(context, bounds, data) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const backgroundRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    backgroundRectangle.setAttribute('x', '0')
    backgroundRectangle.setAttribute('y', '0')
    backgroundRectangle.setAttribute('width', bounds.width)
    backgroundRectangle.setAttribute('height', bounds.height)
    backgroundRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.backgroundFill, backgroundRectangle, context)
    container.appendChild(backgroundRectangle)
    const leftInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    leftInsetRectangle.setAttribute('x', '0')
    leftInsetRectangle.setAttribute('y', '0')
    leftInsetRectangle.setAttribute('width', this.insets.left)
    leftInsetRectangle.setAttribute('height', bounds.height)
    leftInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, leftInsetRectangle, context)
    container.appendChild(leftInsetRectangle)
    const topInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    topInsetRectangle.setAttribute('x', '0')
    topInsetRectangle.setAttribute('y', '0')
    topInsetRectangle.setAttribute('width', bounds.width)
    topInsetRectangle.setAttribute('height', this.insets.top)
    topInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, topInsetRectangle, context)
    container.appendChild(topInsetRectangle)
    const rightInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rightInsetRectangle.setAttribute('x', bounds.width - this.insets.right)
    rightInsetRectangle.setAttribute('y', '0')
    rightInsetRectangle.setAttribute('width', this.insets.right)
    rightInsetRectangle.setAttribute('height', bounds.height)
    rightInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, rightInsetRectangle, context)
    container.appendChild(rightInsetRectangle)
    const bottomInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bottomInsetRectangle.setAttribute('x', '0')
    bottomInsetRectangle.setAttribute('y', bounds.height - this.insets.bottom)
    bottomInsetRectangle.setAttribute('width', bounds.width)
    bottomInsetRectangle.setAttribute('height', this.insets.bottom)
    bottomInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, bottomInsetRectangle, context)
    container.appendChild(bottomInsetRectangle)
    const borderRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    borderRectangle.setAttribute('x', '0')
    borderRectangle.setAttribute('y', '0')
    borderRectangle.setAttribute('width', bounds.width)
    borderRectangle.setAttribute('height', bounds.height)
    Stroke.setStroke(this.stroke, borderRectangle, context)
    borderRectangle.setAttribute('fill', 'none')
    container.appendChild(borderRectangle)

    SvgVisual.setTranslate(container, bounds.x, bounds.y)

    container['render-data-cache'] = {
      bounds: bounds.toRect(),
      insets: this.insets,
      stroke: this.stroke,
      backgroundFill: this.backgroundFill.clone(),
      insetFill: this.insetFill.clone()
    }

    return new SvgVisual(container)
  }

  updateVisual(context, oldVisual, bounds, data) {
    const container = oldVisual.svgElement

    if (!container || container.childElementCount !== 6) {
      this.createVisual(context, bounds, data)
    }

    const cache = container['render-data-cache']
    if (cache.backgroundFill !== this.backgroundFill) {
      Fill.setFill(this.backgroundFill, container.childNodes[0], context)
      cache.backgroundFill = this.backgroundFill
    }
    if (cache.borderFill !== this.insetFill) {
      Fill.setFill(this.insetFill, container.childNodes[1], context)
      Fill.setFill(this.insetFill, container.childNodes[2], context)
      Fill.setFill(this.insetFill, container.childNodes[3], context)
      Fill.setFill(this.insetFill, container.childNodes[4], context)
      cache.borderFill = this.insetFill
    }
    if (cache.stroke !== this.stroke) {
      Stroke.setStroke(this.stroke, container.childNodes[5], context)
      cache.stroke = this.stroke
    }

    const insets = this.insets
    if (!cache.insets.equals(insets) || !cache.bounds.equals(bounds)) {
      const backgroundRectangle = container.childNodes[0]
      backgroundRectangle.setAttribute('x', '0')
      backgroundRectangle.setAttribute('y', '0')
      backgroundRectangle.setAttribute('width', bounds.width)
      backgroundRectangle.setAttribute('height', bounds.height)
      const leftInsetRectangle = container.childNodes[1]
      leftInsetRectangle.setAttribute('x', '0')
      leftInsetRectangle.setAttribute('y', '0')
      leftInsetRectangle.setAttribute('width', insets.left)
      leftInsetRectangle.setAttribute('height', bounds.height)
      const topInsetRectangle = container.childNodes[2]
      topInsetRectangle.setAttribute('x', '0')
      topInsetRectangle.setAttribute('y', '0')
      topInsetRectangle.setAttribute('width', bounds.width)
      topInsetRectangle.setAttribute('height', insets.top)
      const rightInsetsRectangle = container.childNodes[3]
      rightInsetsRectangle.setAttribute('x', bounds.width - insets.right)
      rightInsetsRectangle.setAttribute('y', '0')
      rightInsetsRectangle.setAttribute('width', insets.right)
      rightInsetsRectangle.setAttribute('height', bounds.height)
      const bottomInsetRectangle = container.childNodes[4]
      bottomInsetRectangle.setAttribute('x', '0')
      bottomInsetRectangle.setAttribute('y', bounds.height - insets.bottom)
      bottomInsetRectangle.setAttribute('width', bounds.width)
      bottomInsetRectangle.setAttribute('height', insets.bottom)
      const borderRectangle = container.childNodes[5]
      borderRectangle.setAttribute('x', '0')
      borderRectangle.setAttribute('y', '0')
      borderRectangle.setAttribute('width', bounds.width)
      borderRectangle.setAttribute('height', bounds.height)

      cache.insets = insets
      cache.bounds = bounds.toRect()
    }

    SvgVisual.setTranslate(container, bounds.x, bounds.y)

    return new SvgVisual(container)
  }

  /**
   * Returns the fill for inside the rectangle.
   * @type {Fill}
   */
  get backgroundFill() {
    return this.$backgroundFill
  }

  /**
   * Specifies the fill for inside the rectangle.
   * @type {Fill}
   */
  set backgroundFill(fill) {
    this.$backgroundFill = fill
  }

  /**
   * Returns the stroke for the outline of the rectangle.
   * @type {Stroke}
   */
  get stroke() {
    return this.$stroke
  }

  /**
   * Specifies the stroke for the outline of the rectangle.
   * @type {Stroke}
   */
  set stroke(stroke) {
    this.$stroke = stroke
  }

  /**
   * Returns the fill for inside the insets.
   * @type {Fill}
   */
  get insetFill() {
    return this.$insetFill
  }

  /**
   * Specifies the fill for inside the insets.
   * @type {Fill}
   */
  set insetFill(fill) {
    this.$insetFill = fill
  }

  /**
   * Returns the border's thickness.
   * @type {Insets}
   */
  get insets() {
    return this.$insets
  }

  /**
   * Sets the border's thickness.
   * @type {Insets}
   */
  set insets(insets) {
    this.$insets = insets
  }
}

/**
 * An {@link INodeStyle} implementation representing an Annotation according to the BPMN.
 */
export class AnnotationNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this.icon = IconFactory.createAnnotation(true)
    this.minimumSize = new Size(30, 10)

    this.left = true
  }

  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Gets if the bracket of the open rectangle shall be on the left side.
   * @type {boolean}
   */
  get left() {
    return this.$left
  }

  /**
   * Sets if the bracket of the open rectangle shall be on the left side.
   * @type {boolean}
   */
  set left(value) {
    if (value !== this.$left) {
      this.modCount++
      this.$left = value
      this.icon = IconFactory.createAnnotation(value)
    }
  }
}

/**
 * An {@link ILabelStyle} implementation combining an text label, an icon and a connecting line between
 * the icon and the label owner.
 */
class ConnectedIconLabelStyle extends LabelStyleBase {
  constructor() {
    super()
    /** @type {ILabelModelParameter} */
    this.textPlacement = null

    /** @type {IPortLocationModelParameter} */
    this.labelConnectorLocation = null

    /** @type {IPortLocationModelParameter} */
    this.nodeConnectorLocation = null

    /** @type {Size} */
    this.iconSize = null

    /** @type {INodeStyle} */
    this.iconStyle = null

    /** @type {ILabelStyle} */
    this.textStyle = null

    /** @type {IEdgeStyle} */
    this.connectorStyle = null

    this.textBounds = null
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    return this.memberwiseClone()
  }

  /**
   * Creates a new visual for the label.
   * @param {IRenderContext} context The context that describes where the visual will be used.
   * @param {ILabel} label The label for which the visual is created.
   * @return {Visual} The visual to include in the canvas object visual tree. This may be
   *   <code>null</code>.
   * @see {@link IVisualCreator#updateVisual}
   * @see Specified by {@link IVisualCreator#createVisual}.
   */
  createVisual(context, label) {
    this.configure(label)
    const container = new SvgVisualGroup()

    /** @type {Visual} */
    let iconVisual
    if (this.iconStyle) {
      const labelAsNode = ConnectedIconLabelStyle.LABEL_AS_NODE
      iconVisual = this.iconStyle.renderer
        .getVisualCreator(labelAsNode, labelAsNode.style)
        .createVisual(context)
    }
    container.add(
      iconVisual || new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    )

    /** @type {Visual} */
    let textVisual
    if (this.textStyle && this.textPlacement) {
      const dummyTextLabel = ConnectedIconLabelStyle.DUMMY_TEXT_LABEL
      textVisual = this.textStyle.renderer
        .getVisualCreator(dummyTextLabel, dummyTextLabel.style)
        .createVisual(context)
    }
    container.add(
      textVisual || new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    )

    /** @type {Visual} */
    let connectorVisual
    if (this.connectorStyle) {
      const dummyEdge = ConnectedIconLabelStyle.DUMMY_EDGE
      connectorVisual = this.connectorStyle.renderer
        .getVisualCreator(dummyEdge, dummyEdge.style)
        .createVisual(context)
    }
    container.add(
      connectorVisual || new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    )

    return container
  }

  /**
   * Calculates the preferred size given the current state of the renderer.
   * @return {Size} The size as suggested by this renderer.
   */
  getPreferredSize() {
    if (!this.iconSize.equals(Size.ZERO)) {
      return this.iconSize
    }
    return this.item.preferredSize
  }

  /**
   * This method updates or replaces a previously created {@link Visual}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IVisualCreator#createVisual}. Implementation may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {IRenderContext} context The context that describes where the visual will be used in.
   * @param {Visual} oldVisual The visual instance that had been returned the last time the
   *   {@link IVisualCreator#createVisual} method was called on this instance.
   * @param {ILabel} label The label whose visual is updated.
   * @return {Visual} <code>oldVisual</code>, if this instance modified the visual, or a new visual that
   *   should replace the existing one in the canvas object visual tree.
   */
  updateVisual(context, oldVisual, label) {
    this.configure(label)
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container === null || container.children.size !== 3) {
      return this.createVisual(context)
    }

    const oldIconVisual = container.children.get(0)
    /** @type {Visual} */
    let newIconVisual = null
    if (this.iconStyle !== null) {
      const labelAsNode = ConnectedIconLabelStyle.LABEL_AS_NODE
      newIconVisual = this.iconStyle.renderer
        .getVisualCreator(labelAsNode, labelAsNode.style)
        .updateVisual(context, oldIconVisual)
    }
    if (oldIconVisual !== newIconVisual) {
      container.children.set(0, newIconVisual || new SvgVisualGroup())
    }

    const oldTextVisual = container.children.get(1)
    /** @type {Visual} */
    let newTextVisual = null
    if (this.textStyle !== null && this.textPlacement !== null) {
      const dummyTextLabel = ConnectedIconLabelStyle.DUMMY_TEXT_LABEL
      newTextVisual = this.textStyle.renderer
        .getVisualCreator(dummyTextLabel, dummyTextLabel.style)
        .updateVisual(context, oldTextVisual)
    }
    if (oldTextVisual !== newTextVisual) {
      container.children.set(1, newTextVisual || new SvgVisualGroup())
    }

    const oldConnectorVisual = container.children.get(2)
    /** @type {Visual} */
    let newConnectorVisual = null
    if (this.connectorStyle !== null) {
      const dummyEdge = ConnectedIconLabelStyle.DUMMY_EDGE
      newConnectorVisual = dummyEdge.style.renderer
        .getVisualCreator(dummyEdge, dummyEdge.style)
        .updateVisual(context, oldConnectorVisual)
    }
    if (oldConnectorVisual !== newConnectorVisual) {
      container.children.set(2, newConnectorVisual || new SvgVisualGroup())
    }

    return container
  }

  /**
   * Prepares this instance for subsequent calls after the style and item have been initialized.
   */
  configure(label) {
    ConnectedIconLabelStyle.LABEL_AS_NODE.style = this.iconStyle
    ConnectedIconLabelStyle.LABEL_AS_NODE.layout = label.layout.bounds

    if (INode.isInstance(label.owner)) {
      const nodeOwner = label.owner
      ConnectedIconLabelStyle.DUMMY_FOR_LABEL_OWNER.style = nodeOwner.style
      ConnectedIconLabelStyle.DUMMY_FOR_LABEL_OWNER.layout = nodeOwner.layout
    }

    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.style = this.textStyle
    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.layoutParameter = this.textPlacement
    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.text = label.text
    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.preferredSize = ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.style.renderer.getPreferredSize(
      ConnectedIconLabelStyle.DUMMY_TEXT_LABEL,
      ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.style
    )

    // Set source port to the port of the node using a dummy node that is located at the origin.
    ConnectedIconLabelStyle.DUMMY_EDGE.sourcePort.locationParameter = this.labelConnectorLocation
    ConnectedIconLabelStyle.DUMMY_EDGE.targetPort.locationParameter = this.nodeConnectorLocation
  }

  /**
   * Determines if something has been hit at the given coordinates
   * in the world coordinate system.
   * @param {Point} location the coordinates in world coordinate system
   * @param {ICanvasContext} context the context the hit test is performed in
   * @param {ILabel} label the label that might be hit.
   * @return {boolean} whether something has been hit
   * @see Specified by {@link IHitTestable#isHit}.
   */
  isHit(context, location, label) {
    this.configure(label)
    const dummyEdge = ConnectedIconLabelStyle.DUMMY_EDGE
    return (
      label.layout.containsWithEps(location, context.hitTestRadius) ||
      dummyEdge.style.renderer.getHitTestable(dummyEdge, dummyEdge.style).isHit(context, location)
    )
  }

  /**
   * This callback returns <code>true</code> if the corresponding
   * item is considered to intersect the given rectangular box.
   * This method may return <code>false</code> if the item cannot be
   * selected using a selection marquee or optionally if the
   * item is only partially contained within the box.
   * @param {Rect} box the box describing the marquee's bounds
   * @param {ICanvasContext} context the current canvas context
   * @param {ILabel} label the label.
   * @return {boolean} <code>true</code> if the item is considered to be captured by the marquee
   * @see Specified by {@link IMarqueeTestable#isInBox}.
   */
  isInBox(context, box, label) {
    this.configure(label)
    return box.intersects(this.boundingBox.getEnlarged(context.hitTestRadius))
  }

  /**
   * Returns a tight rectangular area where the whole rendering
   * would fit into.
   * If calculating the bounds is too expensive or the painting is not
   * bound to a certain area, this method may return {@link Rect#INFINITE}.
   * If nothing is painted, this method should return an empty rectangle, where
   * either or both the width and height is non-positive or
   * {@link Rect#EMPTY}.
   * @param {ICanvasContext} context the context to calculate the bounds for
   * @param {ILabel} label the label.
   * @return {Rect} the bounds or {@link Rect#EMPTY} to indicate an unbound area
   * @see Specified by {@link IBoundsProvider#getBounds}.
   */
  getBounds(context, label) {
    this.configure(label)
    const dummyEdge = ConnectedIconLabelStyle.DUMMY_EDGE
    return Rect.add(
      label.layout.bounds,
      dummyEdge.style.renderer.getBoundsProvider(dummyEdge, dummyEdge.style).getBounds(context)
    )
  }

  /**
   * Determines whether an element might intersect the visible region for a given context.
   * @param {Rect} clip The visible region clip.
   * @param {ICanvasContext} context The context to determine the visibility for.
   * @param {ILabel} label the label.
   * @return {boolean} <code>false</code> if and only if it is safe not to paint the element because
   * it would not affect the given clipping region.
   * @see Specified by {@link IVisibilityTestable#isVisible}.
   */
  isVisible(context, clip, label) {
    this.configure(label)
    // We're computing a (very generous) bounding box here because relying on GetBounds does not work.
    // The visibility test does not call Configure, which means we don't have the dummy edge set up yet.
    if (INode.isInstance(label.owner)) {
      const ownerNode = label.owner
      return clip.intersects(Rect.add(label.layout.bounds, ownerNode.layout.toRect()))
    }
    return clip.intersects(label.layout.bounds)
  }

  static get LABEL_AS_NODE() {
    return (
      ConnectedIconLabelStyle.$labelAsNode ||
      (ConnectedIconLabelStyle.$labelAsNode = new SimpleNode())
    )
  }

  static get DUMMY_TEXT_LABEL() {
    if (!ConnectedIconLabelStyle.$dummyTextLabel) {
      const simpleLabel = new SimpleLabel(
        ConnectedIconLabelStyle.LABEL_AS_NODE,
        '',
        FreeNodeLabelModel.INSTANCE.createDefaultParameter()
      )
      simpleLabel.style = new DefaultLabelStyle({
        horizontalTextAlignment: 'center',
        verticalTextAlignment: 'center'
      })
      ConnectedIconLabelStyle.$dummyTextLabel = simpleLabel
    }
    return ConnectedIconLabelStyle.$dummyTextLabel
  }

  static get DUMMY_FOR_LABEL_OWNER() {
    return (
      ConnectedIconLabelStyle.$dummyForLabelOwner ||
      (ConnectedIconLabelStyle.$dummyForLabelOwner = new SimpleNode())
    )
  }

  static get DUMMY_EDGE() {
    if (!ConnectedIconLabelStyle.$dummyEdge) {
      const sourcePort = new SimplePort(
        ConnectedIconLabelStyle.LABEL_AS_NODE,
        FreeNodePortLocationModel.NODE_CENTER_ANCHORED
      )
      const targetPort = new SimplePort(
        ConnectedIconLabelStyle.DUMMY_FOR_LABEL_OWNER,
        FreeNodePortLocationModel.NODE_CENTER_ANCHORED
      )
      const simpleEdge = new SimpleEdge(sourcePort, targetPort)
      const bpmnEdgeStyle = new BpmnEdgeStyle()
      bpmnEdgeStyle.type = EdgeType.ASSOCIATION
      simpleEdge.style = bpmnEdgeStyle
      ConnectedIconLabelStyle.$dummyEdge = simpleEdge
    }
    return ConnectedIconLabelStyle.$dummyEdge
  }
}

/**
 * A label style for annotations according to BPMN.
 */
export class AnnotationLabelStyle extends LabelStyleBase {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    const connectedIconLabelStyle = new ConnectedIconLabelStyle()
    connectedIconLabelStyle.iconStyle = AnnotationLabelStyle.LEFT_ANNOTATION_STYLE
    connectedIconLabelStyle.textStyle = AnnotationLabelStyle.TEXT_STYLE
    connectedIconLabelStyle.textPlacement = InteriorLabelModel.CENTER
    connectedIconLabelStyle.connectorStyle = AnnotationLabelStyle.CONNECTOR_STYLE
    connectedIconLabelStyle.labelConnectorLocation = FreeNodePortLocationModel.NODE_LEFT_ANCHORED
    connectedIconLabelStyle.nodeConnectorLocation = FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    this.$delegateStyle = connectedIconLabelStyle
    this.$insets = 5.0
  }

  /**
   * Gets the insets around the text.
   * @type {number}
   */
  get insets() {
    return this.$insets
  }

  /**
   * Sets the insets around the text.
   * @type {number}
   */
  set insets(value) {
    this.$insets = value
  }

  /**
   * @type {ConnectedIconLabelStyle}
   */
  get delegateStyle() {
    return this.$delegateStyle
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    const style = new AnnotationLabelStyle()
    style.$delegateStyle = this.$delegateStyle
    style.$insets = this.$insets
    return style
  }

  /**
   * @type {BpmnNodeStyle}
   */
  static get LEFT_ANNOTATION_STYLE() {
    if (!AnnotationLabelStyle.$leftAnnotationStyle) {
      AnnotationLabelStyle.$leftAnnotationStyle = new AnnotationNodeStyle()
      AnnotationLabelStyle.$leftAnnotationStyle.left = true
    }
    return AnnotationLabelStyle.$leftAnnotationStyle
  }

  /**
   * @type {BpmnNodeStyle}
   */
  static get RIGHT_ANNOTATION_STYLE() {
    if (!AnnotationLabelStyle.$rightAnnotationStyle) {
      AnnotationLabelStyle.$rightAnnotationStyle = new AnnotationNodeStyle()
      AnnotationLabelStyle.$rightAnnotationStyle.left = false
    }
    return AnnotationLabelStyle.$rightAnnotationStyle
  }

  static get CONNECTOR_STYLE() {
    if (!AnnotationLabelStyle.$connectorStyle) {
      const bpmnEdgeStyle = new BpmnEdgeStyle()
      bpmnEdgeStyle.type = EdgeType.ASSOCIATION
      AnnotationLabelStyle.$connectorStyle = bpmnEdgeStyle
    }
    return AnnotationLabelStyle.$connectorStyle
  }

  static get TEXT_STYLE() {
    return (
      AnnotationLabelStyle.$textStyle ||
      (AnnotationLabelStyle.$textStyle = new DefaultLabelStyle({
        horizontalTextAlignment: 'center',
        verticalTextAlignment: 'center'
      }))
    )
  }

  /** @return {ILabelStyle} */
  getCurrentStyle(item) {
    if (!INode.isInstance(item.owner)) {
      return VoidLabelStyle.INSTANCE
    }
    const nodeOwner = item.owner

    this.left = item.layout.orientedRectangleCenter.x > nodeOwner.layout.center.x

    const delegateStyle = this.delegateStyle
    delegateStyle.iconStyle = this.left
      ? AnnotationLabelStyle.LEFT_ANNOTATION_STYLE
      : AnnotationLabelStyle.RIGHT_ANNOTATION_STYLE
    delegateStyle.labelConnectorLocation = this.left
      ? FreeNodePortLocationModel.NODE_LEFT_ANCHORED
      : FreeNodePortLocationModel.NODE_RIGHT_ANCHORED
    return delegateStyle
  }

  /**
   * Returns the bounds of the visual for the label.
   * @param {ICanvasContext} context The rendering context.
   * @param {ILabel} label The label to provide the bounds for
   * @return {Rect} The bounds of the label.
   */
  getBounds(context, label) {
    const delegateStyle = this.getCurrentStyle(label)
    return delegateStyle.renderer.getBoundsProvider(label, delegateStyle).getBounds(context)
  }

  /**
   * Returns whether or not the label is currently visible.
   * @param {ICanvasContext} context The rendering context.
   * @param {Rect} rectangle The clipping rectangle.
   * @param {ILabel} label The label.
   * @return {boolean} Whether or not the label is currently visible.
   */
  isVisible(context, rectangle, label) {
    const delegateStyle = this.getCurrentStyle(label)
    return delegateStyle.renderer
      .getVisibilityTestable(label, delegateStyle)
      .isVisible(context, rectangle)
  }

  /**
   * Returns whether or not the given location lies inside the label.
   * @param {IInputModeContext} context The input mode context.
   * @param {Point} location The location to check.
   * @param {ILabel} label The label.
   * @return {boolean}
   * @see {@link ILabelStyleRenderer#getHitTestable}.
   */
  isHit(context, location, label) {
    const delegateStyle = this.getCurrentStyle(label)
    return delegateStyle.renderer.getHitTestable(label, delegateStyle).isHit(context, location)
  }

  /**
   * Calculates the {@link ILabel#preferredSize preferred size}
   * of a given label using the associated style.
   * @param {ILabel} label The label to determine the preferred size for.
   * @return {Size} A size that can be used as the {@link ILabel#preferredSize}.
   */
  getPreferredSize(label) {
    const preferredTextSize = AnnotationLabelStyle.TEXT_STYLE.renderer.getPreferredSize(
      label,
      AnnotationLabelStyle.TEXT_STYLE
    )
    return new Size(
      2 * this.insets + preferredTextSize.width,
      2 * this.insets + preferredTextSize.height
    )
  }

  /**
   * This method is called by the framework to create a {@link Visual}
   * that will be included into the {@link IRenderContext}.
   * {@link CanvasComponent} uses this interface through the {@link ICanvasObjectDescriptor}
   * to populate the visual canvas object tree.
   * @param {IRenderContext} context The context that describes where the visual will be used.
   * @param {ILabel} label The label.
   * @return {Visual} The visual to include in the canvas object visual tree. This may be
   *   <code>null</code>.
   * @see {@link IVisualCreator#updateVisual}
   * @see Specified by {@link IVisualCreator#createVisual}.
   */
  createVisual(context, label) {
    const container = new SvgVisualGroup()
    const delegateStyle = this.getCurrentStyle(label)
    container.add(
      delegateStyle.renderer.getVisualCreator(label, delegateStyle).createVisual(context)
    )
    container['render-data-cache'] = this.createRenderData()

    return container
  }

  /**
   * This method updates or replaces a previously created {@link Visual} for inclusion
   * in the {@link IRenderContext}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IVisualCreator#createVisual}. Implementation may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {IRenderContext} context The context that describes where the visual will be used in.
   * @param {Visual} oldVisual The visual instance that had been returned the last time the
   *   {@link IVisualCreator#createVisual} method was called on this instance.
   * @param {ILabel} label The label.
   * @return {Visual} <code>oldVisual</code>, if this instance modified the visual, or a new visual that
   *   should replace the existing one in the canvas object visual tree.
   * @see {@link IVisualCreator#createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator#updateVisual}.
   */
  updateVisual(context, oldVisual, label) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    const cache = container['render-data-cache']
    const delegateStyle = this.getCurrentStyle(label, label.Style)
    const newCache = this.createRenderData()
    if (cache === null || !cache.equals(cache, newCache) || container.children.size !== 1) {
      return this.createVisual(context, label)
    }
    const oldDelegateVisual = container.children.get(0)
    const newDelegateVisual = delegateStyle.renderer
      .getVisualCreator(label, delegateStyle)
      .updateVisual(context, oldDelegateVisual)
    if (oldDelegateVisual !== newDelegateVisual) {
      container.children.set(0, newDelegateVisual)
    }
    container['render-data-cache'] = newCache
    return container
  }

  /**
   * @return {Object}
   */
  createRenderData() {
    return {
      left: this.left,
      insets: this.insets,
      equals: (self, other) => self.left === other.left && self.insets === other.insets
    }
  }
}

/**
 * Helper class that can be used as StyleTag to bundle common visualization parameters for stripes.
 */
export class StripeDescriptor {
  constructor() {
    this.$backgroundFill = Fill.TRANSPARENT
    this.$insetFill = Fill.TRANSPARENT
    this.$borderFill = Fill.BLACK
    this.$borderThickness = new Insets(1)
  }

  /**
   * The background fill for a stripe.
   * @type {Fill}
   */
  get backgroundFill() {
    return this.$backgroundFill
  }

  /**
   * The background fill for a stripe.
   * @type {Fill}
   */
  set backgroundFill(value) {
    this.$backgroundFill = value
  }

  /**
   * The inset fill for a stripe.
   * @type {Fill}
   */
  get insetFill() {
    return this.$insetFill
  }

  /**
   * The inset fill for a stripe.
   * @type {Fill}
   */
  set insetFill(value) {
    this.$insetFill = value
  }

  /**
   * The border fill for a stripe.
   * @type {Fill}
   */
  get borderFill() {
    return this.$borderFill
  }

  /**
   * The border fill for a stripe.
   * @type {Fill}
   */
  set borderFill(value) {
    this.$borderFill = value
  }

  /**
   * The border thickness for a stripe.
   * @type {Insets}
   */
  get borderThickness() {
    return this.$borderThickness
  }

  /**
   * The border thickness for a stripe.
   * @type {Insets}
   */
  set borderThickness(value) {
    this.$borderThickness = value
  }

  /** @return {boolean} */
  equals(obj) {
    if (!(obj instanceof StripeDescriptor)) {
      return false
    }
    return (
      obj.$backgroundFill.equals(this.$backgroundFill) &&
      obj.$insetFill.equals(this.$insetFill) &&
      obj.$borderFill.equals(this.$borderFill) &&
      obj.$borderThickness.equals(this.$borderThickness)
    )
  }

  /** @return {number} */
  hashCode() {
    let result = this.$backgroundFill !== null ? this.$backgroundFill.hashCode() : 0
    result = (result * 397) ^ (this.$insetFill !== null ? this.$insetFill.hashCode() : 0)
    result = (result * 397) ^ (this.$borderFill !== null ? this.$borderFill.hashCode() : 0)
    result = (result * 397) ^ this.$borderThickness.hashCode()
    return result
  }
}

const multipleIcon = IconFactory.createLoopCharacteristic(LoopCharacteristic.PARALLEL)
const POOL_NODE_STYLE_MULTIPLE_INSTANCE_ICON = new PlacedIcon(
  multipleIcon,
  BPMN_CONSTANTS_PLACEMENTS_POOL_NODE_MARKER,
  BPMN_CONSTANTS_SIZES_MARKER
)

/**
 * An {@link INodeStyle} implementation representing a Pool according to the BPMN.
 * The main visualization is delegated to {@link PoolNodeStyle#tableNodeStyle}.
 */
export class PoolNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance for an oriented pool.
   * @param {boolean} vertical Whether or not the style represents a vertical pool.
   */
  constructor(vertical) {
    super()
    this.$vertical = vertical
    this.$multipleInstance = false
    this.$tableNodeStyle = null
  }

  /**
   * Gets whether or not this pool represents a multiple instance participant.
   * @type {boolean}
   */
  get multipleInstance() {
    return this.$multipleInstance
  }

  /**
   * Sets whether or not this pool represents a multiple instance participant.
   * @type {boolean}
   */
  set multipleInstance(value) {
    this.$multipleInstance = value
  }

  /**
   * Gets the {@link TableNodeStyle} the visualization is delegated to.
   * @type {TableNodeStyle}
   */
  get tableNodeStyle() {
    if (!this.$tableNodeStyle) {
      this.$tableNodeStyle = createDefaultTableNodeStyle(this.$vertical)
    }
    return this.$tableNodeStyle
  }

  /**
   * Sets the {@link TableNodeStyle} the visualization is delegated to.
   * @type {TableNodeStyle}
   */
  set tableNodeStyle(value) {
    this.$tableNodeStyle = value
  }

  /**
   * This method is called by the framework to create a {@link Visual}
   * that will be included into the {@link IRenderContext}.
   * {@link CanvasComponent} uses this interface through the {@link ICanvasObjectDescriptor}
   * to populate the visual canvas object tree.
   * @param {IRenderContext} renderContext The context that describes where the visual will be used.
   * @param {INpde} node The node.
   * @return {Visual} The visual to include in the canvas object visual tree. This may be
   *   <code>null</code>.
   * @see {@link IVisualCreator#updateVisual}
   * @see Specified by {@link IVisualCreator#createVisual}.
   */
  createVisual(renderContext, node) {
    const container = new SvgVisualGroup()
    container.add(
      this.tableNodeStyle.renderer
        .getVisualCreator(node, this.tableNodeStyle)
        .createVisual(renderContext)
    )
    if (this.multipleInstance) {
      POOL_NODE_STYLE_MULTIPLE_INSTANCE_ICON.setBounds(node.layout)
      container.add(POOL_NODE_STYLE_MULTIPLE_INSTANCE_ICON.createVisual(renderContext))
    }
    return container
  }

  /**
   * This method updates or replaces a previously created {@link Visual} for inclusion
   * in the {@link IRenderContext}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IVisualCreator#createVisual}. Implementation may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {IRenderContext} renderContext The context that describes where the visual will be used in.
   * @param {Visual} oldVisual The visual instance that had been returned the last time the
   *   {@link IVisualCreator#createVisual} method was called on this instance.
   * @param {INode} node The node
   * @return {Visual} <code>oldVisual</code>, if this instance modified the visual, or a new visual that
   *   should replace the existing one in the canvas object visual tree.
   * @see {@link IVisualCreator#createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator#updateVisual}.
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container === null || container.children.size === 0) {
      return this.createVisual(renderContext, node)
    }

    const oldTableVisual = container.children.first()
    const newTableVisual = this.tableNodeStyle.renderer
      .getVisualCreator(node, this.tableNodeStyle)
      .updateVisual(renderContext, oldTableVisual)
    if (oldTableVisual !== newTableVisual) {
      container.children.remove(oldTableVisual)
      container.children.insert(0, newTableVisual)
    }

    const oldMultipleVisual = container.children.size > 1 ? container.children.last() : null
    if (this.multipleInstance) {
      POOL_NODE_STYLE_MULTIPLE_INSTANCE_ICON.setBounds(node.layout)
      const newMultipleVisual = POOL_NODE_STYLE_MULTIPLE_INSTANCE_ICON.updateVisual(
        renderContext,
        oldMultipleVisual
      )
      if (oldMultipleVisual !== newMultipleVisual) {
        if (oldMultipleVisual !== null) {
          container.children.remove(oldMultipleVisual)
        }
        container.add(newMultipleVisual)
      }
    } else if (oldMultipleVisual !== null) {
      // there has been a multipleInstance icon before
      container.children.remove(oldMultipleVisual)
    }
    return container
  }

  /**
   * Returns an instance that implements the given type or <code>null</code>.
   * @param {INode} node the node
   * @param {Class} type the type for which an instance shall be returned
   * @return {Object} an instance that is assignable to type or <code>null</code>
   * @see Specified by {@link ILookup#lookup}.
   */
  lookup(node, type) {
    if (type === IEditLabelHelper.$class) {
      return new PoolNodeEditLabelHelper(node, this)
    }

    const context = this.tableNodeStyle.renderer.getContext(node, this.tableNodeStyle)
    if (context) {
      const value = context.lookup(type)
      if (value) {
        return value
      }
    }

    return super.lookup(node, type)
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    const clone = new PoolNodeStyle()
    clone.multipleInstance = this.multipleInstance
    clone.tableNodeStyle = this.tableNodeStyle.clone()
    return clone
  }
}

class PoolNodeEditLabelHelper extends EditLabelHelper {
  constructor(node, style) {
    super(node)
    this.style = style
  }

  /** @return {ILabelModelParameter} */
  getLabelParameter(inputModeContext) {
    if (this.style.tableNodeStyle.tableRenderingOrder === TableRenderingOrder.COLUMNS_FIRST) {
      return PoolHeaderLabelModel.NORTH
    }
    return PoolHeaderLabelModel.WEST
  }
}

/**
 * Creates a {@link TableNodeStyle} that is used in {@link PoolNodeStyle}.
 * @return {TableNodeStyle}
 */
function createDefaultTableNodeStyle(vertical) {
  // create a new table
  const table = new Table()
  const tableNodeStyle = new TableNodeStyle()

  // we'd like to use a special stripe style
  const alternatingLeafStripeStyle = new AlternatingLeafStripeStyle()
  const stripeDescriptor1 = new StripeDescriptor()
  stripeDescriptor1.backgroundFill = BPMN_CONSTANTS_FILLS_POOL_NODE_EVEN_LEAF_BACKGROUND
  stripeDescriptor1.insetFill = BPMN_CONSTANTS_FILLS_POOL_NODE_EVEN_LEAF_INSET
  alternatingLeafStripeStyle.evenLeafDescriptor = stripeDescriptor1
  const stripeDescriptor2 = new StripeDescriptor()
  stripeDescriptor2.backgroundFill = BPMN_CONSTANTS_FILLS_POOL_NODE_ODD_LEAF_BACKGROUND
  stripeDescriptor2.insetFill = BPMN_CONSTANTS_FILLS_POOL_NODE_ODD_LEAF_INSET
  alternatingLeafStripeStyle.oddLeafDescriptor = stripeDescriptor2
  const stripeDescriptor3 = new StripeDescriptor()
  stripeDescriptor3.backgroundFill = BPMN_CONSTANTS_FILLS_POOL_NODE_PARENT_BACKGROUND
  stripeDescriptor3.insetFill = BPMN_CONSTANTS_FILLS_POOL_NODE_PARENT_INSET
  alternatingLeafStripeStyle.parentDescriptor = stripeDescriptor3

  if (vertical) {
    table.insets = new Insets(0, 20, 0, 0)

    // set the column defaults
    table.columnDefaults.insets = new Insets(0, 20, 0, 0)
    table.columnDefaults.labels.style = new DefaultLabelStyle({
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center'
    })

    table.columnDefaults.labels.layoutParameter = StretchStripeLabelModel.NORTH
    table.columnDefaults.style = alternatingLeafStripeStyle
    table.columnDefaults.minimumSize = 50
    tableNodeStyle.tableRenderingOrder = TableRenderingOrder.COLUMNS_FIRST
  } else {
    table.insets = new Insets(20, 0, 0, 0)

    // set the row defaults
    table.rowDefaults.insets = new Insets(20, 0, 0, 0)
    table.rowDefaults.labels.style = new DefaultLabelStyle({
      horizontalTextAlignment: 'center',
      verticalTextAlignment: 'center'
    })

    table.rowDefaults.labels.layoutParameter = StretchStripeLabelModel.WEST
    table.rowDefaults.style = alternatingLeafStripeStyle
    table.rowDefaults.minimumSize = 50
    tableNodeStyle.tableRenderingOrder = TableRenderingOrder.ROWS_FIRST
  }

  const shapeNodeStyle = new ShapeNodeStyle()
  shapeNodeStyle.fill = BPMN_CONSTANTS_FILLS_POOL_NODE_BACKGROUND
  tableNodeStyle.backgroundStyle = shapeNodeStyle

  tableNodeStyle.table = table
  return tableNodeStyle
}

/**
 * A label model for nodes using a {@link PoolNodeStyle} that position labels inside the
 * {@link ITable#insets table insets}.
 */
export class PoolHeaderLabelModel extends BaseClass(ILabelModel, ILabelModelParameterProvider) {
  /**
   * Returns an instance that implements the given type or <code>null</code>.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-<code>null</code> implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {Class} type the type for which an instance shall be returned
   * @return {Object} an instance that is assignable to type or <code>null</code>
   * @see Specified by {@link ILookup#lookup}.
   */
  lookup(type) {
    if (type === ILabelModelParameterProvider.$class) {
      return this
    }
    if (type === ILabelModelParameterFinder.$class) {
      return DefaultLabelModelParameterFinder.INSTANCE
    }
    if (type === ILabelCandidateDescriptorProvider.$class) {
      return ConstantLabelCandidateDescriptorProvider.INTERNAL_DESCRIPTOR_PROVIDER
    }
    return null
  }

  /**
   * Calculates the geometry in form of an {@link IOrientedRectangle}
   * for a given label using the given model parameter.
   * @param {ILabelModelParameter} parameter A parameter that has been created by this model.
   * This is typically the parameter that yielded this instance through its
   * {@link ILabelModelParameter#model} property.
   * @param {ILabel} label the label to calculate the geometry for
   * @return {IOrientedRectangle} An instance that describes the geometry. This is typically
   * an instance designed as a flyweight, so clients should not cache the
   * instance but store the values if they need a snapshot for later use
   * @see Specified by {@link ILabelModel#getGeometry}.
   */
  getGeometry(label, parameter) {
    const php = parameter instanceof PoolHeaderLabelModelParameter ? parameter : null
    const owner = label.owner
    if (php === null || owner === null) {
      return null
    }

    const table = owner.lookup(ITable.$class)
    const insets = !table.insets.equals(Insets.EMPTY) ? table.insets : Insets.EMPTY

    const orientedRectangle = new OrientedRectangle()
    orientedRectangle.resize(label.preferredSize.width, label.preferredSize.height)
    switch (php.side) {
      case 0:
        // North
        orientedRectangle.setUpVector(0, -1)
        orientedRectangle.setCenter(
          new Point(owner.layout.x + owner.layout.width * 0.5, owner.layout.y + insets.top * 0.5)
        )
        break
      case 1:
        // East
        orientedRectangle.setUpVector(1, 0)
        orientedRectangle.setCenter(
          new Point(
            owner.layout.maxX - insets.right * 0.5,
            owner.layout.y + owner.layout.height * 0.5
          )
        )
        break
      case 2:
        // South
        orientedRectangle.setUpVector(0, -1)
        orientedRectangle.setCenter(
          new Point(
            owner.layout.x + owner.layout.width * 0.5,
            owner.layout.maxY - insets.bottom * 0.5
          )
        )
        break
      case 3:
      default:
        // West
        orientedRectangle.setUpVector(-1, 0)
        orientedRectangle.setCenter(
          new Point(owner.layout.x + insets.left * 0.5, owner.layout.y + owner.layout.height * 0.5)
        )
        break
    }

    return orientedRectangle
  }

  /**
   * Creates a default parameter that can be used for this model.
   * @return {ILabelModelParameter} a parameter for this model instance
   * @see Specified by {@link ILabelModel#createDefaultParameter}.
   */
  createDefaultParameter() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_WEST
  }

  /**
   * Provides a {@link ILookup lookup context} for the given combination of label
   * and parameter.
   * @param {ILabel} label The label to use in the context.
   * @param {ILabelModelParameter} parameter The parameter to use for the label in the context.
   * @return {ILookup} An implementation of the {@link ILookup} interface that can be used
   *   to query additional aspects of the label/parameter combination.
   * @see {@link ILookup#EMPTY}
   * @see Specified by {@link ILabelModel#getContext}.
   */
  getContext(label, parameter) {
    return ILookup.EMPTY
  }

  /**
   * Returns an enumerator over a set of possible {@link ILabelModelParameter}
   * instances that can be used for the given label and model.
   * @param {ILabel} label The label instance to use.
   * @param {ILabelModel} model The model to provide parameters for.
   * @return {IEnumerable.<ILabelModelParameter>} A possibly empty enumerator over a
   *   set of label model parameters.
   * @see Specified by {@link ILabelModelParameterProvider#getParameters}.
   */
  getParameters(label, model) {
    return POOL_HEADER_LABEL_MODEL_PARAMETERS
  }

  /** @return {PoolHeaderLabelModelParameter} */
  static get NORTH() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_NORTH
  }

  /** @return {PoolHeaderLabelModelParameter} */
  static get EAST() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_EAST
  }

  /** @return {PoolHeaderLabelModelParameter} */
  static get SOUTH() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_SOUTH
  }

  /** @return {PoolHeaderLabelModelParameter} */
  static get WEST() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_WEST
  }

  /** @return {PoolHeaderLabelModelParameter} */
  static get INSTANCE() {
    return (
      PoolHeaderLabelModel.$instance ||
      (PoolHeaderLabelModel.$instance = new PoolHeaderLabelModel())
    )
  }
}

const PoolHeaderLabelModelParameter = Class('PoolHeaderLabelModelParameter', {
  $meta() {
    return [
      GraphMLAttribute().init({ singletonContainers: [PoolHeaderLabelModelExtension.$class] })
    ]
  },

  $with: [ILabelModelParameter],

  constructor: function(side) {
    // eslint-disable-line
    this.$side = side
  },

  /**
   * @type {number}
   */
  $side: 0,

  /** @type {number} */
  side: {
    get() {
      return this.$side
    }
  },

  /** @return {Object} */
  clone() {
    return this
  },

  /** @type {ILabelModel} */
  model: {
    get() {
      return PoolHeaderLabelModel.INSTANCE
    }
  },

  /** @return {boolean} */
  supports(label) {
    return label.owner.lookup(ITable.$class) !== null
  }
})

const POOL_HEADER_LABEL_MODEL_PARAMETER_NORTH = new PoolHeaderLabelModelParameter(0)
const POOL_HEADER_LABEL_MODEL_PARAMETER_EAST = new PoolHeaderLabelModelParameter(1)
const POOL_HEADER_LABEL_MODEL_PARAMETER_SOUTH = new PoolHeaderLabelModelParameter(2)
const POOL_HEADER_LABEL_MODEL_PARAMETER_WEST = new PoolHeaderLabelModelParameter(3)
const POOL_HEADER_LABEL_MODEL_PARAMETERS = List.fromArray([
  POOL_HEADER_LABEL_MODEL_PARAMETER_NORTH,
  POOL_HEADER_LABEL_MODEL_PARAMETER_EAST,
  POOL_HEADER_LABEL_MODEL_PARAMETER_SOUTH,
  POOL_HEADER_LABEL_MODEL_PARAMETER_WEST
])

/**
 * An {@link IArrow} implementation using an {@link Icon} for the visualization.
 */
class IconArrow extends BaseClass(IArrow, IVisualCreator, IBoundsProvider) {
  constructor(icon) {
    super()
    this.anchor = Point.ORIGIN
    this.direction = Point.ORIGIN
    this.icon = icon
    this.$length = 0
    this.$cropLength = 0
    this.bounds = null
  }

  /**
   * Returns the length of the arrow, i.e. the distance from the arrow's tip to
   * the position where the visual representation of the edge's path should begin.
   * @see Specified by {@link IArrow#length}.
   * @type {number}
   */
  get length() {
    return this.$length
  }

  /**
   * Sets the length of the arrow, i.e. the distance from the arrow's tip to
   * the position where the visual representation of the edge's path should begin.
   * @see Specified by {@link IArrow#length}.
   * @type {number}
   */
  set length(value) {
    this.$length = value
  }

  /**
   * Gets the cropping length associated with this instance.
   * This value is used by {@link IEdgeStyle}s to let the
   * edge appear to end shortly before its actual target.
   * @see Specified by {@link IArrow#cropLength}.
   * @type {number}
   */
  get cropLength() {
    return this.$cropLength
  }

  /**
   * Sets the cropping length associated with this instance.
   * This value is used by {@link IEdgeStyle}s to let the
   * edge appear to end shortly before its actual target.
   * @see Specified by {@link IArrow#cropLength}.
   * @type {number}
   */
  set cropLength(value) {
    this.$cropLength = value
  }

  /**
   * Gets an {@link IVisualCreator} implementation that will create
   * the  for this arrow
   * at the given location using the given direction for the given edge.
   * @param {IEdge} edge the edge this arrow belongs to
   * @param {boolean} atSource whether this will be the source arrow
   * @param {Point} anchor the anchor point for the tip of the arrow
   * @param {Point} direction the direction the arrow is pointing in
   * @return {IVisualCreator} Itself as a flyweight.
   * @see Specified by {@link IArrow#getPaintable}.
   */
  getPaintable(edge, atSource, anchor, direction) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * Gets an {@link IBoundsProvider} implementation that can yield
   * this arrow's bounds if painted at the given location using the
   * given direction for the given edge.
   * @param {IEdge} edge the edge this arrow belongs to
   * @param {boolean} atSource whether this will be the source arrow
   * @param {Point} anchor the anchor point for the tip of the arrow
   * @param {Point} direction the direction the arrow is pointing in
   * @return {IBoundsProvider} an implementation of the {@link IBoundsProvider} interface
   *   that can subsequently be used to query the bounds. Clients will always call this method before using the
   *   implementation and may not cache the instance returned. This allows for applying the flyweight design pattern
   *   to implementations.
   * @see Specified by {@link IArrow#getBoundsProvider}.
   */
  getBoundsProvider(edge, atSource, anchor, direction) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  getVisualCreator(edge, atSource, anchor, direction) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * This method is called by the framework to create a
   * that will be included into the {@link IRenderContext}.
   * @param {IRenderContext} context The context that describes where the visual will be used.
   * @return {Visual} The arrow visual to include in the canvas object visual tree.
   * @see {@link IconArrow#updateVisual}
   * @see Specified by {@link IVisualCreator#createVisual}.
   */
  createVisual(context) {
    this.icon.setBounds(
      new Rect(-this.bounds.width, -this.bounds.height / 2, this.bounds.width, this.bounds.height)
    )
    const canvasContainer = new SvgVisualGroup()
    canvasContainer.add(this.icon.createVisual(context))

    // Rotate arrow and move it to correct position
    canvasContainer.transform = new Matrix(
      this.direction.x,
      -this.direction.y,
      this.direction.y,
      this.direction.x,
      this.anchor.x,
      this.anchor.y
    )

    return canvasContainer
  }

  /**
   * This method updates or replaces a previously created  for inclusion
   * in the {@link IRenderContext}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IconArrow#createVisual}. Implementation may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {IRenderContext} context The context that describes where the visual will be used in.
   * @param {Visual} oldVisual The visual instance that had been returned the last time the
   *   {@link IconArrow#createVisual} method was called on this instance.
   * @return {Visual} the old visual if this instance modified the visual, or a new visual that should
   *   replace the existing one in the canvas object visual tree.
   * @see {@link IconArrow#createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator#updateVisual}.
   */
  updateVisual(context, oldVisual) {
    const p = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (p !== null) {
      p.transform = new Matrix(
        this.direction.x,
        -this.direction.y,
        +this.direction.y,
        this.direction.x,
        this.anchor.x,
        this.anchor.y
      )
      return p
    }
    return this.createVisual(context)
  }

  /**
   * Returns the bounds of the arrow for the current flyweight configuration.
   * @see Specified by {@link IBoundsProvider#getBounds}.
   * @return {Rect}
   */
  getBounds(context) {
    return new Rect(
      this.anchor.x - this.bounds.width,
      this.anchor.y - this.bounds.height * 0.5,
      this.bounds.width,
      this.bounds.height
    )
  }
}

/**
 * An {@link ILabelStyle} implementation representing a Message according to the BPMN.
 */
export class MessageLabelStyle extends LabelStyleBase {
  createVisual(context, label) {
    return MessageLabelStyle.ADAPTER.renderer
      .getVisualCreator(label, MessageLabelStyle.ADAPTER)
      .createVisual(context)
  }

  updateVisual(context, oldVisual, label) {
    return MessageLabelStyle.ADAPTER.renderer
      .getVisualCreator(label, MessageLabelStyle.ADAPTER)
      .updateVisual(context, oldVisual)
  }

  getBounds(context, label) {
    return MessageLabelStyle.ADAPTER.renderer
      .getBoundsProvider(label, MessageLabelStyle.ADAPTER)
      .getBounds(context)
  }

  isVisible(context, rectangle, label) {
    return MessageLabelStyle.ADAPTER.renderer
      .getVisibilityTestable(label, MessageLabelStyle.ADAPTER)
      .isVisible(context, rectangle)
  }

  isHit(context, location, label) {
    return MessageLabelStyle.ADAPTER.renderer
      .getHitTestable(label, MessageLabelStyle.ADAPTER)
      .isHit(context, location)
  }

  lookup(label, type) {
    return MessageLabelStyle.ADAPTER.renderer
      .getContext(label, MessageLabelStyle.ADAPTER)
      .lookup(type)
  }

  getPreferredSize(label) {
    return MessageLabelStyle.ADAPTER.renderer.getPreferredSize(label, MessageLabelStyle.ADAPTER)
  }

  static get ADAPTER() {
    if (!MessageLabelStyle.$adapter) {
      const messageIcon = IconFactory.createMessage(
        BPMN_CONSTANTS_STROKES_MESSAGE,
        BPMN_CONSTANTS_FILLS_MESSAGE
      )
      const bpmnNodeStyle = new BpmnNodeStyle()
      bpmnNodeStyle.icon = messageIcon
      bpmnNodeStyle.minimumSize = BPMN_CONSTANTS_SIZES_MESSAGE
      const labelStyle = new DefaultLabelStyle({
        horizontalTextAlignment: 'center',
        verticalTextAlignment: 'center'
      })
      MessageLabelStyle.$adapter = new NodeStyleLabelStyleAdapter(bpmnNodeStyle, labelStyle)
    }
    return MessageLabelStyle.$adapter
  }
}

/**
 * An {@link INodeStyle} implementation representing a Data Store according to the BPMN.
 */
export class DataStoreNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this.icon = IconFactory.createDataStore()
    this.minimumSize = new Size(30, 20)
  }

  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields <code>null</code> to indicate that
   * the {@link INode#layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase#isInside}
   * and {@link NodeStyleBase#getIntersection} since the default implementations delegate to it.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {GeneralPath} The outline of the visual representation or <code>null</code>.
   */
  getOutline(node) {
    const halfEllipseHeight = 0.125
    const path = new GeneralPath()

    path.moveTo(0, halfEllipseHeight)
    path.lineTo(0, 1 - halfEllipseHeight)
    path.cubicTo(0, 1, 1, 1, 1, 1 - halfEllipseHeight)
    path.lineTo(1, halfEllipseHeight)
    path.cubicTo(1, 0, 0, 0, 0, halfEllipseHeight)
    path.close()

    const transform = new Matrix()
    transform.translate(node.layout.topLeft)
    transform.scale(node.layout.width, node.layout.height)
    path.transform(transform)
    return path
  }
}

/**
 * An {@link INodeStyle} implementation representing a Data Object according to the BPMN.
 */
export class DataObjectNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this.minimumSize = new Size(25, 30)
    this.$collection = false
    this.typeIcon = null
    this.type = DataObjectType.NONE
  }

  /**
   * Gets whether this is a Collection Data Object.
   * @type {boolean}
   */
  get collection() {
    return this.$collection
  }

  /**
   * Sets whether this is a Collection Data Object.
   * @type {boolean}
   */
  set collection(value) {
    if (this.$collection !== value) {
      this.modCount++
      this.$collection = value
    }
  }

  /**
   * Gets the data object type for this style.
   * @type {DataObjectType}
   */
  get type() {
    return this.$type
  }

  /**
   * Sets the data object type for this style.
   * @type {DataObjectType}
   */
  set type(value) {
    if (this.$type !== value) {
      this.modCount++
      this.$type = value
      this.typeIcon = IconFactory.createDataObjectType(value)
      if (this.typeIcon) {
        this.typeIcon = IconFactory.createPlacedIcon(
          this.typeIcon,
          BPMN_CONSTANTS_PLACEMENTS_DATA_OBJECT_TYPE,
          BPMN_CONSTANTS_SIZES_DATA_OBJECT_TYPE
        )
      }
    }
  }

  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Updates the {@link BpmnNodeStyle#icon}.
   * This method is called by {@link BpmnNodeStyle#createVisual}.
   */
  updateIcon() {
    const icons = new List()
    icons.add(DataObjectNodeStyle.DATA_ICON)

    if (this.collection) {
      icons.add(DataObjectNodeStyle.COLLECTION_ICON)
    }
    if (this.typeIcon !== null) {
      icons.add(this.typeIcon)
    }
    if (icons.size > 1) {
      this.icon = IconFactory.createCombinedIcon(icons)
    } else {
      this.icon = DataObjectNodeStyle.DATA_ICON
    }
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields <code>null</code> to indicate that
   * the {@link INode#layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase#isInside}
   * and {@link NodeStyleBase#getIntersection} since the default implementations delegate to it.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {GeneralPath} The outline of the visual representation or <code>null</code>.
   */
  getOutline(node) {
    const cornerSize = Math.min(node.layout.width, node.layout.height) * 0.4

    const path = new GeneralPath()
    path.moveTo(0, 0)
    path.lineTo(node.layout.width - cornerSize, 0)
    path.lineTo(node.layout.width, cornerSize)
    path.lineTo(node.layout.width, node.layout.height)
    path.lineTo(0, node.layout.height)
    path.close()

    const transform = new Matrix()
    transform.translate(node.layout.topLeft)
    path.transform(transform)
    return path
  }

  static get DATA_ICON() {
    return (
      DataObjectNodeStyle.$dataIcon ||
      (DataObjectNodeStyle.$dataIcon = IconFactory.createDataObject())
    )
  }

  static get COLLECTION_ICON() {
    return (
      DataObjectNodeStyle.$collectionIcon ||
      (DataObjectNodeStyle.$collectionIcon = IconFactory.createPlacedIcon(
        IconFactory.createLoopCharacteristic(LoopCharacteristic.PARALLEL),
        BPMN_CONSTANTS_PLACEMENTS_DATA_OBJECT_MARKER,
        BPMN_CONSTANTS_SIZES_MARKER
      ))
    )
  }
}

/**
 * An {@link INodeStyle} implementation representing a Conversation according to the BPMN.
 */
export class ConversationNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this.$type = -1
    this.type = ConversationType.CONVERSATION
    this.minimumSize = BPMN_CONSTANTS_SIZES_CONVERSATION
  }

  /**
   * Gets the conversation type for this style.
   * @type {ConversationType}
   */
  get type() {
    return this.$type
  }

  /**
   * Sets the conversation type for this style.
   * @type {ConversationType}
   */
  set type(value) {
    if (this.$type !== value || !this.icon) {
      this.modCount++
      this.$type = value

      let typeIcon = IconFactory.createConversation(this.$type)
      let markerIcon = IconFactory.createConversationMarker(this.$type)

      if (markerIcon) {
        markerIcon = IconFactory.createPlacedIcon(
          markerIcon,
          BPMN_CONSTANTS_PLACEMENTS_CONVERSATION_MARKER,
          BPMN_CONSTANTS_SIZES_MARKER
        )
        typeIcon = IconFactory.createCombinedIcon(List.fromArray([typeIcon, markerIcon]))
      }

      this.icon = IconFactory.createPlacedIcon(
        typeIcon,
        BPMN_CONSTANTS_PLACEMENTS_CONVERSATION,
        BPMN_CONSTANTS_SIZES_CONVERSATION
      )
    }
  }

  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields <code>null</code> to indicate that
   * the {@link INode#layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase#isInside}
   * and {@link NodeStyleBase#getIntersection} since the default implementations delegate to it.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {GeneralPath} The outline of the visual representation or <code>null</code>.
   */
  getOutline(node) {
    const width = Math.min(
      node.layout.width,
      node.layout.height / BPMN_CONSTANTS_SIZES_CONVERSATION_WIDTH_HEIGHT_RATIO
    )
    const height = width * BPMN_CONSTANTS_SIZES_CONVERSATION_WIDTH_HEIGHT_RATIO
    const bounds = new Rect(
      node.layout.center.x - width * 0.5,
      node.layout.center.y - height * 0.5,
      width,
      height
    )
    const path = new GeneralPath()
    path.moveTo(0, 0.5)
    path.lineTo(0.25, 0)
    path.lineTo(0.75, 0)
    path.lineTo(1, 0.5)
    path.lineTo(0.75, 1)
    path.lineTo(0.25, 1)
    path.close()

    const transform = new Matrix()
    transform.translate(bounds.topLeft)
    transform.scale(bounds.width, bounds.height)
    path.transform(transform)
    return path
  }
}

/**
 * An {@link INodeStyle} implementation representing an Event according to the BPMN.
 */
export class EventNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this.$characteristic = EventCharacteristic.START
    this.minimumSize = new Size(20, 20)
    this.eventIcon = null
    this.typeIcon = null
    this.fillTypeIcon = false
    this.type = EventType.PLAIN
    this.characteristic = EventCharacteristic.START
  }

  /**
   * Gets the event type for this style.
   * @type {EventType}
   */
  get type() {
    return this.$type
  }

  /**
   * Sets the event type for this style.
   * @type {EventType}
   */
  set type(value) {
    if (this.$type !== value) {
      this.modCount++
      this.$type = value
      this.createTypeIcon()
    }
  }

  /**
   * Gets the event characteristic for this style.
   * @type {EventCharacteristic}
   */
  get characteristic() {
    return this.$characteristic
  }

  /**
   * Sets the event characteristic for this style.
   * @type {EventCharacteristic}
   */
  set characteristic(value) {
    if (this.$characteristic !== value || this.eventIcon === null) {
      this.modCount++
      this.$characteristic = value
      this.createEventIcon()
    }
  }

  createTypeIcon() {
    this.typeIcon = IconFactory.createEventType(this.type, this.fillTypeIcon)
    if (this.typeIcon) {
      this.typeIcon = IconFactory.createPlacedIcon(
        this.typeIcon,
        BPMN_CONSTANTS_PLACEMENTS_EVENT_TYPE,
        Size.EMPTY
      )
    }
  }

  createEventIcon() {
    this.eventIcon = IconFactory.createEvent(this.characteristic)
    this.eventIcon = IconFactory.createPlacedIcon(
      this.eventIcon,
      BPMN_CONSTANTS_PLACEMENTS_EVENT,
      this.minimumSize
    )
    const isFilled =
      this.characteristic === EventCharacteristic.THROWING ||
      this.characteristic === EventCharacteristic.END
    if (isFilled !== this.fillTypeIcon) {
      this.fillTypeIcon = isFilled
      this.createTypeIcon()
    }
  }

  /**
   * Updates the {@link BpmnNodeStyle#icon}.
   * This method is called by {@link BpmnNodeStyle#createVisual}.
   */
  updateIcon() {
    if (this.typeIcon) {
      this.icon = IconFactory.createCombinedIcon(
        new List(List.fromArray([this.eventIcon, this.typeIcon]))
      )
    } else {
      this.icon = this.eventIcon
    }
  }

  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields <code>null</code> to indicate that
   * the {@link INode#layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase#isInside}
   * and {@link NodeStyleBase#getIntersection} since the default implementations delegate to it.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {GeneralPath} The outline of the visual representation or <code>null</code>.
   */
  getOutline(node) {
    const size = Math.min(node.layout.width, node.layout.height)
    const bounds = new Rect(
      node.layout.center.x - size * 0.5,
      node.layout.center.y - size * 0.5,
      size,
      size
    )

    const path = new GeneralPath()
    path.appendEllipse(bounds, false)
    return path
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * This method is called in response to a {@link IHitTestable#isHit}
   * call to the instance that has been queried from the {@link NodeStyleBase#renderer}.
   * This implementation uses the {@link NodeStyleBase#getOutline outline} to determine
   * whether the node has been hit.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {Point} p The point to test.
   * @param {ICanvasContext} canvasContext The canvas context.
   * @return {boolean} whether or not the specified node representation is hit.
   */
  isHit(canvasContext, p, node) {
    const size = Math.min(node.layout.width, node.layout.height)
    const bounds = new Rect(
      node.layout.center.x - size * 0.5,
      node.layout.center.y - size * 0.5,
      size,
      size
    )
    return GeomUtilities.ellipseContains(bounds, p, canvasContext.hitTestRadius)
  }
}

/**
 * An {@link INodeStyle} implementation representing an Group Node according to the BPMN.
 */
export class GroupNodeStyle extends BaseClass(INodeStyle) {
  constructor() {
    super()
    this.$insets = new Insets(15)
  }

  /**
   * Gets the insets for the node.
   * These insets are returned via an {@link INodeInsetsProvider} if such an instance is queried through
   * the
   * {@link INodeStyleRenderer#getContext context lookup}.
   * @see {@link INodeInsetsProvider}
   * @return {Insets} An insets object that describes the insets of node.
   */
  get insets() {
    return this.$insets
  }

  /**
   * Sets the insets for the node.
   * These insets are returned via an {@link INodeInsetsProvider} if such an instance is queried through
   * the
   * @see {@link INodeInsetsProvider}
   * @param {Insets} insets An insets object that describes the insets of node.
   */
  set insets(insets) {
    this.$insets = insets
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    const groupNodeStyle = new GroupNodeStyle()
    groupNodeStyle.insets = this.insets
    return groupNodeStyle
  }

  /**
   * Gets the renderer implementation that can be queried for implementations
   * that provide details about the visual appearance and visual behavior
   * for a given node and this style instance.
   * The idiom for retrieving, e.g. an {@link IVisualCreator} implementation
   * for a given style is:
   * <pre><code>
   * var creator = style.renderer.getVisualCreator(node, style);
   * var visual = creator.createVisual(renderContext);
   * </code></pre>
   * @see Specified by {@link INodeStyle#renderer}.
   * @type {INodeStyleRenderer}
   */
  get renderer() {
    return GroupNodeStyle.RENDERER
  }

  /** @type {INodeStyle} */
  static get SHAPE_NODE_STYLE() {
    if (!GroupNodeStyle.$shapeNodeStyle) {
      const shapeNodeStyle = new ShapeNodeStyle({
        shape: ShapeNodeShape.ROUND_RECTANGLE,
        stroke: BPMN_CONSTANTS_STROKES_GROUP_NODE,
        fill: BPMN_CONSTANTS_FILLS_GROUP_NODE
      })
      shapeNodeStyle.renderer.roundRectArcRadius = BPMN_CONSTANTS_GROUP_NODE_CORNER_RADIUS
      GroupNodeStyle.$shapeNodeStyle = shapeNodeStyle
    }
    return GroupNodeStyle.$shapeNodeStyle
  }

  static get RENDERER() {
    return GroupNodeStyle.$renderer || (GroupNodeStyle.$renderer = new GroupNodeStyleRenderer())
  }
}

/**
 * An {@link INodeStyleRenderer} implementation used by {@link GroupNodeStyle}.
 */
class GroupNodeStyleRenderer extends BaseClass(INodeStyleRenderer, ILookup) {
  constructor() {
    super()
    this.lastNode = null
    this.lastStyle = null
  }

  /**
   * Gets an implementation of the {@link IVisualCreator} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation, but never <code>null</code>.
   * @param {INode} node The node to provide an instance for
   * @param {INodeStyle} style The style to use for the creation of the visual
   * @return {IVisualCreator} An implementation that may be used to subsequently create or update the
   *   visual for the item. Clients should not cache this instance and must always call this method immediately
   *   before using the value returned. This enables the use of the flyweight design pattern for implementations.
   *   This method may not return <code>null</code> but should yield a {@link VoidVisualCreator#INSTANCE
   *   void} implementation instead.
   * @see {@link VoidVisualCreator#INSTANCE}
   * @see Specified by {@link INodeStyleRenderer#getVisualCreator}.
   */
  getVisualCreator(node, style) {
    return GroupNodeStyle.SHAPE_NODE_STYLE.renderer.getVisualCreator(
      node,
      GroupNodeStyle.SHAPE_NODE_STYLE
    )
  }

  /**
   * Gets an implementation of the {@link IBoundsProvider} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} node The node to provide an instance for
   * @param {INodeStyle} style The style to use for the calculating the painting bounds
   * @return {IBoundsProvider} An implementation that may be used to subsequently query
   * the item's painting bounds. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer#getBoundsProvider}.
   */
  getBoundsProvider(node, style) {
    return GroupNodeStyle.SHAPE_NODE_STYLE.renderer.getBoundsProvider(
      node,
      GroupNodeStyle.SHAPE_NODE_STYLE
    )
  }

  /**
   * Gets an implementation of the {@link IVisibilityTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} node The node to provide an instance for
   * @param {INodeStyle} style The style to use for the testing the visibility
   * @return {IVisibilityTestable} An implementation that may be used to subsequently query
   * the item's visibility. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer#getVisibilityTestable}.
   */
  getVisibilityTestable(node, style) {
    return GroupNodeStyle.SHAPE_NODE_STYLE.renderer.getVisibilityTestable(
      node,
      GroupNodeStyle.SHAPE_NODE_STYLE
    )
  }

  /**
   * Gets an implementation of the {@link IHitTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} node The node to provide an instance for
   * @param {INodeStyle} style The style to use for the querying hit tests
   * @return {IHitTestable} An implementation that may be used to subsequently perform
   * hit tests. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations. This method may return <code>null</code>
   * to indicate that the item cannot be hit tested.
   * @see Specified by {@link INodeStyleRenderer#getHitTestable}.
   */
  getHitTestable(node, style) {
    return GroupNodeStyle.SHAPE_NODE_STYLE.renderer.getHitTestable(
      node,
      GroupNodeStyle.SHAPE_NODE_STYLE
    )
  }

  /**
   * Gets an implementation of the {@link IMarqueeTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} node The node to provide an instance for
   * @param {INodeStyle} style The style to use for the querying marquee intersection test.
   * @return {IMarqueeTestable} An implementation that may be used to subsequently query
   * the marquee intersections. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer#getMarqueeTestable}.
   */
  getMarqueeTestable(node, style) {
    return GroupNodeStyle.SHAPE_NODE_STYLE.renderer.getMarqueeTestable(
      node,
      GroupNodeStyle.SHAPE_NODE_STYLE
    )
  }

  /**
   * Gets a temporary context instance that can be used to query additional information
   * for the item's style.
   * Implementations may return {@link ILookup#EMPTY} if they don't support this, but may not return
   * <code>null</code>.
   * @param {IModelItem} item The item to provide a context instance for.
   * @param {INodeStyle} style The style to use for the context.
   * @return {ILookup} An non-<code>null</code> lookup implementation.
   * @see {@link ILookup#EMPTY}
   * @see {@link ILookup}
   * @see Specified by {@link INodeStyleRenderer#getContext}.
   */
  getContext(item, style) {
    this.lastNode = item
    this.lastStyle = style instanceof GroupNodeStyle ? style : null
    return this
  }

  /**
   * Gets an implementation of the {@link IShapeGeometry} interface that can
   * handle the provided node and its associated style.
   * This method may return a flyweight implementation.
   * @param {INode} node The node to provide an instance for
   * @param {INodeStyle} style The style to use for the painting
   * @return {IShapeGeometry} An implementation that may be used to subsequently query geometry
   *   information from. Clients should not cache this instance and must always call this method immediately before
   *   using the value returned. This enables the use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer#getShapeGeometry}.
   */
  getShapeGeometry(node, style) {
    return GroupNodeStyle.SHAPE_NODE_STYLE.renderer.getShapeGeometry(
      node,
      GroupNodeStyle.SHAPE_NODE_STYLE
    )
  }

  /**
   * Returns an instance that implements the given type or <code>null</code>.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-<code>null</code> implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be reobtained for subsequent use.
   * @param {Class} type the type for which an instance shall be returned
   * @return {Object} an instance that is assignable to type or <code>null</code>
   * @see Specified by {@link ILookup#lookup}.
   */
  lookup(type) {
    if (type === INodeInsetsProvider.$class && this.lastStyle !== null) {
      return new GroupInsetsProvider(this.lastStyle)
    }
    const lookup = GroupNodeStyle.SHAPE_NODE_STYLE.renderer.getContext(
      this.lastNode,
      GroupNodeStyle.SHAPE_NODE_STYLE
    )
    return lookup !== null ? lookup.lookup(type) : null
  }
}

/**
 * Uses the style insets extended by the size of the participant bands.
 */
class GroupInsetsProvider extends BaseClass(INodeInsetsProvider) {
  constructor(style) {
    super()
    this.style = style
  }

  /**
   * Returns the insets from {@link GroupNodeStyle} for the given node to include the size of the participant bands.
   * @param {INode} node The node for which the insets are provided
   * @return {Insets}
   */
  getInsets(node) {
    return this.style.insets
  }
}

/**
 * An {@link INodeStyle} implementation representing a Gateway according to the BPMN.
 */
export class GatewayNodeStyle extends BpmnNodeStyle {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this.$type = null
    this.type = GatewayType.EXCLUSIVE_WITHOUT_MARKER
    this.minimumSize = new Size(20, 20)
    this.typeIcon = null
  }

  /**
   * Gets the gateway type for this style.
   * @type {GatewayType}
   */
  get type() {
    return this.$type
  }

  /**
   * Sets the gateway type for this style.
   * @type {GatewayType}
   */
  set type(value) {
    if (this.$type !== value) {
      this.modCount++
      this.$type = value
      this.typeIcon = IconFactory.createGatewayType(this.$type)
      if (this.typeIcon) {
        this.typeIcon = IconFactory.createPlacedIcon(
          this.typeIcon,
          BPMN_CONSTANTS_PLACEMENTS_GATEWAY_TYPE,
          Size.EMPTY
        )
      }
    }
  }

  /**
   * Updates the {@link BpmnNodeStyle#icon}.
   * This method is called by {@link BpmnNodeStyle#createVisual}.
   */
  updateIcon() {
    this.icon =
      this.typeIcon !== null
        ? IconFactory.createCombinedIcon(
            List.fromArray([GatewayNodeStyle.GATEWAY_ICON, this.typeIcon])
          )
        : GatewayNodeStyle.GATEWAY_ICON
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields <code>null</code> to indicate that
   * the {@link INode#layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase#isInside}
   * and {@link NodeStyleBase#getIntersection} since the default implementations delegate to it.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {GeneralPath} The outline of the visual representation or <code>null</code>.
   */
  getOutline(node) {
    const size = Math.min(node.layout.width, node.layout.height)
    const bounds = new Rect(
      node.layout.x + node.layout.width * 0.5 - size * 0.5,
      node.layout.y + node.layout.height * 0.5 - size * 0.5,
      size,
      size
    )

    const path = new GeneralPath()
    path.moveTo(bounds.x, bounds.centerY)
    // <
    path.lineTo(bounds.centerX, bounds.y)
    // ^
    path.lineTo(bounds.maxX, bounds.centerY)
    // >
    path.lineTo(bounds.centerX, bounds.maxY)
    // v
    path.close()
    return path
  }

  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * This method is called in response to a {@link IHitTestable#isHit}
   * call to the instance that has been queried from the {@link NodeStyleBase#renderer}.
   * This implementation uses the {@link NodeStyleBase#getOutline outline} to determine
   * whether the node has been hit.
   * @param {INode} node The node to which this style instance is assigned.
   * @param {Point} p The point to test.
   * @param {ICanvasContext} canvasContext The canvas context.
   * @return {boolean} whether or not the specified node representation is hit.
   */
  isHit(canvasContext, p, node) {
    if (
      !node.layout
        .toRect()
        .getEnlarged(canvasContext.hitTestRadius)
        .contains(p)
    ) {
      return false
    }
    const size = Math.min(node.layout.width, node.layout.height)

    const distVector = node.layout.center.subtract(p)
    const dist = Math.abs(distVector.x) + Math.abs(distVector.y)
    return dist < size * 0.5 + canvasContext.hitTestRadius
  }

  static get GATEWAY_ICON() {
    return (
      GatewayNodeStyle.$gatewayIcon ||
      (GatewayNodeStyle.$gatewayIcon = IconFactory.createPlacedIcon(
        IconFactory.createGateway(),
        BPMN_CONSTANTS_PLACEMENTS_GATEWAY,
        Size.EMPTY
      ))
    )
  }
}

/**
 * An {@link IPortStyle} implementation representing an Event attached to an Activity boundary
 * according to the BPMN.
 */
export class EventPortStyle extends BaseClass(IPortStyle) {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    const eventNodeStyle = new EventNodeStyle()
    eventNodeStyle.characteristic = EventCharacteristic.BOUNDARY_INTERRUPTING
    eventNodeStyle.type = EventType.COMPENSATION
    const nodeStylePortStyleAdapter = new NodeStylePortStyleAdapter(eventNodeStyle)
    nodeStylePortStyleAdapter.renderSize = BPMN_CONSTANTS_SIZES_EVENT_PORT
    this.adapter = nodeStylePortStyleAdapter
  }

  /**
   * Gets the event type for this style.
   * @type {EventType}
   */
  get type() {
    return this.eventNodeStyle.type
  }

  /**
   * Sets the event type for this style.
   * @type {EventType}
   */
  set type(value) {
    this.eventNodeStyle.type = value
  }

  /**
   * Gets the event characteristic for this style.
   * @type {EventCharacteristic}
   */
  get characteristic() {
    return this.eventNodeStyle.characteristic
  }

  /**
   * Sets the event characteristic for this style.
   * @type {EventCharacteristic}
   */
  set characteristic(value) {
    this.eventNodeStyle.characteristic = value
  }

  /**
   * Gets the size the port style is rendered with.
   * @type {Size}
   */
  get renderSize() {
    return this.adapter.renderSize
  }

  /**
   * Sets the size the port style is rendered with.
   * @type {Size}
   */
  set renderSize(value) {
    this.adapter.renderSize = value
  }

  /**
   * @type {EventNodeStyle}
   */
  get eventNodeStyle() {
    const nodeStyle = this.adapter.nodeStyle
    return nodeStyle instanceof EventNodeStyle ? nodeStyle : null
  }

  /**
   * Create a clone of this object.
   * @return {Object} A clone of this object.
   * @see Specified by {@link ICloneable#clone}.
   */
  clone() {
    return this.memberwiseClone()
  }

  /**
   * Gets the renderer implementation that can be queried for implementations
   * that provide details about the visual appearance and visual behavior
   * for a given port and this style instance.
   * @see Specified by {@link IPortStyle#renderer}.
   * @type {IPortStyleRenderer}
   */
  get renderer() {
    return EventPortStyleRenderer.INSTANCE
  }
}

/**
 * Renderer used by {@link EventPortStyle}.
 */
class EventPortStyleRenderer extends BaseClass(IPortStyleRenderer, ILookup) {
  constructor() {
    super()
    this.fallbackLookup = null
  }

  /**
   * Gets an implementation of the {@link IVisualCreator} interface that can
   * handle the provided item and its associated style.
   * @param {IPort} port The port to provide an instance for
   * @param {IPortStyle} style The style to use for the creation of the visual
   * @return {IVisualCreator} An implementation that may be used to subsequently create or update the
   *   visual for the item. Clients should not cache this instance and must always call this method immediately
   *   before using the value returned. This enables the use of the flyweight design pattern for implementations.
   *   This method may not return <code>null</code> but should yield a {@link VoidVisualCreator#INSTANCE
   *   void} implementation instead.
   * @see {@link VoidVisualCreator#INSTANCE}
   * @see Specified by {@link IPortStyleRenderer#getVisualCreator}.
   */
  getVisualCreator(port, style) {
    const adapter = style.adapter
    return adapter.renderer.getVisualCreator(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IBoundsProvider} interface that can
   * handle the provided item and its associated style.
   * @param {IPort} port The port to provide an instance for
   * @param {IPortStyle} style The style to use for the calculating the painting bounds
   * @return {IBoundsProvider} An implementation that may be used to subsequently query
   * the item's painting bounds. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link IPortStyleRenderer#getBoundsProvider}.
   */
  getBoundsProvider(port, style) {
    const adapter = style.adapter
    return adapter.renderer.getBoundsProvider(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IVisibilityTestable} interface that can
   * handle the provided item and its associated style.
   * @param {IPort} port The port to provide an instance for
   * @param {IPortStyle} style The style to use for the testing the visibility
   * @return {IVisibilityTestable} An implementation that may be used to subsequently query
   * the item's visibility. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link IPortStyleRenderer#getVisibilityTestable}.
   */
  getVisibilityTestable(port, style) {
    const adapter = style.adapter
    return adapter.renderer.getVisibilityTestable(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IHitTestable} interface that can
   * handle the provided item and its associated style.
   * @param {IPort} port The port to provide an instance for
   * @param {IPortStyle} style The style to use for the querying hit tests
   * @return {IHitTestable} An implementation that may be used to subsequently perform
   * hit tests. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations. This method may return <code>null</code>
   * to indicate that the item cannot be hit tested.
   * @see Specified by {@link IPortStyleRenderer#getHitTestable}.
   */
  getHitTestable(port, style) {
    const adapter = style.adapter
    return adapter.renderer.getHitTestable(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IMarqueeTestable} interface that can
   * handle the provided item and its associated style.
   * @param {IPort} port The port to provide an instance for
   * @param {IPortStyle} style The style to use for the querying marquee intersection test.
   * @return {IMarqueeTestable} An implementation that may be used to subsequently query
   * the marquee intersections. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link IPortStyleRenderer#getMarqueeTestable}.
   */
  getMarqueeTestable(port, style) {
    const adapter = style.adapter
    return adapter.renderer.getMarqueeTestable(port, adapter)
  }

  /**
   * Gets a temporary context instance that can be used to query additional information
   * for the item's style.
   * @param {IPort} port The item to provide a context instance for.
   * @param {IPortStyle} style The style to use for the context.
   * @return {ILookup} An non-<code>null</code> lookup implementation.
   * @see {@link ILookup#EMPTY}
   * @see {@link ILookup}
   * @see Specified by {@link IPortStyleRenderer#getContext}.
   */
  getContext(port, style) {
    const adapter = style.adapter
    this.fallbackLookup = adapter.renderer.getContext(port, adapter)
    return this
  }

  /**
   * Returns an instance that implements the given type or <code>null</code>.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-<code>null</code> implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {Class} type the type for which an instance shall be returned
   * @return {Object} an instance that is assignable to type or <code>null</code>
   * @see Specified by {@link ILookup#lookup}.
   */
  lookup(type) {
    if (type === IEdgePathCropper.$class) {
      return EventPortEdgeIntersectionCalculator.CalculatorInstance
    }
    return this.fallbackLookup.lookup(type)
  }

  static get INSTANCE() {
    return (
      EventPortStyleRenderer.$instance ||
      (EventPortStyleRenderer.$instance = new EventPortStyleRenderer())
    )
  }
}

/**
 * {@link DefaultEdgePathCropper} instance that crops the edge at the circular port bounds.
 */
class EventPortEdgeIntersectionCalculator extends DefaultEdgePathCropper {
  constructor() {
    super()
    this.cropAtPort = true
  }

  /**
   * Returns the geometry of the port retrieved from {@link EventPortStyle}.
   * @param {IPort} port The port at which the edge should be cropped.
   * @return {IShapeGeometry}
   */
  getPortGeometry(port) {
    if (port.style instanceof EventPortStyle) {
      const eventPortStyle = port.style
      if (IShapeGeometry.isInstance(eventPortStyle.adapter.renderer)) {
        return eventPortStyle.adapter.renderer
      }
    }
    return null
  }

  static get CalculatorInstance() {
    return (
      EventPortEdgeIntersectionCalculator.$calculatorInstance ||
      (EventPortEdgeIntersectionCalculator.$calculatorInstance = new EventPortEdgeIntersectionCalculator())
    )
  }
}

/**
 * A toggle button that uses different {@link Visual}s for the two toggle states.
 */
class VisualToggleButton extends Visual {
  constructor() {
    super()
    this.g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // The visual used if the button is checked.
    this.checkedVisual = null
    // The visual used if the button is not checked.
    this.uncheckedVisual = null

    this.$checked = false
  }

  /** @type {boolean} */
  get checked() {
    return this.$checked
  }

  /** @type {boolean} */
  set checked(value) {
    const noChildren = this.g.childElementCount < 1
    if (value && (noChildren || !this.checked)) {
      this.g.setAttribute('class', 'visualToggleButton visualToggleButtonChecked')
      this.setChild(this.checkedVisual)
    } else if (!value && (noChildren || this.checked)) {
      this.g.setAttribute('class', 'visualToggleButton visualToggleButtonUnchecked')
      this.setChild(this.uncheckedVisual)
    }
    this.$checked = value
  }

  /** @type {Element} */
  get svgElement() {
    return this.g
  }

  setChild(newChild) {
    if (this.svgElement.childElementCount >= 1) {
      this.svgElement.removeChild(this.svgElement.firstElementChild)
    }
    if (newChild !== null) {
      this.svgElement.appendChild(newChild.svgElement)
    }
  }
}

class DataObjectIcon extends Icon {
  constructor() {
    super()
    this.fill = null
    this.stroke = null
  }

  /** @return {Visual} */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const cornerSize = Math.min(this.bounds.width, this.bounds.height) * 0.4
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute(
      'd',
      `M 0 0 L ${this.bounds.width - cornerSize} 0 L ${this.bounds.width} ${cornerSize} L ${
        this.bounds.width
      } ${this.bounds.height} L 0 ${this.bounds.height} Z`
    )
    Stroke.setStroke(this.stroke, path1, context)
    Fill.setFill(this.fill, path1, context)
    container.appendChild(path1)

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path2.setAttribute(
      'd',
      `M ${this.bounds.width - cornerSize} 0 L ${this.bounds.width - cornerSize} ${cornerSize} L ${
        this.bounds.width
      } ${cornerSize}`
    )
    Stroke.setStroke(this.stroke, path2, context)
    Fill.setFill(this.fill, path2, context)
    container.appendChild(path2)

    container['render-data-cache'] = new PathIconState(
      this.bounds.width,
      this.bounds.height,
      this.stroke,
      this.fill
    )

    SvgVisual.setTranslate(container, this.bounds.x, this.bounds.y)

    return new SvgVisual(container)
  }

  /** @return {Visual} */
  updateVisual(context, oldVisual) {
    const container = oldVisual.svgElement
    const cache = container['render-data-cache']

    const path1 = container.firstElementChild
    const path2 = container.lastElementChild

    if (cache.width !== this.bounds.width || cache.height !== this.bounds.height) {
      const cornerSize = Math.min(this.bounds.width, this.bounds.height) * 0.4
      path1.setAttribute(
        'd',
        `M 0 0 L ${this.bounds.width - cornerSize} 0 L ${this.bounds.width} ${cornerSize} L ${
          this.bounds.width
        } ${this.bounds.height} L 0 ${this.bounds.height} Z`
      )
      path2.setAttribute(
        'd',
        `M ${this.bounds.width - cornerSize} 0 L ${this.bounds.width -
          cornerSize} ${cornerSize} L ${this.bounds.width} ${cornerSize}`
      )
    }

    if (cache.stroke !== this.stroke) {
      Stroke.setStroke(this.stroke, path1, context)
      Stroke.setStroke(this.stroke, path2, context)
    }

    if (cache.fill !== this.fill) {
      Fill.setFill(this.fill, path1, context)
      Fill.setFill(this.fill, path2, context)
    }

    container['render-data-cache'] = new PathIconState(
      this.bounds.width,
      this.bounds.height,
      this.stroke,
      this.fill
    )

    SvgVisual.setTranslate(container, this.bounds.x, this.bounds.y)

    return new SvgVisual(container)
  }
}

class CollapseButtonIcon extends Icon {
  constructor(node) {
    super()
    this.node = node
    this.touchEndRegistered = false
    this.onTouchEndDelegate = null
  }

  /** @return {Visual} */
  createVisual(context) {
    CollapseButtonIcon.COLLAPSED_ICON.setBounds(new Rect(Point.ORIGIN, this.bounds.size))
    CollapseButtonIcon.EXPANDED_ICON.setBounds(new Rect(Point.ORIGIN, this.bounds.size))
    const button = this.createButton(
      context,
      this.node,
      CollapseButtonIcon.COLLAPSED_ICON.createVisual(context),
      CollapseButtonIcon.EXPANDED_ICON.createVisual(context)
    )
    const container = new SvgVisualGroup()
    container.add(new SvgVisual(button.svgElement))

    const transform = new Matrix()
    transform.translate(this.bounds.toRect().topLeft)
    container.transform = transform

    return container
  }

  /** @return {Visual} */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (
      container !== null &&
      container.children.size === 1 &&
      container.children.get(0) instanceof VisualToggleButton
    ) {
      return this.createVisual(context)
    }

    CollapseButtonIcon.COLLAPSED_ICON.setBounds(new Rect(Point.ORIGIN, this.bounds.size))
    CollapseButtonIcon.EXPANDED_ICON.setBounds(new Rect(Point.ORIGIN, this.bounds.size))

    const button = container.children.get(0)
    button.checkedVisual = CollapseButtonIcon.COLLAPSED_ICON.updateVisual(
      context,
      button.checkedVisual
    )
    button.uncheckedVisual = CollapseButtonIcon.EXPANDED_ICON.updateVisual(
      context,
      button.uncheckedVisual
    )

    const transform = new Matrix()
    transform.translate(this.node.layout.topLeft)
    container.transform = transform

    button.checked = !isExpanded(context, this.node)
    return container
  }

  /** @return {VisualToggleButton} */
  createButton(context, item, collapsedVisual, expandedVisual) {
    const button = new VisualToggleButton()
    button.checkedVisual = collapsedVisual
    button.uncheckedVisual = expandedVisual
    button.checked = !isExpanded(context, this.node)

    this.addToggleGroupStateCommand(button, context)

    return button
  }

  /**
   * Adds the toggle group state command to the given button visual.
   * This method adds event listeners for click and tap events to
   * the given button visual that call {@link CollapseButtonIcon#toggleExpansionState}.
   * It is called by {@link CollapseButtonIcon#createButton}.
   * @param {Visual} button The button visual to add the event listeners to.
   * @param {IRenderContext} context The context.
   */
  addToggleGroupStateCommand(button, context) {
    const currentItem = this.node
    button.svgElement.addEventListener(
      'click',
      event => {
        toggleExpansionState(currentItem, context)
        button.checked = !isExpanded(context, this.node)
      },
      false
    )

    this.onTouchEndDelegate = event => {
      // prevent click event
      event.preventDefault()
      this.onTouchEnd(button, currentItem, context)
    }
    button.svgElement.addEventListener(
      'touchstart',
      evt => {
        if (!this.touchEndRegistered) {
          this.touchEndRegistered = true
          button.svgElement.addEventListener(
            'touchend',
            this.onTouchEndDelegate,
            passiveSupported ? { passive: false } : false
          )
        }
      },
      passiveSupported ? { passive: false } : false
    )
  }

  onTouchEnd(button, currentItem, context) {
    button.svgElement.removeEventListener(
      'touchend',
      this.onTouchEndDelegate,
      passiveSupported ? { passive: false } : false
    )
    this.touchEndRegistered = false
    toggleExpansionState(currentItem, context)
  }

  static get COLLAPSED_ICON() {
    return (
      CollapseButtonIcon.$collapsedIcon ||
      (CollapseButtonIcon.$collapsedIcon = IconFactory.createStaticSubState(SubState.COLLAPSED))
    )
  }

  static get EXPANDED_ICON() {
    return (
      CollapseButtonIcon.$expandedIcon ||
      (CollapseButtonIcon.$expandedIcon = IconFactory.createStaticSubState(SubState.EXPANDED))
    )
  }
}

/** @return {boolean} */
function isExpanded(context, item) {
  let expanded = true
  const canvas = context !== null ? context.canvasComponent : null

  if (canvas !== null) {
    if (IGraph.isInstance(canvas.graph)) {
      const graph = canvas.graph
      const foldedGraph = graph.foldingView
      if (foldedGraph !== null && foldedGraph.graph.contains(item)) {
        expanded = foldedGraph.isExpanded(item)
      }
    }
  }
  return expanded
}

/**
 * Executes the {@link ICommand#TOGGLE_EXPANSION_STATE}, if it can be executed.
 * @param {INode} currentNode The group whose state should be toggled.
 * @param {IRenderContext} context The context.
 */
function toggleExpansionState(currentNode, context) {
  const canvas = context.canvasComponent
  if (ICommand.TOGGLE_EXPANSION_STATE.canExecute(currentNode, canvas)) {
    ICommand.TOGGLE_EXPANSION_STATE.execute(currentNode, canvas)
  }
}

/**
 * A class that contains all information to determine whether or not a {@link PathIcon} needs to be updated.
 */
class PathIconState {
  constructor(width, height, stroke, fill) {
    this.width = width
    this.height = height
    this.stroke = stroke
    this.fill = fill
  }

  /** @return {boolean} */
  equals(width, height, stroke, fill) {
    return (
      this.width === width && this.height === height && this.stroke === stroke && this.fill === fill
    )
  }
}

/**
 * Specifies the type of a Choreography according to BPMN.
 * @see {@link ChoreographyNodeStyle}
 */
export const ChoreographyType = Enum('ChoreographyType', {
  /**
   * Specifies that a Choreography is a Choreography Task according to BPMN.
   * @see {@link ChoreographyNodeStyle}
   */
  TASK: 0,
  /**
   * Specifies that a Choreography is a Call Choreography according to BPMN.
   * @see {@link ChoreographyNodeStyle}
   */
  CALL: 1
})

/**
 * Specifies the characteristic of an event.
 * @see {@link EventNodeStyle}
 */
export const EventCharacteristic = Enum('EventCharacteristic', {
  /**
   * Specifies that an Event is a Start Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  START: 0,
  /**
   * Specifies that an Event is a Start Event for a Sub-Process according to BPMN that interrupts the containing
   * Process.
   * @see {@link EventNodeStyle}
   */
  SUB_PROCESS_INTERRUPTING: 1,
  /**
   * Specifies that an Event is a Start Event for a Sub-Process according to BPMN that doesn`t interrupt the
   * containing Process.
   * @see {@link EventNodeStyle}
   */
  SUB_PROCESS_NON_INTERRUPTING: 2,
  /**
   * Specifies that an Event is an Intermediate Catching Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  CATCHING: 3,
  /**
   * Specifies that an Event is an Intermediate Event Attached to an Activity Boundary according to BPMN that
   * interrupts the Activity.
   * @see {@link EventNodeStyle}
   */
  BOUNDARY_INTERRUPTING: 4,
  /**
   * Specifies that an Event is an Intermediate Event Attached to an Activity Boundary according to BPMN that doesn't
   * interrupt the Activity.
   * @see {@link EventNodeStyle}
   */
  BOUNDARY_NON_INTERRUPTING: 5,
  /**
   * Specifies that an Event is an Intermediate Throwing Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  THROWING: 6,
  /**
   * Specifies that an Event is an End Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  END: 7
})

/**
 * Specifies the type of a Data Object according to BPMN.
 * @see {@link DataObjectNodeStyle}
 */
export const DataObjectType = Enum('DataObjectType', {
  /**
   * Specifies a normal Data Object according to BPMN.
   * @see {@link DataObjectNodeStyle}
   */
  NONE: 0,
  /**
   * Specifies a Data Input according to BPMN.
   * @see {@link DataObjectNodeStyle}
   */
  INPUT: 1,
  /**
   * Specifies a Data Output according to BPMN.
   * @see {@link DataObjectNodeStyle}
   */
  OUTPUT: 2
})

// The following extensions are needed for (de-)serialization.

export const PoolNodeStyleExtension = Class('PoolNodeStyleExtension', {
  $extends: MarkupExtension,

  $meta() {
    return [GraphMLAttribute().init({ contentProperty: 'tableNodeStyle' })]
  },

  $vertical: false,
  vertical: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$vertical
    },
    set(vertical) {
      this.$vertical = vertical
    }
  },

  $multipleInstance: false,
  multipleInstance: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$multipleInstance
    },
    set(multipleInstance) {
      this.$multipleInstance = multipleInstance
    }
  },

  $tableNodeStyle: null,
  tableNodeStyle: {
    $meta() {
      return [TypeAttribute(TableNodeStyle.$class)]
    },
    get() {
      return this.$tableNodeStyle
    },
    set(style) {
      this.$tableNodeStyle = style
    }
  },

  provideValue(serviceProvider) {
    const style = new PoolNodeStyle(this.vertical)
    style.multipleInstance = this.multipleInstance
    style.tableNodeStyle = this.tableNodeStyle
    return style
  }
})

export const AlternatingLeafStripeStyleExtension = Class('AlternatingLeafStripeStyleExtension', {
  $extends: MarkupExtension,

  $evenLeafDescriptor: null,
  evenLeafDescriptor: {
    $meta() {
      return [TypeAttribute(YObject.$class)]
    },
    get() {
      return this.$evenLeafDescriptor
    },
    set(descriptor) {
      this.$evenLeafDescriptor = descriptor
    }
  },

  $parentDescriptor: null,
  parentDescriptor: {
    $meta() {
      return [TypeAttribute(YObject.$class)]
    },
    get() {
      return this.$parentDescriptor
    },
    set(descriptor) {
      this.$parentDescriptor = descriptor
    }
  },

  $oddLeafDescriptor: null,
  oddLeafDescriptor: {
    $meta() {
      return [TypeAttribute(YObject.$class)]
    },
    get() {
      return this.$oddLeafDescriptor
    },
    set(descriptor) {
      this.$oddLeafDescriptor = descriptor
    }
  },

  provideValue(serviceProvider) {
    const style = new AlternatingLeafStripeStyle(this.vertical)
    style.evenLeafDescriptor = this.evenLeafDescriptor
    style.parentDescriptor = this.parentDescriptor
    style.oddLeafDescriptor = this.oddLeafDescriptor
    return style
  }
})

export const StripeDescriptorExtension = Class('StripeDescriptorExtension', {
  $extends: MarkupExtension,

  $backgroundFill: Fill.TRANSPARENT,
  backgroundFill: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: Fill.TRANSPARENT }),
        TypeAttribute(Fill.$class)
      ]
    },
    get() {
      return this.$backgroundFill
    },
    set(fill) {
      this.$backgroundFill = fill
    }
  },

  $insetFill: Fill.TRANSPARENT,
  insetFill: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: Fill.TRANSPARENT }),
        TypeAttribute(Fill.$class)
      ]
    },
    get() {
      return this.$insetFill
    },
    set(fill) {
      this.$insetFill = fill
    }
  },

  $borderFill: Fill.BLACK,
  borderFill: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: Fill.BLACK }), TypeAttribute(Fill.$class)]
    },
    get() {
      return this.$borderFill
    },
    set(fill) {
      this.$borderFill = fill
    }
  },

  $borderThickness: new Insets(1),
  borderThickness: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: new Insets(1) }),
        TypeAttribute(Insets.$class)
      ]
    },
    get() {
      return this.$borderThickness
    },
    set(fill) {
      this.$borderThickness = fill
    }
  },

  provideValue(serviceProvider) {
    const descriptor = new StripeDescriptor()
    descriptor.backgroundFill = this.backgroundFill
    descriptor.insetFill = this.insetFill
    descriptor.borderFill = this.borderFill
    descriptor.borderThickness = this.borderThickness
    return descriptor
  }
})

export const ActivityNodeStyleExtension = Class('ActivityNodeStyleExtension', {
  $extends: MarkupExtension,

  $activityType: ActivityType.TASK,
  activityType: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: ActivityType.TASK }),
        TypeAttribute(ActivityType.$class)
      ]
    },
    get() {
      return this.$activityType
    },
    set(type) {
      this.$activityType = type
    }
  },

  $taskType: TaskType.ABSTRACT,
  taskType: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: TaskType.ABSTRACT }),
        TypeAttribute(TaskType.$class)
      ]
    },
    get() {
      return this.$taskType
    },
    set(type) {
      this.$taskType = type
    }
  },

  $triggerEventType: EventType.MESSAGE,
  triggerEventType: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: EventType.MESSAGE }),
        TypeAttribute(EventType.$class)
      ]
    },
    get() {
      return this.$triggerEventType
    },
    set(type) {
      this.$triggerEventType = type
    }
  },

  $triggerEventCharacteristic: EventCharacteristic.SUB_PROCESS_INTERRUPTING,
  triggerEventCharacteristic: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: EventCharacteristic.SUB_PROCESS_INTERRUPTING }),
        TypeAttribute(EventCharacteristic.$class)
      ]
    },
    get() {
      return this.$triggerEventCharacteristic
    },
    set(characteristic) {
      this.$triggerEventCharacteristic = characteristic
    }
  },
  $loopCharacteristic: LoopCharacteristic.NONE,
  loopCharacteristic: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: LoopCharacteristic.NONE }),
        TypeAttribute(LoopCharacteristic.$class)
      ]
    },
    get() {
      return this.$loopCharacteristic
    },
    set(characteristic) {
      this.$loopCharacteristic = characteristic
    }
  },

  $subState: SubState.NONE,
  subState: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: SubState.NONE }),
        TypeAttribute(SubState.$class)
      ]
    },
    get() {
      return this.$subState
    },
    set(state) {
      this.$subState = state
    }
  },
  $insets: new Insets(15),
  insets: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: new Insets(15) }),
        TypeAttribute(Insets.$class)
      ]
    },
    get() {
      return this.$insets
    },
    set(insets) {
      this.$insets = insets
    }
  },
  $adHoc: false,
  adHoc: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$adHoc
    },
    set(value) {
      this.$adHoc = value
    }
  },

  $compensation: false,
  compensation: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$compensation
    },
    set(compensation) {
      this.$compensation = compensation
    }
  },

  $minimumSize: Size.EMPTY,
  minimumSize: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: Size.EMPTY }), TypeAttribute(Size.$class)]
    },
    get() {
      return this.$minimumSize
    },
    set(size) {
      this.$minimumSize = size
    }
  },

  provideValue(serviceProvider) {
    const style = new ActivityNodeStyle()
    style.activityType = this.activityType
    style.taskType = this.taskType
    style.triggerEventType = this.triggerEventType
    style.triggerEventCharacteristic = this.triggerEventCharacteristic
    style.loopCharacteristic = this.loopCharacteristic
    style.subState = this.subState
    style.insets = this.insets
    style.adHoc = this.adHoc
    style.compensation = this.compensation
    style.minimumSize = this.minimumSize
    return style
  }
})

export const AnnotationNodeStyleExtension = Class('AnnotationNodeStyleExtension', {
  $extends: MarkupExtension,

  $left: true,
  left: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$left
    },
    set(left) {
      this.$left = left
    }
  },

  provideValue(serviceProvider) {
    const style = new AnnotationNodeStyle()
    style.left = this.left
    return style
  }
})

export const ConversationNodeStyleExtension = Class('ConversationNodeStyleExtension', {
  $extends: MarkupExtension,

  $type: ConversationType.CONVERSATION,
  type: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: ConversationType.CONVERSATION }),
        TypeAttribute(ConversationType.$class)
      ]
    },
    get() {
      return this.$type
    },
    set(type) {
      this.$type = type
    }
  },

  provideValue(serviceProvider) {
    const style = new ConversationNodeStyle()
    style.type = this.type
    return style
  }
})

export const ChoreographyNodeStyleExtension = Class('ChoreographyNodeStyleExtension', {
  $extends: MarkupExtension,

  // $meta: [GraphMLAttribute().init({ 'contentProperty' : 'columns' })],

  constructor: function() {
    MarkupExtension.call(this)
    this.$topParticipants = new List()
    this.$bottomParticipants = new List()
  },

  $loopCharacteristic: LoopCharacteristic.NONE,
  loopCharacteristic: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: LoopCharacteristic.NONE }),
        TypeAttribute(LoopCharacteristic.$class)
      ]
    },
    get() {
      return this.$loopCharacteristic
    },
    set(characteristic) {
      this.$loopCharacteristic = characteristic
    }
  },

  $subState: SubState.NONE,
  subState: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: SubState.NONE }),
        TypeAttribute(SubState.$class)
      ]
    },
    get() {
      return this.$subState
    },
    set(state) {
      this.$subState = state
    }
  },

  $topParticipants: null,
  topParticipants: {
    $meta() {
      return [
        GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
        TypeAttribute(IList.$class)
      ]
    },
    get() {
      return this.$topParticipants
    }
  },
  $bottomParticipants: null,
  bottomParticipants: {
    $meta() {
      return [
        GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
        TypeAttribute(IList.$class)
      ]
    },
    get() {
      return this.$bottomParticipants
    }
  },

  $initiatingMessage: false,
  initiatingMessage: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$initiatingMessage
    },
    set(initiatingMessage) {
      this.$initiatingMessage = initiatingMessage
    }
  },
  $responseMessage: false,
  responseMessage: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$responseMessage
    },
    set(responseMessage) {
      this.$responseMessage = responseMessage
    }
  },
  $initiatingAtTop: true,
  initiatingAtTop: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$initiatingAtTop
    },
    set(initiatingAtTop) {
      this.$initiatingAtTop = initiatingAtTop
    }
  },
  $insets: new Insets(5),
  insets: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: new Insets(5) }),
        TypeAttribute(Insets.$class)
      ]
    },
    get() {
      return this.$insets
    },
    set(insets) {
      this.$insets = insets
    }
  },

  $type: ChoreographyType.TASK,
  type: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: ChoreographyType.TASK }),
        TypeAttribute(ChoreographyType.$class)
      ]
    },
    get() {
      return this.$type
    },
    set(type) {
      this.$type = type
    }
  },
  $minimumSize: Size.EMPTY,
  minimumSize: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: Size.EMPTY }), TypeAttribute(Size.$class)]
    },
    get() {
      return this.$minimumSize
    },
    set(size) {
      this.$minimumSize = size
    }
  },

  provideValue(serviceProvider) {
    const style = new ChoreographyNodeStyle()
    style.loopCharacteristic = this.loopCharacteristic
    style.subState = this.subState
    this.topParticipants.forEach(participant => {
      style.topParticipants.add(participant)
    })
    this.bottomParticipants.forEach(participant => {
      style.bottomParticipants.add(participant)
    })
    style.initiatingMessage = this.initiatingMessage
    style.responseMessage = this.responseMessage
    style.initiatingAtTop = this.initiatingAtTop
    style.insets = this.insets
    style.type = this.type
    style.minimumSize = this.minimumSize
    return style
  }
})

export const ParticipantExtension = Class('ParticipantExtension', {
  $extends: MarkupExtension,

  $multiInstance: false,
  multiInstance: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$multiInstance
    },
    set(multiInstance) {
      this.$multiInstance = multiInstance
    }
  },

  provideValue(serviceProvider) {
    const participant = new Participant()
    participant.multiInstance = this.multiInstance
    return participant
  }
})

export const DataObjectNodeStyleExtension = Class('DataObjectNodeStyleExtension', {
  $extends: MarkupExtension,

  $minimumSize: Size.EMPTY,
  minimumSize: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: Size.EMPTY }), TypeAttribute(Size.$class)]
    },
    get() {
      return this.$minimumSize
    },
    set(size) {
      this.$minimumSize = size
    }
  },

  $collection: false,
  collection: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$collection
    },
    set(collection) {
      this.$collection = collection
    }
  },

  $type: DataObjectType.NONE,
  type: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: DataObjectType.NONE }),
        TypeAttribute(DataObjectType.$class)
      ]
    },
    get() {
      return this.$type
    },
    set(type) {
      this.$type = type
    }
  },

  provideValue(serviceProvider) {
    const style = new DataObjectNodeStyle()
    style.minimumSize = this.minimumSize
    style.collection = this.collection
    style.type = this.type
    return style
  }
})

export const DataStoreNodeStyleExtension = Class('DataStoreNodeStyleExtension', {
  $extends: MarkupExtension,

  $minimumSize: Size.EMPTY,
  minimumSize: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: Size.EMPTY }), TypeAttribute(Size.$class)]
    },
    get() {
      return this.$minimumSize
    },
    set(size) {
      this.$minimumSize = size
    }
  },

  provideValue(serviceProvider) {
    const style = new DataStoreNodeStyle()
    style.minimumSize = this.minimumSize
    return style
  }
})

export const EventNodeStyleExtension = Class('EventNodeStyleExtension', {
  $extends: MarkupExtension,

  $type: EventType.PLAIN,
  type: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: EventType.PLAIN }),
        TypeAttribute(EventType.$class)
      ]
    },
    get() {
      return this.$type
    },
    set(type) {
      this.$type = type
    }
  },
  $characteristic: EventCharacteristic.START,
  characteristic: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: EventCharacteristic.START }),
        TypeAttribute(EventCharacteristic.$class)
      ]
    },
    get() {
      return this.$characteristic
    },
    set(characteristic) {
      this.$characteristic = characteristic
    }
  },
  $minimumSize: Size.EMPTY,
  minimumSize: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: Size.EMPTY }), TypeAttribute(Size.$class)]
    },
    get() {
      return this.$minimumSize
    },
    set(minimumSize) {
      this.$minimumSize = minimumSize
    }
  },

  provideValue(serviceProvider) {
    const style = new EventNodeStyle()
    style.type = this.type
    style.characteristic = this.characteristic
    style.minimumSize = this.minimumSize
    return style
  }
})

export const GatewayNodeStyleExtension = Class('GatewayNodeStyleExtension', {
  $extends: MarkupExtension,

  $type: GatewayType.EXCLUSIVE_WITHOUT_MARKER,
  type: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: GatewayType.EXCLUSIVE_WITHOUT_MARKER }),
        TypeAttribute(GatewayType.$class)
      ]
    },
    get() {
      return this.$type
    },
    set(type) {
      this.$type = type
    }
  },
  $minimumSize: Size.EMPTY,
  minimumSize: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: Size.EMPTY }), TypeAttribute(Size.$class)]
    },
    get() {
      return this.$minimumSize
    },
    set(minimumSize) {
      this.$minimumSize = minimumSize
    }
  },

  provideValue(serviceProvider) {
    const style = new GatewayNodeStyle()
    style.type = this.type
    style.minimumSize = this.minimumSize
    return style
  }
})

export const GroupNodeStyleExtension = Class('GroupNodeStyleExtension', {
  $extends: MarkupExtension,

  $insets: new Insets(15),
  insets: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: new Insets(15) }),
        TypeAttribute(Insets.$class)
      ]
    },
    get() {
      return this.$insets
    },
    set(insets) {
      this.$insets = insets
    }
  },

  provideValue(serviceProvider) {
    const style = new GroupNodeStyle()
    style.insets = this.insets
    return style
  }
})

export const BpmnEdgeStyleExtension = Class('BpmnEdgeStyleExtension', {
  $extends: MarkupExtension,

  $type: EdgeType.SEQUENCE_FLOW,
  type: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: EdgeType.SEQUENCE_FLOW }),
        TypeAttribute(EdgeType.$class)
      ]
    },
    get() {
      return this.$type
    },
    set(type) {
      this.$type = type
    }
  },

  $smoothing: 20,
  smoothing: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: 20.0 }), TypeAttribute(YNumber.$class)]
    },
    get() {
      return this.$smoothing
    },
    set(smoothing) {
      this.$smoothing = smoothing
    }
  },

  provideValue(serviceProvider) {
    const style = new BpmnEdgeStyle()
    style.type = this.type
    style.smoothing = this.smoothing
    return style
  }
})

export const EventPortStyleExtension = Class('EventPortStyleExtension', {
  $extends: MarkupExtension,

  $type: EventType.COMPENSATION,
  type: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: EventType.COMPENSATION }),
        TypeAttribute(EventType.$class)
      ]
    },
    get() {
      return this.$type
    },
    set(type) {
      this.$type = type
    }
  },

  $characteristic: EventCharacteristic.BOUNDARY_INTERRUPTING,
  characteristic: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: EventCharacteristic.BOUNDARY_INTERRUPTING }),
        TypeAttribute(EventCharacteristic.$class)
      ]
    },
    get() {
      return this.$characteristic
    },
    set(characteristic) {
      this.$characteristic = characteristic
    }
  },

  $renderSize: new Size(20, 20),
  renderSize: {
    $meta() {
      return [
        GraphMLAttribute().init({ defaultValue: new Size(20, 20) }),
        TypeAttribute(Size.$class)
      ]
    },
    get() {
      return this.$renderSize
    },
    set(size) {
      this.$renderSize = size
    }
  },

  provideValue(serviceProvider) {
    const style = new EventPortStyle()
    style.characteristic = this.characteristic
    style.type = this.type
    style.renderSize = this.renderSize
    return style
  }
})

export const AnnotationLabelStyleExtension = Class('AnnotationLabelStyleExtension', {
  $extends: MarkupExtension,

  $insets: 5,
  insets: {
    $meta() {
      return [GraphMLAttribute().init({ defaultValue: 5 }), TypeAttribute(YNumber.$class)]
    },
    get() {
      return this.$insets
    },
    set(insets) {
      this.$insets = insets
    }
  },

  provideValue(serviceProvider) {
    const style = new AnnotationLabelStyle()
    style.insets = this.insets
    return style
  }
})

export const PoolHeaderLabelModelExtension = Class('PoolHeaderLabelModelExtension', {
  $extends: MarkupExtension,

  $static: {
    INSTANCE: {
      $meta() {
        return [TypeAttribute(PoolHeaderLabelModel.$class)]
      },
      value: new PoolHeaderLabelModel()
    },

    NORTH: {
      $meta() {
        return [TypeAttribute(ILabelModelParameter.$class)]
      },
      value: PoolHeaderLabelModel.NORTH
    },

    EAST: {
      $meta() {
        return [TypeAttribute(ILabelModelParameter.$class)]
      },
      value: PoolHeaderLabelModel.EAST
    },

    SOUTH: {
      $meta() {
        return [TypeAttribute(ILabelModelParameter.$class)]
      },
      value: PoolHeaderLabelModel.SOUTH
    },

    WEST: {
      $meta() {
        return [TypeAttribute(ILabelModelParameter.$class)]
      },
      value: PoolHeaderLabelModel.WEST
    }
  },

  provideValue(serviceProvider) {
    return new PoolHeaderLabelModel()
  }
})

export const ChoreographyLabelModelExtension = Class('ChoreographyLabelModelExtension', {
  $extends: MarkupExtension,

  $static: {
    INSTANCE: {
      $meta() {
        return [TypeAttribute(ChoreographyLabelModel.$class)]
      },
      value: new ChoreographyLabelModel()
    },
    TASK_NAME_BAND: {
      $meta() {
        return [TypeAttribute(TaskNameBandParameter.$class)]
      },
      value: ChoreographyLabelModel.TASK_NAME_BAND
    },
    NORTH_MESSAGE: {
      $meta() {
        return [TypeAttribute(MessageParameter.$class)]
      },
      value: ChoreographyLabelModel.NORTH_MESSAGE
    },
    SOUTH_MESSAGE: {
      $meta() {
        return [TypeAttribute(MessageParameter.$class)]
      },
      value: ChoreographyLabelModel.SOUTH_MESSAGE
    }
  },

  provideValue(serviceProvider) {
    return new ChoreographyLabelModel()
  }
})

export const ParticipantParameterExtension = Class('ParticipantParameterExtension', {
  $extends: MarkupExtension,

  $top: false,
  top: {
    $meta() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$top
    },
    set(top) {
      this.$top = top
    }
  },

  $index: false,
  index: {
    $meta() {
      return [TypeAttribute(YNumber.$class)]
    },
    get() {
      return this.$index
    },
    set(index) {
      this.$index = index
    }
  },

  provideValue(serviceProvider) {
    return new ParticipantParameter(this.top, this.index)
  }
})

export const TaskNameBandParameterExtension = Class('TaskNameBandParameterExtension', {
  $extends: MarkupExtension,

  provideValue(serviceProvider) {
    return new TaskNameBandParameter()
  }
})

export const MessageParameterExtension = Class('MessageParameterExtension', {
  $extends: MarkupExtension,

  $north: false,
  north: {
    get() {
      return this.$north
    },
    set(north) {
      this.$north = north
    }
  },

  provideValue(serviceProvider) {
    const parameter = new MessageParameter()
    parameter.north = this.north
    return parameter
  }
})

export const ChoreographyMessageLabelStyleExtension = Class(
  'ChoreographyMessageLabelStyleExtension',
  {
    $extends: MarkupExtension,

    $textPlacement: null,
    textPlacement: {
      get() {
        return this.$textPlacement
      },
      set(placement) {
        this.$textPlacement = placement
      }
    },

    provideValue(serviceProvider) {
      const style = new ChoreographyMessageLabelStyle()
      style.textPlacement = this.textPlacement
      return style
    }
  }
)

/**
 * A serialization listener that must be added when BPMN styles are serialized.
 */
export const BpmnHandleSerializationListener = (source, args) => {
  const item = args.item

  let markupExtension
  let markupExtensionClass
  if (item instanceof PoolNodeStyle) {
    markupExtension = new PoolNodeStyleExtension()
    markupExtension.multipleInstance = item.multipleInstance
    markupExtension.tableNodeStyle = item.tableNodeStyle
    markupExtensionClass = PoolNodeStyleExtension.$class
  } else if (item instanceof AlternatingLeafStripeStyle) {
    markupExtension = new AlternatingLeafStripeStyleExtension()
    markupExtension.evenLeafDescriptor = item.evenLeafDescriptor
    markupExtension.parentDescriptor = item.parentDescriptor
    markupExtension.oddLeafDescriptor = item.oddLeafDescriptor
    markupExtensionClass = AlternatingLeafStripeStyleExtension.$class
  } else if (item instanceof StripeDescriptor) {
    markupExtension = new StripeDescriptorExtension()
    markupExtension.backgroundFill = item.backgroundFill
    markupExtension.insetFill = item.insetFill
    markupExtension.borderFill = item.borderFill
    markupExtension.borderThickness = item.borderThickness
    markupExtensionClass = StripeDescriptorExtension.$class
  } else if (item instanceof ActivityNodeStyle) {
    markupExtension = new ActivityNodeStyleExtension()
    markupExtension.activityType = item.activityType
    markupExtension.taskType = item.taskType
    markupExtension.triggerEventType = item.triggerEventType
    markupExtension.triggerEventCharacteristic = item.triggerEventCharacteristic
    markupExtension.loopCharacteristic = item.loopCharacteristic
    markupExtension.subState = item.subState
    markupExtension.insets = item.insets
    markupExtension.adHoc = item.adHoc
    markupExtension.compensation = item.compensation
    markupExtension.minimumSize = item.minimumSize
    markupExtensionClass = ActivityNodeStyleExtension.$class
  } else if (item instanceof AnnotationNodeStyle) {
    markupExtension = new AnnotationNodeStyleExtension()
    markupExtension.left = item.left
    markupExtensionClass = AnnotationNodeStyleExtension.$class
  } else if (item instanceof ChoreographyNodeStyle) {
    markupExtension = new ChoreographyNodeStyleExtension()
    markupExtension.loopCharacteristic = item.loopCharacteristic
    markupExtension.subState = item.subState
    item.topParticipants.forEach(participant => {
      markupExtension.topParticipants.add(participant)
    })
    item.bottomParticipants.forEach(participant => {
      markupExtension.bottomParticipants.add(participant)
    })
    markupExtension.initiatingMessage = item.initiatingMessage
    markupExtension.responseMessage = item.responseMessage
    markupExtension.initiatingAtTop = item.initiatingAtTop
    markupExtension.insets = item.insets
    markupExtension.type = item.type
    markupExtension.minimumSize = item.minimumSize
    markupExtensionClass = ChoreographyNodeStyleExtension.$class
  } else if (item instanceof Participant) {
    markupExtension = new ParticipantExtension()
    markupExtension.multiInstance = item.multiInstance
    markupExtensionClass = ParticipantExtension.$class
  } else if (item instanceof ConversationNodeStyle) {
    markupExtension = new ConversationNodeStyleExtension()
    markupExtension.type = item.type
    markupExtensionClass = ConversationNodeStyleExtension.$class
  } else if (item instanceof DataObjectNodeStyle) {
    markupExtension = new DataObjectNodeStyleExtension()
    markupExtension.minimumSize = item.minimumSize
    markupExtension.collection = item.collection
    markupExtension.type = item.type
    markupExtensionClass = DataObjectNodeStyleExtension.$class
  } else if (item instanceof DataStoreNodeStyle) {
    markupExtension = new DataStoreNodeStyleExtension()
    markupExtension.minimumSize = item.minimumSize
    markupExtensionClass = DataStoreNodeStyleExtension.$class
  } else if (item instanceof EventNodeStyle) {
    markupExtension = new EventNodeStyleExtension()
    markupExtension.type = item.type
    markupExtension.characteristic = item.characteristic
    markupExtension.minimumSize = item.minimumSize
    markupExtensionClass = EventNodeStyleExtension.$class
  } else if (item instanceof GatewayNodeStyle) {
    markupExtension = new GatewayNodeStyleExtension()
    markupExtension.type = item.type
    markupExtension.minimumSize = item.minimumSize
    markupExtensionClass = GatewayNodeStyleExtension.$class
  } else if (item instanceof GroupNodeStyle) {
    markupExtension = new GroupNodeStyleExtension()
    markupExtension.insets = item.insets
    markupExtensionClass = GroupNodeStyleExtension.$class
  } else if (item instanceof BpmnEdgeStyle) {
    markupExtension = new BpmnEdgeStyleExtension()
    markupExtension.type = item.type
    markupExtensionClass = BpmnEdgeStyleExtension.$class
  } else if (item instanceof EventPortStyle) {
    markupExtension = new EventPortStyleExtension()
    markupExtension.type = item.type
    markupExtension.characteristic = item.characteristic
    markupExtension.renderSize = item.renderSize
    markupExtensionClass = EventPortStyleExtension.$class
  } else if (item instanceof AnnotationLabelStyle) {
    markupExtension = new AnnotationLabelStyleExtension()
    markupExtension.insets = item.insets
    markupExtensionClass = AnnotationLabelStyleExtension.$class
  } else if (item instanceof PoolHeaderLabelModel) {
    markupExtension = new PoolHeaderLabelModelExtension()
    markupExtensionClass = PoolHeaderLabelModelExtension.$class
  } else if (item instanceof ChoreographyLabelModel) {
    markupExtension = new ChoreographyLabelModelExtension()
    markupExtensionClass = ChoreographyLabelModelExtension.$class
  } else if (item instanceof ParticipantParameter) {
    markupExtension = new ParticipantParameterExtension()
    markupExtension.top = item.top
    markupExtension.index = item.index
    markupExtensionClass = ParticipantParameterExtension.$class
  } else if (item instanceof TaskNameBandParameter) {
    markupExtension = new TaskNameBandParameterExtension()
    markupExtensionClass = TaskNameBandParameterExtension.$class
  } else if (item instanceof MessageParameter) {
    markupExtension = new MessageParameterExtension()
    markupExtension.north = item.north
    markupExtensionClass = MessageParameterExtension.$class
  } else if (item instanceof ChoreographyMessageLabelStyle) {
    markupExtension = new ChoreographyMessageLabelStyleExtension()
    markupExtension.textPlacement = item.textPlacement
    markupExtensionClass = ChoreographyMessageLabelStyleExtension.$class
  }

  if (markupExtension && markupExtensionClass) {
    const context = args.context
    context.serializeReplacement(markupExtensionClass, item, markupExtension)
    args.handled = true
  }
}

// export a default object to be able to map a namespace to this module for serialization
export default {
  SubState,
  GatewayType,
  EventType,
  ActivityType,
  BpmnPortCandidateProvider,
  BpmnReshapeHandleProvider,
  LoopCharacteristic,
  TaskType,
  ChoreographyLabelModel,
  Participant,
  ConversationType,
  ChoreographyNodeStyle,
  BpmnEdgeStyle,
  ActivityNodeStyle,
  EdgeType,
  AlternatingLeafStripeStyle,
  AnnotationNodeStyle,
  AnnotationLabelStyle,
  StripeDescriptor,
  PoolNodeStyle,
  PoolHeaderLabelModel,
  MessageLabelStyle,
  DataStoreNodeStyle,
  DataObjectNodeStyle,
  ConversationNodeStyle,
  EventNodeStyle,
  GroupNodeStyle,
  GatewayNodeStyle,
  EventPortStyle,
  ChoreographyType,
  EventCharacteristic,
  DataObjectType,
  PoolNodeStyleExtension,
  AlternatingLeafStripeStyleExtension,
  StripeDescriptorExtension,
  ActivityNodeStyleExtension,
  AnnotationNodeStyleExtension,
  ConversationNodeStyleExtension,
  ChoreographyNodeStyleExtension,
  ParticipantExtension,
  DataObjectNodeStyleExtension,
  DataStoreNodeStyleExtension,
  EventNodeStyleExtension,
  GatewayNodeStyleExtension,
  GroupNodeStyleExtension,
  BpmnEdgeStyleExtension,
  EventPortStyleExtension,
  AnnotationLabelStyleExtension,
  PoolHeaderLabelModelExtension,
  ChoreographyLabelModelExtension,
  ParticipantParameterExtension,
  TaskNameBandParameterExtension,
  MessageParameterExtension,
  ChoreographyMessageLabelStyleExtension
}
