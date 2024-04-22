/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  HandleSerializationEventArgs,
  ILookup,
  MarkupExtension,
  TypeAttribute,
  YBoolean,
  YObject,
  YString
} from 'yfiles'

/**
 * The data model of the UML node style.
 * A modification counter tracks if there have been modifications since the last drawing of this model.
 */
export class UMLClassModel {
  stereotype
  constraint
  className
  attributes
  operations
  attributesOpen
  operationsOpen
  selectedCategory
  $selectedIndex
  $modCount

  /**
   * @param {!object} [data]
   */
  constructor(data) {
    this.stereotype = (data && data.stereotype) || ''
    this.constraint = (data && data.constraint) || ''
    this.className = (data && data.className) || 'ClassName'
    this.attributes = (data && data.attributes) || []
    this.operations = (data && data.operations) || []
    this.attributesOpen = this.attributes.length > 0
    this.operationsOpen = this.operations.length > 0
    this.selectedCategory = 1
    this.$selectedIndex = -1
    this.$modCount = 0
  }

  /**
   * @type {number}
   */
  get modCount() {
    return this.$modCount
  }

  /**
   * @type {number}
   */
  get selectedIndex() {
    return this.$selectedIndex
  }

  /**
   * @type {number}
   */
  set selectedIndex(value) {
    this.$selectedIndex = value
    this.modify()
  }

  modify() {
    this.$modCount++
  }

  /**
   * @returns {!UMLClassModel}
   */
  clone() {
    const clone = new UMLClassModel()
    clone.stereotype = this.stereotype
    clone.constraint = this.constraint
    clone.className = this.className
    clone.attributes = Array.from(this.attributes)
    clone.operations = Array.from(this.operations)
    clone.attributesOpen = this.attributesOpen
    clone.operationsOpen = this.operationsOpen
    clone.selectedIndex = this.selectedIndex
    return clone
  }
}

/**
 * Markup extension needed to (de-)serialize the UML model.
 */
export class UMLClassModelExtension extends MarkupExtension {
  $stereotype = ''
  $constraint = ''
  $className = ''
  $attributes = []
  $operations = []
  $attributesOpen = false
  $operationsOpen = false

  /**
   * @type {!string}
   */
  get stereotype() {
    return this.$stereotype
  }

  /**
   * @type {!string}
   */
  set stereotype(value) {
    this.$stereotype = value
  }

  /**
   * @type {!string}
   */
  get constraint() {
    return this.$constraint
  }

  /**
   * @type {!string}
   */
  set constraint(value) {
    this.$constraint = value
  }

  /**
   * @type {!string}
   */
  get className() {
    return this.$className
  }

  /**
   * @type {!string}
   */
  set className(value) {
    this.$className = value
  }

  /**
   * @type {!Array.<string>}
   */
  get attributes() {
    return this.$attributes
  }

  /**
   * @type {!Array.<string>}
   */
  set attributes(value) {
    this.$attributes = value
  }

  /**
   * @type {!Array.<string>}
   */
  get operations() {
    return this.$operations
  }

  /**
   * @type {!Array.<string>}
   */
  set operations(value) {
    this.$operations = value
  }

  /**
   * @type {boolean}
   */
  get attributesOpen() {
    return this.$attributesOpen
  }

  /**
   * @type {boolean}
   */
  set attributesOpen(value) {
    this.$attributesOpen = value
  }

  /**
   * @type {boolean}
   */
  get operationsOpen() {
    return this.$operationsOpen
  }

  /**
   * @type {boolean}
   */
  set operationsOpen(value) {
    this.$operationsOpen = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      stereotype: TypeAttribute(YString.$class),
      constraint: TypeAttribute(YString.$class),
      className: TypeAttribute(YString.$class),
      attributes: TypeAttribute(YObject.$class),
      operations: TypeAttribute(YObject.$class),
      attributesOpen: TypeAttribute(YBoolean.$class),
      operationsOpen: TypeAttribute(YBoolean.$class)
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!UMLClassModel}
   */
  provideValue(serviceProvider) {
    const umlClassModel = new UMLClassModel()
    umlClassModel.stereotype = this.stereotype
    umlClassModel.constraint = this.constraint
    umlClassModel.className = this.className
    umlClassModel.attributes = this.attributes
    umlClassModel.operations = this.operations
    umlClassModel.attributesOpen = this.attributesOpen
    umlClassModel.operationsOpen = this.operationsOpen
    return umlClassModel
  }
}

/**
 * Listener that handles the serialization of the UML model.
 */
export const UMLClassModelSerializationListener = (sender, args) => {
  const item = args.item
  if (item instanceof UMLClassModel) {
    const umlClassModelExtension = new UMLClassModelExtension()
    umlClassModelExtension.stereotype = item.stereotype
    umlClassModelExtension.constraint = item.constraint
    umlClassModelExtension.className = item.className
    umlClassModelExtension.attributes = item.attributes
    umlClassModelExtension.operations = item.operations
    umlClassModelExtension.attributesOpen = item.attributesOpen
    umlClassModelExtension.operationsOpen = item.operationsOpen
    const context = args.context
    context.serializeReplacement(UMLClassModelExtension.$class, item, umlClassModelExtension)
    args.handled = true
  }
}
