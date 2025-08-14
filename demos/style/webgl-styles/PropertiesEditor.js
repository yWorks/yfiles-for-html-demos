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
/* eslint-disable jsdoc/check-param-names */
import {
  Color,
  GroupNodeStyleIconBackgroundShape,
  GroupNodeStyleIconType,
  GroupNodeStyleTabPosition,
  WebGLArcEdgeStyle,
  WebGLArrowType,
  WebGLBridgeEdgeStyle,
  WebGLDashStyle,
  WebGLEffect,
  WebGLGroupNodeStyle,
  WebGLIconLabelStyle,
  WebGLLabelShape,
  WebGLLabelStyle,
  WebGLLineCap,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeShape,
  WebGLShapeNodeStyle,
  WebGLStroke,
  WebGLTextureRendering
} from '@yfiles/yfiles'

import plusIcon from '@yfiles/demo-resources/icons/plus2-16.svg'
import minusIcon from '@yfiles/demo-resources/icons/minus2-16.svg'

/*
 * ############################################################################
 * This file contains methods for getting values from and setting values to
 * the demo's editor UI. Aside from accessing properties of yFiles objects,
 * these methods do not contain yFiles code and do not demonstrate yFiles
 * concepts. As a consequence, most of the code in this file is not documented.
 * ############################################################################
 */

/**
 * Updates the displayed values in the demo's editor UI.
 * @param styles The style instances whose property values will be displayed in the editor UI.
 */
export function updateEditor(styles) {
  if (styles.group) {
    openSection('group-nodes')
    updateGroupNodeSection(styles.group)
  } else {
    closeSection('group-nodes')
  }
  if (styles.node) {
    openSection('nodes')
    updateNodeSection(styles.node)
  } else {
    closeSection('nodes')
  }
  if (styles.edge) {
    openSection('edges')
    updateEdgeSection(styles.edge)
  } else {
    closeSection('edges')
  }
  if (styles.label) {
    openSection('labels')
    updateLabelSection(styles.label)
  } else {
    closeSection('labels')
  }
}

/*
 * ############################################################################
 * section update group nodes editor
 * ############################################################################
 */

function updateGroupNodeSection(style) {
  getInput('groupNodeFill').value = colorToHexString(style.tabFill)
  getInput('groupNodeContentFill').value = colorToHexString(style.contentAreaFill)
  getSelect('groupNodeEffect').value = WebGLEffect[style.effect]

  setStroke(style.stroke, 'group')

  getSelect('groupNodeTabPosition').value = GroupNodeStyleTabPosition[style.tabPosition]
  getInput('groupNodeTabBackgroundFill').value = colorToHexString(style.tabBackgroundFill)
  getInput('groupNodeTabHeight').value = `${style.tabHeight}`
  getInput('groupNodeTabWidth').value = `${style.tabWidth}`
  getInput('groupNodeTabSlope').value = `${style.tabSlope}`
  getInput('groupNodeTabPadding').value = `${style.tabPadding}`
  getInput('groupNodeCornerRadius').value = `${style.cornerRadius}`

  getSelect('groupNodeIcon').value = getGroupIconPairName(style.groupIcon)
  getInput('groupNodeIconForegroundFill').value = colorToHexString(style.iconForegroundFill)
  getSelect('groupNodeIconBackgroundShape').value =
    GroupNodeStyleIconBackgroundShape[style.iconBackgroundShape]
  getInput('groupNodeIconBackgroundFill').value = colorToHexString(style.iconBackgroundFill)
}

function getGroupIconPairName(icon) {
  switch (icon) {
    case GroupNodeStyleIconType.CHEVRON_UP:
    case GroupNodeStyleIconType.CHEVRON_DOWN:
    case GroupNodeStyleIconType.CHEVRON_LEFT:
    case GroupNodeStyleIconType.CHEVRON_RIGHT:
      return 'CHEVRON'
    case GroupNodeStyleIconType.TRIANGLE_UP:
    case GroupNodeStyleIconType.TRIANGLE_DOWN:
    case GroupNodeStyleIconType.TRIANGLE_LEFT:
    case GroupNodeStyleIconType.TRIANGLE_RIGHT:
      return 'TRIANGLE'
    case GroupNodeStyleIconType.PLUS:
    case GroupNodeStyleIconType.MINUS:
      return 'PLUSMINUS'
    default:
      return 'NONE'
  }
}

/*
 * ############################################################################
 * section update normal nodes editor
 * ############################################################################
 */

function updateNodeSection(style) {
  getSelect('nodeShape').value = WebGLShapeNodeShape[style.shape]
  getInput('nodeFill').value = colorToHexString(style.fill)
  getSelect('nodeEffect').value = WebGLEffect[style.effect]

  setStroke(style.stroke, 'node')
}

/*
 * ############################################################################
 * section update edges editor
 * ############################################################################
 */

function updateEdgeSection(style) {
  if (style instanceof WebGLArcEdgeStyle) {
    updateEdgeSectionImpl(style, 'Arc')
  } else if (style instanceof WebGLBridgeEdgeStyle) {
    updateEdgeSectionImpl(style, 'Bridge')
  } /* WebGLPolylineEdgeStyle*/ else {
    updateEdgeSectionImpl(style, 'Default')
  }
}

function updateEdgeSectionImpl(style, type) {
  getSelect('edgeStyle').value = type

  getSelect('sourceArrow').value = WebGLArrowType[style.sourceArrow]
  getSelect('targetArrow').value = WebGLArrowType[style.targetArrow]
  getSelect('edgeEffect').value = WebGLEffect[style.effect]
  getInput('bendSmoothing').value = `${getSmoothingLength(style, type)}`
  if (style instanceof WebGLArcEdgeStyle || style instanceof WebGLBridgeEdgeStyle) {
    getInput('height').value = `${style.height}`
  }

  setStroke(style.stroke, 'edge')
}

function getSmoothingLength(style, type) {
  return 'Default' === type ? style.smoothingLength : 0
}

/*
 * ############################################################################
 * section update labels editor
 * ############################################################################
 */

function updateLabelSection(style) {
  if (style instanceof WebGLLabelStyle) {
    updateLabelSectionImpl(style, 'Default')
  } else {
    updateLabelSectionImpl(style, 'Icon')
  }
}

function updateLabelSectionImpl(style, type) {
  if (style instanceof WebGLLabelStyle) {
    getSelect('labelShape').value = WebGLLabelShape[style.shape]
  } else {
    getSelect('labelShape').value = WebGLLabelShape[style.backgroundShape]
  }
  getInput('labelTextColor').value = colorToHexString(getTextColor(style, type))
  getInput('labelBackgroundColor').value = colorToHexString(style.backgroundColor)
  getSelect('labelEffect').value = WebGLEffect[style.effect]
  getSelect('labelRenderingType').value = WebGLTextureRendering[style.textureRendering]
  getInput('labelOversampling').value = `${getSamplingRate(style, type)}`

  setStroke(style.backgroundStroke, 'label')
}

function getSamplingRate(style, type) {
  return 'Default' === type ? style.samplingRate : 2.0
}

function getTextColor(style, type) {
  return 'Default' === type ? style.textColor : Color.GRAY
}

/*
 * ############################################################################
 * section strokes editor
 * ############################################################################
 */

/**
 * Returns a {@link WebGLStroke} instance that is created with the editor values from the
 * editor section for the given item type.
 * @param type the item type for which the stroke is used.
 */
export function getStroke(type) {
  const noStroke = getInput(`${type}StrokeButtonNone`).className.indexOf('active') != -1
  const simpleStroke = getInput(`${type}StrokeButtonSimple`).className.indexOf('active') != -1
  if (noStroke && type != 'edge') {
    return WebGLStroke.NONE
  } else if (simpleStroke) {
    return new WebGLStroke(
      getInput(`${type}StrokeColor`).value,
      getNumber(`${type}StrokeThickness`)
    )
  } else {
    return new WebGLStroke(
      getInput(`${type}StrokeColor`).value,
      getNumber(`${type}StrokeThickness`),
      getDashStyle(type),
      getLineCapStyle(type)
    )
  }
}

function getDashStyle(type) {
  const value = getValue(`${type}StrokeDashStyle`)
  return WebGLDashStyle[value]
}

function getLineCapStyle(type) {
  const value = getValue(`${type}StrokeLineCaps`)
  return WebGLLineCap[value]
}

/**
 * Updates the stroke editor values in the editor section for the given item type with the
 * property values of the given stroke instance.
 */
export function setStroke(stroke, type) {
  if (WebGLStroke.NONE == stroke) {
    setStrokeSectionActive(type, 'None')
  } else if (stroke.dashStyle == WebGLDashStyle.SOLID) {
    setStrokeSectionActive(type, 'Simple')
    getInput(`${type}StrokeColor`).value = colorToHexString(stroke.color)
    getInput(`${type}StrokeThickness`).value = `${stroke.thickness}`
  } else {
    setStrokeSectionActive(type, 'More')
    getInput(`${type}StrokeColor`).value = colorToHexString(stroke.color)
    getInput(`${type}StrokeThickness`).value = `${stroke.thickness}`
    getSelect(`${type}StrokeDashStyle`).value = WebGLDashStyle[stroke.dashStyle]
    getSelect(`${type}StrokeLineCaps`).value = WebGLLineCap[stroke.lineCap]
  }
}

function setStrokeSectionActive(type, section) {
  const isNone = 'None' === section
  const isMore = 'More' === section
  if (isNone) {
    getButton(`${type}StrokeButtonSimple`).classList.remove('active')
    getButton(`${type}StrokeButtonMore`).classList.remove('active')
  } else if (isMore) {
    getButton(`${type}StrokeButtonNone`).classList.remove('active')
    getButton(`${type}StrokeButtonSimple`).classList.remove('active')
  } else {
    getButton(`${type}StrokeButtonNone`).classList.remove('active')
    getButton(`${type}StrokeButtonMore`).classList.remove('active')
  }

  getButton(`${type}StrokeButton${section}`).classList.add('active')

  const contentArea = getBlock(`${type}TabContent`)
  contentArea.style.display = isNone ? 'none' : 'block'
  const strokeSimple = getBlock(`${type}StrokeSimple`)
  strokeSimple.style.display = isNone ? 'none' : 'block'
  const strokeMore = getBlock(`${type}StrokeMore`)
  strokeMore.style.display = isMore ? 'block' : 'none'
}

/**
 * Returns the hexadecimal representation of the given color.
 */
function colorToHexString(c) {
  return '#' + (toHexString(c.r) + toHexString(c.g) + toHexString(c.b)).toUpperCase()
}

/**
 * Returns the hexadecimal representation of the given number.
 * This methods assumes a value in the range [0, 255].
 */
function toHexString(value) {
  return (value < 16 ? '0' : '') + value.toString(16)
}

/*
 * ############################################################################
 * section utility methods for expanding and collapsing sections
 * ############################################################################
 */

function closeSection(id) {
  const button = getButton(`${id}-section-button`)
  if (button.classList.contains('active')) {
    toggleSectionButton(button)
  }
}

function openSection(id) {
  const button = getButton(`${id}-section-button`)
  if (!button.classList.contains('active')) {
    toggleSectionButton(button)
  }
}

function toggleSectionButton(button) {
  button.classList.toggle('active')
  const img = button.firstElementChild
  const section = button.nextElementSibling

  if (section.style.display === 'block') {
    section.style.display = 'none'
    img.src = plusIcon
  } else {
    section.style.display = 'block'
    img.src = minusIcon
  }
}

/*
 * ############################################################################
 * section editor UI configuration
 * ############################################################################
 */

/**
 * Registers listeners to be notified of any changes in the demo's properties editor UI.
 * @param valueChanged Callback that is notified of changes in one of the item type editor sections.
 */
export function configureEditor(valueChanged) {
  configureSectionHeaders()
  configureStrokeSections()

  configureEditorListeners(valueChanged, 'node', 'nodes-section')
  configureEditorListeners(valueChanged, 'group', 'group-nodes-section')
  configureEditorListeners(valueChanged, 'edge', 'edges-section')
  configureEditorListeners(valueChanged, 'label', 'labels-section')
}

function configureEditorListeners(valueChanged, type, id) {
  let delayedEvent = 0
  const scheduleEvent = () => {
    clearTimeout(delayedEvent)
    delayedEvent = window.setTimeout(() => valueChanged(type), 100)
  }
  for (const editor of document.querySelectorAll(`#${id} .editor`)) {
    if (editor instanceof HTMLSelectElement) {
      editor.addEventListener('change', scheduleEvent)
    } else if (editor instanceof HTMLInputElement) {
      editor.addEventListener('input', scheduleEvent)
    } else if (editor instanceof HTMLButtonElement) {
      editor.addEventListener('click', scheduleEvent)
    }
  }
}

/**
 * Registers listeners for collapsing and expanding editor sections when clicking into the
 * section headers.
 */
function configureSectionHeaders() {
  const headers = document.getElementsByClassName('collapsible')
  for (let i = 0; i < headers.length; ++i) {
    const button = headers[i]
    button.onclick = () => toggleSectionButton(button)
    button.nextElementSibling.style.display = 'none'
  }
}

/**
 * Registers listeners for choosing one of stroke types 'None', 'Solid', and 'Dashed'.
 */
function configureStrokeSections() {
  configureStrokeSectionsImpl('node')
  configureStrokeSectionsImpl('edge')
  configureStrokeSectionsImpl('label')
  configureStrokeSectionsImpl('group')
}

/**
 * Registers listeners for choosing one of stroke types 'None', 'Solid', and 'Dashed' in the
 * given item type section.
 */
function configureStrokeSectionsImpl(type) {
  const sections = ['None', 'Simple', 'More']
  for (const section of sections) {
    getButton(`${type}StrokeButton${section}`).onclick = () => setStrokeSectionActive(type, section)
  }
}

/*
 * ############################################################################
 * section accessor methods for HTML elements
 * ############################################################################
 */

function getBlock(id) {
  return getElementById(id)
}

function getButton(id) {
  return getElementById(id)
}

export function getInput(id) {
  return getElementById(id)
}

export function getNumber(id) {
  return Number(getInput(id).value)
}

function getSelect(id) {
  return getElementById(id)
}

export function getValue(id) {
  return getElementById(id).value
}

function getElementById(id) {
  return document.getElementById(id)
}
