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
import { VueTemplateNodeStyle } from './VueTemplateNodeStyle'

/* eslint-disable no-prototype-builtins */
import {
  GraphMLAttribute,
  ILookup,
  MarkupExtension,
  TypeAttribute,
  XamlAttributeWritePolicy,
  YObject,
  YString
} from 'yfiles'

export class VueTemplateNodeStyleMarkupExtension extends MarkupExtension {
  private _template = ''
  private _styleTag = null

  get template(): string {
    return this._template
  }

  set template(value: string) {
    this._template = value
  }

  get styleTag(): any {
    return this._styleTag
  }

  set styleTag(value: any) {
    this._styleTag = value
  }

  static get $meta(): {
    $self: GraphMLAttribute[]
    template: (GraphMLAttribute | TypeAttribute)[]
    styleTag: (GraphMLAttribute | TypeAttribute)[]
  } {
    return {
      $self: [
        GraphMLAttribute().init({ contentProperty: 'template' }),
        GraphMLAttribute().init({ contentProperty: 'styleTag' })
      ],
      template: [
        GraphMLAttribute().init({
          defaultValue: '',
          writeAsAttribute: XamlAttributeWritePolicy.NEVER
        }),
        TypeAttribute(YString.$class)
      ],
      styleTag: [
        GraphMLAttribute().init({
          defaultValue: null,
          writeAsAttribute: XamlAttributeWritePolicy.NEVER
        }),
        TypeAttribute(YObject.$class)
      ]
    }
  }

  provideValue(serviceProvider: ILookup): VueTemplateNodeStyle<any> {
    // Replace clipIds from neo4j with localIds. We want to get rid of clipId in the long run.
    let template = this._template.replace(
      /(v-bind:clip-path=.*?)'url\(#'\+clipId\+'\)'/,
      "$1localUrl('neo4j-node-clip')"
    )
    template = template.replace(/(clipPath v-bind:id=.*?)clipId/, "$1localId('neo4j-node-clip')")

    const vueTemplateNodeStyle = new VueTemplateNodeStyle(template)
    vueTemplateNodeStyle.styleTag = this._styleTag
    return vueTemplateNodeStyle
  }
}
