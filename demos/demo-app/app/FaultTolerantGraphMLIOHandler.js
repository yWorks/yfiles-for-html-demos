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
  GraphItemTypes,
  GraphMLIOHandler,
  IEdge,
  INode,
  LabelStyle,
  Mapper,
  SerializationProperties,
  ShapeNodeStyle,
  StripeTypes
} from '@yfiles/yfiles'

/**
 * This GraphML IO Handler can read graphs with unknown styles.
 *
 * First, it reads with default settings. If this fails, reading styles is disabled for the next
 * try.
 */
export class FaultTolerantGraphMLIOHandler extends GraphMLIOHandler {
  onRetry = null

  async readFromDocument(graph, document) {
    return this.retry(() => super.readFromDocument(graph, document))
  }

  async readFromURL(graph, url) {
    return this.retry(() => super.readFromURL(graph, url))
  }

  async retry(read) {
    try {
      // try with styles enabled
      return await read()
    } catch (err) {
      if (!(err instanceof Error) || err.message == null) {
        throw err
      }
      if (typeof this.onRetry === 'function') {
        this.onRetry(err)
      }

      // retry with styles disabled
      this.deserializationPropertyOverrides.set(
        SerializationProperties.DISABLE_STYLES,
        GraphItemTypes.ALL
      )
      this.deserializationPropertyOverrides.set(
        SerializationProperties.DISABLE_STRIPE_STYLES,
        StripeTypes.ALL
      )
      this.deserializationPropertyOverrides.set(
        SerializationProperties.DISABLE_GEOMETRY,
        GraphItemTypes.PORT | GraphItemTypes.LABEL
      )
      this.deserializationPropertyOverrides.set(
        SerializationProperties.IGNORE_XAML_DESERIALIZATION_ERRORS,
        true
      )
      const graph = await read()

      // re-enable styles
      this.deserializationPropertyOverrides.set(
        SerializationProperties.DISABLE_STYLES,
        GraphItemTypes.NONE
      )
      this.deserializationPropertyOverrides.set(
        SerializationProperties.DISABLE_STRIPE_STYLES,
        StripeTypes.NONE
      )
      this.deserializationPropertyOverrides.set(
        SerializationProperties.DISABLE_GEOMETRY,
        GraphItemTypes.NONE
      )
      this.deserializationPropertyOverrides.set(
        SerializationProperties.IGNORE_XAML_DESERIALIZATION_ERRORS,
        false
      )

      return graph
    }
  }
}

/**
 * Creates a preconfigured GraphMLIOHandler that supports all styles that are used in this demo.
 */
export function createConfiguredGraphMLIOHandler(graphComponent) {
  const graphMLIOHandler = new FaultTolerantGraphMLIOHandler()
  if (graphComponent) {
    const selectedEdges = new Mapper()
    const selectedNodes = new Mapper()

    // read selection state for edges ...
    graphMLIOHandler.addInputMapper(IEdge, Boolean, 'SelectedEdges', selectedEdges)
    // ... and nodes.
    graphMLIOHandler.addInputMapper(INode, Boolean, 'SelectedNodes', selectedNodes)

    // set selection state for edges and nodes once parsing is finished
    graphMLIOHandler.addEventListener('parsed', () => {
      const selection = graphComponent.selection
      selection.clear()

      const graph = graphComponent.graph
      for (const node of graph.nodes) {
        if (selectedNodes.get(node)) {
          selection.add(node)
        }
      }
      for (const edge of graph.edges) {
        if (selectedEdges.get(edge)) {
          selection.add(edge)
        }
      }
    })
  }

  // ignore or replace some unknown bpmn styles to avoid exceptions
  graphMLIOHandler.addEventListener('handle-deserialization', (evt) => {
    if (evt.xmlNode instanceof Element) {
      const element = evt.xmlNode
      if (
        element.localName === 'Label' &&
        element.hasAttribute('LayoutParameter') &&
        element.getAttribute('LayoutParameter').toString().includes('PoolHeaderLabelModel')
      ) {
        evt.result = null
      } else if (element.localName === 'PoolNodeStyle') {
        evt.result = new ShapeNodeStyle()
      } else if (element.localName === 'AnnotationLabelStyle') {
        evt.result = new LabelStyle()
      }
    }
  })

  return graphMLIOHandler
}
