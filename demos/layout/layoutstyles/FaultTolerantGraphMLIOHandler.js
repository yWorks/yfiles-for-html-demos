/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ArcEdgeStyle,
  BevelNodeStyle,
  Class,
  DefaultLabelStyle,
  GeneralPathNodeStyle,
  GraphItemTypes,
  GraphMLIOHandler,
  IconLabelStyle,
  ImageNodeStyle,
  NodeStyleLabelStyleAdapter,
  NodeStylePortStyleAdapter,
  PanelNodeStyle,
  PolylineEdgeStyle,
  SerializationProperties,
  ShapeNodeStyle,
  ShinyPlateNodeStyle,
  StringTemplateLabelStyle,
  StringTemplateNodeStyle,
  StringTemplatePortStyle,
  StripeTypes,
  TableNodeStyle,
  TemplateLabelStyle,
  TemplateNodeStyle,
  TemplatePortStyle,
  WebGLImageNodeStyle,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeStyle,
  WebGLTaperedEdgeStyle
} from 'yfiles'

/**
 * This GraphML IO Handler can read graphs with unknown styles.
 *
 * First, it reads with default settings. If this fails, reading styles is disabled for the next
 * try.
 */
export class FaultTolerantGraphMLIOHandler extends GraphMLIOHandler {
  constructor() {
    super()
    /**
     * Specifies whether reading styles is disabled.
     * @type {boolean}
     * @private
     */
    this.disableStyles = false
    /**
     * An optional callback that is executed before the second try.
     * @type {function(Error)}
     */
    this.onRetry = null
  }

  configureGraphMLParser(parser, graph) {
    super.configureGraphMLParser(parser, graph)
    parser.setDeserializationProperty(
      SerializationProperties.DISABLE_STYLES,
      this.disableStyles ? GraphItemTypes.ALL : GraphItemTypes.NONE
    )
    parser.setDeserializationProperty(
      SerializationProperties.DISABLE_STRIPE_STYLES,
      this.disableStyles ? StripeTypes.ALL : StripeTypes.NONE
    )
  }

  async readFromDocument(graph, document) {
    return this.retry(() => super.readFromDocument(graph, document))
  }

  readFromURL(graph, url) {
    return this.retry(() => super.readFromURL(graph, url))
  }

  async retry(read) {
    try {
      this.disableStyles = false
      return await read()
    } catch (e) {
      if (!e.message || e.message.indexOf('Unable to map XML element') === -1) {
        throw e
      }
      if (typeof this.onRetry === 'function') {
        this.onRetry(e)
      }

      // retry with styles disabled
      this.disableStyles = true
      return await read()
    }
  }
}

export function ensureDefaultStyles() {
  Class.ensure(
    ArcEdgeStyle,
    BevelNodeStyle,
    DefaultLabelStyle,
    GeneralPathNodeStyle,
    IconLabelStyle,
    ImageNodeStyle,
    NodeStyleLabelStyleAdapter,
    NodeStylePortStyleAdapter,
    PanelNodeStyle,
    PolylineEdgeStyle,
    ShapeNodeStyle,
    ShinyPlateNodeStyle,
    StringTemplateLabelStyle,
    StringTemplateNodeStyle,
    StringTemplatePortStyle,
    TableNodeStyle,
    TemplateLabelStyle,
    TemplateNodeStyle,
    TemplatePortStyle,
    WebGLImageNodeStyle,
    WebGLPolylineEdgeStyle,
    WebGLShapeNodeStyle,
    WebGLTaperedEdgeStyle
  )
}
