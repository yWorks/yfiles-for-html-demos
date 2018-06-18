/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component', './ButtonVisualCreator.js', 'yfiles/view-editor'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  ButtonVisualCreator
) => {
  /**
   * An {@link IInputMode} which will provide buttons for edge creation for the graph component's current item.
   * When one of the buttons is dragged, a new edge with the specified style is created.
   */
  class UMLContextButtonsInputMode extends yfiles.input.InputModeBase {
    constructor() {
      super()
      this.buttonNodes = new yfiles.view.DefaultSelectionModel()
    }

    /**
     * Installs the necessary listeners of this input mode.
     * @param {yfiles.input.IInputModeContext} context the context to install this mode into
     * @param {yfiles.input.ConcurrencyController} controller The {@link yfiles.input.InputModeBase#controller} for
     *   this mode.
     */
    install(context, controller) {
      super.install(context, controller)

      // use a selection indicator manager which only "selects" the current item
      // so the buttons are only displayed for one node
      const graphComponent = context.canvasComponent
      this.manager = new MySelectionIndicatorManager(graphComponent, this.buttonNodes)

      // keep buttons updated and their add interaction
      graphComponent.addCurrentItemChangedListener(
        yfiles.lang.delegate(this.onCurrentItemChanged, this)
      )
      graphComponent.addMouseDragListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.addMouseClickListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.addTouchMoveListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.addTouchDownListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.inputMode.addCanvasClickedListener(
        yfiles.lang.delegate(this.onCanvasClicked, this)
      )
      graphComponent.graph.addNodeRemovedListener(yfiles.lang.delegate(this.onNodeRemoved, this))
    }

    /**
     * Called when the graph component's current item changed to move the buttons to the current item.
     */
    onCurrentItemChanged() {
      const graphComponent = this.inputModeContext.canvasComponent
      if (yfiles.graph.INode.isInstance(graphComponent.currentItem)) {
        this.buttonNodes.clear()
        this.buttonNodes.setSelected(graphComponent.currentItem, true)
      } else {
        this.buttonNodes.clear()
      }
    }

    /**
     * Remove the button visuals when the node is deleted.
     */
    onNodeRemoved(src, args) {
      this.buttonNodes.setSelected(args.item, false)
    }

    /**
     * Called when the mouse button is pressed to initiate edge creation in case a button is hit.
     */
    startEdgeCreation(src, args) {
      if (this.active && this.canRequestMutex()) {
        const p = args.location
        const graphComponent = this.inputModeContext.canvasComponent

        // check which node currently has the buttons and invoke create edge input mode to create a new edge
        for (let enumerator = this.buttonNodes.getEnumerator(); enumerator.moveNext(); ) {
          const buttonNode = enumerator.current
          const styleButton = ButtonVisualCreator.getStyleButtonAt(graphComponent, buttonNode, p)
          if (styleButton) {
            const parentInputMode = this.inputModeContext.parentInputMode
            if (parentInputMode instanceof yfiles.input.GraphEditorInputMode) {
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
                new yfiles.input.DefaultPortCandidate(
                  buttonNode,
                  yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
                )
              )
              const listener = () => {
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
    onCanvasClicked(src, args) {
      if (this.active && this.canRequestMutex()) {
        const p = args.location
        const graphComponent = this.inputModeContext.canvasComponent
        for (let enumerator = this.buttonNodes.getEnumerator(); enumerator.moveNext(); ) {
          const buttonNode = enumerator.current
          const contextButton = ButtonVisualCreator.getContextButtonAt(buttonNode, p)
          if (contextButton) {
            if (contextButton === 'interface') {
              const isInterface = buttonNode.style.model.stereotype === 'interface'
              buttonNode.style.model.stereotype = isInterface ? '' : 'interface'
              buttonNode.style.model.constraint = ''
              buttonNode.style.fill = isInterface
                ? new yfiles.view.SolidColorFill(0x60, 0x7d, 0x8b)
                : yfiles.view.Fill.SEA_GREEN
            } else if (contextButton === 'abstract') {
              const isAbstract = buttonNode.style.model.constraint === 'abstract'
              buttonNode.style.model.constraint = isAbstract ? '' : 'abstract'
              buttonNode.style.model.stereotype = ''
              buttonNode.style.fill = isAbstract
                ? new yfiles.view.SolidColorFill(0x60, 0x7d, 0x8b)
                : yfiles.view.Fill.CRIMSON
            }
            buttonNode.style.model.modify()
            args.handled = true
            graphComponent.invalidate()
            graphComponent.inputMode.clickInputMode.preventNextDoubleClick()
          }
        }
      }
    }

    /**
     * Removed the installed listeners when they are not needed anymore.
     * @param {yfiles.input.IInputModeContext} context - The context to remove this mode from. This is the same
     *   instance that has been passed to {@link yfiles.input.InputModeBase#install}.
     */
    uninstall(context) {
      const graphComponent = context.canvasComponent
      graphComponent.removeCurrentItemChangedListener(
        yfiles.lang.delegate(this.onCurrentItemChanged, this)
      )
      graphComponent.removeMouseDragListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.removeMouseClickListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.removeTouchMoveListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.removeTouchDownListener(yfiles.lang.delegate(this.startEdgeCreation, this))
      graphComponent.inputMode.removeCanvasClickedListener(
        yfiles.lang.delegate(this.onCanvasClicked, this)
      )
      graphComponent.graph.removeNodeRemovedListener(yfiles.lang.delegate(this.onNodeRemoved, this))
      this.buttonNodes.clear()
      this.manager.dispose()
      this.manager = null
      super.uninstall(context)
    }
  }

  /**
   * A selection manager that draws the selection visualization in front of the input mode objects, such that
   * the edge creation buttons are drawn on top of the selected etc.
   */
  class MySelectionIndicatorManager extends yfiles.view.ModelManager {
    constructor(canvas, model) {
      super(canvas)
      this.model = model
      this.buttonGroup = canvas.inputModeGroup.addGroup()
      this.model.addItemSelectionChangedListener(yfiles.lang.delegate(this.selectionChanged, this))
    }

    /**
     * @param {T} item The item to find an installer for.
     * @returns {yfiles.view.ICanvasObjectInstaller}
     */
    getInstaller(item) {
      return new yfiles.view.ISelectionIndicatorInstaller(
        (iCanvasContext, iCanvasObjectGroup, node) =>
          iCanvasObjectGroup.addChild(
            new ButtonVisualCreator(node, this.canvasComponent),
            yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
          )
      )
    }

    /**
     * @param {T} item The item to find a canvas object group for.
     * @returns {yfiles.view.ICanvasObjectGroup}
     */
    getCanvasObjectGroup(item) {
      return this.buttonGroup
    }

    /**
     * Called when the selection of the internal model changes.
     * @param {Object} src
     * @param {yfiles.view.ItemSelectionChangedEventArgs} args
     */
    selectionChanged(src, args) {
      if (args.itemSelected) {
        this.add(args.item)
      } else {
        this.remove(args.item)
      }
    }

    /**
     * Cleanup the selection manager.
     */
    dispose() {
      this.model.removeItemSelectionChangedListener(
        yfiles.lang.delegate(this.selectionChanged, this)
      )
      this.buttonGroup.remove()
    }

    onDisabled() {}

    onEnabled() {}
  }

  return UMLContextButtonsInputMode
})
