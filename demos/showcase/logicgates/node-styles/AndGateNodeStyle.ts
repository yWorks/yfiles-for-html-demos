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
import {
  type IPoint,
  Font,
  FontWeight,
  GeneralPath,
  type INode,
  Point,
  TextRenderSupport
} from 'yfiles'
import { getNodeHighlightInfo } from '../NodeHighlightInfo'
import {
  appendEllipse,
  type CacheOwnerElement,
  createPath,
  createText,
  GateNodeStyle,
  getPointOnCurve,
  type Cache,
  setAttribute
} from './GateNodeStyle'
import { LogicGateType } from '../LogicGateType'

/**
 * Node style implementation which renders an AND or NAND gate.
 */
export class AndGateNodeStyle extends GateNodeStyle {
  /**
   * Creates a new instance of AndGateNodeStyle
   */
  constructor(
    negated: boolean,
    private readonly fillColor: string,
    private readonly strokeColor: string,
    private readonly labelColor: string
  ) {
    super(negated ? LogicGateType.NAND : LogicGateType.AND)
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

    // the size of node
    const size = cache.size
    const width = size.width
    const height = size.height

    const isNegated = this.gateType === LogicGateType.NAND

    const x1 = width * 0.15
    const x2 = width * 0.6
    const y1 = height * 0.25
    const y2 = height * 0.5
    const y3 = height * 0.75

    const firstPoint = new Point(x2, 0)
    const endPoint = new Point(x2, height)
    const c1 = new Point(firstPoint.x + width * 0.3, firstPoint.y + height * 0.1)
    const c2 = new Point(endPoint.x + width * 0.3, endPoint.y - height * 0.1)
    const extremaX = getPointOnCurve(0.5, firstPoint, endPoint, c1, c2)

    this.renderMainPart(container, x1, x2, height, c1, c2, endPoint)
    this.renderOutputPort(isNegated, extremaX, width, y2, node, container)
    this.renderInputPorts(y1, x1, y3, node, container)

    if (isNegated) {
      appendEllipse(container, extremaX + width * 0.03, height * 0.5, width * 0.03, width * 0.03)
    }

    this.renderLabel(node, isNegated, container)
  }

  private renderMainPart(
    container: Element,
    x1: number,
    x2: number,
    height: number,
    c1: IPoint,
    c2: IPoint,
    endPoint: IPoint
  ): void {
    const generalPath = new GeneralPath()
    generalPath.moveTo(new Point(x1, 0))
    generalPath.lineTo(new Point(x2, 0))

    generalPath.cubicTo(c1, c2, endPoint)

    generalPath.lineTo(new Point(x1, height))
    generalPath.close()
    createPath(container, generalPath, this.fillColor, this.strokeColor)
  }

  private renderOutputPort(
    isNegated: boolean,
    extremaX: number,
    width: number,
    y2: number,
    node: INode,
    container: Element
  ): void {
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(new Point(isNegated ? extremaX + 2 * width * 0.03 : extremaX, y2))
    outputPortPath.lineTo(new Point(width, y2))
    const outputStroke = getNodeHighlightInfo(node).targetHighlight
      ? AndGateNodeStyle.OUT_COLOR
      : 'black'
    createPath(container, outputPortPath, 'none', outputStroke)
  }

  private renderInputPorts(
    y1: number,
    x1: number,
    y3: number,
    node: INode,
    container: Element
  ): void {
    const inputPortPath = new GeneralPath()
    inputPortPath.moveTo(new Point(0, y1))
    inputPortPath.lineTo(new Point(x1, y1))
    inputPortPath.moveTo(new Point(x1, y3))
    inputPortPath.lineTo(new Point(0, y3))
    const inputStroke = getNodeHighlightInfo(node).sourceHighlight
      ? AndGateNodeStyle.IN_COLOR
      : 'black'
    createPath(container, inputPortPath, 'none', inputStroke)
  }

  private renderLabel(node: INode, isNegated: boolean, container: Element): void {
    const fontSize = Math.floor(node.layout.height * 0.25)
    const textContent = isNegated ? 'NAND' : 'AND'
    const text = createText(textContent, fontSize, this.labelColor)
    const textSize = TextRenderSupport.measureText(
      text.textContent ?? '',
      new Font({
        fontFamily: 'Arial',
        fontSize,
        fontWeight: FontWeight.BOLD
      })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.45)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)

    container.appendChild(text)
  }
}
