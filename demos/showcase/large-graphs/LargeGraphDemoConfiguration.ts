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
  DefaultLabelStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GeneralPath,
  IEdge,
  IEdgeStyle,
  IGraph,
  IInputModeContext,
  ImageNodeStyle,
  INode,
  INodeStyle,
  Point,
  Rect,
  Size,
  WebGL2Effect,
  WebGL2IconNodeStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2ShapeNodeShape,
  WebGL2ShapeNodeStyle
} from 'yfiles'
import getSVGDataURL from './SVGDataURLFetch'
import { DemoConfiguration } from './DemoConfiguration'
import { createDemoGroupStyle } from 'demo-resources/demo-styles'

abstract class LargeGraphDemoConfiguration extends DemoConfiguration {
  svgThreshold = 0.5

  // Node styles used in WebGL2 rendering
  webGL2NodeStyles: (WebGL2ShapeNodeStyle | WebGL2IconNodeStyle)[] = []
  // Node styles used in SVG rendering
  imageNodeStyles: ImageNodeStyle[] = []

  private webGL2GroupNodeStyle = new WebGL2ShapeNodeStyle('rectangle', '#bbb')

  private webGL2EdgeStyle = new WebGL2PolylineEdgeStyle({ targetArrow: 'default' })

  /**
   * Creates a random integer in the range [0, upper[.
   */
  private getRandomInt = (upper: number) => Math.floor(Math.random() * upper)

  webGL2EdgeStyleProvider = (edge: IEdge, graph: IGraph): WebGL2PolylineEdgeStyle => {
    return this.webGL2EdgeStyle
  }

  webGL2NodeStyleProvider = (node: INode, graph: IGraph) => {
    if (graph.isGroupNode(node)) {
      return this.webGL2GroupNodeStyle
    }
    return this.webGL2NodeStyles[this.getIndex(node)]
  }

  nodeStyleProvider = (node: INode, graph: IGraph): INodeStyle => {
    if (graph.isGroupNode(node)) {
      return graph.groupNodeDefaults.getStyleInstance()
    } else {
      return this.imageNodeStyles[this.getIndex(node)]
    }
  }

  edgeStyleProvider = (edge: IEdge, graph: IGraph): IEdgeStyle => {
    return graph.edgeDefaults.getStyleInstance()
  }

  nodeCreator = (
    context: IInputModeContext,
    graph: IGraph,
    location: Point,
    parent: INode | null
  ): INode | null => {
    const node = graph.createNode(
      parent,
      Rect.fromCenter(location, graph.nodeDefaults.size),
      null,
      {
        id: graph.nodes.size,
        type: this.getRandomInt(this.webGL2NodeStyles.length)
      }
    )
    graph.setStyle(node, this.imageNodeStyles[this.getIndex(node)])
    return node
  }

  /**
   * Sets default styles for nodes and labels
   */
  async initializeStyleDefaults(graph: IGraph) {
    await this.initializeNodeStyles()

    graph.nodeDefaults.size = new Size(50, 50)

    graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
      insets: [0, 0, 5, 0]
    }).createParameter(ExteriorLabelModelPosition.SOUTH)

    graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      backgroundFill: '#dfff'
    })

    graph.groupNodeDefaults.style = createDemoGroupStyle({})
  }

  protected createNode(graph: IGraph, id: any, layout: Rect, nodeData: any) {
    const node = graph.createNode({
      layout: layout,
      tag: { id, type: this.getRandomInt(this.webGL2NodeStyles.length) }
    })
    graph.setStyle(node, this.imageNodeStyles[this.getIndex(node)])
    graph.addLabel(node, `Item ${id}`)
    return node
  }

  /**
   * Returns a promise, which draws an image into the canvas after loading it.
   */
  private createImageDataPromise(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
    return new Promise<ImageData>(resolve => {
      image.onload = () => {
        ctx.clearRect(0, 0, 128, 128)
        ctx.drawImage(image, 0, 0, 75, 75, 0, 0, 128, 128)
        const imageData = ctx.getImageData(0, 0, 128, 128)
        resolve(imageData)
      }
    })
  }

  /**
   * Creates a WebGL2IconNodeStyle by awaiting the loading and drawing of the image
   * using {@link createImageDataPromise}
   */
  private async createWebGL2NodeStyle(
    dataURL: string,
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement
  ): Promise<WebGL2ShapeNodeStyle | WebGL2IconNodeStyle> {
    const promise = this.createImageDataPromise(ctx, image)
    image.src = dataURL
    const imageData = await promise

    return new WebGL2IconNodeStyle({
      icon: imageData,
      shape: WebGL2ShapeNodeShape.ELLIPSE,
      fill: 'white',
      stroke: 'none',
      effect: WebGL2Effect.NONE
    })
  }

  /**
   * Initializes the nodes styles used for WebGL2 and SVG rendering
   */
  private async initializeNodeStyles() {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', '128')
    canvas.setAttribute('height', '128')
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
    const image = new Image(75, 75)
    let count = 0
    for (const gender of ['female', 'male']) {
      for (let i = 0; i < 5; i++) {
        const dataURL = await getSVGDataURL(`resources/icons/usericon_${gender}${i + 1}.svg`)
        const circlePath = new GeneralPath()
        circlePath.appendEllipse(new Rect(0, 0, 1, 1), false)
        this.imageNodeStyles[count] = new ImageNodeStyle({
          image: dataURL,
          normalizedOutline: circlePath
        })
        this.webGL2NodeStyles[count] = await this.createWebGL2NodeStyle(dataURL, ctx, image)
        count++
      }
    }
  }

  private getIndex(node: INode) {
    const type = typeof node.tag?.type === 'number' ? node.tag?.type : 0
    return Math.max(0, Math.min(type, this.webGL2NodeStyles.length - 1))
  }
}

export class HierarchicDemoConfiguration extends LargeGraphDemoConfiguration {
  graphResourcePath = 'resources/hierarchic-10000-11000-circles.json'
}

export class OrganicDemoConfiguration extends LargeGraphDemoConfiguration {
  graphResourcePath = 'resources/balloon_10000_9999.json'
}
