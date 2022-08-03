/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { StorageLocation } from 'yfiles'

/**
 * Opens the given string from a Web Storage, alternatively either from the Local
 * Storage or from the Session Storage.
 */
export default class OpenFromWebStorageOperation {
  private readonly storageKey: string

  constructor(private storageLocation: StorageLocation, uri: string) {
    this.storageKey = `${uri}/example.graphml`
  }

  /**
   * Checks if the operation can be executed.
   */
  isAvailable(): boolean {
    const storage = OpenFromWebStorageOperation.getStorage(this.storageLocation)
    return !isUndefined(storage)
  }

  /**
   * Opens the file stored in local storage.
   * @return A Promise that resolves with the file content.
   */
  open(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Web storage is not available'))
        return
      }

      const item = this.getItem()
      if (item === null || isUndefined(item)) {
        reject(new Error(`No item found in local storage for key ${this.storageKey}`))
        return
      }

      resolve(item)
    })
  }

  /**
   * Gets the current item from the storage.
   */
  private getItem(): string | null {
    const storage = OpenFromWebStorageOperation.getStorage(this.storageLocation)
    return storage.getItem(this.storageKey)
  }

  /**
   * Gets the storage location.
   */
  static getStorage(storageLocation: StorageLocation): Storage {
    return storageLocation === StorageLocation.LOCAL_STORAGE
      ? window.localStorage
      : window.sessionStorage
  }
}

function isUndefined(value: any): boolean {
  return typeof value === 'undefined'
}
