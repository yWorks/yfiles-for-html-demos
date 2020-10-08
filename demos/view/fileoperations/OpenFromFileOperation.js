/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* global ActiveXObject */

/**
 * Opens files using the HTML5 FileReader API or a IE-specific workaround.
 * This technique shows the native file open dialog to the user to provide a natural file open experience.
 *
 * Most browsers prevent the usage of the HTML5 FileReader APIs for scripts that run locally (via file: URLs).
 *
 */
export default class OpenFromFileOperation {
  /**
   * @param {Boolean} clearInputElementValueAfterOpen Specifies whether or not to reset the input element at the end
   *   of opening. Enable this as a workaround for an unexpected behavior of Google Chrome: the change event is not
   *   triggered if the previous file is selected again. Since the file chooser dialog remembers the last directory
   *   in any case, enabling this is no inconvenience for the users.
   */
  constructor(clearInputElementValueAfterOpen) {
    this.$inputElement = OpenFromFileOperation.createInputElement()
    this.$clearInputElementValueAfterOpen = clearInputElementValueAfterOpen
  }

  /**
   * Checks if the operation can be executed.
   * @return {boolean}
   */
  isAvailable() {
    return (
      OpenFromFileOperation.fileReaderIsAvailable() ||
      OpenFromFileOperation.msFileSystemObjectIsAvailable()
    )
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
        this.fileInputChanged(resolve, reject)
        // cleanup the input element
        this.$inputElement.removeEventListener('change', listener, false)
        if (this.$clearInputElementValueAfterOpen) {
          // Setting null to the element's value shouldn't trigger the onchange event but it does in IE 11.
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
   * Called by the change event listener after the user selected a file.
   * Removes the change event listener and, optionally, resets the input
   * element's value.
   * @param {function} resolve The Promise resolve function
   * @param {function} reject The Promise reject function
   */
  fileInputChanged(resolve, reject) {
    if (OpenFromFileOperation.fileReaderIsAvailable()) {
      this.openWithFileReader(resolve, reject)
    } else if (OpenFromFileOperation.msFileSystemObjectIsAvailable()) {
      this.openWithMsFileSystemObject(resolve, reject)
    }
  }

  /**
   * Opens files using the HTML5 FileReader API.
   * @param {function} resolve The Promise resolve function
   * @param {function} reject The Promise reject function
   */
  openWithFileReader(resolve, reject) {
    const fileInputElement = this.$inputElement
    if (!fileInputElement.files || fileInputElement.files.length <= 0) {
      reject(new Error('There is no file to open'))
      return
    }

    const reader = new FileReader()
    reader.onloadend = evt => {
      const fileReader = evt.target
      if (fileReader.error === null) {
        resolve(fileReader.result)
      } else {
        reject(fileReader.error)
      }
    }
    reader.readAsText(fileInputElement.files[0])
  }

  /**
   * Opens files using the FileSystemObject API of Internet Explorer.
   * Due to limitations of the FileSystemObject, this works only for ASCII encoded files.
   * Especially, files with byte order mark are not handled correctly.
   * @param {function} resolve The Promise resolve function
   * @param {function} reject The Promise reject function
   */
  openWithMsFileSystemObject(resolve, reject) {
    const fileInputElement = this.$inputElement
    if (!fileInputElement.value) {
      reject(new Error('There is no file to open'))
      return
    }
    let textStream = null
    try {
      // noinspection Eslint
      const fso = new ActiveXObject('Scripting.FileSystemObject')
      textStream = fso.openTextFile(fileInputElement.value, 1)
      const content = textStream.readAll()
      resolve(content)
    } catch (e) {
      if (e.number === -2146827859) {
        reject(
          new Error(
            'Unable to access local files due to Internet Explorer security settings.\n' +
              'Local file access for ActiveX controls can be configured in Tools->Internet Options->Security->Custom Level.\n' +
              'To allow local file access, the setting for "Initialize and script ActiveX controls not marked as safe" can be changed to "Enable" or "Prompt".'
          )
        )
      } else {
        reject(new Error(e.message))
      }
    } finally {
      if (textStream !== null) {
        textStream.close()
      }
    }
  }

  /**
   * Creates a new file input element, hides it, and adds it to the body.
   * @return {HTMLInputElement}
   */
  static createInputElement() {
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.style.display = 'none'
    const body = document.getElementsByTagName('body')[0]
    body.appendChild(inputElement)
    return inputElement
  }

  /**
   * Checks if the FileSystem Object are available.
   * @return {boolean}
   */
  static fileReaderIsAvailable() {
    return window.Blob !== undefined && window.File !== undefined && window.FileReader !== undefined
  }

  /**
   * Checks if the file reader is available.
   * @return {boolean}
   */
  static msFileSystemObjectIsAvailable() {
    return window.ActiveXObject !== undefined
  }
}
