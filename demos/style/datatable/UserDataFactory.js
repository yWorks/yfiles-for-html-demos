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
// This file contains a generator for random user data objects for this demo.

const FIRST_NAMES = [
  'Alexander',
  'Amy',
  'Dorothy',
  'Edward',
  'Eric',
  'Gary',
  'Linda',
  'Lisa',
  'Kathy',
  'Richard',
  'Thomas',
  'Valerie'
]

const FAMILY_NAMES = [
  'Burns',
  'Burnett',
  'Jensen',
  'Joplin',
  'Kain',
  'Lacey',
  'Monge',
  'Newland',
  'Roberts'
]

const UNITS = ['Development', 'Management', 'Marketing', 'R&D', 'Sales']

export function createNewRandomUserData() {
  const firstName = FIRST_NAMES[getRandomInt(FIRST_NAMES.length)]
  const familyName = FAMILY_NAMES[getRandomInt(FAMILY_NAMES.length)]
  const phoneNumber = getRandomInt(90000) + 10000
  return {
    name: `${firstName} ${familyName}`,
    unit: UNITS[getRandomInt(UNITS.length)],
    email: `${firstName.toLowerCase() + familyName.toLowerCase()}@yoyodyne.com`,
    phone: `555-${phoneNumber}`,
    fax: `555-${phoneNumber + 1}`
  }
}

/**
 * Returns a random integer.
 */
function getRandomInt(upper) {
  return Math.floor(Math.random() * upper)
}
