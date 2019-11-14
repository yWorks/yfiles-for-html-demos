/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define([], () => {
  /**
   * Creates random user data objects for this demo.
   */
  class UserDataFactory {
    /** @type {string} */
    static get FIRST_NAMES() {
      return [
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
    }

    /** @type {string} */
    static get FAMILY_NAMES() {
      return [
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
    }

    /** @type {string} */
    static get UNITS() {
      return ['Development', 'Management', 'Marketing', 'R&D', 'Sales']
    }

    /**
     * @return {Object}
     */
    static getNewRandomUserData() {
      const userData = {}
      const firstName =
        UserDataFactory.FIRST_NAMES[
          UserDataFactory.getRandomInt(UserDataFactory.FIRST_NAMES.length)
        ]
      const familyName =
        UserDataFactory.FAMILY_NAMES[
          UserDataFactory.getRandomInt(UserDataFactory.FAMILY_NAMES.length)
        ]
      userData.name = `${firstName} ${familyName}`
      userData.unit =
        UserDataFactory.UNITS[UserDataFactory.getRandomInt(UserDataFactory.UNITS.length)]
      userData.email = `${firstName.toLowerCase() + familyName.toLowerCase()}@yoyodyne.com`
      const phoneNumber = UserDataFactory.getRandomInt(90000) + 10000
      userData.phone = `555-${phoneNumber}`
      userData.fax = `555-${phoneNumber + 1}`
      return userData
    }

    /**
     * Returns a random integer.
     * @param {number} upper
     * @return {number}
     */
    static getRandomInt(upper) {
      return Math.floor(Math.random() * upper)
    }
  }

  return UserDataFactory
})
