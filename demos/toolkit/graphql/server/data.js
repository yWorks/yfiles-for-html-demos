/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
module.exports = {
  persons: [
    { id: '1', name: 'Scott', icon: 'usericon_male1' },
    { id: '2', name: 'Jane', icon: 'usericon_female1' },
    { id: '3', name: 'Astrid', icon: 'usericon_female2' },
    { id: '4', name: 'Julia', icon: 'usericon_female3' },
    { id: '5', name: 'Joshua', icon: 'usericon_male2' },
    { id: '6', name: 'Dan', icon: 'usericon_male3' },
    { id: '7', name: 'Andy', icon: 'usericon_male4' },
    { id: '8', name: 'Carla', icon: 'usericon_female4' },
    { id: '9', name: 'Gary', icon: 'usericon_male1' },
    { id: '10', name: 'Laurie', icon: 'usericon_female1' },
    { id: '11', name: 'Anne', icon: 'usericon_female2' },
    { id: '12', name: 'Vera', icon: 'usericon_female3' },
    { id: '13', name: 'Dennis', icon: 'usericon_male2' },
    { id: '14', name: 'Robert', icon: 'usericon_male3' },
    { id: '15', name: 'Edward', icon: 'usericon_male5' },
    { id: '16', name: 'Susan', icon: 'usericon_female5' }
  ],
  friends: [
    ['1', '2'],
    ['1', '3'],
    ['1', '4'],
    ['1', '12'],
    ['1', '14'],
    ['2', '6'],
    ['4', '5'],
    ['4', '6'],
    ['4', '7'],
    ['7', '8'],
    ['8', '13'],
    ['8', '16'],
    ['9', '11'],
    ['9', '14'],
    ['10', '11'],
    ['10', '12'],
    ['12', '13'],
    ['12', '14'],
    ['12', '15'],
    ['15', '16']
  ]
}
