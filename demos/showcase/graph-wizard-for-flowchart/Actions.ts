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
  CssFill,
  type Fill,
  FreeNodePortLocationModel,
  GivenCoordinatesLayout,
  GivenCoordinatesLayoutData,
  IEdge,
  type ILabelOwner,
  type ILayoutAlgorithm,
  INode,
  type INodeStyle,
  KeyEventArgs,
  type LabelStyle,
  LayoutAnchoringPolicy,
  LayoutAnchoringStage,
  LayoutAnchoringStageData,
  type LayoutData,
  LayoutExecutor,
  Mapper,
  ModifierKeys,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  PortCandidate,
  Rect,
  Size
} from '@yfiles/yfiles'
import type { ButtonOptions } from './WizardAction'
import { WizardAction } from './WizardAction'
import type { PreCondition } from './Preconditions'
import {
  checkAnd,
  checkCreatingEdge,
  checkForEdge,
  checkForNode,
  checkNotCreatingEdge,
  checkOr
} from './Preconditions'
import type { ColorSet } from './ColorThemes'

import { type GraphWizardInputMode, WizardEventArgs } from './GraphWizardInputMode'

/**
 * Creates a {@link WizardAction} that navigates to the next {@INode node} in the direction of
 * the pressed arrow key.
 */
export function createSmartNavigate(): WizardAction {
  return new WizardAction(
    'navigate',
    () => true,
    (mode, item, type, args) => {
      const graph = mode.graph
      const key = (args as KeyEventArgs).key

      let target = null
      if (item instanceof IEdge) {
        const edge = item
        const center = edge.style.renderer
          .getBoundsProvider(item, item.style)
          .getBounds(mode.graphComponent.inputModeContext)
        const dxSource = edge.sourceNode.layout.center.x - center.x
        const dySource = edge.sourceNode.layout.center.y - center.y
        const dxTarget = edge.targetNode.layout.center.x - center.x
        const dyTarget = edge.targetNode.layout.center.y - center.y
        switch (key) {
          case 'ArrowDown':
            target = dySource < dyTarget ? edge.targetNode : edge.sourceNode
            break
          case 'ArrowLeft':
            target = dxSource > dxTarget ? edge.targetNode : edge.sourceNode
            break
          case 'ArrowUp':
            target = dySource > dyTarget ? edge.targetNode : edge.sourceNode
            break
          case 'ArrowRight':
            target = dxSource < dxTarget ? edge.targetNode : edge.sourceNode
            break
        }
      } else if (item instanceof INode) {
        const center = item.layout.center
        const condition = function (dx: number, dy: number) {
          switch (key) {
            case 'ArrowDown':
              return dy < 0 && Math.abs(dy) >= Math.abs(dx)
            case 'ArrowUp':
              return dy > 0 && Math.abs(dy) >= Math.abs(dx)
            case 'ArrowLeft':
              return dx > 0 && Math.abs(dx) >= Math.abs(dy)
            case 'ArrowRight':
            default:
              return dx < 0 && Math.abs(dx) >= Math.abs(dy)
          }
        }

        const condition2 = function (dx: number, dy: number) {
          switch (key) {
            case 'ArrowDown':
              return dy < 0
            case 'ArrowUp':
              return dy > 0
            case 'ArrowLeft':
              return dx > 0
            case 'ArrowRight':
            default:
              return dx < 0
          }
        }

        // check for connected hits in 90°
        let children = graph
          .outEdgesAt(item)
          .map((edge) => edge.targetNode)
          .concat(graph.inEdgesAt(item).map((edge) => edge.sourceNode))
          .filter((child) => {
            const childCenter = child.layout.center
            const dx = center.x - childCenter.x
            const dy = center.y - childCenter.y
            return condition(dx, dy)
          })
          .toArray()

        // check for unconnected hits in 90°
        if (children.length === 0) {
          children = graph.nodes
            .filter((child) => {
              const childCenter = child.layout.center
              const dx = center.x - childCenter.x
              const dy = center.y - childCenter.y
              return condition(dx, dy)
            })
            .toArray()
        }

        // check for connected hits in general direction
        if (children.length === 0) {
          children = graph
            .outEdgesAt(item)
            .map((edge) => edge.targetNode)
            .concat(graph.inEdgesAt(item).map((edge) => edge.sourceNode))
            .filter((child) => {
              const childCenter = child.layout.center
              const dx = center.x - childCenter.x
              const dy = center.y - childCenter.y
              return condition2(dx, dy)
            })
            .toArray()
        }

        // check for unconnected hits in general direction
        if (children.length === 0) {
          children = graph.nodes
            .filter((child) => {
              const childCenter = child.layout.center
              const dx = center.x - childCenter.x
              const dy = center.y - childCenter.y
              return condition2(dx, dy)
            })
            .toArray()
        }

        const childScores = children.map((child) => {
          const childCenter = child.layout.center
          const dx = Math.abs(center.x - childCenter.x)
          const dy = Math.abs(center.y - childCenter.y)

          let angle = 0
          switch (key) {
            case 'ArrowDown':
            case 'ArrowUp':
              angle = Math.atan2(dx, dy) + 1
              return angle * dy
            case 'ArrowLeft':
            case 'ArrowRight':
            default:
              angle = Math.atan2(dy, dx) + 1
              return angle * dx
          }
        })
        let lowestScore = Number.POSITIVE_INFINITY
        children.forEach((node, index) => {
          if (childScores[index] < lowestScore) {
            lowestScore = childScores[index]
            target = node
          }
        })
      } else {
        // no current item => select the one closest to the center of the viewport
        const center = mode.graphComponent.viewport.center
        target = mode.graph.nodes
          .toSorted((a, b) =>
            Math.sign(center.distanceTo(a.layout.center) - center.distanceTo(b.layout.center))
          )
          .at(0)
      }
      if (target) {
        mode.graphComponent.currentItem = target
        if (mode.createEdgeMode.isCreationInProgress) {
          mode.createEdgeMode.endPortCandidate = new PortCandidate(target)
        }
      }
    },
    [
      { key: 'ArrowDown', modifier: ModifierKeys.NONE },
      { key: 'ArrowUp', modifier: ModifierKeys.NONE },
      { key: 'ArrowLeft', modifier: ModifierKeys.NONE },
      { key: 'ArrowRight', modifier: ModifierKeys.NONE }
    ],
    'Navigate between the nodes',
    null,
    null,
    true
  )
}

/**
 * Creates a {@link WizardAction} that navigates to the next incoming or outgoing edge relative to the
 * {@link GraphWizardInputMode.currentItem current item}.
 * @param direction Whether the next outgoing or incoming edge should be navigated to.
 */
export function createSmartNavigateEdge(direction: 'NextOutgoing' | 'NextIncoming'): WizardAction {
  return new WizardAction(
    'NavigateEdge',
    checkOr([
      checkForEdge,
      checkAnd([
        checkForNode,
        (mode) => {
          const item = mode.currentItem as INode
          return (
            (direction === 'NextOutgoing' && mode.graph.outDegree(item) > 0) ||
            (direction === 'NextIncoming' && mode.graph.inDegree(item) > 0)
          )
        }
      ])
    ]),
    (mode, item, type, args) => {
      let target = null
      if (item instanceof IEdge) {
        let node = null
        let index = -1
        switch (direction) {
          case 'NextOutgoing': {
            node = item.sourceNode
            const outEdges = mode.graph.outEdgesAt(node)
            index = outEdges.toList().indexOf(item)
            target = outEdges.get((index + 1) % outEdges.size)
            break
          }
          case 'NextIncoming': {
            node = item.targetNode
            const inEdges = mode.graph.inEdgesAt(node)
            index = inEdges.toList().indexOf(item)
            target = inEdges.get((index + 1) % inEdges.size)
            break
          }
        }
      } else if (item instanceof INode) {
        switch (direction) {
          case 'NextOutgoing':
            target = mode.graph.outEdgesAt(item).at(0)
            break
          case 'NextIncoming':
            target = mode.graph.inEdgesAt(item).at(0)
            break
        }
      }
      if (target) {
        mode.graphComponent.currentItem = target
        if (mode.createEdgeMode.isCreationInProgress) {
          mode.createEdgeMode.endPortCandidate = new PortCandidate(target)
        }
      }
    },
    [
      {
        key: direction === 'NextIncoming' ? 'ArrowDown' : 'ArrowUp',
        modifier: ModifierKeys.CONTROL
      }
    ],
    direction === 'NextOutgoing'
      ? 'Switch between outgoing edges'
      : 'Switch between incoming edges',
    null,
    null,
    true
  )
}

/**
 * Creates a {@link WizardAction} that starts label editing when `F2` or `F6+CTRL` is pressed.
 */
export function createEditLabel(): WizardAction {
  const buttonType = 'edit-label-button'

  return new WizardAction(
    buttonType,
    checkAnd([checkNotCreatingEdge, checkOr([checkForNode, checkForEdge])]),
    async (inputMode: GraphWizardInputMode, item, type, args) => {
      const geim = inputMode.graphEditorInputMode
      const labelOwner = item as ILabelOwner
      const editPromise =
        labelOwner.labels.size === 0
          ? geim.editLabelInputMode.startLabelAddition(labelOwner)
          : geim.editLabelInputMode.startLabelEditing(labelOwner.labels.first()!)
      const editedLabel = await editPromise
      if (editedLabel) {
        inputMode.graphComponent.currentItem = item
      }
      return editedLabel != null
    },
    [{ key: 'F2' }, { key: 'F6', modifier: ModifierKeys.CONTROL }],
    '<br/><br/>Edit the label',
    {
      type: buttonType,
      tooltip: 'Edit the label',
      style: { type: 'icon', iconPath: 'resources/icons/edit.svg' }
    }
  )
}

/**
 * Creates a {@link WizardAction} that changes the {@link ColorSet} of the
 * {@link GraphWizardInputMode.currentItem current node}.
 *
 * @param preCondition The pre-condition checking if the color set may be changed for the current item.
 * @param colorTheme The {@link ColorSet color sets} to choose from.
 * @param getItemFill A callback returning the fill of the current node.
 * @param setStyleColors A callback setting the fill and outline color to the given style.
 */
export function createChangeNodeColorSet(
  preCondition: PreCondition,
  colorTheme: ColorSet[],
  getItemFill: (node: INode) => Fill,
  setStyleColors: (style: INodeStyle, fill: string, outline: string) => void
): WizardAction {
  const pickerButtons: ButtonOptions[] = []
  for (let i = 0; i < colorTheme.length; i++) {
    pickerButtons.push({
      type: String(i),
      style: { type: 'rect', fill: colorTheme[i].fill, outline: colorTheme[i].outline }
    })
  }
  const itemToColorSetIndex = (node: INode) => {
    const fill = getItemFill(node)
    if (fill instanceof CssFill) {
      return colorTheme.findIndex((colorSet) => colorSet.fill === fill.value)
    }
    return 0
  }

  return new WizardAction(
    'changeColorSet',
    preCondition,
    (mode, item, type, args) => {
      const currentItem = item as INode
      let colorSetIndex = parseInt(type)
      if (Number.isNaN(colorSetIndex)) {
        colorSetIndex = itemToColorSetIndex(currentItem)
      }
      let colorSet = colorTheme[colorSetIndex]
      if (args instanceof KeyEventArgs) {
        // switch to next theme color
        const nextSetIndex = (colorSetIndex + 1) % colorTheme.length
        colorSet = colorTheme[nextSetIndex]
      }
      const nodeStyle = currentItem.style.clone()
      setStyleColors(nodeStyle, colorSet.fill, colorSet.outline)
      mode.graph.setStyle(currentItem, nodeStyle)
      currentItem.labels.forEach((label) => {
        const style = label.style.clone() as LabelStyle
        style.textFill = colorSet.labelText
        style.backgroundFill = colorSet.labelFill
        mode.graph.setStyle(label, style)
      })
      mode.graphComponent!.updateVisual()
    },
    [{ key: 'c' }],
    'Change the node color',
    {
      typeFactory: (item) => String(itemToColorSetIndex(item as INode)),
      styleFactory: (item) => {
        const colorSet = colorTheme[itemToColorSetIndex(item as INode)]
        return { type: 'rect', fill: colorSet.fill, outline: colorSet.outline }
      },
      tooltip: 'Change the node color',
      pickerButtons: pickerButtons
    }
  )
}

/**
 * Creates a {@link WizardAction} that starts interactive edge creation.
 * @param helpText An optional help text replacing the default one.
 * @param buttonOptions Optional {@link ButtonOptions} replacing the default ones.
 */
export function createStartEdgeCreation(
  helpText?: string,
  buttonOptions?: ButtonOptions
): WizardAction {
  return new WizardAction(
    'startEdgeCreation',
    checkAnd([checkNotCreatingEdge, checkForNode, (mode) => mode.graph.nodes.size > 1]),
    (mode, item) => {
      mode.createEdgeMode.startEdgeCreation(
        new PortCandidate(item as INode, FreeNodePortLocationModel.CENTER),
        (item as INode).layout.center
      )
    },
    [{ key: 'r' }],
    helpText || 'Create a cross reference',
    buttonOptions || {
      type: 'add-non-tree-edge-button',
      style: { type: 'icon', iconPath: 'resources/icons/add-non-tree-edge.svg' },
      tooltip: helpText || 'Create a cross reference'
    },
    null,
    true
  )
}

/**
 * Creates a {@link WizardAction} that ends an interactive edge creation gesture.
 */
export function createEndEdgeCreation(
  layoutProvider?: () => ILayoutAlgorithm,
  layoutDataProvider?: () => LayoutData
): WizardAction {
  return new WizardAction(
    'endEdgeCreation',
    checkAnd([checkCreatingEdge]),
    async (mode, item, type, evt) => {
      const wizEvent = evt as WizardEventArgs
      if (wizEvent.type == 'edge-canceled') {
        return false
      } else {
        if (layoutProvider && layoutDataProvider) {
          await runLayout(mode, layoutProvider(), layoutDataProvider())
        }
        mode.graphComponent.currentItem = mode.graph.edges.last()?.targetNode ?? null
        return true
      }
    },
    [{ key: 'Enter' }],
    'Set edge target',
    undefined,
    (data, args) => args instanceof WizardEventArgs
  )
}

/**
 * Runs an animated layout calculation that considers newly added and removed nodes and keeps the
 * location of fixed nodes.
 * @param mode The current {@link GraphWizardInputMode}.
 * @param layout The base layout to apply.
 * @param layoutData The layout data for the base layout.
 * @param fixNodes The nodes whose location shall kept fixed.
 * @param newNodes The newly created nodes.
 * @param deletedNodes The deleted nodes.
 */
export function runLayout(
  mode: GraphWizardInputMode,
  layout: ILayoutAlgorithm,
  layoutData: LayoutData,
  fixNodes?: INode[],
  newNodes?: INode[],
  deletedNodes?: INode[]
): Promise<void> {
  const oldNodeSizes = new Mapper<INode, Size>()
  if (newNodes) {
    const graph = mode.graph
    newNodes.forEach((node) => {
      oldNodeSizes.set(node, node.layout.toSize())
      graph.setNodeLayout(node, new Rect(node.layout.center, Size.ZERO))
    })
  }
  const allLayouts = new LayoutAnchoringStage(
    new PlaceNodesAtBarycenterStage(new GivenCoordinatesLayout(layout))
  )
  const fixNodesSet = new Set(fixNodes)
  const allLayoutData = layoutData
    .combineWith(
      new LayoutAnchoringStageData({
        nodeAnchoringPolicies: (node) =>
          fixNodesSet.has(node) ? LayoutAnchoringPolicy.CENTER : LayoutAnchoringPolicy.NONE
      })
    )
    .combineWith(new PlaceNodesAtBarycenterStageData({ affectedNodes: deletedNodes }))
    .combineWith(new GivenCoordinatesLayoutData({ nodeSizes: oldNodeSizes }))
  return new LayoutExecutor({
    layout: allLayouts,
    layoutData: allLayoutData,
    animationDuration: 200,
    animateViewport: false,
    easedAnimation: true,
    graphComponent: mode.graphComponent
  }).start()
}
