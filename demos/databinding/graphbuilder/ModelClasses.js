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
/**
 * Non-UI model classes for the graph builder demo
 */

import { Arrow, PolylineEdgeStyle } from '@yfiles/yfiles'

import { LitNodeStyle } from '@yfiles/demo-utils/LitNodeStyle'
import { nothing, svg } from 'lit-html'

/**
 * Abstract base class for node and edge source definitions
 */
export class SourceDefinition {}

/**
 * Defines a node source consisting of data and bindings
 */
export class NodesSourceDefinition extends SourceDefinition {
  name
  data
  idBinding
  template

  constructor() {
    super()
    this.name = ''
    this.data = ''
    this.idBinding = ''
    this.template = ''
  }
}

/**
 * Defines an edge source consisting of data and bindings
 */
export class EdgesSourceDefinition extends SourceDefinition {
  name
  data
  sourceBinding
  targetBinding
  labelBinding
  strokeBinding
  sourceProvider
  targetProvider
  labelTextProvider
  strokeProvider

  constructor() {
    super()
    this.name = ''
    this.data = ''
    this.sourceBinding = ''
    this.targetBinding = ''
    this.labelBinding = ''
    this.strokeBinding = ''
  }
}

/**
 * Abstract base class for a SourceDefinition to GraphBuilder connector
 */
export class SourceDefinitionBuilderConnector {}

/**
 * Connector for {@link NodesSource}s and {@link NodesSourceDefinition}s
 */
export class NodesSourceDefinitionBuilderConnector extends SourceDefinitionBuilderConnector {
  sourceDefinition
  nodesSource
  graphBuilder

  /**
   * @param nodesSourceDefinition the {@link NodesSourceDefinition} to connect
   * @param nodesSource the {@link NodesSource} to connect
   * @param graphBuilder the {@link GraphBuilder} to set the updated data to
   */
  constructor(nodesSourceDefinition, nodesSource, graphBuilder) {
    super()
    this.sourceDefinition = nodesSourceDefinition
    this.nodesSource = nodesSource
    this.graphBuilder = graphBuilder
  }

  /**
   * Updates/sets the sources' bindings and new data content
   */
  applyDefinition() {
    if (this.sourceDefinition.idBinding) {
      this.nodesSource.idProvider = createBinding(this.sourceDefinition.idBinding)
    } else {
      this.nodesSource.idProvider = null
    }
    try {
      this.nodesSource.nodeCreator.defaults.style = new LitNodeStyle(
        this.createRenderFunction(this.sourceDefinition.template)
      )
    } catch (e) {
      throw new Error(`Evaluating the template failed: ${e}`)
    }
    this.graphBuilder.setData(this.nodesSource, parseData(this.sourceDefinition.data))
  }

  createRenderFunction(template) {
    return new Function(
      'const svg = arguments[0]; const nothing = arguments[1]; const renderFunction = ' +
        '({layout, tag, selected, zoom}) => svg`\n' +
        template +
        '`' +
        '\n return renderFunction'
    )(svg, nothing)
  }

  reset() {
    this.sourceDefinition.data = ''
    this.applyDefinition()
  }
}

/**
 * Connector for {@link EdgesSource}s and {@link EdgesSourceDefinition}s
 */
export class EdgesSourceDefinitionBuilderConnector extends SourceDefinitionBuilderConnector {
  sourceDefinition
  edgesSource
  graphBuilder

  /**
   * @param edgesSourceDefinition the {@link EdgesSourceDefinition} to connect
   * @param edgesSource the {@link EdgesSource} to connect
   * @param graphBuilder the {@link GraphBuilder} to set the updated data to
   */
  constructor(edgesSourceDefinition, edgesSource, graphBuilder) {
    super()
    this.sourceDefinition = edgesSourceDefinition
    this.edgesSource = edgesSource
    this.graphBuilder = graphBuilder
  }

  /**
   * Updates/sets the sources' bindings and new data content
   */
  applyDefinition() {
    this.sourceDefinition.sourceProvider = createBinding(this.sourceDefinition.sourceBinding)
    this.sourceDefinition.targetProvider = createBinding(this.sourceDefinition.targetBinding)
    this.sourceDefinition.labelTextProvider = createBinding(this.sourceDefinition.labelBinding)
    this.sourceDefinition.strokeProvider = createBinding(this.sourceDefinition.strokeBinding)
    this.graphBuilder.setData(this.edgesSource, parseData(this.sourceDefinition.data))
  }

  reset() {
    this.sourceDefinition.data = ''
    this.applyDefinition()
  }
}

/**
 * flag to prevent error messages from being repeatedly displayed for each graph item
 */
let bindingErrorCaught = false

/**
 * Returns a binding for the given string.
 * If the parameter is a function definition, a function object is
 * returned. Otherwise, a binding is created using the parameter as the
 * property path.
 * @returns The source or target binding
 */
function createBinding(bindingString) {
  if (bindingString.indexOf('function') >= 0 || bindingString.indexOf('=>') >= 0) {
    try {
      // eval the string to get the function object

      const func = new Function(`return (${bindingString})`)()

      // wrap the binding function with a function that catches and reports errors
      // that occur in the binding functions

      return (dataItem) => {
        try {
          const result = func.apply(null, [dataItem])
          return result === null ? undefined : result
        } catch (e) {
          if (!bindingErrorCaught) {
            alert(`Evaluating the binding function ${bindingString} failed: ${e}`)
            bindingErrorCaught = true
          }
          return undefined
        }
      }
    } catch (ignored) {
      return (dataItem) => (bindingString.length > 0 ? dataItem[bindingString] : undefined)
    }
  }

  return (dataItem) => (bindingString.length > 0 ? dataItem[bindingString] : undefined)
}

/**
 * Parses the string entered by the user and returns the parsed object
 * @param data the data entered by the user
 * @returns the parsed data
 */
function parseData(data) {
  try {
    const nodesSourceValue = (data || '').trim()

    if (!nodesSourceValue) {
      return []
    }
    const functionString = /^\sreturn/m.test(nodesSourceValue)
      ? nodesSourceValue
      : `return ${nodesSourceValue}`

    return new Function(functionString)()
  } catch (e) {
    throw new Error(`Evaluation of the source data failed: ${e}`)
  }
}

/**
 * Factory class for creation of {@link SourceDefinitionBuilderConnector}
 */
export class SourcesFactory {
  graphBuilder

  constructor(graphBuilder) {
    this.graphBuilder = graphBuilder
  }

  /**
   * Creates a {link NodesSourceDefinitionBuilderConnector}
   * @param sourceName the name of the source
   * @param nodesSourceDefinition the {@link NodesSourceDefinition} to use
   */
  createNodesSourceConnector(sourceName, nodesSourceDefinition) {
    const definition =
      nodesSourceDefinition || SourcesFactory.createDefaultNodesSourceDefinition(sourceName)

    const nodesSource = this.graphBuilder.createNodesSource([], '')

    const nodeCreator = nodesSource.nodeCreator
    nodeCreator.addEventListener('node-updated', (evt) => {
      nodeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
      evt.graph.setStyle(evt.item, nodeCreator.defaults.style)
    })

    const connector = new NodesSourceDefinitionBuilderConnector(
      definition,
      nodesSource,
      this.graphBuilder
    )
    connector.applyDefinition()
    return connector
  }

  /**
   * Creates a {link EdgesSourceDefinitionBuilderConnector}
   * @param sourceName the name of the source
   * @param edgesSourceDefinition the {@link EdgesSourceDefinition} to use
   */
  createEdgesSourceConnector(sourceName, edgesSourceDefinition) {
    const definition =
      edgesSourceDefinition || SourcesFactory.createDefaultEdgesSourceDefinition(sourceName)

    const edgesSource = this.graphBuilder.createEdgesSource(
      [],
      (edgeDataItem) =>
        definition.sourceProvider ? definition.sourceProvider(edgeDataItem) : undefined,
      (edgeDataItem) =>
        definition.targetProvider ? definition.targetProvider(edgeDataItem) : undefined
    )

    const edgeCreator = edgesSource.edgeCreator
    edgeCreator.defaults.style = new PolylineEdgeStyle({
      stroke: '1.5px #662b00',
      targetArrow: new Arrow({ fill: '#662b00', type: 'triangle' })
    })
    edgeCreator.defaults.shareStyleInstance = false
    edgeCreator.styleBindings.addBinding('stroke', (edgeDataItem) =>
      definition.strokeProvider ? definition.strokeProvider(edgeDataItem) : '#662b00'
    )

    edgeCreator.addEventListener('edge-updated', (evt) => {
      edgeCreator.applyStyleBindings(evt.graph, evt.item, evt.dataItem)
      edgeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
    })

    edgeCreator.createLabelBinding((edgeDataItem) =>
      definition.labelTextProvider ? definition.labelTextProvider(edgeDataItem) : undefined
    )

    const connector = new EdgesSourceDefinitionBuilderConnector(
      definition,
      edgesSource,
      this.graphBuilder
    )
    connector.applyDefinition()
    return connector
  }

  /**
   * Creates an example {link NodesSourceDefinition} for use in a newly created nodes sources
   * {@link NodesSourceDefinitionBuilderConnector}
   * @param sourceName the name of the source
   */
  static createDefaultNodesSourceDefinition(sourceName) {
    const nodesSourceDefinition = new NodesSourceDefinition()
    nodesSourceDefinition.name = sourceName
    nodesSourceDefinition.data = "['A','B','C']"
    nodesSourceDefinition.idBinding = 'dataItem => dataItem'
    nodesSourceDefinition.template = `<rect fill="#ff6c00" stroke="white" rx="2" ry="2" width="{TemplateBinding width}" height="{TemplateBinding height}"/>
<text transform="translate(10 20)" data-content="{Binding}" style="font-size:18px; fill:#000;"/>`
    return nodesSourceDefinition
  }

  /**
   * Creates an example {link EdgesSourceDefinition} for use in a newly created edges sources
   * {@link EdgesSourceDefinitionBuilderConnector}
   */
  static createDefaultEdgesSourceDefinition(sourceName) {
    const edgesSourceDefinition = new EdgesSourceDefinition()
    edgesSourceDefinition.name = sourceName
    edgesSourceDefinition.data = '[]'
    edgesSourceDefinition.sourceBinding = 'from'
    edgesSourceDefinition.targetBinding = 'to'
    edgesSourceDefinition.labelBinding = 'name'
    return edgesSourceDefinition
  }
}
