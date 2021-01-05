/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
 * @param {!string} licenseString
 * @returns {!(object|string)}
 */
function parseLicense(licenseString) {
  try {
    return JSON.parse(licenseString)
  } catch (e) {
    // try a container object
    try {
      return JSON.parse('{' + licenseString + '}')
    } catch (e) {
      console.log('Could not parse license information', licenseString)
    }
  }
  return licenseString
}

/**
 * @returns {!(object|boolean)}
 */
function tryGetLicenseFromLocalStorage() {
  if (isLocalStorageSupported() && window.localStorage.getItem('yFiles_for_HTML_license')) {
    const licenseObject = parseLicense(window.localStorage.getItem('yFiles_for_HTML_license'))
    if (licenseObject !== null && typeof licenseObject === 'object') {
      return licenseObject
    }
  }
  return false
}

/**
 * @returns {boolean}
 */
function isLocalStorageSupported() {
  if (!window.localStorage) return false
  try {
    window.localStorage.setItem('probe', String(true))
    window.localStorage.removeItem('probe')
    return true
  } catch (error) {
    return false
  }
}

/**
 * @returns {!Promise.<(object|string)>}
 */
function tryLocalStorage() {
  return new Promise(resolve => {
    if (typeof window !== 'undefined') {
      const storedLicense = tryGetLicenseFromLocalStorage()
      if (storedLicense) {
        console.log('Using license from local storage.')
        resolve(storedLicense)
      } else {
        window.setTimeout(function () {
          const div = document.createElement('div')
          div.setAttribute(
            'style',
            'position:absolute; visibility:visible; top:280px; left:0; right:0; margin:auto; width:50em; padding:10px; z-index:1001; ' +
              'background:#efefef; border: 2px solid #888; color:black;'
          )
          div.innerHTML =
            '<h2>No yFiles for HTML license included</h2>\
    <p>Enter your license information in JSON format into the file <b>lib/license.json</b>.</p>\
    <p>If you have received a license file from yWorks, you can simply overwrite the file <b>lib/license.json</b> with\
    the license file you have received.</p>\
    <p>If you have received license information in another way, please replace the contents of the file <b>lib/license.json</b> \
    with the actual license information.</p>'
          if (isLocalStorageSupported()) {
            div.innerHTML +=
              '<p>You can also temporarily enter your license information below which is then stored in the local storage of your browser.</p>'
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
          document.body.appendChild(div)
        }, 2000)
      }
    } else {
      console.log('No yFiles for HTML license included!')
    }
  })
}

export default async function loadLicenseJSON() {
  try {
    const response = await fetch('../../../lib/license.json')
    if (response.ok) {
      return response.json()
    } else {
      console.log('Could not load license json')
      return tryLocalStorage()
    }
  } catch (e) {
    console.log('Could not load license json', e)
    return tryLocalStorage()
  }
}
