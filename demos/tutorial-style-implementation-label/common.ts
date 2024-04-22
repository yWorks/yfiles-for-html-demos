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
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
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
  type IBoundsProvider,
  type ICanvasContext,
  type ICanvasObject,
  ICanvasObjectDescriptor,
  type IGraph,
  IHitTestable,
  type IInputModeContext,
  ILabel,
  type INode,
  type IRenderContext,
  IVisibilityTestable,
  IVisualCreator,
  LabelStyleBase,
  MouseWheelBehaviors,
  Point,
  PolylineEdgeStyle,
  type Rect,
  ScrollBarVisibility,
  ShapeNodeStyle,
  SizeChangedDetectionMode,
  SvgVisual,
  type Visual
} from 'yfiles'
import { createBackgroundShapeData } from './09-hit-testing/CustomLabelStyle'
import { applyDemoTheme } from 'demo-resources/demo-styles'

export function initializeLabelModel(graphComponent: GraphComponent): void {
  graphComponent.graph.edgeDefaults.labels.layoutParameter =
    new FreeEdgeLabelModel({
      edgeRelativeAngle: true
    }).createEdgeAnchored({
      distance: -15
    })
  graphComponent.graph.nodeDefaults.labels.layoutParameter =
    new ExteriorLabelModel({
      insets: 5
    }).createParameter(ExteriorLabelModelPosition.NORTH)
}

export function initializeLabelModelHitTest(
  graphComponent: GraphComponent
): void {
  graphComponent.graph.edgeDefaults.labels.layoutParameter =
    new FreeEdgeLabelModel({
      edgeRelativeAngle: true
    }).createEdgeAnchored({
      distance: -30
    })
  graphComponent.graph.nodeDefaults.labels.layoutParameter =
    new ExteriorLabelModel({
      insets: 20
    }).createParameter(ExteriorLabelModelPosition.NORTH)
}

export function initializeLabelModelVisibility(
  graphComponent: GraphComponent
): void {
  graphComponent.graph.edgeDefaults.labels.layoutParameter =
    new FreeEdgeLabelModel({
      edgeRelativeAngle: true
    }).createEdgeAnchored({
      distance: -60
    })
  graphComponent.graph.nodeDefaults.labels.layoutParameter =
    new ExteriorLabelModel({
      insets: 50
    }).createParameter(ExteriorLabelModelPosition.NORTH)
}

export function createSimpleGraph(graph: IGraph): void {
  const node1 = graph.createNode({ labels: ['Node Label 1'] })
  const node2 = graph.createNode({
    layout: [100, 200, 30, 30],
    labels: ['Node Label 2']
  })

  graph.createEdge({ source: node1, target: node2, labels: ['Edge Label'] })
}

export function createSampleGraphPreferredSize(graph: IGraph): void {
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

export function createSampleGraphLargeLabel(graph: IGraph): void {
  graph.createNode({ labels: ['Long texts overflow'] })
}

export function createSampleGraphHitTesting(graph: IGraph): void {
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

export function createSampleGraphVisibility(graph: IGraph, area: Rect): void {
  // scatter nodes on random y positions
  const extent = 1200
  const nodeRadius = 70
  const nodeDiameter = nodeRadius * 2

  for (
    let i = area.y - extent;
    i < area.height + extent * 2;
    i += nodeDiameter
  ) {
    const x =
      area.x +
      nodeRadius +
      50 +
      Math.random() * (area.width - nodeDiameter - 100)

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
      labels: [
        { text: 'Adjusted visibility', tag: { isVisibleImplementation: true } }
      ]
    })
  }
}

export function createSampleGraphGetBounds(graph: IGraph): void {
  const node1 = graph.createNode({ labels: ['Node Label 1'] })
  const node2 = graph.createNode({
    layout: [20, 200, 30, 30],
    labels: ['Node Label 2']
  })

  graph.createEdge({ source: node1, target: node2, labels: ['Edge Label'] })
}

export function enableGraphEditing(
  graphComponent: GraphComponent
): GraphEditorInputMode {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateEdge: false,
    allowAddLabel: false,
    allowCreateNode: false
  })
  graphComponent.inputMode = graphEditorInputMode
  return graphEditorInputMode
}

export function addHoverEffect(
  graphComponent: GraphComponent,
  inputMode: GraphEditorInputMode
): void {
  const itemHoverInputMode = inputMode.itemHoverInputMode
  itemHoverInputMode.hoverItems = GraphItemTypes.LABEL
  let hoveredItemHighlight: ICanvasObject | null = null

  function addHighlight(label: ILabel): void {
    hoveredItemHighlight = graphComponent.inputModeGroup.addChild(
      new (class extends BaseClass(IVisualCreator) {
        createVisual(context: IRenderContext): Visual | null {
          let el: SVGElement
          const path = (el = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
          ))
          path.setAttribute(
            'd',
            createBackgroundShapeData(label.layout.toSize())
          )
          const transform = LabelStyleBase.createLayoutTransform(
            context,
            label.layout,
            true
          )
          transform.applyTo(path)
          el.setAttribute('fill', 'green')
          el.setAttribute('fill-opacity', '0.5')
          return new SvgVisual(el)
        }

        updateVisual(
          context: IRenderContext,
          oldVisual: Visual | null
        ): Visual | null {
          return this.createVisual(context)
        }
      })()
    )
  }

  function removeHighlight(): void {
    hoveredItemHighlight?.remove()
    hoveredItemHighlight = null
  }

  itemHoverInputMode.addHoveredItemChangedListener((_, evt) => {
    removeHighlight()
    if (evt.item) {
      addHighlight(evt.item as ILabel)
    }
  })
  inputMode.addItemTappedListener((_, evt) => {
    removeHighlight()
    if (evt.item instanceof ILabel) {
      addHighlight(evt.item as ILabel)
      setTimeout(() => removeHighlight(), 1000)
    }
  })
}

type Tag = { isHitImplementation: boolean; isVisibleImplementation: boolean }

function getTag(label: ILabel): Tag {
  return label.tag as Tag
}

export class IsHitLabelStyleDescriptor extends BaseClass(
  ICanvasObjectDescriptor
) {
  getBoundsProvider(label: ILabel): IBoundsProvider {
    return label.style.renderer.getBoundsProvider(label, label.style)
  }

  getHitTestable(label: ILabel): IHitTestable {
    const tag = getTag(label)
    return tag.isHitImplementation
      ? label.style.renderer.getHitTestable(label, label.style)
      : new (class extends BaseClass(IHitTestable) {
          isHit(context: IInputModeContext, location: Point): boolean {
            return label.layout.hits(location, context.hitTestRadius)
          }
        })()
  }

  getVisibilityTestable(label: ILabel): IVisibilityTestable {
    return label.style.renderer.getVisibilityTestable(label, label.style)
  }

  getVisualCreator(label: ILabel): IVisualCreator {
    return label.style.renderer.getVisualCreator(label, label.style)
  }

  isDirty(context: ICanvasContext, canvasObject: ICanvasObject): boolean {
    return true
  }
}

export class IsVisibleLabelStyleDescriptor extends BaseClass(
  ICanvasObjectDescriptor
) {
  getBoundsProvider(label: ILabel): IBoundsProvider {
    return label.style.renderer.getBoundsProvider(label, label.style)
  }

  getHitTestable(label: ILabel): IHitTestable {
    return label.style.renderer.getHitTestable(label, label.style)
  }

  getVisibilityTestable(label: ILabel): IVisibilityTestable {
    const tag = getTag(label)
    return tag.isVisibleImplementation
      ? label.style.renderer.getVisibilityTestable(label, label.style)
      : new (class extends BaseClass(IVisibilityTestable) {
          isVisible(context: ICanvasContext, rectangle: Rect): boolean {
            return rectangle.intersects(label.layout)
          }
        })()
  }

  getVisualCreator(label: ILabel): IVisualCreator {
    return label.style.renderer.getVisualCreator(label, label.style)
  }

  isDirty(context: ICanvasContext, canvasObject: ICanvasObject): boolean {
    return true
  }
}

export function startNodeAnimation(graphComponent: GraphComponent): void {
  graphComponent.sizeChangedDetection = SizeChangedDetectionMode.TIMER
  graphComponent.addSizeChangedListener((_) => {
    setTimeout(() => {
      setAnimationStartPoint(graphComponent)
      void animate()
    }, 0)
  })

  const animator = new Animator(graphComponent)
  async function animate(): Promise<void> {
    await animateNodes(
      animator,
      graphComponent.graph,
      graphComponent.graph.nodes
    )
    setTimeout(animate, 0)
  }

  setAnimationStartPoint(graphComponent)
  setTimeout(animate, 500)
}

function animateNodes(
  animator: Animator,
  graph: IGraph,
  nodes: Iterable<INode>
): Promise<void> {
  const animations: IAnimation[] = []
  for (const node of nodes) {
    const animationToRight = IAnimation.createNodeAnimation(
      graph,
      node,
      node.layout.toRect().getTranslated(new Point(0, 500)),
      '8s'
    )
    const animationToLeft = IAnimation.createNodeAnimation(
      graph,
      node,
      node.layout.toRect(),
      '8s'
    )
    animations.push(
      IAnimation.createSequentialAnimation([animationToRight, animationToLeft])
    )
  }
  const animation = IAnimation.createParallelAnimation(animations)
  return animator.animate(animation)
}

function setAnimationStartPoint(graphComponent: GraphComponent): void {
  const contentRect = graphComponent.contentRect
  graphComponent.viewPoint = new Point(
    contentRect.centerX - graphComponent.viewport.width * 0.5,
    contentRect.bottomLeft.y
  )
}
export function initializeInlineGraphComponent(
  selector: string
): GraphComponent {
  const graphComponent = new GraphComponent(selector)
  graphComponent.horizontalScrollBarPolicy =
    graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.NEVER
  graphComponent.autoDrag = false
  graphComponent.mouseWheelBehavior = MouseWheelBehaviors.NONE
  initializeTutorialDefaults(graphComponent)
  return graphComponent
}

export class BoundsVisual extends BaseClass(IVisualCreator) {
  createVisual(context: IRenderContext): Visual | null {
    const graph = (context.canvasComponent as GraphComponent).graph
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    g.append(
      ...graph.labels.map((label) => {
        const rect = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        )
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

  updateVisual(
    context: IRenderContext,
    oldVisual: Visual | null
  ): Visual | null {
    return this.createVisual(context)
  }
}

/**
 * Initializes the default styles for nodes, edges, and labels.
 */
export function initializeTutorialDefaults(
  graphComponent: GraphComponent
): void {
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
 */
export function fitGraphBounds(
  graphComponent: GraphComponent,
  minimumZoom = 3
): void {
  graphComponent.limitFitContentZoom = false
  graphComponent.fitGraphBounds()
  graphComponent.zoom = Math.min(graphComponent.zoom, minimumZoom)
}
