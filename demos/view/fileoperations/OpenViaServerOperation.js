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

define([], () => {
  /**
   * Opens a file by submitting a file input element to a dedicated server which returns the
   * content of the respective file.
   * In all browsers, submitting a form loads the server responses as new document. To prevent
   * loosing the application page, the target of the form is set to an invisible iframe. After
   * loading, this iframe sends the file content to the application by posting a message.
   * @deprecated Please note that using a dedicated server is not the recommended way to open a file in modern
   *   browsers.
   * If you only want to open a file from the local filesystem, use the approach shown in 'OpenFromFileOperation.js'
   *   instead.
   */
  class OpenViaServerOperation {
    /**
     * @param {string|null} [fileServerUrl] The URL the file server runs on.
     * @param {string|null} [responseOrigin] The URL that's sent as origin of the server responses.
     * @param {Boolean} [clearInputElementValueAfterOpen] Specifies whether or not to reset the input element at the
     *   end of opening. Enable this as a workaround for an unexpected behavior of Google Chrome: the change event is
     *   not triggered if the previous file is selected again. Since the file chooser dialog remembers the last
     *   directory in any case, enabling this is no inconvenience for the users.
     */
    constructor(fileServerUrl, responseOrigin, clearInputElementValueAfterOpen) {
      this.targetName = 'demo-open-iframe'
      this.uploadFormId = 'demo-upload-form'
      this.$fileServerUrl = fileServerUrl || 'http://localhost:3000/file/'
      this.$responseOrigin = responseOrigin || 'http://localhost:3000'
      this.$executable = false
      this.$inputElement = null

      this.$clearInputElementValueAfterOpen = !!clearInputElementValueAfterOpen

      this.initialize()
    }

    /**
     * Gets whether the operation can be executed.
     * @type {boolean}
     */
    get executable() {
      return this.$executable
    }

    /**
     * Sets whether the operation can be executed.
     * @type {boolean}
     */
    set executable(value) {
      if (this.$executable !== value) {
        this.$executable = value
      }
    }

    /**
     * Checks if the operation can be executed.
     * @return {boolean}
     */
    isAvailable() {
      return this.executable
    }

    /**
     * Opens the file selected by the inputElement by calling the
     * element's click function.
     * @return {Promise} A Promise that resolves with the file content.
     */
    open() {
      return new Promise((resolve, reject) => {
        const element = this.$inputElement
        const listener = e => {
          this.fileInputChanged(e, resolve, reject)
          this.$inputElement.removeEventListener('change', listener, false)
          if (this.$clearInputElementValueAfterOpen) {
            // Setting null to the element's value shoudn't trigger the onchange event but it does in IE 11.
            // In any case, this is no problem since we remove the change listener.
            // This has no effect in IE 9 and IE 10.
            this.$inputElement.value = null
          }
        }
        element.addEventListener('change', listener, false)
        element.click()
      })
    }

    /**
     * Initializes the html elements of the class.
     */
    initialize() {
      this.targetIframeElement = document.createElement('iframe')
      this.targetIframeElement.name = this.targetName
      // use attribute 'name' not 'id'!
      this.targetIframeElement.style.display = 'none'

      this.formIframeElement = document.createElement('iframe')
      this.formIframeElement.addEventListener(
        'load',
        () => {
          try {
            this.$inputElement = this.formIframeElement.contentDocument.getElementById(
              'demo-open-input'
            )
          } catch (e) {
            const error = e
            const msg =
              'Unable to setup Open Via Server Operation.\nPerhaps your browser does not allow handling cross domain HTTP requests. Please see the demo readme for details.'
            if (error.message) {
              alert(`${msg}\n${error.message}\n`)
            } else {
              alert(msg)
            }
          }
        },
        false
      )
      this.formIframeElement.src = 'uploadForm.html'
      this.formIframeElement.styledisplay = 'none'

      const body = document.getElementsByTagName('body')[0]
      body.appendChild(this.targetIframeElement)
      body.appendChild(this.formIframeElement)
    }

    /**
     * Called by the change event listener after the user selected a file.
     * Submits the file input element to the server and calls the superclass's method.
     * @param {Event} ev
     */
    fileInputChanged(ev, resolve, reject) {
      this.submitForm(resolve, reject)
    }

    /**
     * Submits the file input element to the server.
     */
    submitForm(resolve, reject) {
      if (this.messageListener !== null) {
        window.removeEventListener('message', this.messageListener, false)
      }

      // register listener for server result
      this.messageListener = e => {
        if (e.origin === this.$responseOrigin) {
          this.onMessageReceived(e, resolve, reject)
        }
      }
      window.addEventListener('message', this.messageListener, false)

      // upload to server
      try {
        const form = this.formIframeElement.contentDocument.getElementById(this.uploadFormId)
        form.action = `${this.$fileServerUrl}load?${OpenViaServerOperation.createRequestId()}`
        form.submit()
      } catch (e) {
        const error = e
        const msg =
          'Unable to execute Open Via Server Operation.\nPerhaps your browser does not allow handling cross domain HTTP requests. Please see the demo readme for details.'
        if (error.message) {
          alert(`${msg}\n${error.message}\n`)
        } else {
          alert(msg)
        }
      }
    }

    /**
     * Invoked when the input file has been received.
     */
    onMessageReceived(e, resolve, reject) {
      window.removeEventListener('message', this.messageListener, false)

      const data = decodeURIComponent(e.data)
      if (data.indexOf('!ERROR!', 0) === 0) {
        reject(new Error(data))
      } else {
        resolve(data)
      }
    }

    checkServer() {
      return new Promise(resolve => {
        try {
          const request = new XMLHttpRequest()
          request.onerror = e => resolve(false)
          request.onload = e1 => {
            const executable = e1.target.status === 200
            resolve(executable)
          }
          request.open('GET', `${this.$fileServerUrl}isAlive`, true)
          request.send()
        } catch (e) {
          resolve(false)
        }
      })
    }

    /**
     * Creates a unique request ID to prevent caching.
     * @return {string}
     */
    static createRequestId() {
      return `${new Date().getTime()}-${Math.floor(Math.random() * 100000)}`
    }
  }

  return OpenViaServerOperation
})
