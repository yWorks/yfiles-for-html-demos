/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
export const ganttChartData = {
  originDate: '2023-03-21',
  tasks: [
    {
      id: 1,
      name: 'Market Analysis'
    },
    {
      id: 2,
      name: 'Functional Specification'
    },
    {
      id: 3,
      name: 'Architecture'
    },
    {
      id: 4,
      name: 'Project Planning'
    },
    {
      id: 5,
      name: 'Product Design'
    },
    {
      id: 6,
      name: 'Development'
    },
    {
      id: 7,
      name: 'Test Setup'
    },
    {
      id: 8,
      name: 'Testing'
    },
    {
      id: 9,
      name: 'Documentation'
    },
    {
      id: 10,
      name: 'Finalizing'
    }
  ],
  activities: [
    {
      id: 0,
      name: 'User Polls',
      taskId: 1,
      startDate: '2023-03-23',
      endDate: '2023-03-24',
      leadTime: 24
    },
    {
      id: 1,
      name: 'UI Spec',
      taskId: 2,
      startDate: '2023-03-24',
      endDate: '2023-03-25',
      dependencies: [0],
      followUpTime: 6
    },
    {
      id: 13,
      name: 'API Spec',
      taskId: 2,
      startDate: '2023-03-30',
      endDate: '2023-04-02'
    },
    {
      id: 2,
      taskId: 3,
      startDate: '2023-03-25',
      endDate: '2023-03-26',
      dependencies: [1]
    },
    {
      id: 3,
      name: 'Personnel Assignment',
      taskId: 4,
      startDate: '2023-03-26',
      endDate: '2023-03-28',
      dependencies: [1]
    },
    {
      id: 4,
      name: 'UI Design',
      taskId: 5,
      startDate: '2023-03-28',
      endDate: '2023-03-31',
      leadTime: 24,
      dependencies: [3]
    },
    {
      id: 5,
      name: 'Implementation',
      taskId: 6,
      startDate: '2023-04-03',
      endDate: '2023-04-07',
      leadTime: 24,
      followUpTime: 24,
      dependencies: [2, 13]
    },
    {
      id: 6,
      taskId: 7,
      startDate: '2023-04-07',
      endDate: '2023-04-08',
      dependencies: [5]
    },
    {
      id: 7,
      taskId: 7,
      startDate: '2023-04-11',
      endDate: '2023-04-12'
    },
    {
      id: 8,
      name: 'Unit Tests',
      taskId: 8,
      startDate: '2023-04-08',
      endDate: '2023-04-10',
      leadTime: 24,
      dependencies: [6]
    },
    {
      id: 9,
      name: 'UI Tests',
      taskId: 8,
      startDate: '2023-04-12',
      endDate: '2023-04-14',
      leadTime: 24,
      dependencies: [7, 8]
    },
    {
      id: 10,
      name: 'API Documentation',
      taskId: 9,
      startDate: '2023-04-07',
      endDate: '2023-04-15',
      dependencies: [9]
    },
    {
      id: 11,
      name: 'User Documentation',
      taskId: 9,
      startDate: '2023-04-12',
      endDate: '2023-04-14',
      followUpTime: 10
    },
    {
      id: 12,
      name: 'Retrospective',
      taskId: 10,
      startDate: '2023-04-16',
      endDate: '2023-04-17',
      leadTime: 24,
      dependencies: [10, 11]
    }
  ]
}
