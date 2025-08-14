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
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access */
import {
  BaseClass,
  BridgeManager,
  EdgeStyleBase,
  IArrow,
  IObstacleProvider,
  SvgVisual
} from '@yfiles/yfiles'

export class CustomEdgeStyle extends EdgeStyleBase {
  distance
  sourceArrow
  targetArrow
  /**
   * Creates a new instance of this style using the given distance and arrows.
   * @param distance The distance between the paths. The default value is 1.
   * @param sourceArrow The arrow at the beginning of the edge. By default {@link IArrow.NONE}[no arrow] will be rendered.
   * @param targetArrow The arrow at the end of the edge. By default {@link IArrow.NONE}[no arrow] will be rendered.
   */
  constructor(distance = 1, sourceArrow = IArrow.NONE, targetArrow = IArrow.NONE) {
    super()
    this.distance = distance
    this.sourceArrow = sourceArrow
    this.targetArrow = targetArrow
  }

  createVisual(context, edge) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const generalPath = super.getPath(edge)
    const distance = this.distance
    const loadColor = this.getLoadColor(edge)
    const croppedGeneralPath = super.cropPath(edge, this.sourceArrow, this.targetArrow, generalPath)
    const pathWithBridges = this.createPathWithBridges(croppedGeneralPath, context)

    const widePath = pathWithBridges.createSvgPath()
    widePath.setAttribute('fill', 'none')
    widePath.setAttribute('stroke', 'black')
    widePath.setAttribute('stroke-width', String(distance + 2))
    group.append(widePath)

    const thinPath = pathWithBridges.createSvgPath()
    thinPath.setAttribute('fill', 'none')
    thinPath.setAttribute('stroke', loadColor)
    thinPath.setAttribute('stroke-width', String(distance))
    group.append(thinPath)

    const arrows = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    super.addArrows(context, arrows, edge, pathWithBridges, this.sourceArrow, this.targetArrow)
    group.append(arrows)

    return SvgVisual.from(group, {
      generalPath,
      distance,
      loadColor,
      obstacleHash: this.getObstacleHash(context),
      sourceArrow: this.sourceArrow,
      targetArrow: this.targetArrow
    })
  }

  updateVisual(context, oldVisual, edge) {
    const cache = oldVisual.tag

    const group = oldVisual.svgElement
    const widePath = group.children[0]
    const thinPath = group.children[1]
    const arrows = group.children[2]

    const newGeneralPath = super.getPath(edge)
    const newObstacleHash = this.getObstacleHash(context)
    if (
      !newGeneralPath.hasSameValue(cache.generalPath) ||
      newObstacleHash !== cache.obstacleHash ||
      this.sourceArrow !== cache.sourceArrow ||
      this.targetArrow !== cache.targetArrow
    ) {
      const croppedGeneralPath = super.cropPath(
        edge,
        this.sourceArrow,
        this.targetArrow,
        newGeneralPath
      )
      const pathWithBridges = this.createPathWithBridges(croppedGeneralPath, context)

      const pathData = pathWithBridges.createSvgPathData()
      widePath.setAttribute('d', pathData)
      thinPath.setAttribute('d', pathData)

      super.updateArrows(context, arrows, edge, pathWithBridges, this.sourceArrow, this.targetArrow)

      cache.generalPath = newGeneralPath
      cache.obstacleHash = newObstacleHash
      cache.sourceArrow = this.sourceArrow
      cache.targetArrow = this.targetArrow
    }

    if (this.distance !== cache.distance) {
      widePath.setAttribute('stroke-width', String(this.distance + 2))
      thinPath.setAttribute('stroke-width', String(this.distance))
      cache.distance = this.distance
    }

    const newLoadColor = this.getLoadColor(edge)
    if (newLoadColor !== cache.loadColor) {
      thinPath.setAttribute('stroke', newLoadColor)
      cache.loadColor = newLoadColor
    }

    return oldVisual
  }

  isHit(context, location, edge) {
    const thickness = this.distance + 2
    const edgePath = super.getPath(edge)
    return edgePath.pathContains(location, context.hitTestRadius + thickness * 0.5)
  }

  isVisible(context, rectangle, edge) {
    return rectangle.intersects(this.getBounds(context, edge))
  }

  getBounds(context, edge) {
    const path = super.getPath(edge)
    const thickness = this.distance + 2
    return path.getBounds().getEnlarged(thickness * 0.5)
  }

  lookup(edge, type) {
    if (type === IObstacleProvider) {
      const getPath = this.getPath.bind(this)
      return new (class extends BaseClass(IObstacleProvider) {
        getObstacles(context) {
          return getPath(edge)
        }
      })()
    }
    return super.lookup(edge, type)
  }

  getObstacleHash(context) {
    const manager = context.lookup(BridgeManager)
    return manager ? manager.getObstacleHash(context) : 42
  }

  createPathWithBridges(path, context) {
    const manager = context.lookup(BridgeManager)
    return manager ? manager.addBridges(context, path) : path
  }

  /**
   * Returns the color of an edge based on the load property of its tag object.
   * @param edge The edge to get a color for.
   * @returns The color string associated with the load value of the edge object. If the load value
   * of {@link IEdge.tag} is not specified, the function returns the default color 'white'.
   */
  getLoadColor(edge) {
    switch (edge.tag?.load) {
      case 'Free':
        return '#76b041'
      case 'Moderate':
        return '#ffc914'
      case 'Overloaded':
        return '#ff6c00'
      default:
        return 'white'
    }
  }
}
