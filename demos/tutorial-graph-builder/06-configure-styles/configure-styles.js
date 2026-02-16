/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { PolylineEdgeStyle, ShapeNodeStyle, Size, Stroke } from '@yfiles/yfiles'

export function configureStylesWithDefaults(nodesSource) {
  const blue = '#4281A4'
  nodesSource.nodeCreator.defaults.size = new Size(150, 90)
  nodesSource.nodeCreator.defaults.style = new ShapeNodeStyle({ shape: 'ellipse', fill: blue })
}

export function configureStylesWithBinding(nodesSource) {
  const red = '#DB3A34'
  const darkBlue = '#1a3442'
  // disable sharing of styles
  nodesSource.nodeCreator.defaults.shareStyleInstance = false

  nodesSource.nodeCreator.styleBindings.addBinding('stroke', (entityData) => {
    return new Stroke({ fill: entityData.currency === 'EUR' ? darkBlue : red, thickness: 3 })
  })
}

export function configureStylesWithProvider(nodesSource) {
  const gold = '#F0C808'
  const green = '#56926E'
  nodesSource.nodeCreator.styleProvider = (entityData) => {
    if (entityData.type === 'Branch') {
      return new ShapeNodeStyle({ shape: 'round-rectangle', fill: gold })
    } else if (entityData.type === 'Corporation') {
      return new ShapeNodeStyle({ shape: 'octagon', fill: green })
    }
  }
}

export function configureEdgeStylesWithProvider(edgesSource) {
  const red = '#DB3A34'
  const gray = '#C1C1C1'
  edgesSource.edgeCreator.styleProvider = (connectionData) => {
    if (connectionData.ownership) {
      return new PolylineEdgeStyle({
        stroke: new Stroke({ fill: connectionData.ownership > 50 ? red : 'black', thickness: 3 })
      })
    } else {
      return new PolylineEdgeStyle({
        stroke: new Stroke({ fill: gray, thickness: 3, dashStyle: 'dash' })
      })
    }
  }
}
