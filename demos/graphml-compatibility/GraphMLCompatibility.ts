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
/**
 * GraphML legacy compatibility functionality for GraphMLIOHandler
 *
 * Note:
 * The various template styles have been removed in version 3.0 of the yFiles library.
 * At the moment, there is no compatibility functionality available for these styles.
 */

import {
  type Constructor,
  type GraphMLIOHandler,
  HashMap,
  IXamlNameMapper,
  type TypeMetadata,
  XmlName
} from '@yfiles/yfiles'

import {
  configureExtensions as configureLabelModelExtensions,
  configureRenamings as configureLabelModelRenamings
} from './LabelModelExtensions'

import {
  configureExtensions as configurePortLocationModelExtensions,
  configureRenamings as configurePortLocationModelRenamings
} from './PortLocationModelExtensions'

import {
  configureExtensions as configureStyleExtensions,
  configureRenamings as configureStyleRenamings
} from './StyleExtensions'

import {
  configureExtensions as configureTableExtensions,
  configureRenamings as configureTableRenamings
} from './TableExtensions'

export const YfilesForHtml_2_0_XamlNS = 'http://www.yworks.com/xml/yfiles-for-html/2.0/xaml'
export const YfilesForHtmlXamlNS = 'http://www.yworks.com/xml/yfiles-for-html/3.0/xaml'
export const YfilesCommon_3_0_XamlNS = 'http://www.yworks.com/xml/yfiles-common/3.0'
export const YfilesCommonXamlNS = 'http://www.yworks.com/xml/yfiles-common/4.0'

export function configureGraphMLCompatibility(graphMLIOHandler: GraphMLIOHandler) {
  const blacklist = new HashMap<XmlName, boolean>()

  const typeRenamings = new HashMap<XmlName, XmlName | Constructor>()
  const namespaceRenamings = new HashMap<string, string>()
  namespaceRenamings.set(YfilesCommon_3_0_XamlNS, YfilesCommonXamlNS)
  namespaceRenamings.set(YfilesForHtml_2_0_XamlNS, YfilesForHtmlXamlNS)

  function registerExtension<T>(type: Constructor<T>, metadata: TypeMetadata<T>): void {
    blacklist.set(new XmlName(metadata.name!, metadata.xmlNamespace!), true)
    graphMLIOHandler.addTypeInformation(type, metadata)
  }

  function registerRenaming(oldName: XmlName, newName: XmlName): void {
    typeRenamings.set(oldName, newName)
  }

  configureLabelModelExtensions(registerExtension)
  configureLabelModelRenamings(registerRenaming)

  configurePortLocationModelExtensions(registerExtension)
  configurePortLocationModelRenamings(registerRenaming)

  configureStyleExtensions(registerExtension)
  configureStyleRenamings(registerRenaming)

  configureTableExtensions(registerExtension)
  configureTableRenamings(registerRenaming)

  registerRenaming(
    new XmlName('Fill', YfilesForHtml_2_0_XamlNS),
    new XmlName('Color', YfilesForHtmlXamlNS)
  )

  graphMLIOHandler.addEventListener('query-type', (evt) => {
    if (blacklist.has(evt.xmlName)) {
      return
    }
    const xmlns = evt.xmlName.namespace
    const tag = evt.xmlName.localName

    const newName = typeRenamings.get(evt.xmlName)
    if (newName) {
      if (newName instanceof XmlName) {
        const nameMapper = evt.context.lookup(IXamlNameMapper)
        //requery with the mapped Xml name
        const type = nameMapper!.getClassForName(evt.context, newName as XmlName)
        if (type) {
          evt.result = type
        }
      } else {
        //Assume we have a direct mapping to a type
        evt.result = newName as Constructor
      }
    } else if (xmlns) {
      const newNamespace = namespaceRenamings.get(xmlns)
      if (newNamespace) {
        const nameMapper = evt.context.lookup(IXamlNameMapper)
        const type = nameMapper!.getClassForName(evt.context, new XmlName(tag, newNamespace))
        if (type) {
          evt.result = type
        }
      }
    }
  })
}
