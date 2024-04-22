/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

/**
 * Yields all "days" in the given interval.
 * @yields {LabeledTimeInterval}
 * @param {!Date} start
 * @param {!Date} end
 * @returns {!Iterable.<LabeledTimeInterval>}
 */
export function* days(start, end) {
  const floor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const ceiling = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)

  for (let currentDate = new Date(floor); currentDate < ceiling; ) {
    const start = new Date(currentDate)
    currentDate.setDate(currentDate.getDate() + 1)
    const end = new Date(currentDate)
    yield [start, end, String(start.getDate())]
  }
}

/**
 * Yields all "weeks" in the given interval.
 * @yields {LabeledTimeInterval}
 * @param {!Date} start
 * @param {!Date} end
 * @returns {!Iterable.<LabeledTimeInterval>}
 */
export function* weeks(start, end) {
  const floor = new Date(start.getFullYear(), start.getMonth(), 1)
  const ceiling = new Date(end.getFullYear(), end.getMonth() + 1, 1)

  let week = 1
  for (let currentDate = new Date(floor); currentDate < ceiling; ) {
    const start = new Date(currentDate)
    const label = String(week)
    currentDate.setDate(currentDate.getDate() + 7)
    if (
      currentDate.getMonth() > start.getMonth() ||
      currentDate.getFullYear() > start.getFullYear() /* Dec -> Jan */
    ) {
      currentDate.setDate(1)
      week = 0
    }
    const end = new Date(currentDate)
    yield [start, end, label]
    week++
  }
}

/**
 * Yields all "months" in the given interval.
 * @yields {LabeledTimeInterval}
 * @param {!Date} start
 * @param {!Date} end
 * @returns {!Iterable.<LabeledTimeInterval>}
 */
export function* months(start, end) {
  const floor = new Date(start.getFullYear(), start.getMonth(), 1)
  const ceiling = new Date(end.getFullYear(), end.getMonth() + 1, 1)

  for (let currentDate = new Date(floor); currentDate < ceiling; ) {
    const start = new Date(currentDate)
    currentDate.setMonth(currentDate.getMonth() + 1)
    const end = new Date(currentDate)
    yield [start, end, MONTHS[start.getMonth()]]
  }
}

/**
 * Yields all "years" in the given interval.
 * @yields {LabeledTimeInterval}
 * @param {!Date} start
 * @param {!Date} end
 * @returns {!Iterable.<LabeledTimeInterval>}
 */
export function* years(start, end) {
  const floor = new Date(start.getFullYear(), 0, 1)
  const ceiling = new Date(end.getFullYear() + 1, 0, 1)

  for (let currentDate = new Date(floor); currentDate < ceiling; ) {
    const start = new Date(currentDate)
    currentDate.setFullYear(currentDate.getFullYear() + 1)
    const end = new Date(currentDate)
    yield [start, end, String(start.getFullYear())]
  }
}

/**
 * @param {!Date} [start]
 * @param {!Date} [end]
 * @returns {!Iterable.<LabeledTimeInterval>}
 */
export function* allTime(start, end) {
  yield [start ?? new Date(Date.UTC(0, 0)), end ?? new Date(Date.UTC(5000, 0)), 'All Time']
}

/**
 * @template {(number|Date)} T
 * @param {!T} start1
 * @param {!T} end1
 * @param {!T} start2
 * @param {!T} end2
 * @returns {boolean}
 */
export function intervalsIntersect(start1, end1, start2, end2) {
  return !(end1 <= start2 || start1 >= end2)
}

/**
 * @param {!TimeInterval} undefined
 * @param {!TimeInterval} undefined
 * @returns {boolean}
 */
export function timeframeEquals([start1, end1], [start2, end2]) {
  return start1.getTime() === start2.getTime() && end1.getTime() === end2.getTime()
}
