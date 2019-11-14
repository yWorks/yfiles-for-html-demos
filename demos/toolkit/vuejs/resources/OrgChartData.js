/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

//
// The JSON model data for the organization chart example.
// Class yfiles.binding.TreeSource automatically creates
// a yFiles graph model from this data.
//
define([], () => [
  {
    position: 'Chief Executive Officer',
    name: 'Eric Joplin',
    email: 'ejoplin@yoyodyne.com',
    phone: '555-0100',
    fax: '555-0101',
    businessUnit: 'Executive Unit',
    status: 'present',
    icon: 'usericon_male1',
    subordinates: [
      {
        position: 'Chief Executive Assistant',
        name: 'Gary Roberts',
        layout: 'leftHanging',
        email: 'groberts@yoyodyne.com',
        phone: '555-0100',
        fax: '555-0101',
        businessUnit: 'Executive Unit',
        status: 'present',
        icon: 'usericon_male2',
        assistant: true,
        subordinates: [
          {
            position: 'Senior Executive Assistant',
            name: 'Alexander Burns',
            email: 'aburns@yoyodyne.com',
            phone: '555-0102',
            fax: '555-0103',
            businessUnit: 'Executive Unit',
            status: 'present',
            icon: 'usericon_male3'
          },
          {
            position: 'Junior Executive Assistant',
            name: 'Linda Newland',
            email: 'lnewland@yoyodyne.com',
            phone: '555-0112',
            fax: '555-0113',
            businessUnit: 'Executive Unit',
            status: 'present',
            icon: 'usericon_female1'
          }
        ]
      },
      {
        position: 'Vice President of Production',
        name: 'Amy Kain',
        email: 'akain@yoyodyne.com',
        phone: '555-0106',
        fax: '555-0107',
        businessUnit: 'Production',
        status: 'unavailable',
        icon: 'usericon_female2',
        subordinates: [
          {
            position: 'Quality Assurance Manager',
            name: 'Dorothy Turner',
            email: 'dturner@yoyodyne.com',
            phone: '555-0108',
            fax: '555-0109',
            businessUnit: 'Production',
            status: 'unavailable',
            icon: 'usericon_female3',
            subordinates: [
              {
                position: 'Quality Assurance Supervisor',
                name: 'Valerie Burnett',
                email: 'vburnett@yoyodyne.com',
                phone: '555-0110',
                fax: '555-0111',
                businessUnit: 'Production',
                status: 'present',
                icon: 'usericon_female1',
                subordinates: [
                  {
                    position: 'Quality Assurance Technician',
                    name: 'Martin Cornett',
                    email: 'mcornett@yoyodyne.com',
                    phone: '555-0114',
                    fax: '555-0115',
                    businessUnit: 'Production',
                    status: 'present',
                    icon: 'usericon_male2'
                  }
                ]
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
                subordinates: [
                  {
                    position: 'Control Specialist',
                    name: 'Howard Meyer',
                    email: 'hmeyer@yoyodyne.com',
                    phone: '555-0116',
                    fax: '555-0117',
                    businessUnit: 'Production',
                    status: 'present',
                    icon: 'usericon_male1'
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
                    assistant: true
                  }
                ]
              }
            ]
          },
          {
            position: 'Master Scheduler',
            name: 'Larry Littlefield',
            email: 'llittlefield@yoyodyne.com',
            phone: '555-0126',
            fax: '555-0127',
            businessUnit: 'Production',
            status: 'present',
            icon: 'usericon_male4',
            subordinates: [
              {
                position: 'Scheduling Assistant',
                name: 'Rico Cronin',
                email: 'rcronin@yoyodyne.com',
                phone: '555-0128',
                fax: '555-0129',
                businessUnit: 'Production',
                status: 'present',
                icon: 'usericon_male1',
                assistant: true
              }
            ]
          },
          {
            position: 'Facilities Manager',
            name: 'Anne Binger',
            email: 'abinger@yoyodyne.com',
            phone: '555-0122',
            fax: '555-0123',
            businessUnit: 'Production',
            status: 'present',
            icon: 'usericon_female4',
            subordinates: [
              {
                position: 'Facilities Administrative Assistant',
                layout: 'rightHanging',
                name: 'Timothy Jackson',
                email: 'tjackson@yoyodyne.com',
                phone: '555-0140',
                fax: '555-0141',
                businessUnit: 'Production',
                status: 'busy',
                icon: 'usericon_male5',
                subordinates: [
                  {
                    layout: 'rightHanging',
                    position: 'Maintenance Supervisor',
                    name: 'Carmen Shortened',
                    email: 'cshortened@yoyodyne.com',
                    phone: '555-0142',
                    fax: '555-0143',
                    businessUnit: 'Production',
                    status: 'present',
                    icon: 'usericon_female1'
                  },
                  {
                    position: 'Janitor',
                    name: 'Thomas Stark',
                    email: 'tstark@yoyodyne.com',
                    phone: '555-0144',
                    fax: '555-0145',
                    businessUnit: 'Production',
                    status: 'present',
                    icon: 'usericon_male2'
                  }
                ]
              }
            ]
          },
          {
            position: 'Shipping and Receiving Supervisor',
            layout: 'rightHanging',
            name: 'Ray Hammond',
            email: 'rhammond@yoyodyne.com',
            phone: '555-0146',
            fax: '555-0147',
            businessUnit: 'Production',
            status: 'travel',
            icon: 'usericon_male3',
            subordinates: [
              {
                position: 'Shipping and Receiving Clerk',
                name: 'Bob Lacey',
                email: 'blacey@yoyodyne.com',
                phone: '555-0124',
                fax: '555-0125',
                businessUnit: 'Production',
                status: 'travel',
                icon: 'usericon_male1'
              },
              {
                position: 'Stocker',
                name: 'Ronnie Garcia',
                email: 'rgarcia@yoyodyne.com',
                phone: '555-0130',
                fax: '555-0131',
                businessUnit: 'Production',
                status: 'present',
                icon: 'usericon_male4'
              }
            ]
          },
          {
            position: 'Production Supervisor',
            name: 'Kathy Maxwell',
            email: 'kmaxwell@yoyodyne.com',
            phone: '555-0132',
            fax: '555-0133',
            businessUnit: 'Production',
            status: 'present',
            icon: 'usericon_female3'
          }
        ]
      },
      {
        position: 'Vice President of Sales',
        name: 'Richard Fuller',
        email: 'rfuller@yoyodyne.com',
        phone: '555-0134',
        fax: '555-0135',
        businessUnit: 'Sales',
        status: 'present',
        icon: 'usericon_male1',
        subordinates: [
          {
            layout: 'rightHanging',
            position: 'North America Sales Manager',
            name: 'Joe Vargas',
            email: 'jvargas@yoyodyne.com',
            phone: '555-0136',
            fax: '555-0137',
            businessUnit: 'Sales',
            status: 'present',
            icon: 'usericon_male2',
            subordinates: [
              {
                position: 'Sales Representative',
                name: 'Robert Parson',
                email: 'rparson@yoyodyne.com',
                phone: '555-0150',
                fax: '555-0151',
                businessUnit: 'Sales',
                status: 'travel',
                icon: 'usericon_male3'
              },
              {
                position: 'Sales Representative',
                name: 'Melissa Noren',
                email: 'mnoren@yoyodyne.com',
                phone: '555-0152',
                fax: '555-0153',
                businessUnit: 'Sales',
                status: 'present',
                icon: 'usericon_female1'
              }
            ]
          },
          {
            layout: 'rightHanging',
            position: 'European Sales Manager',
            name: 'Robert Hartman',
            email: 'rhartman@yoyodyne.com',
            phone: '555-0138',
            fax: '555-0139',
            businessUnit: 'Sales',
            status: 'present',
            icon: 'usericon_male5',
            subordinates: [
              {
                position: 'Sales Representative',
                name: 'Rebecca Polite',
                email: 'rpolite@yoyodyne.com',
                phone: '555-0148',
                fax: '555-0149',
                businessUnit: 'Sales',
                status: 'travel',
                icon: 'usericon_female3'
              },
              {
                position: 'Sales Representative',
                name: 'Michael Daniels',
                email: 'mdaniels@yoyodyne.com',
                phone: '555-0154',
                fax: '555-0155',
                businessUnit: 'Sales',
                status: 'travel',
                icon: 'usericon_male1'
              }
            ]
          }
        ]
      },
      {
        position: 'Vice President of Engineering',
        name: 'Mildred Shark',
        email: 'mshark@yoyodyne.com',
        phone: '555-0156',
        fax: '555-0157',
        businessUnit: 'Engineering',
        status: 'present',
        icon: 'usericon_female2',
        subordinates: [
          {
            position: 'Engineering Manager',
            name: 'Martha Barnes',
            email: 'mbarnes@yoyodyne.com',
            phone: '555-0158',
            fax: '555-0159',
            businessUnit: 'Engineering',
            status: 'busy',
            icon: 'usericon_female3',
            subordinates: [
              {
                layout: 'bothHanging',
                position: 'Senior Tool Designer',
                name: 'Maria Dossantos',
                email: 'mdossantos@yoyodyne.com',
                phone: '555-0160',
                fax: '555-0161',
                businessUnit: 'Engineering',
                status: 'present',
                icon: 'usericon_female1',
                subordinates: [
                  {
                    position: 'Tool Designer',
                    name: 'Hector Donald',
                    email: 'hdonald@yoyodyne.com',
                    phone: '555-0162',
                    fax: '555-0163',
                    businessUnit: 'Engineering',
                    status: 'busy',
                    icon: 'usericon_male2'
                  },
                  {
                    position: 'Tool Designer',
                    name: 'Michelle Douglas',
                    email: 'mdouglas@yoyodyne.com',
                    phone: '555-0228',
                    fax: '555-0229',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_female5'
                  },
                  {
                    position: 'Tool Designer',
                    name: 'Bonnie Penney',
                    email: 'bpenney@yoyodyne.com',
                    phone: '555-0234',
                    fax: '555-0235',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_female4'
                  },
                  {
                    position: 'Tool Designer',
                    name: 'Francis Webster',
                    email: 'fwebster@yoyodyne.com',
                    phone: '555-0236',
                    fax: '555-0237',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male4'
                  },
                  {
                    position: 'Tool Designer',
                    name: 'Gregory Arnold',
                    email: 'garnold@yoyodyne.com',
                    phone: '555-0238',
                    fax: '555-0239',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male3'
                  },
                  {
                    position: 'Tool Designer',
                    name: 'Ken Kowalski',
                    email: 'kkowalski@yoyodyne.com',
                    phone: '555-0240',
                    fax: '555-0241',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male1'
                  }
                ]
              },
              {
                position: 'Senior Design Engineer',
                layout: 'rightHanging',
                name: 'Laurie Aitken',
                email: 'laitken@yoyodyne.com',
                phone: '555-0164',
                fax: '555-0165',
                businessUnit: 'Engineering',
                status: 'present',
                icon: 'usericon_female2',
                subordinates: [
                  {
                    position: 'Design Engineer',
                    name: 'Carla Clark',
                    email: 'cclark@yoyodyne.com',
                    phone: '555-0242',
                    fax: '555-0243',
                    businessUnit: 'Engineering',
                    status: 'unavailable',
                    icon: 'usericon_female3'
                  },
                  {
                    position: 'Design Engineer',
                    name: 'Cynthia Judd',
                    email: 'cjudd@yoyodyne.com',
                    phone: '555-0244',
                    fax: '555-0245',
                    businessUnit: 'Engineering',
                    status: 'unavailable',
                    icon: 'usericon_female1'
                  },
                  {
                    position: 'Design Engineer',
                    name: 'Robert Finn',
                    email: 'rfinn@yoyodyne.com',
                    phone: '555-0246',
                    fax: '555-0247',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male2'
                  },
                  {
                    position: 'Design Engineer',
                    name: 'Willie Schaub',
                    email: 'wschaub@yoyodyne.com',
                    phone: '555-0248',
                    fax: '555-0249',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male3'
                  },
                  {
                    position: 'Design Engineer',
                    name: 'Edwin Nagy',
                    email: 'enagy@yoyodyne.com',
                    phone: '555-0166',
                    fax: '555-0167',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male1'
                  }
                ]
              },
              {
                layout: 'bothHanging',
                position: 'R & D Manager',
                name: 'John Payne',
                email: 'jpayne@yoyodyne.com',
                phone: '555-0168',
                fax: '555-0169',
                businessUnit: 'Engineering',
                status: 'present',
                icon: 'usericon_male2',
                subordinates: [
                  {
                    position: 'R & D Engineer',
                    name: 'Rana Oxborough',
                    email: 'roxborough@yoyodyne.com',
                    phone: '555-0176',
                    fax: '555-0177',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_female4'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Gary Olsen',
                    email: 'golsen@yoyodyne.com',
                    phone: '555-0178',
                    fax: '555-0179',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male1'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Matthew Finney',
                    email: 'mfinney@yoyodyne.com',
                    phone: '555-0206',
                    fax: '555-0207',
                    businessUnit: 'Engineering',
                    status: 'travel',
                    icon: 'usericon_male2'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Julius Kelly',
                    email: 'jkelly@yoyodyne.com',
                    phone: '555-0208',
                    fax: '555-0209',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male3'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Charles Wylam',
                    email: 'cwylam@yoyodyne.com',
                    phone: '555-0212',
                    fax: '555-0213',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male1'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Steven Dotter',
                    email: 'sdotter@yoyodyne.com',
                    phone: '555-0214',
                    fax: '555-0215',
                    businessUnit: 'Engineering',
                    status: 'busy',
                    icon: 'usericon_male2'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Richard Bradshaw',
                    email: 'rbradshaw@yoyodyne.com',
                    phone: '555-0216',
                    fax: '555-0217',
                    businessUnit: 'Engineering',
                    status: 'unavailable',
                    icon: 'usericon_male5'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Vera Shoe',
                    email: 'vshoe@yoyodyne.com',
                    phone: '555-0218',
                    fax: '555-0219',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_female1'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Marty Tucker',
                    email: 'mtucker@yoyodyne.com',
                    phone: '555-0230',
                    fax: '555-0231',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male2'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Dennis Long',
                    email: 'dlong@yoyodyne.com',
                    phone: '555-0232',
                    fax: '555-0233',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male3'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Anthony Rice',
                    email: 'arice@yoyodyne.com',
                    phone: '555-0222',
                    fax: '555-0223',
                    businessUnit: 'Engineering',
                    status: 'busy',
                    icon: 'usericon_male1'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Joseph Lewis',
                    email: 'jlewis@yoyodyne.com',
                    phone: '555-0224',
                    fax: '555-0225',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_male2'
                  },
                  {
                    position: 'R & D Engineer',
                    name: 'Susan Reid',
                    email: 'sreid@yoyodyne.com',
                    phone: '555-0226',
                    fax: '555-0227',
                    businessUnit: 'Engineering',
                    status: 'present',
                    icon: 'usericon_female3'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        position: 'Marketing Manager',
        name: 'Angela Haase',
        email: 'ahaase@yoyodyne.com',
        phone: '555-0170',
        fax: '555-0171',
        businessUnit: 'Marketing',
        status: 'present',
        icon: 'usericon_female1',
        subordinates: [
          {
            position: 'Marketing Specialist',
            name: 'Jermaine Stewart',
            email: 'jstewart@yoyodyne.com',
            phone: '555-0172',
            fax: '555-0173',
            businessUnit: 'Marketing',
            status: 'present',
            icon: 'usericon_male2'
          },
          {
            position: 'Marketing Assistant',
            name: 'Lorraine Deaton',
            email: 'ldeaton@yoyodyne.com',
            phone: '555-0174',
            fax: '555-0175',
            businessUnit: 'Marketing',
            status: 'present',
            icon: 'usericon_female3',
            assistant: true
          }
        ]
      },
      {
        position: 'Chief Financial Officer',
        name: 'David Kerry',
        email: 'dkerry@yoyodyne.com',
        phone: '555-0180',
        fax: '555-0181',
        businessUnit: 'Accounting',
        status: 'present',
        icon: 'usericon_male1',
        subordinates: [
          {
            position: 'Accounts Manager',
            layout: 'rightHanging',
            name: 'Walter Hastings',
            email: 'whastings@yoyodyne.com',
            phone: '555-0182',
            fax: '555-0183',
            businessUnit: 'Accounting',
            status: 'present',
            icon: 'usericon_male4',
            subordinates: [
              {
                position: 'Accounts Receivable Specialist',
                name: 'Susan Moran',
                email: 'smoran@yoyodyne.com',
                phone: '555-0184',
                fax: '555-0185',
                businessUnit: 'Accounting',
                status: 'present',
                icon: 'usericon_female3'
              },
              {
                position: 'Accountant',
                name: 'Melvin Cruz',
                email: 'mcruz@yoyodyne.com',
                phone: '555-0186',
                fax: '555-0187',
                businessUnit: 'Accounting',
                status: 'present',
                icon: 'usericon_male1'
              },
              {
                position: 'Accounts Payable Specialist',
                name: 'Rachel King',
                email: 'rking@yoyodyne.com',
                phone: '555-0188',
                fax: '555-0189',
                businessUnit: 'Accounting',
                status: 'present',
                icon: 'usericon_female2'
              }
            ]
          },
          {
            position: 'Finance Manager',
            name: 'Joy Medico',
            email: 'jmedico@yoyodyne.com',
            phone: '555-0190',
            fax: '555-0191',
            businessUnit: 'Accounting',
            status: 'present',
            icon: 'usericon_female3',
            subordinates: [
              {
                position: 'Purchasing Manager',
                name: 'Edward Lewis',
                email: 'elewis@yoyodyne.com',
                phone: '555-0192',
                fax: '555-0193',
                businessUnit: 'Accounting',
                status: 'unavailable',
                icon: 'usericon_male1',
                subordinates: [
                  {
                    position: 'Purchasing Assistant',
                    name: 'Mildred Bean',
                    email: 'mbean@yoyodyne.com',
                    phone: '555-0194',
                    fax: '555-0195',
                    businessUnit: 'Accounting',
                    status: 'busy',
                    icon: 'usericon_female5',
                    assistant: true
                  },
                  {
                    position: 'Buyer',
                    name: 'Raymond Lindley',
                    email: 'rlindley@yoyodyne.com',
                    phone: '555-0196',
                    fax: '555-0197',
                    businessUnit: 'Accounting',
                    status: 'present',
                    icon: 'usericon_male3'
                  }
                ]
              }
            ]
          },
          {
            position: 'Human Resource Manager',
            name: 'Danny Welch',
            email: 'dwelch@yoyodyne.com',
            phone: '555-0198',
            fax: '555-0199',
            businessUnit: 'Accounting',
            status: 'present',
            icon: 'usericon_male1',
            subordinates: [
              {
                position: 'Human Resource Administrative Assistant',
                name: 'Leroy Vison',
                email: 'lvison@yoyodyne.com',
                phone: '555-0200',
                fax: '555-0201',
                businessUnit: 'Accounting',
                status: 'present',
                icon: 'usericon_male2',
                assistant: true
              },
              {
                position: 'Benefits Specialist',
                name: 'Mark Parks',
                email: 'mparks@yoyodyne.com',
                phone: '555-0202',
                fax: '555-0203',
                businessUnit: 'Accounting',
                status: 'present',
                icon: 'usericon_male5'
              },
              {
                position: 'Recruiter',
                name: 'Linda Lenhart',
                email: 'llenhart@yoyodyne.com',
                phone: '555-0204',
                fax: '555-0205',
                businessUnit: 'Accounting',
                status: 'busy',
                icon: 'usericon_female1'
              }
            ]
          },
          {
            position: 'Assistant to CFO',
            name: 'Aaron Buckman',
            email: 'abuckman@yoyodyne.com',
            phone: '555-0210',
            fax: '555-0211',
            businessUnit: 'Accounting',
            status: 'present',
            icon: 'usericon_male2',
            assistant: true
          }
        ]
      }
    ]
  }
])
