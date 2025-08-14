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
  BINDING_REGEX,
  DATA_CONTENT_ATTRIBUTE,
  ID_ATTRIBUTE,
  ID_REFERENCE_ATTRIBUTES,
  PARSING_PLACEHOLDER_XLINK_NS
} from './constants'
import type { BindingConfig, RenderContext } from './interfaces'

/**
 * Generates a prefixed ID.
 * @param id - The original ID.
 * @param prefix - The prefix to add.
 * @returns The prefixed ID.
 */
export function generatePrefixedId(id: string, prefix: string): string {
  return `${prefix}-${id}`
}

/**
 * Processes ID reference values.
 * @param value - The ID reference value.
 * @param idMap - A map of original IDs to prefixed IDs.
 * @param idPrefix - The prefix to add to IDs.
 * @returns The processed ID reference value.
 */
export function processIdReferenceValue(
  value: string,
  idMap: Set<string>,
  idPrefix?: string
): string {
  if (!idPrefix) return value
  return value
    .split(/\s+/)
    .map((id) => {
      if (id.startsWith("url('#")) {
        const plainId = id.substring(6, id.length - 2)
        if (idMap.has(plainId)) {
          return "url('#" + generatePrefixedId(plainId, idPrefix) + "')"
        }
        return id
      }
      if (id.startsWith('url(#')) {
        const plainId = id.substring(5, id.length - 1)
        if (idMap.has(plainId)) {
          return 'url(#' + generatePrefixedId(plainId, idPrefix) + ')'
        }
        return id
      }
      const plainId = id.startsWith('#') ? id.substring(1) : id
      if (idMap.has(plainId)) {
        return (id.startsWith('#') ? '#' : '') + generatePrefixedId(plainId, idPrefix)
      }
      return id
    })
    .join(' ')
}

/**
 * Parses a binding expression.
 * @param value - The binding expression string.
 * @returns An object containing the binding path, converter, and parameter, or null if parsing fails.
 */
export function parseBindingExpression(
  value: string
): {
  templateBinding: boolean
  path: string
  converter?: string
  converterParameter?: string
} | null {
  const match = value.match(BINDING_REGEX)
  if (!match) return null

  const parts = match[2].split(/,\s*/)
  return {
    templateBinding: match[1] === 'TemplateBinding',
    path: parts[0],
    converter: parts.find((p) => p.startsWith('Converter='))?.split('=')[1],
    converterParameter: parts.find((p) => p.startsWith('Parameter='))?.split('=')[1]
  }
}

/**
 * Creates a binding configuration from an attribute.
 * @param attr - The attribute to create the binding configuration from.
 * @returns The binding configuration, or null if the attribute is not a binding.
 */
export function createBindingConfig(attr: Attr): BindingConfig | null {
  const binding = parseBindingExpression(attr.value)
  if (!binding) return null

  return {
    type: attr.name === DATA_CONTENT_ATTRIBUTE ? 'content' : 'attribute',
    ns:
      attr.namespaceURI === PARSING_PLACEHOLDER_XLINK_NS
        ? 'http://www.w3.org/1999/xlink'
        : undefined,
    templateBinding: binding.templateBinding,
    name: attr.name,
    path: binding.path,
    converter: binding.converter,
    converterParameter: binding.converterParameter
  }
}

/**
 * Sets the content of an element.
 * @param element - The element to set the content of.
 * @param content - The content to set.
 */
export function setElementContent(
  element: Element,
  content: string | number | boolean | SVGElement
): void {
  element.innerHTML = ''
  if (content instanceof SVGElement) {
    element.appendChild(content)
  } else {
    element.appendChild(document.createTextNode(String(content)))
  }
}

/**
 * Collects template IDs from a root node.
 * @param rootNode - The root node to collect IDs from.
 * @returns A map of original IDs to prefixed IDs.
 */
export function collectTemplateIds(rootNode: Node): Set<string> {
  const idMap = new Set<string>()

  function traverse(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const id = element.getAttribute(ID_ATTRIBUTE)
      if (id) {
        idMap.add(id)
      }
      element.childNodes.forEach(traverse)
    }
  }

  traverse(rootNode)
  return idMap
}

/**
 * Checks if an attribute is an ID reference attribute.
 * @param name - The name of the attribute.
 * @returns True if the attribute is an ID reference attribute, false otherwise.
 */
export function isIdReferenceAttribute(name: string): boolean {
  return ID_REFERENCE_ATTRIBUTES.includes(name as (typeof ID_REFERENCE_ATTRIBUTES)[number])
}

/**
 * Sets an attribute on an element.
 * @param element - The element to set the attribute on.
 * @param name - The name of the attribute.
 * @param value - The value of the attribute.
 */
export function setAttribute(
  element: Element,
  name: string,
  value: string,
  ns: string | undefined,
  context: RenderContext
): void {
  const idPrefix = context.idPrefix
  const idMap = context.idMap
  if (ns) {
    if (name === ID_ATTRIBUTE && idPrefix && idMap?.has(value)) {
      element.setAttributeNS(ns, name, generatePrefixedId(value, idPrefix))
    } else if (idPrefix && idMap && isIdReferenceAttribute(name)) {
      element.setAttributeNS(ns, name, processIdReferenceValue(value, idMap, idPrefix))
    } else {
      element.setAttributeNS(ns, name, value)
    }
  } else {
    if (name === ID_ATTRIBUTE && idPrefix && idMap?.has(value)) {
      element.setAttribute(name, generatePrefixedId(value, idPrefix))
    } else if (idPrefix && idMap && isIdReferenceAttribute(name)) {
      element.setAttribute(name, processIdReferenceValue(value, idMap, idPrefix))
    } else {
      element.setAttribute(name, value)
    }
  }
}

export function removeAttribute(element: Element, binding: BindingConfig) {
  element.removeAttribute(binding.name!)
}

export function setBindingValue(
  element: Element,
  binding: BindingConfig,
  value: any,
  renderContext: RenderContext
) {
  if (typeof value !== 'undefined') {
    if (binding.type === 'content') {
      setElementContent(element, value)
    } else if (binding.name) {
      if (typeof value === 'boolean') {
        if (value) {
          setAttribute(element, binding.name, 'true', binding.ns, renderContext)
        } else {
          removeAttribute(element, binding)
        }
      } else {
        setAttribute(element, binding.name, String(value), binding.ns, renderContext)
      }
    }
  } else {
    if (binding.type === 'content') {
      setElementContent(element, '')
    } else if (binding.name) {
      removeAttribute(element, binding)
    }
  }
}

export function resolvePath(newContext: any, path: string) {
  return path
    .split('.')
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), newContext)
}
