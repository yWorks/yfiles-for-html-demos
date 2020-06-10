/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IInputModeContext,
  INode,
  IRenderContext,
  NodeStyleBase,
  Point,
  SvgVisual,
  Visual
} from 'yfiles'
import ModelNode from './ModelNode.js'

/**
 * A node style that renders the icon according to the node type
 * and adds the 'failed' icon if necessary.
 */
export default class NetworkMonitoringNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance of NetworkMonitoringNodeStyle.
   * @param {boolean} passiveSupported Whether or not the browser supports active and passive event listeners.
   */
  constructor(passiveSupported) {
    super()
    this.passiveSupported = !!passiveSupported
  }

  /**
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @param {IRenderContext} context
   * @param {INode} node
   * @return {SvgVisual}
   */
  createVisual(context, node) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // create the image that represents the node type
    const image = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
    g.appendChild(image)
    const modelNode = node.tag
    switch (modelNode.type) {
      case ModelNode.WORKSTATION:
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/workstation.svg')
        break
      case ModelNode.LAPTOP:
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/laptop.svg')
        break
      case ModelNode.SMARTPHONE:
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/smartphone.svg')
        break
      case ModelNode.SWITCH:
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/switch.svg')
        break
      case ModelNode.WLAN:
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/wlan.svg')
        break
      case ModelNode.SERVER:
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/server.svg')
        break
      case ModelNode.DATABASE:
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', './resources/database.svg')
        break
      default:
        image.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'href',
          './resources/ModelNode.WORKSTATION.svg'
        )
        break
    }
    image.setAttribute('width', (node.layout.width * 0.6).toString())
    image.setAttribute('height', (node.layout.height * 0.6).toString())
    image.setAttribute(
      'transform',
      `translate(${node.layout.width * 0.2} ${node.layout.height * 0.2})`
    )
    // set CSS class according to enabled/disabled and failed status
    if (modelNode.enabled && !modelNode.failed) {
      image.setAttribute('class', 'enabled')
    } else {
      g.style.setProperty('cursor', 'pointer', null)
      image.setAttribute('class', 'disabled')
    }

    // set the location
    g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)

    // add the ellipse indicating the current load
    addLoadIndicator(node, g)

    // add the 'failed' icon, if necessary
    if (modelNode.failed) {
      addExclamationMark(g, modelNode, this.passiveSupported)
    }
    // cache the node's properties
    const cache = {}
    cache.enabled = modelNode.enabled
    cache.failed = modelNode.failed
    cache.load = modelNode.load
    g['data-renderDataCache'] = cache

    return new SvgVisual(g)
  }

  /**
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @param {INode} node
   * @return {SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const modelNode = node.tag
    const svgElement = oldVisual.svgElement
    const cache = svgElement['data-renderDataCache']

    // update the enabled/disabled CSS class
    if (cache.enabled !== modelNode.enabled || cache.failed !== modelNode.failed) {
      svgElement.firstChild.setAttribute(
        'class',
        modelNode.enabled && !modelNode.failed ? 'enabled' : 'disabled'
      )
    }
    // update the load indicator
    if (
      cache.load !== modelNode.load ||
      cache.enabled !== modelNode.enabled ||
      cache.failed !== modelNode.failed
    ) {
      updateLoadIndicator(node, svgElement.childNodes.item(1))
    }
    // update the 'failed' icon
    if (cache.failed !== modelNode.failed) {
      if (modelNode.failed) {
        svgElement.style.setProperty('cursor', 'pointer', null)
        addExclamationMark(svgElement, modelNode, this.passiveSupported)
      } else {
        svgElement.style.removeProperty('cursor')
        removeExclamationMark(svgElement)
      }
    }

    // update the cache
    cache.load = modelNode.load
    cache.enabled = modelNode.enabled
    cache.failed = modelNode.failed

    // make sure that the location is up to date
    svgElement.transform.baseVal.getItem(0).setTranslate(node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Gets the outline of the node, which is an elliptic shape in this case.
   * @see Overrides {@link NodeStyleBase#getOutline}
   * @param {INode} node
   * @return {GeneralPath}
   */
  getOutline(node) {
    const outline = new GeneralPath()
    outline.appendEllipse(node.layout, false)
    return outline
  }

  /**
   * Gets the intersection of a line with the visual representation of the node.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   * @see Overrides {@link NodeStyleBase#getIntersection}
   * @param {INode} node
   * @param {Point} inner
   * @param {Point} outer
   * @return {Point}
   */
  getIntersection(node, inner, outer) {
    return GeomUtilities.findEllipseLineIntersection(node.layout.toRect(), inner, outer)
  }

  /**
   * Determines whether the provided point is geometrically inside the visual bounds of the node.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   * @see Overrides {@link NodeStyleBase#isInside}
   * @param {INode} node
   * @param {Point} point
   * @return {boolean}
   */
  isInside(node, point) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * This method is implemented explicitly to optimize the performance for elliptic shape.
   * @see Overrides {@link NodeStyleBase#isHit}
   * @param {IInputModeContext} canvasContext
   * @param {Point} location
   * @param {INode} node
   * @return {boolean}
   */
  isHit(canvasContext, location, node) {
    return GeomUtilities.ellipseContains(
      node.layout.toRect(),
      location,
      canvasContext.hitTestRadius
    )
  }

  /**
   * Converts the given load to a color.
   * Returns a hex encoded color in the form 'hsla(h,s,l,a)'.
   * @param {number} load
   * @param {number} alpha
   * @return {string}
   */
  static convertLoadToColor(load, alpha) {
    if (typeof alpha === 'undefined') {
      alpha = 1
    }
    return `hsla(${(1 - load) * 120},80%,50%,${alpha})`
  }
}

/**
 * Adds a load indicator to the given g element.
 * @param {INode} node
 * @param {SVGElement} g
 */
function addLoadIndicator(node, g) {
  const modelNode = node.tag
  const loadIndicator = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  loadIndicator.setAttribute('cx', 0)
  loadIndicator.setAttribute('cy', 0)
  loadIndicator.setAttribute('rx', '6')
  loadIndicator.setAttribute('ry', '6')
  loadIndicator.setAttribute('stroke-width', 2)
  loadIndicator.setAttribute('stroke', '#FFF')
  loadIndicator.setAttribute(
    'fill',
    NetworkMonitoringNodeStyle.convertLoadToColor(modelNode.load, 1)
  )
  // place the indicator individually for each node type
  switch (modelNode.type) {
    case ModelNode.WORKSTATION:
      loadIndicator.setAttribute('transform', 'translate(48,15)')
      break
    case ModelNode.LAPTOP:
      loadIndicator.setAttribute('transform', 'translate(45,15)')
      break
    case ModelNode.SMARTPHONE:
      loadIndicator.setAttribute('transform', 'translate(42,17)')
      break
    case ModelNode.SWITCH:
      loadIndicator.setAttribute('transform', 'translate(48,24)')
      break
    case ModelNode.WLAN:
      loadIndicator.setAttribute('transform', 'translate(48,38)')
      break
    case ModelNode.SERVER:
      loadIndicator.setAttribute('transform', 'translate(42,20)')
      break
    case ModelNode.DATABASE:
      loadIndicator.setAttribute('transform', 'translate(42,18)')
      break
    default:
      loadIndicator.setAttribute('transform', 'translate(48,15)')
      break
  }
  // hide the indicator if the node is failed or disabled
  if (modelNode.failed || !modelNode.enabled) {
    loadIndicator.setAttribute('display', 'none')
  }
  g.appendChild(loadIndicator)
}

/**
 * Updates the visibility and color of the load indicator.
 * @param {INode} node
 * @param {Element} loadIndicator
 */
function updateLoadIndicator(node, loadIndicator) {
  const modelNode = node.tag
  if (modelNode.failed || !modelNode.enabled) {
    loadIndicator.setAttribute('display', 'none')
  } else {
    loadIndicator.removeAttribute('display')
    loadIndicator.setAttribute(
      'fill',
      NetworkMonitoringNodeStyle.convertLoadToColor(modelNode.load, 1)
    )
  }
}

/**
 * Adds the 'failed' icon to the given g element.
 * @param {Element} g
 * @param {INode} node
 * @param {boolean} passiveSupported Whether or not the browser supports active and passive event listeners.
 */
function addExclamationMark(g, node, passiveSupported) {
  const imageExclamation = window.document.createElementNS('http://www.w3.org/2000/svg', 'image')
  imageExclamation.setAttributeNS(
    'http://www.w3.org/1999/xlink',
    'href',
    './resources/exclamation.svg'
  )
  imageExclamation.setAttribute('width', '24')
  imageExclamation.setAttribute('height', '24')
  imageExclamation.setAttribute('transform', 'translate(36,30)')
  imageExclamation.setAttribute('class', 'failed')
  imageExclamation.setAttribute('cursor', 'pointer')
  // add listeners that "repair" the failed node
  const repairNode = evt => {
    node.failed = false
    node.enabled = true
    evt.stopImmediatePropagation()
  }
  imageExclamation.addEventListener('mousedown', repairNode, true)
  imageExclamation.addEventListener(
    'touchstart',
    repairNode,
    passiveSupported ? { passive: false } : true
  )
  g.appendChild(imageExclamation)
}

/**
 * Removes the 'failed' icon from the given g element.
 * @param {Element} g
 */
function removeExclamationMark(g) {
  while (g.childNodes.length > 2) {
    g.removeChild(g.lastChild)
  }
}
