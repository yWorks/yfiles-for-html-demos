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
import {
  Animator,
  BaseClass,
  SmartEdgeLabelModel,
  FreeNodeLabelModel,
  type GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IAnimation,
  IBoundsProvider,
  type ICanvasContext,
  IEdge,
  type IEdgeStyle,
  type IGraph,
  type IHitTestable,
  type INode,
  IObjectRenderer,
  type IRenderContext,
  type IRenderTreeElement,
  IVisibilityTestable,
  IVisualCreator,
  LabelStyle,
  Point,
  PointerType,
  PolylineEdgeStyle,
  type Rect,
  ShapeNodeStyle,
  SvgVisual,
  type Visual
} from '@yfiles/yfiles'
import { CustomEdgeStyle } from './07-hit-testing/CustomEdgeStyle'

export function initializeLabelModel(graphComponent: GraphComponent): void {
  graphComponent.graph.edgeDefaults.labels.layoutParameter =
    new SmartEdgeLabelModel().createParameterFromSource(0)
}

export function createSimpleGraph(
  graphComponent: GraphComponent,
  opaque = true
): void {
  const graph = graphComponent.graph
  const fill = opaque ? '#0b7189' : '#0b718988'
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill,
    stroke: '#042d37'
  })
  const node1 = graph.createNode()
  const node2 = graph.createNode({
    layout: [100, 200, 30, 30]
  })

  graph.createEdge({
    source: node1,
    target: node2,
    bends: [new Point(90, 60), new Point(10, 170)]
  })
}

export function createSampleGraphHitTest(
  graph: IGraph,
  newEdgeStyle: IEdgeStyle,
  oldEdgeStyle: IEdgeStyle
): void {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  const node1 = graph.createNode({ layout: [0, 0, 30, 30] })
  const node2 = graph.createNode({
    layout: [0, 200, 30, 30]
  })
  const node3 = graph.createNode({
    layout: [100, 0, 30, 30]
  })
  const node4 = graph.createNode({
    layout: [100, 200, 30, 30]
  })

  graph.createEdge({
    source: node1,
    target: node2,
    style: oldEdgeStyle
  })
  graph.createEdge({
    source: node3,
    target: node4,
    style: newEdgeStyle
  })

  const labelModelParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1],
    [0, 10],
    [0.5, 0]
  )
  graph.addLabel(node2, 'Default hit-test', labelModelParameter)
  graph.addLabel(node4, 'Custom hit-test', labelModelParameter)
}

export function createSampleGraphIsVisible(graph: IGraph): void {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })

  for (let i = 0; i < 40; i++) {
    const node1 = graph.createNode({
      layout: [i * 50, 0, 30, 30]
    })
    const node2 = graph.createNode({
      layout: [i * 50, 100, 30, 30]
    })
    const node3 = graph.createNode({
      layout: [i * 50, 200, 30, 30]
    })

    graph.createEdge({
      source: node1,
      target: node2,
      tag: { isVisibleImplementation: false }
    })
    graph.createEdge({
      source: node2,
      target: node3,
      tag: { isVisibleImplementation: true }
    })
  }
}

export function createSampleGraphBounds(
  graph: IGraph,
  edgeStyle: IEdgeStyle
): void {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })

  const node1 = graph.createNode({
    layout: [50, 0, 30, 30]
  })
  const node2 = graph.createNode({
    layout: [200, 0, 30, 30]
  })

  graph.createEdge({
    source: node1,
    target: node2,
    style: edgeStyle
    // bends: [new Point(0, 15), new Point(0, 50), new Point(65, 50)]
  })
}

export function createSampleGraphBridges(
  graph: IGraph,
  edgeStyle: IEdgeStyle
): void {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })

  const node1 = graph.createNode({
    layout: [50, 0, 30, 30]
  })
  const node2 = graph.createNode({
    layout: [50, 100, 30, 30]
  })
  const node3 = graph.createNode({
    layout: [0, 50, 30, 30]
  })
  const node4 = graph.createNode({
    layout: [150, 50, 30, 30]
  })
  const node5 = graph.createNode({
    layout: [100, 0, 30, 30]
  })
  const node6 = graph.createNode({
    layout: [100, 100, 30, 30]
  })

  graph.createEdge({
    source: node1,
    target: node2,
    style: edgeStyle
  })
  graph.createEdge({
    source: node5,
    target: node6,
    style: edgeStyle
  })
  graph.createEdge({
    source: node3,
    target: node4,
    style: edgeStyle
  })
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
  itemHoverInputMode.hoverItems = GraphItemTypes.EDGE
  let hoveredItemHighlight: IRenderTreeElement | null = null

  function addHighlight(edge: IEdge): void {
    hoveredItemHighlight = graphComponent.renderTree.createElement(
      graphComponent.renderTree.inputModeGroup,
      new (class extends BaseClass(IVisualCreator) {
        createVisual(context: IRenderContext): Visual | null {
          const width =
            edge.style instanceof CustomEdgeStyle && edge.style.distance
              ? context.hitTestRadius + edge.style.distance + 2
              : context.hitTestRadius

          const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
          )
          path.setAttribute('d', createPathData(edge))
          path.setAttribute('fill', 'none')
          path.setAttribute('stroke', '#ab2346')
          path.setAttribute('fill-opacity', '0.5')
          path.setAttribute('stroke-width', String(width))
          return new SvgVisual(path)
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
    if (hoveredItemHighlight) {
      graphComponent.renderTree.remove(hoveredItemHighlight)
      hoveredItemHighlight = null
    }
  }

  itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    removeHighlight()
    if (evt.item) {
      addHighlight(evt.item as IEdge)
    }
  })
  inputMode.addEventListener('item-clicked', (evt) => {
    if (evt.pointerType !== PointerType.TOUCH) {
      return
    }
    removeHighlight()
    if (evt.item instanceof IEdge) {
      addHighlight(evt.item as IEdge)
      setTimeout(() => removeHighlight(), 1000)
    }
  })
}

function createPathData(edge: IEdge): string {
  const points = IEdge.getPathPoints(edge).toArray()
  return 'M ' + points.map((point) => `${point.x} ${point.y}`).join(' L ')
}

export function zoomToContent(graphComponent: GraphComponent): void {
  void graphComponent.fitGraphBounds()
  const contentRect = graphComponent.contentBounds.getEnlarged(10).size
  const viewPort = graphComponent.viewport.size
  graphComponent.zoom = Math.min(
    viewPort.width / contentRect.width,
    viewPort.height / contentRect.height
  )
}

type Tag = { isVisibleImplementation: boolean }

function getTag(edge: IEdge): Tag {
  return edge.tag as Tag
}

export class IsVisibleEdgeStyleRenderer extends BaseClass(IObjectRenderer) {
  getBoundsProvider(edge: IEdge): IBoundsProvider {
    return new (class extends BaseClass(IBoundsProvider) {
      getBounds(context: ICanvasContext): Rect {
        return edge.style.renderer
          .getBoundsProvider(edge, edge.style)
          .getBounds(context)
      }
    })()
  }

  getHitTestable(edge: IEdge): IHitTestable {
    return edge.style.renderer.getHitTestable(edge, edge.style)
  }

  getVisibilityTestable(edge: IEdge): IVisibilityTestable {
    const tag = getTag(edge)
    return tag.isVisibleImplementation
      ? edge.style.renderer.getVisibilityTestable(edge, edge.style)
      : new (class extends BaseClass(IVisibilityTestable) {
          isVisible(context: ICanvasContext, rectangle: Rect): boolean {
            return edge.style.renderer
              .getBoundsProvider(edge, edge.style)
              .getBounds(context)
              .intersects(rectangle)
          }
        })()
  }

  getVisualCreator(edge: IEdge): IVisualCreator {
    return new (class extends BaseClass(IVisualCreator) {
      createVisual(context: IRenderContext): Visual | null {
        const visual = edge.style.renderer
          .getVisualCreator(edge, edge.style)
          .createVisual(context) as SvgVisual
        const g = visual.svgElement as SVGGElement
        const circle = g.firstElementChild
        const tag = getTag(edge)
        if (!tag.isVisibleImplementation && circle) {
          circle.setAttribute('fill', 'rgba(127,0, 0, 1)')
        }
        return visual
      }

      updateVisual(
        context: IRenderContext,
        oldVisual: Visual | null
      ): Visual | null {
        return oldVisual
      }
    })()
  }
}

export function startAnimation(graphComponent: GraphComponent): void {
  graphComponent.addEventListener('size-changed', () => {
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
      node.layout.toRect().getTranslated(new Point(350, 0)),
      '12s'
    )
    const animationToLeft = IAnimation.createNodeAnimation(
      graph,
      node,
      node.layout.toRect(),
      '12s'
    )
    animations.push(
      IAnimation.createSequentialAnimation([animationToRight, animationToLeft])
    )
  }
  const animation = IAnimation.createParallelAnimation(animations)
  return animator.animate(animation)
}

function setAnimationStartPoint(graphComponent: GraphComponent): void {
  const contentRect = graphComponent.contentBounds
  graphComponent.viewPoint = new Point(
    contentRect.topRight.x,
    contentRect.centerY
  ).subtract(
    new Point(
      graphComponent.viewport.width,
      graphComponent.viewport.height * 0.5
    )
  )
}

export class BoundsVisual extends BaseClass(IVisualCreator) {
  createVisual(context: IRenderContext): Visual | null {
    const graph = (context.canvasComponent as GraphComponent).graph
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    g.append(
      ...graph.edges.map((e) => {
        const rect = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        )
        const { x, y, width, height } = e.style.renderer
          .getBoundsProvider(e, e.style)
          .getBounds(context)

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
  graphComponent.focusIndicatorManager.enabled = false
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  graph.nodeDefaults.labels.style = new LabelStyle({
    shape: 'round-rectangle',
    textFill: '#042d37',
    backgroundFill: '#9dc6d0',
    padding: 2,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #0b7189',
    targetArrow: '#0b7189 medium triangle'
  })

  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#111d4a',
    contentAreaPadding: 10
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
  void graphComponent.fitGraphBounds()
  graphComponent.zoom = Math.min(graphComponent.zoom, minimumZoom)
}
