/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ConcurrencyController,
  DefaultPortCandidate,
  DefaultSelectionModel,
  Fill,
  FreeNodePortLocationModel,
  GraphEditorInputMode,
  ICanvasObjectDescriptor,
  IInputMode,
  IInputModeContext,
  INode,
  InputModeBase,
  ISelectionIndicatorInstaller,
  ModelManager,
  Point,
  SolidColorFill,
  ClickEventArgs,
  ICanvasObjectInstaller,
  ICanvasObjectGroup,
  GraphComponent,
  ISelectionModel,
  ICanvasContext,
  PropertyChangedEventArgs,
  NodeEventArgs,
  MouseEventArgs,
  TouchEventArgs,
  ItemSelectionChangedEventArgs,
  IEnumerator
} from 'yfiles'

import ButtonVisualCreator from './ButtonVisualCreator'
import { UMLNodeStyle } from './UMLNodeStyle'

/**
 * An {@link IInputMode} which will provide buttons for edge creation for the graph component's
 * current item. When one of the buttons is dragged, a new edge with the specified style is
 * created.
 */
export default class UMLContextButtonsInputMode extends InputModeBase {
  private buttonNodes: DefaultSelectionModel<INode>
  private onCurrentItemChangedListener: (sender: object, args: PropertyChangedEventArgs) => void
  private onCanvasClickedListener: (sender: object, args: ClickEventArgs) => void
  private onNodeRemovedListener: (sender: object, evt: NodeEventArgs) => void
  private startEdgeCreationListener: (sender: object, evt: MouseEventArgs | TouchEventArgs) => void
  private manager: MySelectionIndicatorManager | null

  constructor() {
    super()
    this.buttonNodes = new DefaultSelectionModel<INode>()

    // initializes listener functions in order to install/uninstall them
    this.onCurrentItemChangedListener = (sender, evt) => this.onCurrentItemChanged()
    this.onCanvasClickedListener = (sender, evt) => this.onCanvasClicked(evt)
    this.onNodeRemovedListener = (sender, evt) => this.onNodeRemoved(evt.item)
    this.startEdgeCreationListener = (sender, evt) => this.startEdgeCreation(evt.location)

    this.manager = null
  }

  /**
   * Installs the necessary listeners of this input mode.
   * @param context the context to install this mode into
   * @param controller The {@link InputModeBase#controller} for
   *   this mode.
   */
  install(context: IInputModeContext, controller: ConcurrencyController): void {
    super.install(context, controller)

    // use a selection indicator manager which only "selects" the current item
    // so the buttons are only displayed for one node
    const graphComponent = getGraphComponentFromContext(context)
    this.manager = new MySelectionIndicatorManager(graphComponent, this.buttonNodes)

    // keep buttons updated and their add interaction
    graphComponent.addCurrentItemChangedListener(this.onCurrentItemChangedListener)
    graphComponent.addMouseDragListener(this.startEdgeCreationListener)
    graphComponent.addMouseClickListener(this.startEdgeCreationListener)
    graphComponent.addTouchMoveListener(this.startEdgeCreationListener)
    graphComponent.addTouchDownListener(this.startEdgeCreationListener)
    ;(graphComponent.inputMode as GraphEditorInputMode).addCanvasClickedListener(
      this.onCanvasClickedListener
    )
    ;(graphComponent.inputMode as GraphEditorInputMode).addItemClickedListener(
      this.onCanvasClickedListener
    )
    graphComponent.graph.addNodeRemovedListener(this.onNodeRemovedListener)
  }

  /**
   * Called when the graph component's current item changed to move the buttons to the current item.
   */
  onCurrentItemChanged(): void {
    const graphComponent = this.inputModeContext!.canvasComponent as GraphComponent
    if (INode.isInstance(graphComponent.currentItem)) {
      this.buttonNodes.clear()
      this.buttonNodes.setSelected(graphComponent.currentItem, true)
    } else {
      this.buttonNodes.clear()
    }
  }

  /**
   * Remove the button visuals when the node is deleted.
   */
  onNodeRemoved(item: INode): void {
    this.buttonNodes.setSelected(item, false)
  }

  /**
   * Called when the mouse button is pressed to initiate edge creation in case a button is hit.
   */
  startEdgeCreation(location: Point): void {
    if (this.active && this.canRequestMutex()) {
      const graphComponent = this.getGraphComponent()

      // check which node currently has the buttons and invoke create edge input mode to create a new edge
      for (const buttonNode of this.buttonNodes) {
        const styleButton = ButtonVisualCreator.getStyleButtonAt(
          graphComponent,
          buttonNode,
          location
        )
        if (styleButton) {
          const parentInputMode = this.inputModeContext!.parentInputMode
          if (parentInputMode instanceof GraphEditorInputMode) {
            const createEdgeInputMode = parentInputMode.createEdgeInputMode

            // initialize dummy edge
            const umlEdgeType = styleButton
            const dummyEdgeGraph = createEdgeInputMode.dummyEdgeGraph
            const dummyEdge = createEdgeInputMode.dummyEdge
            dummyEdgeGraph.setStyle(dummyEdge, umlEdgeType)
            dummyEdgeGraph.edgeDefaults.style = umlEdgeType

            // start edge creation and hide buttons until the edge is finished
            this.buttonNodes.clear()
            createEdgeInputMode.doStartEdgeCreation(
              new DefaultPortCandidate(buttonNode, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
            )
            const listener = (): void => {
              graphComponent.selection.clear()
              graphComponent.currentItem = null
              createEdgeInputMode.removeGestureCanceledListener(listener)
              createEdgeInputMode.removeGestureFinishedListener(listener)
            }
            createEdgeInputMode.addGestureFinishedListener(listener)
            createEdgeInputMode.addGestureCanceledListener(listener)
            return
          }
        }
      }
    }
  }

  /**
   * Check whether a context button has been clicked.
   */
  onCanvasClicked(evt: ClickEventArgs): void {
    const location = evt.location
    if (this.active && this.canRequestMutex()) {
      const graphComponent = this.getGraphComponent()
      for (let enumerator = this.buttonNodes.getEnumerator(); enumerator.moveNext(); ) {
        const buttonNode = enumerator.current
        const contextButton = ButtonVisualCreator.getContextButtonAt(buttonNode, location)
        if (contextButton && buttonNode.style instanceof UMLNodeStyle) {
          if (contextButton === 'interface') {
            const isInterface = buttonNode.style.model.stereotype === 'interface'
            buttonNode.style.model.stereotype = isInterface ? '' : 'interface'
            buttonNode.style.model.constraint = ''
            buttonNode.style.fill = isInterface
              ? new SolidColorFill(0x60, 0x7d, 0x8b)
              : Fill.SEA_GREEN
          } else if (contextButton === 'abstract') {
            const isAbstract = buttonNode.style.model.constraint === 'abstract'
            buttonNode.style.model.constraint = isAbstract ? '' : 'abstract'
            buttonNode.style.model.stereotype = ''
            buttonNode.style.fill = isAbstract ? new SolidColorFill(0x60, 0x7d, 0x8b) : Fill.CRIMSON
          }
          evt.handled = true
          buttonNode.style.model.modify()
          graphComponent.invalidate()
          ;(
            graphComponent.inputMode as GraphEditorInputMode
          ).clickInputMode.preventNextDoubleClick()
        }
      }
    }
  }

  /**
   * Removed the installed listeners when they are not needed anymore.
   * @param context - The context to remove this mode from. This is the same
   *   instance that has been passed to {@link InputModeBase#install}.
   */
  uninstall(context: IInputModeContext): void {
    const graphComponent = getGraphComponentFromContext(context)
    graphComponent.removeCurrentItemChangedListener(this.onCurrentItemChangedListener)
    graphComponent.removeMouseDragListener(this.startEdgeCreationListener)
    graphComponent.removeMouseClickListener(this.startEdgeCreationListener)
    graphComponent.removeTouchMoveListener(this.startEdgeCreationListener)
    graphComponent.removeTouchDownListener(this.startEdgeCreationListener)
    ;(graphComponent.inputMode as GraphEditorInputMode).removeItemClickedListener(
      this.onCanvasClickedListener
    )
    ;(graphComponent.inputMode as GraphEditorInputMode).removeCanvasClickedListener(
      this.onCanvasClickedListener
    )
    graphComponent.graph.removeNodeRemovedListener(this.onNodeRemovedListener)
    this.buttonNodes.clear()
    this.manager!.dispose()
    this.manager = null
    super.uninstall(context)
  }

  private getGraphComponent(): GraphComponent {
    return getGraphComponentFromContext(this.inputModeContext!)
  }
}

function getGraphComponentFromContext(context: IInputModeContext): GraphComponent {
  return context.canvasComponent as GraphComponent
}

/**
 * A selection manager that draws the selection visualization in front of the input mode objects,
 * such that the edge creation buttons are drawn on top of the selected etc.
 */
class MySelectionIndicatorManager extends ModelManager<INode> {
  private model: ISelectionModel<INode>
  private buttonGroup: ICanvasObjectGroup
  private selectionChangedListener: (
    sender: object,
    evt: ItemSelectionChangedEventArgs<INode>
  ) => void

  constructor(canvas: GraphComponent, model: ISelectionModel<INode>) {
    super(canvas)
    this.model = model
    this.buttonGroup = canvas.inputModeGroup.addGroup()
    this.selectionChangedListener = (sender: object, evt: ItemSelectionChangedEventArgs<INode>) =>
      this.selectionChanged(evt.item, evt.itemSelected)
    this.model.addItemSelectionChangedListener(this.selectionChangedListener)
  }

  /**
   * @param item The item to find an installer for.
   */
  getInstaller(item: INode): ICanvasObjectInstaller {
    return ISelectionIndicatorInstaller.create(
      (context: ICanvasContext, group: ICanvasObjectGroup, node: INode) =>
        group.addChild(
          new ButtonVisualCreator(node, this.canvasComponent as GraphComponent),
          ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
        )
    )
  }

  /**
   * @param item The item to find a canvas object group for.
   */
  getCanvasObjectGroup(item: INode): ICanvasObjectGroup {
    return this.buttonGroup
  }

  /**
   * Called when the selection of the internal model changes.
   * @param item The item that is the subject of the event
   * @param itemSelected Whether the item is selected
   */
  selectionChanged(item: INode, itemSelected: boolean): void {
    if (itemSelected) {
      this.add(item)
    } else {
      this.remove(item)
    }
  }

  /**
   * Cleanup the selection manager.
   */
  dispose(): void {
    this.model.removeItemSelectionChangedListener(this.selectionChangedListener)
    this.buttonGroup.remove()
  }

  onDisabled(): void {}

  onEnabled(): void {}
}
