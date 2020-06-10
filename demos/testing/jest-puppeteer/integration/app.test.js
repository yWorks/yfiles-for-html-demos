/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* global page */
function getZoom() {
  return page.$eval('.yfiles-canvascomponent', e => y.CanvasComponent.getComponent(e).zoom)
}

function getNodeCount() {
  return page.$eval(
    '.yfiles-canvascomponent',
    e => y.CanvasComponent.getComponent(e).graph.nodes.size
  )
}

function getEdgeCount() {
  return page.$eval(
    '.yfiles-canvascomponent',
    e => y.CanvasComponent.getComponent(e).graph.edges.size
  )
}

function getBendCount() {
  return page.$eval(
    '.yfiles-canvascomponent',
    e => y.CanvasComponent.getComponent(e).graph.bends.size
  )
}
async function getGraphComponentBox() {
  const gc = await page.$('.yfiles-canvascomponent')
  return gc.boundingBox()
}

async function clickGraphComponentAt(x, y) {
  const box = await getGraphComponentBox()
  await page.mouse.click(box.x + x, box.y + y)
}

function isNodeAtLocation(px, py) {
  return page.$eval(
    '.yfiles-canvascomponent',
    (e, px, py) => {
      const graphComponent = y.CanvasComponent.getComponent(e)
      const hits = graphComponent.graphModelManager.hitElementsAt([px, py])
      const item = hits.firstOrDefault()
      return y.INode.isInstance(item)
    },
    px,
    py
  )
}

describe('app', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:3000')
    await page.waitForSelector('.yfiles-canvascomponent')
  })

  // Make sure that we can access the yFiles API
  it('should have yfiles', async () => {
    const hasYFiles = await page.evaluate(() => typeof window.y !== 'undefined')
    expect(hasYFiles).toBe(true)
  })

  it('should zoom', async () => {
    let zoom = await getZoom()
    expect(zoom).toBe(1.0)
    await expect(page).toClick('.demo-icon-yIconZoomIn')
    zoom = await getZoom()
    expect(zoom).toBe(1.2)
  })

  it('should create a node', async () => {
    const location = { x: 110, y: 120 }
    await clickGraphComponentAt(location.x, location.y)
    const isNodeAt = await isNodeAtLocation(location.x, location.y)
    expect(isNodeAt).toBe(true)
  })

  it('should create an edge', async () => {
    const node1Loc = { x: 110, y: 120 }
    const node2Loc = { x: 210, y: 120 }
    expect(await getNodeCount()).toBe(0)
    expect(await getEdgeCount()).toBe(0)

    await clickGraphComponentAt(node1Loc.x, node1Loc.y)
    await clickGraphComponentAt(node2Loc.x, node2Loc.y)
    expect(await getNodeCount()).toBe(2)

    const box = await getGraphComponentBox()
    await page.mouse.move(box.x + node2Loc.x, box.y + node2Loc.y)
    await page.mouse.down()
    await page.mouse.move(box.x + node1Loc.x, box.y + node1Loc.y, {
      steps: 5
    })
    await page.mouse.up()
    expect(await getEdgeCount()).toBe(1)
  })

  it('should create bends', async () => {
    const node1Loc = { x: 110, y: 120 }
    const node2Loc = { x: 210, y: 120 }
    const bend1Loc = { x: 160, y: 25 }
    const bend2Loc = { x: 140, y: 225 }

    expect(await getNodeCount()).toBe(0)
    expect(await getEdgeCount()).toBe(0)

    await clickGraphComponentAt(node1Loc.x, node1Loc.y)
    await clickGraphComponentAt(node2Loc.x, node2Loc.y)
    expect(await getNodeCount()).toBe(2)

    const box = await getGraphComponentBox()
    await page.mouse.move(box.x + node2Loc.x, box.y + node2Loc.y)
    await page.mouse.down()
    // move to first bend location
    await page.mouse.move(box.x + bend1Loc.x, box.y + bend2Loc.y, {
      steps: 5
    })
    // create first bend
    await page.mouse.up()
    // move to second bend location
    await page.mouse.move(box.x + bend2Loc.x, box.y + bend2Loc.y, {
      steps: 5
    })
    // create second bend
    await page.mouse.down()
    await page.mouse.up()
    // move to target node
    await page.mouse.move(box.x + node1Loc.x, box.y + node2Loc.y, {
      steps: 5
    })
    await page.mouse.down()
    await page.mouse.up()
    expect(await getEdgeCount()).toBe(1)
    expect(await getBendCount()).toBe(2)
  })
})
