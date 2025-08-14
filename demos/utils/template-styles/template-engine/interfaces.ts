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
// Binding configuration interface
export type BindingConfig = {
  type: 'attribute' | 'content'
  ns?: string
  templateBinding: boolean
  name?: string
  path: string
  converter?: string
  converterParameter?: any
}

// Virtual DOM node representation
export interface VirtualNode {
  type: 'element' | 'text' | 'comment'
  name?: string
  namespace?: string | null
  attributes: Record<string, string | [ns: string, name: string]>
  bindings: BindingConfig[]
  children: VirtualNode[]
  textContent?: string
  idMap?: Set<string> // Map of original IDs to prefixed IDs
}

export type RenderContext = {
  bindingContext: any
  templateContext: any
  idPrefix?: string
  idMap?: Set<string>
}

// Converter function type for transforming bound values
export type ConverterFunction = (
  value: any,
  parameter?: string
) => string | number | boolean | SVGElement | undefined

// Interface for objects that can notify of property changes
export interface IPropertyObservable {
  addPropertyChangedListener(listener: (propertyName: string) => void): void
  removePropertyChangedListener(listener: (propertyName: string) => void): void
}

export type RenderFunction = (
  context?: any,
  templateContext?: any,
  idPrefix?: string
) => { node: Node; update: (newContext: any, templateContext: any) => void; cleanup: () => void }
