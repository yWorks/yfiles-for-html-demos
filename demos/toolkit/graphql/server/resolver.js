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
const data = require('./data.js')

const persons = new Map(data.persons.map(person => [person.id, person]))

function getPersons() {
  const persons = []
  for (const person of data.persons) {
    persons.push(getPerson(person.id))
  }
  return persons
}

function getPerson(id) {
  const person = persons.get(id)
  if (person) {
    return {
      ...person,
      // return thunks to load friends and friendsCount lazily
      friendsCount: () => getFriendsCount(id),
      friends: () => getFriends(id)
    }
  }
  return null
}

function getFriends(id) {
  const friends = []
  for (const [id1, id2] of data.friends) {
    if (id1 === id) {
      friends.push(getPerson(id2))
    } else if (id2 === id) {
      friends.push(getPerson(id1))
    }
  }
  return friends
}

function getFriendsCount(id) {
  let friendsCount = 0
  for (const [id1, id2] of data.friends) {
    if (id1 === id || id2 === id) {
      friendsCount++
    }
  }
  return friendsCount
}

module.exports = {
  persons() {
    return getPersons()
  },
  person({ id }) {
    return getPerson(id)
  }
}
