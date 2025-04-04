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
 * Enumeration that specifies the supported types of neighborhood graphs to be shown in the
 * demo's {@link NeighborhoodView}.
 */
export var NeighborhoodType
;(function (NeighborhoodType) {
  /**
   * The neighbors of a given node are all connected nodes. The direction of the edges connecting
   * neighbor nodes to the given node does not matter.
   * The union of all predecessor nodes and all successor nodes.
   * For a graph distance of 1, mode NEIGHBORHOOD yields the same result as mode {@link BOTH}.
   */
  NeighborhoodType[(NeighborhoodType['NEIGHBORHOOD'] = 0)] = 'NEIGHBORHOOD'
  /**
   * The neighbors of a given node are the source nodes of the given node's incoming edges.
   */
  NeighborhoodType[(NeighborhoodType['PREDECESSORS'] = 1)] = 'PREDECESSORS'
  /**
   * The neighbors of a given node are the target nodes of the given node's outgoing edges.
   */
  NeighborhoodType[(NeighborhoodType['SUCCESSORS'] = 2)] = 'SUCCESSORS'
  /**
   * The union of all predecessor nodes and all successor nodes.
   * For a graph distance of 1, mode BOTH yields the same result as mode {@link NEIGHBORHOOD}.
   */
  NeighborhoodType[(NeighborhoodType['BOTH'] = 3)] = 'BOTH'
  /**
   * The neighbors of a given node are the node's child nodes.
   * Thus only group and folder nodes (i.e. collapsed group nodes) can have this type of neighbors.
   */
  NeighborhoodType[(NeighborhoodType['FOLDER_CONTENTS'] = 4)] = 'FOLDER_CONTENTS'
})(NeighborhoodType || (NeighborhoodType = {}))
