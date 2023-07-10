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
  private connectorEdgeStyle = new PolylineEdgeStyle({ stroke: '#662b00' })
  private ownerPortLocation = FreeNodePortLocationModel.NODE_CENTER_ANCHORED
  private labelPortLocation = FreeNodePortLocationModel.NODE_CENTER_ANCHORED

  /**
   * The style that will be use for the label rendering
   */
  innerLabelStyle: ILabelStyle

  /**
   * Initializes a new instance of CityLabelStyle.
   */
  constructor(innerLabelStyle: ILabelStyle) {
    super()
    this.innerLabelStyle = innerLabelStyle
  }

  /**
   * Creates the visual for a label to be drawn.
   * @param context The render context
   * @param label The label to be rendered
   * @returns The visual for a label to be drawn.
   */
  createVisual(context: IRenderContext, label: ILabel): SvgVisualGroup {
    // create a visual group
    const group = new SvgVisualGroup()

    const connectorEdge = this.createConnectorEdge(label)
    const connectorVisual = this.connectorEdgeStyle.renderer
      .getVisualCreator(connectorEdge, this.connectorEdgeStyle)
      .createVisual(context) as SvgVisual
    if (connectorVisual) {
      group.add(connectorVisual)
    }

    const labelVisual = this.innerLabelStyle.renderer
      .getVisualCreator(label, this.innerLabelStyle)
      .createVisual(context) as SvgVisual
    if (labelVisual) {
      group.add(labelVisual)
    }

    return group
  }

  /**
   * Re-renders the label using the old visual for performance reasons.
   * @param context The render context
   * @param oldVisual The old visual
   * @param label The label to be rendered
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisualGroup, label: ILabel): SvgVisualGroup {
    // check whether the elements are as expected
    if (oldVisual.children.size !== 2) {
      return this.createVisual(context, label)
    }
    const connectorEdge = this.createConnectorEdge(label)
    const connectorVisual = this.connectorEdgeStyle.renderer
      .getVisualCreator(connectorEdge, this.connectorEdgeStyle)
      .updateVisual(context, oldVisual.children.get(0)) as SvgVisual
    if (connectorVisual) {
      oldVisual.children.set(0, connectorVisual)
    }

    const labelVisual = this.innerLabelStyle.renderer
      .getVisualCreator(label, this.innerLabelStyle)
      .updateVisual(context, oldVisual.children.get(1))
    if (labelVisual) {
      oldVisual.children.set(1, labelVisual as SvgVisual)
    }

    return oldVisual
  }

  /**
   * Creates the edge that connects the label with its owner node.
   * @param label The given label
   * @returns The edge that connects the label with its owner node
   */
  createConnectorEdge(label: ILabel): SimpleEdge {
    // create a dummy node at the location of the label
    const labelNodeDummy = new SimpleNode()
    labelNodeDummy.layout = label.layout.bounds
    labelNodeDummy.style = new ShapeNodeStyle()

    const simpleEdge = new SimpleEdge()
    simpleEdge.style = this.connectorEdgeStyle
    simpleEdge.sourcePort = new SimplePort(labelNodeDummy, this.labelPortLocation)
    simpleEdge.targetPort = new SimplePort(label.owner as INode, this.ownerPortLocation)
    return simpleEdge
  }

  /**
   * Returns the preferred size of the given label.
   * @param label The given label
   * @returns The preferred size of the given label
   */
  getPreferredSize(label: ILabel): Size {
    return this.innerLabelStyle.renderer.getPreferredSize(label, this.innerLabelStyle)
  }

  /**
   * Determines whether the visualization for the specified label is visible in the context.
   * @param context The canvas context
   * @param rectangle The clipping rectangle
   * @param label The given label
   * @returns True if the visualization is visible, false otherwise
   */
  isVisible(context: ICanvasContext, rectangle: Rect, label: ILabel): boolean {
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
