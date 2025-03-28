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
import { HtmlCanvasVisual, IEdge, INode, IVisualCreator } from '@yfiles/yfiles'
const heatScale = 0.5
/**
 * A visual that renders the heat map highlighting the nodes and edges with
 * a lot of events at the same time.
 */
export class HeatmapBackground extends HtmlCanvasVisual {
  getHeat
  backBufferCanvas = null
  backBufferContext = null
  constructor(getHeat) {
    super()
    this.getHeat = getHeat || (() => 1)
  }
  /**
   * Renders the heat map on a canvas.
   */
  render(renderContext, ctx) {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const { width, height } = ctx.canvas
    const devicePixelRatio = renderContext.canvasComponent.devicePixelRatio
    let canvas = this.backBufferCanvas
    let backBufferContext
    if (!canvas || canvas.width !== width || canvas.height !== height) {
      canvas = document.createElement('canvas')
      canvas.setAttribute('width', String(width))
      canvas.setAttribute('height', String(height))
      backBufferContext = canvas.getContext('2d')
      this.backBufferCanvas = canvas
      this.backBufferContext = backBufferContext
    } else {
      backBufferContext = this.backBufferContext
      backBufferContext.clearRect(0, 0, width / devicePixelRatio, height / devicePixelRatio)
    }
    const scale = renderContext.zoom * heatScale
    backBufferContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    let lastFillStyleHeat = -1
    for (const node of renderContext.canvasComponent.graph.nodes) {
      const center = renderContext.worldToViewCoordinates(node.layout.center)
      const heat = this.getHeat(node)
      if (heat > 0) {
        if (heat !== lastFillStyleHeat) {
          backBufferContext.fillStyle = `rgba(255,255,255, ${heat})`
          lastFillStyleHeat = heat
        }
        const w = Math.max(100, node.layout.width * 1.5)
        const h = Math.max(100, node.layout.height * 1.5)
        backBufferContext.beginPath()
        backBufferContext.ellipse(center.x, center.y, w * scale, h * scale, 0, 0, Math.PI * 2)
        backBufferContext.fill()
      }
    }
    let lastStrokeStyleHeat = -1
    for (const edge of renderContext.canvasComponent.graph.edges) {
      const heat = this.getHeat(edge)
      if (heat > 0) {
        if (heat !== lastStrokeStyleHeat) {
          backBufferContext.strokeStyle = `rgba(255,255,255, ${heat})`
          backBufferContext.lineWidth = heat * 100 * scale
          backBufferContext.lineCap = 'square'
          lastStrokeStyleHeat = heat
        }
        const path = edge.style.renderer.getPathGeometry(edge, edge.style).getPath().flatten(1)
        backBufferContext.beginPath()
        const cursor = path.createCursor()
        if (cursor.moveNext()) {
          const point = renderContext.worldToViewCoordinates(cursor.currentEndPoint)
          backBufferContext.moveTo(point.x, point.y)
          while (cursor.moveNext()) {
            const point = renderContext.worldToViewCoordinates(cursor.currentEndPoint)
            backBufferContext.lineTo(point.x, point.y)
          }
          backBufferContext.stroke()
        }
      }
    }
    ctx.filter = 'url(#heatmap)'
    ctx.drawImage(canvas, 0, 0)
    ctx.restore()
  }
}
let installedDivElement = null
/**
 * Creates a heatmap visualization which displays the heat values for all nodes and edges
 * as a color map in the background.
 * @param graphComponent the graph component to which the heatmap is added
 * @param getHeat the heat function which provides the heat values for the graph elements
 */
export function addHeatmap(graphComponent, getHeat) {
  if (!installedDivElement || !document.body.contains(installedDivElement)) {
    installedDivElement = document.createElement('div')
    installedDivElement.setAttribute(
      'style',
      'height: 0px; width: 0px;position:absolute; top:0, left: 0; visibility: hidden'
    )
    installedDivElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="0" height="0">
  <defs>
    <filter id="heatmap" x="0" y="0" width="100%" height="100%">
      <!-- Blur the image - change blurriness via stdDeviation between 10 and maybe 25 - lower values may perform better -->
      <feGaussianBlur stdDeviation="16" edgeMode="none"/>
      <!-- Take the alpha value -->
      <feColorMatrix
        type="matrix"
        values="0 0 0 1 0
                0 0 0 1 0
                0 0 0 1 0
                0 0 0 1 0" />
      <!-- Map it to a "heat" rainbow colors -->
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0 0 0 0 1 1"></feFuncR>
        <feFuncG type="table" tableValues="0 0 1 1 1 0"></feFuncG>
        <feFuncB type="table" tableValues="0.5 1 0 0 0"></feFuncB>
        <!-- specify maximum opacity for the overlay here -->
        <!-- less opaque: <feFuncA type="table" tableValues="0 0.1 0.4 0.6 0.7"></feFuncA> -->
        <feFuncA type="table" tableValues="0 0.6 0.7 0.8 0.9"></feFuncA>
      </feComponentTransfer>
    </filter>
  </defs>
</svg>
`
    document.body.appendChild(installedDivElement)
  }
  return graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    IVisualCreator.create({
      createVisual() {
        return new HeatmapBackground(getHeat)
      },
      updateVisual(context, oldVisual) {
        return oldVisual
      }
    })
  )
}
