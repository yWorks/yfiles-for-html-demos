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
import { getNodeHighlightInfo } from '../NodeHighlightInfo'
import { Font, GeneralPath, type INode, Point, TextRenderSupport } from '@yfiles/yfiles'
import {
  appendEllipse,
  type Cache,
  type CacheOwnerElement,
  createPath,
  createText,
  GateNodeStyle,
  getPointOnCurve,
  setAttribute
} from './GateNodeStyle'
import { LogicGateType } from '../LogicGateType'

/**
 * Node style implementation which renders an XOR or XNOR gate.
 */
export class XOrNodeStyle extends GateNodeStyle {
  /**
   * Creates a new instance of XOrNodeStyle.
   */
  constructor(
    negated: boolean,
    private readonly fillColor: string,
    private readonly strokeColor: string,
    private readonly labelColor: string
  ) {
    super(negated ? LogicGateType.XNOR : LogicGateType.XOR)
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

    const x1 = width * 0.18
    const x2 = width * 0.25
    const x3 = width * 0.8
    const y1 = height * 0.25
    const y2 = height * 0.5
    const y3 = height * 0.75
    const isNegated = this.gateType === LogicGateType.XNOR

    const { firstPoint, endPoint, c1, c2 } = this.renderMainPart(
      x1,
      x2,
      x3,
      y2,
      height,
      width,
      container
    )
    this.renderInputPorts(firstPoint, endPoint, c1, c2, y1, y3, node, container)
    this.renderOutputPorts(isNegated, x3, width, y2, node, container)

    if (isNegated) {
      appendEllipse(container, x3 + width * 0.03, height * 0.5, width * 0.03, width * 0.03)
    }
    this.renderLabel(node, isNegated, container)
  }

  /**
   * Renders the main shape of the gate
   */
  private renderMainPart(
    x1: number,
    x2: number,
    x3: number,
    y2: number,
    height: number,
    width: number,
    container: Element
  ): { firstPoint: Point; endPoint: Point; c1: Point; c2: Point } {
    let generalPath = new GeneralPath()
    generalPath.moveTo(x2, 0)

    let firstPoint: Point = new Point(x2, 0)
    let endPoint: Point = new Point(x3, y2)
    let c1: Point = new Point(firstPoint.x + (endPoint.x - firstPoint.x) * 0.5, firstPoint.y)
    let c2: Point = new Point(
      endPoint.x - (endPoint.x - firstPoint.x) * 0.5,
      endPoint.y - height * 0.5
    )
    generalPath.cubicTo(c1, c2, endPoint)

    firstPoint = new Point(x3, y2)
    endPoint = new Point(x2, height)
    c1 = new Point(firstPoint.x + (endPoint.x - firstPoint.x) * 0.5, firstPoint.y + height * 0.5)
    c2 = new Point(endPoint.x - (endPoint.x - firstPoint.x) * 0.5, endPoint.y)
    generalPath.cubicTo(c1, c2, endPoint)

    firstPoint = new Point(x2, height)
    endPoint = new Point(x2, 0)
    c1 = new Point(firstPoint.x + width * 0.1, firstPoint.y - height * 0.1)
    c2 = new Point(endPoint.x + width * 0.1, endPoint.y + height * 0.1)

    generalPath.cubicTo(c1, c2, endPoint)
    generalPath.close()

    createPath(container, generalPath, this.fillColor, this.strokeColor)

    generalPath = new GeneralPath()
    generalPath.moveTo(x1, height)
    firstPoint = new Point(x1, height)
    endPoint = new Point(x1, 0)
    c1 = new Point(firstPoint.x + width * 0.1, firstPoint.y - height * 0.1)
    c2 = new Point(endPoint.x + width * 0.1, endPoint.y + height * 0.1)
    generalPath.cubicTo(c1, c2, endPoint)
    createPath(container, generalPath)
    return { firstPoint, endPoint, c1, c2 }
  }

  private renderInputPorts(
    firstPoint: Point,
    endPoint: Point,
    c1: Point,
    c2: Point,
    y1: number,
    y3: number,
    node: INode,
    container: Element
  ): void {
    const inputPortPath = new GeneralPath()
    const x11 = getPointOnCurve(0.3, firstPoint, endPoint, c1, c2)
    const x21 = getPointOnCurve(0.7, firstPoint, endPoint, c1, c2)
    inputPortPath.moveTo(0, y1)
    inputPortPath.lineTo(x11, y1)
    inputPortPath.moveTo(0, y3)
    inputPortPath.lineTo(x21, y3)
    const inputStroke = getNodeHighlightInfo(node).sourceHighlight ? XOrNodeStyle.IN_COLOR : 'black'
    createPath(container, inputPortPath, 'none', inputStroke)
  }

  private renderOutputPorts(
    isNegated: boolean,
    x3: number,
    width: number,
    y2: number,
    node: INode,
    container: Element
  ): void {
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(isNegated ? x3 + 2 * width * 0.03 : x3, y2)
    outputPortPath.lineTo(width, y2)
    const outputStroke = getNodeHighlightInfo(node).targetHighlight
      ? XOrNodeStyle.OUT_COLOR
      : 'black'
    createPath(container, outputPortPath, 'none', outputStroke)
  }

  private renderLabel(node: INode, isNegated: boolean, container: Element): void {
    const fontSize = Math.floor(node.layout.height * 0.25)
    const textContent = isNegated ? 'XNOR' : 'XOR'
    const text = createText(textContent, fontSize, this.labelColor)
    const textSize = TextRenderSupport.measureText(
      text.textContent ?? '',
      new Font({
        fontFamily: 'Arial',
        fontSize,
        fontWeight: 'bold'
      })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.535)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)
    container.appendChild(text)
  }
}
