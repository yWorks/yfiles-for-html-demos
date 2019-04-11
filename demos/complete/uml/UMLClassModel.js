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
import { Class, MarkupExtension, TypeAttribute, YBoolean, YObject, YString } from 'yfiles'

/**
 * The data model of the UML node style.
 * A modification counter tracks if there have been modifications since the last drawing of this model.
 */
export class UMLClassModel {
  get modCount() {
    return this.$modCount
  }

  get selectedIndex() {
    return this.$selectedIndex
  }

  set selectedIndex(v) {
    this.$selectedIndex = v
    this.modify()
  }

  constructor(data) {
    this.stereotype = (data && data.stereotype) || ''
    this.constraint = (data && data.constraint) || ''
    this.className = (data && data.className) || 'ClassName'
    this.attributes = (data && data.attributes) || []
    this.operations = (data && data.operations) || []
    this.attributesOpen = this.attributes.length > 0
    this.operationsOpen = this.operations.length > 0
    this.$selectedIndex = -1
    this.selectedCategory = 1
    this.$modCount = 0
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
export const UMLClassModelExtension = Class('UMLClassModelExtension', {
  $extends: MarkupExtension,

  $stereotype: null,
  stereotype: {
    $meta() {
      return [TypeAttribute(YString.$class)]
    },
    get() {
      return this.$stereotype
    },
    set(stereotype) {
      this.$stereotype = stereotype
    }
  },

  $constraint: null,
  constraint: {
    $meta() {
      return [TypeAttribute(YString.$class)]
    },
    get() {
      return this.$constraint
    },
    set(constraint) {
      this.$constraint = constraint
    }
  },

  $className: null,
  className: {
    $meta() {
      return [TypeAttribute(YString.$class)]
    },
    get() {
      return this.$className
    },
    set(className) {
      this.$className = className
    }
  },

  $attributes: null,
  attributes: {
    $meta() {
      return [TypeAttribute(YObject.$class)]
    },
    get() {
      return this.$attributes
    },
    set(attributes) {
      this.$attributes = attributes
    }
  },

  $operations: null,
  operations: {
    $meta() {
      return [TypeAttribute(YObject.$class)]
    },
    get() {
      return this.$operations
    },
    set(operations) {
      this.$operations = operations
    }
  },

  $attributesOpen: null,
  attributesOpen: {
    $meta() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$attributesOpen
    },
    set(attributesOpen) {
      this.$attributesOpen = attributesOpen
    }
  },

  $operationsOpen: null,
  operationsOpen: {
    $meta() {
      return [TypeAttribute(YBoolean.$class)]
    },
    get() {
      return this.$operationsOpen
    },
    set(operationsOpen) {
      this.$operationsOpen = operationsOpen
    }
  },

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
})

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
