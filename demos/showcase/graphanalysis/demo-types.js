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
/**
 * Creates a copy of the given item's current tag and replaces the given item's tag with the copy.
 * A new instance is required for undo to work.
 */
export function copyAndReplaceTag(item) {
  const oldTag = getTag(item)

  // create a shallow copy of the old tag
  const newTag = { ...oldTag }
  newTag.components = []
  for (const component of oldTag.components) {
    newTag.components.push(component)
  }

  item.tag = newTag

  return newTag
}

/**
 * Retrieves the item's tag as a properly typed object.
 */
export function getTag(item) {
  return item.tag
}

/**
 * Resets the components, centrality value, and the gradient value on the tag.
 */
export function resetResult(item) {
  const tag = copyAndReplaceTag(item)
  tag.components = []
  delete tag.centrality
  delete tag.gradient
}

/**
 * Resets the type on the tag.
 */
export function resetType(item) {
  const tag = copyAndReplaceTag(item)
  delete tag.type
}
