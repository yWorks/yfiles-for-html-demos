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
import type { SolidComponentNodeStyleProps } from '../utils/SolidComponentSvgNodeStyle'
import { SvgText } from './SvgTextComponent'
import { Show } from 'solid-js'

export type SolidNodeTemplateProps = {
  text: string
  detail: 'low' | 'high'
  insets?: number
}

export function SolidNodeTemplate(props: SolidComponentNodeStyleProps<SolidNodeTemplateProps>) {
  const insets = props.tag.insets ?? 3
  return (
    <>
      <rect
        width={props.layout.width}
        height={props.layout.height}
        rx={2}
        ry={2}
        style={{ stroke: '#66485B', 'stroke-width': '1.5', transition: 'fill 0.3s' }}
        fill={props.selected ? '#F26419' : '#AA4586'}
      ></rect>
      <Show when={props.tag.detail === 'high'}>
        <SvgText
          text={String(props.tag.text)}
          x={props.layout.width / 2}
          y={props.layout.height / 2 - 9}
          fill={props.selected ? '#4b3543' : '#DCB4CE'}
          maxWidth={props.layout.width * 2}
          maxHeight={props.layout.height * 2}
          style={{ 'text-anchor': 'middle', 'dominant-baseline': 'middle' }}
        />
      </Show>
    </>
  )
}
