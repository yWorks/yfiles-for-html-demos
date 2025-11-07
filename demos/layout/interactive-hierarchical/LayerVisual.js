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
import { BaseClass, IVisualCreator, List, Rect, SvgVisual } from '@yfiles/yfiles'

/**
 * Manages and renders the layers.
 */
export class LayerVisual extends BaseClass(IVisualCreator) {
  // the bounds of the complete drawing
  bounds = Rect.EMPTY
  // the list of the dividers (one less than the number of layers)
  dividers = new List()
  // the opacity of the drawing
  opacity = '0.5'

  /**
   * updates the layer drawing from the information passed in
   */
  updateLayers(graph, layerMapper) {
    // count the layers
    let nodes
    if (graph.groupingSupport.hasGroupNodes()) {
      nodes = graph.nodes.filter(
        (node) => !graph.isGroupNode(node) || graph.getChildren(node).size === 0
      )
    } else {
      nodes = graph.nodes
    }

    let layerCount = 0
    nodes.forEach((node) => (layerCount = Math.max(layerCount, layerMapper.get(node))))
    layerCount++

    // calculate min and max values
    const mins = new Array(layerCount)
    const maxs = new Array(layerCount)
    for (let i = 0; i < maxs.length; i++) {
      maxs[i] = Number.MIN_SAFE_INTEGER
    }

    for (let i = 0; i < mins.length; i++) {
      mins[i] = Number.MAX_SAFE_INTEGER
    }

    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    nodes.forEach((node) => {
      mins[layerMapper.get(node)] = Math.min(mins[layerMapper.get(node)], node.layout.y | 0)
      maxs[layerMapper.get(node)] = Math.max(maxs[layerMapper.get(node)], node.layout.maxY | 0)
      minX = Math.min(minX, node.layout.x)
      maxX = Math.max(maxX, node.layout.maxX)
    })

    // now determine divider locations
    this.dividers.clear()
    for (let i = 0; i < maxs.length - 1; i++) {
      this.dividers.add((maxs[i] + mins[i + 1]) * 0.5)
    }

    // determine the bounds of all elements
    const margin = 10
    mins[0] -= margin
    minX -= margin
    maxX += margin
    maxs[maxs.length - 1] += margin
    if (nodes.some()) {
      mins[0] -= margin
      minX -= margin
      maxX += margin
      maxs[maxs.length - 1] += margin
      this.bounds = new Rect(minX, mins[0], maxX - minX, maxs[maxs.length - 1] - mins[0])
    } else {
      this.bounds = Rect.EMPTY
    }
  }

  /**
   * Gets the layer at the given location.
   * @param location The location.
   * @returns A positive value if a specific layer is hit, a negative one to indicate that a new layer should
   * be inserted before layer -(value + 1) - int.MaxValue if no layer has been hit.
   */
  getLayer(location) {
    // global bounds
    const nbounds = new Rect(
      this.bounds.x,
      this.bounds.y - LAYER_INSETS,
      this.bounds.width,
      this.bounds.height + LAYER_INSETS * 2
    )
    if (location.y < this.bounds.y) {
      // before the first layer
      return -1
    }
    if (location.y > this.bounds.y + this.bounds.height) {
      // after the last layer
      return -(this.dividers.size + 2 + 1)
    }
    // nothing found,
    if (!nbounds.contains(location)) {
      return Number.MAX_SAFE_INTEGER
    }

    // now search the layer
    let top = this.bounds.y

    let layerCount = 0
    for (let i = 0; i < this.dividers.size; i++) {
      const divider = this.dividers.get(i)
      const layerBounds = new Rect(this.bounds.x, top, this.bounds.width, divider - top)
      if (layerBounds.contains(location)) {
        return getLayerIndex(location, layerBounds, layerCount)
      }
      layerCount++
      top = divider
    }
    const layerBounds = new Rect(
      this.bounds.x,
      top,
      this.bounds.width,
      this.bounds.y + (this.bounds.height - top)
    )
    if (layerBounds.contains(location)) {
      return getLayerIndex(location, layerBounds, layerCount)
    }
    // should not really happen...
    return Number.MAX_SAFE_INTEGER
  }

  /**
   * Gets the bounds of a layer by index as specified by {@link LayerVisual.getLayer}.
   * @param layerIndex Index of the layer.
   * @returns The bounds of the layer
   */
  getLayerBounds(layerIndex) {
    if (layerIndex === Number.MAX_SAFE_INTEGER) {
      return this.bounds.getEnlarged(20)
    }
    if (layerIndex < 0) {
      // new layer
      const beforeLayer = -(layerIndex + 1)
      if (beforeLayer <= this.dividers.size) {
        const layerBounds = this.getLayerBounds(beforeLayer)
        return new Rect(
          layerBounds.x,
          layerBounds.y - LAYER_INSETS,
          layerBounds.width,
          LAYER_INSETS * 2
        )
      }

      // after last layer
      const layerBounds = this.getLayerBounds(this.dividers.size)
      return new Rect(
        layerBounds.x,
        layerBounds.maxY - LAYER_INSETS,
        layerBounds.width,
        LAYER_INSETS * 2
      )
    }
    const top = layerIndex > 0 ? this.dividers.get(layerIndex - 1) : this.bounds.y
    const bottom =
      layerIndex < this.dividers.size
        ? this.dividers.get(layerIndex)
        : this.bounds.y + this.bounds.height
    return new Rect(this.bounds.x, top, this.bounds.width, bottom - top)
  }

  /**
   * Creates a new visual that emphasizes the hierarchical layers in the graph layout.
   * @see overrides {@link IVisualCreator.createVisual}
   */
  createVisual(context) {
    return this.updateVisual(
      context,
      new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    )
  }

  /**
   * Updates the visual that emphasizes the hierarchical layers in the graph layout.
   * @see overrides {@link IVisualCreator.updateVisual}
   */
  updateVisual(context, oldVisual) {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context)
    }
    const g = oldVisual.svgElement

    let y = this.bounds.y
    let count = 0
    this.dividers.forEach((divider) => {
      let rectangle
      if (g.childNodes.length <= count) {
        // no element to reuse => create a new rectangle
        rectangle = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        g.appendChild(rectangle)
      } else {
        // use an existing rectangle
        rectangle = g.childNodes.item(count)
      }
      const bottom = divider
      rectangle.setAttribute('x', this.bounds.x.toString())
      rectangle.setAttribute('y', y.toString())
      rectangle.setAttribute('width', this.bounds.width.toString())
      rectangle.setAttribute('height', (bottom - y).toString())
      rectangle.setAttribute('fill', count % 2 === 1 ? LIGHT_FILL : DARK_FILL)
      rectangle.setAttribute('opacity', this.opacity)
      y = bottom
      count++
    })

    let rectangle
    if (g.childNodes.length <= count) {
      g.appendChild(
        (rectangle = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
      )
    } else {
      rectangle = g.childNodes.item(count)
    }
    rectangle.setAttribute('x', this.bounds.x.toString())
    rectangle.setAttribute('y', y.toString())
    rectangle.setAttribute('width', this.bounds.width.toString())
    rectangle.setAttribute('height', (this.bounds.y + this.bounds.height - y).toString())
    rectangle.setAttribute('fill', count % 2 === 1 ? LIGHT_FILL : DARK_FILL)
    rectangle.setAttribute('opacity', this.opacity)
    count++

    while (g.childNodes.length > count) {
      g.removeChild(g.childNodes.item(g.childNodes.length - 1))
    }
    return oldVisual
  }
}

/**
 * checks a layer and determines if the layer has been clicked near the border
 */
function getLayerIndex(location, layerBounds, layerIndex) {
  // check if close to top or bottom
  if (location.y - layerBounds.y < LAYER_INSETS) {
    // before current layer
    return -(layerIndex + 1)
  }
  if (layerBounds.maxY - location.y < LAYER_INSETS) {
    // after current layer
    return -(layerIndex + 2)
  }
  // in current layer
  return layerIndex
}

/**
 * the dark fill used for drawing the layers
 */
const DARK_FILL = '#FFC914'

/**
 * the light fill used for drawing the layers
 */
const LIGHT_FILL = '#FFE8A0'

/**
 * the insets for each layer
 */
const LAYER_INSETS = 10
