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
  ExteriorNodeLabelModel,
  GeneralPath,
  IEdge,
  IEdgeStyle,
  IGraph,
  IInputModeContext,
  ImageNodeStyle,
  INode,
  INodeStyle,
  LabelStyle,
  Point,
  Rect,
  Size,
  WebGLEffect,
  WebGLImageNodeStyle,
  WebGLNodeStyleDecorator,
  WebGLShapeNodeShape,
  WebGLShapeNodeStyle
} from '@yfiles/yfiles'
import { getSVGDataURL } from './SVGDataURLFetch'
import { DemoConfiguration } from './DemoConfiguration'
import { createDemoGroupStyle } from '@yfiles/demo-resources/demo-styles'

class LargeGraphDemoConfiguration extends DemoConfiguration {
  svgThreshold = 0.5

  // Node styles used in WebGL rendering
  webGLNodeStyles = []
  // Node styles used in SVG rendering
  imageNodeStyles = []

  /**
   * Creates a random integer in the range [0, upper[.
   */
  getRandomInt = (upper) => Math.floor(Math.random() * upper)

  nodeStyleProvider = (node, graph) => {
    if (graph.isGroupNode(node)) {
      return graph.groupNodeDefaults.getStyleInstance()
    } else {
      const nodeIndex = this.getIndex(node)
      return new WebGLNodeStyleDecorator(
        this.imageNodeStyles[nodeIndex],
        this.webGLNodeStyles[nodeIndex]
      )
    }
  }

  edgeStyleProvider = (edge, graph) => {
    return graph.edgeDefaults.getStyleInstance()
  }

  nodeCreator = (context, graph, location, parent) => {
    const node = graph.createNode({
      parent,
      layout: Rect.fromCenter(location, graph.nodeDefaults.size),
      tag: { id: graph.nodes.size, type: this.getRandomInt(this.webGLNodeStyles.length) }
    })
    graph.setStyle(node, this.nodeStyleProvider(node, graph))
    return node
  }

  /**
   * Sets default styles for nodes and labels
   */
  async initializeStyleDefaults(graph) {
    await this.initializeNodeStyles()

    graph.nodeDefaults.size = new Size(50, 50)

    graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
      margins: [0, 0, 5, 0]
    }).createParameter('bottom')

    graph.nodeDefaults.labels.style = new LabelStyle({ backgroundFill: '#fffd' })

    graph.groupNodeDefaults.style = createDemoGroupStyle({})
  }

  createNode(graph, id, layout, nodeData) {
    const node = graph.createNode({
      layout: layout,
      tag: { id, type: this.getRandomInt(this.webGLNodeStyles.length) }
    })
    graph.setStyle(node, this.nodeStyleProvider(node, graph))
    graph.addLabel(node, `Item ${id}`)
    return node
  }

  /**
   * Returns a promise, which draws an image into the canvas after loading it.
   */
  createImageDataPromise(ctx, image) {
    return new Promise((resolve) => {
      image.onload = () => {
        ctx.clearRect(0, 0, 128, 128)
        ctx.drawImage(image, 0, 0, 75, 75, 0, 0, 128, 128)
        const imageData = ctx.getImageData(0, 0, 128, 128)
        resolve(imageData)
      }
    })
  }

  /**
   * Creates a WebGLImageNodeStyle by awaiting the loading and drawing of the image
   * using {@link createImageDataPromise}
   */
  async createWebGLNodeStyle(dataURL, ctx, image) {
    const promise = this.createImageDataPromise(ctx, image)
    image.src = dataURL
    const imageData = await promise

    return new WebGLImageNodeStyle({
      image: imageData,
      backgroundShape: WebGLShapeNodeShape.ELLIPSE,
      backgroundFill: 'white',
      backgroundStroke: 'none',
      effect: WebGLEffect.NONE
    })
  }

  /**
   * Initializes the nodes styles used for WebGL and SVG rendering
   */
  async initializeNodeStyles() {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', '128')
    canvas.setAttribute('height', '128')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const image = new Image(75, 75)
    let count = 0
    for (const gender of ['female', 'male']) {
      for (let i = 0; i < 5; i++) {
        const dataURL = await getSVGDataURL(`resources/icons/usericon_${gender}${i + 1}.svg`)
        const circlePath = new GeneralPath()
        circlePath.appendEllipse(new Rect(0, 0, 1, 1), false)
        this.imageNodeStyles[count] = new ImageNodeStyle({
          href: dataURL,
          normalizedOutline: circlePath
        })
        this.webGLNodeStyles[count] = await this.createWebGLNodeStyle(dataURL, ctx, image)
        count++
      }
    }
  }

  getIndex(node) {
    const type = typeof node.tag?.type === 'number' ? node.tag?.type : 0
    return Math.max(0, Math.min(type, this.webGLNodeStyles.length - 1))
  }
}

export class HierarchicalDemoConfiguration extends LargeGraphDemoConfiguration {
  graphResourcePath = 'resources/hierarchic-10000-11000-circles.json'
}

export class OrganicDemoConfiguration extends LargeGraphDemoConfiguration {
  graphResourcePath = 'resources/radial_tree_10000_9999.json'
}
