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
import { MarkupExtension } from '@yfiles/yfiles'

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

  get modCount() {
    return this.$modCount
  }

  get selectedIndex() {
    return this.$selectedIndex
  }

  set selectedIndex(value) {
    this.$selectedIndex = value
    this.modify()
  }

  modify() {
    this.$modCount++
  }

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

  get stereotype() {
    return this.$stereotype
  }

  set stereotype(value) {
    this.$stereotype = value
  }

  get constraint() {
    return this.$constraint
  }

  set constraint(value) {
    this.$constraint = value
  }

  get className() {
    return this.$className
  }

  set className(value) {
    this.$className = value
  }

  get attributes() {
    return this.$attributes
  }

  set attributes(value) {
    this.$attributes = value
  }

  get operations() {
    return this.$operations
  }

  set operations(value) {
    this.$operations = value
  }

  get attributesOpen() {
    return this.$attributesOpen
  }

  set attributesOpen(value) {
    this.$attributesOpen = value
  }

  get operationsOpen() {
    return this.$operationsOpen
  }

  set operationsOpen(value) {
    this.$operationsOpen = value
  }

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
export const UMLClassModelSerializationListener = (args) => {
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
    context.serializeReplacement(UMLClassModelExtension, item, umlClassModelExtension)
    args.handled = true
  }
}
