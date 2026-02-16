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
/**
 * A type that describes the structure of the graph data that is imported.
 */
export type GraphData = {
  nodesSource: NodeData[]
  edgesSource: EdgeData[]
  groupsSource: GroupData[]
}

/**
 * A type that describes the structure of the node data.
 */
export type NodeData = { id: string; group?: string }

/**
 * A type that describes the structure of the group node data.
 */
export type GroupData = { id: string; label: string; parentGroup?: string; collapsed?: boolean }

/**
 * A type that describes the structure of the edge data.
 */
export type EdgeData = { from: string; to: string }

export const graphData: GraphData = {
  nodesSource: [
    { id: '00' },
    { id: '01' },
    { id: '10', group: 'group1' },
    { id: '11', group: 'group1' },
    { id: '12', group: 'group1' },
    { id: '20', group: 'group2' },
    { id: '21', group: 'group2' },
    { id: '22', group: 'group2' },
    { id: '30', group: 'group3' },
    { id: '31', group: 'group3' },
    { id: '40', group: 'group4' },
    { id: '41', group: 'group4' },
    { id: '42', group: 'group4' },
    { id: '50', group: 'group5' },
    { id: '51', group: 'group5' },
    { id: '60', group: 'group6' },
    { id: '61', group: 'group6' },
    { id: '62', group: 'group6' }
  ],

  edgesSource: [
    { from: '00', to: '01' },
    { from: '01', to: '10' },
    { from: '10', to: '11' },
    { from: '10', to: '50' },
    { from: '10', to: '12' },
    { from: '11', to: '20' },
    { from: '20', to: '21' },
    { from: '20', to: '30' },
    { from: '21', to: '12' },
    { from: '22', to: '12' },
    { from: '30', to: '31' },
    { from: '30', to: '40' },
    { from: '31', to: '21' },
    { from: '40', to: '41' },
    { from: '40', to: '31' },
    { from: '41', to: '42' },
    { from: '42', to: '31' },
    { from: '50', to: '60' },
    { from: '50', to: '51' },
    { from: '51', to: '12' },
    { from: '60', to: '61' },
    { from: '60', to: '62' },
    { from: '61', to: '12' },
    { from: '62', to: '12' },
    { from: '20', to: '50' }
  ],

  groupsSource: [
    { id: 'group1', label: 'group one' },
    { id: 'group2', parentGroup: 'group1', label: 'group two' },
    { id: 'group3', parentGroup: 'group2', label: 'group three', collapsed: true },
    { id: 'group4', parentGroup: 'group3', label: 'group four' },
    { id: 'group5', parentGroup: 'group1', label: 'group five' },
    { id: 'group6', parentGroup: 'group5', label: 'group six', collapsed: true }
  ]
}
