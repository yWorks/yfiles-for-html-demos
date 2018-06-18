/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define([
  'yfiles/view-layout-bridge'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Provides type constants and corresponding <code>isXYZType()</code> methods for Flowchart symbols.
   * These constants and
   * methods are used by {@link FlowchartLayout} and its associated classes to identify specific nodes and handle them
   * appropriately.
   * ImplicitNumericConversion
   */
  class FlowchartElements {
    /**
     * {@link yfiles.algorithms.IDataProvider} key used to specify the flowchart specific type of each node.
     * Valid are all node type constants specified by class {@link FlowchartElements}.
     * @type {Object}
     */
    static get NODE_TYPE_DP_KEY() {
      return 'FlowchartLayout.NODE_TYPE_DP_KEY'
    }

    /**
     * {@link yfiles.algorithms.IDataProvider} key used to specify the flowchart specific type of each edge.
     * Valid are all edge type constants specified by class {@link FlowchartElements}.
     * @type {Object}
     */
    static get EDGE_TYPE_DP_KEY() {
      return 'FlowchartLayout.EDGE_TYPE_DP_KEY'
    }

    /**
     * Type constant for an invalid type.
     * @type {number}
     */
    static get TYPE_INVALID() {
      return 0
    }

    /**
     * Type constant for an event type.
     * @type {number}
     */
    static get NODE_TYPE_EVENT() {
      return 1
    }

    /**
     * Type constant for a start event type.
     * @type {number}
     */
    static get NODE_TYPE_START_EVENT() {
      return 7
    }

    /**
     * Type constant for a end event type.
     * @type {number}
     */
    static get NODE_TYPE_END_EVENT() {
      return 9
    }

    /**
     * Type constant for a decision type.
     * @type {number}
     */
    static get NODE_TYPE_DECISION() {
      return 2
    }

    /**
     * Type constant for a process type.
     * @type {number}
     */
    static get NODE_TYPE_PROCESS() {
      return 3
    }

    /**
     * Type constant for a group type.
     * @type {number}
     */
    static get NODE_TYPE_GROUP() {
      return 8
    }

    /**
     * Type constant for a annotation type.
     * @type {number}
     */
    static get NODE_TYPE_ANNOTATION() {
      return 10
    }

    /**
     * Type constant for a pool type.
     * @type {number}
     */
    static get NODE_TYPE_POOL() {
      return 12
    }

    /**
     * Type constant for a data type.
     * @type {number}
     */
    static get NODE_TYPE_DATA() {
      return 11
    }

    /**
     * Type constant for a connection type (sequence flow).
     * @type {number}
     */
    static get EDGE_TYPE_SEQUENCE_FLOW() {
      return 4
    }

    /**
     * Type constant for a connection type (message flow).
     * @type {number}
     */
    static get EDGE_TYPE_MESSAGE_FLOW() {
      return 5
    }

    /**
     * Type constant for a connection type (association).
     * @type {number}
     */
    static get EDGE_TYPE_ASSOCIATION() {
      return 6
    }

    /**
     * Returns true for activity nodes.
     * For Flowcharts, this are Process, Data, and Group. For BPMN, this are Task and
     * Sub-Process.
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Node} node
     * @return {boolean}
     */
    static isActivity(graph, node) {
      const type = FlowchartElements.getType1(graph, node)
      return (
        type === FlowchartElements.NODE_TYPE_PROCESS ||
        type === FlowchartElements.NODE_TYPE_DATA ||
        type === FlowchartElements.NODE_TYPE_GROUP
      )
    }

    /**
     * Returns true for group nodes.
     * For BPMN, this is Sub-Process.
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Node} node
     * @return {boolean}
     */
    static isGroup(graph, node) {
      return FlowchartElements.getType1(graph, node) === FlowchartElements.NODE_TYPE_GROUP
    }

    /**
     * Returns true for annotation nodes.
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Node} node
     * @return {boolean}
     */
    static isAnnotation(graph, node) {
      return FlowchartElements.getType1(graph, node) === FlowchartElements.NODE_TYPE_ANNOTATION
    }

    /**
     * Returns true for event nodes.
     * For Flowchart, this are start and terminator, delay, display, manual operation and
     * preparation. For BPMN, this are start, end and other events.
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Node} node
     * @return {boolean}
     */
    static isEvent(graph, node) {
      const type = FlowchartElements.getType1(graph, node)
      return (
        type === FlowchartElements.NODE_TYPE_START_EVENT ||
        type === FlowchartElements.NODE_TYPE_EVENT ||
        type === FlowchartElements.NODE_TYPE_END_EVENT
      )
    }

    /**
     * Returns true for start event nodes.
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Node} node
     * @return {boolean}
     */
    static isStartEvent(graph, node) {
      return FlowchartElements.getType1(graph, node) === FlowchartElements.NODE_TYPE_START_EVENT
    }

    /**
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Edge} edge
     * @return {boolean}
     */
    static isUndefined(graph, edge) {
      return FlowchartElements.getType(graph, edge) === FlowchartElements.TYPE_INVALID
    }

    /**
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Edge} edge
     * @return {boolean}
     */
    static isRegularEdge(graph, edge) {
      return FlowchartElements.getType(graph, edge) === FlowchartElements.EDGE_TYPE_SEQUENCE_FLOW
    }

    /**
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Edge} edge
     * @return {boolean}
     */
    static isMessageFlow(graph, edge) {
      return FlowchartElements.getType(graph, edge) === FlowchartElements.EDGE_TYPE_MESSAGE_FLOW
    }

    /**
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Edge} edge
     * @return {number}
     */
    static getType(graph, dataHolder) {
      const dataProvider = graph.getDataProvider(FlowchartElements.EDGE_TYPE_DP_KEY)
      return dataProvider === null
        ? FlowchartElements.TYPE_INVALID
        : dataProvider.getInt(dataHolder)
    }

    /**
     * @param {yfiles.algorithms.Graph} graph
     * @param {yfiles.algorithms.Node} dataHolder
     * @return {number}
     */
    static getType1(graph, dataHolder) {
      const dataProvider = graph.getDataProvider(FlowchartElements.NODE_TYPE_DP_KEY)
      return dataProvider === null
        ? FlowchartElements.TYPE_INVALID
        : dataProvider.getInt(dataHolder)
    }
  }

  return FlowchartElements
})
