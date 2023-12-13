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
  type GraphComponent,
  type IEdge,
  type INode,
  StyleDecorationZoomPolicy,
  WebGL2GraphModelManager,
  WebGL2HighlightIndicatorManager,
  WebGL2IconNodeStyle,
  WebGL2IndicatorType,
  WebGL2NodeIndicatorStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager
} from 'yfiles'
import { getEdgeType, getEntityData, isFraud } from '../entity-data'
import { BrowserDetection } from 'demo-utils/BrowserDetection'
import { edgeStyleMapping, nodeStyleMapping } from './graph-styles'
import { createCanvasContext } from 'demo-utils/IconCreation'

let nodeStyles: Record<string, WebGL2IconNodeStyle>
let edgeStyles: Record<string, WebGL2PolylineEdgeStyle>

/**
 * Creates the WebGL styles used for nodes and edges.
 */
async function initializeWebGLStyles(): Promise<void> {
  // create the WebGL styles for nodes and edges
  nodeStyles = await createWebGLNodeStyles()
  edgeStyles = createWebGLEdgeStyles()
}

/**
 * Enables WebGL2 as the rendering technique if this supported by the browser.
 */
export async function enableWebGLRendering(graphComponent: GraphComponent): Promise<void> {
  if (BrowserDetection.webGL2) {
    // install the WebGL2GraphModelManager responsible for the WebGL rendering
    const webGL2GraphModelManager = new WebGL2GraphModelManager()
    graphComponent.graphModelManager = webGL2GraphModelManager
    webGL2GraphModelManager.nodeLabelGroup.above(webGL2GraphModelManager.nodeGroup)

    await initializeWebGLStyles()

    // update the node/edge style, every time that the tag of the node/edge changes
    // this will make sure that the node/edge colors are correctly updated when a node/edge is marked
    // as fraud and vice-versa
    const graph = graphComponent.graph
    graph.addNodeTagChangedListener((_, evt): void => {
      updateNodeStyle(graphComponent, evt.item)
    })

    graph.addEdgeTagChangedListener((_, evt): void => {
      updateEdgeStyle(graphComponent, evt.item)
    })

    // initialize the selection and the highlight style so that they also use WebGL2 as a
    // rendering technique
    graphComponent.highlightIndicatorManager = new WebGL2HighlightIndicatorManager({
      nodeStyle: new WebGL2NodeIndicatorStyle({
        type: WebGL2IndicatorType.SOLID,
        thickness: 3,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED,
        primaryColor: 'slateblue'
      })
    })

    graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager({
      nodeStyle: new WebGL2NodeIndicatorStyle({
        type: WebGL2IndicatorType.SOLID,
        thickness: 3,
        zoomPolicy: StyleDecorationZoomPolicy.MIXED,
        primaryColor: 'darkblue'
      })
    })
  }
}

/**
 * Updates the WebGL2 style of the given node, if needed.
 */
export function updateNodeStyle(graphComponent: GraphComponent, node: INode): void {
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  const entity = getEntityData(node)
  const oldStyle = gmm.getStyle(node) as WebGL2IconNodeStyle
  if (needsUpdate(node, entity.type, oldStyle, nodeStyles)) {
    const type = getEntityData(node).type
    gmm.setStyle(node, nodeStyles[isFraud(node) ? type + ' Fraud' : type])
  }
}

/**
 * Updates the WebGL2 style of the given edge, if needed.
 */
export function updateEdgeStyle(graphComponent: GraphComponent, edge: IEdge): void {
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager
  const oldStyle = gmm.getStyle(edge) as WebGL2PolylineEdgeStyle
  if (needsUpdate(edge, getEdgeType(edge), oldStyle, edgeStyles)) {
    const type = getEdgeType(edge)
    gmm.setStyle(edge, edgeStyles[isFraud(edge) && type === 'untyped' ? type + ' Fraud' : type])
  }
}

/**
 * Sets the new WebGL2 styles to the nodes and the edges of the given graphComponent.
 */
export function setWebGL2Styles(graphComponent: GraphComponent): void {
  if (!BrowserDetection.webGL2) {
    return
  }
  const graph = graphComponent.graph
  graph.nodes.forEach((node) => {
    updateNodeStyle(graphComponent, node)
  })

  graph.edges.forEach((edge) => {
    updateEdgeStyle(graphComponent, edge)
  })
}

/**
 * Checks whether the given style needs an update.
 * The style will be updated only if the 'fraud' property of an item has been changed,
 * and the old style does not match with the new value of this property.
 */
function needsUpdate(
  item: INode | IEdge,
  type: string,
  oldStyle: WebGL2IconNodeStyle | WebGL2PolylineEdgeStyle,
  styles: Record<string, WebGL2IconNodeStyle> | Record<string, WebGL2PolylineEdgeStyle>
): boolean {
  const fraud = isFraud(item)
  return (
    (fraud && !oldStyle.equals(styles[type + ' Fraud'])) ||
    (!fraud && !oldStyle.equals(styles[type]))
  )
}

/**
 * Creates two WebGL node styles for each of the node types stored in `nodeStyleMapping`.
 * One will be used for nodes that are not involved in fraud rings while the other will be used for
 * `fraud` nodes.
 */
async function createWebGLNodeStyles(): Promise<Record<string, WebGL2IconNodeStyle>> {
  const webglNodeStyles: Record<string, WebGL2IconNodeStyle> = {}

  const canvasSize = 90 // square canvas
  const ctx = createCanvasContext(canvasSize, canvasSize)

  // create two WebGL Styles for each record
  for (const record of Object.keys(nodeStyleMapping)) {
    const style = nodeStyleMapping[record]

    const imageData = await getImageData(ctx, style.image, canvasSize)
    // one with normal nodes
    webglNodeStyles[record] = new WebGL2IconNodeStyle({
      icon: imageData,
      fill: style.fill,
      stroke: `4px ${style.stroke}`
    })

    // one for fraud nodes
    webglNodeStyles[record + ' Fraud'] = new WebGL2IconNodeStyle({
      icon: imageData,
      fill: '#ff6c00',
      stroke: '3px #ff6c00'
    })
  }
  return webglNodeStyles
}

/**
 * Creates two WebGL edge styles for each of the edge types stored in `edgeStyleMapping`.
 * One will be used for edges that are not marked as `fraud` connections while the other will be used for
 * `fraud` edges.
 */
function createWebGLEdgeStyles(): Record<string, WebGL2PolylineEdgeStyle> {
  const webglEdgeStyles: Record<string, WebGL2PolylineEdgeStyle> = {}

  for (const record of Object.keys(edgeStyleMapping)) {
    webglEdgeStyles[record] = new WebGL2PolylineEdgeStyle({
      stroke: `5px ${edgeStyleMapping[record]}`
    })

    webglEdgeStyles[record + ' Fraud'] = new WebGL2PolylineEdgeStyle({
      stroke: `5px #ff6c00`
    })
  }
  return webglEdgeStyles
}

/**
 * Creates an {@link ImageData} icon from a given url.
 * @param ctx The canvas context in which to render the icon
 * @param url The image url
 * @param canvasSize The render size of the source image
 */
function getImageData(
  ctx: CanvasRenderingContext2D,
  url: string,
  canvasSize: number
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const image = new Image(canvasSize, canvasSize)
    const imageSize = 60 // square icon
    image.onload = (): void => {
      // render the image into the canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize)
      ctx.drawImage(
        image,
        (canvasSize - imageSize) / 2,
        (canvasSize - imageSize) / 2,
        imageSize,
        imageSize
      )
      const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize)
      resolve(imageData)
    }
    image.onerror = (): void => {
      reject('Loading the image failed.')
    }
    image.src = url
  })
}
