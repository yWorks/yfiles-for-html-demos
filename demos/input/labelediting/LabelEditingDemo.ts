/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  KeyEventArgs,
  License,
  Point,
  Size
} from 'yfiles'

import CustomEditLabelHelper from './CustomEditLabelHelper'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * The default pattern for label validation.
 */
const DefaultValidationPattern = '^\\w+@\\w+\\.\\w+$'

/**
 * Whether label text validation is used at all.
 */
let validationEnabled = false

/**
 * Precompiled Regex matcher from the validation pattern.
 */
let validationPattern = new RegExp(DefaultValidationPattern)

/**
 * Whether to use custom label helpers.
 */
let customHelperEnabled = false

/**
 * Whether to automatically start editing the label on key press.
 */
let instantTypingEnabled = false

let graphComponent: GraphComponent

let graphEditorInputMode: GraphEditorInputMode

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initDemoStyles(graphComponent.graph)
  graphComponent.graph.nodeDefaults.size = new Size(100, 100)

  initializeInputModes()

  createSampleGraph()

  initializeUI()
}

/**
 * Initializes the input modes for this demo.
 */
function initializeInputModes(): void {
  graphEditorInputMode = createEditorMode()
  graphComponent.inputMode = graphEditorInputMode

  // Custom label helpers
  registerCustomEditLabelHelper()

  // Register custom event handler for the instant typing feature
  graphComponent.addKeyPressListener(handleInstantTyping)
}

/**
 * Creates the default input mode for the GraphComponent, a {@link GraphEditorInputMode}.
 *
 * This implementation configures label text validation.
 * @returns A new GraphEditorInputMode instance
 */
function createEditorMode(): GraphEditorInputMode {
  const graphEditorInputMode = new GraphEditorInputMode()

  // Configure label text validation
  // Note that by default, no visual feedback is provided, the text is just not changed
  graphEditorInputMode.addValidateLabelTextListener((_, evt) => {
    // label must match the pattern
    evt.validatedText = validateText(evt.newText)
    // validatedText also accepts asynchronous calls e.g.:
    //args.validatedText = validateTextAsync(args.newText)
  })

  return graphEditorInputMode
}

/**
 * Validates the new text and returns null, if the text is invalid.
 * @param newText The new text to validate.
 */
function validateText(newText: string): string | null {
  const cancel = validationEnabled && !validationPattern.test(newText)
  return cancel ? null : newText
}

/**
 * Validates the new text asynchronously and returns null, if the text is invalid.
 * @param newText The new text to validate.
 */
async function validateTextAsync(newText: string): Promise<string | null> {
  // simulate awaiting a database access for validation
  await fakeDatabaseAccess(2000)
  // finally validate the new text
  return validateText(newText)
}

/**
 * Fakes an asynchronous data base access using a timeout.
 * @param time The time to set the timeout to.
 */
async function fakeDatabaseAccess(time: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, time))
}

/**
 * Registers custom label helpers for nodes and node labels
 */
function registerCustomEditLabelHelper(): void {
  const firstLabelStyle = new DefaultLabelStyle({
    textFill: 'firebrick'
  })

  // Register the helper for both nodes and edges, but only when the global flag ist set
  // We can use more or less the same implementation for both items, so we just change the item to which the helper
  // is bound The decorator on nodes is called when a label should be added or the label does not provide its own
  // label helper
  graphComponent.graph.decorator.nodeDecorator.editLabelHelperDecorator.setFactory(
    () => customHelperEnabled,
    (node) => new CustomEditLabelHelper(node, null, ExteriorLabelModel.NORTH, firstLabelStyle)
  )
  // The decorator on labels is called when a label is edited
  graphComponent.graph.decorator.labelDecorator.editLabelHelperDecorator.setFactory(
    () => customHelperEnabled,
    (label) => new CustomEditLabelHelper(null, label, ExteriorLabelModel.NORTH, firstLabelStyle)
  )
}

/**
 * Event handler that implements "instant typing"
 */
function handleInstantTyping(sender: object, args: KeyEventArgs): void {
  // if nothing is selected, we try using the "current item" of the GraphComponent, instead
  const parameter = graphComponent.selection.size === 0 ? graphComponent.currentItem : null

  if (!instantTypingEnabled || !ICommand.EDIT_LABEL.canExecute(parameter, graphComponent)) {
    return
  }

  // Raise the edit command...
  ICommand.EDIT_LABEL.execute(parameter, graphComponent)
  // ... and populate the text box with the pressed key.
  graphEditorInputMode.textEditorInputMode.editorText = String.fromCharCode(args.charCode)
  // Also prevent the TextEditorInputMode from handling this event, as we already handled it.
  args.preventDefault()
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  const labelCreation = document.querySelector<HTMLInputElement>('#labelCreation')!
  labelCreation.addEventListener('change', (evt) => {
    graphEditorInputMode.allowAddLabel = labelCreation.checked
  })
  const labelEditing = document.querySelector<HTMLInputElement>('#labelEditing')!
  labelEditing.addEventListener('change', (evt) => {
    graphEditorInputMode.allowEditLabel = labelEditing.checked
  })
  const hideLabel = document.querySelector<HTMLInputElement>('#hideLabel')!
  hideLabel.addEventListener('change', (evt) => {
    graphEditorInputMode.hideLabelDuringEditing = hideLabel.checked
  })
  const instantTyping = document.querySelector<HTMLInputElement>('#instantTyping')!
  instantTyping.addEventListener('change', (evt) => (instantTypingEnabled = instantTyping.checked))
  const customLabelHelper = document.querySelector<HTMLInputElement>('#customLabelHelper')!
  customLabelHelper.addEventListener(
    'change',
    (evt) => (customHelperEnabled = customLabelHelper.checked)
  )

  const nodesEnabled = document.querySelector<HTMLInputElement>('#nodesEnabled')!
  nodesEnabled.addEventListener('change', (evt) => {
    if (nodesEnabled.checked) {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems | GraphItemTypes.NODE | GraphItemTypes.NODE_LABEL
    } else {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems & ~(GraphItemTypes.NODE | GraphItemTypes.NODE_LABEL)
    }
  })
  const edgesEnabled = document.querySelector<HTMLInputElement>('#edgesEnabled')!
  edgesEnabled.addEventListener('change', (evt) => {
    if (edgesEnabled.checked) {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
    } else {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems & ~(GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL)
    }
  })

  const validationEnabledElement = document.querySelector<HTMLInputElement>('#validationEnabled')!
  const validationPatternElement = document.querySelector<HTMLInputElement>('#validationPattern')!
  validationEnabledElement.addEventListener('change', (evt) => {
    const checked = validationEnabledElement.checked
    validationEnabled = checked
    validationPatternElement.disabled = !checked
  })
  validationPatternElement.addEventListener('input', (e) => {
    try {
      validationPattern = new RegExp(validationPatternElement.value)
    } catch (ex) {
      // invalid or unfinished regex, ignore
    }
  })
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(): void {
  const graph = graphComponent.graph
  const n1 = graph.createNodeAt(new Point(0, 0))
  graph.addLabel(n1, 'Node Label')
  const n2 = graph.createNodeAt(new Point(250, 0))
  const edge = graph.createEdge(n1, n2)
  graph.addLabel(edge, 'Edge label')
  graphComponent.fitGraphBounds()
}

run().then(finishLoading)
