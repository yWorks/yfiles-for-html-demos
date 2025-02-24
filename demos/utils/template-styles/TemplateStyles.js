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
import { StringTemplatePortStyle } from './StringTemplatePortStyle'
import { StringTemplateNodeStyle } from './StringTemplateNodeStyle'
import { StringTemplateLabelStyle } from './StringTemplateLabelStyle'
// Create a map to store the IDs and their corresponding texts
const templateMap = new Map()
function parseTemplateScripts() {
  if (templateMap.size > 0) {
    return templateMap
  }
  // Find all <script> elements with type "text/yfiles-template"
  const templateScripts = document.querySelectorAll('script[type="text/yfiles-template"]')
  // Iterate over the <script> elements
  templateScripts.forEach((script) => {
    // Create a temporary container to parse the template content
    const xml = new DOMParser().parseFromString(`<script>${script.innerHTML}</script>`, 'text/xml')
    // Find all top-level child elements with an 'id' attribute
    xml.documentElement.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.id) {
        const element = node
        // Add the id and its inner HTML/text to the map
        templateMap.set(element.id, element.innerHTML.trim())
      }
    })
  })
  return templateMap
}
function getTemplateString(arg) {
  if (typeof arg === 'string') {
    const id = arguments[0]
    // parse the template initially
    return parseTemplateScripts().get(id) ?? '<g></g>'
  } else {
    const arg = arguments[0]
    return { ...arg, svgContent: parseTemplateScripts().get(arg.renderTemplateId) ?? '<g></g>' }
  }
}
export class TemplatePortStyle extends StringTemplatePortStyle {
  constructor() {
    super(getTemplateString(arguments[0]))
  }
}
export class TemplateNodeStyle extends StringTemplateNodeStyle {
  constructor() {
    super(getTemplateString(arguments[0]))
  }
}
export class TemplateLabelStyle extends StringTemplateLabelStyle {
  constructor() {
    super(getTemplateString(arguments[0]))
  }
}
