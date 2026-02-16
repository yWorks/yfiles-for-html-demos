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
export type FullNodeData = {
  position: string
  name: string
  email: string
  phone: string
  fax: string
  businessUnit: string
  status: 'unavailable' | 'travel' | 'busy' | 'present'
  icon: string
  assistant?: boolean
  layout: { x: number; y: number }
  id: string
}

export type NodeData = Omit<FullNodeData, 'layout' | 'id'>

export default {
  nodes: [
    {
      position: 'Quality Manager',
      name: 'Dorothy Turner',
      email: 'dturner@yoyodyne.com',
      phone: '555-0108',
      fax: '555-0109',
      businessUnit: 'Production',
      status: 'unavailable',
      icon: 'usericon_female3',
      layout: { x: 237.5, y: 0 },
      id: '0'
    },
    {
      position: 'Quality Supervisor',
      name: 'Valerie Burnett',
      email: 'vburnett@yoyodyne.com',
      phone: '555-0110',
      fax: '555-0111',
      businessUnit: 'Production',
      status: 'present',
      icon: 'usericon_female1',
      layout: { x: 0, y: 161 },
      id: '1'
    },
    {
      position: 'Quality Technician',
      name: 'Martin Cornett',
      email: 'mcornett@yoyodyne.com',
      phone: '555-0114',
      fax: '555-0115',
      businessUnit: 'Production',
      status: 'busy',
      icon: 'usericon_male2',
      layout: { x: 0, y: 322 },
      id: '2'
    },
    {
      position: 'Document Control Manager',
      name: 'Edward Monge',
      email: 'emonge@yoyodyne.com',
      phone: '555-0118',
      fax: '555-0119',
      businessUnit: 'Production',
      status: 'present',
      icon: 'usericon_male3',
      layout: { x: 475, y: 161 },
      id: '3'
    },
    {
      position: 'Control Specialist',
      name: 'Howard Meyer',
      email: 'hmeyer@yoyodyne.com',
      phone: '555-0116',
      fax: '555-0117',
      businessUnit: 'Production',
      status: 'present',
      icon: 'usericon_male1',
      layout: { x: 475, y: 442 },
      id: '4'
    },
    {
      position: 'Document Control Assistant',
      name: 'Lisa Jensen',
      email: 'ljensen@yoyodyne.com',
      phone: '555-0120',
      fax: '555-0121',
      businessUnit: 'Production',
      status: 'travel',
      icon: 'usericon_female2',
      id: '5',
      layout: { x: 310, y: 281 },
      assistant: true
    }
  ] satisfies FullNodeData[],

  edges: [
    {
      src: '0',
      tgt: '1',
      bends: [
        { x: 382.5, y: 141 },
        { x: 145, y: 141 }
      ]
    },
    {
      src: '0',
      tgt: '3',
      bends: [
        { x: 382.5, y: 141 },
        { x: 620, y: 141 }
      ]
    },
    { src: '1', tgt: '2' },
    { src: '3', tgt: '4' },
    { src: '3', tgt: '5', bends: [{ x: 620, y: 331 }] }
  ]
}
