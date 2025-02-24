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
import { PARSING_PLACEHOLDER_NS, PARSING_PLACEHOLDER_XLINK_NS } from './constants'
import {
  collectTemplateIds,
  createBindingConfig,
  resolvePath,
  setAttribute,
  setBindingValue
} from './helpers'
const INITIAL_VALUE_SENTINEL = {}
export const converters = {}
function applyConverter(binding, value) {
  // Apply converter if specified
  if (binding.converter) {
    const converter = resolvePath(converters, binding.converter) ?? window[binding.converter]
    if (typeof converter === 'function') {
      return converter(value, binding.converterParameter)
    }
  }
  return value
}
/**
 * Parses a template string into a virtual DOM.
 * @param template - The template string to parse.
 * @param defaultNamespace the namespace in which the template should be parsed.
 * @returns The virtual DOM node representation of the template.
 */
export function parseTemplate(template, defaultNamespace) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(
    `<root xmlns="${PARSING_PLACEHOLDER_NS}" xmlns:xlink="${PARSING_PLACEHOLDER_XLINK_NS}"><g>${template}</g></root>`,
    'text/xml'
  )
  const idMap = collectTemplateIds(xmlDoc.documentElement.firstElementChild)
  // Recursive parsing function
  const parseNode = (domNode) => {
    if (domNode.nodeType === Node.ELEMENT_NODE) {
      const element = domNode
      const virtualNode = {
        type: 'element',
        name: element.localName,
        namespace:
          element.namespaceURI !== PARSING_PLACEHOLDER_NS ? element.namespaceURI : defaultNamespace,
        attributes: {},
        bindings: [],
        children: [],
        idMap: idMap
      }
      // Process attributes using helper functions
      Array.from(element.attributes).forEach((attr) => {
        const bindingConfig = createBindingConfig(attr)
        if (bindingConfig) {
          virtualNode.bindings.push(bindingConfig)
        } else {
          if (attr.namespaceURI) {
            virtualNode.attributes[attr.name] = [attr.namespaceURI, attr.value]
          } else {
            virtualNode.attributes[attr.name] = attr.value
          }
        }
      })
      // Process child nodes
      element.childNodes.forEach((child) => {
        virtualNode.children.push(parseNode(child))
      })
      return virtualNode
    }
    if (domNode.nodeType === Node.TEXT_NODE) {
      return {
        type: 'text',
        textContent: domNode.textContent || '',
        attributes: {},
        bindings: [],
        children: []
      }
    }
    return {
      type: 'comment',
      textContent: domNode.textContent || '',
      attributes: {},
      bindings: [],
      children: []
    }
  }
  let virtualNode = parseNode(xmlDoc.documentElement.firstElementChild)
  if (virtualNode.children.length == 1) {
    virtualNode = virtualNode.children[0]
  }
  return (context, templateContext, idPrefix) => {
    return renderTemplateCore(virtualNode, {
      bindingContext: context,
      templateContext,
      idPrefix
    })
  }
}
/**
 * Renders a virtual DOM node into a real DOM node.
 * @param virtualNode - The virtual DOM node to render.
 * @returns An object containing the rendered node, an update function, and a cleanup function.
 */
function renderTemplateCore(virtualNode, renderContext) {
  const attributeUpdates = []
  const cleanupFunctions = []
  // Check if context is observable
  const isObservable = (obj) => {
    return (
      obj &&
      typeof obj.addPropertyChangedListener === 'function' &&
      typeof obj.removePropertyChangedListener === 'function'
    )
  }
  const renderNode = (node) => {
    if (node.type === 'text') {
      return document.createTextNode(node.textContent || '')
    }
    if (node.type === 'comment') {
      return document.createComment(node.textContent || '')
    }
    const element = node.namespace
      ? document.createElementNS(node.namespace, node.name || 'div')
      : document.createElement(node.name || 'div')
    // Set attributes using helper function
    Object.entries(node.attributes).forEach(([name, value]) => {
      if (typeof value === 'string') {
        setAttribute(element, name, value, undefined, renderContext)
      } else {
        setAttribute(element, name, value[1], value[0], renderContext)
      }
    })
    node.bindings.forEach((binding) => {
      const context = binding.templateBinding
        ? renderContext.templateContext
        : renderContext.bindingContext
      let lastValue = INITIAL_VALUE_SENTINEL
      let lastValueBeforeConverter = INITIAL_VALUE_SENTINEL
      const updateFn = (newContext) => {
        // Resolve the property path
        const value = resolvePath(newContext, binding.path)
        if (lastValueBeforeConverter !== value) {
          lastValueBeforeConverter = value
          const resolvedValue = applyConverter(binding, value)
          if (resolvedValue !== lastValue) {
            lastValue = resolvedValue
            setBindingValue(element, binding, resolvedValue, renderContext)
          }
        }
      }
      // Initial update
      updateFn(context)
      attributeUpdates.push((newContext, newTemplateContext) =>
        updateFn(binding.templateBinding ? newTemplateContext : newContext)
      )
      // Set up property change listener if context is observable
      if (isObservable(context)) {
        const propertyPath = binding.path.split('.')
        const propertyName = propertyPath[0] // Listen to the root property
        const propertyChangedListener = (changedProperty) => {
          if (changedProperty === propertyName) {
            updateFn(context)
          }
        }
        context.addPropertyChangedListener(propertyChangedListener)
        cleanupFunctions.push(() => {
          context.removePropertyChangedListener(propertyChangedListener)
        })
      }
    })
    // Recursively render children with the same ID prefix
    node.children.forEach((child) => {
      const renderedChild = renderNode(child)
      element.appendChild(renderedChild)
    })
    return element
  }
  renderContext.idMap = virtualNode.idMap
  const renderedNode = renderNode(virtualNode)
  return {
    node: renderedNode,
    update: (newContext, templateContext) => {
      attributeUpdates.forEach((updateFn) => updateFn(newContext, templateContext))
    },
    cleanup: () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }
}
/**
 * Registers a global converter.
 * @param name - The name of the converter.
 * @param converter - The converter function.
 */
export function registerConverter(name, converter) {
  converters[name] = converter
}
/**
 * Makes an object observable for the binding engine.
 * @param obj - The object to make observable.
 */
export function makeObservable(obj) {
  const listeners = []
  obj.addPropertyChangedListener = (listener) => {
    listeners.push(listener)
  }
  obj.removePropertyChangedListener = (listener) => {
    const index = listeners.indexOf(listener)
    if (index !== -1) listeners.splice(index, 1)
  }
  obj.firePropertyChanged = (propertyName) => {
    listeners.forEach((listener) => listener(propertyName))
  }
}
