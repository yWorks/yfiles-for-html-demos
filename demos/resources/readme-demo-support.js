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
/* eslint-disable no-var,no-eval */
;(function () {
  var isTsReadme = location.pathname.includes('demos-ts')
  var isJsReadme = location.pathname.includes('demos-js')

  document.body.className += isTsReadme ? ' ts' : isJsReadme ? ' js' : ''

  const demoData = window.getDemoData()
  var categoryNames = window.getCategoryNames()
  var layoutCategories = window.getLayoutCategories()

  var tutorialIds = demoData.filter(item => item.category === 'tutorial').map(item => item.id)

  var isViewerPackage = document.title.indexOf('Viewer') > -1
  var isLayoutPackage = document.title.indexOf('Layout') > -1
  var isCompletePackage = !isViewerPackage && !isLayoutPackage

  var demos = demoData.filter(function (demo) {
    return !demo.hidden
  })

  const accordionItems = []

  if (isTsReadme) {
    // Thumbnails are only in /demos-js/ directory
    demos.forEach(function (demo) {
      if (demo.thumbnailPath != null) {
        demo.thumbnailPath = '../demos-js/' + demo.thumbnailPath
      }
    })
  }

  demos.forEach(function (item) {
    item.availableInPackage =
      isCompletePackage ||
      (isViewerPackage &&
        layoutCategories.indexOf(item.category) === -1 &&
        item.packageType !== 'needs-layout') ||
      (isLayoutPackage && item.packageType === 'no-viewer')
  })

  var gridItemTemplate = document.querySelector('#grid-item-template')
  var accordionItemTemplate = document.querySelector('#accordion-template')
  var demoHeaderTemplate = document.querySelector('#demo-header-template')

  function createGridItem(demo, index) {
    var gridItem = document.createElement('div')
    gridItem.className = 'grid-item'
    gridItem.innerHTML = gridItemTemplate.innerHTML.replace(
      /{{([^}]+)}}/gi,
      function (match, propertyName) {
        if (propertyName === 'demoPath' && isTsReadme && demo.languageType === 'js-only') {
          return '../demos-js/' + demo.demoPath
        } else if (propertyName === 'demoPath' && isJsReadme && demo.languageType === 'ts-only') {
          return '../demos-ts/' + demo.demoPath
        } else if (propertyName === 'index') {
          return index + 2
        } else if (Object.prototype.hasOwnProperty.call(demo, propertyName)) {
          return demo[propertyName]
        } else {
          return ''
        }
      }
    )
    if (demo.tags) {
      var tagContainer = gridItem.querySelector('.tags')
      demo.tags.forEach(function (tag) {
        var tagItem = document.createElement('span')
        var anchor = document.createElement('a')
        anchor.setAttribute('href', '#' + encodeURIComponent(tag))
        tagItem.className += ' tag'
        anchor.textContent = tag
        tagItem.appendChild(anchor)
        tagContainer.appendChild(tagItem)
      })
    }

    var languageTypeBadge = createLanguageTypeBatch(demo)
    if (languageTypeBadge != null) {
      gridItem.querySelector('.thumbnail').appendChild(languageTypeBadge)
    }

    if (!demo.availableInPackage) {
      gridItem.className += ' not-available'
      var notAvailableNotice = document.createElement('div')
      notAvailableNotice.className = 'not-available-notice'
      notAvailableNotice.innerHTML =
        'Not available in "' +
        (isViewerPackage ? 'Viewer' : 'Layout') +
        '" packages.<br><a href="https://live.yworks.com/demos/' +
        demo.demoPath +
        '">See online version.</a>'
      gridItem.appendChild(notAvailableNotice)
    }
    return gridItem
  }

  function createDemoHeader(category) {
    var tmpDiv = document.createElement('div')
    tmpDiv.innerHTML = demoHeaderTemplate.innerHTML.replace(
      /{{([^}]+)}}/gi,
      function (match, propertyName) {
        if (Object.prototype.hasOwnProperty.call(category, propertyName)) {
          return category[propertyName]
        } else {
          // console.warn("Property '" + propertyName + "' not found in demo: " + demo.name);
          return ''
        }
      }
    )
    return tmpDiv
  }

  function createAccordionItem(category) {
    var tmpDiv = document.createElement('div')
    tmpDiv.innerHTML = accordionItemTemplate.innerHTML.replace(
      /{{([^}]+)}}/gi,
      function (match, propertyName) {
        if (Object.prototype.hasOwnProperty.call(category, propertyName)) {
          return category[propertyName]
        } else {
          // console.warn("Property '" + propertyName + "' not found in demo: " + demo.name);
          return ''
        }
      }
    )
    var item = tmpDiv.firstElementChild
    item.querySelector('.accordion-title').addEventListener('click', function () {
      if (item.classList.contains('expanded')) {
        item.classList.remove('expanded')
        filterByCategory('')
        changeTextContent('')
      } else {
        accordionItems.forEach(accordion => accordion.classList.remove('expanded'))
        item.classList.add('expanded')
        clearSearchBox()
        filterByCategory(category.identifier)
        changeTextContent(category.identifier)
      }
    })
    return item
  }

  function createSidebarItem(demo) {
    var sidebarItem = document.createElement('div')
    sidebarItem.className = 'demo-sidebar-item'
    if (!demo.availableInPackage) {
      sidebarItem.className += ' not-available'
      sidebarItem.className += isViewerPackage ? ' viewer-package' : ' layout-package'
    }
    var link = document.createElement('a')
    link.textContent = demo.name
    link.setAttribute('href', demo.demoPath)

    var languageTypeBadge = createLanguageTypeBatch(demo)
    if (languageTypeBadge != null) {
      link.appendChild(languageTypeBadge)
      if (isTsReadme && demo.languageType === 'js-only')
        link.setAttribute('href', '../demos-js/' + link.getAttribute('href'))
      else if (isJsReadme && demo.languageType === 'ts-only')
        link.setAttribute('href', '../demos-ts/' + link.getAttribute('href'))
    }

    sidebarItem.appendChild(link)
    return sidebarItem
  }

  /**
   * @param {DemoEntry} demo
   */
  function createLanguageTypeBatch(demo) {
    if (
      (!isTsReadme && !isJsReadme && demo.languageType == null) ||
      (isTsReadme && demo.languageType !== 'js-only') ||
      (isJsReadme && demo.languageType !== 'ts-only')
    ) {
      return null
    }
    var badge = document.createElement('span')
    badge.className = 'js-badge'
    if (demo.languageType === 'js-only') {
      badge.textContent = 'JS'
      badge.setAttribute('title', 'Only available as JavaScript')
    } else {
      badge.textContent = 'TS'
      badge.setAttribute('title', 'Only available as TypeScript')
    }
    return badge
  }

  function insertSortedChild(parent, newChild) {
    var children = parent.querySelectorAll('div')
    parent.appendChild(newChild)
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.textContent > newChild.textContent) {
        parent.insertBefore(newChild, child)
        break
      }
    }
  }

  /**
   * @param {object} demo The JSON data of a demo
   * @param {string} needle A space-separated list of search terms
   * @param {string} categoryFilter An optional filter to restrict matches to a certain category
   * @returns {number} The quality of the match in the range [0-100]. Higher quality is better and
   *   the value is 0 if the demo doesn't match at all.
   */
  function matchDemo(demo, needle, categoryFilter) {
    if (categoryFilter && demo.category !== categoryFilter) {
      return 0
    }
    var words = needle.split(/[^.\w/]/)
    return words
      .map(function (word) {
        return matchWord(demo, word)
      })
      .reduce(function (prev, curr) {
        if (categoryFilter) {
          // when filtering a specific demo category, avoid any priorities, but show demos in the given order
          return prev > 0 || curr > 0 ? 1 : 0
        } else {
          // require that all the words match by multiplying the priority number computed by
          // the function matchWord - if one is zero, the whole demo does not match
          return prev === -1 ? curr : prev * curr
        }
      }, -1)
  }

  /**
   * @param {object} demo The JSON data of a demo
   * @param {string} word A single search term
   * @returns {number} The quality of the match in the range [0-100]. Higher quality is better and
   *   the value is 0 if the demo doesn't match at all.
   */
  function matchWord(demo, word) {
    var regex = new RegExp(word, 'gi')
    if (regex.test(demo.name)) {
      return 100
    }
    if (
      demo.tags.some(function (tag) {
        return regex.test(normalize(tag))
      })
    ) {
      return 50
    }
    if (
      demo.keywords &&
      demo.keywords.some(function (keyword) {
        return regex.test(normalize(keyword))
      })
    ) {
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

  var demoGrid = document.getElementById('non-tutorial-grid')
  var tutBasicFeaturesGrid = document.getElementById('tutorial-basic-features-grid')
  var tutCustomNodeStyleGrid = document.getElementById('tutorial-node-style-implementation-grid')
  var tutCustomLabelStyleGrid = document.getElementById('tutorial-label-style-implementation-grid')
  var tutCustomEdgeStyleGrid = document.getElementById('tutorial-edge-style-implementation-grid')
  var tutCustomPortStyleGrid = document.getElementById('tutorial-port-style-implementation-grid')
  var tutGraphBuilderGrid = document.getElementById('tutorial-graph-builder-grid')
  var searchBox = document.querySelector('#search')
  var noSearchResultsElement = document.querySelector('#no-search-results')
  var resetSearchButton = document.querySelector('.reset-search')
  var unAvailableGrid = document.getElementById('unavailable-grid')
  var unAvailableGridHeader = document.getElementById('unavailable-header')

  if (isViewerPackage || isLayoutPackage) {
    unAvailableGrid.style.display = 'block'
    unAvailableGridHeader.style.display = 'block'
  }

  demos.forEach(function (demo, index) {
    var gridItem = createGridItem(demo, index)
    if (demo.category === 'tutorial-basic-features') {
      tutBasicFeaturesGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-node-style-implementation') {
      tutCustomNodeStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-label-style-implementation') {
      tutCustomLabelStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-edge-style-implementation') {
      tutCustomEdgeStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-port-style-implementation') {
      tutCustomPortStyleGrid.appendChild(gridItem)
    } else if (demo.category === 'tutorial-graph-builder') {
      tutGraphBuilderGrid.appendChild(gridItem)
    } else if (!demo.availableInPackage) {
      unAvailableGrid.appendChild(gridItem)
    } else {
      demoGrid.appendChild(gridItem)
    }
    demo.element = gridItem
    var sidebarItem = createSidebarItem(demo)
    var element = document.querySelector('.demo-items-' + demo.category)
    if (!element) {
      let categoryName = categoryNames[demo.category] || demo.category
      if (categoryName.match(/^Tutorial:/)) {
        categoryName = categoryName
          .replace('Tutorial: ', '<span class="accordion-tutorial-prefix">Tutorial: </span>')
          .replace(' Implementation', '')
      }
      let accordionItem = createAccordionItem({
        title: categoryName,
        identifier: demo.category
      })
      accordionItems.push(accordionItem)
      document.querySelector('.demo-browser-sidebar').appendChild(accordionItem)
      element = document.querySelector('.demo-items-' + demo.category)
      // insert demo-header
      if (!demo.category.match(/tutorial-.*/)) {
        let demoHeader = createDemoHeader({
          title: categoryName,
          identifier: demo.category
        })
        const nonTutorialGrid = document.querySelector('#demo-descriptions')
        document.querySelector('.demo-grid').insertBefore(demoHeader, nonTutorialGrid)
      }
    }
    insertSortedChild(element, sidebarItem)
    demo.sidebarElement = sidebarItem
  })

  searchBox.addEventListener(
    'input',
    debounce(
      function () {
        searchBoxChanged()
        updateHash()
      },
      300,
      false
    )
  )
  searchBox.addEventListener('click', searchBoxClicked)
  searchBox.addEventListener('blur', function () {
    searchBox.addEventListener('click', searchBoxClicked)
  })
  resetSearchButton.addEventListener('click', function () {
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
    var searchTerm = searchBox.value.trim()
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
    document.querySelectorAll('.demo-header').forEach(element => element.classList.add('hidden'))
    const header = document.getElementById(categoryName + '-demo-header')
    if (header) {
      header.classList.remove('hidden')
    }
  }

  function filterByCategory(categoryName) {
    showDemoCategoryHeader(categoryName)
    filterDemos('', categoryName)
  }

  function filterDemos(searchTerm, categoryFilter) {
    let noSearchResults = true
    const searchBoxEmpty = searchTerm === ''

    const sortedDemos = demos.map(function (demo) {
      return {
        demo: demo,
        prio: matchDemo(demo, searchTerm, categoryFilter)
      }
    })

    sortedDemos.sort(function (i1, i2) {
      if (i1.prio === i2.prio) {
        return 0
      }
      if (i1.prio === 0) {
        return 1
      }
      if (i2.prio === 0) {
        return -1
      }
      return i1.prio > i2.prio ? -1 : 1
    })

    // The first indexes are reserved for other elements.
    let baseTabIndex = 2
    sortedDemos.forEach(function (item, index) {
      const demo = item.demo
      // Reorder the nodes in each grid section
      demo.element.parentElement.appendChild(demo.element)

      // Update the tabindex.
      demo.element
        .querySelector('.title')
        .firstElementChild.setAttribute('tabindex', index + baseTabIndex)

      if (searchBoxEmpty && demo.hiddenInGrid) {
        // search box is empty ...
        // and this is a demo that should be hidden in overview and only be visible when searching
        if (demo.element.className.indexOf('filtered') === -1) {
          //hide the demo in any case
          demo.element.className += ' filtered'
        }
        //however, for the empty search box we show the sidebar element
        demo.sidebarElement.className = demo.sidebarElement.className.replace(' filtered', '')
        return
      }
      if (item.prio > 0) {
        demo.element.className = demo.element.className.replace(' filtered', '')
        demo.sidebarElement.className = demo.sidebarElement.className.replace(' filtered', '')
        noSearchResults = false
      } else {
        if (demo.element.className.indexOf('filtered') === -1) {
          demo.element.className += ' filtered'
        }
        if (demo.sidebarElement.className.indexOf('filtered') === -1) {
          demo.sidebarElement.className += ' filtered'
        }
      }
    })

    baseTabIndex += sortedDemos.length
    tutorialIds.forEach(function (id) {
      const gridElement = document.getElementById(id + '-grid')
      if (!gridElement) {
        return
      }
      const children = gridElement.children
      let allHidden = true
      for (var i = 0; i < children.length; i++) {
        const demoCard = children[i]
        if (demoCard.getAttribute('class').indexOf('filtered') === -1) {
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
    var searchTerm = searchBox.value.trim()

    showDemoCategoryHeader('')
    accordionItems.forEach(accordion => accordion.classList.remove('expanded'))

    filterDemos(searchTerm, '')

    changeTextContent('')
  }

  function getDemosWithDescriptionElement() {
    return demoData
      .map(item => item.category)
      .map(category => document.getElementById(category))
      .filter(element => element != null)
  }

  function changeTextContent(categoryName) {
    getDemosWithDescriptionElement().forEach(element => {
      element.style.display = 'none'
    })
    var content = document.getElementById(categoryName)
    if (content != null) {
      content.style.display = 'block'
    }
  }

  /**
   * Returns a function, that, as long as it continues to be invoked, will not be triggered.
   * @param {function} func
   * @param {number} delay
   * @param {boolean} immediate
   * @returns {(function(): void)|*}
   */
  function debounce(func, delay, immediate) {
    var timeout
    return function () {
      var context = this,
        args = arguments
      var later = function () {
        timeout = null
        if (!immediate) {
          func.apply(context, args)
        }
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, delay)
      if (callNow) {
        func.apply(context, args)
      }
    }
  }
})()
