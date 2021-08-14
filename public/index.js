/**
 * Name: Michael Harris
 * Date: August 11, 2021
 * Section: CSE 154 AD
 *
 * The JavaScript for cp4 index.html. Functionality includes AJAX, fetch calls
 * to localhost server API, DOM modification for displaying list preview,
 * and lists in the current-lists view.
 */

"use strict";
(function() {
  /*
   ***************************
   * MODULE GLOBAL CONSTANTS *
   ***************************
   */
  const ONE_SECOND = 1000;
  const THREE_SECONDS = 3000;
  const LIST_DESCRIPTOR_COUNT = 4;
  const FIRST_INDEX_AFTER_DESCRIPTORS = 5;

  /*
   ***************************
   * MODULE GLOBAL VARIABLES *
   ***************************
   */
  let newItems; // array of new items during new list creation

  /*
   *************************
   * WINDOW INITIALIZATION *
   *************************
   */
  window.addEventListener("load", init);

  /**
   * Initializes the window
   */
  function init() {
    initButtons();
    initInputButtons();
    initNonButtonFormTags();
    fetchCategories();
    fetchStores();
    fetchLists();
  }

  /**
   * Helper function to initialize button tags upon window load.
   */
  function initButtons() {
    /*
     * Buttons in order are:
     * 0: nav-current lists
     * 1: nav-new list
     */
    let btns = qsa("button");
    btns[0].addEventListener("click", toggleActiveSection);
    btns[1].addEventListener("click", toggleActiveSection);
  }

  /**
   * Helper function to initialize input button tags upon window load.
   */
  function initInputButtons() {
    /*
     * Input[type='button'] in order are:
     * 0: form-new category
     * 1: form-add new category
     * 2: form-new store
     * 3: form-add new store
     * 4: form-add list item
     */
    let inputs = qsa("input[type='button']");
    inputs[0].addEventListener("click", showAddNew);
    inputs[1].addEventListener("click", hideAddNew);
    inputs[1].addEventListener("click", addNewCategory);
    inputs[2].addEventListener("click", showAddNew);
    inputs[3].addEventListener("click", hideAddNew);
    inputs[3].addEventListener("click", addNewStore);
    inputs[4].addEventListener("click", updatePreviewItems);
    inputs[4].addEventListener("click", insertListItem);
  }

  /**
   * Helper function to initialize non-button form tags upon window load.
   */
  function initNonButtonFormTags() {
    id("new-list-form").addEventListener("submit", submitList);
    id("title").addEventListener("keyup", updatePreviewTitle);
    id("date").addEventListener("change", updatePreviewDescriptors);
    id("categories").addEventListener("change", updatePreviewDescriptors);
    id("stores").addEventListener("change", updatePreviewDescriptors);
    id("website").addEventListener("keyup", updatePreviewDescriptors);
  }

  /*
   *****************
   * API FUNCTIONS *
   *****************
   */

  /**
   * Makes an API call to retrieve all list categories.
   */
  function fetchCategories() {
    fetch("/categories")
      .then(statusCheck)
      .then(resp => resp.text())
      .then(loadCategories)
      .catch(handleError);
  }

  /**
   * Makes an API call to retrieve all list stores.
   */
  function fetchStores() {
    fetch("/stores")
      .then(statusCheck)
      .then(resp => resp.text())
      .then(loadStores)
      .catch(handleError);
  }

  /**
   * Makes an API call to retrieve all created/saved lists.
   */
  function fetchLists() {
    fetch("/lists")
      .then(statusCheck)
      .then(resp => resp.json())
      .then(loadLists)
      .catch(handleError);
  }

  /**
   * Updates the Categories menu.
   * @param {string} response the promise data from an API call
   */
  function loadCategories(response) {
    let categories = response.split("\n");
    let menu = id("categories");
    for (let i = 0; i < categories.length; i++) {
      let newOption = gen("option");
      newOption.textContent = categories[i];
      menu.appendChild(newOption);
    }
  }

  /**
   * Updates the Stores menu.
   * @param {string} response the promise data from an API call
   */
  function loadStores(response) {
    let stores = response.split("\n");
    let menu = id("stores");
    for (let i = 0; i < stores.length; i++) {
      let newOption = gen("option");
      newOption.textContent = stores[i];
      menu.appendChild(newOption);
    }
  }

  /**
   * Updates the Current Lists view of created lists saved on the server.
   * @param {object} response the promise data from an API call
   */
  function loadLists(response) {
    let lists = Object.keys(response);
    lists.forEach((list) => {
      if (list !== "posts") {
        let data = getListData(response[list]);
        let newCard = buildListCard(data);
        id("current-lists").appendChild(newCard);
      }
    });
  }

  /**
   * Posts a user generated category to the API and updates the category menu
   * if the category is not previously contained.
   */
  function addNewCategory() {
    if (id("add-category").value) {
      let newCategory = id("add-category").value;
      let params = new FormData();
      params.append("category", newCategory);
      fetch("/categories/new", {method: "POST", body: params})
        .then(statusCheck)
        .then(resp => resp.text())
        .then(() => {
          sortIntoMenu(newCategory, id("categories"));
        })
        .catch(handleError);
    }
  }

  /**
   * Posts a user generated store to the API and updates the store menu
   * if the category is not previously contained.
   */
  function addNewStore() {
    if (id("add-store").value) {
      let newStore = id("add-store").value;
      let params = new FormData();
      params.append("store", newStore);
      fetch("/stores/new", {method: "POST", body: params})
        .then(statusCheck)
        .then(resp => resp.text())
        .then(() => {
          sortIntoMenu(newStore, id("stores"));
        })
        .catch(handleError);
    }
  }

  /**
   * Posts a user generated list to the API and updates the current-lists
   * view with the new list.
   */
  function submitList() {
    let params = buildListPostParams();
    fetch("/lists/new", {method: "post", body: params})
      .then(statusCheck)
      .then(resp => resp.json())
      .then()
      .catch(handleError);
  }

  /**
   * Helper function to build the parameters object for the new list form
   * post method.
   * @returns {FormData} the parameters for a new list form post method
   */
  function buildListPostParams() {
    let params = new FormData();
    params.append("title", id("title").value);
    params.append("date", id("date").value);
    params.append("category", id("categories").value);
    params.append("store", id("stores").value);
    params.append("website", id("website").value);
    params.append("items", newItems);
    return params;
  }

  /**
   * Checks the status of an API fetch request.
   * @param {object} response the promise returned from an API call
   * @throws new error if response not ok
   * @returns {object} the promise data if status is ok
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * Display error.
   * @param {string} error the error message to display
   */
  function handleError(error) {
    let errorBar = id("error-msg");
    errorBar.textContent = error;
    setTimeout(() => {
      errorBar.textContent = "";
    }, THREE_SECONDS);
  }

  /*
   *****************************
   * BUTTON SPECIFIC FUNCTIONS *
   *****************************
   */

  /**
   * Toggles which portion of the website is currently being shown depending
   * on which Nav button was pressed. Either the current lists or new list
   * will be shown.
   */
  function toggleActiveSection() {
    let sections = qsa("section");

    /*
     * Sections in order are:
     * 0: #current-lists
     * 1: #new-list
     * 2: #list-preview
     */

    sections.forEach((section) => {
      section.classList.toggle("hidden");
    });
    disableNavButtons();
    clearForm();
  }

  /**
   * Unhides/shows the add new category/store fieldset and hides the Insert New
   * Category/Store button.
   */
  function showAddNew() {
    this.classList.toggle("hidden");
    let parentsNextSibling = this.nextElementSibling;
    parentsNextSibling.classList.toggle("hidden");
  }

  /**
   * Hides the add new category/store fieldset and shows the Insert New
   * Category/Store button.
   */
  function hideAddNew() {
    this.parentElement.classList.toggle("hidden");
    let prevSibling = this.parentElement.previousElementSibling;
    prevSibling.classList.toggle("hidden");
  }

  /**
   * Appends the new items list with a new item provided by user.
   */
  function insertListItem() {
    let newListItemInput = id("new-list-item");
    if (newListItemInput.value) {
      newItems.push(newListItemInput.value);
      newListItemInput.value = "Item Added";
      newListItemInput.style.color = "red";
      setTimeout(() => {
        newListItemInput.value = "";
        newListItemInput.style.color = "black";
      }, ONE_SECOND);
    }
  }

  /**
   * Helper function to toggle the navigation buttons based on whhich portion of
   * the website is currently being shown. Either the current-lists or new
   * list buttons will be enabled, but not both, and only the one for which
   * the portion of the site is not shown.
   */
  function disableNavButtons() {
    let currentListsBtn = qs("nav > button:first-child");
    let newListBtn = qs("nav > button:last-child");
    if (currentListsBtn.disabled) {
      currentListsBtn.disabled = false;
      newListBtn.disabled = true;
    } else {
      currentListsBtn.disabled = true;
      newListBtn.disabled = false;
    }
  }

  /*
   ***************************
   * LISTS PREVIEW FUNCTIONS *
   ***************************
   */

  /**
   * Updates the List Preview title field.
   */
  function updatePreviewTitle() {
    let previewTitle = qs("#preview-card > header > h3");
    previewTitle.textContent = this.value;
    window.scrollTo(0, document.body.scrollHeight);
  }

  /**
   * Updates the List Preview descriptor fields.
   */
  function updatePreviewDescriptors() {
    let ids = ["date", "categories", "stores", "website"];
    for (let i = 0; i < ids.length; i++) {
      if (this.id === ids[i]) {
        let listElement = qs("#preview-card .list-descriptors > li:nth-child(" + (i + 1) + ")");
        if (listElement.classList.contains("hidden")) {
          listElement.classList.remove("hidden");
        }
        listElement.textContent = this.value;
        window.scrollTo(0, document.body.scrollHeight);
      }
    }
  }

  /**
   * Updates the List Preview Item fields.
   */
  function updatePreviewItems() {
    let newListItem = id("new-list-item");
    if (newListItem.value) {
      let newCheckbox = gen("input");
      newCheckbox.type = "checkbox";
      newCheckbox.addEventListener("change", function() {
        this.parentElement.classList.toggle("done");
      }.bind(newCheckbox));

      let newLI = gen("li");
      newLI.appendChild(newCheckbox);
      newLI.appendChild(document.createTextNode(newListItem.value));

      let parent = qs("#preview-card .list-items");
      parent.appendChild(newLI);
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  /*
   *******************
   * RESET FUNCTIONS *
   *******************
   */

  /**
   * Clears the form of all non-saved field data.
   */
  function clearForm() {
    id("title").value = "";
    id("date").value = "";
    id("categories").value = "Please make a selection...";
    id("add-category").value = "";
    id("stores").value = "Please make a selection...";
    id("add-store").value = "";
    id("website").value = "";
    id("new-list-item").value = "";
    newItems = [];

    resetFormView();
    clearListPreview();
  }

  /**
   * Resets the form view if items are not showing properly when clicked away.
   */
  function resetFormView() {
    let hiddenTags = qsa(".hidden");
    let secondToLast = hiddenTags.length - 2;
    let last = hiddenTags.length - 1;
    if (hiddenTags[secondToLast].tagName === "INPUT") {
      id("add-category").nextElementSibling.click();
    }

    if (hiddenTags[last].tagName === "INPUT") {
      id("add-store").nextElementSibling.click();
    }
  }

  /**
   * Clears the List Preview fields for a new note.
   */
  function clearListPreview() {
    let children = id("preview-card").children;
    let size = children.length;
    while (size > 0) {
      children[0].remove();
      size--;
    }
    rebuildPreview();
  }

  /**
   * Helper function to rebuild the list preview tags.
   */
  function rebuildPreview() {
    let parent = id("preview-card");
    let newHeader = gen("header");
    let newH3 = gen("h3");
    let newDescUL = gen("ul");
    let newItemUL = gen("ul");

    newDescUL.classList.add("list-descriptors");
    newItemUL.classList.add("list-items");

    for (let i = 0; i < LIST_DESCRIPTOR_COUNT; i++) {
      let newLI = gen("li");
      newLI.classList.add("hidden");
      newDescUL.appendChild(newLI);
    }

    newHeader.appendChild(newH3);
    newHeader.appendChild(newDescUL);

    parent.appendChild(newHeader);
    parent.appendChild(newItemUL);
  }

  /*
   ************************
   * HELPER FUNCTIONS *
   ************************
   */

  /**
   * Lexicographically sorts a new user generated option into a menu.
   * @param {*} newOption the new option to be inserted
   * @param {*} menu the select menu to insert
   */
  function sortIntoMenu(newOption, menu) {
    let newOptionTag = gen("option");
    newOptionTag.textContent = newOption;
    let options = menu.children;
    let newOptionPlaced = false;

    // Starting at 2 keeps "Please make a selection..." and "Other" at the top
    if (options.length > 2) {
      for (let i = 2; i < options.length && !newOptionPlaced; i++) {
        if (newOption < options[i].textContent) {
          menu.insertBefore(newOptionTag, options[i]);
          newOptionPlaced = true;
        }
      }
    }

    if (!newOptionPlaced) {
      menu.appendChild(newOptionTag);
    }
  }

  /**
   * Returns an array of all values for one key within a response object.
   * @param {object} obj an object received from an API call
   * @returns {Array} the object of values from a key in a response object
   */
  function getListData(obj) {
    let result = [];
    let keys = Object.keys(obj);
    keys.forEach((key) => {
      result.push(obj[key]);
    });
    return result;
  }

  /**
   * Builds and returns a new list-card.
   * @param {Array} data the data from which to build a list-card
   * @returns {object} a new list-card
   */
  function buildListCard(data) {
    let parent = gen("article");
    let newHeader = gen("header");
    let newH3 = gen("h3");
    let newDescUL = gen("ul");
    let newItemUL = gen("ul");

    newH3.textContent = data[0];
    parent.classList.add("list-card");
    newDescUL.classList.add("list-descriptors");
    newItemUL.classList.add("list-items");

    buildListCardDescriptors(newDescUL, data);
    buildListCardItems(newItemUL, data);

    newHeader.appendChild(newH3);
    newHeader.appendChild(newDescUL);
    parent.appendChild(newHeader);
    parent.appendChild(newItemUL);
    return parent;
  }

  /**
   * Helper function to setup the individual list descriptors for a list-card.
   * @param {object} newDescUL the list-descriptors DOM object
   * @param {Array} data the list-card item values
   */
  function buildListCardDescriptors(newDescUL, data) {
    for (let i = 0; i < LIST_DESCRIPTOR_COUNT; i++) {
      let newLI = gen("li");
      if (data[i + 1]) {
        newLI.textContent = data[i + 1];
      } else {
        newLI.classList.add("hidden");
      }
      newDescUL.appendChild(newLI);
    }
  }

  /**
   * Helper function to setup the individual list items for a list-card.
   * @param {object} newItemUL the list-items DOM object
   * @param {Array} data the list-card item values
   */
  function buildListCardItems(newItemUL, data) {
    for (let i = FIRST_INDEX_AFTER_DESCRIPTORS; i < data.length; i++) {
      if (i % 2 === 0) {
        // even
        if (data[i]) {
          newItemUL.lastElementChild.classList.add("done");
          newItemUL.lastElementChild.lastElementChild.click();
        }
      } else {
        // odd
        let newLI = gen("li");
        let newCheckbox = gen("input");
        newCheckbox.type = "checkbox";
        newCheckbox.addEventListener("change", function() {
          this.parentElement.classList.toggle("done");
        }.bind(newCheckbox));
        newLI.appendChild(newCheckbox);
        newLI.appendChild(document.createTextNode(data[i]));
        newItemUL.appendChild(newLI);
      }
    }
  }

  /*
   ************************
   * DOM HELPER FUNCTIONS *
   ************************
   */

  /**
   * Helper function to return a newly created DOM object given a tag.
   * @param {string} tag the name of the new tag to create
   * @returns {object} a new DOM tag
   */
  function gen(tag) {
    return document.createElement(tag);
  }

  /**
   * Helper function to return the element associated with an ID.
   * @param {string} name the name of the ID to return.
   * @returns {object} the element associated to the idName
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Helper function to return the first element associated with a selector.
   * @param {string} selector the selector to return.
   * @returns {object} the first element associated with a selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Helper function to return an array of DOM objects associated with a selector.
   * @param {string} selectorForAll the DOM objects to return.
   * @returns {array} an array of DOM objects associated with a selector.
   */
  function qsa(selectorForAll) {
    return document.querySelectorAll(selectorForAll);
  }
})();