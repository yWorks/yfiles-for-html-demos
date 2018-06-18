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

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

/**
 * Shows customizations of the interactive label editing.
 * It shows the following features:
 * <ul>
 *   <li>{@link yfiles.input.GraphEditorInputMode} properties</li>
 *   <li>Input validation</li>
 *   <li>Instant typing</li>
 *   <li>Custom {@link yfiles.input.IEditLabelHelper}</li>
 *   <li>Dummy label creation and editing</li>
 * </ul>
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'CustomEditLabelHelper.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  CustomEditLabelHelper
) => {
  /**
   * The default pattern for label validation.
   * @type {string}
   */
  const DefaultValidationPattern = '^\\w+@\\w+\\.\\w+$'

  /**
   * Whether label text validation is used at all.
   * @type {boolean}
   */
  let validationEnabled = false

  /**
   * Precompiled Regex matcher from the validation pattern.
   * @type {RegExp}
   */
  let validationPattern = new RegExp(DefaultValidationPattern)

  /**
   * Whether to use custom label helpers.
   * @type {boolean}
   */
  let customHelperEnabled = false

  /**
   * Whether to automatically start editing the label on key press.
   * @type {boolean}
   */
  let instantTypingEnabled = false

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    DemoStyles.initDemoStyles(graphComponent.graph)
    graphComponent.graph.nodeDefaults.size = new yfiles.geometry.Size(100, 100)

    initializeInputModes()

    createSampleGraph()

    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the input modes for this demo.
   */
  function initializeInputModes() {
    graphComponent.inputMode = createEditorMode()

    // Custom label helpers
    registerCustomEditLabelHelper()

    // Register custom event handler for the instant typing feature
    graphComponent.addKeyPressListener(handleInstantTyping)
  }

  /**
   * Creates the default input mode for the GraphComponent, a {@link yfiles.input.GraphEditorInputMode}.
   *
   * This implementation configures label text validation.
   * @return {yfiles.input.IInputMode} A new GraphEditorInputMode instance
   */
  function createEditorMode() {
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode()

    // Configure label text validation
    // Note that by default, no visual feedback is provided, the text is just not changed
    graphEditorInputMode.addValidateLabelTextListener((o, args) => {
      // label must match the pattern
      args.cancel = validationEnabled && !validationPattern.test(args.newText)
    })

    return graphEditorInputMode
  }

  /**
   * Registers custom label helpers for nodes and node labels
   */
  function registerCustomEditLabelHelper() {
    const firstLabelStyle = new yfiles.styles.DefaultLabelStyle({
      textFill: yfiles.view.Fill.FIREBRICK
    })

    // Register the helper for both nodes and edges, but only when the global flag ist set
    // We can use more or less the same implementation for both items, so we just change the item to which the helper
    // is bound The decorator on nodes is called when a label should be added or the label does not provide its own
    // label helper
    graphComponent.graph.decorator.nodeDecorator.editLabelHelperDecorator.setFactory(
      node => customHelperEnabled,
      node =>
        new CustomEditLabelHelper(
          node,
          null,
          yfiles.graph.ExteriorLabelModel.NORTH,
          firstLabelStyle
        )
    )
    // The decorator on labels is called when a label is edited
    graphComponent.graph.decorator.labelDecorator.editLabelHelperDecorator.setFactory(
      label => customHelperEnabled,
      label =>
        new CustomEditLabelHelper(
          null,
          label,
          yfiles.graph.ExteriorLabelModel.NORTH,
          firstLabelStyle
        )
    )
  }

  /**
   * Event handler that implements "instant typing"
   * @param {object} sender
   * @param {yfiles.view.KeyEventArgs} args
   */
  function handleInstantTyping(sender, args) {
    // if nothing is selected, we try using the "current item" of the GraphComponent, instead
    const parameter = graphComponent.selection.size === 0 ? graphComponent.currentItem : null

    if (
      !instantTypingEnabled ||
      !yfiles.input.ICommand.EDIT_LABEL.canExecute(parameter, graphComponent)
    ) {
      return
    }

    // Raise the edit command...
    yfiles.input.ICommand.EDIT_LABEL.execute(parameter, graphComponent)
    // ... and populate the text box with the pressed key.
    graphComponent.inputMode.textEditorInputMode.editorText = String.fromCharCode(args.charCode)
    // Also prevent the TextEditorInputMode from handling this event, as we already handled it.
    args.preventDefault()
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

    app.bindChangeListener('#labelCreation', val => {
      graphComponent.inputMode.allowAddLabel = val
    })
    app.bindChangeListener('#labelEditing', val => {
      graphComponent.inputMode.allowEditLabel = val
    })
    app.bindChangeListener('#hideLabel', val => {
      graphComponent.inputMode.hideLabelDuringEditing = val
    })
    app.bindChangeListener('#instantTyping', val => {
      instantTypingEnabled = val
    })
    app.bindChangeListener('#customLabelHelper', val => {
      customHelperEnabled = val
    })

    app.bindChangeListener('#nodesEnabled', val => {
      if (val) {
        graphComponent.inputMode.labelEditableItems |=
          yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.NODE_LABEL
      } else {
        graphComponent.inputMode.labelEditableItems &= ~(
          yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.NODE_LABEL
        )
      }
    })
    app.bindChangeListener('#edgesEnabled', val => {
      if (val) {
        graphComponent.inputMode.labelEditableItems |=
          yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.EDGE_LABEL
      } else {
        graphComponent.inputMode.labelEditableItems &= ~(
          yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.EDGE_LABEL
        )
      }
    })

    app.bindChangeListener('#validationEnabled', val => {
      validationEnabled = val
      document.querySelector('#validationPattern').disabled = !val
    })

    document.querySelector('#validationPattern').addEventListener('input', e => {
      try {
        validationPattern = new RegExp(e.target.value)
      } catch (ex) {
        // invalid or unfinished regex, ignore
      }
    })
  }

  /**
   * Creates the sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph
    const n1 = graph.createNodeAt(new yfiles.geometry.Point(0, 0))
    graph.addLabel(n1, 'Node Label')
    const n2 = graph.createNodeAt(new yfiles.geometry.Point(250, 0))
    const edge = graph.createEdge(n1, n2)
    graph.addLabel(edge, 'Edge label')
    graphComponent.fitGraphBounds()
  }

  // run the demo
  run()
})
