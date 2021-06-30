/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FreeNodePortLocationModel,
  ICanvasContext,
  ILabel,
  ILabelStyle,
  INode,
  IRenderContext,
  LabelStyleBase,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  SimpleEdge,
  SimpleNode,
  SimplePort,
  Size,
  SvgVisual,
  SvgVisualGroup
} from 'yfiles'

/**
 * This class is an example for a custom style based on the {@link LabelStyleBase}.
 * For each label, an edge is created that connects the label to its owner node.
 */
export default class CityLabelStyle extends LabelStyleBase {
  /**
   * Initializes a new instance of CityLabelStyle.
   * @param {!ILabelStyle} innerLabelStyle
   */
  constructor(innerLabelStyle) {
    super()
    this.connectorEdgeStyle = new PolylineEdgeStyle()
    this.ownerPortLocation = FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    this.labelPortLocation = FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    // The style that will be use for the label rendering
    this.innerLabelStyle = innerLabelStyle
  }

  /**
   * Creates the visual for a label to be drawn.
   * @param {!IRenderContext} context The render context
   * @param {!ILabel} label The label to be rendered
   * @returns {!SvgVisualGroup} The visual for a label to be drawn.
   */
  createVisual(context, label) {
    // create a visual group
    const group = new SvgVisualGroup()

    const connectorEdge = this.createConnectorEdge(label)
    const connectorVisual = this.connectorEdgeStyle.renderer
      .getVisualCreator(connectorEdge, this.connectorEdgeStyle)
      .createVisual(context)
    if (connectorVisual) {
      group.add(connectorVisual)
    }

    const labelVisual = this.innerLabelStyle.renderer
      .getVisualCreator(label, this.innerLabelStyle)
      .createVisual(context)
    if (labelVisual) {
      group.add(labelVisual)
    }

    return group
  }

  /**
   * Re-renders the label using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisualGroup} oldVisual The old visual
   * @param {!ILabel} label The label to be rendered
   * @returns {!SvgVisualGroup}
   */
  updateVisual(context, oldVisual, label) {
    // check whether the elements are as expected
    if (oldVisual.children.size !== 2) {
      return this.createVisual(context, label)
    }
    const connectorEdge = this.createConnectorEdge(label)
    const connectorVisual = this.connectorEdgeStyle.renderer
      .getVisualCreator(connectorEdge, this.connectorEdgeStyle)
      .updateVisual(context, oldVisual.children.get(0))
    if (connectorVisual) {
      oldVisual.children.set(0, connectorVisual)
    }

    const labelVisual = this.innerLabelStyle.renderer
      .getVisualCreator(label, this.innerLabelStyle)
      .updateVisual(context, oldVisual.children.get(1))
    if (labelVisual) {
      oldVisual.children.set(1, labelVisual)
    }

    return oldVisual
  }

  /**
   * Creates the edge that connects the label with its owner node.
   * @param {!ILabel} label The given label
   * @returns {!SimpleEdge} The edge that connects the label with its owner node
   */
  createConnectorEdge(label) {
    // create a dummy node at the location of the label
    const labelNodeDummy = new SimpleNode()
    labelNodeDummy.layout = label.layout.bounds
    labelNodeDummy.style = new ShapeNodeStyle()

    const simpleEdge = new SimpleEdge()
    simpleEdge.style = this.connectorEdgeStyle
    simpleEdge.sourcePort = new SimplePort(labelNodeDummy, this.labelPortLocation)
    simpleEdge.targetPort = new SimplePort(label.owner, this.ownerPortLocation)
    return simpleEdge
  }

  /**
   * Returns the preferred size of the given label.
   * @param {!ILabel} label The given label
   * @returns {!Size} The preferred size of the given label
   */
  getPreferredSize(label) {
    return this.innerLabelStyle.renderer.getPreferredSize(label, this.innerLabelStyle)
  }

  /**
   * Determines whether the visualization for the specified label is visible in the context.
   * @param {!ICanvasContext} context The canvas context
   * @param {!Rect} rectangle The clipping rectangle
   * @param {!ILabel} label The given label
   * @returns {boolean} True if the visualization is visible, false otherwise
   */
  isVisible(context, rectangle, label) {
    const isInnerLabelVisible = this.innerLabelStyle.renderer
      .getVisibilityTestable(label, this.innerLabelStyle)
      .isVisible(context, rectangle)
    if (isInnerLabelVisible) {
      return true
    }

    const connectorEdge = this.createConnectorEdge(label)
    const isConnectorEdgeVisible = this.connectorEdgeStyle.renderer
      .getVisibilityTestable(connectorEdge, this.connectorEdgeStyle)
      .isVisible(context, rectangle)
    return isConnectorEdgeVisible
  }
}
