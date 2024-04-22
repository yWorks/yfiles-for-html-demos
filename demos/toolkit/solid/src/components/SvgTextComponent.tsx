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
import { Font, Size, TextRenderSupport, TextWrapping } from 'yfiles'
import { createEffect, onCleanup } from 'solid-js'

type SvgTextProps = {
  text: string
  font?: string
  x?: number
  y?: number
  maxWidth?: number
  maxHeight?: number
  class?: string
  fill?: string
  style?: any
}

const defaults = {
  text: '',
  x: 0,
  y: 0,
  font: 'normal 12px sans-serif',
  maxWidth: Number.MAX_VALUE,
  maxHeight: Number.MAX_VALUE
}

export function SvgText(props: SvgTextProps) {
  let textElement: SVGTextElement | undefined

  const cleanup = () => {
    if (textElement) {
      const element = textElement
      while (element.firstChild) {
        element.firstChild.remove()
      }
    }
  }

  createEffect(() => {
    cleanup()
    TextRenderSupport.addText(
      textElement!,
      props.text ?? defaults.text,
      Font.from(props.font ?? defaults.font),
      new Size(props.maxWidth ?? defaults.maxWidth, props.maxHeight ?? defaults.maxHeight),
      TextWrapping.WORD_ELLIPSIS
    )
  })

  onCleanup(cleanup)
  return (
    <text
      transform={`translate(${props.x ?? defaults.x}, ${props.y ?? defaults.y})`}
      ref={textElement}
      class={props.class}
      fill={props.fill}
      style={props.style}
    />
  )
}
