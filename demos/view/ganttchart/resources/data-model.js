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
/**
 *  Type describing an activity in business data.
 *  The activity is associated with a task and must have start/end dates.
 * @typedef {Object} Activity
 * @property {number} [id]
 * @property {string} [name]
 * @property {number} taskId
 * @property {string} startDate
 * @property {string} endDate
 * @property {Array.<number>} [dependencies]
 * @property {number} [leadTime]
 * @property {number} [followUpTime]
 */

/**
 * Type describing a task in business data.
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} name
 */

/**
 * Type describing the data of this Gantt chart containing of tasks and activities.
 * @typedef {Object} ChartData
 * @property {string} originDate
 * @property {Array.<Task>} tasks
 * @property {Array.<Activity>} activities
 */

/**
 * Type-safe getter for activity data stored in the node tag.
 * @param {!INode} node
 * @returns {!Activity}
 */
export function getActivity(node) {
  return node.tag
}
