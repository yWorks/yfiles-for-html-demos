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
  FreeNodePortLocationModel,
  GraphComponent,
  IGraph,
  INode,
  Point,
  SimpleNode
} from '@yfiles/yfiles'
import { type FlowNodePortProperties } from './FlowNodePort'
import { FlowNodePortStyle } from './FlowNodePortStyle'
import { FlowNodeStyle } from './FlowNodeStyle'
import { flowNodeProperties } from './flowNodeProperties'

export const flowNodeVariants = [
  'storageWriteFile',
  'storageReadFile',
  'parserCsv',
  'parserJson',
  'parserXml',
  'sequenceSort',
  'sequenceJoin',
  'networkTcpIn',
  'networkTcpOut',
  'networkTcpRequest',
  'functionFunction',
  'functionDelay',
  'functionFilter',
  'commonComment',
  'commonLinkIn',
  'commonLinkOut',
  'commonLinkCall',
  'commonStatus'
]
export type FlowNodeVariant = (typeof flowNodeVariants)[number]
export type FlowNodeValidation = {
  invalidProperties: Array<string>
  validationMessages: Array<string>
}
export type FlowNodeValidationFn = (args: FlowNodeProperties) => FlowNodeValidation

export type FlowNodeProperties = {
  readonly variant: FlowNodeVariant
  label: string
  hasLeftPort: boolean
  hasRightPort: boolean
  validate?: FlowNodeValidationFn
  [key: string]: string | number | boolean | undefined | Array<unknown> | FlowNodeValidationFn
}

export type FlowNode = Omit<INode, 'tag'> & { tag: FlowNodeProperties }

type FlowNodeInGraphOptions = {
  variant: FlowNodeVariant
  position: Point
  graph: IGraph
}

/**
 * Properties that should never appear in the tag editor
 */
export let hiddenProperties: Array<keyof FlowNodeProperties> = [
  'hasLeftPort',
  'hasRightPort',
  'validate'
]
export let lockedProperties: Array<keyof FlowNodeProperties> = ['variant']

const portStyle = new FlowNodePortStyle()

/**
 * Modifies node-related graph configuration.
 */
export function configureFlowNodes({ graph, selection }: GraphComponent): void {
  graph.decorator.nodes.focusRenderer.hide()
  graph.decorator.nodes.highlightRenderer.hide()
  graph.decorator.nodes.selectionRenderer.hide()

  // When a new node appears in the graph, its ports are added automatically. This is done
  // in reaction to `NodeCreated` event so that nodes added from the DnD palette, which doesn't
  // handle nodes with ports correctly, end up having their ports properly configured as soon as
  // they're dropped onto the main graph.
  graph.addEventListener('node-created', (event) => {
    const node = event.item
    if (!isFlowNode(node)) {
      return
    }
    const { hasLeftPort, hasRightPort } = node.tag
    if (node.ports.size === 0) {
      hasLeftPort &&
        graph.addPort({
          owner: node,
          style: portStyle,
          locationParameter: FreeNodePortLocationModel.LEFT,
          tag: {
            side: 'left'
          } as FlowNodePortProperties
        })
      hasRightPort &&
        graph.addPort({
          owner: node,
          style: portStyle,
          locationParameter: FreeNodePortLocationModel.RIGHT,
          tag: {
            side: 'right'
          } as FlowNodePortProperties
        })
    }
    const label = node.tag.label
    const duplicateLabelNodes = graph.nodes.filter((node) => node.tag.label.startsWith(label))
    if (!!label && duplicateLabelNodes.size > 1) {
      const lastLabelNumber = duplicateLabelNodes
        .toArray()
        .map((node) => node.tag.label.split('#')[1] || '0')
        .map((value) => Number.parseInt(value))
        .sort((a, b) => b - a)[0]
      node.tag = { ...node.tag, label: label + ` #${lastLabelNumber + 1}` }
    }

    selection.clear()
    selection.add(node)
  })
}

/**
 * Creates a FlowNode and adds it to the graph at the specified position.
 * Ports will be added automatically on node creation.
 */
export function createInGraph({ variant, position, graph }: FlowNodeInGraphOptions): FlowNode {
  const properties = { ...flowNodeProperties[variant] }
  return graph.createNode({
    style: new FlowNodeStyle(),
    layout: {
      width: FlowNodeStyle.defaultWidth,
      height: FlowNodeStyle.defaultHeight,
      x: position.x,
      y: position.y
    },
    tag: properties
  })
}

/**
 * Creates a graph-less FlowNode without ports (but dummy port visuals will still be rendered
 * as part of the node visual).
 */
export function createFlowNode(variant: FlowNodeVariant): FlowNode {
  const properties = { ...flowNodeProperties[variant] }
  return new SimpleNode({
    style: new FlowNodeStyle(),
    layout: {
      width: FlowNodeStyle.defaultWidth,
      height: FlowNodeStyle.defaultHeight,
      x: 0,
      y: 0
    },
    tag: properties
  })
}

export function assertIsFlowNode(node: unknown): asserts node is FlowNode {
  if (!isFlowNode(node)) {
    throw new Error('Node not satisfy type FlowNode')
  }
}

export function isFlowNode(node: unknown): node is FlowNode {
  if (!(node instanceof INode)) {
    return false
  }
  return validateNodeTag(node.tag)
}

export function validateNodeTag(tag: unknown): tag is FlowNodeProperties {
  return (
    typeof tag === 'object' &&
    tag !== null &&
    flowNodeVariants.includes((<FlowNodeProperties>tag).variant)
  )
}
