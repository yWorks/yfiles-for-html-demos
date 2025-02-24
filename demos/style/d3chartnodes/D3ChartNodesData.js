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
export default {
  nodes: [
    {
      id: 0,
      x: 442,
      y: 412,
      label: 'New York'
    },
    {
      id: 1,
      x: 150,
      y: 544,
      label: 'Tokyo'
    },
    {
      id: 2,
      x: 185,
      y: 300,
      label: 'London'
    },
    {
      id: 3,
      x: 619,
      y: 355,
      label: 'Hong Kong'
    },
    {
      id: 4,
      x: 547,
      y: 0,
      label: 'Amsterdam'
    },
    {
      id: 5,
      x: 638,
      y: 247,
      label: 'Frankfurt'
    },
    {
      id: 6,
      x: 0,
      y: 266,
      label: 'Lisbon'
    },
    {
      id: 7,
      x: 423,
      y: 634,
      label: 'Shanghai'
    },
    {
      id: 8,
      x: 603,
      y: 464,
      label: 'Toronto'
    },
    {
      id: 9,
      x: 256,
      y: 418,
      label: 'Paris'
    },
    {
      id: 10,
      x: 530,
      y: 145,
      label: 'Brussels'
    },
    {
      id: 11,
      x: 797,
      y: 196,
      label: 'Zurich'
    },
    {
      id: 12,
      x: 764,
      y: 631,
      label: 'Mumbai'
    },
    {
      id: 13,
      x: 596,
      y: 595,
      label: 'Shenzhen'
    },
    {
      id: 14,
      x: 30,
      y: 424,
      label: 'Stockholm'
    },
    {
      id: 15,
      x: 649,
      y: 752,
      label: 'Seoul'
    },
    {
      id: 16,
      x: 349,
      y: 200,
      label: 'São Paulo'
    },
    {
      id: 17,
      x: 832,
      y: 399,
      label: 'Johannesburg'
    },
    {
      id: 18,
      x: 400,
      y: 786,
      label: 'Taipei'
    },
    {
      id: 19,
      x: 93,
      y: 165,
      label: 'Madrid'
    },
    {
      id: 20,
      x: 345,
      y: 537,
      label: 'Sydney'
    }
  ],
  edges: [
    {
      id: 0,
      source: 0,
      target: 5
    },
    {
      id: 1,
      source: 5,
      target: 11
    },
    {
      id: 2,
      source: 0,
      target: 10
    },
    {
      id: 3,
      source: 10,
      target: 4
    },
    {
      id: 4,
      source: 0,
      target: 7
    },
    {
      id: 5,
      source: 7,
      target: 13
    },
    {
      id: 6,
      source: 0,
      target: 13
    },
    {
      id: 7,
      source: 0,
      target: 3
    },
    {
      id: 8,
      source: 0,
      target: 2
    },
    {
      id: 9,
      source: 2,
      target: 14
    },
    {
      id: 10,
      source: 13,
      target: 15
    },
    {
      id: 11,
      source: 13,
      target: 12
    },
    {
      id: 12,
      source: 2,
      target: 9
    },
    {
      id: 13,
      source: 0,
      target: 9
    },
    {
      id: 14,
      source: 0,
      target: 8
    },
    {
      id: 15,
      source: 0,
      target: 17
    },
    {
      id: 16,
      source: 0,
      target: 20
    },
    {
      id: 17,
      source: 2,
      target: 19
    },
    {
      id: 18,
      source: 2,
      target: 6
    },
    {
      id: 19,
      source: 19,
      target: 6
    },
    {
      id: 20,
      source: 0,
      target: 1
    },
    {
      id: 21,
      source: 0,
      target: 16
    },
    {
      id: 22,
      source: 7,
      target: 18
    }
  ]
}
