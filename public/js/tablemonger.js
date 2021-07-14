const tablemongerReady = () => {
  // Hamburger Dance!
  var $hamburger = $(".hamburger-helper");
  $hamburger.on("click", hamburgerClick);

  revealTables();

  var windowWidth = $(window).width();
  $(window).resize(function() {
    if ($(window).width() != windowWidth) {
      windowWidth = $(window).width();
      revealTables();
     };
   });

  $(window).on('DOMContentLoaded load resize scroll', pointToChosen);

  // Table click handler
  $(".click-item").on("click", tableClick);

  // Randomizer click handler
  $('.re-roll').on("click", clickRandomTable);

  $('#tool-footer').on("click", rollTheDice);

  $('.title').on('click', loadLandingContent);

  // Waiting for full dice icons!
  // generateDice();

  // Get table from params!
  selectTable();
};

const generateDice = () => {
  $('.click-item').each(function(index) {
    tableCount = $(this).data('roll');
    var diceIcon;
    if (tableCount == "d20") {
      diceIcon = '<i class="fas fa-dice-d20 dice-icon"></i>'
    } else if (tableCount == "2d6") {
      diceIcon = `
        <i class="fas fa-dice-d6 dice-icon"></i>
        <i class="fas fa-dice-d6 dice-icon"></i>
      `
    };
    $(this).prepend(diceIcon);
  });
};

const hamburgerClick = (e) => {
  if ($("#toc").is(":visible")) {
    // Hide TOC
    $('.hamburger-helper').removeClass('is-active')
    $('#toc').hide();
    $('#right-content').show();
    $('#tool-footer').show();
    $('#toc-show-icon').css("display","inline-block");
    $('#toc-hide-icon').hide();
  } else {
    // Show TOC
    $('.hamburger-helper').addClass('is-active')
    $('#toc').show();
    $('#tool-footer').hide();
    $('#right-content').hide();
    $('#toc-show-icon').hide();
    $('#toc-hide-icon').css("display","inline-block");
  };
};

const revealTables = () => {
  if (window.matchMedia('(min-width: 900px)').matches) {
    $('#toc').show();
    $('#table-content').show();
  } else {
    $('#toc').hide();
    $('#table-content').show();
  }
};

const tableClick = (e) => {
  $('#table-content').show();
  $('#landing-copy').hide();
  $('.toc-item').removeClass('current');
  $(e.currentTarget).addClass('current');
  $('#tool-footer').show();
  setUpForNewSingleTable(e);
  requestNewTableData(e);
};

const setUpForNewSingleTable = (e) => {
  const tableName = e.currentTarget.dataset.tableName;
  setTableParam(tableName);
  const roll = e.currentTarget.dataset.roll;
  const desc = $(e.currentTarget).attr('title');
  const tableDiv = $("#table-content");
  tableDiv.empty();
  // currently the roll is in the table name
  // const titleDiv = $(`<div id='table-title'>${tableName} <span class='title-roll'>(${roll})</span></div>`);
  const titleDiv = $(`<div id='table-title'>${tableName}</div>`);
  tableDiv.append(titleDiv);
  const descDiv = $(`<div id='table-desc'>${desc}</div>`);
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
  const $tableBody = $('#table-body');
  $tableBody.html('<div class=table></div>');
  $table = $('.table');
  // add rows for every table item
  $.each(result, (index, item) => {
    const rowDiv = $(`<div class='table-row'></div>`);
    const numDiv = $("<div class='row-num'></div>");
    numDiv.text(item.rowNum);
    const itemDiv = $("<div class='row-item'></div>");
    itemDiv.text(item.tableItem);
    $table.append(rowDiv);
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
  const $tableBody = $("<div id='table-body'></div>")
  $tableBody.html(one_table_row.repeat(20))
  return $tableBody
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
  var clickItem = $('.click-item').find('*').filter(function() {
    return $(this).text() === selectedTable;
  });
  if (clickItem.length) {
    clickItem.click();
  };
};

const tableFromUrl = () => {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
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
      var highlightDelay = highlightDelayPerItem({totalTime: totalTime, numRows: numRows, index: index});
      if (index == chosenRow) {
        setTimeout(function(that) {
          $(that).addClass('chosen');
          pointToChosen();
          const chosenText = $(that).find(".row-item").text();
          const madlibId = $(that).parent()[0].dataset.madlibid;
          const madlib = $(`#${madlibId}`);
          madlib.text(chosenText);
          shakeyShakey(madlib);
          // handle "A" vs. "An" for articles
          const articleId = madlibId.replace("mad", "article");
          const article = $(`#${articleId}`);
          if (article) {
            const articleText = article.text();
            if (articleText === "A" || articleText === "An" || articleText === "A(n)") {
              const firstLetter = chosenText.substring(0, 1).toLowerCase();
              if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
                article.text("An");
              } else {
                article.text("A");
              }
            }
          }
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
  var newRandomIndex = Math.floor(Math.random() * numRows);
  while (newRandomIndex == priorIndex) {
    newRandomIndex = Math.floor(Math.random() * numRows);
  }
  return newRandomIndex;
}

const shakeyShakey = ($el) => {
  $el.addClass('shaking')
  setTimeout(function($el) {
    $($el).removeClass('shaking')
  }, 300, $el);
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
  $('.tool-pointer').hide();
  var $chosen = $('.chosen');

  if ($chosen.length) {
    var location = elementRelativeToViewport($chosen);

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

  var rect = el.getBoundingClientRect();

  if (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight)) {
    return "below"
  } else if (rect.top <= (window.innerHeight || document.documentElement.clientHeight)) {
    return "above"
  }
};

const clickRandomTable = () => {
  const items = $('.click-item');
  $(items[Math.floor(Math.random() * items.length)]).click()
};

const loadLandingContent = () => {
  if ($('#landing-copy').is(':visible')) {
    return false;
  };

  document.title = "TABLEMÖNGER"
  $('.hamburger-helper').removeClass('is-active');
  $('#table-content').hide();
  $("#tool-footer").hide();
  $('#right-content').show();
  $('#landing-copy').show();
  if ($('.hamburger-helper').is(':visible')) {
    $('#toc').hide();
    $('#toc-show-icon').css("display","inline-block");
    $('#toc-hide-icon').hide();
  };
};
