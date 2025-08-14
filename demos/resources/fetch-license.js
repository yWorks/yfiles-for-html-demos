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
import { Graph, GraphComponent, License } from '@yfiles/yfiles'
import { INVALID_LICENSE_MESSAGE } from './demo-error'

/**
 * Fetches `license.json` file and returns its data.
 *
 * Note: The additional license verification that is done here is only for the sake of the demo
 * framework for the yFiles demos and is not necessary for actual user code.
 *
 * We recommend to just fetch the license data, or directly inline the data to `License.value`:
 * ```
 * License.value = { ... }
 * ```
 */
export async function fetchLicense() {
  return fetchLicenseCore().then(checkLicense)
}

/**
 * Fetches `license.json`.
 */
async function fetchLicenseCore() {
  try {
    const response = await fetch(new URL('../../lib/license.json', import.meta.url).toString())
    if (response.ok) {
      return response.json()
    } else {
      throw new Error('Could not fetch License')
    }
  } catch (e) {
    console.warn('yFiles demo app: Could not load license.json', e)
  }
  const localLicense = loadLicenseFromLocalStorage()
  if (localLicense) {
    return Promise.resolve(localLicense)
  }
  return new Promise((resolve) => showLicenseDialog(resolve))
}

/**
 * Checks whether the license is the built dummy license
 * @param licenseData the license data to be checked
 */
function isDummyLicense(licenseData) {
  return Boolean(licenseData.dummy)
}

/**
 * Checks whether the license is a valid yfiles license.
 * @param licenseData The license data to be checked
 */
async function checkLicense(licenseData) {
  if (licenseData) {
    if (isDummyLicense(licenseData)) {
      return new Promise((resolve) => {
        showLicenseDialog(resolve)
      })
    }
    License.value = licenseData
    const g = new Graph()
    g.createNode()
    if (g.nodes.size === 1) {
      return new Promise((resolve) => resolve(licenseData))
    }

    window.setTimeout(() => {
      document.body.style.display = 'unset'
      document.body.innerHTML =
        '<div id="errorComponent" style="position:sticky; margin:auto; width:40em; height: 100%;"></div>'
      new GraphComponent('errorComponent')
    }, 200)
  }
  throw new Error(INVALID_LICENSE_MESSAGE)
}

/*
 * Following are license helpers for the demo-framework.
 */
function parseLicense(licenseString) {
  if (licenseString == null) {
    return
  }

  try {
    return JSON.parse(licenseString)
  } catch (e) {
    console.warn('yFiles demo app: Cannot parse license information', licenseString)
  }
}

function loadLicenseFromLocalStorage() {
  if (typeof window === 'undefined') {
    console.warn('yFiles demo app: No yFiles for HTML license included!')
    return
  }

  const storedLicense = parseLicense(window.localStorage.getItem('yFiles_for_HTML_license'))
  if (storedLicense) {
    console.warn('yFiles demo app: Using license from local storage.')
    return storedLicense
  }
}

function noLicenseDialog(div, resolve) {
  div.innerHTML = `<h2>No yFiles for HTML license included</h2>
<p>Enter your license information in JSON format into the file <b>lib/license.json</b>.</p>
<p>If you have received a license file from yWorks, you can simply overwrite the file <b>lib/license.json</b> with
the license file you have received.</p>
<p>If you have received license information in another way, please replace the contents of the file <b>lib/license.json</b>
with the actual license information.</p>
<p>You can also temporarily enter your license information below which is then stored in the local storage of your browser.</p>`
  const licenseInputDiv = document.createElement('div')
  const input = document.createElement('textarea')
  input.setAttribute('rows', '6')
  input.setAttribute('style', 'width: 100%; resize: vertical')
  input.setAttribute(
    'placeholder',
    '{\n  "company": "Company name",\n  "domains": ["example.com"],\n  "key": "c543edd9d30db901d65e86a4d0aa2106775f4532"\n  ...\n}'
  )
  const inputNote = document.createElement('span')
  inputNote.setAttribute('style', 'display: none;')
  inputNote.innerHTML = 'Please enter your license information.'
  const confirm = document.createElement('button')
  confirm.innerHTML = 'Save license and continue'
  confirm.addEventListener('click', function () {
    if (input.value.length > 0) {
      window.localStorage.setItem('yFiles_for_HTML_license', input.value)
      resolve(parseLicense(input.value))
      div.parentNode.removeChild(div)
    } else {
      inputNote.setAttribute('style', 'display: inline; margin-left: 5px; color: red;')
    }
  })
  licenseInputDiv.appendChild(input)
  licenseInputDiv.appendChild(confirm)
  licenseInputDiv.appendChild(inputNote)
  div.appendChild(licenseInputDiv)
}

function showLicenseDialog(resolve) {
  window.setTimeout(function () {
    const div = document.createElement('div')
    div.setAttribute(
      'style',
      'position:absolute; visibility:visible; top:280px; left:0; right:0;' +
        ' margin:auto; width:50em; padding:10px; z-index:2001; ' +
        ' background:#efefef; border: 2px solid #888; color:black;'
    )
    noLicenseDialog(div, resolve)
    document.body.appendChild(div)
  }, 2000)
}
