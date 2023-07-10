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
// eslint-disable-next-line import/no-named-as-default
import yfiles, { Exception } from 'yfiles'
import { BrowserDetection } from './demo-ui/BrowserDetection.js'

/**
 * If an error occurs, a demo sets a failure state such that consecutive errors can no longer
 * be reported to yWorks
 * @typedef {('OK'|template)} DemoStatusValue
 */

export const INVALID_LICENSE_MESSAGE =
  'This is an expected error caused by invalid or missing license data.'

// Set to `true` when the dialog is open. Prevents opening of multiple error dialogs.
/** @type {boolean} */
let errorDialogOpen = false

/**
 * In Firefox, Error provides some additional properties.
 * @typedef {*} FirefoxError
 */
/**
 * In Safari, Error provides some additional properties.
 * @typedef {*} SafariError
 */

/**
 * Registers error handlers that show an error dialog that can send error reports to yWorks.
 *
 * In addition, on Safari, the stacktrace of the innermost exception is logged, because the default
 * stacktrace is not always that useful.
 *
 * This function registers error handlers for errors reported to the following properties:
 * - window.onerror
 * - window.onunhandledrejection
 * - Exception.handler
 * - require.onError if require.js is used
 */
export function registerErrorDialog() {
  try {
    // Try to increase the stacktrace limit, if we're running in V8
    // https://v8.dev/docs/stack-trace-api
    window.Error.stackTraceLimit = 35
  } catch (ignored) {
    // do nothing if it didn't work
  }

  // Register a handler for unhandled errors
  window.addEventListener('error', e => {
    e.preventDefault()
    if (inErrorState()) {
      return
    }
    if (BrowserDetection.safariVersion > 0 && e.error instanceof Error) {
      console.error(unwindStack(e.error))
    }
    openErrorOverlay(e.error ?? e.message ?? 'Unhandled error')
  })

  // Register a handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', e => {
    e.preventDefault()
    if (inErrorState()) {
      return
    }
    if (BrowserDetection.safariVersion > 0 && e.reason instanceof Error) {
      console.error(getInnermostError(e.reason))
    }
    openErrorOverlay(e.reason ?? 'Unhandled promise rejection')
  })

  // In the following, we test/use some non-standard or new features, therefore we cast window to any
  const anyWindow = window

  // Forward errors occurring in internal event handlers of yFiles to the standard reportError function
  // https://docs.yworks.com/yfileshtml/#/api/Exception
  Exception.handler = error => openErrorOverlay(error)

  // Forward errors occurring during require.js module loading to the standard reportError function
  if (anyWindow.require != null) {
    anyWindow.onError = error => openErrorOverlay(error)
  }
}

/**
 * @param {!Error} error
 * @returns {!Error}
 */
function getInnermostError(error) {
  let inner = error
  while (inner.cause instanceof Error) {
    inner = inner.cause
  }
  return inner
}

/**
 * @param {!Error} error
 * @returns {!string}
 */
function getInnermostMessage(error) {
  const inner = getInnermostError(error)
  return `${inner.name}: ${inner.message}`
}

/**
 * @param {*} error
 * @returns {!string}
 */
function unwindStack(error) {
  const stack = error.stack
  return !stack || stack.length === 0
    ? '<no stack available>'
    : error.cause
    ? `${stack}\nCaused by:\n${unwindStack(error.cause)}`
    : stack
}

/**
 * Shows Vite's error overlay if the runtime-error plugin is registered, otherwise the browser's
 * default behavior is triggered.
 *
 * @param {!(Error|string)} errorOrMessage - Either the error or the error message.
 * @returns {!Promise}
 */
async function openErrorOverlay(errorOrMessage) {
  const ErrorOverlay = customElements.get('vite-error-overlay')
  if (ErrorOverlay && typeof window.reportError === 'function') {
    window.reportError(
      typeof errorOrMessage === 'string' ? new Error(errorOrMessage) : errorOrMessage
    )
  } else {
    openErrorDialog(errorOrMessage)
  }

  // Don't move the App Status before the error dialog creation.
  // Otherwise, automatic sending will be disabled.
  setErrorState(errorOrMessage)
}

/**
 * Opens an error dialog that shows information about an error and allows sending of an error
 * report to yWorks.
 * @param {!(Error|string)} errorOrMessage
 * @returns {boolean}
 */
function openErrorDialog(errorOrMessage) {
  if (errorDialogOpen) {
    // Do nothing and return true to prevent the default action
    return true
  }
  errorDialogOpen = true

  // No error reporting for GraphML parsing errors
  if (errorOrMessage instanceof Exception && errorOrMessage.message.includes('XML Parsing Error')) {
    window.alert(
      'File parsing failed.' +
        " Maybe the provided file format was not expected or the file's integrity is corrupt." +
        (errorOrMessage.message ?? '')
    )
    return true
  }

  const dialog =
    errorOrMessage instanceof Error && errorOrMessage.name === 'TypeInfoError'
      ? createSimpleErrorDialog(errorOrMessage)
      : createErrorDialog(errorOrMessage)

  document.body.appendChild(dialog)
  return true
}

/**
 * Creates a simplified error dialog that shows information about an error.
 *
 * @param errorOrMessage - Either the error or the error message.
 * @param {!(Error|string)} [errorOrMessage]
 * @returns {!HTMLElement}
 */
function createSimpleErrorDialog(errorOrMessage) {
  const { dialogAnchor, dialogPanel, contentPanel } = createPlainDialog('Something Went Wrong')
  const parent = document.body

  dialogPanel.classList.add('demo-dialog--error')
  dialogAnchor.classList.add('demo-dialog-anchor--error')

  addErrorMessage(contentPanel, errorOrMessage)

  const closeButton = document.createElement('button')
  closeButton.addEventListener(
    'click',
    () => {
      parent.removeChild(dialogAnchor)
      errorDialogOpen = false
    },
    false
  )
  closeButton.textContent = 'Close'
  contentPanel.appendChild(closeButton)

  return dialogAnchor
}

/**
 * Creates an error dialog that shows information about an error and allows sending of an error
 * report to yWorks.
 *
 * @param errorOrMessage - Either the error or the error message.
 * @param {!(Error|string)} [errorOrMessage]
 * @returns {!HTMLElement}
 */
function createErrorDialog(errorOrMessage) {
  const actionUrl = 'https://www.yworks.com/actions/errorReportHtmlDemos'
  const { dialogAnchor, dialogPanel, contentPanel } = createPlainDialog('Something Went Wrong')
  const parent = document.body

  dialogPanel.classList.add('demo-dialog--error')
  dialogAnchor.classList.add('demo-dialog-anchor--error')

  addErrorMessage(contentPanel, errorOrMessage)

  const messageElement = document.createElement('div')
  messageElement.innerHTML = `
<p><strong>Report to yWorks</strong></p>
<p style="border-top: 0">If you think the cause is a problem in the yFiles for HTML library, you can use this dialog to send a bug report to yWorks.</p>
<p>We may not respond to other reports. If there is a problem in your implementation or if you have a question regarding the usage of yFiles, please contact yWorks support via the <a href="https://my.yworks.com" target="_blank">yWorks Customer Center</a>.</p>`
  contentPanel.appendChild(messageElement)

  const form = document.createElement('form')
  form.classList.add('demo-dialog__form')
  form.setAttribute('method', 'POST')
  form.setAttribute('target', '_blank')
  form.setAttribute('action', actionUrl)
  contentPanel.appendChild(form)

  // create form element
  addHiddenField(form, 'exact_product', yfiles.productname)
  if (yfiles.license && yfiles.license.key) {
    addHiddenField(form, 'license_key', yfiles.license.key.substring(0, 16))
    addHiddenField(form, 'license_expiry', yfiles.license.expires)
  } else {
    addHiddenField(form, 'license_key', 'No License')
    addHiddenField(form, 'license_expiry', 'No License')
  }
  addHiddenField(form, 'version', yfiles.version)

  if (typeof errorOrMessage === 'string') {
    addFormRow(form, 'error_message', 'Error Message', 'text', errorOrMessage)
  } else {
    // In Firefox, errors have some additional useful properties
    const error = errorOrMessage

    tryAddHiddenField(form, 'error_message', getInnermostMessage(error))
    tryAddHiddenField(form, 'stack', encode(unwindStack(error)))
    tryAddHiddenField(form, 'error_line', error.lineNumber ?? error.line ?? '')
    tryAddHiddenField(form, 'error_column', error.columnNumber ?? error.column ?? '')
    tryAddHiddenField(form, 'error_source', error.filename ?? error.sourceURL ?? '')
  }

  const inputEmail = addFormRow(
    form,
    'email',
    "Email <span class='optional'>optional, just in case we need to contact you</span>",
    'text',
    '',
    true
  )
  addHiddenField(form, 'system', `userAgent: ${window.navigator.userAgent}`)
  addHiddenField(form, 'url', window.top?.location.href)

  const inputComment = addFormRow(form, 'comment', 'Additional comments', 'textarea', '', true)

  const submitButton = document.createElement('button')
  submitButton.setAttribute('type', 'submit')
  submitButton.addEventListener(
    'click',
    () => {
      setTimeout(() => {
        parent.removeChild(dialogAnchor)
        errorDialogOpen = false
      }, 10)
    },
    false
  )
  submitButton.textContent = 'Submit'
  form.appendChild(submitButton)

  const cancelButton = document.createElement('button')
  cancelButton.setAttribute('type', 'reset')
  cancelButton.addEventListener(
    'click',
    () => {
      parent.removeChild(dialogAnchor)
      errorDialogOpen = false
    },
    false
  )
  cancelButton.textContent = 'Cancel'
  form.appendChild(cancelButton)

  // activate the submit button only if user enters custom information
  submitButton.setAttribute('type', 'button')
  inputEmail.addEventListener(
    'change',
    () => {
      submitButton.setAttribute('type', 'submit')
    },
    false
  )
  inputComment.addEventListener(
    'change',
    () => {
      submitButton.setAttribute('type', 'submit')
    },
    false
  )

  return dialogAnchor
}

/**
 * Creates an empty general-purpose dialog with a title bar.
 *
 * @param {!string} titleText The text for the dialog title.
 */
export function createPlainDialog(titleText) {
  const dialogAnchor = document.createElement('div')
  dialogAnchor.classList.add('demo-dialog-anchor')

  const dialogPanel = document.createElement('div')
  dialogPanel.classList.add('demo-dialog')

  const title = document.createElement('h2')
  title.classList.add('demo-dialog__title')
  title.innerHTML = titleText

  const contentPanel = document.createElement('div')
  contentPanel.classList.add('demo-dialog__content')

  dialogAnchor.appendChild(dialogPanel)
  dialogPanel.appendChild(title)
  dialogPanel.appendChild(contentPanel)

  return {
    dialogAnchor,
    dialogPanel,
    title,
    contentPanel
  }
}

/**
 * @returns {boolean}
 */
function inErrorState() {
  const state = window['data-demo-status']
  return typeof state === 'string' && !state.startsWith('OK')
}

/**
 * @param {!(Error|string)} errorOrMessage
 */
function setErrorState(errorOrMessage) {
  window['data-demo-status'] = errorOrMessage != null ? `Error! ${errorOrMessage}` : 'Error!'
}

/**
 * @param {*} value
 * @returns {*}
 */
function encode(value) {
  return typeof value === 'string'
    ? value.replace(new RegExp('<', 'g'), '[').replace(new RegExp('>', 'g'), ']')
    : value
}

/**
 * @param {!HTMLFormElement} form
 * @param {!string} id
 * @param {!string} label
 * @param {!('text'|'textarea')} type
 * @param {*} value
 * @param {boolean} [editable]
 * @returns {!(HTMLInputElement|HTMLTextAreaElement)}
 */
function addFormRow(form, id, label, type, value, editable) {
  let input
  if (type === 'textarea') {
    const textArea = document.createElement('textarea')
    textArea.rows = 3
    textArea.value = value
    input = textArea
  } else {
    input = document.createElement('input')
    input.setAttribute('type', type)
    input.setAttribute('value', value)
  }
  input.setAttribute('id', `error_dialog_${id}`)
  input.setAttribute('name', `error_dialog_${id}`)

  if (!editable) {
    input.setAttribute('readonly', 'true')
  }

  form.appendChild(createLabelElement(id, label))
  form.appendChild(input)
  return input
}

/**
 * @param {!string} id
 * @param {!string} label
 */
function createLabelElement(id, label) {
  const labelElement = document.createElement('label')
  labelElement.setAttribute('for', `error_dialog_${id}`)
  labelElement.innerHTML = label
  return labelElement
}

/**
 * @param {!HTMLFormElement} form
 * @param {!string} id
 * @param {*} value
 * @returns {!HTMLInputElement}
 */
function addHiddenField(form, id, value) {
  const input = document.createElement('input')
  input.setAttribute('type', 'hidden')
  input.setAttribute('value', value)
  input.setAttribute('id', `error_dialog_${id}`)
  input.setAttribute('name', `error_dialog_${id}`)
  form.appendChild(input)
  return input
}

/**
 * @param {!HTMLFormElement} form
 * @param {!string} id
 * @param {*} value
 */
function tryAddHiddenField(form, id, value) {
  if (value) {
    addHiddenField(form, id, value)
  }
}

/**
 * @param {!HTMLElement} parent
 * @param {!(Error|string)} [errorOrMessage]
 */
function addErrorMessage(parent, errorOrMessage) {
  const element = document.createElement('div')
  if (typeof errorOrMessage === 'string') {
    element.innerHTML = `Error message: ${errorOrMessage}`
  } else {
    const innerMessage = getInnermostMessage(errorOrMessage)
    if (innerMessage) {
      element.innerHTML = `
        <pre>${innerMessage}</pre>
        <p style='text-align: right; font-size: 0.85em; margin: 4px 0 0 0'>(see console for details)</p>`
    }
  }
  parent.appendChild(element)
}
