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
import {
  AlignmentStage,
  type AlignmentStageAlignmentPolicy,
  type ILayoutAlgorithm
} from '@yfiles/yfiles'

/**
 * Represents the set of configuration settings available for the {@link AlignmentStage}
 * layout algorithm.
 */
export type LayoutSettings = {
  /**
   * The axis, parallel to which the nodes are aligned.
   */
  alignmentPolicy: AlignmentStageAlignmentPolicy
  /**
   * The minimum distance between two nodes.
   */
  minimumNodeDistance: number
  /**
   * The maximum distance between two nodes when they are aligned on the same line.
   */
  snapDistance: number
  /**
   * Determines whether nodes are placed in strictly separated rows and columns.
   */
  separateStripes: boolean
}

/**
 * Creates a new instance of the {@link AlignmentStage} layout algorithm with the given settings.
 */
export function createConfiguredLayoutAlgorithm(settings: LayoutSettings): ILayoutAlgorithm {
  return new AlignmentStage({
    alignmentPolicy: settings.alignmentPolicy,
    minimumNodeDistance: settings.minimumNodeDistance,
    snapDistance: settings.snapDistance,
    separateStripes: settings.separateStripes
  })
}

/**
 * Creates a new instance of {@link LayoutSettings} with the default values of the
 * {@link AlignmentStage} layout algorithm.
 */
export function createDefaultSettings(): LayoutSettings {
  const algorithm = new AlignmentStage()
  return {
    alignmentPolicy: algorithm.alignmentPolicy,
    minimumNodeDistance: algorithm.minimumNodeDistance,
    snapDistance: algorithm.snapDistance,
    separateStripes: algorithm.separateStripes
  }
}
