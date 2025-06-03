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
/**
 * This class creates an event log to display messages.
 */
export class EventView {
  private _logElement: HTMLElement | null = null
  groupEvents = true
  messages: (Message | MessageGroup)[] = []
  startDate: Date = new Date()

  /**
   * Returns the dom element that displays the log message.
   */
  get logElement(): HTMLElement {
    if (this._logElement === null) {
      this._logElement = document.getElementById('log')
    }
    return this._logElement!
  }

  /**
   * Clears the log element.
   */
  clear(): void {
    this.logElement.innerHTML = ''
    this.messages = []
    this.startDate = new Date()
  }

  /**
   * Adds the given text to the log element.
   * @param text The text to be added
   * @param eventType The type of the event
   * @param category The category of the event
   */
  addMessage(text: string, eventType: string, category: string): void {
    if (!eventType) {
      eventType = text
    }

    const message: Message = {
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
   * @param item The log message to create the element for
   */
  createElementForLogItem(item: Message | MessageGroup): void {
    if (item.isGroup) {
      item.element = this.createGroupElement()
      this.updateGroup(item)
    } else {
      const message = item
      message.element = this.createMessageElement(message)
    }
    this.appendElementToLog(item.element!)
  }

  /**
   * Appends the given element to the current log element.
   * @param element The element to be added
   */
  appendElementToLog(element: HTMLElement): void {
    const logElement = this.logElement
    if (logElement.childNodes.length === 0) {
      logElement.appendChild(element)
    } else {
      logElement.insertBefore(element, logElement.firstChild)
    }
  }

  /**
   * Creates an element group for the given group.
   */
  createGroupElement(): HTMLElement {
    const element = document.createElement('div')
    element.setAttribute('class', 'logGroup')
    return element
  }

  /**
   * Creates the log element for the given message.
   */
  createMessageElement(message: Message): HTMLElement {
    const element = document.createElement('div')
    element.setAttribute('class', `logMessage category-${message.category}`)
    element.textContent = this.getLogText(message)
    return element
  }

  /**
   * Updates the given element group.
   */
  updateGroup(group: MessageGroup): void {
    const element = group.element!
    element.innerHTML = ''

    const containerDiv = document.createElement('div')
    containerDiv.setAttribute('class', 'logGroup-container')

    const messageDiv = document.createElement('div')
    messageDiv.setAttribute('class', 'logGroup-messages')

    const groupedMessages = group.repeatedMessages
    for (let i = 0; i < groupedMessages.length; i++) {
      const message = groupedMessages[i]
      messageDiv.appendChild(message.element!)
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
   */
  getLogText(message: Message): string {
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

    function appendZeros(s: string, maxLength: number): string {
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
   */
  removeMessages(removeThese: Message[]): void {
    for (let i = 0; i < removeThese.length; i++) {
      this.removeLogItem(removeThese[i])
    }
  }

  /**
   * Removes the given log element from the dom.
   */
  removeLogItem(item: Message): void {
    const index = this.messages.indexOf(item)
    if (index > -1) {
      const element = item.element!
      element.parentNode!.removeChild(element)
      this.messages.splice(index, 1)
    }
  }

  /**
   * Merges the events.
   */
  mergeEvents(): void {
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
  createNewGroup(): void {
    const ungroupedMessages = this.getLatestMessages()
    for (let start = ungroupedMessages.length - 1; start >= 1; start--) {
      for (let length = 1; start - 2 * length + 1 >= 0; length++) {
        const startIndex = start - length + 1
        const ungroupedMessagesRange1 = ungroupedMessages.slice(startIndex, startIndex + length)
        const startIndex2 = start - 2 * length + 1
        const ungroupedMessagesRange2 = ungroupedMessages.slice(startIndex2, startIndex2 + length)
        if (this.compareTypes(ungroupedMessagesRange1, ungroupedMessagesRange2)) {
          const group: MessageGroup = {
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
   */
  getLatestMessages(): Message[] {
    const r = []
    const messages = this.messages
    for (let i = messages.length - 1; i > -1; --i) {
      const message = messages[i]
      if (message.isGroup) {
        return r
      }
      r.push(message)
    }
    return r
  }

  /**
   * Returns the latest group.
   */
  getLatestGroup(): MessageGroup | null {
    const messages = this.messages
    for (let i = messages.length - 1; i > -1; --i) {
      const message = messages[i]
      if (message.isGroup) {
        return message
      }
    }
    return null
  }

  compareTypes(m1: Message[], m2: Message[]): boolean {
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

interface Message {
  isGroup: false
  message: string
  date: Date
  eventType: string
  category: string
  element?: HTMLElement
}

interface MessageGroup {
  isGroup: true
  element?: HTMLElement
  repeatedMessages: Message[]
  repeatCount: number
}
