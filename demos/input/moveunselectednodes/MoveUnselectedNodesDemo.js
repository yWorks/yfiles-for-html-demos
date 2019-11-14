/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

/**
 * Shows how to use and configure the {@link yfiles.input.GraphEditorInputMode#moveUnselectedInputMode}.
 * This special move input mode can be used to move nodes without selecting them first.
 */
require(['yfiles/view-editor', 'resources/demo-app', 'resources/license'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.input.MoveInputMode} */
  let moveUnselectedInputMode = null

  function run() {
    // initialize the GraphComponent
    initializeGraph()

    initializeInputModes()

    registerCommands()

    // pre-select the 'Drag at Top' mode
    document.querySelector("select[data-command='moveModeChanged']").value = 'Drag at Top'
    onMoveModeChanged()

    app.show(graphComponent)
  }

  /**
   * Initializes the graph instance setting default styles and creating a small sample graph.
   */
  function initializeGraph() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    const graph = graphComponent.graph

    // set the default node style
    graph.nodeDefaults.style = new yfiles.styles.PanelNodeStyle({
      color: 'orange',
      labelInsetsColor: 'gold',
      insets: [20, 5, 5, 5]
    })
    graph.nodeDefaults.size = new yfiles.geometry.Size(60, 80)
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.InteriorLabelModel.NORTH

    // Create a sample node
    graph.addLabel(graph.createNode(), 'Node')

    graphComponent.fitGraphBounds()
  }

  /**
   * Creates and registers the input modes.
   */
  function initializeInputModes() {
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode()

    // Always add a label to the newly created nodes
    graphEditorInputMode.nodeCreator = (context, graph, location, parent) => {
      const node = graph.createNodeAt(location)
      graph.addLabel(node, 'Node')
      return node
    }

    // Enable the MoveUnselectedInputMode
    moveUnselectedInputMode = graphEditorInputMode.moveUnselectedInputMode
    moveUnselectedInputMode.enabled = true
    // The recognizers should behave differently, depending on what mode is selected in the demo
    moveUnselectedInputMode.pressedRecognizer = yfiles.input.EventRecognizers.createAndRecognizer(
      moveUnselectedInputMode.pressedRecognizer,
      isRecognized
    )
    moveUnselectedInputMode.hoverRecognizer = yfiles.input.EventRecognizers.createAndRecognizer(
      moveUnselectedInputMode.hoverRecognizer,
      isRecognized
    )

    graphComponent.inputMode = graphEditorInputMode
  }

  /**
   * Called when the mode combo box has changed:
   * if necessary it changes the hit testable for the move input mode
   */
  function onMoveModeChanged() {
    const selectedIndex = document.getElementById('moveModeComboBox').selectedIndex
    if (selectedIndex === 2) {
      // mode 2 (only top region): set a custom hit testable which detects hits only at the top of the nodes
      moveUnselectedInputMode.hitTestable = new TopInsetsHitTestable(
        moveUnselectedInputMode.hitTestable,
        graphComponent.inputMode
      )
    } else if (moveUnselectedInputMode.hitTestable instanceof TopInsetsHitTestable) {
      // all other modes: if a TopInsetsHitTestable is the current hit testable, restore the original hit testable
      moveUnselectedInputMode.hitTestable = moveUnselectedInputMode.hitTestable.original
    }
    document.getElementById('toggleMoveEnabled').disabled = selectedIndex !== 3
  }

  /**
   * A custom EventRecognizer to be used as modifier recognizer.
   *
   * Has to return true if the move input mode is allowed to move a node.
   * @param {object} source
   * @param {yfiles.lang.EventArgs} args
   * @return {boolean}
   */
  function isRecognized(source, args) {
    // return the value according to the Mode combo box
    switch (document.getElementById('moveModeComboBox').selectedIndex) {
      case 0: // always
      case 2: // on top (this is handled by custom IHitTestable)
        // the same as only enabling the MoveUnselectedInputMode without changing the recognizers
        return true
      case 1: // shift is not pressed
        return !yfiles.input.KeyEventRecognizers.SHIFT_IS_DOWN(source, args)
      case 3: // if enabled
        return document.getElementById('toggleMoveEnabled').checked
      default:
        return false
    }
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindChangeListener("select[data-command='moveModeChanged']", onMoveModeChanged)

    app.bindAction("input[data-command='ToggleClassicMode']", () => {
      graphComponent.inputMode.moveInputMode.enabled = !graphComponent.inputMode.moveInputMode
        .enabled
    })
  }

  /**
   * An IHitTestable implementation which detects hits only on top insets of a node.
   *
   * This instance keeps a reference to the original hit testable
   * so the original behavior can be restored conveniently.
   * @implements {yfiles.input.IHitTestable}
   */
  class TopInsetsHitTestable extends yfiles.lang.Class(yfiles.input.IHitTestable) {
    /**
     * Creates a new instance of <code>TopInsetsHitTestable</code>.
     * @param {yfiles.input.IHitTestable} original
     * @param {yfiles.input.GraphEditorInputMode} inputMode
     */
    constructor(original, inputMode) {
      super()
      this.$original = original
      this.$inputMode = inputMode
    }

    /**
     * Gets the original hit testable.
     * @return {yfiles.input.IHitTestable|*}
     */
    get original() {
      return this.$original
    }

    /**
     * Test whether the given location is a valid hit.
     *
     * The hit is considered as valid if the location lies inside a node's top insets.
     * @param {yfiles.input.IInputModeContext} context - The current input mode context.
     * @param {yfiles.geometry.Point} location - The location to test.
     * @return {boolean}
     */
    isHit(context, location) {
      // Get the current hit tester from the input mode context
      const /** @type {yfiles.input.IHitTester} */ hitTester = this.$inputMode.inputModeContext.lookup(
        yfiles.input.IHitTester.$class
      )
      if (hitTester !== null) {
        // get an enumerator over all elements at the given location
        const hits = hitTester.enumerateHits(this.$inputMode.inputModeContext, location)
        const enumerator = hits.getEnumerator()
        while (enumerator.moveNext()) {
          const item = enumerator.current
          // if the element is a node and its lookup returns an INodeInsetsProvider
          if (yfiles.graph.INode.isInstance(item)) {
            const insetsProvider = item.lookup(yfiles.input.INodeInsetsProvider.$class)
            if (insetsProvider !== null) {
              // determine whether the given location lies inside the top insets
              const insets = insetsProvider.getInsets(item)
              if (
                new yfiles.geometry.Rect(
                  item.layout.x,
                  item.layout.y,
                  item.layout.width,
                  insets.top
                ).contains(location)
              ) {
                // if so: return true
                return true
              }
              // else: continue iteration
            }
          }
        }
      }
      // no hits found: return false
      return false
    }
  }

  // run the demo
  run()
})
