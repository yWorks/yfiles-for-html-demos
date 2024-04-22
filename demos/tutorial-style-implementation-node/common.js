/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Animator,
  BaseClass,
  DefaultLabelStyle,
  FreeNodeLabelModel,
  GeomUtilities,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IAnimation,
  IBoundsProvider,
  ICanvasObjectDescriptor,
  INode,
  IVisibilityTestable,
  IVisualCreator,
  MouseWheelBehaviors,
  NodeSizeConstraintProvider,
  Point,
  PolylineEdgeStyle,
  Rect,
  ScrollBarVisibility,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  SizeChangedDetectionMode,
  SvgVisual
} from 'yfiles'
import { createPathData, CustomNodeStyle } from './07-hit-testing/CustomNodeStyle.js'
import { CustomGroupNodeStyle } from './11-group-node-style/CustomGroupNodeStyle.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * @param {!IGraph} graph
 */
export function createSimpleGraph(graph) {
  graph.createNode([0, 0, 100, 50])
}

/**
 * @param {!IGraph} graph
 * @param {!INodeStyle} newNodeStyle
 * @param {!INodeStyle} oldNodeStyle
 */
export function createSampleGraphHitTesting(graph, newNodeStyle, oldNodeStyle) {
  graph.createNode({
    layout: [0, 0, 110, 70],
    tag: { color: '#b91c3b' },
    style: oldNodeStyle
  })
  graph.createNode({
    layout: [0, 120, 110, 70],
    tag: { color: '#0b7189' },
    style: newNodeStyle
  })
  const labelModelParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1],
    [0, 10],
    [0.5, 0]
  )
  graph.addLabel(graph.nodes.at(0), 'Without custom hit test', labelModelParameter)
  graph.addLabel(graph.nodes.at(1), 'With custom hit test', labelModelParameter)
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphEdgeCropping(graph) {
  const centerNode = graph.createNode({
    layout: [0, 0, 110, 70],
    tag: { color: '#b91c3b', title: 'Title' }
  })

  const outerNodeStyle = new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: '#ccc',
    stroke: null
  })
  const outerNodeSize = new Size(5, 5)

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #bfd4db',
    targetArrow: '#bfd4db medium triangle'
  })

  // Add nodes in two hemispheres around the two main nodes and then create edges
  const count = 31
  const radius = 200
  for (let i = 0; i < count; i++) {
    const { x: cx, y: cy } = centerNode.layout.center
    const rad = (i / count) * 2 * Math.PI
    const n = graph.createNode(
      Rect.fromCenter([cx - Math.sin(rad) * radius, cy - Math.cos(rad) * radius], outerNodeSize),
      outerNodeStyle
    )
    graph.createEdge(n, centerNode)
  }
}

/**
 * @param {!IGraph} graph
 * @param {!Rect} area
 */
export function createSampleGraphIsVisible(graph, area) {
  // scatter nodes on random y positions
  const extent = 1200
  const nodeRadius = 130
  const nodeDiameter = nodeRadius * 2

  for (let i = area.x - extent; i < area.width + extent * 2; i += nodeDiameter + 50) {
    const y = area.y + nodeRadius + 50 + Math.random() * (area.height - nodeDiameter - 100)

    const p = new Point(i, y - nodeRadius)
    const p2 = new Point(i, y + nodeRadius)
    graph.createNode(Rect.fromCenter(p, new Size(120, 70)), null, {
      isVisibleImplementation: false,
      color: '#ab2346'
    })
    graph.createNode(Rect.fromCenter(p2, new Size(120, 70)), null, {
      isVisibleImplementation: true
    })
  }
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphGetBounds(graph) {
  graph.createNode({
    layout: [140, 0, 100, 70],
    tag: { color: '#9e7cb5', showBadge: true }
  })
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphGroupNodeStyle(graph) {
  const groupNode = graph.createGroupNode({
    tag: { color: '#9e7cb5', title: 'Group' }
  })
  graph.createNode({
    layout: [5, 0, 30, 30],
    parent: groupNode
  })
  graph.createNode({
    layout: [50, 20, 30, 30],
    parent: groupNode
  })
  graph.createNode({
    layout: [20, 50, 30, 30],
    parent: groupNode
  })
  graph.adjustGroupNodeLayout(groupNode)
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphGroupNodeStyle2(graph) {
  graph.createGroupNode({
    style: new CustomGroupNodeStyle(),
    layout: [-50, -200, 100, 50],
    tag: { color: '#b91c3b', title: 'Group 1' }
  })

  graph.createGroupNode({
    layout: [-50, -120, 100, 50],
    tag: { title: 'Group 2' }
  })

  const groupNode = graph.createGroupNode({
    tag: { color: '#9e7cb5', title: 'Group 3' }
  })
  graph.createNode({
    layout: [0, -20, 30, 30],
    parent: groupNode,
    labels: ['Labels are also included in the group nodes']
  })
  graph.createNode({
    layout: [50, 60, 30, 30],
    parent: groupNode,
    labels: ['as a customization']
  })
  graph.createNode({
    layout: [-50, 50, 30, 30],
    parent: groupNode
  })
  graph.adjustGroupNodeLayout(groupNode)
}

/**
 * @param {!Array.<Point>} segment
 * @param {!Array.<Point>} line
 * @returns {?Point}
 */
export function findLineIntersection(segment, line) {
  const t = GeomUtilities.findRayIntersection(
    segment[0],
    segment[1],
    line[0],
    line[1].subtract(line[0])
  )
  return t < Number.POSITIVE_INFINITY
    ? new Point(line[0].x + (line[1].x - line[0].x) * t, line[0].y + (line[1].y - line[0].y) * t)
    : null
}

/**
 * @param {!GraphComponent} graphComponent
 * @param {!GraphEditorInputMode} inputMode
 */
export function addHoverEffect(graphComponent, inputMode) {
  const itemHoverInputMode = inputMode.itemHoverInputMode
  itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  let hoveredItemHighlight = null

  function addHighlight(node) {
    hoveredItemHighlight = graphComponent.inputModeGroup.addChild(
      new (class extends BaseClass(IVisualCreator) {
        /**
         * @param {!IRenderContext} context
         * @returns {?Visual}
         */
        createVisual(context) {
          const { x, y, width, height } = node.layout
          let el
          if (node.style instanceof CustomNodeStyle) {
            const path = (el = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
            path.setAttribute('d', createPathData(x, y, width, height))
          } else {
            const rect = (el = document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
            rect.x.baseVal.value = x
            rect.y.baseVal.value = y
            rect.width.baseVal.value = width
            rect.height.baseVal.value = height
          }
          el.setAttribute('fill', 'green')
          el.setAttribute('fill-opacity', '0.5')
          return new SvgVisual(el)
        }

        /**
         * @param {!IRenderContext} context
         * @param {?Visual} oldVisual
         * @returns {?Visual}
         */
        updateVisual(context, oldVisual) {
          return this.createVisual(context)
        }
      })()
    )
  }

  function removeHighlight() {
    hoveredItemHighlight?.remove()
    hoveredItemHighlight = null
  }

  itemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    removeHighlight()
    if (evt.item) {
      addHighlight(evt.item)
    }
  })
  inputMode.addItemTappedListener((_, evt) => {
    removeHighlight()
    if (evt.item instanceof INode) {
      addHighlight(evt.item)
      setTimeout(() => removeHighlight(), 1000)
    }
  })
}

/**
 * @param {!GraphComponent} graphComponent
 * @returns {!GraphEditorInputMode}
 */
export function enableGraphEditing(graphComponent) {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateEdge: false,
    allowAddLabel: false,
    allowCreateNode: false
  })
  graphComponent.inputMode = graphEditorInputMode
  return graphEditorInputMode
}

/**
 * @param {!GraphComponent} graphComponent
 */
export function enableGrouping(graphComponent) {
  graphComponent.inputMode.allowGroupingOperations = true
}

/**
 * @param {!GraphComponent} graphComponent
 */
export function configureMinimumSize(graphComponent) {
  graphComponent.graph.decorator.nodeDecorator.sizeConstraintProviderDecorator.setImplementation(
    new NodeSizeConstraintProvider([60, 30], [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY])
  )
}

/**
 * @param {!string} selector
 * @returns {!GraphComponent}
 */
export function initializeInlineGraphComponent(selector) {
  const graphComponent = new GraphComponent(selector)
  graphComponent.horizontalScrollBarPolicy = graphComponent.verticalScrollBarPolicy =
    ScrollBarVisibility.NEVER
  graphComponent.autoDrag = false
  graphComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE
  initializeTutorialDefaults(graphComponent)
  return graphComponent
}

/**
 * @typedef {Object} Tag
 * @property {boolean} isVisibleImplementation
 */

/**
 * @param {!INode} node
 * @returns {?Tag}
 */
function getTag(node) {
  return node.tag
}

export class BoundsVisual extends BaseClass(IVisualCreator) {
  /**
   * @param {!IRenderContext} context
   * @returns {?Visual}
   */
  createVisual(context) {
    const graph = context.canvasComponent.graph
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    g.append(
      ...graph.nodes.map((n) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        const { x, y, width, height } = n.style.renderer
          .getBoundsProvider(n, n.style)
          .getBounds(context)
          .getEnlarged(2)

        SvgVisual.setTranslate(rect, x, y)

        rect.width.baseVal.value = width
        rect.height.baseVal.value = height
        rect.setAttribute('fill', 'none')
        rect.setAttribute('stroke', 'red')

        return rect
      })
    )

    return new SvgVisual(g)
  }

  /**
   * @param {!IRenderContext} context
   * @param {?Visual} oldVisual
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}

/**
 * @param {!GraphComponent} graphComponent
 */
export function startNodeAnimation(graphComponent) {
  graphComponent.sizeChangedDetection = SizeChangedDetectionMode.TIMER
  graphComponent.addSizeChangedListener((_) => {
    setTimeout(() => {
      setAnimationStartPoint(graphComponent)
      void animate()
    }, 0)
  })

  const animator = new Animator(graphComponent)
  async function animate() {
    await animateNodes(animator, graphComponent.graph, graphComponent.graph.nodes)
    setTimeout(animate, 0)
  }

  setAnimationStartPoint(graphComponent)
  setTimeout(animate, 500)
}

/**
 * @param {!Animator} animator
 * @param {!IGraph} graph
 * @param {!Iterable.<INode>} nodes
 * @returns {!Promise}
 */
function animateNodes(animator, graph, nodes) {
  const animations = []
  for (const node of nodes) {
    const animationToRight = IAnimation.createNodeAnimation(
      graph,
      node,
      node.layout.toRect().getTranslated(new Point(1200, 0)),
      '12s'
    )
    const animationToLeft = IAnimation.createNodeAnimation(graph, node, node.layout.toRect(), '12s')
    animations.push(IAnimation.createSequentialAnimation([animationToRight, animationToLeft]))
  }
  const animation = IAnimation.createParallelAnimation(animations)
  return animator.animate(animation)
}

/**
 * @param {!GraphComponent} graphComponent
 */
function setAnimationStartPoint(graphComponent) {
  const contentRect = graphComponent.contentRect
  graphComponent.viewPoint = new Point(contentRect.topRight.x, contentRect.centerY).subtract(
    new Point(graphComponent.viewport.width, graphComponent.viewport.height * 0.5)
  )
}

export class IsVisibleNodeStyleDescriptor extends BaseClass(ICanvasObjectDescriptor) {
  /**
   * @param {!INode} node
   * @returns {!IBoundsProvider}
   */
  getBoundsProvider(node) {
    return new (class extends BaseClass(IBoundsProvider) {
      /**
       * @param {!ICanvasContext} context
       * @returns {!Rect}
       */
      getBounds(context) {
        return node.style.renderer.getBoundsProvider(node, node.style).getBounds(context)
      }
    })()
  }

  /**
   * @param {!INode} node
   * @returns {!IHitTestable}
   */
  getHitTestable(node) {
    return node.style.renderer.getHitTestable(node, node.style)
  }

  /**
   * @param {!INode} node
   * @returns {!IVisibilityTestable}
   */
  getVisibilityTestable(node) {
    const tag = getTag(node)
    return tag?.isVisibleImplementation
      ? node.style.renderer.getVisibilityTestable(node, node.style)
      : new (class extends BaseClass(IVisibilityTestable) {
          /**
           * @param {!ICanvasContext} context
           * @param {!Rect} rectangle
           * @returns {boolean}
           */
          isVisible(context, rectangle) {
            return node.layout.toRect().intersects(rectangle)
          }
        })()
  }

  /**
   * @param {!INode} node
   * @returns {!IVisualCreator}
   */
  getVisualCreator(node) {
    return new (class extends BaseClass(IVisualCreator) {
      /**
       * @param {!IRenderContext} context
       * @returns {?Visual}
       */
      createVisual(context) {
        const visual = node.style.renderer.getVisualCreator(node, node.style).createVisual(context)
        const g = visual.svgElement
        const circle = g.firstElementChild
        const tag = getTag(node)
        if (!tag?.isVisibleImplementation && circle) {
          circle.setAttribute('fill', 'rgba(127,0, 0, 0.5)')
        }
        return visual
      }

      /**
       * @param {!IRenderContext} context
       * @param {?Visual} oldVisual
       * @returns {?Visual}
       */
      updateVisual(context, oldVisual) {
        return oldVisual
      }
    })()
  }

  /**
   * @param {!ICanvasContext} context
   * @param {!ICanvasObject} canvasObject
   * @returns {boolean}
   */
  isDirty(context, canvasObject) {
    return true
  }
}

/**
 * Initializes the default styles for nodes, edges, and labels.
 * @param {!GraphComponent} graphComponent
 */
export function initializeTutorialDefaults(graphComponent) {
  applyDemoTheme(graphComponent)

  graphComponent.focusIndicatorManager.enabled = false
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    shape: 'round-rectangle',
    textFill: '#042d37',
    backgroundFill: '#9dc6d0',
    insets: 2,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #0b7189',
    targetArrow: '#0b7189 medium triangle'
  })

  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#111d4a',
    contentAreaInsets: 10
  })
}

/**
 * Fits the graph into the graph component with a minimum zoom value.
 * The graph will be slightly zoomed in to avoid that small graphs are displayed too small.
 * @param {!GraphComponent} graphComponent
 * @param {number} [minimumZoom=3]
 */
export function fitGraphBounds(graphComponent, minimumZoom = 3) {
  graphComponent.limitFitContentZoom = false
  graphComponent.fitGraphBounds()
  graphComponent.zoom = Math.min(graphComponent.zoom, minimumZoom)
}
