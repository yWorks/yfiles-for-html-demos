/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { FlowchartNodeStyle, FlowchartNodeType } from './FlowchartStyle.js'
import {
  Fill,
  GraphMLAttribute,
  GraphMLSupport,
  MarkupExtension,
  SolidColorFill,
  StorageLocation,
  Stroke,
  TypeAttribute,
  YString
} from 'yfiles'

/**
 * @param {!GraphComponent} graphComponent
 */
export function enableGraphmlSupport(graphComponent) {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  new FlowchartNodeStyleExtension()

  // enable serialization of the flowchart styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    'FlowchartNodeStyle',
    FlowchartNodeStyleExtension.$class
  )
  gs.graphMLIOHandler.addNamespace(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    'demostyle'
  )
  gs.graphMLIOHandler.addHandleSerializationListener(serializeFlowchartNodeStyle)
}

/**
 * Listener that handles the serialization of the flowchart style.
 * @param {!GraphMLIOHandler} sender
 * @param {!HandleSerializationEventArgs} args
 */
export function serializeFlowchartNodeStyle(sender, args) {
  if (args.item instanceof FlowchartNodeStyle) {
    const flowchartStyleExtension = new FlowchartNodeStyleExtension()
    flowchartStyleExtension.type = args.item.type
    flowchartStyleExtension.stroke = args.item.stroke
    flowchartStyleExtension.fill = args.item.fill
    flowchartStyleExtension.cssClass = args.item.cssClass

    const context = args.context
    context.serializeReplacement(
      FlowchartNodeStyleExtension.$class,
      args.item,
      flowchartStyleExtension
    )
    args.handled = true
  }
}

/**
 * Markup extension needed to (de-)serialize the flowchart style.
 */
export class FlowchartNodeStyleExtension extends MarkupExtension {
  $stroke = Stroke.BLACK
  $fill = new SolidColorFill(183, 201, 227)
  $type = FlowchartNodeType.Data
  $cssClass = null

  /**
   * @type {!FlowchartNodeType}
   */
  get type() {
    return this.$type
  }

  /**
   * @type {!FlowchartNodeType}
   */
  set type(type) {
    this.$type = type
  }

  /**
   * @type {!Stroke}
   */
  get stroke() {
    return this.$stroke
  }

  /**
   * @type {!Stroke}
   */
  set stroke(stroke) {
    this.$stroke = stroke
  }

  /**
   * @type {!Fill}
   */
  get fill() {
    return this.$fill
  }

  /**
   * @type {!Fill}
   */
  set fill(fill) {
    this.$fill = fill
  }

  /**
   * @type {?string}
   */
  get cssClass() {
    return this.$cssClass
  }

  /**
   * @type {?string}
   */
  set cssClass(value) {
    this.$cssClass = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      type: [TypeAttribute(YString.$class)],
      stroke: [
        GraphMLAttribute().init({ defaultValue: Stroke.BLACK }),
        TypeAttribute(Stroke.$class)
      ],
      fill: [
        GraphMLAttribute().init({ defaultValue: new SolidColorFill(183, 201, 227) }),
        TypeAttribute(Fill.$class)
      ],
      cssClass: [GraphMLAttribute().init({ defaultValue: null }), TypeAttribute(YString.$class)]
    }
  }

  /**
   * @param {?ILookup} serviceProvider
   * @returns {!FlowchartNodeStyle}
   */
  provideValue(serviceProvider) {
    const style = new FlowchartNodeStyle(this.type)
    style.type = this.type
    style.stroke = this.stroke
    style.fill = this.fill
    style.cssClass = this.cssClass
    return style
  }
}
