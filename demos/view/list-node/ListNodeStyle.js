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
  Class,
  DefaultPortCandidate,
  Fill,
  IEnumerable,
  IInputModeContext,
  INode,
  INodeSizeConstraintProvider,
  IPortCandidate,
  IPortCandidateProvider,
  IRenderContext,
  List,
  NodeSizeConstraintProvider,
  NodeStyleBase,
  Point,
  PortCandidateProviderBase,
  PortCandidateValidity,
  Rect,
  Size,
  Stroke,
  SvgVisual,
  Visual
} from 'yfiles'

const SVGNS = 'http://www.w3.org/2000/svg'

/**
 * @typedef {Object} RenderState
 * @property {Size} nodeSize
 * @property {Fill} backgroundFill
 * @property {Fill} borderFill
 * @property {Stroke} lineStroke
 * @property {number} numRows
 * @property {number} draggingIndex
 */

/**
 * @typedef {*} SVGGElementWithRenderState
 */

/**
 * A node style with a header and a thick border and row separators.
 * Note that the row contents are not rendered. These are rendered as ports and port labels.
 * Also note that the header text is also rendered as node label.
 */
export class ListNodeStyle extends NodeStyleBase {
  borderFill = Fill.from('#2C4B52')
  backgroundFill = Fill.from('#9CC5CF')
  highlightFill = Fill.from('#6aa7b0')
  lineStroke = Stroke.WHITE

  headerHeight = 20
  rowHeight = 20

  /**
   * Create a new visual for the node.
   * Creates a SvgElement and a <g> element and delegates to {@link render}
   * to create the group's children.
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {?Visual}
   */
  createVisual(context, node) {
    const nodeSize = node.layout.toSize()
    const g = document.createElementNS(SVGNS, 'g')
    const nodeInfo = node.tag
    this.render(g, nodeSize, nodeInfo, context)
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Updates an already created visual.
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @param {!INode} node
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual, node) {
    if (!(oldVisual instanceof SvgVisual && oldVisual.svgElement instanceof SVGGElement)) {
      // The visual is not as expected: create a new one
      return this.createVisual(context, node)
    }
    const g = oldVisual.svgElement
    // test whether the node has to be re-rendered
    const cache = g['data-renderDataCache']
    const nodeSize = node.layout.toSize()
    const nodeInfo = node.tag
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
        g.removeChild(g.lastChild)
      }
      this.render(g, nodeSize, nodeInfo, context)
    }
    // set the new position
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * The actual render method: adds child elements to the given <g> element.
   * @param {!SVGGElementWithRenderState} g
   * @param {!Size} nodeSize
   * @param {!NodeInfo} nodeInfo
   * @param {!IRenderContext} context
   */
  render(g, nodeSize, nodeInfo, context) {
    // append the current state to the <g> element
    g['data-renderDataCache'] = {
      nodeSize: nodeSize,
      backgroundFill: this.backgroundFill,
      borderFill: this.borderFill,
      lineStroke: this.lineStroke,
      numRows: nodeInfo.rows.length,
      draggingIndex: nodeInfo.draggingIndex
    }
    // draw the rect with a thick border
    const borderThickness = 4
    const borderStroke = new Stroke({
      fill: this.borderFill,
      thickness: borderThickness
    })
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
   * @param {!INode} node
   * @param {!Class} type
   * @returns {*}
   */
  lookup(node, type) {
    if (type === IPortCandidateProvider.$class) {
      // return a special PortCandidateProvider which provides existing and free ports
      return new ExistingAndFreePortCandidateProvider(node)
    }
    if (type === INodeSizeConstraintProvider.$class) {
      // limit the size
      const minimumHeight = this.getMinimumHeight(node)
      return new NodeSizeConstraintProvider([100, minimumHeight], Size.INFINITE, Rect.EMPTY)
    }
    // return the defaults for all other types
    return super.lookup(node, type)
  }

  /**
   * Calculates the index of the row at the given location.
   * @returns {number} the index of the row at the given location or `-1` if there is no such row.
   * @param {!INode} node
   * @param {!Point} location
   */
  getRowIndex(node, location) {
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
   * @param {!INode} node the node whose header is queried.
   * @param {!Point} location the location to check.
   * @returns {boolean}
   */
  isHeaderHit(node, location) {
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
   * @param {number} rowIndex the index of the row whose center coordinate is calculated.
   * @returns {number}
   */
  getRowCenterY(rowIndex) {
    return this.headerHeight + this.rowHeight / 2 + rowIndex * this.rowHeight
  }

  /**
   * @param {!INode} node
   * @returns {number}
   */
  getMinimumHeight(node) {
    return this.headerHeight + node.tag.rows.length * this.rowHeight
  }
}

/**
 * An {@link IPortCandidateProvider} which returns candidates for all existing and free ports.
 */
class ExistingAndFreePortCandidateProvider extends PortCandidateProviderBase {
  /**
   * Creates a new instance.
   * @param {!INode} node The given node.
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns possible source port candidates for edge creation.
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getAllSourcePortCandidates(context) {
    return this.getPortCandidatesFor(context, false)
  }

  /**
   * Returns possible target port candidates for edge creation.
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getAllTargetPortCandidates(context) {
    return this.getPortCandidatesFor(context, true)
  }

  /**
   * Returns possible source port candidates for a newly created edge which starts at target
   * @param {!IInputModeContext} context
   * @param {!IPortCandidate} target
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getSourcePortCandidates(context, target) {
    return this.getPortCandidatesFor(context, false)
  }

  /**
   * Returns possible target port candidates for a newly created edge which starts at source
   * @param {!IInputModeContext} context
   * @param {!IPortCandidate} source
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getTargetPortCandidates(context, source) {
    return this.getPortCandidatesFor(context, true)
  }

  /**
   * Default implementation of the abstract base class. Not used for edge creation.
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getPortCandidates(context) {
    return this.getPortCandidatesFor(context, false)
  }

  /**
   * Returns a list that contains a port candidate for each of the node's
   * ports. Each candidate has the same location as the port. If a port
   * already has a connected edge, its port candidate is marked as invalid.
   * Also, it only returns candidates for in-ports for incoming edges (target port candidates)
   * and out-ports for source port candidates, respectively.
   * @param {!IInputModeContext} context
   * @param {boolean} incoming
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getPortCandidatesFor(context, incoming) {
    const candidates = new List()
    const graph = context.graph

    // Create the candidate for each port
    if (graph) {
      this.node.ports
        .filter((port) => port.tag.incoming === incoming)
        .forEach((port) => {
          const portCandidate = new DefaultPortCandidate(port)
          portCandidate.validity =
            graph.degree(port) === 0 ? PortCandidateValidity.VALID : PortCandidateValidity.INVALID
          candidates.add(portCandidate)
        })
    }

    return candidates
  }
}
