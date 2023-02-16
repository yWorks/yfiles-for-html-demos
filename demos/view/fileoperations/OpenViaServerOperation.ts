/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
const TARGET_NAME = 'demo-open-iframe'
const INPUT_FIELD_ID = 'demo-open-input'
const UPLOAD_FORM_ID = 'demo-upload-form'

const ERROR_ON_SETUP =
  'Unable to setup Open Via Server Operation.\n' +
  'Perhaps your browser does not allow handling cross domain HTTP requests. ' +
  'Please see the demo readme for details.'

const ERROR_ON_EXECUTE =
  'Unable to execute Open Via Server Operation.\n' +
  'Perhaps your browser does not allow handling cross domain HTTP requests. ' +
  'Please see the demo readme for details.'

/**
 * Opens a file by submitting a file input element to a dedicated server which returns the
 * content of the respective file.
 * In all browsers, submitting a form loads the server responses as new document. To prevent
 * loosing the application page, the target of the form is set to an invisible iframe. After
 * loading, this iframe sends the file content to the application by posting a message.
 * @deprecated Please note that using a dedicated server is not the recommended way to open a
 * file in modern browsers.
 * If you only want to open a file from the local filesystem, use the approach shown in
 * 'OpenFromFileOperation' instead.
 */
export default class OpenViaServerOperation {
  public executable = false
  private inputElement: HTMLInputElement | null = null
  private readonly targetElement: HTMLIFrameElement
  private readonly formElement: HTMLIFrameElement
  private messageListener: ((e: MessageEvent) => void) | null = null

  /**
   * @param fileServerUrl The URL the file server runs on.
   * @param responseOrigin The URL that is sent as origin of the server responses.
   * @param clearInputElementValueAfterOpen Specifies whether or not to reset the input element at
   * the end of opening. Enable this as a workaround for an unexpected behavior of Google Chrome:
   * The change event is not triggered if the previous file is selected again. Since the file
   * chooser dialog remembers the last directory in any case, enabling this is no inconvenience
   * for the users.
   */
  constructor(
    private fileServerUrl: string,
    private responseOrigin: string,
    private clearInputElementValueAfterOpen: boolean = false
  ) {
    this.targetElement = createTargetIFrame()
    this.formElement = createFormIFrame()
    this.initialize()
  }

  /**
   * Checks if the operation can be executed.
   */
  isAvailable(): boolean {
    return this.executable
  }

  /**
   * Opens the file selected by the inputElement by calling the
   * element's click function.
   * @returns A Promise that resolves with the file content.
   */
  open(): Promise<string> {
    return new Promise((resolve, reject) => {
      const element = this.inputElement
      if (element) {
        const listener = () => {
          this.fileInputChanged(resolve, reject)
          element.removeEventListener('change', listener, false)
          if (this.clearInputElementValueAfterOpen) {
            // Clearing the element's value should not trigger the onchange event,
            // but it does in IE 11.
            // In any case, this is no problem since we remove the change listener.
            // This has no effect in IE 9 and IE 10.
            element.value = ''
          }
        }
        element.addEventListener('change', listener, false)
        element.click()
      } else {
        reject(new Error('Input element not available.'))
      }
    })
  }

  /**
   * Initializes the html elements of the class.
   */
  private initialize(): void {
    this.formElement.addEventListener(
      'load',
      () => {
        try {
          this.inputElement = getElementById<HTMLInputElement>(this.formElement, INPUT_FIELD_ID)
        } catch (e) {
          const err = e as Error
          if (err.message) {
            alert(`${ERROR_ON_SETUP}\n${err.message}\n`)
          } else {
            alert(ERROR_ON_SETUP)
          }
        }
      },
      false
    )

    const body = document.getElementsByTagName('body')[0]
    body.appendChild(this.targetElement)
    body.appendChild(this.formElement)
  }

  /**
   * Called by the change event listener after the user selected a file.
   * Submits the file input element to the server and calls the superclass's method.
   */
  private fileInputChanged(resolve: (value: string) => void, reject: (reason: any) => void): void {
    this.submitForm(resolve, reject)
  }

  /**
   * Submits the file input element to the server.
   */
  private submitForm(resolve: (value: string) => void, reject: (reason: any) => void): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener, false)
    }

    // register listener for server result
    this.messageListener = e => {
      if (e.origin === this.responseOrigin) {
        this.onMessageReceived(e, resolve, reject)
      }
    }
    window.addEventListener('message', this.messageListener, false)

    // upload to server
    try {
      const form = getElementById<HTMLFormElement>(this.formElement, UPLOAD_FORM_ID)
      form.action = `${this.fileServerUrl}load?${OpenViaServerOperation.createRequestId()}`
      form.submit()
    } catch (e) {
      const err = e as Error
      if (err.message) {
        alert(`${ERROR_ON_EXECUTE}\n${err.message}\n`)
      } else {
        alert(ERROR_ON_EXECUTE)
      }
    }
  }

  /**
   * Invoked when the input file has been received.
   */
  private onMessageReceived(
    e: MessageEvent,
    resolve: (value: string) => void,
    reject: (reason: any) => void
  ): void {
    window.removeEventListener('message', this.messageListener!, false)

    const data = decodeURIComponent(e.data)
    if (data.indexOf('!ERROR!', 0) === 0) {
      reject(new Error(data))
    } else {
      resolve(data)
    }
  }

  checkServer(): Promise<boolean | Response> {
    return fetch(`${this.fileServerUrl}isAlive`).catch(() => Promise.resolve(false))
  }

  /**
   * Creates a unique request ID to prevent caching.
   */
  static createRequestId(): string {
    return `${new Date().getTime()}-${Math.floor(Math.random() * 100000)}`
  }
}

function createTargetIFrame(): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.name = TARGET_NAME // use attribute 'name' not 'id'!
  iframe.style.display = 'none'
  return iframe
}

function createFormIFrame(): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.src = 'uploadForm.html'
  iframe.style.display = 'none'
  return iframe
}

function getElementById<T extends HTMLElement>(iframe: HTMLIFrameElement, id: string): T {
  return iframe.contentDocument!.getElementById(id) as T
}
