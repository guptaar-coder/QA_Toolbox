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
        linksToTest: {},
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
        this.$navTabs = this.$nav.children()
          .children();

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
        .on('click', this.unbindClicks.bind(this)) // TODO
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
      let myDiv = document.createElement('div');
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
      console.log('CM', myCM);
      return myCM;
    },
    /**
     * ajax request to get the Context Manager object
     */
    getContextManager() {
      let {
        $legendContent,
        linksToTest
      } = this.config;

      let {
        customPage,
        majorPage
      } = $legendContent

      // save object keys
      const myKeys = Object.keys(linksToTest);

      // loop through keys in order to loop through the links object
      myKeys.map((value, index) => {
        let {
          href,
          ref
        } = linksToTest[value];

        let timeout = 1000 * index;

        // set time out for each ajax request
        window.setTimeout(() => {

          jQuery.ajax({
            url: href,
            method: 'GET',
            crossDomain: true,
            dataType: 'html',
            dataFilter: (data) => {
              return this.filterCMObject(data);
            },
            error: (xhr, status, error) => {
              // reduce the link counter value
              this.config.activeRequests += 1;

              // set these links to Absolute URL.  MOST COMMON ISSUE
              ref.classList.add('absoluteURL');
            },
            success: (data, status, xhr) => {
              let {
                uniquePageName
              } = data;

              // find the uniquePageName property and test if it is a LandingPage
              if (uniquePageName.includes('LandingPage')) {
                // increment landing page count
                this.config.$legendContent.customPage.count += 1;
                // console.log('LandingPage count', count);
                this.incrementLegendCount(customPage);
                // add customPage class to element
                ref.classList.add('customPage');
              }
              // flag links as 'majorPage' if page name contains any of
              // these identifiers
              else if (uniquePageName.includes('Form') ||
                uniquePageName.includes('ContactUs') ||
                uniquePageName === 'HoursAndDirections' ||
                uniquePageName === 'VehicleSearchResults') {
                // increment major page count
                this.config.$legendContent.majorPage.count += 1;
                // console.log('majorPage count', count);
                this.incrementLegendCount(majorPage);
                // flag navigation links with custom class
                ref.classList.add('majorPage');
              }
              // reduce the link counter value
              this.config.activeRequests += 1;
              // Update link counter in the legend
              this.updateStatus();
              // if counter reaches zero, reset it.
              if (this.config.activeRequests === this.config.totalRequests) {
                this.resetLinkCounter();
              }
            }
          });
        }, timeout);
      });
    },
    /**
     * Increment legend text with class count
     * @param {object} LegendObject - the legend object to update
     */
    incrementLegendCount(legendObject) {
      const {
        text,
        count,
        flag
      } = legendObject;

      // set new legend text
      const newText = count > 0 ? `${text} (${count})` : text;
      this.config.$legend.find(`.${flag}`)
        .html(newText);
    },
    /**
     * Will reset the state of the legend content.
     * Removes the counter numbers
     */
    resetLegendContent() {
      let legendKeys = Object.keys(this.config.$legendContent);

      // loop through legend and reset count
      legendKeys.map((key, index) => {
        this.config.$legendContent[key].count = 0;
      });
    },
    /**
     * Will flag all navigation links that lead to a Landing Page
     * Checks links.
     */
    scanNavigation() {
      // if Next Gen Site Do this.
      if (shared.nextGenCheck()) {
        // Update link counter in the legend
        this.updateStatus();

        // loop through all sub navigation tabs
        for (let y = 0; y < this.$navTabs.length; y += 1) {

          let $linksInNav = jQuery(this.$navTabs[y])
            .find('a');

          // loop through each link in the sub nav
          for (let z = 0; z < $linksInNav.length; z += 1) {

            // increment counter for every link found
            this.config.totalRequests += 1;

            // Update link counter in the legend
            this.updateStatus();

            // add link url element for tool functionality
            this.addShowURLFeature($linksInNav[z]);

            let customClass = `testLink${this.config.totalRequests}`;
            $linksInNav[z].classList.add(customClass);

            // filter out pages that have their pages never changed
            if ($linksInNav[z].href.endsWith('_D')) {
              // increment active requests
              this.config.activeRequests += 1;
              // skip iteration
              continue;
            } else if ($linksInNav[z].href.includes('VehicleSearchResults')) {
              // increment major page count
              this.config.$legendContent.majorPage.count += 1;
              // flag navigation links with custom class
              $linksInNav[z].classList.add('majorPage');
              // increment active requests
              this.config.activeRequests += 1;
              // skip iteration
              continue;
            }

            // Add url to links to check object
            this.config.linksToTest[customClass] = {
              href: $linksInNav[z].href,
              ref: $linksInNav[z]
            };
          }
        }
      }

      // run ajax requests
      this.getContextManager();
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
          .off('mousedown');
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
