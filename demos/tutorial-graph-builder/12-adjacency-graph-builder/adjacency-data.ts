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
export const orgChartData: OrgChartEntry[] = [
  {
    id: '0',
    position: 'Chief Executive Officer',
    name: 'Eric Joplin',
    colleagues: ['0_0', '0_1']
  },
  {
    id: '0_0',
    position: 'Chief Executive Assistant',
    name: 'Gary Roberts',
    colleagues: ['0_0_0', '0_0_1']
  },
  {
    id: '0_0_0',
    position: 'Senior Executive Assistant',
    name: 'Alexander Burns'
  },
  {
    id: '0_0_1',
    position: 'Junior Executive Assistant',
    name: 'Linda Newland'
  },
  {
    id: '0_1',
    position: 'Vice President of Production',
    name: 'Amy Kain',
    colleagues: ['0_1_0']
  },
  {
    id: '0_1_0',
    position: 'Production Supervisor',
    name: 'Kathy Maxwell'
  }
]

export type OrgChartEntry = {
  id: string
  position: string
  name: string
  colleagues?: string[]
}
