/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import { BaseClass, delegate, IPropertyObservable, PropertyChangedEventArgs } from 'yfiles'

/**
 * A class that wraps an item from OrgChartData and enhances it by implementing the IPropertyObservable interface.
 * Each time a property is changed, it fires a PropertyChanged event to update bindings to that property.
 */
export default class Employee extends BaseClass(IPropertyObservable) {
  constructor(data) {
    super()
    this.$data = data
    this.$propertyChanged = null
  }

  get name() {
    return this.$data.name
  }

  set name(value) {
    if (this.$data.name !== value) {
      this.$data.name = value
      this.firePropertyChanged('name')
    }
  }

  get position() {
    return this.$data.position
  }

  set position(value) {
    if (this.$data.position !== value) {
      this.$data.position = value
      this.firePropertyChanged('position')
    }
  }

  get email() {
    return this.$data.email
  }

  set email(value) {
    if (this.$data.email !== value) {
      this.$data.email = value
      this.firePropertyChanged('email')
    }
  }

  get phone() {
    return this.$data.phone
  }

  set phone(value) {
    if (this.$data.phone !== value) {
      this.$data.phone = value
      this.firePropertyChanged('phone')
    }
  }

  get fax() {
    return this.$data.fax
  }

  set fax(value) {
    if (this.$data.fax !== value) {
      this.$data.fax = value
      this.firePropertyChanged('fax')
    }
  }

  get businessUnit() {
    return this.$data.businessUnit
  }

  set businessUnit(value) {
    if (this.$data.businessUnit !== value) {
      this.$data.businessUnit = value
      this.firePropertyChanged('businessUnit')
    }
  }

  get status() {
    return this.$data.status
  }

  set status(value) {
    if (this.$data.status !== value) {
      this.$data.status = value
      this.firePropertyChanged('status')
    }
  }

  get icon() {
    return this.$data.icon
  }

  get subordinates() {
    return this.$data.subordinates
  }

  get assistant() {
    return this.$data.assistant || false
  }

  /**
   * Adds a listener to the PropertyChanged event.
   * @param {function(*,PropertyChangedEventArgs):void} listener - The listener to add.
   */
  addPropertyChangedListener(listener) {
    this.$propertyChanged = delegate.combine(this.$propertyChanged, listener)
  }

  /**
   * Removes a listener from the PropertyChanged event.
   * @param {function(*,PropertyChangedEventArgs):void} listener - The listener to remove.
   */
  removePropertyChangedListener(listener) {
    this.$propertyChanged = delegate.remove(this.$propertyChanged, listener)
  }

  /**
   * Firest the PropertyChanged event.
   * @param propertyName The name of the property that has changed
   */
  firePropertyChanged(propertyName) {
    if (this.$propertyChanged !== null) {
      this.$propertyChanged(this, new PropertyChangedEventArgs(propertyName))
    }
  }
}
