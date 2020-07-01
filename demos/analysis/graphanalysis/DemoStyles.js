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
  Color,
  EdgeStyleBase,
  GeneralPath,
  GeomUtilities,
  IArrow,
  IEdge,
  IModelItem,
  INode,
  IRectangle,
  IRenderContext,
  Matrix,
  NodeStyleBase,
  Point,
  SvgVisual,
  Visual,
  YObject
} from 'yfiles'

const colors = [
  'rgba(65,105,225,1)', // royalblue
  'rgba(255,215,0,1)', // gold
  'rgba(220,20,60,1)', // crimson
  'rgba(0,206,209,1)', // darkturquoise
  'rgba(100,149,237,1)', // cornflowerblue
  'rgba(72,61,139,1)', // darkslateblue
  'rgba(255,69,0,1)', // orangered
  'rgba(123,104,238,1)', // mediumslateblue
  'rgba(34,139,34,1)', // forestgreen
  'rgba(99,21,133,1)', // mediumvioletred
  'rgba(0,139,139,1)', // darkcyan
  'rgba(210,105,30,1)', // chocolate
  'rgba(255,165,0,1)', // orange
  'rgba(50,205,50,1)', // limegreen
  'rgba(186,85,211,1)' // mediumorchid
]

const gradientColors = [
  'rgba(0, 64, 255, 1)',
  'rgba(64, 81, 191, 1)',
  'rgba(128, 98, 128, 1)',
  'rgba(191, 115, 64, 1)',
  'rgba(255, 132, 0, 1)',
  'rgba(203,56,0, 1)',
  'rgba(158,0,0, 1)'
]

/**
 * Returns the color for the given component.
 * Colors are represented like this: "rbg(r,g,b)".
 * @param {number} componentId The id of the component.
 * @param {boolean} useGradient Whether to use gradient colors
 * @return {string}   The color for the component.
 */
export function getColorForComponent(componentId, useGradient) {
  if (useGradient) {
    return gradientColors[componentId % gradientColors.length]
  } else {
    return colors[componentId % colors.length]
  }
}

/**
 * Checks whether or not the given item has a valid color in its tag.
 * @param {IModelItem} item The item to be checked.
 * @return {boolean} <code>true</code> if the node's tag contains a valid color, <code>false</code>
 *   otherwise.
 */
function hasValidColorTag(item) {
  return item.tag !== null && item.tag.color !== null && item.tag.color !== undefined
}

/**
 * Returns whether or not the given two arrays are equals.
 * @param {Array} array1
 * @param {Array} array2
 * @return {boolean} <code>true</code> if arrays are the same, <code>false</code> otherwise.
 */
function arraysAreEqual(array1, array2) {
  if (!array1 || !array2 || array1.length !== array2.length) {
    return false
  }
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      if (!arraysAreEqual(array1[i], array2[i])) {
        return false
      }
    } else if (!YObject.equals(array1[i], array2[i])) {
      return false
    }
  }
  return true
}

/**
 * This style supports nodes to change colors and to react interactively.
 */
export class MultiColorNodeStyle extends NodeStyleBase {
  constructor() {
    super()
    this.$currentColor = null
    this.$oldColor = null
    this.$hovered = false
    this.$useGradient = false
  }

  /** @type {string} */
  set currentColor(color) {
    this.$currentColor = color
  }

  /** @type {string} */
  get currentColor() {
    return this.$currentColor
  }

  /** @type {string} */
  set oldColor(color) {
    this.$oldColor = color
  }

  /** @type {string} */
  get oldColor() {
    return this.$oldColor
  }

  /** @type {boolean} */
  set useGradient(useGradient) {
    this.$useGradient = useGradient
  }

  /** @type {boolean} */
  get useGradient() {
    return this.$useGradient
  }

  /** @type {boolean} */
  set hovered(hovered) {
    this.$hovered = hovered
  }

  /** @type {boolean} */
  get hovered() {
    return this.$hovered
  }

  /**
   * Creates the visual for a node.
   * @param {IRenderContext} renderContext
   * @param {INode} node
   * @return {Visual}
   */
  createVisual(renderContext, node) {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Render the node
    const cache = this.createRenderDataCache(this.$currentColor, node.layout, node.tag)
    this.render(renderContext, node, g, cache)
    // set the location
    g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {IRenderContext} renderContext
   * @param {Visual} oldVisual
   * @param {INode} node
   * @return {Visual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual.svgElement
    const oldCache = container['data-renderDataCache']
    const newCache = this.createRenderDataCache(this.currentColor, node.layout, node.tag)

    if (!newCache.equals(oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        container.removeChild(container.firstChild)
      }
      this.render(renderContext, node, container, newCache)
    }

    // make sure that the location is up to date
    if (
      oldCache.location.x !== newCache.location.x ||
      oldCache.location.y !== newCache.location.y
    ) {
      container.transform.baseVal.getItem(0).setTranslate(node.layout.x, node.layout.y)
      container['data-renderDataCache'] = newCache
    }

    // return old/updated visual
    return oldVisual
  }

  /**
   * Actually creates the visual appearance of a node given the values provided by
   * <code>RenderDataCache</code>. This renders the node and the edges to the labels and adds the
   * elements to the <code>container</code>. All items are arranged as if the node was located at
   * (0,0). {@link MultiColorNodeStyle#createVisual} and
   * <code>UpdateVisual</code> finally arrange the container so that the drawing is translated into
   * the final position.
   * @param {IRenderContext} renderContext
   * @param {INode} node
   * @param {Element} visual
   * @param {object} cache
   */
  render(renderContext, node, visual, cache) {
    visual['data-renderDataCache'] = cache

    const tag = cache.tag
    // filter self loops
    const components = tag.nodeComponents.filter(component => component > -1)

    // Create Defs section in container
    const defs = window.document.createElementNS('http://www.w3.org/2000/svg', 'defs')

    visual.appendChild(defs)
    // the size of node
    const nodeSize = cache.size
    const radius = nodeSize.width * 0.5

    const group = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('id', `node${tag.id}`)
    group.setAttribute('class', this.hovered ? 'path-highlight-hovered' : 'path-highlight')

    visual.appendChild(group)

    if (components.length === 0 || components.length === 1) {
      if (components.length === 0) {
        this.currentColor = hasValidColorTag(node) ? node.tag.color : Color.GRAY
      }

      if (this.currentColor === null) {
        this.currentColor = hasValidColorTag(node)
          ? node.tag.color
          : getColorForComponent(components[0], this.useGradient)
      }

      const shape = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      shape.setAttribute('id', `node${node.tag.id}circle`)
      shape.setAttribute('cx', radius)
      shape.setAttribute('cy', radius)
      shape.setAttribute('rx', radius)
      shape.setAttribute('ry', radius)
      shape.setAttribute('fill', this.currentColor)
      shape.setAttribute('component', components.length === 1 ? components[0] : -1)

      shape.addEventListener('mouseenter', event => this.onMouseOver(node, event.target))
      shape.addEventListener('mouseleave', event => this.onMouseOut(node, event.target))
      shape.addEventListener('click', event => {
        const clickPoint = renderContext.canvasComponent.toWorldFromPage(
          new Point(event.x, event.y)
        )
        this.onMouseClicked(clickPoint, node, event.target)
      })

      group.appendChild(shape)
    } else {
      const angle = (2 * Math.PI) / components.length
      const x = Math.cos(angle)
      const y = Math.sin(angle)

      const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.setAttribute('class', 'multi-color-button')

      for (let i = 0; i < components.length; i++) {
        const slice = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
        slice.setAttribute('component', components[i])
        slice.setAttribute(
          'd',
          `M${radius},${radius} L${radius},${0} A${radius},${radius} 0 0,1 ${radius +
            y * radius},${radius - x * radius} z`
        )

        const component = node.tag.components[components[i]]
        const color =
          component[0].tag.color !== null
            ? component[0].tag.color
            : getColorForComponent(components[i], this.useGradient)
        slice.setAttribute('fill', color)
        slice.setAttribute(
          'transform',
          `rotate(${(i * angle * 180) / Math.PI} ${radius} ${radius})`
        )

        slice.addEventListener('click', event => {
          const clickPoint = renderContext.canvasComponent.toWorldFromPage(
            new Point(event.x, event.y)
          )
          this.onMouseClicked(clickPoint, node, event.target)
        })

        slice.addEventListener('mousedown', event => {
          const clickPoint = renderContext.canvasComponent.toWorldFromPage(
            new Point(event.x, event.y)
          )

          const nodeCenterX = node.layout.x + node.layout.width * 0.5
          const nodeCenterY = node.layout.y + node.layout.height * 0.5

          const isInCircle =
            Math.pow(nodeCenterX - clickPoint.x, 2) + Math.pow(nodeCenterY - clickPoint.y, 2) <=
            Math.pow(radius - 5, 2)
          if (!isInCircle && node.tag.nodeComponents.length > 1) {
            event.preventDefault()
          }
        })
        slice.addEventListener('mouseenter', event => this.onMouseOver(node, event.target))
        slice.addEventListener('mouseleave', event => this.onMouseOut(node, event.target))

        g.appendChild(slice)
      }

      group.appendChild(g)

      if (this.currentColor === null) {
        const component = node.tag.components[components[components.length - 1]]
        this.currentColor =
          component[0].tag.color !== null
            ? component[0].tag.color
            : getColorForComponent(components[components.length - 1], this.useGradient)
      }
      const color = this.currentColor
      const circle = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      circle.setAttribute('id', `node${node.tag.id}circle`)
      circle.setAttribute('cx', radius)
      circle.setAttribute('cy', radius)
      circle.setAttribute('rx', radius - 5)
      circle.setAttribute('ry', radius - 5)
      circle.setAttribute('fill', color)
      circle.setAttribute('stroke', 'white')
      circle.setAttribute('stroke-width', '2')
      circle.setAttribute('style', 'pointer-events:none')

      group.appendChild(circle)
    }
  }

  /**
   * Creates a cache object which stores relevant information to update the style.
   * @param {string} color
   * @param {IRectangle} layout
   * @param {object} tag
   * @return {object}
   */
  createRenderDataCache(color, layout, tag) {
    return {
      currentColor: color,
      location: layout.toPoint(),
      size: layout.toSize(),
      tag,
      equals(other) {
        return (
          other !== null &&
          this.currentColor === other.currentColor &&
          this.size.equals(other.size) &&
          arraysAreEqual(this.tag.components, other.tag.components) &&
          arraysAreEqual(this.tag.nodeComponents, other.tag.nodeComponents)
        )
      }
    }
  }

  /**
   * @param {INode} node
   * @param {SVGElement} svgElement
   */
  onMouseOver(node, svgElement) {
    const componentId = svgElement.getAttribute('component')
    const component = componentId !== '-1' ? node.tag.components[componentId] : [node]

    if (component) {
      component.forEach(object => {
        if (
          INode.isInstance(object) &&
          (object.style instanceof MultiColorNodeStyle ||
            object.style instanceof SourceTargetNodeStyle)
        ) {
          const componentElement = window.document.getElementById(`node${object.tag.id}`)
          if (object.tag.nodeComponents && object.tag.nodeComponents.length > 1) {
            if (object !== node) {
              if (componentElement !== null) {
                componentElement.setAttribute('class', 'path-highlight-hovered')
                object.style.hovered = true
              }
            }
            const circle = window.document.getElementById(`node${object.tag.id}circle`)
            if (circle !== null) {
              object.style.oldColor = object.style.currentColor
              if (object.style instanceof MultiColorNodeStyle) {
                const color = hasValidColorTag(component[0])
                  ? component[0].tag.color
                  : getColorForComponent(componentId, this.useGradient)
                circle.setAttribute('fill', color)
              }
            }
          } else if (componentElement !== null) {
            componentElement.setAttribute('class', 'path-highlight-hovered')
            object.style.hovered = true
          }
        } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
          const path = window.document.getElementById(`edge${object.tag.id}path`)
          if (path !== null) {
            object.style.oldColor = object.style.currentColor
            const color = hasValidColorTag(component[0])
              ? component[0].tag.color
              : getColorForComponent(componentId, this.useGradient)
            path.setAttribute('stroke', color)
            path.setAttribute('stroke-width', '7')
          }
        }
      })
    }
  }

  /**
   * @param {INode} node
   * @param {SVGElement} svgElement
   */
  onMouseOut(node, svgElement) {
    const componentId = svgElement.getAttribute('component')
    const component = componentId !== '-1' ? node.tag.components[componentId] : [node]

    if (component) {
      component.forEach(object => {
        if (
          INode.isInstance(object) &&
          (object.style instanceof MultiColorNodeStyle ||
            object.style instanceof SourceTargetNodeStyle)
        ) {
          const componentElement = window.document.getElementById(`node${object.tag.id}`)
          if (componentElement !== null) {
            if (object.tag.nodeComponents && object.tag.nodeComponents.length > 1) {
              if (node !== object) {
                componentElement.setAttribute('class', 'path-highlight')
                object.style.hovered = false
              }
              const circle = window.document.getElementById(`node${object.tag.id}circle`)
              if (circle !== null) {
                circle.setAttribute('fill', object.style.oldColor)
              }
            } else {
              componentElement.setAttribute('class', 'path-highlight')
              object.style.hovered = false
            }
          }
        } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
          const path = window.document.getElementById(`edge${object.tag.id}path`)
          if (path !== null) {
            path.setAttribute('stroke', object.style.oldColor)
            path.setAttribute('stroke-width', object.style.thickness)
          }
        }
      })
    }
  }

  /**
   * @param {Point} clickPoint
   * @param {INode} node
   * @param {SVGElement} svgElement
   */
  onMouseClicked(clickPoint, node, svgElement) {
    const nodeCenterX = node.layout.x + node.layout.width * 0.5
    const nodeCenterY = node.layout.y + node.layout.height * 0.5
    const radius = node.layout.width * 0.5

    const isInCircle =
      Math.pow(nodeCenterX - clickPoint.x, 2) + Math.pow(nodeCenterY - clickPoint.y, 2) <=
      Math.pow(radius - 5, 2)
    if (!isInCircle || (node.tag.nodeComponents && node.tag.nodeComponents.length === 1)) {
      const componentId = svgElement.getAttribute('component')
      const currentComponent = node.tag.components[componentId]
      this.currentColor =
        currentComponent[0].tag.color !== null
          ? currentComponent[0].tag.color
          : getColorForComponent(componentId, this.useGradient)

      currentComponent.forEach(object => {
        if (INode.isInstance(object) && object.style instanceof MultiColorNodeStyle) {
          object.style.currentColor = this.currentColor
          object.style.oldColor = object.style.currentColor
          const circle = window.document.getElementById(`node${object.tag.id}circle`)
          if (circle !== null) {
            circle.setAttribute('fill', object.style.currentColor)
          }
        } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
          const path = window.document.getElementById(`edge${object.tag.id}path`)
          if (path !== null) {
            object.tag.edgeComponent = componentId
            object.style.currentColor = this.currentColor
            object.style.oldColor = this.currentColor
            path.setAttribute('stroke', object.style.currentColor)
          }
        }
      })
    }
  }

  /**
   * Exact geometric check whether a point p lies inside the node.
   * This is important for intersection calculation, among others.
   * @param {INode} node
   * @param {Point} point
   * @return {boolean}
   */
  isInside(node, point) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }

  /**
   * Gets the outline of the node, an ellipse in this case.
   * This allows for correct edge path intersection calculation, among others.
   * @param {INode} node
   * @return {GeneralPath}
   */
  getOutline(node) {
    const rect = node.layout.toRect()
    const outline = new GeneralPath()
    outline.appendEllipse(rect, false)
    return outline
  }
}

/**
 * This style supports edges to change colors and to react interactively.
 */
export class MultiColorEdgeStyle extends EdgeStyleBase {
  /**
   * Creates a new instance of the {@link MultiColorEdgeStyle}
   * @param {string} color
   */
  constructor(color) {
    super()
    this.$currentColor = color
    this.$oldColor = null
    this.$thickness = 1
    this.$useGradient = false
    this.$targetArrow = null
  }

  /** @type {number} */
  set thickness(value) {
    this.$thickness = value
  }

  /** @type {number} */
  get thickness() {
    return this.$thickness
  }

  /** @type {string} */
  set currentColor(color) {
    this.$currentColor = color
  }

  /** @type {string} */
  get currentColor() {
    return this.$currentColor
  }

  /** @type {string} */
  set oldColor(color) {
    this.$oldColor = color
  }

  /** @type {string} */
  get oldColor() {
    return this.$oldColor
  }

  /** @type {boolean} */
  set useGradient(useGradient) {
    this.$useGradient = useGradient
  }

  /** @type {boolean} */
  get useGradient() {
    return this.$useGradient
  }

  /** @type {IArrow} */
  get targetArrow() {
    return this.$targetArrow
  }

  /** @type {IArrow} */
  set targetArrow(value) {
    this.$targetArrow = value
  }

  /**
   * Creates the visual for an edge.
   * @param {IRenderContext} renderContext
   * @param {IEdge} edge
   * @return {Visual}
   */
  createVisual(renderContext, edge) {
    // This implementation creates a CanvasContainer and uses it for the rendering of the edge.
    const visual = new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))

    // Get the necessary data for rendering of the edge
    const cache = this.createRenderDataCache(
      edge,
      this.thickness,
      this.targetArrow,
      this.currentColor
    )
    // Render the edge
    this.render(renderContext, edge, visual, cache)
    return visual
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @param {IRenderContext} renderContext
   * @param {Visual} oldVisual
   * @param {IEdge} edge
   * @return {Visual}
   */
  updateVisual(renderContext, oldVisual, edge) {
    const g = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = g['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(
      edge,
      this.thickness,
      this.targetArrow,
      this.currentColor
    )

    // check if something changed
    if (!newCache.stateEquals(oldCache)) {
      // more than only the path changed - re-render the visual
      g.removeChild(g.lastChild)
      this.render(renderContext, edge, oldVisual, newCache)
      return oldVisual
    }

    if (!newCache.pathEquals(oldCache)) {
      // only the path changed - update the old visual
      this.updatePath(renderContext, edge, oldVisual, newCache)
    }

    return oldVisual
  }

  /**
   * Creates the visual appearance of an edge.
   * @param {IRenderContext} context
   * @param {IEdge} edge
   * @param {Visual} visual
   * @param {Object} cache
   */
  render(context, edge, visual, cache) {
    const g = visual.svgElement

    if (hasValidColorTag(edge)) {
      this.currentColor = edge.tag.color
    }

    // store information with the visual on how we created it
    g['data-renderDataCache'] = cache

    const gp = cache.path.clone()
    const path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('id', `edge${edge.tag.id}path`)
    path.setAttribute('component', edge.tag.edgeComponent)
    path.setAttribute('d', gp.createSvgPathData(new Matrix()))

    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-width', cache.thickness.toString())
    path.setAttribute('stroke', this.currentColor)

    path.addEventListener('mouseenter', event => this.onMouseOver(edge, event.target))
    path.addEventListener('mouseleave', event => this.onMouseOut(edge, event.target))
    path.addEventListener('click', event => this.onMouseClicked(edge, event.target))

    g.appendChild(path)

    // add the arrows to the container
    super.addArrows(context, g, edge, gp, IArrow.NONE, cache.targetArrow)
  }

  /**
   * Creates an object containing all necessary data to create an edge visual.
   * @param {IEdge} edge
   * @param {number} thickness
   * @param {IArrow} targetArrow
   * @param {string} color
   * @return {MultiColorEdgeStyle.RenderDataCache}
   */
  createRenderDataCache(edge, thickness, targetArrow, color) {
    return {
      thickness,
      path: this.getPath(edge),
      targetArrow,
      currentColor: color,
      equals(obj) {
        return (
          obj !== null &&
          obj instanceof MultiColorEdgeStyle.RenderDataCache &&
          this.pathEquals(obj) &&
          this.stateEquals(obj)
        )
      },

      /**
       * Check if the path thickness, current colors and the arrows of this instance
       * are equals to another {@link MultiColorEdgeStyle.RenderDataCache}'s properties.
       * @return {boolean}
       */
      stateEquals(other) {
        return (
          other.thickness === this.thickness &&
          this.currentColor === other.currentColor &&
          YObject.equals(other.targetArrow, this.targetArrow)
        )
      },

      /**
       * Check if the path of this instance is equals to another
       * {@link MultiColorEdgeStyle.RenderDataCache}'s path.
       * @return {boolean}
       */
      pathEquals(other) {
        return other.path.hasSameValue(this.path)
      }
    }
  }

  /**
   * Creates a {@link GeneralPath} from the edge's bends.
   * @param {IEdge} edge The edge to create the path for.
   * @return {GeneralPath} A {@link GeneralPath} following the edge
   */
  getPath(edge) {
    // Create a general path from the locations of the ports and the bends of the edge.
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort.location)
    edge.bends.forEach(bend => path.lineTo(bend.location))
    path.lineTo(edge.targetPort.location)

    // shorten the path in order to provide room for drawing the arrows.
    return super.cropPath(edge, IArrow.NONE, this.targetArrow, path)
  }

  /**
   * Updates the edge path data as well as the arrow positions of the visuals stored in <param
   * name="container" />.
   * @param {IRenderContext} context
   * @param {IEdge} edge
   * @param {Visual} visual
   * @param {Object} cache
   */
  updatePath(context, edge, visual, cache) {
    // The first child must be a path - else re-create the container from scratch
    if (visual.svgElement.childElementCount === 0) {
      this.render(context, edge, visual, cache)
      return
    }

    const g = visual.svgElement

    // store information with the visual on how we created it
    g['data-renderDataCache'] = cache

    // update the path
    const gp = cache.path.clone()
    const path = visual.svgElement.childNodes.item(0)
    path.setAttribute('d', gp.createSvgPathData(new Matrix()))

    // update the arrows
    super.updateArrows(context, g, edge, gp, IArrow.NONE, cache.targetArrow)
  }

  /**
   * @param {IEdge} edge
   * @param {SVGElement} svgElement
   */
  onMouseOver(edge, svgElement) {
    const componentId = svgElement.getAttribute('component')
    const component = componentId !== '-1' ? edge.tag.components[componentId] : [edge]
    component.forEach(object => {
      if (
        INode.isInstance(object) &&
        (object.style instanceof MultiColorNodeStyle ||
          object.style instanceof SourceTargetNodeStyle)
      ) {
        const componentElement = window.document.getElementById(`node${object.tag.id}`)
        if (componentElement !== null) {
          componentElement.setAttribute('class', 'path-highlight-hovered')
          object.style.hovered = true
        }
        const circle = window.document.getElementById(`node${object.tag.id}circle`)
        if (circle !== null) {
          object.style.oldColor = object.style.currentColor
          if (object.style instanceof MultiColorNodeStyle) {
            const color = hasValidColorTag(component[0])
              ? component[0].tag.color
              : getColorForComponent(componentId, this.useGradient)
            circle.setAttribute('fill', color)
          }
        }
      } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
        const path = window.document.getElementById(`edge${object.tag.id}path`)
        if (path !== null) {
          object.style.oldColor = object.style.currentColor
          const color = hasValidColorTag(object)
            ? object.tag.color
            : getColorForComponent(componentId, this.useGradient)
          path.setAttribute('stroke', color)
          path.setAttribute('stroke-width', '7')
        }
      }
    })
  }

  /**
   * @param {IEdge} edge
   * @param {SVGElement} svgElement
   */
  onMouseOut(edge, svgElement) {
    const componentId = svgElement.getAttribute('component')
    const component = componentId !== '-1' ? edge.tag.components[componentId] : [edge]
    component.forEach(object => {
      if (
        INode.isInstance(object) &&
        (object.style instanceof MultiColorNodeStyle ||
          object.style instanceof SourceTargetNodeStyle)
      ) {
        const componentElement = window.document.getElementById(`node${object.tag.id}`)
        if (componentElement !== null) {
          componentElement.setAttribute('class', 'path-highlight')
          object.style.hovered = false
          const circle = window.document.getElementById(`node${object.tag.id}circle`)
          if (circle !== null) {
            circle.setAttribute('fill', object.style.oldColor)
          }
        }
      } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
        const path = window.document.getElementById(`edge${object.tag.id}path`)
        if (path !== null) {
          path.setAttribute('stroke', object.style.oldColor)
          path.setAttribute('stroke-width', object.style.thickness)
        }
      }
    })
  }

  /**
   * @param {IEdge} edge
   * @param {SVGElement} svgElement
   */
  onMouseClicked(edge, svgElement) {
    const componentId = svgElement.getAttribute('component')
    this.currentColor = hasValidColorTag(edge)
      ? edge.tag.color
      : getColorForComponent(componentId, this.useGradient)
    const currentComponent = edge.tag.components[componentId]
    currentComponent.forEach(object => {
      if (INode.isInstance(object) && object.style instanceof MultiColorNodeStyle) {
        object.style.currentColor = this.currentColor
        object.style.oldColor = object.style.currentColor
        const circle = window.document.getElementById(`node${object.tag.id}circle`)
        if (circle !== null) {
          circle.setAttribute('fill', object.style.currentColor)
        }
      } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
        const path = window.document.getElementById(`edge${object.tag.id}path`)
        if (path !== null) {
          object.style.currentColor = this.currentColor
          object.style.oldColor = this.currentColor
          path.setAttribute('stroke', object.style.currentColor)
        }
      }
    })
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   * Overridden method to include the {@link MultiColorEdgeStyle#thickness} and the HitTestRadius
   * specified in the context in the calculation.
   * @param {IRenderContext} context
   * @param {Point} point
   * @param {IEdge} edge
   * @return {boolean}
   */
  isHit(context, point, edge) {
    // Use the convenience method in GeneralPath
    return this.getPath(edge).pathContains(point, context.hitTestRadius + this.thickness * 0.5)
  }
}

/**
 * Node style that can be highlighted when hovered (or when hovering the according component/path).
 */
export class SingleColorNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance of SingleColorNodeStyle
   * @param {string} color
   */
  constructor(color) {
    super()
    this.$color = color
  }

  /** @type {string} */
  set color(color) {
    this.$color = color
  }

  /** @type {string} */
  get color() {
    return this.$color
  }

  /**
   * Creates the visual for a node.
   * @param {IRenderContext} renderContext
   * @param {INode} node
   * @return {SvgVisual}
   */
  createVisual(renderContext, node) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const cache = this.createRenderDataCache(this.$color, node.layout, node.tag)
    this.render(node, g, cache)
    g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {IRenderContext} renderContext
   * @param {Visual} oldVisual
   * @param {INode} node
   * @return {Visual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual.svgElement
    const oldCache = container['data-renderDataCache']
    const newCache = this.createRenderDataCache(this.$color, node.layout)

    if (!newCache.equals(oldCache)) {
      this.render(node, container, newCache)
    }

    // make sure that the location is up to date
    if (
      oldCache.location.x !== newCache.location.x ||
      oldCache.location.y !== newCache.location.y
    ) {
      container.transform.baseVal.getItem(0).setTranslate(node.layout.x, node.layout.y)
      container['data-renderDataCache'] = newCache
    }

    return oldVisual
  }

  /**
   * Creates the visual appearance of a node.
   * @param {INode} node
   * @param {Visual} visual
   * @param {Object} cache
   */
  render(node, visual, cache) {
    visual['data-renderDataCache'] = cache

    const tag = node.tag

    // the size of node
    const nodeSize = cache.size
    const radius = nodeSize.width * 0.5

    let group = visual.firstElementChild
    if (group === null) {
      group = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      visual.appendChild(group)
    }

    group.setAttribute('id', `node${tag.id}`)
    group.setAttribute('class', 'path-highlight')

    let shape = group.firstElementChild
    if (shape === null) {
      shape = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      group.appendChild(shape)
    }

    shape.setAttribute('id', `node${node.tag.id}circle`)
    shape.setAttribute('class', 'color-transition')
    shape.setAttribute('cx', radius)
    shape.setAttribute('cy', radius)
    shape.setAttribute('rx', radius)
    shape.setAttribute('ry', radius)
    shape.setAttribute('fill', this.color)
  }

  /**
   * @param {string} color
   * @param {IRectangle} layout
   * @return {*}
   */
  createRenderDataCache(color, layout) {
    return {
      color,
      location: layout.toPoint(),
      size: layout.toSize(),
      equals(other) {
        return other !== null && this.color === other.color && this.size.equals(other.size)
      }
    }
  }

  /**
   * Returns whether or not a point lies inside the node.
   * @param {INode} node
   * @param {Point} point
   * @return {boolean}
   */
  isInside(node, point) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }

  /**
   * Gets the outline of the node, an ellipse in this case.
   * @param {INode} node
   * @return {GeneralPath}
   */
  getOutline(node) {
    const rect = node.layout.toRect()
    const outline = new GeneralPath()
    outline.appendEllipse(rect, false)
    return outline
  }
}

/**
 * Edge style that can be highlighted when hovered (or when hovering the according component/path).
 */
export class SingleColorEdgeStyle extends EdgeStyleBase {
  /**
   * Creates a new instance of SingleColorEdgeStyle
   * @param {string} color
   */
  constructor(color) {
    super()
    this.$color = color
    this.$targetArrow = null
  }

  /** @type {string} */
  set color(color) {
    this.$color = color
  }

  /** @type {string} */
  get color() {
    return this.$color
  }

  /** @type {IArrow} */
  set targetArrow(value) {
    this.$targetArrow = value
  }

  /** @type {IArrow} */
  get targetArrow() {
    return this.$targetArrow
  }

  /**
   * Creates the visual for an edge.
   * @param {IRenderContext} renderContext
   * @param {IEdge} edge
   * @return {SvgVisual}
   */
  createVisual(renderContext, edge) {
    const visual = new SvgVisual(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    const cache = this.createRenderDataCache(this.color, this.getPath(edge), this.targetArrow)
    this.render(renderContext, edge, visual, cache)
    return visual
  }

  /**
   * Re-renders the edge using the old visual for performance reasons.
   * @param {IRenderContext} renderContext
   * @param {Visual} oldVisual
   * @param {IEdge} edge
   * @return {Visual}
   */
  updateVisual(renderContext, oldVisual, edge) {
    const g = oldVisual.svgElement
    const oldCache = g['data-renderDataCache']
    const newCache = this.createRenderDataCache(this.color, this.getPath(edge), this.targetArrow)

    if (!newCache.stateEquals(oldCache)) {
      // more than only the path changed - re-render the visual
      g.removeChild(g.lastChild)
      this.render(renderContext, edge, oldVisual, newCache)
    } else if (!newCache.pathEquals(oldCache)) {
      // only the path changed - update the old visual
      this.updatePath(renderContext, edge, oldVisual, newCache)
    }

    return oldVisual
  }

  /**
   * Creates the visual appearance of an edge.
   * @param {IRenderContext} context
   * @param {IEdge} edge
   * @param {Visual} visual
   * @param {Object} cache
   */
  render(context, edge, visual, cache) {
    const g = visual.svgElement
    g['data-renderDataCache'] = cache

    const gp = cache.path.clone()
    const path = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('id', `edge${edge.tag.id}path`)
    path.setAttribute('d', gp.createSvgPathData(new Matrix()))
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', this.color)
    path.setAttribute('class', 'single-colored-edge')

    g.appendChild(path)

    const noneArrow = IArrow.NONE
    super.addArrows(context, g, edge, gp, noneArrow, cache.targetArrow)
  }

  /**
   * Creates an object containing all necessary data to create an edge visual.
   * @param {string} color
   * @param {GeneralPath} path
   * @param {IArrow} targetArrow
   * @return {object}
   */
  createRenderDataCache(color, path, targetArrow) {
    return {
      color,
      path,
      targetArrow,
      equals(other) {
        return (
          other !== null &&
          other instanceof SingleColorNodeStyle.RenderDataCache &&
          this.pathEquals(other) &&
          this.stateEquals(other)
        )
      },

      /**
       * Check if the current color and the arrows of this instance
       * are equals to another {@link SingleColorNodeStyle.RenderDataCache}'s properties.
       * @return {boolean}
       */
      stateEquals(other) {
        return this.color === other.color && YObject.equals(other.targetArrow, this.targetArrow)
      },

      /**
       * Check if the path of this instance is equals to another
       * {@link SingleColorNodeStyle.RenderDataCache}'s path.
       * @return {boolean}
       */
      pathEquals(other) {
        return other.path.hasSameValue(this.path)
      }
    }
  }

  /**
   * Creates a {@link GeneralPath} from the edge's bends.
   * @param {IEdge} edge The edge for which to create the path.
   * @return {GeneralPath} A {@link GeneralPath} following the edge.
   */
  getPath(edge) {
    const path = new GeneralPath()
    path.moveTo(edge.sourcePort.location)
    edge.bends.forEach(bend => path.lineTo(bend.location))
    path.lineTo(edge.targetPort.location)

    return super.cropPath(edge, IArrow.NONE, this.targetArrow, path)
  }

  /**
   * Updates the edge path data as well as the arrow positions of the visuals stored in <param
   * name="visual"/>.
   * @param {IRenderContext} context
   * @param {IEdge} edge
   * @param {Visual} visual
   * @param {object} cache
   */
  updatePath(context, edge, visual, cache) {
    // The first child must be a path - else re-create the container from scratch
    if (visual.svgElement.childElementCount === 0) {
      this.render(context, edge, visual, cache)
      return
    }

    const g = visual.svgElement
    g['data-renderDataCache'] = cache

    // update the path
    const gp = cache.path.clone()
    const path = g.childNodes.item(0)
    path.setAttribute('d', gp.createSvgPathData(new Matrix()))

    // update the arrows
    const noneArrow = IArrow.NONE
    super.updateArrows(context, g, edge, gp, noneArrow, cache.targetArrow)
  }

  /**
   * @param {IRenderContext} context
   * @param {Point} point
   * @param {IEdge} edge
   * @return {boolean}
   */
  isHit(context, point, edge) {
    return this.getPath(edge).pathContains(point, context.hitTestRadius)
  }
}

/**
 * This style supports nodes to change colors according to their role in a path.
 */
export class SourceTargetNodeStyle extends NodeStyleBase {
  /**
   * Creats a new instance of SourceTargetNodeStyle.
   * @param {number} type
   */
  constructor(type) {
    super()
    this.$currentColor = 'rgba(255,255,255,1)'
    this.$oldColor = null
    this.$type = type
    this.$hovered = false
  }

  /** @type {string} */
  set currentColor(color) {
    this.$currentColor = color
  }

  /** @type {string} */
  get currentColor() {
    return this.$currentColor
  }

  /** @type {string} */
  set oldColor(color) {
    this.$oldColor = color
  }

  /** @type {string} */
  get oldColor() {
    return this.$oldColor
  }

  /** @type {boolean} */
  set hovered(hovered) {
    this.$hovered = hovered
  }

  /** @type {boolean} */
  get hovered() {
    return this.$hovered
  }

  /** @type {number} */
  set type(type) {
    this.$type = type
  }

  /** @type {number} */
  get type() {
    return this.$type
  }

  /**
   * Creates the visual for a node.
   * @param {IRenderContext} renderContext
   * @param {INode} node
   * @return {SvgVisual}
   */
  createVisual(renderContext, node) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const cache = this.createRenderDataCache(this.$currentColor, node.layout, node.tag)
    this.render(renderContext, node, g, cache)
    // set the location
    g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {IRenderContext} renderContext
   * @param {Visual} oldVisual
   * @param {INode} node
   * @return {Visual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual.svgElement
    const oldCache = container['data-renderDataCache']
    const newCache = this.createRenderDataCache(this.$currentColor, node.layout, node.tag)

    if (!newCache.equals(oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        container.removeChild(container.firstChild)
      }
      this.render(renderContext, node, container, newCache)
    }

    // make sure that the location is up to date
    if (
      oldCache.location.x !== newCache.location.x ||
      oldCache.location.y !== newCache.location.y
    ) {
      container.transform.baseVal.getItem(0).setTranslate(node.layout.x, node.layout.y)
      container['data-renderDataCache'] = newCache
    }

    // return old/updated visual
    return oldVisual
  }

  /**
   * Actually creates the visual appearance of a node given the values provided by
   * <code>RenderDataCache</code>. This renders the node and the edges to the labels and adds the
   * elements to the <code>container</code>. All items are arranged as if the node was located at
   * (0,0). {@link SourceTargetNodeStyle#createVisual} and
   * <code>UpdateVisual</code> finally arrange the container so that the drawing is translated into
   * the final position.
   * @param {IRenderContext} renderContext
   * @param {INode} node
   * @param {Element} visual
   * @param {Object} cache
   */
  render(renderContext, node, visual, cache) {
    visual['data-renderDataCache'] = cache

    const tag = cache.tag
    const components = tag.nodeComponents

    // Create Defs section in container
    const defs = window.document.createElementNS('http://www.w3.org/2000/svg', 'defs')

    visual.appendChild(defs)
    // the size of node
    const nodeSize = cache.size
    const radius = nodeSize.width * 0.5

    const group = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('id', `node${tag.id}`)
    group.setAttribute('class', this.hovered ? 'path-highlight-hovered' : 'path-highlight')

    visual.appendChild(group)

    const strokeColor =
      this.type === SourceTargetNodeStyle.TYPE_SOURCE ? 'yellowgreen' : 'indianred'

    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'multi-color-button')

    if (components && components.length > 1) {
      const angle = (2 * Math.PI) / components.length
      const x = Math.cos(angle)
      const y = Math.sin(angle)
      for (let i = 0; i < components.length; i++) {
        const slice = window.document.createElementNS('http://www.w3.org/2000/svg', 'path')
        slice.setAttribute('component', components[i])
        slice.setAttribute(
          'd',
          `M${radius},${radius} L${radius},${0} A${radius},${radius} 0 0,1 ${radius +
            y * radius},${radius - x * radius} z`
        )
        slice.setAttribute('fill', getColorForComponent(components[i]), this.useGradient)
        slice.setAttribute(
          'transform',
          `rotate(${(i * angle * 180) / Math.PI} ${radius} ${radius})`
        )

        slice.addEventListener('click', event => {
          const clickPoint = renderContext.canvasComponent.toWorldFromPage(
            new Point(event.x, event.y)
          )
          this.onMouseClicked(clickPoint, node, event.target)
        })

        slice.addEventListener('mousedown', event => {
          const clickPoint = renderContext.canvasComponent.toWorldFromPage(
            new Point(event.x, event.y)
          )

          const nodeCenterX = node.layout.x + node.layout.width * 0.5
          const nodeCenterY = node.layout.y + node.layout.height * 0.5

          const isInCircle =
            Math.pow(nodeCenterX - clickPoint.x, 2) + Math.pow(nodeCenterY - clickPoint.y, 2) <=
            Math.pow(radius, 2)
          if (!isInCircle && node.tag.nodeComponents.length > 1) {
            event.preventDefault()
          }
        })
        slice.addEventListener('mouseenter', event => this.onMouseOver(node, event.target))
        slice.addEventListener('mouseleave', event => this.onMouseOut(node, event.target))

        g.appendChild(slice)
      }
    }

    group.appendChild(g)

    const circle = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    circle.setAttribute('id', `node${node.tag.id}circle`)
    circle.setAttribute('cx', radius)
    circle.setAttribute('cy', radius)
    circle.setAttribute('rx', radius)
    circle.setAttribute('ry', radius)
    circle.setAttribute('fill', 'white')
    circle.setAttribute('stroke', strokeColor)
    circle.setAttribute('stroke-width', '5')
    circle.setAttribute('style', 'pointer-events:none')

    group.appendChild(circle)

    if (this.type === SourceTargetNodeStyle.TYPE_SOURCE_AND_TARGET) {
      const dashedCircle = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      dashedCircle.setAttribute('cx', radius)
      dashedCircle.setAttribute('cy', radius)
      dashedCircle.setAttribute('rx', radius)
      dashedCircle.setAttribute('ry', radius)
      dashedCircle.setAttribute('stroke', 'yellowgreen')
      dashedCircle.setAttribute('stroke-width', '5')
      dashedCircle.setAttribute('stroke-dasharray', (Math.PI * radius * 0.5).toString())
      dashedCircle.setAttribute('fill', 'none')
      dashedCircle.setAttribute('style', 'pointer-events:none')
      group.appendChild(dashedCircle)
    }
  }

  /**
   * Creates an object which contains all relevant data to update the style.
   * @param {string} color
   * @param {IRectangle} layout
   * @param {Object} tag
   * @return {Object}
   */
  createRenderDataCache(color, layout, tag) {
    return {
      currentColor: color,
      location: layout.toPoint(),
      size: layout.toSize(),
      tag,
      equals(other) {
        return (
          other !== null &&
          this.currentColor === other.currentColor &&
          this.size.equals(other.size) &&
          arraysAreEqual(this.tag.components, other.tag.components) &&
          arraysAreEqual(this.tag.nodeComponents, other.tag.nodeComponents)
        )
      }
    }
  }

  /**
   * @param {INode} node
   * @param {SVGElement} svgElement
   */
  onMouseOver(node, svgElement) {
    const componentId = svgElement.getAttribute('component')
    const component = node.tag.components[componentId]

    component.forEach(object => {
      if (
        INode.isInstance(object) &&
        (object.style instanceof SourceTargetNodeStyle ||
          object.style instanceof MultiColorNodeStyle)
      ) {
        const componentElement = window.document.getElementById(`node${object.tag.id}`)
        if (object.tag.nodeComponents.length > 1) {
          if (object !== node) {
            if (componentElement !== null) {
              componentElement.setAttribute('class', 'path-highlight-hovered')
              object.style.hovered = true
            }
          }
          const circle = window.document.getElementById(`node${object.tag.id}circle`)
          if (circle !== null) {
            object.style.oldColor = object.style.currentColor
            if (
              object.style instanceof MultiColorNodeStyle ||
              SourceTargetNodeStyle.notSourceOrTarget(object, component)
            ) {
              circle.setAttribute('fill', getColorForComponent(componentId), this.useGradient)
            }
          }
        } else if (componentElement !== null) {
          componentElement.setAttribute('class', 'path-highlight-hovered')
          object.style.hovered = true
        }
      } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
        const path = window.document.getElementById(`edge${object.tag.id}path`)
        if (path !== null) {
          object.style.oldColor = object.style.currentColor
          path.setAttribute('stroke', getColorForComponent(componentId), this.useGradient)
          path.setAttribute('stroke-width', '7')
        }
      }
    })
  }

  /**
   * @param {INode} node
   * @param {SVGElement} svgElement
   */
  onMouseOut(node, svgElement) {
    const componentId = svgElement.getAttribute('component')
    const component = node.tag.components[componentId]
    component.forEach(object => {
      if (
        INode.isInstance(object) &&
        (object.style instanceof SourceTargetNodeStyle ||
          object.style instanceof MultiColorNodeStyle)
      ) {
        const componentElement = window.document.getElementById(`node${object.tag.id}`)
        if (componentElement !== null) {
          if (object.tag.nodeComponents.length > 1) {
            if (node !== object) {
              componentElement.setAttribute('class', 'path-highlight')
              object.style.hovered = false
            }
            const circle = window.document.getElementById(`node${object.tag.id}circle`)
            if (circle !== null) {
              circle.setAttribute('fill', object.style.oldColor)
            }
          } else {
            componentElement.setAttribute('class', 'path-highlight')
            object.style.hovered = false
          }
        }
      } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
        const path = window.document.getElementById(`edge${object.tag.id}path`)
        if (path !== null) {
          path.setAttribute('stroke', object.style.oldColor)
          path.setAttribute('stroke-width', object.style.thickness)
        }
      }
    })
  }

  /**
   * @param {Point} clickPoint
   * @param {INode} node
   * @param {SVGElement} svgElement
   */
  onMouseClicked(clickPoint, node, svgElement) {
    const nodeCenterX = node.layout.x + node.layout.width * 0.5
    const nodeCenterY = node.layout.y + node.layout.height * 0.5
    const radius = node.layout.width * 0.5

    const isInCircle =
      Math.pow(nodeCenterX - clickPoint.x, 2) + Math.pow(nodeCenterY - clickPoint.y, 2) <=
      Math.pow(radius, 2)
    if (!isInCircle || node.tag.nodeComponents.length === 1) {
      const component = svgElement.getAttribute('component')
      const color = getColorForComponent(component, this.useGradient)
      const currentComponent = node.tag.components[component]
      currentComponent.forEach(object => {
        if (INode.isInstance(object) && object.style instanceof MultiColorNodeStyle) {
          object.style.currentColor = color
          object.style.oldColor = object.style.currentColor
          const circle = window.document.getElementById(`node${object.tag.id}circle`)
          if (circle !== null) {
            circle.setAttribute('fill', object.style.currentColor)
          }
        } else if (IEdge.isInstance(object) && object.style instanceof MultiColorEdgeStyle) {
          const path = window.document.getElementById(`edge${object.tag.id}path`)
          if (path !== null) {
            object.tag.edgeComponent = component
            object.style.currentColor = color
            object.style.oldColor = color
            path.setAttribute('stroke', object.style.currentColor)
          }
        }
      })
    }
  }

  /**
   * Determines if the given node is not a source or target node of a path.
   * @param {INode} node
   * @param {Array} component
   * @return {boolean}
   */
  static notSourceOrTarget(node, component) {
    return component[0] !== node && component[component.length - 1] !== node
  }

  /**
   * Exact geometric check whether a point p lies inside the node. This is important for
   * intersection calculation, among others.
   * @param {INode} node
   * @param {Point} point
   * @return {boolean}
   */
  isInside(node, point) {
    return GeomUtilities.ellipseContains(node.layout.toRect(), point, 0)
  }

  /**
   * Gets the outline of the node, an ellipse in this case.
   * This allows for correct edge path intersection calculation, among others.
   * @param {INode} node
   * @return {GeneralPath}
   */
  getOutline(node) {
    const rect = node.layout.toRect()
    const outline = new GeneralPath()
    outline.appendEllipse(rect, false)
    return outline
  }

  /** @type {number} */
  static get TYPE_SOURCE() {
    return 0
  }

  /** @type {number} */
  static get TYPE_TARGET() {
    return 1
  }

  /** @type {number} */
  static get TYPE_SOURCE_AND_TARGET() {
    return 2
  }
}
