/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultLabelStyle,
  Font,
  FreeNodePortLocationModel,
  HorizontalTextAlignment,
  IEdge,
  IEdgeStyle,
  ILabel,
  ILabelStyle,
  INode,
  IRenderContext,
  LabelStyleBase,
  NodeStyleLabelStyleAdapter,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  SimpleEdge,
  SimpleNode,
  SimplePort,
  Size,
  SvgVisual,
  SvgVisualGroup,
  TextRenderSupport,
  VerticalTextAlignment
} from 'yfiles'
import { UMLClassModel } from './UMLClassModel.js'

const font = new Font({
  fontFamily: 'monospace',
  fontSize: 18
})
const factoryStyle = new DefaultLabelStyle({
  backgroundStroke: '#607D8B',
  backgroundFill: '#FFF',
  font: font,
  horizontalTextAlignment: HorizontalTextAlignment.CENTER,
  verticalTextAlignment: VerticalTextAlignment.CENTER
})

export class ExtensibilityButtonStyle extends LabelStyleBase {
  /**
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  createVisual(context, label) {
    const model = label.tag
    const text = label.text

    const labelCreator = factoryStyle.renderer.getVisualCreator(label, factoryStyle)
    const labelVisual = labelCreator.createVisual(context)
    const labelGroup = labelVisual.svgElement
    if (text === 'I') {
      labelGroup.setAttribute(
        'class',
        `interface-toggle${model.stereotype === 'interface' ? ' toggled' : ''}`
      )
    } else {
      labelGroup.setAttribute(
        'class',
        `abstract-toggle${model.constraint === 'abstract' ? ' toggled' : ''}`
      )
    }

    const buttonGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    buttonGroup.setAttribute('class', 'context-button')
    buttonGroup.appendChild(labelGroup)
    return new SvgVisual(buttonGroup)
  }

  /**
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    return this.getButtonSize()
  }

  /**
   * @returns {!Size}
   */
  getButtonSize() {
    const sizeInterface = this.measureText('I')
    const sizeAbstract = this.measureText('A')
    const size = Math.max(
      sizeInterface.width,
      sizeInterface.height,
      sizeAbstract.width,
      sizeAbstract.height
    )
    return new Size(size + 1, size + 1)
  }

  /**
   * @param {!string} text
   * @returns {!Size}
   */
  measureText(text) {
    return TextRenderSupport.measureText(text, font)
  }
}

export class RelationButtonStyle extends LabelStyleBase {
  /**
   * @param {!IEdgeStyle} foregroundStyle
   */
  constructor(foregroundStyle) {
    super()
    this.foregroundStyle = foregroundStyle
    this.backgroundStyle = createBackgroundStyle()
    this.foregroundSrc = new SimpleNode()
    this.foregroundTgt = new SimpleNode()
    this.foregroundEdge = createSimpleEdge(this.foregroundSrc, this.foregroundTgt)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!SvgVisual}
   */
  createVisual(context, label) {
    const backgroundFactory = this.backgroundStyle
    const backgroundCreator = backgroundFactory.renderer.getVisualCreator(label, backgroundFactory)

    const center = label.layout.bounds.center
    this.foregroundSrc.layout = new Rect(center.x - 10 - 0.5, center.y - 0.5, 1, 1)
    this.foregroundTgt.layout = new Rect(center.x + 10 - 0.5, center.y - 0.5, 1, 1)
    const foregroundFactory = this.foregroundStyle
    const foregroundCreator = foregroundFactory.renderer.getVisualCreator(
      this.foregroundEdge,
      foregroundFactory
    )
    const container = new SvgVisualGroup()
    container.add(backgroundCreator.createVisual(context))
    container.add(foregroundCreator.createVisual(context))
    return container
  }

  /**
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    return this.getButtonSize()
  }

  /**
   * @returns {!Size}
   */
  getButtonSize() {
    return new Size(30, 30)
  }
}

/**
 * @returns {!ILabelStyle}
 */
function createBackgroundStyle() {
  const nodeStyle = new ShapeNodeStyle({
    fill: 'white',
    stroke: '#607D8B',
    shape: ShapeNodeShape.ELLIPSE
  })
  const labelStyle = new NodeStyleLabelStyleAdapter()
  labelStyle.nodeStyle = nodeStyle
  return labelStyle
}

/**
 * @param {!INode} src
 * @param {!INode} tgt
 * @returns {!IEdge}
 */
function createSimpleEdge(src, tgt) {
  const sp = new SimplePort(src, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
  const tp = new SimplePort(tgt, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)
  return new SimpleEdge(sp, tp)
}
