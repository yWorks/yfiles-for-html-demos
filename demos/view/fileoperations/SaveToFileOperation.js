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
/**
 * Saves the given string to a file with either the File API and the download attribute or with
 * the Internet Explorer specific function msSaveOrOpenBlob.
 * See {@link SaveToFileOperation.fileConstructorIsAvailable()} and {@link SaveToFileOperation.msSaveIsAvailable()}
 * for details on browser compatibility.
 */
export default class SaveToFileOperation {
  /**
   * Checks if the operation can be executed.
   * @return {boolean}
   */
  isAvailable() {
    return (
      SaveToFileOperation.isFileConstructorAvailable() || SaveToFileOperation.isMsSaveAvailable()
    )
  }

  /**
   * Saves the file to the file system using the HTML5 File download or
   * the proprietary msSaveOrOpenBlob function in Internet Explorer.
   *
   * @param {string} fileContent The file contents to be saved.
   * @param {string} fileName The default filename for the downloaded file.
   * @return {Promise} A promise which resolves when the save operation is complete.
   */
  save(fileContent, fileName) {
    return new Promise((resolve, reject) => {
      // extract file format
      const format = fileName.split('.')[1].toLowerCase()

      if (SaveToFileOperation.isFileConstructorAvailable()) {
        if (format === 'txt' || format === 'svg' || format === 'graphml') {
          let mimeType = ''
          switch (format) {
            case 'txt':
            default:
              mimeType = 'text/plain'
              break
            case 'svg':
              mimeType = 'image/svg+xml'
              break
            case 'graphml':
              mimeType = 'application/xml'
              break
          }

          // workaround for supporting non-binary data
          fileContent = URL.createObjectURL(new Blob([fileContent], { type: mimeType }))
        }

        const aElement = document.createElement('a')
        aElement.setAttribute('href', fileContent)
        aElement.setAttribute('download', fileName)
        aElement.style.display = 'none'
        document.body.appendChild(aElement)
        aElement.click()
        document.body.removeChild(aElement)

        resolve('File saved successfully')
      } else if (SaveToFileOperation.isMsSaveAvailable()) {
        let blob
        if (fileContent.startsWith('data:')) {
          const dataUrlParts = fileContent.split(',')
          const bString = window.atob(dataUrlParts[1])
          const byteArray = []
          for (let i = 0; i < bString.length; i++) {
            byteArray.push(bString.charCodeAt(i))
          }
          // For the options, extract the mime type from the Data URL
          blob = new Blob([new Uint8Array(byteArray)], {
            type: dataUrlParts[0].match(/:(.*?);/, '')[1]
          })
        } else {
          blob = new Blob([fileContent])
        }

        if (window.navigator.msSaveOrOpenBlob(blob, fileName)) {
          resolve('File saved successfully')
        } else {
          reject(new Error('File save failed: A failure occurred during saving.'))
        }
      } else {
        reject(new Error('File save failed: Save operation is not supported by the browser.'))
      }
    })
  }

  /**
   * Returns whether the File Constructor-based save technique is available.
   * This works in Firefox 28+, Chrome 38+, Opera 25+, recent versions of the related mobile
   * browsers and Android Browser 4.4.4. At the time of writing, it does not work in neither
   * Internet Explorer nor Safari (OS X and iOS).
   *
   * For techniques that support older browsers, see for example the following web pages
   * <ul>
   * <li>FileSaver.js: https://github.com/eligrey/FileSaver.js </li>
   * <li>saveAs.js: https://gist.github.com/phanect/46b692241c6bbe456994 </li>
   * </ul>
   * @return {boolean}
   */
  static isFileConstructorAvailable() {
    // Test whether required functions exist
    if (
      typeof window.URL !== 'function' ||
      typeof window.Blob !== 'function' ||
      typeof window.File !== 'function'
    ) {
      return false
    }
    // Test whether the constructor works as expected
    try {
      // eslint-disable-next-line no-new
      new File(['Content'], 'fileName', {
        type: 'image/png',
        lastModified: Date.now()
      })
    } catch (ignored) {
      return false
    }
    // Everything is available
    return true
  }

  /**
   * Returns whether the MS Internet Explorer specific save technique is available.
   * This works in IE 10+.
   * See https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/hh779016(v=vs.85)
   * for more details.
   * @return {boolean}
   */
  static isMsSaveAvailable() {
    return (
      typeof window.Blob === 'function' && typeof window.navigator.msSaveOrOpenBlob === 'function'
    )
  }
}
