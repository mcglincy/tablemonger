const converter = new showdown.Converter();


const tablemongerReady = () => {
  // Hamburger Dance!
  const hamburger = document.querySelector(".hamburger-helper");
  hamburger.addEventListener("click", hamburgerClick);

  revealTables();

  $(".toc-category").click(function () {
    // show-hide the category items
    $(this).toggleClass("open");
    $(this).nextUntil(".toc-category").slideToggle();
  });
  /*  
  document.querySelector(".toc-category").addEventListener("click", (e) => {
    // show-hide the category items
    e.target.classList.toggle("open");
    const catElems = nextUntil(e.target, ".toc-category");
    catElems.forEach(elem => $(elem).slideToggle());
  });
  */

  let windowWidth = window.innerWidth;
  window.addEventListener("resize", function() {
    if (window.innerWidth != windowWidth) {
      windowWidth = window.innerWidth;
      revealTables();
     };
   });

  window.addEventListener('DOMContentLoaded load resize scroll', pointToChosen);

  // Table click handler
  document.querySelectorAll(".click-item").forEach(item => item.addEventListener("click", tableClick));

  // Randomizer click handler
  document.querySelector(".re-roll").addEventListener("click", clickRandomTable);

  document.querySelector('#tool-footer').addEventListener("click", rollTheDice);

  document.querySelectorAll(".title").forEach(title => title.addEventListener("click", loadLandingContent));

  // Get table from params!
  selectTable();
};

const hamburgerClick = (e) => {
  if ($("#toc").is(":visible")) {
    // Hide TOC
    document.querySelector(".hamburger-helper").classList.remove("is-active");
    document.querySelector("#toc").style.display = "none";
    document.querySelector("#right-content").style.display = "";
    document.querySelector("#tool-footer").style.display = "";
    $("#toc-show-icon").css("display","inline-block");
    document.querySelector("#toc-hide-icon").style.display = "none";
  } else {
    // Show TOC
    document.querySelector(".hamburger-helper").classList.add("is-active");
    document.querySelector("#toc").style.display = "";
    document.querySelector("#tool-footer").style.display = "none";
    document.querySelector("#right-content").style.display = "none";
    document.querySelector("#toc-show-icon").style.display = "none";
    $('#toc-hide-icon').css("display","inline-block");
  };
};

const revealTables = () => {
  if (window.matchMedia('(min-width: 900px)').matches) {
    document.querySelector("#toc").style.display = "";
    document.querySelector("#table-content").style.display = "";
  } else {
    document.querySelector("#toc").style.display = "none";
    document.querySelector("#table-content").style.display = "";
  }
};

const tableClick = (e) => {
  document.querySelector("#table-content").style.display = "";
  document.querySelector("#landing-copy").style.display = "none";
  document.querySelectorAll(".toc-item").forEach(item => item.classList.remove("current"));
  e.currentTarget.classList.add("current");
  document.querySelector("#tool-footer").style.display = "";
  setUpForNewSingleTable(e);
  requestNewTableData(e);
};

const setUpForNewSingleTable = (e) => {
  const tableName = e.currentTarget.dataset.tableName;
  setTableParam(tableName);
  const roll = e.currentTarget.dataset.roll;
  const subtitle = e.currentTarget.dataset.subtitle;
  const tableDiv = $("#table-content");
  tableDiv.empty();
  // currently the roll is in the table name
  // const titleDiv = $(`<div id='table-title'>${tableName} <span class='title-roll'>(${roll})</span></div>`);
  const titleDiv = $(`<div id='table-title'>${tableName}</div>`);
  tableDiv.append(titleDiv);
  const descDiv = $(`<div id='table-desc'>${subtitle}</div>`);
  tableDiv.append(descDiv);
  tableDiv.append(dummySingleTable);
  pointToChosen();
  if ($('.hamburger-helper').is(':visible') && $('.hamburger-helper').hasClass('is-active')) {
    hamburgerClick();
  };
};

const requestNewTableData = (e) => {
  const tableName = e.currentTarget.dataset.tableName;
  const url = tableItemsURL(e);
  $.ajax({url: url, success: (result) => {
    showSingleTable(result[0]);
  }});
};

const tableItemsURL = (e) => {
  const tableName = e.currentTarget.dataset.tableName;
  const encodedTableName = encodeURIComponent(tableName);
  return `/api/tableitems?name=${encodedTableName}`;
};

const showSingleTable = (result) => {
  const tableBody = $('#table-body');
  tableBody.html('<div class=table></div>');
  table = $('.table');
  // add rows for every table item
  $.each(result, (index, item) => {
    const rowDiv = $(`<div class='table-row'></div>`);
    const numDiv = $("<div class='row-num'></div>");
    numDiv.text(item.rowNum);
    const itemDiv = $("<div class='row-item'></div>");
    // Our table/json text is coming with "\n" characters, and ShowdownJS / simpleLineBreaks doesn't seem to handle it
    itemDiv.html(converter.makeHtml(item.tableItem).replaceAll("\\n", "<br/>"));
    table.append(rowDiv);
    rowDiv.append(numDiv);
    rowDiv.append(itemDiv);
  });
};

const setTableParam = (tableName) => {
  document.title = "TABLEMÖNGER - " + tableName;
  tableParams = "?tableName=" + tableName
  window.history.pushState({}, "", tableParams)
};

const dummySingleTable = () => {
  const tableBody = $("<div id='table-body'></div>")
  tableBody.html(one_table_row.repeat(20))
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

const selectTable = () => {
  selectedTable = tableFromUrl();
  const clickItem = $('.click-item').find('*').filter(function() {
    return $(this).text() === selectedTable;
  });
  if (clickItem.length) {
    // clickItem is the span (?), so we need to get a previous sibling of its parent div
    const category = clickItem.parent().prevAll(".toc-category").first();
    // click() on category does a slide toggle, so just do a no-animation version here
    category.toggleClass("open");
    category.nextUntil(".toc-category").toggle();

    // click and load the table
    clickItem.click();
  };
};

const tableFromUrl = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('tableName');
};

const rollTheDice = () => {
  shakeyShakey($("#tool-dice"));

  const fadeDelay = 50; // How long each row takes to fade from chosen state.
  const totalTime = 1000; // The time it takes to reach any row.

  $(".table").each(function(index){
    let priorIndex = 0;
    if ($(this).find(".chosen").length) {
      priorIndex = $(this).find(".chosen").index();
    }
    $(this).find('.chosen').removeClass('chosen');

    const numRows = $(this).find(".row-item").not(".dummy").length;
    const chosenRow = randomRowIndex(numRows, priorIndex);

    $(this).find(".table-row").each(function(index){
      const highlightDelay = highlightDelayPerItem({totalTime: totalTime, numRows: numRows, index: index});
      if (index == chosenRow) {
        setTimeout(function(that) {
          $(that).addClass('chosen');
          pointToChosen();
        }, highlightDelay, this);
        if (!$('.subtable-wrapper').length) {
          $('body').scrollTo($(this).position()['top'] - 100, 200, 'swing');
        };
        return false;
      } else {
        setTimeout(function(that) {$(that).addClass('chosen')}, highlightDelay, this)
        setTimeout(function(that) {$(that).removeClass('chosen')}, highlightDelay+fadeDelay, this)
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
  el.addClass('shaking')
  setTimeout(function(el) {
    $(el).removeClass('shaking')
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
  // TODO: querySelector or querySelectorAll?
  document.querySelector(".tool-pointer").style.display = "none";
  const chosen = $('.chosen');

  if (chosen.length) {
    const location = elementRelativeToViewport(chosen);

    if (location == "below") {
      $("#arrow-down").css("display","inline-block");
    } else if (location == "above") {
      $("#arrow-up").css("display","inline-block");
    }
  }
};

const elementRelativeToViewport = (el) => {
  if (typeof jQuery === "function" && el instanceof jQuery) {
    el = el[0];
  }

  const rect = el.getBoundingClientRect();

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
  if ($('#landing-copy').is(':visible')) {
    return false;
  };

  document.title = "TABLEMÖNGER"
  document.querySelector(".hamburger-helper").classList.remove("is-active");
  document.querySelector("#table-content").style.display = "none";
  document.querySelector("#tool-footer").style.display = "none";
  document.querySelector("#right-content").style.display = "";
  document.querySelector("#landing-copy").style.display = "";
  if ($('.hamburger-helper').is(':visible')) {
    document.querySelector("#toc").style.display = "none";
    $('#toc-show-icon').css("display","inline-block");
    document.querySelector("#toc-hide-icon").style.display = "none";
  };
};
