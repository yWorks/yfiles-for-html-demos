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
import { BaseClass, delegate, IPropertyObservable, PropertyChangedEventArgs } from 'yfiles'

/** @type {number} */
let counter = 0

/**
 * Creates an instance of ClipboardBusinessObject with a new name.
 * @returns {!ClipboardBusinessObject}
 */
export function createClipboardBusinessObject() {
  return new ClipboardBusinessObject(`Name ${++counter}`)
}

/**
 * A data object with a name and a numeric value.
 * It implements {@link IPropertyObservable} so the node style will be notified
 * about changes of the {@link name} property and update its visualization immediately.
 */
export class ClipboardBusinessObject extends BaseClass(IPropertyObservable) {
  /**
   * Creates a new instance of {@link ClipboardBusinessObject}
   * @param {!string} name
   */
  constructor(name) {
    super()
    this.$name = name
  }

  /**
   * Gets the name of this object.
   * @return {string}
   */
  get name() {
    return this.$name
  }

  /**
   * Sets the name of this object.
   * @param value
   * @type {*}
   */
  set name(value) {
    if (this.$name !== value) {
      this.$name = value
      if (this.$propertyChangedEvent !== null) {
        this.$propertyChangedEvent(this, new PropertyChangedEventArgs('name'))
      }
    }
  }

  /**
   * The event that is raised when the {@link ClipboardBusinessObject.name} of this object changes.
   * @param {!function} listener
   */
  addPropertyChangedListener(listener) {
    this.$propertyChangedEvent = delegate.combine(this.$propertyChangedEvent, listener)
  }

  /**
   * The event that is fired when the {@link ClipboardBusinessObject.name} of this object changes.
   * @param {!function} listener
   */
  removePropertyChangedListener(listener) {
    this.$propertyChangedEvent = delegate.remove(this.$propertyChangedEvent, listener)
  }
}
