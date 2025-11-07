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
  ExteriorNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ILabel,
  ILabelOwner,
  LabelStyle,
  License,
  Point,
  Size
} from '@yfiles/yfiles'

import { CustomEditLabelHelper } from './CustomEditLabelHelper'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

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

let graphComponent

let graphEditorInputMode

async function run() {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  initDemoStyles(graphComponent.graph)
  graphComponent.graph.nodeDefaults.size = new Size(100, 100)

  initializeInputModes()

  createSampleGraph()

  initializeUI()
}

/**
 * Initializes the input modes for this demo.
 */
function initializeInputModes() {
  graphEditorInputMode = createEditorMode()
  graphComponent.inputMode = graphEditorInputMode

  // Custom label helpers
  registerCustomEditLabelHelper()

  // Register custom event handler for the instant typing feature
  graphComponent.addEventListener('key-down', handleInstantTyping)
}

/**
 * Creates the default input mode for the GraphComponent, a {@link GraphEditorInputMode}.
 *
 * This implementation configures label text validation.
 * @returns A new GraphEditorInputMode instance
 */
function createEditorMode() {
  const graphEditorInputMode = new GraphEditorInputMode()

  // Configure label text validation
  // Note that by default, no visual feedback is provided, the text is just not changed
  graphEditorInputMode.editLabelInputMode.addEventListener('validate-label-text', (evt) => {
    // label must match the pattern
    evt.validatedText = validateText(evt.newText)
    // validatedText also accepts asynchronous calls e.g.:
    if (false) {
      evt.validatedText = validateTextAsync(evt.newText)
    }
  })

  // register a key listener on the text editor that validates the text and applies a CSS class
  const textEditorInputMode = graphEditorInputMode.editLabelInputMode.textEditorInputMode
  const editorContainer = textEditorInputMode.editorContainer
  editorContainer.addEventListener('keyup', () => {
    if (validationEnabled && !validationPattern.test(textEditorInputMode.editorText)) {
      editorContainer.classList.add('invalid')
    } else {
      editorContainer.classList.remove('invalid')
    }
  })
  return graphEditorInputMode
}

/**
 * Validates the new text and returns null, if the text is invalid.
 * @param newText The new text to validate.
 */
function validateText(newText) {
  const cancel = validationEnabled && !validationPattern.test(newText)
  return cancel ? null : newText
}

/**
 * Validates the new text asynchronously and returns null, if the text is invalid.
 * @param newText The new text to validate.
 */
async function validateTextAsync(newText) {
  // simulate awaiting a database access for validation
  await fakeDatabaseAccess(2000)
  // finally validate the new text
  return validateText(newText)
}

/**
 * Fakes an asynchronous data base access using a timeout.
 * @param time The time to set the timeout to.
 */
async function fakeDatabaseAccess(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

/**
 * Registers custom label helpers for nodes and node labels
 */
function registerCustomEditLabelHelper() {
  const firstLabelStyle = new LabelStyle({ textFill: 'firebrick' })

  // Register the helper for both nodes and edges, but only when the global flag ist set
  // We can use more or less the same implementation for both items, so we just change the item to which the helper
  // is bound The decorator on nodes is called when a label should be added or the label does not provide its own
  // label helper
  graphComponent.graph.decorator.nodes.editLabelHelper.addFactory(
    () => customHelperEnabled,
    (node) => new CustomEditLabelHelper(node, null, ExteriorNodeLabelModel.TOP, firstLabelStyle)
  )
  // The decorator on labels is called when a label is edited
  graphComponent.graph.decorator.labels.editLabelHelper.addFactory(
    () => customHelperEnabled,
    (label) => new CustomEditLabelHelper(null, label, ExteriorNodeLabelModel.TOP, firstLabelStyle)
  )
}

function getEditableItem() {
  const currentItem = graphComponent.currentItem
  if (currentItem && graphComponent.selection.includes(currentItem)) {
    return currentItem
  }
  return graphComponent.selection.at(0) ?? null
}

function isTextEditing() {
  const inputMode = graphComponent.inputMode
  return inputMode.editLabelInputMode.textEditorInputMode.editing
}

/**
 * Event handler that implements "instant typing"
 */
function handleInstantTyping(args) {
  // Start editing only for printable characters.
  if (!instantTypingEnabled || args.key?.length !== 1 || isTextEditing()) {
    return
  }

  // Prevent the TextEditorInputMode from handling this event, as we already handled it.
  args.preventDefault()

  const item = getEditableItem()
  const editLabelInputMode = graphEditorInputMode.editLabelInputMode

  // Trigger the label editor.
  if (item instanceof ILabelOwner) {
    if (item.labels.size > 0) {
      void editLabelInputMode.startLabelEditing(item.labels.at(0))
    } else {
      void editLabelInputMode.startLabelAddition(item)
    }
  } else if (item instanceof ILabel) {
    void editLabelInputMode.startLabelEditing(item)
  }

  // Set the text of the input box after the editor is triggered but without awaiting its promise.
  // This ensures that the pressed character, which started the instant label editing, is its input.
  editLabelInputMode.textEditorInputMode.editorText = args.key
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  const labelCreation = document.querySelector('#labelCreation')
  labelCreation.addEventListener('change', () => {
    graphEditorInputMode.allowAddLabel = labelCreation.checked
  })
  const labelEditing = document.querySelector('#labelEditing')
  labelEditing.addEventListener('change', () => {
    graphEditorInputMode.allowEditLabel = labelEditing.checked
  })
  const hideLabel = document.querySelector('#hideLabel')
  hideLabel.addEventListener('change', () => {
    graphEditorInputMode.editLabelInputMode.hideLabelDuringEditing = hideLabel.checked
  })
  const instantTyping = document.querySelector('#instantTyping')
  instantTyping.addEventListener('change', () => (instantTypingEnabled = instantTyping.checked))
  const customLabelHelper = document.querySelector('#customLabelHelper')
  customLabelHelper.addEventListener(
    'change',
    () => (customHelperEnabled = customLabelHelper.checked)
  )

  const nodesEnabled = document.querySelector('#nodesEnabled')
  nodesEnabled.addEventListener('change', () => {
    if (nodesEnabled.checked) {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems | GraphItemTypes.NODE | GraphItemTypes.NODE_LABEL
    } else {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems & ~(GraphItemTypes.NODE | GraphItemTypes.NODE_LABEL)
    }
  })
  const edgesEnabled = document.querySelector('#edgesEnabled')
  edgesEnabled.addEventListener('change', () => {
    if (edgesEnabled.checked) {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL
    } else {
      graphEditorInputMode.labelEditableItems =
        graphEditorInputMode.labelEditableItems & ~(GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL)
    }
  })

  const validationEnabledElement = document.querySelector('#validationEnabled')
  const validationPatternElement = document.querySelector('#validationPattern')
  validationEnabledElement.addEventListener('change', () => {
    const checked = validationEnabledElement.checked
    validationEnabled = checked
    validationPatternElement.disabled = !checked
  })
  validationPatternElement.addEventListener('input', () => {
    try {
      validationPattern = new RegExp(validationPatternElement.value)
    } catch (_) {
      // invalid or unfinished regex, ignore
    }
  })
}

/**
 * Creates the sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph
  const n1 = graph.createNodeAt(new Point(0, 0))
  graph.addLabel(n1, 'Node Label')
  const n2 = graph.createNodeAt(new Point(250, 0))
  const edge = graph.createEdge(n1, n2)
  graph.addLabel(edge, 'Edge label')
  graphComponent.fitGraphBounds()
}

run().then(finishLoading)
