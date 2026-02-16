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
/* eslint-disable no-eval */

import { getCategoryNames, getDemos, getLayoutCategories } from './demo-data'
;(() => {
  const isViewerPackage = document.title.indexOf('Viewer') > -1
  const isLayoutPackage = document.title.indexOf('Layout') > -1

  const pageContext = {
    isTsReadme: location.pathname.includes('demos-ts'),
    isJsReadme: location.pathname.includes('demos-js'),
    isCompletePackage: !isViewerPackage && !isLayoutPackage,
    isLayoutPackage,
    isViewerPackage
  }

  document.body.className += pageContext.isTsReadme ? ' ts' : pageContext.isJsReadme ? ' js' : ''

  const demos = getDemos()
  const categoryNames = getCategoryNames()
  const layoutCategories = getLayoutCategories()

  const tutorialIds = demos
    .filter((item) => item.category?.startsWith('tutorial'))
    .map((item) => item.id)

  const accordionItems = []

  for (const demo of demos) {
    demo.availableInPackage = pageContext.isCompletePackage
      ? true
      : isViewerPackage
        ? layoutCategories.indexOf(demo.category) === -1 && demo.distributionType !== 'needs-layout'
        : demo.distributionType === 'no-viewer'
  }

  function createDemoHeader(title, identifier) {
    const element = document.createElement('div')
    element.innerHTML = `<div class="demo-header hidden" id="${identifier}-demo-header">${title} Demos</div>`
    return element.firstElementChild
  }

  function createAccordionItem(title, identifier) {
    const element = document.createElement('div')
    element.innerHTML = `<div class="accordion-pane">
        <h5 class="accordion-title">${title}<i class="accordion-icon"></i></h5>
        <div class="accordion-content demo-items demo-items-${identifier}"></div>
      </div>`

    const item = element.firstElementChild
    item.querySelector('.accordion-title').addEventListener('click', () => {
      if (item.classList.contains('expanded')) {
        item.classList.remove('expanded')
        filterByCategory('')
        changeTextContent('')
      } else {
        accordionItems.forEach((accordion) => accordion.classList.remove('expanded'))
        item.classList.add('expanded')
        clearSearchBox()
        filterByCategory(identifier)
        changeTextContent(identifier)
      }
    })
    return item
  }

  function createSidebarItem(demo) {
    const sidebarItem = document.createElement('div')
    sidebarItem.className = 'demo-sidebar-item'
    if (!demo.availableInPackage) {
      sidebarItem.className += ' not-available'
      sidebarItem.className += isViewerPackage ? ' viewer-package' : ' layout-package'
    }
    const link = document.createElement('a')
    link.textContent = demo.name
    link.setAttribute('href', demo.demoPath)

    const languageTypeBadge = createLanguageTypeBatch(pageContext, demo)
    if (languageTypeBadge != null) {
      link.innerHTML = languageTypeBadge
      if (pageContext.isTsReadme && demo.languageType === 'js-only')
        link.setAttribute('href', '../demos-js/' + link.getAttribute('href'))
      else if (pageContext.isJsReadme && demo.languageType === 'ts-only')
        link.setAttribute('href', '../demos-ts/' + link.getAttribute('href'))
    }

    sidebarItem.appendChild(link)
    return sidebarItem
  }

  function insertSortedChild(parent, newChild) {
    const children = parent.querySelectorAll('div')
    parent.appendChild(newChild)
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.textContent > newChild.textContent) {
        parent.insertBefore(newChild, child)
        break
      }
    }
  }

  /**
   * @param demo The JSON data of a demo
   * @param needle A space-separated list of search terms
   * @param categoryFilter An optional filter to restrict matches to a certain category
   * @returns The quality of the match in the range [0-100]. Higher quality is better,
   *   and the value is 0 if the demo doesn't match at all.
   */
  function matchDemo(demo, needle, categoryFilter) {
    if (categoryFilter && demo.category !== categoryFilter) {
      return 0
    }
    const words = needle.split(/[^.\w/]/)
    return words
      .map((word) => matchWord(demo, word))
      .reduce((prev, curr) => {
        if (categoryFilter) {
          // when filtering a specific demo category, avoid any priorities but show demos in the given order
          return prev > 0 || curr > 0 ? 1 : 0
        } else {
          // require that all the words match by multiplying the priority number computed by
          // the function matchWord - if one is zero, the whole demo does not match
          return prev === -1 ? curr : prev * curr
        }
      }, -1)
  }

  /**
   * @param demo The JSON data of a demo
   * @param word A single search term
   * @returns The quality of the match in the range [0-100]. Higher quality is better,
   *   and the value is 0 if the demo doesn't match at all.
   */
  function matchWord(demo, word) {
    const regex = new RegExp(word, 'gi')
    if (regex.test(demo.name)) {
      return 100
    }
    if (demo.tags.some((tag) => regex.test(normalize(tag)))) {
      return 50
    }
    if (demo.keywords && demo.keywords.some((keyword) => regex.test(normalize(keyword)))) {
      return 20
    }
    if (regex.test(demo.category)) {
      return 10
    }
    return regex.test(demo.summary) ? 15 : 0
  }

  function normalize(word) {
    return word.replaceAll(/\s|-/g, '')
  }

  const demoGrid = document.getElementById('non-tutorial-grid')
  const tutBasicFeaturesGrid = document.getElementById('tutorial-basic-features-grid')
  const tutCustomNodeStyleGrid = document.getElementById('tutorial-style-implementation-node-grid')
  const tutCustomLabelStyleGrid = document.getElementById(
    'tutorial-style-implementation-label-grid'
  )
  const tutCustomEdgeStyleGrid = document.getElementById('tutorial-style-implementation-edge-grid')
  const tutCustomPortStyleGrid = document.getElementById('tutorial-style-implementation-port-grid')
  const tutGraphBuilderGrid = document.getElementById('tutorial-graph-builder-grid')
  const searchBox = document.querySelector('#search')
  const noSearchResultsElement = document.querySelector('#no-search-results')
  const resetSearchButton = document.querySelector('.reset-search')
  const unAvailableGrid = document.getElementById('unavailable-grid')
  const unAvailableGridHeader = document.getElementById('unavailable-header')

  if (isViewerPackage || isLayoutPackage) {
    unAvailableGrid.style.display = 'block'
    unAvailableGridHeader.style.display = 'block'
  }

  demos.forEach((demo, index) => {
    const gridItem = createGridItem(demo, index + 2, pageContext)
    if (demo.category === 'tutorial-basic-features') {
      tutBasicFeaturesGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-style-implementation-node') {
      tutCustomNodeStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-style-implementation-label') {
      tutCustomLabelStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-style-implementation-edge') {
      tutCustomEdgeStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-style-implementation-port') {
      tutCustomPortStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-graph-builder') {
      tutGraphBuilderGrid.appendChild(gridItem)
    } else if (!demo.availableInPackage) {
      unAvailableGrid.appendChild(gridItem)
    } else {
      demoGrid.appendChild(gridItem)
    }
    demo.element = gridItem
    const sidebarItem = createSidebarItem(demo)
    let element = document.querySelector('.demo-items-' + demo.category)
    if (!element) {
      let categoryName = categoryNames[demo.category] || demo.category
      if (categoryName.match(/^Tutorial:/)) {
        categoryName = categoryName
          .replace('Tutorial: ', '<span class="accordion-tutorial-prefix">Tutorial: </span>')
          .replace(' Implementation', '')
      }
      const accordionItem = createAccordionItem(categoryName, demo.category)
      accordionItems.push(accordionItem)
      document.querySelector('.demo-browser-sidebar').appendChild(accordionItem)
      element = document.querySelector('.demo-items-' + demo.category)
      // insert demo-header
      if (!demo.category.match(/tutorial-.*/)) {
        const demoHeader = createDemoHeader(categoryName, demo.category)
        const nonTutorialGrid = document.querySelector('#demo-descriptions')
        document.querySelector('.demo-grid').insertBefore(demoHeader, nonTutorialGrid)
      }
    }
    if (element != null) {
      insertSortedChild(element, sidebarItem)
    }
    demo.sidebarElement = sidebarItem
  })

  searchBox.addEventListener(
    'input',
    debounce(() => {
      searchBoxChanged()
      updateHash()
    }, 300)
  )
  searchBox.addEventListener('click', searchBoxClicked)
  searchBox.addEventListener('blur', () => {
    searchBox.addEventListener('click', searchBoxClicked)
  })
  resetSearchButton.addEventListener('click', () => {
    searchBox.value = ''
  })

  function setSearchTermFromHash() {
    searchBox.value =
      location.hash && location.hash.length > 1 && location.hash.charAt(0) === '#'
        ? decodeURIComponent(location.hash.substring(1))
        : ''
    searchBoxChanged()
  }

  window.onhashchange = setSearchTermFromHash
  setSearchTermFromHash()

  function updateHash() {
    if (!history.replaceState) {
      // Don't care about IE 9
      return
    }
    const searchTerm = searchBox.value.trim()
    history.replaceState({}, '', `#${searchTerm}`)
  }

  function searchBoxClicked() {
    searchBox.select()
    searchBox.removeEventListener('click', searchBoxClicked)
  }

  function clearSearchBox() {
    searchBox.value = ''
  }

  function showDemoCategoryHeader(categoryName) {
    document
      .querySelectorAll('.tutorial-header')
      .forEach((element) => element.classList.add('hidden'))

    document.getElementById(categoryName + '-header')?.classList.remove('hidden')
  }

  function filterByCategory(categoryName) {
    showDemoCategoryHeader(categoryName)
    filterDemos('', categoryName)
  }

  function filterDemos(searchTerm, categoryFilter) {
    let noSearchResults = true
    const searchBoxEmpty = searchTerm === ''

    // when the search term is a category, use category matching/sorting
    const matchedCategory = Object.keys(categoryNames).find(
      (categoryId) => categoryId === searchTerm
    )
    if (matchedCategory) {
      categoryFilter = matchedCategory
      searchTerm = ''
    }

    const sortedDemos = demos.map((demo) => ({
      demo: demo,
      priority: matchDemo(demo, searchTerm, categoryFilter)
    }))

    sortedDemos.sort((i1, i2) => {
      if (i1.priority === i2.priority) {
        return 0
      }
      if (i1.priority === 0) {
        return 1
      }
      if (i2.priority === 0) {
        return -1
      }
      return i1.priority > i2.priority ? -1 : 1
    })

    // The first indexes are reserved for other elements.
    let baseTabIndex = 2
    sortedDemos.forEach((item, index) => {
      const demo = item.demo
      // Reorder the nodes in each grid section
      const demoElement = demo.element
      demoElement.parentElement.appendChild(demoElement)

      // Update the tabindex.
      demo.element
        .querySelector('.title')
        .firstElementChild.setAttribute('tabindex', String(index + baseTabIndex))

      if (searchBoxEmpty && demo.hiddenInGrid) {
        // the search box is empty ...
        // and this is a demo that should be hidden in overview and only be visible when searching
        if (demoElement.className.indexOf('filtered') === -1) {
          //hide the demo in any case
          demoElement.className += ' filtered'
        }
        //however, for the empty search box we show the sidebar element
        demo.sidebarElement.className = demo.sidebarElement.className.replace(' filtered', '')
        return
      }
      if (item.priority > 0) {
        demoElement.className = demoElement.className.replace(' filtered', '')
        demo.sidebarElement.className = demo.sidebarElement.className.replace(' filtered', '')
        noSearchResults = false
      } else {
        if (demoElement.className.indexOf('filtered') === -1) {
          demoElement.className += ' filtered'
        }
        if (demo.sidebarElement.className.indexOf('filtered') === -1) {
          demo.sidebarElement.className += ' filtered'
        }
      }
    })

    baseTabIndex += sortedDemos.length
    tutorialIds.forEach((id) => {
      const gridElement = document.getElementById(id + '-grid')
      if (!gridElement) {
        return
      }
      const children = gridElement.children
      let allHidden = true
      for (let i = 0; i < children.length; i++) {
        const demoCard = children[i]
        if (demoCard.getAttribute('class')?.indexOf('filtered') === -1) {
          allHidden = false
          // Update the tabindex.
          demoCard
            .querySelector('.title')
            .firstElementChild.setAttribute('tabindex', `${baseTabIndex++}`)
        }
      }
      if (allHidden) {
        document.getElementById(id + '-header').style.display = 'none'
      } else {
        document.getElementById(id + '-header').style.display = 'block'
      }
    })
    noSearchResultsElement.style.display = noSearchResults ? 'block' : 'none'
  }

  function searchBoxChanged() {
    const searchTerm = searchBox.value.trim()

    showDemoCategoryHeader('')
    accordionItems.forEach((accordion) => accordion.classList.remove('expanded'))

    filterDemos(searchTerm, '')

    changeTextContent('')
  }

  function getDemosWithDescriptionElement() {
    return demos
      .map((item) => document.getElementById(item.category))
      .filter((element) => element != null)
  }

  function changeTextContent(categoryName) {
    for (const element of getDemosWithDescriptionElement()) {
      element.style.display = 'none'
    }
    const content = document.getElementById(categoryName)
    if (content != null) {
      content.style.display = 'block'
    }
  }
})()

function createGridItem(demo, index, pageContext) {
  const gridItem = document.createElement('div')
  gridItem.className = `grid-item${demo.availableInPackage ? '' : ' not-available'}`

  const demoPath =
    pageContext.isTsReadme && demo.languageType === 'js-only'
      ? '../demos-js/' + demo.demoPath
      : pageContext.isJsReadme && demo.languageType === 'ts-only'
        ? '../demos-ts/' + demo.demoPath
        : demo.demoPath

  const tags = demo.tags
    .map((tag) => `<span><a href="#${encodeURIComponent(tag)}" class="tag">${tag}</a></span>`)
    .join('')

  const languageTypeBadge = createLanguageTypeBatch(pageContext, demo) ?? ''

  const notAvailableNotice = demo.availableInPackage
    ? ''
    : `<div class="not-available-notice">Requires "${pageContext.isViewerPackage ? 'layout' : 'viewer'} features to run.
<div><a href="https://www.yfiles.com/demos/${demo.demoPath}">Run it online</a> or view the source code files.</div>`

  gridItem.innerHTML = `
      <div class="thumbnail">${languageTypeBadge}
        <a href="${demoPath}"><img src="${demo.thumbnailPath}" loading="lazy" alt=""/></a>
      </div>
      <div class="description">
        <h2 class="title"><a href="${demoPath}" tabindex="${index}">${demo.name}</a></h2>
        <p class="details">${demo.summary}</p>
        <div class="tags">${tags}</div>
        <div class="gradient-overlay"></div>
      </div>
      <div class="actions">
        <a href="${demoPath}" class="action-run"></a>
      </div>${notAvailableNotice}
    `
  return gridItem
}

function createLanguageTypeBatch(context, demo) {
  if (
    (!context.isTsReadme && !context.isJsReadme && demo.languageType == null) ||
    (context.isTsReadme && demo.languageType !== 'js-only') ||
    (context.isJsReadme && demo.languageType !== 'ts-only')
  ) {
    return null
  }
  const title =
    demo.languageType === 'js-only'
      ? 'Only available as JavaScript'
      : 'Only available as TypeScript'

  return `<span class="js-badge" title="${title}">${demo.languageType === 'js-only' ? 'JS' : 'TS'}</span>`
}

export function debounce(callback, wait) {
  let timer

  return (...args) => {
    if (timer) clearTimeout(timer)

    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(callback(...args)), wait)
    })
  }
}
