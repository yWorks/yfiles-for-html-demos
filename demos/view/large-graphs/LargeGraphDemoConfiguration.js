/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import getSVGDataURL from './SVGDataURLFetch.js'
import { DemoConfiguration } from './DemoConfiguration.js'
import { createDemoGroupStyle } from '../../resources/demo-styles.js'

class LargeGraphDemoConfiguration extends DemoConfiguration {
  constructor() {
    super()
    this.svgThreshold = 0.5

    // Node styles used in WebGL2 rendering
    this.webGL2NodeStyles = []

    // Node styles used in SVG rendering
    this.imageNodeStyles = []

    this.webGL2GroupNodeStyle = new WebGL2ShapeNodeStyle('rectangle', '#bbb')
    this.webGL2EdgeStyle = new WebGL2PolylineEdgeStyle({ targetArrow: 'default' })

    // Creates a random integer in the range [0, upper[.
    this.getRandomInt = upper => Math.floor(Math.random() * upper)

    this.webGL2EdgeStyleProvider = (edge, graph) => {
      return this.webGL2EdgeStyle
    }

    this.webGL2NodeStyleProvider = (node, graph) => {
      if (graph.isGroupNode(node)) {
        return this.webGL2GroupNodeStyle
      }
      return this.webGL2NodeStyles[this.getIndex(node)]
    }

    this.nodeStyleProvider = (node, graph) => {
      if (graph.isGroupNode(node)) {
        return graph.groupNodeDefaults.getStyleInstance()
      } else {
        return this.imageNodeStyles[this.getIndex(node)]
      }
    }

    this.edgeStyleProvider = (edge, graph) => {
      return graph.edgeDefaults.getStyleInstance()
    }

    this.nodeCreator = (context, graph, location, parent) => {
      const node = graph.createNode(parent, new Rect(location, graph.nodeDefaults.size), null, {
        id: graph.nodes.size,
        type: this.getRandomInt(this.webGL2NodeStyles.length)
      })
      graph.setStyle(node, this.imageNodeStyles[this.getIndex(node)])
      return node
    }
  }

  /**
   * Sets default styles for nodes and labels
   * @param {!IGraph} graph
   */
  async initializeStyleDefaults(graph) {
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

  /**
   * @param {!IGraph} graph
   * @param {*} id
   * @param {!Rect} layout
   * @param {*} nodeData
   */
  createNode(graph, id, layout, nodeData) {
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
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!HTMLImageElement} image
   */
  createImageDataPromise(ctx, image) {
    return new Promise(resolve => {
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
   * @param {!string} dataURL
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!HTMLImageElement} image
   * @returns {!Promise.<(WebGL2ShapeNodeStyle|WebGL2IconNodeStyle)>}
   */
  async createWebGL2NodeStyle(dataURL, ctx, image) {
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
          image: dataURL,
          normalizedOutline: circlePath
        })
        this.webGL2NodeStyles[count] = await this.createWebGL2NodeStyle(dataURL, ctx, image)
        count++
      }
    }
  }

  /**
   * @param {!INode} node
   */
  getIndex(node) {
    const type = typeof node.tag?.type === 'number' ? node.tag?.type : 0
    return Math.max(0, Math.min(type, this.webGL2NodeStyles.length - 1))
  }
}

export class HierarchicDemoConfiguration extends LargeGraphDemoConfiguration {
  constructor() {
    super()
    this.graphResourcePath = 'resources/hierarchic-10000-11000-circles.json'
  }
}

export class OrganicDemoConfiguration extends LargeGraphDemoConfiguration {
  constructor() {
    super()
    this.graphResourcePath = 'resources/balloon_10000_9999.json'
  }
}
