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
 * Non-UI model classes for the adjacency graph builder demo
 */

import {} from '@yfiles/yfiles'
import { LitNodeStyle } from '@yfiles/demo-utils/LitNodeStyle'
import { nothing, svg } from 'lit-html'

/**
 * Defines an adjacency node source consisting of data and bindings
 */
export class AdjacencyNodesSourceDefinition {
  name
  data
  idBinding
  template

  constructor() {
    this.name = ''
    this.data = ''
    this.idBinding = ''
    this.template = ''
  }
}

/**
 * Connector for {@link AdjacencyNodesSource}s, {@link AdjacencyNodesSourceDefinition}s and {@link AdjacencyGraphBuilder}
 */
export class AdjacencyNodesSourceDefinitionBuilderConnector {
  sourceDefinition
  nodesSource
  graphBuilder

  /**
   * @param nodesSourceDefinition the {@link AdjacencyNodesSourceDefinition} to connect
   * @param nodesSource the {@link AdjacencyNodesSource} to connect
   * @param graphBuilder the {@link AdjacencyGraphBuilder} to set the updated data to
   */
  constructor(nodesSourceDefinition, nodesSource, graphBuilder) {
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
        '({layout, tag}) => svg`\n' +
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
export function createBinding(bindingString) {
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
    } catch (_ignored) {
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
export function parseData(data) {
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
