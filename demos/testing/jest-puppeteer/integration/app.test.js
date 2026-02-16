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
/* global page, y, beforeEach, describe, it */

function getZoom() {
  return page.evaluate(() => window.graphComponent.zoom)
}

function getNodeCount() {
  return page.evaluate(() => window.graphComponent.graph.nodes.size)
}

function getEdgeCount() {
  return page.evaluate(() => window.graphComponent.graph.edges.size)
}

function getBendCount() {
  return page.evaluate(() => window.graphComponent.graph.bends.size)
}

async function getGraphComponentBoundingClientRect() {
  const gc = await page.$('#graphComponent')
  return gc.boundingBox()
}

async function clickGraphComponentAt(x, y) {
  const rect = await getGraphComponentBoundingClientRect()
  await page.mouse.click(rect.x + x, rect.y + y)
}

describe('app', () => {
  beforeEach(async () => {
    const url = new URL(
      'testing/application-under-test/index.html',
      process.env.TEST_SERVER_URL || 'http://localhost:4241/demos-ts/'
    ).href
    console.log(`Navigating to ${url}`)
    await page.goto(url)
    await page.waitForSelector('.yfiles-canvascomponent')
  })

  // Make sure that we can access the yFiles API
  it('should have yfiles', async () => {
    const hasYFiles = await page.evaluate(() => typeof window.graphComponent !== 'undefined')
    expect(hasYFiles).toBe(true)
  })

  it('should zoom', async function () {
    let zoom = await getZoom()
    expect(zoom).toBe(1.0)
    await expect(page).toClick('#zoom-in')

    // zooming is animated, thus wait a second before checking the value
    const checkZoomPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(getZoom())
      }, 1000)
    })
    zoom = await checkZoomPromise
    expect(zoom).toBe(1.2)
  })

  it('should create a node', async () => {
    const location1 = { x: 100, y: 200 }
    const location2 = { x: 200, y: 100 }
    await clickGraphComponentAt(location1.x, location1.y)
    await clickGraphComponentAt(location2.x, location2.y)
    expect(await getNodeCount()).toBe(4)
  })

  it('should create an edge', async () => {
    const node1Loc = { x: 100, y: 200 }
    const node2Loc = { x: 200, y: 100 }
    expect(await getNodeCount()).toBe(2)
    expect(await getEdgeCount()).toBe(0)

    await clickGraphComponentAt(node1Loc.x, node1Loc.y)
    await clickGraphComponentAt(node2Loc.x, node2Loc.y)
    expect(await getNodeCount()).toBe(4)

    const box = await getGraphComponentBoundingClientRect()

    await page.mouse.move(box.x + node1Loc.x, box.y + node1Loc.y)
    await page.mouse.down()
    await page.mouse.move(box.x + node2Loc.x, box.y + node2Loc.y, { steps: 5 })
    await page.mouse.up()
    expect(await getEdgeCount()).toBe(1)
  })

  it('should create bends', async () => {
    await page.evaluate(() => window.graphComponent.graph.clear())

    const node1Loc = { x: 110, y: 120 }
    const node2Loc = { x: 210, y: 100 }
    const bend1Loc = { x: 160, y: 25 }
    const bend2Loc = { x: 180, y: 225 }

    expect(await getNodeCount()).toBe(0)
    expect(await getEdgeCount()).toBe(0)

    await clickGraphComponentAt(node1Loc.x, node1Loc.y)
    await clickGraphComponentAt(node2Loc.x, node2Loc.y)
    expect(await getNodeCount()).toBe(2)

    const box = await getGraphComponentBoundingClientRect()
    await page.mouse.move(box.x + node1Loc.x, box.y + node1Loc.y)
    await page.mouse.down()
    // // move to first bend location
    await page.mouse.move(box.x + bend1Loc.x, box.y + bend1Loc.y, { steps: 5 })
    // // create first bend
    await page.mouse.up()
    await page.mouse.down()
    await page.mouse.up()
    // move to second bend location
    await page.mouse.move(box.x + bend2Loc.x, box.y + bend2Loc.y, { steps: 5 })
    // create second bend
    await page.mouse.down()
    await page.mouse.up()
    // move to target node
    await page.mouse.move(box.x + node2Loc.x, box.y + node2Loc.y, { steps: 5 })
    await page.mouse.down()
    await page.mouse.up()
    expect(await getEdgeCount()).toBe(1)
    expect(await getBendCount()).toBe(2)
  })
})
