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
import { useEffect, useRef } from 'react'
import { Font, Size, TextRenderSupport, TextWrapping } from '@yfiles/yfiles'

type SvgTextProps = {
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

export function SvgText({
  text = '',
  font = 'normal 12px sans-serif',
  x = 0,
  y = 0,
  maxWidth = Number.MAX_VALUE,
  maxHeight = Number.MAX_VALUE,
  className = '',
  fill,
  style
}: SvgTextProps) {
  const textElement = useRef<SVGTextElement>(null)

  useEffect(() => {
    const element = textElement.current!
    TextRenderSupport.addText(
      textElement.current!,
      text,
      Font.from(font),
      new Size(maxWidth, maxHeight),
      TextWrapping.WRAP_WORD_ELLIPSIS
    )
    return () => {
      while (element.firstChild) {
        element.firstChild.remove()
      }
    }
  }, [text, font, maxWidth, maxHeight])

  return (
    <text
      transform={`translate(${x}, ${y})`}
      ref={textElement}
      className={className}
      fill={fill}
      style={style}
    />
  )
}
