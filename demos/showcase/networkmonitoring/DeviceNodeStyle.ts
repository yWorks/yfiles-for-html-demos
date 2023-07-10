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
  GeneralPath,
  GeomUtilities,
  type IInputModeContext,
  type INode,
  type IRenderContext,
  NodeStyleBase,
  type Point,
  SvgVisual
} from 'yfiles'
import { convertLoadToColor, type Device, DeviceKind } from './model/Device'

/**
 * A node style that visualizes the devices of a network.
 * It renders the icon according to the device kind and adds the 'failed' icon if necessary.
 */
export class DeviceNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance of NetworkMonitoringNodeStyle.
   */
  constructor(
    private readonly dataProvider: (node: INode) => Device,
    private readonly imageProvider: (device: Device) => string
  ) {
    super()
  }

  createVisual(context: IRenderContext, node: INode): SvgVisual {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement &
      RenderDataHolder

    const device = this.dataProvider(node)

    // create the image that represents the node type
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    container.appendChild(image)

    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.imageProvider(device))
    image.setAttribute('width', String(node.layout.width * 0.6))
    image.setAttribute('height', String(node.layout.height * 0.6))

    const dxImage = node.layout.width * 0.2
    const dyImage = node.layout.height * 0.2
    image.setAttribute('transform', `translate(${dxImage} ${dyImage})`)

    // visualize enabled and failed status
    const isDeviceWorking = device.enabled && !device.failed
    if (isDeviceWorking) {
      image.setAttribute('class', 'enabled')
    } else {
      container.style.setProperty('cursor', 'pointer')
      image.setAttribute('class', 'disabled')
    }

    // add the ellipse indicating the current load
    container.appendChild(createLoadIndicator(device))

    // add the 'failed' icon, if necessary
    if (device.failed) {
      container.appendChild(createExclamationMark())
    }

    // set the location
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)

    // cache the node's properties
    container.renderData = {
      enabled: device.enabled,
      failed: device.failed,
      load: device.load
    }

    return new SvgVisual(container)
  }

  updateVisual(context: IRenderContext, oldVisual: SvgVisual, node: INode): SvgVisual {
    const device = node.tag as Device
    const container = oldVisual.svgElement as SVGGElement & RenderDataHolder
    const oldData = container.renderData

    // update the image
    const wasNodeWorking = oldData.enabled && oldData.failed
    const isNodeWorking = device.enabled && device.failed

    if (isNodeWorking !== wasNodeWorking) {
      const image = container.childNodes.item(0) as SVGImageElement
      image.setAttribute('class', isNodeWorking ? 'enabled' : 'disabled')
    }

    // update the load indicator
    if (dataChanged(oldData, device)) {
      const loadIndicator = container.childNodes.item(1) as SVGEllipseElement
      updateLoadIndicator(device, loadIndicator)
    }

    // update the 'failed' icon
    if (oldData.failed !== device.failed) {
      if (device.failed) {
        container.style.setProperty('cursor', 'pointer')
        container.appendChild(createExclamationMark())
      } else {
        container.style.removeProperty('cursor')
        removeExclamationMark(container)
      }
    }

    // cache the node's properties
    container.renderData = {
      enabled: device.enabled,
      failed: device.failed,
      load: device.load
    }

    // make sure that the location is up-to-date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Gets the outline of the node, which is an elliptic shape in this case.
   */
  getOutline(node: INode): GeneralPath {
    const outline = new GeneralPath()
    outline.appendEllipse(node.layout, false)
    return outline
  }

  /**
   * Gets the intersection of a line with the visual representation of the node.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   */
  getIntersection(node: INode, inner: Point, outer: Point): Point | null {
    return GeomUtilities.findEllipseLineIntersection(node.layout.toRect(), inner, outer)
  }

  /**
   * Determines whether the provided point is inside the visual bounds of the node.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   */
  isInside(node: INode, point: Point): boolean {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   */
  isHit(canvasContext: IInputModeContext, location: Point, node: INode): boolean {
    return GeomUtilities.ellipseContains(
      node.layout.toRect(),
      location,
      canvasContext.hitTestRadius
    )
  }
}

type RenderData = {
  enabled: boolean
  failed: boolean
  load: number
}

type RenderDataHolder = { renderData: RenderData }

function dataChanged(data1: RenderData, data2: RenderData): boolean {
  return Object.entries(data1).some(([key, value]) => {
    return value !== data2[key as keyof RenderData]
  })
}

/**
 * Create a load indicator element.
 */
function createLoadIndicator(device: Device): SVGElement {
  const loadIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  loadIndicator.setAttribute('cx', '0')
  loadIndicator.setAttribute('cy', '0')
  loadIndicator.setAttribute('rx', '6')
  loadIndicator.setAttribute('ry', '6')
  loadIndicator.setAttribute('stroke-width', '2')
  loadIndicator.setAttribute('stroke', '#FFF')
  loadIndicator.setAttribute('fill', convertLoadToColor(device.load, 1))

  // place the indicator individually for each node type
  loadIndicator.setAttribute('transform', getIndicatorTranslation(device))

  // hide the indicator if the node is failed or disabled
  const isDeviceWorking = device.enabled && !device.failed
  if (!isDeviceWorking) {
    loadIndicator.setAttribute('display', 'none')
  }

  return loadIndicator
}

/**
 * Updates the visibility and color of the load indicator.
 */
function updateLoadIndicator(device: Device, loadIndicator: SVGElement): void {
  const isDeviceWorking = device.enabled && !device.failed
  if (!isDeviceWorking) {
    loadIndicator.setAttribute('display', 'none')
  } else {
    loadIndicator.removeAttribute('display')
    loadIndicator.setAttribute('fill', convertLoadToColor(device.load, 1))
  }
}

/**
 * Create an exclamation mark icon element.
 */
function createExclamationMark(): SVGElement {
  const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/exclamation.svg')
  imageElement.setAttribute('width', '24')
  imageElement.setAttribute('height', '24')
  imageElement.setAttribute('transform', 'translate(36,30)')
  imageElement.setAttribute('class', 'failed')
  imageElement.setAttribute('cursor', 'pointer')
  imageElement.setAttribute('data-exclamation-mark', 'true')
  return imageElement
}

/**
 * Removes the 'failed' icon from the given g element.
 */
function removeExclamationMark(container: SVGGElement): void {
  for (const child of container.children) {
    if (child.hasAttribute('data-exclamation-mark')) {
      container.removeChild(child)
      return
    }
  }
}

function getIndicatorTranslation(device: Device): string {
  switch (device.kind) {
    case DeviceKind.WORKSTATION:
      return 'translate(48,15)'
    case DeviceKind.LAPTOP:
      return 'translate(45,15)'
    case DeviceKind.SMARTPHONE:
      return 'translate(42,17)'
    case DeviceKind.SWITCH:
      return 'translate(48,24)'
    case DeviceKind.WLAN:
      return 'translate(48,38)'
    case DeviceKind.SERVER:
      return 'translate(42,20)'
    case DeviceKind.DATABASE:
      return 'translate(42,18)'
    default:
      return 'translate(48,15)'
  }
}
