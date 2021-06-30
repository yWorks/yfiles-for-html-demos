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
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLParser,
  IEdge,
  IGraph,
  INode,
  Mapper,
  SerializationProperties,
  StripeTypes,
  YBoolean
} from 'yfiles'
import DemoStyles, { DemoSerializationListener } from '../../resources/demo-styles'

/**
 * This GraphML IO Handler can read graphs with unknown styles.
 *
 * First, it reads with default settings. If this fails, reading styles is disabled for the next
 * try.
 */
class FaultTolerantGraphMLIOHandler extends GraphMLIOHandler {
  private disableStyles = false
  private onRetry: ((e: Error) => void) | null = null

  configureGraphMLParser(parser: GraphMLParser, graph: IGraph): void {
    super.configureGraphMLParser(parser, graph)
    parser.setDeserializationProperty(
      SerializationProperties.DISABLE_STYLES,
      this.disableStyles ? GraphItemTypes.ALL : GraphItemTypes.NONE
    )
    parser.setDeserializationProperty(
      SerializationProperties.DISABLE_STRIPE_STYLES,
      this.disableStyles ? StripeTypes.ALL : StripeTypes.NONE
    )
  }

  async readFromDocument(graph: IGraph, document: Document): Promise<IGraph> {
    return this.retry(() => super.readFromDocument(graph, document))
  }

  async readFromURL(graph: IGraph, url: string): Promise<IGraph> {
    return this.retry(() => super.readFromURL(graph, url))
  }

  async retry(read: () => Promise<IGraph>): Promise<IGraph> {
    try {
      this.disableStyles = false
      return await read()
    } catch (err) {
      if (
        !(err instanceof Error) ||
        err.message == null ||
        err.message.indexOf('Unable to map XML element') === -1
      ) {
        throw err
      }
      if (typeof this.onRetry === 'function') {
        this.onRetry(err)
      }

      // retry with styles disabled
      this.disableStyles = true
      return await read()
    }
  }
}

/**
 * Creates a preconfigured GraphMLIOHandler that supports all styles that are used in this demo.
 */
export function createConfiguredGraphMLIOHandler(
  graphComponent?: GraphComponent
): GraphMLIOHandler {
  const graphMLIOHandler = new FaultTolerantGraphMLIOHandler()
  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)

  if (graphComponent) {
    const selectedEdges = new Mapper()
    const selectedNodes = new Mapper()

    // read selection state for edges ...
    graphMLIOHandler.addInputMapper(IEdge.$class, YBoolean.$class, 'SelectedEdges', selectedEdges)
    // ... and nodes.
    graphMLIOHandler.addInputMapper(INode.$class, YBoolean.$class, 'SelectedNodes', selectedNodes)

    // set selection state for edges and nodes once parsing is finished
    graphMLIOHandler.addParsedListener((sender, args) => {
      const selection = graphComponent.selection
      selection.clear()

      const graph = graphComponent.graph
      for (const node of graph.nodes) {
        if (selectedNodes.get(node)) {
          selection.setSelected(node, true)
        }
      }
      for (const edge of graph.edges) {
        if (selectedEdges.get(edge)) {
          selection.setSelected(edge, true)
        }
      }
    })
  }

  return graphMLIOHandler
}
