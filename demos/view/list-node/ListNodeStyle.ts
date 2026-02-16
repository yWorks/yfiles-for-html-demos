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
import {
  type Constructor,
  Fill,
  type IEnumerable,
  type IInputModeContext,
  type INode,
  INodeSizeConstraintProvider,
  type IPortCandidate,
  IPortCandidateProvider,
  type IRenderContext,
  List,
  NodeSizeConstraintProvider,
  NodeStyleBase,
  type Point,
  PortCandidate,
  PortCandidateProviderBase,
  PortCandidateValidity,
  Rect,
  Size,
  Stroke,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'
import type { NodeInfo } from './ListNodeDemo'

const SVGNS = 'http://www.w3.org/2000/svg'

type RenderState = {
  nodeSize: Size
  backgroundFill: Fill
  borderFill: Fill
  lineStroke: Stroke
  numRows: number
  draggingIndex: number | null
}

type ListNodeStyleVisual = TaggedSvgVisual<SVGGElement, RenderState>

/**
 * A node style with a header and a thick border and row separators.
 * Note that the row contents are not rendered. These are rendered as ports and port labels.
 * Also note that the header text is also rendered as node label.
 */
export class ListNodeStyle extends NodeStyleBase<ListNodeStyleVisual> {
  private readonly borderFill = Fill.from('#2C4B52')
  private readonly backgroundFill = Fill.from('#9CC5CF')
  private readonly highlightFill = Fill.from('#6aa7b0')
  private readonly lineStroke: Stroke = Stroke.WHITE

  private readonly headerHeight = 20
  private readonly rowHeight = 20

  /**
   * Create a new visual for the node.
   * Creates a SvgElement and a <g> element and delegates to {@link render}
   * to create the group's children.
   */
  protected createVisual(context: IRenderContext, node: INode): ListNodeStyleVisual {
    const nodeSize = node.layout.toSize()
    const g = document.createElementNS(SVGNS, 'g')
    const nodeInfo = node.tag as NodeInfo
    this.render(g, nodeSize, nodeInfo, context)
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    // store the current state in cache
    const cache: RenderState = {
      nodeSize: nodeSize,
      backgroundFill: this.backgroundFill,
      borderFill: this.borderFill,
      lineStroke: this.lineStroke,
      numRows: nodeInfo.rows.length,
      draggingIndex: nodeInfo.draggingIndex
    }
    return SvgVisual.from(g, cache)
  }

  /**
   * Updates an already created visual.
   */
  protected updateVisual(
    context: IRenderContext,
    oldVisual: ListNodeStyleVisual,
    node: INode
  ): ListNodeStyleVisual {
    const g = oldVisual.svgElement
    // test whether the node has to be re-rendered
    const cache = oldVisual.tag
    const nodeSize = node.layout.toSize()
    const nodeInfo = node.tag as NodeInfo
    if (
      !(
        cache.nodeSize === nodeSize &&
        cache.backgroundFill === this.backgroundFill &&
        cache.borderFill === this.borderFill &&
        cache.lineStroke === this.lineStroke &&
        cache.numRows === nodeInfo.rows.length &&
        cache.draggingIndex === nodeInfo.draggingIndex
      )
    ) {
      // re-render: remove all children and call render
      while (g.hasChildNodes()) {
        g.removeChild(g.lastChild!)
      }
      this.render(g, nodeSize, nodeInfo, context)
      oldVisual.tag = {
        nodeSize: nodeSize,
        backgroundFill: this.backgroundFill,
        borderFill: this.borderFill,
        lineStroke: this.lineStroke,
        numRows: nodeInfo.rows.length,
        draggingIndex: nodeInfo.draggingIndex
      }
    }
    // set the new position
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * The actual render method: adds child elements to the given <g> element.
   */
  private render(g: SVGGElement, nodeSize: Size, nodeInfo: NodeInfo, context: IRenderContext) {
    // draw the rect with a thick border
    const borderThickness = 4
    const borderStroke = new Stroke({ fill: this.borderFill, thickness: borderThickness })
    // rect around the border with backgroundFill
    const border = document.createElementNS(SVGNS, 'rect')
    border.width.baseVal.value = nodeSize.width
    border.height.baseVal.value = nodeSize.height
    border.rx.baseVal.value = 2
    border.ry.baseVal.value = 2
    borderStroke.applyTo(border, context)
    this.backgroundFill.applyTo(border, context)
    g.appendChild(border)

    if (nodeSize.height < this.headerHeight) {
      return g
    }

    // render a header which is used as background for the label
    const header = document.createElementNS(SVGNS, 'rect')
    header.width.baseVal.value = nodeSize.width
    header.height.baseVal.value = this.headerHeight
    this.borderFill.applyTo(header, context)
    g.appendChild(header)

    const borderInset = borderThickness / 2
    for (let i = 0; i < nodeInfo.rows.length; i++) {
      const y = this.headerHeight + this.rowHeight * i
      if (nodeInfo.draggingIndex === i) {
        // highlight currently dragged row
        const highlightRect = document.createElementNS(SVGNS, 'rect')
        highlightRect.x.baseVal.value = borderInset
        highlightRect.y.baseVal.value = y
        highlightRect.width.baseVal.value = nodeSize.width - borderInset * 2
        highlightRect.height.baseVal.value = this.rowHeight
        this.highlightFill.applyTo(highlightRect, context)
        g.appendChild(highlightRect)
      }
      if (i > 0) {
        // draw a separator line
        const line = document.createElementNS(SVGNS, 'line')
        line.x1.baseVal.value = borderInset
        line.y1.baseVal.value = y
        line.x2.baseVal.value = nodeSize.width - borderInset
        line.y2.baseVal.value = y
        this.lineStroke.applyTo(line, context)
        g.appendChild(line)
      }
    }

    return g
  }

  /**
   * Modify the node's lookup to provide special interaction behavior.
   */
  protected lookup(node: INode, type: Constructor<any>): any {
    if (type === IPortCandidateProvider) {
      // return a special PortCandidateProvider which provides existing and free ports
      return new ExistingAndFreePortCandidateProvider(node)
    }
    if (type === INodeSizeConstraintProvider) {
      // limit the size
      const minimumHeight = this.getMinimumHeight(node)
      return new NodeSizeConstraintProvider([100, minimumHeight], Size.INFINITE, Rect.EMPTY)
    }
    // return the defaults for all other types
    return super.lookup(node, type)
  }

  /**
   * Calculates the index of the row at the given location.
   * @returns the index of the row at the given location or `-1` if there is no such row.
   */
  getRowIndex(node: INode, location: Point): number {
    const layout = node.layout
    const y = location.y - layout.y
    if (
      location.x < layout.x ||
      location.x > layout.maxX ||
      y <= this.headerHeight ||
      y > layout.height
    ) {
      return -1
    }
    const index = ((y - this.headerHeight) / this.rowHeight) | 0
    return index < node.tag.rows.length ? index : -1
  }

  /**
   * Determines if the given location lies inside the header visualization of the given node.
   * @param node the node whose header is queried.
   * @param location the location to check.
   */
  isHeaderHit(node: INode, location: Point): boolean {
    const nl = node.layout
    const nx = nl.x
    const ny = nl.y
    return (
      nx <= location.x &&
      location.x <= nx + nl.width &&
      ny <= location.y &&
      location.y <= ny + this.headerHeight
    )
  }

  /**
   * Returns the relative y-coordinate of the center of the row at the given row index.
   * @param rowIndex the index of the row whose center coordinate is calculated.
   */
  getRowCenterY(rowIndex: number): number {
    return this.headerHeight + this.rowHeight / 2 + rowIndex * this.rowHeight
  }

  getMinimumHeight(node: INode): number {
    return this.headerHeight + node.tag.rows.length * this.rowHeight
  }
}

/**
 * An {@link IPortCandidateProvider} which returns candidates for all existing and free ports.
 */
class ExistingAndFreePortCandidateProvider extends PortCandidateProviderBase {
  private readonly node: INode

  /**
   * Creates a new instance.
   * @param node The given node.
   */
  constructor(node: INode) {
    super()
    this.node = node
  }

  /**
   * Returns possible source port candidates for edge creation.
   */
  getAllSourcePortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesFor(context, false)
  }

  /**
   * Returns possible target port candidates for edge creation.
   */
  getAllTargetPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesFor(context, true)
  }

  /**
   * Returns possible source port candidates for a newly created edge which starts at target
   */
  getSourcePortCandidates(
    context: IInputModeContext,
    target: IPortCandidate
  ): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesFor(context, false)
  }

  /**
   * Returns possible target port candidates for a newly created edge which starts at source
   */
  getTargetPortCandidates(
    context: IInputModeContext,
    source: IPortCandidate
  ): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesFor(context, true)
  }

  /**
   * Default implementation of the abstract base class. Not used for edge creation.
   */
  getPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    return this.getPortCandidatesFor(context, false)
  }

  /**
   * Returns a list that contains a port candidate for each of the node's
   * ports. Each candidate has the same location as the port. If a port
   * already has a connected edge, its port candidate is marked as invalid.
   * Also, it only returns candidates for in-ports for incoming edges (target port candidates)
   * and out-ports for source port candidates, respectively.
   */
  private getPortCandidatesFor(
    context: IInputModeContext,
    incoming: boolean
  ): IEnumerable<IPortCandidate> {
    const candidates = new List<IPortCandidate>()
    const graph = context.graph

    // Create the candidate for each port
    if (graph) {
      this.node.ports
        .filter((port) => port.tag.incoming === incoming)
        .forEach((port) => {
          const portCandidate = new PortCandidate(port)
          portCandidate.validity =
            graph.degree(port) === 0 ? PortCandidateValidity.VALID : PortCandidateValidity.INVALID
          candidates.add(portCandidate)
        })
    }

    return candidates
  }
}
