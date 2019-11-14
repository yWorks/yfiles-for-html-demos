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

define([
  'yfiles/view-editor',
  'yfiles/view-graphml'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Opens the given string from a Web Storage, alternatively either from the Local
   * Storage or from the Session Storage.
   */
  class OpenFromWebStorageOperation {
    constructor(uri) {
      this.$storageLocation = yfiles.graphml.StorageLocation.LOCAL_STORAGE
      this.$uri = uri || 'www.yworks.com/yFilesHTML/GraphML/'
    }

    /**
     * Gets the type of the storage.
     * @type {yfiles.graphml.StorageLocation}
     */
    get storageLocation() {
      return this.$storageLocation
    }

    /**
     * Sets the type of the storage.
     * @type {yfiles.graphml.StorageLocation}
     */
    set storageLocation(value) {
      this.$storageLocation = value
    }

    /**
     * Checks if the operation can be executed.
     * @return {boolean}
     */
    isAvailable() {
      const storageAvailable =
        OpenFromWebStorageOperation.getStorage(this.storageLocation) !== undefined
      if (storageAvailable) {
        const item = this.getItem()
        return item !== null && item !== undefined
      }
      return false
    }

    /**
     * Opens the file stored in local storage.
     * @return {Promise} A Promise that resolves with the file content.
     */
    open() {
      return new Promise((resolve, reject) => {
        if (!this.isAvailable()) {
          reject(new Error('Web storage is not available'))
          return
        }

        const item = this.getItem()
        if (typeof item === 'undefined' || item === null) {
          reject(new Error(`No item found in local storage for key ${this.storageKey}`))
        } else {
          resolve(item)
        }
      })
    }

    /**
     * Gets the storage key.
     * @type {string}
     */
    get storageKey() {
      return `${this.$uri}/example.graphml`
    }

    /**
     * Gets the current item from the storage.
     * @return {string}
     */
    getItem() {
      const storage = OpenFromWebStorageOperation.getStorage(this.storageLocation)
      return storage.getItem(this.storageKey)
    }

    /**
     * Gets the storage location.
     * @return {Storage}
     */
    static getStorage(storageLocation) {
      return storageLocation === yfiles.graphml.StorageLocation.SESSION_STORAGE
        ? window.sessionStorage
        : window.localStorage
    }
  }

  return OpenFromWebStorageOperation
})
