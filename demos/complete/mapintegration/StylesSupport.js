/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component'], yfiles => {
  class StylesSupport {
    static initializeDefaultStyles(graph) {
      graph.nodeDefaults.style = StylesSupport.createMapNodeStyle()
      graph.nodeDefaults.size = [40, 40]
      graph.nodeDefaults.shareStyleInstance = false
      graph.nodeDefaults.labels.style = StylesSupport.createLabelStyle()
      graph.nodeDefaults.labels.layoutParameter = yfiles.graph.ExteriorLabelModel.SOUTH
      graph.nodeDefaults.ports.locationParameter =
        yfiles.graph.FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED

      graph.edgeDefaults.style = StylesSupport.createMapEdgeStyle()
      graph.edgeDefaults.shareStyleInstance = false
    }

    static applyMapStyles(graph) {
      graph.edges.forEach(edge => {
        graph.setStyle(edge, StylesSupport.createMapEdgeStyle(StylesSupport.getArcHeight(edge)))
      })
      graph.nodes.forEach(node => {
        graph.setStyle(node, StylesSupport.createMapNodeStyle())
        node.ports.forEach(port => {
          graph.setPortLocationParameter(port, graph.nodeDefaults.ports.locationParameter.clone())
        })
      })
    }

    static applyLayoutStyles(graph) {
      graph.edges.forEach(edge => {
        graph.setStyle(edge, StylesSupport.createLayoutEdgeStyle(edge))
      })
      graph.nodes.forEach(node => {
        graph.setStyle(node, StylesSupport.createLayoutNodeStyle())
      })
    }

    static createMapNodeStyle() {
      const outline = new yfiles.geometry.GeneralPath()
      outline.moveTo(0.5, 0)
      outline.cubicTo(0.289, 0, 0.118, 0.171, 0.118, 0.382)
      outline.cubicTo(0.118, 0.509, 0.18, 0.621, 0.275, 0.691)
      outline.cubicTo(0.287, 0.699, 0.295, 0.713, 0.307, 0.722)
      outline.lineTo(0.5, 1)
      outline.lineTo(0.725, 0.684)
      outline.cubicTo(0.82, 0.614, 0.882, 0.502, 0.882, 0.375)
      outline.cubicTo(0.882, 0.164, 0.711, 0, 0.5, 0)
      outline.close()

      return new yfiles.styles.ImageNodeStyle({
        image: 'resources/airport-drop.svg',
        normalizedOutline: outline
      })
    }

    static createMapEdgeStyle(height) {
      return new yfiles.styles.ArcEdgeStyle({
        stroke: '5px dashed royalblue',
        height: height || 100
      })
    }

    static createLayoutEdgeStyle() {
      return new yfiles.styles.PolylineEdgeStyle({
        stroke: '5px dashed royalblue'
      })
    }

    static createLayoutNodeStyle() {
      const outline = new yfiles.geometry.GeneralPath()
      outline.appendEllipse(new yfiles.geometry.Rect(0.125, 0, 0.75, 0.75), false)
      return new yfiles.styles.ImageNodeStyle({
        image: 'resources/airport-circle.svg',
        normalizedOutline: outline
      })
    }

    static createLabelStyle() {
      return new yfiles.styles.NodeStyleLabelStyleAdapter({
        nodeStyle: new yfiles.styles.ShapeNodeStyle({
          shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
          fill: 'crimson',
          stroke: null
        }),
        labelStyle: new yfiles.styles.DefaultLabelStyle({
          textFill: 'white'
        }),
        labelStyleInsets: [3, 5]
      })
    }

    static updateEdgeArcs(graph) {
      graph.edges.forEach(edge => {
        edge.style.height = StylesSupport.getArcHeight(edge)
      })
    }

    /**
     * Returns the height of the edge arc considering the length of the edge.
     * @param {yfiles.graph.IEdge} edge
     * @return {number}
     */
    static getArcHeight(edge) {
      const sourceCenter = edge.sourceNode.layout.center
      const targetCenter = edge.targetNode.layout.center
      const distance = sourceCenter.distanceTo(targetCenter)
      if (distance < 500) {
        return distance / 10
      }
      return 100
    }
  }

  return StylesSupport
})
