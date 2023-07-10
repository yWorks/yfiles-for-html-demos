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
  Animator,
  BaseClass,
  DefaultLabelStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FreeEdgeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IAnimation,
  ICanvasObjectDescriptor,
  IHitTestable,
  ILabel,
  IVisibilityTestable,
  IVisualCreator,
  LabelStyleBase,
  MouseWheelBehaviors,
  Point,
  PolylineEdgeStyle,
  ScrollBarVisibility,
  ShapeNodeStyle,
  SizeChangedDetectionMode,
  SvgVisual
} from 'yfiles'
import { createBackgroundShapeData } from './09-hit-testing/CustomLabelStyle.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * @param {!GraphComponent} graphComponent
 */
export function initializeLabelModel(graphComponent) {
  graphComponent.graph.edgeDefaults.labels.layoutParameter = new FreeEdgeLabelModel({
    edgeRelativeAngle: true
  }).createEdgeAnchored({
    distance: -15
  })
  graphComponent.graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter(ExteriorLabelModelPosition.NORTH)
}

/**
 * @param {!GraphComponent} graphComponent
 */
export function initializeLabelModelHitTest(graphComponent) {
  graphComponent.graph.edgeDefaults.labels.layoutParameter = new FreeEdgeLabelModel({
    edgeRelativeAngle: true
  }).createEdgeAnchored({
    distance: -30
  })
  graphComponent.graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 20
  }).createParameter(ExteriorLabelModelPosition.NORTH)
}

/**
 * @param {!GraphComponent} graphComponent
 */
export function initializeLabelModelVisibility(graphComponent) {
  graphComponent.graph.edgeDefaults.labels.layoutParameter = new FreeEdgeLabelModel({
    edgeRelativeAngle: true
  }).createEdgeAnchored({
    distance: -60
  })
  graphComponent.graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 50
  }).createParameter(ExteriorLabelModelPosition.NORTH)
}

/**
 * @param {!IGraph} graph
 */
export function createSimpleGraph(graph) {
  const node1 = graph.createNode({ labels: ['Node Label 1'] })
  const node2 = graph.createNode({
    layout: [100, 200, 30, 30],
    labels: ['Node Label 2']
  })

  graph.createEdge({ source: node1, target: node2, labels: ['Edge Label'] })
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphPreferredSize(graph) {
  const node1 = graph.createNode({
    labels: ['Label size adjusts to long text']
  })
  const node2 = graph.createNode({
    layout: [100, 250, 30, 30],
    labels: ["I'm small"]
  })
  graph.createNode({
    layout: [-50, 150, 30, 30],
    labels: ['Even line breaks\nwork now!']
  })

  graph.createEdge({
    source: node1,
    target: node2,
    labels: ['Edge labels are adjusted, too']
  })
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphLargeLabel(graph) {
  graph.createNode({ labels: ['Long texts overflow'] })
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphHitTesting(graph) {
  const oldNode1 = graph.createNode({
    layout: [-200, 0, 30, 30],
    labels: [{ text: 'Old Label Style', tag: { backgroundColor: '#b91c3b' } }]
  })
  const oldNode2 = graph.createNode({
    layout: [-100, 200, 30, 30],
    labels: [{ text: 'Old Label Style', tag: { backgroundColor: '#b91c3b' } }]
  })

  graph.createEdge({
    source: oldNode1,
    target: oldNode2,
    labels: [{ text: 'Old Label Style', tag: { backgroundColor: '#b91c3b' } }]
  })

  const node1 = graph.createNode({
    labels: [{ text: 'Node Label 1', tag: { isHitImplementation: true } }]
  })
  const node2 = graph.createNode({
    layout: [100, 200, 30, 30],
    labels: [{ text: 'Node Label 2', tag: { isHitImplementation: true } }]
  })

  graph.createEdge({
    source: node1,
    target: node2,
    labels: [{ text: 'Edge Label', tag: { isHitImplementation: true } }]
  })
}

/**
 * @param {!IGraph} graph
 * @param {!Rect} area
 */
export function createSampleGraphVisibility(graph, area) {
  // scatter nodes on random y positions
  const extent = 1200
  const nodeRadius = 70
  const nodeDiameter = nodeRadius * 2

  for (let i = area.y - extent; i < area.height + extent * 2; i += nodeDiameter) {
    const x = area.x + nodeRadius + 50 + Math.random() * (area.width - nodeDiameter - 100)

    const p = new Point(x - nodeRadius, i)
    const p2 = new Point(x + nodeRadius, i)
    graph.createNode({
      layout: [p.x, p.y, 30, 30],
      labels: [
        {
          text: 'Default visibility',
          tag: { isVisibleImplementation: false, color: '#b91c3b' }
        }
      ]
    })
    graph.createNode({
      layout: [p2.x, p2.y, 30, 30],
      labels: [{ text: 'Adjusted visibility', tag: { isVisibleImplementation: true } }]
    })
  }
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphGetBounds(graph) {
  const node1 = graph.createNode({ labels: ['Node Label 1'] })
  const node2 = graph.createNode({
    layout: [20, 200, 30, 30],
    labels: ['Node Label 2']
  })

  graph.createEdge({ source: node1, target: node2, labels: ['Edge Label'] })
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
 * @param {!GraphEditorInputMode} inputMode
 */
export function addHoverEffect(graphComponent, inputMode) {
  const itemHoverInputMode = inputMode.itemHoverInputMode
  itemHoverInputMode.hoverItems = GraphItemTypes.LABEL
  let hoveredItemHighlight = null

  function addHighlight(label) {
    hoveredItemHighlight = graphComponent.inputModeGroup.addChild(
      new (class extends BaseClass(IVisualCreator) {
        /**
         * @param {!IRenderContext} context
         * @returns {?Visual}
         */
        createVisual(context) {
          let el
          const path = (el = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
          path.setAttribute('d', createBackgroundShapeData(label.layout.toSize()))
          const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
          transform.applyTo(path)
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
    if (evt.item instanceof ILabel) {
      addHighlight(evt.item)
      setTimeout(() => removeHighlight(), 1000)
    }
  })
}

/**
 * @typedef {Object} Tag
 * @property {boolean} isHitImplementation
 * @property {boolean} isVisibleImplementation
 */

/**
 * @param {!ILabel} label
 * @returns {!Tag}
 */
function getTag(label) {
  return label.tag
}

export class IsHitLabelStyleDescriptor extends BaseClass(ICanvasObjectDescriptor) {
  /**
   * @param {!ILabel} label
   * @returns {!IBoundsProvider}
   */
  getBoundsProvider(label) {
    return label.style.renderer.getBoundsProvider(label, label.style)
  }

  /**
   * @param {!ILabel} label
   * @returns {!IHitTestable}
   */
  getHitTestable(label) {
    const tag = getTag(label)
    return tag.isHitImplementation
      ? label.style.renderer.getHitTestable(label, label.style)
      : new (class extends BaseClass(IHitTestable) {
          /**
           * @param {!IInputModeContext} context
           * @param {!Point} location
           * @returns {boolean}
           */
          isHit(context, location) {
            return label.layout.hits(location, context.hitTestRadius)
          }
        })()
  }

  /**
   * @param {!ILabel} label
   * @returns {!IVisibilityTestable}
   */
  getVisibilityTestable(label) {
    return label.style.renderer.getVisibilityTestable(label, label.style)
  }

  /**
   * @param {!ILabel} label
   * @returns {!IVisualCreator}
   */
  getVisualCreator(label) {
    return label.style.renderer.getVisualCreator(label, label.style)
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

export class IsVisibleLabelStyleDescriptor extends BaseClass(ICanvasObjectDescriptor) {
  /**
   * @param {!ILabel} label
   * @returns {!IBoundsProvider}
   */
  getBoundsProvider(label) {
    return label.style.renderer.getBoundsProvider(label, label.style)
  }

  /**
   * @param {!ILabel} label
   * @returns {!IHitTestable}
   */
  getHitTestable(label) {
    return label.style.renderer.getHitTestable(label, label.style)
  }

  /**
   * @param {!ILabel} label
   * @returns {!IVisibilityTestable}
   */
  getVisibilityTestable(label) {
    const tag = getTag(label)
    return tag.isVisibleImplementation
      ? label.style.renderer.getVisibilityTestable(label, label.style)
      : new (class extends BaseClass(IVisibilityTestable) {
          /**
           * @param {!ICanvasContext} context
           * @param {!Rect} rectangle
           * @returns {boolean}
           */
          isVisible(context, rectangle) {
            return rectangle.intersects(label.layout)
          }
        })()
  }

  /**
   * @param {!ILabel} label
   * @returns {!IVisualCreator}
   */
  getVisualCreator(label) {
    return label.style.renderer.getVisualCreator(label, label.style)
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
 * @param {!GraphComponent} graphComponent
 */
export function startNodeAnimation(graphComponent) {
  graphComponent.sizeChangedDetection = SizeChangedDetectionMode.TIMER
  graphComponent.addSizeChangedListener(sender => {
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
      node.layout.toRect().getTranslated(new Point(0, 500)),
      '8s'
    )
    const animationToLeft = IAnimation.createNodeAnimation(graph, node, node.layout.toRect(), '8s')
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
  graphComponent.viewPoint = new Point(
    contentRect.centerX - graphComponent.viewport.width * 0.5,
    contentRect.bottomLeft.y
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

export class BoundsVisual extends BaseClass(IVisualCreator) {
  /**
   * @param {!IRenderContext} context
   * @returns {?Visual}
   */
  createVisual(context) {
    const graph = context.canvasComponent.graph
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    g.append(
      ...graph.labels.map(label => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        const { x, y, width, height } = label.style.renderer
          .getBoundsProvider(label, label.style)
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
