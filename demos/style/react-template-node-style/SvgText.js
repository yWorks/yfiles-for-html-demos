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
import {
  Font,
  FontStyle,
  Size,
  TextDecorations,
  TextRenderSupport,
  TextWrapping
} from '@yfiles/yfiles'
import { createElement, useEffect, useId, useRef } from 'react'
/**
 * A custom React component that maps to yFiles {@link TextRenderSupport}'s functionality
 * for wrapping SVG text.
 */
export function SvgText(props) {
  const textRef = useRef(null)
  const clipId = useId()
  const dx =
    props.align === 'end'
      ? Number(props.width)
      : props.align === 'middle'
        ? Number(props.width) * 0.5
        : 0
  useEffect(() => {
    const textElement = textRef.current
    if (textElement) {
      addText(
        props.content ?? '',
        props.width,
        props.height,
        props.fontFamily,
        props.fontSize,
        props.fontWeight,
        props.fontStyle,
        props.textDecoration,
        props.lineSpacing,
        props.wrapping,
        textElement
      )
    }
  }, [
    props.content,
    props.width,
    props.height,
    props.clipped,
    props.fontFamily,
    props.fontSize,
    props.fontWeight,
    props.fontStyle,
    props.textDecoration,
    props.lineSpacing,
    props.wrapping
  ])
  const clipPathUrl = props.clipped ? `url(#${clipId})` : undefined
  /*
      Since the JSX compiler is only available at runtime, we use the non-JSX version of the following template:
      props.visible !== false ? (
        <g transform={props.transform}>
          <g transform={`translate(${props.x ?? 0} ${props.y ?? 0})`}>
            <text
              ref={textRef}
              dy="1em"
              transform={`translate(${dx} 0)`}
              textAnchor={props.align}
              fill={props.fill}
              opacity={props.opacity}
              clipPath={clipPathUrl}
            ></text>
            {clipPathUrl && (
              <clipPath id={clipId}>
                <rect width={props.width} height={props.height} x={-dx}></rect>
              </clipPath>
            )}
          </g>
        </g>
      ) : (
        <g></g>
      )
     */
  return props.visible !== false
    ? createElement(
        'g',
        {
          transform: props.transform
        },
        createElement(
          'g',
          {
            transform: `translate(${props.x ?? 0} ${props.y ?? 0})`
          },
          createElement('text', {
            ref: textRef,
            dy: '1em',
            transform: `translate(${dx} 0)`,
            textAnchor: props.align,
            fill: props.fill,
            opacity: props.opacity,
            clipPath: clipPathUrl
          }),
          clipPathUrl &&
            createElement(
              'clipPath',
              {
                id: clipId
              },
              createElement('rect', {
                width: props.width,
                height: props.height,
                x: -dx
              })
            )
        )
      )
    : createElement('g', null)
}
function addText(
  value,
  w,
  h,
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
  textDecoration,
  lineSpacing,
  wrapping,
  textElement
) {
  if (
    !textElement ||
    textElement.nodeType !== Node.ELEMENT_NODE ||
    textElement.nodeName !== 'text'
  ) {
    return null
  }
  const text = String(value)
  // create the font which determines the visual text properties
  const fontSettings = {}
  if (typeof fontFamily !== 'undefined') {
    fontSettings.fontFamily = fontFamily
  }
  if (typeof fontSize !== 'undefined') {
    fontSettings.fontSize = Number(fontSize)
  }
  if (typeof fontStyle !== 'undefined') {
    fontSettings.fontStyle = FontStyle.from(fontStyle)
  }
  if (typeof fontWeight !== 'undefined') {
    fontSettings.fontWeight = fontWeight
  }
  if (typeof textDecoration !== 'undefined') {
    fontSettings.textDecoration = TextDecorations.from(textDecoration)
  }
  if (typeof lineSpacing !== 'undefined') {
    fontSettings.lineSpacing = Number(lineSpacing)
  }
  const font = new Font(fontSettings)
  let textWrapping = TextWrapping.WRAP_CHARACTER_ELLIPSIS
  if (typeof wrapping !== 'undefined' && wrapping !== null) {
    textWrapping = TextWrapping.from(wrapping)
  }
  if (typeof w === 'undefined' || w === null) {
    w = Number.POSITIVE_INFINITY
  }
  if (typeof h === 'undefined' || h === null) {
    h = Number.POSITIVE_INFINITY
  }
  // do the text wrapping
  // This sample uses the strategy WRAP_CHARACTER_ELLIPSIS. You can use any other setting.
  TextRenderSupport.addText(textElement, text, font, new Size(Number(w), Number(h)), textWrapping)
  return textElement
}
