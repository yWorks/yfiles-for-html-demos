/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
export type SliderDefinition = {
  title: string
  min?: number
  max?: number
  callback?: (value: number) => void
  initialValue?: number
  step?: number
}

/**
 * A class that provides methods for creating and managing menu elements in the yFiles Playground.
 * This menu can be used to add various interactive elements like buttons, toggles, selectors, and sliders.
 */
export interface Menu {
  /**
   * Gets the HTMLDivElement that acts as the container for the menu.
   * @returns The container element.
   */
  get container(): HTMLDivElement

  /**
   * Adds a button to the menu.
   * @param title The title of the button.
   * @param callback The callback function which is executed when clicking the button.
   */
  addButton(title: string, callback: () => void): HTMLButtonElement

  /**
   * Adds a toggle button to the menu.
   * @param title The title of the button.
   * @param callback The callback function which is executed when clicking the button.
   * @param initialState The initial state of the toggle button. Defaults to false.
   * @returns The created toggle button element.
   */
  addToggleButton(
    title: string,
    callback?: (pressed: boolean) => void,
    initialState?: boolean
  ): HTMLInputElement

  /**
   * Adds a select element to the menu.
   * @param title Optionally sets the title for the select element.
   * @param options The options which should be displayed in the select element.
   * @param callback The callback function which is executed when selecting an option.
   * @param initialValue The initial value of the select element. Defaults to the first option.
   * @returns The created select element.
   */
  addSelect<T>(
    title: string,
    options: ({ value: T; label: string } | T)[],
    callback: (value: T) => void,
    initialValue?: T
  ): HTMLSelectElement

  /**
   * Adds a slider element to the menu.
   * @param options - The options to customize the slider.
   * @returns The created slider element.
   */
  addSlider(options: SliderDefinition): HTMLInputElement

  /**
   * Adds a slider element to the menu.
   * @param [title] - An optional label for the slider.
   * @param min - The minimum value of the slider. Defaults to 0.
   * @param max - The maximum value of the slider. Defaults to 100.
   * @param callback - The callback function to execute when the slider value changes.
   * @param [initialValue] - An optional initial value for the slider. Defaults to 0.
   * @param [step] - An optional increment step for the slider.
   * @returns The created slider element.
   */
  addSlider(
    title: string,
    min: number,
    max: number,
    callback: (value: number) => void,
    initialValue?: number,
    step?: number
  ): HTMLInputElement
}
