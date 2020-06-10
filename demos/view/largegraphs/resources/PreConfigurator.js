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
/**
 * This class manages pre configurations based on node counts.
 */
export default class PreConfigurator {
  /**
   * These limits define up to which node count the specific setting is considered as practical.
   * It also defines a fall-back GraphModelManager setting that is used, if the default GMM
   * is not practical anymore.
   */
  get preConfigurationLimits() {
    return {
      simpleSvgStyles: {
        defaultGmm: {
          view: 2000,
          move: 500,
          edit: 500
        },
        levelOfDetailGmm: {
          view: 2000,
          move: 500,
          edit: 500
        },
        staticGmm: {
          view: 2000,
          move: 2000,
          edit: 2000
        },
        svgImageGmm: {
          view: 2000,
          move: 2000,
          edit: 2000
        },
        CanvasImageWithDrawCallbackGmm: {
          view: 15000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithItemStylesGmm: {
          view: 15000,
          move: 15000,
          edit: 15000
        },
        StaticCanvasImageGmm: {
          view: 15000,
          move: 15000,
          edit: 15000
        },
        StaticWebglImageGmm: {
          view: 20000,
          move: 20000,
          edit: 20000
        }
      },
      complexSvgStyles: {
        defaultGmm: {
          view: 500,
          move: 500,
          edit: 500
        },
        levelOfDetailGmm: {
          view: 2000,
          move: 500,
          edit: 500
        },
        staticGmm: {
          view: 2000,
          move: 2000,
          edit: 2000
        },
        svgImageGmm: {
          view: 2000,
          move: 5000,
          edit: 2000
        },
        CanvasImageWithDrawCallbackGmm: {
          view: 15000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithItemStylesGmm: {
          view: 15000,
          move: 15000,
          edit: 5000
        },
        StaticCanvasImageGmm: {
          view: 15000,
          move: 15000,
          edit: 5000
        },
        StaticWebglImageGmm: {
          view: 20000,
          move: 20000,
          edit: 20000
        }
      },
      simpleCanvasStyles: {
        defaultGmm: {
          view: 11000,
          move: 5000,
          edit: 5000
        },
        levelOfDetailGmm: {
          view: 2000,
          move: 500,
          edit: 500
        },
        staticGmm: {
          view: 11000,
          move: 11000,
          edit: 11000
        },
        svgImageGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithDrawCallbackGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithItemStylesGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        StaticCanvasImageGmm: {
          view: 2000,
          move: 2000,
          edit: 2000
        },
        StaticWebglImageGmm: {
          view: 20000,
          move: 20000,
          edit: 20000
        }
      },
      complexCanvasStyles: {
        defaultGmm: {
          view: 500,
          move: 500,
          edit: 500
        },
        levelOfDetailGmm: {
          view: 2000,
          move: 500,
          edit: 500
        },
        staticGmm: {
          view: 500,
          move: 500,
          edit: 500
        },
        svgImageGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithDrawCallbackGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithItemStylesGmm: {
          view: 20000,
          move: 5000,
          edit: 5000
        },
        StaticCanvasImageGmm: {
          view: 2000,
          move: 2000,
          edit: 2000
        },
        StaticWebglImageGmm: {
          view: 20000,
          move: 20000,
          edit: 20000
        }
      },
      WebGLStyles: {
        defaultGmm: {
          view: 11000,
          move: 5000,
          edit: 5000
        },
        levelOfDetailGmm: {
          view: 11000,
          move: 5000,
          edit: 5000
        },
        staticGmm: {
          view: 11000,
          move: 11000,
          edit: 11000
        },
        svgImageGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithDrawCallbackGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        CanvasImageWithItemStylesGmm: {
          view: 20000,
          move: 15000,
          edit: 15000
        },
        StaticCanvasImageGmm: {
          view: 2000,
          move: 2000,
          edit: 2000
        },
        StaticWebglImageGmm: {
          view: 20000,
          move: 20000,
          edit: 20000
        }
      }
    }
  }

  /**
   * Constructs a new instance and registers listeners to the graph item styles radio buttons.
   */
  constructor(graphComponent) {
    this.graphItemStylesSettings = document.getElementById('settingsGraphItemStyles')
    this.warningRadios = document.getElementsByClassName('mayHaveWarning')
    const radioButtons = this.graphItemStylesSettings.getElementsByTagName('input')
    for (let i = 0; i < radioButtons.length; i++) {
      radioButtons[i].addEventListener('click', this.updatePreConfiguration.bind(this))
    }
    this.graphComponent = graphComponent
    this.modeMapping = ['view', 'move', 'edit']
  }

  /**
   * On change of graph or graph item style, the pre configuration is loaded and applied.
   */
  updatePreConfiguration() {
    const nodeCount = this.graphComponent.graph.nodes.size

    // remove unrecommended classes
    const unrecommendedLabels = document.getElementsByClassName('unrecommended')
    while (unrecommendedLabels.length > 0) {
      const label = unrecommendedLabels[0]
      label.className = label.className.replace(/\s?\bunrecommended\b/, '')
    }

    // get current graph item style
    let graphItemStyle
    for (let i = 0; i < this.graphItemStylesSettings.childElementCount; i++) {
      const node = this.graphItemStylesSettings.children[i]
      if (node.checked) {
        graphItemStyle = node.value
        break
      }
    }

    const editMode = this.modeMapping[document.getElementById('modeChooserBox').selectedIndex]

    // get style specific limits
    const styleLimits = this.preConfigurationLimits[graphItemStyle]

    // set unrecommended classes
    Object.keys(styleLimits).forEach(gmmOptimization => {
      const styleLimit = styleLimits[gmmOptimization][editMode]
      if (
        {}.hasOwnProperty.call(styleLimits, gmmOptimization) &&
        typeof styleLimit === 'number' &&
        styleLimit < nodeCount
      ) {
        document.getElementById(`${gmmOptimization}-radio`).nextElementSibling.className +=
          ' unrecommended'
      }
    })
  }

  /**
   * Adds the warning class to the respective items.
   */
  addWarningCssClass() {
    for (let i = 0; i < this.warningRadios.length; i++) {
      const warningLabel = this.warningRadios[i].nextElementSibling
      if (warningLabel.className.indexOf('warning') < 0) {
        warningLabel.className = `${warningLabel.className} warning`
      }
    }
  }

  /**
   * Removes the warning class from the respective items.
   */
  removeWarningCssClass() {
    for (let i = 0; i < this.warningRadios.length; i++) {
      const warningLabel = this.warningRadios[i].nextElementSibling
      warningLabel.className = warningLabel.className.replace(/\s?\bwarning\b/, '')
    }
  }
}
