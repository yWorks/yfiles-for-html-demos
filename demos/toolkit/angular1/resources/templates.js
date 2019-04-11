/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
export const detailTemplate = `<g>
<rect fill="#C0C0C0" width="285" height="100" transform="translate(2 2)"/>
<rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100"/>
<g style="font-size:10px; font-family:Roboto,sans-serif; font-weight: 300; fill: #444">
  <image ng-href="{{item.icon}}" transform="scale(0.85) translate(15 20)" xlink:href="{{item.icon}}" width="75px" height="75px"/>
  <text transform="translate(100 25)" style="font-size:16px; fill:#336699">{{item.name}}</text>
  <text transform="translate(100 45)" style="text-transform: uppercase; font-weight: 400" data-linebreak="{{item.position}}" data-attributes="true"></text>
  <text transform="translate(100 60)" style="text-transform: uppercase; font-weight: 400" data-linebreak="{{item.position}}" data-attributes="false"></text>
  <text transform="translate(100 75)">{{item.email}}</text>
  <text transform="translate(100 92)">{{item.phone}}</text>
  <text transform="translate(170 92)">{{item.fax}}</text>
</g>
</g>`

export const intermediateTemplate = `<g>
<rect fill="#C0C0C0" width="285" height="100" transform="translate(2 2)"/>
<rect fill="#FFFFFF" stroke="#C0C0C0" width="285" height="100"/>
<image ng-href="{{item.icon}}" transform="scale(0.75) translate(15 30)" xlink:href="{{item.icon}}" width="75px" height="75px"/>
<text transform="translate(75 40)" style="font-size:26px;font-family:Roboto,sans-serif; fill:#336699;">{{item.name}}</text>
<text transform="translate(75 70)" style="font-size:15px; font-family:Roboto,sans-serif; text-transform: uppercase; font-weight: 400" data-linebreak="{{item.position}}" data-attributes="true"></text>
<text transform="translate(75 90)" style="font-size:15px; font-family:Roboto,sans-serif; text-transform: uppercase; font-weight: 400" data-linebreak="{{item.position}}" data-attributes="false"></text>
</g>`

export const overviewTemplate = `<g>
<rect fill="#AAA" width="288" height="103" transform="translate(-1 -1)"/>
<rect fill="#FFFFFF" width="285" height="100"/>
<text transform="translate(30 50)" style="font-size:40px; font-family:Roboto,sans-serif; fill:#336699; dominant-baseline: central;" data-abbreviate="{{item.name}}"></text>
</g>`
