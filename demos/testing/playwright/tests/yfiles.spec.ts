/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { test, expect } from '@playwright/test'

/**
 * Demonstrates how to test node count and edge count in an application that uses yFiles.
 */
test('Test yFiles', async ({ page }) => {
  await page.goto('/demos-ts/testing/application-under-test/index.html')
  await page.locator('.loaded').waitFor()

  // get a handle for the graph component
  // note, the 'graphComponent' property has to be explicitly added to the 'window' object for
  // testing purposes - see also the source code of the sample application
  const graphComponentHandle = await page.evaluateHandle('window.graphComponent')
  await expect(graphComponentHandle).toBeTruthy()

  // get a handle for the graph structure
  const graphHandle = await graphComponentHandle.getProperty('graph')
  await expect(graphHandle).toBeTruthy()

  // get a handle for the graph's nodes
  const nodesHandle = await graphHandle.getProperty('nodes')
  await expect(nodesHandle).toBeTruthy()

  // check the initial node count
  const nodesSizeHandle = await nodesHandle.getProperty('size')
  await expect(nodesSizeHandle).toBeTruthy()

  const nodesSizeValue = await nodesSizeHandle.jsonValue()
  await expect(nodesSizeValue).toBe(2)

  // get a handle for the graph's edges
  const edgesHandle = await graphHandle.getProperty('edges')
  await expect(edgesHandle).toBeTruthy()

  // check the initial edge count
  const edgesSizeBeforeHandle = await edgesHandle.getProperty('size')
  await expect(edgesSizeBeforeHandle).toBeTruthy()

  const edgesSizeBeforeValue = await edgesSizeBeforeHandle.jsonValue()
  await expect(edgesSizeBeforeValue).toBe(0)

  // get "create edge" button
  const createEdgeLocator = await page.locator('#create-edge')
  await expect(createEdgeLocator).toHaveCount(1)

  // click "create edge" button to create an edge in the graph
  await createEdgeLocator.click()

  // check the graph's edge count after button click
  const edgesSizeAfterHandle = await edgesHandle.getProperty('size')
  await expect(edgesSizeAfterHandle).toBeTruthy()

  const edgesSizeAfterValue = await edgesSizeAfterHandle.jsonValue()
  await expect(edgesSizeAfterValue).toBe(1)
})
