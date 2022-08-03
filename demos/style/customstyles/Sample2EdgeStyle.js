/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  BaseClass,
  BridgeManager,
  Class,
  EdgeStyleBase,
  GeneralPath,
  GraphMLAttribute,
  IArrow,
  ICanvasContext,
  IEdge,
  IInputModeContext,
  ILookup,
  INode,
  IObstacleProvider,
  IRenderContext,
  ISvgDefsCreator,
  MarkupExtension,
  Point,
  Rect,
  SvgVisual,
  TypeAttribute,
  Visual,
  YBoolean,
  YString
} from 'yfiles'
import { isColorSetName } from '../../resources/demo-styles.js'
import { Sample2Arrow } from './Sample2Arrow.js'
import { SVGNS } from './Namespaces.js'

/**
 * A custom demo edge style whose colors match the given well-known CSS style.
 */
export class Sample2EdgeStyle extends EdgeStyleBase {
  /**
   * @param {!(string|ColorSetName)} [cssClass]
   */
  constructor(cssClass) {
    super()
    this.cssClass = cssClass

    this.hiddenArrow = new Arrow({
      type: ArrowType.NONE,
      cropLength: 6,
      scale: 1
    })

    this.fallbackArrow = new Sample2Arrow()
    this.markerDefsSupport = null
    this.showTargetArrows = true
    this.useMarkerArrows = true
  }

  /**
   * Helper function to crop a {@link GeneralPath} by the length of the used arrow.
   * @param {!IEdge} edge
   * @param {?GeneralPath} gp
   * @returns {?GeneralPath}
   */
  cropRenderedPath(edge, gp) {
    if (!gp) {
      return null
    }
    if (this.showTargetArrows) {
      const dummyArrow =
        !isBrowserWithBadMarkerSupport && this.useMarkerArrows
          ? this.hiddenArrow
          : this.fallbackArrow
      return this.cropPath(edge, IArrow.NONE, dummyArrow, gp)
    }
    return this.cropPath(edge, IArrow.NONE, IArrow.NONE, gp)
  }

  /**
   * Creates the visual for an edge.
   * @param {!IRenderContext} renderContext
   * @param {!IEdge} edge
   * @returns {?Visual}
   */
  createVisual(renderContext, edge) {
    let renderPath = this.createPath(edge)
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.cropRenderedPath(edge, renderPath)

    if (!renderPath || renderPath.getLength() === 0) {
      return null
    }

    const gp = this.createPathWithBridges(renderPath, renderContext)

    const path = document.createElementNS(SVGNS, 'path')
    const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
    path.setAttribute('d', pathData)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#662b00')
    path.setAttribute('stroke-width', '1.5px')

    if (this.cssClass) {
      if (isColorSetName(this.cssClass)) {
        path.setAttribute('class', `${this.cssClass}-edge`)
        this.fallbackArrow.cssClass = this.cssClass
      } else {
        path.setAttribute('class', this.cssClass)
        this.fallbackArrow.cssClass = `${this.cssClass}-arrow`
      }
    }

    if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
      this.showTargetArrows &&
        path.setAttribute(
          'marker-end',
          'url(#' + renderContext.getDefsId(this.createMarker()) + ')'
        )
      path['data-renderDataCache'] = {
        path: renderPath,
        obstacleHash: this.getObstacleHash(renderContext)
      }
      return new SvgVisual(path)
    }

    // use yfiles arrows instead of markers
    const container = document.createElementNS(SVGNS, 'g')
    container.appendChild(path)
    this.showTargetArrows &&
      super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.fallbackArrow)
    container['data-renderDataCache'] = {
      path: renderPath,
      obstacleHash: this.getObstacleHash(renderContext)
    }
    return new SvgVisual(container)
  }

  /**
   * Re-renders the edge by updating the old visual for improved performance.
   * @param {!IRenderContext} renderContext
   * @param {!SvgVisual} oldVisual
   * @param {!IEdge} edge
   * @returns {?Visual}
   */
  updateVisual(renderContext, oldVisual, edge) {
    if (oldVisual === null) {
      return this.createVisual(renderContext, edge)
    }

    let renderPath = this.createPath(edge)
    if (!renderPath || renderPath.getLength() === 0) {
      return null
    }
    // crop the path such that the arrow tip is at the end of the edge
    renderPath = this.cropRenderedPath(edge, renderPath)
    const newObstacleHash = this.getObstacleHash(renderContext)

    const path = oldVisual.svgElement
    const cache = path['data-renderDataCache']
    if (
      renderPath &&
      (!renderPath.hasSameValue(cache.path) || cache.obstacleHash !== newObstacleHash)
    ) {
      cache.path = renderPath
      cache.obstacleHash = newObstacleHash
      const gp = this.createPathWithBridges(renderPath, renderContext)
      const pathData = gp.size === 0 ? '' : gp.createSvgPathData()
      if (!isBrowserWithBadMarkerSupport && this.useMarkerArrows) {
        // update code for marker arrows
        path.setAttribute('d', pathData)
        return oldVisual
      } else {
        // update code for yfiles arrows
        const container = oldVisual.svgElement
        const path = container.childNodes.item(0)
        path.setAttribute('d', pathData)
        while (container.childElementCount > 1) {
          container.removeChild(container.lastChild)
        }
        this.showTargetArrows &&
          super.addArrows(renderContext, container, edge, gp, IArrow.NONE, this.fallbackArrow)
      }
    }
    return oldVisual
  }

  /**
   * Creates the path of an edge.
   * @param {!IEdge} edge
   * @returns {?GeneralPath}
   */
  createPath(edge) {
    if (
      edge.sourcePort &&
      edge.targetPort &&
      edge.sourcePort.owner === edge.targetPort.owner &&
      edge.bends.size < 2
    ) {
      // pretty self loops
      let outerX, outerY
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (edge.sourcePort.owner instanceof INode) {
          outerX = edge.sourcePort.owner.layout.x - 20
          outerY = edge.sourcePort.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
            edge.sourcePort,
            edge.sourcePort.locationParameter
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }
      const path = new GeneralPath(4)
      const sourceLocation = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      path.moveTo(sourceLocation)
      path.lineTo(outerX, sourceLocation.y)
      path.lineTo(outerX, outerY)
      const targetLocation = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      path.lineTo(targetLocation.x, outerY)
      path.lineTo(targetLocation)
      return path
    }
    return super.getPath(edge)
  }

  /**
   * Gets the path of the edge cropped at the node border.
   * @param {!IEdge} edge
   * @returns {?GeneralPath}
   */
  getPath(edge) {
    const path = this.createPath(edge)
    // crop path at node border
    return path ? this.cropPath(edge, IArrow.NONE, IArrow.NONE, path) : null
  }

  /**
   * Decorates a given path with bridges.
   * All work is delegated to the BridgeManager's addBridges() method.
   * @param {!GeneralPath} path The path to decorate.
   * @param {!IRenderContext} context The render context.
   * @returns {!GeneralPath} A copy of the given path with bridges.
   */
  createPathWithBridges(path, context) {
    const manager = this.getBridgeManager(context)
    // if there is a bridge manager registered: use it to add the bridges to the path
    return manager === null ? path : manager.addBridges(context, path, null)
  }

  /**
   * Gets an obstacle hash from the context.
   * The obstacle hash changes if any obstacle has changed on the entire graph.
   * The hash is used to avoid re-rendering the edge if nothing has changed.
   * This method gets the obstacle hash from the BridgeManager.
   * @param {!IRenderContext} context The context to get the obstacle hash for.
   * @returns {number} A hash value which represents the state of the obstacles.
   */
  getObstacleHash(context) {
    const manager = this.getBridgeManager(context)
    // get the BridgeManager from the context's lookup. If there is one
    // get a hash value which represents the current state of the obstacles.
    return manager === null ? 42 : manager.getObstacleHash(context)
  }

  /**
   * Queries the context's lookup for a BridgeManager instance.
   * @param {!IRenderContext} context The context to get the BridgeManager from.
   * @returns {?BridgeManager} The BridgeManager for the given context instance or null
   */
  getBridgeManager(context) {
    return context.lookup(BridgeManager.$class)
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * @param {!IInputModeContext} inputModeContext
   * @param {!Point} p
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isHit(inputModeContext, p, edge) {
    if (
      (edge.sourcePort != null &&
        edge.targetPort != null &&
        edge.sourcePort.owner === edge.targetPort.owner &&
        edge.bends.size < 2) ||
      super.isHit(inputModeContext, p, edge)
    ) {
      const path = this.getPath(edge)
      return path !== null && path.pathContains(p, inputModeContext.hitTestRadius + 1)
    }
    return false
  }

  /**
   * Determines whether the edge visual is visible or not.
   * @param {!ICanvasContext} canvasContext
   * @param {!Rect} clip
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isVisible(canvasContext, clip, edge) {
    if (
      edge.sourcePort != null &&
      edge.targetPort != null &&
      edge.sourcePort.owner === edge.targetPort.owner &&
      edge.bends.size < 2
    ) {
      // handle self-loops
      const spl = edge.sourcePort.locationParameter.model.getLocation(
        edge.sourcePort,
        edge.sourcePort.locationParameter
      )
      const tpl = edge.targetPort.locationParameter.model.getLocation(
        edge.targetPort,
        edge.targetPort.locationParameter
      )
      if (clip.contains(spl)) {
        return true
      }

      let outerX, outerY
      if (edge.bends.size === 1) {
        const bendLocation = edge.bends.get(0).location
        outerX = bendLocation.x
        outerY = bendLocation.y
      } else {
        if (edge.sourcePort.owner instanceof INode) {
          outerX = edge.sourcePort.owner.layout.x - 20
          outerY = edge.sourcePort.owner.layout.y - 20
        } else {
          const sourcePortLocation = edge.sourcePort.locationParameter.model.getLocation(
            edge.sourcePort,
            edge.sourcePort.locationParameter
          )
          outerX = sourcePortLocation.x - 20
          outerY = sourcePortLocation.y - 20
        }
      }

      // intersect the self-loop lines with the clip
      return (
        clip.intersectsLine(spl, new Point(outerX, spl.y)) ||
        clip.intersectsLine(new Point(outerX, spl.y), new Point(outerX, outerY)) ||
        clip.intersectsLine(new Point(outerX, outerY), new Point(tpl.x, outerY)) ||
        clip.intersectsLine(new Point(tpl.x, outerY), tpl)
      )
    }

    return super.isVisible(canvasContext, clip, edge)
  }

  /**
   * Helper method to let the svg marker be created by the {@link ISvgDefsCreator} implementation.
   * @returns {!ISvgDefsCreator}
   */
  createMarker() {
    if (this.markerDefsSupport === null) {
      this.markerDefsSupport = new MarkerDefsSupport(this.cssClass)
    }
    return this.markerDefsSupport
  }

  /**
   * This implementation of the look up provides a custom implementation of the
   * {@link IObstacleProvider} to support bridges.
   * @see Overrides {@link EdgeStyleBase.lookup}
   * @param {!IEdge} edge
   * @param {!Class} type
   * @returns {!object}
   */
  lookup(edge, type) {
    return type === IObstacleProvider.$class
      ? new BasicEdgeObstacleProvider(edge)
      : super.lookup(edge, type)
  }
}

/**
 * Manages the arrow markers as SVG definitions.
 */
export class MarkerDefsSupport extends BaseClass(ISvgDefsCreator) {
  /**
   * @param {!(string|ColorSetName)} [cssClass]
   */
  constructor(cssClass) {
    super()
    this.cssClass = cssClass
  }

  /**
   * Creates a defs-element.
   * @param {!ICanvasContext} context
   * @returns {!SVGElement}
   */
  createDefsElement(context) {
    const markerElement = document.createElementNS(SVGNS, 'marker')
    markerElement.setAttribute('viewBox', '0 0 15 10')
    markerElement.setAttribute('refX', '5')
    markerElement.setAttribute('refY', '5')
    markerElement.setAttribute('markerWidth', '7')
    markerElement.setAttribute('markerHeight', '7')
    markerElement.setAttribute('orient', 'auto')

    const path = document.createElementNS(SVGNS, 'path')
    path.setAttribute('d', 'M 0 0 L 15 5 L 0 10 z')
    path.setAttribute('fill', '#662b00')

    if (this.cssClass) {
      const attribute = isColorSetName(this.cssClass)
        ? `${this.cssClass}-edge-arrow`
        : `${this.cssClass}-arrow`
      path.setAttribute('class', attribute)
    }

    markerElement.appendChild(path)
    return markerElement
  }

  /**
   * Checks if the specified node references the element represented by this object.
   * @param {!ICanvasContext} context
   * @param {!Node} node
   * @param {!string} id
   * @returns {boolean}
   */
  accept(context, node, id) {
    return node.nodeType !== Node.ELEMENT_NODE
      ? false
      : ISvgDefsCreator.isAttributeReference(node, 'marker-end', id)
  }

  /**
   * Updates the defs element with the current gradient data.
   * @param {!ICanvasContext} context
   * @param {!SVGElement} oldElement
   */
  updateDefsElement(context, oldElement) {
    // Nothing to do here
  }
}

/**
 * A custom {@link IObstacleProvider} implementation for {@link Sample2EdgeStyle}.
 */
class BasicEdgeObstacleProvider extends BaseClass(IObstacleProvider) {
  /**
   * @param {!IEdge} edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Returns this edge's path as obstacle.
   * @returns {?GeneralPath} The edge's path.
   * @param {!IRenderContext} canvasContext
   */
  getObstacles(canvasContext) {
    return this.edge.style.renderer.getPathGeometry(this.edge, this.edge.style).getPath()
  }
}

export class Sample2EdgeStyleExtension extends MarkupExtension {
  constructor() {
    super()
    this._cssClass = ''
    this._showTargetArrows = true
    this._useMarkerArrows = true
  }

  /**
   * @type {!string}
   */
  get cssClass() {
    return this._cssClass
  }

  /**
   * @type {!string}
   */
  set cssClass(value) {
    this._cssClass = value
  }

  /**
   * @type {boolean}
   */
  get showTargetArrows() {
    return this._showTargetArrows
  }

  /**
   * @type {boolean}
   */
  set showTargetArrows(value) {
    this._showTargetArrows = value
  }

  /**
   * @type {boolean}
   */
  get useMarkerArrows() {
    return this._useMarkerArrows
  }

  /**
   * @type {boolean}
   */
  set useMarkerArrows(value) {
    this._useMarkerArrows = value
  }

  /**
   * @type {!object}
   */
  static get $meta() {
    return {
      cssClass: [GraphMLAttribute().init({ defaultValue: '' }), TypeAttribute(YString.$class)],
      showTargetArrows: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class)
      ],
      useMarkerArrows: [
        GraphMLAttribute().init({ defaultValue: true }),
        TypeAttribute(YBoolean.$class)
      ]
    }
  }

  /**
   * @param {!ILookup} serviceProvider
   * @returns {!Sample2EdgeStyle}
   */
  provideValue(serviceProvider) {
    const style = new Sample2EdgeStyle()
    style.cssClass = this.cssClass
    style.showTargetArrows = this.showTargetArrows
    style.useMarkerArrows = this.useMarkerArrows
    return style
  }
}

const isBrowserWithBadMarkerSupport = isMicrosoftBrowser() || detectSafariWebkit()

/**
 * Check if the used browser is IE or Edge.
 * @returns {boolean}
 */
function isMicrosoftBrowser() {
  return (
    window.navigator.userAgent.indexOf('MSIE ') > 0 ||
    /Trident.*rv:11\./.test(window.navigator.userAgent) ||
    /Edge\/(1[2678])./i.test(window.navigator.userAgent)
  )
}

/**
 * Returns version of Safari.
 * @returns {number} Version of Safari or -1 if browser is not Safari.
 */
function detectSafariVersion() {
  const ua = window.navigator.userAgent
  const isSafari = ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1
  if (isSafari) {
    const safariVersionMatch = /Version\/(\d*\.\d*)/.exec(ua)
    if (safariVersionMatch && safariVersionMatch.length > 1) {
      return parseInt(safariVersionMatch[1])
    }
  }
  return -1
}

/**
 * Returns true for browsers that use the Safari 11 Webkit engine.
 *
 * In detail, these are Safari 11 on either macOS or iOS, Chrome on iOS 11, and Firefox on iOS 11.
 * @returns {boolean}
 */
function detectSafariWebkit() {
  return detectSafariVersion() > -1 || !!/(CriOS|FxiOS)/.exec(window.navigator.userAgent)
}
