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
  CollapsibleNodeStyleDecorator,
  type INodeStyle,
  IRenderContext,
  Size
} from '@yfiles/yfiles'

/**
 * Provides a customized visualization of the collapse/expand button of a group node.
 */
export default class Sample1CollapsibleNodeStyleDecorator extends CollapsibleNodeStyleDecorator {
  constructor(wrappedStyle: INodeStyle) {
    super(wrappedStyle)
  }

  createButton(_context: IRenderContext, expanded: boolean, size: Size): SVGElement {
    // create the svg element with the button image
    const buttonImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    buttonImage.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      expanded ? 'resources/collapse.svg' : 'resources/expand.svg'
    )
    buttonImage.setAttribute('width', `${size.width}`)
    buttonImage.setAttribute('height', `${size.height}`)
    return buttonImage
  }
}
