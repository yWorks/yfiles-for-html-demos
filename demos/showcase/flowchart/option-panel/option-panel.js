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
import { addNavigationButtons } from 'demo-resources/demo-page'
import { BranchDirection } from '../layout/FlowchartLayout.js'

const initialOptions = {
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

const sample = document.querySelector('#select-sample')
const positiveBranch = document.querySelector('#positive-branch-direction')
const negativeBranch = document.querySelector('#negative-branch-direction')
const inEdgeGrouping = document.querySelector('#in-edge-grouping')
const allowFlatwiseEdges = document.querySelector('#allow-flatwise-edges')
const layoutButton = document.querySelector('#layout-button')

/**
 * @param {!function} sampleChanged
 * @param {!function} layoutPressed
 */
export function initializeOptionPanel(sampleChanged, layoutPressed) {
  addNavigationButtons(sample, true, false, 'select-button')

  sample.addEventListener('change', () => {
    const options = initialOptions[sample.value]
    positiveBranch.value = String(options.positiveBranch)
    negativeBranch.value = String(options.negativeBranch)
    inEdgeGrouping.value = options.inEdgeGrouping
    allowFlatwiseEdges.checked = options.allowFlatwiseEdges
    sampleChanged()
  })

  layoutButton.addEventListener('click', () => layoutPressed())
}

/**
 * @returns {!LayoutOptions}
 */
export function getLayoutOptions() {
  return {
    positiveBranch: Number(positiveBranch.value),
    negativeBranch: Number(negativeBranch.value),
    inEdgeGrouping: inEdgeGrouping.value,
    allowFlatwiseEdges: allowFlatwiseEdges.checked
  }
}

/**
 * @returns {!Sample}
 */
export function getSample() {
  return sample.value
}

/**
 * @param {boolean} value
 */
export function enableUI(value) {
  sample.disabled = !value
  positiveBranch.disabled = !value
  negativeBranch.disabled = !value
  inEdgeGrouping.disabled = !value
  allowFlatwiseEdges.disabled = !value
  layoutButton.disabled = !value
}
