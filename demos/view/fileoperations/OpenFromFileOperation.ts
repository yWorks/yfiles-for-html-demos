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
/* global ActiveXObject */

const ERROR_ON_LOCAL_ACCESS =
  'Unable to access local files due to Internet Explorer security settings.\n' +
  'Local file access for ActiveX controls can be configured in Tools->Internet Options->Security->Custom Level.\n' +
  'To allow local file access, the setting for "Initialize and script ActiveX controls not ' +
  'marked as safe" can be changed to "Enable" or "Prompt".'

/**
 * Opens files using the HTML5 FileReader API or a IE-specific workaround.
 * This technique shows the native file open dialog to the user to provide a natural file open experience.
 *
 * Most browsers prevent the usage of the HTML5 FileReader APIs for scripts that run locally (via file: URLs).
 */
export default class OpenFromFileOperation {
  private readonly inputElement: HTMLInputElement

  /**
   * @param clearInputElementValueAfterOpen Specifies whether or not to reset the input element at the end
   *   of opening. Enable this as a workaround for an unexpected behavior of Google Chrome: the change event is not
   *   triggered if the previous file is selected again. Since the file chooser dialog remembers the last directory
   *   in any case, enabling this is no inconvenience for the users.
   */
  constructor(private clearInputElementValueAfterOpen: boolean = false) {
    this.inputElement = OpenFromFileOperation.createInputElement()
  }

  /**
   * Checks if the operation can be executed.
   */
  isAvailable(): boolean {
    return (
      OpenFromFileOperation.fileReaderIsAvailable() ||
      OpenFromFileOperation.msFileSystemObjectIsAvailable()
    )
  }

  /**
   * Opens the file selected by the inputElement by calling the
   * element's click function.
   * @returns A Promise that resolves with the file content.
   */
  open(): Promise<string> {
    return new Promise((resolve, reject): void => {
      const element = this.inputElement
      const listener = () => {
        this.fileInputChanged(resolve, reject)
        // cleanup the input element
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
    })
  }

  /**
   * Called by the change event listener after the user selected a file.
   * Removes the change event listener and, optionally, resets the input
   * element's value.
   * @param resolve The Promise resolve function
   * @param reject The Promise reject function
   */
  private fileInputChanged(resolve: (value: string) => void, reject: (reason: any) => void): void {
    if (OpenFromFileOperation.fileReaderIsAvailable()) {
      this.openWithFileReader(resolve, reject)
    } else if (OpenFromFileOperation.msFileSystemObjectIsAvailable()) {
      this.openWithMsFileSystemObject(resolve, reject)
    }
  }

  /**
   * Opens files using the HTML5 FileReader API.
   * @param resolve The Promise resolve function
   * @param reject The Promise reject function
   */
  private openWithFileReader(
    resolve: (value: string) => void,
    reject: (reason: any) => void
  ): void {
    const fileInputElement = this.inputElement
    if (!fileInputElement.files || fileInputElement.files.length <= 0) {
      reject(new Error('There is no file to open'))
      return
    }

    const reader = new FileReader()
    reader.onloadend = evt => {
      const fileReader = evt.target!
      if (fileReader.error === null) {
        resolve(fileReader.result as string)
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
   * @param resolve The Promise resolve function
   * @param reject The Promise reject function
   */
  private openWithMsFileSystemObject(
    resolve: (value: string) => void,
    reject: (reason: any) => void
  ): void {
    const fileInputElement = this.inputElement
    if (!fileInputElement.value) {
      reject(new Error('There is no file to open'))
      return
    }
    let textStream: any = null
    try {
      // @ts-ignore This feature detection is okay
      const fso = new ActiveXObject('Scripting.FileSystemObject')
      textStream = fso.openTextFile(fileInputElement.value, 1)
      const content = textStream.readAll()
      resolve(content)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const err = e as any
      if (err.number === -2146827859) {
        reject(new Error(ERROR_ON_LOCAL_ACCESS))
      } else {
        reject(new Error(err.message))
      }
    } finally {
      if (textStream) {
        textStream.close()
      }
    }
  }

  /**
   * Creates a new file input element, hides it, and adds it to the body.
   */
  private static createInputElement(): HTMLInputElement {
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.style.display = 'none'
    const body = document.getElementsByTagName('body')[0]
    body.appendChild(inputElement)
    return inputElement
  }

  /**
   * Checks if the FileSystem Object are available.
   */
  private static fileReaderIsAvailable(): boolean {
    return !isUndefined(window.Blob) && !isUndefined(window.File) && !isUndefined(window.FileReader)
  }

  /**
   * Checks if the file reader is available.
   */
  private static msFileSystemObjectIsAvailable(): boolean {
    return !isUndefined((window as any).ActiveXObject)
  }
}

function isUndefined(value: any): boolean {
  return typeof value === 'undefined'
}
