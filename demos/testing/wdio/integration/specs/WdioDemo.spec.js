/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
const { wdioDemoPage } = require('../pages/WdioDemo.page')
const { expect } = require('chai')
const { MouseAction } = require('../MouseAction')

describe('Wdio Demo', () => {
  beforeEach(async () => {
    await wdioDemoPage.open()
    // wait until graphComponent exists in DOM and is visible
    const gcElem = await $('#graphComponent')
    await gcElem.waitForExist(5000)
    await gcElem.waitForDisplayed(5000)
    // wait for css animations to finish element positioning
    await browser.pause(2000)
  })

  describe("When clicking the 'zoom in' button", () => {
    it('the zoom of the graphComponent should increase', async () => {
      const zoomInButton = await wdioDemoPage.zoomInButton
      const initialZoom = await wdioDemoPage.zoom

      await zoomInButton.click()

      // zooming is animated, thus wait a before checking the value
      const checkZoomPromise = new Promise(resolve => {
        setTimeout(() => {
          resolve(wdioDemoPage.zoom)
        }, 1000)
      })
      const zoom = await checkZoomPromise
      expect(zoom).to.be.greaterThan(initialZoom)
    })
  })

  describe('When clicking on the graphComponent', () => {
    it('a node should be created at this location', async () => {
      const location = { x: 1000, y: 500 }

      let nodeCount = await wdioDemoPage.nodeCountAt(location)
      expect(nodeCount).to.equal(0)

      await new MouseAction(browser).clickAt(location).perform()

      nodeCount = await wdioDemoPage.nodeCountAt(location)
      expect(nodeCount).to.equal(1)
    })
  })

  describe('When dragging from one node to another', () => {
    it('an edge should be created', async () => {
      expect(await wdioDemoPage.edgeCount).to.equal(0)

      const startLocation = {
        x: 900,
        y: 500
      }
      const endLocation = {
        x: 1100,
        y: 500
      }

      // create two nodes
      await new MouseAction(browser).clickAt(startLocation).clickAt(endLocation).perform()

      // create an edge between them
      await new MouseAction(browser)
        .moveTo(startLocation)
        .mouseDown()
        // Add a move out of the start node bounds for proper event sequence in chrome
        .moveTo({ x: startLocation.x + 30, y: startLocation.y })
        .moveTo(endLocation)
        .mouseUp()
        .perform()

      expect(await wdioDemoPage.edgeCount).to.equal(1)
    })
  })

  describe('When clicking while creating an edge', () => {
    it('bends should be created', async () => {
      const startLocation = {
        x: 900,
        y: 500
      }
      const bend1Location = {
        x: 900,
        y: 600
      }
      const bend2Location = {
        x: 1100,
        y: 600
      }
      const endLocation = {
        x: 1100,
        y: 500
      }

      // create two nodes
      await new MouseAction(browser).clickAt(startLocation).clickAt(endLocation).perform()

      expect(await wdioDemoPage.bendCountAt(bend1Location)).to.equal(0)
      expect(await wdioDemoPage.bendCountAt(bend2Location)).to.equal(0)

      // create an edge with two bends
      await new MouseAction(browser)
        .moveTo(startLocation)
        .mouseDown()
        // Add a move out of the start node bounds for proper event sequence in chrome
        .moveTo({ x: startLocation.x, y: startLocation.y + 30 })
        .moveTo(bend1Location, 100)
        .mouseUp()
        .clickAt(bend2Location)
        .clickAt(endLocation)
        .perform()

      expect(await wdioDemoPage.bendCountAt(bend1Location)).to.equal(1)
      expect(await wdioDemoPage.bendCountAt(bend2Location)).to.equal(1)
    })
  })
})
