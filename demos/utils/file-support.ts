/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
 * This file provides functions to {@link openFile open} and {@link downloadFile download}
 * a text file.
 */

/**
 * The returned data of the {@link openFile} function.
 */
export type FileData = { filename: string; content: string }

/**
 * Opens the file the user selected in a file input element.
 * @returns - A Promise that resolves with the file content and filename.
 */
export function openFile(filter?: string, encoding = 'utf-8'): Promise<FileData> {
  return new Promise((resolve, reject): void => {
    const fileInputElement = document.createElement('input')
    fileInputElement.type = 'file'
    fileInputElement.multiple = false
    fileInputElement.style.display = 'none'
    if (filter) {
      fileInputElement.accept = filter
    }
    document.querySelector('body')!.appendChild(fileInputElement)

    const cleanup = () => {
      fileInputElement.removeEventListener('change', handleFileSelection)
      document.querySelector('body')!.removeChild(fileInputElement)
    }

    const handleFileSelection = () => {
      const file = fileInputElement.files?.item(0)
      if (!file) {
        reject(new Error('No file selected.'))
        cleanup()
        return
      }

      const reader = new FileReader()
      reader.addEventListener('loadend', (evt) => {
        cleanup()
        const fileReader = evt.target!
        if (fileReader.error == null) {
          resolve({ filename: file.name, content: fileReader.result as string })
        } else {
          reject(fileReader.error!)
        }
      })
      reader.readAsText(file, encoding)
    }

    const handleCancel = () => {
      if (!fileInputElement.files?.length) {
        reject('canceled')
        cleanup()
      }
    }

    fileInputElement.addEventListener('change', handleFileSelection, false)
    fileInputElement.addEventListener('cancel', handleCancel, false)

    fileInputElement.click()
  })
}

/**
 * Downloads the given content as a file.
 * @param content - The file content.
 * @param filename - The proposed filename.
 * @param contentType - An optional content type for the download.
 */
export function downloadFile(content: string, filename: string, contentType?: string): void {
  const type = contentType ?? determineContentType(filename)
  const objectURL = URL.createObjectURL(createBlob(content, type))

  const aElement = document.createElement('a')
  aElement.setAttribute('href', objectURL)
  aElement.setAttribute('download', filename)
  aElement.style.display = 'none'
  document.body.appendChild(aElement)
  aElement.click()
  document.body.removeChild(aElement)
}

function createBlob(content: string, type: string) {
  switch (type) {
    case 'application/pdf': {
      const uint8Array = new Uint8Array(content.length)
      for (let i = 0; i < content.length; i++) {
        uint8Array[i] = content.charCodeAt(i)
      }
      return new Blob([uint8Array], { type })
    }
    case 'application/png': {
      const dataUrlParts = content.split(',')
      const bString = window.atob(dataUrlParts[1])
      const byteArray = []
      for (let i = 0; i < bString.length; i++) {
        byteArray.push(bString.charCodeAt(i))
      }
      return new Blob([new Uint8Array(byteArray)], { type })
    }
    default:
      return new Blob([content], { type })
  }
}

/**
 * Returns the file extension of the given {@link filename}.
 * This is the filename part after the last dot.
 */
export function getFileExtension(filename: string | undefined): string | undefined {
  return filename?.match(/\.(?<extension>\w+)$/)?.groups?.extension
}

/**
 * Determines the content type of the given {@link filename} based on the file extension.
 * This implementation only knows some extensions that are used in the demos.
 */
export function determineContentType(filename: string): string {
  const knownTypes: Record<string, string | undefined> = {
    graphml: 'application/graphml+xml',
    json: 'application/json',
    pdf: 'application/pdf',
    png: 'application/png',
    svg: 'image/svg+xml',
    txt: 'text/plain'
  }
  const extension = getFileExtension(filename)?.toLowerCase() ?? ''
  return knownTypes[extension] ?? 'text/plain'
}
