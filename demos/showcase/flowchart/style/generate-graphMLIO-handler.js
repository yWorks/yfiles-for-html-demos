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
import { FlowchartNodeStyle, FlowchartNodeType } from './FlowchartStyle'
import { Color, Fill, GraphMLIOHandler, MarkupExtension, Stroke } from '@yfiles/yfiles'

export function generateGraphMLIOHandler() {
  const graphMLIOHandler = new GraphMLIOHandler()

  // enable serialization of the flowchart styles - this is done with a markup extension
  graphMLIOHandler.addTypeInformation(FlowchartNodeStyle, {
    extension: (item) => {
      return FlowchartNodeStyleExtension.create(item)
    }
  })
  graphMLIOHandler.addTypeInformation(FlowchartNodeStyleExtension, {
    name: 'FlowchartNodeStyle',
    xmlNamespace: 'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    properties: {
      cssClass: { default: null, type: String },
      fill: { default: new Color(183, 201, 227), type: Fill },
      stroke: { default: Stroke.BLACK, type: Stroke },
      type: { type: String }
    }
  })
  graphMLIOHandler.addNamespace(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    'demostyle'
  )
  return graphMLIOHandler
}

/**
 * Markup extension needed to (de-)serialize the flowchart style.
 */
export class FlowchartNodeStyleExtension extends MarkupExtension {
  $stroke = Stroke.BLACK
  $fill = new Color(183, 201, 227)
  $type = FlowchartNodeType.Data
  $cssClass = null

  get type() {
    return this.$type
  }

  set type(type) {
    this.$type = type
  }

  get stroke() {
    return this.$stroke
  }

  set stroke(stroke) {
    this.$stroke = stroke
  }

  get fill() {
    return this.$fill
  }

  set fill(fill) {
    this.$fill = fill
  }

  get cssClass() {
    return this.$cssClass
  }

  set cssClass(value) {
    this.$cssClass = value
  }

  provideValue(serviceProvider) {
    const style = new FlowchartNodeStyle(this.type)
    style.type = this.type
    style.stroke = this.stroke
    style.fill = this.fill
    style.cssClass = this.cssClass
    return style
  }

  static create(item) {
    const extension = new FlowchartNodeStyleExtension()
    extension.type = item.type
    extension.stroke = item.stroke
    extension.fill = item.fill
    extension.cssClass = item.cssClass
    return extension
  }
}
