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
import { CustomNodeStyle } from './CustomNodeStyle'
import type { IGraph } from 'yfiles'

/**
 * Creates the sample nodes for this tutorial step
 */
export function createNodes(graph: IGraph): void {
  // the color can be specified in the constructor
  const styleWithRedFill = new CustomNodeStyle('#b91c3b')

  // the fill color can also be changed later using the property on the style class
  const styleWithPurpleFill = new CustomNodeStyle('grey')
  styleWithPurpleFill.fillColor = '#9e7cb5'

  // not specifying the fill color will use the default color
  const styleWithDefaultFill = new CustomNodeStyle()

  graph.createNode({
    layout: [0, 0, 100, 70],
    style: styleWithRedFill
  })
  graph.createNode({
    layout: [140, 0, 100, 70],
    style: styleWithPurpleFill
  })
  graph.createNode({
    layout: [70, 150, 100, 70],
    style: styleWithDefaultFill
  })
}
