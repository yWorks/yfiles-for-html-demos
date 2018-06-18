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

define([], () => {
  /* @yjs:keep */
  const nodesSource = [
    {
      id: 0,
      group: 'group0',
      position: 'Chief Executive Officer',
      name: 'Eric Joplin',
      email: 'ejoplin@yoyodyne.com',
      phone: '555-0100',
      fax: '555-0101',
      businessUnit: 'Executive Unit',
      status: 'present',
      icon: '#usericon_male1'
    },
    {
      id: 1,
      group: 'group1',
      position: 'Vice President of Engineering',
      name: 'Mildred Shark',
      email: 'mshark@yoyodyne.com',
      phone: '555-0156',
      fax: '555-0157',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_female2'
    },
    {
      id: 2,
      group: 'group1',
      position: 'Engineering Manager',
      name: 'Martha Barnes',
      email: 'mbarnes@yoyodyne.com',
      phone: '555-0158',
      fax: '555-0159',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_female3'
    },
    {
      id: 3,
      group: 'group10',
      position: 'Senior Tool Designer',
      name: 'Maria Dossantos',
      email: 'mdossantos@yoyodyne.com',
      phone: '555-0160',
      fax: '555-0161',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_female1'
    },
    {
      id: 4,
      group: 'group10',
      position: 'Tool Designer',
      name: 'Hector Donald',
      email: 'hdonald@yoyodyne.com',
      phone: '555-0162',
      fax: '555-0163',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male2'
    },
    {
      id: 5,
      group: 'group10',
      position: 'Tool Designer',
      name: 'Michelle Douglas',
      email: 'mdouglas@yoyodyne.com',
      phone: '555-0228',
      fax: '555-0229',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_female3'
    },
    {
      id: 6,
      group: 'group10',
      position: 'Tool Designer',
      name: 'Bonnie Penney',
      email: 'bpenney@yoyodyne.com',
      phone: '555-0234',
      fax: '555-0235',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_female1'
    },
    {
      id: 7,
      group: 'group10',
      position: 'Tool Designer',
      name: 'Francis Webster',
      email: 'fwebster@yoyodyne.com',
      phone: '555-0236',
      fax: '555-0237',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male2'
    },
    {
      id: 8,
      group: 'group10',
      position: 'Tool Designer',
      name: 'Gregory Arnold',
      email: 'garnold@yoyodyne.com',
      phone: '555-0238',
      fax: '555-0239',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male3'
    },
    {
      id: 9,
      group: 'group11',
      position: 'Senior Design Engineer',
      name: 'Laurie Aitken',
      email: 'laitken@yoyodyne.com',
      phone: '555-0164',
      fax: '555-0165',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_female2'
    },
    {
      id: 10,
      group: 'group11',
      position: 'Design Engineer',
      name: 'Carla Clark',
      email: 'cclark@yoyodyne.com',
      phone: '555-0242',
      fax: '555-0243',
      businessUnit: 'Engineering',
      status: 'unavailable',
      icon: '#usericon_female3'
    },
    {
      id: 11,
      group: 'group11',
      position: 'Design Engineer',
      name: 'Cynthia Judd',
      email: 'cjudd@yoyodyne.com',
      phone: '555-0244',
      fax: '555-0245',
      businessUnit: 'Engineering',
      status: 'unavailable',
      icon: '#usericon_female1'
    },
    {
      id: 12,
      group: 'group11',
      position: 'Design Engineer',
      name: 'Robert Finn',
      email: 'rfinn@yoyodyne.com',
      phone: '555-0246',
      fax: '555-0247',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male2'
    },
    {
      id: 13,
      group: 'group11',
      position: 'Design Engineer',
      name: 'Willie Schaub',
      email: 'wschaub@yoyodyne.com',
      phone: '555-0248',
      fax: '555-0249',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male3'
    },
    {
      id: 14,
      group: 'group11',
      position: 'Design Engineer',
      name: 'Edwin Nagy',
      email: 'enagy@yoyodyne.com',
      phone: '555-0166',
      fax: '555-0167',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male1'
    },
    {
      id: 15,
      group: 'group12',
      position: 'R & D Manager',
      name: 'John Payne',
      email: 'jpayne@yoyodyne.com',
      phone: '555-0168',
      fax: '555-0169',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male2'
    },
    {
      id: 16,
      group: 'group12',
      position: 'R & D Engineer',
      name: 'Rana Oxborough',
      email: 'roxborough@yoyodyne.com',
      phone: '555-0176',
      fax: '555-0177',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_female3'
    },
    {
      id: 17,
      group: 'group12',
      position: 'R & D Engineer',
      name: 'Gary Olsen',
      email: 'golsen@yoyodyne.com',
      phone: '555-0178',
      fax: '555-0179',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male1'
    },
    {
      id: 18,
      group: 'group12',
      position: 'R & D Engineer',
      name: 'Matthew Finney',
      email: 'mfinney@yoyodyne.com',
      phone: '555-0206',
      fax: '555-0207',
      businessUnit: 'Engineering',
      status: 'travel',
      icon: '#usericon_male2'
    },
    {
      id: 19,
      group: 'group12',
      position: 'R & D Engineer',
      name: 'Julius Kelly',
      email: 'jkelly@yoyodyne.com',
      phone: '555-0208',
      fax: '555-0209',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male3'
    },
    {
      id: 20,
      group: 'group12',
      position: 'R & D Engineer',
      name: 'Charles Wylam',
      email: 'cwylam@yoyodyne.com',
      phone: '555-0212',
      fax: '555-0213',
      businessUnit: 'Engineering',
      status: 'present',
      icon: '#usericon_male1'
    }
  ]
  const edgesSource = [
    {
      fromNode: 0,
      toNode: 1
    },
    {
      fromNode: 1,
      toNode: 2
    },
    {
      fromNode: 2,
      toNode: 3
    },
    {
      fromNode: 2,
      toNode: 9
    },
    {
      fromNode: 2,
      toNode: 15
    },
    {
      fromNode: 3,
      toNode: 4
    },
    {
      fromNode: 3,
      toNode: 5
    },
    {
      fromNode: 3,
      toNode: 6
    },
    {
      fromNode: 3,
      toNode: 7
    },
    {
      fromNode: 3,
      toNode: 8
    },
    {
      fromNode: 9,
      toNode: 10
    },
    {
      fromNode: 9,
      toNode: 11
    },
    {
      fromNode: 9,
      toNode: 12
    },
    {
      fromNode: 9,
      toNode: 13
    },
    {
      fromNode: 9,
      toNode: 14
    },
    {
      fromNode: 15,
      toNode: 16
    },
    {
      fromNode: 15,
      toNode: 17
    },
    {
      fromNode: 15,
      toNode: 18
    },
    {
      fromNode: 15,
      toNode: 19
    },
    {
      fromNode: 15,
      toNode: 20
    }
  ]
  const groupsSource = [
    { id: 'group0' },
    { id: 'group1' },
    {
      id: 'group10',
      parentGroup: 'group1'
    },
    {
      id: 'group11',
      parentGroup: 'group1'
    },
    {
      id: 'group12',
      parentGroup: 'group1'
    }
  ]

  return {
    nodesSource,
    edgesSource,
    groupsSource
  }
})
