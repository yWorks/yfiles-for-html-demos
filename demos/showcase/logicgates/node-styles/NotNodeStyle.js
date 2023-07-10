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
import { getNodeHighlightInfo } from '../NodeHighlightInfo.js'
import { Font, FontWeight, GeneralPath, Point, TextRenderSupport } from 'yfiles'
import {
  appendEllipse,
  createPath,
  createText,
  GateNodeStyle,
  setAttribute
} from './GateNodeStyle.js'
import { LogicGateType } from '../LogicGateType.js'

/**
 * Node style implementation which renders a NOT gate.
 */
export class NotNodeStyle extends GateNodeStyle {
  /**
   * @param {!string} fillColor
   * @param {!string} strokeColor
   * @param {!string} labelColor
   */
  constructor(fillColor, strokeColor, labelColor) {
    super(LogicGateType.NOT)
    this.labelColor = labelColor
    this.strokeColor = strokeColor
    this.fillColor = fillColor
  }

  /**
   * Creates the Svg elements and adds them to the container.
   * @param {!CacheOwnerElement} container The svg element
   * @param {!Cache} cache The render-data cache object
   * @param {!INode} node The given node
   */
  render(container, cache, node) {
    // store information with the visual on how we created it
    container['data-cache'] = cache

    // the size of node
    const size = cache.size
    const width = size.width
    const height = size.height

    const x1 = width * 0.2
    const x2 = width * 0.7

    this.renderMainPart(x1, x2, height, container, width)
    this.renderOutputPort(x2, width, height, node, container)
    this.renderInputPort(height, x1, node, container)
    this.renderLabel(node, container)
  }

  /**
   * @param {number} x1
   * @param {number} x2
   * @param {number} height
   * @param {!Element} container
   * @param {number} width
   */
  renderMainPart(x1, x2, height, container, width) {
    const generalPath = new GeneralPath()
    generalPath.moveTo(new Point(x1, 0))
    generalPath.lineTo(new Point(x2, height * 0.5))
    generalPath.lineTo(new Point(x1, height))
    generalPath.close()
    createPath(container, generalPath, this.fillColor, this.strokeColor)
    appendEllipse(container, x2 + width * 0.03, height * 0.5, width * 0.03, width * 0.03)
  }

  /**
   * @param {number} x2
   * @param {number} width
   * @param {number} height
   * @param {!INode} node
   * @param {!Element} container
   */
  renderOutputPort(x2, width, height, node, container) {
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(new Point(x2 + 2 * width * 0.03, height * 0.5))
    outputPortPath.lineTo(new Point(width, height * 0.5))
    const outputStroke = getNodeHighlightInfo(node).targetHighlight
      ? NotNodeStyle.OUT_COLOR
      : 'black'
    createPath(container, outputPortPath, 'none', outputStroke)
  }

  /**
   * @param {number} height
   * @param {number} x1
   * @param {!INode} node
   * @param {!Element} container
   */
  renderInputPort(height, x1, node, container) {
    const inputPortPath = new GeneralPath()
    inputPortPath.moveTo(new Point(0, height * 0.5))
    inputPortPath.lineTo(new Point(x1, height * 0.5))
    const inputStroke = getNodeHighlightInfo(node).sourceHighlight ? NotNodeStyle.IN_COLOR : 'black'
    createPath(container, inputPortPath, 'none', inputStroke)
  }

  /**
   * @param {!INode} node
   * @param {!Element} container
   */
  renderLabel(node, container) {
    const fontSize = Math.floor(node.layout.height * 0.25)
    const text = createText('NOT', fontSize, this.labelColor)
    const textSize = TextRenderSupport.measureText(
      text.textContent ?? '',
      new Font({
        fontFamily: 'Arial',
        fontSize,
        fontWeight: FontWeight.BOLD
      })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.33)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)
    container.appendChild(text)
  }
}
