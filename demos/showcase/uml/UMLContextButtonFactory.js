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
  Color,
  CssFill,
  Fill,
  FreeNodeLabelModel,
  FreeNodePortLocationModel,
  GraphEditorInputMode,
  INode,
  Point,
  PortCandidate
} from '@yfiles/yfiles'
import {
  createAggregationStyle,
  createAssociationStyle,
  createDependencyStyle,
  createDirectedAssociationStyle,
  createGeneralizationStyle,
  createRealizationStyle
} from './UMLEdgeStyleFactory'
import { ExtensibilityButtonStyle, RelationButtonStyle } from './ButtonStyles'

const DEFAULT_FILL = new CssFill('#607d8b')

export function createExtensibilityButtons(sender, event, style) {
  const graphComponent = sender.graphComponent
  const buttonStyle = new ExtensibilityButtonStyle()
  const buttonSize = buttonStyle.getButtonSize()
  const paramFactory = new FreeNodeLabelModel()
  event.addButton({
    onAction: () => {
      const model = style.model
      const isInterface = model.stereotype === 'interface'
      model.stereotype = isInterface ? '' : 'interface'
      model.constraint = ''
      model.modify()
      style.fill = Fill.from(isInterface ? DEFAULT_FILL : Color.SEA_GREEN)
      graphComponent.invalidate()
    },
    layoutParameter: paramFactory.createParameter({
      layoutRatio: Point.ORIGIN,
      layoutOffset: new Point(0, -5),
      labelRatio: new Point(0, 1),
      labelOffset: Point.ORIGIN
    }),
    size: buttonSize,
    style: buttonStyle,
    tag: style.model,
    text: 'I'
  })
  event.addButton({
    onAction: () => {
      const model = style.model
      const isAbstract = model.constraint === 'abstract'
      model.constraint = isAbstract ? '' : 'abstract'
      model.stereotype = ''
      model.modify()
      style.fill = Fill.from(isAbstract ? DEFAULT_FILL : Color.CRIMSON)
      graphComponent.invalidate()
    },
    layoutParameter: paramFactory.createParameter({
      layoutRatio: Point.ORIGIN,
      layoutOffset: new Point(buttonSize.width + 5, -5),
      labelRatio: new Point(0, 1),
      labelOffset: Point.ORIGIN
    }),
    size: buttonSize,
    style: buttonStyle,
    tag: style.model,
    text: 'A'
  })
}

export function createEdgeCreationButtons(sender, event) {
  const edgeStyles = [
    createRealizationStyle(),
    createGeneralizationStyle(),
    createAggregationStyle(),
    createDependencyStyle(),
    createDirectedAssociationStyle(),
    createAssociationStyle()
  ]

  const paramFactory = new FreeNodeLabelModel()

  let radialStart = 5.235987755982989 // corresponds to 300 degrees
  const radialOffset = 0.6981317007977318 // corresponds to 40 degrees
  for (const style of edgeStyles) {
    const buttonStyle = new RelationButtonStyle(style)
    const buttonSize = buttonStyle.getButtonSize()
    event.addButton({
      onAction: () => {
        const graphComponent = sender.graphComponent
        graphComponent.selection.clear()
        graphComponent.currentItem = null
        const createEdgeInputMode = graphComponent.inputMode.createEdgeInputMode

        // initialize dummy edge
        const umlEdgeType = style
        const previewGraph = createEdgeInputMode.previewGraph
        const previewEdge = createEdgeInputMode.previewEdge
        previewGraph.setStyle(previewEdge, umlEdgeType)
        previewGraph.edgeDefaults.style = umlEdgeType

        // start edge creation and hide buttons until the edge is finished
        createEdgeInputMode.startEdgeCreation(
          new PortCandidate(event.owner, FreeNodePortLocationModel.CENTER)
        )
      },
      layoutParameter: paramFactory.createParameter({
        layoutRatio: new Point(1, 0),
        layoutOffset: rotate(new Point(50, 0), radialStart),
        labelRatio: new Point(0.5, 0.5),
        labelOffset: Point.ORIGIN
      }),
      size: buttonSize,
      style: buttonStyle
    })
    radialStart += radialOffset
  }
}

function rotate(vector, angle1) {
  const angle = angle1
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return new Point(cos * vector.x + sin * vector.y, cos * vector.y - sin * vector.x)
}
