const converter = new showdown.Converter();

// vanilla JS equivalent of jquery is(":visible")
const isVisible = (elem) => {
  return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
  //&& window.getComputedStyle(elem).visibility !== "hidden"
};

// vanilla JS equivalent of jquery empty()
const empty = (elem) => {
  while(elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
}

// vanilla JS equivalent of jquery index()
const getIndex = (elem) => {
  if (!elem) return -1;
  var i = 0;
  do {
    i++;
  } while (elem = elem.previousElementSibling);
  return i;
}

// vanilla JS equivalent of jquery nextUntil()
const nextUntil = (elem, selector, filter) => {
  const siblings = [];
  elem = elem.nextElementSibling;
  while (elem) {
    if (elem.matches(selector)) {
      break;
    } 
    if (filter && !elem.matches(filter)) {
      elem = elem.nextElementSibling;
      continue;
    }
    siblings.push(elem);
    elem = elem.nextElementSibling;
  }
  return siblings;
};

// vanilla JS equivalent of jquery toggle()
const toggle = (elem) => {
  if (window.getComputedStyle(elem).display === "block") {
    elem.style.display = "none";
  } else {
    elem.style.display = "block";
  }
};

// vanilla JS equivalent of jquery slideUp()
// see https://w3bits.com/javascript-slidetoggle/
const slideUp = (elem, duration=250) => {
  elem.style.transitionProperty = "height, margin, padding";
  elem.style.transitionDuration = duration + "ms";
  elem.style.boxSizing = "border-box";
  elem.style.height = elem.offsetHeight + "px";
  elem.offsetHeight;
  elem.style.overflow = "hidden";
  elem.style.height = 0;
  elem.style.paddingTop = 0;
  elem.style.paddingBottom = 0;
  elem.style.marginTop = 0;
  elem.style.marginBottom = 0;
  window.setTimeout(() => {
    elem.style.display = "none";
    elem.style.removeProperty("height");
    elem.style.removeProperty("padding-top");
    elem.style.removeProperty("padding-bottom");
    elem.style.removeProperty("margin-top");
    elem.style.removeProperty("margin-bottom");
    elem.style.removeProperty("overflow");
    elem.style.removeProperty("transition-duration");
    elem.style.removeProperty("transition-property");
  }, duration);
};

// vanilla JS equivalent of jquery slideDown()
// see https://w3bits.com/javascript-slidetoggle/
const slideDown = (elem, duration=250) => {
  elem.style.removeProperty("display");
  let display = window.getComputedStyle(elem).display;
  if (display === "none") {
    display = "block";
  }
  elem.style.display = display;
  const height = elem.offsetHeight;
  elem.style.overflow = "hidden";
  elem.style.height = 0;
  elem.style.paddingTop = 0;
  elem.style.paddingBottom = 0;
  elem.style.marginTop = 0;
  elem.style.marginBottom = 0;
  elem.offsetHeight;
  elem.style.boxSizing = "border-box";
  elem.style.transitionProperty = "height, margin, padding";
  elem.style.transitionDuration = duration + "ms";
  elem.style.height = height + "px";
  elem.style.removeProperty("padding-top");
  elem.style.removeProperty("padding-bottom");
  elem.style.removeProperty("margin-top");
  elem.style.removeProperty("margin-bottom");
  window.setTimeout(() => {
    elem.style.removeProperty("height");
    elem.style.removeProperty("overflow");
    elem.style.removeProperty("transition-duration");
    elem.style.removeProperty("transition-property");
  }, duration);
};

// vanilla JS equivalent of jquery slideToggle()
// see https://w3bits.com/javascript-slidetoggle/
const slideToggle = (elem, duration=250) => {
  if (window.getComputedStyle(elem).display === "block") {
    slideUp(elem, duration);
  } else {
    slideDown(elem, duration);
  }
};

const tablemongerReady = () => {
  // Hamburger Dance!
  const hamburger = document.querySelector(".hamburger-helper");
  hamburger.addEventListener("click", hamburgerClick);

  revealTables();

  document.querySelectorAll(".toc-category").forEach(elem => {
    elem.addEventListener("click", e => {
      // show-hide the category items
      elem.classList.toggle("open");
      nextUntil(elem, ".toc-category").forEach(elem => slideToggle(elem));
    });
  });

  let windowWidth = window.innerWidth;
  window.addEventListener("resize", function() {
    if (window.innerWidth != windowWidth) {
      windowWidth = window.innerWidth;
      revealTables();
    };
  });

  window.addEventListener("DOMContentLoaded", pointToChosen);
  window.addEventListener("load", pointToChosen);
  window.addEventListener("resize", pointToChosen);
  window.addEventListener("scroll", pointToChosen);

  // Table click handler
  document.querySelectorAll(".click-item").forEach(item => item.addEventListener("click", tableClick));

  // Randomizer click handler
  document.querySelector(".re-roll").addEventListener("click", clickRandomTable);

  document.querySelector("#tool-footer").addEventListener("click", rollTheDice);

  document.querySelectorAll(".title").forEach(title => title.addEventListener("click", loadLandingContent));

  // Get table from params!
  selectTable();
};

const hamburgerClick = (e) => {
  if (isVisible(document.querySelector("#toc"))) {
    // Hide TOC
    document.querySelector(".hamburger-helper").classList.remove("is-active");
    document.querySelector("#toc").style.display = "none";
    document.querySelector("#right-content").style.display = "block";
    document.querySelector("#tool-footer").style.display = "block";
    document.querySelector("#toc-show-icon").style.display = "inline-block";
    document.querySelector("#toc-hide-icon").style.display = "none";
  } else {
    // Show TOC
    document.querySelector(".hamburger-helper").classList.add("is-active");
    document.querySelector("#toc").style.display = "block";
    document.querySelector("#tool-footer").style.display = "none";
    document.querySelector("#right-content").style.display = "none";
    document.querySelector("#toc-show-icon").style.display = "none";
    document.querySelector("#toc-hide-icon").style.display = "inline-block";
  };
};

const revealTables = () => {
  if (window.matchMedia("(min-width: 900px)").matches) {
    document.querySelector("#toc").style.display = "block";
    document.querySelector("#table-content").style.display = "block";
  } else {
    document.querySelector("#toc").style.display = "none";
    document.querySelector("#table-content").style.display = "block";
  }
};

const tableClick = (e) => {
  document.querySelector("#table-content").style.display = "block";
  document.querySelector("#landing-copy").style.display = "none";
  document.querySelectorAll(".toc-item").forEach(item => item.classList.remove("current"));
  e.currentTarget.classList.add("current");
  document.querySelector("#tool-footer").style.display = "block";
  setUpForNewSingleTable(e);
  requestNewTableData(e);
};

const setUpForNewSingleTable = (e) => {
  // TODO: rip out jquery
  const tableName = e.currentTarget.dataset.tableName;
  setTableParam(tableName);
  const roll = e.currentTarget.dataset.roll;
  const subtitle = e.currentTarget.dataset.subtitle;
  const tableDiv = document.querySelector("#table-content");
  empty(tableDiv);
  const titleDiv = document.createElement("div");
  titleDiv.id = "table-title";
  titleDiv.textContent = tableName;
  tableDiv.appendChild(titleDiv);
  const descDiv = document.createElement("div");
  descDiv.id = "table-desc";
  descDiv.textContent = subtitle;
  tableDiv.appendChild(descDiv);
  tableDiv.appendChild(dummySingleTable());
  pointToChosen();
  if (isVisible(document.querySelector(".hamburger-helper")) &&
      document.querySelector(".hamburger-helper").classList.contains("is-active")) {
    hamburgerClick();
  };
};

const requestNewTableData = (e) => {
  const tableName = e.currentTarget.dataset.tableName;
  const url = tableItemsURL(e);
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonResponse) {
      // single table is first and only element in the response array
      showSingleTable(jsonResponse[0]);
    });
};

const tableItemsURL = (e) => {
  const tableName = e.currentTarget.dataset.tableName;
  const encodedTableName = encodeURIComponent(tableName);
  return `/api/tableitems?name=${encodedTableName}`;
};

const showSingleTable = (result) => {
  const tableBody = document.querySelector("#table-body");
  empty(tableBody);

  const table = document.createElement("div");
  table.classList.add("table");
  tableBody.appendChild(table);

  // add rows for every table item
  result.forEach((item, index) => {
    const rowDiv = document.createElement("div")
    rowDiv.classList.add("table-row");
    const numDiv = document.createElement("div")
    numDiv.classList.add("row-num");
    numDiv.textContent = item.rowNum;
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("row-item");
    // Our table/json text is coming with "\n" characters, and ShowdownJS / simpleLineBreaks doesn't seem to handle it
    itemDiv.innerHTML = converter.makeHtml(item.tableItem).replaceAll("\\n", "<br/>");

    table.appendChild(rowDiv);
    rowDiv.appendChild(numDiv);
    rowDiv.appendChild(itemDiv);
  });
};

const setTableParam = (tableName) => {
  document.title = "TABLEMÖNGER - " + tableName;
  tableParams = "?tableName=" + tableName
  window.history.pushState({}, "", tableParams)
};

const dummySingleTable = () => {
  const tableBody = document.createElement("div");
  tableBody.id = "table-body";
  tableBody.innerHTML = one_table_row.repeat(20);
  return tableBody
};

const one_table_row = `
  <div class='table-row'>
    <div class='row-num'>
      <img src="/images/spinner.gif" class="spinner"></img>
    </div>
    <div class='row-item'> </div>
  </div>
`;

const previousCategoryItem = (elem) => {
  while (elem = elem.previousElementSibling) {
    if (!elem) {
      return;
    }
    if (elem.classList.contains("toc-category")) {
      return elem;
    }
  }
};

const selectTable = () => {
  const selectedTableName = tableFromUrl();
  const clickItem = document.querySelector(`.click-item[data-table-name="${selectedTableName}"]`)
  if (clickItem) {
    // open the category
    const category = previousCategoryItem(clickItem);
    if (category) {
      category.classList.toggle("open");      
    }
    // click() on category does a slide toggle, so just do a no-animation version here
    nextUntil(category, ".toc-category").forEach(elem => toggle(elem));

    // click and load the table
    clickItem.click();
  };
};

const tableFromUrl = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get("tableName");
};

const rollTheDice = () => {
  shakeyShakey(document.querySelector("#tool-dice"));

  const fadeDelay = 50; // How long each row takes to fade from chosen state.
  const totalTime = 1000; // The time it takes to reach any row.

  document.querySelectorAll(".table").forEach((elem, index) => {
    let priorIndex = 0;
    if (elem.querySelectorAll(".chosen").length) {
      priorIndex = getIndex(elem.querySelector(".chosen"));
    }
    elem.querySelectorAll(".chosen").forEach(elem => elem.classList.remove("chosen"));

    const rowItems = Array.from(elem.querySelectorAll(".row-item"));
    rowItems.filter((item) => {
      !item.classList.contains("dummy");
    });
    const numRows = rowItems.length;
    const chosenRow = randomRowIndex(numRows, priorIndex);

    // use every() instead of forEach(), so we can terminate early
    const tableRows = Array.from(elem.querySelectorAll(".table-row"));
    tableRows.every((elem, index) => {
      const highlightDelay = highlightDelayPerItem({totalTime: totalTime, numRows: numRows, index: index});
      if (index == chosenRow) {
        setTimeout(function(that) {
          that.classList.add("chosen");
          pointToChosen();
        }, highlightDelay, elem);
        elem.scrollIntoView({ 
          behavior: "smooth",
          block: "center",
          inline: "center" 
        });
        return false;
      } else {
        setTimeout(function(that) {that.classList.add("chosen")}, highlightDelay, elem);
        setTimeout(function(that) {that.classList.remove("chosen")}, highlightDelay+fadeDelay, elem);
        return true;
      };
    });
  });
};

const randomRowIndex = (numRows, priorIndex) => {
  let newRandomIndex = Math.floor(Math.random() * numRows);
  while (newRandomIndex == priorIndex) {
    newRandomIndex = Math.floor(Math.random() * numRows);
  }
  return newRandomIndex;
}

const shakeyShakey = (el) => {
  el.classList.add("shaking")
  setTimeout(function(el) {
    el.classList.remove("shaking");
  }, 300, el);
};

const easeOut = (num) => {
  // Num is expected to be between 0 and 1
  // function then returns a float along a curve
  return 1 - Math.sqrt(1 - Math.pow(num, 2));
};

const highlightDelayPerItem = ({totalTime = 200, numRows, index}) => {
  return easeOut(index / numRows) * totalTime;
};

const pointToChosen = () => {
  document.querySelectorAll(".tool-pointer").forEach(elem => elem.style.display = "none");
  const chosen = document.querySelectorAll(".chosen");
  if (chosen.length) {
    const location = elementRelativeToViewport(chosen[0]);
    if (location == "below") {
      document.querySelector("#arrow-down").style.display = "inline-block";
    } else if (location == "above") {
      document.querySelector("#arrow-up").style.display = "inline-block";
    }
  }
};

const elementRelativeToViewport = (elem) => {
  const rect = elem.getBoundingClientRect();
  if (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight)) {
    return "below"
  } else if (rect.top <= (window.innerHeight || document.documentElement.clientHeight)) {
    return "above"
  }
};

const clickRandomTable = () => {
  const items = document.querySelectorAll(".click-item");
  const randIndex = Math.floor(Math.random() * items.length);
  items[randIndex].click()
};

const loadLandingContent = () => {
  if (isVisible(document.querySelector("#landing-copy"))) {
    return false;
  };

  document.title = "TABLEMÖNGER"
  document.querySelector(".hamburger-helper").classList.remove("is-active");
  document.querySelector("#table-content").style.display = "none";
  document.querySelector("#tool-footer").style.display = "none";
  document.querySelector("#right-content").style.display = "block";
  document.querySelector("#landing-copy").style.display = "block";
  if (isVisible(document.querySelector(".hamburger-helper"))) {
    document.querySelector("#toc").style.display = "none";
    document.querySelector("#toc-show-icon").style.display = "inline-block";
    document.querySelector("#toc-hide-icon").style.display = "none";
  };
};
