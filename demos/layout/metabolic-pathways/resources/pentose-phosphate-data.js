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
export const pentosePhosphateData = {
  nodes: [
    { id: 0, label: '(3) Glucose<br>6-phosphate', tag: { type: 'PRODUCT', vAlign: 'start' } },
    {
      id: 1,
      label: '(3) 6-phosphoglucono-<br>δ-lactone',
      tag: { type: 'REACTANT' }
    },
    { id: 2, label: '(3) 6-Phosphogluconate', tag: { type: 'REACTANT' } },
    { id: 3, label: '(3) Ribulose<br>5-phosphate', tag: { type: 'REACTANT' } },
    { id: 4, label: 'Sedoheptulose<br>7-phosphate', tag: { type: 'REACTANT' } },
    { id: 5, label: 'Erythrose<br>4-phosphate', tag: { type: 'REACTANT', vAlign: 'end' } },
    { id: 6, label: 'Xylulose<br>5-phosphate', tag: { type: 'REACTANT' } },
    { id: 7, label: 'Glyceraldehyde<br>3-phosphate', tag: { type: 'REACTANT' } },
    { id: 8, label: 'Fructose<br>6-phosphate', tag: { type: 'PRODUCT' } },
    { id: 9, label: 'Glyceraldehyde<br>3-phosphate', tag: { type: 'PRODUCT' } },
    { id: 10, label: 'Fructose<br>6-phosphate', tag: { type: 'PRODUCT' } },
    { id: 11, label: 'Xylulose<br>5-phosphate', tag: { type: 'REACTANT' } },
    { id: 12, label: 'Ribose<br>5 phosphate', tag: { type: 'REACTANT' } },
    { id: 13, label: 'Glucose<br>6-phosphate<br>dehydrogenase', tag: { type: 'ENZYME' } },
    {
      id: 14,
      label: '<span style="font-size: 16px">(3) NADPH + H<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 15,
      label: '<span style="font-size: 16px">(3) NADP<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    { id: 16, tag: { type: 'REACTION' } },
    { id: 17, label: '6-Phosphogluconolactonase', tag: { type: 'ENZYME' } },
    {
      id: 18,
      label: '<span style="font-size: 16px">(3) NADPH + H<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    {
      id: 19,
      label: '<span style="font-size: 16px">(3) H<sub>2</sub>O</span>',
      tag: { type: 'CO_REACTANT' }
    },
    { id: 20, tag: { type: 'REACTION' } },
    { id: 21, label: '6-Phosphogluconate<br>dehydrogenase', tag: { type: 'ENZYME' } },
    {
      id: 22,
      label: '<span style="font-size: 16px">(3) NADP<sup>+</sup></span>',
      tag: { type: 'CO_REACTANT' }
    },
    { id: 23, tag: { type: 'REACTION' } },
    { id: 24, tag: { type: 'REACTION' } },
    { id: 25, tag: { type: 'REACTION' } },
    { id: 26, tag: { type: 'REACTION' } },
    { id: 27, label: '(3) H<sup>+</sup>', tag: { type: 'CO_REACTANT' } },
    { id: 28, tag: { type: 'REACTION' } },
    { id: 29, tag: { type: 'REACTION' } },
    { id: 30, tag: { type: 'REACTION' } },
    { id: 31, label: 'Transkelatolase', tag: { type: 'ENZYME' } },
    { id: 32, label: 'Transaldolase', tag: { type: 'ENZYME' } },
    { id: 33, label: 'Transkelatolase', tag: { type: 'ENZYME' } },
    { id: 34, label: 'Phospropentose<br>epimerase', tag: { type: 'ENZYME' } },
    { id: 35, label: 'Phospropentose<br>isomerase', tag: { type: 'ENZYME' } },
    { id: 36, label: 'Phospropentose<br>epimerase', tag: { type: 'ENZYME' } }
  ],
  edges: [
    { source: 0, target: 16 },
    { source: 1, target: 20 },
    { source: 20, target: 2 },
    { source: 2, target: 23 },
    { source: 11, target: 24 },
    { source: 12, target: 24 },
    { source: 24, target: 4 },
    { source: 24, target: 7 },
    { source: 16, target: 1 },
    { source: 15, target: 16 },
    { source: 16, target: 14 },
    { source: 16, target: 13 },
    { source: 20, target: 17 },
    { source: 19, target: 20 },
    { source: 20, target: 27 },
    { source: 23, target: 21 },
    { source: 23, target: 18 },
    { source: 3, target: 28 },
    { source: 28, target: 6 },
    { source: 6, target: 28 },
    { source: 28, target: 3 },
    { source: 3, target: 29 },
    { source: 29, target: 12 },
    { source: 12, target: 29 },
    { source: 29, target: 3 },
    { source: 3, target: 30 },
    { source: 30, target: 11 },
    { source: 11, target: 30 },
    { source: 30, target: 3 },
    { source: 4, target: 25 },
    { source: 7, target: 25 },
    { source: 25, target: 10 },
    { source: 25, target: 5 },
    { source: 5, target: 26 },
    { source: 26, target: 8 },
    { source: 26, target: 9 },
    { source: 6, target: 26 },
    { source: 23, target: 3 },
    { source: 24, target: 31 },
    { source: 25, target: 32 },
    { source: 26, target: 33 },
    { source: 28, target: 34 },
    { source: 29, target: 35 },
    { source: 30, target: 36 },
    { source: 22, target: 23 }
  ]
}
