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
import * as React from 'react'
import { Component, createRef, RefObject } from 'react'
import { Font, Size, TextRenderSupport, TextWrapping } from 'yfiles'

type SvgTextProps = {
  transform?: string
  text: string
  font?: string
  x?: number
  y?: number
  maxWidth?: number
  maxHeight?: number
  className?: string
  fill?: string
  style?: React.CSSProperties
}

export default class SvgText extends Component<SvgTextProps, {}> {
  private readonly textElement: RefObject<SVGTextElement>

  constructor(props: Readonly<SvgTextProps> | SvgTextProps) {
    super(props)
    this.textElement = createRef<SVGTextElement>()
  }

  static defaultProps = {
    maxHeight: Number.MAX_VALUE,
    maxWidth: Number.MAX_VALUE,
    text: '',
    className: '',
    font: 'normal 12px sans-serif',
    x: 0,
    y: 0
  }

  componentDidMount() {
    this.addText()
  }

  private addText() {
    // Append the text to the DOM
    TextRenderSupport.addText(
      this.textElement.current!,
      this.props.text,
      Font.from(this.props.font!),
      new Size(this.props.maxWidth!, this.props.maxHeight!),
      TextWrapping.WORD_ELLIPSIS
    )
  }

  componentDidUpdate(prevProps: Readonly<SvgTextProps>, prevState: Readonly<{}>, snapshot?: any) {
    let element = this.textElement.current!
    while (element.firstChild) {
      element.firstChild.remove()
    }
    this.addText()
  }

  render(): JSX.Element {
    const { x, y, className, fill, style } = this.props
    return (
      <text
        transform={`translate(${x}, ${y})`}
        ref={this.textElement}
        className={className}
        fill={fill}
        style={style}
      />
    )
  }
}
