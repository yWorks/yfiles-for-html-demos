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
import { type HandleSerializationEventArgs, type ILookup, MarkupExtension } from '@yfiles/yfiles'

/**
 * The data model of the UML node style.
 * A modification counter tracks if there have been modifications since the last drawing of this model.
 */
export class UMLClassModel {
  stereotype: string
  constraint: string
  className: string
  attributes: string[]
  operations: string[]
  attributesOpen: boolean
  operationsOpen: boolean
  selectedCategory: number
  private $selectedIndex: number
  private $modCount: number

  constructor(data?: {
    stereotype?: string
    constraint?: string
    className?: string
    attributes?: string[]
    operations?: string[]
  }) {
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

  get modCount(): number {
    return this.$modCount
  }

  get selectedIndex(): number {
    return this.$selectedIndex
  }

  set selectedIndex(value: number) {
    this.$selectedIndex = value
    this.modify()
  }

  modify(): void {
    this.$modCount++
  }

  clone(): UMLClassModel {
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
  private $stereotype = ''
  private $constraint = ''
  private $className = ''
  private $attributes: string[] = []
  private $operations: string[] = []
  private $attributesOpen = false
  private $operationsOpen = false

  get stereotype(): string {
    return this.$stereotype
  }

  set stereotype(value: string) {
    this.$stereotype = value
  }

  get constraint(): string {
    return this.$constraint
  }

  set constraint(value: string) {
    this.$constraint = value
  }

  get className(): string {
    return this.$className
  }

  set className(value: string) {
    this.$className = value
  }

  get attributes(): string[] {
    return this.$attributes
  }

  set attributes(value: string[]) {
    this.$attributes = value
  }

  get operations(): string[] {
    return this.$operations
  }

  set operations(value: string[]) {
    this.$operations = value
  }

  get attributesOpen(): boolean {
    return this.$attributesOpen
  }

  set attributesOpen(value: boolean) {
    this.$attributesOpen = value
  }

  get operationsOpen(): boolean {
    return this.$operationsOpen
  }

  set operationsOpen(value: boolean) {
    this.$operationsOpen = value
  }

  provideValue(serviceProvider: ILookup): UMLClassModel {
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
export const UMLClassModelSerializationListener = (args: HandleSerializationEventArgs) => {
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
