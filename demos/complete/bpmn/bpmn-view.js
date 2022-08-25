/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CanvasComponent,
  Class,
  ClickEventArgs,
  ConstantLabelCandidateDescriptorProvider,
  CreateEdgeInputMode,
  Cursor,
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
  GradientStop,
  GraphComponent,
  GraphMLAttribute,
  GraphMLMemberVisibility,
  HandlePositions,
  HandleSerializationEventArgs,
  HandleTypes,
  HashMap,
  HorizontalTextAlignment,
  IArrow,
  IBoundsProvider,
  ICanvasContext,
  ICanvasObjectDescriptor,
  ICloneable,
  IColumn,
  ICommand,
  IDragHandler,
  IEdge,
  IEdgePathCropper,
  IEdgeStyle,
  IEditLabelHelper,
  IEnumerable,
  IEnumerator,
  IHandle,
  IHitTestable,
  IInputModeContext,
  ILabel,
  ILabelCandidateDescriptorProvider,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILabelOwner,
  ILabelStyle,
  ILabelStyleRenderer,
  IList,
  ILookup,
  IMarqueeTestable,
  INode,
  INodeInsetsProvider,
  INodeSizeConstraintProvider,
  INodeStyle,
  INodeStyleRenderer,
  Insets,
  InteriorLabelModel,
  InteriorLabelModelPosition,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  IOrientedRectangle,
  IPoint,
  IPort,
  IPortCandidate,
  IPortLocationModelParameter,
  IPortStyle,
  IPortStyleRenderer,
  IRenderContext,
  IReshapeHandleProvider,
  IRow,
  IShapeGeometry,
  IStripe,
  ITable,
  IVisibilityTestable,
  IVisualCreator,
  IVisualTemplate,
  KeyEventRecognizers,
  LabelEditingEventArgs,
  LabelStyleBase,
  LinearGradient,
  LineCap,
  LineJoin,
  List,
  MarkupExtension,
  Matrix,
  NodeSizeConstraintProvider,
  NodeStyleBase,
  NodeStyleLabelStyleAdapter,
  NodeStylePortStyleAdapter,
  OrientedRectangle,
  Point,
  PolylineEdgeStyle,
  PortCandidateProviderBase,
  RadialGradient,
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
  VerticalTextAlignment,
  Visual,
  VoidLabelStyle,
  VoidVisualCreator,
  YBoolean,
  YNumber,
  YObject
} from 'yfiles'

/**
 * Feature detection whether or not the browser supports active and passive event listeners.
 * @type {boolean}
 */
let passiveSupported = false
try {
  const opts = Object.defineProperty({}, 'passive', {
    // eslint-disable-next-line getter-return
    get: () => {
      passiveSupported = true
    }
  })
  window.addEventListener('test', null, opts)
} catch (ignored) {
  // ignore
}

/**
 * @param {!Fill} fill
 * @returns {!Fill}
 */
function getAsFrozen(fill) {
  fill.freeze()
  return fill
}

/**
 * The namespace URI for yFiles BPMN extensions to GraphML.
 * This field has the constant value "http://www.yworks.com/xml/yfiles-bpmn/2.0"
 */
export const YFILES_BPMN_NS = 'http://www.yworks.com/xml/yfiles-bpmn/2.0'

/**
 * The default namespace prefix for {@link YFILES_BPMN_NS}.
 * This field has the constant value "bpmn"
 */
export const YFILES_BPMN_PREFIX = 'bpmn'

// /////////////////////////////////////////////////////////////////////
// BPMN constants which determine the default behavior of this style //
// /////////////////////////////////////////////////////////////////////
const BPMN_CONSTANTS_DOUBLE_LINE_OFFSET = 2
const BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS = 6
const BPMN_CONSTANTS_GROUP_NODE_CORNER_RADIUS = 3
const BPMN_CONSTANTS_DEFAULT_BACKGROUND = getAsFrozen(new SolidColorFill(250, 250, 250))
const BPMN_CONSTANTS_DEFAULT_ICON_COLOR = Fill.BLACK
const BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE = null // null triggers fallback to characteristic-specific colors
const BPMN_CONSTANTS_DEFAULT_MESSAGE_OUTLINE = Fill.BLACK
const BPMN_CONSTANTS_DEFAULT_INITIATING_COLOR = Fill.WHITE
const BPMN_CONSTANTS_DEFAULT_RECEIVING_COLOR = Fill.GRAY
// Activity
const BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS = 6
const BPMN_CONSTANTS_ACTIVITY_DEFAULT_BACKGROUND = BPMN_CONSTANTS_DEFAULT_BACKGROUND
const BPMN_CONSTANTS_ACTIVITY_DEFAULT_OUTLINE = Fill.DARK_BLUE
// Gateway
const BPMN_CONSTANTS_GATEWAY_DEFAULT_BACKGROUND = BPMN_CONSTANTS_DEFAULT_BACKGROUND
const BPMN_CONSTANTS_GATEWAY_DEFAULT_OUTLINE = Fill.DARK_ORANGE
// Annotation
const BPMN_CONSTANTS_ANNOTATION_DEFAULT_BACKGROUND = BPMN_CONSTANTS_DEFAULT_BACKGROUND
const BPMN_CONSTANTS_ANNOTATION_DEFAULT_OUTLINE = Fill.BLACK
// Edges
const BPMN_CONSTANTS_EDGE_DEFAULT_COLOR = Fill.BLACK
const BPMN_CONSTANTS_EDGE_DEFAULT_INNER_COLOR = Fill.WHITE
// Choreography
const BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_BACKGROUND = BPMN_CONSTANTS_DEFAULT_BACKGROUND
const BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE = Fill.DARK_GREEN
const BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_ICON_COLOR = Fill.BLACK
const BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_MESSAGE_OUTLINE = BPMN_CONSTANTS_DEFAULT_MESSAGE_OUTLINE
const BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_INITIATING_COLOR = BPMN_CONSTANTS_DEFAULT_INITIATING_COLOR
const BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_RESPONSE_COLOR = BPMN_CONSTANTS_DEFAULT_RECEIVING_COLOR
// Conversation
const BPMN_CONSTANTS_CONVERSATION_DEFAULT_OUTLINE = Fill.DARK_GREEN
const BPMN_CONSTANTS_CONVERSATION_DEFAULT_BACKGROUND = BPMN_CONSTANTS_DEFAULT_BACKGROUND
// Data object
const BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_BACKGROUND = Fill.WHITE
const BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_OUTLINE = Fill.BLACK
// Data store
const BPMN_CONSTANTS_DATA_STORE_DEFAULT_OUTLINE = Fill.BLACK
const BPMN_CONSTANTS_DATA_STORE_DEFAULT_BACKGROUND = Fill.WHITE
// Event
const BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND = BPMN_CONSTANTS_DEFAULT_BACKGROUND
// Group
const BPMN_CONSTANTS_GROUP_DEFAULT_BACKGROUND = Fill.TRANSPARENT
const BPMN_CONSTANTS_GROUP_DEFAULT_OUTLINE = Fill.BLACK
// Messages
const BPMN_CONSTANTS_DEFAULT_INITIATING_MESSAGE_COLOR = BPMN_CONSTANTS_DEFAULT_INITIATING_COLOR
const BPMN_CONSTANTS_DEFAULT_RECEIVING_MESSAGE_COLOR = BPMN_CONSTANTS_DEFAULT_RECEIVING_COLOR
// Pools
const BPMN_CONSTANTS_DEFAULT_POOL_NODE_BACKGROUND = getAsFrozen(
  new SolidColorFill(0xe0, 0xe0, 0xe0)
)
const BPMN_CONSTANTS_DEFAULT_POOL_NODE_EVEN_LEAF_BACKGROUND = getAsFrozen(
  new SolidColorFill(196, 215, 237)
)
const BPMN_CONSTANTS_DEFAULT_POOL_NODE_EVEN_LEAF_INSET = getAsFrozen(
  new SolidColorFill(0xe0, 0xe0, 0xe0)
)
const BPMN_CONSTANTS_DEFAULT_POOL_NODE_ODD_LEAF_BACKGROUND = getAsFrozen(
  new SolidColorFill(171, 200, 226)
)
const BPMN_CONSTANTS_DEFAULT_POOL_NODE_ODD_LEAF_INSET = getAsFrozen(
  new SolidColorFill(0xe0, 0xe0, 0xe0)
)
const BPMN_CONSTANTS_DEFAULT_POOL_NODE_PARENT_BACKGROUND = getAsFrozen(
  new SolidColorFill(113, 146, 178)
)
const BPMN_CONSTANTS_DEFAULT_POOL_NODE_PARENT_INSET = getAsFrozen(
  new SolidColorFill(0xe0, 0xe0, 0xe0)
)
// Default sizes for different items
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

/**
 * Specifies if an Activity is an expanded or collapsed Sub-Process according to BPMN.
 * @see {@link ActivityNodeStyle}
 */
export const SubState = Enum('SubState', {
  /**
   * Specifies that an Activity is either no Sub-Process according to BPMN or should use no
   * Sub-Process marker.
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
   * @see {@link IFoldingView.isExpanded}
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

class ScalingLabelModel extends BaseClass(ILabelModel) {
  /**
   * @param {!Insets} [insets]
   */
  constructor(insets) {
    super()
    this._insets = insets || Insets.EMPTY
  }

  /**
   * Gets the insets to use within the node's {@link INode.layout}.
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * Sets the insets to use within the node's {@link INode.layout}.
   * @type {!Insets}
   */
  set insets(value) {
    this._insets = value
  }

  /**
   * Returns an instance that implements the given type or `null`.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-`null` implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {!Class.<T>} type the type for which an instance shall be returned
   * @returns {?T} an instance that is assignable to type or `null`
   * @see Specified by {@link ILookup.lookup}.
   * @template {*} T
   */
  lookup(type) {
    return ScalingLabelModel.STRETCH_MODEL.lookup(type)
  }

  /**
   * Provides a {@link ILookup lookup context} for the given combination of label
   * and parameter.
   * @param {!ILabel} label The label to use in the context.
   * @param {!ILabelModelParameter} parameter The parameter to use for the label in the context.
   * @returns {!ILookup} An implementation of the {@link ILookup} interface that can be used
   *   to query additional aspects of the label/parameter combination.
   * @see {@link ILookup.EMPTY}
   * @see Specified by {@link ILabelModel.getContext}.
   */
  getContext(label, parameter) {
    return ScalingLabelModel.STRETCH_MODEL.getContext(label, parameter)
  }

  /**
   * Calculates the geometry in form of an {@link IOrientedRectangle}
   * for a given label using the given model parameter.
   * @param {!ILabelModelParameter} parameter A parameter that has been created by this model.
   * This is typically the parameter that yielded this instance through its
   * {@link ILabelModelParameter.model} property.
   * @param {!ILabel} label the label to calculate the geometry for
   * @returns {!IOrientedRectangle} An instance that describes the geometry. This is typically
   * an instance designed as a flyweight, so clients should not cache the
   * instance but store the values if they need a snapshot for later use
   * @see Specified by {@link ILabelModel.getGeometry}.
   */
  getGeometry(label, parameter) {
    const scalingParameter = parameter
    const owner = label.owner instanceof INode ? label.owner : null

    if (owner) {
      const availableRect = owner.layout
      const horizontalInsets = this.insets.left + this.insets.right
      const verticalInsets = this.insets.top + this.insets.bottom

      // consider fix insets
      let x = availableRect.minX + (availableRect.width > horizontalInsets ? this.insets.left : 0)
      let y = availableRect.minY + (availableRect.height > verticalInsets ? this.insets.top : 0)
      let width =
        availableRect.width - (availableRect.width > horizontalInsets ? horizontalInsets : 0)
      let height =
        availableRect.height - (availableRect.height > verticalInsets ? verticalInsets : 0)

      // consider scaling insets
      const scalingInsets = scalingParameter.scalingInsets
      x += scalingInsets.left * width
      y += scalingInsets.top * height
      width *= 1 - scalingInsets.left - scalingInsets.right
      height *= 1 - scalingInsets.top - scalingInsets.bottom

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
    return IOrientedRectangle.EMPTY
  }

  /**
   * Creates a default parameter that can be used for this model.
   * @returns {!ILabelModelParameter} a parameter for this model instance
   * @see Specified by {@link ILabelModel.createDefaultParameter}.
   */
  createDefaultParameter() {
    const scalingParameter = new ScalingLabelModelParameter()
    scalingParameter.model = this
    scalingParameter.scalingInsets = Insets.EMPTY
    return scalingParameter
  }

  /**
   * @param {number} scale
   * @returns {!ILabelModelParameter}
   */
  createScaledParameter(scale) {
    if (scale <= 0 || scale > 1) {
      throw new Exception(`Argument '${scale}' not allowed. Valid values are in ]0; 1].`)
    }
    const scalingParameter = new ScalingLabelModelParameter()
    scalingParameter.model = this
    scalingParameter.scalingInsets = new Insets((1 - scale) / 2)
    return scalingParameter
  }

  /**
   * @param {number} scale
   * @param {number} ratio
   * @returns {!ILabelModelParameter}
   */
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

  /**
   * @type {!InteriorStretchLabelModel}
   */
  static get STRETCH_MODEL() {
    return (
      ScalingLabelModel._stretchModel ||
      (ScalingLabelModel._stretchModel = new InteriorStretchLabelModel())
    )
  }

  /**
   * @type {!ScalingLabelModelParameter}
   */
  static get STRETCH_PARAMETER() {
    return (
      ScalingLabelModel._stretchParameter ||
      (ScalingLabelModel._stretchParameter = ScalingLabelModel.STRETCH_MODEL.createParameter(
        InteriorStretchLabelModelPosition.CENTER
      ))
    )
  }

  /**
   * @type {!SimpleNode}
   */
  static get DUMMY_NODE() {
    return ScalingLabelModel._dummyNode || (ScalingLabelModel._dummyNode = new SimpleNode())
  }

  /**
   * @type {!SimpleLabel}
   */
  static get DUMMY_LABEL() {
    return (
      ScalingLabelModel._dummyLabel ||
      (ScalingLabelModel._dummyLabel = new SimpleLabel(
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
    this._model = null
    this.scalingInsets = null
    this.keepRatio = false
    this.ratio = 0
  }

  /**
   * @type {!ILabelModel}
   */
  get model() {
    return this._model
  }

  /**
   * @type {!ILabelModel}
   */
  set model(value) {
    this._model = value
  }

  /**
   * @returns {*}
   */
  clone() {
    const scalingParameter = new ScalingLabelModelParameter()
    scalingParameter.model = this.model
    scalingParameter.scalingInsets = this.scalingInsets
    scalingParameter.keepRatio = this.keepRatio
    return scalingParameter
  }

  /**
   * @param {!ILabel} label
   * @returns {boolean}
   */
  supports(label) {
    return label.owner instanceof INode
  }
}

/**
 * Provides some existing ports as well as ports on the north, south, east and west center of the
 * visual bounds of a BPMN node. An existing port is provided if it either uses an
 * {@link EventPortStyle} and have no edges attached.
 */
export class BpmnPortCandidateProvider extends PortCandidateProviderBase {
  /**
   * @param {!INode} owner
   */
  constructor(owner) {
    super()
    this.owner = owner
  }

  /**
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IPortCandidate>}
   */
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
 * handles provided by the wrapped handler to the ones in the four corners for nodes with
 * {@link GatewayNodeStyle},
 * {@link EventNodeStyle} or {@link ConversationNodeStyle}. The handles have maintain the current
 * aspect ratio of the node for these node styles because those styles keep the aspect ratio for
 * their icons.
 */
export class BpmnReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  /**
   * @param {?IReshapeHandleProvider} wrappedHandler
   * @param {?INode} node
   */
  constructor(wrappedHandler, node) {
    super()
    this.wrappedHandler = wrappedHandler
    this.node = node
  }

  /**
   * Returns the available handles provided by the wrapped handler
   * restricted to the ones in the four corners and sides for nodes with {@link GatewayNodeStyle},
   * {@link EventNodeStyle} or {@link ConversationNodeStyle}.
   * @see Specified by {@link IReshapeHandleProvider.getAvailableHandles}.
   * @param {!IInputModeContext} inputModeContext
   * @returns {!HandlePositions}
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
   * Returns a custom handle that maintains the aspect ratio of the node with
   * {@link GatewayNodeStyle},
   * {@link EventNodeStyle} or {@link ConversationNodeStyle}.
   * @see Specified by {@link IReshapeHandleProvider.getHandle}.
   * @param {!IInputModeContext} inputModeContext
   * @param {!HandlePositions} position
   * @returns {!IHandle}
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
        this.node.layout.toRect()
      )
    }
    return this.wrappedHandler.getHandle(inputModeContext, position)
  }
}

/**
 * An implementation of {@link IHandle} that keeps the aspect ratio of a node intact when resizing.
 */
class AspectRatioHandle extends BaseClass(IHandle) {
  /**
   * @param {!IHandle} handle
   * @param {!HandlePositions} position
   * @param {!Rect} layout
   */
  constructor(handle, position, layout) {
    super()
    this.lastLocation = new Point(0, 0)
    this.ratio = 0
    this.originalSize = new Size(0, 0)
    this.handle = handle
    this.position = position
    this.layout = layout
  }

  /**
   * @type {!IPoint}
   */
  get location() {
    return this.handle.location
  }

  /**
   * Stores the initial location and aspect ratio for reference, and calls the base method.
   * @see Specified by {@link IDragHandler.initializeDrag}.
   * @param {!IInputModeContext} inputModeContext
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
   * @see Specified by {@link IDragHandler.handleMove}.
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
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

  /**
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   */
  cancelDrag(inputModeContext, originalLocation) {
    this.handle.cancelDrag(inputModeContext, originalLocation)
  }

  /**
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(inputModeContext, originalLocation, newLocation) {
    this.handle.dragFinished(inputModeContext, originalLocation, this.lastLocation)
  }

  /**
   * This implementation does nothing special when clicked.
   * @param {!ClickEventArgs} evt
   */
  handleClick(evt) {}

  /**
   * @type {!HandleTypes}
   */
  get type() {
    return this.handle.type
  }

  /**
   * @type {!Cursor}
   */
  get cursor() {
    return this.handle.cursor
  }
}

// ///////////////////////////////////////////////////////////////////////////////
// BPMN placement constants which determine the default behavior of this style //
// ///////////////////////////////////////////////////////////////////////////////
const ILM2 = new InteriorLabelModel({ insets: new Insets(2) })
const ILM6 = new InteriorLabelModel({ insets: new Insets(6) })
const ISLM_INSIDE_DOUBLE_LINE = new InteriorStretchLabelModel({
  insets: new Insets(2 * BPMN_CONSTANTS_DOUBLE_LINE_OFFSET + 1)
})
const ELM15 = new ExteriorLabelModel({ insets: new Insets(15) })
const SLM = new ScalingLabelModel()
const SLM3 = new ScalingLabelModel(new Insets(3))
const BPMN_CONSTANTS_PLACEMENTS_TASK_TYPE = ILM6.createParameter(
  InteriorLabelModelPosition.NORTH_WEST
)
const BPMN_CONSTANTS_PLACEMENTS_TASK_MARKER = ISLM_INSIDE_DOUBLE_LINE.createParameter(
  InteriorStretchLabelModelPosition.SOUTH
)
const BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_MARKER = ILM2.createParameter(
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
const BPMN_CONSTANTS_PLACEMENTS_THICK_LINE = new InteriorStretchLabelModel().createParameter(
  InteriorStretchLabelModelPosition.CENTER
)
const BPMN_CONSTANTS_PLACEMENTS_INSIDE_DOUBLE_LINE = ISLM_INSIDE_DOUBLE_LINE.createParameter(
  InteriorStretchLabelModelPosition.CENTER
)
const BPMN_CONSTANTS_PLACEMENTS_POOL_NODE_MARKER = ILM2.createParameter(
  InteriorLabelModelPosition.SOUTH
)

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
   * Specifies that an Activity or Choreography has a Standard Loop Characteristic according to
   * BPMN.
   * @see {@link ActivityNodeStyle}
   * @see {@link ChoreographyNodeStyle}
   */
  LOOP: 1,
  /**
   * Specifies that an Activity or Choreography has a parallel Multi-Instance Loop Characteristic
   * according to BPMN.
   * @see {@link ActivityNodeStyle}
   * @see {@link ChoreographyNodeStyle}
   */
  PARALLEL: 2,
  /**
   * Specifies that an Activity or Choreography has a sequential Multi-Instance Loop Characteristic
   * according to BPMN.
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
class ChoreographyParameter extends BaseClass(ILabelModelParameter) {
  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      $self: [GraphMLAttribute().init({ singletonContainers: [ChoreographyLabelModel.$class] })]
    }
  }

  /**
   * @type {!ILabelModel}
   */
  get model() {
    return ChoreographyLabelModel.INSTANCE
  }

  /**
   * @returns {*}
   */
  clone() {
    return this
  }

  /**
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} parameter
   * @returns {!IOrientedRectangle}
   */
  getGeometry(label, parameter) {
    return IOrientedRectangle.EMPTY
  }

  /**
   * @param {!ILabel} label - The label to test.
   * @returns {boolean}
   */
  supports(label) {
    return label.owner instanceof INode
  }
}

/**
 * {@link ILabelModelParameter} to place participant labels at the participant bands of
 * {@link ChoreographyNodeStyle}.
 */
class ParticipantParameter extends ChoreographyParameter {
  /**
   * Creates a new instance of {@link ParticipantParameter}.
   * @param {boolean} top whether or not the label belongs to a top participant.
   * @param {number} index the position of the participant in its group (top or bottom
   *   participants).
   */
  constructor(top, index) {
    super()
    this.top = top
    this.index = index
  }

  /**
   * Creates a positioned rectangle that is placed on the according participant band.
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} parameter
   * @returns {!IOrientedRectangle}
   */
  getGeometry(label, parameter) {
    if (label.owner instanceof INode) {
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
  }

  /**
   * @returns {*}
   */
  clone() {
    return new ParticipantParameter(this.top, this.index)
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      $self: [GraphMLAttribute().init({ singletonContainers: [ChoreographyLabelModel.$class] })]
    }
  }

  /**
   * @type {!InteriorLabelModel}
   */
  static get INTERIOR_LABEL_MODEL() {
    return (
      ParticipantParameter._interiorLabelModel ||
      (ParticipantParameter._interiorLabelModel = new InteriorLabelModel({
        insets: new Insets(3)
      }))
    )
  }

  static get PLACEMENT() {
    return (
      ParticipantParameter._placement ||
      (ParticipantParameter._placement = ParticipantParameter.INTERIOR_LABEL_MODEL.createParameter(
        InteriorLabelModelPosition.NORTH
      ))
    )
  }
}

/**
 * A label model for nodes using a {@link ChoreographyNodeStyle} that position labels on the
 * participant or task name bands.
 */
export class ChoreographyLabelModel extends BaseClass(ILabelModel, ILabelModelParameterProvider) {
  /**
   * Calculates the geometry in form of an {@link IOrientedRectangle}
   * for a given label using the given model parameter.
   * @param {!ILabelModelParameter} parameter A parameter that has been created by this model.
   * This is typically the parameter that yielded this instance through its
   * {@link ILabelModelParameter.model} property.
   * @param {!ILabel} label the label to calculate the geometry for
   * @returns {!IOrientedRectangle} An instance that describes the geometry. This is typically
   * an instance designed as a flyweight, so clients should not cache the
   * instance but store the values if they need a snapshot for later use
   * @see Specified by {@link ILabelModel.getGeometry}.
   */
  getGeometry(label, parameter) {
    if (
      label.owner instanceof INode &&
      label.owner.style instanceof ChoreographyNodeStyle &&
      parameter instanceof ChoreographyParameter
    ) {
      return parameter.getGeometry(label, parameter)
    } else if (label.owner instanceof INode) {
      const layout = label.owner.layout
      return new OrientedRectangle(layout.x, layout.y + layout.height, layout.width, layout.height)
    }
    return IOrientedRectangle.EMPTY
  }

  /**
   * Returns {@link ChoreographyLabelModel.TASK_NAME_BAND} as default parameter.
   * @see Specified by {@link ILabelModel.createDefaultParameter}.
   * @returns {!ILabelModelParameter}
   */
  createDefaultParameter() {
    return ChoreographyLabelModel.TASK_NAME_BAND
  }

  /**
   * Creates the parameter for the participant at the given position.
   * @param {boolean} top Whether the index refers to {@link ChoreographyNodeStyle.topParticipants}
   *   or
   *   {@link ChoreographyNodeStyle.bottomParticipants}.
   * @param {number} index The index of the participant band the label shall be placed in.
   * @returns {!ILabelModelParameter}
   */
  createParticipantParameter(top, index) {
    return new ParticipantParameter(top, index)
  }

  /**
   * Provides a {@link ILookup lookup context} for the given combination of label
   * and parameter.
   * @param {!ILabel} label The label to use in the context.
   * @param {!ILabelModelParameter} parameter The parameter to use for the label in the context.
   * @returns {!ILookup} An implementation of the {@link ILookup} interface that can be used
   *   to query additional aspects of the label/parameter combination.
   * @see {@link ILookup.EMPTY}
   * @see Specified by {@link ILabelModel.getContext}.
   */
  getContext(label, parameter) {
    return InteriorLabelModel.CENTER.model.getContext(label, parameter)
  }

  /**
   * Returns an instance that implements the given type or `null`.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-`null` implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {!Class.<T>} type the type for which an instance shall be returned
   * @returns {?T} an instance that is assignable to type or `null`
   * @see Specified by {@link ILookup.lookup}.
   * @template {*} T
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
   * Returns an enumerator over a set of possible {@link ILabelModelParameter}
   * instances that can be used for the given label and model.
   * @param {!ILabel} label The label instance to use.
   * @param {!ILabelModel} model The model to provide parameters for.
   * @returns {!IEnumerable.<ILabelModelParameter>} A possibly empty enumerator over a
   *   set of label model parameters.
   * @see Specified by {@link ILabelModelParameterProvider.getParameters}.
   */
  getParameters(label, model) {
    const parameters = new List()
    if (label.owner instanceof INode && label.owner.style instanceof ChoreographyNodeStyle) {
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
  }

  /**
   * Finds the parameter for the next free location at a node with {@link ChoreographyNodeStyle}.
   * This function will traverse all valid positions in the following order until it finds a free
   * location:
   *
   * - Task band
   * - Participant bands
   * - Top message
   * - Bottom message
   * @param {!INode} node
   * @returns {?ILabelModelParameter}
   */
  findNextParameter(node) {
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
              const pp = parameter
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
  }

  /**
   * @type {!ChoreographyLabelModel}
   */
  static get INSTANCE() {
    return (
      ChoreographyLabelModel._instance ||
      (ChoreographyLabelModel._instance = new ChoreographyLabelModel())
    )
  }

  /**
   * @type {!InteriorLabelModel}
   */
  static get INTERIOR_LABEL_MODEL() {
    return (
      ChoreographyLabelModel._interiorLabel ||
      (ChoreographyLabelModel._interiorLabel = new InteriorLabelModel())
    )
  }

  /**
   * @type {!SimpleNode}
   */
  static get DUMMY_NODE() {
    return (
      ChoreographyLabelModel._dummyNode || (ChoreographyLabelModel._dummyNode = new SimpleNode())
    )
  }

  /**
   * @type {!SimpleLabel}
   */
  static get DUMMY_LABEL() {
    return (
      ChoreographyLabelModel._dummyLabel ||
      (ChoreographyLabelModel._dummyLabel = new SimpleLabel(
        ChoreographyLabelModel.DUMMY_NODE,
        '',
        InteriorLabelModel.CENTER
      ))
    )
  }

  /**
   * @type {!TaskNameBandParameter}
   */
  static get TASK_NAME_BAND() {
    return (
      ChoreographyLabelModel._taskNameBand ||
      (ChoreographyLabelModel._taskNameBand = new TaskNameBandParameter())
    )
  }

  /**
   * Returns a layout parameter that describes a position north of the node.
   * @type {!MessageParameter}
   */
  static get NORTH_MESSAGE() {
    if (!ChoreographyLabelModel._northMessage) {
      const messageParameter = new MessageParameter()
      messageParameter.north = true
      ChoreographyLabelModel._northMessage = messageParameter
    }
    return ChoreographyLabelModel._northMessage
  }

  /**
   * Returns a layout parameter that describes a position south of the node.
   * @type {!MessageParameter}
   */
  static get SOUTH_MESSAGE() {
    if (!ChoreographyLabelModel._southMessage) {
      const messageParameter = new MessageParameter()
      messageParameter.north = false
      ChoreographyLabelModel._southMessage = messageParameter
    }
    return ChoreographyLabelModel._southMessage
  }
}

/**
 * {@link ILabelModelParameter} that places the label on the task name band in the center of the
 * node.
 */
class TaskNameBandParameter extends ChoreographyParameter {
  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      $self: [GraphMLAttribute().init({ singletonContainers: [ChoreographyLabelModel.$class] })]
    }
  }

  /**
   * @param {!ILabel} label
   * @returns {!IOrientedRectangle}
   */
  getGeometry(label) {
    const owner = label.owner
    const nodeStyle = owner.style
    ChoreographyLabelModel.DUMMY_NODE.layout = nodeStyle.getTaskNameBandBounds(owner)
    ChoreographyLabelModel.DUMMY_LABEL.preferredSize = label.preferredSize
    return ChoreographyLabelModel.INTERIOR_LABEL_MODEL.getGeometry(
      ChoreographyLabelModel.DUMMY_LABEL,
      InteriorLabelModel.CENTER
    )
  }

  /**
   * @returns {*}
   */
  clone() {
    return new TaskNameBandParameter()
  }
}

/**
 * {@link ILabelModelParameter} that places the label above or below the node.
 */
class MessageParameter extends ChoreographyParameter {
  constructor() {
    super()
    this.north = false
  }

  /**
   * @param {!ILabel} label
   * @returns {!IOrientedRectangle}
   */
  getGeometry(label) {
    const parameter = this.north
      ? MessageParameter.NORTH_PARAMETER
      : MessageParameter.SOUTH_PARAMETER
    return parameter.model.getGeometry(label, parameter)
  }

  /**
   * @param {!ILabel} label
   * @returns {boolean}
   */
  supports(label) {
    return super.supports(label)
  }

  /**
   * @returns {*}
   */
  clone() {
    const messageParameter = new MessageParameter()
    messageParameter.north = this.north
    return messageParameter
  }

  /**
   * Returns a preconfigured parameter instance that places the label above the node.
   * @type {!ILabelModelParameter}
   */
  static get NORTH_PARAMETER() {
    if (!MessageParameter._northParameter) {
      const model = new SandwichLabelModel()
      model.yOffset = 15
      MessageParameter._northParameter = model.createNorthParameter()
    }
    return MessageParameter._northParameter
  }

  /**
   * Returns a preconfigured parameter instance that places the label below the node.
   * @type {!ILabelModelParameter}
   */
  static get SOUTH_PARAMETER() {
    if (!MessageParameter._southParameter) {
      const model = new SandwichLabelModel()
      model.yOffset = 15
      MessageParameter._southParameter = model.createSouthParameter()
    }
    return MessageParameter._southParameter
  }
}

/**
 * An {@link NodeStyleBase} implementation used as base class for nodes styles representing BPMN
 * elements.
 */
export class BpmnNodeStyle extends NodeStyleBase {
  constructor() {
    super()
    this._minimumSize = Size.EMPTY

    // the icon that determines the look and shape of the node.
    this.icon = null

    // the counter of modifications
    this.modCount = 0
  }

  /**
   * Gets the minimum node size for nodes using this style.
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * Sets the minimum node size for nodes using this style.
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * Callback that creates the visual.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!IRenderContext} renderContext The render context.
   * @returns {?SvgVisual} The visual as required by the {@link IVisualCreator.createVisual}
   *   interface.
   * @see {@link NodeStyleBase.updateVisual}
   */
  createVisual(renderContext, node) {
    this.updateIcon(node)
    if (this.icon == null) {
      return null
    }

    const bounds = node.layout
    this.icon.setBounds(new Rect(Point.ORIGIN, bounds.toSize()))
    const visual = this.icon.createVisual(renderContext)

    const container = new SvgVisualGroup()
    if (visual != null) {
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
   * Callback that updates the visual previously created by {@link NodeStyleBase.createVisual}.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!IRenderContext} renderContext The render context.
   * @param {!SvgVisual} oldVisual The visual that has been created in the call to {@link
   *   NodeStyleBase#createVisual}.
   * @returns {?SvgVisual} The visual as required by the {@link IVisualCreator.createVisual}
   *   interface.
   * @see {@link NodeStyleBase.createVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    if (this.icon == null) {
      return null
    }

    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container == null) {
      this.createVisual(renderContext, node)
    }

    const cache = container != null ? container['render-data-cache'] : null
    if (cache == null || cache.modCount !== this.modCount) {
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

      let oldIconVisual = null
      let newIconVisual
      if (container.children.size === 0) {
        newIconVisual = this.icon.createVisual(renderContext)
      } else {
        oldIconVisual = container.children.first()
        newIconVisual = this.icon.updateVisual(renderContext, oldIconVisual)
      }

      // update visual
      if (oldIconVisual !== newIconVisual) {
        if (oldIconVisual != null) {
          container.remove(oldIconVisual)
        }
        if (newIconVisual != null) {
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
   * Updates the {@link BpmnNodeStyle.icon}.
   * This method is called by {@link BpmnNodeStyle.createVisual}.
   * @param {!INode} node
   */
  updateIcon(node) {}

  /**
   * Performs the {@link ILookup.lookup} operation for the
   * {@link INodeStyleRenderer.getContext} that has been queried from the
   * {@link NodeStyleBase.renderer}.
   * @param {!INode} node The node to use for the context lookup.
   * @param {!Class} type The type to query.
   * @returns {!object} An implementation of the `type` or `null`.
   */
  lookup(node, type) {
    const lookup = super.lookup(node, type)
    if (lookup == null && type === INodeSizeConstraintProvider.$class) {
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
    this._modCount = 0
    this._multiInstance = false
  }

  /**
   * @type {number}
   */
  get modCount() {
    return this._modCount
  }

  /**
   * Gets if the participant contains multiple instances.
   * @type {boolean}
   */
  get multiInstance() {
    return this._multiInstance
  }

  /**
   * Sets if the participant contains multiple instances.
   * @type {boolean}
   */
  set multiInstance(value) {
    if (this._multiInstance !== value) {
      this._modCount++
      this._multiInstance = value
    }
  }

  /**
   * @returns {number}
   */
  getSize() {
    return this.multiInstance ? 32 : 20
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    const newParticipant = new Participant()
    newParticipant.multiInstance = this.multiInstance
    return newParticipant
  }
}

/**
 * An {@link IVisualCreator} that allows to set bounds for the visualization.
 * To use this class for the flyweight pattern, {@link Icon.setBounds} should be called before
 * creating or updating the visuals.
 */
class Icon extends BaseClass(IVisualCreator) {
  constructor() {
    super()
    this.bounds = new Rect(0, 0, 0, 0)
  }

  /**
   * Sets the bounds the visual shall consider.
   * @param {!Rect} bounds
   */
  setBounds(bounds) {
    this.bounds = bounds
  }

  /**
   * @param {!IRenderContext} context
   * @returns {?SvgVisual}
   */
  createVisual(context) {
    return null
  }

  /**
   * @param {!IRenderContext} context
   * @param {?SvgVisual} oldVisual
   * @returns {?SvgVisual}
   */
  updateVisual(context, oldVisual) {
    return null
  }
}

/**
 * An {@link Icon} that combines multiple icons in an horizontal line.
 */
class LineUpIcon extends Icon {
  /**
   * @param {!List.<Icon>} icons
   * @param {!Size} innerIconSize
   * @param {number} gap
   */
  constructor(icons, innerIconSize, gap) {
    super()
    this.icons = icons
    this.innerIconSize = innerIconSize
    this.gap = gap

    const combinedWidth = icons.size * innerIconSize.width + (icons.size - 1) * gap
    this.combinedSize = new Size(combinedWidth, innerIconSize.height)
  }

  /**
   * @param {!IRenderContext} context
   * @returns {?SvgVisual}
   */
  createVisual(context) {
    if (this.bounds == null) {
      return null
    }

    const container = new SvgVisualGroup()

    let offset = 0
    this.icons.forEach(pathIcon => {
      pathIcon.setBounds(new Rect(offset, 0, this.innerIconSize.width, this.innerIconSize.height))
      const pathIconVisual = pathIcon.createVisual(context)
      container.add(pathIconVisual)
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

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {?SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container == null || container.children.size !== this.icons.size) {
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

  /**
   * @param {!Rect} bounds
   */
  setBounds(bounds) {
    super.setBounds(Rect.fromCenter(bounds.center, this.combinedSize))
  }
}

/**
 * An {@link Icon} whose position is specified by an {@link ILabelModelParameter}.
 */
class PlacedIcon extends Icon {
  /**
   * @param {!Icon} innerIcon
   * @param {!ILabelModelParameter} placementParameter
   * @param {!Size} minimumSize
   */
  constructor(innerIcon, placementParameter, minimumSize) {
    super()
    this.dummyNode = new SimpleNode()
    this.innerIcon = innerIcon
    this.placementParameter = placementParameter
    const dummyLabel = new SimpleLabel(this.dummyNode, '', placementParameter)
    dummyLabel.preferredSize = minimumSize
    this.dummyLabel = dummyLabel
  }

  /**
   * @param {!IRenderContext} context
   * @returns {?SvgVisual}
   */
  createVisual(context) {
    return this.innerIcon.createVisual(context)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {?SvgVisual}
   */
  updateVisual(context, oldVisual) {
    return this.innerIcon.updateVisual(context, oldVisual)
  }

  /**
   * @param {!Rect} bounds
   */
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

  /**
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createVisual(context) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', `${this.bounds.x}`)
    rect.setAttribute('y', `${this.bounds.y}`)
    rect.setAttribute('width', `${this.bounds.width}`)
    rect.setAttribute('height', `${this.bounds.height}`)
    rect.setAttribute('rx', `${this.cornerRadius}`)
    rect.setAttribute('ry', `${this.cornerRadius}`)
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

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const rect = oldVisual.svgElement
    const oldCache = rect['render-data-cache']

    if (!oldCache.equals(this.bounds.width, this.bounds.height, this.stroke, this.fill)) {
      rect.setAttribute('width', `${this.bounds.width}`)
      rect.setAttribute('height', `${this.bounds.height}`)
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

  /**
   * @param {!Rect} bounds
   */
  setBounds(bounds) {
    super.setBounds(bounds)
  }
}

/**
 * An {@link Icon} that combines multiple icons. This can be useful when creating complex images
 * like a timer.
 */
class CombinedIcon extends Icon {
  /**
   * @param {!List.<Icon>} icons
   */
  constructor(icons) {
    super()
    this.icons = icons
  }

  /**
   * @param {!IRenderContext} context
   * @returns {?SvgVisual}
   */
  createVisual(context) {
    if (this.bounds == null) {
      return null
    }
    const container = new SvgVisualGroup()

    const iconBounds = new Rect(Point.ORIGIN, this.bounds.toSize())
    this.icons.forEach(icon => {
      icon.setBounds(iconBounds)
      const iconVisual = icon.createVisual(context)
      container.add(iconVisual)
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

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {?SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container == null || container.children.size !== this.icons.size) {
      return this.createVisual(context)
    }

    const cache = container['render-data-cache']

    if (!cache.size.equals(this.bounds.size)) {
      // size changed -> we have to update the icons
      const iconBounds = new Rect(Point.ORIGIN, this.bounds.size.toSize())
      this.icons.forEach((pathIcon, index) => {
        pathIcon.setBounds(iconBounds)
        const oldPathVisual = container.children.at(index)
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

  /**
   * @param {!IRenderContext} context
   * @returns {?SvgVisual}
   */
  createVisual(context) {
    if (!this.path) {
      return null
    }
    const matrix2D = new Matrix()
    matrix2D.scale(Math.max(0, this.bounds.width), Math.max(0, this.bounds.height))

    const svgPath = this.path.createSvgPath(matrix2D)
    Stroke.setStroke(this.stroke, svgPath, context)
    Fill.setFill(this.fill, svgPath, context)
    svgPath['render-data-cache'] = new PathIconState(
      this.bounds.width,
      this.bounds.height,
      this.stroke,
      this.fill
    )

    SvgVisual.setTranslate(svgPath, this.bounds.x, this.bounds.y)

    return new SvgVisual(svgPath)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {?SvgVisual}
   */
  updateVisual(context, oldVisual) {
    if (!this.path) {
      return null
    }

    const path = oldVisual.svgElement
    if (path == null) {
      return this.createVisual(context)
    }

    const oldCache = path['render-data-cache']

    if (!oldCache.stroke.equals(this.stroke)) {
      Stroke.setStroke(this.stroke, path, context)
      oldCache.stroke = this.stroke
    }
    if (oldCache.fill != null && oldCache.fill !== this.fill) {
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

  /**
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createVisual(context) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute(
      'd',
      `M 0 ${this.topLeftRadius}
       Q 0 0
         ${this.topLeftRadius} ${0}
       L ${this.bounds.width - this.topRightRadius} ${0}
       Q ${this.bounds.width} 0
         ${this.bounds.width} ${this.topRightRadius}
       L ${this.bounds.width} ${this.bounds.height - this.bottomRightRadius}
       Q ${this.bounds.width} ${this.bounds.height}
         ${this.bounds.width - this.bottomRightRadius} ${this.bounds.height}
       L ${this.bottomLeftRadius} ${this.bounds.height}
       Q 0 ${this.bounds.height} 0 ${this.bounds.height - this.bottomRightRadius}
       Z`
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

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {!SvgVisual}
   */
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
        `M 0 ${this.topLeftRadius}
         Q 0 0
           ${this.topLeftRadius} ${0}
         L ${this.bounds.width - this.topRightRadius} ${0}
         Q ${this.bounds.width} 0
           ${this.bounds.width} ${this.topRightRadius}
         L ${this.bounds.width} ${this.bounds.height - this.bottomRightRadius}
         Q ${this.bounds.width} ${this.bounds.height}
           ${this.bounds.width - this.bottomRightRadius} ${this.bounds.height}
         L ${this.bottomLeftRadius} ${this.bounds.height}
         Q 0 ${this.bounds.height} 0
           ${this.bounds.height - this.bottomRightRadius}
         Z`
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
    this._path = null
    this.stroke = null
    this.fill = null
    this.clear()
  }

  /**
   * @type {?GeneralPath}
   */
  get path() {
    return this._path || (this._path = new GeneralPath())
  }

  /**
   * @type {?GeneralPath}
   */
  set path(value) {
    this._path = value
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  moveTo(x, y) {
    this.path && this.path.moveTo(x, y)
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  lineTo(x, y) {
    this.path && this.path.lineTo(x, y)
  }

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {number} x
   * @param {number} y
   */
  quadTo(cx, cy, x, y) {
    this.path && this.path.quadTo(cx, cy, x, y)
  }

  /**
   * @param {number} c1x
   * @param {number} c1y
   * @param {number} c2x
   * @param {number} c2y
   * @param {number} x
   * @param {number} y
   */
  cubicTo(c1x, c1y, c2x, c2y, x, y) {
    this.path && this.path.cubicTo(c1x, c1y, c2x, c2y, x, y)
  }

  /**
   * @param {number} r
   * @param {number} cx
   * @param {number} cy
   * @param {number} fromAngle
   * @param {number} toAngle
   */
  arcTo(r, cx, cy, fromAngle, toAngle) {
    if (!this.path) {
      return
    }
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

    const m = ((Math.sqrt(2) - 1) * 4) / 3
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

  /**
   * @returns {?Icon}
   */
  createEllipseIcon() {
    if (!this.path) {
      return null
    }
    this.path.appendEllipse(new Rect(0, 0, 1, 1), false)
    return this.getPathIcon()
  }

  close() {
    if (!this.path) {
      return
    }
    this.path.close()
  }

  /**
   * @param {!List.<Icon>} icons
   * @returns {!Icon}
   */
  combineIcons(icons) {
    const icon = new CombinedIcon(icons)
    this.clear()
    return icon
  }

  /**
   * @param {!List.<Icon>} icons
   * @param {!Size} innerIconSize
   * @param {number} gap
   * @returns {!Icon}
   */
  createLineUpIcon(icons, innerIconSize, gap) {
    const icon = new LineUpIcon(icons, innerIconSize, gap)
    this.clear()
    return icon
  }

  /**
   * @returns {!Icon}
   */
  getPathIcon() {
    const icon = new PathIcon()
    icon.path = this.path
    icon.stroke = this.stroke
    icon.fill = this.fill

    this.clear()
    return icon
  }

  /**
   * @param {number} cornerRadius
   * @returns {!Icon}
   */
  createRectIcon(cornerRadius) {
    const rectIcon = new RectIcon()
    rectIcon.stroke = this.stroke
    rectIcon.fill = this.fill
    rectIcon.cornerRadius = cornerRadius

    this.clear()
    return rectIcon
  }

  /**
   * @param {number} topLeftRadius
   * @param {number} topRightRadius
   * @param {number} bottomLeftRadius
   * @param {number} bottomRightRadius
   * @returns {!Icon}
   */
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
  /**
   * @param {number} type
   * @param {boolean} filled
   */
  constructor(type, filled) {
    this.type = type
    this.filled = filled
  }

  /**
   * @param {!object} obj
   * @returns {boolean}
   */
  equals(obj) {
    if (!(obj instanceof EventTypeWithFill)) {
      return false
    }
    return obj.type === this.type && obj.filled === this.filled
  }

  /**
   * @returns {number}
   */
  hashCode() {
    let code
    switch (this.type) {
      case EventType.PLAIN:
        code = 0
        break
      case EventType.MESSAGE:
        code = 1
        break
      case EventType.TIMER:
        code = 2
        break
      case EventType.ESCALATION:
        code = 3
        break
      case EventType.CONDITIONAL:
        code = 4
        break
      case EventType.LINK:
        code = 5
        break
      case EventType.ERROR:
        code = 6
        break
      case EventType.CANCEL:
        code = 7
        break
      case EventType.COMPENSATION:
        code = 8
        break
      case EventType.SIGNAL:
        code = 9
        break
      case EventType.MULTIPLE:
        code = 10
        break
      case EventType.PARALLEL_MULTIPLE:
        code = 11
        break
      case EventType.TERMINATE:
        code = 12
        break
      default:
        code = 13
        break
    }
    return (code * 397) ^ (this.filled ? 1 : 0)
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
   * Specifies that a Conversation is a Call Conversation according to BPMN where a Global
   * Conversation is called.
   * @see {@link ConversationNodeStyle}
   */
  CALLING_GLOBAL_CONVERSATION: 2,
  /**
   * Specifies that a Conversation is a Call Conversation according to BPMN where a Collaboration
   * is called.
   * @see {@link ConversationNodeStyle}
   */
  CALLING_COLLABORATION: 3
})

/**
 * A class that stores the important information about a participant to be used as a key in a map.
 */
class ParticipantBandType {
  /**
   * @param {!Fill} fill
   * @param {number} topRadius
   * @param {number} bottomRadius
   */
  constructor(fill, topRadius, bottomRadius) {
    this.fill = fill
    this.topRadius = topRadius
    this.bottomRadius = bottomRadius
  }

  /**
   * @param {!object} obj
   * @returns {boolean}
   */
  equals(obj) {
    if (!(obj instanceof ParticipantBandType)) {
      return false
    }
    return (
      obj.fill === this.fill &&
      obj.topRadius === this.topRadius &&
      obj.bottomRadius === this.bottomRadius
    )
  }

  /**
   * @returns {number}
   */
  hashCode() {
    return (this.fill.hashCode() * 397) ^ (this.topRadius * 397) ^ this.bottomRadius
  }
}

/**
 * A class that stores all important information for a plus icon to be used as key in a map.
 */
class PlusData {
  /**
   * @param {number} size
   * @param {!Stroke} stroke
   * @param {!Fill} fill
   */
  constructor(size, stroke, fill) {
    this.size = size
    this.stroke = stroke
    this.fill = fill
  }

  /**
   * @param {!object} obj
   * @returns {boolean}
   */
  equals(obj) {
    if (!(obj instanceof PlusData)) {
      return false
    }
    return obj.size === this.size && obj.stroke === this.stroke && obj.fill === this.fill
  }

  /**
   * @returns {number}
   */
  hashCode() {
    const fillHC = this.fill != null ? this.fill.hashCode() : 1
    return (((this.size * 397) ^ this.stroke.hashCode()) * 397) ^ fillHC
  }
}

/**
 * Factory class providing icons according to the BPMN.
 */
class IconFactory {
  /**
   * @param {!Icon} icon
   * @param {!ILabelModelParameter} placement
   * @param {!Size} innerSize
   * @returns {!Icon}
   */
  static createPlacedIcon(icon, placement, innerSize) {
    return new PlacedIcon(icon, placement, innerSize)
  }

  /**
   * @param {!List.<Icon>} icons
   * @returns {!Icon}
   */
  static createCombinedIcon(icons) {
    return IconFactory.BUILDER.combineIcons(icons)
  }

  /**
   * @param {!List.<Icon>} icons
   * @param {!Size} innerIconSize
   * @param {number} gap
   * @returns {!Icon}
   */
  static createLineUpIcon(icons, innerIconSize, gap) {
    return IconFactory.BUILDER.createLineUpIcon(icons, innerIconSize, gap)
  }

  /**
   * @param {number} type
   * @param {!Fill} background
   * @param {!Fill} outlineFill
   * @returns {!Icon}
   */
  static createActivity(type, background, outlineFill) {
    const hasDefaultColors =
      IconFactory.equalFill(background, BPMN_CONSTANTS_ACTIVITY_DEFAULT_BACKGROUND) &&
      IconFactory.equalFill(outlineFill, BPMN_CONSTANTS_ACTIVITY_DEFAULT_OUTLINE)

    let result = IconFactory.ACTIVITY_ICONS.get(type)
    if (hasDefaultColors && result) {
      return result
    }

    let outlineStroke
    switch (type) {
      case ActivityType.EVENT_SUB_PROCESS: {
        outlineStroke = new Stroke({
          fill: outlineFill,
          thickness: 1,
          dashStyle: DashStyle.DOT,
          lineCap: LineCap.ROUND
        })
        break
      }
      case ActivityType.CALL_ACTIVITY: {
        outlineStroke = new Stroke(outlineFill, 3)
        break
      }
      default:
        outlineStroke = new Stroke(outlineFill)
        break
    }
    outlineStroke.freeze()

    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = outlineStroke
    BUILDER.fill = background

    if (type === ActivityType.TRANSACTION) {
      const icons = new List()
      icons.add(BUILDER.createRectIcon(BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS))

      BUILDER.fill = background
      BUILDER.stroke = outlineStroke
      const rectIcon = BUILDER.createRectIcon(
        BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS - BPMN_CONSTANTS_DOUBLE_LINE_OFFSET
      )
      icons.add(
        IconFactory.createPlacedIcon(rectIcon, BPMN_CONSTANTS_PLACEMENTS_DOUBLE_LINE, Size.EMPTY)
      )
      result = BUILDER.combineIcons(icons)
    } else {
      result = BUILDER.createRectIcon(BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS)
    }

    if (hasDefaultColors) {
      IconFactory.ACTIVITY_ICONS.set(type, result)
    }

    return result
  }

  /**
   * @param {number} type
   * @param {!Fill} iconFill
   * @param {!Fill} background
   * @returns {?Icon}
   */
  static createActivityTaskType(type, iconFill, background) {
    const hasDefaultColor = IconFactory.equalFill(iconFill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    let result = IconFactory.TASK_ICONS.get(type)
    if (hasDefaultColor && result) {
      return result
    }

    const BUILDER = IconFactory.BUILDER
    let icons
    switch (type) {
      case TaskType.SEND: {
        result = IconFactory.createPlacedIcon(
          IconFactory.createMessage(Stroke.TRANSPARENT, iconFill, true),
          BPMN_CONSTANTS_PLACEMENTS_ACTIVITY_TASK_TYPE_MESSAGE,
          Size.EMPTY
        )
        break
      }
      case TaskType.RECEIVE: {
        const stroke = new Stroke(iconFill)
        stroke.freeze()
        result = IconFactory.createPlacedIcon(
          IconFactory.createMessage(stroke, Fill.TRANSPARENT),
          BPMN_CONSTANTS_PLACEMENTS_ACTIVITY_TASK_TYPE_MESSAGE,
          Size.EMPTY
        )
        break
      }
      case TaskType.USER: {
        const stroke = new Stroke({
          fill: iconFill,
          lineCap: LineCap.ROUND,
          lineJoin: LineJoin.ROUND
        })
        stroke.freeze()
        BUILDER.stroke = stroke

        iconFill = iconFill || Fill.BLACK
        const color = iconFill.color
        const lightFill = new SolidColorFill(color.r, color.g, color.b, 255 * 0.17)
        lightFill.freeze()
        BUILDER.fill = lightFill

        // body + head
        icons = new List()
        BUILDER.moveTo(1, 1)
        BUILDER.lineTo(0, 1)
        BUILDER.lineTo(0, 0.701)
        BUILDER.quadTo(0.13, 0.5, 0.316, 0.443)
        BUILDER.lineTo(
          0.5 + 0.224 * Math.cos((3.0 / 4.0) * Math.PI),
          0.224 + 0.224 * Math.sin((3.0 / 4.0) * Math.PI)
        )
        BUILDER.arcTo(0.224, 0.5, 0.224, (3.0 / 4.0) * Math.PI, (9.0 / 4.0) * Math.PI)
        BUILDER.lineTo(0.684, 0.443)
        BUILDER.quadTo(0.87, 0.5, 1, 0.701)
        BUILDER.close()
        icons.add(BUILDER.getPathIcon())

        // hair
        BUILDER.stroke = stroke
        BUILDER.fill = iconFill
        BUILDER.moveTo(0.287, 0.229)
        BUILDER.cubicTo(0.48, 0.053, 0.52, 0.253, 0.713, 0.137)
        BUILDER.arcTo(0.224, 0.5, 0.224, (31.0 / 16.0) * Math.PI, Math.PI)
        BUILDER.close()
        icons.add(BUILDER.getPathIcon())

        BUILDER.stroke = stroke

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
        const stroke = new Stroke({
          fill: iconFill,
          lineCap: LineCap.ROUND,
          lineJoin: LineJoin.ROUND
        })
        stroke.freeze()
        BUILDER.stroke = stroke
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
        iconFill = iconFill || Fill.BLACK
        const darkColorFill = iconFill.color
        const darkFill = new SolidColorFill(
          darkColorFill.r,
          darkColorFill.g,
          darkColorFill.b,
          255 * 0.5
        )
        darkFill.freeze()
        const lightColorFill = iconFill.color
        const lightFill = new SolidColorFill(
          lightColorFill.r,
          lightColorFill.g,
          lightColorFill.b,
          255 * 0.17
        )
        lightFill.freeze()
        const stroke = new Stroke(iconFill)
        stroke.freeze()
        BUILDER.fill = darkFill
        BUILDER.stroke = stroke

        // outline
        BUILDER.moveTo(0, 0.1)
        BUILDER.lineTo(1, 0.1)
        BUILDER.lineTo(1, headHeight + 0.1)
        BUILDER.lineTo(0, headHeight + 0.1)
        BUILDER.close()
        icons.add(BUILDER.getPathIcon())

        // rows outline
        BUILDER.fill = lightFill
        BUILDER.stroke = stroke
        BUILDER.moveTo(0, 0.1 + headHeight)
        BUILDER.lineTo(1, 0.1 + headHeight)
        BUILDER.lineTo(1, 0.9)
        BUILDER.lineTo(0, 0.9)
        BUILDER.close()
        icons.add(BUILDER.getPathIcon())

        // line between second and third row
        BUILDER.stroke = stroke
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
        const stroke = new Stroke(iconFill, 0.3)
        stroke.freeze()
        const darkColorFill = iconFill.color
        const darkFill = new SolidColorFill(
          darkColorFill.r,
          darkColorFill.g,
          darkColorFill.b,
          255 * 0.5
        )
        darkFill.freeze()
        const lightColorFill = iconFill.color
        const lightFill = new SolidColorFill(
          lightColorFill.r,
          lightColorFill.g,
          lightColorFill.b,
          255 * 0.17
        )
        lightFill.freeze()

        // top gear
        icons.add(createGear(0.4, 0.4, 0.4, stroke, darkFill))
        icons.add(
          createGear(
            0.16,
            0.4,
            0.4,
            null,
            background // background-colored gear to make shading work
          )
        )
        icons.add(createGear(0.16, 0.4, 0.4, stroke, lightFill))

        // bottom gear
        icons.add(
          createGear(
            0.4,
            0.6,
            0.6,
            null,
            background // background-colored gear to make shading work
          )
        )
        icons.add(createGear(0.4, 0.6, 0.6, stroke, darkFill))
        icons.add(
          createGear(
            0.16,
            0.6,
            0.6,
            null,
            background // background-colored gear to make shading work
          )
        )
        icons.add(createGear(0.16, 0.6, 0.6, stroke, lightFill))

        result = BUILDER.combineIcons(icons)
        break
      }
      case TaskType.SCRIPT: {
        const stroke = new Stroke({
          fill: iconFill,
          lineCap: LineCap.ROUND,
          lineJoin: LineJoin.ROUND
        })
        stroke.freeze()
        BUILDER.stroke = stroke

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
        result = null
        break
    }
    if (hasDefaultColor) {
      IconFactory.TASK_ICONS.set(type, result)
    }

    return result
  }

  /**
   * @param {number} loopCharacteristic
   * @param {!Fill} iconFill
   * @returns {?Icon}
   */
  static createLoopCharacteristic(loopCharacteristic, iconFill) {
    const hasDefaultColor = IconFactory.equalFill(iconFill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    let result = IconFactory.LOOP_TYPES.get(loopCharacteristic)
    if (hasDefaultColor && result) {
      return result
    }

    const BUILDER = IconFactory.BUILDER
    const frozenStroke = new Stroke(iconFill)
    frozenStroke.freeze()
    BUILDER.stroke = frozenStroke

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
        BUILDER.fill = iconFill

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
        BUILDER.fill = iconFill

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

    if (hasDefaultColor) {
      IconFactory.LOOP_TYPES.set(loopCharacteristic, result)
    }
    return result
  }

  /**
   * @param {!Fill} iconFill
   * @returns {!Icon}
   */
  static createAdHoc(iconFill) {
    const hasDefaultColor = IconFactory.equalFill(iconFill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    if (hasDefaultColor && IconFactory._adHoc) {
      return IconFactory._adHoc
    }

    const BUILDER = IconFactory.BUILDER
    const frozenStroke = new Stroke(iconFill)
    frozenStroke.freeze()
    BUILDER.stroke = frozenStroke
    BUILDER.fill = iconFill

    const fromAngle1 = (5.0 / 4.0) * Math.PI
    const toAngle1 = (7.0 / 4.0) * Math.PI
    const fromAngle2 = (1.0 / 4.0) * Math.PI
    const toAngle2 = (3.0 / 4.0) * Math.PI

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

    const icon = BUILDER.getPathIcon()
    if (hasDefaultColor) {
      IconFactory._adHoc = icon
    }
    return icon
  }

  /**
   * @param {boolean} filled
   * @param {!Fill} iconFill
   * @returns {!Icon}
   */
  static createCompensation(filled, iconFill) {
    const hasDefaultColor = IconFactory.equalFill(iconFill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    if (hasDefaultColor) {
      if (filled && IconFactory._filledComparison) {
        return IconFactory._filledComparison
      }
      if (!filled && IconFactory._comparison) {
        return IconFactory._comparison
      }
    }

    const frozenStroke = new Stroke(iconFill)
    frozenStroke.freeze()
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = frozenStroke
    BUILDER.fill = filled ? iconFill : Fill.TRANSPARENT

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

    const icon = BUILDER.getPathIcon()
    if (hasDefaultColor) {
      if (filled) {
        IconFactory._filledComparison = icon
      } else {
        IconFactory._comparison = icon
      }
    }

    return icon
  }

  /**
   * @param {number} subState
   * @param {!Fill} iconFill
   * @returns {?Icon}
   */
  static createStaticSubState(subState, iconFill) {
    const hasDefaultColor = IconFactory.equalFill(iconFill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    let result = IconFactory.SUB_STATES.get(subState)
    if (hasDefaultColor && result) {
      return result
    }

    const iconStroke = new Stroke(iconFill)
    iconStroke.freeze()
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = iconStroke

    switch (subState) {
      case SubState.EXPANDED: {
        const icons = new List()
        BUILDER.fill = Fill.TRANSPARENT
        icons.add(BUILDER.createRectIcon(0))
        BUILDER.stroke = iconStroke
        BUILDER.moveTo(0.2, 0.5)
        BUILDER.lineTo(0.8, 0.5)
        icons.add(BUILDER.getPathIcon())
        result = BUILDER.combineIcons(icons)
        break
      }
      case SubState.COLLAPSED: {
        const icons2 = new List()
        BUILDER.fill = Fill.TRANSPARENT
        icons2.add(BUILDER.createRectIcon(0))
        BUILDER.stroke = iconStroke
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

    if (hasDefaultColor) {
      IconFactory.SUB_STATES.set(subState, result)
    }

    return result
  }

  /**
   * @param {!INode} node
   * @param {!Fill} iconFill
   * @returns {!CollapseButtonIcon}
   */
  static createDynamicSubState(node, iconFill) {
    return new CollapseButtonIcon(node, iconFill)
  }

  /**
   * @param {!Fill} background
   * @param {!Fill} outline
   * @returns {!Icon}
   */
  static createGateway(background, outline) {
    const hasDefaultColors =
      IconFactory.equalFill(background, BPMN_CONSTANTS_GATEWAY_DEFAULT_BACKGROUND) &&
      IconFactory.equalFill(outline, BPMN_CONSTANTS_GATEWAY_DEFAULT_OUTLINE)

    if (hasDefaultColors && IconFactory._gateway) {
      return IconFactory._gateway
    }

    const BUILDER = IconFactory.BUILDER
    const stroke = new Stroke(outline)
    stroke.freeze()
    BUILDER.stroke = stroke
    BUILDER.fill = background
    BUILDER.moveTo(0.5, 0)
    BUILDER.lineTo(1, 0.5)
    BUILDER.lineTo(0.5, 1)
    BUILDER.lineTo(0, 0.5)
    BUILDER.close()
    const gatewayIcon = BUILDER.getPathIcon()
    if (hasDefaultColors) {
      IconFactory._gateway = gatewayIcon
    }
    return gatewayIcon
  }

  /**
   * @param {number} type
   * @param {!Fill} fill
   * @returns {?Icon}
   */
  static createGatewayType(type, fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    let result = IconFactory.GATEWAY_TYPES.get(type)
    if (hasDefaultColor && result) {
      return result
    }

    const stroke = new Stroke(fill)
    stroke.freeze()
    const thickStroke = new Stroke(fill, 3)
    thickStroke.freeze()

    const BUILDER = IconFactory.BUILDER
    switch (type) {
      case GatewayType.EXCLUSIVE_WITHOUT_MARKER: {
        result = null
        break
      }
      case GatewayType.EXCLUSIVE_WITH_MARKER: {
        BUILDER.fill = fill
        BUILDER.stroke = stroke
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
        BUILDER.stroke = thickStroke
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
        BUILDER.stroke = stroke
        icons.add(BUILDER.createEllipseIcon())

        if (type === GatewayType.EVENT_BASED) {
          BUILDER.stroke = stroke
          const innerCircleIcon = BUILDER.createEllipseIcon()
          icons.add(
            IconFactory.createPlacedIcon(
              innerCircleIcon,
              BPMN_CONSTANTS_PLACEMENTS_DOUBLE_LINE,
              Size.EMPTY
            )
          )
        }

        BUILDER.stroke = stroke
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
        result = createPlusIcon(0.8, stroke, fill)
        break
      }
      case GatewayType.PARALLEL_EVENT_BASED: {
        const icons = new List()
        BUILDER.stroke = stroke
        icons.add(BUILDER.createEllipseIcon())
        icons.add(createPlusIcon(0.6, stroke, Fill.TRANSPARENT))
        result = BUILDER.combineIcons(icons)
        break
      }
      case GatewayType.COMPLEX: {
        BUILDER.fill = fill
        BUILDER.stroke = stroke
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

    if (hasDefaultColor) {
      IconFactory.GATEWAY_TYPES.set(type, result)
    }

    return result
  }

  /**
   * @param {number} characteristic
   * @param {!Fill} background
   * @param {?Fill} outline
   * @returns {!Icon}
   */
  static createEvent(characteristic, background, outline) {
    const hasDefaultColors =
      IconFactory.equalFill(background, BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND) &&
      IconFactory.equalFill(outline, BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE)

    let result = IconFactory.EVENT_CHARACTERISTICS.get(characteristic)
    if (hasDefaultColors && result) {
      return result
    }

    const BUILDER = IconFactory.BUILDER
    let stroke
    switch (characteristic) {
      case EventCharacteristic.START:
      case EventCharacteristic.SUB_PROCESS_INTERRUPTING:
        stroke = new Stroke(outline || Fill.GREEN)
        break
      case EventCharacteristic.SUB_PROCESS_NON_INTERRUPTING:
        stroke = new Stroke({
          fill: outline || Fill.GREEN,
          dashStyle: DashStyle.DASH
        })
        break
      case EventCharacteristic.CATCHING:
      case EventCharacteristic.BOUNDARY_INTERRUPTING:
      case EventCharacteristic.THROWING:
        stroke = new Stroke(outline || Fill.GOLDENROD)
        break
      case EventCharacteristic.BOUNDARY_NON_INTERRUPTING:
        stroke = new Stroke({
          fill: outline || Fill.GOLDENROD,
          dashStyle: DashStyle.DASH
        })
        break
      case EventCharacteristic.END:
        stroke = new Stroke(outline || Fill.RED, 3)
        break
      default:
        stroke = new Stroke()
        break
    }
    stroke.freeze()

    BUILDER.stroke = stroke
    BUILDER.fill = background
    const ellipseIcon = BUILDER.createEllipseIcon()

    switch (characteristic) {
      case EventCharacteristic.CATCHING:
      case EventCharacteristic.BOUNDARY_INTERRUPTING:
      case EventCharacteristic.BOUNDARY_NON_INTERRUPTING:
      case EventCharacteristic.THROWING: {
        const icons = new List()
        icons.add(ellipseIcon)

        BUILDER.stroke = stroke
        BUILDER.fill = background
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

    if (hasDefaultColors) {
      IconFactory.EVENT_CHARACTERISTICS.set(characteristic, result)
    }

    return result
  }

  /**
   * @param {number} type
   * @param {boolean} filled
   * @param {!Fill} fill
   * @param {!Fill} background
   * @returns {?Icon}
   */
  static createEventType(type, filled, fill, background) {
    const hasDefaultColors =
      IconFactory.equalFill(fill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR) &&
      IconFactory.equalFill(background, BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND)

    const eventTypeWithFill = new EventTypeWithFill(type, filled)
    let result = IconFactory.EVENT_TYPES.get(eventTypeWithFill)

    if (hasDefaultColors && result) {
      return result
    }

    const stroke = new Stroke(fill)
    stroke.freeze()
    const roundStroke = new Stroke({
      fill: fill,
      lineJoin: LineJoin.ROUND,
      lineCap: LineCap.ROUND
    })
    roundStroke.freeze()
    const backgroundRoundStroke = new Stroke({
      fill: background,
      lineJoin: LineJoin.ROUND,
      lineCap: LineCap.ROUND
    })
    backgroundRoundStroke.freeze()

    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = stroke
    BUILDER.fill = filled ? fill : Fill.TRANSPARENT

    let /** List.<Icon> */ icons
    switch (type) {
      case EventType.MESSAGE: {
        const combinedIcons = IconFactory.createMessage(
          !filled ? stroke : Stroke.TRANSPARENT,
          filled ? fill : Fill.TRANSPARENT,
          filled
        )
        result = IconFactory.createPlacedIcon(
          combinedIcons,
          BPMN_CONSTANTS_PLACEMENTS_EVENT_TYPE_MESSAGE,
          Size.EMPTY
        )
        break
      }
      case EventType.TIMER: {
        icons = new List()
        BUILDER.stroke = filled ? backgroundRoundStroke : roundStroke
        icons.add(BUILDER.createEllipseIcon())
        BUILDER.stroke = filled ? backgroundRoundStroke : roundStroke
        const outerPoints = IconFactory.createPolygon(12, 0.5, 0)
        const innerPoints = IconFactory.createPolygon(12, 0.4, 0)
        for (let i = 0; i < 12; i++) {
          BUILDER.moveTo(outerPoints[i].x, outerPoints[i].y)
          BUILDER.lineTo(innerPoints[i].x, innerPoints[i].y)
        }
        BUILDER.moveTo(0.75, 0.52)
        BUILDER.lineTo(0.5, 0.5)
        BUILDER.lineTo(0.6, 0.15)
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

        BUILDER.stroke = filled ? backgroundRoundStroke : roundStroke
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
        result = IconFactory.createCompensation(filled, fill)
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
        result = createPlusIcon(1.0, stroke, filled ? fill : background)
        break
      }
      case EventType.TERMINATE:
        result = BUILDER.createEllipseIcon()
        break
      case EventType.PLAIN:
      default:
        break
    }

    if (hasDefaultColors) {
      IconFactory.EVENT_TYPES.set(eventTypeWithFill, result)
    }

    return result
  }

  /**
   * @param {?Stroke} stroke
   * @param {?Fill} fill
   * @param {boolean} [inverted=false]
   * @returns {!Icon}
   */
  static createMessage(stroke, fill, inverted = false) {
    const BUILDER = IconFactory.BUILDER
    const icons = new List()
    if (!inverted) {
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
    } else {
      // Just the two envelope shapes without the pen
      BUILDER.fill = fill
      BUILDER.stroke = null
      BUILDER.moveTo(0, 0)
      BUILDER.lineTo(1, 0)
      BUILDER.lineTo(0.5, 0.45)
      BUILDER.close()
      icons.add(BUILDER.getPathIcon())

      BUILDER.fill = fill
      BUILDER.stroke = null
      BUILDER.moveTo(0, 0.1)
      BUILDER.lineTo(0.5, 0.55)
      BUILDER.lineTo(1, 0.1)
      BUILDER.lineTo(1, 1)
      BUILDER.lineTo(0, 1)
      BUILDER.close()
      icons.add(BUILDER.getPathIcon())
    }
    return BUILDER.combineIcons(icons)
  }

  /**
   * @param {number} type
   * @param {!Fill} outline
   * @returns {!Icon}
   */
  static createChoreography(type, outline) {
    const hasDefaultColor = IconFactory.equalFill(
      outline,
      BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE
    )

    if (hasDefaultColor) {
      if (type === ChoreographyType.TASK && IconFactory._choreographyTask) {
        return IconFactory._choreographyTask
      }
      if (type === ChoreographyType.CALL && IconFactory._choreographyCall) {
        return IconFactory._choreographyCall
      }
    }

    const stroke = new Stroke(outline, type === ChoreographyType.TASK ? 1 : 3)
    stroke.freeze()
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = stroke

    // Needs all four arguments instead of one because the path is drawn differently in both cases
    // on some platforms ...
    const icon = BUILDER.createVariableRectIcon(
      BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS,
      BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS,
      BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS,
      BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS
    )

    if (hasDefaultColor) {
      if (type === ChoreographyType.TASK) {
        IconFactory._choreographyTask = icon
      }
      if (type === ChoreographyType.CALL) {
        IconFactory._choreographyCall = icon
      }
    }
    return icon
  }

  /**
   * @param {!Fill} outline
   * @param {!Fill} background
   * @param {number} topRadius
   * @param {number} bottomRadius
   * @returns {!Icon}
   */
  static createChoreographyParticipant(outline, background, topRadius, bottomRadius) {
    const hasDefaultColors =
      IconFactory.equalFill(outline, BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE) &&
      (IconFactory.equalFill(background, BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_INITIATING_COLOR) ||
        IconFactory.equalFill(background, BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_RESPONSE_COLOR))

    const participantBandType = new ParticipantBandType(background, topRadius, bottomRadius)
    let result = IconFactory.PARTICIPANT_BANDS.get(participantBandType)
    if (hasDefaultColors && result) {
      return result
    }

    const stroke = new Stroke(outline)
    stroke.freeze()
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = stroke
    BUILDER.fill = background
    result = BUILDER.createVariableRectIcon(topRadius, topRadius, bottomRadius, bottomRadius)

    if (hasDefaultColors) {
      IconFactory.PARTICIPANT_BANDS.set(participantBandType, result)
    }

    return result
  }

  /**
   * @param {!Fill} fill
   * @returns {!Icon}
   */
  static createChoreographyTaskBand(fill) {
    const hasDefaultColor = IconFactory.equalFill(
      fill,
      BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_BACKGROUND
    )

    if (hasDefaultColor && IconFactory._taskBand) {
      return IconFactory._taskBand
    }

    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = Stroke.TRANSPARENT
    BUILDER.fill = fill

    const icon = BUILDER.createRectIcon(0)

    if (hasDefaultColor) {
      IconFactory._taskBand = icon
    }

    return icon
  }

  /**
   * @param {number} type
   * @param {!Fill} background
   * @param {!Fill} outline
   * @returns {!Icon}
   */
  static createConversation(type, background, outline) {
    const hasDefaultColors =
      IconFactory.equalFill(background, BPMN_CONSTANTS_CONVERSATION_DEFAULT_BACKGROUND) &&
      IconFactory.equalFill(outline, BPMN_CONSTANTS_CONVERSATION_DEFAULT_OUTLINE)

    let result = IconFactory.CONVERSATIONS.get(type)
    if (hasDefaultColors && result) {
      return result
    }

    const BUILDER = IconFactory.BUILDER
    switch (type) {
      default:
      case ConversationType.CONVERSATION:
      case ConversationType.SUB_CONVERSATION: {
        const stroke = new Stroke(outline)
        stroke.freeze()
        BUILDER.stroke = stroke
        break
      }
      case ConversationType.CALLING_GLOBAL_CONVERSATION:
      case ConversationType.CALLING_COLLABORATION: {
        const stroke = new Stroke(outline, 3)
        stroke.freeze()
        BUILDER.stroke = stroke
        break
      }
    }
    BUILDER.fill = background

    BUILDER.moveTo(0, 0.5)
    BUILDER.lineTo(0.25, 0)
    BUILDER.lineTo(0.75, 0)
    BUILDER.lineTo(1, 0.5)
    BUILDER.lineTo(0.75, 1)
    BUILDER.lineTo(0.25, 1)
    BUILDER.close()
    result = BUILDER.getPathIcon()

    if (hasDefaultColors) {
      IconFactory.CONVERSATIONS.set(type, result)
    }

    return result
  }

  /**
   * @param {number} type
   * @param {!Fill} fill
   * @returns {?Icon}
   */
  static createConversationMarker(type, fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    if (
      hasDefaultColor &&
      IconFactory._conversationSubState &&
      (type === ConversationType.SUB_CONVERSATION ||
        type === ConversationType.CALLING_COLLABORATION)
    ) {
      return IconFactory._conversationSubState
    }

    switch (type) {
      case ConversationType.SUB_CONVERSATION:
      case ConversationType.CALLING_COLLABORATION: {
        const icon = IconFactory.createStaticSubState(SubState.COLLAPSED, fill)
        if (hasDefaultColor) {
          IconFactory._conversationSubState = icon
        }
        return icon
      }
      default:
        return null
    }
  }

  /**
   * @param {!Fill} background
   * @param {!Fill} outline
   * @returns {!DataObjectIcon}
   */
  static createDataObject(background, outline) {
    const hasDefaultColors =
      IconFactory.equalFill(background, BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_BACKGROUND) &&
      IconFactory.equalFill(outline, BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_OUTLINE)

    if (hasDefaultColors && IconFactory._dataObject) {
      return IconFactory._dataObject
    }

    const stroke = new Stroke(outline)
    stroke.freeze()
    const icon = new DataObjectIcon()
    icon.stroke = stroke
    icon.fill = background

    if (hasDefaultColors) {
      IconFactory._dataObject = icon
    }

    return icon
  }

  /**
   * @param {number} type
   * @param {!Fill} fill
   * @returns {?Icon}
   */
  static createDataObjectType(type, fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    if (hasDefaultColor) {
      if (type === DataObjectType.INPUT && IconFactory._dataObjectInputType) {
        return IconFactory._dataObjectInputType
      }
      if (type === DataObjectType.OUTPUT && IconFactory._dataObjectOutputType) {
        return IconFactory._dataObjectOutputType
      }
    }

    let icon
    switch (type) {
      case DataObjectType.INPUT:
        icon = IconFactory.createEventType(EventType.LINK, false, fill, Fill.TRANSPARENT)
        if (hasDefaultColor) {
          IconFactory._dataObjectInputType = icon
        }
        return icon
      case DataObjectType.OUTPUT:
        icon = IconFactory.createEventType(EventType.LINK, true, fill, fill)
        if (hasDefaultColor) {
          IconFactory._dataObjectOutputType = icon
        }
        return icon
      case DataObjectType.NONE:
      default:
        return null
    }
  }

  /**
   * @param {boolean} left
   * @param {!Fill} background
   * @param {!Fill} outline
   * @returns {!Icon}
   */
  static createAnnotation(left, background, outline) {
    const hasDefaultColors =
      IconFactory.equalFill(background, BPMN_CONSTANTS_ANNOTATION_DEFAULT_BACKGROUND) &&
      IconFactory.equalFill(outline, BPMN_CONSTANTS_ANNOTATION_DEFAULT_OUTLINE)

    if (hasDefaultColors && left && IconFactory._leftAnnotation) {
      return IconFactory._leftAnnotation
    }
    if (hasDefaultColors && !left && IconFactory._rightAnnotation) {
      return IconFactory._rightAnnotation
    }

    const stroke = new Stroke(outline)
    stroke.freeze()

    const icons = new List()
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = Stroke.TRANSPARENT
    BUILDER.fill = background
    icons.add(BUILDER.createRectIcon(0))
    BUILDER.stroke = stroke

    if (left) {
      BUILDER.moveTo(0.1, 0)
      BUILDER.lineTo(0, 0)
      BUILDER.lineTo(0, 1)
      BUILDER.lineTo(0.1, 1)
    } else {
      BUILDER.moveTo(0.9, 0)
      BUILDER.lineTo(1, 0)
      BUILDER.lineTo(1, 1)
      BUILDER.lineTo(0.9, 1)
    }
    icons.add(BUILDER.getPathIcon())
    const icon = BUILDER.combineIcons(icons)

    if (hasDefaultColors) {
      if (left) {
        IconFactory._leftAnnotation = icon
      } else {
        IconFactory._rightAnnotation = icon
      }
    }
    return icon
  }

  /**
   * @param {!Fill} background
   * @param {!Fill} outline
   * @returns {!Icon}
   */
  static createDataStore(background, outline) {
    const hasDefaultColors =
      IconFactory.equalFill(background, BPMN_CONSTANTS_DATA_STORE_DEFAULT_BACKGROUND) &&
      IconFactory.equalFill(outline, BPMN_CONSTANTS_DATA_STORE_DEFAULT_OUTLINE)

    if (hasDefaultColors && IconFactory._dataStore) {
      return IconFactory._dataStore
    }

    const stroke = new Stroke(outline)
    stroke.freeze()

    const halfEllipseHeight = 0.125
    const ringOffset = 0.07

    const icons = new List()
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = stroke
    BUILDER.fill = background

    BUILDER.moveTo(0, halfEllipseHeight)
    BUILDER.lineTo(0, 1 - halfEllipseHeight)
    BUILDER.cubicTo(0, 1, 1, 1, 1, 1 - halfEllipseHeight)
    BUILDER.lineTo(1, halfEllipseHeight)
    BUILDER.cubicTo(1, 0, 0, 0, 0, halfEllipseHeight)
    BUILDER.close()
    icons.add(BUILDER.getPathIcon())

    BUILDER.stroke = stroke
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

    const icon = BUILDER.combineIcons(icons)

    if (hasDefaultColors) {
      IconFactory._dataStore = icon
    }

    return icon
  }

  /**
   * @param {number} type
   * @param {!Fill} fill
   * @returns {!Icon}
   */
  static createArrowIcon(type, fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, BPMN_CONSTANTS_DEFAULT_ICON_COLOR)

    let result = IconFactory.ARROWS.get(type)
    if (hasDefaultColor && result) {
      return result
    }

    const stroke = new Stroke({
      fill: fill,
      lineCap: LineCap.ROUND,
      lineJoin: LineJoin.ROUND
    })
    stroke.freeze()
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = stroke
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
        BUILDER.fill = fill
        BUILDER.moveTo(0, 0)
        BUILDER.lineTo(1, 0.5)
        BUILDER.lineTo(0, 1)
        BUILDER.close()
        result = BUILDER.getPathIcon()
        break
    }
    if (hasDefaultColor) {
      IconFactory.ARROWS.set(type, result)
    }
    return result
  }

  /**
   * @param {!Stroke} stroke
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {!Icon}
   */
  static createLine(stroke, x1, y1, x2, y2) {
    const BUILDER = IconFactory.BUILDER
    BUILDER.stroke = stroke
    BUILDER.moveTo(x1, y1)
    BUILDER.lineTo(x2, y2)
    return BUILDER.getPathIcon()
  }

  /**
   * @param {number} sideCount
   * @param {number} radius
   * @param {number} rotation
   * @returns {!Array.<Point>}
   */
  static createPolygon(sideCount, radius, rotation) {
    const result = new Array(sideCount)
    const delta = (Math.PI * 2.0) / sideCount

    for (let i = 0; i < sideCount; i++) {
      const angle = delta * i + rotation
      result[i] = new Point(radius * Math.sin(angle) + 0.5, -radius * Math.cos(angle) + 0.5)
    }
    return result
  }

  /**
   * @type {number}
   */
  static get RADIUS_TO_CORNER_OFFSET() {
    return (
      IconFactory._radiusToCornerOffset ||
      (IconFactory._radiusToCornerOffset = Math.sqrt(1.5 - Math.sqrt(2)))
    )
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get TASK_ICONS() {
    return IconFactory._taskIcons || (IconFactory._taskIcons = new HashMap())
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get LOOP_TYPES() {
    return IconFactory._loopTypes || (IconFactory._loopTypes = new HashMap())
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get SUB_STATES() {
    return IconFactory._subStates || (IconFactory._subStates = new HashMap())
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get GATEWAY_TYPES() {
    return IconFactory._gatewayTypes || (IconFactory._gatewayTypes = new HashMap())
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get EVENT_CHARACTERISTICS() {
    return IconFactory._eventCharacteristics || (IconFactory._eventCharacteristics = new HashMap())
  }

  /**
   * @type {!HashMap.<EventTypeWithFill,Icon>}
   */
  static get EVENT_TYPES() {
    return IconFactory._eventTypes || (IconFactory._eventTypes = new HashMap())
  }

  /**
   * @type {!HashMap.<PlusData,Icon>}
   */
  static get PLUS_ICONS() {
    return IconFactory._plusIcons || (IconFactory._plusIcons = new HashMap())
  }

  /**
   * @type {!HashMap.<ParticipantBandType,Icon>}
   */
  static get PARTICIPANT_BANDS() {
    return IconFactory._participantBands || (IconFactory._participantBands = new HashMap())
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get CONVERSATIONS() {
    return IconFactory._conversations || (IconFactory._conversations = new HashMap())
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get ARROWS() {
    return IconFactory._arrows || (IconFactory._arrows = new HashMap())
  }

  /**
   * @type {!HashMap.<number,Icon>}
   */
  static get ACTIVITY_ICONS() {
    return IconFactory._activityIcons || (IconFactory._activityIcons = new HashMap())
  }

  /**
   * @type {!IconBuilder}
   */
  static get BUILDER() {
    return IconFactory._builder || (IconFactory._builder = new IconBuilder())
  }

  /**
   * Compares two {@link Fill}s for the same color value
   * @param {?Fill} fill1
   * @param {?Fill} fill2
   * @returns {boolean}
   */
  static equalFill(fill1, fill2) {
    if (!fill1 && !fill2) {
      return true
    } else if ((!fill1 && fill2) || (fill1 && !fill2)) {
      return false
    }

    if (!(Object.getPrototypeOf(fill1) === Object.getPrototypeOf(fill2))) {
      return false
    }

    if (fill1 instanceof SolidColorFill && fill2 instanceof SolidColorFill) {
      return IconFactory.equalSolidColorFill(fill1, fill2)
    } else if (fill1 instanceof LinearGradient && fill2 instanceof LinearGradient) {
      return IconFactory.equalLinearGradient(fill1, fill2)
    } else if (fill1 instanceof RadialGradient && fill2 instanceof RadialGradient) {
      return IconFactory.equalRadialGradient(fill1, fill2)
    }

    return false
  }

  /**
   * Compares two {@link SolidColorFill}s for the same color value
   * @param {!SolidColorFill} fill1
   * @param {!SolidColorFill} fill2
   * @returns {boolean}
   */
  static equalSolidColorFill(fill1, fill2) {
    if (fill1 === fill2) {
      return true
    }
    const color1 = fill1 ? fill1.color : null
    const color2 = fill2 ? fill2.color : null
    if (!color1 && !color2) {
      return true
    }
    if (!color1 || !color2) {
      return false
    }
    return color1.equals(color2)
  }

  /**
   * Compares two {@link LinearGradient}s for value equality
   * @param {!LinearGradient} fill1
   * @param {!LinearGradient} fill2
   * @returns {boolean}
   */
  static equalLinearGradient(fill1, fill2) {
    const sameEndPoint = fill1.endPoint.equals(fill2.endPoint)
    const sameStartPoint = fill1.startPoint.equals(fill2.startPoint)
    const sameSpreadMethod = fill1.spreadMethod === fill2.spreadMethod
    const sameGradientStops = IconFactory.sameGradientStops(
      fill1.gradientStops,
      fill2.gradientStops
    )
    return sameEndPoint && sameStartPoint && sameSpreadMethod && sameGradientStops
  }

  /**
   * Compares two {@link RadialGradient}s for value equality
   * @param {!RadialGradient} fill1
   * @param {!RadialGradient} fill2
   * @returns {boolean}
   */
  static equalRadialGradient(fill1, fill2) {
    const sameCenter = fill1.center.equals(fill2.center)
    const sameOrigin = fill1.gradientOrigin.equals(fill2.gradientOrigin)
    const sameRadiusX = fill1.radiusX === fill2.radiusX
    const sameRadiusY = fill1.radiusY === fill2.radiusY
    const sameSpreadMethod = fill1.spreadMethod === fill2.spreadMethod
    const sameGradientStops = IconFactory.sameGradientStops(
      fill1.gradientStops,
      fill2.gradientStops
    )
    return (
      sameCenter &&
      sameOrigin &&
      sameRadiusX &&
      sameRadiusY &&
      sameSpreadMethod &&
      sameGradientStops
    )
  }

  /**
   * Compares whether both {@link GradientStop} lists are the same
   * @param {!List.<GradientStop>} stops1
   * @param {!List.<GradientStop>} stops2
   * @returns {boolean}
   */
  static sameGradientStops(stops1, stops2) {
    if (stops1.size !== stops2.size) {
      return false
    }

    let sameStops = true
    stops1.forEach((stop1, idx) => {
      const stop2 = stops2.at(idx)
      const sameColor = stop1.color.equals(stop2.color)
      const sameOffset = stop1.offset === stop2.offset
      sameStops = sameStops && sameColor && sameOffset
    })

    return sameStops
  }

  /**
   * Compares two {@link Stroke}s for the same fill value
   * @param {?Stroke} stroke1
   * @param {?Stroke} stroke2
   * @returns {boolean}
   */
  static equalStroke(stroke1, stroke2) {
    if (!stroke1 || !stroke2) {
      return false
    }
    if (!stroke1.fill && !stroke2.fill) {
      return true
    }
    if (!stroke1.fill || !stroke2.fill) {
      return false
    }
    return IconFactory.equalFill(stroke1.fill, stroke2.fill)
  }
}

/**
 * @param {number} radius
 * @param {number} centerX
 * @param {number} centerY
 * @param {?Stroke} stroke
 * @param {?Fill} fill
 * @returns {!Icon}
 */
function createGear(radius, centerX, centerY, stroke, fill) {
  const BUILDER = IconFactory.BUILDER
  BUILDER.stroke = stroke
  BUILDER.fill = fill
  const smallR = 0.7 * radius

  let angle = (-2 * Math.PI) / 48
  BUILDER.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
  for (let i = 0; i < 8; i++) {
    BUILDER.arcTo(radius, centerX, centerY, angle, angle + (4 * Math.PI) / 48)
    BUILDER.lineTo(
      centerX + smallR * Math.cos(angle + (5 * Math.PI) / 48),
      centerY + smallR * Math.sin(angle + (5 * Math.PI) / 48)
    )
    BUILDER.arcTo(smallR, centerX, centerY, angle + (5 * Math.PI) / 48, angle + (11 * Math.PI) / 48)
    BUILDER.lineTo(
      centerX + radius * Math.cos(angle + (12 * Math.PI) / 48),
      centerY + radius * Math.sin(angle + (12 * Math.PI) / 48)
    )
    angle += Math.PI / 4
  }

  BUILDER.close()
  return BUILDER.getPathIcon()
}

/**
 * @param {number} size
 * @param {!Stroke} stroke
 * @param {!Fill} fill
 * @returns {!Icon}
 */
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
    this._modCount = 0
  }

  /**
   * @type {number}
   */
  get modCount() {
    return this._modCount + this.getParticipantModCount()
  }

  /**
   * @returns {number}
   */
  getHeight() {
    let height = 0
    this.innerList.forEach(participant => {
      height += participant.getSize()
    })
    return height
  }

  /**
   * @returns {number}
   */
  getParticipantModCount() {
    let participantCount = 0
    this.innerList.forEach(participant => {
      participantCount += participant.modCount
    })
    return participantCount
  }

  /**
   * @returns {!IEnumerator.<Participant>}
   */
  getEnumerator() {
    return this.innerList.getEnumerator()
  }

  /**
   * @param {!Participant} item
   */
  add(item) {
    this._modCount++
    this.innerList.add(item)
  }

  clear() {
    this._modCount += this.getParticipantModCount() + 1
    this.innerList.clear()
  }

  /**
   * @param {!Participant} item
   * @returns {boolean}
   */
  includes(item) {
    return this.innerList.includes(item)
  }

  /**
   * @param {!Array.<Participant>} array
   * @param {number} arrayIndex
   */
  copyTo(array, arrayIndex) {
    this.innerList.copyTo(array, arrayIndex)
  }

  /**
   * @param {!Participant} item
   * @returns {boolean}
   */
  remove(item) {
    this._modCount += item.modCount + 1
    return this.innerList.remove(item)
  }

  /**
   * @type {number}
   */
  get size() {
    return this.innerList.size
  }

  /**
   * @type {boolean}
   */
  get isReadOnly() {
    return this.innerList.isReadOnly
  }

  /**
   * @param {!Participant} item
   * @returns {number}
   */
  indexOf(item) {
    return this.innerList.indexOf(item)
  }

  /**
   * @param {number} index
   * @param {!Participant} item
   */
  insert(index, item) {
    this._modCount++
    this.innerList.insert(index, item)
  }

  /**
   * @param {number} index
   */
  removeAt(index) {
    this._modCount += this.innerList.get(index).modCount + 1
    this.innerList.removeAt(index)
  }

  /**
   * @param {number} index
   * @returns {!Participant}
   */
  get(index) {
    return this.innerList.get(index)
  }

  /**
   * @param {number} index
   * @param {!Participant} value
   */
  set(index, value) {
    this.innerList.set(index, value)
  }
}

/**
 * An {@link INodeStyle} implementation representing an Choreography according to the BPMN.
 */
export class ChoreographyNodeStyle extends BpmnNodeStyle {
  constructor() {
    super()
    this._background = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_ICON_COLOR
    this._initiatingColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_INITIATING_COLOR
    this._responseColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_RESPONSE_COLOR
    this._messageOutline = null
    this._messageStroke = null
    this._messageLineStroke = null
    this._loopCharacteristic = LoopCharacteristic.NONE
    this._subState = SubState.NONE
    this._topParticipants = new ParticipantList()
    this._bottomParticipants = new ParticipantList()
    this._initiatingMessage = false
    this._responseMessage = false
    this._initiatingAtTop = true
    this._insets = new Insets(5)
    this._initiatingMessageIcon = null
    this._responseMessageIcon = null
    this._bottomResponseMessageIcon = null
    this._messageLineIcon = null
    this._taskBandBackgroundIcon = null
    this._topInitiatingMessageIcon = null
    this._bottomInitiatingMessageIcon = null
    this._multiInstanceIcon = null
    this._topResponseMessageIcon = null
    this._type = null
    this.outlineIcon = null
    this.loopIcon = null
    this.messageOutline = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_MESSAGE_OUTLINE
    this.type = ChoreographyType.TASK
    this.minimumSize = new Size(30, 30)
  }

  /**
   * Gets the choreography type of this style.
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * Sets the choreography type of this style.
   * @type {number}
   */
  set type(value) {
    if (this._type !== value || this.outlineIcon == null) {
      this.modCount++
      this._type = value
      this.updateOutlineIcon()
    }
  }

  /**
   * Gets the loop characteristic of this style.
   * @type {number}
   */
  get loopCharacteristic() {
    return this._loopCharacteristic
  }

  /**
   * Sets the loop characteristic of this style.
   * @type {number}
   */
  set loopCharacteristic(value) {
    if (this._loopCharacteristic !== value) {
      this.modCount++
      this._loopCharacteristic = value
      this.updateLoopIcon()
    }
  }

  /**
   * Gets the sub state of this style.
   * @type {number}
   */
  get subState() {
    return this._subState
  }

  /**
   * Sets the sub state of this style.
   * @type {number}
   */
  set subState(value) {
    if (this._subState !== value) {
      this.modCount++
      this._subState = value
      this.updateTaskBandIcon()
    }
  }

  /**
   * Gets whether the initiating message icon is displayed.
   * @type {boolean}
   */
  get initiatingMessage() {
    return this._initiatingMessage
  }

  /**
   * Sets whether the initiating message icon is displayed.
   * @type {boolean}
   */
  set initiatingMessage(value) {
    if (this._initiatingMessage !== value) {
      this.modCount++
      this._initiatingMessage = value
    }
  }

  /**
   * Gets whether the response message icon is displayed.
   * @type {boolean}
   */
  get responseMessage() {
    return this._responseMessage
  }

  /**
   * Sets whether the response message icon is displayed.
   * @type {boolean}
   */
  set responseMessage(value) {
    if (this._responseMessage !== value) {
      this.modCount++
      this._responseMessage = value
    }
  }

  /**
   * Gets whether the initiating message icon or the response message icon is displayed on top of
   * the node while the other one is at the bottom side. Whether the initiating and response
   * message icons are displayed at all depends on {@link ChoreographyNodeStyle.initiatingMessage}
   * and {@link ChoreographyNodeStyle.responseMessage}. This property only determines which one is
   * displayed on which side of the node.
   * @type {boolean}
   */
  get initiatingAtTop() {
    return this._initiatingAtTop
  }

  /**
   * Sets whether the initiating message icon or the response message icon is displayed on top of
   * the node while the other one is at the bottom side. Whether the initiating and response
   * message icons are displayed at all depends on {@link ChoreographyNodeStyle.initiatingMessage}
   * and {@link ChoreographyNodeStyle.responseMessage}. This property only determines which one is
   * displayed on which side of the node.
   * @type {boolean}
   */
  set initiatingAtTop(value) {
    if (this._initiatingAtTop !== value) {
      this._initiatingAtTop = value
      if (this.initiatingMessage || this.responseMessage) {
        this.modCount++
      }
    }
  }

  /**
   * Gets the list of {@link Participant}s at the top of the node, ordered from top to bottom.
   * @type {!ParticipantList}
   */
  get topParticipants() {
    return this._topParticipants
  }

  /**
   * Gets the list of {@link Participant}s at the bottom of the node, ordered from bottom to top.
   * @type {!ParticipantList}
   */
  get bottomParticipants() {
    return this._bottomParticipants
  }

  /**
   * Gets the background color of the choreography.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the choreography.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value) {
      this.modCount++
      this._background = value
      this.updateTaskBandIcon()
    }
  }

  /**
   * Gets the outline color of the choreography.
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the choreography.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this.modCount++
      this._outline = value
      this.updateOutlineIcon()
    }
  }

  /**
   * Gets the primary color for icons and markers.
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * Sets the primary color for icons and markers.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._iconColor !== value) {
      this.modCount++
      this._iconColor = value
      this.updateMultiInstanceIcon()
      this.updateLoopIcon()
      this.updateTaskBandIcon()
    }
  }

  /**
   * Gets the color for initiating participants and messages.
   * @type {!Fill}
   */
  get initiatingColor() {
    return this._initiatingColor
  }

  /**
   * Sets the color for initiating participants and messages.
   * @type {!Fill}
   */
  set initiatingColor(value) {
    if (this._initiatingColor !== value) {
      this.modCount++
      this._initiatingColor = value
    }
  }

  /**
   * Gets the primary color for responding participants and messages.
   * @type {!Fill}
   */
  get responseColor() {
    return this._responseColor
  }

  /**
   * Sets the primary color for responding participants and messages.
   * @type {!Fill}
   */
  set responseColor(value) {
    if (this._responseColor !== value) {
      this.modCount++
      this._responseColor = value
    }
  }

  /**
   * Gets the outline color for messages.
   * @type {!Fill}
   */
  get messageOutline() {
    return this._messageOutline
  }

  /**
   * Sets the outline color for messages.
   * This also influences the color of the line to the message.
   * @type {!Fill}
   */
  set messageOutline(value) {
    if (this._messageOutline !== value) {
      this.modCount++
      this._messageOutline = value
      const messageStroke = new Stroke(this._messageOutline)
      messageStroke.freeze()
      this._messageStroke = messageStroke
      const messageLineStroke = new Stroke({
        fill: this._messageOutline,
        dashStyle: DashStyle.DOT,
        lineCap: LineCap.ROUND
      })
      messageLineStroke.freeze()
      this._messageLineStroke = messageLineStroke
      this.updateMessageLineIcon()
      this.updateInitiatingMessageIcon()
      this.updateResponseMessageIcon()
    }
  }

  /**
   * Gets the insets for the task name band of the given item.
   * These insets are extended by the sizes of the participant bands on top and bottom side
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link INodeStyleRenderer.getContext context lookup}.
   * @return An insets object that describes the insets of the task name band.
   * @see {@link INodeInsetsProvider}
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * Sets the insets for the task name band of the given item.
   * These insets are extended by the sizes of the participant bands on top and bottom side
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link INodeStyleRenderer.getContext context lookup}.
   * @see {@link INodeInsetsProvider}
   * @type {!Insets}
   */
  set insets(value) {
    this._insets = value
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
   * @type {!Stroke}
   */
  get messageStroke() {
    return this._messageStroke
  }

  updateOutlineIcon() {
    this.outlineIcon = IconFactory.createChoreography(this._type, this.outline)
    if (this._type === ChoreographyType.CALL) {
      this.outlineIcon = new PlacedIcon(
        this.outlineIcon,
        BPMN_CONSTANTS_PLACEMENTS_THICK_LINE,
        Size.EMPTY
      )
    }
  }

  updateTaskBandIcon() {
    this._taskBandBackgroundIcon = IconFactory.createChoreographyTaskBand(this.background)
  }

  updateMessageLineIcon() {
    this._messageLineIcon = IconFactory.createLine(this._messageLineStroke, 0.5, 0, 0.5, 1)
  }

  updateInitiatingMessageIcon() {
    this._initiatingMessageIcon = IconFactory.createMessage(
      this._messageStroke,
      this.initiatingColor
    )
    this.updateMessageLineIcon()
    this.updateTopInitiatingMessageIcon()
    this.updateBottomInitiatingMessageIcon()
  }

  updateTopInitiatingMessageIcon() {
    this._topInitiatingMessageIcon = IconFactory.createCombinedIcon(
      new List(
        List.fromArray([
          IconFactory.createPlacedIcon(
            this._messageLineIcon,
            ExteriorLabelModel.NORTH,
            new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
          ),
          IconFactory.createPlacedIcon(
            this._initiatingMessageIcon,
            BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_TOP_MESSAGE,
            BPMN_CONSTANTS_SIZES_MESSAGE
          )
        ])
      )
    )
  }

  updateBottomInitiatingMessageIcon() {
    this._bottomInitiatingMessageIcon = IconFactory.createCombinedIcon(
      new List(
        List.fromArray([
          IconFactory.createPlacedIcon(
            this._messageLineIcon,
            ExteriorLabelModel.SOUTH,
            new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
          ),
          IconFactory.createPlacedIcon(
            this._initiatingMessageIcon,
            BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_BOTTOM_MESSAGE,
            BPMN_CONSTANTS_SIZES_MESSAGE
          )
        ])
      )
    )
  }

  updateResponseMessageIcon() {
    this._responseMessageIcon = IconFactory.createMessage(this._messageStroke, this.responseColor)
    this.updateMessageLineIcon()
    this.updateTopResponseMessageIcon()
    this.updateBottomResponseMessageIcon()
  }

  updateTopResponseMessageIcon() {
    this._topResponseMessageIcon = IconFactory.createCombinedIcon(
      new List(
        List.fromArray([
          IconFactory.createPlacedIcon(
            this._messageLineIcon,
            ExteriorLabelModel.NORTH,
            new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
          ),
          IconFactory.createPlacedIcon(
            this._responseMessageIcon,
            BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_TOP_MESSAGE,
            BPMN_CONSTANTS_SIZES_MESSAGE
          )
        ])
      )
    )
  }

  updateBottomResponseMessageIcon() {
    this._bottomResponseMessageIcon = IconFactory.createCombinedIcon(
      new List(
        List.fromArray([
          IconFactory.createPlacedIcon(
            this._messageLineIcon,
            ExteriorLabelModel.SOUTH,
            new Size(ChoreographyNodeStyle.MESSAGE_DISTANCE, ChoreographyNodeStyle.MESSAGE_DISTANCE)
          ),
          IconFactory.createPlacedIcon(
            this._responseMessageIcon,
            BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_BOTTOM_MESSAGE,
            BPMN_CONSTANTS_SIZES_MESSAGE
          )
        ])
      )
    )
  }

  updateMultiInstanceIcon() {
    this._multiInstanceIcon = IconFactory.createPlacedIcon(
      IconFactory.createLoopCharacteristic(LoopCharacteristic.PARALLEL, this.iconColor),
      BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_MARKER,
      BPMN_CONSTANTS_SIZES_MARKER
    )
  }

  updateLoopIcon() {
    this.loopIcon = IconFactory.createLoopCharacteristic(this.loopCharacteristic, this.iconColor)
  }

  /**
   * Callback that creates the visual.
   * @param {!IRenderContext} renderContext The render context.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!SvgVisual} The visual.
   * @see {@link NodeStyleBase.updateVisual}
   */
  createVisual(renderContext, node) {
    const bounds = node.layout.toRect()
    const container = new SvgVisualGroup()

    // outline
    this.outlineIcon.setBounds(new Rect(Point.ORIGIN, bounds.size))
    const outlineVisual = this.outlineIcon.createVisual(renderContext)
    container.add(outlineVisual)

    // task band
    const taskBandContainer = new SvgVisualGroup()
    const bandIcon = this.createTaskBandIcon(node)
    bandIcon.setBounds(this.getRelativeTaskNameBandBounds(node))
    const bandIconVisual = bandIcon.createVisual(renderContext)
    taskBandContainer.add(bandIconVisual)
    taskBandContainer['render-data-cache'] = bandIcon
    container.children.add(taskBandContainer)

    const tpi = new List()
    // top participants
    let topOffset = 0
    let first = true
    this._topParticipants.forEach(participant => {
      const participantIcon = this.createParticipantIcon(participant, true, first)
      tpi.add(participantIcon)
      const height = participant.getSize()
      participantIcon.setBounds(new Rect(0, topOffset, bounds.width, height))
      const participantIconVisual = participantIcon.createVisual(renderContext)
      container.add(participantIconVisual)
      topOffset += height
      first = false
    })

    const bpi = new List()
    // bottom participants
    let bottomOffset = bounds.height
    first = true
    this._bottomParticipants.forEach(participant => {
      const participantIcon = this.createParticipantIcon(participant, false, first)
      bpi.add(participantIcon)
      const height = participant.getSize()
      bottomOffset -= height
      participantIcon.setBounds(new Rect(0, bottomOffset, bounds.width, height))
      const participantIconVisual = participantIcon.createVisual(renderContext)
      container.add(participantIconVisual)
      first = false
    })

    // messages
    if (this.initiatingMessage) {
      this.updateInitiatingMessageIcon()
      const initiatingMessageIcon = this.initiatingAtTop
        ? this._topInitiatingMessageIcon
        : this._bottomInitiatingMessageIcon
      initiatingMessageIcon.setBounds(new Rect(0, 0, bounds.width, bounds.height))
      const initiatingMessageIconVisual = initiatingMessageIcon.createVisual(renderContext)
      container.add(initiatingMessageIconVisual)
    }
    if (this.responseMessage) {
      this.updateResponseMessageIcon()
      const responseMessageIcon = this.initiatingAtTop
        ? this._bottomResponseMessageIcon
        : this._topResponseMessageIcon
      responseMessageIcon.setBounds(new Rect(0, 0, bounds.width, bounds.height))
      const responseMessageIconVisual = responseMessageIcon.createVisual(renderContext)
      container.add(responseMessageIconVisual)
    }

    const transform = new Matrix()
    transform.translate(node.layout.topLeft)
    container.transform = transform
    container['render-data-cache'] = {
      bounds: bounds,
      modCount: this.modCount + this._topParticipants.modCount + this._bottomParticipants.modCount,
      topParticipantIcons: tpi,
      bottomParticipantIcons: bpi
    }
    return container
  }

  /**
   * Callback that updates the visual previously created by {@link NodeStyleBase.createVisual}.
   * @param {!IRenderContext} renderContext The render context.
   * @param {!SvgVisual} oldVisual The visual that should be updated.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!SvgVisual} The visual.
   * @see {@link NodeStyleBase.createVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (!container) {
      this.createVisual(renderContext, node)
    }
    const cache = container != null ? container['render-data-cache'] : null
    const currentModCount =
      this.modCount + this._topParticipants.modCount + this._bottomParticipants.modCount
    if (cache == null || cache.modCount !== currentModCount) {
      return this.createVisual(renderContext, node)
    }
    const newBounds = node.layout.toRect()

    if (cache.bounds.width !== newBounds.width || cache.bounds.height !== newBounds.height) {
      // update icon bounds
      let childIndex = 0

      // outline
      this.outlineIcon.setBounds(new Rect(Point.ORIGIN, newBounds.size))
      updateChildVisual(container, childIndex++, this.outlineIcon, renderContext)

      // task band
      const taskBandContainer = container.children.at(childIndex++)
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
      for (let i = 0; i < this._topParticipants.size; i++) {
        const participant = this._topParticipants.at(i)
        const participantIcon = cache.topParticipantIcons.at(i)
        const height = participant.getSize()
        participantIcon.setBounds(new Rect(0, topOffset, newBounds.width, height))
        updateChildVisual(container, childIndex++, participantIcon, renderContext)
        topOffset += height
      }

      // bottom participants
      let bottomOffset = newBounds.height
      for (let i = 0; i < this._bottomParticipants.size; i++) {
        const participant = this._bottomParticipants.at(i)
        const participantIcon = cache.bottomParticipantIcons.at(i)
        const height = participant.getSize()
        bottomOffset -= height
        participantIcon.setBounds(new Rect(0, bottomOffset, newBounds.width, height))
        updateChildVisual(container, childIndex++, participantIcon, renderContext)
      }

      // messages
      if (this.initiatingMessage) {
        const initiatingMessageIcon = this.initiatingAtTop
          ? this._topInitiatingMessageIcon
          : this._bottomInitiatingMessageIcon
        initiatingMessageIcon.setBounds(new Rect(0, 0, newBounds.width, newBounds.height))
        updateChildVisual(container, childIndex++, initiatingMessageIcon, renderContext)
      }
      if (this.responseMessage) {
        const responseMessageIcon = this.initiatingAtTop
          ? this._bottomResponseMessageIcon
          : this._topResponseMessageIcon
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
   * Creates the {@link Icon} which visualizes the task band at the center of a
   * {@link ChoreographyNodeStyle}
   * @param {!INode} node
   * @returns {!Icon}
   */
  createTaskBandIcon(node) {
    if (!this._taskBandBackgroundIcon) {
      this.updateTaskBandIcon()
    }
    let subStateIcon = null
    if (this.subState !== SubState.NONE) {
      subStateIcon =
        this.subState === SubState.DYNAMIC
          ? IconFactory.createDynamicSubState(node, this.iconColor)
          : IconFactory.createStaticSubState(this.subState, this.iconColor)
    }

    let markerIcon = null
    if (this.loopIcon && subStateIcon) {
      markerIcon = IconFactory.createLineUpIcon(
        List.fromArray([this.loopIcon, subStateIcon]),
        BPMN_CONSTANTS_SIZES_MARKER,
        5
      )
    } else if (this.loopIcon) {
      markerIcon = this.loopIcon
    } else if (subStateIcon) {
      markerIcon = subStateIcon
    }
    if (markerIcon) {
      const placedMarkers = IconFactory.createPlacedIcon(
        markerIcon,
        BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_MARKER,
        BPMN_CONSTANTS_SIZES_MARKER
      )
      return IconFactory.createCombinedIcon(
        new List(List.fromArray([this._taskBandBackgroundIcon, placedMarkers]))
      )
    }
    return this._taskBandBackgroundIcon
  }

  /**
   * Creates the {@link Icon} which visualizes a participant band at the top or bottom of a {@link
   * ChoreographyNodeStyle}
   * @param {!Participant} participant
   * @param {boolean} top
   * @param {boolean} isFirst
   * @returns {!Icon}
   */
  createParticipantIcon(participant, top, isFirst) {
    const isInitializing = isFirst && top !== !this.initiatingAtTop

    const radius = BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS
    let icon = IconFactory.createChoreographyParticipant(
      this.outline,
      isInitializing ? this.initiatingColor : this.responseColor,
      top && isFirst ? radius : 0,
      !top && isFirst ? radius : 0
    )
    if (participant.multiInstance) {
      if (!this._multiInstanceIcon) {
        this.updateMultiInstanceIcon()
      }
      icon = IconFactory.createCombinedIcon(List.fromArray([icon, this._multiInstanceIcon]))
    }
    return icon
  }

  /**
   * Returns the participant at the specified location.
   * @param {!INode} node The node whose bounds shall be used.
   * @param {!Point} location The location of the participant.
   * @returns {?Participant}
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
   * @param {!INode} owner The node whose bounds shall be used.
   * @param {number} index The index of the participant in its list.
   * @param {boolean} top Whether the top of bottom list of participants shall be used.
   * @returns {!Rect}
   */
  getParticipantBandBounds(owner, index, top) {
    const width = owner.layout.width
    if (top && index <= this._topParticipants.size) {
      let yOffset = 0
      for (let i = 0; i < this._topParticipants.size; i++) {
        const topParticipant = this._topParticipants.get(i)
        if (index === i) {
          return new Rect(owner.layout.x, owner.layout.y + yOffset, width, topParticipant.getSize())
        }
        yOffset += topParticipant.getSize()
      }
    } else if (!top && index < this._bottomParticipants.size) {
      let yOffset = owner.layout.height
      for (let i = 0; i < this._bottomParticipants.size; i++) {
        const bottomParticipant = this._bottomParticipants.get(i)
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
   * @param {!INode} owner The node whose bounds shall be used.
   * @returns {!Rect}
   */
  getTaskNameBandBounds(owner) {
    return this.getRelativeTaskNameBandBounds(owner).getTranslated(owner.layout.topLeft)
  }

  /**
   * Returns the bounds of the task name band for a node at the origin location (0,0).
   * @param {!INode} owner
   * @returns {!Rect}
   */
  getRelativeTaskNameBandBounds(owner) {
    const topHeight = this._topParticipants.getHeight()
    return new Rect(
      0,
      topHeight,
      owner.layout.width,
      Math.max(0, owner.layout.height - topHeight - this._bottomParticipants.getHeight())
    )
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields `null` to indicate that
   * the {@link INode.layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase.isInside}
   * and {@link NodeStyleBase.getIntersection} since the default implementations delegate to it.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!GeneralPath} The outline of the visual representation or `null`.
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
   * This method is called in response to a {@link IHitTestable.isHit}
   * call to the instance that has been queried from the {@link NodeStyleBase.renderer}.
   * This implementation uses the {@link NodeStyleBase.getOutline outline} to determine
   * whether the node has been hit.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!Point} p The point to test.
   * @param {!IInputModeContext} canvasContext The canvas context.
   * @returns {boolean} whether or not the specified node representation is hit.
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
   * This method is called in response to a {@link IBoundsProvider.getBounds}
   * call to the instance that has been queried from the {@link NodeStyleBase.renderer}.
   * This implementation simply yields the {@link INode.layout}.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!ICanvasContext} canvasContext The canvas context.
   * @returns {!Rect} The visual bounds of the visual representation.
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
   * Performs the {@link ILookup.lookup} operation for
   * the {@link INodeStyleRenderer.getContext}
   * that has been queried from the {@link NodeStyleBase.renderer}.
   * @param {!INode} node The node to use for the context lookup.
   * @param {!Class} type The type to query.
   * @returns {!object} An implementation of the `type` or `null`.
   */
  lookup(node, type) {
    if (type === INodeSizeConstraintProvider.$class) {
      const minWidth = Math.max(0, this.minimumSize.width)
      const minHeight =
        Math.max(0, this.minimumSize.height) +
        this._topParticipants.getHeight() +
        this._bottomParticipants.getHeight()
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
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
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
    clone.iconColor = this.iconColor
    clone.initiatingColor = this.initiatingColor
    clone.responseColor = this.responseColor
    clone.outline = this.outline
    clone.background = this.background
    clone.messageOutline = this.messageOutline

    this.topParticipants.forEach(participant => {
      clone.topParticipants.add(participant.clone())
    })
    this.bottomParticipants.forEach(participant => {
      clone.bottomParticipants.add(participant.clone())
    })
    return clone
  }

  /**
   * @type {!ShapeNodeStyle}
   */
  static get SHAPE_NODE_STYLE() {
    if (!ChoreographyNodeStyle._shapeNodeStyle) {
      const shapeNodeStyleRenderer = new ShapeNodeStyleRenderer()
      shapeNodeStyleRenderer.roundRectArcRadius = BPMN_CONSTANTS_CHOREOGRAPHY_CORNER_RADIUS
      ChoreographyNodeStyle._shapeNodeStyle = new ShapeNodeStyle({
        renderer: shapeNodeStyleRenderer,
        shape: ShapeNodeShape.ROUND_RECTANGLE,
        stroke: Stroke.BLACK,
        fill: null
      })
    }
    return ChoreographyNodeStyle._shapeNodeStyle
  }

  /**
   * @type {number}
   */
  static get MESSAGE_DISTANCE() {
    return 15
  }
}

/**
 * Uses the style insets extended by the size of the participant bands.
 */
class ChoreographyInsetsProvider extends BaseClass(INodeInsetsProvider) {
  /**
   * @param {!ChoreographyNodeStyle} style
   */
  constructor(style) {
    super()
    this.style = style
  }

  /**
   * @param {!INode} item
   * @returns {!Insets}
   */
  getInsets(item) {
    const topInsets = this.style.topParticipants.getHeight()
    let bottomInsets = this.style.bottomParticipants.getHeight()

    bottomInsets +=
      this.style.loopCharacteristic !== LoopCharacteristic.NONE ||
      this.style.subState !== SubState.NONE
        ? BPMN_CONSTANTS_SIZES_MARKER.height +
          BPMN_CONSTANTS_PLACEMENTS_CHOREOGRAPHY_MARKER.model.insets.bottom
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
 * A label helper which provides the next free location and the according style for a label added
 * to a node with
 * {@link ChoreographyNodeStyle}. Message labels will be visualized using
 * {@link ChoreographyMessageLabelStyle}.
 */
class ChoreographyEditLabelHelper extends EditLabelHelper {
  /**
   * @param {!INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * @param {!IInputModeContext} inputModeContext
   * @returns {!ILabelModelParameter}
   */
  getLabelParameter(inputModeContext) {
    const parameter = ChoreographyLabelModel.INSTANCE.findNextParameter(this.node)
    return parameter || ExteriorLabelModel.WEST
  }

  /**
   * @param {!IInputModeContext} inputModeContext
   * @param {!ILabelOwner} owner
   * @returns {!ILabelStyle}
   */
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

  /**
   * @param {!LabelEditingEventArgs} event
   */
  onLabelEditing(event) {
    // override default behavior
    // super.onLabelEditing would choose the first label if present but we want to edit the selected label
  }
}

/**
 * @param {!SvgVisualGroup} container
 * @param {number} index
 * @param {!Icon} icon
 * @param {!IRenderContext} context
 */
function updateChildVisual(container, index, icon, context) {
  const oldPathVisual = container.children.at(index)
  let newPathVisual = icon.updateVisual(context, oldPathVisual)
  if (!oldPathVisual.equals(newPathVisual)) {
    newPathVisual = newPathVisual != null ? newPathVisual : new SvgVisualGroup()
    container.children.remove(oldPathVisual)
    container.children.insert(index, newPathVisual)
  }
}

/**
 * A label style for message labels of nodes using a {@link ChoreographyNodeStyle}.
 * To place labels with this style, {@link ChoreographyLabelModel.NORTH_MESSAGE}
 * or {@link ChoreographyLabelModel.SOUTH_MESSAGE} are recommended.
 */
class ChoreographyMessageLabelStyle extends BaseClass(ILabelStyle) {
  /**
   * Creates a new instance.
   */
  constructor() {
    super()
    this._messageStyle = new BpmnNodeStyle()
    this._messageStyle.minimumSize = BPMN_CONSTANTS_SIZES_MESSAGE

    const connectedIconLabelStyle = new ConnectedIconLabelStyle()
    connectedIconLabelStyle.iconSize = BPMN_CONSTANTS_SIZES_MESSAGE
    connectedIconLabelStyle.iconStyle = this._messageStyle
    connectedIconLabelStyle.textStyle = ChoreographyMessageLabelStyle.TEXT_STYLE
    connectedIconLabelStyle.connectorStyle = ChoreographyMessageLabelStyle.CONNECTOR_STYLE
    connectedIconLabelStyle.labelConnectorLocation = FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
    connectedIconLabelStyle.nodeConnectorLocation = FreeNodePortLocationModel.NODE_TOP_ANCHORED
    this._delegateStyle = connectedIconLabelStyle
    this.textPlacement = ChoreographyMessageLabelStyle.DEFAULT_TEXT_PLACEMENT
  }

  /**
   * Gets where the text is placed relative to the message icon.
   * The label model parameter has to support {@link INode}s.
   * @type {?ILabelModelParameter}
   */
  get textPlacement() {
    return this.delegateStyle != null ? this.delegateStyle.textPlacement : null
  }

  /**
   * Sets where the text is placed relative to the message icon.
   * The label model parameter has to support {@link INode}s.
   * @type {?ILabelModelParameter}
   */
  set textPlacement(value) {
    if (this.delegateStyle != null) {
      this.delegateStyle.textPlacement = value
    }
  }

  /**
   * @type {!ConnectedIconLabelStyle}
   */
  get delegateStyle() {
    return this._delegateStyle
  }

  /**
   * @type {!BpmnNodeStyle}
   */
  get messageStyle() {
    return this._messageStyle
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    return new ChoreographyMessageLabelStyle()
  }

  /**
   * Gets the renderer implementation that can be queried for implementations
   * that provide details about the visual appearance and visual behavior
   * for a given label and this style instance.
   * The idiom for retrieving, e.g. an {@link IVisualCreator} implementation
   * for a given style is:
   * ```
   * var creator = style.renderer.getVisualCreator(label, style);
   * var visual = creator.createVisual(renderContext);
   * ```
   * @see Specified by {@link ILabelStyle.renderer}.
   * @type {!ILabelStyleRenderer}
   */
  get renderer() {
    return ChoreographyMessageLabelStyle.RENDERER
  }

  /**
   * @type {!ChoreographyMessageLabelStyleRenderer}
   */
  static get RENDERER() {
    return (
      ChoreographyMessageLabelStyle._renderer ||
      (ChoreographyMessageLabelStyle._renderer = new ChoreographyMessageLabelStyleRenderer())
    )
  }

  /**
   * @type {!ILabelModelParameter}
   */
  static get DEFAULT_TEXT_PLACEMENT() {
    if (!ChoreographyMessageLabelStyle._defaultTextPlacement) {
      const model = new ExteriorLabelModel()
      model.insets = new Insets(5)
      ChoreographyMessageLabelStyle._defaultTextPlacement = model.createParameter(
        ExteriorLabelModelPosition.WEST
      )
    }
    return ChoreographyMessageLabelStyle._defaultTextPlacement
  }

  /**
   * @type {!BpmnEdgeStyle}
   */
  static get CONNECTOR_STYLE() {
    if (!ChoreographyMessageLabelStyle._connectorStyle) {
      const style = new BpmnEdgeStyle()
      style.type = EdgeType.ASSOCIATION
      ChoreographyMessageLabelStyle._connectorStyle = style
    }
    return ChoreographyMessageLabelStyle._connectorStyle
  }

  /**
   * @type {!DefaultLabelStyle}
   */
  static get TEXT_STYLE() {
    return (
      ChoreographyMessageLabelStyle._textStyle ||
      (ChoreographyMessageLabelStyle._textStyle = new DefaultLabelStyle())
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
    this._messageColor = null
    this._messageOutline = null
  }

  /**
   * @param {!ILabel} item
   * @param {!ILabelStyle} style
   * @returns {!ILabelStyle}
   */
  getCurrentStyle(item, style) {
    if (!(style instanceof ChoreographyMessageLabelStyle)) {
      return VoidLabelStyle.INSTANCE
    }
    const labelStyle = style

    this.north = true
    this._messageColor = BPMN_CONSTANTS_DEFAULT_INITIATING_MESSAGE_COLOR
    this._messageOutline = null
    this.responseMessage = false
    if (item.owner instanceof INode) {
      const node = item.owner
      this.north = item.layout.orientedRectangleCenter.y < node.layout.center.y

      if (node.style instanceof ChoreographyNodeStyle) {
        this.responseMessage = node.style.initiatingAtTop !== this.north
        this._messageColor = this.responseMessage
          ? node.style.responseColor
          : node.style.initiatingColor
        this._messageOutline = node.style.messageStroke
      }
    }

    if (!this._messageOutline) {
      const outline = new Stroke(BPMN_CONSTANTS_DEFAULT_MESSAGE_OUTLINE)
      outline.freeze()
      this._messageOutline = outline
    }

    const delegateStyle = labelStyle.delegateStyle
    delegateStyle.iconStyle = labelStyle.messageStyle
    labelStyle.messageStyle.icon = IconFactory.createMessage(
      this._messageOutline,
      this._messageColor
    )
    delegateStyle.labelConnectorLocation = this.north
      ? FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
      : FreeNodePortLocationModel.NODE_TOP_ANCHORED
    delegateStyle.nodeConnectorLocation = this.north
      ? FreeNodePortLocationModel.NODE_TOP_ANCHORED
      : FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
    return delegateStyle
  }

  /**
   * Gets an implementation of the {@link IVisualCreator} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation, but never `null`.
   * @param {!ILabel} item The item to provide an instance for
   * @param {!ILabelStyle} style The style to use for the creation of the visual
   * @returns {!IVisualCreator} An implementation that may be used to subsequently create or update
   *   the visual for the item. Clients should not cache this instance and must always call this
   *   method immediately before using the value returned. This enables the use of the flyweight
   *   design pattern for implementations. This method may not return `null` but should
   *   yield a {@link VoidVisualCreator.INSTANCE void} implementation instead.
   * @see {@link VoidVisualCreator.INSTANCE}
   * @see Specified by {@link INodeStyleRenderer.getVisualCreator}.
   */
  getVisualCreator(item, style) {
    this.item = item
    this.style = style
    return this
  }

  /**
   * Gets an implementation of the {@link IBoundsProvider} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!ILabel} item The item to provide an instance for
   * @param {!ILabelStyle} style The style to use for the calculating the painting bounds
   * @returns {!IBoundsProvider} An implementation that may be used to subsequently query
   * the item's painting bounds. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer.getBoundsProvider}.
   */
  getBoundsProvider(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getBoundsProvider(item, delegateStyle)
  }

  /**
   * Gets an implementation of the {@link IVisibilityTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!ILabel} item The item to provide an instance for
   * @param {!ILabelStyle} style The style to use for the testing the visibility
   * @returns {!IVisibilityTestable} An implementation that may be used to subsequently query
   * the item's visibility. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer.getVisibilityTestable}.
   */
  getVisibilityTestable(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getVisibilityTestable(item, delegateStyle)
  }

  /**
   * Gets an implementation of the {@link IHitTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!ILabel} item The item to provide an instance for
   * @param {!ILabelStyle} style The style to use for the querying hit tests
   * @returns {!IHitTestable} An implementation that may be used to subsequently perform
   * hit tests. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations. This method may return
   *   `null` to indicate that the item cannot be hit tested.
   * @see Specified by {@link INodeStyleRenderer.getHitTestable}.
   */
  getHitTestable(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getHitTestable(item, delegateStyle)
  }

  /**
   * Gets an implementation of the {@link IMarqueeTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!ILabel} item The item to provide an instance for
   * @param {!ILabelStyle} style The style to use for the querying marquee intersection test.
   * @returns {!IMarqueeTestable} An implementation that may be used to subsequently query
   * the marquee intersections. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer.getMarqueeTestable}.
   */
  getMarqueeTestable(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getMarqueeTestable(item, delegateStyle)
  }

  /**
   * Gets a temporary context instance that can be used to query additional information
   * for the item's style.
   * Implementations may return {@link ILookup.EMPTY} if they don't support this, but may not return
   * `null`.
   * @param {!ILabel} item The item to provide a context instance for.
   * @param {!ILabelStyle} style The style to use for the context.
   * @returns {!ILookup} An non-`null` lookup implementation.
   * @see {@link ILookup.EMPTY}
   * @see {@link ILookup}
   * @see Specified by {@link INodeStyleRenderer.getContext}.
   */
  getContext(item, style) {
    const delegateStyle = this.getCurrentStyle(item, style)
    return delegateStyle.renderer.getContext(item, delegateStyle)
  }

  /**
   * Calculates the {@link ILabel.preferredSize preferred size}
   * of a given label using the associated style.
   * @param {!ILabel} label The label to determine the preferred size for
   * @param {!ILabelStyle} style The style instance that uses this instance as its
   * {@link ILabelStyle.renderer}
   * @returns {!Size} A size that can be used as the {@link ILabel.preferredSize}
   * if this renderer paints the label using the associated style.
   * @see Specified by {@link ILabelStyleRenderer.getPreferredSize}.
   */
  getPreferredSize(label, style) {
    const delegateStyle = this.getCurrentStyle(label, style)
    return delegateStyle.renderer.getPreferredSize(label, delegateStyle)
  }

  /**
   * This method is called by the framework to create a {@link Visual}
   * that will be included into the {@link IRenderContext}.
   * {@link CanvasComponent} uses this interface through the {@link ICanvasObjectDescriptor}
   * to populate the visual canvas object tree.
   * @param {!IRenderContext} context The context that describes where the visual will be used.
   * @returns {!SvgVisual} The visual to include in the canvas object visual tree. This may be
   *   `null`.
   * @see {@link IVisualCreator.updateVisual}
   * @see Specified by {@link IVisualCreator.createVisual}.
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
   * This method updates or replaces a previously created {@link Visual} for inclusion
   * in the {@link IRenderContext}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IVisualCreator.createVisual}. Implementation may update the `oldVisual`
   * and return that same reference, or create a new visual and return the new instance or
   * `null`.
   * @param {!IRenderContext} context The context that describes where the visual will be used in.
   * @param {!SvgVisual} oldVisual The visual instance that had been returned the last time the {@link
   *   IVisualCreator#createVisual} method was called on this instance.
   * @returns {!SvgVisual} `oldVisual`, if this instance modified the visual, or a new visual
   *   that should replace the existing one in the canvas object visual tree.
   * @see {@link IVisualCreator.createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator.updateVisual}.
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (!container) {
      this.createVisual(context)
    }
    const cache = container != null ? oldVisual['render-data-cache'] : null
    const newCache = this.createRenderData()
    if (cache == null || !cache.equals(newCache) || container.children.size !== 1) {
      return this.createVisual(context)
    }
    const delegateStyle = this.getCurrentStyle(this.item, this.style)
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
   * Returns an object that contains all information necessary to determine whether a visual needs
   * to be updated.
   * @returns {!RenderData}
   */
  createRenderData() {
    const renderData = new RenderData()
    renderData.north = this.north
    renderData.messageColor = this._messageColor
    renderData.messageOutline = this._messageOutline
    renderData.textPlacement = this.style.textPlacement
    return renderData
  }
}

class RenderData {
  constructor() {
    this.textPlacement = null
    this.north = false
    this.responseMessage = false
    this.messageColor = null
    this.messageOutline = null
  }

  /**
   * @param {!object} obj
   * @returns {boolean}
   */
  equals(obj) {
    if (!(obj instanceof RenderData)) {
      return false
    }
    return (
      this.textPlacement === obj.textPlacement &&
      this.north === obj.north &&
      IconFactory.equalFill(this.messageColor, obj.messageColor) &&
      IconFactory.equalStroke(this.messageOutline, obj.messageOutline)
    )
  }

  /**
   * @returns {number}
   */
  hashCode() {
    const placement = this.textPlacement
    let result = placement ? placement.hashCode() : 0
    result = (result * 397) ^ (this.north ? 1 : 0)
    result = (result * 397) ^ (this.responseMessage ? 1 : 0)
    return result
  }
}

/**
 * An {@link PolylineEdgeStyle} implementation representing a connection according to the BPMN.
 */
export class BpmnEdgeStyle extends EdgeStyleBase {
  constructor() {
    super()
    this._type = EdgeType.SEQUENCE_FLOW
    this._smoothing = 20
    this._sourceArrow = null
    this._targetArrow = null
    this._innerStroke = null
    this._stroke = null
    this.color = BPMN_CONSTANTS_EDGE_DEFAULT_COLOR
    this.innerColor = BPMN_CONSTANTS_EDGE_DEFAULT_INNER_COLOR
  }

  /**
   * Gets the edge type of this style.
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * Sets the edge type of this style.
   * @type {number}
   */
  set type(value) {
    this._type = value
    this.updateStroke(this.color)
    this.updateArrow(value)
  }

  /**
   * Gets the stroke color of the edge.
   * @type {?Fill}
   */
  get color() {
    return this._stroke ? this._stroke.fill : null
  }

  /**
   * Sets the stroke color of the edge.
   * @type {?Fill}
   */
  set color(value) {
    if (this._stroke == null || !IconFactory.equalFill(this._stroke.fill, value)) {
      this.updateStroke(value)
      this.updateArrow(this.type)
    }
  }

  /**
   * Gets the inner stroke color of the edge when {@link BpmnEdgeStyle.type} is
   * {@link EdgeType.CONVERSATION}.
   * @type {?Fill}
   */
  get innerColor() {
    return this._innerStroke ? this._innerStroke.fill : null
  }

  /**
   * Sets the inner stroke color of the edge when {@link BpmnEdgeStyle.type} is
   * {@link EdgeType.CONVERSATION}.
   * @type {?Fill}
   */
  set innerColor(value) {
    if (this._innerStroke == null || !IconFactory.equalFill(this._innerStroke.fill, value)) {
      const stroke = new Stroke(value)
      stroke.lineJoin = LineJoin.ROUND
      stroke.freeze()
      this._innerStroke = stroke
    }
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    const bpmnEdgeStyle = new BpmnEdgeStyle()
    bpmnEdgeStyle.type = this.type
    bpmnEdgeStyle.color = this.color
    bpmnEdgeStyle.innerColor = this.innerColor
    bpmnEdgeStyle.smoothing = this.smoothing
    return bpmnEdgeStyle
  }

  /**
   * Gets the visual arrow at the source end of edges that use this style.
   * Arrow instances may be shared between multiple style instances.
   * @type {?IArrow}
   */
  get sourceArrow() {
    return this._sourceArrow
  }

  /**
   * Gets the visual arrow at the target end of edges that use this style.
   * Arrow instances may be shared between multiple style instances.
   * @type {?IArrow}
   */
  get targetArrow() {
    return this._targetArrow
  }

  /**
   * Gets the smoothing length used for creating smooth bends.
   * A value of `0.0d` will disable smoothing.
   * @see Specified by {@link PolylineEdgeStyle.smoothing}.
   * @type {number}
   */
  get smoothing() {
    return this._smoothing
  }

  /**
   * Sets the smoothing length used for creating smooth bends.
   * A value of `0.0d` will disable smoothing.
   * @see Specified by {@link PolylineEdgeStyle.smoothing}.
   * @type {number}
   */
  set smoothing(value) {
    this._smoothing = value
  }

  /**
   * @param {?Fill} fill
   */
  updateStroke(fill) {
    let result
    switch (this.type) {
      case EdgeType.CONDITIONAL_FLOW:
      case EdgeType.DEFAULT_FLOW:
      case EdgeType.SEQUENCE_FLOW:
      default:
        result = new Stroke(fill)
        break
      case EdgeType.ASSOCIATION:
      case EdgeType.DIRECTED_ASSOCIATION:
      case EdgeType.BIDIRECTED_ASSOCIATION:
        result = new Stroke({
          fill: fill,
          dashStyle: DashStyle.DOT,
          lineCap: LineCap.ROUND
        })
        break
      case EdgeType.MESSAGE_FLOW:
        result = new Stroke({
          fill: fill,
          dashStyle: DashStyle.DASH
        })
        break
      case EdgeType.CONVERSATION:
        result = new Stroke({
          fill: fill,
          thickness: 3,
          lineJoin: LineJoin.ROUND
        })
        break
    }
    result.freeze()
    this._stroke = result
  }

  /**
   * @param {number} type
   */
  updateArrow(type) {
    const color = this.color
    switch (type) {
      case EdgeType.CONDITIONAL_FLOW:
        this._sourceArrow = BpmnEdgeStyle.getConditionalSourceArrow(color)
        this._targetArrow = BpmnEdgeStyle.getDefaultTargetArrow(color)
        break
      case EdgeType.ASSOCIATION:
        this._sourceArrow = IArrow.NONE
        this._targetArrow = IArrow.NONE
        break
      case EdgeType.DIRECTED_ASSOCIATION:
        this._sourceArrow = IArrow.NONE
        this._targetArrow = BpmnEdgeStyle.getAssociationArrow(color)
        break
      case EdgeType.BIDIRECTED_ASSOCIATION:
        this._sourceArrow = BpmnEdgeStyle.getAssociationArrow(color)
        this._targetArrow = BpmnEdgeStyle.getAssociationArrow(color)
        break
      case EdgeType.MESSAGE_FLOW:
        this._sourceArrow = BpmnEdgeStyle.getMessageSourceArrow(color)
        this._targetArrow = BpmnEdgeStyle.getMessageTargetArrow(color)
        break
      case EdgeType.DEFAULT_FLOW:
        this._sourceArrow = BpmnEdgeStyle.getDefaultSourceArrow(color)
        this._targetArrow = BpmnEdgeStyle.getDefaultTargetArrow(color)
        break
      case EdgeType.CONVERSATION:
        this._sourceArrow = IArrow.NONE
        this._targetArrow = IArrow.NONE
        break
      case EdgeType.SEQUENCE_FLOW:
      default:
        this._sourceArrow = IArrow.NONE
        this._targetArrow = BpmnEdgeStyle.getDefaultTargetArrow(color)
        break
    }
  }

  /**
   * This method is called by the framework to create a {@link Visual}
   * that will be included into the {@link IRenderContext}.
   * {@link CanvasComponent} uses this interface through the {@link ICanvasObjectDescriptor}
   * to populate the visual canvas object tree.
   * @param {!IRenderContext} context The context that describes where the visual will be used.
   * @param {!IEdge} edge The edge for which the visual is created.
   * @returns {!SvgVisual} The visual to include in the canvas object visual tree. This may be
   *   `null`.
   * @see {@link IVisualCreator.updateVisual}
   */
  createVisual(context, edge) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const smoothedPath = this.getPath(edge)
    const path = smoothedPath.createSvgPath()
    Stroke.setStroke(this._stroke, path, context)
    path.setAttribute('fill', 'none')
    container.appendChild(path)

    if (this.type === EdgeType.CONVERSATION) {
      const doubleLineCenterPath = smoothedPath.createSvgPath()
      Stroke.setStroke(this._innerStroke, doubleLineCenterPath, context)
      doubleLineCenterPath.setAttribute('fill', 'none')
      container.appendChild(doubleLineCenterPath)
    }

    super.addArrows(context, container, edge, smoothedPath, this.sourceArrow, this.targetArrow)
    container['render-data-cache'] = {
      type: this.type,
      color: this.color,
      innerColor: this.innerColor,
      path: smoothedPath
    }

    return new SvgVisual(container)
  }

  /**
   * @param {!IEdge} edge
   * @returns {!GeneralPath}
   */
  getPath(edge) {
    const path = super.getPath(edge)
    return super
      .cropPath(edge, this.sourceArrow, this.targetArrow, path)
      .createSmoothedPath(this.smoothing)
  }

  /**
   * This method updates or replaces a previously created {@link Visual} for inclusion
   * in the {@link IRenderContext}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IVisualCreator.createVisual}. Implementation may update the `oldVisual`
   * and return that same reference, or create a new visual and return the new instance or
   * `null`.
   * @param {!IRenderContext} context The context that describes where the visual will be used in.
   * @param {!SvgVisual} oldVisual The visual instance that had been returned the last time the {@link
   *   IVisualCreator#createVisual} method was called on this instance.
   * @param {!IEdge} edge The edge for which the visual is updated.
   * @returns {!SvgVisual} `oldVisual`, if this instance modified the visual, or a new visual
   *   that should replace the existing one in the canvas object visual tree.
   * @see {@link IVisualCreator.createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator.updateVisual}.
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

    if (
      cache.type !== this.type ||
      cache.color !== this.color ||
      cache.innerColor !== this.innerColor
    ) {
      const path = container.firstElementChild
      Stroke.setStroke(this._stroke, path, context)

      if (this.type === EdgeType.CONVERSATION) {
        const doubleLineCenterPath = newPath.createSvgPath()
        Stroke.setStroke(this._innerStroke, doubleLineCenterPath, context)
        container.appendChild(doubleLineCenterPath)
      } else if (cache.type === EdgeType.CONVERSATION) {
        container.removeChild(container.lastElementChild)
      }

      if (this.type !== EdgeType.CONVERSATION && cache.color !== this.color) {
        this.updateArrow(this.type)
        super.updateArrows(context, container, edge, newPath, IArrow.NONE, IArrow.NONE)
        super.updateArrows(context, container, edge, newPath, this.sourceArrow, this.targetArrow)
      }

      cache.type = this.type
      cache.color = this.color
      cache.innerColor = this.innerColor
    }

    super.updateArrows(context, container, edge, newPath, this.sourceArrow, this.targetArrow)

    return oldVisual
  }

  /**
   * @param {!Fill} fill
   * @returns {!IconArrow}
   */
  static getDefaultTargetArrow(fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, Fill.BLACK)
    if (hasDefaultColor && BpmnEdgeStyle._defaultTargetArrow) {
      return BpmnEdgeStyle._defaultTargetArrow
    }
    const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.DEFAULT_TARGET, fill))
    iconArrow.bounds = new Size(8, 6)
    iconArrow.cropLength = 1
    iconArrow.length = 8
    if (hasDefaultColor) {
      BpmnEdgeStyle._defaultTargetArrow = iconArrow
    }
    return iconArrow
  }

  /**
   * @param {!Fill} fill
   * @returns {!IconArrow}
   */
  static getDefaultSourceArrow(fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, Fill.BLACK)
    if (hasDefaultColor && BpmnEdgeStyle._defaultSourceArrow) {
      return BpmnEdgeStyle._defaultSourceArrow
    }
    const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.DEFAULT_SOURCE, fill))
    iconArrow.bounds = new Size(8, 6)
    iconArrow.cropLength = 0
    iconArrow.length = 0
    if (hasDefaultColor) {
      BpmnEdgeStyle._defaultSourceArrow = iconArrow
    }
    return iconArrow
  }

  /**
   * @param {!Fill} fill
   * @returns {!IconArrow}
   */
  static getAssociationArrow(fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, Fill.BLACK)
    if (hasDefaultColor && BpmnEdgeStyle._associationArrow) {
      return BpmnEdgeStyle._associationArrow
    }
    const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.ASSOCIATION, fill))
    iconArrow.bounds = new Size(8, 6)
    iconArrow.cropLength = 1
    iconArrow.length = 0
    if (hasDefaultColor) {
      BpmnEdgeStyle._associationArrow = iconArrow
    }
    return iconArrow
  }

  /**
   * @param {!Fill} fill
   * @returns {!IconArrow}
   */
  static getConditionalSourceArrow(fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, Fill.BLACK)
    if (hasDefaultColor && BpmnEdgeStyle._conditionalSourceArrow) {
      return BpmnEdgeStyle._conditionalSourceArrow
    }
    const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.CONDITIONAL_SOURCE, fill))
    iconArrow.bounds = new Size(16, 8)
    iconArrow.cropLength = 1
    iconArrow.length = 16
    if (hasDefaultColor) {
      BpmnEdgeStyle._conditionalSourceArrow = iconArrow
    }
    return iconArrow
  }

  /**
   * @param {!Fill} fill
   * @returns {!IconArrow}
   */
  static getMessageTargetArrow(fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, Fill.BLACK)
    if (hasDefaultColor && BpmnEdgeStyle._messageTargetArrow) {
      return BpmnEdgeStyle._messageTargetArrow
    }
    const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.MESSAGE_TARGET, fill))
    iconArrow.bounds = new Size(8, 6)
    iconArrow.cropLength = 1
    iconArrow.length = 8
    if (hasDefaultColor) {
      BpmnEdgeStyle._messageTargetArrow = iconArrow
    }
    return iconArrow
  }

  /**
   * @param {!Fill} fill
   * @returns {!IconArrow}
   */
  static getMessageSourceArrow(fill) {
    const hasDefaultColor = IconFactory.equalFill(fill, Fill.BLACK)
    if (hasDefaultColor && BpmnEdgeStyle._messageSourceArrow) {
      return BpmnEdgeStyle._messageSourceArrow
    }
    const iconArrow = new IconArrow(IconFactory.createArrowIcon(ArrowType.MESSAGE_SOURCE, fill))
    iconArrow.bounds = new Size(6, 6)
    iconArrow.cropLength = 1
    iconArrow.length = 6
    if (hasDefaultColor) {
      BpmnEdgeStyle._messageSourceArrow = iconArrow
    }
    return iconArrow
  }
}

/**
 * Uses the style insets extended by the size of the participant bands.
 */
class ActivityInsetsProvider extends BaseClass(INodeInsetsProvider) {
  /**
   * @param {!ActivityNodeStyle} style
   */
  constructor(style) {
    super()
    this.style = style
  }

  /**
   * @param {!INode} item
   * @returns {!Insets}
   */
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
  constructor() {
    super()
    this._taskType = TaskType.ABSTRACT
    this._triggerEventType = EventType.MESSAGE
    this._triggerEventCharacteristic = EventCharacteristic.SUB_PROCESS_INTERRUPTING
    this._loopCharacteristic = LoopCharacteristic.NONE
    this._subState = SubState.NONE
    this._insets = new Insets(15)
    this._background = BPMN_CONSTANTS_ACTIVITY_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_ACTIVITY_DEFAULT_OUTLINE
    this._eventOutline = BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
    this._activityIcon = null
    this._taskIcon = null
    this._loopIcon = null
    this._adHoc = false
    this._adHocIcon = null
    this._compensation = false
    this._compensationIcon = null
    this._activityType = ActivityType.TASK
    this.activityType = ActivityType.TASK
    this.minimumSize = new Size(40, 30)
  }

  /**
   * Gets the activity type for this style.
   * @type {number}
   */
  get activityType() {
    return this._activityType
  }

  /**
   * Sets the activity type for this style.
   * @type {number}
   */
  set activityType(value) {
    if (this._activityType !== value || this._activityIcon == null) {
      this.modCount++
      this._activityType = value
      this.updateActivityIcon()
    }
  }

  /**
   * Gets the task type for this style.
   * @type {number}
   */
  get taskType() {
    return this._taskType
  }

  /**
   * Sets the task type for this style.
   * @type {number}
   */
  set taskType(value) {
    if (this._taskType !== value) {
      this.modCount++
      this._taskType = value
      this.updateTaskIcon()
    }
  }

  /**
   * Gets the event type that is used for the task type {@link TaskType.EVENT_TRIGGERED}.
   * @type {number}
   */
  get triggerEventType() {
    return this._triggerEventType
  }

  /**
   * Sets the event type that is used for the task type {@link TaskType.EVENT_TRIGGERED}.
   * @type {number}
   */
  set triggerEventType(value) {
    if (this._triggerEventType !== value) {
      this._triggerEventType = value
      if (this.taskType === TaskType.EVENT_TRIGGERED) {
        this.modCount++
        this.updateTaskIcon()
      }
    }
  }

  /**
   * Gets the event characteristic that is used for the task type {@link TaskType.EVENT_TRIGGERED}.
   * @type {number}
   */
  get triggerEventCharacteristic() {
    return this._triggerEventCharacteristic
  }

  /**
   * Sets the event characteristic that is used for the task type {@link TaskType.EVENT_TRIGGERED}.
   * @type {number}
   */
  set triggerEventCharacteristic(value) {
    if (this._triggerEventCharacteristic !== value) {
      this._triggerEventCharacteristic = value
      if (this.taskType === TaskType.EVENT_TRIGGERED) {
        this.modCount++
        this.updateTaskIcon()
      }
    }
  }

  /**
   * Gets the loop characteristic of this style.
   * @type {number}
   */
  get loopCharacteristic() {
    return this._loopCharacteristic
  }

  /**
   * Sets the loop characteristic of this style.
   * @type {number}
   */
  set loopCharacteristic(value) {
    if (this._loopCharacteristic !== value) {
      this.modCount++
      this._loopCharacteristic = value
      this.updateLoopIcon()
    }
  }

  /**
   * Gets the sub state of this style.
   * @type {number}
   */
  get subState() {
    return this._subState
  }

  /**
   * Sets the sub state of this style.
   * @type {number}
   */
  set subState(value) {
    if (this._subState !== value) {
      this.modCount++
      this._subState = value
    }
  }

  /**
   * Gets whether this style represents an Ad Hoc Activity.
   * @type {boolean}
   */
  get adHoc() {
    return this._adHoc
  }

  /**
   * Sets whether this style represents an Ad Hoc Activity.
   * @type {boolean}
   */
  set adHoc(value) {
    if (this._adHoc !== value) {
      this.modCount++
      this._adHoc = value
      this.updateAdHocIcon()
    }
  }

  /**
   * Gets whether this style represents a Compensation Activity.
   * @type {boolean}
   */
  get compensation() {
    return this._compensation
  }

  /**
   * Sets whether this style represents a Compensation Activity.
   * @type {boolean}
   */
  set compensation(value) {
    if (this._compensation !== value) {
      this.modCount++
      this._compensation = value
      this.updateCompensationIcon()
    }
  }

  /**
   * Gets the insets for the node.
   * These insets are extended at the left and bottom side if markers are active
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link NodeStyleBase.lookup lookup}.
   * @see {@link INodeInsetsProvider}
   * @return An insets object that describes the insets of node.
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * Sets the insets for the node.
   * These insets are extended at the left and bottom side if markers are active
   * and returned via an {@link INodeInsetsProvider} if such an instance is queried through the
   * {@link NodeStyleBase.lookup lookup}.
   * @see {@link INodeInsetsProvider}
   * @param insets An insets object that describes the insets of node.
   * @type {!Insets}
   */
  set insets(insets) {
    this._insets = insets
  }

  /**
   * Gets the background color of the activity.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the activity.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value || this._activityIcon == null) {
      this.modCount++
      this._background = value
      this.updateActivityIcon()
      this.updateTaskIcon()
    }
  }

  /**
   * Gets the outline color of the activity.
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the activity.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._outline !== value || this._activityIcon == null) {
      this.modCount++
      this._outline = value
      this.updateActivityIcon()
    }
  }

  /**
   * Gets the primary color for icons and markers.
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * Sets the primary color for icons and markers.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._iconColor !== value) {
      this.modCount++
      this._iconColor = value
      this.updateTaskIcon()
      this.updateLoopIcon()
      this.updateAdHocIcon()
      this.updateCompensationIcon()
    }
  }

  /**
   * Gets the outline color for event icons if {@link ActivityNodeStyle.taskType} is
   * {@link EventType.EVENT_TRIGGERED}. If this is set to null, the outline color is automatic,
   * based on the TriggerEventCharacteristic.
   * @type {?Fill}
   */
  get eventOutline() {
    return this._eventOutline
  }

  /**
   * Sets the outline color for the event icon.
   * @type {?Fill}
   */
  set eventOutline(value) {
    if (this._eventOutline !== value) {
      this.modCount++
      this._eventOutline = value
      this.updateTaskIcon()
    }
  }

  updateActivityIcon() {
    this._activityIcon = IconFactory.createActivity(
      this._activityType,
      this.background,
      this.outline
    )
  }

  updateTaskIcon() {
    if (this.taskType === TaskType.EVENT_TRIGGERED) {
      const eventNodeStyle = new EventNodeStyle()
      eventNodeStyle.characteristic = this.triggerEventCharacteristic
      eventNodeStyle.type = this.triggerEventType
      eventNodeStyle.background = this.background
      eventNodeStyle.outline = this.eventOutline
      eventNodeStyle.iconColor = this.iconColor

      eventNodeStyle.updateIcon()
      this._taskIcon = eventNodeStyle.icon
    } else {
      this._taskIcon = IconFactory.createActivityTaskType(
        this._taskType,
        this.iconColor,
        this.background
      )
    }
    if (this._taskIcon != null) {
      this._taskIcon = IconFactory.createPlacedIcon(
        this._taskIcon,
        BPMN_CONSTANTS_PLACEMENTS_TASK_TYPE,
        BPMN_CONSTANTS_SIZES_TASK_TYPE
      )
    }
  }

  updateAdHocIcon() {
    this._adHocIcon = this.adHoc ? IconFactory.createAdHoc(this.iconColor) : null
  }

  updateCompensationIcon() {
    this._compensationIcon = this.compensation
      ? IconFactory.createCompensation(false, this.iconColor)
      : null
  }

  updateLoopIcon() {
    this._loopIcon = IconFactory.createLoopCharacteristic(this.loopCharacteristic, this.iconColor)
  }

  /**
   * @inheritDoc
   * @param {!INode} node
   */
  updateIcon(node) {
    this.icon = this.createIcon(node)
  }

  /**
   * @param {!INode} node
   * @returns {?Icon}
   */
  createIcon(node) {
    let minimumWidth = 10.0

    const icons = new List()
    if (this._activityIcon) {
      icons.add(this._activityIcon)
    }
    if (this._taskIcon) {
      icons.add(this._taskIcon)
    }

    const lineUpIcons = new List()
    if (this._loopIcon) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      lineUpIcons.add(this._loopIcon)
    }
    if (this.adHoc) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      lineUpIcons.add(this._adHocIcon)
    }
    if (this.compensation) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      lineUpIcons.add(this._compensationIcon)
    }
    if (this.subState !== SubState.NONE) {
      minimumWidth += BPMN_CONSTANTS_SIZES_MARKER.width + 5
      if (this.subState === SubState.DYNAMIC) {
        lineUpIcons.add(IconFactory.createDynamicSubState(node, this.iconColor))
      } else {
        lineUpIcons.add(IconFactory.createStaticSubState(this.subState, this.iconColor))
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
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!GeneralPath} The outline of the visual representation or `null`.
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
   * @param {!IInputModeContext} canvasContext The canvas context.
   * @param {!Point} p The point to test.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {boolean} `true` if the specified node representation is hit; otherwise,
   *   `false`.
   */
  isHit(canvasContext, p, node) {
    return ActivityNodeStyle.SHAPE_NODE_STYLE.renderer
      .getHitTestable(node, ActivityNodeStyle.SHAPE_NODE_STYLE)
      .isHit(canvasContext, p)
  }

  /**
   * Performs the {@link ILookup.lookup} operation.
   * @param {!INode} node The node to use for the context lookup.
   * @param {!Class} type The type to query.
   * @returns {!object} An implementation of the `type` or `null`.
   */
  lookup(node, type) {
    if (type === INodeInsetsProvider.$class) {
      return new ActivityInsetsProvider(this)
    }
    return super.lookup(node, type)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} radius
   * @returns {!GeneralPath}
   */
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

  /**
   * @type {!ShapeNodeStyle}
   */
  static get SHAPE_NODE_STYLE() {
    if (!ActivityNodeStyle._shapeNodeStyle) {
      const shapeNodeStyleRenderer = new ShapeNodeStyleRenderer()
      shapeNodeStyleRenderer.roundRectArcRadius = BPMN_CONSTANTS_ACTIVITY_CORNER_RADIUS
      ActivityNodeStyle._shapeNodeStyle = new ShapeNodeStyle({
        renderer: shapeNodeStyleRenderer,
        shape: ShapeNodeShape.ROUND_RECTANGLE,
        stroke: Stroke.BLACK,
        fill: null
      })
    }
    return ActivityNodeStyle._shapeNodeStyle
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
 * Custom stripe style that alternates the visualizations for the leaf nodes and uses a different
 * style for all parent stripes.
 */
export class AlternatingLeafStripeStyle extends StripeStyleBase {
  constructor() {
    super()
    this._evenLeafDescriptor = null
    this._parentDescriptor = null
    this._oddLeafDescriptor = null
  }

  /**
   * Visualization for all leaf stripes that have an even index.
   * @type {!StripeDescriptor}
   */
  get evenLeafDescriptor() {
    return this._evenLeafDescriptor
  }

  /**
   * Visualization for all leaf stripes that have an even index.
   * @type {!StripeDescriptor}
   */
  set evenLeafDescriptor(value) {
    this._evenLeafDescriptor = value
  }

  /**
   * Visualization for all stripes that are not leaves.
   * @type {!StripeDescriptor}
   */
  get parentDescriptor() {
    return this._parentDescriptor
  }

  /**
   * Visualization for all stripes that are not leaves.
   * @type {!StripeDescriptor}
   */
  set parentDescriptor(value) {
    this._parentDescriptor = value
  }

  /**
   * Visualization for all leaf stripes that have an odd index.
   * @type {!StripeDescriptor}
   */
  get oddLeafDescriptor() {
    return this._oddLeafDescriptor
  }

  /**
   * Visualization for all leaf stripes that have an odd index.
   * @type {!StripeDescriptor}
   */
  set oddLeafDescriptor(value) {
    this._oddLeafDescriptor = value
  }

  /**
   * Callback that creates the visual.
   * @param {!IStripe} node The node to which this style instance is assigned.
   * @param {!IRenderContext} renderContext The render context.
   * @returns {?SvgVisual} The visual.
   * @see {@link NodeStyleBase.updateVisual}
   */
  createVisual(renderContext, node) {
    const stripe = node.lookup(IStripe.$class)
    const layout = node.layout
    if (stripe != null) {
      const container = new SvgVisualGroup()
      let stripeInsets
      let descriptor

      // Depending on the stripe type, we need to consider horizontal or vertical insets
      if (stripe instanceof IColumn) {
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
        if (stripe instanceof IColumn) {
          const col = stripe
          // Get all leaf columns
          const leaves = col.table.rootColumn.leaves.toList()
          // Determine the index
          index = leaves.findIndex(curr => col === curr)
          // Use the correct descriptor
          descriptor = index % 2 === 0 ? this.evenLeafDescriptor : this.oddLeafDescriptor
          actualBorderThickness = descriptor.borderThickness
        } else {
          const row = stripe
          const leaves = row.table.rootRow.leaves.toList()
          index = leaves.findIndex(curr => row === curr)
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
   * Callback that updates the visual previously created by {@link NodeStyleBase.createVisual}.
   * This method is called in response to a {@link IVisualCreator.updateVisual}
   * call to the instance that has been queried from the {@link NodeStyleBase.renderer}.
   * This implementation simply delegates to {@link NodeStyleBase.createVisual} so subclasses
   * should override to improve rendering performance.
   * @param {!IStripe} node The node to which this style instance is assigned.
   * @param {!IRenderContext} renderContext The render context.
   * @param {!SvgVisualGroup} oldVisual The visual that should be updated.
   * @returns {?SvgVisual} The visual.
   * @see {@link NodeStyleBase.createVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const stripe = node.lookup(IStripe.$class)
    const layout = node.layout
    if (stripe != null) {
      let stripeInsets
      // Check if values have changed - then update everything
      let descriptor
      if (stripe instanceof IColumn) {
        const col = stripe
        stripeInsets = new Insets(0, col.actualInsets.top, 0, col.actualInsets.bottom)
      } else {
        const row = stripe
        stripeInsets = new Insets(row.actualInsets.left, 0, row.actualInsets.right, 0)
      }

      let actualBorderThickness

      if (stripe.childStripes.size > 0) {
        descriptor = this.parentDescriptor
        actualBorderThickness = descriptor.borderThickness
      } else {
        let index
        if (stripe instanceof IColumn) {
          const col = stripe
          const leaves = col.table.rootColumn.leaves.toList()
          index = leaves.findIndex(curr => col === curr)
          descriptor = index % 2 === 0 ? this.evenLeafDescriptor : this.oddLeafDescriptor
          actualBorderThickness = descriptor.borderThickness
        } else {
          const row = stripe
          const leaves = row.table.rootRow.leaves.toList()
          index = leaves.findIndex(curr => row === curr)
          descriptor = index % 2 === 0 ? this.evenLeafDescriptor : this.oddLeafDescriptor
          actualBorderThickness = descriptor.borderThickness
        }
      }

      // get the data with which the oldvisual was created
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

      const children = oldVisual.children
      const child = children.get(0)
      children.set(
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

  /**
   * @param {!StripeDescriptor} descriptor
   * @param {!IStripe} stripe
   * @param {!Insets} insets
   * @returns {!StripeRenderDataCache}
   */
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
  constructor() {
    super()
    this._backgroundFill = null
    this._insetFill = null
    this._stroke = null
    this._insets = Insets.EMPTY
  }

  /**
   * @param {!IRenderContext} context
   * @param {!Rect} bounds
   * @param {!object} data
   * @returns {!SvgVisual}
   */
  createVisual(context, bounds, data) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const backgroundRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    backgroundRectangle.setAttribute('x', '0')
    backgroundRectangle.setAttribute('y', '0')
    backgroundRectangle.setAttribute('width', `${bounds.width}`)
    backgroundRectangle.setAttribute('height', `${bounds.height}`)
    backgroundRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.backgroundFill, backgroundRectangle, context)
    container.appendChild(backgroundRectangle)
    const leftInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    leftInsetRectangle.setAttribute('x', '0')
    leftInsetRectangle.setAttribute('y', '0')
    leftInsetRectangle.setAttribute('width', `${this.insets.left}`)
    leftInsetRectangle.setAttribute('height', `${bounds.height}`)
    leftInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, leftInsetRectangle, context)
    container.appendChild(leftInsetRectangle)
    const topInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    topInsetRectangle.setAttribute('x', '0')
    topInsetRectangle.setAttribute('y', '0')
    topInsetRectangle.setAttribute('width', `${bounds.width}`)
    topInsetRectangle.setAttribute('height', `${this.insets.top}`)
    topInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, topInsetRectangle, context)
    container.appendChild(topInsetRectangle)
    const rightInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rightInsetRectangle.setAttribute('x', `${bounds.width - this.insets.right}`)
    rightInsetRectangle.setAttribute('y', '0')
    rightInsetRectangle.setAttribute('width', `${this.insets.right}`)
    rightInsetRectangle.setAttribute('height', `${bounds.height}`)
    rightInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, rightInsetRectangle, context)
    container.appendChild(rightInsetRectangle)
    const bottomInsetRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bottomInsetRectangle.setAttribute('x', '0')
    bottomInsetRectangle.setAttribute('y', `${bounds.height - this.insets.bottom}`)
    bottomInsetRectangle.setAttribute('width', `${bounds.width}`)
    bottomInsetRectangle.setAttribute('height', `${this.insets.bottom}`)
    bottomInsetRectangle.setAttribute('stroke', 'none')
    Fill.setFill(this.insetFill, bottomInsetRectangle, context)
    container.appendChild(bottomInsetRectangle)
    const borderRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    borderRectangle.setAttribute('x', '0')
    borderRectangle.setAttribute('y', '0')
    borderRectangle.setAttribute('width', `${bounds.width}`)
    borderRectangle.setAttribute('height', `${bounds.height}`)
    Stroke.setStroke(this.stroke, borderRectangle, context)
    borderRectangle.setAttribute('fill', 'none')
    container.appendChild(borderRectangle)

    SvgVisual.setTranslate(container, bounds.x, bounds.y)
    container['render-data-cache'] = {
      bounds: bounds.toRect(),
      insets: this.insets,
      stroke: this.stroke,
      backgroundFill: this.backgroundFill ? this.backgroundFill.clone() : null,
      insetFill: this.insetFill ? this.insetFill.clone() : null
    }

    return new SvgVisual(container)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!Rect} bounds
   * @param {!object} data
   * @returns {?SvgVisual}
   */
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
      backgroundRectangle.setAttribute('width', `${bounds.width}`)
      backgroundRectangle.setAttribute('height', `${bounds.height}`)
      const leftInsetRectangle = container.childNodes[1]
      leftInsetRectangle.setAttribute('x', '0')
      leftInsetRectangle.setAttribute('y', '0')
      leftInsetRectangle.setAttribute('width', `${insets.left}`)
      leftInsetRectangle.setAttribute('height', `${bounds.height}`)
      const topInsetRectangle = container.childNodes[2]
      topInsetRectangle.setAttribute('x', '0')
      topInsetRectangle.setAttribute('y', '0')
      topInsetRectangle.setAttribute('width', `${bounds.width}`)
      topInsetRectangle.setAttribute('height', `${insets.top}`)
      const rightInsetsRectangle = container.childNodes[3]
      rightInsetsRectangle.setAttribute('x', `${bounds.width - insets.right}`)
      rightInsetsRectangle.setAttribute('y', '0')
      rightInsetsRectangle.setAttribute('width', `${insets.right}`)
      rightInsetsRectangle.setAttribute('height', `${bounds.height}`)
      const bottomInsetRectangle = container.childNodes[4]
      bottomInsetRectangle.setAttribute('x', '0')
      bottomInsetRectangle.setAttribute('y', `${bounds.height - insets.bottom}`)
      bottomInsetRectangle.setAttribute('width', `${bounds.width}`)
      bottomInsetRectangle.setAttribute('height', `${insets.bottom}`)
      const borderRectangle = container.childNodes[5]
      borderRectangle.setAttribute('x', '0')
      borderRectangle.setAttribute('y', '0')
      borderRectangle.setAttribute('width', `${bounds.width}`)
      borderRectangle.setAttribute('height', `${bounds.height}`)

      cache.insets = insets
      cache.bounds = bounds.toRect()
    }

    SvgVisual.setTranslate(container, bounds.x, bounds.y)

    return new SvgVisual(container)
  }

  /**
   * Returns the fill for inside the rectangle.
   * @type {?Fill}
   */
  get backgroundFill() {
    return this._backgroundFill
  }

  /**
   * Specifies the fill for inside the rectangle.
   * @type {?Fill}
   */
  set backgroundFill(fill) {
    this._backgroundFill = fill
  }

  /**
   * Returns the stroke for the outline of the rectangle.
   * @type {?Stroke}
   */
  get stroke() {
    return this._stroke
  }

  /**
   * Specifies the stroke for the outline of the rectangle.
   * @type {?Stroke}
   */
  set stroke(stroke) {
    this._stroke = stroke
  }

  /**
   * Returns the fill for inside the insets.
   * @type {?Fill}
   */
  get insetFill() {
    return this._insetFill
  }

  /**
   * Specifies the fill for inside the insets.
   * @type {?Fill}
   */
  set insetFill(fill) {
    this._insetFill = fill
  }

  /**
   * Returns the border's thickness.
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * Sets the border's thickness.
   * @type {!Insets}
   */
  set insets(insets) {
    this._insets = insets
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
    this._background = BPMN_CONSTANTS_ANNOTATION_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_ANNOTATION_DEFAULT_OUTLINE
    this._left = false
    this.icon = IconFactory.createAnnotation(true, this._background, this._outline)
    this.left = true
    this.minimumSize = new Size(30, 10)
  }

  /**
   * Gets the background color of the annotation.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the annotation.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value) {
      this.modCount++
      this._background = value
    }
  }

  /**
   * Gets the outline color of the annotation.
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the annotation.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this.modCount++
      this._outline = value
    }
  }

  /**
   * Gets a value indicating whether the bracket of the open rectangle is shown on the left side.
   * @type {boolean}
   */
  get left() {
    return this._left
  }

  /**
   * Sets a value indicating whether the bracket of the open rectangle is shown on the left side.
   * @type {boolean}
   */
  set left(value) {
    if (value !== this._left) {
      this.modCount++
      this._left = value
    }
  }

  /** @inheritDoc */
  updateIcon() {
    this.icon = IconFactory.createAnnotation(this.left, this.background, this.outline)
  }
}

/**
 * An {@link ILabelStyle} implementation combining an text label, an icon and a connecting line
 * between the icon and the label owner.
 */
class ConnectedIconLabelStyle extends LabelStyleBase {
  constructor() {
    super()
    this.textPlacement = null
    this.labelConnectorLocation = null
    this.nodeConnectorLocation = null
    this.iconSize = Size.ZERO
    this.iconStyle = null
    this.textStyle = null
    this.connectorStyle = null
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    return this.memberwiseClone()
  }

  /**
   * Creates a new visual for the label.
   * @param {!IRenderContext} context The context that describes where the visual will be used.
   * @param {!ILabel} label The label for which the visual is created.
   * @returns {!SvgVisual} The visual to include in the canvas object visual tree. This may be
   *   `null`.
   * @see {@link IVisualCreator.updateVisual}
   * @see Specified by {@link IVisualCreator.createVisual}.
   */
  createVisual(context, label) {
    this.configure(context, label)
    const container = new SvgVisualGroup()

    let iconVisual = null
    if (this.iconStyle) {
      const labelAsNode = ConnectedIconLabelStyle.LABEL_AS_NODE
      iconVisual = this.iconStyle.renderer
        .getVisualCreator(labelAsNode, labelAsNode.style)
        .createVisual(context)
    }
    container.add(
      iconVisual || new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    )

    let textVisual = null
    if (this.textStyle && this.textPlacement) {
      const dummyTextLabel = ConnectedIconLabelStyle.DUMMY_TEXT_LABEL
      textVisual = this.textStyle.renderer
        .getVisualCreator(dummyTextLabel, dummyTextLabel.style)
        .createVisual(context)
    }
    container.add(
      textVisual || new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    )

    let connectorVisual = null
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
   * @returns {!Size} The size as suggested by this renderer.
   * @param {!ILabel} label
   */
  getPreferredSize(label) {
    if (!this.iconSize.equals(Size.ZERO)) {
      return this.iconSize
    }
    return label.preferredSize
  }

  /**
   * This method updates or replaces a previously created {@link Visual}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IVisualCreator.createVisual}. Implementation may update the `oldVisual`
   * and return that same reference, or create a new visual and return the new instance or
   * `null`.
   * @param {!IRenderContext} context The context that describes where the visual will be used in.
   * @param {!SvgVisual} oldVisual The visual instance that had been returned the last time the {@link
   *   IVisualCreator#createVisual} method was called on this instance.
   * @param {!ILabel} label The label whose visual is updated.
   * @returns {!SvgVisual} `oldVisual`, if this instance modified the visual, or a new visual
   *   that should replace the existing one in the canvas object visual tree.
   */
  updateVisual(context, oldVisual, label) {
    this.configure(context, label)
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container == null || container.children.size !== 3) {
      return this.createVisual(context, label)
    }

    const oldIconVisual = container.children.get(0)
    let newIconVisual = null
    if (this.iconStyle != null) {
      const labelAsNode = ConnectedIconLabelStyle.LABEL_AS_NODE
      newIconVisual = this.iconStyle.renderer
        .getVisualCreator(labelAsNode, labelAsNode.style)
        .updateVisual(context, oldIconVisual)
    }
    if (oldIconVisual !== newIconVisual) {
      container.children.set(0, newIconVisual || new SvgVisualGroup())
    }

    const oldTextVisual = container.children.get(1)
    let newTextVisual = null
    if (this.textStyle != null && this.textPlacement != null) {
      const dummyTextLabel = ConnectedIconLabelStyle.DUMMY_TEXT_LABEL
      newTextVisual = this.textStyle.renderer
        .getVisualCreator(dummyTextLabel, dummyTextLabel.style)
        .updateVisual(context, oldTextVisual)
    }
    if (oldTextVisual !== newTextVisual) {
      container.children.set(1, newTextVisual || new SvgVisualGroup())
    }

    const oldConnectorVisual = container.children.get(2)
    let newConnectorVisual = null
    if (this.connectorStyle != null) {
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
   * @param {!(IRenderContext|IInputModeContext|ICanvasContext)} context
   * @param {!ILabel} label
   */
  configure(context, label) {
    ConnectedIconLabelStyle.LABEL_AS_NODE.style = this.iconStyle
    ConnectedIconLabelStyle.LABEL_AS_NODE.layout = label.layout.bounds

    if (label.owner instanceof INode) {
      const nodeOwner = label.owner
      ConnectedIconLabelStyle.DUMMY_FOR_LABEL_OWNER.style = nodeOwner.style
      ConnectedIconLabelStyle.DUMMY_FOR_LABEL_OWNER.layout = nodeOwner.layout
    }

    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.style = this.textStyle
    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.layoutParameter = this.textPlacement
    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.text = label.text
    ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.preferredSize =
      ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.style.renderer.getPreferredSize(
        ConnectedIconLabelStyle.DUMMY_TEXT_LABEL,
        ConnectedIconLabelStyle.DUMMY_TEXT_LABEL.style
      )
    ConnectedIconLabelStyle.DUMMY_EDGE.sourcePort.locationParameter = this.nodeConnectorLocation
    ConnectedIconLabelStyle.DUMMY_EDGE.targetPort.locationParameter = this.nodeConnectorLocation
    ConnectedIconLabelStyle.DUMMY_EDGE.style = this.connectorStyle
  }

  /**
   * Determines if something has been hit at the given coordinates
   * in the world coordinate system.
   * @param {!Point} location the coordinates in world coordinate system
   * @param {!IInputModeContext} context the context the hit test is performed in
   * @param {!ILabel} label the label that might be hit.
   * @returns {boolean} whether something has been hit
   * @see Specified by {@link IHitTestable.isHit}.
   */
  isHit(context, location, label) {
    this.configure(context, label)
    const dummyEdge = ConnectedIconLabelStyle.DUMMY_EDGE
    return (
      label.layout.containsWithEps(location, context.hitTestRadius) ||
      dummyEdge.style.renderer.getHitTestable(dummyEdge, dummyEdge.style).isHit(context, location)
    )
  }

  /**
   * This callback returns `true` if the corresponding
   * item is considered to intersect the given rectangular box.
   * This method may return `false` if the item cannot be
   * selected using a selection marquee or optionally if the
   * item is only partially contained within the box.
   * @param {!Rect} box the box describing the marquee's bounds
   * @param {!IInputModeContext} context the current canvas context
   * @param {!ILabel} label the label.
   * @returns {boolean} `true` if the item is considered to be captured by the marquee
   * @see Specified by {@link IMarqueeTestable.isInBox}.
   */
  isInBox(context, box, label) {
    this.configure(context, label)
    return box.intersects(this.getBounds(context, label).getEnlarged(context.hitTestRadius))
  }

  /**
   * Returns a tight rectangular area where the whole rendering
   * would fit into.
   * If calculating the bounds is too expensive or the painting is not
   * bound to a certain area, this method may return {@link Rect.INFINITE}.
   * If nothing is painted, this method should return an empty rectangle, where
   * either or both the width and height is non-positive or
   * {@link Rect.EMPTY}.
   * @param {!ICanvasContext} context the context to calculate the bounds for
   * @param {!ILabel} label the label.
   * @returns {!Rect} the bounds or {@link Rect.EMPTY} to indicate an unbound area
   * @see Specified by {@link IBoundsProvider.getBounds}.
   */
  getBounds(context, label) {
    this.configure(context, label)
    const dummyEdge = ConnectedIconLabelStyle.DUMMY_EDGE
    return Rect.add(
      label.layout.bounds,
      dummyEdge.style.renderer.getBoundsProvider(dummyEdge, dummyEdge.style).getBounds(context)
    )
  }

  /**
   * Determines whether an element might intersect the visible region for a given context.
   * @param {!Rect} clip The visible region clip.
   * @param {!ICanvasContext} context The context to determine the visibility for.
   * @param {!ILabel} label the label.
   * @returns {boolean} `false` if and only if it is safe not to paint the element because
   * it would not affect the given clipping region.
   * @see Specified by {@link IVisibilityTestable.isVisible}.
   */
  isVisible(context, clip, label) {
    this.configure(context, label)
    // We're computing a (very generous) bounding box here because relying on GetBounds does not work.
    // The visibility test does not call Configure, which means we don't have the dummy edge set up yet.
    if (label.owner instanceof INode) {
      const ownerNode = label.owner
      return clip.intersects(Rect.add(label.layout.bounds, ownerNode.layout.toRect()))
    }
    return clip.intersects(label.layout.bounds)
  }

  /**
   * @type {!SimpleNode}
   */
  static get LABEL_AS_NODE() {
    return (
      ConnectedIconLabelStyle._labelAsNode ||
      (ConnectedIconLabelStyle._labelAsNode = new SimpleNode())
    )
  }

  /**
   * @type {!SimpleLabel}
   */
  static get DUMMY_TEXT_LABEL() {
    if (!ConnectedIconLabelStyle._dummyTextLabel) {
      const simpleLabel = new SimpleLabel(
        ConnectedIconLabelStyle.LABEL_AS_NODE,
        '',
        FreeNodeLabelModel.INSTANCE.createDefaultParameter()
      )
      simpleLabel.style = new DefaultLabelStyle({
        horizontalTextAlignment: HorizontalTextAlignment.CENTER,
        verticalTextAlignment: VerticalTextAlignment.CENTER
      })
      ConnectedIconLabelStyle._dummyTextLabel = simpleLabel
    }
    return ConnectedIconLabelStyle._dummyTextLabel
  }

  /**
   * @type {!SimpleNode}
   */
  static get DUMMY_FOR_LABEL_OWNER() {
    return (
      ConnectedIconLabelStyle._dummyForLabelOwner ||
      (ConnectedIconLabelStyle._dummyForLabelOwner = new SimpleNode())
    )
  }

  /**
   * @type {!SimpleEdge}
   */
  static get DUMMY_EDGE() {
    if (!ConnectedIconLabelStyle._dummyEdge) {
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
      ConnectedIconLabelStyle._dummyEdge = simpleEdge
    }
    return ConnectedIconLabelStyle._dummyEdge
  }
}

/**
 * A label style for annotations according to BPMN.
 */
export class AnnotationLabelStyle extends LabelStyleBase {
  constructor() {
    super()
    this._leftAnnotationStyle = new AnnotationNodeStyle()
    this._rightAnnotationStyle = new AnnotationNodeStyle()
    this._connectorStyle = new BpmnEdgeStyle()
    this._insets = 5.0
    this._rightAnnotationStyle.left = false
    this._connectorStyle.type = EdgeType.ASSOCIATION
    const connectedIconLabelStyle = new ConnectedIconLabelStyle()
    connectedIconLabelStyle.iconStyle = this._leftAnnotationStyle
    connectedIconLabelStyle.textStyle = AnnotationLabelStyle.TEXT_STYLE
    connectedIconLabelStyle.textPlacement = InteriorLabelModel.CENTER
    connectedIconLabelStyle.connectorStyle = this._connectorStyle
    connectedIconLabelStyle.labelConnectorLocation = FreeNodePortLocationModel.NODE_LEFT_ANCHORED
    connectedIconLabelStyle.nodeConnectorLocation = FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    this._delegateStyle = connectedIconLabelStyle
  }

  /**
   * Gets the insets around the text.
   * @type {number}
   */
  get insets() {
    return this._insets
  }

  /**
   * Sets the insets around the text.
   * @type {number}
   */
  set insets(value) {
    this._insets = value
  }

  /**
   * @type {!ConnectedIconLabelStyle}
   */
  get delegateStyle() {
    return this._delegateStyle
  }

  /**
   * @type {!ConnectedIconLabelStyle}
   */
  set delegateStyle(value) {
    this._delegateStyle = value
  }

  /**
   * Gets the background color of the annotation.
   * @type {!Fill}
   */
  get background() {
    return this._leftAnnotationStyle.background
  }

  /**
   * Sets the background color of the annotation.
   * @type {!Fill}
   */
  set background(value) {
    if (this._leftAnnotationStyle.background !== value) {
      this._leftAnnotationStyle.background = value
      this._rightAnnotationStyle.background = value
    }
  }

  /**
   * Gets the outline color of the annotation.
   * @type {!Fill}
   */
  get outline() {
    return this._leftAnnotationStyle.outline
  }

  /**
   * Sets the outline color of the annotation.
   * This also influences the color of the line to the annotated element.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._leftAnnotationStyle.outline !== value) {
      this._leftAnnotationStyle.outline = value
      this._rightAnnotationStyle.outline = value
      this._connectorStyle.color = value
    }
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    const style = new AnnotationLabelStyle()
    style._connectorStyle = this._connectorStyle.clone()

    const connectedIconLabelStyle = new ConnectedIconLabelStyle()
    connectedIconLabelStyle.iconStyle = this._leftAnnotationStyle.clone()
    connectedIconLabelStyle.textStyle = AnnotationLabelStyle.TEXT_STYLE
    connectedIconLabelStyle.textPlacement = InteriorLabelModel.CENTER
    connectedIconLabelStyle.connectorStyle = style._connectorStyle
    connectedIconLabelStyle.labelConnectorLocation = FreeNodePortLocationModel.NODE_LEFT_ANCHORED
    connectedIconLabelStyle.nodeConnectorLocation = FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    style.delegateStyle = connectedIconLabelStyle

    style.insets = this.insets
    style.outline = this.outline
    style.background = this.background
    return style
  }

  /**
   * @type {!DefaultLabelStyle}
   */
  static get TEXT_STYLE() {
    return (
      AnnotationLabelStyle._textStyle ||
      (AnnotationLabelStyle._textStyle = new DefaultLabelStyle({
        horizontalTextAlignment: HorizontalTextAlignment.CENTER,
        verticalTextAlignment: VerticalTextAlignment.CENTER
      }))
    )
  }

  /**
   * @param {!ILabel} item
   * @returns {!ILabelStyle}
   */
  getCurrentStyle(item) {
    if (!(item.owner instanceof INode)) {
      return VoidLabelStyle.INSTANCE
    }
    const nodeOwner = item.owner

    this.left = item.layout.orientedRectangleCenter.x > nodeOwner.layout.center.x

    const delegateStyle = this.delegateStyle
    delegateStyle.iconStyle = this.left ? this._leftAnnotationStyle : this._rightAnnotationStyle
    delegateStyle.labelConnectorLocation = this.left
      ? FreeNodePortLocationModel.NODE_LEFT_ANCHORED
      : FreeNodePortLocationModel.NODE_RIGHT_ANCHORED
    return delegateStyle
  }

  /**
   * Returns the bounds of the visual for the label.
   * @param {!ICanvasContext} context The rendering context.
   * @param {!ILabel} label The label to provide the bounds for
   * @returns {!Rect} The bounds of the label.
   */
  getBounds(context, label) {
    const delegateStyle = this.getCurrentStyle(label)
    return delegateStyle.renderer.getBoundsProvider(label, delegateStyle).getBounds(context)
  }

  /**
   * Returns whether or not the label is currently visible.
   * @param {!ICanvasContext} context The rendering context.
   * @param {!Rect} rectangle The clipping rectangle.
   * @param {!ILabel} label The label.
   * @returns {boolean} Whether or not the label is currently visible.
   */
  isVisible(context, rectangle, label) {
    const delegateStyle = this.getCurrentStyle(label)
    return delegateStyle.renderer
      .getVisibilityTestable(label, delegateStyle)
      .isVisible(context, rectangle)
  }

  /**
   * Returns whether or not the given location lies inside the label.
   * @param {!IInputModeContext} context The input mode context.
   * @param {!Point} location The location to check.
   * @param {!ILabel} label The label.
   * @see {@link ILabelStyleRenderer.getHitTestable}.
   * @returns {boolean}
   */
  isHit(context, location, label) {
    const delegateStyle = this.getCurrentStyle(label)
    return delegateStyle.renderer.getHitTestable(label, delegateStyle).isHit(context, location)
  }

  /**
   * Calculates the {@link ILabel.preferredSize preferred size}
   * of a given label using the associated style.
   * @param {!ILabel} label The label to determine the preferred size for.
   * @returns {!Size} A size that can be used as the {@link ILabel.preferredSize}.
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
   * @param {!IRenderContext} context The context that describes where the visual will be used.
   * @param {!ILabel} label The label.
   * @returns {!SvgVisual} The visual to include in the canvas object visual tree. This may be
   *   `null`.
   * @see {@link IVisualCreator.updateVisual}
   * @see Specified by {@link IVisualCreator.createVisual}.
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
   * to {@link IVisualCreator.createVisual}. Implementation may update the `oldVisual`
   * and return that same reference, or create a new visual and return the new instance or
   * `null`.
   * @param {!IRenderContext} context The context that describes where the visual will be used in.
   * @param {!SvgVisual} oldVisual The visual instance that had been returned the last time the {@link
   *   IVisualCreator#createVisual} method was called on this instance.
   * @param {!ILabel} label The label.
   * @returns {!SvgVisual} `oldVisual`, if this instance modified the visual, or a new visual
   *   that should replace the existing one in the canvas object visual tree.
   * @see {@link IVisualCreator.createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator.updateVisual}.
   */
  updateVisual(context, oldVisual, label) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (!container) {
      this.createVisual(context, label)
    }
    const cache = container['render-data-cache']
    const delegateStyle = this.getCurrentStyle(label)
    const newCache = this.createRenderData()
    if (cache == null || !cache.equals(cache, newCache) || container.children.size !== 1) {
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
   * @returns {!object}
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
    this._borderThickness = new Insets(1)
    this._backgroundFill = Fill.TRANSPARENT
    this._insetFill = Fill.TRANSPARENT
    this._borderFill = Fill.BLACK
  }

  /**
   * The background fill for a stripe.
   * @type {!Fill}
   */
  get backgroundFill() {
    return this._backgroundFill
  }

  /**
   * The background fill for a stripe.
   * @type {!Fill}
   */
  set backgroundFill(value) {
    this._backgroundFill = value
  }

  /**
   * The inset fill for a stripe.
   * @type {!Fill}
   */
  get insetFill() {
    return this._insetFill
  }

  /**
   * The inset fill for a stripe.
   * @type {!Fill}
   */
  set insetFill(value) {
    this._insetFill = value
  }

  /**
   * The border fill for a stripe.
   * @type {!Fill}
   */
  get borderFill() {
    return this._borderFill
  }

  /**
   * The border fill for a stripe.
   * @type {!Fill}
   */
  set borderFill(value) {
    this._borderFill = value
  }

  /**
   * The border thickness for a stripe.
   * @type {!Insets}
   */
  get borderThickness() {
    return this._borderThickness
  }

  /**
   * The border thickness for a stripe.
   * @type {!Insets}
   */
  set borderThickness(value) {
    this._borderThickness = value
  }

  /**
   * @param {!object} obj
   * @returns {boolean}
   */
  equals(obj) {
    if (!(obj instanceof StripeDescriptor)) {
      return false
    }
    return (
      obj._backgroundFill.equals(this._backgroundFill) &&
      obj._insetFill.equals(this._insetFill) &&
      obj._borderFill.equals(this._borderFill) &&
      obj._borderThickness.equals(this._borderThickness)
    )
  }

  /**
   * @returns {number}
   */
  hashCode() {
    let result = this._backgroundFill != null ? this._backgroundFill.hashCode() : 0
    result = (result * 397) ^ (this._insetFill != null ? this._insetFill.hashCode() : 0)
    result = (result * 397) ^ (this._borderFill != null ? this._borderFill.hashCode() : 0)
    result = (result * 397) ^ this._borderThickness.hashCode()
    return result
  }
}

/**
 * An {@link INodeStyle} implementation representing a Pool according to the BPMN.
 * The main visualization is delegated to {@link PoolNodeStyle.tableNodeStyle}.
 */
export class PoolNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance for an oriented pool.
   * @param vertical Whether or not the style represents a vertical pool.
   * @param {boolean} [vertical]
   */
  constructor(vertical) {
    super()
    this._multipleInstance = false
    this._tableNodeStyle = null
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
    this._multipleInstanceIcon = null
    this.vertical = vertical || false
    this.updateIcon()
  }

  /**
   * Gets whether or not this pool represents a multiple instance participant.
   * @type {boolean}
   */
  get multipleInstance() {
    return this._multipleInstance
  }

  /**
   * Sets whether or not this pool represents a multiple instance participant.
   * @type {boolean}
   */
  set multipleInstance(value) {
    this._multipleInstance = value
  }

  /**
   * Gets the color for the icon.
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * Sets the color for the icon.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._iconColor !== value) {
      this._iconColor = value
      this.updateIcon()
    }
  }

  /**
   * Gets the {@link TableNodeStyle} the visualization is delegated to.
   * @type {!TableNodeStyle}
   */
  get tableNodeStyle() {
    if (!this._tableNodeStyle) {
      this._tableNodeStyle = createDefaultTableNodeStyle(this.vertical)
    }
    return this._tableNodeStyle
  }

  /**
   * Sets the {@link TableNodeStyle} the visualization is delegated to.
   * @type {!TableNodeStyle}
   */
  set tableNodeStyle(value) {
    this._tableNodeStyle = value
  }

  updateIcon() {
    const multipleIcon = IconFactory.createLoopCharacteristic(
      LoopCharacteristic.PARALLEL,
      this.iconColor
    )
    this._multipleInstanceIcon = new PlacedIcon(
      multipleIcon,
      BPMN_CONSTANTS_PLACEMENTS_POOL_NODE_MARKER,
      BPMN_CONSTANTS_SIZES_MARKER
    )
  }

  /**
   * This method is called by the framework to create a {@link Visual}
   * that will be included into the {@link IRenderContext}.
   * {@link CanvasComponent} uses this interface through the {@link ICanvasObjectDescriptor}
   * to populate the visual canvas object tree.
   * @param {!IRenderContext} renderContext The context that describes where the visual will be used.
   * @param {!INode} node The node.
   * @returns {!SvgVisual} The visual to include in the canvas object visual tree. This may be
   *   `null`.
   * @see {@link IVisualCreator.updateVisual}
   * @see Specified by {@link IVisualCreator.createVisual}.
   */
  createVisual(renderContext, node) {
    const container = new SvgVisualGroup()
    container.add(
      this.tableNodeStyle.renderer
        .getVisualCreator(node, this.tableNodeStyle)
        .createVisual(renderContext)
    )
    if (this.multipleInstance) {
      this._multipleInstanceIcon.setBounds(node.layout.toRect())
      const multipleInstanceIconVisual = this._multipleInstanceIcon.createVisual(renderContext)
      container.add(multipleInstanceIconVisual)
    }
    return container
  }

  /**
   * This method updates or replaces a previously created {@link Visual} for inclusion
   * in the {@link IRenderContext}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link IVisualCreator.createVisual}. Implementation may update the `oldVisual`
   * and return that same reference, or create a new visual and return the new instance or
   * `null`.
   * @param {!IRenderContext} renderContext The context that describes where the visual will be used
   *   in.
   * @param {!SvgVisual} oldVisual The visual instance that had been returned the last time the {@link
   *   IVisualCreator#createVisual} method was called on this instance.
   * @param {!INode} node The node
   * @returns {!SvgVisual} `oldVisual`, if this instance modified the visual, or a new visual
   *   that should replace the existing one in the canvas object visual tree.
   * @see {@link IVisualCreator.createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator.updateVisual}.
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (container == null || container.children.size === 0) {
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

    const oldMultipleVisual = container.children.size > 1 ? container.children.at(-1) : undefined
    if (this.multipleInstance) {
      if (oldMultipleVisual == null) {
        this._multipleInstanceIcon.setBounds(node.layout.toRect())
        const multipleInstanceIconVisual = this._multipleInstanceIcon.createVisual(renderContext)
        container.add(multipleInstanceIconVisual)
      } else {
        this._multipleInstanceIcon.setBounds(node.layout.toRect())
        const newMultipleVisual = this._multipleInstanceIcon.updateVisual(
          renderContext,
          oldMultipleVisual
        )
        if (oldMultipleVisual !== newMultipleVisual) {
          if (oldMultipleVisual != null) {
            container.children.remove(oldMultipleVisual)
          }
          container.add(newMultipleVisual)
        }
      }
    } else if (oldMultipleVisual != null) {
      // there has been a multipleInstance icon before
      container.children.remove(oldMultipleVisual)
    }
    return container
  }

  /**
   * Returns an instance that implements the given type or `null`.
   * @param {!INode} node the node
   * @param {!Class} type the type for which an instance shall be returned
   * @returns {!object} an instance that is assignable to type or `null`
   * @see Specified by {@link ILookup.lookup}.
   */
  lookup(node, type) {
    if (type === IEditLabelHelper.$class) {
      return new PoolNodeEditLabelHelper(this)
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
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    const clone = new PoolNodeStyle()
    clone.multipleInstance = this.multipleInstance
    clone.tableNodeStyle = this.tableNodeStyle.clone()
    clone.iconColor = this.iconColor
    return clone
  }
}

class PoolNodeEditLabelHelper extends EditLabelHelper {
  /**
   * @param {!PoolNodeStyle} style
   */
  constructor(style) {
    super()
    this.style = style
  }

  /**
   * @param {!IInputModeContext} inputModeContext
   * @returns {!ILabelModelParameter}
   */
  getLabelParameter(inputModeContext) {
    if (this.style.tableNodeStyle.tableRenderingOrder === TableRenderingOrder.COLUMNS_FIRST) {
      return PoolHeaderLabelModel.NORTH
    }
    return PoolHeaderLabelModel.WEST
  }
}

/**
 * Creates a {@link TableNodeStyle} that is used in {@link PoolNodeStyle}.
 * @param {boolean} vertical
 * @returns {!TableNodeStyle}
 */
function createDefaultTableNodeStyle(vertical) {
  // create a new table
  const table = new Table()
  const tableNodeStyle = new TableNodeStyle()

  // we'd like to use a special stripe style
  const alternatingLeafStripeStyle = new AlternatingLeafStripeStyle()
  const evenLeafDescriptor = new StripeDescriptor()
  evenLeafDescriptor.backgroundFill = BPMN_CONSTANTS_DEFAULT_POOL_NODE_EVEN_LEAF_BACKGROUND
  evenLeafDescriptor.insetFill = BPMN_CONSTANTS_DEFAULT_POOL_NODE_EVEN_LEAF_INSET
  alternatingLeafStripeStyle.evenLeafDescriptor = evenLeafDescriptor
  const oddLeafDescriptor = new StripeDescriptor()
  oddLeafDescriptor.backgroundFill = BPMN_CONSTANTS_DEFAULT_POOL_NODE_ODD_LEAF_BACKGROUND
  oddLeafDescriptor.insetFill = BPMN_CONSTANTS_DEFAULT_POOL_NODE_ODD_LEAF_INSET
  alternatingLeafStripeStyle.oddLeafDescriptor = oddLeafDescriptor
  const parentDescriptor = new StripeDescriptor()
  parentDescriptor.backgroundFill = BPMN_CONSTANTS_DEFAULT_POOL_NODE_PARENT_BACKGROUND
  parentDescriptor.insetFill = BPMN_CONSTANTS_DEFAULT_POOL_NODE_PARENT_INSET
  alternatingLeafStripeStyle.parentDescriptor = parentDescriptor

  if (vertical) {
    table.insets = new Insets(0, 20, 0, 0)

    // set the column defaults
    table.columnDefaults.insets = new Insets(0, 20, 0, 0)
    table.columnDefaults.labels.style = new DefaultLabelStyle({
      horizontalTextAlignment: HorizontalTextAlignment.CENTER,
      verticalTextAlignment: VerticalTextAlignment.CENTER
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
      horizontalTextAlignment: HorizontalTextAlignment.CENTER,
      verticalTextAlignment: VerticalTextAlignment.CENTER
    })

    table.rowDefaults.labels.layoutParameter = StretchStripeLabelModel.WEST
    table.rowDefaults.style = alternatingLeafStripeStyle
    table.rowDefaults.minimumSize = 50
    tableNodeStyle.tableRenderingOrder = TableRenderingOrder.ROWS_FIRST
  }

  const backgroundStyle = new ShapeNodeStyle()
  backgroundStyle.fill = BPMN_CONSTANTS_DEFAULT_POOL_NODE_BACKGROUND
  tableNodeStyle.backgroundStyle = backgroundStyle

  tableNodeStyle.table = table
  return tableNodeStyle
}

/**
 * A label model for nodes using a {@link PoolNodeStyle} that position labels inside the
 * {@link ITable.insets table insets}.
 */
export class PoolHeaderLabelModel extends BaseClass(ILabelModel, ILabelModelParameterProvider) {
  /**
   * Returns an instance that implements the given type or `null`.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-`null` implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {!Class.<T>} type the type for which an instance shall be returned
   * @returns {?T} an instance that is assignable to type or `null`
   * @see Specified by {@link ILookup.lookup}.
   * @template {*} T
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
   * @param {!ILabelModelParameter} parameter A parameter that has been created by this model.
   * This is typically the parameter that yielded this instance through its
   * {@link ILabelModelParameter.model} property.
   * @param {!ILabel} label the label to calculate the geometry for
   * @returns {!IOrientedRectangle} An instance that describes the geometry. This is typically
   * an instance designed as a flyweight, so clients should not cache the
   * instance but store the values if they need a snapshot for later use
   * @see Specified by {@link ILabelModel.getGeometry}.
   */
  getGeometry(label, parameter) {
    const php = parameter instanceof PoolHeaderLabelModelParameter ? parameter : null
    const owner = label.owner
    if (php == null || owner == null) {
      return IOrientedRectangle.EMPTY
    }

    const table = owner.lookup(ITable.$class)
    if (!table) {
      return new OrientedRectangle()
    }
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
   * @returns {!ILabelModelParameter} a parameter for this model instance
   * @see Specified by {@link ILabelModel.createDefaultParameter}.
   */
  createDefaultParameter() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_WEST
  }

  /**
   * Provides a {@link ILookup lookup context} for the given combination of label
   * and parameter.
   * @param {!ILabel} label The label to use in the context.
   * @param {!ILabelModelParameter} parameter The parameter to use for the label in the context.
   * @returns {!ILookup} An implementation of the {@link ILookup} interface that can be used
   *   to query additional aspects of the label/parameter combination.
   * @see {@link ILookup.EMPTY}
   * @see Specified by {@link ILabelModel.getContext}.
   */
  getContext(label, parameter) {
    return ILookup.EMPTY
  }

  /**
   * Returns an enumerator over a set of possible {@link ILabelModelParameter}
   * instances that can be used for the given label and model.
   * @param {!ILabel} label The label instance to use.
   * @param {!ILabelModel} model The model to provide parameters for.
   * @returns {!IEnumerable.<ILabelModelParameter>} A possibly empty enumerator over a
   *   set of label model parameters.
   * @see Specified by {@link ILabelModelParameterProvider.getParameters}.
   */
  getParameters(label, model) {
    return POOL_HEADER_LABEL_MODEL_PARAMETERS
  }

  /**
   * @type {!PoolHeaderLabelModelParameter}
   */
  static get NORTH() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_NORTH
  }

  /**
   * @type {!PoolHeaderLabelModelParameter}
   */
  static get EAST() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_EAST
  }

  /**
   * @type {!PoolHeaderLabelModelParameter}
   */
  static get SOUTH() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_SOUTH
  }

  /**
   * @type {!PoolHeaderLabelModelParameter}
   */
  static get WEST() {
    return POOL_HEADER_LABEL_MODEL_PARAMETER_WEST
  }

  /**
   * @type {!PoolHeaderLabelModel}
   */
  static get INSTANCE() {
    return (
      PoolHeaderLabelModel._instance ||
      (PoolHeaderLabelModel._instance = new PoolHeaderLabelModel())
    )
  }
}

class PoolHeaderLabelModelParameter extends BaseClass(ILabelModelParameter) {
  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      $self: [
        GraphMLAttribute().init({ singletonContainers: [PoolHeaderLabelModelExtension.$class] })
      ]
    }
  }

  /**
   * @param {number} side
   */
  constructor(side) {
    super()
    this._side = side || 0
  }

  /**
   * @type {number}
   */
  get side() {
    return this._side
  }

  /**
   * @type {!ILabelModel}
   */
  get model() {
    return PoolHeaderLabelModel.INSTANCE
  }

  /**
   * @returns {*}
   */
  clone() {
    return this
  }

  /**
   * @param {!ILabel} label - The label to test.
   * @returns {boolean}
   */
  supports(label) {
    return label.owner.lookup(ITable.$class) != null
  }
}

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
  /**
   * @param {!Icon} icon
   */
  constructor(icon) {
    super()
    this._length = 0
    this._cropLength = 0
    this.bounds = Size.ZERO
    this.anchor = Point.ORIGIN
    this.direction = Point.ORIGIN
    this.icon = icon
  }

  /**
   * Returns the length of the arrow, i.e. the distance from the arrow's tip to
   * the position where the visual representation of the edge's path should begin.
   * @see Specified by {@link IArrow.length}.
   * @type {number}
   */
  get length() {
    return this._length
  }

  /**
   * Sets the length of the arrow, i.e. the distance from the arrow's tip to
   * the position where the visual representation of the edge's path should begin.
   * @see Specified by {@link IArrow.length}.
   * @type {number}
   */
  set length(value) {
    this._length = value
  }

  /**
   * Gets the cropping length associated with this instance.
   * This value is used by {@link IEdgeStyle}s to let the
   * edge appear to end shortly before its actual target.
   * @see Specified by {@link IArrow.cropLength}.
   * @type {number}
   */
  get cropLength() {
    return this._cropLength
  }

  /**
   * Sets the cropping length associated with this instance.
   * This value is used by {@link IEdgeStyle}s to let the
   * edge appear to end shortly before its actual target.
   * @see Specified by {@link IArrow.cropLength}.
   * @type {number}
   */
  set cropLength(value) {
    this._cropLength = value
  }

  /**
   * Gets an {@link IVisualCreator} implementation that will create
   * the  for this arrow
   * at the given location using the given direction for the given edge.
   * @param {!IEdge} edge the edge this arrow belongs to
   * @param {boolean} atSource whether this will be the source arrow
   * @param {!Point} anchor the anchor point for the tip of the arrow
   * @param {!Point} direction the direction the arrow is pointing in
   * @returns {!IVisualCreator} Itself as a flyweight.
   * @see Specified by {@link IArrow.getPaintable}.
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
   * @param {!IEdge} edge the edge this arrow belongs to
   * @param {boolean} atSource whether this will be the source arrow
   * @param {!Point} anchor the anchor point for the tip of the arrow
   * @param {!Point} direction the direction the arrow is pointing in
   * @returns {!IBoundsProvider} an implementation of the {@link IBoundsProvider} interface
   *   that can subsequently be used to query the bounds. Clients will always call this method
   *   before using the implementation and may not cache the instance returned. This allows for
   *   applying the flyweight design pattern to implementations.
   * @see Specified by {@link IArrow.getBoundsProvider}.
   */
  getBoundsProvider(edge, atSource, anchor, direction) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * @param {!IEdge} edge
   * @param {boolean} atSource
   * @param {!Point} anchor
   * @param {!Point} direction
   * @returns {*}
   */
  getVisualCreator(edge, atSource, anchor, direction) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * This method is called by the framework to create a
   * that will be included into the {@link IRenderContext}.
   * @param {!IRenderContext} context The context that describes where the visual will be used.
   * @returns {!SvgVisual} The arrow visual to include in the canvas object visual tree.
   * @see {@link IconArrow.updateVisual}
   * @see Specified by {@link IVisualCreator.createVisual}.
   */
  createVisual(context) {
    this.icon.setBounds(
      new Rect(-this.bounds.width, -this.bounds.height / 2, this.bounds.width, this.bounds.height)
    )
    const canvasContainer = new SvgVisualGroup()
    const iconVisual = this.icon.createVisual(context)
    canvasContainer.add(iconVisual)

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
   * to {@link IconArrow.createVisual}. Implementation may update the `oldVisual`
   * and return that same reference, or create a new visual and return the new instance or
   * `null`.
   * @param {!IRenderContext} context The context that describes where the visual will be used in.
   * @param {!SvgVisual} oldVisual The visual instance that had been returned the last time the {@link
   *   IconArrow#createVisual} method was called on this instance.
   * @returns {!SvgVisual} the old visual if this instance modified the visual, or a new visual that
   *   should replace the existing one in the canvas object visual tree.
   * @see {@link IconArrow.createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator.updateVisual}.
   */
  updateVisual(context, oldVisual) {
    const p = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (p != null) {
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
   * @see Specified by {@link IBoundsProvider.getBounds}.
   * @param {!ICanvasContext} context
   * @returns {!Rect}
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
  constructor() {
    super()
    this._isInitiating = true
    this._initiatingColor = BPMN_CONSTANTS_DEFAULT_INITIATING_MESSAGE_COLOR
    this._responseColor = BPMN_CONSTANTS_DEFAULT_RECEIVING_MESSAGE_COLOR
    this._outline = null
    this._messagePen = null
    const stroke = new Stroke(BPMN_CONSTANTS_DEFAULT_MESSAGE_OUTLINE)
    stroke.freeze()
    const messageIcon = IconFactory.createMessage(
      stroke,
      BPMN_CONSTANTS_DEFAULT_RECEIVING_MESSAGE_COLOR
    )
    const bpmnNodeStyle = new BpmnNodeStyle()
    bpmnNodeStyle.icon = messageIcon
    bpmnNodeStyle.minimumSize = BPMN_CONSTANTS_SIZES_MESSAGE
    const labelStyle = new DefaultLabelStyle()
    this._adapter = new NodeStyleLabelStyleAdapter(bpmnNodeStyle, labelStyle)
    this.outline = BPMN_CONSTANTS_DEFAULT_MESSAGE_OUTLINE
  }

  /**
   * Gets whether this message is initiating.
   * @type {boolean}
   */
  get isInitiating() {
    return this._isInitiating
  }

  /**
   * Sets whether this message is initiating.
   * @type {boolean}
   */
  set isInitiating(value) {
    if (this._isInitiating !== value) {
      this._isInitiating = value
      this.updateIcon()
    }
  }

  /**
   * Gets the outline color of the message.
   * @type {?Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the message.
   * @type {?Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this._outline = value
      const stroke = new Stroke(value)
      stroke.freeze()
      this._messagePen = stroke
      this.updateIcon()
    }
  }

  /**
   * Gets the color for an initiating message.
   * @type {!Fill}
   */
  get initiatingColor() {
    return this._initiatingColor
  }

  /**
   * Sets the color for an initiating message.
   * @type {!Fill}
   */
  set initiatingColor(value) {
    if (this._initiatingColor !== value) {
      this._initiatingColor = value
      if (this._isInitiating) {
        this.updateIcon()
      }
    }
  }

  /**
   * Gets the color for a response message.
   * @type {!Fill}
   */
  get responseColor() {
    return this._responseColor
  }

  /**
   * Sets the color for a response message.
   * @type {!Fill}
   */
  set responseColor(value) {
    if (this._responseColor !== value) {
      this._responseColor = value
      if (!this._isInitiating) {
        this.updateIcon()
      }
    }
  }

  updateIcon() {
    const nodeStyle = this._adapter.nodeStyle
    nodeStyle.icon = IconFactory.createMessage(
      this._messagePen,
      this.isInitiating ? this.initiatingColor : this.responseColor
    )
    nodeStyle.modCount++
  }

  /**
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  createVisual(context, label) {
    return this._adapter.renderer.getVisualCreator(label, this._adapter).createVisual(context)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, label) {
    return this._adapter.renderer
      .getVisualCreator(label, this._adapter)
      .updateVisual(context, oldVisual)
  }

  /**
   * @param {!ICanvasContext} context
   * @param {!ILabel} label
   * @returns {!Rect}
   */
  getBounds(context, label) {
    return this._adapter.renderer.getBoundsProvider(label, this._adapter).getBounds(context)
  }

  /**
   * @param {!ICanvasContext} context
   * @param {!Rect} rectangle
   * @param {!ILabel} label
   * @returns {boolean}
   */
  isVisible(context, rectangle, label) {
    return this._adapter.renderer
      .getVisibilityTestable(label, this._adapter)
      .isVisible(context, rectangle)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} location
   * @param {!ILabel} label
   * @returns {boolean}
   */
  isHit(context, location, label) {
    return this._adapter.renderer.getHitTestable(label, this._adapter).isHit(context, location)
  }

  /**
   * @param {!ILabel} label
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(label, type) {
    return this._adapter.renderer.getContext(label, this._adapter).lookup(type)
  }

  /**
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    return this._adapter.renderer.getPreferredSize(label, this._adapter)
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    const messageLabelStyle = new MessageLabelStyle()
    messageLabelStyle.isInitiating = this.isInitiating
    messageLabelStyle.outline = this.outline
    messageLabelStyle.initiatingColor = this.initiatingColor
    messageLabelStyle.responseColor = this.responseColor
    return messageLabelStyle
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
    this._background = BPMN_CONSTANTS_DATA_STORE_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_DATA_STORE_DEFAULT_OUTLINE
    this.icon = IconFactory.createDataStore(this._background, this._outline)
    this.minimumSize = new Size(30, 20)
  }

  /**
   * Gets the background color of the data store.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the data store.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value) {
      this.modCount++
      this._background = value
    }
  }

  /**
   * Gets the outline color of the data store.
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the data store.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this.modCount++
      this._outline = value
    }
  }

  /** @inheritDoc */
  updateIcon() {
    this.icon = IconFactory.createDataStore(this.background, this.outline)
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields `null` to indicate that
   * the {@link INode.layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase.isInside}
   * and {@link NodeStyleBase.getIntersection} since the default implementations delegate to it.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!GeneralPath} The outline of the visual representation or `null`.
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
    this._collection = false
    this._background = BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
    this._type = null
    this.collectionIcon = null
    this.dataIcon = null
    this.typeIcon = null
    this.type = DataObjectType.NONE
    this.minimumSize = new Size(25, 30)
  }

  /**
   * Gets whether this is a Collection Data Object.
   * @type {boolean}
   */
  get collection() {
    return this._collection
  }

  /**
   * Sets whether this is a Collection Data Object.
   * @type {boolean}
   */
  set collection(value) {
    if (this._collection !== value) {
      this.modCount++
      this._collection = value
    }
  }

  /**
   * Gets the data object type for this style.
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * Sets the data object type for this style.
   * @type {number}
   */
  set type(value) {
    if (this._type !== value) {
      this.modCount++
      this._type = value
      this.updateTypeIcon()
    }
  }

  /**
   * Gets the background color of the data object.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the data object.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value) {
      this.modCount++
      this._background = value
      this.updateDataIcon()
    }
  }

  /**
   * Gets the outline color of the data object.
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the data object.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this.modCount++
      this._outline = value
      this.updateDataIcon()
    }
  }

  /**
   * Gets the color for the icon.
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * Sets the color for the icon.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._iconColor !== value) {
      this.modCount++
      this._iconColor = value
      this.updateTypeIcon()
      this.updateCollectionIcon()
    }
  }

  updateCollectionIcon() {
    this.collectionIcon = IconFactory.createPlacedIcon(
      IconFactory.createLoopCharacteristic(LoopCharacteristic.PARALLEL, this.iconColor),
      BPMN_CONSTANTS_PLACEMENTS_DATA_OBJECT_MARKER,
      BPMN_CONSTANTS_SIZES_MARKER
    )
  }

  updateTypeIcon() {
    this.typeIcon = IconFactory.createDataObjectType(this.type, this.iconColor)
    if (this.typeIcon) {
      this.typeIcon = IconFactory.createPlacedIcon(
        this.typeIcon,
        BPMN_CONSTANTS_PLACEMENTS_DATA_OBJECT_TYPE,
        BPMN_CONSTANTS_SIZES_DATA_OBJECT_TYPE
      )
    }
  }

  updateDataIcon() {
    this.dataIcon = IconFactory.createDataObject(this.background, this.outline)
  }

  /**
   * Updates the {@link BpmnNodeStyle.icon}.
   * This method is called by {@link BpmnNodeStyle.createVisual}.
   */
  updateIcon() {
    if (!this.dataIcon) {
      this.updateDataIcon()
    }
    if (!this.collectionIcon) {
      this.updateCollectionIcon()
    }

    const icons = new List()
    icons.add(this.dataIcon)

    if (this.collection) {
      icons.add(this.collectionIcon)
    }
    if (this.typeIcon != null) {
      icons.add(this.typeIcon)
    }
    if (icons.size > 1) {
      this.icon = IconFactory.createCombinedIcon(icons)
    } else {
      this.icon = this.dataIcon
    }
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields `null` to indicate that
   * the {@link INode.layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase.isInside}
   * and {@link NodeStyleBase.getIntersection} since the default implementations delegate to it.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!GeneralPath} The outline of the visual representation or `null`.
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
    this._type = ConversationType.CONVERSATION
    this._background = BPMN_CONSTANTS_CONVERSATION_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_CONVERSATION_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
    this.type = ConversationType.CONVERSATION
    this.minimumSize = BPMN_CONSTANTS_SIZES_CONVERSATION
  }

  /**
   * Gets the conversation type for this style.
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * Sets the conversation type for this style.
   * @type {number}
   */
  set type(value) {
    if (this._type !== value || !this.icon) {
      this.modCount++
      this._type = value
    }
  }

  /**
   * Gets the background color of the conversation.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the conversation.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value) {
      this.modCount++
      this._background = value
    }
  }

  /**
   * Gets the outline color of the conversation.
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the conversation.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this.modCount++
      this._outline = value
    }
  }

  /**
   * Gets the primary color for icons and markers.
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * Sets the primary color for icons and markers.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._iconColor !== value) {
      this.modCount++
      this._iconColor = value
    }
  }

  /** @inheritDoc */
  updateIcon() {
    let typeIcon = IconFactory.createConversation(this._type, this.background, this.outline)
    let markerIcon = IconFactory.createConversationMarker(this._type, this.iconColor)

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

  /**
   * Gets the outline of the visual style.
   * This implementation yields `null` to indicate that
   * the {@link INode.layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase.isInside}
   * and {@link NodeStyleBase.getIntersection} since the default implementations delegate to it.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!GeneralPath} The outline of the visual representation or `null`.
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
  constructor() {
    super()
    this._characteristic = EventCharacteristic.START
    this._background = BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND
    this._outline = BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
    this.eventIcon = null
    this.typeIcon = null
    this.fillTypeIcon = false
    this._type = null
    this.type = EventType.PLAIN
    this.characteristic = EventCharacteristic.START
    this.minimumSize = new Size(20, 20)
  }

  /**
   * Gets the event type for this style.
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * Sets the event type for this style.
   * @type {number}
   */
  set type(value) {
    if (this._type !== value) {
      this.modCount++
      this._type = value
      this.createTypeIcon()
    }
  }

  /**
   * Gets the event characteristic for this style.
   * @type {number}
   */
  get characteristic() {
    return this._characteristic
  }

  /**
   * Sets the event characteristic for this style.
   * @type {number}
   */
  set characteristic(value) {
    if (this._characteristic !== value || this.eventIcon == null) {
      this.modCount++
      this._characteristic = value
      this.createEventIcon()
    }
  }

  /**
   * Gets the background color of the event.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the event.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value) {
      this.modCount++
      this._background = value
      this.createEventIcon()
    }
  }

  /**
   * Gets the outline color of the event icon.
   * @type {?Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the event icon.
   * If this is set to null, the outline color is automatic, based on the
   * {@link EventNodeStyle.characteristic}.
   * @type {?Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this.modCount++
      this._outline = value
      this.createEventIcon()
    }
  }

  /**
   * Gets the primary color for icons and markers.
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * Sets the primary color for icons and markers.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._iconColor !== value) {
      this.modCount++
      this._iconColor = value
      this.createTypeIcon()
    }
  }

  createTypeIcon() {
    this.typeIcon = IconFactory.createEventType(
      this.type,
      this.fillTypeIcon,
      this.iconColor,
      this.background
    )
    if (this.typeIcon) {
      this.typeIcon = IconFactory.createPlacedIcon(
        this.typeIcon,
        BPMN_CONSTANTS_PLACEMENTS_EVENT_TYPE,
        Size.EMPTY
      )
    }
  }

  createEventIcon() {
    this.eventIcon = IconFactory.createEvent(this.characteristic, this.background, this.outline)
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
   * Updates the {@link BpmnNodeStyle.icon}.
   * This method is called by {@link BpmnNodeStyle.createVisual}.
   */
  updateIcon() {
    if (!this.eventIcon) {
      this.createEventIcon()
    }
    if (this.typeIcon) {
      this.icon = IconFactory.createCombinedIcon(
        new List(List.fromArray([this.eventIcon, this.typeIcon]))
      )
    } else {
      this.icon = this.eventIcon
    }
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {?SvgVisual}
   */
  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!INode} node
   * @returns {?SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields `null` to indicate that
   * the {@link INode.layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase.isInside}
   * and {@link NodeStyleBase.getIntersection} since the default implementations delegate to it.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!GeneralPath} The outline of the visual representation or `null`.
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
   * This method is called in response to a {@link IHitTestable.isHit}
   * call to the instance that has been queried from the {@link NodeStyleBase.renderer}.
   * This implementation uses the {@link NodeStyleBase.getOutline outline} to determine
   * whether the node has been hit.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!Point} p The point to test.
   * @param {!ICanvasContext} canvasContext The canvas context.
   * @returns {boolean} whether or not the specified node representation is hit.
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
    this._insets = new Insets(15)
    this._renderer = new GroupNodeStyleRenderer()
  }

  /**
   * Gets the insets for the node.
   * These insets are returned via an {@link INodeInsetsProvider} if such an instance is queried
   * through the
   * {@link INodeStyleRenderer.getContext context lookup}.
   * @see {@link INodeInsetsProvider}
   * @return An insets object that describes the insets of node.
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * Sets the insets for the node.
   * These insets are returned via an {@link INodeInsetsProvider} if such an instance is queried
   * through the
   * @see {@link INodeInsetsProvider}
   * @param insets An insets object that describes the insets of node.
   * @type {!Insets}
   */
  set insets(insets) {
    this._insets = insets
  }

  /**
   * Gets the background color of the group.
   * @type {?Fill}
   */
  get background() {
    return this._renderer.shapeNodeStyle.fill
  }

  /**
   * Sets the background color of the group.
   * @type {?Fill}
   */
  set background(value) {
    if (this._renderer.shapeNodeStyle.fill !== value) {
      this._renderer.shapeNodeStyle.fill = value
    }
  }

  /**
   * Gets the outline color of the group.
   * @type {?Fill}
   */
  get outline() {
    return this._renderer.shapeNodeStyle.stroke.fill
  }

  /**
   * Sets the outline color of the group.
   * @type {?Fill}
   */
  set outline(value) {
    if (this._renderer.shapeNodeStyle.stroke.fill !== value) {
      this._renderer.shapeNodeStyle.stroke = this.getPen(value)
    }
  }

  /**
   * @param {?Fill} outline
   * @returns {!Stroke}
   */
  getPen(outline) {
    const stroke = new Stroke({
      fill: outline,
      dashStyle: DashStyle.DASH_DOT,
      lineCap: LineCap.ROUND
    })
    stroke.freeze()
    return stroke
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    const groupNodeStyle = new GroupNodeStyle()
    groupNodeStyle.insets = this.insets
    groupNodeStyle.background = this.background
    groupNodeStyle.outline = this.outline
    return groupNodeStyle
  }

  /**
   * Gets the renderer implementation that can be queried for implementations
   * that provide details about the visual appearance and visual behavior
   * for a given node and this style instance.
   * The idiom for retrieving, e.g. an {@link IVisualCreator} implementation
   * for a given style is:
   * ```
   * var creator = style.renderer.getVisualCreator(node, style);
   * var visual = creator.createVisual(renderContext);
   * ```
   * @see Specified by {@link INodeStyle.renderer}.
   * @type {!INodeStyleRenderer}
   */
  get renderer() {
    return this._renderer
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
    const groupOutline = new Stroke({
      fill: BPMN_CONSTANTS_GROUP_DEFAULT_OUTLINE,
      dashStyle: DashStyle.DASH_DOT,
      lineCap: LineCap.ROUND
    })
    groupOutline.freeze()
    this._shapeNodeStyle = new ShapeNodeStyle({
      shape: ShapeNodeShape.ROUND_RECTANGLE,
      stroke: groupOutline,
      fill: BPMN_CONSTANTS_GROUP_DEFAULT_BACKGROUND
    })
    this._shapeNodeStyle.renderer.roundRectArcRadius = BPMN_CONSTANTS_GROUP_NODE_CORNER_RADIUS
  }

  /**
   * The ShapeNodeStyle that is used internally to render this group style.
   * @type {!ShapeNodeStyle}
   */
  get shapeNodeStyle() {
    return this._shapeNodeStyle
  }

  /**
   * Gets an implementation of the {@link IVisualCreator} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation, but never `null`.
   * @param {!INode} node The node to provide an instance for
   * @param {!INodeStyle} style The style to use for the creation of the visual
   * @returns {!IVisualCreator} An implementation that may be used to subsequently create or update
   *   the visual for the item. Clients should not cache this instance and must always call this
   *   method immediately before using the value returned. This enables the use of the flyweight
   *   design pattern for implementations. This method may not return `null` but should
   *   yield a {@link VoidVisualCreator.INSTANCE void} implementation instead.
   * @see {@link VoidVisualCreator.INSTANCE}
   * @see Specified by {@link INodeStyleRenderer.getVisualCreator}.
   */
  getVisualCreator(node, style) {
    return this._shapeNodeStyle.renderer.getVisualCreator(node, this._shapeNodeStyle)
  }

  /**
   * Gets an implementation of the {@link IBoundsProvider} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!INode} node The node to provide an instance for
   * @param {!INodeStyle} style The style to use for the calculating the painting bounds
   * @returns {!IBoundsProvider} An implementation that may be used to subsequently query
   * the item's painting bounds. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer.getBoundsProvider}.
   */
  getBoundsProvider(node, style) {
    return this._shapeNodeStyle.renderer.getBoundsProvider(node, this._shapeNodeStyle)
  }

  /**
   * Gets an implementation of the {@link IVisibilityTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!INode} node The node to provide an instance for
   * @param {!INodeStyle} style The style to use for the testing the visibility
   * @returns {!IVisibilityTestable} An implementation that may be used to subsequently query
   * the item's visibility. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer.getVisibilityTestable}.
   */
  getVisibilityTestable(node, style) {
    return this._shapeNodeStyle.renderer.getVisibilityTestable(node, this._shapeNodeStyle)
  }

  /**
   * Gets an implementation of the {@link IHitTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!INode} node The node to provide an instance for
   * @param {!INodeStyle} style The style to use for the querying hit tests
   * @returns {!IHitTestable} An implementation that may be used to subsequently perform
   * hit tests. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations. This method may return
   *   `null` to indicate that the item cannot be hit tested.
   * @see Specified by {@link INodeStyleRenderer.getHitTestable}.
   */
  getHitTestable(node, style) {
    return this._shapeNodeStyle.renderer.getHitTestable(node, this._shapeNodeStyle)
  }

  /**
   * Gets an implementation of the {@link IMarqueeTestable} interface that can
   * handle the provided item and its associated style.
   * This method may return a flyweight implementation.
   * @param {!INode} node The node to provide an instance for
   * @param {!INodeStyle} style The style to use for the querying marquee intersection test.
   * @returns {!IMarqueeTestable} An implementation that may be used to subsequently query
   * the marquee intersections. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link INodeStyleRenderer.getMarqueeTestable}.
   */
  getMarqueeTestable(node, style) {
    return this._shapeNodeStyle.renderer.getMarqueeTestable(node, this._shapeNodeStyle)
  }

  /**
   * Gets a temporary context instance that can be used to query additional information
   * for the item's style.
   * Implementations may return {@link ILookup.EMPTY} if they don't support this, but may not return
   * `null`.
   * @param {!INode} item The item to provide a context instance for.
   * @param {!INodeStyle} style The style to use for the context.
   * @returns {!ILookup} An non-`null` lookup implementation.
   * @see {@link ILookup.EMPTY}
   * @see {@link ILookup}
   * @see Specified by {@link INodeStyleRenderer.getContext}.
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
   * @param {!INode} node The node to provide an instance for
   * @param {!INodeStyle} style The style to use for the painting
   * @returns {!IShapeGeometry} An implementation that may be used to subsequently query geometry
   *   information from. Clients should not cache this instance and must always call this method
   *   immediately before using the value returned. This enables the use of the flyweight design
   *   pattern for implementations
   * @see Specified by {@link INodeStyleRenderer.getShapeGeometry}.
   */
  getShapeGeometry(node, style) {
    return this._shapeNodeStyle.renderer.getShapeGeometry(node, this._shapeNodeStyle)
  }

  /**
   * Returns an instance that implements the given type or `null`.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-`null` implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be reobtained for subsequent use.
   * @param {!Class.<T>} type the type for which an instance shall be returned
   * @returns {?T} an instance that is assignable to type or `null`
   * @see Specified by {@link ILookup.lookup}.
   * @template {*} T
   */
  lookup(type) {
    if (type === INodeInsetsProvider.$class && this.lastStyle != null) {
      return new GroupInsetsProvider(this.lastStyle)
    }
    const lookup = this._shapeNodeStyle.renderer.getContext(this.lastNode, this._shapeNodeStyle)
    return lookup != null ? lookup.lookup(type) : null
  }
}

/**
 * Uses the style insets extended by the size of the participant bands.
 */
class GroupInsetsProvider extends BaseClass(INodeInsetsProvider) {
  /**
   * @param {!GroupNodeStyle} style
   */
  constructor(style) {
    super()
    this.style = style
  }

  /**
   * Returns the insets from {@link GroupNodeStyle} for the given node to include the size of the
   * participant bands.
   * @param {!INode} node The node for which the insets are provided
   * @returns {!Insets}
   */
  getInsets(node) {
    return this.style.insets
  }
}

/**
 * An {@link INodeStyle} implementation representing a Gateway according to the BPMN.
 */
export class GatewayNodeStyle extends BpmnNodeStyle {
  constructor() {
    super()
    this._type = null
    this._outline = BPMN_CONSTANTS_GATEWAY_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
    this._background = BPMN_CONSTANTS_GATEWAY_DEFAULT_BACKGROUND
    this.gatewayIcon = null
    this.typeIcon = null
    this.type = GatewayType.EXCLUSIVE_WITHOUT_MARKER
    this.minimumSize = new Size(20, 20)
  }

  /**
   * Gets the gateway type for this style.
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * Sets the gateway type for this style.
   * @type {number}
   */
  set type(value) {
    if (this._type !== value) {
      this.modCount++
      this._type = value
      this.updateTypeIcon()
    }
  }

  /**
   * Gets the background color of the gateway.
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * Sets the background color of the gateway.
   * @type {!Fill}
   */
  set background(value) {
    if (this._background !== value) {
      this.modCount++
      this._background = value
      this.updateGatewayIcon()
    }
  }

  /**
   * Gets the outline color of the gateway.
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * Sets the outline color of the gateway.
   * @type {!Fill}
   */
  set outline(value) {
    if (this._outline !== value) {
      this.modCount++
      this._outline = value
      this.updateGatewayIcon()
    }
  }

  /**
   * Gets the color for the icon.
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * Sets the color for the icon.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._iconColor !== value) {
      this.modCount++
      this._iconColor = value
      this.updateTypeIcon()
    }
  }

  updateGatewayIcon() {
    this.gatewayIcon = IconFactory.createPlacedIcon(
      IconFactory.createGateway(this.background, this.outline),
      BPMN_CONSTANTS_PLACEMENTS_GATEWAY,
      Size.EMPTY
    )
  }

  updateTypeIcon() {
    this.typeIcon = IconFactory.createGatewayType(this.type, this.iconColor)
    if (this.typeIcon != null) {
      this.typeIcon = IconFactory.createPlacedIcon(
        this.typeIcon,
        BPMN_CONSTANTS_PLACEMENTS_GATEWAY_TYPE,
        Size.EMPTY
      )
    }
  }

  /**
   * Updates the {@link BpmnNodeStyle.icon}.
   * This method is called by {@link BpmnNodeStyle.createVisual}.
   */
  updateIcon() {
    if (!this.gatewayIcon) {
      this.updateGatewayIcon()
    }
    this.icon =
      this.typeIcon != null
        ? IconFactory.createCombinedIcon(List.fromArray([this.gatewayIcon, this.typeIcon]))
        : this.gatewayIcon
  }

  /**
   * Gets the outline of the visual style.
   * This implementation yields `null` to indicate that
   * the {@link INode.layout} depicts the outline.
   * Implementing this method influences the behavior of {@link NodeStyleBase.isInside}
   * and {@link NodeStyleBase.getIntersection} since the default implementations delegate to it.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!GeneralPath} The outline of the visual representation or `null`.
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

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {?SvgVisual}
   */
  createVisual(context, node) {
    return super.createVisual(context, node)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @param {!INode} node
   * @returns {?SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    return super.updateVisual(context, oldVisual, node)
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * This method is called in response to a {@link IHitTestable.isHit}
   * call to the instance that has been queried from the {@link NodeStyleBase.renderer}.
   * This implementation uses the {@link NodeStyleBase.getOutline outline} to determine
   * whether the node has been hit.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!Point} p The point to test.
   * @param {!ICanvasContext} canvasContext The canvas context.
   * @returns {boolean} whether or not the specified node representation is hit.
   */
  isHit(canvasContext, p, node) {
    if (!node.layout.toRect().getEnlarged(canvasContext.hitTestRadius).contains(p)) {
      return false
    }
    const size = Math.min(node.layout.width, node.layout.height)

    const distVector = node.layout.center.subtract(p)
    const dist = Math.abs(distVector.x) + Math.abs(distVector.y)
    return dist < size * 0.5 + canvasContext.hitTestRadius
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
    this._nodeStyle = eventNodeStyle
    this._renderSize = BPMN_CONSTANTS_SIZES_EVENT_PORT
  }

  /**
   * Gets the event type for this style.
   * @type {number}
   */
  get type() {
    return this._nodeStyle.type
  }

  /**
   * Sets the event type for this style.
   * @type {number}
   */
  set type(value) {
    this._nodeStyle.type = value
  }

  /**
   * Gets the event characteristic for this style.
   * @type {number}
   */
  get characteristic() {
    return this._nodeStyle.characteristic
  }

  /**
   * Sets the event characteristic for this style.
   * @type {number}
   */
  set characteristic(value) {
    this._nodeStyle.characteristic = value
  }

  /**
   * Gets the size the port style is rendered with.
   * @type {!Size}
   */
  get renderSize() {
    return this._renderSize
  }

  /**
   * Sets the size the port style is rendered with.
   * @type {!Size}
   */
  set renderSize(value) {
    this._renderSize = value
  }

  /**
   * Gets the background color of the event.
   * @type {!Fill}
   */
  get background() {
    return this._nodeStyle.background
  }

  /**
   * Sets the background color of the event.
   * @type {!Fill}
   */
  set background(value) {
    if (this._nodeStyle.background !== value) {
      this._nodeStyle.background = value
    }
  }

  /**
   * Gets the outline color of the event.
   * @type {?Fill}
   */
  get outline() {
    return this._nodeStyle.outline
  }

  /**
   * Sets the outline color of the event.
   * If this is set to null, the outline color is automatic, based on the
   * {@link EventPortStyle.characteristic}.
   * @type {?Fill}
   */
  set outline(value) {
    if (this._nodeStyle.outline !== value) {
      this._nodeStyle.outline = value
    }
  }

  /**
   * Gets the primary color for icons and markers.
   * @type {!Fill}
   */
  get iconColor() {
    return this._nodeStyle.iconColor
  }

  /**
   * Sets the primary color for icons and markers.
   * @type {!Fill}
   */
  set iconColor(value) {
    if (this._nodeStyle.iconColor !== value) {
      this._nodeStyle.iconColor = value
    }
  }

  /**
   * @type {!EventNodeStyle}
   */
  get eventNodeStyle() {
    return this._nodeStyle
  }

  /**
   * Create a clone of this object.
   * @returns {*} A clone of this object.
   * @see Specified by {@link ICloneable.clone}.
   */
  clone() {
    const clone = this.memberwiseClone()
    clone._nodeStyle = this._nodeStyle.clone()
    return clone
  }

  /**
   * Gets the renderer implementation that can be queried for implementations
   * that provide details about the visual appearance and visual behavior
   * for a given port and this style instance.
   * @see Specified by {@link IPortStyle.renderer}.
   * @type {!IPortStyleRenderer}
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
    this._adapter = new NodeStylePortStyleAdapter()
  }

  /**
   * Gets an implementation of the {@link IVisualCreator} interface that can
   * handle the provided item and its associated style.
   * @param {!IPort} port The port to provide an instance for
   * @param {!IPortStyle} style The style to use for the creation of the visual
   * @returns {!IVisualCreator} An implementation that may be used to subsequently create or update
   *   the visual for the item. Clients should not cache this instance and must always call this
   *   method immediately before using the value returned. This enables the use of the flyweight
   *   design pattern for implementations. This method may not return `null` but should
   *   yield a {@link VoidVisualCreator.INSTANCE void} implementation instead.
   * @see {@link VoidVisualCreator.INSTANCE}
   * @see Specified by {@link IPortStyleRenderer.getVisualCreator}.
   */
  getVisualCreator(port, style) {
    const adapter = this.getConfiguredAdapter(style)
    return adapter.renderer.getVisualCreator(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IBoundsProvider} interface that can
   * handle the provided item and its associated style.
   * @param {!IPort} port The port to provide an instance for
   * @param {!IPortStyle} style The style to use for the calculating the painting bounds
   * @returns {!IBoundsProvider} An implementation that may be used to subsequently query
   * the item's painting bounds. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link IPortStyleRenderer.getBoundsProvider}.
   */
  getBoundsProvider(port, style) {
    const adapter = this.getConfiguredAdapter(style)
    return adapter.renderer.getBoundsProvider(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IVisibilityTestable} interface that can
   * handle the provided item and its associated style.
   * @param {!IPort} port The port to provide an instance for
   * @param {!IPortStyle} style The style to use for the testing the visibility
   * @returns {!IVisibilityTestable} An implementation that may be used to subsequently query
   * the item's visibility. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link IPortStyleRenderer.getVisibilityTestable}.
   */
  getVisibilityTestable(port, style) {
    const adapter = this.getConfiguredAdapter(style)
    return adapter.renderer.getVisibilityTestable(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IHitTestable} interface that can
   * handle the provided item and its associated style.
   * @param {!IPort} port The port to provide an instance for
   * @param {!IPortStyle} style The style to use for the querying hit tests
   * @returns {!IHitTestable} An implementation that may be used to subsequently perform
   * hit tests. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations. This method may return
   *   `null` to indicate that the item cannot be hit tested.
   * @see Specified by {@link IPortStyleRenderer.getHitTestable}.
   */
  getHitTestable(port, style) {
    const adapter = this.getConfiguredAdapter(style)
    return adapter.renderer.getHitTestable(port, adapter)
  }

  /**
   * Gets an implementation of the {@link IMarqueeTestable} interface that can
   * handle the provided item and its associated style.
   * @param {!IPort} port The port to provide an instance for
   * @param {!IPortStyle} style The style to use for the querying marquee intersection test.
   * @returns {!IMarqueeTestable} An implementation that may be used to subsequently query
   * the marquee intersections. Clients should not cache this instance and must always call
   * this method immediately before using the value returned. This enables the
   * use of the flyweight design pattern for implementations
   * @see Specified by {@link IPortStyleRenderer.getMarqueeTestable}.
   */
  getMarqueeTestable(port, style) {
    const adapter = this.getConfiguredAdapter(style)
    return adapter.renderer.getMarqueeTestable(port, adapter)
  }

  /**
   * Gets a temporary context instance that can be used to query additional information
   * for the item's style.
   * @param {!IPort} port The item to provide a context instance for.
   * @param {!IPortStyle} style The style to use for the context.
   * @returns {!ILookup} An non-`null` lookup implementation.
   * @see {@link ILookup.EMPTY}
   * @see {@link ILookup}
   * @see Specified by {@link IPortStyleRenderer.getContext}.
   */
  getContext(port, style) {
    const adapter = this.getConfiguredAdapter(style)
    this.fallbackLookup = adapter.renderer.getContext(port, adapter)
    return this
  }

  /**
   * Returns an instance that implements the given type or `null`.
   * Typically, this method will be called in order to obtain a different view or
   * aspect of the current instance. This is quite similar to casting or using
   * a super type or interface of this instance, but is not limited to inheritance or
   * compile time constraints. An instance implementing this method is not
   * required to return non-`null` implementations for the types, nor does it
   * have to return the same instance any time. Also it depends on the
   * type and context whether the instance returned stays up to date or needs to
   * be re-obtained for subsequent use.
   * @param {!Class.<T>} type the type for which an instance shall be returned
   * @returns {?T} an instance that is assignable to type or `null`
   * @see Specified by {@link ILookup.lookup}.
   * @template {*} T
   */
  lookup(type) {
    if (type === IEdgePathCropper.$class) {
      return EventPortEdgeIntersectionCalculator.CalculatorInstance
    }
    return this.fallbackLookup ? this.fallbackLookup.lookup(type) : null
  }

  /**
   * @param {!EventPortStyle} style
   * @returns {!IPortStyle}
   */
  getConfiguredAdapter(style) {
    const adapter = this._adapter
    adapter.nodeStyle = style.eventNodeStyle
    adapter.renderSize = style.renderSize
    return adapter
  }

  /**
   * @type {!EventPortStyleRenderer}
   */
  static get INSTANCE() {
    return (
      EventPortStyleRenderer._instance ||
      (EventPortStyleRenderer._instance = new EventPortStyleRenderer())
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
   * @param {!IPort} port The port at which the edge should be cropped.
   * @returns {?IShapeGeometry}
   */
  getPortGeometry(port) {
    if (port.style instanceof EventPortStyle) {
      const eventPortStyle = port.style
      return eventPortStyle.renderer.getContext(port, eventPortStyle).lookup(IShapeGeometry.$class)
    }
    return null
  }

  /**
   * @type {!EventPortEdgeIntersectionCalculator}
   */
  static get CalculatorInstance() {
    return (
      EventPortEdgeIntersectionCalculator._calculatorInstance ||
      (EventPortEdgeIntersectionCalculator._calculatorInstance =
        new EventPortEdgeIntersectionCalculator())
    )
  }
}

/**
 * A toggle button that uses different {@link Visual}s for the two toggle states.
 */
class VisualToggleButton extends SvgVisual {
  constructor() {
    super(window.document.createElementNS('http://www.w3.org/2000/svg', 'g'))

    // The visual used if the button is checked.
    this.checkedVisual = null

    // The visual used if the button is not checked.
    this.uncheckedVisual = null

    this._checked = false
  }

  /**
   * @type {boolean}
   */
  get checked() {
    return this._checked
  }

  /**
   * @type {boolean}
   */
  set checked(value) {
    if (this.checkedVisual && this.uncheckedVisual) {
      const noChildren = this.svgElement.childElementCount < 1
      if (value && (noChildren || !this.checked)) {
        this.svgElement.setAttribute('class', 'visualToggleButton visualToggleButtonChecked')
        this.setChild(this.checkedVisual)
      } else if (!value && (noChildren || this.checked)) {
        this.svgElement.setAttribute('class', 'visualToggleButton visualToggleButtonUnchecked')
        this.setChild(this.uncheckedVisual)
      }
      this._checked = value
    }
  }

  /**
   * @param {!SvgVisual} newChild
   */
  setChild(newChild) {
    if (this.svgElement.childElementCount >= 1) {
      this.svgElement.removeChild(this.svgElement.firstElementChild)
    }
    if (newChild != null) {
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

  /**
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const boundsWidth = this.bounds.width
    const boundsHeight = this.bounds.height
    const cornerSize = Math.min(boundsWidth, boundsHeight) * 0.4
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute(
      'd',
      `M 0 0
       L ${boundsWidth - cornerSize} 0
       L ${boundsWidth} ${cornerSize}
       L ${boundsWidth} ${boundsHeight}
       L 0 ${boundsHeight}
       Z`
    )
    Stroke.setStroke(this.stroke, path1, context)
    Fill.setFill(this.fill, path1, context)
    container.appendChild(path1)

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path2.setAttribute(
      'd',
      `M ${boundsWidth - cornerSize} 0
       L ${boundsWidth - cornerSize} ${cornerSize}
       L ${boundsWidth} ${cornerSize}`
    )
    Stroke.setStroke(this.stroke, path2, context)
    Fill.setFill(this.fill, path2, context)
    container.appendChild(path2)
    container['render-data-cache'] = new PathIconState(
      boundsWidth,
      boundsHeight,
      this.stroke,
      this.fill
    )

    SvgVisual.setTranslate(container, this.bounds.x, this.bounds.y)

    return new SvgVisual(container)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual.svgElement
    const cache = container['render-data-cache']

    const path1 = container.firstElementChild
    const path2 = container.lastElementChild

    if (cache.width !== this.bounds.width || cache.height !== this.bounds.height) {
      const cornerSize = Math.min(this.bounds.width, this.bounds.height) * 0.4
      path1.setAttribute(
        'd',
        `M 0 0
         L ${this.bounds.width - cornerSize} 0
         L ${this.bounds.width} ${cornerSize}
         L ${this.bounds.width} ${this.bounds.height}
         L 0 ${this.bounds.height}
         Z`
      )
      path2.setAttribute(
        'd',
        `M ${this.bounds.width - cornerSize} 0
         L ${this.bounds.width - cornerSize} ${cornerSize}
         L ${this.bounds.width} ${cornerSize}`
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
  /**
   * @param {!INode} node
   * @param {!Fill} iconFill
   */
  constructor(node, iconFill) {
    super()
    this.touchEndRegistered = false
    this.onTouchEndDelegate = null
    this.node = node
    this.iconFill = iconFill
    this.collapsedIcon = IconFactory.createStaticSubState(SubState.COLLAPSED, iconFill)
    this.expandedIcon = IconFactory.createStaticSubState(SubState.EXPANDED, iconFill)
  }

  /**
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createVisual(context) {
    this.collapsedIcon.setBounds(new Rect(Point.ORIGIN, this.bounds.size))
    this.expandedIcon.setBounds(new Rect(Point.ORIGIN, this.bounds.size))
    const button = this.createButton(
      context,
      this.node,
      this.collapsedIcon.createVisual(context),
      this.expandedIcon.createVisual(context)
    )
    const container = new SvgVisualGroup()
    container.add(new SvgVisual(button.svgElement))

    const transform = new Matrix()
    transform.translate(this.bounds.toRect().topLeft)
    container.transform = transform

    return container
  }

  /**
   * @param {!IRenderContext} context
   * @param {!SvgVisual} oldVisual
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const container = oldVisual instanceof SvgVisualGroup ? oldVisual : null
    if (
      !container ||
      (container.children.size === 1 && container.children.get(0) instanceof VisualToggleButton)
    ) {
      return this.createVisual(context)
    }

    this.collapsedIcon.setBounds(new Rect(Point.ORIGIN, this.bounds.size))
    this.expandedIcon.setBounds(new Rect(Point.ORIGIN, this.bounds.size))

    const button = container.children.get(0)
    button.checkedVisual = this.collapsedIcon.updateVisual(context, button.checkedVisual)
    button.uncheckedVisual = this.expandedIcon.updateVisual(context, button.uncheckedVisual)

    const transform = new Matrix()
    transform.translate(this.bounds.toRect().topLeft)
    container.transform = transform

    button.checked = !isExpanded(context, this.node)
    return container
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} item
   * @param {!SvgVisual} collapsedVisual
   * @param {!SvgVisual} expandedVisual
   * @returns {!VisualToggleButton}
   */
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
   * the given button visual that call {@link CollapseButtonIcon.toggleExpansionState}.
   * It is called by {@link CollapseButtonIcon.createButton}.
   * @param {!VisualToggleButton} button The button visual to add the event listeners to.
   * @param {!IRenderContext} context The context.
   */
  addToggleGroupStateCommand(button, context) {
    const currentItem = this.node
    button.svgElement.addEventListener(
      'click',
      () => {
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
      () => {
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

  /**
   * @param {!VisualToggleButton} button
   * @param {!INode} currentItem
   * @param {!IRenderContext} context
   */
  onTouchEnd(button, currentItem, context) {
    button.svgElement.removeEventListener(
      'touchend',
      this.onTouchEndDelegate,
      passiveSupported ? { passive: false } : false
    )
    this.touchEndRegistered = false
    toggleExpansionState(currentItem, context)
  }
}

/**
 * @param {!IRenderContext} context
 * @param {!INode} item
 * @returns {boolean}
 */
function isExpanded(context, item) {
  let expanded = true
  const canvas = context != null ? context.canvasComponent : null

  if (canvas != null) {
    const graph = canvas.graph
    const foldedGraph = graph.foldingView
    if (foldedGraph != null && foldedGraph.graph.contains(item)) {
      expanded = foldedGraph.isExpanded(item)
    }
  }
  return expanded
}

/**
 * Executes the {@link ICommand.TOGGLE_EXPANSION_STATE}, if it can be executed.
 * @param {!INode} currentNode The group whose state should be toggled.
 * @param {!IRenderContext} context The context.
 */
function toggleExpansionState(currentNode, context) {
  const canvas = context.canvasComponent
  if (ICommand.TOGGLE_EXPANSION_STATE.canExecute(currentNode, canvas)) {
    ICommand.TOGGLE_EXPANSION_STATE.execute(currentNode, canvas)
  }
}

/**
 * A class that contains all information to determine whether or not a {@link PathIcon} needs to be
 * updated.
 */
class PathIconState {
  /**
   * @param {number} width
   * @param {number} height
   * @param {?Stroke} stroke
   * @param {?Fill} fill
   */
  constructor(width, height, stroke, fill) {
    this.width = width
    this.height = height
    this.stroke = stroke
    this.fill = fill
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {?Stroke} stroke
   * @param {?Fill} fill
   * @returns {boolean}
   */
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
   * Specifies that an Event is a Start Event for a Sub-Process according to BPMN that interrupts
   * the containing Process.
   * @see {@link EventNodeStyle}
   */
  SUB_PROCESS_INTERRUPTING: 1,
  /**
   * Specifies that an Event is a Start Event for a Sub-Process according to BPMN that doesn`t
   * interrupt the containing Process.
   * @see {@link EventNodeStyle}
   */
  SUB_PROCESS_NON_INTERRUPTING: 2,
  /**
   * Specifies that an Event is an Intermediate Catching Event according to BPMN.
   * @see {@link EventNodeStyle}
   */
  CATCHING: 3,
  /**
   * Specifies that an Event is an Intermediate Event Attached to an Activity Boundary according to
   * BPMN that interrupts the Activity.
   * @see {@link EventNodeStyle}
   */
  BOUNDARY_INTERRUPTING: 4,
  /**
   * Specifies that an Event is an Intermediate Event Attached to an Activity Boundary according to
   * BPMN that doesn't interrupt the Activity.
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

export class PoolNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._vertical = false
    this._multipleInstance = false
    this._tableNodeStyle = null
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
  }

  /**
   * @type {boolean}
   */
  get vertical() {
    return this._vertical
  }

  /**
   * @type {boolean}
   */
  set vertical(value) {
    this._vertical = value
  }

  /**
   * @type {boolean}
   */
  get multipleInstance() {
    return this._multipleInstance
  }

  /**
   * @type {boolean}
   */
  set multipleInstance(value) {
    this._multipleInstance = value
  }

  /**
   * @type {?TableNodeStyle}
   */
  get tableNodeStyle() {
    return this._tableNodeStyle
  }

  /**
   * @type {?TableNodeStyle}
   */
  set tableNodeStyle(value) {
    this._tableNodeStyle = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      $self: [GraphMLAttribute().init({ contentProperty: 'tableNodeStyle' })],
      vertical: [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)],
      multipleInstance: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      tableNodeStyle: TypeAttribute(TableNodeStyle.$class),
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!PoolNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new PoolNodeStyle(this.vertical)
    style.multipleInstance = this.multipleInstance
    style.tableNodeStyle = this.tableNodeStyle
    style.iconColor = this.iconColor
    return style
  }
}

export class AlternatingLeafStripeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._evenLeafDescriptor = null
    this._parentDescriptor = null
    this._oddLeafDescriptor = null
  }

  /**
   * @type {!StripeDescriptor}
   */
  get evenLeafDescriptor() {
    return this._evenLeafDescriptor
  }

  /**
   * @type {!StripeDescriptor}
   */
  set evenLeafDescriptor(value) {
    this._evenLeafDescriptor = value
  }

  /**
   * @type {!StripeDescriptor}
   */
  get parentDescriptor() {
    return this._parentDescriptor
  }

  /**
   * @type {!StripeDescriptor}
   */
  set parentDescriptor(value) {
    this._parentDescriptor = value
  }

  /**
   * @type {!StripeDescriptor}
   */
  get oddLeafDescriptor() {
    return this._oddLeafDescriptor
  }

  /**
   * @type {!StripeDescriptor}
   */
  set oddLeafDescriptor(value) {
    this._oddLeafDescriptor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      evenLeafDescriptor: TypeAttribute(YObject.$class),
      parentDescriptor: TypeAttribute(YObject.$class),
      oddLeafDescriptor: TypeAttribute(YObject.$class)
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!AlternatingLeafStripeStyle}
   */
  provideValue(serviceProvider) {
    const style = new AlternatingLeafStripeStyle()
    style.evenLeafDescriptor = this.evenLeafDescriptor
    style.parentDescriptor = this.parentDescriptor
    style.oddLeafDescriptor = this.oddLeafDescriptor
    return style
  }
}

export class StripeDescriptorExtension extends MarkupExtension {
  constructor() {
    super()
    this._backgroundFill = Fill.TRANSPARENT
    this._insetFill = Fill.TRANSPARENT
    this._borderFill = Fill.BLACK
    this._borderThickness = new Insets(1)
  }

  /**
   * @type {!Fill}
   */
  get backgroundFill() {
    return this._backgroundFill
  }

  /**
   * @type {!Fill}
   */
  set backgroundFill(value) {
    this._backgroundFill = value
  }

  /**
   * @type {!Fill}
   */
  get insetFill() {
    return this._insetFill
  }

  /**
   * @type {!Fill}
   */
  set insetFill(value) {
    this._insetFill = value
  }

  /**
   * @type {!Fill}
   */
  get borderFill() {
    return this._borderFill
  }

  /**
   * @type {!Fill}
   */
  set borderFill(value) {
    this._borderFill = value
  }

  /**
   * @type {!Insets}
   */
  get borderThickness() {
    return this._borderThickness
  }

  /**
   * @type {!Insets}
   */
  set borderThickness(value) {
    this._borderThickness = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      backgroundFill: [
        GraphMLAttribute().init({ defaultValue: Fill.TRANSPARENT }),
        TypeAttribute(Fill.$class)
      ],
      insetFill: [
        GraphMLAttribute().init({ defaultValue: Fill.TRANSPARENT }),
        TypeAttribute(Fill.$class)
      ],
      borderFill: [
        GraphMLAttribute().init({ defaultValue: Fill.BLACK }),
        TypeAttribute(Fill.$class)
      ],
      borderThickness: [
        GraphMLAttribute().init({ defaultValue: new Insets(1) }),
        TypeAttribute(Insets.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!StripeDescriptor}
   */
  provideValue(serviceProvider) {
    const descriptor = new StripeDescriptor()
    descriptor.backgroundFill = this.backgroundFill
    descriptor.insetFill = this.insetFill
    descriptor.borderFill = this.borderFill
    descriptor.borderThickness = this.borderThickness
    return descriptor
  }
}

export class ActivityNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._activityType = ActivityType.TASK
    this._taskType = TaskType.ABSTRACT
    this._triggerEventType = EventType.MESSAGE
    this._triggerEventCharacteristic = EventCharacteristic.SUB_PROCESS_INTERRUPTING
    this._loopCharacteristic = LoopCharacteristic.NONE
    this._subState = SubState.NONE
    this._insets = new Insets(15)
    this._adHoc = false
    this._compensation = false
    this._minimumSize = Size.EMPTY
    this._background = BPMN_CONSTANTS_ACTIVITY_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_ACTIVITY_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
    this._eventOutline = BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE
  }

  /**
   * @type {number}
   */
  get activityType() {
    return this._activityType
  }

  /**
   * @type {number}
   */
  set activityType(value) {
    this._activityType = value
  }

  /**
   * @type {number}
   */
  get taskType() {
    return this._taskType
  }

  /**
   * @type {number}
   */
  set taskType(value) {
    this._taskType = value
  }

  /**
   * @type {number}
   */
  get triggerEventType() {
    return this._triggerEventType
  }

  /**
   * @type {number}
   */
  set triggerEventType(value) {
    this._triggerEventType = value
  }

  /**
   * @type {number}
   */
  get triggerEventCharacteristic() {
    return this._triggerEventCharacteristic
  }

  /**
   * @type {number}
   */
  set triggerEventCharacteristic(value) {
    this._triggerEventCharacteristic = value
  }

  /**
   * @type {number}
   */
  get loopCharacteristic() {
    return this._loopCharacteristic
  }

  /**
   * @type {number}
   */
  set loopCharacteristic(value) {
    this._loopCharacteristic = value
  }

  /**
   * @type {number}
   */
  get subState() {
    return this._subState
  }

  /**
   * @type {number}
   */
  set subState(value) {
    this._subState = value
  }

  /**
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * @type {!Insets}
   */
  set insets(value) {
    this._insets = value
  }

  /**
   * @type {boolean}
   */
  get adHoc() {
    return this._adHoc
  }

  /**
   * @type {boolean}
   */
  set adHoc(value) {
    this._adHoc = value
  }

  /**
   * @type {boolean}
   */
  get compensation() {
    return this._compensation
  }

  /**
   * @type {boolean}
   */
  set compensation(value) {
    this._compensation = value
  }

  /**
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {?Fill}
   */
  get eventOutline() {
    return this._eventOutline
  }

  /**
   * @type {?Fill}
   */
  set eventOutline(value) {
    this._eventOutline = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      activityType: [
        GraphMLAttribute().init({ defaultValue: ActivityType.TASK }),
        TypeAttribute(ActivityType.$class)
      ],

      taskType: [
        GraphMLAttribute().init({ defaultValue: TaskType.ABSTRACT }),
        TypeAttribute(TaskType.$class)
      ],

      triggerEventType: [
        GraphMLAttribute().init({ defaultValue: EventType.MESSAGE }),
        TypeAttribute(EventType.$class)
      ],
      triggerEventCharacteristic: [
        GraphMLAttribute().init({ defaultValue: EventCharacteristic.SUB_PROCESS_INTERRUPTING }),
        TypeAttribute(EventCharacteristic.$class)
      ],
      loopCharacteristic: [
        GraphMLAttribute().init({ defaultValue: LoopCharacteristic.NONE }),
        TypeAttribute(LoopCharacteristic.$class)
      ],
      subState: [
        GraphMLAttribute().init({ defaultValue: SubState.NONE }),
        TypeAttribute(SubState.$class)
      ],
      insets: [
        GraphMLAttribute().init({ defaultValue: new Insets(15) }),
        TypeAttribute(Insets.$class)
      ],
      adHoc: [GraphMLAttribute().init({ defaultValue: false }), TypeAttribute(YBoolean.$class)],
      compensation: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      minimumSize: [
        GraphMLAttribute().init({ defaultValue: Size.EMPTY }),
        TypeAttribute(Size.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_ACTIVITY_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_ACTIVITY_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ],
      eventOutline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!ActivityNodeStyle}
   */
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
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    style.eventOutline = this.eventOutline
    return style
  }
}

export class AnnotationNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._left = true
    this._background = BPMN_CONSTANTS_ANNOTATION_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_ANNOTATION_DEFAULT_OUTLINE
  }

  /**
   * @type {boolean}
   */
  get left() {
    return this._left
  }

  /**
   * @type {boolean}
   */
  set left(value) {
    this._left = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      left: [GraphMLAttribute().init({ defaultValue: true }), TypeAttribute(YBoolean.$class)],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_ANNOTATION_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_ANNOTATION_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!AnnotationNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new AnnotationNodeStyle()
    style.left = this.left
    style.background = this.background
    style.outline = this.outline
    return style
  }
}

export class ConversationNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._type = ConversationType.CONVERSATION
    this._background = BPMN_CONSTANTS_CONVERSATION_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_CONVERSATION_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      type: [
        GraphMLAttribute().init({ defaultValue: ConversationType.CONVERSATION }),
        TypeAttribute(ConversationType.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CONVERSATION_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CONVERSATION_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!ConversationNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new ConversationNodeStyle()
    style.type = this.type
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    return style
  }
}

export class ChoreographyNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._topParticipants = new List()
    this._bottomParticipants = new List()
    this._loopCharacteristic = LoopCharacteristic.NONE
    this._subState = SubState.NONE
    this._initiatingMessage = false
    this._responseMessage = false
    this._initiatingAtTop = true
    this._insets = new Insets(5)
    this._type = ChoreographyType.TASK
    this._minimumSize = Size.EMPTY
    this._background = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_ICON_COLOR
    this._initiatingColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_INITIATING_COLOR
    this._responseColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_RESPONSE_COLOR
    this._messageOutline = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_MESSAGE_OUTLINE
  }

  /**
   * @type {number}
   */
  get loopCharacteristic() {
    return this._loopCharacteristic
  }

  /**
   * @type {number}
   */
  set loopCharacteristic(value) {
    this._loopCharacteristic = value
  }

  /**
   * @type {number}
   */
  get subState() {
    return this._subState
  }

  /**
   * @type {number}
   */
  set subState(value) {
    this._subState = value
  }

  /**
   * @type {!List.<Participant>}
   */
  get topParticipants() {
    return this._topParticipants
  }

  /**
   * @type {!List.<Participant>}
   */
  set topParticipants(value) {
    this._topParticipants = value
  }

  /**
   * @type {!List.<Participant>}
   */
  get bottomParticipants() {
    return this._bottomParticipants
  }

  /**
   * @type {!List.<Participant>}
   */
  set bottomParticipants(value) {
    this._bottomParticipants = value
  }

  /**
   * @type {boolean}
   */
  get initiatingMessage() {
    return this._initiatingMessage
  }

  /**
   * @type {boolean}
   */
  set initiatingMessage(value) {
    this._initiatingMessage = value
  }

  /**
   * @type {boolean}
   */
  get responseMessage() {
    return this._responseMessage
  }

  /**
   * @type {boolean}
   */
  set responseMessage(value) {
    this._responseMessage = value
  }

  /**
   * @type {boolean}
   */
  get initiatingAtTop() {
    return this._initiatingAtTop
  }

  /**
   * @type {boolean}
   */
  set initiatingAtTop(value) {
    this._initiatingAtTop = value
  }

  /**
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * @type {!Insets}
   */
  set insets(value) {
    this._insets = value
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!Fill}
   */
  get initiatingColor() {
    return this._initiatingColor
  }

  /**
   * @type {!Fill}
   */
  set initiatingColor(value) {
    this._initiatingColor = value
  }

  /**
   * @type {!Fill}
   */
  get responseColor() {
    return this._responseColor
  }

  /**
   * @type {!Fill}
   */
  set responseColor(value) {
    this._responseColor = value
  }

  /**
   * @type {!Fill}
   */
  get messageOutline() {
    return this._messageOutline
  }

  /**
   * @type {!Fill}
   */
  set messageOutline(value) {
    this._messageOutline = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      loopCharacteristic: [
        GraphMLAttribute().init({ defaultValue: LoopCharacteristic.NONE }),
        TypeAttribute(LoopCharacteristic.$class)
      ],
      subState: [
        GraphMLAttribute().init({ defaultValue: SubState.NONE }),
        TypeAttribute(SubState.$class)
      ],
      topParticipants: [
        GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
        TypeAttribute(IList.$class)
      ],
      bottomParticipants: [
        GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
        TypeAttribute(IList.$class)
      ],
      initiatingMessage: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      responseMessage: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      initiatingAtTop: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class)
      ],
      insets: [
        GraphMLAttribute().init({ defaultValue: new Insets(5) }),
        TypeAttribute(Insets.$class)
      ],
      type: [
        GraphMLAttribute().init({ defaultValue: ChoreographyType.TASK }),
        TypeAttribute(ChoreographyType.$class)
      ],
      minimumSize: [
        GraphMLAttribute().init({ defaultValue: Size.EMPTY }),
        TypeAttribute(Size.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ],
      initiatingColor: [
        GraphMLAttribute().init({
          defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_INITIATING_COLOR
        }),
        TypeAttribute(Fill.$class)
      ],
      responseColor: [
        GraphMLAttribute().init({
          defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_RESPONSE_COLOR
        }),
        TypeAttribute(Fill.$class)
      ],
      messageOutline: [
        GraphMLAttribute().init({
          defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_MESSAGE_OUTLINE
        }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!ChoreographyNodeStyle}
   */
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
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    style.initiatingColor = this.initiatingColor
    style.responseColor = this.responseColor
    style.messageOutline = this.messageOutline
    return style
  }
}

export class LegacyChoreographyNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._topParticipants = new List()
    this._bottomParticipants = new List()
    this._loopCharacteristic = LoopCharacteristic.NONE
    this._subState = SubState.NONE
    this._initiatingMessage = false
    this._responseMessage = false
    this._initiatingAtTop = true
    this._insets = new Insets(5)
    this._type = ChoreographyType.TASK
    this._minimumSize = Size.EMPTY
    this._background = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_ICON_COLOR
    this._initiatingColor = Fill.LIGHT_GRAY
    this._responseColor = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_RESPONSE_COLOR
    this._messageOutline = BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_MESSAGE_OUTLINE
  }

  /**
   * @type {number}
   */
  get loopCharacteristic() {
    return this._loopCharacteristic
  }

  /**
   * @type {number}
   */
  set loopCharacteristic(value) {
    this._loopCharacteristic = value
  }

  /**
   * @type {number}
   */
  get subState() {
    return this._subState
  }

  /**
   * @type {number}
   */
  set subState(value) {
    this._subState = value
  }

  /**
   * @type {!List.<Participant>}
   */
  get topParticipants() {
    return this._topParticipants
  }

  /**
   * @type {!List.<Participant>}
   */
  set topParticipants(value) {
    this._topParticipants = value
  }

  /**
   * @type {!List.<Participant>}
   */
  get bottomParticipants() {
    return this._bottomParticipants
  }

  /**
   * @type {!List.<Participant>}
   */
  set bottomParticipants(value) {
    this._bottomParticipants = value
  }

  /**
   * @type {boolean}
   */
  get initiatingMessage() {
    return this._initiatingMessage
  }

  /**
   * @type {boolean}
   */
  set initiatingMessage(value) {
    this._initiatingMessage = value
  }

  /**
   * @type {boolean}
   */
  get responseMessage() {
    return this._responseMessage
  }

  /**
   * @type {boolean}
   */
  set responseMessage(value) {
    this._responseMessage = value
  }

  /**
   * @type {boolean}
   */
  get initiatingAtTop() {
    return this._initiatingAtTop
  }

  /**
   * @type {boolean}
   */
  set initiatingAtTop(value) {
    this._initiatingAtTop = value
  }

  /**
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * @type {!Insets}
   */
  set insets(value) {
    this._insets = value
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!Fill}
   */
  get initiatingColor() {
    return this._initiatingColor
  }

  /**
   * @type {!Fill}
   */
  set initiatingColor(value) {
    this._initiatingColor = value
  }

  /**
   * @type {!Fill}
   */
  get responseColor() {
    return this._responseColor
  }

  /**
   * @type {!Fill}
   */
  set responseColor(value) {
    this._responseColor = value
  }

  /**
   * @type {!Fill}
   */
  get messageOutline() {
    return this._messageOutline
  }

  /**
   * @type {!Fill}
   */
  set messageOutline(value) {
    this._messageOutline = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      loopCharacteristic: [
        GraphMLAttribute().init({ defaultValue: LoopCharacteristic.NONE }),
        TypeAttribute(LoopCharacteristic.$class)
      ],
      subState: [
        GraphMLAttribute().init({ defaultValue: SubState.NONE }),
        TypeAttribute(SubState.$class)
      ],
      topParticipants: [
        GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
        TypeAttribute(IList.$class)
      ],
      bottomParticipants: [
        GraphMLAttribute().init({ visibility: GraphMLMemberVisibility.CONTENT }),
        TypeAttribute(IList.$class)
      ],
      initiatingMessage: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      responseMessage: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      initiatingAtTop: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class)
      ],
      insets: [
        GraphMLAttribute().init({ defaultValue: new Insets(5) }),
        TypeAttribute(Insets.$class)
      ],
      type: [
        GraphMLAttribute().init({ defaultValue: ChoreographyType.TASK }),
        TypeAttribute(ChoreographyType.$class)
      ],
      minimumSize: [
        GraphMLAttribute().init({ defaultValue: Size.EMPTY }),
        TypeAttribute(Size.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ],
      initiatingColor: [
        GraphMLAttribute().init({
          defaultValue: Fill.LIGHT_GRAY
        }),
        TypeAttribute(Fill.$class)
      ],
      responseColor: [
        GraphMLAttribute().init({
          defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_RESPONSE_COLOR
        }),
        TypeAttribute(Fill.$class)
      ],
      messageOutline: [
        GraphMLAttribute().init({
          defaultValue: BPMN_CONSTANTS_CHOREOGRAPHY_DEFAULT_MESSAGE_OUTLINE
        }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!ChoreographyNodeStyle}
   */
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
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    style.initiatingColor = this.initiatingColor
    style.responseColor = this.responseColor
    style.messageOutline = this.messageOutline
    return style
  }
}

export class ParticipantExtension extends MarkupExtension {
  constructor() {
    super()
    this._multiInstance = false
  }

  /**
   * @type {boolean}
   */
  get multiInstance() {
    return this._multiInstance
  }

  /**
   * @type {boolean}
   */
  set multiInstance(value) {
    this._multiInstance = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      multiInstance: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!Participant}
   */
  provideValue(serviceProvider) {
    const participant = new Participant()
    participant.multiInstance = this.multiInstance
    return participant
  }
}

export class DataObjectNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._minimumSize = Size.EMPTY
    this._collection = false
    this._type = DataObjectType.NONE
    this._background = BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
  }

  /**
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * @type {boolean}
   */
  get collection() {
    return this._collection
  }

  /**
   * @type {boolean}
   */
  set collection(value) {
    this._collection = value
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      minimumSize: [
        GraphMLAttribute().init({ defaultValue: Size.EMPTY }),
        TypeAttribute(Size.$class)
      ],
      collection: [
        GraphMLAttribute().init({ defaultValue: false }),
        TypeAttribute(YBoolean.$class)
      ],
      type: [
        GraphMLAttribute().init({ defaultValue: DataObjectType.NONE }),
        TypeAttribute(DataObjectType.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DATA_OBJECT_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!DataObjectNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new DataObjectNodeStyle()
    style.minimumSize = this.minimumSize
    style.collection = this.collection
    style.type = this.type
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    return style
  }
}

export class DataStoreNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._minimumSize = Size.EMPTY
    this._background = BPMN_CONSTANTS_DATA_STORE_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_DATA_STORE_DEFAULT_OUTLINE
  }

  /**
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      minimumSize: [
        GraphMLAttribute().init({ defaultValue: Size.EMPTY }),
        TypeAttribute(Size.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DATA_STORE_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DATA_STORE_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!DataStoreNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new DataStoreNodeStyle()
    style.minimumSize = this.minimumSize
    style.background = this.background
    style.outline = this.outline
    return style
  }
}

export class EventNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._type = EventType.PLAIN
    this._characteristic = EventCharacteristic.START
    this._minimumSize = Size.EMPTY
    this._background = BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND
    this._outline = BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {number}
   */
  get characteristic() {
    return this._characteristic
  }

  /**
   * @type {number}
   */
  set characteristic(value) {
    this._characteristic = value
  }

  /**
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {?Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {?Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      type: [
        GraphMLAttribute().init({ defaultValue: EventType.PLAIN }),
        TypeAttribute(EventType.$class)
      ],
      characteristic: [
        GraphMLAttribute().init({ defaultValue: EventCharacteristic.START }),
        TypeAttribute(EventCharacteristic.$class)
      ],
      minimumSize: [
        GraphMLAttribute().init({ defaultValue: Size.EMPTY }),
        TypeAttribute(Size.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!EventNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new EventNodeStyle()
    style.type = this.type
    style.characteristic = this.characteristic
    style.minimumSize = this.minimumSize
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    return style
  }
}

export class GatewayNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._type = GatewayType.EXCLUSIVE_WITHOUT_MARKER
    this._minimumSize = Size.EMPTY
    this._background = BPMN_CONSTANTS_GATEWAY_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_GATEWAY_DEFAULT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {!Size}
   */
  get minimumSize() {
    return this._minimumSize
  }

  /**
   * @type {!Size}
   */
  set minimumSize(value) {
    this._minimumSize = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      type: [
        GraphMLAttribute().init({ defaultValue: GatewayType.EXCLUSIVE_WITHOUT_MARKER }),
        TypeAttribute(GatewayType.$class)
      ],
      minimumSize: [
        GraphMLAttribute().init({ defaultValue: Size.EMPTY }),
        TypeAttribute(Size.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_GATEWAY_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_GATEWAY_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!GatewayNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new GatewayNodeStyle()
    style.type = this.type
    style.minimumSize = this.minimumSize
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    return style
  }
}

export class GroupNodeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._insets = new Insets(15)
    this._background = BPMN_CONSTANTS_GROUP_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_GROUP_DEFAULT_OUTLINE
  }

  /**
   * @type {!Insets}
   */
  get insets() {
    return this._insets
  }

  /**
   * @type {!Insets}
   */
  set insets(value) {
    this._insets = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      insets: [
        GraphMLAttribute().init({ defaultValue: new Insets(15) }),
        TypeAttribute(Insets.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_GROUP_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_GROUP_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!GroupNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new GroupNodeStyle()
    style.insets = this.insets
    style.background = this.background
    style.outline = this.outline
    return style
  }
}

export class BpmnEdgeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._type = EdgeType.SEQUENCE_FLOW
    this._smoothing = 20
    this._color = BPMN_CONSTANTS_EDGE_DEFAULT_COLOR
    this._innerColor = BPMN_CONSTANTS_EDGE_DEFAULT_INNER_COLOR
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {number}
   */
  get smoothing() {
    return this._smoothing
  }

  /**
   * @type {number}
   */
  set smoothing(value) {
    this._smoothing = value
  }

  /**
   * @type {!Fill}
   */
  get color() {
    return this._color
  }

  /**
   * @type {!Fill}
   */
  set color(value) {
    this._color = value
  }

  /**
   * @type {!Fill}
   */
  get innerColor() {
    return this._innerColor
  }

  /**
   * @type {!Fill}
   */
  set innerColor(value) {
    this._innerColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      type: [
        GraphMLAttribute().init({ defaultValue: EdgeType.SEQUENCE_FLOW }),
        TypeAttribute(EdgeType.$class)
      ],
      smoothing: [GraphMLAttribute().init({ defaultValue: 20.0 }), TypeAttribute(YNumber.$class)],
      color: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_EDGE_DEFAULT_COLOR }),
        TypeAttribute(Fill.$class)
      ],
      innerColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_EDGE_DEFAULT_INNER_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!BpmnEdgeStyle}
   */
  provideValue(serviceProvider) {
    const style = new BpmnEdgeStyle()
    style.type = this.type
    style.smoothing = this.smoothing
    style.color = this.color
    style.innerColor = this.innerColor
    return style
  }
}

export class EventPortStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._type = EventType.COMPENSATION
    this._characteristic = EventCharacteristic.BOUNDARY_INTERRUPTING
    this._renderSize = new Size(20, 20)
    this._background = BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND
    this._outline = BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE
    this._iconColor = BPMN_CONSTANTS_DEFAULT_ICON_COLOR
  }

  /**
   * @type {number}
   */
  get type() {
    return this._type
  }

  /**
   * @type {number}
   */
  set type(value) {
    this._type = value
  }

  /**
   * @type {number}
   */
  get characteristic() {
    return this._characteristic
  }

  /**
   * @type {number}
   */
  set characteristic(value) {
    this._characteristic = value
  }

  /**
   * @type {!Size}
   */
  get renderSize() {
    return this._renderSize
  }

  /**
   * @type {!Size}
   */
  set renderSize(value) {
    this._renderSize = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {?Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {?Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get iconColor() {
    return this._iconColor
  }

  /**
   * @type {!Fill}
   */
  set iconColor(value) {
    this._iconColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      type: [
        GraphMLAttribute().init({ defaultValue: EventType.COMPENSATION }),
        TypeAttribute(EventType.$class)
      ],
      characteristic: [
        GraphMLAttribute().init({ defaultValue: EventCharacteristic.BOUNDARY_INTERRUPTING }),
        TypeAttribute(EventCharacteristic.$class)
      ],
      renderSize: [
        GraphMLAttribute().init({ defaultValue: new Size(20, 20) }),
        TypeAttribute(Size.$class)
      ],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_EVENT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_EVENT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      iconColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_ICON_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!EventPortStyle}
   */
  provideValue(serviceProvider) {
    const style = new EventPortStyle()
    style.characteristic = this.characteristic
    style.type = this.type
    style.renderSize = this.renderSize
    style.background = this.background
    style.outline = this.outline
    style.iconColor = this.iconColor
    return style
  }
}

export class AnnotationLabelStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._insets = 5
    this._background = BPMN_CONSTANTS_ANNOTATION_DEFAULT_BACKGROUND
    this._outline = BPMN_CONSTANTS_ANNOTATION_DEFAULT_OUTLINE
  }

  /**
   * @type {number}
   */
  get insets() {
    return this._insets
  }

  /**
   * @type {number}
   */
  set insets(value) {
    this._insets = value
  }

  /**
   * @type {!Fill}
   */
  get background() {
    return this._background
  }

  /**
   * @type {!Fill}
   */
  set background(value) {
    this._background = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      insets: [GraphMLAttribute().init({ defaultValue: 5 }), TypeAttribute(YNumber.$class)],
      background: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_ANNOTATION_DEFAULT_BACKGROUND }),
        TypeAttribute(Fill.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_ANNOTATION_DEFAULT_OUTLINE }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!AnnotationLabelStyle}
   */
  provideValue(serviceProvider) {
    const style = new AnnotationLabelStyle()
    style.insets = this.insets
    style.background = this.background
    style.outline = this.outline
    return style
  }
}

export class MessageLabelStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._isInitiating = true
    this._outline = BPMN_CONSTANTS_DEFAULT_MESSAGE_OUTLINE
    this._initiatingColor = BPMN_CONSTANTS_DEFAULT_INITIATING_MESSAGE_COLOR
    this._responseColor = BPMN_CONSTANTS_DEFAULT_RECEIVING_MESSAGE_COLOR
  }

  /**
   * @type {boolean}
   */
  get isInitiating() {
    return this._isInitiating
  }

  /**
   * @type {boolean}
   */
  set isInitiating(value) {
    this._isInitiating = value
  }

  /**
   * @type {!Fill}
   */
  get outline() {
    return this._outline
  }

  /**
   * @type {!Fill}
   */
  set outline(value) {
    this._outline = value
  }

  /**
   * @type {!Fill}
   */
  get initiatingColor() {
    return this._initiatingColor
  }

  /**
   * @type {!Fill}
   */
  set initiatingColor(value) {
    this._initiatingColor = value
  }

  /**
   * @type {!Fill}
   */
  get responseColor() {
    return this._responseColor
  }

  /**
   * @type {!Fill}
   */
  set responseColor(value) {
    this._responseColor = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      isInitiating: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class)
      ],
      outline: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_MESSAGE_OUTLINE }),
        TypeAttribute(Fill.$class)
      ],
      initiatingColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_INITIATING_MESSAGE_COLOR }),
        TypeAttribute(Fill.$class)
      ],
      responseColor: [
        GraphMLAttribute().init({ defaultValue: BPMN_CONSTANTS_DEFAULT_RECEIVING_MESSAGE_COLOR }),
        TypeAttribute(Fill.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!MessageLabelStyle}
   */
  provideValue(serviceProvider) {
    const style = new MessageLabelStyle()
    style.isInitiating = this.isInitiating
    style.outline = this.outline
    style.initiatingColor = this.initiatingColor
    style.responseColor = this.responseColor
    return style
  }
}

export class PoolHeaderLabelModelExtension extends MarkupExtension {
  /**
   * @type {!PoolHeaderLabelModel}
   */
  static get INSTANCE() {
    return new PoolHeaderLabelModel()
  }

  static get NORTH() {
    return PoolHeaderLabelModel.NORTH
  }

  static get EAST() {
    return PoolHeaderLabelModel.EAST
  }

  static get SOUTH() {
    return PoolHeaderLabelModel.SOUTH
  }

  static get WEST() {
    return PoolHeaderLabelModel.WEST
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      INSTANCE: TypeAttribute(PoolHeaderLabelModel.$class),
      NORTH: TypeAttribute(ILabelModelParameter.$class),
      EAST: TypeAttribute(ILabelModelParameter.$class),
      SOUTH: TypeAttribute(ILabelModelParameter.$class),
      WEST: TypeAttribute(ILabelModelParameter.$class)
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!PoolHeaderLabelModel}
   */
  provideValue(serviceProvider) {
    return new PoolHeaderLabelModel()
  }
}

// ensure that these constants can be deserialized even when they have not yet been used yet
Class.fixType(ChoreographyLabelModel)
Class.fixType(MessageParameter)
Class.fixType(TaskNameBandParameter)

export class ChoreographyLabelModelExtension extends MarkupExtension {
  /**
   * @type {!ChoreographyLabelModel}
   */
  static get INSTANCE() {
    return new ChoreographyLabelModel()
  }

  static get TASK_NAME_BAND() {
    return ChoreographyLabelModel.TASK_NAME_BAND
  }

  static get NORTH_MESSAGE() {
    return ChoreographyLabelModel.NORTH_MESSAGE
  }

  static get SOUTH_MESSAGE() {
    return ChoreographyLabelModel.SOUTH_MESSAGE
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      INSTANCE: TypeAttribute(ChoreographyLabelModel.$class),
      TASK_NAME_BAND: TypeAttribute(TaskNameBandParameter.$class),
      NORTH_MESSAGE: TypeAttribute(MessageParameter.$class),
      SOUTH_MESSAGE: TypeAttribute(MessageParameter.$class)
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!ChoreographyLabelModel}
   */
  provideValue(serviceProvider) {
    return new ChoreographyLabelModel()
  }
}

export class ParticipantParameterExtension extends MarkupExtension {
  constructor() {
    super()
    this._top = false
    this._index = 0
  }

  /**
   * @type {boolean}
   */
  get top() {
    return this._top
  }

  /**
   * @type {boolean}
   */
  set top(value) {
    this._top = value
  }

  /**
   * @type {number}
   */
  get index() {
    return this._index
  }

  /**
   * @type {number}
   */
  set index(value) {
    this._index = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      top: TypeAttribute(YBoolean.$class),
      index: TypeAttribute(YNumber.$class)
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!ParticipantParameter}
   */
  provideValue(serviceProvider) {
    return new ParticipantParameter(this.top, this.index)
  }
}

export class TaskNameBandParameterExtension extends MarkupExtension {
  /**
   * @param {!ILookup} serviceProvider
   * @returns {!TaskNameBandParameter}
   */
  provideValue(serviceProvider) {
    return new TaskNameBandParameter()
  }
}

export class MessageParameterExtension extends MarkupExtension {
  constructor() {
    super()
    this._north = false
  }

  /**
   * @type {boolean}
   */
  get north() {
    return this._north
  }

  /**
   * @type {boolean}
   */
  set north(value) {
    this._north = value
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!MessageParameter}
   */
  provideValue(serviceProvider) {
    const parameter = new MessageParameter()
    parameter.north = this.north
    return parameter
  }
}

export class ChoreographyMessageLabelStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._textPlacement = null
  }

  /**
   * @type {?ILabelModelParameter}
   */
  get textPlacement() {
    return this._textPlacement
  }

  /**
   * @type {?ILabelModelParameter}
   */
  set textPlacement(value) {
    this._textPlacement = value
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!ChoreographyMessageLabelStyle}
   */
  provideValue(serviceProvider) {
    const style = new ChoreographyMessageLabelStyle()
    style.textPlacement = this.textPlacement
    return style
  }
}

/**
 * A serialization listener that must be added when BPMN styles are serialized.
 */
export const BpmnHandleSerializationListener = (source, args) => {
  const item = args.item

  let markupExtension = null
  let markupExtensionClass = null
  if (item instanceof PoolNodeStyle) {
    markupExtension = new PoolNodeStyleExtension()
    markupExtension.vertical = item.vertical
    markupExtension.multipleInstance = item.multipleInstance
    markupExtension.tableNodeStyle = item.tableNodeStyle
    markupExtension.iconColor = item.iconColor
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
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtension.iconColor = item.iconColor
    markupExtension.eventOutline = item.eventOutline
    markupExtensionClass = ActivityNodeStyleExtension.$class
  } else if (item instanceof AnnotationNodeStyle) {
    markupExtension = new AnnotationNodeStyleExtension()
    markupExtension.left = item.left
    markupExtension.background = item.background
    markupExtension.outline = item.outline
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
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtension.iconColor = item.iconColor
    markupExtension.initiatingColor = item.initiatingColor
    markupExtension.responseColor = item.responseColor
    markupExtension.messageOutline = item.messageOutline
    markupExtensionClass = ChoreographyNodeStyleExtension.$class
  } else if (item instanceof Participant) {
    markupExtension = new ParticipantExtension()
    markupExtension.multiInstance = item.multiInstance
    markupExtensionClass = ParticipantExtension.$class
  } else if (item instanceof ConversationNodeStyle) {
    markupExtension = new ConversationNodeStyleExtension()
    markupExtension.type = item.type
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtension.iconColor = item.iconColor
    markupExtensionClass = ConversationNodeStyleExtension.$class
  } else if (item instanceof DataObjectNodeStyle) {
    markupExtension = new DataObjectNodeStyleExtension()
    markupExtension.minimumSize = item.minimumSize
    markupExtension.collection = item.collection
    markupExtension.type = item.type
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtension.iconColor = item.iconColor
    markupExtensionClass = DataObjectNodeStyleExtension.$class
  } else if (item instanceof DataStoreNodeStyle) {
    markupExtension = new DataStoreNodeStyleExtension()
    markupExtension.minimumSize = item.minimumSize
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtensionClass = DataStoreNodeStyleExtension.$class
  } else if (item instanceof EventNodeStyle) {
    markupExtension = new EventNodeStyleExtension()
    markupExtension.type = item.type
    markupExtension.characteristic = item.characteristic
    markupExtension.minimumSize = item.minimumSize
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtension.iconColor = item.iconColor
    markupExtensionClass = EventNodeStyleExtension.$class
  } else if (item instanceof GatewayNodeStyle) {
    markupExtension = new GatewayNodeStyleExtension()
    markupExtension.type = item.type
    markupExtension.minimumSize = item.minimumSize
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtension.iconColor = item.iconColor
    markupExtensionClass = GatewayNodeStyleExtension.$class
  } else if (item instanceof GroupNodeStyle) {
    markupExtension = new GroupNodeStyleExtension()
    markupExtension.insets = item.insets
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtensionClass = GroupNodeStyleExtension.$class
  } else if (item instanceof BpmnEdgeStyle) {
    markupExtension = new BpmnEdgeStyleExtension()
    markupExtension.type = item.type
    markupExtension.color = item.color
    markupExtension.innerColor = item.innerColor
    markupExtensionClass = BpmnEdgeStyleExtension.$class
  } else if (item instanceof EventPortStyle) {
    markupExtension = new EventPortStyleExtension()
    markupExtension.type = item.type
    markupExtension.characteristic = item.characteristic
    markupExtension.renderSize = item.renderSize
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtension.iconColor = item.iconColor
    markupExtensionClass = EventPortStyleExtension.$class
  } else if (item instanceof AnnotationLabelStyle) {
    markupExtension = new AnnotationLabelStyleExtension()
    markupExtension.insets = item.insets
    markupExtension.background = item.background
    markupExtension.outline = item.outline
    markupExtensionClass = AnnotationLabelStyleExtension.$class
  } else if (item instanceof MessageLabelStyle) {
    markupExtension = new MessageLabelStyleExtension()
    markupExtension.isInitiating = item.isInitiating
    markupExtension.outline = item.outline
    markupExtension.initiatingColor = item.initiatingColor
    markupExtension.responseColor = item.responseColor
    markupExtensionClass = MessageLabelStyleExtension.$class
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

const IO_SUPPORT = {
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
  MessageLabelStyleExtension,
  PoolHeaderLabelModelExtension,
  ChoreographyLabelModelExtension,
  ParticipantParameterExtension,
  TaskNameBandParameterExtension,
  MessageParameterExtension,
  ChoreographyMessageLabelStyleExtension
}

/**
 * The markup extensions to support styles that have been serialized with an older
 * BPMN Namespace "http://www.yworks.com/xml/yfiles-for-html/bpmn/2.0".
 *
 * The only difference is that the new BPMN styles deserialize the
 * {@link ChoreographyNodeStyle.initiatingColor} as white (which better fits the BPMN specification)
 * instead of Light.GRAY as it used to be.
 */
export const LegacyBpmnExtensions = Object.assign({}, IO_SUPPORT)
LegacyBpmnExtensions.ChoreographyNodeStyleExtension = LegacyChoreographyNodeStyleExtension

/**
 /**
 * The markup extensions for this BPMN style implementation.
 */
export default IO_SUPPORT

/**
 * @typedef {Object} StripeRenderDataCache
 * @property {StripeDescriptor} descriptor
 * @property {IStripe} stripe
 * @property {Insets} insets
 * @property {function} equals
 */
