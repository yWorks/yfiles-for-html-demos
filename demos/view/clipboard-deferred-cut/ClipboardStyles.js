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
  EdgeStyleBase,
  GeneralPath,
  GraphComponent,
  IEdge,
  IEdgeStyle,
  IGraph,
  ILabel,
  ILabelStyle,
  IModelItem,
  INode,
  INodeStyle,
  IRenderContext,
  LabelStyleBase,
  NodeStyleBase,
  Size,
  SvgVisual,
  Visual
} from 'yfiles'
import { DeferredCutClipboard } from './DeferredCutClipboard.js'

/**
 * A special node style wrapper which renders the wrapped style transparent
 * if the node is marked as "to be cut" in the {@link DeferredCutClipboard}.
 */
export class ClipboardNodeStyle extends NodeStyleBase {
  _wrapped

  /**
   * Wrap the given node style.
   * @param {!INodeStyle} wrapped
   */
  constructor(wrapped) {
    super()
    this._wrapped = wrapped
  }

  /**
   * Create the visual which visualizes the given node:
   * create the visual of the wrapped style and make it transparent
   * if the node is marked as "to be cut".
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {?Visual}
   */
  createVisual(context, node) {
    const visual = this._wrapped.renderer
      .getVisualCreator(node, this._wrapped)
      .createVisual(context)
    setOpacity(context, visual, node)
    return visual
  }

  /**
   * Update the visual which visualizes the given node:
   * update the visual of the wrapped style and make it transparent
   * if the node is marked as "to be cut".
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @param {!INode} node
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual, node) {
    const visual = this._wrapped.renderer
      .getVisualCreator(node, this._wrapped)
      .updateVisual(context, oldVisual)
    setOpacity(context, visual, node)
    return visual
  }
}

/**
 * A special edge style wrapper which renders the wrapped style transparent
 * if the edge is marked as "to be cut" in the {@link DeferredCutClipboard}.
 */
export class ClipboardEdgeStyle extends EdgeStyleBase {
  _wrapped

  /**
   * Wraps the given style.
   * @param {!IEdgeStyle} wrapped
   */
  constructor(wrapped) {
    super()
    this._wrapped = wrapped
  }

  /**
   * Create the visual which visualizes the given edge:
   * create the visual of the wrapped style and make it transparent
   * if the edge is marked as "to be cut".
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @returns {?Visual}
   */
  createVisual(context, edge) {
    const visual = this._wrapped.renderer
      .getVisualCreator(edge, this._wrapped)
      .createVisual(context)
    setOpacity(context, visual, edge)
    return visual
  }

  /**
   * Update the visual which visualizes the given edge:
   * update the visual of the wrapped style and make it transparent
   * if the edge is marked as "to be cut".
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @param {!IEdge} edge
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual, edge) {
    const visual = this._wrapped.renderer
      .getVisualCreator(edge, this._wrapped)
      .updateVisual(context, oldVisual)
    setOpacity(context, visual, edge)
    return visual
  }

  /**
   * Delegates to the wrapped style.
   * @param {!IEdge} edge
   * @returns {?GeneralPath}
   */
  getPath(edge) {
    return this._wrapped.renderer.getPathGeometry(edge, this._wrapped).getPath()
  }
}

/**
 * A special label style wrapper which renders the wrapped style transparent
 * if the label is marked as "to be cut" in the {@link DeferredCutClipboard}.
 */
export class ClipboardLabelStyle extends LabelStyleBase {
  _wrapped

  /**
   * Wraps the given style.
   * @param {!ILabelStyle} wrapped
   */
  constructor(wrapped) {
    super()
    this._wrapped = wrapped
  }

  /**
   * Creates the visual which visualizes the given label:
   * creates the visual of the wrapped style and make it transparent
   * if the label is marked as "to be cut".
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {?Visual}
   */
  createVisual(context, label) {
    const visual = this._wrapped.renderer
      .getVisualCreator(label, this._wrapped)
      .createVisual(context)
    setOpacity(context, visual, label)
    return visual
  }

  /**
   * Updates the visual which visualizes the given label:
   * updates the visual of the wrapped style and make it transparent
   * if the label is marked as "to be cut".
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @param {!ILabel} label
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual, label) {
    const visual = this._wrapped.renderer
      .getVisualCreator(label, this._wrapped)
      .updateVisual(context, oldVisual)
    setOpacity(context, visual, label)
    return visual
  }

  /**
   * Delegates to the wrapped style.
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    return this._wrapped.renderer.getPreferredSize(label, this._wrapped)
  }
}

/**
 * Sets the opacity on the SVG element of the given visual.
 * Elements which are marked as "to be cut" are rendered transparent.
 * @param {!IRenderContext} context The render context.
 * @param {?Visual} visual The visual whose opacity is to be set.
 * @param {!IModelItem} item The item which is represented by the visual
 */
function setOpacity(context, visual, item) {
  const clipboard = context.canvasComponent.clipboard
  if (visual instanceof SvgVisual && clipboard instanceof DeferredCutClipboard) {
    // if the visual is an SvgVisual and the clipboard is a DeferredCutClipboard
    // the item's SVG element will be rendered transparent if the item
    // is marked as to be cut
    const toBeCut = clipboard.isToBeCut(item)
    visual.svgElement.style.setProperty('opacity', toBeCut ? '0.3' : '1')
  }
}

/**
 * Create some default styles and wrap them into
 * a style wrapper which indicates whether the item is cut.
 * @param {!IGraph} graph
 */
export function setClipboardStyles(graph) {
  graph.nodeDefaults.style = new ClipboardNodeStyle(graph.nodeDefaults.style)
  graph.edgeDefaults.labels.style = new ClipboardLabelStyle(graph.edgeDefaults.labels.style)
  graph.edgeDefaults.style = new ClipboardEdgeStyle(graph.edgeDefaults.style)
  graph.nodeDefaults.labels.style = new ClipboardLabelStyle(graph.nodeDefaults.labels.style)
}
