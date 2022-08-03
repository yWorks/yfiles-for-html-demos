/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
/**
 * This class creates an event log to display messages.
 */
export default class EventView {
  constructor() {
    this._logElement = null
    this.groupEvents = true
    this.messages = []
    this.startDate = new Date()
  }

  /**
   * Returns the dom element that displays the log message.
   * @type {!HTMLElement}
   */
  get logElement() {
    if (this._logElement === null) {
      this._logElement = document.getElementById('log')
    }
    return this._logElement
  }

  /**
   * Clears the log element.
   */
  clear() {
    this.logElement.innerHTML = ''
    this.messages = []
    this.startDate = new Date()
  }

  /**
   * Adds the given text to the log element.
   * @param {!string} text The text to be added
   * @param {!string} eventType The type of the event
   * @param {!string} category The category of the event
   */
  addMessage(text, eventType, category) {
    if (!eventType) {
      eventType = text
    }

    const message = {
      isGroup: false,
      message: text,
      date: new Date(),
      eventType,
      category
    }
    this.messages.push(message)
    this.createElementForLogItem(message)

    if (this.groupEvents) {
      this.mergeEvents()
    }
  }

  /**
   * Creates a log element for the given message.
   * @param {!(Message|MessageGroup)} item The log message to create the element for
   */
  createElementForLogItem(item) {
    if (item.isGroup) {
      item.element = this.createGroupElement()
      this.updateGroup(item)
    } else {
      const message = item
      message.element = this.createMessageElement(message)
    }
    this.appendElementToLog(item.element)
  }

  /**
   * Appends the given element to the current log element.
   * @param {!HTMLElement} element The element to be added
   */
  appendElementToLog(element) {
    const logElement = this.logElement
    if (logElement.childNodes.length === 0) {
      logElement.appendChild(element)
    } else {
      logElement.insertBefore(element, logElement.firstChild)
    }
  }

  /**
   * Creates an element group for the given group.
   * @returns {!HTMLElement}
   */
  createGroupElement() {
    const element = document.createElement('div')
    element.setAttribute('class', 'logGroup')
    return element
  }

  /**
   * Creates the log element for the given message.
   * @param {!Message} message
   * @returns {!HTMLElement}
   */
  createMessageElement(message) {
    const element = document.createElement('div')
    element.setAttribute('class', `logMessage category-${message.category}`)
    element.textContent = this.getLogText(message)
    return element
  }

  /**
   * Updates the given element group.
   * @param {!MessageGroup} group
   */
  updateGroup(group) {
    const element = group.element
    element.innerHTML = ''

    const containerDiv = document.createElement('div')
    containerDiv.setAttribute('class', 'logGroup-container')

    const messageDiv = document.createElement('div')
    messageDiv.setAttribute('class', 'logGroup-messages')

    const groupedMessages = group.repeatedMessages
    for (let i = 0; i < groupedMessages.length; i++) {
      const message = groupedMessages[i]
      messageDiv.appendChild(message.element)
    }
    containerDiv.appendChild(messageDiv)

    const countDiv = document.createElement('div')
    countDiv.setAttribute('class', 'logGroup-count')
    countDiv.textContent = group.repeatCount.toString()
    containerDiv.appendChild(countDiv)

    element.appendChild(containerDiv)
  }

  /**
   * Returns the text of the given message.
   * @param {!Message} message
   * @returns {!string}
   */
  getLogText(message) {
    const dateDiff = message.date.getTime() - this.startDate.getTime()
    // remove hours
    let rest = dateDiff - ((dateDiff / 3600000) | 0) * 3600000
    // calculate minutes
    const minutes = (rest / 60000) | 0
    rest = dateDiff - minutes * 60000
    // calculate seconds
    const seconds = (rest / 1000) | 0
    // calculate milliseconds
    const millis = rest - seconds * 1000

    function appendZeros(s, maxLength) {
      // append zeros to the string until it has the given length
      while (s.length < maxLength) {
        s = `0${s}`
      }
      return s
    }

    return `[${appendZeros(`${minutes}`, 2)}:${appendZeros(`${seconds}`, 2)}.${appendZeros(
      `${millis}`,
      3
    )}] ${message.message}`
  }

  /**
   * Removes the given message.
   * @param {!Array.<Message>} removeThese
   */
  removeMessages(removeThese) {
    for (let i = 0; i < removeThese.length; i++) {
      this.removeLogItem(removeThese[i])
    }
  }

  /**
   * Removes the given log element from the dom.
   * @param {!Message} item
   */
  removeLogItem(item) {
    const index = this.messages.indexOf(item)
    if (index > -1) {
      const element = item.element
      element.parentNode.removeChild(element)
      this.messages.splice(index, 1)
    }
  }

  /**
   * Merges the events.
   */
  mergeEvents() {
    this.mergeWithLatestGroup()
    this.createNewGroup()
  }

  /**
   * Merges with the latest group log element.
   */
  mergeWithLatestGroup() {
    const latestGroup = this.getLatestGroup()
    if (!latestGroup) {
      return
    }

    const ungroupedMessages = this.getLatestMessages()
    const groupCount = latestGroup.repeatedMessages.length
    if (ungroupedMessages.length < groupCount) {
      return
    }
    if (this.compareTypes(latestGroup.repeatedMessages, ungroupedMessages)) {
      latestGroup.repeatedMessages = ungroupedMessages
      latestGroup.repeatCount++
      this.removeMessages(ungroupedMessages)
      this.updateGroup(latestGroup)
    }
  }

  /**
   * Creates a new group log element.
   */
  createNewGroup() {
    const ungroupedMessages = this.getLatestMessages()
    for (let start = ungroupedMessages.length - 1; start >= 1; start--) {
      for (let length = 1; start - 2 * length + 1 >= 0; length++) {
        const startIndex = start - length + 1
        const ungroupedMessagesRange1 = ungroupedMessages.slice(startIndex, startIndex + length)
        const startIndex2 = start - 2 * length + 1
        const ungroupedMessagesRange2 = ungroupedMessages.slice(startIndex2, startIndex2 + length)
        if (this.compareTypes(ungroupedMessagesRange1, ungroupedMessagesRange2)) {
          const group = {
            isGroup: true,
            repeatCount: 2,
            repeatedMessages: ungroupedMessagesRange2
          }
          this.messages.push(group)
          this.removeMessages(ungroupedMessagesRange1)
          this.removeMessages(ungroupedMessagesRange2)
          this.createElementForLogItem(group)
        }
      }
    }
  }

  /**
   * Returns the latest messages.
   * @returns {!Array.<Message>}
   */
  getLatestMessages() {
    const r = []
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i]
      if (message.isGroup) {
        return r
      }
      r.push(message)
    }
    return r
  }

  /**
   * Returns the latest group.
   * @returns {?MessageGroup}
   */
  getLatestGroup() {
    for (const message of this.messages) {
      if (message.isGroup) {
        return message
      }
    }
    return null
  }

  /**
   * @param {!Array.<Message>} m1
   * @param {!Array.<Message>} m2
   * @returns {boolean}
   */
  compareTypes(m1, m2) {
    if (m1.length !== m2.length) {
      return false
    }
    for (let i = 0; i < m1.length; i++) {
      if (m1[i].eventType !== m2[i].eventType) {
        return false
      }
    }
    return true
  }
}

/**
 * @typedef {Object} Message
 * @property {boolean} isGroup
 * @property {string} message
 * @property {Date} date
 * @property {string} eventType
 * @property {string} category
 * @property {HTMLElement} [element]
 */

/**
 * @typedef {Object} MessageGroup
 * @property {boolean} isGroup
 * @property {HTMLElement} [element]
 * @property {Array.<Message>} repeatedMessages
 * @property {number} repeatCount
 */
