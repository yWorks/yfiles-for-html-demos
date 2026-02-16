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
import { Font, GeneralPath, type INode, Point, TextRenderSupport } from '@yfiles/yfiles'
import {
  appendEllipse,
  type Cache,
  type CacheOwnerElement,
  createPath,
  createText,
  GateNodeStyle,
  getNodeHighlightInfo,
  setAttribute
} from './GateNodeStyle'

/**
 * Node style implementation which renders a NOT gate.
 */
export class NotNodeStyle extends GateNodeStyle {
  private readonly labelColor: string
  private readonly strokeColor: string
  private readonly fillColor: string

  constructor(fillColor: string, strokeColor: string, labelColor: string) {
    super('not')
    this.fillColor = fillColor
    this.strokeColor = strokeColor
    this.labelColor = labelColor
  }

  /**
   * Creates the Svg elements and adds them to the container.
   * @param container The svg element
   * @param cache The render-data cache object
   * @param node The given node
   */
  render(container: CacheOwnerElement, cache: Cache, node: INode): void {
    // store information with the visual on how we created it
    container['data-cache'] = cache

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

  private renderMainPart(
    x1: number,
    x2: number,
    height: number,
    container: Element,
    width: number
  ): void {
    const generalPath = new GeneralPath()
    generalPath.moveTo(new Point(x1, 0))
    generalPath.lineTo(new Point(x2, height * 0.5))
    generalPath.lineTo(new Point(x1, height))
    generalPath.close()
    createPath(container, generalPath, this.fillColor, this.strokeColor)
    appendEllipse(container, x2 + width * 0.03, height * 0.5, width * 0.03, width * 0.03)
  }

  private renderOutputPort(
    x2: number,
    width: number,
    height: number,
    node: INode,
    container: Element
  ): void {
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(new Point(x2 + 2 * width * 0.03, height * 0.5))
    outputPortPath.lineTo(new Point(width, height * 0.5))
    const outputStroke = getNodeHighlightInfo(node).targetHighlight
      ? NotNodeStyle.OUT_COLOR
      : 'black'
    createPath(container, outputPortPath, 'none', outputStroke)
  }

  private renderInputPort(height: number, x1: number, node: INode, container: Element): void {
    const inputPortPath = new GeneralPath()
    inputPortPath.moveTo(new Point(0, height * 0.5))
    inputPortPath.lineTo(new Point(x1, height * 0.5))
    const inputStroke = getNodeHighlightInfo(node).sourceHighlight ? NotNodeStyle.IN_COLOR : 'black'
    createPath(container, inputPortPath, 'none', inputStroke)
  }

  private renderLabel(node: INode, container: Element): void {
    const fontSize = Math.floor(node.layout.height * 0.25)
    const text = createText('NOT', fontSize, this.labelColor)
    const textSize = TextRenderSupport.measureText(
      text.textContent,
      new Font({ fontFamily: 'Arial', fontSize, fontWeight: 'bold' })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.33)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)
    container.appendChild(text)
  }
}
