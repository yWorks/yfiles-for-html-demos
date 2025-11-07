/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
export type Components = 'slider' | 'combobox' | 'radio-button' | 'checkbox' | 'spinner' | 'html-block'

export class ComponentAttribute {
  constructor(value: Components)
}

export class EnumValuesAttribute {
  constructor(values: any[])
}

/*interface EnumValuesAttribute {
  init(options: { values: any[] }): EnumValuesAttribute
}*/

export class LabelAttribute {
  constructor(label: string, link?: string)
}

export class MinMaxAttribute {
  constructor(min: number, max: number, step: number = 1)
}

/*
(): MinMaxAttribute
interface MinMaxAttribute {
  init(options: { min: number; max: number; step?: number }): MinMaxAttribute
}*/

export class OptionEditor {
  constructor(rootElement: HTMLDivElement)

  get config(): any

  set config(value: any)

  get validateConfigCallback(): (valid: boolean) => void

  set validateConfigCallback(callback: (valid: boolean) => void)

  addChangeListener(listener: () => void): void

  expand(setting: string): void

  reset(): void

  refresh(): void

  setPresetName(name: string | null): void
}

export class OptionGroup {}

export class OptionGroupAttribute {
  constructor(name: string, position: number)
}

export class TypeAttribute {
  constructor(type: Constructor<any>)
}
