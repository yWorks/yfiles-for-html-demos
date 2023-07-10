/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import firefox from 'selenium-webdriver/firefox.js'
import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'

describe('Test yFiles in Chrome', function () {
  this.timeout(30000)

  testBrowser(
    new Builder()
      .forBrowser('chrome')
      .setChromeOptions(new chrome.Options().addArguments('--headless=new'))
  )
})

describe('Test yFiles in Firefox', function () {
  this.timeout(30000)

  testBrowser(
    new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(new firefox.Options().addArguments('--headless'))
  )
})

function testBrowser(builder) {
  let driver

  beforeEach(async function () {
    driver = await builder.build()
  })

  afterEach(async function () {
    await driver.quit()
  })

  it('Create Edge', async function () {
    await driver.get('http://localhost:4242/demos-ts/testing/application-under-test/index.html')
    await driver.wait(until.elementLocated(By.css('body.loaded')))

    // check the initial node count
    const nodesSize = await driver.executeScript('return window.graphComponent.graph.nodes.size')
    expect(nodesSize).to.equal(2)

    // check the initial edge count
    const edgesSizeBefore = await driver.executeScript(
      'return window.graphComponent.graph.edges.size'
    )
    expect(edgesSizeBefore).to.equal(0)

    // click "create edge" button to create an edge in the graph
    await driver.findElement(By.id('create-edge')).click()

    // check the graph's edge count after button click
    const edgesSizeAfter = await driver.executeScript(
      'return window.graphComponent.graph.edges.size'
    )
    expect(edgesSizeAfter).to.equal(1)
  })
}
