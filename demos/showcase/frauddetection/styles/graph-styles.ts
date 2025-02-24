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
// maps each node type with an object containing information about its style
import { getConnectionData, isFraud } from '../entity-data'
import type { IEdge } from '@yfiles/yfiles'

export const nodeStyleMapping: Record<string, { image: string; fill: string; stroke: string }> = {
  'Account Holder': { image: 'resources/icons/person.svg', fill: '#242265', stroke: '#242265' },
  Address: { image: 'resources/icons/address.svg', fill: '#4281a4', stroke: '#4281a4' },
  'Phone Number': { image: 'resources/icons/phone.svg', fill: '#6c4f77', stroke: '#6c4f77' },
  'Bank Branch': { image: 'resources/icons/bank.svg', fill: '#db3a34', stroke: '#db3a34' },
  'New Account': { image: 'resources/icons/new-account.svg', fill: '#f0c808', stroke: '#f0c808' },
  Loan: { image: 'resources/icons/loan.svg', fill: '#56926e', stroke: '#56926e' },
  'Credit Card': { image: 'resources/icons/credit-card.svg', fill: '#56926e', stroke: '#56926e' },
  Payment: { image: 'resources/icons/payment.svg', fill: '#6dbc8d', stroke: '#6dbc8d' },
  Participant: { image: 'resources/icons/person.svg', fill: '#c1c1c1', stroke: '#56926e' },
  Doctor: { image: 'resources/icons/doctor.svg', fill: '#c1c1c1', stroke: '#4281a4' },
  Lawyer: { image: 'resources/icons/lawyer.svg', fill: '#c1c1c1', stroke: '#242265' },
  Car: { image: 'resources/icons/car.svg', fill: '#c1c1c1', stroke: '#f0c808' },
  Accident: { image: 'resources/icons/accident.svg', fill: '#c1c1c1', stroke: '#db3a34' }
}

export const edgeStyleMapping: Record<string, string | undefined> = {
  witnesses: '#56926e',
  involves: '#db3a34',
  drives: '#2D4D3A',
  isPassenger: '#e0e04f',
  represents: '#242265',
  heals: '#4281a4',
  untyped: '#c1c1c1'
}

/**
 * Returns the color of the edge according to its type.
 */
export function getStroke(edge: IEdge): string {
  const connectionData = getConnectionData(edge)
  const type = connectionData.type ?? ''
  if (!type) {
    return isFraud(edge) ? '#ff6c00' : '#c1c1c1'
  }
  return edgeStyleMapping[type] ?? 'black'
}
