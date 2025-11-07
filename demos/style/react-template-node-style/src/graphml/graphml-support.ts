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
 * This file provides functions to {@link openGraphML read} and {@link saveGraphML write}
 * a graph to GraphML.
 */

import { downloadFile, getFileExtension, openFile } from './file-support'
import type { GraphComponent } from '@yfiles/yfiles'
import { GraphMLIOHandler } from '@yfiles/yfiles'
import { createConfiguredGraphMLIOHandler } from './FaultTolerantGraphMLIOHandler'

/**
 * Opens a GraphML file and loads its content into {@link graphComponent} using the {@link graphMLIOHandler}
 */
export async function openGraphML(
  graphComponent: GraphComponent,
  graphMLIOHandler?: GraphMLIOHandler
): Promise<void> {
  try {
    const { content, filename } = await openFile('.graphml')
    const fileExtension = getFileExtension(filename)
    switch (fileExtension?.toLowerCase()) {
      case 'graphml':
        await readGraphML(graphComponent, content, graphMLIOHandler)
        // more cases like json could extend this
        return
      default:
        alert(`This demo cannot open files of type ${fileExtension}.`)
    }
  } catch (err) {
    if (err !== 'canceled') {
      alert(err)
    }
  }
}
/**
 * Serializes the graph {@link graphComponent} into graphML and saves it at a given location using
 * the {@link graphMLIOHandler}
 */
export async function saveGraphML(
  graphComponent: GraphComponent,
  fileName: string = 'unnamed.graphml',
  graphMLIOHandler: GraphMLIOHandler = new GraphMLIOHandler()
): Promise<void> {
  {
    const text = await writeGraphML(graphComponent, graphMLIOHandler)
    try {
      downloadFile(text, fileName)
    } catch (err) {
      alert(err)
    }
  }
}

/**
 * Reads a graph from the given GraphML {@link text} and sets it to the given {@link graphComponent}.
 */
export async function readGraphML(
  graphComponent: GraphComponent,
  text: string,
  graphMLIOHandler: GraphMLIOHandler = createConfiguredGraphMLIOHandler(graphComponent)
): Promise<void> {
  try {
    await graphMLIOHandler.readFromGraphMLText(graphComponent.graph, text)
    await graphComponent.fitGraphBounds()
  } catch (err) {
    alert(`Error parsing GraphML. Cause: ${(err as Error).message}`)
  }
}

/**
 * Writes the graph of the given {@link graphComponent} to text.
 */
export async function writeGraphML(
  graphComponent: GraphComponent,
  graphMLIOHandler: GraphMLIOHandler = new GraphMLIOHandler()
): Promise<string> {
  try {
    return graphMLIOHandler.write(graphComponent.graph)
  } catch (err) {
    alert(`Error writing GraphML. Cause: ${(err as Error).message}`)
  }
  return ''
}
