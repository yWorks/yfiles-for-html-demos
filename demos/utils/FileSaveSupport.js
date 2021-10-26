/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
const mimeTypesByExtension = {
  txt: 'text/plain',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  graphml: 'application/xml',
  pdf: 'application/pdf'
}

/**
 * Provides helper methods for file saving.
 */
export default class FileSaveSupport {
  /**
   * Saves the file to the file system using the HTML5 File download or
   * the proprietary msSaveOrOpenBlob function in Internet Explorer.
   *
   * @param {string} fileContent The file contents to be saved.
   * @param {string} fileName The default filename for the downloaded file.
   * @returns {!Promise.<string>} {Promise} A promise which resolves when the save operation is complete.
   * @param {!string} fileContent
   * @param {!string} fileName
   */
  static save(fileContent, fileName) {
    return new Promise((resolve, reject) => {
      // extract file format
      const format = fileName.split('.')[1].toLowerCase()
      const mimeType = mimeTypesByExtension[format] || 'text/plain'

      if (FileSaveSupport.isFileConstructorAvailable()) {
        if (format in mimeTypesByExtension) {
          let blob = null
          if (format === 'pdf') {
            // encode content to make transparent images work correctly
            const uint8Array = new Uint8Array(fileContent.length)
            for (let i = 0; i < fileContent.length; i++) {
              uint8Array[i] = fileContent.charCodeAt(i)
            }
            blob = new Blob([uint8Array], { type: mimeType })
          } else if (format === 'png') {
            // save as binary data
            const dataUrlParts = fileContent.split(',')
            const bString = window.atob(dataUrlParts[1])
            const byteArray = []
            for (let i = 0; i < bString.length; i++) {
              byteArray.push(bString.charCodeAt(i))
            }
            blob = new Blob([new Uint8Array(byteArray)], { type: mimeType })
          } else {
            blob = new Blob([fileContent], { type: mimeType })
          }

          // workaround for supporting non-binary data
          fileContent = URL.createObjectURL(blob)
        }

        const aElement = document.createElement('a')
        aElement.setAttribute('href', fileContent)
        aElement.setAttribute('download', fileName)
        aElement.style.display = 'none'
        document.body.appendChild(aElement)
        aElement.click()
        document.body.removeChild(aElement)

        resolve('File saved successfully')
        return
      }
      if (FileSaveSupport.isMsSaveAvailable()) {
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
            type: dataUrlParts[0].match(/:(.*?);/)[1]
          })
        } else if (format === 'pdf') {
          // encode content to make transparent images work correctly
          const uint8Array = new Uint8Array(fileContent.length)
          for (let i = 0; i < fileContent.length; i++) {
            uint8Array[i] = fileContent.charCodeAt(i)
          }
          blob = new Blob([uint8Array], { type: mimeType })
        } else {
          blob = new Blob([fileContent])
        }

        if (window.navigator.msSaveOrOpenBlob(blob, fileName)) {
          resolve('File saved successfully')
        } else {
          reject(new Error('File save failed: A failure occurred during saving.'))
        }
        return
      }
      reject(new Error('File save failed: Save operation is not supported by the browser.'))
    })
  }

  /**
   * @returns {boolean}
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
   * This works in IE 10+. See the related demo for more details.
   * for more details.
   * @returns {boolean} {boolean}
   */
  static isMsSaveAvailable() {
    return (
      typeof window.Blob === 'function' && typeof window.navigator.msSaveOrOpenBlob === 'function'
    )
  }
}
