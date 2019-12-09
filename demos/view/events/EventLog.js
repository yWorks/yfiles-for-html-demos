/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
/**
 * @typedef {object} LogItem
 * @property {string} isGroup
 * @property {HTMLElement} element
 */

/**
 * @typedef {LogItem} LogMessage
 * @property {string} message
 * @property {date} date
 * @property {string} eventType
 * @property {string} category
 */

/**
 * @typedef {LogItem} LogGroup
 * @property {Array.<LogMessage>} repeatedMessages
 * @property {number} repeatCount
 */

/**
 * This class creates an event log to display messages.
 */
export default class EventLog {
  /**
   * Creates a new instance of <code>EventLog</code>.
   */
  constructor() {
    this.$logElement = null
    this.groupEvents = true
    this.messages = []
    this.startDate = new Date()
  }

  /**
   * Returns the dom element that displays the log message.
   * @returns {HTMLElement}
   */
  get logElement() {
    if (this.$logElement === null) {
      this.$logElement = document.getElementById('log')
    }
    return this.$logElement
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
   * @param {string} text The text to be added
   * @param {EventArgs} eventType The type of the event
   * @param {string} category The category of the event
   */
  addMessage(text, eventType, category) {
    if (typeof eventType === 'undefined') {
      eventType = text
    }
    const /** @type {LogMessage} */ message = {
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
   * @param {object} item The log message to create the element for
   */
  createElementForLogItem(item) {
    if (item.isGroup) {
      const /** @type {LogGroup} */ group = item
      group.element = this.createGroupElement(group)
      this.updateGroup(group)
    } else {
      const /** @type {LogMessage} */ message = item
      message.element = this.createMessageElement(message)
    }
    this.appendElementToLog(item.element)
  }

  /**
   * Appends the given element to the current log element.
   * @param {HTMLElement} element The element to be added
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
   * @param {object} group
   * @return {HTMLElement}
   */
  createGroupElement(group) {
    const element = document.createElement('div')
    element.setAttribute('class', 'logGroup')
    return element
  }

  /**
   * Creates the log element for the given message.
   * @param {object} message
   * @return {HTMLElement}
   */
  createMessageElement(message) {
    const element = document.createElement('div')
    element.setAttribute('class', `logMessage category-${message.category}`)
    element.textContent = this.getLogText(message)
    return element
  }

  /**
   * Updates the given element group.
   * @param {object} group
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
    countDiv.textContent = group.repeatCount
    containerDiv.appendChild(countDiv)

    element.appendChild(containerDiv)
  }

  /**
   * Returns the text of the given message.
   * @param {object} message
   * @return {string}
   */
  getLogText(message) {
    const dateDiff = message.date - this.startDate
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
   * @param {object} removeThese
   */
  removeMessages(removeThese) {
    for (let i = 0; i < removeThese.length; i++) {
      this.removeLogItem(removeThese[i])
    }
  }

  /**
   * Removes the given log element from the dom.
   * @param {object} item
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
    const /** @type {LogGroup} */ latestGroup = this.getLatestGroup()
    if (latestGroup == null) {
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
          const /** @type {LogGroup} */ group = {
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
   * @returns {Array}
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
   * @returns {object | null}
   */
  getLatestGroup() {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i]
      if (message.isGroup) {
        return message
      }
    }
    return null
  }

  /**
   * @param {Array} types1
   * @param {Array} types2
   * @returns {boolean}
   */
  compareTypes(types1, types2) {
    if (types1.length !== types2.length) {
      return false
    }
    for (let i = 0; i < types1.length; i++) {
      if (types1[i].eventType !== types2[i].eventType) {
        return false
      }
    }
    return true
  }
}
