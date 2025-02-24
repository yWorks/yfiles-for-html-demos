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
import type { IEdge, INode } from '@yfiles/yfiles'

/**
 * Type that describes the format of the node data in this demo.
 * It is used for building the graph structure and contains information used for the node visualization.
 */
export type PoliticalParty = {
  /**
   * The id of the node.
   */
  id: number
  /**
   * The label text of the node.
   */
  name: string
  /**
   * The color id used for the node visualization.
   */
  colorId?: number
}

/**
 * Type that describes the format of the edge data in this demo.
 * It is used for building the graph structure and contains information used for the edge visualization.
 */
export type VoterShift = {
  /**
   * The source node of this edge.
   */
  source: number
  /**
   * The target node of this edge.
   */
  target: number
  /**
   * The number of voters that migrated between the two political parties that are connected by this edge.
   * This value will be used as label text for the edge, and for calculating the edge's thickness.
   */
  voters: number
  /**
   * The thickness of the edge that will be used for visualizing the edge and by the layout algorithm.
   * In this demo, the thickness is calculated by normalizing the 'voters' property described above.
   */
  thickness?: number
  /**
   * The color id used for the edge visualization.
   */
  colorId?: number
}

/**
 * Returns the data associated with the given node.
 */
export function getPoliticalParty(node: INode): PoliticalParty {
  return node.tag as PoliticalParty
}

/**
 * Returns the data associated with the given edge.
 */
export function getVoterShift(edge: IEdge): VoterShift {
  return edge.tag as VoterShift
}
