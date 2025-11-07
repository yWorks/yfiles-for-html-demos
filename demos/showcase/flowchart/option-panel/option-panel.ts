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
import { addNavigationButtons } from '@yfiles/demo-app/demo-page'
import { BranchDirection } from '../layout/FlowchartLayout'
import type { InEdgeGrouping } from '../layout/FlowchartLayoutData'
import type { LayoutOptions } from '../layout/layout-flowchart'
import type { Sample } from '../model/load-flowchart'

const initialOptions: Record<Sample, LayoutOptions> = {
  ProblemSolving: {
    positiveBranch: BranchDirection.Undefined,
    negativeBranch: BranchDirection.Undefined,
    inEdgeGrouping: 'optimized',
    allowFlatwiseEdges: true
  },
  StudentRegistration: {
    positiveBranch: BranchDirection.WithTheFlow,
    negativeBranch: BranchDirection.LeftInFlow,
    inEdgeGrouping: 'optimized',
    allowFlatwiseEdges: true
  },
  eCommerce: {
    positiveBranch: BranchDirection.WithTheFlow,
    negativeBranch: BranchDirection.Flatwise,
    inEdgeGrouping: 'optimized',
    allowFlatwiseEdges: true
  },
  ComputingFactorial: {
    positiveBranch: BranchDirection.WithTheFlow,
    negativeBranch: BranchDirection.Flatwise,
    inEdgeGrouping: 'optimized',
    allowFlatwiseEdges: true
  },
  LargestNumber: {
    positiveBranch: BranchDirection.Flatwise,
    negativeBranch: BranchDirection.Flatwise,
    inEdgeGrouping: 'none',
    allowFlatwiseEdges: false
  }
}

const sample = document.querySelector<HTMLSelectElement>('#select-sample')!
const positiveBranch = document.querySelector<HTMLSelectElement>('#positive-branch-direction')!
const negativeBranch = document.querySelector<HTMLSelectElement>('#negative-branch-direction')!
const inEdgeGrouping = document.querySelector<HTMLSelectElement>('#in-edge-grouping')!
const allowFlatwiseEdges = document.querySelector<HTMLInputElement>('#allow-flatwise-edges')!
const layoutButton = document.querySelector<HTMLButtonElement>('#layout-button')!

export function initializeOptionPanel(sampleChanged: () => void, layoutPressed: () => void): void {
  addNavigationButtons(sample, true, false, 'select-button')

  sample.addEventListener('change', () => {
    const options = initialOptions[sample.value as Sample]
    positiveBranch.value = String(options.positiveBranch)
    negativeBranch.value = String(options.negativeBranch)
    inEdgeGrouping.value = options.inEdgeGrouping
    allowFlatwiseEdges.checked = options.allowFlatwiseEdges
    sampleChanged()
  })

  layoutButton.addEventListener('click', () => layoutPressed())
}

export function getLayoutOptions(): LayoutOptions {
  return {
    positiveBranch: Number(positiveBranch.value) as BranchDirection,
    negativeBranch: Number(negativeBranch.value) as BranchDirection,
    inEdgeGrouping: inEdgeGrouping.value as InEdgeGrouping,
    allowFlatwiseEdges: allowFlatwiseEdges.checked
  }
}

export function getSample(): Sample {
  return sample.value as Sample
}

export function enableUI(value: boolean): void {
  sample.disabled = !value
  positiveBranch.disabled = !value
  negativeBranch.disabled = !value
  inEdgeGrouping.disabled = !value
  allowFlatwiseEdges.disabled = !value
  layoutButton.disabled = !value
}
