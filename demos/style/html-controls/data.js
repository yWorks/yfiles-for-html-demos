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
export const avatars = [
  './resources/usericon_female1.svg',
  './resources/usericon_female2.svg',
  './resources/usericon_female3.svg',
  './resources/usericon_female4.svg',
  './resources/usericon_female5.svg',
  './resources/usericon_male1.svg',
  './resources/usericon_male2.svg',
  './resources/usericon_male3.svg',
  './resources/usericon_male4.svg',
  './resources/usericon_male5.svg'
]

export const statusValues = ['busy', 'available', 'offline']

/**
 * @typedef {Object} UserData
 * @property {number} id
 * @property {number} [superior]
 * @property {string} name
 * @property {string} since
 * @property {*} avatar
 * @property {*} status
 * @property {string} description
 */

export const defaultData = {
  id: -1,
  name: 'Jane Doe',
  since: new Date().toISOString().substring(0, 10),
  avatar: avatars[0],
  status: 'available',
  description: 'Enter a job description.'
}

export const people = [
  {
    name: 'Jane Smith',
    description:
      'As a software engineer, Jane is responsible for developing and maintaining our web-based applications. She ensures that the software performs well and meets the needs of our customers.',
    since: '2015-07-03',
    id: 0,
    avatar: './resources/usericon_female2.svg',
    status: 'available'
  },
  {
    name: 'John Doe',
    description:
      'As the marketing manager, John is responsible for developing and implementing a strategy to promote our products and services. He manages the marketing team and ensures that our brand is visible and appealing.',
    since: '2016-01-15',
    id: 1,
    avatar: './resources/usericon_male5.svg',
    status: 'busy',
    superior: 0
  },
  {
    name: 'Sara Lee',
    description:
      'As a financial analyst, Sara is responsible for analyzing financial data and helping the company make informed decisions. She prepares reports and forecasts and provides insights to the senior management team.',
    since: '2017-05-12',
    id: 2,
    avatar: './resources/usericon_female4.svg',
    status: 'offline',
    superior: 3
  },
  {
    name: 'Michael Scott',
    description:
      'As the sales director, Michael is responsible for overseeing the sales team and ensuring that they meet their targets. He identifies new sales opportunities and develops relationships with customers and partners.',
    since: '2018-03-01',
    id: 3,
    avatar: './resources/usericon_male4.svg',
    status: 'available',
    superior: 0
  },
  {
    name: 'Olivia Pope',
    description:
      'As the human resources manager, Olivia is responsible for recruiting, training and developing talented employees. She ensures that the company policies are fair and transparent and resolves any employee conflicts.',
    since: '2019-02-28',
    id: 4,
    avatar: './resources/usericon_female1.svg',
    status: 'available',
    superior: 0
  },
  {
    name: 'Andy Dwyer',
    description:
      'As a customer service representative, Andy is responsible for responding to customer inquiries and resolving issues. He helps customers navigate our products and services and provides feedback to the product team.',
    since: '2020-01-02',
    id: 5,
    avatar: './resources/usericon_male3.svg',
    status: 'busy',
    superior: 0
  },
  {
    name: 'Liz Lemon',
    description:
      "As a content creator, Liz is responsible for creating and managing the company's online content. She writes blog posts, creates social media campaigns and develops multimedia content that engages our audience.",
    since: '2021-06-15',
    id: 9,
    avatar: './resources/usericon_female5.svg',
    status: 'busy',
    superior: 1
  }
]
