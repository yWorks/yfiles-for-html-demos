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
import { GeneralPath, GeometryUtilities, NodeStyleBase, SvgVisual } from '@yfiles/yfiles'
import { convertLoadToColor, DeviceKind } from './model/Device'

/**
 * A node style that visualizes the devices of a network.
 * It renders the icon according to the device kind and adds the 'failed' icon if necessary.
 */
export class DeviceNodeStyle extends NodeStyleBase {
  imageProvider
  dataProvider

  /**
   * Creates a new instance of NetworkMonitoringNodeStyle.
   */
  constructor(dataProvider, imageProvider) {
    super()
    this.dataProvider = dataProvider
    this.imageProvider = imageProvider
  }

  createVisual(context, node) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

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
    const renderData = { enabled: device.enabled, failed: device.failed, load: device.load }

    return SvgVisual.from(container, renderData)
  }

  updateVisual(context, oldVisual, node) {
    const device = node.tag
    const container = oldVisual.svgElement
    const oldData = oldVisual.tag

    // update the image
    const wasNodeWorking = oldData.enabled && oldData.failed
    const isNodeWorking = device.enabled && device.failed

    if (isNodeWorking !== wasNodeWorking) {
      const image = container.childNodes.item(0)
      image.setAttribute('class', isNodeWorking ? 'enabled' : 'disabled')
    }

    // update the load indicator
    if (dataChanged(oldData, device)) {
      const loadIndicator = container.childNodes.item(1)
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
    oldVisual.tag = { enabled: device.enabled, failed: device.failed, load: device.load }

    // make sure that the location is up-to-date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Gets the outline of the node, which is an elliptic shape in this case.
   */
  getOutline(node) {
    const outline = new GeneralPath()
    outline.appendEllipse(node.layout, false)
    return outline
  }

  /**
   * Gets the intersection of a line with the visual representation of the node.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   */
  getIntersection(node, inner, outer) {
    return GeometryUtilities.getEllipseLineIntersection(node.layout.toRect(), inner, outer)
  }

  /**
   * Determines whether the provided point is inside the visual bounds of the node.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   */
  isInside(node, point) {
    return GeometryUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   */
  isHit(canvasContext, location, node) {
    return GeometryUtilities.ellipseContains(
      node.layout.toRect(),
      location,
      canvasContext.hitTestRadius
    )
  }
}

function dataChanged(data1, data2) {
  return Object.entries(data1).some(([key, value]) => {
    return value !== data2[key]
  })
}

/**
 * Create a load indicator element.
 */
function createLoadIndicator(device) {
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
function updateLoadIndicator(device, loadIndicator) {
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
function createExclamationMark() {
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
function removeExclamationMark(container) {
  for (const child of container.children) {
    if (child.hasAttribute('data-exclamation-mark')) {
      container.removeChild(child)
      return
    }
  }
}

function getIndicatorTranslation(device) {
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
