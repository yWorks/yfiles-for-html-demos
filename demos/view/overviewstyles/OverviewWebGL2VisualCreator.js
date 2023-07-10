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
import {
  INode,
  WebGL2GraphOverviewVisualCreator,
  WebGL2GroupNodeStyle,
  WebGL2IconNodeStyle,
  WebGL2ShapeNodeStyle
} from 'yfiles'

/**
 * Customized visual creator for WebGL2 that uses the status information in the node tag to color
 * the WebGL2 node styles.
 */
export class OverviewWebGL2VisualCreator extends WebGL2GraphOverviewVisualCreator {
  /**
   * @param {!INode} node
   * @returns {?(WebGL2ShapeNodeStyle|WebGL2IconNodeStyle|WebGL2GroupNodeStyle)}
   */
  getWebGL2NodeStyle(node) {
    let fill = '#C1C1C1'
    switch (node.tag.status) {
      case 'busy':
        fill = '#AB2346'
        break
      case 'present':
        fill = '#76B041'
        break
      case 'travel':
        fill = '#A367DC'
        break
      case 'unavailable':
        fill = '#C1C1C1'
        break
    }
    return new WebGL2ShapeNodeStyle({ shape: 'rectangle', fill })
  }
}
