/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  nodesSource: [
    {
      position: 'Chief Executive Officer',
      name: 'Eric Joplin',
      children: [
        {
          position: 'Chief Executive Assistant',
          name: 'Gary Roberts',
          children: [
            {
              position: 'Senior Executive Assistant',
              name: 'Alexander Burns'
            },
            {
              position: 'Junior Executive Assistant',
              name: 'Linda Newland'
            }
          ]
        },
        {
          position: 'Vice President of Production',
          name: 'Amy Kain',
          children: [
            {
              position: 'Production Supervisor',
              name: 'Kathy Maxwell'
            },
            {
              position: 'Shipping and Receiving Supervisor',
              name: 'Ray Hammond'
            },
            {
              position: 'Facilities Manager',
              name: 'Anne Binger'
            },
            {
              position: 'Master Scheduler',
              name: 'Larry Littlefield'
            }
          ]
        },
        {
          position: 'Vice President of Sales',
          name: 'Richard Fuller',
          children: [
            {
              position: 'European Sales Manager',
              name: 'Robert Hartman',
              children: [
                {
                  position: 'Sales Representative',
                  name: 'Michael Daniels'
                },
                {
                  position: 'Sales Representative',
                  name: 'Rebecca Polite'
                }
              ]
            },
            {
              position: 'North America Sales Manager',
              name: 'Joe Vargas',
              children: [
                {
                  position: 'Sales Representative',
                  name: 'Melissa Noren'
                },
                {
                  position: 'Sales Representative',
                  name: 'Robert Parson'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
