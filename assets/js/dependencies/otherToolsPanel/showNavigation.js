  const showNavigation = {
    /**
     * initializes the tool, calling the various sub-functions
     */
    init(callingPanel) {
      this.createElements();
      this.cacheDOM(callingPanel);
      this.buildLegend();
      this.addTool();
      this.bindEvents();
    },
    /**
     * Creates the tools elements
     */
    createElements() {
      this.config = {
        $activateButt: jQuery('<button>')
          .attr({
            class: 'myEDOBut',
            id: 'showNavigation',
            title: 'Show Navigation (Highlights MPs and LPs)',
          })
          .text('Show Navigation'),
        $offButt: jQuery('<input>')
          .attr({
            type: 'button',
            class: 'myEDOBut offButt',
            value: 'Turn Off',
          }),
        $legend: jQuery('<div>')
          .attr({
            class: 'tbLegend showNavigation',
          }),
        $legendTitle: jQuery('<div>')
          .attr({
            class: 'legendTitle',
            title: 'Drag to move legend',
          })
          .text('Show Navigation Legend'),
        $legendList: jQuery('<ul>')
          .attr({
            class: 'legendList',
          }),
        // $legendContent: {
        //   majorPage: 'Major Page',
        //   customPage: 'Landing Page',
        //   linkChecked: 'Link Clicked',
        //   absoluteURL: 'Absolute URL',
        //   error: 'Tool Error with Link'
        // },
        $legendContent: {
          majorPage: {
            text: 'Major Page',
            count: 0,
            flag: 'majorPage',
          },
          customPage: {
            text: 'Landing Page',
            count: 0,
            flag: 'customPage',
          },
          linkChecked: {
            text: 'Link Clicked',
            count: 0,
            flag: 'linkChecked',
          },
          absoluteURL: {
            text: 'Absolute URL',
            count: 0,
            flag: 'absoluteURL',
          },
          error: {
            text: 'Tool Error with Link',
            count: 0,
            flag: 'error',
          }
        },
        $hint: jQuery('<div>')
          .attr({
            class: 'hint',
          })
          .html('ctrl+left click to open link in a new tab.'),
        $linkCounter: jQuery('<div>')
          .attr({
            id: 'showNavigationLinkCounter',
            class: 'counterContainer'
          }),
        $message: jQuery('<div>')
          .attr({
            class: 'checkMessage',
          }),
        $iconContainer: jQuery('<div>')
          .attr({
            id: 'showNavigationIconContainer',
            class: 'iconContainer'
          }),
        $thinking: jQuery(
          `<i id="showNavigationLoading" class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>`
        ),
        $done: jQuery('<i class="fa fa-check-circle fa-3x fa-fw"></i>'),
        $counter: jQuery('<div>')
          .attr({
            id: 'showNavigationCount',
            class: 'counterText',
          }),
        activeRequests: 0,
        totalRequests: 0,
        $toggleURLButt: jQuery('<input>')
          .attr({
            type: 'button',
            class: 'myEDOBut feature',
            value: 'toggle URLs',
          }),

      };
    },
    /**
     * Cache DOM elements that the tool will use
     */
    cacheDOM(callingPanel) {
      this.$toolsPanel = jQuery(callingPanel);
      this.$legendContainer = jQuery('.legendContainer');

      if (shared.nextGenCheck()) {
        this.$nav = jQuery('header nav');
        // get sub nav links
        this.$navTabs = this.$nav.children().children();

        this.$subNavMenuContainer = this.$navTabs.find(
          'ul[if="cards.length"]');

        this.$subNavItem = this.$subNavMenuContainer.find(
          'li[repeat="cards"]');

        this.$navTabsLinks = this.$subNavItem.find('a');
      } else {
        this.$nav = jQuery('#pmenu');
        this.$navTabs = this.$nav.find('ul');
        this.$navTabsLinks = this.$navTabs.find('a');
      }
    },
    /**
     * Create a span element with the links HREF and attaches
     * it to the link element
     */
    addShowURLFeature(cLink) {
      const $cLink = jQuery(cLink);
      const linkURL = jQuery.trim($cLink.attr('href'));

      // appending it to the link text for a cleaner look
      $cLink.attr('title', linkURL);

      // attach a custom div element that contains the url text
      const toolTip =
        `<div class="tooltiptext link_url">${linkURL}</div>`;

      // attach div link to the link element
      $cLink.append(toolTip);
    },
    /**
     * Remove all link URL elements that the tool attached
     */
    removeURLelements() {
      const $linkURLS = jQuery('.tooltiptext.link_url');
      $linkURLS.remove();
      // $linkURLS.each((element) => {
      //   console.log('element', element);
      //   // remove();
      // });
    },
    /**
     * Builds the tools legend
     */
    buildLegend() {
      const {
        $linkCounter,
        $message,
        $counter,
        $iconContainer,
        $thinking,
        $legend,
        $legendTitle,
        $legendList,
        $offButt,
        $hint,
        $legendContent,
        $toggleURLButt
      } = this.config;

      // attach 'thinking' icon
      $iconContainer.append($thinking);

      // build counter message box
      $linkCounter
        .append($message)
        .append($counter)
        .append($iconContainer);

      $legend
        // attach link counter
        .append($linkCounter)
        // attach toggle url button
        .append($toggleURLButt)
        // attach legend title
        .append($legendTitle)
        // attach list
        .append($legendList)
        // attach turn off button
        .append($offButt)
        // attach hint
        .append($hint);

      // fill list
      shared.buildLegendContent(
        $legendContent,
        $legendList,
      );
    },
    /**
     * Add the tool to the Toolbox and add the legend to the legend panel
     */
    addTool() {
      const {
        $activateButt,
        $legend
      } = this.config;

      this.$toolsPanel
        .append($activateButt);
      this.$legendContainer
        .append($legend);
    },
    /**
     * Attach the events to the main tool buttons
     */
    bindEvents() {
      const {
        $activateButt,
        $offButt,
        $toggleURLButt
      } = this.config;

      // add functionality to toggle url button located on the legend
      $toggleURLButt.on('click', this.toggleLinkURLS);

      // add functionality to Main Tool button located in the Toolbox
      $activateButt
        .on('click', this.startStatus.bind(this))
        .on('click', this.toggleDisable.bind(this))
        .on('click', this.toggleLegend.bind(this))
        .on('click', this.toggleNavigation.bind(this))
        .on('click', this.bindClicks.bind(this))
        // .on('click', this.discoverMajorPages.bind(this))
        .on('click', this.scanNavigation.bind(this))
        .on('click', this.bindOnClickLegendElements.bind(this));

      // add functionality to OFF button located in the legend
      $offButt
        .on('click', this.removeClasses.bind(this))
        .on('click', this.toggleLegend.bind(this))
        .on('click', this.toggleNavigation.bind(this))
        .on('click', this.removeURLelements)
        .on('click', this.resetLegendContent.bind(this))
        .on('click', this.resetRequestCounters.bind(this))
        .on('click', this.unbindClicks.bind(this))  // TODO
        .on('click', this.toggleDisable.bind(this));
    },
    /**
    * Reset counters
    */
    resetRequestCounters() {
        this.config.totalRequests = 0;
        this.config.activeRequests = 0;
    },
    /**
     * Toggle the LINK URL elements that the tool added
     */
    toggleLinkURLS() {
      const $linkURLS = jQuery('.tooltiptext.link_url');
      $linkURLS.toggle();
    },
    /**
     * Allows the legend elements to be clickable, allowing the user to
     * hide/show the highlights for the corresponding legend element that
     * was clicked
     */
    bindOnClickLegendElements() {
      const {
        $legendList
      } = this.config;
      const $myMenu = jQuery('nav');

      // loop through legend items
      $legendList.children()
        .each((index, value) => {

          let findThis = jQuery(value)
            .attr('class');
          let flaggedLinks;

          jQuery(value)
            .on('click', () => {

              // do something special for the 'linkChecked' legend item
              if (findThis === 'linkChecked') {
                flaggedLinks = $myMenu.find(`.${findThis}`);

              } else {

                // IF FLAGGEDLINKS is empty, set a value,
                // otherwise set it equal to itself.
                flaggedLinks = flaggedLinks ? flaggedLinks : $myMenu.find(
                  `.${findThis}`);
              }

              // toggle all the classses off
              flaggedLinks.toggleClass(findThis);
            });

        });
    },
    /**
     * Removes all custom classes for this particular tool
     */
    removeClasses() {
      // get Keys from legend content
      // these are the classes that were added to the DOM elements
      const myClasses = Object.keys(this.config.$legendContent);

      // loop through the class array
      for (let y = 0; y < myClasses.length; y += 1) {
        // removed classes from elements that contain those classes
        this.$navTabs.find(`a[class*=${myClasses[y]}]`)
          .removeClass(myClasses[y]);
      }
    },
    /**
     * Hide or show the legend
     */
    toggleLegend() {
      // show/hide navigation
      this.config.$legend.slideToggle(500);
    },
    /**
     * Reset the link counter in the legend
     * Will fade out the link counter element then empty the containers
     */
    resetLinkCounter() {
      const {
        $counter,
        $iconContainer,
        $message,
        $linkCounter,
        $done
      } = this.config;

      // empty link counter elements
      $counter.empty();
      $iconContainer.empty();
      // update status text
      $message.text('all links checked');
      $iconContainer.append($done);

      // fade animation for the counter icon
      $linkCounter
        .delay(7000)
        .fadeOut(
          2000,
          () => {
            // reset link counter contents AND icon container
            // after the animation has ended
            $message.empty();
            $counter.empty();
            $iconContainer.empty();
          },
        );
    },
    /**
     * Starts the status message
     */
    startStatus() {
      const {
        $linkCounter,
        $iconContainer,
        $thinking,
        $message,
        $counter
      } = this.config;

      // show counter
      $linkCounter.show();
      // apply thinking icon
      $iconContainer.append($thinking);
      // set default message
      $message.text('scanning navigation');
      $counter.text('- of -');
    },
    /**
     * Updates the counter in the legend with the remaining links that are being
     * checked
     */
    updateStatus() {
      const {
        $counter,
        activeRequests,
        totalRequests
      } = this.config;

      // update counter number
      $counter.text(`${activeRequests} of ${totalRequests}`);
    },
    /**
     * The ajax filter that will grab the Content Manager from the
     * CDK webpage
     * @param {string} data - the data recieved from the AJAX request
     * @return {object} the Context Manager object from the CDK webpage
     */
    filterCMObject(data) {
      const myDiv = document.createElement('div');
      myDiv.innerHTML = data;

      // convert html collection (children) to array type to perform Array.filtering
      let childrenArray = Array.from(myDiv.children);
      // filter the array to only SCRIPT elements that start with ContextManager
      let filteredArray = childrenArray.filter((data) => {
        return data.nodeName === 'SCRIPT' && data.innerHTML
          .indexOf('ContextManager.init') > -1;
      });

      // Remove the preceeding ContextManager string
      let start = filteredArray[0].innerHTML.indexOf(
        'ContextManager.init({');
      filteredArray[0].innerHTML = filteredArray[0].innerHTML
        .substring(
          start);

      // find the start and end points of the ContextManager text
      start = filteredArray[0].innerHTML.indexOf('{');
      let end = filteredArray[0].innerHTML.indexOf('});');

      // grab the OBJECT text to convert into an object
      let myContextManager = filteredArray[0].innerHTML.substring(
        start, end + 1);

      // convert the filtering string to an object
      let myCM = JSON.parse(myContextManager);
      return myCM;
    },
    /**
     * ajax request to get the Context Manager object
     */
    getContextManager(cLink) {
      // console.log('this', this);
      let {
        $legendContent,
        // activeRequests,
        // totalRequests
      } = this.config;

      let {
        customPage,
        majorPage
      } = $legendContent

      // options for ajax request
      const options = {
        url: cLink.href,
        method: 'GET',
        crossDomain: true,
        // async: false,
        timeout: 10000,
        dataType: 'html',
        dataFilter: (data) => {
          return this.filterCMObject(data);
        },
        error: (xhr, status, error) => {
          // reduce the link counter value
          this.config.activeRequests += 1;

          // set these links to Absolute URL.  MOST COMMON ISSUE
          console.log('this', this);
          // this.classList.add('absoluteURL');
          cLink.classList.add('absoluteURL');
        },
        success: (data, status, xhr) => {
          console.log('this', this);
          // console.log('page name', data.uniquePageName);

          cLink.dataset.page = data.uniquePageName;
          jQuery(cLink).find('.tooltiptext.link_url').html(jQuery(cLink).find('.tooltiptext.link_url').html() + '<br> Page Name :: ' + data.uniquePageName);

          // find the uniquePageName property and test if it is a LandingPage
          if (data.uniquePageName.includes('LandingPage')) {
            // let {
            //   count
            // } = customPage;
            // increment landing page count
            this.config.$legendContent.customPage.count += 1;
            // console.log('LandingPage count', count);
            this.incrementLegendCount(customPage);
            // add customPage class to element
            cLink.classList.add('customPage');
            // cLink.dataset.page = data.uniquePageName;
          }
          // flag links as 'majorPage' if page name contains any of
          // these identifiers
          else if (data.uniquePageName.includes('Form') ||
            data.uniquePageName.includes('ContactUs') ||
            data.uniquePageName === 'HoursAndDirections' ||
            data.uniquePageName === 'VehicleSearchResults') {
            // let {
            //   count
            // } = majorPage;
            // increment major page count
            this.config.$legendContent.majorPage.count += 1;
            // console.log('majorPage count', count);
            this.incrementLegendCount(majorPage);
            // flag navigation links with custom class
            cLink.classList.add('majorPage');
            //
          }

          // reduce the link counter value
          this.config.activeRequests += 1;

          // Update link counter in the legend
          this.updateStatus();
// console.log('activeRequests', this.config.activeRequests);
// console.log('totalRequests',this.config.totalRequests);
          // if counter reaches zero, reset it.
          if (this.config.activeRequests === this.config.totalRequests) {
            this.resetLinkCounter();
          }
        }
      };

      // ajax request
//       jQuery.ajax({
//         url: cLink.href,
//         method: 'GET',
//         crossDomain: true,
//         timeout: 10000,
//         async: false,
//         dataType: 'html',
//         dataFilter: (data) => {
//           return this.filterCMObject(data);
//         },
//         error: (xhr, status, error) => {
//           // reduce the link counter value
//           this.config.activeRequests += 1;
//
//           // set these links to Absolute URL.  MOST COMMON ISSUE
//           console.log('cLink', cLink);
//           // this.classList.add('absoluteURL');
//           cLink.classList.add('absoluteURL');
//         },
//         success: (data, status, xhr) => {
//             console.log('cLink', cLink);
//           // console.log('this', this);
//           // console.log('page name', data.uniquePageName);
//
//           cLink.dataset.page = data.uniquePageName;
//           jQuery(cLink).find('.tooltiptext.link_url').html(jQuery(cLink).find('.tooltiptext.link_url').html() + '<br> Page Name :: ' + data.uniquePageName);
//
//           // find the uniquePageName property and test if it is a LandingPage
//           if (data.uniquePageName.includes('LandingPage')) {
//             // let {
//             //   count
//             // } = customPage;
//             // increment landing page count
//             this.config.$legendContent.customPage.count += 1;
//             // console.log('LandingPage count', count);
//             this.incrementLegendCount(customPage);
//             // add customPage class to element
//             cLink.classList.add('customPage');
//             // cLink.dataset.page = data.uniquePageName;
//           }
//           // flag links as 'majorPage' if page name contains any of
//           // these identifiers
//           else if (data.uniquePageName.includes('Form') ||
//             data.uniquePageName.includes('ContactUs') ||
//             data.uniquePageName === 'HoursAndDirections' ||
//             data.uniquePageName === 'VehicleSearchResults') {
//             // let {
//             //   count
//             // } = majorPage;
//             // increment major page count
//             this.config.$legendContent.majorPage.count += 1;
//             // console.log('majorPage count', count);
//             this.incrementLegendCount(majorPage);
//             // flag navigation links with custom class
//             cLink.classList.add('majorPage');
//             //
//           }
//
//           // reduce the link counter value
//           this.config.activeRequests += 1;
//
//           // Update link counter in the legend
//           this.updateStatus();
// // console.log('activeRequests', this.config.activeRequests);
// // console.log('totalRequests',this.config.totalRequests);
//           // if counter reaches zero, reset it.
//           if (this.config.activeRequests === this.config.totalRequests) {
//             this.resetLinkCounter();
//           }
//         }
//       });
      jQuery.ajax(options);
    },
    /**
     * Increment legend text with class count
     * @param {object} LegendObject - the legend object to update
     */
    incrementLegendCount(legendObject) {
      // const {
      //   $legend
      // } = this.config;
      const {
        text,
        count,
        flag
      } = legendObject;

      // console.log('legendObject', legendObject);
      // console.log('text', text);
      // console.log('count', count);
      //   console.log('legendClass', legendClass);
      // const curText = $legend.find(`.${legendClass}`).html();
      // console.log('curText', curText);
      const newText = count > 0 ? `${text} (${count})` : text;
      // console.log('newText', newText);
      this.config.$legend.find(`.${flag}`).html(newText);
      // TODO
    },
    /**
    * Will reset the state of the legend content.
    * Removes the counter numbers
    */
    resetLegendContent() {
      let legendKeys = Object.keys(this.config.$legendContent);
      // console.log(legendKeys);
      legendKeys.map((key, index) => {
        // console.log('key', key);
        // console.log('index', index);
        // console.log(this.config.$legendContent);
        // console.log(this.config.$legendContent[key]);
        this.config.$legendContent[key].count = 0;
      });
    },
    /**
     * Will flag all navigation links that lead to a Landing Page
     * Checks links.
     */
    scanNavigation() {
      let cLink;
      // if Next Gen Site Do this.
      if (shared.nextGenCheck()) {
        // set active request count to total number of links found

        // Update link counter in the legend
        this.updateStatus();

        // loop through all sub navigation tabs
        for (let y = 0; y < this.$navTabs.length; y += 1) {

          let $linksInNav = jQuery(this.$navTabs[y]).find('a');
  // console.log('$linksInNav', $linksInNav);

          // loop through each link in the sub nav
          for (let z = 0; z < $linksInNav.length; z += 1) {

            // increment counter for every link found
            this.config.totalRequests += 1;

            // Update link counter in the legend
            this.updateStatus();

            // save the current link to an easier to read variable name
            cLink = $linksInNav[z];
  // console.log('cLink', cLink);
  // console.log('href', cLink.href);
            // add link url element for tool functionality
            this.addShowURLFeature(cLink);

            // get Context Manager from page
            this.getContextManager(cLink);
          }
        }
      }
    },
    /**
     * add custom classes to the navigation menu in order to show the sub nav
     */
    toggleNavigation() {
      // if NG site do this
      if (shared.nextGenCheck()) {
        this.$nav.toggleClass('QAtoolCustomNav');
        this.$navTabs.toggleClass('showNav customAdd');
        this.$subNavItem.toggleClass('showNav customAdd');
        this.$subNavMenuContainer.toggleClass('showNav nextgenShowNav');
      } else {
        this.$navTabs.toggleClass('showNav');
      }
    },
    // /**
    //  * Flags all navigation items that lead to a MajorPage
    //  * See 'majorPage' array for "Major Pages"
    //  */
    // discoverMajorPages() {
    //   const majorPages =
    //     'a[href$=Form], a[href~=ContactUs], a[href=HoursAndDirections], a[href~=VehicleSearchResults]';
    //
    //   // flag navigation links with custom class
    //   if (shared.nextGenCheck()) {
    //     // if NG site do this
    //     this.$navTabs.find(majorPages)
    //       .toggleClass('majorPage');
    //   } else {
    //     // if NOT NG site, do this
    //     this.$navTabs
    //       .find(majorPages)
    //       .toggleClass('majorPage');
    //   }
    // },
    /**
     * Toggles 'disable' the Toolbar button
     */
    toggleDisable() {
      const {
        $activateButt
      } = this.config;

      $activateButt
        .prop(
          'disabled',
          (index, value) => !value,
        );
    },
    /**
     * Attach an onClick event that will add the 'linkChecked' class to the nav item
     */
    bindClicks() {
      const length = this.$navTabsLinks.length;

      // loop through all links in the navigation
      for (let i = 0; i < length; i += 1) {
        jQuery(this.$navTabsLinks[i])
          .one('mousedown', this.linkChecked(this.$navTabsLinks[i]));
      }
    },
    /**
     * Attach an onClick event that will add the 'linkChecked' class to the nav item
     */
    unbindClicks() {
      const length = this.$navTabsLinks.length;

      // loop through all links in the navigation
      for (let i = 0; i < length; i += 1) {
        jQuery(this.$navTabsLinks[i])
          .off('mousedown', this.linkChecked(this.$navTabsLinks[i]));
      }
    },
    /**
     * Callback function that will add the custom 'linkchecked' class to element
     */
    linkChecked(currentLink) {
      return function () {
        jQuery(currentLink)
          .addClass('linkChecked');
      };
    },
  };
