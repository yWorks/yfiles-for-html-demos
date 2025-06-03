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
  EdgePathLabelModel,
  EdgeSides,
  EdgeStyleIndicatorRenderer,
  EventRecognizers,
  Fill,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicalLayout,
  IEdge,
  IInputMode,
  ILabel,
  IModelItem,
  INode,
  INodeStyle,
  Insets,
  InteriorNodeLabelModel,
  KeyEventArgs,
  KeyEventType,
  LabelStyle,
  LayoutData,
  LayoutExecutor,
  LayoutOrientation,
  ModifierKeys,
  NinePositionsEdgeLabelModel,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShowPortCandidates,
  Size,
  Stroke
} from '@yfiles/yfiles'
import { ColorThemes } from './ColorThemes'
import { FlowchartNodeStyle, FlowchartNodeType } from '../flowchart/style/FlowchartStyle'
import { handleMultipleSteps, PickerLayout, WizardAction } from './WizardAction'
import { FlowchartLayout } from '../flowchart/layout/FlowchartLayout'
import { FlowchartLayoutData } from '../flowchart/layout/FlowchartLayoutData'
import { GraphWizardInputMode } from './GraphWizardInputMode'
import {
  checkAnd,
  checkForEdge,
  checkForNode,
  checkForNodeStyle,
  checkNot,
  checkNotCreatingEdge,
  checkOr
} from './Preconditions'
import {
  createChangeNodeColorSet,
  createEditLabel,
  createEndEdgeCreation,
  createSmartNavigate,
  createSmartNavigateEdge,
  createStartEdgeCreation,
  runLayout
} from './Actions'
/**
 * Utility class that configures a GraphComponent to support fast creation of flowchart diagrams.
 *
 * In {@link FlowchartConfiguration.initializeGraphDefaults initializeGraphDefaults} the default
 * item styles and focus visualization is set.
 *
 * In {@link FlowchartConfiguration.initializeDiagram initializeDiagram} the graph is initialized
 * with a 'Start' node from where the flowchart creation can start.
 *
 * In {@link FlowchartConfiguration.createInputMode createInputMode} a
 * {@link GraphEditorInputMode} is created and adjusted to replace most default creation gestures
 * by a {@link GraphWizardInputMode} that is configured to support creating flowchart diagrams.
 */
export class FlowchartConfiguration {
  flowchartTypes = [
    FlowchartNodeType.Process,
    FlowchartNodeType.Decision,
    FlowchartNodeType.Start1,
    FlowchartNodeType.Start2,
    FlowchartNodeType.Terminator,
    FlowchartNodeType.Cloud,
    FlowchartNodeType.Data,
    FlowchartNodeType.DirectData,
    FlowchartNodeType.Database,
    FlowchartNodeType.Document,
    FlowchartNodeType.PredefinedProcess,
    FlowchartNodeType.StoredData,
    FlowchartNodeType.InternalStorage,
    FlowchartNodeType.SequentialData,
    FlowchartNodeType.ManualInput,
    FlowchartNodeType.Card,
    FlowchartNodeType.PaperType,
    FlowchartNodeType.Delay,
    FlowchartNodeType.Display,
    FlowchartNodeType.ManualOperation,
    FlowchartNodeType.Preparation,
    FlowchartNodeType.LoopLimit,
    FlowchartNodeType.LoopLimitEnd,
    FlowchartNodeType.OnPageReference,
    FlowchartNodeType.OffPageReference,
    FlowchartNodeType.Annotation,
    FlowchartNodeType.UserMessage,
    FlowchartNodeType.NetworkMessage
  ]
  colorTheme
  _layoutOrientation
  layoutData = null
  constructor(layoutOrientation) {
    this._layoutOrientation = layoutOrientation
    this.colorTheme = ColorThemes[1]
  }
  createLayout(incremental) {
    const layout = incremental ? new IncrementalFlowchartLayout() : new FlowchartLayout()
    layout.layoutOrientation = this.layoutOrientation
    layout.minimumEdgeLength = 100
    layout.minimumNodeDistance = 80
    return layout
  }
  get layoutOrientation() {
    return this._layoutOrientation
  }
  //region Graph Defaults
  /**
   * Initializes the style and decorator defaults for flowchart diagrams.
   * @param graphComponent The graph component to set the defaults to.
   */
  initializeGraphDefaults(graphComponent) {
    graphComponent.graph.decorator.nodes.focusRenderer.hide()
    graphComponent.graph.decorator.edges.focusRenderer.addConstant(
      new EdgeStyleIndicatorRenderer({
        edgeStyle: new PolylineEdgeStyle({
          stroke: '2px gold',
          targetArrow: new Arrow({
            fill: 'gold',
            stroke: null,
            lengthScale: 2,
            widthScale: 2,
            type: 'triangle'
          })
        }),
        zoomPolicy: 'world-coordinates'
      })
    )
    const graph = graphComponent.graph
    graph.decorator.edges.portHandleProvider.hide()
    const colorSet = this.colorTheme[0]
    // initialize node/edge/label defaults
    graph.nodeDefaults.style = new FlowchartNodeStyle(
      FlowchartNodeType.Process,
      Fill.from(colorSet.fill),
      new Stroke({ fill: colorSet.outline, thickness: 1.5 })
    )
    graph.nodeDefaults.size = new Size(100, 80)
    graph.nodeDefaults.shareStyleInstance = false
    graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.CENTER
    graph.nodeDefaults.labels.style = new LabelStyle({
      textFill: colorSet.labelText,
      backgroundFill: colorSet.labelFill,
      padding: 2
    })
    graph.nodeDefaults.labels.shareStyleInstance = false
    graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '1.5px black',
      targetArrow: new Arrow({
        fill: 'black',
        stroke: null,
        lengthScale: 2,
        widthScale: 2,
        type: 'triangle'
      })
    })
    graph.edgeDefaults.labels.style = new LabelStyle({
      textFill: colorSet.labelText
    })
    graph.edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.CENTER_BELOW
    graph.edgeDefaults.shareStyleInstance = false
    this.layoutData = new FlowchartLayoutData().create(graph)
    // enable undo
    graph.undoEngineEnabled = true
  }
  //endregion
  //region Initial Diagram
  /**
   * Initializes a new flowchart diagram with a single start node.
   * @param graphComponent The component containing the diagram.
   */
  initializeDiagram(graphComponent) {
    const graph = graphComponent.graph
    const colorSet = this.colorTheme[0]
    // initialize graph
    graph.clear()
    const startNode = graph.createNode({
      style: new FlowchartNodeStyle(
        FlowchartNodeType.Start1,
        Fill.from(colorSet.fill),
        new Stroke({ fill: colorSet.outline, thickness: 1.5 })
      )
    })
    graph.addLabel(
      startNode,
      'Start',
      InteriorNodeLabelModel.CENTER,
      new LabelStyle({
        textFill: colorSet.labelText,
        backgroundFill: colorSet.labelFill,
        textSize: 24,
        padding: 2
      })
    )
    graphComponent.updateContentBounds()
    graphComponent.zoomTo(
      new Rect(
        -(graphComponent.innerSize.width - 100) / 2,
        -350,
        graphComponent.innerSize.width,
        graphComponent.innerSize.height
      )
    )
    graphComponent.currentItem = startNode
    graphComponent.focus()
    graph.undoEngine?.clear()
  }
  //endregion
  //region Input Mode with Flowchart-Actions
  /**
   * Creates an editor input mode that disables many of the default actions and adds a
   * {@link GraphWizardInputMode} with custom actions to create flow charts.
   * @param legendDiv The HTML element containing the legend of the active actions.
   * @param graphComponent The given graphComponent
   */
  createInputMode(graphComponent, legendDiv) {
    // use a GraphEditorInputMode but disable many of the default actions to use WizardActions instead
    const mode = new GraphEditorInputMode({
      selectableItems: 'none',
      allowCreateNode: false,
      allowCreateBend: false,
      focusableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
      createEdgeInputMode: {
        showPortCandidates: ShowPortCandidates.END
      },
      editLabelInputMode: {
        autoRemoveEmptyLabels: false,
        textEditorInputMode: {
          // only cancel text editing on key-up event of Escape key
          // otherwise consecutive label edits could be canceled by a single press of the Escape key
          cancelRecognizer: EventRecognizers.createKeyEventRecognizer(
            KeyEventType.DOWN,
            'Escape',
            ModifierKeys.NONE
          ),
          // when editing a label, clicking on the canvas should commit the label text
          autoCommitOnFocusLost: true
        }
      },
      marqueeSelectionInputMode: {
        enabled: false
      },
      moveViewportInputMode: {
        // move viewport by dragging the empty canvas with the mouse
        beginRecognizer: EventRecognizers.MOUSE_DOWN
      }
    })
    const wizardMode = new GraphWizardInputMode(legendDiv)
    // mode.moveUnselectedItemsInputMode.priority = mode.moveViewportInputMode.priority - 1
    mode.moveUnselectedItemsInputMode.addEventListener('drag-finished', () =>
      runLayout(wizardMode, this.createLayout(true), this.layoutData)
    )
    this.addActions(wizardMode)
    mode.add(wizardMode)
    mode.keyboardInputMode.addKeyBinding('l', ModifierKeys.NONE, async () => {
      await this.runFromScratchLayout(graphComponent)
    })
    return mode
  }
  /**
   * {@link GraphWizardInputMode.addAction Adds} actions to the {link GraphWizardInputMode} that
   * are suited to support the creation of flowchart diagrams.
   * @param mode The {link GraphWizardInputMode} to add the actions to.
   */
  addActions(mode) {
    mode.addAction(createSmartNavigate())
    mode.addAction(createSmartNavigateEdge('NextIncoming'))
    mode.addAction(createSmartNavigateEdge('NextOutgoing'))
    mode.addAction(this.createCreateSmartChild())
    mode.addAction(this.createCreateTwoChildren())
    mode.addAction(createStartEdgeCreation())
    mode.addAction(
      createEndEdgeCreation(
        () => this.createLayout(true),
        () => this.layoutData
      )
    )
    mode.addAction(createEditLabel())
    mode.addAction(
      createChangeNodeColorSet(
        checkAnd([checkNotCreatingEdge, checkForNodeStyle(FlowchartNodeStyle)]),
        this.colorTheme,
        (node) => node.style.fill,
        (style, fill, outline) => {
          style.fill = Fill.from(fill)
          style.stroke = new Stroke({ fill: outline, thickness: 1.5 })
        }
      )
    )
    mode.addAction(this.createChangeFlowchartType())
    mode.addAction(this.createDelete())
  }
  //endregion
  //region Action Factory Methods
  /**
   * Creates a {@link WizardAction} to change the {@link FlowchartNodeType type} of the flowchart node.
   */
  createChangeFlowchartType() {
    return this.createChangeFlowchartTypeCore(this.createChangeFlowchartTypeHandler(true), false)
  }
  /**
   * Creates a {@link WizardAction} to select the {@link FlowchartNodeType type} of a newly created
   * flowchart node.
   */
  createSelectInitialFlowchartType() {
    return this.createChangeFlowchartTypeCore(this.createChangeFlowchartTypeHandler(false), true)
  }
  /**
   * Creates a {@link WizardAction} to select or change the {@link FlowchartNodeType type} of a node.
   * @param handler The handler for assigning the chosen flowchart type.
   * @param onlyPicker Whether only the type picker or also the main button shall be used.
   */
  createChangeFlowchartTypeCore(handler, onlyPicker) {
    return new WizardAction(
      'changeType',
      checkAnd([checkNotCreatingEdge, checkForNodeStyle(FlowchartNodeStyle)]),
      handler,
      [{ key: 't' }],
      'Change the node type',
      {
        typeFactory: (item) => this.getFlowchartType(item),
        styleFactory: (item) => {
          return {
            type: 'icon',
            iconPath: 'resources/icons/flowchart-' + this.getFlowchartType(item) + '.svg'
          }
        },
        tooltip: 'Change the node type',
        pickerButtons: this.createChangeFlowchartTypeButtons()
      }
    )
  }
  createChangeFlowchartTypeHandler(refresh) {
    return (mode, item, type, args) => {
      let newType
      if (args instanceof KeyEventArgs) {
        const lastIndex = this.flowchartTypes.indexOf(this.getFlowchartType(item))
        newType = this.flowchartTypes[(lastIndex + 1) % this.flowchartTypes.length]
      } else {
        newType = type
      }
      // set a new style so the type change is undoable
      const node = item
      const newStyle = node.style.clone()
      newStyle.type = newType
      mode.graph.setStyle(node, newStyle)
      if (refresh) {
        this.refreshFocusHighlights(mode, item)
      }
    }
  }
  createChangeFlowchartTypeButtons() {
    const typeToTooltip = (type) => {
      const name = type
        .replace(/\d+/, (value) => ' ' + value)
        .replace(/([a-z][A-Z])/g, (value) => value.substring(0, 1) + ' ' + value.substring(1, 2))
      return name.substring(0, 1).toUpperCase() + name.substring(1, name.length)
    }
    const pickerButtons = []
    for (let i = 0; i < this.flowchartTypes.length; i++) {
      const type = this.flowchartTypes[i]
      pickerButtons.push({
        type: type,
        style: {
          type: 'icon',
          iconPath: 'resources/icons/flowchart-' + type + '.svg'
        },
        tooltip: typeToTooltip(type)
      })
    }
    return pickerButtons
  }
  getFlowchartType(node) {
    return node.style.type
  }
  refreshFocusHighlights(mode, item) {
    mode.graphComponent.currentItem = null
    mode.graphComponent.currentItem = item
    mode.graphComponent.updateVisual()
  }
  /**
   * Creates a {@link WizardAction} to create two child nodes of a
   * {@link FlowchartNodeType.Decision decision} node.
   */
  createCreateTwoChildren() {
    return new WizardAction(
      'createTwoChildren',
      checkAnd([checkNotCreatingEdge, this.isNodeType(FlowchartNodeType.Decision)]),
      (mode, source, args) => {
        return this.addTwoChildNodes(mode)
      },
      [{ key: ' ', modifier: ModifierKeys.CONTROL }],
      'Create two children of the decision node',
      {
        type: 'add-button-two-children',
        style: { type: 'icon', iconPath: 'resources/icons/add-two-children.svg' },
        tooltip: 'Create two children'
      }
    )
  }
  /**
   * Creates a {@link WizardAction} to create a child node in a free direction.
   */
  createCreateSmartChild() {
    return new WizardAction(
      'createSmartChild',
      checkAnd([
        checkNotCreatingEdge,
        checkForNode,
        checkNot(this.isNodeType(FlowchartNodeType.Terminator)),
        checkNot(this.isNodeType(FlowchartNodeType.Annotation))
      ]),
      (mode, item, type, args) => {
        const parent = item
        const offset = this.getOffsetForFreeSide(parent)
        // create and handle the necessary steps
        const actionSteps = this.createAddNodeWithEdgeSteps(mode, parent, offset)
        return handleMultipleSteps(actionSteps)
      },
      [{ key: ' ', modifier: ModifierKeys.NONE }],
      '<br/><br/>Create a child node',
      {
        type: 'createSmartChild',
        style: {
          type: 'icon',
          iconPath: 'resources/icons/add-child.svg',
          backgroundFill: '#FFFFFF00'
        },
        tooltip: 'Create a child node'
      }
    )
  }
  getOffsetForFreeSide(parent) {
    const offset = this.getOffsetFromParent(parent)
    if (this.layoutOrientation == LayoutOrientation.TOP_TO_BOTTOM) {
      if (!this.hasPortAt(parent, 'bottom')) {
        return new Point(0, offset.y)
      } else if (!this.hasPortAt(parent, 'left')) {
        return new Point(-offset.x, offset.y)
      } else if (!this.hasPortAt(parent, 'right')) {
        return new Point(offset.x, offset.y)
      } else {
        // fallback
        return new Point(0, offset.y)
      }
    } else {
      // Left-to-Right
      if (!this.hasPortAt(parent, 'right')) {
        return new Point(offset.x, 0)
      } else if (!this.hasPortAt(parent, 'bottom')) {
        return new Point(offset.x, offset.y)
      } else if (!this.hasPortAt(parent, 'top')) {
        return new Point(offset.x, -offset.y)
      } else {
        // fallback
        return new Point(offset.x, 0)
      }
    }
  }
  /**
   * Determines the horizontal and vertical offset required for child nodes of the given parent
   * node.
   */
  getOffsetFromParent(parent) {
    const parentLayout = parent.layout
    const w = parentLayout.width
    const h = parentLayout.height
    if (w > h) {
      return new Point(w + 30, h + 20)
    } else {
      return new Point(w + 20, h + 30)
    }
  }
  /**
   * Returns if node has a port at the provided node side.
   * @param node The node to check for ports.
   * @param side The node side to check.
   */
  hasPortAt(node, side) {
    for (const port of node.ports) {
      const vecFromCenter = port.location.subtract(node.layout.center)
      const topBottom =
        Math.abs(vecFromCenter.y / node.layout.height) >
        Math.abs(vecFromCenter.x / node.layout.width)
      if (topBottom && (side == 'top' || side == 'bottom')) {
        if ((side == 'top' && vecFromCenter.y < 0) || (side == 'bottom' && vecFromCenter.y > 0)) {
          return true
        }
      } else if (!topBottom && (side == 'left' || side == 'right')) {
        if ((side == 'left' && vecFromCenter.x < 0) || (side == 'right' && vecFromCenter.x > 0)) {
          return true
        }
      }
    }
    return false
  }
  /**
   * Creates a {@link WizardAction} that deletes the
   * {@link GraphWizardInputMode.currentItem current item}.
   */
  createDelete() {
    return new WizardAction(
      'deleteNode',
      checkAnd([
        checkNotCreatingEdge,
        checkOr([checkForNode, checkForEdge]),
        (mode) => mode.graph.nodes.size > 1
      ]),
      (mode, item, type, args) => {
        const graph = mode.graph
        let newCurrentItem = null
        if (mode.currentItem instanceof INode) {
          const node = mode.currentItem
          newCurrentItem = graph.neighbors(node).at(0) ?? null
        } else if (mode.currentItem instanceof IEdge) {
          newCurrentItem = mode.currentItem.sourceNode
        }
        graph.remove(mode.currentItem)
        // make sure there is a current item set
        mode.graphComponent.currentItem = newCurrentItem ?? graph.nodes.first()
        return true
      },
      [{ key: 'Delete' }, { key: 'Backspace' }],
      '<br/><br/>Remove this item',
      {
        type: 'delete-button',
        style: { type: 'icon', iconPath: 'resources/icons/delete.svg' },
        tooltip: 'Remove this item'
      }
    )
  }
  /**
   * Starts a new (non-incremental) layout calculation from scratch.
   * @param graphComponent The GraphComponent containing the graph to layout.
   */
  async runFromScratchLayout(graphComponent) {
    await new LayoutExecutor({
      layout: this.createLayout(false),
      layoutData: this.layoutData,
      animationDuration: 200,
      animateViewport: false,
      easedAnimation: true,
      graphComponent: graphComponent
    }).start()
  }
  //endregion
  /**
   * Creates the steps to create a new node connected to the given parent node by a new edge and
   * {@link runLayout runs} a new layout calculation.
   *
   * The layout of the new node is calculated by translating the layout of the parent by the childOffset.
   * After applying the new layout, the {@link createChangeFlowchartType} action is triggered for
   * the new node.
   * @param mode The current {@link GraphWizardInputMode}.
   * @param parent The source node of an edge to the new node shall be created from.
   * @param childOffset The offset to the parent's layout to place the new node at.
   * @param skipLayout Whether applying a new layout should be skipped.
   */
  createAddNodeWithEdgeSteps(mode, parent, childOffset, skipLayout) {
    const steps = []
    // create node and edge (non-interactive)
    const step1 = {
      action: async (inData, wasCanceled) => {
        if (wasCanceled) {
          // if the next step (picker type selection) was canceled, cancel this step as well
          return {
            success: false
          }
        }
        const currentItem = mode.graphComponent.currentItem
        const graph = mode.graph
        // initially hide the new node so if an edge label is added, the edge is more prominent
        const child = graph.createNode(
          parent.layout.toRect().getTranslated(childOffset),
          INodeStyle.VOID_NODE_STYLE
        )
        const edge = graph.createEdge(parent, child)
        if (!skipLayout) {
          await runLayout(mode, this.createLayout(true), this.layoutData, [parent], [child])
        }
        // bring the new node into view with some reasonable insets
        await mode.graphComponent.ensureVisible(
          child.layout,
          new Insets(Math.min(child.layout.width, child.layout.height) / 2)
        )
        mode.graphComponent.currentItem = child
        return {
          success: true,
          undoData: { currentItem, child, edge },
          outData: { child, edge }
        }
      },
      undo: (undoData) => {
        const { currentItem, child, edge } = undoData
        const graph = mode.graph
        graph.remove(edge)
        graph.remove(child)
        mode.graphComponent.currentItem = currentItem
      }
    }
    steps.push(step1)
    const parentInputMode = mode.graphEditorInputMode
    const parentType = this.getFlowchartType(parent)
    if (FlowchartNodeType.Decision == parentType) {
      // only add an edge label when parent was a decision node
      const step2 = {
        action: async (inData) => {
          const { edge } = inData
          const labelPicked = await mode.showPickerSelection(
            this.createSelectEdgeLabelTextAction(edge, parentInputMode),
            edge
          )
          const newLabel = labelPicked && edge.labels.size > 0 ? edge.labels.at(0) : null
          return {
            success: labelPicked,
            undoData: newLabel,
            outData: inData
          }
        },
        undo: (inData) => {
          if (inData) {
            mode.graph.remove(inData)
          }
        }
      }
      steps.push(step2)
    }
    // select FlowchartNodeType
    const step3 = {
      action: async (inData, wasCanceled) => {
        const { child } = inData
        if (!wasCanceled) {
          // child has still a void node style so set the default FlowchartNodeStyle instead
          mode.graph.setStyle(child, mode.graph.nodeDefaults.getStyleInstance())
        }
        const oldType = child.style.type
        const success = await mode.showPickerSelection(
          this.createSelectInitialFlowchartType(),
          child
        )
        if (!success) {
          // picker was canceled, so reset node style to void for previous steps
          mode.graph.setStyle(child, INodeStyle.VOID_NODE_STYLE)
        }
        return { success, undoData: null, outData: inData }
      },
      undo: (undoData) => {
        // don't undo setting the flowchart type so the new picker selection starts with the previous
        // choice
      }
    }
    steps.push(step3)
    // edit node label
    const step4 = {
      action: async (inData) => {
        const { child, edge } = inData
        // when label editing was canceled, it returns null
        const label = await parentInputMode.startLabelAddition(child)
        if (label != null && label.text.length == 0) {
          // accept empty label as valid input but remove it from the graph
          mode.graph.remove(label)
          return { success: true, undoData: null, outData: edge }
        }
        return { success: label != null, undoData: label, outData: edge }
      },
      undo: (inData) => {
        if (inData) {
          mode.graph.remove(inData)
        }
      }
    }
    steps.push(step4)
    return steps
  }
  /**
   * Creates a {@link WizardAction} for an edge that provides picker buttons for the edge label text.
   *
   * Besides __yes__ and __no__ options, a third option is provided that opens interactive
   * text editing for the new label text.
   * @param edge The edge the label text is provided for.
   * @param geim The input mode to trigger interactive text editing.
   */
  createSelectEdgeLabelTextAction(edge, geim) {
    return new WizardAction(
      'text',
      (mode) => true,
      async (mode, item, type) => {
        if (type === 'custom') {
          const newLabel = await geim.startLabelAddition(edge)
          if (newLabel && newLabel.text.length == 0) {
            // remove empty label but accept it as valid input
            mode.graph.remove(newLabel)
            return true
          } else {
            // when newLabel is null, the label editing was canceled
            return newLabel != null
          }
        } else {
          // 'yes' or 'no'
          mode.graph.addLabel(edge, type)
          return true
        }
      },
      null,
      '',
      {
        type: 'text',
        pickerLayout: PickerLayout.Column,
        layout: new EdgePathLabelModel({
          distance: 10,
          autoRotation: false,
          sideOfEdge: EdgeSides.BELOW_EDGE
        }).createRatioParameter(0.5, EdgeSides.BELOW_EDGE),
        pickerButtons: [
          {
            type: 'yes',
            style: { type: 'text', text: 'yes' },
            size: new Size(60, 20),
            tooltip: 'Yes'
          },
          {
            type: 'no',
            style: { type: 'text', text: 'no' },
            size: new Size(60, 20),
            tooltip: 'No'
          },
          {
            type: 'custom',
            style: { type: 'text', text: 'custom', iconPath: 'resources/icons/edit.svg' },
            size: new Size(60, 20),
            tooltip: 'Custom'
          }
        ]
      }
    )
  }
  /**
   * Creates two nodes connected to the {@link GraphWizardInputMode.currentItem currentItem} by edges,
   * runs a layout calculation and interactively adds new labels for those new nodes and edges.
   * @param mode The current {@link GraphWizardInputMode}.
   */
  async addTwoChildNodes(mode) {
    const parent = mode.currentItem
    const offset = this.getOffsetFromParent(parent)
    let childOffset1 = new Point(0, 0)
    let childOffset2 = new Point(0, 0)
    switch (this.layoutOrientation) {
      case LayoutOrientation.LEFT_TO_RIGHT:
        childOffset1 = new Point(offset.x, -offset.y)
        childOffset2 = new Point(offset.x, 0)
        break
      case LayoutOrientation.TOP_TO_BOTTOM:
        childOffset1 = new Point(-offset.x, offset.y)
        childOffset2 = new Point(0, offset.y)
        break
    }
    // combine the steps to create the two nodes so they may be canceled all together
    const node1Steps = this.createAddNodeWithEdgeSteps(mode, parent, childOffset1, true)
    const node2Steps = this.createAddNodeWithEdgeSteps(mode, parent, childOffset2)
    node1Steps.push(...node2Steps)
    return handleMultipleSteps(node1Steps)
  }
  /**
   * Returns a {@link PreCondition} that checks if the {@link GraphWizardInputMode.currentItem currentItem}
   * is a node of the given {@link FlowchartNodeType}.
   * @param type The type of flowchart node to check for.
   */
  isNodeType(type) {
    return (mode) =>
      mode.currentItem instanceof INode &&
      mode.currentItem.style instanceof FlowchartNodeStyle &&
      mode.currentItem.style.type === type
  }
}
/**
 * A {@link FlowchartLayout} using an incremental {@link HierarchicalLayout}.
 */
class IncrementalFlowchartLayout extends FlowchartLayout {
  createHierarchicalLayout() {
    const hierarchicalLayout = super.createHierarchicalLayout()
    hierarchicalLayout.fromSketchMode = true
    return hierarchicalLayout
  }
}
